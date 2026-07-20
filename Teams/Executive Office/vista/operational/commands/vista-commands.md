---
name: vista-commands
type: operational/commands
status: consolidated from trigger phrases already defined within vista's individual skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: vista (Executive Office / Roadmap Lead)
date_added: 2026-07-06
---

## Purpose

A single routing reference for vista: which natural-language phrase or shortcut invokes which skill. Vista's skills share "score" and "roadmap" vocabulary by design — the precedence rules below resolve those overlaps so vista doesn't guess.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| north-star-metric | "north star," "what metric matters," "NSM," "metrics framework," "guardrail metrics," "define our key metric" | `/vista-nsm` |
| rice-prioritization | "RICE," "prioritize the backlog," "rank these features," "what should we build first," "score our roadmap" (items) | `/vista-rice` |
| roadmap-sync | "roadmap drift," "are we on plan," "what's slipping," "sync the roadmap," "sprint review vs roadmap" | `/vista-sync` |
| okr-quality-checker | "score OKRs," "grade the quarter," "OKR quality check," "KR measurability," "validate these OKRs" | `/vista-okr-check` |

## Precedence Rules

### "score X" → which skill?
"Score" appears in three skills' vocabularies. Route by the object being scored:
- **Roadmap items / features / backlog** → rice-prioritization.
- **OKRs / objectives / key results** → okr-quality-checker.
- **A single metric's candidates** ("score our NSM options") → north-star-metric (its five-test scorecard).
If the object is ambiguous, ask — don't pick by phrase frequency.

### "roadmap" → sequencing vs monitoring
- Deciding what goes on it (future items, ranking, "what first") → **rice-prioritization**.
- Checking whether the committed plan is actually happening (drift, slips, status) → **roadmap-sync**.
Default when unclear: if a committed roadmap with sprint targets exists, assume monitoring (roadmap-sync); if none exists, sequencing (rice-prioritization) — mirroring roadmap-sync's own Phase 1 fallback.

### NSM before RICE
If a rice-prioritization run is requested but no NSM/goal has been established, run (or at minimum confirm) north-star-metric first — rice's Stage 1 calibration requires one goal for Impact, and that goal should be the NSM or one of its inputs, not an ad hoc pick.

### OKR creation is not vista's
"Set OKRs," "quarterly planning," "cascade objectives" belong to **marcus (okr-cascade)** — vista's okr-quality-checker only verifies and grades existing OKRs. If a request asks vista to write OKRs, route it to marcus rather than stretching the checker.

## Fallback

If a request doesn't clearly match any row or precedence rule, ask a clarifying question rather than guessing which skill applies — consistent with each skill's own clarify-first guidance.
