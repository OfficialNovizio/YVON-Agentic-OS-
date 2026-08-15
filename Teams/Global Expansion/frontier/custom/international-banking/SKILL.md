<!--
Custom skill — built from scratch, synthesized from named institutional sources
(SWIFT + BIS + FATF + Wolfsberg + JP Morgan / HSBC / Citi correspondent-banking
guides). Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 found KYC Risk Rating (complementary
compliance-execution tool) + Cross-Border Investment Structuring (different
scope). No corporate-banking-relationship management skills. §4.6 reclass to
custom Route D. KYC Risk Rating noted as complementary tool for compliance-
execution.

Route D per §8.2 (cited rubric).
-->
---
name: international-banking
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "SWIFT — Correspondent Banking Due Diligence Questionnaire (CBDDQ) + payment-messaging network. Institutional. swift.com."
  - "BIS (Bank for International Settlements) — Basel Committee on Banking Supervision guidance + Committee on Payments and Market Infrastructures correspondent-banking consultative reports. Institutional. bis.org. §8.9 3rd use in frontier (also fx-treasury-basics + cross-border-payments)."
  - "FATF (Financial Action Task Force) — AML/CTF international standards + correspondent-banking guidance. Institutional. fatf-gafi.org."
  - "Wolfsberg Group — AML Principles + Correspondent Banking Due Diligence Questionnaire (CBDDQ) industry standard. Institutional. wolfsberg-group.org."
  - "JP Morgan / HSBC / Citi — Correspondent Banking guides + institutional-client onboarding standards. Institutional."
fulfills_catalog_entry: international-banking (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found KYC Risk Rating (complementary compliance-execution tool) + Cross-Border Investment Structuring (different scope). No banking-relationship management skills. §4.6 reclass."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum."
assigned_agent: frontier (Global Expansion / Cross-border Operations)
portable: true
date_added: 2026-07-31
tier: 3
description: Corporate international-banking relationship management — banking-need identification per entity + jurisdiction + approved-counterparty selection with capital-controls constraints + correspondent-banking due-diligence coordination (CBDDQ / Wolfsberg) + LOAD-BEARING AML/KYC-onboarding coordination + counterparty-risk monitoring. Trigger on "bank counterparty for [entity in country]", "correspondent banking for [operation]", "banking structure for [entity]", "capital controls for [currency]", "AML/KYC onboarding for [bank]", "CBDDQ / Wolfsberg due diligence", or "cross-border banking setup for [market]".
triggers:
  - bank counterparty for
  - correspondent banking for
  - banking structure for
  - capital controls for
  - AML/KYC onboarding for
  - CBDDQ / Wolfsberg due diligence
  - cross-border banking setup for
  - approved counterparty selection
  - trade finance for
---

# International Banking

## Introduction

This skill packages corporate international-banking relationship management
discipline for frontier — invoked once entity is set up (canopy `entity-setup-by-
jurisdiction`) and cross-border operations need banking infrastructure.
Banking-need identification per entity + jurisdiction + approved-counterparty
selection + correspondent-banking due-diligence coordination + AML/KYC-
onboarding coordination + counterparty-risk monitoring.

**Scope distinction:** frontier SCOPES banking relationships + coordinates
counterparty selection. Operator + treasury team + compliance team EXECUTE
onboarding + ongoing operations. Distinct from `fx-treasury-basics` (frontier
sibling — FX exposure), `cross-border-payments` (payment-flow execution),
`international-logistics` (physical trade).

Custom Route D per §8.2 — cited rubric grounded in SWIFT + BIS + FATF +
Wolfsberg + JP Morgan / HSBC / Citi institutional corpus.

## Purpose

Prevents six failure modes:

1. **Bank counterparty engagement without AML/KYC coordination.** Banks require
   extensive AML/KYC onboarding (institutional-client documentation, UBO
   disclosure, purpose-of-account, expected-transaction volumes). Skipping =
   onboarding delays or rejection. LOAD-BEARING.
2. **Ignore capital-controls per jurisdiction.** RMB (China), INR (India),
   some LatAm currencies have capital-controls restricting FX conversion +
   cross-border transfers. Counterparty selection without capital-controls
   awareness = operational failures at scale.
3. **Correspondent-banking without CBDDQ / Wolfsberg due diligence.** Post-2015
   correspondent-banking de-risking pressure requires structured due-diligence
   (CBDDQ or Wolfsberg-aligned). Skipping = correspondent relationship
   collapse. LOAD-BEARING.
4. **Counterparty-concentration risk.** Single-bank counterparty for all
   cross-border ops = concentration risk (bank failure / de-risking-driven
   account closure / political action). Counterparty diversification is
   discipline.
5. **Banking-structure without treasury-policy alignment.** Banking structure
   per entity should align with treasury policy from `fx-treasury-basics`
   sibling. Independent scoping creates policy-execution mismatch.
6. **Individual crisis DURING banking-onboarding crunch.** Team members under
   onboarding-timeline pressure + personal distress can coincide. HARD
   BOUNDARY per Universal Principle 3.

frontier uses this skill as Phase 2 of cross-border operations scoping (after
`fx-treasury-basics` Phase 1).

## When to Use

Trigger on:

- "Bank counterparty for [entity in country]"
- "Correspondent banking for [operation]"
- "Banking structure for [entity]"
- "Capital controls for [currency]"
- "AML/KYC onboarding for [bank]"
- "CBDDQ / Wolfsberg due diligence"
- "Cross-border banking setup for [market]"
- "Approved counterparty selection"
- "Trade finance for [transaction]"

Do NOT use for:

- **FX exposure + hedging** → `fx-treasury-basics` (frontier sibling)
- **Payment-flow execution** → `cross-border-payments` (frontier sibling)
- **Physical goods trade + Incoterms** → `international-logistics` (frontier sibling)
- **Entity setup** → canopy `entity-setup-by-jurisdiction`
- **Tax registration** → canopy `tax-registration`
- **Data-residency for banking data** → canopy `data-residency-mapping`
- **Actual account opening + operations** → operator + treasury + compliance
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

The international-banking workflow combines need-ID + counterparty selection +
CBDDQ + AML/KYC + monitoring:

```
CORPORATE BANKING NEEDS (per entity + jurisdiction)

  OPERATING ACCOUNT
    - Local currency operating account for entity operations
    - Payroll processing
    - Vendor payments
    - Customer collections

  LENDING / CREDIT FACILITIES
    - Revolving credit for operations
    - Term loans for capex
    - Trade finance (letters of credit / documentary collections)

  TREASURY SERVICES
    - Cash management + sweep
    - Cross-border payments (coordinate with cross-border-payments sibling)
    - FX transactions (coordinate with fx-treasury-basics sibling)
    - Hedging counterparty (coordinate with fx-treasury-basics)

  CORRESPONDENT BANKING (for entities without direct-clearing membership)
    - Access to other jurisdiction's clearing systems via correspondent
    - Post-2015 de-risking pressure — Wolfsberg CBDDQ standard


CAPITAL-CONTROLS AWARENESS (illustrative — evolving)

  CHINA (RMB)
    - Restrictions on RMB cross-border transfer
    - QFII / RQFII schemes for foreign investment
    - CIPS as alternative to SWIFT for RMB clearing

  INDIA (INR)
    - RBI restrictions on cross-border transfers
    - LRS (Liberalised Remittance Scheme) limits
    - FDI vs FPI classification affects transfer rules

  LATAM (varies)
    - Argentina capital controls (evolving)
    - Brazil restrictions on certain cross-border flows
    - Venezuela / Cuba sanctions-tied controls

  RUSSIA (post-2022)
    - Sanctions-based effective capital controls

  Verify current status with local banking counsel + operator + international-
  trade counsel. Capital-controls evolve frequently.


AML/KYC ONBOARDING (bank's requirements — vary)

  Standard requirements per Wolfsberg / FATF:
    - Institutional-client documentation
    - UBO (Ultimate Beneficial Owner) disclosure per FATF Recommendation 24
    - Purpose-of-account + expected-transaction-volume
    - Source-of-funds + source-of-wealth documentation
    - PEP (Politically Exposed Person) screening
    - Sanctions screening (OFAC / EU / UN / local)
    - Enhanced Due Diligence (EDD) for higher-risk categories

  Timeline: institutional-client onboarding typically 3-6 months for major
  banks in stable jurisdictions; longer for complex structures or higher-risk
  jurisdictions.


INTERNATIONAL-BANKING OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: BANKING-NEED IDENTIFICATION                  (per entity + jurisdiction)
  Phase 2: APPROVED-COUNTERPARTY SELECTION              (with capital-controls constraints)
  Phase 3: CORRESPONDENT-BANKING DUE DILIGENCE          (CBDDQ / Wolfsberg-aligned if applicable)
  Phase 4: LOAD-BEARING AML/KYC-ONBOARDING COORDINATION (with operator + compliance)
  Phase 5: COUNTERPARTY-RISK MONITORING HANDOFF          (to CFO + compliance ongoing)
```

## Instructions

### Phase 1 — Banking-need identification

Per entity + jurisdiction, identify banking needs:

- Operating account (local currency + reporting-currency)
- Lending / credit facilities (if applicable)
- Treasury services
- Correspondent banking (if entity lacks direct clearing access)
- Trade finance (if physical-goods trade — coordinate with `international-
  logistics` sibling)

Output: banking-needs map per entity + jurisdiction.

### Phase 2 — Approved-counterparty selection

Selection criteria:

- **Presence + capability** — bank has full-service branch in jurisdiction
  with corporate-banking capability
- **Capital-controls navigation** — bank has expertise + infrastructure for
  jurisdiction's capital-controls regime
- **Rating + stability** — bank credit rating acceptable (typically investment
  grade for primary counterparty); avoid politically-exposed banks
- **Correspondent-banking network** — bank has correspondent relationships
  enabling cross-border payments to relevant jurisdictions
- **Existing relationship** — leverage existing relationships at parent-org
  level where possible
- **Diversification** — avoid single-counterparty concentration; typical
  pattern is primary + secondary counterparties per jurisdiction

Output: approved-counterparty shortlist per entity + jurisdiction (typically
2-4 candidates).

### Phase 3 — Correspondent-banking due diligence (if applicable)

If correspondent-banking arrangement needed (entity's primary bank lacks
direct clearing to relevant jurisdictions):

- **CBDDQ (Correspondent Banking Due Diligence Questionnaire)** — Wolfsberg
  standard; industry-accepted format
- **Reciprocal due diligence** — correspondent + respondent both perform
  due diligence per Wolfsberg + FATF Recommendation 13
- **Ongoing monitoring** — quarterly or annual re-verification standard

**No correspondent-banking arrangement without CBDDQ / Wolfsberg-aligned due
diligence.** LOAD-BEARING.

### Phase 4 — LOAD-BEARING AML/KYC-onboarding coordination

**Every bank counterparty engagement routes through AML/KYC-onboarding
coordination.** frontier scopes; operator + compliance + counsel EXECUTE
onboarding.

- Institutional-client documentation package prep
- UBO disclosure (per FATF Rec 24 + local requirements)
- Source-of-funds + source-of-wealth documentation
- PEP + sanctions screening (may leverage complementary KYC Risk Rating
  marketplace tool for compliance-team execution)
- EDD if applicable (higher-risk jurisdictions / structures)

**No bank counterparty engagement without AML/KYC-onboarding coordination.**
Deviation = LOAD-BEARING REFUSAL.

Timeline: 3-6 months typical for major banks in stable jurisdictions;
longer for complex.

### Phase 5 — Counterparty-risk monitoring handoff

frontier scopes strategy + coordination. CFO + compliance ongoing-monitor:

- Counterparty credit rating changes
- Political / sanctions-risk changes affecting counterparties
- Concentration-risk limits adherence
- De-risking notifications from banks

## Output Format

Each invocation produces one or more of:

- **Banking-needs map** — per entity + jurisdiction
- **Approved-counterparty shortlist** — 2-4 candidates per entity + jurisdiction
  with criteria evaluation
- **Correspondent-banking due-diligence brief** — CBDDQ / Wolfsberg-aligned
- **AML/KYC-onboarding coordination brief** — for operator + compliance execution
- **Counterparty-risk monitoring framework** — for CFO + compliance ongoing
- **Cross-agent handoff briefs** — to frontier siblings + canopy + CFO +
  compliance + operator

## Principles

1. **Never bank counterparty engagement without AML/KYC-onboarding coordination** —
   LOAD-BEARING per Purpose failure mode 1.
2. **Never correspondent-banking without CBDDQ / Wolfsberg-aligned due diligence** —
   LOAD-BEARING per Purpose failure mode 3.
3. **Never counterparty selection without capital-controls per-jurisdiction
   verification** — LOAD-BEARING per Purpose failure mode 2.
4. **Counterparty diversification discipline** — avoid single-counterparty
   concentration per jurisdiction.
5. **Banking structure aligned with treasury policy** from `fx-treasury-basics`
   sibling. Independent scoping = mismatch.
6. **No fabrication** — cited institutional sources (SWIFT + BIS + FATF +
   Wolfsberg + JP Morgan / HSBC / Citi). Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   UBO / PEP data handled per operator + compliance + counsel privilege
   discipline.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
   `logical/README.md`.

## Fallback

- **AML/KYC-onboarding delayed for high-risk jurisdiction.** DEFER banking
  engagement. Do NOT proceed without onboarding — LOAD-BEARING. Coordinate
  with operator + compliance + counsel for extended-timeline planning.
- **De-risking notification from counterparty** (bank pulls out of relationship).
  Escalate to operator + CFO + compliance + counsel; activate counterparty-
  diversification backup; may need urgent alternative counterparty engagement.
- **Sanctions-risk change affecting counterparty** (bank added to sanctions
  list; jurisdiction added to sanctions program). Escalate immediately to
  operator + international-trade counsel + compliance.
- **Capital-controls change** (regulatory update restricting cross-border
  transfers). Coordinate with local banking counsel + operator + potentially
  frontier sibling `cross-border-payments` for payment-flow re-routing.
- **Correspondent-banking relationship collapse** (correspondent bank exits
  jurisdiction). Escalate to operator + compliance + international-trade
  counsel; may require alternative correspondent-banking arrangement or
  routing.
- **Counterparty-concentration risk detected** (over-reliance on single
  counterparty per jurisdiction). Recommend diversification plan to CFO +
  operator.
- **Complex banking structure** required (multi-jurisdiction cash-pool /
  in-house-bank / regional-treasury-center). Route to operator + treasury
  counsel + specialist treasury-consulting resources. frontier scopes
  BASICS; complex structures require specialist input.
- **Individual crisis signal during banking conversation.** STOP. Route per
  Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `fx-treasury-basics` (custom, frontier — sibling) | Treasury policy alignment; hedging counterparty coordination | Coordination |
| `cross-border-payments` (custom, frontier — sibling) | Payment-flow execution over banking rails | Coordination — downstream |
| `international-logistics` (custom, frontier — sibling) | Trade finance (letters of credit / documentary collections) for physical-goods trade | Coordination |
| canopy `entity-setup-by-jurisdiction` (Global Expansion sibling) | Entity must exist before banking-relationship setup | Upstream |
| canopy `tax-registration` (Global Expansion sibling) | Tax-ID needed for account opening | Upstream coordination |
| canopy `data-residency-mapping` (Global Expansion sibling) | Banking-data residency implications per jurisdiction | Coordination |
| beacon `data-room-discipline` (Comms & PR) | Banking documents feed data-room `/02_Financial/` folder | Coordination |
| CFO + compliance | AML/KYC-onboarding EXECUTION + counterparty-risk monitoring | Downstream — clear scope split |
| Operator + international-trade counsel | Sanctions / regulatory changes + de-risking / correspondent-relationship collapse | Escalation |
| Operator + local banking counsel | Capital-controls changes + jurisdiction-specific banking-regulation questions | Escalation |
| Operator + treasury counsel | Complex banking structures (cash-pool / in-house-bank / regional-treasury-center) | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every frontier artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [SWIFT — Correspondent Banking Due Diligence Questionnaire (CBDDQ)](https://www.swift.com/our-solutions/compliance-and-shared-services/financial-crime-compliance/our-kyc-solutions/kyc-registry)
- [SWIFT — Payment Messaging](https://www.swift.com/)
- [BIS — Committee on Payments and Market Infrastructures Correspondent Banking](https://www.bis.org/cpmi/publ/d147.htm)
- [BIS — Basel Committee on Banking Supervision](https://www.bis.org/bcbs/)
- [FATF — Recommendations](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html)
- [Wolfsberg Group — CBDDQ + AML Principles](https://www.wolfsberg-group.org/)
- [JP Morgan — Correspondent Banking](https://www.jpmorgan.com/solutions/treasury-services/correspondent-banking)
- [HSBC — Global Banking and Markets](https://www.gbm.hsbc.com/)
