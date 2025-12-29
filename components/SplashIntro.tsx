
import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { getDailyQuote } from '../utils/dailyQuotes';

interface SplashIntroProps {
  onFinish: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onFinish }) => {
  // Use the Daily Quote Engine
  const [content] = useState(() => getDailyQuote());
  
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Reveal text shortly after background loads
    const contentTimer = setTimeout(() => setShowText(true), 100);
    
    // Start fading out
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4500); 
    
    // Unmount/Finish
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5500); 

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out bg-stone-900 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Background Image tied to the specific quote */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${content.image})`,
          animation: 'subtle-zoom 20s linear infinite'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/50 to-stone-900/80 backdrop-blur-[2px]"></div>

      <div 
        className={`relative z-10 flex flex-col items-center max-w-3xl px-8 text-center transition-all duration-1000 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      >
        <div className="mb-12 scale-125 drop-shadow-2xl">
          <Logo variant="light" layout="vertical" />
        </div>

        <div className="relative">
          <h2 className="text-2xl md:text-4xl font-serif text-white leading-relaxed tracking-wide drop-shadow-lg">
            {content.text}
          </h2>
        </div>

        <div className="mt-10 flex items-center gap-4 animate-in fade-in duration-1000 delay-500 fill-mode-forwards opacity-0" style={{ animationDelay: '500ms' }}>
          <div className="h-[1px] w-12 bg-white/40"></div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold-200 text-shadow-sm">
            {content.author}
          </p>
          <div className="h-[1px] w-12 bg-white/40"></div>
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
