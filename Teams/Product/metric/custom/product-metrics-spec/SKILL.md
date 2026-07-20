---
name: product-metrics-spec
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-product-metrics-spec (prefix stripped; per-product taxonomy moved to product profiles; "river pipelines" sync deferred to a stated interface — that agent's dept is unbuilt)
assigned_agent: metric (Product / Product Analytics)
portable: true
date_added: 2026-07-10
---

# Product Metrics Spec

## Introduction
The single source of metric truth per product: the event taxonomy and the versioned definitions of activation, retention, engagement, and the north-star metric. Everyone who says "activation" means this file's current version, or they're wrong.

## Purpose
Two dashboards with two "activation" definitions produce two confident, contradictory decisions. One versioned spec makes every number traceable to a definition and every definition change visible.

## When to Use
- A product needs its metric truth established or extended (new events, new definitions).
- Anyone cites a metric in a PRD, report, or experiment (the definition reference point).
- A definition needs changing (→ metrics-governance path).

## Structure / Protocol
TAXONOMY (per product `<FILL_IN: product profile>`: events named `object_action`, each with properties, trigger moment, and owner surface — web/app/api) → DEFINITIONS (activation, retention windows, engagement, NSM — each a precise computable statement over taxonomy events, versioned `vN` with date) → PUBLISH (the spec is a readable file; consumers cite `metric:activation@v3`) → INTERFACE (definitions export in a stated format for the data layer and kai's dashboards — binding to the Data & Analytics dept's pipelines happens when that dept exists; the interface is this file's export, stable regardless).

## Instructions
1. Every definition is computable from named events — "users who love the product" is not a definition; "≥N `<FILL_IN>` core actions within 7 days of signup" is.
2. Versioning is mandatory: changed definitions get new versions; old versions stay readable (trend continuity depends on knowing which version a historical number used).
3. Consumers cite versions: a PRD's success metric, loom's experiment measures, gauge-style reads — all pin `@vN`. Unpinned citations bounce.
4. The taxonomy resists sprawl: new events need a consumer named at proposal time ("who reads this?") — write-only events are clutter with storage costs.
5. Definition changes are never applied here directly — they route through metrics-governance (proposal, impact, version bump).

## Output Format
The per-product spec file: taxonomy table + versioned definitions block + export interface stanza. Citation format: `metric:<name>@vN`.

## Principles
- Computable or it isn't a definition; versioned or it isn't citable.
- One truth per product; consumers pin versions.
- Events earn their place by being read.

## Fallback
Pre-instrumentation product (no events flowing yet)? The spec is still written FIRST — definitions drive instrumentation, not the reverse. Reads are `MISSING` until pipes exist (gauge's honest-missing pattern).

## Boundaries with Other Skills
- metrics-governance owns changes; funnel-instrumentation and experiment-instrumentation implement against this spec.
- kai (Brand Studio) owns campaign/brand analytics — attribution is kai's, in-product behavior is metric's; shared reads cite the owner's number.
- The future Data & Analytics dept binds the export interface; until then it's a versioned file.
