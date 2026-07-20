---
name: offline-sync-discipline
agent: nova
department: Engineering
version: 1.0.0
tier: 3
description: |
  An app that only works online is broken on a subway; an app that syncs naively corrupts data when two devices edit offline. (yvon)
triggers:
  - offline sync discipline
  - offline support
  - local storage/cache
  - sync
  - what happens with no network
  - conflict resolution
  - the data disappeared/duplicated
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/nova/custom/offline-sync-discipline/SKILL.md
  source_hash: 7b4266342bf071871b7cceea3606a053c63f51f48d1bf8c072a90fe33d1fcaf1
  generated: 2026-07-20T03:20:22.752Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/nova/custom/offline-sync-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nova -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nova — Engineering · skill: offline-sync-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"offline-sync-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/nova/operational/agent/nova-config.md"
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

Triggers (only when `mobile_active`): "offline support," "local storage/cache," "sync," "what happens with no network," "conflict resolution," "the data disappeared/duplicated," and any mobile feature holding user data.

## Purpose

An app that only works online is broken on a subway; an app that syncs naively corrupts data when two devices edit offline. This discipline makes offline a first-class state (not an error), and makes sync conflicts a designed-for case (not a data-loss accident). It also intersects the charter: sync must never let the client become a path to destructive server writes (Rail 3 still holds).

## Protocol

```
[GATE: mobile_active?] A feature that holds/edits data on device
  -> LOCAL PERSISTENCE: what's stored on device (per dated playbook's store); secure storage for sensitive (aegis)
  -> OFFLINE AS A STATE: the UI works offline — reads from local, queues writes; offline is not an error screen
  -> SYNC STRATEGY: when connectivity returns, reconcile local ↔ server (raj's API)
  -> CONFLICT RESOLUTION: the SAME record changed both places → an explicit, designed rule
     (last-write-wins / merge / user-prompt — chosen deliberately, never silent-drop)
    -> Server-side writes still follow the charter: the app calls raj's API; destructive server data
       changes remain dana's migrations / operator-run — the client is never a Rail 3 bypass
      -> Verified offline→online transitions (mobile-verification): no loss, no duplication
```

## Boundaries & handoffs

→ offline-sync-discipline (data — offline-first, local persistence, conflict resolution)
- "Offline / local storage / sync / conflict" → **offline-sync-discipline**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"offline-sync-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
