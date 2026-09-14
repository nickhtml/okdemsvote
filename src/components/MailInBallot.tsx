import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Mail, FileText, CheckCircle2, AlertTriangle, Stamp, Clock, ShieldCheck, HelpCircle, Send, MapPin, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function MailInBallot() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  // Request deadline: Monday, Oct 19, 2026 at 5:00 PM (15 days before Nov 3)
  const requestDeadline = new Date('2026-10-19T17:00:00');
  // Election day deadline for mail receipt: Tuesday, Nov 3, 2026 at 7:00 PM
  const returnDeadline = new Date('2026-11-03T19:00:00');

  const [daysToRequest, setDaysToRequest] = useState(0);
  const [daysToReturn, setDaysToReturn] = useState(0);
  const [exceptionsOpen, setExceptionsOpen] = useState(false);
  const [activeExceptionRule, setActiveExceptionRule] = useState<number | null>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date().getTime();
    const diffReq = requestDeadline.getTime() - now;
    const diffRet = returnDeadline.getTime() - now;
    setDaysToRequest(Math.max(0, Math.ceil(diffReq / (1000 * 3600 * 24))));
    setDaysToReturn(Math.max(0, Math.ceil(diffRet / (1000 * 3600 * 24))));
  }, []);

  const specialRules = [
    {
      title: "Physically Incapacitated Voters & Caregivers",
      badge: "Two-Witness Rule • No Notary",
      icon: <CheckCircle2 className="w-5 h-5 text-[#457b9d] shrink-0" />,
      content: (
        <div className="space-y-2">
          <p>
            If you are physically incapacitated, or if you care for someone who is incapacitated and cannot be left unattended, your ballot affidavit requires the <strong>signatures of two witnesses</strong> instead of a notary stamp.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li><strong>Witnesses:</strong> Any two adult individuals can sign as your witnesses.</li>
            <li><strong>Annual Ballot Request:</strong> You can check the box on your application to automatically receive absentee ballots for <em>all elections</em> in the calendar year.</li>
            <li><strong>Delivery:</strong> Incapacitated voters may have an authorized agent hand-deliver their voted ballot to the County Election Board.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Military & Overseas Citizens (UOCAVA)",
      badge: "No Notary • Electronic Delivery",
      icon: <ShieldCheck className="w-5 h-5 text-[#457b9d] shrink-0" />,
      content: (
        <div className="space-y-2">
          <p>
            Uniformed service members on active duty, their eligible spouses and dependents, and U.S. citizens residing outside the United States vote under the <strong>Uniformed and Overseas Citizens Absentee Voting Act (UOCAVA)</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li><strong>No Notarization:</strong> Affidavits only require the voter's own signature under penalty of perjury.</li>
            <li><strong>Application:</strong> Submit a <strong>Federal Post Card Application (FPCA)</strong> via FVAP.gov or through the OK Voter Portal.</li>
            <li><strong>Fast Delivery:</strong> Ballots can be transmitted electronically (via email/portal) to ensure sufficient time to vote and return.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Emergency Medical Incapacitation",
      badge: "Agent Allowed • Up to Election Day",
      icon: <Clock className="w-5 h-5 text-[#457b9d] shrink-0" />,
      content: (
        <div className="space-y-2">
          <p>
            If you become hospitalized or confined to bed due to a physical illness or accident occurring <strong>after 5:00 PM on October 19, 2026</strong> (the standard request deadline), you can still vote using an Emergency Absentee Ballot.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li><strong>Deadline:</strong> Requests can be submitted up until <strong>7:00 PM on Election Day</strong> (November 3, 2026).</li>
            <li><strong>Authorized Agent:</strong> An authorized agent (friend, neighbor, or family member over 18) may deliver your application, retrieve your ballot from the County Election Board, and return it.</li>
            <li><strong>Two Witnesses:</strong> Requires signatures from your attending physician or medical facility and two witnesses (no notary required).</li>
          </ul>
        </div>
      )
    },
    {
      title: "College Students Living Away from Home",
      badge: "Campus / Dorm Delivery",
      icon: <MapPin className="w-5 h-5 text-[#457b9d] shrink-0" />,
      content: (
        <div className="space-y-2">
          <p>
            Oklahoma college and university students living on campus or attending school out-of-town can keep their Oklahoma voter registration at their home address and request their ballot be mailed to their dorm or student apartment.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li><strong>Delivery Address:</strong> Specify your campus address or out-of-state address when requesting the ballot online or on the paper form.</li>
            <li><strong>Notary Requirement:</strong> Standard absentee rules apply. Most university student unions, financial aid offices, and campus banks provide free notary services for student ballots.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Nursing Home & Care Facility Residents",
      badge: "Absentee Voting Board Visit",
      icon: <UserCheck className="w-5 h-5 text-[#457b9d] shrink-0" />,
      content: (
        <div className="space-y-2">
          <p>
            Voters confined to a nursing home or veterans center in the county where they are registered can request that their ballot be hand-delivered and administered by a special <strong>Absentee Voting Board</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li><strong>Bipartisan Team:</strong> Two election officials representing both political parties visit the facility before Election Day.</li>
            <li><strong>In-Person Assistance:</strong> They deliver your ballot, provide private assistance if requested, and legally witness your signature.</li>
          </ul>
        </div>
      )
    }
  ];

  const faqs = [
    {
      q: "Do I need an excuse or special reason to vote by mail?",
      a: "No! Oklahoma is a 'no-excuse' absentee voting state. Any registered Oklahoma voter can request an absentee ballot to vote by mail for any reason."
    },
    {
      q: "Does my ballot have to be notarized?",
      a: "Yes, for standard absentee ballots. State law requires standard absentee affidavits to be notarized before being submitted. By Oklahoma law, Notaries Public are legally prohibited from charging a fee to notarize an absentee ballot affidavit! You can find free notarization at banks, credit unions, tag agencies, libraries, and county election boards."
    },
    {
      q: "Who does NOT need a notary?",
      a: "Voters who are physically incapacitated, or caregivers caring for someone who is incapacitated, only need the signatures of two witnesses (no notary required). Deployed military and overseas voters (UOCAVA) only need their own signature."
    },
    {
      q: "What is Oklahoma's 'no cure' rule?",
      a: "Oklahoma law does NOT allow voters to correct or 'cure' errors after submitting an absentee ballot. If you forget to have it notarized, forget to sign the affidavit, or miss the receipt deadline, election officials cannot count your ballot. Double-check all seals, signatures, and notary stamps before sending!"
    },
    {
      q: "Can I hand-deliver my mail-in ballot instead of mailing it?",
      a: "Yes, but with strict rules: You must personally deliver your own ballot to your County Election Board before the close of business on the day BEFORE Election Day (Monday, November 2, 2026). You must show a valid photo ID. You cannot drop it off on Election Day, and you cannot have a friend or family member hand-deliver it for you unless you are an incapacitated voter utilizing an authorized agent."
    },
    {
      q: "Can I track my ballot once I mail it?",
      a: "Yes! Use the official Oklahoma Voter Portal (okvoterportal.okelections.gov) to track the status of your request, verify when your ballot was mailed out to you, and see when your voted ballot is received back by the County Election Board."
    }
  ];

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto flex flex-col gap-10 pb-16"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center flex flex-col gap-3">
        <div className="inline-flex items-center justify-center gap-2 self-center px-4 py-1.5 bg-[#457b9d]/10 border-2 border-[#457b9d] text-[#1d3557] text-xs md:text-sm font-black uppercase tracking-wider">
          <Mail className="w-4 h-4 text-[#457b9d]" />
          Oklahoma Absentee Voting Guide
        </div>
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase" style={{ color: '#1d3557' }}>
          Vote by <span style={{ color: '#457b9d' }}>Mail</span>
        </h2>
        <p className="text-base md:text-xl font-bold opacity-85 max-w-2xl mx-auto" style={{ color: '#457b9d' }}>
          Every registered Oklahoma voter is eligible to vote by mail. Here is everything you need to know to request, complete, and return your ballot for November 3, 2026.
        </p>
      </motion.div>

      {/* Action Buttons & Fast Links */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a 
          href="https://okvoterportal.okelections.gov/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-5 bg-[#1d3557] text-white flex flex-col items-center text-center justify-between gap-3 border-2 border-[#1d3557] transition-all duration-300 hover:bg-[#457b9d] hover:border-[#457b9d] hover:scale-[1.02] shadow-md"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
            <ExternalLink className="w-6 h-6 text-[#a8dadc]" />
          </div>
          <div>
            <h4 className="font-black text-base md:text-lg uppercase tracking-tight">Request Online</h4>
            <p className="text-xs font-semibold opacity-80 mt-1">Fastest way via OK Voter Portal</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#a8dadc] flex items-center gap-1">
            Apply Now <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </a>

        <a 
          href="https://oklahoma.gov/elections/voters/absentee-voting.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-5 bg-white text-[#1d3557] flex flex-col items-center text-center justify-between gap-3 border-4 border-[#1d3557] transition-all duration-300 hover:bg-[#f8fafc] hover:scale-[1.02] shadow-md"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-[#457b9d]/10 rounded-full">
            <FileText className="w-6 h-6 text-[#457b9d]" />
          </div>
          <div>
            <h4 className="font-black text-base md:text-lg uppercase tracking-tight">Paper Form</h4>
            <p className="text-xs font-semibold opacity-80 mt-1">Print & mail application to county</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#457b9d] flex items-center gap-1">
            Download PDF <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </a>

        <a 
          href="https://okvoterportal.okelections.gov/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-5 bg-white text-[#1d3557] flex flex-col items-center text-center justify-between gap-3 border-4 border-[#1d3557] transition-all duration-300 hover:bg-[#f8fafc] hover:scale-[1.02] shadow-md"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-[#457b9d]/10 rounded-full">
            <UserCheck className="w-6 h-6 text-[#457b9d]" />
          </div>
          <div>
            <h4 className="font-black text-base md:text-lg uppercase tracking-tight">Track Ballot</h4>
            <p className="text-xs font-semibold opacity-80 mt-1">Check request & delivery status</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#457b9d] flex items-center gap-1">
            Track Status <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </a>
      </motion.div>

      {/* Critical Deadlines Box */}
      <motion.div variants={itemVariants} className="bg-white border-4 border-[#1d3557] p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-[#457b9d]"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#1d3557] flex items-center gap-3">
              <Calendar className="w-7 h-7 md:w-9 md:h-9 text-[#457b9d]" />
              Mail-In Deadlines
            </h3>
            <p className="text-sm font-bold text-[#457b9d] mt-1 uppercase">
              November 3, 2026 General Election
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deadline 1 */}
          <div className="p-4 border-2 border-[#1d3557] bg-[#f8fafc] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#457b9d] text-white">
                  Step 1: Request
                </span>
                <span className="text-xs font-black text-[#1d3557]">{daysToRequest} Days Left</span>
              </div>
              <p className="text-xl font-black text-[#1d3557]">Oct. 19, 2026</p>
              <p className="text-xs font-bold text-[#457b9d] uppercase">5:00 PM Deadline</p>
              <p className="text-xs font-semibold text-slate-700 mt-2">
                Your request must be submitted online or received by your County Election Board by 5:00 PM.
              </p>
            </div>
          </div>

          {/* Deadline 2 */}
          <div className="p-4 border-2 border-[#1d3557] bg-[#f8fafc] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#1d3557] text-white">
                  Hand-Delivery
                </span>
                <span className="text-xs font-bold text-slate-500">Day Before</span>
              </div>
              <p className="text-xl font-black text-[#1d3557]">Nov. 2, 2026</p>
              <p className="text-xs font-bold text-[#457b9d] uppercase">Close of Business</p>
              <p className="text-xs font-semibold text-slate-700 mt-2">
                Hand-delivered ballots must be brought personally by the voter to their County Election Board with ID before election day.
              </p>
            </div>
          </div>

          {/* Deadline 3 */}
          <div className="p-4 border-2 border-[#1d3557] bg-[#f8fafc] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#e63946] text-white">
                  Step 2: Return By Mail
                </span>
                <span className="text-xs font-black text-[#1d3557]">{daysToReturn} Days Left</span>
              </div>
              <p className="text-xl font-black text-[#1d3557]">Nov. 3, 2026</p>
              <p className="text-xs font-bold text-[#457b9d] uppercase">7:00 PM Receipt</p>
              <p className="text-xs font-semibold text-slate-700 mt-2">
                Ballot must be <span className="font-bold underline">received</span> by your County Election Board by 7 PM. Postmarks do not count!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-amber-900 leading-relaxed">
            <span className="uppercase font-black">Mail Your Ballot Early:</span> The USPS recommends mailing your completed absentee ballot at least <span className="underline">7 to 10 days</span> prior to Election Day (by October 26) to ensure it reaches your County Election Board before 7:00 PM on November 3!
          </p>
        </div>
      </motion.div>

      {/* Step-by-Step Instructions */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6">
        <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#1d3557]">
          How to Vote by Mail: Step-by-Step
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-white border-4 border-[#1d3557] relative flex flex-col gap-3">
            <div className="w-10 h-10 bg-[#1d3557] text-white font-black text-xl flex items-center justify-center">
              1
            </div>
            <h4 className="text-xl font-black uppercase text-[#1d3557]">Request Your Ballot</h4>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              Submit your request through the <a href="https://okvoterportal.okelections.gov/" target="_blank" rel="noopener noreferrer" className="text-[#457b9d] underline font-bold">OK Voter Portal</a> or mail a paper application to your County Election Board. The deadline is <strong>Monday, October 19, 2026 at 5:00 PM</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white border-4 border-[#1d3557] relative flex flex-col gap-3">
            <div className="w-10 h-10 bg-[#1d3557] text-white font-black text-xl flex items-center justify-center">
              2
            </div>
            <h4 className="text-xl font-black uppercase text-[#1d3557]">Receive Your Packet</h4>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              Your county will mail you an absentee packet containing:
            </p>
            <ul className="text-xs font-bold space-y-1.5 text-[#1d3557]">
              <li className="flex items-center gap-2">✓ Your official general election ballot</li>
              <li className="flex items-center gap-2">✓ Plain secrecy envelope (inner envelope)</li>
              <li className="flex items-center gap-2">✓ Affidavit envelope (must be signed & notarized)</li>
              <li className="flex items-center gap-2">✓ Outer mailing return envelope</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white border-4 border-[#1d3557] relative flex flex-col gap-3">
            <div className="w-10 h-10 bg-[#1d3557] text-white font-black text-xl flex items-center justify-center">
              3
            </div>
            <h4 className="text-xl font-black uppercase text-[#1d3557]">Mark & Seal Your Ballot</h4>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              Fill in the box next to your candidate of choice using blue or black ink. Insert your ballot into the <strong>plain secrecy envelope</strong> and seal it completely.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 bg-white border-4 border-[#1d3557] relative flex flex-col gap-3">
            <div className="w-10 h-10 bg-[#1d3557] text-white font-black text-xl flex items-center justify-center">
              4
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-black uppercase text-[#1d3557]">Affidavit & Free Notary</h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-600 text-white">Crucial</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              Put the sealed secrecy envelope inside the <strong>Affidavit envelope</strong>. Sign your affidavit in front of a <strong>Notary Public</strong>.
            </p>
            <div className="p-3 bg-[#f0f4f8] border border-[#a8dadc] text-xs font-bold text-[#1d3557]">
              <Stamp className="w-4 h-4 inline-block mr-1.5 text-[#457b9d]" />
              <strong>By Oklahoma law, Notaries cannot charge you</strong> for notarizing an absentee ballot affidavit! Free notaries are available at banks, credit unions, tag agencies, and libraries.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Critical Warning: No Cure Law */}
      <motion.div variants={itemVariants} className="p-6 md:p-8 bg-[#1d3557] text-white border-4 border-[#1d3557] shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-none flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-2">
              Important: Oklahoma Has No Ballot Cure Process
            </h4>
            <p className="text-xs md:text-sm font-medium leading-relaxed opacity-95">
              Unlike some states, Oklahoma election law does <strong>NOT</strong> provide a procedure to fix or "cure" a rejected absentee ballot once submitted. If you forget to have your affidavit notarized, omit your signature, or return it after 7:00 PM on November 3, your ballot <strong>cannot be counted</strong> and you cannot fix it afterwards. Please take your time and follow every instruction packet step to guarantee your vote is counted!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Exceptions & Special Rules Accordion Menu */}
      <motion.div variants={itemVariants} className="w-full flex flex-col overflow-hidden bg-white border-4 border-[#1d3557]">
        <button 
          onClick={() => setExceptionsOpen(!exceptionsOpen)}
          className="p-4 md:p-5 flex items-center justify-between focus:outline-none transition-colors cursor-pointer"
          style={{ 
            backgroundColor: exceptionsOpen ? '#1d3557' : 'transparent', 
            color: exceptionsOpen ? '#ffffff' : '#1d3557' 
          }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-6 h-6 md:w-7 md:h-7 shrink-0 ${exceptionsOpen ? 'text-[#a8dadc]' : 'text-[#457b9d]'}`} />
            <div className="text-left">
              <h3 className="text-sm md:text-base font-black uppercase tracking-widest leading-tight">
                Exceptions & Special Rules
              </h3>
              <p className={`text-[11px] md:text-xs font-bold uppercase tracking-wider mt-0.5 ${exceptionsOpen ? 'text-[#a8dadc]' : 'text-slate-500'}`}>
                Incapacitated, Military, Overseas, Students & Care Facilities
              </p>
            </div>
          </div>
          <span className="text-xl md:text-2xl font-bold shrink-0">{exceptionsOpen ? '−' : '+'}</span>
        </button>

        {exceptionsOpen && (
          <div className="p-4 md:p-6 flex flex-col gap-3 bg-[#f8fafc] border-t-4 border-[#1d3557] animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed pb-2 border-b border-slate-200">
              Certain voters qualify for special absentee balloting procedures, simplified affidavit verification, or expedited electronic delivery under Oklahoma statute:
            </p>

            <div className="flex flex-col gap-2.5">
              {specialRules.map((rule, idx) => {
                const isExpanded = activeExceptionRule === idx;
                return (
                  <div key={idx} className="border-2 border-[#1d3557] bg-white transition-colors overflow-hidden">
                    <button
                      onClick={() => setActiveExceptionRule(isExpanded ? null : idx)}
                      className="w-full p-3.5 md:p-4 text-left flex items-center justify-between gap-3 font-black text-xs md:text-sm uppercase text-[#1d3557] focus:outline-none hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {rule.icon}
                        <span>{rule.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase bg-[#457b9d]/10 text-[#1d3557] border border-[#457b9d]/30">
                          {rule.badge}
                        </span>
                        <span className="text-lg font-bold text-[#457b9d]">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 text-xs md:text-sm font-semibold text-slate-700 leading-relaxed border-t border-slate-200 bg-white">
                        <div className="sm:hidden mb-2">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase bg-[#457b9d]/10 text-[#1d3557] border border-[#457b9d]/30">
                            {rule.badge}
                          </span>
                        </div>
                        {rule.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Frequently Asked Questions */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#1d3557] flex items-center gap-3">
          <HelpCircle className="w-7 h-7 md:w-8 md:h-8 text-[#457b9d]" />
          Frequently Asked Questions
        </h3>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-2 border-[#1d3557] bg-white transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-black text-sm md:text-base uppercase text-[#1d3557] focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className="text-xl font-bold shrink-0 text-[#457b9d]">
                  {activeFaq === index ? '−' : '+'}
                </span>
              </button>
              {activeFaq === index && (
                <div className="px-4 pb-4 pt-1 text-xs md:text-sm font-semibold text-slate-700 leading-relaxed border-t border-slate-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Navigation CTA */}
      <motion.div variants={itemVariants} className="pt-6 border-t-2 border-[#1d3557]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link 
          to="/"
          className="text-sm font-black uppercase tracking-wider text-[#1d3557] hover:text-[#457b9d] transition-colors flex items-center gap-2"
        >
          ← Back to Polling Place & Ballot Lookup
        </Link>
        <Link 
          to="/register"
          className="text-sm font-black uppercase tracking-wider text-[#457b9d] hover:text-[#1d3557] transition-colors flex items-center gap-2"
        >
          Not registered yet? Register here →
        </Link>
      </motion.div>
    </motion.div>
  );
}
