---
name: pre-mortem
type: custom
status: built from scratch
assigned_agent: bias (Behavioural Science / Bias & Ethics Review)
portable: true
date_added: 2026-07-29
tier: 3
description: "Structured pre-mortem for major decisions — Kahneman/Klein technique. Before commit: 'imagine we're 12 months in, this failed; what did us in?' Produces top failure modes + mitigations to attach to gate."
triggers:
  - pre-mortem
  - imagine this failed
  - what could go wrong
  - failure mode analysis
  - risk pre-mortem
---

# Pre-Mortem

## Purpose
Kahneman-Klein technique. Before commit to a decision, imagine 12 months later it failed. What did us in? Produces named failure modes + mitigations. Counter to overconfidence bias.

## Structure / Protocol
```
1. FRAME      "It's [date + 12 months]. [Decision] failed. Why?"
2. GENERATE   independent failure-mode brainstorm (no groupthink)
3. RANK       likelihood × severity
4. MITIGATE   per top-5: what would prevent + what would detect early
5. ATTACH     to decision gate record
```

## Instructions
Independent generation first (each participant separately) before group discussion — kills groupthink.

Every failure mode named specifically, not "market changes"; "our launch coincides with the launch of X category incumbent's competitive response."

## Output Format
Failure-mode table + mitigation plan + attach-to-gate note.

## Principles
- **Independent generation before discussion.**
- **Specific failure modes**, not generic.
- **Every top-5 mitigated** — prevention + early detection.
- **Attaches to gate** — becomes decision provenance.

## Fallback
| Failure | Response |
|---|---|
| Group already committed emotionally | Flag; may need external facilitator |
| Only-obvious failure modes surfaced | Re-run with adversarial red-team |

## Boundaries
- `cognitive-bias-audit` (this agent) — pre-mortem is one counter-exercise.
- `ethics-review` (this agent) — different concern.
- `board/risk-assessment-matrix` — Governance gate.
- `marcus` (Exec Office) — strategy pre-mortems.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| pre-mortem | File read/write | Anonymous-generation tool | All steps |
