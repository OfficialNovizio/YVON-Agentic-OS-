<!--
Custom skill — built from scratch, synthesized from named sources
(Mehta/Steinman/Murphy 2016 + Gainsight framework + Vaidyanathan/Rabago 2020
+ Bhatt/Chinnappa 2018 + practitioner corpus). Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found mcpmarket CX Health
Scoring + Customer Success Manager Analytics — community publishers, unknown
credibility. Mehta 2016 + Gainsight framework provides stronger source
grounding. §4.6 reclass to custom Route D. Marketplace skills noted as
complementary tactical-execution tools.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Mehta 2016 grounds ally 3 skills + kickoff 2 + retain 1
(6× within Client Success — strongest §8.9 use in fleet so far).
-->
---
name: customer-health-scoring
type: custom
status: built from scratch (reclassified from marketplace unknown-credibility per §4.6)
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success: How Innovative Companies Are Reducing Churn and Growing Recurring Revenue. Wiley. ISBN 978-1119167969. Canonical practitioner text on customer success from Gainsight CEO + co-founders. §8.9 6× use across Client Success — grounds ally 3 skills + kickoff 2 + retain 1."
  - "Vaidyanathan, Ashvin & Rabago, Ruben (2020). The Customer Success Professional's Handbook: How to Thrive in One of the World's Fastest Growing Careers—While Driving Growth For Your Company. Wiley. ISBN 978-1119624615. Named practitioners (Gainsight)."
  - "Bhatt, Nirav & Chinnappa, Steve (2018). The Customer Success Economy: Why Every Aspect of Your Business Model Needs A Paradigm Shift. Wiley. ISBN 978-1119572763. Named practitioners."
  - "Gainsight — health-scoring framework materials (institutional practitioner). gainsight.com."
  - "TSIA (Technology Services Industry Association) — customer-success benchmark research. Institutional. tsia.com."
fulfills_catalog_entry: customer-health-scoring (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found mcpmarket CX Health Scoring + related — community publishers, unknown credibility. Mehta 2016 + Gainsight framework provides stronger grounding. §4.6 reclass."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 canonical sources — well above §8.0 two-book minimum."
assigned_agent: ally (Client Success / CS Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Customer health-scoring framework — multi-dimensional weighted score (usage + engagement + relationship + commercial + product-fit dimensions) grounded in Mehta 2016 + Gainsight framework + Vaidyanathan/Rabago 2020 + TSIA benchmarks. Cited-data-only discipline (never health scores from fabricated data). Segmentation by customer tier (tech-touch / high-touch / enterprise). Trigger on "health score for [customer]", "customer health dashboard", "at-risk customers", "health score dimensions", "segment health scores", "health score benchmark", or "health-scoring framework for [tier]".
triggers:
  - health score for
  - customer health dashboard
  - at-risk customers
  - health score dimensions
  - segment health scores
  - health score benchmark
  - health-scoring framework for
  - customer health rollup for
  - green yellow red customer scoring
---

# Customer Health Scoring

## Introduction

This skill packages customer health-scoring discipline for ally — the
foundational CS metric that drives most other CS work (churn prediction /
expansion opportunities / QBR prep / renewal risk assessment). Multi-
dimensional weighted score grounded in Mehta 2016 + Gainsight framework +
Vaidyanathan/Rabago 2020 practitioner corpus + TSIA benchmarks.

**Scope distinction:** ally OWNS the health-scoring framework + coordinates
data-signal collection. Product analytics team (dana or Product) provides
usage data; support team (keel `support-analytics`) provides support signals;
CS reps provide relationship signals. ally rolls up into health score +
segments accounts by health.

Custom Route D per §8.2 — cited rubric grounded in canonical CS practitioner
corpus. Marketplace CX Health Scoring skills noted as tactical-execution
tools that CS ops teams can use once ally scopes framework.

## Purpose

Prevents six failure modes:

1. **Vibes-based health scoring.** CS reps grading customers "green / yellow /
   red" based on gut feel without cited data signals = inconsistent
   scoring across reps + biased by recent-conversation memory. Health
   scoring must be data-cited. LOAD-BEARING per Principle 1.
2. **Single-dimension score.** Usage-only health scoring misses relationship
   + commercial + engagement dimensions. Multi-dimensional score is
   discipline.
3. **Uniform-tier score application.** Enterprise customer's health signals
   differ from tech-touch customer's — enterprise-tier weights
   relationship-strength heavier; tech-touch weights product-usage heavier.
   Applying single formula across tiers = wrong scores per segment.
4. **Health-score inflation over time.** Reps optimize to their score;
   scores drift upward without accompanying business-outcome improvement.
   Periodic recalibration + score-decay-on-signal-absence prevents drift.
5. **Score without action.** Health score that doesn't drive intervention =
   dashboard-decoration. Every score tier maps to a specific action pattern.
6. **Individual crisis DURING CS-workflow.** CS reps under quarter-end
   renewal-pressure + personal distress can coincide. HARD BOUNDARY per
   Universal Principle 3.

ally uses this skill as foundational CS metric — invoked at CS setup + at
periodic recalibration + at every renewal / expansion / churn-risk decision.

## When to Use

Trigger on:

- "Health score for [customer]" / "customer health dashboard" / "at-risk customers"
- "Health score dimensions" / "health-scoring framework for [tier]"
- "Segment health scores" / "customer health rollup for [segment]"
- "Health score benchmark" / "green yellow red customer scoring"
- Handoff from retain `churn-risk-prediction` for health-score input
- Handoff from renewal / expansion decisions

Do NOT use for:

- **Churn prediction beyond health-score input** → retain `churn-risk-prediction`
- **Onboarding metrics + activation** → kickoff `time-to-first-value-optimization`
- **Support-metrics (CSAT/NPS/CES)** → keel `support-analytics`
- **QBR content beyond health-score summary** → ally `qbr-executive-review-framework`
- **CS platform selection** → ally `cs-tech-stack-selection`
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

The health-scoring workflow combines dimensions + weights + segmentation +
action-mapping:

```
CANONICAL HEALTH-SCORE DIMENSIONS (Mehta 2016 + Gainsight framework)

  USAGE / ADOPTION
    - Depth of product usage (features adopted)
    - Breadth of product usage (users active / seats-activated)
    - Frequency of usage (DAU/MAU-adjacent metrics)
    - Trend (usage growing / stable / declining)

  ENGAGEMENT
    - Executive sponsor engagement
    - Cadence of business-review attendance
    - Community / event participation
    - Marketing-content engagement (case-study participation, reference calls)

  RELATIONSHIP
    - Champion presence + strength
    - Executive-sponsor alignment
    - Multi-stakeholder relationship depth (not single-person dependency)
    - CSM-relationship strength

  COMMERCIAL
    - Contract terms (multi-year vs annual vs month-to-month)
    - Payment history + AR status
    - Contract-value-tier
    - Renewal timing (approaching vs distant)

  PRODUCT-FIT
    - Explicit-fit indicators (ICP match / use-case fit / expansion-fit)
    - Segment fit
    - Deployment / integration completeness

  SUPPORT / SATISFACTION (input from keel)
    - Support-ticket volume + severity
    - Escalation history
    - CSAT / NPS / CES scores
    - Support-agent-flagged concerns


SEGMENTATION BY CUSTOMER TIER (Mehta 2016)

  TECH-TOUCH (typically <$5-25k ARR)
    - Heavier usage-signal weight
    - Automated health signals from product data
    - Digital-only intervention (email / in-product / help docs)
    - Health-score dashboard automated

  HIGH-TOUCH / MID-MARKET (typically $25-250k ARR)
    - Balanced usage + relationship + support signals
    - Semi-automated + CSM-flagged signals
    - Mix of digital + human intervention
    - Quarterly health-review by CSM

  ENTERPRISE ($250k+ ARR)
    - Relationship + executive-engagement signals weighted heavier
    - CSM-primary flagging + augmented by data
    - High-touch intervention across CSM + executive sponsor
    - QBR-cadence health review


HEALTH-SCORE OUTPUT

  Traffic-light or numeric (0-100) — typically:
    GREEN (75-100)   → Healthy; renewal + expansion opportunity
    YELLOW (50-74)   → Watch; targeted intervention needed
    RED (0-49)       → At-risk; renewal-risk + escalation

  Rollup views:
    - Per-account
    - Per-segment
    - Per-CSM book
    - Portfolio-level (renewal-cohort-at-risk)


HEALTH-SCORING OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: DIMENSION + WEIGHT SETUP                    (per tier — tech-touch / high-touch / enterprise)
  Phase 2: DATA-SIGNAL SOURCING                        (usage + engagement + relationship + commercial + product-fit + support)
  Phase 3: SCORE CALCULATION + SEGMENTATION            (per account + per segment)
  Phase 4: ACTION MAPPING PER SCORE TIER               (green/yellow/red → specific interventions)
  Phase 5: PERIODIC RECALIBRATION + SCORE-DECAY        (prevent drift; align with business outcomes)
```

## Instructions

### Phase 1 — Dimension + weight setup per tier

For each customer tier (tech-touch / high-touch / enterprise):

- **Select dimensions** — usage, engagement, relationship, commercial,
  product-fit, support (base 6; may customize per business)
- **Set weights per tier** — reflecting Mehta 2016 discipline that tier
  segmentation drives weight differences
- **Document weighting rationale** — cited framework or business-specific
  reasoning

Output: dimension + weight matrix per tier.

### Phase 2 — Data-signal sourcing

Per dimension, source data:

- **Usage / adoption** — product analytics (dana / Product coordination)
- **Engagement** — CSM logs + community platform + marketing engagement
- **Relationship** — CSM-flagged; multi-stakeholder mapping in CRM
- **Commercial** — CRM + billing system
- **Product-fit** — ICP-fit flags + segment tags
- **Support** — keel `support-analytics` handoff (ticket volume + CSAT / NPS)

**Cited-data-only.** No signals from CS-rep vibes without underlying data.
LOAD-BEARING per Principle 1.

### Phase 3 — Score calculation + segmentation

- Weighted score per account (0-100)
- Segmentation per tier (tech-touch / high-touch / enterprise)
- Rollup views (per-account / per-segment / per-CSM book / portfolio-level)

### Phase 4 — Action mapping per score tier

**Every score tier maps to a specific action pattern.** No dashboard-
decoration scores.

- **GREEN** → renewal + expansion motion coordination with retain
  (expansion-motions skill)
- **YELLOW** → targeted intervention (CSM outreach / executive-engagement
  refresh / product-adoption push)
- **RED** → escalation to retain (churn-risk-prediction) + operator + save
  motion

### Phase 5 — Periodic recalibration + score-decay

- **Quarterly recalibration** — validate weights against actual outcomes
  (do YELLOW accounts actually convert to RED at higher rate than GREEN? Is
  churn-prediction accuracy improving over time?)
- **Score-decay on signal-absence** — accounts with stale signals decay
  score to prevent drift
- **Business-outcome alignment** — health scores should correlate with
  business outcomes (renewal rates / expansion rates / NPS trends)

## Output Format

Each invocation produces one or more of:

- **Dimension + weight matrix per tier** — with cited rationale
- **Data-signal sourcing plan** — per-dimension source with coordination
  briefs to Product / support / CSM / CRM
- **Health-score dashboard framework** — per-account + segment views
- **Action-mapping playbook** — per-tier interventions
- **Periodic recalibration report** — quarterly outcome validation
- **Cross-agent handoff briefs** — to retain (churn + expansion) + kickoff
  (onboarding activation) + keel (support-signal input) + Product / dana

## Principles

1. **Never health scoring from CS-rep vibes without cited data signals** —
   LOAD-BEARING per Purpose failure mode 1. Data-cited signals only.
2. **Never single-dimension scoring** — multi-dimensional framework required.
3. **Segmentation by customer tier** — weights vary per tier (Mehta 2016
   discipline).
4. **Every score tier maps to action** — no dashboard-decoration scores.
5. **Periodic recalibration** — quarterly outcome validation prevents drift.
6. **Score-decay on signal-absence** — prevents stale-signal inflation.
7. **No fabrication** — cited institutional + practitioner sources (Mehta
   + Gainsight + Vaidyanathan/Rabago + TSIA). Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2.
   Individual customer health scores aggregate to segment/portfolio views
   for cross-department publication. Individual scores stay in CS tools +
   CSM books, never in press / investor / all-hands materials without
   customer sign-off.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Mehta 2016 + Vaidyanathan/Rabago 2020 + Bhatt/Chinnappa
    2018 + Gainsight + TSIA are Tier B. Downgrade path in `logical/README.md`.

## Fallback

- **Data-signal unavailable for a dimension** (e.g., no product usage data
  for a customer using integrations). Flag "insufficient data" for that
  dimension; do NOT invent signal or default to average. Coordinate with
  Product / dana for data-gap resolution.
- **CS-rep pressure for higher score** on renewal-approaching account.
  Decline per Principle 1. Score reflects data, not renewal-timing pressure.
- **Health-score-vs-business-outcome misalignment** discovered in
  recalibration. Route to ally + operator for weight-tuning; may require
  dimension re-selection. Do NOT ignore misalignment.
- **New customer segment** (e.g., new product tier launch) needing health-
  score framework. Route through Phase 1 (dimension + weight setup);
  operator + Product coordination for signal-availability confirmation.
- **Cross-venture / cross-product health score complexity.** Escalate to
  operator + marcus / vista (Executive Office) for portfolio-level health-
  scoring architecture decision.
- **Individual customer health score requested for press / investor /
  all-hands materials.** Aggregate-only per Principle 8. Route through
  operator + customer sign-off for individual-customer use.
- **Individual crisis signal during health-scoring conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-lifecycle-value-mapping` (custom, ally — sibling) | Health-score input for lifecycle-value analysis | Downstream |
| `qbr-executive-review-framework` (custom, ally — sibling) | Health-score summary for QBR content | Downstream |
| `cs-tech-stack-selection` (custom, ally — sibling) | Health-scoring platform capabilities for tech-stack decision | Coordination |
| `time-to-first-value-optimization` (custom, kickoff — sibling agent) | Onboarding-activation signals feed health-score dimension | Upstream input |
| `onboarding-playbooks-per-segment` (custom, kickoff — sibling agent) | Segment definitions align with health-score segmentation | Coordination |
| `churn-risk-prediction` (custom, retain — sibling agent) | Health-score is primary input for churn-risk model | Downstream |
| `expansion-motions` (custom, retain — sibling agent) | GREEN health score triggers expansion motion evaluation | Downstream |
| `renewal-negotiation` (custom, retain — sibling agent) | Health-score input for renewal risk assessment | Downstream |
| `tiered-support-design` (custom, keel — sibling agent) | Support-signal feeds health-score support dimension | Upstream input |
| `support-analytics` (custom, keel — sibling agent) | CSAT / NPS / CES feed health-score support dimension | Upstream input |
| dana (Engineering) / Product (spec / metric) | Usage-analytics data source | Cross-department upstream |
| CRM / billing system operations | Commercial-dimension data source | Cross-department |
| beacon `data-room-discipline` (Comms & PR) | Aggregate health-score rollups for investor / DD backing | Cross-department (aggregate-only per Principle 8) |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every health-scoring artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success%3A+How+Innovative+Companies+Are+Reducing+Churn+and+Growing+Recurring+Revenue-p-9781119167969)
- [Vaidyanathan & Rabago — The Customer Success Professional's Handbook (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Professional%27s+Handbook-p-9781119624615)
- [Bhatt & Chinnappa — The Customer Success Economy (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Economy-p-9781119572763)
- [Gainsight — Customer Success framework materials](https://www.gainsight.com/resources/)
- [TSIA — Technology Services Industry Association](https://www.tsia.com/)
- [Nick Mehta — Gainsight profile](https://www.gainsight.com/nick-mehta/)
