-- 019_intelligence_system.sql
-- Adds the automated intelligence loop: department reports → synthesis → proposals.
-- Safe to run on an already-migrated database — IF NOT EXISTS / ADD COLUMN IF NOT NULL are idempotent.

-- ─── 1. Department Reports ───────────────────────────────────────────────────────
-- Append-only. Each analytics/marketing/competitor cron run writes one row.
-- Stored as JSONB because schemas differ by report_type.

CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id      TEXT NOT NULL,
  report_type     TEXT NOT NULL CHECK (report_type IN ('analytics','marketing','competitor')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  data            JSONB NOT NULL,
  anomalies       JSONB,
  report_number   INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_venture_type
  ON reports(venture_id, report_type, created_at DESC);

-- Auto-increment report_number per (venture, type)
CREATE OR REPLACE FUNCTION reports_number_assign()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(report_number), 0) + 1
    INTO NEW.report_number
    FROM reports
    WHERE venture_id = NEW.venture_id AND report_type = NEW.report_type;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reports_number_trigger ON reports;
CREATE TRIGGER reports_number_trigger
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION reports_number_assign();

-- ─── 2. Intelligence Batches ─────────────────────────────────────────────────────
-- Each synthesis run creates one batch referencing the source reports.

CREATE TABLE IF NOT EXISTS intelligence_batches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id      TEXT NOT NULL,
  batch_number    INTEGER NOT NULL,
  analytics_id    UUID REFERENCES reports(id) ON DELETE SET NULL,
  marketing_id    UUID REFERENCES reports(id) ON DELETE SET NULL,
  competitor_id   UUID REFERENCES reports(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'generating'
                    CHECK (status IN ('generating','complete','failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venture_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_intel_batches_venture
  ON intelligence_batches(venture_id, created_at DESC);

-- ─── 3. Content Pitches — 5 ranked proposals per intelligence batch ────────────

CREATE TABLE IF NOT EXISTS content_pitches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id          TEXT NOT NULL,
  batch_id            UUID REFERENCES intelligence_batches(id) ON DELETE SET NULL,
  rank                INTEGER NOT NULL,
  platform            TEXT NOT NULL,
  format              TEXT NOT NULL,
  category            TEXT NOT NULL
    CHECK (category IN ('competitor_gap','unclaimed_territory','blue_ocean')),
  intelligence_source TEXT,
  our_move            TEXT NOT NULL,
  hook_a              TEXT NOT NULL,
  hook_b              TEXT NOT NULL,
  lever_primary       TEXT NOT NULL,
  lever_a             TEXT NOT NULL,
  lever_b             TEXT NOT NULL,
  psychology_score    INTEGER,
  system1_score_a     INTEGER,
  system1_score_b     INTEGER,
  run_recommendation  TEXT CHECK (run_recommendation IN ('A','B')),
  market_effect       TEXT,
  vs_current          TEXT,
  viral_mechanism     TEXT,
  full_proposal       JSONB,
  status              TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','drafted','deployed','passed')),
  strategy_log_id     UUID,
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pitches_venture
  ON content_pitches(venture_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pitches_status
  ON content_pitches(venture_id, status);
CREATE INDEX IF NOT EXISTS idx_content_pitches_batch
  ON content_pitches(batch_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────────

ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reports_service_all              ON reports;
DROP POLICY IF EXISTS intelligence_batches_service_all ON intelligence_batches;
CREATE POLICY reports_service_all              ON reports              FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY intelligence_batches_service_all ON intelligence_batches FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE reports              IS 'Append-only. One row per cron cycle per report_type (analytics|marketing|competitor)';
COMMENT ON TABLE intelligence_batches IS 'One row per intelligence synthesis run — references source reports';
