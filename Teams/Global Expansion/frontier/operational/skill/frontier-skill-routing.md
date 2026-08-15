<!--
Operational: skill-routing table for frontier (Global Expansion / Cross-border
Operations). Non-leader agent: Universal-only principles apply.
-->

# frontier — Skill Routing

> Routing for frontier (Global Expansion / Cross-border Operations). Non-leader
> — reports up to compass (Global Expansion Lead — Pankaj Ghemawat identity).

## Skill Roster (4 skills, all custom Route D §4.6 reclass)

| Skill | Route | Sources |
|---|---|---|
| `fx-treasury-basics` | D custom | BIS + CFA Institute + JP Morgan + HSBC + AFP |
| `international-banking` | D custom | SWIFT + BIS + FATF + Wolfsberg + JP Morgan / HSBC / Citi |
| `cross-border-payments` | D custom | SWIFT + BIS CPMI + FATF + G20 Roadmap + Wise/Airwallex/Stripe |
| `international-logistics` | D custom | ICC Incoterms 2020 + WTO + WCO HS + UNCTAD + Flexport/Freightos |

## Trigger-Phrase Routing

### `fx-treasury-basics`

- FX exposure for / transaction/translation/economic exposure in
- hedging strategy for / natural hedging opportunities for
- treasury policy for / currency-holding policy
- forward contract vs option for / FX risk assessment for

### `international-banking`

- bank counterparty for / correspondent banking for / banking structure for
- capital controls for / AML/KYC onboarding for / CBDDQ / Wolfsberg due diligence
- cross-border banking setup for / approved counterparty selection / trade finance for

### `cross-border-payments`

- payment rail for / SWIFT vs fintech for / SEPA vs SEPA Instant for
- cross-border payment provider for / AML/sanctions screening for payment
- FX cost analysis for / payment timing for / CIPS for RMB payment
- Travel Rule for cross-border payment / payment-provider due diligence

### `international-logistics`

- Incoterms for / HS code for / import duties for
- letter of credit for / freight forwarder for / customs coordination for
- FOB vs CIF vs DDP for / trade finance for B2B transaction
- documentary collection for / VAT on import for

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "cross-border" generic | Discovery per §3 — FX / banking / payments / logistics | Skill-specific |
| "AML" or "KYC" — hits banking + payments | Banking-relationship AML = `international-banking`; payment-transaction AML = `cross-border-payments` | Scope distinction |
| "trade finance" — hits banking (L/C-issuing bank) + logistics (L/C for B2B trade) | Both — coordinate: banking scopes counterparty; logistics scopes L/C use for trade | Cross-skill coordination |
| "letter of credit" | Route to `international-logistics` (trade context); coordinate with `international-banking` for issuing bank | Trade-scope owner |
| "FX cost" | Route to `cross-border-payments` (for payment-embedded FX) OR `fx-treasury-basics` (for hedging FX) | Payment vs hedging distinction |
| "hedging" | Route to `fx-treasury-basics` | Framework-owner |
| "sanctions" | Route to `cross-border-payments` (payment sanctions screening) OR `international-banking` (counterparty sanctions) | Scope distinction |
| "SWIFT" — could be payment rail OR banking messaging | Payment rail decision = `cross-border-payments`; banking-relationship SWIFT = `international-banking` | Scope distinction |

## Escalation to Other Agents (out-of-scope)

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Country/market selection** | **compass** `market-selection-framework` | Selection scope |
| **Entry-mode decision** | **compass** `entry-mode-decision` | Entry-mode scope |
| **GTM strategy** | **compass** `go-to-market-adaptation` | GTM scope |
| **Portfolio-mgmt** | **compass** `expansion-portfolio-mgmt` | Portfolio scope |
| **Entity setup / tax registration / employment / data-residency compliance** | **canopy** (all 4 skills) | Regulatory scope |
| **Localization** | **lingua** (all 4 skills) | Localization scope |
| **Investment / trading strategy** | operator + CFO + specialist advisors | Different domain (frontier scope is operational treasury) |
| **Financial-portfolio management (stocks / ETFs)** | operator + CFO | Different domain |
| **Developer integration for in-app payment features** | dev (Engineering) with marketplace payment-integration skills | Engineering execution |
| **Actual customs filings** | operator + customs broker | Filing execution |
| **Actual freight-forwarder engagement** | operator + procurement | Vendor engagement |
| **Actual FX trade execution** | CFO + treasury team + bank counterparties | Trade execution |
| **Individual mental-health crisis signals** | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |

## Cross-Global Expansion Coordination

| Sibling | Coordination surface |
|---|---|
| **compass** (Lead) | Report-up; upstream inputs (entity + entry-mode decisions drive cross-border ops requirements) |
| **canopy** (Regulatory & Compliance) | canopy `entity-setup` upstream trigger; canopy `tax-registration` for WHT + repatriation; canopy `data-residency-mapping` for banking + payment data residency |
| **lingua** (Localization) | Currency-format localization in `product-localization` |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any skill front-matter `triggers:` change; any
  cross-agent handoff surface change.
