import okPrecinctsList from './ok_precincts.json';

export interface PollingPlace {
  precinctId: string;
  precinctCode: string;
  precinctName: string;
  pollingLocation: string;
  locationDescription: string;
  address: string;
  city: string;
  zip: string;
  county: string;
}

// Built-in official Oklahoma Election Day Polling Places Directory (1,978 precincts)
export const officialPollingPlaces: PollingPlace[] = okPrecinctsList as PollingPlace[];

// Fast indexed lookups
export const pollingPlacesData: Record<string, PollingPlace> = {};
const countyPrecinctIndex: Record<string, PollingPlace> = {};

for (const place of officialPollingPlaces) {
  const code = place.precinctCode;
  const digitsOnly = code.replace(/[^0-9]/g, '');
  const padded = digitsOnly ? digitsOnly.padStart(6, '0') : code;

  // Primary keys
  pollingPlacesData[code] = place;
  if (padded) pollingPlacesData[padded] = place;
  if (digitsOnly && digitsOnly !== padded) {
    pollingPlacesData[digitsOnly] = place;
  }
  if (place.precinctId) {
    pollingPlacesData[place.precinctId] = place;
  }

  // Compound County + Precinct index
  if (place.county) {
    const cSlug = place.county.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (padded) countyPrecinctIndex[`${cSlug}:${padded}`] = place;
    if (digitsOnly) countyPrecinctIndex[`${cSlug}:${digitsOnly}`] = place;
    // Short 3 or 4 digit code inside county (e.g., precinct 308 in cleveland)
    const shortNum = digitsOnly.slice(-3);
    const shortNum4 = digitsOnly.slice(-4);
    if (shortNum) countyPrecinctIndex[`${cSlug}:${shortNum}`] = place;
    if (shortNum4) countyPrecinctIndex[`${cSlug}:${shortNum4}`] = place;
  }
}

/**
 * Robust precinct lookup that handles:
 * - Direct 6-digit code (e.g. "140312" or "010001" or "550534")
 * - Unpadded precinct number (e.g. "10001" -> "010001")
 * - County + short precinct number (e.g. "312" in Cleveland -> matches "140312")
 * - PrecinctId or name matching
 */
export function getPollingPlaceForPrecinct(code: string, county?: string): PollingPlace | undefined {
  if (!code) return undefined;
  const cleaned = code.trim().replace(/^precinct\s*/i, '').replace(/^pct\s*#?\s*/i, '');
  const digitsOnly = cleaned.replace(/[^0-9]/g, '');
  const padded = digitsOnly ? digitsOnly.padStart(6, '0') : cleaned;

  const countySlug = county ? county.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  // 1. County-specific compound match first if county provided
  if (countySlug) {
    if (countyPrecinctIndex[`${countySlug}:${padded}`]) {
      return countyPrecinctIndex[`${countySlug}:${padded}`];
    }
    if (digitsOnly && countyPrecinctIndex[`${countySlug}:${digitsOnly}`]) {
      return countyPrecinctIndex[`${countySlug}:${digitsOnly}`];
    }
  }

  // 2. Direct 6-digit zero-padded match
  if (padded && pollingPlacesData[padded]) {
    return pollingPlacesData[padded];
  }

  // 3. Direct key match
  if (pollingPlacesData[cleaned]) {
    return pollingPlacesData[cleaned];
  }
  if (digitsOnly && pollingPlacesData[digitsOnly]) {
    return pollingPlacesData[digitsOnly];
  }

  // 4. Search by precinctId, precinctCode, or precinctName
  for (const place of officialPollingPlaces) {
    if (place.precinctCode === padded || place.precinctId === cleaned || place.precinctCode === cleaned) {
      if (!countySlug || place.county.toLowerCase().replace(/[^a-z0-9]/g, '') === countySlug) {
        return place;
      }
    }
    if (digitsOnly && (place.precinctCode === digitsOnly.padStart(6, '0') || place.precinctId === digitsOnly)) {
      if (!countySlug || place.county.toLowerCase().replace(/[^a-z0-9]/g, '') === countySlug) {
        return place;
      }
    }
  }

  // 5. Short suffix match within county
  if (countySlug && digitsOnly && digitsOnly.length >= 2) {
    for (const place of officialPollingPlaces) {
      if (place.county.toLowerCase().replace(/[^a-z0-9]/g, '') === countySlug) {
        if (place.precinctCode.endsWith(digitsOnly) || place.precinctCode.endsWith(digitsOnly.padStart(3, '0')) || place.precinctCode.endsWith(digitsOnly.padStart(4, '0'))) {
          return place;
        }
      }
    }
  }

  // 6. Generic lookup across any place
  if (padded && pollingPlacesData[padded]) {
    return pollingPlacesData[padded];
  }

  return undefined;
}

export function getAllPollingPlaces(): PollingPlace[] {
  return officialPollingPlaces;
}

export function getPollingPlacesCount(): number {
  return officialPollingPlaces.length;
}
