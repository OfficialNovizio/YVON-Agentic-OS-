---
name: cognitive-bias-audit
type: custom
status: built from scratch
assigned_agent: bias (Behavioural Science / Bias & Ethics Review)
portable: true
date_added: 2026-07-29
tier: 3
description: "Audit a decision (strategic, hiring, product, financial) for cognitive biases. Screens against the top-8 catalogued biases (anchoring · confirmation · sunk-cost · availability · framing · overconfidence · groupthink · planning fallacy). Forces counter-exercises."
triggers:
  - bias audit
  - is this decision biased
  - check for bias
  - counter-exercise
  - decision review
  - is this groupthink
---

# Cognitive Bias Audit

## Purpose
Systematic screen of a decision for cognitive-bias risks. Not "yes it's biased" — "here are the biases most likely; here's the counter-exercise for each."

## Top 8 biases audited
1. **Anchoring** — initial number sticks
2. **Confirmation** — seek confirming evidence
3. **Sunk-cost** — past investment biases future
4. **Availability** — recent / vivid = more likely
5. **Framing** — gain/loss frame shifts choice
6. **Overconfidence** — planning fallacy · illusion of validity
7. **Groupthink** — consensus premature
8. **Planning fallacy** — timelines underestimated

## Structure / Protocol
```
1. DECISION   what's being decided by whom by when
2. SCREEN     score each of top-8 (1-5) with rationale
3. COUNTER    for each medium/high, prescribe counter-exercise
4. AUDIT      attach to gate record
5. RETURN     audit + counter-exercise list
```

## Instructions
Every bias score has rationale from decision context. No blanket "high risk of confirmation bias" without example.

Counter-exercises are specific: reference-class forecasting for planning fallacy · red-team for groupthink · pre-mortem for overconfidence · base-rate reminder for availability.

## Output Format
Bias-score table + counter-exercise list + attach-to-gate note.

## Principles
- **Specific bias, specific rationale.**
- **Counter-exercise is prescriptive**, not "be aware".
- **Never over-flags** — 8-of-8 high means the audit is broken.
- **Attach to gate record** — audits become part of decision provenance.

## Fallback
| Failure | Response |
|---|---|
| Decision ambiguous | Ask; do not guess |

## Boundaries
- `ethics-review` (this agent) — ethical (not cognitive) review.
- `pre-mortem` (this agent) — specific overconfidence counter.
- `board/risk-assessment-matrix` (Governance) — governance decision reviews.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| cognitive-bias-audit | File read/write | — | All steps |
