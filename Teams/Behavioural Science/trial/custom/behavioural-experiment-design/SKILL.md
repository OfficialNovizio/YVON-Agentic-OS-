---
name: behavioural-experiment-design
type: custom
status: built from scratch
assigned_agent: trial (Behavioural Science / Behavioural Experimentation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Designs behavioural experiments — RCT · quasi-experiment · pre-post · natural. Selects design based on ethical + practical constraints. Hands to Product/loom for online / to research for field."
triggers:
  - experiment design
  - RCT design
  - behavioural experiment
  - quasi-experiment
  - natural experiment
  - test this hypothesis
---

# Behavioural Experiment Design

## Purpose
Design the right experiment for a behavioural hypothesis. RCT is gold-standard but not always feasible/ethical; this skill picks method + designs test.

## Structure / Protocol
```
1. HYPOTHESIS   what causal claim
2. CONSTRAINTS  ethical + practical (can we randomise?)
3. METHOD       RCT · matched · pre-post · natural · A/B
4. DESIGN       arms · sample · duration · metrics · analysis plan
5. SANITY       sample size via Shared OS/logical/sample_size.py
6. HANDOFF      loom (online) or research (field)
```

## Instructions
Never assumes RCT is possible; ethical constraints (denying a benefit) can rule it out.

Analysis plan pre-registered — no HARKing (Hypothesising After Results Known).

## Output Format
Design doc + pre-registration.

## Principles
- **Method matches constraint.** Don't force RCT where quasi is honest.
- **Pre-register analysis** — no HARKing.
- **Sample size from Shared OS**, not invented.
- **Guardrail metrics on every design.**
- **Ethics-gate mandatory** for interventions on vulnerable populations.

## Fallback
| Failure | Response |
|---|---|
| Cannot randomise ethically | Use quasi-experiment or observational; flag causal limits |
| Underpowered | Redesign or wider recruit |

## Boundaries
- `field-experiments` (this agent) — deployment.
- `behavioural-audit-lit` (this agent) — evidence review.
- `Product/loom` — online-experiment execution.
- `research` (MI) — field-recruitment execution.
- `bias` (this dept) — ethics gate.
- Shared OS: `sample_size.py` · `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| behavioural-experiment-design | File read/write · Python (sample sizing) | — | All steps |
