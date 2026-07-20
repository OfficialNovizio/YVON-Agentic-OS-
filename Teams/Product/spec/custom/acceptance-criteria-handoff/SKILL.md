---
name: acceptance-criteria-handoff
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-prd-template protocol step 3 ("acceptance criteria testable by quinn; hand to eng"), expanded to its own skill
assigned_agent: spec (Product / Product Manager, department leader)
portable: true
date_added: 2026-07-10
---

# Acceptance Criteria Handoff

## Introduction
The bridge between a PRD and Engineering's gate: criteria written so quinn can test them mechanically, delivered with echo-confirmation, and frozen at handoff. spec owns WHAT passes; quinn owns WHETHER it passed.

## Purpose
Handoffs are where context dies (edge's lesson, product edition). Untestable criteria come back as interpretation disputes at release time — the most expensive possible moment to discover ambiguity.

## When to Use
- A PRD is ready for Engineering.
- quinn/Engineering bounces a criterion as untestable (repair loop).
- A release-gate dispute needs the frozen criteria ("what did we agree?").

## Structure / Protocol
WRITE (each criterion: observable behavior, Given/When/Then or measurable-threshold form; each tagged testable-by: automated / browser-verification / manual-check `<FILL_IN: manual checks need an owner>`) → LINT (the four tests below) → HANDOFF (to Engineering via dev's delivery flow; quinn's gate consumes the criteria; ECHO — receiver restates scope + criteria; mismatch repairs BEFORE build) → FREEZE (criteria version locked; changes after freeze are PRD amendments, visible, re-echoed) → GATE (quinn tests; disputes resolve against the frozen text, not memories).

## Instructions
1. The four lint tests, every criterion: (a) could a machine or a stranger verify it without asking spec? (b) does it name observable behavior, not implementation? (c) does it have a falsifying case? (d) is its data/metric term defined in metric's spec (versioned)?
2. Non-functional criteria (latency, accessibility) cite the owning standard (mia's WCAG skill, raj's api-standards) rather than restating numbers — one source per number.
3. Echo-confirmation is mandatory and asymmetric-safe: never assume Engineering has the PRD's session context (cross-agent-handoff discipline).
4. Bounces are data: repeated bounce patterns (same ambiguity class) route to anneal as a lesson against THIS skill's lint tests.
5. "Shipped" for spec means quinn's gate passed AND metric's outcome read is scheduled — the handoff isn't done until the measurement is booked (Evidence Gate, third clause).

## Output Format
Criteria blocks (tagged, linted); echo records; freeze versions; bounce/repair log.

## Principles
- Testable by a stranger or not a criterion.
- Frozen at handoff; amended visibly or not at all.
- The handoff includes the measurement booking — shipping is a measurement event.

## Fallback
Engineering unavailable to echo (async gap)? The handoff parks as `awaiting-echo` — build starting without echo is recorded as a risk taken, never as a completed handoff.

## Boundaries with Other Skills
- prd-discipline supplies section 6; quinn's test-strategy consumes; dev's delivery-governance carries the artifact; metric books the outcome read.
- Disputes: frozen text wins; text ambiguity → anneal lesson.
