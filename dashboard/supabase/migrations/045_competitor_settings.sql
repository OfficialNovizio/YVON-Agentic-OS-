-- 045_competitor_settings.sql
-- Per-venture competitor refresh configuration.
-- Controls: refresh frequency, which platforms to scrape, Apify cost tracking.
--
-- Platform auto-detection: if platforms_to_scrape is empty (default),
-- the system auto-discovers from venture_socials — only scrapes platforms
-- where the venture itself has accounts connected.

CREATE TABLE IF NOT EXISTS competitor_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id            TEXT NOT NULL UNIQUE,
  refresh_frequency     TEXT NOT NULL DEFAULT 'twice_weekly'
                          CHECK (refresh_frequency IN ('manual','daily','twice_weekly','weekly')),
  platforms_to_scrape   JSONB NOT NULL DEFAULT '[]',
  last_refreshed        TIMESTAMPTZ,
  next_refresh_due      TIMESTAMPTZ,
  apify_cu_used_this_month INTEGER NOT NULL DEFAULT 0,
  apify_cu_limit        INTEGER NOT NULL DEFAULT 100,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_settings_venture
  ON competitor_settings(venture_id);

-- Auto-updated_at trigger
CREATE OR REPLACE FUNCTION competitor_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS competitor_settings_updated_at_trigger ON competitor_settings;
CREATE TRIGGER competitor_settings_updated_at_trigger
  BEFORE UPDATE ON competitor_settings
  FOR EACH ROW EXECUTE FUNCTION competitor_settings_updated_at();

-- RLS
ALTER TABLE competitor_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS competitor_settings_svc ON competitor_settings;
CREATE POLICY competitor_settings_svc ON competitor_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed defaults for existing ventures (auto-detect from venture_socials)
INSERT INTO competitor_settings (venture_id, refresh_frequency, platforms_to_scrape)
SELECT v.id::text, 'twice_weekly', '[]'::jsonb
FROM ventures v
WHERE NOT EXISTS (
  SELECT 1 FROM competitor_settings cs WHERE cs.venture_id = v.id::text
);

COMMENT ON TABLE competitor_settings IS 'Per-venture refresh config. platforms_to_scrape empty = auto-detect from venture_socials.';
COMMENT ON COLUMN competitor_settings.refresh_frequency IS 'manual | daily | twice_weekly | weekly';
COMMENT ON COLUMN competitor_settings.platforms_to_scrape IS 'JSON array of platforms. Empty array = auto-detect from venture social accounts.';
COMMENT ON COLUMN competitor_settings.apify_cu_used_this_month IS 'Tracked per calendar month. Reset on first refresh of new month.';
