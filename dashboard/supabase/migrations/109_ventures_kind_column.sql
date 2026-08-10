-- 109_ventures_kind_column.sql
-- New column — not backfilled by any prior migration. GRAPH-BRAIN-DESIGN.md §23.3
-- ("Tiers as agent lists") and §25.1 (staged rollout rings, "ventures.kind (core/venture/client)
-- makes ring membership queryable") both reference `ventures.kind` as if it already existed;
-- it never did. Added 2026-08-09 to unblock §8.3's cross-scope bridge query, which needs to
-- distinguish an owned sibling brand (bridges freely) from a client tenant (Master-mediated
-- only, per §0 Principle 1) before it can decide who to bridge to.

ALTER TABLE ventures
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'venture' CHECK (kind IN ('core','venture','client'));

-- Backfill: Novizio is the operator's own primary brand, not a second owned brand or a client.
UPDATE ventures SET kind = 'core' WHERE slug = 'novizio';

COMMENT ON COLUMN ventures.kind IS
  'core = operator''s own primary brand | venture = other owned brand | client = external tenant. Determines §8.3 cross-scope bridge eligibility (core/venture bridge to each other; client is Master-mediated only) and §25.1 staged-rollout ring membership.';

-- Applied live via Supabase MCP apply_migration 2026-08-09 (name: ventures_kind_column).
