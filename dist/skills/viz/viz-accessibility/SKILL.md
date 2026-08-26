---
name: viz-accessibility
agent: viz
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  WCAG-compliance audit for dashboards + charts. Contrast · alt-text · keyboard navigation · screen-reader compatibility · colour-blind simulation. Every dashboard must pass floor level before shipping. (yvon)
triggers:
  - viz accessibility
  - accessibility audit
  - wcag check
  - a11y review
  - colour blind check
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/viz/custom/viz-accessibility/SKILL.md
  source_hash: 51237217112fd822c4d0b8e813fdbe63c608a8a5ee41765c343ab9e08d7a5487
  generated: 2026-08-08T16:41:44.148Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/viz/custom/viz-accessibility/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js viz -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: viz — Data & Analytics · skill: viz-accessibility"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"viz\",\"skill\":\"viz-accessibility\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Accessibility audit" · "WCAG check" · "a11y review" · "colour blind check"
- Pre-ship gate for any dashboard produced downstream.

## Purpose

Audit dashboards + charts for accessibility floor: contrast ratio · alt-text · keyboard-navigability · screen-reader label · colour-blind-safe.

## Protocol

```
1. INTAKE      dashboard / chart URL or file
2. CONTRAST    computes contrast ratios; flag < 4.5:1 (WCAG AA)
3. ALT         checks every visual element has alt-text
4. KEYBOARD    verify all interactions keyboard-reachable
5. SCREEN      screen-reader label check
6. COLOURBLIND simulate deuteranopia / protanopia / tritanopia
7. REPORT      per-issue fix + severity
```

## Boundaries & handoffs

- {name: viz-accessibility, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
- {trigger: "a11y", winner: viz-accessibility}

## Output format

Per-dashboard audit report + pass/fail verdict + fixes.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"viz\",\"skill\":\"viz-accessibility\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
