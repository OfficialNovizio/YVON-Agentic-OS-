<!--
Operational: tool-requirements file for canopy per §7 tool/. Fixed table format
per §14.4.
-->

# canopy — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/canopy-config.md § 10
> Tool Permissions`. This file is the checklist for the runtime configurator.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| entity-setup-by-jurisdiction | File read/write | web search | `custom/entity-setup-by-jurisdiction/SKILL.md` § Output Format (jurisdiction scope memo, structure matrix, counsel brief, registration checklist, dissolution-planning memo, cross-agent handoffs — all written; prior entity setups + institutional guides — read). Web search for PwC / Deloitte / EY / Baker McKenzie / World Bank verification. |
| tax-registration | File read/write | web search | `custom/tax-registration/SKILL.md` § Output Format (obligation scoping memo, counsel brief, registration checklist, transfer-pricing memo, BEPS Pillar 2 memo, digital-services tax scan, handoffs — all written; prior tax registrations + institutional guides — read). Web search for OECD BEPS / PwC / Deloitte / EY / KPMG verification. |
| employment-law-multi-jurisdiction | File read/write | web search | `custom/employment-law-multi-jurisdiction/SKILL.md` § Output Format (employment-law scoping memo, counsel brief, classification recommendation, non-compete memo, WARN-equivalent scoping, works-council scoping, handoffs — all written; prior employment scoping + institutional guides — read). Web search for Baker McKenzie / Littler / DLA Piper / Ogletree Deakins / ILO verification. |
| data-residency-mapping | File read/write | web search | `custom/data-residency-mapping/SKILL.md` § Output Format (data-flow map, applicable-regime memo, counsel brief, transfer-mechanism memo, DPA inventory, PIPL scoping, Cybersecurity handoff, other handoffs — all written; existing data flows + institutional guides — read). Web search for IAPP / Bird & Bird / DLA Piper / EDPB / NIST / OECD verification + regime tracker updates. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every canopy output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 canopy skills | Institutional-source verification + regime tracker updates |
| Python/shell execution | Not required — 0 scripts (all Route D); matches signal + beacon + compass |
| Second model | Not required today |

## Not Required (explicit)

**Includes 9 LOAD-BEARING REFUSALS** enforcing canopy Universal Principles.

| Not required | Rationale |
|---|---|
| **Entity setup recommendation without local counsel engagement** | **LOAD-BEARING REFUSAL** — `entity-setup-by-jurisdiction` Principle 1. Predictable failure without counsel. |
| **Structure decision without tax-counsel + local-counsel joint review** | **LOAD-BEARING REFUSAL** — `entity-setup-by-jurisdiction` Principle 2. Entity structure drives tax treatment. |
| **Tax registration recommendation without tax counsel** | **LOAD-BEARING REFUSAL** — `tax-registration` Principle 1. Jurisdiction-specific quirks require counsel. |
| **Transfer-pricing setup without tax counsel + intercompany-agreement scoping** | **LOAD-BEARING REFUSAL** — `tax-registration` Principle 2. Multi-entity structures require arm's-length pricing docs. |
| **Tax-arbitrage recommendation without tax counsel + reputational-risk review** | **LOAD-BEARING REFUSAL** — `tax-registration` Principle 3. Aggressive optimization carries BEPS anti-avoidance + reputational risk. |
| **Employment-law scoping without local employment counsel** | **LOAD-BEARING REFUSAL** — `employment-law-multi-jurisdiction` Principle 1. Jurisdiction-specific compliance requires counsel. |
| **Termination / severance recommendation without local employment counsel** | **LOAD-BEARING REFUSAL** — `employment-law-multi-jurisdiction` Principle 2. Notice + severance + protected-class + works-council per jurisdiction. |
| **Data-residency scoping without data-protection counsel + Cybersecurity coordination** | **LOAD-BEARING REFUSAL** — `data-residency-mapping` Principle 1. Jurisdictional requirements + technical implementation both required. |
| **Cross-border data transfer without valid transfer mechanism scoped** | **LOAD-BEARING REFUSAL** — `data-residency-mapping` Principle 2. Post-Schrems II SCCs need TIA; adequacy/BCRs/CAC per applicability. |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace skills (all 4 §4.6 reclassified) |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct entity-setup / tax-filing / employment-filing / data-protection-filing admin | operator + counsel scope; canopy scopes counsel-brief only |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |
| Structural reorg / headcount decisions | hire (P&C Lead) |
| Legal contract drafting | operator + counsel |
| Direct regulator-facing filing submission | operator + counsel |
| Individual employee perf / discipline / termination execution | merit + hire + operator + counsel |

## Compile Behavior

Per §14.4: every row uses recognized phrase set; `Skill` column matches
directory name; structure universal across every agent's tool/ file.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`,
  `## Fallback`, or `## Principles` sections.

## Governance Cross-Reference

`operational/agent/canopy-config.md § 10 Tool Permissions` decides which of
the above canopy is ALLOWED to use at runtime.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| hire | 5 | 1 | 0 | ATS/payroll admin denied |
| maslow | 4 | 2 | 1 | Individual mental-health HARD BOUNDARY |
| grove | 4 | 3 | 2 | Audit-trail edit/delete + broadening access |
| merit | 4 | 2 | 4 + 4 fabrication | Highest in P&C |
| herald | 4 | 1 | 9 | Comms & PR |
| signal | 3 | 0 | 9 | Comms & PR |
| beacon | 3 | 0 | 9 | Comms & PR |
| compass | 4 | 0 | 11 | Global Expansion Lead — was fleet-high |
| **canopy** (this file) | 4 | 0 | **9** | Global Expansion Regulatory & Compliance. Tied with Comms & PR at 9. Distinctive: every skill has a legal-fence primary refusal (never-without-counsel) — regulatory-scoping surface is legal-fence-heavy by nature. |
