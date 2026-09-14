import React, { useState, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { VoterInfo } from '../types';
import { IdAccordion } from './IdAccordion';
import { PollingPlaceCard } from './PollingPlaceCard';
import { BallotView } from './BallotView';
import { AddressLookup } from './AddressLookup';
import { RegisterToVote } from './RegisterToVote';
import { MailInBallot } from './MailInBallot';
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
  const isMailPage = location.pathname === '/mail';

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
      if (isRegisterPage || isMailPage) navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during lookup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showAlert && (
        <div className="w-full bg-[#457b9d] text-white py-2 px-2 md:px-4 flex justify-between items-center z-20 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider relative">
          <div className="flex-1 text-center pr-6 overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="font-black mr-1 md:mr-2">ELECTION ALERT:</span> 
            Oklahoma General Election is November 3, 2026!
          </div>
          <button onClick={() => setShowAlert(false)} className="opacity-80 hover:opacity-100 absolute right-2 md:right-4 font-black p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}
      <header className={`flex flex-col items-center justify-center px-4 md:px-8 shrink-0 shadow-md z-10 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'} gap-2.5 md:gap-3`} style={{ backgroundColor: '#1d3557', color: '#f1faee' }}>
        {/* Centered Logo on desktop and mobile */}
        <div className="w-full flex items-center justify-center">
          <Link to="/" onClick={() => { setVoterInfo(null); setError(null); }} className="flex items-center justify-center gap-3 transition-opacity hover:opacity-80 cursor-pointer mx-auto">
            <img src="/okdems_votes.png" alt="OKDEMS VOTES" className={`transition-all duration-300 ${isScrolled ? 'h-8 md:h-11' : 'h-10 md:h-14'} mx-auto`} onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
              }
            }} />
            <h1 className="text-2xl font-black tracking-tight uppercase hidden" style={{ fontFamily: 'var(--font-sans)', fontWeight: 900 }}>OKDEMS VOTES</h1>
          </Link>
        </div>

        {/* Navigation Tabs and Voter Greeting */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <nav className="flex items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/"
              onClick={() => { if (isRegisterPage || isMailPage) setError(null); }}
              className={`px-3 py-1.5 text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-200 border-2 ${
                location.pathname === '/' 
                  ? 'bg-[#457b9d] text-white border-[#457b9d] shadow-sm' 
                  : 'bg-transparent text-[#f1faee] border-transparent hover:border-[#a8dadc] hover:bg-white/10'
              }`}
            >
              On My Ballot
            </Link>
            <Link
              to="/register"
              className={`px-3 py-1.5 text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-200 border-2 ${
                isRegisterPage 
                  ? 'bg-[#457b9d] text-white border-[#457b9d] shadow-sm' 
                  : 'bg-transparent text-[#f1faee] border-transparent hover:border-[#a8dadc] hover:bg-white/10'
              }`}
            >
              Register
            </Link>
            <Link
              to="/mail"
              className={`px-3 py-1.5 text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-200 border-2 ${
                isMailPage 
                  ? 'bg-[#457b9d] text-white border-[#457b9d] shadow-sm' 
                  : 'bg-transparent text-[#f1faee] border-transparent hover:border-[#a8dadc] hover:bg-white/10'
              }`}
            >
              Vote by Mail
            </Link>
          </nav>

          {voterInfo && !isRegisterPage && !isMailPage && (
            <span className="text-xs md:text-sm font-black uppercase text-[#a8dadc] tracking-wide sm:ml-2">
              • Hey, {voterInfo.normalizedInput?.city || 'Oklahoma'} voter! :)
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto z-0 p-4 md:p-8 flex flex-col justify-between" onScroll={handleScroll}>
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pb-4">
          <Routes>
            <Route path="/" element={
              !voterInfo ? (
                <div className="w-full pt-4 md:pt-6">
                  <div className={isLoading ? "hidden" : "flex items-center justify-center"}>
                    <AddressLookup 
                      onLookup={handleLookup} 
                      isLoading={isLoading} 
                      error={error} 
                      onRegisterClick={() => navigate('/register')}
                      onMailClick={() => navigate('/mail')}
                    />
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
                  
                  <section className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t-2 border-[#1d3557]/20">
                    <button 
                      onClick={() => navigate('/register')}
                      className="px-5 py-3 border-2 border-[#457b9d] text-[#1d3557] bg-white font-black text-xs md:text-sm uppercase tracking-wider hover:bg-[#457b9d] hover:text-white transition-all shadow-sm"
                    >
                      Need to register? Register to vote →
                    </button>
                    <button 
                      onClick={() => navigate('/mail')}
                      className="px-5 py-3 border-2 border-[#1d3557] text-[#1d3557] bg-white font-black text-xs md:text-sm uppercase tracking-wider hover:bg-[#1d3557] hover:text-white transition-all shadow-sm"
                    >
                      Want to vote from home? Mail-in guide →
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
            <Route path="/mail" element={
              <div className="w-full pt-4 md:pt-8">
                <MailInBallot />
              </div>
            } />
          </Routes>
        </div>

        <footer className="w-full mt-auto py-6 px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest border-t border-[#a8dadc]/30" style={{ color: '#1d3557' }}>
          <span className="mb-4 md:mb-0 text-center md:text-left">Paid for and authorized by the Oklahoma Democratic Party © {new Date().getFullYear()}</span>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-0">
            <Link to="/register" className="hover:underline" style={{ color: '#457b9d' }}>Register to Vote</Link>
            <Link to="/mail" className="hover:underline" style={{ color: '#457b9d' }}>Vote by Mail</Link>
            <a href="mailto:digitools@okdemocrats.org" className="hover:underline" style={{ color: '#457b9d' }}>Report Issue</a>
            <a href="https://www.okdemocrats.org/Terms-Policies" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#457b9d' }}>Privacy Policy</a>
          </div>
          <span className="text-center md:text-right" style={{ color: '#457b9d' }}>An OKDEMS Digital Experience</span>
        </footer>
      </div>
    </>
  );
}
