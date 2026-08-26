---
name: anomaly-detection-rules
type: custom
status: built from scratch
assigned_agent: anomaly (Data & Analytics / Anomaly Detection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Rule registry for metric-anomaly detection. Threshold-based · statistical (z-score · MAD) · pattern-based · trend-based. Per-metric configuration. Alerts route via alert-routing."
triggers:
  - anomaly rule
  - set an alert on X
  - register anomaly rule
  - list anomaly rules
  - anomaly threshold for X
  - drift alert
---

# Anomaly Detection Rules

## Purpose
Own the rules that determine when a metric value is anomalous. Rule types:
- **Threshold** — value crosses static high/low.
- **Statistical z-score** — value deviates > k standard deviations from trailing mean.
- **MAD** (Median Absolute Deviation) — robust alternative for skewed distributions.
- **Pattern** — day-of-week / seasonality-aware deviation.
- **Trend** — slope change (Bayesian change-point).

## When to Use
- Register a new alert rule · list rules · tune thresholds · retire a rule.

Do NOT use for: firing/routing alerts (→ `alert-routing`) · investigating a fired alert (→ `incident-triage-data` or `insight/ad-hoc-analysis`).

## Structure / Protocol
```
REGISTER  new rule → metric + type + threshold/parameters + severity
UPDATE    threshold tuning → bump revision
RETIRE    rule no longer applicable
LIST      by metric / by owner / by severity
TEST      backtest rule against historical data before activation
```

## Instructions
Register fields: `rule_slug`, `metric` (from `insight/metric-definitions-registry`), `rule_type`, `parameters` (thresholds/k/window), `severity` (info/warning/critical), `route_to` (agent/team via `alert-routing`), `cooldown` (min gap between fires).

Backtest before activation — verify no > `<config-per-day>` fires per historical day (avoid alert fatigue).

## Output Format
Rule registration confirmation + backtest result (fires-per-day-hist).

## Principles
- **Every rule references a canonical metric.**
- **Backtest before activation.**
- **Robust methods (MAD) for skewed data.** Not blanket z-score.
- **Cooldown mandatory.** No alert every minute.
- **Never delete rule history.**

## Fallback
| Failure | Response |
|---|---|
| Metric not in registry | Halt; register first |
| Backtest fires > config/day threshold | Refuse activation; tune first |

## Boundaries
- `alert-routing` (this agent) — where the alert goes.
- `incident-triage-data` (this agent) — investigation post-fire.
- `insight` (D&A) — metric registry source.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| anomaly-detection-rules | File read/write · Historical data query | Statistical library | All steps |
