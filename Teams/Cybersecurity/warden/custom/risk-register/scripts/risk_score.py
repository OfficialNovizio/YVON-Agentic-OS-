#!/usr/bin/env python3
"""
risk_score.py — score, rank, and route risks in warden's register.

Owner: warden (Cybersecurity / CISO), skill: risk-register.
Computes likelihood×impact (with optional crown-jewel weighting), ranks a
register, and routes each risk's ACCEPTANCE decision: above the operator-set
threshold → board (Governance); at/below → warden may recommend, operator accepts.

What is computed vs flagged (rule 0.6):
  - The arithmetic (L×I, weighting, ranking, threshold routing) is deterministic
    and computed here.
  - The SCALES and the acceptance THRESHOLD are operator-set (config), NOT invented;
    defaults (5x5, crown-jewel x1.5, threshold 15) are labeled reasoning-based until
    the risk-management source lands. The script never decides to ACCEPT a risk —
    it only routes who must decide.

Usage:
  python3 risk_score.py rank --data risks.json          # [{id,likelihood,impact,crown_jewel}, ...]
  python3 risk_score.py score --likelihood 4 --impact 5 --crown-jewel
  python3 risk_score.py --test
Stdlib only. No network, no writes (charter-clean).
"""
import argparse, json, sys

CROWN_JEWEL_WEIGHT = 1.5          # reasoning-based default (0.6); operator-set
DEFAULT_ACCEPT_THRESHOLD = 15     # above → board; reasoning-based default (0.6)


def score(likelihood, impact, crown_jewel=False, weight=CROWN_JEWEL_WEIGHT):
    if not (1 <= likelihood <= 5) or not (1 <= impact <= 5):
        raise ValueError("likelihood and impact must be on the 1..5 scale")
    base = likelihood * impact
    return round(base * weight, 2) if crown_jewel else float(base)


def route(risk_score, threshold=DEFAULT_ACCEPT_THRESHOLD):
    """Who must decide ACCEPTANCE — never decides to accept, only routes."""
    return "board (Governance) — above acceptance threshold" if risk_score > threshold \
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
        "note": "scales + threshold are operator-set (config), flagged reasoning-based "
                "(0.6); script routes acceptance, never accepts a risk",
    }


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True

    def check(name, cond):
        nonlocal ok
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}")
        ok = ok and cond

    # 1. basic score
    check("score(4,5)=20", score(4, 5) == 20.0)
    check("score(1,1)=1", score(1, 1) == 1.0)

    # 2. crown-jewel weighting raises score
    check("crown-jewel weights up", score(2, 4, crown_jewel=True) == round(8 * 1.5, 2))
    check("crown-jewel > plain for same L,I", score(2, 4, True) > score(2, 4, False))

    # 3. scale validation
    for bad in [(0, 3), (3, 6), (6, 6), (-1, 2)]:
        try:
            score(*bad); check(f"reject out-of-scale {bad}", False)
        except ValueError:
            check(f"reject out-of-scale {bad}", True)

    # 4. acceptance routing — above threshold → board, at/below → operator
    check("score 20 → board", "board" in route(20, 15))
    check("score 12 → operator", "operator" in route(12, 15) and "board" not in route(12, 15))
    check("score == threshold → operator (not above)", "operator" in route(15, 15))

    # 5. ranking order (descending) + routing attached
    data = [
        {"id": "R1", "likelihood": 2, "impact": 2},                    # 4
        {"id": "R2", "likelihood": 5, "impact": 5},                    # 25 → board
        {"id": "R3", "likelihood": 3, "impact": 3, "crown_jewel": True}  # 9*1.5=13.5
    ]
    res = rank(data, threshold=15)
    ids = [r["id"] for r in res["ranked"]]
    check("ranked descending R2,R3,R1", ids == ["R2", "R3", "R1"])
    check("R2 routes to board", "board" in res["ranked"][0]["acceptance_route"])
    check("R3 (13.5) routes to operator", "operator" in res["ranked"][1]["acceptance_route"])

    # 6. the script never 'accepts' — route strings only decide WHO decides
    check("route never says 'accepted'", "accepted" not in route(25).lower())

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="warden risk scoring/ranking/routing")
    ap.add_argument("--test", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    pr = sub.add_parser("rank")
    pr.add_argument("--data", required=True, help="JSON: [{id,likelihood,impact,crown_jewel?}]")
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
