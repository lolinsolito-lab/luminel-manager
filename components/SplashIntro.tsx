import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashIntroProps {
  onFinish: () => void;
}

const loadingPhases = [
  "Inizializzazione ecosistema in corso...",
  "Sincronizzazione cluster dati (438 KPI attivi)",
  "Calibrazione algoritmi manageriali...",
  "Accesso garantito all'infrastruttura d'élite."
];

export const SplashIntro: React.FC<SplashIntroProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Gestione delle frasi (cambiano ogni 1 secondo circa)
    const phaseInterval = setInterval(() => {
      setPhaseIndex((prev) => {
        if (prev < loadingPhases.length - 1) return prev + 1;
        return prev;
      });
    }, 1100);

    // Gestione progress bar (raggiunge 100 in 4.5s)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / 45); // approx 4.5s for 100 ticks
        return next > 100 ? 100 : next;
      });
    }, 100);
    
    // Inizia la chiusura (fade out)
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4800); 
    
    // Unmount/Finish
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5500); 

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out bg-[#0a0a0a] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Background Video/Image (Abstract AI Network) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: `url('/assets/images/anyma_ai_entity.jpg')`,
          animation: 'subtle-zoom 20s linear infinite'
        }}
      />
      
      {/* Overlay scuro profondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/80 to-[#0a0a0a] backdrop-blur-md"></div>

      {/* Contenuto Centrale */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-8 text-center">
        
        {/* Logo Pulsante */}
        <div className="mb-16 scale-110 drop-shadow-2xl animate-pulse">
          <Logo variant="light" layout="vertical" />
        </div>

        {/* Metriche & Testo */}
        <div className="h-16 flex items-center justify-center">
          <p className="text-xl md:text-2xl font-mono text-[var(--color-text-primary)] font-light tracking-widest uppercase animate-in fade-in zoom-in duration-500" key={phaseIndex}>
            {loadingPhases[phaseIndex]}
          </p>
        </div>

        {/* Barra di Progresso Tech */}
        <div className="mt-8 w-full max-w-md bg-stone-900 h-[2px] rounded-full overflow-hidden relative border border-stone-800/50">
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--color-border)] shadow-[0_0_15px_var(--color-border)] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Info Extra Footer */}
        <div className="mt-12 flex items-center gap-8 text-xs font-mono text-stone-500 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Node: Secure
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-border)] animate-pulse" style={{ animationDelay: '0.5s' }}></span>
            AI: Active
          </span>
        </div>

      </div>
      
      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};
