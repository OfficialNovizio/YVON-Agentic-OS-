---
name: experiment-registry
type: custom
status: built from scratch
fulfills_catalog_entry: none — new; mirrors scout's adopt-reject registry pattern, product-side (redesign §3, §5)
assigned_agent: loom (Product / PMF & Experimentation)
portable: true
date_added: 2026-07-10
---

# Experiment Registry

## Introduction
The append-only record of every experiment and its verdict: hypothesis, test, frozen criteria, result, and the adopt/reject decision. So the company never unknowingly re-runs a settled experiment, and every "we tried that" is a checkable claim with a date.

## Purpose
Institutional amnesia makes teams re-run last year's failed pricing test and re-learn the same lesson at full cost. A registry makes experiment history queryable — before proposing a test, check whether it (or a near-twin) already has a verdict.

## When to Use
- An experiment reaches a verdict (experiment-discipline files it here).
- Before proposing an experiment — query: has this been run? (the re-run guard).
- A decision cites "we tested that" — the registry is where that claim is verified or exposed.

## Structure / Protocol
QUERY-FIRST (a proposed experiment first checks the registry: run before? near-twin? stale-but-relevant?) → verdict: SETTLED (cite the existing result, don't re-run) | STALE (context changed enough to re-test — say why) | NEW → FILE (on verdict: hypothesis, test type, frozen criteria `metric:@vN`, result, ADOPT/REJECT, date, confidence — append-only, scout's pattern) → LINK (which PRDs/features/prices the verdict informed) → SURFACE (settled verdicts are searchable; a re-run proposal without a stated delta from the prior test bounces).

## Instructions
1. Query before proposing — the re-run guard mirrors ux's query-first and scout's adopt-reject; re-running a settled experiment needs a stated reason the context changed.
2. Append-only, never edited: a superseded verdict stays readable with its date, so "what did we believe then" is answerable (precedent's discipline, experiment edition).
3. Record the frozen criteria, not just the result — a verdict without its pre-set decision rule can't be trusted or reused (a result whose bar was moved is noise).
4. ADOPT/REJECT is explicit and dated — "inconclusive" is a valid third verdict (and a prompt to design a better test), never a silent drawer.
5. Link downstream: the registry knows which decisions a verdict shaped, so a later-overturned result can trace what it touched (annealing).

## Output Format
Registry entry: experiment ID · hypothesis · test · frozen criteria (metric@vN) · result · ADOPT/REJECT/INCONCLUSIVE · date · confidence · informed (PRD/price IDs). Query result: SETTLED/STALE/NEW + refs.

## Principles
- Query before you re-run — settled experiments are cited, not repeated.
- Append-only; verdicts keep their frozen criteria and their date.
- Adopt/reject/inconclusive — explicit, never a silent drawer.

## Fallback
Empty registry (new company)? Query-first still runs (returns NEW honestly); the discipline is in place from experiment #1, so amnesia never sets in.

## Boundaries with Other Skills
- experiment-discipline files verdicts here; assumption-mapping's tested beliefs land as entries; pmf-scorecard's PMF reads are registry-recorded over time.
- scout (AI & Agents) runs the same adopt-reject pattern for marketplace skills; loom's registry is its product-experiment analogue — one pattern, two subjects.
- spec/price cite registry verdicts as evidence ("we tested that, here's the result"); anneal consumes overturned verdicts as skill lessons.
