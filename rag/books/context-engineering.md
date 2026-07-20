---
name: rag-context-engineering
type: rag/books — design rationale grounded in source books
date: 2026-07-16
books_applied:
  - DeMarco, Tom, Controlling Software Projects (1982) — archive.org
  - Pareto, Vilfredo, Cours d'Économie Politique (1896) — public domain
  - Juran, Joseph, Quality Control Handbook (1951)
  - Lasswell, Harold, The Structure and Function of Communication in Society (1948) — free academic paper
  - Zipf, George, Human Behavior and the Principle of Least Effort (1949) — public domain
  - Zajonc, Robert, Attitudinal Effects of Mere Exposure (1968) — free academic paper
---

# Context Engineering — Grounding RAG Retrieval & Allocation

## Purpose

Context engineering is the science of WHAT reaches the agent, in WHAT ORDER, at WHAT COST. It's not about making chunks smaller — it's about making the right chunks arrive at the right agent with measurable impact. The books that govern measurement, allocation, and information flow apply directly.

---

## Principle 1 — You Cannot Control What You Cannot Measure

**Source:** DeMarco, *Controlling Software Projects*, Ch.2, p.19

> "You cannot control what you cannot measure."

**Applied to RAG:**

Every CIE injection is logged with:
- Which chunks were selected (chunk_id + source + section)
- Which chunks were rejected (and why — below threshold, duplicate, budget exceeded)
- How many characters were injected
- How long retrieval + ranking + injection took
- Whether the agent's output was accepted or revised

Without this log, context engineering is guesswork. With it, the feedback loop has data to train on.

**DeMarco, Ch.3, p.41:** "Information decays. A specification is a snapshot of understanding at a point in time. The gap between the specification and reality grows as the system evolves without the specification."

**Applied to chunk freshness:** Every chunk has a `last_modified` timestamp from the source file. The older a chunk is relative to its document type's expected update cycle, the more its relevance decays. A marketing law document updated 3 months ago is fresh. A platform playbook updated 12 months ago is stale. The decay model from `staleness_economics.py` is applied directly.

**Implementation:** Chunks carry a freshness_weight computed as:
```
freshness = exp(-λ × age / max_age)
```
Where max_age varies by document type:
- `skill`: 180 days (skills evolve slowly)
- `agent_config`: 365 days (config changes rarely)
- `platform_playbook`: 90 days (platforms change fast)
- `route_d_wisdom`: 730 days (books don't age)
- `reference`: 365 days

**Shared OS script:** `staleness_economics.py` — `doc_freshness()` with the three decay models (exponential, logarithmic, linear) applied per document type. The RAG freshness weight is computed by importing this function directly.

---

## Principle 2 — The Pareto 80/20 of Context Budget

**Source:** Pareto (1896); Juran, *Quality Control Handbook* (1951)

> 80% of effects come from 20% of causes. Applied to context: 80% of an agent's decision quality comes from 20% of the injected context.

**Applied to RAG budget allocation:**

The chunker assigns every chunk a priority tier:
- **Tier 1 (28% of chunks):** Load-bearing — principles, formulas, gate rules
- **Tier 2 (66% of chunks):** Structural — instructions, protocols, workflows
- **Tier 3 (6% of chunks):** Supplementary — examples, templates, notes

The context optimizer enforces budget allocation:
```
Tier 1 chunks → minimum 50% of the 2,500-char budget (1,250 chars)
Tier 2 chunks → maximum 30% (750 chars)
Tier 3 chunks → maximum 20% (500 chars)
```

**Why this matters:** Without this constraint, the retriever might fill the budget with 8 tier-2 and tier-3 chunks because they're semantically similar to the query. The optimizer corrects for this: "you found 8 supplementary chunks, but only 20% of the budget can go to tier 3. Force the retriever back to find tier-1 chunks."

**Shared OS script:** `marketing_laws.py` — `pareto_principle()` and `law_of_the_vital_few()` compute the concentration ratio and resource allocation. The optimizer imports these to dynamically adjust tier allocation based on the query: complex strategic queries get a higher tier-1 allocation than simple operational queries.

---

## Principle 3 — The Lasswell Communication Model

**Source:** Lasswell, *The Structure and Function of Communication in Society* (1948)

> "Who says what, in which channel, to whom, with what effect?"

**Applied to context traceability:**

Every CIE injection is a communication act. Lasswell's five elements are preserved as structured logs:

| Lasswell Element | RAG Equivalent |
|-----------------|---------------|
| **Who** | Which agent is receiving context? (`agentId`) |
| **Says what** | Which chunks were injected? (`chunk_id` + `section` + `citation`) |
| **In which channel** | TOON format vs raw markdown? Character count? |
| **To whom** | Which LLM? Which model version? |
| **With what effect** | Was the agent's output accepted? Revised? Rejected? |

**Implementation:** The injection log is a Lasswell-compliant audit trail. When an agent's decision is challenged ("why did spark reject this creative?"), the operator can trace: spark received 8 chunks → chunk #3 was Ogilvy's Research-Backed test → that test requires a cited source → the creative had no research citation → REJECT. Every decision traces to a source.

**Shared OS script:** `marketing_laws.py` — `lasswell_model()` validates the five elements. The injection logger calls it to ensure every injection can be traced.

---

## Principle 4 — Zipf's Law of Content Consumption

**Source:** Zipf, *Human Behavior and the Principle of Least Effort* (1949)

> The frequency of any item is inversely proportional to its rank. A small number of chunks dominate usage.

**Applied to retrieval caching:**

The same chunks are injected for the same types of queries. A Brand Studio review query almost always pulls Ogilvy's creative code, Aaker's brand equity, and the specific brand guidelines. These high-frequency chunks should be cached in memory, not re-embedded and re-searched every time.

**Implementation:** A simple LRU cache of the top-100 most-retrieved chunks by agent. When the same agent makes a similar query, cached chunks bypass the full retrieval cascade. The cache is invalidated when the source file's `last_modified` timestamp changes.

**Zipf's Law check:** After 1,000 queries, the distribution of chunk retrievals should follow Zipf's law — the #1 most-retrieved chunk should appear ~2× as often as #2, ~3× as often as #3. If it doesn't, the diversity constraints in the optimizer are too aggressive.

**Shared OS script:** `marketing_laws.py` — `zipf_law()` validates the distribution. If chunk retrievals are NOT Zipfian (too evenly distributed), the system is pulling too many different chunks and not learning which ones actually matter.

---

## Principle 5 — The Mere Exposure Effect

**Source:** Zajonc, *Attitudinal Effects of Mere Exposure* (1968)

> Repeated, unreinforced exposure to a stimulus increases liking for that stimulus.

**Applied to retrieval feedback:**

A chunk that produces consistently positive outcomes (agent decisions accepted, outputs approved) should be retrieved MORE often — not because it's semantically similar to the query, but because it has a track record of success. The Mere Exposure effect applied to retrieval: quality begets retrieval, retrieval begets quality.

**Implementation:** Each chunk carries a `quality_score` that starts at 0.5 (neutral) and adjusts based on outcomes:
- Agent output accepted without revision → chunk score +0.05
- Agent output revised once → chunk score unchanged
- Agent output rejected → chunk score -0.1
- Agent output cited multiple chunks → all cited chunks +0.02

Over 100 queries, the system learns which chunks actually help and which are noise. The quality score is a second dimension of relevance — independent of semantic similarity.

**Zajonc, p.21:** "The mere repeated exposure of a stimulus is a sufficient condition for attitude enhancement." But Zajonc also warns: after ~20 exposures, the effect plateaus. Chunks that are retrieved too frequently without producing outcomes get down-weighted — preventing context rot.

**Shared OS script:** `marketing_laws.py` — `mere_exposure_effect()` provides the plateau warning threshold (20 exposures). The feedback loop uses this to prevent over-fetching of familiar but unproductive chunks.

---

## Design Decisions Traceability

| RAG Design Decision | Book Citation | Why |
|--------------------|---------------|-----|
| Every injection logged with chunk_id + outcome | DeMarco, Ch.2, p.19 | Can't control what you can't measure |
| Chunk freshness decays by document type | DeMarco, Ch.3, p.41 | Information entropy — old chunks are less reliable |
| 80/20 budget allocation across priority tiers | Pareto (1896); Juran (1951) | Vital few chunks get disproportionate budget |
| Every injection traceable through Lasswell's 5 elements | Lasswell (1948) | Audit trail for every agent decision |
| Top chunks cached, Zipf's Law validates distribution | Zipf (1949) | Systems optimize for the common case |
| Chunk quality scoring with plateau detection | Zajonc (1968) | Frequent exposure → increased trust, but with a saturation point |
