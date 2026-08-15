<!--
Custom skill — adopted from the Anthropic recognition-rewards-program-design plugin,
then genericized per §0.4b and retargeted to real YVON agents.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/recognition-rewards-program-design/SKILL.md
Note on the Python script: source SKILL.md references scripts/recognition_program.py but that
file was NOT included in the packaged plugin. Per §0.5 the script is
IMPLEMENTED-FROM-DESCRIPTION here — the source describes point-tier lookup, participation-rate
calculation, timeliness status, and per-capita equity check with min-group-size suppression.

Genericization strip (§0.4b):
- "maslow (People & Culture / CHRO agent)" → maslow (People & Culture / Motivation)
- "VYON" → stripped
- "Novizio" (example venture) → generic "example venture"
- "felix (Finance)" → board (via fiduciary-guard) for spend approval; note that a future
  Finance agent will own budget mechanics
- "HR Strategy Alignment" (VYON skill name) → future merit skill (hr-strategy-alignment)
- "People Analytics & Metrics" (VYON skill name) → future Shared OS: people-analytics-metrics
- "Employee Wellbeing Monitoring" → wellbeing-monitoring (custom, maslow — sibling)

All 8 public-source citations preserved verbatim (AIHR, O.C. Tanner, Achievers, HeyTaco,
Bucketlist, Indeed, Gallup, and the Total-Rewards research chain).
-->
---
name: recognition-program
type: custom
status: adopted from marketplace source, genericized
sources_referenced:
  - "Anthropic knowledge-work-plugins — recognition-rewards-program-design plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/recognition_program.py not included in package."
  - "AIHR — How To Create an Effective Employee Recognition Program; Total Rewards Strategy guides."
  - "O.C. Tanner — Employee Recognition Program Best Practices; Recognition and Total Rewards research."
  - "Achievers — Employee Recognition Program design; peer-to-peer research (~35% higher satisfaction vs manager-only)."
  - "HeyTaco — Employee Recognition Statistics compilation."
  - "Bucketlist — Points-System implementation guidance."
  - "Gallup — Manager-effectiveness research on 24-hour recognition timing (~3x impact vs delayed)."
  - "Indeed — Total Rewards Strategy overview."
fulfills_catalog_entry: n/a (part of maslow's expanded roster beyond catalog's 2-skill floor per §2)
genericization_notes:
  - "maslow assignment preserved."
  - "VYON / Novizio / VYON-skill-names → stripped or retargeted per CLAUDE.md §2."
  - "'felix (Finance)' → board (fiduciary-guard) for budget until Finance agent exists."
assigned_agent: maslow (People & Culture / Motivation)
portable: true
date_added: 2026-07-29
tier: 3
description: Design, launch, or audit a structured employee recognition/rewards program — categories, point tiers, fast peer + manager recognition pathway, and equity monitoring across teams. Trigger on "design a recognition program", "employee recognition", "peer-to-peer recognition", "rewards program", "recognition equity audit", or "how do we thank the team".
triggers:
  - design a recognition program
  - employee recognition
  - peer-to-peer recognition
  - rewards program
  - recognition equity audit
  - recognition timing
  - how do we thank the team
  - total rewards recognition
---

# Recognition Program

## Introduction

This skill gives maslow a research-backed way to design and run a recognition program —
not a generic "employee of the month" board, but a structured system with clear categories,
fast delivery, a peer-to-peer component, and equity monitoring. Recognition sits inside
the broader Total Rewards picture alongside compensation and benefits, and this skill
treats it that way rather than as a standalone morale gesture.

Adopted from Anthropic's `recognition-rewards-program-design` plugin, genericized per
§0.4b. All 8 public-source citations (AIHR, O.C. Tanner, Achievers, HeyTaco, Bucketlist,
Gallup, Indeed) preserved.

**Sibling coordination:** this skill runs the *program*; `motivation-map` decides *when*
to route to recognition (only when the diagnostic points to relatedness with the
substrate already present — per SDT overjustification-effect rule); `wellbeing-monitoring`
provides morale-related findings that may trigger a program refresh.

## Purpose

Recognition is one of the top reasons employees stay or leave, and structured programs
correlate with materially lower turnover (per the source's cited industry research). This
skill exists so maslow can design recognition that's timely, fair, and tied to a real
retention/engagement objective — for example, feeding directly off a `motivation-map`
diagnosis (relatedness starved, substrate present) or a future `people-analytics-metrics`
finding (elevated turnover in a specific function) rather than existing as a generic
perk.

Prevents four failure modes:

1. **Generic-perk syndrome** — a recognition program launched without a tied objective
   ("we should do something for morale") produces low participation and no measurable
   impact.
2. **Delayed grand gestures** — annual/quarterly ceremonies alone; missing the fast
   peer-to-peer channel that Gallup research shows has ~3x the impact when done within
   24 hours of the action.
3. **Recognition-as-comp-fix** — using recognition to paper over a real compensation or
   workload problem. Total Rewards research is emphatic that recognition *complements*
   fair pay, never substitutes for it.
4. **Equity blind spot** — programs that skew heavily to one function/team without an
   equity check, embedding visibility bias.

## When to Use

Trigger on:

- "Design a new recognition/rewards program" for a venture or the group
- "Build a fast peer-to-peer / manager-to-employee recognition pathway"
- "Audit our existing recognition program" for participation or equity issues
- "Tie a recognition initiative to a specific retention/engagement objective"
- "Report recognition program health" (participation rate, timeliness, distribution)
- Handoff from `motivation-map` when Phase-5 diagnosis routes to relatedness with substrate
  present
- Handoff from `wellbeing-monitoring` when a morale finding points to a relational-gap fix
  (and NOT a workload/structural fix — see Fallback)

Do NOT use for:

- Compensation, pay-equity, or benefits questions → `payroll-and-eor` (custom, hire) or
  future `comp-benchmarking`. Recognition never fixes a comp problem.
- Workload / burnout signals → `wellbeing-monitoring` (custom, maslow — sibling). Route
  the underlying problem there; recognition is not a burnout fix.
- Performance-review recognition ("annual raise / bonus") → future `merit` (Performance
  Mgmt). This skill covers peer + manager recognition, not the perf-cycle side.
- SDT-need diagnosis or motivation framing → `self-determination-theory` (custom, maslow).

## Structure / Protocol

The recognition-program lifecycle:

```
1. Anchor to a business/culture objective
    Not "morale in general." A specific tied objective — retention (turnover-driven),
    engagement (motivation-map-driven), or a strategic priority (hr-strategy-alignment
    when built).
2. Define categories + eligibility rules
    Peer-to-peer + manager-to-individual + manager-to-team + public/private options.
    Few, clear categories beat many complex ones.
3. Set point tiers + budget
    Tiered points (small shout-out → exceptional cross-team impact). Budget approved by
    board (fiduciary-guard) before publishing external commitments.
4. Build the FAST pathway first
    Lightweight, low-friction way to give recognition close to the moment (target within
    ~48 hours). Timing matters more than reward size.
5. Launch with communication
    Purpose, how to participate, behaviors being reinforced. Programs without a launch
    comm fail quietly.
6. Personalize where feasible
    Individual recognition preferences (public vs private, monetary vs non-monetary).
7. Monitor participation, timeliness, equity
    Quarterly (or per-cycle) via scripts/recognition_program.py. Flag low-participation
    groups and distribution gaps. Apply minimum-group-size suppression before publishing
    any per-group figure.
8. Feed outcomes back
    Retention/engagement impact → future Shared OS: people-analytics-metrics.
    Program-objective progress → future merit (hr-strategy-alignment scorecard).
```

## Instructions

Step numbers match the Structure / Protocol above.

### Step 1 — Anchor to a business/culture objective

Pull from a specific finding — a `motivation-map` RED-flag pointing at relatedness, a
`wellbeing-monitoring` morale trend, a future `people-analytics-metrics` turnover number,
or a strategic priority from future `merit`'s hr-strategy-alignment scorecard. Do NOT
launch recognition as a generic morale program per Fallback rule 1 (that produces the
generic-perk failure mode this skill exists to prevent).

State the objective in the program design memo: "This program is tied to [specific
finding] with success metric [specific measure]."

### Step 2 — Define categories and eligibility rules

Cover the four channel combinations:

- **Peer-to-peer** — colleague-to-colleague, lightweight and frequent.
- **Manager-to-individual** — from direct manager, tied to specific work outcome.
- **Manager-to-team** — team-level recognition for collective delivery.
- **Public / private option** — some people prefer public praise; others prefer private.
  Program must support both.

Achievers research: programs with a peer-to-peer component see materially higher
satisfaction (~35% higher in industry data) than manager-only recognition. Do NOT design
manager-only or peer-only in isolation.

**Eligibility rules** — clear from the start. Contractors included or not? Interns?
Vendors? The rule matters less than that it's consistent and communicated.

### Step 3 — Set point tiers and budget

**Points-based tiered system** (Bucketlist guidance):

- Keep tiers few and clearly defined — too many tiers reintroduces the complexity the
  skill is trying to avoid. 3–5 tiers is typical.
- Tier 1: small peer shout-out (low points). Frequent, low-friction.
- Tier 2: notable contribution or manager recognition (medium points).
- Tier 3: exceptional cross-team or cross-venture impact (high points).
- Optional Tier 4: transformative annual recognition (highest points; rare).

Redemption catalog: rewards redeemable for the points. Match the org's stage and comp
level — high-friction low-value rewards defeat the fast-pathway design.

**Budget** — route to `board` (fiduciary-guard) BEFORE publishing external commitments.
Do not publish specific reward values until budget is approved per Fallback rule 3. (Note:
placeholder route until a future Finance agent exists in YVON — hire-config.md §4 tracks
this placeholder.)

### Step 4 — Build the fast pathway first

Gallup manager-effectiveness research: recognition given within about **24 hours** of the
action is roughly **3x more impactful** than delayed recognition. Consistent, frequent
recognition outperforms infrequent high-value events for both morale and retention (Gallup
via HeyTaco; Bucketlist).

The fast pathway is a lightweight, low-friction way to give a peer shout-out or manager
recognition close to the moment — target within ~48 hours of the action. Options include:

- A dedicated channel in the org's chat tool with a lightweight "shout-out" convention.
- A dedicated recognition-platform feature (Bonusly, HeyTaco, Kudos, Achievers Recognize,
  etc. — no vendor preference here; operator picks).
- A simple form or bot integration that logs the recognition to the points ledger.

The fast pathway ships BEFORE the tier catalog does — a program with only quarterly
ceremonies fails at the timing dimension no matter how well-designed the ceremonies are.

### Step 5 — Launch with a communication plan

Recognition programs without a launch comm fail quietly. The launch comm covers:

- **Purpose** — the tied objective from Step 1, stated plainly.
- **How to participate** — where the fast pathway lives, how points work, how to redeem.
- **Behaviors being reinforced** — what does "great work" look like in this program's
  frame? Not vague ("do great work") but specific ("collaborate across ventures on
  customer-facing work").

Recirculate the comm every quarter for at least the first year. Programs need ongoing
communication oxygen; one launch email is not enough.

### Step 6 — Personalize where feasible

Learn individual recognition preferences (public vs private, monetary vs non-monetary,
verbal vs written). Some people are motivated by a public celebration; others cringe at
public attention and would prefer a private thank-you note. Programs that assume one style
fits everyone miss half the audience.

**Aggregate the preference data at team level** for program-design decisions (does this
team skew private?); NEVER surface any individual's preference in a way that could
identify them per Universal Principle 7 (aggregate-only).

### Step 7 — Monitor participation, timeliness, and equity (via script)

Use `scripts/recognition_program.py` each cycle for:

- **Participation rate** = recognitions given (or received) ÷ eligible people. Trend
  across cycles.
- **Timeliness status** = median days from action to recognition. Target < 48 hours.
- **Per-capita equity check** = recognition per person, by group (function / team /
  venture), with minimum-group-size suppression per shared privacy discipline.

Flag findings:

- **Low participation** in a specific group → is the fast pathway reachable there? Are
  managers modeling it? Is there a language/timezone issue on a distributed team?
- **Timing slippage** → the fast pathway has become a slow pathway (usually a comms
  issue, not a design issue). Re-emphasize.
- **Equity skew** — a function consistently over- or under-recognized → visibility bias,
  manager behavior, or role-type effect. Investigate; don't assume it reflects real
  performance differences.

### Step 8 — Feed outcomes back

Route:

- **Retention / engagement impact** → future `Shared OS: people-analytics-metrics` for
  turnover and engagement-score trend measurement.
- **Program-objective progress** → future `merit` (hr-strategy-alignment) scorecard entry.
- **Morale-driven refresh signals** ← `motivation-map` and `wellbeing-monitoring` continue
  to feed back in; the program adjusts to what the org's real state is.

## Output Format

Each invocation produces one or more of:

- **Program design memo** — tied objective, categories, tier structure, budget request,
  fast-pathway design, launch comm plan.
- **Program-health cycle report** — participation rate + timeliness status + equity check,
  per program, with findings and recommended adjustments.
- **Equity audit** — per-group per-capita recognition, minimum-group-size suppression
  notes, distribution-gap flags.
- **Refresh recommendation** — when a program has aged (~12 months in) or a `motivation-map`
  / `wellbeing-monitoring` signal suggests the program is no longer landing.

## Principles

1. **Recognize close to the action.** Target < 48 hours from action to recognition.
   Gallup: ~3x impact within 24 hours vs delayed. Timing matters more than reward size.
2. **Combine peer-to-peer and manager-driven recognition.** Never rely on a single channel.
   Achievers: ~35% higher satisfaction with peer-to-peer component vs manager-only.
3. **Personalize recognition delivery where feasible.** Public vs private, monetary vs
   non-monetary — respect individual preference. Aggregate the pattern at team level; never
   surface individual preferences identifiably.
4. **Monitor equity across groups** with the same privacy discipline as
   `wellbeing-monitoring` and future `people-analytics-metrics`. Minimum-group-size
   suppression applies before any per-group figure ships.
5. **Recognition complements Total Rewards; it never substitutes for fixing comp or
   workload problems.** If the underlying issue is pay or burnout, route there. Do not
   ship a recognition program as the "solution" per Fallback rule 1.
6. **Aggregate at the individual level for anything reported.** Same rule inherited from
   hire (Universal Principle 7). Individual preference and individual recognition data
   never surface identifiably.
7. **§0.6 flag.** Program-design heuristics (~48hr timing target; 3-5 tiers; ~35% peer
   satisfaction uplift; program-objective tie) are Tier B (canonical industry research
   cited but not book-page-cited). Downgrade to Tier A when a Total-Rewards academic text
   (e.g., WorldatWork Total Rewards handbook, or Milkovich & Newman *Compensation*) is
   paired with one of the practitioner sources per §8.0.

## Fallback

- **Recognition proposed as a fix for a pay or workload problem.** Say so explicitly.
  Recognition supplements Total Rewards; it doesn't substitute for a real compensation or
  burnout issue. Route the underlying problem: pay-equity → `payroll-and-eor` or future
  `comp-benchmarking`; workload/burnout → `wellbeing-monitoring` and (if structural)
  `workforce-planning`.
- **Group size below the privacy threshold for an equity check.** Suppress the segmented
  figure; roll up or report qualitatively.
- **No budget approved yet.** Design the program structure and tiers, but do NOT publish
  specific reward values externally until `board` (fiduciary-guard) confirms budget.
  Preserve the design as a proposal, not a launched program.
- **Recognition consistently skewed to one team/function.** Flag as an equity concern and
  investigate (visibility bias, manager behavior, role type) rather than assuming it
  reflects real performance differences. Route the investigation to whoever owns the
  affected manager relationships (usually the department leader or the operator).
- **Generic-perk request** ("just design a nice recognition program without a specific
  finding attached"). Push back — Principle 5. Ask what specific business/culture objective
  the program should serve. If the operator insists, ship the program with the objective
  explicitly labeled "unspecified" so the health-cycle report can flag it later.
- **Individual crisis signal** in a recognition-program comment or nomination. Route per
  `wellbeing-monitoring` § Fallback (manager + HR Ops + EAP). Never handled inside this
  skill.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `motivation-map` (custom, maslow) | Phase-5 diagnosis routes to recognition ONLY when relatedness starved AND substrate present | Upstream — motivation-map calls this skill only under the correct diagnosis |
| `self-determination-theory` (custom, maslow) | Overjustification-effect rule (Principle 4) — do NOT reward autonomy/competence starvation | Upstream principle enforcement |
| `wellbeing-monitoring` (custom, maslow) | Morale findings that may trigger a program refresh; individual crisis signals escalate OUT | Bidirectional (morale in); escalation lane (crisis out) |
| `hire` (P&C — Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, Charter senior); `payroll-and-eor` for pay-side coordination | Upstream principles; sibling for total-rewards coordination |
| `board` (Governance — fiduciary-guard) | Budget approval for reward values and program cost | Escalation — placeholder until Finance agent exists |
| Future `merit` (P&C — Performance) | hr-strategy-alignment scorecard entry for program-objective progress | Downstream (Step 8 feed-back) |
| Future `Shared OS: people-analytics-metrics` | Retention / engagement impact measurement; shared minimum-group-size suppression logic | Shared logic; downstream measurement |
| Manager + HR Ops + EAP | Individual crisis signals in comments/nominations (immediate escalation) | Escalation only — never call-and-return |
| `Shared OS: verification-before-completion` | Evidence gate on every program design and cycle report before shipping | Cross-cutting |

## References (public / verifiable)

- [How To Create an Effective Employee Recognition Program — AIHR](https://www.aihr.com/blog/employee-recognition/)
- [5 Employee Recognition Program Best Practices — O.C. Tanner](https://www.octanner.com/articles/5-employee-recognition-program-best-practices)
- [How to build an employee recognition program — Achievers](https://www.achievers.com/blog/employee-recognition-program/)
- [Employee Recognition Statistics: 40+ Data Points — HeyTaco](https://heytaco.com/employee-appreciation-statistics)
- [Implementing an Employee Recognition Points System — Bucketlist](https://bucketlistrewards.com/blog/implementing-employee-recognition-points-system/)
- [What Is a Total Rewards Strategy? — Indeed](https://www.indeed.com/career-advice/career-development/total-rewards-strategy)
- [The Problem with Total Rewards — And How Recognition Can Help — O.C. Tanner](https://www.octanner.com/articles/employee-recognition-and-total-rewards)
- [What is a Total Rewards Strategy? — AIHR](https://www.aihr.com/blog/total-rewards-strategy/)
