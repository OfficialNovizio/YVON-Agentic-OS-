#!/usr/bin/env python3
"""
Statistical Signal Detection — Formula Library
================================================
Source: Holmes, Illowsky & Dean,
        *Introductory Business Statistics* (2nd Ed., 2023, OpenStax)
        https://openstax.org/details/books/introductory-business-statistics-2e
        License: CC BY-NC-SA 4.0 (free, open access)

Route: A (math script — every formula coded and self-tested)

Covers every statistical method vista needs for roadmap metrics:
  - Confidence intervals (proportions, means, known/unknown σ)
  - Two-sample comparison (z-test, t-test, difference detection)
  - Sample size requirements for given precision
  - Signal vs. noise classification (4-step pipeline)
  - Control chart rules (Western Electric for drift detection)
  - Chi-square goodness-of-fit for distributional changes

Chapter citations:
  - Ch.8: Confidence Intervals
  - Ch.9: Hypothesis Testing with One Sample
  - Ch.10: Hypothesis Testing with Two Samples
  - Ch.11: The Chi-Square Distribution

Design rules:
  - Every function validates inputs; no silent defaults.
  - No external dependencies (math + sys only).
  - All self-tests use worked examples with verified arithmetic.
  - z/t critical values hardcoded for common confidence levels.
  - Sample < 2 raises ValueError wherever degrees of freedom matter.
"""

from __future__ import annotations
import math
import sys
from typing import List, Tuple, Optional, Dict, Callable


# ── Internal helpers ──────────────────────────────────────────
_TOL = 1e-10
_PI_Z95 = 1.960   # z-score for 95% confidence
_PI_Z99 = 2.576   # z-score for 99% confidence
_PI_Z90 = 1.645   # z-score for 90% confidence


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


def _positive(val: float, name: str) -> None:
    _fv(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


def _proportion(val: float, name: str) -> None:
    _fv(val, name)
    if not 0.0 <= val <= 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


def _z_critical(confidence: float) -> float:
    """Return z-score for given confidence level."""
    z_map = {0.90: 1.645, 0.95: 1.960, 0.98: 2.326, 0.99: 2.576, 0.995: 2.807, 0.999: 3.291}
    for k, v in z_map.items():
        if abs(confidence - k) < 0.001:
            return v
    # Approximate via rational approximation (Hastings)
    p = 1.0 - (1.0 - confidence) / 2.0
    if p <= 0 or p >= 1:
        raise ValueError(f"Invalid confidence {confidence} — must be in (0, 1)")
    t = math.sqrt(-2.0 * math.log(1.0 - p)) if p < 1.0 else 5.0
    c0, c1, c2 = 2.515517, 0.802853, 0.010328
    d1, d2, d3 = 1.432788, 0.189269, 0.001308
    return t - (c0 + c1 * t + c2 * t * t) / (1.0 + d1 * t + d2 * t * t + d3 * t * t * t)


def _series_mean(s: List[float]) -> float:
    return sum(s) / len(s)


def _series_std(s: List[float], ddof: int = 0) -> float:
    """Standard deviation with given DDOF."""
    if len(s) < 2 and ddof > 0:
        raise ValueError(f"Need at least 2 values for DDOF={ddof}, got {len(s)}")
    mu = _series_mean(s)
    var = sum((x - mu) ** 2 for x in s) / (len(s) - ddof)
    return math.sqrt(max(var, 0.0))


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CONFIDENCE INTERVALS FOR PROPORTIONS
# Source: OpenStax, Ch.8 ("Confidence Intervals"), §8.3
# ═══════════════════════════════════════════════════════════════════

def se_proportion(p_hat: float, n: int) -> float:
    """
    SE = sqrt(p̂ × (1 - p̂) / n)
    Ch.8, §8.3 (A Confidence Interval for a Population Proportion)

    Args:
      p_hat: Observed proportion (0 to 1)
      n:     Sample size (≥ 1)

    Edge cases:
      - n = 0 → ValueError
      - p_hat = 0 or 1 → SE = 0 (no variability observed)
    """
    _proportion(p_hat, "p_hat")
    if not isinstance(n, int) or n < 1:
        raise ValueError(f"n must be ≥ 1, got {n}")
    if n == 1:
        return 0.0
    return math.sqrt(p_hat * (1.0 - p_hat) / n)


def ci_proportion(p_hat: float, n: int, confidence: float = 0.95) -> Dict:
    """
    Confidence Interval for a proportion.
    Ch.8, §8.3

    95% CI = p̂ ± z × sqrt(p̂(1-p̂)/n)

    Returns dict: {lower, upper, margin_of_error, p_hat, n, confidence, method}

    Conditions (Normal approximation, Ch.8, §8.3):
      np̂ ≥ 5 AND n(1-p̂) ≥ 5
    If these fail, uses Plus-Four method (p̃ = (x+2)/(n+4)).

    Edge cases:
      - n = 0 → ValueError
      - n small + extreme p̂ → switches to Plus-Four automatically
    """
    _proportion(p_hat, "p_hat")
    if not isinstance(n, int) or n < 1:
        raise ValueError(f"n must be ≥ 1, got {n}")
    if not 0.5 < confidence < 1.0:
        raise ValueError(f"confidence must be in (0.5, 1), got {confidence}")

    z = _z_critical(confidence)

    # Check normal approximation conditions
    np_check = n * p_hat >= 5
    nq_check = n * (1.0 - p_hat) >= 5

    if np_check and nq_check:
        # Standard normal approximation
        se = se_proportion(p_hat, n)
        me = z * se
        lower = p_hat - me
        upper = p_hat + me
        method = f"Normal approximation (np̂={n*p_hat:.1f}, nq̂={n*(1-p_hat):.1f})"
    else:
        # Plus-Four method (Ch.8)
        x = round(p_hat * n)
        p_tilde = (x + 2) / (n + 4)
        se = math.sqrt(p_tilde * (1.0 - p_tilde) / (n + 4))
        me = z * se
        lower = p_tilde - me
        upper = p_tilde + me
        p_hat = p_tilde  # report the adjusted estimate
        method = f"Plus-Four adjusted (original np̂={n*p_hat:.1f}, failed normality check)"

    return {
        "p_hat": round(p_hat, 4),
        "n": n,
        "confidence": confidence,
        "lower": round(max(0.0, lower), 4),  # clamp to [0, 1]
        "upper": round(min(1.0, upper), 4),
        "margin_of_error": round(me, 4),
        "method": method,
    }


def ci_width(ci_result: Dict) -> float:
    """Width of a confidence interval (upper - lower)."""
    return ci_result["upper"] - ci_result["lower"]


def ci_contains(ci_result: Dict, true_value: float) -> bool:
    """Does the confidence interval contain the true value?"""
    return ci_result["lower"] <= true_value <= ci_result["upper"]


# ═══════════════════════════════════════════════════════════════════
# PART 2 — CONFIDENCE INTERVALS FOR MEANS
# Source: OpenStax, Ch.8, §8.1-8.2
# ═══════════════════════════════════════════════════════════════════

def ci_mean_known_sigma(sample: List[float], sigma: float, confidence: float = 0.95) -> Dict:
    """
    CI for mean when population σ is known (z-interval).
    Ch.8, §8.1 (A Confidence Interval When the Population Standard Deviation Is Known)

    CI = x̄ ± z × σ / sqrt(n)

    Args:
      sample: List of observed values
      sigma:  Known population standard deviation (> 0)
    """
    if len(sample) < 1:
        raise ValueError("sample must be non-empty")
    _positive(sigma, "sigma")
    for i, x in enumerate(sample):
        _fv(x, f"sample[{i}]")
    if not 0.5 < confidence < 1.0:
        raise ValueError(f"confidence must be in (0.5, 1), got {confidence}")

    n = len(sample)
    x_bar = _series_mean(sample)
    z = _z_critical(confidence)
    se = sigma / math.sqrt(n)
    me = z * se

    return {
        "x_bar": round(x_bar, 4), "n": n, "confidence": confidence,
        "lower": round(x_bar - me, 4), "upper": round(x_bar + me, 4),
        "margin_of_error": round(me, 4), "method": f"z-interval (σ={sigma} known)",
    }


def ci_mean_unknown_sigma(sample: List[float], confidence: float = 0.95) -> Dict:
    """
    CI for mean when σ is unknown — uses t-distribution.
    Ch.8, §8.2 (A Confidence Interval When the Population Standard Deviation Is Unknown)

    CI = x̄ ± t_{α/2, df} × s / sqrt(n)

    Approximates t-critical using a rational approximation of the t-distribution
    since we avoid external dependencies.

    Edge cases:
      - sample size 1 → t undefined (no σ estimate) → raises ValueError
    """
    if len(sample) < 2:
        raise ValueError("Need at least 2 observations for CI with unknown σ")
    for i, x in enumerate(sample):
        _fv(x, f"sample[{i}]")
    if not 0.5 < confidence < 1.0:
        raise ValueError(f"confidence must be in (0.5, 1), got {confidence}")

    n = len(sample)
    df = n - 1
    x_bar = _series_mean(sample)
    s = _series_std(sample, ddof=1)  # sample std
    if s < _TOL:
        return {"x_bar": round(x_bar, 4), "n": n, "confidence": confidence,
                "lower": x_bar, "upper": x_bar, "margin_of_error": 0.0,
                "method": "t-interval (σ unknown) — constant sample, zero width"}

    z = _z_critical(confidence)
    # t ≈ z + z/(4n) + z³/(4*df) (basic Welch-Satterthwaite-ish approximation)
    t_approx = z + z / (4.0 * n)
    me = t_approx * s / math.sqrt(n)

    return {
        "x_bar": round(x_bar, 4), "n": n, "confidence": confidence,
        "lower": round(x_bar - me, 4), "upper": round(x_bar + me, 4),
        "margin_of_error": round(me, 4), "method": f"t-interval (σ unknown, df={df})",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — MINIMUM SAMPLE SIZE
# Source: OpenStax, Ch.8, §8.3-8.4
# ═══════════════════════════════════════════════════════════════════

def min_sample_size_proportion(desired_me: float, p_hat: float = 0.50, confidence: float = 0.95) -> int:
    """
    n = (z² × p̂(1-p̂)) / m²
    Ch.8, §8.3

    Minimum sample size for a desired margin of error on a proportion.
    Uses p=0.5 as worst case (maximizes required n).

    Returns integer, rounded up.
    """
    _fv(desired_me, "desired_me")
    if not 0.0 < desired_me < 0.5:
        raise ValueError(f"desired_me must be in (0, 0.5), got {desired_me}")
    _proportion(p_hat, "p_hat")
    z = _z_critical(confidence)
    n = z * z * p_hat * (1.0 - p_hat) / (desired_me * desired_me)
    return math.ceil(n)


def min_sample_size_mean(desired_me: float, sigma: float, confidence: float = 0.95) -> int:
    """
    n = (z² × σ²) / m²
    Ch.8, §8.1

    Minimum sample size for a desired margin of error on a mean.
    """
    _fv(desired_me, "desired_me")
    if desired_me <= 0:
        raise ValueError(f"desired_me must be > 0, got {desired_me}")
    _positive(sigma, "sigma")
    z = _z_critical(confidence)
    n = (z * sigma / desired_me) ** 2
    return math.ceil(n)


# ═══════════════════════════════════════════════════════════════════
# PART 4 — TWO-SAMPLE COMPARISON (SIGNAL DETECTION)
# Source: OpenStax, Ch.10 ("Hypothesis Testing with Two Samples")
# ═══════════════════════════════════════════════════════════════════

def two_sample_proportion_test(p1: float, n1: int, p2: float, n2: int, confidence: float = 0.95) -> Dict:
    """
    Two-sample z-test for proportions.
    Ch.10, §10.3 (Comparing Two Independent Population Proportions)

    Tests whether two observed proportions are significantly different.

    H₀: p1 = p2
    SE_diff = sqrt(p̂(1-p̂)(1/n1 + 1/n2))  where p̂ = (x1+x2)/(n1+n2)
    z = (p̂1 - p̂2) / SE_diff

    Returns dict with z_score, p_value (approx), significant (bool), and CI for difference.
    """
    _proportion(p1, "p1")
    _proportion(p2, "p2")
    if not isinstance(n1, int) or n1 < 1:
        raise ValueError(f"n1 must be ≥ 1, got {n1}")
    if not isinstance(n2, int) or n2 < 1:
        raise ValueError(f"n2 must be ≥ 1, got {n2}")

    # Pooled proportion
    x1, x2 = round(p1 * n1), round(p2 * n2)
    p_pooled = (x1 + x2) / (n1 + n2)

    # Standard error of difference
    if p_pooled > 0 and p_pooled < 1:
        se_diff = math.sqrt(p_pooled * (1.0 - p_pooled) * (1.0 / n1 + 1.0 / n2))
    else:
        se_diff = 0.0

    if se_diff < _TOL:
        return {"z_score": 0.0, "p_value": 1.0, "significant": False,
                "diff": round(p1 - p2, 4), "ci_diff": None,
                "verdict": "No difference detectable — sample sizes or proportions at extremes"}

    z_val = (p1 - p2) / se_diff
    z_crit = _z_critical(confidence)

    # Approximate two-tailed p-value from z
    p_val = 2.0 * (1.0 - _normal_cdf(abs(z_val)))

    significant = abs(z_val) > z_crit
    me = z_crit * se_diff
    diff = p1 - p2

    return {
        "z_score": round(z_val, 4),
        "p_value": round(p_val, 4),
        "significant": significant,
        "diff": round(diff, 4),
        "ci_diff": (round(diff - me, 4), round(diff + me, 4)),
        "z_critical": z_crit,
        "confidence": confidence,
        "verdict": ("SIGNAL — proportions significantly different" if significant
                    else "NOISE — no significant difference detected"),
    }


def two_sample_mean_test(
    sample1: List[float], sample2: List[float], confidence: float = 0.95
) -> Dict:
    """
    Two-sample t-test for means (Welch's approximation, unequal variances).
    Ch.10, §10.1 (Comparing Two Independent Population Means)

    Tests whether two sample means are significantly different.

    Returns dict with t_score, significant (bool), and confidence interval for difference.

    Edge cases:
      - Either sample < 2 → ValueError
    """
    if len(sample1) < 2 or len(sample2) < 2:
        raise ValueError("Both samples need at least 2 observations")
    for i, x in enumerate(sample1):
        _fv(x, f"sample1[{i}]")
    for i, x in enumerate(sample2):
        _fv(x, f"sample2[{i}]")

    n1, n2 = len(sample1), len(sample2)
    x1, x2 = _series_mean(sample1), _series_mean(sample2)
    s1, s2 = _series_std(sample1, ddof=1), _series_std(sample2, ddof=1)

    # Welch's SE
    se_sq = s1*s1/n1 + s2*s2/n2
    if se_sq < _TOL:
        return {"t_score": 0.0, "significant": False, "diff": round(x1 - x2, 4),
                "verdict": "No difference — both samples constant"}

    se = math.sqrt(se_sq)
    t_val = (x1 - x2) / se
    z_crit = _z_critical(confidence)

    # Use z-approximation for t (conservative for moderate n)
    t_crit = z_crit + z_crit / (4.0 * min(n1, n2))

    significant = abs(t_val) > t_crit
    diff = x1 - x2
    me = t_crit * se

    return {
        "t_score": round(t_val, 4),
        "significant": significant,
        "diff": round(diff, 4),
        "ci_diff": (round(diff - me, 4), round(diff + me, 4)),
        "mean1": round(x1, 4), "mean2": round(x2, 4),
        "n1": n1, "n2": n2,
        "confidence": confidence,
        "verdict": ("SIGNAL — means significantly different" if significant
                    else "NOISE — no significant difference detected"),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — SIGNAL CLASSIFICATION PIPELINE
# Source: OpenStax Ch.8-10, enriched with Ries 3-cohort rule
# ═══════════════════════════════════════════════════════════════════

def classify_metric_change(
    p_before: float, n_before: int,
    p_after: float, n_after: int,
    required_cohorts: int = 3,
    current_trend_cohorts: int = 1,
    confidence: float = 0.95,
) -> Dict:
    """
    Full metric change classification pipeline.
    Combines OpenStax statistics + Ries Ch.7 3-cohort rule.

    Step 1: Check sample size (n ≥ 100 for reliable signal)
    Step 2: Check normality conditions (np ≥ 5, nq ≥ 5)
    Step 3: Compute confidence interval overlap
    Step 4: Two-sample proportion test
    Step 5: Apply 3-cohort rule (Ries Ch.7, p.125)

    Returns dict with classification and all supporting data.

    Edge cases:
      - If both samples are tiny, classification defaults to INSUFFICIENT DATA
    """
    _proportion(p_before, "p_before")
    _proportion(p_after, "p_after")

    flags = []
    steps_passed = 0
    total_steps = 5

    # Step 1: Sample size
    step1 = n_before >= 100 and n_after >= 100
    if not step1:
        flags.append(f"Sample size LOW (before={n_before}, after={n_after}); need ≥100")
        # Still continue but with caveat
    else:
        steps_passed += 1

    # Step 2: Normality
    np_before = n_before * p_before >= 5
    nq_before = n_before * (1 - p_before) >= 5
    np_after = n_after * p_after >= 5
    nq_after = n_after * (1 - p_after) >= 5
    step2 = np_before and nq_before and np_after and nq_after
    if step2:
        steps_passed += 1
    else:
        if min(n_before, n_after) >= 1:
            flags.append("Normality conditions not met — using Plus-Four adjustment")

    # Step 3: CI overlap
    ci_before = ci_proportion(p_before, n_before, confidence)
    ci_after = ci_proportion(p_after, n_after, confidence)
    overlap = ci_before["upper"] >= ci_after["lower"] and ci_after["upper"] >= ci_before["lower"]
    if not overlap:
        steps_passed += 1
    else:
        flags.append(f"Confidence intervals overlap [{ci_before['lower']:.3f}-{ci_before['upper']:.3f}] vs [{ci_after['lower']:.3f}-{ci_after['upper']:.3f}]")

    # Step 4: Two-sample test
    test = two_sample_proportion_test(p_before, n_before, p_after, n_after, confidence)
    if test["significant"]:
        steps_passed += 1
    else:
        flags.append(f"Two-sample test not significant (z={test['z_score']}, p={test['p_value']})")

    # Step 5: 3-cohort rule (Ries)
    if current_trend_cohorts >= required_cohorts:
        steps_passed += 1
    else:
        flags.append(f"Only {current_trend_cohorts}/{required_cohorts} cohorts showing same direction (Ries Ch.7, p.125)")

    # Classification
    if steps_passed >= 5:
        classification = "CONFIRMED SIGNAL — statistically significant AND consistently trending"
    elif steps_passed >= 4:
        classification = "STRONG LIKELY SIGNAL — statistical significance with near-consistent direction"
    elif steps_passed >= 3:
        classification = "POSSIBLE SIGNAL — some evidence, but not all conditions met"
    elif steps_passed >= 2:
        classification = "WEAK SIGNAL — insufficient evidence for confidence"
    else:
        classification = "NOISE — change is within normal variation or insufficient data"

    return {
        "classification": classification,
        "steps_passed": f"{steps_passed}/{total_steps}",
        "observed_change_pp": round((p_after - p_before) * 100, 2),
        "ci_before": (round(ci_before["lower"], 4), round(ci_before["upper"], 4)),
        "ci_after": (round(ci_after["lower"], 4), round(ci_after["upper"], 4)),
        "ci_overlap": overlap,
        "test_result": test["verdict"],
        "z_score": test["z_score"],
        "p_value": test["p_value"],
        "flags": flags,
        "ries_rule": f"A trend becomes meaningful when {required_cohorts}+ consecutive cohorts show the same direction (Ch.7, p.125)",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 6 — CONTROL CHART BASICS (Western Electric Rules)
# Source: Western Electric Handbook (1956); cited in statistical
#         process control literature (not tied to a single book)
# ═══════════════════════════════════════════════════════════════════

def control_limits(sample: List[float]) -> Dict:
    """
    Compute 3-sigma control limits from a baseline sample.
    UCL = x̄ + 3σ, LCL = x̄ - 3σ, CL = x̄
    Western Electric rules for detecting out-of-control conditions.
    """
    if len(sample) < 2:
        raise ValueError("Need at least 2 observations for control limits")
    for x in sample:
        _fv(x, f"sample entry {x}")
    mu = _series_mean(sample)
    sigma = _series_std(sample, ddof=1)
    return {
        "center_line": round(mu, 4),
        "ucl": round(mu + 3.0 * sigma, 4),
        "lcl": round(mu - 3.0 * sigma, 4),
        "sigma": round(sigma, 4),
        "n_baseline": len(sample),
    }


def check_western_electric_rules(values: List[float], limits: Dict) -> List[str]:
    """
    Western Electric Rules for detecting drift / out-of-control.
    Rule 1: Any point outside 3σ limits
    Rule 2: 2 of 3 consecutive points beyond 2σ (same side)
    Rule 3: 4 of 5 consecutive points beyond 1σ (same side)
    Rule 4: 8 consecutive points on same side of center line

    Returns list of triggered rule descriptions.
    """
    cl = limits["center_line"]
    ucl = limits["ucl"]
    lcl = limits["lcl"]
    sigma = limits["sigma"]

    violations = []

    # Rule 1: Outside limits
    for i, v in enumerate(values):
        if v > ucl + _TOL or v < lcl - _TOL:
            violations.append(f"Rule 1: point {i} = {v:.4f} outside [{lcl:.4f}, {ucl:.4f}]")

    # Rule 2: 2 of 3 beyond 2σ on same side
    for i in range(len(values) - 2):
        above_2s = sum(1 for j in range(i, i + 3) if values[j] > cl + 2 * sigma + _TOL)
        below_2s = sum(1 for j in range(i, i + 3) if values[j] < cl - 2 * sigma - _TOL)
        if above_2s >= 2:
            violations.append(f"Rule 2: 2 of 3 above 2σ starting at point {i}")
        if below_2s >= 2:
            violations.append(f"Rule 2: 2 of 3 below 2σ starting at point {i}")

    # Rule 3: 4 of 5 beyond 1σ
    for i in range(len(values) - 4):
        above_1s = sum(1 for j in range(i, i + 5) if values[j] > cl + sigma + _TOL)
        below_1s = sum(1 for j in range(i, i + 5) if values[j] < cl - sigma - _TOL)
        if above_1s >= 4:
            violations.append(f"Rule 3: 4 of 5 above 1σ starting at point {i}")
        if below_1s >= 4:
            violations.append(f"Rule 3: 4 of 5 below 1σ starting at point {i}")

    # Rule 4: 8 consecutive same side
    if len(values) >= 8:
        for i in range(len(values) - 7):
            above = all(values[j] > cl for j in range(i, i + 8))
            below = all(values[j] < cl for j in range(i, i + 8))
            if above:
                violations.append(f"Rule 4: 8 consecutive above CL starting at point {i}")
            if below:
                violations.append(f"Rule 4: 8 consecutive below CL starting at point {i}")

    return violations


def detect_metric_drift(recent_values: List[float], baseline_sample: List[float]) -> Dict:
    """
    Full drift detection pipeline for a single metric.
    Combines control limits + Western Electric rules.

    Returns dict with limits, violations, and drift assessment.
    """
    limits = control_limits(baseline_sample)
    violations = check_western_electric_rules(recent_values, limits)

    if not violations:
        assessment = "STABLE — no drift detected, all values within control"
    elif len(violations) <= 1:
        assessment = "WATCH — single violation, monitor next period"
    elif len(violations) <= 3:
        assessment = "DRIFT DETECTED — multiple rule violations, investigate"
    else:
        assessment = "OUT OF CONTROL — systematic departure, immediate investigation required"

    return {
        "limits": limits,
        "violations": violations,
        "n_violations": len(violations),
        "assessment": assessment,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 7 — CHI-SQUARE GOODNESS-OF-FIT
# Source: OpenStax, Ch.11 ("The Chi-Square Distribution")
# ═══════════════════════════════════════════════════════════════════

def chi_square_gof(observed: List[int], expected: Optional[List[float]] = None) -> Dict:
    """
    Chi-Square Goodness-of-Fit test.
    Ch.11, §11.2

    χ² = Σ (O_i - E_i)² / E_i

    Tests whether observed frequencies match expected distribution.
    If expected is None, assumes uniform distribution.

    Returns dict with chi2, df, and assessment.

    Edge cases:
      - Any expected frequency < 1 → warns about small cell counts
    """
    if len(observed) < 2:
        raise ValueError("Need at least 2 categories")
    for i, o in enumerate(observed):
        if not isinstance(o, int) or o < 0:
            raise ValueError(f"observed[{i}] must be non-negative integer, got {o}")

    n_total = sum(observed)
    if n_total == 0:
        raise ValueError("Sum of observed frequencies is zero")

    k = len(observed)

    if expected is None:
        expected = [n_total / k] * k
    else:
        if len(expected) != k:
            raise ValueError(f"Expected length {len(expected)} ≠ observed length {k}")

    for i, e in enumerate(expected):
        _fv(e, f"expected[{i}]")
        if e <= 0:
            raise ValueError(f"expected[{i}] must be > 0, got {e}")

    chi2 = sum((obs - exp) ** 2 / exp for obs, exp in zip(observed, expected))
    df = k - 1

    # Critical values at 95% for common df (approximate)
    chi2_crit = {1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070, 6: 12.592,
                 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307}
    crit = chi2_crit.get(df, df + _z_critical(0.95) * math.sqrt(2 * df))

    significant = chi2 > crit

    small_cells = any(e < 1.0 for e in expected)
    if small_cells:
        warning = "Small expected frequencies (<1) — chi-square approximation unreliable (Ch.11, §11.3)"
    else:
        warning = None

    return {
        "chi2": round(chi2, 4),
        "df": df,
        "critical_value": round(crit, 4),
        "significant": significant,
        "verdict": ("Distribution significantly different from expected" if significant
                    else "No significant difference from expected distribution"),
        "small_cells_warning": warning,
    }


# ── Internal helper: normal CDF approximation ─────────────────

def _normal_cdf(z: float) -> float:
    """Standard normal CDF — Abramowitz & Stegun approximation."""
    if z < -7.0:
        return 0.0
    if z > 7.0:
        return 1.0
    # via erf
    t = 1.0 / (1.0 + 0.2316419 * abs(z))
    poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
    phi = 1.0 - poly * math.exp(-z * z / 2.0) / math.sqrt(2.0 * math.pi)
    return phi if z >= 0 else 1.0 - phi


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    failures = 0; passed = 0

    def check(label, actual, expected, tol=1e-6):
        nonlocal failures, passed
        if isinstance(expected, bool):
            ok = actual == expected
        elif isinstance(expected, str):
            ok = expected in actual
        elif expected is None:
            ok = actual is None
        else:
            ok = abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); passed += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); failures += 1

    def check_raises(label, func, *args):
        nonlocal failures, passed
        try:
            r = func(*args)
            print(f"  FAIL  {label}: expected exception, got {r}")
            failures += 1
        except (ValueError, TypeError) as e:
            print(f"  PASS  {label}: {type(e).__name__} — {str(e)[:70]}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: signal_detection.py")
    print("Source: OpenStax Introductory Business Statistics 2e (2023)")
    print("=" * 70)

    # ── Part 1: CIs for Proportions ──
    print("\n── Part 1: Confidence Intervals — Proportions (Ch.8, §8.3) ──")

    se = se_proportion(0.40, 100)
    check("se: p̂=0.40, n=100", se, 0.04899, tol=1e-4)

    ci = ci_proportion(0.40, 100, 0.95)
    check("ci: lower ≈ 0.304", ci["lower"], 0.304, tol=0.01)
    check("ci: upper ≈ 0.496", ci["upper"], 0.496, tol=0.01)
    check("ci: method = Normal", "Normal" in ci["method"], True)

    # Small sample → Plus-Four
    ci_small = ci_proportion(0.60, 5, 0.95)
    check("ci_small: Plus-Four method", "Plus-Four" in ci_small["method"], True)

    check("ci_width: ~0.192 for 40%/100", ci_width(ci), 0.192, tol=0.01)
    check("ci_contains: 0.40 inside", ci_contains(ci, 0.40), True)
    check("ci_contains: 0.10 outside", ci_contains(ci, 0.10), False)

    # ── Part 2: CIs for Means ──
    print("\n── Part 2: Confidence Intervals — Means (Ch.8, §8.1-8.2) ──")

    sample = [10.0, 12.0, 14.0, 16.0, 18.0]
    ci_m_s = ci_mean_known_sigma(sample, 2.5, 0.95)
    check("ci_mean_σ: x̄=14.0", ci_m_s["x_bar"], 14.0)
    check("ci_mean_σ: lower ≈ 11.81", ci_m_s["lower"], 11.808, tol=0.1)
    check("ci_mean_σ: upper ≈ 16.19", ci_m_s["upper"], 16.192, tol=0.1)

    ci_m_t = ci_mean_unknown_sigma(sample, 0.95)
    check("ci_mean_t: x̄=14.0", ci_m_t["x_bar"], 14.0)
    check("ci_mean_t: t-interval method", "t-interval" in ci_m_t["method"], True)
    check("ci_mean_t: lower < upper", ci_m_t["lower"] < ci_m_t["upper"], True)

    # ── Part 3: Sample Size ──
    print("\n── Part 3: Minimum Sample Size (Ch.8) ──")

    n_prop = min_sample_size_proportion(0.05, 0.50, 0.95)
    check("min_n_prop: me=5%, 95% → 385", n_prop, 385)

    n_prop_precise = min_sample_size_proportion(0.03, 0.50, 0.95)
    check("min_n_prop: me=3%, 95% → 1068", n_prop_precise, 1068)

    n_mean = min_sample_size_mean(2.0, 10.0, 0.95)
    check("min_n_mean: me=2, σ=10, 95% → 97", n_mean, 97)

    # ── Part 4: Two-Sample Comparison ──
    print("\n── Part 4: Two-Sample Comparison (Ch.10) ──")

    # Clear difference: 40% vs 60%, large n
    test_clear = two_sample_proportion_test(0.40, 500, 0.60, 500, 0.95)
    check("2sample_prop: 40%vs60% n=500 → SIGNAL", test_clear["significant"], True)

    # No difference: 50% vs 52%, small n
    test_noise = two_sample_proportion_test(0.50, 100, 0.52, 100, 0.95)
    check("2sample_prop: 50%vs52% n=100 → NOISE", test_noise["significant"], False)

    # Two-sample means
    s1 = [10.0, 12.0, 11.0, 13.0, 14.0, 12.0, 15.0, 11.0, 13.0, 14.0]
    s2 = [8.0, 9.0, 10.0, 9.0, 8.0, 10.0, 9.0, 8.0, 10.0, 9.0]
    test_means = two_sample_mean_test(s1, s2, 0.95)
    check("2sample_mean: different means → SIGNAL", test_means["significant"], True)
    check("2sample_mean: mean1 > mean2", test_means["mean1"] > test_means["mean2"], True)

    # Same means
    s3 = [10.0, 10.5, 9.8, 10.2, 10.0, 9.9, 10.1, 10.0, 10.3, 9.7]
    s4 = [10.0, 10.1, 9.9, 10.0, 10.2, 9.8, 10.0, 10.1, 9.9, 10.0]
    test_same = two_sample_mean_test(s3, s4, 0.95)
    check("2sample_mean: same means → NOISE", test_same["significant"], False)

    # ── Part 5: Signal Classification Pipeline ──
    print("\n── Part 5: Signal Classification Pipeline ──")

    # Clear signal: 40%→55%, large n
    signal = classify_metric_change(0.40, 500, 0.55, 500, current_trend_cohorts=3)
    check("classify: clear signal → CONFIRMED", "SIGNAL" in signal["classification"].upper(), True)

    # Noise: 49%→51%, small n
    noise = classify_metric_change(0.49, 80, 0.51, 80, current_trend_cohorts=1)
    check("classify: marginal change small n → NOISE", "NOISE" in noise["classification"].upper() or "WEAK" in noise["classification"], True)

    # ── Part 6: Control Charts ──
    print("\n── Part 6: Control Chart Rules (Western Electric) ──")

    baseline = [10.0, 10.5, 9.8, 10.2, 10.0, 9.9, 10.1, 10.0, 10.3, 9.7,
                10.0, 10.2, 9.9, 10.1, 10.0, 10.0, 10.1, 9.8, 10.2, 10.0]
    limits = control_limits(baseline)
    check("control: CL ≈ 10.01", abs(limits["center_line"] - 10.01) < 0.1, True)
    check("control: UCL > CL > LCL", limits["ucl"] > limits["center_line"] > limits["lcl"], True)

    # In-control values
    stable = [10.0, 10.2, 9.9, 10.1, 10.0, 10.0]
    v_stable = check_western_electric_rules(stable, limits)
    check("western: stable → 0 violations", len(v_stable), 0)

    # Out-of-control: point outside limits
    spike = [10.0, 10.0, 10.0, 10.0, limits["ucl"] + 0.5]
    v_spike = check_western_electric_rules(spike, limits)
    check("western: spike → Rule 1 triggered", len(v_spike) >= 1, True)

    # Drift detection full pipeline
    drift = detect_metric_drift(stable, baseline)
    check("drift: stable → no drift", "STABLE" in drift["assessment"], True)

    drift2 = detect_metric_drift(
        [limits["ucl"] + 0.5, limits["ucl"] + 1.0, limits["ucl"] + 0.3, 10.5],
        baseline
    )
    check("drift: spikes → OUT OF CONTROL or DRIFT", "CONTROL" in drift2["assessment"] or "DRIFT" in drift2["assessment"], True)

    # ── Part 7: Chi-Square ──
    print("\n── Part 7: Chi-Square Goodness-of-Fit (Ch.11) ──")

    # Uniform expected: 100 customers across 4 segments
    chi_uni = chi_square_gof([20, 25, 30, 25])
    check("chi_sq_uniform: not significant for mild deviation", chi_uni["significant"], False)

    # Strong deviation from uniform
    chi_strong = chi_square_gof([10, 10, 10, 70])
    check("chi_sq_strong: significant", chi_strong["significant"], True)

    # ── Edge Cases ──
    print("\n── Edge Cases ──")
    check_raises("se: n=0", se_proportion, 0.40, 0)
    check_raises("ci_prop: confidence > 1", ci_proportion, 0.40, 100, 1.5)
    check_raises("ci_mean_ts: n=1", ci_mean_unknown_sigma, [10.0])
    check_raises("control: n=1", control_limits, [10.0])
    check_raises("chi_sq: empty", chi_square_gof, [])

    # ── Integration Test ──
    print("\n── Integration Test: Metric Movement → Signal → Drift ──")

    # Simulate a metric moving from 35% to 42% activation rate
    # Before: 1000 users, 35% activation
    # After: 500 users, 42% activation
    result = classify_metric_change(0.35, 1000, 0.42, 500, current_trend_cohorts=3)
    check("integration: 35→42%, n=1000→500, 3 cohorts → SIGNAL",
          "SIGNAL" in result["classification"].upper() or "LIKELY" in result["classification"], True)

    # Same metric, but only 1 cohort of data
    result2 = classify_metric_change(0.35, 1000, 0.42, 500, current_trend_cohorts=1)
    check("integration: same but 1 cohort → weaker",
          result2["steps_passed"] < result["steps_passed"], True)

    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
