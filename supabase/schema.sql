-- Supabase Schema for AI 新年祝福助手
-- Run this in the Supabase SQL Editor to create the contacts table.

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  relationship TEXT DEFAULT '朋友',
  memories TEXT,
  avatar_color TEXT,
  generated_greetings JSONB,
  is_blessed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update `updated_at` on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional, can be configured later)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust for auth later)
CREATE POLICY "Allow all access" ON contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);
