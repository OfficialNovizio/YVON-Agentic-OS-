---
name: datastore-selection
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 "db-design (relational + graph/vector — HelixDB playbook)"
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — database-design skills found are single-paradigm (SQL schema helpers); the multi-paradigm selection discipline + HelixDB playbook is kept custom. HelixDB facts sourced from github.com/helixdb/helix-db (graph-vector DB in Rust, HelixQL, AGPL-3.0, Feb 2025)
assigned_agent: dana (Engineering / Data Architecture)
portable: true — the selection method is stack-agnostic; the chosen store lands in the stack-profile as an ADR
includes: assets/helixdb-playbook.md
date_added: 2026-07-09
---

## Introduction

datastore-selection is dana's choice discipline: matching data and access patterns to the right store — relational, document, key-value, graph, or vector — instead of forcing everything into the one the team already knows. It carries the HelixDB playbook because graph+vector is exactly the shape agent/RAG/memory workloads want, and because HelixDB is a live candidate for toongine's own memory layer (a platform-level ADR flagged in the plan).

## Purpose

The wrong datastore is a slow, expensive mistake to reverse. A relational store bent into a graph traversal, or a vector search bolted onto a SQL table, produces the N+1 queries and the latency cliffs that scale badly. Choosing by access pattern — and recording the choice as an ADR — puts the right shape under the data from the start.

## When to Use

Triggers: "which database," "relational or graph," "do we need a vector store," "how should we store this," a new data domain, RAG/embedding/memory workloads, and the toongine-memory platform decision.

## Structure / Protocol

```
A data domain to store
  -> Characterize: access patterns (point lookup / range / join-heavy / traversal / similarity) ·
     consistency needs · scale · relationships (shallow vs deep/recursive) · vector/semantic need
    -> Match to paradigm:
       relational (joins, transactions, known schema) · document (flexible/nested) ·
       KV (simple fast lookup) · graph (deep/recursive relationships, traversals) ·
       vector (similarity/embeddings/RAG) · graph+vector (agent memory, RAG-with-relationships → HelixDB)
      -> Record as a dev ADR (this is expensive to reverse); update the stack-profile on adoption
        -> Migrations to/within the chosen store follow migration-discipline (Rail 3: dana writes, operator runs)
```

## Instructions

1. **Access pattern decides the paradigm.** Point lookups want KV; joins and transactions want relational; deep/recursive relationships want graph; similarity/embeddings want vector; agent-memory and RAG-with-relationships want graph+vector together (the HelixDB case). Start from how the data is read and written, not from the familiar tool.
2. **Don't multiply stores without cause.** Each datastore is operational surface (backups, monitoring, expertise — ops's burden). A second store must earn its place against that cost (dev's boring-is-a-feature). One well-chosen store beats three convenient ones.
3. **Graph+vector = the HelixDB playbook.** When the workload is agent memory, RAG, or knowledge with relationships, consult `assets/helixdb-playbook.md` (HelixQL, graph+vector native, the toongine-memory candidacy). It's dated per the volatility split (ops's platform-playbooks pattern) — HelixDB shipped Feb 2025 and moves fast.
4. **The choice is an ADR.** Datastore selection is expensive to reverse, so it's a dev architecture-decision: two options weighed with their access-pattern fit, consequences honest. On adoption it updates the stack-profile; drift (code using an unlisted store) is a finding.
5. **toongine memory is a platform ADR.** Whether toongine's own graph-memory layer uses HelixDB is a platform-level decision dana co-authors with dev — flagged in the plan, decided as an ADR with marcus/board where it carries strategic/spend weight.
6. **Selection never runs the migration.** Choosing a store is design; standing it up and moving data into it is migration-discipline, where dana writes scripts and the operator executes them (Rail 3). The two are deliberately separate.

## Output Format

```
## Datastore Selection: [domain]
Access patterns: [lookup/range/join/traversal/similarity] · consistency: [ ] · scale: [ ] · relationships: [ ]
Options: [paradigm A — fit/cost] · [paradigm B — fit/cost]
Choice: [store] → dev ADR [ref] → stack-profile update
Graph+vector? → HelixDB playbook [ref] · toongine-memory relevance: [yes/no → platform ADR]
```

## Principles

- **Access pattern chooses the paradigm** — not the familiar tool.
- **Don't multiply stores without cause** — each is operational burden that must be earned.
- **Graph+vector workloads get the HelixDB playbook** — dated, per the volatility split.
- **Selection is an ADR** — expensive to reverse, recorded with options and consequences.
- **toongine memory is a platform ADR** — co-authored with dev, board where it carries weight.
- **Selecting ≠ migrating** — design here; data movement is migration-discipline under Rail 3.

## Fallback

- Access pattern unclear/early → start relational (well-understood, flexible) unless a clear graph/vector need exists; label provisional; revisit as patterns emerge (don't prematurely adopt exotic stores).
- HelixDB playbook stale (fast-moving project) → the dated playbook flags its own staleness; verify current HelixQL/features before committing (platform-playbooks discipline).
- Multi-store genuinely needed → document each store's boundary and the sync/consistency story explicitly; the seams are where data bugs live.

## Boundaries with Other Skills

- **dev/architecture-decisions**: datastore choices ARE ADRs; dev's stack-profile records the adopted store.
- **data-modeling** (sibling) designs the schema WITHIN the chosen store; this chooses the store.
- **migration-discipline** (sibling) stands up the store and moves data — Rail 3, operator-run.
- **db-performance** (sibling): the chosen store's indexing/query tuning.
- **axiom**: storage data-structure complexity (its DSA records) informs graph/index choices here.
- **ops**: each store adopted is backup/monitoring/expiry surface in maintenance-hygiene.
