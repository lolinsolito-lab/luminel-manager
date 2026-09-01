import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { APP_CONFIG } from '../config';
import { supabase, isSupabaseConfigured, signIn, signUp, signOut, getSession } from '../services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

// ==============================================
// LUMINA EMPIRE - User Context with Supabase Auth
// ==============================================

interface UserProfile {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar: string;
  // FIX (28 ago 2026): companyName/companyAddress/vatId/website RIMOSSI da qui.
  // Non venivano mai salvati (vedi TODO che c'era prima), e duplicavano campi
  // che vivono già, funzionanti e verificati, in user_settings (pagina
  // Impostazioni). Il profilo personale ora contiene solo identità individuale,
  // non dati aziendali/fatturazione — quelli restano SOLO in Impostazioni.
  subscriptionTier?: string;
  isAdmin?: boolean;
}

interface UserContextType {
  user: UserProfile;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseMode: boolean;
  businessSettings: {
    name: string;
    logoUrl: string;
  };
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshBusinessSettings: () => Promise<void>;
}

const defaultUser: UserProfile = {
  name: APP_CONFIG.defaultAdmin.name,
  role: APP_CONFIG.defaultAdmin.role,
  email: APP_CONFIG.defaultAdmin.email,
  phone: '',
  avatar: APP_CONFIG.defaultAdmin.avatar,
  subscriptionTier: 'free',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessSettings, setBusinessSettings] = useState({ name: 'Luminel Elite', logoUrl: '' });
  const currentUserIdRef = useRef(null);

  const isSupabaseMode = isSupabaseConfigured();

  const refreshBusinessSettings = async () => {
    try {
      const { getSettings } = await import('../services/settingsService');
      const settings = await getSettings();
      setBusinessSettings({
        name: settings.businessName || 'Luminel Elite',
        logoUrl: settings.logoUrl || ''
      });
    } catch (error) {
      console.error('[UserContext] ❌ Error refreshing business settings:', error);
    }
  };

  const fetchIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('[UserContext] Errore lettura is_admin:', error);
        return false;
      }
      return Boolean(data?.is_admin);
    } catch (error) {
      console.error('[UserContext] Errore imprevisto lettura is_admin:', error);
      return false;
    }
  };

  // FIX (28 ago 2026): carica anche full_name, phone, avatar_url REALI dalla
  // tabella users (non solo dai metadata di Auth) — così se updateProfile ha
  // salvato qualcosa in precedenza, lo si rivede davvero al prossimo login,
  // invece di ripartire sempre da defaultUser + metadata.
  const fetchUserProfile = async (userId: string): Promise<Partial<UserProfile>> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, phone, avatar_url')
        .eq('id', userId)
        .single();
      if (error || !data) return {};
      return {
        name: data.full_name || undefined,
        phone: data.phone || undefined,
        avatar: data.avatar_url || undefined,
      };
    } catch (error) {
      console.error('[UserContext] Errore lettura profilo utente:', error);
      return {};
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseMode) {
        try {
          const currentSession = await getSession();
          if (currentSession) {
            setSession(currentSession);
            setSupabaseUser(currentSession.user);
            currentUserIdRef.current = currentSession.user.id;
            setIsAuthenticated(true);

            const metadata = currentSession.user.user_metadata;
            const isAdmin = await fetchIsAdmin(currentSession.user.id);
            const dbProfile = await fetchUserProfile(currentSession.user.id);
            setUser({
              ...defaultUser,
              id: currentSession.user.id,
              name: dbProfile.name || metadata?.full_name || currentSession.user.email?.split('@')[0] || 'User',
              email: currentSession.user.email || '',
              phone: dbProfile.phone || '',
              avatar: dbProfile.avatar || metadata?.avatar_url || `https://ui-avatars.com/api/?name=${metadata?.full_name || 'U'}&background=ce9341&color=fff`,
              isAdmin
            });

            refreshBusinessSettings();
          }
        } catch (error) {
          console.error('Error loading session:', error);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('[Auth] State changed:', event);

            const isSameUserAlreadyLoaded =
              newSession?.user?.id && newSession.user.id === currentUserIdRef.current;

            setSession(newSession);
            setSupabaseUser(newSession?.user || null);
            setIsAuthenticated(!!newSession);

            if (isSameUserAlreadyLoaded) {
              console.log('[Auth] Stesso utente gia caricato - salto il refresh completo del profilo');
              return;
            }

            currentUserIdRef.current = newSession?.user?.id || null;

            if (newSession?.user) {
              const metadata = newSession.user.user_metadata;
              const isAdmin = await fetchIsAdmin(newSession.user.id);
              const dbProfile = await fetchUserProfile(newSession.user.id);
              setUser({
                ...defaultUser,
                id: newSession.user.id,
                name: dbProfile.name || metadata?.full_name || newSession.user.email?.split('@')[0] || 'User',
                email: newSession.user.email || '',
                phone: dbProfile.phone || '',
                avatar: dbProfile.avatar || metadata?.avatar_url || `https://ui-avatars.com/api/?name=${metadata?.full_name || 'U'}&background=ce9341&color=fff`,
                isAdmin
              });

              refreshBusinessSettings();
            } else {
              setUser(defaultUser);
            }
          }
        );

        setIsLoading(false);
        return () => subscription.unsubscribe();

      } else {
        // FIX (28 ago 2026): la modalità offline/localStorage resta SOLO come
        // fallback di sviluppo quando Supabase non è configurato affatto —
        // non è più usata come persistenza reale quando sei online.
        console.warn('⚠️ Supabase non configurato — modalità sviluppo locale, nessun dato persistente reale.');

        const storedAuth = localStorage.getItem('lumina_auth');
        const storedUser = localStorage.getItem('lumina_user');

        if (storedAuth === 'true' && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isSupabaseMode]);

  const login = async (email: string, password: string): Promise<void> => {
    if (isSupabaseMode) {
      const { session: newSession, user: authUser } = await signIn(email, password);

      if (newSession && authUser) {
        setSession(newSession);
        setSupabaseUser(authUser);
        setIsAuthenticated(true);

        const metadata = authUser.user_metadata;
        const dbProfile = await fetchUserProfile(authUser.id);
        setUser({
          ...defaultUser,
          id: authUser.id,
          name: dbProfile.name || metadata?.full_name || email.split('@')[0],
          email: email,
          phone: dbProfile.phone || '',
          avatar: dbProfile.avatar || metadata?.avatar_url || `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=ce9341&color=fff`
        });
      }
    } else {
      const DEFAULT_PASSWORD = 'lumina2025';
      if (password !== DEFAULT_PASSWORD) {
        throw new Error('Password non corretta. (Modalità offline: usa "lumina2025")');
      }

      setIsAuthenticated(true);
      localStorage.setItem('lumina_auth', 'true');

      const savedUser = localStorage.getItem('lumina_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const newUser = { ...defaultUser, email };
        setUser(newUser);
        localStorage.setItem('lumina_user', JSON.stringify(newUser));
      }
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (isSupabaseMode) {
      const { user: authUser } = await signUp(email, password, { full_name: name });

      if (authUser) {
        console.log('[Auth] Registration successful. Check email for verification.');
      }
    } else {
      const newUser = {
        ...defaultUser,
        name: name,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ce9341&color=fff`
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('lumina_auth', 'true');
      localStorage.setItem('lumina_user', JSON.stringify(newUser));
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseMode) {
      await signOut();
    }

    setIsAuthenticated(false);
    setSession(null);
    setSupabaseUser(null);
    setUser(defaultUser);
    localStorage.removeItem('lumina_auth');
  };

  // ==============================================
  // FIX (28 ago 2026): ora scrive davvero su Supabase (tabella users) invece
  // di fermarsi al solo stato locale + localStorage. Solo i campi che vivono
  // davvero su `users` (full_name, phone, avatar_url) — non companyName/
  // companyAddress/vatId, che non esistono più qui (vivono in Impostazioni).
  // ==============================================
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser); // aggiornamento ottimistico della UI

    if (isSupabaseMode && user.id) {
      try {
        const { error } = await supabase
          .from('users')
          .update({
            full_name: updatedUser.name,
            phone: updatedUser.phone,
            avatar_url: updatedUser.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error('[UserContext] ❌ Errore salvataggio profilo su Supabase:', error);
          throw error;
        }
        console.log('[UserContext] ✅ Profilo salvato su Supabase');
      } catch (error) {
        // Rollback ottimistico se il salvataggio fallisce davvero
        setUser(user);
        throw error;
      }
    } else {
      // Solo se Supabase non è configurato affatto (sviluppo locale)
      localStorage.setItem('lumina_user', JSON.stringify(updatedUser));
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gold-600 font-serif text-lg">Loading {APP_CONFIG.appName}...</p>
          {!isSupabaseMode && (
            <p className="text-stone-400 text-xs mt-2">Running in offline mode</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{
      user,
      supabaseUser,
      session,
      isAuthenticated,
      isLoading,
      isSupabaseMode,
      businessSettings,
      login,
      register,
      logout,
      updateProfile,
      refreshBusinessSettings
    }}
    >  {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};