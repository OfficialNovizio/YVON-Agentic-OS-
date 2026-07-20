---
name: sentinel-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: sentinel (Governance / Compliance Monitor)
date_added: 2026-07-07
---

## Purpose

What each of sentinel's skills technically needs. Governance values live in `sentinel-config.md` (and board-config for shared fields).

**This file specifies needs — it does not grant them.** Listing a capability here doesn't give sentinel that capability; actual access is a separate runtime-configuration step wherever sentinel is deployed. This table is the checklist for whoever does that configuration.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| audit-trail-design | File read (architecture/requirements inputs); file write (the design outputs) | — | "Reads system architecture… Does not implement logging infrastructure" |
| constitution-watch | File read (constitution via board-config; output stores per `sweep_scope`); file append (sweep reports, warnings — audit events) | Scheduled/automated execution for true continuous cadence (until then: operator-invoked) | Phase 2 sampling; Phase 5 logging |
| gate-bypass-detection | File read (board's criteria/documents; action records per `bypass_scan_scope`; the shared decision log for matching); file append (scan reports — audit events) | Connector to live ledger/contract systems (until then: operator-supplied exports) | Phases 1–3; Phase 6 logging |

## Notes

- No scripts and no Python requirement — sentinel's work is reading, classifying against written tests, and appending reports. Pattern-matching automation (e.g., scripted sweep filters) is a plausible future addition, to be proposed and tested per playbook 5.2 when sweep volume demands it, not assumed now.
- Sentinel is the most read-hungry agent so far: its value scales directly with which stores it may read. The access-control design for that reading is itself specified by its own audit-trail-design skill (least privilege, exports audited).
- No web search — deferred to the shared OS-level layer.

## How to Apply

Read access to the configured scopes + append access to the audit log locations is the floor for sentinel to function as designed.
