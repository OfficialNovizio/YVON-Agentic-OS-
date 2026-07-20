---
name: service-patterns
agent: raj
department: Engineering
version: 1.0.0
tier: 3
description: |
  Services fail in production in predictable ways: a retried payment charges twice (no idempotency), a slow downstream hangs every thread (no timeout), a traffic spike melts a synchronous pipeline (no… (yvon)
triggers:
  - service patterns
  - design this service
  - should this be async
  - idempotency
  - retry/timeout
  - circuit breaker
  - queue this
  - service boundary
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/raj/custom/service-patterns/SKILL.md
  source_hash: 3a9a3f4a4da5d43456aa53745f80c4aab8db2ef96b4036b2c89ab6d21543c4cb
  generated: 2026-07-20T03:20:22.914Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/raj/custom/service-patterns/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js raj -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: raj — Engineering · skill: service-patterns"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"raj\",\"skill\":\"service-patterns\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/raj/operational/agent/raj-config.md"
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

Triggers: "design this service," "should this be async," "idempotency," "retry/timeout," "circuit breaker," "queue this," "service boundary," and any operation that mutates state, calls a dependency, or does slow work.

## Purpose

Services fail in production in predictable ways: a retried payment charges twice (no idempotency), a slow downstream hangs every thread (no timeout), a traffic spike melts a synchronous pipeline (no queue), a cascading failure takes down everything (no circuit breaker). These patterns are the accumulated answers — dev's "everything fails all the time," applied at the service layer.

## Protocol

```
A service/operation to design
  -> MUTATION? → idempotency key so retries are safe (never double-charge/double-write)
  -> CALLS A DEPENDENCY? → timeout (always) + retry-with-backoff (idempotent only) + circuit breaker
  -> SLOW / non-blocking work? → queue + background worker, not a held request
  -> BOUNDARY: one service owns one responsibility; shared state across boundaries is a smell
    -> Failure modes owned (dev's rule): what happens when each dependency is down?
      -> DB access follows data-access-discipline; the edge follows api-standards
```

## Boundaries & handoffs

- "Should this be async / idempotency / retry / timeout / circuit breaker / queue" → **service-patterns**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"raj\",\"skill\":\"service-patterns\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
