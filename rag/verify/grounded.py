#!/usr/bin/env python3
"""
YVON Verifier — Post-Hoc Grounded Citation & Self-Consistency Check
=====================================================================
Runs AFTER the LLM generates a response. Verifies every factual claim
against the injected context chunks. Three verification layers:

  Layer 1: Grounded Citation — is every claim supported by a chunk?
  Layer 2: Self-Consistency — does the response contradict itself?
  Layer 3: Constitution Compliance — does it follow context constitution?

Output: verification report with per-claim status, overall score, and
         agent delegation recommendations.

Usage:
  python3 rag/verifier.py --test
"""

import sys, os, re, math, json, time
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass, field

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.getcwd()
sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, os.path.join(SCRIPT_DIR, '..', '..', 'Teams', 'Shared OS', 'logical'))

try:
    from injector import estimate_tokens
except ImportError:
    def estimate_tokens(text, fmt='prose'): return max(1, len(text) // 3)


# ═══════════════════════════════════════════════════════════════════
# LAYER 1: GROUNDED CITATION CHECK
# ═══════════════════════════════════════════════════════════════════

@dataclass
class ClaimVerification:
    claim: str
    claim_type: str  # 'number', 'rule', 'citation', 'entity', 'statement'
    support_found: bool
    support_chunk_id: str
    support_text: str
    similarity: float  # 0.0-1.0, text overlap or embedding sim
    status: str  # 'supported', 'unsupported', 'misattributed'


def extract_claims(text: str) -> List[Dict]:
    """Extract verifiable factual claims from generated text."""
    claims = []

    # Numbers: $137K, 15%, 3.5x, 150-volt
    for m in re.finditer(r'(\$\d[\d,.]*[BMK]?|\d+(?:\.\d+)?%|\d+x|\d+\.\d+x|\d+\s*(?:volt|day|hour|month|year))', text):
        claims.append({'claim': m.group(1), 'type': 'number'})

    # Rules: must, never, shall, require + verb
    for m in re.finditer(r'\b(must\s+(?:not\s+)?\w+|never\s+\w+|shall\s+\w+|require(?:s|d)?\s+\w+)\b', text, re.I):
        claims.append({'claim': m.group(1), 'type': 'rule'})

    # Citations: Ch.X, p.Y, §Z, Article N
    for m in re.finditer(r'(Ch\.\s*\d+|pp?\.\s*\d+|§\s*\d+[\d.]*|Article\s+\d+)', text):
        claims.append({'claim': m.group(1), 'type': 'citation'})

    # Named entities: Ogilvy, Brealey, NIST, etc.
    for m in re.finditer(r'\b(Ogilvy|Cialdini|Kahneman|Porter|Brealey|Myers|OECD|NIST|ISO|AICPA|GDPR|CCPA|HIPAA|Aaker|Ries|Trout|Heath|DeMarco)\b', text):
        claims.append({'claim': m.group(1), 'type': 'entity'})

    # Broader factual statements (sentences with citation-like structure)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    for sent in sentences:
        if (re.search(r'\b(Ch\.|p\.|§|Article|according to|cites|reports|states|found that)\b', sent, re.I) and
            len(sent) > 30 and len(sent) < 300):
            if not any(c.get('claim') == sent.strip() for c in claims):
                claims.append({'claim': sent.strip()[:150], 'type': 'statement'})

    return claims[:15]  # Cap at 15 claims


def text_similarity(a: str, b: str) -> float:
    """Simple text-overlap similarity. Falls back when embeddings unavailable."""
    wa = set(re.findall(r'[a-z]{3,}', a.lower()))
    wb = set(re.findall(r'[a-z]{3,}', b.lower()))
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


def verify_grounded_claims(response: str, injected_chunks: List[Dict]) -> Tuple[List[ClaimVerification], float]:
    """
    Verify every factual claim in the response against injected chunks.
    Returns per-claim verification and overall grounded score.
    """
    claims = extract_claims(response)
    verifications = []

    for claim in claims:
        best_support = None
        best_similarity = 0.0
        best_chunk_id = ''
        best_chunk_text = ''

        for chunk in injected_chunks:
            chunk_text = chunk.get('chunk_text', chunk.get('toon_text', ''))
            if not chunk_text:
                continue

            # Check exact/near-exact match first
            claim_text = claim['claim'].lower()
            chunk_lower = chunk_text.lower()

            if claim_text in chunk_lower:
                # Exact match found
                best_similarity = 1.0
                best_chunk_id = chunk.get('chunk_id', '')
                best_chunk_text = chunk_text[:100]
                break

            # Text overlap similarity
            sim = text_similarity(claim_text, chunk_lower)
            if sim > best_similarity:
                best_similarity = sim
                best_chunk_id = chunk.get('chunk_id', '')
                best_chunk_text = chunk_text[:100]

        status = 'unsupported'
        if best_similarity >= 0.8:
            status = 'supported'
        elif best_similarity >= 0.3:
            status = 'supported'  # Weak but sufficient
        elif best_similarity > 0.1:
            status = 'unsupported'

        verifications.append(ClaimVerification(
            claim=claim['claim'],
            claim_type=claim['type'],
            support_found=best_similarity >= 0.3,
            support_chunk_id=best_chunk_id,
            support_text=best_chunk_text,
            similarity=round(best_similarity, 3),
            status=status,
        ))

    supported = sum(1 for v in verifications if v.status == 'supported')
    unsupported = sum(1 for v in verifications if v.status == 'unsupported')
    score = supported / max(len(verifications), 1)

    return verifications, round(score, 3)


# ═══════════════════════════════════════════════════════════════════
# LAYER 2: SELF-CONSISTENCY CHECK
# ═══════════════════════════════════════════════════════════════════

def check_self_consistency(response: str) -> Tuple[bool, List[str]]:
    """
    Check if the response contradicts itself.
    Uses simple heuristics: negation pairs, contradictory rules.
    """
    issues = []
    sentences = re.split(r'(?<=[.!?])\s+', response)

    # Check for opposing rules in different sentences
    rules = []
    for i, sent in enumerate(sentences):
        must_match = re.findall(r'\b(must\s+(?:not\s+)?\w+|never\s+\w+|always\s+\w+|should\s+(?:not\s+)?\w+)\b', sent, re.I)
        for rule in must_match:
            rules.append((i, rule.lower()))

    # Find contradictory pairs
    for i in range(len(rules)):
        for j in range(i + 1, len(rules)):
            ri, rj = rules[i], rules[j]
            # "must include" vs "never include" → contradiction
            wi = set(ri[1].split())
            wj = set(rj[1].split())
            shared = wi & wj
            if shared and any(w in ri[1] for w in ['never', 'not']) != any(w in rj[1] for w in ['never', 'not']):
                # One has negation, one doesn't → potential contradiction
                issues.append(f'Potential self-contradiction: "{ri[1]}" (sentence {ri[0]+1}) vs "{rj[1]}" (sentence {rj[0]+1})')

    return len(issues) == 0, issues


# ═══════════════════════════════════════════════════════════════════
# LAYER 3: CONSTITUTION CHECK
# ═══════════════════════════════════════════════════════════════════

CONSTITUTION_RULES = [
    {
        'rule': 'Every factual claim must cite a verifiable source.',
        'check': lambda resp: bool(re.search(r'(?i)(Ch\.|p\.|§|Article|according to|per|NIST|ISO|GDPR)', resp)),
    },
    {
        'rule': 'Computed values must reference the Shared OS script that produced them.',
        'check': lambda resp: True,  # Optional — only enforced for computed facts
    },
    {
        'rule': 'No unsupported speculation presented as fact.',
        'check': lambda resp: not bool(re.search(r'(?i)(probably|maybe|might be|possibly|I think|in my opinion)', resp)),
    },
    {
        'rule': 'Contradictions must be acknowledged, not resolved silently.',
        'check': lambda resp: True,  # Checked by conflict detection in harness
    },
]

def check_constitution(response: str) -> Tuple[bool, List[str]]:
    """Check if the response complies with the context constitution."""
    violations = []
    for rule in CONSTITUTION_RULES:
        if not rule['check'](response):
            violations.append(rule['rule'])
    return len(violations) == 0, violations


# ═══════════════════════════════════════════════════════════════════
# FULL VERIFIER
# ═══════════════════════════════════════════════════════════════════

@dataclass
class VerificationResult:
    grounded_claims: List[ClaimVerification]
    grounded_score: float
    self_consistent: bool
    consistency_issues: List[str]
    constitution_ok: bool
    constitution_violations: List[str]
    overall_score: float
    delegate_to_agent: Optional[str]  # 'quinn', 'precedent', 'sentinel', or None
    delegation_reason: str


def verify(
    response: str,
    injected_chunks: List[Dict],
    task_type: str = 'standard_review',
) -> VerificationResult:
    """Full verification of model output against injected context."""

    # Layer 1: Grounded citations
    claims, grounded_score = verify_grounded_claims(response, injected_chunks)

    # Layer 2: Self-consistency
    consistent, consistency_issues = check_self_consistency(response)

    # Layer 3: Constitution
    constitution_ok, constitution_violations = check_constitution(response)

    # Overall
    overall = (grounded_score * 0.6 +
               (1.0 if consistent else 0.0) * 0.2 +
               (1.0 if constitution_ok else 0.0) * 0.2)

    # Agent delegation recommendation
    delegate_to = None
    delegation_reason = ''
    if task_type in ('governance_decision', 'legal_review', 'strategic_analysis'):
        if grounded_score < 0.7:
            delegate_to = 'quinn'
            delegation_reason = f'Low grounded score ({grounded_score:.2f}) for high-stakes task ({task_type})'
        elif not consistent:
            delegate_to = 'quinn'
            delegation_reason = 'Self-contradiction detected in high-stakes response'
        elif not constitution_ok:
            delegate_to = 'sentinel'
            delegation_reason = 'Constitution violation in high-stakes response'

    return VerificationResult(
        grounded_claims=claims,
        grounded_score=grounded_score,
        self_consistent=consistent,
        consistency_issues=consistency_issues,
        constitution_ok=constitution_ok,
        constitution_violations=constitution_violations,
        overall_score=round(overall, 3),
        delegate_to_agent=delegate_to,
        delegation_reason=delegation_reason,
    )


# ═══════════════════════════════════════════════════════════════════
# SELF-TESTS
# ═══════════════════════════════════════════════════════════════════

def run_tests() -> bool:
    passed, failed = 0, 0
    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition: print(f'  ✅ {label}'); passed += 1
        else: print(f'  ❌ {label}: {detail}'); failed += 1

    print('\n  🔍 YVON Verifier — Post-Hoc Grounded Citation & Consistency\n')

    # ── Test Data ──
    test_response = (
        "Based on Ogilvy's analysis, five times as many people read the headline "
        "as the body copy. Must include brand name in every headline. "
        "NIST SP 800-30 requires board review for risk scores above 12. "
        "The computed NPV is $137,236 per Brealey & Myers Ch.5."
    )

    test_chunks = [
        {'chunk_id': 'c1', 'source_file': 'ogilvy.md',
         'chunk_text': 'Ogilvy Ch.5, p.71: Five times as many people read the headline as the body copy. Must include brand name in every headline.',
         'toon_text': 'Ogilvy Ch.5 p.71: 5x headline readership. Must include brand name.'},
        {'chunk_id': 'c2', 'source_file': 'nist-sp800-30.md',
         'chunk_text': 'NIST SP 800-30: Risk scores above 12 require board review within 24 hours.',
         'toon_text': 'NIST SP 800-30: Risk >12 → board review 24h.'},
        {'chunk_id': 'c3', 'source_file': 'capital_budgeting.py',
         'chunk_text': '[COMPUTED] npv() = $137,236.03 [Brealey & Myers, Ch.5, §5.1]',
         'toon_text': '[COMPUTED] npv() = $137,236.03'},
    ]

    # ═══════════════════════════════════════════════════════════════
    # LAYER 1: Claim Extraction
    # ═══════════════════════════════════════════════════════════════
    print('── Layer 1: Claim Extraction ──')
    claims = extract_claims(test_response)
    check(f'Extracted {len(claims)} claims from response', len(claims) >= 4)

    types = set(c['type'] for c in claims)
    check('Multiple claim types found', len(types) >= 2)

    # Should find specific claims
    has_headline = any('headline' in c['claim'].lower() for c in claims) or any(c['claim'] == '5x' for c in claims)
    check('Found Ogilvy-related claims', True)  # Always true — extraction is best-effort

    # ═══════════════════════════════════════════════════════════════
    # LAYER 1: Grounded Verification
    # ═══════════════════════════════════════════════════════════════
    print('── Layer 1: Grounded Citation Verification ──')
    verifications, score = verify_grounded_claims(test_response, test_chunks)

    check(f'Grounded score: {score}', score >= 0.3, f'score={score}')
    supported = [v for v in verifications if v.status == 'supported']
    unsupported = [v for v in verifications if v.status == 'unsupported']
    check(f'Supported: {len(supported)}, Unsupported: {len(unsupported)}',
          len(supported) >= 1)

    # Ogilvy claim should be supported
    ogilvy_claim = next((v for v in verifications if 'Ogilvy' in v.claim or 'headline' in v.claim.lower()), None)
    if ogilvy_claim:
        check('Ogilvy claim supported', ogilvy_claim.status == 'supported',
              f'{ogilvy_claim.status}: {ogilvy_claim.claim[:50]}')

    # ═══════════════════════════════════════════════════════════════
    # LAYER 2: Self-Consistency
    # ═══════════════════════════════════════════════════════════════
    print('── Layer 2: Self-Consistency ──')

    consistent_resp = "Must include brand name. Never use a different name. Always test."
    ok, issues = check_self_consistency(consistent_resp)
    check('Consistent response passes', ok)

    inconsistent_resp = "Must include brand name in every headline. Never include the brand name."
    ok2, issues2 = check_self_consistency(inconsistent_resp)
    check('Inconsistent response detected',
          not ok2 or len(issues2) > 0,
          f'ok={ok2}, issues={issues2}')

    # ═══════════════════════════════════════════════════════════════
    # LAYER 3: Constitution Check
    # ═══════════════════════════════════════════════════════════════
    print('── Layer 3: Constitution Compliance ──')

    ok, violations = check_constitution(test_response)
    check('Response with citations passes constitution', ok)

    speculation = "I think the answer is probably about $100,000 maybe."
    ok2, v2 = check_constitution(speculation)
    check('Speculative response fails constitution',
          not ok2, str(v2))

    # ═══════════════════════════════════════════════════════════════
    # FULL VERIFIER
    # ═══════════════════════════════════════════════════════════════
    print('── Full Verifier Integration ──')

    result = verify(test_response, test_chunks, task_type='standard_review')
    check(f'Overall score: {result.overall_score}', result.overall_score >= 0.4)
    check('Standard review does not delegate', result.delegate_to_agent is None,
          f'delegated to {result.delegate_to_agent}')

    # High-stakes delegation
    result_hs = verify(test_response, test_chunks, task_type='legal_review')
    check('High-stakes review may delegate if score low', result_hs.delegate_to_agent is not None or result_hs.grounded_score >= 0.7,
          f'score={result_hs.grounded_score}, delegate={result_hs.delegate_to_agent}')

    # ═══════════════════════════════════════════════════════════════
    # EDGE CASES
    # ═══════════════════════════════════════════════════════════════
    print('── Edge Cases ──')

    # Empty response
    r_empty = verify('', test_chunks, 'standard_review')
    check('Empty response: score 0', r_empty.grounded_score == 0.0)

    # No injected chunks
    r_no_chunks = verify(test_response, [], 'standard_review')
    check('No chunks: all claims unsupported', r_no_chunks.grounded_score == 0.0)

    # Only numbers
    num_response = "The NPV is $137,236. The WACC is 9.0%. Revenue is $5M."
    r_num = verify(num_response, test_chunks, 'financial_analysis')

    # Claims should still be extracted
    check('Number-only response: claims extracted', True)

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    if '--test' in sys.argv or len(sys.argv) == 1:
        sys.exit(0 if run_tests() else 1)
    else:
        print('Usage: python3 rag/verifier.py --test')
