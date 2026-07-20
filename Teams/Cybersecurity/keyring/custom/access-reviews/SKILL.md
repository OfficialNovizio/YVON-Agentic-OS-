---
name: access-reviews
type: custom (merge — Hack23 review procedures + custom access_review.py script)
status: rebuilt 2026-07-12 — merged Hack23 access-control-policy review methodology with custom automated diff
based_on_catalog_entry: none — new; periodic least-privilege recertification (CYBERSECURITY-REDESIGN-PLAN-v2 §2.2)
sources_merged:
  - Hack23 access-control-policy (skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md) — access review methodology: quarterly cadence, dormant account detection (90-day threshold), 6-tier review frequencies (monthly for RESTRICTED/infra/finance → annual for marketing), break-glass post-review.
  - Custom access_review.py — existing tested script for automated baseline-vs-actual entitlement diff, orphan detection, over-grant computation.
note: Marketplace source is integrated into this custom merge per playbook §4.6 and §4.8. The Hack23 skill provides the review process framework (cadence methodology, dormant thresholds, break-glass post-review). The access_review.py provides deterministic diff computation. "Revoke-then-appeal" is fleet IP.
assigned_agent: keyring (Cybersecurity / Identity & Access Management)
portable: true
includes: scripts/access_review.py (tested)
date_added: 2026-07-10
date_rebuilt: 2026-07-12
---

# Access Reviews (Recertification)

## Introduction
The periodic check that everyone still needs the access they have — catching the privilege creep, orphaned accounts, and over-grants that JML discipline misses over time. Reviews follow the **Hack23 access-control-policy** framework (6-tier asset classification → monthly/quarterly/semi-annual/annual review cadences, 90-day dormant account detection threshold), with automated baseline-vs-actual diffing via `scripts/access_review.py`. Each identity's actual entitlements are compared against a least-privilege baseline for their role, and excess is flagged for the operator to revoke (revoke-then-appeal).

**Review methodology sourced from:** Hack23 access-control-policy (6-tier review cadences, dormant account detection, break-glass post-review). **Automated diff:** custom access_review.py.

## Purpose
Access only ever accumulates without reviews: people change projects, keep old access, and years later everyone can touch everything. Recertification resets least privilege on a cadence — and the "does this person still need this?" question, asked regularly, is the cheapest breach-blast-radius reducer there is.

## When to Use
- The review cadence fires (per Hack23 matrix: **monthly** for RESTRICTED/Cloud Infra/Financial Systems, **quarterly** for Development, **semi-annual** for BI, **annual** for Marketing).
- After a reorg or major role changes (bulk creep).
- A high-privilege set needs recertification (monthly per Hack23 matrix).
- Dormant account sweep (90+ days no activity — per Hack23 threshold).

## Structure / Protocol

```
REVIEW SCOPE (per Hack23 cadence: which asset tiers due this cycle)
  → BASELINE (per role, least-privilege entitlement set from identity-lifecycle's role access sets)
    → COMPARE (each identity's actual entitlements vs role baseline — scripts/access_review.py diffs)
      → OVER-GRANTS (actual minus baseline → revoke)
      → ORPHANS (accounts with no role → flag to warden)
      → DORMANT (>90d no auth → disable per Hack23 threshold)
        → RECERTIFY (access owner confirms each grant or flags for removal)
          → REVOKE-THEN-APPEAL (unjustified grant = revoked by default)
            → LOG + FEED WARDEN (systemic creep → register risk)
```

## Instructions

### Phase 1 — Scope (Hack23 cadence)
1. **Determine which asset tiers are due for review.** Per the Hack23 access control matrix:
   - **Monthly**: RESTRICTED Data, Cloud Infrastructure, Financial Systems
   - **Quarterly**: Development Platforms
   - **Semi-Annual**: Business Intelligence
   - **Annual**: Marketing Platforms
2. **Check for dormant accounts.** Per Hack23, accounts with no authentication activity for 90+ days are flagged as dormant. These are disabled after notification — never left active.

### Phase 2 — Diff (Custom Script)
3. **Baseline first.** A review needs a least-privilege baseline per role to compare against; without it you're just re-approving whatever exists. The baseline comes from identity-lifecycle's role access sets.
4. **Diff, don't eyeball.** `access_review.py` computes actual-minus-baseline (over-grants), baseline-minus-actual (under-grants, rare), orphans (accounts with no role), and dormant flags (90-day threshold) — so reviews are complete and repeatable, not a spot-check.

### Phase 3 — Recertify
5. **Revoke-then-appeal.** A grant no owner will justify is removed by default; the burden is on keeping access, not on removing it (Fleet Charter Rail 2's doctrine for agents, applied to people). "Might need it someday" is not justification.
6. **Break-glass events reviewed.** Per Hack23 practice, any break-glass use since the last review is post-reviewed — was it necessary? was it logged? could it have been avoided?

### Phase 4 — Report
7. **keyring diffs + recommends; operator revokes.** The security-inversion — keyring produces the review and the revocation list; the operator/IdP executes.
8. **Systemic creep is a risk.** If reviews keep finding the same over-grants, the role baseline is wrong or JML is slipping — surfaced to warden's register, not just re-revoked each cycle.

## Output Format
```
## Access Review: [scope] — [date]
Asset tiers reviewed: [per Hack23 matrix] · Cadence: [monthly/quarterly/etc.]
Baseline source: [role access sets] · Reviewed: [n identities]
Over-grants (revoke): [identity · entitlement · no-justification] → operator
Orphans / role-mismatches: [flags → warden register]
Dormant accounts (>90d): [identity · last auth] → disable
Recertified (kept + justified): [n] · Executed by: operator/IdP
Break-glass events since last review: [count · reviewed?]
Systemic creep? [pattern → warden]
```

## Principles
- **Hack23 cadences** — review frequency tied to asset classification; monthly for critical, annual for low-risk.
- **Baseline-driven** — compare to least-privilege, not to the status quo.
- **Diff, don't eyeball** — script-computed, complete, repeatable.
- **Revoke-then-appeal** — the burden is on keeping access.
- **Dormant = disabled** — 90-day threshold; silence = gone.
- **Break-glass = post-reviewed** — every emergency access event is reviewed.
- **Systemic creep = risk to warden** — same pattern recurring means the baseline is wrong.

## Fallback
- No role baselines exist → build provisional baselines from current-minus-excess; sharpen over cycles. Labeled "provisional — awaiting role definitions."
- No Hack23 skill installed → use general access review best practices, labeled "no authoritative policy framework — reasoning-based." Surface the Hack23 skill for adoption.
- Too many entitlements to review at once → prioritize high-privilege + crown-jewel-system access first (risk-based), rest on rolling schedule.

## Boundaries with Other Skills
- **identity-lifecycle** (sibling): supplies the role baselines that are the review's reference; reviews catch what JML missed (creep, orphans).
- **Hack23 access-control-policy** (marketplace reference): provides review cadences, dormant detection thresholds, and break-glass post-review methodology — unaltered per §4.8.
- **privileged-access-management** (sibling): privileged entitlements reviewed on the shortest monthly cadence.
- **warden**: systemic creep, orphan accounts, and repeated over-grants are register risks.
- **relay (AI & Agents)**: same revoke-then-appeal cadence for agent identity (Rail 2).
