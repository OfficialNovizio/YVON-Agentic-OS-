-- 108_ventures_schema_repair.sql
-- Repairs drift discovered 2026-08-09: the Supabase migration ledger for project
-- cjjllgexiecesgwenpph listed 014_venture_profile_socials, 020_content_intelligence,
-- 030_operating_countries, 032_market_subcategories, 033_target_audience,
-- 038_venture_local_repo_path, 040_brand_tier, and 050_venture_detail_fields as applied —
-- but a direct information_schema query showed none of their `ventures` columns actually
-- existed on the live table. Concrete symptom: Settings → Venture → Technical's "Repo URL"
-- field (dashboard/app/settings/venture/_technical.tsx) silently failed to persist, because
-- `repo_url` wasn't a real column despite `dashboard/lib/db/ventures.ts` writing to it.
--
-- This migration re-runs the original ADD COLUMN IF NOT EXISTS statements from each of those
-- files (idempotent — safe even where a column happens to already exist) so the live schema
-- matches what dashboard/lib/db/ventures.ts, lib/types.ts's VentureConfig, and the Settings UI
-- have depended on all along. It does not touch RLS (029_rls_all_tables.sql) — that migration
-- is tracked as a separate, security-sensitive decision; `get_advisors` still shows RLS
-- disabled on `ventures` and 51 other tables as of this migration.

-- 014_venture_profile_socials.sql
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

-- 020_content_intelligence.sql (ventures part only — content_series table already existed live)
ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS brand_big_idea JSONB DEFAULT NULL;

-- 030_operating_countries.sql
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS operating_countries TEXT[] DEFAULT '{}';
UPDATE ventures SET operating_countries = ARRAY['US'] WHERE operating_countries IS NULL OR operating_countries = '{}';

-- 032_market_subcategories.sql
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS market_subcategories TEXT[];

-- 033_target_audience.sql
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS target_audience JSONB;

-- 038_venture_local_repo_path.sql
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS local_repo_path TEXT;

-- 040_brand_tier.sql
ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS brand_tier      VARCHAR(32),
  ADD COLUMN IF NOT EXISTS avg_price_point INTEGER;

-- 050_venture_detail_fields.sql
ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS operating_cities TEXT[],
  ADD COLUMN IF NOT EXISTS ios_app_url TEXT,
  ADD COLUMN IF NOT EXISTS android_app_url TEXT,
  ADD COLUMN IF NOT EXISTS hosting_platform TEXT,
  ADD COLUMN IF NOT EXISTS product_categories JSONB,
  ADD COLUMN IF NOT EXISTS deployment_platforms TEXT[],
  ADD COLUMN IF NOT EXISTS deployment_config JSONB;

-- Applied live via Supabase MCP apply_migration 2026-08-09 (name: ventures_schema_repair),
-- verified after the fact with a direct information_schema.columns query. This file is the
-- repo-side record of that same statement set, per the existing one-file-per-migration convention.
