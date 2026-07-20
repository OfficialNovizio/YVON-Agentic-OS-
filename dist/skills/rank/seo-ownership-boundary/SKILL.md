---
name: seo-ownership-boundary
agent: rank
department: Engineering
version: 1.0.0
tier: 3
description: |
  Without an explicit boundary, SEO becomes a turf war or a vacuum: kai sets keyword targets rank ignores, or rank makes canonical decisions that undercut kai's strategy, or a Core Web Vitals number gets reported two different ways. (yvon)
triggers:
  - seo ownership boundary
  - who owns this
  - is this rank or kai
allowed-tools:
  - <FILL_IN: not listed in rank-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/rank/custom/seo-ownership-boundary/SKILL.md
  source_hash: 501cba71e84f6c6ead4002f42d12f9c5617df386950c4467ba76ccae99b543e9
  generated: 2026-07-20T03:20:22.958Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/rank/custom/seo-ownership-boundary/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js rank -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: rank — Engineering · skill: seo-ownership-boundary"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rank\",\"skill\":\"seo-ownership-boundary\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/rank/operational/agent/rank-config.md"
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

Triggers: any SEO task at the outset (to route it), "who owns this," "is this rank or kai," a Core Web Vitals question (shared signal), and any moment strategy and execution blur.

## Purpose

Without an explicit boundary, SEO becomes a turf war or a vacuum: kai sets keyword targets rank ignores, or rank makes canonical decisions that undercut kai's strategy, or a Core Web Vitals number gets reported two different ways. The boundary makes ownership unambiguous, so handoffs are clean and neither the strategy nor the execution falls through.

## Protocol

```
An SEO task arrives
  -> STRATEGY / MEASUREMENT (kai): keyword targets · content strategy · what to rank for ·
     traffic/ranking measurement · ROI · reporting to the business · the scorecard §6
  -> TECHNICAL EXECUTION (rank): crawlability · indexability · canonicals · sitemaps · schema ·
     GEO markup · rendering · technical Core Web Vitals fixes · the claude-seo plugin
  -> SHARED SIGNALS (explicit handoff): Core Web Vitals (mia makes good, rank frames as SEO,
     kai measures as outcome) · GEO (rank markup, kai+lena content/strategy)
    -> Route to the owner; cross-boundary tasks get a brief, not a takeover
```

## Boundaries & handoffs

- Any SEO task → **seo-ownership-boundary** first (rank vs kai). Strategy → hand to kai with a brief.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rank\",\"skill\":\"seo-ownership-boundary\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
