-- 112_context_graph_columns.sql
-- docs/YVON-GRAPH.md §1.2 / Appendix A ("054_context_graph.sql", never applied — renumbered
-- into sequence here, applied live via the Supabase MCP 2026-08-09 after discussing both open
-- decisions with the operator).
--
-- Two things this migration does, both confirmed with the operator first:
--
-- 1. Adds the five remaining `ventures` context-graph columns Appendix A proposed and this
--    session had not yet built: parent_id (one-level nesting), context_path (the
--    events.context_id join key — cannot be a GENERATED column since it reads another row for
--    the parent case, so it's a BEFORE INSERT/UPDATE trigger instead, per Appendix B's retired-
--    decision note), guardrails (JSONB per-context policy, no runtime enforcement wired yet),
--    credentials_ref (TEXT vault key name — never a secret itself, points at whatever
--    036_app_secrets_vault.sql sets up), sort_order (INT, unused by any query yet).
--    `kind`/`status`/`tier` already exist with matching CHECK constraints (migrations 109/014/111)
--    — verified live before writing this file, not re-added.
--
-- 2. Re-centers the graph per the operator's explicit instruction ("Always YVON is core... change
--    novizio core to yvon"): inserts a new 'yvon-os' row as kind='core' (the platform / graph
--    center, per §1.2/§2's design — was missing; this session had instead marked novizio itself
--    kind='core' in migration 109, which the operator asked to correct) and demotes novizio to
--    kind='venture' (a real brand orbiting the center, not the center itself).
--
--    Practical effect on what this session already built: src/cie/sources/venture-agents.ts's
--    syncVentureAgents() only grants the live 46-agent roster to kind='core' ventures. After this
--    migration that's yvon-os, not novizio — so this migration also inserts the same 46 grants for
--    yvon-os directly (mirroring the migration-111 backfill logic exactly: same roster, same
--    ON CONFLICT DO NOTHING idempotency). Novizio's existing 46 grant rows are left untouched —
--    they're now an ordinary venture-level grant set (a legitimate onboarding decision for a
--    'venture'-kind tenant per §23.3), not the auto-synced set. Nothing is deleted.

-- ── 1. Context columns ──────────────────────────────────────────────────────
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS parent_id       UUID REFERENCES ventures(id) ON DELETE RESTRICT;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS context_path    TEXT;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS guardrails      JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS credentials_ref TEXT;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS sort_order      INT;

COMMENT ON COLUMN ventures.parent_id IS
  'One level of nesting only (ventures_depth_guard trigger). NULL for top-level contexts '
  '(yvon-os, novizio today).';
COMMENT ON COLUMN ventures.context_path IS
  'events.context_id join key (YVON-GRAPH.md §6.1). slug for top-level rows, '
  'parent.slug/slug for nested rows. Maintained by trg_ventures_context_path — never set by hand.';
COMMENT ON COLUMN ventures.guardrails IS
  'Per-context policy (§1.2). No runtime enforcement reads this yet — schema only.';
COMMENT ON COLUMN ventures.credentials_ref IS
  'Vault key name (036_app_secrets_vault.sql), never a secret value itself. Unset today.';

-- Nesting is exactly one level: a context with a parent may not itself be a parent.
CREATE OR REPLACE FUNCTION ventures_depth_guard() RETURNS trigger AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM ventures WHERE id = NEW.parent_id AND parent_id IS NOT NULL)
  THEN RAISE EXCEPTION 'context nesting is limited to one level';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- ── 2. context_path — trigger, not GENERATED (cross-row parent lookup) ──────
CREATE OR REPLACE FUNCTION ventures_set_context_path() RETURNS trigger AS $$
DECLARE parent_slug TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.context_path := NEW.slug;
  ELSE
    SELECT slug INTO parent_slug FROM ventures WHERE id = NEW.parent_id;
    NEW.context_path := parent_slug || '/' || NEW.slug;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ventures_context_path ON ventures;
CREATE TRIGGER trg_ventures_context_path
  BEFORE INSERT OR UPDATE OF slug, parent_id ON ventures
  FOR EACH ROW EXECUTE FUNCTION ventures_set_context_path();

DROP TRIGGER IF EXISTS trg_ventures_depth ON ventures;
CREATE TRIGGER trg_ventures_depth
  BEFORE INSERT OR UPDATE OF parent_id ON ventures
  FOR EACH ROW EXECUTE FUNCTION ventures_depth_guard();

UPDATE ventures SET context_path = slug WHERE context_path IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ventures_context_path_key ON ventures (context_path);
CREATE INDEX        IF NOT EXISTS ventures_parent_idx       ON ventures (parent_id);

-- ── 3. Re-center: yvon-os becomes the one kind='core' row ───────────────────
INSERT INTO ventures (name, slug, kind, status, color)
VALUES ('YVON', 'yvon-os', 'core', 'active', '#8E7BF0')
ON CONFLICT (slug) DO UPDATE SET kind = 'core';

UPDATE ventures SET kind = 'venture' WHERE slug = 'novizio' AND kind = 'core';

-- ── 4. Carry the auto-synced 46-agent grant set to the new core row ─────────
-- Mirrors migration 111's backfill exactly (same roster, same idempotency). Novizio's existing
-- grants are untouched — see header note.
INSERT INTO venture_agents (venture_slug, agent_id, enabled, granted_by)
SELECT 'yvon-os', agent_id, true, 'migration 112 (re-center core row from novizio to yvon-os)'
FROM venture_agents WHERE venture_slug = 'novizio'
ON CONFLICT (venture_slug, agent_id) DO NOTHING;

-- ── 5. Fix tier default on the new row ───────────────────────────────────────
-- The INSERT above didn't specify tier, so yvon-os took the column DEFAULT ('free' — lowest
-- priority per §21.4/§21.5). Wrong for the platform's own core row: it must never queue behind
-- client tenants. Caught and fixed live 2026-08-09 right after applying; folded in here so the
-- migration file matches what actually exists.
UPDATE ventures SET tier = 'internal' WHERE slug = 'yvon-os';
