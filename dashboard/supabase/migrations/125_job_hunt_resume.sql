-- 125_job_hunt_resume.sql
-- Job Hunt module, fifth artifact (2026-08-15): Resume + AI Analysis.
--
-- Schema adapted from the operator's own prior YVON-OS design
-- (024_career_dashboard.sql `resumes` table — also already present, unused,
-- in this very repo at app/api/jobs/resumes/route.ts, which references a
-- `resumes` table that was never migrated here). Simplified per operator
-- instruction 2026-08-15: one current resume, not a versioned vault — the
-- `version` column is kept (cheap, matches the source schema) but the UI
-- only ever shows/replaces the most recent row, no version picker.
--
-- Storage: private bucket (not YVON-OS's public bucket) — a resume is
-- personal data with no reason to be publicly fetchable by URL. Analysis
-- routes read the file server-side via the service-role client.

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "job_hunt_resumes_bucket_service" ON storage.objects;
CREATE POLICY "job_hunt_resumes_bucket_service"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'resumes') WITH CHECK (bucket_id = 'resumes');

CREATE TABLE IF NOT EXISTS resumes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  industry_tag  TEXT NOT NULL DEFAULT 'General',
  storage_path  TEXT NOT NULL,
  file_type     TEXT NOT NULL, -- 'application/pdf' | '...wordprocessingml.document'
  version       INT NOT NULL DEFAULT 1,
  analysis_json JSONB,         -- cached AI analysis output (ATS score, gaps, suggestions)
  analyzed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes (created_at DESC);

COMMENT ON TABLE resumes IS
  'Job Hunt Resume — operator''s resume file + cached AI analysis (ATS score, '
  'strengths/weaknesses, suggestions, extracted skills/education/experience). '
  'One current resume by convention (most recent row); schema keeps room for '
  'versioning if the operator wants a full vault later.';

DROP TRIGGER IF EXISTS trg_resumes_updated_at ON resumes;
CREATE TRIGGER trg_resumes_updated_at
  BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION job_hunt_touch_updated_at();

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS resumes_read_authenticated ON resumes;
CREATE POLICY resumes_read_authenticated
  ON resumes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS resumes_write_service ON resumes;
CREATE POLICY resumes_write_service
  ON resumes FOR ALL TO service_role USING (true) WITH CHECK (true);
