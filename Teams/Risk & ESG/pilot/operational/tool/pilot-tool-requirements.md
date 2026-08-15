<!--
Operational: tool-requirements for pilot per §7 tool/. Fixed format §14.4.
-->

# pilot — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/pilot-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| risk-appetite-framework | File read/write | web search | `custom/risk-appetite-framework/SKILL.md` § Output Format. Web search for Taleb / Lam / COSO / ISO 31000 / Basel verification. |
| tail-risk-scanning | File read/write | web search | `custom/tail-risk-scanning/SKILL.md` § Output Format. Web search for Taleb / Kahneman / WEF / IRM verification. |
| risk-committee-and-reporting | File read/write | web search | `custom/risk-committee-and-reporting/SKILL.md` § Output Format. Web search for Lam / COSO / IIA / IRM / SEC verification. |
| crisis-scenario-planning | File read/write | web search | `custom/crisis-scenario-planning/SKILL.md` § Output Format. Web search for Taleb / Fink / Hopkins / Perrow / Shell verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every pilot output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 pilot skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 4 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Risk appetite as vibes (not quantified)** | **LOAD-BEARING REFUSAL** — `risk-appetite-framework` Principle 1 |
| **Gaussian-tail assumption for fat-tail phenomena** | **LOAD-BEARING REFUSAL** — `tail-risk-scanning` Principle 1 |
| **Risk reporting without board-level cadence** | **LOAD-BEARING REFUSAL** — `risk-committee-and-reporting` Principle 1 |
| **Scenario planning with fabricated probabilities** | **LOAD-BEARING REFUSAL** — `crisis-scenario-planning` Principle 1 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct risk-appetite approval | board scope |
| Direct crisis-response execution | beacon + operator scope |
| Direct cyber-response execution | Cybersecurity scope |
| Direct legal execution | operator + counsel scope |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/pilot-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| ... prior agents ... | | | | |
| **pilot** (this file) | 4 | 0 | **4** | Risk & ESG Lead — Taleb-flavored fat-tail discipline. |
