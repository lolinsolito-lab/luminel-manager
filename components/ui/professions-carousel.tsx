import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Users } from 'lucide-react';

const CATEGORIES = [
  {
    name: "Coach & Personal Trainer",
    status: "live",
    fomo: "12 posti rimasti",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
    desc: "Sessioni, obiettivi, no-show gestiti in automatico."
  },
  {
    name: "Operatori Olistici",
    status: "live",
    fomo: "9 posti rimasti",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop",
    desc: "Rituali, massaggi e appuntamenti su misura."
  },
  {
    name: "Saloni & Estetica",
    status: "soon",
    fomo: "Lista d'attesa",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop",
    desc: "Fatturazione italiana e slot intelligenti. In arrivo."
  },
  {
    name: "Studi Tattoo",
    status: "soon",
    fomo: "Lista d'attesa",
    img: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800&auto=format&fit=crop",
    desc: "Consensi informati digitali e acconti sicuri."
  },
  {
    name: "Psicologi",
    status: "soon",
    fomo: "Lista d'attesa",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop",
    desc: "Privacy assoluta e note cliniche cifrate."
  }
];

// Duplicate for continuous scrolling
const SCROLL_ITEMS = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

export const ProfessionsCarousel: React.FC = () => {
  return (
    <section className="w-full py-20 overflow-hidden relative border-t border-white/5">
      {/* Glow Sfondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#fbbf24] blur-[200px] opacity-[0.05] rounded-full pointer-events-none" />

      <div className="max-w-[70rem] mx-auto px-6 text-center mb-14 relative z-10">
        <h2 className="font-sans font-medium text-[2.8rem] md:text-[4.2rem] leading-[1.05] tracking-tight text-white mb-6">
          Progettato per chi guida le <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">persone</span>.<br />
          Non per chi batte scontrini
        </h2>
        
        <p className="text-stone-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-8">
          Il tuo settore sta chiudendo i posti Founder. Unisciti agli oltre 150 professionisti del benessere che hanno già abbandonato Excel per sempre.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link to="/auth/register" style={{ background: 'linear-gradient(90deg, rgba(240,232,210,1), #f0d080)', color: '#050504' }} className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[0.85rem] font-bold tracking-widest uppercase transition-transform hover:scale-105 shadow-[0_0_20px_rgba(240,232,210,0.15)]">
            Blocca il Tuo Posto <ArrowRight size={16} />
          </Link>
          <a href="#prezzi" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 text-white px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10">
            Scopri le Categorie
          </a>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 text-stone-400 text-sm">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-[#0A0D0B]" alt="User" />
            ))}
          </div>
          <span>Unisciti a 150+ professionisti</span>
        </div>
      </div>

      {/* Marquee Scrolling from Left to Right */}
      <div className="relative w-full overflow-hidden mt-12 pb-8">
        <motion.div 
          className="flex gap-6 pl-6"
          initial={{ x: "-50%" }}
          animate={{ x: "0%" }}
          transition={{ 
            ease: "linear",
            duration: 40,
            repeat: Infinity,
          }}
          style={{ width: "fit-content" }}
        >
          {SCROLL_ITEMS.map((cat, idx) => (
            <div 
              key={idx} 
              className="relative shrink-0 w-[260px] md:w-[320px] h-[380px] md:h-[440px] rounded-[2rem] overflow-hidden group border border-white/10 bg-stone-900"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{cat.name}</h3>
                  {cat.status === 'live' ? (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#6FCF97] shadow-[0_0_10px_#6FCF97]" />
                  ) : (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-stone-500" />
                  )}
                </div>
                
                <p className="text-sm text-stone-300 font-light leading-relaxed">
                  {cat.desc}
                </p>
                
                <div className="mt-2 inline-flex items-center w-max gap-1.5 rounded-md px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider" style={{
                  backgroundColor: cat.status === 'live' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                  border: cat.status === 'live' ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: cat.status === 'live' ? '#fbbf24' : '#a8a29e'
                }}>
                  {cat.fomo}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Gradients to fade edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#050504] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#050504] to-transparent pointer-events-none" />
      </div>
    </section>
  );
};
