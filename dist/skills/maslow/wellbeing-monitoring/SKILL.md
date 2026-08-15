---
name: wellbeing-monitoring
agent: maslow
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Burnout is consistently cited as a top HR risk, and psychosocial-risk management (ISO 45003 and the frameworks emerging from it) is increasingly a board-level accountability item, not just an HR concern. (yvon)
triggers:
  - wellbeing monitoring
  - run a wellbeing pulse
  - enps
  - enps trend
  - aggregate wellbeing report for the board / operator
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/maslow/custom/wellbeing-monitoring/SKILL.md
  source_hash: 8332bc8fc48b2ceb206883980c77fa6cc584fb84fc7c0bff9a73fb212067e5a3
  generated: 2026-07-31T17:43:53.647Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/maslow/custom/wellbeing-monitoring/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js maslow -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: maslow — People & Culture · skill: wellbeing-monitoring"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"wellbeing-monitoring\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Pulse survey for [team / venture]" / "run a wellbeing pulse"
- "eNPS" / "compute eNPS for [cohort]" / "eNPS trend"
- "Interpret [these] wellbeing signals" / "workload trend for [team]"
- "Build a wellbeing-monitoring cadence for [venture]"
- "Flag [team] for elevated burnout-risk signals"
- "Aggregate wellbeing report for the Board / operator"
- "Psychosocial risk audit for [cohort]"

Do NOT use for:

- **ANY individual's mental health, wellbeing state, or crisis assessment.** This is the
  hard boundary — cross-scope failure here is the most serious failure mode this skill
  has. Individual crisis signals escalate immediately per § Fallback.
- SDT-need diagnostic (autonomy / competence / relatedness scoring) → `motivation-map`
  owns the SDT pulse; this skill owns the wellbeing/workload signals that corroborate.
- Recognition program design → `recognition-program` (sibling, this agent).
- Compensation/pay-equity questions → `payroll-and-eor` (custom, hire) or future
  `comp-benchmarking`.

## Purpose

Burnout is consistently cited as a top HR risk, and psychosocial-risk management (ISO 45003
and the frameworks emerging from it) is increasingly a board-level accountability item,
not just an HR concern. This skill exists so maslow can surface workload and sentiment
patterns early — at the team/venture level — and route them to the right fix (which is
often an org-design or staffing issue, not a "resilience training" issue) rather than
letting them surface only after someone has already left or burned out.

Complements the two other maslow skills:

- **`motivation-map`** owns the quarterly SDT-need pulse (autonomy / competence /
  relatedness scores). This skill owns the *wellbeing signal* layer that corroborates or
  contradicts the motivation-map read — pulse sentiment + overtime + absence + EAP.
- **`self-determination-theory`** provides the interpretive framing when a wellbeing
  signal traces to need-frustration (usually autonomy or competence starvation).

## Protocol

The wellbeing-monitoring cycle:

```
1. Scope + cadence     Which venture/team; 1-2 focused themes per cycle; short (5-10 Qs)
                       format. NOT a sprawling annual engagement survey.
2. Include eNPS        Recurring baseline metric so there's one comparable trend line
                       across cycles. Score = %promoters (9-10) minus %detractors (0-6).
3. Layer workload data Aggregate signals only: overtime hours, absenteeism rate, EAP
                       utilization rate. Team/cohort level, never per-person.
4. Suppress small groups Apply minimum-group-size threshold before ANY segmented figure
                       ships. Shared with the future Shared OS: people-analytics-metrics.
5. Burnout risk flag   Compute per team/venture combining sentiment trend + workload
                       signals. Treat as "worth investigating," NEVER as diagnosis of any
                       individual.
6. Investigate root    Workload-driven pattern usually needs an org-design/staffing fix
                       (route to workforce-planning), NOT a wellness-communications fix.
7. Close the loop      Before the next cycle, communicate at least one concrete action
                       taken from this cycle. Minimum-viable-action rule.
8. HARD BOUNDARY       If any individual signal of crisis or serious distress surfaces
                       via any channel — STOP. Escalate per § Fallback (manager + HR Ops
                       + EAP). Do NOT attempt to counsel, assess, or resolve inside this
                       skill.
```

## Boundaries & handoffs

- downstream: wellbeing-monitoring
- bidirectional: wellbeing-monitoring
- name: wellbeing-monitoring
- bidirectional: wellbeing-monitoring

## Output format

Each invocation produces one or more of:

- **Pulse questionnaire** — 5–10 questions, per-cohort, versioned across cycles for trend
  comparability. Includes the eNPS baseline question every cycle.
- **Aggregate response report** — per-cohort eNPS score with trend delta, focused-theme
  question averages, response-rate context, minimum-group-suppression notes.
- **Burnout risk flag** — GREEN / AMBER / RED per cohort, with rationale (eNPS trend +
  workload signal state).
- **Aggregate risk report** — for board / operator visibility: cohort × flag matrix,
  cross-referenced with `workforce-planning`'s open structural findings.
- **Escalation log** (individual crisis signals only) — count and category (never
  individual-attributable), routed to operator + HR Ops for governance visibility.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"wellbeing-monitoring\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
