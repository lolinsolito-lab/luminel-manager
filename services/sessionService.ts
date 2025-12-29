import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SessionStatus } from '../types';
import type { Session } from '../types';

// ==============================================
// LUMINA EMPIRE - Session Service
// Handles all session/appointment CRUD with Supabase
// ==============================================

// Type for Supabase session row
interface SupabaseSessionRow {
    id: string;
    coach_id: string;
    client_id: string | null;
    service_id: string | null;
    title: string;
    session_type: string | null;
    date: string;
    duration_minutes: number | null;
    location_type: string | null;
    location_address: string | null;
    meeting_url: string | null;
    status: string;
    price: number | null;
    paid: boolean;
    notes: string | null;
    reminder_24h_sent: boolean;
    reminder_1h_sent: boolean;
    created_at: string;
    updated_at: string;
    // Joined data
    clients?: { full_name: string; email: string | null; phone: string | null };
    services?: { name: string };
}

// ==============================================
// Helper: Validate UUID format
// ==============================================
const isValidUUID = (str: string | undefined | null): boolean => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

// ==============================================
// Helper: Convert Frontend Session to DB format
// ==============================================
const sessionToRow = (session: Partial<Session>, coachId: string): Partial<SupabaseSessionRow> => {
    const row: Partial<SupabaseSessionRow> = {
        coach_id: coachId
    };

    // Only set client_id and service_id if they are valid UUIDs
    if (session.clientId !== undefined) {
        row.client_id = isValidUUID(session.clientId) ? session.clientId : null;
    }
    if (session.programId !== undefined) {
        row.service_id = isValidUUID(session.programId) ? session.programId : null;
    }
    // Title should be the service/program name, not client name
    if (session.programName !== undefined) row.title = session.programName;
    else if (session.clientName !== undefined) row.title = session.clientName; // Fallback
    if (session.type !== undefined) row.session_type = session.type;
    if (session.date !== undefined) row.date = session.date;
    if (session.status !== undefined) row.status = session.status.toLowerCase().replace(' ', '_');
    if (session.notes !== undefined) row.notes = session.notes || null;

    return row;
};

// ==============================================
// Helper: Convert DB row to Frontend Session
// ==============================================
const rowToSession = (row: SupabaseSessionRow): Session => {
    // Map DB status to SessionStatus enum
    const statusMap: Record<string, SessionStatus> = {
        'scheduled': SessionStatus.SCHEDULED,
        'confirmed': SessionStatus.SCHEDULED,
        'completed': SessionStatus.COMPLETED,
        'cancelled': SessionStatus.CANCELLED,
        'no_show': SessionStatus.NO_SHOW
    };

    return {
        id: row.id,
        clientId: row.client_id || '',
        clientName: row.clients?.full_name || row.title,
        clientEmail: row.clients?.email || undefined,
        clientPhone: row.clients?.phone || undefined,
        programId: row.service_id || '',
        programName: row.services?.name || '',
        date: row.date,
        status: statusMap[row.status] || SessionStatus.SCHEDULED,
        notes: row.notes || undefined,
        type: (row.session_type as '1:1' | 'Group' | 'Holistic') || '1:1'
    };
};

// ==============================================
// GET: Fetch all sessions for current coach
// ==============================================
export const getSessions = async (): Promise<Session[]> => {
    if (!isSupabaseConfigured()) {
        console.warn('📴 Supabase not configured');
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.warn('[Sessions] ⚠️ User not authenticated, cannot load sessions');
        return [];
    }

    console.log('[Sessions] 👤 Loading sessions for user:', user.id);

    const { data, error } = await supabase
        .from('sessions')
        .select(`
            *,
            clients(full_name, email, phone),
            services(name)
        `)
        .eq('coach_id', user.id)
        .order('date', { ascending: true });

    if (error) {
        console.error('❌ Error fetching sessions:', error);
        throw error;
    }

    console.log('[Sessions] 📦 Raw sessions from DB:', data);
    return (data || []).map(rowToSession);
};

// ==============================================
// GET: Fetch sessions for a date range
// ==============================================
export const getSessionsByDateRange = async (startDate: string, endDate: string): Promise<Session[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('sessions')
        .select(`
            *,
            clients(full_name, email, phone),
            services(name)
        `)
        .eq('coach_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) throw error;
    return (data || []).map(rowToSession);
};

// ==============================================
// GET: Fetch sessions for a specific client
// ==============================================
export const getSessionsByClient = async (clientId: string): Promise<Session[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // First try by client_id if it's a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);

    if (isUUID) {
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                *,
                clients(full_name, email, phone),
                services(name)
            `)
            .eq('coach_id', user.id)
            .eq('client_id', clientId)
            .order('date', { ascending: false });

        if (!error && data && data.length > 0) {
            return data.map(rowToSession);
        }
    }

    // If no results, return empty (sessions might have been created before client linking)
    return [];
};

// ==============================================
// GET: Fetch today's sessions
// ==============================================
export const getTodaySessions = async (): Promise<Session[]> => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return getSessionsByDateRange(today, tomorrow);
};

// ==============================================
// GET: Fetch upcoming sessions (next 7 days)
// ==============================================
export const getUpcomingSessions = async (): Promise<Session[]> => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    return getSessionsByDateRange(today, nextWeek);
};

// ==============================================
// CREATE: Book new session
// ==============================================
export const createSession = async (session: Omit<Session, 'id'>): Promise<Session> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = sessionToRow(session, user.id);
    row.status = 'scheduled';

    const { data, error } = await supabase
        .from('sessions')
        .insert(row)
        .select(`
            *,
            clients(full_name, email, phone),
            services(name)
        `)
        .single();

    if (error) {
        console.error('❌ Error creating session:', error);
        throw error;
    }

    return rowToSession(data);
};

// ==============================================
// UPDATE: Update existing session
// ==============================================
export const updateSession = async (sessionId: string, updates: Partial<Session>): Promise<Session> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = sessionToRow(updates, user.id);
    delete row.coach_id;

    const { data, error } = await supabase
        .from('sessions')
        .update(row)
        .eq('id', sessionId)
        .eq('coach_id', user.id)
        .select(`
            *,
            clients(full_name, email, phone),
            services(name)
        `)
        .single();

    if (error) {
        console.error('❌ Error updating session:', error);
        throw error;
    }

    return rowToSession(data);
};

// ==============================================
// UPDATE: Update session status
// ==============================================
export const updateSessionStatus = async (sessionId: string, status: SessionStatus): Promise<Session> => {
    const statusMap: Record<SessionStatus, string> = {
        [SessionStatus.SCHEDULED]: 'scheduled',
        [SessionStatus.COMPLETED]: 'completed',
        [SessionStatus.CANCELLED]: 'cancelled',
        [SessionStatus.NO_SHOW]: 'no_show'
    };

    return updateSession(sessionId, { status });
};

// ==============================================
// DELETE: Remove session
// ==============================================
export const deleteSession = async (sessionId: string): Promise<void> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('coach_id', user.id);

    if (error) {
        console.error('❌ Error deleting session:', error);
        throw error;
    }
};

// ==============================================
// STATS: Get session statistics
// ==============================================
export const getSessionStats = async (): Promise<{
    totalToday: number;
    totalWeek: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
}> => {
    if (!isSupabaseConfigured()) {
        return { totalToday: 0, totalWeek: 0, completedThisMonth: 0, cancelledThisMonth: 0 };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfWeek = new Date(Date.now() + 7 * 86400000).toISOString();

    // Get sessions for this month
    const { data, error } = await supabase
        .from('sessions')
        .select('date, status')
        .eq('coach_id', user.id)
        .gte('date', startOfMonth);

    if (error) throw error;

    const todayStr = today.toISOString().split('T')[0];
    const sessions = data || [];

    return {
        totalToday: sessions.filter(s => s.date.startsWith(todayStr)).length,
        totalWeek: sessions.filter(s => new Date(s.date) <= new Date(endOfWeek)).length,
        completedThisMonth: sessions.filter(s => s.status === 'completed').length,
        cancelledThisMonth: sessions.filter(s => s.status === 'cancelled' || s.status === 'no_show').length
    };
};

export default {
    getSessions,
    getSessionsByDateRange,
    getSessionsByClient,
    getTodaySessions,
    getUpcomingSessions,
    createSession,
    updateSession,
    updateSessionStatus,
    deleteSession,
    getSessionStats
};
