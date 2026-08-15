# hazard — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/hazard-config.md § 10 Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| risk-identification-taxonomy | File read/write | web search | Per skill § Output Format |
| risk-assessment-quantification | File read/write | web search | Per skill § Output Format |
| risk-treatment-strategies | File read/write | web search | Per skill § Output Format |
| risk-monitoring-and-audit | File read/write | web search | Per skill § Output Format |

## Cross-Cutting Requirements

| Requirement | Notes |
|---|---|
| File read/write | Every output routes through verification |
| Web search | Optional per skill |
| Python/shell | Not required (Monte Carlo may use dana via cross-department) |
| Second model | Not required today |

## Not Required (explicit)

**Includes 4 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Risk-inventory gaps** | **LOAD-BEARING REFUSAL** — `risk-identification-taxonomy` Principle 1 |
| **Qualitative-only scoring without quantification attempt** | **LOAD-BEARING REFUSAL** — `risk-assessment-quantification` Principle 1 |
| **Material-risk treatment without operator + counsel sign-off** | **LOAD-BEARING REFUSAL** — `risk-treatment-strategies` Principle 1 |
| **Audit-trail deletion / edit** | **LOAD-BEARING REFUSAL** — `risk-monitoring-and-audit` Principle 1 |
| Python/shell | 0 scripts |
| Second model | Not required today |
| Marketplace write | §4.8 — 0 marketplace |
| Cross-agent folder access | Out of scope |
| Individual crisis coaching | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Governance Cross-Reference

`operational/agent/hazard-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS |
|---|---|---|---|
| ... | | | |
| **hazard** (this file) | 4 | 0 | **4** |
