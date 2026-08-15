<!--
Custom skill — synthesized from Mehta 2016 + Winning by Design + Point Nine +
a16z + Kellblog. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Mehta 2016 10th use across Client Success. Winning by Design
2nd use (kickoff + this).
-->
---
name: expansion-motions
type: custom
status: built from scratch
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 10th use across Client Success. Land-and-expand framing."
  - "Winning by Design — SaaS Expansion methodology (institutional practitioner). winningbydesign.com. §8.9 2nd use (kickoff + this)."
  - "Point Nine — SaaS practitioner writings on land-and-expand (institutional practitioner). pointnine.com."
  - "a16z — Enterprise SaaS + expansion frameworks (institutional practitioner). a16z.com."
  - "Kellblog — SaaS metrics + expansion benchmark writings (institutional practitioner)."
fulfills_catalog_entry: expansion-motions (custom per §2 routing)
assigned_agent: retain (Client Success / Success/Retention/Expansion)
portable: true
date_added: 2026-07-31
tier: 3
description: Upsell / cross-sell / multi-product / multi-team expansion motions — health-GREEN + value-realized gated (LOAD-BEARING). Opportunity identification + qualification + motion design + execution handoff to sales/operator. Trigger on "expansion opportunity for [customer]", "upsell motion for [account]", "cross-sell for [customer]", "multi-team expansion in [account]", "land-and-expand for [customer]", or "NRR / net dollar retention analysis".
triggers:
  - expansion opportunity for
  - upsell motion for
  - cross-sell for
  - multi-team expansion in
  - land-and-expand for
  - NRR / net dollar retention analysis
  - expansion timing for
---

# Expansion Motions

## Introduction

Expansion motion discipline for retain — upsell / cross-sell / multi-product /
multi-team motions. Mehta 2016 land-and-expand + Winning by Design SaaS
Expansion + Point Nine / a16z / Kellblog practitioner corpus.

**Scope distinction:** retain OWNS expansion motion strategy + qualification.
Sales team + operator EXECUTE actual expansion sales. LOAD-BEARING gating:
health-GREEN + value-realized required before expansion push.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Expansion push without value-realized-evidence.** Pushing upsell/
   cross-sell before customer realized value from current commitment =
   customer trust damage + long-term relationship damage. LOAD-BEARING per
   Principle 1 (inherited from ally QBR expansion-during-strain pattern).
2. **Expansion timing wrong.** Quarter-end pressure driving expansion push
   into customer-strain periods = same damage.
3. **Wrong-motion for opportunity.** Upsell (more of same) vs cross-sell
   (new product/feature) vs multi-team (new-buyer within account) — each
   requires different playbook.
4. **Sales handoff opacity.** CS-identified opportunity handed to sales
   without CS-context (customer relationship + value-realized-history) =
   sales enters conversation blind.
5. **NRR-metric-only framing.** Net Revenue Retention is outcome metric,
   not opportunity-identification metric. Health-score + value-realization
   drive opportunity identification.
6. **Individual crisis DURING expansion crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Expansion opportunity for [customer]" / "expansion timing for [customer]"
- "Upsell motion for [account]" / "cross-sell for [customer]" /
  "multi-team expansion in [account]"
- "Land-and-expand for [customer]" / "NRR / net dollar retention analysis"

Do NOT use for:
- Churn / at-risk accounts → `churn-risk-prediction` (retain sibling)
- Renewal negotiation execution → `renewal-negotiation` (retain sibling)
- Customer advocacy → `customer-advocacy` (retain sibling)
- Sales execution → sales team + operator
- New logo / prospect acquisition → sales / future Growth & Partnerships
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
EXPANSION MOTION TYPES

  UPSELL (more of same)
    - Additional seats / usage tiers / storage / API limits
    - Same product; higher volume or tier
    - Typically low-friction if customer growing

  CROSS-SELL (new product / feature)
    - New product line / add-on / premium feature
    - Requires re-evaluation of use case
    - Higher friction than upsell; more discovery needed

  MULTI-TEAM (new buyer within account)
    - New department / business unit / geography within same customer org
    - Requires new stakeholder engagement + new use case validation
    - Sales-motion-adjacent; usually needs sales team involvement

  MULTI-PRODUCT (deep account penetration)
    - Multiple product lines simultaneously
    - Enterprise-tier typical
    - Longest sales cycle; highest ACV impact


EXPANSION GATING (LOAD-BEARING)

  Before ANY expansion push, verify:
    - HEALTH GREEN (from ally customer-health-scoring)
    - VALUE REALIZED per prior commitments (from ally
      customer-lifecycle-value-mapping)
    - No active concerns / escalations (from keel support-analytics)
    - No prior-QBR unfulfilled commitments (from ally
      qbr-executive-review-framework)

  If ANY of above fail → NO expansion push. Focus on value delivery first.


OPERATIONAL SEQUENCE:

  Phase 1: OPPORTUNITY IDENTIFICATION (LOAD-BEARING gated)     (health + value verified)
  Phase 2: MOTION QUALIFICATION                                  (upsell / cross-sell / multi-team / multi-product)
  Phase 3: MOTION DESIGN                                          (customer approach + timeline + owner)
  Phase 4: EXECUTION HANDOFF                                      (to sales / operator with CS-context)
```

## Instructions

### Phase 1 — Opportunity identification (LOAD-BEARING gated)

**Verify ALL gate conditions before proceeding:**
- Health GREEN
- Value-realized per prior commitments
- No active escalations
- Prior QBR commitments fulfilled

If gate fails → escalate to retain leadership; DO NOT proceed with expansion
motion. Coordinate with `churn-risk-prediction` if at-risk signals; with ally
health-scoring if value gaps.

If gate passes → proceed to Phase 2.

### Phase 2 — Motion qualification

Classify opportunity type:
- Upsell (existing product, more volume)
- Cross-sell (new product/feature)
- Multi-team (new buyer within account)
- Multi-product (deep account penetration)

Estimate opportunity size (ARR uplift + timing + probability).

### Phase 3 — Motion design

Per motion type, design:
- Customer approach (who initiates conversation — CSM / sales / executive)
- Timing (aligned with customer buying rhythm — not our quarter-end pressure)
- Owner + supporting team
- Discovery + validation checkpoints
- Commercial + pricing framework

### Phase 4 — Execution handoff to sales / operator

CS-context handoff to sales team:
- Customer relationship + value-realized history
- Stakeholder map
- Opportunity classification + size
- Recommended approach + timing

Sales team EXECUTES; retain CSM stays involved for customer-relationship
continuity.

## Output Format

- Opportunity-identification report per account (with gate verification)
- Motion-qualification memo per opportunity
- Motion-design plan per motion type
- CS-to-sales handoff brief with CS-context
- Portfolio expansion pipeline rollup

## Principles

1. **Never expansion push without value-realized-evidence** — LOAD-BEARING
   per Purpose failure mode 1. Inherited from ally QBR Principle 2
   (expansion-during-strain).
2. **Health-GREEN + value-realized gating mandatory** — Phase 1 gate.
3. **Motion-type-appropriate playbook** — upsell / cross-sell / multi-team /
   multi-product require different design.
4. **CS-to-sales handoff structured** — CS-context transferred explicitly.
5. **NRR is outcome, not identification metric** — health + value drive
   identification.
6. **Quarter-end pressure ≠ customer-buying-rhythm.** Timing aligns with
   customer.
7. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   expansion opportunities stay in CS + sales tools; aggregate portfolio
   metrics for cross-department publication.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Gate condition fails but expansion pressure from sales / operator** —
  Decline per Principle 1 — LOAD-BEARING. Escalate to retain leadership +
  operator; principle non-negotiable.
- **Opportunity size estimate uncertain** — flag "internal estimate —
  assumption X" per Universal Principle 1 discipline. Do NOT round-number
  fabricate.
- **Customer approach conflict** (sales wants different timing than CS
  recommends) — escalate to operator + retain + sales leadership for
  alignment.
- **Cross-venture / cross-product expansion complexity** — escalate to
  marcus / vista + operator for portfolio-level expansion strategy.
- **Multi-team expansion with new stakeholder** — coordinate with sales
  for new-stakeholder discovery + kickoff for new-team onboarding if
  won.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-health-scoring` (custom, ally — Lead) | Health-GREEN gate verification | Upstream (LOAD-BEARING) |
| `customer-lifecycle-value-mapping` (custom, ally — Lead) | Value-realized gate verification | Upstream (LOAD-BEARING) |
| `qbr-executive-review-framework` (custom, ally — Lead) | Prior-QBR commitment fulfillment gate | Upstream |
| `churn-risk-prediction` (custom, retain — sibling) | If at-risk signals, NO expansion push | Coordination — inverse |
| `renewal-negotiation` (custom, retain — sibling) | Renewal-timing expansion coordination | Coordination |
| `customer-advocacy` (custom, retain — sibling) | Advocate-customer expansion opportunities | Coordination |
| `support-analytics` (custom, keel — sibling agent) | Active-escalation gate check | Upstream |
| `onboarding-journey-design` (custom, kickoff — sibling agent) | Multi-team expansion → new-team onboarding | Downstream if won |
| Sales / future Growth & Partnerships | Execution handoff | Downstream |
| Operator + retain leadership | Gate-fail escalation | Escalation — LOAD-BEARING |
| Operator + marcus / vista | Cross-venture expansion | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Winning by Design](https://winningbydesign.com/)
- [Point Nine — SaaS content](https://pointnine.com/)
- [a16z — Enterprise SaaS](https://a16z.com/)
- [Kellblog](https://kellblog.com/)
