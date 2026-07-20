---
name: technique-adoption
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-ai-stack-registry protocol steps 2–3 ("new technique → benchmark → adoption rec with migration cost"), expanded to a full skill
assigned_agent: forge (AI & Agents / AI Methods & Benchmarking)
portable: true
date_added: 2026-07-10
---

# Technique Adoption

## Introduction
The gate a new AI method/technique (prompting pattern, retrieval approach, agent-loop design, new model) passes between "interesting" and "in the fleet": benchmark on our tasks, migration cost, adoption rec.

## Purpose
The AI field ships something shiny weekly. Without a gate, the fleet churns on novelty; with one, only measured improvements land — with their true migration cost attached.

## When to Use
- edge's pilot-spec-handoff delivers an emerging-tech pilot that involves AI methods.
- scout's ecosystem scan or a lesson suggests a candidate technique.
- An agent requests a technique change ("should we switch X to Y?").

## Structure / Protocol
INTAKE (candidate + claimed benefit + source) → CHEAP KILL (does the claim even apply to our task types? conflicts with rails/charter? — reject early, log why) → BENCHMARK (benchmarking-discipline, golden set) → MIGRATION COST (config changes, prompt rework, re-golden-runs, skill edits needed — itemized) → REC (adopt / watch / reject, to the registry + as a Rail 3 proposal when adoption changes configs or skills).

## Instructions
1. Claims are quoted, then tested — never transcribed into recs. "Paper says +30%" becomes "our golden set says X".
2. The cheap-kill step is genuinely cheap: a one-page applicability check, not a mini-benchmark. Most candidates should die here — that's the gate working.
3. Migration cost is itemized honestly, including anneal's skill-edit proposals it would trigger and gauge's re-baselining. A technique whose migration exceeds its measured benefit gets `watch`, not `adopt`.
4. Every verdict is logged in the registry (adopt AND reject AND watch, with re-check dates for watch) — the fleet never re-evaluates the same candidate from scratch unknowingly.
5. Adoption is never self-executing: the rec becomes a Rail 3 proposal; board/operator decide; anneal edits skills; gauge re-measures. forge only ever recommends.

## Output Format
Adoption memo: candidate, source, cheap-kill result OR benchmark summary (variance included), itemized migration cost, verdict + confidence flag, registry entry ref.

## Principles
- Benchmarks over papers; our tasks over their demos.
- Rejection with a logged reason is a successful outcome.
- Migration cost is part of the result, not a footnote.

## Fallback
Candidate can't be benchmarked yet (needs infra we lack, golden set gap)? Verdict is `watch` with the blocking dependency named and a re-check date — never `adopt-on-faith`, never silent discard.

## Boundaries with Other Skills
- edge gates emerging TECH (maturity/fit/regulatory); forge gates AI METHODS (measured benefit). edge's pilots flow here when they're AI-method-shaped.
- benchmarking-discipline is the measurement arm; model-technique-registry the memory.
- scout supplies candidates from ecosystem scans; anneal executes any resulting skill edits.
