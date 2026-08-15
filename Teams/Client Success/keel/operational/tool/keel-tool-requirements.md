<!--
Operational: tool-requirements file for keel per §7 tool/. Fixed format §14.4.
-->

# keel — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/keel-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| tiered-support-design | File read/write | web search | `custom/tiered-support-design/SKILL.md` § Output Format (tier definitions, routing rules, capacity model, CS-coordination brief — all written; existing data — read). Web search for Zendesk / Salesforce / Intercom / Mehta / ITIL verification. |
| sla-and-escalation-management | File read/write | web search | `custom/sla-and-escalation-management/SKILL.md` § Output Format (SLA matrix, capacity-check report, escalation matrix, breach post-mortem — all written; capacity + volume data — read). Web search for ITIL / Zendesk / Salesforce / PagerDuty verification. |
| support-analytics | File read/write | web search | `custom/support-analytics/SKILL.md` § Output Format (metric recommendation, instrumentation plan, dashboard framework, feedback briefs — all written; measurement data — read). Web search for Reichheld / Dixon-Freeman-Toman / Bain / benchmark verification. |
| knowledge-base-and-self-service | File read/write | web search | `custom/knowledge-base-and-self-service/SKILL.md` § Output Format (KCS foundation, KB structure + taxonomy, self-service design, article lifecycle process — all written; existing KB + support data — read). Web search for KCS / Zendesk / Salesforce / TSIA verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every keel output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 keel skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 3 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **SLA commitment without capacity-check** | **LOAD-BEARING REFUSAL** — `sla-and-escalation-management` Principle 1 |
| **Individual support-agent perf data at publication surface** | **LOAD-BEARING REFUSAL** — `support-analytics` Principle 1. Universal Principle 2 execution-surface enforcement |
| **KB article publication without SME validation** | **LOAD-BEARING REFUSAL** — `knowledge-base-and-self-service` Principle 1 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Actual support delivery | Support agents + operator |
| Support-platform admin | Operator + IT |
| Individual agent HR / performance handling | HR + merit (P&C) |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/keel-config.md § 10 Tool Permissions`.

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
| retain | 4 | 0 | 4 |  |
| **keel** (this file) | 4 | 0 | **3** | Support ops surface. Distinctive: 3 refusals covering capacity-check discipline + individual-agent-perf-data protection (Universal Principle 2 execution) + SME validation gate. |
