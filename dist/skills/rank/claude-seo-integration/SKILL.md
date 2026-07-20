---
name: claude-seo-integration
agent: rank
department: Engineering
version: 1.0.0
tier: 3
description: |
  Reimplementing a mature 25-skill SEO toolkit would be wasteful and worse — the plugin is actively maintained and covers GEO, schema, local, i18n, backlinks, and Core Web Vitals with current… (yvon)
triggers:
  - claude seo integration
  - seo audit
  - run the seo tools
  - technical seo scan
  - schema check
  - geo / ai overviews
  - sitemap analysis
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/rank/custom/claude-seo-integration/SKILL.md
  source_hash: 5a493f33b691de3a5d1f86c273480d0ae98a8dd4aac92d8427c382ba5dc001ab
  generated: 2026-07-20T03:20:22.954Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/rank/custom/claude-seo-integration/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js rank -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: rank — Engineering · skill: claude-seo-integration"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rank\",\"skill\":\"claude-seo-integration\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "SEO audit," "run the SEO tools," "technical SEO scan," "schema check," "GEO / AI Overviews," "sitemap analysis," and any task the plugin's commands cover — filtered through rank's boundary (execution, not strategy).

## Purpose

Reimplementing a mature 25-skill SEO toolkit would be wasteful and worse — the plugin is actively maintained and covers GEO, schema, local, i18n, backlinks, and Core Web Vitals with current thresholds (INP, not FID; the FAQ/HowTo schema deprecations). rank wraps it so the department gets that depth immediately, bounded by rank's role and the department's rules.

## Protocol

```
An SEO task
  -> Is it rank's (technical execution) or kai's (strategy + measurement)? (seo-ownership-boundary)
     kai's → hand back to kai with a technical brief
  -> rank's → INSTALL/confirm claude-seo (runtime; proposed connector §5)
    -> Invoke the right command: /seo technical · /seo schema · /seo sitemap · /seo geo ·
       /seo page · /seo hreflang · /seo images · etc.
      -> Apply results within the department: findings → dev review / mia (implementation) / raj (server)
        -> Charter: plugin runs plan-locked (Rail 1), sandboxed (Rail 2); no site changes it "just makes" —
           technical fixes go through the normal build+gate, not the plugin's hand
```

## Boundaries & handoffs

- "Run the SEO tools / full audit / plugin command" → **claude-seo-integration**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rank\",\"skill\":\"claude-seo-integration\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
