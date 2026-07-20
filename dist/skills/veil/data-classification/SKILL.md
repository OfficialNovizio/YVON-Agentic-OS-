---
name: data-classification
agent: veil
department: Cybersecurity
version: 1.1.0
tier: 2
description: |
  **Examples:** - Published marketing materials - Public press releases - Public website content - Published research… (yvon)
triggers:
  - data classification
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/veil/marketplace/data-classification/SKILL.md
  source_hash: 18263b6065774f1c3249d94e660317435b54713c818dec2694ae8ca699906570
  generated: 2026-07-20T03:20:23.168Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/veil/marketplace/data-classification/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js veil -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: veil — Cybersecurity · skill: data-classification"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"veil\",\"skill\":\"data-classification\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Classifying a new dataset, system, or information asset.
- Determining what security controls apply to a specific data type.
- Onboarding a new vendor or partner — what data will they handle?
- Training or policy documentation — helping teams understand classification.
- Auditing existing data storage and handling practices.

## Purpose

Without clear classification, all data is treated equally — which means either sensitive data is under-protected or low-risk data is over-protected (wasting resources). A classification framework ensures that data protection resources are applied where they matter most, and that everyone in the organization understands how to handle each type of information.

## Protocol

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

## Boundaries & handoffs

CLASSIFY ─► data-classification (Hack23 classification-policy — 4-tier PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED)

## Output format

```

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"veil\",\"skill\":\"data-classification\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
