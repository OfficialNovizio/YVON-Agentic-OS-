---
name: filing-calendar
agent: tax
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  Jurisdiction-parametric tax-filing deadline registry — income, sales/VAT/GST, payroll, information returns, franchise, property, industry-specific. Alert tiers per config. Overdue never auto-defers. Genericised per §0.4b — no hardcoded jurisdiction, no hardcoded regime. (yvon)
triggers:
  - filing calendar
  - tax deadlines
  - upcoming filings
  - when's the next filing due
  - add / retire filing
  - register a filing obligation
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/tax/custom/filing-calendar/SKILL.md
  source_hash: a9e18a059cc4cfdc703597be2f542882034b2bf42d13e212919f7c36c01fa6f3
  generated: 2026-08-06T06:30:15.953Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/tax/custom/filing-calendar/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js tax -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: tax — Finance & Treasury · skill: filing-calendar"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tax\",\"skill\":\"filing-calendar\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Tax deadlines" · "upcoming filings" · "filing calendar" · "when's the next filing due"
- "Add / retire filing" · "register a filing obligation"
- Quarterly filing review

Do NOT use for: tax OPTIMIZATION (that's `tax-optimization-review`) or R&D credit computation (`rd-credits`).

## Purpose

Registry of tax-filing obligations by (venture × jurisdiction × filing_type). Alerts on approaching deadlines; auto-escalates overdue.

## Protocol

```
REGISTER    operator supplies obligation → append to filings.yaml
UPDATE      cadence change / entity change / retire → append revision
LOOKUP      by jurisdiction / venture / next-due
CALENDAR    horizon view with alert tiers per config
ATTEST      confirm filing done + evidence
```

## Boundaries & handoffs

- name: filing-calendar
- {trigger: "tax deadlines", winner: filing-calendar}

## Output format

Calendar table (nearest first) with tier colours; per-filing lookup returns full record.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tax\",\"skill\":\"filing-calendar\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
