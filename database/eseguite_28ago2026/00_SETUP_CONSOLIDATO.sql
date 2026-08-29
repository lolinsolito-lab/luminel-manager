-- ============================================================
-- LUMINEL MANAGER — SETUP CONSOLIDATO PER NUOVO SERVER SUPABASE
-- Sostituisce l'esecuzione manuale delle 15 migration precedenti
-- Include i fix per: RLS pending_subscriptions aperta, admin email
-- incoerente, subscription_tier duplicato, default 'trial' non valido
-- ============================================================
-- ESEGUI UNA VOLTA SOLA, IN ORDINE, SU UN PROGETTO SUPABASE VUOTO
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  business_name TEXT,
  business_address TEXT,
  vat_id TEXT,
  phone TEXT,
  website TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Europe/Rome',
  currency TEXT DEFAULT 'EUR',
  locale TEXT DEFAULT 'it',

  -- Subscription (UNICA fonte di verità: qui, non su user_settings)
  subscription_tier TEXT DEFAULT 'free',           -- FIX: era 'trial', non valido dal check sotto
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  billing_cycle TEXT DEFAULT 'monthly',
  is_founding_member BOOLEAN DEFAULT FALSE,
  founding_member_since TIMESTAMPTZ,
  founding_member_number INTEGER,

  -- FIX: sostituisce il check hardcoded su email nel frontend/nelle RLS
  is_admin BOOLEAN DEFAULT FALSE,

  onboarding_completed BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ADD CONSTRAINT valid_subscription_tier
  CHECK (subscription_tier IN ('free', 'starter', 'pro', 'signature', 'empire'));
ALTER TABLE users ADD CONSTRAINT valid_subscription_status
  CHECK (subscription_status IN ('inactive', 'active', 'trial', 'past_due', 'canceled'));

-- ============================================================
-- 2. CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profession TEXT,
  instagram TEXT,
  birthday DATE,
  address TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  source TEXT,
  total_sessions INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  loyalty_points INT DEFAULT 0,
  first_session_date TIMESTAMP WITH TIME ZONE,
  last_session_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  session_notes JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. SERVICES / 4. SESSIONS / 5. TRANSACTIONS / 6. RESOURCES
-- 7. TASKS / 8. CAMPAIGNS  (invariati da schema.sql originale)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, description TEXT, type TEXT, category TEXT,
  price DECIMAL(10,2) NOT NULL, duration_minutes INT,
  is_active BOOLEAN DEFAULT true, is_bookable_online BOOLEAN DEFAULT true,
  total_bookings INT DEFAULT 0, total_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title TEXT NOT NULL, session_type TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL, duration_minutes INT,
  location_type TEXT, location_address TEXT, meeting_url TEXT,
  status TEXT DEFAULT 'scheduled',
  price DECIMAL(10,2), paid BOOLEAN DEFAULT false, notes TEXT,
  reminder_24h_sent BOOLEAN DEFAULT false, reminder_1h_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL, amount DECIMAL(10,2) NOT NULL, category TEXT, description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT DEFAULT 'pending', payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, type TEXT, description TEXT, url TEXT, file_path TEXT,
  tags TEXT[], sent_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL, description TEXT, category TEXT, priority TEXT DEFAULT 'normal',
  completed BOOLEAN DEFAULT false, due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, type TEXT, description TEXT,
  start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE, is_active BOOLEAN DEFAULT true,
  conversions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. USER_SETTINGS — SOLO impostazioni operative.
-- FIX: nessuna colonna subscription_* qui (vivono solo su users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT DEFAULT 'Luminel Center',
  tax_id TEXT, address TEXT, currency TEXT DEFAULT 'EUR', timezone TEXT DEFAULT 'Europe/Rome',
  email TEXT, website TEXT, logo_url TEXT DEFAULT '',
  max_concurrent_appointments INTEGER DEFAULT 1,
  cabin_names TEXT[] DEFAULT ARRAY['Cabina Principale']::TEXT[],
  schedule JSONB DEFAULT '[
    {"day": "Monday", "active": true, "start": "09:00", "end": "17:00"},
    {"day": "Tuesday", "active": true, "start": "09:00", "end": "17:00"},
    {"day": "Wednesday", "active": true, "start": "10:00", "end": "18:00"},
    {"day": "Thursday", "active": true, "start": "09:00", "end": "17:00"},
    {"day": "Friday", "active": true, "start": "09:00", "end": "15:00"},
    {"day": "Saturday", "active": false, "start": "10:00", "end": "14:00"},
    {"day": "Sunday", "active": false, "start": "00:00", "end": "00:00"}
  ]'::JSONB,
  make_webhook TEXT, google_calendar_enabled BOOLEAN DEFAULT true,
  stripe_enabled BOOLEAN DEFAULT false, zoom_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. VAULT_CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS vault_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, icon_name TEXT DEFAULT 'BookOpen', sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coach_id, name)
);

-- ============================================================
-- 11. SUBSCRIPTION_PLANS
-- ⚠️ Prezzi presi dall'ultima migration eseguita in ordine (v2.6).
-- CONFERMA questi numeri prima di lanciare — sono la fonte unica
-- che userai ovunque (FounderLanding, AdminDashboard, Stripe).
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price_monthly_public DECIMAL(10,2) NOT NULL,
  price_monthly_founder DECIMAL(10,2) NOT NULL,
  price_annual_founder DECIMAL(10,2) NOT NULL,
  max_users INTEGER, max_clients INTEGER, max_sessions_per_month INTEGER,
  max_locations INTEGER DEFAULT 1, features JSONB,
  stripe_price_id_monthly TEXT, stripe_price_id_annual TEXT,
  is_active BOOLEAN DEFAULT TRUE, sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO subscription_plans (name, display_name, price_monthly_public, price_monthly_founder, price_annual_founder, max_users, max_clients, max_sessions_per_month, max_locations, sort_order, features)
VALUES
  ('starter', 'LUMINEL STARTER', 59, 33, 330, 1, 50, 100, 1, 1,
   '["dashboard","calendar","crm_basic","ai_coach_basic","email_reminders","mobile"]'::jsonb),
  ('pro', 'LUMINEL PRO', 99, 55, 550, 5, 250, 500, 1, 2,
   '["dashboard","calendar","crm_full","ai_coach_pro","whatsapp","invoicing","payments","team_management","pdf_export"]'::jsonb),
  ('signature', 'LUMINEL SIGNATURE', 159, 88, 880, 10, 500, -1, 2, 3,
   '["dashboard","calendar","crm_full","ai_coach_pro","whatsapp","invoicing","payments","team_management","pdf_export","inventory_basic","loyalty","api_readonly","team_analytics"]'::jsonb),
  ('empire', 'LUMINEL EMPIRE', 249, 138, 1380, -1, -1, -1, -1, 4,
   '["dashboard","calendar","crm_full","ai_coach_empire","whatsapp","invoicing","payments","team_management","pdf_export","inventory_full","loyalty","api_full","team_analytics","white_label","success_manager","onboarding"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 12. FOUNDER_WAITLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS founder_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL, name TEXT, business_type TEXT,
  ip_address INET, user_agent TEXT, referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ, converted_to_plan TEXT, notes TEXT
);

ALTER TABLE founder_waitlist ADD CONSTRAINT valid_business_type
  CHECK (business_type IS NULL OR business_type IN ('parrucchiere','estetista','coach','tattoo','massaggio','altro'));

-- ============================================================
-- 13. PENDING_SUBSCRIPTIONS
-- FIX: nessuna policy per anon/authenticated. L'unico accesso
-- legittimo è via service_role (webhook, bypassa RLS) o via la
-- funzione SECURITY DEFINER claim_pending_subscription() sotto.
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE, stripe_customer_id TEXT, stripe_subscription_id TEXT,
  subscription_tier TEXT NOT NULL, billing_cycle TEXT NOT NULL,
  is_founding_member BOOLEAN DEFAULT true, founding_member_number INTEGER,
  checkout_session_id TEXT, status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(), claimed_at TIMESTAMPTZ,
  claimed_by_user_id UUID REFERENCES auth.users(id)
);

-- ============================================================
-- INDICI
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clients_coach ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_sessions_coach ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_coach ON transactions(coach_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_services_coach ON services(coach_id);
CREATE INDEX IF NOT EXISTS idx_tasks_coach ON tasks(coach_id);
CREATE INDEX IF NOT EXISTS idx_vault_categories_coach ON vault_categories(coach_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_waitlist_email ON founder_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_founder_waitlist_created ON founder_waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_subs_email ON pending_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_pending_subs_status ON pending_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_subscriptions ENABLE ROW LEVEL SECURITY;
-- pending_subscriptions: RLS attivo, ZERO policy per anon/authenticated = deny by default. Corretto.

-- Users: policy separate per operazione (fix di v2.4, corregge il "FOR ALL" originale che bloccava gli INSERT)
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "clients_coach_only" ON clients FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "services_coach_only" ON services FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "sessions_coach_only" ON sessions FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "transactions_coach_only" ON transactions FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "resources_coach_only" ON resources FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "tasks_coach_only" ON tasks FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "campaigns_coach_only" ON campaigns FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "categories_coach_only" ON vault_categories FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "settings_select_own" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "plans_viewable_by_everyone" ON subscription_plans FOR SELECT USING (true);

CREATE POLICY "anyone_can_join_waitlist" ON founder_waitlist FOR INSERT WITH CHECK (true);
-- FIX: era auth.jwt()->>'email' = 'admin@lumina.app' (sbagliata e non verificabile).
-- Ora usa la colonna is_admin reale sulla tabella users.
CREATE POLICY "admins_can_view_waitlist" ON founder_waitlist FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admins_can_update_waitlist" ON founder_waitlist FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- TRIGGER: crea automaticamente il profilo public.users alla registrazione
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, subscription_tier)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), 'free')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNZIONI: waitlist Founder (25 posti, versione finale v2.5)
-- ============================================================
CREATE OR REPLACE FUNCTION public.join_founder_waitlist(p_email TEXT, p_name TEXT DEFAULT NULL, p_business_type TEXT DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM founder_waitlist WHERE email = LOWER(p_email);
  IF v_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Email già registrata nella waitlist');
  END IF;
  INSERT INTO founder_waitlist (email, name, business_type) VALUES (LOWER(p_email), p_name, p_business_type);
  SELECT COUNT(*) INTO v_count FROM founder_waitlist;
  RETURN json_build_object('success', true, 'message', 'Benvenuto nella Founder Waitlist!', 'position', v_count, 'spots_remaining', GREATEST(0, 25 - v_count));
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.join_founder_waitlist TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_founder_spots_remaining()
RETURNS INTEGER LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT GREATEST(0, 25 - (
    (SELECT COUNT(*) FROM founder_waitlist)::INTEGER +
    (SELECT COUNT(*) FROM public.users WHERE is_founding_member = true)::INTEGER
  ));
$$;
GRANT EXECUTE ON FUNCTION public.get_founder_spots_remaining TO anon, authenticated;

-- ============================================================
-- FUNZIONE: riscatto abbonamento pagato prima della registrazione
-- ============================================================
CREATE OR REPLACE FUNCTION public.claim_pending_subscription(user_email TEXT, user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE pending_sub RECORD;
BEGIN
  SELECT * INTO pending_sub FROM pending_subscriptions WHERE email = user_email AND status = 'pending' LIMIT 1;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  UPDATE public.users SET
    subscription_tier = pending_sub.subscription_tier, subscription_status = 'active',
    billing_cycle = pending_sub.billing_cycle, stripe_customer_id = pending_sub.stripe_customer_id,
    stripe_subscription_id = pending_sub.stripe_subscription_id, is_founding_member = pending_sub.is_founding_member,
    founding_member_since = pending_sub.created_at, founding_member_number = pending_sub.founding_member_number,
    updated_at = NOW()
  WHERE id = user_id;
  UPDATE pending_subscriptions SET status = 'claimed', claimed_at = NOW(), claimed_by_user_id = user_id WHERE id = pending_sub.id;
  RETURN TRUE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_pending_subscription(TEXT, UUID) TO authenticated;

-- ============================================================
-- TRIGGER updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ⚠️ 'resources' è pubblico per default (come nell'originale) — vedi
-- nota nel messaggio: valuta se i file pagati vadano protetti da RLS.
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "logos_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "logos_own_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_own_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logos');

CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_own_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_own_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "resources_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources');
CREATE POLICY "resources_own_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resources_own_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resources_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'resources');

-- ============================================================
-- ULTIMO STEP MANUALE (da fare TU dopo aver registrato il tuo account):
-- UPDATE public.users SET is_admin = true WHERE email = 'jaramichael@hotmail.com';
-- ============================================================

SELECT 'Setup completato. Esegui ora diagnostica_sicurezza.sql per verificare.' AS status;
