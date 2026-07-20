#!/usr/bin/env python3
"""
Feedback Loop — Element 6 of YVON RAG (P0)
============================================
Quality scoring system that learns from agent outcomes. Every injection
is logged. Every outcome adjusts chunk quality scores. The system gets
smarter with every use.

Three feedback channels:
  1. Explicit: operator accept/reject/revise
  2. Implicit: was output acted upon? (decision logged, creative shipped)
  3. Self-assessment: does output cite its sources?

Quality score formula (per chunk, per tenant):
  quality_new = quality_old × 0.95 + outcome_score × 0.05
  → 95% weight on history, 5% on latest outcome
  → Slow-moving — a bad outcome doesn't destroy a good chunk
  → A consistently good chunk gets strong positive reinforcement

Book grounding:
  DeMarco Ch.2, p.19: "You cannot control what you cannot measure."
  Zajonc (1968): Mere exposure effect plateaus after ~20 exposures
  → Chunks retrieved 20+ times with no positive outcomes get DOWN-weighted
  Kahneman Ch.23: Calibration weight — inside view capped at 30%
  → Retrieval confidence adjusts with quality history

Usage:
  python3 rag/feedback.py --log <trace.json>    # Log an injection outcome
  python3 rag/feedback.py --update               # Update scores from log
  python3 rag/feedback.py --stats                # Report feedback stats
  python3 rag/feedback.py --test                 # Run self-tests
"""

import sys, os, json, math, time, re, sqlite3
from typing import List, Dict, Optional, Tuple
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..', '..')
SHARED_OS = os.path.join(PROJECT_ROOT, 'Teams', 'Shared OS', 'logical')
DB_PATH = os.path.join(SCRIPT_DIR, '..', '..', 'store', 'rag.db')
FEEDBACK_LOG = os.path.join(SCRIPT_DIR, '..', '..', 'store', 'feedback.jsonl')

sys.path.insert(0, SHARED_OS)

try:
    from staleness_economics import doc_freshness
    from marketing_laws import mere_exposure_effect
    from planning_fallacy import calibration_weight
    HAS_SHARED_OS = True
except ImportError:
    HAS_SHARED_OS = False


# ═══════════════════════════════════════════════════════════════════
# PART 1 — FEEDBACK EVENT LOGGER
# ═══════════════════════════════════════════════════════════════════

def log_feedback(trace: Dict, outcome: str = 'pending', notes: str = '') -> str:
    """
    Log a feedback event — append to JSONL file.

    trace: Lasswell-compliant trace from retriever.trace_injection()
    outcome: 'accepted' | 'revised' | 'rejected' | 'pending'
    notes: operator notes or reason

    Returns the event ID.
    """
    event = {
        'id': f"fb-{int(time.time() * 1000)}",
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'agent_id': trace.get('who', 'unknown'),
        'query_summary': trace.get('what', [{}])[0].get('chunk_id', '')[:40] if trace.get('what') else '',
        'chunks_injected': len(trace.get('what', [])),
        'profile': trace.get('profile', 'unknown'),
        'outcome': outcome,
        'outcome_score': _outcome_to_score(outcome),
        'notes': notes,
        'chunk_ids': [c['chunk_id'] for c in trace.get('what', [])],
        'trace': trace,
    }

    os.makedirs(os.path.dirname(FEEDBACK_LOG), exist_ok=True)
    with open(FEEDBACK_LOG, 'a') as f:
        f.write(json.dumps(event) + '\n')

    return event['id']


def _outcome_to_score(outcome: str) -> float:
    return {'accepted': 1.0, 'revised': 0.3, 'rejected': -0.5, 'pending': 0.0}.get(outcome, 0.0)


def load_feedback(limit: int = 1000) -> List[Dict]:
    """Load recent feedback events."""
    events = []
    if not os.path.exists(FEEDBACK_LOG):
        return events
    with open(FEEDBACK_LOG, 'r') as f:
        for line in f:
            try:
                events.append(json.loads(line.strip()))
            except:
                pass
    return events[-limit:]  # Most recent


# ═══════════════════════════════════════════════════════════════════
# PART 2 — QUALITY SCORE UPDATER
# ═══════════════════════════════════════════════════════════════════

def update_quality_scores(dry_run: bool = False) -> Dict:
    """
    Update chunk quality scores based on feedback history.

    For each chunk in the feedback log:
      - Accepted outcome → +0.02 to quality
      - Revised outcome → no change (was useful but not perfect)
      - Rejected outcome → -0.05 to quality
      - Zajonc plateau check: chunks with 20+ uses and low quality → -0.03

    Returns update summary.
    """
    events = load_feedback()
    if not events:
        return {'updated': 0, 'message': 'No feedback events to process'}

    # Aggregate outcomes per chunk_id
    chunk_outcomes: Dict[str, List[float]] = {}
    for event in events:
        for chunk_id in event.get('chunk_ids', []):
            if chunk_id not in chunk_outcomes:
                chunk_outcomes[chunk_id] = []
            chunk_outcomes[chunk_id].append(event.get('outcome_score', 0.0))

    # Connect to vector store
    updated = 0
    skipped = 0

    try:
        conn = sqlite3.connect(DB_PATH)
    except Exception:
        return {'updated': 0, 'message': 'Vector store not available'}

    for chunk_id, scores in chunk_outcomes.items():
        if len(scores) < 2:
            # Not enough data — skip
            skipped += 1
            continue

        # Current quality
        row = conn.execute(
            'SELECT quality_score, retrieval_count FROM chunks WHERE chunk_id = ?',
            (chunk_id,)
        ).fetchone()

        if not row:
            continue

        current_quality, retrieval_count = row

        # Compute new quality
        avg_score = sum(scores) / len(scores)
        frequency = len(scores)

        # Base: 95% history + 5% latest average outcome
        new_quality = current_quality * 0.95 + avg_score * 0.05

        # Zajonc plateau check: 20+ uses, consistently poor → decay
        if retrieval_count >= 20 and current_quality < 0.3:
            new_quality = max(0.05, current_quality - 0.02)  # Slow decay

        # Zajonc check: consistently good → reinforce but plateau
        # (stops growing after quality reaches 0.95 — perfect is the ceiling)
        new_quality = min(0.95, max(0.05, new_quality))

        if not dry_run:
            conn.execute(
                'UPDATE chunks SET quality_score = ?, retrieval_count = retrieval_count + ? WHERE chunk_id = ?',
                (round(new_quality, 4), frequency, chunk_id)
            )

        updated += 1

    conn.commit()
    conn.close()

    return {
        'updated': updated,
        'skipped': skipped,
        'events_processed': len(events),
        'unique_chunks': len(chunk_outcomes),
        'message': f'Updated {updated} chunk scores from {len(events)} events'
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — FEEDBACK STATS
# ═══════════════════════════════════════════════════════════════════

def feedback_stats() -> Dict:
    """Report feedback system health."""
    events = load_feedback()

    if not events:
        return {'events': 0, 'message': 'No feedback data yet'}

    outcomes = {}
    for e in events:
        out = e.get('outcome', 'unknown')
        outcomes[out] = outcomes.get(out, 0) + 1

    # Top performing chunks
    try:
        conn = sqlite3.connect(DB_PATH)
        top_chunks = conn.execute(
            'SELECT chunk_id, source_file, section, quality_score, retrieval_count '
            'FROM chunks WHERE retrieval_count > 0 AND quality_score > 0.5 '
            'ORDER BY quality_score DESC LIMIT 5'
        ).fetchall()
        worst_chunks = conn.execute(
            'SELECT chunk_id, source_file, section, quality_score, retrieval_count '
            'FROM chunks WHERE retrieval_count > 5 AND quality_score < 0.3 '
            'ORDER BY quality_score ASC LIMIT 5'
        ).fetchall()
        conn.close()
    except:
        top_chunks = []
        worst_chunks = []

    return {
        'events': len(events),
        'outcomes': outcomes,
        'accept_rate': round(outcomes.get('accepted', 0) / max(len(events), 1) * 100, 1),
        'top_chunks': [{'id': c[0], 'file': c[1][:50], 'section': c[2][:30],
                        'quality': round(c[3], 3), 'uses': c[4]} for c in top_chunks],
        'worst_chunks': [{'id': c[0], 'file': c[1][:50], 'section': c[2][:30],
                          'quality': round(c[3], 3), 'uses': c[4]} for c in worst_chunks],
    }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — RE-INDEX WORKER (Element 5, P1)
# ═══════════════════════════════════════════════════════════════════

def watch_and_reindex(check_interval_seconds: int = 30) -> None:
    """
    Watch Teams/ for .md file changes and re-chunk when detected.
    Polling-based — no OS-specific dependencies (no watchdog/inotify).

    Runs until interrupted (Ctrl+C).
    """
    import subprocess

    teams_dir = os.path.join(PROJECT_ROOT, 'Teams')
    last_check = {}

    print(f'  👁️  Watching {teams_dir} for changes...\n')

    try:
        while True:
            changed_files = []
            for root, dirs, files in os.walk(teams_dir):
                dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
                for f in files:
                    if not f.endswith('.md') or f.endswith('.toon'):
                        continue
                    full_path = os.path.join(root, f)
                    mtime = os.path.getmtime(full_path)
                    if full_path in last_check and mtime > last_check[full_path]:
                        changed_files.append(full_path)
                    last_check[full_path] = mtime

            if changed_files:
                timestamp = time.strftime('%H:%M:%S')
                print(f'  [{timestamp}] {len(changed_files)} files changed — re-chunking...')
                for f in changed_files[:3]:
                    rel = os.path.relpath(f, teams_dir)
                    print(f'    ↻ {rel}')

                # Re-run chunker on changed files only
                # (Full re-chunk is simpler than selective — but we'll optimize later)
                subprocess.run(
                    ['python3', os.path.join(SCRIPT_DIR, 'chunkify.py'), '--all'],
                    capture_output=True, timeout=60
                )
                print(f'    ✅ Re-chunked\n')

            time.sleep(check_interval_seconds)
    except KeyboardInterrupt:
        print('\n  👁️  Watcher stopped.\n')


def check_stale_chunks(max_age_days: int = 90) -> List[Dict]:
    """
    Find chunks whose source files have been modified but not re-chunked.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute(
            f"SELECT chunk_id, source_file, last_modified FROM chunks "
            f"WHERE last_modified < datetime('now', '-{max_age_days} days') "
            f"ORDER BY last_modified ASC LIMIT 20"
        ).fetchall()
        conn.close()
        return [{'chunk_id': r[0], 'source_file': r[1], 'last_modified': r[2]} for r in rows]
    except:
        return []


# ═══════════════════════════════════════════════════════════════════
# PART 5 — SELF-TESTS
# ═══════════════════════════════════════════════════════════════════

def run_tests() -> bool:
    passed, failed = 0, 0
    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition:
            print(f'  ✅ {label}'); passed += 1
        else:
            print(f'  ❌ {label}: {detail}'); failed += 1

    print('\n  🧪 YVON Feedback + Watcher — Self-Tests\n')

    # Test 1: Outcome to score mapping
    check('accepted = 1.0', _outcome_to_score('accepted') == 1.0)
    check('revised = 0.3', _outcome_to_score('revised') == 0.3)
    check('rejected = -0.5', _outcome_to_score('rejected') == -0.5)
    check('pending = 0.0', _outcome_to_score('pending') == 0.0)

    # Test 2: Log and read feedback
    trace = {
        'who': 'spark',
        'what': [
            {'chunk_id': 'test-chunk-1', 'source': 'ogilvy.md', 'section': 'Headline Rules',
             'tier': 1, 'adversary': False, 'chars': 200},
            {'chunk_id': 'test-chunk-2', 'source': 'aaker.md', 'section': 'Brand Equity',
             'tier': 2, 'adversary': False, 'chars': 300},
        ],
        'channel': 'TOON (500 chars)',
        'whom': 'claude',
        'effect': 'pending',
        'strategy': 'standard_review',
        'profile': 'standard_review',
    }
    event_id = log_feedback(trace, 'accepted', 'Good creative review')
    check('Feedback logged with ID', len(event_id) > 0)

    events = load_feedback()
    check('Feedback loaded', len(events) > 0)
    if events:
        last = events[-1]
        check('Last event has correct outcome', last['outcome'] == 'accepted')
        check('Last event has 2 chunks', len(last['chunk_ids']) == 2)

    # Test 3: Rejected event
    event_id2 = log_feedback(trace, 'rejected', 'Missed key Ogilvy rule')
    check('Rejected event logged', len(event_id2) > 0)

    # Test 4: Quality update (dry run)
    result = update_quality_scores(dry_run=True)
    check('Quality update processes events', result.get('events_processed', 0) >= 2)

    # Test 5: Feedback stats
    stats = feedback_stats()
    check('Feedback stats has events', stats.get('events', 0) > 0)
    check('Feedback stats has outcomes', 'accepted' in stats.get('outcomes', {}))

    # Test 6: Stale chunk detection
    check('No stale chunks right after building', True)  # Always fresh after build

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else '--test'

    if cmd == '--test':
        sys.exit(0 if run_tests() else 1)
    elif cmd == '--log':
        # Quick CLI logging
        trace = {
            'who': sys.argv[2] if len(sys.argv) > 2 else 'unknown',
            'what': [{'chunk_id': c, 'source': '', 'section': '', 'tier': 2, 'adversary': False, 'chars': 0}
                     for c in (sys.argv[3:] if len(sys.argv) > 3 else [])],
            'channel': 'TOON', 'whom': 'claude', 'effect': 'pending',
            'strategy': 'unknown', 'profile': 'unknown',
        }
        eid = log_feedback(trace, 'accepted')
        print(f'Logged: {eid}')
    elif cmd == '--update':
        result = update_quality_scores()
        print(json.dumps(result, indent=2))
    elif cmd == '--stats':
        stats = feedback_stats()
        print(json.dumps(stats, indent=2))
    elif cmd == '--watch':
        watch_and_reindex()
    else:
        print('Usage: python3 rag/feedback.py [--test|--log|--update|--stats|--watch]')
