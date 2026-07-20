---
name: data-classification
type: marketplace (verbatim copy — unaltered per playbook §4.8)
source: Hack23 / cia collection
source_url: https://skillsmp.com/zh/skills/hack23-cia-github-skills-classification-policy-skill-md
status: verbatim copy of Hack23 classification-policy skill
assigned_agent: veil (Cybersecurity / Data Privacy & Protection)
fulfills_catalog_entry: data-classification — PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED tiers (CYBERSECURITY-REDESIGN-PLAN-v2 §5.1)
note_from_build: This is a verbatim marketplace adoption, unaltered. 4-tier classification (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED), ISO 27001 A.5.12 aligned, CIA triad mapping, decision tree for classification, GDPR/privacy classification for special category data. Supplementary: Hack23 data-classification skill (implementation variant with handling matrix) available in the same collection.
portable: true
date_added: 2026-07-12
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "**Examples:** - Published marketing materials - Public press releases - Public website content - Published research…"
triggers: [data classification]
---

# Classification Policy

## Introduction
Risk-based data and asset classification framework that defines how information is categorized, handled, and protected based on its sensitivity and criticality to the organization. This classification system ensures that appropriate security controls are applied proportional to the value and risk associated with each asset.

## Purpose
Without clear classification, all data is treated equally — which means either sensitive data is under-protected or low-risk data is over-protected (wasting resources). A classification framework ensures that data protection resources are applied where they matter most, and that everyone in the organization understands how to handle each type of information.

## When to Use
- Classifying a new dataset, system, or information asset.
- Determining what security controls apply to a specific data type.
- Onboarding a new vendor or partner — what data will they handle?
- Training or policy documentation — helping teams understand classification.
- Auditing existing data storage and handling practices.

## Classification Tiers

### PUBLIC
**Definition:** Information that is explicitly approved for public release. No confidentiality requirement; integrity and availability may still be relevant.

**Examples:**
- Published marketing materials
- Public press releases
- Public website content
- Published research papers

**Security Controls:**
- Integrity controls to prevent unauthorized modification
- Availability controls per business need
- No confidentiality restrictions

### INTERNAL
**Definition:** Information that is not sensitive but is not intended for public distribution. Internal business operations data.

**Examples:**
- Internal policies and procedures
- Organizational charts
- Internal communications (non-sensitive)
- General operational data

**Security Controls:**
- Access limited to employees and authorized contractors
- Basic access controls (authentication required)
- No unauthorized external distribution

### CONFIDENTIAL
**Definition:** Sensitive business information whose unauthorized disclosure could cause moderate harm to the organization, its customers, or its partners.

**Examples:**
- Customer personally identifiable information (PII)
- Financial records and reports
- Business plans and strategies
- Intellectual property (not trade secret)
- Employee HR data

**Security Controls:**
- Access on a strict need-to-know basis
- Encryption at rest and in transit
- Data Loss Prevention (DLP) monitoring
- Access logging and auditing
- Minimum 5 years retention for audit/compliance data

### RESTRICTED
**Definition:** Highly sensitive information whose unauthorized disclosure could cause severe harm, including legal liability, regulatory penalties, or significant competitive disadvantage.

**Examples:**
- Trade secrets and core IP
- Passwords, cryptographic keys, credentials
- Board communications and strategic M&A data
- Health records / special category data (GDPR Art. 9)
- Payment card data (PCI DSS scope)

**Security Controls:**
- Strict need-to-know + formal access approval
- Strong encryption (AES-256 or equivalent) at rest and in transit
- Hardware Security Module (HSM) for cryptographic material where applicable
- Continuous monitoring and alerting
- Mandatory access logging with alerting on unauthorized access attempts
- Data retention: minimum 7 years or per regulatory requirement

## Classification Decision Tree
1. Is the information explicitly approved for public release? → **PUBLIC**
2. Is the information intended only for internal use? → **INTERNAL**
3. Would unauthorized disclosure cause harm? Yes → **CONFIDENTIAL**
4. Would unauthorized disclosure cause severe harm (legal, financial, reputational)? Yes → **RESTRICTED**
5. Is it special category data (health, biometric, political, religious)? → **RESTRICTED** (or as required by regulation)

## Data Handling Requirements

| Action | PUBLIC | INTERNAL | CONFIDENTIAL | RESTRICTED |
|---|---|---|---|---|
| **Storage** | No restriction | Standard storage | Encrypted storage | Encrypted + access controlled |
| **Transmission** | No restriction | TLS recommended | TLS required | TLS + additional controls |
| **Retention** | As needed | As needed | Min 5 years | Min 7 years or regulatory |
| **Disposal** | No restriction | Standard secure deletion | Secure deletion (overwrite) | Physical destruction or certified wipe |
| **Access logging** | Not required | Recommended | Required | Required + alerting |
| **Third-party sharing** | No restriction | NDA required | NDA + security assessment | NDA + assessment + contractual controls |

## Output Format
```
## Data Classification: [asset/data set name]
Classification: [PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED]
Rationale: [decision tree path used]
Handling: [storage · transmission · retention · disposal]
Access: [who can access · how access is granted · review cadence]
Regulatory: [applicable regulations / special category flags]
```

## Principles
1. **Classify at creation.** Every piece of data should be classified when it's created, not retroactively.
2. **When in doubt, default higher.** If the classification isn't clear, mark it CONFIDENTIAL until reviewed.
3. **Protection follows classification.** Security controls are tied to classification tiers — automate enforcement where possible.
4. **Review and reclassify.** Data sensitivity changes over time; periodic reviews ensure classification remains accurate.
5. **Classification without handling is theatre.** A label without enforcement is meaningless.

## Fallback
- **Unclassified data** → treat as INTERNAL by default; flag for classification review.
- **Mixed classification in a dataset** → treat at the highest applicable tier.
- **Regulatory override** — if a regulation requires stricter handling than the classification suggests, the regulation wins (e.g., GDPR for EU personal data even if classified INTERNAL).

## Boundaries with Other Skills
- **veil's privacy-by-design** (sibling): uses these classification tiers as input for DPIA and privacy controls.
- **veil's DLP** (sibling): DLP policies enforce egress controls per classification tier.
- **veil's breach-notification** (sibling): classification determines severity of breach notification obligations.
- **dana (Engineering)**: data store designs implement the encryption and access controls per tier.
- **warden**: classification gaps (unclassified data, incorrect tiers) are register risks.
- **Hack23/cia companion skills**: `data-protection`, `data-classification`, `gdpr`, `privacy-policy` all reference these tiers.
