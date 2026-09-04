import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Sparkles, ArrowRight, Gift, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * PAYMENT SUCCESS PAGE
 * 
 * This page is shown after a successful Stripe checkout.
 * URL format: /#/success?session_id={CHECKOUT_SESSION_ID}
 */

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
    <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 1, scale: 1 }}
        animate={{
            y: [0, 400],
            x: [0, Math.random() * 200 - 100],
            opacity: [1, 1, 0],
            rotate: [0, 360],
            scale: [1, 0.5]
        }}
        transition={{
            duration: 3,
            delay: delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 2
        }}
    />
);

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showContent, setShowContent] = useState(false);

    // Get params from URL
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');
    const customerName = searchParams.get('name') || searchParams.get('customer_name');
    const customerEmail = searchParams.get('email');

    // Create personalized greeting
    const greeting = customerName
        ? `Benvenuto, ${customerName}!`
        : 'Benvenuto nella Famiglia!';

    useEffect(() => {
        // Delay content appearance for dramatic effect
        const timer = setTimeout(() => setShowContent(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Confetti colors
    const confettiColors = ['#f59e0b', '#fbbf24', '#d97706', '#92400e', '#fef3c7', '#ffffff'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="absolute" style={{ left: `${Math.random() * 100}%`, top: 0 }}>
                        <ConfettiParticle
                            delay={Math.random() * 2}
                            color={confettiColors[i % confettiColors.length]}
                        />
                    </div>
                ))}
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative bg-gradient-to-br from-stone-800/90 to-stone-900/90 backdrop-blur-xl rounded-3xl p-10 max-w-lg w-full text-center border border-amber-500/20 shadow-2xl"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3, duration: 0.6 }}
                    className="w-24 h-24 mx-auto mb-6 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-pulse" />
                    <div className="absolute inset-1 bg-stone-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-amber-400" />
                    </div>
                </motion.div>

                {/* Title */}
                {showContent && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h1 className="text-3xl font-display font-bold text-white mb-2">
                            {greeting}
                        </h1>
                        <p className="text-amber-400 text-lg font-medium flex items-center justify-center gap-2">
                            <Crown className="w-5 h-5" />
                            Founding Member Confermato
                            <Sparkles className="w-5 h-5" />
                        </p>
                    </motion.div>
                )}

                {/* Benefits */}
                {showContent && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-8 space-y-3"
                    >
                        <div className="flex items-center gap-3 text-stone-300 text-left bg-stone-800/50 p-3 rounded-xl">
                            <Gift className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span>Prezzo bloccato <strong className="text-white">per sempre</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-300 text-left bg-stone-800/50 p-3 rounded-xl">
                            <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span>Badge <strong className="text-white">Founding Member</strong> esclusivo</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-300 text-left bg-stone-800/50 p-3 rounded-xl">
                            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span>Accesso <strong className="text-white">prioritario</strong> alle nuove feature</span>
                        </div>
                    </motion.div>
                )}

                {/* CTA */}
                {showContent && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-8"
                    >
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            Completa la Registrazione
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-stone-500 text-sm mt-4">
                            Riceverai un'email con i dettagli del tuo abbonamento.
                        </p>
                    </motion.div>
                )}

                {/* Session ID (for debugging) */}
                {sessionId && (
                    <p className="text-stone-600 text-xs mt-6 font-mono">
                        Session: {sessionId.substring(0, 20)}...
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
