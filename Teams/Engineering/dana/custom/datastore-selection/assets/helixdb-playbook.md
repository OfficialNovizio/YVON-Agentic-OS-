# HelixDB Playbook — [business name] — as of 2026-07-09

> Dated per the volatility split (ops/platform-playbooks). HelixDB is a fast-moving project (first release Feb 2025) — VERIFY current features before committing; past the staleness horizon this playbook flags itself. Source: github.com/helixdb/helix-db, helix-db.com.

**As of:** 2026-07-09 · **Staleness horizon:** [set ~3 months given release velocity] · **Source:** github.com/helixdb/helix-db (verify current)

## What it is
- Open-source **graph + vector** database, built in Rust, OLTP, on object storage. AGPL-3.0.
- Native graph traversal + vector search + keyword search in one engine; also supports KV, documents, relational.
- Query language: **HelixQL** — strongly typed, compiled. DSLs in Rust, TypeScript, Go, Python; dynamic requests via `POST /v1/query`.
- Positioned as "the database for AI memory" — RAG pipelines, agent/knowledge apps.

## When to choose it (from datastore-selection)
- Workload is agent memory, RAG-with-relationships, or knowledge graphs where BOTH traversal and similarity matter.
- You'd otherwise bolt a vector store onto a graph store (or vice versa) and maintain the seam.

## When NOT to
- Plain relational/transactional workloads (use relational — don't adopt a graph-vector DB for CRUD).
- No relationship or similarity need (a KV or document store is simpler operational surface).

## toongine memory candidacy (platform ADR — dana + dev)
- HelixDB is a candidate for toongine's OWN graph-memory layer (the blueprint's brain/context/sources).
- This is a PLATFORM-level decision, not a per-business one: decided as an ADR with marcus/board where strategic/spend weight applies.
- If adopted at platform level, per-business skills read/write "the configured memory layer" — they don't hardcode HelixDB.

## Operational notes (fill at adoption — Rail 3 applies to all data movement)
- Deploy/host: <FILL_IN> (→ ops platform-playbook)
- Backup + restore-test: <FILL_IN> (→ ops maintenance-hygiene; restore-tested-or-nonexistent)
- Schema/migration: HelixQL schema changes are migration-discipline scripts — dana writes, OPERATOR runs (Rail 3)
- Monitoring baselines: <FILL_IN> (→ ops)
- Egress/connector: <FILL_IN> (→ quinn allowlist, Rail 2)

## Verify-before-trust (ground truth beats this doc)
| Date | Feature/command checked | Confirmed/corrected |
|---|---|---|
| 2026-07-09 | graph+vector native, HelixQL, POST /v1/query | per public docs; verify at adoption |
