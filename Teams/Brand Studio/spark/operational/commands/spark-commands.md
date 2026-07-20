---
name: spark-commands
type: operational/commands
status: consolidated from trigger phrases in spark's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: spark (Brand Studio / Creative Director — department leader)
date_added: 2026-07-07
---

## Purpose

Routing reference for spark: phrase → skill.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| coherence-qa | "creative review" (of a finished piece), "final check," "gate this," "ready to ship?", any outbound submission | `/spark-gate` |
| art-direction-critique | "critique this," "direct this work," "is this strong," "thoughts?", "would you ship this," in-progress work shown | `/spark-critique` |

## Precedence Rules

### Ship vs improve
Submitted to ship → gate (binary, blocking). Shown for feedback → critique (scored, advisory). When a piece arrives without saying which: in-progress fidelity → critique; final fidelity → ask, since the answer changes spark's authority.

### Coach before gate
A piece that never met the critique gets one anyway when it hits the gate with concept-level problems — logged as a process note (work arriving at the gate to discover its idea is a pipeline smell).

### Modes
`--client-safe` (critique) maps to operator-facing reviews; internal default is candid. Identity governs delivery in both; diagnosis never changes with tone.

### What spark does NOT take
- Lane audits in isolation ("is this on palette?") → atlas/lena/weave directly.
- Producing or fixing the work → pixel/lena/muse; spark reviews and directs.
- Amending kits, guides, arcs, or the separation matrix → operator (spark routes the question).
- Decision/spend gating → board.

## Fallback

Unclear submissions → ask "ship or improve?" — the two answers get two different sparks.
