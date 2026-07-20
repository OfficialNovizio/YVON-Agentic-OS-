---
name: decision-critic
type: custom
status: built by merge (not a pure marketplace copy)
sources_referenced:
  - strategy-red-team (skillsmp.com, phuryn/pm-skills, 20,797★) — full protocol used verbatim as the core structure
    https://skillsmp.com/skills/phuryn-pm-skills-pm-execution-skills-strategy-red-team-skill-md
  - red-team (mcpmarket.com, jamesgiroux) — WWHTBT (What Would Have to Be True) reframing technique merged in;
    only the landing-page feature/use-case description was available, not the full raw SKILL.md
    https://mcpmarket.com/tools/skills/red-team
fulfills_catalog_entry: decision-critic (VYON_Skills_Catalog_Full_v2.html, marcus/Executive Office)
assigned_agent: marcus (Executive Office / Orchestrator)
portable: true — no venture-specific logic; works on any decision, plan, or strategy document
date_added: 2026-07-02
---

## Introduction

decision-critic is a structured adversarial-review skill. It takes a decision, plan, or strategy that a person is about to commit to, and stress-tests it before commitment rather than after failure. It was built by merging two marketplace sources that independently converged on the same technique family (Steelman → Attack → Pre-Mortem) and combining their distinct strengths: `strategy-red-team`'s load-bearing-assumption ranking and kill-criteria output, and `red-team`'s WWHTBT ("What Would Have to Be True") framing for validating proposals.

## Purpose

Give the operator (marcus, or whoever marcus is advising) a sharper decision — not a longer risk list. The skill exists to catch the failure mode where a plan survives because it only received polite feedback, not because it's actually sound. It is triggered before big, hard-to-reverse calls: resource allocation between ventures, a new strategic direction, a major partnership or spend commitment, or any proposal about to go in front of the board.

## When to Use

Triggers: "big decision," "stress test this," "is this plan solid," "pressure-test this strategy," "before I commit to X," or any time marcus is about to finalize a recommendation with high-impact or irreversible consequences. This skill is the mechanism that should run *before* a decision crosses an escalation threshold, not after.

Not for: routine, low-stakes, easily-reversible decisions. Running full adversarial review on trivial calls wastes the operator's attention and trains them to ignore the output.

## Structure / Protocol

The skill runs in five phases:

```
Extract load-bearing claims
  -> Steelman each claim, then attack the steelman
    -> Reframe surviving attacks as WWHTBT conditions
      -> Rank by impact x likelihood x cheapness-to-test
        -> Report: kill-assumptions, what's sound, what's unassessable
```

## Instructions

### Phase 1 — Extract Claims

Read the plan/decision in full. List everything it asserts as true — about the user, the market, the constraint, the mechanism, the timeline, the resourcing. Separate **load-bearing** claims (if false, the plan dies) from cosmetic ones. Only load-bearing claims proceed to Phase 2. If the plan is vague or incomplete, ask one clarifying question before proceeding rather than guessing at what's load-bearing.

### Phase 2 — Steelman, Then Attack

This is the core discipline borrowed from both source skills, and it is non-negotiable:

1. For each load-bearing claim, first state the **strongest, most charitable version** of why it might be true (the steelman).
2. Then attack *that* version — not a weaker strawman. An attack on a strawman is worthless and will be correctly ignored by the operator.
3. Write each surviving failure mode as **"Fails if ___"** — concrete and falsifiable. "Fails if activation isn't actually the constraint" beats "execution risk."

### Phase 3 — WWHTBT Reframe

For each "Fails if ___" statement, restate it as a "What Would Have to Be True" condition: what would have to be true about the world for this claim to hold? This reframing (from `red-team`) makes the assumption testable rather than just criticized — it turns "this might not work" into "here is the specific thing to go check."

### Phase 4 — Rank

Rank surviving kill-assumptions by **(impact if wrong) × (likelihood wrong) × (cheapness to test)**. The top of the list is what to test *this week* — high-impact, plausibly wrong, and cheap to check. Surface this ranking explicitly; don't bury it under a wall of text.

For each top-ranked kill-assumption, produce:
- **Claim:** the load-bearing assertion.
- **Fails if:** the precise, falsifiable condition that breaks the plan.
- **WWHTBT:** what would have to be true for the claim to hold.
- **Evidence to get this week:** the specific data, query, or conversation that would confirm or kill it cheaply.
- **Kill criterion:** the threshold at which the operator should stop or change course.
- **Cheapest test:** the smallest experiment that moves the belief.

### Phase 5 — Report

```
## Decision Critic: [decision/plan in one line]

### Top Kill-Assumptions (ranked)
[3-5 max, using the Phase 4 template]

### What's Well-Reasoned
[State explicitly what holds up, and why. Do not manufacture doubt where none exists.]

### What I Couldn't Assess
[Gaps where the plan didn't provide enough to judge — name them, don't guess.]

### Recommendation
[Go / go-with-conditions / hold, tied directly to the kill-assumptions above]
```

## Principles

- **No strawmanning.** Attack the steelman or don't attack at all.
- **No generic risk lists.** Every item must be specific to *this* decision — "market risk" is not an acceptable output.
- **No fabrication.** If a claim is genuinely well-reasoned, say so plainly. A critic that manufactures doubt to seem thorough is as useless as one that rubber-stamps everything.
- **Proportional response.** Minor, unlikely failure modes don't justify major rework. Five real kill-assumptions with tests beat twenty generic risks.
- **Rank ruthlessly.** The cheapest high-impact test is the entire point of the exercise — don't let it get lost in the list.
- **End with what to do, not just what to fear.** The emotional job of this skill is relief from the fear of confidently shipping the wrong bet.

## Fallback

- If the plan/decision is too underspecified to extract load-bearing claims, stop and ask the operator to fill the gap rather than inventing claims to attack.
- If no independent second model is reachable for cross-checking, run single-model — this is the default and is not a degraded mode, just note it wasn't cross-checked.
- If the operator wants a second opinion and another model is reachable, optionally run the same plan through it and flag disagreements — different model families miss different things. Do not add this step unless asked.
- If every load-bearing claim survives the attack, say so directly in "What's Well-Reasoned" rather than forcing manufactured risks into the ranked list.

## Boundaries with Other marcus Skills

- `decision-critic` stress-tests a decision that has already been framed. It does not generate the decision itself — that's upstream work (e.g. okr-cascade for objective-setting, venture-priority-matrix for resource-allocation scoring).
- `decision-critic` does not replace board escalation for high-stakes spend; it is a pre-escalation quality gate, not a substitute for governance sign-off.
