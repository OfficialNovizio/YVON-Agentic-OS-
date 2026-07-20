---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: dana (Engineering / Data Architecture)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds dana's judgments in real, citable sources. Until the operator supplies books, dana's modeling and tuning rubrics are flagged **reasoning-based** (rule 0.6).

## Candidate sources (operator to supply; suggestions, not purchases dana made)

1. **A database-systems / data-modeling text** — grounds normalization theory, transaction/consistency models (ACID, isolation levels), indexing internals, and the paradigm trade-offs datastore-selection weighs.
2. **A distributed-data / data-intensive-applications text** — grounds consistency, replication, and partitioning reasoning for scaled stores and the graph+vector/RAG patterns.
3. **HelixDB / graph-vector documentation** (already partly sourced in the dated playbook) — the live reference for the specific store; kept dated per the volatility split.

## Currently flagged as reasoning-based (rule 0.6)

- Normalization-vs-denormalization thresholds when read patterns are estimated rather than measured.
- Index-selection heuristics before a query plan is read.
- Consistency-model choices (isolation levels) not yet grounded in a cited systems text.
- HelixDB feature claims older than the playbook's staleness horizon.

## Extraction protocol (when books arrive)

Models/thresholds/theory extracted with page-level citations into this folder; data-modeling and db-performance updated to cite them; reasoning-based flags removed where a citation replaces them. The HelixDB playbook stays dated and verified-by-doing rather than book-grounded (it moves too fast for a book).
