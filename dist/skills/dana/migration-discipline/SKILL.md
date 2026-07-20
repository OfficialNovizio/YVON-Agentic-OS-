---
name: migration-discipline
agent: dana
department: Engineering
version: 1.0.0
tier: 3
description: |
  An agent that can silently mutate or drop business data is the single catastrophic failure mode the charter exists to prevent — the data analogue of "never move money." This skill makes destructive… (yvon)
triggers:
  - migration discipline
  - migrate
  - schema change
  - add/drop a column
  - alter the table
  - backfill
  - data fix
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/dana/custom/migration-discipline/SKILL.md
  source_hash: 1fcba8f994350d25c089e51ef686e01ebb125e135b61c9adce030c59bcd04d0c
  generated: 2026-07-20T03:20:22.603Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/dana/custom/migration-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js dana -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: dana — Engineering · skill: migration-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dana\",\"skill\":\"migration-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/dana/operational/agent/dana-config.md"
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

Triggers: "migrate," "schema change," "add/drop a column," "alter the table," "backfill," "data fix," any create/update/delete/drop/truncate at scale, and standing up a new store (datastore-selection's handoff).

## Purpose

An agent that can silently mutate or drop business data is the single catastrophic failure mode the charter exists to prevent — the data analogue of "never move money." This skill makes destructive data changes human by construction: dana produces the script and the plain-language summary of what it does; the operator reads, approves, and runs it. Reversibility is mandatory because the one irreversible migration is the one you desperately need to undo.

## Protocol

```
A schema/data change is needed
  -> dana AUTHORS the migration script (assets/migration-script-template.md):
     up-script · DOWN-script (reversible) · plain-language effect summary · affected rows/tables estimate
    -> Sequence: expand → migrate → contract (additive first; each step independently rollback-able)
      -> DOWN-script TESTED (against a scratch/restored copy) BEFORE the up runs — untested down = not done
        -> Hand to the OPERATOR with the summary → operator reviews → OPERATOR runs it (Rail 3)
          -> dana NEVER executes it. Not in dev, not in prod, not "just this once", not mid-incident.
            -> Post-run: verify against the summary's expectation; feed ops (deploy record) + quinn (gate)
```

## Boundaries & handoffs

- "Migrate / schema change / alter / backfill / data fix" → **migration-discipline** (dana writes, operator runs), which pulls tool-specific mechanics from **marketplace/database-migrations** (Postgres lock-safety, expand-contract, ORM playbooks — dated; the active tool comes from dev's stack-profile).
- ANY change to a live store, from any of the above → routes through **migration-discipline** (Rail 3). No direct application. Method conflicts between the two migration skills resolve to migration-discipline.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dana\",\"skill\":\"migration-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
