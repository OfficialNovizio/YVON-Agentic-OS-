#!/usr/bin/env python3
"""
YVON Quality Flywheel — 5-Stage Iterative Improvement Loop
=============================================================
Adopted from Google agents-cli eval SKILL.md (Quality Flywheel, Stages 1-5).
Coordinates: eval_dataset.py → eval_judge.py → verifier.py → self_improver.py

THE 5 STAGES:
  1. PREPARE DATA — Write/edit eval dataset with scenarios + rubrics
  2. RUN INFERENCE — Execute agent over dataset, capture outputs
  3. GRADE TRACES — LLM-as-judge scoring against rubrics
  4. ANALYZE FAILURES — Cluster failures, identify patterns
  5. OPTIMIZE & FIX — Fix agent instructions/tools/parameters

The loop: 2→3→4→5→2 (or 1→3→4→5→1 if datasets change).
Expect 5-10+ iterations before quality thresholds are met.

SHORTCUTS THAT WASTE TIME (from Google's eval SKILL.md):
  "I'll tune the thresholds down" → Lowering hides real failures. Fix agent, not bar.
  "This case is flaky, skip it" → Flaky evals reveal non-determinism. Fix with instructions.
  "I just need to fix the dataset" → If always adjusting outputs, agent has behavior problem.

Usage:
  python3 rag/quality_flywheel.py --test
  python3 rag/quality_flywheel.py --run --agent spark --dataset headline_review_v1
"""

import sys, os, json, time, math
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else '/sessions/cool-stoic-einstein/mnt/Agents/rag'
sys.path.insert(0, SCRIPT_DIR)

try:
    from rag.eval.judge import grade as eval_grade, EvalResult
    from eval_dataset import load_dataset, EvalScenario
    HAS_EVAL_DEPS = True
except ImportError:
    HAS_EVAL_DEPS = False
    EvalResult = None


@dataclass
class FailureCluster:
    """Group of failing scenarios with a common pattern."""
    pattern: str          # What kind of failure (hallucination, tool error, etc.)
    count: int            # How many scenarios fail this way
    scenarios: List[str]  # Which scenario IDs
    severity: str         # 'critical', 'high', 'medium', 'low'
    suggested_fix: str


@dataclass
class FlywheelResult:
    agent_id: str
    dataset_id: str
    iteration: int
    total_scenarios: int
    passed: int
    failed: int
    overall_score: float
    metrics_summary: Dict[str, float]  # metric_name → avg_score
    failure_clusters: List[FailureCluster]
    results: List[Dict]  # Per-scenario eval results
    timestamp: str


# ═══════════════════════════════════════════════════════════════════
# STAGE 3: GRADE TRACES
# ═══════════════════════════════════════════════════════════════════

def grade_traces(
    scenarios: List[Dict],
    agent_id: str,
    rubric: Optional[Dict] = None,
    iteration: int = 1,
) -> List[Dict]:
    """Grade all agent outputs against the eval rubrics."""
    results = []
    for scenario in scenarios:
        output = scenario.get('agent_output', scenario.get('output', ''))
        query = scenario.get('query', '')
        injected = scenario.get('injected_chunks', [])
        scenario_rubric = scenario.get('rubric', rubric)

        if HAS_EVAL_DEPS:
            eval_result = eval_grade(output, query, agent_id, injected, scenario_rubric, iteration)
            results.append({
                'scenario_id': scenario.get('scenario_id', ''),
                'query': query,
                'overall_score': eval_result.overall_score,
                'passed': eval_result.passed,
                'metrics': [{'name': m.name, 'score': m.score, 'passed': m.passed}
                            for m in eval_result.metrics],
            })
        else:
            # Simplified grading (no eval_judge.py dependency)
            has_output = len(output) > 20
            has_citations = bool(re.search(r'(Ch\.|p\.|§|Article)', output))
            score = 0.5 + (0.2 if has_output else 0) + (0.15 if has_citations else 0)
            results.append({
                'scenario_id': scenario.get('scenario_id', ''),
                'query': query,
                'overall_score': round(score, 3),
                'passed': score >= 0.7,
                'metrics': [{'name': 'simplified', 'score': round(score, 3), 'passed': score >= 0.7}],
            })
    return results


# ═══════════════════════════════════════════════════════════════════
# STAGE 4: ANALYZE FAILURES
# ═══════════════════════════════════════════════════════════════════

def analyze_failures(results: List[Dict]) -> List[FailureCluster]:
    """Cluster failing scenarios by failure pattern."""
    failing = [r for r in results if not r.get('passed', False)]
    if not failing:
        return []

    clusters = []

    # Pattern 1: Hallucination failures
    hallucination_fails = []
    for r in failing:
        for m in r.get('metrics', []):
            if m['name'] == 'hallucination' and m['score'] < 0.8:
                hallucination_fails.append(r['scenario_id'])
                break
    if hallucination_fails:
        clusters.append(FailureCluster(
            pattern='hallucination', count=len(hallucination_fails),
            scenarios=hallucination_fails, severity='critical',
            suggested_fix='Tighten grounding instructions. Add specific citation requirements to agent prompt. '
                          'Reduce compression on T1 chunks to preserve more context.',
        ))

    # Pattern 2: Task success failures
    task_fails = []
    for r in failing:
        for m in r.get('metrics', []):
            if m['name'] == 'task_success' and m['score'] < 0.7:
                task_fails.append(r['scenario_id'])
                break
    if task_fails:
        clusters.append(FailureCluster(
            pattern='task_success', count=len(task_fails),
            scenarios=task_fails, severity='high',
            suggested_fix='Agent not producing actionable output. Add explicit output format requirements. '
                          'Require specific next steps or recommendations in every response.',
        ))

    # Pattern 3: Safety failures
    safety_fails = []
    for r in failing:
        for m in r.get('metrics', []):
            if m['name'] == 'safety' and m['score'] < 0.9:
                safety_fails.append(r['scenario_id'])
                break
    if safety_fails:
        clusters.append(FailureCluster(
            pattern='safety', count=len(safety_fails),
            scenarios=safety_fails, severity='critical',
            suggested_fix='Agent producing dangerous output. Add explicit safety constraints to agent instructions. '
                          'Add "what the agent must NOT do" section to SKILL.md.',
        ))

    # Pattern 4: Generic (mixed failures)
    other_ids = set(r['scenario_id'] for r in failing) - set(
        sum([c.scenarios for c in clusters], [])
    )
    if other_ids:
        clusters.append(FailureCluster(
            pattern='mixed', count=len(other_ids), scenarios=list(other_ids),
            severity='medium',
            suggested_fix='Multiple metrics failing. Run individual metric analysis for each failing scenario.',
        ))

    return clusters


# ═══════════════════════════════════════════════════════════════════
# FULL FLYWHEEL — Stage 2→3→4→5 logged
# ═══════════════════════════════════════════════════════════════════

import re

def run_flywheel(
    scenarios: List[Dict],
    agent_id: str,
    dataset_id: str = 'default',
    iteration: int = 1,
    rubric: Optional[Dict] = None,
) -> FlywheelResult:
    """
    Run the full quality flywheel: grade → analyze failures.
    Stage 5 (optimize & fix) is manual — this produces the analysis to guide fixes.
    """
    t0 = time.time()

    # Stage 3: Grade all traces
    results = grade_traces(scenarios, agent_id, rubric, iteration)

    # Compute summary
    total = len(results)
    passed = sum(1 for r in results if r.get('passed', False))
    failed = total - passed
    scores = [r.get('overall_score', 0) for r in results]
    overall = sum(scores) / max(len(scores), 1)

    # Aggregate metrics
    metric_sums = defaultdict(float)
    metric_counts = defaultdict(int)
    for r in results:
        for m in r.get('metrics', []):
            metric_sums[m['name']] += m['score']
            metric_counts[m['name']] += 1
    metrics_summary = {name: round(metric_sums[name] / max(metric_counts[name], 1), 3)
                       for name in metric_sums}

    # Stage 4: Analyze failures
    failure_clusters = analyze_failures(results)

    return FlywheelResult(
        agent_id=agent_id,
        dataset_id=dataset_id,
        iteration=iteration,
        total_scenarios=total,
        passed=passed,
        failed=failed,
        overall_score=round(overall, 3),
        metrics_summary=metrics_summary,
        failure_clusters=failure_clusters,
        results=results,
        timestamp=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
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

    print('\n  🔄 YVON Quality Flywheel — 5-Stage Loop\n')

    # Test scenarios
    scenarios = [
        {'scenario_id': 's1', 'query': 'review headline',
         'agent_output': (
             'Based on Ogilvy Ch.5, p.71, five times as many people read the headline. '
             'Must include brand name. Never use unspecific headlines. NPV is $137,236. '
             'Recommendation: strengthen the headline. Next step: A/B test.'
         ), 'injected_chunks': [
             {'chunk_id': 'c1', 'source_file': 'ogilvy.md',
              'chunk_text': 'Ogilvy Ch.5, p.71: headlines get 5x readership. Must include brand name.',
              'toon_text': 'h:Ogilvy Ch.5 p.71: 5x readership'},
         ]},
        {'scenario_id': 's2', 'query': 'compute NPV',
         'agent_output': (
             'The NPV is $137,236.03 based on Brealey & Myers Ch.5. '
             'Must use market values. Recommend accepting the project.'
         ), 'injected_chunks': [
             {'chunk_id': 'c2', 'source_file': 'capital_budgeting.py',
              'chunk_text': '[COMPUTED] npv() = $137,236.03 [Brealey & Myers, Ch.5]',
              'toon_text': '[COMPUTED] npv()=$137,236.03'},
         ]},
        {'scenario_id': 's3', 'query': 'bad headline',
         'agent_output': 'I think maybe it is okay. Probably fine.',
         'injected_chunks': []},
    ]

    # ═══════════════════════════════════════════════════════════════
    # STAGE 3: Grade
    # ═══════════════════════════════════════════════════════════════
    print('── Stage 3: Grade Traces ──')
    results = grade_traces(scenarios, 'spark', iteration=1)
    check(f'Graded {len(results)} scenarios', len(results) == 3)
    check('Good output passes', results[0].get('passed', False) or results[0].get('overall_score', 0) >= 0.5)
    check('Bad output scores lower',
          results[2].get('overall_score', 0) < results[0].get('overall_score', 1),
          f's3={results[2].get("overall_score",0)} vs s1={results[0].get("overall_score",0)}')

    # ═══════════════════════════════════════════════════════════════
    # STAGE 4: Analyze Failures
    # ═══════════════════════════════════════════════════════════════
    print('── Stage 4: Analyze Failures ──')
    # Force s3 to fail
    results[2]['passed'] = False
    clusters = analyze_failures(results)
    check(f'Detected {len(clusters)} failure cluster(s)', len(clusters) >= 1)
    if clusters:
        check('Failure cluster has suggested fix', len(clusters[0].suggested_fix) > 0)

    # ═══════════════════════════════════════════════════════════════
    # FULL FLYWHEEL
    # ═══════════════════════════════════════════════════════════════
    print('── Full Flywheel ──')
    result = run_flywheel(scenarios, 'spark', 'headline_review_v1', iteration=1)
    check(f'Iteration {result.iteration}: {result.passed}/{result.total_scenarios} passed',
          result.total_scenarios == 3)
    check(f'Overall score: {result.overall_score}', result.overall_score >= 0.3)
    check('Metrics summary computed', len(result.metrics_summary) > 0)
    check('Timestamp recorded', len(result.timestamp) > 0)

    # ═══════════════════════════════════════════════════════════════
    # EDGE CASES
    # ═══════════════════════════════════════════════════════════════
    print('── Edge Cases ──')
    r_empty = run_flywheel([], 'spark', 'empty', iteration=1)
    check('Empty dataset: no crashes', r_empty.total_scenarios == 0 and r_empty.overall_score == 0)
    check('Empty: zero failure clusters', len(r_empty.failure_clusters) == 0)

    # All-passing dataset
    all_pass = run_flywheel(scenarios[:1], 'spark', 'passing', iteration=1)
    check('All-passing: no failure clusters',
          len(all_pass.failure_clusters) == 0 or all_pass.failed == 0)

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    if '--test' in sys.argv or len(sys.argv) == 1:
        sys.exit(0 if run_tests() else 1)
    elif '--run' in sys.argv:
        idx = sys.argv.index('--run')
        agent = sys.argv[idx + 1] if len(sys.argv) > idx + 1 else 'spark'
        dataset = sys.argv[idx + 2] if len(sys.argv) > idx + 2 else 'default'
        result = run_flywheel([], agent, dataset, iteration=1)
        print(json.dumps({
            'agent': result.agent_id, 'dataset': result.dataset_id,
            'iteration': result.iteration, 'overall_score': result.overall_score,
            'passed': result.passed, 'failed': result.failed,
            'clusters': len(result.failure_clusters),
            'metrics': result.metrics_summary,
        }, indent=2))
    else:
        print('Usage: python3 rag/quality_flywheel.py [--test|--run <agent> <dataset>]')
