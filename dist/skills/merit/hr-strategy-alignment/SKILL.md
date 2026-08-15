---
name: hr-strategy-alignment
agent: merit
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents three failure modes that show up when HR runs programs without strategy alignment: 1. (yvon)
triggers:
  - hr strategy alignment
  - hr balanced scorecard
  - hr scorecard
  - bsc
  - hrbp alignment
  - hr business partner discovery
  - audit our hr initiatives
  - sunset which hr program
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/merit/custom/hr-strategy-alignment/SKILL.md
  source_hash: 20c901301f5c0776aafde8006dcc783069572891d959b1484df8d5b94001210f
  generated: 2026-08-01T23:27:45.243Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/merit/custom/hr-strategy-alignment/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js merit -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: merit — People & Culture · skill: hr-strategy-alignment"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"hr-strategy-alignment\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "HR strategy for [venture / department / group]"
- "HR balanced scorecard" / "HR scorecard" / "BSC"
- "HRBP alignment" / "HR business partner discovery"
- "Why should we fund [HR program]" / "justify [HR initiative]"
- "Audit our HR initiatives" / "sunset which HR program"
- "Prepare CHRO input for the Board/leadership cycle"
- Handoff from `performance-frame`'s aggregate cycle output — feeds Employee/Customer
  perspective
- Handoff from `succession-planning`'s bench-strength summary — feeds Learning & Growth
  perspective

Do NOT use for:

- **Operational execution of individual programs.** That's the underlying skills:
  hire's `hiring-kit`, maslow's `motivation-map` / `recognition-program`, grove's
  `training-program-design`, etc. This skill is specifically the alignment / prioritization
  layer ABOVE them.
- **Budget approval.** This skill produces the alignment view and recommends; budget
  approval routes to `board` (via `fiduciary-guard`) per Universal Principle 5 inherited
  from hire.
- **Cross-venture strategic prioritization decisions.** This skill surfaces the tradeoff
  and routes to `marcus` (Executive Office / Strategy) + `board` for the strategic call —
  never silently picking one venture's priorities over another.
- **Individual performance data.** Aggregate-only for people data (Universal Principle 7).
  The scorecard consumes aggregate signals (retention rate, time-to-fill, engagement
  score); individual perf data is `performance-frame`'s scope, not the scorecard's.

## Purpose

Prevents three failure modes that show up when HR runs programs without strategy
alignment:

1. **Generic-perk drift.** "We should run an engagement survey" launched without a
   specific business objective produces activity that leadership doesn't recognize as
   priority-serving. The scorecard's orphan-in-both-directions flagging catches this.
2. **One-size-fits-all across ventures.** A group-level HR strategy applied uniformly to
   ventures at different maturity stages misses that (e.g.) a live venture may need
   retention-focused programs while a building venture needs hiring-speed. Re-weighting
   per venture per cycle is Principle 2.
3. **Perpetual-run initiatives.** HR programs that once made sense but no longer map to
   a current business objective persist because sunsetting them is politically expensive.
   The scorecard's orphan-flagging surfaces them as candidates to cut, giving cover for
   the sunset conversation.

merit uses this skill as the **prioritization layer above** the operational P&C skills
(hire's `hiring-kit`, `payroll-and-eor`, `workforce-planning`; maslow's `motivation-map`,
`wellbeing-monitoring`, `recognition-program`; grove's `skill-gap-map`, `training-program-design`,
`training-operations`; merit's own `performance-frame`, `succession-planning`,
`feedback-methods`). Every initiative in that stack should trace to a business objective
via this scorecard.

## Protocol

The HR Balanced Scorecard consists of 4 perspectives (adapted from Kaplan & Norton 1996):

```
1. FINANCIAL PERSPECTIVE
    Metrics: cost-of-hire, turnover cost, ROI on training/programs, HR spend
             as % of revenue, comp-to-revenue ratio.
    Owner-adjacent: hire's payroll-and-eor + future comp-benchmarking.

2. EMPLOYEE/CUSTOMER PERSPECTIVE
    "HR's customer is the workforce."
    Metrics: engagement score, satisfaction, retention, eNPS trend.
    Owner-adjacent: maslow's motivation-map + wellbeing-monitoring + recognition-program;
                    merit's own performance-frame (aggregate signals).

3. INTERNAL PROCESS PERSPECTIVE
    HR-process efficiency.
    Metrics: time-to-hire, onboarding cycle time, HR-service quality, compliance-audit
             completeness, training completion rate.
    Owner-adjacent: hire's hiring-kit + ats-selection; grove's training-operations.

4. LEARNING & GROWTH PERSPECTIVE
    Capability building + succession readiness + culture of development.
    Metrics: bench-strength score (per critical role), skill-gap-closure rate, succession
             coverage, training investment per person.
    Owner-adjacent: grove's skill-gap-map + training-program-design; merit's own
                    succession-planning.

Implementation sequence:
  a. Define the business's 3-5 top strategic objectives FIRST (from marcus / board / vista).
  b. For each objective, identify which HR activities/programs drive progress toward it.
  c. Map existing HR activities to objectives → find orphans in both directions:
     - Business objective with NO mapped HR activity → gap to fill.
     - HR activity with NO mapped business objective → sunset candidate.
  d. Weight objectives by current cycle importance (not permanently — re-weight per cycle).
  e. Score current progress against target per metric where a metric exists.
  f. Summarize by perspective and overall, presenting gaps and orphans PROMINENTLY.

Value chain discipline: every scorecard entry is traceable:
  business objective → HR initiative → metric → current value → target value.
```

## Boundaries & handoffs

- **merit does not invent business objectives for hr-strategy-alignment scorecard.**
- downstream: hr-strategy-alignment
- downstream: hr-strategy-alignment
- name: hr-strategy-alignment

## Output format

Each invocation produces one or more of:

- **HR strategy scorecard** — full 4-perspective view with per-perspective score, overall
  score, mapping of initiatives to objectives, and per-metric progress.
- **Orphan report** — objectives without mapped initiatives (gaps to fill); initiatives
  without mapped objectives (sunset candidates). Recommended actions per orphan.
- **HRBP discovery memo** — from Phase 2: per business objective, the People-related
  constraint/opportunity + recommended P&C skill owner.
- **Weighting recommendation** — per cycle, per venture/department. Explicit re-weight
  from previous cycle if applicable.
- **Sunset conversation script** — for a specific orphan initiative, an outline for the
  conversation with the current owner (uses `feedback-methods` for delivery discipline).
- **Cross-venture tradeoff memo** — routed to marcus + board when the scorecard surfaces
  a bandwidth conflict.
- **Strategic-priority routing** — budget-impact and strategic-priority questions with
  explicit route (board via fiduciary-guard; marcus for cross-venture strategy).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"hr-strategy-alignment\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
