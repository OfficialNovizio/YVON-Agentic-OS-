---
name: skill-gap-map
agent: grove
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents three failure modes that show up when teams try to address capability gaps without structured analysis: 1. (yvon)
triggers:
  - skill gap map
  - skills gap analysis
  - what skills does this team need?
  - build buy borrow bridge
  - prioritize which skill gap to address first
  - business case for this new role / this training investment
  - hire
  - upskill
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/grove/custom/skill-gap-map/SKILL.md
  source_hash: 77bf7d57fc036b500b82f66cd51ccbe8c38badf5eafa41caf81f1c6eb25c62eb
  generated: 2026-08-01T22:54:25.655Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/grove/custom/skill-gap-map/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js grove -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: grove — People & Culture · skill: skill-gap-map"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"skill-gap-map\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Build a skills matrix for [team / role / venture]"
- "Skills gap analysis" / "capability assessment for [team]"
- "What skills does this team need?" / "how big is the [X] skill gap"
- "Hire vs upskill for [role]" / "build buy borrow bridge"
- "Prioritize which skill gap to address first"
- "Business case for this new role / this training investment"
- Handoff from `motivation-map` when a Phase-5 diagnosis routes to competence-need
  intervention (need the specific gap named before designing the practice)
- Handoff from `workforce-planning` when a workforce plan's action-plan step needs the
  specific skill gap the "hire" or "upskill" line item is closing

Do NOT use for:

- Individual performance reviews or compensation decisions → future `merit` (Performance
  Mgmt). This skill uses performance-review input as one data source (via scores), but
  does not itself evaluate individuals.
- Individual coaching / development plans → route to the accountable manager. grove's scope
  is team/cohort L&D program design, not individual coaching.
- Compensation banding decisions → `payroll-and-eor` (custom, hire) or future
  `comp-benchmarking`.

## Purpose

Prevents three failure modes that show up when teams try to address capability gaps
without structured analysis:

1. **Unscoped inventories.** "Let's catalog every skill in the org" produces noise, not
   action. This skill scopes to a specific business driver first.
2. **Reflex hiring** ("we need to hire for X"). Sometimes the fastest and cheapest fix is
   upskill (Build) or redeploy (Bridge), not a new hire. The 4-way routing (Build / Buy /
   Borrow / Bridge) is designed to prevent the reflex.
3. **Raw-gap ranking.** A big gap in a low-criticality skill can distract from a small gap
   in a mission-critical skill. Prioritization by gap × criticality (not raw gap size)
   fixes this.

grove uses this as the entry point for most L&D work — every training program, every
succession-development plan, every "why isn't the team performing" question routes through
a gap-map first.

## Protocol

The 5-step framework (per plugin + catalog merge):

```
1. PLAN                Confirm scope + business driver. Which roles / teams / skills, tied
                       to WHERE the business is headed (3-5 year direction OR an immediate
                       driver like a product launch, market entry, or 2-quarter horizon
                       per catalog). Unscoped analysis produces noise, not action.

2. IDENTIFY            Build the skills taxonomy — the FOCUSED list of skills genuinely
                       relevant to the scope. Not an attempt to catalog everything.
                       Rule of thumb: 5-15 skills per role/team; more = drift.

3. MEASURE             Score current proficiency using the 1-5 scale (see § Skills Matrix
                       & Scoring below). Combine TOP-DOWN (manager assessment) and
                       BOTTOM-UP (self-assessment) input. Where objective evidence exists
                       (certifications, recent project output), use it as a third data
                       source. Reconcile discrepancies > 1 level rather than averaging
                       them silently.

4. ACT                 Compare current vs required proficiency; prioritize by gap ×
                       criticality (see § Instructions Phase 5); assign an action per
                       top-priority gap using Build / Buy / Borrow / Bridge logic (see
                       § Instructions Phase 7); route to owning skill.

5. BUILD FOR FUTURE    Treat this as a RECURRING cycle, not a one-time snapshot. Re-run
                       when the business driver shifts materially. The skills matrix is
                       a living document.
```

Sources for framework: Cornerstone; SHRM; AIHR.

## Boundaries & handoffs

- **grove does not default to Build.** `skill-gap-map` explicitly considers Bridge
- upstream: skill-gap-map
- name: skill-gap-map
- upstream: skill-gap-map

## Output format

Each invocation produces one or more of:

- **Skills matrix** — team × skills grid with per-cell proficiency scores (1–5 with
  anchors), rater breakdown (self / manager / objective), required-proficiency column,
  gap column.
- **Priority-ranked gap list** — top 3–5 gaps by priority_score, with criticality
  rationale.
- **Action recommendation memo** — per top-priority gap: Build / Buy / Borrow / Bridge
  recommendation with rationale, timeline estimate, cost implication routed to `board`
  (fiduciary-guard).
- **Rater-discrepancy log** — flagged cells where self / manager scores differ > 1 level,
  awaiting reconciliation conversation.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"grove\",\"skill\":\"skill-gap-map\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
