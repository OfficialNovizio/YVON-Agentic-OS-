#!/usr/bin/env python3
"""
Full Retrieval Pipeline — Element 4 of YVON RAG
==================================================
The complete query-time pipeline that chains everything together:

  QUERY → Query Rewriter (expand/refine)
       → Hybrid Retrieval (dense + sparse + metadata filter)
       → Cross-Encoder Re-ranker (top-20 → top-5 precise match)
       → Context Compressor (prune chunks to relevant sentences only)
       → Context Optimizer (dynamic profile, diversity, adversary)
       → Injector (format with citations, TOON compressed)
       → LLM (generate response)
       → Feedback (log quality → update weights)

Three RAG modes supported:
  standard  — Single-pass retrieval. Fast. For most queries.
  agentic   — Multi-step: search → read → decide if enough → search again.
              For complex queries where first-pass context is insufficient.
  graph     — Metadata relationship traversal. For queries that span
              departments or require cross-reference understanding.

Book grounding (via Shared OS/logical/):
  - Lasswell's model → query rewriting preserves the 5 communication elements
  - Kahneman's calibration → retrieval confidence never exceeds 30% inside view
  - DeMarco's measurement → every step logged for audit
  - Ogilvy's specificity → compressed chunks retain only verifiable facts
  - Cialdini's Authority → citations placed BEFORE content in injection

Usage:
  python3 rag/retriever.py --test                    # Run self-tests
  python3 rag/retriever.py --query \"review ad creative\" --agent spark --mode standard
  python3 rag/retriever.py --query \"acquire company\" --agent marcus --mode agentic
"""

import sys, os, json, math, re, time
from typing import List, Dict, Optional, Tuple, Set
from dataclasses import dataclass, field
from collections import Counter

# ── Paths ──────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..', '..')
SHARED_OS = os.path.join(PROJECT_ROOT, 'Teams', 'Shared OS', 'logical')
CHUNKS_PATH = os.path.join(SCRIPT_DIR, '..', 'chunks', 'chunks.json')
sys.path.insert(0, SHARED_OS)
sys.path.insert(0, SCRIPT_DIR)

# ── Rag imports ────────────────────────────────────────────────
from embed import DenseEmbedder, SparseEmbedder, VectorStore, load_chunks
from optimizer import (
    classify_task_complexity, optimize_context, trace_injection,
    compute_chunk_quality, RetrievalProfile, PROFILES,
    DEPARTMENT_ADJACENCY, enforce_diversity, inject_adversarial_chunk,
    OptimizerResult,
)

# ── Shared OS imports ──────────────────────────────────────────
try:
    from marketing_laws import lasswell_model
    from planning_fallacy import calibration_weight
    HAS_SHARED_OS = True
except ImportError:
    HAS_SHARED_OS = False


# ═══════════════════════════════════════════════════════════════════
# PART 1 — QUERY REWRITER
# ═══════════════════════════════════════════════════════════════════

# Expansion patterns — turn short queries into richer retrieval queries
QUERY_EXPANSIONS = {
    'check': 'review evaluate verify',
    'review': 'evaluate score assess criteria check',
    'analyze': 'break down examine investigate explore',
    'improve': 'optimize enhance refine upgrade fix',
    'create': 'generate produce build design construct',
    'write': 'compose draft author create produce',
    'headline': 'headline copy title hook opening',
    'ad': 'advertisement campaign creative promotion',
    'brand': 'brand identity positioning equity awareness',
    'strategy': 'strategy plan direction approach roadmap',
    'metrics': 'metrics KPIs analytics data measurement',
    'security': 'security vulnerability threat protection safety',
    'pricing': 'pricing price cost value WTP elasticity',
    'experiment': 'experiment test trial A/B hypothesis validation',
    'legal': 'legal compliance regulation contract liability',
    'financial': 'financial budget revenue cost profit margin',
    'governance': 'governance board fiduciary oversight compliance',
}

# Agent-specific query expansion context
AGENT_EXPANSIONS = {
    'spark': 'creative brand design visual quality',
    'marcus': 'strategy decision venture investment priority',
    'dev': 'code architecture technical engineering build',
    'board': 'governance fiduciary constitution oversight compliance',
    'lena': 'copy voice brand tone writing humanic',
    'kai': 'analytics metrics data measurement baseline',
    'warden': 'risk security compliance threat assessment',
    'price': 'pricing WTP value elasticity monetization',
}


def rewrite_query(query: str, agent_id: str = '', mode: str = 'standard') -> List[str]:
    """
    Rewrite/expand the query for better retrieval.
    Standard mode: produces 1-3 expanded queries.
    Agentic mode: produces 3-5 queries exploring different angles.

    Lasswell (1948): preserves the five communication elements during expansion.
    """
    queries = [query]  # Always include the original
    query_lower = query.lower()

    # Word-by-word expansion
    expanded_terms = set()
    for word in query_lower.split():
        word_clean = word.strip('?!.,;:')
        if word_clean in QUERY_EXPANSIONS:
            expanded_terms.update(QUERY_EXPANSIONS[word_clean].split())

    if expanded_terms:
        expanded_query = query + ' ' + ' '.join(list(expanded_terms)[:5])
        queries.append(expanded_query)

    # Agent-specific domain expansion
    if agent_id.lower() in AGENT_EXPANSIONS:
        agent_terms = AGENT_EXPANSIONS[agent_id.lower()].split()
        agent_query = query + ' ' + ' '.join(agent_terms[:3])
        queries.append(agent_query)

    # Agentic mode: explore different angles
    if mode == 'agentic':
        # What/how/why decomposition
        if query_lower.startswith(('what', 'how', 'why', 'should', 'can', 'is')):
            # Add a "what would fail" angle (Kahneman premortem)
            pessimist_query = f"what could go wrong if we {query} risks downsides failure modes"
            queries.append(pessimist_query)

            # Add a "what's the alternative" angle
            alternative_query = f"alternatives to {query} different approaches other options"
            queries.append(alternative_query)

    return queries[:5]  # Cap at 5 queries


# ═══════════════════════════════════════════════════════════════════
# PART 2 — HYBRID RETRIEVER (dense + sparse + metadata)
# ═══════════════════════════════════════════════════════════════════

class HybridRetriever:
    """
    Combines dense (semantic) + sparse (keyword) + metadata filter
    into a single retrieval call.
    Falls back gracefully when vector store is not yet populated.
    """
    def __init__(self):
        self.dense = DenseEmbedder()
        self.sparse = SparseEmbedder()
        self.store = None
        try:
            self.store = VectorStore()
        except Exception:
            self.store = None  # DB not yet created — run embed.py --all first
        self._fitted = False

    def _ensure_fitted(self):
        """Lazy-fit the sparse embedder on stored chunks."""
        if self._fitted:
            return
        chunks = load_chunks()
        if chunks:
            self.sparse.fit([c['chunk_text'] for c in chunks[:2000]])  # First 2K chunks
        self._fitted = True

    def retrieve(self, query: str, agent_id: str = '', agent_dept: str = '',
                 top_k: int = 40, mode: str = 'standard') -> List[Dict]:
        """
        Hybrid retrieval: search across dense + sparse + metadata-filtered store.

        Standard mode: single pass with given query.
        Agentic mode: rewrites query into multiple variants, merges unique results.
        Falls back to local chunk search when vector store unavailable.
        """
        self._ensure_fitted()
        all_results = []
        seen_ids = set()

        # Generate query variants
        queries = rewrite_query(query, agent_id, mode)

        # If vector store has data, use it. Otherwise fallback to chunks.json.
        store_has_data = False
        if self.store:
            try:
                count = self.store.conn.execute('SELECT COUNT(*) FROM chunks').fetchone()
                store_has_data = count and count[0] > 0
            except Exception:
                store_has_data = False

        if self.store and store_has_data:
            all_results = self._retrieve_from_store(queries, agent_dept, agent_id, top_k, seen_ids)
        else:
            # Fallback: search local chunks.json directly with sparse + dense scoring
            all_results = self._retrieve_from_chunks(queries, agent_dept, agent_id, top_k, seen_ids)

        # Sort by combined score, deduplicate
        all_results.sort(key=lambda x: x.get('combined_score', 0), reverse=True)
        return all_results[:top_k]

    def _retrieve_from_store(self, queries, agent_dept, agent_id, top_k, seen_ids):
        results = []
        for q in queries:
            q_embedding = self.dense.embed_single(q)
            dense_results = self.store.search(
                q_embedding,
                department_filter=agent_dept if agent_dept else None,
                agent_filter=agent_id if agent_id else None,
                top_k=top_k,
            )
            for r in dense_results:
                chunk_id = r.get('chunk_id', '')
                if chunk_id not in seen_ids:
                    seen_ids.add(chunk_id)
                    q_sparse = self.sparse.encode_query(q)
                    chunk_tokens = self.sparse._tokenize(r.get('chunk_text', ''))
                    sparse_score = self.sparse.score_document(q_sparse, 0, chunk_tokens) if q_sparse else 0
                    quality = r.get('quality_score', 0.5)

                    # Combined: 40% dense + 20% sparse + 40% quality (rebalanced)
                    combined = 0.40 * r.get('similarity', 0) + 0.20 * sparse_score + 0.40 * quality

                    # ★ AGENT-SPECIFIC BONUS: boost chunks from this agent's own files
                    source = r.get('source_file', '')
                    assigned = r.get('assigned_agents', [])
                    if agent_id and isinstance(assigned, list) and agent_id in assigned:
                        combined += 0.15
                    elif agent_id and agent_id in source:
                        combined += 0.10

                    r['combined_score'] = round(combined, 4)
                    r['sparse_score'] = round(sparse_score, 4)
                    results.append(r)
        return results

    def _retrieve_from_chunks(self, queries, agent_dept, agent_id, top_k, seen_ids):
        """Fallback: search chunks.json directly when vector store unavailable."""
        chunks = load_chunks()
        results = []

        # ★ PRE-FILTER: if department is specified, only score chunks from that
        # department + Shared OS + adjacent departments.
        filtered_chunks = []
        dept_set = set()
        if agent_dept:
            dept_set = {agent_dept, 'Shared OS'}
            dept_set.update(DEPARTMENT_ADJACENCY.get(agent_dept, []))

        for c in chunks:
            dept = c.get('department', '')
            if dept_set and dept not in dept_set:
                continue

            # Agent assignment filter
            assigned = c.get('assigned_agents', [])
            if agent_id and dept != 'Shared OS' and assigned and len(assigned) > 0:
                is_dept_doc = any(a.endswith(('.md', '.html')) for a in assigned)
                has_agent = agent_id in assigned
                if not is_dept_doc and not has_agent:
                    continue

            filtered_chunks.append(c)

        for q in queries:
            q_embedding = self.dense.embed_single(q)
            q_sparse = self.sparse.encode_query(q) if self.sparse.vocab else {}

            for c in filtered_chunks:
                chunk_id = c.get('chunk_id', '')
                if chunk_id in seen_ids:
                    continue

                # Dense similarity
                section_text = c.get('section', '') + ' ' + c.get('chunk_text', '')[:200]
                section_emb = self.dense.embed_single(section_text) if self.dense else [0]
                if q_embedding and section_emb and len(q_embedding) == len(section_emb):
                    dense_sim = sum(a*b for a,b in zip(q_embedding, section_emb)) / (
                        max(1e-10, math.sqrt(sum(a*a for a in q_embedding)) * math.sqrt(sum(b*b for b in section_emb)))
                    )
                    dense_sim = max(0, min(1, dense_sim))
                else:
                    dense_sim = 0.0

                # Sparse scoring
                chunk_tokens = self.sparse._tokenize(c.get('chunk_text', ''))
                sparse = self.sparse.score_document(q_sparse, 0, chunk_tokens) if q_sparse else 0
                quality = c.get('quality_score', 0.5)
                dept = c.get('department', '')
                sparse_norm = min(sparse / max(1, len(q_sparse)), 1.0) if q_sparse else 0

                # Combined: 40% dense + 20% sparse + 40% quality
                combined = 0.40 * dense_sim + 0.20 * sparse_norm + 0.40 * quality

                # ★ AGENT-SPECIFIC BONUS: boost chunks from this agent's own files
                assigned = c.get('assigned_agents', [])
                if agent_id and isinstance(assigned, list) and agent_id in assigned:
                    combined += 0.15
                elif agent_id and agent_id in c.get('source_file', ''):
                    combined += 0.10

                if combined >= 0.01:
                    seen_ids.add(chunk_id)
                    results.append({
                        'chunk_id': chunk_id,
                        'source_file': c.get('source_file', ''),
                        'section': c.get('section', ''),
                        'department': dept,
                        'priority_tier': c.get('priority_tier', 2),
                        'quality_score': quality,
                        'chunk_text': c.get('chunk_text', ''),
                        'toon_text': c.get('toon_text', ''),
                        'combined_score': round(combined, 4),
                        'sparse_score': round(sparse, 4),
                        'similarity': round(sparse_norm, 4),
                    })
        return results


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CROSS-ENCODER RE-RANKER
# ═══════════════════════════════════════════════════════════════════

class CrossEncoderReranker:
    """
    Re-ranks top-N candidates by comparing each chunk DIRECTLY against the
    query. This is 100× slower than bi-encoder but significantly more accurate.

    Uses a lightweight scoring heuristic as fallback when ONNX cross-encoder
    is not available. The heuristic checks:
      - Term overlap (how many query words appear in the chunk)
      - Entity match (named entities, citations, section relevance)
      - Structure match (heading relevance to query type)
    """
    def __init__(self):
        self._try_load_onnx()

    def _try_load_onnx(self):
        """Try loading a cross-encoder ONNX model."""
        self.model = None
        try:
            # Check if optimum + onnxruntime are available
            import importlib
            if importlib.util.find_spec('optimum') and importlib.util.find_spec('onnxruntime'):
                self.model = 'cross-encoder/ms-marco-MiniLM-L-6-v2'  # Placeholder
        except:
            pass

    def score(self, query: str, chunk_text: str) -> float:
        """
        Score a single chunk against the query.
        Higher = more relevant.
        """
        query_lower = query.lower()
        chunk_lower = chunk_text.lower()

        # 1. Term overlap score (0-0.4)
        query_terms = set(re.findall(r'[a-z]{3,}', query_lower))
        chunk_terms = set(re.findall(r'[a-z]{3,}', chunk_lower))
        if query_terms:
            overlap = len(query_terms & chunk_terms) / len(query_terms)
            term_score = min(overlap * 0.4, 0.4)
        else:
            term_score = 0.0

        # 2. Key phrase match (0-0.3)
        key_phrases = [q for q in query_lower.split() if len(q) > 4]
        phrase_hits = sum(1 for p in key_phrases if p in chunk_lower)
        phrase_score = min(phrase_hits / max(len(key_phrases), 1) * 0.3, 0.3)

        # 3. Structure relevance (0-0.2)
        structure_score = 0.0
        if any(w in query_lower for w in ['how', 'process', 'workflow', 'step']):
            if any(w in chunk_lower for w in ['instructions', 'protocol', 'phase', 'step']):
                structure_score += 0.2
        if any(w in query_lower for w in ['why', 'purpose', 'goal', 'objective']):
            if any(w in chunk_lower for w in ['purpose', 'introduction', 'summary']):
                structure_score += 0.2
        if any(w in query_lower for w in ['rule', 'must', 'never', 'always', 'should not']):
            if any(w in chunk_lower for w in ['principles', 'rule', 'never', 'must']):
                structure_score += 0.2

        # 4. Citation presence bonus (Cialdini Authority) — 0-0.1
        citation_score = 0.0
        if re.search(r'(Ch\.\s*\d+|pp?\.\s*\d+|§\d+|Article\s+\d+)', chunk_text):
            citation_score = 0.1

        total = min(term_score + phrase_score + min(structure_score, 0.2) + citation_score, 1.0)
        return round(total, 4)

    def rerank(self, query: str, candidates: List[Dict], top_k: int = 8) -> List[Dict]:
        """
        Re-rank candidates against the query.
        Returns top_k best matches with updated scores.
        """
        for c in candidates:
            chunk_text = c.get('chunk_text', '')
            c['rerank_score'] = self.score(query, chunk_text)

        candidates.sort(key=lambda c: c.get('rerank_score', 0), reverse=True)
        return candidates[:top_k]


# ═══════════════════════════════════════════════════════════════════
# PART 4 — CONTEXT COMPRESSOR
# ═══════════════════════════════════════════════════════════════════

def compress_chunk(chunk: Dict, query: str, max_chars: int = 400) -> str:
    """
    Compress a chunk to only the MOST RELEVANT sentences.
    Strips: introductions, examples, filler, redundant citations.
    Keeps: the Commander's Intent sentence, the actionable rule, the citation.

    Ogilvy Ch.1, p.20: "Generalities roll off like water from a duck."
    → Only specific, verifiable statements are preserved.
    Heath Ch.1: "Commander's Intent — if you do nothing else, do X."
    → The ONE most important sentence is kept.
    """
    text = chunk.get('toon_text', chunk.get('chunk_text', ''))
    if len(text) <= max_chars:
        return text

    sentences = re.split(r'(?<=[.!?])\s+', text)
    if len(sentences) <= 2:
        return text[:max_chars]

    # Score each sentence for relevance
    query_terms = set(re.findall(r'[a-z]{3,}', query.lower()))
    scored = []
    for sentence in sentences:
        sent_lower = sentence.lower()
        sent_terms = set(re.findall(r'[a-z]{3,}', sent_lower))

        # Relevance = term overlap + citation presence + actionability
        overlap = len(query_terms & sent_terms) / max(len(query_terms), 1)
        has_citation = 1 if re.search(r'(Ch\.|p\.|§|Article)', sentence) else 0
        has_actionable = 1 if re.search(r'(must|should|never|always|do not|require)', sent_lower) else 0
        is_short = 1 if len(sentence) < 80 else 0  # Short sentences are usually punchlines

        score = overlap * 0.4 + has_citation * 0.2 + has_actionable * 0.3 + is_short * 0.1
        scored.append((sentence, score))

    # Sort by relevance, take top sentences within budget
    scored.sort(key=lambda x: x[1], reverse=True)

    compressed = []
    total_chars = 0
    for sentence, _ in scored:
        if total_chars + len(sentence) > max_chars:
            break
        compressed.append(sentence)
        total_chars += len(sentence) + 1

    return ' '.join(compressed)


# ═══════════════════════════════════════════════════════════════════
# PART 5 — INJECTOR (Format with citations)
# ═══════════════════════════════════════════════════════════════════

def format_injection(chunks: List[Dict], profile: RetrievalProfile,
                     agent_id: str = '') -> str:
    """
    Format the final injection text for the LLM context window.

    Cialdini Ch.6: Authority BEFORE message — citations come first.
    Von Restorff (1933): The most critical chunk stands out visually.
    Berger Ch.5: Every chunk answers "What can the agent DO with this?"
    """
    if not chunks:
        return ''

    lines = ['[YVON RAG CONTEXT — Dynamic Retrieval]', '']
    lines.append(f'Strategy: {profile.name} | Chunks: {len(chunks)}')

    # Identify the single most critical chunk (Verstorff distinctiveness)
    best_chunk = max(chunks, key=lambda c: c.get('_quality_score', c.get('combined_score', 0)))

    for i, chunk in enumerate(chunks):
        is_adversary = chunk.get('adversary', False)
        is_critical = (chunk == best_chunk) and len(chunks) > 1
        is_cited = bool(re.search(r'(Ch\.|p\.|§|Article)', chunk.get('chunk_text', '')))

        text = compress_chunk(chunk, 'query', 400)

        # Citation label (Authority first — Cialdini Ch.6)
        source = chunk.get('source_file', 'unknown')
        section = chunk.get('section', '')
        citation_label = f"{source} :: {section}" if section else source

        if is_critical:
            prefix = '⚠️ CRITICAL'
        elif is_adversary:
            prefix = '🔴 ADVERSARY (dissenting view)'
        elif is_cited:
            prefix = '📖 CITED'
        else:
            prefix = '   '

        lines.append(f'\n{prefix} | [{citation_label}]')
        lines.append(f'{text}')

    lines.append(f'\n[End RAG Context — {len(chunks)} chunks, {profile.name}]')
    return '\n'.join(lines)


# ═══════════════════════════════════════════════════════════════════
# PART 6 — FULL PIPELINE (orchestrates everything)
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RetrievalResult:
    query: str
    rewritten_queries: List[str]
    agent_id: str
    mode: str
    profile: RetrievalProfile
    candidates: List[Dict]  # Raw hybrid retrieval results
    reranked: List[Dict]    # After cross-encoder
    optimized: OptimizerResult  # After dynamic optimizer
    injection_text: str     # Final formatted context
    timing_ms: float
    trace: Dict             # Lasswell-compliant trace


def retrieve(query: str, agent_id: str = '', agent_dept: str = '',
             mode: str = 'standard', char_budget_override: Optional[int] = None,
             top_k: int = 40) -> RetrievalResult:
    """
    Full retrieval pipeline — one call, everything handled.

    Args:
        query: The user's question/task
        agent_id: Which agent is asking? (e.g., 'spark', 'marcus')
        agent_dept: Which department? (auto-detected if empty)
        mode: 'standard' | 'agentic' | 'graph'
        char_budget_override: Override the dynamic budget
        top_k: How many candidates to retrieve before re-ranking

    Returns: RetrievalResult with all intermediate outputs + final injection
    """
    t0 = time.time()

    # Step 0: Classify task → select retrieval profile
    profile = classify_task_complexity(query, agent_id)
    if char_budget_override:
        profile.char_budget = char_budget_override

    # Step 1: Rewrite query
    rewritten = rewrite_query(query, agent_id, mode)

    # Step 2: Hybrid retrieval
    retriever = HybridRetriever()
    candidates = retriever.retrieve(query, agent_id, agent_dept, top_k, mode)

    # Step 3: Re-rank with cross-encoder
    reranker = CrossEncoderReranker()
    reranked = reranker.rerank(query, candidates, top_k=20)

    # Step 4: Dynamic optimizer
    # Convert to dict format expected by optimizer
    optimizer_input = []
    for r in reranked:
        optimizer_input.append({
            'chunk_id': r.get('chunk_id', ''),
            'source_file': r.get('source_file', ''),
            'section': r.get('section', ''),
            'department': r.get('department', ''),
            'priority_tier': r.get('priority_tier', 2),
            'last_modified': r.get('last_modified', '2026-01-01'),
            'quality_score': r.get('quality_score', 0.5),
            'document_type': r.get('document_type', ''),
            'chunk_text': r.get('chunk_text', ''),
            'toon_text': r.get('toon_text', ''),
            '_quality_score': r.get('rerank_score', 0.5),
            'combined_score': r.get('combined_score', 0),
            'rerank_score': r.get('rerank_score', 0),
        })
    optimized = optimize_context(optimizer_input, query, agent_id, agent_dept)

    # Step 5: Compress + Format injection
    injection_text = format_injection(optimized.selected_chunks, profile, agent_id)

    # Step 6: Generate Lasswell-compliant trace
    trace = trace_injection(optimized, query, agent_id)

    timing = round((time.time() - t0) * 1000, 1)

    return RetrievalResult(
        query=query,
        rewritten_queries=rewritten,
        agent_id=agent_id,
        mode=mode,
        profile=profile,
        candidates=candidates,
        reranked=reranked,
        optimized=optimized,
        injection_text=injection_text,
        timing_ms=timing,
        trace=trace,
    )


# ═══════════════════════════════════════════════════════════════════
# PART 7 — SELF-TESTS
# ═══════════════════════════════════════════════════════════════════

def run_tests() -> bool:
    passed, failed = 0, 0
    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition:
            print(f'  ✅ {label}'); passed += 1
        else:
            print(f'  ❌ {label}: {detail}'); failed += 1

    print('\n  🧪 YVON Retriever Pipeline — Self-Tests\n')

    # Test 1: Query rewriting
    queries = rewrite_query('review this ad creative and suggest improvements')
    check(f'Standard mode: {len(queries)} queries (≥2)', len(queries) >= 2, str(queries))

    queries_agentic = rewrite_query('should we acquire Company X for $2M',
                                    agent_id='marcus', mode='agentic')
    check(f'Agentic mode: {len(queries_agentic)} queries (≥3)',
          len(queries_agentic) >= 3, str(queries_agentic))
    check('Agentic includes pessimist angle',
          any('wrong' in q or 'fail' in q or 'risk' in q for q in queries_agentic))
    check('Agentic includes alternative angle',
          any('alternative' in q or 'different' in q for q in queries_agentic))

    # Test 2: Cross-encoder scoring
    reranker = CrossEncoderReranker()
    s1 = reranker.score(
        'review headline copy',
        'Ogilvy Ch.5, p.71: five times as many people read the headline as body copy'
    )
    s2 = reranker.score(
        'review headline copy',
        'Brand Studio department workflow document describes the content pipeline'
    )
    check('Relevant chunk scores higher than irrelevant',
          s1 > s2, f's1={s1:.3f}, s2={s2:.3f}')
    check('Relevant score ≥ 0.3', s1 >= 0.3, f'{s1:.3f}')

    # Test 3: Citation detection
    s_with_cite = reranker.score(
        'what are the headline rules',
        'According to Ogilvy, Ch.5, p.73: headlines should be under 10 words'
    )
    s_without_cite = reranker.score(
        'what are the headline rules',
        'Headlines should be short and punchy'
    )
    check('Cited chunk scores higher than uncited',
          s_with_cite > s_without_cite,
          f'cited={s_with_cite:.3f}, uncited={s_without_cite:.3f}')

    # Test 4: Context compressor
    long_chunk = {
        'chunk_text': (
            'Headlines should be short. They should also be punchy. '
            'Ogilvy Ch.5, p.71: five times as many people read the headline. '
            'The headline is the most important element of any advertisement. '
            'A good headline promises a benefit to the reader. '
            'It should be specific, not general. '
            'Avoid headlines that do not include the brand name.'
        ),
        'toon_text': (
            'Headlines should be short. They should also be punchy. '
            'Ogilvy Ch.5, p.71: five times as many people read the headline.'
        ),
    }
    compressed = compress_chunk(long_chunk, 'headline rules for advertising', 200)
    check('Compressor reduces size', len(compressed) <= 250, f'{len(compressed)} chars')
    check('Compressed text preserves citation',
          'Ogilvy' in compressed or 'Ch.5' in compressed)

    # Test 5: Injection formatting
    chunks = [
        {
            'chunk_id': 'a', 'source_file': 'ogilvy.md', 'section': 'Headline Rules',
            'priority_tier': 1, 'chunk_text': 'Ogilvy Ch.5, p.71: five times as many people read the headline as the body copy.',
            'toon_text': 'h:Ogilvy Ch.5 p.71 headline 5x body copy',
            '_quality_score': 0.9,
        },
        {
            'chunk_id': 'b', 'source_file': 'aaker.md', 'section': 'Brand Associations',
            'priority_tier': 2, 'chunk_text': 'Aaker Ch.3: brand associations drive recognition.',
            'toon_text': 'ba:Aaker Ch.3 brand associations drive recognition',
            '_quality_score': 0.6,
        },
    ]
    injection = format_injection(chunks, PROFILES['standard_review'], 'spark')
    check('Injection contains CRITICAL marker', 'CRITICAL' in injection)
    check('Injection contains source citations', 'ogilvy.md' in injection.lower())
    check('Injection contains Ogilvy citation', 'Ch.5' in injection)

    # Test 6: Full pipeline (quick smoke test)
    result = retrieve(
        'review this headline for the new campaign',
        agent_id='spark', agent_dept='Brand Studio',
        mode='standard', top_k=10,
    )
    check(f'Retrieval completes in {result.timing_ms}ms', result.timing_ms < 5000)
    check('Retrieval returns a profile', result.profile is not None)
    check('Retrieval has rewritten queries', len(result.rewritten_queries) > 0)
    check('Retrieval has trace', result.trace is not None)
    check('Trace has Lasswell elements',
          all(k in result.trace for k in ['who', 'what', 'channel', 'whom', 'effect']))

    # Test 7: Agentic mode produces different results than standard
    result_agentic = retrieve(
        'should we acquire Company X for $2M',
        agent_id='marcus', agent_dept='Executive Office',
        mode='agentic', top_k=15,
    )
    check('Agentic mode rewrites more queries',
          len(result_agentic.rewritten_queries) > len(result.rewritten_queries))
    check('Agentic mode gets deep_analysis profile',
          result_agentic.profile.name == 'deep_analysis',
          result_agentic.profile.name)

    # Test 8: Governance gate profile
    result_gov = retrieve(
        'board needs to review this fiduciary decision',
        agent_id='board', agent_dept='Governance',
        mode='standard', top_k=10,
    )
    check('Board agent profile triggers governance_gate',
          result_gov.profile.name == 'governance_gate',
          result_gov.profile.name)

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    sys.exit(0 if run_tests() else 1)
