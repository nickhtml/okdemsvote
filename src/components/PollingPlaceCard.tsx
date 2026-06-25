import { VoterInfo } from '../types';
import { IdAccordion } from './IdAccordion';
import { EarlyVotingAccordion } from './EarlyVotingAccordion';
import { pollingPlacesData } from '../data/polling_places';

interface PollingPlaceCardProps {
  voterInfo: VoterInfo;
}

export function PollingPlaceCard({ voterInfo }: PollingPlaceCardProps) {
  let pollingLocation = voterInfo.pollingLocations?.[0];

  // Attempt to find precinct from divisions
  let precinctName = 'Precinct Unknown';
  let precinctCode = '';
  for (const [ocdId, division] of Object.entries(voterInfo.divisions)) {
    if (ocdId.includes('/precinct:')) {
      precinctCode = ocdId.split('precinct:')[1];
      precinctName = division.name || `Precinct ${precinctCode}`;
      break;
    }
  }

  // Fallback to our CSV data if the API didn't return a polling location
  if (!pollingLocation) {
    if (precinctCode && pollingPlacesData[precinctCode]) {
      const csvPlace = pollingPlacesData[precinctCode];
      pollingLocation = {
        address: {
          locationName: csvPlace.pollingLocation,
          line1: csvPlace.address,
          city: csvPlace.city,
          state: "OK",
          zip: csvPlace.zip
        },
        pollingHours: "7:00 AM - 7:00 PM"
      };
    }
  }

  const handleNavigation = () => {
    if (!pollingLocation) return;
    const address = `${pollingLocation.address.line1}, ${pollingLocation.address.city}, ${pollingLocation.address.state} ${pollingLocation.address.zip}`;
    const navUrl = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
    window.open(navUrl, '_blank');
  };

  const isPollsOpen = () => {
    const now = new Date();
    // Oklahoma Primary Runoff is August 25, 2026.
    const isElectionDay = now.getFullYear() === 2026 && now.getMonth() === 7 && now.getDate() === 25;
    const currentHour = now.getHours();
    return isElectionDay && currentHour >= 7 && currentHour < 19;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {pollingLocation ? (
        <div className="p-5 rounded-none flex flex-col gap-3" style={{ backgroundColor: '#ffffff', border: '4px solid #1d3557' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#1d3557' }}>Where Do I Vote?</h2>
            {isPollsOpen() ? (
              <span className="px-3 py-1 text-xs font-black rounded uppercase shadow-sm bg-[#e63946] text-[#f1faee]">OPEN</span>
            ) : (
              <span className="px-3 py-1 text-xs font-black rounded uppercase shadow-sm bg-gray-500 text-white">CLOSED</span>
            )}
          </div>
          <div>
            {precinctName !== 'Precinct Unknown' && (
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#e63946' }}>{precinctName}</p>
            )}
            <h3 className="text-xl font-black uppercase" style={{ color: '#1d3557' }}>{pollingLocation.address.locationName}</h3>
            <p className="text-sm font-bold mt-1 uppercase" style={{ color: '#457b9d' }}>
              {pollingLocation.address.line1}<br/>
              {pollingLocation.address.city}, {pollingLocation.address.state} {pollingLocation.address.zip}
            </p>
            {pollingLocation.pollingHours && (
              <p className="text-xs font-bold mt-3 opacity-80 uppercase" style={{ color: '#1d3557' }}>Hours: {pollingLocation.pollingHours}</p>
            )}
          </div>
          <button 
            onClick={handleNavigation}
            className="w-full py-4 mt-2 bg-[#1d3557] rounded-none font-black text-white uppercase shadow-none text-base transition-all duration-300 hover:bg-[#e63946] hover:scale-105 hover:shadow-xl active:scale-95" 
          >
            Get Directions
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-none flex flex-col gap-3 bg-[#ffffff] border-4 border-[#1d3557]">
           <h2 className="text-2xl font-black uppercase tracking-tight text-[#1d3557]">Where Do I Vote?</h2>
           <p className="text-sm font-bold uppercase text-[#457b9d]">Find your polling place on the OK Voter Portal</p>
           <a 
             href="https://okvoterportal.okelections.us/Home"
             target="_blank"
             rel="noopener noreferrer"
             className="w-full py-4 mt-2 bg-[#1d3557] rounded-none font-black text-center text-white uppercase shadow-none text-base transition-all duration-300 hover:bg-[#e63946] hover:scale-105 hover:shadow-xl active:scale-95 block" 
           >
             OK Voter Portal
           </a>
        </div>
      )}

      <EarlyVotingAccordion voterInfo={voterInfo} />
      <IdAccordion />
    </div>
  );
}
