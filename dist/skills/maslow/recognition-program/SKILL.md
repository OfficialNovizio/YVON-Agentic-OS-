---
name: recognition-program
agent: maslow
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Recognition is one of the top reasons employees stay or leave, and structured programs correlate with materially lower turnover (per the source's cited industry research). (yvon)
triggers:
  - recognition program
  - design a new recognition/rewards program
  - -
  - for participation or equity issues
-
  - annual raise / bonus
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/maslow/custom/recognition-program/SKILL.md
  source_hash: 7cee0503ed8d1f975c84640cb55a6b3ef911621406c4787b8c0aa459ccd091d2
  generated: 2026-07-31T17:43:53.635Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/maslow/custom/recognition-program/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js maslow -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: maslow — People & Culture · skill: recognition-program"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"recognition-program\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/People & Culture/maslow/operational/agent/maslow-config.md"
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

- "Design a new recognition/rewards program" for a venture or the group
- "Build a fast peer-to-peer / manager-to-employee recognition pathway"
- "Audit our existing recognition program" for participation or equity issues
- "Tie a recognition initiative to a specific retention/engagement objective"
- "Report recognition program health" (participation rate, timeliness, distribution)
- Handoff from `motivation-map` when Phase-5 diagnosis routes to relatedness with substrate
  present
- Handoff from `wellbeing-monitoring` when a morale finding points to a relational-gap fix
  (and NOT a workload/structural fix — see Fallback)

Do NOT use for:

- Compensation, pay-equity, or benefits questions → `payroll-and-eor` (custom, hire) or
  future `comp-benchmarking`. Recognition never fixes a comp problem.
- Workload / burnout signals → `wellbeing-monitoring` (custom, maslow — sibling). Route
  the underlying problem there; recognition is not a burnout fix.
- Performance-review recognition ("annual raise / bonus") → future `merit` (Performance
  Mgmt). This skill covers peer + manager recognition, not the perf-cycle side.
- SDT-need diagnosis or motivation framing → `self-determination-theory` (custom, maslow).

## Purpose

Recognition is one of the top reasons employees stay or leave, and structured programs
correlate with materially lower turnover (per the source's cited industry research). This
skill exists so maslow can design recognition that's timely, fair, and tied to a real
retention/engagement objective — for example, feeding directly off a `motivation-map`
diagnosis (relatedness starved, substrate present) or a future `people-analytics-metrics`
finding (elevated turnover in a specific function) rather than existing as a generic
perk.

Prevents four failure modes:

1. **Generic-perk syndrome** — a recognition program launched without a tied objective
   ("we should do something for morale") produces low participation and no measurable
   impact.
2. **Delayed grand gestures** — annual/quarterly ceremonies alone; missing the fast
   peer-to-peer channel that Gallup research shows has ~3x the impact when done within
   24 hours of the action.
3. **Recognition-as-comp-fix** — using recognition to paper over a real compensation or
   workload problem. Total Rewards research is emphatic that recognition *complements*
   fair pay, never substitutes for it.
4. **Equity blind spot** — programs that skew heavily to one function/team without an
   equity check, embedding visibility bias.

## Protocol

The recognition-program lifecycle:

```
1. Anchor to a business/culture objective
    Not "morale in general." A specific tied objective — retention (turnover-driven),
    engagement (motivation-map-driven), or a strategic priority (hr-strategy-alignment
    when built).
2. Define categories + eligibility rules
    Peer-to-peer + manager-to-individual + manager-to-team + public/private options.
    Few, clear categories beat many complex ones.
3. Set point tiers + budget
    Tiered points (small shout-out → exceptional cross-team impact). Budget approved by
    board (fiduciary-guard) before publishing external commitments.
4. Build the FAST pathway first
    Lightweight, low-friction way to give recognition close to the moment (target within
    ~48 hours). Timing matters more than reward size.
5. Launch with communication
    Purpose, how to participate, behaviors being reinforced. Programs without a launch
    comm fail quietly.
6. Personalize where feasible
    Individual recognition preferences (public vs private, monetary vs non-monetary).
7. Monitor participation, timeliness, equity
    Quarterly (or per-cycle) via scripts/recognition_program.py. Flag low-participation
    groups and distribution gaps. Apply minimum-group-size suppression before publishing
    any per-group figure.
8. Feed outcomes back
    Retention/engagement impact → future Shared OS: people-analytics-metrics.
    Program-objective progress → future merit (hr-strategy-alignment scorecard).
```

## Boundaries & handoffs

motivation-map Principle 6) is enforced at the motivation-map → recognition-program
- downstream: recognition-program
- downstream: recognition-program
- downstream: recognition-program
- name: recognition-program

## Output format

Each invocation produces one or more of:

- **Program design memo** — tied objective, categories, tier structure, budget request,
  fast-pathway design, launch comm plan.
- **Program-health cycle report** — participation rate + timeliness status + equity check,
  per program, with findings and recommended adjustments.
- **Equity audit** — per-group per-capita recognition, minimum-group-size suppression
  notes, distribution-gap flags.
- **Refresh recommendation** — when a program has aged (~12 months in) or a `motivation-map`
  / `wellbeing-monitoring` signal suggests the program is no longer landing.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"recognition-program\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
