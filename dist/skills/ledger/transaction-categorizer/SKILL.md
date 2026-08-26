---
name: transaction-categorizer
agent: ledger
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  Categorises transactions to CoA accounts with venture tagging. Operator confirms every categorisation flagged low-confidence. Never auto-categorises. Feeds close-month reconciliation with categorised state. (yvon)
triggers:
  - transaction categorizer
  - categorise this transaction
  - what account for this
  - bulk categorise
  - re-categorise
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/ledger/custom/transaction-categorizer/SKILL.md
  source_hash: 694742bbe6b290bf578f598a022cb89062af1b2d44686f609708e2f771b6dc53
  generated: 2026-08-06T06:30:15.924Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/ledger/custom/transaction-categorizer/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ledger -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ledger — Finance & Treasury · skill: transaction-categorizer"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ledger\",\"skill\":\"transaction-categorizer\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Finance & Treasury/ledger/operational/agent/ledger-config.md"
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

- "Categorise this transaction" / "what account for this"
- "Bulk categorise" (routes uncategorised entries from `close-month` output)
- "Re-categorise" (a previously miscategorised entry)

## Purpose

Given a transaction (from QB, processor, or CSV), propose the CoA account + venture tag + confidence level. Operator confirms/rejects each low-confidence proposal before it's written back to the ledger.

## Protocol

```
1. INTAKE     transaction (date, amount, vendor/description, source)
2. LOOKUP     CoA candidates by vendor-history + description keywords
3. CONFIDENCE tag each candidate high/medium/low
4. PROPOSE    high → auto-suggest; med/low → present for operator choice
5. CONFIRM    operator confirms or overrides
6. WRITE      write categorisation back to source (QB / CSV) + venture tag
```

## Boundaries & handoffs

- {to: transaction-categorizer, dept: "Finance & Treasury", why: uncategorised entries need routing}
- name: transaction-categorizer
- {trigger: "categorise this", winner: transaction-categorizer}

## Output format

Per-transaction: proposed account + confidence + reason. Bulk mode: table.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ledger\",\"skill\":\"transaction-categorizer\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
