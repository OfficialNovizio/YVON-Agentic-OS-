---
name: dashboard-standards
agent: viz
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  Dashboard authoring standards — chart types by data shape, colour palette, layout grid, delta notation, accessibility floor. Enforced on every dashboard produced by exec-dashboard + ad-hoc-analysis + business-pulse. (yvon)
triggers:
  - dashboard standards
  - dashboard standard
  - chart type for x
  - colour palette
  - which chart for this data
  - make me a chart
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/viz/custom/dashboard-standards/SKILL.md
  source_hash: 0769b2c4cc4f1f587276c5d1fa16c04b6363f56d2c594db5dcd70302714a0348
  generated: 2026-08-08T16:41:44.146Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/viz/custom/dashboard-standards/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js viz -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: viz — Data & Analytics · skill: dashboard-standards"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"viz\",\"skill\":\"dashboard-standards\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Dashboard standard" · "chart type for X" · "colour palette" · "which chart for this data"
- Before building any dashboard; ambiguous "make me a chart" → route here first for shape decision.

Do NOT use for: dashboard build (→ `exec-dashboard`) · viz accessibility deep-audit (→ `viz-accessibility`) · dashboard portfolio audit (→ `dashboard-audit`).

## Purpose

Own the canonical dashboard style guide: chart type by data shape (Cleveland/Few discipline), colour palette (WCAG-compliant), layout grid, delta notation, accessibility floor.

## Protocol

```
LOOKUP    data shape (categorical / ordinal / continuous / time-series / geo / relational) → chart type recommendation
PALETTE   return WCAG-compliant palette (colour-blind-safe)
LAYOUT    return grid template (1-widget / 2-widget / 4-widget / detail)
DELTA     return delta notation rules
REVIEW    audit a proposed dashboard against the standard
```

## Boundaries & handoffs

- {name: dashboard-standards, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
- {trigger: "chart type", winner: dashboard-standards}

## Output format

Recommendation table or audit-findings list.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"viz\",\"skill\":\"dashboard-standards\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
