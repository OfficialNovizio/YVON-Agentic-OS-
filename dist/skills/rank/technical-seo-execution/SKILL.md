---
name: technical-seo-execution
agent: rank
department: Engineering
version: 1.0.0
tier: 3
description: |
  The best content ranks nowhere if search engines can't crawl it, index the wrong version, or hit a wall of 404s and redirect chains. (yvon)
triggers:
  - technical seo execution
  - technical seo
  - why isn't this indexed
  - crawlability
  - canonical
  - sitemap
  - robots.txt
  - redirect
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/rank/custom/technical-seo-execution/SKILL.md
  source_hash: fd61bc8710041c3d3d851ec17b48aa4bba62254d1d9ae9822d4adb3d0a8b0c81
  generated: 2026-07-20T03:20:22.965Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/rank/custom/technical-seo-execution/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js rank -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: rank — Engineering · skill: technical-seo-execution"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rank\",\"skill\":\"technical-seo-execution\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "technical SEO," "why isn't this indexed," "crawlability," "canonical," "sitemap," "robots.txt," "redirect," "status codes," "rendering / JS SEO," "mobile SEO," and any technical ranking-foundation issue.

## Purpose

The best content ranks nowhere if search engines can't crawl it, index the wrong version, or hit a wall of 404s and redirect chains. Technical SEO is the plumbing — invisible when it works, catastrophic when it doesn't (a `noindex` shipped to production tanks a whole site). rank keeps the plumbing sound so kai's strategy and lena's content can actually rank.

## Protocol

```
A technical SEO task
  -> CRAWLABILITY: robots.txt correct · no accidental blocks · crawl budget sane · internal linking
  -> INDEXABILITY: canonical tags · no accidental noindex · correct indexation status
  -> SITEMAPS: accurate XML sitemap · submitted · matches indexable reality
  -> STATUS & REDIRECTS: right codes (200/301/404/410) · no redirect chains/loops · fix soft-404s
  -> RENDERING: content renders for crawlers (JS/SSR) — the mia/frontend seam
  -> MOBILE + CWV: mobile-first ready · Core Web Vitals (INP) — shared signal with mia
    -> Findings → implementation via mia (frontend) / raj (server) → dev review → quinn gate
       (rank diagnoses + specs the fix; it doesn't silently edit production)
```

## Boundaries & handoffs

- "Crawl / index / canonical / sitemap / redirect / rendering" → **technical-seo-execution**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rank\",\"skill\":\"technical-seo-execution\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
