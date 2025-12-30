import { createClient } from '@supabase/supabase-js';

// ==============================================
// LUMINA EMPIRE - Supabase Client Configuration
// ==============================================

// Environment variables (set in .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ==============================================
// Helper: Check if Supabase is properly configured
// ==============================================
const SUPABASE_PROJECT_ID = 'xrdvmujlqibsucmkluru';
export const isSupabaseConfigured = (): boolean => {
    // Check if we're using a real Supabase URL (not placeholder)
    const url = supabaseUrl || 'https://xrdvmujlqibsucmkluru.supabase.co';
    return url.includes(SUPABASE_PROJECT_ID);
};

// Validate configuration
const isConfigured = !!(supabaseUrl && supabaseAnonKey);
const hasHardcodedFallback = isSupabaseConfigured();

if (!isConfigured && !hasHardcodedFallback) {
    console.warn(
        '⚠️ Supabase not configured. Running in offline mode.\n' +
        'To enable cloud features:\n' +
        '1. Create a project at https://supabase.com\n' +
        '2. Copy .env.example to .env.local\n' +
        '3. Add your Supabase URL and Anon Key'
    );
}

// Create Supabase client with configuration
export const supabase = createClient(
    supabaseUrl || 'https://xrdvmujlqibsucmkluru.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHZtdWpscWlic3VjbWtsdXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTMyMDEsImV4cCI6MjA4MjMyOTIwMX0.KsDQ-jtq_ZoxwvprcgjOytk0G5PolF2G1RaCMaoFLDo',
    {
        auth: {
            // Persist session in localStorage
            persistSession: true,
            // Auto refresh token before expiry
            autoRefreshToken: true,
            // Detect session from URL (for OAuth callbacks)
            detectSessionInUrl: true
        },
        realtime: {
            // Enable realtime subscriptions
            params: {
                eventsPerSecond: 10
            }
        }
    }
);

// Auth Helpers
// ==============================================

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    });

    if (error) throw error;
    return data;
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
};

/**
 * Sign in with Google OAuth
 */
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

/**
 * Sign out current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Get current session
 */
export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

/**
 * Reset password (send email)
 * With BrowserRouter, we can use clean URLs directly.
 * Supabase will append auth tokens to this URL and redirect the user.
 */
export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
};

/**
 * Update password
 */
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
