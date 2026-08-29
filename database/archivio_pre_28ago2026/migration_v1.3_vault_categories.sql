
-- =============================================
-- Migration v1.3: Dynamic Vault Categories
-- =============================================

CREATE TABLE IF NOT EXISTS vault_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon_name TEXT DEFAULT 'BookOpen', -- Lucide icon name
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique names per coach
  UNIQUE(coach_id, name)
);

-- Enable RLS
ALTER TABLE vault_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "categories_coach_only" ON vault_categories
  FOR ALL USING (coach_id = auth.uid());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_vault_categories_coach ON vault_categories(coach_id);

-- Add some default categories for new users if needed, 
-- but for existing users we might want to let them define their own.
-- However, to avoid a completely empty state:
INSERT INTO vault_categories (coach_id, name, icon_name, sort_order)
SELECT id, 'Coaching', 'BrainCircuit', 0 FROM users
ON CONFLICT DO NOTHING;

INSERT INTO vault_categories (coach_id, name, icon_name, sort_order)
SELECT id, 'Holistic', 'Flower2', 1 FROM users
ON CONFLICT DO NOTHING;
