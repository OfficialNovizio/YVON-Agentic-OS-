<!--
Operational: tool-requirements file for closer per §7 tool/. Fixed format §14.4.
-->

# closer — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/closer-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| sales-methodology-and-playbook | File read/write | web search | `custom/sales-methodology-and-playbook/SKILL.md` § Output Format (methodology recommendation, playbook, coaching cadence, maintenance schedule — all written). Web search for MEDDIC / Challenger / Solution Selling / Gap Selling / Winning by Design verification. |
| pipeline-management | File read/write | web search | `custom/pipeline-management/SKILL.md` § Output Format (stage-criteria, pipeline hygiene, forecast per tier, coaching cadence — all written). Web search for Roberge / Winning by Design / Salesforce / Gong / Clari verification. |
| deal-negotiation | File read/write | web search | `custom/deal-negotiation/SKILL.md` § Output Format (discovery memo, BATNA analysis, strategy playbook, concession-exchange plan, counsel handoff — all written). Web search for Fisher & Ury / Voss / Ury / Malhotra-Bazerman / Winning by Design verification. |
| customer-discovery | File read/write | web search | `custom/customer-discovery/SKILL.md` § Output Format (methodology memo, interview design, multi-stakeholder plan, root-cause report, close-handoff memo — all written). Web search for Blank / Cooper / Bosworth / Ulwick / Keenan / Rackham verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every closer output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 closer skills | Framework + institutional + practitioner verification |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |

## Not Required (explicit)

**Includes 5 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Fabricated commitments in sales conversations** | **LOAD-BEARING REFUSAL** — `sales-methodology-and-playbook` Principle 1 |
| **Forecast without cited stage-conversion data** | **LOAD-BEARING REFUSAL** — `pipeline-management` Principle 1 |
| **Closing without discovery complete** | **LOAD-BEARING REFUSAL** — `deal-negotiation` Principle 1 |
| **Concessions without exchange** | **LOAD-BEARING REFUSAL** — `deal-negotiation` Principle 2 |
| **Leading questions that manufacture demand** | **LOAD-BEARING REFUSAL** — `customer-discovery` Principle 1 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct contract drafting / execution | operator + counsel |
| Direct product decisions | Product |
| Direct international sales execution | compass + local operator |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/closer-config.md § 10 Tool Permissions`.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| ... prior agents ... | | | | |
| quest | 4 | 0 | 6 | Growth & Partnerships Lead |
| **closer** (this file) | 4 | 0 | **5** | Sales / BD. Roberge-flavored data-cited discipline inherited. Distinctive: 5 refusals covering commitments + forecast + close-discipline + concession-exchange + discovery-integrity. |
