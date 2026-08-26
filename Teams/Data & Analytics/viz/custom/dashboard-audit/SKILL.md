---
name: dashboard-audit
type: custom
status: built from scratch
assigned_agent: viz (Data & Analytics / Visualisation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Portfolio-scale dashboard audit. Flags: staleness · orphaned dashboards · duplicate purpose · non-standard chart types · a11y non-compliance · metric-registry drift. Runs quarterly per config."
triggers:
  - dashboard portfolio audit
  - audit our dashboards
  - stale dashboards
  - duplicate dashboards
  - dashboard cleanup
  - viz portfolio review
---

# Dashboard Audit

## Introduction
Built 2026-07-29 as viz's portfolio-audit skill. Dashboards accrete; someone has to prune. Quarterly (or per-config) portfolio review.

## Purpose
Cross-dashboard audit surfacing: staleness · orphans (no one views) · duplicates (same metric, different dashboard) · standards non-compliance · a11y non-compliance · metric drift (dashboard shows deprecated metric definition).

## When to Use
- "Dashboard portfolio audit" · "audit our dashboards" · "stale dashboards" · "dashboard cleanup"
- Quarterly cadence trigger.

## Structure / Protocol
```
1. INVENTORY   list every dashboard in scope
2. STALENESS   last-refresh + last-viewed
3. ORPHAN      unique viewers in trailing 90 days
4. DUPLICATE   dashboards sharing > 50% of widgets
5. STANDARDS   route each to dashboard-standards review mode
6. A11Y        route each to viz-accessibility
7. DRIFT       check metric names against current registry
8. REPORT      per-dashboard verdict + recommended action
```

## Instructions
Verdicts per dashboard: keep · retire · consolidate-with-X · needs-fix (with list).

Consolidation always requires operator sign-off, never auto-retire.

## Output Format
Table: dashboard · owner · staleness · viewer count · standards pass · a11y pass · metric drift · verdict · recommended action.

## Principles
- **Never auto-retire.** Operator + owner sign off.
- **Duplicates surface for consolidation**, not deletion.
- **Metric drift = block.** A dashboard on a deprecated metric is a defect.
- **Staleness threshold from config.**
- **Complete inventory or explicit gap.**

## Fallback
| Failure | Response |
|---|---|
| BI tool inventory unreachable | Partial audit; flag gap |
| Owner unknown | Route to insight for assignment |

## Boundaries
- `dashboard-standards` (this agent) — per-dashboard standards check.
- `viz-accessibility` (this agent) — per-dashboard a11y check.
- `insight/metric-definitions-registry` (D&A) — metric drift source.
- `board` — L3 for systemic non-compliance.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| dashboard-audit | File read (dashboard inventory · registry) · File write (audit report) | BI tool MCP for inventory + view counts | All steps |
