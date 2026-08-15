<!--
Operational: tool-requirements file for kickoff per §7 tool/. Fixed format §14.4.
-->

# kickoff — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/kickoff-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| onboarding-journey-design | File read/write | web search | `custom/onboarding-journey-design/SKILL.md` § Output Format (sales-to-CS handoff template, journey map, milestone map, coordination briefs, handoff design — all written; existing customer data — read). Web search for Mehta / Bhatt/Chinnappa / TSIA / Gainsight verification. |
| time-to-first-value-optimization | File read/write | web search | `custom/time-to-first-value-optimization/SKILL.md` § Output Format (first-value milestone definition, instrumentation brief, baseline/benchmark report, gap+optimization plan, ally handoff brief — all written; instrumentation data — read). Web search for Bush PLG / Amplitude / Mixpanel / Sequoia verification. |
| onboarding-playbooks-per-segment | File read/write | web search | `custom/onboarding-playbooks-per-segment/SKILL.md` § Output Format (segment criteria, per-segment playbooks, adaptation triggers, maintenance schedule — all written; existing playbooks + benchmark data — read). Web search for Mehta / Bhatt/Chinnappa / TSIA / Gainsight verification. |
| kickoff-executive-alignment | File read/write | web search | `custom/kickoff-executive-alignment/SKILL.md` § Output Format (gap-selling handoff summary, MSP draft, stakeholder-validation report, BATNA memo, signed MSP + review schedule — all written; sales-context + customer stakeholder data — read). Web search for Miller Heiman / Fisher & Ury / Keenan / Winning by Design / Mehta verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every kickoff output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 kickoff skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 2 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Activation metrics fabricated (not cited from instrumentation)** | **LOAD-BEARING REFUSAL** — `time-to-first-value-optimization` Principle 1. Mehta discipline inherited. |
| **Mutual Success Plan skip at enterprise kickoff** | **LOAD-BEARING REFUSAL** — `kickoff-executive-alignment` Principle 1 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Product-analytics instrumentation execution | dana + Product |
| CS platform admin | operator + IT |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/kickoff-config.md § 10 Tool Permissions`.

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
| **kickoff** (this file) | 4 | 0 | **2** | Onboarding surface — moderate discipline scope. Distinctive: 2 refusals covering activation-metrics fabrication (Mehta discipline) + MSP skip at enterprise. |
