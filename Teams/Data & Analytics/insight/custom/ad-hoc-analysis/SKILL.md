---
name: ad-hoc-analysis
type: custom
status: built from scratch
assigned_agent: insight (Data & Analytics / BI Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "One-off analytical questions — pull, transform, chart, narrate. Uses canonical metrics from metric-definitions-registry. Tukey EDA discipline: descriptive first, inferential second, causal third. Every claim traces to a query."
triggers:
  - analyze this
  - what does the data say about X
  - one-off analysis
  - can you look at Y
  - deep-dive on Z
  - EDA on this dataset
---

# Ad-Hoc Analysis

## Introduction

Built 2026-07-29 as insight's one-off analytical skill. Not the dashboard (that's `exec-dashboard`) — the specific question that arises once. Tukey's EDA discipline: descriptive before inferential before causal.

## Purpose

Answer a specific analytical question with real data, using canonical metrics, in a form the operator can trust and repeat.

## When to Use

- One-off question: "why did X spike last Tuesday" · "what does the data say about Y" · "deep-dive on Z"
- Pre-dashboard exploration to figure out what to actually put on the dashboard.

Do NOT use for: recurring dashboards (→ `exec-dashboard`) · metric definitions (→ `metric-definitions-registry`) · anomaly alerts (→ `anomaly`).

## Structure / Protocol

```
1. QUESTION    reframe operator's question into a precise data question
2. DEFINE      identify metrics + filters; reference canonical definitions
3. QUERY       write / route the SQL via query agent; return dataset
4. DESCRIBE    Tukey EDA — 5-number summary + histogram + outliers, before inference
5. INFER       only if question requires it; state uncertainty
6. NARRATE     plain-language finding + numbers + delta + caveat
```

## Instructions

### Step 1: Reframe
Operator asks vaguely ("why did revenue drop"); ask 1-2 sharpening questions ("which venture, which product, which period, vs what baseline?"); do not guess.

### Step 2: Define
Every metric used → canonical definition from `metric-definitions-registry`. If a metric doesn't exist there, register it first.

### Step 3: Query
Route SQL through `query`; do not write raw SQL in this skill (query owns the warehouse).

### Step 4: Describe (Tukey EDA)
Before any inference: 5-number summary (min · Q1 · median · Q3 · max), distribution shape, outliers. Look before conclude.

### Step 5: Infer
Only if the question requires it. State null hypothesis, effect size, uncertainty. Never conclude causation from correlation without an intervention.

### Step 6: Narrate
Plain-language finding with numbers + delta + provenance tag on every citation.

## Output Format

Bottom-line answer → numbers behind it → EDA (visual/tabular) → uncertainty note → caveats.

## Principles

- **Descriptive before inferential before causal** (Tukey).
- **Canonical metrics only** — never re-define on the fly.
- **State uncertainty explicitly** — no false precision.
- **Never claim causation from correlation.**
- **Every number has provenance** — `[query X]` `[warehouse Y snapshot Z]`.
- **When the data doesn't answer the question, say so** — do not force a narrative.

## Fallback

| Failure | Response |
|---|---|
| Metric not in registry | Register first via `metric-definitions-registry` |
| Warehouse query timeout | Route to `query`; block until resolved |
| Data insufficient for inference | Descriptive-only output; flag inference-not-possible |

## Boundaries

- `metric-definitions-registry` (this agent) — canonical definitions.
- `exec-dashboard` (this agent) — recurring; ad-hoc feeds hypothesis for what to add.
- `query` (D&A) — warehouse queries owned there.
- `viz` (D&A) — chart production if needed.
- `anomaly` (D&A) — anomaly investigation may originate here or route back to anomaly.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration (technical, not permission)

| Skill | Required | Optional | Source line |
|---|---|---|---|
| ad-hoc-analysis | File read (metrics registry) · Data query routing | File write (report export) | Steps 2-3 |
