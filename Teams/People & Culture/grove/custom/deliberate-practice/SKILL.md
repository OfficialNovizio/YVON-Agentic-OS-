<!--
Custom skill — built from scratch, synthesized from named academic sources (see
`sources_referenced` frontmatter). Body follows §11 required structure + §14.2
exact-heading compiler contract.

Reclassification note (2026-07-31): the catalog listed this as "deliberate-practice
MARKETPLACE." §4.1 search across skillsmp.com / mcpmarket.com / awesomeskill.ai returned
skills at the wrong scope — `nate-jones-deliberate-practice-gym` is oriented to
individual-knowledge-worker practice (rubric-based drills), and `learning-opportunities`
is developer-specific coding-session drills. Neither matches grove's L&D-program-design
scope. Per §4.6 exception clause ("if it turned into a merge of multiple sources, it's
custom now"), a marketplace entry with no marketplace fit at the agent's scope is built
custom from cited academic sources. Same reclass path as maslow's `self-determination-theory`.

Route classification per §8.2: Route D (cited rubric — narrative theory with clear
anchors, no formula). Judgment flagged reasoning-based per §0.6 until a full
Shared OS/logical/deliberate_practice.md Route-D asset with page-cited chapters can be
built from the two-source minimum per §8.0 (Ericsson & Pool 2016 + Ericsson/Krampe/Tesch-Römer
1993 already qualify; sourcing planned in logical/book-requirements.md).

Provenance: no VYON-branded content; deliberate practice is a public academic framework.
No genericization strip needed. Macnamara et al. 2014 critique explicitly cited to prevent
overclaiming — the "identities are not idols" rule from §6.2a applied at the framework level.
-->
---
name: deliberate-practice
type: custom
status: built from scratch (reclassified from catalog's marketplace slot per §4.6 exception)
sources_referenced:
  - "Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The Role of Deliberate Practice in the Acquisition of Expert Performance. Psychological Review, 100(3), 363-406. Foundational paper."
  - "Ericsson, K. A. & Pool, R. (2016). Peak: Secrets from the New Science of Expertise. Houghton Mifflin Harcourt. Practitioner-accessible synthesis."
  - "Macnamara, B. N., Hambrick, D. Z., & Oswald, F. L. (2014). Deliberate Practice and Performance in Music, Games, Sports, Education, and Professions: A Meta-Analysis. Psychological Science, 25(8), 1608-1618. Critical meta-analysis — DP explains ~26% of skill variance across domains, less than Ericsson claimed."
  - "Hambrick, D. Z., Oswald, F. L., Altmann, E. M., Meinz, E. J., Gobet, F., & Campitelli, G. (2014). Deliberate Practice: Is That All It Takes to Become an Expert? Intelligence, 45, 34-45. Additional academic critique."
fulfills_catalog_entry: deliberate-practice (catalog listed as marketplace; reclassified per §4.6)
reclassification_notes:
  - "Catalog labeled MARKETPLACE. §4.1 search found no marketplace fit at grove's L&D-scope. Reclassified to custom per §4.6 exception."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "Macnamara critique explicitly named per §0.6 honesty — DP is a necessary framework, not a universal explanation."
assigned_agent: grove (People & Culture / Learning & Development)
portable: true
date_added: 2026-07-31
tier: 2
description: The Deliberate Practice framework for L&D program design — Ericsson's 5-condition model for how skill acquisition actually happens (specific goal + full attention + immediate feedback + comfort-zone-plus-one + repetition-with-refinement). Grounds grove's training-program-design's 70% on-the-job and 20% social/mentoring pieces at the mechanism level. Trigger on "deliberate practice", "how do people actually learn this", "why isn't the training working", "design a real practice loop", "Ericsson framework", or "component-skill decomposition".
triggers:
  - deliberate practice
  - how do people actually learn this
  - why isn't the training working
  - design a real practice loop
  - Ericsson framework
  - component-skill decomposition
  - feedback loop for skill development
  - comfort zone plus one
---

# Deliberate Practice

## Introduction

This skill packages K. Anders Ericsson's Deliberate Practice framework into a
mechanism-level grounding for grove's L&D-program-design work. Ericsson's 1993 paper with
Krampe and Tesch-Römer is one of the most-cited papers in the skill-acquisition
literature; his 2016 book *Peak* (co-authored with Robert Pool) is the practitioner-facing
synthesis. Deliberate practice describes *how* skill acquisition actually happens — as
distinct from process frameworks like ADDIE (which describes how to *design* training) and
Kirkpatrick (which describes how to *evaluate* training).

**Reclassified from the catalog's marketplace slot per §4.6.** §4.1 marketplace search
across the three approved sites found no clean fit at grove's L&D-program-design scope
(the mcpmarket `nate-jones-deliberate-practice-gym` skill applies DP to individual
knowledge-worker practice, not to org-level training design). Built custom from Ericsson's
academic corpus plus the Macnamara et al. 2014 meta-analysis critique — same reclass path
as maslow's `self-determination-theory` skill.

**Important honesty rule per §6.2a-style discipline applied at the framework level:**
this skill also cites the Macnamara et al. 2014 meta-analysis, which showed DP explains
roughly 26% of skill variance across domains — less than Ericsson's original strong claim
that DP is *the* explanation for expertise. DP is a necessary framework, not a universal
one. The Principles section carries this bound explicitly so grove does not overclaim.

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

## When to Use

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

## Structure / Protocol

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

## Instructions

### Phase 1 — Component-skill decomposition

Break the target skill from `skill-gap-map` or `training-program-design`'s Level-3
behavior specification into observable component-skills. Rule of thumb: each component
should be small enough that a single practice session can meaningfully target it (5–60
minutes of focused practice), and observable enough that someone else can tell whether
it happened.

**Example:** target skill = "leads customer-facing product demos effectively." Component
decomposition:
- Structuring a demo agenda from a customer's stated goal
- Handling a mid-demo pivot when the customer's stated goal shifts
- Fielding hostile / skeptical technical questions
- Reading engagement signal from the customer's questions
- Closing with a specific next-step ask

Each of the 5 components can be practiced in isolation. Trying to practice "product demo
effectiveness" as an undifferentiated whole produces experience but not skill growth.

### Phase 2 — Design the feedback loop per component

For each component-skill, specify:

- **Feedback source** — outcome (customer signed / didn't sign; test passed / failed);
  coach (senior demo person watches and gives structured feedback); peer (structured
  rubric applied by peer, per BARS-style anchors from hire's `interview-prep` if useful);
  self-review (recorded practice + structured self-critique against rubric).
- **Feedback latency target** — as short as possible. Feedback delayed by weeks (the
  quarterly-performance-review pattern) is orders of magnitude less useful for DP than
  same-session feedback.
- **Feedback structure** — what specifically to attend to. Free-form "how was that?"
  produces vague feedback; a component-specific rubric produces actionable feedback.

Design phase output: a feedback-loop specification per component-skill, ready to feed
into `training-program-design`'s 70% and 20% pieces.

### Phase 3 — Difficulty calibration ("comfort-zone-plus-one")

Set the practice difficulty at the edge of current mastery, not comfortably within it.
Common rule: the practitioner should be able to succeed at the practice attempt about
half the time. Higher success rate = practice is too easy, no growth; lower success rate
= practice is too hard, frustration and abandonment.

**Time-to-close estimation:** the classic Ericsson claim (10 years / 10,000 hours) has
been shown to vary dramatically by domain (Macnamara et al. 2014 — see Principles). Do
NOT use a "10,000 hours" quote as authority. Reasonable directional estimates come from
domain-specific research where it exists; where it doesn't, estimate cautiously and label
the estimate as directional. Never present a specific hour count as guaranteed.

### Phase 4 — Repetition and refinement schedule

Design the practice cadence — how often each component-skill is practiced, and how the
difficulty ratchets up as the practitioner's mastery grows. Rule of thumb: at least 3–5
attempts per component per week during active skill acquisition; less than that and the
skill decays between practices.

As the practitioner's mastery grows (approaches ~90% success rate on the practice-attempt
task), the difficulty steps up — a new context, a harder variation, a shorter time
constraint — to keep practice at comfort-zone-plus-one.

### Phase 5 — Route to program design

Output the DP-informed component decomposition + feedback loop specs + difficulty
calibration + repetition schedule as input to `training-program-design`'s 70% (on-the-job
practice) and 20% (mentoring / social) design steps.

Do NOT hand off just the framework; hand off the *specific* component list and feedback
loop specs for the target skill. The value of DP for L&D is in the operationalization,
not in the abstract principles.

## Output Format

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

## Principles

1. **The 5 conditions are non-negotiable.** Missing any one means the practice is not
   deliberate. If a proposed practice regimen lacks a specific goal per session, or
   immediate feedback, or comfort-zone-plus-one difficulty, name it and adjust — don't
   ship the design and hope. (Ericsson, Krampe, & Tesch-Römer 1993; Ericsson & Pool 2016.)

2. **DP is necessary, not sufficient.** Macnamara, Hambrick, & Oswald (2014) meta-analysis
   showed DP explains ~26% of skill variance across domains — a substantial contribution
   but far from Ericsson's original strong claim. Talent, task-domain fit, starting age,
   working memory capacity, and prior related experience also matter. Grove does NOT
   present DP as the universal explanation of expertise; it presents DP as the largest
   *controllable* factor in workplace skill acquisition, with the acknowledgment that other
   uncontrollable factors matter too.

3. **"10,000 hours" is not a formula.** Ericsson's own later work stepped back from the
   headline number, and Macnamara's meta-analysis showed enormous domain variance.
   Time-to-mastery estimates are directional and domain-dependent — never quote a specific
   hour count as authority.

4. **Feedback latency is load-bearing.** The biggest failure mode in workplace DP design
   is delayed feedback (quarterly performance review → weeks-late feedback → no meaningful
   improvement). Immediate feedback (same session, ideally same attempt) is what makes DP
   work in practice.

5. **Component-skill decomposition, not skill-as-monolith.** Practicing "leadership" or
   "communication" as an undifferentiated whole produces experience without skill growth.
   Component decomposition is where DP gets real — resist requests for "just practice
   [big vague skill] more."

6. **Applies at team/cohort level in grove's scope.** Individual practice regimens are
   out of scope; grove designs training programs and stretch assignments at team level,
   using DP as the underlying mechanism. Individual coaching routes to the accountable
   manager or an external coach.

7. **§0.6 flag.** DP framework is well-established but the specific applications
   (component-count guidance 3-7; practice-frequency 3-5x/week; ~50% success-rate target
   for comfort-zone-plus-one) are Tier B (canonical published framework, cited but not
   page-cited from a source in `Agents/_books/`). Downgrade to Tier A when Ericsson & Pool
   2016 and Ericsson/Krampe/Tesch-Römer 1993 are placed and a `Shared OS/logical/deliberate_practice.md`
   Route-D asset with page citations is built per §8.9.

## Fallback

- **Request to "make it a deliberate practice program" without specifying the target
  skill.** DP is not a program type — it's a mechanism applied to a specific skill.
  Push back and ask what the target skill is, then decompose it. Applying DP to an
  undefined target is process theatre.
- **Request for individual-coaching-plan DP application.** Decline — grove's scope is
  team/cohort L&D program design, not individual coaching. Route to the accountable
  manager or an external coach.
- **Domain the framework doesn't cleanly apply to** (creative/generative work where
  "success" is subjective; roles where feedback is inherently delayed by months). Name the
  domain limitation and adapt the framework — component decomposition still works;
  feedback-loop design shifts toward peer-rubric or self-review with structured checklist
  rather than outcome-based feedback.
- **Overclaim risk** ("just apply DP and anyone becomes an expert"). Name Macnamara
  2014 explicitly per Principle 2 — DP is necessary but not sufficient. Under-selling
  the framework's power AND naming its bounds is more useful than either extreme.
- **Time-to-mastery estimate demanded as a specific number.** Refuse to quote 10,000
  hours or any specific hour count as authoritative per Principle 3. Provide domain-adjusted
  directional estimates with explicit uncertainty.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `training-program-design` (custom, grove — when built) | Mechanism-level grounding for the 70% and 20% pieces of a training program | Downstream — DP provides the practice-loop design; training-program-design runs ADDIE around it |
| `skill-gap-map` (custom, grove — when built) | Time-to-close estimates for identified gaps (with domain-adjusted uncertainty per Principle 3) | Bidirectional — skill-gap-map identifies which skill needs closing; DP estimates how long |
| `training-operations` (custom, grove — when built) | Enrollment / scheduling of the repetition-schedule practice sessions | Downstream — DP designs the schedule; training-ops runs the logistics |
| `self-determination-theory` (custom, maslow — sibling) | Competence-need satisfaction — DP designs practice that produces visible mastery growth, which satisfies SDT's competence need per Ryan & Deci 2000 | Upstream framing — when maslow's motivation-map diagnoses competence starvation, DP is the mechanism-level response |
| `motivation-map` (custom, maslow) | Phase-5 competence-intervention route → DP-informed L&D response | Downstream from motivation-map's Phase 5 |
| `hire` (P&C Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, Charter senior); `workforce-planning` when the training request is actually a structural problem | Upstream principles; cross-cutting for structural |
| Future `merit` (P&C — Performance) | Individual perf data (out of grove's scope) is merit's; grove's DP-informed programs may produce team-level competence signals that inform perf-cycle decisions | Downstream (aggregate signals only; no individual data crosses) |
| `Shared OS: verification-before-completion` | Evidence gate on every DP-informed design before shipping | Cross-cutting |

## References (public / verifiable)

- [Ericsson, Krampe, & Tesch-Römer (1993) — The Role of Deliberate Practice in the Acquisition of Expert Performance — NCBI PMC mirror](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6731745/) (revisited via later research)
- [Deliberate Practice as a Theoretical Framework for Interprofessional Experiential Education — NCBI PMC (free)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4935723/)
- [Is the Deliberate Practice View Defensible? — NCBI PMC (Macnamara-adjacent, free)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7461852/)
- [Peak by K. Anders Ericsson and Robert Pool — Work-Learning Research review / summary](https://www.worklearning.com/2025/05/27/book-peak-by-k-anders-ericsson-and-robert-pool/)
- [The Problems with Deliberate Practice — Commoncog (nuanced critique)](https://commoncog.com/the-problems-with-deliberate-practice/)
- [Pearls on Educational Principles: Deliberate Practice — UCSF Med Ed (free PDF)](https://meded.ucsf.edu/sites/meded.ucsf.edu/files/inline-files/pearls-deliberate-practice.pdf)
