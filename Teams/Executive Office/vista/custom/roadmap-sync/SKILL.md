---
name: roadmap-sync
type: custom
status: built from scratch (no marketplace fit — 2026-07-06 search found only code-repo drift tools: ROADMAP.md checkbox reconciliation, GitHub/Linear sync, docs audits; none at business-roadmap altitude)
based_on_catalog_entry: vyon-roadmap-sync (VYON_Skills_Catalog_Full_v2.html, vista/Executive Office) — renamed roadmap-sync, genericized off "vyon-" prefix; the catalog's hardcoded escalation to "diana" (Ops agent, not yet built) replaced with a configurable delivery-owner contact per rule 0.4b
assigned_agent: vista (Executive Office / Roadmap Lead)
portable: true — roadmap items, sprint cadence, and thresholds are all operator-supplied; no venture or tooling assumptions
includes_script: scripts/roadmap_sync.py (Python, stdlib only — computes slip, classifies status, renders the drift table; tested 2026-07-06)
date_added: 2026-07-06
---

## Introduction

roadmap-sync detects drift between the committed quarterly roadmap and what is actually shipping, sprint by sprint — and instead of just reporting lateness, proposes what to do about it: cut, defer, or accelerate. Built from scratch against the catalog entry; the drift math is deliberately plain (sprints late = projected − committed) with no invented scoring, and the deterministic part (slip computation, classification, table rendering) lives in `scripts/roadmap_sync.py`.

## Purpose

Plans drift quietly. A roadmap item that slips one sprint rarely announces itself; by the time it has slipped three, the quarter is unrecoverable. This skill gives vista a repeatable checkpoint that surfaces slippage early, classifies it consistently, and converts every flagged item into a decision-ready recommendation for marcus — rather than a status report nobody acts on.

## When to Use

Triggers: "roadmap drift," "are we on plan," "sync the roadmap," "sprint review vs roadmap," "what's slipping," or on a recurring cadence (typically once per sprint, after sprint output is known).

Not for: sequencing what goes ON the roadmap (that's `rice-prioritization`), or grading quarter-end outcomes (that's `okr-quality-checker`).

## Structure / Protocol

```
Establish baseline (committed roadmap + sprint targets — if none exists, stop)
  -> Collect actuals per item (sprint output, status — never assumed)
    -> Compute drift via scripts/roadmap_sync.py (slip = projected − committed sprint)
      -> Classify: on-track (≤0) / watch (1) / flagged (≥2, configurable)
        -> Propose per flagged item: cut / defer / accelerate, with trade-offs
          -> Route: flagged items + recommendations to marcus; delivery-owner notified
```

## Instructions

### Phase 1 — Establish the Baseline

Load the committed roadmap: each item's name, its committed completion sprint (or quarter position), and — where available — which NSM input it feeds (see `north-star-metric`) and its RICE score (see `rice-prioritization`). If no committed roadmap with sprint targets exists, stop and say so: there is nothing to sync against. Route the operator to `rice-prioritization` to sequence one first. Do not reconstruct a "probably intended" roadmap from memory.

### Phase 2 — Collect Actuals

For each item, get the current state: projected completion sprint (from the team's own estimate or observable progress) and optionally percent complete. Actuals come from the operator or the configured delivery source — never estimated by vista to fill a gap. If an item's actual state is unknown, list it as **unknown**, not as on-track.

### Phase 3 — Compute Drift

Build the input JSON per the schema at the top of `scripts/roadmap_sync.py` and run:

```bash
python scripts/roadmap_sync.py <input.json>              # markdown drift table
python scripts/roadmap_sync.py <input.json> --format json  # machine-readable
```

The script computes, per item: `slip = projected_sprint − committed_sprint`, classifies status, and sorts flagged items first. The flag threshold defaults to **2 sprints** (catalog value) and is configurable via the input file — changing it is an operator decision, not vista's.

### Phase 4 — Classify

- **on-track** — slip ≤ 0.
- **watch** — slip = 1. No action proposed yet; named so the next sync run compares against it.
- **flagged** — slip ≥ threshold (default 2). Every flagged item must get a Phase 5 recommendation.
- **unknown** — no reliable actual. Treated as its own class; an unknown is a data problem to fix, not a pass.

Percent complete, where provided, is reported alongside as context — it is not scored or thresholded (no invented pace formula; see Principles).

### Phase 5 — Propose Options

For each flagged item, lay out the three options with honest trade-offs:

- **Cut** — remove from the quarter. State what is lost: which NSM input stops being fed, what downstream items depended on it.
- **Defer** — move to next quarter explicitly. State the cost of carrying it: stale context, blocked dependents, and that deferral without a named new slot is a slow-motion cut.
- **Accelerate** — add resources or descope neighbors to recover the date. State what gets starved to pay for it (name the specific items losing capacity).

Where the item has a RICE score or a named NSM input, use them in the recommendation ("lowest RICE score of the flagged set — cheapest cut" / "feeds the top NSM input — accelerate before cutting"). Where neither exists, say the recommendation is judgment-based.

### Phase 6 — Route

The drift table plus per-item recommendations go to **marcus** for the actual cut/defer/accelerate decision — vista recommends, never decides. The configured delivery-owner contact (see `operational/agent/` config when built; until then, the operator directly) is notified of flagged items so the delivery side isn't surprised by the escalation.

## Output Format

```
## Roadmap Sync: [scope / sprint N of M / date]

| Item | Committed | Projected | Slip | % done | Status | NSM input | RICE |
|---|---|---|---|---|---|---|---|
[from script output, flagged first]

### Flagged Items — Options
[Per flagged item: cut / defer / accelerate, trade-offs, recommendation + basis (RICE/NSM or judgment)]

### Watch List
[Slip-1 items, carried forward for next run's comparison]

### Unknowns
[Items with no reliable actuals — named as data gaps to close, not passed]

### Routing
[What goes to marcus for decision; who was notified]
```

## Principles

- **No invented pace math.** Slip in sprints is the one metric; percent complete is context, not a score. If a richer drift formula is ever wanted, that's a logical-layer discussion (rule 0.6), not something to improvise here.
- **Unknown ≠ on-track.** Missing actuals are surfaced as their own class, never defaulted to green.
- **Recommend, don't override.** Cut/defer/accelerate is marcus's call; vista's job is making that call easy and well-informed.
- **Every flagged item gets options, not just a red cell.** A drift report without recommendations is a status report; this skill exists to be more than that.
- **Deferral is named as a cost, not a free pass.** "Defer" without a committed new slot is flagged as an implicit cut.
- **Same threshold every run.** The flag threshold is set in config and changed deliberately — not adjusted mid-quarter to make a report look better.

## Fallback

- No committed roadmap → stop at Phase 1, route to `rice-prioritization`.
- Actuals unavailable for most items → produce the table anyway with unknowns dominating, and make closing the data gap the top recommendation.
- Python unavailable → compute slip = projected − committed manually per item using the same classification; flag that the run wasn't script-computed (audit trail difference).
- RICE scores / NSM inputs not established yet → omit those columns, state recommendations are judgment-based, and note which upstream skill would strengthen them.

## Boundaries with Other vista Skills

- `rice-prioritization` decides what goes on the roadmap; roadmap-sync monitors whether the decided roadmap is actually happening. An accelerate/cut decision that reshuffles remaining capacity should trigger a RICE re-run.
- `north-star-metric` supplies which NSM input each item feeds — the main tiebreaker between cutting and accelerating a flagged item.
- `okr-quality-checker` grades outcomes at quarter end; roadmap-sync is the in-quarter early warning that makes those grades less surprising.
- Escalation target is **marcus** (okr-cascade owns the quarterly objectives this roadmap serves); vista does not finalize cut/defer/accelerate calls.
