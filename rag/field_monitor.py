#!/usr/bin/env python3
"""rag/field_monitor.py — async field monitoring (MASTER.md PART 2, phase 11).

Scans the field signals the system leaves behind and appends a compact signal
row to store/monitor-signals.jsonl — consumed by self_improver.analyze() to
decide whether a weekly optimization pass is warranted. Telemetry rule
(YVON-CHAT §8.5): never blocks, never raises — missing files are zeros.

Signals computed:
  · feedback_rejected / feedback_total     — rejection rate from feedback.jsonl
  · quarantine_count                       — quarantine log files
  · gate_violations                        — store/gate-violations.log lines
  · top_problem_agents                     — agents with the most rejected traces

CLI:
  python3 rag/field_monitor.py --emit    # scan + append one signal row
  python3 rag/field_monitor.py --status  # print the latest signals
  python3 rag/field_monitor.py --test    # self-tests
"""
from __future__ import annotations

import json
import os
import sys
import time
from typing import Any

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE = os.path.join(ROOT, "store")
SIGNALS = os.path.join(STORE, "monitor-signals.jsonl")


def scan() -> dict[str, Any]:
    """Compute current field signals. Missing files → zeros, never raises."""
    rejected = total = 0
    agent_rejects: dict[str, int] = {}
    fb = os.path.join(STORE, "feedback.jsonl")
    if os.path.exists(fb):
        try:
            with open(fb, "r", encoding="utf-8") as fh:
                for line in fh:
                    try:
                        row = json.loads(line)
                    except Exception:  # noqa: BLE001
                        continue
                    total += 1
                    outcome = str(row.get("outcome", "")).lower()
                    if outcome in ("rejected", "revised"):
                        rejected += 1
                        aid = str(row.get("agent_id", "unknown"))
                        agent_rejects[aid] = agent_rejects.get(aid, 0) + 1
        except OSError:
            pass

    quarantined = 0
    for base in ("store/quarantine", "rag/quarantine"):
        qdir = os.path.join(ROOT, base)
        if os.path.isdir(qdir):
            try:
                quarantined += len([f for f in os.listdir(qdir) if f.endswith(".jsonl")])
            except OSError:
                pass

    violations = 0
    vp = os.path.join(STORE, "gate-violations.log")
    if os.path.exists(vp):
        try:
            violations = sum(1 for _ in open(vp, encoding="utf-8"))
        except OSError:
            pass

    top = sorted(agent_rejects.items(), key=lambda kv: kv[1], reverse=True)[:3]
    return {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "feedback_rejected": rejected,
        "feedback_total": total,
        "rejection_rate": round(rejected / total, 4) if total else 0.0,
        "quarantine_count": quarantined,
        "gate_violations": violations,
        "top_problem_agents": [{"agent": a, "rejects": n} for a, n in top],
    }


def emit() -> dict[str, Any]:
    """Scan + append one signal row. Never raises on write failure."""
    row = scan()
    try:
        os.makedirs(STORE, exist_ok=True)
        with open(SIGNALS, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(row) + "\n")
    except OSError:
        pass
    return row


def latest() -> dict[str, Any] | None:
    """The most recent signal row, or None."""
    if not os.path.exists(SIGNALS):
        return None
    try:
        with open(SIGNALS, "r", encoding="utf-8") as fh:
            lines = [l for l in fh if l.strip()]
        return json.loads(lines[-1]) if lines else None
    except Exception:  # noqa: BLE001
        return None


def run_tests() -> bool:
    passed = failed = 0

    def check(label: str, cond: bool, detail: str = "") -> None:
        nonlocal passed, failed
        if cond:
            print(f"  ✅ {label}")
            passed += 1
        else:
            print(f"  ❌ {label}: {detail}")
            failed += 1

    print("\n  🧪 field_monitor — Self-Tests\n")
    s = scan()
    check("scan returns ts", bool(s.get("ts")))
    check("scan returns rejection_rate", isinstance(s.get("rejection_rate"), float))
    check("scan tolerates missing files", s["feedback_total"] >= 0 and s["quarantine_count"] >= 0)
    check("top agents is a list", isinstance(s.get("top_problem_agents"), list))
    row = emit()
    check("emit appends a row", latest() is not None)
    check("emitted row matches scan", row.get("rejection_rate") == latest().get("rejection_rate"))
    check("signal path created", os.path.exists(SIGNALS))
    print(f"\n  {'✅' if failed == 0 else '❌'} {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    argv = sys.argv[1:]
    if "--test" in argv:
        sys.exit(0 if run_tests() else 1)
    if "--status" in argv:
        print(json.dumps(latest() or {}, indent=2))
        sys.exit(0)
    row = emit()  # default: --emit
    print(json.dumps(row, indent=2))
    sys.exit(0)
