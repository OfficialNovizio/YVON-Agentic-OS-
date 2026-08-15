<!--
Custom skill — built from scratch, synthesized from three named academic sources (see
`sources_referenced` frontmatter). Body follows §11 required structure + §14.2 exact-heading
compiler contract.

Reclassification note (2026-07-29): the catalog listed this as "self-determination-theory
MARKETPLACE." §4.1 search across skillsmp.com / mcpmarket.com / awesomeskill.ai returned no
skill matching the SDT purpose (autonomy/competence/relatedness workplace-motivation
diagnostic). Per §4.6 exception clause ("if it turned into a merge of multiple sources,
it's custom now"), a marketplace entry with no marketplace fit is built custom from cited
academic sources. Recorded here in comment block for provenance.

Route classification per §8.2: Route D (cited rubric — narrative theory with clear anchors,
no formula). Judgment flagged reasoning-based per §0.6 until a full Shared OS/logical/
Route-D asset with page-cited chapters can be built from the two-source minimum per §8.0
(Ryan & Deci 2000 + Deci Olafsen Ryan 2017 already qualify; sourcing planned in
logical/book-requirements.md).

Provenance: no VYON-branded content; SDT is a public academic framework. No genericization
strip needed.
-->
---
name: self-determination-theory
type: custom
status: built from scratch (reclassified from catalog's marketplace slot per §4.6 exception)
sources_referenced:
  - "Ryan, R. M. & Deci, E. L. (2000). Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being. American Psychologist, 55(1), 68-78."
  - "Deci, E. L., Olafsen, A. H., & Ryan, R. M. (2017). Self-Determination Theory in Work Organizations: The State of a Science. Annual Review of Organizational Psychology and Organizational Behavior, 4, 19-43. FREE at Corporate Research Forum."
  - "Gagné, M. & Deci, E. L. (2005). Self-Determination Theory and Work Motivation. Journal of Organizational Behavior, 26, 331-362. FREE at selfdeterminationtheory.org."
  - "selfdeterminationtheory.org — official website maintained by Richard Ryan and Edward Deci. Institutional source per §8.8."
fulfills_catalog_entry: self-determination-theory (catalog listed as marketplace; reclassified per §4.6)
reclassification_notes:
  - "Catalog labeled this MARKETPLACE. §4.1 search found no marketplace fit. Reclassified to custom per §4.6 exception."
  - "Route D per §8.2 — cited rubric, no formula, no script."
assigned_agent: maslow (People & Culture / Motivation)
portable: true
date_added: 2026-07-29
tier: 2
description: The Self-Determination Theory diagnostic and intervention framework for workplace motivation. Applies Deci & Ryan's three-need model (autonomy, competence, relatedness) plus the autonomous-vs-controlled motivation continuum to diagnose which need is starved and design a matched intervention. Trigger on "motivation theory", "diagnose motivation", "autonomy competence relatedness", "intrinsic vs extrinsic motivation", "why is this team demotivated", or "which SDT need is starved here".
triggers:
  - motivation theory
  - diagnose motivation
  - autonomy competence relatedness
  - three psychological needs
  - intrinsic vs extrinsic motivation
  - why is this team demotivated
  - which SDT need is starved
  - autonomous vs controlled motivation
---

# Self-Determination Theory

## Introduction

This skill packages Deci & Ryan's Self-Determination Theory (SDT) — a widely-cited framework
in workplace-motivation research — into a diagnostic-plus-intervention tool for maslow.
It is the theoretical backbone the department's other motivation-adjacent work runs on:
`motivation-map` uses SDT's three needs as its diagnostic axes; `wellbeing-monitoring`
interprets burnout signals through SDT's need-frustration lens; `recognition-program`
design decisions turn on which of the three needs a program is trying to satisfy.

SDT was developed by Edward Deci and Richard Ryan starting in the 1980s (originally
published in *Intrinsic Motivation and Self-Determination in Human Behavior*, 1985) and
has been extended over four decades. Its workplace application is documented in Gagné &
Deci (2005) and updated comprehensively in Deci, Olafsen, & Ryan (2017). This skill uses
those three papers as its primary sources — all three are peer-reviewed academic
publications by named authors with verifiable credentials per §8.8.

## Purpose

Diagnoses the *type* of motivation problem before proposing a fix. SDT distinguishes
motivation problems into two categories that require different responses:

1. **Need-frustration problems** — one or more of the three basic psychological needs
   (autonomy, competence, relatedness) is being starved by the work context. The response
   is to change the context, not to add incentives.
2. **Motivation-regulation-type problems** — the person's motivation is "controlled"
   (external rewards, guilt, ego-driven) rather than "autonomous" (interest, personal
   value, self-endorsement). Controlled motivation predicts short-term compliance but
   long-term disengagement. The response is to shift the regulation type, which usually
   means shifting how the work is presented and rationalized — not adding a bonus.

Without this diagnostic, maslow (and any of the maslow-adjacent skills) risks the classic
motivation-fix failure: adding a reward to a need-frustration problem. That fix
consistently backfires — external rewards for work that people already found interesting
have been shown in SDT research to *reduce* intrinsic motivation (the "overjustification
effect").

## When to Use

Trigger on:

- "Motivation theory" / "motivation framework" / "which framework applies here"
- "Diagnose motivation" / "why is this team demotivated" / "what's really going on with engagement"
- "Autonomy" / "competence" / "relatedness" in a workplace-motivation context
- "Intrinsic vs extrinsic motivation" / "autonomous vs controlled motivation"
- "Which SDT need is starved here"
- "Should we add a bonus?" (SDT lens: usually the wrong question — diagnose first)
- Handoff from `motivation-map` when it needs the theoretical grounding
- Handoff from `recognition-program` when a program's category design needs an SDT-need target
- Handoff from `wellbeing-monitoring` when a burnout pattern points to need-frustration

Do NOT use for:

- Individual-level mental-health assessment → aggregate-only rule; individual crisis signals
  escalate immediately per `wellbeing-monitoring` § Fallback.
- Compensation banding decisions → future `comp-benchmarking` skill (SDT informs how comp
  is *framed and delivered*, not the band itself).
- Performance-management calibration → `merit` (Performance Mgmt, when built).

## Structure / Protocol

The SDT diagnostic is a 2-axis analysis:

```
AXIS 1: Which of the 3 basic needs is starved?

  Autonomy      = the experience of volition, choice, and psychological freedom
                  (the sense that one's actions are self-endorsed, not coerced)
  Competence    = the experience of mastery and effectiveness in one's activity
                  (opportunities to develop skill; feedback that shows progress)
  Relatedness   = the sense of connection and belonging with others
                  (caring, supportive interpersonal environment)

AXIS 2: Where does the person's motivation sit on the regulation continuum?

  Autonomous ────────────────────────────────── Controlled
  ┌────────────────────────┬──────────────────┬─────────────┬────────────────┐
  │ Intrinsic motivation   │ Identified reg.  │ Introjected │ External reg.  │
  │ (interest, enjoyment)  │ (personal value) │ (guilt/ego) │ (reward/punish)│
  └────────────────────────┴──────────────────┴─────────────┴────────────────┘

The diagnostic combines both axes: WHICH need is starved AND WHERE the person's
current motivation type sits. Different combinations require different interventions.
```

Then the intervention: change the work context to satisfy the starved need, and/or
shift the framing to move motivation toward the autonomous end of the continuum.

## Instructions

### Phase 1 — Diagnose which basic need is starved

Ask (or ensure the calling skill has surfaced) the following signals at aggregate/team level:

**Autonomy signals** (starved when these are true):
- Team members describe the work as "have-to" rather than "want-to."
- Micromanagement patterns (approval theater, mandatory-form culture, tight monitoring).
- Choice about *how* the work gets done has been removed (rigid processes, no discretion).
- Rationale for tasks is command-based ("because I said so") rather than value-based
  ("here's why this matters").

**Competence signals** (starved when these are true):
- Team members can't tell whether they're improving; feedback is absent, delayed, or
  ambiguous.
- Work is either too easy (no challenge, no growth) or too hard (constant failure without
  scaffolding).
- Learning opportunities have been cut ("we're too busy for that right now").
- Skill investments aren't visible or valued.

**Relatedness signals** (starved when these are true):
- Team-level connection has degraded (remote-only with no relational scaffolding; a manager
  change; a reorg that broke a functional team).
- Recognition is generic or absent; nobody feels seen.
- Interpersonal safety has been damaged (a public reprimand, a peer conflict, a layoff
  that felt arbitrary).
- The "why we're doing this" narrative has faded; people don't feel part of a shared thing.

One team can have multiple starved needs. Rank the top 1–2 for intervention design.

### Phase 2 — Diagnose where motivation currently sits on the continuum

Types of motivation regulation, from most autonomous to most controlled:

1. **Intrinsic motivation** — the activity itself is the reward (interesting, enjoyable).
2. **Identified regulation** — the activity's *value* is personally endorsed even if the
   activity itself isn't fun. ("I'm doing this because I believe it matters.")
3. **Introjected regulation** — the activity is done to avoid guilt or protect ego.
   ("I'd feel bad if I didn't." "I need to prove I can.")
4. **External regulation** — the activity is done for reward or to avoid punishment.
   ("I'll get a bonus." "I'll be fired if I don't.")

Autonomous motivation (types 1 + 2) predicts long-term engagement, creativity, and
psychological wellbeing. Controlled motivation (types 3 + 4) predicts short-term compliance
but disengagement, burnout, and turnover over time (Gagné & Deci 2005; Deci, Olafsen, &
Ryan 2017).

### Phase 3 — Design the intervention

Match the intervention to the diagnostic. Combinations produce different fits:

| Starved need | Current motivation type | Intervention direction |
|---|---|---|
| Autonomy | Controlled | **Restore choice about *how* the work gets done.** Provide a rationale for tasks (identified regulation). Reduce mandatory-form and approval-theater layers where possible. Cross-reference `hire`'s Identity Mental Model 1 — adult presumption. |
| Autonomy | Already autonomous | Protect it. Watch for creeping micromanagement, especially after a growth event or a reorg. |
| Competence | Controlled | **Add scaffolding + timely feedback.** Route to `grove` (when built) for training-program design. Make progress visible. Adjust difficulty so it stretches without breaking. |
| Competence | Already autonomous | Provide advancement pathways so mastery keeps growing. Route to `grove` for L&D plan; to `merit` (when built) for role/level progression. |
| Relatedness | Controlled | **Rebuild relational scaffolding first.** Not the recognition program itself — the underlying team-connection surface (1:1 cadence, team rituals, manager consistency). Recognition on top only after the substrate is present. |
| Relatedness | Already autonomous | Design a `recognition-program` that reinforces the connection specifically — peer-to-peer channels emphasized (Achievers finding: peer recognition drives ~35% higher satisfaction than manager-only). |

### Phase 4 — Common failure mode: adding rewards to a need-frustration problem

If the diagnostic surfaces need-frustration (Axis 1), do **NOT** default to a reward or
recognition program as the fix. Rewards for work that starves autonomy or competence produce
the "overjustification effect" (Deci & Ryan's original 1980s finding): people's intrinsic
motivation for the work *decreases* because the frame shifts from "I do this because I
find it valuable" to "I do this for the reward."

Address the need-frustration first (change the context). Layer recognition on top only
after the substrate is fixed. This is where SDT overrides the intuitive "just add a bonus"
response that non-SDT-informed motivation thinking defaults to.

### Phase 5 — Measure follow-up

Any SDT-informed intervention gets a follow-up measurement window. Signals to watch:

- **Autonomy** intervention: are team members using the restored choice, or is the change
  cosmetic? Ask directly in the next pulse cycle.
- **Competence** intervention: is skill-growth visible on some artifact (project output,
  formal review, self-report)?
- **Relatedness** intervention: does the underlying team-connection substrate show
  improvement, or was the fix superficial?

Route the follow-up measurement to `wellbeing-monitoring` (aggregate pulse signals) and
to future `people-analytics-metrics` (turnover, tenure, engagement scores) — do NOT
try to measure at the individual level. This is the aggregate-only rule from Universal
Principle 7 (inherited from hire).

## Output Format

Each invocation produces one or more of:

- **SDT diagnostic worksheet** — for the team/venture in scope: Axis 1 (which needs starved,
  ranked), Axis 2 (where motivation currently sits on the continuum), signal evidence for
  each need, confidence level.
- **Intervention design memo** — recommended intervention direction from the Phase-3
  matrix, matched to the diagnostic; explicit statement of what the intervention will NOT
  fix (to prevent overreach); routing to sibling skills (`recognition-program`,
  `wellbeing-monitoring`, future `grove`, future `merit`).
- **Follow-up plan** — measurement window, signals to watch, sibling skill to route the
  follow-up read to.
- **SDT lens note** — when a calling skill needs a brief SDT-grounded framing (e.g.,
  `recognition-program` asks "which need does this reinforce?"), a 1-paragraph SDT read.

## Principles

1. **Autonomy is not just choice.** The need is for *psychological freedom* — the sense
   that actions are self-endorsed. Superficial "we let people pick their own coffee"
   choice does not satisfy autonomy if the underlying work is coerced. (Ryan & Deci 2000)
2. **Competence is not just praise.** The need is for *evidence of mastery*. Empty
   affirmations without visible skill growth do not satisfy the competence need. (Ryan &
   Deci 2000; Gagné & Deci 2005)
3. **Relatedness is not just perks.** The need is for *caring, supportive social
   connection*. Team offsites and pizza Fridays are not the substrate — consistent
   manager cadence, peer trust, and psychological safety are. (Deci, Olafsen, & Ryan 2017)
4. **Diagnose need-frustration before adding rewards.** The overjustification effect —
   external rewards reducing intrinsic motivation — is one of SDT's oldest documented
   findings. Recognition and comp fix motivation-regulation-type problems and *reinforce*
   already-satisfied needs; they do NOT fix need-frustration.
5. **Autonomous motivation beats controlled motivation over the long run.** Controlled
   motivation (reward-driven, guilt-driven) produces short-term compliance but predicts
   disengagement, burnout, and turnover. Design for autonomous motivation as the goal, not
   as a bonus. (Gagné & Deci 2005; Deci, Olafsen, & Ryan 2017)
6. **Aggregate only.** All SDT diagnostics run at the team/venture level, not the
   individual level — inherits maslow's Universal Principle 7 aggregate rule from hire.
   Individual motivation coaching is out of this skill's scope.
7. **§0.6 flag.** SDT theory is well-established but the specific applications and
   confidence levels here are Tier B (canonical published framework, cited but not
   page-cited from a source in `Agents/_books/`). Downgrade to Tier A when Ryan & Deci
   2000 + Deci Olafsen Ryan 2017 are placed and a `Shared OS/logical/sdt_diagnostic.md`
   Route-D asset with page citations is built per §8.9.

## Fallback

- **Insufficient signal to diagnose.** Say so. Do NOT guess which need is starved from a
  vague "the team seems off." Ask for specific team-level signals (pulse survey results,
  workload data, retention numbers, direct conversations at the aggregate level) before
  running the diagnostic.
- **Request to diagnose a specific named individual's motivation.** Decline — this skill is
  aggregate/cohort-only. Individual motivation coaching is out of scope; if the request
  reflects an individual performance concern, route to `merit` (when built) or to the
  accountable manager.
- **Request to prescribe a specific reward or bonus without diagnosis first.** Push back
  gently — SDT-informed practice diagnoses before rewarding. Offer to run the Phase-1
  diagnostic first; if the operator declines, note in the output that the intervention is
  being recommended without diagnostic support and is at higher risk of the
  overjustification effect.
- **Individual crisis signal surfaces via any channel.** Stop immediately — this is
  `wellbeing-monitoring` § Fallback territory, not SDT's. Escalate to the person's manager
  + HR Ops + EAP per that skill's escalation rule.
- **Intervention proposed for a symptom of a comp problem or workload problem.** Route to
  the appropriate skill (`payroll-and-eor` for classification/comp; `workforce-planning`
  for staffing) rather than treating SDT as a substitute for fixing a real material issue.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `motivation-map` (custom, maslow) | Operational execution of the SDT diagnostic — SDT provides theory, motivation-map runs the pulse + intervention menu | Sibling; motivation-map calls SDT for framing, SDT hands intervention direction back to motivation-map |
| `wellbeing-monitoring` (custom, maslow) | Aggregate burnout / workload signals that feed the SDT diagnostic; individual crisis signals escalate OUT of both skills | Bidirectional — wellbeing signals inform SDT diagnostic; SDT-derived intervention direction may need wellbeing follow-up |
| `recognition-program` (custom, maslow) | Design decisions: which of the 3 needs a program category is trying to satisfy | Downstream — SDT provides the "which need does this reinforce?" answer |
| `hire` (P&C leader) | Aggregate-only rule; identity anchor's principle "you don't motivate; you hire people who are already motivated" | Cross-cutting — SDT informs when hiring-time motivation signals matter for role fit |
| `grove` (P&C — L&D, future) | Competence-need interventions — training programs, skill scaffolding, feedback loops | Downstream — when Axis 1 diagnoses competence as starved |
| `merit` (P&C — Performance, future) | Autonomy-need interventions in performance management — self-endorsed goal-setting, choice about how goals are met | Downstream — when Axis 1 diagnoses autonomy as starved and the context is performance-cycle-adjacent |
| Future `Shared OS: people-analytics-metrics` | Aggregate motivation-related metrics for follow-up measurement (engagement scores, tenure, voluntary turnover) | Downstream for Phase 5 follow-up |
| `Shared OS: verification-before-completion` | Evidence gate on every SDT diagnostic and intervention design before it ships | Cross-cutting |

## References (public / verifiable)

- [Self-Determination Theory of Motivation — American Psychological Association](https://www.apa.org/research-practice/conduct-research/self-determination-theory)
- [Ryan & Deci — theory overview at selfdeterminationtheory.org](https://selfdeterminationtheory.org/theory/)
- [Deci, Olafsen, & Ryan (2017) — Self-Determination Theory in Work Organizations: The State of a Science (PDF, Corporate Research Forum host, FREE)](https://www.crforum.co.uk/wp-content/uploads/2025/02/Deci-Olafsen-Ryan-Self-determination-Theory-in-Work-Organizations-The-State-of-a-Science.pdf)
- [Gagné & Deci (2005) — Self-Determination Theory and Work Motivation (PDF, selfdeterminationtheory.org host, FREE)](https://selfdeterminationtheory.org/SDT/documents/2005_GagneDeci_JOB_SDTtheory.pdf)
- [Stone, Deci, & Ryan (2009) — Beyond Talk: Creating Autonomous Motivation through Self-Determination Theory (PDF, FREE)](https://selfdeterminationtheory.org/SDT/documents/2009_StoneDeciRyan_JGM.pdf)
- [Autonomy, Competence and Relatedness — RCCS overview](https://www.rccs.org.uk/post/autonomy-competence-and-relatedness-understanding-the-three-universal-needs-of-self-determination)
