-- 133_job_hunt_ircc_pr.sql
-- Job Hunt — PR Intelligence (2026-08-25). IRCC rules + PR-aware job data.
--
-- ircc_rules: nightly Agent-Reach fetch of IRCC pages → topic/text/url/fetched_at.
--   Informational only — every row carries its source + fetched date; the UI
--   shows "as of <date>, see source" and it is never legal advice.
-- job_postings PR columns: TEER category + Canadian-experience eligibility +
--   BC-PNP in-demand flag, inferred best-effort from title/description; the
--   "PR value" ranking uses these. All NULL until inferred.

CREATE TABLE IF NOT EXISTS ircc_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       TEXT NOT NULL,             -- 'express-entry', 'cec', 'bc-pnp', 'teer', 'crs', ...
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  source_url  TEXT NOT NULL,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topic, source_url)
);

ALTER TABLE ircc_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ircc_rules_select_authenticated" ON ircc_rules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ircc_rules_all_service_role" ON ircc_rules
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS teer_category   TEXT,
  ADD COLUMN IF NOT EXISTS canadian_exp    BOOLEAN,
  ADD COLUMN IF NOT EXISTS bc_pnp_indemand BOOLEAN;

CREATE INDEX IF NOT EXISTS idx_job_postings_teer ON job_postings (teer_category);
CREATE INDEX IF NOT EXISTS idx_job_postings_bc_pnp ON job_postings (bc_pnp_indemand);
