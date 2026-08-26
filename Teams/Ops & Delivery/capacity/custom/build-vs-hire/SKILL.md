---
name: build-vs-hire
type: custom
status: built from scratch
assigned_agent: capacity (Ops & Delivery / Capacity Planning)
portable: true
date_added: 2026-07-29
tier: 3
description: "Given a capacity gap, decide: automate (route to AI & Agents meta) · hire · contract · defer scope. Structured cost-benefit both paths. Never decides — feeds marcus + felix + board."
triggers:
  - build vs hire
  - should we hire for X
  - automate this vs hire
  - should we contract this
  - defer or hire
  - gap resolution
---

# Build vs Hire

## Purpose
Given a capacity gap, structure the decision: automate / hire / contract / defer.

## Structure / Protocol
```
1. GAP        confirm from capacity-forecast
2. AGENT-BUILDABLE?  route to meta for build-feasibility assessment
3. HIRE COST  felix estimate (loaded)
4. CONTRACT COST  operator input
5. DEFER IMPACT  vista input (roadmap slip)
6. TABLE       side-by-side cost-benefit
7. RECOMMEND   ranked options — never decides
```

## Instructions
Route to `meta/agent-architecture-standards` for agent-buildable assessment.

Loaded hire cost = salary × (1 + benefits × 30%) × onboarding-months adjustment.

Never decides. `>$5K/mo commitment → board` per config.

## Output Format
Decision table + rec + who-decides routing.

## Principles
- **Never decides.** Feeds `marcus` + `felix` + `board`.
- **Every cost path costed**, not narrative.
- **Automate-first bias** (org has agents; check meta before hiring).
- **Defer is a real option**, not a punt.
- **Loaded costs**, not salary-only.

## Fallback
| Failure | Response |
|---|---|
| Meta assessment inconclusive | Present hire/contract/defer only; flag agent option uncertain |

## Boundaries
- `capacity-model` + `capacity-forecast` (this agent) — gap source.
- `meta/agent-architecture-standards` (AI & Agents) — buildability.
- `felix` (F&T) — cost model.
- `marcus` + `board` — decisions.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| build-vs-hire | File read (capacity gap · cost inputs) · File write (memo) | — | All steps |
