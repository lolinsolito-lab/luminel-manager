import { createClient } from '@supabase/supabase-js';

// ==============================================
// LUMINA EMPIRE - Supabase Client Configuration
// ==============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ==============================================
// FIX SICUREZZA (29 ago 2026): rimosso ogni riferimento al progetto Supabase
// vecchio ('xrdvmujlqibsucmkluru'). Il check ora è generico — funziona con
// QUALSIASI progetto Supabase configurato in VITE_SUPABASE_URL, non solo
// quello specifico su cui è stato scritto originariamente il codice.
// ==============================================
export const isSupabaseConfigured = (): boolean => {
    if (!supabaseUrl || !supabaseAnonKey) return false;
    // Verifica solo che sia un URL Supabase con forma valida, non un progetto specifico
    return supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
};

if (!isSupabaseConfigured()) {
    console.warn(
        '⚠️ Supabase non configurato — modalità sviluppo locale, nessun dato persistente reale.\n' +
        'Per abilitare le funzionalità cloud:\n' +
        '1. Verifica che .env.local esista nella root del progetto\n' +
        '2. Controlla che contenga VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY con valori reali\n' +
        '3. Riavvia il server (Ctrl+C, poi npm run dev) — Vite non ricarica le env a caldo'
    );
}

// ==============================================
// FIX SICUREZZA (29 ago 2026): NESSUN fallback hardcoded qui. Se le variabili
// mancano, il client Supabase viene creato con stringhe vuote — fallirà in
// modo chiaro e visibile alla prima chiamata, invece di connettersi
// silenziosamente a un progetto vecchio con una chiave incorporata nel codice.
// Meglio un errore evidente che una connessione sbagliata invisibile.
// ==============================================
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
);

// Auth Helpers
// ==============================================

export const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
            emailRedirectTo: `${window.location.origin}/dashboard`
        }
    });

    if (error) throw error;
    return data;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
};

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });
    if (error) throw error;
};

// ==============================================
// Database Types (for TypeScript)
// ==============================================

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    business_name: string | null;
                    avatar_url: string | null;
                    subscription_tier: string;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['users']['Insert']>;
            };
            clients: {
                Row: {
                    id: string;
                    coach_id: string;
                    full_name: string;
                    email: string | null;
                    phone: string | null;
                    status: string;
                    last_session_date: string | null;
                    total_sessions: number;
                    total_revenue: number;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['clients']['Insert']>;
            };
            sessions: {
                Row: {
                    id: string;
                    coach_id: string;
                    client_id: string;
                    service_id: string | null;
                    session_type: string | null;
                    title: string;
                    date: string;
                    duration_minutes: number | null;
                    status: string;
                    price: number | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
            };
            services: {
                Row: {
                    id: string;
                    coach_id: string;
                    name: string;
                    description: string | null;
                    type: string | null;
                    price: number | null;
                    duration_minutes: number | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['services']['Insert']>;
            };
            transactions: {
                Row: {
                    id: string;
                    coach_id: string;
                    client_id: string | null;
                    session_id: string | null;
                    type: string;
                    amount: number;
                    category: string | null;
                    description: string | null;
                    date: string;
                    status: string;
                };
                Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
            };
        };
    };
};

export default supabase;