<!--
Shared OS skill per §13.1 and §13.6. Built at task #12 of the P&C department roll-out
after all 4 P&C agents (hire, maslow, grove, merit) shipped.

Per §13.1: agents CITE this skill by reference, NEVER copy content into their own
folders. Its operational skill/routing file names it as inherited-not-owned.

Per §13.6: the moment a capability is used by 2+ agents, it becomes Shared OS. This
one is used by all 4 P&C agents:
  - hire — ATS D&I funnel + cost-per-hire + time-to-fill metrics
  - maslow — eNPS + engagement + recognition equity
  - grove — training completion rate + skill-gap-closure rate + compliance-completion rollup
  - merit — feeds hr-strategy-alignment scorecard's 4 BSC perspectives entirely

Consolidation plan (operator-approved 2026-07-31):
  This file DEFINES the canonical formulas and reference tables. Existing local utilities
  (wellbeing_monitor.py, recognition_program.py, training_ops.py, succession_planning.py,
  hr_scorecard.py) continue to work as-is; each will eventually import from this Shared OS
  utility. Migration is a separate future task, not blocking any current agent.

Route classification per §8.2: mostly Route B (rule engine — thresholds + boolean checks)
with Route A elements (arithmetic — turnover rate, per-capita, eNPS). Not classified as
Shared OS/logical/ script per §13.5 because §8.0 two-book minimum isn't met — AIHR / SHRM /
Josh Bersin are vendor + institutional sources but not authenticated academic textbooks
per §8.8. Kept as skill-adjacent script at Shared OS/skills/people-analytics-metrics/scripts/
until book-grounded (candidate books: Guenole/Ferrar/Feinzig 2017 "The Power of People" +
Boudreau/Ramstad 2007 "Beyond HR").
-->
---
name: people-analytics-metrics
type: shared-os
status: built (Touch-1); metric definitions canonical; local utilities in maslow / grove / merit continue working with documented deprecation path
sources_referenced:
  - "AIHR — HR Metrics resource library (turnover, cost-per-hire, time-to-fill, first-year attrition, eNPS)."
  - "SHRM — People Analytics resource collection (institutional per §8.8)."
  - "Josh Bersin — HR analytics research; the People Analytics maturity model."
  - "Google re:Work — People Analytics guide (institutional, FREE)."
  - "Reichheld, F. F. (2006). The Ultimate Question — NPS methodology (which eNPS adapts)."
  - "Kaplan, R. S. & Norton, D. P. (1996). The Balanced Scorecard — foundational for merit's hr-strategy-alignment which consumes these metrics."
sharing_scope: cross-agent per §13.6 — consumed by hire + maslow + grove + merit
inherited_not_owned: true                           # per §13.1
assigned_agent: null                                # Shared OS — no single owner agent
consumers:                                          # 4 P&C agents cite this skill
  - hire (ats-selection D&I funnel metrics; hiring-kit outcome tracking)
  - maslow (wellbeing-monitoring eNPS + engagement; recognition-program equity + per-capita)
  - grove (training-program-design completion + ROI + Kirkpatrick Level 4; training-operations rollup)
  - merit (hr-strategy-alignment scorecard — consumes ALL metrics for 4 BSC perspectives; performance-frame year-end aggregate; succession-planning bench-strength)
portable: true
date_added: 2026-07-31
tier: 3
description: Canonical HR metric definitions + calculations for the P&C department — turnover, cost-per-hire, time-to-fill, first-year attrition, eNPS, engagement trend, training completion + ROI, bench-strength, skill-gap-closure, D&I funnel, and cross-cutting minimum-group-size suppression. Trigger on "compute [HR metric]", "define [HR metric]", "canonical formula for", "aggregate people-analytics for", "eNPS for [cohort]", "turnover rate for [venture]", "cost-per-hire", or "min-group-size suppression".
triggers:
  - compute HR metric
  - define HR metric
  - canonical formula for
  - aggregate people-analytics for
  - eNPS for
  - turnover rate for
  - cost-per-hire
  - time-to-fill
  - min-group-size suppression
  - HR metric definitions
---

# People Analytics Metrics (Shared OS)

## Introduction

This is the **canonical HR-metrics definitions + calculations skill** for the P&C
department. Built at task #12 of the P&C roll-out per §13.6 — the moment a capability
is used by 2+ agents, it becomes Shared OS.

**All 4 P&C agents cite this skill** as inherited-not-owned per §13.1:

- **hire** — ATS D&I funnel metrics (via `ats-selection`); cost-per-hire + time-to-fill
  (via `hiring-kit` outcome tracking).
- **maslow** — eNPS + engagement (via `wellbeing-monitoring`); recognition equity /
  per-capita (via `recognition-program`).
- **grove** — training completion rate + ROI (via `training-program-design` Kirkpatrick
  Level 4); compliance-completion rollup (via `training-operations`, subject to the
  aggregate-only inversion caveat for compliance records specifically).
- **merit** — feeds `hr-strategy-alignment` scorecard's 4 BSC perspectives entirely;
  `performance-frame` year-end aggregate signals; `succession-planning` bench-strength.

## Purpose

Prevents three failure modes that show up when HR metrics live per-agent:

1. **Definition drift.** Turnover rate defined slightly differently in three places
   produces three different "turnover rate" numbers on the same underlying data. This
   skill defines each metric ONCE, canonically.
2. **Formula reinvention.** Every agent implementing its own min-group-size suppression
   produces divergent thresholds and edge-case handling. This skill provides the
   canonical calculation.
3. **Scorecard opacity.** merit's `hr-strategy-alignment` scorecard consumes metrics from
   4+ upstream sources; without a shared source of truth, the scorecard's traceability
   breaks (which reduces its usefulness for leadership decisions per that skill's
   Principle 3).

## When to Use

Trigger on:

- "Compute [HR metric] for [cohort]" — turnover, cost-per-hire, time-to-fill, eNPS, etc.
- "Define [HR metric]" — canonical definition lookup
- "Canonical formula for [X]" — resolve ambiguity when two agents compute differently
- "Aggregate people-analytics for [venture / department / group]" — rollup for scorecard
- "Min-group-size suppression" — canonical boolean check
- "HR metric definitions" — cross-reference for auditing scorecard entries

Do NOT use for:

- **Individual perf data at publication surface** — aggregate-only rule inherited from
  hire's Universal Principle 7; the ONE exception (grove's `training-operations`
  compliance records) is scoped to that skill's specific compliance-audit-trail need.
- **Compensation-band data** — future `comp-benchmarking` skill (not yet built);
  currently routes to `payroll-and-eor` (custom, hire).
- **Recording individual feedback events** — merit's `feedback-methods` Principle 5
  forbids per-person feedback ledger; this skill has no feedback-recording capability.
- **Legal-compliance-specific metrics** — retention periods, EEOC filing thresholds route
  to operator + employment counsel per Universal Principle 5.

## Structure / Protocol

The metric catalog groups 12 canonical metrics across 5 categories + 1 cross-cutting rule:

```
CATEGORY 1: TALENT FLOW
  1. Voluntary turnover rate     = leavers / avg headcount over period
  2. Regrettable turnover rate   = (voluntary leavers rated high perf) / avg headcount
  3. First-year attrition        = 12-mo new-hire departures / same-cohort hires
  4. Time-to-fill                = days from req-open to accepted-offer (from hire's ATS)

CATEGORY 2: COMP & BENEFITS
  5. Cost-per-hire               = (internal + external hiring costs) / hires

CATEGORY 3: ENGAGEMENT & CULTURE
  6. eNPS                        = %promoters (9-10) - %detractors (0-6)
  7. Engagement score trend      = cross-cycle Δ on aggregate engagement pulse

CATEGORY 4: CAPABILITY & DEVELOPMENT
  8. Training completion rate    = completions / enrolled
  9. Bench-strength score        = weighted sum of successors per critical role
                                   (Ready Now = 3; 1-2yr = 2; 3-5yr = 1; not_id = 0)
 10. Skill-gap closure rate      = gaps closed / gaps identified in previous cycle

CATEGORY 5: DE&I
 11. D&I funnel by stage         = count by self-ID category at each hiring-loop stage

CROSS-CUTTING RULE:
 12. Min-group-size suppression  = boolean threshold check (default 5; org-configurable)
                                   Applied before ANY per-group figure ships broadly.
                                   Consumed by all 4 P&C agents' publication surfaces.
```

## Instructions

### Phase 1 — Metric definition lookup

For any HR-metric question routing to this skill, provide the canonical definition first
(from the catalog above). If the requesting agent's local usage differs from the
canonical definition, flag the divergence and default to the canonical.

### Phase 2 — Compute the metric

Use `scripts/people_analytics.py` for the calculation. The utility exposes one function
per metric with named parameters matching the definition. Return the numeric value + the
canonical definition string used, so the calling agent can cite consistently.

### Phase 3 — Apply min-group-size suppression before publication

**Every per-group figure produced by this skill is subject to min-group-size suppression
before publication.** The default threshold is 5 (typical HR-privacy floor); each org
can override via config. Suppression action per Universal Principle 4 (aggregate-only):
suppress the segmented figure OR roll up with a larger cohort OR report qualitatively
— never publish per-person-identifiable data.

The compliance-training completion rollup from grove's `training-operations` has a
narrow aggregate-only inversion (compliance records stay individually identifiable BY
LEGAL NECESSITY), but that inversion is scoped to that skill's specific
compliance-audit-trail scope — this Shared OS skill's outputs never inherit that
inversion.

### Phase 4 — Return with citation-ready context

Return format includes:
- Metric value (numeric)
- Canonical definition string (matches Structure / Protocol above)
- Suppression status (SUPPRESSED_BELOW_THRESHOLD or PUBLISHED)
- Cohort description
- Cycle context (which period the calculation covers)

This return format lets the calling agent (typically merit's `hr-strategy-alignment`
scorecard) cite the metric consistently across the scorecard's 4 perspectives.

## Canonical Definitions Reference (metric-by-metric)

### 1. Voluntary turnover rate

- **Formula:** `voluntary_leavers / average_headcount_over_period`
- **Period:** typically annualized; if computing quarterly, annualize by ×4 for
  comparability
- **Excludes:** involuntary terminations, retirements, contract-end departures
- **Healthy band context:** ~10-15% annualized for tech / knowledge-work industries
  (per AIHR / Bersin research; heuristic, not universal)
- **Consumed by:** merit's `hr-strategy-alignment` Employee/Customer perspective;
  merit's `performance-frame` year-end synthesis (retention as a signal); maslow's
  `wellbeing-monitoring` (elevated turnover = burnout-adjacent signal)

### 2. Regrettable turnover rate

- **Formula:** `(voluntary_leavers_rated_high_perf) / average_headcount_over_period`
- **"High perf" definition:** typically 9-box Star / Future Leader or Trusted
  Professional bands, sourced from merit's `succession-planning` 9-box data
- **Rationale:** losing low-performers is a signal the system is working; losing
  high-performers is the retention alarm
- **Consumed by:** merit's `hr-strategy-alignment` Employee/Customer perspective (this
  is the highest-signal turnover metric); merit's `succession-planning` (regrettable
  loss of Ready-Now candidate is a governance escalation)

### 3. First-year attrition

- **Formula:** `12_month_new_hire_departures / same_cohort_hires`
- **Timing:** measured per hire cohort at the 12-month mark
- **Rationale:** captures onboarding + hiring-loop mismatches specifically;
  distinguishable from general turnover
- **Consumed by:** hire's `hiring-kit` (feedback loop on Phase 6 debrief + Phase 7
  reference-check quality); merit's `hr-strategy-alignment` Internal Process perspective

### 4. Time-to-fill

- **Formula:** `days_from_req_open_to_accepted_offer`
- **Source:** hire's `ats-selection` D&I funnel report / ATS data
- **Reported as:** median (not mean — long-tail single reqs skew mean); per role type;
  per venture
- **Consumed by:** merit's `hr-strategy-alignment` Internal Process perspective; hire's
  own `workforce-planning` (time-to-fill vs time-to-need drives Build/Buy/Borrow/Bridge)

### 5. Cost-per-hire

- **Formula:** `(internal_hiring_costs + external_hiring_costs) / hires_in_period`
- **Internal costs:** interviewer time (loaded), recruiter time, systems costs allocated
- **External costs:** ATS platform fees, sourcing tool subscriptions (Gem / hireEZ /
  LinkedIn RSC), external recruiter fees, referral bonuses
- **Consumed by:** merit's `hr-strategy-alignment` Financial perspective; hire's
  `hiring-kit` outcome tracking

### 6. eNPS (Employee Net Promoter Score)

- **Formula:** `%promoters − %detractors` (integer between -100 and +100)
- **Promoters:** responses of 9 or 10 on "how likely to recommend as place to work"
- **Passives:** 7-8
- **Detractors:** 0-6
- **Already implemented in:** maslow's `wellbeing_monitor.py` — this skill's `enps()`
  function is the canonical version; maslow's local implementation continues to work and
  should eventually import from here.
- **Consumed by:** maslow's `wellbeing-monitoring`; merit's `hr-strategy-alignment`
  Employee/Customer perspective

### 7. Engagement score trend

- **Formula:** `current_cycle_engagement_score − previous_cycle_engagement_score` (Δ)
- **Trend labels:** rising (Δ ≥ +0.3 on 1-5 scale); stable (|Δ| < 0.3); declining (Δ ≤ -0.3)
- **Heuristic per §0.6:** ±0.3 threshold is directional; can be operator-configured
- **Consumed by:** maslow's `motivation-map` (mirrors this pattern for SDT-need scores);
  merit's `hr-strategy-alignment` Employee/Customer perspective

### 8. Training completion rate

- **Formula:** `completions / enrolled`
- **Range:** 0.0-1.0
- **Already implemented in:** grove's `training_program.py` — canonical version here
- **Consumed by:** grove's `training-program-design`; grove's `training-operations`
  (per-department rollup); merit's `hr-strategy-alignment` Internal Process perspective

### 9. Bench-strength score

- **Formula:** sum of `readiness_weights` across identified successors per critical role
- **Readiness weights:** Ready Now = 3; Ready 1-2yr = 2; Ready 3-5yr = 1;
  Not Identified = 0
- **Risk bands:** critical=0 / high_risk=1 / moderate=2-3 / healthy≥4
- **Already implemented in:** merit's `succession_planning.py` — canonical version here
- **Consumed by:** merit's `succession-planning`; merit's `hr-strategy-alignment`
  Learning & Growth perspective; **MANDATORY escalation to board + marcus when score = 0**

### 10. Skill-gap closure rate

- **Formula:** `gaps_closed_in_previous_cycle / gaps_identified_in_previous_cycle`
- **Definition of "closed":** gap re-measured at ≤1 level below target (i.e., moved from
  Novice/Developing to Proficient+, or from Proficient to Advanced)
- **Cycle:** typically annual; can be quarterly for high-velocity ventures
- **Consumed by:** grove's `skill-gap-map` (outcome measurement); merit's
  `hr-strategy-alignment` Learning & Growth perspective

### 11. D&I funnel by stage

- **Format:** count by voluntary-self-ID category at each hiring-loop stage
  (applied → screened → interviewed → offered → hired)
- **Reporting cadence:** quarterly minimum
- **Rules:** voluntary self-ID only (never inferred); aggregate-only always;
  minimum-group-size suppression applies BEFORE any segmented figure ships
- **Already implemented in:** hire's `ats-selection` (Topic D)
- **Consumed by:** hire's `ats-selection`; merit's `hr-strategy-alignment` Internal
  Process perspective (funnel health)

### 12. Minimum-group-size suppression (CROSS-CUTTING)

- **Rule:** boolean threshold check — `cohort_size >= threshold` (default 5, org-configurable)
- **Purpose:** privacy — prevents per-person-identifiable inference from segmented
  aggregate figures
- **Applied by:** ALL P&C agents' publication surfaces (with the narrow scoped exception
  of grove's `training-operations` compliance-audit-trail records per its Principle 3)
- **Already implemented in:** maslow's `wellbeing_monitor.py` + `recognition_program.py`;
  grove's `training_ops.py` (via `rollup_completion_counts` which respects the aggregate
  boundary for non-compliance rollups)
- **Canonical version in this skill's script.** Local utilities continue to work; migration
  to shared import is a future task.

## Python Utility

`scripts/people_analytics.py` provides:

- Metric functions matching the 11 numeric metrics above (D&I funnel is a data structure,
  not a single-number function)
- `min_group_size_ok(cohort_size, threshold)` — canonical boolean check
- `MetricResult` dataclass — returns value + definition + suppression status + cohort +
  cycle context for citation-ready output
- `HEALTHY_BANDS` — reference dict for interpretive guidance (turnover 10-15% for tech,
  etc.); labeled as heuristic per §0.6

IMPLEMENTED-FROM-DESCRIPTION per §0.5. Self-tests included; run
`python3 people_analytics.py --test`.

**NOT a Shared OS/logical/ script yet** (§8.0 two-book minimum unmet). §8.8 authentication
check: AIHR is a vendor / practitioner source; SHRM is institutional but not academic;
Josh Bersin is practitioner-analyst; re:Work is Google institutional. Two clean
authenticated academic sources needed for §8.0 promotion.

Candidate books for graduation:

- **Guenole, N., Ferrar, J., & Feinzig, S. (2017).** *The Power of People: Learn How Successful Organizations Use Workforce Analytics to Improve Business Performance.* Pearson FT Press. Named authors, HR-analytics practitioner-academic text.
- **Boudreau, J. W. & Ramstad, P. M. (2007).** *Beyond HR: The New Science of Human Capital.* Harvard Business School Press. Named academic author (Boudreau, Cornell / USC).
- **Fitz-Enz, J.** *The New HR Analytics.* AMACOM. Named practitioner-academic; foundational HR-analytics text.

## Output Format

Each invocation returns a `MetricResult`-shaped output containing:

- **value** — the numeric metric (float or int)
- **definition** — canonical definition string (matches this skill's catalog verbatim)
- **cohort** — description of the group the metric covers
- **cycle** — the period the calculation covers
- **suppression_status** — "PUBLISHED" or "SUPPRESSED_BELOW_THRESHOLD"
- **healthy_band_reference** — optional interpretive band if one exists in HEALTHY_BANDS
- **consumer_agents** — list of agents that typically consume this metric (for
  traceability in merit's scorecard citations)

## Principles

1. **Canonical definitions — no divergence.** If a calling agent's local usage differs
   from the definition here, flag the divergence and default to the canonical. Definition
   drift is the specific failure mode this skill exists to prevent.
2. **Min-group-size suppression is universal.** Every per-group figure produced or
   consumed via this skill respects the threshold before publication. The narrow
   compliance-record exception in grove's `training-operations` does NOT extend to this
   skill's outputs.
3. **Aggregate-only at publication surface.** Universal Principle 7 (inherited from
   hire) applies. Individual perf / demographic / feedback / medical data never publish
   identifiably through this skill.
4. **Healthy bands are heuristics.** Turnover 10-15% for tech, engagement Δ ±0.3, etc.
   are directional per §0.6; can be operator-overridden per venture / industry context.
   Never presented as universal law.
5. **Regrettable turnover is the highest-signal turnover metric.** Losing low-performers
   is a signal the system is working; losing high-performers is the retention alarm.
   `hr-strategy-alignment` scorecards should weight it accordingly.
6. **Metric without target = INCOMPLETE.** Inherited from merit's `hr-strategy-alignment`
   Principle 4. A metric value without a target for comparison isn't a strategy signal
   — it's just a number.
7. **Cite consumer traceability.** Every metric output names which agents typically
   consume it. When merit's scorecard aggregates from this skill, the citation is:
   `metric X → this Shared OS skill → definition Y → consumed by [list]`.
8. **§0.6 flag.** Metric definitions themselves are canonical per cited vendor /
   institutional sources; specific interpretive bands (healthy turnover 10-15%; engagement
   Δ ±0.3; etc.) are Tier B (framework-cited, heuristic). Downgrade to Tier A when
   Guenole/Ferrar/Feinzig + Boudreau/Ramstad are placed and this skill's script graduates
   to Shared OS/logical/ per §13.5.

## Fallback

- **Cohort below minimum-group-size threshold.** Suppress per Principle 2; return
  `suppression_status: SUPPRESSED_BELOW_THRESHOLD`. Never publish the raw figure.
- **Metric with no target defined.** Return the value with `INCOMPLETE` flag per
  Principle 6; recommend defining a target before consuming the metric in a scorecard.
- **Definition ambiguity from a calling agent** (agent's local usage differs from
  canonical). Flag the divergence per Principle 1; default to canonical; recommend the
  agent's local implementation eventually import from here.
- **Cross-cycle comparison request when the definition changed between cycles.** Refuse
  the comparison per §0.5 (comparing apples to oranges is a fabrication of comparability);
  recommend recomputing prior cycles under the new definition first.
- **Compliance-training completion rollup** (grove's `training-operations` scope).
  Respect grove's aggregate-only inversion — this skill's outputs never inherit the
  individually-identifiable exception; keep the rollup aggregate.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `hr-strategy-alignment` (custom, merit) | Consumes ALL 12 metrics for the 4 BSC perspectives | Downstream — this skill supplies; merit's scorecard aggregates |
| `wellbeing-monitoring` (custom, maslow) | Provides eNPS + engagement trend; already has local implementation | Bidirectional — canonical here; maslow's local continues |
| `recognition-program` (custom, maslow) | Provides per-capita recognition equity + min-group-size discipline | Bidirectional — canonical here; maslow's local continues |
| `training-program-design` (custom, grove) | Provides training completion rate + Kirkpatrick Level 4 ROI framing | Bidirectional |
| `training-operations` (custom, grove) | Provides completion rollup; **respects grove's aggregate-only inversion for compliance records specifically** | Bidirectional with scoped exception |
| `succession-planning` (custom, merit) | Provides bench-strength score; already has local implementation | Bidirectional — canonical here; merit's local continues |
| `performance-frame` (custom, merit) | Provides year-end aggregate signals feeding regrettable-turnover analysis | Downstream — performance-frame feeds; this skill computes regrettable-turnover |
| `hiring-kit` (custom, hire) | Provides first-year-attrition (post-hire outcome) + cost-per-hire | Bidirectional |
| `ats-selection` (custom, hire) | Provides time-to-fill + D&I funnel data | Bidirectional |
| `skill-gap-map` (custom, grove) | Provides skill-gap-closure rate | Bidirectional |
| `verification-before-completion` (Shared OS) | Evidence gate on every metric calculation before it ships | Cross-cutting |

## References (public / verifiable)

- [AIHR — HR Metrics Ultimate Guide](https://www.aihr.com/blog/hr-metrics/)
- [SHRM — People Analytics resources](https://www.shrm.org/topics-tools/topics/hr-analytics)
- [Google re:Work — People Analytics guide (FREE)](https://rework.withgoogle.com/en/guides/measure)
- [Josh Bersin — People Analytics maturity model](https://joshbersin.com/)
- [AIHR — eNPS Ultimate Guide](https://www.aihr.com/blog/employee-net-promoter-score-enps/)
- [AIHR — Turnover rate calculation](https://www.aihr.com/blog/employee-turnover-rate/)
- [AIHR — Cost per hire](https://www.aihr.com/blog/cost-per-hire/)

## Migration Notes (deprecation path for local utilities)

Per operator decision 2026-07-31: local utilities continue to work; migration to shared
import is a future task, not blocking any current agent.

Local utilities that implement duplicated logic today:

| Local utility | Duplicated function | Canonical location (this skill) | Migration recommendation |
|---|---|---|---|
| `maslow/custom/wellbeing-monitoring/scripts/wellbeing_monitor.py` | `enps()`, `min_group_size_ok()`, `suppress_if_small()` | `people_analytics.enps()`, `.min_group_size_ok()`, `.suppress_if_small()` | Future: replace local implementations with `from shared_os.people_analytics import ...` |
| `maslow/custom/recognition-program/scripts/recognition_program.py` | `per_capita_recognition()` (which reuses min-group-size), `participation_rate()` | `people_analytics.per_capita()`, `.participation_rate()` | Same |
| `grove/custom/training-program-design/scripts/training_program.py` | `completion_rate()`, `roi_estimate()` | `people_analytics.completion_rate()`, `.roi_estimate()` | Same |
| `grove/custom/training-operations/scripts/training_ops.py` | `rollup_completion_counts()` (aggregate rollup only; compliance records stay in that skill) | `people_analytics.rollup_completion_counts()` | Same (with the aggregate-only inversion caveat preserved in training-operations) |
| `merit/custom/succession-planning/scripts/succession_planning.py` | `bench_strength_score()`, `risk_flag()` | `people_analytics.bench_strength_score()`, `.risk_flag()` | Same |
| `merit/custom/hr-strategy-alignment/scripts/hr_scorecard.py` | `build_scorecard()` orchestrates but doesn't duplicate metric-level logic | (already high-level; consumes from local utilities today; will consume from Shared OS after migration) | Same |

**Migration is a separate task** — not blocking current agent compile-clean state.
Recommended migration trigger: when one of the agent-local utilities needs a bug fix
or new feature, migrate to Shared OS import at that moment (opportunistic refactoring,
not a mass rewrite).
