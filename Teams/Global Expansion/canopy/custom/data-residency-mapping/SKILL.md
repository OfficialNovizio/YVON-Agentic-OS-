<!--
Custom skill — built from scratch, synthesized from named institutional sources
(IAPP + Bird & Bird + DLA Piper + EDPB + NIST Privacy Framework + OECD Privacy
Guidelines). Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found several privacy-compliance
marketplace skills — publishers unknown-credibility, none anchored on IAPP +
Bird & Bird + DLA Piper + EDPB + NIST + OECD with specific data-residency-
mapping-and-transfer-mechanism scope. §4.6 reclass to custom Route D.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: coordinates heavily with warden + veil + bastion
(Cybersecurity data-protection scope); canopy owns MAPPING + counsel-scoping;
Cybersecurity owns technical IMPLEMENTATION.
-->
---
name: data-residency-mapping
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "IAPP (International Association of Privacy Professionals) — global privacy law tracker + Global Privacy Directory. Institutional. iapp.org."
  - "Bird & Bird — Global Data Protection Handbook. Institutional. twobirds.com."
  - "DLA Piper — Data Protection Laws of the World Handbook. Institutional. FREE at dlapiperdataprotection.com. Covers 130+ jurisdictions."
  - "European Data Protection Board (EDPB) — GDPR guidelines + cross-border transfer decisions. Institutional. FREE at edpb.europa.eu."
  - "NIST Privacy Framework (NIST PF 1.0, 2020). Institutional. FREE at nist.gov/privacy-framework. Voluntary US framework."
  - "OECD Privacy Guidelines (Guidelines on the Protection of Privacy and Transborder Flows of Personal Data, 1980 + 2013 update). Institutional treaty. FREE at oecd.org."
fulfills_catalog_entry: data-residency-mapping (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found privacy-compliance marketplace skills with unknown-credibility publishers + scope-narrower framing. §4.6 reclass to custom Route D."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "6 institutional sources — well above §8.0 two-book minimum."
assigned_agent: canopy (Global Expansion / Multi-jurisdiction Regulatory & Compliance)
portable: true
date_added: 2026-07-31
tier: 3
description: Data-residency + data-protection compliance mapping per jurisdiction — data-flow mapping + applicable-regime scoping (GDPR / UK GDPR / CCPA/CPRA / LGPD / PIPL / PDPA / POPIA / Australia Privacy Act / India DPDPA 2023) + cross-border transfer mechanism scoping (SCCs / adequacy decisions / BCRs / CAC-security-assessment) + LOAD-BEARING data-protection-counsel coordination + technical-implementation handoff to warden + veil + bastion (Cybersecurity). Trigger on "data residency for [country]", "GDPR compliance for [operation]", "CCPA/CPRA for [California data]", "cross-border data transfer to/from [country]", "SCC or adequacy or BCR for [transfer]", "data-processing-agreement for [processor]", "PIPL CAC security assessment", or "data protection registration in [country]".
triggers:
  - data residency for
  - GDPR compliance for
  - CCPA/CPRA for
  - cross-border data transfer to
  - cross-border data transfer from
  - SCC or adequacy or BCR for
  - data-processing-agreement for
  - PIPL CAC security assessment
  - data protection registration in
  - LGPD or PDPA or POPIA or DPDPA scoping
---

# Data Residency Mapping

## Introduction

This skill packages multi-jurisdiction data-residency + data-protection compliance-
mapping discipline for canopy. Data-flow mapping + applicable-regime scoping per
jurisdiction + cross-border transfer mechanism scoping + LOAD-BEARING data-protection-
counsel coordination + technical-implementation handoff to warden + veil + bastion
(Cybersecurity).

**Scope distinction:** canopy owns the MAPPING (what data lives where under what
regime + what transfer mechanism applies) + counsel-scoping. warden + veil + bastion
(Cybersecurity data-protection scope) own the TECHNICAL IMPLEMENTATION (encryption
posture, access controls, breach-notification systems, data-loss-prevention).
Clear split: canopy = LEGAL/JURISDICTIONAL SCOPING; Cybersecurity = TECHNICAL
IMPLEMENTATION.

Custom Route D per §8.2 — cited rubric grounded in IAPP + Bird & Bird + DLA Piper
+ EDPB + NIST + OECD institutional corpus.

Reclassified from a marketplace scope-mismatch per §4.6.

## Purpose

Prevents seven failure modes:

1. **Data-flow mapping skipped.** Without knowing WHICH data types flow to WHICH
   jurisdictions under WHICH processors, compliance is guesswork. Data-flow
   mapping is Phase 1 for a reason.
2. **Wrong regime applied.** GDPR applies to EU data subjects regardless of
   controller location (extraterritorial); CCPA applies to California
   residents regardless of business location; LGPD applies to Brazil data
   subjects. Missing extraterritorial scope = surprise-liability.
3. **Cross-border transfer without valid mechanism.** Post-Schrems II (2020),
   Standard Contractual Clauses (SCCs) require Transfer Impact Assessment (TIA)
   for transfers to third countries. Adequacy decisions cover specific
   jurisdictions (EU-US Data Privacy Framework 2023 + adequacy decisions for
   UK / Switzerland / etc.). Binding Corporate Rules (BCRs) for intra-group.
   Missing valid mechanism = LOAD-BEARING violation.
4. **Data-protection counsel not engaged.** Every jurisdiction has quirks —
   DPO (Data Protection Officer) appointment requirements (GDPR + several
   others), DPIA (Data Protection Impact Assessment) triggers, breach-
   notification timelines (GDPR 72 hours; varies), local-representative
   requirements. Skipping counsel = LOAD-BEARING.
5. **DPA (Data Processing Agreement) not in place with processors.** GDPR
   Article 28 + equivalent provisions in other regimes require DPA between
   controller + each processor. Missing DPA = compliance failure per
   regulator.
6. **China PIPL CAC security assessment blindness.** Chinese Personal Information
   Protection Law (2021) requires CAC (Cyberspace Administration of China)
   security assessment for certain cross-border transfers OR standard contract
   filing OR certification. Missing = potential Chinese regulatory action +
   local counsel exposure.
7. **Individual crisis DURING data-residency scoping conversation.** Team
   members handling breach-response or regulatory-inquiry stress can coincide
   with personal distress. HARD BOUNDARY per Universal Principle 3.

canopy uses this skill as Phase 4 of any regulatory-scoping workflow — parallel
with entity-setup + tax-registration + employment-law.

## When to Use

Trigger on:

- "Data residency for [country]" / "data protection registration in [country]"
- "GDPR compliance for [operation]" / "CCPA/CPRA for [California data]"
- "LGPD or PDPA or POPIA or DPDPA scoping"
- "Cross-border data transfer to/from [country]"
- "SCC or adequacy or BCR for [transfer]"
- "Data-processing-agreement for [processor]"
- "PIPL CAC security assessment"
- Handoff from compass (Global Expansion Lead) when market decision touches
  data-processing
- Handoff from warden (Cybersecurity) when technical incident has jurisdictional
  dimension

Do NOT use for:

- **Technical implementation of data-protection controls** (encryption / access
  control / DLP / breach-detection) → warden + veil + bastion (Cybersecurity)
- **Individual data-subject request handling execution** → operator + DPO +
  data-protection counsel (canopy scopes; execution is operational)
- **Breach-response coordination** — routes to warden + operator + counsel per
  breach-response playbook; canopy coordinates on jurisdictional scoping only
- **Privacy policy drafting** — coordinates with lingua `legal-localization`
  for user-facing legal-doc adaptation + data-protection counsel for content
- **HR data residency specifically** — coordinates with hire (P&C Lead) for HR
  data classification; canopy still owns the jurisdiction-mapping
- **Financial data residency** — coordinates with CFO + tax counsel; canopy
  owns jurisdiction-mapping
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The data-residency-mapping workflow combines data-flow mapping + regime scoping
+ transfer mechanism + counsel-first + Cybersecurity handoff:

```
MAJOR DATA-PROTECTION REGIMES (2026 landscape — expanding list)

  EU / UK
    - GDPR (Regulation 2016/679, effective 2018) — EU baseline; extraterritorial
    - UK GDPR (post-Brexit) — mirrors GDPR
    - EU-US Data Privacy Framework (2023) — adequacy decision for US
      participating companies
    - Schrems II (2020) — invalidated Privacy Shield; SCCs require TIA

  US
    - No federal comprehensive privacy law (as of 2026)
    - CCPA (2018) + CPRA (2020) — California
    - VCDPA (Virginia), CPA (Colorado), CTDPA (Connecticut), UCPA (Utah),
      TDPSA (Texas), plus growing state list
    - Sector-specific: HIPAA (healthcare), GLBA (financial), FERPA (education),
      COPPA (children under 13)

  LATAM
    - LGPD (Brazil, 2020) — GDPR-inspired
    - Mexico, Argentina, Chile, Colombia — varying regimes

  ASIA-PACIFIC
    - PIPL (China, 2021) — CAC security assessment for certain transfers
    - PDPA (Singapore 2012 + amendments), PDPA (Thailand 2019 + amendments),
      PDPA (Malaysia)
    - Japan APPI (Act on the Protection of Personal Information)
    - Korea PIPA (Personal Information Protection Act)
    - Australia Privacy Act 1988 + APPs (Australian Privacy Principles)
    - India DPDPA 2023 (Digital Personal Data Protection Act)

  AFRICA
    - POPIA (South Africa, 2020) — comprehensive
    - Nigeria NDPR + Kenya Data Protection Act 2019 — growing regimes

  MIDDLE EAST
    - UAE PDPL 2021 + DIFC + ADGM local variants
    - Saudi Arabia PDPL 2021


CROSS-BORDER TRANSFER MECHANISMS (per GDPR + equivalents)

  ADEQUACY DECISION
    - Third country determined by EU / UK to provide adequate protection
    - Current EU adequacy: Andorra, Argentina, Canada (commercial), Faroe
      Islands, Guernsey, Isle of Man, Israel, Japan, Jersey, New Zealand,
      Republic of Korea, Switzerland, United Kingdom, Uruguay
    - EU-US Data Privacy Framework (2023) for participating US companies

  STANDARD CONTRACTUAL CLAUSES (SCCs)
    - EU SCCs (2021 updated) — 4 modules
    - Requires Transfer Impact Assessment (TIA) post-Schrems II
    - Supplementary measures if TIA finds gap

  BINDING CORPORATE RULES (BCRs)
    - Intra-group transfer mechanism
    - Requires DPA approval (multi-year process)
    - For MNE groups with regular intra-group transfers

  DEROGATIONS (limited use)
    - Explicit consent, contractual necessity, public interest, legal claims
    - GDPR Article 49 — limited applicability

  CHINA PIPL-SPECIFIC
    - CAC (Cyberspace Administration of China) security assessment (high-risk
      transfers)
    - Standard contract filing (medium-risk)
    - Personal information protection certification (voluntary)


DATA-RESIDENCY-MAPPING OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: DATA-FLOW MAPPING                             (what data types + where + who processes)
  Phase 2: APPLICABLE-REGIME SCOPING                     (per jurisdiction per data type)
  Phase 3: LOAD-BEARING DATA-PROTECTION-COUNSEL SCOPING  (canopy scopes; counsel confirms)
  Phase 4: CROSS-BORDER TRANSFER MECHANISM SCOPING       (SCCs / adequacy / BCRs / CAC-assessment)
  Phase 5: HANDOFF TO warden + veil + bastion             (Cybersecurity technical implementation)
```

## Instructions

### Phase 1 — Data-flow mapping

Map data flows across the org:

- **Data types** — customer PII / employee HR data / financial / health /
  children's / biometric / other sensitive-category data
- **Collection points** — which jurisdictions collect what data
- **Storage locations** — which jurisdictions store what data (cloud region /
  on-premises)
- **Processing locations** — which jurisdictions process the data
- **Processor list** — third-party processors handling data (SaaS vendors,
  payment processors, analytics providers, support tools)
- **Cross-border transfers** — where data crosses borders + volume + purpose

Output: data-flow map (diagram + memo) covering all in-scope data types +
jurisdictions.

### Phase 2 — Applicable-regime scoping per jurisdiction

For each data-jurisdiction combination:

- Which regimes apply (may be multiple — EU data subject in US processor triggers
  GDPR + potentially CCPA)
- Extraterritorial reach — GDPR + CCPA + LGPD all have extraterritorial reach
- Data-subject rights per regime (access / deletion / portability / opt-out)
- Breach-notification timelines per regime (GDPR 72 hours; others vary)
- DPO appointment triggers per regime
- DPIA triggers per regime
- Local-representative requirements per regime

Cite IAPP + DLA Piper Handbook + EDPB guidelines + local guidance per
jurisdiction.

### Phase 3 — Local data-protection-counsel scoping (LOAD-BEARING — mandatory)

**Every data-residency scoping decision routes through data-protection counsel.**
canopy scopes counsel-brief; local counsel confirms + refines.

Counsel-brief template:

- Data-flow map (Phase 1)
- Applicable-regime scoping (Phase 2)
- Cross-border transfer flows requiring mechanism
- DPO appointment applicability
- DPIA triggers identified
- Processor DPA status (Phase 4 coordination)
- China PIPL CAC-assessment applicability (if any)
- Timeline expectations
- Budget authorization from operator + CFO

**No data-residency compliance proceeds to execution without data-protection
counsel + Cybersecurity coordination.** Deviation = LOAD-BEARING REFUSAL.

### Phase 4 — Cross-border transfer mechanism scoping

Per cross-border transfer identified in Phase 1:

- **Adequacy decision applicable?** — check current EU/UK adequacy list
- **SCCs required?** — if yes, TIA + supplementary measures assessment
- **BCRs for intra-group?** — if applicable, DPA-approval timeline (multi-year)
- **China PIPL CAC assessment applicable?** — high-risk transfers require CAC
  security assessment (multi-month process)
- **Standard contract filing (China)?** — medium-risk transfers
- **Derogation applicable?** — limited use per GDPR Article 49

**No cross-border transfer proceeds without valid mechanism scoped.**
LOAD-BEARING per Principle 2.

### Phase 5 — Handoff to warden + veil + bastion (Cybersecurity)

canopy scopes JURISDICTIONAL requirements. Cybersecurity implements TECHNICALLY:

- **warden** (Cybersecurity GRC lead) — technical GRC framework alignment (SOC 2 /
  ISO 27001 / ISO 27701) with jurisdictional data-protection requirements
- **veil** (Cybersecurity data protection) — encryption posture + DLP +
  data-classification + access-control implementation per jurisdictional
  requirements
- **bastion** (Cybersecurity infra) — cloud-region selection + on-premises
  data-residency + network-controls per jurisdictional requirements
- Coordination brief includes: applicable regimes + cross-border transfer
  mechanisms + DPO appointment + DPIA outputs + processor DPA list

## Output Format

Each invocation produces one or more of:

- **Data-flow map** — data types × jurisdictions × processors + cross-border
  flows
- **Applicable-regime scoping memo** — per data-jurisdiction combination with
  extraterritoriality + rights + timelines cited
- **Data-protection-counsel scoping brief** — counsel-brief for operator
  authorization + counsel engagement
- **Cross-border transfer mechanism memo** — per-transfer valid mechanism
  identified + TIA outputs where SCCs used
- **DPA status inventory** — processor list + DPA status + gaps identified
- **China PIPL scoping memo** — CAC assessment / standard-contract-filing /
  certification applicability
- **Cybersecurity handoff brief** — jurisdictional requirements for warden +
  veil + bastion technical implementation
- **Cross-agent handoff briefs** — to hire (HR data) + beacon (data-room data)
  + lingua (privacy policy localization) as applicable

## Principles

1. **Never data-residency scoping without data-protection counsel + Cybersecurity
   coordination** — LOAD-BEARING legal fence per Universal Principle 5.
2. **Never cross-border transfer without valid transfer mechanism scoped** —
   LOAD-BEARING. Adequacy / SCCs (with TIA post-Schrems II) / BCRs / CAC-
   assessment per applicability.
3. **Data-flow mapping mandatory Phase 1.** Without knowing WHICH data flows
   WHERE via WHOM, compliance is guesswork.
4. **Extraterritorial-scope analysis mandatory.** GDPR + CCPA + LGPD + others
   apply beyond their home jurisdiction; missing extraterritorial reach =
   surprise-liability.
5. **DPO / DPIA / local-representative requirements per jurisdiction.**
   Jurisdiction-specific triggers evaluated per regime.
6. **DPA (Data Processing Agreement) inventory maintained** for every
   processor. GDPR Article 28 + equivalents.
7. **Breach-notification timelines pre-scoped** — 72 hours (GDPR) / varies.
   Canopy scopes; warden operational-implements; both coordinate BEFORE any
   breach.
8. **China PIPL CAC-assessment scoped** for applicable transfers. Multi-month
   process = pre-scope before transfer needed.
9. **No fabrication** — cited institutional sources (IAPP + Bird & Bird +
   DLA Piper + EDPB + NIST + OECD). Universal Principle 1.
10. **Aggregate-only at publication surface** — Universal Principle 2.
    Individual data-subject-request details NEVER surfaced through canopy
    outputs.
11. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
12. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
    `logical/README.md`.

## Fallback

- **Data-protection counsel unavailable in jurisdiction.** Route to operator +
  IAPP-network referral. Do NOT proceed without counsel — LOAD-BEARING.
- **Cross-border transfer without valid mechanism identified.** DEFER
  transfer. Escalate to operator + data-protection counsel. Do NOT proceed
  with transfer until valid mechanism scoped.
- **Uncertainty about extraterritorial-scope applicability.** Route to
  data-protection counsel; default to conservative applicability assumption
  until counsel-confirmed.
- **Processor without DPA in place.** BLOCK use of processor with sensitive
  data until DPA executed. Route to operator + counsel + procurement.
- **Breach-response scoping mid-incident.** Route to warden + operator +
  breach-response counsel per breach-response playbook. canopy scopes
  jurisdictional-reporting-timeline requirements ONLY; execution is warden +
  operator + counsel.
- **China PIPL CAC-assessment pressure to skip.** Decline per Principle 2 +
  8 — LOAD-BEARING. Escalate to operator + Chinese local counsel.
- **Regulatory inquiry received** from a data-protection authority. Route to
  operator + local data-protection counsel + potentially litigation counsel.
- **Individual crisis signal during data-residency conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `entity-setup-by-jurisdiction` (custom, canopy — sibling) | Data-protection registration coordination at entity setup | Parallel workstream |
| `tax-registration` (custom, canopy — sibling) | Financial-data-residency coordination | Parallel workstream |
| `employment-law-multi-jurisdiction` (custom, canopy — sibling) | HR-data-residency coordination | Parallel workstream |
| `warden` (Cybersecurity GRC Lead) | Technical GRC framework alignment (SOC 2 / ISO 27001 / ISO 27701) with jurisdictional requirements | Downstream — clear scope split: canopy scopes LEGAL; warden implements TECHNICAL GRC |
| `veil` (Cybersecurity data protection) | Encryption posture + DLP + data-classification + access-control per jurisdictional requirements | Downstream |
| `bastion` (Cybersecurity infra) | Cloud-region selection + on-premises data-residency + network-controls | Downstream |
| `payroll-and-eor` + hire (P&C Lead) | HR-data classification + jurisdictional coordination | Cross-department |
| `data-room-discipline` (custom, beacon — Comms & PR) | Data-room-specific data-residency (PII in DD documents) | Cross-department coordination |
| `product-localization` + `marketing-localization` + `legal-localization` (custom, lingua — Global Expansion sibling) | Privacy-policy localization + data-subject-rights notices | Coordination |
| compass (Global Expansion Lead) | Ghemawat-flavored legal-distance discipline — jurisdictional data-protection differences as first-class distance | Upstream inherited |
| Operator + data-protection counsel per jurisdiction | LOAD-BEARING for every data-residency scoping decision | Escalation — Principle 1 |
| Operator + Chinese local counsel | China PIPL CAC-assessment scoping | Escalation |
| Operator + breach-response counsel | Breach-response coordination | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every canopy artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [IAPP — Global Privacy Directory](https://iapp.org/resources/global-privacy-directory/)
- [DLA Piper — Data Protection Laws of the World (FREE)](https://www.dlapiperdataprotection.com/)
- [Bird & Bird — Global Data Protection Handbook](https://www.twobirds.com/en/expertise/privacy-and-data-protection)
- [EDPB — Guidelines + Decisions](https://edpb.europa.eu/edpb_en)
- [EDPB — SCCs guidance (Recommendations 01/2020 post-Schrems II)](https://edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-012020-measures-supplement-transfer_en)
- [EU-US Data Privacy Framework](https://www.dataprivacyframework.gov/)
- [NIST Privacy Framework (FREE)](https://www.nist.gov/privacy-framework)
- [OECD Privacy Guidelines (FREE)](https://www.oecd.org/sti/ieconomy/oecdguidelinesontheprotectionofprivacyandtransborderflowsofpersonaldata.htm)
- [CAC — Personal Information Cross-Border Transfer](http://www.cac.gov.cn/)
- [California Attorney General — CCPA/CPRA](https://oag.ca.gov/privacy/ccpa)
