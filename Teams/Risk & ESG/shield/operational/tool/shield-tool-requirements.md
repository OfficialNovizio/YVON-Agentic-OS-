# shield — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/shield-config.md § 10 Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| business-continuity-planning | File read/write | web search | Per skill § Output Format |
| disaster-recovery-planning | File read/write | web search | Per skill § Output Format |
| third-party-risk-management | File read/write | web search | Per skill § Output Format |
| operational-resilience-testing | File read/write | web search | Per skill § Output Format |

## Cross-Cutting Requirements

| Requirement | Notes |
|---|---|
| File read/write | Every output routes through verification |
| Web search | Optional per skill for framework/regulation verification |
| Python/shell | Not required |
| Second model | Not required today |

## Not Required (explicit)

**Includes 4 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **BCP without tested exercise** | **LOAD-BEARING REFUSAL** — `business-continuity-planning` Principle 1 |
| **DR without RTO/RPO cited from business requirements** | **LOAD-BEARING REFUSAL** — `disaster-recovery-planning` Principle 1 |
| **Third-party engagement without security + compliance review** | **LOAD-BEARING REFUSAL** — `third-party-risk-management` Principle 1 |
| **Important-business-service identification without operational impact tolerance definition** | **LOAD-BEARING REFUSAL** — `operational-resilience-testing` Principle 1 |
| Python/shell execution | 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct cyber technical execution | Cybersecurity scope |
| Direct DPA drafting | canopy + counsel |
| Direct regulatory filing submission | operator + counsel |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Governance Cross-Reference

`operational/agent/shield-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS |
|---|---|---|---|
| ... | | | |
| pilot | 4 | 0 | 4 |
| hazard | 4 | 0 | 4 |
| prism | 4 | 0 | 4 |
| **shield** (this file) | 4 | 0 | **4** |
