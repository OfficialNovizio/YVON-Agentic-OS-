#!/usr/bin/env python3
"""
Pipeline A: Adaptive Budget + Recovery Pass (Option 1+3)
=========================================================
Combines task-adaptive budgeting with a recovery pass that detects
and pulls back dropped chunks containing novel facts, exceptions,
or contradictions that the kept chunks don't cover.

Pipeline:
  Step 1 — CLASSIFY query type → set budget multiplier
  Step 2 — COMPUTE adaptive budget from input × multiplier
  Step 3 — SCORE + RANK chunks by relevance
  Step 4 — STRIP each chunk to essentials
  Step 5 — FILL kept chunks until budget spent
  Step 6 — RECOVERY: scan dropped chunks for novel facts, exceptions, contradictions
  Step 7 — ASSEMBLE final injection

Usage:
  python3 rag/pipeline_adaptive_recovery.py --test
  python3 rag/pipeline_adaptive_recovery.py --benchmark
"""

import sys, os, re, math, json, time
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass, field

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, os.path.join(SCRIPT_DIR, '..', 'Teams', 'Shared OS', 'logical'))

from injector import estimate_tokens


# ═══════════════════════════════════════════════════════════════════
# TASK CLASSIFICATION → BUDGET MULTIPLIER
# ═══════════════════════════════════════════════════════════════════

TASK_BUDGET_MULTIPLIERS = {
    'creative_review':      0.6,   # Spark needs rules, not rationale
    'copy_edit':            0.5,   # Model knows grammar
    'factual_lookup':       0.4,   # One citation answers it
    'standard_review':      1.0,   # Baseline
    'governance_decision':  2.5,   # Needs precedents, thresholds, cross-refs
    'strategic_analysis':   3.0,   # Multiple perspectives, computed facts
    'legal_review':         4.0,   # Missing context = liability
    'engineering_debug':    1.5,   # Code patterns, architecture context
    'financial_analysis':   2.0,   # Numbers, models, sensitivity
    'compliance_check':     2.5,   # Regulatory text, interpretations
}

# Keyword → task type mapping
TASK_KEYWORDS = {
    'creative_review':      ['headline', 'copy', 'creative', 'ad', 'visual', 'design', 'brand voice', 'tone'],
    'copy_edit':            ['edit', 'proofread', 'grammar', 'spelling', 'typo', 'punctuation'],
    'factual_lookup':       ['what is', 'define', 'definition', 'lookup', 'find', 'check', 'verify', 'show me'],
    'governance_decision':  ['board', 'fiduciary', 'constitution', 'violation', 'veto', 'oversight', 'charter', 'compliance audit'],
    'strategic_analysis':   ['acquire', 'acquisition', 'merger', 'investment', 'strategy', 'pivot', 'valuation', 'funding', 'round'],
    'legal_review':         ['lawsuit', 'legal', 'breach', 'contract', 'liability', 'GDPR', 'CCPA', 'HIPAA', 'regulatory'],
    'engineering_debug':    ['bug', 'error', 'fix', 'build', 'deploy', 'pipeline', 'CI/CD', 'debug', 'crash'],
    'financial_analysis':   ['NPV', 'WACC', 'IRR', 'cashflow', 'budget', 'revenue', 'margin', 'P&L', 'financial'],
    'compliance_check':     ['compliance', 'regulation', 'audit', 'standard', 'ISO', 'NIST', 'SOC2', 'policy'],
}

# Agent → default task type
AGENT_TASK_DEFAULTS = {
    'spark': 'creative_review',
    'board': 'governance_decision',
    'precedent': 'governance_decision',
    'marcus': 'strategic_analysis',
    'echo': 'strategic_analysis',
    'vista': 'financial_analysis',
    'dev': 'engineering_debug',
    'ops': 'engineering_debug',
    'warden': 'compliance_check',
    'comply': 'legal_review',
    'price': 'financial_analysis',
}


def classify_task(query: str, agent_id: str = '') -> str:
    """Classify query into a task type for budget multiplier selection."""
    q = query.lower()

    # Agent default if query is generic
    if agent_id.lower() in AGENT_TASK_DEFAULTS and len(q) < 30:
        return AGENT_TASK_DEFAULTS[agent_id.lower()]

    # Score each task type by keyword matches
    scores = {}
    for task_type, keywords in TASK_KEYWORDS.items():
        score = sum(3 for kw in keywords if kw in q)
        if score > 0:
            scores[task_type] = score

    if scores:
        return max(scores, key=scores.get)

    # Fallback: check query structure
    if q.startswith(('what is', 'define', 'check', 'verify', 'lookup')):
        return 'factual_lookup'
    if q.startswith(('review', 'analyze', 'evaluate', 'assess')):
        return 'standard_review'
    return 'standard_review'


def get_budget_multiplier(task_type: str) -> float:
    """Get the budget multiplier for a task type. 1.0 = baseline."""
    return TASK_BUDGET_MULTIPLIERS.get(task_type, 1.0)


# ═══════════════════════════════════════════════════════════════════
# ADAPTIVE BUDGET COMPUTATION
# ═══════════════════════════════════════════════════════════════════

BUDGET_BASE_RATIO = 0.15  # Base: 15% of input
BUDGET_CEILING = 800
BUDGET_FLOOR = 80
SMALL_INPUT = 400


def compute_adaptive_budget(input_tokens: int, task_type: str) -> int:
    """Compute budget adapted to both input size and task type."""
    multiplier = get_budget_multiplier(task_type)

    if input_tokens < SMALL_INPUT:
        # Small input: wider ratio (40%), scaled by multiplier
        target = max(BUDGET_FLOOR, int(input_tokens * 0.40 * multiplier))
    else:
        target = int(input_tokens * BUDGET_BASE_RATIO * multiplier)

    # Safety margin
    if target < BUDGET_CEILING:
        target = max(BUDGET_FLOOR, int(target * 0.85))

    return min(target, BUDGET_CEILING)


# ═══════════════════════════════════════════════════════════════════
# STRIP + SCORE (reused from destructor)
# ═══════════════════════════════════════════════════════════════════

KEEP_PATTERNS = [
    (r'\b(must\s+not|must|never|shall|require(?:s|d)?|mandatory|prohibit(?:ed|s)?|do\s+not)\b', 'rule'),
    (r'\b(Ch\.\s*\d+|pp?\.\s*\d+|§\s*\d+[\d.]*|Article\s+\d+|Principle\s+\d+)\b', 'citation'),
    (r'\b(\$\d[\d,.]*[BMK]?|\d+(?:\.\d+)?%|\d+x|\d+\.\d+x)\b', 'number'),
    (r'\b(Ogilvy|Cialdini|Kahneman|Porter|Brealey|Myers|OECD|NIST|ISO|AICPA|GDPR|CCPA|HIPAA|Heath|DeMarco|Aaker|Ries|Trout)\b', 'authority'),
    (r'\b(VIOLATION|VETO|REJECT|APPROVE|HOLD|PASS|STOP|HALT|ESCALATE)\b', 'gate'),
    (r'\[COMPUTED\]', 'computed'),
]

DESTROY_PATTERNS = [
    r'(?i)^\s*(this|the|here|below|above)\s+(section|chapter|document|file|guide|framework)\s+(covers|describes|explains|contains)',
    r'(?i)^\s*(note that|it is important to|one should|please be aware|remember that)',
    r'(?i)^\s*(for more|see also|refer to|additional|further reading)',
    r'(?i)^\s*(in other words|to put it simply|essentially|basically|in summary|to summarize)',
    r'(?i)^\s*(for example|as an example|example:|e\.g\.|i\.e\.|such as|like the)',
]

EXCEPTION_PATTERNS = [
    r'\b(unless|except|however|although|but|despite|notwithstanding|on the other hand)\b',
    r'\b(not always|not necessarily|it depends|case by case|varies)\b',
    r'\b(caveat|exception|limitation|restriction|qualification|condition)\b',
]

MIN_CHUNK_CHARS = 20


def _has_value(sent: str) -> bool:
    for pat, _ in KEEP_PATTERNS:
        if re.search(pat, sent, re.IGNORECASE):
            return True
    return False


def _is_filler(sent: str) -> bool:
    for pat in DESTROY_PATTERNS:
        if re.search(pat, sent, re.IGNORECASE):
            return True
    return False


def _is_exception(sent: str) -> bool:
    for pat in EXCEPTION_PATTERNS:
        if re.search(pat, sent, re.IGNORECASE):
            return True
    return False


def strip_chunk(text: str) -> str:
    if not text or len(text) < MIN_CHUNK_CHARS:
        return text
    sentences = re.split(r'(?<=[.!?])\s+', text)
    if len(sentences) <= 1:
        return text if (_has_value(text) and not _is_filler(text)) else ''
    kept = [s for s in sentences if not _is_filler(s) and _has_value(s)]
    if not kept and sentences and not _is_filler(sentences[0]):
        return sentences[0][:120]
    return ' '.join(kept)


def score_chunk(chunk: Dict, query: str) -> float:
    text = chunk.get('chunk_text', chunk.get('toon_text', ''))
    q_terms = set(re.findall(r'[a-z]{3,}', query.lower()))
    t_terms = set(re.findall(r'[a-z]{3,}', text.lower()))
    score = min(len(q_terms & t_terms) / max(len(q_terms), 1), 1.0) * 0.4
    score += min(len(re.findall(r'(Ch\.|p\.|§|Article)', text)) * 0.1, 0.2)
    score += min(len(re.findall(r'\b(\d+%|\$\d+[\d,.]*|\d+x)', text)) * 0.05, 0.15)
    t = chunk.get('priority_tier', 2)
    score += 0.15 if t == 1 else 0.05 if t == 2 else 0
    if chunk.get('adversary'): score += 0.15
    return score


def rank_chunks(chunks: List[Dict], query: str) -> List[Dict]:
    t1 = sorted([c for c in chunks if c.get('priority_tier') == 1], key=lambda c: score_chunk(c, query), reverse=True)
    t2 = sorted([c for c in chunks if c.get('priority_tier') != 1], key=lambda c: score_chunk(c, query), reverse=True)
    return t1 + t2


# ═══════════════════════════════════════════════════════════════════
# NOVELTY DETECTOR — for recovery pass
# ═══════════════════════════════════════════════════════════════════

def extract_facts(text: str) -> Set[str]:
    """Extract normalized factual claims from text."""
    facts = set()
    # Named entities
    for m in re.finditer(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b', text):
        facts.add(('entity', m.group(1).lower()))
    # Numbers with context
    for m in re.finditer(r'(\d+(?:\.\d+)?%|\$\d[\d,.]*[BMK]?|\d+x|\d+\.\d+x)', text):
        facts.add(('number', m.group(1)))
    # Rules
    for m in re.finditer(r'\b(must\s+not|must|never|shall|require)\s+(\w+)', text, re.IGNORECASE):
        facts.add(('rule', m.group(0).lower()))
    # Citations
    for m in re.finditer(r'(Ch\.\s*\d+|pp?\.\s*\d+|§\s*\d+[\d.]*)', text):
        facts.add(('citation', m.group(1)))
    return facts


def is_exception_sentence(sent: str) -> bool:
    """Check if a sentence is an exception to a general rule."""
    return _is_exception(sent) and not _is_filler(sent)


def is_contradiction(dropped_text: str, kept_texts: List[str]) -> bool:
    """Check if dropped text contradicts something in kept texts."""
    dropped_lower = dropped_text.lower()
    # Simple heuristic: negation words + opposite claims
    has_negation = bool(re.search(r'\b(not|never|no\b|don\'t|cannot|shouldn\'t|won\'t)\b', dropped_lower))
    if not has_negation:
        return False
    # Check if dropped text shares key terms with any kept text AND negates
    for kt in kept_texts:
        d_terms = set(re.findall(r'[a-z]{4,}', dropped_lower))
        k_terms = set(re.findall(r'[a-z]{4,}', kt.lower()))
        overlap = len(d_terms & k_terms)
        if overlap >= 3 and has_negation:
            return True
    return False


# ═══════════════════════════════════════════════════════════════════
# RECOVERY PASS
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RecoveredChunk:
    chunk: Dict
    reason: str  # 'novel_fact', 'exception', 'contradiction', 'defines_term'
    fact_detail: str


def recovery_pass(kept: List[Dict], dropped: List[Dict],
                  query: str, remaining_budget_tokens: int) -> Tuple[List[Dict], List[RecoveredChunk]]:
    """
    Scan dropped chunks for things the kept chunks don't cover.
    Recovery triggers:
      1. NOVEL FACT: dropped chunk has an entity/number/rule not in any kept chunk
      2. EXCEPTION: dropped chunk contains an exception to a rule in kept chunks
      3. CONTRADICTION: dropped chunk directly contradicts a kept chunk
      4. DEFINES: dropped chunk defines a term heavily used in kept chunks
    """
    # Extract all facts from kept chunks
    kept_texts = [c.get('_stripped', c.get('toon_text', c.get('chunk_text', ''))) for c in kept]
    kept_facts = set()
    for t in kept_texts:
        kept_facts.update(extract_facts(t))

    # Extract query terms for term-definition detection
    query_terms = set(re.findall(r'[a-z]{4,}', query.lower()))

    recovered_chunks = []
    recovery_log = []
    budget_remaining = max(remaining_budget_tokens, 20)  # Minimum recovery budget

    for chunk in dropped:
        text = chunk.get('chunk_text', chunk.get('toon_text', ''))
        stripped = chunk.get('_stripped', strip_chunk(text))
        if not stripped or len(stripped) < MIN_CHUNK_CHARS:
            continue

        chunk_facts = extract_facts(stripped)
        new_facts = chunk_facts - kept_facts
        sentences = re.split(r'(?<=[.!?])\s+', stripped)

        recovered = False

        # Check 1: Novel facts not in kept chunks
        if len(new_facts) >= 2:
            fact_types = ', '.join(set(f[0] for f in list(new_facts)[:3]))
            recovery_log.append(RecoveredChunk(
                chunk=chunk, reason='novel_fact',
                fact_detail=f'{len(new_facts)} novel {fact_types}'))
            recovered = True

        # Check 2: Exception sentences
        if not recovered:
            for sent in sentences:
                if is_exception_sentence(sent):
                    recovery_log.append(RecoveredChunk(
                        chunk=chunk, reason='exception',
                        fact_detail=sent[:80]))
                    recovered = True
                    break

        # Check 3: Contradictions
        if not recovered:
            if is_contradiction(stripped, kept_texts):
                recovery_log.append(RecoveredChunk(
                    chunk=chunk, reason='contradiction',
                    fact_detail='Negation of kept claim'))
                recovered = True

        # Check 4: Defines a key term (query term appears in first sentence)
        if not recovered:
            first_sent = sentences[0] if sentences else ''
            for term in query_terms:
                if term in first_sent.lower() and len(first_sent) < 200:
                    recovery_log.append(RecoveredChunk(
                        chunk=chunk, reason='defines_term',
                        fact_detail=f'Defines: {term}'))
                    recovered = True
                    break

        if recovered:
            chunk_cost_tokens = estimate_tokens(stripped)
            if chunk_cost_tokens <= budget_remaining:
                chunk['_stripped'] = stripped
                chunk['_recovered'] = True
                chunk['_recovery_reason'] = recovery_log[-1].reason
                kept.append(chunk)
                budget_remaining -= chunk_cost_tokens
                kept_facts.update(chunk_facts)
            elif budget_remaining < 20:
                break  # No budget left for recovery

    # Mark unrecovered in dropped list
    recovered_ids = {c.get('chunk_id', '') for c in kept if c.get('_recovered')}
    still_dropped = [d for d in dropped if d.get('chunk_id', '') not in recovered_ids]

    return kept, recovery_log, still_dropped


# ═══════════════════════════════════════════════════════════════════
# FULL PIPELINE
# ═══════════════════════════════════════════════════════════════════

@dataclass
class AdaptiveRecoveryResult:
    query: str
    agent_id: str
    task_type: str
    budget_multiplier: float
    input_chunks: int
    input_tokens: int
    budget_tokens: int
    kept_chunks: int
    recovered_chunks: int
    dropped_chunks: int
    stripped_chars_saved: int
    final_tokens: int
    savings_pct: float
    injection_text: str
    guarantee_met: bool
    recovery_log: List[RecoveredChunk] = field(default_factory=list)
    quality_score: float = 0.0  # Estimated quality preservation (0-1)
    trace: Dict = field(default_factory=dict)


def adaptive_recovery_inject(
    chunks: List[Dict],
    query: str,
    agent_id: str = 'default',
    max_budget: Optional[int] = None,
) -> AdaptiveRecoveryResult:
    """Full Option 1+3 pipeline with quality tracking."""

    if not chunks:
        return AdaptiveRecoveryResult(
            query=query, agent_id=agent_id, task_type='none',
            budget_multiplier=0, input_chunks=0, input_tokens=0,
            budget_tokens=0, kept_chunks=0, recovered_chunks=0,
            dropped_chunks=0, stripped_chars_saved=0,
            final_tokens=0, savings_pct=100.0, injection_text='',
            guarantee_met=True,
        )

    all_text = ' '.join(c.get('toon_text', c.get('chunk_text', '')) for c in chunks)
    input_tokens = estimate_tokens(all_text)
    total_input_chars = sum(len(c.get('toon_text', c.get('chunk_text', ''))) for c in chunks)

    # Step 1: Classify task
    task_type = classify_task(query, agent_id)
    multiplier = get_budget_multiplier(task_type)

    # Step 2: Adaptive budget
    budget_tokens = max_budget if max_budget is not None else compute_adaptive_budget(input_tokens, task_type)
    # Reserve 20% of budget for recovery
    primary_budget = int(budget_tokens * 0.80)
    recovery_budget = budget_tokens - primary_budget

    # Step 3: Score + rank
    ranked = rank_chunks(chunks, query)

    # Step 4: Strip
    stripped_savings = 0
    for chunk in ranked:
        text = chunk.get('toon_text', chunk.get('chunk_text', ''))
        stripped = strip_chunk(text)
        stripped_savings += max(0, len(text) - len(stripped))
        chunk['_stripped'] = stripped
        chunk['_stripped_tokens'] = estimate_tokens(stripped)

    # Step 5: Fill to primary budget
    survival_mode = primary_budget < 200
    selected = []
    dropped = []
    tokens_used = 10  # Header

    for chunk in ranked:
        st = chunk.get('_stripped', '')
        stk = chunk.get('_stripped_tokens', 0)
        tier = chunk.get('priority_tier', 2)
        is_adv = chunk.get('adversary', False)

        if stk <= 0 or len(st) < MIN_CHUNK_CHARS:
            dropped.append(chunk)
            continue

        if survival_mode and tier != 1 and not is_adv:
            dropped.append(chunk)
            continue

        overhead = 6 if survival_mode else 12
        cost = stk + overhead

        if tokens_used + cost <= primary_budget:
            selected.append(chunk)
            tokens_used += cost
        else:
            old_idx = ranked.index(chunk) if chunk in ranked else len(ranked)
            # Try truncation
            remaining = primary_budget - tokens_used
            if remaining >= 6:
                rem_chars = remaining * 3
                if rem_chars >= MIN_CHUNK_CHARS:
                    chunk['_stripped'] = st[:rem_chars - 2] + '…'
                    chunk['_truncated'] = True
                    selected.append(chunk)
                    tokens_used = primary_budget
                else:
                    dropped.append(chunk)
            else:
                dropped.append(chunk)
            # Rest to dropped
            for rc in ranked[old_idx + 1:]:
                if rc.get('chunk_id') != chunk.get('chunk_id'):
                    dropped.append(rc)
            break

    # Ensure all non-selected ranked go to dropped
    selected_ids = {c.get('chunk_id', '') for c in selected}
    for c in ranked:
        if c.get('chunk_id', '') not in selected_ids and c not in dropped:
            dropped.append(c)

    # Step 6: Recovery pass
    recovered = 0
    if recovery_budget > 10 and dropped:
        # Only scan top-dropped by score
        dropped_scored = sorted(dropped, key=lambda c: score_chunk(c, query), reverse=True)
        dropped_to_scan = dropped_scored[:max(3, len(dropped)//3)]
        selected, recovery_log, dropped = recovery_pass(selected, dropped_to_scan, query, recovery_budget)
        # Update dropped list
        recovered = len([c for c in selected if c.get('_recovered')])
        still_dropped = [d for d in dropped_scored if d.get('chunk_id', '') not in {c.get('chunk_id', '') for c in selected}]
        dropped = still_dropped + dropped_scored[len(dropped_to_scan):]
    else:
        recovery_log = []

    # Step 7: Assemble
    lines = []
    label = task_type.replace('_', ' ').title()
    lines.append(f'[VYON · {agent_id} · {label} · {budget_tokens}t]')
    lines.append('')

    for chunk in selected:
        text = chunk.get('_stripped', chunk.get('toon_text', chunk.get('chunk_text', '')))
        src = chunk.get('source_file', 'unknown')[:40]
        sec = chunk.get('section', '')
        tier = chunk.get('priority_tier', 2)
        is_adv = chunk.get('adversary', False)
        is_rec = chunk.get('_recovered', False)

        if is_adv:
            prefix = '🔴'
        elif is_rec:
            prefix = '♻️'  # Recovered
        elif tier == 1:
            prefix = '⚠️'
        else:
            prefix = '-'

        flabel = f'{src} › {sec}' if sec else src
        if survival_mode:
            lines.append(f'{prefix} [{flabel}] {text}')
        else:
            lines.append(f'{prefix} [{flabel}]')
            lines.append(f'  {text}')
            lines.append('')

    if dropped:
        dts = {}
        for d in dropped:
            t = d.get('priority_tier', 2)
            dts[t] = dts.get(t, 0) + 1
        ts = ', '.join(f't{t}:{n}' for t, n in sorted(dts.items()))
        lines.append(f'-- {len(dropped)} dropped [{ts}] · rec: {recovered} · budget {budget_tokens}t --')

    injection_text = '\n'.join(lines)

    # Post-assembly enforcement
    max_chars = budget_tokens * 3
    if len(injection_text) > max_chars:
        minimal = [lines[0]]
        for chunk in selected:
            text = chunk.get('_stripped', chunk.get('toon_text', chunk.get('chunk_text', '')))
            src = chunk.get('source_file', 'unknown')[:35]
            tier = chunk.get('priority_tier', 2)
            pf = '🔴' if chunk.get('adversary') else '♻️' if chunk.get('_recovered') else '⚠️' if tier == 1 else '-'
            minimal.append(f'{pf} [{src}] {text}')
        if dropped:
            minimal.append(f'[{-len(dropped)}c]')
        injection_text = '\n'.join(minimal)
        if len(injection_text) > max_chars:
            injection_text = injection_text[:max_chars - 2] + '…'

    final_tokens = estimate_tokens(injection_text)
    savings = (1 - final_tokens / max(input_tokens, 1)) * 100
    guarantee_met = final_tokens <= max(budget_tokens, BUDGET_FLOOR)

    # Quality score: ratio of unique facts preserved vs original
    kept_texts = [c.get('_stripped', c.get('toon_text', c.get('chunk_text', ''))) for c in selected]
    all_facts_kept = set()
    for t in kept_texts:
        all_facts_kept.update(extract_facts(t))
    all_facts_original = set()
    for c in chunks:
        all_facts_original.update(extract_facts(c.get('chunk_text', c.get('toon_text', ''))))
    quality = len(all_facts_kept) / max(len(all_facts_original), 1)

    trace = {
        'input_chunks': len(chunks), 'input_tokens': input_tokens,
        'task_type': task_type, 'multiplier': multiplier,
        'budget_tokens': budget_tokens, 'primary_budget': primary_budget,
        'recovery_budget': recovery_budget, 'kept': len(selected),
        'recovered': recovered, 'dropped': len(dropped),
        'final_tokens': final_tokens, 'quality_score': round(quality, 3),
    }

    return AdaptiveRecoveryResult(
        query=query, agent_id=agent_id, task_type=task_type,
        budget_multiplier=multiplier,
        input_chunks=len(chunks), input_tokens=input_tokens,
        budget_tokens=budget_tokens,
        kept_chunks=len(selected), recovered_chunks=recovered,
        dropped_chunks=len(dropped),
        stripped_chars_saved=stripped_savings,
        final_tokens=final_tokens, savings_pct=round(savings, 1),
        injection_text=injection_text, guarantee_met=guarantee_met,
        recovery_log=recovery_log, quality_score=round(quality, 3),
        trace=trace,
    )
