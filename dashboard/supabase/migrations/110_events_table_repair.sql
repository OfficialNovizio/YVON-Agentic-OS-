-- 110_events_table_repair.sql
-- Repairs drift discovered 2026-08-09 (third confirmed instance this session, after
-- 108_ventures_schema_repair.sql's columns and the RLS gap noted in GRAPH-BRAIN-DESIGN.md
-- §23.1): migration 052_events.sql was listed as applied in the Supabase migration ledger for
-- project cjjllgexiecesgwenpph, but the live `events` table did not exist at all — confirmed via
-- a direct information_schema query before this fix.
--
-- Concrete impact: vps-scripts/yvon-hermes-http/events.py's emit() posts to /rest/v1/events on
-- every Hermes run (run.started/run.completed/run.failed, phase.classify, phase.resolve,
-- tool.call). Every one of those calls has been silently failing since the wrapper was written —
-- caught by a deliberate broad `except Exception` ("never let telemetry break a run"), so the
-- failure produced no visible error anywhere. The event log, the dashboard's live-activity feed,
-- and the audit trail have been getting zero real data as a result.
--
-- Re-running the original 052_events.sql statements verbatim, idempotently. Applied live via the
-- Supabase MCP 2026-08-09 (name: events_table_repair), verified after the fact — table exists,
-- RLS enabled, both policies present, 0 rows (expected: nothing has successfully written to it
-- until now).

CREATE TABLE IF NOT EXISTS events (
  id           BIGSERIAL   PRIMARY KEY,
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT        NOT NULL,              -- 'hermes' | 'claude-code' | 'yvon'
  context_id   TEXT        NOT NULL,              -- 'yvon-os' | 'novizio' | 'hourbour' | 'agentx' | 'agentx/<client>'
  kind         TEXT        NOT NULL,              -- 'run.started' | 'run.completed' | 'run.failed' | ...
  actor        TEXT,                              -- agent id (slug(dept)-name) or 'system'
  payload      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  correlation  UUID
);

CREATE INDEX IF NOT EXISTS idx_events_context_ts ON events (context_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_correlation ON events (correlation);
CREATE INDEX IF NOT EXISTS idx_events_actor_ts    ON events (actor, ts DESC);

COMMENT ON TABLE events IS
  'Append-only event log (architecture §5.4). Audit trail + dashboard feed + debug record. '
  'Never UPDATE or DELETE rows — run lifecycle is expressed as successive kinds.';

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_read_authenticated ON events;
CREATE POLICY events_read_authenticated
  ON events FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS events_write_service ON events;
CREATE POLICY events_write_service
  ON events FOR INSERT TO service_role
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE events;
