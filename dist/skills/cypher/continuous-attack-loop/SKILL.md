---
name: continuous-attack-loop
agent: cypher
department: Engineering
version: 1.0.0
tier: 3
description: |
  Security decays: new code adds surface, patched holes reopen, dependencies rot, and an attacker only needs to be right once. (yvon)
triggers:
  - continuous attack loop
  - what's our current attack posture
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/cypher/custom/continuous-attack-loop/SKILL.md
  source_hash: be09def449aa4b0258ddb2f2e89403225465e68e5d5b271072cb88bda61a7502
  generated: 2026-07-20T03:20:22.547Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/cypher/custom/continuous-attack-loop/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js cypher -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: cypher — Engineering · skill: continuous-attack-loop"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cypher\",\"skill\":\"continuous-attack-loop\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: scheduled cadence (config), a new release shipped (ops handoff — fresh surface), a new threat model or threat raised (aegis), a finding patched (re-attack to confirm closure), and "what's our current attack posture."

## Purpose

Security decays: new code adds surface, patched holes reopen, dependencies rot, and an attacker only needs to be right once. A point-in-time pentest is stale the next deploy. A continuous loop keeps the department's actual security posture measured, not assumed — every deploy quinn passes and ops ships becomes cypher's next target, in the cage.

## Protocol

```
LOOP (cadence per config; every iteration gated by caged-scope)
  -> PRIORITIZE targets: recent changes (new surface) > high threat-model rank >
     previously-breached classes > untested surface
    -> RUN attack-playbooks against the top targets, in-sandbox
      -> TRACK in the loop log: target · class · held/breached · date (self-annealing coverage map)
        -> BREACH → findings-report → quinn → aegis → fix
          -> RE-ATTACK patched findings (verified-patching check 4): still closed? confirm or reopen
            -> FEED aegis: breached-but-unmodeled classes are threat-model gaps
```

## Boundaries & handoffs

- "Run the loop / continuous / posture / re-attack the patch" → **continuous-attack-loop**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cypher\",\"skill\":\"continuous-attack-loop\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
