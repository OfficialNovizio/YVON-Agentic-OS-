---
name: okr-cascade
type: custom
status: built by merge (not a pure marketplace copy)
sources_referenced:
  - brainstorm-okrs (skillsmp.com, phuryn/pm-skills, 20,797★) — OKR/KR generation mechanics, domain context (OKR vs KPI vs NSM), output format
    https://skillsmp.com/creators/phuryn/pm-skills/pm-execution-skills-brainstorm-okrs
  - setting-okrs-goals (awesomeskill.ai, refoundai/lenny-skills, 1,097★) — coaching principles, pitfall checklist, "one step from company goals" cascading discipline
    https://awesomeskill.ai/skill/refoundai-lenny-skills-setting-okrs-goals
fulfills_catalog_entry: vyon-okr-cascade (VYON_Skills_Catalog_Full_v2.html, marcus/Executive Office) — renamed okr-cascade, genericized off "vyon-" prefix and off venture-specific language per portability goal
assigned_agent: marcus (Executive Office / Orchestrator)
portable: true — "venture," "department," and "initiative" are placeholders the operator fills in per project, not hardcoded names
date_added: 2026-07-02
---

## Introduction

okr-cascade takes a company- or venture-level vision/priority statement and turns it into quarterly Objectives and Key Results that cascade cleanly down to departments or teams, without the cascade itself becoming a game of telephone. It was built by merging two marketplace sources: `brainstorm-okrs`'s generation mechanics (produce multiple credible OKR options, grounded in OKR/KPI/NSM theory) and `setting-okrs-goals`'s coaching discipline (74 insights from 55 product leaders on what makes OKRs fail — vague objectives, tasks disguised as key results, goals set before strategy, cascades that drift from the company goal).

## Purpose

Give marcus (or whoever marcus is advising) a repeatable way to go from "here's our priority this quarter" to a small set of inspiring, measurable objectives at the top level, and defensible, aligned objectives at each department/team level below it — while catching the common failure modes before they ship to the org.

## When to Use

Triggers: "set OKRs," "quarterly planning," "cascade objectives," "what should [team]'s goals be this quarter," or any time a top-level priority needs to be translated into department- or team-level commitments.

## Structure / Protocol

```
Confirm strategy exists (not goals-before-strategy)
  -> Gather context (level, stage, existing vs. fresh goals)
    -> Draft top-level objective(s) + key results
      -> Cascade: for each department/team, draft objectives that ladder up
        -> Check each draft against the pitfall checklist
          -> Present 2-3 credible alternatives at each level, not one "right answer"
```

## Instructions

### Phase 1 — Confirm Strategy Exists

Before drafting any objective, confirm the operator has an actual strategy (a diagnosis + guiding policy — see the `strategy-advisor` and `decision-critic` skills already assigned to marcus). If there's no real strategy yet, say so directly and stop: OKRs written before strategy become false-precision exercises. Do not draft goals to fill the gap.

### Phase 2 — Gather Context

Ask (or read from provided documents):
- What level is this for — company, venture/department, team, or individual?
- Company/venture stage (early, scaling, mature) — changes what's ambitious vs. reckless.
- Are these fresh goals or a revision of existing ones?
- What is the immediately-above level's goal, so this level's objective can ladder up to it directly?

### Phase 3 — Draft Top-Level Objective(s) + Key Results

Cap the top level at **no more than three company/venture goals** — more dilutes focus and prevents real trade-offs. For each objective:
- **Objective**: qualitative, inspirational, time-bound (typically quarterly). Should make the reader want to get out of bed, not read like generic corporate language.
- **Key Results**: exactly 3 where possible, triangulated — one hardcore quantitative number, one squishier quality measure, one with a dollar sign. Prefer absolute numbers over ratios/percentages (ratios can be gamed by shrinking the denominator).

Generate **2-3 alternative credible sets**, not a single "right" answer — present them with equal weight so the operator can choose or blend, per `brainstorm-okrs`'s approach. Flag any assumptions about data availability.

### Phase 4 — Cascade

For each department/team below the top level, draft an objective that:
- Stays **no more than one step away** from the level above it — don't let it get cascaded into oblivion through multiple translation layers.
- Ladders up explicitly: state in one sentence how this team's objective moves the company/venture-level key result.
- Is owned by exactly one accountable owner.

Repeat Phase 3's key-result discipline (3 KRs, triangulated, absolute numbers) at each level.

### Phase 5 — Pitfall Check

Before presenting any draft, check every objective/KR set against this list and flag violations rather than silently fixing them (the operator should see what was wrong):

- **Key results that are really tasks** ("launch 5 features") instead of measurable outcomes.
- **Too many goals** at any one level (cap: 3).
- **Vague objectives** using generic corporate language instead of a real, specific goal.
- **Goals set before strategy** (see Phase 1).
- **Over-indexing on a single metric** that could be gamed at the expense of the user/customer.
- **Ratios/percentages as key results** where an absolute number would be harder to game.

### Phase 6 — Present

```
## OKR Cascade: [scope/quarter]

### Top-Level Objective(s) — [2-3 alternative sets]
[Objective, 3 Key Results, brief rationale, per set]

### Department/Team Cascade
For each unit:
- **Unit**: [name]
- **Objective**: [ladders up to which top-level KR, stated explicitly]
- **Key Results**: [3, triangulated]
- **Owner**: [single accountable owner]

### Pitfall Flags
[Any drafts that violate the Phase 5 checklist, named explicitly, not silently corrected]

### Assumptions
[Anything assumed about data availability or context]
```

Save substantial output as a markdown document (e.g. `OKRs-[scope]-[quarter].md`) if requested.

## Principles

- **Strategy first, goals second.** Never invent a strategy to justify OKRs.
- **One step from the goal above.** Cascading through many layers dilutes and distorts intent — keep it short.
- **Systems over one-time targets.** Where possible, favor goals that build a recurring, "default-on" system rather than a single quarter's target.
- **Outcomes, not outputs.** Success is the problem being solved, not the feature being shipped.
- **Separate strategy conversations from OKR conversations.** Don't let "what should we do" and "how will we measure it" blur together.
- **Planning overhead cap.** Planning should not consume more than roughly 10% of the execution period it's planning for.
- **No manufactured certainty.** If data to validate a key result doesn't exist yet, say so — don't fabricate a target.

## Fallback

- If no strategy exists yet, stop at Phase 1 and route the operator to `strategy-advisor` or `decision-critic` first.
- If the operator only wants one level (e.g. just the top-level objectives, no cascade), do Phases 1-3 and 5-6 only — don't force a cascade that wasn't asked for.
- If department/team-level context is missing (don't know who owns what), ask rather than assume an owner.
- If asked for deeper grounding on any single principle, the full 74-insight reference set is available in the setting-okrs-goals source (`references/guest-insights.md`) — pull specific insights on request rather than dumping the whole file by default.

## Boundaries with Other marcus Skills

- okr-cascade produces the objectives; `decision-critic` should stress-test any objective or key result the operator is unsure about before it's finalized.
- okr-cascade does not do venture/initiative resource-allocation scoring — that's `venture-priority-matrix`.
- Vision articulation (`vision-exploration`) is upstream of this skill — okr-cascade assumes a vision/direction already exists to cascade from.
