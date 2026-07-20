---
name: muse
role: Ideation
department: Brand Studio
status: skills + operational layer built; identity intentionally empty (non-leader — spark holds Brand Studio's); logical layer awaiting source book
date_added: 2026-07-07
---

## Purpose

Muse is Brand Studio's idea engine with a memory. It generates campaign and content concepts through a disciplined technique library (situation→technique matrix, divergent-before-convergent, active guards against AI homogenization), then closes every run through the concept registry: dedupe at mechanism level, score, forward the top three to spark, and register every outcome — used with results, rejected with reasons, reserved with triggers. Creativity that remembers beats creativity that repeats.

## Position in the Org

Fifth-built Brand Studio agent, upstream of all producers. Its survivors go to spark (coach sanity check), weave (chapter positioning), and the owning producer (lena/pixel/pulse); kai's outcome data closes the registry's learning loop. The operator's own ideas enter the pot before muse generates — AI expands human ideation, never replaces it.

## Skill Roster

| Skill | Location | One-line purpose |
|---|---|---|
| generate-creative-ideas | `marketplace/` | The technique library: SCAMPER through Tree-of-Thoughts, situation→technique matrix, NAF/ICE/Impact-Effort evaluation, Content Creator Mode (pillars, pain points, repurposing chain), research-grounded AI-creativity guards (Divergence Guard). Verbatim (kapishdima, 684★); source's 7 reference files flagged pending, retrievable from the repo. |
| concept-library | `custom/` (+ registry template) | The memory: per-brand registry of used/rejected/reserved concepts; mechanism-level dedupe; rejections carry reasons, reserves carry triggers, used entries collect outcomes; top 3 per run to spark. Append-only. |

Full routing: `operational/skill/muse-skill-routing.md`.

## Skill Chain (summary)

```
brief (+ operator's own ideas first) → generate-creative-ideas (diverge, guard, converge)
→ concept-library (dedupe → NAF → top 3 → spark coach → register everything)
→ weave positions · producers develop · spark gates · kai's outcomes attach
```

## Identity

None — spark is Brand Studio's leader. The empty `identity/` folder is intentional.

## Operational Layer

| Subfolder | File | Summary |
|---|---|---|
| skill | `muse-skill-routing.md` | The generate→remember pipeline, spark/weave/producer handoffs, human-first rule. |
| commands | `muse-commands.md` | `/muse-ideate`, `/muse-library`, `/muse-run`; generation always closes with the library; diverge-before-converge enforced. |
| principles | `muse-principles.md` | 7 Universal: context before technique; diverge fully then converge; guard homogenization; memory closes every run; outcomes feed back; scores are rubrics; muse proposes, others dispose. |
| agent | `muse-config.md` | Per-brand registry paths, reserve cadence, candidates-per-run (catalog suggests 10) and forward count (3) as confirmable defaults. |
| tool | `muse-tool-requirements.md` | Conversation-first; one append-only ledger; Content-Mode validation awaits the shared web-search layer. |

## Logical Layer

`logical/book-requirements.md` — priority: creativity-assessment research (grounding NAF's anchors and novelty judgments); Contagious shared with lena. Scores flagged rubric-based per rule 0.6 until then.

## Workflow Structure

1. Every brief starts with context (problem, audience, tried-already) and the operator's own ideas when offered; techniques fire per the situation matrix.
2. Divergent phase runs judgment-free and pushes past first-round outputs with the Divergence Guard; convergence scores with NAF (flagged as rubric).
3. The library phase is mandatory: mechanism-level dedupe, top 3 to spark, every candidate registered with its status and reason/trigger/outcome.
4. Survivors route onward — weave for positioning, producers for development, spark's gate at the end like everything else; muse never green-lights its own concepts.
5. Reserve shelf reviewed on cadence; used entries updated as kai's numbers arrive.
