---
name: agent-prototype-kit
agent: proto
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Experiments are how the fleet grows — and uncaged experiments are how it gets hurt. (yvon)
triggers:
  - agent prototype kit
  - what if we had an agent that..
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/proto/custom/agent-prototype-kit/SKILL.md
  source_hash: 285598502327ee80d807a64d130a74e0ad2bbd3d3899fff219fe43c396df8c5b
  generated: 2026-07-20T03:20:22.276Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/proto/custom/agent-prototype-kit/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js proto -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: proto — AI & Agents · skill: agent-prototype-kit"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"agent-prototype-kit\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Anyone proposes a new agent or a significant agent variant ("what if we had an agent that...").
- edge's pilot-spec-handoff delivers an approved pilot needing an agent shape.
- A prototype needs its cage checked mid-flight.

## Purpose

Experiments are how the fleet grows — and uncaged experiments are how it gets hurt. The kit makes trying things cheap AND safe: every prototype is sandboxed, time-boxed, and evaluated against criteria written before it exists.

## Protocol

SCAFFOLD (manifest from template: purpose, skills sketch, sandbox limits, registered-tools-only, expiry) → EVAL FIRST (success criteria via eval-first-design BEFORE any building) → REGISTER (meta's fleet registry, state `prototype`, expiry recorded) → RUN (caged: Engineering Rail 2 sandbox, no production data/memory, no unregistered tools — Rail 4 verbatim) → VERDICT (promote-or-archive-verdict at expiry).

## Boundaries & handoffs

idea/pilot (edge, operator, any agent) ─► agent-prototype-kit (manifest)

## Output format

Completed manifests; registry entries; cage-check reports (limits verified / violations escalated).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"agent-prototype-kit\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
