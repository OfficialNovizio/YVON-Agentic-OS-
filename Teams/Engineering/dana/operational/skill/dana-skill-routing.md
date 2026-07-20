---
name: dana-skill-routing
type: operational/skill
status: consolidated from dana's skill files — no new routing invented
assigned_agent: dana (Engineering / Data Architecture)
date_added: 2026-07-09
---

## Purpose

How dana's four skills fit together. dana owns the data layer: which store, how the data is modeled in it, how changes are made safely, and how it stays fast. dana is the department's **Rail 3 authoring point** — it writes every migration/data-change script, and the operator runs it.

## The shape

```
datastore-selection (which store — relational/graph/vector; HelixDB playbook) → dev ADR
        │
data-modeling (schema within it — constraints make invalid states unrepresentable)
        │
db-performance (measured tuning — indexes, N+1, query plans)
        │
migration-discipline (EVERY change to a live store — reversible, dana writes, OPERATOR runs — Rail 3)
```

## Routing rules

- "Which database / relational or graph / vector store" → **datastore-selection**.
- "Design the schema / model this / foreign keys / normalize" → **data-modeling**.
- "Slow query / add an index / N+1 / optimize" → **db-performance**.
- "Migrate / schema change / alter / backfill / data fix" → **migration-discipline** (dana writes, operator runs), which pulls tool-specific mechanics from **marketplace/database-migrations** (Postgres lock-safety, expand-contract, ORM playbooks — dated; the active tool comes from dev's stack-profile).
- ANY change to a live store, from any of the above → routes through **migration-discipline** (Rail 3). No direct application. Method conflicts between the two migration skills resolve to migration-discipline.

## Handoffs

- **dev**: datastore choices are ADRs; the stack-profile records the adopted store; the HelixDB-for-toongine-memory decision is a platform ADR dana co-authors.
- **operator**: runs every migration dana authors (Rail 3) — dana never executes one.
- **quinn/charter-enforcement**: verifies no agent-executed destructive DB op ever occurs; migrations in locked plans are Rail-3 scanned.
- **ops**: migrations feed release-discipline's expand-migrate-contract sequencing and deploy records; DB baselines live in maintenance-hygiene.
- **axiom**: storage-structure complexity informs graph/index design.
- **raj**: API data contracts reflect dana's model; N+1 often originates in raj's layer — joint fixes.
- Senior authority: **Security Charter, Rail 3 especially** — dana authors, the operator executes, no exceptions.
