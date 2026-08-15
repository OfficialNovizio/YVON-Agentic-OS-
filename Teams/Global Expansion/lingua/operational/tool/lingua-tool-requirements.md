<!--
Operational: tool-requirements file for lingua per §7 tool/. Fixed table format
per §14.4.
-->

# lingua — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/lingua-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| product-localization | File read/write | web search | `custom/product-localization/SKILL.md` § Output Format (strategy memo, locale-id spec, engineering brief, non-code spec, cultural review, translation QA plan, launch checklist — all written; existing localization + institutional data — read). Web search for Unicode CLDR / W3C i18n / BCP 47 / ISO standards verification. |
| marketing-localization | File read/write | web search | `custom/marketing-localization/SKILL.md` § Output Format (decision matrix, transcreator brief, brand voice guidelines, competitive context memo, transcreated content, QA plan — all written; messaging brief from compass + local competitor data — read). Web search for CSA Research / Meyer / de Mooij / Interbrand verification. |
| legal-localization | File read/write | web search | `custom/legal-localization/SKILL.md` § Output Format (scope memo, translation-vs-drafting decision, translator brief, format+requirements memo, counsel-review-gate checklist, localized content — all written; existing legal docs + institutional guides — read). Web search for ATA / FIT / ISO 17100 / Baker McKenzie / Bird & Bird verification. |
| cultural-adaptation | File read/write | web search | `custom/cultural-adaptation/SKILL.md` § Output Format (context memo, multi-framework profile, application memo, gate decision, learning retro — all written; framework data + prior gate decisions — read). Web search for Hofstede Insights / Meyer country mapping / Trompenaars / WVS data verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every lingua output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 lingua skills | Framework + institutional-source + Unicode CLDR data verification |
| Python/shell execution | Not required — 0 scripts (all Route D); matches signal + beacon + compass + canopy |
| Second model | Not required today |

## Not Required (explicit)

**Includes 5 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Machine-translation-only for user-facing marketing content** | **LOAD-BEARING REFUSAL** — `marketing-localization` Principle 1 |
| **Brand-voice erasure during transcreation** | **LOAD-BEARING REFUSAL** — `marketing-localization` Principle 2 |
| **Publish user-facing localized legal content without counsel-review-per-jurisdiction gate** | **LOAD-BEARING REFUSAL** — `legal-localization` Principle 1 |
| **Machine-translate user-facing legal content** | **LOAD-BEARING REFUSAL** — `legal-localization` Principle 2 |
| **Cultural-appropriateness gate decisions silently bypassed** | **LOAD-BEARING REFUSAL** — `cultural-adaptation` Principle 4 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace skills |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct code-level i18n execution | Engineering scope (dev) |
| Direct legal-content DRAFTING | operator + counsel scope |
| Direct translation-vendor engagement | operator + procurement scope |
| Individual cross-cultural coaching / mediation | HR + operator + external coach scope |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |
| Financial-portfolio management | operator + CFO scope |
| Applying cultural framework as individual determinism | `cultural-adaptation` Principle 2 (stereotype substitution failure mode) |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/lingua-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS |
|---|---|---|---|
| hire | 5 | 1 | 0 |
| maslow | 4 | 2 | 1 |
| grove | 4 | 3 | 2 |
| merit | 4 | 2 | 4 |
| herald | 4 | 1 | 9 |
| signal | 3 | 0 | 9 |
| beacon | 3 | 0 | 9 |
| compass | 4 | 0 | 11 |
| canopy | 4 | 0 | 9 |
| **lingua** (this file) | 4 | 0 | **5** | Localization surface — moderate refusal count. Distinctive: 2 refusals cover marketing-transcreation quality (machine-translation + brand-voice erasure); 2 cover legal-doc counsel-review discipline; 1 covers cultural-appropriateness gate integrity. |
