---
name: privacy-by-design
agent: veil
department: Cybersecurity
version: 1.1.0
tier: 2
description: |
  **Article 5 — Principles:** - Lawfulness, fairness, transparency - Purpose limitation - Data minimisation - Accuracy - Storage limitation (retention limits… (yvon)
triggers:
  - privacy by design
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/veil/marketplace/privacy-by-design/SKILL.md
  source_hash: 844eec840bb1b51584b5d69ceee765d1f96c47de3ee425875562677351b5a37c
  generated: 2026-07-20T03:20:23.171Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/veil/marketplace/privacy-by-design/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js veil -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: veil — Cybersecurity · skill: privacy-by-design"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"veil\",\"skill\":\"privacy-by-design\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Designing a new system, feature, or process that handles personal or sensitive data.
- Reviewing an existing system for data protection compliance.
- Responding to a data subject request (access, deletion, portability).
- Preparing for a DPIA (Data Protection Impact Assessment).
- Auditing data handling practices against GDPR or equivalent regulations.

## Purpose

Data protection is not just a compliance checkbox; it's a trust imperative. When customers, partners, and regulators see that data protection is built into how the business operates — not bolted on when an audit looms — they trust the organization with their data. This skill provides the operational controls to make that trust real: encryption, retention limits, access controls, and lifecycle management.

## Protocol

# Data Protection (Privacy by Design)

## Introduction
Enforce data protection across the full lifecycle — from classification and handling through encryption, retention, and disposal — aligned with GDPR principles and industry best practices. This skill implements the "privacy by design" and "privacy by default" obligations under GDPR Article 25, ensuring that data protection is built into systems and processes from the start, not added as an afterthought.

## Purpose
Data protection is not just a compliance checkbox; it's a trust imperative. When customers, partners, and regulators see that data protection is built into how the business operates — not bolted on when an audit looms — they trust the organization with their data. This skill provides the operational controls to make that trust real: encryption, retention limits, access controls, and lifecycle management.

## When to Use
- Designing a new system, feature, or process that handles personal or sensitive data.
- Reviewing an existing system for data protection compliance.
- Responding to a data subject request (access, deletion, portability).
- Preparing for a DPIA (Data Protection Impact Assessment).
- Auditing data handling practices against GDPR or equivalent regulations.

## Data Protection Requirements

### Classification-Based Controls
Data protection controls are applied proportional to the classification of the data:

| Classification | Encryption at Rest | Encryption in Transit | Retention Limit | Access Control |
|---|---|---|---|---|
| PUBLIC | Not required | TLS recommended | As needed | Basic |
| INTERNAL | Not required | TLS required | As needed | Role-based |
| CONFIDENTIAL | Required (AES-256) | TLS 1.2+ required | 5 years | Strict need-to-know |
| RESTRICTED | Required (AES-256 + HSM) | TLS 1.2+ required | 7+ years | Strict + formal approval |

### GDPR Alignment

**Article 5 — Principles:**
- Lawfulness, fairness, transparency
- Purpose limitation
- Data minimisation
- Accuracy
- Storage limitation (retention limits above)
- Integrity and confidentiality (encryption controls above)
- Accountability (logging and documentation below)

**Article 25 — Data Protection by Design and by Default:**
- Privacy controls are built into the system design, not added later
- Default settings are the most privacy-protective
- Data minimisation is the default — collect only what's necessary
- Pseudonymisation where possible

**Article 32 — Security of Processing:**
- Encryption of personal data
- Ability to ensure ongoing confidentiality, integrity, availability, and resilience
- Ability to restore access to data in a timely manner after an incident
- Regular testing of effectiveness of security measures

## Data Lifecycle Controls

### Collection
- Only collect data that is necessary for the stated purpose (data minimisation)
- Obtain consent where required (opt-in, not pre-ticked)
- Document the lawful basis for processing
- Provide clear privacy notice at point of collection

### Storage
- Store at the appropriate classification tier (encryption, access controls applied)
- Retention limit enforced (automatic deletion or archiving)
- Access logged and audited

### Processing
- Purpose limitation — process only for the purpose the data was collected
- Access on a strict need-to-know basis
- Processing logged

### Transfer
- Encryption in transit (TLS 1.2+ minimum)
- Cross-border transfer safeguards (SCCs, adequacy decisions, BCRs)
- Third-party processor agreements in place

### Disposal
- Secure deletion at end of retention period (overwrite for digital, shred for physical)
- Certification of deletion where required
- Retain deletion records per compliance requirements

## Output Format
```
## Data Protection Review: [system/process/data set]
Classification: [tier per classification policy]
GDPR Alignment:
  Article 5 (principles): [compliant / gaps identified]
  Article 25 (by design/default): [compliant / gaps identified]
  Article 32 (security): [compliant / gaps identified]
Encryption: [at rest: method · in transit: TLS version]
Retention: [limit · enforcement mechanism]
Access: [model · logging · review cadence]
Findings: [list of gaps or non-compliant practices]
Remediation: [recommended actions with priorities]
```

## Principles
1. **Privacy by default** — the most privacy-protective settings are the default.
2. **Data minimisation** — collect only what's needed; if you don't need it, don't collect it.
3. **Protection follows data** — encryption, access controls, and retention apply wherever the data goes.
4. **Purpose limitation** — data collected for one purpose is not reused for another without consent or legal basis.
5. **Accountability** — document everything; if it's not documented, it didn't happen.

## Fallback
- **No classification applied** → default to CONFIDENTIAL-level protection until classified; flag for classification review.
- **Legacy system can't meet encryption requirements** → compensating controls (network segmentation, strict access controls) and time-boxed remediation plan; flag as exception to warden.
- **Cross-border transfer without SCCs** → flag as a risk; recommend immediate adoption of Standard Contractual Clauses.

## Boundaries with Other Skills
- **veil's data-classification** (sibling): this skill enforces protection controls based on the classification tiers defined there.
- **veil's DLP** (sibling): DLP enforces egress controls matching these protection requirements.
- **veil's breach-notification** (sibling): data protection incidents may trigger notification obligations.
- **spec/loom (Product)**: DPIA coordination for new features.
- **dana (Engineering)**: implements the encryption and access controls this skill prescribes.
- **warden**: data protection gaps and compliance deficiencies are register risks.

## Boundaries & handoffs

PROTECT ─► privacy-by-design (Hack23 data-protection — GDPR Art. 5/25/32, encryption, retention, access controls)

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"veil\",\"skill\":\"privacy-by-design\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
