<!--
Custom skill — adopted from the Anthropic hr-strategy-alignment plugin, genericized per
§0.4b, reassigned from maslow to merit.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/hr-strategy-alignment/SKILL.md
Note on the Python script: source SKILL.md references scripts/hr_scorecard.py but that
file was NOT included in the packaged plugin. Per §0.5 the script is
IMPLEMENTED-FROM-DESCRIPTION here — the source describes per-entry progress, orphan-flagging
(both directions), and weighted alignment scoring by perspective + overall.

Genericization strip (§0.4b):
- name: hr-strategy-alignment (no prefix to strip)
- assigned_agent: maslow (CHRO) → merit (P&C / Performance Management)
- "VYON Group Inc.", "Novizio", "Hourbour", "External Platform division" → generic
- "felix (Finance)" → board (fiduciary-guard); note future Finance agent
- "marcus/synth" (CEO/Research/Strategy) → marcus (Executive Office / Strategy) only;
  synth doesn't exist in YVON's Executive Office roster (marcus / vista / echo)
- "board (COMMAND)" → board (Governance) — real YVON
- "AI Council cycle" → generic "leadership planning cycle" / "governance cycle"
- "Workforce Planning & Org Design" (VYON) → workforce-planning (custom, hire)
- "People Analytics & Metrics" (VYON) → future Shared OS: people-analytics-metrics
- "Training Program Design" (VYON) → training-program-design (custom, grove)
- "Recognition & Rewards Program Design" (VYON) → recognition-program (custom, maslow)

All 7 public-source citations preserved (HiBob, AIHR x2, Gartner, AIHR HRBP guide,
Balanced Scorecard Institute, Wowledge).
-->
---
name: hr-strategy-alignment
type: custom
status: adopted from marketplace source (Anthropic hr-strategy-alignment plugin), genericized, reassigned from maslow to merit
sources_referenced:
  - "Anthropic knowledge-work-plugins — hr-strategy-alignment plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/hr_scorecard.py not included in package."
  - "Kaplan, R. S. & Norton, D. P. (1996). The Balanced Scorecard: Translating Strategy into Action. Harvard Business School Press. Foundational text for the 4-perspective BSC framework."
  - "HiBob — How to Align HR Strategy with Business Strategy."
  - "AIHR — The Importance of Aligning HR Strategy with Business Strategy; HR Business Partner Model: A Complete Guide; HR Scorecard: A Full Guide for HR Leaders."
  - "Gartner — The Evolving Strategic Role of HR Business Partners."
  - "Balanced Scorecard Institute — Why HR Needs a Strategy."
  - "Wowledge — Develop a Balanced HR Scorecard for Optimal Business Alignment."
fulfills_catalog_entry: n/a (part of merit's expanded roster beyond catalog's 2-skill floor per §2)
genericization_notes:
  - "Source-plugin author assignment maslow (CHRO) → merit (P&C / Performance Management) — correct YVON owner for the strategy-alignment scope."
  - "VYON / Novizio / Hourbour / VYON-skill-names / felix / marcus-synth → stripped or retargeted to real YVON agents per CLAUDE.md §2."
  - "synth removed from routing — doesn't exist in YVON's Executive Office (marcus / vista / echo)."
assigned_agent: merit (People & Culture / Performance Management)
portable: true
date_added: 2026-07-31
tier: 3
description: The HRBP consultative model + HR Balanced Scorecard (4 perspectives: Financial / Employee-Customer / Internal Process / Learning & Growth). Every People & Culture initiative maps to a stated business objective; orphans flagged in both directions (objectives without initiatives; initiatives without objectives). Trigger on "HR strategy for", "HR balanced scorecard", "HRBP alignment", "why should we fund this HR program", "audit our HR initiatives", or "sunset which HR program".
triggers:
  - HR strategy for
  - HR balanced scorecard
  - HRBP alignment
  - why should we fund this HR program
  - audit our HR initiatives
  - sunset which HR program
  - HR business partner
  - align HR to business objectives
---

# HR Strategy Alignment

## Introduction

HR functions drift into running programs (engagement surveys, training catalogs, new
benefits) that feel useful but were never tied to a specific business objective. This
skill gives merit a structured way to check — and enforce — that every People & Culture
initiative maps to something leadership actually needs, using the **HR Business Partner
(HRBP) consultative model** and the **HR Balanced Scorecard (BSC)** as the two working
tools.

Adopted from Anthropic's `hr-strategy-alignment` plugin, reassigned from maslow to merit
(correct YVON owner for the strategy-alignment scope — merit's `performance-frame` +
`succession-planning` outputs both feed the BSC, so merit owns the aggregation layer),
genericized per §0.4b. All 7 public-source citations preserved.

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

## When to Use

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

## Structure / Protocol

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

## Instructions

### Phase 1 — Pull the current business objectives

For the venture / department / group in scope, pull the current 3–5 top strategic
objectives from:

- **marcus** (Executive Office / Strategy) — CEO briefs, strategic plan, roadmap outputs.
- **board** (Governance) cycle documentation — approved strategic commitments.
- **vista** (Executive Office / Roadmap Lead) — company-level OKRs (which per
  `performance-frame` also cascade to individual OKRs).
- The requesting lead directly if a specific venture/department scope.

**If NO business objectives are stated, do NOT invent them.** Ask the requester or route
to marcus per Fallback rule 1. An HR scorecard against invented objectives is worse than
no scorecard.

### Phase 2 — Run HRBP-style discovery pass

For each business objective, ask: **"what People-related constraint or opportunity is
attached to it?"** Examples:

- "Launching in a new market" → hiring speed + local compliance training + regional-ops
  onboarding.
- "Extending runway" → headcount cost discipline + retention focus (attrition cost is
  significant when runway is tight).
- "Deepening product capability" → competence-building via grove's `skill-gap-map` +
  `training-program-design`.
- "Improving retention" → maslow's `motivation-map` + `wellbeing-monitoring` +
  `recognition-program` + merit's `performance-frame` (fair review discipline).

Consultative posture per Gartner HRBP guidance: don't wait for leaders to ask HR for
something. Sit with venture/department leads regularly, translate their stated business
goals into People implications.

### Phase 3 — Map existing and proposed HR initiatives

Build the map:

- Rows: HR initiatives (existing + proposed).
- Columns: 4 BSC perspectives + specific business objective(s) each initiative serves.
- Cells: the mapping (which perspective, which objective).

Use `scripts/hr_scorecard.py`'s `build_scorecard()`.

### Phase 4 — Flag orphans in both directions

- **Business objectives with NO mapped HR initiative** → gap to fill. Recommend which
  operational P&C skill should own the new initiative.
- **HR initiatives with NO mapped business objective** → sunset candidates. Recommend
  the sunset conversation with the initiative's current owner.

Use `scripts/hr_scorecard.py`'s `flag_orphans()`.

### Phase 5 — Weight objectives per cycle

Objectives are weighted by cycle importance, NOT permanently. A venture launching in Q3
weights hiring-speed heavily this cycle; that same venture in Q4 (post-launch stabilization)
weights retention heavily instead. Static weights across ventures across cycles is a
sign this skill isn't being applied correctly.

Weights are 0.0–1.0; sum across an objective set should equal 1.0 for a coherent
prioritization. Enforced in `scripts/hr_scorecard.py`.

### Phase 6 — Score current progress per metric

For each mapped initiative with a defined metric, compute current-vs-target progress
using `scripts/hr_scorecard.py`'s `progress()`. Metrics without targets are marked
INCOMPLETE per Principle 4 — a "metric without a target isn't a strategy."

### Phase 7 — Summarize by perspective and overall

Use `scripts/hr_scorecard.py`'s `weighted_alignment_score()`:

- Per-perspective weighted alignment score.
- Overall weighted alignment score.
- Explicit gap list (objectives without mapped initiatives).
- Explicit orphan list (initiatives without mapped objectives).

**Present gaps and orphans as prominently as the wins.** A scorecard that only shows
green is not trustworthy per Principle 3.

### Phase 8 — Route budget-impact and strategic-priority conflicts

- **Budget-impacting recommendations** → `board` (via `fiduciary-guard`) BEFORE treating
  as final. Placeholder until Finance agent exists.
- **Strategic-priority questions** — especially conflicts across ventures (Venture A
  wants retention focus; Venture B wants hiring speed; both compete for the same P&C
  bandwidth) → `marcus` (Executive Office / Strategy) + `board` for the tradeoff call.
  This skill surfaces the tradeoff; leadership makes the call.

## Python Utility

`scripts/hr_scorecard.py` provides:

- `build_scorecard(objectives, initiatives)` — maps initiatives to objectives and
  perspectives; returns the scorecard structure.
- `flag_orphans(scorecard)` — returns two lists: orphan_objectives (no mapped initiative)
  and orphan_initiatives (no mapped objective).
- `progress(current, target)` — proportional progress (0.0 = 0%; 1.0 = 100%); flags
  INCOMPLETE if target is missing.
- `weighted_alignment_score(scorecard, weights)` — per-perspective score + overall score
  based on objective weights.
- `BSC_PERSPECTIVES` — reference list of the 4 BSC perspectives.

IMPLEMENTED-FROM-DESCRIPTION per §0.5. Self-tests included; run
`python3 hr_scorecard.py --test`.

NOT a Shared OS/logical/ script yet. Candidate second sources for graduation:
Kaplan & Norton (1996) *The Balanced Scorecard* + Becker, Huselid, Ulrich (2001)
*The HR Scorecard: Linking People, Strategy, and Performance*.

## Output Format

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

## Principles

1. **No HR initiative gets presented as a priority without a named business objective
   behind it.** Enforced by orphan-flagging (Phase 4) and Fallback rule 4. This is what
   prevents generic-perk drift.
2. **Re-weight priorities per venture and per planning cycle.** A static HR strategy
   across all ventures across cycles is a misapplication of this skill. Ventures at
   different maturity stages have different People priorities.
3. **Gaps and orphans are reported as prominently as wins.** A scorecard that only shows
   green isn't trustworthy. Presenting gaps prominently (rather than in a footnote) is
   what makes the scorecard useful for leadership decisions.
4. **Metrics without targets are INCOMPLETE, not a strategy.** Enforced in
   `scripts/hr_scorecard.py`'s `progress()` function. A number without a target isn't
   progress data — it's just a number.
5. **Budget and strategic-priority calls route out.** This skill aligns and recommends;
   it does NOT authorize. Budget → `board` via `fiduciary-guard`. Strategic priority
   conflicts → `marcus` + `board`.
6. **Aggregate signals only.** The scorecard consumes aggregate metrics (retention rate,
   time-to-hire, bench-strength score, engagement score) — never individual perf data.
   Universal Principle 7 aggregate-only inherited from hire.
7. **Value chain traceability.** Every entry: business objective → HR initiative →
   metric → current value → target value. Broken traceability is a §0.5 violation
   (invented objectives) or a Principle 4 violation (missing target).
8. **§0.6 flag.** The 4-perspective BSC framework is well-established (Kaplan & Norton
   canonical); specific applications (3-5 top objectives per venture; per-cycle
   re-weighting; orphan-in-both-directions flagging) are Tier B (framework-cited from
   named sources but not book-page-cited from `Agents/_books/`). Downgrade to Tier A
   when Kaplan & Norton 1996 + Becker/Huselid/Ulrich 2001 are placed and a
   `Shared OS/logical/hr_scorecard.py` version is built.

## Fallback

- **No stated business objectives available.** Do NOT fabricate. Ask the requesting lead
  or pull the latest CEO brief from marcus. State clearly that the scorecard is
  incomplete until objectives are confirmed. Per §0.5.
- **HR initiative exists but has no measurable metric yet.** Map it to the perspective /
  objective but mark progress as "unmeasured" rather than guessing. Recommend a specific
  metric to start tracking; do NOT invent a metric value.
- **Conflicting priorities across ventures** — Venture A wants retention focus, Venture
  B wants hiring speed, both compete for the same P&C bandwidth. Surface the tradeoff
  EXPLICITLY to marcus + board; do NOT silently pick one venture's priorities over
  another. This is Principle 5 in action.
- **Someone asks HR to run a program with no business tie.** Say so plainly per Principle 1.
  Ask what business objective the program is meant to serve. If none exists, propose
  either: (a) not running the program, or (b) defining a business objective that the
  program would serve, before running it. Don't rubber-stamp because it's a common HR
  practice elsewhere.
- **Business objective seems to be P&C-only** (e.g., "improve HR service quality" with
  no downstream business tie). Push back — HR-service quality is a means, not an end.
  Ask what business objective HR-service quality serves (e.g., "reduce manager time
  spent on people issues → free capacity for revenue-generating work").
- **Individual perf data proposed as scorecard input.** Redirect per Principle 6.
  Individual perf is `performance-frame`'s scope; the scorecard uses aggregate signals
  only.
- **Individual mental-health signal in a strategy conversation.** HARD BOUNDARY escalation
  per Universal Principle 3 — manager + HR Ops + EAP. Rare in strategy scope, but
  possible.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `performance-frame` (custom, merit — sibling) | Aggregate perf-cycle signals feed Employee/Customer perspective (retention rate, engagement) | Upstream — performance-frame aggregate output feeds scorecard |
| `succession-planning` (custom, merit — sibling) | Bench-strength scores per critical role feed Learning & Growth perspective | Upstream — succession-planning bench summary feeds scorecard |
| `feedback-methods` (custom, merit — sibling) | Delivery discipline for the sunset-conversation script with an initiative's current owner | Downstream — hr-strategy-alignment produces the sunset script; feedback-methods delivers |
| `motivation-map` + `wellbeing-monitoring` + `recognition-program` (custom, maslow) | Employee/Customer perspective metrics (eNPS, engagement, recognition equity) | Upstream — maslow's aggregate outputs feed the scorecard |
| `skill-gap-map` + `training-program-design` + `training-operations` (custom, grove) | Learning & Growth perspective metrics (skill-gap-closure rate, training completion, bench-strength via skill data); Internal Process perspective (training compliance completion) | Upstream — grove's aggregate outputs feed the scorecard |
| `hiring-kit` + `ats-selection` (custom, hire) | Internal Process perspective metrics (time-to-hire, D&I funnel metrics from ats-selection) | Upstream — hire's aggregate outputs feed the scorecard |
| `payroll-and-eor` (custom, hire) | Financial perspective metrics (cost-of-hire, HR spend, comp band adjustments) | Upstream — payroll-and-eor aggregate outputs feed the scorecard |
| `workforce-planning` (custom, hire) | Internal Process perspective (headcount vs plan variance); Learning & Growth (structural investment in capability) | Upstream |
| `vista` (Executive Office / Roadmap Lead) | Company OKRs (which cascade individually via performance-frame) inform the top strategic objectives this scorecard aligns to | Upstream — company OKRs are one source of the "top strategic objectives" in Phase 1 |
| `marcus` (Executive Office / Strategy) | Strategic-priority tradeoffs across ventures; source of business objectives when not otherwise stated | Bidirectional — marcus provides objectives; scorecard routes tradeoffs to marcus for the call |
| `board` (Governance) | Budget approval via `fiduciary-guard`; strategic commitments approval; cross-venture priority arbitration via `constitution-enforcement` / `strategic-veto` | Escalation |
| Future `comp-benchmarking` skill | Financial perspective's comp-related metrics | Downstream when future skill exists |
| Future `Shared OS: people-analytics-metrics` | Provides many of the aggregate metric values that populate scorecard entries | Upstream — supplies the numbers |
| Manager + HR Ops + EAP | Individual mental-health signal (rare in strategy scope) — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every scorecard, orphan report, and routing recommendation before shipping | Cross-cutting |

## References (public / verifiable)

- [How to Align HR Strategy with Business Strategy — HiBob](https://www.hibob.com/blog/align-hr-strategy-with-business-strategy/)
- [The Importance of Aligning HR Strategy with Business Strategy — AIHR](https://www.aihr.com/blog/aligning-hr-strategy-with-business-strategy/)
- [The Evolving Strategic Role of HR Business Partners — Gartner](https://www.gartner.com/en/human-resources/role/hr-business-partners)
- [HR Business Partner Model: A Complete Guide — AIHR](https://www.aihr.com/blog/hr-business-partner-model/)
- [Why HR Needs a Strategy — Balanced Scorecard Institute](https://balancedscorecard.org/blog/why-hr-needs-a-strategy/)
- [HR Scorecard: A Full Guide for HR Leaders — AIHR](https://www.aihr.com/blog/hr-scorecard/)
- [Develop a Balanced HR Scorecard for Optimal Business Alignment — Wowledge](https://wowledge.com/blog/developing-a-balanced-hr-scorecard)
