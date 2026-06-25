import earlyVotingDataRaw from './early_voting.json';

export interface EarlyVotingSiteInfo {
  locationName: string;
  addressLines: string[];
  dates: string[];
}

export const earlyVotingData = earlyVotingDataRaw as Record<string, EarlyVotingSiteInfo[]>;
