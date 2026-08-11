-- 114_mempalace_drawers.sql — MemPalace Phase 2 rollout (2026-08-11)
-- PRD: docs/PRD-graph-memory-live-brands.md, Work item B.
-- Verbatim per-message memory, one row per (chat_messages.id, role), idempotent.
-- wing = venture slug. GRAPH-BRAIN-DESIGN.md §6 Wings/Rooms/Drawers model.
-- Applied live via Supabase MCP against project cjjllgexiecesgwenpph on 2026-08-11 —
-- this file is the version-controlled record of that migration, not a pending one.

CREATE TABLE IF NOT EXISTS public.mempalace_drawers (
  id                 BIGSERIAL PRIMARY KEY,
  wing               TEXT NOT NULL,                    -- venture slug (novizio, hourbour, ...) — MemPalace "Wing" = brand/client graph
  room               TEXT NOT NULL DEFAULT 'chat',      -- department/topic subgraph within the wing (GRAPH-BRAIN-DESIGN.md §6); 'chat' for this rollout
  source_message_id  UUID NOT NULL,                     -- chat_messages.id this drawer was written from — the idempotency key
  room_id            UUID,                              -- chat_rooms.id, for RLS + traceability back to the conversation
  correlation        UUID,                              -- links to events.correlation for the same turn
  role               TEXT NOT NULL CHECK (role IN ('user','agent')),
  actor              TEXT,                              -- agent id/name when role='agent', else NULL
  content            TEXT NOT NULL,                     -- verbatim, never summarized at storage time (design doc invariant)
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_message_id, role)
);

CREATE INDEX IF NOT EXISTS idx_mempalace_drawers_wing_ts ON public.mempalace_drawers (wing, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mempalace_drawers_correlation ON public.mempalace_drawers (correlation);

COMMENT ON TABLE public.mempalace_drawers IS
  'MemPalace Phase 2 rollout (2026-08-11, PRD: docs/PRD-graph-memory-live-brands.md) — verbatim per-message memory, one row per (chat_messages.id, role), idempotent. wing = venture slug. GRAPH-BRAIN-DESIGN.md §6 Wings/Rooms/Drawers model.';

-- RLS: same shape as chat_messages (can_see_room), since writes happen from the
-- authenticated Next.js session (lib/supabase-server.ts, anon key + user cookie),
-- not a service-role key — unlike events, which is service-role-write-only.
ALTER TABLE public.mempalace_drawers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mempalace_drawers_insert ON public.mempalace_drawers;
CREATE POLICY mempalace_drawers_insert
  ON public.mempalace_drawers FOR INSERT TO public
  WITH CHECK (room_id IS NULL OR can_see_room(room_id));

DROP POLICY IF EXISTS mempalace_drawers_read ON public.mempalace_drawers;
CREATE POLICY mempalace_drawers_read
  ON public.mempalace_drawers FOR SELECT TO public
  USING (room_id IS NULL OR can_see_room(room_id));
