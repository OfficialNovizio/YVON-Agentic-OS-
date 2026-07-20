---
name: access-control-policy
type: marketplace (verbatim copy — unaltered per playbook §4.8)
source: Hack23 / cia collection
source_url: https://skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md
status: verbatim copy of Hack23 access-control-policy skill; part of Hack23/cia collection (80 skills)
assigned_agent: keyring (Cybersecurity / Identity & Access Management)
fulfills_catalog_entry: policy framework base for identity-lifecycle and access-reviews (CYBERSECURITY-REDESIGN-PLAN-v2 §2.1, §2.2)
note_from_build: This is a verbatim marketplace adoption. No content has been altered. Provides the ISO 27001-aligned RBAC/least-privilege/MFA policy framework, 6-tier access control matrix, zero-trust architecture, dormant account detection, and quarterly review procedures. Referenced by keyring's custom identity-lifecycle and access-reviews skills as the policy layer.
portable: true
date_added: 2026-07-12
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "Reviews verify that each grant is still needed, identify and revoke unused or excessive access, and detect dormant or orphaned accounts."
triggers: [access control policy]
---

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
