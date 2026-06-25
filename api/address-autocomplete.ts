import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { input } = req.query;
    if (!input || typeof input !== "string") {
      return res.status(200).json({ predictions: [] });
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
    
    res.status(200).json({ predictions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch autocomplete suggestions" });
  }
}
