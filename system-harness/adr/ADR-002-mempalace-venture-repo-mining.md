# ADR-002: MemPalace venture-repo mining — narrow, ephemeral exception to ADR-001's Phase 2 gate

**Status:** accepted · **Date:** 2026-08-12 · **Deciders:** operator (direct decision via
AskUserQuestion during the client-onboarding pipeline build) · **Supersedes:** — (extends
ADR-001, does not overturn it)

## Context

The client-onboarding pipeline (artifacts 1–4, built 2026-08-12: `venture_graphs` /
`venture_repo_knowledge` tables, `graphify-venture.sh`, the `ventures.github_pat` column, and the
`/v1/venture/graphify` trigger) needs a semantic-knowledge half to go alongside graphify's
structural half — "what does this module do and why," not just "what calls what." The
`graphify-venture.sh` README placeholder already anticipated a `knowledge/` folder for this
("semantic knowledge extracted from this repo (MemPalace)"), written the same day as this ADR.

ADR-001 (2026-08-09) adopted the real `mempalace` package for episodic/conversational memory, but
explicitly staged it: Phase 1 (ephemeral per-Claude-Code-session installs, no VPS-resident
service) now, Phase 2 (`mempalace serve`, VPS-resident, shared multi-consumer) deferred until
`MASTER-PLAN.md` P9 — reasoning being "the only current consumer... is agent dev work done through
Claude Code... a resident service has no consumer to justify it yet." That premise no longer holds
for this specific feature: the venture-onboarding pipeline is a real, VPS-triggered consumer that
didn't exist when ADR-001 was written.

The question wasn't "keep Phase 2 deferred or not" — it's narrower: does *this one pipeline*
need a persistent `mempalace serve` HTTP/MCP service, or can it reuse Phase 1's ephemeral
architecture (CLI installed once, invoked per build) just triggered from a different place (a VPS
script instead of a Claude Code session)? The operator was asked directly (two options presented
via AskUserQuestion: custom in-house LLM-summarization script vs. installing the real `mempalace`
package on the VPS) and chose the real package.

## Options considered

1. **Custom in-house LLM-summarization script.** Clone the repo, walk files, summarize with the
   same OpenAI key pattern `strix-agent` already uses, write to a new bespoke table parallel to
   `mempalace_drawers`. Pros: no VPS install, no ADR conflict, ships immediately. Cons: doesn't use
   the tool the rest of the system has already standardized on (wings/rooms/drawers vocabulary,
   temporal KG, `mempalace search`/`wake-up` recall surface) — would produce a second, parallel,
   less capable memory system for repos instead of one palace queryable the same way for chat and
   code.
2. **Install the real `mempalace` package on the VPS, ephemeral-per-build (chosen).** Verified in
   a sandbox this session: `pip install mempalace` (v3.7.0) works cleanly; `mempalace mine <dir>`
   is a first-class, documented ingest mode explicitly for "code, docs, notes" (its own top-level
   `--help` leads with `mempalace mine ~/projects/my_app` as the flagship example) — not a
   repurposed conversational-memory tool, contrary to this ADR's own earlier concern before
   verifying. Pluggable `pgvector` backend (`MEMPALACE_BACKEND=pgvector`,
   `MEMPALACE_PGVECTOR_DSN`, `MEMPALACE_PGVECTOR_NAMESPACE`) matches ADR-001's existing choice —
   same Supabase Postgres instance, namespaced `venture-<slug>` per venture (parallel to
   `wing=<slug>` already used by the chat-side table). Does NOT require standing up `mempalace
   serve` — a per-invocation CLI call from `mempalace-venture.sh`, same shape as Phase 1's
   per-session install, just triggered by the VPS instead of a Claude Code session.
3. **Full Phase 2 (`mempalace serve`) now.** Rejected as unnecessary for this feature — nothing
   here needs a long-lived shared HTTP/MCP service; a per-build CLI invocation is sufficient and
   strictly less infrastructure to operate. Phase 2 remains deferred to `MASTER-PLAN.md` P9 for the
   *live pipeline-wiring* use case (CLASSIFY/RETRIEVE calling MemPalace during a chat turn), which
   this ADR does not touch.

## Decision

**Option 2** — install `mempalace[pgvector]` in a dedicated VPS venv
(`/opt/yvon-tools/venvs/mempalace`, mirroring the `turbovec` venv convention ADR-001 already
established) and invoke `mempalace mine` per venture build from `mempalace-venture.sh`, sharing
Phase 1's pgvector-on-Supabase backend with a per-venture namespace. This is a narrow, additive
exception to ADR-001's Phase 2 gate — it does not stand up `mempalace serve`, does not change the
Phase 1 Claude-Code-session install pattern, and does not pull forward the CLASSIFY/RETRIEVE
pipeline-wiring milestone still tracked at `MASTER-PLAN.md` P9.

## Consequences

- **Positive:** one real palace/tool for both conversational and code semantic memory instead of
  two parallel systems; `mempalace search`/`wake-up` become usable against client repos, not just
  chat, once pipeline-wiring (P9) eventually lands; reuses already-verified, already-benchmarked
  code (96.6% R@5, per ADR-001) instead of a new hand-rolled summarizer.
- **Negative / costs:** a new secret (`MEMPALACE_PGVECTOR_DSN`, the raw Postgres connection
  string/password — distinct from `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, which are REST API
  credentials) now lives in the VPS env file, widening the blast radius of that file's compromise
  to include direct Postgres write access, not just the service-role REST key. First-run mining
  downloads a local embedding model from Hugging Face — this sandbox's restricted network couldn't
  complete that download to fully verify `mine`'s success-path output format end-to-end (confirmed
  `init` completes and `mine` starts; the VPS, with open internet, needs to be the first place this
  is verified all the way through). `mempalace-venture.sh`'s entry-count parsing from `mine`'s
  stdout is therefore best-effort/unconfirmed until that live run.
- **Follow-ups:** verify `mempalace mine` end-to-end on the real VPS (this ADR's biggest open
  risk); CLASSIFY/RETRIEVE actually querying the palace (chat and repo both) remains
  `MASTER-PLAN.md` P9, unchanged by this ADR; `ventures.github_pat`'s RLS exposure (flagged
  separately, migration 119) is unrelated but sits next to this data — still an open item.

## Domain review

Reviewed by the operator directly (this session), same posture as ADR-001 — not a separate live
dana/dev agent invocation. Flagged per rule 0.6: domain judgment, not formula-verified. No dissent
recorded.

## Charter check

No Security Charter rail touched directly, but flagging one adjacent to it: this ADR introduces a
new credential class (`MEMPALACE_PGVECTOR_DSN`, direct Postgres access) to the VPS env file. The
env file itself is not a new attack surface (already holds `GITHUB_PAT`,
`SUPABASE_SERVICE_ROLE_KEY`), but a Postgres DSN with a password is a more direct write path than
a REST service-role key routed through PostgREST's own request handling — worth a future aegis
pass if that file's protection level is ever revisited. No new external egress beyond what's
already approved (Supabase was already a connected resource; Hugging Face's model download is new
egress, first-run only, read-only, no data leaves the VPS).
