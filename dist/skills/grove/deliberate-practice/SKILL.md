---
name: deliberate-practice
agent: grove
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents the failure mode that shows up most often in `training-program-design`'s 70% on-the-job piece: **"70% on-the-job" collapses into "just do the job more."** Without a deliberate-practice… (yvon)
triggers:
  - deliberate practice
  - ericsson framework
  - component-skill decomposition
  - how do people actually learn this?
  - why isn't the training working
  - design a real practice loop
  - comfort zone plus one
  - the practice isn't stretching them
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/grove/custom/deliberate-practice/SKILL.md
  source_hash: f44be06747b236ce73868df98263bf6545de24432192e8ada45f4944b79b43ce
  generated: 2026-08-01T22:54:25.639Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/grove/custom/deliberate-practice/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js grove -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: grove — People & Culture · skill: deliberate-practice"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"deliberate-practice\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Deliberate practice" / "Ericsson framework" / "component-skill decomposition"
- "How do people actually learn this?" / "why isn't the training working"
- "Design a real practice loop" / "design a feedback loop for [skill]"
- "Comfort zone plus one" / "the practice isn't stretching them"
- Handoff from `training-program-design` when the 70% or 20% piece needs mechanism-level
  design (not just structural framing)
- Handoff from `skill-gap-map` when a diagnosed gap needs an estimated time-to-close
  (DP estimates depend on domain type and starting proficiency — see Instructions Phase 3)
- Upstream check when someone proposes "just add more on-the-job time" as a training fix

Do NOT use for:

- Individual coaching or personal practice regimen design → out of scope. grove operates
  at team/cohort level; individual coaching routes to the accountable manager or an
  external coach.
- Sports / music / medical / academic-education DP applications → out of scope. This skill
  is scoped to workplace L&D. If a request lands in one of those domains, note that the
  DP framework is originally from those domains but the workplace application requires
  translation the skill doesn't cover.
- Full training-program design → `training-program-design` (custom, grove — when built).
  This skill provides the mechanism-level grounding; that skill runs the ADDIE process.
- Individual performance evaluation → future `merit` (Performance Mgmt). Aggregate cohort
  skill acquisition is grove's scope; individual perf evaluation is merit's.

## Purpose

Prevents the failure mode that shows up most often in `training-program-design`'s 70%
on-the-job piece: **"70% on-the-job" collapses into "just do the job more."** Without a
deliberate-practice discipline, on-the-job time produces experience but not necessarily
skill growth — people plateau at "good enough" and stop improving. This skill provides
the mechanism-level grounding that turns generic on-the-job time into actual skill
acquisition:

1. **Component-skill decomposition** — break the target skill into observable sub-skills
   that can be practiced individually.
2. **Specific-goal-per-session** — each practice session targets one component-skill with
   a stated goal, not vague improvement.
3. **Immediate feedback loop** — the practitioner learns whether the attempt succeeded
   before moving on, either from an outcome or a coach.
4. **Comfort-zone-plus-one difficulty** — practice happens at the edge of current
   capability, not comfortably within it.
5. **Repetition with refinement** — many attempts on the same component-skill with
   deliberate variation, until it moves from effortful to automatic.

Grove uses this to answer "*how* should the 70% and 20% actually be structured?" before
`training-program-design` runs its ADDIE process on the 10% formal instruction piece.

## Protocol

The 5 conditions that make practice *deliberate* rather than merely *repetitive* (from
Ericsson & Pool 2016 ch.1-3; Ericsson, Krampe, & Tesch-Römer 1993):

```
1. SPECIFIC GOAL      Each practice session targets ONE component-skill with a stated,
                      observable goal (not vague "get better at this"). Component-skill
                      identification comes from breaking down the target skill into
                      observable sub-skills.

2. FULL ATTENTION     Practice requires focused concentration, not multitasking or passive
                      exposure. This is what makes DP effortful — genuinely deliberate
                      practice is tiring in a way that ordinary work is not.

3. IMMEDIATE FEEDBACK The practitioner learns whether the attempt succeeded BEFORE moving
                      to the next attempt. Feedback source varies by domain (outcome-based
                      when possible; coach-mediated when not; peer-mediated with structured
                      rubric when neither).

4. COMFORT-ZONE+1     Practice happens at the edge of current capability, not comfortably
                      within it. Too far outside = frustration and abandonment; comfortably
                      within = no growth. "Plus one" is the smallest reliable increment
                      above current mastery.

5. REPETITION +       Many attempts on the same component-skill with deliberate variation
   REFINEMENT         (of context, difficulty, or approach), until it moves from effortful
                      to automatic. Then the plus-one shifts.
```

Together these produce the specific kind of practice that drives skill growth. Practice
without any one condition explains why "10,000 hours" doesn't automatically produce
mastery — hours-of-exposure without the 5 conditions is just tenure, not deliberate
practice.

## Boundaries & handoffs

- **grove does not fabricate time-to-mastery estimates.** Per `deliberate-practice`
- name: deliberate-practice
- bidirectional: deliberate-practice
- upstream: deliberate-practice

## Output format

Each invocation produces one or more of:

- **Component decomposition memo** — target skill broken into 3–7 observable component
  sub-skills with definitions.
- **Feedback loop specification** — per component-skill: feedback source, latency target,
  rubric structure.
- **Difficulty calibration note** — current-mastery baseline + comfort-zone-plus-one
  target for each component.
- **Repetition schedule** — practice cadence per component + difficulty-ratchet triggers.
- **DP framework brief** — when a request needs a short DP-lens framing rather than a
  full component decomposition (e.g., "why isn't this training landing?" → 1-paragraph DP
  read).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"deliberate-practice\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
