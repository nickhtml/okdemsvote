export interface NormalizedInput {
  line1: string;
  city: string;
  state: string;
  zip: string;
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
}

export interface Candidate {
  name: string;
  district: string;
  website: string;
  photoUrl: string;
}
