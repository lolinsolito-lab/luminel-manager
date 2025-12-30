import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ScrollText, Lock } from 'lucide-react';

interface LegalModalProps {
    type: 'privacy' | 'terms' | 'cookie';
    isOpen: boolean;
    onClose: () => void;
}

const LEGAL_CONTENT = {
    privacy: {
        title: 'Privacy Policy',
        icon: Shield,
        content: (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                <p className="font-bold text-stone-900">Ultimo aggiornamento: 30 Dicembre 2024</p>
                <p>Benvenuto in Luminel. La protezione dei tuoi dati è fondamentale per il nostro impero. Questa policy spiega come raccogliamo e trattiamo i tuoi dati.</p>
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-xs">1. Dati Raccolti</h3>
                <p>Raccogliamo email, nome e dettagli professionali per fornirti l'accesso alla piattaforma e gestire l'abbonamento tramite Stripe.</p>
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-xs">2. Finalità</h3>
                <p>I dati vengono utilizzati esclusivamente per la gestione dell'account, l'invio di comunicazioni transazionali e il miglioramento dei servizi AI di Luminel.</p>
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-xs">3. Pagamenti</h3>
                <p>I tuoi dati di pagamento non vengono salvati sui nostri server, ma gestiti in modo sicuro da Stripe (PCI-DSS compliant).</p>
            </div>
        )
    },
    terms: {
        title: 'Terms of Service',
        icon: ScrollText,
        content: (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-xs">1. Accettazione</h3>
                <p>L'utilizzo di Luminel implica l'accettazione dei presenti termini. Il servizio è rivolto a professionisti (B2B).</p>
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-xs">2. Limitazioni Tier</h3>
                <p>Ogni piano (Starter, Pro, Signature, Empire) ha limiti tecnici specifici. Il superamento dei limiti richiede l'upgrade del piano.</p>
                <h3 className="font-bold text-stone-800 uppercase tracking-wider text-xs">3. Proprietà dei Dati</h3>
                <p>I dati dei tuoi clienti rimangono di tua proprietà esclusiva. Luminel fornisce solo l'infrastruttura di gestione.</p>
            </div>
        )
    },
    cookie: {
        title: 'Cookie Policy',
        icon: Lock,
        content: (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                <p>Utilizziamo solo cookie tecnici necessari al funzionamento della dashboard e cookie di terze parti (Meta/Google) per tracciare l'efficacia delle nostre campagne pubblicitarie.</p>
            </div>
        )
    }
};

export const LegalModal: React.FC<LegalModalProps> = ({ type, isOpen, onClose }) => {
    const content = LEGAL_CONTENT[type];
    const Icon = content.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-200">
                                    <Icon className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-stone-900">{content.title}</h3>
                                    <p className="text-xs text-stone-400 uppercase tracking-widest">Luminel Manager • Legal</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 font-bold hover:bg-stone-100 hover:text-stone-900 transition-all border border-stone-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {content.content}
                        </div>

                        <div className="mt-10 pt-6 border-t border-stone-100 flex justify-center relative z-10">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 text-sm"
                            >
                                Ho Capito
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
