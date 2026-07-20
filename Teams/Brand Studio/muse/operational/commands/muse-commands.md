---
name: muse-commands
type: operational/commands
status: consolidated from trigger phrases in muse's skill files — no new triggers invented
assigned_agent: muse (Brand Studio / Ideation)
date_added: 2026-07-07
---

## Purpose

Routing reference for muse.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| generate-creative-ideas | "campaign ideas," "brainstorm this," "I'm stuck," "give me concepts," "content ideas" | `/muse-ideate` |
| concept-library | "have we done this before," "what's in the reserve," "log this concept," "why was X rejected" | `/muse-library` |
| (full pipeline) | any ideation brief — generation always closes with the library phase | `/muse-run` |

## Precedence Rules

### Generation always closes with the library
No run ends at a raw idea list: dedupe → score → top-3-to-spark → register is the mandatory tail.

### Divergent before convergent, always
Never score while generating (the source's rule 1); pushes past first-round outputs before any NAF pass.

### What muse does NOT take
- Developing the creative → lena/pixel/pulse per format.
- Narrative positioning → weave. Final review/gate → spark.
- Growth experiment ideas → muse generates; nate's ICE backlog owns them after.

## Fallback

Unclear ask → the source skill's context questions ("what problem? what have you tried?") before any technique fires.
