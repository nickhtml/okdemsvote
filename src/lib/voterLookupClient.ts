import { VoterInfo, PollingLocation } from '../types';
import { getPollingPlaceForPrecinct } from '../data/polling_places';
import { earlyVotingData } from '../data/early_voting';

async function queryArcGISPrecinctDirect(precinctQuery: string) {
  try {
    const cleanNum = precinctQuery.trim().replace(/^precinct\s*/i, '').replace(/^pct\s*#?\s*/i, '').replace(/[^0-9]/g, '');
    if (!cleanNum) return null;
    const padded = cleanNum.padStart(6, '0');
    const where = encodeURIComponent(`PCT_CEB = '${padded}' OR PCT_CEB = '${cleanNum}' OR Precinct = '${cleanNum}'`);
    const arcUrl = `https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/State_Wide_2020_Precincts/FeatureServer/0/query?where=${where}&outFields=*&returnGeometry=false&f=json`;
    const arcRes = await fetch(arcUrl, { signal: AbortSignal.timeout(4500) });
    if (arcRes.ok) {
      const arcData = await arcRes.json();
      return arcData.features?.[0]?.attributes;
    }
  } catch (e) {
    console.warn("Direct Oklahoma GIS precinct lookup failed:", e);
  }
  return null;
}

async function resolveOklahomaCoordinates(address: string): Promise<{ lat: number; lng: number; city?: string; zip?: string; formatted?: string } | null> {
  // 1. Try ArcGIS World Geocoding Service (public CORS enabled, handles OK rural routes and city streets)
  try {
    const arcGeoUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(address)}&f=json&maxLocations=1`;
    const arcGeoRes = await fetch(arcGeoUrl, { signal: AbortSignal.timeout(4000) });
    if (arcGeoRes.ok) {
      const arcGeoData = await arcGeoRes.json();
      const cand = arcGeoData.candidates?.[0];
      if (cand?.location) {
        return {
          lat: cand.location.y,
          lng: cand.location.x,
          formatted: cand.address
        };
      }
    }
  } catch (err) {
    // Continue to census fallback
  }

  // 2. Try US Census Geocoder fallback
  try {
    const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`;
    const geoRes = await fetch(censusUrl, { signal: AbortSignal.timeout(3500) });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const match = geoData.result?.addressMatches?.[0];
      if (match?.coordinates) {
        return {
          lat: match.coordinates.y,
          lng: match.coordinates.x,
          formatted: match.matchedAddress
        };
      }
    }
  } catch (err) {
    // ignore
  }

  return null;
}

async function resolveVoterClientSide(rawAddress: string): Promise<VoterInfo> {
  const trimmedInput = rawAddress.trim();
  const isDirectPrecinct = /^(?:precinct\s*|pct\s*#?\s*)?(\d{2,6})$/i.test(trimmedInput);

  let okPrecinct: any = null;
  let normalizedCity = "Oklahoma";
  let normalizedZip = "";
  let normalizedLine = trimmedInput;
  let coords: { lat: number; lng: number; formatted?: string } | null = null;

  if (isDirectPrecinct) {
    okPrecinct = await queryArcGISPrecinctDirect(trimmedInput);
  } else {
    // Resolve lat/lng coordinates
    coords = await resolveOklahomaCoordinates(trimmedInput);
    if (coords) {
      if (coords.formatted) {
        normalizedLine = coords.formatted;
        const parts = coords.formatted.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          normalizedCity = parts[1] || 'Oklahoma City';
        }
      }

      // Intersect with Oklahoma Statewide Voting Precincts Layer
      const arcgisUrl = `https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/State_Wide_2020_Precincts/FeatureServer/0/query?geometry=${coords.lng},${coords.lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`;
      const arcRes = await fetch(arcgisUrl, { signal: AbortSignal.timeout(4500) });
      if (arcRes.ok) {
        const arcData = await arcRes.json();
        okPrecinct = arcData.features?.[0]?.attributes;
      }
    }
  }

  const cleanDigits = trimmedInput.replace(/[^0-9]/g, '');
  let matchedPrecinctCode = okPrecinct?.PCT_CEB || (isDirectPrecinct && cleanDigits ? cleanDigits.padStart(6, '0') : '');
  let matchedCountyName = okPrecinct?.COUNTY_NAM || '';

  // If precinct is still not resolved and direct precinct was entered, check spreadsheet directly
  if (!matchedPrecinctCode && isDirectPrecinct) {
    const directMatch = getPollingPlaceForPrecinct(cleanDigits);
    if (directMatch) {
      matchedPrecinctCode = directMatch.precinctCode;
      matchedCountyName = directMatch.county;
    }
  }

  if (!matchedPrecinctCode) {
    throw new Error('Unable to resolve your Oklahoma precinct. Please ensure your street address and Oklahoma city are entered correctly.');
  }

  const countySlug = (matchedCountyName || 'oklahoma').toLowerCase().replace(/[^a-z0-9]/g, '');
  const countyDisplayName = matchedCountyName ? `${matchedCountyName.charAt(0).toUpperCase() + matchedCountyName.slice(1).toLowerCase()} County` : 'Oklahoma County';

  // Build Civic divisions
  const divisions: Record<string, { name: string }> = {
    "ocd-division/country:us": { name: "United States" },
    "ocd-division/country:us/state:ok": { name: "Oklahoma" },
    [`ocd-division/country:us/state:ok/county:${countySlug}`]: { name: countyDisplayName },
    [`ocd-division/country:us/state:ok/county:${countySlug}/precinct:${matchedPrecinctCode}`]: {
      name: `Precinct ${matchedPrecinctCode}${matchedCountyName ? ` (${matchedCountyName} County)` : ''}`
    }
  };

  if (okPrecinct?.Uscong) {
    const congDist = parseInt(okPrecinct.Uscong, 10);
    divisions[`ocd-division/country:us/state:ok/cd:${congDist}`] = {
      name: `Oklahoma's ${congDist}th congressional district`
    };
  }
  if (okPrecinct?.St_senate) {
    const senDist = parseInt(okPrecinct.St_senate, 10);
    divisions[`ocd-division/country:us/state:ok/sldu:${senDist}`] = {
      name: `Oklahoma State Senate district ${senDist}`
    };
  }
  if (okPrecinct?.St_house) {
    const houseDist = parseInt(okPrecinct.St_house, 10);
    divisions[`ocd-division/country:us/state:ok/sldl:${houseDist}`] = {
      name: `Oklahoma State House district ${houseDist}`
    };
  }

  // Polling place matching
  let isSpreadsheetMatch = false;
  let pollingLocations: PollingLocation[] = [];

  const matchedPlace = getPollingPlaceForPrecinct(matchedPrecinctCode, matchedCountyName);
  if (matchedPlace) {
    isSpreadsheetMatch = true;
    pollingLocations = [{
      address: {
        locationName: matchedPlace.pollingLocation,
        line1: matchedPlace.address,
        city: matchedPlace.city,
        state: "OK",
        zip: matchedPlace.zip
      },
      pollingHours: "7:00 AM - 7:00 PM",
      isFromSpreadsheet: true,
      precinctCode: matchedPrecinctCode,
      county: matchedCountyName || matchedPlace.county
    }];
  } else if ((earlyVotingData as any)[countySlug]?.[0]) {
    const countySite = (earlyVotingData as any)[countySlug][0];
    const parts = countySite.addressLines || [];
    const line1 = parts[0] || '';
    const cityZip = parts[parts.length - 1] || 'OK';
    const match = cityZip.match(/(.*),\s*OK\s*(\d{5})?/i);
    pollingLocations = [{
      address: {
        locationName: countySite.locationName || `${countyDisplayName.toUpperCase()} ELECTION BOARD`,
        line1: line1,
        city: match ? match[1].trim() : normalizedCity,
        state: "OK",
        zip: match && match[2] ? match[2] : normalizedZip
      },
      pollingHours: "7:00 AM - 7:00 PM",
      isFromSpreadsheet: false,
      precinctCode: matchedPrecinctCode,
      county: matchedCountyName
    }];
  } else {
    pollingLocations = [{
      address: {
        locationName: "OKLAHOMA STATE ELECTION BOARD HEADQUARTERS",
        line1: "2300 N LINCOLN BLVD, STE B-6",
        city: "OKLAHOMA CITY",
        state: "OK",
        zip: "73105"
      },
      pollingHours: "7:00 AM - 7:00 PM",
      isFromSpreadsheet: false,
      precinctCode: matchedPrecinctCode,
      county: matchedCountyName
    }];
  }

  return {
    normalizedInput: {
      line1: isDirectPrecinct ? `Precinct ${matchedPrecinctCode}` : normalizedLine,
      city: normalizedCity,
      state: "OK",
      zip: normalizedZip
    },
    divisions,
    pollingLocations,
    matchedPrecinct: matchedPrecinctCode,
    matchedCounty: matchedCountyName,
    isSpreadsheetMatch,
    voterCoordinates: coords ? { lat: coords.lat, lng: coords.lng } : undefined
  };
}

export async function lookupVoter(address: string): Promise<VoterInfo> {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error('Please enter a valid Oklahoma address');
  }

  // 1. First attempt server route (if running in full-stack dev/prod mode)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch('/api/voter-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: trimmed }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && data.divisions && (data.pollingLocations?.length > 0 || data.matchedPrecinct)) {
        return data as VoterInfo;
      }
    }
  } catch (err) {
    console.warn("Backend /api/voter-lookup fetch encountered an error or timed out, executing direct Oklahoma GIS resolver:", err);
  }

  // 2. Direct client-side GIS fallback: works on okdems.vote, static hosts, serverless, or offline
  return await resolveVoterClientSide(trimmed);
}
