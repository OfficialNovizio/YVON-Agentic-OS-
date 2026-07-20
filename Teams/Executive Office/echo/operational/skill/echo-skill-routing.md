---
name: echo-skill-routing
type: operational/skill
status: consolidated from "Boundaries with Other echo Skills" sections already defined within each individual skill file — no new logic invented
assigned_agent: echo (Executive Office / Investor Relations)
date_added: 2026-07-02
---

## Purpose

Echo's own routing map: which skill hands off to which, and what depends on what. Sourced from the "Boundaries" sections already written into pitch-narrative, pitch-framework, and investor-update-template — this file indexes those cross-references in one place. For request-level trigger precedence (which phrase routes where), see `operational/commands/echo-commands.md` — this file covers the *dependency* relationships between skills, not phrase matching.

## Where Identity Fits

Echo has no identity of its own — identity folders are department-leader-only, and echo's principles were deliberately kept Universal-only (see `operational/principles/echo-principles.md`) rather than inheriting marcus's tone. So there's no tone layer sitting on top of this routing map; echo's voice comes directly from its principles.

## The Dependency Map

```
pitch-narrative                    (owns the story: problem/wedge/traction/ask,
                                     versioned per pitch type + audience tier)
        |
        v
pitch-framework                    (owns the slides/structure — pulls the current
                                     canonical narrative from pitch-narrative rather
                                     than drafting its own)

investor-update-generator (marketplace)   (supplies template + validator script)
        |
        v
investor-update-template           (the actual monthly production process —
                                     orchestrates investor-update-generator,
                                     adds the hard no-spin rule + triple-pass review)
```

Two independent tracks: **pitch** (narrative → deck, for fundraising/partnership/demo moments) and **updates** (template+validator → recurring production, for the standing investor cadence). They share the honesty/consistency principles in `echo-principles.md`, and should stay factually consistent with each other (the same underlying business facts, whether appearing in a pitch or an update), but one track doesn't feed the other directly.

## Handoff Rules

- **pitch-narrative → pitch-framework**: when a deck is actually needed (not just a narrative update), pitch-framework should pull the current version from pitch-narrative matching the relevant pitch type, rather than drafting narrative independently. If pitch-narrative hasn't been run yet or the story is stale, run it first.
- **investor-update-generator → investor-update-template**: investor-update-template is the real entry point for producing an update in the normal monthly/quarterly cycle — it uses investor-update-generator's template and validator internally. Only go to investor-update-generator directly when validating a draft written outside this workflow (see `echo-commands.md`'s precedence rule for the exact trigger distinction).
- **pitch-narrative ↔ investor-update-template**: no direct handoff, but both must stay factually consistent — the traction numbers and story in a pitch shouldn't contradict what's reported in the latest investor update, or vice versa.

## Precedence When a Request Matches Multiple Skills

See `operational/commands/echo-commands.md` for the two specific precedence rules (narrative-before-deck, template-before-raw-validator). For anything not covered there, route to whichever skill matches the request's most specific, primary ask.

## Fallback

If a request doesn't fit anywhere in this map, ask what's actually being asked rather than forcing it into the nearest skill — consistent with each skill's own Phase 1 guidance.

## Machine-Readable Routing (compiled)

```yaml
# yvon-compile: machine-readable routing — prose above remains canonical for humans
skills:
  pitch-narrative:
    handoffs: pitch-framework pulls the current narrative from here; run first if stale or missing
  pitch-framework:
    handoffs: deck production — never drafts narrative independently of pitch-narrative
  investor-update-template:
    handoffs: normal entry for monthly/quarterly updates; uses investor-update-generator internally
  investor-update-generator:
    handoffs: direct use only to validate drafts written outside the template workflow; must stay factually consistent with pitch-narrative
```
