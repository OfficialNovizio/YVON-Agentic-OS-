---
name: frontend-performance
agent: mia
department: Engineering
version: 1.0.0
tier: 3
description: |
  Frontend performance degrades invisibly: each feature adds bundle weight, each library adds parse time, until the app is janky on the devices real users have (not the developer's laptop). (yvon)
triggers:
  - frontend performance
  - the app is slow/janky
  - core web vitals
  - lcp/inp/cls
  - bundle size
  - why is the page slow to load
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/mia/custom/frontend-performance/SKILL.md
  source_hash: ced0784bc243d416ac353e2212bfa416cc64779720c931bd0aa3250053d242de
  generated: 2026-07-20T03:20:22.698Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/mia/custom/frontend-performance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js mia -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: mia — Engineering · skill: frontend-performance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"frontend-performance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/mia/operational/agent/mia-config.md"
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

Triggers: "the app is slow/janky," "Core Web Vitals," "LCP/INP/CLS," "bundle size," "why is the page slow to load," a perf regression in monitoring, and rank flagging a Core Web Vitals SEO issue.

## Purpose

Frontend performance degrades invisibly: each feature adds bundle weight, each library adds parse time, until the app is janky on the devices real users have (not the developer's laptop). Slow frontends lose users and rank worse. Measured performance discipline catches the regression before users and search engines do.

## Protocol

```
A frontend performance question
  -> MEASURE (axiom's rule): Core Web Vitals under realistic conditions (throttled network/CPU, real devices)
     LCP (load) · INP (interactivity) · CLS (layout stability)
    -> Diagnose: bundle too big · render-blocking resources · unoptimized images · layout thrash ·
       excessive re-renders · unsplit code
      -> Fix at the right layer: code-split · lazy-load · image optimize · defer non-critical ·
         reduce re-renders · token-driven CSS (not duplicated styles)
        -> MEASURE AGAIN under the same conditions → keep measured wins, revert the rest
          -> Feed ops baselines + rank (Core Web Vitals are a shared signal)
```

## Boundaries & handoffs

→ frontend-performance (Core Web Vitals — shared signal with rank)
- "Slow / janky / Core Web Vitals / bundle size / LCP/INP/CLS" → **frontend-performance**.
- **ops**: frontend vitals baselines; regressions route to frontend-performance.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"frontend-performance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
