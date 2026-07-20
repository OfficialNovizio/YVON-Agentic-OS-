#!/usr/bin/env python3
"""
Dynamic Context Window Optimizer — Element 3 of YVON RAG
==========================================================
Adapts retrieval strategy per query based on task complexity,
agent type, and department context. NOT a static top-K selector.

Four retrieval profiles adapt to the task:
  quick_check     — Simple lookups (3-5 chunks, 1,200 chars, fast)
  standard_review — Typical agent evaluations (6-10 chunks, 2,500 chars)
  deep_analysis   — Consequential decisions (10-15 chunks, 4,000 chars)
  governance_gate — Board review (5-8 chunks, all tier-1, adversary)

Dynamic parameters changed per query:
  - Budget (characters)
  - Chunk count
  - Tier allocation mix (T1/T2/T3 ratios)
  - Department scope (single vs multi)
  - Freshness cutoff (by document type)
  - Adversary injection (yes/no)
  - Diversity constraints (max per source, max per heading)

Imported Shared OS scripts:
  staleness_economics.py → doc_freshness() — chunk freshness decay
  marketing_laws.py → pareto_principle() — budget allocation
  planning_fallacy.py → calibration_weight() — retrieval confidence
  risk_management.py → risk_score() — chunk reliability

Usage:
  python3 rag/optimizer.py --test    # Run self-tests
"""

import os, sys, json, math, re, time
from typing import List, Dict, Optional, Tuple, Set
from dataclasses import dataclass, field

# ── Import Shared OS scripts ──────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..', '..')
SHARED_OS = os.path.join(PROJECT_ROOT, 'Teams', 'Shared OS', 'logical')
sys.path.insert(0, SHARED_OS)

try:
    from staleness_economics import doc_freshness, staleness_threshold_for_doc_type
    from marketing_laws import pareto_principle, lasswell_model
    from planning_fallacy import calibration_weight
    from risk_management import risk_score, risk_level
    HAS_SHARED_OS = True
except ImportError:
    HAS_SHARED_OS = False


# ═══════════════════════════════════════════════════════════════════
# PART 1 — TASK COMPLEXITY CLASSIFIER
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RetrievalProfile:
    """How retrieval should behave for this specific query."""
    name: str
    char_budget: int
    max_chunks: int
    tier_1_pct: float    # Minimum % from tier 1 (load-bearing)
    tier_2_pct: float    # Maximum % from tier 2 (structural)
    tier_3_pct: float    # Maximum % from tier 3 (supplementary)
    adversary: bool
    max_per_source_pct: float = 0.40   # No more than 40% from one document
    max_per_heading: int = 2            # Max 2 chunks from same section
    freshness_days: int = 365           # Max age in days
    dept_scope: str = 'home'           # 'home' = agent's dept, 'related', 'all'
    min_reliability: float = 0.3       # Minimum chunk reliability score


PROFILES = {
    'quick_check': RetrievalProfile(
        name='quick_check', char_budget=1200, max_chunks=5,
        tier_1_pct=0.80, tier_2_pct=0.15, tier_3_pct=0.05,
        adversary=False, max_per_source_pct=0.60, max_per_heading=1,
        freshness_days=180, dept_scope='home', min_reliability=0.4,
    ),
    'standard_review': RetrievalProfile(
        name='standard_review', char_budget=2500, max_chunks=10,
        tier_1_pct=0.60, tier_2_pct=0.25, tier_3_pct=0.15,
        adversary=False, freshness_days=365, dept_scope='home',
    ),
    'deep_analysis': RetrievalProfile(
        name='deep_analysis', char_budget=4000, max_chunks=15,
        tier_1_pct=0.50, tier_2_pct=0.30, tier_3_pct=0.20,
        adversary=True, max_per_source_pct=0.50, freshness_days=730,
        dept_scope='related', min_reliability=0.2,
    ),
    'governance_gate': RetrievalProfile(
        name='governance_gate', char_budget=2500, max_chunks=8,
        tier_1_pct=1.0, tier_2_pct=0.0, tier_3_pct=0.0,
        adversary=True, max_per_source_pct=0.30, freshness_days=365,
        dept_scope='related', min_reliability=0.5,
    ),
}

# ── Decision triggers ──────────────────────────────────────────

# Words that signal HIGH complexity → deep_analysis
HIGH_COMPLEXITY_WORDS = {
    'decide', 'decision', 'approve', 'reject', 'veto', 'acquire',
    'acquisition', 'merger', 'restructure', 'restructuring',
    'invest', 'investment', 'funding', 'round', 'valuation',
    'strategy', 'strategic', 'pivot', 'kill', 'terminate',
    'partner', 'lawsuit', 'legal', 'breach', 'incident',
}

# Words that signal GOVERNANCE context
GOVERNANCE_WORDS = {
    'constitution', 'fiduciary', 'board', 'gate', 'violation',
    'veto', 'oversight', 'compliance', 'audit', 'charter',
}

# Words that signal SIMPLE lookup → quick_check
SIMPLE_WORDS = {
    'check', 'verify', 'lookup', 'find', 'show', 'what is',
    'definition', 'define', 'quick', 'simple',
}

# Words that signal medium complexity — review, analyze, evaluate
MEDIUM_COMPLEXITY_WORDS = {
    'review', 'analyze', 'analysis', 'evaluate', 'evaluation',
    'improve', 'improvement', 'suggest', 'recommend', 'recommendation',
    'optimize', 'optimization', 'audit', 'assess', 'assessment',
    'compare', 'comparison', 'report', 'draft', 'write',
}

# Agents that default to specific profiles
AGENT_PROFILES = {
    'board': 'governance_gate',
    'precedent': 'governance_gate',
    'sentinel': 'governance_gate',
    'marcus': 'deep_analysis',
    'comply': 'deep_analysis',     # Legal reviews need deep context
    'warden': 'deep_analysis',
    'spark': 'standard_review',
    'dev': 'standard_review',
    'ops': 'standard_review',
    'quinn': 'standard_review',
}

# ── Department adjacency for scope expansion ───────────────────

DEPARTMENT_ADJACENCY = {
    'Executive Office': ['Governance', 'Product', 'AI & Agents'],
    'Governance': ['Executive Office', 'Cybersecurity'],
    'Engineering': ['Cybersecurity', 'Product', 'AI & Agents'],
    'Cybersecurity': ['Engineering', 'Governance'],
    'Product': ['Executive Office', 'Engineering', 'Brand Studio'],
    'AI & Agents': ['Product', 'Engineering', 'Executive Office'],
    'Brand Studio': ['Product', 'Executive Office'],
    'Shared OS': ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
                  'Product', 'AI & Agents', 'Brand Studio'],
}


def classify_task_complexity(query: str, agent_id: str = '') -> RetrievalProfile:
    """
    Classify a query into one of four retrieval profiles.
    Uses keyword matching on the query text (zero-token, same approach as CIE).
    """
    query_lower = query.lower()
    complexity_score = 0

    # Length-based complexity — any query with substance is at minimum standard_review
    query_len = len(query)
    word_count = len(query.split())
    if query_len > 500 or word_count > 50:
        complexity_score += 3
    elif query_len > 200 or word_count > 20:
        complexity_score += 2
    elif query_len > 60 or word_count > 6:
        complexity_score += 1

    # Keyword-based complexity — high-stakes words push to deep_analysis
    high_complexity_hit = False
    for word in HIGH_COMPLEXITY_WORDS:
        if word in query_lower:
            complexity_score += 3  # One high-stakes word = significant complexity
            high_complexity_hit = True
            break

    # Governance words override everything below
    for word in GOVERNANCE_WORDS:
        if word in query_lower:
            complexity_score += 4
            break

    for word in SIMPLE_WORDS:
        if word in query_lower:
            complexity_score -= 1

    # Medium complexity words → ensures at least standard_review
    for word in MEDIUM_COMPLEXITY_WORDS:
        if word in query_lower:
            if complexity_score < 2:
                complexity_score = 2  # Floor at standard_review level
            complexity_score += 0.5
            break

    # Question marks → more complex
    qmark_count = query.count('?')
    complexity_score += min(qmark_count, 3)

    # Agent override
    if agent_id.lower() in AGENT_PROFILES:
        forced = AGENT_PROFILES[agent_id.lower()]
        if forced in PROFILES:
            return PROFILES[forced]

    # Map score to profile
    if complexity_score >= 5:
        return PROFILES['deep_analysis']
    elif complexity_score >= 2:
        return PROFILES['standard_review']
    else:
        return PROFILES['quick_check']


# ═══════════════════════════════════════════════════════════════════
# PART 2 — CHUNK QUALITY SCORING
# ═══════════════════════════════════════════════════════════════════

def compute_chunk_quality(chunk: Dict, query_complexity: int = 0) -> float:
    """
    Compute a composite quality score for a chunk.
    Combines: priority tier, freshness, historical quality, citation presence.
    """
    score = 0.0

    # Priority tier weight (tier 1 = 0.5, tier 2 = 0.3, tier 3 = 0.1)
    tier_weight = {1: 0.5, 2: 0.3, 3: 0.1}
    score += tier_weight.get(chunk.get('priority_tier', 2), 0.3)

    # Freshness (via staleness_economics.py if available)
    try:
        age_days = 0
        if chunk.get('last_modified'):
            mtime = time.mktime(time.strptime(chunk['last_modified'][:10], '%Y-%m-%d'))
            age_days = (time.time() - mtime) / 86400
        doc_type = chunk.get('document_type', 'default')
        threshold = staleness_threshold_for_doc_type(doc_type) if HAS_SHARED_OS else 0.6
        freshness = max(0, 1.0 - min(age_days / 365, 1.0))
        score += freshness * 0.3
    except:
        score += 0.3  # Default: assume fresh

    # Historical quality
    quality = chunk.get('quality_score', 0.5)
    score += quality * 0.15

    # Citation presence (Authority signal — Cialdini Ch.6)
    text = chunk.get('chunk_text', '')
    has_citation = bool(re.search(r'(Ch\.\s*\d+|pp?\.\s*\d+|§|Article\s+\d+)', text))
    if has_citation:
        score += 0.05

    return min(1.0, score)


def compute_chunk_reliability(chunk: Dict) -> float:
    """
    ★ MULTIPLICATIVE reliability score (harness upgrade).
    reliability = freshness × source_authority × quality_score

    Multiplicative means junk chunks get near-zero scores:
      junk:     0.3 × 0.2 × 0.5 = 0.03
      authority: 0.9 × 1.0 × 0.95 = 0.855

    Source authority is resolved from the chunk's source_file path.
    Freshness uses staleness_economics model. Quality from feedback.
    """
    # Freshness
    try:
        age_days = 0
        if chunk.get('last_modified'):
            mtime = time.mktime(time.strptime(chunk['last_modified'][:10], '%Y-%m-%d'))
            age_days = max(0.0, (time.time() - mtime) / 86400.0)
        doc_type = chunk.get('document_type', 'default')
        try:
            freshness = doc_freshness(int(age_days), doc_type) if HAS_SHARED_OS else max(0.0, 1.0 - age_days / 365.0)
        except:
            freshness = max(0.0, 1.0 - age_days / 365.0)
    except:
        freshness = 0.5

    # Source authority (imported from harness authority map)
    source = chunk.get('source_file', '')
    authority = _resolve_authority(source)

    # Quality from feedback loop
    quality = chunk.get('quality_score', 0.5)

    return round(freshness * authority * quality, 4)


def _resolve_authority(source_file: str) -> float:
    """Resolve source authority from file path/type (mirrors harness.py)."""
    patterns = [
        (r'Teams/Books/', 1.0),
        (r'(?i)\b(nist|iso|oecd|gdpr|ccpa|hipaa|ieee|ietf|soc2)\b', 0.9),
        (r'Shared OS/logical/', 0.85),
        (r'(?i)(DEPARTMENT-WORKFLOW|SECURITY-CHARTER|FLEET-CHARTER)', 0.7),
        (r'/agent\.md$', 0.65),
        (r'/SKILL\.md$', 0.55),
        (r'(?i)\b(playbook)\b', 0.5),
    ]
    for pattern, score in patterns:
        if re.search(pattern, source_file):
            return score
    return 0.2  # unknown


# ═══════════════════════════════════════════════════════════════════
# PART 3 — DIVERSITY ENFORCER
# ═══════════════════════════════════════════════════════════════════

def enforce_diversity(candidates: List[Dict], profile: RetrievalProfile,
                      max_selected: int) -> List[Dict]:
    """
    Select chunks while enforcing diversity constraints.
    - No more than `max_per_source_pct` from one document
    - Max `max_per_heading` chunks from the same section
    - Minimum 2 unique source files
    """
    selected = []
    source_counts: Dict[str, int] = {}
    heading_counts: Dict[str, int] = {}
    selected_ids: Set[str] = set()

    max_from_one_source = max(1, int(max_selected * profile.max_per_source_pct))

    for candidate in candidates:
        if len(selected) >= max_selected:
            break

        chunk_id = candidate.get('chunk_id', '')
        source = candidate.get('source_file', '')
        heading = candidate.get('section', '')

        # Skip exact duplicates
        if chunk_id in selected_ids:
            continue

        # Source diversity: no more than max_from_one_source from same file
        if source_counts.get(source, 0) >= max_from_one_source:
            continue

        # Heading diversity: max 2 chunks from same section
        heading_key = f"{source}::{heading}"
        if heading_counts.get(heading_key, 0) >= profile.max_per_heading:
            continue

        selected.append(candidate)
        selected_ids.add(chunk_id)
        source_counts[source] = source_counts.get(source, 0) + 1
        heading_counts[heading_key] = heading_counts.get(heading_key, 0) + 1

    # Enforce minimum source diversity: if all chunks from one source,
    # replace the last one with the next-best from a different source
    unique_sources = set(c.get('source_file', '') for c in selected)
    if len(unique_sources) < 2 and len(selected) >= 2:
        primary_source = list(unique_sources)[0]
        for candidate in candidates[len(selected):]:
            if candidate.get('source_file', '') != primary_source:
                selected[-1] = candidate  # Replace last
                break

    return selected


# ═══════════════════════════════════════════════════════════════════
# PART 4 — TIER ALLOCATION ENFORCER (Pareto 80/20)
# ═══════════════════════════════════════════════════════════════════

def enforce_tier_allocation(candidates: List[Dict], profile: RetrievalProfile,
                            max_selected: int) -> List[Dict]:
    """
    Allocate slots across priority tiers per the profile's ratios.
    Uses Pareto principle: tier-1 chunks (load-bearing) get majority budget.
    """
    # Group by tier
    tier_chunks = {1: [], 2: [], 3: []}
    for c in candidates:
        tier = c.get('priority_tier', 2)
        if tier in tier_chunks:
            tier_chunks[tier].append(c)

    # Calculate allocation
    t1_slots = max(1, int(max_selected * profile.tier_1_pct))
    t3_slots = int(max_selected * profile.tier_3_pct)
    t2_slots = max_selected - t1_slots - t3_slots

    # Fill slots, falling back to lower tiers if needed
    tier1_selected = tier_chunks[1][:t1_slots]
    tier2_selected = tier_chunks[2][:t2_slots]
    tier3_selected = tier_chunks[3][:t3_slots]

    # If tier 1 underfilled, promote from tier 2
    if len(tier1_selected) < t1_slots:
        remaining = t1_slots - len(tier1_selected)
        tier1_selected.extend(tier_chunks[2][len(tier2_selected):len(tier2_selected)+remaining])

    result = tier1_selected + tier2_selected + tier3_selected
    return result[:max_selected]


# ═══════════════════════════════════════════════════════════════════
# PART 5 — ADVERSARY INJECTOR (Kahneman's Premortem)
# ═══════════════════════════════════════════════════════════════════

def inject_adversarial_chunk(candidates: List[Dict], selected: List[Dict],
                             profile: RetrievalProfile) -> List[Dict]:
    """
    Inject one adversarial chunk — a chunk semantically DIFFERENT from
    the selected batch. This implements Kahneman's premortem (Ch.24):
    'Assume our best-guess retrieval is wrong. What chunk would the
    dissenting voice want us to see?'

    The adversary is the lowest-similarity chunk that is still within
    the agent's domain and has high quality.
    """
    if not profile.adversary or not candidates or not selected:
        return selected

    selected_ids = {c['chunk_id'] for c in selected}
    selected_sources = {c['source_file'] for c in selected}

    # Find an adversary: different source, decent quality, not already selected
    adversary = None
    for c in candidates:
        if c['chunk_id'] in selected_ids:
            continue
        if c['source_file'] in selected_sources:
            continue  # Must be from a DIFFERENT source
        quality = compute_chunk_quality(c)
        if quality >= profile.min_reliability:
            adversary = c
            break

    if adversary:
        adversary['adversary'] = True
        adversary['adversary_label'] = (
            "⚠️ ADVERSARIAL CHUNK — Kahneman Ch.24, pp.264-265 (Premortem): "
            "'Assume our plan was a disaster.' This chunk challenges the "
            "dominant perspective from the selected chunks."
        )

        if selected:
            selected.insert(len(selected) // 2, adversary)  # Insert middle
        else:
            selected.append(adversary)

    return selected


# ═══════════════════════════════════════════════════════════════════
# PART 6 — MAIN OPTIMIZER PIPELINE
# ═══════════════════════════════════════════════════════════════════

@dataclass
class OptimizerResult:
    selected_chunks: List[Dict]
    profile: RetrievalProfile
    total_chars: int
    chunk_count: int
    tier_breakdown: Dict[int, int]
    adversary_injected: bool
    budget_used_pct: float
    strategy: str
    trace: List[str] = field(default_factory=list)


def optimize_context(
    candidates: List[Dict],
    query: str,
    agent_id: str = '',
    agent_dept: str = '',
    char_budget_override: Optional[int] = None,
) -> OptimizerResult:
    """
    Main optimizer entry point. Takes raw candidate chunks and produces
    the final optimized injection batch.

    Pipeline:
      1. Classify task → select retrieval profile
      2. Filter by department scope
      3. Filter by freshness cutoff
      4. Filter by minimum reliability
      5. Score + sort candidates by composite quality
      6. Enforce tier allocation (Pareto 80/20)
      7. Enforce diversity constraints
      8. Inject adversarial chunk (if profile requires)
      9. Trim to char budget
      10. Trace every decision
    """
    trace = []
    profile = classify_task_complexity(query, agent_id)

    if char_budget_override:
        profile.char_budget = char_budget_override

    trace.append(f"Profile: {profile.name} ({profile.char_budget} chars, {profile.max_chunks} chunks)")

    # Step 1: Department scope filter
    if agent_dept and profile.dept_scope == 'home':
        filtered = [c for c in candidates
                    if c.get('department') == agent_dept or c.get('department') == 'Shared OS']
        trace.append(f"Dept filter (home={agent_dept}): {len(candidates)} → {len(filtered)}")
    elif agent_dept and profile.dept_scope == 'related':
        related = set(DEPARTMENT_ADJACENCY.get(agent_dept, []))
        related.add(agent_dept)
        related.add('Shared OS')
        filtered = [c for c in candidates if c.get('department') in related]
        trace.append(f"Dept filter (related): {len(candidates)} → {len(filtered)}")
    else:
        filtered = list(candidates)
        trace.append(f"Dept filter (all): {len(candidates)}")

    # Step 2: Freshness filter
    cutoff_days = profile.freshness_days
    fresh = []
    for c in filtered:
        try:
            mtime = time.mktime(time.strptime(c.get('last_modified', '2026-01-01')[:10], '%Y-%m-%d'))
            age_days = (time.time() - mtime) / 86400
            if age_days <= cutoff_days:
                fresh.append(c)
        except:
            fresh.append(c)
    trace.append(f"Freshness ({cutoff_days}d): {len(filtered)} → {len(fresh)}")

    # Step 3: Reliability filter
    reliable = [c for c in fresh
                if compute_chunk_quality(c) >= profile.min_reliability]
    trace.append(f"Reliability (≥{profile.min_reliability}): {len(fresh)} → {len(reliable)}")

    # Step 4: Score + sort
    for c in reliable:
        c['_quality_score'] = compute_chunk_quality(c)
    reliable.sort(key=lambda c: c.get('_quality_score', 0), reverse=True)

    # Step 5: Tier allocation
    tiered = enforce_tier_allocation(reliable, profile, profile.max_chunks * 2)
    trace.append(f"Tier allocation: {len(tiered)} candidates for {profile.max_chunks} slots")

    # Step 6: Diversity enforcement
    diverse = enforce_diversity(tiered, profile, profile.max_chunks + 1)  # +1 for adversary
    trace.append(f"Diversity: {len(diverse)} selected")

    # Step 7: Adversary injection
    with_adversary = inject_adversarial_chunk(reliable, diverse, profile)

    # Step 8: Budget trim
    selected = []
    total_chars = 0
    for c in with_adversary:
        chunk_chars = len(c.get('toon_text', c.get('chunk_text', '')))
        if total_chars + chunk_chars > profile.char_budget:
            break
        selected.append(c)
        total_chars += chunk_chars

    # Tier breakdown
    tiers = {}
    for c in selected:
        t = c.get('priority_tier', 2)
        tiers[t] = tiers.get(t, 0) + 1

    has_adversary = any(c.get('adversary') for c in selected)

    return OptimizerResult(
        selected_chunks=selected,
        profile=profile,
        total_chars=total_chars,
        chunk_count=len(selected),
        tier_breakdown=tiers,
        adversary_injected=has_adversary,
        budget_used_pct=round(total_chars / profile.char_budget * 100, 0) if profile.char_budget else 0,
        strategy=f"{profile.name} ({len(selected)} chunks, {total_chars} chars)",
        trace=trace,
    )


# ═══════════════════════════════════════════════════════════════════
# PART 7 — LASSWELL TRACE LOGGER
# ═══════════════════════════════════════════════════════════════════

def trace_injection(result: OptimizerResult, query: str, agent_id: str,
                    model: str = 'claude') -> Dict:
    """
    Generate a Lasswell-compliant trace for this injection.
    Lasswell (1948): Who says what, in which channel, to whom, with what effect.
    """
    return {
        'who': agent_id,
        'what': [{'chunk_id': c['chunk_id'], 'source': c.get('source_file', ''),
                  'section': c.get('section', ''), 'tier': c.get('priority_tier', 0),
                  'adversary': c.get('adversary', False),
                  'chars': len(c.get('toon_text', c.get('chunk_text', '')))}
                 for c in result.selected_chunks],
        'channel': f'TOON ({result.total_chars} chars)',
        'whom': model,
        'effect': 'pending',  # Updated by feedback loop
        'strategy': result.strategy,
        'profile': result.profile.name,
        'trace': result.trace,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 8 — SELF-TESTS
# ═══════════════════════════════════════════════════════════════════

def run_tests() -> bool:
    passed, failed = 0, 0
    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition:
            print(f'  ✅ {label}'); passed += 1
        else:
            print(f'  ❌ {label}: {detail}'); failed += 1

    print('\n  🧪 YVON Context Optimizer — Self-Tests\n')

    # Test 1: Task complexity classifier
    p1 = classify_task_complexity('check headline', '')
    check('Short query → quick_check', p1.name == 'quick_check', p1.name)

    p2 = classify_task_complexity('review this ad creative and suggest improvements to copy and layout')
    check('Medium query → standard_review', p2.name == 'standard_review', p2.name)

    p3 = classify_task_complexity('should we acquire Competitor X for $5M given our current runway and strategic position in the market?')
    check('Complex acquisition → deep_analysis', p3.name == 'deep_analysis', p3.name)

    p4 = classify_task_complexity('board needs to review this fiduciary decision for constitutional compliance')
    check('Governance keywords → governance_gate or deep_analysis',
          p4.name in ('governance_gate', 'deep_analysis'), p4.name)

    p5 = classify_task_complexity('simple check', 'board')
    check('Agent override: board → governance_gate',
          p5.name == 'governance_gate', p5.name)

    # Test 2: Profile budget allocation
    check('Quick check budget = 1200', p1.char_budget == 1200)
    check('Deep analysis budget = 4000', p3.char_budget == 4000)
    check('Deep analysis adversary = True', p3.adversary)
    check('Quick check adversary = False', not p1.adversary)

    # Test 3: Tier allocation
    check('Quick check: 80% tier 1', p1.tier_1_pct == 0.80)
    check('Governance gate: 100% tier 1', PROFILES['governance_gate'].tier_1_pct == 1.0)
    check('Deep analysis: 50% tier 1', p3.tier_1_pct == 0.50)

    # Test 4: Chunk quality scoring
    fresh_chunk = {
        'priority_tier': 1, 'last_modified': '2026-07-16T00:00:00Z',
        'quality_score': 0.8, 'chunk_text': 'Per Ogilvy, Ch.5, p.71: headlines should...',
        'chunk_id': 'test-1', 'source_file': 'test.md', 'section': 'Principles',
        'department': 'Brand Studio', 'document_type': 'skill',
    }
    stale_chunk = {
        'priority_tier': 3, 'last_modified': '2024-01-01T00:00:00Z',
        'quality_score': 0.2, 'chunk_text': 'Some general advice about writing.',
        'chunk_id': 'test-2', 'source_file': 'test.md', 'section': 'Notes',
        'department': 'Brand Studio', 'document_type': 'reference',
    }
    sq = compute_chunk_quality(fresh_chunk)
    stq = compute_chunk_quality(stale_chunk)
    check('Fresh T1 chunk > stale T3 chunk', sq > stq, f'{sq:.2f} vs {stq:.2f}')
    check('Fresh chunk quality ≥ 0.7', sq >= 0.7, f'{sq:.2f}')

    # Test 5: Diversity enforcement
    candidates = [
        {'chunk_id': 'a-1', 'source_file': 'ogilvy.md', 'section': 'Principles', 'priority_tier': 1},
        {'chunk_id': 'a-2', 'source_file': 'ogilvy.md', 'section': 'Principles', 'priority_tier': 1},
        {'chunk_id': 'a-3', 'source_file': 'ogilvy.md', 'section': 'Instructions', 'priority_tier': 2},
        {'chunk_id': 'a-4', 'source_file': 'ogilvy.md', 'section': 'Fallback', 'priority_tier': 2},
        {'chunk_id': 'b-1', 'source_file': 'aaker.md', 'section': 'Brand Equity', 'priority_tier': 1},
        {'chunk_id': 'c-1', 'source_file': 'berger.md', 'section': 'STEPPS', 'priority_tier': 2},
    ]
    diverse = enforce_diversity(candidates, PROFILES['standard_review'], 4)
    sources = set(c['source_file'] for c in diverse)
    check('Diverse result has ≥2 sources', len(sources) >= 2, f'{len(sources)} sources: {sources}')

    # Test 6: Adversary injection
    selected = [candidates[0], candidates[3]]  # 2 chunks from ogilvy
    with_adv = inject_adversarial_chunk(candidates, selected, PROFILES['deep_analysis'])
    has_adv = any(c.get('adversary') for c in with_adv)
    check('Adversary injected in deep_analysis', has_adv)

    # Test 7: Full pipeline on sample data
    sample_chunks = [
        {'chunk_id': f'chunk-{i}', 'source_file': f'source-{i%3}.md',
         'section': f'section-{i%5}', 'department': 'Brand Studio',
         'priority_tier': (i % 3) + 1, 'last_modified': '2026-07-15T00:00:00Z',
         'quality_score': 0.5 + (i % 5) * 0.1, 'document_type': 'skill',
         'chunk_text': f'This is chunk {i} with ' + ('important' if i%3==0 else 'supplementary') + ' content about marketing and brand strategy.',
         'toon_text': f'chunk-{i}=content about marketing ' + ('important' if i%3==0 else 'supplementary'),
         } for i in range(20)
    ]
    result = optimize_context(
        sample_chunks,
        "review this ad creative and suggest improvements",
        agent_id='spark', agent_dept='Brand Studio',
    )
    check(f'Optimizer produces result: {result.chunk_count} chunks',
          result.chunk_count > 0)
    check('Optimizer result has tier breakdown',
          len(result.tier_breakdown) > 0)
    check('Optimizer respects char budget',
          result.total_chars <= result.profile.char_budget,
          f'{result.total_chars} > {result.profile.char_budget}')
    check('Optimizer records trace',
          len(result.trace) > 0)

    # Test 8: Lasswell trace
    trace = trace_injection(result, "review ad creative", "spark")
    check('Lasswell trace has all 5 elements',
          all(k in trace for k in ['who', 'what', 'channel', 'whom', 'effect']))
    check('Lasswell trace records chunks',
          len(trace['what']) == result.chunk_count)
    check('Lasswell trace records strategy',
          trace['strategy'] == result.strategy)

    # Test 9: Budget override
    result2 = optimize_context(sample_chunks, "quick check", char_budget_override=500)
    check(f'Override budget works: {result2.total_chars} ≤ 500',
          result2.total_chars <= 500, f'{result2.total_chars}')

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    sys.exit(0 if run_tests() else 1)
