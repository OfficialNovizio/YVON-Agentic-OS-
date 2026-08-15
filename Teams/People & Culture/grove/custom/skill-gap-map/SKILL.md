<!--
Custom skill — built by MERGING two sources:
  1. Catalog entry `vyon-skill-gap-map` (VYON_Skills_Catalog_Full_v2.html) — protocol
     structure: map current capabilities vs next-2-quarter needs; gap → build/borrow/buy.
  2. Anthropic knowledge-work-plugins `skills-gap-analysis` (2026-07-02 packaged version) —
     5-step framework (Plan → Identify → Measure → Act → Build for the future); 1-5
     proficiency scale; build/buy/borrow/bridge routing; scripts/skills_gap.py reference.

Per §4.6 merges become custom, not marketplace copies. Merge preserved: (a) catalog's
"build/borrow/buy" plus plugin's "bridge" as the full 4-way action set; (b) plugin's
5-step framework as the primary structure; (c) plugin's 1-5 proficiency scale with BARS
anchors; (d) catalog's "next-2-quarter horizon" as the time anchor for "Plan" step.

Genericization strip (§0.4b):
- name: vyon-skill-gap-map + skills-gap-analysis → skill-gap-map
- "maslow (CHRO agent)" (plugin) → grove (P&C / L&D) — reassignment
- "VYON", "Hourbour", "Novizio" → generic
- "felix (Finance)" → board (fiduciary-guard); note future Finance agent
- "comply (Legal)" → operator + employment counsel (no CLO exists in YVON)
- "HR Strategy Alignment" (plugin skill name) → future merit skill
- "People Analytics & Metrics" → future Shared OS: people-analytics-metrics
- "Recruitment & Selection" → hire's `hiring-kit` + `ats-selection` (real YVON skills)
- "Workforce Planning & Org Design" (plugin skill name) → workforce-planning (custom, hire)
- "Training Program Design" (plugin skill name) → training-program-design (grove's own next skill)
- "Career Pathing & Succession Planning" (plugin skill name) → future merit skill

Python utility skill_gap.py: IMPLEMENTED-FROM-DESCRIPTION per §0.5 — source plugin's SKILL.md
references it but the file was not included in the package. Same pattern as the other 3
plugin scripts (workforce_calculator.py, wellbeing_monitor.py, recognition_program.py).
-->
---
name: skill-gap-map
type: custom
status: built by merging catalog `vyon-skill-gap-map` + Anthropic `skills-gap-analysis` plugin, genericized per §0.4b
sources_referenced:
  - "Catalog entry: vyon-skill-gap-map (VYON_Skills_Catalog_Full_v2.html) — protocol structure and time anchor."
  - "Anthropic knowledge-work-plugins — skills-gap-analysis plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/skills_gap.py not included in package."
  - "Cornerstone OnDemand — How to Conduct a Skills Gap Analysis."
  - "SHRM — How to Conduct a Skills Gap Analysis."
  - "AIHR — Skills Gap Analysis: All You Need To Know; Competency Mapping."
  - "Workhuman — Skills Matrix: Map Skills, Close Gaps & Plan Development."
  - "muchskills — Skills matrices in 2026."
  - "McKinsey — Using Skill Gap Assessments to Future-Proof Your Organization."
  - "Paylocity — How to Conduct a Skills Gap Analysis."
fulfills_catalog_entry: vyon-skill-gap-map (merged with Anthropic skills-gap-analysis plugin per §4.6)
genericization_notes:
  - "vyon- prefix stripped per §0.4a; merged name is `skill-gap-map`."
  - "VYON / Hourbour / Novizio / felix / comply / VYON-skill-names → stripped or retargeted to real YVON agents per CLAUDE.md §2."
  - "maslow assignment retargeted to grove (P&C / L&D — the actual owner in YVON's roster)."
assigned_agent: grove (People & Culture / Learning & Development)
portable: true
date_added: 2026-07-31
tier: 3
description: The 5-step skills gap analysis framework — build a scored skills matrix (1-5 proficiency scale), calculate gaps and priority scores (gap × criticality), rank, and route each top-priority gap to Build / Buy / Borrow / Bridge based on timeline vs internal buildability. Trigger on "skills matrix for", "skills gap analysis", "what skills does this team need", "hire vs upskill", "build buy borrow bridge", "capability assessment", or "how big is the [X] skill gap".
triggers:
  - skills matrix for
  - skills gap analysis
  - what skills does this team need
  - hire vs upskill
  - build buy borrow bridge
  - capability assessment
  - how big is the skill gap
  - proficiency map for
---

# Skill Gap Map

## Introduction

This skill packages the 5-step skills gap analysis framework (Plan → Identify → Measure →
Act → Build for the future) into grove's operational entry point. It answers three
connected questions: "what skills do we have," "what do we need," and "what's the smartest
way to close the difference." Output is a scored skills matrix plus a Build/Buy/Borrow/Bridge
recommendation per top-priority gap — NOT a vague "we need more X" and NOT the reflexive
"just hire" or "just train" default that most gap-analysis requests collapse into.

Built by merging the catalog's `vyon-skill-gap-map` entry (protocol structure) with
Anthropic's `skills-gap-analysis` plugin (5-step framework, 1-5 scale, 4-way routing),
then genericized per §0.4b. The merge per §4.6 makes this a custom skill, not a marketplace
copy of either source.

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

## When to Use

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

## Structure / Protocol

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

## Skills Matrix & Scoring

Explicit 1–5 scale with observable behavioral anchors so scores are comparable across
raters:

| Level | Label | Definition (observable behavior) |
|---|---|---|
| 1 | Novice | Aware of the skill; no applied experience. Can define terms; cannot perform. |
| 2 | Developing | Can perform with guidance / supervision. Needs coaching mid-task. |
| 3 | Proficient | Can perform INDEPENDENTLY in standard situations. Handles routine cases without help. |
| 4 | Advanced | Handles complex / non-standard situations; can guide others. Recognized team resource. |
| 5 | Expert | Recognized authority; sets standards; trains others. Rare in most orgs. |

The anchors are behavioral (observable) so ratings are comparable across managers, teams,
and cycles. Combine top-down (manager) + bottom-up (self) + objective (certifications /
project output) inputs. Rater discrepancies > 1 level are surfaced for a conversation,
never silently averaged.

(Workhuman; AIHR; muchskills)

## Build / Buy / Borrow / Bridge

Once a top-priority gap is identified, the action isn't automatically "hire" or "train"
per Purpose failure mode 2. Pick deliberately:

| Action | Best when | Route to |
|---|---|---|
| **Build** (train / upskill existing people) | `time_available >= time_to_build` AND the skill is developable in-house | grove's `training-program-design` (when built); currently: recommend Build action + note downstream owner |
| **Buy** (hire externally) | Timeline is tight OR the skill isn't developable internally at the needed depth | hire's `hiring-kit` (which runs the 7-phase hiring workflow) |
| **Borrow** (contract / consultant) | Scarce or short-term skill that doesn't justify a permanent hire; useful for launch-window gaps | hire's `payroll-and-eor` (which owns W-2 vs 1099 vs EOR classification for the contractor) |
| **Bridge** (redeploy someone with adjacent skillset) | A related skill already exists internally AND org-design flexibility exists to move people | hire's `workforce-planning` (which owns headcount + structural moves) |

(Synthesized from McKinsey and Paylocity gap-closing guidance)

**Bridge is often the underused option** — reflex hiring skips over redeployment because
it requires org-design coordination. Grove explicitly considers Bridge on every top-priority
gap where the "related skill already exists internally" test could plausibly hold.

## Instructions

Follow this sequence when producing a gap-map:

### Phase 1 — Plan (scope + business driver)

Confirm the scope (which roles / team / venture) and the specific business driver behind
the request. Pull the business driver from a `motivation-map` Phase-5 competence-need
diagnosis, from a `workforce-planning` action-plan gap, from `hire`'s hiring-loop
prep, or from future `merit`'s hr-strategy-alignment scorecard. Do NOT accept "we should
build a skills matrix" as a scope in itself — that's a §Fallback rule 3 unscoped-inventory
request; scope down to the specific business anchor first.

### Phase 2 — Identify (skills taxonomy)

List the SPECIFIC skills relevant to this scope only. 5–15 skills per role/team is the
typical range; more means the taxonomy has drifted from the business driver. If the
requester wants to "catalog everything," push back per Fallback rule 3.

Cover technical skills + behavioral competencies + role-specific capabilities in one
taxonomy — don't split them into separate matrices unless the scope explicitly requires it.

### Phase 3 — Set required proficiency per skill per role

For each skill in the taxonomy, set the required proficiency level (1–5) that the role
NEEDS given the business driver. This is often NOT what's on the existing job description
— job descriptions drift; the business driver in Phase 1 is the anchor. If a role
description says "Advanced (4)" but the business driver only requires "Proficient (3)",
use Proficient. If the business driver requires "Advanced" but the JD says "Proficient",
use Advanced and note the JD needs updating.

Do NOT invent required proficiencies — work with the requester if unclear per Fallback rule 1.

### Phase 4 — Measure current proficiency

Gather current proficiency per person per skill using the 1–5 scale:
- **Self-assessment** — the person's own read of their proficiency.
- **Manager review** — the direct manager's read.
- **Objective evidence** — certifications, recent project output, work samples, published
  contributions. Use where available; don't fabricate where absent.

**Rater discrepancy > 1 level:** surface it, don't silently average. Per Fallback rule 2.

### Phase 5 — Calculate gaps and priority

Use `scripts/skill_gap.py`:

- `gap = required - current` (positive = shortfall; zero or negative = met/exceeded)
- `criticality` = a 0–1 value stating how much this skill matters to the stated business
  driver. 1.0 = directly gates the driver; 0.1 = nice-to-have; ~0.5 = supportive but not
  essential. Criticality comes from the requester + business driver, not from grove
  guessing.
- `priority_score = gap × criticality`

Rank gaps by priority_score, not by raw gap size. A gap of 3 in a nice-to-have skill
(3 × 0.2 = 0.6) is lower priority than a gap of 1 in a mission-critical skill (1 × 0.95 =
0.95).

### Phase 6 — Rank and select top-priority gaps

The top-3 to top-5 gaps by priority_score become the action-plan targets. Longer lists
usually produce no action; short lists drive real work.

### Phase 7 — Recommend Build / Buy / Borrow / Bridge per top-priority gap

Per the § Build / Buy / Borrow / Bridge table above. Feed the following into the routing
logic:

- `time_available` — how many months / quarters until the business driver requires the
  skill to be closed.
- `time_to_build` — realistic estimate to move a person from current to required
  proficiency for THIS skill (domain-dependent; grove estimates cautiously and labels
  as directional per `deliberate-practice` Principle 3).
- `internally_buildable` — is the skill developable in-house? (Do we have someone at
  Level 4-5 who can teach; is there stretch-assignment scope for real deliberate
  practice?)
- `related_skill_exists_internally` — does someone at Level 3+ in an adjacent skill exist
  who could Bridge?

The script's `recommend_action()` function combines these into a Build / Buy / Borrow /
Bridge suggestion. The script's output is a suggestion, not a decision — the operator
confirms.

### Phase 8 — Route each recommendation

- **Build** → grove's own `training-program-design` (when built) + `deliberate-practice`
  for the practice-loop design.
- **Buy** → hire's `hiring-kit` (which runs the 7-phase hiring workflow) + hire's
  `ats-selection` for platform / pipeline.
- **Borrow** → hire's `payroll-and-eor` for contractor classification (W-2 / 1099 / EOR).
- **Bridge** → hire's `workforce-planning` for the headcount / structural move.
- **All cost implications** → `board` (via `fiduciary-guard`) for spend approval;
  placeholder until Finance agent exists.
- **Regulatory-exposure gaps** (e.g., compliance-specialist gap in a regulated venture) →
  operator + employment / regulatory counsel per Universal Principle 5.

## Python Utility

`scripts/skill_gap.py` provides:

- `gap(required, current)` — required − current; negative clamped to 0.
- `priority_score(gap_value, criticality)` — gap × criticality (with criticality bounds check).
- `rank_gaps(gap_list)` — sort by priority_score descending.
- `recommend_action(gap_value, criticality, time_available_months, time_to_build_months, internally_buildable, related_skill_exists)` — returns one of 'Build' / 'Buy' / 'Borrow' / 'Bridge' with rationale.
- Reference: 1–5 proficiency scale as a lookup dict.

IMPLEMENTED-FROM-DESCRIPTION per §0.5 — plugin's SKILL.md described these functions but
did not ship the file. Self-tests included; run `python3 skill_gap.py --test`.

NOT a Shared OS/logical/ script yet (§8.0 two-book minimum unmet — needs pairing with a
skills-analysis book like Deming's "Skills Matrix" work or an SHRM certified textbook per
§8.8). Kept as agent-local utility until book-grounded.

## Output Format

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

## Principles

1. **Every gap measured against an EXPLICIT required proficiency, not a vague target.**
   Refuse to compute gaps without a required proficiency; work with the requester to
   set one per Fallback rule 1.
2. **Prioritize by criticality-weighted gap, not raw gap size.** A small gap in a
   mission-critical skill outranks a large gap in a nice-to-have.
3. **Combine multiple rating sources; don't rely on self-assessment or manager assessment
   alone.** Reconcile discrepancies > 1 level rather than averaging silently.
4. **Recommend Build / Buy / Borrow / Bridge deliberately.** Don't default to "hire" or
   "train" out of habit. Especially consider Bridge — the underused option most reflex
   analyses skip.
5. **Aggregate at the skill / role / team level.** Individual performance evaluation is
   `merit`'s scope; grove uses individual data only as one input to aggregate gap analysis
   and never surfaces individual scores identifiably.
6. **Time-to-build estimates are directional.** Per `deliberate-practice` Principle 3, do
   not quote specific hour counts or timeline guarantees as authority. Domain-dependent
   with acknowledged uncertainty.
7. **Treat as recurring analysis.** Re-run when the business driver changes. Static gap
   matrices go stale fast.
8. **§0.6 flag.** The 1–5 scale anchors and the Build/Buy/Borrow/Bridge routing thresholds
   are Tier B (canonical framework from cited sources; not book-cited from `Agents/_books/`
   per §8.4). Downgrade to Tier A when an authenticated skills-analysis textbook is placed
   and a `Shared OS/logical/skill_gap.py` version is built per §8.9.

## Fallback

- **No required proficiency defined for a skill.** Don't invent a target. Work with the
  requester (or the accountable manager if the requester can't set it) to define what
  "good enough" looks like for the role/skill before running the gap calculation. Per §0.5.
- **Rater discrepancy > 1 level.** Don't silently average. Surface the discrepancy in
  the rater-discrepancy log and note it needs a conversation (usually a calibration one).
  A wide split is data — usually meaning either the manager or the person doesn't have
  clear evidence of the skill's real level.
- **Request to catalog every skill in the org.** Push back per Purpose failure mode 1.
  Scope down to what's relevant to the stated business driver. An unscoped inventory
  produces noise; a scoped analysis produces action.
- **Urgent business driver + skill not internally buildable in time.** Do NOT recommend
  Build anyway. Recommend Buy or Borrow even if it costs more, and state why (timeline
  vs internal-buildability tradeoff explicit in the memo).
- **Cost implication proposed as fait accompli.** Route to `board` (fiduciary-guard) for
  approval BEFORE the recommendation ships as final. Per Universal Principle 6.
- **Regulatory-exposure gap.** Route to operator + employment/regulatory counsel per
  Universal Principle 5 — the gap-map produces the technical read; legal counsel confirms
  the regulatory exposure and any required certification path.
- **Individual-perf-evaluation request masquerading as gap-map.** Decline — grove's scope
  is aggregate. Route to `merit` (when built) or to the accountable manager. Per Principle 5.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `training-program-design` (grove — next skill) | Build actions (the training program to close the gap) | Downstream — Build routes here |
| `deliberate-practice` (custom, grove) | Time-to-build estimates + practice-loop design for the 70% and 20% pieces of the Build action | Bidirectional — DP informs time-to-build; skill-gap-map surfaces the target skill |
| `training-operations` (grove — future) | Enrollment / scheduling once the Build program is designed | Downstream via training-program-design |
| `hiring-kit` (custom, hire) | Buy actions (opens the req, runs the 7-phase hiring loop) | Downstream — Buy routes here |
| `ats-selection` (custom, hire) | Platform / pipeline for the Buy action | Two-hop downstream via hiring-kit |
| `payroll-and-eor` (custom, hire) | Borrow actions — worker classification for the contractor (W-2 / 1099 / EOR) | Downstream — Borrow routes here |
| `workforce-planning` (custom, hire) | Bridge actions (redeployment + structural / headcount move) | Downstream — Bridge routes here |
| `motivation-map` (custom, maslow) | Phase-5 competence-need diagnosis → gap-map identifies the specific skill; then routes back for intervention design | Bidirectional (competence-need in; gap-map out) |
| `self-determination-theory` (custom, maslow) | SDT's competence-need is what a starved gap-map skill produces at team level | Upstream framing |
| `hire` (P&C Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, Charter senior); coordinates cost implications via `board` | Upstream principles |
| `board` (Governance — fiduciary-guard) | Cost approval for Build/Buy/Borrow/Bridge cost implications | Escalation |
| Future `merit` (P&C — Performance) | Individual perf-review evaluation is merit's scope; grove uses aggregate signals only | Aggregate boundary — no individual data crosses |
| Future `Shared OS: people-analytics-metrics` | Turnover / tenure / engagement data as supporting input to criticality weighting | Upstream data |
| Operator + employment/regulatory counsel | Regulatory-exposure gaps (compliance-specialist need in a regulated venture) | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate on every gap-map, ranking, action recommendation before shipping | Cross-cutting |

## References (public / verifiable)

- [How to Conduct a Skills Gap Analysis — Cornerstone OnDemand](https://www.cornerstoneondemand.com/resources/article/how-to-conduct-a-skills-gap-analysis/)
- [How to Conduct a Skills Gap Analysis — SHRM](https://www.shrm.org/topics-tools/news/hr-magazine/how-to-conduct-skills-gap-analysis)
- [Skills Gap Analysis: All You Need To Know — AIHR](https://www.aihr.com/blog/skills-gap-analysis/)
- [What Is Competency Mapping? — AIHR](https://www.aihr.com/blog/competency-mapping/)
- [Skills Matrix: Map Skills, Close Gaps & Plan Development — Workhuman](https://www.workhuman.com/blog/skills-matrix/)
- [Skills matrices in 2026 — muchskills](https://www.muchskills.com/blog/skills-matrix)
- [Using Skill Gap Assessments to Future-Proof Your Organization — McKinsey](https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-organization-blog/using-skill-gap-assessments-to-help-future-proof-your-organization)
- [How to Conduct a Skills Gap Analysis — Paylocity](https://www.paylocity.com/resources/learn/articles/skills-gap-analysis/)
