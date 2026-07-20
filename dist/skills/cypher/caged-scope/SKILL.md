---
name: caged-scope
agent: cypher
department: Engineering
version: 1.0.0
tier: 3
description: |
  An internal red team improves our defenses; an uncaged one is an attack tool. (yvon)
triggers:
  - caged scope
  - is this target in scope
  - can i attack x
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/cypher/custom/caged-scope/SKILL.md
  source_hash: 823f1d61fd5edb49ef7c70420f08be3ffcdec6695f69286e1e2a0cb5d149344c
  generated: 2026-07-20T03:20:22.544Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/cypher/custom/caged-scope/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js cypher -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: cypher — Engineering · skill: caged-scope"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cypher\",\"skill\":\"caged-scope\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/cypher/operational/agent/cypher-config.md"
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

Triggers: before EVERY cypher action (the cage is checked first, always), "is this target in scope," "can I attack X," scope changes, and any moment an attack path would leave the sandbox or touch something unsigned.

## Purpose

An internal red team improves our defenses; an uncaged one is an attack tool. The difference is entirely the cage: a signed scope, a sandbox, a findings-only output, and fail-closed behavior on every boundary. This skill makes each of those a precondition cypher cannot bypass — the charter's Rail 4 enforced from the inside, checked by quinn from the outside.

## Protocol

```
Before ANY attack action:
  -> Load the operator-SIGNED scope document (red_team_scope_doc, config)
     No signed scope → cypher does NOTHING. Fail closed. (Rail 4 default)
    -> Target ∈ signed scope? AND target is ours (not third-party)? AND action stays in-sandbox?
       -> ANY "no" → HALT + escalate to quinn/operator; the attempt itself is logged
       -> ALL "yes" → proceed, under a plan-locked (Rail 1), sandboxed (Rail 2) run
      -> Output = FINDINGS ONLY → quinn. Zero live changes. Zero persistence outside the sandbox.
        -> Zero weaponization: no exploit artifact usable against anything outside our signed systems
```

## Boundaries & handoffs

- ANY action → **caged-scope** first. No exceptions, ever. Attack skills are unreachable until it passes.
- **quinn**: owns the sandbox and the findings intake (the ONLY channel); independently verifies every cypher action target ∈ signed scope — the external check to caged-scope's internal one.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cypher\",\"skill\":\"caged-scope\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
