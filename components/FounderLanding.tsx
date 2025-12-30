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
    { icon: Lock, title: 'Prezzo bloccato per sempre', desc: 'Mai aumenti, garantito' },
    { icon: Shield, title: 'Badge Founding Member', desc: 'Visibile nella tua dashboard' },
    { icon: Rocket, title: 'Accesso anticipato', desc: 'Nuove feature prima di tutti' },
    { icon: Heart, title: 'Wall of Founders', desc: 'Il tuo nome sulla landing' },
];

// Testimonials
const TESTIMONIALS = [
    {
        quote: "Finalmente un gestionale che parla la mia lingua. Elegante e intuitivo.",
        name: "Marco T.",
        role: "Salon Milano",
        badge: "Founding Member #12"
    },
    {
        quote: "Dashboard così bella che la mostro ai clienti. È parte del mio branding ora.",
        name: "Sara L.",
        role: "Coach Bergamo",
        badge: "Founding Member #27"
    },
    {
        quote: "Ho provato 5 gestionali prima di Luminel. Non torno più indietro.",
        name: "Giulia M.",
        role: "Tattoo Artist Roma",
        badge: "Founding Member #8"
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

            {/* Founder Benefits */}
            <section className="py-16 px-4 bg-stone-800">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-white text-center mb-4">
                        Benefici Esclusivi{' '}
                        <span className="text-amber-400">Founding Member</span>
                    </h2>
                    <p className="text-stone-400 text-center mb-12">
                        Solo per i primi 25 visionari che credono nel progetto
                    </p>

                    <div className="grid md:grid-cols-4 gap-6">
                        {FOUNDER_BENEFITS.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-7 h-7 text-amber-400" />
                                </div>
                                <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                                <p className="text-stone-400 text-sm">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 bg-stone-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-stone-800 text-center mb-4">
                        Domande Frequenti
                    </h2>
                    <p className="text-stone-500 text-center mb-10">
                        Tutto quello che devi sapere sul Founder Program
                    </p>

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.05 * index }}
                                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
                                >
                                    <span className="font-semibold text-stone-800">{item.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${openFaq === index ? 'rotate-180' : ''
                                        }`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-6 pb-4 text-stone-600">
                                                {item.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-stone-800 text-center mb-4">
                        Cosa dicono i{' '}
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                            Founding Members
                        </span>
                    </h2>
                    <p className="text-stone-500 text-center mb-12">
                        Professionisti che hanno già scelto Luminel
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100 relative"
                            >
                                <Quote className="w-8 h-8 text-amber-200 absolute top-4 right-4" />
                                <p className="text-stone-700 mb-4 italic">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-800">{testimonial.name}</p>
                                        <p className="text-sm text-stone-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="mt-3 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                    <Crown className="w-3 h-3" />
                                    {testimonial.badge}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Waitlist Form */}
            <section className="py-20 px-4 bg-gradient-to-br from-stone-100 to-amber-50/50">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl shadow-2xl shadow-stone-200/50 p-8 border border-stone-100"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">
                                Entra nella Waitlist Founder
                            </h2>
                            <p className="text-stone-500">
                                Sarai tra i primi a sapere quando apriamo le iscrizioni
                            </p>
                            <p className="text-amber-600 font-semibold mt-2">
                                Solo {founderSpots} posti rimasti!
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {!submitted ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Nome (opzionale)
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Il tuo nome"
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="la.tua@email.com"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Settore
                                        </label>
                                        <select
                                            value={businessType}
                                            onChange={(e) => setBusinessType(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                                        >
                                            <option value="">Seleziona...</option>
                                            <option value="parrucchiere">Parrucchiere / Hair Stylist</option>
                                            <option value="estetista">Estetista / Beauty</option>
                                            <option value="coach">Coach / Consulente</option>
                                            <option value="tattoo">Tattoo Artist</option>
                                            <option value="massaggio">Massaggiatore / Wellness</option>
                                            <option value="altro">Altro</option>
                                        </select>
                                    </div>

                                    {/* Error Message */}
                                    {submitError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {submitError}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !email}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Entra nella Waitlist
                                                <ChevronRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-stone-400 text-center">
                                        Zero spam. Solo aggiornamenti sul lancio.
                                    </p>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-800 mb-2">
                                        Sei nella lista! 🎉
                                    </h3>
                                    <p className="text-stone-500">
                                        Ti contatteremo appena apriamo le iscrizioni Founder.
                                        <br />
                                        <strong>Controlla la tua email</strong> per la conferma.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-stone-200 bg-white">
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
