<!--
Custom skill — synthesized from Mehta 2016 + Winning by Design + Fisher & Ury
+ Gainsight + Kellblog. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Fisher & Ury 2nd use (kickoff MSP + this). Winning by Design
3rd use (kickoff + retain expansion + this). Mehta 2016 11th use across
Client Success.
-->
---
name: renewal-negotiation
type: custom
status: built from scratch
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 11th use across Client Success."
  - "Winning by Design — SaaS Renewal methodology (institutional practitioner). §8.9 3rd use (kickoff + retain expansion + this)."
  - "Fisher, Roger & Ury, William (2011, 3rd ed.). Getting to Yes (Penguin). §8.9 2nd use (kickoff MSP + this). BATNA + principled negotiation."
  - "Ury, William (2007 reissue). Getting Past No: Negotiating in Difficult Situations. Bantam. Companion to Getting to Yes."
  - "Gainsight — Renewal-strategy materials (institutional practitioner)."
  - "Kellblog — SaaS renewal + NRR metrics writings (institutional practitioner)."
fulfills_catalog_entry: renewal-negotiation (custom per §2 routing)
assigned_agent: retain (Client Success / Success/Retention/Expansion)
portable: true
date_added: 2026-07-31
tier: 3
description: Renewal-negotiation framework — value-realized-evidence primacy (LOAD-BEARING) + BATNA discipline (Fisher & Ury) + Winning by Design SaaS Renewal methodology + Gainsight renewal-strategy. Renewal window T-90 to T-180 days. Trigger on "renewal for [customer]", "renewal negotiation for [account]", "renewal timing for [customer]", "renewal terms for [account]", "BATNA for renewal", or "renewal escalation for [customer]".
triggers:
  - renewal for
  - renewal negotiation for
  - renewal timing for
  - renewal terms for
  - BATNA for renewal
  - renewal escalation for
  - contract-restructure at renewal for
  - multi-year renewal for
---

# Renewal Negotiation

## Introduction

Renewal-negotiation discipline for retain — Winning by Design SaaS Renewal +
Fisher & Ury BATNA + Mehta 2016 land-and-expand + Gainsight renewal-strategy
+ Kellblog SaaS renewal metrics.

**Scope distinction:** retain SCOPES renewal-negotiation strategy + coordinates.
Operator + sales + CFO EXECUTE actual contract negotiation. Legal counsel
required for material term changes.

Custom Route D per §8.2.

## Purpose

Prevents seven failure modes:

1. **Renewal-negotiation without value-realized-evidence assembly.** Entering
   renewal conversation without cited evidence of value delivered = weak
   negotiating position + customer trust damage. LOAD-BEARING per Principle 1.
2. **Late renewal-window start.** Waiting until T-30 or T-60 days = no time
   for save-motion if at-risk; no time for expansion coordination if healthy.
   Renewal window T-90 to T-180 days for enterprise; T-60 to T-90 for
   mid-market; T-30 to T-60 for tech-touch.
3. **BATNA ignored.** Both sides' alternatives inform negotiation strategy.
   Ignoring = brittle position.
4. **Concessions without exchange.** Giving pricing / term concessions without
   corresponding customer commitments (multi-year / expansion / reference) =
   value leaked without corresponding return.
5. **Contract-restructure without counsel.** Material term changes require
   legal counsel review. LOAD-BEARING inherited from Universal Principle 5.
6. **Post-renewal drift.** Commitments made in renewal without tracker =
   next-renewal credibility damage.
7. **Individual crisis DURING renewal crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Renewal for [customer]" / "renewal timing for [customer]"
- "Renewal negotiation for [account]" / "renewal terms for [account]"
- "BATNA for renewal" / "renewal escalation for [customer]"
- "Contract-restructure at renewal for [account]" / "multi-year renewal for [account]"

Do NOT use for:
- Churn / at-risk save-motion → `churn-risk-prediction` (retain sibling)
- Expansion motion → `expansion-motions` (retain sibling)
- Customer advocacy → `customer-advocacy` (retain sibling)
- Actual contract execution → operator + sales + CFO + counsel
- New-logo sales → sales / future Growth & Partnerships
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
RENEWAL WINDOW TIMING (per tier — Winning by Design + Mehta framework)

  TECH-TOUCH (typical <$5-25k ARR)
    - T-60 to T-30 days
    - Automated + digital-first
    - Contract auto-renewal common

  HIGH-TOUCH / MID-MARKET ($25-250k ARR)
    - T-90 to T-60 days
    - CSM-led with structured cadence
    - Explicit renewal conversation typical

  ENTERPRISE ($250k+ ARR)
    - T-180 to T-90 days minimum
    - Multi-stakeholder engagement
    - Multi-quarter renewal process typical


VALUE-REALIZED EVIDENCE ASSEMBLY (LOAD-BEARING pre-negotiation)

  From upstream sources:
    - Health-score history (from ally customer-health-scoring)
    - Lifecycle-value milestone completion (from ally customer-lifecycle-value-mapping)
    - Prior-QBR commitments delivered (from ally qbr-executive-review-framework)
    - Business outcomes achieved (customer-provided testimonials +
      quantified outcomes)
    - Support-quality signals (from keel support-analytics)

  Assembled as renewal-value memo — foundation of negotiation.


BATNA DISCIPLINE (Fisher & Ury)

  Our BATNA at renewal:
    - Customer churn cost (revenue loss + reputation)
    - Capacity redeployment
    - Reference-customer loss

  Customer BATNA:
    - Competitor evaluation
    - Internal-build alternative
    - Do-nothing (usually costly for customer)

  Understanding both BATNAs → win-win negotiation frame vs zero-sum.


PRINCIPLED NEGOTIATION (Fisher & Ury framework)

  4 principles:
    1. Separate people from problem
    2. Focus on interests, not positions
    3. Invent options for mutual gain
    4. Insist on objective criteria


RENEWAL OPERATIONAL SEQUENCE:

  Phase 1: RENEWAL-WINDOW SETUP                        (T-90 to T-180 for enterprise)
  Phase 2: VALUE-REALIZED-EVIDENCE ASSEMBLY (LOAD-BEARING) (from upstream sources)
  Phase 3: BATNA + RELATIONSHIP-CONTEXT ANALYSIS       (both sides' alternatives)
  Phase 4: RENEWAL-NEGOTIATION EXECUTION PLAYBOOK       (positions / interests / options)
  Phase 5: POST-RENEWAL COMMITMENT TRACKING             (commitments to tracker; next-renewal prep)
```

## Instructions

### Phase 1 — Renewal-window setup

- Trigger based on tier + renewal date
- Assemble stakeholder team (CSM + sales + executive sponsor + potentially
  operator + CFO + counsel for enterprise / material terms)
- Set cadence for renewal-window conversations

### Phase 2 — Value-realized-evidence assembly (LOAD-BEARING)

**No renewal-negotiation proceeds without value-realized-evidence memo.**

Assemble from upstream sources (Structure/Protocol above). Explicit
milestone evidence + quantified outcomes + customer testimonials where
available.

If evidence insufficient → RED flag; coordinate with `churn-risk-prediction`
+ ally + operator BEFORE customer renewal conversation.

### Phase 3 — BATNA + relationship-context analysis

- Our BATNA at renewal
- Customer BATNA (competitor / build-in-house / do-nothing)
- Relationship context (champion strength / stakeholder changes / market
  factors)
- Strategic-account designation (reference-value beyond contract value)

### Phase 4 — Renewal-negotiation execution playbook

Apply Fisher & Ury principled-negotiation:
- Separate people from problem (relationship preservation)
- Focus on interests (what does customer really need — cost / capability /
  simplicity / risk-reduction)
- Invent options for mutual gain (multi-year / expansion-included /
  contract-restructure / usage-based)
- Insist on objective criteria (industry benchmarks / value delivered /
  market pricing)

**Concessions require exchange** per Principle 4. Multi-year discount = multi-
year commitment. Pricing reduction = expansion commitment. Value exchange
mandatory.

### Phase 5 — Post-renewal commitment tracking

- Commitments made in renewal → tracker (from both sides)
- Next-renewal pre-prep scheduled
- Feed close-loop discipline for next renewal
- Coordinate with ally `qbr-executive-review-framework` for QBR integration
- Feed pattern data back to Product (recurring renewal-negotiation themes)

## Output Format

- Renewal-window setup plan
- Value-realized-evidence memo (LOAD-BEARING)
- BATNA + relationship-context analysis
- Negotiation-execution playbook
- Post-renewal commitment tracker
- Cross-agent handoff briefs — to ally (QBR integration), operator (contract
  execution), counsel (material terms), sales (expansion coordination)

## Principles

1. **Never renewal-negotiation without value-realized-evidence assembly** —
   LOAD-BEARING per Purpose failure mode 1.
2. **Renewal-window start early** — T-90 to T-180 for enterprise; per tier.
3. **BATNA discipline both sides** — Fisher & Ury framework.
4. **Concessions require exchange** — value not leaked without corresponding
   return.
5. **Material term changes counsel-reviewed** — Universal Principle 5 legal
   fence inherited.
6. **Post-renewal commitment tracking** — no silent drift; close-loop
   discipline (inherited from ally QBR).
7. **No fabrication** — cited institutional + practitioner sources. Value-
   claims cite evidence. Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   renewal outcomes stay in CS + sales + legal tools; aggregate NRR / renewal-
   rate metrics for cross-department publication.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Value-realized-evidence insufficient** at renewal window. RED flag; DO
  NOT proceed with renewal conversation without addressing value gap first.
  Coordinate with `churn-risk-prediction` + ally + operator for save-motion.
- **Customer requests material term change** (multi-year restructure /
  contract-scope change / pricing model change) — route to operator + CFO
  + counsel BEFORE agreement.
- **BATNA-analysis reveals brittle position** (customer BATNA strong;
  weak retention lever) — escalate to operator + retain leadership for
  strategic response.
- **Aggressive customer demand** (unreasonable concession request) — apply
  Fisher & Ury principled-negotiation; escalate to operator if impasse.
- **Renewal-window slippage** (missed T-90 to T-180 window). Coordinate
  compressed timeline with all stakeholders; explicit acknowledgment of
  timing risk.
- **Strategic-account renewal** (reference-value beyond contract value) —
  coordinate with operator + marcus / vista for strategic-response.
- **Renewal-adjacent crisis-comms need** (customer public complaint /
  press coverage) — route to beacon `crisis-comms` (Comms & PR) +
  operator.
- **Individual crisis signal during renewal conversation.** STOP. Route per
  Universal Principle 3 to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-health-scoring` (custom, ally — Lead) | Health-score input for renewal risk | Upstream |
| `customer-lifecycle-value-mapping` (custom, ally — Lead) | Value-realized evidence assembly | Upstream (LOAD-BEARING) |
| `qbr-executive-review-framework` (custom, ally — Lead) | Prior-QBR commitment fulfillment evidence | Upstream |
| `churn-risk-prediction` (custom, retain — sibling) | RED-tier renewal-restructure coordination | Coordination |
| `expansion-motions` (custom, retain — sibling) | Renewal-timing expansion opportunity coordination | Coordination |
| `customer-advocacy` (custom, retain — sibling) | Multi-year renewal + advocacy program coordination | Coordination |
| `kickoff-executive-alignment` (custom, kickoff — sibling agent) | Original MSP foundation for renewal-value conversation | Upstream (original context) |
| `support-analytics` (custom, keel — sibling agent) | Support-quality signal input | Upstream |
| `crisis-comms` (custom, beacon — Comms & PR) | Renewal-adjacent crisis-comms need | Escalation |
| Sales team + operator | Contract execution | Downstream |
| Operator + CFO | Material term / pricing decisions | Escalation |
| Operator + counsel | Material term changes (LOAD-BEARING per Principle 5) | Escalation |
| Operator + retain leadership + marcus / vista | Strategic-account escalation | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Winning by Design](https://winningbydesign.com/)
- [Fisher & Ury — Getting to Yes (Penguin)](https://www.penguinrandomhouse.com/books/318043/getting-to-yes-by-roger-fisher-and-william-ury/)
- [Ury — Getting Past No (Bantam)](https://www.penguinrandomhouse.com/books/40415/getting-past-no-by-william-ury/)
- [Gainsight — Renewal resources](https://www.gainsight.com/resources/)
- [Kellblog](https://kellblog.com/)
