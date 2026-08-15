<!--
Custom skill — built from scratch, synthesized from named published sources
(PwC Doing Business In series + Deloitte International Tax and Business Guide +
EY Worldwide Guides + Baker McKenzie Global Guide to Doing Business + World Bank
Doing Business archive + Business Ready). Body follows §11 required structure +
§14.2 exact-heading compiler contract.

Reclassification note (2026-07-31): §4.1 marketplace search found anthropics/
claude-for-legal `corporate-legal:entity-compliance` — scope is ONGOING compliance
tracking (register with deadlines), not entity-SETUP decision. Complementary scope.
Other mcpmarket hits are single-country or privacy-policy-scoped. §4.6 reclass to
custom Route D. Anthropic entity-compliance skill noted as candidate for future
canopy expansion if setup/tracking split becomes needed.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Baker McKenzie corpus grounds this skill + canopy sibling
`employment-law-multi-jurisdiction` + lingua `legal-localization`. Extract once,
use 3× across departments.
-->
---
name: entity-setup-by-jurisdiction
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "PwC — 'Doing Business In' country guides. Per-country institutional guides covering entity types + tax + labor + regulatory per jurisdiction. Publicly available at pwc.com."
  - "Deloitte — 'International Tax and Business Guide' series. Per-country institutional guides. Publicly available at deloitte.com."
  - "EY — 'Worldwide Corporate Tax Guide' + 'Worldwide Legal Guide'. Institutional. ey.com."
  - "Baker McKenzie — 'Global Guide to Doing Business'. Institutional. bakermckenzie.com. §8.9 extract-once-use-3× with canopy sibling employment-law-multi-jurisdiction + lingua legal-localization."
  - "World Bank — 'Doing Business' archive (2004-2021, discontinued) + 'Business Ready' (successor project, 2024+). Institutional entity-registration difficulty benchmarks."
fulfills_catalog_entry: entity-setup-by-jurisdiction (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found anthropics/claude-for-legal `corporate-legal:entity-compliance` — scope mismatch (ongoing compliance tracking vs setup decision). Other mcpmarket hits narrower/different scope. §4.6 reclass. Anthropic skill noted as complementary — candidate for future canopy expansion if setup/tracking split becomes needed."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum for Route D."
assigned_agent: canopy (Global Expansion / Multi-jurisdiction Regulatory & Compliance)
portable: true
date_added: 2026-07-31
tier: 3
description: Entity-structure + registration decision framework per jurisdiction — structure-selection matrix (branch / rep-office / subsidiary / LLC-equivalent / partnership) with control / tax / liability / capital-requirement / setup-time trade-offs per jurisdiction. Local-counsel-first discipline (mandatory — canopy scopes counsel-brief, not legal work). Registration operational checklist. Dissolution-planning-at-setup (Ghemawat-inherited exit-planning discipline). Trigger on "entity setup for [country]", "which entity structure in [country]", "incorporate in [country]", "branch vs subsidiary in [country]", "LLC vs GmbH vs SA", "dissolve entity in [country]", or "entity registration checklist for [country]".
triggers:
  - entity setup for
  - which entity structure in
  - incorporate in
  - branch vs subsidiary in
  - LLC vs GmbH vs SA
  - dissolve entity in
  - entity registration checklist for
  - representative office in
  - local-counsel scoping for entity
  - entity-dissolution planning
---

# Entity Setup by Jurisdiction

## Introduction

This skill packages the entity-structure + registration decision discipline
for canopy — invoked once compass has selected a market and (usually) chosen
an entry mode requiring a local entity. Structure-selection matrix per
jurisdiction + local-counsel-first coordination + registration operational
checklist + dissolution-planning at setup.

**Scope distinction:** this is the DECISION about which entity structure in
which jurisdiction + the COORDINATION with local counsel for registration.
canopy does NOT do the legal work itself — local counsel per jurisdiction
does that. canopy scopes the counsel-brief, tracks the registration
milestones, and integrates the outcome with compass + hire + frontier +
warden downstream needs.

Distinct from `tax-registration` (canopy sibling — post-entity tax setup),
`employment-law-multi-jurisdiction` (canopy sibling — employment law for
hiring in the jurisdiction), and `data-residency-mapping` (canopy sibling —
data-protection compliance per jurisdiction).

Reclassified from a marketplace scope-mismatch per §4.6.

Custom Route D per §8.2 — cited rubric grounded in Big-4 + Baker McKenzie
+ World Bank institutional corpus.

## Purpose

Prevents six failure modes that show up when entity setup is unstructured:

1. **Wrong entity structure for use case.** Branch office when subsidiary
   protection needed (branch = parent liable for local obligations;
   subsidiary = limited liability). Representative office when substantial
   commercial activity planned (rep office prohibits substantive commercial
   activity in most jurisdictions — regulatory violation risk).
2. **Setup without local counsel.** Every jurisdiction has quirks: local-
   director requirements (Singapore, Japan, several EU), minimum-capital
   requirements (Germany, several LatAm), notarization requirements (most
   civil-law jurisdictions), bank-account-opening-before-registration
   sequences, work-permit-blocking-registration in some jurisdictions.
   Skipping local counsel = predictable failure mode. **LOAD-BEARING.**
3. **Structure decision without tax counsel joint review.** Entity structure
   drives tax treatment. LLC-equivalent (pass-through in US context, opaque
   in most non-US) vs. corporate (double-tax risk) vs. branch (parent-tax
   exposure) — decision requires joint local-counsel + tax-counsel review.
4. **No dissolution-planning-at-setup.** Ghemawat-inherited discipline: plan
   exit at entry. Per-jurisdiction dissolution complexity varies materially
   (Germany can take 12-18 months; some jurisdictions have punitive
   dissolution taxes; some have works-council-consultation dissolution
   requirements). Skipping dissolution-planning = predictable pain at later
   exit.
5. **Registration-checklist skip.** Notarizations, apostilles, translations,
   bank-account-opening, local-director-appointments, tax-ID-issuance, VAT-
   registration — sequences vary per jurisdiction and skipping one step
   blocks downstream steps.
6. **Individual crisis DURING entity-setup crunch.** Team members under
   setup-timeline pressure + personal distress can coincide. HARD BOUNDARY
   per Universal Principle 3.

canopy uses this skill as Phase 1 of any regulatory-scoping workflow, invoked
immediately when compass hands off a market decision.

## When to Use

Trigger on:

- "Entity setup for [country]" / "incorporate in [country]" / "entity registration checklist for [country]"
- "Which entity structure in [country]" / "branch vs subsidiary in [country]" /
  "LLC vs GmbH vs SA"
- "Representative office in [country]"
- "Dissolve entity in [country]" / "entity-dissolution planning"
- "Local-counsel scoping for entity setup"
- Handoff from compass (Global Expansion Lead) once market + entry-mode decided

Do NOT use for:

- **Country/market selection** → compass `market-selection-framework`
- **Entry-mode decision (greenfield / acquisition / JV / distributor)** →
  compass `entry-mode-decision` (though this skill runs AFTER entry-mode
  decides an entity is needed)
- **Tax registration for the entity** → canopy `tax-registration` (downstream)
- **Employment-law setup for hiring** → canopy `employment-law-multi-
  jurisdiction` (parallel workstream)
- **Data-residency compliance mapping** → canopy `data-residency-mapping`
  (parallel workstream)
- **Actual legal work (contracts / filings / negotiations with regulators)** →
  operator + local counsel per jurisdiction (canopy scopes, does NOT do)
- **M&A DD** → beacon `data-room-discipline` (Comms & PR)
- **Ongoing compliance tracking (register with deadlines)** — candidate for
  future canopy skill from Anthropic `corporate-legal:entity-compliance`;
  not owned here today
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The entity-setup workflow combines structure-selection matrix + local-counsel
scoping + registration checklist + dissolution planning:

```
ENTITY-STRUCTURE COMMON TYPES (varies by jurisdiction)

  BRANCH OFFICE / REPRESENTATIVE OFFICE
    - Branch: extension of parent; parent liable for local obligations;
      simpler setup; tax on branch income to parent jurisdiction (per DTA)
    - Rep office: NO substantive commercial activity permitted in most
      jurisdictions; marketing / liaison only; simplest setup + limited scope

  LIMITED LIABILITY ENTITY (SUBSIDIARY)
    - LLC-equivalent — pass-through tax in US context; opaque in most
      non-US jurisdictions
    - GmbH (Germany), SARL (France), Sp. z o.o. (Poland), Sdn Bhd (Malaysia),
      Pte Ltd (Singapore), Pty Ltd (Australia / South Africa) — local
      limited-liability entity types
    - Setup complexity + capital requirements vary materially

  CORPORATION (JOINT-STOCK COMPANY)
    - SA (France / Spain / LatAm), AG (Germany / Austria / Switzerland),
      KK (Japan), Ltd (UK), Inc / Corp (US) — corporate entity for
      larger operations
    - Governance requirements (board / annual meeting / audit) vary
    - Higher capital + regulatory burden than LLC-equivalent

  PARTNERSHIP / SPECIAL PURPOSE ENTITIES
    - General Partnership / Limited Partnership / LLP / Special-purpose
      vehicles per jurisdiction
    - Case-specific; local counsel required


STRUCTURE-DECISION CRITERIA (per Big-4 + Baker McKenzie guides)

  CONTROL              full control vs. shared vs. limited local control
  LIABILITY           parent liability vs. limited local liability
  TAX TREATMENT       parent-jurisdiction tax vs. local tax vs. hybrid
                       (with tax counsel + DTA analysis)
  CAPITAL              minimum-capital requirements per structure per jurisdiction
                       (e.g., GmbH €25k minimum, SA €37k minimum for France)
  SETUP TIME           days to months depending on structure + jurisdiction
  LOCAL-DIRECTOR       Singapore requires local resident director; Japan
   REQUIREMENT          requires representative director; several EU require
                        local resident on board
  DISSOLUTION          simplicity of later exit — some jurisdictions have
   COMPLEXITY           12-18 month dissolution timelines with works-council
                        consultation requirements


REGISTRATION OPERATIONAL CHECKLIST (per jurisdiction — varies)

  Common elements (customized per jurisdiction):
    - Entity name reservation (may require pre-clearance)
    - Articles of association / bylaws drafting (local counsel)
    - Founder documents (passport / apostilled)
    - Notarization of founder resolutions (civil-law jurisdictions)
    - Local-director appointment (per requirement)
    - Registered office / local address establishment
    - Registration filing with commercial registry
    - Tax-ID issuance (coordinate with tax-registration sibling)
    - VAT registration (if applicable)
    - Bank-account opening (some jurisdictions require pre-registration
      bank verification)
    - Employer registration (coordinate with employment-law sibling if hiring)
    - Data-protection registration (some jurisdictions — coordinate with
      data-residency-mapping sibling)
    - Industry-specific licenses (financial / healthcare / regulated
      industries)


ENTITY-SETUP OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: JURISDICTION SCOPE CONFIRMATION           (which country + sub-jurisdiction)
  Phase 2: ENTITY-STRUCTURE DECISION                  (matrix per jurisdiction)
  Phase 3: LOCAL-COUNSEL SCOPING                      (LOAD-BEARING — mandatory)
  Phase 4: REGISTRATION OPERATIONAL CHECKLIST          (per jurisdiction)
  Phase 5: DISSOLUTION-PLANNING-AT-SETUP              (per jurisdiction)
```

## Instructions

### Phase 1 — Jurisdiction scope confirmation

- **Country confirmed** from compass `entry-mode-decision` output.
- **Sub-jurisdiction confirmed** where applicable — US state (Delaware /
  California / New York — different tax + governance treatment); Canadian
  province; Swiss canton (Zug / Zurich — different tax + regulatory);
  Chinese city (Shanghai FTZ / Shenzhen); UAE emirate (Dubai mainland /
  DIFC / ADGM free zones).
- **Cross-jurisdiction complexity check** — if entity will operate across
  multiple sub-jurisdictions, additional registration burden per each.

### Phase 2 — Entity-structure decision

Build decision matrix per Big-4 + Baker McKenzie + jurisdiction-specific
guides:

- **Rows:** available entity types in this jurisdiction (usually 4-8 options)
- **Columns:** Control / Liability / Tax Treatment / Capital / Setup Time /
  Local-Director Requirement / Dissolution Complexity + business-specific
  criteria (Regulated-Industry License Requirement / Foreign-Ownership
  Restrictions / Employee-Related Requirements)

Score each option per criterion. Weight per operator + tax-counsel priorities.
Shortlist top 2-3 structures.

**Silent-default discipline:** never default to a structure without matrix.
Some orgs default to "subsidiary everywhere" or "branch everywhere" — neither
is correct across all jurisdictions.

### Phase 3 — Local-counsel scoping (LOAD-BEARING — mandatory)

**Every entity setup routes through local counsel.** canopy scopes the
counsel-brief; local counsel does the actual legal work.

Counsel-brief template:

- Jurisdiction + sub-jurisdiction confirmed (Phase 1)
- Shortlisted 2-3 structures (Phase 2)
- Business scope + expected activities in jurisdiction
- Expected headcount + operations timeline
- Tax preferences (with tax counsel involvement — parallel workstream)
- Dissolution-planning considerations (Phase 5)
- Timeline expectations
- Budget authorization (from operator + CFO)

**No entity setup proceeds without local counsel engagement.** Deviation =
LOAD-BEARING REFUSAL.

Cost note: local-counsel entity-setup fees vary widely — from $1-3k for
Delaware LLC to $15-30k+ for complex civil-law jurisdictions (Germany
GmbH, France SA) with notarization + capital-verification requirements +
translations. Budget authorization from operator + CFO before counsel
engagement.

### Phase 4 — Registration operational checklist

Per jurisdiction (customized by local counsel), track registration checklist:

- Entity name reservation
- Articles / bylaws drafting + notarization (civil-law)
- Founder documents + apostilles + translations
- Local-director appointment (per jurisdiction requirement)
- Registered office / local address
- Registration filing with commercial registry
- Tax-ID issuance (handoff to `tax-registration` sibling)
- VAT registration if applicable
- Bank-account opening (may block or be blocked by registration)
- Employer registration if hiring (handoff to `employment-law-multi-jurisdiction`
  + hire's `payroll-and-eor`)
- Data-protection registration if applicable (handoff to `data-residency-mapping`)
- Industry-specific licenses

Track per-milestone status + dependencies + blockers. Report weekly to
operator until registration complete.

### Phase 5 — Dissolution-planning-at-setup

**Plan exit at entry.** Ghemawat-inherited discipline (from compass): every
market has an exit; every entity has a dissolution.

Per jurisdiction, document at setup time:

- **Dissolution timeline expected** — some jurisdictions 3-6 months clean;
  Germany 12-18 months minimum; some LatAm 24+ months
- **Dissolution costs expected** — some jurisdictions have punitive taxes
  on dissolution (exit tax on retained earnings, capital-gains at
  liquidation)
- **Employee-consultation requirements** — Germany works council; France
  social plan; UK collective consultation for ≥20 redundancies (30-45 day
  minimums)
- **Data-retention requirements post-dissolution** — many jurisdictions
  require 7-10 year records retention after dissolution
- **Regulatory-notification requirements** — sector regulators (financial /
  healthcare / telecom) require dissolution notification with wind-down
  plan

Attach dissolution-planning memo to setup file. Feeds into `expansion-portfolio-
mgmt` Phase 5 (market-exit protocol) if later needed.

## Output Format

Each invocation produces one or more of:

- **Jurisdiction scope confirmation memo** — country + sub-jurisdiction
  confirmation + cross-jurisdiction complexity check
- **Entity-structure decision matrix** — 4-8 options × 7-10 criteria with
  weighted scores + shortlist top 2-3
- **Local-counsel scoping brief** — counsel-brief template completed for
  operator authorization + counsel engagement
- **Registration checklist** — per-jurisdiction customized checklist with
  per-milestone status tracking
- **Dissolution-planning memo** — per-jurisdiction exit-planning attached
  to setup file
- **Cross-agent handoff briefs** — to canopy siblings (tax-registration +
  employment-law-multi-jurisdiction + data-residency-mapping) + hire
  (payroll-and-eor) + frontier (banking) + warden (data-protection posture)

## Principles

1. **Never entity setup without local counsel** — LOAD-BEARING legal fence
   per Universal Principle 5. canopy scopes counsel-brief; local counsel does
   legal work.
2. **Never structure decision without tax-counsel joint review** — LOAD-
   BEARING. Entity structure drives tax treatment; local-counsel + tax-
   counsel joint review mandatory.
3. **Never skip dissolution-planning-at-setup** — Ghemawat-inherited
   discipline from compass. Plan exit at entry.
4. **Registration checklist tracked per-milestone** — no silent-drift
   through registration; weekly status to operator until complete.
5. **Sub-jurisdiction confirmed** — never assume country-level applies to
   sub-jurisdiction (US state / Canadian province / Swiss canton / Chinese
   city / UAE emirate all matter).
6. **Cost + timeline explicit up-front** — operator + CFO budget
   authorization + realistic timeline before counsel engagement. No
   over-optimistic timelines.
7. **No fabrication** — cited institutional sources (PwC / Deloitte / EY /
   Baker McKenzie / World Bank) for jurisdiction-specific facts. Never
   inventing entity-type requirements.
8. **Aggregate-only at publication surface** — Universal Principle 2.
   Individual founder / director / shareholder identifiable data handled
   per counsel + operator + hire (P&C Lead) — never surfaced in canopy
   outputs without sign-off chain.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **Regulated-industry escalation** — financial services / healthcare /
    telecom / age-gated products require industry-specific counsel BEFORE
    entity-structure decision (regulatory constraints may narrow structure
    options).
11. **§0.6 flag.** PwC + Deloitte + EY + Baker McKenzie + World Bank
    institutional sources are Tier B. Downgrade path documented in
    `logical/README.md`.

## Fallback

- **Local counsel unavailable in jurisdiction** (obscure jurisdiction, no
  counsel relationships). Route to operator + international-trade counsel for
  counsel-network referrals. Do NOT proceed with setup without counsel.
- **Tax-counsel unavailable for joint review.** DEFER structure decision.
  Do NOT recommend structure without tax-counsel review — LOAD-BEARING.
- **Timeline pressure to skip counsel scoping.** Decline per Principle 1 —
  LOAD-BEARING. Escalate to operator; principle non-negotiable.
- **Cost overrun risk** if counsel fees exceed budget authorization. Escalate
  to operator + CFO for budget re-authorization. Do NOT proceed beyond
  authorization.
- **Regulated-industry entity setup** (financial / healthcare / telecom /
  age-gated). Route to industry-specific counsel BEFORE structure decision.
  Regulatory constraints may narrow options materially (e.g., banking
  license requires specific entity structure per jurisdiction).
- **Sub-jurisdiction ambiguous** (US state choice / UAE emirate choice /
  Swiss canton choice). Coordinate with operator + tax counsel for sub-
  jurisdiction optimization (Delaware vs Nevada vs Wyoming for US LLC has
  material tax + governance differences).
- **Multi-jurisdiction entity structure required** (holding company + local
  operating subsidiaries structure). Escalate to operator + international
  tax counsel; multi-jurisdiction structures require broader tax-planning
  discussion.
- **Existing entity dissolution planning** — feeds into `expansion-portfolio-
  mgmt` Phase 5 market-exit protocol. Route through compass.
- **Cross-venture entity coordination** — multiple ventures sharing an entity
  or requiring parallel entities in same jurisdiction. Escalate to marcus /
  vista + operator + tax counsel.
- **Individual crisis signal during entity-setup conversation.** STOP. Route
  per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `market-selection-framework` (custom, compass — Global Expansion Lead) | Market selection input | Upstream |
| `entry-mode-decision` (custom, compass — Global Expansion Lead) | Entry-mode decision triggering entity setup | Upstream |
| `expansion-portfolio-mgmt` (custom, compass — Global Expansion Lead) | Dissolution-planning feeds later market-exit protocol | Coordination |
| `tax-registration` (custom, canopy — sibling) | Tax-ID issuance + VAT registration post-entity-setup | Downstream sequencing |
| `employment-law-multi-jurisdiction` (custom, canopy — sibling) | Employer registration if hiring in entity | Parallel workstream |
| `data-residency-mapping` (custom, canopy — sibling) | Data-protection registration if applicable | Parallel workstream |
| `payroll-and-eor` (custom, hire — P&C Lead) | Payroll setup once employer registration complete | Cross-department downstream |
| `international-banking` + `fx-treasury-basics` (custom, frontier) | Bank-account opening (may block or be blocked by registration) | Coordination |
| `data-room-discipline` (custom, beacon — Comms & PR) | Entity documents feed data-room `/01_Corporate/` folder | Coordination |
| `investor-cadence` (custom, beacon — Comms & PR) | Investor comms if entity setup material | Cross-department escalation |
| marcus / vista (Executive Office) | Cross-venture entity coordination | Upstream escalation |
| Operator + local counsel per jurisdiction | LOAD-BEARING for entity setup — mandatory engagement | Escalation — Principle 1 |
| Operator + tax counsel | Structure decision joint review — LOAD-BEARING | Escalation — Principle 2 |
| Operator + industry-specific counsel | Regulated industries (financial / healthcare / telecom / age-gated) | Escalation — Principle 10 |
| Operator + international-trade counsel | Obscure jurisdictions + counsel-network referrals | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every canopy artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [PwC — Doing Business In series](https://www.pwc.com/gx/en/services/tax/publications/worldwide-tax-summaries.html)
- [Deloitte — International Tax and Business Guide (Deloitte Tax@Hand)](https://www.taxathand.com/)
- [EY — Worldwide Corporate Tax Guide](https://www.ey.com/en_gl/tax-guides/worldwide-corporate-tax-guide)
- [EY — Worldwide Legal Guide](https://www.ey.com/en_gl/tax-guides)
- [Baker McKenzie — Global Guide to Doing Business](https://www.bakermckenzie.com/)
- [World Bank — Doing Business archive (2004-2021)](https://archive.doingbusiness.org/)
- [World Bank — Business Ready (successor project)](https://www.worldbank.org/en/businessready)
