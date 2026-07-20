---
name: identity-lifecycle
agent: keyring
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  The single loudest identity gap in every breach report is the **departed employee (or contractor) with live access** — accounts that were never deprovisioned, becoming an unmonitored way in. (yvon)
triggers:
  - identity lifecycle
  - provision access for x
  - did we deprovision y
  - why does z still have access
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/keyring/custom/identity-lifecycle/SKILL.md
  source_hash: c130cba8ff791f86d734e707b6f98009f64256b12c5cfff944fcf0fd85ee8f4f
  generated: 2026-07-20T03:20:23.107Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/keyring/custom/identity-lifecycle/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js keyring -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: keyring — Cybersecurity · skill: identity-lifecycle"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"identity-lifecycle\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/keyring/operational/agent/keyring-config.md"
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

- Someone joins, changes role, or leaves (the JML events).
- "Provision access for X," "did we deprovision Y," "why does Z still have access."
- Periodic reconciliation (accounts vs actual people — orphan detection).
- Referencing the Hack23 access control matrix for MFA requirements, session timeouts, and review cadences per asset classification.

## Purpose

The single loudest identity gap in every breach report is the **departed employee (or contractor) with live access** — accounts that were never deprovisioned, becoming an unmonitored way in. JML discipline closes it, and keeps least-privilege true as people change roles rather than accumulating access forever (privilege creep).

## Protocol

```
POLICY LAYER (Hack23 access-control-policy — unaltered reference)
  Asset classification → RBAC model → MFA requirements → zero-trust architecture
  ↓ feeds into
JML WORKFLOW (custom — this skill)
  JOINER (role → least-privilege access set; granted by operator/IdP)
  → MOVER (role change → REMOVE old as new is added; net = current role only)
  → LEAVER (prompt, complete deprovisioning across ALL systems)
  → RECONCILE (accounts ↔ people; orphans/ghosts → warden)
```

## Boundaries & handoffs

join/move/leave ─► identity-lifecycle (least-privilege JML; LEAVER = deprovision ALL) ─► operator/IdP executes

## Output format

```

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"identity-lifecycle\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
