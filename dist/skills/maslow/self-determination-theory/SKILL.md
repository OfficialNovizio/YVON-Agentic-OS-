---
name: self-determination-theory
agent: maslow
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Diagnoses the *type* of motivation problem before proposing a fix. (yvon)
triggers:
  - self determination theory
  - motivation theory
  - motivation framework
  - which framework applies here
  - diagnose motivation
  - why is this team demotivated
  - what's really going on with engagement
  - autonomy
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/maslow/custom/self-determination-theory/SKILL.md
  source_hash: e47c09e0f9d201c513187cddbded474a7c61802aeda9b32bfdab2279db78ecd3
  generated: 2026-07-31T17:43:53.641Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/maslow/custom/self-determination-theory/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js maslow -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: maslow — People & Culture · skill: self-determination-theory"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"self-determination-theory\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Motivation theory" / "motivation framework" / "which framework applies here"
- "Diagnose motivation" / "why is this team demotivated" / "what's really going on with engagement"
- "Autonomy" / "competence" / "relatedness" in a workplace-motivation context
- "Intrinsic vs extrinsic motivation" / "autonomous vs controlled motivation"
- "Which SDT need is starved here"
- "Should we add a bonus?" (SDT lens: usually the wrong question — diagnose first)
- Handoff from `motivation-map` when it needs the theoretical grounding
- Handoff from `recognition-program` when a program's category design needs an SDT-need target
- Handoff from `wellbeing-monitoring` when a burnout pattern points to need-frustration

Do NOT use for:

- Individual-level mental-health assessment → aggregate-only rule; individual crisis signals
  escalate immediately per `wellbeing-monitoring` § Fallback.
- Compensation banding decisions → future `comp-benchmarking` skill (SDT informs how comp
  is *framed and delivered*, not the band itself).
- Performance-management calibration → `merit` (Performance Mgmt, when built).

## Purpose

Diagnoses the *type* of motivation problem before proposing a fix. SDT distinguishes
motivation problems into two categories that require different responses:

1. **Need-frustration problems** — one or more of the three basic psychological needs
   (autonomy, competence, relatedness) is being starved by the work context. The response
   is to change the context, not to add incentives.
2. **Motivation-regulation-type problems** — the person's motivation is "controlled"
   (external rewards, guilt, ego-driven) rather than "autonomous" (interest, personal
   value, self-endorsement). Controlled motivation predicts short-term compliance but
   long-term disengagement. The response is to shift the regulation type, which usually
   means shifting how the work is presented and rationalized — not adding a bonus.

Without this diagnostic, maslow (and any of the maslow-adjacent skills) risks the classic
motivation-fix failure: adding a reward to a need-frustration problem. That fix
consistently backfires — external rewards for work that people already found interesting
have been shown in SDT research to *reduce* intrinsic motivation (the "overjustification
effect").

## Protocol

The SDT diagnostic is a 2-axis analysis:

```
AXIS 1: Which of the 3 basic needs is starved?

  Autonomy      = the experience of volition, choice, and psychological freedom
                  (the sense that one's actions are self-endorsed, not coerced)
  Competence    = the experience of mastery and effectiveness in one's activity
                  (opportunities to develop skill; feedback that shows progress)
  Relatedness   = the sense of connection and belonging with others
                  (caring, supportive interpersonal environment)

AXIS 2: Where does the person's motivation sit on the regulation continuum?

  Autonomous ────────────────────────────────── Controlled
  ┌────────────────────────┬──────────────────┬─────────────┬────────────────┐
  │ Intrinsic motivation   │ Identified reg.  │ Introjected │ External reg.  │
  │ (interest, enjoyment)  │ (personal value) │ (guilt/ego) │ (reward/punish)│
  └────────────────────────┴──────────────────┴─────────────┴────────────────┘

The diagnostic combines both axes: WHICH need is starved AND WHERE the person's
current motivation type sits. Different combinations require different interventions.
```

Then the intervention: change the work context to satisfy the starved need, and/or
shift the framing to move motivation toward the autonomous end of the continuum.

## Boundaries & handoffs

- name: self-determination-theory
- upstream: self-determination-theory
- upstream: self-determination-theory

## Output format

Each invocation produces one or more of:

- **SDT diagnostic worksheet** — for the team/venture in scope: Axis 1 (which needs starved,
  ranked), Axis 2 (where motivation currently sits on the continuum), signal evidence for
  each need, confidence level.
- **Intervention design memo** — recommended intervention direction from the Phase-3
  matrix, matched to the diagnostic; explicit statement of what the intervention will NOT
  fix (to prevent overreach); routing to sibling skills (`recognition-program`,
  `wellbeing-monitoring`, future `grove`, future `merit`).
- **Follow-up plan** — measurement window, signals to watch, sibling skill to route the
  follow-up read to.
- **SDT lens note** — when a calling skill needs a brief SDT-grounded framing (e.g.,
  `recognition-program` asks "which need does this reinforce?"), a 1-paragraph SDT read.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"self-determination-theory\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
