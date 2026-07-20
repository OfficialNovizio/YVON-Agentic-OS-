---
name: regression-map
agent: quinn
department: Engineering
version: 1.0.0
tier: 3
description: |
  Systems don't break uniformly; they break where they've always broken — the timezone handling, the payment retry, the auth edge case. (yvon)
triggers:
  - regression map
  - fragile areas
  - has this broken before
  - add a map entry
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/quinn/custom/regression-map/SKILL.md
  source_hash: 4a38fd5c3a8c85151af35cde7affac42b126615363a61319cf9153ceb2338e1a
  generated: 2026-07-20T03:20:22.857Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/quinn/custom/regression-map/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js quinn -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: quinn — Engineering · skill: regression-map"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"regression-map\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/quinn/operational/agent/quinn-config.md"
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

Triggers: "regression map," "fragile areas," "has this broken before," "add a map entry," post-incident (ops's post-mortem output), cypher/aegis finding closed, flaky test recurring, and automatically at every gate check (test-strategy consults it).

## Purpose

Systems don't break uniformly; they break where they've always broken — the timezone handling, the payment retry, the auth edge case. Teams re-learn this the hard way because the knowledge lives in nobody's head after a quarter. The map writes it down and wires it into the gate, so the third regression in the same spot is caught by procedure, not by luck.

## Protocol

```
FEED (what creates/updates entries — self-annealing inputs)
  ops post-mortem → entry (what broke, why, the guard test)
  cypher finding closed → entry (the attack path, the guard)
  aegis vuln fixed → entry (the vuln class + surface)
  bug fix merged → entry (per gate-matrix: the fix's failing-test-first becomes the guard)
  flaky test recurring → flaky register entry (owner, date, quarantine status)

USE (what the map does at the gate)
  Diff arrives → map areas touched? (paths/modules/flows per entry)
    -> YES → that entry's targeted suite is REQUIRED in quinn's gate (tier R)
    -> NO → standard matrix tiers only

RETIRE (the only way out)
  Entry retired ONLY when the fragility is architecturally removed — the change that removes it
  cites an ADR, and the entry is marked retired-by-ADR-NNN (append-only; never deleted)
```

## Boundaries & handoffs

-> regression-map consulted: fragile area touched? → targeted suite required (tier R)
- "Has this broken before," post-mortem arrived, flaky test, finding closed → **regression-map**.
- **ops** (when built): ships only on GATE PASS; its post-mortems feed regression-map.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"regression-map\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
