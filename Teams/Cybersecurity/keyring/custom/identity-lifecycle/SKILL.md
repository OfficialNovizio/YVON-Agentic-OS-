---
name: identity-lifecycle
type: custom (wraps marketplace policy base + custom JML workflow)
status: rebuilt 2026-07-12 — wraps Hack23 access-control-policy as policy base; JML operational workflow remains custom
based_on_catalog_entry: none — new; human/infra identity JML (CYBERSECURITY-REDESIGN-PLAN-v2 §2.1)
marketplace_packs_referenced:
  primary: Hack23 access-control-policy (skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md) — ISO 27001-aligned RBAC, least privilege, MFA framework. Ships access control matrix (6 asset categories → MFA method, session timeout, review frequency), zero-trust architecture, dormant account detection, break-glass procedures. Unaltered per §4.8.
note: The Hack23 skill supplies the authoritative policy framework (RBAC design, MFA requirements, zero-trust architecture, ISO 27001 mapping, access control matrix). This skill adds the operational JML workflow (joiner/mover/leaver step-by-step, leaver-deprovision-ALL emphasis, reconciliation discipline) that the policy skill doesn't cover.
assigned_agent: keyring (Cybersecurity / Identity & Access Management)
portable: true — the lifecycle is IdP-agnostic; the IdP is config
includes: assets/jml-checklist.md
date_added: 2026-07-10
date_rebuilt: 2026-07-12
---

# Identity Lifecycle (Joiner-Mover-Leaver)

## Introduction
The disciplined management of *human* identity across its life, built on the **Hack23 access-control-policy** framework for the policy layer (RBAC, zero-trust, MFA, ISO 27001-aligned access control matrix) with a custom operational JML workflow for the execution layer (joiner/mover/leaver step-by-step). A joiner gets exactly the access their role needs, a mover's old access is removed as new is added, and a **leaver is fully deprovisioned — promptly.** keyring designs and recommends this; the operator (or the IdP) executes the grant/revoke — keyring holds no keys (the security-inversion).

**Policy framework sourced from:** Hack23 access-control-policy (ISO 27001 A.5.15, A.8.2, A.8.3 aligned). The access control matrix (6-tier asset classification → MFA method, session timeout, review frequency), zero-trust architecture, and dormant account detection come from the Hack23 skill, unaltered. The JML operational workflow below is custom.

## Purpose
The single loudest identity gap in every breach report is the **departed employee (or contractor) with live access** — accounts that were never deprovisioned, becoming an unmonitored way in. JML discipline closes it, and keeps least-privilege true as people change roles rather than accumulating access forever (privilege creep).

## When to Use
- Someone joins, changes role, or leaves (the JML events).
- "Provision access for X," "did we deprovision Y," "why does Z still have access."
- Periodic reconciliation (accounts vs actual people — orphan detection).
- Referencing the Hack23 access control matrix for MFA requirements, session timeouts, and review cadences per asset classification.

## Structure / Protocol

```
POLICY LAYER (Hack23 access-control-policy — unaltered reference)
  Asset classification → RBAC model → MFA requirements → zero-trust architecture
  ↓ feeds into
JML WORKFLOW (custom — this skill)
  JOINER (role → least-privilege access set; granted by operator/IdP)
  → MOVER (role change → REMOVE old as new is added; net = current role only)
  → LEAVER (prompt, complete deprovisioning across ALL systems)
  → RECONCILE (accounts ↔ people; orphans/ghosts → warden)
```

## Instructions

### Phase 1 — Policy Reference (Hack23)
1. **Reference the Hack23 access control matrix.** The Hack23 skill defines 6 asset categories (RESTRICTED / Very High / High / Moderate / Low / Public) with corresponding MFA requirements, session timeouts (1hr to 7 days), and review frequencies (monthly to annual). Use this matrix as the policy baseline for all access decisions. Do not derive these from first principles — the Hack23 skill ships them pre-structured.
2. **Apply the zero-trust architecture model.** The Hack23 skill's zero-trust design (Identity Provider → Cloud Infrastructure → Development → Business Systems with tiered MFA and session boundaries) is the architectural starting point. This skill's JML workflow operates within that architecture.

### Phase 2 — JML Workflow (Custom)
3. **Joiner — least privilege on join.** Access derives from the role's defined needs (per the Hack23 access control matrix classification), not "what the last person had" or "everything, to avoid tickets." Over-provisioning on day one is privilege creep's seed.
4. **Mover — lose the old as they gain the new.** A role change is not additive; the old role's access is removed. The employee who's been at the company five years and can access everything is a mover-discipline failure.
5. **Leaver — deprovisioned promptly and completely.** Across every system — the IdP, SaaS not behind SSO, shared/service accounts, API keys they held. A partial deprovision is an open door. Time-to-deprovision is a tracked metric. This is the single most important step in this skill.
6. **Reconcile accounts to people.** On cadence, every account maps to a current person with a current need; orphans (no owner), ghosts (departed), and shared logins are flagged as risks (→ warden's register).
7. **keyring recommends; the operator/IdP executes.** keyring designs the access sets and the JML workflow and detects gaps; it does not itself hold the keys or push the grant/revoke (the inversion — a security agent that could grant itself access is the risk).
8. **Everything logged.** Grants, revokes, and role changes are auditable; an access change with no record is itself a finding.

## Output Format
```
## JML: [event — joiner/mover/leaver] — [person/role]
Policy baseline (Hack23): [asset classification → MFA requirement → session timeout → review cadence]
Access set: [role → least-privilege list] · Change: [grant/revoke/both]
Systems covered: [IdP + SaaS + shared/service accounts + keys — leaver = ALL]
Executed by: operator/IdP (keyring specs) · Logged: [ref]
Reconciliation flags: [orphans/ghosts/shared → warden register]
```

## Principles
- **Policy from Hack23** — access control matrix, zero-trust architecture, MFA requirements. Unaltered per §4.8.
- **Least privilege on join; no "everything to be safe."**
- **Movers lose the old** — role change isn't additive; privilege creep is the enemy.
- **Leavers deprovisioned promptly + completely** — the departed-with-access gap is the loudest.
- **Reconcile accounts to people** — orphans/ghosts/shared are risks.
- **keyring specs; operator executes** — the security-inversion.
- **Every change logged** — an unlogged access change is a finding.

## Fallback
- No IdP / SSO yet → maintain a manual access matrix (person × system × access), reconciled on cadence; the discipline holds even without automation, labeled manual.
- No Hack23 skill installed → fall back to general RBAC principles, labeled "no authoritative policy framework — reasoning-based." Surface the Hack23 skill for adoption.
- Can't fully deprovision immediately (technical constraint) → disable/isolate the account first (fail-safe), complete deprovisioning promptly, log the gap as a time-boxed exception (warden).

## Boundaries with Other Skills
- **access-reviews** (sibling): periodic recertification catches what JML missed (creep, orphans). Also references Hack23 access-control-policy.
- **privileged-access-management** (sibling): privileged accounts get stricter JML.
- **Hack23 access-control-policy** (marketplace reference): the policy framework this skill wraps — unaltered, in `marketplace/` or adopted-by-reference.
- **relay (AI & Agents)**: relay owns AGENT identity/tool-grants; keyring owns HUMAN + infra identity — same least-privilege doctrine, different subjects.
- **warden**: reconciliation flags and deprovisioning gaps are risks in warden's register.
- **future People & Culture**: the authoritative joiner/leaver signal (HR) feeds keyring; keyring consumes it, doesn't own HR.
