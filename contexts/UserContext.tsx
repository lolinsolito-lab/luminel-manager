import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  website?: string;
  avatar: string;
  // Business / Billing Details
  companyName?: string;
  companyAddress?: string;
  vatId?: string;
  // Subscription
  subscriptionTier?: string;
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
  updateProfile: (data: Partial<UserProfile>) => void;
  refreshBusinessSettings: () => Promise<void>;
}

const defaultUser: UserProfile = {
  name: APP_CONFIG.defaultAdmin.name,
  role: APP_CONFIG.defaultAdmin.role,
  email: APP_CONFIG.defaultAdmin.email,
  phone: '',
  website: '',
  avatar: APP_CONFIG.defaultAdmin.avatar,
  companyName: 'Nome Azienda / Studio',
  companyAddress: 'Via Esempio 123, Milano',
  vatId: '',
  subscriptionTier: 'trial'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessSettings, setBusinessSettings] = useState({ name: 'Luminel Elite', logoUrl: '' });

  const isSupabaseMode = isSupabaseConfigured();

  // Load Business Settings (Logo/Name)
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

  // ==============================================
  // Initialize Auth State
  // ==============================================
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseMode) {
        // SUPABASE MODE: Check for existing session
        try {
          const currentSession = await getSession();
          if (currentSession) {
            setSession(currentSession);
            setSupabaseUser(currentSession.user);
            setIsAuthenticated(true);

            // Load user profile from metadata or defaults
            const metadata = currentSession.user.user_metadata;
            setUser({
              ...defaultUser,
              id: currentSession.user.id,
              name: metadata?.full_name || currentSession.user.email?.split('@')[0] || 'User',
              email: currentSession.user.email || '',
              avatar: metadata?.avatar_url || `https://ui-avatars.com/api/?name=${metadata?.full_name || 'U'}&background=ce9341&color=fff`
            });

            // Also load business settings
            refreshBusinessSettings();
          }
        } catch (error) {
          console.error('Error loading session:', error);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('[Auth] State changed:', event);
            setSession(newSession);
            setSupabaseUser(newSession?.user || null);
            setIsAuthenticated(!!newSession);

            if (newSession?.user) {
              const metadata = newSession.user.user_metadata;
              setUser({
                ...defaultUser,
                id: newSession.user.id,
                name: metadata?.full_name || newSession.user.email?.split('@')[0] || 'User',
                email: newSession.user.email || '',
                avatar: metadata?.avatar_url || `https://ui-avatars.com/api/?name=${metadata?.full_name || 'U'}&background=ce9341&color=fff`
              });

              // Refresh business settings on login/state change
              refreshBusinessSettings();
            } else {
              setUser(defaultUser);
            }
          }
        );

        setIsLoading(false);
        return () => subscription.unsubscribe();

      } else {
        // OFFLINE MODE: Use localStorage (for development/demo)
        console.warn('⚠️ Running in offline mode. Configure Supabase for cloud features.');

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

  // ==============================================
  // Login
  // ==============================================
  const login = async (email: string, password: string): Promise<void> => {
    if (isSupabaseMode) {
      // SUPABASE MODE
      const { session: newSession, user: authUser } = await signIn(email, password);

      if (newSession && authUser) {
        setSession(newSession);
        setSupabaseUser(authUser);
        setIsAuthenticated(true);

        const metadata = authUser.user_metadata;
        setUser({
          ...defaultUser,
          id: authUser.id,
          name: metadata?.full_name || email.split('@')[0],
          email: email,
          avatar: metadata?.avatar_url || `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=ce9341&color=fff`
        });
      }
    } else {
      // OFFLINE MODE (for development)
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

  // ==============================================
  // Register
  // ==============================================
  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (isSupabaseMode) {
      // SUPABASE MODE
      const { user: authUser } = await signUp(email, password, { full_name: name });

      if (authUser) {
        // User may need to verify email before fully logged in
        console.log('[Auth] Registration successful. Check email for verification.');
      }
    } else {
      // OFFLINE MODE
      const newUser = {
        ...defaultUser,
        name: name,
        email: email,
        companyName: name + " Consulting",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ce9341&color=fff`
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('lumina_auth', 'true');
      localStorage.setItem('lumina_user', JSON.stringify(newUser));
    }
  };

  // ==============================================
  // Logout
  // ==============================================
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
  // Update Profile
  // ==============================================
  const updateProfile = (data: Partial<UserProfile>) => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('lumina_user', JSON.stringify(updatedUser));

    // TODO: Sync to Supabase users table if in cloud mode
  };

  // ==============================================
  // Loading State
  // ==============================================
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