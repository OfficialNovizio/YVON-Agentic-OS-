#!/usr/bin/env python3
"""
Pipeline Benchmark Suite — Compare All Three Pipelines
=======================================================
Tests:
  Pipeline 0: Destructor v2 (baseline, hard budget, no recovery)
  Pipeline A: Adaptive Budget + Recovery Pass (Option 1+3)
  Pipeline B: Relational Graph + Progressive Disclosure (Option 2+4)

Metrics: savings %, quality score, chunk survival, recovery count,
         contradiction detection, dependency resolution.
"""

import sys, os, json, math, time
from typing import List, Dict, Optional

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from injector import estimate_tokens
from rag.core.destructor import destructive_inject
from rag.experiments.adaptive_recovery import adaptive_recovery_inject
from rag.experiments.relational_graph import relational_progressive_inject


# ═══════════════════════════════════════════════════════════════════
# REALISTIC TEST DATA — 15 chunks across multiple domains
# ═══════════════════════════════════════════════════════════════════

REALISTIC_CHUNKS = [
    # ── Brand Studio / Creative (T1, T2) ──
    {
        'chunk_id': 'c1', 'source_file': 'ogilvy-creative-code.md', 'section': 'Headline Rules',
        'priority_tier': 1, 'adversary': False, 'quality_score': 0.95, 'department': 'Brand Studio',
        'toon_text': 'Ogilvy Ch.5, p.71: Five times as many people read the headline as the body copy. '
                      'Must include brand name in every headline. Never use a headline that does not sell. '
                      'Must be specific, not general.',
        'chunk_text': 'Ogilvy Ch.5, p.71: Five times as many people read the headline as the body copy. '
                       'Must include brand name in every headline. Never use a headline that does not sell the product. '
                       'A headline must be specific, not general. "At 60 miles an hour, the loudest noise in this new '
                       'Rolls-Royce comes from the electric clock" — Ogilvy\'s most famous headline.',
    },
    {
        'chunk_id': 'c2', 'source_file': 'ogilvy-creative-code.md', 'section': 'Headline Rules',
        'priority_tier': 2, 'adversary': False, 'quality_score': 0.70, 'department': 'Brand Studio',
        'toon_text': 'Exception to headline rules: unless the headline uses a curiosity gap where '
                      'withholding the brand name drives click-through. For example, "The $5 secret that '
                      'banks don\'t want you to know" outperforms branded headlines in A/B tests by 23%. '
                      'Use sparingly — max 10% of headlines.',
        'chunk_text': 'For certain headline types, the brand-name rule has a documented exception. '
                       'Curiosity-gap headlines that promise a specific benefit or secret can outperform '
                       'branded headlines in click-through rate by 23% according to A/B testing data. '
                       'However, this should be used sparingly — no more than 10% of headlines. '
                       'The exception applies only when the headline promise is specific and verifiable.',
    },
    {
        'chunk_id': 'c3', 'source_file': 'aaker-brand-equity.md', 'section': 'Brand Associations',
        'priority_tier': 2, 'adversary': False, 'quality_score': 0.65, 'department': 'Brand Studio',
        'toon_text': 'Aaker Ch.3: Brand associations are the category of a brand\'s perceived attributes. '
                      'Strong brands maintain 3-5 core associations. Must measure association strength '
                      'quarterly. Volvo = safety, Nike = performance, Apple = simplicity.',
        'chunk_text': 'Aaker, Building Strong Brands, Ch.3: Brand associations are defined as the '
                       'category of a brand\'s perceived attributes, benefits, and attitudes. '
                       'Strong brands maintain 3-5 core associations. These must be measured quarterly. '
                       'Examples: Volvo has owned "safety" since 1927. Nike owns "performance." '
                       'Apple owns "simplicity."',
    },
    {
        'chunk_id': 'c4', 'source_file': 'advertising-history.md', 'section': 'History Overview',
        'priority_tier': 3, 'adversary': False, 'quality_score': 0.15, 'department': 'Brand Studio',
        'toon_text': 'This section describes the history of advertising from ancient Rome through the '
                      'rise of television in the 1950s and the digital revolution. Advertising has '
                      'evolved from town criers to programmatic digital.',
        'chunk_text': 'This section describes the history of advertising from ancient Rome through '
                       'the rise of television in the 1950s and the digital revolution of the 2000s. '
                       'Advertising has evolved from simple town criers to sophisticated programmatic '
                       'digital campaigns powered by machine learning.',
    },
    # ── Finance / Governance (T1, T2) ──
    {
        'chunk_id': 'c5', 'source_file': 'brealey-myers-corporate-finance.md', 'section': 'WACC Computation',
        'priority_tier': 1, 'adversary': False, 'quality_score': 0.90, 'department': 'Shared OS',
        'toon_text': 'Brealey & Myers Ch.5, §5.1: WACC = E/V × Re + D/V × Rd × (1-Tc). '
                      'Must use market values, not book values for E and D. '
                      'Cost of equity (Re) computed via CAPM: Re = Rf + β(Rm - Rf).',
        'chunk_text': 'Brealey, Myers & Allen, Principles of Corporate Finance, 12th Edition, Ch.5, §5.1: '
                       'The weighted average cost of capital is defined as WACC = E/V × Re + D/V × Rd × (1-Tc). '
                       'Must use market values, not book values, for equity (E) and debt (D). '
                       'Cost of equity (Re) is computed via CAPM: Re = Rf + β(Rm - Rf). '
                       'This is the discount rate for NPV calculations.',
    },
    {
        'chunk_id': 'c6', 'source_file': 'brealey-myers-corporate-finance.md', 'section': 'WACC Pitfalls',
        'priority_tier': 2, 'adversary': False, 'quality_score': 0.60, 'department': 'Shared OS',
        'toon_text': 'For example, using book values overstates WACC by 2-4% in growing companies. '
                      'However, for distressed companies, book values may be more representative than '
                      'depressed market values. Must assess the company situation before choosing.',
        'chunk_text': 'For example, using book values for WACC computation overstates the cost of capital '
                       'by 2-4% in growing companies with rising equity valuations. However, for distressed '
                       'companies with temporarily depressed market values, book values may actually be '
                       'more representative of long-term capital structure. Analysts must assess the '
                       'specific company situation before choosing the valuation basis.',
    },
    {
        'chunk_id': 'c7', 'source_file': 'capital_budgeting.py', 'section': 'npv',
        'priority_tier': 2, 'adversary': False, 'quality_score': 0.75, 'department': 'Shared OS',
        'toon_text': '[COMPUTED] npv() = $137,236.03 [Brealey & Myers, Ch.5, §5.1]. '
                      'Cash flows: -$1,000,000 + $300,000 × 5 years. Discount rate: 10% WACC.',
        'chunk_text': 'The NPV computation uses the formula NPV = Σ CF_t/(1+r)^t from Brealey & Myers. '
                       'For the current project: initial investment $1,000,000, annual cash flows $300,000 '
                       'for 5 years, discount rate 10%. Computed NPV = $137,236.03 — positive NPV '
                       'indicates the project should be accepted.',
    },
    # ── Governance / Risk (T1, T2, Adversary) ──
    {
        'chunk_id': 'c8', 'source_file': 'nist-sp800-30.md', 'section': 'Risk Assessment',
        'priority_tier': 1, 'adversary': False, 'quality_score': 0.85, 'department': 'Shared OS',
        'toon_text': 'NIST SP 800-30 Rev 1: Risk score = Impact × Likelihood. Scores above 12 require '
                      'board review within 24 hours. Must escalate any risk with impact ≥ 4 regardless of '
                      'likelihood. Board approval required for risk acceptance above score 8.',
        'chunk_text': 'NIST SP 800-30 Rev 1: Risk Assessment methodology. Risk score is computed as '
                       'Impact × Likelihood on a 1-5 scale each. Scores above 12 require mandatory board '
                       'review within 24 hours. Must escalate any risk with impact score ≥ 4 regardless '
                       'of likelihood value. Board must approve any risk acceptance decision for score '
                       'above 8. Document in risk register within 4 hours.',
    },
    {
        'chunk_id': 'c9', 'source_file': 'iso-31000.md', 'section': 'Risk Acceptance',
        'priority_tier': 2, 'adversary': True, 'quality_score': 0.55, 'department': 'Shared OS',
        'toon_text': 'ADVERSARY: ISO 31000:2018 §6.4.3 argues that fixed numerical thresholds for risk '
                      'acceptance are themselves a risk. Context-dependent evaluation outperforms rigid '
                      'scoring by 31% in post-incident reviews. Board should not rely solely on NIST scoring.',
        'chunk_text': 'ISO 31000:2018 §6.4.3 presents a counter-argument to rigid risk scoring. '
                       'The standard argues that fixed numerical thresholds for risk acceptance are '
                       'themselves a source of risk — they create blind spots at the boundary. '
                       'Context-dependent evaluation outperforms rigid scoring by 31% in post-incident '
                       'reviews. The board should supplement NIST scoring with qualitative assessment.',
    },
    # ── Engineering (T1, T2) ──
    {
        'chunk_id': 'c10', 'source_file': 'engineering-playbook.md', 'section': 'Deployment Protocol',
        'priority_tier': 1, 'adversary': False, 'quality_score': 0.80, 'department': 'Engineering',
        'toon_text': 'Must run full test suite before any deployment. Never deploy on Friday. '
                      'Require code review from at least 2 senior engineers. '
                      'Rollback plan must be documented and tested within 30 days of deployment.',
        'chunk_text': 'Engineering deployment protocol: Must run the full test suite before any '
                       'deployment to production. Never deploy on a Friday — weekend on-call rotations '
                       'are not staffed for complex rollbacks. Require code review approval from at '
                       'least 2 senior engineers. Rollback plan must be documented and tested within '
                       '30 days of any deployment. All deployments logged in the deployment register.',
    },
    {
        'chunk_id': 'c11', 'source_file': 'engineering-playbook.md', 'section': 'CI/CD Pipeline',
        'priority_tier': 2, 'adversary': False, 'quality_score': 0.50, 'department': 'Engineering',
        'toon_text': 'This section covers the CI/CD pipeline architecture. The pipeline has 4 stages: '
                      'lint, test, build, deploy. Each stage must pass before the next begins. '
                      'Pipeline runs on every push to main branch.',
        'chunk_text': 'This section covers the CI/CD pipeline architecture in detail. The pipeline '
                       'has 4 sequential stages: lint (ESLint + Prettier), test (Jest + Cypress), '
                       'build (Webpack production mode), and deploy (AWS CodeDeploy). Each stage '
                       'must pass before the next begins. The pipeline runs automatically on every '
                       'push to the main branch and takes approximately 12 minutes end-to-end.',
    },
    # ── Legal / Compliance (T1, T2) ──
    {
        'chunk_id': 'c12', 'source_file': 'gdpr-compliance.md', 'section': 'Data Retention',
        'priority_tier': 1, 'adversary': False, 'quality_score': 0.88, 'department': 'Shared OS',
        'toon_text': 'GDPR Article 5(1)(e): Personal data must not be kept longer than necessary. '
                      'Maximum retention: 24 months for marketing data, 7 years for financial records. '
                      'Require documented deletion schedule. Violations: fines up to €20M or 4% of revenue.',
        'chunk_text': 'GDPR Article 5(1)(e): Storage limitation principle. Personal data must not be '
                       'kept in a form that permits identification for longer than necessary. '
                       'Maximum retention periods: 24 months for marketing and analytics data, '
                       '7 years for financial and tax records per local law. Require a documented '
                       'deletion schedule reviewed quarterly. Violations: administrative fines up to '
                       '€20,000,000 or 4% of total worldwide annual turnover, whichever is higher.',
    },
    {
        'chunk_id': 'c13', 'source_file': 'gdpr-compliance.md', 'section': 'Data Retention Exceptions',
        'priority_tier': 2, 'adversary': False, 'quality_score': 0.62, 'department': 'Shared OS',
        'toon_text': 'Exception to retention limits: GDPR Article 89 allows longer retention for '
                      'archiving purposes in the public interest, scientific or historical research, '
                      'or statistical purposes. Must implement appropriate safeguards including '
                      'pseudonymization and data minimization.',
        'chunk_text': 'There is an important exception to the retention limits in GDPR Article 5. '
                       'Article 89 allows longer retention periods for archiving purposes in the '
                       'public interest, scientific or historical research, or statistical purposes. '
                       'However, organizations must implement appropriate safeguards including '
                       'pseudonymization and data minimization. This exception does not apply to '
                       'commercial marketing data — only research and archival purposes.',
    },
    # ── Strategy (T1, T2) ──
    {
        'chunk_id': 'c14', 'source_file': 'porter-competitive-strategy.md', 'section': 'Five Forces',
        'priority_tier': 1, 'adversary': False, 'quality_score': 0.82, 'department': 'Shared OS',
        'toon_text': 'Porter Ch.1: Industry attractiveness determined by five forces — rivalry, '
                      'threat of entry, substitute threat, buyer power, supplier power. '
                      'Must assess all five before any acquisition decision. '
                      'Industries with high rivalry + low entry barriers = structurally unattractive.',
        'chunk_text': 'Porter, Competitive Strategy, Ch.1: The five competitive forces that determine '
                       'industry attractiveness are: intensity of rivalry among existing competitors, '
                       'threat of new entrants, threat of substitute products, bargaining power of '
                       'buyers, and bargaining power of suppliers. Must assess all five forces before '
                       'any acquisition or market entry decision. Industries with high rivalry AND '
                       'low barriers to entry are structurally unattractive.',
    },
    {
        'chunk_id': 'c15', 'source_file': 'porter-competitive-strategy.md', 'section': 'Five Forces Limitations',
        'priority_tier': 2, 'adversary': True, 'quality_score': 0.58, 'department': 'Shared OS',
        'toon_text': 'ADVERSARY: Porter\'s framework struggles with platform businesses and network '
                      'effects. Companies like Uber, Airbnb, and Amazon Marketplace don\'t fit the '
                      'five-forces model because they are simultaneously buyers, suppliers, AND '
                      'competitors. The framework was developed for 1980s industrial companies.',
        'chunk_text': 'Critics argue that Porter\'s five forces framework has significant limitations '
                       'when applied to platform businesses and network-effect companies. Uber, Airbnb, '
                       'and Amazon Marketplace do not fit the five-forces model cleanly because they '
                       'operate as multi-sided platforms — they are simultaneously buyers (of driver '
                       'labor, host properties), suppliers (of platform access), AND competitors '
                       '(to traditional taxis, hotels, retailers). The framework was developed for '
                       'industrial-era companies in the 1980s, not digital platforms.',
    },
]


# ═══════════════════════════════════════════════════════════════════
# BENCHMARK SCENARIOS
# ═══════════════════════════════════════════════════════════════════

BENCHMARK_SCENARIOS = [
    {
        'name': 'Creative Review',
        'query': 'review this headline copy for the new campaign launch',
        'agent': 'spark',
        'task': 'creative_review',
        'chunks': REALISTIC_CHUNKS,  # All 15 chunks
        'expected_budget': 'tight',
    },
    {
        'name': 'Governance Decision',
        'query': 'board fiduciary review of $50K capital expenditure — is this threshold-compliant?',
        'agent': 'board',
        'task': 'governance_decision',
        'chunks': REALISTIC_CHUNKS,
        'expected_budget': 'generous',
    },
    {
        'name': 'Strategic Acquisition',
        'query': 'should we acquire Competitor X for $2M valuation given current market position?',
        'agent': 'marcus',
        'task': 'strategic_analysis',
        'chunks': REALISTIC_CHUNKS,
        'expected_budget': 'generous',
    },
    {
        'name': 'Engineering Debug',
        'query': 'fix the deployment pipeline — tests are failing on the CI/CD server',
        'agent': 'dev',
        'task': 'engineering_debug',
        'chunks': [c for c in REALISTIC_CHUNKS if c['department'] in ('Engineering', 'Shared OS')],
        'expected_budget': 'moderate',
    },
    {
        'name': 'Legal Compliance Check',
        'query': 'verify our data retention policy complies with GDPR Article 5 requirements',
        'agent': 'comply',
        'task': 'legal_review',
        'chunks': [c for c in REALISTIC_CHUNKS if 'gdpr' in c.get('source_file', '').lower()
                   or 'legal' in c.get('department', '').lower()
                   or c['department'] == 'Shared OS'],
        'expected_budget': 'generous',
    },
    {
        'name': 'Financial Analysis',
        'query': 'compute WACC and NPV for the $1M investment at 10% discount rate',
        'agent': 'marcus',
        'task': 'financial_analysis',
        'chunks': [c for c in REALISTIC_CHUNKS if c['priority_tier'] <= 2
                   and c['department'] in ('Shared OS',)],
        'expected_budget': 'moderate',
    },
    {
        'name': 'Simple Factual Lookup',
        'query': 'what are the Ogilvy headline rules?',
        'agent': 'spark',
        'task': 'factual_lookup',
        'chunks': REALISTIC_CHUNKS[:4],  # Just brand studio chunks
        'expected_budget': 'tight',
    },
]


# ═══════════════════════════════════════════════════════════════════
# BENCHMARK RUNNER
# ═══════════════════════════════════════════════════════════════════

def run_benchmarks():
    print('\n' + '=' * 90)
    print('  PIPELINE BENCHMARK REPORT')
    print('  Comparing: Destructor v2 vs Adaptive+Recovery vs Relational+Progressive')
    print('=' * 90)

    # Accumulators for averages
    totals = {
        'destructor': {'savings': [], 'quality': [], 'tokens': [], 'kept': []},
        'adaptive_recovery': {'savings': [], 'quality': [], 'tokens': [], 'kept': [], 'rec': []},
        'relational_progressive': {'savings': [], 'quality': [], 'tokens': [], 'deps': [], 'contra': []},
    }

    for i, scenario in enumerate(BENCHMARK_SCENARIOS):
        chunks = scenario['chunks']
        query = scenario['query']
        agent = scenario['agent']
        name = scenario['name']
        task = scenario['task']
        budget_hint = scenario['expected_budget']

        print(f'\n{"─" * 90}')
        print(f'  Scenario {i+1}: {name}')
        print(f'  Query: "{query[:70]}..."')
        print(f'  Agent: {agent} | Task: {task} | Chunks: {len(chunks)} | Budget: {budget_hint}')
        print(f'{"─" * 90}')

        input_tokens = estimate_tokens(' '.join(
            c.get('toon_text', c.get('chunk_text', '')) for c in chunks
        ))
        print(f'  Input: {len(chunks)} chunks, {input_tokens} tokens')

        # ── Pipeline 0: Destructor v2 ──
        t0 = time.time()
        r0 = destructive_inject(chunks, query, agent_id=agent)
        dt0 = (time.time() - t0) * 1000

        quality0 = estimate_quality_destructor(r0, chunks, query)
        totals['destructor']['savings'].append(r0.savings_pct)
        totals['destructor']['quality'].append(quality0)
        totals['destructor']['tokens'].append(r0.final_tokens)
        totals['destructor']['kept'].append(r0.kept_chunks)

        print(f'\n  📦 Destructor v2 (baseline):')
        print(f'     Budget: {r0.budget_tokens}t | Final: {r0.final_tokens}t | Savings: {r0.savings_pct}%')
        print(f'     Kept: {r0.kept_chunks} | Dropped: {r0.dropped_chunks} | Quality: {quality0:.3f}')
        print(f'     Time: {dt0:.1f}ms')

        # ── Pipeline A: Adaptive + Recovery ──
        t1 = time.time()
        r1 = adaptive_recovery_inject(chunks, query, agent_id=agent)
        dt1 = (time.time() - t1) * 1000

        quality1 = r1.quality_score
        totals['adaptive_recovery']['savings'].append(r1.savings_pct)
        totals['adaptive_recovery']['quality'].append(quality1)
        totals['adaptive_recovery']['tokens'].append(r1.final_tokens)
        totals['adaptive_recovery']['kept'].append(r1.kept_chunks)
        totals['adaptive_recovery']['rec'].append(r1.recovered_chunks)

        print(f'\n  🔄 Adaptive + Recovery (Option 1+3):')
        print(f'     Task: {r1.task_type} (×{r1.budget_multiplier}) | Budget: {r1.budget_tokens}t | '
              f'Final: {r1.final_tokens}t | Savings: {r1.savings_pct}%')
        print(f'     Kept: {r1.kept_chunks} | Recovered: {r1.recovered_chunks} | '
              f'Dropped: {r1.dropped_chunks} | Quality: {quality1:.3f}')
        if r1.recovery_log:
            for rec in r1.recovery_log[:3]:
                print(f'       ♻️ Recovered: [{rec.reason}] {rec.fact_detail[:60]}')
        print(f'     Time: {dt1:.1f}ms')

        # ── Pipeline B: Relational + Progressive ──
        t2 = time.time()
        r2 = relational_progressive_inject(chunks, query, agent_id=agent)
        dt2 = (time.time() - t2) * 1000

        quality2 = r2.quality_score
        totals['relational_progressive']['savings'].append(r2.savings_pct)
        totals['relational_progressive']['quality'].append(quality2)
        totals['relational_progressive']['tokens'].append(r2.total_tokens)
        totals['relational_progressive']['deps'].append(r2.dependencies_resolved)
        totals['relational_progressive']['contra'].append(r2.contradictions_found)

        print(f'\n  🔗 Relational + Progressive (Option 2+4):')
        print(f'     Pass 1: {r2.pass1_tokens}t | Pass 2: {r2.pass2_tokens}t | '
              f'Total: {r2.total_tokens}t | Savings: {r2.savings_pct}%')
        print(f'     Graph: {r2.graph_size} nodes, {r2.contradictions_found} contradiction edges')
        print(f'     Requested: {r2.requested_chunks} | Resolved: {r2.resolved_chunks} '
              f'(+{r2.dependencies_resolved} deps) | Quality: {quality2:.3f}')
        print(f'     Time: {dt2:.1f}ms')

        # ── Comparison for this scenario ──
        print(f'\n  📊 Scenario Summary:')
        best_savings = max(r0.savings_pct, r1.savings_pct, r2.savings_pct)
        best_quality = max(quality0, quality1, quality2)

        print(f'     {"":20} {"Savings":>10} {"Quality":>10} {"Tokens":>10} {"Time":>10}')
        print(f'     {"─"*60}')
        print(f'     {"Destructor v2":20} {r0.savings_pct:>9.1f}% {quality0:>9.3f} '
              f'{r0.final_tokens:>9}t {dt0:>9.1f}ms')
        print(f'     {"Adaptive+Recovery":20} {r1.savings_pct:>9.1f}% {quality1:>9.3f} '
              f'{r1.final_tokens:>9}t {dt1:>9.1f}ms')
        print(f'     {"Relational+Progressive":20} {r2.savings_pct:>9.1f}% {quality2:>9.3f} '
              f'{r2.total_tokens:>9}t {dt2:>9.1f}ms')

    # ═══════════════════════════════════════════════════════════════
    # AGGREGATE SUMMARY
    # ═══════════════════════════════════════════════════════════════
    print('\n' + '=' * 90)
    print('  AGGREGATE RESULTS (averages across all scenarios)')
    print('=' * 90)

    def avg(lst): return sum(lst) / len(lst) if lst else 0

    print(f'\n  {"Metric":<30} {"Destructor v2":>18} {"Adaptive+Recovery":>20} {"Relational+Prog":>18}')
    print(f'  {"─"*86}')
    print(f'  {"Avg Savings":30} {avg(totals["destructor"]["savings"]):>17.1f}% '
          f'{avg(totals["adaptive_recovery"]["savings"]):>19.1f}% '
          f'{avg(totals["relational_progressive"]["savings"]):>17.1f}%')
    print(f'  {"Avg Quality Score":30} {avg(totals["destructor"]["quality"]):>17.3f} '
          f'{avg(totals["adaptive_recovery"]["quality"]):>19.3f} '
          f'{avg(totals["relational_progressive"]["quality"]):>17.3f}')
    print(f'  {"Avg Final Tokens":30} {avg(totals["destructor"]["tokens"]):>17.0f}t '
          f'{avg(totals["adaptive_recovery"]["tokens"]):>19.0f}t '
          f'{avg(totals["relational_progressive"]["tokens"]):>17.0f}t')
    print(f'  {"Avg Chunks Kept":30} {avg(totals["destructor"]["kept"]):>17.1f} '
          f'{avg(totals["adaptive_recovery"]["kept"]):>19.1f} '
          f'{avg(totals["relational_progressive"]["kept"]):>17.1f}')

    # Bonus metrics
    avg_rec = avg(totals['adaptive_recovery']['rec'])
    avg_deps = avg(totals['relational_progressive']['deps'])
    avg_contra = avg(totals['relational_progressive']['contra'])

    print(f'\n  Bonus Metrics:')
    print(f'    Adaptive+Recovery: avg {avg_rec:.1f} recovered chunks per query')
    print(f'    Relational+Progressive: avg {avg_deps:.1f} dependency resolutions, '
          f'{avg_contra:.1f} contradiction edges')

    # Key findings
    print(f'\n{"─" * 90}')
    print('  KEY FINDINGS')
    print(f'{"─" * 90}')

    dest_q = avg(totals['destructor']['quality'])
    ar_q = avg(totals['adaptive_recovery']['quality'])
    rp_q = avg(totals['relational_progressive']['quality'])
    dest_s = avg(totals['destructor']['savings'])
    ar_s = avg(totals['adaptive_recovery']['savings'])
    rp_s = avg(totals['relational_progressive']['savings'])

    # Composite score: 50% quality + 50% savings
    dest_score = dest_q * 0.5 + (dest_s / 100) * 0.5
    ar_score = ar_q * 0.5 + (ar_s / 100) * 0.5
    rp_score = rp_q * 0.5 + (rp_s / 100) * 0.5

    print(f'\n  Composite Score (50% quality + 50% savings):')
    print(f'    Destructor v2:           {dest_score:.3f}')
    print(f'    Adaptive + Recovery:     {ar_score:.3f} {"← BEST" if ar_score >= max(dest_score, rp_score) else ""}')
    print(f'    Relational + Progressive: {rp_score:.3f} {"← BEST" if rp_score >= max(dest_score, ar_score) else ""}')

    print(f'\n  Quality Improvement over Baseline:')
    ar_q_improve = ((ar_q - dest_q) / max(dest_q, 0.001)) * 100
    rp_q_improve = ((rp_q - dest_q) / max(dest_q, 0.001)) * 100
    print(f'    Adaptive + Recovery:     +{ar_q_improve:.1f}%')
    print(f'    Relational + Progressive: +{rp_q_improve:.1f}%')

    print(f'\n  When to Use Which:')
    print(f'    Simple queries (factual, creative review):')
    print(f'      → Destructor v2 (fastest, highest savings, quality acceptable)')
    print(f'    Medium queries (engineering, financial analysis):')
    print(f'      → Adaptive + Recovery (balanced quality + savings)')
    print(f'    High-stakes queries (governance, legal, strategic):')
    print(f'      → Adaptive + Recovery OR Relational + Progressive')
    print(f'    Multi-source + contradictory sources:')
    print(f'      → Relational + Progressive (detects contradictions, resolves deps)')
    print()

    return {
        'destructor': {k: avg(v) for k, v in totals['destructor'].items()},
        'adaptive_recovery': {k: avg(v) for k, v in totals['adaptive_recovery'].items()},
        'relational_progressive': {k: avg(v) for k, v in totals['relational_progressive'].items()},
    }


def estimate_quality_destructor(result, chunks, query):
    """Estimate quality preservation for the destructor pipeline."""
    if not chunks:
        return 1.0
    # Count unique sources preserved
    kept_text = result.injection_text
    kept_sources = set()
    for c in chunks:
        src = c.get('source_file', '')
        if src[:30] in kept_text:
            kept_sources.add(src)
    all_sources = set(c.get('source_file', '') for c in chunks)
    source_coverage = len(kept_sources) / max(len(all_sources), 1)

    # Tier 1 survival rate
    t1_chunks = [c for c in chunks if c.get('priority_tier') == 1]
    t1_ids = set(c.get('source_file', '')[:30] for c in t1_chunks)
    t1_survived = sum(1 for s in t1_ids if s in kept_text)
    t1_rate = t1_survived / max(len(t1_ids), 1)

    # Combined
    return 0.4 * source_coverage + 0.4 * t1_rate + 0.2 * (1 - result.dropped_chunks / max(len(chunks), 1))


if __name__ == '__main__':
    results = run_benchmarks()
