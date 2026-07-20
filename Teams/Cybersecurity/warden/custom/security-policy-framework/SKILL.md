---
name: security-policy-framework
type: custom (wraps marketplace packs)
status: rebuilt 2026-07-12 — primary pack updated to GRCEngClub
based_on_catalog_entry: none — new; the ISMS control layer (CYBERSECURITY-REDESIGN-PLAN-v2 §1.1)
marketplace_packs_referenced:
  primary: GRCEngClub/claude-grc-engineering (skillsmp.com/creators/grcengclub/claude-grc-engineering) — 96 GRC skills: NIST CSF 2.0, ISO 27001, SOC 2, CIS Controls, CMMC, FedRAMP, PCI DSS, per-framework expert skills, diagram builders. © GRCEngClub community. Runtime-installed per config `control_standard`.
  secondary: Hack23/cia (skillsmp.com/creators/hack23/cia) — 80 collected skills: ISO 27001 controls, NIST CSF 2.0, CIS v8.1, EU CRA, compliance checklists, classification policy, ISMS compliance.
  previous: Sushegaad/Claude-Skills-Governance-Risk-and-Compliance (github.com/Sushegaad) — MIT, © Hemant Naik. Per-framework .skill packages. Still supported as an alternative pack if operator prefers.
note: The referenced marketplace packs are adopted-by-reference at runtime, unaltered per playbook §4.8. This skill is the custom wrapping layer (mapping + ownership + gap-tracking) that the packs don't provide.
assigned_agent: warden (Cybersecurity / CISO — leader)
portable: true — the framework is config; the ISMS method is standard-agnostic
includes: assets/isms-policy-index.md
date_added: 2026-07-10
date_rebuilt: 2026-07-12
---

# Security Policy Framework (the ISMS)

## Introduction
warden's ISMS: the Information Security Management System — the org's security control catalog mapped to a chosen standard (NIST CSF / ISO 27001 / SOC 2 / CIS), the policy set that implements it, and the mapping from controls to the agents/operators who own them. The **control content** comes from the marketplace GRC pack for the chosen standard; **this skill wraps it** with the mapping, ownership, and gap-tracking the pack doesn't provide.

## Purpose
Security without a framework is a pile of ad hoc rules nobody can audit. A standard-mapped ISMS makes "are we secure" a checkable question: every control has an owner, a status, and evidence — and gaps are visible, not assumed away. It also gives sentinel (Governance) something concrete to monitor compliance against.

## When to Use
- Establishing or updating the security control framework for a business.
- "Which control covers X," "map us to NIST/ISO/SOC 2," "what's our control gap."
- A new system/process needs its controls identified (feeds the risk-register).

## Structure / Protocol
CHOOSE STANDARD (config `control_standard` — NIST CSF default; installs the matching GRC pack) → MAP (the pack's control catalog → this business's systems/data/people; each control gets an OWNER: an agent, the operator, or another dept) → POLICY SET (the human-readable policies implementing the controls — access, encryption, IR, acceptable-use; assets/isms-policy-index.md) → STATUS (each control: implemented / partial / gap / not-applicable-with-reason — no silent gaps) → EVIDENCE (what proves a control works — feeds sentinel's compliance monitoring) → CHANGE (material policy changes route anneal → board, Fleet Charter Rail 3; senior charters unchanged).

## Instructions
1. **Standard first, then map.** The operator picks the control standard (§8.4); warden installs the GRC pack and maps its catalog to *this* business — not every control applies, and non-applicable ones are marked with a reason, never silently dropped.
2. **Every control has an owner.** A control nobody owns is a control nobody does. Owners are agents (e.g., keyring owns access controls, bastion owns config baselines), the operator (privileged actions), or another dept (sentinel owns compliance evidence).
3. **Wrap the pack, don't reinvent it.** The GRC pack supplies authoritative control text (benchmarked, maintained); warden adds the mapping, ownership, status, and this-business specifics. Don't hand-write NIST controls the pack already has.
4. **No silent gaps.** Every control is implemented, partial, gap, or N/A-with-reason. Gaps go to the risk-register (sibling) as risks to treat — a gap is a risk, tracked, not ignored (the department's core rule).
5. **Policy is human-readable and owned.** Policies implement controls in plain language people follow; each has an owner and a review date (dated, like ops's playbooks).
6. **Charters are senior; changes are gated.** The Engineering Security Charter and Fleet Charter outrank this ISMS; material policy changes route through board (Rail 3). warden writes policy and maps controls; it does not execute privileged changes (the security-inversion).

## Output Format
```
## ISMS: [business] — standard: [NIST CSF / ISO 27001 / SOC 2 / CIS]
Control map: [control · owner · status(impl/partial/gap/N-A+reason) · evidence]
Gaps → risk-register: [refs]
Policy set: [policy · owner · review date] (assets/isms-policy-index.md)
Change: [material → board (Rail 3) / routine logged]
```

## Principles
- **Standard-mapped, this-business specific** — the pack's catalog, warden's mapping.
- **Every control owned; no silent gaps** — a gap is a tracked risk.
- **Wrap, don't reinvent** — authoritative pack content + warden's discipline.
- **Charters senior; changes board-gated** — the ISMS sits under the operator-owned law.
- **warden writes policy, never holds keys** — the security-inversion.

## Fallback
- No pack installed / standard unchosen → map against a sensible default subset (CIS Controls IG1 — the universal baseline), labeled provisional, and surface the pack for adoption (scout/operator).
- Small business, full standard is overkill → scope to the crown-jewel-relevant controls first (risk-based, not checkbox-complete), stated.

## Boundaries with Other Skills
- **risk-register** (sibling): gaps here become risks there; the two are the ISMS's two halves (controls + risks).
- **sentinel (Governance)**: monitors *compliance* against this framework's evidence; warden owns the framework, sentinel monitors adherence — clean split.
- **board (Governance)**: material policy changes gate here (Rail 3); risk acceptance too.
- Control owners across the fleet: keyring (access), bastion (config/network), cortex (detection/IR), veil (data/privacy), quinn (agent-runtime rails), dana (data Rail 3).
