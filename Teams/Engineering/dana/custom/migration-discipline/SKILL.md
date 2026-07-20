---
name: migration-discipline
type: custom
status: built 2026-07-09 (Fable build) — dana's signature; the department's Rail 3 authoring point
based_on_catalog_entry: none — new; plan §3 "migration-discipline (always reversible; generates scripts, operator runs them — Rail 3)"
marketplace_search: 2026-07-09 — migration/rollback skills found are deploy-tool-centric; the reversible + operator-run (Rail 3) discipline is kept custom, bound to the charter and ops's expand-migrate-contract sequencing
assigned_agent: dana (Engineering / Data Architecture)
portable: true — the discipline is store-agnostic; the migration syntax comes from the chosen store
includes: assets/migration-script-template.md
date_added: 2026-07-09
---

## Introduction

migration-discipline is where Security Charter Rail 3 becomes a concrete workflow: **dana authors every schema/data change as a prepared, reversible, reviewable script — and the operator runs it.** No agent, dana included, executes a create/update/delete/drop/truncate or a migration. Every migration ships with its down-script tested first, sequenced so each deploy stays independently rollback-able (ops's expand-migrate-contract).

## Purpose

An agent that can silently mutate or drop business data is the single catastrophic failure mode the charter exists to prevent — the data analogue of "never move money." This skill makes destructive data changes human by construction: dana produces the script and the plain-language summary of what it does; the operator reads, approves, and runs it. Reversibility is mandatory because the one irreversible migration is the one you desperately need to undo.

## When to Use

Triggers: "migrate," "schema change," "add/drop a column," "alter the table," "backfill," "data fix," any create/update/delete/drop/truncate at scale, and standing up a new store (datastore-selection's handoff).

## Structure / Protocol

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

## Instructions

1. **dana writes; the operator runs. Always.** Every migration is a prepared script plus a plain-language summary of its effect. dana hands both to the operator and stops. There is no configuration, no urgency, and no environment where dana executes a destructive data change — Rail 3 is a hard rule (charter: "not configurable").
2. **Reversible or it isn't done.** Every up-script has a tested down-script. An irreversible change (a genuine data transform that can't be undone) requires explicit operator sign-off before authoring, a written recovery plan in place of the down-script, and a risk entry — never a silent one-way door (mirrors ops's release-discipline).
3. **Test the down before the up.** The rollback is exercised against a scratch or restored copy first — because a down-script that has never run is exactly as trustworthy as a backup that has never been restored (ops's rule). Untested reversibility fails the gate.
4. **Sequence expand-migrate-contract.** Additive changes first (new column/edge, nullable), then the code that uses both old and new shapes, then contraction later. This keeps every deploy independently rollback-able (ops's sequencing) and avoids the mid-migration state where neither old nor new code works.
5. **The summary is for a human.** The plain-language effect summary — "adds a nullable `status` column to `orders`, backfills ~2.3M rows to 'legacy', drops nothing" — is what the operator approves against. A script the operator can't understand isn't ready; the summary is not optional.
6. **Verify after, feed the system.** After the operator runs it, dana verifies the result matches the summary's expectation, and the migration becomes part of ops's deploy record and quinn's gate evidence. A migration that did something other than its summary is an incident (ops).

## Output Format

```
## Migration: [name] — [store]
Effect (plain language): [what it does, tables/rows affected, what it does NOT touch]
Up-script: [ref] · Down-script: [ref] · Down TESTED on scratch/restore: ✓ [evidence]
Sequence: expand / migrate / contract — this step independently rollback-able: ✓
Rail 3: authored by dana · TO BE RUN BY OPERATOR (dana does not execute)
Post-run verify: [expected vs actual] → ops deploy record + quinn gate
```

## Principles

- **dana writes, the operator runs — always** (Rail 3, not configurable, no urgency exception).
- **Reversible or not done** — tested down-script, or explicit operator sign-off + recovery plan for true one-way changes.
- **Test the down before the up** — an unexercised rollback is not a rollback.
- **Expand-migrate-contract** — every deploy stays independently reversible.
- **The summary is for a human** — the operator approves plain language, not opaque SQL.
- **Verify after** — a migration that diverged from its summary is an incident.

## Fallback

- No scratch/restore environment to test the down → test against a production-shaped local copy, label the gap as infrastructure debt (ops); never skip the down-test.
- Genuinely irreversible change → operator sign-off BEFORE authoring + written recovery plan + risk entry; the reversibility requirement is replaced by explicit human acceptance, never waived silently.
- Urgent data fix mid-incident → STILL a prepared script the operator runs (incident-response's rule); urgency is the classic cover for the exact breach Rail 3 stops.
- Operator unavailable → the migration waits; dana does not run it to "unblock." A blocked migration is not an exception to Rail 3.

## Boundaries with Other Skills

- **charter/Rail 3**: this skill IS Rail 3's authoring workflow; quinn's charter-enforcement verifies no agent-executed destructive op ever occurs.
- **datastore-selection** (sibling) chooses the store; this stands it up and moves data into it.
- **data-modeling** (sibling) designs the schema a migration changes; **db-performance** (sibling) reviews index changes a migration includes.
- **ops/release-discipline**: consumes migrations in its deploy sequencing (expand-migrate-contract, operator-run); a migration is part of the deploy record.
- **quinn**: migrations in a locked plan are scanned for Rail 3 compliance; the operator-run path is verified, not assumed.
