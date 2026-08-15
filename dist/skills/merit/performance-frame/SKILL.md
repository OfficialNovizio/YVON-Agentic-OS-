---
name: performance-frame
agent: merit
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents three failure modes that show up most often in workplace performance cycles: 1. (yvon)
triggers:
  - performance frame
  - write a performance review
  - individual okr
  - okr cascade
  - quarterly review
  - review cadence
  - when do we do reviews
  - how do i evaluate this person
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/merit/custom/performance-frame/SKILL.md
  source_hash: 8a000387d819cd096eeffaf7fed4ea75d5f44e5034fcc41c6595e66ab57b564b
  generated: 2026-08-01T23:27:45.247Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/merit/custom/performance-frame/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js merit -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: merit — People & Culture · skill: performance-frame"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"performance-frame\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/People & Culture/merit/operational/agent/merit-config.md"
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

- "Performance review for [person / cohort / cycle]" / "write a performance review"
- "Individual OKR" / "OKR cascade" / "set OKRs for [team / role]"
- "Quarterly review" / "review cadence" / "when do we do reviews"
- "How do I evaluate this person" / "what's the review format"
- "Mid-cycle check for [person]" / "year-end synthesis"
- Handoff from `feedback-methods` when a specific review conversation needs delivery
  discipline (SBI + Radical Candor)
- Handoff from `succession-planning` when a 9-box placement needs performance-data input

Do NOT use for:

- **Compensation decisions** → `payroll-and-eor` (custom, hire) OR future `comp-benchmarking`.
  This skill's outputs INFORM comp decisions (via evidence-based review content) but do
  not MAKE them.
- **Team-level engagement / motivation** → `motivation-map` and `wellbeing-monitoring`
  (both custom, maslow — sibling agents). Individual performance is merit's scope; team
  motivation dynamics are maslow's.
- **Succession placement / 9-box grid** → `succession-planning` (custom, merit — sibling).
  This skill provides performance-data INPUT to succession-planning; succession-planning
  places on 9-box.
- **Individual training or upskilling** → grove's `skill-gap-map` + `training-program-design`.
  Performance review may surface a competence gap; grove owns the closer.
- **Individual mental-health signals** → HARD BOUNDARY to manager + HR Ops + EAP per
  Universal Principle 3 inherited from hire.
- **Formal PIP (Performance Improvement Plan) formalization** → operator + employment
  counsel. This skill supports the manager conversation; PIP formalization is
  legal-adjacent.

## Purpose

Prevents three failure modes that show up most often in workplace performance cycles:

1. **Orphaned individual OKRs.** OKRs set at the individual level without traceability
   back to company objectives produce activity that doesn't add up to progress. If the
   individual OKR can't name the specific company OKR it serves, either the individual
   OKR is misaligned or the company OKR itself is missing — either is a §Fallback case.
2. **Impression-based reviews.** Reviews written from "she seemed engaged" or "he isn't
   really a team player" produce feedback that isn't actionable and often reflects the
   reviewer's biases rather than evidence. Written evidence-based reviews force
   traceability: which OKR? which observed behavior? which measurable outcome?
3. **Comp discussions during the review conversation.** Mixing performance evaluation
   with compensation decisions in the same conversation distorts both. Performance
   discussions happen in the review; comp discussions are a separate structured process
   (routed to `payroll-and-eor` or future `comp-benchmarking`) with different data
   inputs and different escalation paths.

merit uses this skill as the framework whenever a performance-cycle event happens — OKR
setting at the start of a quarter, mid-cycle check, end-of-quarter written review, or
year-end synthesis across quarters.

## Protocol

The performance-frame cycle:

```
1. OKR CASCADE (start of quarter / cycle)
    vista publishes company-level OKRs → each team/venture derives team OKRs →
    each individual derives 3-5 personal OKRs traceable to a specific company OKR.

    Rule: NO orphan individual OKRs. Every individual O must trace to a company O.

2. MID-CYCLE CHECK (~mid-quarter)
    Written 15-min status update per individual: progress vs each Key Result.
    Signal-only — GREEN/AMBER/RED per KR. Full analysis waits for end-of-cycle.
    Triggers earlier intervention if any KR is RED at mid-cycle.

3. END-OF-CYCLE WRITTEN REVIEW (end of quarter)
    Written evidence-based review. Per each of the person's OKRs:
    - Was the O achieved? (Y / partial / no)
    - Evidence: specific outcomes, artifacts, or measurable results.
    - What worked / what would you do differently? (SBI-format observations)
    - Learnings + growth areas going into next cycle.

    Delivered using SBI + Radical Candor from feedback-methods.

4. YEAR-END SYNTHESIS (across 4 quarters)
    Aggregate the 4 quarterly reviews into a year-view. Pattern flags:
    - Consistent Y across quarters → surface for succession-planning 9-box.
    - Persistent partial or N → surface for skills-gap-map (grove) or,
      if pattern indicates fit mismatch, workforce-planning (hire).

5. COMP HAND-OFF (separate conversation, separate cadence)
    Performance-review CONTENT feeds comp discussion; the comp discussion
    itself happens SEPARATELY, on a different cadence, with `payroll-and-eor`
    or future `comp-benchmarking` owning the market-band data.
    Do NOT mix.
```

## Boundaries & handoffs

| Ambiguous "how do I evaluate this person" | **performance-frame** first (produces content); calls **feedback-methods** for delivery | Content → delivery separation |
- No-orphan-OKR (originating in `performance-frame`, inherited by all merit skills that
- Comp-separation (originating in `performance-frame`, enforced whenever comp discussion
| Persistent-partial performance pattern (2+ cycles) → competence gap | **`skill-gap-map`** (custom, grove) | performance-frame year-end synthesis routing |
| Persistent-N performance pattern (3+ cycles) → fit-vs-role question | **`workforce-planning`** (custom, hire) + operator + employment counsel | performance-frame year-end synthesis routing + PIP-adjacent path |
- **merit does not proceed with orphan individual OKRs.** performance-frame Principle 1 —
- **merit does not mix comp discussion into review conversations.** performance-frame
- downstream: performance-frame
- name: performance-frame
- upstream: performance-frame

## Output format

Each invocation produces one or more of:

- **Individual OKR draft** — 3–5 Objectives with 2–4 Key Results each, per-Objective
  traceability back to a company OKR, ~70% achievability calibration note.
- **Mid-cycle check status** — per-KR GREEN / AMBER / RED with one-line rationale;
  mid-cycle intervention recommendation for any RED.
- **End-of-cycle written review** — per-OKR Y/partial/N + evidence + SBI-observation
  section + growth-area section. Draft that the manager reviews before conversation.
- **Year-end synthesis** — pattern flags across 4 quarters with routing recommendations
  (succession-planning / skill-gap-map / workforce-planning / operator + counsel).
- **Comp hand-off memo** — evidence extract from performance review, routed to the
  appropriate downstream owner (payroll-and-eor / future comp-benchmarking / board).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"performance-frame\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
