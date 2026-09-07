# CLAUDE.md — app/api/

> Parent rules: see `/YVON/app/CLAUDE.md` → `/YVON/CLAUDE.md` → `/Projects/CLAUDE.md`.

## What this folder is

All Next.js Route Handlers live here. These run **server-side only** — they are the only place API keys are permitted. The browser never calls external services directly; it always goes through these routes.

## Routes

| Folder | Method | External service | Auth env var |
|--------|--------|-----------------|-------------|
| `claude/` | POST | Anthropic API — streams SSE | `ANTHROPIC_API_KEY` |
| `instagram/graph/`, `instagram/insights` | GET, POST | Facebook Graph API (OAuth + Business insights) | `FACEBOOK_GRAPH_TOKEN` (Vault) |
| `linkedin/{callback,me,publish}` | GET, POST | LinkedIn OAuth + publishing | Vault tokens |
| `youtube/` | POST | YouTube Data API v3 | `YOUTUBE_API_KEY` |
| `analytics/` | GET | Google Analytics Data API | `GOOGLE_SA_JSON`, `GA4_PROPERTY_ID` |
| `session-sync/` | GET, POST | Supabase `agent_sessions` + GitHub Contents API | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN`, `YVON_GITHUB_OWNER`, `YVON_GITHUB_REPO` |

> **Apify routes removed 2026-09-07** (operator decision — Apify decommissioned):
> the old `instagram/` POST, `linkedin/` POST, `scrape/`, `trending/`, `calendar-verify/`,
> `competitor-bulk/` routes and `lib/apify.ts` are gone. `social-stats` and
> `manual-competitor`/`competitor-refresh` survive cache-only / with POST retired
> (501). Site reference capture is repo-local now: `scripts/capture-reference.py`
> (+ `capture-worker.py` relay) — see `Teams/Shared OS/tools/shared-tool-registry.md`.

## Shared conventions for every route

1. **Check env vars first** — return `500` immediately if required keys are missing.
2. **Validate inputs** — return `400` for missing/malformed request body before calling any external service.
3. **Error shape** — always return `{ error: string }` JSON on failure, never throw unhandled.
4. **No `any` types** — type the request body with an inline interface or import from `@/lib/types`.
5. **Lib layer** — business logic (API calls, polling, data mapping) lives in `@/lib/`, not inline in `route.ts`.
