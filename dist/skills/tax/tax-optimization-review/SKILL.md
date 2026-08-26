---
name: tax-optimization-review
agent: tax
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  Annual tax optimization review — entity structure · transfer pricing · deductions · credits · timing. Identifies opportunities and blockers grounded in operator-declared jurisdictions. Never files or amends returns; produces recommendations for CPA/CTA review. (yvon)
triggers:
  - tax optimization review
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/tax/custom/tax-optimization-review/SKILL.md
  source_hash: b66fd5a496927cebc6cc83574d1a8496da38fb4547259f2d8051f081f61bf8c2
  generated: 2026-08-06T06:30:15.959Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/tax/custom/tax-optimization-review/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js tax -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: tax — Finance & Treasury · skill: tax-optimization-review"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tax\",\"skill\":\"tax-optimization-review\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Annual tax planning cycle
- New market entry (adds jurisdictions to scope)
- Material P&L shift (new revenue source, cost restructure)

Do NOT use for: filing deadlines (`filing-calendar`) or R&D credits specifically (`rd-credits`).

## Purpose

Annual scan across the tax landscape: entity structure, transfer pricing (if multi-entity), deduction opportunities, credits available, timing of income/expenses. Produces recommendations only — never files or amends.

## Protocol

```
1. INTAKE     current-year P&L + entity structure + jurisdictions
2. CATALOG    tax-config.md regime catalog per jurisdiction
3. ANALYZE    per-category: entity / transfer / deductions / credits / timing
4. FLAG       opportunities (with delta $ if computable) + blockers
5. RECOMMEND  ranked list to CPA/CTA for review
```

## Boundaries & handoffs

- name: tax-optimization-review
- {trigger: "tax optimization", winner: tax-optimization-review}
- {trigger: "tax review", winner: tax-optimization-review}

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tax\",\"skill\":\"tax-optimization-review\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
