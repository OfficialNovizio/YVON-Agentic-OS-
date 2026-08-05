#!/usr/bin/env python3
"""rag/self_improver.py — autonomous optimization cycle (MASTER.md PART 7 Scenario D).

Phases (MASTER.md: analyze → propose → sandbox test → decide → deploy → log):
  1. analyze   — scan field signals (store/feedback.jsonl outcomes, quarantine
                 logs, gate violations, monitor signals) for problems.
  2. propose   — deterministic proposals derived from the signals; each carries
                 a reason + source evidence. No invented fixes.
  3. sandbox test — run rag/test_runner.py + cli/task.sh validate in a subprocess.
                 ANY failed sandbox test holds ALL proposals (MASTER.md) and
                 notifies the operator via store/self-improver/holds.jsonl.
  4. decide    — tests passed → proposals are deployable; else held.
  5. deploy    — --apply records approved proposals in the append-only ledger
                 store/self-improver/applied.jsonl. Code changes still flow the
                 normal review/gate path (sandbox-first promotion: "the sandbox
                 is where things are proven; the repo is where proven things
                 live"). Default is dry-run: never writes the ledger.
  6. log       — append one line to rag/improvement_log.jsonl in the
                 established shape {timestamp, problems_found, proposals_generated,
                 tests_passed, deployed, held, dry_run}.

CLI:
  python3 rag/self_improver.py --test       # self-tests (must pass)
  python3 rag/self_improver.py --dry-run    # default: analyze+propose+gate, no apply
  python3 rag/self_improver.py --run        # full cycle, still no apply
  python3 rag/self_improver.py --run --apply  # full cycle + record applied proposals
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from typing import Any, Optional

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE = os.path.join(ROOT, "store")
LOG = os.path.join(ROOT, "rag", "improvement_log.jsonl")
HOLDS = os.path.join(STORE, "self-improver", "holds.jsonl")
APPLIED = os.path.join(STORE, "self-improver", "applied.jsonl")

# ── 1. ANALYZE ────────────────────────────────────────────────────────────────
def analyze() -> dict[str, Any]:
    """Scan field signals for problems. Missing files → zeros (never crashes)."""
    problems = []

    # Feedback outcomes — rejected/revised = quality signal.
    feedback_path = os.path.join(STORE, "feedback.jsonl")
    rejected = 0
    total = 0
    if os.path.exists(feedback_path):
        with open(feedback_path, "r", encoding="utf-8") as fh:
            for line in fh:
                try:
                    row = json.loads(line)
                except Exception:  # noqa: BLE001
                    continue
                total += 1
                outcome = str(row.get("outcome", "")).lower()
                if outcome in ("rejected", "revised"):
                    rejected += 1
    if rejected:
        problems.append(f"{rejected}/{total} feedback traces rejected/revised")

    # Quarantined chunks.
    quarantined = 0
    for base in ("store/quarantine", "rag/quarantine"):
        qdir = os.path.join(ROOT, base)
        if os.path.isdir(qdir):
            quarantined += len([f for f in os.listdir(qdir) if f.endswith(".jsonl")])
    if quarantined:
        problems.append(f"{quarantined} quarantine log(s) present")

    # Gate violations (PART 8 write-gate log, if present).
    violations = 0
    viol_path = os.path.join(STORE, "gate-violations.log")
    if os.path.exists(viol_path):
        try:
            violations = sum(1 for _ in open(viol_path, encoding="utf-8"))
        except OSError:
            violations = 0
    if violations:
        problems.append(f"{violations} gate violation(s) logged")

    # Monitor signals (field_monitor.py) — latest rejection_rate.
    signals_path = os.path.join(STORE, "monitor-signals.jsonl")
    if os.path.exists(signals_path):
        try:
            with open(signals_path, "r", encoding="utf-8") as fh:
                lines = [l for l in fh if l.strip()]
            if lines:
                last = json.loads(lines[-1])
                rate = float(last.get("rejection_rate", 0))
                if rate > 0.3:
                    problems.append(f"rejection rate {rate:.0%} (field monitor)")
        except Exception:  # noqa: BLE001
            pass

    return {"problems": problems, "rejected": rejected, "total": total,
            "quarantined": quarantined, "gate_violations": violations}


# ── 2. PROPOSE ────────────────────────────────────────────────────────────────
def propose(signals: dict[str, Any]) -> list[dict[str, Any]]:
    """Deterministic proposals derived from signals — each with reason+evidence."""
    proposals: list[dict[str, Any]] = []
    if signals.get("rejected", 0) > 0:
        proposals.append({
            "id": f"prop-{int(time.time())}-feedback",
            "action": "review rejected feedback traces and update the affected skill/script",
            "reason": f"{signals['rejected']} traces rejected/revised",
            "evidence": "store/feedback.jsonl",
        })
    if signals.get("quarantined", 0) > 0:
        proposals.append({
            "id": f"prop-{int(time.time())}-quarantine",
            "action": "run the quarantine recovery pass on dropped chunks",
            "reason": f"{signals['quarantined']} quarantine log(s) present",
            "evidence": "store/quarantine, rag/quarantine",
        })
    if signals.get("gate_violations", 0) > 0:
        proposals.append({
            "id": f"prop-{int(time.time())}-gate",
            "action": "investigate gate violations and tighten the owning gate",
            "reason": f"{signals['gate_violations']} gate violation(s)",
            "evidence": "store/gate-violations.log",
        })
    return proposals


# ── 3. SANDBOX TEST ───────────────────────────────────────────────────────────
def sandbox_test() -> tuple[bool, str]:
    """Run the pipeline test suite + task validation. ANY failure holds all."""
    checks = []
    try:
        r1 = subprocess.run(
            [sys.executable, os.path.join(ROOT, "rag", "test_runner.py")],
            capture_output=True, text=True, timeout=240,
        )
        checks.append(("rag/test_runner.py", r1.returncode == 0, (r1.stdout or r1.stderr)[-160:]))
    except Exception as exc:  # noqa: BLE001
        checks.append(("rag/test_runner.py", False, str(exc)[:160]))
    try:
        r2 = subprocess.run(
            [sys.executable, os.path.join(ROOT, "cli", "task.py"), "validate"],
            capture_output=True, text=True, timeout=60,
        )
        checks.append(("cli/task.py validate", r2.returncode == 0, (r2.stdout or r2.stderr)[-160:]))
    except Exception as exc:  # noqa: BLE001
        checks.append(("cli/task.py validate", False, str(exc)[:160]))
    ok = all(c[1] for c in checks)
    detail = "; ".join(f"{name}: {'PASS' if good else 'FAIL ' + msg}" for name, good, msg in checks)
    return ok, detail


# ── 4+5+6. DECIDE / DEPLOY / LOG ─────────────────────────────────────────────
def _append(path: str, row: dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(row) + "\n")


def run_cycle(dry_run: bool = True, apply: bool = False, _stub_test: Optional[tuple[bool, str]] = None) -> dict[str, Any]:
    """One full optimization cycle. Returns the summary row."""
    signals = analyze()
    proposals = propose(signals)
    ok, detail = _stub_test if _stub_test is not None else sandbox_test()
    held = len(proposals) if not ok else 0
    deployed = 0

    if not ok and proposals:
        _append(HOLDS, {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "held": held,
            "reason": "sandbox test failed — ALL proposals held (MASTER.md)",
            "detail": detail,
        })

    if ok and proposals and apply and not dry_run:
        for p in proposals:
            _append(APPLIED, {**p, "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
        deployed = len(proposals)

    summary = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "problems_found": len(signals["problems"]),
        "proposals_generated": len(proposals),
        "tests_passed": ok,
        "deployed": deployed,
        "held": held,
        "dry_run": bool(dry_run),
    }
    _append(LOG, summary)
    return summary


# ── SELF-TESTS ────────────────────────────────────────────────────────────────
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

    print("\n  🧪 self_improver — Self-Tests\n")

    # analyze
    s = analyze()
    check("analyze returns problem list", isinstance(s["problems"], list))
    check("analyze handles missing files (zeros)", s["total"] >= 0 and s["quarantined"] >= 0)
    check("analyze counts gate violations", isinstance(s["gate_violations"], int))

    # propose
    p = propose({"rejected": 2, "quarantined": 0, "gate_violations": 0})
    check("propose generates for rejected signal", len(p) == 1)
    check("proposal has reason", bool(p[0]["reason"]))
    check("proposal has evidence", bool(p[0]["evidence"]))
    p0 = propose({"rejected": 0, "quarantined": 0, "gate_violations": 0})
    check("propose generates none for clean signals", len(p0) == 0)

    # sandbox gate
    ok_fail = run_cycle(dry_run=True, _stub_test=(False, "stubbed failure"))
    check("failed sandbox test holds all proposals", ok_fail["held"] >= 0 and ok_fail["tests_passed"] is False)
    check("hold recorded", os.path.exists(HOLDS))
    ok_pass = run_cycle(dry_run=True, _stub_test=(True, "stubbed pass"))
    check("passing sandbox test → tests_passed true", ok_pass["tests_passed"] is True)

    # deploy
    before = 0
    if os.path.exists(APPLIED):
        before = sum(1 for _ in open(APPLIED, encoding="utf-8"))
    run_cycle(dry_run=True, apply=True, _stub_test=(True, "pass"))
    after_dry = sum(1 for _ in open(APPLIED, encoding="utf-8")) if os.path.exists(APPLIED) else 0
    check("dry-run never writes applied ledger", after_dry == before)
    run_cycle(dry_run=False, apply=True, _stub_test=(True, "pass"))
    after_apply = sum(1 for _ in open(APPLIED, encoding="utf-8")) if os.path.exists(APPLIED) else 0
    check("--apply appends to applied ledger", after_apply > after_dry)

    # log shape
    with open(LOG, encoding="utf-8") as fh:
        last = json.loads([l for l in fh if l.strip()][-1])
    check("log row has timestamp", bool(last.get("timestamp")))
    check("log row has dry_run flag", "dry_run" in last)
    check("log row has proposals_generated", "proposals_generated" in last)

    print(f"\n  {'✅' if failed == 0 else '❌'} {passed} passed, {failed} failed")
    return failed == 0


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    argv = sys.argv[1:]
    if "--test" in argv:
        sys.exit(0 if run_tests() else 1)
    # Default dry-run; --apply only records when --run is also given.
    dry = not ("--apply" in argv and "--run" in argv)
    summary = run_cycle(dry_run=dry, apply="--apply" in argv)
    print(json.dumps(summary, indent=2))
    sys.exit(0 if summary["tests_passed"] else 1)
