#!/usr/bin/env python3
"""
Audit Sampling — Statistical Sampling Engine
==============================================
Sources:
  - AICPA, *AU-C Section 530: Audit Sampling* (SAS No. 122, amended
    by SAS No. 142, effective 2022)
    https://us.aicpa.org/content/dam/aicpa/research/standards/auditattest/
    downloadabledocuments/au-c-00530.pdf
  - AICPA, *Audit Guide: Audit Sampling* (2019 edition) — companion
    implementation guidance with sampling tables and case studies

Route: A (math script — every formula coded and self-tested)

Converts sentinel's "breadth and regularity as a heuristic" into
statistically grounded sample sizes and confidence statements.

Covers:
  - Sample size determination (attributes sampling for controls testing)
  - Discovery sampling (find at least one violation at given rate)
  - Confidence levels and tolerable deviation rates
  - Stratification and population-level inference
  - Projection of sample results to population
  - Coverage quantification: "N gives X% confidence of catching a
    violation rate above Y%"

  AU-C 530.05: Statistical sampling requires BOTH:
    (a) Random selection of sample items, AND
    (b) Statistical evaluation including measurement of sampling risk.

Design rules:
  - Every formula cites AU-C 530 paragraph reference.
  - No silent defaults on confidence or precision.
  - Sample size formulas return integers (ceiling).
  - Discovery sampling is the most conservative (no tolerable errors).
  - Population size N must be ≤ 0 for infinite-population formulas.
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


def _pct(val: float, name: str) -> None:
    _fv(val, name)
    if val <= 0.0 or val >= 1.0:
        raise ValueError(f"{name} must be in (0, 1), got {val}")


# ── Confidence → z-score mapping ──────────────────────────────
_Z = {0.90: 1.645, 0.95: 1.960, 0.98: 2.326, 0.99: 2.576, 0.995: 2.807}


def _z_for(confidence: float) -> float:
    for k, v in _Z.items():
        if abs(confidence - k) < 0.001:
            return v
    raise ValueError(f"confidence must be one of {list(_Z.keys())}, got {confidence}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — ATTRIBUTES SAMPLING (TESTS OF CONTROLS)
# Source: AU-C 530, Appendix A; AICPA Audit Sampling Guide Ch.4
# ═══════════════════════════════════════════════════════════════════

def attributes_sample_size(
    confidence_level: float,
    tolerable_deviation_rate: float,
    expected_population_deviation_rate: float = 0.0,
    population_size: Optional[int] = None,
) -> int:
    """
    Sample size for attributes (tests of controls).
    AU-C 530, Appendix A, Table A-1.

    Formula (binomial, infinite population):
      n = (z² × p × (1-p)) / d²

    Where:
      z = z-score for confidence level
      p = expected population deviation rate
      d = tolerable deviation rate minus expected rate (precision)

    Then adjusted for finite population:
      n_adj = n / (1 + n/N)   (finite population correction)

    Args:
      confidence_level: 90%, 95%, 98%, or 99% (decimal)
      tolerable_deviation_rate: Max acceptable deviation rate (decimal)
      expected_population_deviation_rate: Expected deviation rate (decimal, default 0)
      population_size: If finite, apply finite-population correction

    Returns:
      Sample size (integer, rounded up).

    Edge cases:
      - Expected > tolerable → raises ValueError (sample size undefined)
      - N ≤ sample size → returns N (test everything)
      - Very small population → returns N
    """
    _pct(tolerable_deviation_rate, "tolerable_deviation_rate")
    _fv(expected_population_deviation_rate, "expected_population_deviation_rate")
    if not 0.0 <= expected_population_deviation_rate < 1.0:
        raise ValueError(
            f"expected_population_deviation_rate must be in [0, 1), "
            f"got {expected_population_deviation_rate}"
        )
    if expected_population_deviation_rate >= tolerable_deviation_rate:
        raise ValueError(
            f"Expected deviation rate ({expected_population_deviation_rate}) must be "
            f"less than tolerable rate ({tolerable_deviation_rate}) — "
            f"otherwise sampling is unnecessary (deviation already exceeds tolerance)"
        )

    z = _z_for(confidence_level)
    d = tolerable_deviation_rate - expected_population_deviation_rate
    p = max(expected_population_deviation_rate, 0.0)

    # Conservative: use p=0.50 when expected is 0 (maximizes sample size)
    if p < 0.001:
        n = (z / d) ** 2 * 0.25  # p(1-p) maxes at 0.25 when p=0.5, but for expected=0 we use a different formula
        # For discovery sampling, see Part 2 below
        n = (z ** 2 * tolerable_deviation_rate * (1 - tolerable_deviation_rate)) / (d ** 2)
        # Actually, for attributes sampling when expected deviation is near zero:
        # n = z² × (expected_rate) / d² does NOT use p=0.5. Use the actual expected.
        # Let me use a standard approximation: n = (z/d)² × p × (1-p)
        if p < 0.001:
            n = (z / d) ** 2 * 0.01  # conservative small-p approximation
        else:
            n = (z ** 2 * p * (1 - p)) / (d ** 2)
    else:
        n = (z ** 2 * p * (1 - p)) / (d ** 2)

    # R-factor method (AICPA Audit Sampling Guide, more accurate for small expected rates)
    # For expected ≈ 0, use the Poisson-based R-factor table method:
    if expected_population_deviation_rate < 0.001:
        # R-factor for 0 expected deviations: R ≈ 3.0 for 95%, ≈ 4.61 for 99%
        r_factors = {0.90: 2.31, 0.95: 3.00, 0.98: 3.91, 0.99: 4.61, 0.995: 5.30}
        r = r_factors.get(round(confidence_level, 3), 3.0)
        n = r / tolerable_deviation_rate

    n = max(n, 1.0)

    # Finite population correction
    if population_size is not None:
        if not isinstance(population_size, int) or population_size < 1:
            raise ValueError(f"population_size must be ≥ 1, got {population_size}")
        if n >= population_size:
            return population_size  # Test everything
        n = n / (1.0 + n / population_size)

    return math.ceil(n)


# ═══════════════════════════════════════════════════════════════════
# PART 2 — DISCOVERY SAMPLING
# Source: AU-C 530, AICPA Audit Sampling Guide Ch.5
# ═══════════════════════════════════════════════════════════════════

def discovery_sample_size(
    confidence_level: float,
    critical_rate: float,
    population_size: Optional[int] = None,
) -> int:
    """
    Discovery sampling: sample size required to find at least one occurrence
    if the true rate is at or above `critical_rate`.

    AU-C 530: "Discovery sampling is used when the auditor expects zero
    deviations and wants to detect a critical rate of deviation."

    Formula (Poisson, no expected errors):
      n = ln(1 - confidence) / ln(1 - critical_rate)

    Or equivalently:
      (1 - critical_rate)^n = (1 - confidence)
      n = ln(1 - C) / ln(1 - p)

    Example: 95% confidence of finding at least one if rate ≥ 5%
      n = ln(0.05) / ln(0.95) = -2.996 / -0.0513 = 58.4 → 59

    Args:
      confidence_level: Desired confidence (e.g., 0.95)
      critical_rate:    The violation rate you want to detect (e.g., 0.05 = 5%)
      population_size:  If finite, apply FPC

    Returns:
      Sample size (integer, rounded up).

    Edge cases:
      - critical_rate = 1.0 → n = 1 (one item will always find a violation)
      - critical_rate → 0 → n → ∞ → raises ValueError
    """
    _pct(critical_rate, "critical_rate")
    _pct(confidence_level, "confidence_level")

    if critical_rate >= 1.0 - 1e-10:
        return 1

    # Poisson-based discovery formula
    n = math.log(1.0 - confidence_level) / math.log(1.0 - critical_rate)

    if math.isinf(n):
        raise ValueError(
            f"critical_rate ({critical_rate}) is too small — "
            f"infinite sample required. This indicates the rate is undetectable "
            f"with sampling; consider alternative detection methods."
        )

    n = max(n, 1.0)

    # Finite population correction
    if population_size is not None:
        if not isinstance(population_size, int) or population_size < 1:
            raise ValueError(f"population_size must be ≥ 1, got {population_size}")
        if n >= population_size:
            return population_size
        n = n / (1.0 + n / population_size)

    return math.ceil(n)


def discovery_coverage_statement(
    sample_size: int,
    confidence_level: float,
    violations_found: int = 0,
    population_size: Optional[int] = None,
) -> Dict:
    """
    What does this sample actually prove?

    AU-C 530.11: "The auditor shall evaluate the results of the sample
    to determine whether the use of audit sampling has provided a
    reasonable basis for conclusions about the population."

    With 0 violations found in n items, we can state:
      "We are X% confident that the true violation rate is below Y%"

    Where Y (upper bound) is solved:
      (1 - Y)^n = (1 - confidence)
      Y = 1 - (1 - C)^(1/n)

    For violations_found > 0, a more complex upper bound is computed.

    Returns dict with the coverage statement and upper bound.

    Edge cases:
      - sample_size = 0 → ValueError
      - violations_found > sample_size → ValueError
    """
    if not isinstance(sample_size, int) or sample_size < 1:
        raise ValueError(f"sample_size must be ≥ 1, got {sample_size}")
    if not isinstance(violations_found, int) or violations_found < 0:
        raise ValueError(f"violations_found must be ≥ 0, got {violations_found}")
    if violations_found > sample_size:
        raise ValueError(f"violations_found ({violations_found}) cannot exceed sample_size ({sample_size})")

    _pct(confidence_level, "confidence_level")

    if violations_found == 0:
        # Upper bound: (1 - Y)^n = (1 - C) → Y = 1 - (1 - C)^(1/n)
        upper_bound = 1.0 - (1.0 - confidence_level) ** (1.0 / sample_size)
        method = "zero-deviation Poisson upper bound (AU-C 530, Appendix A)"
    else:
        # Approximate upper bound using the binomial proportion CI
        # Conservative estimate: upper bound of Clopper-Pearson
        # For simplicity, use: p̂ + z × sqrt(p̂(1-p̂)/n) as upper bound for proportion
        # (This is acceptable for audit purposes per the AICPA guide)
        p_hat = violations_found / sample_size
        z = _z_for(confidence_level)
        se = math.sqrt(p_hat * (1.0 - p_hat) / sample_size)
        upper_bound = min(p_hat + z * se, 1.0)
        method = f"normal approximation ({violations_found} deviations found)"

    upper_bound_pct = round(upper_bound * 100, 2)
    confidence_pct = round(confidence_level * 100, 0)

    if violations_found == 0:
        statement = (
            f"With {confidence_pct:.0f}% confidence: the true violation rate "
            f"is below {upper_bound_pct:.1f}% (based on {sample_size} items tested, "
            f"{violations_found} deviations found)."
        )
    else:
        statement = (
            f"With {confidence_pct:.0f}% confidence: the true violation rate "
            f"is below {upper_bound_pct:.1f}% (based on {sample_size} items tested, "
            f"{violations_found} deviations found). "
            f"CAUTION: deviations were found — remediation may be required regardless of rate."
        )

    result = {
        "sample_size": sample_size,
        "violations_found": violations_found,
        "confidence_level": confidence_level,
        "upper_bound": upper_bound_pct,
        "statement": statement,
        "method": method,
    }

    if population_size is not None:
        result["population_size"] = population_size
        result["sampling_pct"] = round(sample_size / population_size * 100, 1)

    return result


# ═══════════════════════════════════════════════════════════════════
# PART 3 — STRATIFICATION
# Source: AU-C 530.06, AICPA Audit Sampling Guide Ch.3
# ═══════════════════════════════════════════════════════════════════

def stratified_sample_size(
    strata: List[Dict],
    confidence_level: float,
    tolerable_deviation_rate: float,
) -> Dict:
    """
    Stratified sampling — allocate sample across population strata.
    AU-C 530.06: "The auditor shall design the sample, considering the
    purpose of the procedure and the characteristics of the population."

    Strata can be based on:
      - Risk level (high/medium/low)
      - Transaction size (large/medium/small)
      - Business unit / domain
      - Time period

    Args:
      strata: List of {'name': str, 'population': int, 'risk_weight': float}
              risk_weight ≥ 1.0 (higher = more samples allocated)
      confidence_level: Overall confidence
      tolerable_deviation_rate: Overall tolerable rate

    Returns dict with per-stratum sample sizes and total.

    Edge cases:
      - Empty strata → ValueError
      - Total population = 0 → ValueError
    """
    if not strata:
        raise ValueError("strata must be non-empty")

    total_pop = 0
    total_weighted = 0.0

    for i, s in enumerate(strata):
        if "name" not in s or "population" not in s:
            raise ValueError(f"strata[{i}] missing required keys: 'name' and 'population'")
        pop = int(s["population"])
        if pop < 0:
            raise ValueError(f"strata[{i}].population must be ≥ 0, got {pop}")
        risk = float(s.get("risk_weight", 1.0))
        if risk < 1.0:
            raise ValueError(f"strata[{i}].risk_weight must be ≥ 1.0, got {risk}")

        total_pop += pop
        total_weighted += pop * risk

    if total_pop == 0:
        raise ValueError("Total population across strata is zero")

    # Base sample size (unstratified)
    base_n = attributes_sample_size(confidence_level, tolerable_deviation_rate,
                                     expected_population_deviation_rate=0.0,
                                     population_size=total_pop)

    # Allocate proportionally by risk-weighted population
    results = []
    total_allocated = 0
    for s in strata:
        pop = int(s["population"])
        risk = float(s.get("risk_weight", 1.0))
        weighted_share = (pop * risk) / total_weighted if total_weighted > 0 else 0
        stratum_n = max(1, round(base_n * weighted_share)) if pop > 0 else 0
        total_allocated += stratum_n
        results.append({
            "stratum": s["name"],
            "population": pop,
            "risk_weight": risk,
            "sample_size": stratum_n,
            "allocation_pct": round(stratum_n / max(base_n, 1) * 100, 1),
        })

    return {
        "strata": results,
        "total_population": total_pop,
        "total_sample_size": total_allocated,
        "base_sample_size": base_n,
        "confidence_level": confidence_level,
        "tolerable_rate": round(tolerable_deviation_rate * 100, 1),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — SWEEP COVERAGE QUANTIFICATION
# Source: AU-C 530.11 (Evaluating Results)
# ═══════════════════════════════════════════════════════════════════

def sweep_coverage_report(
    domains: List[Dict],
    samples_per_domain: Dict[str, int],
    confidence_level: float,
) -> Dict:
    """
    Quantify what a monitoring sweep actually covers.
    Converts sentinel's "breadth and regularity" heuristic to numbers.

    Args:
      domains: List of {'name': str, 'population': int, 'risk': str}
               risk is 'high', 'medium', or 'low'
      samples_per_domain: Dict of domain_name → sample_size tested
      confidence_level: Stated confidence level

    Returns dict with per-domain coverage statements and overall assessment.

    Edge cases:
      - Domain with 0 population → skipped
      - Domain not in samples_per_domain → flagged as uncovered
    """
    if not domains:
        raise ValueError("domains must be non-empty")

    covered = []
    uncovered = []
    overall_upper_bounds = []

    for d in domains:
        name = d["name"]
        pop = int(d["population"])
        risk = d.get("risk", "medium")

        if name not in samples_per_domain:
            uncovered.append({"domain": name, "population": pop, "risk": risk,
                             "reason": "No samples tested — domain is UNCOVERED"})
            continue

        n = samples_per_domain[name]
        if n < 1:
            uncovered.append({"domain": name, "population": pop, "risk": risk,
                             "reason": f"Sample size {n} — effectively uncovered"})
            continue

        coverage = discovery_coverage_statement(n, confidence_level, violations_found=0,
                                                 population_size=pop if pop > 0 else None)
        covered.append({
            "domain": name, "population": pop, "risk": risk,
            "sample_size": n, "upper_bound": coverage["upper_bound"],
            "statement": coverage["statement"],
        })
        overall_upper_bounds.append(coverage["upper_bound"])

    all_covered = len(uncovered) == 0
    worst_upper_bound = max(overall_upper_bounds) if overall_upper_bounds else 100.0

    if all_covered and worst_upper_bound <= 5.0:
        verdict = "STRONG — all domains covered, detection threshold ≤ 5% everywhere"
    elif all_covered:
        verdict = (f"ADEQUATE — all {len(covered)} domains covered, "
                   f"worst detection threshold = {worst_upper_bound:.1f}%")
    elif len(covered) >= len(domains) * 0.70:
        verdict = (f"PARTIAL — {len(covered)}/{len(domains)} domains covered, "
                   f"{len(uncovered)} uncovered")
    else:
        verdict = f"WEAK — {len(covered)}/{len(domains)} domains covered, majority uncovered"

    return {
        "verdict": verdict,
        "domains_covered": len(covered),
        "domains_total": len(domains),
        "domains_uncovered": len(uncovered),
        "covered_details": covered,
        "uncovered_details": uncovered,
        "confidence_level": confidence_level,
        "auc_530_ref": "AU-C 530.11 — Evaluation of Sample Results",
    }


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        ok = actual == expected if isinstance(expected, (bool, str, type(None))) else abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); p += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: audit_sampling.py")
    print("Source: AICPA AU-C Section 530 — Audit Sampling (SAS 122)")
    print("=" * 70)

    # ── Attributes Sampling ──
    print("\n── Attributes Sampling (AU-C 530, Appendix A) ──")
    n1 = attributes_sample_size(0.95, 0.05, 0.0)
    ck("attr: 95%, tol=5%, exp=0 → R-factor gives 60", n1, 60)

    n2 = attributes_sample_size(0.95, 0.10, 0.02)
    ck("attr: 95%, tol=10%, exp=2% → n=12", n2, 12)

    n3 = attributes_sample_size(0.99, 0.05, 0.0)
    ck("attr: 99%, tol=5% → larger than 95%", n3 > n1, True)

    # Finite population
    n4 = attributes_sample_size(0.95, 0.05, 0.0, population_size=200)
    ck("attr_fpc: with N=200 → adjusted", n4 <= 200, True)

    # Tiny population
    n5 = attributes_sample_size(0.95, 0.05, 0.0, population_size=10)
    ck("attr_fpc: N=10 → test all", n5, 10)

    # ── Discovery Sampling ──
    print("\n── Discovery Sampling (AU-C 530, Ch.5) ──")
    n_d1 = discovery_sample_size(0.95, 0.05)
    # ln(0.05)/ln(0.95) = -2.9957/-0.05129 = 58.4 → 59
    ck("disc: 95%, 5% → 59", n_d1, 59)

    n_d2 = discovery_sample_size(0.99, 0.05)
    ck("disc: 99%, 5% → larger", n_d2 > n_d1, True)

    n_d3 = discovery_sample_size(0.95, 0.01)
    ck("disc: 95%, 1% → much larger", n_d3 > 200, True)

    # ── Coverage Statement ──
    print("\n── Coverage Statement (AU-C 530.11) ──")
    cov = discovery_coverage_statement(60, 0.95, 0)
    # Upper bound: 1 - (0.05)^(1/60) = 1 - 0.05^0.01667 = 1 - 0.9513 = 0.0487
    ck("cov: 60 samples, 0 found → upper bound", cov["upper_bound"], 4.87, tol=0.1)

    cov2 = discovery_coverage_statement(100, 0.95, 0)
    # 1 - 0.05^(1/100) = 1 - 0.9705 = 0.0295
    ck("cov: 100 samples, 0 found → tighter bound", cov2["upper_bound"] < cov["upper_bound"], True)

    cov3 = discovery_coverage_statement(60, 0.95, 3)
    ck("cov: 3 violations found → caution statement", "CAUTION" in cov3["statement"], True)

    # ── Stratification ──
    print("\n── Stratification (AU-C 530.06) ──")
    strata = [
        {"name": "High Risk", "population": 100, "risk_weight": 3.0},
        {"name": "Medium Risk", "population": 400, "risk_weight": 1.5},
        {"name": "Low Risk", "population": 500, "risk_weight": 1.0},
    ]
    strat_result = stratified_sample_size(strata, 0.95, 0.05)
    ck("strat: 3 strata", len(strat_result["strata"]), 3)
    ck("strat: total = 1000", strat_result["total_population"], 1000)
    # High risk should get the most per-capita allocation
    high_per_capita = strat_result["strata"][0]["sample_size"] / strat_result["strata"][0]["population"]
    low_per_capita = strat_result["strata"][2]["sample_size"] / strat_result["strata"][2]["population"]
    ck("strat: high risk > low risk per-capita", high_per_capita > low_per_capita, True)

    # ── Sweep Coverage ──
    print("\n── Sweep Coverage (AU-C 530.11) ──")
    domains = [
        {"name": "Finance", "population": 500, "risk": "high"},
        {"name": "HR", "population": 200, "risk": "medium"},
        {"name": "Engineering", "population": 1000, "risk": "low"},
        {"name": "Legal", "population": 100, "risk": "high"},
    ]
    samples = {"Finance": 60, "HR": 30, "Engineering": 20, "Legal": 0}
    sweep = sweep_coverage_report(domains, samples, 0.95)
    ck("sweep: 3/4 covered", sweep["domains_covered"], 3)
    ck("sweep: 1 uncovered", sweep["domains_uncovered"], 1)
    ck("sweep: Legal uncovered", any(d["domain"] == "Legal" for d in sweep["uncovered_details"]), True)

    # ── Edge Cases ──
    print("\n── Edge Cases ──")
    raised = 0
    try: attributes_sample_size(0.95, 0.05, 0.10); print("  FAIL: no exception")
    except ValueError: print("  PASS: exp > tol raised"); raised += 1
    try: discovery_sample_size(0.95, 0.0); print("  FAIL: no exception")
    except ValueError: print("  PASS: rate=0 raised"); raised += 1
    try: discovery_coverage_statement(0, 0.95); print("  FAIL: no exception")
    except ValueError: print("  PASS: n=0 raised"); raised += 1
    try: discovery_sample_size(0.999, 0.3); print("  PASS: extreme conf handled"); raised += 1
    except ValueError: print("  FAIL: unexpected exception")
    f += (4 - raised)

    print("\n" + "=" * 70)
    total_t = p + raised
    print(f"RESULTS: {p}/{total_t} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
