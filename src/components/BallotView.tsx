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
      statewide: { title: 'STATEWIDE', district: 'NOVEMBER ELECTION', color: '#e63946', candidates: [] },
      senate: { title: 'U.S. SENATE', district: 'PRIMARY ELECTION', color: '#2b5ce6', candidates: [] },
      congress: { title: 'U.S. CONGRESS', district: usCongress ? `DISTRICT ${usCongress}` : 'NOVEMBER ELECTION', color: '#2b5ce6', candidates: [] },
      state_senate: { title: 'STATE SENATE', district: okSenate ? `DISTRICT ${okSenate}` : 'NOVEMBER ELECTION', color: '#e63946', candidates: [] },
      state_house: { title: 'STATE HOUSE', district: okHouse ? `DISTRICT ${okHouse}` : 'NOVEMBER ELECTION', color: '#e63946', candidates: [] }
    };

    candidates.forEach((c: Candidate, index: number) => {
      const d = c.district.toLowerCase();
      
      if (d === 'u.s. senate' || d === 'us senate') {
        groups.senate.candidates.push(c);
      } else if (d.includes('congress')) {
        if (!usCongress || d.includes(usCongress)) groups.congress.candidates.push(c);
      } else if (index >= 14 && index <= 34) {
        // State Senate (Indices 14-34 in candidates.ts)
        const distMatch = d.match(/\d+/);
        const distNum = distMatch ? distMatch[0] : null;
        if (!okSenate || (distNum && distNum === okSenate)) {
          groups.state_senate.candidates.push(c);
        }
      } else if (index >= 35) {
        // State House (Indices 35+ in candidates.ts)
        const distMatch = d.match(/\d+/);
        const distNum = distMatch ? distMatch[0] : null;
        if (!okHouse || (distNum && distNum === okHouse)) {
          groups.state_house.candidates.push(c);
        }
      } else {
        // Statewide (Indices 7-13)
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
  const isIncumbent = candidate.name.toLowerCase().includes('rep.') || candidate.name.toLowerCase().includes('senator');
  const cleanName = candidate.name.replace(/Rep\.|Senator/gi, '').trim();
  const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const hasWebsite = candidate.website && candidate.website !== 'N/A' && candidate.website.startsWith('http');
  
  const districtStr = candidate.district.toLowerCase();
  const isUSSenate = districtStr === 'u.s. senate' || districtStr === 'us senate';
  const isHD99 = districtStr.includes('99');
  const hasFinishedPrimary = !isUSSenate && !isHD99;
  const isStatewide = !(isUSSenate || districtStr.includes('congress') || districtStr.includes('district') || districtStr.includes('house') || districtStr.includes('senate'));

  return (
    <div className="flex flex-col p-4 md:p-6 bg-white relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-[#1d3557] cursor-pointer">
      
      <div className="flex gap-4 md:gap-6 items-start">
        {/* Photo */}
        <div 
          className="w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center font-bold text-3xl text-white overflow-hidden bg-cover bg-center border-2 border-black transition-all duration-300 group-hover:border-[#e63946] group-hover:ring-4 group-hover:ring-[#e63946]/50 group-hover:scale-105" 
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
            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-1 group-hover:text-[#a8dadc] transition-colors">{candidate.district}</p>
          )}
          <div className="flex justify-between items-center gap-2">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black transition-all duration-300 group-hover:text-white group-hover:translate-x-2 group-hover:scale-[1.02] origin-left">
              {cleanName}
            </h3>
            
            {/* Oval Animation */}
            {hasFinishedPrimary ? (
              <div className="shrink-0 w-12 h-6 md:w-16 md:h-8 rounded-[100%] border-4 border-black relative overflow-hidden bg-white flex items-center justify-center">
                <motion.svg
                  className="absolute inset-0 w-full h-full text-black opacity-90"
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, margin: "-10%" }}
                >
                  <motion.path
                    d="M10,25 C20,10 30,40 40,25 C50,10 60,40 70,25 C80,10 90,40 90,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={{
                      hidden: { pathLength: 0 },
                      visible: { 
                        pathLength: 1, 
                        transition: { duration: 0.8, ease: "easeOut" } 
                      }
                    }}
                  />
                  <motion.path
                    d="M15,20 C25,35 35,5 45,20 C55,35 65,5 75,20 C85,35 85,15 85,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={{
                      hidden: { pathLength: 0 },
                      visible: { 
                        pathLength: 1, 
                        transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } 
                      }
                    }}
                  />
                  <motion.path
                    d="M20,30 C30,15 40,45 50,30 C60,15 70,45 80,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={{
                      hidden: { pathLength: 0 },
                      visible: { 
                        pathLength: 1, 
                        transition: { duration: 0.8, ease: "easeOut", delay: 0.4 } 
                      }
                    }}
                  />
                </motion.svg>
              </div>
            ) : (
              <div className="shrink-0 w-12 h-6 md:w-16 md:h-8 rounded-[100%] border-4 border-slate-300 relative overflow-hidden bg-white"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer / Links */}
      <div className="mt-6 pt-4 border-t-2 border-slate-200 group-hover:border-[#a8dadc]/30 flex gap-4">
        {hasWebsite && (
          <>
            <a 
              href={candidate.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 font-black text-xs md:text-sm uppercase tracking-widest border-2 border-black transition-all duration-300 text-black group-hover:border-white group-hover:text-white hover:!bg-[#e63946] hover:!border-[#e63946] hover:!text-white hover:scale-105 active:scale-95" 
            >
              Website
            </a>
          </>
        )}
      </div>
    </div>
  );
}
