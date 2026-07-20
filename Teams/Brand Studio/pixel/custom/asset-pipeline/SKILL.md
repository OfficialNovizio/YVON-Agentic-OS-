---
name: asset-pipeline
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build)
based_on_catalog_entry: vyon-asset-pipeline (VYON_Skills_Catalog_Full_v2.html, pixel/Brand Studio) — renamed asset-pipeline, genericized per rule 0.4b; naming convention and delivery destinations become config
assigned_agent: pixel (Brand Studio / Production)
portable: true — brief formats, naming convention, and destinations are per-business config
date_added: 2026-07-07
---

## Introduction

asset-pipeline is pixel's batch production workflow: **brief → shot list → generate → QA against atlas's kit → name per convention → deliver.** It exists so volume production stays disciplined — forty assets get the same per-asset QA as one, every file is findable by name, and nothing reaches the requesting agent (or spark's gate) unchecked.

## Purpose

Production without pipeline discipline produces three failures: assets that drift off-kit under deadline pressure, files nobody can find or trace to their brief, and QA that gets skipped exactly when volume makes it matter most. The pipeline makes each step mechanical so the only creative judgment spent is where it belongs — in the generation itself.

## When to Use

Triggers: "produce assets," "batch images," "make the visuals for [campaign]," or any brief arriving from lena/pulse/rio/muse-developed concepts needing visual production.

## Structure / Protocol

```
Parse the brief into a SHOT LIST (one line per asset: subject, format/ratio, channel, style ref)
  -> Confirm the shot list with the requester before generating (cheap to fix here)
    -> Generate per shot (prompts via image-style-guide templates + content-image craft)
      -> QA each asset vs atlas's brand-guidelines audit (kit rules; auto-reject off-palette/off-style)
        -> Name per the configured convention; deliver to the configured destination
          -> Hand to the requester with the QA trail; spark's gate is downstream as always
```

## Instructions

### Phase 1 — Shot List

Parse the brief into one row per asset: subject (specific enough that two generations would look similar), aspect/format per channel, quantity, style reference (which image-style-guide template applies), and any copy overlay lena is supplying. Ambiguities get asked now — a wrong shot list is forty wrong assets. The requester confirms the list before generation.

### Phase 2 — Generate

Build prompts from the brand's image-style-guide templates (Phase 1 of that skill) plus content-image's four-component structure and variation discipline. Series consistency rules apply: same style ref, lighting direction, and treatment across a batch — a series that doesn't look like a series fails QA as a set even if each asset passes alone.

### Phase 3 — QA

Every asset runs atlas's brand-guidelines audit (palette tokens, type if text is set, imagery direction) plus the style-guide's reject rules. Failures regenerate or fix; nothing off-kit passes to naming. QA results attach per asset — the trail spark's gate consumes.

### Phase 4 — Name and Deliver

Names follow the configured convention (`naming_convention` in config — e.g., `[brand]-[campaign]-[channel]-[shot##]-[ratio]-[vN]`), applied without exception: an unfindable asset is a re-produced asset. Delivery to the configured destination, with the shot list + QA trail as the manifest.

## Output Format

```
## Production Run: [brief, one line] — [brand]

### Shot list (confirmed [date])
| # | Subject | Format | Channel | Style ref | Qty |

### Delivery manifest
| File (per convention) | Shot # | QA | Notes |

Requester: [agent] · Destination: [config] · Gate status: pending spark
```

## Principles

- **Confirm the shot list before generating.** The cheapest fix in the pipeline.
- **Every asset QAs; batches QA as sets too.** Series consistency is a rule, not a vibe.
- **Off-kit never passes to naming.** Regenerate or fix — the pipeline has no "close enough" state.
- **Names are law.** The convention applies to every file, every time.
- **Pixel produces; it doesn't approve.** Atlas's audit is the QA authority; spark's gate is the ship authority; pixel's job is making both easy.
- **AI-image policy is the kit's call.** If the brand kit's imagery section bans or restricts AI generation, the pipeline respects it and says so.

## Fallback

- No brand kit → atlas's own Phase-1 stop applies; production proceeds only as explicitly-labeled unaudited draft work, never delivered as final.
- No image-style-guide for the brand → build it first (its Phase 1) or run with content-image's generic craft, labeled accordingly.
- Generation tool unavailable → produce the shot list + finished prompts as the deliverable; the operator generates externally and returns assets for QA/naming.
- Brief demands what the kit forbids → the conflict routes to spark, same as any law collision.

## Boundaries with Other Skills

- `image-style-guide` (sibling) supplies the per-brand prompt templates and reject rules; `content-image` (sibling) supplies the model-agnostic prompt craft. This skill is the workflow around both.
- **atlas** owns the audit rules; pixel executes them per asset. **lena** supplies overlay copy (already voice-checked). **spark** gates everything downstream. **tempo** (when built) handles any audio pairing.
- Requesters (pulse/rio/lena/muse-concepts) own the brief's intent; pixel owns its faithful, on-kit execution.
