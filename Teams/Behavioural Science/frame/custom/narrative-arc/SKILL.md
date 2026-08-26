---
name: narrative-arc
type: custom
status: built from scratch
assigned_agent: frame (Behavioural Science / Framing & Presentation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Longer-form narrative structuring for change communications, board memos, retro narratives. Uses McKee story-structure + Heath curse-of-knowledge check. Every narrative traces to real facts."
triggers:
  - narrative arc
  - story structure
  - narrative for X
  - change communication
  - board narrative
  - retro narrative
---

# Narrative Arc

## Purpose
Structure a longer-form narrative (board memo · change comms · retro story) using proven story-structure while preserving factual accuracy.

## Structure / Protocol
```
1. FACTS      what happened / is happening (from source data)
2. SETUP      status quo before inciting event
3. INCITING   the moment things changed
4. RISING     the complications + attempts
5. TURNING    the pivotal insight / decision
6. RESOLUTION current state + forward implication
7. CURSE-CHECK does the reader without our context follow this?
```

## Instructions
Story structure serves the facts; never the other way around. If facts don't fit an arc, tell the flatter truthful story.

Curse-of-knowledge check (Heath): give it to someone without context; does it land?

## Output Format
Narrative draft + fact-trace column + curse-of-knowledge review notes.

## Principles
- **Facts first, structure second.**
- **Every claim traces to source.**
- **Curse-of-knowledge check mandatory.**
- **Never invents details for narrative smoothness.**

## Fallback
| Failure | Response |
|---|---|
| Facts don't fit an arc | Flatter narrative; report honestly |
| Reader-test fails | Rework or accept complexity |

## Boundaries
- `framing-analysis` (this agent) — message-level.
- `Brand Studio/weave` — storytelling peer.
- `echo` (Executive Office) — investor comms; different audience.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| narrative-arc | File read/write | Reader-test panel MCP | All steps |
