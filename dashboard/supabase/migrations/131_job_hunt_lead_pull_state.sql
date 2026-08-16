-- 131_job_hunt_lead_pull_state.sql
-- Job Hunt module (2026-08-15): singleton cursor row so the automatic
-- OrgBook BC lead-pull cron (/api/job-hunt/companies/leads/cron) knows
-- where it left off between invocations. One keyword's full pagination is
-- processed per tick (bounded, ~3-4s in practice, well inside any Vercel
-- plan's function timeout), then the cursor advances to the next keyword
-- and wraps around after the last one — so it runs forever, continuously
-- refreshing, with zero manual action once the cron entry in vercel.json
-- is deployed.

CREATE TABLE IF NOT EXISTS company_lead_pull_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
  keyword_index INTEGER NOT NULL DEFAULT 0,
  next_url TEXT,               -- OrgBook pagination URL to resume from, or NULL to start the current keyword fresh
  last_run_at TIMESTAMPTZ,
  last_result TEXT,            -- short human-readable summary of the last tick, for debugging
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO company_lead_pull_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE company_lead_pull_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_lead_pull_state_select_authenticated" ON company_lead_pull_state
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "company_lead_pull_state_all_service_role" ON company_lead_pull_state
  FOR ALL TO service_role USING (true) WITH CHECK (true);
