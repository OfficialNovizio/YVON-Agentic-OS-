---
name: anomaly-detection-rules
agent: anomaly
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  Rule registry for metric-anomaly detection. Threshold-based · statistical (z-score · MAD) · pattern-based · trend-based. Per-metric configuration. Alerts route via alert-routing. (yvon)
triggers:
  - anomaly detection rules
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/anomaly/custom/anomaly-detection-rules/SKILL.md
  source_hash: 2dc4b9aa3c03f31734be48026d6f2c2ac6dea918e58c2b1868a4f77c77f7c033
  generated: 2026-08-08T16:41:44.175Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/anomaly/custom/anomaly-detection-rules/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js anomaly -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: anomaly — Data & Analytics · skill: anomaly-detection-rules"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anomaly\",\"skill\":\"anomaly-detection-rules\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Data & Analytics/anomaly/operational/agent/anomaly-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Register a new alert rule · list rules · tune thresholds · retire a rule.

Do NOT use for: firing/routing alerts (→ `alert-routing`) · investigating a fired alert (→ `incident-triage-data` or `insight/ad-hoc-analysis`).

## Purpose

Own the rules that determine when a metric value is anomalous. Rule types:
- **Threshold** — value crosses static high/low.
- **Statistical z-score** — value deviates > k standard deviations from trailing mean.
- **MAD** (Median Absolute Deviation) — robust alternative for skewed distributions.
- **Pattern** — day-of-week / seasonality-aware deviation.
- **Trend** — slope change (Bayesian change-point).

## Protocol

```
REGISTER  new rule → metric + type + threshold/parameters + severity
UPDATE    threshold tuning → bump revision
RETIRE    rule no longer applicable
LIST      by metric / by owner / by severity
TEST      backtest rule against historical data before activation
```

## Boundaries & handoffs

- name: anomaly-detection-rules
- {trigger: "anomaly rule", winner: anomaly-detection-rules}

## Output format

Rule registration confirmation + backtest result (fires-per-day-hist).

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anomaly\",\"skill\":\"anomaly-detection-rules\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
