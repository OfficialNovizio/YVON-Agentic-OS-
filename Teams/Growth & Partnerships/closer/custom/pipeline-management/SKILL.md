<!--
Custom skill — synthesized from Roberge + Winning by Design + practitioner.
§11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Roberge 3rd use in G&P + Winning by Design 4th across fleet.
-->
---
name: pipeline-management
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Roberge, Mark (2015). The Sales Acceleration Formula (Wiley). §8.9 3rd use in G&P."
  - "Winning by Design — Pipeline Management + SaaS Sales Math (institutional practitioner). §8.9 4th use across fleet."
  - "Salesforce — Pipeline Management practitioner materials (institutional). salesforce.com."
  - "Gong.io — Sales conversation intelligence + pipeline practitioner. gong.io."
  - "Clari — Revenue operations + forecast practitioner. clari.com."
fulfills_catalog_entry: pipeline-management (custom per §2 routing)
assigned_agent: closer (Growth & Partnerships / Sales / BD)
portable: true
date_added: 2026-07-31
tier: 3
description: Pipeline management framework — stage discipline + hygiene + forecast accuracy + coaching. LOAD-BEARING no-forecast-without-cited-stage-conversion-data. Trigger on "pipeline hygiene for [team]", "forecast accuracy for [period]", "pipeline stage discipline", "pipeline coaching cadence", "deal review for [pipeline]", or "pipeline health assessment".
triggers:
  - pipeline hygiene for
  - forecast accuracy for
  - pipeline stage discipline
  - pipeline coaching cadence
  - deal review for
  - pipeline health assessment
  - forecast rollup for
---

# Pipeline Management

## Introduction

Pipeline management framework for closer — Roberge + Winning by Design + Salesforce
+ Gong + Clari practitioner corpus.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Forecast without cited stage-conversion data.** Forecast built on vibes =
   inaccurate + damages CFO planning. LOAD-BEARING per Principle 1.
2. **Stage inflation.** Deals moved to later stages without stage-criteria
   satisfaction = false-positive pipeline + forecast blows.
3. **Pipeline hygiene ignored.** Stale deals not closed-lost = inflated
   pipeline + wasted rep-attention.
4. **Coaching absent from pipeline reviews.** Reviews as reporting-only miss
   coaching opportunity.
5. **Forecast without confidence-tier segmentation.** All-or-nothing forecast
   without commit / best-case / pipeline tiers = misleading CFO.
6. **Individual crisis DURING pipeline-crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Pipeline hygiene for [team]" / "forecast accuracy for [period]"
- "Pipeline stage discipline" / "pipeline coaching cadence"
- "Deal review for [pipeline]" / "pipeline health assessment"
- "Forecast rollup for [org]"

Do NOT use for:
- Sales methodology → `sales-methodology-and-playbook` (closer sibling)
- Deal negotiation → `deal-negotiation` (closer sibling)
- Customer discovery → `customer-discovery` (closer sibling)
- Actual pipeline execution → sales team + operator
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
STAGE DISCIPLINE (Winning by Design + Roberge)

  Standard stages (customize per business):
    1. Prospect — identified target
    2. Discovery — qualification + needs assessment
    3. Solution — proposal + demo + tailoring
    4. Proposal — formal offer
    5. Negotiation — contract terms
    6. Closed-Won / Closed-Lost

  Stage-criteria explicit per stage. Deal moves ONLY when criteria met.
  No stage-inflation.


FORECAST-CONFIDENCE TIERS (Clari + practitioner)

  COMMIT — high confidence; will close per rep + manager judgment + data
  BEST-CASE — likely close; some uncertainty
  PIPELINE — in flight; longer-term probable
  OMITTED — early-stage / uncertain; not in forecast

  Forecast = COMMIT + weighted BEST-CASE (weighting per historical conversion).


PIPELINE HYGIENE

  - Stale deal review (deals unchanged > N days per stage)
  - Close-lost discipline (rep must close-lost with reason; not "in-flight" indefinitely)
  - No-response cadence (multiple no-response = closed-lost per policy)


COACHING CADENCE

  - Weekly pipeline reviews (per rep + manager)
  - Deal-specific coaching on stuck / high-value deals
  - Methodology-application check
  - Forecast-accuracy retrospective


OPERATIONAL SEQUENCE:

  Phase 1: STAGE DISCIPLINE                              (criteria per stage)
  Phase 2: PIPELINE HYGIENE                              (stale review + close-lost discipline)
  Phase 3: FORECAST-CONFIDENCE TIERING (LOAD-BEARING)     (cited stage-conversion data)
  Phase 4: COACHING CADENCE                              (weekly reviews + methodology check)
```

## Instructions

### Phase 1 — Stage discipline
- Stage-criteria explicit per stage
- Deal moves ONLY when criteria met

### Phase 2 — Pipeline hygiene
- Stale deal review
- Close-lost with reason discipline

### Phase 3 — Forecast-confidence tiering (LOAD-BEARING)
- Commit / Best-case / Pipeline / Omitted
- **Cited stage-conversion data** per Principle 1

### Phase 4 — Coaching cadence
- Weekly pipeline reviews per rep
- Deal-specific coaching
- Methodology-application check

## Output Format

- Stage-criteria document
- Pipeline hygiene report
- Forecast per confidence tier with cited conversion data
- Coaching cadence design + weekly deal-review template

## Principles

1. **Never forecast without cited stage-conversion data** — LOAD-BEARING per
   failure mode 1.
2. **Stage-criteria enforced** — no stage-inflation.
3. **Pipeline hygiene mandatory** — stale-deal + close-lost discipline.
4. **Forecast tiered** — commit / best-case / pipeline / omitted.
5. **Coaching integrated in reviews** — not reporting-only.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   rep pipeline data handled per HR + merit discipline.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Stage-conversion data insufficient** for confident forecast — flag
  "insufficient data — assumption X" per Principle 1. Widen confidence
  interval; do NOT round-number forecast.
- **Forecast pressure to inflate** — decline per Principle 1. Escalate to
  operator + CFO with transparent forecast + risk-flags.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `sales-methodology-and-playbook` (custom, closer — sibling) | Playbook methodology-check in pipeline reviews | Coordination |
| `deal-negotiation` (custom, closer — sibling) | Negotiation stage deals | Coordination |
| `customer-discovery` (custom, closer — sibling) | Discovery-stage pipeline discipline | Coordination |
| `funnel-metrics-and-attribution` (custom, quest — Lead) | Pipeline metrics feed funnel attribution | Coordination |
| CFO + operator | Forecast rollup | Escalation |
| merit + hire (P&C) | Individual rep coaching + perf-mgmt | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Roberge — The Sales Acceleration Formula (Wiley)](https://www.wiley.com/en-us/The+Sales+Acceleration+Formula-p-9781119047070)
- [Winning by Design](https://winningbydesign.com/)
- [Salesforce — Pipeline Management](https://www.salesforce.com/)
- [Gong.io](https://www.gong.io/)
- [Clari](https://www.clari.com/)
