---
name: prd-discipline
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-prd-template (prefix stripped; per-product specifics moved to operator product profiles)
assigned_agent: spec (Product / Product Manager, department leader)
portable: true
date_added: 2026-07-10
---

# PRD Discipline

## Introduction
The house standard for what a PRD is: problem, evidence, scope, explicit out-of-scope, and acceptance criteria written to be testable at quinn's gate. The Evidence Gate's document-shaped enforcement point.

## Purpose
PRDs without evidence are feature requests in formalwear; PRDs without out-of-scope sections grow silently; criteria quinn can't test are wishes. This skill makes each failure structurally impossible.

## When to Use
- Any feature/product idea survives opportunity-assessment and needs specification.
- An existing PRD is amended (same discipline, versioned).
- Engineering bounces criteria as untestable (repair loop).

## Structure / Protocol
Every PRD, same order: (1) PROBLEM — whose, observed where; (2) EVIDENCE — citations to ux repo entries, metric reads, or loom verdicts (the Evidence Gate: no citations, no PRD); (3) PROPOSED SCOPE — smallest coherent slice; (4) OUT-OF-SCOPE — explicit, named, with the "not yet vs not ever" tag; (5) SUCCESS METRIC — the ONE metric (from metric's spec, by its versioned definition) this ships to move, with target `<FILL_IN per PRD>`; (6) ACCEPTANCE CRITERIA — testable statements per acceptance-criteria-handoff's standard; (7) RISKS + rollback stance.

## Instructions
1. Evidence citations are real references (repo entry IDs, scorecard lines, experiment registry IDs) — "users want this" uncited bounces at intake.
2. The success metric uses metric's versioned definition by name — a PRD inventing its own "activation" is a metrics-governance violation.
3. Out-of-scope is written before scope review — it's the negotiation surface, not an afterthought.
4. Amendments version the PRD (dated changelog in the doc); the shipped-against version is frozen at handoff.
5. A PRD whose evidence is only opinion-level (validation ladder 1–2, per loom's shared ladder) must say so and route through loom for a cheap falsifying test before Engineering sees it — unless the operator explicitly overrides (recorded).

## Output Format
The 7-section PRD; amendment changelogs; bounce notices citing the failed section.

## Principles
- No evidence, no PRD; no out-of-scope, no scope; no testable criteria, no handoff.
- One success metric — a PRD that moves "several things" moves nothing accountably.
- Written to be falsified: a PRD that can't fail its metric read is decoration.

## Fallback
Genuinely evidence-free but operator-mandated ("strategic bet")? The PRD says `EVIDENCE: operator directive <ref>, validation ladder L1` honestly — the gate records the exception rather than laundering it.

## Boundaries with Other Skills
- opportunity-assessment precedes (whether to spec at all); backlog-rules sequences; acceptance-criteria-handoff delivers.
- metric owns metric definitions; ux/loom own the evidence kinds; vista owns roadmap placement.
