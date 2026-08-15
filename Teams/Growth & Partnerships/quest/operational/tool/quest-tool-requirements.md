<!--
Operational: tool-requirements file for quest per §7 tool/. Fixed format §14.4.
-->

# quest — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/quest-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| growth-strategy | File read/write | web search | `custom/growth-strategy/SKILL.md` § Output Format (stage-assessment memo, revenue-machine audit, network-effect assessment, growth-model recommendation, experiment roadmap — all written; ARR + PMF + network data — read). Web search for Roberge / Chen / Ellis-Brown / Bush / a16z verification. |
| pricing-and-packaging | File read/write | web search | `custom/pricing-and-packaging/SKILL.md` § Output Format (framework recommendation, segmentation, packaging design, WTP plan, handoff brief — all written; WTP + competitive + cost data — read). Web search for Nagle / Madhavan-Wu / Kotler / Simon-Kucher / OpenView verification. |
| funnel-metrics-and-attribution | File read/write | web search | `custom/funnel-metrics-and-attribution/SKILL.md` § Output Format (metric framework, instrumentation brief, attribution model, segmentation dashboard, optimization loop — all written; funnel + attribution data — read). Web search for Ostrow / Chen / Amplitude / Mixpanel / Kaushik / GA4 verification. |
| gtm-motion-selection | File read/write | web search | `custom/gtm-motion-selection/SKILL.md` § Output Format (customer-segment analysis, motion-candidate assessment, motion design, handoff briefs — all written; segment characteristics + competition data — read). Web search for Bush / Roberge / a16z / Bessemer / Winning by Design verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every quest output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 quest skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 6 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Fabricated growth projections** | **LOAD-BEARING REFUSAL** — `growth-strategy` Principle 1 |
| **Pricing without cited WTP data** | **LOAD-BEARING REFUSAL** — `pricing-and-packaging` Principle 1 |
| **Pricing recommendation without operator + CFO + counsel scoping** | **LOAD-BEARING REFUSAL** — `pricing-and-packaging` Principle 2 |
| **Fabricated attribution** | **LOAD-BEARING REFUSAL** — `funnel-metrics-and-attribution` Principle 1 |
| **Individual-user data at publication surface** | **LOAD-BEARING REFUSAL** — `funnel-metrics-and-attribution` Principle 3. Universal Principle 2 execution enforcement |
| **Motion selection without customer-segment analysis** | **LOAD-BEARING REFUSAL** — `gtm-motion-selection` Principle 1 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct sales / marketing / partnership execution | closer / lure / bond scope |
| Direct product feature-price implementation | Product `price` + dev |
| Direct international market execution | compass scope |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/quest-config.md § 10 Tool Permissions`.

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
| keel | 4 | 0 | 3 |  |
| **quest** (this file) | 4 | 0 | **6** | Growth & Partnerships Lead. Roberge-flavored data-cited discipline. |
