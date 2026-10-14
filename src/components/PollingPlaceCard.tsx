import { VoterInfo, PollingLocation } from '../types';
import { IdAccordion } from './IdAccordion';
import { EarlyVotingAccordion } from './EarlyVotingAccordion';
import { getPollingPlaceForPrecinct } from '../data/polling_places';
import { earlyVotingData } from '../data/early_voting';
import { MapPin, Navigation } from 'lucide-react';

interface PollingPlaceCardProps {
  voterInfo: VoterInfo;
  onOpenDirectory?: () => void;
}

export function PollingPlaceCard({ voterInfo, onOpenDirectory }: PollingPlaceCardProps) {
  // Attempt to find precinct and county from voterInfo or divisions
  let precinctCode = voterInfo.matchedPrecinct || '';
  let countyDisplayName = voterInfo.matchedCounty || '';
  let precinctName = '';
  let countySlug = '';

  for (const [ocdId, division] of Object.entries(voterInfo.divisions || {})) {
    if (ocdId.includes('/precinct:')) {
      const code = ocdId.split('precinct:')[1];
      if (!precinctCode) precinctCode = code;
      precinctName = division.name || `Precinct ${code}`;
    }
    if (ocdId.includes('/county:')) {
      const slug = ocdId.split('county:')[1].toLowerCase().replace(/_county$/, '');
      if (!countySlug) countySlug = slug;
      if (!countyDisplayName) {
        countyDisplayName = division.name || `${slug.charAt(0).toUpperCase() + slug.slice(1)} County`;
      }
    }
  }

  if (!precinctName && precinctCode) {
    precinctName = `Precinct ${precinctCode}`;
  }

  // Match the precinct against the official 1,978-precinct spreadsheet
  const matchedSpreadsheetPlace = getPollingPlaceForPrecinct(precinctCode, countyDisplayName);
  
  let pollingLocation: PollingLocation | undefined;
  let isSpreadsheetMatch = false;

  if (matchedSpreadsheetPlace) {
    isSpreadsheetMatch = true;
    pollingLocation = {
      address: {
        locationName: matchedSpreadsheetPlace.pollingLocation,
        line1: matchedSpreadsheetPlace.address,
        city: matchedSpreadsheetPlace.city,
        state: "OK",
        zip: matchedSpreadsheetPlace.zip
      },
      pollingHours: "7:00 AM - 7:00 PM",
      isFromSpreadsheet: true,
      precinctCode: precinctCode,
      county: countyDisplayName || matchedSpreadsheetPlace.county
    };
  } else if (voterInfo.pollingLocations?.[0]?.isFromSpreadsheet) {
    isSpreadsheetMatch = true;
    pollingLocation = voterInfo.pollingLocations[0];
  } else if (voterInfo.pollingLocations?.[0]) {
    // API returned a location
    isSpreadsheetMatch = false;
    pollingLocation = voterInfo.pollingLocations[0];
  } else if (countySlug && (earlyVotingData as any)[countySlug]?.[0]) {
    // Local County Election Board fallback
    const countySite = (earlyVotingData as any)[countySlug][0];
    const addressParts = countySite.addressLines || [];
    const cityZip = addressParts[addressParts.length - 1] || 'OK';
    const line1 = addressParts[0] || '';
    
    const match = cityZip.match(/(.*),\s*OK\s*(\d{5})?/i);
    const city = match ? match[1].trim() : (voterInfo.normalizedInput?.city || 'Oklahoma');
    const zip = match && match[2] ? match[2] : (voterInfo.normalizedInput?.zip || '');

    isSpreadsheetMatch = false;
    pollingLocation = {
      address: {
        locationName: countySite.locationName || `${countyDisplayName.toUpperCase()} ELECTION BOARD`,
        line1: line1,
        city: city,
        state: "OK",
        zip: zip
      },
      pollingHours: "7:00 AM - 7:00 PM",
      isFromSpreadsheet: false
    };
  } else {
    // Oklahoma City central fallback
    isSpreadsheetMatch = false;
    pollingLocation = {
      address: {
        locationName: "OKLAHOMA STATE ELECTION BOARD HEADQUARTERS",
        line1: "2300 N LINCOLN BLVD, STE B-6",
        city: "OKLAHOMA CITY",
        state: "OK",
        zip: "73105"
      },
      pollingHours: "7:00 AM - 7:00 PM",
      isFromSpreadsheet: false
    };
  }

  const isPollsOpen = () => {
    const now = new Date();
    // Oklahoma General Election is November 3, 2026.
    const isElectionDay = now.getFullYear() === 2026 && now.getMonth() === 10 && now.getDate() === 3;
    const currentHour = now.getHours();
    return isElectionDay && currentHour >= 7 && currentHour < 19;
  };

  const navAddress = pollingLocation ? 
    `${pollingLocation.address.locationName ? pollingLocation.address.locationName + ', ' : ''}${pollingLocation.address.line1}, ${pollingLocation.address.city}, ${pollingLocation.address.state} ${pollingLocation.address.zip}` 
    : '';
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navAddress)}`;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="p-5 md:p-6 rounded-none flex flex-col gap-3 shadow-md bg-white border-4 border-[#1d3557]">
        
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between border-b-2 pb-3 border-[#1d3557]/15 gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#1d3557]" />
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#1d3557]">
              Where Do I Vote on Election Day?
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {isPollsOpen() ? (
              <span className="px-3 py-1 text-xs font-black uppercase shadow-sm bg-[#457b9d] text-white">
                OPEN NOW
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-black uppercase shadow-sm bg-gray-600 text-white">
                POLLS OPEN 7AM - 7PM
              </span>
            )}
          </div>
        </div>

        {/* Polling Location Details */}
        <div>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1d3557]">
            {pollingLocation.address.locationName}
          </h3>
          <p className="text-base md:text-lg font-bold mt-1 uppercase text-[#457b9d]">
            {pollingLocation.address.line1}<br/>
            {pollingLocation.address.city}, {pollingLocation.address.state} {pollingLocation.address.zip}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs md:text-sm font-black uppercase text-[#1d3557]/80">
            <span>⏰ Election Day Voting Hours: 7:00 AM - 7:00 PM</span>
          </div>
        </div>

        {/* Directions Link */}
        <a 
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-[#1d3557] rounded-none font-black text-white uppercase text-base transition-all duration-300 hover:bg-[#457b9d] hover:text-white hover:scale-[1.01] active:scale-[0.99] shadow-sm" 
        >
          <Navigation className="w-5 h-5" />
          <span>Get Directions to Polling Place</span>
        </a>
      </div>

      <EarlyVotingAccordion voterInfo={voterInfo} />
      <IdAccordion />
    </div>
  );
}
