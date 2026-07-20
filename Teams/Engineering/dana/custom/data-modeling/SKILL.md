---
name: data-modeling
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; the schema-design discipline implied by plan §3's db-design, split out from store-selection
marketplace_search: 2026-07-09 skillsmp.com — data-modeling/ERD skills found are diagram generators; kept custom as an integrity-and-consistency discipline bound to the chosen store's paradigm
assigned_agent: dana (Engineering / Data Architecture)
portable: true — modeling principles adapt per paradigm; the store comes from datastore-selection
includes: (no asset — method skill)
date_added: 2026-07-09
---

## Introduction

data-modeling is dana's schema discipline: designing the entities, relationships, keys, and constraints WITHIN the chosen store so the data is correct by construction — the database enforces what the application must not be trusted to. Whether relational (normalization, foreign keys, constraints), graph (nodes/edges/properties), or vector (embedding schema + metadata), the goal is the same: make invalid states unrepresentable.

## Purpose

Most data bugs are modeling failures: the nullable column that shouldn't be, the missing foreign key that let orphans accumulate, the duplicated data that drifted out of sync. A good model pushes correctness into the schema — a constraint the database enforces can't be forgotten by application code, and an agent especially can't "forget" a NOT NULL the way it can skip a validation.

## When to Use

Triggers: "design the schema," "model this data," "what tables/collections," "should this be normalized," "foreign keys," "how do we relate X and Y," and any new entity or relationship in the chosen store.

## Structure / Protocol

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

## Instructions

1. **Model the identity first.** What uniquely identifies each entity (natural vs surrogate key), and what are its relationships (one-to-many, many-to-many, optional vs required)? Getting identity and cardinality right is most of modeling; the rest follows.
2. **Constraints over conventions.** A rule the database enforces (FK, NOT NULL, UNIQUE, CHECK) beats a rule the application is supposed to follow — especially with agent-authored code, which can skip a validation but cannot skip a schema constraint. Make invalid states unrepresentable.
3. **Normalize by default; denormalize by evidence.** Start normalized (no redundant data to drift out of sync). Denormalize only when a measured read pattern demands it (axiom/db-performance evidence), and only with an explicit sync story — recorded, so the redundancy is a decision, not an accident.
4. **Model per the store's paradigm.** Don't impose relational habits on a graph (relationships are first-class edges, not join tables) or a document store (embed vs reference is the core choice). The paradigm was chosen for its shape in datastore-selection; model to that shape.
5. **Vectors need a source of truth.** Embeddings are derived data; the model records what they're derived from and how they're kept fresh (re-embed on source change). A vector store whose embeddings silently drift from their source is a correctness bug.
6. **Schema changes go through migrations.** A model change to a live store is never applied directly — it's a migration-discipline script the operator runs (Rail 3). Modeling is design; applying it is migration.

## Output Format

```
## Data Model: [domain] — [store/paradigm]
Entities + keys: [entity · identity · key type]
Relationships: [A —(cardinality)— B · required?]
Constraints (invalid states unrepresentable): [FK/NOT NULL/UNIQUE/CHECK · graph edge rules · vector schema]
Normalization: [normalized / denormalized-with-reason + sync story]
Change path: [→ migration-discipline, operator-run]
```

## Principles

- **Model identity and cardinality first** — the rest follows.
- **Constraints over conventions** — the DB enforces what agent code might skip.
- **Invalid states unrepresentable** — push correctness into the schema.
- **Normalize by default, denormalize by measured evidence** — redundancy is a recorded decision, never an accident.
- **Model to the store's paradigm** — graphs aren't join tables; documents choose embed-vs-reference.
- **Derived data (vectors) names its source** — drift from source is a correctness bug.

## Fallback

- Requirements unclear/evolving → model the stable core with constraints, leave genuinely uncertain areas flexible (nullable/optional) and labeled, tighten as requirements firm; don't over-constrain speculation.
- Performance pressure to denormalize early → require the measured read pattern first (db-performance/axiom); premature denormalization is the redundancy that drifts.
- Legacy schema can't take new constraints cleanly → add constraints via migration incrementally (validate-then-enforce), never a big-bang that locks the table.

## Boundaries with Other Skills

- **datastore-selection** (sibling) chose the store; this designs the schema within it.
- **migration-discipline** (sibling) applies every schema change — Rail 3, operator-run.
- **db-performance** (sibling) supplies the measured read patterns that justify denormalization and the indexes the model needs.
- **axiom**: storage-structure complexity informs graph/index modeling.
- **raj**: the API's data contracts should reflect this model; a mismatch is an integration bug.
- **aegis/cypher**: vector/embedding weaknesses (OWASP LLM L08) are a modeling-adjacent attack surface on RAG stores.
