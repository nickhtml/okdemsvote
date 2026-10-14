import { useState, useEffect, useRef, FormEvent } from 'react';
import { cn } from '../lib/utils';
import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface AddressLookupProps {
  onLookup: (address: string) => void;
  isLoading: boolean;
  error: string | null;
  onRegisterClick?: () => void;
  onMailClick?: () => void;
  onOpenDirectory?: () => void;
}

export function AddressLookup({ 
  onLookup, 
  isLoading, 
  error, 
  onRegisterClick, 
  onMailClick,
  onOpenDirectory 
}: AddressLookupProps) {
  const [address, setAddress] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!address.trim() || address.length < 3) {
        setPredictions([]);
        return;
      }
      try {
        const res = await fetch(`/api/address-autocomplete?input=${encodeURIComponent(address)}`);
        if (res.ok) {
          const data = await res.json();
          setPredictions(data.predictions || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const timer = setTimeout(fetchPredictions, 150);
    return () => clearTimeout(timer);
  }, [address]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      setShowDropdown(false);
      onLookup(address.trim());
    }
  };

  const handleSelect = (description: string) => {
    setAddress(description);
    setShowDropdown(false);
    onLookup(description);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center text-center relative overflow-visible bg-white border-2 border-[#1d3557]">
      {/* Animation of person casting a ballot */}
      <div className="relative w-24 h-24 mb-6">
        {/* Ballot Box */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#1d3557] z-10">
          <path d="M20 50 L80 50 L75 90 L25 90 Z" fill="currentColor" />
          <path d="M15 40 L85 40 L80 50 L20 50 Z" fill="#457b9d" />
          <rect x="40" y="42" width="20" height="4" fill="#1d3557" />
        </svg>
        
        {/* Animated Ballot */}
        <motion.div 
          className="absolute left-[38%] bg-white border-2 border-[#1d3557] rounded-sm w-6 h-8 z-0"
          initial={{ y: -40, opacity: 0, rotate: -10 }}
          animate={{ y: 25, opacity: [0, 1, 1, 0], rotate: 0 }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full p-1 flex flex-col gap-0.5">
            <div className="w-full h-0.5 bg-[#457b9d]"></div>
            <div className="w-3/4 h-0.5 bg-[#1d3557]"></div>
            <div className="w-1/2 h-0.5 bg-[#1d3557]"></div>
          </div>
        </motion.div>
      </div>

      <h2 className="text-3xl font-black mb-2 tracking-tight text-[#1d3557]">Ready to Vote?</h2>
      <p className="text-sm font-medium mb-6 text-[#457b9d]">
        Enter your Oklahoma address or precinct number to match your polling place from the official state directory and preview your ballot!
      </p>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 relative">
        <div ref={wrapperRef} className="w-full relative">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (address.length >= 3) setShowDropdown(true);
            }}
            placeholder="e.g. 100 N Broadway Ave, OKC or Precinct 550534"
            className="w-full px-5 py-4 rounded-lg text-lg font-bold placeholder:opacity-50 border-2 focus:outline-none focus:ring-4 transition-all relative z-20 bg-[#f1faee] text-[#1d3557]"
            style={{ 
              borderColor: showDropdown && predictions.length > 0 ? '#1d3557' : '#a8dadc'
            }}
            disabled={isLoading}
            required
            autoComplete="off"
          />

          {showDropdown && predictions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#1d3557] rounded-lg shadow-xl z-50 overflow-hidden">
              <ul className="max-h-60 overflow-y-auto">
                {predictions.map((p, idx) => (
                  <li 
                    key={p.place_id || idx}
                    className="px-4 py-3 text-left hover:bg-slate-50 cursor-pointer flex items-start gap-3 border-b last:border-b-0 transition-colors"
                    onClick={() => handleSelect(p.description)}
                  >
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5 opacity-40 text-[#1d3557]" />
                    <div>
                      <span className="font-bold text-slate-800 block">{p.structured_formatting?.main_text || p.description}</span>
                      {p.structured_formatting?.secondary_text && (
                        <span className="text-xs text-slate-500 font-medium block">{p.structured_formatting.secondary_text}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-3 rounded text-sm font-bold text-left shadow-inner flex items-start gap-2 relative z-10 bg-[#fffbe3] text-[#92400e] border border-[#fde68a]">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-4 rounded-lg font-black text-white uppercase tracking-wider text-lg shadow-lg relative z-10 transition-all duration-300 bg-[#1d3557]",
            "group overflow-hidden cursor-pointer",
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#457b9d] hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]"
          )}
        >
          {isLoading ? 'Finding your precinct & polling place...' : "Find My Polling Place & Ballot"}
        </button>
      </form>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5 text-center">
        {onRegisterClick && (
          <button 
            onClick={onRegisterClick}
            className="text-xs md:text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80 text-[#457b9d] cursor-pointer"
          >
            Register to vote
          </button>
        )}
        {onRegisterClick && onMailClick && (
          <span className="hidden sm:inline opacity-40 text-[#457b9d]">|</span>
        )}
        {onMailClick && (
          <button 
            onClick={onMailClick}
            className="text-xs md:text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80 text-[#457b9d] cursor-pointer"
          >
            Vote by Mail Guide
          </button>
        )}
      </div>
    </div>
  );
}
