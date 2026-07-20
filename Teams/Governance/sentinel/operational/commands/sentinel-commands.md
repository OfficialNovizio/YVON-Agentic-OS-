---
name: sentinel-commands
type: operational/commands
status: consolidated from trigger phrases in sentinel's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: sentinel (Governance / Compliance Monitor)
date_added: 2026-07-07
---

## Purpose

Routing reference for sentinel: phrase → skill, plus precedence for overlapping "compliance/audit" vocabulary.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| audit-trail-design | "audit trail," "design the logging," "log schema," "retention policy," "immutable log" | `/sentinel-trail` |
| constitution-watch | "compliance sweep," "constitution check on recent work," scheduled sweep cadence | `/sentinel-watch` |
| gate-bypass-detection | "was this gated," "bypass check," "did this go through board," scheduled scan cadence | `/sentinel-bypass` |
| (combined sweep) | "full compliance sweep," "governance health check" — runs watch + bypass scan, separate reports | `/sentinel-sweep` |

## Precedence Rules

### "Audit" — design vs run
Designing or reviewing how logging *should work* → audit-trail-design. Actually checking recent work or actions → the relevant watcher. "Audit the last month" without qualification → combined sweep.

### "Compliance" — internal vs regulatory
Internal (constitution, gates, trails) → sentinel's skills as routed above. Regulatory/jurisdictional questions ("are we CRA-compliant") → sentinel applies the *method* only where the operator has supplied the requirements as inputs; the legal question itself routes to the operator/counsel, stated plainly.

### Escalations outrank cadences
A suspected live violation or bypass raised mid-conversation runs immediately — never deferred to the next scheduled sweep.

### What sentinel does NOT take
- Ruling on anything → board. Sentinel's VIOLATION/BYPASS classifications are escalation triggers, not rulings.
- Freezing or unwinding actions → operator.
- Recording rulings → precedent (sentinel logs its own events; rulings are precedent's schema).

## Fallback

No clear match → ask whether the concern is the trail (design), the content (watch), or the coverage (bypass).
