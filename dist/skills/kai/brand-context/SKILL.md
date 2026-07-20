---
name: brand-context
agent: kai
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Analysis without documented baselines produces confident nonsense: a "traffic spike" that's just seasonality, a "CAC problem" measured against a number nobody wrote down, comparisons across brands with different models. (yvon)
triggers:
  - brand context
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/kai/custom/brand-context/SKILL.md
  source_hash: 8fb18f219f8193cbc030e324ff24636404e63cdbc0ead59c39b7a2003afd3923
  generated: 2026-07-20T03:20:23.570Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/kai/custom/brand-context/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js kai -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: kai — Brand Studio · skill: brand-context"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"kai\",\"skill\":\"brand-context\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/kai/operational/agent/kai-config.md"
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

Triggers: "[brand] performance," "[brand] audience," "what's normal for [brand]," creating/updating a brand's context file — and automatically as the load step of every kai analysis (dashboards, funnels handed to nate, SEO context).

## Purpose

Analysis without documented baselines produces confident nonsense: a "traffic spike" that's just seasonality, a "CAC problem" measured against a number nobody wrote down, comparisons across brands with different models. The context file makes every kai answer auditable — *this* number, against *that* documented baseline, as of *this* date.

## Protocol

```
Load the brand's context file (config path)
  -> If none: BUILD it with the operator (template; real facts + instrumented baselines only)
    -> Answer analyses FROM documented baselines (cited, dated)
      -> Monthly baseline refresh: instrumented actuals in, stale entries re-dated,
         changes logged (append-only)
        -> Contradictions (file vs live data) flagged to the operator — the audit habit
```

## Boundaries & handoffs

"How are we doing" → scorecard. "What's normal / who's our audience" → brand-context. "Rank/traffic/content gap" → seo-strategist. Ambiguous → grade, ground, or search?
No connectors → operator exports, as-of dated. No baselines → value-only outputs, labeled, while brand-context builds. Unmeasurable → the queue, never a guess.

## Output format

Analyses cite: `[metric]: [value] vs baseline [value] ([date], [source]) — [delta]`. The file itself follows `assets/brand-context-template.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"kai\",\"skill\":\"brand-context\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
