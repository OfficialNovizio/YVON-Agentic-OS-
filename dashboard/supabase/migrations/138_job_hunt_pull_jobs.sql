-- 138_job_hunt_pull_jobs.sql
-- Job Hunt — persisted pull progress (2026-08-25).
-- Pull jobs run in the dev-server process and died on every restart ("job
-- lost"). This table keeps the progress (steps, per-source counts, log,
-- final status) so the UI can recover what happened after a restart — the
-- boards/ssh layer result included. Best-effort writes from pull-job.ts.

CREATE TABLE IF NOT EXISTS job_hunt_pull_jobs (
  id           TEXT PRIMARY KEY,
  status       TEXT NOT NULL DEFAULT 'running',   -- running | done | error | cancelled
  mode         TEXT NOT NULL DEFAULT 'deep',
  steps_done   INT NOT NULL DEFAULT 0,
  steps_total  INT NOT NULL DEFAULT 0,
  per_source   JSONB NOT NULL DEFAULT '{}'::jsonb,
  log          JSONB NOT NULL DEFAULT '[]'::jsonb,
  error        TEXT,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ
);

ALTER TABLE job_hunt_pull_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_hunt_pull_jobs_select_authenticated" ON job_hunt_pull_jobs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_hunt_pull_jobs_all_service_role" ON job_hunt_pull_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
