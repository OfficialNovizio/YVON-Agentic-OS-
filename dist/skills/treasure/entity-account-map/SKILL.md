---
name: entity-account-map
agent: treasure
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  Registry mapping (entity × jurisdiction) → bank accounts + signatories + payment rails. New jurisdiction entry → setup checklist. Genericised per §0.4b — no hardcoded jurisdiction, no hardcoded bank. (yvon)
triggers:
  - entity account map
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/treasure/custom/entity-account-map/SKILL.md
  source_hash: dd60dd24a4a1389cb79164a82329577bfe77559996100459556a6d28b4a5f9d0
  generated: 2026-08-06T06:30:15.990Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/treasure/custom/entity-account-map/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js treasure -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: treasure — Finance & Treasury · skill: entity-account-map"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"treasure\",\"skill\":\"entity-account-map\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Finance & Treasury/treasure/operational/agent/treasure-config.md"
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

Use when the request matches: "entity account map".

## Purpose

Registry of banking + payment infrastructure per (entity × jurisdiction). Answers "which account do we use for X" and "what's the setup checklist for a new jurisdiction."

## Protocol

```
REGISTER  new entity/jurisdiction account → append
UPDATE    signatory change / new rail / close → append revision
LOOKUP    by entity + jurisdiction → return account list
CHECKLIST new-jurisdiction setup guidance
AUDIT     quarterly signatory audit
```

## Boundaries & handoffs

- name: entity-account-map
- {trigger: "which account", winner: entity-account-map}

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"treasure\",\"skill\":\"entity-account-map\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
