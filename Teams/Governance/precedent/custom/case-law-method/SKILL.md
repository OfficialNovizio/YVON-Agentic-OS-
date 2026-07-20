---
name: case-law-method
type: custom
status: built from scratch — catalog listed this slot as MARKETPLACE, but the 2026-07-07 search found no fit: every candidate was either a real-court legal-research tool (CourtListener/jurisdiction-bound) or a legal-education reference, none implementing stare-decisis method for INTERNAL governance rulings. Converted to custom per playbook §4.6 spirit; the method below adapts standard stare-decisis doctrine (ratio decidendi, material facts, distinguish/overrule) to the internal ruling log.
fulfills_catalog_entry: case-law-method (VYON_Skills_Catalog_Full_v2.html, precedent/Governance)
assigned_agent: precedent (Governance / Institutional Memory)
portable: true — operates on whatever ruling log the business has; no jurisdiction or company specifics
date_added: 2026-07-07
---

## Introduction

case-law-method is the reasoning discipline for *using* precedent: given a new case and a retrieved prior ruling, extract what the prior ruling actually decided (its ratio — the rule that drove the outcome, as opposed to incidental commentary), test whether the new case's material facts genuinely match, and then **apply or distinguish explicitly** — never silently. It adapts the common-law stare-decisis method to internal governance rulings; it involves no real courts, no legal research, and is not legal advice.

## Purpose

Without a method, precedent retrieval produces two failure modes: rulings get applied because they're superficially similar ("we approved a spend like this before" — on different facts), or ignored because nobody articulates why they don't bind. This skill forces the middle path: every relevant precedent is either applied with its rule stated, or distinguished with the material difference named. Consistency where cases match; documented reasons where they don't.

## When to Use

Triggers: "apply precedent," "how does the past ruling bear on this," "are these cases the same," or whenever `ruling-log` has surfaced precedents for a live gate review and board needs to know what they require.

## Structure / Protocol

```
Extract the ratio from the prior ruling (the rule that decided it, not the commentary)
  -> Identify the prior case's material facts (the facts the ratio depended on)
    -> Compare the new case's facts: same in the ways that mattered?
      -> APPLY (facts match → same ruling follows, rule quoted)
         or DISTINGUISH (material difference named → precedent doesn't control)
        -> Either way: explicit, written, logged
```

## Instructions

### Phase 1 — Extract the Ratio

From the prior ruling's record (its `rationale` and `cited` fields): state in one sentence the *rule* that decided it — "spends above the gate with unvalidated revenue assumptions get CONDITIONAL, not APPROVE" — separated from incidental observations that didn't drive the outcome. If the record's rationale is missing or too thin to extract a ratio, say so: a ruling without extractable reasoning is weak precedent, usable as history but not as a rule.

### Phase 2 — Material Facts

List the facts of the prior case *that the ratio depended on* (amount relative to gate, what was unvalidated, which article applied). Facts that didn't matter to the outcome are noise — naming them as material is how false matches happen.

### Phase 3 — Compare

For each material fact, is the new case the same, different, or unknown? Unknown facts get asked about, not assumed to match.

### Phase 4 — Apply or Distinguish

- **APPLY** — material facts match: the precedent's rule controls, and the new ruling should follow it. Quote the ratio and the prior ruling ID. Departing from an applied precedent is an **overrule** — allowed, but it belongs to `consistency-check`'s explicit distinguish-or-overrule protocol, never done silently here.
- **DISTINGUISH** — a material fact differs: name it specifically ("prior case's spend was one-time; this one is recurring, which changes the runway math"), and state that the precedent doesn't control *for that reason*. A distinction that wouldn't have changed the prior outcome is not material — don't manufacture distinctions to escape inconvenient precedent.

### Phase 5 — Record

The application/distinction goes into the new ruling's record (ruling-log schema, `rationale` field references the precedent IDs), so the precedent chain stays traceable.

## Output Format

```
## Precedent Application: [new case] vs [ruling ID]

**Ratio of prior ruling:** [one sentence, quoted basis]
**Material facts (prior):** [list]

| Material fact | Prior case | New case | Match? |
|---|---|---|---|

### Conclusion: APPLY / DISTINGUISH
[If APPLY: the rule the new ruling should follow. If DISTINGUISH: the named material
difference and why it breaks the match. If the precedent is too thin to extract a
ratio: said plainly, treated as history not rule.]
```

## Principles

- **Ratio, not vibes.** What a ruling *decided* binds; what it *mentioned* doesn't.
- **Material means outcome-changing.** A distinction that wouldn't have flipped the prior ruling is not a distinction.
- **Explicit or nothing.** Every surfaced precedent ends as APPLY or DISTINGUISH in writing — silence about a known precedent is the failure this skill exists to prevent.
- **Thin precedent is history, not rule.** Rulings without captured rationale inform, but don't control.
- **Not legal advice.** Internal governance reasoning only; real legal questions go to counsel (and jurisdiction compliance to sentinel's domain).

## Fallback

- No precedents surfaced → nothing to apply; the new ruling stands on its own and becomes tomorrow's precedent.
- Two precedents conflict with each other → surface both to `consistency-check` (that's a latent contradiction in the log, its territory).
- The prior record lacks rationale → treat per the thin-precedent principle; flag to ruling-log's "rationale not captured" hygiene.

## Boundaries with Other precedent Skills

- `ruling-log` finds the precedents; this skill reasons from one precedent to the new case; `consistency-check` handles the *conflict* cases — a proposed ruling that contradicts applied precedent triggers its distinguish-or-overrule protocol.
- Boundary with board: this skill tells board what precedent requires; board (and ultimately the operator) still owns the ruling. Precedent informs the gate; it doesn't replace it.
