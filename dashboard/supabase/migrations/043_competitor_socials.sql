-- 043_competitor_socials.sql
-- Maps competitor brands to their social handles per platform.
-- Analogous to venture_socials for your own brand.
-- Required by the competitor pipeline to know which handles to scrape.

CREATE TABLE IF NOT EXISTS competitor_socials (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id  UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL CHECK (platform IN (
                   'instagram','youtube','linkedin','tiktok',
                   'twitter','facebook','pinterest'
                 )),
  handle_or_url  TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (competitor_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_competitor_socials_competitor
  ON competitor_socials(competitor_id);

-- RLS — service_role only
ALTER TABLE competitor_socials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS competitor_socials_svc ON competitor_socials;
CREATE POLICY competitor_socials_svc ON competitor_socials
  FOR ALL TO service_role USING (true) WITH CHECK (true);
