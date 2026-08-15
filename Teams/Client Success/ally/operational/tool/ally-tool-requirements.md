<!--
Operational: tool-requirements file for ally per §7 tool/. Fixed table format
per §14.4.
-->

# ally — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/ally-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| customer-health-scoring | File read/write | web search | `custom/customer-health-scoring/SKILL.md` § Output Format (dimension + weight matrix, data-signal plan, dashboard framework, action-mapping playbook, recalibration report — all written; existing customer data — read). Web search for Mehta / Gainsight / Vaidyanathan/Rabago / Bhatt/Chinnappa / TSIA verification. |
| customer-lifecycle-value-mapping | File read/write | web search | `custom/customer-lifecycle-value-mapping/SKILL.md` § Output Format (lifecycle map, per-stage value matrix, milestone evidence log, gap+intervention plan, handoff briefs — all written; existing customer data — read). Web search for Mehta / Kaplan-Norton / Bhatt/Chinnappa / TSIA verification. |
| qbr-executive-review-framework | File read/write | web search | `custom/qbr-executive-review-framework/SKILL.md` § Output Format (pre-QBR briefing, stakeholder-mapping, agenda draft, facilitation notes, post-QBR tracker, handoff briefs — all written; prior QBR data + customer signals — read). Web search for Mehta / Vaidyanathan/Rabago / Miller Heiman / Gainsight / TSIA verification. |
| cs-tech-stack-selection | File read/write | web search | `custom/cs-tech-stack-selection/SKILL.md` § Output Format (needs-assessment, shortlist, decision matrix, RFP + reference findings, recommendation brief, vendor-lock-in estimate — all written; org context — read). Web search for G2 / Forrester / vendor materials / TSIA verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every ally output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 ally skills | Framework / institutional / vendor verification |
| Python/shell execution | Not required — 0 scripts (all Route D) |
| Second model | Not required today |

## Not Required (explicit)

**Includes 6 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Health scoring from CS-rep vibes without cited data signals** | **LOAD-BEARING REFUSAL** — `customer-health-scoring` Principle 1 |
| **Value claims to customer without milestone-completion evidence** | **LOAD-BEARING REFUSAL** — `customer-lifecycle-value-mapping` Principle 1 |
| **QBR without prior-QBR close-loop** | **LOAD-BEARING REFUSAL** — `qbr-executive-review-framework` Principle 1 |
| **Expansion push during renewal-risk / customer-strain** | **LOAD-BEARING REFUSAL** — `qbr-executive-review-framework` Principle 2 |
| **CS tech-stack recommendation without operator + procurement + CFO scoping** | **LOAD-BEARING REFUSAL** — `cs-tech-stack-selection` Principle 1 |
| **CS tech-stack recommendation without vendor-lock-in + migration-cost estimate** | **LOAD-BEARING REFUSAL** — `cs-tech-stack-selection` Principle 2 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace skills |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct product-analytics platform admin | dana + Product |
| Direct CS platform admin | operator + IT + vendor |
| Individual customer identity data external publication | HARD BOUNDARY — customer sign-off + operator + counsel |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/ally-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| hire | 5 | 1 | 0 | ATS/payroll admin denied |
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
| **ally** (this file) | 4 | 0 | **6** | Client Success Lead — moderate refusal count. Distinctive: 4 CS-discipline refusals (vibes-scoring + value-without-evidence + QBR-close-loop + expansion-during-strain) + 2 tech-stack refusals (cross-functional-scoping + vendor-lock-in). Mehta-flavored data-cited discipline. |
