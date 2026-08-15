<!--
Operational: tool-requirements file for frontier per §7 tool/. Fixed table format
per §14.4.
-->

# frontier — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Governance-layer decisions live in `operational/agent/frontier-config.md § 10
> Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| fx-treasury-basics | File read/write | web search | `custom/fx-treasury-basics/SKILL.md` § Output Format (exposure map, natural-hedging memo, hedging brief, treasury policy — all written; existing exposures + institutional guides — read). Web search for BIS / CFA / JP Morgan / HSBC / AFP + FASB ASC 815 + IFRS 9 verification. |
| international-banking | File read/write | web search | `custom/international-banking/SKILL.md` § Output Format (needs map, counterparty shortlist, CBDDQ brief, AML/KYC coordination brief — all written; jurisdiction data + counterparty data — read). Web search for SWIFT / BIS / FATF / Wolfsberg / JP Morgan/HSBC/Citi verification. |
| cross-border-payments | File read/write | web search | `custom/cross-border-payments/SKILL.md` § Output Format (flow map, rail recommendation, AML/sanctions framework, cost+timing analysis, provider due-diligence — all written; existing flows + provider data — read). Web search for SWIFT / BIS CPMI / FATF / G20 Roadmap / fintech-provider verification. |
| international-logistics | File read/write | web search | `custom/international-logistics/SKILL.md` § Output Format (trade-lane map, Incoterms recommendation, HS classification, duties/VAT, trade-finance recommendation, freight-forwarder brief — all written; product + trade data — read). Web search for ICC Incoterms / WTO / WCO HS / UNCTAD / Flexport verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every frontier output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 frontier skills | Institutional-source verification + regime tracker updates |
| Python/shell execution | Not required — 0 scripts (all Route D) |
| Second model | Not required today |

## Not Required (explicit)

**Includes 9 LOAD-BEARING REFUSALS.**

| Not required | Rationale |
|---|---|
| **Hedging strategy recommendation without CFO + treasury counsel joint review** | **LOAD-BEARING REFUSAL** — `fx-treasury-basics` Principle 1 |
| **Speculative FX position recommendation** | **LOAD-BEARING REFUSAL** — `fx-treasury-basics` Principle 2 |
| **Bank counterparty engagement without AML/KYC-onboarding coordination** | **LOAD-BEARING REFUSAL** — `international-banking` Principle 1 |
| **Counterparty selection without capital-controls verification** | **LOAD-BEARING REFUSAL** — `international-banking` Principle 3 |
| **Correspondent-banking without CBDDQ / Wolfsberg due diligence** | **LOAD-BEARING REFUSAL** — `international-banking` Principle 2 |
| **Cross-border payment without AML/sanctions screening** | **LOAD-BEARING REFUSAL** — `cross-border-payments` Principle 1 |
| **Payment-provider engagement without AML compliance coordination** | **LOAD-BEARING REFUSAL** — `cross-border-payments` Principle 2 |
| **Incoterms selection without cost + risk-transfer analysis** | **LOAD-BEARING REFUSAL** — `international-logistics` Principle 1 |
| **HS classification without customs counsel or specialized broker (non-obvious cases)** | **LOAD-BEARING REFUSAL** — `international-logistics` Principle 2 |
| Python/shell execution | Not required — 0 scripts |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace skills |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' folders | Cross-agent editing out of scope |
| Direct FX trade execution | CFO + treasury + bank counterparties |
| Direct payment execution | operator + treasury + compliance |
| Direct customs filing submission | operator + customs broker |
| Direct freight-forwarder engagement | operator + procurement |
| Direct legal contract drafting | operator + counsel |
| Investment / trading strategy | operator + CFO + specialist — different domain |
| Financial-portfolio management | operator + CFO — different domain |
| Developer integration for in-app payment features | dev (Engineering) |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |

## Compile Behavior

Per §14.4.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).

## Governance Cross-Reference

`operational/agent/frontier-config.md § 10 Tool Permissions`.

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
| lingua | 4 | 0 | 5 |
| **frontier** (this file) | 4 | 0 | **9** | Cross-border operations — legal-fence-heavy surface (treasury / AML / sanctions / customs). Tied with canopy + herald/signal/beacon at 9. Distinctive: 3 banking refusals + 2 payments refusals + 2 logistics refusals + 2 FX-treasury refusals — every skill has ≥2 refusals reflecting the legal-adjacent nature of cross-border operations. |
