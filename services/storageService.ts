// Storage Service - Upload files to Supabase Storage
import { supabase, getCurrentUser } from './supabaseClient';

// ==============================================================
// FIX SICUREZZA (28 ago 2026): documenti cliente su bucket privato
// ==============================================================
// I documenti caricati nel profilo di un cliente (contratti, moduli
// intake, allegati task) NON devono mai finire su un bucket pubblico.
// Usa queste due funzioni invece di uploadFile()/getPublicUrl() per
// qualunque file legato a un cliente specifico.

/**
 * Carica un documento legato a un cliente specifico sul bucket privato
 * 'client-documents'. Ritorna il PATH del file (non un URL pubblico) —
 * salva questo path nel DB, non un URL, perché gli URL firmati scadono.
 */
export const uploadClientDocument = async (file: File, clientId: string): Promise<string> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${clientId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
        console.error('[StorageService] Errore upload documento cliente:', error);
        throw error;
    }

    return data.path; // path, non URL — la URL si genera al momento della visualizzazione
};

/**
 * Genera una URL firmata temporanea (default 1 ora) per aprire un
 * documento cliente. Da chiamare al momento del click "Visualizza",
 * non da salvare/cacheare — scade.
 */
export const getSignedDocumentUrl = async (filePath: string, expiresInSeconds: number = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
        console.error('[StorageService] Errore generazione signed URL:', error);
        throw error;
    }

    return data.signedUrl;
};

// ==============================================================
// FIX (28 ago 2026): risorse "vere" della libreria su bucket privato,
// separate dagli assaggi gratuiti (che restano su 'resources', pubblico).
// Usa queste per qualunque risorsa con is_free_sample = false.
// ==============================================================

/**
 * Carica una risorsa "vera" (non assaggio gratuito) sul bucket privato
 * 'resources-private'. Ritorna il PATH del file, non un URL — stesso
 * pattern dei documenti cliente: si genera una signed URL al momento
 * della visualizzazione, non si salva un link permanente.
 */
export const uploadPrivateResource = async (file: File): Promise<string> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('resources-private')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
        console.error('[StorageService] Errore upload risorsa privata:', error);
        throw error;
    }

    return data.path;
};

/**
 * Genera una URL firmata temporanea (default 1 ora) per una risorsa privata.
 */
export const getSignedResourceUrl = async (filePath: string, expiresInSeconds: number = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('resources-private')
        .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
        console.error('[StorageService] Errore generazione signed URL risorsa:', error);
        throw error;
    }

    return data.signedUrl;
};

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (e.g., 'logos', 'avatars', 'resources')
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded file
 * NOTA: usa questa funzione SOLO per bucket pubblici by design (logo, avatar,
 * assaggi gratuiti della libreria risorse). Mai per documenti cliente o
 * risorse private — vedi le funzioni dedicate sopra.
 */
export const uploadFile = async (
    file: File,
    bucket: string = 'logos',
    folder: string = ''
): Promise<string> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.error('[StorageService] Upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    console.log('[StorageService] ☁️ File uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
};

/**
 * Upload a business logo
 * @param file - Logo image file
 * @returns Public URL of the logo
 */
export const uploadLogo = async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
    }

    return uploadFile(file, 'logos', 'business');
};

/**
 * Upload a user avatar
 * @param file - Avatar image file
 * @returns Public URL of the avatar
 */
export const uploadAvatar = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
    }

    return uploadFile(file, 'avatars', '');
};

/**
 * Delete a file from Supabase Storage
 * @param url - The public URL of the file to delete
 * @param bucket - The storage bucket name
 */
export const deleteFile = async (url: string, bucket: string): Promise<void> => {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        console.error('[StorageService] Delete error:', error);
        throw error;
    }

    console.log('[StorageService] ☁️ File deleted');
};