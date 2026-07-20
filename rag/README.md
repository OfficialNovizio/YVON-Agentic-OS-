# YVON RAG — Retrieval-Augmented Generation

## What This Is

YVON RAG is the context delivery engine. It replaces naive document-level retrieval ("Spark uses `ogilvy-creative-code.md`, so inject the whole file") with chunk-level semantic retrieval ("Spark is reviewing a headline, so inject ONLY the headline rules section from Ogilvy").

## How It Fits Into YVON

```
Teams/ (651 .md files + 35 .py scripts + 13 books)
    ↓
RAG ← EMBEDS every chunk, INDEXES for vector search, RE-RANKS for relevance
    ↓
CIE Retrieval ← QUERIES RAG instead of fetching by agent assignment
    ↓
TOON Compress ← Compresses retrieved chunks before injection
    ↓
LLM ← Receives precisely relevant, compressed context
```

## Architecture (8 Elements)

| # | Element | What It Does | File |
|---|---------|-------------|------|
| 1 | **Semantic Chunker** | Splits .md files by heading sections, preserves metadata | `rag/chunkify.py` |
| 2 | **Hybrid Embedder** | Dense (all-MiniLM) + sparse (BM25) embeddings | `rag/embed.py` |
| 3 | **Agent-Aware Vector Store** | SQLite + sqlite-vec with tenant and agent pre-filters | `rag/store.py` |
| 4 | **Context Window Optimizer** | Budget allocator with diversity + priority constraints | `rag/optimizer.py` |
| 5 | **Cross-Encoder Re-ranker** | Top-20 → top-8 re-rank against actual query | `rag/rerank.py` |
| 6 | **TOON Integration** | Chunks carry both raw and TOON text | Built into chunker |
| 7 | **Feedback Loop** | Quality scoring per chunk per tenant | `rag/feedback.py` |
| 8 | **Re-index Worker** | File watcher that re-chunks on .md change | `rag/watcher.py` |

## Why This Beats 90% of Companies

- **Semantic chunks, not token-count chunks.** A chunk that starts mid-sentence is useless. We split by document structure.
- **Hybrid retrieval (dense + sparse).** Catches exact terms AND semantic meaning.
- **Agent-aware pre-filtering.** Never searches through Engineering documents for a Brand Studio query.
- **Local embeddings.** Zero API cost. Zero data leakage.
- **Multi-tenant isolation at the SQL level.** `WHERE tenant_id = 'x'` — not access control, query structure.
- **Self-improving.** Chunk quality scores adjust with usage. The system gets smarter over time.

## Quick Start

```bash
# 1. Chunk all documents
python3 rag/chunkify.py --all

# 2. Embed all chunks into vector store  
python3 rag/embed.py --all

# 3. Test the full pipeline
python3 rag/retriever.py --test

# 4. Run a query
python3 rag/retriever.py --query "review ad creative" --agent spark

# 5. Check status
python3 rag/chunkify.py --status
python3 rag/embed.py --status
```

## Folder Structure

```
rag/
├── README.md                          ← This file
├── ARCHITECTURE.md                    ← Full scaling model + design decisions
├── books/                             ← Design rationale grounded in source books
│   ├── prompt-engineering.md          ← Ogilvy, Heath, Berger, Cialdini → chunk construction
│   ├── context-engineering.md         ← DeMarco, Pareto, Lasswell → retrieval & allocation
│   └── harness-engineering.md         ← OECD, Kahneman, Security Charter → constraints & gates
├── chunkify.py                        ← Element 1: Semantic Chunker
├── chunks/
│   └── chunks.json                    ← 4,830 chunks from 659 files
├── embed.py                           ← Element 2: Hybrid Embedder
├── store/
│   └── rag.db                         ← SQLite + sqlite-vec vector store
├── optimizer.py                       ← Element 4: Context Window Optimizer (pending)
├── rerank.py                          ← Element 5: Cross-Encoder Re-ranker (pending)
├── feedback.py                        ← Element 7: Feedback Loop (pending)
└── watcher.py                         ← Element 8: Re-index Worker (pending)
```

## Book Grounding

Every design decision in this RAG system is grounded in a verifiable source. The `books/` folder documents which principles from which books inform which design choices:

| RAG Element | Prompt Engineering | Context Engineering | Harness Engineering |
|-------------|-------------------|---------------------|---------------------|
| Chunker | Ogilvy's Specificity Principle | DeMarco's measurement rule | Source authentication gate |
| Embedder | Cialdini's Authority (citation first) | Chunk freshness weighting | Reliability scoring |
| Context Optimizer | Heath's Commander's Intent | Pareto 80/20 budget | Adversarial chunk injection |
| Re-ranker | Berger's Practical Value filter | Lasswell traceability | Conflict detection |
| Feedback Loop | Von Restorff distinctiveness | Zajonc exposure plateau | Kahneman calibration weight |

## Shared OS Scripts Used

This RAG system imports existing formulas from `Teams/Shared OS/logical/`:

| Script | Function | Used For |
|--------|----------|----------|
| `staleness_economics.py` | `doc_freshness()` | Chunk freshness decay by document type |
| `marketing_laws.py` | `pareto_principle()` | Context budget allocation across tiers |
| `marketing_laws.py` | `lasswell_model()` | Injection traceability audit |
| `planning_fallacy.py` | `calibration_weight()` | Retrieval confidence calibration |
| `risk_management.py` | `risk_score()` | Chunk reliability scoring |
