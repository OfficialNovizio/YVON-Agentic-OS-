---
name: rd-credits
agent: tax
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  R&D tax-credit qualification + narrative preparation. Jurisdiction-parametric — supports US IRC §41, UK R&D relief, EU country schemes, CA SR&ED. Tags qualifying dev activity from engineering sprint logs; drafts technical narratives; hands filing to ledger + CPA. (yvon)
triggers:
  - rd credits
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/tax/custom/rd-credits/SKILL.md
  source_hash: 1d140cf8f7594db80be250bbfa300cb1a59012cd09be513281eec81bd36d3a1e
  generated: 2026-08-06T06:30:15.957Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/tax/custom/rd-credits/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js tax -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: tax — Finance & Treasury · skill: rd-credits"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tax\",\"skill\":\"rd-credits\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Finance & Treasury/tax/operational/agent/tax-config.md"
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

- Annual R&D credit review
- New venture with substantive engineering — check eligibility
- Regulator inquiry / audit response prep

## Purpose

Identify qualifying R&D activity across ventures, compile the technical narrative regulators require, quantify eligible spend, hand off to CPA/CTA for filing.

Regime support (per operator declaration in `tax-config.md`):
- **US IRC §41** (federal + state variants)
- **UK R&D tax relief** (SME + RDEC)
- **Canada SR&ED**
- **Other jurisdiction-specific schemes** as operator declares

## Protocol

```
1. INTAKE     jurisdiction + venture(s) + period + eng sprint logs
2. QUALIFY    four-part test (or jurisdiction-equivalent) per activity
3. QUANTIFY   qualifying wages + supplies + contract research
4. NARRATE    technical narrative per activity (regulator-format)
5. HANDOFF    package to CPA + ledger for filing
```

## Boundaries & handoffs

- {to: rd-credits, dept: "Finance & Treasury", why: R&D subset hand-off}
- name: rd-credits
- {trigger: "R&D credits", winner: rd-credits}

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tax\",\"skill\":\"rd-credits\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
