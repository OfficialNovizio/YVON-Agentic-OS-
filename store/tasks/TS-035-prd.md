# TS-035 · PRD — Repo file browser + live preview links in /chat

> Transcribed 2026-08-24 (E2 backfill) from the record's own source_message,
> discovery decisions, and work-item acceptance criteria — no new content
> invented. The record itself documents that it was hand-authored
> retroactively for work already built in the 2026-08-21 Cowork session.

## 1 · Problem
The operator asked: whenever any new work is done, give me **2 new URLs to view** — one for the repo files, one for the localhost-type project of that feature. Today those links don't exist; chat turns that change code give no way to look at what changed.

## 2 · Proposal
Repo files = a real in-app browser over the live per-venture VPS checkout (`REPO_WORKSPACES_DIR`, `_ensure_repo_clone`), not a GitHub redirect. Preview = an actually-running dev server (not deferred). Trigger = once per chat room, only on a turn that really changed the repo, via a server-side git-state fingerprint (HEAD + dirty tree), gated to once per room by `chat_rooms.repo_links_shown_at`. Routing = subdomain-per-venture (`<slug>.preview.yvon.in`) — operator's pick.

## 3 · Working agents
- **Claude (Cowork session)** — doer: `main.py` endpoints + dashboard wiring + browser page
- **Stark (operator)** — WI-4 one-time infra: wildcard DNS, nginx, wildcard TLS
- **quinn** — verification (py_compile, sandboxing, auth checks)

## 4 · Departments
Engineering (VPS + dashboard).

## 5 · Constraints
- All three `/v1/repo/*` endpoints gated behind the existing `require_bearer` dependency (same as every `/v1` route).
- Path traversal explicitly rejected in `_read_repo_file` (realpath check).
- Link injection is best-effort — a failure never breaks the underlying chat turn.
- Preview subdomain access control beyond slug obscurity: **flagged, not resolved** (record's own security_review note).

## 6 · Acceptance criteria
1. `python3 -m py_compile main.py` clean
2. `/v1/repo/tree` and `/v1/repo/file` sandboxed to the venture's workdir (realpath check, no path traversal)
3. `/v1/repo/preview` starts a dev server only for recognized project types (package.json dev/start script, or manage.py) and reports a clear error otherwise
4. Migration applied live via Supabase MCP (`chat_rooms.repo_links_shown_at`) — done 2026-08-21
5. Links appended to the SAME turn's streamed response, not just the saved DB row
6. A failure in link injection never breaks the underlying chat turn
7. GET routes require an authenticated Supabase user, same as `stream/route.ts`
8. Page renders a filterable file list + content viewer with no new heavy dependency
9. `https://<any-venture-slug>.preview.yvon.in/` resolves and TLS validates (WI-4, not yet done as of authoring)

## 7 · Context refs
- `vps-scripts/yvon-hermes-http/main.py` — `_ensure_repo_clone` / `REPO_WORKSPACES_DIR`
- `dashboard/app/api/chat/stream/route.ts` — SSE handling
- `dashboard/lib/hermes-client.ts` — `streamHermesChat` / `HermesEvent`

## 8 · RICE
**0 — unranked** — no `scripts/rice.py` run (reasoning-based, not formula-verified). [backlog-rules rule 0.6]
