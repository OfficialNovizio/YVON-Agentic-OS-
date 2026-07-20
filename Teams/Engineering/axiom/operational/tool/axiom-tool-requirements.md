---
name: axiom-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
date_added: 2026-07-09
---

## Purpose

What axiom needs, and what happens without each. Light footprint (analysis + records + benchmarks); every external tool call is plan-locked (Rail 1) and sandboxed (Rail 2); axiom runs no data changes (Rail 3).

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| Source read | repo read scope | all skills | Core; without it axiom can't analyze — escalate |
| Profiler | per stack-profile (language profiler / flamegraph) | performance-profiling | Basic timing + analysis, labeled lower-fidelity |
| Benchmark runtime (in sandbox) | compute to run representative workloads | performance-profiling | Analysis-only, labeled; no empirical confirmation |
| Append-only record access | DSR ledger · benchmark records (config paths) | dsa-design-records, performance-profiling | Can't record; loud degradation |
| Representative workload data | operator-supplied production-like samples | performance-profiling | Provisional benchmarks; no large-n extrapolation |

## Explicit non-needs (by design)

- **No write access to application code** — axiom designs and reviews; the owning builder (raj/dana) implements.
- **No database access** — structure design is on paper/records; dana owns the datastore, and no agent runs data changes (Rail 3).
- **No production access** — profiling uses representative workloads in the sandbox, not live systems (ops owns production).

## Notes

- Benchmarks run in the sandbox on representative data — never against production (that's ops's monitoring domain).
- New profiling tooling enters via the stack-profile + config, under a locked plan.

## MCP Marketplace Tools (added 2026-07-14)

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Ponytail** | [github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — MIT | Minimal code generation: "use stdlib sort" before "implement custom quicksort." /ponytail-review + /ponytail-audit detect over-engineered algorithm implementations. | ✅ YES — axiom's core principle is algorithmic efficiency. Ponytail prevents implementing custom data structures when stdlib/installed libs already suffice. See Engineering/MCP-MARKETPLACE.md for setup. |
