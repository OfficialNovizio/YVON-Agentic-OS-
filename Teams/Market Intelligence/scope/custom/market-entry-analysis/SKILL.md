---
name: market-entry-analysis
type: custom
status: built from scratch
assigned_agent: scope (Market Intelligence / Market Sizing & Landscape — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Structured market-entry assessment. Porter-inspired forces + Drucker validity check + risks + cost + timing + expected return band. Routes to marcus for strategy decision; never decides."
triggers:
  - should we enter market X
  - market entry
  - new market assessment
  - market entry decision
  - go to market analysis
  - expansion analysis
---

# Market Entry Analysis

## Purpose
Structured assessment for a proposed market entry: forces analysis · validity check · risks · cost · timing · expected-return band. Feeds `marcus`.

## When to Use
- Proposed new market · new geography · new segment
- Strategy planning cycles

Do NOT use for: sizing alone (→ `market-sizing`) · trend detection (→ `trend`) · competitor comparison (→ `rival`).

## Structure / Protocol
```
1. DEFINE      what market · what offering · what timing
2. SIZE        pull from market-sizing (TAM/SAM/SOM)
3. FORCES      Porter's five (buyers, suppliers, entrants, substitutes, rivalry)
4. VALIDITY    Drucker's what/who/how questions
5. RISK        regulatory · execution · capital · competitive · timing
6. COST        entry cost band from operator input + felix
7. RETURN      expected return band + payback period band
8. VERDICT     recommend / caveat / not-yet — feeds marcus, does not decide
```

## Instructions
### Step 3: Forces
Standard Porter frame: bargaining power of buyers · bargaining power of suppliers · threat of new entrants · threat of substitutes · rivalry intensity. Score each 1-5 with rationale.

### Step 4: Validity
Drucker questions: What is the business (in this new market)? Who is the customer? What does the customer value? What are our results? What is our plan?

### Step 8: Verdict
"Recommend entry" / "Recommend with caveats [list]" / "Not-yet — [what needs to be true]" / "Recommend not-enter". Every verdict has a rationale + what would change it.

## Output Format
Structured memo: sizing · forces (table) · Drucker (Q&A) · risks (table) · cost band · return band · verdict.

## Principles
- **Never decides.** Feeds `marcus`.
- **Sizing from `market-sizing`** — no re-derivation.
- **Every risk quantified or explicitly qualitative.**
- **Verdict has a "what would change it" clause.**
- **Range everywhere, not points.**
- **Provenance every citation.**

## Fallback
| Failure | Response |
|---|---|
| Sizing unavailable | Route to `market-sizing`; block until produced |
| Regulatory ambiguity | Route to `comply/regulated-activity-readiness` |
| Ambiguous market boundary | Ask; do not guess |

## Boundaries
- `market-sizing` (this agent) — input.
- `rival/competitor-tracking` — competitive dynamics input.
- `trend/macro-signals` — timing input.
- `research/primary-research` — validation input.
- `felix/unit-economics + runway-model` — cost + return.
- `comply/regulated-activity-readiness` — regulatory feasibility.
- `marcus` (Executive Office) — verdict consumer, decision-maker.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| market-entry-analysis | File read (sizing, config, competitor + trend data) · File write (memo) | Web fetch (research) | All steps |
