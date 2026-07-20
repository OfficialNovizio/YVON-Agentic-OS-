---
name: design-tokens
agent: mia
department: Engineering
version: 1.0.0
tier: 3
description: |
  When designers own a brand kit and engineers hardcode hex values, the two diverge the first week — the "brand blue" in the app is three slightly different blues, none matching the kit. (yvon)
triggers:
  - design tokens
  - brand colors in the app
  - the ui doesn't match the brand
  - update the theme
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/mia/custom/design-tokens/SKILL.md
  source_hash: 311e66aeed6abfc4a30998824e92a50d41ece90e0560be52f5358d6a82de5b3a
  generated: 2026-07-20T03:20:22.693Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/mia/custom/design-tokens/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js mia -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: mia — Engineering · skill: design-tokens"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"design-tokens\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "design tokens," "brand colors in the app," "the UI doesn't match the brand," "update the theme," a brand kit change from atlas, and any UI styling that would otherwise hardcode a brand value.

## Purpose

When designers own a brand kit and engineers hardcode hex values, the two diverge the first week — the "brand blue" in the app is three slightly different blues, none matching the kit. Tokens fix this: the kit defines the values once, tokens carry them into code, and a brand refresh is a kit amendment that propagates, not a hunt through stylesheets.

## Protocol

```
atlas's BRAND KIT (source of truth — colors, type, spacing, motion, etc.)
  -> Translate to tokens (assets/token-schema.md): semantic names, not raw values
     (token: color.action.primary → kit's brand blue — NOT #1A73E8 sprinkled in components)
    -> Tokens are the ONLY styling source components read; raw hardcoded brand values are a finding
      -> Kit change → token update → propagates everywhere the token is used (one path)
        -> Token change traces to the kit amendment (provenance); drift (UI value not from a token) is flagged
```

## Boundaries & handoffs

design-tokens (atlas brand kit → tokens — the source of truth for styling)
- "Brand colors / theme / tokens / UI doesn't match brand" → **design-tokens** (atlas is source of truth).

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"design-tokens\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
