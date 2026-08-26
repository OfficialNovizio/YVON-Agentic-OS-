---
name: messaging-testing
type: custom
status: built from scratch
assigned_agent: frame (Behavioural Science / Framing & Presentation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Structured framing A/B testing. Designs the test → hands to Product/loom for execution → interprets results back into framing recommendations. Never runs experiments; frame-designs them."
triggers:
  - test this framing
  - A/B test messaging
  - message A/B test
  - framing experiment
  - copy A/B test
---

# Messaging Testing

## Purpose
Structured design of framing A/B tests. Hypothesis · variants · measurement · sample-size sanity → hands to `Product/loom` for execution → interprets outcome back into framing library.

## Structure / Protocol
```
1. HYPOTHESIS   which framing effect are we testing
2. VARIANTS     2-4 message variants isolating the effect
3. METRIC       primary + guardrail
4. SAMPLE       route to Shared OS/logical/sample_size.py for sizing
5. HANDOFF      to Product/loom for execution
6. INTERPRET    outcome → update framing-analysis + nudge-library
```

## Instructions
Every variant differs in ONE dimension (isolated effect); confounding = defect.

Sample sizing from `Shared OS/logical/sample_size.py` (per §13.5 shared logical).

## Output Format
Test brief + variant spec + measurement plan.

## Principles
- **One dimension changes per variant.**
- **Sample size sourced from Shared OS**, never invented.
- **Guardrail metric mandatory** — prevent local win with global loss.
- **Outcome routes back to library** — learning captured.

## Fallback
| Failure | Response |
|---|---|
| Confounded variants | Reject; redesign |
| Underpowered | Reject; either expand sample or de-scope hypothesis |

## Boundaries
- `framing-analysis` (this agent) — hypothesis source.
- `nudge-library` (nudge, this dept) — outcome consumer.
- `Product/loom` — execution.
- `insight/ad-hoc-analysis` — post-hoc analysis.
- Shared OS: `sample_size.py` · `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| messaging-testing | File read/write · Python execution (sample_size) | Loom experiment MCP | All steps |
