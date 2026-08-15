<!--
Operational: tool-requirements file for compass (Global Expansion Lead) per §7
tool/. Fixed table format per §14.4.
-->

# compass — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "web search" in the table below does not give compass that capability
> at runtime. Actual tool / file / execution access is a separate runtime-
> configuration step. Governance-layer decisions live in
> `operational/agent/compass-config.md § 10 Tool Permissions`.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| market-selection-framework | File read/write | web search | `custom/market-selection-framework/SKILL.md` § Output Format (candidate roster + pre-screen memo, CAGE scorecard, industry-weighted ranking, LOF memo, opportunity sizing, prioritization matrix, first-market-adjacency, decision memo — all written; institutional-indicator data + prior expansion history — read). Optional web search for framework citation verification + institutional data verification (World Bank / IMF / Freedom House / EIU / Transparency International). |
| entry-mode-decision | File read/write | web search | `custom/entry-mode-decision/SKILL.md` § Output Format (strategic-control profile, investment + speed memo, CAGE/LOF mapping, mode-decision matrix, readiness check, decision memo — all written; CAGE/LOF from skill 1 + operator inputs — read). Optional web search for Root + Ghemawat + Hill + Anderson & Gatignon citations + McKinsey/BCG matrix references. |
| go-to-market-adaptation | File read/write | web search | `custom/go-to-market-adaptation/SKILL.md` § Output Format (AAA memo, product adaptation, pricing memo, channel plan, messaging brief, GTM launch plan — all written; skill 1 + skill 2 outputs + market-research + competitor data — read). Optional web search for Ghemawat + Douglas & Craig + Kotler + Meyer citations + PPP / competitor pricing data verification. |
| expansion-portfolio-mgmt | File read/write | web search | `custom/expansion-portfolio-mgmt/SKILL.md` § Output Format (portfolio inventory, classification matrix, cross-market learning memo, rebalancing decision, market-exit protocol brief — all written; per-market performance data + regional grouping — read). Optional web search for Ghemawat + Rugman & Verbeke + Porter + BCG + MGI citations + WARN Act + jurisdiction-equivalent verification. |

## Cross-Cutting Requirements

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every compass output routes through verification |
| File write | Prime Directive + every skill's Output Format | Every skill produces written artifact |
| Web search | Optional for all 4 compass skills | Framework-citation verification + institutional-source verification |
| Python/shell execution | Not required by any compass skill | 0 scripts (all 4 skills Route D); matches signal + beacon posture |
| Second model | Not required by any compass skill today | Reserved for future |

## Not Required (explicit)

**Includes 11 LOAD-BEARING REFUSALS** enforcing compass Universal + Ghemawat-
flavored principles.

| Not required | Rationale |
|---|---|
| **Single-axis country selection** (picking country on 1 CAGE axis alone) | **LOAD-BEARING REFUSAL** — `market-selection-framework` Principle 1. Ghemawat 2001 documents the failure mode; all 4 CAGE axes required. |
| **Industry-blind CAGE weighting** | **LOAD-BEARING REFUSAL** — `market-selection-framework` Principle 2. Ghemawat 2007: CAGE weights vary by industry. |
| **Fabricate market-size / GDP / demographic numbers without cited source** | **LOAD-BEARING REFUSAL** — `market-selection-framework` Principle 5 + `go-to-market-adaptation` Principle 6 + Universal Principle 1 + Ghemawat-flavored no-fabrication. Silent "internal estimate" without assumption flag = violation. |
| **Skip political-risk indicators** (Freedom House / EIU / World Bank Governance / Transparency International) | **LOAD-BEARING REFUSAL** — `market-selection-framework` Principle 3. Predictable-failure mode when political-risk materializes. |
| **Default to greenfield or acquisition without CAGE/LOF-matched analysis** | **LOAD-BEARING REFUSAL** — `entry-mode-decision` Principle 1. Root + Ghemawat: high-distance → lower-commitment first. |
| **Acquisition recommendation without DD-readiness confirmation** (both sides) | **LOAD-BEARING REFUSAL** — `entry-mode-decision` Principle 5. Requires beacon `data-room-discipline` + counsel. |
| **JV recommendation without partner-fit assessment + counsel-scoped governance** | **LOAD-BEARING REFUSAL** — `entry-mode-decision` Principle 6. JV failure rate 50-70%. |
| **Home-market GTM copy-paste without AAA analysis** | **LOAD-BEARING REFUSAL** — `go-to-market-adaptation` Principle 1. AAA choice mandatory. |
| **Pricing set without purchasing-power + competitive benchmark citations** | **LOAD-BEARING REFUSAL** — `go-to-market-adaptation` Principle 3. Fabricated pricing = Universal Principle 1 violation. |
| **Divest decision without local employment counsel per jurisdiction** | **LOAD-BEARING REFUSAL** — `expansion-portfolio-mgmt` Principle 5. WARN Act equivalents vary. |
| **Divest timeline commitment without counsel-scoped protocol** | **LOAD-BEARING REFUSAL** — `expansion-portfolio-mgmt` Principle 6. 6-18 months typical. |
| Python/shell execution | Not required — 0 scripts (all 4 Route D) |
| Second model | Not required today |
| Write access to marketplace skills | §4.8 — 0 marketplace skills (all 4 §4.6 reclassified-to-custom) |
| Write access to SECURITY-CHARTER.md | Operator-amended only |
| Access to other agents' custom/ or operational/ folders | Cross-agent editing out of scope |
| Direct entity-setup platform admin | canopy + operator scope |
| Direct legal-contract drafting | operator + counsel scope |
| Direct sanctions/trade-compliance filings | operator + international-trade counsel scope |
| Financial-portfolio management (stocks / ETFs / treasury) | operator + CFO scope — NOT compass (different domain) |
| Individual crisis coaching / counseling | HARD BOUNDARY per Universal Principle 3 |
| Structural reorg / headcount decisions | hire (P&C Lead) — cross-department |
| Direct customer-relationship management | Future Client Success dept — cross-department |
| Direct investor-facing communications | beacon scope |

## Compile Behavior

Per §14.4:

- Every row uses only recognized phrase set
- `Skill` column matches directory name exactly
- Structure universal across every agent's tool/ file

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`,
  `## Fallback`, or `## Principles` sections.

## Governance Cross-Reference

`operational/agent/compass-config.md § 10 Tool Permissions` decides which of
the above compass is ALLOWED to use at runtime. Both files sync by construction.

## Cross-Agent Comparison

| Agent | Skills | Scripts | LOAD-BEARING REFUSALS | Notes |
|---|---|---|---|---|
| **hire** | 5 | 1 | 0 explicit at tool-level | ATS/payroll admin denied |
| **maslow** | 4 | 2 | 1 | Individual mental-health HARD BOUNDARY |
| **grove** | 4 | 3 | 2 | Audit-trail edit/delete + broadening access |
| **merit** | 4 | 2 | 4 + 4 fabrication | Highest in P&C |
| **herald** | 4 | 1 | 9 | Tied for highest in fleet |
| **signal** | 3 | 0 | 9 | Tied for highest in fleet |
| **beacon** | 3 | 0 | 9 | Tied for highest in fleet |
| **compass** (this file) | 4 | 0 | **11** | **NEW HIGHEST in fleet.** Global Expansion Lead — cross-jurisdictional legal-fence surface elevates refusal count above Comms & PR. Distinctive: 3 additional refusals cover CAGE/AAA analytical-rigor (single-axis / industry-blind / home-market-copy-paste); acquisition-DD + JV-partner-fit + divest-counsel-scoping mirror legal-fence pattern from Comms & PR. |
