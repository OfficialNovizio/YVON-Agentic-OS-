# Benchmark Record — [what was measured] — [date]

> Measure before and after; keep only measured wins. Numbers make performance claims real (rule 0.6). Profiler per stack-profile.

## Workload (must be realistic + recorded for comparability)
- Input size n: [value — should resemble production regime]
- Distribution / shape: [uniform / skewed / worst-case / production sample]
- Environment: [machine class / container / conditions]
- Profiler: [tool per stack-profile]

## Hot spot
- Location: [file:function]
- Type: [algorithmic → complexity-analysis / constant-factor → implementation]

## Change (one thing, for an attributable delta)
- [description]

## Result
| metric | before | after | delta |
|---|---|---|---|
| [latency p50/p95 / throughput / allocations / cpu] | | | [%/x] |

- Within run-to-run noise? [yes → treat as no improvement] / [no]
- **Verdict:** KEEP / REVERT (no measured improvement = revert)

## Feeds
- ops baseline update? [ref] · dsa-design-record trade-off backed? [DSR-ref]
