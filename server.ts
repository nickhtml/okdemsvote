import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // Google Civics API Lookup
  app.post("/api/voter-lookup", async (req, res) => {
    try {
      const { address } = req.body;
      const apiKey = process.env.GOOGLE_CIVICS_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GOOGLE_CIVICS_API_KEY is not configured" });
      }

      // We use the divisionsByAddress endpoint to reliably get the congressional/state districts
      const repUrl = `https://www.googleapis.com/civicinfo/v2/divisionsByAddress?key=${apiKey}&address=${encodeURIComponent(address)}`;
      const repResponse = await fetch(repUrl);
      
      if (!repResponse.ok) {
        if (repResponse.status === 404 || repResponse.status === 400) {
           throw new Error("Address not found. Please ensure you've entered a valid US address.");
        }
        const errorData = await repResponse.json().catch(() => ({}));
        throw new Error(`Civics API Error: ${errorData.error?.message || repResponse.statusText}`);
      }
      
      const repData = await repResponse.json();
      
      // We also try to fetch voterinfo to get polling places (might be empty if no upcoming election)
      // Usually, we pass electionId=2000 for VIP Test Election or omit for default.
      const voterUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${apiKey}&address=${encodeURIComponent(address)}`;
      let pollingLocations = [];
      let earlyVoteSites = [];
      try {
        const voterResponse = await fetch(voterUrl);
        if (voterResponse.ok) {
          const voterData = await voterResponse.json();
          if (voterData.pollingLocations) {
            pollingLocations = voterData.pollingLocations;
          }
          if (voterData.earlyVoteSites) {
            earlyVoteSites = voterData.earlyVoteSites;
          }
        }
      } catch (e) {
        console.error("Voter info fetch failed, continuing without polling places", e);
      }

      res.json({
        normalizedInput: repData.normalizedInput,
        divisions: repData.divisions,
        pollingLocations,
        earlyVoteSites
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to resolve address" });
    }
  });

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
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
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
