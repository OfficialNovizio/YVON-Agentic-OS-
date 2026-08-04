-- 052_events.sql
-- The event log — architecture doc §5.4. Append-only: never updated, never deleted.
-- One table, three jobs: audit trail, dashboard feed, debugging record.
--
-- Why append-only rather than a mutable `runs` table with status/ended_at:
--   · avoids failure mode #11 (lost update: two sequential writes, same row)
--   · carries context_id, so the dashboard's four scopes (§12.1) and execution
--     links (§12.3) work — a mutable runs table has nowhere to put it
--   · the same rows serve live glow AND history
--
-- `source` unifies the two runtimes that can execute an agent:
--   'hermes'      — the always-on VPS wrapper (chat turns today, workers later)
--   'claude-code' — compiled .claude/agents/ subagents
--   'yvon'        — system/scheduler emitted

CREATE TABLE IF NOT EXISTS events (
  id           BIGSERIAL   PRIMARY KEY,
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT        NOT NULL,              -- 'hermes' | 'claude-code' | 'yvon'
  context_id   TEXT        NOT NULL,              -- 'yvon-os' | 'novizio' | 'hourbour' | 'agentx' | 'agentx/<client>'
  kind         TEXT        NOT NULL,              -- 'run.started' | 'run.completed' | 'run.failed' | ...
  actor        TEXT,                              -- agent id (slug(dept)-name, e.g. 'engineering-mia') or 'system'
  payload      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  correlation  UUID                               -- links related events across one workflow
);

CREATE INDEX IF NOT EXISTS idx_events_context_ts ON events (context_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_correlation ON events (correlation);
CREATE INDEX IF NOT EXISTS idx_events_actor_ts    ON events (actor, ts DESC);

COMMENT ON TABLE events IS
  'Append-only event log (architecture §5.4). Audit trail + dashboard feed + debug record. '
  'Never UPDATE or DELETE rows — run lifecycle is expressed as successive kinds.';

-- ── RLS: browsers read (anon key + auth), only the VPS writes (service role) ──
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_read_authenticated ON events;
CREATE POLICY events_read_authenticated
  ON events FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS events_write_service ON events;
CREATE POLICY events_write_service
  ON events FOR INSERT TO service_role
  WITH CHECK (true);

-- ── Realtime: the dashboard subscribes to inserts (§6.4 — no polling) ────────
ALTER PUBLICATION supabase_realtime ADD TABLE events;
