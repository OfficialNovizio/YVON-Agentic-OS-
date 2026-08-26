---
name: dataset-lineage
type: custom
status: built from scratch
assigned_agent: query (Data & Analytics / Query & Warehouse)
portable: true
date_added: 2026-07-29
tier: 3
description: "Trace dataset lineage — source pipelines (dana) → warehouse datasets (catalog) → downstream consumers (metrics registry + dashboards + reports). When a source changes, surface every downstream impact."
triggers:
  - lineage for X
  - what consumes X
  - what feeds X
  - impact of changing dataset Y
  - upstream of Z
  - downstream of W
---

# Dataset Lineage

## Introduction
Built 2026-07-29. When `dana` changes a pipeline or `warehouse-catalog` retires a dataset, someone needs to know every downstream consumer. This skill traces both directions.

## Purpose
Given a dataset, return upstream (source pipeline + upstream datasets) and downstream (metrics + dashboards + reports + saved queries consuming it).

## When to Use
- Impact analysis before schema change / pipeline change / dataset retirement.
- Debug: "why did this dashboard number change" → lineage points to upstream shift.

Do NOT use for: dataset registration (→ `warehouse-catalog`) · query execution (→ `sql-optimization`).

## Structure / Protocol
```
1. INPUT     dataset name or metric slug or dashboard name
2. UPSTREAM  walk backward: catalog → pipeline → source
3. DOWNSTREAM walk forward: catalog → metrics → dashboards → reports
4. RETURN    lineage tree with dependency count + change-impact summary
```

## Instructions
### Step 1: Input
Accept dataset name (from catalog), metric slug (from insight registry), or dashboard name.

### Step 2: Upstream
Read `warehouse-catalog` → `source_pipeline` → `dana` pipeline definition → source system (external API / operational DB / uploaded file).

### Step 3: Downstream
Scan `metric-definitions-registry` for `query_ref` matching this dataset. Scan `exec-dashboard` widget specs. Scan saved-query registry.

### Step 4: Return
Tree structure + counts + one-liner change-impact ("Changing schema of X affects 4 metrics, 3 dashboards, 12 saved queries").

## Output Format
Lineage tree (indented text or graph if `viz` available) + impact summary.

## Principles
- **Complete lineage or explicit gap.** If a downstream consumer isn't tracked, flag it.
- **Never guess a dependency.** Only registered consumers.
- **Change impact = enumerated list**, not "some dashboards may break".
- **Provenance:** `[warehouse-catalog]` `[metric-definitions-registry]` `[dashboard spec Y]`.

## Fallback
| Failure | Response |
|---|---|
| Dataset not in catalog | Halt; register first |
| Downstream registry unreachable | Report partial lineage; flag gap |

## Boundaries
- `warehouse-catalog` (this agent) — upstream side.
- `insight/metric-definitions-registry` (D&A) — downstream side.
- `insight/exec-dashboard` (D&A) — downstream side.
- `dana` (Engineering) — upstream pipeline definitions.
- `viz` (D&A) — optional lineage-graph rendering.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| dataset-lineage | File read (catalog · registry · dashboard specs) | Graph rendering (via viz) | All steps |
