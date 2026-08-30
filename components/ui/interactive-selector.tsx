import React, { useState, useEffect } from 'react';
import { Tablet, Bot, Calculator, Wine } from 'lucide-react';
import { motion } from 'framer-motion';

const InteractiveSelector = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);
  
  const options = [
    {
      title: "ORE 09:12",
      description: "Dashboard ti mostra: 3 sessioni oggi (già confermate via WhatsApp auto), €2,340 incassati questa settimana, 2 clienti compleanni.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
      icon: <Tablet size={20} className="text-[#c8b996]" />
    },
    {
      title: "ORE 09:15",
      description: "Cliente scrive \"Voglio sessione\". Tu premi \"Proponi Slot\". AI controlla il calendario, propone 3 orari. Tempo totale: 11 secondi. Senza te.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
      icon: <Bot size={20} className="text-[#c8b996]" />
    },
    {
      title: "ORE 19:00",
      description: "Chiudi laptop. Fatturato giorno: €780. Tempo su gestionale: 19 minuti. Tempo con clienti: 5 ore. Tutto sotto controllo.",
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop",
      icon: <Calculator size={20} className="text-[#c8b996]" />
    },
    {
      title: "ORE 21:30",
      description: "La sera non è più \"recupero da burnout\". È cena con famiglia. È Netflix senza sensi colpa. È TU che vivi, non solo lavori.",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop",
      icon: <Wine size={20} className="text-[#c8b996]" />
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
      }, 4500); // Change image every 4.5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, options.length]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [options.length]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full font-sans text-white pb-10"> 
      <style>{`
        @keyframes fadeInFromTop {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInTop {
          opacity: 0;
          transform: translateY(-20px);
          animation: fadeInFromTop 0.8s ease-in-out forwards;
        }
        .delay-300 { animation-delay: 0.3s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>

      {/* Header Section */}
      <div className="w-full max-w-2xl px-6 mt-8 mb-10 text-center">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] font-bold text-[#c8b996] block mb-6 animate-fadeInTop delay-300">
          Il Futuro
        </span>
        <h2 className="font-serif text-clamp-title font-light text-white mb-3 animate-fadeInTop delay-600" style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)' }}>
          Immagina Domattina.
        </h2>
      </div>

      {/* Options Container */}
      <div className="flex w-full max-w-[1000px] min-w-[300px] h-[550px] mx-auto items-stretch overflow-hidden relative rounded-2xl md:rounded-[2.5rem] p-2 bg-[#050504] border border-white/5">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              relative flex flex-col justify-end overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'cover' : 'auto 150%',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '70px',
              margin: '0.2rem',
              borderRadius: '2rem',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? 'rgba(200,185,150,0.4)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              backgroundColor: '#0a0a09',
              boxShadow: activeIndex === index 
                ? '0 20px 60px rgba(0,0,0,0.80)' 
                : '0 10px 30px rgba(0,0,0,0.30)',
              flex: activeIndex === index ? '6 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Gradient Shadow Overlay */}
            <div 
              className="absolute left-0 right-0 bottom-0 pointer-events-none transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                height: '60%',
                background: activeIndex === index 
                  ? 'linear-gradient(to top, rgba(5,5,4,0.95) 0%, rgba(5,5,4,0.7) 40%, transparent 100%)' 
                  : 'linear-gradient(to top, rgba(5,5,4,0.8) 0%, transparent 100%)',
                opacity: activeIndex === index ? 1 : 0.7
              }}
            />
            
            {/* Label with icon and info */}
            <div className="absolute left-0 right-0 bottom-6 flex flex-col md:flex-row items-start md:items-center justify-start z-20 pointer-events-none px-6 gap-4 w-full">
              <div 
                className="flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md shadow-2xl border border-white/10 flex-shrink-0 transition-all duration-500 ease-out"
                style={{
                  width: activeIndex === index ? '54px' : '44px',
                  height: activeIndex === index ? '54px' : '44px',
                }}
              >
                {option.icon}
              </div>
              
              <div 
                className="text-white flex-1 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden"
                style={{
                  opacity: activeIndex === index ? 1 : 0,
                  transform: activeIndex === index ? 'translateX(0)' : 'translateX(20px)',
                  maxWidth: activeIndex === index ? '100%' : '0px',
                  maxHeight: activeIndex === index ? '200px' : '0px',
                }}
              >
                <div className="font-serif font-bold text-2xl mb-2 text-[#c8b996] whitespace-nowrap">
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

export default InteractiveSelector;
