---
name: opportunity-assessment
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-prd-template protocol step 1 ("evidence from ux/metric before scoping"), expanded to its own skill
assigned_agent: spec (Product / Product Manager, department leader)
portable: true
date_added: 2026-07-10
---

# Opportunity Assessment

## Introduction
The step before any PRD: is this problem worth solving at all? Problem sizing, alternatives (including the customer's current workaround), and the do-nothing cost — evidence-before-scoping made a standing gate.

## Purpose
The most expensive waste is a well-executed solution to a problem nobody has. This gate kills weak opportunities cheaply, before specification effort — spec's version of forge's cheap-kill and edge's scoring bar.

## When to Use
- Any sizeable idea arrives (operator, vista's roadmap themes, ux findings, metric anomalies, loom verdicts).
- A backlog item's RICE Reach/Impact inputs are contested (re-assessment).

## Structure / Protocol
FRAME (whose problem, in which journey moment — one sentence) → SIZE (how many, how often, how painful — from metric's data + ux's repo; unknowns named, floors assumed) → ALTERNATIVES (what do they do today? incl. "nothing, happily" — the deadliest answer) → DO-NOTHING COST (what happens if we skip it — quantified where data allows, flagged where not) → EVIDENCE LADDER (current level 1–5; L1–2 → route to loom for a cheap falsifying test BEFORE specification) → VERDICT (spec / test-first / park with re-check / kill with reasons — recorded).

## Instructions
1. One page maximum — an assessment that needs ten pages is a PRD wearing a disguise; the point is cheapness.
2. Sizing cites sources (metric read IDs, repo entries) or says `estimate — <basis>`; invented sizing numbers are rule-0.5 violations.
3. "Customers asked for it" is an alternative-framing trap: record what JOB they were hiring for (ux's JTBD lens), not the feature they named.
4. Kills and parks are registry-recorded (loom's experiment-registry pattern — the department never unknowingly re-assesses a settled kill without a stated delta).
5. Verdicts carry the 0.6 flag when sizing is estimate-based — most will be, and saying so is the point.

## Output Format
One-page assessment: frame / size / alternatives / do-nothing cost / ladder level / verdict + flag. Kill/park registry lines.

## Principles
- Cheap to run, honest about unknowns, deadly to weak ideas.
- The job, not the feature request; the behavior, not the quote.
- Killed ideas stay killed without new evidence — deltas re-open, nostalgia doesn't.

## Fallback
No data at all (new product, empty repo)? The assessment IS the routing: everything lands at "test-first" via loom's smoke-test-grade experiments — pre-data products earn evidence before they earn PRDs.

## Boundaries with Other Skills
- Feeds prd-discipline (spec verdicts) and loom (test-first verdicts); consumes ux's repo + metric's reads.
- backlog-rules ranks what survives; vista arbitrates when strategy and assessment disagree (recorded override).
