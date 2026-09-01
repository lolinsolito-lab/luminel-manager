import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Logo } from './Logo';
import { Mail, Lock, User, Instagram, MessageCircle, ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { resetPassword } from '../services/supabaseClient';

// --- CUSTOM INPUT WITH HOVER GLOW ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const AppInput = (props: InputProps) => {
  const { label, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full relative">
      {label && <label className='block mb-2 text-sm text-[var(--color-text-secondary)] font-medium'>{label}</label>}
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-[var(--color-text-secondary)]">
            {icon}
          </div>
        )}
        <input
          className={`peer relative z-10 border-2 border-[var(--color-border)] h-12 w-full rounded-md bg-[var(--color-surface)] px-4 ${icon ? 'pl-10' : ''} font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-[var(--color-bg)] placeholder:text-stone-500 text-[var(--color-text-primary)]`}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(80px circle at ${mousePosition.x}px 0px, var(--color-border) 0%, transparent 100%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(80px circle at ${mousePosition.x}px 2px, var(--color-border) 0%, transparent 100%)`,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

// --- MAIN LOGIN PAGE ---
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

  // Hover Effect State for left container
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Background Image Slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const bgImages = [
    '/assets/images/anyma_ai_entity.jpg',
    'https://images.pexels.com/photos/19153152/pexels-photo-19153152.jpeg',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

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
        await resetPassword(email);
        setSuccessMsg('Se l\'email esiste, riceverai istruzioni per il reset a breve.');
      } catch (err: any) {
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
        await register(name, email, password);
        setSuccessMsg('Registrazione completata! Controlla la tua email per verificare l\'account.');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Errore durante l\'autenticazione';
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

  // Social Links per supporto
  const socialIcons = [
    {
      icon: <Instagram className="w-5 h-5" />,
      href: 'https://instagram.com',
      bg: 'bg-[var(--color-bg)]',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      href: `https://wa.me/${APP_CONFIG.whatsappNumber}`,
      bg: 'bg-[var(--color-bg)]',
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] flex items-center justify-center p-4 overflow-hidden">
      <div className='w-full max-w-5xl flex justify-between h-[650px] bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-muted-surface)] overflow-hidden relative'>
        
        {/* LEFT SECTION - FORM */}
        <div
          className='w-full lg:w-1/2 px-6 sm:px-12 flex flex-col justify-center h-full relative overflow-hidden bg-stone-900/50'
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
            
          {/* Radial Hover Blur */}
          <div
            className={`absolute pointer-events-none w-[600px] h-[600px] bg-gradient-to-r from-[var(--color-border)]/20 via-[var(--color-text-primary)]/20 to-[var(--color-border)]/10 rounded-full blur-3xl transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />

          <div className="relative z-10 w-full max-w-sm mx-auto">
            {/* Torna alla Home / Logo */}
            <div className="mb-6 flex flex-col lg:items-start items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Torna al sito
              </Link>
              <Link to="/">
                <Logo variant="light" />
              </Link>
            </div>

            <form className='grid gap-6' onSubmit={handleSubmit}>
              <div className='text-center lg:text-left'>
                <h1 className='text-3xl font-extrabold text-[var(--color-heading)] mb-2'>
                  {viewState === 'register' && `Unisciti all'Élite`}
                  {viewState === 'login' && 'Accesso Riservato'}
                  {viewState === 'forgot-password' && 'Recupero Credenziali'}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                  {viewState === 'register' && 'Crea il tuo impero digitale.'}
                  {viewState === 'login' && 'Il tuo ecosistema gestionale ti aspetta.'}
                  {viewState === 'forgot-password' && 'Riprendi il controllo del tuo ecosistema.'}
                </p>
                
                {/* Support Icons al posto del login social */}
                {viewState !== 'forgot-password' && (
                  <>
                    <p className='text-xs text-[var(--color-text-secondary)] mb-4 mt-4'>Supporto tecnico</p>
                    <div className="flex justify-center lg:justify-start gap-4 mb-4">
                      {socialIcons.map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-[var(--color-bg-2)] rounded-full flex justify-center items-center relative z-[1] border-2 border-[var(--color-border)] overflow-hidden group hover:scale-105 transition-transform"
                        >
                          <div
                            className={`absolute inset-0 w-full h-full ${social.bg} scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100`}
                          />
                          <span className="text-[var(--color-border)] transition-all duration-500 ease-in-out z-[2] group-hover:text-white">
                            {social.icon}
                          </span>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Form Fields */}
              <div className='grid gap-4 items-center'>
                {viewState === 'register' && (
                  <AppInput 
                    placeholder="Nome Completo" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    icon={<User className="w-4 h-4" />} 
                  />
                )}
                
                <AppInput 
                  placeholder="Email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  icon={<Mail className="w-4 h-4" />} 
                />
                
                {viewState !== 'forgot-password' && (
                  <AppInput 
                    placeholder="Password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    icon={<Lock className="w-4 h-4" />} 
                  />
                )}
              </div>

              {/* Messages */}
              {error && <p className="text-red-400 text-sm font-medium text-center bg-red-900/20 p-2 rounded-lg border border-red-500/20">{error}</p>}
              {successMsg && <p className="text-green-400 text-sm font-medium text-center bg-green-900/20 p-2 rounded-lg border border-green-500/20">{successMsg}</p>}

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <div className='flex justify-between items-center px-1'>
                  {viewState === 'login' ? (
                    <button type="button" onClick={() => setViewState('forgot-password')} className='font-light text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors'>
                      Password dimenticata?
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button 
                    type="submit"
                    className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-[var(--color-border)]/20 cursor-pointer"
                  >
                    <span className="z-10">
                      {viewState === 'register' && 'Crea Account'}
                      {viewState === 'login' && 'Entra'}
                      {viewState === 'forgot-password' && 'Invia Link'}
                    </span>
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                      <div className="relative h-full w-8 bg-white/10" />
                    </div>
                  </button>
                </div>
                
                {/* Switch View State */}
                <div className="text-center mt-2">
                  {viewState === 'login' && (
                    <button type="button" onClick={() => { setViewState('register'); setError(''); }} className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                      Non hai un account? <span className="underline underline-offset-4">Registrati</span>
                    </button>
                  )}
                  {viewState === 'register' && (
                    <button type="button" onClick={() => { setViewState('login'); setError(''); }} className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                      Hai già un account? <span className="underline underline-offset-4">Accedi</span>
                    </button>
                  )}
                  {viewState === 'forgot-password' && (
                    <button type="button" onClick={() => { setViewState('login'); setError(''); setSuccessMsg(''); }} className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center gap-1 mx-auto">
                      <ArrowLeft className="w-4 h-4" /> Torna al Login
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION - IMAGE (Only visible on large screens) */}
        <div className='hidden lg:block w-1/2 right h-full overflow-hidden relative border-l border-[var(--color-muted-surface)]'>
          <div className="absolute inset-0 bg-stone-900/10 z-10 transition-colors duration-1000"></div>
          
          {bgImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt="Luminel Manager Ambient"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
