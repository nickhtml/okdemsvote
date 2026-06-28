import { useState, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { VoterInfo } from '../types';
import { IdAccordion } from './IdAccordion';
import { PollingPlaceCard } from './PollingPlaceCard';
import { BallotView } from './BallotView';
import { AddressLookup } from './AddressLookup';
import { RegisterToVote } from './RegisterToVote';
import { LoadingSkeleton } from './LoadingSkeleton';

export function VoterPortal() {
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollTop = useRef(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    if (currentScrollTop > lastScrollTop.current && currentScrollTop > 20) {
      // Scrolling down
      setIsScrolled(true);
    } else if (currentScrollTop < lastScrollTop.current) {
      // Scrolling up
      setIsScrolled(false);
    }
    lastScrollTop.current = currentScrollTop;
  };

  const handleLookup = async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/voter-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve address');
      }
      if (data.error) {
        throw new Error(data.error);
      }
      setVoterInfo(data);
      // Ensure we are on the main page to see the results
      if (isRegisterPage) navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during lookup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showAlert && (
        <div className="w-full bg-[#e63946] text-white py-2 px-2 md:px-4 flex justify-between items-center z-20 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider relative">
          <div className="flex-1 text-center pr-6 overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="font-black mr-1 md:mr-2">ELECTION ALERT:</span> 
            Oklahoma Primary Runoff is August 25, 2026!
          </div>
          <button onClick={() => setShowAlert(false)} className="opacity-80 hover:opacity-100 absolute right-2 md:right-4 font-black p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}
      <header className={`flex flex-col md:flex-row items-center px-8 shrink-0 shadow-md z-10 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'} ${isRegisterPage ? 'justify-center' : 'justify-between'}`} style={{ backgroundColor: '#1d3557', color: '#f1faee' }}>
        <Link to="/" className={`flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer ${isRegisterPage ? 'mx-auto' : ''}`}>
          <img src="/okdems_votes.png" alt="OKDEMS VOTES" className={`transition-all duration-300 ${isScrolled ? 'h-8 md:h-12' : 'h-12 md:h-16'}`} onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }
          }} />
          <h1 className="text-2xl font-black tracking-tight uppercase hidden" style={{ fontFamily: 'var(--font-sans)', fontWeight: 900 }}>OKDEMS VOTES</h1>
        </Link>
        {!isRegisterPage && (
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            {voterInfo ? (
              <div className="text-right">
                <p className="text-lg md:text-xl font-black uppercase">
                  Hey, {voterInfo.normalizedInput?.city || 'Oklahoma'} voter! :)
                </p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm font-bold opacity-80 uppercase">Enter Address Below</p>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto z-0 p-4 md:p-8 flex flex-col justify-between" onScroll={handleScroll}>
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 pb-12">
          <Routes>
            <Route path="/" element={
              !voterInfo ? (
                <div className="w-full pt-4 md:pt-12">
                  <div className={isLoading ? "hidden" : "flex items-center justify-center"}>
                    <AddressLookup onLookup={handleLookup} isLoading={isLoading} error={error} onRegisterClick={() => navigate('/register')} />
                  </div>
                  {isLoading && (
                    <LoadingSkeleton />
                  )}
                </div>
              ) : (
                <>
                  <section className="w-full flex flex-col gap-4">
                    <PollingPlaceCard voterInfo={voterInfo} />
                  </section>
                  
                  <section className="w-full flex flex-col gap-4">
                    <BallotView voterInfo={voterInfo} />
                  </section>
                  
                  <section className="w-full flex flex-col items-center justify-center mt-8">
                    <button 
                      onClick={() => navigate('/register')}
                      className="text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
                      style={{ color: '#e63946' }}
                    >
                      Not registered to vote? Register today!
                    </button>
                  </section>
                </>
              )
            } />
            <Route path="/register" element={
              <div className="w-full pt-4 md:pt-8">
                <RegisterToVote />
              </div>
            } />
          </Routes>
        </div>

        <footer className="w-full mt-auto py-6 px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest border-t border-[#a8dadc]/30" style={{ color: '#1d3557' }}>
          <span className="mb-4 md:mb-0 text-center md:text-left">Paid for and authorized by the Oklahoma Democratic Party © {new Date().getFullYear()}</span>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-0">
            <a href="mailto:digitools@okdemocrats.org" className="hover:underline" style={{ color: '#457b9d' }}>Report Issue</a>
            <a href="https://www.okdemocrats.org/Terms-Policies" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#457b9d' }}>Privacy Policy</a>
          </div>
          <span className="text-center md:text-right" style={{ color: '#e63946' }}>An OKDEMS Digital Experience</span>
        </footer>
      </div>
    </>
  );
}
