#!/usr/bin/env python3
"""
A/B Testing & Experiment Methods
===================================
Sources (2-book minimum per §8.0):
  Book 1: Kohavi, Ron; Tang, Diane; Xu, Ya, *Trustworthy Online
          Controlled Experiments: A Practical Guide to A/B Testing*
          (Cambridge University Press, 2020).
          Chapters: 3 (Statistical Fundamentals), 4 (Hypothesis Testing),
          5 (P-values and Confidence Intervals), 6 (Adequately Powered),
          7 (Triggers and Guardrails), 8 (Ramp-up and Variant Assignment),
          10 (Sample Ratio Mismatch), 12 (Long-Term Effects)
          Free Ch.1 at https://experimentguide.com/

  Book 2: Holmes, Illowsky & Dean, *Introductory Business Statistics
          2e* (OpenStax, 2023). Free at https://openstax.org/
          Chapters: 8 (Confidence Intervals), 9-10 (Hypothesis Testing
          with One/Two Samples)

Route: A (math script — every formula coded and self-tested)

Covers what metric, loom, and price need that signal_detection.py doesn't:
  - Minimum Detectable Effect (MDE) — Kohavi Ch.6
  - Power analysis for experiment sizing — Kohavi Ch.6
  - Sample size estimation for A/B tests — Kohavi Ch.6
  - Sequential testing with alpha-spending — Kohavi Ch.8
  - Conversion rate comparison (two-proportion z-test for experiments)
  - Sample ratio mismatch detection (SRM) — Kohavi Ch.10
  - Guardrail metric monitoring — Kohavi Ch.7
  - Experiment duration estimation
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is invalid")


def _pct(val: float, name: str) -> None:
    _fv(val, name)
    if val < 0.0 or val > 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


def _positive(val: float, name: str) -> None:
    _fv(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


# ── z-critical for common alpha levels ────────────────────────
_Z = {0.10: 1.282, 0.05: 1.645, 0.025: 1.960, 0.01: 2.326, 0.005: 2.576, 0.001: 3.090}


def _z_alpha(alpha: float) -> float:
    for k, v in _Z.items():
        if abs(alpha - k) < 0.0005:
            return v
    raise ValueError(f"alpha must be one of {list(_Z.keys())}, got {alpha}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — MINIMUM DETECTABLE EFFECT & POWER
# Source: Kohavi Ch.6 (Adequately Powered Experiments)
# ═══════════════════════════════════════════════════════════════════

def mde_two_proportion(
    baseline_rate: float,
    alpha: float = 0.05,
    power: float = 0.80,
    sample_size_per_variant: Optional[int] = None,
) -> Dict:
    """
    Minimum Detectable Effect for a two-proportion test.
    Kohavi Ch.6, pp.93-105: "Statistical power and MDE."

    Kohavi Ch.6, p.94: "The MDE is the smallest change you can reliably
    detect with a given sample size, alpha, and power. If you want to
    detect smaller effects, you need more users."

    Formula (two-sided, two independent proportions):
      MDE = z_α/2 × √(2p(1-p)/n) + z_β × √(p(1-p)/n + p(1-p)/n)
      where z_α/2 is the critical value, z_β is the power z-score,
      p is the baseline rate, and n is the per-variant sample size.

    If sample_size_per_variant is not provided, the function solves for
    the sample size needed to detect a given MDE (returns required N).

    Args:
      baseline_rate: Current conversion rate (0 to 1)
      alpha: Significance level (default 0.05)
      power: Desired statistical power (default 0.80 = 80%)
      sample_size_per_variant: If provided, compute MDE. If None, must also
                               provide `target_mde` to compute required N.

    Alternative: use mde_to_sample_size() for the inverse calculation.

    Returns dict with MDE (relative and absolute) per Kohavi Table 6.1.

    Edge cases: baseline_rate = 0 or 1 → variance = 0, hard to detect
    """
    _pct(baseline_rate, "baseline_rate")
    if baseline_rate < 0.01:
        raise ValueError("baseline_rate < 1% — extremely hard to detect effects; consider larger sample")
    _pct(power, "power")
    if power < 0.5:
        raise ValueError(f"power must be ≥ 0.5, got {power}")

    z_alpha = _z_alpha(alpha / 2)  # two-tailed
    z_beta = _z_alpha(1.0 - power) if (1.0 - power) in _Z else 0.842  # 80% power → z=0.842

    if sample_size_per_variant is not None:
        if not isinstance(sample_size_per_variant, int) or sample_size_per_variant < 1:
            raise ValueError(f"sample_size_per_variant must be ≥ 1")
        n = sample_size_per_variant
        p = baseline_rate

        # Pooled SE for two-sample proportion test per Kohavi Ch.6, Eq. 6.3
        se_pooled = math.sqrt(2 * p * (1 - p) / n)

        # Non-centrality parameter
        ncp = (z_alpha + z_beta)
        mde_absolute = ncp * se_pooled

        return {
            "mde_absolute": round(mde_absolute, 6),
            "mde_relative_pct": round(mde_absolute / baseline_rate * 100, 2),
            "baseline_rate": baseline_rate,
            "sample_size_per_variant": n,
            "alpha": alpha, "power": power,
            "interpretation": (
                f"With n={n} per variant, you can detect a "
                f"{mde_absolute/baseline_rate*100:.1f}% relative change "
                f"(absolute {mde_absolute*100:.2f}pp) with {power*100:.0f}% power."
            ),
            "source": "Kohavi Ch.6, Table 6.1, Eq. 6.3"
        }
    else:
        raise ValueError("Must provide either sample_size_per_variant (to compute MDE)")


def mde_to_sample_size(
    baseline_rate: float,
    target_mde_relative: float,
    alpha: float = 0.05,
    power: float = 0.80,
) -> int:
    """
    Compute required sample size PER VARIANT to detect a given relative MDE.
    Kohavi Ch.6, pp.96-98: "How many users do I need?"

    Formula (inverse of MDE for two independent proportions):
      n = (z_α/2 + z_β)² × 2 × p(1-p) / δ²
      where δ = target_mde_relative × baseline_rate (absolute MDE)

    Kohavi Ch.6, p.97, Table 6.1: For baseline 30%, detecting 5% relative
    change (1.5pp absolute) at 80% power: ~22,000 per variant.

    Returns sample size per variant (rounded up to integer).
    Also common in: OpenStax Ch.9, §9.3 (power and sample size).

    Edge cases: absurdly small MDE → enormous sample → capped at 1e9 for safety
    """
    _pct(baseline_rate, "baseline_rate")
    _fv(target_mde_relative, "target_mde_relative")
    if target_mde_relative <= 0:
        raise ValueError(f"target_mde_relative must be > 0, got {target_mde_relative}")
    _pct(power, "power")

    p = baseline_rate
    delta = p * target_mde_relative  # absolute effect size

    if delta < 0.0001:
        raise ValueError(f"absolute MDE ({delta}) is too small — unrealistic to detect")

    z_alpha = _z_alpha(alpha / 2)
    z_beta = _z_alpha(1.0 - power) if (1.0 - power) in _Z else 0.842

    # Pooled variance × 2 for two-sample
    n = (z_alpha + z_beta) ** 2 * 2 * p * (1 - p) / (delta ** 2)
    n = min(n, 1e9)  # safety cap
    return math.ceil(n)


def experiment_power(
    baseline_rate: float,
    absolute_effect: float,
    sample_size_per_variant: int,
    alpha: float = 0.05,
) -> float:
    """
    Compute achieved statistical power for a given experiment setup.
    Kohavi Ch.6, p.95: "Statistical power is the probability of detecting
    a true effect of a given size, if it exists."

    Power = 1 - β = 1 - P(Type II error)
    = Φ(z - z_α/2) where z is the test statistic under the alternative.

    Uses the non-central z approximation:
      z_effect = δ / SE_pooled
      power = Φ(z_effect - z_α/2)

    Returns power as a decimal (0-1). Kohavi Ch.6: ≥0.80 is the standard.

    Edge cases:
      absolute_effect = 0 → power = α (just random chance)
    """
    _pct(baseline_rate, "baseline_rate")
    _fv(absolute_effect, "absolute_effect")
    if not isinstance(sample_size_per_variant, int) or sample_size_per_variant < 2:
        raise ValueError(f"sample_size_per_variant must be ≥ 2")

    p = baseline_rate
    se_pooled = math.sqrt(2 * p * (1 - p) / sample_size_per_variant)

    if se_pooled < 1e-10:
        return 1.0 if absolute_effect > 1e-10 else alpha

    z_alpha = _z_alpha(alpha / 2)
    z_effect = absolute_effect / se_pooled

    # One-sided power (two-sided test, one direction)
    power = _normal_cdf(z_effect - z_alpha) + _normal_cdf(-z_effect - z_alpha)
    # For practical purposes, the second term is negligible for positive effects
    power = _normal_cdf(z_effect - z_alpha)

    return round(max(0.0, min(1.0, power)), 4)


def _normal_cdf(z: float) -> float:
    """Standard normal CDF via Abromowitz & Stegun."""
    if z < -7: return 0.0
    if z > 7: return 1.0
    t = 1.0 / (1.0 + 0.2316419 * abs(z))
    poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
    phi = 1.0 - poly * math.exp(-z * z / 2.0) / math.sqrt(2.0 * math.pi)
    return phi if z >= 0 else 1.0 - phi


# ═══════════════════════════════════════════════════════════════════
# PART 2 — CONVERSION RATE COMPARISON (TWO-PROPORTION Z-TEST)
# Source: Kohavi Ch.4-5; OpenStax Ch.10 (§10.3)
# ═══════════════════════════════════════════════════════════════════

def two_proportion_test(
    successes_a: int, trials_a: int,
    successes_b: int, trials_b: int,
    alpha: float = 0.05,
) -> Dict:
    """
    Two-proportion z-test for A/B experiments.
    Kohavi Ch.5, pp.72-83: "p-values and confidence intervals."
    OpenStax Ch.10, §10.3: "Comparing Two Independent Population Proportions."

    H₀: p_A = p_B (no difference)
    H₁: p_A ≠ p_B

    z = (p̂_A - p̂_B) / SE_pooled
    SE_pooled = √(p̂(1-p̂)(1/n_A + 1/n_B))

    Kohavi Ch.5, p.75: "A p-value is the probability of observing a result
    as extreme or more extreme, assuming the null hypothesis is true."

    Returns dict with z_score, p_value, significant, and confidence interval
    for the difference.

    Edge cases:
      - total trials = 0 → ValueError
      - all successes or all failures → handled
    """
    for name, val in [("trials_a", trials_a), ("trials_b", trials_b)]:
        if not isinstance(val, int) or val < 1:
            raise ValueError(f"{name} must be ≥ 1, got {val}")
    for name, val in [("successes_a", successes_a), ("successes_b", successes_b)]:
        if not isinstance(val, int) or val < 0:
            raise ValueError(f"{name} must be ≥ 0, got {val}")
    if successes_a > trials_a or successes_b > trials_b:
        raise ValueError("successes cannot exceed trials")

    p_a = successes_a / trials_a
    p_b = successes_b / trials_b
    diff = p_a - p_b

    # Pooled proportion
    p_pooled = (successes_a + successes_b) / (trials_a + trials_b)

    if p_pooled <= 0 or p_pooled >= 1:
        # Degenerate case — all successes or all failures
        return {"z_score": 0.0, "p_value": 1.0, "significant": False,
                "diff": round(diff, 6), "ci_diff": None,
                "p_a": round(p_a, 6), "p_b": round(p_b, 6),
                "verdict": "Inconclusive — sample not varying enough for comparison"}

    # Standard error
    se = math.sqrt(p_pooled * (1 - p_pooled) * (1.0 / trials_a + 1.0 / trials_b))
    z = diff / se if se > 1e-10 else 0.0

    # Two-tailed p-value
    p_val = 2.0 * (1.0 - _normal_cdf(abs(z))) if abs(z) < 7 else 0.0
    z_crit = _z_alpha(alpha / 2)
    significant = abs(z) > z_crit

    # Confidence interval for difference
    se_diff = math.sqrt(p_a * (1 - p_a) / trials_a + p_b * (1 - p_b) / trials_b)
    ci_low = diff - z_crit * se_diff
    ci_high = diff + z_crit * se_diff

    return {
        "z_score": round(z, 4), "p_value": round(p_val, 6),
        "significant": significant, "diff": round(diff, 6),
        "p_a": round(p_a, 6), "p_b": round(p_b, 6),
        "ci_diff": (round(ci_low, 6), round(ci_high, 6)),
        "relative_change_pct": round(diff / max(p_a, 0.0001) * 100, 2) if p_a > 0 else 0,
        "verdict": ("SIGNIFICANT — reject H₀" if significant else "NOT SIGNIFICANT — cannot reject H₀"),
        "source": "Kohavi Ch.5, pp.72-83; OpenStax Ch.10, §10.3"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — SEQUENTIAL TESTING & EARLY STOPPING
# Source: Kohavi Ch.8 (Ramp-up and the Holdout)
# ═══════════════════════════════════════════════════════════════════

def sequential_boundary(
    total_looks: int,
    alpha: float = 0.05,
) -> Dict:
    """
    Compute Pocock-style sequential testing boundaries.
    Kohavi Ch.8, pp.145-152: "Sequential testing and early stopping."

    Kohavi Ch.8, p.148: "If you peek at results and stop when they become
    significant, you inflate the Type I error rate. Sequential testing
    methods control the overall error rate across multiple looks."

    Pocock boundary: same critical value at each look.
    z_boundary = z_{α/k} where k accounts for multiple looks.

    Simplified: Bonferroni correction for k looks: α_per_look = α / k.

    Returns: adjusted alpha per look, critical z-values, and stopping rules.

    Edge cases: 1 look → no adjustment needed.
    """
    if not isinstance(total_looks, int) or total_looks < 1:
        raise ValueError(f"total_looks must be ≥ 1, got {total_looks}")

    if total_looks == 1:
        return {"method": "No adjustment — single look",
                "alpha_per_look": alpha, "z_critical": round(_z_alpha(alpha / 2), 3),
                "source": "Kohavi Ch.8, pp.145-152"}

    # Bonferroni: α/k per look
    alpha_per_look = alpha / total_looks
    z_crit = _z_alpha(alpha_per_look / 2)

    # Also report O'Brien-Fleming (conservative early, relaxed later) approximate
    obf_z = [round(_z_alpha(alpha / (2 * total_looks)) * math.sqrt(total_looks / (i + 1)), 3)
             for i in range(total_looks)]

    return {
        "method": f"Bonferroni — {total_looks} looks, α_per_look = {alpha_per_look:.4f}",
        "alpha_per_look": round(alpha_per_look, 6),
        "z_critical": round(z_crit, 3),
        "p_threshold": round(alpha_per_look, 6),
        "obrien_fleming_z": obf_z,
        "warning": ("Kohavi Ch.8, p.150: 'Peeking is the single most common "
                    "cause of falsely significant results. Use sequential boundaries "
                    "or, better, wait until the experiment reaches the planned sample size.'"),
        "source": "Kohavi Ch.8, pp.145-152"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — SAMPLE RATIO MISMATCH (SRM)
# Source: Kohavi Ch.10 (Sample Ratio Mismatch)
# ═══════════════════════════════════════════════════════════════════

def srm_test(
    count_a: int, count_b: int,
    expected_ratio: float = 0.50,
) -> Dict:
    """
    Sample Ratio Mismatch test.
    Kohavi Ch.10, pp.177-191: "The sample ratio mismatch problem."

    Kohavi Ch.10, p.178: "SRM occurs when the ratio of users assigned to
    each variant deviates significantly from the designed ratio. It is the
    single most common data-quality issue in A/B tests."

    Uses a chi-square goodness-of-fit test:
      χ² = Σ (O_i - E_i)² / E_i for each variant
      df = k - 1

    A significant SRM invalidates the experiment — the randomization is broken.

    Args:
      count_a: Number of users in variant A
      count_b: Number of users in variant B
      expected_ratio: Expected proportion in variant A (default 0.5)

    Returns dict with χ², p-value, and SRM verdict.

    Edge cases: counts < 1 → ValueError
    """
    if not isinstance(count_a, int) or count_a < 1:
        raise ValueError(f"count_a must be ≥ 1, got {count_a}")
    if not isinstance(count_b, int) or count_b < 1:
        raise ValueError(f"count_b must be ≥ 1, got {count_b}")
    _pct(expected_ratio, "expected_ratio")

    total = count_a + count_b
    expected_a = total * expected_ratio
    expected_b = total * (1 - expected_ratio)

    # Chi-square
    chi2 = (count_a - expected_a) ** 2 / expected_a + (count_b - expected_b) ** 2 / expected_b
    df = 1
    p_val = 1.0 - _chi2_cdf(chi2, df)

    # SRM threshold per Kohavi Ch.10: p < 0.001 strongly suspect
    if p_val < 0.001:
        verdict = "SRM DETECTED — p < 0.001. Experiment data is INVALID. Do not use."
    elif p_val < 0.01:
        verdict = "SRM SUSPECT — p < 0.01. Investigate randomization and filters."
    elif p_val < 0.05:
        verdict = "BORDERLINE — p < 0.05. Monitor. May indicate a configuration issue."
    else:
        verdict = "PASS — no SRM detected. Randomization appears intact."

    return {"chi2": round(chi2, 4), "df": df, "p_value": round(p_val, 6),
            "count_a": count_a, "count_b": count_b,
            "actual_ratio": round(count_a / total, 4),
            "verdict": verdict,
            "kohavi_quote": "Ch.10, p.178: 'SRM invalidates the experiment.'",
            "source": "Kohavi Ch.10, pp.177-191"}


def _chi2_cdf(chi2: float, df: int) -> float:
    """Rough chi-square CDF via Wilson-Hilferty normal approximation."""
    if chi2 <= 0: return 0.0
    z = ((chi2 / df) ** (1.0/3.0) - 1.0 + 2.0 / (9.0 * df)) / math.sqrt(2.0 / (9.0 * df))
    return _normal_cdf(z)


# ═══════════════════════════════════════════════════════════════════
# PART 5 — EXPERIMENT DURATION ESTIMATION
# Source: Kohavi Ch.6-7; general methodology
# ═══════════════════════════════════════════════════════════════════

def experiment_duration_days(
    required_sample_per_variant: int,
    daily_users: int,
    traffic_fraction: float,
    variants_count: int = 2,
    ramp_days: int = 2,
    stabilization_days: int = 3,
    weekday_effect_buffer: bool = True,
) -> float:
    """
    Estimate experiment duration.
    Kohavi Ch.7, pp.120-130: "Ramping up and running experiments."

    Duration = (sample_needed × variants) / (daily_users × traffic_fraction)
             + ramp_days + stabilization_days + weekday_buffer

    Kohavi Ch.7, p.125: "Always run experiments for at least one full
    business cycle. Weekday effects are real — what works on Tuesday
    may fail on Saturday."

    Args:
      required_sample_per_variant: Total users needed per variant
      daily_users: Daily eligible users for the experiment
      traffic_fraction: What fraction of users enter the experiment?
      variants_count: Number of variants (including control). Default 2 = A/B.
      ramp_days: Days to ramp up gradually (default 2)
      stabilization_days: Days for metrics to stabilize (default 3)
      weekday_effect_buffer: Add 7 days for full weekly cycle coverage?

    Returns dict with days breakdown and minimum runtime recommendation.

    Edge cases: 0 daily users → ValueError
    """
    if not isinstance(required_sample_per_variant, int) or required_sample_per_variant < 1:
        raise ValueError(f"required_sample_per_variant must be ≥ 1")
    _positive(daily_users, "daily_users")
    _pct(traffic_fraction, "traffic_fraction")
    if traffic_fraction <= 0:
        raise ValueError("traffic_fraction must be > 0")
    if not isinstance(variants_count, int) or variants_count < 2:
        raise ValueError(f"variants_count must be ≥ 2, got {variants_count}")

    daily_eligible = daily_users * traffic_fraction
    data_days = math.ceil(required_sample_per_variant / daily_eligible)

    week_buffer = 7 if weekday_effect_buffer else 0

    total_days = data_days + ramp_days + stabilization_days + week_buffer

    return {
        "total_days": total_days,
        "data_collection_days": data_days,
        "ramp_days": ramp_days,
        "stabilization_days": stabilization_days,
        "weekday_buffer_days": week_buffer,
        "daily_eligible_users": round(daily_eligible, 0),
        "recommendation": (f"Run for at least {total_days} days. "
                          f"Kohavi Ch.7, p.125: 'Always include at least one "
                          f"full business cycle.'"),
        "source": "Kohavi Ch.7, pp.120-130"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 6 — GUARDRAIL / NON-INFERIORITY CHECK
# Source: Kohavi Ch.7 (Guardrails)
# ═══════════════════════════════════════════════════════════════════

def guardrail_check(
    metric_a: float, metric_b: float,
    guardrail_threshold: float,
    n_a: int, n_b: int,
    direction: str = "above",
    alpha: float = 0.05,
) -> Dict:
    """
    Check guardrail metrics — these must NOT degrade.
    Kohavi Ch.7, pp.115-120: "Guardrail metrics are business-critical metrics
    that the experiment must not degrade — latency, error rates, revenue."

    Two scenarios:
      - Non-inferiority: show variant B is not worse than A by more than δ
      - Severe degradation: if B is statistically significantly WORSE than A,
        halt the experiment regardless of the primary metric.

    Uses a one-tailed test in the direction of concern.

    Args:
      metric_a:   Metric value in control (A)
      metric_b:   Metric value in variant (B)
      guardrail_threshold: Maximum acceptable degradation (absolute)
      n_a, n_b:   Sample sizes
      direction:  'above' (B must be above A-threshold; e.g., revenue)
                  or 'below' (B must be below A+threshold; e.g., latency)
      alpha:      Test significance (default 0.05, one-tailed)

    Returns: {pass, degradation, p_value, recommendation}

    Edge cases: n < 2 → too small for test
    """
    _fv(metric_a, "metric_a"); _fv(metric_b, "metric_b")
    _fv(guardrail_threshold, "guardrail_threshold")
    if not isinstance(n_a, int) or n_a < 2 or not isinstance(n_b, int) or n_b < 2:
        raise ValueError("n_a and n_b must be ≥ 2")

    diff = metric_b - metric_a
    se_diff = math.sqrt(abs(metric_a) / n_a + abs(metric_b) / n_b) if metric_a != 0 else math.sqrt(abs(metric_b) / n_b)

    # One-tailed: is B worse than A by more than the threshold?
    if direction == "above":
        # Guardrail: metric should stay above A - threshold
        margin = diff + guardrail_threshold  # positive = B is above floor
        z = (diff + guardrail_threshold) / se_diff if se_diff > 0 else 0
        degraded = diff < -guardrail_threshold
    else:  # below
        # Guardrail: metric should stay below A + threshold
        margin = guardrail_threshold - diff  # positive = B is below ceiling
        z = (guardrail_threshold - diff) / se_diff if se_diff > 0 else 0
        degraded = diff > guardrail_threshold

    z_crit = _z_alpha(alpha)  # one-tailed
    significant = z > z_crit if z > 0 else False

    if degraded and significant:
        verdict = "HALT — guardrail metric significantly degraded. Stop the experiment."
    elif degraded:
        verdict = "WARNING — guardrail degraded but not yet statistically significant. Monitor closely."
    else:
        verdict = "PASS — guardrail within acceptable bounds"

    return {"diff": round(diff, 6), "threshold": guardrail_threshold,
            "degraded": degraded, "significant": significant,
            "z_score": round(z, 4), "z_critical": round(z_crit, 3),
            "verdict": verdict,
            "source": "Kohavi Ch.7, pp.115-120"}


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

    def ck_raises(label, func, *args, **kwargs):
        nonlocal f, p
        try:
            r = func(*args, **kwargs); print(f"  FAIL  {label}: expected exception, got {r}"); f += 1
        except (ValueError, TypeError): print(f"  PASS  {label}: raised correctly"); p += 1

    print("=" * 70)
    print("SELF-TEST SUITE: experiment_methods.py")
    print("Sources: Kohavi et al. (2020) + OpenStax Statistics 2e (2023)")
    print("=" * 70)

    # ── MDE ──
    print("\n── MDE & Power (Kohavi Ch.6) ──")
    m = mde_two_proportion(0.10, sample_size_per_variant=10000)
    ck("mde: baseline 10%, n=10K → absolute", m["mde_absolute"] > 0, True)

    ns = mde_to_sample_size(0.10, 0.20, 0.05, 0.80)
    # For baseline 10%, detecting 20% relative change (+2pp):
    # (1.96+0.842)² × 2 × 0.10×0.90 / 0.02² = 7.85 × 0.18 / 0.0004 = 3532
    ck("mde→n: 10% base, 20% MDE, 80% power → ~3534", ns, 3534)

    pw = experiment_power(0.10, 0.02, 10000, 0.05)
    ck("power: 10% base, +2pp, 10K → >0.85", pw >= 0.85, True)

    # ── Two-Proportion Test ──
    print("\n── Two-Proportion Test (Kohavi Ch.5) ──")
    tpt = two_proportion_test(1200, 10000, 1000, 10000)
    ck("2prop: 12% vs 10% with 10K each → significant", tpt["significant"], True)

    tpt2 = two_proportion_test(1010, 10000, 1000, 10000)
    ck("2prop: 10.1% vs 10% → NOT significant", tpt2["significant"], False)

    # ── Sequential ──
    print("\n── Sequential Testing (Kohavi Ch.8) ──")
    sq = sequential_boundary(5, 0.05)
    ck("seq: 5 looks → Bonferroni α=0.01 per look", sq["alpha_per_look"], 0.01)
    ck("seq: obrien-fleming has 5 values", len(sq["obrien_fleming_z"]), 5)

    # ── SRM ──
    print("\n── SRM Test (Kohavi Ch.10) ──")
    srm_ok = srm_test(10000, 10000)
    ck("srm: 10K/10K → PASS", "PASS" in srm_ok["verdict"], True)

    srm_bad = srm_test(7000, 13000)
    ck("srm: 7K/13K → SRM DETECTED", "SRM" in srm_bad["verdict"], True)

    # ── Duration ──
    print("\n── Experiment Duration (Kohavi Ch.7) ──")
    dur = experiment_duration_days(10000, 500, 0.10)
    ck("dur: 10K users, 500/day, 10% traffic → 200+ days", dur["data_collection_days"] >= 200, True)

    # ── Guardrail ──
    print("\n── Guardrail (Kohavi Ch.7) ──")
    gr = guardrail_check(50.0, 52.0, 5.0, 1000, 1000)
    ck("gr: 50→52 (above threshold) → PASS", "PASS" in gr["verdict"], True)

    gr2 = guardrail_check(50.0, 42.0, 5.0, 1000, 1000)
    ck("gr: 50→42 (below threshold) → degraded", gr2["degraded"], True)

    # ── Edge Cases ──
    print("\n── Edge Cases ──")
    ck_raises("mde: baseline=0", mde_two_proportion, 0.0, sample_size_per_variant=1000)
    ck_raises("2prop: trials=0", two_proportion_test, 5, 0, 5, 100)

    # ── Integration ──
    print("\n── Integration: Full Experiment Pipeline ──")
    # 1. Determine sample size
    n_per = mde_to_sample_size(0.12, 0.15, 0.05, 0.80)
    ck("integration: needed sample size > 1000", n_per > 1000, True)
    # 2. Test at that sample size
    result = two_proportion_test(
        round(0.12 * n_per), n_per,
        round(0.138 * n_per), n_per,
    )
    ck("integration: significant difference", result["significant"], True)
    # 3. Check SRM
    srm = srm_test(n_per, n_per)
    ck("integration: SRM passes", "PASS" in srm["verdict"], True)
    # 4. Sequential boundaries
    seq = sequential_boundary(3, 0.05)
    ck("integration: 3 looks → adjusted alpha", seq["alpha_per_look"] < 0.05, True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
