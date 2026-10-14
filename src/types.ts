export interface NormalizedInput {
  line1: string;
  city: string;
  state: string;
  zip: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PollingLocation {
  address: {
    locationName: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  pollingHours: string;
  isFromSpreadsheet?: boolean;
  precinctCode?: string;
  county?: string;
  coordinates?: Coordinates;
}

export interface Division {
  name: string;
  office?: string;
}

export interface VoterInfo {
  normalizedInput?: NormalizedInput;
  divisions: Record<string, Division>;
  pollingLocations: PollingLocation[];
  earlyVoteSites?: PollingLocation[];
  matchedPrecinct?: string;
  matchedCounty?: string;
  isSpreadsheetMatch?: boolean;
  voterCoordinates?: Coordinates;
}

export interface Candidate {
  name: string;
  district: string;
  website: string;
  photoUrl: string;
}
