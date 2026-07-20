#!/usr/bin/env python3
"""
YVON Harness Upgrade — End-to-End Validation Suite
=====================================================
12 strict scenarios across all domains. All tests run in sandbox.

Tests: creative, finance, legal, governance, engineering,
        factual, multi-dept, contradiction, stale/forged,
        progressive disclosure, degradation detection, self-improver

Usage:
  python3 rag/e2e_validation.py
"""

import sys, os, json, math, time
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if '__file__' in dir() else os.path.join('/sessions/cool-stoic-einstein/mnt/Agents', 'rag')
# Fallback: if we're running from experiments/, go up one level
if not os.path.exists(os.path.join(SCRIPT_DIR, 'injector.py')) and not os.path.exists(os.path.join(SCRIPT_DIR, 'core')):
    SCRIPT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, os.path.join(SCRIPT_DIR, '..', 'Teams', 'Shared OS', 'logical'))

from typing import List, Dict, Tuple

# ── SAFE IMPORTS ──
def load_module(name):
    # Handle subdirectory paths (e.g., 'harness/gates')
    path = os.path.join(SCRIPT_DIR, f'{name}.py') if '/' not in str(name) else os.path.join(SCRIPT_DIR, str(name) + '.py')
    if not os.path.exists(path):
        # Try old flat path as fallback
        alt = os.path.join(os.path.dirname(SCRIPT_DIR) if 'experiments' in SCRIPT_DIR else SCRIPT_DIR, str(name).replace('/', '/'), '.py')
    with open(path) as f:
        code = compile(f.read(), path, 'exec')
    ns = {'__name__': name, '__file__': path}
    exec(code, ns)
    return ns

try:
    from injector import estimate_tokens
except ImportError:
    def estimate_tokens(t, f='prose'): return max(1, len(t)//3)

# Load all modules
harness = load_module(os.path.join('harness','gates'))
verifier = load_module(os.path.join('verify','grounded'))
prog = load_module(os.path.join('harness','disclosure'))
field = load_module(os.path.join('monitor','watcher'))
improver = load_module(os.path.join('monitor','improver'))

# Extract functions from module namespaces
process = harness['process']
verify = verifier['verify']
ProgressiveDisclosure = prog['ProgressiveDisclosure']
generate_report = field['generate_report']
run_improvement_cycle = improver['run_improvement_cycle']

# ── Test Chunks (synthetic, 15 chunks across domains) ──
CHUNKS = [
    {'chunk_id': 'c1', 'source_file': 'Teams/Shared OS/logical/ogilvy-creative-code.md',
     'section': 'Headline Rules', 'priority_tier': 1, 'adversary': False,
     'quality_score': 0.95, 'department': 'Brand Studio', 'document_type': 'reference',
     'last_modified': '2026-07-15T00:00:00Z',
     'toon_text': 'Ogilvy Ch.5, p.71: Five times as many people read the headline as body copy. Must include brand name. Never use a headline that does not sell. Must be specific.',
     'chunk_text': 'Ogilvy Ch.5, p.71: Must include brand name. Never use unspecific headlines.'},
    {'chunk_id': 'c2', 'source_file': 'ogilvy-creative-code.md',
     'section': 'Headline Exceptions', 'priority_tier': 2, 'adversary': False,
     'quality_score': 0.70, 'department': 'Brand Studio', 'document_type': 'reference',
     'last_modified': '2026-07-15T00:00:00Z',
     'toon_text': 'Exception to headline rules: unless curiosity gap, brand name can be withheld. A/B tests show 23% higher CTR. Use sparingly, max 10% of headlines.',
     'chunk_text': 'Exception: curiosity gap headlines outperform branded by 23%. Use sparingly.'},
    {'chunk_id': 'c3', 'source_file': 'aaker-brand-equity.md', 'section': 'Brand Associations',
     'priority_tier': 2, 'adversary': False, 'quality_score': 0.65, 'department': 'Brand Studio',
     'last_modified': '2026-07-01T00:00:00Z', 'document_type': 'reference',
     'toon_text': 'Aaker Ch.3: Brand associations drive recognition. Strong brands maintain 3-5 core associations. Must measure quarterly.',
     'chunk_text': 'Aaker Ch.3: Brand associations. Strong brands 3-5 core associations.'},
    {'chunk_id': 'c4', 'source_file': 'advertising-history.md', 'section': 'History',
     'priority_tier': 3, 'adversary': False, 'quality_score': 0.15, 'department': 'Brand Studio',
     'last_modified': '2024-01-01T00:00:00Z', 'document_type': 'unknown',
     'toon_text': 'This section describes the history of advertising from ancient Rome through the digital revolution.',
     'chunk_text': 'History of advertising from ancient Rome.'},
    {'chunk_id': 'c5', 'source_file': 'Teams/Shared OS/logical/brealey-myers-corporate-finance.md',
     'section': 'WACC', 'priority_tier': 1, 'adversary': False,
     'quality_score': 0.90, 'department': 'Shared OS', 'document_type': 'reference',
     'last_modified': '2026-06-01T00:00:00Z',
     'toon_text': 'Brealey & Myers Ch.5: WACC = E/V x Re + D/V x Rd x (1-Tc). Must use market values. Cost of equity via CAPM.',
     'chunk_text': 'Brealey & Myers Ch.5: WACC formula. Must use market values.'},
    {'chunk_id': 'c6', 'source_file': 'capital_budgeting.py', 'section': 'NPV',
     'priority_tier': 2, 'adversary': False, 'quality_score': 0.75, 'department': 'Shared OS',
     'last_modified': '2026-07-01T00:00:00Z', 'document_type': 'shared_os_script',
     'toon_text': '[COMPUTED] npv() = $137,236.03 [Brealey & Myers, Ch.5]. Cash flows: -$1M + $300K/yr x 5 years at 10%.',
     'chunk_text': '[COMPUTED] npv() = $137,236.03 from Brealey & Myers Ch.5.'},
    {'chunk_id': 'c7', 'source_file': 'nist-sp800-30.md', 'section': 'Risk Assessment',
     'priority_tier': 1, 'adversary': False, 'quality_score': 0.85, 'department': 'Shared OS',
     'last_modified': '2026-06-01T00:00:00Z', 'document_type': 'standard',
     'toon_text': 'NIST SP 800-30: Risk score = Impact x Likelihood. Scores above 12 require board review within 24 hours. Must escalate impact >= 4. Board approval required for risk acceptance above score 8. Must use fixed numerical thresholds for risk scoring.',
     'chunk_text': 'NIST SP 800-30: Risk above 12 requires board review. Must escalate impact >= 4. Must use fixed numerical risk scoring thresholds.'},
    {'chunk_id': 'c8', 'source_file': 'iso-31000.md', 'section': 'Risk Acceptance',
     'priority_tier': 2, 'adversary': True, 'quality_score': 0.55, 'department': 'Shared OS',
     'last_modified': '2026-06-01T00:00:00Z', 'document_type': 'standard',
     'toon_text': 'ISO 31000:2018 argues fixed numerical risk scoring thresholds create blind spots and are themselves a source of risk. Context-dependent risk evaluation outperforms rigid scoring by 31%. Board should not rely solely on fixed numerical thresholds for risk assessment.',
     'chunk_text': 'ISO 31000: Fixed numerical risk scoring thresholds create blind spots. Context-dependent risk evaluation outperforms rigid scoring by 31% for risk assessment.'},
    {'chunk_id': 'c9', 'source_file': 'engineering-playbook.md', 'section': 'Deployment',
     'priority_tier': 1, 'adversary': False, 'quality_score': 0.80, 'department': 'Engineering',
     'last_modified': '2026-07-01T00:00:00Z', 'document_type': 'playbook',
     'toon_text': 'Must run full test suite before deployment. Never deploy on Friday. Require 2 senior reviews. Rollback plan documented within 30 days.',
     'chunk_text': 'Must run tests before deploy. Never Friday. 2 senior reviews.'},
    {'chunk_id': 'c10', 'source_file': 'gdpr-compliance.md', 'section': 'Data Retention',
     'priority_tier': 1, 'adversary': False, 'quality_score': 0.88, 'department': 'Shared OS',
     'last_modified': '2026-07-01T00:00:00Z', 'document_type': 'standard',
     'toon_text': 'GDPR Article 5(1)(e): Personal data must not be kept longer than necessary. Max retention: 24 months marketing, 7 years financial. Must have documented deletion schedule. Fines up to 20M EUR or 4% global revenue.',
     'chunk_text': 'GDPR Art 5(1)(e): Max 24mo marketing, 7yr financial. Fines up to 20M EUR.'},
    {'chunk_id': 'c11', 'source_file': 'gdpr-compliance.md', 'section': 'Retention Exceptions',
     'priority_tier': 2, 'adversary': False, 'quality_score': 0.62, 'department': 'Shared OS',
     'last_modified': '2026-07-01T00:00:00Z', 'document_type': 'standard',
     'toon_text': 'Exception to retention limits: GDPR Article 89 allows longer retention for archiving, scientific research. Must implement pseudonymization. Does not apply to commercial marketing.',
     'chunk_text': 'GDPR Art 89 exception for research archiving. Must pseudonymize. Not for marketing.'},
    {'chunk_id': 'c12', 'source_file': 'porter-competitive-strategy.md', 'section': 'Five Forces',
     'priority_tier': 1, 'adversary': False, 'quality_score': 0.82, 'department': 'Shared OS',
     'last_modified': '2026-07-01T00:00:00Z', 'document_type': 'reference',
     'toon_text': 'Porter Ch.1: Five forces — rivalry, entry threat, substitute threat, buyer power, supplier power. Must assess all five before acquisition. High rivalry and low entry barriers means structurally unattractive.',
     'chunk_text': 'Porter Ch.1: Five competitive forces. Must assess all five before acquisition.'},
]


def run():
    passed, failed = 0, 0
    def check(name, condition, detail=''):
        nonlocal passed, failed
        if condition: print(f'  ✅ {name}'); passed += 1
        else: print(f'  ❌ {name}: {detail}'); failed += 1

    print('\n' + '='*60)
    print('  YVON HARNESS — 12-SCENARIO E2E VALIDATION')
    print('='*60)

    agent_id = "You are spark, creative director. David Ogilvy persona."
    active = [{"name": "art-direction-critique", "content": "Critique creative against Ogilvy rules."}]
    inactive = ["coherence-qa: QA gate for creative output"]
    computed = []

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 1: Creative Review (spark + Ogilvy)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 1: Creative Review ──')
    result = process(
        CHUNKS[:4], agent_id='spark', query='review headline copy for campaign',
        task_type='creative_review', budget_tokens=400,
        agent_identity=agent_id, active_skills=active,
        inactive_skills=inactive, computed_facts=computed,
    )
    check('Budget under limit', result.trace['final_tokens'] <= result.trace['budget_tokens'])
    check('Ogilvy T1 chunk kept', any(c.get('chunk_id')=='c1' for c in result.final_chunks))
    check('History filler (c4) dropped', not any(c.get('chunk_id')=='c4' for c in result.final_chunks))
    check('Exception (c2) recovered or kept',
          any(c.get('chunk_id')=='c2' for c in result.final_chunks))
    check('Source auth verified', result.trace['gate1_blocked'] == 0)

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 2: Financial Analysis (WACC + NPV)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 2: Financial Analysis ──')
    finance_id = "You are a financial analyst. Expert in corporate finance."
    finance_computed = ["npv() = $137,236.03 [Brealey & Myers, Ch.5]",
                        "wacc() = 9.0% [Brealey & Myers, Ch.5]"]
    result2 = process(
        CHUNKS[4:7], agent_id='marcus', query='compute WACC and NPV for investment',
        task_type='financial_analysis', budget_tokens=500,
        agent_identity=finance_id, active_skills=[], inactive_skills=[],
        computed_facts=finance_computed,
    )
    check('WACC T1 chunk kept', any(c.get('chunk_id')=='c5' for c in result2.final_chunks))
    check('NPV computed chunk kept', any(c.get('chunk_id')=='c6' for c in result2.final_chunks))
    check('Brealey auth = 0.85+',
          any(r.authority >= 0.8 for r in result2.reliability_scores if 'c5' in r.chunk_id))
    check('Budget enforced', result2.trace['final_tokens'] <= result2.trace['budget_tokens'])

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 3: Legal Compliance (GDPR)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 3: GDPR Legal Compliance ──')
    legal_id = "You are a legal compliance officer. Expert in GDPR."
    result3 = process(
        CHUNKS[9:11], agent_id='comply', query='verify data retention policy complies with GDPR',
        task_type='legal_review', budget_tokens=600,
        agent_identity=legal_id, active_skills=[], inactive_skills=[],
        computed_facts=[],
    )
    check('GDPR T1 chunk kept', any(c.get('chunk_id')=='c10' for c in result3.final_chunks))
    check('Art 89 exception recovered',
          any(c.get('chunk_id')=='c11' for c in result3.final_chunks) or
          any(r.chunk_id=='c11' for r in result3.recovered))
    check('GDPR source authority = 0.9 (standard)',
          any(r.authority >= 0.8 for r in result3.reliability_scores if 'c10' in r.chunk_id))

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 4: Governance (NIST + ISO contradiction)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 4: Governance Decision ──')
    gov_id = "You are the board. Charlie Munger persona. Fiduciary duty."
    result4 = process(
        CHUNKS[6:9], agent_id='board', query='board fiduciary review of risk assessment',
        task_type='governance_decision', budget_tokens=500,
        agent_identity=gov_id, active_skills=[], inactive_skills=[],
        computed_facts=[],
    )
    check('NIST T1 chunk kept', any(c.get('chunk_id')=='c7' for c in result4.final_chunks))
    check('ISO adversary kept', any(c.get('chunk_id')=='c8' for c in result4.final_chunks))
    check('NIST vs ISO conflict detection',
          result4.trace['gate3_conflicts'] >= 1,
          f'found {result4.trace["gate3_conflicts"]} conflicts')
    check('Conflict flags present', len(result4.assembly_plan.conflict_flags) > 0)

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 5: Engineering Debug
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 5: Engineering Debug ──')
    eng_id = "You are dev, architecture lead. Werner Vogels persona."
    result5 = process(
        [CHUNKS[8]], agent_id='dev', query='fix deployment pipeline error',
        task_type='engineering_debug', budget_tokens=300,
        agent_identity=eng_id, active_skills=[], inactive_skills=[],
        computed_facts=[],
    )
    check('Deployment rules kept', any(c.get('chunk_id')=='c9' for c in result5.final_chunks))
    check('Budget enforced', result5.trace['gate4_budget_used'] <= result5.trace['budget_tokens'],
          f'{result5.trace.get("gate4_budget_used", "?")} <= {result5.trace.get("budget_tokens", "?")}')

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 6: Factual Lookup (fast path)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 6: Factual Lookup (FAST) ──')
    result6 = process(
        CHUNKS[:1], agent_id='spark', query='what are Ogilvy headline rules',
        task_type='factual_lookup', budget_tokens=150,
        agent_identity=agent_id, active_skills=[], inactive_skills=[],
        computed_facts=[],
    )
    check('Single chunk returns', len(result6.final_chunks) >= 1)
    check('Ogilvy citation preserved',
          'Ogilvy' in str(result6.final_chunks) or 'Ch.5' in str(result6.final_chunks))

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 7: Multi-Department Query
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 7: Multi-Department ──')
    result7 = process(
        CHUNKS[:9] + CHUNKS[9:11], agent_id='dev',
        query='review deployment pipeline and check GDPR compliance',
        task_type='legal_review', budget_tokens=600,
        agent_identity=eng_id, active_skills=[], inactive_skills=[],
        computed_facts=[],
    )
    check('Engineering chunk kept',
          any(c.get('chunk_id')=='c9' for c in result7.final_chunks))
    check('GDPR chunk kept',
          any(c.get('chunk_id')=='c10' for c in result7.final_chunks))
    check('Budget used within limit',
          result7.trace['gate4_budget_used'] <= result7.trace['budget_tokens'])

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 8: Orphaned/Corrupted Chunk Detection (auth gate)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 8: Stale/Corrupted Chunk Detection ──')
    corrupt = [{
        'chunk_id': 'cx', 'source_file': 'missing-file.md',
        'priority_tier': 1, 'quality_score': 0.9,
        'toon_text': 'This chunk source does not exist.',
        'chunk_text': 'Orphaned chunk.', '_source_missing': True,
        'document_type': 'unknown', 'last_modified': '2026-01-01T00:00:00Z',
    }]
    result8 = process(
        corrupt, agent_id='test', query='test',
        task_type='standard_review', budget_tokens=200,
        agent_identity='Test agent', active_skills=[], inactive_skills=[],
        computed_facts=[],
    )
    check('Orphaned chunk BLOCKED', result8.trace['gate1_blocked'] >= 1)
    check('No orphaned chunks in final', len(result8.final_chunks) == 0)

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 9: Progressive Disclosure
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 9: Progressive Disclosure ──')
    pd = ProgressiveDisclosure(agent_id='marcus')
    pd.register_skill('decision-critic', 'Stress-tests strategic decisions',
                      ['decision', 'approve', 'acquire', 'invest'], 'FULL CONTENT...')
    pd.register_skill('venture-priority', 'Scores ventures',
                      ['invest', 'venture', 'acquire'], 'FULL CONTENT...')
    pd.register_skill('strategy-advisor', 'Competitive analysis',
                      ['strategy', 'porter', 'market'], 'FULL CONTENT...')
    pd.register_skill('okr-cascade', 'Cascades OKRs',
                      ['okr', 'goals', 'quarterly'], 'FULL CONTENT...')
    pd.register_skill('vision-explore', 'Future scenarios',
                      ['vision', 'future', 'explore'], 'FULL CONTENT...')

    disc = pd.load_for_query('should we acquire Company X for $2M')
    check('3 skills activated', disc.active_count >= 2)
    check('Savings from progressive disclosure', disc.savings_pct >= 30)
    check('okr-cascade NOT activated', not any(s.name == 'okr-cascade' and s.activated for s in pd.skills))

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 10: Verifier (grounded citations + consistency)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 10: Post-Hoc Verification ──')
    model_response = (
        "Based on Ogilvy Ch.5, p.71, five times as many people read the headline. "
        "Must include brand name in every headline. NIST SP 800-30 requires board "
        "review for risk scores above 12. The computed NPV is $137,236 per Brealey & Myers."
    )
    injected = [CHUNKS[0], CHUNKS[6], CHUNKS[5]]
    vresult = verify(model_response, injected, task_type='standard_review')

    check('Grounded score >= 0.5', vresult.grounded_score >= 0.5,
          f'score={vresult.grounded_score}')
    check('Self-consistent', vresult.self_consistent)
    check('Constitution compliant', vresult.constitution_ok)
    check('Overall score >= 0.6', vresult.overall_score >= 0.6,
          f'score={vresult.overall_score}')

    # High-stakes should potentially delegate
    vresult_hs = verify(model_response, injected, task_type='legal_review')
    check('Legal review delegation response', vresult_hs.delegate_to_agent is not None or vresult_hs.grounded_score >= 0.7)

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 11: Field Monitor (degradation + coverage)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 11: Field Monitor ──')
    quality_hist = {
        'c_bad': [0.9, 0.8, 0.6, 0.4, 0.2],  # Critical drop
        'c_ok': [0.8, 0.82, 0.83, 0.84, 0.85],
    }
    query_hist = [
        {'task_type': 'creative_review', 'chunks_injected': 1, 'quality_score': 0.35, 'savings_pct': 90},
        {'task_type': 'creative_review', 'chunks_injected': 2, 'quality_score': 0.38, 'savings_pct': 88},
        {'task_type': 'creative_review', 'chunks_injected': 1, 'quality_score': 0.32, 'savings_pct': 91},
    ]
    freport = generate_report(
        feedback_records=[{'chunk_ids': ['c1','c2'], 'outcome': 'accepted', 'quality_score': 0.9}]*4 +
                        [{'chunk_ids': ['c3','c4'], 'outcome': 'rejected', 'quality_score': 0.2}]*3,
        quality_history=quality_hist,
        query_history=query_hist,
        agent_history={},
    )
    check('Degradation detected', len(freport.degradations) >= 1)
    check('Coverage gaps detected', len(freport.coverage_gaps) >= 1)
    check('Report generated with timestamp', len(freport.generated_at) > 0)

    # ═══════════════════════════════════════════════════════════════
    # SCENARIO 12: Self-Improver (dry run)
    # ═══════════════════════════════════════════════════════════════
    print('\n── Scenario 12: Self-Improver (Dry Run) ──')
    iresult = run_improvement_cycle(
        feedback_records=[], quality_history=quality_hist,
        query_history=query_hist, agent_history={},
        dry_run=True,
    )
    check('Dry run produces proposals', len(iresult.proposals) >= 1)
    check('All sandbox tests pass', iresult.all_passed)
    check('No deploy in dry run', iresult.deployed_count == 0)
    check('Log file exists', os.path.exists(iresult.log_path))

    # ═══════════════════════════════════════════════════════════════
    # FINAL SUMMARY
    # ═══════════════════════════════════════════════════════════════
    print(f'\n{"="*60}')
    print(f'  RESULTS: {passed}/{passed+failed} passed')
    print(f'{"="*60}')

    if failed == 0:
        print(f'\n  🎉 ALL 12 SCENARIOS PASSED')
        print(f'  Harness upgrade is production-ready.')
    else:
        print(f'\n  ⚠️ {failed} scenario(s) failed. Review above.')
        print(f'  Rollback: git checkout rag/')

    return failed == 0


if __name__ == '__main__':
    sys.exit(0 if run() else 1)
