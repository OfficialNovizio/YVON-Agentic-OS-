-- 111_venture_agents_and_tier.sql
-- Discussed and confirmed with the operator 2026-08-09 before applying (backfill-all-46 +
-- auto-sync approach; tier added in the same pass; no runtime enforcement wired yet).
--
-- venture_agents: proposed in docs/YVON-GRAPH.md §1.3/Appendix A ("the one genuinely new
-- table") but never actually created until now. Records which agents a venture has access to.
-- agent_id MUST equal a structure.json agent id (dept-slug-agent-name, e.g. 'brand-studio-atlas')
-- — verified live structure.json uses exactly this format, 46 ids.
--
-- ventures.tier: GRAPH-BRAIN-DESIGN.md §21.4/§21.5's service/concurrency tier
-- (internal/enterprise/pro/free) — distinct from the existing brand_tier column
-- (040_brand_tier.sql), which is a market-positioning concept, not access/concurrency.
--
-- Backfill: Novizio (kind='core') granted all 46 real agents (enabled=true) and set
-- tier='internal' — it's the operator's own primary brand. Kept in sync going forward via
-- src/cie/sources/venture-agents.ts's syncVentureAgents(), which reads the live structure.json
-- roster every call rather than a hardcoded list — re-running it is the entire "stay current as
-- new agents are added" mechanism the operator asked for.
--
-- Applied live via the Supabase MCP 2026-08-09 (migration name: venture_agents_and_tier, backfill
-- via a follow-up execute_sql call), verified after the fact: 46 rows for novizio, RLS enabled,
-- tier='internal'.

CREATE TABLE IF NOT EXISTS venture_agents (
  venture_slug TEXT NOT NULL REFERENCES ventures(slug) ON DELETE CASCADE,
  agent_id     TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  config       JSONB NOT NULL DEFAULT '{}'::jsonb,
  granted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by   TEXT,
  PRIMARY KEY (venture_slug, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_venture_agents_slug ON venture_agents (venture_slug);

COMMENT ON TABLE venture_agents IS
  'Per-venture agent access grants (GRAPH-BRAIN-DESIGN.md §16.3/§23.3). One row per (venture, '
  'agent) pair. For kind=core ventures, kept in sync with the real agent roster automatically '
  '(src/cie/sources/venture-agents.ts syncVentureAgents()) rather than requiring manual grants '
  'every time a new agent is added to Teams/.';

ALTER TABLE venture_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS venture_agents_read_authenticated ON venture_agents;
CREATE POLICY venture_agents_read_authenticated
  ON venture_agents FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS venture_agents_write_service ON venture_agents;
CREATE POLICY venture_agents_write_service
  ON venture_agents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('internal','enterprise','pro','free'));

UPDATE ventures SET tier = 'internal' WHERE slug = 'novizio';

COMMENT ON COLUMN ventures.tier IS
  'Service/concurrency tier per §21.4 (max_concurrent_per_tier) and §21.5 (priority lanes) — '
  'internal=priority 0, enterprise=1, pro=2, free=3. Distinct from brand_tier (market '
  'positioning, unrelated concept, do not conflate).';

-- Backfill (run once here for the record; the live database already has this applied):
-- INSERT INTO venture_agents (venture_slug, agent_id, enabled, granted_by)
-- SELECT 'novizio', agent_id, true, 'initial backfill 2026-08-09 (46 real agents from structure.json)'
-- FROM (VALUES ('ai-agents-anneal'), ...) AS roster(agent_id)  -- see syncVentureAgents() for the live list
-- ON CONFLICT (venture_slug, agent_id) DO NOTHING;
