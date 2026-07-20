---
name: benchmarking-discipline
type: custom
status: built from scratch
sources_referenced: []  # catalog's llm-benchmarking (marketplace) had no verbatim source found 2026-07-10; method built custom, candidates queued for scout
fulfills_catalog_entry: llm-benchmarking (catalog listed marketplace; built custom after search)
assigned_agent: forge (AI & Agents / AI Methods & Benchmarking)
portable: true
date_added: 2026-07-10
---

# Benchmarking Discipline

## Introduction
How models/techniques are compared honestly: task-representative eval sets, blind scoring, cost-quality frontier reads. The method that makes the model-technique registry's numbers trustworthy.

## Purpose
Un-disciplined benchmarks (cherry-picked tasks, scorer knows the candidate, single runs) produce confident nonsense that then drives routing. The discipline is the product.

## When to Use
- A new model/technique candidate needs numbers (from technique-adoption or edge's pilots).
- A degradation diagnosis needs a "would the alternative do better?" comparison.
- Periodic re-benchmark of incumbents (`<FILL_IN: cadence, suggested per provider release cycle>`).

## Structure / Protocol
SET (use the operator's golden task set — same set gauge uses; never a bespoke set per benchmark) → RUN (all candidates on identical inputs, configs recorded) → SCORE BLIND (scorer — human or rubric — must not know which output came from which candidate) → REPLICATE (≥ `<FILL_IN: suggested 5>` runs per task where variance matters; single samples lie) → COST (full cost per task: tokens, latency, retries) → FRONTIER (registry update).

## Instructions
1. No benchmark without the golden set: a bespoke task set invented for one benchmark is the cherry-picking vector — if the golden set lacks a needed task type, that's a golden-set change proposal (Rail 3) first.
2. Blind scoring is non-negotiable: outputs are shuffled and identity-stripped before scoring. Where a mechanical rubric exists, both mechanical and blind-judgment scores are recorded.
3. Record EVERYTHING: model versions, generation configs, prompt text hashes, run dates. An unreproducible benchmark is an anecdote.
4. Report variance, not just means — overlapping distributions mean "no measured difference," and the report says exactly that.
5. Negative/null results enter the registry too: "no improvement" is a finding that prevents the next person from re-running the same comparison.

## Output Format
Benchmark report: setup block (reproducibility), per-task-type score tables with variance, cost table, frontier delta, verdict (`adopt-candidate / no-difference / incumbent-wins`), confidence flag.

## Principles
- Same set, blind scores, multiple runs — or it isn't a benchmark.
- Variance is a result; null is a result.
- The benchmark recommends; the operator decides (via Rail 3 when configs change).

## Fallback
No golden task set yet (the current state)? Benchmarks limited to coarse public-task smoke comparisons, results marked `provisional — not golden-set-grade`, and never used alone to change routing. The golden set gap is the department's loudest pending item.

## Boundaries with Other Skills
- model-technique-registry consumes every result; degradation-diagnosis requests comparisons; technique-adoption supplies candidates.
- gauge's llm-ops runs the SAME golden set as a watch on incumbents — one set, two uses (compare vs monitor); set governance is shared and Rail 3-gated.
