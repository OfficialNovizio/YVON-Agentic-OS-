-- 119_venture_github_pat.sql — artifact 4 (trigger wiring), 2026-08-12.
-- Write-scoped GitHub PAT for the per-venture graphify/MemPalace push-back
-- pipeline (migration 118's venture_graphs/venture_repo_knowledge). This is
-- a DIFFERENT, higher-trust credential than the read-only GITHUB_PAT already
-- configured on the VPS for chat's repo-mode clone (main.py's
-- _ensure_repo_clone) — that one is read-only and shared across all
-- ventures; this one is per-venture and needs Contents: Read and write.
--
-- Deliberately NOT added to any "safe select" column list in the dashboard
-- (dashboard/lib/db/ventures.ts's SAFE_SELECT / mapVentureRow) — that list
-- feeds straight into GET /api/ventures, which the browser reads via
-- WorkspaceContext. This column is read/written only through
-- dashboard/lib/db/venture-graphify.ts, a separate server-only module that
-- never returns it in an HTTP response body.
--
-- Known caveat, not fixed here (pre-existing, flagged separately): the
-- `ventures` table has RLS disabled, same as ~50 other tables in this DB.
-- This column inherits that exposure at the Postgres level even though the
-- app-layer code path above never leaks it. A follow-up to enable RLS on
-- `ventures` would close this properly.
--
-- Applied live via Supabase MCP on 2026-08-12; this file is the git record
-- of that migration (see CLAUDE.md's recurring "migration tracked in git but
-- never applied" bug pattern — this is the inverse: applied live, now
-- backfilled into git so a future `list_migrations` / fresh-DB bootstrap
-- stays in sync).

alter table public.ventures add column if not exists github_pat text;

comment on column public.ventures.github_pat is
  'Write-scoped GitHub PAT (Contents: Read and write) for the per-venture graphify push-back pipeline. NOT included in any client-facing select — see dashboard/lib/db/venture-graphify.ts. 2026-08-12.';
