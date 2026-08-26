---
name: behavioural-audit
type: custom
status: built from scratch
assigned_agent: nudge (Behavioural Science / Behaviour Design — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Audit existing product flows / campaigns / policies for unintended behavioural effects. Flags friction · perverse incentives · dark patterns. Ethics-driven; every flag has evidence trail."
triggers:
  - behavioural audit
  - audit this flow
  - unintended behaviour
  - perverse incentive
  - dark pattern check
  - friction audit
---

# Behavioural Audit

## Purpose
Audit a flow / campaign / policy for behavioural side-effects. Not designing new intervention; assessing existing.

## Structure / Protocol
```
1. SCOPE      flow / campaign / policy under review
2. MAP        target behaviour · current behaviour · gap
3. FRICTION   locate high-friction touchpoints (Ability killers)
4. PERVERSE   identify perverse incentives (reward misalignment)
5. DARK       check for dark patterns (per pattern library taxonomy)
6. RETURN     audit report + fix recommendations
```

## Instructions
Every flag cites specific step + evidence (screenshot / metric / user report). No abstract "seems dark".

## Output Format
Audit table + evidence + recommendation per flag.

## Principles
- **Evidence per flag.**
- **Dark-pattern taxonomy** used (Brignull's dark-pattern catalog).
- **Never blame designer** — surface structural.
- **Feeds fixes back** to owning agent.

## Fallback
| Failure | Response |
|---|---|
| Cannot access flow | Ask operator to walk through |
| Metrics unavailable | Qualitative-only audit; flag |

## Boundaries
- `nudge-library` (this agent) — pattern taxonomy.
- `bias/ethics-review` (this dept) — dark-pattern gate.
- `Product/ux` — UX peer.
- Every owning agent — recommendations feed back.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| behavioural-audit | File read/write | Screenshot MCP · Analytics MCP | All steps |
