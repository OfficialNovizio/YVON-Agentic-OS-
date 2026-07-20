---
name: performance-profiling
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 "performance-profiling C/M"
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — profiling/benchmark skills found are tool-specific (language profilers); the measure-don't-guess discipline itself is kept custom, with the business's actual profiler named in the stack-profile
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
portable: true — the discipline is language-agnostic; the profiler tool comes from the stack-profile
includes: assets/benchmark-record-template.md
date_added: 2026-07-09
---

## Introduction

performance-profiling is where axiom's "measure, don't guess" (dev's identity principle, algorithm edition) becomes procedure: before optimizing, measure to find the actual bottleneck; after optimizing, measure to prove the change helped; and record both, so performance claims carry numbers, not hopes. It's the empirical complement to complexity-analysis — asymptotics predict, profiling confirms.

## Purpose

Engineers optimize the wrong thing constantly: the clever rewrite of a function that wasn't the bottleneck, the micro-optimization the compiler already did, the "obviously faster" change that's slower. Profiling replaces intuition with measurement — you optimize what the profile says is hot, and you keep the change only if the numbers improve.

## When to Use

Triggers: "optimize this," "why is this slow," "is this change faster," "profile it," a performance complaint, a complexity-analysis that said constants dominate, and ops's monitoring showing a latency regression.

## Structure / Protocol

```
A performance question
  -> MEASURE FIRST: profile under a realistic workload → find the actual hot spot
     (never optimize before profiling — intuition about bottlenecks is usually wrong)
    -> Analyze: is it algorithmic (complexity-analysis) or constant-factor (implementation)?
      -> Change ONE thing
        -> MEASURE AGAIN: same workload, same conditions → did it improve, by how much?
          -> Record (assets/benchmark-record-template.md): workload · before · after · delta · conditions
            -> No improvement → REVERT (an unmeasured "optimization" is just risk)
```

## Instructions

1. **Measure before touching anything.** Profile under a workload that resembles production (realistic n, realistic distribution). The hot spot is usually not where intuition says. Optimizing before profiling is how effort goes to cold code.
2. **Realistic workloads only.** A benchmark on n=10 when production is n=10^6 measures the wrong regime (complexity-analysis's asymptotics point). Use representative data; note the workload in the record so results are comparable.
3. **Algorithmic vs constant-factor.** If the profile points at an O(n²) hot loop, that's complexity-analysis's domain (change the algorithm). If it's an O(n) doing expensive work per item, it's implementation (allocation, cache misses, redundant work). Fix at the right layer.
4. **Change one thing, measure again.** Isolate the change so the delta is attributable. Same workload, same machine class, same conditions — a comparison across different conditions is noise dressed as a result.
5. **Keep it only if the numbers say so.** An optimization with no measured improvement is reverted — it's added complexity and risk for nothing (dev's boring-is-a-feature). "It should be faster" is not "it is faster."
6. **Record the evidence.** Before/after numbers, the workload, the conditions — so the claim is reproducible and ops's baselines (maintenance-hygiene) can reference real figures, not folklore. Performance claims without numbers carry the rule-0.6 flag.

## Output Format

```
## Benchmark: [what] — [date]
Workload: [n, distribution, conditions] · Profiler: [per stack-profile]
Hot spot found: [location] · Type: [algorithmic → complexity-analysis / constant-factor]
Change: [one thing]
Before: [metric] · After: [metric] · Delta: [%/x] · Verdict: KEEP / REVERT (no improvement)
```

## Principles

- **Measure before optimizing** — the bottleneck is rarely where you think.
- **Realistic workloads** — the wrong regime measures the wrong thing.
- **Right layer** — algorithmic problems need algorithm changes, not micro-opts.
- **One change, attributable delta** — comparisons across conditions are noise.
- **Keep only measured wins** — an unmeasured optimization is pure risk; revert it.
- **Claims carry numbers** — before/after or the rule-0.6 flag; no folklore.

## Fallback

- No production-like workload available → measure on the best available, label the regime gap, and treat conclusions as provisional; don't extrapolate small-n results to large-n silently.
- Profiler not in the stack yet → use the language's basic timing + the analysis from complexity-analysis, labeled lower-fidelity; recommend a profiler to add to the stack-profile.
- Improvement is within noise → treat as no improvement (revert); a delta smaller than run-to-run variance isn't a result.

## Boundaries with Other Skills

- **complexity-analysis** (sibling) predicts; this measures. They meet when the profile shows an algorithmic hot spot.
- **dsa-design-records**: benchmark evidence backs the "constants dominate" trade-offs a record notes.
- **ops/maintenance-hygiene**: its monitoring baselines are the production-scale counterpart; a latency regression there routes here to profile.
- **dev**: "measure, don't guess" is dev's identity principle; this is its enforcement at the algorithm layer, and unmeasured performance claims carry dev's rule-0.6 flag.
