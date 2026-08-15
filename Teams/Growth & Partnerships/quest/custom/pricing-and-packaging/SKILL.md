<!--
Custom skill — synthesized from Madhavan/Wu 2022 + Nagle + Kotler + practitioner.
§11 + §14.2. Route D per §8.2.
-->
---
name: pricing-and-packaging
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Madhavan, Ajit & Wu, Kevin (2022). Price to Scale: A Practical Guide to Pricing and Packaging for SaaS. Independently published. Practitioner corpus on SaaS pricing."
  - "Nagle, Thomas T. & Müller, Georg (multiple editions). The Strategy and Tactics of Pricing: A Guide to Growing More Profitably. Routledge. ISBN 978-0367456429. Canonical academic + practitioner pricing text."
  - "Kotler, Philip & Keller, Kevin Lane. Marketing Management (Pearson). Canonical marketing framework including pricing. §8.9 with compass go-to-market-adaptation."
  - "Simon-Kucher & Partners — pricing consulting practitioner corpus. simon-kucher.com."
  - "OpenView — SaaS Benchmarks + Pricing practitioner research. openviewpartners.com."
  - "Roberge, Mark (2015). The Sales Acceleration Formula (Wiley). §8.9 2nd use in Growth & Partnerships."
fulfills_catalog_entry: pricing-and-packaging (custom per §2 routing)
assigned_agent: quest (Growth & Partnerships / Growth Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Pricing + packaging strategy — framework selection (value-based / cost-plus / competition-based / dynamic) + segment-appropriate packaging + willingness-to-pay research + LOAD-BEARING operator + CFO + counsel scoping. Trigger on "pricing strategy for [product]", "packaging tiers for [segment]", "value-based pricing", "willingness to pay for [feature]", "price optimization for [segment]", or "pricing model migration for [product]".
triggers:
  - pricing strategy for
  - packaging tiers for
  - value-based pricing
  - willingness to pay for
  - price optimization for
  - pricing model migration for
  - price bands for
  - usage-based pricing design
---

# Pricing and Packaging

## Introduction

Pricing + packaging strategy for quest — Madhavan/Wu SaaS pricing + Nagle
academic + Kotler + Simon-Kucher practitioner + OpenView benchmarks.

**Scope distinction:** quest OWNS pricing strategy. Operator + CFO + counsel
DECIDE + EXECUTE actual pricing changes. product-manager `price` (Product
department) handles product-side price-related decisions; quest handles
pricing STRATEGY for growth.

Custom Route D per §8.2.

## Purpose

Prevents seven failure modes:

1. **Pricing without customer willingness-to-pay data.** Guessed pricing =
   over-price (demand destruction) or under-price (value leaked). LOAD-BEARING
   per Principle 1.
2. **Pricing recommendation without operator + CFO + counsel scoping.**
   Cross-functional decision — unilateral recommendation damages trust.
   LOAD-BEARING per Principle 2.
3. **Cost-plus default for value-driven product.** Cost-plus ignores value
   captured; value-based pricing typically 3-5× cost-plus for SaaS
   (Nagle framework).
4. **Segment-agnostic pricing.** Enterprise-tier customers pay materially
   different price for same product than SMB — segmentation matters.
5. **Packaging complexity explosion.** Too many tiers (10+) confuses buyers;
   too few (2-3) leaves value on table.
6. **Grandfathering without policy.** Existing customer pricing changes
   without explicit grandfathering-vs-migration policy = customer trust
   damage.
7. **Individual crisis DURING pricing crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Pricing strategy for [product]" / "packaging tiers for [segment]"
- "Value-based pricing" / "willingness to pay for [feature]"
- "Price optimization for [segment]" / "pricing model migration for [product]"
- "Price bands for [segment]" / "usage-based pricing design"

Do NOT use for:
- Product-price technical implementation → Product `price` agent + dev
- Product-marketing pricing communication → lure siblings + Brand Studio
- Enterprise custom pricing negotiation → closer + retain `renewal-negotiation`
- Global pricing (per-market pricing) → coordinates with compass `go-to-market-adaptation`
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
PRICING FRAMEWORK OPTIONS (Nagle + practitioner)

  VALUE-BASED
    - Price = customer value captured
    - Requires WTP research + value articulation
    - Highest margin potential; requires most discipline

  COST-PLUS
    - Price = cost + margin target
    - Simplest; ignores value; leaves value on table for value-driven products

  COMPETITION-BASED
    - Price = market benchmark ± positioning delta
    - Reasonable for commoditized markets; risky for differentiated products

  DYNAMIC / USAGE-BASED
    - Price varies with usage / consumption
    - Fits: variable-cost delivery, unclear-usage customers
    - Coordination: metering + billing infrastructure

  HYBRID
    - Base + usage OR value tier + usage overage
    - Common modern SaaS


PACKAGING PRINCIPLES (Madhavan/Wu + OpenView benchmarks)

  Tier count: typically 3-4 for SMB/mid-market; enterprise custom
  Fence design: features that differentiate tiers (not just quantities)
  Anchor pricing: high tier anchors mid; mid anchors low
  Free trial / freemium: acquisition tool with clear conversion path


WILLINGNESS-TO-PAY (WTP) RESEARCH

  Methods:
    - Van Westendorp Price Sensitivity Meter (survey-based)
    - Conjoint analysis (feature-price trade-off)
    - Anchor + rejection interviews (qualitative)
    - Cohort A/B testing at scale

  Cited-source-only per Principle 1.


OPERATIONAL SEQUENCE:

  Phase 1: PRICING FRAMEWORK SELECTION                  (value / cost / competition / dynamic / hybrid)
  Phase 2: SEGMENTATION                                  (customer-tier + use-case + geography)
  Phase 3: PACKAGING DESIGN                              (tiers + fences + anchoring)
  Phase 4: WILLINGNESS-TO-PAY RESEARCH                    (LOAD-BEARING data-cited)
  Phase 5: OPERATOR + CFO + COUNSEL HANDOFF               (LOAD-BEARING cross-functional scoping)
```

## Instructions

### Phase 1 — Pricing framework selection
Match framework to product characteristics + market + competitive positioning.
Document rationale.

### Phase 2 — Segmentation
- Customer tier (SMB / mid-market / enterprise)
- Use-case segments
- Geographic segments (coordinate with compass)

### Phase 3 — Packaging design
- Tier count (3-4 typical)
- Fence design (differentiating features)
- Anchor pricing structure
- Free trial / freemium design

### Phase 4 — WTP research (LOAD-BEARING)
- Van Westendorp OR conjoint OR interviews OR A/B testing
- **Cited data required** per Principle 1

### Phase 5 — Operator + CFO + counsel handoff (LOAD-BEARING)
- Cross-functional review before recommendation ships
- Grandfathering-vs-migration policy for existing customers
- Legal review for material term changes (Universal Principle 5)

## Output Format

- Pricing framework recommendation + rationale
- Segmentation memo
- Packaging design (tiers + fences + anchoring)
- WTP research plan + findings
- Operator + CFO + counsel handoff brief with grandfathering policy

## Principles

1. **Never pricing without cited WTP data** — LOAD-BEARING per failure mode 1.
2. **Never pricing recommendation without operator + CFO + counsel scoping** —
   LOAD-BEARING per failure mode 2.
3. **Value-based default for differentiated products** — cost-plus for
   commoditized only.
4. **Segmentation mandatory** — no uniform-price-across-segments.
5. **Packaging complexity managed** — 3-4 tiers typical.
6. **Grandfathering policy explicit** for existing customers on changes.
7. **No fabrication** — cited sources. Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   customer pricing / commercial terms stay in operator + sales tools.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **WTP research not feasible** (early stage / small sample). Explicit
  "internal estimate — assumption X" flag per Principle 1. Coordinate
  qualitative interviews as minimum.
- **Pricing change urgency without cross-functional scoping** — decline per
  Principle 2. Escalate to operator + CFO.
- **Grandfathering vs migration decision contested** — escalate to operator +
  CFO + counsel; may require customer-facing communication (coordinate with
  signal + herald + retain).
- **International pricing complexity** — coordinate with compass `go-to-market-
  adaptation` + canopy `tax-registration` for VAT + purchasing-power.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `growth-strategy` (custom, quest — sibling) | Growth-stage input for pricing | Upstream |
| `funnel-metrics-and-attribution` (custom, quest — sibling) | Pricing-vs-conversion metrics | Coordination |
| `gtm-motion-selection` (custom, quest — sibling) | Motion determines pricing structure fit | Coordination |
| `renewal-negotiation` (custom, retain — Client Success) | Enterprise custom pricing at renewal | Cross-department |
| `expansion-motions` (custom, retain — Client Success) | Expansion pricing | Cross-department |
| `go-to-market-adaptation` (custom, compass — Global Expansion Lead) | International pricing coordination | Cross-department |
| `tax-registration` (custom, canopy) | VAT + tax implications | Cross-department |
| `price` (Product) | Product-side price implementation | Cross-department |
| Product | Feature-to-tier fence coordination | Cross-department |
| Operator + CFO | LOAD-BEARING pricing decision scoping | Escalation — Principle 2 |
| Operator + counsel | Material term change legal review | Escalation — Universal Principle 5 |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Nagle & Müller — The Strategy and Tactics of Pricing (Routledge)](https://www.routledge.com/The-Strategy-and-Tactics-of-Pricing-A-Guide-to-Growing-More-Profitably/Nagle-Muller/p/book/9780367456429)
- [Simon-Kucher & Partners](https://www.simon-kucher.com/)
- [OpenView — SaaS Benchmarks](https://openviewpartners.com/)
- [Kotler & Keller — Marketing Management (Pearson)](https://www.pearson.com/en-us/subject-catalog/p/marketing-management/P200000006016)
- [Roberge — The Sales Acceleration Formula (Wiley)](https://www.wiley.com/en-us/The+Sales+Acceleration+Formula-p-9781119047070)
