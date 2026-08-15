<!--
Custom skill — synthesized from Mehta 2016 + Gainsight practitioner + Barnes/
Ricketts + Vaidyanathan/Rabago 2020. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Mehta 2016 9th use across Client Success.
-->
---
name: churn-risk-prediction
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 9th use across Client Success."
  - "Gainsight — churn-prediction framework materials (institutional practitioner). gainsight.com."
  - "Vaidyanathan, Ashvin & Rabago, Ruben (2020). The Customer Success Professional's Handbook (Wiley). §8.9 with ally + kickoff."
  - "TSIA — churn benchmark research. Institutional."
  - "Barnes, Rev & Ricketts, Chris — Practitioner corpus on SaaS churn analysis (institutional practitioner writings)."
fulfills_catalog_entry: churn-risk-prediction (custom per §2 routing)
assigned_agent: retain (Client Success / Success/Retention/Expansion)
portable: true
date_added: 2026-07-31
tier: 3
description: Churn-risk prediction framework — uses ally health-score as primary input + additional risk signals (engagement decline / support-escalation / champion-departure / commercial-signal). Data-cited-not-vibes discipline (LOAD-BEARING). Escalation triggers to renewal-negotiation + operator + retain leadership. Trigger on "churn risk for [customer]", "at-risk accounts", "renewal risk assessment for [account]", "churn signal detection", "save motion for [at-risk customer]", or "portfolio churn risk analysis".
triggers:
  - churn risk for
  - at-risk accounts
  - renewal risk assessment for
  - churn signal detection
  - save motion for
  - portfolio churn risk analysis
  - churn score for
---

# Churn Risk Prediction

## Introduction

Churn-risk prediction discipline for retain — uses ally `customer-health-scoring`
as primary input + additional signals (engagement decline / support-escalation
/ champion-departure / commercial-signal). Data-cited-not-vibes discipline
(Mehta inherited). Escalation triggers to `renewal-negotiation` + operator.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Vibes-based churn prediction.** Same failure mode as ally health-scoring —
   CSM gut feel without cited signals. LOAD-BEARING per Principle 1 (inherited
   from Mehta discipline).
2. **Late detection.** Waiting for renewal-window to identify churn risk =
   no save-motion time. Continuous monitoring required.
3. **Prediction without intervention plan.** At-risk list without corresponding
   save-motion = observation without action.
4. **Escalation-threshold unclear.** When does risk trigger operator escalation
   vs CSM-led save-motion? Thresholds must be explicit.
5. **Portfolio-view missed.** Individual-account churn prediction without
   portfolio rollup = missing cohort-level risk patterns.
6. **Individual crisis DURING save-motion crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Churn risk for [customer]" / "at-risk accounts" / "portfolio churn risk analysis"
- "Renewal risk assessment for [account]" / "churn signal detection"
- "Save motion for [at-risk customer]" / "churn score for [account]"

Do NOT use for:
- Health scoring foundation → ally `customer-health-scoring` (Lead)
- Expansion motion → `expansion-motions` (retain sibling)
- Renewal negotiation execution → `renewal-negotiation` (retain sibling)
- Customer advocacy → `customer-advocacy` (retain sibling)
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
CHURN RISK SIGNALS (Mehta + Gainsight framework)

  Primary input:
    - Health score (from ally customer-health-scoring)

  Additional risk signals:
    - USAGE DECLINE — sustained decrease in adoption depth / breadth /
      frequency
    - ENGAGEMENT DROP — cadence decline in QBRs / executive-touchpoints
    - SUPPORT-ESCALATION SPIKE — sudden increase in escalations OR
      severity
    - CHAMPION DEPARTURE — key stakeholder leaves customer org
    - COMMERCIAL SIGNAL — non-payment / renewal-conversation avoidance /
      contract-scope challenge
    - COMPETITIVE ACTIVITY — customer evaluating competitor OR
      internal-build alternative
    - CONTRACT / LEGAL — dispute / discrepancy / material term change


RISK TIERS + ESCALATION

  YELLOW (moderate risk) — CSM-led save-motion
    - Health YELLOW OR 1-2 supporting signals
    - Intervention: CSM outreach + refresh-of-value-conversation

  ORANGE (elevated risk) — CSM + operator involvement
    - Health RED OR 3+ supporting signals
    - Intervention: exec sponsor re-engagement + tailored save-plan

  RED (critical risk) — operator + retain leadership + potentially crisis
    - Multiple RED signals OR imminent churn-declaration
    - Intervention: executive-level save-motion + potentially concessions +
      contract-restructure discussion


CHURN-PREDICTION OPERATIONAL SEQUENCE:

  Phase 1: SIGNAL INVENTORY                              (health + supporting signals per account)
  Phase 2: RISK SCORING + TIER ASSIGNMENT                (YELLOW / ORANGE / RED)
  Phase 3: SAVE-MOTION DESIGN PER TIER                   (per-tier intervention playbook)
  Phase 4: ESCALATION EXECUTION                          (CSM-led / CSM+operator / exec+retain leadership)
  Phase 5: PORTFOLIO ROLLUP + PATTERN DETECTION          (cohort-level risk patterns)
```

## Instructions

### Phase 1 — Signal inventory per account

- Pull health score from ally `customer-health-scoring`
- Inventory supporting signals per canonical list (usage / engagement /
  support / champion / commercial / competitive / contract)
- **Cite every signal.** Data-cited-not-vibes. LOAD-BEARING per Principle 1.

### Phase 2 — Risk scoring + tier assignment

- Aggregate health score + supporting signals into risk tier
- YELLOW / ORANGE / RED per tier criteria (Structure/Protocol above)
- Document rationale per tier assignment

### Phase 3 — Save-motion design per tier

- **YELLOW** — CSM-led outreach + refresh-of-value conversation
- **ORANGE** — CSM + executive-sponsor re-engagement + tailored save-plan
- **RED** — operator + retain leadership + executive-level save-motion +
  potentially contract-restructure discussion (coordinate with
  `renewal-negotiation`)

Per-tier playbook with owner + timeline + measurement.

### Phase 4 — Escalation execution

- Escalation-threshold enforcement (Structure/Protocol above)
- Per-tier owner + timeline
- Cross-agent coordination with operator + retain leadership + potentially
  beacon `crisis-comms` (Comms & PR) for reputation-adjacent churn

### Phase 5 — Portfolio rollup + pattern detection

- Aggregate per-CSM / per-segment / per-cohort views
- Pattern detection (recurring churn causes / cohort risk / competitor
  pressure patterns)
- Feed patterns back to ally `customer-health-scoring` for recalibration +
  to Product for product-improvement input

## Output Format

- Signal-inventory per account with cited signals
- Risk-scoring + tier assignment per account
- Save-motion playbook per tier
- Escalation report to CSM / operator / retain leadership per case
- Portfolio churn-risk rollup with pattern detection
- Cross-agent handoff briefs — to `renewal-negotiation` (renewal-timing
  save cases) + ally (health-score recalibration input) + Product (pattern
  feedback)

## Principles

1. **Never vibes-based churn prediction** — LOAD-BEARING per Purpose failure
   mode 1. Mehta discipline inherited via ally.
2. **Continuous monitoring, not window-based** — early detection = save-motion
   time.
3. **Every prediction maps to save-motion** — no observation without action.
4. **Escalation thresholds explicit** — YELLOW / ORANGE / RED with per-tier
   playbook.
5. **Portfolio-view + pattern detection** — cohort-level risk visibility.
6. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   at-risk customer identities stay in CS tools; aggregate churn-risk rollups
   for cross-department publication.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Signal data unavailable** for an account. Flag "insufficient data" per
  signal category; do NOT default to LOW-risk assumption. Coordinate with
  ally + Product / dana for data-gap resolution.
- **Save-motion pressure without root-cause understanding.** Route through
  Phase 1-2 first; do NOT skip to intervention.
- **RED risk with operator + retain leadership involvement** — coordinate
  with `renewal-negotiation` sibling for contract-restructure discussion +
  potentially herald / beacon (Comms & PR) for reputation-adjacent churn.
- **Sensitive-account churn** (strategic / reference / vocal-competitor
  customer). Escalate to operator + marcus / vista + potentially retain
  leadership for strategic-account save-plan.
- **Pattern detection reveals systemic issue** (product / pricing / support
  quality). Escalate to Product + operator; may require product-change or
  business-model adjustment.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-health-scoring` (custom, ally — Lead) | Primary input signal | Upstream |
| `qbr-executive-review-framework` (custom, ally — Lead) | QBR-surfaced risk signals | Coordination |
| `customer-lifecycle-value-mapping` (custom, ally — Lead) | Value-gap signals feed churn risk | Coordination |
| `expansion-motions` (custom, retain — sibling) | Health-GREEN accounts (no risk) → expansion; NOT at-risk | Complementary scope |
| `renewal-negotiation` (custom, retain — sibling) | RED-tier renewal-restructure discussion | Downstream |
| `customer-advocacy` (custom, retain — sibling) | Save-motion may involve reference-relationship building | Coordination |
| `support-analytics` (custom, keel — sibling agent) | Support-escalation signals | Upstream input |
| `crisis-comms` (custom, beacon — Comms & PR) | Reputation-adjacent churn | Escalation |
| Product (spec / metric / ux / loom) | Pattern feedback for product improvement | Cross-department feedback |
| Operator + retain leadership | RED-tier escalation | Escalation |
| Operator + marcus / vista | Strategic-account save-plan | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Vaidyanathan & Rabago — CS Professional's Handbook (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Professional%27s+Handbook-p-9781119624615)
- [Gainsight — Churn resources](https://www.gainsight.com/resources/)
- [TSIA](https://www.tsia.com/)
