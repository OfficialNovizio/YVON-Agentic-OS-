---
name: pitch-narrative
type: custom
status: built from scratch (catalog protocol redesigned per 2026-07-02 discussion — not a fixed "canonical story," but a process for building and versioning whatever story fits the actual business)
based_on_catalog_entry: vyon-pitch-narrative (VYON_Skills_Catalog_Full_v2.html, echo/Executive Office) — renamed pitch-narrative, genericized off "vyon-" prefix and off hardcoded references to other VYON-specific agents (felix, prism) and the old VYON MEMORY.md versioning system per portability goal
assigned_agent: echo (Executive Office / Investor Relations)
portable: true — the narrative content is never assumed or templated; it's always built from whatever business profile is provided
date_added: 2026-07-02
---

## Introduction

pitch-narrative maintains a versioned pitch story for whatever business it's serving — not a fixed template, but a repeatable process for building, adapting, and tracking one coherent narrative over time. The story itself (problem, solution, traction, ask) is never invented or assumed by this skill; it's always sourced from an actual business profile the operator provides or that already exists from prior use of this skill.

## Purpose

Prevent the pitch story from drifting or being reinvented from scratch every time a new pitch is needed. Give echo a consistent process for adapting one underlying narrative to whichever pitch type and audience is in front of it, while keeping a record of what changed and why.

## When to Use

Triggers: "investor deck" (narrative input for pitch-framework), "pitch update," "fundraise narrative," "adapt the pitch for [audience]," or any time the underlying business story needs to be restated for a new context.

## Structure / Protocol

```
Establish or load the business profile (never assumed)
  -> Determine pitch type (investor / partnership / customer-facing)
    -> Determine audience tier within that type
      -> Adapt narrative depth and framing accordingly
        -> Version the output; log what changed from the last version
```

## Instructions

### Phase 1 — Establish the Business Profile

Before writing any narrative, get (or load, if already established in a prior run) the actual business profile:
- **Problem**: what pain point, quantified if possible.
- **Solution / wedge**: what the business does and why it's the right entry point.
- **Traction**: real metrics, customers, or milestones — never invented.
- **Ask**: what's being requested (funding amount, partnership terms, etc.), if known yet.

If any of these is missing or vague, ask — do not draft a narrative around a guess. This profile is the source of truth for every version of the narrative that follows.

### Phase 2 — Determine Pitch Type

Ask which applies (this should match whichever structure `pitch-framework` will use downstream, if a deck is also being built):
- **Investor pitch** — narrative should center on market size, business model, and why now.
- **Partnership proposal** — narrative should center on mutual benefit and why this partner specifically.
- **Customer-facing** — narrative should center on the customer's pain point and proof it's solved.

### Phase 3 — Determine Audience Tier

Within the pitch type, ask (or infer from context and confirm) the audience tier:
- For investor pitches: **angel** (simpler, faster, founder-story-forward) / **VC** (fuller, market-sizing and business-model-forward) / **strategic investor** (emphasis on strategic fit with their portfolio/business).
- For partnership proposals: tier by how much context the partner already has (cold outreach vs. warm relationship).
- For customer-facing: tier by buyer sophistication (technical buyer vs. business buyer).

### Phase 4 — Adapt and Draft

Using the business profile from Phase 1, draft the narrative depth and framing to match Phase 2 + Phase 3:
- Pull the latest metrics from wherever the operator says they're tracked (don't assume a source — ask if unclear).
- Keep the underlying facts identical across versions — only depth, framing, and emphasis should change per audience, never the facts themselves.

### Phase 5 — Version and Log

Save the output as a new version within this skill's working file (e.g. `pitch-narrative-log.md`, created on first use), with:
- The date, pitch type, and audience tier for this version.
- A brief note on what changed from the last version for this same type/tier (new traction numbers, adjusted ask, repositioned wedge, etc.).
- The full narrative text for that version.

This is a local, self-contained version log — not dependent on any external memory system.

## Output Format

```
## Pitch Narrative — [pitch type] / [audience tier] — [date]

### What Changed Since Last Version (same type/tier)
[Delta notes, or "first version" if none exists yet]

### Narrative
**Problem:** [...]
**Solution/Wedge:** [...]
**Traction:** [...]
**Ask:** [...]

### Source Profile Used
[Confirm this pulled from the current business profile, with its own last-updated note]
```

## Principles

- The narrative is never invented independently of the business profile — if the profile is stale or missing pieces, say so rather than filling gaps with generic pitch language.
- Facts stay constant across audience adaptations — only framing and depth change. Changing the actual numbers or claims between an angel and a VC version is a credibility risk, not a feature.
- Version everything — never silently overwrite a prior narrative version without logging what changed.

## Fallback

- If no business profile exists yet, this skill's first job is establishing one (Phase 1) — don't skip to drafting.
- If the operator doesn't know the audience tier yet, ask rather than defaulting to the most detailed (VC) version, since over-explaining to an angel or under-explaining to a VC both cost credibility.
- If metrics can't be sourced, flag exactly which numbers are missing rather than drafting around them with vague language.

## Boundaries with Other echo Skills

- pitch-narrative owns the **story**; `pitch-framework` owns the **slides/structure**. When building a deck, pitch-framework should pull the current canonical narrative from here (matching pitch type) rather than drafting narrative independently.
- `investor-update-template` (not yet built) is a separate, recurring artifact (monthly/quarterly progress) — distinct from this skill's one-off/occasional pitch narrative, though both should stay factually consistent with each other.
