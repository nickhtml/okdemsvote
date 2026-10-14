import React, { useState } from 'react';
import { motion } from 'motion/react';
import { STATE_QUESTIONS, StateQuestionItem } from '../data/statewide_measures';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export function StatewideMeasuresSection() {
  return (
    <div className="w-full flex flex-col gap-8 mt-4">
      {/* State Questions Section */}
      <section className="w-full flex flex-col shadow-lg border-4 border-[#e63946] bg-white">
        {/* Header */}
        <div className="px-4 py-3 bg-[#e63946] text-white flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1">
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-red-100 block">Statewide Ballot Measures</span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">State Questions</h3>
          </div>
          <div className="sm:text-right">
            <span className="inline-block bg-white text-[#e63946] px-2.5 py-1 text-xs md:text-sm font-black uppercase tracking-wider rounded-none">
              OKDEMS: VOTE NO ON BOTH
            </span>
          </div>
        </div>

        {/* Questions list */}
        <div className="flex flex-col divide-y-4 divide-[#e63946]/20">
          {STATE_QUESTIONS.map((item) => (
            <StateQuestionCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

const StateQuestionCard: React.FC<{ item: StateQuestionItem }> = ({ item }) => {
  const [showFullText, setShowFullText] = useState(false);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 transition-colors hover:bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200">
        <div>
          <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#1d3557]">
            {item.number}
          </h4>
        </div>
        <div className="self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e63946] text-white text-xs md:text-sm font-black uppercase tracking-wider shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> VOTE NO (AGAINST)
          </span>
        </div>
      </div>

      <div>
        <span className="text-xs font-black uppercase tracking-widest text-[#457b9d] block mb-1">
          Topic: {item.topic}
        </span>
        <p className="text-sm md:text-base text-slate-800 font-semibold leading-relaxed">
          {item.summary}
        </p>
      </div>

      {/* Official Question Box */}
      <div className="p-3.5 bg-slate-50 border-2 border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
        <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-1">
          Shall the proposed measure be approved?
        </p>
        <p>{item.question}</p>
      </div>

      {/* Recommended Ballot Vote Mark Box */}
      <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-50/60 border-2 border-[#e63946]/30">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-black uppercase text-[#e63946]">
            Democratic Party Recommendation:
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* YES choice (Unfilled) */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-2 border-slate-300 opacity-60">
            <span className="text-xs font-black uppercase text-slate-500">FOR THE PROPOSAL - YES</span>
            <div className="w-8 h-5 border-2 border-slate-300 bg-white"></div>
          </div>

          {/* NO choice (Recommended & Filled) */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-3 border-[#e63946] bg-red-100/70 shadow-sm">
            <div className="text-right">
              <span className="text-xs md:text-sm font-black uppercase text-[#e63946] block">
                AGAINST THE PROPOSAL - NO
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700">
                ★ OKDEMS Recommended Vote
              </span>
            </div>
            {/* Animated Ballot Mark Box */}
            <div className="shrink-0 w-12 h-6 md:w-14 md:h-7 rounded-none border-4 border-[#e63946] relative overflow-hidden bg-white flex items-center justify-center text-[#e63946]">
              <motion.svg
                className="absolute inset-0 w-full h-full opacity-90"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-10%' }}
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
                    visible: { pathLength: 1, transition: { duration: 0.8, ease: 'easeOut' } }
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
                    visible: { pathLength: 1, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } }
                  }}
                />
              </motion.svg>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion for Full Ballot Text */}
      <div className="pt-1">
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="text-xs font-black uppercase tracking-wider text-[#457b9d] hover:text-[#1d3557] flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>{showFullText ? 'Hide' : 'Read'} Full Official Ballot Text</span>
          {showFullText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFullText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3.5 bg-slate-50 border-2 border-slate-200 text-xs font-medium text-slate-700 leading-relaxed max-h-72 overflow-y-auto"
          >
            <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-1">
              Official Text from Oklahoma State Election Board:
            </p>
            {item.fullText}
          </motion.div>
        )}
      </div>
    </div>
  );
};
