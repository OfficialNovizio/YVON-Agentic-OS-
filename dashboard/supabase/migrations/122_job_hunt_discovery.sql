-- 122_job_hunt_discovery.sql
-- Job Hunt module, second artifact (2026-08-15): Job Discovery.
--
-- Sources adapted from real, verified endpoints:
--   - Adzuna (api.adzuna.com) — free tier, 1,000 calls/month, needs app_id+app_key
--   - RemoteOK (remoteok.com/api), Remotive (remotive.com/api/remote-jobs),
--     Arbeitnow (arbeitnow.com/api/job-board-api) — free, no key, verified live
--   - Greenhouse public boards API (boards-api.greenhouse.io/v1/boards/{slug}/jobs)
--     — company slug list seeded from santifer/career-ops' real
--     templates/portals.example.yml tracked_companies (MIT-licensed, pulled not
--     invented), trimmed to companies with a live public Greenhouse API and
--     de-scoped from that file's AI-specific title filter — the slug list is
--     reusable for any role, the keyword filtering is the operator's own profile.
--   - freehire.dev public API (freehire.dev/api/v1/jobs) — verified live,
--     the same public REST API MadsLorentzen/ai-job-search's freehire-search
--     skill wraps in its CLI; called directly here rather than porting the CLI.
--   - LinkedIn explicitly NOT included — both source repos flag automated
--     access as against LinkedIn's ToS; the operator's own instruction was
--     never touch my account / zero ban risk, so this source is skipped.

CREATE TABLE IF NOT EXISTS job_postings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL,
  external_id   TEXT NOT NULL,
  title         TEXT NOT NULL,
  company       TEXT NOT NULL,
  location      TEXT,
  remote        BOOLEAN,
  url           TEXT NOT NULL,
  description   TEXT,
  salary_min    NUMERIC,
  salary_max    NUMERIC,
  salary_currency TEXT,
  posted_at     TIMESTAMPTZ,
  raw           JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Doubles as the future application tracker's status column (Job Hunt
  -- artifact 4) so postings don't need a schema change when that ships.
  status        TEXT NOT NULL DEFAULT 'discovered'
                CHECK (status IN ('discovered','queued','applied','interview','offer','rejected','archived')),
  fit_score     NUMERIC,

  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_discovered_at ON job_postings (discovered_at DESC);

COMMENT ON TABLE job_postings IS
  'Job Hunt module — discovered postings, deduped by (source, external_id). '
  'status column doubles as the application tracker (artifact 4). Never '
  'auto-applies; status only advances past discovered/queued via an operator '
  'action, per operator instruction 2026-08-15.';

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_postings_read_authenticated ON job_postings;
CREATE POLICY job_postings_read_authenticated
  ON job_postings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS job_postings_write_service ON job_postings;
CREATE POLICY job_postings_write_service
  ON job_postings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Per-source API credentials (currently just Adzuna's app_id/app_key). Same
-- shape as ai_provider_keys (016/115): service-role only, never exposed
-- plaintext to the browser.
CREATE TABLE IF NOT EXISTS job_hunt_source_keys (
  source      TEXT PRIMARY KEY,
  config      JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE job_hunt_source_keys IS
  'Job Hunt discovery source credentials (e.g. source=''adzuna'', config={"app_id":"...","app_key":"..."}). '
  'Sources with no key requirement (RemoteOK, Remotive, Arbeitnow, freehire, Greenhouse) never need a row here.';

ALTER TABLE job_hunt_source_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_hunt_source_keys_write_service ON job_hunt_source_keys;
CREATE POLICY job_hunt_source_keys_write_service
  ON job_hunt_source_keys FOR ALL TO service_role
  USING (true) WITH CHECK (true);
