-- =============================================
-- LUMINA EMPIRE - Complete Database Schema
-- =============================================
-- Execute this in your Supabase SQL Editor
-- Project: https://supabase.com/dashboard
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS (Coaches who use Lumina)
-- =============================================
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
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'trial', -- 'trial', 'starter', 'professional', 'premium'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  stripe_customer_id TEXT,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CLIENTS (Clients of coaches)
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profession TEXT,
  instagram TEXT,
  birthday DATE,
  address TEXT,
  avatar_url TEXT,
  
  -- Status & Segmentation
  status TEXT DEFAULT 'active', -- 'active', 'vip', 'at_risk', 'inactive', 'new'
  source TEXT, -- 'google', 'instagram', 'referral', 'event'
  
  -- Business metrics
  total_sessions INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  loyalty_points INT DEFAULT 0,
  first_session_date TIMESTAMP WITH TIME ZONE,
  last_session_date TIMESTAMP WITH TIME ZONE,
  
  -- CRM
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. SERVICES (Programs/Treatments offered)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'coaching', 'holistic', 'workshop', 'retreat', 'bodywork'
  category TEXT, -- 'transformation', 'wellness', 'spiritual', 'business'
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_bookable_online BOOLEAN DEFAULT true,
  
  -- Stats
  total_bookings INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. SESSIONS (Appointments)
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  
  -- Session info
  title TEXT NOT NULL,
  session_type TEXT, -- '1:1', 'group', 'online', 'in_person'
  
  -- Timing
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT,
  
  -- Location
  location_type TEXT, -- 'online', 'studio', 'client_home'
  location_address TEXT,
  meeting_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  
  -- Payment
  price DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  
  -- Notes
  notes TEXT,
  
  -- Reminders
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. TRANSACTIONS (Financial records)
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  
  -- Transaction info
  type TEXT NOT NULL, -- 'income', 'expense', 'payroll'
  amount DECIMAL(10,2) NOT NULL,
  category TEXT, -- 'service', 'product', 'rent', 'marketing', 'salary'
  description TEXT,
  
  -- Payment
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  payment_method TEXT, -- 'credit_card', 'bank_transfer', 'cash', 'stripe'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. RESOURCES (Digital assets library)
-- =============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  type TEXT, -- 'audio', 'pdf', 'video', 'link'
  description TEXT,
  url TEXT,
  file_path TEXT, -- Supabase Storage path
  tags TEXT[],
  
  -- Stats
  sent_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. TASKS (Coach's to-do list)
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'follow_up', 'admin', 'sales', 'content'
  priority TEXT DEFAULT 'normal', -- 'urgent', 'normal', 'low'
  
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. CAMPAIGNS (Promotions)
-- =============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  type TEXT, -- 'promotion', 'referral', 'seasonal'
  description TEXT,
  
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  conversions INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES (Performance optimization)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_clients_coach ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_sessions_coach ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_coach ON transactions(coach_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_services_coach ON services(coach_id);
CREATE INDEX IF NOT EXISTS idx_tasks_coach ON tasks(coach_id);

-- =============================================
-- ROW LEVEL SECURITY (Multi-tenant isolation)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Users: Can only see/edit own profile
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (auth.uid() = id);

-- Clients: Coach sees only their clients
CREATE POLICY "clients_coach_only" ON clients
  FOR ALL USING (coach_id = auth.uid());

-- Services: Coach manages their services
CREATE POLICY "services_coach_only" ON services
  FOR ALL USING (coach_id = auth.uid());

-- Sessions: Coach manages their sessions
CREATE POLICY "sessions_coach_only" ON sessions
  FOR ALL USING (coach_id = auth.uid());

-- Transactions: Coach manages their finances
CREATE POLICY "transactions_coach_only" ON transactions
  FOR ALL USING (coach_id = auth.uid());

-- Resources: Coach manages their library
CREATE POLICY "resources_coach_only" ON resources
  FOR ALL USING (coach_id = auth.uid());

-- Tasks: Coach manages their tasks
CREATE POLICY "tasks_coach_only" ON tasks
  FOR ALL USING (coach_id = auth.uid());

-- Campaigns: Coach manages their campaigns
CREATE POLICY "campaigns_coach_only" ON campaigns
  FOR ALL USING (coach_id = auth.uid());

-- =============================================
-- FUNCTIONS (Auto-update timestamps)
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
-- If you see this, the schema was created successfully!
-- Next steps:
-- 1. Go to Authentication > Settings in Supabase
-- 2. Enable Email auth
-- 3. (Optional) Enable Google OAuth
-- 4. Copy your API keys to .env.local
