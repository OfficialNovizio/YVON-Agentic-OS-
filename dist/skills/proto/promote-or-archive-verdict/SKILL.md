---
name: promote-or-archive-verdict
agent: proto
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Prototypes that linger become shadow agents — unaudited, half-caged, load-bearing by accident. (yvon)
triggers:
  - promote or archive verdict
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/proto/custom/promote-or-archive-verdict/SKILL.md
  source_hash: 6689404661fa68964c6b98c5049df2009954fc182fb2633229274242001c895f
  generated: 2026-07-20T03:20:22.285Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/proto/custom/promote-or-archive-verdict/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js proto -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: proto — AI & Agents · skill: promote-or-archive-verdict"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"promote-or-archive-verdict\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/proto/operational/agent/proto-config.md"
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

- A prototype's expiry date arrives (calendar-driven, not memory-driven — the registry's expiry field is the trigger).
- An operator/agent asks for an early verdict (allowed; early archive is always available, early promote still needs full criteria).

## Purpose

Prototypes that linger become shadow agents — unaudited, half-caged, load-bearing by accident. A mandatory verdict keeps the cage meaningful and turns even failures into recorded learnings.

## Protocol

SCORE (eval-first-design's frozen criteria, mechanical where possible) → VERDICT (all criteria pass → PROMOTE eligible; any fail → ARCHIVE, or a documented operator override to promote-with-known-gaps — visible, signed) → if PROMOTE: PROPOSAL (Rail 3 new-agent proposal via meta: full house structure per agent-architecture-standards, migration from prototype shape itemized) → if ARCHIVE: LEARNINGS (what the hypothesis taught, verbatim evidence → anneal's lessons ledger; the prototype's artifacts archived read-only) → REGISTRY (meta: state change either way).

## Boundaries & handoffs

└► promote-or-archive-verdict (expiry)

## Output format

Verdict record: scored table, PROMOTE/ARCHIVE, proposal ref or learnings-ledger ref, registry state change.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"promote-or-archive-verdict\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
