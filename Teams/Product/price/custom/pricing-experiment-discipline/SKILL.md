---
name: pricing-experiment-discipline
type: custom
status: built from scratch
fulfills_catalog_entry: none — new agent (price); revenue experiments with extra blast-radius rules (redesign §3)
assigned_agent: price (Product / Pricing & Packaging)
portable: true
date_added: 2026-07-10
---

# Pricing Experiment Discipline

## Introduction
Testing prices and packaging on real behavior — reusing loom's experiment discipline and registry, but with extra rules because revenue experiments touch money, existing customers, and trust in ways a UI test never does.

## Purpose
Stated willingness-to-pay overstates; only a real revenue experiment tells you what people actually pay. But a careless price test can anger existing customers, distort revenue reporting, or breach a price commitment — so pricing experiments run under loom's rigor PLUS blast-radius guardrails.

## When to Use
- pricing-research produces a WTP hypothesis to confirm with behavior.
- packaging-tiers proposes a structure to validate before launch.
- A price change needs evidence before it goes broad (test small first).

## Structure / Protocol
INHERIT (loom's experiment-discipline: falsifiable hypothesis, decision rule + criteria frozen before data, registry query-first, metric verifies revenue instruments live) → BLAST-RADIUS RULES (revenue-specific, additive): (a) NEW customers or a small holdout only by default — don't silently reprice existing customers in a test; (b) existing-customer exposure needs explicit sign-off and honors price-change-governance (grandfathering); (c) revenue guardrails mandatory (a conversion win that tanks revenue-per-user is a loss); (d) a locked-commitment check — a test must not breach a price guarantee (→ board if in scope) → RUN (small, reversible, time-boxed) → VERDICT (against frozen rule; registered in loom's registry) → SCALE (a won test becomes a price-change-governance proposal, not an instant broad change).

## Instructions
1. Inherit loom's rigor fully — falsifiable, cheapest, frozen criteria, registry-first, instruments verified; pricing experiments are loom experiments, not a looser cousin.
2. New-customers-or-holdout by default — existing customers are not silently repriced in a test; changing what someone already pays is a governed change, not an experiment variable (the trust rule).
3. Revenue guardrails always — optimize conversion AND watch revenue-per-user, churn, and expansion; a cheaper price that lifts signups but drops total revenue is a failed test, not a win.
4. Locked-commitment check before running — a price experiment that would breach a guarantee or grandfathering promise stops and routes to board (Governance) if a locked commitment is in scope.
5. Won tests scale via governance, not instantly — a validated price becomes a price-change-governance proposal (impact analysis, grandfathering) before it goes broad; the experiment earns the change, governance ships it.

## Output Format
Pricing experiment card: hypothesis · variant (new/holdout scope) · decision rule + revenue guardrails (frozen) · locked-commitment check · verdict → loom registry → price-change-governance proposal (if scaling).

## Principles
- loom's rigor PLUS blast-radius rules — money experiments carry extra guardrails.
- Never silently reprice existing customers in a test.
- Revenue guardrails mandatory — a conversion win that drops revenue is a loss.
- Won tests scale through governance, not instantly.

## Fallback
Can't run a clean pricing test (too few new customers)? Use pricing-research + competitor evidence, labeled weaker, and make the first real change small and reversible under governance — never a big untested repricing.

## Boundaries with Other Skills
- loom owns the experiment discipline + registry this inherits; metric owns revenue instrumentation (verify-live); price adds the money-specific guardrails.
- price-change-governance ships won tests as governed changes; board (Governance) gates locked-commitment-touching tests.
- felix/Finance (future): revenue-per-user / margin definitions are finance's; price reads them as guardrails, co-cited.
