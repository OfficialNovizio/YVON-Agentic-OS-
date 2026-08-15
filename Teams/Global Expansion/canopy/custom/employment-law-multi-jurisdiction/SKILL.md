<!--
Custom skill — built from scratch, synthesized from named institutional sources
(Baker McKenzie Global Employer Guide + Littler Mendelson International + ILO
Conventions + DLA Piper Global Guide + Ogletree Deakins). Body follows §11 +
§14.2.

Reclassification note (2026-07-31): §4.1 search found anthropics/claude-for-legal
`employment-legal:hiring-review` — Anthropic-official scope is OFFER-LETTER REVIEW
AT HIRE TIME. Subset of canopy's broader employment-law scoping scope (pre-hire
jurisdiction-scoping + termination + statutory severance + works-council + non-
compete + classification). §4.6 reclass to custom Route D. Anthropic hiring-review
noted as candidate for future canopy expansion when hire-time offer-letter-review
becomes distinct workflow.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Baker McKenzie corpus grounds this skill + canopy sibling
entity-setup-by-jurisdiction + lingua legal-localization (3× across departments).
Extract once, use 3×.
-->
---
name: employment-law-multi-jurisdiction
type: custom
status: built from scratch (reclassified from marketplace subset-scope per §4.6)
sources_referenced:
  - "Baker McKenzie — Global Employer Guide. Institutional. bakermckenzie.com. §8.9 3× use across canopy entity-setup-by-jurisdiction + this skill + lingua legal-localization."
  - "Littler Mendelson — International Employment Law Manual + jurisdiction-specific guides. Institutional. littler.com. Largest employment-law firm globally."
  - "ILO (International Labour Organization) Conventions — core conventions on discrimination (No. 111), forced labor (No. 29 + 105), child labor (No. 138 + 182), freedom of association (No. 87 + 98), equal remuneration (No. 100). Institutional. FREE at ilo.org."
  - "DLA Piper — Global Guide to Employment Law. Institutional. FREE at dlapiperintelligence.com."
  - "Ogletree Deakins — International Employment Law Group publications. Institutional. ogletree.com."
fulfills_catalog_entry: employment-law-multi-jurisdiction (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found anthropics/claude-for-legal employment-legal:hiring-review — subset scope (offer-letter review at hire time only). canopy needs broader pre-hire + termination + severance + works-council + non-compete + classification scoping. §4.6 reclass. Anthropic skill noted for future canopy expansion."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum."
assigned_agent: canopy (Global Expansion / Multi-jurisdiction Regulatory & Compliance)
portable: true
date_added: 2026-07-31
tier: 3
description: Multi-jurisdiction employment-law compliance scoping — WARN-Act-equivalents per jurisdiction + protected-class + works-council-consultation (EU + European Works Councils) + termination-notice + statutory-severance + non-compete-enforceability + employee-vs-contractor classification per jurisdiction. LOAD-BEARING local-employment-counsel discipline. Coordinates with hire's payroll-and-eor (classification execution) + canopy siblings. Trigger on "employment law for hiring in [country]", "termination requirements in [country]", "statutory severance in [country]", "works council consultation for [country]", "non-compete enforceability in [country]", "protected classes in [country]", "employee vs contractor classification in [country]", or "WARN Act equivalent for [country]".
triggers:
  - employment law for hiring in
  - termination requirements in
  - statutory severance in
  - works council consultation for
  - non-compete enforceability in
  - protected classes in
  - employee vs contractor classification in
  - WARN Act equivalent for
  - collective redundancy in
  - probation period for
---

# Employment Law Multi-Jurisdiction

## Introduction

This skill packages multi-jurisdiction employment-law compliance-scoping
discipline for canopy — invoked when the org will hire in a new jurisdiction
OR when a compliance question arises for existing employees in a jurisdiction.
canopy scopes; local employment counsel does the actual legal work.

**Scope distinction:** canopy owns employment-LAW compliance scoping per
jurisdiction (what obligations exist, what discipline is required); hire's
`payroll-and-eor` (P&C Lead) owns W-2/1099/EOR/PEO CLASSIFICATION execution +
payroll ops + benefits brokerage. Both coordinate; scope split clear:
canopy = LAW; hire = EXECUTION.

Custom Route D per §8.2 — cited rubric grounded in Baker McKenzie + Littler
Mendelson + ILO + DLA Piper + Ogletree Deakins institutional corpus.

Reclassified from a marketplace subset-scope per §4.6.

## Purpose

Prevents seven failure modes:

1. **Applying US at-will assumption to non-US jurisdictions.** Almost no other
   jurisdiction has US-style at-will employment. EU requires cause + notice
   + often works-council consultation OR collective-redundancy procedures.
   Australia Fair Work Act protections. Canada common-law reasonable notice.
   APAC contract-based with statutory-severance floors.
2. **Missing WARN Act equivalents.** Every jurisdiction has some form of
   collective-redundancy protection: US WARN (60-day notice, ≥100 employees);
   UK collective consultation (30-45 day minimums for ≥20 redundancies);
   Germany Kündigungsschutzgesetz (dismissal protection + works-council
   consultation); France social plan (plan social) for ≥10 redundancies;
   Netherlands UWV works-council-consultation; EU-wide European Works
   Councils for larger MNEs. Skipping = LOAD-BEARING employment-law
   violation.
3. **Employee-vs-contractor misclassification.** Independent-contractor
   thresholds vary materially — California AB5 ABC test, EU false-self-
   employment case law, UK IR35, Japan "gig-worker" ambiguity, India
   fixed-term-contract restrictions. Misclassification = back-payroll-tax +
   penalties + potential reclassification to employee retroactively.
4. **Protected-class blindness per jurisdiction.** US: race, color, religion,
   sex (including pregnancy, sexual orientation, gender identity per
   Bostock), national origin, age (40+), disability, genetic info + state-
   specific additions. EU: race, ethnicity, religion/belief, disability,
   age, sexual orientation + national additions (Germany includes
   philosophical belief). Different jurisdictions have different protected
   classes; recruiting + performance-management + termination decisions must
   apply the jurisdiction's specific list.
5. **Non-compete enforceability blindness.** US: varies by state (California
   Business & Professions Code §16600 non-compete-void; several other states
   restrict); Germany requires ≥50% salary continuation during non-compete
   period; UK reasonableness test with tight enforcement; EU generally
   restrictive. Applying US-style non-competes internationally often creates
   unenforceable-and-costly documents.
6. **Works-council + union coordination missed.** Germany works councils
   (Betriebsrat) have codetermination rights on hiring / terminations /
   working-conditions changes. France CSE (Comité Social et Economique)
   consultation required for material changes. Netherlands OR (Ondernemingsraad)
   similar. EU-wide European Works Councils for ≥1,000 employees + ≥150 in
   ≥2 EU countries. Ignoring = union/works-council-suit risk.
7. **Individual crisis DURING employment-law-scoping conversation.** Team
   members + affected employees under termination-related stress can coincide
   with personal distress. HARD BOUNDARY per Universal Principle 3.

canopy uses this skill as Phase 3 of any regulatory-scoping workflow — after
entity setup + tax registration, before hiring / operating.

## When to Use

Trigger on:

- "Employment law for hiring in [country]" / "probation period for [country]"
- "Termination requirements in [country]" / "statutory severance in [country]"
- "WARN Act equivalent for [country]" / "collective redundancy in [country]"
- "Works council consultation for [country]"
- "Non-compete enforceability in [country]"
- "Protected classes in [country]"
- "Employee vs contractor classification in [country]"
- Handoff from `entity-setup-by-jurisdiction` (canopy sibling) once entity
  established + hiring planned
- Handoff from `expansion-portfolio-mgmt` (compass sibling) Phase 5 for
  divest-related employment-law scoping

Do NOT use for:

- **Entity formation** → `entity-setup-by-jurisdiction` (canopy sibling)
- **Tax registration including employment-tax** → `tax-registration` (canopy
  sibling) + hire's `payroll-and-eor`
- **W-2 / 1099 / EOR / PEO classification EXECUTION** → hire's `payroll-and-eor`
  (canopy scopes the LAW; hire executes the classification)
- **Payroll ops / benefits brokerage / equity admin** → hire's `payroll-and-
  eor`
- **Individual employee performance / discipline / termination decision
  execution** → merit + hire + operator + local employment counsel
- **Offer-letter-review at hire time** — candidate future canopy skill from
  Anthropic `employment-legal:hiring-review`; not owned here today
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The employment-law-scoping workflow combines jurisdiction-scoping + counsel-
first + coordination with hire:

```
JURISDICTION-VARYING EMPLOYMENT-LAW DIMENSIONS

  AT-WILL vs CAUSE-REQUIRED
    - US: at-will default (limited exceptions per state)
    - Almost every other jurisdiction: cause + notice + procedural
      requirements

  NOTICE PERIODS + STATUTORY SEVERANCE
    - Statutory notice varies widely (30 days to 6+ months)
    - Statutory severance formulas vary (e.g., French indemnité de
      licenciement, German Abfindung, Brazilian FGTS + severance)

  COLLECTIVE REDUNDANCY / WARN EQUIVALENTS
    - US WARN Act: 60-day notice for ≥100 employees at single site
    - UK collective consultation: 30 days (20-99 redundancies) / 45 days
      (≥100)
    - Germany §17 KSchG mass dismissal + works-council consultation
    - France plan social for ≥10 redundancies in 30 days at ≥50-employee
      companies
    - Netherlands UWV consultation
    - EU-wide directive 98/59/EC minimum standards

  PROTECTED CLASSES per jurisdiction (varies)
    - US federal: race, color, religion, sex (Bostock incl. sexual orientation
      + gender identity), national origin, age 40+, disability, genetic info
    - US state additions: many
    - EU: race, ethnicity, religion/belief, disability, age, sexual
      orientation + national additions
    - UK Equality Act 2010: 9 protected characteristics

  WORKS COUNCILS + UNIONS
    - Germany Betriebsrat: codetermination on hiring / terminations /
      working conditions
    - France CSE: consultation for material changes at ≥50-employee
      companies
    - Netherlands OR: similar
    - EU-wide European Works Councils for ≥1,000 employees + ≥150 in ≥2
      EU countries
    - Union recognition per jurisdiction varies

  EMPLOYEE vs CONTRACTOR CLASSIFICATION
    - California AB5 ABC test (2020+)
    - EU false-self-employment case law
    - UK IR35 (off-payroll working)
    - Japan gig-worker ambiguity
    - India fixed-term-contract restrictions

  NON-COMPETE ENFORCEABILITY
    - California BPC §16600: non-competes void
    - Germany: enforceable with ≥50% salary continuation
    - UK reasonableness test: tight enforcement
    - EU generally restrictive
    - US state variation

  PROBATION PERIODS
    - Vary from 0 (many jurisdictions have no formal probation) to
      6 months (some Asian jurisdictions) — determines termination-notice
      obligations during initial period


EMPLOYMENT-LAW SCOPING OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: HIRING-JURISDICTION CONFIRMATION            (which country + sub-jurisdiction)
  Phase 2: EMPLOYMENT-LAW SCOPING PER JURISDICTION      (all 8 dimensions above)
  Phase 3: LOCAL-EMPLOYMENT-COUNSEL SCOPING             (LOAD-BEARING — mandatory)
  Phase 4: HANDOFF TO HIRE `payroll-and-eor`             (classification + payroll execution)
  Phase 5: WORKS-COUNCIL / UNION COORDINATION SCOPING   (if applicable)
```

## Instructions

### Phase 1 — Hiring-jurisdiction confirmation

- **Country confirmed** from compass output + entity-setup output.
- **Sub-jurisdiction confirmed** — US state (each has distinct employment law);
  Canadian province; Swiss canton; Australian state.
- **Remote-worker complexity check** — if remote workers, jurisdiction of
  work (typically employee's home state/country) governs, per Anthropic
  hiring-review pattern + widely-held rule.

### Phase 2 — Employment-law scoping per jurisdiction

For the confirmed jurisdiction, scope all 8 dimensions:

- **At-will vs cause-required** — US only jurisdiction with meaningful at-will
- **Notice periods + statutory severance** — cite jurisdiction-specific
  formula (Baker McKenzie + DLA Piper + Littler + local counsel)
- **Collective-redundancy thresholds + WARN equivalents** — thresholds +
  notice + consultation obligations
- **Protected classes** — cite jurisdiction-specific list
- **Works councils / unions** — applicable? Codetermination scope? EWC
  applicability?
- **Employee vs contractor classification** — jurisdiction-specific test
  (ABC / IR35 / EU case law / local variants)
- **Non-compete enforceability** — void OR restricted OR conditionally
  enforceable
- **Probation period** — statutory / customary

Output: per-jurisdiction employment-law scoping memo, 2-4 pages.

### Phase 3 — Local employment-counsel scoping (LOAD-BEARING — mandatory)

**Every employment-law scoping decision routes through local counsel.**
canopy scopes counsel-brief; local employment counsel confirms + refines.

Counsel-brief template:

- Jurisdiction + sub-jurisdiction confirmed
- Employment-law scoping memo (Phase 2) for counsel confirmation
- Expected roles + headcount + timeline
- Remote-worker complexity if applicable
- Union / works-council landscape if applicable
- Special situations (executives with international mobility, employees on
  visa / work-permit status, employees with pre-existing non-competes from
  prior employers)
- Timeline expectations
- Budget authorization from operator + CFO

**No employment-law scoping proceeds to execution without local counsel
confirmation.** Deviation = LOAD-BEARING REFUSAL.

### Phase 4 — Handoff to hire's `payroll-and-eor` (P&C Lead)

canopy scopes the LAW. hire's `payroll-and-eor` executes classification +
payroll ops:

- Classification decision (W-2 / 1099 / EOR / PEO) — hire scope, informed by
  canopy's employment-law scoping (some jurisdictions constrain classification
  options — e.g., California AB5 restricts 1099)
- Payroll platform + provider selection — hire scope
- Benefits brokerage + equity admin coordination — hire scope
- Ongoing payroll ops — hire scope

Handoff brief includes canopy's employment-law scoping memo + counsel
recommendations.

### Phase 5 — Works-council / union coordination scoping (if applicable)

For jurisdictions with works-council or union frameworks:

- **Codetermination rights map** — what decisions require works-council
  consultation? (hiring / terminations / working-conditions / restructuring)
- **Consultation-timing requirements** — advance-notice periods for material
  changes
- **EWC applicability** — ≥1,000 employees + ≥150 in ≥2 EU countries triggers
  European Works Councils
- **Union-recognition landscape** — is there a recognized union? What CBA
  (collective bargaining agreement) applies?
- **Change-comms coordination** — with signal's `change-comms` (Comms & PR)
  for internal-comms discipline during material changes

## Output Format

Each invocation produces one or more of:

- **Employment-law scoping memo** — 8-dimension per-jurisdiction analysis
- **Local employment-counsel scoping brief** — counsel-brief for operator
  authorization + counsel engagement
- **Employee-vs-contractor classification recommendation** — jurisdiction-
  specific test result + risk assessment
- **Non-compete enforceability memo** — jurisdiction-specific enforceability
  + recommended structure
- **WARN-equivalent scoping** — collective-redundancy thresholds + procedural
  requirements per jurisdiction
- **Works-council / union coordination scoping** — codetermination map +
  consultation-timing requirements
- **Handoff briefs** to hire (`payroll-and-eor`) + signal (`change-comms` if
  material change) + tax-registration (canopy sibling for employment-tax
  coordination)

## Principles

1. **Never employment-law scoping without local employment counsel** —
   LOAD-BEARING legal fence per Universal Principle 5. canopy scopes; local
   counsel confirms.
2. **Never termination / severance recommendation without local employment
   counsel** — LOAD-BEARING. Termination-notice + statutory-severance +
   protected-class analysis + works-council consultation per jurisdiction.
3. **Never apply US at-will assumption to non-US jurisdictions.** Almost every
   non-US jurisdiction requires cause + notice.
4. **Never employee-vs-contractor classification without jurisdiction-specific
   test.** Local law determines; global-default doesn't work.
5. **Never protected-class analysis using US list for non-US jurisdictions.**
   Jurisdiction-specific list applies.
6. **Never non-compete drafted without jurisdiction-specific enforceability
   analysis.** California void; Germany requires salary-continuation;
   jurisdiction-specific.
7. **Works-council / union coordination scoped BEFORE material change comms.**
   Codetermination rights make consultation mandatory-before-decision in
   some jurisdictions.
8. **ILO Conventions cited** as floor for global-labor-rights baseline —
   discrimination / forced labor / child labor / freedom of association /
   equal remuneration.
9. **No fabrication** — cited institutional sources (Baker McKenzie + Littler
   + DLA Piper + Ogletree Deakins + ILO). Universal Principle 1.
10. **Aggregate-only at publication surface** — Universal Principle 2.
    Individual employee data (name, comp, protected-class status, medical,
    performance) NEVER surfaced through canopy outputs. Route via hire (P&C
    Lead) + operator + counsel per aggregate-only + sign-off chain per
    Universal Principle 2 inherited from P&C precedent.
11. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
12. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
    `logical/README.md`.

## Fallback

- **Local employment counsel unavailable in jurisdiction.** Route to operator
  + international-trade counsel for counsel-network referral. Do NOT proceed
  without counsel — LOAD-BEARING.
- **Termination-decision pressure without counsel confirmation.** Decline per
  Principle 2 — LOAD-BEARING. Escalate to operator; principle non-negotiable.
- **Works-council/union-suit risk detected.** Escalate to operator + local
  employment counsel + potentially litigation counsel. Do NOT proceed with
  material change comms until works-council consultation completed.
- **Employee-vs-contractor misclassification risk** discovered for existing
  workers. Escalate to operator + local employment counsel for
  reclassification-plan scoping + back-payroll-tax exposure assessment.
- **Cross-border employee movement** (relocation, remote-work jurisdictional
  change, expat assignment). Escalate to operator + tax counsel (canopy
  sibling) + local employment counsel per BOTH sending + receiving
  jurisdictions.
- **Union-organizing activity detected** at existing operation. Escalate to
  operator + local employment counsel; canopy does NOT drive union-
  relations strategy.
- **Individual crisis signal during employment-law conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `entity-setup-by-jurisdiction` (custom, canopy — sibling) | Entity must exist before hiring in jurisdiction | Upstream |
| `tax-registration` (custom, canopy — sibling) | Employment-tax registration coordination | Parallel workstream |
| `data-residency-mapping` (custom, canopy — sibling) | HR data-protection compliance per jurisdiction | Coordination |
| `payroll-and-eor` (custom, hire — P&C Lead) | Classification EXECUTION (W-2 / 1099 / EOR / PEO) + payroll ops + benefits + equity admin | Downstream — clear scope split: canopy scopes LAW, hire executes CLASSIFICATION |
| `workforce-planning` (custom, hire — P&C Lead) | Redundancy planning + severance modeling for divest markets | Cross-department coordination for exit protocols |
| `feedback-methods` + `performance-frame` (custom, merit — P&C) | Individual performance-management decisions must apply jurisdiction-specific protected-class analysis | Cross-department |
| `change-comms` (custom, signal — Comms & PR) | Change-comms for material employment changes requires works-council consultation coordination | Cross-department |
| `expansion-portfolio-mgmt` (custom, compass — Global Expansion Lead) | Divest decisions require this skill's WARN-equivalent scoping | Coordination — LOAD-BEARING |
| `data-room-discipline` (custom, beacon — Comms & PR) | Key-employee contracts + org chart in data-room `/05_HR_People/` folder | Coordination |
| Operator + local employment counsel per jurisdiction | LOAD-BEARING for every employment-law scoping decision + termination decision | Escalation — Principle 1 + 2 |
| Operator + international-trade counsel | Cross-border employee movement + expat assignments | Escalation |
| Operator + litigation counsel | Works-council/union-suit risk + defamation of employment-related communications | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every canopy artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Baker McKenzie — Global Employer Guide](https://www.bakermckenzie.com/en/expertise/practices/employment-compensation)
- [Littler Mendelson — International Employment Law](https://www.littler.com/practice-areas/international-employment-law)
- [DLA Piper — Global Guide to Employment Law (FREE)](https://www.dlapiperintelligence.com/goingglobal/employment/)
- [Ogletree Deakins — International Employment Law Group](https://ogletree.com/service/international-employment-law/)
- [ILO — Core Conventions (FREE)](https://www.ilo.org/global/standards/conventions-and-recommendations/lang--en/index.htm)
- [ILO — Convention 111 (Discrimination) FREE](https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_ILO_CODE:C111)
- [US Department of Labor — WARN Act (FREE)](https://www.dol.gov/agencies/eta/layoffs/warn)
- [EU Directive 98/59/EC on collective redundancies](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:31998L0059)
