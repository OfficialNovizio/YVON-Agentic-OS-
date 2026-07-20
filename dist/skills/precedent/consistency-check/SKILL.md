---
name: consistency-check
agent: precedent
department: Governance
version: 1.0.0
tier: 3
description: |
  Inconsistent rulings are how governance loses authority — if the same facts got APPROVE in March and REJECT in July with no stated reason, both rulings become arguments rather than precedents, and every future proposer relitigates. (yvon)
triggers:
  - consistency check
  - consistent with past
  - precedent conflict
  - have we ruled differently before
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Governance/precedent/custom/consistency-check/SKILL.md
  source_hash: 3d7f554ca50bea52734cfff8249416a36e6f7de51c94d3de0c080f191b201b31
  generated: 2026-07-20T03:20:24.063Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Governance/precedent/custom/consistency-check/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js precedent -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: precedent — Governance · skill: consistency-check"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"precedent\",\"skill\":\"consistency-check\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Governance/precedent/operational/agent/precedent-config.md"
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

Triggers: "consistent with past," "precedent conflict," "have we ruled differently before," or automatically when board has a *proposed* ruling in hand and ruling-log has surfaced similar precedents.

## Purpose

Inconsistent rulings are how governance loses authority — if the same facts got APPROVE in March and REJECT in July with no stated reason, both rulings become arguments rather than precedents, and every future proposer relitigates. This skill makes consistency the default and *deliberate change* the only alternative: precedent can absolutely be overruled, but overruling is a visible, justified act, never drift.

## Protocol

```
Take the proposed ruling + the surfaced precedent set
  -> For each precedent: would its ratio, applied to this case, produce the same ruling?
    -> Same → consistent, note and proceed
    -> Different → CONFLICT: present both to board
        -> DISTINGUISH (name the material difference — cases differ, both stand)
        -> or OVERRULE (new rule replaces old — justification mandatory, logged)
          -> Never silent: the conflict and its resolution go in the ruling record
```

## Boundaries & handoffs

- **case-law-method → consistency-check**: an APPLY that board wants to depart from is exactly an overrule — it must go through consistency-check's protocol, never resolved inside case-law-method.
- **consistency-check → ruling-log**: every conflict resolution (distinction or overrule justification) lands in the final record; overruled rulings get cross-marked, both directions.
A live review runs the pipeline in order. Standalone questions route by verb: *find/what happened* → ruling-log; *does it apply* → case-law-method; *is this consistent / can we rule differently* → consistency-check.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"precedent\",\"skill\":\"consistency-check\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
