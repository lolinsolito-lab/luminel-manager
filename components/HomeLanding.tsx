import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Sparkles, ArrowRight, Shield, Rocket, Heart,
    Users, Building2, Zap, Star, ChevronRight, MessageCircle,
    Check, Play, Calendar, Table, Clock, Menu, X, Coffee,
    AlertTriangle, TrendingDown, Briefcase, Quote, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Pain Points Data
const PAIN_POINTS = [
    {
        icon: Table,
        title: '2 Ore Su Excel',
        desc: 'Ogni sera, inserire manualmente fatture e appuntamenti del giorno. Frustrante.',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp Caos',
        desc: '"Dove hai messo quello screenshot? Quale cliente mi pagò?" Chat infinito.',
    },
    {
        icon: Calendar,
        title: '5 Tool Diversi',
        desc: 'Calendar, CRM, Excel, Notes, Dropbox... nessuno che parla tra loro.',
    }
];

// Testimonials Data
const TESTIMONIALS = [
    {
        name: 'Sara L.',
        role: 'High Performance Coach',
        location: 'Bergamo',
        founderNumber: 2,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        before: '6 ore/settimana su gestione. Odiavo lunedì perché significava Excel fino alle 22:00.',
        after: 'Setup completo in 1 ora con Michael. Ora? 20 minuti/settimana. Ho lanciato nuovo programma con tempo risparmiato. +€4K/mese.',
    },
    {
        name: 'Marco T.',
        role: 'Creative Director Salon',
        location: 'Milano',
        founderNumber: 1,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        before: '3 dipendenti, calendario cartaceo (!), WhatsApp impossibile. Perdevo 2-3 appuntamenti/settimana. €600/m persi.',
        after: 'AI automation gestisce conferme. White-label con mio logo. Clienti pensano ho developer in team. Zero appuntamenti persi. ROI: €2,800/mese.',
    },
    {
        name: 'Giulia M.',
        role: 'Master Tattooist',
        location: 'Roma',
        founderNumber: 3,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        before: 'Artista, non contabile. Fatture sempre in ritardo, INPS mi multava. Stress infinito.',
        after: 'Fatturazione automatica integrata. Luminel manda reminder pagamenti. INPS? Sistemato. Dormo di nuovo.',
    }
];

export const HomeLanding: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [founderSpots] = useState(22); // Remaining spots

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFCFA] text-stone-900 overflow-x-hidden">
            {/* HEADER NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFA]/95 backdrop-blur-xl border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C9A962] to-[#8B7355] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A962]/20">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-serif font-bold tracking-tight text-stone-800">
                            Luminel
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500">
                        <button onClick={() => scrollToSection('problema')} className="hover:text-stone-900 transition-colors">Il Problema</button>
                        <button onClick={() => scrollToSection('storia')} className="hover:text-stone-900 transition-colors">La Storia</button>
                        <button onClick={() => scrollToSection('piano')} className="hover:text-stone-900 transition-colors">Il Piano</button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="px-5 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                            Accedi
                        </Link>
                        <Link
                            to="/founder"
                            className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-sm font-semibold hover:bg-black transition-all"
                        >
                            Reclama Il Tuo Tempo →
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-stone-600"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#FDFCFA] border-t border-stone-100"
                        >
                            <div className="px-6 py-6 space-y-4">
                                <button onClick={() => scrollToSection('problema')} className="block text-lg font-medium text-stone-800">Il Problema</button>
                                <button onClick={() => scrollToSection('storia')} className="block text-lg font-medium text-stone-800">La Storia</button>
                                <button onClick={() => scrollToSection('piano')} className="block text-lg font-medium text-stone-800">Il Piano</button>
                                <div className="pt-4 border-t border-stone-100 space-y-3">
                                    <Link to="/login" className="block w-full py-3 text-center font-medium text-stone-600 border border-stone-200 rounded-xl">Accedi</Link>
                                    <Link to="/founder" className="block w-full py-3 text-center font-semibold text-white bg-[#1A1A1A] rounded-xl">Reclama Il Tuo Tempo →</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ═══════════════════════════════════════════════════════════════════════
                HERO SECTION - StoryBrand: Character + External/Internal Problem
            ═══════════════════════════════════════════════════════════════════════ */}
            <section className="pt-28 md:pt-36 pb-20 md:pb-28 px-4 md:px-8 relative overflow-hidden">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-[0.03]"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000")' }}
                    />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Founder Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-widest text-amber-700 mb-8"
                    >
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        Solo {founderSpots}/25 Posti Founder Disponibili
                    </motion.div>

                    {/* Main Headline - Pain Point */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.1] mb-6"
                    >
                        Hai Costruito Un Business <br />
                        Che <span className="italic text-[#C9A962]">Ama</span> I Tuoi Clienti.
                        <span className="block mt-4 text-stone-500">
                            Ma Il Gestionale Ti Ruba <br className="md:hidden" />
                            <span className="text-red-600 font-bold not-italic">4 Ore al Giorno.</span>
                        </span>
                    </motion.h1>

                    {/* Subheadline - Emotional */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Non dovrebbe essere così. Hai iniziato per <strong className="text-stone-800">trasformare vite</strong>,
                        non per lottare con software che ti trattano come un numero.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/founder"
                            className="group px-8 py-4 bg-[#1A1A1A] text-white rounded-full text-base font-semibold flex items-center gap-3 hover:bg-black hover:shadow-2xl transition-all"
                        >
                            Reclama Il Tuo Tempo
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => scrollToSection('storia')}
                            className="flex items-center gap-3 px-6 py-4 text-stone-600 font-medium hover:text-stone-900 transition-colors"
                        >
                            <Play className="w-5 h-5 fill-[#C9A962] text-[#C9A962]" />
                            Guarda Come Michael l'Ha Fatto
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                SECTION 1: THE PROBLEM - StoryBrand: External + Internal + Philosophical
            ═══════════════════════════════════════════════════════════════════════ */}
            <section id="problema" className="py-20 md:py-28 px-4 md:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
                            Conosci Questa Scena?
                        </h2>
                        <div className="w-20 h-1 bg-[#C9A962] mx-auto rounded-full" />
                    </div>

                    {/* 3-Column Pain Points */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {PAIN_POINTS.map((point, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-stone-50 rounded-2xl p-8 border border-stone-100"
                            >
                                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                                    <point.icon className="w-7 h-7 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-3">{point.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{point.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Quote */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#1A1A1A] rounded-3xl p-8 md:p-12 text-center"
                    >
                        <Quote className="w-10 h-10 text-[#C9A962] mx-auto mb-6 opacity-50" />
                        <p className="text-xl md:text-2xl text-white font-serif leading-relaxed mb-6">
                            "Ho intervistato 127 coach, saloni, e operatori olistici. <br />
                            <span className="text-[#C9A962] font-bold">Il 92% passa più tempo sul gestionale che con i clienti.</span> <br />
                            Questo è inaccettabile."
                        </p>
                        <p className="text-stone-400 font-medium">
                            — Michael Jara, Founder Luminel
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                SECTION 2: THE GUIDE - StoryBrand: You are Yoda, not Luke
            ═══════════════════════════════════════════════════════════════════════ */}
            <section id="storia" className="py-20 md:py-28 px-4 md:px-8 bg-[#FDFCFA]">
                <div className="max-w-6xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
                            C'È Chi Ha Passato Questo Inferno. <br />
                            <span className="italic text-[#C9A962]">E Ne È Uscito.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
                        {/* Left: Photo */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    alt="Michael Jara, Founder"
                                />
                            </div>
                            <div className="absolute -bottom-4 left-4 right-4 md:left-6 md:right-6 bg-[#1A1A1A] rounded-2xl p-4 shadow-xl">
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C9A962]">
                                    Michael Jara, 3AM Milano, 2023
                                </p>
                                <p className="text-white/70 text-xs mt-1">
                                    "L'ultima notte che passo su Excel"
                                </p>
                            </div>
                        </motion.div>

                        {/* Right: Story */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
                                Nel 2022 Ho Fatto €180K Di Revenue. <br />
                                <span className="text-red-600">E Ho Lavorato 73 Ore A Settimana.</span>
                            </h3>

                            <p className="text-stone-600 leading-relaxed">
                                Il problema non era trovare clienti. Il problema era <strong className="text-stone-900">gestirli</strong>.
                            </p>

                            <ul className="space-y-2 text-stone-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    4 ore/giorno su Excel e WhatsApp
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    Email perse, pagamenti ritardati
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    Zero tempo per famiglia
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    Dashboard fatti in casa che crashavano
                                </li>
                            </ul>

                            <div className="bg-stone-100 rounded-2xl p-6 border-l-4 border-[#C9A962]">
                                <p className="text-stone-700 italic leading-relaxed">
                                    Ho provato 8 gestionali: Calendly (troppo basic), Acuity (ugly come Excel),
                                    Mindbody (costa €400/m, complessità folle). <br /><br />
                                    <strong>Tutti costruiti per ristoranti. Nessuno per professionisti come noi.</strong>
                                </p>
                            </div>

                            <p className="text-stone-600 leading-relaxed">
                                Così una sera, ore 2:47AM, caffè #6:
                            </p>

                            <p className="text-2xl font-serif font-bold text-stone-900 italic">
                                "Basta. Lo costruisco io."
                            </p>

                            <div className="bg-[#C9A962]/10 rounded-2xl p-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-[#C9A962]">11</p>
                                        <p className="text-xs text-stone-600 uppercase tracking-wide">Mesi</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#C9A962]">847</p>
                                        <p className="text-xs text-stone-600 uppercase tracking-wide">Ore Coding</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#C9A962]">€47K</p>
                                        <p className="text-xs text-stone-600 uppercase tracking-wide">Investiti</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg text-stone-700 font-medium">
                                Oggi gestisco 180 clienti con Luminel. <br />
                                <span className="text-[#C9A962] font-bold">Tempo su gestionale? 35 minuti/giorno.</span>
                            </p>

                            <p className="text-stone-600 italic">
                                Non è solo un software. È la mia libertà riconquistata. <br />
                                <strong className="text-stone-900 not-italic">E ora, la tua.</strong>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to="/founder"
                                    className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-semibold text-center hover:bg-black transition-colors"
                                >
                                    Voglio La Mia Libertà →
                                </Link>
                                <button
                                    onClick={() => scrollToSection('piano')}
                                    className="px-8 py-4 border border-stone-300 rounded-full font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    Mostrami La Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                SECTION 3: THE PLAN - StoryBrand: Simple 3-Step Plan
            ═══════════════════════════════════════════════════════════════════════ */}
            <section id="piano" className="py-20 md:py-28 px-4 md:px-8 bg-white">
                <div className="max-w-5xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
                            Come Riprendi Il Controllo <br />
                            <span className="italic text-[#C9A962]">(In 3 Passi Ridicolmente Semplici)</span>
                        </h2>
                    </div>

                    {/* 3 Step Cards */}
                    <div className="space-y-6">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-3xl p-8 text-white"
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-[#C9A962] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-xl flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-3">Blocca Prezzo Founder</h3>
                                    <p className="text-stone-300 leading-relaxed mb-4">
                                        {founderSpots} posti rimasti dei 25. Quando chiude, €55/m diventa €99/m. <strong className="text-white">Per sempre.</strong>
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full text-amber-400 text-sm font-bold">
                                        <Clock className="w-4 h-4" />
                                        Offerta valida finché ci sono posti
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-stone-50 rounded-3xl p-8 border border-stone-100"
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-[#C9A962] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-xl flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-stone-900 mb-3">Trial 14 Giorni (Zero Carta)</h3>
                                    <p className="text-stone-600 leading-relaxed mb-4">
                                        Import clienti, test AI coach, vedi dashboard. Se non risparmi 2h/giorno, cancelli gratis.
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full text-emerald-700 text-sm font-bold">
                                        <Shield className="w-4 h-4" />
                                        No Carta di Credito Richiesta
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-stone-50 rounded-3xl p-8 border border-stone-100"
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-[#C9A962] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-xl flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-stone-900 mb-3">Onboarding VIP Con Michael (Founder)</h3>
                                    <p className="text-stone-600 leading-relaxed mb-4">
                                        Call 30min setup personale. Ti guido io. Primi 25 Founder = accesso diretto a me.
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-violet-100 px-4 py-2 rounded-full text-violet-700 text-sm font-bold">
                                        <Crown className="w-4 h-4" />
                                        Esclusivo per Founding Member
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Note */}
                    <div className="text-center mt-12">
                        <p className="text-stone-500 font-medium">
                            Setup completo in <span className="text-[#C9A962] font-bold">47 minuti</span> medi. <br />
                            Non ore. Non giorni. <strong className="text-stone-900">Minuti.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                SECTION 4: SUCCESS - StoryBrand: Life After Luminel (Future Pacing)
            ═══════════════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 px-4 md:px-8 bg-gradient-to-br from-[#FDFCFA] to-[#F5F0E8]">
                <div className="max-w-6xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
                            Immagina <span className="italic text-[#C9A962]">Domattina.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left: Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                                    className="w-full h-full object-cover"
                                    alt="Happy coach with client"
                                />
                            </div>
                        </motion.div>

                        {/* Right: Future Pacing Story */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="space-y-4 font-mono text-sm">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
                                    <p className="text-[#C9A962] font-bold mb-2">ORE 09:12</p>
                                    <p className="text-stone-700">
                                        Apri Luminel su tablet. Dashboard ti mostra: 3 sessioni oggi (già confermate via WhatsApp auto),
                                        €2,340 incassati questa settimana, 2 clienti compleanni (reminder inviato ieri).
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
                                    <p className="text-[#C9A962] font-bold mb-2">ORE 09:15</p>
                                    <p className="text-stone-700">
                                        Cliente scrive "Voglio sessione domani". Tu: tasto "Proponi Slot".
                                        AI controlla calendar, propone 3 orari. Cliente conferma ore 15:00.
                                        Sistema crea evento, invia conferma, prepara Zoom.
                                    </p>
                                    <p className="text-emerald-600 font-bold mt-2">Tempo totale: 11 secondi. Senza te.</p>
                                </div>

                                <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
                                    <p className="text-[#C9A962] font-bold mb-2">ORE 19:00</p>
                                    <p className="text-stone-700">
                                        Chiudi laptop. Fatturato giorno: €780. Tempo su gestionale: 19 minuti.
                                        Tempo con clienti: 5 ore.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
                                <p className="text-lg leading-relaxed">
                                    La sera non è più "recupero da burnout". <br />
                                    È cena con famiglia. È Netflix senza sensi colpa. <br />
                                    <span className="text-[#C9A962] font-bold">È TU che vivi, non solo lavori.</span>
                                </p>
                            </div>

                            <p className="text-center text-stone-600 font-medium">
                                Questo non è futuro. <strong className="text-stone-900">È domani.</strong>
                            </p>

                            <Link
                                to="/founder"
                                className="block w-full py-5 bg-[#C9A962] text-[#1A1A1A] rounded-full text-lg font-bold text-center hover:bg-[#D4B572] transition-colors"
                            >
                                VOGLIO QUESTO DOMANI →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                SECTION 5: FAILURE - StoryBrand: What Happens If You Don't Act
            ═══════════════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 px-4 md:px-8 bg-[#1A1A1A] text-white">
                <div className="max-w-4xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif mb-4">
                            E Se <span className="italic text-red-400">Non Fai Nulla?</span>
                        </h2>
                    </div>

                    {/* Timeline of Failure */}
                    <div className="space-y-8 mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
                        >
                            <h3 className="text-lg font-bold text-red-400 mb-3">TRA 6 MESI:</h3>
                            <ul className="space-y-2 text-stone-300">
                                <li>• Ancora 4 ore/giorno su Excel</li>
                                <li>• Ancora WhatsApp persi</li>
                                <li>• Ancora weekend persi a "sistemare cose"</li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
                        >
                            <h3 className="text-lg font-bold text-red-400 mb-3">TRA 1 ANNO:</h3>
                            <ul className="space-y-2 text-stone-300">
                                <li>• <span className="text-white font-bold">1,460 ore buttate</span> (60 giorni pieni)</li>
                                <li>• €15K+ persi in inefficiency</li>
                                <li>• Burnout completo ("Forse sbagliavo carriera?")</li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-red-900/30 backdrop-blur rounded-2xl p-6 border border-red-500/30"
                        >
                            <h3 className="text-lg font-bold text-red-400 mb-3">TRA 2 ANNI:</h3>
                            <ul className="space-y-2 text-stone-300">
                                <li>• Chiudi il business</li>
                                <li>• Torni dipendente</li>
                                <li className="italic text-white">"Dovevo provare quel gestionale..."</li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Dramatic Close */}
                    <div className="text-center">
                        <p className="text-stone-400 mb-2">
                            È drammatico? Sì. È reale? Chiedi ai 3,200 coach/saloni che hanno chiuso nel 2024.
                        </p>
                        <p className="text-xs text-stone-500 italic mb-10">
                            Fonte: Report ISTAT Wellness Industry 2024
                        </p>

                        <div className="bg-gradient-to-r from-[#C9A962] to-[#D4B572] rounded-3xl p-8 text-[#1A1A1A]">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                                "Ma Tu Non Sei Loro. <br />
                                Perché Sei Ancora Qui."
                            </h3>
                            <Link
                                to="/founder"
                                className="inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] text-white rounded-full text-lg font-bold hover:bg-black transition-colors"
                            >
                                Blocca Prezzo Founder Ora
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <p className="mt-4 text-sm font-medium text-[#1A1A1A]/70">
                                {founderSpots} posti / 25 disponibili
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                SECTION 6: SOCIAL PROOF - StoryBrand: Testimonials (Narrative)
            ═══════════════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 px-4 md:px-8 bg-[#FDFCFA]">
                <div className="max-w-6xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
                            Loro Hanno Scelto. <br />
                            <span className="italic text-[#C9A962]">Questo È Cambiato.</span>
                        </h2>
                    </div>

                    {/* Testimonial Cards */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-3xl p-6 shadow-xl border border-stone-100"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={t.avatar}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A962]"
                                        alt={t.name}
                                    />
                                    <div>
                                        <h4 className="font-bold text-stone-900">{t.name}</h4>
                                        <p className="text-sm text-stone-500">{t.role}</p>
                                        <p className="text-xs text-[#C9A962] font-bold">Founder #{t.founderNumber} | {t.location}</p>
                                    </div>
                                </div>

                                {/* Before */}
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">PRIMA DI LUMINEL:</p>
                                    <p className="text-sm text-stone-600 italic leading-relaxed">"{t.before}"</p>
                                </div>

                                {/* After */}
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">DOPO LUMINEL:</p>
                                    <p className="text-sm text-stone-700 leading-relaxed">"{t.after}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Note */}
                    <div className="text-center mt-12">
                        <p className="text-stone-500">
                            Questi sono 3 dei 22 Founder già dentro. <br />
                            <span className="text-[#C9A962] font-bold">Restano {25 - 22} posti.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════
                FINAL CTA - Last Push
            ═══════════════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-28 px-4 md:px-8 bg-[#1A1A1A]">
                <div className="max-w-3xl mx-auto text-center">
                    <Crown className="w-16 h-16 text-[#C9A962] mx-auto mb-8" />
                    <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
                        Il Momento È Adesso. <br />
                        <span className="italic text-[#C9A962]">La Scelta È Tua.</span>
                    </h2>
                    <p className="text-stone-400 mb-10 max-w-xl mx-auto leading-relaxed">
                        {founderSpots} posti Founder rimasti. Prezzo bloccato a vita.
                        Onboarding personale con me. 14 giorni trial senza carta.
                    </p>
                    <Link
                        to="/founder"
                        className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#C9A962] to-[#D4B572] text-[#1A1A1A] rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-[#C9A962]/30 transition-all"
                    >
                        Reclama Il Tuo Posto Founder
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-10 border-t border-stone-800 bg-[#0F0F0F] text-center">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-[#C9A962]" />
                        <span className="font-serif font-bold text-white">Luminel</span>
                    </div>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">
                        © 2025 Luminel Manager • Crafted for Empires • Made in Italia
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomeLanding;
