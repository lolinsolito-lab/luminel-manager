import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Resource } from '../types';

// ==============================================
// LUMINA EMPIRE - Resource Service
// Handles all digital asset CRUD operations with Supabase
// Database table: 'resources'
// ==============================================

interface SupabaseResourceRow {
    id: string;
    coach_id: string;
    title: string;
    type: string | null;
    description: string | null;
    url: string | null;
    file_path: string | null;
    tags: string[] | null;
    sent_count: number;
    is_free_sample: boolean;
    created_at: string;
}

// ==============================================
// Helper: Convert Frontend Resource to DB format
// FIX (28 ago 2026): aggiunto is_free_sample — mancava completamente,
// quindi anche impostandolo a mano nel DB l'app non lo leggeva né scriveva.
// ==============================================
const resourceToRow = (resource: Partial<Resource>, coachId: string): Partial<SupabaseResourceRow> => {
    const row: Partial<SupabaseResourceRow> = {
        coach_id: coachId
    };

    if (resource.title !== undefined) row.title = resource.title;
    if (resource.type !== undefined) row.type = resource.type;
    if (resource.url !== undefined) row.url = resource.url;
    if (resource.tags !== undefined) row.tags = resource.tags;
    if ((resource as any).isFreeSample !== undefined) row.is_free_sample = (resource as any).isFreeSample;

    return row;
};

// ==============================================
// Helper: Convert DB row to Frontend Resource
// ==============================================
const rowToResource = (row: SupabaseResourceRow): Resource => {
    return {
        id: row.id,
        title: row.title,
        type: row.type as any || 'Link',
        url: row.url || '#',
        tags: row.tags || [],
        // FIX: campo nuovo — se il tipo Resource in types.ts non lo ha ancora,
        // aggiungilo lì come `isFreeSample?: boolean` per avere i tipi corretti
        isFreeSample: row.is_free_sample || false,
    } as Resource;
};

// ==============================================
// GET: Fetch all resources for current coach
// ==============================================
export const getResources = async (): Promise<Resource[]> => {
    if (!isSupabaseConfigured()) {
        console.warn('📴 Supabase not configured - returning empty array');
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching resources:', error);
        throw error;
    }

    return (data || []).map(rowToResource);
};

// ==============================================
// NUOVA: Fetch risorse pubbliche (assaggi gratuiti) — per landing page o
// sezioni marketing, non richiede autenticazione grazie alla RLS aggiornata
// ==============================================
export const getPublicFreeSamples = async (): Promise<Resource[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_free_sample', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching free samples:', error);
        return [];
    }

    return (data || []).map(rowToResource);
};

// ==============================================
// CREATE: Add new resource
// ==============================================
export const createResource = async (resource: Omit<Resource, 'id'>): Promise<Resource> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = resourceToRow(resource, user.id);

    const { data, error } = await supabase
        .from('resources')
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error('❌ Error creating resource:', error);
        throw error;
    }

    return rowToResource(data);
};

// ==============================================
// UPDATE: Update existing resource
// ==============================================
export const updateResource = async (resourceId: string, updates: Partial<Resource>): Promise<Resource> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = resourceToRow(updates, user.id);
    delete row.coach_id;

    const { data, error } = await supabase
        .from('resources')
        .update(row)
        .eq('id', resourceId)
        .eq('coach_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('❌ Error updating resource:', error);
        throw error;
    }

    return rowToResource(data);
};

// ==============================================
// DELETE: Remove resource
// ==============================================
export const deleteResource = async (resourceId: string): Promise<void> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('coach_id', user.id);

    if (error) {
        console.error('❌ Error deleting resource:', error);
        throw error;
    }
};

export default {
    getResources,
    getPublicFreeSamples,
    createResource,
    updateResource,
    deleteResource
};