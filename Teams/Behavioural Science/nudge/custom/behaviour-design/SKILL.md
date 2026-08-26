---
name: behaviour-design
type: custom
status: built from scratch
assigned_agent: nudge (Behavioural Science / Behaviour Design — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Design behavioural interventions using MAP model (Motivation · Ability · Prompt — BJ Fogg). Every intervention specifies target behaviour · target user · trigger. Feeds Product/loom for experimentation."
triggers:
  - behaviour design
  - design a nudge
  - increase X behaviour
  - decrease X behaviour
  - behaviour change intervention
  - MAP grid
---

# Behaviour Design

## Purpose
Structured behaviour-design intervention using Fogg's MAP model (Motivation · Ability · Prompt). Every intervention → target behaviour + user + trigger + measurement.

## Structure / Protocol
```
1. TARGET     specific behaviour · specific user · when it should happen
2. MAP        map current M · A · P; identify which is limiting
3. INTERVENE  design intervention on limiting factor
4. MEASURE    baseline + target metric; routes to Product/loom for experiment
5. RETURN     intervention spec + experiment brief
```

## Instructions
Fogg model: B = M × A × P. If any is zero, behaviour doesn't happen. Highest-leverage intervention is on the LOWEST factor.

Ethics: interventions must serve the user's own goals; dark patterns are refused.

## Output Format
Intervention spec: target · MAP diagnosis · intervention · measurement plan · ethics check.

## Principles
- **MAP diagnosis before intervention.** Don't design without knowing which factor is limiting.
- **Ethics check mandatory.** No dark patterns.
- **Specific behaviour + user.** "Increase engagement" is not a target; "increase weekly returning-user login" is.
- **Feeds Product/loom** for real experimentation.
- **Provenance:** `[Fogg model reference]` `[operator's baseline data]`.

## Fallback
| Failure | Response |
|---|---|
| Target behaviour vague | Ask; do not guess |
| Ethics-check fails | Refuse intervention; do not design dark pattern |

## Boundaries
- `nudge-library` (this agent) — reusable nudge patterns.
- `ethics-review` (bias, this dept) — ethics gate.
- `Product/loom` — experimentation.
- `frame` (this dept) — framing complementary.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| behaviour-design | File read (config · Fogg reference) · File write (intervention spec) | — | All steps |
