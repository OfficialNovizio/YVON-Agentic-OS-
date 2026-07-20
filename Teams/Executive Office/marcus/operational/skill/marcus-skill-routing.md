---
name: marcus-skill-routing
type: operational/skill
status: consolidated from "Boundaries with Other marcus Skills" sections already defined within each individual skill file — no new logic invented
assigned_agent: marcus (Executive Office / Orchestrator)
date_added: 2026-07-02
---

## Purpose

Marcus's own routing table: which skill runs when, how they hand off to each other, and what takes precedence when a request could plausibly match more than one. Sourced entirely from the "Boundaries" sections already written into decision-critic, okr-cascade, venture-priority-matrix, strategy-advisor, and vision-exploration — this file indexes those cross-references in one place instead of leaving marcus to piece them together from five separate files.

## Where Identity Fits

This map determines **which** skill runs and in what order. It does not determine **how** marcus communicates while running it — that's the job of whichever identity is active in `identity/` (currently visionary-operator-steve-jobs), applied uniformly across every skill below, not to any single step. Same relationship as the Universal vs. Identity-Flavored split in `operational/principles/marcus-principles.md`.

## The Handoff Chain

```
vision-exploration            (upstream: articulates long-horizon direction/narrative)
        |
        v
okr-cascade                   (turns a vision/priority into quarterly objectives + key results)
        |
        v
venture-priority-matrix       (allocates resources across competing initiatives,
                                consuming okr-cascade's output via the okr_alignment factor)
        |
        v
decision-critic                (stress-tests the resulting decision/plan before it's finalized)

strategy-advisor               (general-purpose strategic evaluation — can run standalone,
                                 or alongside any step above when a broader strategic
                                 question is embedded in the request)
```

## Handoff Rules

- **vision-exploration → okr-cascade**: okr-cascade assumes a vision/direction already exists to cascade from. If no vision has been articulated yet and the request needs one, run vision-exploration first rather than okr-cascade inventing a direction.
- **okr-cascade → venture-priority-matrix**: venture-priority-matrix's `okr_alignment` factor should be populated from okr-cascade's most recent output for the relevant quarter. If okr-cascade hasn't been run yet, default every initiative's `okr_alignment` to 1.0 (neutral) and flag this explicitly, per venture-priority-matrix's own fallback rule — don't block on it.
- **okr-cascade / venture-priority-matrix → decision-critic**: any objective, key result, or ranking result the operator is unsure about should be run through decision-critic before being finalized as a recommendation to the board. This is optional for routine, low-stakes calls — decision-critic is not meant to run on every output by default (see decision-critic's own "When to Use" / "Not for" guidance).
- **strategy-advisor**: not part of the linear chain — it's the general entry point for open-ended strategic questions ("should we even be doing X") that don't yet have a specific decision, objective, or resourcing question framed. Once strategy-advisor's output produces something concrete, hand off into the chain above at whichever step fits.

## Precedence When a Request Matches Multiple Skills

Route to the skill matching the request's **primary, most specific ask** first. If the request implies a downstream step too (e.g. "set OKRs and tell me if they're any good" implies okr-cascade then decision-critic), run them in chain order rather than picking one arbitrarily — but still one skill's output at a time, presenting each before starting the next, consistent with how this whole build has proceeded.

## Fallback

If a request doesn't fit anywhere in the chain and doesn't fit strategy-advisor's general-purpose scope either, don't force it into the nearest skill — say so and ask what's actually being asked, per each individual skill's own Phase 1 guidance to clarify rather than guess.

## Machine-Readable Routing (compiled)

```yaml
# yvon-compile: machine-readable routing — prose above remains canonical for humans
skills:
  vision-exploration:
    handoffs: upstream of okr-cascade — if no vision exists yet, run this first
  okr-cascade:
    handoffs: consumes vision-exploration output; feeds venture-priority-matrix via okr_alignment
  venture-priority-matrix:
    handoffs: populate okr_alignment from okr-cascade's latest output, else default 1.0 and flag
  decision-critic:
    handoffs: stress-tests the finalized plan/decision from any upstream skill before commit
  strategy-advisor:
    handoffs: standalone entry for open strategic questions; hand into the chain once concrete
```
