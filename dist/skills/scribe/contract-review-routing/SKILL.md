---
name: contract-review-routing
agent: scribe
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  Scribe's entry point for contract review — detects agreement type, loads scribe-config, binds YVON's config layer to the vendor-agreement-review marketplace skill and hands off. Bounces if config has placeholders; runs [PROVISIONAL] if operator opts in. (yvon)
triggers:
  - contract review routing
  - review this contract
  - review this agreement
  - review this vendor msa
  - is this contract okay
  - check this saas agreement
  - redline this contract
  - flag anything in this contract
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/scribe/custom/contract-review-routing/SKILL.md
  source_hash: 1c09451c4a1d91a7d97d444b2dffb8fee64f28d79dd701780e6bc7b196c6a3cb
  generated: 2026-07-29T22:02:08.733Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/scribe/custom/contract-review-routing/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scribe -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scribe — Legal & Compliance · skill: contract-review-routing"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scribe\",\"skill\":\"contract-review-routing\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Legal & Compliance/scribe/operational/agent/scribe-config.md"
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

- Operator says "review this contract", "review this agreement", "review this vendor MSA", "is this contract okay", "check this SaaS agreement", "redline this contract", "flag anything in this contract".
- Operator uploads or pastes a contract document.
- Operator asks about a specific clause in a contract already in scope.

Do NOT use for:

- Contract *drafting* from scratch — that's `contract-library` (template registry + selection).
- Extracting obligations from an already-signed contract — that's `obligation-extraction`.
- Litigation over an existing contract — that's `shield`'s domain (`case-assessment-memo`).

## Purpose

Take an inbound contract-review request, do the three things the marketplace skill assumes are already done, and hand off:

1. Detect what kind of agreement it is (MSA, SaaS, NDA, SOW, Order Form, Reseller, Other).
2. Determine which side scribe is on for this contract (purchasing or sales).
3. Load the matching playbook block from `operational/agent/scribe-config.md` — playbook positions, escalation matrix, deal-breaker list, governing law, house style.

After the handoff, the marketplace skill's own workflow runs unaltered — orient → deal-breaker check → term-by-term comparison → escalation routing → memo.

## Protocol

```
1. INTAKE      confirm a contract is attached / pasted / named
2. CONFIG      load scribe-config.md; if missing/placeholder → BOUNCE
3. DETECT      classify agreement type from filename + content signals
4. SIDE        determine sales vs purchasing (ask if ambiguous)
5. BIND        pass resolved playbook + escalation matrix + deal-breaker to marketplace skill
6. HANDOFF     invoke vendor-agreement-review with bound context
7. RETURN      surface the memo with scribe's preamble/postamble
```

## Boundaries & handoffs

- name: contract-review-routing

## Output format

The marketplace skill owns the memo format. This skill adds only the preamble in Step 7 and does not modify the memo body.

If the run bounces at Step 2 or Step 5, the output is the bounce message alone — no memo.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scribe\",\"skill\":\"contract-review-routing\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
