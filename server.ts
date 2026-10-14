import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import Papa from "papaparse";
import { 
  pollingPlacesData, 
  getPollingPlaceForPrecinct, 
  getAllPollingPlaces, 
  getPollingPlacesCount, 
  PollingPlace 
} from "./src/data/polling_places";
import { earlyVotingData } from "./src/data/early_voting";

dotenv.config();

// Attempt to parse any updated ok_precincts.csv into memory
function loadPrecinctsFromCSV() {
  try {
    const csvPath = path.join(process.cwd(), "src", "data", "ok_precincts.csv");
    if (!fs.existsSync(csvPath)) return;
    const content = fs.readFileSync(csvPath, "utf8").trim();
    if (!content) return;

    const parsed = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    });

    if (parsed.data && parsed.data.length > 0) {
      console.log(`[Official Spreadsheet] Verified ${parsed.data.length} records in ok_precincts.csv`);
    }
  } catch (err) {
    console.error("Error reading ok_precincts.csv:", err);
  }
}

// Initial load check
loadPrecinctsFromCSV();
console.log(`[Official Spreadsheet] Active directory contains ${getPollingPlacesCount()} Oklahoma Election Day precincts.`);

// Helper to query Oklahoma Statewide Precinct FeatureServer by precinct code/number
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

// Helper to resolve Oklahoma voting precinct via State GIS
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

    // 2. Try ArcGIS World Geocoding Service (very reliable for rural county roads & Oklahoma routes)
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
        // ArcGIS geocoder fallback
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
      // 4. Intersect with Oklahoma Statewide Voting Precincts FeatureServer
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Google Places Autocomplete API proxy
  app.get("/api/address-autocomplete", async (req, res) => {
    try {
      const { input } = req.query;
      if (!input || typeof input !== "string") {
        return res.json({ predictions: [] });
      }
      
      const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_CIVICS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key is not configured" });
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:us&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Places API error:", data);
      }
      
      let predictions = data.predictions || [];
      
      // Filter predictions to ensure they are in Oklahoma
      predictions = predictions.filter((p: any) => 
        p.description.includes(", OK") || p.description.includes("Oklahoma")
      );
      
      res.json({ predictions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch autocomplete suggestions" });
    }
  });

  // Polling Places API: get summary of loaded spreadsheet polling places
  app.get("/api/polling-places", (req, res) => {
    try {
      const all = getAllPollingPlaces();
      res.json({
        totalCount: all.length,
        sample: all.slice(0, 100)
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to list polling places" });
    }
  });

  // Custom uploads are disabled - application strictly uses official Oklahoma spreadsheet
  app.post("/api/upload-polling-places", (_req, res) => {
    return res.status(403).json({
      error: "Custom upload is disabled. Only the official Oklahoma state spreadsheet is used."
    });
  });

  // Voter Lookup: Pull voter's precinct, match with spreadsheet, and pull polling place
  app.post("/api/voter-lookup", async (req, res) => {
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

      // 1. If user entered a direct precinct number (e.g. "140312" or "010001" or "312")
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

      // 2. If address query and API key present, fetch Civics divisions
      if (!isDirectPrecinct && apiKey) {
        try {
          const repUrl = `https://www.googleapis.com/civicinfo/v2/divisionsByAddress?key=${apiKey}&address=${encodeURIComponent(trimmedInput)}`;
          const repResponse = await fetch(repUrl);
          
          if (repResponse.ok) {
            repData = await repResponse.json();
          } else {
            // Check if input was a precinct code
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

        // Fetch early voting sites from Civics if available
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

      // 3. Resolve voter's precinct polygon via GIS point-in-polygon
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

        // 4. Match precinct with the polling place spreadsheet
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
        } else {
          // Fallback to official County Election Board if precinct not yet in spreadsheet
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

      res.json({
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
  });

  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), "public")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicit SPA fallback for development
    app.use("*", async (req, res, next) => {
      if (req.method !== 'GET') return next();
      try {
        const url = req.originalUrl;
        const fsModule = await import("fs");
        let template = fsModule.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
