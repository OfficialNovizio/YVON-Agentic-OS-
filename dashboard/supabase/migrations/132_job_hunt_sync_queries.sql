-- 132_job_hunt_sync_queries.sql
-- Job Hunt (2026-08-25): the sync engine's industry/keyword configuration —
-- DATA, not code. Both fetch engines read this table at run time:
--   · POST /api/job-hunt/sync (the dashboard "Sync all industries" button)
--   · vps-scripts/fetch-hiring-boards.py (the 3x daily Indeed+LinkedIn cron)
-- so changing a sector or its keywords in the Discover UI propagates to
-- every engine with no code edit and no terminal. Editable from the
-- Discover page's "Industries & keywords" section.

CREATE TABLE IF NOT EXISTS job_hunt_sync_queries (
  industry TEXT PRIMARY KEY,        -- "Aerospace", "IT", ...
  queries  JSONB NOT NULL DEFAULT '[]'::jsonb,  -- short keyword queries
  enabled  BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_hunt_sync_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_hunt_sync_queries_select_authenticated" ON job_hunt_sync_queries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_hunt_sync_queries_all_service_role" ON job_hunt_sync_queries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed the defaults (the same lists the engines used hardcoded — now the
-- editable source of truth).
INSERT INTO job_hunt_sync_queries (industry, queries) VALUES
  ('Aerospace', '["aerospace engineer","aircraft maintenance","aviation","aeronautics"]'),
  ('IT', '["software engineer","full stack developer","machine learning","data engineer","backend developer"]'),
  ('Trucking', '["truck driver","dispatcher","logistics coordinator","freight"]'),
  ('Drone', '["drone operator","UAV","unmanned aerial","robotics engineer"]'),
  ('Business', '["business analyst","operations manager","project manager","account manager"]')
ON CONFLICT (industry) DO NOTHING;
