import { ExternalLink, Calendar, UserCircle, CheckCircle2, ShieldCheck, Mail, Globe, GraduationCap, MapPin, Inbox, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function RegisterToVote() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const nextDeadline = new Date('2026-07-31T23:59:59');
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const timeDiff = nextDeadline.getTime() - new Date().getTime();
    setDaysRemaining(Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24))));
  }, []);

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto flex flex-col gap-12 pb-16"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="text-center flex flex-col gap-4">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase" style={{ color: '#1d3557' }}>
          Register to <br className="hidden md:block" /><span style={{ color: '#e63946' }}>Vote</span>
        </h2>
        <p className="text-lg md:text-2xl font-bold opacity-80 max-w-2xl mx-auto" style={{ color: '#457b9d' }}>
          Here is everything you need to know about registering to vote in Oklahoma.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* How to Register Section - Highlighted */}
        <motion.div variants={itemVariants} className="md:col-span-2 relative group overflow-hidden bg-white p-8 md:p-12 border-4 transition-all duration-300 hover:shadow-2xl" style={{ borderColor: '#1d3557' }}>
          <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: '#e63946' }}></div>
          
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8 flex items-center gap-4" style={{ color: '#1d3557' }}>
            <Globe className="w-10 h-10 md:w-12 md:h-12 text-[#e63946]" />
            How to Register
          </h3>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div className="flex-1">
              <p className="text-lg md:text-xl font-semibold mb-6" style={{ color: '#1d3557' }}>
                You can register to vote quickly using the OK Voter Portal or by mailing a paper form. Online registration is the fastest and easiest method.
              </p>
              
              <div className="flex flex-col gap-4">
                <a 
                  href="https://okvoterportal.okelections.gov/Home/RegWizard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full py-4 px-6 font-black text-white uppercase tracking-wider text-lg shadow-lg relative z-10 transition-all duration-300",
                    "group/btn overflow-hidden flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  )}
                  style={{ backgroundColor: '#1d3557' }}
                >
                  <span className={cn(
                    "absolute inset-0 border-4 transition-all duration-300 pointer-events-none opacity-0 ring-4 ring-[#e63946] ring-offset-2 ring-offset-white",
                    "group-hover/btn:opacity-100 group-hover/btn:animate-pulse"
                  )}></span>
                  Register Online Now
                  <ExternalLink className="w-6 h-6" />
                </a>
                
                <a 
                  href="https://oklahoma.gov/elections/voter-registration/register-to-vote.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 border-4 font-black uppercase tracking-wider text-lg text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 hover:bg-[#a8dadc]/20"
                  style={{ borderColor: '#1d3557', color: '#1d3557' }}
                >
                  Print Mail-in Form
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div className="flex-1 bg-[#f8fafc] p-6 border-2 flex flex-col" style={{ borderColor: '#a8dadc' }}>
              <h4 className="text-xl font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#1d3557' }}>
                <Calendar className="w-6 h-6 text-[#e63946]" />
                Upcoming Deadlines
              </h4>
              <div className="space-y-4 flex-1">
                <div className="p-3 bg-white border-2 flex justify-between items-center" style={{ borderColor: '#1d3557' }}>
                  <div>
                    <p className="font-black text-sm uppercase tracking-wider" style={{ color: '#e63946' }}>August 25 Elections</p>
                    <p className="font-bold" style={{ color: '#1d3557' }}>July 31, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: '#1d3557' }}>{daysRemaining}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: '#1d3557' }}>Days Left</p>
                  </div>
                </div>
                
                <div className="p-3 bg-white border-2 opacity-70" style={{ borderColor: '#a8dadc' }}>
                  <p className="font-black text-sm uppercase tracking-wider" style={{ color: '#1d3557' }}>November 3 Elections</p>
                  <p className="font-bold" style={{ color: '#1d3557' }}>October 9, 2026</p>
                </div>

                <p className="text-xs font-semibold opacity-80 mt-2" style={{ color: '#1d3557' }}>
                  If you mail your application, it must be postmarked by the deadline date.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Eligibility Section */}
        <motion.div variants={itemVariants} className="bg-white p-8 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group" style={{ borderColor: '#1d3557' }}>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 flex items-center gap-3 transition-colors group-hover:text-[#e63946]" style={{ color: '#1d3557' }}>
            <ShieldCheck className="w-8 h-8" />
            Eligibility
          </h3>
          <ul className="space-y-4 text-base md:text-lg font-semibold" style={{ color: '#1d3557' }}>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[#a8dadc] group-hover:text-[#e63946] transition-colors" />
              <span>You must be a citizen of the United States.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[#a8dadc] group-hover:text-[#e63946] transition-colors" />
              <span>You must be a resident of the State of Oklahoma.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[#a8dadc] group-hover:text-[#e63946] transition-colors" />
              <span>You must be 18 years old or older on or before the date of the next election.</span>
            </li>
          </ul>
        </motion.div>

        {/* Special Circumstances */}
        <motion.div variants={itemVariants} className="bg-white p-8 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group" style={{ borderColor: '#1d3557' }}>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 flex items-center gap-3 transition-colors group-hover:text-[#e63946]" style={{ color: '#1d3557' }}>
            <UserCircle className="w-8 h-8" />
            Special Cases
          </h3>
          <ul className="space-y-4 text-base md:text-lg font-semibold" style={{ color: '#1d3557' }}>
            <li className="flex items-start gap-3 opacity-90">
              <span className="w-6 h-6 shrink-0 mt-0.5 text-[#e63946] font-black flex items-center justify-center">!</span>
              <span>If you have been convicted of a felony, you may register to vote only after you have fully served your sentence of court-mandated calendar days.</span>
            </li>
            <li className="flex items-start gap-3 opacity-90">
              <span className="w-6 h-6 shrink-0 mt-0.5 text-[#e63946] font-black flex items-center justify-center">!</span>
              <span>Persons adjudged incapacitated by a court may not register to vote.</span>
            </li>
          </ul>
        </motion.div>
        
        {/* High School Students */}
        <motion.div variants={itemVariants} className="md:col-span-2 bg-[#fdf4e8] p-8 border-4 border-[#e63946] relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute -right-4 -top-4 opacity-10">
            <GraduationCap className="w-48 h-48" style={{ color: '#e63946' }} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 flex items-center gap-3" style={{ color: '#1d3557' }}>
              <GraduationCap className="w-8 h-8 text-[#e63946]" />
              High School Students
            </h3>
            <p className="text-lg font-bold mb-4" style={{ color: '#1d3557' }}>
              You can register to vote at 17 ½ if you turn 18 before the registration deadline!
            </p>
            <div className="inline-block bg-white border-2 p-4 mt-2" style={{ borderColor: '#1d3557' }}>
              <p className="font-semibold" style={{ color: '#1d3557' }}>
                For the July 31st deadline, you must have been born on or before <span className="font-black text-[#e63946]">July 31, 2008</span>.
              </p>
              <p className="text-sm font-semibold opacity-80 mt-1" style={{ color: '#1d3557' }}>
                This means your 17 ½ half-birthday was on or before <span className="font-bold">January 31, 2026</span>!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div variants={itemVariants} className="md:col-span-2 bg-white p-8 md:p-12 border-4 transition-all duration-300 hover:shadow-xl group" style={{ borderColor: '#1d3557' }}>
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-center flex items-center justify-center gap-4" style={{ color: '#1d3557' }}>
            <Clock className="w-10 h-10 text-[#a8dadc] group-hover:text-[#1d3557] transition-colors" />
            Next Steps After Registering
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 border-2 flex flex-col items-center gap-4 hover:-translate-y-1 transition-transform" style={{ borderColor: '#a8dadc', backgroundColor: '#f8fafc' }}>
              <Inbox className="w-12 h-12 text-[#e63946]" />
              <h4 className="text-lg font-black uppercase tracking-wider" style={{ color: '#1d3557' }}>Watch Your Mail</h4>
              <p className="font-semibold text-sm opacity-90" style={{ color: '#1d3557' }}>
                You will receive your Voter ID card in the mail within 30 days of registering.
              </p>
            </div>
            <Link to="/" className="p-6 border-2 flex flex-col items-center gap-4 hover:-translate-y-1 transition-transform group/link" style={{ borderColor: '#a8dadc', backgroundColor: '#f8fafc' }}>
              <MapPin className="w-12 h-12 text-[#e63946] group-hover/link:animate-bounce" />
              <h4 className="text-lg font-black uppercase tracking-wider" style={{ color: '#1d3557' }}>Find Polling Place</h4>
              <p className="font-semibold text-sm opacity-90" style={{ color: '#1d3557' }}>
                Use this portal to look up your assigned polling location before election day.
              </p>
            </Link>
            <a href="https://okvoterportal.okelections.gov/" target="_blank" rel="noopener noreferrer" className="p-6 border-2 flex flex-col items-center gap-4 hover:-translate-y-1 transition-transform group/link" style={{ borderColor: '#a8dadc', backgroundColor: '#f8fafc' }}>
              <CheckCircle2 className="w-12 h-12 text-[#e63946] group-hover/link:animate-bounce" />
              <h4 className="text-lg font-black uppercase tracking-wider" style={{ color: '#1d3557' }}>View Sample Ballot</h4>
              <p className="font-semibold text-sm opacity-90" style={{ color: '#1d3557' }}>
                Check your sample ballot ahead of time so you are ready to make your voice heard!
              </p>
            </a>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={itemVariants} className="md:col-span-2 text-center pb-8 pt-4">
          <p className="text-base font-bold opacity-70 max-w-4xl mx-auto" style={{ color: '#1d3557' }}>
            If you have any questions about registering to vote, casting your ballot, or anything else, contact the OKDEMS HQ at <a href="tel:405-427-3366" className="underline hover:text-[#e63946] transition-colors">405-427-3366</a>.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}

