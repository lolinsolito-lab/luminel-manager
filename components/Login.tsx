
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Logo } from './Logo';
import { ArrowRight, Mail, Lock, User, Sparkles, ArrowLeft, Send } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { registerAdmin } from '../services/integrationService';
import { resetPassword } from '../services/supabaseClient';

type ViewState = 'login' | 'register' | 'forgot-password';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useUser();
  const [viewState, setViewState] = useState<ViewState>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (viewState === 'forgot-password') {
      if (!email) {
        setError('Inserisci la tua email.');
        return;
      }
      try {
        // Use Supabase to send password reset email via configured SMTP (Resend)
        await resetPassword(email);
        setSuccessMsg('Se l\'email esiste, riceverai istruzioni per il reset a breve.');
      } catch (err: any) {
        console.error('Password reset error:', err);
        setSuccessMsg('Se l\'email esiste, riceverai istruzioni per il reset a breve.');
      }
      return;
    }

    if (!email || !password) {
      setError('Compila tutti i campi.');
      return;
    }

    try {
      if (viewState === 'register') {
        if (!name) {
          setError('Inserisci il tuo nome completo.');
          return;
        }
        // Register with Supabase or offline mode
        await register(name, email, password);

        // Sync to Make.com (New Admin Event)
        await registerAdmin({ name, email });

        setSuccessMsg('Registrazione completata! Controlla la tua email per verificare l\'account.');
        // In Supabase mode, user needs to verify email first
        // navigate('/');
      } else {
        // Login
        await login(email, password);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error?.message || 'Errore durante l\'autenticazione';

      // User-friendly error messages
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Email o password non corretti.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Email non verificata. Controlla la tua casella di posta.');
      } else if (errorMessage.includes('User already registered')) {
        setError('Email già registrata. Prova ad accedere.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const bgImage = "https://images.pexels.com/photos/19153152/pexels-photo-19153152.jpeg";

  return (
    <div className="min-h-screen w-full flex relative bg-stone-900">

      {/* MOBILE BACKGROUND (Visible only on small screens) */}
      <div className="absolute inset-0 lg:hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></div>
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]"></div>
      </div>

      {/* LEFT SIDE - DESKTOP (Image Panel) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-900 z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between p-fib-55 h-full text-white">
          <Logo variant="light" />

          <div className="space-y-fib-21">
            <div className="w-16 h-1 bg-gold-500 rounded-full"></div>
            <h2 className="text-5xl text-display leading-tight">
              Il tuo business, <br />
              <span className="text-gold-400 italic">Elevato.</span> <br />
            </h2>
            <p className="text-stone-300 text-lg max-w-md leading-relaxed">
              Benvenuto nel tuo gestionale professionale. Organizza appuntamenti, monitora la crescita e gestisci i clienti in un unico spazio esclusivo.
            </p>
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4 text-gold-500" />
            {APP_CONFIG.appName} OS v1.0
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM CONTAINER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 z-10 lg:bg-stone-50">
        {/* Card Wrapper */}
        <div className="w-full max-w-md bg-white/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-8 rounded-3xl shadow-2xl lg:shadow-none animate-in slide-in-from-bottom-8 duration-500">

          {/* Mobile Logo - Vertical Layout */}
          <div className="lg:hidden text-center flex flex-col items-center mb-8">
            <Logo layout="vertical" className="mb-2" />
          </div>

          <div className="text-center lg:text-left mb-fib-34">
            <h2 className="text-3xl text-display text-stone-900">
              {viewState === 'register' && `Unisciti a ${APP_CONFIG.appName}`}
              {viewState === 'login' && 'Bentornato'}
              {viewState === 'forgot-password' && 'Recupero Password'}
            </h2>
            <p className="text-stone-500 mt-2">
              {viewState === 'register' && 'Crea il tuo account manageriale.'}
              {viewState === 'login' && 'Inserisci le credenziali per accedere.'}
              {viewState === 'forgot-password' && 'Ti invieremo un link per resettare.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-fib-13">

            {viewState === 'register' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold uppercase text-stone-500 tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-gold-400 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all text-stone-900 placeholder-stone-400"
                    placeholder="Nome Cognome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-500 tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-gold-400 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all text-stone-900 placeholder-stone-400"
                  placeholder="manager@business.com"
                />
              </div>
            </div>

            {viewState !== 'forgot-password' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-stone-500 tracking-wider">Password</label>
                  {viewState === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setViewState('forgot-password'); setError(''); setSuccessMsg(''); }}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700"
                    >
                      Password dimenticata?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-gold-400 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all text-stone-900 placeholder-stone-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}
            {successMsg && <p className="text-green-600 text-sm font-medium text-center bg-green-50 p-2 rounded-lg border border-green-100">{successMsg}</p>}

            <button
              type="submit"
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-xl shadow-stone-200 lg:shadow-none"
            >
              {viewState === 'register' && <>Crea Account <ArrowRight className="w-5 h-5" /></>}
              {viewState === 'login' && <>Accedi <ArrowRight className="w-5 h-5" /></>}
              {viewState === 'forgot-password' && <>Invia Link di Recupero <Send className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            {viewState === 'login' && (
              <button
                onClick={() => { setViewState('register'); setError(''); }}
                className="text-sm font-medium text-stone-500 hover:text-gold-600 transition-colors"
              >
                Nuovo utente? Crea Account
              </button>
            )}

            {viewState === 'register' && (
              <button
                onClick={() => { setViewState('login'); setError(''); }}
                className="text-sm font-medium text-stone-500 hover:text-gold-600 transition-colors"
              >
                Hai già un account? Accedi
              </button>
            )}

            {viewState === 'forgot-password' && (
              <button
                onClick={() => { setViewState('login'); setError(''); setSuccessMsg(''); }}
                className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Torna al Login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
