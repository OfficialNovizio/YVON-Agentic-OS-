---
name: ruling-log
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 build)
based_on_catalog_entry: vyon-ruling-log (VYON_Skills_Catalog_Full_v2.html, precedent/Governance) — renamed ruling-log, genericized off "vyon-" prefix; the record destination is the configured decision log shared with board, not a hardcoded store
assigned_agent: precedent (Governance / Institutional Memory)
portable: true — schema is business-agnostic; article/topic tags come from each business's own constitution and commitments
includes: assets/ruling-schema.md (the standard record structure)
date_added: 2026-07-07
---

## Introduction

ruling-log is precedent's capture skill: every board ruling — constitutional rulings, vetoes and their appeals, fiduciary recommendations and operator overrules, risk rulings — gets recorded in one standard schema, tagged by article/commitment and topic, so that future gate requests can be answered with "here's what we ruled before, and why." It is the write-side of institutional memory; `consistency-check` and `case-law-method` are the read-side.

## Purpose

Board's rulings are only as valuable as their retrievability. An unlogged ruling gets re-litigated; an untagged one can't be found; one recorded without rationale can't be applied to the next case. This skill makes every ruling a durable, findable, reasoned record — the difference between a governance function and a series of one-off opinions.

## When to Use

Triggers: "log this ruling," "record the decision," "past rulings on [topic]," or automatically whenever board completes a gate review (board's skills already log; this skill owns the schema and the retrieval).

## Structure / Protocol

```
Capture the ruling in the standard schema (assets/ruling-schema.md)
  -> Tag: article/commitment cited + topic(s) + venture/scope
    -> Append to the configured decision log (never overwrite)
      -> On any new gate request: surface the top 3 most similar precedents
```

## Instructions

### Phase 1 — Capture

Record per `assets/ruling-schema.md`: ruling ID, date, decision under review (one line), gate(s) that ran, ruling per gate, the **rationale** (the "because" — the most valuable field, per the blueprint's decisions-with-reasoning rule), articles/commitments/thresholds cited verbatim, the operator's final call if it differed, and outcome if known later. Never backfill rationale from memory — if the reasoning wasn't stated at ruling time, record "rationale not captured" rather than reconstructing it.

### Phase 2 — Tag

Tag each record with: the article/commitment IDs cited (from the business's own constitution/commitments), 1–3 topic tags (spend, hiring, partnership, venture-launch, etc. — grown per business, not from a fixed taxonomy), and scope (which venture/unit). Tags are for retrieval; keep them few and consistent — check existing tags before minting new ones.

### Phase 3 — Append

Append to the configured decision log (`decision_log_destination`, shared with board's config). Append-only: corrections are new entries referencing the old ID, never edits — consistent with sentinel's audit-trail-method immutability principle.

### Phase 4 — Surface Precedents

When a new gate request arrives (board routes it here before ruling), search the log by article/commitment and topic tags and return the **top 3 most similar prior rulings**, each as: ruling ID, one-line case, ruling + rationale, and why it's similar. If fewer than 3 exist, return what exists; if none, say "no precedent on point" — never stretch an unrelated ruling into relevance. What board *does* with the precedents is `case-law-method`'s and `consistency-check`'s territory.

## Output Format

For capture: the completed schema record (see assets). For retrieval:

```
## Precedents for: [new case, one line]

| # | Ruling ID / date | Case | Ruling | Why similar |
|---|---|---|---|---|
[top 3, or fewer, or "no precedent on point"]
```

## Principles

- **Rationale is the record.** A ruling without its "because" is half-logged.
- **Append-only, corrections by reference.** Same immutability discipline as sentinel's audit trail.
- **Tags are grown, not invented upfront.** Reuse before minting; a taxonomy nobody follows is worse than none.
- **No precedent means no precedent.** Don't stretch weak matches; say so.
- **Log the overrule too.** When the operator overrules board, that's often the most instructive record in the log.

## Fallback

- Decision log destination unset → deliver records to the operator directly, flag the config gap.
- A ruling arrives without stated rationale → record it with "rationale not captured," flag to board.
- Log grows too large to scan → propose an index (one line per ruling — the blueprint's INDEX.md pattern) as a maintenance task; don't silently truncate retrieval.

## Boundaries with Other precedent Skills

- ruling-log **records and retrieves**; `case-law-method` governs how a retrieved precedent is *applied or distinguished*; `consistency-check` runs the contradiction test between a *proposed* ruling and the retrieved set.
- Boundary with board: board's skills produce rulings and already log them; this skill owns the schema, the tags, and retrieval. Board consumes the top-3 precedents at the start of each gate review.
