---
name: price-change-governance
agent: price
department: Product
version: 1.0.0
tier: 3
description: |
  A price change is the highest-trust action product takes — it touches every customer's wallet and often a promise made to them. (yvon)
triggers:
  - price change governance
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/price/custom/price-change-governance/SKILL.md
  source_hash: 2c2a4239cb98f287aaf9b736ad4d753ca223d2e1b6534dba6ea8092d946ef28b
  generated: 2026-07-20T03:20:23.380Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/price/custom/price-change-governance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js price -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: price — Product · skill: price-change-governance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"price-change-governance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/price/operational/agent/price-config.md"
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

- A validated pricing experiment (pricing-experiment-discipline) is ready to go broad.
- Packaging is being restructured for existing customers.
- Any live price or plan is changing — up, down, or repackaged.

## Purpose

A price change is the highest-trust action product takes — it touches every customer's wallet and often a promise made to them. Governance makes changes deliberate: their impact is analyzed, existing customers are handled honestly, and commitments are never breached quietly.

## Protocol

IMPACT ANALYSIS (who's affected, revenue delta, churn risk, which segments; existing vs new customers separated) → LOCKED-COMMITMENT CHECK (does this touch a Governance locked commitment — price guarantee, grandfathering clause, contractual cap? if yes → board proposal, board's triple-pass; Governance dormant until its docs exist, so the proposal queues, anneal-style) → GRANDFATHERING (existing customers on old prices handled explicitly: honored, migrated with notice, or transitioned — never silently repriced; the default leans customer-favorable) → COMMUNICATION PLAN (changes are announced with notice, not discovered on an invoice — echo/comms own the message, price owns the substance) → PROPOSAL (the whole change is a logged proposal — impact + grandfathering + comms — approved before it ships; silent change is a trust incident) → SHIP (versioned, recorded; metric reads the revenue + churn outcome).

## Boundaries & handoffs

price-change-governance (impact; grandfather; board if locked commitment) ─► ship ─► metric reads revenue+churn

## Output format

Price-change proposal: impact (existing vs new, revenue Δ, churn risk) · locked-commitment check (→ board if in scope) · grandfathering plan · comms plan · approval · → ship (versioned) → metric outcome read.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"price-change-governance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
