---
name: axiom-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for axiom, the algorithm & data-structure design layer.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>       # axiom's tool use is plan-locked/sandboxed; no data changes (Rail 3)

# --- Records & analysis ---
dsa_records_path: <FILL_IN>            # append-only DSR ledger (asset template)
benchmark_records_path: <FILL_IN>      # append-only benchmark records (asset template)
profiler: <FILL_IN>                    # per stack-profile; e.g. language profiler / flamegraph tool
representative_workloads: <FILL_IN>    # production-like n + distribution for benchmarks (operator-supplied)

# --- Thresholds (operator-set; axiom proposes, never invents — rule 0.5) ---
hot_path_definition: <FILL_IN>         # what counts as a hot path warranting a DSR / deep analysis
complexity_regression_policy: <FILL_IN> # e.g. any class worsening on a hot path blocks review

# --- Review routing ---
review_source: dev                     # dev routes algorithm-heavy diffs to algorithm-review
consumers: [raj, dana]                 # hot-path (raj) + storage/query (dana) structures
escalation_contact: <FILL_IN>          # unresolved access-pattern / structure disputes → dev/operator
```

## Instructions

1. No `profiler` → performance-profiling uses basic timing + complexity-analysis, labeled lower-fidelity; recommend a profiler for the stack-profile.
2. No `representative_workloads` → benchmarks run on best-available data, labeled provisional; small-n results are not extrapolated to large-n silently.
3. `hot_path_definition` unset → axiom applies a conservative default (request-path + data-scaling loops), labeled reasoning-based, and proposes a definition to the operator.
4. axiom writes no application code changes directly beyond its own records/benchmarks — designs and reviews route through the owning builder and dev's review.

## Fallback

Unfilled config degrades loudly: analysis and profiling still run, labeled by fidelity; no invented thresholds. axiom never asserts an unmeasured performance number as fact.
