import { supabase, isSupabaseConfigured } from './supabaseClient';
import { isLimitReached, SubscriptionTier } from './tierLimits';
import type { Client, ClientGoal, ClientTask, ClientDocument } from '../types';

// ==============================================
// LUMINA EMPIRE - Client Service
// Handles all client CRUD operations with Supabase
// ==============================================

// Type for Supabase client row (database schema)
interface SupabaseClientRow {
    id: string;
    coach_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    profession: string | null;
    instagram: string | null;
    address: string | null;
    birthday: string | null;
    source: string | null;
    status: 'active' | 'vip' | 'at_risk' | 'new';
    last_session_date: string | null;
    total_sessions: number;
    total_revenue: number;
    loyalty_points: number;
    notes: string | null;
    session_notes: { date: string; text: string }[] | null;
    goals: ClientGoal[] | null;
    tasks: ClientTask[] | null;
    documents: ClientDocument[] | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

// ==============================================
// Helper: Convert Frontend Client to DB format
// ==============================================
const clientToRow = (client: Partial<Client>, coachId: string): Partial<SupabaseClientRow> => {
    const row: Partial<SupabaseClientRow> = {
        coach_id: coachId
    };

    if (client.firstName || client.lastName) {
        row.full_name = `${client.firstName || ''} ${client.lastName || ''}`.trim();
    }
    if (client.email !== undefined) row.email = client.email || null;
    if (client.phone !== undefined) row.phone = client.phone || null;
    if (client.profession !== undefined) row.profession = client.profession || null;
    if (client.instagram !== undefined) row.instagram = client.instagram || null;
    if (client.address !== undefined) row.address = client.address || null;
    if (client.birthday !== undefined) row.birthday = client.birthday || null;
    if (client.source !== undefined) row.source = client.source || null;
    if (client.isVIP !== undefined) row.status = client.isVIP ? 'vip' : 'active';
    if (client.lastSession !== undefined) row.last_session_date = client.lastSession || null;
    if (client.totalSessions !== undefined) row.total_sessions = client.totalSessions;
    if (client.totalSpend !== undefined) row.total_revenue = client.totalSpend;
    if (client.loyaltyPoints !== undefined) row.loyalty_points = client.loyaltyPoints;
    if (client.notes !== undefined) row.notes = client.notes || null;
    if (client.sessionNotes !== undefined) row.session_notes = client.sessionNotes;
    if (client.goals !== undefined) row.goals = client.goals;
    if (client.tasks !== undefined) row.tasks = client.tasks;
    if (client.documents !== undefined) row.documents = client.documents;
    if (client.avatar !== undefined) row.avatar_url = client.avatar || null;

    return row;
};

// ==============================================
// Helper: Convert DB row to Frontend Client
// ==============================================
const rowToClient = (row: SupabaseClientRow): Client => {
    const [firstName = '', lastName = ''] = (row.full_name || '').split(' ', 2);

    return {
        id: row.id,
        firstName,
        lastName: lastName || (row.full_name || '').split(' ').slice(1).join(' '),
        email: row.email || '',
        phone: row.phone || '',
        profession: row.profession || undefined,
        instagram: row.instagram || undefined,
        address: row.address || undefined,
        birthday: row.birthday || undefined,
        source: row.source || undefined,
        lastSession: row.last_session_date || '',
        loyaltyPoints: row.loyalty_points || 0,
        isVIP: row.status === 'vip',
        notes: row.notes || '',
        sessionNotes: row.session_notes || [],
        goals: row.goals || [],
        tasks: row.tasks || [],
        documents: row.documents || [],
        avatar: row.avatar_url || '',
        totalSpend: row.total_revenue || 0,
        totalSessions: row.total_sessions || 0
    };
};

// ==============================================
// GET: Fetch all clients for current coach
// ==============================================
export const getClients = async (): Promise<Client[]> => {
    if (!isSupabaseConfigured()) {
        console.warn('📴 Supabase not configured - returning empty array');
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)
        .order('full_name', { ascending: true });

    if (error) {
        console.error('❌ Error fetching clients:', error);
        throw error;
    }

    return (data || []).map(rowToClient);
};

// ==============================================
// GET: Fetch single client by ID
// ==============================================
export const getClientById = async (clientId: string): Promise<Client | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('❌ Error fetching client:', error);
        throw error;
    }

    return data ? rowToClient(data) : null;
};

// ==============================================
// CREATE: Add new client
// ==============================================
export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    // --- TIER LIMIT ENFORCEMENT (FORTRESS) ---
    const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

    const { count: currentClientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user.id);

    const tier = (userData?.subscription_tier || 'free') as SubscriptionTier;
    if (isLimitReached(tier, 'clients', currentClientCount || 0)) {
        throw new Error(`LIMIT_REACHED: Hai raggiunto il limite di ${currentClientCount} clienti per il piano ${tier.toUpperCase()}. Passa a un livello superiore per aggiungere altri contatti.`);
    }
    // ----------------------------------------

    const row = clientToRow(client, user.id);

    // Set defaults for new clients
    row.status = client.isVIP ? 'vip' : 'new';
    row.total_sessions = 0;
    row.total_revenue = 0;
    row.loyalty_points = 0;

    const { data, error } = await supabase
        .from('clients')
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error('❌ Error creating client:', error);
        throw error;
    }

    return rowToClient(data);
};

// ==============================================
// UPDATE: Update existing client
// ==============================================
export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<Client> => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const row = clientToRow(updates, user.id);
    delete row.coach_id; // Don't update coach_id

    const { data, error } = await supabase
        .from('clients')
        .update(row)
        .eq('id', clientId)
        .eq('coach_id', user.id) // Security: ensure ownership
        .select()
        .single();

    if (error) {
        console.error('❌ Error updating client:', error);
        throw error;
    }

    return rowToClient(data);
};

// ==============================================
// DELETE: Remove client
// ==============================================
export const deleteClient = async (clientId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('coach_id', user.id); // Security: ensure ownership

    if (error) {
        console.error('❌ Error deleting client:', error);
        throw error;
    }
};

// ==============================================
// SEARCH: Search clients by name or email
// ==============================================
export const searchClients = async (query: string): Promise<Client[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('full_name', { ascending: true })
        .limit(20);

    if (error) {
        console.error('❌ Error searching clients:', error);
        throw error;
    }

    return (data || []).map(rowToClient);
};

// ==============================================
// STATS: Update client statistics after session
// ==============================================
export const updateClientStats = async (
    clientId: string,
    sessionRevenue: number,
    pointsEarned: number = 100
): Promise<Client> => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    // First get current stats
    const { data: currentClient, error: fetchError } = await supabase
        .from('clients')
        .select('total_sessions, total_revenue, loyalty_points, status')
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .single();

    if (fetchError) {
        throw fetchError;
    }

    // Calculate new stats
    const newTotalSessions = (currentClient.total_sessions || 0) + 1;
    const newTotalRevenue = (currentClient.total_revenue || 0) + sessionRevenue;
    const newLoyaltyPoints = (currentClient.loyalty_points || 0) + pointsEarned;

    // Auto-upgrade to VIP if over €1000 LTV
    const newStatus = newTotalRevenue >= 1000 ? 'vip' : currentClient.status;

    const { data, error } = await supabase
        .from('clients')
        .update({
            total_sessions: newTotalSessions,
            total_revenue: newTotalRevenue,
            loyalty_points: newLoyaltyPoints,
            last_session_date: new Date().toISOString().split('T')[0],
            status: newStatus
        })
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('❌ Error updating client stats:', error);
        throw error;
    }

    return rowToClient(data);
};

// ==============================================
// VIP: Get all VIP clients
// ==============================================
export const getVIPClients = async (): Promise<Client[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)
        .eq('status', 'vip')
        .order('total_revenue', { ascending: false });

    if (error) {
        throw error;
    }

    return (data || []).map(rowToClient);
};

// ==============================================
// AT RISK: Get clients with no session in 30+ days
// ==============================================
export const getAtRiskClients = async (): Promise<Client[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)
        .or(`last_session_date.lt.${thirtyDaysAgo.toISOString()},last_session_date.is.null`)
        .order('last_session_date', { ascending: true });

    if (error) {
        throw error;
    }

    return (data || []).map(rowToClient);
};

export default {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    updateClientStats,
    getVIPClients,
    getAtRiskClients
};
