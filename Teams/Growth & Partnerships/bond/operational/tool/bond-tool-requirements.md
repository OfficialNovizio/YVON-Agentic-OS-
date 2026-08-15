<!--
Operational: tool-requirements file for bond per §7 tool/. Fixed format §14.4.
-->

# bond — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/bond-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| partner-selection-and-tiering | File read/write | web search | `custom/partner-selection-and-tiering/SKILL.md` § Output Format. Web search for Rangan / Doz & Hamel / Kotler / Impartner/Allbound / Forrester verification. |
| channel-partner-program | File read/write | web search | `custom/channel-partner-program/SKILL.md` § Output Format. Web search for Rangan / Impartner/Allbound / Forrester / Salesforce PRM / Winning by Design verification. |
| co-marketing-and-co-selling | File read/write | web search | `custom/co-marketing-and-co-selling/SKILL.md` § Output Format. Web search for Winning by Design / Rangan / Impartner/Allbound / SiriusDecisions/Forrester / MarketingProfs verification. |
| strategic-alliance-management | File read/write | web search | `custom/strategic-alliance-management/SKILL.md` § Output Format. Web search for Doz & Hamel / Kanter / Gulati / Rangan / EY-BCG-McKinsey verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every bond output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 bond skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 4 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Partner engagement without counsel-scoped agreement** | **LOAD-BEARING REFUSAL** — `partner-selection-and-tiering` Principle 1 |
| **Revenue-share structure without counsel** | **LOAD-BEARING REFUSAL** — `channel-partner-program` Principle 1 |
| **Co-marketing content publication without both-parties sign-off** | **LOAD-BEARING REFUSAL** — `co-marketing-and-co-selling` Principle 1 |
| **Strategic alliance without conflict-of-interest counsel review** | **LOAD-BEARING REFUSAL** — `strategic-alliance-management` Principle 1 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct contract formalization | operator + M&A/JV counsel |
| Direct partner training | grove |
| Direct partner KB | keel |
| Direct international partnership execution | compass + canopy + lingua |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/bond-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| ... prior agents ... | | | | |
| quest | 4 | 0 | 6 |  |
| closer | 4 | 0 | 5 |  |
| lure | 4 | 0 | 7 |  |
| **bond** (this file) | 4 | 0 | **4** | Partnerships. All 4 refusals are counsel-scoping enforcement. |
