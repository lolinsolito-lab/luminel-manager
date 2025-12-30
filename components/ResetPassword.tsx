import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { updatePassword, supabase } from '../services/supabaseClient';
import { Logo } from './Logo';

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 5;

        // Check if URL contains recovery tokens (direct detection)
        const checkForRecoveryTokens = () => {
            const fullUrl = window.location.href;
            const hash = window.location.hash;
            // Supabase puts tokens like: #access_token=xxx&type=recovery
            return fullUrl.includes('type=recovery') ||
                hash.includes('type=recovery') ||
                fullUrl.includes('access_token');
        };

        // Check if user has a valid recovery session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session && isMounted) {
                    setIsValidSession(true);
                    return true;
                }

                // If no session but we have tokens in URL, Supabase might still be processing
                if (checkForRecoveryTokens() && retryCount < maxRetries) {
                    retryCount++;
                    // Wait and retry - Supabase needs time to parse tokens
                    setTimeout(() => {
                        if (isMounted) checkSession();
                    }, 500);
                    return false;
                }

                if (isMounted) {
                    setIsValidSession(!!session);
                }
                return !!session;
            } catch (err) {
                console.error('Session check error:', err);
                if (isMounted) setIsValidSession(false);
                return false;
            }
        };

        // If URL has recovery tokens, assume valid initially while Supabase processes
        if (checkForRecoveryTokens()) {
            // Give Supabase a moment to parse tokens before checking session
            setTimeout(() => {
                if (isMounted) checkSession();
            }, 300);
        } else {
            checkSession();
        }

        // Listen for auth state changes (recovery link clicked)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && isMounted) {
                setIsValidSession(true);
            }
            // Also accept SIGNED_IN with a session during password recovery
            if (event === 'SIGNED_IN' && session && isMounted) {
                setIsValidSession(true);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La password deve essere almeno 6 caratteri');
            return;
        }

        if (password !== confirmPassword) {
            setError('Le password non corrispondono');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Errore nel reset della password');
        } finally {
            setLoading(false);
        }
    };

    if (isValidSession === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
                <div className="animate-pulse text-amber-400">Caricamento...</div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-stone-900/50 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Link non valido</h2>
                    <p className="text-stone-400 mb-6">
                        Il link di recupero password è scaduto o non valido.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
                    >
                        Torna al Login
                    </button>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-stone-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Password Aggiornata!</h2>
                    <p className="text-stone-400">
                        Verrai reindirizzato al login tra pochi secondi...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/50 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 max-w-md w-full"
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Logo size="lg" />
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">
                    Nuova Password
                </h1>
                <p className="text-stone-400 text-center mb-8">
                    Inserisci la tua nuova password
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">
                            NUOVA PASSWORD
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2">
                            CONFERMA PASSWORD
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                        ) : (
                            'Aggiorna Password'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-stone-400 hover:text-amber-400 transition-colors text-sm"
                    >
                        ← Torna al Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
