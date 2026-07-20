---
name: regression-map
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: regression-map (VYON_Skills_Catalog_Full_v2.html, quinn/Engineering) — genericized per rule 0.4b; expanded into the department's self-annealing mechanism per ENGINEERING-REDESIGN-PLAN §4
marketplace_search: 2026-07-09 skillsmp.com — searched regression/flaky-test skills; agentic-qe's regression-risk-analyzer is an automated selector, not a curated fragility registry; kept custom (the registry IS the institutional memory, not a heuristic)
assigned_agent: quinn (Engineering / QA)
portable: true — the registry format is stack-agnostic; entries are per-business content
includes: assets/regression-map-template.md
date_added: 2026-07-09
---

## Introduction

regression-map is the department's memory of where the system is fragile: a curated, append-only registry of areas that have broken before (or that cypher/aegis proved breakable), each guarded by a named targeted-regression suite. Any diff touching a mapped area must run that area's suite at quinn's gate. It is the self-annealing mechanism — every incident, every red-team finding, every recurring flake makes the map (and therefore the gate) smarter.

## Purpose

Systems don't break uniformly; they break where they've always broken — the timezone handling, the payment retry, the auth edge case. Teams re-learn this the hard way because the knowledge lives in nobody's head after a quarter. The map writes it down and wires it into the gate, so the third regression in the same spot is caught by procedure, not by luck.

## When to Use

Triggers: "regression map," "fragile areas," "has this broken before," "add a map entry," post-incident (ops's post-mortem output), cypher/aegis finding closed, flaky test recurring, and automatically at every gate check (test-strategy consults it).

## Structure / Protocol

```
FEED (what creates/updates entries — self-annealing inputs)
  ops post-mortem → entry (what broke, why, the guard test)
  cypher finding closed → entry (the attack path, the guard)
  aegis vuln fixed → entry (the vuln class + surface)
  bug fix merged → entry (per gate-matrix: the fix's failing-test-first becomes the guard)
  flaky test recurring → flaky register entry (owner, date, quarantine status)

USE (what the map does at the gate)
  Diff arrives → map areas touched? (paths/modules/flows per entry)
    -> YES → that entry's targeted suite is REQUIRED in quinn's gate (tier R)
    -> NO → standard matrix tiers only

RETIRE (the only way out)
  Entry retired ONLY when the fragility is architecturally removed — the change that removes it
  cites an ADR, and the entry is marked retired-by-ADR-NNN (append-only; never deleted)
```

## Instructions

1. **Every incident feeds the map.** An ops post-mortem that doesn't produce a map entry (or explicitly justify why none is needed) is incomplete — this is the self-annealing loop's load-bearing step.
2. **Entries are specific and testable.** Per the template: the area (paths/modules/flows), why it's fragile (incident/finding refs — real events, not vibes), the guard (named test suite that exercises the failure mode), and history (dates it broke). An entry without a runnable guard is a TODO, flagged.
3. **The gate consults the map.** Touched-area matching runs on every gate check; a match makes the entry's suite mandatory (matrix tier R). No guard suite exists yet → the gate FAILS on the map entry's TODO — fragility without a guard blocks, it doesn't warn.
4. **Flaky register.** Recurring flaky tests live here: test, suspected cause, owner, quarantine date. Quarantined tests count as coverage holes (test-strategy's rule) until fixed or their subject is guarded another way.
5. **Retire by architecture, not by optimism.** "It hasn't broken in a while" never retires an entry. Only structural removal of the fragility — cited to the ADR that did it — retires one, and retired entries stay in the file as history.
6. **No invented fragility.** Entries trace to real events (incidents, findings, fix history). Speculative "this looks scary" areas may be listed in a separate watchlist section, labeled reasoning-based per rule 0.6, and don't gate.

## Output Format

```
## Map Check: [diff/change]
Areas touched: [none / entry ids]
Required targeted suites: [list] — present+green: [✓/✗]
Flaky-register impact: [none / holes]
→ feeds test-strategy gate verdict (tier R)

## New Entry: [id] — [area]
Source event: [incident/finding/fix ref] · Guard: [suite] · History: [dates]
```

## Principles

- **Fragility is a fact with a citation** — entries trace to real breaks, findings, or fixes; speculation is a labeled watchlist, and it doesn't gate.
- **No guard, no pass** — a mapped area without a runnable guard blocks the gate; unguarded known fragility is the worst kind.
- **Append-only, retire-by-ADR** — the history is the value; optimism retires nothing.
- **Every post-mortem feeds the map or says why not** — the annealing loop has no silent exits.
- **The map makes the gate smarter, not bigger** — targeted suites for touched areas, not blanket full-suite runs.

## Fallback

- Empty map (new business) → normal; it fills from the first incident/finding. State that gate tier R is inactive until entries exist.
- Guard suite is too slow for per-change runs → split: a fast targeted core (gates) + the full suite (scheduled); the split is recorded in the entry.
- Disagreement over whether an area is "touched" → err toward running the suite; repeated false-positive matching refines the entry's path/flow definition (logged as an entry correction, by reference).

## Boundaries with Other Skills

- **test-strategy** (sibling) owns the gate; this map supplies tier R's requirements and the flaky register that its floors count.
- **ops** (incident-response) authors post-mortems; this skill turns them into guarded entries — the handoff is mandatory in both directions.
- **charter-enforcement** (sibling) routes closed cypher/aegis findings here as entries — a finding isn't closed until it's mapped.
- **dev/architecture-decisions**: retirement requires the ADR that removed the fragility; the map cites it.
