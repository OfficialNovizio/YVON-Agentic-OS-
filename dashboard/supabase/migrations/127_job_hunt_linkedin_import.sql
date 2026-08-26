-- 127_job_hunt_linkedin_import.sql
-- Job Hunt module, sixth artifact (2026-08-15): LinkedIn data-export import.
--
-- Explicitly NOT scraping. The operator downloads their own LinkedIn data
-- export ("Get a copy of your data" in LinkedIn Settings & Privacy) and
-- uploads that file here. Same single-current-file + private-bucket pattern
-- as resumes (migration 125).

INSERT INTO storage.buckets (id, name, public)
VALUES ('linkedin-imports', 'linkedin-imports', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "job_hunt_linkedin_imports_bucket_service" ON storage.objects;
CREATE POLICY "job_hunt_linkedin_imports_bucket_service"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'linkedin-imports') WITH CHECK (bucket_id = 'linkedin-imports');

CREATE TABLE IF NOT EXISTS linkedin_imports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path   TEXT NOT NULL,
  files_found    TEXT[] NOT NULL DEFAULT '{}',
  analysis_json  JSONB,
  analyzed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE linkedin_imports IS
  'Job Hunt LinkedIn import — operator''s own LinkedIn data-export ZIP '
  '("Get a copy of your data"), parsed for profile-relevant sections only '
  '(profile/positions/education/skills/certifications/organizations/'
  'volunteering) and cached AI analysis. NOT scraping — the operator '
  'downloads this file themselves; this table only stores it after the fact. '
  'One current import by convention, matching the resumes table.';

DROP TRIGGER IF EXISTS trg_linkedin_imports_updated_at ON linkedin_imports;
CREATE TRIGGER trg_linkedin_imports_updated_at
  BEFORE UPDATE ON linkedin_imports FOR EACH ROW EXECUTE FUNCTION job_hunt_touch_updated_at();

ALTER TABLE linkedin_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linkedin_imports_read_authenticated ON linkedin_imports;
CREATE POLICY linkedin_imports_read_authenticated
  ON linkedin_imports FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS linkedin_imports_write_service ON linkedin_imports;
CREATE POLICY linkedin_imports_write_service
  ON linkedin_imports FOR ALL TO service_role USING (true) WITH CHECK (true);
