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
    mouseX.set((e.clientX - cx) / rect.width * 12);
    mouseY.set((e.clientY - cy) / rect.height * -12);
  };

  return (
    <div
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ position: 'relative', width: 'clamp(260px,38vw,480px)', height: 'clamp(260px,38vw,480px)', margin: '0 auto' }}
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
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, black 0%, transparent 55%)', zIndex: 10 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)', zIndex: 11 }} />
          <img
            src="/assets/images/media_1787944837526.png"
            alt="Luminel — la tua attività, a fuoco"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1)', opacity: 0.95, mixBlendMode: 'screen' }}
          />
          <div style={{ position: 'absolute', inset: 0, zIndex: 12, background: 'radial-gradient(ellipse at 40% 30%, rgba(240,232,210,0.08) 0%, transparent 60%)' }} />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '1.5rem', right: '-4rem', zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(5,5,4,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(240,232,210,0.1)' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,232,210,0.08)', border: '1px solid rgba(240,232,210,0.25)' }}>
          <Brain size={13} style={{ color: C.gold }} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>AI Coach Attivo</p>
          <p style={{ fontSize: 9, color: '#78716c', fontFamily: 'monospace', margin: 0 }}>Contesto business live</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        style={{ position: 'absolute', bottom: '2rem', left: '-4rem', zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(5,5,4,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(240,232,210,0.1)' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(200,185,150,0.08)', border: '1px solid rgba(200,185,150,0.3)' }}>
          <Activity size={13} style={{ color: C.goldMid }} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Fatturato Mese</p>
          <p style={{ fontSize: 9, color: '#78716c', fontFamily: 'monospace', margin: 0 }}>+12.4% vs mese scorso</p>
        </div>
      </motion.div>
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
        animate={{ scale: hov ? 1.05 : 1, filter: hov ? 'brightness(1) saturate(1.1)' : 'brightness(0.7) saturate(0.5) sepia(0.3)' }}
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

const CategoriesSection: React.FC = () => {
  const [joinedWaitlist, setJoinedWaitlist] = useState<string[]>([]);

  return (
    <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '7rem 1.5rem', borderTop: '1px solid rgba(240,232,210,0.07)' }}>
      <div style={{ textAlign: 'center', maxWidth: '46rem', margin: '0 auto 4rem' }}>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(200,185,150,0.7)', display: 'block', marginBottom: '1.25rem' }}>Per Chi È Luminel</span>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,3.5vw,3.2rem)', color: '#fff', fontWeight: 300, lineHeight: 1.25 }}>
          Costruito per chi vive di sessioni,<br />non di scontrini.
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem' }}>
        {PROFESSIONAL_CATEGORIES.map((cat, idx) => {
          const isLive = cat.status === 'live';
          const hasJoined = joinedWaitlist.includes(cat.id);

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              whileHover={isLive ? { y: -4 } : {}}
              style={{
                position: 'relative',
                padding: '2rem 1.75rem',
                borderRadius: '1.25rem',
                border: isLive ? '1px solid rgba(240,232,210,0.28)' : '1px solid rgba(240,232,210,0.06)',
                background: isLive
                  ? 'linear-gradient(160deg, rgba(240,232,210,0.06), rgba(5,5,4,0.6))'
                  : 'rgba(240,232,210,0.015)',
                opacity: isLive ? 1 : 0.7,
                overflow: 'hidden',
              }}
            >
              {isLive && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,232,210,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}
                />
              )}

              <div style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem',
                background: isLive ? 'rgba(240,232,210,0.15)' : 'rgba(240,232,210,0.04)',
                color: isLive ? 'rgba(240,232,210,1)' : 'rgba(160,148,120,0.6)'
              }}>
                {isLive ? (
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                ) : (
                  <Clock size={10} />
                )}
                {isLive ? 'Attivo Ora' : 'Coming Soon'}
              </div>

              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', color: '#fff', fontWeight: 300, marginBottom: '0.65rem' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#78716c', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '3.2em' }}>{cat.desc}</p>

              {isLive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#F0A868', fontWeight: 600, borderTop: '1px solid rgba(240,232,210,0.08)', paddingTop: '1rem' }}>
                  <Flame size={13} />
                  {cat.fomo}
                </div>
              ) : (
                <button
                  onClick={() => setJoinedWaitlist(prev => [...prev, cat.id])}
                  disabled={hasJoined}
                  style={{
                    width: '100%', padding: '0.65rem', borderRadius: '0.65rem', fontSize: '0.72rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: hasJoined ? 'default' : 'pointer',
                    background: hasJoined ? 'rgba(111,207,151,0.1)' : 'rgba(240,232,210,0.05)',
                    border: hasJoined ? '1px solid rgba(111,207,151,0.3)' : '1px solid rgba(240,232,210,0.12)',
                    color: hasJoined ? '#6FCF97' : 'rgba(200,185,150,0.7)',
                  }}
                >
                  {hasJoined ? '✓ Sei in lista' : 'Unisciti alla lista d\'attesa'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// --- SEZIONE: Pricing arricchito ----------------------------------------------
// FIX (29 ago 2026): ora si autoalimenta dal DB come FounderLanding/HomeLanding,
// con stato di caricamento/errore esplicito — niente più array locale, niente
// più fallback silenzioso su prezzi potenzialmente disallineati.
const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<TierPlan[] | null>(null);
  const [plansError, setPlansError] = useState(false);

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
    <section id="pricing" style={{ padding: '8rem 1.5rem', maxWidth: '76rem', margin: '0 auto', position: 'relative', zIndex: 20, borderTop: borderLine }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.08 }}
              style={{
                position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                padding: '2rem 2.5rem', borderRadius: '1.25rem',
                border: plan.popular ? '1px solid rgba(240,232,210,0.2)' : borderLine,
                background: plan.popular ? 'linear-gradient(110deg,rgba(240,232,210,0.05) 0%,rgba(5,5,4,0.9) 100%)' : 'rgba(240,232,210,0.01)',
                backdropFilter: 'blur(20px)', overflow: 'hidden',
              }}
            >
              {plan.popular && <div style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 260, background: 'radial-gradient(circle,rgba(240,232,210,0.07) 0%,transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />}

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.4rem,2vw,1.9rem)', color: '#fff', fontWeight: 300, margin: 0 }}>{plan.name}</h3>
                    {plan.popular && <span style={{ padding: '0.18rem 0.7rem', borderRadius: '9999px', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#050504', background: '#fff' }}>Raccomandato</span>}
                  </div>
                  <p style={{ color: '#44403c', fontWeight: 300, fontSize: '0.82rem', marginBottom: '0.9rem' }}>{plan.tagline}</p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(200,185,150,0.7)', fontWeight: 500, marginBottom: '0.4rem' }}>{plan.whoFor}</p>
                  <p style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.6, marginBottom: '1rem', maxWidth: '30rem' }}>Risolve: {plan.solves}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.4rem', marginBottom: plan.edge ? '1rem' : 0 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#a8a29e', fontWeight: 300 }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(160,148,120,0.4)' }} />{f}
                      </div>
                    ))}
                  </div>
                  {plan.edge && (
                    <p style={{ fontSize: '0.78rem', color: 'rgba(240,232,210,0.65)', fontStyle: 'italic', borderLeft: '2px solid rgba(160,148,120,0.4)', paddingLeft: '0.85rem', maxWidth: '30rem' }}>
                      {plan.edge}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, borderLeft: borderLine, paddingLeft: '2.25rem' }}>
                  {/* FIX: € vero invece del testo "EUR" mangiato da un problema di codifica */}
                  <div style={{ fontSize: '0.6rem', color: '#2d2b28', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>invece di €{plan.pricePublic}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.1rem' }}>
                    <span style={{ color: '#44403c', fontSize: '1.1rem' }}>€</span>
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.2rem,3.2vw,3.2rem)', color: '#fff', fontWeight: 300, lineHeight: 1 }}>{plan.priceFounderMonthly}</span>
                    <span style={{ color: '#44403c', fontSize: '0.8rem' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(111,207,151,0.9)', marginBottom: '0.9rem' }}>Risparmi {getDiscountPercent(plan)}%</div>
                  <Link to={`/auth/register?plan=${plan.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.6rem', borderRadius: '9999px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', textDecoration: 'none', fontWeight: plan.popular ? 700 : 400, background: plan.popular ? '#fff' : 'transparent', color: plan.popular ? '#050504' : 'rgba(160,148,120,0.4)', border: plan.popular ? 'none' : '1px solid rgba(240,232,210,0.12)', whiteSpace: 'nowrap' }}>
                    Scegli {plan.name} <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

const MichaelStorySection: React.FC = () => (
  <section style={{ maxWidth: '64rem', margin: '0 auto', padding: '8rem 1.5rem', borderTop: borderLine }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        position: 'relative',
        borderRadius: '1.5rem',
        background: 'rgba(12,11,9,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(240,232,210,0.1)',
        overflow: 'hidden',
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 40px -10px ${C.glow}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '3.5rem', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.goldMid, display: 'block', marginBottom: '1.25rem' }}>
            Il Creatore-Ribelle
          </span>
          <h3 style={{ fontSize: '2.5rem', fontFamily: 'Georgia,serif', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Dal Caos alla Calma: <br /><span style={{ color: C.gold, fontStyle: 'italic' }}>IL 2:47 AM</span>
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '2rem' }}>
            "Lavoravo 73 ore a settimana, perdevo appuntamenti ed ero schiavo del mio stesso successo. Luminel non è nato in una sala riunioni: è nato alle 2:47 del mattino per salvare il mio tempo e la mia salute mentale. Oggi gestisco tutto in 35 minuti al giorno."
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* FIX (29 ago 2026): era /assets/michael-jara.png — il file vero
                è in public/michael-jara.png (root), path sbagliato = immagine
                rotta. Corretto qui. */}
            <img src="/michael-jara.png" alt="Michael" style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: `1px solid ${C.goldDim}`, objectFit: 'cover' }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Michael Jara</div>
              <div style={{ color: C.goldDim, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Founder, Luminel</div>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-2rem', background: `radial-gradient(circle at center, ${C.glow}, transparent 70%)`, filter: 'blur(30px)' }} />
          <img src="/assets/images/media_1787944837542.jpg" alt="Coding at night" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }} />
        </div>
      </div>
    </motion.div>
  </section>
);

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

const MetricsGridSection: React.FC = () => {
  return (
    <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '6rem 1.5rem 8rem', borderTop: borderLine }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.goldMid, display: 'block', marginBottom: '1.25rem' }}>
          Metriche di Eccellenza
        </span>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontFamily: 'Georgia,serif', color: '#fff' }}>I Numeri dell'Efficienza</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{
                background: 'rgba(12,11,9,0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(240,232,210,0.06)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
              whileHover={{
                y: -8,
                borderColor: C.goldDim,
                boxShadow: `0 15px 40px -10px rgba(0,0,0,0.8), 0 0 30px -10px ${C.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
              }}
            >
              <motion.div
                animate={{ opacity: [0.1, 0.7, 0.1], backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                  backgroundSize: '200% 100%'
                }}
              />

              <Icon style={{ width: '2rem', height: '2rem', marginBottom: '1.5rem', color: C.goldMid }} />
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', fontWeight: 600 }}>
                {m.title}
              </h4>
              <div style={{ fontSize: '3rem', fontWeight: 300, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '6px', fontFamily: 'Georgia,serif' }}>
                <span>{m.value}</span>
                <span style={{ fontSize: '1.25rem', color: C.goldMid, fontFamily: 'system-ui' }}>{m.suffix}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {m.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export const LandingV2: React.FC = () => {
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
              Fai luce<br />
              <span style={{ fontStyle: 'italic', fontWeight: 300, background: `linear-gradient(90deg, #ffffff, ${C.gold}, rgba(200,185,150,0.8))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                sul tuo business.
              </span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#7a7570', fontWeight: 300, maxWidth: '32rem', margin: '0 auto', lineHeight: 1.65 }}>
              Il gestionale che restituisce a coach e operatori del benessere il tempo che meritano. Setup in 47 minuti.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, delay: 0.4 }}>
            <HolographicOrb />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }} style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Link to="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.95rem 2.5rem', borderRadius: '9999px', border: `1px solid rgba(240,232,210,0.3)`, background: 'rgba(5,5,4,0.7)', backdropFilter: 'blur(20px)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.18em', boxShadow: `0 0 40px rgba(240,232,210,0.08)` }}>
              Diventa Founding Member
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, #fff, ${C.gold})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={13} color="#050504" />
              </div>
            </Link>
            <Link to="/auth/login" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#44403c', textDecoration: 'none' }}>Ho già un account →</Link>
          </motion.div>
        </motion.section>

        <section id="storia" style={{ padding: '8rem 1.5rem', maxWidth: '56rem', margin: '0 auto', textAlign: 'center', position: 'relative', borderTop: borderLine }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: '5rem', background: `linear-gradient(to bottom, ${C.goldMid}, transparent)` }} />
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700, color: C.goldMid, display: 'block', marginBottom: '2.5rem' }}>Gestionale Premium</span>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,3vw,2.8rem)', color: '#fff', lineHeight: 1.3, fontWeight: 300, marginBottom: '2.5rem' }}>
              Per i professionisti che non accettano compromessi tra{' '}
              <em style={{ color: C.gold, fontStyle: 'normal' }}>crescita</em> e{' '}
              <em style={{ color: '#44403c', fontStyle: 'normal' }}>libertà</em>.
            </p>
            <p style={{ color: '#6b6661', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.8 }}>
              Sappiamo cosa significa gestire decine di clienti, inseguire Excel a mezzanotte e perdere un appuntamento per un messaggio letto in ritardo.
              Luminel non è un banale gestionale — è l'intelligenza che riporta ordine nel caos e protegge il tuo tempo, 24 ore su 24.
            </p>
          </motion.div>
        </section>

        <MichaelStorySection />
        <CategoriesSection />

        <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '2rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 3fr) minmax(300px, 1fr)', gap: '4rem', alignItems: 'center', borderTop: borderLine }}>
          <AnimatedImg
            src="/assets/images/media_1787944837657.jpg"
            alt="Dashboard Luminel"
            delay={0}
            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.7)', transform: 'scale(1.08)', transformOrigin: 'center left' }}
          />
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: `1px solid ${C.goldDim}`, background: 'rgba(240,232,210,0.03)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: C.goldMid, width: 'max-content' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.goldMid }} />
              Costruito per chi vive di sessioni
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,3vw,3rem)', color: '#fff', fontWeight: 300, lineHeight: 1.2, margin: 0 }}>Il tuo studio,<br />elevato alla potenza dell'AI.</h2>
            <p style={{ color: '#6b6661', fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.75 }}>Mentre lavori con un cliente, Luminel tiene traccia di tutto il resto — appuntamenti, fatture, promemoria. Una mente instancabile, con i tuoi numeri sempre a portata di mano.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {HERO_BULLETS.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#a8a29e', fontWeight: 300 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: C.goldMid, boxShadow: `0 0 6px ${C.gold}`, flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        <section id="soluzioni" ref={featuresRef} style={{ position: 'relative', height: '220vh', borderTop: borderLine }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5rem clamp(1.5rem,5vw,5rem)', maxWidth: '1400px', margin: '0 auto', gap: '3rem', overflow: 'hidden' }}>
            <div style={{ flex: '0 0 44%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <FeatureItem num="01" title="AI Coach" isActive={activeFeature === 0} desc="Legge il tuo fatturato, la retention, i clienti a rischio — e ti parla prima ancora che tu apra la dashboard. Contesto reale, non risposte generiche." />
              <FeatureItem num="02" title="Integrazioni" isActive={activeFeature === 1} desc="Google Calendar, Stripe, promemoria WhatsApp. Si fonde negli strumenti che già usi, senza farti cambiare abitudini." />
              <FeatureItem num="03" title="Sicurezza Totale" isActive={activeFeature === 2} desc="I dati tuoi e dei tuoi clienti sono isolati a livello di database, non solo di interfaccia. Sovranità totale, zero compromessi." />
            </div>
            <div style={{ flex: '0 0 52%', height: '72vh', position: 'relative' }}>

              <motion.div
                animate={{ opacity: activeFeature === 0 ? 1 : 0, y: activeFeature === 0 ? 0 : 40, scale: activeFeature === 0 ? 1 : 0.94 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', overflow: 'hidden', border: borderLine, background: '#070706', boxShadow: '0 40px 80px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ padding: '0.85rem 1.5rem', borderBottom: borderLine, background: 'rgba(240,232,210,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: C.goldMid }}>AI Coach · Contesto Attivo</span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {[0, 0, 1].map((a, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: a ? C.goldDim : '#1c1a18' }} />)}
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <AnimatedImg src="/assets/images/media_1787944837542.jpg" alt="AI Coach" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070706 0%, transparent 55%)', zIndex: 5 }} />
                  <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', zIndex: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ padding: '0.5rem 0.85rem', borderRadius: '1rem', borderBottomRightRadius: '0.25rem', fontSize: '0.72rem', color: '#fff', maxWidth: '70%', background: 'rgba(240,232,210,0.1)', border: `1px solid rgba(240,232,210,0.15)` }}>Come sta andando questo mese?</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <motion.div animate={{ boxShadow: [`0 0 8px rgba(240,232,210,0.3)`, `0 0 18px rgba(240,232,210,0.6)`, `0 0 8px rgba(240,232,210,0.3)`] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,#fff,${C.gold})` }} />
                      <div style={{ padding: '0.5rem 0.85rem', borderRadius: '1rem', borderBottomLeftRadius: '0.25rem', fontSize: '0.72rem', color: '#c8c4bc', maxWidth: '75%', background: 'rgba(240,232,210,0.04)', border: borderLine }}>Fatturato a €8.240, +12% sul mese scorso. 3 clienti a rischio — preparo un follow-up?</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ opacity: activeFeature === 1 ? 1 : 0, y: activeFeature === 1 ? 0 : 40, scale: activeFeature === 1 ? 1 : 0.94 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', overflow: 'hidden', border: borderLine, background: '#070706', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', padding: '2.5rem' }}
              >
                <AnimatedImg src="/assets/images/media_1787930246309.png" alt="Integrazioni" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0, opacity: 0.12 }} />
                <p style={{ position: 'relative', zIndex: 1, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: '#44403c', marginBottom: '0.5rem' }}>Strumenti Connessi</p>
                {INTEGRATIONS.map((p, i) => (
                  <div key={i} style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '22rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', borderRadius: '0.85rem', background: 'rgba(240,232,210,0.02)', border: borderLine }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.active ? C.gold : '#2a2825', boxShadow: p.active ? `0 0 8px ${C.gold}` : 'none' }} />
                    <span style={{ flex: 1, fontSize: '0.82rem', fontFamily: 'monospace', color: '#a8a29e' }}>{p.name}</span>
                    <div style={{ width: 38, height: 20, borderRadius: 9999, background: p.active ? 'rgba(240,232,210,0.3)' : '#1c1a18', position: 'relative', border: `1px solid rgba(240,232,210,${p.active ? 0.3 : 0.05})` }}>
                      <div style={{ position: 'absolute', top: 2, width: 15, height: 15, borderRadius: '50%', background: p.active ? '#fff' : '#44403c', transition: 'all 0.3s', ...(p.active ? { right: 2 } : { left: 2 }) }} />
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                animate={{ opacity: activeFeature === 2 ? 1 : 0, y: activeFeature === 2 ? 0 : 40, scale: activeFeature === 2 ? 1 : 0.94 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', overflow: 'hidden', border: borderLine, background: '#070706' }}
              >
                <AnimatedImg src="/assets/images/media_1787930221023.png" alt="Sicurezza" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070706 0%, rgba(7,7,6,0.5) 50%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '2.5rem', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
                  <motion.div
                    whileHover={{ scale: 1.12, boxShadow: `0 0 60px rgba(255,255,255,0.4)` }}
                    style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 30px rgba(255,255,255,0.2)' }}
                  >
                    <Lock size={26} color="#050504" />
                  </motion.div>
                  <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6661' }}>Row Level Security · Verificata</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '6rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto', gap: '1.5rem', borderTop: borderLine }}>
          <AnimatedImg src="/assets/images/media_1787930226434.jpg" alt="Ecosistema" delay={0} style={{ gridColumn: '1', gridRow: '1', height: '420px' }} />
          <div style={{ gridColumn: '2', gridRow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.5rem', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.goldDim }}>Ecosistema</span>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,2.5vw,2.8rem)', color: '#fff', fontWeight: 300, lineHeight: 1.2, margin: 0 }}>Luminel fa parte<br />di qualcosa di più grande.</h2>
            <p style={{ color: '#57534e', fontWeight: 300, lineHeight: 1.75, fontSize: '0.95rem' }}>VirtualTwin, VirtualBNB, LuminelCoach, Insolita Academy, MichaelLuminels. Un ecosistema di prodotti AI interconnessi che evolvono insieme al tuo business.</p>
          </div>
          <AnimatedImg src="/assets/images/media_1787944837651.jpg" alt="Vision" delay={0.1} style={{ gridColumn: '1 / 3', height: '360px' }} />
        </section>

        <MetricsGridSection />
        <PricingSection />

        <section style={{ position: 'relative', padding: '10rem 1.5rem', textAlign: 'center', overflow: 'hidden', borderTop: borderLine }}>
          <AnimatedImg src="/assets/images/foto 7 lading.png" alt="" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${C.bg} 0%, rgba(5,5,4,0.82) 50%, transparent 100%)` }} />
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '52rem', margin: '0 auto' }}>
            <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
              style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.8rem,5.5vw,5rem)', color: '#fff', fontWeight: 300, lineHeight: 1.15, marginBottom: '2rem' }}>
              La tua chiarezza<br />inizia oggi.
            </motion.h2>
            <Link to="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1.1rem 2.8rem', borderRadius: '9999px', border: `1px solid rgba(240,232,210,0.25)`, background: 'rgba(5,5,4,0.6)', backdropFilter: 'blur(20px)', color: '#fff', textDecoration: 'none', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', boxShadow: `0 0 40px rgba(240,232,210,0.07)`, marginTop: '1.5rem' }}>
              Diventa Founding Member
            </Link>
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