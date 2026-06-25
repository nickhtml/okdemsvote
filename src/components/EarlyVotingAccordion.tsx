import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { VoterInfo } from '../types';
import { earlyVotingData } from '../data/early_voting';

interface EarlyVotingAccordionProps {
  voterInfo: VoterInfo;
}

export function EarlyVotingAccordion({ voterInfo }: EarlyVotingAccordionProps) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  const countyDivId = Object.keys(voterInfo.divisions).find(id => id.match(/\/county:[^\/]+$/));
  const rawCounty = countyDivId ? voterInfo.divisions[countyDivId].name : "";
  const countyNameMatch = countyDivId?.match(/county:([^\/]+)/);
  const countyName = rawCounty.replace(/ county/i, '').trim() || (countyNameMatch ? countyNameMatch[1].replace(/_/g, ' ') : "");
  const countyKey = countyNameMatch ? countyNameMatch[1].replace(/_/g, ' ').toLowerCase() : "";
  const matchedSites = earlyVotingData[countyKey] || [];

  const earlyVoteSite = voterInfo.earlyVoteSites?.[0];

  useEffect(() => {
    // Early voting typically begins the Thursday before the election.
    // Election Day: August 25, 2026. Thursday before: August 20, 2026 8:00 AM.
    const earlyVotingStart = new Date(2026, 7, 20, 8, 0, 0).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = earlyVotingStart - now;

      if (distance < 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff', border: '4px solid #1d3557' }}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-4 flex items-center justify-between focus:outline-none transition-colors"
        style={{ backgroundColor: open ? '#1d3557' : 'transparent', color: open ? '#ffffff' : '#1d3557' }}
      >
        <h2 className="text-sm font-black uppercase tracking-widest text-left">When can I early vote?</h2>
        <span className="text-xl font-bold shrink-0">{open ? '−' : '+'}</span>
      </button>
      
      {open && (
        <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: '#ffffff', color: '#1d3557' }}>
          {timeLeft && (
            <div className="flex flex-col items-center justify-center p-3 rounded bg-[#f8fafc] border-2 border-[#a8dadc]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#457b9d] mb-1">Early Voting Begins In</span>
              <div className="flex gap-4">
                <div className="text-center">
                  <span className="text-xl font-black">{timeLeft.days}</span>
                  <span className="block text-[10px] font-bold uppercase">Days</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black">{timeLeft.hours}</span>
                  <span className="block text-[10px] font-bold uppercase">Hrs</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black">{timeLeft.minutes}</span>
                  <span className="block text-[10px] font-bold uppercase">Mins</span>
                </div>
              </div>
            </div>
          )}

          {earlyVoteSite ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold uppercase">Your early voting location:</p>
              <div className="p-3 bg-[#f8fafc] border-2 border-[#1d3557] rounded-none">
                <p className="font-black text-base">{earlyVoteSite.address.locationName}</p>
                <p className="text-sm font-medium">{earlyVoteSite.address.line1}</p>
                <p className="text-sm font-medium">{earlyVoteSite.address.city}, {earlyVoteSite.address.state} {earlyVoteSite.address.zip}</p>
              </div>
              <p className="text-sm font-bold uppercase mt-2">Hours:</p>
              <div className="text-sm font-medium whitespace-pre-line bg-[#f8fafc] p-3 border-2 border-[#a8dadc]">
                {earlyVoteSite.pollingHours || "Please contact your county election board for early voting hours."}
              </div>
            </div>
          ) : matchedSites.length > 0 ? (
            <>
              <p className="text-sm font-bold uppercase text-[#e63946]">When and where to vote early in {countyName} County</p>
              {matchedSites.map((site, idx) => (
                <div key={idx} className="flex flex-col gap-2 mb-4">
                  <div className="p-3 bg-[#f8fafc] border-2 border-[#1d3557] rounded-none">
                    <p className="font-black text-base">{site.locationName}</p>
                    {site.addressLines.map((line, i) => (
                      <p key={i} className="text-sm font-medium">{line}</p>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {site.dates.map((dateLine, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded shadow-none border border-[#a8dadc] bg-[#f8fafc]">
                        <div className="w-4 h-4 mt-0.5 flex items-center justify-center shrink-0 bg-[#1d3557]">
                          <span className="text-white text-[10px] font-black">🗓️</span>
                        </div>
                        <span className="text-xs font-bold opacity-90">{dateLine}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {countyName && (
                <p className="text-sm font-bold uppercase text-[#e63946]">When and where to vote early in {countyName} County</p>
              )}
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded shadow-none border-2 border-[#a8dadc] bg-[#f8fafc]">
                  <div className="w-5 h-5 mt-0.5 flex items-center justify-center shrink-0 bg-[#1d3557]">
                    <span className="text-white text-xs font-black">🗓️</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black tracking-wide uppercase">Thursday & Friday</span>
                    <span className="text-xs font-bold opacity-80">8:00 AM — 6:00 PM</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded shadow-none border-2 border-[#a8dadc] bg-[#f8fafc]">
                  <div className="w-5 h-5 mt-0.5 flex items-center justify-center shrink-0 bg-[#1d3557]">
                    <span className="text-white text-xs font-black">🗓️</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black tracking-wide uppercase">Saturday</span>
                    <span className="text-xs font-bold opacity-80">8:00 AM — 2:00 PM</span>
                  </div>
                </div>
              </div>
              
              <a 
                href="https://hosting.okelections.gov/earlyvote.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 mt-2 bg-[#1d3557] rounded-none font-black text-center text-white uppercase shadow-none text-xs transition-all duration-300 hover:bg-[#e63946] hover:scale-105 active:scale-95 block" 
              >
                Find Early Voting Locations
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
