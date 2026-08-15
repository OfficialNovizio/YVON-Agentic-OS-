<!--
Department workflow for Global Expansion. compass-led multi-agent sequencing
patterns. Companion to README.md.
-->

# Global Expansion — Department Workflow

> **compass** (Global Expansion Lead — Pankaj Ghemawat identity) sequences
> multi-agent Global Expansion work. This file documents standard sequencing
> patterns for events that span 2-4 agents in the department.

## Sequencing Principle

Per §2 (CLAUDE.md routing) + Prime Directive: multi-agent tasks route to the
department leader (**compass**) who sequences the others. compass never does
canopy's or lingua's or frontier's work — compass sequences the sequence,
checks the seams, and enforces Ghemawat-flavored department-level disciplines
at coordination surfaces.

## Standard Sequencing Patterns

### Pattern A — Full New-Market Entry (all 4 agents + hire + Comms & PR)

**Trigger:** decision to enter a new country/market.

**compass sequences:**

1. **compass `market-selection-framework`** — CAGE + LOF + political-risk
   analysis + first-market-adjacency sequencing. Output: market #1 approved
   for entry.
2. **compass `entry-mode-decision`** — Root 7-mode + strategic-control
   assessment + investment/speed constraints + CAGE/LOF profile mapping.
   Output: entry mode approved.
3. **PARALLEL** (once entry mode approved):
   - **canopy `entity-setup-by-jurisdiction`** — structure decision + local-
     counsel scoping + registration checklist + dissolution-planning-at-setup
   - **canopy `tax-registration`** — obligation scoping + tax-counsel scoping
     + registration + BEPS/DST scan
   - **canopy `employment-law-multi-jurisdiction`** (if hiring) — 8-dimension
     scoping + local employment-counsel scoping
   - **canopy `data-residency-mapping`** (if data collection) — regime
     scoping + cross-border transfer mechanism + data-protection-counsel
     scoping + Cybersecurity handoff (warden/veil/bastion)
   - **hire `payroll-and-eor`** (P&C Lead) — classification EXECUTION per
     canopy employment-law scoping
   - **frontier `fx-treasury-basics`** — FX exposure map + hedging strategy
     scoping + treasury policy
   - **frontier `international-banking`** — counterparty selection + AML/KYC
     onboarding coordination
   - **frontier `international-logistics`** (if physical goods) — Incoterms
     + HS classification + trade-finance coordination
4. **compass `go-to-market-adaptation`** — AAA analysis + product / pricing /
   channel / messaging brief. Output: GTM plan.
5. **PARALLEL** (once GTM plan approved):
   - **lingua `product-localization`** — technical i18n execution coordination
     with dev
   - **lingua `marketing-localization`** — transcreation of headlines /
     campaigns / etc. with brand voice + local competitive-context
   - **lingua `legal-localization`** — T&Cs + privacy policy + cookie notice
     localization with counsel-review gate
   - **lingua `cultural-adaptation`** — cultural-appropriateness gate for all
     content
   - **frontier `cross-border-payments`** — payment-rail + AML/sanctions
     coordination for customer collections / vendor payments
6. **COMMS ROLLOUT** (as launch approaches):
   - **signal `internal-cadence`** or **`change-comms`** (Comms & PR) —
     internal announcement coordination
   - **herald `press-kit`** + **`media-relations`** (Comms & PR) — external
     press for market launch
   - **beacon `investor-cadence`** (Comms & PR) — if launch is material,
     Reg FD coordination

**Escalation:** operator + relevant counsel throughout (LOAD-BEARING per
Universal Principle 5). marcus / vista (Executive Office) for strategy-level
cross-venture questions.

### Pattern B — Portfolio Rebalancing (annual or triggered)

**Trigger:** annual portfolio review OR triggered by material change (venture
strategy shift / market conditions / competitive dynamics).

**compass sequences:**

1. **compass `expansion-portfolio-mgmt`** — Ghemawat-adjusted BCG per market
   + regional-clustering overlay + cross-market learning transfer +
   rebalancing decisions (double-down / hold / invest / divest / MVP).
2. **PER MARKET** (based on rebalancing decision):
   - **DOUBLE-DOWN** → increase resource allocation; coordinate with
     compass `entry-mode-decision` for mode-upgrade if entry was low-
     commitment; coordinate with frontier for expanded ops
   - **HOLD** → maintain current; ongoing coordination with all 3 non-
     leader siblings
   - **INVEST MORE** → similar to DOUBLE-DOWN with milestone gates
   - **DIVEST** → activate market-exit protocol Pattern C
   - **MINIMUM-VIABLE-PRESENCE** → reduce allocation with clear scope
3. Report-out to marcus / vista (Executive Office) + board (Governance) +
   operator.

### Pattern C — Market-Exit Protocol (divest decision)

**Trigger:** divest decision from Pattern B rebalancing OR forced by
regulatory action / geopolitical event.

**compass sequences (LOAD-BEARING legal fence at every step):**

1. **compass `expansion-portfolio-mgmt` Phase 5** — market-exit protocol
   activated. Timeline estimate (typically 6-18 months; jurisdiction-
   dependent).
2. **LOAD-BEARING escalations:**
   - **canopy `employment-law-multi-jurisdiction`** — WARN Act equivalent
     per jurisdiction + works-council consultation + statutory severance
     + protected-class + collective-redundancy timelines
   - **hire `workforce-planning`** (P&C Lead) — redundancy planning +
     severance modeling
   - **operator + local employment counsel per jurisdiction** — LOAD-BEARING
     (canopy Principle 2)
3. **canopy `entity-setup-by-jurisdiction` Phase 5** — dissolution-planning
   (previously scoped at entry); activate dissolution timeline
4. **canopy `tax-registration`** — final tax filings + tax-final-obligations
   scoping with tax counsel
5. **canopy `data-residency-mapping`** — data-retention-post-dissolution
   requirements per jurisdiction; coordination with warden + veil for data
   handling
6. **frontier coordination:**
   - `international-banking` — counterparty relationship closure
   - `cross-border-payments` — remaining payment obligations settlement
   - `international-logistics` (if physical) — inventory + customer
     obligations wind-down
   - `fx-treasury-basics` — repatriation coordination
7. **COMMS COORDINATION:**
   - **signal `change-comms`** — internal announcement (LOAD-BEARING —
     employment counsel BEFORE drafting per signal Principle 1)
   - **herald `press-kit` + `media-relations`** — brand-reputation
     coordination for public announcement
   - **beacon `investor-cadence`** — investor comms if material (Reg FD)
   - **beacon `crisis-comms`** — if exit becomes crisis-adjacent (leaked
     news / hostile press / customer backlash)
8. **customer-transition handling** — contracts / refunds / migration
9. **Regulatory close-out** — entity dissolution / tax final / license
   surrenders
10. **Post-exit retrospective** — feed into future exit protocol + future
    market-selection decisions.

**Escalation:** operator + local employment counsel per jurisdiction (LOAD-
BEARING per canopy `employment-law` Principle 2 + `expansion-portfolio-mgmt`
Principle 5). Every divest decision routes through operator + counsel BEFORE
external commitments.

### Pattern D — Regulatory Event (existing market)

**Trigger:** regulatory change in existing market (new employment law / new
tax regime / data-protection law update / trade regime shift / sanctions
program).

**compass sequences:**

1. **canopy** — appropriate skill scoped for regulatory-change impact
2. **Impact assessment:** does this trigger portfolio-rebalancing (Pattern B)?
   Does this trigger market exit (Pattern C)?
3. Coordinate with frontier if cross-border-ops implications; lingua if
   localization implications (e.g., new privacy-notice requirements).
4. Coordinate with hire (P&C) if workforce implications; Comms & PR if
   customer / investor / internal comms implications.
5. Report-out to operator + board (Governance) if governance-approval needed.

### Pattern E — Cross-Border-Ops Setup for Existing Market (no new market)

**Trigger:** existing market operations need cross-border-ops enhancement
(new banking counterparty / new payment corridor / new logistics route).

**compass sequences (lighter — no new market selection):**

1. **frontier** — appropriate skill scoped for the operational need
2. **canopy** — tax + data-residency coordination if applicable
3. **lingua** — currency-format / product-locale updates if applicable
4. Report-out to CFO + operator.

### Pattern F — Localization-Only (existing market, new content)

**Trigger:** existing market needs new content localized (new product feature
+ campaign + T&Cs update).

**compass sequences (lightest — lingua-focused):**

1. **lingua** — appropriate skill(s) scoped for content type
2. **canopy `legal-localization` coordination** if legal-content dimension
3. **cultural-adaptation gate** across content
4. Report-out to operator + product / brand as applicable.

## Cross-Global Expansion Coordination Rules

Enforced by compass at coordination surfaces:

- **Ghemawat-flavored disciplines** applied at coordination — distance-matters
  posture + evidence-grounded + semi-globalization + regional-over-global +
  skeptical-of-consulting-hype
- **All quantitative claims cite public institutional source** (Big-4 / Baker
  McKenzie / IAPP / EDPB / BIS / SWIFT / FATF / ICC / WCO / academic)
- **Every legal-adjacent decision routes through counsel** per Universal
  Principle 5 — 34 LOAD-BEARING REFUSALS across the department enforce this
- **Dissolution-planning-at-setup** (Ghemawat + canopy discipline) — every
  entity setup includes exit-planning memo attached
- **Aggregate-only at publication surface** across all 4 agents
- **Individual crisis HARD BOUNDARY** across all 4 agents

## Cross-Department Coordination

Global Expansion routinely coordinates with:

- **Executive Office** (marcus / vista / echo) — strategy + fundraising
- **P&C** (hire / maslow / grove / merit) — classification EXECUTION +
  workforce planning + cross-cultural team building + protected-class in
  perf-mgmt
- **Comms & PR** (herald / signal / beacon) — press + internal + investor
  comms for expansion events
- **Cybersecurity** (warden / veil / bastion) — technical GRC + data-
  protection implementation
- **Brand Studio** (spark / atlas / lena / weave / muse / pixel) — brand
  voice + creative direction
- **Engineering** (dev / spec / ux / loom / etc.) — code-level i18n + product
  decisions
- **Governance** (board / precedent / sentinel) — governance approval + prior-
  decision precedent tracking
- **operator + relevant counsel** — LOAD-BEARING per Universal Principle 5

## Not Sequenced Here (out of scope)

- **Strategic-vision-level venture-portfolio decisions** — marcus / vista
- **Fundraising to fund expansion** — echo
- **Investment / trading strategy** — operator + CFO (different domain)
- **Financial-portfolio management (stocks / ETFs)** — operator + CFO
- **Direct legal execution** (contract drafting / regulator filings) —
  operator + counsel
- **Direct operational execution** (FX trades / payments / customs / freight /
  hiring / classifying / etc.) — operator + relevant execution team
- **Individual mental-health crisis** — HARD BOUNDARY per Universal
  Principle 3

## Audit Notes

- **Workflow patterns audited:** 2026-07-31 (all 4 agents LIVE).
- **Next audit trigger:** new sequencing pattern identified; any agent skill
  added / removed; any coordination-surface change; any regulatory landscape
  shift materially affecting patterns.
