# prism — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/prism-config.md § 10 Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| esg-materiality-assessment | File read/write | web search | Per skill § Output Format |
| carbon-accounting-and-reporting | File read/write | web search | Per skill § Output Format |
| social-impact-metrics | File read/write | web search | Per skill § Output Format |
| governance-disclosure | File read/write | web search | Per skill § Output Format |

## Cross-Cutting Requirements

| Requirement | Notes |
|---|---|
| File read/write | Every output routes through verification |
| Web search | Optional per skill for framework/institutional verification |
| Python/shell | Not required (carbon computation may use dana via cross-department) |
| Second model | Not required today |

## Not Required (explicit)

**Includes 4 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Materiality without double-materiality assessment** | **LOAD-BEARING REFUSAL** — `esg-materiality-assessment` Principle 1 |
| **Fabricated emissions data / Scope 3 without cited methodology** | **LOAD-BEARING REFUSAL** — `carbon-accounting-and-reporting` Principle 1 + 2 |
| **Individual employee data in social reporting** | **LOAD-BEARING REFUSAL** — `social-impact-metrics` Principle 1. Universal Principle 2 execution enforcement |
| **Governance disclosure publication without counsel review** | **LOAD-BEARING REFUSAL** — `governance-disclosure` Principle 1 |
| Python/shell execution | 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct HR data manipulation | P&C scope |
| Direct third-party assurance | External assurance + operator |
| Direct SEC / regulatory filing | operator + counsel |
| Direct board publication | operator + counsel + board |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/prism-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| ... prior agents ... | | | | |
| pilot | 4 | 0 | 4 | Risk & ESG Lead — Taleb identity |
| hazard | 4 | 0 | 4 | Enterprise Risk (ERM) |
| **prism** (this file) | 4 | 0 | **4** | ESG Reporting. All 4 refusals cover ESG-integrity + counsel + individual-data protection. |
