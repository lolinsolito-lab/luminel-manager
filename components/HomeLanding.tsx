/**
 * 👑 Luminel Manager Elite
 * ----------------------------------------------------
 * "Architecting Digital Empires for High-Performance Professionals 2026"
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Sparkles, ArrowRight, Shield, Rocket, Heart,
    Users, Building2, Zap, Star, ChevronRight, MessageCircle,
    Check, Play, Calendar, Table, Clock, Menu, X, Coffee,
    AlertTriangle, TrendingDown, Briefcase, Quote, ChevronDown, Gift,
    BarChart3, Bot, CreditCard, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFounderSpotsRemaining, getSubscriptionPlans } from '../services/waitlistService';
import stripeService from '../services/stripeService';
import { PlanId } from '../services/stripePrices';
import { getMergedPricingPlans, getDiscountPercent, TierPlan } from '../services/pricingPlans';

const PAIN_POINTS = [
    { icon: Table, title: '2 Ore Su Excel', desc: 'Ogni sera, inserire manualmente fatture e appuntamenti del giorno. Frustrante.', stat: '730h', statLabel: 'perse/anno' },
    { icon: MessageCircle, title: 'WhatsApp Caos', desc: '"Dove hai messo quello screenshot? Quale cliente mi pagò?" Chat infinito.', stat: '€600', statLabel: 'persi/mese' },
    { icon: Calendar, title: '5 Tool Diversi', desc: 'Calendar, CRM, Excel, Notes, Dropbox... nessuno che parla tra loro.', stat: '92%', statLabel: 'perdono tempo' }
];

// FIX (28 ago 2026): TESTIMONIALS rimosso — Marco T./Sara L./Giulia M. erano
// copy scritto in anticipo, non founder reali. Confermato dal founder.
// Riattivare questa sezione SOLO con dati di founder veri, quando esisteranno.

const PLAN_STEPS = [
    { num: '01', title: 'Blocca Prezzo Founder', desc: 'Scegli il tuo piano e blocca il prezzo per sempre. Quando chiude, il prezzo raddoppia.', badge: 'Offerta limitata', badgeColor: 'amber', icon: Lock },
    { num: '02', title: 'Setup in 47 Minuti', desc: 'Import clienti, configura orari, carica logo. Nessun corso. Nessun developer. Solo tu e Luminel.', badge: 'Zero carta richiesta', badgeColor: 'emerald', icon: Rocket },
    { num: '03', title: 'Onboarding VIP con Michael', desc: 'Call 1:1 di 30 minuti. Setup personale. Accesso diretto al Founder. Solo per i primi 25.', badge: 'Esclusivo Founder', badgeColor: 'violet', icon: Crown }
];

export const HomeLanding: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [founderSpots, setFounderSpots] = useState(22);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
    // FIX (28 ago 2026): niente più TIER_PLANS locale — era la causa del
    // disallineamento con FounderLanding.tsx. Ora usa il file condiviso.
    const [plans, setPlans] = useState<TierPlan[] | null>(null);
    const [plansError, setPlansError] = useState(false);

    useEffect(() => {
        const loadSpots = async () => {
            try {
                const spots = await getFounderSpotsRemaining();
                setFounderSpots(spots);
            } catch (e) {
                console.warn('Could not load spots, using default');
            }
        };
        loadSpots();
    }, []);

    // FIX (28 ago 2026): usa getMergedPricingPlans() del file condiviso —
    // stessa logica di FounderLanding.tsx, stessa fonte. Se il fetch fallisce
    // o è vuoto, stato di errore esplicito — mai un fallback silenzioso.
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
                console.error('[HomeLanding] Impossibile caricare i prezzi dal DB:', e);
                setPlansError(true);
            }
        };
        loadPlans();
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#060606] text-white overflow-x-hidden">

            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 30, -15, 0], y: [0, -25, 20, 0], scale: [1, 1.12, 0.92, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-[8%] -left-[5%] w-[55vw] h-[55vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.22) 0%, transparent 70%)', filter: 'blur(70px)' }}
                />
                <motion.div
                    animate={{ x: [0, -35, 22, 0], y: [0, 18, -28, 0], scale: [1.1, 0.95, 1.2, 1.1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[15%] -right-[8%] w-[45vw] h-[45vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 70%)', filter: 'blur(80px)' }}
                />
                <motion.div
                    animate={{ x: [0, 18, 0], y: [0, 22, 0], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[5%] left-[25%] w-[38vw] h-[38vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(201,169,98,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,98,0.025) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                    }}
                />
            </div>

            <nav className="fixed top-4 md:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[600px]">
                <div className="bg-[#080808]/75 backdrop-blur-[20px] border border-[#C9A962]/[0.18] rounded-full px-4 md:px-5 py-2.5 flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-[30px] h-[30px] bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] rounded-lg flex items-center justify-center">
                            <Crown className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-[15px] tracking-tight">Luminel</span>
                    </div>

                    <div className="hidden md:flex gap-6 flex-1 justify-center">
                        <button onClick={() => scrollToSection('prodotto')} className="text-[13px] text-white/40 hover:text-white/80 transition-colors">Prodotto</button>
                        <button onClick={() => scrollToSection('piano')} className="text-[13px] text-white/40 hover:text-white/80 transition-colors">Prezzi</button>
                        <button onClick={() => scrollToSection('storia')} className="text-[13px] text-white/40 hover:text-white/80 transition-colors">Founder</button>
                    </div>

                    <Link
                        to="/login"
                        className="hidden md:block bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] text-black rounded-full px-4 py-1.5 text-[12px] font-bold flex-shrink-0 hover:shadow-lg hover:shadow-[#C9A962]/30 transition-all"
                    >
                        Accedi →
                    </Link>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden ml-auto text-white/60 hover:text-white transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3"
                        >
                            <button onClick={() => scrollToSection('prodotto')} className="block w-full text-left text-[15px] text-white/60 hover:text-white py-2">Prodotto</button>
                            <button onClick={() => scrollToSection('piano')} className="block w-full text-left text-[15px] text-white/60 hover:text-white py-2">Prezzi</button>
                            <button onClick={() => scrollToSection('storia')} className="block w-full text-left text-[15px] text-white/60 hover:text-white py-2">Founder</button>
                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <Link to="/login" className="block w-full py-3 text-center text-white/60 border border-white/10 rounded-xl text-sm font-medium">Accedi</Link>
                                <Link to="/founder" className="block w-full py-3 text-center bg-gradient-to-r from-[#C9A962] to-[#7a5d1e] text-black rounded-xl text-sm font-bold">Diventa Founder →</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <section className="relative z-10 pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-8">
                <div className="max-w-[840px] mx-auto text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="inline-flex items-center gap-2 border border-[#C9A962]/35 rounded-full px-4 py-1.5 mb-7 bg-[#C9A962]/[0.06]"
                        style={{ animation: 'badgePulse 2.5s ease-in-out infinite' }}
                    >
                        <div className="w-[5px] h-[5px] rounded-full bg-[#C9A962] shadow-[0_0_6px_#C9A962]" />
                        <span className="text-[10px] font-bold tracking-[0.14em] text-[#C9A962] uppercase">
                            Solo {founderSpots} posti Founder disponibili
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                        className="text-[clamp(40px,7vw,80px)] font-serif font-extrabold leading-[1.0] tracking-[-0.04em] mb-5"
                    >
                        <span className="text-white">Il tuo Impero.</span>
                        <br />
                        <span className="bg-gradient-to-r from-[#C9A962] via-[#f0d080] to-[#C9A962] bg-clip-text text-transparent">
                            Finalmente libero.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-[17px] leading-[1.75] text-white/45 max-w-[520px] mx-auto mb-10"
                    >
                        Basta Excel. Basta WhatsApp caotici. Un'unica piattaforma premium che gestisce tutto —
                        <span className="text-white/80"> in 19 minuti al giorno.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.55 }}
                        className="flex gap-3 md:gap-4 justify-center flex-wrap mb-14"
                    >
                        <Link
                            to="/founder"
                            className="bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] text-black rounded-full px-6 md:px-8 py-3.5 text-[14px] font-bold shadow-[0_0_35px_rgba(201,169,98,0.35)] hover:shadow-[0_0_50px_rgba(201,169,98,0.5)] hover:scale-[1.03] transition-all"
                        >
                            Reclama Il Tuo Posto Founder →
                        </Link>
                        <button
                            onClick={() => scrollToSection('prodotto')}
                            className="bg-transparent text-white/55 border border-white/[0.14] rounded-full px-6 md:px-7 py-3.5 text-[14px] font-medium hover:bg-white/5 hover:text-white/80 transition-all"
                        >
                            ▶ Guarda la Demo
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.55 }}
                        className="flex max-w-[500px] mx-auto mb-16 border border-white/[0.07] rounded-2xl overflow-hidden bg-white/[0.02]"
                    >
                        {[
                            { value: '47', unit: 'min', label: 'setup iniziale' },
                            { value: '19', unit: 'min', label: 'gestione al giorno' },
                            { value: '92', unit: '%', label: 'risparmio su admin' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={`flex-1 py-5 px-3 text-center ${i < 2 ? 'border-r border-white/[0.07]' : ''}`}
                            >
                                <div className="text-[34px] font-extrabold font-serif leading-none mb-1.5 bg-gradient-to-br from-[#C9A962] to-[#f0d080] bg-clip-text text-transparent">
                                    {stat.value}<span className="text-[20px]">{stat.unit}</span>
                                </div>
                                <div className="text-[11px] text-white/35 tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="relative"
                    >
                        <div className="absolute top-[20%] left-[15%] right-[15%] bottom-0 bg-[radial-gradient(ellipse,rgba(201,169,98,0.18)_0%,transparent_70%)] blur-[50px] pointer-events-none" />

                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute left-0 md:-left-[2%] top-[22%] z-20 backdrop-blur-[10px] rounded-xl px-3 py-2.5 text-[11px] font-bold bg-[#C9A962]/[0.12] border border-[#C9A962]/30 text-[#C9A962] hidden md:block"
                        >
                            +€2.800 MRR
                            <br />
                            <span className="text-white/35 font-normal">vs mese scorso</span>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            className="absolute right-0 md:-right-[2%] top-[18%] z-20 backdrop-blur-[10px] rounded-xl px-3 py-2.5 text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hidden md:block"
                        >
                            ✓ 0 Appuntamenti Persi
                            <br />
                            <span className="text-white/35 font-normal">questo mese</span>
                        </motion.div>

                        <div className="relative z-10 bg-gradient-to-br from-[#121212]/[0.97] to-[#0a0a0a]/[0.99] border border-[#C9A962]/[0.22] rounded-[20px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(201,169,98,0.08)]">

                            <div className="absolute left-0 right-0 h-[25%] pointer-events-none z-[5]"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent, rgba(201,169,98,0.035), transparent)',
                                    animation: 'scanLine 4s linear infinite',
                                }}
                            />

                            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
                                <div className="flex gap-[5px]">
                                    <div className="w-[9px] h-[9px] rounded-full bg-[#ff5f56]" />
                                    <div className="w-[9px] h-[9px] rounded-full bg-[#ffbd2e]" />
                                    <div className="w-[9px] h-[9px] rounded-full bg-[#27c93f]" />
                                </div>
                                <div className="flex-1 h-5 bg-white/[0.04] rounded-[5px] ml-1.5 flex items-center px-2.5">
                                    <span className="text-[9px] text-white/25">luminel.app/dashboard</span>
                                </div>
                                <div className="hidden md:block bg-gradient-to-br from-[#C9A962]/20 to-[#C9A962]/10 border border-[#C9A962]/25 rounded-full px-2.5 py-[3px] text-[9px] text-[#C9A962] font-bold">
                                    FOUNDING MEMBER #1
                                </div>
                            </div>

                            <div className="flex" style={{ minHeight: '320px' }}>
                                <div className="w-[42px] md:w-[52px] border-r border-white/5 py-3 flex flex-col items-center gap-3">
                                    <div className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] rounded-[7px] flex items-center justify-center">
                                        <Crown className="w-3 h-3 text-white" />
                                    </div>
                                    {[BarChart3, Users, CreditCard, Calendar].map((Icon, i) => (
                                        <div key={i} className={`w-[26px] h-[26px] md:w-[30px] md:h-[30px] rounded-[7px] flex items-center justify-center ${i === 0 ? 'bg-[#C9A962]/15 border border-[#C9A962]/25' : ''}`}>
                                            <Icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i === 0 ? 'text-[#C9A962]' : 'text-white/20'}`} />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1 p-3 md:p-4 overflow-hidden">
                                    <div className="flex justify-between items-center mb-3 md:mb-4">
                                        <div>
                                            <div className="text-[12px] md:text-[14px] font-bold text-white mb-0.5">Buongiorno, Michael 👑</div>
                                            <div className="text-[8px] md:text-[9px] text-white/30">Tutto sotto controllo</div>
                                        </div>
                                        <div className="hidden md:flex items-center gap-2">
                                            <div className="w-[7px] h-[7px] rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                                            <span className="text-[9px] text-white/30">AI Coach attivo</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5 mb-3 md:mb-4">
                                        {[
                                            { label: 'Revenue', value: '€12.450', change: '+18% ↑', changeColor: 'text-emerald-500' },
                                            { label: 'Clienti', value: '142', change: '+7 nuovi', changeColor: 'text-emerald-500' },
                                            { label: 'Sessioni', value: '38', change: 'oggi', changeColor: 'text-white/40' },
                                            { label: 'Target', value: '83%', change: '€15K obiettivo', changeColor: 'text-[#C9A962]' },
                                        ].map((kpi, i) => (
                                            <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-[10px] p-2.5 md:p-3">
                                                <div className="text-[7px] md:text-[8px] text-white/30 mb-1.5 uppercase tracking-wider">{kpi.label}</div>
                                                <div className="text-[14px] md:text-[16px] font-extrabold text-white font-mono">{kpi.value}</div>
                                                <div className={`text-[8px] md:text-[9px] mt-0.5 font-semibold ${kpi.changeColor}`}>{kpi.change}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-[10px] p-3 md:p-3.5 mb-3">
                                        <div className="text-[8px] md:text-[9px] text-white/35 mb-2.5 font-semibold tracking-wider">REVENUE — ULTIMI 7 GIORNI</div>
                                        <svg viewBox="0 0 580 70" className="w-full h-[45px] md:h-[58px]">
                                            <defs>
                                                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#C9A962" stopOpacity="0.35" />
                                                    <stop offset="100%" stopColor="#C9A962" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M 0 55 C 70 50,110 38,170 32 C 230 26,270 44,325 20 C 380 8,430 18,510 6 L 580 3 L 580 70 L 0 70 Z" fill="url(#rg)" />
                                            <path d="M 0 55 C 70 50,110 38,170 32 C 230 26,270 44,325 20 C 380 8,430 18,510 6 L 580 3" fill="none" stroke="#C9A962" strokeWidth="1.5" />
                                            <circle cx="170" cy="32" r="2.5" fill="#C9A962" />
                                            <circle cx="325" cy="20" r="2.5" fill="#C9A962" />
                                            <circle cx="510" cy="6" r="2.5" fill="#C9A962" />
                                        </svg>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        <div className="bg-emerald-500/[0.07] border border-emerald-500/[0.14] rounded-[9px] p-2.5 md:p-3">
                                            <div className="text-[7px] md:text-[8px] text-white/35 mb-1">PROSSIMA SESSIONE</div>
                                            <div className="text-[10px] md:text-[11px] font-semibold text-white mb-0.5">Sara B. — Coaching 1:1</div>
                                            <div className="text-[8px] md:text-[9px] text-emerald-500">⏱ tra 47 minuti</div>
                                        </div>
                                        <div className="bg-violet-500/[0.07] border border-violet-500/[0.14] rounded-[9px] p-2.5 md:p-3">
                                            <div className="text-[7px] md:text-[8px] text-white/35 mb-1">AI COACH</div>
                                            <div className="text-[9px] md:text-[10px] text-white/55 mb-1">Retention al 78% — suggerisco...</div>
                                            <div className="text-[8px] md:text-[9px] text-violet-400 font-semibold">Leggi insight →</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Social Proof — RIPRISTINATA (mancava nella prima ricostruzione) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="mt-14 flex items-center justify-center gap-5 flex-wrap"
                    >
                        <div className="flex">
                            {['👩‍💼', '💇‍♀️', '🧖‍♀️', '🎨'].map((emoji, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-[#060606] flex items-center justify-center text-sm bg-white/5"
                                    style={{ marginLeft: i > 0 ? '-10px' : 0, zIndex: 5 - i }}
                                >
                                    {emoji}
                                </div>
                            ))}
                        </div>
                        <div className="text-[12px] text-white/40">
                            <span className="text-[#C9A962] font-bold">127+ professionisti</span> già in lista d'attesa
                        </div>
                        <div className="text-[#C9A962] text-[13px] tracking-[2px]">★★★★★</div>
                    </motion.div>
                </div>
            </section>

            <section id="problema" className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A962] mb-4">Il Problema</p>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4">
                            <span className="text-white">Conosci </span>
                            <span className="italic text-[#C9A962]">Questa Scena?</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-5 mb-12">
                        {PAIN_POINTS.map((point, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-500"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                        <point.icon className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-extrabold text-red-400 font-mono">{point.stat}</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-wider">{point.statLabel}</div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{point.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.03] border border-[#C9A962]/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#C9A962]/[0.05] rounded-full blur-[80px] pointer-events-none" />
                        <Quote className="w-10 h-10 text-[#C9A962]/30 mx-auto mb-6 relative z-10" />
                        <p className="text-lg md:text-2xl text-white font-serif leading-relaxed mb-6 relative z-10">
                            "Ho intervistato 127 coach, saloni, e operatori olistici. <br />
                            <span className="text-[#C9A962] font-bold">Il 92% passa più tempo sul gestionale che con i clienti.</span> <br />
                            Questo è inaccettabile."
                        </p>
                        <p className="text-white/40 font-medium relative z-10">
                            — Michael Jara, Founder Luminel
                        </p>
                    </motion.div>
                </div>
            </section>

            <section id="storia" className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A962] mb-4">La Storia</p>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4">
                            <span className="text-white">C'È Chi Ha Passato Questo Inferno. </span>
                            <br />
                            <span className="italic text-[#C9A962]">E Ne È Uscito.</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10">
                                <img
                                    src="/michael-jara.png"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    alt="Michael Jara, Founder"
                                />
                            </div>
                            <div className="absolute -bottom-4 left-4 right-4 md:left-6 md:right-6 bg-[#0a0a0a] border border-[#C9A962]/20 rounded-2xl p-4 shadow-xl backdrop-blur">
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C9A962]">
                                    Michael Jara, 3AM Milano, 2023
                                </p>
                                <p className="text-white/50 text-xs mt-1">
                                    "L'ultima notte che passo su Excel"
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl md:text-3xl font-serif font-bold">
                                <span className="text-white">Nel 2022 Ho Fatto €180K Di Revenue. </span>
                                <br />
                                <span className="text-red-400">E Ho Lavorato 73 Ore A Settimana.</span>
                            </h3>

                            <p className="text-white/50 leading-relaxed">
                                Il problema non era trovare clienti. Il problema era <strong className="text-white">gestirli</strong>.
                            </p>

                            <ul className="space-y-2 text-white/50">
                                {['4 ore/giorno su Excel e WhatsApp', 'Email perse, pagamenti ritardati', 'Zero tempo per famiglia', 'Dashboard fatti in casa che crashavano'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 border-l-4 border-l-[#C9A962]">
                                <p className="text-white/60 italic leading-relaxed">
                                    Ho provato 8 gestionali: Calendly (troppo basic), Acuity (ugly come Excel),
                                    Mindbody (costa €400/m, complessità folle). <br /><br />
                                    <strong className="text-white">Tutti costruiti per ristoranti. Nessuno per professionisti come noi.</strong>
                                </p>
                            </div>

                            <p className="text-white/50 leading-relaxed">
                                Così una sera, ore 2:47AM, caffè #6:
                            </p>

                            <p className="text-2xl font-serif font-bold text-white italic">
                                "Basta. Lo costruisco io."
                            </p>

                            <div className="bg-[#C9A962]/[0.08] border border-[#C9A962]/20 rounded-2xl p-5">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    {[
                                        { val: '11', label: 'Mesi' },
                                        { val: '847', label: 'Ore Coding' },
                                        { val: '€47K', label: 'Investiti' },
                                    ].map((s, i) => (
                                        <div key={i}>
                                            <p className="text-2xl font-bold text-[#C9A962]">{s.val}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-lg text-white/70 font-medium">
                                Oggi gestisco 180 clienti con Luminel. <br />
                                <span className="text-[#C9A962] font-bold">Tempo su gestionale? 35 minuti/giorno.</span>
                            </p>

                            <p className="text-white/50 italic">
                                Non è solo un software. È la mia libertà riconquistata. <br />
                                <strong className="text-white not-italic">E ora, la tua.</strong>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link
                                    to="/founder"
                                    className="px-8 py-4 bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] text-black rounded-full font-bold text-center shadow-[0_0_30px_rgba(201,169,98,0.3)] hover:shadow-[0_0_45px_rgba(201,169,98,0.5)] transition-all"
                                >
                                    Voglio La Mia Libertà →
                                </Link>
                                <button
                                    onClick={() => scrollToSection('metodo')}
                                    className="px-8 py-4 border border-white/10 rounded-full font-medium text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
                                >
                                    Mostrami Il Piano
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="metodo" className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A962] mb-4">Il Piano</p>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4">
                            <span className="text-white">Come Riprendi Il Controllo</span>
                            <br />
                            <span className="italic text-[#C9A962]">(In 3 Passi)</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-5">
                        {PLAN_STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 md:p-8 hover:border-[#C9A962]/30 transition-all duration-500"
                            >
                                <div className="flex items-start gap-5 md:gap-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] rounded-full flex items-center justify-center text-black font-bold text-lg flex-shrink-0 shadow-lg shadow-[#C9A962]/20">
                                        {step.num}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-white/40 leading-relaxed mb-4">{step.desc}</p>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${step.badgeColor === 'amber' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                            step.badgeColor === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                                'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                                            }`}>
                                            <step.icon className="w-4 h-4" />
                                            {step.badge}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <p className="text-white/40 font-medium">
                            Setup completo in <span className="text-[#C9A962] font-bold">47 minuti</span> medi. <br />
                            Non ore. Non giorni. <strong className="text-white">Minuti.</strong>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION: FAILURE — RIPRISTINATA (mancava nella prima ricostruzione) */}
            <section className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-serif mb-4">
                            <span className="text-white">E Se </span>
                            <span className="italic text-red-400">Non Fai Nulla?</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-5 mb-12">
                        {[
                            {
                                time: 'TRA 6 MESI:',
                                items: ['Ancora 4 ore/giorno su Excel', 'Ancora WhatsApp persi', 'Ancora weekend persi a "sistemare cose"'],
                                severity: 'low',
                            },
                            {
                                time: 'TRA 1 ANNO:',
                                items: ['1,460 ore buttate (60 giorni pieni)', '€15K+ persi in inefficiency', 'Burnout completo ("Forse sbagliavo carriera?")'],
                                severity: 'mid',
                            },
                            {
                                time: 'TRA 2 ANNI:',
                                items: ['Chiudi il business', 'Torni dipendente', '"Dovevo provare quel gestionale..."'],
                                severity: 'high',
                            },
                        ].map((block, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`rounded-2xl p-6 border ${block.severity === 'high'
                                    ? 'bg-red-500/[0.08] border-red-500/30'
                                    : 'bg-white/[0.03] border-white/10'
                                    }`}
                            >
                                <h3 className="text-lg font-bold text-red-400 mb-3">{block.time}</h3>
                                <ul className="space-y-2 text-white/50">
                                    {block.items.map((item, j) => (
                                        <li key={j}>• {j === 0 && block.severity === 'mid' ? <span className="text-white font-bold">{item}</span> : j === 2 && block.severity === 'high' ? <span className="italic text-white">{item}</span> : item}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <p className="text-white/40 mb-2">
                            È drammatico? Sì. È reale? Chiedi ai 3,200 coach/saloni che hanno chiuso nel 2024.
                        </p>
                        {/* ⚠️ Citazione "Fonte: Report ISTAT Wellness Industry 2024" — ti avevo
                            già segnalato che va verificata prima di lasciarla online. Non l'ho
                            tolta né confermata, resta qui esattamente com'era nell'originale,
                            in attesa di una tua decisione. */}
                        <p className="text-xs text-white/25 italic mb-10">
                            Fonte: Report ISTAT Wellness Industry 2024
                        </p>

                        <div className="bg-gradient-to-r from-[#C9A962] to-[#D4B572] rounded-3xl p-8 text-black">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                                "Ma Tu Non Sei Loro. <br />
                                Perché Sei Ancora Qui."
                            </h3>
                            <Link
                                to="/founder"
                                className="inline-flex items-center gap-3 px-10 py-4 bg-[#060606] text-white rounded-full text-lg font-bold hover:bg-black hover:shadow-2xl transition-all"
                            >
                                Blocca Prezzo Founder Ora
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <p className="mt-4 text-sm font-medium text-black/60">
                                {founderSpots} posti / 25 disponibili
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section id="piano" className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A962] mb-4">I Piani di Abbonamento</p>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                            Scegli il Livello del <span className="italic text-[#C9A962]">Tuo Impero</span>
                        </h2>
                        <p className="text-white/45 max-w-2xl mx-auto text-sm md:text-base">
                            Prezzo Founder bloccato per sempre per i primi 25 iscritti.
                            Nessun costo nascosto. Puoi fare l'upgrade o cancellare in qualsiasi momento.
                        </p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-14">
                        <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Fatturazione Mensile</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                            className="w-14 h-7 bg-white/[0.08] border border-white/10 rounded-full relative p-1 transition-colors hover:bg-white/15"
                            aria-label="Toggle billing cycle"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'annual' ? 28 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="w-5 h-5 bg-[#C9A962] rounded-full shadow-md"
                            />
                        </button>
                        <span className={`text-sm font-semibold transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-white/40'}`}>Fatturazione Annuale</span>
                        <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                            2 MESI GRATIS 🎁
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {!plans && !plansError && (
                            <div className="col-span-full text-center py-12 text-white/40">Caricamento prezzi in corso...</div>
                        )}
                        {plansError && (
                            <div className="col-span-full text-center py-12 text-red-400">Prezzi momentaneamente non disponibili. Riprova tra poco.</div>
                        )}
                        {plans && plans.map((plan, index) => {
                            const IconComponent = plan.icon;
                            const isPopular = plan.popular;
                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.08 * index, duration: 0.6 }}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                    className={`relative bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-[12px] rounded-2xl p-6 flex flex-col justify-between ${isPopular
                                        ? 'border-2 border-[#C9A962]/40 ring-1 ring-[#C9A962]/20'
                                        : 'border border-white/[0.08]'
                                        }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C9A962] to-[#7a5d1e] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(201,169,98,0.3)]">
                                            {plan.badge || 'Più Scelto 🔥'}
                                        </div>
                                    )}

                                    <div>
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-inner`}>
                                            <IconComponent className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-wide">{plan.name}</h3>
                                        <p className="text-xs text-white/40 mb-4 h-8 leading-snug">{plan.tagline}</p>

                                        <div className="mb-6 pb-5 border-b border-white/[0.06]">
                                            <div className="text-white/30 line-through text-xs mb-0.5">
                                                €{plan.pricePublic}/mese
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold bg-gradient-to-r from-[#C9A962] to-[#f0d080] bg-clip-text text-transparent font-mono">
                                                    €{billingCycle === 'monthly' ? plan.priceFounderMonthly : Math.round(plan.priceFounderAnnual / 12)}
                                                </span>
                                                <span className="text-xs text-white/40 font-medium">/mese</span>
                                            </div>
                                            {billingCycle === 'annual' && (
                                                <div className="text-[10px] text-white/30 mt-1 font-mono">
                                                    Addebitato annualmente: €{plan.priceFounderAnnual}/anno
                                                </div>
                                            )}
                                            <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold mt-2 uppercase tracking-wide">
                                                Risparmi {getDiscountPercent(plan)}%
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 mb-5 text-[11px] text-white/50 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-lg">
                                            <div className="flex justify-between">
                                                <span>Utenti inclusi:</span>
                                                <span className="font-bold text-white">{plan.maxUsers === -1 ? 'Illimitati' : plan.maxUsers}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Clienti gestibili:</span>
                                                <span className="font-bold text-white">{plan.maxClients === -1 ? 'Illimitati' : plan.maxClients}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Sessioni mensili:</span>
                                                <span className="font-bold text-white">{plan.maxSessions === -1 ? 'Illimitate' : `${plan.maxSessions}/mese`}</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-2.5 mb-8">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-[12px] text-white/60 leading-relaxed">
                                                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => stripeService.redirectToCheckout(plan.id as PlanId, billingCycle)}
                                        className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isPopular
                                            ? 'bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] text-black hover:shadow-lg hover:shadow-[#C9A962]/20 hover:scale-[1.01]'
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        Attiva Piano {plan.name}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 max-w-2xl mx-auto flex items-center justify-center gap-3">
                        <Lock className="w-4 h-4 text-[#C9A962] flex-shrink-0" />
                        <p className="text-[12px] text-white/50 text-left leading-relaxed">
                            <strong className="text-white">Transazione protetta a 256-bit:</strong> Gli abbonamenti sono processati in sicurezza tramite Stripe. Prezzo scontato bloccato per sempre. Restano solo {founderSpots} dei 25 posti totali.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION: LEAD MAGNET — RIPRISTINATA (mancava nella prima ricostruzione) */}
            <section className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#C9A962]/[0.05] rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#C9A962]/[0.1] border border-[#C9A962]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Gift className="w-8 h-8 text-[#C9A962]" />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
                                Non Pronto a Decidere?
                            </h2>
                            <p className="text-white/40 mb-8 max-w-lg mx-auto">
                                Scarica gratis la guida che hanno usato i nostri Founder per passare
                                da 50 a 180 clienti senza assumere staff.
                            </p>

                            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-8">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A962] mb-2">PDF GRATUITO</p>
                                <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                                    "I 7 Sistemi Che Ogni Coach €100K+ <br className="hidden md:block" />
                                    Usa Per Gestire 50+ Clienti"
                                </h3>
                                <p className="text-white/35 text-sm mt-2">24 pagine • Niente fluff • Implementabile oggi</p>
                            </div>

                            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="La tua email migliore"
                                    className="flex-1 px-5 py-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#C9A962]/50 focus:border-[#C9A962]/50"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-br from-[#C9A962] to-[#7a5d1e] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#C9A962]/30 transition-all whitespace-nowrap"
                                >
                                    Scarica →
                                </button>
                            </form>

                            <p className="text-white/20 text-xs mt-6">
                                Zero spam. Solo valore. Puoi disiscriverti in un click.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="relative z-10 py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <Crown className="w-16 h-16 text-[#C9A962] mx-auto mb-8 opacity-60" />
                    <h2 className="text-3xl md:text-5xl font-serif mb-6">
                        <span className="text-white">Il Momento È Adesso. </span>
                        <br />
                        <span className="italic text-[#C9A962]">La Scelta È Tua.</span>
                    </h2>
                    <p className="text-white/35 mb-10 max-w-xl mx-auto leading-relaxed">
                        {founderSpots} posti Founder rimasti. Prezzo bloccato a vita.
                        Onboarding personale con me. Soddisfatto o rimborsato entro 30 giorni.
                    </p>
                    <Link
                        to="/founder"
                        className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#C9A962] to-[#D4B572] text-[#060606] rounded-full text-xl font-bold shadow-[0_0_50px_rgba(201,169,98,0.35)] hover:shadow-[0_0_70px_rgba(201,169,98,0.5)] hover:scale-[1.03] transition-all"
                    >
                        Reclama Il Tuo Posto Founder
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            <footer className="relative z-10 py-10 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-[#C9A962]" />
                        <span className="font-serif font-bold text-white">Luminel</span>
                    </div>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest">
                        © 2026 Luminel Manager • Crafted for Empires • Made in Italia
                    </p>
                </div>
            </footer>

            <style>{`
                @keyframes scanLine {
                    0% { top: -30%; }
                    100% { top: 130%; }
                }
                @keyframes badgePulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,98,0.4); }
                    50% { box-shadow: 0 0 0 6px rgba(201,169,98,0); }
                }
            `}</style>
        </div>
    );
};

export default HomeLanding;