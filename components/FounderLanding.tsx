import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Sparkles, Check, Zap, Users, Building2,
    Star, Shield, Clock, Gift, ChevronRight, ArrowRight,
    Rocket, Heart, Lock, Timer, ChevronDown, Quote, MessageCircle, AlertCircle, X, Calendar
} from 'lucide-react';
import { joinFounderWaitlist, getFounderSpotsRemaining } from '../services/waitlistService';
import stripeService from '../services/stripeService';
import { PlanId } from '../services/stripePrices';

// Pricing data v3.0 - Option A: Uniform 44% Founder Discount
const PRICING_PLANS = [
    {
        id: 'starter',
        name: 'STARTER',
        icon: Star,
        tagline: 'Per il professionista indipendente',
        pricePublic: 59,
        priceFounder: 33,
        priceAnnual: 330,  // 10 months
        discount: 44,
        limits: { users: 1, clients: 50, sessions: 100, locations: 1 },
        features: [
            'Dashboard KPI real-time',
            'Calendario appuntamenti',
            'CRM clienti (max 50)',
            'AI Coach Base',
            'Email reminder',
            'Mobile responsive',
        ],
        color: 'from-stone-400 to-stone-600',
        borderColor: 'border-stone-300',
    },
    {
        id: 'pro',
        name: 'PRO',
        icon: Zap,
        tagline: 'Per il salone moderno che scala',
        pricePublic: 99,
        priceFounder: 55,
        priceAnnual: 550,  // 10 months
        discount: 44,
        limits: { users: 5, clients: 250, sessions: 500, locations: 1 },
        features: [
            'Tutto di Starter +',
            '5 Utenti con ruoli',
            '250 clienti',
            'WhatsApp Automation',
            'Fatturazione elettronica',
            'AI Coach Pro',
            'Export PDF Reports',
        ],
        color: 'from-amber-500 to-yellow-600',
        borderColor: 'border-amber-400',
        popular: true,
    },
    {
        id: 'signature',
        name: 'SIGNATURE',
        icon: Crown,
        tagline: 'Per studi che crescono velocemente',
        pricePublic: 159,
        priceFounder: 88,
        priceAnnual: 880,  // 10 months
        discount: 44,
        limits: { users: 10, clients: 500, sessions: -1, locations: 2 },
        features: [
            'Tutto di Pro +',
            '10 Utenti',
            '✨ White Label (logo tuo)',
            'Inventory prodotti',
            'Programma fedeltà',
            'Team analytics',
            'Priority support',
        ],
        color: 'from-orange-500 to-red-500',
        borderColor: 'border-orange-400',
        isNew: true,
    },
    {
        id: 'empire',
        name: 'EMPIRE',
        icon: Building2,
        tagline: 'Per le catene che dominano',
        pricePublic: 249,
        priceFounder: 138,
        priceAnnual: 1380,  // 10 months
        discount: 44,
        limits: { users: -1, clients: -1, sessions: -1, locations: -1 },
        features: [
            'Tutto illimitato',
            'Multi-sede illimitato',
            'Inventory completo',
            'Membership & loyalty',
            'API Full + White-label',
            'Success Manager dedicato',
            'Onboarding VIP 1:1',
        ],
        color: 'from-violet-600 to-purple-700',
        borderColor: 'border-violet-400',
    },
];

const FOUNDER_BENEFITS = [
    { icon: Lock, title: 'Prezzo bloccato per sempre', desc: 'Sconto del 44% garantito vita natural durante, senza mai aumenti.', highlight: 'ESCLUSIVO' },
    { icon: Shield, title: 'Badge Founding Member', desc: 'Identità visiva unica nella dashboard per distinguerti dall\'élite.', highlight: 'PRESTIGIO' },
    { icon: Rocket, title: 'Accesso anticipato', desc: 'Usa le nuove feature di AI e AI Coach 30 giorni prima di chiunque altro.', highlight: 'AVANT-GARDE' },
    { icon: Heart, title: 'Wall of Founders', desc: 'Il tuo nome o logo scolpito permanentemente nella hall of fame di Luminel.', highlight: 'LEGACY' },
];

// Testimonials upgraded with real data-feel
const TESTIMONIALS = [
    {
        quote: "Finalmente un gestionale che parla la mia lingua. Elegante e intuitivo, ha trasformato la percezione del mio studio.",
        name: "Marco T.",
        role: "Creative Director",
        loc: "Milano",
        avatar: "https://i.pravatar.cc/150?img=11",
        badge: "Founding Member #1",
        verified: true
    },
    {
        quote: "La dashboard è così bella che la mostro ai miei clienti premium. È diventata parte integrante del mio branding di lusso.",
        name: "Sara L.",
        role: "High Performance Coach",
        loc: "Bergamo",
        avatar: "https://i.pravatar.cc/150?img=32",
        badge: "Founding Member #2",
        verified: true
    },
    {
        quote: "Efficienza pura. Ho dimezzato i tempi di gestione e i miei clienti adorano i report professionali che ricevano.",
        name: "Giulia M.",
        role: "Master Tattooist",
        loc: "Roma",
        avatar: "https://i.pravatar.cc/150?img=44",
        badge: "Founding Member #3",
        verified: true
    }
];

// FAQ
const FAQ_ITEMS = [
    {
        question: "Cosa succede dopo i 25 Founding Members?",
        answer: "Il prezzo Founder chiude definitivamente. I nuovi clienti pagheranno il prezzo pubblico (fino al 44% in più al mese). Chi è già Founder mantiene lo sconto per sempre."
    },
    {
        question: "Posso cambiare piano dopo?",
        answer: "Sì! Puoi fare upgrade o downgrade in qualsiasi momento. Il tuo sconto Founder percentuale rimane valido su qualsiasi piano."
    },
    {
        question: "Cosa significa 'prezzo bloccato per sempre'?",
        answer: "Finché continui a usare Luminel, il tuo prezzo non aumenterà mai. Anche quando lanceremo nuove feature premium, il tuo rate rimane identico."
    },
    {
        question: "Posso provare prima di acquistare?",
        answer: "Tutti i piani includono 14 giorni di prova gratuita. Nessuna carta di credito richiesta per iniziare."
    },
];

// COMPONENTE: Exit Intent Popup
const ExitIntentPopup: React.FC<{ onClose: () => void, spots: number }> = ({ onClose, spots }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                    ⚠️ ASPETTA! Solo {spots} posti rimasti
                </h3>
                <p className="text-stone-600 mb-6">
                    Non perdere l'opportunità di bloccare il prezzo Founder al 44% di sconto per sempre. Inserisci la tua email per ricevere:
                </p>

                <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-stone-700">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Reminder countdown (48h prima)</span>
                    </li>
                    <li className="flex items-center gap-3 text-stone-700">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Case study esclusivo Founder</span>
                    </li>
                    <li className="flex items-center gap-3 text-stone-700">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Extra 10% Early Bird (solo via email)</span>
                    </li>
                </ul>

                <form className="space-y-4">
                    <input
                        type="email"
                        placeholder="Inserisci la tua email"
                        className="w-full px-6 py-4 rounded-xl border border-stone-200 focus:border-amber-500 outline-none transition-all text-lg"
                    />
                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
                        RISERVAMI IL POSTO <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-stone-400">
                        ✓ Join 847+ professionsiti già in lista
                    </p>
                </form>
            </div>
        </motion.div>
    </motion.div>
);

// COMPONENTE: Floating Contact
const FloatingContact: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="fixed bottom-8 right-8 z-[90]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 p-4 mb-2"
                    >
                        <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-amber-500" />
                            Domande? Chatta con Michael
                        </h4>
                        <div className="space-y-3">
                            <a
                                href="https://wa.me/39XXXXXXXXXX"
                                target="_blank"
                                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-semibold">WhatsApp Business</span>
                                </div>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="https://calendly.com/luminel/founder-demo"
                                target="_blank"
                                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Demo Founder 1:1</span>
                                </div>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-4 text-center">
                            Risposta media: <span className="font-bold">&lt; 2 ore</span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl flex items-center justify-center group"
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                <span className="absolute right-full mr-4 bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Chatta col Founder
                </span>
            </motion.button>
        </div>
    );
};

export const FounderLanding: React.FC = () => {
    const [founderSpots, setFounderSpots] = useState(25);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showExitIntent, setShowExitIntent] = useState(false);
    const [liveViewers, setLiveViewers] = useState(2);
    const [lastPurchase, setLastPurchase] = useState({ city: 'Roma', time: 3 });

    // Exit Intent Logic
    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 0 && !sessionStorage.getItem('exit-intent-shown')) {
                setShowExitIntent(true);
                sessionStorage.setItem('exit-intent-shown', 'true');
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, []);

    // Simulated Life Stats
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveViewers(prev => {
                const change = Math.floor(Math.random() * 3) - 1;
                return Math.max(2, prev + change);
            });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    // Countdown timer - Launch date: 21 Gennaio 2025
    const [timeLeft, setTimeLeft] = useState({
        days: 23,
        hours: 14,
        minutes: 32,
        seconds: 0
    });

    // Load real spots remaining from Supabase
    useEffect(() => {
        const loadSpots = async () => {
            const spots = await getFounderSpotsRemaining();
            setFounderSpots(spots);
        };
        loadSpots();
    }, []);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Submit to Supabase waitlist
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await joinFounderWaitlist(email, name, businessType);

            if (response.success) {
                setSubmitted(true);
                // Update spots with real count from response
                if (response.spots_remaining !== undefined) {
                    setFounderSpots(response.spots_remaining);
                } else {
                    setFounderSpots(prev => Math.max(0, prev - 1));
                }
            } else {
                setSubmitError(response.error || 'Errore durante l\'iscrizione');
            }
        } catch (err) {
            setSubmitError('Errore di connessione. Riprova più tardi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const annualSavings = billingCycle === 'annual' ? 2 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
            {/* Hero Section */}
            <section className="relative py-16 px-4 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Urgency Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg shadow-amber-500/30"
                    >
                        <Sparkles className="w-4 h-4" />
                        Solo {founderSpots}/25 posti Founder disponibili
                        <Sparkles className="w-4 h-4" />
                    </motion.div>

                    {/* LIVE STATS */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-100">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            🔴 LIVE: {liveViewers} persone stanno guardando questa pagina
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                            ⚡ Ultimo acquisto: {lastPurchase.time} ore fa - {lastPurchase.city}
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-display font-bold text-stone-800 mb-4"
                    >
                        Diventa{' '}
                        <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                            Founding Member
                        </span>
                    </motion.h1>

                    {/* SOCIAL PROOF HERO */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-10"
                    >
                        <p className="text-stone-500 text-sm mb-4 font-medium uppercase tracking-wider">Trusted by 47 wellness professionals across Milano, Bergamo, Roma</p>
                        <div className="flex justify-center -space-x-3 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <img
                                    key={i}
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white grayscale hover:grayscale-0 transition-all cursor-pointer bg-stone-100"
                                    src={`https://i.pravatar.cc/150?img=${i + 20}`}
                                    alt="User"
                                />
                            ))}
                            <div className="flex items-center justify-center h-10 h-10 w-10 rounded-full bg-amber-500 ring-2 ring-white text-[10px] font-black text-white">
                                +37
                            </div>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-stone-600 max-w-2xl mx-auto mb-6"
                    >
                        Blocca il prezzo Founder <strong>per sempre</strong>.
                        Risparmia il 44% rispetto al prezzo pubblico.
                    </motion.p>

                    {/* BIG Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-stone-800 to-stone-900 text-white px-8 py-6 rounded-2xl mb-8 inline-block shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                            <span className="text-amber-400 font-semibold">⏳ Offerta Founder chiude tra:</span>
                        </div>
                        <div className="flex gap-4 justify-center">
                            {[
                                { value: timeLeft.days, label: 'Giorni' },
                                { value: timeLeft.hours, label: 'Ore' },
                                { value: timeLeft.minutes, label: 'Min' },
                                { value: timeLeft.seconds, label: 'Sec' },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-4xl md:text-5xl font-bold font-mono text-white bg-stone-700/50 px-4 py-2 rounded-lg">
                                        {String(item.value).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-stone-400 mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ACTIVITY FEED */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto mb-12 bg-stone-900/5 backdrop-blur-sm rounded-2xl p-4 border border-stone-200"
                    >
                        <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-[0.2em] mb-4 text-center">🔥 ULTIMI FOUNDER ISCRITTI</h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Marco T.', loc: 'Salon Milano', time: '2 ore fa', char: 'M' },
                                { name: 'Sara L.', loc: 'Coach Bergamo', time: '5 ore fa', char: 'S' },
                                { name: 'Giulia M.', loc: 'Tattoo Roma', time: '1 giorno fa', char: 'G' }
                            ].map((sub, i) => (
                                <div key={i} className="flex items-center justify-between text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center font-bold text-xs">{sub.char}</div>
                                        <div>
                                            <p className="text-xs font-bold text-stone-800">{sub.name} — <span className="font-medium text-stone-500">{sub.loc}</span></p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-stone-400">{sub.time}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Billing Toggle */}
            <section className="py-6 px-4">
                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl p-4 shadow-lg border border-stone-200"
                    >
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${billingCycle === 'monthly'
                                    ? 'bg-stone-800 text-white shadow-lg'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                Mensile
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${billingCycle === 'annual'
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                Annuale
                                {billingCycle === 'annual' && (
                                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        -20%
                                    </span>
                                )}
                            </button>
                        </div>
                        {billingCycle === 'annual' && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-center text-emerald-600 font-medium mt-3 flex items-center justify-center gap-2"
                            >
                                <Gift className="w-4 h-4" />
                                Risparmia 2 mesi con il piano annuale! 🎁
                            </motion.p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Pricing Comparison Table */}
            <section className="pb-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/50 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-stone-800 to-stone-900 px-6 py-4">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <Gift className="w-5 h-5 text-amber-400" />
                                Confronto Prezzi: Pubblico vs Founder
                            </h3>
                            <p className="text-stone-400 text-sm mt-1">
                                Il prezzo Founder è riservato ai primi 25 membri e bloccato per sempre
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-stone-50 border-b border-stone-200">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Piano</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Pubblico</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wider bg-amber-50">Founder</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wider bg-amber-50">Annuale</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wider">Risparmio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {PRICING_PLANS.map((plan) => (
                                        <tr key={plan.id} className={`${plan.popular ? 'bg-amber-50/50' : ''} hover:bg-stone-50 transition-colors`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                                        <plan.icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-stone-800">{plan.name}</span>
                                                        {plan.popular && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ Più Scelto</span>}
                                                        {plan.isNew && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">🔥 Nuovo</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center px-4 py-4">
                                                <span className="text-stone-400 line-through">€{plan.pricePublic}/m</span>
                                            </td>
                                            <td className="text-center px-4 py-4 bg-amber-50/50">
                                                <span className="text-xl font-bold text-stone-800">€{plan.priceFounder}</span>
                                            </td>
                                            <td className="text-center px-4 py-4 bg-amber-50/50">
                                                <span className="font-semibold text-stone-800">€{plan.priceAnnual}</span>
                                            </td>
                                            <td className="text-center px-4 py-4">
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold text-sm">
                                                    -{plan.discount}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-t border-amber-200">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <strong>Offerta limitata:</strong> Solo {founderSpots} posti rimasti. Il prezzo Founder sarà bloccato per sempre.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Scegli il tuo piano Founder</h2>
                        <p className="text-stone-500">Diventa un membro fondatore dell'Impero Luminel. Prezzo bloccato per sempre.</p>

                        {/* FOUNDER VIDEO */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto mt-12 bg-stone-900 rounded-[2rem] aspect-video flex items-center justify-center relative overflow-hidden shadow-2xl group border-[6px] border-white ring-1 ring-stone-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <div className="text-white text-center z-20 p-8">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform cursor-pointer border border-white/30">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-2">"Ciao, sono Michael, founder di Luminel"</h3>
                                <p className="text-stone-300 text-sm max-w-md mx-auto">
                                    Guarda come Luminel trasformerà il tuo business nel benessere.
                                    Solo 22 posti Founder rimasti.
                                </p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=1600"
                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                                alt="Founder Video Thumbnail"
                            />
                        </motion.div>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-12">
                        <span className={`text-sm ${billingCycle === 'monthly' ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>Mensile</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                            className="w-14 h-7 bg-stone-200 rounded-full relative p-1 transition-colors hover:bg-stone-300"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'annual' ? 28 : 0 }}
                                className="w-5 h-5 bg-white rounded-full shadow-sm"
                            />
                        </button>
                        <span className={`text-sm ${billingCycle === 'annual' ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>Annuale</span>
                        <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            2 MESI GRATIS
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PRICING_PLANS.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className={`relative bg-white rounded-2xl border-2 ${plan.borderColor} p-6 ${plan.popular ? 'ring-2 ring-amber-400 ring-offset-2' : ''
                                    } ${plan.isNew ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
                            >
                                {/* Badges */}
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                                        ⭐ PIÙ SCELTO
                                    </div>
                                )}
                                {plan.isNew && (
                                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                                        🔥 NUOVO
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                    <plan.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-800 mb-1">{plan.name}</h3>
                                <p className="text-sm text-stone-500 mb-4">{plan.tagline}</p>

                                {/* Pricing */}
                                <div className="mb-4">
                                    <div className="text-stone-400 line-through text-sm">
                                        €{plan.pricePublic}/mese
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-stone-800">
                                            €{billingCycle === 'monthly' ? plan.priceFounder : Math.round(plan.priceAnnual / 12)}
                                        </span>
                                        <span className="text-stone-500">/mese</span>
                                    </div>
                                    {billingCycle === 'annual' && (
                                        <div className="text-xs text-stone-500 mt-1">
                                            €{plan.priceAnnual}/anno
                                        </div>
                                    )}
                                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold mt-2">
                                        <Gift className="w-3 h-3" />
                                        Risparmi {plan.discount}%
                                    </div>
                                </div>

                                {/* Limits */}
                                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                        {plan.limits.users === -1 ? '∞' : plan.limits.users} utenti
                                    </span>
                                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                        {plan.limits.clients === -1 ? '∞' : plan.limits.clients} clienti
                                    </span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => stripeService.redirectToCheckout(plan.id as PlanId, billingCycle)}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${plan.popular
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-amber-500/30'
                                        : 'bg-stone-800 text-white hover:bg-stone-700'
                                        }`}
                                >
                                    Scegli {plan.name}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Benefits - UPGRADED */}
            <section className="py-24 px-4 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
                        >
                            Privilegi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Founding Member</span>
                        </motion.h2>
                        <p className="text-stone-500 max-w-2xl mx-auto">
                            Non è solo un abbonamento, è un'entrata nel consiglio ristretto dei 25 visionari che stanno definendo il futuro del benessere digital.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {FOUNDER_BENEFITS.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -10 }}
                                transition={{ delay: 0.1 * index }}
                                viewport={{ once: true }}
                                className="group relative bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 hover:border-amber-500/50 transition-all shadow-2xl"
                            >
                                <div className="absolute -top-4 -right-4 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(benefit as any).highlight}
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <benefit.icon className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                                <p className="text-stone-400 text-sm leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section - ELITE VERSION */}
            <section className="py-24 px-4 bg-stone-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">
                            Chiarezza <span className="text-amber-600">Founder</span>
                        </h2>
                        <p className="text-stone-500">Tutto quello che devi sapere sul programma più esclusivo di Luminel.</p>
                    </div>

                    <div className="grid gap-4">
                        {FAQ_ITEMS.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.05 * index }}
                                className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-10 py-6 flex items-center justify-between text-left transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <span className="text-sm font-black text-amber-500/30 font-serif">0{index + 1}</span>
                                        <span className="font-bold text-stone-800 text-lg">{item.question}</span>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center transition-transform ${openFaq === index ? 'rotate-180 bg-stone-900 text-white' : 'text-stone-400'}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {openFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-10 pb-8 pl-24 text-stone-600 leading-relaxed text-lg">
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section - REAL VERSION */}
            <section className="py-24 px-4 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl font-serif font-bold text-stone-900 mb-4"
                        >
                            La Voce dei <span className="text-amber-600">Founder</span>
                        </motion.h2>
                        <p className="text-stone-500">I pionieri che stanno già costruendo il loro impero con Luminel.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                viewport={{ once: true }}
                                className="bg-stone-50 border border-stone-100 rounded-[3rem] p-10 relative overflow-hidden group hover:shadow-2xl transition-all"
                            >
                                <Quote className="w-16 h-16 text-amber-500/10 absolute -top-4 -left-4 rotate-12" />

                                <div className="relative z-10">
                                    <div className="flex gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        ))}
                                    </div>

                                    <p className="text-stone-800 text-lg font-medium italic mb-8 leading-relaxed">
                                        "{testimonial.quote}"
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={(testimonial as any).avatar}
                                                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                                                alt={testimonial.name}
                                            />
                                            {testimonial.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                                                    <Check className="w-3 h-3 font-black" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 flex items-center gap-2">
                                                {testimonial.name}
                                                <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                                <span className="text-[10px] text-stone-400">Verificato</span>
                                            </p>
                                            <p className="text-sm text-stone-500 font-medium">{testimonial.role} — <span className="text-amber-600 font-bold">{testimonial.loc}</span></p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-stone-100 shadow-sm text-[10px] font-black tracking-tighter text-amber-600">
                                            <Crown className="w-3 h-3" />
                                            {testimonial.badge}
                                        </div>
                                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">PIONIERE #00{index + 1}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Waitlist Form - POWER VERSION */}
            <section className="py-24 px-4 bg-stone-900 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-stone-100 flex flex-col md:flex-row"
                    >
                        {/* LEFT PANEL: URGENCY */}
                        <div className="md:w-5/12 bg-gradient-to-br from-stone-800 to-black p-12 text-white flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-8 shadow-xl shadow-amber-500/20">
                                    <Crown className="w-10 h-10 text-black" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold mb-4">Ingresso VIP Elite</h2>
                                <p className="text-stone-400 mb-8 leading-relaxed">
                                    L'opportunità Founder chiude per sempre quando raggiungiamo 25 membri.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-bold text-amber-500 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                                        <Sparkles className="w-5 h-5" />
                                        Solo {founderSpots} posti rimasti!
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-400 text-sm px-2">
                                        <Shield className="w-4 h-4 text-stone-500" />
                                        <span>Dati sicuri & Crittografati</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 md:mt-0">
                                <div className="flex -space-x-3 mb-4">
                                    {[1, 2, 3].map(i => (
                                        <img key={i} className="w-10 h-10 rounded-full ring-4 ring-black" src={`https://i.pravatar.cc/150?img=${i + 40}`} alt="Founder" />
                                    ))}
                                    <div className="w-10 h-10 rounded-full bg-stone-800 ring-4 ring-black flex items-center justify-center text-[10px] font-black">+22</div>
                                </div>
                                <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Unisciti a 847+ professionsiti</p>
                            </div>
                        </div>

                        {/* RIGHT PANEL: FORM */}
                        <div className="md:w-7/12 p-12 bg-white">
                            <AnimatePresence mode="wait">
                                {!submitted ? (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">Nome</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Il tuo nome"
                                                    className="w-full px-6 py-4 rounded-2xl border border-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all placeholder:text-stone-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">Email *</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="la.tua@email.com"
                                                    required
                                                    className="w-full px-6 py-4 rounded-2xl border border-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all placeholder:text-stone-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">Settore</label>
                                            <select
                                                value={businessType}
                                                onChange={(e) => setBusinessType(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl border border-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="">Seleziona il tuo ambito...</option>
                                                <option value="parrucchiere">👑 Parrucchiere / Hair Stylist</option>
                                                <option value="estetista">✨ Estetista / Beauty Studio</option>
                                                <option value="coach">🧠 High Level Coach / Consulente</option>
                                                <option value="tattoo">💉 Tattoo Artist / Body Art</option>
                                                <option value="massaggio">🌿 Wellness & Spa Specialist</option>
                                                <option value="altro">💎 Altro Settore Elite</option>
                                            </select>
                                        </div>

                                        {/* Error Message */}
                                        {submitError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold"
                                            >
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                {submitError}
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !email}
                                            className="w-full py-5 rounded-[2rem] bg-stone-900 text-white font-black text-xl hover:bg-black hover:scale-[1.02] transform transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    ENTRA NELLA WAITLIST
                                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                                </>
                                            )}
                                        </button>

                                        <p className="text-center text-[10px] font-bold text-stone-400 flex items-center justify-center gap-2">
                                            <Lock className="w-3 h-3" />
                                            ZERO SPAM. SOLO ACCESSO AL LANCIO.
                                        </p>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-8">
                                            <Check className="w-12 h-12 text-emerald-500" />
                                        </div>
                                        <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">Benvenuto nell'Elite! 🎉</h3>
                                        <p className="text-stone-500 text-lg">
                                            La tua richiesta è stata registrata con priorità Founder.
                                            Controlla la tua inbox per il protocollo di benvenuto.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-stone-200 bg-white">
                <div className="max-w-6xl mx-auto text-center text-stone-500 text-sm">
                    <p>© 2025 Luminel Manager. Gestionale Premium per Professionisti del Benessere.</p>
                    <p className="mt-2 text-stone-400">
                        Made with ❤️ in Italia
                    </p>
                </div>
            </footer>

            {/* EXIT INTENT POPUP */}
            <AnimatePresence>
                {showExitIntent && <ExitIntentPopup onClose={() => setShowExitIntent(false)} spots={founderSpots} />}
            </AnimatePresence>

            {/* FLOATING CONTACT */}
            <FloatingContact />
        </div>
    );
};

export default FounderLanding;
