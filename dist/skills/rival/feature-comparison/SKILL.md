---
name: feature-comparison
agent: rival
department: Market Intelligence
version: 1.0.0
tier: 3
description: |
  Feature-by-feature comparison matrix — us vs 2-5 competitors. Sources: public docs · demos · reviews. Never inflates our column; never invents theirs. Feeds sales enablement + product prioritisation. (yvon)
triggers:
  - feature comparison
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Market Intelligence/rival/custom/feature-comparison/SKILL.md
  source_hash: f5ebdfc3d03ca24116a5aacadf248ca54cb815e80bfe1e42970036fece28b8e3
  generated: 2026-08-08T16:51:52.757Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Market Intelligence/rival/custom/feature-comparison/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js rival -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: rival — Market Intelligence · skill: feature-comparison"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rival\",\"skill\":\"feature-comparison\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Market Intelligence/rival/operational/agent/rival-config.md"
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

- Sales enablement (compete deck)
- Product prioritisation (gap analysis)
- Positioning

Do NOT use for: pricing comparison (→ `pricing-intel`) · overall category positioning (→ `scope/landscape-map`).

## Purpose

Structured feature matrix. Rows: features (operator-declared list). Columns: us + 2-5 competitors. Cells: yes / no / partial / unknown with citation.

## Protocol

```
1. FEATURES  operator supplies feature list (or last-review list)
2. COMPETITORS operator selects from competitor-tracking
3. RESEARCH  per (feature × competitor): public docs / demo videos / review sites
4. FILL      yes / no / partial / unknown with source citation
5. GAP       our-no + all-others-yes → gap flag
6. RETURN    matrix + gap summary
```

## Boundaries & handoffs

- name: feature-comparison
- {trigger: "feature comparison", winner: feature-comparison}

## Output format

Matrix (rendered via viz) + gap summary + citations.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rival\",\"skill\":\"feature-comparison\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
