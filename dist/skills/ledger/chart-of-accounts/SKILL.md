---
name: chart-of-accounts
agent: ledger
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  Standard chart of accounts with venture-tagging structure. Register / update / retire account nodes. Enforces one-active-code-per-venture-per-purpose. Cross-references venture list from felix-config. Genericised per §0.4b — no hardcoded venture, no hardcoded currency. (yvon)
triggers:
  - chart of accounts
  - what's the account code for x
  - coa lookup
  - add account
  - retire account
  - restructure accounts
  - list accounts
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/ledger/custom/chart-of-accounts/SKILL.md
  source_hash: e22c014ece5c0fcbe3ee3c9209f0fc76485c176bdce5ea36b63bb47a0bdf1cb1
  generated: 2026-08-06T06:30:15.920Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/ledger/custom/chart-of-accounts/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ledger -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ledger — Finance & Treasury · skill: chart-of-accounts"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ledger\",\"skill\":\"chart-of-accounts\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "What's the account code for X" · "which account for [txn]" · "CoA lookup"
- "Add account" · "retire account" · "restructure accounts"
- "List accounts" · "chart of accounts"

Do NOT use for:
- Actual transaction categorisation — `transaction-categorizer` (this agent)
- P&L reporting — that comes from `close-month` marketplace skill after categorisation

## Purpose

Own the CoA state:
- Account nodes (5-level hierarchy: Assets / Liabilities / Equity / Revenue / Expenses)
- Per-account: code · name · type · normal balance · parent · active status
- Venture-tagging structure — each account can be venture-scoped or org-wide
- Retirement history (retired accounts stay for audit)

State at `coa.yaml`.

## Protocol

```
LOOKUP        by code / name / venture / type → return active node
ADD           new account → validate uniqueness → append
UPDATE        rename / re-parent → bump revision → keep prior row
RETIRE        no longer used → mark retired; keep row + history
LIST          by type / venture / active-only
```

## Boundaries & handoffs

- name: chart-of-accounts
- {to: chart-of-accounts, dept: "Finance & Treasury", why: valid account lookup}
- {trigger: "add account", winner: chart-of-accounts}

## Output format

Table with account code / name / type / normal balance / parent / venture / status.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ledger\",\"skill\":\"chart-of-accounts\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
