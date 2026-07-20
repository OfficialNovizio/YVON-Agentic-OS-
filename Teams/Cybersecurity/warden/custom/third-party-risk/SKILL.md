---
name: third-party-risk
type: custom
status: built 2026-07-10 (Fable)
based_on_catalog_entry: none — new; the supply-chain the business depends on (plan §3)
marketplace_search: 2026-07-10 — GRC packs touch vendor clauses within frameworks (SOC 2, ISO 27001 A.15); no standalone third-party-risk agent skill fit; kept custom, cites those framework controls.
assigned_agent: warden (Cybersecurity / CISO — leader)
portable: true
includes: assets/vendor-assessment-template.md
date_added: 2026-07-10
---

# Third-Party / Vendor Risk

## Introduction
The security of the SaaS, APIs, and vendors the business depends on — because a breach at a critical vendor is a breach of the business. Each vendor is assessed before adoption and on cadence: what data they touch, their security posture, the contract terms that protect us, and the concentration risk of depending on them.

## Purpose
Modern businesses run on third parties; each is an inherited attack surface and a supply-chain risk (the Sushegaad-style GRC frameworks all require vendor management for exactly this reason). Structured assessment stops "we gave a random SaaS our customer data and never checked" — the most common quiet breach path.

## When to Use
- Before adopting a new vendor/SaaS that touches data or systems.
- Vendor security review cadence (config).
- A vendor has an incident (their breach → our risk).
- Concentration/critical-dependency review.

## Structure / Protocol
INVENTORY (the vendors, and what data/access each has — the ones touching crown-jewel data are critical) → ASSESS (their posture: certifications SOC 2/ISO 27001, security questionnaire, breach history, sub-processors) → CONTRACT (data-processing terms, breach-notification obligations, security requirements, right-to-audit — coordinates with future Legal) → SCORE (vendor risk → warden's risk-register) → MONITOR (re-assess on cadence; a vendor breach triggers immediate review) → CONCENTRATION (over-reliance on one vendor is itself a risk — single points of failure flagged).

## Instructions
1. **Know what each vendor touches.** A vendor with crown-jewel data (veil's classification) is critical; a vendor with none is low-risk. Assess proportionate to data sensitivity and access, not vendor size.
2. **Certifications are evidence, not proof.** A SOC 2 report or ISO 27001 cert is a signal; read the scope and exceptions, don't rubber-stamp. No cert → deeper questionnaire or higher risk score.
3. **The contract is a control.** Data-processing terms, breach-notification clauses (their breach → they must tell us within N), security requirements, and sub-processor disclosure are the protections; a vendor handling PII without a DPA is a finding (coordinates with veil + future Legal).
4. **Vendor risk is register risk.** Each assessed vendor scores into warden's risk-register; critical-vendor risks get the same treatment discipline (mitigate/accept-by-operator/etc.).
5. **Their breach is our incident.** A vendor breach triggers immediate re-assessment and often cortex IR (our data may be exposed) + veil breach-notification (our obligations may fire).
6. **Concentration is a risk.** Depending on one vendor for a critical function is a single point of failure — flagged to the risk-register even if that vendor is secure.

## Output Format
```
## Vendor: [name] — data touched: [class per veil] · access: [scope]
Posture: [SOC2/ISO cert scope · questionnaire · breach history · sub-processors]
Contract: [DPA ✓ · breach-notification clause ✓ · security reqs ✓ · audit right]
Risk score → register [R-ref] · Critical: [y/n] · Concentration flag: [y/n]
Re-assess: [cadence] · On vendor breach → cortex IR + veil notification
```

## Principles
- **Assess proportionate to data + access** — not to vendor size.
- **Certifications are evidence; read the scope** — don't rubber-stamp.
- **The contract is a control** — no DPA on a PII vendor is a finding.
- **Vendor risk is register risk** — same treatment discipline.
- **Their breach is our incident** — triggers IR + notification review.
- **Concentration is a risk** — single points of failure flagged even when secure.

## Fallback
- Vendor won't share a security report → higher risk score + compensating contract terms, or don't adopt; opacity is itself a risk, logged.
- No vendor inventory yet → build it from what the business actually uses (billing records, DNS, integrations); an unknown vendor is an unassessed risk.

## Boundaries with Other Skills
- **risk-register** (sibling): vendor risks live there; critical vendors get full treatment.
- **veil**: what data a vendor touches comes from veil's classification; a vendor breach may fire veil's breach-notification.
- **cortex**: a vendor breach often triggers our IR.
- **board / future Legal & Compliance**: contract terms and above-threshold vendor risk gate/coordinate there.
- **relay (AI & Agents)**: MCP/tool vendors the *agents* use are relay's registry; warden covers business/SaaS vendors — coordinate on overlap (a vendor that's both).
