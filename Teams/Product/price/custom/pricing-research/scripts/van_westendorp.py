#!/usr/bin/env python3
"""
van_westendorp.py — Van Westendorp Price Sensitivity Meter (PSM) calculator.

Owner: price (Product / Pricing & Packaging), skill: pricing-research.
Purpose: turn the four PSM survey questions into the four decision points and
the Range of Acceptable Prices. This is a well-defined algorithm (cumulative-
curve intersections) — it does NOT depend on the pending statistics book, so it
is computed, not reasoning-based. The chosen SURVEY DESIGN and the interpretation
of the outputs remain price's judgment (and the WTP is still confirmed by a real
revenue experiment via loom — stated intent != behaviour).

Input: one respondent = four prices [too_cheap, cheap/bargain, expensive, too_expensive].
Curves (cumulative fractions over a price grid):
  too_cheap(p)      = frac(respondent's too_cheap  >= p)   (descending)
  cheap(p)          = frac(respondent's cheap      >= p)   (descending)
  expensive(p)      = frac(respondent's expensive  <= p)   (ascending)
  too_expensive(p)  = frac(respondent's too_expensive <= p)(ascending)
Decision points (canonical PSM):
  OPP (Optimal Price Point)          = too_cheap  ∩ too_expensive
  IPP (Indifference Price Point)     = cheap      ∩ expensive
  PMC (Point of Marginal Cheapness)  = too_cheap  ∩ expensive       (lower bound)
  PME (Point of Marginal Expensivenes)= cheap     ∩ too_expensive    (upper bound)
  RAP (Range of Acceptable Prices)   = [PMC, PME]

Usage:
  python3 van_westendorp.py --data respondents.json   # [[tc,c,e,te], ...]
  python3 van_westendorp.py --test                     # run self-tests
Stdlib only. No network, no writes (Fleet Charter clean).
"""
import argparse, json, sys


def _frac_ge(values, p):
    return sum(1 for v in values if v >= p) / len(values)


def _frac_le(values, p):
    return sum(1 for v in values if v <= p) / len(values)


def _intersect(grid, a, b):
    """First price where curve a crosses curve b (linear interp on sign change of a-b).
    Returns None if they never cross on the grid."""
    d = [a[i] - b[i] for i in range(len(grid))]
    for i in range(1, len(grid)):
        d0, d1 = d[i - 1], d[i]
        if d0 == 0:
            return grid[i - 1]
        if d0 * d1 < 0:  # sign change → crossing between grid[i-1] and grid[i]
            # linear interpolation for the zero of (a-b)
            t = d0 / (d0 - d1)
            return grid[i - 1] + t * (grid[i] - grid[i - 1])
    if d[-1] == 0:
        return grid[-1]
    return None


def psm(respondents, steps=400):
    """respondents: list of [too_cheap, cheap, expensive, too_expensive]."""
    if not respondents:
        raise ValueError("no respondents")
    tc = [r[0] for r in respondents]
    c = [r[1] for r in respondents]
    e = [r[2] for r in respondents]
    te = [r[3] for r in respondents]
    lo = min(min(tc), min(c), min(e), min(te))
    hi = max(max(tc), max(c), max(e), max(te))
    if hi == lo:
        raise ValueError("degenerate: all prices identical")
    grid = [lo + (hi - lo) * i / steps for i in range(steps + 1)]
    too_cheap = [_frac_ge(tc, p) for p in grid]
    cheap = [_frac_ge(c, p) for p in grid]
    expensive = [_frac_le(e, p) for p in grid]
    too_expensive = [_frac_le(te, p) for p in grid]
    opp = _intersect(grid, too_cheap, too_expensive)
    ipp = _intersect(grid, cheap, expensive)
    pmc = _intersect(grid, too_cheap, expensive)
    pme = _intersect(grid, cheap, too_expensive)
    return {
        "OPP": opp, "IPP": ipp, "PMC": pmc, "PME": pme,
        "RAP": [pmc, pme] if (pmc is not None and pme is not None) else None,
        "n": len(respondents), "price_min": lo, "price_max": hi,
        "flag": "computed — survey design & interpretation are price's judgment; "
                "confirm WTP with a revenue experiment (loom)",
    }


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True

    def check(name, cond):
        nonlocal ok
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}")
        ok = ok and cond

    # 1. intersection primitive: two lines crossing at a known point (x=15)
    grid = [10 + i for i in range(11)]  # 10..20
    a = [1 - (p - 10) / 10 for p in grid]   # 1 → 0 (descending)
    b = [(p - 10) / 10 for p in grid]       # 0 → 1 (ascending); cross at 15, val .5
    x = _intersect(grid, a, b)
    check("intersection of mirror lines ≈ 15", x is not None and abs(x - 15) < 1e-6)

    # 2. symmetric fixture: too_cheap & too_expensive mirror about 15 → OPP ≈ 15
    sym = [[11, 11, 11, 11], [13, 13, 13, 13], [15, 15, 15, 15],
           [17, 17, 17, 17], [19, 19, 19, 19]]
    r = psm(sym)
    check("symmetric fixture OPP ≈ 15", abs(r["OPP"] - 15) < 0.1)
    check("symmetric fixture IPP ≈ 15", abs(r["IPP"] - 15) < 0.1)

    # 3. realistic fixture: proper tc<c<e<te ordering per respondent
    real = [[5, 8, 14, 18], [6, 9, 15, 19], [7, 10, 16, 20],
            [8, 11, 17, 21], [9, 12, 18, 22]]
    r = psm(real)
    for k in ("OPP", "IPP", "PMC", "PME"):
        check(f"{k} found and within price range",
              r[k] is not None and r["price_min"] <= r[k] <= r["price_max"])
    check("ordering PMC <= OPP <= PME", r["PMC"] <= r["OPP"] <= r["PME"])
    check("ordering PMC <= IPP <= PME", r["PMC"] <= r["IPP"] <= r["PME"])
    check("RAP is [PMC, PME] with lower < upper",
          r["RAP"] == [r["PMC"], r["PME"]] and r["PMC"] < r["PME"])

    # 4. curve monotonicity sanity (too_cheap descending, too_expensive ascending)
    tc = [x[0] for x in real]
    grid2 = [5 + i * 0.1 for i in range(171)]
    tcc = [_frac_ge(tc, p) for p in grid2]
    check("too_cheap curve is non-increasing",
          all(tcc[i] >= tcc[i + 1] - 1e-12 for i in range(len(tcc) - 1)))

    # 5. degenerate input rejected
    try:
        psm([[10, 10, 10, 10]])
        check("degenerate all-identical rejected", False)
    except ValueError:
        check("degenerate all-identical rejected", True)

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="Van Westendorp PSM calculator")
    ap.add_argument("--data", help="JSON file: [[too_cheap,cheap,expensive,too_expensive], ...]")
    ap.add_argument("--test", action="store_true", help="run self-tests")
    args = ap.parse_args()
    if args.test:
        return _run_tests()
    if not args.data:
        ap.error("provide --data <file.json> or --test")
    with open(args.data) as f:
        respondents = json.load(f)
    print(json.dumps(psm(respondents), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
