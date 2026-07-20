---
name: rice-prioritization
agent: vista
department: Executive Office
version: 1.0.0
tier: 2
description: |
  Scores and ranks roadmap items with RICE — operator calibration, parallel per-item scoring, then a synthesized ranked report (yvon)
triggers:
  - rice
  - rice score
  - prioritize backlog
  - rank features
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Executive Office/vista/marketplace/rice-prioritization/SKILL.md
  source_hash: 3de9e3139f140e3aa49d0103cd0af901011a00fae02a23e2f7faa50e4872d856
  generated: 2026-07-20T03:20:24.268Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Executive Office/vista/marketplace/rice-prioritization/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js vista -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: vista — Executive Office · skill: rice-prioritization"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"vista\",\"skill\":\"rice-prioritization\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

The user has many roadmap initiatives or features that differ in reach, impact, and effort, and wants them sequenced by expected value. RICE sequences a backlog; it does not pick among a handful of designs. Use [weighted-decision-matrix](../weighted-decision-matrix/SKILL.md) to CHOOSE among a few options on bespoke weighted criteria. Use [impact-feasibility-matrix](../impact-feasibility-matrix/SKILL.md) for a quick two-axis sort when reach and confidence don't matter enough to model. Use [kano-model](../kano-model/SKILL.md) to understand WHICH features matter and why; Kano explains demand, RICE sequences supply. If there are only two or three items, the overhead of calibration buys little: rank them by hand.

## Purpose

Ranks a backlog by RICE = (Reach × Impact × Confidence) / Effort, built at Intercom to settle backlog fights without the loudest voice winning. Every input is a guess, but all items are guessed on the same definitions, so the ranking reflects relative value rather than relative volume of advocacy.

## Protocol

# rice-prioritization

Ranks a backlog by RICE = (Reach × Impact × Confidence) / Effort, built at Intercom to settle backlog fights without the loudest voice winning. Every input is a guess, but all items are guessed on the same definitions, so the ranking reflects relative value rather than relative volume of advocacy.

The formula, the four factors, their scales, the built-in Confidence bias check, the sensitivity logic, and the pitfalls live in [references/rice.md](references/rice.md). Load that file before scoring.

## When to use

The user has many roadmap initiatives or features that differ in reach, impact, and effort, and wants them sequenced by expected value. RICE sequences a backlog; it does not pick among a handful of designs. Use [weighted-decision-matrix](../weighted-decision-matrix/SKILL.md) to CHOOSE among a few options on bespoke weighted criteria. Use [impact-feasibility-matrix](../impact-feasibility-matrix/SKILL.md) for a quick two-axis sort when reach and confidence don't matter enough to model. Use [kano-model](../kano-model/SKILL.md) to understand WHICH features matter and why; Kano explains demand, RICE sequences supply. If there are only two or three items, the overhead of calibration buys little: rank them by hand.

## Language

Conduct the session and write the report in the language the user is writing in. The reference file is English; keep the framework keyed to it regardless of the output language.

## Inputs

- **INITIATIVES** (required): the backlog of features or initiatives to rank. If only a goal is given without a list, ask for the items first.
- **GOAL** (optional): the metric Impact is measured against (activation, revenue, retention). If absent, fix it with the user in Stage 1; without it Impact has no referent.
- **CONTEXT** (optional): known data (usage figures, past effort actuals), the planning horizon, and any hard constraints or commitments that pre-empt the ranking.

## Orchestration map

```
Stage 1  Calibrate      ── fix goal, Reach window, Impact scale, Confidence levels, Effort unit WITH the user (inline)
Stage 2  Score items    ── 1 scorer subagent per initiative IN PARALLEL ──┐  (estimate R, I, C, E with rationale)
Stage 3  Synthesis      ── 1 agent, needs all items ────────────────────┘  (compute, rank, sensitivity, roadmap order)
```

Tell each subagent its final message is the return value: structured data, not prose for a human. Subagents should use available retrieval tools to ground estimates in real evidence.

## Stage 1: Calibrate (inline, with the user)

Before any scoring, fix five things and write them down. Locking the definitions first is what prevents a rigged score:

1. **The goal.** The one metric Impact serves (e.g., quarterly activations). Every item's Impact is impact on this same goal, or the Impact column compares apples to oranges.
2. **The Reach time window and its data source.** One window for all items (e.g., per quarter), with the source named (analytics, CRM, estimate). A window set per-item makes the ranking meaningless.
3. **The Impact scale.** The fixed multipliers: 3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal. Anchor what each means for this goal so every scorer reads a "2" the same way.
4. **The Confidence levels.** 100% solid data, 80% some data, 50% a moonshot; below 50% means validate, do not score. Agree now that this bias check will be applied, not skipped.
5. **The Effort unit.** Person-months or person-weeks, as a whole-team number. Fix the unit so every denominator is in the same currency.

Drop any item that fails a hard gate (no longer in scope, blocked, already committed) now, rather than scoring it.

## Stage 2: Score items (PARALLEL)

Dispatch one scorer subagent per initiative, all at once, each given the full calibration plus its one item. The scorers do not see each other, so each estimates on the absolute, calibrated scales rather than relative to the others.

**Shared framing (send to each scorer):**

> Estimate the four RICE factors for one initiative, against this goal: **[GOAL]**. Use exactly these calibrated definitions: **[Reach window and source, Impact multiplier scale, Confidence levels, Effort unit]**. Initiative: **[INITIATIVE]**. For each factor give the value and a one-line rationale naming the evidence or the stated assumption behind it. Where data is thin, lower Confidence rather than inventing a figure; if Confidence would fall below 50%, say so and recommend validation instead of scoring. Then return:
> - **Reach**: the number, the window, and the source or assumption
> - **Impact**: the multiplier and why that level
> - **Confidence**: the percentage and what evidence supports or undercuts it
> - **Effort**: the whole-team estimate in the fixed unit, and what it covers
> - **Biggest uncertainty**: the factor most likely to be wrong, and which way
>
> Context: [CONTEXT]

Collect all items before continuing. Re-dispatch any scorer that fails rather than synthesizing with a gap.

## Stage 3: Synthesis (SEQUENTIAL, needs all items)

One agent assembles the ranked roadmap:

1. **Reconcile for consistency.** The parallel scorers did not see each other, so check that Reach uses the one window, Impact the one goal, and Effort the one unit across every item. Adjust any factor estimated off-scale and note the adjustment.
2. **Compute and rank.** For each item compute (Reach × Impact × Confidence) / Effort, and order the items by score, highest first.
3. **Run the sensitivity check.** Vary Confidence and Effort (the two that swing the ranking most) within each item's plausible range, and re-rank. Report whether the order holds (robust) or shuffles (fragile), especially among the top items where the sequencing actually bites.
4. **Flag validate-before-committing items.** Any high-rank item resting on low Confidence is a bet, not a plan: mark it "validate before committing" and name the cheapest test that would raise its Confidence.
5. **Recommend the roadmap order, with caveats.** Give the sequence tied to the goal and horizon, note where a near-tie means the order is a judgment call, and state that the score informs the sequence rather than dictating it.

## Report structure

Write a thorough markdown report and save it to `rice-prioritization-<backlog-slug>-<YYYY-MM-DD>.md` (today's date) in the working directory unless the user names another location.

1. **Header.** The goal, the planning horizon, the date, and a one-line note on the framework. State the calibration up front (Reach window and source, Impact scale, Confidence levels, Effort unit) since the ranking is only as good as these.
2. **Verdict.** The recommended roadmap order in a few sentences, and whether the top of the list is robust or a close call.
3. **The RICE table.** One row per initiative with columns for Reach, Impact, Confidence, Effort, the computed score, and rank, sorted by score. Scannable at a glance.
4. **Per-item detail.** For each initiative: its score and rank, the rationale behind each factor, its biggest uncertainty, and whether it is flagged validate-before-committing.
5. **Sensitivity note.** How the ranking moves as Confidence and Effort vary, which items are fragile, and which sequencing decisions are robust enough to commit to.
6. **Recommendation.** The roadmap sequence tied to the goal and horizon, the items to validate first, and what new data would re-order the list.
7. **Caveats.** Every input is an estimate, not a measurement; the score is a rate that rewards cheap wins and can starve large bets that are still worth making; Confidence guards against wishful thinking but cannot manufacture evidence; an underestimated Effort silently inflates a score; near-ties in score are ties in sequence, not a mandate; and a strategic commitment or dependency can legitimately override a higher RICE score.

## Principles

- **Never skip Confidence.** It penalizes estimates that lack evidence; drop it and RICE reverts to the loudest-voice ranking it replaced. Below 50%, validate rather than score.
- **Estimate Effort honestly.** It is the denominator, so a low estimate inflates the score most. Estimate as if committing to the work, not pitching it.
- **The score sequences, it does not decide.** Strategy, dependencies, and a missing factor can override the order.

## Boundaries & handoffs

- **handoffs**: needs the NSM for Stage 1 impact calibration; feeds roadmap-sync's committed roadmap

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"vista\",\"skill\":\"rice-prioritization\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
