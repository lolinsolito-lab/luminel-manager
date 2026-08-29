-- ==============================================
-- LUMINA EMPIRE - Migration v2.4
-- Fix: User Creation on Registration + RLS Policies
-- ==============================================
-- 
-- PROBLEMA: Quando un nuovo utente si registra:
-- 1. Il trigger on_auth_user_created potrebbe non essere attivo
-- 2. La RLS policy "FOR ALL" blocca anche INSERT
-- 3. L'utente non può salvare dati perché coach_id non esiste in public.users
--
-- SOLUZIONE: 
-- 1. Ricreare trigger con SECURITY DEFINER
-- 2. Separare le policy RLS per operazione (SELECT/INSERT/UPDATE/DELETE)
-- 3. Sincronizzare utenti esistenti da auth.users
-- ==============================================

-- STEP 0: Fix existing users with invalid subscription_tier values
-- 'trial' is not a valid tier, it should be 'free'
UPDATE public.users 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL 
   OR subscription_tier NOT IN ('free', 'starter', 'pro', 'signature', 'empire');

-- STEP 1: Sincronizza utenti esistenti (se mancano in public.users)
-- Skip if ID OR email already exists to avoid conflicts
INSERT INTO public.users (id, email, full_name, subscription_tier, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    'free',
    au.created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
  AND NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.email = au.email);

-- STEP 2: Ricrea la funzione handle_new_user con gestione completa conflitti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Check if a user with this email already exists
    SELECT id INTO existing_user_id FROM public.users WHERE email = NEW.email;
    
    IF existing_user_id IS NOT NULL THEN
        -- User with this email exists: update their ID to match auth.users
        -- This handles cases where user re-registered
        UPDATE public.users SET
            id = NEW.id,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name),
            updated_at = NOW()
        WHERE email = NEW.email;
        
        RAISE LOG 'Lumina: Updated existing user profile for % (ID: %)', NEW.email, NEW.id;
    ELSE
        -- No existing user: insert new record
        INSERT INTO public.users (id, email, full_name, subscription_tier)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
            'free'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
            updated_at = NOW();
        
        RAISE LOG 'Lumina: Created new user profile for % (ID: %)', NEW.email, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Ricrea il trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Fix RLS Policies sulla tabella users
-- Rimuovi policy esistente e crea policy separate per operazione

DROP POLICY IF EXISTS "users_own_data" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- SELECT: Solo propri dati
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- INSERT: L'utente può creare il proprio record
-- (Principalmente gestito dal trigger SECURITY DEFINER)
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Solo propri dati
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE: Solo propri dati (ma sconsigliato)
CREATE POLICY "users_delete_own" ON users
    FOR DELETE USING (auth.uid() = id);

-- STEP 5: Verifica
SELECT 
    'Utenti in auth.users:' as check,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Utenti in public.users:',
    COUNT(*)
FROM public.users;

-- Mostra utenti sincronizzati
SELECT id, email, full_name, subscription_tier, created_at 
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;
