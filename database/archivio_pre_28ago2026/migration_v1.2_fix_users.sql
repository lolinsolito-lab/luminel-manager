-- ==============================================
-- LUMINA EMPIRE - Migration v1.2
-- Fix: Sync auth.users with public.users
-- ==============================================
-- 
-- PROBLEMA: Quando un utente si registra con Supabase Auth, 
-- viene creato in auth.users ma NON in public.users.
-- La tabella clients richiede coach_id che deve esistere in public.users.
--
-- SOLUZIONE: Trigger automatico + inserimento manuale utenti esistenti
-- ==============================================

-- 1. INSERISCI UTENTI ESISTENTI da auth.users a public.users
-- Questo copierà tutti gli utenti auth che non hanno ancora un record in public.users
-- NOTA: Usiamo solo le colonne che esistono nella tabella users (da schema.sql)
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. CREA FUNZIONE per trigger automatico
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREA TRIGGER su auth.users
-- Il trigger si attiva quando un nuovo utente si registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICA: Mostra gli utenti sincronizzati
SELECT 'Utenti sincronizzati:' as status;
SELECT id, email, full_name FROM public.users;
