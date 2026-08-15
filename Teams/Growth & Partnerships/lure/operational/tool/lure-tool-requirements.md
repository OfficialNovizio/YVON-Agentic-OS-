<!--
Operational: tool-requirements file for lure per §7 tool/. Fixed format §14.4.
-->

# lure — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/lure-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| demand-generation-strategy | File read/write | web search | `custom/demand-generation-strategy/SKILL.md` § Output Format. Web search for Kingsnorth / HubSpot / Roberge / OpenView / CMI verification. |
| content-marketing-funnel | File read/write | web search | `custom/content-marketing-funnel/SKILL.md` § Output Format. Web search for Pulizzi / Handley / CMI / MarketingProfs verification. |
| marketing-attribution-and-mtx | File read/write | web search | `custom/marketing-attribution-and-mtx/SKILL.md` § Output Format. Web search for Kaushik / GA4 / Adobe / Marketo verification. |
| account-based-marketing | File read/write | web search | `custom/account-based-marketing/SKILL.md` § Output Format. Web search for Terminus / Demandbase / Miller Heiman / Roberge / ITSMA verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every lure output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 lure skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 7 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Fabricated campaign metrics** | **LOAD-BEARING REFUSAL** — `demand-generation-strategy` Principle 1 |
| **Spending without attribution instrumentation** | **LOAD-BEARING REFUSAL** — `demand-generation-strategy` Principle 2 |
| **Content-marketing without factual grounding** | **LOAD-BEARING REFUSAL** — `content-marketing-funnel` Principle 1 |
| **Fabricated attribution (inherited from quest)** | **LOAD-BEARING REFUSAL** — `marketing-attribution-and-mtx` Principle 1 |
| **Individual-user data at publication surface (inherited from quest)** | **LOAD-BEARING REFUSAL** — `marketing-attribution-and-mtx` Principle 2. Universal Principle 2 execution enforcement |
| **ABM personal-data compliance violation** | **LOAD-BEARING REFUSAL** — `account-based-marketing` Principle 1 |
| **B2B outreach without counsel scoping per jurisdiction** | **LOAD-BEARING REFUSAL** — `account-based-marketing` Principle 2 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct creative content creation | Brand Studio (lena / weave / muse) |
| Direct channel execution | Brand Studio (pulse / rio / kai / tempo) |
| Direct technical SEO implementation | rank (Engineering) |
| Direct international marketing execution | compass + lingua |
| Direct prospect-PII handling | canopy + counsel |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/lure-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| ... prior agents ... | | | | |
| quest | 4 | 0 | 6 |  |
| closer | 4 | 0 | 5 |  |
| **lure** (this file) | 4 | 0 | **7** | Marketing / Demand-Gen. Multiple refusals covering data compliance + factual grounding + jurisdiction outreach. |
