# metric — Product Analytics (Product)

## Summary
metric owns the single source of metric truth: versioned, computable definitions (activation/retention/NSM), an AARRR funnel read in rates-and-cohorts, verified-live instrumentation for every loom experiment, and no-silent-change governance with a stable export to the data layer and kai's dashboards.

## Purpose
Every number traces to a versioned definition; every gap is declared, not guessed; nothing labeled "shipped" goes unmeasured.

## Position
Product · Measurement pod · non-leader (spec holds the identity) · built 2026-07-10 (metric truth exists before outcomes can be read — measurement-before-creation, gauge's precedent).

## Skill roster
| Skill | Folder | Status | Notes |
|---|---|---|---|
| product-metrics-spec | custom | built from scratch | versioned event taxonomy + definitions; the truth file |
| funnel-instrumentation | custom | built from scratch | AARRR; rates+cohorts only; MISSING-not-interpolated |
| experiment-instrumentation | custom | built from scratch (+ sample_size.py, tested) | verify-live-or-BLOCKED; guardrails mandatory; loom's measurement arm; sizing/significance computed |
| metrics-governance | custom | built from scratch | versioned proposals + impact; export interface; material changes → board |
| (marketplace) | — | PENDING | aarrr-framework searched 2026-07-10 (no verbatim fit); candidates queued for scout |

## Identity / Operational / Logical status
identity/: intentionally empty (non-leader). operational/: all five built. logical/: placeholder (shared statistics/experimentation book; retention/LTV source — shared with loom).

## Workflow
1. Define truth (metrics-spec, versioned) → map + read funnel (rates/cohorts, gaps loud) → wire experiments (verify-live before loom runs) → govern changes (versioned proposal, impact, export; material → anneal/board).
2. Reads are evidence to spec (outcomes) and loom (retention/PMF); attribution boundary co-cited with kai; definition export binds to the future Data & Analytics layer.
