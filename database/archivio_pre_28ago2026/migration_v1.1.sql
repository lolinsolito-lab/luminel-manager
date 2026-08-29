-- =============================================
-- LUMINA EMPIRE - Schema Migration v1.1
-- =============================================
-- Run this in Supabase SQL Editor after initial schema
-- Adds JSON columns for embedded data
-- =============================================

-- Add missing columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS session_notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- =============================================
-- SUCCESS: Migration v1.1 complete
-- =============================================
