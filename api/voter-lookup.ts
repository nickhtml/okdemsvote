import { VercelRequest, VercelResponse } from "@vercel/node";
import { getPollingPlaceForPrecinct } from "../src/data/polling_places";
import { earlyVotingData } from "../src/data/early_voting";

async function queryArcGISPrecinct(precinctQuery: string) {
  try {
    const cleanNum = precinctQuery.trim().replace(/^precinct\s*/i, '').replace(/^pct\s*#?\s*/i, '').replace(/[^0-9]/g, '');
    if (!cleanNum) return null;
    const padded = cleanNum.padStart(6, '0');
    const where = encodeURIComponent(`PCT_CEB = '${padded}' OR PCT_CEB = '${cleanNum}' OR Precinct = '${cleanNum}'`);
    const arcUrl = `https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/State_Wide_2020_Precincts/FeatureServer/0/query?where=${where}&outFields=*&returnGeometry=false&f=json`;
    const arcRes = await fetch(arcUrl, { signal: AbortSignal.timeout(4000) });
    if (arcRes.ok) {
      const arcData = await arcRes.json();
      return arcData.features?.[0]?.attributes;
    }
  } catch (e) {
    console.error("Direct Oklahoma GIS precinct lookup failed:", e);
  }
  return null;
}

async function resolveOklahomaPrecinct(address: string, mapsKey?: string) {
  try {
    let lat: number | undefined;
    let lng: number | undefined;

    // 1. Try free US Census Geocoder first
    try {
      const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`;
      const geoRes = await fetch(censusUrl, { signal: AbortSignal.timeout(3000) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const match = geoData.result?.addressMatches?.[0];
        if (match?.coordinates) {
          lng = match.coordinates.x;
          lat = match.coordinates.y;
        }
      }
    } catch (err) {
      // Census fallback
    }

    // 2. Try ArcGIS World Geocoding Service (handles Oklahoma rural roads & routes)
    if (!lat || !lng) {
      try {
        const arcGeoUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(address)}&f=json&maxLocations=1`;
        const arcGeoRes = await fetch(arcGeoUrl, { signal: AbortSignal.timeout(3500) });
        if (arcGeoRes.ok) {
          const arcGeoData = await arcGeoRes.json();
          const cand = arcGeoData.candidates?.[0];
          if (cand?.location) {
            lng = cand.location.x;
            lat = cand.location.y;
          }
        }
      } catch (err) {
        // ArcGIS fallback
      }
    }

    // 3. Fallback to Google Maps Geocoding if key available
    if ((!lat || !lng) && mapsKey) {
      try {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsKey}`;
        const gRes = await fetch(gUrl, { signal: AbortSignal.timeout(3000) });
        if (gRes.ok) {
          const gData = await gRes.json();
          const loc = gData.results?.[0]?.geometry?.location;
          if (loc) {
            lat = loc.lat;
            lng = loc.lng;
          }
        }
      } catch (err) {
        // ignore
      }
    }

    if (lat && lng) {
      // 4. Query Oklahoma Statewide Voting Precincts FeatureServer
      const arcgisUrl = `https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/State_Wide_2020_Precincts/FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`;
      const arcRes = await fetch(arcgisUrl, { signal: AbortSignal.timeout(4000) });
      if (arcRes.ok) {
        const arcData = await arcRes.json();
        return {
          attributes: arcData.features?.[0]?.attributes,
          coordinates: { lat, lng }
        };
      }
    }
  } catch (e) {
    console.error("Oklahoma GIS precinct lookup failed:", e);
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { address } = req.body;
    const apiKey = process.env.GOOGLE_CIVICS_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY || apiKey;

    if (!address || typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ error: "Please enter a valid address or precinct number" });
    }

    const trimmedInput = address.trim();
    const isDirectPrecinct = /^(?:precinct\s*|pct\s*#?\s*)?(\d{2,6})$/i.test(trimmedInput);

    let repData: any = {
      normalizedInput: {
        line1: trimmedInput,
        city: "Oklahoma",
        state: "OK",
        zip: ""
      },
      divisions: {
        "ocd-division/country:us": { name: "United States" },
        "ocd-division/country:us/state:ok": { name: "Oklahoma" }
      }
    };
    let pollingLocations: any[] = [];
    let earlyVoteSites: any[] = [];
    let okPrecinct: any = null;

    if (isDirectPrecinct) {
      okPrecinct = await queryArcGISPrecinct(trimmedInput);
      const cleanDigits = trimmedInput.replace(/[^0-9]/g, '');
      const pctCode = okPrecinct?.PCT_CEB || cleanDigits.padStart(6, '0');
      const countyName = okPrecinct?.COUNTY_NAM || 'Oklahoma';
      const countySlug = countyName.toLowerCase().replace(/[^a-z0-9]/g, '');

      repData.normalizedInput = {
        line1: `Precinct ${pctCode}`,
        city: `${countyName.charAt(0).toUpperCase() + countyName.slice(1).toLowerCase()} County`,
        state: "OK",
        zip: ""
      };

      if (okPrecinct?.Uscong) {
        const congDist = parseInt(okPrecinct.Uscong, 10);
        repData.divisions[`ocd-division/country:us/state:ok/cd:${congDist}`] = {
          name: `Oklahoma's ${congDist}th congressional district`
        };
      }
      if (okPrecinct?.St_senate) {
        const senDist = parseInt(okPrecinct.St_senate, 10);
        repData.divisions[`ocd-division/country:us/state:ok/sldu:${senDist}`] = {
          name: `Oklahoma State Senate district ${senDist}`
        };
      }
      if (okPrecinct?.St_house) {
        const houseDist = parseInt(okPrecinct.St_house, 10);
        repData.divisions[`ocd-division/country:us/state:ok/sldl:${houseDist}`] = {
          name: `Oklahoma State House district ${houseDist}`
        };
      }
      repData.divisions[`ocd-division/country:us/state:ok/county:${countySlug}`] = {
        name: `${countyName.charAt(0).toUpperCase() + countyName.slice(1).toLowerCase()} County`
      };
      repData.divisions[`ocd-division/country:us/state:ok/county:${countySlug}/precinct:${pctCode}`] = {
        name: `Precinct ${pctCode} (${countyName} County)`
      };
    }

    if (!isDirectPrecinct && apiKey) {
      try {
        const repUrl = `https://www.googleapis.com/civicinfo/v2/divisionsByAddress?key=${apiKey}&address=${encodeURIComponent(trimmedInput)}`;
        const repResponse = await fetch(repUrl);
        
        if (repResponse.ok) {
          repData = await repResponse.json();
        } else {
          const maybePrecinct = await queryArcGISPrecinct(trimmedInput);
          if (maybePrecinct) {
            okPrecinct = maybePrecinct;
          }
        }
      } catch (civicsErr: any) {
        const maybePrecinct = await queryArcGISPrecinct(trimmedInput);
        if (maybePrecinct) {
          okPrecinct = maybePrecinct;
        }
      }

      if (!okPrecinct) {
        try {
          const voterUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${apiKey}&address=${encodeURIComponent(trimmedInput)}`;
          const voterResponse = await fetch(voterUrl);
          if (voterResponse.ok) {
            const voterData = await voterResponse.json();
            if (voterData.earlyVoteSites) earlyVoteSites = voterData.earlyVoteSites;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    let voterCoords: { lat: number; lng: number } | undefined;
    if (!okPrecinct) {
      const resolvedGis = await resolveOklahomaPrecinct(trimmedInput, mapsKey);
      okPrecinct = resolvedGis?.attributes || null;
      voterCoords = resolvedGis?.coordinates;
    }

    let isSpreadsheetMatch = false;
    let matchedPrecinctCode = okPrecinct?.PCT_CEB || (isDirectPrecinct ? trimmedInput.replace(/[^0-9]/g, '').padStart(6, '0') : '');
    let matchedCountyName = okPrecinct?.COUNTY_NAM || '';

    if (matchedPrecinctCode) {
      const countySlug = (matchedCountyName || 'oklahoma').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      repData.divisions[`ocd-division/country:us/state:ok/county:${countySlug}/precinct:${matchedPrecinctCode}`] = {
        name: `Precinct ${matchedPrecinctCode}${matchedCountyName ? ` (${matchedCountyName} County)` : ''}`
      };

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
          county: matchedCountyName
        }];
      } else {
        isSpreadsheetMatch = false;
        if ((earlyVotingData as any)[countySlug]?.[0]) {
          const countySite = (earlyVotingData as any)[countySlug][0];
          const parts = countySite.addressLines || [];
          const line1 = parts[0] || '';
          const cityZip = parts[parts.length - 1] || 'OK';
          const match = cityZip.match(/(.*),\s*OK\s*(\d{5})?/i);
          pollingLocations = [{
            address: {
              locationName: countySite.locationName || `${matchedCountyName.toUpperCase()} COUNTY ELECTION BOARD`,
              line1: line1,
              city: match ? match[1].trim() : (repData.normalizedInput?.city || 'Oklahoma'),
              state: "OK",
              zip: match && match[2] ? match[2] : (repData.normalizedInput?.zip || '')
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
      }
    }

    res.status(200).json({
      normalizedInput: repData.normalizedInput,
      divisions: repData.divisions,
      pollingLocations,
      earlyVoteSites,
      matchedPrecinct: matchedPrecinctCode,
      matchedCounty: matchedCountyName,
      isSpreadsheetMatch,
      voterCoordinates: voterCoords
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to resolve address or precinct" });
  }
}
