import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, XOctagon, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const FailureAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);
  
  const options = [
    {
      title: "ADESSO",
      description: "Sei incasinato tra WhatsApp, email, pec e chiamate perse. Clienti che chiedono orari mentre tu stai lavorando. Zero respiro.",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
      icon: <Smartphone size={20} className="text-[#fcd34d]" />,
      color: "#fcd34d" // amber-300
    },
    {
      title: "TRA 6 MESI",
      description: "Ancora 4 ore/giorno perse su Excel. Clienti ignorati su WhatsApp. Il weekend è diventato il tuo ufficio.",
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=2070&auto=format&fit=crop",
      icon: <Clock size={20} className="text-[#f59e0b]" />,
      color: "#f59e0b" // amber-500
    },
    {
      title: "TRA 1 ANNO",
      description: "1.460 ore buttate = 60 giorni pieni. €15.000+ persi in inefficienza. Inizi a pensare: \"Forse ho sbagliato carriera\".",
      image: "https://images.unsplash.com/photo-1494253109108-2e30c049369b?q=80&w=2070&auto=format&fit=crop",
      icon: <AlertTriangle size={20} className="text-[#ea580c]" />,
      color: "#ea580c" // orange-600
    },
    {
      title: "TRA 2 ANNI",
      description: "Burnout totale. Chiudi il business per tornare dipendente, pensando in silenzio: \"Dovevo provare quel gestionale...\".",
      image: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=2070&auto=format&fit=crop",
      icon: <XOctagon size={20} className="text-[#dc2626]" />,
      color: "#dc2626" // red-600
    }
  ];

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setIsAutoPlaying(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % options.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, options.length]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 200 * i);
      timers.push(timer);
    });
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [options.length]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full font-sans text-white pb-10"> 
      {/* Header Section */}
      <div className="w-full max-w-2xl px-6 mt-8 mb-10 text-center">
        <h2 className="font-serif text-white mb-3" style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: 300 }}>
          E se non fai <span className="italic" style={{ color: '#ef4444' }}>nulla?</span>
        </h2>
      </div>

      {/* Options Container */}
      <div className="flex w-full max-w-[900px] min-w-[300px] h-[480px] mx-auto items-stretch overflow-hidden relative rounded-2xl md:rounded-[2.5rem] p-2 bg-[#050504] border border-white/5">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              relative flex flex-col justify-end overflow-hidden transition-all duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)]
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'cover' : 'auto 150%',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(40px)',
              minWidth: '70px',
              margin: '0.2rem',
              borderRadius: '2rem',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? option.color : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              backgroundColor: '#0a0a09',
              boxShadow: activeIndex === index 
                ? `0 20px 60px ${option.color}40` 
                : '0 10px 30px rgba(0,0,0,0.30)',
              flex: activeIndex === index ? '6 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Dark overlay with slight red tint */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none mix-blend-overlay" style={{ background: `linear-gradient(to top, ${option.color}20, transparent)` }} />
            
            {/* Gradient Shadow Overlay */}
            <div 
              className="absolute left-0 right-0 bottom-0 pointer-events-none transition-all duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                height: '70%',
                background: activeIndex === index 
                  ? 'linear-gradient(to top, rgba(5,5,4,0.98) 0%, rgba(5,5,4,0.85) 40%, transparent 100%)' 
                  : 'linear-gradient(to top, rgba(5,5,4,0.9) 0%, transparent 100%)',
                opacity: activeIndex === index ? 1 : 0.7
              }}
            />
            
            {/* Label with icon and info */}
            <div className="absolute left-0 right-0 bottom-6 flex flex-col md:flex-row items-start md:items-center justify-start z-20 pointer-events-none px-6 gap-4 w-full">
              <div 
                className="flex items-center justify-center rounded-full bg-black/80 backdrop-blur-md shadow-2xl flex-shrink-0 transition-all duration-500 ease-out border"
                style={{
                  width: activeIndex === index ? '54px' : '44px',
                  height: activeIndex === index ? '54px' : '44px',
                  borderColor: option.color
                }}
              >
                {option.icon}
              </div>
              
              <div 
                className="flex-1 transition-all duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden"
                style={{
                  opacity: activeIndex === index ? 1 : 0,
                  transform: activeIndex === index ? 'translateX(0)' : 'translateX(-20px)',
                  maxWidth: activeIndex === index ? '100%' : '0px',
                  maxHeight: activeIndex === index ? '200px' : '0px',
                }}
              >
                <div className="font-serif font-bold text-2xl mb-2 whitespace-nowrap" style={{ color: option.color }}>
                  {option.title}
                </div>
                <div className="text-[0.95rem] text-stone-300 leading-relaxed font-light md:w-3/4">
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FailureAccordion;
