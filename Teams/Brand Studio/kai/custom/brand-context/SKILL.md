---
name: brand-context
type: custom
status: built from scratch — the deliberate COLLAPSE of two hardcoded catalog skills into one generic pattern, per the Brand Studio v2/v3 discussion (2026-07-07)
based_on_catalog_entries: brands-novizio + brands-hourbour (VYON_Skills_Catalog_Full_v2.html, kai/Brand Studio) — the originals were entire skills made of one venture's facts (audience, positioning, KPI baselines); per rule 0.4b those become operator-supplied brand-context FILES, and this skill is the process that builds, loads, and maintains them
assigned_agent: kai (Brand Studio / Analyst)
portable: true — the pattern's whole point; any number of brands, each with its own context file
includes: assets/brand-context-template.md
date_added: 2026-07-07
---

## Introduction

brand-context is kai's ground-truth layer: one maintained file per brand holding the *analytical* facts — audience definition, positioning, business model mechanics, KPI baselines with dates, seasonality notes — that every analysis loads before answering anything. It is the blueprint's context/ pattern applied to analytics: answer from documented baselines, update them on cadence, and never let "what's normal for this brand" live only in memory.

## Purpose

Analysis without documented baselines produces confident nonsense: a "traffic spike" that's just seasonality, a "CAC problem" measured against a number nobody wrote down, comparisons across brands with different models. The context file makes every kai answer auditable — *this* number, against *that* documented baseline, as of *this* date.

## When to Use

Triggers: "[brand] performance," "[brand] audience," "what's normal for [brand]," creating/updating a brand's context file — and automatically as the load step of every kai analysis (dashboards, funnels handed to nate, SEO context).

## Structure / Protocol

```
Load the brand's context file (config path)
  -> If none: BUILD it with the operator (template; real facts + instrumented baselines only)
    -> Answer analyses FROM documented baselines (cited, dated)
      -> Monthly baseline refresh: instrumented actuals in, stale entries re-dated,
         changes logged (append-only)
        -> Contradictions (file vs live data) flagged to the operator — the audit habit
```

## Instructions

### Phase 1 — Build (once per brand)

With the operator, from real sources: audience (who actually buys — from data/interviews, not aspiration), positioning (one paragraph, consistent with weave's arc and echo's narrative — contradictions between the three are a finding), model mechanics (how money actually flows: AOV, purchase frequency, margin shape — operator-supplied), KPI baselines (only instrumented numbers, each dated with its source), seasonality/context notes. **No invented baselines**: an unmeasured KPI is listed as "not yet instrumented," routed to the instrumentation queue.

### Phase 2 — Load and Answer

Every kai analysis opens the relevant context file and answers against it: "signups are 22% over the documented baseline (340/wk, as of June)" — never bare numbers against remembered normals. Multi-brand operators get per-brand answers; cross-brand comparisons state the model differences before comparing anything.

### Phase 3 — Maintain

Monthly (config cadence): actuals refresh the baselines (old value → new value, logged append-only), stale entries (older than the cadence) get re-confirmed or flagged, and file-vs-reality contradictions escalate to the operator — the blueprint's contradiction-audit habit, applied to the numbers layer.

## Output Format

Analyses cite: `[metric]: [value] vs baseline [value] ([date], [source]) — [delta]`. The file itself follows `assets/brand-context-template.md`.

## Principles

- **Documented baselines or "not yet instrumented" — never remembered normals.**
- **Every baseline carries its date and source.** Undated numbers are expired (the system-wide dating rule).
- **One file per brand; comparisons state model differences first.**
- **Positioning consistency is tripartite** — this file, weave's arc, echo's narrative must not contradict; drift between them is a finding for the operator.
- **Append-only updates; contradictions escalate.**

## Fallback

- No context file + urgent analysis → answer from supplied data only, labeled "no baseline context — deltas unavailable," and start the build.
- Baselines stale beyond cadence → answers flag the staleness explicitly.
- Instrumentation gaps → routed to the instrumentation queue (kai's own), never guessed around.

## Boundaries with Other Skills

- `marketing-dashboards` (sibling) consumes baselines for its red/green calls; `seo-strategist` (sibling) uses audience/positioning for intent work; **nate's** funnel-analysis reads baselines as its Step-1 context.
- **atlas/lena/weave** own identity/voice/story definitions — this file holds their *analytical shadow* (who buys, what's claimed), not the definitions themselves.
- **echo** consumes baselines for investor updates (facts identical, framing echo's).
- **The instrumentation queue is kai's**, fed by every agent's blocked-measurement needs.
