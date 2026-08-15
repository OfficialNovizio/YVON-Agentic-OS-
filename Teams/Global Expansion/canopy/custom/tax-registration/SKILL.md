<!--
Custom skill — built from scratch, synthesized from named institutional sources
(OECD BEPS + PwC Worldwide Tax Summaries + Deloitte International Tax Source +
EY Worldwide VAT Guide + KPMG Global Indirect Tax + OECD Model Tax Convention +
UN Model Convention). Body follows §11 required structure + §14.2.

Reclassification note (2026-07-31): §4.1 search found VAT-only, single-
jurisdiction, or investment-structuring skills — none anchored on OECD BEPS +
comprehensive multi-jurisdiction tax registration. §4.6 reclass to custom Route D.

Route D per §8.2 (cited rubric).
-->
---
name: tax-registration
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "OECD — BEPS (Base Erosion and Profit Shifting) Project — Pillars 1 + 2 institutional framework. Publicly available at oecd.org. Global-minimum-tax framework (Pillar 2, 15% minimum effective tax rate for large MNEs) increasingly binding."
  - "PwC — Worldwide Tax Summaries. FREE comprehensive per-country tax guides at taxsummaries.pwc.com. Institutional."
  - "Deloitte — International Tax Source. deloitte.com. Institutional."
  - "EY — Worldwide VAT, GST and Sales Tax Guide. ey.com. Institutional. §8.9 with canopy sibling entity-setup-by-jurisdiction (EY Worldwide Legal Guide also used there)."
  - "KPMG — Global Indirect Tax + country-specific tax guides. kpmg.com. Institutional."
  - "OECD Model Tax Convention + UN Model Convention — institutional treaty reference for cross-border tax coordination + DTA (Double Tax Agreement) interpretation. Publicly available."
fulfills_catalog_entry: tax-registration (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found VAT-only + single-jurisdiction + investment-structuring skills; scope mismatch for multi-jurisdiction tax registration + OECD BEPS anchoring. §4.6 reclass."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "6 institutional sources — well above §8.0 two-book minimum."
assigned_agent: canopy (Global Expansion / Multi-jurisdiction Regulatory & Compliance)
portable: true
date_added: 2026-07-31
tier: 3
description: Multi-jurisdiction tax registration framework — federal tax ID / income-tax / VAT/GST/sales-tax / withholding / digital-services tax registration per jurisdiction + OECD BEPS Pillar 2 global-minimum-tax awareness + transfer-pricing setup for multi-entity structures. Tax-counsel-first discipline (LOAD-BEARING). Trigger on "tax registration for [country]", "VAT registration in [country]", "GST registration for [country]", "sales-tax nexus in [state/country]", "digital-services tax for [country]", "BEPS Pillar 2 compliance", "transfer pricing setup for [entity]", or "withholding-tax scoping for [cross-border payment]".
triggers:
  - tax registration for
  - VAT registration in
  - GST registration for
  - sales-tax nexus in
  - digital-services tax for
  - BEPS Pillar 2 compliance
  - transfer pricing setup for
  - withholding-tax scoping for
  - DTA analysis for
  - tax obligations for entity in
---

# Tax Registration

## Introduction

This skill packages multi-jurisdiction tax-registration discipline for canopy —
invoked after `entity-setup-by-jurisdiction` (canopy sibling) completes entity
formation. Tax-obligation scoping per jurisdiction + tax-counsel-first
coordination + registration operational checklist + transfer-pricing setup for
multi-entity structures + OECD BEPS Pillar 2 global-minimum-tax awareness.

**Scope distinction:** this is REGISTRATION scoping + counsel coordination —
canopy scopes the counsel-brief; tax counsel does actual filings + returns.
Distinct from `entity-setup-by-jurisdiction` (upstream — entity must exist
before tax registration) and from ongoing tax-compliance tracking (candidate
future canopy skill from Anthropic `corporate-legal:entity-compliance`).

Custom Route D per §8.2 — cited rubric grounded in OECD + Big-4 tax
institutional corpus.

## Purpose

Prevents six failure modes:

1. **Tax registration without tax counsel.** Every jurisdiction has quirks —
   registration sequencing (tax-ID before or after VAT; VAT thresholds vary),
   tax-year timing (fiscal-year alignment matters for first-year filings),
   local-representative requirements (some jurisdictions require local tax
   agent for foreign entities). Skipping tax counsel = predictable
   over-registration OR under-registration failure. **LOAD-BEARING.**
2. **Transfer-pricing setup ignored for multi-entity structures.** Once ≥2
   entities in different tax jurisdictions, intercompany transactions require
   arm's-length pricing per OECD Transfer Pricing Guidelines. Setup without
   intercompany agreements + transfer-pricing documentation = predictable
   audit exposure + potential double taxation. **LOAD-BEARING.**
3. **BEPS Pillar 2 (global minimum tax) blindness.** For MNE groups with
   consolidated revenue ≥€750M, Pillar 2 imposes 15% global minimum effective
   tax rate. Being ignorant of Pillar 2 timing = surprise top-up-tax exposure.
4. **Digital-services tax blindness.** France, UK, Italy, Spain, India, Kenya,
   Turkey, and others have digital-services taxes (typically 2-7.5% of local
   digital-services revenue). SaaS + digital-goods companies often trigger
   these without knowing.
5. **VAT/GST threshold ignorance.** VAT/GST registration thresholds vary
   materially — some jurisdictions require registration on any cross-border
   sale (EU OSS/IOSS scheme); some have local sales thresholds (£90k UK, $75k
   Australia GST). Missing threshold = penalty + back-tax exposure.
6. **Individual crisis DURING tax-registration crunch.** Team members under
   registration-deadline pressure + personal distress can coincide. HARD
   BOUNDARY per Universal Principle 3.

canopy uses this skill as Phase 2 of any regulatory-scoping workflow — after
entity setup, before hiring / operating.

## When to Use

Trigger on:

- "Tax registration for [country]" / "tax obligations for entity in [country]"
- "VAT registration in [country]" / "GST registration for [country]" /
  "sales-tax nexus in [state/country]"
- "Digital-services tax for [country]"
- "BEPS Pillar 2 compliance" / "global minimum tax scoping"
- "Transfer pricing setup for [entity]" / "intercompany agreement for [entities]"
- "Withholding-tax scoping for [cross-border payment]" / "DTA analysis for
  [payment type]"
- Handoff from `entity-setup-by-jurisdiction` (canopy sibling) once entity
  registration complete

Do NOT use for:

- **Entity formation itself** → `entity-setup-by-jurisdiction` (canopy sibling)
- **Employment-tax registration for hiring** → coordinates with `employment-
  law-multi-jurisdiction` (canopy sibling) + hire's `payroll-and-eor`
- **Ongoing tax compliance tracking (register with deadlines)** → candidate
  future canopy skill from Anthropic `corporate-legal:entity-compliance`
- **Actual tax-return preparation + filing** → operator + tax counsel + local
  tax accountant per jurisdiction
- **Tax-arbitrage-only strategies without operational basis** → decline;
  requires reputational-risk review
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The tax-registration workflow combines obligation-scoping + counsel-first +
registration checklist + transfer-pricing setup + BEPS awareness:

```
TAX-OBLIGATION TYPES (varies by jurisdiction + entity + activity)

  INCOME / CORPORATE TAX
    - Entity income tax (corporate rate varies 9-35%+ across jurisdictions)
    - Withholding tax on payments (dividends / interest / royalties / services)
    - DTA (Double Tax Agreement) treatment for cross-border payments

  INDIRECT TAX
    - VAT (EU standard) — registration threshold varies per country;
      OSS/IOSS schemes for EU cross-border e-commerce
    - GST (Australia / NZ / Singapore / India / Canada varieties)
    - Sales tax (US — nexus-based, per-state, complex post-Wayfair 2018)
    - Consumption tax (Japan)

  DIGITAL-SERVICES TAX (increasingly common)
    - France DST 3%
    - UK DST 2% (planned phase-out with Pillar 1)
    - Italy DST 3%, Spain DST 3%
    - India Equalisation Levy 2-6%
    - Kenya DST 1.5%, Turkey DST 7.5%, plus growing list

  EMPLOYMENT TAX (coordinate with employment-law + hire)
    - Employer social security / national insurance
    - Employee income withholding
    - Payroll tax variants per jurisdiction

  OTHER
    - Property tax (real estate)
    - Excise / customs (physical goods)
    - Financial-transaction tax (FTT — several jurisdictions)


BEPS PILLAR 2 (OECD 2021 → binding phase-in from 2024+)

  Scope: MNE groups with consolidated revenue ≥€750M
  Rule: 15% global minimum effective tax rate per jurisdiction
  Mechanism: top-up-tax if effective rate below 15% in any jurisdiction
  Phase-in: EU + several countries binding 2024+; others 2025+

  For growth-stage orgs approaching €750M threshold: begin tracking effective
  rates per jurisdiction 12-24 months before threshold. Route to tax counsel
  for Pillar 2 modeling.


TRANSFER PRICING (OECD Transfer Pricing Guidelines)

  Applies once ≥2 entities in different tax jurisdictions transact.
  Arm's-length principle: intercompany transactions priced as if between
  unrelated parties.

  Methods:
    - CUP (Comparable Uncontrolled Price)
    - Resale Price Method
    - Cost Plus Method
    - Transactional Net Margin Method (TNMM)
    - Profit Split Method

  Documentation required per OECD Master File + Local File + CbCR (Country-
  by-Country Reporting) for larger groups.

  Intercompany agreements (IP license, services agreement, distribution
  agreement, cost-sharing arrangement) drafted by tax counsel + reviewed
  annually.


TAX-REGISTRATION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: TAX-OBLIGATION SCOPING                    (per jurisdiction, entity, activity)
  Phase 2: TAX-COUNSEL SCOPING                       (LOAD-BEARING — mandatory)
  Phase 3: REGISTRATION OPERATIONAL CHECKLIST         (federal tax ID / VAT / GST / other)
  Phase 4: TRANSFER-PRICING SETUP                     (if ≥2 entities in different jurisdictions)
  Phase 5: BEPS PILLAR 2 + DIGITAL-SERVICES-TAX SCOPING (awareness + forward-planning)
```

## Instructions

### Phase 1 — Tax-obligation scoping per jurisdiction

For each entity in each jurisdiction, scope obligations:

- **Income / corporate tax** — federal + state/province/canton where applicable
- **Withholding tax** on cross-border payments (dividends / interest /
  royalties / services) — cite DTA if in effect
- **VAT / GST / sales tax** — threshold applicability, cross-border scheme
  (EU OSS/IOSS)
- **Digital-services tax** — check France / UK / Italy / Spain / India /
  Kenya / Turkey / expanding list for SaaS / digital-goods activities
- **Employment tax** — social security + employer contributions (coordinate
  with employment-law sibling)
- **Industry-specific tax** — financial-transaction tax, excise for regulated
  goods, extractive-industry taxes

Cite PwC Worldwide Tax Summaries + Deloitte + EY + KPMG per jurisdiction.

### Phase 2 — Tax-counsel scoping (LOAD-BEARING — mandatory)

**Every tax registration routes through tax counsel.** canopy scopes the
counsel-brief; tax counsel does actual filings.

Counsel-brief template:

- Entity + jurisdiction confirmed (from `entity-setup-by-jurisdiction`)
- Business activity + expected revenue per jurisdiction
- Cross-border payment flows expected (dividends / royalties / services /
  intercompany)
- VAT/GST/sales-tax threshold status (below / near / above)
- Digital-services tax applicability
- BEPS Pillar 2 exposure (based on MNE group consolidated revenue)
- Transfer-pricing scope if multi-entity
- Timeline expectations
- Budget authorization from operator + CFO

**No tax registration proceeds without tax counsel engagement.** Deviation =
LOAD-BEARING REFUSAL.

### Phase 3 — Registration operational checklist

Per jurisdiction (customized by tax counsel):

- Federal tax ID (or local equivalent — EIN in US, UTR in UK, Steuernummer
  in Germany, etc.)
- VAT / GST registration if threshold met or planned to be exceeded
- Withholding-tax registration if making cross-border payments
- Digital-services tax registration if applicable
- Employment-tax registration if hiring (coordinate with employment-law +
  hire)
- Industry-specific tax registration
- OSS / IOSS registration for EU cross-border e-commerce if applicable

Track per-milestone status + tax-counsel-milestone dependencies.

### Phase 4 — Transfer-pricing setup (if ≥2 entities in different jurisdictions)

- **Intercompany-flow mapping** — identify all cross-entity transactions
  (IP license / management services / distribution / cost sharing)
- **Method selection** per transaction type (CUP / RPM / CPM / TNMM /
  Profit Split) — tax counsel decides
- **Intercompany agreements** drafted by tax counsel — LOAD-BEARING for
  transfer-pricing defensibility
- **Documentation** — Master File + Local File + CbCR (per OECD framework)
  where applicable to group size
- **Annual review** — intercompany-agreement pricing reviewed annually with
  tax counsel

### Phase 5 — BEPS Pillar 2 + digital-services-tax scoping

- **BEPS Pillar 2 exposure check** — if MNE group consolidated revenue
  approaching or above €750M, begin per-jurisdiction effective-tax-rate
  tracking. Route to tax counsel for Pillar 2 modeling + potential top-up-
  tax planning.
- **Digital-services tax forward-scan** — for SaaS / digital-goods orgs,
  quarterly review of digital-services tax jurisdiction list (list expanding
  — new jurisdictions added regularly).
- **Reporting-obligation scoping** — CbCR filing requirements for larger
  groups + jurisdiction-specific digital-services tax return frequencies.

## Output Format

Each invocation produces one or more of:

- **Tax-obligation scoping memo** — per jurisdiction, per entity, per activity
- **Tax-counsel scoping brief** — counsel-brief template for operator
  authorization + counsel engagement
- **Registration operational checklist** — per-jurisdiction customized
  checklist with per-milestone tracking
- **Transfer-pricing setup memo** — intercompany-flow mapping + method
  selection + intercompany-agreement scoping brief
- **BEPS Pillar 2 exposure memo** — if group revenue approaching threshold
- **Digital-services tax scan** — per-jurisdiction applicability + registration
  status
- **Cross-agent handoff briefs** to canopy siblings (entity-setup + employment-
  law + data-residency) + hire (payroll-and-eor) + frontier (cross-border
  payments)

## Principles

1. **Never tax registration without tax counsel** — LOAD-BEARING legal fence
   per Universal Principle 5. canopy scopes counsel-brief; tax counsel does
   filings.
2. **Never transfer-pricing setup without tax counsel + intercompany-agreement
   scoping** — LOAD-BEARING. Multi-entity structures require arm's-length
   pricing documentation.
3. **Never tax-arbitrage recommendation without tax counsel + reputational-
   risk review** — LOAD-BEARING. Aggressive tax-optimization structures
   carry reputational + BEPS anti-avoidance risk.
4. **BEPS Pillar 2 tracked** for groups approaching €750M threshold — no
   surprise top-up-tax exposure.
5. **Digital-services tax quarterly scan** for SaaS / digital-goods orgs —
   expanding jurisdiction list requires ongoing awareness.
6. **VAT/GST threshold monitored** — near-threshold registration timing
   requires tax-counsel review.
7. **DTA cited** for withholding-tax scoping on cross-border payments — no
   default rate applied without DTA analysis.
8. **No fabrication** — cited institutional sources (OECD + PwC + Deloitte +
   EY + KPMG). Universal Principle 1.
9. **Aggregate-only at publication surface** — Universal Principle 2.
10. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
11. **§0.6 flag.** OECD + Big-4 institutional sources Tier B. Downgrade path
    documented in `logical/README.md`.

## Fallback

- **Tax counsel unavailable in jurisdiction.** Route to operator + international-
  tax counsel for counsel-network referral. Do NOT proceed with registration
  without counsel — LOAD-BEARING.
- **Tax-arbitrage-only pressure** without operational basis. Decline per
  Principle 3. Escalate to operator + international-tax counsel + reputational-
  risk review.
- **Uncertainty about BEPS Pillar 2 applicability.** Route to tax counsel for
  MNE-group-revenue assessment + Pillar 2 modeling.
- **Digital-services tax status ambiguous** for new jurisdiction / activity.
  Route to tax counsel; default to conservative applicability assumption
  until counsel-confirmed.
- **Transfer-pricing method disagreement** with tax counsel. Tax counsel
  decides; canopy does NOT override method selection.
- **Cross-jurisdiction tax dispute** (e.g., transfer-pricing audit;
  competent-authority-procedure needed). Escalate to operator + tax counsel
  + potentially competent-authority-procedure counsel per DTA.
- **VAT/GST-registration near threshold** — coordinate with operator + CFO
  for early-registration vs wait-for-threshold decision (registration
  triggers ongoing compliance obligations).
- **Individual crisis signal during tax-registration conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `entity-setup-by-jurisdiction` (custom, canopy — sibling) | Entity must exist before tax registration | Upstream |
| `employment-law-multi-jurisdiction` (custom, canopy — sibling) | Employment-tax registration coordination | Parallel workstream |
| `data-residency-mapping` (custom, canopy — sibling) | Data-protection registration parallel to tax registration | Parallel workstream |
| `payroll-and-eor` (custom, hire — P&C Lead) | Payroll tax setup once employment-tax registration complete | Cross-department downstream |
| `cross-border-payments` + `international-banking` (custom, frontier) | Withholding-tax scoping for cross-border payment flows | Coordination |
| `data-room-discipline` (custom, beacon — Comms & PR) | Tax documents feed data-room `/02_Financial/` folder | Coordination |
| `investor-cadence` (custom, beacon — Comms & PR) | Investor comms if tax structure material to investors | Cross-department escalation |
| compass (Global Expansion Lead) | Ghemawat-flavored legal-distance discipline — jurisdictional tax differences as first-class distance | Upstream inherited |
| Operator + tax counsel per jurisdiction | LOAD-BEARING for every tax registration + transfer-pricing setup | Escalation — Principle 1 + 2 |
| Operator + international-tax counsel | BEPS Pillar 2 modeling + cross-border dispute + competent-authority-procedure | Escalation |
| Operator + reputational-risk review | Tax-arbitrage strategy proposals | Escalation — Principle 3 |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every canopy artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [OECD — BEPS Project (Pillars 1 + 2)](https://www.oecd.org/tax/beps/)
- [OECD — Pillar Two rules](https://www.oecd.org/tax/beps/pillar-two-model-rules-in-a-nutshell.pdf)
- [OECD — Transfer Pricing Guidelines](https://www.oecd.org/tax/transfer-pricing/)
- [OECD — Model Tax Convention](https://www.oecd.org/tax/treaties/model-tax-convention-on-income-and-on-capital-condensed-version-20745419.htm)
- [PwC — Worldwide Tax Summaries (FREE)](https://taxsummaries.pwc.com/)
- [Deloitte — International Tax Source (Tax@Hand)](https://www.taxathand.com/)
- [EY — Worldwide VAT, GST and Sales Tax Guide](https://www.ey.com/en_gl/tax-guides/worldwide-vat-gst-and-sales-tax-guide)
- [KPMG — Global Indirect Tax](https://kpmg.com/xx/en/home/insights/topics/global-indirect-tax.html)
- [UN — Model Tax Convention](https://www.un.org/development/desa/financing/document/un-model-double-taxation-convention-between-developed-and-developing-countries-2021-update)
