<!--
Custom skill — synthesized from Reichheld + Dixon/Freeman/Toman + Bain + Zendesk
+ Salesforce practitioner. §11 + §14.2. Route D per §8.2.
-->
---
name: support-analytics
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Reichheld, Fred (2011 update). The Ultimate Question 2.0: How Net Promoter Companies Thrive in a Customer-Driven World. HBR Press. ISBN 978-1422173350. Canonical NPS text."
  - "Dixon, Matthew; Freeman, Karen; Toman, Nicholas (2013). The Effortless Experience: Conquering the New Battleground for Customer Loyalty. Portfolio. ISBN 978-1591845812. Canonical CES text."
  - "Bain & Company — NPS Prism benchmark research (institutional). bain.com."
  - "Zendesk — Customer Service benchmark reports (institutional practitioner). zendesk.com."
  - "Salesforce Research — State of Service reports (institutional practitioner). salesforce.com."
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 15th use."
fulfills_catalog_entry: support-analytics (custom per §2 routing)
assigned_agent: keel (Client Success / Support Ops)
portable: true
date_added: 2026-07-31
tier: 3
description: Support analytics framework — CSAT + NPS + CES measurement + segmentation + benchmarking + feedback loop to ally health-scoring + Product improvement. LOAD-BEARING individual-support-agent-perf-data-at-publication-surface refusal. Trigger on "CSAT measurement for [team]", "NPS analysis for [segment]", "CES measurement for [product]", "support metrics benchmark", "support analytics dashboard", or "support-signal feedback to health-scoring".
triggers:
  - CSAT measurement for
  - NPS analysis for
  - CES measurement for
  - support metrics benchmark
  - support analytics dashboard
  - support-signal feedback to health-scoring
  - Voice of Customer analysis
---

# Support Analytics

## Introduction

Support analytics discipline for keel — CSAT / NPS / CES measurement + reporting
+ feedback loop to ally health-scoring + Product improvement. Reichheld NPS +
Dixon/Freeman/Toman CES + Bain benchmarks + Zendesk / Salesforce State of
Service.

**Scope distinction:** keel owns support analytics DESIGN + measurement +
reporting. Feeds ally `customer-health-scoring` + Product improvement + operator
reporting.

Custom Route D per §8.2.

## Purpose

Prevents seven failure modes:

1. **Individual-support-agent-perf-data at publication surface.** Individual
   agent CSAT / NPS attribution external OR cross-department without HR
   discipline = Universal Principle 2 execution-surface violation. LOAD-
   BEARING per Principle 1.
2. **Vanity-metric-only reporting.** NPS alone without CES + operational
   metrics (response time / resolution rate / first-contact-resolution) =
   incomplete picture (Mehta discipline inherited from ally).
3. **Metric-without-action.** CSAT dashboards without corresponding action
   = observation without accountability.
4. **Segmentation-blind aggregate.** Overall NPS obscures segment issues
   (enterprise tier at 20 while tech-touch at 60 averages to acceptable but
   hides enterprise crisis).
5. **CES-CSAT-NPS confusion.** Different metrics measure different things —
   CSAT (transactional satisfaction), NPS (loyalty / advocacy propensity),
   CES (effort). Applying wrong metric to wrong question.
6. **Feedback-loop absent.** Support-analytics disconnected from ally
   health-scoring + Product improvement = insights die in dashboards.
7. **Individual crisis DURING analytics work.** HARD BOUNDARY.

## When to Use

Trigger on:
- "CSAT measurement for [team]" / "NPS analysis for [segment]" /
  "CES measurement for [product]"
- "Support metrics benchmark" / "support analytics dashboard"
- "Support-signal feedback to health-scoring" / "Voice of Customer analysis"

Do NOT use for:
- Tiered support architecture → `tiered-support-design` (sibling)
- SLA management → `sla-and-escalation-management` (sibling)
- Knowledge base → `knowledge-base-and-self-service` (sibling)
- Individual employee performance evaluation → HR + merit (P&C)
- Product-level analytics → Product + dana
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
METRIC-SELECTION FRAMEWORK

  CSAT (Customer Satisfaction Score)
    - Post-transaction survey ("How satisfied were you with this interaction?")
    - Typically 1-5 or 1-7 scale
    - Best for: interaction-level satisfaction tracking

  NPS (Net Promoter Score) — Reichheld
    - "How likely are you to recommend?" 0-10 scale
    - Promoters (9-10) − Detractors (0-6) = NPS
    - Best for: overall loyalty / advocacy propensity + trend

  CES (Customer Effort Score) — Dixon/Freeman/Toman
    - "How easy was it to resolve your issue?" typically 1-7 scale
    - Best for: support-interaction effort measurement — Effortless Experience
      research shows effort-reduction correlates with loyalty more than
      delight-creation

  OPERATIONAL METRICS (support-workflow)
    - First-Contact Resolution (FCR)
    - Response time / Resolution time (from sla-and-escalation-management)
    - Ticket volume + backlog
    - Escalation rate
    - Deflection rate (self-service — from knowledge-base-and-self-service)


CANONICAL SEGMENTATION

  - Customer tier (tech-touch / high-touch / enterprise)
  - Product / feature area
  - Support tier (T1 / T2 / T3)
  - Ticket type (bug / question / how-to / feature request)
  - Time period + trend
  - Geography (if applicable)


AGGREGATE-ONLY PUBLICATION DISCIPLINE (LOAD-BEARING)

  Individual support-agent CSAT / NPS attribution:
    - Internal team management: OK per HR + merit (P&C) discipline
    - Cross-department publication: HARD BOUNDARY
    - External publication: HARD BOUNDARY
    - Publication-surface aggregation to team / segment / portfolio level

  Universal Principle 2 execution-surface enforcement.


SUPPORT-ANALYTICS OPERATIONAL SEQUENCE:

  Phase 1: METRIC SELECTION PER OBJECTIVE                (CSAT / NPS / CES / operational)
  Phase 2: MEASUREMENT INSTRUMENTATION                    (survey design + operational data pipeline)
  Phase 3: SEGMENTATION + BENCHMARKING                    (per segment + industry benchmark)
  Phase 4: FEEDBACK LOOP TO ALLY + PRODUCT                (health-scoring + product improvement)
```

## Instructions

### Phase 1 — Metric selection per objective
Match metric to business objective (CSAT for interaction-level; NPS for
loyalty; CES for effort; operational for workflow).

### Phase 2 — Measurement instrumentation
- Survey design (question wording + response scale + timing)
- Operational data pipeline (from support platform)
- Coordinate with dana / Product for cross-system integration

### Phase 3 — Segmentation + benchmarking
- Segment views per canonical dimensions
- Industry benchmarks (Bain NPS Prism / Zendesk / Salesforce)
- Trend analysis + anomaly detection

### Phase 4 — Feedback loop
- Support-signal to ally `customer-health-scoring` support dimension
- Pattern insights to Product for improvement
- Executive reporting per cadence
- Aggregate publication only (LOAD-BEARING Principle 1)

## Output Format

- Metric-selection recommendation per objective
- Survey design + instrumentation plan
- Segmentation dashboard framework
- Feedback loop briefs to ally + Product
- Executive support-analytics report (aggregate-only)

## Principles

1. **Individual support-agent perf data NEVER at publication surface** —
   LOAD-BEARING per Purpose failure mode 1. Universal Principle 2 execution-
   surface enforcement.
2. **Multi-metric approach** — CSAT + NPS + CES + operational; no single-
   metric reporting.
3. **Metric maps to action** — every metric drives specific decision.
4. **Segmentation mandatory** — aggregate obscures segment issues.
5. **Metric-question fit** — CSAT / NPS / CES measure different things.
6. **Feedback loop to ally + Product** — insights drive decisions.
7. **No fabrication** — cited institutional + practitioner sources.
8. **Aggregate-only at publication surface** — Universal Principle 2 (LOAD-
   BEARING execution).
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Individual agent attribution request for external publication** — decline
  per Principle 1 — LOAD-BEARING. Coordinate with HR + merit + operator
  for HR-discipline handling.
- **Survey response rate low** — coordinate survey redesign + timing
  optimization; do NOT extrapolate from low-N samples.
- **Metric contradicts business intuition** — investigate before overriding;
  operator + retain + Product coordination.
- **Cross-department reporting request** aggregate-only; individual-identifiable
  only with employee-level agreement + HR coordination.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `tiered-support-design` (custom, keel — sibling) | Tier-specific analytics | Coordination |
| `sla-and-escalation-management` (custom, keel — sibling) | SLA-adherence metrics | Coordination |
| `knowledge-base-and-self-service` (custom, keel — sibling) | Deflection-rate metric | Coordination |
| `customer-health-scoring` (custom, ally — Lead) | Support-signal feeds health-score | Downstream |
| `churn-risk-prediction` (custom, retain — sibling agent) | Support-signal feeds churn signal | Downstream |
| Product / dana | Metric instrumentation + product improvement feedback | Cross-department |
| HR + merit (P&C) | Individual agent performance handling | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Reichheld, Fred — The Ultimate Question 2.0 (HBR Press)](https://store.hbr.org/product/the-ultimate-question-2-0-how-net-promoter-companies-thrive-in-a-customer-driven-world/11239)
- [Dixon, Freeman, Toman — The Effortless Experience (Portfolio)](https://www.penguinrandomhouse.com/books/311132/the-effortless-experience-by-matthew-dixon-and-nick-toman-and-rick-delisi/)
- [Bain — NPS Prism](https://www.bain.com/consulting-services/customer-strategy-and-marketing/nps-prism/)
- [Zendesk — Customer Service benchmarks](https://www.zendesk.com/)
- [Salesforce Research — State of Service](https://www.salesforce.com/resources/research-reports/)
- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
