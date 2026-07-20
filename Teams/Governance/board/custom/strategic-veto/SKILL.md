---
name: strategic-veto
type: custom
status: built from scratch — the catalog marked this entry "GAP: in README but folder missing" in the source system, so there is no prior art to port; designed per the constitution-enforcement pattern per 2026-07-06 discussion
based_on_catalog_entry: strategic-veto (VYON_Skills_Catalog_Full_v2.html, board/Governance) — genericized per rules 0.4/0.4b: the original logged vetoes to MEMORY.md (replaced with the configured decision log) and assumed a specific strategy store (replaced with an operator-supplied locked-commitments document, template provided)
assigned_agent: board (Governance / Governance Gate)
portable: true — the locked commitments are always per-business, operator-supplied content; this skill carries only the veto process and a fill-in template (assets/locked-commitments-template.md)
includes: assets/locked-commitments-template.md
date_added: 2026-07-06
---

## Introduction

strategic-veto tests proposals against the business's *locked strategic commitments* — the deliberate bets the operator has committed to for a defined period ("we are focused on segment X this year," "no new ventures until Y ships," "the platform stays single-market until Q4") — and vetoes proposals that materially conflict, citing the commitment verbatim and logging an appeal path. It is the mid-layer gate between the constitution (near-immutable never-do's) and config thresholds (tunable numbers): commitments change deliberately on strategy cycles, and until they're changed, they're enforced.

## Purpose

The most expensive drift in a business isn't breaking rules — it's a series of individually-reasonable decisions that quietly walk away from the strategy everyone agreed to. Each one passes the budget check and violates no constitution article; together they mean the year's focus never happened. This skill gives board the authority to say "this conflicts with what we locked in — veto, here's the appeal path," so strategy changes happen deliberately through marcus and the operator, never by accumulation.

## When to Use

Triggers: "veto check," "strategy conflict," "does this fit our strategy," or automatically in board's gate sequence after constitution-enforcement, whenever a proposal commits resources or direction.

Not for: judging whether the strategy itself is good (marcus's strategy-advisor / decision-critic territory), or blocking things the commitments simply don't cover — no commitment on point means no veto, not an improvised one.

## Structure / Protocol

```
Load locked commitments (configured path)
  -> If none exist: STOP — offer assets/locked-commitments-template.md; no veto power without a written strategy
    -> Identify which commitments the proposal touches
      -> Test for material conflict (quote the commitment, name the conflicting element)
        -> Rule: NO CONFLICT / VETO / TENSION (non-material — flag, don't block)
          -> Log ruling + appeal path to the configured decision log
```

## Instructions

### Phase 1 — Load

Read the locked-commitments document from board's config (`locked_commitments_path`). If unset or missing, stop: report that no locked commitments exist, offer the template, and make clear board has **no veto power until the operator locks strategy in writing** — a veto based on remembered or inferred strategy is exactly the drift this skill exists to prevent.

### Phase 2 — Scope

List which commitments the proposal plausibly touches and why; state which don't apply. Shown in the output — silent skips are enforcement holes.

### Phase 3 — Test for Material Conflict

For each touched commitment, quote it verbatim and apply its scope test (each commitment in the template carries one). The materiality bar: the proposal **redirects resources, attention, or positioning away from the commitment** — not merely "isn't about" it. Findings:

- **NO CONFLICT** — proposal and commitment coexist.
- **VETO** — material conflict. Cite the commitment ID, its verbatim text, the specific conflicting element of the proposal, and the commitment's expiry/review date (a veto is a "not while this commitment stands," never a permanent judgment on the idea).
- **TENSION** — real but non-material friction (e.g., partial attention dilution). Flagged to the operator with reasoning; does not block.

### Phase 4 — Appeal Path

Every VETO ships with its appeal path, always the same shape: **(a)** the proposer may ask the operator to amend or retire the commitment through the strategy process (marcus + operator — board does not amend commitments itself), or **(b)** re-scope the proposal to remove the conflicting element and resubmit. The veto log records which path (if any) was taken and the outcome.

### Phase 5 — Log

Record every ruling — proposal, commitments tested, finding, appeal path, outcome — to the configured decision log. Veto history is precedent: repeated vetoes against the same commitment signal either persistent drift pressure or a commitment that no longer fits, and both are worth surfacing to marcus at the next strategy review.

## Output Format

```
## Strategic Veto Review: [proposal, one line]

**Commitments document:** [file/version/date loaded]

### Commitments Touched
[ID + why it applies; commitments excluded + why not]

### Findings
| Commitment | Quoted text | Finding | Conflicting element / reasoning |
|---|---|---|---|

### Ruling: NO CONFLICT / VETO / TENSION
[If VETO: commitment cited, expiry/review date, and the two appeal paths.
 If TENSION: what to watch, flagged to the operator.]

### Logged
[Where recorded; repeated-veto pattern noted if applicable]
```

## Principles

- **No written commitments, no veto power.** Board never vetoes from remembered, inferred, or "obvious" strategy.
- **Quote, don't paraphrase.** Same rule as constitution-enforcement — paraphrase is interpretation drift.
- **A veto is time-bound.** It cites a commitment with an expiry/review date; it is not a permanent ruling on the idea's merit.
- **Every veto carries its appeal path.** A veto without a path to amend or re-scope is a wall, not governance.
- **No conflict means no veto.** Gaps in the commitments are the operator's to fill, not board's to improvise around.
- **Repeated vetoes are a signal, not a success.** Surface the pattern to marcus — either drift pressure is real or the commitment is stale.

## Fallback

- Commitments path unset / file missing → stop at Phase 1, offer the template.
- Commitments exist but are vague ("focus on growth") → still test, but flag findings as interpretation of untestable language and recommend the operator tighten them per the template's scope-test structure.
- Proposal too vague to test → ask for the specific resource/direction commitment in it, rather than ruling on a summary.
- Decision log unset → deliver the ruling to the operator directly and say so.

## Boundaries with Other board Skills

- Runs **after** constitution-enforcement (categorical rules first), alongside/before fiduciary-guard: a proposal can clear the budget arithmetic and still be vetoed for strategy conflict — the checks are independent.
- constitution-enforcement owns near-immutable never-do's; this skill owns deliberately-locked, expiring strategy bets. If a "commitment" is meant to hold for years regardless of strategy, it belongs in the constitution.
- Boundary with marcus: marcus (with the operator) *sets and amends* the locked commitments (okr-cascade, strategy-advisor, decision-critic); board only *enforces* them. Appeal path (a) routes there.
- risk-assessment-matrix and pre-mortem evaluate proposals that survived this gate — a vetoed proposal doesn't consume further review.
