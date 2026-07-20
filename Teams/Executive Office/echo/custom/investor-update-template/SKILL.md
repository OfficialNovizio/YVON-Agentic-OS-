---
name: investor-update-template
type: custom
status: built from scratch — orchestrates the marketplace investor-update-generator skill rather than duplicating its template/validator
based_on_catalog_entry: vyon-investor-update-template (VYON_Skills_Catalog_Full_v2.html, echo/Executive Office) — renamed investor-update-template, genericized off "vyon-" prefix and off hardcoded references to other VYON-specific agents (felix, pipe), the fictional "beacon" send mechanism, and hardcoded "CEO sign-off" per portability goal
assigned_agent: echo (Executive Office / Investor Relations)
portable: true — metrics source, approval routing, and send channel are all operator-configured, not hardcoded
date_added: 2026-07-02
---

## Introduction

investor-update-template is the recurring monthly/quarterly production process for sending investor updates — distinct from `investor-update-generator` (marketplace), which supplies the actual template and scoring rubric this skill uses rather than reinvents. This skill is the workflow around that template: collect, draft, enforce honesty, validate, review, approve, send.

## Purpose

Make sending a credible, honest investor update a repeatable, low-friction monthly process rather than a one-off scramble each time — while enforcing a hard "no spin" rule the underlying marketplace skill only partially covers.

## When to Use

Triggers: "monthly update," "investor email," "quarterly update," "send the investor update," or when it's time in the cadence (monthly for early-stage, quarterly for later-stage, per `investor-update-generator`'s own cadence guidance) to produce one.

## Structure / Protocol

```
Collect metrics + context
  -> Draft using investor-update-generator's template
    -> Enforce: at least one honest lowlight, minimum (hard rule, not optional)
      -> Validate with investor-update-generator's scoring script
        -> Triple-pass review
          -> Get approval (per agent config)
            -> Send (via whatever channel is configured)
```

## Instructions

### Phase 1 — Collect

Pull this period's metrics from wherever the operator says they're tracked — don't assume a source. Also pull: last update sent (for continuity/delta), current open asks, and any known wins or misses since the last update.

### Phase 2 — Draft

Draft using `investor-update-generator`'s `assets/investor_update_template.md` structure (highlights, lowlights, metrics table, product, sales/GTM, team, asks, looking ahead) — don't build a separate template from scratch.

### Phase 3 — Enforce the Honesty Rule

This is a hard rule specific to this skill, stricter than the underlying marketplace skill's own scoring (which only penalizes updates that are *entirely* positive): **every update must include at least one genuine lowlight, risk, or miss** — not manufactured, but not omitted either if one exists. If the period genuinely had no lowlights worth naming, say so explicitly in the update rather than silently having none (a suspiciously perfect update should be flagged as unusual, not treated as normal).

### Phase 4 — Validate

Run the draft through `investor-update-generator`'s `scripts/investor_update_validator.py`. Treat a score below 80 as not ready to send — address the specific missing/weak sections it flags before proceeding.

### Phase 5 — Triple-Pass Review

Three distinct passes, not one combined skim:
1. **Accuracy pass** — every number and claim checks out against the source metrics from Phase 1.
2. **Tone/spin pass** — check specifically for the failure mode the marketplace skill's rubric can miss: technically-present-but-buried lowlights, or lowlights stated so softly they read as wins.
3. **Specificity pass** — every ask passes the test "could the investor act on this without further clarification?" (from `investor-update-generator`'s reference guide) — vague asks get rewritten or cut.

### Phase 6 — Approval

Route for sign-off per whatever the agent's escalation config specifies (see the leader agent's `operational/agent/` config pattern) — do not hardcode a specific person or role. If no approval routing is configured yet, default to asking the operator directly before send.

### Phase 7 — Send

Send via whatever channel/tool is actually configured for this — do not assume a specific delivery mechanism. If none is configured, produce the final update as a file/draft and hand it to the operator to send manually.

## Output Format

Same structure as `investor-update-generator`'s template, plus a short pre-send checklist appended:

```
### Pre-Send Checklist
- [ ] At least one honest lowlight included
- [ ] Validator score: [score]/100
- [ ] Accuracy pass complete
- [ ] Tone/spin pass complete
- [ ] Specificity pass complete (asks are actionable)
- [ ] Approval obtained from: [who/what, per config]
- [ ] Sent via: [channel]
```

## Principles

- No spin, ever — a lowlight that exists and gets omitted is a worse failure than a rough update that includes it.
- Don't duplicate the marketplace skill's template or validator — extend and enforce on top of them.
- Consistency across periods — metric definitions shouldn't change month to month (same principle the marketplace skill's reference guide states); flag it explicitly if a definition needs to change, rather than quietly redefining.

## Fallback

- If `investor-update-generator`'s validator script isn't available for some reason, do the same scoring checks manually by reasoning through its rule list — don't skip validation entirely.
- If metrics can't be sourced for this period, flag exactly which are missing rather than drafting around the gap with vague language.
- If no lowlight can be honestly identified, state that explicitly and flag it as worth double-checking rather than presenting an all-positive update as normal.

## Boundaries with Other echo Skills

- Depends on `investor-update-generator` (marketplace) for the template and validator — don't rebuild those here.
- Distinct from `pitch-narrative`: pitch-narrative is the occasional/one-off fundraising story; this skill is the recurring operational update. Facts should stay consistent between the two, but they serve different moments.
