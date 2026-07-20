---
name: experiment-discipline
type: custom
status: built from scratch
fulfills_catalog_entry: none — new; the product-side of the fleet's one experiment discipline (redesign §2.7, §3)
assigned_agent: loom (Product / PMF & Experimentation)
portable: true
date_added: 2026-07-10
---

# Experiment Discipline

## Introduction
The cheapest test that could falsify a belief, with its decision rule written and its success criteria frozen BEFORE it runs. loom reuses the fleet's eval-first pattern (proto's design-time, forge's benchmark-time) for product-time: criteria first, then the experiment, then the pre-committed verdict.

## Purpose
An experiment whose success bar is set after seeing the data proves whatever the runner wanted — it's theater. Freezing the criteria and the decision rule before running is what makes an experiment able to change a mind, including the runner's.

## When to Use
- An assumption from assumption-mapping is risky enough to test (the riskiest-first hand-in).
- spec routes a "test-first" verdict (opportunity-assessment says validate before building).
- price needs a monetization hypothesis tested (revenue experiments, extra blast-radius rules).

## Structure / Protocol
HYPOTHESIS (a falsifiable belief: "≥X% of new users will do Y" — not "users will like it") → CHEAPEST FALSIFYING TEST (the smallest test that could prove it WRONG — fake door, prototype, concierge, A/B; expensive builds are the last resort, not the first) → DECISION RULE (pre-set: "if the metric clears T, we do A; if not, we do B" — written before running, no post-hoc bar) → CRITERIA FREEZE (success metric pinned `metric:@vN` via experiment-instrumentation; criteria hashed/locked, echo-confirmed — proto's frozen-eval pattern) → RUN (metric verifies instruments live first; under-powered = flagged before running) → VERDICT (against the frozen rule, honestly) → REGISTRY (adopt/reject recorded, experiment-registry).

## Instructions
1. Falsifiable or it's not a hypothesis — "users will love it" can't fail; "≥30% activate within 7 days" can. Only falsifiable beliefs get experiments.
2. Cheapest test that could say NO — the goal is disconfirmation at minimum cost; a fake-door test beats building the feature to "see if people use it."
3. Decision rule BEFORE data — the if/then is written and frozen before the experiment opens; a bar set after seeing results is not a result (the anti-HARKing rule, house discipline).
4. Criteria freeze is echo-confirmed and pinned to metric's versioned definition — the same freeze-at-handoff spec uses; a moved goalpost mid-experiment invalidates it.
5. Instruments verified live first (experiment-instrumentation) — an experiment measured by a dead metric is worse than none; loom does not run until metric says READY. **Sizing is computed, not guessed:** metric's `sample_size.py` returns the per-variant N for the frozen MDE + power, so an under-powered test is flagged BEFORE it opens; the same script's z-test judges the result against the frozen rule after.
6. Verdict is honest against the rule — a near-miss is a miss; the pre-committed B branch executes. Wanting it to have worked is not evidence it did.

## Output Format
Experiment card: hypothesis · test type (+ why cheapest) · decision rule (pre-set) · frozen criteria (metric@vN, hash) · power/sample (flagged) · verdict → registry.

## Principles
- Falsifiable, cheapest, pre-committed — the three rules of an honest experiment.
- Decision rule before data; a near-miss is a miss.
- Verify instruments live before running (metric's gate).

## Fallback
Can't run a clean experiment (no traffic, ethical block)? Say so and fall back to the strongest available evidence (ux research, analogous data), labeled weaker — never a fake experiment dressed as rigor.

## Boundaries with Other Skills
- assumption-mapping feeds the riskiest belief; experiment-registry records the verdict; metric (experiment-instrumentation) verifies measurability and owns the numbers.
- proto (AI & Agents) tests agent hypotheses in the cage; forge benchmarks models; loom tests PRODUCT hypotheses on users — one discipline, different subjects.
- price reuses this for revenue experiments (extra blast-radius rules); spec's test-first verdicts land here.
