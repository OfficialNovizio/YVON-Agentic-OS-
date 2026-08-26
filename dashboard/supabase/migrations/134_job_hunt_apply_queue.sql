-- 134_job_hunt_apply_queue.sql
-- Job Hunt — Apply Hub (2026-08-25). The board of jobs ready to apply:
-- add/drop freely, each row bound to a resume variant + cover letter +
-- status. Nothing sends or submits — applying always happens on the real
-- site by the operator; this tracks and prepares.

CREATE TABLE IF NOT EXISTS job_hunt_apply_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id    UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  resume_variant TEXT NOT NULL DEFAULT 'default',   -- sector key from job_hunt_sync_queries, or 'default'
  cover_letter  TEXT,                               -- generated cover letter text (draft)
  status        TEXT NOT NULL DEFAULT 'prepared'
                CHECK (status IN ('prepared', 'reviewing', 'applied', 'interview', 'offer', 'rejected')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (posting_id)
);

ALTER TABLE job_hunt_apply_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_hunt_apply_queue_select_authenticated" ON job_hunt_apply_queue
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_hunt_apply_queue_all_service_role" ON job_hunt_apply_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_apply_queue_status ON job_hunt_apply_queue (status);
