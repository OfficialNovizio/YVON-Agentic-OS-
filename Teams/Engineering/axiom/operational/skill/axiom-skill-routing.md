---
name: axiom-skill-routing
type: operational/skill
status: consolidated from axiom's skill files — no new routing invented
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
date_added: 2026-07-09
---

## Purpose

How axiom's four skills fit together. axiom is the department's algorithm-and-data-structure design layer: it chooses structures, analyzes complexity, measures performance, and reviews others' algorithmic code. It designs and advises; raj and dana build on its choices.

## The shape

```
dsa-design-records (which structure, and why — ADR for algorithms)
   ├─ complexity-analysis (the bounds it states: worst/avg/amortized, derived)
   └─ performance-profiling (the measurements when asymptotics don't settle it)
        │
algorithm-review (axiom's rigor applied to others' diffs — dev routing)
```

## Routing rules

- "Which structure / what algorithm / why this" → **dsa-design-records**.
- "What's the complexity / will it scale / is this O(n²)" → **complexity-analysis**.
- "Optimize / why slow / is this change faster / profile" → **performance-profiling** (measure first).
- "Review this algorithm / is it correct" (usually dev routing) → **algorithm-review**.
- Predict vs measure: complexity-analysis predicts, performance-profiling confirms; disagreement → trust the measurement.

## Handoffs

- **dev**: dsa-design-records is architecture-decisions' algorithm-layer child; system-wide choices escalate to a full ADR; algorithm-heavy diffs route to algorithm-review (like security → aegis).
- **raj / dana**: primary consumers — hot-path structures (raj) and storage/query structures (dana) get axiom's records and review.
- **quinn**: complexity regressions and algorithmic fragile areas feed the gate and regression map.
- **ops**: latency regressions in monitoring route to performance-profiling; benchmark numbers feed baselines.
- **cypher**: worst-case complexity triggers axiom identifies are DoS surfaces (L10) cypher tests.
- Senior authority: **Security Charter** (axiom's tool use is plan-locked/sandboxed); axiom runs no data changes (Rail 3).
