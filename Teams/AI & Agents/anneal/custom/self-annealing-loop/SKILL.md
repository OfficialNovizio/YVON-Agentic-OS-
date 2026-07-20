---
name: self-annealing-loop
type: custom
status: built from scratch
fulfills_catalog_entry: none — mechanizes the blueprint's core promise (self-annealing: lessons flow back into the text), previously unstaffed
assigned_agent: anneal (AI & Agents / Skill Lifecycle & Annealing)
portable: true
date_added: 2026-07-10
---

# Self-Annealing Loop

## Introduction
The system's learning mechanism: every lesson — post-mortem, reflection entry, degradation diagnosis, audit finding, rejected proposal — gets converted into a concrete, board-gated edit to the skill text that should have prevented it. Heat, then a stronger structure: annealing.

## Purpose
A lesson that lives only in memory or a report is a lesson the next session forgets. The fleet's substance is plain text; learning that doesn't land in the text didn't happen.

## When to Use
- Any post-mortem or incident write-up lands (ops' blameless post-mortems, fleet-governance incidents).
- forge closes a diagnosis with a "skill issue" verdict.
- A reflection/lesson entry names a gap ("X should have caught this").
- Quarterly: sweep for lessons that never became edits.

## Structure / Protocol
CAPTURE (lesson, verbatim source attached) → LOCATE (which skill file SHOULD have prevented this — one primary, or "no skill exists" → gap finding to meta) → DRAFT (minimal edit: the writing-skills discipline — address the specific failure, no speculative extras) → TEST (baseline: show the failure happens under the current text; per meta's writing-skills method) → PROPOSE (Rail 3 → board) → APPLY + VERSION (skill-lifecycle) → VERIFY (gauge re-measures; the same failure re-attempted must now be caught).

## Instructions
1. Every lesson gets a disposition within one cadence period: edit-proposed / gap-reported / explicitly-no-action (with reasoning). Silence is not a disposition.
2. The LOCATE step is honest: if no existing skill should have caught it, that's a missing-skill finding routed to meta (a new-agent/new-skill question), not a shoehorned edit.
3. Minimal-edit discipline: the proposal's diff addresses the documented failure and nothing else. "While we're in there" is a separate proposal.
4. The TEST step follows meta's marketplace `writing-skills` (REQUIRED BACKGROUND): a lesson-driven edit without a demonstrated baseline failure is speculation — the incident itself usually IS the baseline; cite it.
5. Closure: the loop closes only when gauge's re-measurement (or a re-run of the failure scenario) confirms the edit binds. anneal's word doesn't close anneal's loop.
6. Keep a lessons ledger (append-only): lesson → disposition → proposal ID → closure evidence. The quarterly sweep walks this ledger.

## Output Format
Lessons-ledger entries; minimal-diff proposals per meta's template with baseline evidence attached.

## Principles
- Lessons land in text or they didn't happen.
- Minimal edits: anneal strengthens the metal, it doesn't resculpt it.
- The incident is the failing test — never waste one.

## Fallback
Lesson source is thin (a vague "this felt wrong")? Park it in the ledger as `insufficient-evidence` with what evidence WOULD suffice — don't fabricate a baseline, don't discard the signal.

## Boundaries with Other Skills
- skill-lifecycle applies what this skill proposes.
- prompt-context-engineering handles lessons about HOW agents think (prompting/context), same loop.
- ops' incident-response (Engineering) produces the post-mortems; sentinel/precedent archive; gauge verifies closure.
