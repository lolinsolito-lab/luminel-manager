import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Sparkles, ArrowRight, Shield, Rocket, Heart,
    Users, Building2, Zap, Star, ChevronRight, MessageCircle,
    Check, Play, UserCircle, Scissors, HeartPulse, Truck, Quote, Menu, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VERTICALS = [
    {
        id: 'coaching',
        icon: UserCircle,
        title: 'Coach & Mentor',
        desc: 'Il tuo percorso verso la maestria, supportato da strumenti che comprendono il valore del tempo.',
        features: ['Progress Tracker', 'LTV Dashboard', 'AI Assistant'],
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000',
        term: 'Sessione'
    },
    {
        id: 'wellness',
        icon: HeartPulse,
        title: 'Operatori Olistici',
        desc: 'Lascia che l\'energia fluisca. Noi pensiamo alla gestione, tu al benessere dei tuoi clienti.',
        features: ['Schede 360°', 'Consensi Digitali', 'Reminder'],
        image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1000',
        term: 'Trattamento'
    },
    {
        id: 'beauty',
        icon: Scissors,
        title: 'Parrucchieri & Saloni',
        desc: 'Dove l\'eleganza incontra l\'efficienza. Il tuo salone merita una gestione all\'altezza.',
        features: ['Gestione Cabine', 'Inventory', 'Team Analytics'],
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000',
        term: 'Appuntamento'
    },
    {
        id: 'logistics',
        icon: Truck,
        title: 'Cooperative & Turni',
        desc: 'Dalla complessità alla semplicità. Gestisci centinaia di operatori con un solo sguardo.',
        features: ['Batch Booking', 'Multi-Location', 'Planning'],
        image: 'https://images.unsplash.com/photo-1586864387917-f575a62244af?auto=format&fit=crop&q=80&w=1000',
        term: 'Corsa'
    }
];

export const HomeLanding: React.FC = () => {
    const [activeVertical, setActiveVertical] = useState(VERTICALS[0]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Smooth scroll helper
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] text-stone-900 overflow-x-hidden">
            {/* Header / Nav - Champagne Edition */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-[#E8E4DF]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C9A962] to-[#8B7355] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A962]/20">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-serif font-bold tracking-tight text-[#3D3D3D]">
                            Luminel <span className="text-[#A89068] font-normal">Manager</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B8178]">
                        <button onClick={() => scrollToSection('manifesto')} className="hover:text-[#3D3D3D] transition-colors">Manifesto</button>
                        <button onClick={() => scrollToSection('soluzioni')} className="hover:text-[#3D3D3D] transition-colors">Soluzioni</button>
                        <button onClick={() => scrollToSection('founder')} className="hover:text-[#3D3D3D] transition-colors">Founder</button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="px-5 py-2 text-sm font-medium text-[#5C5549] hover:text-[#3D3D3D] transition-colors">
                            Accedi
                        </Link>
                        <Link
                            to="/founder"
                            className="px-6 py-2.5 bg-gradient-to-r from-[#3D3D3D] to-[#1A1A1A] text-[#F5F0E8] rounded-full text-sm font-semibold hover:shadow-xl hover:shadow-stone-300/30 transition-all"
                        >
                            Inizia Ora
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-[#5C5549]"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#FAF8F5] border-t border-[#E8E4DF]"
                        >
                            <div className="px-6 py-8 space-y-5">
                                <button onClick={() => scrollToSection('manifesto')} className="block text-lg font-serif text-[#3D3D3D] text-left w-full">Manifesto</button>
                                <button onClick={() => scrollToSection('soluzioni')} className="block text-lg font-serif text-[#3D3D3D] text-left w-full">Soluzioni</button>
                                <button onClick={() => scrollToSection('founder')} className="block text-lg font-serif text-[#3D3D3D] text-left w-full">Founder</button>
                                <div className="pt-5 border-t border-[#E8E4DF] space-y-3">
                                    <Link to="/login" className="block w-full py-3 text-center font-medium text-[#5C5549] border border-[#D4CFC7] rounded-xl">Accedi</Link>
                                    <Link to="/founder" className="block w-full py-3 text-center font-semibold text-[#F5F0E8] bg-[#3D3D3D] rounded-xl">Inizia Ora</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* HERO: Magazine Editorial Style */}
            <section className="pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-8 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#C9A962]/10 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#D4CFC7]/30 to-transparent rounded-full blur-[80px]" />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Editorial Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#F5F0E8] border border-[#E8E4DF] rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-[#A89068] mb-10"
                    >
                        <Sparkles className="w-3 h-3" />
                        Edizione Fondatori • 2025
                    </motion.div>

                    {/* Main Headline - Magazine Style */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl lg:text-8xl font-serif text-[#2D2D2D] leading-[0.95] mb-8"
                    >
                        Siamo Qui <br />
                        <span className="italic text-[#A89068]">Per Te.</span>
                    </motion.h1>

                    {/* Subtitle - Refined */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-[#8B8178] max-w-2xl mx-auto mb-14 leading-relaxed font-light"
                    >
                        Luminel non è un semplice gestionale. È il silenzioso partner che lavora dietro le quinte,
                        così tu puoi concentrarti su ciò che ami davvero: <em className="text-[#5C5549] not-italic font-medium">i tuoi clienti</em>.
                    </motion.p>

                    {/* CTAs - Refined */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/founder"
                            className="group px-8 py-4 bg-gradient-to-r from-[#3D3D3D] to-[#1A1A1A] text-[#F5F0E8] rounded-full text-base font-semibold flex items-center gap-3 hover:shadow-2xl hover:shadow-stone-400/20 transition-all"
                        >
                            Scopri il Programma Founder
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="flex items-center gap-3 px-6 py-4 text-[#5C5549] font-medium hover:text-[#3D3D3D] transition-colors">
                            <div className="w-10 h-10 rounded-full border border-[#D4CFC7] flex items-center justify-center">
                                <Play className="w-4 h-4 fill-[#A89068] text-[#A89068]" />
                            </div>
                            Guarda il Video
                        </button>
                    </motion.div>
                </div>

                {/* Decorative Line */}
                <div className="max-w-6xl mx-auto mt-20 md:mt-32">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#D4CFC7] to-transparent" />
                </div>
            </section>

            {/* SEZIONE: Manifesto - Elite Royal Edition */}
            <section id="manifesto" className="py-24 md:py-40 px-4 md:px-8 bg-[#1A1A1A] text-[#F5F0E8] relative overflow-hidden">
                {/* Decorative Gold Lines */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C9A962]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C9A962]/30 to-transparent" />

                {/* Background Texture */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23C9A962\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />

                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Section Label */}
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C9A962] mb-4">✦ Il Manifesto ✦</p>
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A962] to-transparent mx-auto" />
                    </div>

                    {/* Quote Block */}
                    <div className="relative">
                        {/* Giant Quote Mark */}
                        <div className="absolute -top-10 -left-4 md:-left-16 text-[120px] md:text-[180px] font-serif text-[#C9A962]/10 leading-none select-none">"</div>

                        <motion.blockquote
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <p className="text-3xl md:text-5xl lg:text-6xl font-serif leading-[1.2] mb-12">
                                Ho creato Luminel perché ero stanco di strumenti
                                <span className="block text-[#C9A962] italic mt-2">che non rispettano il tuo tempo.</span>
                            </p>
                        </motion.blockquote>

                        {/* Giant Closing Quote Mark */}
                        <div className="absolute -bottom-16 -right-4 md:-right-16 text-[120px] md:text-[180px] font-serif text-[#C9A962]/10 leading-none select-none rotate-180">"</div>
                    </div>

                    {/* Author & Philosophy */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-20 grid md:grid-cols-3 gap-12 text-center"
                    >
                        <div className="space-y-4">
                            <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-[#C9A962]" />
                            </div>
                            <h3 className="text-lg font-serif font-semibold">Siamo Qui Per Te</h3>
                            <p className="text-sm text-[#8B8178] leading-relaxed">
                                Non sei un numero. Sei la ragione per cui costruiamo ogni singola funzionalità.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-[#C9A962]" />
                            </div>
                            <h3 className="text-lg font-serif font-semibold">La Tua Fortezza</h3>
                            <p className="text-sm text-[#8B8178] leading-relaxed">
                                I tuoi dati sono sacri. La tua privacy è non negoziabile. Il tuo successo è la nostra missione.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                                <Rocket className="w-6 h-6 text-[#C9A962]" />
                            </div>
                            <h3 className="text-lg font-serif font-semibold">Evoluzione Continua</h3>
                            <p className="text-sm text-[#8B8178] leading-relaxed">
                                Ogni mese, nuove funzionalità. Ogni feedback, un'opportunità di crescita.
                            </p>
                        </div>
                    </motion.div>

                    {/* Signature */}
                    <div className="mt-20 text-center">
                        <div className="inline-flex items-center gap-4">
                            <div className="w-16 h-px bg-[#C9A962]/30" />
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C9A962]">Michael Jara, Fondatore</p>
                            <div className="w-16 h-px bg-[#C9A962]/30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* SEZIONE: Soluzioni Multi-Verticale */}
            <section id="soluzioni" className="py-20 md:py-32 px-4 md:px-8 bg-[#FAF8F5]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A89068] mb-4">Per Ogni Professione</p>
                        <h2 className="text-3xl md:text-5xl font-serif text-[#2D2D2D] mb-4">
                            Un Solo Strumento, <span className="italic text-[#A89068]">Infinite Possibilità.</span>
                        </h2>
                        <p className="text-[#8B8178] max-w-xl mx-auto">
                            Luminel si adatta al tuo mondo. Cambia terminologia, metriche e flussi in base al tuo settore.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                        {/* Vertical Tabs */}
                        <div className="space-y-3">
                            {VERTICALS.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setActiveVertical(v)}
                                    className={`w-full text-left p-6 rounded-2xl transition-all flex items-center gap-5 group ${activeVertical.id === v.id
                                        ? 'bg-[#3D3D3D] text-[#F5F0E8] shadow-xl'
                                        : 'bg-white text-[#5C5549] hover:bg-[#F5F0E8] border border-[#E8E4DF]'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${activeVertical.id === v.id ? 'bg-[#C9A962]/20' : 'bg-[#FAF8F5]'
                                        }`}>
                                        <v.icon className={`w-6 h-6 ${activeVertical.id === v.id ? 'text-[#C9A962]' : 'text-[#A89068]'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-serif font-semibold">{v.title}</h3>
                                        <p className={`text-sm ${activeVertical.id === v.id ? 'text-[#A89068]/80' : 'text-[#8B8178]'}`}>
                                            Terminologia: <span className="italic">"{v.term}"</span>
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${activeVertical.id === v.id ? 'translate-x-1 text-[#C9A962]' : 'text-[#D4CFC7]'}`} />
                                </button>
                            ))}
                        </div>

                        {/* Visual Card */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeVertical.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-[#E8E4DF]"
                                >
                                    <div className="aspect-video relative">
                                        <img
                                            src={activeVertical.image}
                                            className="w-full h-full object-cover"
                                            alt={activeVertical.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/60 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h4 className="text-2xl font-serif font-bold text-white mb-2">{activeVertical.title}</h4>
                                            <p className="text-white/80 text-sm leading-relaxed">{activeVertical.desc}</p>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A89068] mb-4">Funzionalità Incluse</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {activeVertical.features.map(f => (
                                                <div key={f} className="flex items-center gap-2 text-sm text-[#5C5549]">
                                                    <div className="w-5 h-5 rounded-full bg-[#C9A962]/10 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-[#C9A962]" />
                                                    </div>
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Badge */}
                            <div className="absolute -bottom-4 left-6 bg-[#C9A962] text-[#2D2D2D] px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                White Label Ready
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEZIONE: Trust Stats - Champagne Dark */}
            <section id="founder" className="py-20 md:py-24 bg-[#2D2D2D] text-[#F5F0E8] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center mb-12">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A962] mb-4">Numeri Che Parlano</p>
                        <h2 className="text-3xl md:text-4xl font-serif">
                            La Community Cresce, <span className="italic text-[#C9A962]">Insieme.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                        <div>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#C9A962]">847+</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B8178] mt-2">Professionisti</p>
                        </div>
                        <div>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#C9A962]">€2.4M</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B8178] mt-2">Volume Gestito</p>
                        </div>
                        <div>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#C9A962]">25</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B8178] mt-2">Posti Founder</p>
                        </div>
                        <div>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#C9A962]">44%</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B8178] mt-2">Sconto Lifetime</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINALE - Refined */}
            <section className="py-20 md:py-32 px-4 md:px-8 bg-[#FAF8F5]">
                <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 md:p-16 text-center shadow-xl border border-[#E8E4DF] relative overflow-hidden">
                    {/* Gold Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A962] to-transparent" />

                    <div className="w-16 h-16 bg-gradient-to-br from-[#C9A962] to-[#8B7355] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#C9A962]/20">
                        <Crown className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-serif text-[#2D2D2D] mb-6 leading-tight">
                        Pronto a Reclamare <br />
                        <span className="italic text-[#A89068]">la Tua Sovranità?</span>
                    </h2>
                    <p className="text-[#8B8178] mb-10 max-w-lg mx-auto leading-relaxed">
                        Le iscrizioni al programma Founder chiudono al raggiungimento del 25° membro.
                        Blocca ora il tuo prezzo e la tua eredità digitale.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/founder"
                            className="px-10 py-4 bg-gradient-to-r from-[#3D3D3D] to-[#1A1A1A] text-[#F5F0E8] rounded-full text-lg font-semibold hover:shadow-2xl transition-all"
                        >
                            Assicurati il Posto Founder
                        </Link>
                        <Link
                            to="/login"
                            className="text-[#5C5549] font-medium hover:text-[#3D3D3D] transition-colors"
                        >
                            Accedi alla Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer - Minimal Elegance */}
            <footer className="py-10 border-t border-[#E8E4DF] bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-[#C9A962]" />
                        <span className="font-serif font-bold text-[#3D3D3D]">Luminel</span>
                    </div>
                    <p className="text-[11px] text-[#8B8178] uppercase tracking-widest">
                        © 2025 Luminel Manager • Crafted for Empires • Made in Italia
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomeLanding;
