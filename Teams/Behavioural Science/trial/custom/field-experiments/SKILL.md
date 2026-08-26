---
name: field-experiments
type: custom
status: built from scratch
assigned_agent: trial (Behavioural Science / Behavioural Experimentation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Field-experiment deployment — recruitment · consent · execution · monitoring · closure. Ethics-review mandatory before deployment."
triggers:
  - field experiment
  - deploy the experiment
  - run this field trial
  - experiment monitoring
  - close the trial
---

# Field Experiments

## Purpose
Deploy a designed field experiment (from `behavioural-experiment-design`) — recruit · consent · run · monitor · close.

## Structure / Protocol
```
1. ETHICS       ethics review (bias) → approved / conditional / rejected
2. RECRUIT      per design; incentive; consent
3. EXECUTE      per design; adherence tracking
4. MONITOR      pre-registered stopping rules; adverse events
5. CLOSE        data collection ends; hand to analysis
```

## Instructions
Ethics-review mandatory. Adverse-event monitoring per operator-set threshold; stop if triggered.

Never analyses in-flight (peeking → false discovery); pre-registered stopping rules only.

## Output Format
Trial registry entry + monitoring reports + closure report.

## Principles
- **Ethics approval before recruit.**
- **Consent per operator policy.**
- **Adverse-event monitoring** with pre-set stopping rules.
- **No in-flight peeking.**
- **Data retention per policy.**

## Fallback
| Failure | Response |
|---|---|
| Ethics rejects | Redesign per `behavioural-experiment-design`; do not deploy |
| Adverse-event threshold hit | Stop immediately; report |
| Under-recruit | Extend or redesign; do not lower quality |

## Boundaries
- `behavioural-experiment-design` (this agent) — design source.
- `bias/ethics-review` — ethics gate.
- `research` (MI) — recruitment channel.
- `insight/ad-hoc-analysis` — post-hoc analysis.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| field-experiments | File read/write · Survey MCP · Recruitment MCP | Consent-management MCP | All steps |
