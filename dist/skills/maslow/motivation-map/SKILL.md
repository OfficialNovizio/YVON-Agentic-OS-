---
name: motivation-map
agent: maslow
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents two failure modes maslow's other-skills-alone don't catch: 1. (yvon)
triggers:
  - motivation map
  - run the motivation pulse
  - quarterly needs pulse
  - start the motivation cycle
  - team morale check
  - burnout check
  - is this team burning out
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/maslow/custom/motivation-map/SKILL.md
  source_hash: 65d9344d338eee02d7e890f2df2435836dc181f9ce7ad3353d06e2fb34631857
  generated: 2026-07-31T17:43:53.614Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/maslow/custom/motivation-map/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js maslow -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: maslow — People & Culture · skill: motivation-map"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"motivation-map\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Run the motivation pulse" / "quarterly needs pulse" / "start the motivation cycle"
- "Team morale check" / "burnout check" / "is this team burning out"
- "Motivation trend for [team / venture]" / "what's happening with engagement on [cohort]"
- "Map the motivation gap for [cohort]"
- Auto-cadence — start of every quarter, for each cohort with an established pulse baseline

Do NOT use for:

- Individual-level motivation diagnosis or coaching → aggregate/cohort only; individual
  motivation coaching is out of maslow's scope entirely.
- Individual crisis or distress signals → immediately escalate per `wellbeing-monitoring`
  § Fallback (manager + HR Ops + EAP). Do NOT try to resolve inside motivation-map.
- Comprehensive engagement survey → this is a *pulse* (5–10 questions, focused on the
  3 SDT needs). A sprawling annual engagement survey is a different instrument.
- ATS pipeline health, hiring loop metrics → `ats-selection` D&I funnel or `Shared OS: people-analytics-metrics` (when built).

## Purpose

Prevents two failure modes maslow's other-skills-alone don't catch:

1. **Motivation problems surface too late.** Without a regular pulse, the signal reaches
   maslow only when someone has already resigned, gone into burnout, or a manager escalates
   a team-level conflict. By then the intervention window has closed.
2. **Interventions get chosen by hunch rather than diagnosis.** Without a matched-menu
   approach, "let's try recognition" becomes the default fix regardless of whether the
   underlying starved need is autonomy, competence, or relatedness. That's the classic
   overjustification-effect failure mode SDT's Principle 4 warns against.

This skill runs the quarterly cadence and produces an aggregate diagnostic + intervention
recommendation that routes into the right downstream response — sometimes `recognition-program`,
sometimes `wellbeing-monitoring`, sometimes `workforce-planning` for a structural fix,
sometimes future `grove` or `merit`.

## Protocol

The quarterly motivation-map cycle:

```
Phase 1 — Design pulse (once per cohort baseline; re-tuned annually)
    9-12 questions total, split across the 3 SDT needs (3-4 per need).
    Same questions per cycle so trend data is comparable.

Phase 2 — Communicate the "minimum viable action" from the last cycle
    BEFORE launching the new pulse. One visible action taken in response to
    the previous quarter's finding. This is the trust maintenance rule; skipping it
    is the #1 reason pulse response rates degrade over time (Udext research).

Phase 3 — Run the pulse (short window; 5-10 days)
    Voluntary; anonymous; team-level identity only (never individual-attributable).
    Apply minimum-group-size suppression before reporting any segmented figure
    (same threshold as future Shared OS: people-analytics-metrics).

Phase 4 — Score, compute the burnout early-warning flag, diagnose
    Per-need average scores (autonomy, competence, relatedness).
    Trend vs previous cycle (rising, stable, declining).
    Burnout flag = combination rule (see § Instructions Phase 4).
    Route the diagnostic to self-determination-theory for framing.

Phase 5 — Select intervention from the menu; route to owning skill
    Match starved need → intervention direction (SDT's Phase-3 matrix).
    Route to recognition-program / workforce-planning / grove / merit / hire
    per the match. This skill produces the recommendation; the routed-to skill
    designs the actual intervention.

Phase 6 — Measure follow-up
    12-week window (or by next quarterly pulse, whichever is longer).
    Route follow-up read to wellbeing-monitoring and (when built) Shared OS:
    people-analytics-metrics.
```

## Boundaries & handoffs

motivation-map Principle 6) is enforced at the motivation-map → recognition-program
- downstream: motivation-map
- name: motivation-map
- bidirectional: motivation-map
- upstream: motivation-map

## Output format

Each invocation produces one or more of:

- **Pulse questionnaire** — 9–12 questions, per-cohort, versioned so subsequent cycles use
  the same wording.
- **Aggregate response report** — per-cohort, per-need averages, trend deltas from previous
  cycle, response-rate context, minimum-group-suppression notes where applicable.
- **Burnout early-warning flag** — GREEN / AMBER / RED per cohort with rationale, plus
  corroborating signals from `wellbeing-monitoring` if available.
- **Intervention memo** — starved need → SDT-derived intervention direction → routed-to
  skill → 90-day follow-up plan.
- **Follow-up read** — pulse trend change since last cycle, whether the intervention landed,
  next-cycle recommendation.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"maslow\",\"skill\":\"motivation-map\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
