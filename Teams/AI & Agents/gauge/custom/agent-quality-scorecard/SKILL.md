---
name: agent-quality-scorecard
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-agent-quality-scorecard (prefix stripped; "retraining rec" genericized to technique/model change rec; agent renamed pulse→gauge for collision)
assigned_agent: gauge (AI & Agents / Fleet Monitor)
portable: true
date_added: 2026-07-10
---

# Agent Quality Scorecard

## Introduction
Per-agent quality metrics on a fixed cadence: task success rate, cost per task, latency, escalation rate. The fleet's instrument panel. Threshold math runs in `scripts/scorecard.py` (rule 0.6 — no reasoning-approximated arithmetic).

## Purpose
You can't improve what you don't measure, and you can't trust improvement claims without a before/after. The scorecard is the evidence layer the whole improvement loop (gauge→forge→anneal→gauge) stands on.

## When to Use
- The collection cadence fires (`<FILL_IN: suggested weekly>`).
- A change was applied (Rail 3) and needs re-measurement.
- Anyone claims an agent is degrading or improved — the scorecard arbitrates.

## Structure / Protocol
COLLECT (per-agent metrics from the configured telemetry source) → COMPUTE (`scorecard.py`: rates, drift vs trailing baseline) → FLAG (threshold breaches) → ROUTE (degradation-routing skill) → RECORD (dated scorecard, append-only).

## Instructions
1. Metrics per agent per period: tasks attempted/succeeded, cost total, latency p50/p95, escalations. Source: the configured telemetry/metrics layer (`<FILL_IN: source — e.g. platform logs, Datadog read-only>`); missing data is recorded MISSING, never imputed.
2. Run `python scripts/scorecard.py <metrics.json>` — flags: success < threshold (`<FILL_IN: suggested 90%>`), cost-per-task drift > threshold vs trailing-4-period mean (`<FILL_IN: suggested +20%>`), latency p95 drift likewise, escalation-rate spike likewise. Catalog values kept as suggested defaults, flagged reasoning-based.
3. Dormant agents are skipped but LISTED (with wake condition) — invisible ≠ healthy.
4. A flag is a routing event, not a verdict: diagnosis belongs to forge (degradation-routing skill).
5. After any applied fleet change: re-measure the affected agents next period and annotate the scorecard with the proposal ID — this closes the annealing loop with evidence.

## Output Format
Dated scorecard table (agent × metrics × flags) + a flags list, each flag carrying: metric, value, threshold, baseline, routed-to. Append-only archive.

## Principles
- Measure, flag, route — never diagnose, never fix (that's forge and anneal).
- No imputed numbers, ever: MISSING is an honest value.
- Thresholds are config, not opinion — changing one is a Rail 3 proposal.

## Fallback
No telemetry source connected yet? Degrade to method-only: manual sampling of task outcomes at the same cadence, clearly marked `manual-sample` — thin evidence beats no evidence, but it never silently masquerades as full telemetry.

## Boundaries with Other Skills
- degradation-routing consumes this skill's flags.
- fleet-health-report aggregates scorecards for the operator/CAIO cadence.
- forge's benchmarking measures MODELS on golden tasks; this measures AGENTS in production. Different instruments.
- quinn's eval-harness (Engineering) gates releases; the scorecard watches what shipped.
