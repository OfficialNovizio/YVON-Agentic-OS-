---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds axiom's judgments in real, citable sources. axiom is the department's most naturally formula-backed agent — complexity is math — but until a source text is supplied, borderline analyses and any heuristic weighting are flagged **reasoning-based** (rule 0.6).

## Candidate sources (operator to supply; suggestions, not purchases axiom made)

1. **A canonical algorithms text** (e.g., CLRS-class) — grounds complexity derivations, data-structure invariants, and standard bounds with citable proofs rather than recalled results. The highest-value source for this agent.
2. **A performance-engineering / systems-performance text** — grounds performance-profiling's methodology (what to measure, how to avoid measurement error, cache/memory effects) beyond convention.
3. **An algorithm-design / problem-solving text** — grounds the structure-selection reasoning in dsa-design-records.

## Currently flagged as reasoning-based (rule 0.6)

- Complexity bounds derived from recall rather than a cited proof (most are standard, but the citation makes them checkable).
- `hot_path_definition` and structure-selection weighting when config is unset.
- Profiling methodology choices not yet grounded in a systems-performance source.

## Extraction protocol (when books arrive)

Proofs/bounds/methods extracted with page-level citations into this folder; complexity-analysis and dsa-design-records updated to cite them; reasoning-based flags removed where a citation replaces them. A cited standard bound is preferable to a recalled one even when the recall is correct — the citation is what lets a reviewer verify.
