'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spotlight } from './spotlight';

// Brand colors from 01_BRAND_IDENTITY
const C = {
  gold: '#d4af37',
  goldMid: '#c8b996',
  bg: '#050504',
};

export const AnymaHeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-[100vh] bg-[#050504] overflow-hidden flex items-center justify-center pt-24 pb-12">
      
      {/* Deep volumetric background lights (Anyma style) */}
      <div className="absolute inset-0 z-0">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" size={500} />
        <Spotlight className="top-40 right-0 md:-right-20 md:top-20 opacity-30" size={400} />
      </div>

      {/* Massive holographic image container */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative w-[120vw] h-[120vh] md:w-[80vw] md:h-[80vh] flex items-center justify-center"
        >
          {/* Base Image */}
          <img 
            src="/assets/images/media_1787944837526.png" 
            alt="Luminel AI Hologram" 
            className="w-full h-full object-cover rounded-full mix-blend-screen opacity-70"
            style={{ filter: 'contrast(1.2) brightness(0.8)' }}
          />
          {/* Overlay gradient to sink it into the background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050504_70%)]" />
          
          {/* Scanline effect for hologram vibe */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mb-6 inline-block"
        >
          <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[0.65rem] uppercase tracking-[0.3em] text-[#c8b996]">
            L'Evoluzione del Management
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5 }}
          className="font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.9] text-white tracking-tight mb-8"
        >
          Fai luce<br />
          <span className="italic font-light" style={{ background: `linear-gradient(90deg, #ffffff, ${C.gold}, rgba(200,185,150,0.8))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            sul tuo business.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.8 }}
          className="text-stone-400 font-light text-[clamp(1rem,2vw,1.3rem)] max-w-2xl leading-relaxed mb-12"
        >
          Il primo ecosistema gestionale con AI integrata, progettato esclusivamente per formatori, coach e operatori del benessere.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link 
            to="/auth/register" 
            className="group relative flex items-center gap-3 px-8 py-4 rounded-full border border-[#c8b996]/30 bg-[#050504]/80 backdrop-blur-md text-white no-underline text-[0.8rem] uppercase tracking-[0.15em] transition-all hover:border-[#c8b996] hover:shadow-[0_0_30px_rgba(200,185,150,0.15)]"
          >
            <span>Diventa Founding Member</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-[#d4af37] flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowRight size={14} color="#050504" />
            </div>
          </Link>
          
          <Link 
            to="/auth/login" 
            className="text-[0.7rem] uppercase tracking-[0.15em] text-stone-500 hover:text-stone-300 transition-colors"
          >
            Ho già un account →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
