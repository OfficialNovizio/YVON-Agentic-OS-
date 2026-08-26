---
name: exec-dashboard
type: custom
status: built from scratch
assigned_agent: insight (Data & Analytics / BI Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Executive-level recurring dashboards — weekly/monthly/quarterly cadence. Uses canonical metric definitions; every widget cites its metric name. Refresh cadence per config; alert if refresh fails."
triggers:
  - executive dashboard
  - weekly dashboard
  - monthly business review dashboard
  - MBR deck
  - dashboard refresh
  - board deck data
  - refresh the dashboard
---

# Executive Dashboard

## Introduction

Built 2026-07-29 as insight's recurring executive-view skill. Where `business-pulse` is a one-page ad-hoc snapshot and `ad-hoc-analysis` is one-off, this skill owns the recurring cadence dashboards (weekly / monthly / quarterly).

## Purpose

Standing dashboards for executive review — cadence-driven, canonical-metric-driven, alert-on-refresh-failure.

## When to Use

- Executive weekly/monthly/quarterly dashboard requests.
- Board deck data pull.
- Refresh cadence trigger.

Do NOT use for: SMB-style one-page pulse (→ `business-pulse` marketplace) · one-off deep-dives (→ `ad-hoc-analysis`) · dashboard design/build (→ `viz`).

## Structure / Protocol

```
1. LOAD    dashboard spec from operational/agent/insight-config.md (per cadence)
2. PULL    query each widget's metric via query agent + canonical definition
3. BUILD   compose the dashboard (routed to viz for rendering if configured)
4. ALERT   if refresh fails on any widget, flag; do not silently omit
5. DELIVER by cadence: chat summary + persistent link
```

## Instructions

### Step 1: Load spec
Read dashboard spec from `insight-config.md`:  widget name · canonical metric ref · chart type · comparison period.

### Step 2: Pull
For each widget, resolve canonical definition → route SQL to `query` → return timestamped result.

### Step 3: Build
If `viz` is configured, hand off widget data + spec; else return a tabular composition.

### Step 4: Alert
Failed widget → flag by name + why; refuse to silently omit.

### Step 5: Deliver
Executive chat summary (top-line numbers + top 3 flags) + link to full dashboard.

## Output Format

Executive summary: headline metric · delta · flag count · top 3 flags. Full dashboard: standard multi-widget layout per spec.

## Principles

- **Canonical metrics only.**
- **Refresh failures flag, never silently omit** — a missing widget is a signal.
- **Cadence discipline** — weekly runs weekly; do not skip.
- **Every widget links to its query** — auditable.
- **Delta comparison mandatory** — no absolute-only widgets.

## Fallback

| Failure | Response |
|---|---|
| Widget metric not in registry | Register first |
| Query timeout on widget | Flag; do not silently omit |
| Dashboard spec missing | Bounce; require operator declare in config |

## Boundaries

- `metric-definitions-registry` (this agent) — canonical definitions.
- `ad-hoc-analysis` (this agent) — one-off; feeds hypothesis for what to add.
- `query` (D&A) — warehouse queries.
- `viz` (D&A) — rendering.
- `anomaly` (D&A) — anomaly alerts surface here if widget crosses threshold.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration (technical, not permission)

| Skill | Required | Optional | Source line |
|---|---|---|---|
| exec-dashboard | File read (config, metrics) · Data query routing · File write (persistent dashboard) | BI tool MCP (Tableau, Looker, Metabase) | Steps 1-5 |
