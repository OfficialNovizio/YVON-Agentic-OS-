<!--
Custom skill — built from scratch, synthesized from named institutional sources
(BIS + CFA Institute + JP Morgan + HSBC + AFP). Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search returned FINANCIAL/TRADING FX
skills (wealth-management, carry trade, derivative pricing). frontier's scope
is CORPORATE OPERATIONAL treasury — different domain entirely. §4.6 reclass
to custom Route D. Same pattern as compass expansion-portfolio-mgmt reclass
from financial-portfolio marketplace skills.

Route D per §8.2 (cited rubric).
-->
---
name: fx-treasury-basics
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "BIS (Bank for International Settlements) — canonical institutional source on FX markets. Publicly available at bis.org. Triennial Central Bank Survey of FX + OTC Derivatives Markets is the industry-standard reference."
  - "CFA Institute — Corporate Finance and Foreign Exchange curriculum materials. Institutional. cfainstitute.org. Level II FX + hedging materials publicly-accessible via CFA Institute."
  - "JP Morgan — Treasury Services + FX guides. Institutional practitioner materials. jpmorgan.com."
  - "HSBC — Global Treasury Management guides. Institutional. hsbc.com."
  - "AFP (Association for Financial Professionals) — treasury standards + benchmark reports. Institutional. afponline.org."
fulfills_catalog_entry: fx-treasury-basics (custom per §2 routing)
reclassification_notes:
  - "§4.1 search returned financial/trading FX skills only. Different domain from corporate operational treasury. §4.6 reclass to custom Route D."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum."
assigned_agent: frontier (Global Expansion / Cross-border Operations)
portable: true
date_added: 2026-07-31
tier: 3
description: Corporate operational FX + treasury basics for cross-border business ops — FX-exposure identification (transaction / translation / economic) + natural-hedging opportunities + hedging-strategy scoping (forwards / options / swaps) + treasury-policy scoping per entity + LOAD-BEARING CFO + treasury counsel joint review for hedging decisions. NOT financial-portfolio management (different domain). frontier scopes; CFO + treasury team execute. Trigger on "FX exposure for [operation]", "hedging strategy for [currency exposure]", "natural hedging opportunities for [ops]", "treasury policy for [entity in country]", "currency-holding policy", "forward contract vs option for [exposure]", or "FX risk assessment for [expansion]".
triggers:
  - FX exposure for
  - hedging strategy for
  - natural hedging opportunities for
  - treasury policy for
  - currency-holding policy
  - forward contract vs option for
  - FX risk assessment for
  - transaction exposure in
  - translation exposure in
  - economic exposure in
---

# FX Treasury Basics

## Introduction

This skill packages corporate operational FX + treasury basics discipline for
frontier — invoked when compass has selected a market + entry mode with FX
exposure implications. FX-exposure identification + natural-hedging
opportunities + hedging-strategy scoping + treasury-policy scoping + LOAD-
BEARING CFO + treasury counsel joint review for hedging decisions.

**Scope distinction:** this is CORPORATE OPERATIONAL treasury — helping the
org manage FX exposure from cross-border ops. Distinct from:
- **Financial-portfolio management** (stocks / ETFs / investment portfolios) —
  operator + CFO scope; NOT frontier
- **Investment / trading strategy** (carry trade / derivative pricing for
  investment) — financial-services scope; NOT frontier
- **`international-banking`** (frontier sibling — banking-relationship management)
- **`cross-border-payments`** (frontier sibling — payment-flow execution)

frontier SCOPES strategy + coordination; CFO + treasury team EXECUTE actual
FX transactions + hedging trades.

Custom Route D per §8.2 — cited rubric grounded in BIS + CFA + JP Morgan +
HSBC + AFP institutional corpus.

## Purpose

Prevents six failure modes:

1. **FX-exposure blindness.** Cross-border ops create three exposure types:
   - **Transaction exposure** — receivables/payables in foreign currency
     with settlement lag
   - **Translation exposure** — foreign subsidiary financials translated to
     reporting-currency for consolidation
   - **Economic exposure** — long-term competitive-position exposure to
     FX-driven cost/revenue shifts
   Missing exposure types = unmanaged risk that surfaces in reported
   results.
2. **Ignore natural hedging.** Matching FX inflows with outflows in the same
   currency (invoice-in-EUR-costs-in-EUR) reduces exposure without hedging
   costs. Natural hedging is Phase 1 before considering derivatives.
3. **Hedging without CFO + treasury counsel.** Hedging strategy (forward /
   option / swap) has accounting + tax + counterparty-risk implications.
   Skipping CFO + treasury counsel = predictable errors. LOAD-BEARING.
4. **Speculative FX position mistaken for hedging.** Hedging REDUCES exposure
   to known operational risk. Speculation TAKES exposure hoping for
   directional gain. frontier NEVER recommends speculation — operational
   treasury only. LOAD-BEARING refusal.
5. **Treasury-policy per-entity blindness.** Currency-holding policy varies
   per entity + jurisdiction — Chinese subsidiary can't freely convert RMB
   out; some jurisdictions have capital controls; some restrict foreign-
   currency operating accounts. Policy scoping requires local-banking
   coordination (frontier sibling `international-banking`).
6. **Individual crisis DURING FX-crunch conversation.** Team members under
   quarter-end FX-reporting pressure + personal distress can coincide. HARD
   BOUNDARY per Universal Principle 3.

frontier uses this skill as Phase 1 of any cross-border operations scoping.

## When to Use

Trigger on:

- "FX exposure for [operation]" / "transaction / translation / economic
  exposure in [country]"
- "Hedging strategy for [currency exposure]" / "forward contract vs option
  for [exposure]"
- "Natural hedging opportunities for [ops]"
- "Treasury policy for [entity in country]" / "currency-holding policy"
- "FX risk assessment for [expansion]"
- Handoff from compass `entry-mode-decision` once entity + operations planned

Do NOT use for:

- **Country/market selection** → compass `market-selection-framework`
- **Entity setup** → canopy `entity-setup-by-jurisdiction`
- **Actual FX trades / hedge execution** → CFO + treasury team + bank counterparties
- **Investment / trading strategy** — financial-services scope
- **Financial-portfolio management** — operator + CFO scope
- **`international-banking` relationship management** → frontier sibling
- **`cross-border-payments` execution** → frontier sibling
- **`international-logistics`** → frontier sibling
- **Withholding-tax scoping on cross-border payments** → canopy `tax-registration`
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

The FX-treasury workflow combines exposure ID + natural hedging + hedging
strategy + treasury policy:

```
FX EXPOSURE TYPES (CFA Institute Corporate Finance framework)

  TRANSACTION EXPOSURE
    - Foreign-currency receivables + payables with settlement lag
    - Time between transaction commitment + settlement
    - Hedgeable with forwards / options
    - Most common for cross-border trade + services

  TRANSLATION EXPOSURE
    - Foreign subsidiary financials translated to reporting-currency at
      consolidation
    - Non-cash exposure (paper impact on consolidated results)
    - Accounting-standard-driven (FASB / IFRS translation methods)
    - Hedgeable but often accepted as accounting-noise

  ECONOMIC EXPOSURE
    - Long-term competitive-position exposure to FX-driven cost/revenue
      shifts
    - Cannot be fully hedged (structural)
    - Managed via natural hedging + strategic operational choices
      (production location / sourcing / pricing)


HEDGING INSTRUMENTS (basics — actual selection = CFO + treasury counsel)

  NATURAL HEDGING
    - Match FX inflows with outflows in same currency
    - Invoice + collect in operating currency
    - Locate costs in same currency as revenues where feasible
    - Zero-cost; Phase 1 before considering derivatives

  FORWARD CONTRACTS
    - Lock in future FX rate for known future transaction
    - Zero upfront cost (counterparty compensated via rate)
    - Obligation to transact at forward rate regardless of spot at settlement

  FX OPTIONS
    - Right (not obligation) to transact at strike rate
    - Premium cost upfront
    - Downside protection with upside participation

  FX SWAPS
    - Exchange principal + interest streams in two currencies
    - Used for longer-term hedging + funding
    - Complexity higher than forwards / options


TREASURY POLICY SCOPING

  Per entity + jurisdiction:
    - Currency-holding policy — which currencies + how much
    - Cash-repatriation policy — pattern for moving cash to parent
    - Hedging policy — % of exposure hedged, tenor, instruments allowed
    - Counterparty policy — approved bank counterparties per jurisdiction
    - Capital-controls awareness — RMB / INR / some LatAm currencies have
      restrictions (frontier sibling `international-banking` scopes)


FX-TREASURY OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: FX-EXPOSURE IDENTIFICATION                (transaction / translation / economic per operation)
  Phase 2: NATURAL-HEDGING OPPORTUNITIES              (before considering derivatives)
  Phase 3: HEDGING-STRATEGY SCOPING                    (forwards / options / swaps — LOAD-BEARING with CFO + counsel)
  Phase 4: TREASURY-POLICY SCOPING                     (currency-holding / repatriation / hedging / counterparty per entity)
  Phase 5: ONGOING-MONITORING HANDOFF                  (to CFO + treasury team)
```

## Instructions

### Phase 1 — FX-exposure identification

Per cross-border operation:

- **Transaction exposure inventory** — foreign-currency receivables + payables
  + expected timing
- **Translation exposure inventory** — foreign subsidiary financials +
  reporting-currency translation methodology (temporal / current-rate)
- **Economic exposure assessment** — long-term structural FX exposure of
  competitive position

Output: FX exposure map per entity + currency + amount + timing.

### Phase 2 — Natural-hedging opportunities

Before considering derivatives, identify natural-hedging opportunities:

- Match FX inflows with outflows in same currency
- Invoice + collect in operating currency where feasible
- Sourcing decisions (locate costs in same currency as revenues)
- Pricing decisions (price in local currency vs reporting-currency)

Natural hedging is zero-cost; recommend before derivatives.

### Phase 3 — Hedging-strategy scoping (LOAD-BEARING — CFO + treasury counsel)

For remaining exposure post-natural-hedging, scope hedging strategy:

- **Forwards** for known future transactions with defined timing
- **Options** for uncertain-timing exposure with downside protection
- **Swaps** for longer-term structural exposure

**Every hedging strategy recommendation requires CFO + treasury counsel joint
review** — accounting + tax + counterparty-risk implications. LOAD-BEARING.

frontier scopes strategy; CFO + treasury team + bank counterparties execute
trades.

**Speculative FX positions NEVER recommended.** LOAD-BEARING refusal.
frontier's scope is HEDGING (reducing exposure) NOT SPECULATION (taking
directional exposure for gain).

### Phase 4 — Treasury-policy scoping per entity

Per entity + jurisdiction:

- **Currency-holding policy** — which currencies + how much cash held per
  currency
- **Cash-repatriation policy** — pattern + tax-efficient repatriation
  coordination with canopy `tax-registration`
- **Hedging policy** — % of exposure hedged, tenor limits, instruments
  allowed
- **Counterparty policy** — approved bank counterparties per jurisdiction
  (coordinate with frontier sibling `international-banking`)
- **Capital-controls awareness** — RMB / INR / some LatAm currencies have
  restrictions

### Phase 5 — Ongoing-monitoring handoff

frontier scopes strategy + policy; CFO + treasury team ongoing-monitors:

- FX exposure per quarter
- Hedge effectiveness
- Counterparty exposure limits
- Policy-adherence audit

## Output Format

Each invocation produces one or more of:

- **FX exposure map** — per entity + currency + amount + timing per exposure
  type
- **Natural-hedging opportunities memo** — recommendations before derivatives
- **Hedging-strategy scoping brief** — for CFO + treasury counsel joint review
- **Treasury-policy scoping** — currency-holding + repatriation + hedging +
  counterparty per entity
- **Cross-agent handoff briefs** — to CFO + treasury team + frontier siblings
  (international-banking + cross-border-payments) + canopy (`tax-registration`
  for repatriation coordination)

## Principles

1. **Never hedging strategy recommendation without CFO + treasury counsel
   joint review** — LOAD-BEARING per Purpose failure mode 3. Accounting +
   tax + counterparty-risk implications require joint review.
2. **Never speculative FX position recommendation** — LOAD-BEARING per
   Purpose failure mode 4. frontier scope is HEDGING only.
3. **Natural hedging assessed FIRST** — before considering derivatives.
4. **All 3 exposure types identified** — transaction + translation + economic.
   Missing = unmanaged risk.
5. **Treasury policy per entity + jurisdiction** — capital-controls +
   currency-holding + repatriation patterns vary per jurisdiction.
6. **No fabrication** — cited institutional sources (BIS + CFA + JP Morgan +
   HSBC + AFP). FX rates + exposure amounts sourced or flagged. Universal
   Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
   `logical/README.md`.

## Fallback

- **CFO + treasury counsel unavailable for hedging joint review.** DEFER
  hedging recommendation. Do NOT recommend hedging strategy without joint
  review — LOAD-BEARING.
- **Speculative-position pressure** (someone wants directional FX bet).
  Decline per Principle 2 — LOAD-BEARING. Escalate to operator + CFO;
  frontier scope is hedging only.
- **Capital-controls constraint** (RMB / INR / some LatAm) blocks intended
  treasury policy. Coordinate with frontier sibling `international-banking`
  + operator + local banking counsel; may require alternative treasury
  structure.
- **Complex derivative instrument recommendation** (exotic options, structured
  products). Route to operator + treasury counsel + derivative-specialist
  counsel. frontier scopes BASICS; complex instruments require specialist
  input.
- **Counterparty-risk concern** with a bank counterparty. Coordinate with
  frontier sibling `international-banking` + operator + CFO for
  counterparty-diversification review.
- **Tax implications of hedging** (accounting-hedge vs speculative-hedge for
  tax purposes; qualifying hedge accounting under IFRS 9 / ASC 815).
  Coordinate with canopy `tax-registration` + tax counsel.
- **Cross-venture treasury coordination** (multiple ventures sharing treasury
  policy). Escalate to marcus / vista + operator + CFO.
- **Individual crisis signal during FX-treasury conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| compass `entry-mode-decision` (Global Expansion Lead) | Entry-mode drives FX exposure profile | Upstream |
| `international-banking` (custom, frontier — sibling) | Approved bank counterparties + capital-controls navigation | Coordination |
| `cross-border-payments` (custom, frontier — sibling) | Payment-flow FX exposure at transaction level | Coordination |
| `international-logistics` (custom, frontier — sibling) | Physical-goods trade FX exposure (invoice-currency + Incoterms + payment timing) | Coordination |
| canopy `tax-registration` (Global Expansion sibling) | Withholding-tax + repatriation-tax + hedge-accounting tax implications | Coordination |
| canopy `entity-setup-by-jurisdiction` (Global Expansion sibling) | Entity structure affects FX exposure + treasury policy | Upstream |
| CFO + treasury team | Actual FX trade execution + ongoing monitoring | Downstream — clear scope split (frontier scopes; CFO executes) |
| Operator + treasury counsel | LOAD-BEARING joint review for hedging strategy | Escalation — Principle 1 |
| Operator + derivative-specialist counsel | Complex derivative instruments beyond basics | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every frontier artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [BIS — Foreign Exchange (FX) Markets](https://www.bis.org/statistics/rpfx.htm)
- [BIS — Triennial Central Bank Survey](https://www.bis.org/statistics/rpfx22.htm)
- [CFA Institute — Corporate Finance materials](https://www.cfainstitute.org/en/programs/cfa/curriculum)
- [JP Morgan — Treasury Services](https://www.jpmorgan.com/solutions/treasury-services)
- [HSBC — Global Treasury Management](https://www.business.hsbc.com/global-liquidity-cash-management)
- [AFP — Association for Financial Professionals](https://www.afponline.org/)
- [FASB — ASC 815 Derivatives and Hedging (institutional)](https://asc.fasb.org/topic&trid=2144459)
- [IASB — IFRS 9 Financial Instruments (institutional)](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/)
