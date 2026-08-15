<!--
Custom skill — synthesized from Ostrow AARRR + Andrew Chen + Amplitude +
Mixpanel + practitioner. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Andrew Chen 2nd use in quest.
-->
---
name: funnel-metrics-and-attribution
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Ostrow, Dave — AARRR pirate metrics framework (Acquisition / Activation / Retention / Revenue / Referral). Institutional practitioner canon."
  - "Chen, Andrew (2021). The Cold Start Problem (Harper Business). §8.9 2nd use in quest."
  - "Amplitude — activation-funnel + product-analytics practitioner corpus. amplitude.com."
  - "Mixpanel — event-based funnel analytics practitioner. mixpanel.com."
  - "Kaushik, Avinash. Web Analytics 2.0 (Wiley). Canonical web analytics practitioner text."
  - "Google Analytics 4 institutional documentation. developers.google.com/analytics."
fulfills_catalog_entry: funnel-metrics-and-attribution (custom per §2 routing)
assigned_agent: quest (Growth & Partnerships / Growth Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Funnel metrics + attribution framework — AARRR pirate metrics + funnel-stage instrumentation + attribution model selection (first-touch / last-touch / multi-touch / data-driven) + segmentation + optimization loop. LOAD-BEARING no-fabricated-attribution + Universal Principle 2 individual-user-data protection. Trigger on "funnel metrics for [product]", "attribution model for [campaign]", "AARRR framework", "conversion analysis for [stage]", "multi-touch attribution setup", or "funnel optimization for [product]".
triggers:
  - funnel metrics for
  - attribution model for
  - AARRR framework
  - conversion analysis for
  - multi-touch attribution setup
  - funnel optimization for
  - pirate metrics for
  - attribution reporting for
---

# Funnel Metrics and Attribution

## Introduction

Funnel metrics + attribution framework for quest — Ostrow AARRR + Andrew
Chen + Amplitude / Mixpanel / Google Analytics practitioner + Kaushik web-
analytics canonical.

**Scope distinction:** quest OWNS funnel-metric framework + attribution
model selection. dana / Product execute instrumentation. lure operates
attribution reporting for marketing decisions.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Fabricated attribution.** Attribution claims without cited data + model
   transparency = fantasy attribution. LOAD-BEARING per Principle 1.
2. **Single-touch attribution default.** Last-touch attribution over-credits
   final channel + under-credits awareness channels. Multi-touch or data-
   driven needed for complex funnels.
3. **Individual-user data at publication surface.** Individual user IDs +
   PII + identifiable behavior at cross-department publication = Universal
   Principle 2 violation. LOAD-BEARING per Principle 2.
4. **AARRR without segmentation.** Aggregate funnel obscures segment issues
   (enterprise vs SMB / paid vs organic / product tier).
5. **Vanity-metric focus** — MAU / signup count without activation-quality =
   Mehta-inherited discipline violation.
6. **Individual crisis DURING attribution crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Funnel metrics for [product]" / "AARRR framework" / "pirate metrics for [stage]"
- "Attribution model for [campaign]" / "multi-touch attribution setup"
- "Conversion analysis for [stage]" / "funnel optimization for [product]"
- "Attribution reporting for [period]"

Do NOT use for:
- Growth strategy → `growth-strategy` (quest sibling)
- Pricing → `pricing-and-packaging` (quest sibling)
- GTM motion → `gtm-motion-selection` (quest sibling)
- TTFV (product-activation-stage specific) → kickoff `time-to-first-value-optimization`
- Individual PII handling → operator + canopy + counsel
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
AARRR PIRATE METRICS (Ostrow canonical)

  ACQUISITION — how users arrive (channel / campaign / referral)
  ACTIVATION — first-value experience (coordinate with kickoff TTFV)
  RETENTION — return + ongoing engagement (coordinate with ally health-scoring)
  REVENUE — monetization + expansion (coordinate with pricing + retain)
  REFERRAL — organic growth + advocacy (coordinate with retain customer-advocacy)


ATTRIBUTION MODELS

  FIRST-TOUCH — 100% credit to first channel
    Best for: awareness measurement
    Weak for: closing-touch value

  LAST-TOUCH — 100% credit to final channel
    Best for: conversion channel identification
    Weak for: awareness contribution

  LINEAR — equal credit across touchpoints
    Best for: balanced view when data limited
    Weak for: identifying high-impact touchpoints

  TIME-DECAY — more credit to closer-to-conversion touches
    Best for: recent-influence emphasis

  POSITION-BASED — first + last weighted; middle spread
    Best for: awareness + conversion balance

  DATA-DRIVEN — algorithm-derived credit (typically ML-based)
    Best for: complex funnels with sufficient data
    Requires: significant conversion volume + tool support


SEGMENTATION DIMENSIONS

  Customer tier / persona
  Product / feature area
  Channel / campaign
  Geography / language
  Cohort (signup period)
  New vs returning


OPERATIONAL SEQUENCE:

  Phase 1: METRIC-SELECTION FRAMEWORK                   (AARRR mapping per product)
  Phase 2: INSTRUMENTATION COORDINATION                  (with dana + Product)
  Phase 3: ATTRIBUTION MODEL SELECTION                    (per-decision-use-case)
  Phase 4: SEGMENTATION + OPTIMIZATION LOOP               (LOAD-BEARING aggregate-only)
```

## Instructions

### Phase 1 — Metric-selection framework
Map AARRR to product specifics. Define north-star metric + input metrics.

### Phase 2 — Instrumentation coordination
- Event tracking (dana + Product)
- Funnel views (Amplitude / Mixpanel / product-analytics tool)
- Cross-system integration (marketing → product → CRM)

### Phase 3 — Attribution model selection
- Match model to decision use-case
- Multi-model for different questions (last-touch for channel-optimization;
  first-touch for awareness measurement; data-driven for complex funnels)
- Document model transparency (Principle 1)

### Phase 4 — Segmentation + optimization loop
- Segment views per canonical dimensions
- Anomaly detection + benchmark tracking
- **Aggregate-only publication** — LOAD-BEARING Principle 3

## Output Format

- Metric-selection framework (AARRR + north-star + inputs)
- Instrumentation coordination brief (dana + Product)
- Attribution-model-per-decision-use-case memo
- Segmentation dashboard framework
- Optimization loop with root-cause discipline

## Principles

1. **Never fabricated attribution** — LOAD-BEARING per failure mode 1.
2. **Attribution model transparency** — document model + limitations.
3. **Individual-user data NEVER at publication surface** — LOAD-BEARING per
   failure mode 3. Universal Principle 2 execution-surface enforcement.
4. **Multi-model where funnel complex** — no single-touch default.
5. **Segmentation mandatory** — aggregate obscures segment issues.
6. **No vanity metrics** — Mehta discipline inherited via ally at coordination
   surfaces.
7. **No fabrication** — cited sources. Universal Principle 1.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Attribution data insufficient** for chosen model. Flag "insufficient
  volume — using [alternative model] with confidence caveat." Coordinate with
  dana + Product for instrumentation gap.
- **Individual-user data request for external publication** — decline per
  Principle 3. LOAD-BEARING. Aggregate-only.
- **Attribution model politics** (channel owners defending credit) — escalate
  to operator + quest for cross-functional resolution.
- **Cross-domain funnel** (multiple products / cross-sell) — coordinate with
  Product + retain for cohort-appropriate attribution.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `growth-strategy` (custom, quest — sibling) | Growth-stage context | Upstream |
| `pricing-and-packaging` (custom, quest — sibling) | Pricing-vs-conversion metrics | Coordination |
| `gtm-motion-selection` (custom, quest — sibling) | Motion metrics per model | Coordination |
| `time-to-first-value-optimization` (custom, kickoff — Client Success) | Activation-stage TTFV instrumentation coordination | Cross-department |
| `customer-health-scoring` (custom, ally — Client Success) | Retention-stage feed | Cross-department |
| lure siblings + Brand Studio | Marketing attribution reporting | Cross-agent |
| dana (Engineering) + Product | Instrumentation execution | Cross-department |
| canopy `data-residency-mapping` | PII data-residency compliance | Cross-department |
| Operator + counsel | Attribution-data compliance | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Amplitude — Analytics + Funnel](https://amplitude.com/)
- [Mixpanel](https://mixpanel.com/)
- [Kaushik, Avinash — Web Analytics 2.0 (Wiley)](https://www.wiley.com/en-us/Web+Analytics+2.0-p-9780470529393)
- [Google Analytics 4](https://developers.google.com/analytics)
- [Chen, Andrew — The Cold Start Problem](https://www.harpercollins.com/products/the-cold-start-problem-andrew-chen)
- [Ostrow, Dave — AARRR Pirate Metrics overview](https://www.mckinsey.com/)
