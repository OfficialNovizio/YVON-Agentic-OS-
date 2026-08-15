---
name: training-program-design
agent: grove
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents two persistent failure modes in workplace training: 1. (yvon)
triggers:
  - training program design
  - (from future `merit`)
-
  - -
  - /
  - - push back on a training request that's really a
  - write me a slide
  - draft this email template
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/grove/custom/training-program-design/SKILL.md
  source_hash: 6f60c2c2433dd698da1c69f645b62fbc10f91b5722b817f99677b7dc130afa32
  generated: 2026-08-01T22:54:25.665Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/grove/custom/training-program-design/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js grove -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: grove — People & Culture · skill: training-program-design"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"training-program-design\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/People & Culture/grove/operational/agent/grove-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Trigger on:

- "Design a training program to close [gap]" (Build action from `skill-gap-map`)
- "Training program for [role / competency]"
- "Build a development plan / stretch assignment structure for [succession candidate]"
  (from future `merit`)
- "Design an evaluation plan for [existing or planned training program]"
- "Did [training program] actually work?" / "evaluate training effectiveness"
- "ADDIE" / "70-20-10 design" / "Kirkpatrick evaluation"
- Push back on a training request that's really a "required drivers" problem in disguise
  (management support, systems, accountability — see § Fallback rule 4)

Do NOT use for:

- **Individual coaching or personal practice regimen** → out of scope; grove works at
  team/cohort level. Individual coaching routes to the accountable manager.
- **One-off content requests** ("write me a slide", "draft this email template") → this
  skill is for the program design and evaluation layer, not content production.
- **LMS enrollment / compliance record-keeping / certification expiry tracking** →
  `training-operations` (grove — next skill after this).
- **Skill acquisition mechanism-level design** (how does practice actually produce mastery)
  → `deliberate-practice` (grove — already shipped); training-program-design uses DP as
  input.

## Purpose

Prevents two persistent failure modes in workplace training:

1. **Over-invest in the 10%, under-invest in the 90%.** Training is easy to over-invest
   in as "the course" (10% formal instruction) and skip the other 90% (on-the-job
   practice, mentoring/social support). Programs that ship as "just a course" rarely
   produce the Level-3 behavior change or Level-4 business result they were supposed to.
2. **Declare success on Level-1 alone.** It's easy to declare a program successful
   because people liked it (Level 1: Reaction) without checking whether behavior or
   business results actually changed (Levels 3 and 4). This skill designs and evaluates
   training by whether it closed the gap it was built for.

grove uses this skill as the design + evaluation layer whenever `skill-gap-map` routes a
gap to Build, whenever `motivation-map` Phase-5 routes to competence-need intervention,
or whenever future `merit` routes a succession-plan action.

## Protocol

Follow this sequence when designing or evaluating a training program:

### Phase 1 — Start at Level 4

Confirm the specific business result this program needs to produce. Pull from:

- `skill-gap-map` — the priority_score gap's criticality directly names the business
  driver.
- Future `merit` — the hr-strategy-alignment scorecard's mapped objective.
- Future `motivation-map` — Phase-5 competence-need intervention's stated outcome.

Do NOT design a program without a Level-4 business result. Per Fallback rule 1.

### Phase 2 — Work backward through Levels 3, 2, 1

For the Level-4 result, specify:

- **Level 3 behavior:** what should people do differently on the job to produce that result?
- **Level 2 learning:** what do they need to know / be able to do to exhibit that behavior?
- **Level 1 reaction:** what experience will engage them enough to make Learning happen
  and stick?

This is the backward-design pass. Its output feeds Phase 3.

### Phase 3 — Design across 70-20-10 deliberately

Specify the three components:

- **70% on-the-job practice / stretch assignment** — the real work with real stakes that
  produces the Level-3 behavior. Design this using grove's `deliberate-practice` skill
  for component-skill decomposition + feedback loops + comfort-zone-plus-one difficulty +
  repetition schedule.
- **20% mentoring / social component** — structured pairing with an experienced person
  (Level 4-5 in the target skill), community of practice, structured feedback
  conversations. Also uses `deliberate-practice`'s feedback-loop specification.
- **10% formal instruction** — the course / workshop / e-learning module. Do NOT let
  the 10% become the whole program.

If the requester's proposal is only the 10%, push back per Fallback rule 5.

### Phase 4 — Confirm required drivers exist

Before building anything, check whether:

- **Management support** — will the person's manager time-allocate for practice, feedback,
  and application?
- **Workplace system reinforcement** — does the org's actual work reward the new
  behavior, or punish it (e.g., speed metrics that discourage the slower "correct" way)?
- **Accountability structure** — is there a mechanism to notice whether the person is
  applying the new behavior?

If any of the three are missing, flag it per Fallback rule 4 BEFORE building the program
— the training itself won't produce the result without them. This is a management/systems
gap, not a training-content gap.

### Phase 5 — Build via ADDIE

- **Analysis:** confirm scope, audience, prerequisite check. Sourced from Phase 1.
- **Design:** learning objectives + evaluation plan (from Phase 2's backward design).
- **Development:** produce the actual materials — stretch-assignment definitions,
  mentoring pairings, formal-instruction content.
- **Implementation:** roll out. Communicate the "why" (the Level-4 result) as prominently
  as the "how."
- **Evaluation:** Kirkpatrick 4-levels on the right timing (Phase 6).

### Phase 6 — Evaluate on the right timeline

Use `scripts/training_program.py`'s `kirkpatrick_timing_ok()`:

- **Reaction/Learning:** immediately post-training via a **3-question survey**.
- **Behavior/Results:** **not before 3 months post-training**, ideally within the 3–6 month
  window. Attempts to measure earlier get flagged as unreliable per Fallback rule 2.

### Phase 7 — Track completion rate and simple ROI

Use `scripts/training_program.py`'s `completion_rate()` and `roi_estimate()` (where a
business-value estimate exists — often ROI is directional only).

### Phase 8 — Feed results back

- Whether the original skill gap closed → back to `skill-gap-map` for the next cycle's
  re-scoring.
- Business-result impact → future `Shared OS: people-analytics-metrics` (for tracking)
  and future `merit`'s hr-strategy-alignment scorecard (for the mapped objective).

## Boundaries & handoffs

- **grove does not proceed without a Level-4 business result.** training-program-design
- downstream: training-program-design
- downstream: training-program-design
- name: training-program-design
- upstream: training-program-design

## Output format

Each invocation produces one or more of:

- **Program design memo** — Level-4 result → Levels 3-2-1 backward design → 70-20-10
  component design → required-drivers check → ADDIE build plan.
- **Evaluation plan** — 3-question survey wording for Reaction/Learning; Behavior/Results
  measurement design + timing.
- **70-20-10 allocation check** — actual hours per component vs target percentages, with
  flags where the allocation is unbalanced.
- **Kirkpatrick 4-levels evaluation report** — per-level findings, timing validation, and
  gap-closure recommendation for the next cycle.
- **Required-drivers gap flag** — when Phase 4 finds missing drivers; routed to the
  accountable manager, not treated as a training-content problem.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"training-program-design\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
