---
name: experiment-instrumentation
type: custom
status: built from scratch
fulfills_catalog_entry: none — new; the measurement arm of loom's experiments (redesign §3), split from product-metrics-spec so no experiment runs uninstrumented
assigned_agent: metric (Product / Product Analytics)
portable: true
includes: scripts/sample_size.py (tested 2026-07-10, 12/12 self-tests pass — two-proportion sample size + significance z-test + normal ppf/cdf; stdlib-only, no network/writes; consumed by loom's experiment-discipline)
date_added: 2026-07-10
---

# Experiment Instrumentation

## Introduction
The pre-flight check and measurement wiring for every loom experiment: the metrics an experiment reads are defined (metrics-spec), instrumented, and verified to actually fire BEFORE the experiment runs. No experiment starts without its instruments proven live.

## Purpose
An experiment measured by an event that never fired produces a confident null result — the worst outcome, because it looks like a real answer. This skill makes "the instruments work" a precondition of running, not a post-mortem discovery.

## When to Use
- loom freezes an experiment's criteria and needs its measures wired (the hand-in from experiment-discipline).
- A metric an experiment depends on is new or changed (re-verify before reuse).
- An experiment's read looks impossible (instrumentation-gap suspicion mid-run).

## Structure / Protocol
DEFINE (the experiment's primary + guardrail metrics are named, each pinned to `metric:<name>@vN` from product-metrics-spec — never a fresh local metric) → INSTRUMENT (missing events become instrumentation requests to Engineering, not assumptions) → VERIFY LIVE (fire a test event / check recent volume — the metric demonstrably emits before the experiment opens; unverified = experiment BLOCKED) → SAMPLE/POWER (minimum detectable effect + sample size stated; the `<FILL_IN: power/significance defaults — reasoning-based until the stats book>` flag rides every calc) → HANDBACK (verified instrument set → loom's registry entry; the experiment may now run).

## Instructions
1. Primary metric first, guardrails always: an experiment optimizing activation still watches retention and revenue guardrails (a win that breaks a guardrail is a loss) — guardrail metrics are mandatory, pinned like the primary.
2. Verify-live is non-negotiable: a metric that can't be shown to fire blocks the experiment (gauge's honest-missing, offense edition — better no experiment than a fake result).
3. Power/sample are stated up front and flagged rule-0.6 until the statistics source lands; loom's decision rule references this sample, so an under-powered test is flagged before it runs, not after.
4. No new definitions here — experiment measures cite the spec's versions; a needed-but-missing definition routes to metrics-governance first, not invented inline.
5. Instrumentation requests to Engineering follow the normal handoff (echo-confirmed); metric specs the event, raj/mia implement, quinn gates — metric never writes production instrumentation itself.

## Output Format
Experiment instrument sheet: primary metric@vN · guardrails@vN · verify-live evidence · sample/power (flagged) · BLOCKED/READY verdict → loom registry ref.

## Principles
- Verified-live or blocked — an unfired metric is worse than no metric.
- Guardrails are mandatory; a guarded win is the only real win.
- Cite versions; invent nothing (metrics-governance owns new definitions).

## Fallback
Instrumentation can't be added in time? The experiment waits or narrows to what IS measured, labeled — never runs on hoped-for data (loom's cheapest-falsifying-test still needs real falsification).

## Boundaries with Other Skills
- product-metrics-spec supplies definitions; metrics-governance handles any new one needed.
- loom owns the experiment design + decision rule; metric owns whether it's measurable and measured — proto/forge's eval-first pattern, measurement side.
- Engineering (raj/mia/quinn) implements + gates instrumentation; metric specs, never writes prod.
