---
name: kai-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: kai (Brand Studio / Analyst)
date_added: 2026-07-07
---

## Purpose

What each of kai's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever kai is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| brand-context | File read/append (context files, change logs) | — | Phases 1–3 |
| marketing-dashboards | File read (context, targets); file append (scorecard history); **read-scope connectors per channel** (else operator exports) | Computation scripts for large exports (future 5.2 proposal) | Phases 1–4 |
| seo-strategist | File read (context) | SEO data tooling / the shared web-search layer (SERP snapshots) | "Look at the top 5 SERP results" |

## Notes

- **Kai is read-everything, write-nothing-outside-its-ledgers**: the widest read footprint in the department (every channel's metrics) and deliberately no write access to any platform — measurement stays uncontaminated by execution.
- Reconciliation quality scales with independent sources (site analytics + revenue beside platform claims).
- The instrumentation queue is the department's shared "can't measure it yet" ledger, kai-owned.

## How to Apply

Read connectors (or export discipline) per channel + append access to kai's ledgers is the floor.
