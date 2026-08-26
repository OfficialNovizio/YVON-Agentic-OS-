-- 136_job_hunt_explorer.sql
-- Job Hunt — Sector Explorer v2 (2026-08-25).
-- Two-stage selection: search → Explorer (saved candidates) → active sectors.
-- - job_hunt_sector_catalog gains `custom` — sectors created on the fly from
--   the search box (keywords auto-generated; demand/pay/PR stay null, the
--   page shows live-derived data instead).
-- - job_hunt_explorer holds the saved candidate list. Only ACTIVE sectors
--   (the page selection → job_hunt_sync_queries) drive the pull engines.

ALTER TABLE job_hunt_sector_catalog
  ADD COLUMN IF NOT EXISTS custom BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS job_hunt_explorer (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id  TEXT NOT NULL REFERENCES job_hunt_sector_catalog(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sector_id)
);

ALTER TABLE job_hunt_explorer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_hunt_explorer_select_authenticated" ON job_hunt_explorer
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_hunt_explorer_insert_authenticated" ON job_hunt_explorer
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "job_hunt_explorer_delete_authenticated" ON job_hunt_explorer
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "job_hunt_explorer_all_service_role" ON job_hunt_explorer
  FOR ALL TO service_role USING (true) WITH CHECK (true);
