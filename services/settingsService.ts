/**
 * Settings Service - Supabase Integration
 * Manages user settings including capacity, schedule, and integrations
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

// Types
export interface UserSettings {
    id?: string;
    userId?: string;

    // Business Profile
    businessName: string;
    logoUrl: string;
    taxId: string;
    address: string;
    currency: string;
    timezone: string;
    email: string;
    website: string;

    // Capacity Settings
    maxConcurrentAppointments: number;
    cabinNames: string[];

    // Schedule
    schedule: ScheduleDay[];

    // Integrations
    makeWebhook: string;
    googleCalendarEnabled: boolean;
    stripeEnabled: boolean;
    zoomEnabled: boolean;
}

export interface ScheduleDay {
    day: string;
    active: boolean;
    start: string;
    end: string;
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
    businessName: 'Luminel Center',
    logoUrl: '',
    taxId: '',
    address: '',
    currency: 'EUR',
    timezone: 'Europe/Rome',
    email: '',
    website: '',
    maxConcurrentAppointments: 1,
    cabinNames: ['Cabina Principale'],
    schedule: [
        { day: 'Monday', active: true, start: '09:00', end: '17:00' },
        { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
        { day: 'Wednesday', active: true, start: '10:00', end: '18:00' },
        { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
        { day: 'Friday', active: true, start: '09:00', end: '15:00' },
        { day: 'Saturday', active: false, start: '10:00', end: '14:00' },
        { day: 'Sunday', active: false, start: '00:00', end: '00:00' }
    ],
    makeWebhook: '',
    googleCalendarEnabled: true,
    stripeEnabled: false,
    zoomEnabled: false
};

// Convert from Supabase row format
const fromSupabase = (row: any): UserSettings => ({
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name || DEFAULT_SETTINGS.businessName,
    logoUrl: row.logo_url || '',
    taxId: row.tax_id || '',
    address: row.address || '',
    currency: row.currency || DEFAULT_SETTINGS.currency,
    timezone: row.timezone || DEFAULT_SETTINGS.timezone,
    email: row.email || '',
    website: row.website || '',
    maxConcurrentAppointments: row.max_concurrent_appointments || 1,
    cabinNames: row.cabin_names || DEFAULT_SETTINGS.cabinNames,
    schedule: row.schedule || DEFAULT_SETTINGS.schedule,
    makeWebhook: row.make_webhook || '',
    googleCalendarEnabled: row.google_calendar_enabled ?? true,
    stripeEnabled: row.stripe_enabled ?? false,
    zoomEnabled: row.zoom_enabled ?? false
});

// Convert to Supabase row format
const toSupabase = (settings: Partial<UserSettings>) => ({
    business_name: settings.businessName,
    logo_url: settings.logoUrl,
    tax_id: settings.taxId,
    address: settings.address,
    currency: settings.currency,
    timezone: settings.timezone,
    email: settings.email,
    website: settings.website,
    max_concurrent_appointments: settings.maxConcurrentAppointments,
    cabin_names: settings.cabinNames,
    schedule: settings.schedule,
    make_webhook: settings.makeWebhook,
    google_calendar_enabled: settings.googleCalendarEnabled,
    stripe_enabled: settings.stripeEnabled,
    zoom_enabled: settings.zoomEnabled
});

/**
 * Get user settings from Supabase
 * Falls back to localStorage cache if Supabase unavailable
 */
export const getSettings = async (): Promise<UserSettings> => {
    // Try Supabase first
    if (isSupabaseConfigured()) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 = no rows found, which is OK for new users
                    console.error('[SettingsService] ❌ Error fetching settings:', error);
                }

                if (data) {
                    const settings = fromSupabase(data);
                    // Cache locally for offline access
                    localStorage.setItem('lumina_settings_cache', JSON.stringify(settings));
                    console.log('[SettingsService] ☁️ Loaded settings from Supabase');
                    return settings;
                }
            }
        } catch (error) {
            console.error('[SettingsService] ❌ Supabase error:', error);
        }
    }

    // Fallback to localStorage cache
    try {
        const cached = localStorage.getItem('lumina_settings_cache');
        if (cached) {
            console.log('[SettingsService] 💾 Loaded settings from cache');
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn('[SettingsService] ⚠️ Failed to parse cached settings');
    }

    // Return defaults
    console.log('[SettingsService] 📋 Using default settings');
    return DEFAULT_SETTINGS;
};

/**
 * Save user settings to Supabase
 * Also caches to localStorage for offline access
 */
export const saveSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    // Always cache locally
    const currentSettings = await getSettings();
    const mergedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('lumina_settings_cache', JSON.stringify(mergedSettings));

    // Try to save to Supabase
    if (isSupabaseConfigured()) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const supabaseData = {
                    user_id: user.id,
                    ...toSupabase(mergedSettings)
                };

                // Upsert (insert or update)
                const { data, error } = await supabase
                    .from('user_settings')
                    .upsert(supabaseData, { onConflict: 'user_id' })
                    .select()
                    .single();

                if (error) {
                    console.error('[SettingsService] ❌ Error saving settings:', error);
                    throw error;
                }

                console.log('[SettingsService] ☁️ Settings saved to Supabase');
                return fromSupabase(data);
            }
        } catch (error) {
            console.error('[SettingsService] ❌ Supabase save error:', error);
        }
    }

    console.log('[SettingsService] 💾 Settings saved to cache only');
    return mergedSettings;
};

/**
 * Get just the max concurrent appointments setting (for Calendar)
 * Uses cache-first strategy for performance
 */
export const getMaxConcurrentAppointments = async (): Promise<number> => {
    try {
        // Try cache first for speed
        const cached = localStorage.getItem('lumina_settings_cache');
        if (cached) {
            const settings = JSON.parse(cached);
            return settings.maxConcurrentAppointments || 1;
        }

        // Fall back to full fetch
        const settings = await getSettings();
        return settings.maxConcurrentAppointments;
    } catch (e) {
        console.warn('[SettingsService] ⚠️ Could not get max concurrent appointments, defaulting to 1');
        return 1;
    }
};

/**
 * Quick sync function - loads from Supabase and updates cache
 */
export const syncSettings = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
        await getSettings(); // This will update the cache
        console.log('[SettingsService] 🔄 Settings synced');
    }
};

export default {
    getSettings,
    saveSettings,
    getMaxConcurrentAppointments,
    syncSettings,
    DEFAULT_SETTINGS
};
