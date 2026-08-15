<!--
Custom skill — built from scratch, synthesized from named institutional sources
(ATA + FIT + Baker McKenzie + Bird & Bird + ISO 17100 + Cao 2007). Body follows
§11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found general translation +
template-generator marketplace skills; none address legal-document localization
with counsel-review discipline + jurisdiction-specific-legal-requirements. §4.6
reclass to custom Route D.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Baker McKenzie 3rd use (canopy entity-setup + canopy
employment-law + this); Bird & Bird 2nd use (canopy data-residency + this).
-->
---
name: legal-localization
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "ATA (American Translators Association) — legal-translation professional standards + certification program. Institutional. atanet.org."
  - "FIT (International Federation of Translators / Fédération Internationale des Traducteurs) — international legal-translation standards + national-association network. Institutional. fit-ift.org."
  - "Baker McKenzie — Global Guide to Doing Business. Institutional. §8.9 3rd use (canopy entity-setup + canopy employment-law + this)."
  - "Bird & Bird — Global Data Protection Handbook. Institutional. §8.9 2nd use (canopy data-residency + this)."
  - "ISO 17100:2015 — Translation Services standard. Institutional. iso.org. Covers translator competencies + workflow + QA."
  - "Cao, Deborah (2007). Translating Law. Multilingual Matters. ISBN 978-1853599545. Canonical academic text on legal translation — legal-systems + terminology + interpretation challenges."
fulfills_catalog_entry: legal-localization (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found general translation + template-generator marketplace skills. Different scope — none address legal-doc localization with counsel-review discipline. §4.6 reclass to custom Route D."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "6 institutional sources — well above §8.0 two-book minimum."
assigned_agent: lingua (Global Expansion / Localization)
portable: true
date_added: 2026-07-31
tier: 3
description: Legal-document localization framework — legal-translation-vs-legal-drafting decision + certified legal-translator selection (ATA / FIT / ISO 17100) + jurisdiction-specific requirements (Chinese-original + English-reference for many Chinese contracts; notarization + apostille for cross-border EU legal docs) + LOAD-BEARING counsel-review gate before user-facing publication. Coordinates with canopy for jurisdiction-scoping + operator + counsel for legal validity. Trigger on "localize T&Cs for [jurisdiction]", "privacy policy in [language]", "translate DPA for [processor]", "cookie notice for [jurisdiction]", "subscription agreement localization for [market]", "IP notice localization", "legal translator certification for [language pair]", or "counsel review for localized legal content".
triggers:
  - localize T&Cs for
  - privacy policy in
  - translate DPA for
  - cookie notice for
  - subscription agreement localization for
  - IP notice localization
  - legal translator certification for
  - counsel review for localized legal content
  - legal-drafting vs legal-translation for
  - notarization apostille for legal doc
---

# Legal Localization

## Introduction

This skill packages legal-document localization discipline for lingua — invoked
for user-facing legal content (T&Cs, privacy policy, DPA templates, cookie
notices, subscription agreements, IP notices, license agreements) needing
adaptation for a new jurisdiction / locale. Legal-translation-vs-legal-drafting
decision + certified legal-translator selection + jurisdiction-specific
requirements + LOAD-BEARING counsel-review gate before user-facing publication.

**Scope distinction:** lingua's `legal-localization` coordinates LOCALIZATION of
legal documents. Legal-DRAFTING is operator + counsel scope. canopy scopes
jurisdictional legal requirements; lingua handles localization coordination;
counsel confirms legal validity.

Custom Route D per §8.2 — cited rubric grounded in ATA + FIT + Baker McKenzie
+ Bird & Bird + ISO 17100 + Cao 2007 institutional corpus.

## Purpose

Prevents seven failure modes:

1. **Translate-when-draft-required.** Some jurisdictions require locally-drafted
   originals of legal content — not translations. GDPR-compliant privacy policy
   per EU jurisdiction with local-language legal-drafting is often needed vs.
   translated version of home-jurisdiction policy. LOAD-BEARING escalation
   to canopy + counsel for legal-translation-vs-legal-drafting decision.
2. **Machine-translation for legal content.** Machine translation of legal
   language creates liability — mistranslated terms can fail to convey
   legal meaning + create unintended obligations. LOAD-BEARING refusal for
   user-facing legal content.
3. **Uncertified legal-translator engagement.** ATA-certified (US), NAJIT
   (US court certification), sworn translators (EU civil-law jurisdictions),
   or ISO 17100-conformant vendors are the standard. Uncertified translators
   for legal content = quality + liability risk.
4. **Skip counsel-review before publication.** Legal-translated content
   published without counsel review = liability risk. Even certified legal
   translation requires legal-counsel-review for legal-validity confirmation
   per jurisdiction. LOAD-BEARING gate before user-facing publication.
5. **Ignore jurisdiction-specific format requirements.** Chinese contracts
   frequently require Chinese-language originals with English as reference-
   only (Chinese version controls); some EU jurisdictions require notarization
   + apostille for cross-border legal docs; Arabic contracts have specific
   legal-language conventions; Japanese legal docs use specific keigo
   registers. Format matters as much as content.
6. **Cross-jurisdiction consistency broken.** Same legal-doc localized
   independently across jurisdictions creates inconsistencies that surface
   under regulatory audit or dispute. Cross-locale-consistency-check
   coordinates with counsel.
7. **Individual crisis DURING legal-localization sprint.** Team members under
   compliance-timeline pressure + personal distress can coincide. HARD
   BOUNDARY per Universal Principle 3.

lingua uses this skill for legal-doc-specific localization, coordinated with
canopy siblings + operator + counsel.

## When to Use

Trigger on:

- "Localize T&Cs for [jurisdiction]" / "privacy policy in [language]"
- "Translate DPA for [processor]" / "cookie notice for [jurisdiction]"
- "Subscription agreement localization for [market]" / "IP notice localization"
- "Legal translator certification for [language pair]"
- "Counsel review for localized legal content"
- "Legal-drafting vs legal-translation for [content]"
- "Notarization / apostille for legal doc"
- Handoff from canopy `data-residency-mapping` (Phase 5) for privacy-policy
  localization
- Handoff from canopy `entity-setup-by-jurisdiction` for entity legal-doc
  localization

Do NOT use for:

- **Legal-content DRAFTING** — operator + counsel scope; lingua handles
  localization only
- **General technical content localization** → `product-localization` (lingua
  sibling)
- **Marketing content localization** → `marketing-localization` (lingua
  sibling)
- **Cultural adaptation (deep framework application)** → `cultural-adaptation`
  (lingua sibling)
- **Legal-content EXPLANATION for end-users** (plain-language T&C) — not
  legal-localization scope; may be marketing-adjacent
- **Regulatory-filing preparation** — operator + counsel scope
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The legal-localization workflow combines legal-doc-scope + translation-vs-
drafting decision + certified translator + jurisdiction requirements + counsel
gate:

```
LEGAL-TRANSLATION VS LEGAL-DRAFTING DECISION

  TRANSLATE (adapt existing content):
    - Home-jurisdiction original content has legal validity in target
      jurisdiction when translated
    - Content is universal (e.g., copyright notices, IP attributions)
    - Translation preserves legal meaning without altering rights or
      obligations

  DRAFT LOCALLY (write new content per jurisdiction):
    - Target jurisdiction has specific mandatory requirements not in
      home-jurisdiction original (e.g., GDPR-required specific disclosures
      not in US privacy policy)
    - Legal-content format required per jurisdiction (e.g., specific
      Chinese contract format for enforceability in Chinese courts)
    - Content is jurisdiction-specific by nature (e.g., cookie consent
      per EU ePrivacy Directive)

  Decision requires canopy scoping + operator + counsel input.


CERTIFIED LEGAL-TRANSLATOR CERTIFICATION STANDARDS

  US:
    - ATA (American Translators Association) — certification per language pair
    - NAJIT (National Association of Judiciary Interpreters and Translators)
      — court-related certification

  EU / civil-law jurisdictions:
    - Sworn translators (traducteur assermenté / traduttore giurato /
      vereidigter Übersetzer) — appointed by courts, legally recognized
      for official translations
    - Notary-notarized translations for cross-border legal use

  International:
    - ISO 17100:2015 conformant translation vendors
    - FIT-member national translator associations per jurisdiction

  For legal-doc localization, certified translator is standard. Vendor
  selection scoped with operator + procurement + counsel.


JURISDICTION-SPECIFIC LEGAL-DOC REQUIREMENTS (illustrative)

  CHINA
    - Chinese-language original controls for enforceability in Chinese courts
    - English version acceptable as reference-only
    - Some contracts require specific chops (seals) + registration

  EU
    - GDPR requires jurisdiction-specific privacy policy content (Article 13/14
      transparency requirements)
    - ePrivacy Directive requires cookie consent in local language
    - Consumer contracts (B2C) often require local language per Directive
      93/13/EEC

  ARABIC-LEGAL-SYSTEM COUNTRIES
    - Arabic-language original often controls
    - Specific legal-Arabic terminology
    - Sharia-compliant contract structures where applicable

  JAPAN
    - Japanese legal-language uses specific keigo (honorific) registers
    - Contracts often bilingual (Japanese + English) with governing-language
      clause


LEGAL-LOCALIZATION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: LEGAL-DOC SCOPE CONFIRMATION                (which docs per jurisdiction from canopy)
  Phase 2: LEGAL-TRANSLATION-VS-LEGAL-DRAFTING DECISION (per doc per jurisdiction with counsel)
  Phase 3: CERTIFIED TRANSLATOR SELECTION               (ATA / FIT / ISO 17100 / sworn per jurisdiction)
  Phase 4: JURISDICTION-SPECIFIC FORMAT + REQUIREMENTS  (chops / notarization / apostille / bilingual / governing-language)
  Phase 5: LOAD-BEARING COUNSEL-REVIEW GATE             (legal validity confirmation before publication)
```

## Instructions

### Phase 1 — Legal-doc scope confirmation

Coordinate with canopy siblings (usually `data-residency-mapping` or
`entity-setup-by-jurisdiction`) for scope input:

- Which legal docs need localization per target jurisdiction (T&Cs, privacy
  policy, DPA, cookie notice, subscription agreement, IP notice, etc.)
- Which jurisdictions in scope
- Which languages required per jurisdiction

### Phase 2 — Legal-translation-vs-legal-drafting decision

Per doc per jurisdiction, decision:

- **TRANSLATE** if home-jurisdiction original has legal validity in target
  when translated + no jurisdiction-specific mandatory content missing
- **DRAFT LOCALLY** if jurisdiction has mandatory requirements not in
  home original (GDPR-specific privacy disclosures, EU cookie-consent
  specifics, Chinese contract-format for court-enforceability)

Decision requires canopy scoping input + operator + counsel confirmation.
Do NOT default to translation for jurisdictions with mandatory-content
requirements.

### Phase 3 — Certified translator selection

For TRANSLATE decisions:

- ATA-certified (US) OR sworn translator (EU civil-law) OR ISO 17100-
  conformant vendor per jurisdiction
- FIT-member national association verification per non-US jurisdiction
- Vendor selection is operator + procurement scope; lingua scopes
  requirements

For DRAFT LOCALLY decisions: local counsel drafts (operator + counsel
scope; lingua coordinates delivery + timing, does NOT draft legal content).

### Phase 4 — Jurisdiction-specific format + requirements

Per jurisdiction, confirm format requirements with local counsel:

- Language-precedence — which language controls (governing-language clause)?
- Notarization required?
- Apostille required (for cross-border legal use, Hague Convention 1961)?
- Bilingual format required?
- Specific chops / seals / signatures required (China, some others)?
- Publication-format requirements (web-page-vs-PDF-vs-signed-document)?

### Phase 5 — LOAD-BEARING counsel-review gate

**No user-facing legal content published without counsel-review-per-
jurisdiction gate.** LOAD-BEARING.

Counsel-review gate:
- Legal validity per jurisdiction confirmed
- Cross-jurisdiction consistency check
- Format requirements met
- Signing / execution requirements met if applicable

Only after counsel sign-off does content go to publication.

## Output Format

Each invocation produces one or more of:

- **Legal-doc scope memo** — per-jurisdiction docs required
- **Legal-translation-vs-legal-drafting decision memo** — per doc per
  jurisdiction with counsel confirmation
- **Certified translator selection brief** — ATA / FIT / ISO 17100 / sworn
  translator requirements per language pair
- **Jurisdiction-specific format + requirements memo** — language precedence,
  notarization, apostille, chops, bilingual format
- **Counsel-review-gate checklist** — pre-publication gate items
- **Localized legal content deliverables** — via certified translator (via
  operator + procurement + counsel coordination)
- **Cross-agent handoff briefs** — canopy siblings (data-residency + entity-
  setup), operator + counsel, product / dev for publication integration

## Principles

1. **Never publish user-facing localized legal content without counsel-review-
   per-jurisdiction gate** — LOAD-BEARING per failure mode 4.
2. **Never machine-translate user-facing legal content** — LOAD-BEARING per
   failure mode 2. Certified human legal translator OR local drafting.
3. **Legal-translation-vs-legal-drafting decision per jurisdiction** — do NOT
   default to translation when local drafting required for mandatory
   jurisdiction-specific content.
4. **Certified legal translator required** — ATA / FIT / ISO 17100 / sworn
   translator per jurisdiction. No uncertified translators for legal content.
5. **Jurisdiction-specific format + governing-language** — chops / notarization
   / apostille / bilingual / language-precedence per counsel.
6. **Cross-jurisdiction consistency check** at counsel-review gate.
7. **No fabrication** — cited institutional sources (ATA + FIT + Baker
   McKenzie + Bird & Bird + ISO 17100 + Cao 2007). Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2.
   Individual counsel-review recommendations aggregate; individual counsel
   opinions handled per operator + counsel privilege discipline.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
    `logical/README.md`.

## Fallback

- **Counsel-review gate delayed.** DEFER publication until counsel sign-off.
  Do NOT publish user-facing legal content without counsel-review — LOAD-
  BEARING.
- **Machine-translation pressure to save cost.** Decline per Principle 2 —
  LOAD-BEARING. Escalate cost concerns to operator; certified translation
  vendor rate + counsel-review are necessary costs for legal content.
- **Certified translator unavailable for language pair.** Route to operator
  + procurement + counsel for vendor-network expansion; may require multiple-
  vendor arrangement (translator + reviewer + counsel). Do NOT engage
  uncertified translator as workaround.
- **Legal-drafting-required decision (not translation)** but local counsel
  unavailable. Route to operator + international-trade counsel for local-
  counsel-network referral (same path as canopy fallbacks).
- **Jurisdiction-specific format requirement complex** (China chops +
  registration; Arabic Sharia-compliant + specific format). Route to local
  counsel; do NOT proceed with publication without format-requirements
  confirmed.
- **Cross-jurisdiction inconsistency** detected between localized versions.
  Route to counsel for reconciliation; may require re-localization of one
  or more versions.
- **Dispute or regulatory challenge** to localized legal content post-
  publication. Escalate to operator + litigation counsel + counsel-of-
  jurisdiction-of-challenge; canopy sibling `data-residency-mapping`
  coordinates if data-protection dimension.
- **Individual crisis signal during legal-localization conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `data-residency-mapping` (custom, canopy — Global Expansion sibling) | Privacy-policy + DPA + cookie-notice localization triggered by data-residency scoping | Upstream trigger |
| `entity-setup-by-jurisdiction` (custom, canopy — Global Expansion sibling) | Entity-legal-doc localization (bylaws / contracts / operating agreements) | Upstream trigger |
| `employment-law-multi-jurisdiction` (custom, canopy — Global Expansion sibling) | Employment-legal-doc localization (contracts / handbooks / notices) | Upstream trigger |
| `product-localization` (custom, lingua — sibling) | Coordination for legal-content that appears in product (T&C acceptance flow, cookie banner) | Coordination |
| `marketing-localization` (custom, lingua — sibling) | Legal disclaimers / fine print in marketing content | Coordination |
| `cultural-adaptation` (custom, lingua — sibling) | Cultural-appropriateness of legal-content presentation (not legal-content itself) | Coordination |
| dev / product | Publication integration for localized legal content in product | Downstream coordination |
| compass (Global Expansion Lead) | Report-back on legal-localization progress | Upstream |
| Operator + local counsel per jurisdiction | LOAD-BEARING counsel-review gate before publication | Escalation — Principle 1 |
| Operator + procurement + certified translator vendor | Vendor selection + quality management | Escalation |
| Operator + international-trade counsel | Cross-jurisdiction consistency + jurisdiction-format requirements | Escalation |
| Operator + litigation counsel | Dispute or regulatory challenge to localized legal content | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every legal-localization artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [ATA — American Translators Association](https://www.atanet.org/)
- [ATA — Certification Program](https://www.atanet.org/certification/)
- [FIT — International Federation of Translators](https://en.fit-ift.org/)
- [NAJIT — National Association of Judiciary Interpreters and Translators](https://najit.org/)
- [Baker McKenzie — Global Guide to Doing Business](https://www.bakermckenzie.com/en/expertise)
- [Bird & Bird — Global Data Protection](https://www.twobirds.com/en/expertise/privacy-and-data-protection)
- [ISO 17100:2015 — Translation Services (institutional standard)](https://www.iso.org/standard/59149.html)
- [Cao, Deborah — Translating Law (Multilingual Matters)](https://www.multilingual-matters.com/page/detail/Translating-Law/?k=9781853599545)
- [Hague Convention 1961 — Apostille](https://www.hcch.net/en/instruments/conventions/full-text/?cid=41)
