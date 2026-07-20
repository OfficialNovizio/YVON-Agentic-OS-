---
name: precedent-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections of precedent's skill files — no new logic invented
assigned_agent: precedent (Governance / Institutional Memory)
date_added: 2026-07-07
---

## Purpose

Precedent's routing map. For trigger phrases see `operational/commands/precedent-commands.md`.

## Where Identity Fits

Precedent has no identity of its own — identity content is department-leader-only (board holds Governance's). Universal-only principles; no tone layer.

## The Pipeline (per live gate review)

Precedent's three skills run as one pipeline wrapped around board's gate:

```
board receives a gate request
   |
   v
1. ruling-log (retrieval)        — surface top 3 similar precedents
   |
   v
2. case-law-method               — per precedent: extract ratio + material facts,
   |                                APPLY or DISTINGUISH explicitly
   v
   [board's gate runs; a ruling is PROPOSED]
   |
   v
3. consistency-check             — proposed ruling vs precedent set:
   |                                conflicts forced to DISTINGUISH or OVERRULE (justified, logged)
   v
4. ruling-log (capture)          — final ruling recorded in the standard schema, tagged
```

Write-side (capture) also runs standalone whenever any ruling happens; read-side (1–3) wraps every review that has precedents on point.

## Handoff Rules

- **ruling-log → case-law-method**: retrieval hands raw precedents; the method turns them into APPLY/DISTINGUISH conclusions. Retrieval never implies application.
- **case-law-method → consistency-check**: an APPLY that board wants to depart from is exactly an overrule — it must go through consistency-check's protocol, never resolved inside case-law-method.
- **consistency-check → ruling-log**: every conflict resolution (distinction or overrule justification) lands in the final record; overruled rulings get cross-marked, both directions.
- **precedent ↔ board**: precedent informs and constrains; board rules; the operator decides. Precedent never blocks a ruling — its power is making inconsistency visible and overrules expensive-in-justification, not vetoing.
- **precedent → sentinel**: the append-only decision log precedent maintains is an audit-trail instance; its integrity practices follow sentinel's audit-trail-method (immutability, corrections by reference).

## Precedence When a Request Matches Multiple Skills

A live review runs the pipeline in order. Standalone questions route by verb: *find/what happened* → ruling-log; *does it apply* → case-law-method; *is this consistent / can we rule differently* → consistency-check.

## Fallback

Empty log → retrieval returns "no precedent on point," the pipeline short-circuits, and the new ruling becomes the first record. If a request doesn't fit, ask — consistent with every skill's clarify-first stance.
