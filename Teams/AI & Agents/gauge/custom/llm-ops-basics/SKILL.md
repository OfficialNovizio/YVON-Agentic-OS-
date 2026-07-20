---
name: llm-ops-basics
type: custom
status: built from scratch
sources_referenced: []  # marketplace searched 2026-07-10 — hamelsmu/evals-skills (github.com/hamelsmu/evals-skills) identified as a strong adoption candidate; not copied unreviewed. PENDING: scout evaluation pass.
fulfills_catalog_entry: llm-ops-basics (catalog listed marketplace; built custom pending candidate review)
assigned_agent: gauge (AI & Agents / Fleet Monitor)
portable: true
date_added: 2026-07-10
---

# LLM Ops Basics

## Introduction
Operational discipline for running LLM-backed agents in production: golden-set evals, drift detection, version pinning. Catalog marked marketplace; a strong candidate (hamelsmu/evals-skills) exists but adopting a multi-file skill unreviewed violates our own intake rules — built custom now, candidate queued for scout.

## Purpose
Model behavior changes under your feet: provider updates, prompt edits, tool changes. Without pinned versions and a stable golden set, degradation is discovered by users instead of by gauge.

## When to Use
- Setting up or running the recurring golden-set eval.
- A model/provider/prompt version changes anywhere in the fleet.
- Scorecard flags need behavioral (not operational) confirmation.

## Structure / Protocol
PIN (record model+version+config per agent) → GOLDEN SET (operator-supplied task set, versioned) → RUN (same set, same cadence) → COMPARE (vs last run + vs pinned baseline) → ALERT (drift → degradation-routing).

## Instructions
1. Version pinning: every agent's model, version/date, and generation config are recorded in the fleet registry entry (meta) — "latest" is not a version. Provider-forced changes are recorded as unplanned version events and trigger an off-cadence golden run.
2. Golden set: `<FILL_IN: operator golden task set — representative tasks per agent with expected-behavior rubrics>`. Never invented by gauge (rule 0.5); until it exists, this skill runs method-only and says so.
3. Cadence: `<FILL_IN: suggested weekly, aligned with the scorecard>`. Blind scoring where rubrics allow (forge's benchmarking-discipline shares this method).
4. Drift verdicts: PASS / BEHAVIOR DRIFT (score drop beyond rubric tolerance) / FORMAT DRIFT (shape changed). Both drifts route to forge via degradation-routing with the run artifacts attached.
5. Never tune-to-the-test: golden set changes are Rail 3 proposals (they redefine "good"), and a set the fleet has adapted to gets refreshed, not relaxed.

## Output Format
Dated golden-run report: per-agent scores vs baseline, verdicts, version stamps. Append-only alongside scorecards.

## Principles
- Pin everything; an unpinned fleet can't distinguish its own regressions from the provider's.
- The golden set is the definition of "still works" — treat edits to it as seriously as charter edits.
- Evals are evidence into routing, never a verdict by themselves (same rule as quinn's eval-harness).

## Fallback
No golden set yet (the normal state until the operator supplies one): pin versions anyway, log version events, and use scorecard operational metrics as the only drift signal — clearly flagged as behavioral-blind-spot.

## Boundaries with Other Skills
- agent-quality-scorecard: operational metrics; this skill: behavioral metrics. Both feed degradation-routing.
- forge's benchmarking-discipline: compares CANDIDATE models on the golden set; this skill watches the INCUMBENT.
- quinn's eval-harness: pre-release gate; this: post-release watch.
