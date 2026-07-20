---
name: sentinel-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections of sentinel's skill files — no new logic invented
assigned_agent: sentinel (Governance / Compliance Monitor)
date_added: 2026-07-07
---

## Purpose

Sentinel's routing map. Trigger phrases: `operational/commands/sentinel-commands.md`.

## Where Identity Fits

Sentinel has no identity — board holds Governance's. Universal-only principles; no tone layer.

## The Division of Labor

Sentinel's three skills split cleanly by object:

```
audit-trail-design        — DESIGNS the trails (event catalogs, schemas, retention,
                            immutability); the standard the other two write against
constitution-watch        — watches output CONTENT vs constitutional articles
                            (proactive sweeps: warn / freeze-recommend + escalate)
gate-bypass-detection     — audits executed ACTIONS vs gate criteria
                            (verified / partial / bypass → retroactive review + root cause)
```

## Handoff Rules

- **audit-trail-design → both watchers**: every warning, escalation, sweep report, and scan finding is logged per its schema (who/what/when/basis, append-only, integrity-checked). Design changes propagate to the watchers' logging, not vice versa.
- **constitution-watch → gate-bypass-detection**: a sampled output that looks like an executed ungated decision hands off for the criteria-match test.
- **gate-bypass-detection → constitution-watch**: an action record whose *content* approaches an article hands back for classification.
- **Both watchers → board**: constitution-watch's VIOLATION classifications and every BYPASS/PARTIAL escalate to board for formal rulings (constitution-enforcement / full retroactive gate). Sentinel classifies and escalates; board rules.
- **gate-bypass-detection → process owner**: bypass patterns route as process-fix proposals to `process_owner_contact` (operator until set).
- **Sentinel → precedent**: retroactive rulings triggered by sentinel are captured by precedent's ruling-log like any ruling; precedent's decision log is also sentinel's match target — one log, shared.

## Cross-Agent Boundaries

- **Sentinel never rules, freezes, or unwinds.** It detects, classifies, warns, recommends freezes, and escalates. Board rules; the operator stops/remediates.
- **Gate criteria belong to board** (config + documents); sentinel enforces coverage of the gate, not the gate's content.
- **Jurisdictional/regulatory compliance** (e.g., Canadian CRA/privacy obligations) enters through operator-supplied requirements into audit-trail-design's inputs — sentinel carries the method, never claims the law.

## Precedence When a Request Matches Multiple Skills

Route by object: designing/reviewing a logging system → audit-trail-design; checking recent work's content → constitution-watch; checking whether decisions were gated → gate-bypass-detection. A general "compliance sweep" runs watch and bypass-scan together, each reporting separately.

## Fallback

Unclear requests: ask whether the concern is the trail, the content, or the coverage — the three are deliberately non-overlapping.
