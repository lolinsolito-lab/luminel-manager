
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { VaultCategory } from '../types';

export interface SupabaseCategoryRow {
    id: string;
    coach_id: string;
    name: string;
    icon_name: string;
    sort_order: number;
    created_at: string;
}

const mapRowToCategory = (row: SupabaseCategoryRow): VaultCategory => ({
    id: row.id,
    name: row.name,
    iconName: row.icon_name,
    sortOrder: row.sort_order
});

export const getCategories = async (): Promise<VaultCategory[]> => {
    if (!isSupabaseConfigured) return [];

    try {
        const { data, error } = await supabase
            .from('vault_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            if (error.code === 'PGRST204' || error.message.includes('not found')) {
                console.warn('Vault categories table not found, using default fallback.');
                return [
                    { id: 'def-1', name: 'Coaching', iconName: 'BrainCircuit', sortOrder: 0 },
                    { id: 'def-2', name: 'Holistic', iconName: 'Flower2', sortOrder: 1 }
                ];
            }
            throw error;
        }

        return (data as SupabaseCategoryRow[]).map(mapRowToCategory);
    } catch (err) {
        console.error('Error in getCategories:', err);
        return [
            { id: 'def-1', name: 'Coaching', iconName: 'BrainCircuit', sortOrder: 0 },
            { id: 'def-2', name: 'Holistic', iconName: 'Flower2', sortOrder: 1 }
        ];
    }
};

export const createCategory = async (category: Omit<VaultCategory, 'id'>): Promise<VaultCategory> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('vault_categories')
        .insert([{
            coach_id: userData.user.id,
            name: category.name,
            icon_name: category.iconName,
            sort_order: category.sortOrder
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        throw error;
    }

    return mapRowToCategory(data as SupabaseCategoryRow);
};

export const updateCategory = async (id: string, updates: Partial<VaultCategory>): Promise<VaultCategory> => {
    const { data, error } = await supabase
        .from('vault_categories')
        .update({
            name: updates.name,
            icon_name: updates.iconName,
            sort_order: updates.sortOrder
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating category:', error);
        throw error;
    }

    return mapRowToCategory(data as SupabaseCategoryRow);
};

export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('vault_categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

export default {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
