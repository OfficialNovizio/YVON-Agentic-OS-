---
name: dashboard-audit
agent: viz
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  Portfolio-scale dashboard audit. Flags: staleness · orphaned dashboards · duplicate purpose · non-standard chart types · a11y non-compliance · metric-registry drift. Runs quarterly per config. (yvon)
triggers:
  - dashboard audit
  - dashboard portfolio audit
  - audit our dashboards
  - stale dashboards
  - dashboard cleanup
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/viz/custom/dashboard-audit/SKILL.md
  source_hash: 198455362c59f06744a97db5eb212b2d79c819b3e31f36dc0f1fe7cf609e5245
  generated: 2026-08-08T16:41:44.143Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/viz/custom/dashboard-audit/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js viz -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: viz — Data & Analytics · skill: dashboard-audit"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"viz\",\"skill\":\"dashboard-audit\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Data & Analytics/viz/operational/agent/viz-config.md"
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

- "Dashboard portfolio audit" · "audit our dashboards" · "stale dashboards" · "dashboard cleanup"
- Quarterly cadence trigger.

## Purpose

Cross-dashboard audit surfacing: staleness · orphans (no one views) · duplicates (same metric, different dashboard) · standards non-compliance · a11y non-compliance · metric drift (dashboard shows deprecated metric definition).

## Protocol

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

## Boundaries & handoffs

- name: dashboard-audit
- {trigger: "portfolio audit", winner: dashboard-audit}

## Output format

Table: dashboard · owner · staleness · viewer count · standards pass · a11y pass · metric drift · verdict · recommended action.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"viz\",\"skill\":\"dashboard-audit\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
