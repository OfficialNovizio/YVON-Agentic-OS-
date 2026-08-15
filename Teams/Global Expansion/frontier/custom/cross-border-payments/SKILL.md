<!--
Custom skill — built from scratch, synthesized from named institutional sources
(SWIFT + BIS CPMI + FATF + G20 Roadmap + Wise/Airwallex/Stripe practitioner).
Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found developer-integration
payment skills (Stripe/Paddle/SePay/Banking APIs). Different scope — frontier
scopes CORPORATE-TREASURY payment-flow decisions, not developer integration.
§4.6 reclass to custom Route D.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: SWIFT 2nd use in frontier + FATF 2nd use. BIS 3rd use.
-->
---
name: cross-border-payments
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "SWIFT — payment-messaging standards (MT / MX / ISO 20022). Institutional. swift.com. §8.9 2nd use in frontier (also international-banking)."
  - "BIS CPMI (Committee on Payments and Market Infrastructures) — cross-border payments framework + Building Blocks for Enhancing Cross-Border Payments. Institutional. bis.org. §8.9 3rd use in frontier."
  - "FATF (Financial Action Task Force) — Travel Rule + sanctions guidance for cross-border payments. Institutional. fatf-gafi.org. §8.9 2nd use in frontier."
  - "G20 Roadmap for Enhancing Cross-Border Payments (2020+) — institutional coordination framework via FSB (Financial Stability Board). fsb.org."
  - "Wise / Airwallex / Stripe — practitioner materials on fintech cross-border alternatives + pricing transparency + FX-embedded cost analysis."
fulfills_catalog_entry: cross-border-payments (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found developer-integration payment skills; different scope from corporate-treasury payment-flow decisions. §4.6 reclass."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum."
assigned_agent: frontier (Global Expansion / Cross-border Operations)
portable: true
date_added: 2026-07-31
tier: 3
description: Corporate cross-border payment-flow scoping — payment-rail selection (SWIFT / SEPA / SEPA Instant / CIPS / faster-payment-networks / fintech alternatives Wise/Airwallex/Stripe) + LOAD-BEARING AML/sanctions compliance + FX-embedded cost + timing analysis + payment-provider due-diligence coordination. Trigger on "payment rail for [flow]", "SWIFT vs fintech for [payment]", "SEPA vs SEPA Instant for [flow]", "cross-border payment provider for [operation]", "AML/sanctions screening for payment", "FX cost analysis for [payment flow]", or "payment timing for [operation]".
triggers:
  - payment rail for
  - SWIFT vs fintech for
  - SEPA vs SEPA Instant for
  - cross-border payment provider for
  - AML/sanctions screening for payment
  - FX cost analysis for
  - payment timing for
  - CIPS for RMB payment
  - Travel Rule for cross-border payment
  - payment-provider due diligence
---

# Cross-Border Payments

## Introduction

This skill packages corporate cross-border payment-flow scoping discipline for
frontier — invoked once compass + canopy have setup entity + banking (frontier
sibling `international-banking`). Payment-rail selection + AML/sanctions
compliance coordination + FX-embedded cost + timing analysis + payment-provider
due-diligence coordination.

**Scope distinction:** frontier SCOPES payment-flow decisions + coordinates
provider selection. Operator + treasury team + compliance EXECUTE actual
payments. Distinct from developer-integration for building payment features
into applications (that's Engineering scope with marketplace payment-
integration skills).

Custom Route D per §8.2 — cited rubric grounded in SWIFT + BIS CPMI + FATF +
G20 Roadmap + Wise/Airwallex/Stripe practitioner corpus.

## Purpose

Prevents six failure modes:

1. **AML/sanctions screening skipped on cross-border payment.** Every
   cross-border payment requires sanctions-screening (OFAC / EU / UN / local)
   + Travel Rule compliance (FATF Recommendation 16 — originator + beneficiary
   info required for wire transfers). Skipping = regulatory exposure + potential
   payment reversal + counterparty relationship damage. LOAD-BEARING.
2. **Payment-provider engagement without AML compliance coordination.**
   Fintech alternatives (Wise / Airwallex / Stripe / Nium / others) have
   varying compliance postures. Provider engagement without compliance
   review = predictable regulatory or operational issues. LOAD-BEARING.
3. **Wrong-rail selection for use case.** SWIFT for small consumer-like
   payments = high cost + slow; fintech for large corporate payments =
   provider limits + coordination gaps. Rail selection per use case
   (amount / frequency / speed requirement / currency pair) matters.
4. **FX-embedded cost blindness.** Fintech alternatives typically show
   transparent FX cost; traditional bank wires bury FX cost in spread. Total
   cost comparison requires FX-embedded analysis, not just fee comparison.
5. **Payment timing miscalculation.** SWIFT MT103 typical 1-3 business days;
   SEPA Instant seconds; CIPS RMB clearing hours-to-days; fintech alternatives
   variable. Cash-flow planning per payment timing.
6. **Individual crisis DURING payment-flow scoping.** Team members under
   payment-timing pressure + personal distress can coincide. HARD BOUNDARY
   per Universal Principle 3.

frontier uses this skill as Phase 3 of cross-border operations scoping (after
`fx-treasury-basics` Phase 1 + `international-banking` Phase 2).

## When to Use

Trigger on:

- "Payment rail for [flow]"
- "SWIFT vs fintech for [payment]" / "SEPA vs SEPA Instant for [flow]"
- "Cross-border payment provider for [operation]"
- "AML/sanctions screening for payment"
- "FX cost analysis for [payment flow]"
- "Payment timing for [operation]"
- "CIPS for RMB payment"
- "Travel Rule for cross-border payment"
- "Payment-provider due diligence"

Do NOT use for:

- **FX exposure + hedging** → `fx-treasury-basics` (frontier sibling)
- **Banking counterparty relationship management** → `international-banking`
  (frontier sibling)
- **Physical goods trade + Incoterms** → `international-logistics`
  (frontier sibling)
- **Developer integration for payment features in apps** → dev (Engineering)
  with marketplace payment-integration skills
- **Individual customer / consumer payment questions** → operator + product +
  compliance
- **Withholding-tax scoping on payments** → canopy `tax-registration`
- **Actual payment execution** → operator + treasury team
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

The cross-border-payments workflow combines rail selection + AML + FX +
timing + provider due-diligence:

```
PAYMENT RAILS COMPARISON (2026 landscape)

  SWIFT (MT / ISO 20022 MX)
    - Global reach; correspondent-banking model
    - Timing: MT103 typically 1-3 business days; ISO 20022 MX improving
    - Cost: bank fees + correspondent fees + FX spread (bank-embedded)
    - Best for: larger corporate payments where universal reach needed

  SEPA / SEPA Instant (EU)
    - EU-wide, EUR only
    - SEPA Credit Transfer: next-business-day settlement
    - SEPA Instant: seconds (up to €100k per transaction)
    - Cost: low (EUR-standardized)
    - Best for: EU-domestic corporate payments

  CIPS (China Cross-Border Interbank Payment System)
    - RMB clearing; alternative to SWIFT for RMB
    - Timing: hours to next-business-day
    - Cost: standardized
    - Best for: RMB cross-border payments

  DOMESTIC FASTER-PAYMENT NETWORKS
    - RTP + FedNow (US) — real-time domestic
    - Faster Payments (UK) — near-instant domestic
    - UPI (India) — real-time domestic
    - PayNow (Singapore), PromptPay (Thailand) — real-time domestic
    - Cross-border use limited; primarily domestic

  FINTECH ALTERNATIVES
    - Wise (formerly TransferWise) — transparent FX; batch-clearing model
    - Airwallex — global collections + payments; multi-currency accounts
    - Stripe — payments + treasury; developer-oriented
    - Nium — enterprise cross-border payments API
    - Timing: hours to next-business-day typical
    - Cost: transparent FX + fixed fee (often lower than bank wires)
    - Best for: SME + growth-stage cross-border; multi-currency operations


PAYMENT-RAIL SELECTION DECISION MATRIX

  Considerations per flow:
    - Amount (fintech thresholds vs bank capacity)
    - Frequency (batched vs on-demand)
    - Speed requirement (instant / next-day / days OK)
    - Currency pair (major pair / exotic / RMB / etc.)
    - Counterparty preference (some counterparties require specific rails)
    - AML compliance requirements per corridor
    - FX transparency requirement


AML / SANCTIONS COMPLIANCE (mandatory per FATF + local regulators)

  TRAVEL RULE (FATF Recommendation 16)
    - Originator + beneficiary info required for wire transfers
    - Applies globally with local implementation varying
    - Post-2019 also applies to virtual-asset transfers ≥$1,000 (varying local
      thresholds)

  SANCTIONS SCREENING
    - OFAC (US) — Specially Designated Nationals + sanctioned countries
    - EU consolidated sanctions list
    - UN Security Council sanctions
    - Local sanctions programs

  PEP (Politically Exposed Persons) screening

  ENHANCED DUE DILIGENCE for higher-risk corridors + amounts


CROSS-BORDER-PAYMENTS OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: PAYMENT-FLOW SCOPE                        (which payments + currencies + frequencies)
  Phase 2: PAYMENT-RAIL SELECTION                    (per flow with rail-matrix)
  Phase 3: LOAD-BEARING AML/SANCTIONS COORDINATION   (Travel Rule + screening per corridor)
  Phase 4: FX-EMBEDDED COST + TIMING ANALYSIS         (total cost comparison per rail)
  Phase 5: PAYMENT-PROVIDER DUE-DILIGENCE HANDOFF    (to compliance + operator for provider selection)
```

## Instructions

### Phase 1 — Payment-flow scope

Inventory cross-border payment flows:

- Vendor payments (which vendors, which currencies, which frequencies)
- Payroll (which entities, which currencies)
- Customer collections (which corridors)
- Intercompany transfers (parent-subsidiary + intra-group)
- Tax payments (coordinate with canopy `tax-registration`)
- Regulatory/licensing payments per jurisdiction

Output: payment-flow map per corridor + amount + frequency + timing needs.

### Phase 2 — Payment-rail selection per flow

Apply payment-rail decision matrix per flow:

- Amount + frequency → rail capacity + cost efficiency
- Speed requirement → SEPA Instant vs SWIFT vs CIPS vs fintech
- Currency pair → CIPS for RMB, SEPA for EUR-only, fintech for exotic pairs
- Counterparty preference
- Compliance requirements per corridor

Recommend rail (or multi-rail approach — fintech for small + SWIFT for large,
common corporate pattern).

### Phase 3 — LOAD-BEARING AML/sanctions coordination

**Every cross-border payment routes through AML/sanctions coordination.**
Non-negotiable.

- **Travel Rule** (FATF Rec 16) — originator + beneficiary info per corridor
- **Sanctions screening** — OFAC / EU / UN / local per transaction
- **PEP screening** — for institutional payments to political-exposed entities
- **EDD** for higher-risk corridors + amounts

frontier scopes; compliance team + provider execute screening. LOAD-BEARING —
skipping = regulatory exposure + payment-reversal risk.

### Phase 4 — FX-embedded cost + timing analysis

Total cost per rail:

- **Bank wires (SWIFT)** — bank fees + correspondent fees + FX spread
  (bank-embedded, often 100-300bp above interbank)
- **Fintech alternatives** — transparent FX (often 20-50bp above interbank) +
  fixed fee
- **CIPS RMB** — standardized fees
- **SEPA / SEPA Instant** — low EUR-standardized fees

Timing:
- SWIFT MT103: 1-3 business days typical
- SEPA Instant: seconds
- CIPS: hours to next-business-day
- Fintech alternatives: hours to next-business-day typical

Output: per-rail total-cost + timing analysis per flow.

### Phase 5 — Payment-provider due-diligence handoff

For fintech alternatives, provider selection coordinates with:

- **Compliance + operator** — AML/CTF posture; regulatory-license verification
  per jurisdiction (payment institutions licensed in specific jurisdictions)
- **CFO + treasury team** — counterparty-risk + integration effort
- **Legal counsel** — provider agreements + service-level commitments
- **canopy `data-residency-mapping`** — data-residency for payment data
- **frontier `international-banking` sibling** — coordination with existing
  bank counterparty setup

Provider selection = operator + compliance + counsel decision. frontier scopes
requirements + due-diligence framework.

## Output Format

Each invocation produces one or more of:

- **Payment-flow map** — per corridor + amount + frequency + timing needs
- **Payment-rail recommendation** — per flow with decision-matrix rationale
- **AML/sanctions compliance framework** — Travel Rule + screening + EDD per
  corridor
- **FX-embedded cost + timing analysis** — total-cost per-rail comparison per
  flow
- **Payment-provider due-diligence brief** — for compliance + operator
- **Cross-agent handoff briefs** — to frontier siblings + canopy + CFO +
  compliance + operator

## Principles

1. **Never cross-border payment without AML/sanctions screening** — LOAD-
   BEARING per Purpose failure mode 1. Travel Rule + sanctions screening
   + EDD per corridor.
2. **Never payment-provider engagement without AML compliance coordination** —
   LOAD-BEARING per Purpose failure mode 2.
3. **Rail selection per use case** — one-size-fits-all rail choice is failure
   mode. Amount + speed + currency + counterparty determine rail.
4. **FX-embedded cost analysis** — bank wires bury FX in spread; fintech
   shows transparent FX. Total-cost comparison required.
5. **Timing per rail explicit** — cash-flow planning depends on payment-
   timing accuracy per rail.
6. **No fabrication** — cited institutional sources (SWIFT + BIS CPMI + FATF
   + G20 Roadmap + practitioner materials). Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   beneficiary / originator payment data handled per operator + compliance +
   counsel privilege discipline.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
   `logical/README.md`.

## Fallback

- **Sanctions-hit detected** on proposed payment. HALT payment. Escalate to
  operator + international-trade counsel + compliance immediately. Do NOT
  proceed with payment.
- **Fintech-provider license unclear** for specific jurisdiction. Route to
  operator + compliance + counsel for regulatory-license verification. Do
  NOT recommend unlicensed provider.
- **High-value / higher-risk payment** requiring EDD. Coordinate with
  compliance + operator for EDD execution; may require additional
  documentation from originator / beneficiary.
- **Cross-border payment to sanctioned jurisdiction** (regulatory-permitted
  humanitarian / licensed exception). Route to operator + international-
  trade counsel; requires specific licensing per OFAC/EU regulations.
- **Correspondent-banking-collapse-impact** on payment flow (correspondent
  bank pulls out affecting payment routing). Coordinate with frontier
  sibling `international-banking` + operator for alternative routing.
- **RMB payment via CIPS complexity.** Coordinate with Chinese local
  banking counsel + operator; capital-controls (Phase 2 of `international-
  banking`) apply.
- **G20 Roadmap enhancement affecting corridor** (targeted improvements in
  cost / speed / access / transparency per G20 initiative). Update rail-
  selection guidance as corridors evolve.
- **Individual crisis signal during payments conversation.** STOP. Route
  per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `fx-treasury-basics` (custom, frontier — sibling) | FX exposure per payment flow | Coordination |
| `international-banking` (custom, frontier — sibling) | Bank counterparties + correspondent-banking impact on payment routing | Coordination |
| `international-logistics` (custom, frontier — sibling) | Trade finance (letters of credit / documentary collections) coordination | Coordination |
| canopy `tax-registration` (Global Expansion sibling) | Withholding-tax on cross-border payments | Coordination |
| canopy `data-residency-mapping` (Global Expansion sibling) | Payment-data residency per jurisdiction | Coordination |
| beacon `data-room-discipline` (Comms & PR) | Payment records feed data-room `/02_Financial/` folder | Coordination |
| dev (Engineering) | Developer integration for in-app payment features (different scope — Engineering) | Cross-department for scope split |
| CFO + treasury team + compliance | Actual payment execution + ongoing AML/sanctions screening | Downstream — clear scope split |
| Operator + international-trade counsel | Sanctions-hit / sanctioned-jurisdiction / regulatory-permitted exceptions | Escalation — LOAD-BEARING legal fence |
| Operator + compliance + counsel | Fintech-provider license verification + EDD execution | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every frontier artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [SWIFT — Cross-border Payments](https://www.swift.com/our-solutions/interbank-payments)
- [SWIFT — ISO 20022 (MX standard)](https://www.swift.com/standards/iso-20022)
- [BIS CPMI — Enhancing Cross-Border Payments](https://www.bis.org/cpmi/cross_border.htm)
- [FSB / G20 Roadmap for Enhancing Cross-Border Payments](https://www.fsb.org/work-of-the-fsb/financial-innovation-and-structural-change/cross-border-payments/)
- [FATF — Recommendations (Travel Rule = Rec 16)](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html)
- [OFAC — Sanctions Programs](https://ofac.treasury.gov/sanctions-programs-and-country-information)
- [Wise — Cross-Border Payments](https://wise.com/business/)
- [Airwallex — Cross-Border Payment Solutions](https://www.airwallex.com/)
- [Stripe — Payments](https://stripe.com/payments)
