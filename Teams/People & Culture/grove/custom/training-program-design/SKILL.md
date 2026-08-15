<!--
Custom skill — adopted from the Anthropic training-program-design plugin, then
genericized per §0.4b and retargeted to real YVON agents. Source plugin's SKILL.md
already-attributes this skill to "maslow (People & Culture / CHRO agent)"; reassigned
to grove (P&C / Learning & Development) per YVON's actual roster.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/training-program-design/SKILL.md
Note on the Python script: source SKILL.md references scripts/training_program.py but that
file was NOT included in the packaged plugin. Per §0.5 the script is
IMPLEMENTED-FROM-DESCRIPTION here — the source describes completion-rate calculation, ROI
estimator, 70-20-10 hour-allocation check, and Kirkpatrick evaluation-timing helper.

Genericization strip (§0.4b):
- name: training-program-design (no prefix to strip; already generic)
- assigned_agent: maslow (CHRO) → grove (P&C / L&D)
- VYON references stripped
- "Skills Gap Analysis" (VYON skill name) → grove's own `skill-gap-map`
- "Career Pathing & Succession Planning" → future merit skill
- "HR Strategy Alignment" → future merit skill
- "People Analytics & Metrics" → future Shared OS: people-analytics-metrics
- "felix (Finance)" → board (fiduciary-guard); note future Finance agent
- Example agents "raj", "dev" → generic role descriptions

All 7 public-source citations from source (Whatfix, Docebo, Kirkpatrick Partners,
Mindtools, HRDQ, Devlin Peck) preserved verbatim.
-->
---
name: training-program-design
type: custom
status: adopted from marketplace source (Anthropic training-program-design plugin), genericized, reassigned from maslow to grove
sources_referenced:
  - "Anthropic knowledge-work-plugins — training-program-design plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/training_program.py not included in package."
  - "Whatfix — ADDIE Model: 5 Stages of Instructional Design; 8 Effective Instructional Design Models in 2026."
  - "Docebo — ADDIE Model: Guide to Effective Instructional Design."
  - "Kirkpatrick Partners — What is The Kirkpatrick Model? (four-levels + required drivers, New World Kirkpatrick)."
  - "Mindtools — Kirkpatrick's Model."
  - "HRDQ — How to Use Kirkpatrick's Four Levels of Training Evaluation Model (timing + short-survey guidance)."
  - "Devlin Peck — The Kirkpatrick Model: Four Levels of Training Evaluation."
fulfills_catalog_entry: n/a (part of grove's expanded roster beyond catalog's 2-skill floor per §2)
genericization_notes:
  - "Source-plugin author assignment maslow (CHRO) → grove (P&C / L&D) — reassignment to correct YVON owner."
  - "VYON / Skills Gap Analysis / Career Pathing / HR Strategy Alignment / People Analytics / felix / comply — stripped or retargeted."
assigned_agent: grove (People & Culture / Learning & Development)
portable: true
date_added: 2026-07-31
tier: 3
description: Design and evaluate training programs backward from the business result they need to produce, combining ADDIE (design process), 70-20-10 (learning mix), and Kirkpatrick 4-levels + required drivers (evaluation). Execution layer for Build recommendations from skill-gap-map and for succession-plan development actions from future merit. Trigger on "design a training program for [gap]", "training program for [role]", "ADDIE", "Kirkpatrick evaluation", "70-20-10 design", or "did that training program work".
triggers:
  - design a training program for
  - training program for
  - ADDIE
  - Kirkpatrick evaluation
  - 70-20-10 design
  - did that training program work
  - evaluate training effectiveness
  - build a development plan
---

# Training Program Design

## Introduction

This skill gives grove a way to design training that's built backward from a business
result, not forward from "let's build a course." It combines three established frameworks
into one working method:

- **ADDIE** — the design process (Analysis / Design / Development / Implementation / Evaluation).
- **70-20-10** — the mix of learning experiences (on-the-job / social+mentoring / formal instruction).
- **Kirkpatrick's four levels + required drivers** — how to evaluate whether the program worked.

It is the execution layer for Build recommendations coming out of `skill-gap-map` and
development plans coming out of future `merit`'s succession-planning skill. The
mechanism-level grounding for the 70% and 20% pieces comes from grove's own
`deliberate-practice` skill — training-program-design runs the process, deliberate-practice
provides the mechanism.

Adopted from Anthropic's `training-program-design` plugin, reassigned from maslow to
grove (the actual YVON owner of L&D), genericized per §0.4b.

## Purpose

Prevents two persistent failure modes in workplace training:

1. **Over-invest in the 10%, under-invest in the 90%.** Training is easy to over-invest
   in as "the course" (10% formal instruction) and skip the other 90% (on-the-job
   practice, mentoring/social support). Programs that ship as "just a course" rarely
   produce the Level-3 behavior change or Level-4 business result they were supposed to.
2. **Declare success on Level-1 alone.** It's easy to declare a program successful
   because people liked it (Level 1: Reaction) without checking whether behavior or
   business results actually changed (Levels 3 and 4). This skill designs and evaluates
   training by whether it closed the gap it was built for.

grove uses this skill as the design + evaluation layer whenever `skill-gap-map` routes a
gap to Build, whenever `motivation-map` Phase-5 routes to competence-need intervention,
or whenever future `merit` routes a succession-plan action.

## When to Use

Trigger on:

- "Design a training program to close [gap]" (Build action from `skill-gap-map`)
- "Training program for [role / competency]"
- "Build a development plan / stretch assignment structure for [succession candidate]"
  (from future `merit`)
- "Design an evaluation plan for [existing or planned training program]"
- "Did [training program] actually work?" / "evaluate training effectiveness"
- "ADDIE" / "70-20-10 design" / "Kirkpatrick evaluation"
- Push back on a training request that's really a "required drivers" problem in disguise
  (management support, systems, accountability — see § Fallback rule 4)

Do NOT use for:

- **Individual coaching or personal practice regimen** → out of scope; grove works at
  team/cohort level. Individual coaching routes to the accountable manager.
- **One-off content requests** ("write me a slide", "draft this email template") → this
  skill is for the program design and evaluation layer, not content production.
- **LMS enrollment / compliance record-keeping / certification expiry tracking** →
  `training-operations` (grove — next skill after this).
- **Skill acquisition mechanism-level design** (how does practice actually produce mastery)
  → `deliberate-practice` (grove — already shipped); training-program-design uses DP as
  input.

## Core Concepts

### ADDIE — the Design Process

Five iterative phases:

1. **Analysis** — confirm the gap, audience, and constraints. Usually sourced from
   `skill-gap-map`'s output (which gap, what priority, which cohort).
2. **Design** — learning objectives and evaluation plan, built **backward from the target
   business result** (see Kirkpatrick backward-design below).
3. **Development** — build the actual materials/experiences (courses, mentoring pairings,
   stretch-assignment definitions).
4. **Implementation** — roll out.
5. **Evaluation** — Kirkpatrick's four levels (Reaction / Learning / Behavior / Results),
   on the right timing per below.

Iterative, not strictly linear — evaluation findings should loop back into analysis for
the next cycle. (Whatfix; Docebo)

### 70-20-10 — the Learning Mix

- **70%** on-the-job experience (stretch assignments, real work with real stakes).
- **20%** social/mentoring learning (pairing with an experienced peer, structured feedback
  conversations, communities of practice).
- **10%** formal instruction (courses, workshops, e-learning modules).

Most training requests default to designing the 10% (a course) and skip the 70% and 20%
entirely. This skill pushes back on that by default — the 70% and 20% get designed
deliberately, using grove's `deliberate-practice` skill for the mechanism-level design
(component-skill decomposition, feedback loops, comfort-zone-plus-one difficulty).

The 70-20-10 percentages themselves are heuristic per §0.6 — the specific ratio varies by
skill type. Treat as directional, not rigid. (Whatfix)

### Kirkpatrick's Four Levels — Designed Backward

Traditional Kirkpatrick numbering:

1. **Reaction** (Level 1) — did participants like it? Immediately post-training via short
   survey.
2. **Learning** (Level 2) — did participants gain the intended knowledge/skill? Immediately
   post-training via assessment.
3. **Behavior** (Level 3) — are participants doing it differently on the job? Measured
   3–6 months post-training minimum.
4. **Results** (Level 4) — did the business metric move? Measured 3–6+ months post-training
   at earliest.

**Design starts at Level 4 and works backward** — Results (Level 4) is the goal; Behavior
(Level 3) is what people must do to produce it; Learning (Level 2) is what they need to
know to do it; Reaction (Level 1) is whether the experience was engaging enough to make
Learning happen. Never design forward from Level 1 — that produces programs that people
enjoy but don't change behavior. (Kirkpatrick Partners; Mindtools; HRDQ)

### New World Kirkpatrick — Required Drivers

The 2010s Kirkpatrick update introduced **required drivers**: the management support,
workplace systems, and accountability structures that reinforce the new behavior after
training ends. Training without required drivers in place rarely produces lasting Level 3
or 4 change — the person returns to a workplace that doesn't reward the new behavior,
and reverts. **This is a management/systems gap, not a training-content gap.** grove
flags missing required drivers before building the program per § Fallback rule 4.

### Timing Matters

- **Measure Reaction and Learning immediately** — same day / within a week.
- **Wait at least 3 months, ideally 3–6 months, before measuring Behavior or Results.**
  Measuring sooner produces unreliable data because people haven't had time to integrate
  the new behavior into their work rhythm.

Applied by `scripts/training_program.py`'s `kirkpatrick_timing_ok()` function which flags
early Behavior/Results measurement attempts. (HRDQ)

### Short Evaluation Surveys

3-question surveys consistently outperform long, sprawling ones:

- One **scaled self-rating** ("On a 1–5 scale, how likely are you to apply what you learned
  in the next month?").
- One **yes/no behavioral check** ("In the last 4 weeks, did you use [specific behavior]
  from the training?").
- One **open-ended** ("What one thing from the training would you want more of?").

Long surveys (30+ questions) produce worse data, not better — response rates drop and
attention fatigues. (HRDQ)

## Instructions

Follow this sequence when designing or evaluating a training program:

### Phase 1 — Start at Level 4

Confirm the specific business result this program needs to produce. Pull from:

- `skill-gap-map` — the priority_score gap's criticality directly names the business
  driver.
- Future `merit` — the hr-strategy-alignment scorecard's mapped objective.
- Future `motivation-map` — Phase-5 competence-need intervention's stated outcome.

Do NOT design a program without a Level-4 business result. Per Fallback rule 1.

### Phase 2 — Work backward through Levels 3, 2, 1

For the Level-4 result, specify:

- **Level 3 behavior:** what should people do differently on the job to produce that result?
- **Level 2 learning:** what do they need to know / be able to do to exhibit that behavior?
- **Level 1 reaction:** what experience will engage them enough to make Learning happen
  and stick?

This is the backward-design pass. Its output feeds Phase 3.

### Phase 3 — Design across 70-20-10 deliberately

Specify the three components:

- **70% on-the-job practice / stretch assignment** — the real work with real stakes that
  produces the Level-3 behavior. Design this using grove's `deliberate-practice` skill
  for component-skill decomposition + feedback loops + comfort-zone-plus-one difficulty +
  repetition schedule.
- **20% mentoring / social component** — structured pairing with an experienced person
  (Level 4-5 in the target skill), community of practice, structured feedback
  conversations. Also uses `deliberate-practice`'s feedback-loop specification.
- **10% formal instruction** — the course / workshop / e-learning module. Do NOT let
  the 10% become the whole program.

If the requester's proposal is only the 10%, push back per Fallback rule 5.

### Phase 4 — Confirm required drivers exist

Before building anything, check whether:

- **Management support** — will the person's manager time-allocate for practice, feedback,
  and application?
- **Workplace system reinforcement** — does the org's actual work reward the new
  behavior, or punish it (e.g., speed metrics that discourage the slower "correct" way)?
- **Accountability structure** — is there a mechanism to notice whether the person is
  applying the new behavior?

If any of the three are missing, flag it per Fallback rule 4 BEFORE building the program
— the training itself won't produce the result without them. This is a management/systems
gap, not a training-content gap.

### Phase 5 — Build via ADDIE

- **Analysis:** confirm scope, audience, prerequisite check. Sourced from Phase 1.
- **Design:** learning objectives + evaluation plan (from Phase 2's backward design).
- **Development:** produce the actual materials — stretch-assignment definitions,
  mentoring pairings, formal-instruction content.
- **Implementation:** roll out. Communicate the "why" (the Level-4 result) as prominently
  as the "how."
- **Evaluation:** Kirkpatrick 4-levels on the right timing (Phase 6).

### Phase 6 — Evaluate on the right timeline

Use `scripts/training_program.py`'s `kirkpatrick_timing_ok()`:

- **Reaction/Learning:** immediately post-training via a **3-question survey**.
- **Behavior/Results:** **not before 3 months post-training**, ideally within the 3–6 month
  window. Attempts to measure earlier get flagged as unreliable per Fallback rule 2.

### Phase 7 — Track completion rate and simple ROI

Use `scripts/training_program.py`'s `completion_rate()` and `roi_estimate()` (where a
business-value estimate exists — often ROI is directional only).

### Phase 8 — Feed results back

- Whether the original skill gap closed → back to `skill-gap-map` for the next cycle's
  re-scoring.
- Business-result impact → future `Shared OS: people-analytics-metrics` (for tracking)
  and future `merit`'s hr-strategy-alignment scorecard (for the mapped objective).

## Python Utility

`scripts/training_program.py` provides:

- `completion_rate(completions, enrolled)` — completions ÷ enrolled.
- `roi_estimate(business_value, program_cost)` — (value − cost) ÷ cost (directional only).
- `allocation_check_70_20_10(hours_on_job, hours_social, hours_formal)` — reports the
  actual percentage split vs the target 70/20/10; flags if formal > 20% or on-the-job
  < 50% (which usually means the 70-20-10 was violated).
- `kirkpatrick_timing_ok(months_since_training, level_being_measured)` — returns
  (bool, reason). False + "too early" for Behavior/Results measured before 3 months.

IMPLEMENTED-FROM-DESCRIPTION per §0.5. Self-tests included; run
`python3 training_program.py --test`.

NOT a Shared OS/logical/ script yet (§8.0 two-book minimum unmet). Candidate second
sources for graduation: Kirkpatrick, D. L. & Kirkpatrick, J. D. (2016) *Kirkpatrick's Four
Levels of Training Evaluation* + a Whatfix/Docebo-adjacent institutional book on ADDIE.

## Output Format

Each invocation produces one or more of:

- **Program design memo** — Level-4 result → Levels 3-2-1 backward design → 70-20-10
  component design → required-drivers check → ADDIE build plan.
- **Evaluation plan** — 3-question survey wording for Reaction/Learning; Behavior/Results
  measurement design + timing.
- **70-20-10 allocation check** — actual hours per component vs target percentages, with
  flags where the allocation is unbalanced.
- **Kirkpatrick 4-levels evaluation report** — per-level findings, timing validation, and
  gap-closure recommendation for the next cycle.
- **Required-drivers gap flag** — when Phase 4 finds missing drivers; routed to the
  accountable manager, not treated as a training-content problem.

## Principles

1. **Design backward from the business result (Level 4).** Never start with "let's build a
   course." Per Kirkpatrick's backward-design rule.
2. **Default to a real 70-20-10 mix.** Don't let formal instruction be the whole program.
   Push back on 10%-only proposals per Fallback rule 5.
3. **Keep evaluation surveys short.** 3 questions at every checkpoint. Long surveys
   produce worse data per HRDQ research.
4. **Never evaluate Behavior or Results before the 3-month mark.** Early data is
   unreliable, not just imprecise. Flag attempts per Fallback rule 2.
5. **Flag missing required drivers explicitly.** Training can't fix a management/systems
   gap on its own. Per Fallback rule 4.
6. **Aggregate/team level.** grove's scope is team/cohort L&D. Individual coaching is out
   of scope; individual performance evaluation is future `merit`.
7. **Time-to-close estimates are directional.** Per `deliberate-practice` Principle 3 —
   no specific hour count as authority.
8. **§0.6 flag.** ADDIE / 70-20-10 / Kirkpatrick + specific thresholds (3-month behavior
   timing, 3-question survey guidance, ~70/20/10 mix) are Tier B (canonical published
   frameworks cited but not book-cited from `Agents/_books/`). Downgrade to Tier A when
   Kirkpatrick 2016 + Whatfix/Docebo-adjacent institutional book are placed and a
   `Shared OS/logical/training_program.py` version is built per §8.9.

## Fallback

- **No clear Level 4 business result defined.** Don't build the program yet. Go back to
  `skill-gap-map` or future `merit`'s hr-strategy-alignment to establish one first. Per §0.5.
- **Request to evaluate Behavior/Results immediately after training.** Flag as unreliable
  data per Principle 4. Recommend the 3–6 month window; offer Reaction/Learning
  immediately as an interim check.
- **Request for a long, comprehensive feedback survey.** Push back toward the 3-question
  design. A 40-question survey usually produces worse data, not better.
- **Training requested where required drivers are clearly missing.** Say so BEFORE
  building the program. Recommend addressing the driver gap alongside or before the
  training itself — flag to the accountable manager.
- **Request skewed entirely toward formal instruction** (a course with no on-the-job or
  social component). Push back toward a real 70-20-10 design; the course-only pattern is
  the specific failure mode this skill exists to prevent.
- **Individual-coaching request.** Decline — grove's scope is team/cohort L&D. Route to
  the accountable manager or an external coach.
- **ROI requested as a hard number.** Provide the ROI estimate as directional only, with
  business-value assumptions explicit. Do NOT quote a specific ROI ratio as authoritative.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `skill-gap-map` (custom, grove) | Build actions — the specific gap and its priority_score / criticality | Upstream — skill-gap-map identifies which gap; training-program-design designs the closer |
| `deliberate-practice` (custom, grove) | Mechanism-level design for the 70% and 20% pieces (component decomposition + feedback loops + difficulty + repetition schedule) | Upstream (framing) + downstream (implementation) — DP is called during Phase 3 design |
| `training-operations` (grove — next skill) | Enrollment / scheduling / compliance record-keeping for programs designed here | Downstream — training-program-design produces the program; training-operations runs the logistics |
| `motivation-map` (custom, maslow) | Phase-5 competence-need intervention route → training program design | Downstream from motivation-map's Phase 5 |
| `self-determination-theory` (custom, maslow) | Competence-need satisfaction framing — DP-informed programs designed here satisfy SDT competence per Ryan & Deci 2000 | Upstream framing |
| `hire` (P&C Lead) | Universal principle inheritance; ROI / budget escalation via `board` (fiduciary-guard) | Upstream principles; cross-cutting |
| `hiring-kit` (custom, hire) | When a Build action's required drivers check reveals the skill really needs a new hire (Buy) not training | Redirect out — occasionally training-program-design surfaces that the "training" request is actually a hiring request |
| `workforce-planning` (custom, hire) | When required-drivers check reveals structural cause (span, missing layer) — that fix precedes any training | Escalation upstream |
| Future `merit` (P&C — Performance) | Succession-plan development actions; hr-strategy-alignment scorecard for Level 4 tracking | Downstream (development plans) + upstream (mapped objectives) |
| Future `Shared OS: people-analytics-metrics` | Level-4 business-result tracking (turnover, engagement, productivity metrics) | Downstream for measurement |
| `board` (Governance — fiduciary-guard) | Training budget approval; cost inputs to ROI estimates | Escalation for spend approval (placeholder until Finance agent exists) |
| Accountable manager | Required-drivers gaps (Phase 4 findings); individual coaching requests | Escalation — grove flags, manager owns the decision |
| Operator + employment counsel | Training with regulatory/compliance exposure (e.g., mandatory harassment training with specific legal-completion requirements) | Escalation — grove designs the content-side; counsel confirms the legal-completeness side |
| `Shared OS: verification-before-completion` | Evidence gate on every program design, evaluation plan, and results report | Cross-cutting |

## References (public / verifiable)

- [ADDIE Model: 5 Stages of Instructional Design — Whatfix](https://whatfix.com/blog/addie-model-instructional-design/)
- [8 Effective Instructional Design Models in 2026 — Whatfix](https://whatfix.com/blog/instructional-design-models/)
- [ADDIE Model: Guide to Effective Instructional Design — Docebo](https://www.docebo.com/learning-network/blog/addie-model/)
- [What is The Kirkpatrick Model? — Kirkpatrick Partners](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/)
- [Kirkpatrick's Model — Mindtools](https://www.mindtools.com/ak1yhhs/kirkpatricks-four-level-training-evaluation-model/)
- [How to Use Kirkpatrick's Four Levels of Training Evaluation Model — HRDQ](https://hrdqstore.com/blogs/hrdq-blog/how-to-use-kirkpatrick-s-four-levels-of-training-evaluation-model)
- [The Kirkpatrick Model: Four Levels of Training Evaluation — Devlin Peck](https://www.devlinpeck.com/content/kirkpatrick-model-evaluation)
