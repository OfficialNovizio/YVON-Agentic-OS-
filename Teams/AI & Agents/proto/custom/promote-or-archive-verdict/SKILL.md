---
name: promote-or-archive-verdict
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-agent-prototype-kit protocol step 3 ("2-week verdict: promote to build queue or archive with learnings"), expanded to its own skill
assigned_agent: proto (AI & Agents / Prototyping)
portable: true
date_added: 2026-07-10
---

# Promote-or-Archive Verdict

## Introduction
The hard stop at every prototype's expiry: score against frozen criteria, then exactly one of PROMOTE (into the Rail 3 new-agent path) or ARCHIVE (with learnings captured). Silence = archive. Default-promote is forbidden (Fleet Charter Rail 4).

## Purpose
Prototypes that linger become shadow agents — unaudited, half-caged, load-bearing by accident. A mandatory verdict keeps the cage meaningful and turns even failures into recorded learnings.

## When to Use
- A prototype's expiry date arrives (calendar-driven, not memory-driven — the registry's expiry field is the trigger).
- An operator/agent asks for an early verdict (allowed; early archive is always available, early promote still needs full criteria).

## Structure / Protocol
SCORE (eval-first-design's frozen criteria, mechanical where possible) → VERDICT (all criteria pass → PROMOTE eligible; any fail → ARCHIVE, or a documented operator override to promote-with-known-gaps — visible, signed) → if PROMOTE: PROPOSAL (Rail 3 new-agent proposal via meta: full house structure per agent-architecture-standards, migration from prototype shape itemized) → if ARCHIVE: LEARNINGS (what the hypothesis taught, verbatim evidence → anneal's lessons ledger; the prototype's artifacts archived read-only) → REGISTRY (meta: state change either way).

## Instructions
1. The verdict is against FROZEN criteria only — mid-flight impressions, sunk cost, and "so close" are inadmissible. (This is a discipline skill; the rationalization table below exists because pressure is guaranteed.)
2. PROMOTE produces a proposal, not an agent: board/operator gate it like any fleet change; the prototype stays caged until the proposal lands.
3. ARCHIVE is a success mode: the learnings entry is mandatory and specific (which criterion failed, why, what would change the answer). An archive without learnings is a wasted experiment.
4. Expiry with no verdict logged → auto-archive, flagged in gauge's health report (a missed verdict is a process failure worth seeing).
5. Re-prototyping an archived hypothesis requires the delta stated against the learnings entry (scout's re-open discipline, borrowed).

| Rationalization | Reality |
|---|---|
| "It just needs another week" | Extension is a Rail 3 proposal, once. Otherwise: verdict now. |
| "It's basically passing" | Any fail = archive or a SIGNED operator override. "Basically" is a fail. |
| "We already use it for real work" | That's a shadow agent — worse than archiving. Verdict now, incident if load-bearing. |
| "Archiving wastes the work" | The learnings entry IS the work. Lingering wastes it. |

## Output Format
Verdict record: scored table, PROMOTE/ARCHIVE, proposal ref or learnings-ledger ref, registry state change.

## Principles
- Every prototype ends on a date, on purpose, in writing.
- Archive is success; shadow agents are the only failure.
- Overrides exist — visible and signed, never implied.

## Fallback
Criteria couldn't be scored (measurement infrastructure failed mid-trial)? Verdict is ARCHIVE with `unscoreable — infrastructure` learnings, and the re-prototype delta is "fix the measurement" — never promote on unscored criteria.

## Boundaries with Other Skills
- Consumes eval-first-design's frozen criteria; ends agent-prototype-kit's cage.
- PROMOTE path: meta (architecture standards + registry + governance). ARCHIVE path: anneal (lessons ledger).
- gauge surfaces missed verdicts.
