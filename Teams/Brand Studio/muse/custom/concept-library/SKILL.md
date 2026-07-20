---
name: concept-library
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build)
based_on_catalog_entry: vyon-concept-library (VYON_Skills_Catalog_Full_v2.html, muse/Brand Studio) — renamed concept-library, genericized per rule 0.4b; the registry is per-business, template provided
assigned_agent: muse (Brand Studio / Ideation)
portable: true — the registry's content is per-business; this skill carries the process and template
includes: assets/concept-registry-template.md
date_added: 2026-07-07
---

## Introduction

concept-library is muse's memory: a per-brand registry of campaign concepts — **used, rejected, and reserved** — that every new ideation run dedupes against before anything goes forward. Generation without memory produces the same "fresh" idea every six months; this skill makes muse's creativity cumulative the same way weave's ledger makes the story cumulative.

## Purpose

Three failure modes, one registry. *Repeats*: pitching a concept the brand already ran (or already rejected, with the rejection reason forgotten). *Lost work*: strong concepts that lost a bake-off vanishing instead of being reserved for the right moment. *Unlearned rejections*: spark's or the operator's "no" carrying reasoning that never gets consulted again. The registry captures all three, so every ideation run starts from what the brand already knows.

## When to Use

Triggers: "campaign ideas," "new concept," "have we done this before," "what's in the reserve" — and automatically as the closing phase of every `generate-creative-ideas` run for campaign/content concepts.

## Structure / Protocol

```
Ideation run produces candidates (via generate-creative-ideas — typically 10 per brief)
  -> DEDUPE each vs the registry: match on mechanism + angle, not just wording
       new / variant-of-[entry] / repeat-of-[entry]
    -> Variants: name what's genuinely new vs the prior entry
    -> Survivors scored (NAF, from the sibling skill) → top 3 to spark for coherence
       sanity check (coach mode) before development
      -> EVERY outcome registered: used (with results when known) / rejected (with the
         actual reason) / reserved (with what it's waiting for)
```

## Instructions

### Phase 1 — Dedupe

Match candidates against the registry on **mechanism and angle**, not surface wording — "customers tell their worst-old-way story" is the same concept whether it's framed as a contest or a series. Verdicts per candidate: **new**, **variant** (name the delta and whether it clears the prior entry's rejection reason), or **repeat** (cite the entry; repeats of *used* concepts may return as deliberate callbacks via weave's ledger, never by amnesia).

### Phase 2 — Score and Forward

Survivors get NAF scores (the sibling skill's default rubric — flagged per rule 0.6 as a judgment rubric, not a validated instrument). Top 3 go to spark for a coherence sanity check (coach mode) before any development spend; spark's read comes back as develop / park / kill-with-reason.

### Phase 3 — Register Everything

Every candidate that reached scoring gets a registry entry with status:
- **used** — went to development; updated later with what happened (kai's numbers when available) — the registry's learning loop.
- **rejected** — with the *actual* reason (off-arc, off-voice, spark kill, operator pass, lost the bake-off). "Didn't feel right" is not a reason; ask for the real one.
- **reserved** — good concept, wrong moment; with the trigger it's waiting for (season, product launch, arc act II). Reserves are reviewed on a cadence so the shelf doesn't become a graveyard.

Registry is append-only; status changes are new lines referencing the entry (the system's ledger discipline).

## Output Format

```
## Concept Run: [brief, one line] — [brand]

| # | Concept (mechanism + angle) | Dedupe | NAF | Forward? |
|---|---|---|---|---|

### To spark (top 3): [names]
### Registered: [n used-candidates / n rejected + reasons / n reserved + triggers]
```

## Principles

- **Mechanism-level dedupe.** Rewording an old concept isn't a new concept.
- **Rejections carry reasons.** A "no" without a why teaches nothing and will be re-pitched.
- **Reserved is a status, not a euphemism.** Every reserve names its trigger and gets cadence review.
- **Outcomes close the loop.** Used concepts get their results attached — the registry is a learning set, not a filing cabinet.
- **Append-only.** Same discipline as every ledger in this system.
- **NAF is a rubric.** Flagged per rule 0.6 until muse's logical layer gets a real creativity-evaluation source.

## Fallback

- Empty registry (new brand) → every concept is "new"; the registry starts with this run.
- Brief so novel nothing could match → say so; dedupe cost is near-zero, skipping it is how amnesia starts.
- Prior campaigns exist but unregistered → backfill from published work as labeled reconstructions (weave's ledger pattern).

## Boundaries with Other Skills

- `generate-creative-ideas` (sibling) produces the candidates and the scoring rubrics; this skill owns memory, dedupe, and the forward/register protocol.
- **spark** sanity-checks the top 3 (coach) and later gates the developed creative (gate) — two different moments.
- **weave** positions developed concepts as chapters; a repeat-as-callback is weave's call, not muse's.
- **kai** supplies outcome data for used entries. **pulse/lena/pixel** develop what survives.
