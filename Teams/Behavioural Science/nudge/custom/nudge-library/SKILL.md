---
name: nudge-library
type: custom
status: built from scratch
assigned_agent: nudge (Behavioural Science / Behaviour Design — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Catalogued nudge patterns — defaults · social proof · loss aversion framing · commitment · anchoring · scarcity. Each pattern cites peer-reviewed source. Ethics-tagged; deployment via ethics-review."
triggers:
  - nudge patterns
  - what nudge to use for X
  - default nudge
  - social proof
  - anchoring
  - commitment device
  - nudge library
---

# Nudge Library

## Purpose
Reusable, peer-reviewed nudge patterns. Every pattern: mechanism · citation · appropriate contexts · dark-pattern-risk score.

## Patterns
- **Defaults** — opt-in vs opt-out shifts behaviour dramatically (Johnson & Goldstein 2003 organ-donor study)
- **Social proof** — showing what others do (Cialdini)
- **Loss aversion framing** — losses hurt ~2× more than equivalent gains (Kahneman & Tversky prospect theory)
- **Commitment devices** — pre-committing to future action (Ariely)
- **Anchoring** — first number seen biases estimate (Tversky & Kahneman)
- **Scarcity** — limited-availability increases perceived value (Cialdini)
- **Fresh start** — new-year / new-month effect (Milkman)
- **Implementation intention** — "when X, I will Y" (Gollwitzer)

## When to Use
- Look up pattern for target behaviour · check ethics-risk · register new pattern with citation

## Structure / Protocol
```
LOOKUP    by target behaviour → candidate patterns
REGISTER  new pattern → citation required
EVALUATE  pattern × context → ethics-risk score
```

## Instructions
Every pattern cites peer-reviewed source. No "TikTok said so" patterns.

Ethics-risk score: 🟢 low (pattern serves user's goal) · 🟡 medium (context-dependent) · 🔴 high (dark-pattern risk).

## Output Format
Pattern card: mechanism · citation · contexts · ethics-risk · variant examples.

## Principles
- **Peer-reviewed citation mandatory.**
- **Ethics-risk score on every pattern.**
- **Dark-pattern risk surfaced.**
- **Never delete pattern history.**
- **Provenance:** `[paper citation + DOI]`.

## Fallback
| Failure | Response |
|---|---|
| No peer-reviewed source | Reject pattern until sourced |
| Ambiguous ethics context | Route to ethics-review |

## Boundaries
- `behaviour-design` (this agent) — consumer.
- `frame` (this dept) — framing-specific patterns.
- `bias/ethics-review` (this dept) — ethics gate.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| nudge-library | File read/write · Web fetch (citation verification) | Semantic Scholar MCP · JSTOR MCP | All steps |
