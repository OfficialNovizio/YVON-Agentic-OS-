---
name: regulatory-horizon
agent: trend
department: Market Intelligence
version: 1.0.0
tier: 3
description: |
  Regulatory-horizon scan — bills / consultations / draft rules across watched jurisdictions BEFORE they become obligations. Distinct from comply/reg-feed-watcher which watches enacted rules; this watches pre-enactment. Feeds scope + comply. (yvon)
triggers:
  - regulatory horizon
  - what regulatory changes could hit us in 12-24 months
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Market Intelligence/trend/custom/regulatory-horizon/SKILL.md
  source_hash: f7709f6751cc8ed2d166c3c575f201e57b84724d4a8e41fcfc51c458cac90be7
  generated: 2026-08-08T16:51:52.789Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Market Intelligence/trend/custom/regulatory-horizon/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js trend -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: trend — Market Intelligence · skill: regulatory-horizon"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"trend\",\"skill\":\"regulatory-horizon\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Market Intelligence/trend/operational/agent/trend-config.md"
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

- Strategic planning ("what regulatory changes could hit us in 12-24 months")
- Market-entry timing (regulatory clarity is a market-entry variable)

Do NOT use for: enacted regulation compliance (→ `comply`) · specific-obligation register (→ `comply/obligation-register`).

## Purpose

Track *pre-enactment* regulatory signals — bills, consultations, ANPRs, RFIs, draft rules, regulator speeches — across watched jurisdictions. Distinct from `comply/reg-feed-watcher` which watches enacted rules; this looks upstream.

## Protocol

```
1. WATCH   configured legislative + regulator sources per jurisdiction
2. STAGE   bill → committee → passed → signed → effective; regulator: ANPR → NPRM → final
3. IMPACT  which of our markets / activities affected + likely change
4. TIMING  estimated effective date
5. RETURN  horizon table + scope + comply routing recommendations
```

## Boundaries & handoffs

- `comply` (Legal & Compliance) — regulatory-horizon feeds obligation register once enacted.
- name: regulatory-horizon
- {trigger: "regulatory horizon", winner: regulatory-horizon}

## Output format

Horizon table: item · jurisdiction · stage · estimated effective · impact scope · likelihood · recommended action.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"trend\",\"skill\":\"regulatory-horizon\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
