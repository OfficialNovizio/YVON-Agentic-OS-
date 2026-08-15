<!--
Operational: commands file for frontier per §7. Non-leader agent.
-->

# frontier — Commands

> Invocation patterns for frontier (Global Expansion / Cross-border Operations).
> Non-leader — reports up to compass.

## Direct Invocations

### `fx-treasury-basics`

| Command | Skill phase | Output |
|---|---|---|
| `frontier: FX exposure for [operation]` | Phase 1 | Exposure map (transaction / translation / economic) |
| `frontier: natural hedging opportunities for [ops]` | Phase 2 | Natural-hedging recommendations |
| `frontier: hedging strategy for [exposure]` | Phase 3 | Strategy brief for CFO + treasury counsel joint review |
| `frontier: treasury policy for [entity in country]` | Phase 4 | Currency-holding + repatriation + hedging + counterparty policy |

### `international-banking`

| Command | Skill phase | Output |
|---|---|---|
| `frontier: banking needs for [entity in country]` | Phase 1 | Needs map (operating / lending / treasury / correspondent) |
| `frontier: bank counterparty for [entity]` | Phase 2 | Shortlist with capital-controls constraints |
| `frontier: CBDDQ / Wolfsberg due diligence for [correspondent]` | Phase 3 | Due-diligence brief |
| `frontier: AML/KYC onboarding for [bank]` | Phase 4 | Coordination brief for operator + compliance |

### `cross-border-payments`

| Command | Skill phase | Output |
|---|---|---|
| `frontier: payment flow map` | Phase 1 | Payment-flow inventory per corridor |
| `frontier: payment rail for [flow]` | Phase 2 | Rail recommendation with decision-matrix |
| `frontier: AML/sanctions screening framework for [corridor]` | Phase 3 | Travel Rule + screening + EDD scope |
| `frontier: FX cost + timing analysis for [flow]` | Phase 4 | Total-cost per-rail comparison |
| `frontier: payment-provider due diligence for [provider]` | Phase 5 | Brief for compliance + operator |

### `international-logistics`

| Command | Skill phase | Output |
|---|---|---|
| `frontier: trade-lane map` | Phase 1 | Physical-goods trade inventory |
| `frontier: Incoterms for [trade lane]` | Phase 2 | Incoterm recommendation with cost + risk-transfer memo |
| `frontier: HS code for [product]` | Phase 3 | Classification recommendation (binding-ruling for complex) |
| `frontier: import duties + VAT for [trade lane]` | Phase 3 | Duties/VAT calculation with FTA eligibility |
| `frontier: trade finance for [B2B transaction]` | Phase 4 | Instrument recommendation (L/C / doc collection / open account) |
| `frontier: freight forwarder selection for [route]` | Phase 5 | Selection scoping brief |

## Coordination Commands (cross-agent)

| Command | Coordinates with | Purpose |
|---|---|---|
| `frontier → compass: cross-border ops complete for [market]` | compass | Report-up |
| `frontier → canopy: WHT scoping for [payment flow]` | canopy `tax-registration` | Coordination |
| `frontier → canopy: import-VAT registration for [entity]` | canopy `tax-registration` | Coordination |
| `frontier → canopy: banking/payment data-residency` | canopy `data-residency-mapping` | Coordination |
| `frontier → lingua: currency-format for cross-border payments` | lingua `product-localization` | Coordination |
| `frontier → beacon: financial documents for data room` | beacon `data-room-discipline` | Coordination |
| `frontier → CFO + treasury team: FX trade execution handoff` | CFO + treasury | Downstream execution |
| `frontier → operator + compliance: payment execution` | operator + compliance | Downstream execution |
| `frontier → operator + customs broker: customs filing execution` | operator + customs broker | Downstream execution |
| `frontier → operator + procurement: freight forwarder engagement` | operator + procurement | Downstream execution |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Hedging without CFO + treasury counsel | operator + CFO + treasury counsel | LOAD-BEARING — fx-treasury Principle 1 |
| Speculative FX position pressure | operator + CFO | LOAD-BEARING — fx-treasury Principle 2 |
| AML/KYC delayed for high-risk jurisdiction | operator + compliance + counsel | LOAD-BEARING — banking Principle 1 |
| De-risking notification from counterparty | operator + CFO + compliance + counsel | Urgent counterparty backup |
| Sanctions-hit on payment / counterparty | operator + international-trade counsel | LOAD-BEARING legal fence |
| CBDDQ / Wolfsberg due diligence skipped pressure | operator + compliance | LOAD-BEARING — banking Principle 2 |
| Capital-controls change affecting operations | operator + local banking counsel | Legal-fence escalation |
| Payment-provider license unclear | operator + compliance + counsel | LOAD-BEARING — payments Principle 2 |
| HS classification ambiguous | operator + customs counsel + binding-ruling | LOAD-BEARING — logistics Principle 2 |
| Section 301 / reciprocal tariff regime change | operator + international-trade counsel | Landed-cost re-analysis |
| Correspondent-banking collapse | operator + compliance + international-trade counsel | Urgent alternative arrangement |
| Trade-finance dispute (L/C / doc collection) | operator + trade-finance counsel + potentially litigation | Legal escalation |
| Complex derivative instrument recommendation | operator + treasury counsel + derivative specialist | Specialist scope |
| Governance approval for major cross-border decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `frontier: market selection` | compass | Selection scope |
| `frontier: entity setup / tax registration / employment / data-residency` | canopy | Regulatory scope |
| `frontier: localize [content]` | lingua | Localization scope |
| `frontier: investment strategy / trading strategy` | operator + CFO + specialist advisors | Different domain |
| `frontier: financial-portfolio management` | operator + CFO | Different domain |
| `frontier: developer integration for in-app payments` | dev (Engineering) | Engineering execution |
| `frontier: execute FX trade / payment / customs filing / freight engagement` | operator + relevant execution team | Execution scope |
| `frontier: draft legal contract` | operator + counsel | Legal drafting |
| `frontier: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |
| `frontier: speculative FX bet` | Decline per fx-treasury Principle 2 | LOAD-BEARING |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
