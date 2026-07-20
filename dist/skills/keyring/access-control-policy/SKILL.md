---
name: access-control-policy
agent: keyring
department: Cybersecurity
version: 1.1.0
tier: 2
description: |
  Reviews verify that each grant is still needed, identify and revoke unused or excessive access, and detect dormant or orphaned accounts. (yvon)
triggers:
  - access control policy
allowed-tools:
  - <FILL_IN: not listed in keyring-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/keyring/marketplace/access-control-policy/SKILL.md
  source_hash: 96c7986e6d92c70abdfdb5bd8b627b7fa6998f02dfdfb42b7fd62e621ae99530
  generated: 2026-07-20T03:20:23.117Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/keyring/marketplace/access-control-policy/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js keyring -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: keyring — Cybersecurity · skill: access-control-policy"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"access-control-policy\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Designing or reviewing the access control model for a system, application, or data store.
- Determining authentication requirements (MFA method, session timeout) for a given asset classification.
- Setting up or auditing role-based access control (RBAC) structures.
- Planning or conducting quarterly access reviews.
- Investigating potential privilege creep or dormant accounts.

## Purpose

Access control is the most fundamental security control — if you don't know who can access what, and you don't verify that access is still needed, you are operating on trust rather than verification. A structured access control policy with clearly defined tiers, authentication requirements, and review cadences turns access from a source of risk into a managed process.

## Protocol

# Access Control Policy

## Introduction
Identity and access management grounded in zero-trust principles: RBAC, least privilege, MFA enforcement, and quarterly access reviews aligned with ISO 27001 (A.5.15, A.8.2, A.8.3). This policy defines who can access what, how they authenticate, how often access is reviewed, and how exceptions are handled.

## Purpose
Access control is the most fundamental security control — if you don't know who can access what, and you don't verify that access is still needed, you are operating on trust rather than verification. A structured access control policy with clearly defined tiers, authentication requirements, and review cadences turns access from a source of risk into a managed process.

## When to Use
- Designing or reviewing the access control model for a system, application, or data store.
- Determining authentication requirements (MFA method, session timeout) for a given asset classification.
- Setting up or auditing role-based access control (RBAC) structures.
- Planning or conducting quarterly access reviews.
- Investigating potential privilege creep or dormant accounts.

## Access Control Matrix

| Asset Category | Classification | Access Method | MFA Requirement | Session Timeout | Review Frequency |
|---|---|---|---|---|---|
| RESTRICTED Data | Extreme | Hardware MFA + Zero Trust | FIDO2 + Backup | 1 hour | Monthly |
| Cloud Infrastructure | Very High | Identity Center SSO | Hardware + TOTP | 4 hours | Monthly |
| Development Platform | High | Platform MFA + SSH Keys | TOTP + SSH Cert | 8 hours | Quarterly |
| Financial Systems | Very High | Provider MFA | Hardware Token | 1 hour | Monthly |
| Business Intelligence | Moderate | SSO Integration | TOTP | 24 hours | Semi-Annual |
| Marketing Platforms | Public/Internal | Platform Native | Platform MFA | 7 days | Annual |

## Core Principles

### Role-Based Access Control (RBAC)
Access is granted based on job function, not identity. Each role has a defined set of permissions, and users are assigned to roles rather than directly to permissions. This ensures consistency, auditability, and ease of review.

### Least Privilege
Every identity — human or machine — gets the minimum access required to perform its function. No more. The default answer is "no"; access must be justified and documented to be granted.

### Multi-Factor Authentication (MFA)
All interactive human access requires MFA. The method scales with the sensitivity of the asset:
- **FIDO2 hardware keys** for restricted and critical systems
- **TOTP + hardware key** for cloud infrastructure
- **TOTP + platform MFA** for development platforms
- **Platform MFA** for standard business systems

### Regular Access Reviews
Access is reviewed on a schedule that matches the sensitivity of the asset:
- **Monthly**: Restricted data, cloud infrastructure, financial systems
- **Quarterly**: Development platforms
- **Semi-Annual**: Business intelligence
- **Annual**: Marketing and public-facing platforms

Reviews verify that each grant is still needed, identify and revoke unused or excessive access, and detect dormant or orphaned accounts.

## Zero-Trust Architecture
The access control model assumes zero implicit trust. Every access request is authenticated, authorized, and encrypted — regardless of whether it originates from inside or outside the network perimeter. Key architectural components:

1. **Identity Provider (IdP)** — single source of identity truth with MFA enforcement
2. **Cloud Infrastructure** — AWS Identity Center, IAM Roles, Federated Accounts with permission boundaries
3. **Development** — GitHub Organization with SSO, CI/CD with scoped service accounts
4. **Business Systems** — Financial, Marketing, and Security tools with tiered MFA requirements

## Procedures

### Quarterly Access Review Process
1. **Inventory**: List all human and machine identities in scope.
2. **Compare**: Current access against role-based entitlements.
3. **Identify**: Over-provisioned accounts, dormant accounts, role mismatches.
4. **Review**: Each finding is reviewed with the data/asset owner.
5. **Remediate**: Unjustified access is revoked (revoke-then-appeal).
6. **Document**: Results are logged; systemic issues are escalated.

### Dormant Account Detection
Accounts with no authentication activity for 90+ days are flagged as dormant. Dormant accounts are automatically disabled after notification to the account owner and manager. Disabled accounts are deleted after an additional 90 days unless explicitly reactivated.

### Break-Glass Procedure
Emergency high-privilege access is:
- Pre-defined and pre-authorized for named scenarios
- Time-limited (auto-revokes after the approved window)
- Monitored in real-time (alert on use)
- Reviewed after every use to confirm necessity
- Logged with full detail for audit

## Output Format
```
## Access Control Review: [scope/system]
Asset classification: [tier per matrix]
MFA requirement: [method] · Session timeout: [duration]
Review cadence: [frequency] · Last review: [date]
Findings: [over-provisioned accounts · dormant accounts · role mismatches]
Remediation: [revoked · notified · escalated to warden]
Break-glass events since last review: [count · reviewed?]
```

## Principles
1. **Least privilege is the default** — access must be justified, not assumed.
2. **MFA is mandatory for all interactive human access** — method scales with asset sensitivity.
3. **Access without review is a risk** — review cadences exist for every tier; missed reviews are findings.
4. **Zero trust means zero implicit trust** — every request is authenticated and authorized.
5. **Dormant accounts are risks** — if it hasn't been used in 90 days, it's disabled.
6. **Break-glass is defined, not ad-hoc** — emergency access is pre-planned, monitored, and reviewed.

## Fallback
- No IdP in place → document access in a manual matrix; label all controls as "manual — provisional until IdP implemented."
- Unable to enforce MFA on a system → flag as an exception with compensating controls and a time-boxed remediation plan.
- Organization too small for quarterly reviews → extend to bi-annual with the understanding that the risk is accepted.

## Boundaries with Other Skills
- **classification-policy** (Hack23/cia companion): defines the PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED tiers this skill references.
- **information-security-policy** (Hack23/cia companion): overarching ISMS policy that this skill implements.
- **iso-27001-controls** (Hack23/cia companion): maps specific controls for audit evidence.
- **keyring's identity-lifecycle** (Cybersecurity): operational JML workflow that operates within this policy framework.
- **keyring's access-reviews** (Cybersecurity): periodic recertification that implements this skill's review cadence.
- **relay** (AI & Agents): applies same least-privilege doctrine to agent/machine identity.
- **warden** (Cybersecurity): access control gaps and review findings are risks in warden's register.

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"access-control-policy\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
