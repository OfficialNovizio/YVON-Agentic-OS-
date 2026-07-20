---
name: venture-priority-matrix
type: custom
status: built from scratch (catalog protocol expanded per user discussion, not a marketplace copy)
based_on_catalog_entry: vyon-venture-priority-matrix (VYON_Skills_Catalog_Full_v2.html, marcus/Executive Office) — renamed venture-priority-matrix, genericized off "vyon-" prefix and off hardcoded venture names (Novizio/Hourbour/Platform) per portability goal; scoring criteria expanded from 3 to 6 factors per 2026-07-02 discussion
assigned_agent: marcus (Executive Office / Orchestrator)
portable: true — "initiative" is a placeholder for any comparable unit (venture, department, project); no hardcoded business names
includes_script: scripts/priority_matrix.py (Python — weighted scoring/ranking math)
data_access: none yet — accepts structured input per run; a standing tracked data source (spreadsheet/connector) was discussed and deferred as a separate future task
date_added: 2026-07-02
---

## Introduction

venture-priority-matrix scores competing initiatives — ventures, departments, or projects, any comparable unit — against each other on a consistent set of factors, so resource-allocation decisions between them are defensible and repeatable rather than ad hoc. It replaces "which one does marcus feel like backing" with a documented method anyone can audit and re-run.

## Purpose

When two or more initiatives are asking for the same limited pool of budget, headcount, or executive attention, this skill produces a ranked list with a transparent rationale for the ranking, and flags close calls for human escalation instead of quietly picking a winner.

## When to Use

Triggers: "which venture first," "prioritize initiatives," "resource conflict," "who gets the budget," or any time two or more initiatives are competing for the same finite resource and a documented, defensible ranking is needed — not just an opinion.

## Structure / Protocol

```
Collect initiatives + scores (6 factors, 1-5 each) + OKR-alignment multiplier
  -> Run scripts/priority_matrix.py to compute benefit, cost/risk, and final scores
    -> Rank descending, flag ties
      -> Present ranked list + rationale per initiative
        -> Escalate ties (and any result the operator disputes) to the board
```

## Scoring Factors

Six factors, each scored 1-5 by the operator (or by marcus with the operator's input — never invented without basis):

**Benefit factors (higher is better):**
- **revenue_impact** — expected effect on revenue.
- **strategic_fit** — how directly this serves the current strategy/OKRs (distinct from the OKR-alignment multiplier below, which is about *this quarter's* stated objectives specifically; strategic_fit is about longer-horizon fit).
- **runway_effect** — effect on cash runway (cost savings, capital efficiency, or burn increase scored low).
- **time_to_impact** — how soon results would show up; 5 = fastest.

**Cost/risk factors (higher is worse):**
- **resourcing_cost** — how much budget/headcount/attention this consumes.
- **risk** — downside risk if it fails or underdelivers.

**Multiplier:**
- **okr_alignment** (1.0–1.5) — how directly this initiative serves the current quarter's OKRs (see `okr-cascade`'s output). 1.0 = neutral, 1.5 = directly serves a top-priority current-quarter key result.

## Instructions

1. **Collect initiatives.** Get the full list of initiatives competing for the resource in question. Don't score in isolation — always compare against the full competing set.
2. **Score each factor.** For each initiative, assign 1-5 on each of the six factors, and 1.0-1.5 for okr_alignment. Scores should come from the operator's actual knowledge or provided data — if a factor genuinely can't be scored yet (e.g. revenue impact unknown for a pre-launch initiative), say so explicitly rather than guessing a middle value and presenting it as known.
3. **Build the input file.** Write the initiatives as JSON matching the schema documented at the top of `scripts/priority_matrix.py`.
4. **Run the script.** Execute `python scripts/priority_matrix.py <input.json>` (optionally with `--weights <weights.json>` to emphasize specific factors, and `--out <ranked.json>` to save results). The script computes:
   - `benefit_score` = mean of the four benefit factors (weighted if weights given)
   - `cost_risk_score` = mean of the two cost factors (weighted if weights given)
   - `raw_priority` = benefit_score − cost_risk_score
   - `final_score` = raw_priority × okr_alignment
5. **Rank and flag ties.** The script sorts descending by final_score and flags any two initiatives within 0.01 of each other as tied.
6. **Present the ranked list** with a one-line rationale per initiative tying its score back to the specific factors that drove it (not just "it scored higher").
7. **Escalate.** Any tie, or any result the operator disagrees with on inspection, goes to the board per the escalation principle below — this skill produces a recommendation, not a unilateral decision.

## Output Format

```
## Venture/Initiative Priority Ranking: [scope/date]

| Rank | Initiative | Benefit | Cost/Risk | Raw | OKR× | Final | Flag |
|---|---|---|---|---|---|---|---|
[one row per initiative, from script output]

### Rationale
[One paragraph per initiative: what drove its score up or down]

### Escalations
[Ties or disputed results, named explicitly, routed to the board]

### Assumptions / Unscored Factors
[Anything that couldn't be scored with confidence and why]
```

## Principles

- **Comparative, not absolute.** Scores only mean something relative to the other initiatives in the same run — don't reuse a score from a prior, different comparison set.
- **No invented data.** If a factor can't be scored with real information, say so — don't default to a middle value and present it as known.
- **Escalate ties, don't break them silently.** A tie is a signal that the method has reached its resolution limit for this decision; a human call is appropriate, not an arbitrary tiebreaker.
- **Transparent method over a black-box score.** Every ranked output must show the component scores, not just the final number, so the operator can see *why*.
- **Weights are visible, not hidden.** If non-default weights are used, state them explicitly in the output.

## Fallback

- If fewer than two initiatives are provided, this skill doesn't apply — there's nothing to compare. Say so rather than scoring a single initiative in isolation.
- If `okr_alignment` inputs aren't available (e.g. `okr-cascade` hasn't been run yet for the current quarter), default every initiative to 1.0 (neutral) and flag this explicitly in Assumptions — don't guess differentiated multipliers.
- If the Python environment isn't available for some reason, fall back to the same formula computed manually/via reasoning in the skill instructions, but flag that it was not run through the script (audit trail difference).
- No standing data source is wired up yet — inputs must be provided in the conversation or as a file each run. If the operator wants a persistent, tracked source (e.g. a spreadsheet of active initiatives updated over time), that's a separate future task, not assumed here.

## Boundaries with Other marcus Skills

- venture-priority-matrix consumes `okr-cascade`'s output (via okr_alignment) but does not generate OKRs itself.
- Any close or high-stakes ranking result should be run through `decision-critic` before being finalized as a recommendation to the board.
