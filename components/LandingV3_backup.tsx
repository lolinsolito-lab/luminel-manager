import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Lock, ArrowRight, ArrowUpRight, Activity, Sparkles, Flame, Clock, Check
} from 'lucide-react';
// FIX (29 ago 2026): prezzi letti dal file condiviso invece che da un array
// locale — stesso identico bug già trovato e corretto in FounderLanding.tsx
// e HomeLanding.tsx stamattina. Terza volta oggi, stesso fix.
import { getMergedPricingPlans, getDiscountPercent, TierPlan } from '../services/pricingPlans';
import { getSubscriptionPlans } from '../services/waitlistService';
import { SplineScene } from './ui/splite';
import { Card } from './ui/card';
import { Spotlight } from './ui/spotlight';
import { WordsPullUp } from './ui/words-pull-up';
import { ImageStreamHero } from './ui/image-stream-hero';
import { ColorChangeCards } from './ui/color-change-card';
import { AiCoachHeroSection } from './ui/ai-coach-hero';
import InteractiveSelector from './ui/interactive-selector';
import FailureAccordion from './ui/failure-accordion';
import { PlanVerticalStepper } from './ui/plan-vertical-stepper';
import { ProfessionsCarousel } from './ui/professions-carousel';

// ─── PALETTE: White-Gold (invariata) ─────────────────────────────────────────
const C = {
  gold: 'rgba(240,232,210,1)',
  goldMid: 'rgba(200,185,150,0.7)',
  goldDim: 'rgba(160,148,120,0.4)',
  glow: 'rgba(220,210,180,0.15)',
  bg: '#050504',
  card: 'rgba(12,11,9,0.95)',
};

// STORYTELLING FIX: erano i claim di VirtualTwin (risponde su WhatsApp al posto tuo).
// Ora raccontano le vere capacità di Luminel Manager.
const HERO_BULLETS = [
  'Dashboard con fatturato, sessioni e clienti in tempo reale',
  'Calendario anti-overbooking, mai due sessioni sovrapposte',
  'AI Coach che legge i tuoi numeri e ti anticipa i problemi',
  "Fatturazione e promemoria automatici, 24 ore su 24",
];

// STORYTELLING FIX: integrazioni vere di Luminel invece di WhatsApp/Instagram/Messenger
const INTEGRATIONS = [
  { name: 'Google Calendar', active: true, color: '#a0a090' },
  { name: 'Stripe Pagamenti', active: true, color: '#c0b890' },
  { name: 'WhatsApp Reminder', active: true, color: '#d0c8a8' },
  { name: 'Zoom', active: false, color: '#333' },
];

// ─── FALLING STARS (invariato) ─────────────────────────────────────────────
const FallingStars: React.FC = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {Array.from({ length: 34 }).map((_, i) => {
      const size = 1 + (i % 2);
      const delay = (i * 0.36) % 9;
      const dur = 7 + (i % 6);
      const left = `${(i * 3.1) % 100}%`;
      return (
        <motion.div
          key={i}
          style={{
            position: 'absolute', left, top: -10,
            width: size, height: size,
            borderRadius: '50%',
            background: 'rgba(240,235,215,0.9)',
            boxShadow: '0 0 6px 1px rgba(255,250,235,0.5)',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: '110vh', opacity: [0, 0.8, 0.5, 0] }}
          transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
        />
      );
    })}
  </div>
);

// ─── SOUND WAVE RINGS (invariato) ────────────────────────────────────────────
const SoundWaveRings: React.FC = () => {
  const rings = [0, 1, 2, 3];
  return (
    <>
      {rings.map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            border: `1px solid rgba(240,232,210,${0.35 - i * 0.07})`,
            inset: `${-i * 28}px`,
          }}
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.35 - i * 0.07, 0.6 - i * 0.1, 0.35 - i * 0.07],
          }}
          transition={{
            duration: 2.8,
            delay: i * 0.42,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '-2.5rem',
          borderRadius: '50%',
          border: '1px dashed rgba(200,190,160,0.18)',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '-4rem',
          borderRadius: '50%',
          border: '1px dashed rgba(200,190,160,0.09)',
        }}
      />
    </>
  );
};

// ─── HOLOGRAPHIC ORB (invariato) ──────
const HolographicOrb: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rx = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const ry = useSpring(mouseY, { stiffness: 60, damping: 18 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set((e.clientX - cx) / rect.width * 35);
    mouseY.set((e.clientY - cy) / rect.height * -35);
  };

  return (
    <div
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ position: 'relative', width: 'clamp(320px,45vw,550px)', height: 'clamp(320px,45vw,550px)', margin: '0 auto' }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: '-1.5rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,232,210,0.18) 0%, rgba(200,185,150,0.06) 50%, transparent 75%)' }}
      />

      <div style={{ position: 'absolute', inset: 0 }}>
        <SoundWaveRings />
      </div>

      <motion.div
        style={{ rotateX: ry, rotateY: rx, position: 'absolute', inset: '2.5rem', borderRadius: '50%', overflow: 'hidden', zIndex: 10, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(240,232,210,0.15)', boxShadow: '0 0 60px rgba(240,232,210,0.25), inset 0 0 60px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 10 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, black 0%, transparent 55%)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)', zIndex: 11, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, filter: 'sepia(0.4) hue-rotate(330deg) saturate(1.8) brightness(1.1)' }}>
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full scale-[1.2]"
            />
          </div>
          <div style={{ position: 'absolute', inset: 0, zIndex: 12, background: 'radial-gradient(ellipse at 40% 30%, rgba(240,232,210,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        </div>
      </motion.div>

      {/* Shimmer che percorre l'anello esterno — vita sui cerchi */}
      <motion.div
        style={{ position: 'absolute', inset: '-4rem', borderRadius: '50%', pointerEvents: 'none' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div style={{ position: 'absolute', top: 0, left: '50%', width: 4, height: 4, borderRadius: '50%', background: C.gold, boxShadow: `0 0 12px 3px ${C.gold}`, transform: 'translateX(-50%)' }} />
      </motion.div>

      {/* Le tre "lune" — orbitano davvero attorno al centro, non solo su/giù.
          Ogni orbita: contenitore esterno ruota, contenitore interno
          contro-ruota per tenere il testo leggibile durante il giro. */}
      {[
        { icon: Brain, title: 'AI Coach Attivo', sub: 'Contesto business live', radius: 240, duration: 22, delay: 0, color: C.gold },
        { icon: Activity, title: 'Fatturato Mese', sub: '+12.4% vs mese scorso', radius: 255, duration: 26, delay: -9, color: C.goldMid },
        { icon: Lock, title: 'Zero Overbooking', sub: 'Calendario protetto', radius: 225, duration: 30, delay: -18, color: '#6FCF97' },
      ].map((moon, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: moon.duration, repeat: Infinity, ease: 'linear', delay: moon.delay }}
        >
          <motion.div
            style={{ position: 'absolute', top: 0, left: moon.radius, transform: 'translate(-50%, -50%)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: moon.duration, repeat: Infinity, ease: 'linear', delay: moon.delay }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: '0.75rem', background: 'rgba(5,5,4,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(240,232,210,0.12)', whiteSpace: 'nowrap', boxShadow: `0 4px 20px rgba(0,0,0,0.4)` }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${moon.color}18`, border: `1px solid ${moon.color}40` }}>
                <moon.icon size={12} style={{ color: moon.color }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{moon.title}</p>
                <p style={{ fontSize: 9, color: '#78716c', fontFamily: 'monospace', margin: 0 }}>{moon.sub}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── FEATURE ITEM (invariato) ─────────────────────────────────────────────
interface FeatProps { num: string; title: string; desc: string; isActive: boolean; }
const FeatureItem: React.FC<FeatProps> = ({ num, title, desc, isActive }) => (
  <div style={{ transition: 'all 0.7s', opacity: isActive ? 1 : 0.15, filter: isActive ? 'none' : 'blur(1.5px)' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#44403c' }}>{num}</span>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,3.2vw,3.2rem)', color: '#fff', lineHeight: 1.05, margin: 0 }}>{title}</h3>
    </div>
    {isActive && (
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ marginLeft: '2rem', marginTop: '0.85rem', color: '#a8a29e', fontWeight: 300, fontSize: '1rem', maxWidth: '26rem', lineHeight: 1.75 }}
      >{desc}</motion.p>
    )}
  </div>
);

// ─── LIVING DASHBOARD IMAGE ───
const LivingDashboardImage: React.FC = () => {
  return (
    <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', transform: 'scale(1.08)', transformOrigin: 'center left' }}>
      <img src="/assets/images/media_1787944837657.jpg" alt="Dashboard" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(1.05)' }} />
      
      {/* Holographic Entity (Anyma style) */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <video
          autoPlay loop muted playsInline
          src="https://claude-mem.ai/video/hero-bg.mp4"
          style={{
            width: '160%', height: '160%', objectFit: 'cover',
            mixBlendMode: 'screen', opacity: 0.9,
            maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 15%, transparent 40%)',
            WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 15%, transparent 40%)',
            transform: 'scale(1.1) translateY(5%)',
          }}
        />
      </div>

      {/* Floating Lights / Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -60, -120],
            x: [0, (i % 2 === 0 ? 40 : -40), (i % 2 === 0 ? -20 : 20)],
            opacity: [0, 0.9, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
          style={{
            position: 'absolute', top: `${45 + (i * 3)}%`, left: `${40 + (i * 4)}%`,
            width: 4, height: 4, background: '#fff', borderRadius: '50%',
            boxShadow: '0 0 12px 3px rgba(240,232,210,0.9)', pointerEvents: 'none'
          }}
        />
      ))}
      
      {/* Scanning Light */}
      <motion.div
        animate={{ y: ['-20%', '120%'], opacity: [0, 0.2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '25%',
          background: 'linear-gradient(to bottom, transparent, rgba(200,185,150,0.2), transparent)', pointerEvents: 'none'
        }}
      />
      
      {/* Overlay border */}
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(240,232,210,0.08)', borderRadius: '1.5rem', zIndex: 2, pointerEvents: 'none' }} />
    </div>
  );
};

// ─── ECOSYSTEM STACK (MacBook Neo Style) ───
const EcosystemStack: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const panels = [
    { name: "Luminel Manager", type: "Core", image: "/assets/images/media_1787944837657.jpg" },
    { name: "VirtualTwin", type: "AI Clone", color: "linear-gradient(135deg, rgba(200, 185, 150, 0.15) 0%, rgba(5,5,4,1) 100%)" },
    { name: "VirtualBNB", type: "Property", color: "linear-gradient(135deg, rgba(111, 207, 151, 0.15) 0%, rgba(5,5,4,1) 100%)" },
    { name: "LuminelCoach", type: "AI Mentor", color: "linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(5,5,4,1) 100%)" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((curr) => (curr + 1) % panels.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [panels.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', perspective: '1200px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      {panels.map((p, i) => {
        const diff = (i - activeIndex + panels.length) % panels.length;
        
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ 
              opacity: diff === 0 ? 1 : 1 - (diff * 0.15), 
              y: diff * -45, 
              rotateX: diff === 0 ? 0 : 4, 
              scale: 1 - (diff * 0.06),
              zIndex: panels.length - diff
            }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'absolute',
              left: 0, right: 0,
              margin: '0 auto',
              width: '90%',
              aspectRatio: '16/9',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: diff === 0 ? `0 40px 80px rgba(0,0,0,0.8)` : `0 ${30 + (diff * 10)}px ${40 + (diff * 20)}px rgba(0,0,0,0.${5 + diff})`,
              border: '1px solid rgba(240,232,210,0.15)',
              background: '#050504',
            }}
          >
            {p.image ? (
               <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
               <div style={{ width: '100%', height: '100%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.05) inset' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 300, color: '#fff', letterSpacing: '0.1em' }}>{p.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.3em', padding: '0.4rem 1.2rem', border: '1px solid rgba(200,185,150,0.25)', borderRadius: '99px', background: 'rgba(5,5,4,0.5)' }}>{p.type} Beta</span>
               </div>
            )}
            
            {/* Top macOS like bar for UI realism */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '28px', background: 'rgba(5,5,4,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
               <div style={{ margin: '0 auto', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>{p.name}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── SPECTACULAR ECOSYSTEM SECTION ───
const SpectacularEcosystemSection: React.FC = () => {
  return (
    <section style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', padding: '10rem 1.5rem', background: '#050504', display: 'flex', alignItems: 'center', borderTop: borderLine, borderBottom: borderLine }}>
      {/* Background Holographic Faces */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 0 }}>
        <motion.img 
          src="/assets/images/media_1787944837651.jpg" 
          alt="AI Vision"
          initial={{ scale: 1.1, y: -20 }}
          whileInView={{ scale: 1, y: 0 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.5) grayscale(1) brightness(1.2)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #050504 0%, transparent 50%, #050504 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #050504 90%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '88rem', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.2fr)', gap: '6rem', alignItems: 'center' }}>
        
        {/* Testo ed Ecosistema (Left Column) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: `1px solid ${C.goldDim}`, background: 'rgba(240,232,210,0.03)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.goldMid, width: 'max-content' }}>
            <Sparkles size={12} color={C.goldMid} />
            La Visione Infinita
          </div>

          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.5rem,4vw,3.5rem)', color: '#fff', fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
            Luminel è solo <br />
            <span style={{ fontStyle: 'italic', color: C.gold, textShadow: `0 0 40px ${C.gold}40` }}>l'inizio.</span>
          </h2>
          
          <p style={{ color: '#a8a29e', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '30rem', margin: '0 0 1.5rem 0' }}>
            Un ecosistema di intelligenze interconnesse. Mentre Luminel gestisce il tuo presente, stiamo già costruendo il tuo impero futuro.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            {[
              { name: 'VirtualTwin', desc: 'Clone conversazionale 24/7.', status: 'live' },
              { name: 'VirtualBNB', desc: 'Property management AI.', status: 'live' },
              { name: 'LuminelCoach', desc: 'Il tuo Mentore AI privato. Ascolta le tue sfide e calcola le tue vittorie. Accesso Early Access severamente limitato.', status: 'soon' },
              { name: 'Michael Luminels', desc: 'Il nucleo visionario dell\'intero ecosistema. L\'ingresso all\'élite è su invito. Le porte stanno per chiudersi.', status: 'soon' },
            ].map((p, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5, background: 'rgba(240,232,210,0.06)', borderColor: C.goldMid }}
                style={{ position: 'relative', padding: '1.25rem', borderRadius: '1rem', border: borderLine, background: 'rgba(240,232,210,0.02)', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', cursor: 'default' }}
              >
                {p.status === 'soon' && (
                  <div style={{ position: 'absolute', top: '-0.7rem', right: '1rem', background: 'linear-gradient(135deg, #f87171, #ef4444)', color: '#fff', fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.25rem 0.75rem', borderRadius: '99px', boxShadow: '0 4px 12px rgba(248,113,113,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Coming Soon
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.status === 'live' ? '#6FCF97' : '#57534e', boxShadow: p.status === 'live' ? '0 0 10px #6FCF97' : 'none' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>{p.name}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#78716c', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stack Macbooks / Dashboards (Right Column) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 1, delay: 0.2 }}
        >
          <EcosystemStack />
        </motion.div>
      </div>
    </section>
  );
};

// ─── ANIMATED IMAGE CARD (invariato) ──
interface ImgCardProps { src: string; alt: string; delay?: number; style?: React.CSSProperties; }
const AnimatedImg: React.FC<ImgCardProps> = ({ src, alt, delay = 0, style }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', cursor: 'pointer', ...style }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
    >
      <motion.div
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'absolute', inset: '-1rem', background: 'radial-gradient(circle, rgba(240,232,210,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)', zIndex: 0 }}
      />
      <motion.img
        src={src} alt={alt}
        animate={{ scale: hov ? 1.02 : 1, filter: hov ? 'brightness(1.05) saturate(1.1)' : 'brightness(1) saturate(1)' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'relative', zIndex: 1 }}
      />
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(240,232,210,0.08)', borderRadius: '1.5rem', zIndex: 2, pointerEvents: 'none' }} />
      <motion.div
        animate={{ y: hov ? ['0%', '100%'] : '0%', opacity: hov ? [0, 0.3, 0] : 0 }}
        transition={{ duration: 1.5, repeat: hov ? Infinity : 0 }}
        style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`, zIndex: 3 }}
      />
    </motion.div>
  );
};

const borderLine = '1px solid rgba(240,232,210,0.07)';

// --- SEZIONE: Categorie Professionali -----------------------------------------
// ⚠️ NOTA (invariata dalla consegna originale): i numeri "12 posti rimasti" /
// "9 posti rimasti" sono ancora segnaposto, non collegati a un conteggio reale
// per categoria — serve una query dedicata su business_type se li vuoi veri.
const PROFESSIONAL_CATEGORIES = [
  {
    id: 'coach',
    name: 'Coach',
    status: 'live',
    fomo: '12 posti Founder rimasti su questa categoria',
    desc: 'Sessioni, obiettivi, no-show, LTV cliente — il linguaggio che i CRM generici non parlano.',
  },
  {
    id: 'olistici',
    name: 'Operatori Olistici',
    status: 'live',
    fomo: '9 posti Founder rimasti su questa categoria',
    desc: 'Massaggiatori, naturopati, operatori del benessere — rituali e appuntamenti su misura.',
  },
  {
    id: 'saloni',
    name: 'Saloni & Estetiste',
    status: 'soon',
    fomo: 'Lista d\'attesa aperta',
    desc: 'In arrivo con fatturazione elettronica italiana integrata.',
  },
  {
    id: 'tattoo',
    name: 'Tatuatori',
    status: 'soon',
    fomo: 'Lista d\'attesa aperta',
    desc: 'In arrivo nella prossima fase di espansione.',
  },
];


// --- SEZIONE: Pricing arricchito ----------------------------------------------
// FIX (29 ago 2026): ora si autoalimenta dal DB come FounderLanding/HomeLanding,
// con stato di caricamento/errore esplicito — niente più array locale, niente
// più fallback silenzioso su prezzi potenzialmente disallineati.
const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<TierPlan[] | null>(null);
  const [plansError, setPlansError] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  // FOMO onesto: numero vero dei posti Founder rimasti (stessa fonte usata in
  // FounderLanding/HomeLanding), non un numero inventato per tier.
  const [founderSpots, setFounderSpots] = useState<number | null>(null);

  useEffect(() => {
    const loadSpots = async () => {
      try {
        const { getFounderSpotsRemaining } = await import('../services/waitlistService');
        const spots = await getFounderSpotsRemaining();
        setFounderSpots(spots);
      } catch (e) {
        console.warn('[LandingV2] Could not load founder spots');
      }
    };
    loadSpots();
  }, []);

  // Colori distinti per tier — plan.color è una classe Tailwind (non usabile
  // in inline style), qui la versione in hex per i badge icona di questa pagina.
  const TIER_ICON_COLORS: Record<string, { bg: string; icon: string; glow: string }> = {
    starter: { bg: 'linear-gradient(135deg, #57534e, #78716c)', icon: '#e7e5e4', glow: 'rgba(120,113,108,0.4)' },
    pro: { bg: `linear-gradient(135deg, ${C.gold}, #7a5d1e)`, icon: '#fff', glow: 'rgba(240,232,210,0.5)' },
    signature: { bg: 'linear-gradient(135deg, #f97316, #dc2626)', icon: '#fff', glow: 'rgba(249,115,22,0.4)' },
    empire: { bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: '#fff', glow: 'rgba(124,58,237,0.4)' },
  };

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const dbPlans = await getSubscriptionPlans();
        if (dbPlans && dbPlans.length > 0) {
          setPlans(getMergedPricingPlans(dbPlans));
        } else {
          setPlansError(true);
        }
      } catch (e) {
        console.error('[LandingV2] Impossibile caricare i prezzi dal DB:', e);
        setPlansError(true);
      }
    };
    loadPlans();
  }, []);

  return (
    <section id="pricing" style={{ padding: '8rem 1.5rem', maxWidth: '96rem', margin: '0 auto', position: 'relative', zIndex: 20, borderTop: borderLine }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100vw', height: 400, background: 'radial-gradient(ellipse, rgba(200,185,150,0.04) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.5rem,5vw,5rem)', color: '#fff', fontWeight: 300, marginBottom: '1.5rem' }}>Scegli la tua soluzione.</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '9999px', border: '1px solid rgba(160,148,120,0.4)', background: 'rgba(240,232,210,0.03)', backdropFilter: 'blur(12px)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(200,185,150,0.7)' }}>
          Prezzi Founder Bloccati a Vita
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem 2.5rem', marginBottom: '4rem', padding: '1.5rem', borderRadius: '1rem', border: borderLine, background: 'rgba(240,232,210,0.015)' }}>
        {[
          'Zero commissioni sui tuoi clienti, mai',
          'AI Coach col contesto del tuo business reale',
          'Verificato riga per riga, non solo promesso',
        ].map((point, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#a8a29e' }}>
            <Check size={14} color="rgba(240,232,210,1)" />
            {point}
          </div>
        ))}
      </div>

      {!plans && !plansError && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#57534e' }}>Caricamento prezzi in corso...</div>
      )}
      {plansError && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>Prezzi momentaneamente non disponibili. Riprova tra poco.</div>
      )}

      {plans && (
        <>
          {/* FOMO onesto: numero vero, non inventato */}
          {founderSpots !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                margin: '0 auto 2.5rem', padding: '0.6rem 1.4rem', width: 'fit-content',
                borderRadius: 9999, background: 'rgba(240,232,210,0.06)', border: `1px solid ${C.goldDim}`,
                fontSize: '0.78rem', color: C.gold, fontWeight: 600,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: founderSpots <= 5 ? '#ef4444' : C.gold, flexShrink: 0 }}
              />
              {founderSpots > 0
                ? `Solo ${founderSpots} posti Founder rimasti su 25 — prezzo bloccato per sempre`
                : 'Posti Founder esauriti — prezzo pubblico in vigore'}
            </motion.div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a8a29e' }}>Fatturazione Mensile</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              style={{ width: 56, height: 28, borderRadius: 9999, background: 'rgba(240,232,210,0.1)', border: `1px solid ${borderLine}`, position: 'relative', cursor: 'pointer' }}
            >
              <motion.div
                animate={{ x: billingCycle === 'annual' ? 28 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', top: 2, width: 22, height: 22, borderRadius: '50%', background: C.gold }}
              />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Fatturazione Annuale</span>
            <span style={{ background: 'rgba(111,207,151,0.12)', border: '1px solid rgba(111,207,151,0.3)', color: '#6FCF97', fontSize: '0.65rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2 Mesi Gratis 🎁
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.6 }}
                  whileHover={{ y: -6 }}
                  style={{
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    padding: '2rem', borderRadius: '1.25rem',
                    border: plan.popular ? '2px solid rgba(240,232,210,0.4)' : borderLine,
                    background: plan.popular ? 'linear-gradient(160deg, rgba(240,232,210,0.06), rgba(5,5,4,0.9))' : 'rgba(240,232,210,0.015)',
                    backdropFilter: 'blur(16px)',
                    // FIX: overflow 'visible' (non più 'hidden') — altrimenti il badge
                    // "Più Scelto" posizionato sopra il bordo (top: -14) veniva tagliato
                    marginTop: plan.popular ? '0.75rem' : 0,
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', padding: '0.3rem 1rem', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(240,232,210,0.3)' }}>
                      {plan.badge || 'Più Scelto 🔥'}
                    </div>
                  )}

                  <motion.div
                    animate={plan.popular ? { boxShadow: [`0 0 0px ${TIER_ICON_COLORS[plan.id]?.glow}`, `0 0 20px ${TIER_ICON_COLORS[plan.id]?.glow}`, `0 0 0px ${TIER_ICON_COLORS[plan.id]?.glow}`] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{
                      width: 48, height: 48, borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem',
                      background: TIER_ICON_COLORS[plan.id]?.bg || TIER_ICON_COLORS.starter.bg,
                      boxShadow: `0 4px 14px ${TIER_ICON_COLORS[plan.id]?.glow || 'rgba(0,0,0,0.3)'}`,
                    }}
                  >
                    <Icon size={22} color={TIER_ICON_COLORS[plan.id]?.icon || '#fff'} />
                  </motion.div>

                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', color: '#fff', fontWeight: 400, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{plan.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#78716c', marginBottom: '1.25rem', minHeight: '1.2em' }}>{plan.tagline}</p>

                  <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: borderLine }}>
                    <div style={{ fontSize: '0.72rem', color: '#44403c', textDecoration: 'line-through', marginBottom: '0.15rem' }}>€{plan.pricePublic}/mese</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      <span style={{ color: '#7a7570', fontSize: '1.1rem' }}>€</span>
                      <span style={{ fontFamily: 'Georgia,serif', fontSize: '2.4rem', color: '#fff', fontWeight: 300, lineHeight: 1 }}>
                        {billingCycle === 'monthly' ? plan.priceFounderMonthly : Math.round(plan.priceFounderAnnual / 12)}
                      </span>
                      <span style={{ color: '#57534e', fontSize: '0.85rem' }}>/mo</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div style={{ fontSize: '0.68rem', color: '#57534e', marginTop: '0.25rem' }}>Addebitato annualmente: €{plan.priceFounderAnnual}/anno</div>
                    )}
                    <div style={{ display: 'inline-block', marginTop: '0.5rem', background: 'rgba(111,207,151,0.1)', border: '1px solid rgba(111,207,151,0.25)', color: '#6FCF97', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 6, textTransform: 'uppercase' }}>
                      Risparmi {getDiscountPercent(plan)}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.72rem', color: '#a8a29e', background: 'rgba(240,232,210,0.02)', border: borderLine, borderRadius: '0.6rem', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Utenti inclusi:</span><span style={{ fontWeight: 700, color: '#fff' }}>{plan.maxUsers === -1 ? 'Illimitati' : plan.maxUsers}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Clienti gestibili:</span><span style={{ fontWeight: 700, color: '#fff' }}>{plan.maxClients === -1 ? 'Illimitati' : plan.maxClients}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sessioni mensili:</span><span style={{ fontWeight: 700, color: '#fff' }}>{plan.maxSessions === -1 ? 'Illimitate' : `${plan.maxSessions}/mese`}</span></div>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: '#c8c4bc' }}>
                        <Check size={13} color="#6FCF97" style={{ marginTop: 2, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {plan.edge && (
                    <p style={{ fontSize: '0.72rem', color: 'rgba(240,232,210,0.6)', fontStyle: 'italic', borderLeft: `2px solid ${C.goldDim}`, paddingLeft: '0.7rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      {plan.edge}
                    </p>
                  )}

                  <Link
                    to={`/auth/register?plan=${plan.id}`}
                    style={{
                      marginTop: 'auto', textAlign: 'center', padding: '0.85rem', borderRadius: '0.75rem',
                      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      textDecoration: 'none',
                      background: plan.popular ? `linear-gradient(90deg, ${C.gold}, #f0d080)` : 'transparent',
                      color: plan.popular ? '#050504' : '#fff',
                      border: plan.popular ? 'none' : `1px solid rgba(240,232,210,0.2)`,
                    }}
                  >
                    Attiva Piano {plan.name} →
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

// ⚠️ NOTA (29 ago 2026): questi numeri (94% adozione, -78% errori, +3.2 ore/
// giorno) non sono misurati — oggi non ci sono ancora clienti paganti reali.
// Stessa categoria di rischio delle testimonianze Marco/Sara/Giulia rimosse
// altrove oggi. Non li ho toccati: è una decisione di contenuto, non un bug
// meccanico — dimmi se vuoi che li tolga/riformuli come promessa non come dato.
const METRICS = [
  { title: 'TEMPO RISPARMIATO', value: '+3.2', suffix: ' ORE/GIORNO', desc: 'Rispetto all\'uso di Excel + WhatsApp.', icon: Clock },
  { title: 'TASSO DI ADOZIONE', value: '94', suffix: '%', desc: 'Tra Coach, Saloni e Professionisti del benessere.', icon: Activity },
  { title: 'RIDUZIONE ERRORI', value: '-78', suffix: '%', desc: 'No-show e doppi appuntamenti azzerati.', icon: Check },
  { title: 'WHATSAPP AUTOMATION', value: '24', suffix: '/7', desc: 'Promemoria automatici e proattivi ai clienti.', icon: Sparkles }
];

// --- SEZIONE: Ecosistema (Bento Grid) --------------------------------------
const ECOSYSTEM_PRODUCTS = [
  { name: 'VirtualTwin', desc: 'L\'AI Clone conversazionale che risponde come te 24/7.', status: 'live', colSpan: 'md:col-span-2' },
  { name: 'VirtualBNB', desc: 'Automazione e property management intelligente.', status: 'live', colSpan: 'md:col-span-1' },
  { name: 'LuminelCoach', desc: 'Il tuo AI Coach personale per decisioni business.', status: 'soon', colSpan: 'md:col-span-1' },
  { name: 'Insolita Academy', desc: 'Formazione elitaria su tech, mind e business.', status: 'soon', colSpan: 'md:col-span-2' },
];

const EcosystemSection: React.FC = () => (
  <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem 8rem' }}>
    <div className="text-center mb-16">
      <span className="text-[0.68rem] uppercase tracking-[0.3em] text-[#c8b996]/70 block mb-4">L'Ecosistema</span>
      <h2 className="font-serif font-light text-[2.4rem] md:text-[3.5rem] leading-[1.1] text-white">
        Luminel fa parte<br />
        <span className="italic" style={{ color: C.gold }}>di qualcosa di più grande.</span>
      </h2>
      <p className="text-stone-400 font-light mt-6 max-w-2xl mx-auto text-[1.1rem]">
        Non stai acquistando solo un software. Stai entrando in un ecosistema di prodotti interconnessi progettati per scalare il tuo business.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ECOSYSTEM_PRODUCTS.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#050504] p-8 min-h-[220px] transition-all duration-700 hover:border-[#c8b996]/30 hover:-translate-y-1 ${p.colSpan}`}
        >
          <Spotlight className="from-[#c8b996]/20 via-[#c8b996]/5 to-transparent" size={350} />

          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.3rem] font-bold text-white tracking-wide">{p.name}</h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'live' ? 'bg-[#6FCF97] shadow-[0_0_8px_#6FCF97]' : 'bg-[#c8b996] shadow-[0_0_8px_#c8b996]'}`} />
                <span className="text-[0.6rem] uppercase tracking-widest text-stone-300 font-bold">{p.status === 'live' ? 'Live' : 'Soon'}</span>
              </div>
            </div>

            <p className="text-[0.95rem] text-stone-400 font-light leading-relaxed group-hover:text-stone-200 transition-colors duration-500 max-w-sm">
              {p.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

const MetricsGridSection: React.FC = () => {
  return (
    <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '10rem 1.5rem', position: 'relative' }}>
      {/* Sfondo Radiale Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(200,185,150,0.04) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '6rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '99px', border: `1px solid ${C.goldDim}`, background: 'rgba(240,232,210,0.03)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.goldMid, marginBottom: '1.5rem' }}>
          La Scienza dell'Efficienza
        </div>
        <h2 style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontFamily: 'Georgia,serif', color: '#fff', fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
          I numeri non mentono.<br />
          <span style={{ fontStyle: 'italic', color: C.gold, textShadow: `0 0 40px ${C.gold}50` }}>Il tuo business decolla.</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative', zIndex: 10 }}>
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -10, boxShadow: `0 40px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1)`, borderColor: 'rgba(200,185,150,0.3)' }}
              style={{
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(240,232,210,0.03) 0%, rgba(5,5,4,1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(240,232,210,0.08)',
                borderRadius: '2rem',
                padding: '3rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(200,185,150,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', border: `1px solid ${C.goldDim}` }}>
                <Icon size={28} color={C.gold} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '3.8rem', fontFamily: 'Georgia,serif', color: '#fff', margin: 0, fontWeight: 300, letterSpacing: '-0.02em', textShadow: `0 0 40px rgba(255,255,255,0.15)` }}>{m.value}</h3>
                <span style={{ fontSize: '1rem', color: C.goldMid, fontWeight: 700, letterSpacing: '0.1em' }}>{m.suffix}</span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, margin: '1rem 0 0.5rem' }}>{m.title}</p>
              <p style={{ fontSize: '0.95rem', color: '#78716c', lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// --- SEZIONE: Il Problema (portata da HomeLanding, storytelling affinato) ---
const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";
const STREAM_IMAGES = [
  { src: `${CDN}/stock-images/767d99bb371a54d0d36751e8cecae43c.jpg` },
  { src: `${CDN}/gradients/hero_gradient/hero-gradients-01.png` },
  { src: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg` },
  { src: `${CDN}/gradients/crimson_aura/crimson-aura-02.png` },
  { src: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg` },
  { src: `${CDN}/gradients/hue-flow/hue-flow-01.png` },
  { src: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg` },
  { src: `${CDN}/gradients/moon/moon-grade-03.png` },
  { src: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg` },
];

const PAIN_POINTS = [
  { icon: Clock, title: '2 Ore Su Excel', desc: 'Ogni sera, la stessa scena: fatture da inserire a mano, appuntamenti da ricopiare. Frustrante, e lo sai già mentre lo fai.', stat: '730h', statLabel: 'perse/anno' },
  { icon: Sparkles, title: 'WhatsApp Caos', desc: '"Dove ho messo quello screenshot? Chi mi doveva ancora pagare?" – la chat diventa un archivio che nessuno riesce più a cercare.', stat: '€600', statLabel: 'persi/mese' },
  { icon: Activity, title: '5 Strumenti Diversi', desc: 'Calendario, CRM, Excel, Note, Dropbox – nessuno parla con l\'altro, e il collante sei sempre tu.', stat: '92%', statLabel: 'perdono tempo' },
];

const ProblemSection: React.FC = () => (
  <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '7rem 1.5rem', borderTop: borderLine }}>
    <ImageStreamHero
      images={STREAM_IMAGES}
      className="relative w-full rounded-[2.5rem] border border-white/5 bg-black"
    >
      {/* Overlay gradiente per rendere leggibile il testo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center py-20 px-6">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.goldMid, display: 'block', marginBottom: '1.5rem' }}>Il Problema</span>
          <h2 className="font-serif font-light leading-[0.9] tracking-[-0.03em] text-[10vw] sm:text-[7vw] md:text-[5vw] text-white">
            <WordsPullUp text="Conosci questa" />
            <br />
            <span className="italic" style={{ color: C.gold }}>scena?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {PAIN_POINTS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(0,0,0,0.8)' }}
              className="p-8 rounded-[1.25rem] border border-white/5 bg-black/50 backdrop-blur-md transition-all flex flex-col"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p.icon size={20} color="#f87171" />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: '#f87171', fontWeight: 700 }}>{p.stat}</div>
                  <div style={{ fontSize: '0.6rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.statLabel}</div>
                </div>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, marginBottom: '0.75rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#a8a29e', lineHeight: 1.65 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </ImageStreamHero>    </section>
);

// --- SEZIONE: Il Futuro (La Visione) ------------------

// --- SEZIONE: Il Piano (3 passi, portata da HomeLanding) ------------------

const PLAN_STEPS = [
  { num: '01', title: 'Blocca Prezzo Founder', desc: 'Scegli il tuo piano e blocca il prezzo per sempre. Quando la Founder Wave chiude, il prezzo torna a quello pubblico.', badge: 'Offerta limitata', color: '#fbbf24' },
  { num: '02', title: 'Setup in 47 Minuti', desc: 'Importa i clienti, configura gli orari, carica il logo. Nessun corso, nessun developer — solo tu e Luminel.', badge: 'Zero carta richiesta', color: '#6FCF97' },
  { num: '03', title: 'Onboarding VIP con Michael', desc: 'Call 1:1 di 30 minuti. Setup personale. Accesso diretto al Founder — solo per i primi 25.', badge: 'Esclusivo Founder', color: '#a855f7' },
];
const QuoteSection: React.FC = () => (
  <section style={{ maxWidth: '64rem', margin: '0 auto', padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative rounded-[2.5rem] border border-white/5 bg-[#050504] p-10 md:p-16 shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#c8b996] to-transparent opacity-40" />
      <span className="absolute -top-10 left-4 text-[12rem] font-serif text-[#c8b996] opacity-5 leading-none select-none">"</span>
      
      <p className="relative z-10 font-serif text-2xl md:text-[1.7rem] text-white font-light leading-[1.6] italic mb-10 max-w-3xl mx-auto">
        "La maggior parte dei professionisti non ha costruito un business, si è solo creata un nuovo lavoro sfiancante. Il segreto per scalare non è lavorare di più, ma delegare ai sistemi tutto ciò che non richiede il tuo genio."
      </p>
      
      <div className="relative z-10 flex flex-col items-center gap-1 mb-10">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[#c8b996]">Brian Tracy</span>
        <span className="text-[0.65rem] text-stone-400 tracking-widest uppercase">Esperto Mondiale di Produttività</span>
      </div>

      <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.1rem 3rem', borderRadius: '9999px', background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', boxShadow: `0 0 30px rgba(240,232,210,0.15)`, transition: 'all 0.3s ease', border: 'none' }} className="hover:scale-105">
        Vedi la Soluzione <ArrowRight size={14} />
      </a>
    </motion.div>
  </section>
);

const PlanSection: React.FC = () => (
  <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '6rem 1.5rem', borderTop: borderLine }}>
    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#0A0D0B] p-8 md:p-16 min-h-[70vh] flex flex-col justify-center border border-white/5">
      
      {/* Sfondo Atmosferico - Foto Generata */}
      <img 
        src="/assets/images/glowing_doorway.jpg" 
        alt="Glowing doorway" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.25] mix-blend-screen z-0" 
      />
      
      {/* Sfondo Atmosferico - Glow e Noise */}
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#f59e0b] blur-[150px] opacity-[0.2] rounded-full z-0" />
      
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      {/* Silhouettes / Texture */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050504] to-transparent opacity-90 z-0 pointer-events-none" />

      {/* Hero content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-16 lg:gap-12">
        
        {/* Colonna Sinistra (Testo e CTA) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-8">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-stone-300">Il Percorso</span>
            <Sparkles size={14} className="text-[#fbbf24]" />
          </div>
          
          <h2 className="font-sans font-medium tracking-tight text-[3.5rem] leading-[1.05] md:text-[4.5rem] lg:text-[5rem] text-white mb-6">
            Riprendi il<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-200 to-stone-400">controllo</span> in<br />
            3 passi
          </h2>
          
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-md leading-relaxed mb-10">
            Non hai tempo da perdere. Scegli se fare tutto in autonomia in 47 minuti con la nostra guida, oppure <strong className="text-white font-medium">affidare l'intero setup al nostro team</strong>. Ti consegniamo la piattaforma pronta all'uso, con i tuoi clienti già caricati.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/auth/register" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-8 py-3.5 text-sm font-bold transition-transform hover:scale-105">
              Blocca il Posto <ArrowRight size={16} />
            </Link>
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 text-white px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10">
              <span className="text-xs">▶</span> Richiedi Setup VIP
            </a>
          </div>
        </div>

        {/* Colonna Destra (Vertical Stepper) */}
        <div className="col-span-1 lg:col-span-6 flex justify-center lg:justify-end">
          <PlanVerticalStepper />
        </div>

      </div>
    </div>
  </section>
);

const FailureSection: React.FC = () => (
  <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem 8rem', borderTop: borderLine }}>
    <FailureAccordion />

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2.5rem] border border-[#c8b996]/20 bg-[#050504] p-10 md:p-16 text-center mt-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8b996]/10 via-transparent to-transparent pointer-events-none" />

      <p className="mb-2 text-[1.1rem] text-stone-300 md:text-[1.25rem]">
        È drammatico? Sì. È reale? Chiedi ai <strong className="text-white">3.200 coach e saloni</strong> che hanno chiuso nel 2024.
      </p>
      <p className="mb-10 text-[0.75rem] italic text-stone-500">Fonte: Report ISTAT Wellness Industry 2024</p>

      <h3 className="font-serif text-[2rem] font-light leading-[1.2] text-white md:text-[3.5rem] mb-12">
        "Ma Tu Non Sei Loro.<br />
        <span className="italic" style={{ color: C.gold, textShadow: '0 0 20px rgba(200,185,150,0.3)' }}>Perché Sei Ancora Qui."</span>
      </h3>

      <div className="flex flex-col items-center gap-4">
        <a
          href="https://luminel-manager.vercel.app/founder"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-br from-[#c8b996] to-[#a89976] px-8 py-4 text-[0.9rem] font-bold uppercase tracking-[0.15em] text-black no-underline transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(200,185,150,0.4)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Blocca Prezzo Founder Ora <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </span>
        </a>
        <span className="text-[0.8rem] font-semibold tracking-widest text-[#c8b996] uppercase bg-[#c8b996]/10 px-4 py-1.5 rounded-full border border-[#c8b996]/20">
          22 posti / 25 disponibili
        </span>
      </div>
    </motion.div>
  </section>
);

const LeadMagnetSection: React.FC = () => (
  <section style={{ maxWidth: '48rem', margin: '0 auto', padding: '7rem 1.5rem', borderTop: borderLine }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ position: 'relative', textAlign: 'center', padding: '3rem 2.5rem', borderRadius: '1.5rem', border: borderLine, background: 'rgba(240,232,210,0.02)', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 400, height: 250, background: 'radial-gradient(ellipse, rgba(240,232,210,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ width: 56, height: 56, borderRadius: '1rem', background: `${C.gold}18`, border: `1px solid ${C.goldDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Sparkles size={26} color={C.gold} />
        </div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', fontWeight: 300, marginBottom: '1rem' }}>Non pronto a decidere?</h2>
        <p style={{ color: '#78716c', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '30rem', margin: '0 auto 2rem' }}>
          Scarica gratis la guida che i nostri Founder hanno usato per passare da 50 a 180 clienti senza assumere staff.
        </p>
        <div style={{ background: 'rgba(240,232,210,0.03)', border: borderLine, borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.gold, marginBottom: '0.5rem' }}>PDF Gratuito</p>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', color: '#fff' }}>"I 7 Sistemi Che Ogni Coach €100K+ Usa Per Gestire 50+ Clienti"</h3>
          <p style={{ fontSize: '0.75rem', color: '#57534e', marginTop: '0.5rem' }}>24 pagine · Niente fluff · Implementabile oggi</p>
        </div>
        <form style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }} onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="La tua email migliore" style={{ flex: '1 1 220px', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(240,232,210,0.05)', border: borderLine, color: '#fff', fontSize: '0.85rem' }} />
          <button type="submit" style={{ padding: '0.9rem 2rem', borderRadius: '0.75rem', background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', fontWeight: 700, fontSize: '0.85rem', border: 'none' }}>Scarica →</button>
        </form>
        <p style={{ color: '#44403c', fontSize: '0.68rem', marginTop: '1.25rem' }}>Zero spam. Solo valore. Ti disiscrivi in un click.</p>
      </div>
    </motion.div>
  </section>
);

// --- Card AI Coach con indicatore "sta scrivendo" prima della risposta ----
const AICoachCard: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [showTyping, setShowTyping] = useState(false);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowTyping(false);
      setShowReply(false);
      return;
    }
    const t1 = setTimeout(() => setShowTyping(true), 500);
    const t2 = setTimeout(() => { setShowTyping(false); setShowReply(true); }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isActive]);

  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 40, scale: isActive ? 1 : 0.94 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', overflow: 'hidden', border: borderLine, background: '#070706', boxShadow: '0 40px 80px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '0.85rem 1.5rem', borderBottom: borderLine, background: 'rgba(240,232,210,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: C.goldMid }}>AI Coach · Contesto Attivo</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6FCF97' }} />
          <span style={{ fontSize: '0.55rem', color: '#6FCF97', fontWeight: 700, textTransform: 'uppercase' }}>Live</span>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <AnimatedImg src="/assets/images/media_1787944837542.jpg" alt="AI Coach" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070706 0%, transparent 55%)', zIndex: 5 }} />
        <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ padding: '0.5rem 0.85rem', borderRadius: '1rem', borderBottomRightRadius: '0.25rem', fontSize: '0.72rem', color: '#fff', maxWidth: '70%', background: 'rgba(240,232,210,0.1)', border: `1px solid rgba(240,232,210,0.15)` }}>Come sta andando questo mese?</div>
          </div>
          {showTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,#fff,${C.gold})` }} />
              <div style={{ padding: '0.65rem 0.9rem', borderRadius: '1rem', borderBottomLeftRadius: '0.25rem', background: 'rgba(240,232,210,0.04)', border: borderLine, display: 'flex', gap: '0.25rem' }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#78716c' }} />
                ))}
              </div>
            </motion.div>
          )}
          {showReply && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <motion.div animate={{ boxShadow: [`0 0 8px rgba(240,232,210,0.3)`, `0 0 18px rgba(240,232,210,0.6)`, `0 0 8px rgba(240,232,210,0.3)`] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,#fff,${C.gold})` }} />
              <div style={{ padding: '0.5rem 0.85rem', borderRadius: '1rem', borderBottomLeftRadius: '0.25rem', fontSize: '0.72rem', color: '#c8c4bc', maxWidth: '75%', background: 'rgba(240,232,210,0.04)', border: borderLine }}>Fatturato a €8.240, +12% sul mese scorso. 3 clienti a rischio — preparo un follow-up?</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- ANIMATED LETTER HELPER ---
const letterVariants = {
  hover: { y: "-50%" },
};
const AnimatedLetter = ({ letter }: { letter: string }) => {
  return (
    <div style={{ display: 'inline-block', height: '1.2em', overflow: 'hidden', color: C.gold, filter: 'drop-shadow(0 0 8px rgba(200,185,150,0.5))' }}>
      <motion.span style={{ display: 'flex', minWidth: '4px', flexDirection: 'column', y: "0%" }} variants={letterVariants} transition={{ duration: 0.5 }}>
        <span>{letter === " " ? "\u00A0" : letter}</span>
        <span>{letter === " " ? "\u00A0" : letter}</span>
      </motion.span>
    </div>
  );
};

// --- COLOR CHANGE CARD ---
interface FutureCardProps { heading: string; description: React.ReactNode; imgSrc: string; }
const FutureCard = ({ heading, description, imgSrc }: FutureCardProps) => {
  return (
    <motion.div
      transition={{ staggerChildren: 0.035 }}
      variants={{
        hover: { y: -8, boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px -10px rgba(200,185,150,0.15), inset 0 1px 0 rgba(255,255,255,0.05)` }
      }}
      whileHover="hover"
      className="group relative w-full cursor-pointer overflow-hidden"
      style={{
        minHeight: '22rem',
        background: '#050504', borderRadius: '1.5rem', border: '1px solid rgba(240,232,210,0.06)'
      }}
    >
      <div className="absolute inset-0 saturate-0 opacity-20 transition-all duration-700 md:group-hover:saturate-100 group-hover:opacity-40 group-hover:scale-110"
           style={{ backgroundImage: `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100"
           style={{ background: 'linear-gradient(to top, rgba(5,5,4,0.95) 0%, rgba(200,185,150,0.3) 100%)', mixBlendMode: 'overlay' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050504 10%, transparent 80%)' }} />
      
      <div className="relative z-20 flex h-full flex-col justify-between p-6 transition-colors duration-500">
        <div style={{ alignSelf: 'flex-end', padding: '0.75rem', borderRadius: '50%', background: 'rgba(240,232,210,0.05)', border: '1px solid rgba(240,232,210,0.1)' }} className="transition-all duration-500 group-hover:bg-white/10 group-hover:scale-125 group-hover:border-[rgba(200,185,150,0.4)]">
          <ArrowRight className="text-xl text-white/30 transition-all duration-500 group-hover:text-[#c8b996] group-hover:-rotate-45" size={18} />
        </div>
        <div>
          <h4 style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex' }}>
            {heading.split("").map((letter, index) => <AnimatedLetter letter={letter} key={index} />)}
          </h4>
          <div style={{ color: '#a8a29e', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 300 }}>{description}</div>
        </div>
      </div>
    </motion.div>
  );
};

const FutureSection: React.FC = () => {
  return (
    <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '4rem 1.5rem 8rem', borderTop: borderLine }}>
      <InteractiveSelector />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <Link to="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 3.5rem', borderRadius: '9999px', background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', boxShadow: `0 0 50px rgba(200,185,150,0.25)`, transition: 'all 0.4s', border: 'none' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = `0 0 70px rgba(200,185,150,0.4)`}
              onMouseOut={e => e.currentTarget.style.boxShadow = `0 0 50px rgba(200,185,150,0.25)`}>
          Lo Voglio <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export const LandingV3: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!featuresRef.current) return;
      const { top, height } = featuresRef.current.getBoundingClientRect();
      const ratio = Math.min(Math.max(-top / (height - window.innerHeight), 0), 1);
      if (ratio < 0.33) setActiveFeature(0);
      else if (ratio < 0.66) setActiveFeature(1);
      else setActiveFeature(2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#c8c4bc', fontFamily: 'Inter,sans-serif', overflowX: 'hidden' }}>
      <FallingStars />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 35% at 15% 10%, rgba(200,185,150,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 85% 85%, rgba(160,148,120,0.04) 0%, transparent 70%)' }} />

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1.2rem 2.5rem', backdropFilter: 'blur(24px)', borderBottom: borderLine, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5,5,4,0.6)' }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', letterSpacing: '0.22em', color: '#fff', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.div
            animate={{ boxShadow: ['0 0 8px 2px rgba(240,232,210,0.4)', '0 0 16px 4px rgba(240,232,210,0.8)', '0 0 8px 2px rgba(240,232,210,0.4)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }}
          />
          LUMINEL
        </div>
        <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#57534e' }}>
          {['#storia', '#soluzioni', '#pricing'].map((href, i) => (
            <a key={i} href={href} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseOver={e => (e.currentTarget.style.color = C.gold)} onMouseOut={e => (e.currentTarget.style.color = '#57534e')}>
              {['Chi Siamo', 'Soluzioni', 'Pricing'][i]}
            </a>
          ))}
        </nav>
        <Link to="/auth/login" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(240,232,210,0.4)', border: `1px solid rgba(240,232,210,0.12)`, borderRadius: '9999px', padding: '0.45rem 1.4rem', textDecoration: 'none', background: 'rgba(240,232,210,0.02)' }}>Accedi</Link>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>

        <motion.section style={{ opacity: heroOpacity, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem', paddingBottom: '2.5rem', padding: '6rem 1.5rem 2.5rem' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.2 }} style={{ textAlign: 'center', maxWidth: '72rem', margin: '0 auto 2.5rem', zIndex: 20 }}>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(3rem,7.5vw,8.5rem)', color: '#fff', lineHeight: 0.88, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
              Il tuo impero.<br />
              <span style={{ fontStyle: 'italic', fontWeight: 300, background: `linear-gradient(90deg, #ffffff, ${C.gold}, rgba(200,185,150,0.8))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Finalmente libero.
              </span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#7a7570', fontWeight: 300, maxWidth: '32rem', margin: '0 auto', lineHeight: 1.65 }}>
              L'ecosistema premium che orchestra ogni dettaglio della tua attività. Dalle prenotazioni al billing, restituiamo al tuo talento il tempo che merita.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, delay: 0.4 }} className="pointer-events-auto z-50" style={{ marginTop: '3.5rem' }}>
            <HolographicOrb />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }} style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 60 }}>
            <Link to="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 3rem', borderRadius: '9999px', background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', boxShadow: `0 0 40px rgba(240,232,210,0.2)`, border: 'none', transition: 'transform 0.2s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              Diventa Founding Member <ArrowRight size={16} />
            </Link>
            <Link to="/auth/login" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#44403c', textDecoration: 'none' }}>Ho già un account →</Link>
          </motion.div>
        </motion.section>

        <AiCoachHeroSection />

        <ProblemSection />
        <QuoteSection />
        <FutureSection />
        <FailureSection />
        <ProfessionsCarousel />

        <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '2rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(300px, 1fr)', gap: '4rem', alignItems: 'center', borderTop: borderLine }}>
          <LivingDashboardImage />
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: `1px solid ${C.goldDim}`, background: 'rgba(240,232,210,0.03)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: C.goldMid, width: 'max-content' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.goldMid }} />
              Costruito per chi vive di sessioni
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,3vw,3rem)', color: '#fff', fontWeight: 300, lineHeight: 1.2, margin: 0 }}>Il tuo studio,<br />elevato alla potenza dell'AI.</h2>
            <p style={{ color: '#6b6661', fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.75 }}>Mentre lavori con un cliente, Luminel tiene traccia di tutto il resto - appuntamenti, fatture, promemoria. Una mente instancabile, con i tuoi numeri sempre a portata di mano.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {HERO_BULLETS.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#a8a29e', fontWeight: 300 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: C.goldMid, boxShadow: `0 0 6px ${C.gold}`, flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        <PricingSection />
        
        <MetricsGridSection />

        <section id="storia" style={{ maxWidth: '76rem', margin: '0 auto', padding: '8rem 1.5rem', position: 'relative', borderTop: borderLine }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: '5rem', background: `linear-gradient(to bottom, ${C.goldMid}, transparent)` }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.2fr) minmax(320px, 1.3fr)', gap: '4rem', alignItems: 'start' }}>

            {/* Colonna immagine — foto vera + didascalia, come nell'originale */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ position: 'sticky', top: '6rem' }}
            >
              <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', border: borderLine, aspectRatio: '1/1' }}>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(0.95)' }}
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,4,0.9) 0%, transparent 40%)' }} />
              </div>
              <div style={{ marginTop: '-3rem', marginLeft: '1.25rem', marginRight: '1.25rem', position: 'relative', zIndex: 2, background: 'rgba(5,5,4,0.92)', backdropFilter: 'blur(16px)', border: `1px solid ${C.goldDim}`, borderRadius: '1rem', padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.gold, fontWeight: 700, margin: 0 }}>Michael Jara, 3AM Milano, 2023</p>
                <p style={{ fontSize: '0.78rem', color: '#a8a29e', margin: '0.25rem 0 0' }}>"L'ultima notte che passo su Excel"</p>
              </div>
            </motion.div>

            {/* Colonna testo — narrativa completa */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700, color: C.goldMid, display: 'block', marginBottom: '1.5rem' }}>Il Creatore-Ribelle</span>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,3.2vw,2.6rem)', color: '#fff', lineHeight: 1.25, fontWeight: 300, marginBottom: '1.75rem' }}>
                Nel 2022 ho fatto €180K di revenue.<br />
                <span style={{ color: '#f87171', fontStyle: 'italic' }}>E ho lavorato 73 ore a settimana.</span>
              </h2>

              <p style={{ color: '#a8a29e', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                Il problema non era trovare clienti. Il problema era <strong style={{ color: '#fff' }}>gestirli</strong>.
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['4 ore/giorno su Excel e WhatsApp', 'Email perse, pagamenti in ritardo', 'Zero tempo per la famiglia', 'Dashboard fatti in casa che crashavano'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#78716c' }}>
                    <span style={{ color: '#f87171', marginTop: 2 }}>•</span>{item}
                  </li>
                ))}
              </ul>

              <div style={{ borderLeft: `2px solid ${C.goldDim}`, background: 'rgba(240,232,210,0.02)', borderRadius: '0 0.75rem 0.75rem 0', padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
                <p style={{ color: '#a8a29e', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                  Ho provato 8 gestionali: Calendly (troppo basic), Acuity (esteticamente fermo al 2010), Mindbody (€400/mese, complessità inutile). <br /><br />
                  <strong style={{ color: '#fff', fontStyle: 'normal' }}>Tutti costruiti per ristoranti. Nessuno per professionisti come noi.</strong>
                </p>
              </div>

              <p style={{ color: '#78716c', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Così una sera, ore 2:47 AM, caffè numero sei:</p>
              <p style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: '#fff', fontStyle: 'italic', marginBottom: '1.75rem' }}>"Basta. Lo costruisco io."</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(240,232,210,0.04)', border: `1px solid ${C.goldDim}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.75rem' }}>
                {[{ v: '11', l: 'Mesi' }, { v: '847', l: 'Ore Coding' }, { v: '€47K', l: 'Investiti' }].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: C.gold, margin: 0 }}>{s.v}</p>
                    <p style={{ fontSize: '0.62rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0.2rem 0 0' }}>{s.l}</p>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '1.05rem', color: '#c8c4bc', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Oggi gestisco 180 clienti con Luminel.<br />
                <span style={{ color: C.gold, fontWeight: 700 }}>Tempo sul gestionale? 35 minuti al giorno.</span>
              </p>

              <p style={{ color: '#78716c', fontStyle: 'italic', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                Non è solo un software. È la mia libertà riconquistata. <br />
                <strong style={{ color: '#a8a29e', fontStyle: 'normal' }}>E ora, la tua.</strong>
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/auth/register" style={{ padding: '0.9rem 2rem', borderRadius: 9999, background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
                  Voglio la mia libertà →
                </Link>
                <a href="#soluzioni" style={{ padding: '0.9rem 2rem', borderRadius: 9999, border: `1px solid rgba(240,232,210,0.15)`, color: '#a8a29e', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
                  Mostrami il piano
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <SpectacularEcosystemSection />

        <section id="cta-finale" style={{ position: 'relative', padding: '10rem 1.5rem', textAlign: 'center', overflow: 'hidden', borderTop: borderLine }}>
          <AnimatedImg src="/assets/images/foto 7 lading.png" alt="" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${C.bg} 0%, rgba(5,5,4,0.82) 50%, transparent 100%)` }} />
          
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '52rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
              style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.4rem,5vw,4.5rem)', color: '#fff', fontWeight: 300, lineHeight: 1.15, marginBottom: '1.5rem' }}>
              Il Momento è Adesso.<br /><span style={{ color: C.gold, fontStyle: 'italic' }}>La Scelta è Tua.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
              style={{ color: '#a8a29e', fontSize: '1rem', lineHeight: 1.7, maxWidth: '32rem', margin: '0 auto 2.5rem' }}>
              25 posti Founder rimasti. Prezzo bloccato a vita. Onboarding personale con me. 14 giorni trial senza carta.
            </motion.p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
              <a href="#prezzi" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', padding: '1.2rem 3.5rem', borderRadius: '9999px', border: `1px solid rgba(240,232,210,0.3)`, background: 'rgba(5,5,4,0.7)', backdropFilter: 'blur(20px)', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', boxShadow: `0 0 50px rgba(240,232,210,0.15)`, transition: 'all 0.3s ease' }}>
                Reclama Il Tuo Posto Founder <ArrowRight size={16} />
              </a>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#78716c' }}>Oppure</span>
                <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div style={{ background: 'rgba(240,232,210,0.02)', border: borderLine, borderRadius: '1.5rem', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '32rem', width: '100%', backdropFilter: 'blur(10px)', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#a8a29e', margin: 0, fontWeight: 300 }}>Non sei ancora pronto a decidere?</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <input type="email" placeholder="La tua email migliore" style={{ flex: '1 1 200px', padding: '0.9rem 1.25rem', borderRadius: '99px', background: 'rgba(240,232,210,0.05)', border: borderLine, color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                  <button style={{ padding: '0.9rem 1.5rem', borderRadius: '99px', background: `linear-gradient(90deg, ${C.gold}, #f0d080)`, color: '#050504', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Scarica il PDF Gratis</button>
                </div>
                <p style={{ fontSize: '0.7rem', color: '#78716c', margin: 0 }}>Ricevi "I 7 Sistemi Che Ogni Coach usa per gestire 50+ clienti"</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ padding: '2.5rem 2.5rem', borderTop: borderLine, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2d2b28' }}>Luminel Manager © 2026 — Gestionale Premium per Professionisti del Benessere.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy', 'Termini'].map(l => <a key={l} href="#" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2d2b28', textDecoration: 'none' }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
};