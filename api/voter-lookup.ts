import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
         return res.status(404).json({ error: "Address not found. Please ensure you've entered a valid US address." });
      }
      const errorData = await repResponse.json().catch(() => ({}));
      return res.status(500).json({ error: `Civics API Error: ${errorData.error?.message || repResponse.statusText}` });
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

    res.status(200).json({
      normalizedInput: repData.normalizedInput,
      divisions: repData.divisions,
      pollingLocations,
      earlyVoteSites
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to resolve address" });
  }
}
