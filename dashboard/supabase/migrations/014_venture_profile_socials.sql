-- Migration 014: Venture Profile Extension + Dynamic Social Accounts
-- Extends ventures table with rich profile fields.
-- Replaces hardcoded ig_handle / yt_channel_id / li_profile_url with a
-- flexible venture_socials table (many platforms per venture).
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

-- ─── Extend ventures table ────────────────────────────────────────────────────

ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS description    TEXT,
  ADD COLUMN IF NOT EXISTS tagline        TEXT,
  ADD COLUMN IF NOT EXISTS brand_type     TEXT CHECK (brand_type IN ('ecommerce','saas','agency','media','marketplace')),
  ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  ADD COLUMN IF NOT EXISTS website_url    TEXT,
  ADD COLUMN IF NOT EXISTS logo_url       TEXT,
  ADD COLUMN IF NOT EXISTS founded_year   INTEGER CHECK (founded_year > 1900 AND founded_year <= 2100),
  ADD COLUMN IF NOT EXISTS repo_url       TEXT,
  ADD COLUMN IF NOT EXISTS notion_url     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- ─── venture_socials ─────────────────────────────────────────────────────────
-- One row per connected social account per venture.
-- Replaces hardcoded ig_handle / yt_channel_id / li_profile_url columns.

CREATE TABLE IF NOT EXISTS venture_socials (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id     TEXT NOT NULL,
  platform       TEXT NOT NULL CHECK (platform IN (
                   'instagram','youtube','linkedin','tiktok',
                   'twitter','facebook','pinterest',
                   'github','discord','telegram'
                 )),
  handle_or_url  TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (venture_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_venture_socials_venture ON venture_socials(venture_id);

-- RLS — service role bypasses; all access via server-side lib/db.ts
ALTER TABLE venture_socials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS venture_socials_service_all ON venture_socials;
CREATE POLICY venture_socials_service_all ON venture_socials USING (true) WITH CHECK (true);

-- ─── Auto-updated_at trigger for ventures ────────────────────────────────────

CREATE OR REPLACE FUNCTION ventures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ventures_updated_at_trigger ON ventures;
CREATE TRIGGER ventures_updated_at_trigger
  BEFORE UPDATE ON ventures
  FOR EACH ROW EXECUTE FUNCTION ventures_updated_at();

COMMENT ON TABLE venture_socials IS 'Dynamic social account registry — replaces hardcoded ig_handle/yt_channel_id/li_profile_url columns';
COMMENT ON COLUMN ventures.brand_type IS 'ecommerce | saas | agency | media | marketplace — injected into agent system prompts';
COMMENT ON COLUMN ventures.status IS 'active = normal routing | paused = hidden from War Room | archived = removed from switcher';
