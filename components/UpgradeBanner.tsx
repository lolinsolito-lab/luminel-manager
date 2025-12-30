import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeBannerProps {
    variant?: 'compact' | 'full';
    currentTier?: string;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
    variant = 'full',
    currentTier = 'free'
}) => {
    if (currentTier !== 'free') return null;

    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-xl flex items-center justify-between gap-3 shadow-lg shadow-amber-500/20"
            >
                <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        Stai usando il piano <strong>Free</strong> con funzionalità limitate
                    </span>
                </div>
                <Link
                    to="/founder"
                    className="bg-white text-amber-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors flex items-center gap-1"
                >
                    Upgrade <ArrowRight className="w-3 h-3" />
                </Link>
            </motion.div>
        );
    }

    // Full variant
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 rounded-2xl p-6 border border-stone-700 shadow-xl relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            Sblocca il Potenziale Completo
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </h3>
                        <p className="text-stone-400 text-sm mb-4">
                            Con il piano Free hai accesso limitato. Passa a Founder e sblocca:
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {[
                                'Clienti illimitati',
                                'PDF senza watermark',
                                'Email automatiche',
                                'WhatsApp automation',
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-stone-300">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/founder"
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2"
                            >
                                Diventa Founder <ArrowRight className="w-4 h-4" />
                            </Link>
                            <span className="text-amber-400 text-sm font-medium animate-pulse">
                                🔥 Solo 25 posti!
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UpgradeBanner;
