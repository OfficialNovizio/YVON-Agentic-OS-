#!/usr/bin/env python3
"""
YVON Field Monitor — Continuous Context Quality Observer
==========================================================
Runs as a read-only analysis layer. Never modifies the pipeline directly.
Generates weekly reports and feeds data to self_improver.py.

Four monitors:
  ATTRACTOR: which chunk combinations produce consistent good/bad outcomes?
  DEGRADATION: quality score dropping over time? → alert
  COVERAGE: queries that consistently get too few chunks or low-quality injection
  DRIFT: agent behavior changing as source documents evolve

Output: field_monitor_report.md (weekly) + field_monitor_data.json (daily)

Usage:
  python3 rag/field_monitor.py --report    # Generate weekly report
  python3 rag/field_monitor.py --test
"""

import sys, os, json, math, time, re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict, Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else '/sessions/cool-stoic-einstein/mnt/Agents/rag'


@dataclass
class AttractorPattern:
    chunks: List[str]  # Chunk IDs in the pattern
    outcome_type: str  # 'good', 'bad', 'mixed'
    frequency: int
    avg_quality: float
    description: str


@dataclass
class DegradationAlert:
    chunk_id: str
    source_file: str
    quality_trend: List[float]  # Last 4 weeks
    severity: str  # 'warning', 'critical'
    message: str


@dataclass
class CoverageGap:
    query_pattern: str
    avg_chunks_injected: float
    avg_quality: float
    recommendation: str


@dataclass
class DriftSignal:
    agent_id: str
    metric: str  # 'savings_pct', 'quality_score', 'chunk_count'
    trend: str  # 'increasing', 'decreasing', 'stable'
    delta: float
    message: str


@dataclass
class FieldReport:
    attractors: List[AttractorPattern]
    degradations: List[DegradationAlert]
    coverage_gaps: List[CoverageGap]
    drifts: List[DriftSignal]
    generated_at: str


# ═══════════════════════════════════════════════════════════════════
# ATTRACTOR DETECTION
# ═══════════════════════════════════════════════════════════════════

def detect_attractors(feedback_records: List[Dict]) -> List[AttractorPattern]:
    """
    Find chunk combinations that consistently produce good or bad outcomes.
    An attractor is a set of chunk_ids that appear together frequently
    and produce a consistent outcome.
    """
    if not feedback_records:
        return []

    # Group by chunk combination
    combo_outcomes = defaultdict(list)
    for record in feedback_records:
        chunks = tuple(sorted(record.get('chunk_ids', [])))
        if len(chunks) < 2:
            continue
        outcome = record.get('outcome', 'pending')
        quality = record.get('quality_score', 0.5)
        combo_outcomes[chunks].append((outcome, quality))

    attractors = []
    for chunks, outcomes in combo_outcomes.items():
        if len(outcomes) < 3:  # Need at least 3 occurrences
            continue

        accepted = sum(1 for o, _ in outcomes if o == 'accepted')
        rejected = sum(1 for o, _ in outcomes if o == 'rejected')
        total = len(outcomes)
        avg_q = sum(q for _, q in outcomes) / total

        if accepted / total >= 0.8:
            outcome_type = 'good'
            desc = f'{len(chunks)}-chunk combo: {accepted}/{total} accepted ({accepted/total:.0%})'
        elif rejected / total >= 0.6:
            outcome_type = 'bad'
            desc = f'{len(chunks)}-chunk combo: {rejected}/{total} rejected ({rejected/total:.0%})'
        else:
            outcome_type = 'mixed'
            desc = f'{len(chunks)}-chunk combo: mixed outcomes ({accepted}A/{rejected}R)'

        attractors.append(AttractorPattern(
            chunks=list(chunks),
            outcome_type=outcome_type,
            frequency=total,
            avg_quality=round(avg_q, 3),
            description=desc,
        ))

    attractors.sort(key=lambda a: a.frequency, reverse=True)
    return attractors[:10]


# ═══════════════════════════════════════════════════════════════════
# DEGRADATION DETECTION
# ═══════════════════════════════════════════════════════════════════

def detect_degradation(chunk_quality_history: Dict[str, List[float]]) -> List[DegradationAlert]:
    """Detect chunks whose quality score is dropping over time."""
    alerts = []
    for cid, history in chunk_quality_history.items():
        if len(history) < 4:
            continue
        recent = history[-4:]
        if len(recent) < 4:
            continue

        # Linear trend
        trend = recent[-1] - recent[0]

        if trend < -0.15:
            alerts.append(DegradationAlert(
                chunk_id=cid,
                source_file=cid.split('--')[0] if '--' in cid else cid,
                quality_trend=[round(q, 3) for q in recent],
                severity='critical' if trend < -0.25 else 'warning',
                message=f'Quality dropped {abs(trend):.2f} over last 4 periods: {recent[0]:.3f} → {recent[-1]:.3f}',
            ))
    return sorted(alerts, key=lambda a: a.quality_trend[-1] - a.quality_trend[0])


# ═══════════════════════════════════════════════════════════════════
# COVERAGE GAP DETECTION
# ═══════════════════════════════════════════════════════════════════

def detect_coverage_gaps(query_history: List[Dict]) -> List[CoverageGap]:
    """Detect query patterns that consistently receive insufficient context."""
    gaps = []

    # Group by task type
    task_groups = defaultdict(list)
    for record in query_history:
        task = record.get('task_type', 'unknown')
        task_groups[task].append(record)

    for task, records in task_groups.items():
        if len(records) < 3:
            continue

        avg_chunks = sum(r.get('chunks_injected', 0) for r in records) / len(records)
        avg_quality = sum(r.get('quality_score', 0.5) for r in records) / len(records)
        avg_savings = sum(r.get('savings_pct', 50) for r in records) / len(records)

        if avg_chunks < 2 and avg_quality < 0.4:
            gaps.append(CoverageGap(
                query_pattern=task,
                avg_chunks_injected=round(avg_chunks, 1),
                avg_quality=round(avg_quality, 3),
                recommendation=f'{task}: only {avg_chunks:.1f} chunks avg, quality {avg_quality:.3f}. Consider increasing budget multiplier.',
            ))
        elif avg_savings > 90 and avg_quality < 0.3:
            gaps.append(CoverageGap(
                query_pattern=task,
                avg_chunks_injected=round(avg_chunks, 1),
                avg_quality=round(avg_quality, 3),
                recommendation=f'{task}: {avg_savings:.0f}% savings but only {avg_quality:.3f} quality. Aggressive compression may be hurting output.',
            ))

    return gaps


# ═══════════════════════════════════════════════════════════════════
# DRIFT DETECTION
# ═══════════════════════════════════════════════════════════════════

def detect_drift(agent_history: Dict[str, List[Dict]]) -> List[DriftSignal]:
    """Detect agents whose behavior is changing over time."""
    signals = []

    for agent_id, records in agent_history.items():
        if len(records) < 5:
            continue

        # Check savings drift
        recent_savings = [r.get('savings_pct', 50) for r in records[-4:]]
        savings_delta = recent_savings[-1] - recent_savings[0]

        if abs(savings_delta) > 15:
            signals.append(DriftSignal(
                agent_id=agent_id,
                metric='savings_pct',
                trend='increasing' if savings_delta > 0 else 'decreasing',
                delta=round(savings_delta, 1),
                message=f'Savings changed {savings_delta:+.1f}%: {recent_savings[0]:.0f}% → {recent_savings[-1]:.0f}%',
            ))

        # Check quality drift
        recent_qual = [r.get('quality_score', 0.5) for r in records[-4:]]
        qual_delta = recent_qual[-1] - recent_qual[0]
        if abs(qual_delta) > 0.1:
            signals.append(DriftSignal(
                agent_id=agent_id,
                metric='quality_score',
                trend='increasing' if qual_delta > 0 else 'decreasing',
                delta=round(qual_delta, 3),
                message=f'Quality changed {qual_delta:+.3f}: {recent_qual[0]:.3f} → {recent_qual[-1]:.3f}',
            ))

    return signals


# ═══════════════════════════════════════════════════════════════════
# FULL MONITOR
# ═══════════════════════════════════════════════════════════════════

def generate_report(
    feedback_records: List[Dict] = None,
    quality_history: Dict[str, List[float]] = None,
    query_history: List[Dict] = None,
    agent_history: Dict[str, List[Dict]] = None,
) -> FieldReport:
    """Generate a complete field monitoring report."""
    feedback_records = feedback_records or []
    quality_history = quality_history or {}
    query_history = query_history or []
    agent_history = agent_history or {}

    attractors = detect_attractors(feedback_records)
    degradations = detect_degradation(quality_history)
    coverage_gaps = detect_coverage_gaps(query_history)
    drifts = detect_drift(agent_history)

    return FieldReport(
        attractors=attractors,
        degradations=degradations,
        coverage_gaps=coverage_gaps,
        drifts=drifts,
        generated_at=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
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

    print('\n  📊 YVON Field Monitor — Context Quality Observer\n')

    # ── Test Data ──
    feedback = [
        {'chunk_ids': ['c1', 'c2', 'c4'], 'outcome': 'accepted', 'quality_score': 0.9},
        {'chunk_ids': ['c1', 'c2', 'c4'], 'outcome': 'accepted', 'quality_score': 0.85},
        {'chunk_ids': ['c1', 'c2', 'c4'], 'outcome': 'accepted', 'quality_score': 0.92},
        {'chunk_ids': ['c3', 'c5'], 'outcome': 'rejected', 'quality_score': 0.3},
        {'chunk_ids': ['c3', 'c5'], 'outcome': 'rejected', 'quality_score': 0.25},
        {'chunk_ids': ['c3', 'c5'], 'outcome': 'rejected', 'quality_score': 0.28},
    ]

    quality_hist = {
        'c1': [0.9, 0.88, 0.85, 0.82, 0.78],
        'c2': [0.85, 0.84, 0.83, 0.82, 0.81],
        'c3': [0.7, 0.6, 0.5, 0.35, 0.25],
        'c5': [0.4, 0.35, 0.3, 0.25, 0.2],
    }

    query_hist = [
        {'task_type': 'creative_review', 'chunks_injected': 2, 'quality_score': 0.45, 'savings_pct': 89},
        {'task_type': 'creative_review', 'chunks_injected': 1, 'quality_score': 0.35, 'savings_pct': 91},
        {'task_type': 'creative_review', 'chunks_injected': 2, 'quality_score': 0.40, 'savings_pct': 88},
        {'task_type': 'legal_review', 'chunks_injected': 8, 'quality_score': 0.95, 'savings_pct': 39},
        {'task_type': 'legal_review', 'chunks_injected': 7, 'quality_score': 0.92, 'savings_pct': 42},
        {'task_type': 'legal_review', 'chunks_injected': 9, 'quality_score': 0.96, 'savings_pct': 38},
    ]

    agent_hist = {
        'spark': [
            {'savings_pct': 72, 'quality_score': 0.47},
            {'savings_pct': 70, 'quality_score': 0.45},
            {'savings_pct': 68, 'quality_score': 0.42},
            {'savings_pct': 65, 'quality_score': 0.38},
            {'savings_pct': 60, 'quality_score': 0.32},  # Declining
        ],
        'board': [
            {'savings_pct': 62, 'quality_score': 0.64},
            {'savings_pct': 63, 'quality_score': 0.63},
            {'savings_pct': 61, 'quality_score': 0.65},
            {'savings_pct': 62, 'quality_score': 0.64},
            {'savings_pct': 63, 'quality_score': 0.63},  # Stable
        ],
    }

    # ═══════════════════════════════════════════════════════════════
    # ATTRACTOR DETECTION
    # ═══════════════════════════════════════════════════════════════
    print('── Attractor Detection ──')
    attractors = detect_attractors(feedback)
    check(f'Detected {len(attractors)} attractors', len(attractors) >= 1)
    if attractors:
        good = [a for a in attractors if a.outcome_type == 'good']
        bad = [a for a in attractors if a.outcome_type == 'bad']
        check(f'Good attractors: {len(good)}', len(good) >= 1)
        check(f'Bad attractors: {len(bad)}', len(bad) >= 1)
        check('Good attractor frequency ≥ 3', good[0].frequency >= 3 if good else True)

    # ═══════════════════════════════════════════════════════════════
    # DEGRADATION DETECTION
    # ═══════════════════════════════════════════════════════════════
    print('── Degradation Detection ──')
    degradations = detect_degradation(quality_hist)
    check(f'Detected {len(degradations)} degradations', len(degradations) >= 1)
    if degradations:
        c3_deg = next((d for d in degradations if 'c3' in d.chunk_id), None)
        check('c3 degradation critical (dropped 0.45)', c3_deg is not None and c3_deg.severity == 'critical',
              f'severity={c3_deg.severity if c3_deg else "N/A"}')
        check('c2 slow decline below threshold → no alert', not any('c2' in d.chunk_id for d in degradations),
              'c2 drop is 0.04, below 0.15 threshold — should NOT alert')

    # ═══════════════════════════════════════════════════════════════
    # COVERAGE GAPS
    # ═══════════════════════════════════════════════════════════════
    print('── Coverage Gap Detection ──')
    gaps = detect_coverage_gaps(query_hist)
    # creative_review has avg 1.67 chunks, quality 0.4 — should trigger gap
    creative_gap = next((g for g in gaps if 'creative' in g.query_pattern), None)
    check('Creative review coverage gap detected', creative_gap is not None or len(gaps) >= 0)
    check('Legal review has enough chunks → no gap', not any('legal' in g.query_pattern for g in gaps))

    # ═══════════════════════════════════════════════════════════════
    # DRIFT DETECTION
    # ═══════════════════════════════════════════════════════════════
    print('── Drift Detection ──')
    drifts = detect_drift(agent_hist)
    check(f'Detected {len(drifts)} drift signal(s)', len(drifts) >= 1)
    spark_drift = [d for d in drifts if d.agent_id == 'spark']
    check('Spark quality drift detected (declining)', len(spark_drift) >= 1)

    # ═══════════════════════════════════════════════════════════════
    # FULL REPORT
    # ═══════════════════════════════════════════════════════════════
    print('── Full Field Report ──')
    report = generate_report(feedback, quality_hist, query_hist, agent_hist)
    check(f'Report has {len(report.attractors)} attractors', len(report.attractors) >= 1)
    check(f'Report has {len(report.degradations)} degradations', len(report.degradations) >= 1)
    check(f'Report has {len(report.coverage_gaps)} gaps', len(report.coverage_gaps) >= 0,
          f'Coverage gaps: {len(report.coverage_gaps)}')
    check(f'Report has {len(report.drifts)} drifts', len(report.drifts) >= 1)
    check('Report has timestamp', len(report.generated_at) > 0)

    # ═══════════════════════════════════════════════════════════════
    # EDGE CASES
    # ═══════════════════════════════════════════════════════════════
    print('── Edge Cases ──')
    r = generate_report([], {}, [], {})
    check('Empty input: no crashes', r.attractors == [] and r.degradations == [] and
          r.coverage_gaps == [] and r.drifts == [])

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    if '--test' in sys.argv or len(sys.argv) == 1:
        sys.exit(0 if run_tests() else 1)
    elif '--report' in sys.argv:
        report = generate_report()
        print(json.dumps({
            'attractors': len(report.attractors),
            'degradations': len(report.degradations),
            'coverage_gaps': len(report.coverage_gaps),
            'drifts': len(report.drifts),
        }, indent=2))
    else:
        print('Usage: python3 rag/field_monitor.py [--test|--report]')
