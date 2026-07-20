---
name: data-access-discipline
agent: raj
department: Engineering
version: 1.0.0
tier: 3
description: |
  The backend is where data-access sins are committed: the ORM that fires N+1 queries, the missing transaction that leaves half-written state, the connection leak that exhausts the pool, and — the… (yvon)
triggers:
  - data access discipline
  - query the database from the api
  - why is this endpoint slow
  - transaction
  - n+1
  - connection pool
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/raj/custom/data-access-discipline/SKILL.md
  source_hash: aac0926351e434518dde99e84492cc084ea91289fd78d66668d83d12293f550d
  generated: 2026-07-20T03:20:22.911Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/raj/custom/data-access-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js raj -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: raj — Engineering · skill: data-access-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"raj\",\"skill\":\"data-access-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "query the database from the API," "why is this endpoint slow" (DB-bound), "transaction," "N+1," "connection pool," and any backend code that reads or (attempts to) write data.

## Purpose

The backend is where data-access sins are committed: the ORM that fires N+1 queries, the missing transaction that leaves half-written state, the connection leak that exhausts the pool, and — the charter-critical one — application code that runs a destructive data change directly instead of routing it through dana and the operator. This skill keeps that seam clean.

## Protocol

```
Backend code accessing data
  -> READS: right-sized (select what's used), no N+1 (batch/join/eager-load), paginated at the edge
  -> TRANSACTIONS: correct boundaries (all-or-nothing where needed), no long-held locks
  -> POOLING: connections pooled, released, never leaked; timeouts (service-patterns)
  -> WRITES / destructive changes: NOT executed by the backend directly.
     Schema/data changes → dana authors a migration → OPERATOR runs it (Rail 3).
     Row-level app writes within granted scope follow the store's transactional API — but
     create/update/delete/drop/truncate at scale or schema changes are ALWAYS dana+operator.
    -> Access reflects dana's model; performance issues → dana/db-performance
```

## Boundaries & handoffs

- "Query from the API / N+1 / transaction / connection pool" → **data-access-discipline**.
- **dana**: raj's API reflects dana's data model; raj reads via data-access-discipline; ALL destructive/schema changes are dana's migrations the operator runs (Rail 3) — raj never executes them.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"raj\",\"skill\":\"data-access-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
