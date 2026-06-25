import { useState } from 'react';
import { cn } from '../lib/utils';

export function IdAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff', border: '4px solid #1d3557' }}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-4 flex items-center justify-between focus:outline-none transition-colors"
        style={{ backgroundColor: open ? '#1d3557' : 'transparent', color: open ? '#ffffff' : '#1d3557' }}
      >
        <h2 className="text-sm font-black uppercase tracking-widest text-left">What do I need to bring?</h2>
        <span className="text-xl font-bold shrink-0">{open ? '−' : '+'}</span>
      </button>
      
      {open && (
        <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: '#ffffff', color: '#1d3557' }}>
          <p className="text-xs leading-relaxed font-bold italic pb-4 border-b-2" style={{ borderColor: '#f1faee' }}>
            You may show any document issued by the United States, the State of Oklahoma, or a federally recognized tribal government if it includes your name, a photograph of you, and an expiration date that is later than the election in which you are voting.
          </p>
          <div className="space-y-2">
            {[
              "Oklahoma Driver's License",
              "Oklahoma Identification Card",
              "United States Passport",
              "United States Military Identification"
            ].map((idType, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded shadow-none border-2" style={{ borderColor: '#a8dadc', backgroundColor: '#f8fafc' }}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0" style={{ backgroundColor: '#1fb976' }}>
                  <span className="text-white text-xs font-black">✓</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase">{idType}</span>
              </div>
            ))}
          </div>
          <div className="p-4 mt-2 rounded-none text-xs font-bold leading-tight text-center uppercase" style={{ backgroundColor: '#e63946', color: '#ffffff' }}>
            <strong>Lacking ID?</strong><br/><span className="opacity-90">Your Voter Registration Card is also valid!</span>
          </div>
        </div>
      )}
    </div>
  );
}
