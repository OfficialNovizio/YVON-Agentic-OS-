<!--
Custom skill — synthesized from Bush 2019 + Roberge 2015 + a16z + practitioner.
§11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Bush 2019 4th use across fleet (kickoff + this + coordination).
Roberge 2015 2nd use in quest.
-->
---
name: gtm-motion-selection
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Bush, Wes (2019). Product-Led Growth. ProductLed Press. §8.9 4th use across fleet."
  - "Roberge, Mark (2015). The Sales Acceleration Formula (Wiley). §8.9 2nd use in quest."
  - "a16z — Enterprise SaaS + GTM motion practitioner. a16z.com."
  - "Bessemer Venture Partners — State of the Cloud reports (institutional practitioner)."
  - "Winning by Design — SaaS motion methodology (institutional practitioner)."
fulfills_catalog_entry: gtm-motion-selection (custom per §2 routing)
assigned_agent: quest (Growth & Partnerships / Growth Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: GTM motion selection framework — PLG / Sales-Led / Hybrid / Channel-partner / Community-Led. Customer-segment analysis + motion-candidate assessment + motion design + cross-agent handoff to closer / lure / bond. LOAD-BEARING customer-segment-analysis-mandatory. Trigger on "GTM motion for [product]", "PLG vs Sales-Led for [segment]", "sales motion design for [product]", "channel partner motion for [product]", or "community-led growth for [product]".
triggers:
  - GTM motion for
  - PLG vs Sales-Led for
  - sales motion design for
  - channel partner motion for
  - community-led growth for
  - hybrid motion design
  - motion transition for
---

# GTM Motion Selection

## Introduction

GTM motion selection framework for quest — PLG (Bush 2019) + Sales-Led
(Roberge 2015) + Hybrid + Channel-partner + Community-Led. Customer-segment
analysis drives motion candidate assessment.

**Scope distinction:** quest OWNS motion selection strategy. closer / lure /
bond execute motion tactics. Actual sales / marketing / partnership execution
= operator + relevant team.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Motion selection without customer-segment analysis.** Segment
   characteristics determine motion fit (SMB self-serve viable; enterprise
   Sales-Led typical). LOAD-BEARING per Principle 1.
2. **Motion-transition-without-plan.** Shifting from Sales-Led to PLG (or
   vice versa) mid-stage without coordinated transition plan = revenue
   disruption.
3. **Single-motion for multi-segment.** SMB + enterprise typically require
   different motions; single-motion suboptimizes at least one segment.
4. **Channel-partner as add-on without commitment.** Partner channels
   require investment (partner enablement / PRM / co-selling) — treating
   as add-on = underperformance.
5. **Community-led as free-lunch.** Community-led motion requires community
   investment (moderation / content / events) — not free.
6. **Individual crisis DURING motion-selection crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "GTM motion for [product]" / "PLG vs Sales-Led for [segment]"
- "Sales motion design for [product]" / "channel partner motion for [product]"
- "Community-led growth for [product]" / "hybrid motion design"
- "Motion transition for [current motion → target motion]"

Do NOT use for:
- Growth strategy → `growth-strategy` (quest sibling)
- Pricing → `pricing-and-packaging` (quest sibling)
- Funnel metrics → `funnel-metrics-and-attribution` (quest sibling)
- Sales tactical execution → closer siblings
- Marketing tactical execution → lure siblings + Brand Studio
- Partnership tactical execution → bond siblings
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
GTM MOTION OPTIONS

  PRODUCT-LED GROWTH (PLG) — Bush 2019
    - Product acquires / activates / expands
    - Fits: self-serve viable, product-value-obvious, low touch cost
    - Segments: individual / SMB / self-serve mid-market
    - Requires: strong onboarding + activation instrumentation

  SALES-LED — Roberge 2015
    - Sales team drives acquisition + expansion
    - Fits: high-touch required, complex-sale, enterprise ACV
    - Segments: mid-market + enterprise
    - Requires: revenue-machine formalization (hiring / training /
      management / demand-gen)

  HYBRID — modern SaaS common
    - PLG for acquisition/activation + Sales-Led for expansion
    - Fits: multi-segment reach; SMB-to-enterprise trajectory
    - Requires: seamless handoff from PLG signup to sales

  CHANNEL-PARTNER-LED
    - Partners drive acquisition (resellers / integrators / referral)
    - Fits: geographic reach, adjacent-customer-access, low direct-sales
      capacity
    - Requires: partner program + enablement (bond scope)

  COMMUNITY-LED
    - Community drives acquisition + retention + advocacy
    - Fits: developer tools + creator platforms + enthusiast markets
    - Requires: community investment (moderation / content / events)


CUSTOMER-SEGMENT ANALYSIS (LOAD-BEARING mandatory Phase 1)

  Segment characteristics:
    - ACV (deal size)
    - Sales cycle length
    - Self-serve viability
    - Buyer complexity (single / group)
    - Product complexity vs customer sophistication
    - Geographic distribution
    - Competition motion (do competitors run PLG / Sales-Led / Hybrid?)


OPERATIONAL SEQUENCE:

  Phase 1: CUSTOMER-SEGMENT ANALYSIS (LOAD-BEARING)      (segment characteristics per segment)
  Phase 2: MOTION-CANDIDATE ASSESSMENT                    (PLG / Sales-Led / Hybrid / Channel / Community per segment)
  Phase 3: MOTION DESIGN                                   (owner + tactics + capacity + timeline)
  Phase 4: CROSS-AGENT HANDOFF                             (closer / lure / bond execution)
```

## Instructions

### Phase 1 — Customer-segment analysis (LOAD-BEARING)
Per segment:
- ACV
- Sales cycle
- Self-serve viability
- Buyer complexity
- Product complexity vs customer sophistication
- Geographic distribution
- Competition motion

Cited-data-only per Principle 1.

### Phase 2 — Motion-candidate assessment
Match segments to motion(s):
- Single-motion for single-segment orgs
- Multi-motion (per-segment) for multi-segment orgs
- Hybrid within segment (PLG-acquire + Sales-Led-expand)

### Phase 3 — Motion design
Per selected motion:
- Owner (closer / lure / bond / cross-functional)
- Tactical detail
- Capacity + resource requirements
- Timeline + milestones
- Metrics (coordinate with `funnel-metrics-and-attribution` sibling)

### Phase 4 — Cross-agent handoff
- **PLG-heavy** → lure + Product (activation) + kickoff coordination
- **Sales-Led** → closer + retain (expansion)
- **Channel-partner** → bond + closer + operator
- **Community-Led** → lure + Brand Studio (spark / lena) + Product

## Output Format

- Customer-segment analysis per segment (cited)
- Motion-candidate assessment matrix
- Motion design per selected motion (owner + tactics + capacity + timeline + metrics)
- Cross-agent handoff briefs

## Principles

1. **Never motion selection without customer-segment analysis** — LOAD-BEARING
   per failure mode 1.
2. **Multi-motion for multi-segment** — no single-motion default across segments.
3. **Motion-transition-with-plan** — never mid-stage shift without coordinated
   plan.
4. **Channel-partner requires investment commitment** — not add-on.
5. **Community-led requires community investment** — not free-lunch.
6. **Segment-data cited** per Principle 1.
7. **No fabrication** — cited sources. Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   customer segment data stays internal.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Segment characteristics unclear** for new / novel product. Coordinate
  with Product + operator for segment-discovery (customer discovery
  interviews before motion commitment).
- **Motion-transition pressure without plan** — decline per Principle 3.
  Coordinate cross-functional transition plan.
- **Multi-motion complexity** requires resource conflict resolution.
  Escalate to operator + marcus / vista.
- **International motion difference** (US Sales-Led + APAC Channel-partner)
  — coordinate with compass `entry-mode-decision` for market-specific motion.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `growth-strategy` (custom, quest — sibling) | Growth-stage input | Upstream |
| `pricing-and-packaging` (custom, quest — sibling) | Pricing model per motion | Coordination |
| `funnel-metrics-and-attribution` (custom, quest — sibling) | Motion metrics | Coordination |
| closer siblings | Sales motion execution | Downstream |
| lure siblings + Brand Studio | Marketing motion execution | Downstream |
| bond siblings | Channel / partnership motion execution | Downstream |
| kickoff siblings (Client Success) | PLG handoff to onboarding | Cross-department |
| retain siblings (Client Success) | Sales-Led expansion handoff | Cross-department |
| compass `entry-mode-decision` (Global Expansion Lead) | International motion coordination | Cross-department |
| Product | PLG product-side investment | Cross-department |
| Operator + marcus / vista | Multi-motion resource conflict escalation | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Bush, Wes — Product-Led Growth](https://productled.com/pl/plg-book/)
- [Roberge — The Sales Acceleration Formula (Wiley)](https://www.wiley.com/en-us/The+Sales+Acceleration+Formula-p-9781119047070)
- [a16z — Enterprise SaaS](https://a16z.com/)
- [Bessemer Venture Partners — State of the Cloud](https://www.bvp.com/atlas/state-of-the-cloud-2024)
- [Winning by Design](https://winningbydesign.com/)
