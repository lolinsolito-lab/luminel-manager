import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Zap, Award } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Blocca Prezzo Founder",
    description: "Scegli il tuo piano e blocca il prezzo per sempre. Quando chiude, il prezzo raddoppia.",
    badge: "Offerta limitata",
    icon: <Lock size={18} className="text-[#fbbf24]" />,
    color: "#fbbf24"
  },
  {
    num: "02",
    title: "Setup in 47 Minuti",
    description: "Import clienti, configura orari, carica logo. Nessun corso. Nessun developer. Solo tu e Luminel.",
    badge: "Zero carta richiesta",
    icon: <Zap size={18} className="text-[#6FCF97]" />,
    color: "#6FCF97"
  },
  {
    num: "03",
    title: "Onboarding VIP con Michael",
    description: "Call 1:1 di 30 minuti. Setup personale. Accesso diretto al Founder. Solo per i primi 25.",
    badge: "Esclusivo Founder",
    icon: <Award size={18} className="text-[#a855f7]" />,
    color: "#a855f7"
  }
];

export const PlanVerticalStepper: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % steps.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="w-full max-w-lg rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl flex flex-col gap-3 relative">
      {steps.map((step, idx) => {
        const isActive = activeIndex === idx;
        
        return (
          <div 
            key={idx}
            onClick={() => {
              setActiveIndex(idx);
              setIsAutoPlaying(false);
            }}
            className={`
              cursor-pointer rounded-2xl border transition-all duration-500 overflow-hidden
              ${isActive ? 'bg-white/10 border-white/20 p-5' : 'bg-transparent border-transparent hover:bg-white/5 p-4'}
            `}
          >
            <div className="flex items-start gap-4">
              <div 
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${isActive ? 'bg-white/15 shadow-inner' : 'bg-white/5'}`}
              >
                {step.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-500">{step.num}</span>
                    <h3 className={`text-lg font-bold transition-colors duration-500 ${isActive ? 'text-white' : 'text-stone-400'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-stone-300 font-light leading-relaxed mt-2 mb-3">
                        {step.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}35`, color: step.color }}>
                        {step.badge}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-stone-400 font-medium">Setup completo in 47 minuti medi.<br/>Non ore. Non giorni. Minuti.</div>
          <div className="flex gap-2">
             <span className="inline-flex items-center gap-1.5 rounded-md bg-[#6FCF97]/15 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-wider text-[#6FCF97]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6FCF97]" /> Active
             </span>
             <span className="inline-flex items-center gap-1.5 rounded-md bg-[#fbbf24]/15 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-wider text-[#fbbf24]">
                Premium
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};
