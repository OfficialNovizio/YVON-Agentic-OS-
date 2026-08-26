---
name: framing-analysis
type: custom
status: built from scratch
assigned_agent: frame (Behavioural Science / Framing & Presentation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Analyse a message / choice / policy for framing effects — gain vs loss, positive vs negative, active vs passive, temporal frames. Uses prospect-theory + Chip Heath 'Made to Stick' + Lakoff frame semantics."
triggers:
  - framing analysis
  - reframe this
  - gain vs loss frame
  - how is this framed
  - alternative framings
  - message framing
---

# Framing Analysis

## Purpose
Analyse how a message / choice / policy is framed → identify implicit reference points → propose alternative framings + predicted effects.

## Structure / Protocol
```
1. INTAKE      message / choice under analysis
2. FRAME       current frame (gain/loss · positive/negative · temporal · active/passive · reference point)
3. ALTERNATIVES 2-4 reframings
4. PREDICT     expected behavioural shift per frame
5. RECOMMEND   frame appropriate to goal + ethics
```

## Instructions
Prospect theory: losses hurt ~2× more than equivalent gains (Kahneman & Tversky). Frame choice matters.

Never claims a frame is "manipulative" if the underlying facts are unchanged — flag only when frame misrepresents.

## Output Format
Frame table (current + alternatives) + predicted effects + recommendation.

## Principles
- **Facts unchanged across frames.** Manipulation = fact change, not frame change.
- **Every alternative frame ethics-tagged.**
- **Predictions cite mechanism** (prospect theory / temporal discounting / etc.).
- **Provenance:** peer-reviewed citations.

## Fallback
| Failure | Response |
|---|---|
| Message ambiguous | Ask; do not guess intent |
| Ethics-fail on all alternatives | Refuse; the underlying choice may need redesign |

## Boundaries
- `narrative-arc` (this agent) — longer-form.
- `messaging-testing` (this agent) — A/B experimentation.
- `nudge` (this dept) — behavioural-design overlap; frame is message-level.
- `Brand Studio/lena` — copy peer.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| framing-analysis | File read/write | — | All steps |
