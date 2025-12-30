import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Sparkles, ArrowRight, Shield, Rocket, Heart,
    Users, Building2, Zap, Star, ChevronRight, MessageCircle,
    Check, Play, UserCircle, Scissors, HeartPulse, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VERTICALS = [
    {
        id: 'coaching',
        icon: UserCircle,
        title: 'Coach & Mentor',
        desc: 'Gestisci il tuo roster di talenti con eleganza. Da 1 a 1000 allievi, senza mai perdere il tocco personale.',
        features: ['Progress Tracker', 'LTV Dashboard', 'AI Coaching Assistant'],
        image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=1000',
        term: 'Sessione'
    },
    {
        id: 'wellness',
        icon: HeartPulse,
        title: 'Operatori Olistici',
        desc: 'Trasforma il tuo studio in un tempio di efficienza. Focus totale sul trattamento, zero stress gestionale.',
        features: ['Schede Cliente 360°', 'Consensi Digitali', 'Reminder WhatsApp'],
        image: 'https://images.unsplash.com/photo-1544161515-436cefb54041?auto=format&fit=crop&q=80&w=1000',
        term: 'Trattamento'
    },
    {
        id: 'beauty',
        icon: Scissors,
        title: 'Parrucchieri & Saloni',
        desc: 'Il lusso incontra la logistica. Gestisci team, cabine e prodotti con una dashboard da vera Boutique.',
        features: ['Gestione Cabine', 'Inventory Pro', 'Team Analytics'],
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000',
        term: 'Appuntamento'
    },
    {
        id: 'logistics',
        icon: Truck,
        title: 'Cooperative & Turni',
        desc: 'Dominio operativo totale. Gestisci centinaia di operatori e rotte con il sistema Batch Booking.',
        features: ['Batch Booking (Pro)', 'Multi-Location', 'Resource Planning'],
        image: 'https://images.unsplash.com/photo-1586864387917-f575a62244af?auto=format&fit=crop&q=80&w=1000',
        term: 'Corsa / Spostamento'
    }
];

export const HomeLanding: React.FC = () => {
    const [activeVertical, setActiveVertical] = useState(VERTICALS[0]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-stone-900 overflow-x-hidden">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                            <Crown className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                        </div>
                        <span className="text-lg md:text-xl font-serif font-bold tracking-tight">Luminel <span className="text-stone-400">Manager</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-stone-500">
                        <a href="#manifesto" className="hover:text-stone-900 transition-colors">Manifesto</a>
                        <a href="#soluzioni" className="hover:text-stone-900 transition-colors">Soluzioni</a>
                        <Link to="/founder" className="hover:text-stone-900 transition-colors">Founder Program</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-stone-900 hover:text-stone-600 transition-colors">Log In</Link>
                        <Link
                            to="/founder"
                            className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                        >
                            Inizia l'Impero
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                    >
                        <span className={`w-6 h-0.5 bg-stone-900 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-stone-900 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-stone-900 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
                        >
                            <div className="px-6 py-6 space-y-4">
                                <a href="#manifesto" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-stone-900">Manifesto</a>
                                <a href="#soluzioni" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-stone-900">Soluzioni</a>
                                <Link to="/founder" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-amber-600">Founder Program</Link>
                                <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                                    <Link to="/login" className="py-3 text-center font-bold text-stone-600 border border-stone-200 rounded-xl">Accedi</Link>
                                    <Link to="/founder" className="py-3 text-center font-bold text-white bg-stone-900 rounded-xl">Inizia l'Impero</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* HERO: The Manifesto Start */}
            <section className="pt-40 pb-24 px-6 relative">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Il Futuro del Management Elite
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-serif font-bold text-stone-900 mb-8 leading-[1]"
                    >
                        Il Tuo Impero Merita <br />
                        <span className="text-stone-400 italic">Uno Strumento Sovrano.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Non è solo software. È l'estensione digitale della tua professionalità. Luminel è il pivot su cui ruota il tuo business luxury, dal coaching granulare alle cooperative su larga scala.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-6"
                    >
                        <Link
                            to="/founder"
                            className="group px-10 py-5 bg-stone-900 text-white rounded-[2rem] text-lg font-bold flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-stone-300"
                        >
                            Diventa Founding Member
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <button className="flex items-center gap-3 px-8 py-5 border border-stone-200 rounded-[2rem] text-stone-600 font-bold hover:bg-stone-50 transition-all">
                            <Play className="w-5 h-5 fill-stone-600" />
                            Guarda il Manifesto
                        </button>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-[100px] -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-[120px] translate-x-1/4" />
            </section>

            {/* SEZIONE: Chi Siamo / Storytelling */}
            <section id="manifesto" className="py-24 bg-stone-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <div className="aspect-[4/5] bg-stone-200 rounded-[3rem] overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000"
                                className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
                                alt="Founder"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-stone-900 rounded-[2rem] p-8 text-white flex flex-col justify-end shadow-2xl">
                            <p className="text-4xl font-serif font-bold text-amber-400">12+</p>
                            <p className="text-xs font-black uppercase tracking-widest text-stone-400">Anni di Experience Design</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-8 leading-tight">
                            "Ho creato Luminel perché <br />
                            ero stanco di strumenti <br />
                            senza anima."
                        </h2>
                        <div className="space-y-6 text-stone-600 leading-relaxed text-lg">
                            <p>
                                Sono Michael, e ho passato l'ultimo decennio a costruire esperienze per brand di lusso e leader olistici. Ho visto troppe menti brillanti soffocare sotto il peso di fogli Excel disordinati e software obsoleti.
                            </p>
                            <p>
                                <strong>Protocollo Sovrano</strong> è nato così: un'esigenza viscerale di riportare l'ordine, l'eleganza e la sovranità nel quotidiano di chi offre valore agli altri.
                            </p>
                            <p>
                                Luminel non è un gestionale. È il luogo dove il tuo tempo acquista valore e ogni tuo cliente riceve l'esperienza premium che merita.
                            </p>
                        </div>
                        <div className="mt-12 flex items-center gap-4">
                            <div className="w-12 h-0.5 bg-stone-300" />
                            <p className="text-sm font-black uppercase tracking-widest text-stone-400">Michael Jara, Fondatore</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEZIONE: Multi-Verticale (IL CAMALEONTE) */}
            <section id="soluzioni" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Un Prodotto, <span className="text-stone-400 italic">Infiniti Mercati.</span></h2>
                        <p className="text-stone-500 max-w-2xl mx-auto">
                            Luminel si adatta dinamicamente al tuo settore, cambiando terminologia, KPI e flussi di lavoro in un clic.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* LEFT: Navigazione Verticali */}
                        <div className="space-y-4">
                            {VERTICALS.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setActiveVertical(v)}
                                    className={`w-full text-left p-8 rounded-[2rem] transition-all flex items-center gap-6 group ${activeVertical.id === v.id
                                        ? 'bg-stone-900 text-white shadow-2xl scale-[1.02]'
                                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl transition-colors ${activeVertical.id === v.id ? 'bg-white/10' : 'bg-white shadow-sm'
                                        }`}>
                                        <v.icon className={`w-8 h-8 ${activeVertical.id === v.id ? 'text-amber-400' : 'text-stone-800'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{v.title}</h3>
                                        <p className={`text-sm leading-relaxed ${activeVertical.id === v.id ? 'text-stone-400' : 'text-stone-500'
                                            }`}>
                                            Terminologia: <span className="font-bold underline italic">"{v.term}"</span>
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-6 h-6 transition-transform ${activeVertical.id === v.id ? 'translate-x-2 text-amber-400' : 'text-stone-300 opacity-0 group-hover:opacity-100'
                                        }`} />
                                </button>
                            ))}
                        </div>

                        {/* RIGHT: Visual Showcase */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeVertical.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-stone-50 rounded-[3rem] overflow-hidden shadow-2xl border border-stone-100"
                                >
                                    <div className="aspect-video relative">
                                        <img
                                            src={activeVertical.image}
                                            className="w-full h-full object-cover"
                                            alt={activeVertical.title}
                                        />
                                        <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[2px]" />
                                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-800 flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-amber-500" /> Pre-Configurato
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-10">
                                        <h4 className="text-2xl font-serif font-bold text-stone-900 mb-4">{activeVertical.title}</h4>
                                        <p className="text-stone-500 mb-8 leading-relaxed">
                                            {activeVertical.desc}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {activeVertical.features.map(f => (
                                                <div key={f} className="flex items-center gap-2 text-sm font-bold text-stone-700">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Decorative Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-amber-400 text-stone-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl rotate-[-5deg]">
                                White Label Ready
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEZIONE: Trust / Stats */}
            <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-4 gap-12 text-center">
                        <div className="space-y-4">
                            <h3 className="text-5xl font-serif font-bold text-amber-400">847+</h3>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">Professionisti Elite</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-serif font-bold text-amber-400">€2.4M</h3>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">Volume Gestito</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-serif font-bold text-amber-400">25</h3>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">Posti Founder Totali</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-serif font-bold text-amber-400">44%</h3>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">Sconto Founder Life-time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINALE */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-stone-50 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden border border-stone-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

                    <Crown className="w-16 h-16 text-amber-400 mx-auto mb-8 animate-bounce" />
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-8 leading-tight">
                        Sei pronto a reclamare <br />
                        la tua sovranità?
                    </h2>
                    <p className="text-xl text-stone-500 mb-12 max-w-2xl mx-auto">
                        Le iscrizioni al programma Founder chiudono al raggiungimento del 25° membro. Blocca ora il tuo prezzo e la tua eredità digitale.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link
                            to="/founder"
                            className="bg-stone-900 text-white px-12 py-6 rounded-[2rem] text-xl font-bold hover:bg-black hover:scale-105 transition-all shadow-2xl"
                        >
                            Assicurati il Posto Founder
                        </Link>
                        <Link
                            to="/login"
                            className="text-stone-900 font-bold hover:text-amber-600 transition-colors"
                        >
                            Accedi alla tua Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer Minimal */}
            <footer className="py-12 border-t border-stone-100 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-stone-400 text-sm font-medium">© 2025 Luminel Manager. Crafted for Empires by Michael Jara.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomeLanding;
