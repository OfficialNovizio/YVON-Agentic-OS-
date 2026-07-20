#!/usr/bin/env python3
"""
Pipeline B: Relational Graph + Progressive Disclosure (Option 2+4)
===================================================================
Combines chunk dependency graphing with two-pass disclosure:
  Pass 1 — Send a compressed summary → model identifies gaps
  Pass 2 — Send only the chunks the model requested + their dependencies

Pipeline:
  Step 1 — BUILD relational graph between chunks
  Step 2 — CLASSIFY query → set disclosure mode
  Step 3 — PASS 1: generate summary of available chunks
  Step 4 — SIMULATE model request (since no real model in test)
  Step 5 — RESOLVE dependencies: requested chunks + their children
  Step 6 — PASS 2: send full text of requested + dependent chunks

Usage:
  python3 rag/pipeline_relational_progressive.py --test
  python3 rag/pipeline_relational_progressive.py --benchmark
"""

import sys, os, re, math, json, time
from typing import List, Dict, Tuple, Optional, Set, FrozenSet
from dataclasses import dataclass, field
from enum import Enum

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, os.path.join(SCRIPT_DIR, '..', 'Teams', 'Shared OS', 'logical'))

from injector import estimate_tokens


# ═══════════════════════════════════════════════════════════════════
# RELATION TYPES
# ═══════════════════════════════════════════════════════════════════

class Relation(Enum):
    DEFINES = 'defines'         # B defines a term used in A
    EXTENDS = 'extends'         # B provides detail/example for A
    CONTRADICTS = 'contradicts' # B says the opposite of A
    SUPERSEDES = 'supersedes'   # B is newer/higher authority than A
    UNRELATED = 'unrelated'     # No meaningful relationship


@dataclass
class Edge:
    source_id: str
    target_id: str
    relation: Relation
    confidence: float


@dataclass
class ChunkNode:
    chunk: Dict
    edges_out: List[Edge] = field(default_factory=list)
    edges_in: List[Edge] = field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════
# RELATIONAL GRAPH BUILDER
# ═══════════════════════════════════════════════════════════════════

def normalize(text: str) -> str:
    """Normalize text for comparison."""
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()


def jaccard_similarity(a: str, b: str) -> float:
    """Compute term-level Jaccard similarity."""
    a_terms = set(normalize(a).split())
    b_terms = set(normalize(b).split())
    if not a_terms or not b_terms:
        return 0.0
    return len(a_terms & b_terms) / len(a_terms | b_terms)


def detect_relation(chunk_a: Dict, chunk_b: Dict) -> Tuple[Relation, float]:
    """
    Detect the relationship between two chunks.
    What does B mean for A?
    """
    # Skip: same source file, different sections = NOT a meaningful relation
    # (e.g., stack-profile section 1 vs stack-profile section 3 — both about same thing)
    if (chunk_a.get('source_file') == chunk_b.get('source_file') and
        chunk_a.get('source_file')):  # Both have a source and it matches
        return (Relation.UNRELATED, 0.0)

    text_a = chunk_a.get('chunk_text', chunk_a.get('toon_text', ''))
    text_b = chunk_b.get('chunk_text', chunk_b.get('toon_text', ''))
    norm_a = normalize(text_a)
    norm_b = normalize(text_b)
    jac = jaccard_similarity(text_a, text_b)

    # Check for contradiction: B negates something in A
    has_negation_b = bool(re.search(r'\b(not|never|no\b|don\'t|cannot|shouldn\'t|unless|except|however|but)\b', normalize(text_b)))
    a_terms = set(normalize(text_a).split())
    b_terms = set(normalize(text_b).split())
    shared = len(a_terms & b_terms)

    if shared >= 6 and has_negation_b:
        return (Relation.CONTRADICTS, min(jac + 0.2, 1.0))

    # Check for defines: B is shorter, appears to be a definition
    if len(text_b) < len(text_a) * 0.4 and shared >= 4:
        # B looks like it defines a term used heavily in A
        key_terms = [w for w in a_terms if len(w) > 4]
        matches = sum(1 for t in key_terms[:5] if t in b_terms)
        if matches >= 2:
            return (Relation.DEFINES, min(0.5 + matches * 0.1, 1.0))

    # Check for same source + same section → likely extends or supersedes
    src_a = chunk_a.get('source_file', '')
    src_b = chunk_b.get('source_file', '')
    sec_a = chunk_a.get('section', '')
    sec_b = chunk_b.get('section', '')

    if src_a == src_b and sec_a == sec_b and src_a:
        # Same section: B might extend or supersede A
        if chunk_b.get('priority_tier', 2) <= chunk_a.get('priority_tier', 2):
            return (Relation.EXTENDS, 0.7)
        else:
            return (Relation.SUPERSEDES, 0.6)

    # Check for extends: high Jaccard but from different sources
    if jac > 0.3 and src_a != src_b:
        return (Relation.EXTENDS, jac)

    if jac > 0.15:
        return (Relation.EXTENDS, jac * 0.7)

    return (Relation.UNRELATED, 0.0)


def build_graph(chunks: List[Dict]) -> Dict[str, ChunkNode]:
    """Build a full relational graph between chunks."""
    graph: Dict[str, ChunkNode] = {}
    for c in chunks:
        cid = c.get('chunk_id', str(hash(c.get('chunk_text', ''))))
        graph[cid] = ChunkNode(chunk=c)

    cids = list(graph.keys())
    for i in range(len(cids)):
        for j in range(i + 1, len(cids)):
            rel, conf = detect_relation(graph[cids[i]].chunk, graph[cids[j]].chunk)
            if rel != Relation.UNRELATED and conf > 0.3:
                edge = Edge(source_id=cids[i], target_id=cids[j], relation=rel, confidence=conf)
                graph[cids[i]].edges_out.append(edge)
                graph[cids[j]].edges_in.append(edge)

    return graph


def resolve_dependencies(requested_ids: List[str], graph: Dict[str, ChunkNode]) -> List[str]:
    """
    Given a set of requested chunk IDs, resolve which additional chunks
    must be included because of dependencies.
    """
    must_include = set(requested_ids)
    expanded = True

    while expanded:
        expanded = False
        for cid in list(must_include):
            if cid not in graph:
                continue
            node = graph[cid]

            # If a requested chunk has incoming DEFINES or CONTRADICTS edges,
            # the source must be included
            for edge in node.edges_in:
                if edge.relation in (Relation.DEFINES, Relation.CONTRADICTS):
                    if edge.source_id in graph and edge.source_id not in must_include:
                        must_include.add(edge.source_id)
                        expanded = True

            # If a requested chunk has outgoing CONTRADICTS or DEFINES edges,
            # the target must be included (exception to a rule)
            for edge in node.edges_out:
                if edge.relation in (Relation.CONTRADICTS, Relation.DEFINES):
                    if edge.target_id in graph and edge.target_id not in must_include:
                        must_include.add(edge.target_id)
                        expanded = True

    return list(must_include)


# ═══════════════════════════════════════════════════════════════════
# CHUNK SUMMARIZER (for Pass 1)
# ═══════════════════════════════════════════════════════════════════

def summarize_chunk(chunk: Dict) -> str:
    """
    Create a one-line summary of a chunk for the disclosure pass.
    Extracts: source, section, key claim, tier.
    """
    text = chunk.get('chunk_text', chunk.get('toon_text', ''))
    source = chunk.get('source_file', 'unknown')[:40]
    section = chunk.get('section', '')
    tier = chunk.get('priority_tier', 2)

    # Extract the most important sentence
    sentences = re.split(r'(?<=[.!?])\s+', text)
    best = sentences[0][:100] if sentences else text[:100]

    # Highlight key signals
    signals = []
    if re.search(r'\b(must|never|shall|require)\b', text, re.IGNORECASE):
        signals.append('RULE')
    if re.search(r'(Ch\.\s*\d+|pp?\.\s*\d+|§\s*\d+)', text):
        signals.append('CITED')
    if re.search(r'\b(\$\d+|\d+%|\d+x)\b', text):
        signals.append('DATA')
    if chunk.get('adversary'):
        signals.append('ADVERSARY')

    tier_label = {1: 'T1', 2: 'T2', 3: 'T3'}.get(tier, 'T?')
    sig_str = f" [{', '.join(signals)}]" if signals else ''
    sec_str = f' › {section}' if section else ''

    return f"  [{chunk.get('chunk_id', '?')}] {tier_label}{sig_str} {source}{sec_str}: {best}"


def generate_disclosure_summary(chunks: List[Dict], graph: Dict[str, ChunkNode],
                                 query: str, max_tokens: int = 150) -> str:
    """Generate the Pass 1 disclosure: what's available, what's related."""
    lines = []
    lines.append(f'[DISCLOSURE · {len(chunks)} chunks available · task: {query[:80]}]')
    lines.append('')

    # Group by tier
    t1 = [c for c in chunks if c.get('priority_tier') == 1]
    t2 = [c for c in chunks if c.get('priority_tier') == 2]
    t3 = [c for c in chunks if c.get('priority_tier') == 3]

    if t1:
        lines.append('TIER 1 (load-bearing):')
        for c in sorted(t1, key=lambda c: c.get('quality_score', 0), reverse=True):
            lines.append(summarize_chunk(c))
        lines.append('')

    if t2:
        lines.append('TIER 2 (structural):')
        for c in sorted(t2, key=lambda c: c.get('quality_score', 0), reverse=True)[:5]:
            lines.append(summarize_chunk(c))
        if len(t2) > 5:
            lines.append(f'  ... and {len(t2) - 5} more T2 chunks')
        lines.append('')

    if t3:
        lines.append(f'TIER 3 (supplementary): {len(t3)} chunks available')
        lines.append('')

    # Show key relationships
    contradictions = []
    definitions = []
    for cid, node in graph.items():
        for edge in node.edges_out:
            if edge.relation == Relation.CONTRADICTS:
                contradictions.append((edge.source_id, edge.target_id))
            elif edge.relation == Relation.DEFINES:
                definitions.append((edge.source_id, edge.target_id))

    if contradictions or definitions:
        lines.append('KEY RELATIONSHIPS:')
        for s, t in contradictions[:3]:
            lines.append(f'  [{s}] CONTRADICTS [{t}] — include both for balanced view')
        for s, t in definitions[:3]:
            lines.append(f'  [{t}] DEPENDS ON [{s}] — include [{s}] for context')

    disclosure = '\n'.join(lines)
    if len(disclosure) > max_tokens * 3:
        disclosure = disclosure[:max_tokens * 3 - 3] + '…'
    return disclosure


# ═══════════════════════════════════════════════════════════════════
# MODEL SIMULATION (Pass 1 → chunk request)
# ═══════════════════════════════════════════════════════════════════

@dataclass
class SimulatedModelRequest:
    requested_ids: List[str]
    reasoning: str
    tokens_used_pass1: int


def simulate_model_request(chunks: List[Dict], graph: Dict[str, ChunkNode],
                           query: str, max_total_budget: int = 400) -> SimulatedModelRequest:
    """
    Simulate what a model WOULD request after reading the disclosure.
    In production, this would be an actual LLM call.
    Here we use heuristics based on query type and chunk relevance.
    """
    query_lower = query.lower()

    # Budget for Pass 1: ~20% of total
    pass1_budget = max(60, int(max_total_budget * 0.20))
    pass2_budget = max_total_budget - pass1_budget

    # Score each chunk against the query for relevance
    scored = []
    for c in chunks:
        text = c.get('chunk_text', c.get('toon_text', ''))
        q_terms = set(re.findall(r'[a-z]{3,}', query_lower))
        t_terms = set(re.findall(r'[a-z]{3,}', text.lower()))
        overlap = len(q_terms & t_terms) / max(len(q_terms), 1)
        tier_bonus = 0.3 if c.get('priority_tier') == 1 else 0.1 if c.get('priority_tier') == 2 else 0
        cite_bonus = 0.15 if re.search(r'(Ch\.|p\.|§|Article)', text) else 0
        adv_bonus = 0.2 if c.get('adversary') else 0
        scored.append((c, overlap * 0.4 + tier_bonus * 0.3 + cite_bonus * 0.15 + adv_bonus))

    scored.sort(key=lambda x: x[1], reverse=True)

    # Request strategy:
    # - Always request tier 1 chunks (they're load-bearing)
    # - Request tier 2 if they have high relevance
    # - Request adversarial chunks for strategic decisions
    # - Skip tier 3 unless they're the only source on a topic

    requested = []
    tokens_used = 0

    for chunk, score in scored:
        cid = chunk.get('chunk_id', '')
        text = chunk.get('chunk_text', chunk.get('toon_text', ''))
        t = estimate_tokens(text)
        tier = chunk.get('priority_tier', 2)
        is_adv = chunk.get('adversary', False)

        # Decision logic
        should_request = False
        if tier == 1:
            should_request = True
        elif tier == 2 and score >= 0.4:
            should_request = True
        elif is_adv and score >= 0.3:
            should_request = True
        elif tier == 3 and score >= 0.7:  # Only request T3 if extremely relevant
            should_request = True

        if should_request and tokens_used + t <= pass2_budget:
            requested.append(cid)
            tokens_used += t
        elif tokens_used > pass2_budget:
            break

    reasoning = f'Requested {len(requested)}/{len(chunks)} chunks. '
    if any(c.get('priority_tier') == 1 for c in [ch for ch, _ in scored if ch.get('chunk_id') in requested]):
        reasoning += 'All T1 included. '
    if not any(chunk.get('adversary') for chunk, _ in scored if chunk.get('chunk_id') in requested):
        reasoning += 'No adversary requested. '

    return SimulatedModelRequest(
        requested_ids=requested,
        reasoning=reasoning,
        tokens_used_pass1=pass1_budget,
    )


# ═══════════════════════════════════════════════════════════════════
# FULL PIPELINE
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RelationalProgressiveResult:
    query: str
    agent_id: str
    input_chunks: int
    input_tokens: int

    # Pass 1
    pass1_tokens: int
    disclosure_text: str
    graph_size: int

    # Pass 2
    requested_chunks: int
    resolved_chunks: int  # After dependency resolution
    pass2_tokens: int

    # Final
    total_tokens: int
    savings_pct: float
    injection_text: str
    dependencies_resolved: int
    contradictions_found: int

    # Quality
    quality_score: float
    trace: Dict = field(default_factory=dict)


def relational_progressive_inject(
    chunks: List[Dict],
    query: str,
    agent_id: str = 'default',
    max_budget: int = 400,
) -> RelationalProgressiveResult:
    """Full Option 2+4 pipeline."""

    if not chunks:
        return RelationalProgressiveResult(
            query=query, agent_id=agent_id, input_chunks=0, input_tokens=0,
            pass1_tokens=0, disclosure_text='', graph_size=0,
            requested_chunks=0, resolved_chunks=0, pass2_tokens=0,
            total_tokens=0, savings_pct=100.0, injection_text='',
            dependencies_resolved=0, contradictions_found=0,
            quality_score=1.0,
        )

    all_text = ' '.join(c.get('toon_text', c.get('chunk_text', '')) for c in chunks)
    input_tokens = estimate_tokens(all_text)

    # Step 1: Build relational graph
    graph = build_graph(chunks)
    graph_size = len(graph)

    contradictions_found = sum(
        1 for node in graph.values()
        for edge in node.edges_out
        if edge.relation == Relation.CONTRADICTS
    )

    # Step 3: Pass 1 — disclosure summary
    pass1_budget = max(60, int(max_budget * 0.20))
    disclosure = generate_disclosure_summary(chunks, graph, query, pass1_budget)
    pass1_tokens = estimate_tokens(disclosure)

    # Step 4: Simulate model request
    request = simulate_model_request(chunks, graph, query, max_budget)
    requested_count = len(request.requested_ids)

    # Step 5: Resolve dependencies
    resolved_ids = resolve_dependencies(request.requested_ids, graph)
    resolved_count = len(resolved_ids)
    deps_resolved = resolved_count - requested_count

    # Step 6: Pass 2 — full text of requested + dependent chunks
    pass2_lines = []
    pass2_lines.append(f'[PASS 2 · {resolved_count} chunks · deps resolved: {deps_resolved}]')
    pass2_lines.append('')

    selected_chunks = []
    chunk_map = {c.get('chunk_id', str(hash(c.get('chunk_text', '')))): c for c in chunks}

    for cid in resolved_ids:
        if cid in chunk_map:
            c = chunk_map[cid]
            selected_chunks.append(c)
            text = c.get('toon_text', c.get('chunk_text', ''))
            src = c.get('source_file', 'unknown')[:40]
            sec = c.get('section', '')
            tier = c.get('priority_tier', 2)
            is_adv = c.get('adversary', False)

            # Check if this chunk is in a contradiction
            is_contra = False
            for edge in graph.get(cid, ChunkNode(chunk=c)).edges_in:
                if edge.relation == Relation.CONTRADICTS:
                    is_contra = True
                    break
            for edge in graph.get(cid, ChunkNode(chunk=c)).edges_out:
                if edge.relation == Relation.CONTRADICTS:
                    is_contra = True
                    break

            if is_contra:
                prefix = '🔴⚡'  # Contradiction pair
            elif is_adv:
                prefix = '🔴'
            elif tier == 1:
                prefix = '⚠️'
            elif cid not in request.requested_ids:
                prefix = '🔗'  # Dependency-resolved
            else:
                prefix = '-'

            flabel = f'{src} › {sec}' if sec else src
            pass2_lines.append(f'{prefix} [{flabel}]')
            pass2_lines.append(f'  {text}')
            pass2_lines.append('')

    pass2_text = '\n'.join(pass2_lines)
    pass2_tokens = estimate_tokens(pass2_text)

    # Build complete injection (both passes together)
    full_injection = disclosure + '\n\n' + pass2_text
    total_tokens = estimate_tokens(full_injection)
    savings = (1 - total_tokens / max(input_tokens, 1)) * 100

    # Quality score: what fraction of key facts are preserved
    selected_texts = [' '.join(c.get('toon_text', c.get('chunk_text', '')) for c in selected_chunks)]
    # Count unique sources in selected vs total
    selected_sources = set(c.get('source_file', '') for c in selected_chunks)
    all_sources = set(c.get('source_file', '') for c in chunks)
    source_coverage = len(selected_sources) / max(len(all_sources), 1)

    quality = 0.5 + source_coverage * 0.3 + (deps_resolved / max(requested_count, 1)) * 0.2

    trace = {
        'input_chunks': len(chunks), 'input_tokens': input_tokens,
        'graph_nodes': graph_size, 'contradiction_edges': contradictions_found,
        'pass1_tokens': pass1_tokens, 'pass2_tokens': pass2_tokens,
        'requested': requested_count, 'resolved': resolved_count,
        'deps_resolved': deps_resolved, 'total_tokens': total_tokens,
        'quality_score': round(quality, 3),
    }

    return RelationalProgressiveResult(
        query=query, agent_id=agent_id,
        input_chunks=len(chunks), input_tokens=input_tokens,
        pass1_tokens=pass1_tokens, disclosure_text=disclosure,
        graph_size=graph_size,
        requested_chunks=requested_count, resolved_chunks=resolved_count,
        pass2_tokens=pass2_tokens,
        total_tokens=total_tokens, savings_pct=round(savings, 1),
        injection_text=full_injection,
        dependencies_resolved=deps_resolved, contradictions_found=contradictions_found,
        quality_score=round(quality, 3),
        trace=trace,
    )
