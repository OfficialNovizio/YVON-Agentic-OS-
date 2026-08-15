<!--
Operational: tool-requirements file for retain per §7 tool/. Fixed format §14.4.
-->

# retain — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/retain-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| churn-risk-prediction | File read/write | web search | `custom/churn-risk-prediction/SKILL.md` § Output Format (signal inventory, risk score + tier, save-motion playbook, escalation report, portfolio rollup — all written; health + signals data — read). Web search for Mehta / Gainsight / Vaidyanathan/Rabago / TSIA verification. |
| expansion-motions | File read/write | web search | `custom/expansion-motions/SKILL.md` § Output Format (opportunity report, motion qualification, motion design, sales handoff brief, pipeline rollup — all written; health + value data — read). Web search for Mehta / Winning by Design / Point Nine / a16z / Kellblog verification. |
| renewal-negotiation | File read/write | web search | `custom/renewal-negotiation/SKILL.md` § Output Format (renewal-window plan, value-realized memo, BATNA analysis, negotiation playbook, post-renewal tracker — all written; upstream data — read). Web search for Mehta / Winning by Design / Fisher & Ury / Gainsight / Kellblog verification. |
| customer-advocacy | File read/write | web search | `custom/customer-advocacy/SKILL.md` § Output Format (program design, opt-in + sign-off protocol, pipeline dashboard, reference-serving process, case-study library — all written; advocate + engagement data — read). Web search for Mehta / Bill Lee / IDC / Forrester / Influitive / Gainsight verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every retain output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 retain skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 4 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Vibes-based churn prediction (not cited signals)** | **LOAD-BEARING REFUSAL** — `churn-risk-prediction` Principle 1. Mehta discipline inherited. |
| **Expansion push without value-realized-evidence + health-GREEN gate** | **LOAD-BEARING REFUSAL** — `expansion-motions` Principle 1 |
| **Renewal-negotiation without value-realized-evidence assembly** | **LOAD-BEARING REFUSAL** — `renewal-negotiation` Principle 1 |
| **Customer identity in external publication without explicit sign-off** | **LOAD-BEARING REFUSAL** — `customer-advocacy` Principle 1. Universal Principle 2 HARD BOUNDARY at execution surface. |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct sales execution | future Growth & Partnerships |
| Direct contract execution | operator + CFO + counsel |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/retain-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| hire | 5 | 1 | 0 |  |
| maslow | 4 | 2 | 1 |  |
| grove | 4 | 3 | 2 |  |
| merit | 4 | 2 | 4 |  |
| herald | 4 | 1 | 9 |  |
| signal | 3 | 0 | 9 |  |
| beacon | 3 | 0 | 9 |  |
| compass | 4 | 0 | 11 | fleet high |
| canopy | 4 | 0 | 9 |  |
| lingua | 4 | 0 | 5 |  |
| frontier | 4 | 0 | 9 |  |
| ally | 4 | 0 | 6 |  |
| kickoff | 4 | 0 | 2 |  |
| **retain** (this file) | 4 | 0 | **4** | Retention surface — moderate refusal count. Distinctive: 4 refusals covering data-cited discipline (churn) + value-realized-evidence primacy (expansion + renewal) + customer-identity sign-off (advocacy — Universal Principle 2 HARD BOUNDARY at execution). |
