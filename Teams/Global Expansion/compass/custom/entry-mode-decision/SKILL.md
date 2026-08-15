<!--
Custom skill — built from scratch, synthesized from named published sources
(Root 1994 + Ghemawat 2007 + Hill international-business textbook + Anderson &
Gatignon 1986 + McKinsey/BCG institutional). Body follows §11 required structure
+ §14.2 exact-heading compiler contract.

Reclassification note (2026-07-31): §4.1 marketplace search found
skilld.dev/jesseotremblay/planning-market-entry (bundles selection + mode +
partnership) — same scope-mismatch pattern as skill 1. Publisher credibility
unknown. §4.6 reclass to custom Route D — Root 1994 is the canonical practitioner
text on entry-mode selection; no marketplace skill anchored on it.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Ghemawat 2007 corpus grounds compass all 4 skills (single
source multi-skill within compass). Extract once, use across compass.
-->
---
name: entry-mode-decision
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Root, Franklin R. (1994). Entry Strategies for International Markets (Revised & Expanded Edition). Lexington Books / Jossey-Bass. ISBN 978-0787941291. Canonical practitioner text on entry-mode selection per §8.9. Root's 7-mode framework + control/risk/return trade-off matrix."
  - "Ghemawat, Pankaj (2007). Redefining Global Strategy. HBR Press. ISBN 978-1591398660. CAGE + AAA (Adaptation / Aggregation / Arbitrage) framework informs entry-mode choice per candidate market. §8.9 extract-once-use-twice with market-selection-framework (compass sibling)."
  - "Hill, Charles W. L. (multiple editions). Global Business Today. McGraw-Hill. Canonical international-business textbook. Hill's 6-mode framework with control/risk/return trade-offs; widely-adopted MBA reference."
  - "Anderson, Erin & Gatignon, Hubert (1986). 'Modes of Foreign Entry: A Transaction Cost Analysis and Propositions.' Journal of International Business Studies 17(3): 1-26. Named academic. Transaction-cost-economics grounding for mode selection under asset-specificity + uncertainty."
  - "McKinsey / BCG institutional entry-mode matrices. Practitioner decision matrices, publicly available. Umbrex hosts a curated version of the McKinsey framework at umbrex.com."
fulfills_catalog_entry: entry-mode-decision (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found skilld.dev/jesseotremblay/planning-market-entry (bundles selection + mode + partnership); scope mismatch → §4.6 reclass. Publisher credibility unknown vs Root 1994 canonical anchor."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 canonical sources + institutional matrices — well above §8.0 two-book minimum for Route D."
assigned_agent: compass (Global Expansion / Market Selection & Entry — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Entry-mode decision framework for chosen market — Root 7-mode framework (exporting / licensing / franchising / contract manufacturing / distributor / JV / greenfield / acquisition) + Hill control-risk-return trade-off + Anderson & Gatignon TCE grounding + Ghemawat CAGE/LOF-mode compatibility. Matches mode to strategic-control needs + investment appetite + speed-to-market + CAGE profile of chosen market. Trigger on "entry mode for [country]", "greenfield vs acquisition for [market]", "JV vs licensing for [market]", "distributor vs direct sales in [country]", "how to enter [country]", or "entry-mode decision after market-selection".
triggers:
  - entry mode for
  - greenfield vs acquisition for
  - JV vs licensing for
  - distributor vs direct sales in
  - how to enter
  - entry-mode decision after market-selection
  - franchising vs licensing for
  - acquisition vs greenfield in
  - Root 7-mode framework
---

# Entry-Mode Decision

## Introduction

This skill packages the entry-mode decision discipline for compass — AFTER
`market-selection-framework` (compass sibling) produces the chosen country/
market. Root's 7-mode framework + Hill's control/risk/return trade-off matrix +
Anderson & Gatignon's transaction-cost-economics grounding + Ghemawat's CAGE/LOF
profile mapped to mode-compatibility.

**Scope distinction:** this is MODE SELECTION for an already-chosen market —
which mode to enter with, given the market's CAGE profile + strategic-control
needs + investment appetite + speed-to-market constraints. Distinct from
`market-selection-framework` (which chose the country), `go-to-market-adaptation`
(which handles product/pricing/positioning once mode chosen), and
`expansion-portfolio-mgmt` (which handles multi-market rebalancing).

Reclassified from a marketplace scope-mismatch per §4.6.

Custom Route D per §8.2 — cited rubric grounded in Root's canonical corpus.

## Purpose

Prevents six failure modes that show up when entry-mode decision is unstructured:

1. **Default-to-greenfield / default-to-acquisition.** Firms with a house
   preference apply it to every market without matching mode to CAGE/LOF
   profile. Root's insight: high-distance / high-LOF markets often need
   lower-commitment modes first (distributor / licensing) to reduce foreignness
   cost before higher-commitment moves.
2. **Control blindness.** Underestimating how much strategic control the
   business needs (brand / IP / customer relationship / pricing / operations)
   → choosing a mode that cedes required control (e.g., distributor when
   direct customer relationships are strategic) → downstream renegotiation
   costs.
3. **Speed-to-market blindness.** Ignoring the fastest-mode-per-market — for
   time-sensitive expansion (competitive-response, first-mover-critical
   window), exporting / distributor beats greenfield by 12-24 months but
   costs strategic control.
4. **Acquisition without DD readiness.** Recommending acquisition without
   confirming beacon `data-room-discipline` + DD-readiness posture on both
   sides = predictable post-close chaos. Coordination with beacon at
   Phase 5 mandatory.
5. **JV without partner-fit assessment.** JV failure rate ~50-70% (per
   McKinsey / BCG published research); most failures traceable to inadequate
   partner-fit assessment + poorly-scoped JV governance structure at signing.
6. **Ignoring CAGE/LOF profile from skill 1.** market-selection-framework
   produced CAGE + LOF scores for a reason — mode selection that ignores them
   discards Phase 1's analytical foundation. Ghemawat pattern: high-distance
   markets → lower-commitment modes first.

compass uses this skill as Phase 2 of any expansion decision (Phase 1 =
market-selection-framework). Coordinates downstream with `go-to-market-adaptation`
(Phase 3), canopy (entity setup + tax reg + employment law), beacon
(data-room-discipline for M&A DD if acquisition), and hire (payroll-and-eor if
greenfield / acquisition).

## When to Use

Trigger on:

- "Entry mode for [country]" / "how to enter [country]" / "entry strategy for [market]"
- "Greenfield vs acquisition for [market]" / "JV vs licensing for [market]" /
  "distributor vs direct sales in [country]"
- "Franchising vs licensing for [market]" / "acquisition vs greenfield in [market]"
- "Root 7-mode framework" / "entry-mode decision matrix"
- Handoff from `market-selection-framework` (compass sibling Phase 6) once
  candidate #1 approved

Do NOT use for:

- **Country/market selection** → `market-selection-framework` (compass sibling)
- **Product / marketing adaptation per market** → `go-to-market-adaptation` (compass sibling)
- **Multi-market portfolio rebalancing** → `expansion-portfolio-mgmt` (compass sibling)
- **Entity setup / tax registration / employment-law in chosen country** → canopy
- **M&A contract drafting / NDA / disclosure schedule** → operator + M&A counsel
- **Data-room population for DD** → beacon `data-room-discipline`
- **Localization work per market** → lingua
- **Cross-border payments / FX / banking** → frontier
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

The entry-mode decision workflow combines Root's 7-mode taxonomy + Hill's
trade-off matrix + Anderson & Gatignon TCE + Ghemawat CAGE/LOF mapping:

```
ROOT'S 7-MODE FRAMEWORK (Root 1994) + Hill extensions

  MODE                        CONTROL       RISK      RETURN     SPEED    RESOURCE
                                                                          COMMITMENT
  1. Indirect exporting       Very Low      Very Low  Very Low   Fastest  Very Low
     (through export agent)
  2. Direct exporting         Low           Low       Low        Fast     Low
     (direct to buyers)
  3. Licensing                Low           Low       Low-Med    Fast     Very Low
     (grant IP + royalty)
  4. Franchising              Med           Med       Med        Med      Low-Med
     (franchisor system +
      franchisee capital)
  5. Contract manufacturing   Med           Med       Med        Med      Low-Med
     (outsource production)
  6. Distributor / Sales Rep  Med           Low-Med   Med        Fast     Low
     (local distribution)
  7. Joint Venture (JV)       Med-High      Med-High  Med-High   Med      Med-High
     (equity partnership)
  8. Greenfield subsidiary    Highest       Highest   Highest    Slowest  Very High
     (build from scratch)
  9. Acquisition              High          High      High       Med-Fast Very High
     (buy existing local)

  (Root counted 7 primary modes; Hill's textbook + practitioner corpus expand
  to 8-9 modes including exporting subvariants + contract manufacturing +
  greenfield distinct from acquisition.)


HILL CONTROL / RISK / RETURN TRADE-OFF

  Low-control modes (exporting, licensing, distributor):
    + Fast, cheap, low-risk
    - Cede strategic control (brand, IP, customer relationships, pricing)
    - Difficult to reverse or reclaim once ceded

  High-control modes (greenfield, acquisition):
    + Full strategic control (brand, IP, customer, operations)
    + Full profit capture
    - Highest investment, longest time-to-first-revenue
    - Full LOF exposure

  Mid-control modes (JV, franchising, contract manufacturing):
    + Shared risk + local expertise
    - Governance complexity, partner-alignment overhead
    - JV failure rate 50-70% per McKinsey/BCG research


ANDERSON & GATIGNON TCE (1986)

  Transaction-cost economics: mode choice depends on

  - Asset specificity (specialized assets → higher-control modes to prevent hold-up)
  - Uncertainty (external / behavioral — higher uncertainty → prefer more
    flexible / reversible modes)
  - Frequency (frequent transactions → internal (greenfield/acquisition) beats
    market-based (licensing/distributor))

  Practical implication: proprietary tech / brand / process → higher-control
  mode. Commoditized offering → lower-commitment mode acceptable.


GHEMAWAT CAGE/LOF → MODE COMPATIBILITY

  High CAGE distance + high LOF:
    → Lower-commitment first (distributor / licensing) to reduce LOF
    → Escalate commitment once LOF understood + reduced
    → Direct greenfield or acquisition into high-distance market = high failure

  Low CAGE distance + low LOF:
    → Higher-commitment modes viable (greenfield / acquisition) with acceptable risk
    → Direct entry can capture full value

  Medium CAGE distance:
    → JV with local partner often optimal — partner provides local knowledge
      + reduces LOF; equity structure captures value


ENTRY-MODE DECISION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: STRATEGIC-CONTROL NEEDS ASSESSMENT                (per business)
  Phase 2: INVESTMENT-APPETITE + SPEED CONSTRAINTS            (per operator)
  Phase 3: CAGE/LOF PROFILE MAPPING                           (from skill 1)
  Phase 4: MODE-DECISION MATRIX                               (7-9 modes × 5-6 criteria)
  Phase 5: MODE-SPECIFIC READINESS CHECK                      (per shortlisted mode)
  Phase 6: DECISION MEMO + CROSS-AGENT HANDOFFS
```

## Instructions

### Phase 1 — Strategic-control needs assessment

Assess how much control the business needs in the new market on each dimension:

- **Brand control** — is brand consistency strategic? (usually YES for
  consumer-facing; NEGOTIABLE for B2B commodity)
- **IP control** — is proprietary tech / process / IP core to competitive
  advantage? (drives higher-control modes per Anderson & Gatignon TCE)
- **Customer relationship control** — is direct customer relationship
  strategic? (drives away from distributor / licensing toward direct sales)
- **Pricing control** — is pricing-power protection strategic? (drives away
  from franchising / distributor)
- **Operational control** — is operating consistency strategic? (drives greenfield
  / acquisition over franchising / contract manufacturing)

Score each dimension high/med/low required control. Aggregate = strategic-
control profile.

### Phase 2 — Investment-appetite + speed constraints

- **Investment appetite** — what's the operator + CFO-approved investment budget
  for this market? Low-budget → exporting / licensing / distributor viable.
  High-budget → greenfield / acquisition viable.
- **Speed-to-market** — is there a competitive-response window, first-mover-
  critical timing, or regulatory-clock forcing a specific timeline? Fast-timing
  → exporting / distributor / acquisition. Slow-timing OK → greenfield.
- **Reversibility appetite** — can the operator tolerate mode-lock-in
  (greenfield / acquisition = high lock-in; exporting / distributor =
  reversible)?

### Phase 3 — CAGE/LOF profile mapping (from skill 1)

Pull CAGE + LOF scores from `market-selection-framework` output for this market.
Apply Ghemawat CAGE/LOF → mode-compatibility rule:

- **High CAGE + high LOF** → lower-commitment mode first (distributor /
  licensing); escalate once LOF understood
- **Low CAGE + low LOF** → higher-commitment modes viable
- **Medium CAGE + medium LOF** → JV often optimal

**Silent override discipline:** if this skill's mode recommendation ignores
the CAGE/LOF profile from skill 1, that's a §Principles violation. Document
the reason explicitly if the profile is being overridden (e.g., IP-control
requirement overrides low-commitment preference).

### Phase 4 — Mode-decision matrix

Build a decision matrix — rows = 7-9 modes; columns = criteria (control / risk /
return / speed / resource commitment / CAGE-LOF fit + business-specific criteria
like IP-protection / brand-consistency). Score each mode 1-5 per criterion.

Weight criteria by strategic-control needs (Phase 1) + investment-appetite
(Phase 2). Weighted mode scores = shortlist top 2-3 modes.

### Phase 5 — Mode-specific readiness check

Per shortlisted mode, verify readiness before recommendation:

- **Exporting / Licensing / Distributor:** local partner shortlist available?
  Contract templates ready (operator + counsel)? IP protection in candidate
  country (canopy `entity-setup-by-jurisdiction` + IP counsel)?
- **Franchising / Contract manufacturing:** franchisee / manufacturer shortlist
  + operating-manual system ready? Franchise-disclosure-document / contract-
  manufacturing agreement templates ready?
- **JV:** partner shortlist + partner-fit assessment complete (cultural fit +
  strategic-alignment + governance-structure agreement)? JV governance-structure
  scoped with M&A / JV counsel? JV failure rate 50-70% — partner-fit assessment
  is LOAD-BEARING.
- **Greenfield:** entity-setup scoping ready (canopy `entity-setup-by-jurisdiction`)?
  Local hiring plan (hire `payroll-and-eor` + `workforce-planning`)? Local
  operations lead identified? Time-to-first-revenue realistic (usually 12-24
  months)?
- **Acquisition:** DD-readiness on both sides — target-side data room accessible
  (beacon `data-room-discipline`); buy-side DD team assembled; valuation
  framework in place; M&A counsel engaged. LOAD-BEARING: acquisition
  recommendation without DD-readiness confirmation is a §Principles violation.

### Phase 6 — Decision memo + cross-agent handoffs

- **Decision memo** (2-4 pages) with: CAGE/LOF profile from skill 1 +
  strategic-control profile + investment/speed constraints + mode-decision
  matrix + shortlisted mode + readiness check + explicit recommendation +
  next-step handoffs
- **Handoffs**:
  - `go-to-market-adaptation` (compass sibling — Phase 3) for chosen mode
  - canopy `entity-setup-by-jurisdiction` + `tax-registration` (parallel with
    Phase 3 work)
  - canopy `employment-law-multi-jurisdiction` if greenfield / acquisition /
    JV
  - beacon `data-room-discipline` if acquisition (DD support)
  - hire `payroll-and-eor` if greenfield / acquisition / JV
  - lingua `product-localization` + `cultural-adaptation` if mode requires
    localized product
  - frontier `fx-treasury-basics` + `international-banking` for cross-border
    operational setup
  - signal `change-comms` for internal announcement of mode decision
  - beacon `investor-cadence` if mode decision is material to investors

## Output Format

Each invocation produces one or more of:

- **Strategic-control profile** — brand / IP / customer / pricing / operational
  control needs assessed
- **Investment + speed constraints memo** — operator + CFO-approved budget +
  time constraints
- **CAGE/LOF profile mapping** — pulled from skill 1; mode-compatibility
  recommendation per Ghemawat rule
- **Mode-decision matrix** — 7-9 modes × 5-6 criteria with weighted scores
- **Mode-shortlist + readiness check** — top 2-3 modes with per-mode readiness
  verification
- **Decision memo** — 2-4 pages full framework output + explicit recommendation
  + next-step handoffs
- **Handoff briefs** to compass siblings + canopy + beacon + hire + lingua +
  frontier + signal (as applicable)

## Principles

1. **Never default-to-greenfield / default-to-acquisition** without matching
   mode to CAGE/LOF profile + strategic-control needs. House-preference-
   without-analysis = §Principles violation.
2. **CAGE/LOF profile from skill 1 must inform mode choice.** Override with
   explicit documented reason if profile is overridden (e.g., IP-protection
   requirement).
3. **Strategic-control needs assessed on all 5 dimensions.** Skipping a
   dimension = predictable-failure mode.
4. **Anderson & Gatignon TCE applied for asset-specificity + uncertainty.**
   Proprietary tech / brand / process → higher-control mode.
5. **Acquisition recommendation LOAD-BEARING blocked without DD readiness
   confirmation.** Both target-side data-room accessibility (beacon
   `data-room-discipline`) + buy-side DD team assembly + valuation framework
   + M&A counsel engagement required.
6. **JV recommendation LOAD-BEARING blocked without partner-fit assessment +
   counsel-scoped governance structure.** JV failure rate 50-70% —
   partner-fit is non-negotiable.
7. **No fabrication** — cited sources for JV failure rates (McKinsey / BCG),
   time-to-first-revenue estimates (Root / Hill + industry benchmarks),
   readiness-check criteria (Anderson & Gatignon TCE). Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **Legal fence** — Universal Principle 5. M&A / JV / partnership contracts
    scoped by counsel BEFORE any counterparty communication. Sanctioned /
    legal-restriction candidates blocked upstream in skill 1.
11. **§0.6 flag.** Root 1994 + Ghemawat 2007 + Hill textbook + Anderson &
    Gatignon 1986 are Tier B. Downgrade to Tier A when Root 1994 + Ghemawat
    2007 + Hill are placed and a `Shared OS/logical/entry_mode_decision.md`
    Route-D asset is built per §8.9.

## Fallback

- **Strategic-control needs unclear** for a new business type or venture.
  Escalate to marcus / vista (Executive Office) + operator for strategic-control
  articulation. Do NOT proceed to mode decision without this input.
- **Investment budget or timing constraints uncertain.** Escalate to operator +
  CFO for explicit budget + timing. Do NOT invent a budget.
- **CAGE/LOF profile from skill 1 unavailable** (skill 1 not run for this
  market). Return to skill 1 first. Do NOT decide mode without market-selection
  foundation.
- **Acquisition recommendation candidate.** BLOCK recommendation until DD-
  readiness confirmed on both sides. Coordinate with beacon
  `data-room-discipline` + operator + M&A counsel.
- **JV recommendation candidate.** BLOCK recommendation until partner-fit
  assessment + governance-structure scoped with M&A / JV counsel. Provide
  partner-fit-assessment framework as intermediate output, not JV
  recommendation.
- **IP-protection unavailable in candidate country** (weak patent enforcement,
  history of IP theft) for proprietary-tech business. Recommend against
  higher-commitment modes; alternative: contract-manufacturing with strict
  IP-protection provisions + local IP counsel, OR distributor with IP retained
  at HQ.
- **Competitive urgency** overriding CAGE/LOF profile recommendation. Document
  the override + explicit acknowledgment of elevated failure risk. Escalate to
  operator + marcus / vista for override approval.
- **Cross-venture entry-mode decision** (multiple ventures under one holding
  entering same market with different modes). Coordinate with marcus / vista
  for portfolio-level mode strategy that upstream this skill.
- **Individual crisis signal during entry-mode conversation.** STOP. Route per
  Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `market-selection-framework` (custom, compass — sibling) | CAGE/LOF profile input for chosen market | Upstream — this skill uses skill 1's output |
| `go-to-market-adaptation` (custom, compass — sibling) | Product / pricing / positioning adaptation for chosen mode | Downstream Phase 6 handoff |
| `expansion-portfolio-mgmt` (custom, compass — sibling) | Multi-market rebalancing if mode choice affects portfolio | Downstream |
| `entity-setup-by-jurisdiction` (custom, canopy) | Legal entity setup for greenfield / acquisition / JV | Downstream — parallel with Phase 3 work |
| `tax-registration` (custom, canopy) | Tax registration in chosen country | Downstream |
| `employment-law-multi-jurisdiction` (custom, canopy) | Employment-law scoping if greenfield / acquisition / JV | Downstream |
| `data-room-discipline` (custom, beacon — Comms & PR) | DD-support if acquisition — LOAD-BEARING readiness gate | Coordination — Principle 5 |
| `payroll-and-eor` (custom, hire — P&C Lead) | International hiring if greenfield / acquisition / JV | Cross-department |
| `product-localization` + `cultural-adaptation` (custom, lingua) | Localization if mode requires localized product | Cross-agent |
| `fx-treasury-basics` + `international-banking` + `cross-border-payments` (custom, frontier) | Cross-border operations setup | Cross-agent |
| `change-comms` (custom, signal — Comms & PR) | Internal announcement of mode decision | Cross-department |
| `investor-cadence` (custom, beacon — Comms & PR) | Investor comms if mode decision material — Reg FD fence | Cross-department escalation |
| marcus / vista (Executive Office) | Strategic-control articulation + override approval + cross-venture mode strategy | Upstream escalation |
| Operator + M&A / JV / partnership counsel | Contract scoping BEFORE counterparty comms | Escalation — LOAD-BEARING legal fence Principle 10 |
| Operator + IP counsel | IP-protection in candidate country; higher-control mode blocking if IP-protection weak | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal during entry-mode conversation — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every entry-mode artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Root, Franklin R. — Entry Strategies for International Markets (book page)](https://www.wiley.com/en-us/Entry+Strategies+for+International+Markets%2C+Revised+and+Expanded-p-9780787941291)
- [Ghemawat, Pankaj — Redefining Global Strategy (HBR Press book page)](https://store.hbr.org/product/redefining-global-strategy-crossing-borders-in-a-world-where-differences-still-matter/9781422172025)
- [Hill, Charles W. L. — Global Business Today (McGraw-Hill book page)](https://www.mheducation.com/highered/product/global-business-today-hill-hult/M9781260088373.html)
- [Anderson & Gatignon — Modes of Foreign Entry (JIBS 1986)](https://link.springer.com/article/10.1057/palgrave.jibs.8490432)
- [Umbrex — Market Entry Mode Choice Framework (McKinsey-adjacent)](https://umbrex.com/resources/frameworks/strategy-frameworks/market-entry-mode-choice-framework/)
- [Umbrex — Market Entry Mode Matrix](https://umbrex.com/resources/frameworks/marketing-frameworks/market-entry-mode-matrix/)
