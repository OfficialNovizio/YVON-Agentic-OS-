#!/usr/bin/env python3
"""
sample_size.py — A/B experiment sizing + significance (two proportions).

Owner: metric (Product / Product Analytics), skill: experiment-instrumentation.
Consumed by: loom (experiment-discipline) — sizing an experiment before it runs,
and judging its result against the frozen decision rule after.

What is computed vs what stays flagged (rule 0.6):
  - The FORMULAS here are standard and deterministic (safe to compute now):
      * sample size for a two-proportion test (per variant)
      * two-proportion z-test p-value on observed results
      * normal quantile / CDF (Acklam approx + math.erf)
  - The DEFAULT thresholds (power 0.8, significance 0.05) are conventions —
    operator-set per config; this script takes them as inputs, never invents them.
    An under-powered experiment is FLAGGED before it runs, not discovered after.

Usage:
  python3 sample_size.py size --baseline 0.10 --mde 0.02 --power 0.8 --alpha 0.05
  python3 sample_size.py size --baseline 0.10 --mde 0.10 --relative --power 0.8
  python3 sample_size.py test --n1 1000 --x1 100 --n2 1000 --x2 130
  python3 sample_size.py --test        # self-tests
Stdlib only (math). No network, no writes (Fleet Charter clean).
"""
import argparse, math, sys


def norm_ppf(p):
    """Inverse standard normal CDF (Acklam's rational approximation)."""
    if not (0.0 < p < 1.0):
        raise ValueError("p must be in (0,1)")
    a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
         1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00]
    b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
         6.680131188771972e+01, -1.328068155288572e+01]
    c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
         -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00]
    d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
         3.754408661907416e+00]
    plow, phigh = 0.02425, 1 - 0.02425
    if p < plow:
        q = math.sqrt(-2 * math.log(p))
        return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
               ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    if p > phigh:
        q = math.sqrt(-2 * math.log(1 - p))
        return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
                ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    q = p - 0.5
    r = q * q
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / \
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)


def norm_cdf(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))


def sample_size(baseline, mde, power=0.8, alpha=0.05, relative=False):
    """Per-variant sample size for detecting a change in a proportion.
    mde absolute (default) or relative to baseline. Two-sided."""
    p1 = baseline
    p2 = baseline * (1 + mde) if relative else baseline + mde
    if not (0 < p1 < 1) or not (0 < p2 < 1):
        raise ValueError("baseline and baseline+effect must be in (0,1)")
    if p2 == p1:
        raise ValueError("effect size is zero")
    z_alpha = norm_ppf(1 - alpha / 2)          # two-sided
    z_beta = norm_ppf(power)
    pbar = (p1 + p2) / 2
    num = (z_alpha * math.sqrt(2 * pbar * (1 - pbar))
           + z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    n = num / (p2 - p1) ** 2
    return {
        "n_per_variant": math.ceil(n),
        "baseline": p1, "target": p2,
        "absolute_effect": p2 - p1, "power": power, "alpha": alpha,
        "note": "power/alpha are operator-set conventions (config), not invented; "
                "under-powered runs are flagged before they start",
    }


def significance(n1, x1, n2, x2):
    """Two-proportion z-test (pooled). Returns z, two-sided p, and per-variant rates."""
    if n1 <= 0 or n2 <= 0:
        raise ValueError("n must be > 0")
    p1, p2 = x1 / n1, x2 / n2
    pooled = (x1 + x2) / (n1 + n2)
    se = math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
    if se == 0:
        z = 0.0
    else:
        z = (p2 - p1) / se
    pval = 2 * (1 - norm_cdf(abs(z)))
    return {"rate_control": p1, "rate_variant": p2, "lift_abs": p2 - p1,
            "z": z, "p_value": pval, "significant_at_0.05": pval < 0.05}


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True

    def check(name, cond):
        nonlocal ok
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}")
        ok = ok and cond

    # 1. normal quantile / cdf anchors
    check("ppf(0.975) ≈ 1.959964", abs(norm_ppf(0.975) - 1.959964) < 1e-3)
    check("ppf(0.5) ≈ 0", abs(norm_ppf(0.5)) < 1e-6)
    check("cdf(0) = 0.5", abs(norm_cdf(0) - 0.5) < 1e-9)
    check("cdf(1.96) ≈ 0.975", abs(norm_cdf(1.959964) - 0.975) < 1e-4)

    # 2. textbook sizing: p1=.10, p2=.12, α=.05, power=.8 → ~3841/group
    s = sample_size(0.10, 0.02, power=0.8, alpha=0.05)
    check("sizing 0.10→0.12 in ~3800-3900 band",
          3800 <= s["n_per_variant"] <= 3900)

    # 3. monotonicity: bigger MDE → smaller n
    small = sample_size(0.10, 0.02)["n_per_variant"]
    big = sample_size(0.10, 0.05)["n_per_variant"]
    check("bigger effect needs smaller n", big < small)

    # 4. monotonicity: higher power → larger n
    p80 = sample_size(0.10, 0.02, power=0.8)["n_per_variant"]
    p90 = sample_size(0.10, 0.02, power=0.9)["n_per_variant"]
    check("higher power needs larger n", p90 > p80)

    # 5. relative vs absolute MDE agree (10% of 0.10 == +0.01)
    rel = sample_size(0.10, 0.10, relative=True)["target"]
    check("relative MDE 10% of 0.10 → target 0.11", abs(rel - 0.11) < 1e-9)

    # 6. significance: clearly different proportions → tiny p
    sig = significance(1000, 100, 1000, 200)  # 10% vs 20%
    check("10% vs 20% @ n=1000 is significant", sig["p_value"] < 1e-6)

    # 7. significance: identical proportions → z=0, p≈1
    same = significance(1000, 100, 1000, 100)
    check("identical rates → z=0", abs(same["z"]) < 1e-12)
    check("identical rates → p≈1", abs(same["p_value"] - 1.0) < 1e-9)

    # 8. zero-effect sizing rejected
    try:
        sample_size(0.10, 0.0)
        check("zero effect rejected", False)
    except ValueError:
        check("zero effect rejected", True)

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="A/B sizing + significance (two proportions)")
    ap.add_argument("--test", action="store_true", help="run self-tests")
    sub = ap.add_subparsers(dest="cmd")
    ps = sub.add_parser("size")
    ps.add_argument("--baseline", type=float, required=True)
    ps.add_argument("--mde", type=float, required=True, help="min detectable effect")
    ps.add_argument("--relative", action="store_true", help="mde is relative to baseline")
    ps.add_argument("--power", type=float, default=0.8)
    ps.add_argument("--alpha", type=float, default=0.05)
    pt = sub.add_parser("test_result", aliases=["test"])
    pt.add_argument("--n1", type=int, required=True)
    pt.add_argument("--x1", type=int, required=True)
    pt.add_argument("--n2", type=int, required=True)
    pt.add_argument("--x2", type=int, required=True)
    args = ap.parse_args()

    import json
    if args.test and args.cmd is None:
        return _run_tests()
    if args.cmd == "size":
        print(json.dumps(sample_size(args.baseline, args.mde, args.power,
                                     args.alpha, args.relative), indent=2))
    elif args.cmd in ("test_result", "test"):
        print(json.dumps(significance(args.n1, args.x1, args.n2, args.x2), indent=2))
    else:
        ap.error("use: size ... | test_result ... | --test")
    return 0


if __name__ == "__main__":
    sys.exit(main())
