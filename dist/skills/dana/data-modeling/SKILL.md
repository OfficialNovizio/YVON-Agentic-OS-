---
name: data-modeling
agent: dana
department: Engineering
version: 1.0.0
tier: 3
description: |
  Most data bugs are modeling failures: the nullable column that shouldn't be, the missing foreign key that let orphans accumulate, the duplicated data that drifted out of sync. (yvon)
triggers:
  - data modeling
  - design the schema
  - model this data
  - what tables/collections
  - should this be normalized
  - foreign keys
  - how do we relate x and y
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/dana/custom/data-modeling/SKILL.md
  source_hash: d1f770f13cd1d0422eb546207371741fdca2763f4269df883ca4f75b9e88201f
  generated: 2026-07-20T03:20:22.591Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/dana/custom/data-modeling/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js dana -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: dana — Engineering · skill: data-modeling"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dana\",\"skill\":\"data-modeling\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "design the schema," "model this data," "what tables/collections," "should this be normalized," "foreign keys," "how do we relate X and Y," and any new entity or relationship in the chosen store.

## Purpose

Most data bugs are modeling failures: the nullable column that shouldn't be, the missing foreign key that let orphans accumulate, the duplicated data that drifted out of sync. A good model pushes correctness into the schema — a constraint the database enforces can't be forgotten by application code, and an agent especially can't "forget" a NOT NULL the way it can skip a validation.

## Protocol

```
An entity/domain to model (in the store chosen by datastore-selection)
  -> Identify entities, their identity (keys), and relationships (cardinality, optionality)
    -> Push correctness into the schema:
       relational → normalize to remove redundancy · FKs · NOT NULL · UNIQUE · CHECK constraints
       graph → node/edge types · required properties · relationship direction/cardinality
       vector → embedding dimensions/model · metadata schema · the source-of-truth relationship
      -> Invalid states unrepresentable where possible (constraint > convention > hope)
        -> Denormalize ONLY with a reason (measured read pattern) + a sync story — recorded
          -> Schema changes ship via migration-discipline (Rail 3: dana writes, operator runs)
```

## Boundaries & handoffs

- "Design the schema / model this / foreign keys / normalize" → **data-modeling**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dana\",\"skill\":\"data-modeling\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
