import React, { useMemo } from 'react';
import { VoterInfo, Candidate } from '../types';
import { candidates } from '../data/candidates';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BallotViewProps {
  voterInfo: VoterInfo;
}

export function BallotView({ voterInfo }: BallotViewProps) {
  const getDistrictValue = (type: 'cd' | 'sldl' | 'sldu') => {
    for (const [ocdId, division] of Object.entries(voterInfo.divisions)) {
      if (ocdId.includes(`/${type}:`)) {
        return ocdId.split(`${type}:`)[1];
      }
    }
    return null;
  };

  const usCongress = getDistrictValue('cd');
  const okHouse = getDistrictValue('sldl');
  const okSenate = getDistrictValue('sldu');

  // Filter and group candidates
  const groupedCandidates = useMemo(() => {
    const groups: Record<string, { title: string, district: string, color: string, candidates: Candidate[] }> = {
      statewide: { title: 'STATEWIDE', district: 'NOVEMBER ELECTION', color: '#457b9d', candidates: [] },
      senate: { title: 'U.S. SENATE', district: 'NOVEMBER ELECTION', color: '#2b5ce6', candidates: [] },
      congress: { title: 'U.S. CONGRESS', district: usCongress ? `DISTRICT ${usCongress}` : 'NOVEMBER ELECTION', color: '#2b5ce6', candidates: [] },
      state_senate: { title: 'STATE SENATE', district: okSenate ? `DISTRICT ${okSenate}` : 'NOVEMBER ELECTION', color: '#457b9d', candidates: [] },
      state_house: { title: 'STATE HOUSE', district: okHouse ? `DISTRICT ${okHouse}` : 'NOVEMBER ELECTION', color: '#457b9d', candidates: [] }
    };

    candidates.forEach((c: Candidate, index: number) => {
      const d = c.district.toLowerCase();
      
      if (d === 'u.s. senate' || d === 'us senate') {
        groups.senate.candidates.push(c);
      } else if (d.includes('congress')) {
        if (!usCongress || d.includes(usCongress)) groups.congress.candidates.push(c);
      } else if (index >= 13 && index <= 33) {
        // State Senate (Indices 13-33 in candidates.ts)
        const distMatch = d.match(/\d+/);
        const distNum = distMatch ? distMatch[0] : null;
        if (!okSenate || (distNum && distNum === okSenate)) {
          groups.state_senate.candidates.push(c);
        }
      } else if (index >= 34) {
        // State House (Indices 34+ in candidates.ts)
        const distMatch = d.match(/\d+/);
        const distNum = distMatch ? distMatch[0] : null;
        if (!okHouse || (distNum && distNum === okHouse)) {
          groups.state_house.candidates.push(c);
        }
      } else {
        // Statewide (Indices 6-12)
        groups.statewide.candidates.push(c);
      }
    });

    return Object.values(groups).filter(g => g.candidates.length > 0);
  }, [usCongress, okHouse, okSenate]);

  return (
    <>
      <div className="flex items-center justify-center shrink-0 mb-4 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight" style={{ color: '#000000' }}>Your Digital Ballot</h2>
      </div>
      
      <div className="flex flex-col gap-8">
        {groupedCandidates.length > 0 ? groupedCandidates.map((group, idx) => (
          <div key={idx} className="w-full flex flex-col shadow-lg" style={{ backgroundColor: '#ffffff', border: `4px solid ${group.color}` }}>
            {/* Header */}
            <div className="px-4 py-3 flex justify-between items-end" style={{ backgroundColor: group.color, color: '#ffffff' }}>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">{group.title}</h3>
              <div className="text-right leading-none">
                <span className="block text-xs md:text-sm font-bold uppercase">{group.district}</span>
              </div>
            </div>
            
            {/* Candidates List */}
            <div className="flex flex-col divide-y-4" style={{ borderColor: group.color }}>
              {group.candidates.map((c, i) => (
                <CandidateCard key={i} candidate={c} />
              ))}
            </div>
          </div>
        )) : (
          <div className="p-8 text-center border-4 border-dashed rounded-none" style={{ borderColor: '#1d3557', color: '#1d3557' }}>
            <p className="font-black uppercase text-lg">No candidates found for your specific districts.</p>
          </div>
        )}
      </div>
    </>
  );
}

const CandidateCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isIncumbent = candidate.name.toLowerCase().includes('rep.') || candidate.name.toLowerCase().includes('senator');
  const cleanName = candidate.name.replace(/Rep\.|Senator/gi, '').trim();
  const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const hasWebsite = candidate.website && candidate.website !== 'N/A' && candidate.website.startsWith('http');
  
  const districtStr = candidate.district.toLowerCase();
  const isUSSenate = districtStr === 'u.s. senate' || districtStr === 'us senate';
  const hasFinishedPrimary = true;
  const isStatewide = !(isUSSenate || districtStr.includes('congress') || districtStr.includes('district') || districtStr.includes('house') || districtStr.includes('senate'));

  return (
    <div 
      className={`flex flex-col p-4 md:p-6 relative group transition-all duration-300 cursor-pointer ${
        isExpanded 
          ? "bg-[#1d3557] -translate-y-1 shadow-xl" 
          : "bg-white hover:bg-[#f0f4f8] hover:-translate-y-1 hover:shadow-md"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      
      <div className="flex gap-4 md:gap-6 items-start">
        {/* Photo */}
        <div 
          className={`w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center font-bold text-3xl text-white overflow-hidden bg-cover bg-center border-2 transition-all duration-300 ${
            isExpanded 
              ? "border-[#457b9d] ring-4 ring-[#457b9d]/50 scale-105" 
              : "border-[#1d3557] group-hover:scale-105"
          }`}
          style={{ 
            backgroundColor: '#1d3557',
            backgroundImage: candidate.photoUrl ? `url(${candidate.photoUrl})` : 'none'
          }}
        >
          {!candidate.photoUrl && initials}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-24 md:h-32">
          {isStatewide && (
            <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-1 transition-colors ${
              isExpanded ? "text-[#a8dadc]" : "text-[#457b9d]"
            }`}>
              {candidate.district}
            </p>
          )}
          <div className="flex justify-between items-center gap-2">
            <h3 className={`text-2xl md:text-4xl font-black uppercase tracking-tighter transition-all duration-300 origin-left ${
              isExpanded 
                ? "text-white translate-x-2 scale-[1.02]" 
                : "text-[#1d3557] group-hover:translate-x-2 group-hover:scale-[1.02]"
            }`}>
              {cleanName}
            </h3>
            
            {/* Rectangle Ballot Box Animation */}
            {hasFinishedPrimary ? (
              <div className={`shrink-0 w-12 h-6 md:w-16 md:h-8 rounded-none border-4 relative overflow-hidden bg-white flex items-center justify-center ${
                isExpanded ? "border-white text-white" : "border-[#1d3557] text-[#1d3557]"
              }`}>
                <motion.svg
                  className="absolute inset-0 w-full h-full opacity-90"
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, margin: "-10%" }}
                >
                  <motion.path
                    d="M5,10 L95,10 L5,25 L95,25 L5,40 L95,40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    variants={{
                      hidden: { pathLength: 0 },
                      visible: { 
                        pathLength: 1, 
                        transition: { duration: 0.8, ease: "easeOut" } 
                      }
                    }}
                  />
                  <motion.path
                    d="M10,5 L90,45 M90,5 L10,45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="square"
                    variants={{
                      hidden: { pathLength: 0 },
                      visible: { 
                        pathLength: 1, 
                        transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } 
                      }
                    }}
                  />
                </motion.svg>
              </div>
            ) : (
              <div className={`shrink-0 w-12 h-6 md:w-16 md:h-8 rounded-none border-4 relative overflow-hidden bg-white ${
                isExpanded ? "border-[#a8dadc]" : "border-slate-300"
              }`}></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Links (Always shown on mobile, hover/tap on desktop) */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded 
          ? "max-h-32 opacity-100 mt-4 md:mt-6" 
          : "max-h-32 opacity-100 mt-4 md:mt-0 md:max-h-0 md:opacity-0 md:group-hover:max-h-32 md:group-hover:opacity-100 md:group-hover:mt-6"
      }`}>
        <div className={`pt-4 border-t-2 flex gap-4 transition-colors ${
          isExpanded ? "border-[#a8dadc]/30" : "border-slate-200"
        }`}>
          {hasWebsite && (
            <a 
              href={candidate.website} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`px-4 py-2 font-black text-xs md:text-sm uppercase tracking-widest border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                isExpanded 
                  ? "border-white text-white hover:bg-white hover:text-[#1d3557]" 
                  : "border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557] hover:text-white"
              }`}
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
