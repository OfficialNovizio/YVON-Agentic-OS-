#!/usr/bin/env python3
"""risk_score.py — warden risk scoring/ranking/routing with crown-jewel weight.

CONSOLIDATED 2026-07-29 per playbook §13.5 refined: this file was
refactored to a thin wrapper. Base L×I arithmetic + risk-level
classification come from `Shared OS/logical/risk_management.py`
(book-grounded canonical library).

This wrapper keeps warden's AGENT-SPECIFIC POLICY:
  - Crown-jewel weight multiplier (default 1.5) — operator-configurable
  - Acceptance routing threshold (default 15) — operator-set config
  - The security-inversion: this script NEVER accepts a risk; it only
    routes acceptance decisions (above threshold → board, at/below → operator).

Usage:
  python3 risk_score.py rank --data risks.json
  python3 risk_score.py score --likelihood 4 --impact 5 --crown-jewel
  python3 risk_score.py --test
Stdlib only. No network, no writes (charter-clean).
"""
import argparse, json, os, sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_SHARED_OS = os.path.abspath(os.path.join(_HERE, "..", "..", "..", "..", "..", "Shared OS", "logical"))
if _SHARED_OS not in sys.path:
    sys.path.insert(0, _SHARED_OS)
import risk_management  # noqa: E402


# Warden-specific policy defaults (operator-configurable via config)
CROWN_JEWEL_WEIGHT = 1.5
DEFAULT_ACCEPT_THRESHOLD = 15


def score(likelihood, impact, crown_jewel=False, weight=CROWN_JEWEL_WEIGHT):
    """Warden-flavoured risk score: L×I via Shared OS, then crown-jewel weight."""
    # Delegate base L×I to Shared OS canonical
    base = risk_management.risk_score(likelihood, impact)
    return round(base * weight, 2) if crown_jewel else float(base)


def route(risk_score_val, threshold=DEFAULT_ACCEPT_THRESHOLD):
    """WHO decides ACCEPTANCE — this script never accepts."""
    return "board (Governance) — above acceptance threshold" if risk_score_val > threshold \
        else "operator — warden recommends, operator accepts"


def rank(risks, threshold=DEFAULT_ACCEPT_THRESHOLD, weight=CROWN_JEWEL_WEIGHT):
    out = []
    for r in risks:
        s = score(r["likelihood"], r["impact"], r.get("crown_jewel", False), weight)
        out.append({
            "id": r.get("id", "?"),
            "score": s,
            "crown_jewel": r.get("crown_jewel", False),
            "acceptance_route": route(s, threshold),
        })
    out.sort(key=lambda x: x["score"], reverse=True)
    return {
        "ranked": out,
        "threshold": threshold,
        "source": "Shared OS/logical/risk_management.risk_score",
        "note": "L×I via Shared OS; crown-jewel weight + acceptance threshold are warden-config",
    }


def _run_tests():
    ok = True
    def check(name, cond):
        nonlocal ok
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}")
        ok = ok and cond

    check("score(4,5)=20", score(4, 5) == 20.0)
    check("score(1,1)=1", score(1, 1) == 1.0)
    check("crown-jewel weights up", score(2, 4, crown_jewel=True) == round(8 * 1.5, 2))
    check("crown-jewel > plain", score(2, 4, True) > score(2, 4, False))
    for bad in [(0, 3), (3, 6), (6, 6), (-1, 2)]:
        try:
            score(*bad); check(f"reject out-of-scale {bad}", False)
        except ValueError:
            check(f"reject out-of-scale {bad}", True)
    check("score 20 → board", "board" in route(20, 15))
    check("score 12 → operator", "operator" in route(12, 15) and "board" not in route(12, 15))
    check("score == threshold → operator", "operator" in route(15, 15))
    res = rank([
        {"id": "R1", "likelihood": 2, "impact": 2},
        {"id": "R2", "likelihood": 5, "impact": 5},
        {"id": "R3", "likelihood": 3, "impact": 3, "crown_jewel": True},
    ], threshold=15)
    ids = [r["id"] for r in res["ranked"]]
    check("ranked descending R2,R3,R1", ids == ["R2", "R3", "R1"])
    check("R2 routes to board", "board" in res["ranked"][0]["acceptance_route"])
    check("route never says 'accepted'", "accepted" not in route(25).lower())
    check("Shared OS delegation", res["source"] == "Shared OS/logical/risk_management.risk_score")
    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="warden risk scoring/ranking/routing")
    ap.add_argument("--test", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    pr = sub.add_parser("rank")
    pr.add_argument("--data", required=True)
    pr.add_argument("--threshold", type=float, default=DEFAULT_ACCEPT_THRESHOLD)
    ps = sub.add_parser("score")
    ps.add_argument("--likelihood", type=int, required=True)
    ps.add_argument("--impact", type=int, required=True)
    ps.add_argument("--crown-jewel", action="store_true")
    ps.add_argument("--threshold", type=float, default=DEFAULT_ACCEPT_THRESHOLD)
    args = ap.parse_args()
    if args.test and args.cmd is None:
        return _run_tests()
    if args.cmd == "rank":
        with open(args.data) as f:
            print(json.dumps(rank(json.load(f), args.threshold), indent=2))
    elif args.cmd == "score":
        s = score(args.likelihood, args.impact, args.crown_jewel)
        print(json.dumps({"score": s, "acceptance_route": route(s, args.threshold)}, indent=2))
    else:
        ap.error("use: rank --data f.json | score --likelihood L --impact I | --test")
    return 0


if __name__ == "__main__":
    sys.exit(main())
