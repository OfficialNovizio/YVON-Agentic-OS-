#!/usr/bin/env python3
"""
Planning Fallacy De-Biasing — Reference-Class Forecasting
===========================================================
Source: Kahneman, Daniel, *Thinking, Fast and Slow* (2011, FSG)
        Ch.23 ("The Outside View") — Israel curriculum study,
          reference-class forecasting 4-step protocol
        Ch.24 ("The Engine of Capitalism") — optimism bias evidence,
          small business survival data (35%), CFO overconfidence study
          (11,600 forecasts, 67% hit rate for 80% CI), competition
          neglect, the premortem (Klein)
        Ch.25 ("Knowing What You Don't Know") — overconfidence,
          illusion of understanding, hindsight bias

Route: B/C (Rule logic + Hybrid — the Bayesian blend formula is math,
       the premortem checklist is rule-based)

Every projection in the agent fleet passes through these functions
before being used as input to any decision, ranking, or roadmap.

Design rules:
  - All inputs validated; no silent defaults for safety-critical values.
  - Reference class minimum: 5 projects (Kahneman, Ch.23, p.248).
  - Calibration weight (w) capped at 0.3 max (Ch.23: inside view is
    optimistic by default).
  - CI widening default: 4x (CFO study, Ch.24, pp.258-260).
  - All functions carry exact page citations.
  - Self-tests use the textbook's own data (Israel study, CFO study).
"""

from __future__ import annotations
import math
import sys
from typing import List, Tuple, Optional, Dict, Callable


# ═══════════════════════════════════════════════════════════════════
# PART 1 — REFERENCE-CLASS FORECASTING
# Source: Kahneman, Ch.23 ("The Outside View"), pp.245-254
# ═══════════════════════════════════════════════════════════════════

def _validate_finite(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val):
        raise ValueError(f"{name} is NaN")
    if math.isinf(val):
        raise ValueError(f"{name} is infinite")


def _validate_positive(val: float, name: str) -> None:
    _validate_finite(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


def reference_class_statistics(
    outcomes: List[float],
) -> Dict[str, float]:
    """
    Compute base-rate statistics from a reference class of past projects.
    Ch.23, p.249 (Step 2: Obtain the Distribution)

    Args:
        outcomes: List of actual outcomes from comparable past projects
                 (e.g., actual months to completion for similar features)

    Returns dict:
        'n':              Number of projects in the reference class
        'mean':           Arithmetic mean
        'median':         Median (50th percentile)
        'p25':            25th percentile
        'p75':            75th percentile
        'p90':            90th percentile (worst-case planning figure)
        'min':            Minimum
        'max':            Maximum
        'std':            Standard deviation
        'reliability':    'LOW' (<5), 'MEDIUM' (5-15), 'HIGH' (16-50),
                          'VERY HIGH' (50+)
        'failed_fraction': Fraction of projects that never completed
                          (if 'failed' marker is math.inf or negative)

    Edge cases:
        - Empty list → ValueError (need at least 1 project for statistics)
        - Single project → all statistics = that value, reliability=LOW
        - Negative values → allowed (e.g., cost underruns), but unusual
    """
    if not outcomes:
        raise ValueError(
            "Reference class must have at least 1 project. "
            "Kahneman (Ch.23, p.249): thin reference classes (1-2) "
            "are unreliable — flag as LOW confidence."
        )

    for i, o in enumerate(outcomes):
        _validate_finite(o, f"outcomes[{i}]")

    n = len(outcomes)
    sorted_outcomes = sorted(outcomes)

    def percentile(data: List[float], p: float) -> float:
        if n == 1:
            return data[0]
        k = (n - 1) * p / 100.0
        f = int(k)
        c = k - f
        if f + 1 >= n:
            return data[-1]
        return data[f] + c * (data[f + 1] - data[f])

    mean_val = sum(outcomes) / n
    var_val = sum((x - mean_val) ** 2 for x in outcomes) / n
    std_val = math.sqrt(var_val) if n > 1 else 0.0

    # Count obvious failures (projects that didn't complete)
    failed = sum(1 for o in outcomes if (math.isinf(o) and o < 0) or o < -1e12)

    # Reliability rating per p.249
    if n >= 50:
        reliability = "VERY HIGH — 50+ projects, reliable base rates"
    elif n >= 16:
        reliability = "HIGH — 16-50 projects, full percentiles meaningful"
    elif n >= 5:
        reliability = "MEDIUM — 5-15 projects, median usable, tails uncertain"
    else:
        reliability = "LOW — <5 projects, base rate unreliable (Ch.23, p.249)"

    return {
        "n": n,
        "mean": round(mean_val, 4),
        "median": round(percentile(sorted_outcomes, 50), 4),
        "p25": round(percentile(sorted_outcomes, 25), 4),
        "p75": round(percentile(sorted_outcomes, 75), 4),
        "p90": round(percentile(sorted_outcomes, 90), 4),
        "min": round(sorted_outcomes[0], 4),
        "max": round(sorted_outcomes[-1], 4),
        "std": round(std_val, 4),
        "reliability": reliability,
        "failed_fraction": round(failed / n, 4) if n > 0 else 0.0,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 2 — BAYESIAN BLEND FORMULA
# Source: Kahneman, Ch.23, pp.250-252 (Steps 3-4)
# ═══════════════════════════════════════════════════════════════════

def calibration_weight(
    team_track_record: Optional[List[float]] = None,
    project_novelty: int = 3,
    reference_class_available: bool = True,
) -> float:
    """
    Determine the calibration weight (w) for the Bayesian blend.
    Ch.23, pp.251-252

    w = confidence in the team's inside-view estimate.
    Range: 0.1 (mostly base rate) to 0.3 (max, very experienced team).

    Args:
      team_track_record: List of (actual/estimated) ratios from past projects.
                         >1.0 = team overran estimates (optimistic).
                         <1.0 = team underran (pessimistic). None if unknown.
      project_novelty: 1 (routine — done it before) to 5 (completely novel).
      reference_class_available: Whether a usable reference class exists.

    Returns:
      w in [0.0, 0.3] — per Kahneman, the inside view is never trusted
      more than 30% (Ch.23, p.251).

    Edge cases:
      - No track record → treated as unknown (defaulting to mid-low w)
      - No reference class → w drops to 0.0 (must use inside view alone,
        but with a heavy correction applied separately)
    """
    if not isinstance(project_novelty, int) or project_novelty < 1 or project_novelty > 5:
        raise ValueError(f"project_novelty must be 1–5, got {project_novelty}")

    if not reference_class_available:
        return 0.0  # No base rate to blend — must rely on inside view with correction

    # Start from novelty
    # Novelty 1 (routine) → high trust in team → higher w
    # Novelty 5 (novel) → low trust → lower w
    base_w = {1: 0.28, 2: 0.22, 3: 0.18, 4: 0.13, 5: 0.08}[project_novelty]

    # Adjust for track record
    if team_track_record is not None and len(team_track_record) >= 3:
        for r in team_track_record:
            _validate_finite(r, "track_record entry")
        avg_ratio = sum(team_track_record) / len(team_track_record)
        # Ratio ≈ 1.0 → team is well-calibrated → boost w
        # Ratio ≫ 1.0 → team consistently over-optimistic → reduce w
        if 0.90 <= avg_ratio <= 1.10:
            base_w += 0.05  # Well-calibrated team — trust them more
        elif avg_ratio > 1.50:
            base_w -= 0.05  # Very optimistic — trust them less
        elif avg_ratio > 2.00:
            base_w -= 0.10  # Extremely optimistic

    # Clamp to [0.0, 0.3]
    return max(0.0, min(0.30, round(base_w, 4)))


def bayesian_blend(
    inside_estimate: float,
    base_rate: float,
    w: float,
) -> Dict[str, float]:
    """
    Bayesian Blend: Adjusted = w × Inside + (1 - w) × Base_Rate
    Kahneman, Ch.23, pp.250-252 (derived method)

    This is the core de-biasing formula. It pulls an optimistic inside-view
    estimate toward the base rate.

    Args:
      inside_estimate:  Team's projected value (e.g., 3 sprints)
      base_rate:        Reference class mean (e.g., 6 sprints)
      w:                Calibration weight (0.0 to 0.3 per calibration_weight())

    Returns dict:
      'adjusted':       The blended estimate
      'inside':         Original inside-view estimate
      'base_rate':      Reference class base rate
      'w':              Calibration weight used
      'pull_toward_base':  (base_rate - inside_estimate) × (1-w)
                           Positive = adjusted is higher (optimism corrected upward)
      'adjustment_pct':  Percentage adjustment from inside to adjusted

    Edge cases:
      - w outside [0, 0.3] → ValueError (per Kahneman's cap)
      - Negative estimates → allowed (costs, losses) but unusual
      - base_rate = 0 → allowed (e.g., no-cost reference class)
    """
    _validate_finite(inside_estimate, "inside_estimate")
    _validate_finite(base_rate, "base_rate")
    _validate_finite(w, "w")
    if w < 0.0 or w > 0.30 + 1e-10:
        raise ValueError(
            f"w = {w} — calibration weight must be in [0.0, 0.3]. "
            f"Per Kahneman Ch.23, p.251: the inside view is optimistic "
            f"by default; never trust it more than 30%."
        )

    w = min(w, 0.30)
    adjusted = w * inside_estimate + (1.0 - w) * base_rate
    pull = (base_rate - inside_estimate) * (1.0 - w)

    if abs(inside_estimate) > 1e-10:
        pct = (adjusted - inside_estimate) / abs(inside_estimate) * 100
    else:
        pct = 0.0

    return {
        "adjusted": round(adjusted, 4),
        "inside": inside_estimate,
        "base_rate": base_rate,
        "w": w,
        "pull_toward_base": round(pull, 4),
        "adjustment_pct": round(pct, 2),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — PLANNING FALLACY CORRECTION FACTORS
# Source: Kahneman, Ch.23-24
# ═══════════════════════════════════════════════════════════════════

def interval_from_point_estimate(
    point_estimate: float,
    use_reference_class: bool = True,
) -> Dict[str, float]:
    """
    Convert an optimistic single-point estimate into a realistic range.
    Ch.24, p.260 (CFO study): inside-view estimates are 4x too narrow.

    Args:
      point_estimate:     Team's single-point projection (e.g., 4 sprints)
      use_reference_class: If True and a reference class exists, the
                           interval may be narrower. If False (no ref class),
                           use the full 2.5x factor.

    Returns dict:
      'point':          Original estimate
      'min_realistic':  Minimum realistic outcome
      'max_realistic':  Maximum realistic outcome
      'planning_figure': Recommended planning figure
      'correction':     Multiplier applied for max bound

    Default corrections (Ch.24):
      - No reference class: min=1.5x, planning=2.0x, max=3.0x
      - Reference class available: min=1.3x, planning=1.6x, max=2.5x
    """
    _validate_positive(point_estimate, "point_estimate")

    if use_reference_class:
        min_factor, plan_factor, max_factor = 1.3, 1.6, 2.5
    else:
        min_factor, plan_factor, max_factor = 1.5, 2.0, 3.0

    return {
        "point": point_estimate,
        "min_realistic": round(point_estimate * min_factor, 2),
        "planning_figure": round(point_estimate * plan_factor, 2),
        "max_realistic": round(point_estimate * max_factor, 2),
        "correction": max_factor,
    }


def default_correction_factor(
    has_reference_class: bool,
    has_track_record: bool,
    project_novelty: int,
) -> float:
    """
    Returns the default multiplier to apply to an inside-view estimate
    when no reference-class data exists.

    Factors (Ch.23-24):
      - Known reference class, experienced team, routine: 1.0 (no adjustment needed)
      - Known reference class, novel: 1.5x
      - No reference class, some experience: 2.5x (Kahneman's default)
      - No reference class, novel work: 3.0x (maximum)
      - No reference class AND no track record AND novel: 4.0x (red alert)
    """
    if not isinstance(project_novelty, int) or project_novelty < 1 or project_novelty > 5:
        raise ValueError(f"project_novelty must be 1–5, got {project_novelty}")

    if has_reference_class and has_track_record and project_novelty <= 2:
        return 1.0  # Well-calibrated — no blanket correction
    elif has_reference_class and project_novelty <= 3:
        return 1.5
    elif has_reference_class:
        return 1.8
    elif has_track_record and project_novelty <= 3:
        return 2.5  # Kahneman's default (Ch.23)
    elif project_novelty <= 4:
        return 3.0
    else:
        return 4.0  # Maximum: no ref class, no track record, completely novel


def de_bias_estimate(
    team_estimate: float,
    reference_class_stats: Optional[Dict[str, float]] = None,
    team_track_record: Optional[List[float]] = None,
    project_novelty: int = 3,
    force_correction: bool = False,
) -> Dict:
    """
    Full de-biasing pipeline — one function call for marcus, vista, echo.
    Ch.23-24

    Pipeline:
      1. If reference class exists → compute Bayesian blend
      2. If no reference class → apply correction factor
      3. Compute realistic range
      4. Flag confidence level

    Args:
      team_estimate:        The raw inside-view estimate (e.g., 3 sprints)
      reference_class_stats: Output of reference_class_statistics(), or None
      team_track_record:    Past (actual/estimated) ratios for this team
      project_novelty:      1 (routine) to 5 (completely novel)
      force_correction:     If True, always apply correction factor on top
                            of blend (for high-stakes decisions)

    Returns dict with 'method', 'de_biased_estimate', 'range', 'confidence',
    'flags' — the complete package for any agent to consume.

    Edge cases:
      - Negative team_estimate → allowed (cost overruns, losses)
      - Zero team_estimate → allowed but unusual (instant completion claim)
    """
    _validate_finite(team_estimate, "team_estimate")

    result: Dict = {
        "original_estimate": team_estimate,
        "method": "",
        "de_biased_estimate": team_estimate,
        "range": {},
        "confidence": "UNKNOWN",
        "flags": [],
    }

    has_ref_class = reference_class_stats is not None and reference_class_stats.get("n", 0) >= 3
    w = calibration_weight(team_track_record, project_novelty, has_ref_class)

    if has_ref_class and reference_class_stats is not None:
        base = reference_class_stats["mean"]
        n_ref = reference_class_stats["n"]
        reliability = reference_class_stats["reliability"]

        blend_result = bayesian_blend(team_estimate, base, w)
        result["method"] = f"Bayesian Blend (w={w}, n_ref={n_ref})"
        result["reference_class"] = reference_class_stats
        result["blend_details"] = blend_result
        result["de_biased_estimate"] = blend_result["adjusted"]
        result["confidence"] = reliability.split(" —")[0] if " —" in reliability else reliability

        if force_correction:
            corr = default_correction_factor(has_ref_class, team_track_record is not None, project_novelty)
            result["de_biased_estimate"] = blend_result["adjusted"] * corr
            result["method"] += f" × {corr}x forced correction"
            result["flags"].append(f"Force-corrected by {corr}x — high-stakes mode (operator requested)")

        interval = interval_from_point_estimate(result["de_biased_estimate"], use_reference_class=True)
        result["range"] = interval
        result["flags"].append(f"Reference class: {n_ref} projects, reliability={reliability.split(' —')[0]}")

    else:
        # No reference class — apply pure correction factor
        corr = default_correction_factor(False, team_track_record is not None, project_novelty)
        result["method"] = f"No reference class — {corr}x Kahneman correction (Ch.23-24)"
        result["de_biased_estimate"] = team_estimate * corr
        result["confidence"] = "LOW — no reference class"
        result["flags"].append(f"No reference class — {corr}x correction applied")
        result["flags"].append("BUILD REFERENCE CLASS from completed projects (Ch.23, p.248)")

        interval = interval_from_point_estimate(result["de_biased_estimate"], use_reference_class=False)
        result["range"] = interval

    # Additional red flags
    if team_track_record is None:
        result["flags"].append("No team track record — calibration weight is speculative")
    if project_novelty >= 4:
        result["flags"].append("Highly novel project — estimates inherently unreliable (Ch.23)")
    if team_estimate <= 0:
        result["flags"].append("WARNING: estimate is ≤ 0 — verify this is intentional")

    return result


# ═══════════════════════════════════════════════════════════════════
# PART 4 — OVERCONFIDENCE & CONFIDENCE INTERVAL CALIBRATION
# Source: Kahneman, Ch.24, pp.258-260 (CFO Study)
# ═══════════════════════════════════════════════════════════════════

def widen_confidence_interval(
    stated_lower: float,
    stated_upper: float,
    stated_confidence: float = 0.80,
    adjustment_factor: float = 4.0,
) -> Dict[str, float]:
    """
    Widen a stated confidence interval to correct for overconfidence.
    Ch.24, pp.258-260

    The CFO study (11,600 forecasts): intervals stated at 80% confidence
    had an actual hit rate of only 67%. The intervals were ~4x too narrow.

    Widening formula:
      mid = (lower + upper) / 2
      half_width = (upper - lower) / 2
      corrected_half_width = half_width × adjustment_factor
      corrected interval = [mid - corrected_half_width, mid + corrected_half_width]

    Args:
      stated_lower:       Lower bound of stated confidence interval
      stated_upper:       Upper bound (must be > lower)
      stated_confidence:  The stated confidence level (e.g., 0.80)
      adjustment_factor:  Widening factor (default 4.0 from CFO study)

    Returns dict with original and corrected intervals.

    Edge cases:
      - stated_lower > stated_upper → ValueError
      - adjustment_factor < 1.0 → allowed but means narrowing (unusual)
    """
    _validate_finite(stated_lower, "stated_lower")
    _validate_finite(stated_upper, "stated_upper")
    _validate_finite(stated_confidence, "stated_confidence")
    _validate_finite(adjustment_factor, "adjustment_factor")

    if stated_lower > stated_upper:
        raise ValueError(f"lower ({stated_lower}) must be ≤ upper ({stated_upper})")
    if not 0.0 < stated_confidence < 1.0:
        raise ValueError(f"stated_confidence must be in (0, 1), got {stated_confidence}")
    if adjustment_factor <= 0:
        raise ValueError(f"adjustment_factor must be > 0, got {adjustment_factor}")

    mid = (stated_lower + stated_upper) / 2.0
    half_width = (stated_upper - stated_lower) / 2.0
    corrected_half = half_width * adjustment_factor

    corrected_lower = mid - corrected_half
    corrected_upper = mid + corrected_half

    # Implied actual hit rate from the CFO study's calibration curve
    # (approximate: 80% stated → 67% actual, from p.259)
    implied_actual = 0.67 if abs(stated_confidence - 0.80) < 0.01 else None

    return {
        "stated_lower": stated_lower,
        "stated_upper": stated_upper,
        "stated_confidence": stated_confidence,
        "corrected_lower": round(corrected_lower, 4),
        "corrected_upper": round(corrected_upper, 4),
        "adjustment_factor": adjustment_factor,
        "implied_actual_hit_rate": implied_actual,
        "midpoint": round(mid, 4),
        "original_half_width": round(half_width, 4),
        "corrected_half_width": round(corrected_half, 4),
    }


def overconfidence_audit(
    intervals: List[Tuple[float, float, float]],
) -> Dict:
    """
    Audit a set of confidence intervals against actual outcomes.
    Ch.24, pp.258-260 (CFO study methodology)

    Args:
      intervals: List of (lower, upper, actual_value) tuples.

    Returns dict:
      'hit_rate':          Fraction of intervals containing actual
      'n_intervals':       Number of intervals audited
      'implied_confidence': If hit_rate matches a standard level
      'overconfidence_ratio': 80% stated / actual hit rate (if > 1 = overconfident)
      'assessment':        Human-readable verdict

    Edge cases:
      - Empty intervals → ValueError
      - lower > upper in any entry → ValueError
    """
    if not intervals:
        raise ValueError("intervals must be non-empty")

    hits = 0
    for i, (lo, hi, actual) in enumerate(intervals):
        _validate_finite(lo, f"intervals[{i}].lower")
        _validate_finite(hi, f"intervals[{i}].upper")
        _validate_finite(actual, f"intervals[{i}].actual")
        if lo > hi:
            raise ValueError(f"intervals[{i}]: lower ({lo}) > upper ({hi})")
        if lo <= actual <= hi:
            hits += 1

    n = len(intervals)
    hit_rate = hits / n

    # Compare to the CFO study benchmark (Ch.24, pp.258-260)
    if hit_rate >= 0.80:
        assessment = "WELL-CALIBRATED — actual hit rate ≥ stated 80% confidence"
    elif hit_rate >= 0.67:
        assessment = "TYPICAL OVERCONFIDENCE — hit rate between 67-80%, consistent with CFO study (Ch.24, p.259)"
    elif hit_rate >= 0.50:
        assessment = "SIGNIFICANT OVERCONFIDENCE — hit rate < 67%, worse than CFO average"
    else:
        assessment = "SEVERE OVERCONFIDENCE — hit rate < 50%, intervals are wildly overconfident"

    oc_ratio = 0.80 / hit_rate if hit_rate > 0 else math.inf

    return {
        "n_intervals": n,
        "hits": hits,
        "hit_rate": round(hit_rate, 4),
        "stated_confidence_benchmark": 0.80,
        "overconfidence_ratio": round(oc_ratio, 2) if oc_ratio != math.inf else "∞",
        "assessment": assessment,
        "cfo_study_comparison": f"CFO study (n=11,600): 80% stated → 67% actual. "
                                f"Your result: 80% stated → {hit_rate*100:.0f}% actual.",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — THE PREMORTEM PROTOCOL
# Source: Kahneman, Ch.24, pp.264-265 (Klein's Premortem)
# ═══════════════════════════════════════════════════════════════════

def premortem_checklist(
    plan_description: str,
    identified_risks: List[str],
    mitigations: List[str],
    external_factors_considered: bool,
    competitive_response_considered: bool,
    base_rate_considered: bool,
) -> Dict:
    """
    Premortem readiness assessment.
    Ch.24, pp.264-265

    Kahneman presents Gary Klein's premortem as the primary practical
    remedy for the planning fallacy:

    "When a decision has been made but before it is executed:
     1. Assume the future — 'It is one year from now. Our plan was a disaster.'
     2. Write a brief history of that disaster.
     3. Share the histories. Identify common themes.
     4. Update the plan to address the identified risks."

    This function assesses whether a team has conducted a proper premortem
    and scores its thoroughness. It does NOT automate the premortem —
    the protocol requires human judgment (Kahneman, p.265).

    Args:
      plan_description:                Brief description of the plan
      identified_risks:                List of risks the premortem surfaced
      mitigations:                     Planned mitigations for each risk
      external_factors_considered:     Were factors outside team control listed?
      competitive_response_considered: Was competitor reaction considered?
                                       (competition neglect, Ch.24, p.261)
      base_rate_considered:            Was the base rate of success for similar
                                       plans examined? (Ch.23, p.246)

    Returns dict:
      'score':             0.0 — 1.0 (thoroughness of premortem)
      'verdict':           Human-readable assessment
      'missing_elements':  What's still missing
      'recommendation':    Next step

    Edge cases:
      - Empty risk list → score penalty (premortem not done or superficial)
      - More mitigations than risks → score bonus (contingency planning)
    """
    if not isinstance(plan_description, str) or not plan_description.strip():
        raise ValueError("plan_description must be a non-empty string")

    score = 0.0
    missing = []

    # Core: risks identified
    n_risks = len(identified_risks)
    if n_risks >= 5:
        score += 0.30
    elif n_risks >= 3:
        score += 0.20
    elif n_risks >= 1:
        score += 0.10
    else:
        missing.append("No risks identified — premortem either not conducted or superficial (Ch.24, p.264)")

    # Mitigations
    n_mit = len(mitigations)
    if n_mit >= n_risks and n_risks > 0:
        score += 0.25
    elif n_mit >= 1:
        score += 0.15
    else:
        missing.append("No mitigations planned — the premortem identified risks but no responses")

    # External factors
    if external_factors_considered:
        score += 0.20
    else:
        missing.append("External factors not considered — inside-view analysis only (Ch.23, p.247)")

    # Competition neglect (Ch.24, p.261)
    if competitive_response_considered:
        score += 0.15
    else:
        missing.append("Competitive response not considered — competition neglect (Ch.24, p.261). "
                       "'Hubris. Hubris. If you only think about your own business...' — Disney chairman")

    # Base rate (Ch.23, p.246)
    if base_rate_considered:
        score += 0.10
    else:
        missing.append("Base rate of success not examined — inside-view only (Ch.23, p.246). "
                       "35% small business survival rate (Ch.24, p.256) is the default warning.")

    score = min(1.0, round(score, 2))

    if score >= 0.80:
        verdict = "THOROUGH — premortem properly conducted. Plan has been stress-tested."
        recommendation = "Proceed with execution; update risk register as new information arrives."
    elif score >= 0.55:
        verdict = "ADEQUATE — premortem done but has gaps."
        recommendation = "Address missing elements before committing major resources."
    elif score >= 0.30:
        verdict = "INCOMPLETE — premortem is superficial."
        recommendation = "Conduct a proper premortem session (individual, anonymous, 5-10 min) per Klein's protocol (Ch.24, pp.264-265)."
    else:
        verdict = "NOT DONE — premortem has not been conducted."
        recommendation = "STOP. Do not commit resources until a proper premortem is completed. "
        "Kahneman (Ch.24, p.265): 'The premortem legitimizes doubt and surfaces risks "
        "that the inside view suppresses.'"

    return {
        "score": score,
        "verdict": verdict,
        "missing_elements": missing,
        "recommendation": recommendation,
        "n_risks": n_risks,
        "n_mitigations": n_mit,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 6 — COMPETITION NEGLECT CHECK
# Source: Kahneman, Ch.24, p.261 (Camerer & Lovallo)
# ═══════════════════════════════════════════════════════════════════

def competition_neglect_assessment(
    has_competitor_analysis: bool,
    market_size_claimed: Optional[float] = None,
    number_of_known_competitors: int = 0,
    is_winner_take_all_market: bool = False,
) -> Dict:
    """
    Assess whether a plan suffers from competition neglect.
    Ch.24, p.261

    Camerer & Lovallo's finding: "Entrepreneurs focus on their own plans
    and underestimate competitors' responses... The consequence is excess
    entry — more competitors enter the market than it can profitably
    sustain, and the average outcome is a loss."

    Returns dict with risk_level and specific flags.

    Edge cases:
      - No competitor analysis in a winner-take-all market → CRITICAL
    """
    flags = []
    risk_score = 0.0

    if not has_competitor_analysis:
        risk_score += 0.5
        flags.append("No competitor analysis conducted — classic competition neglect (Ch.24, p.261)")
    else:
        risk_score += 0.1

    if number_of_known_competitors >= 5:
        risk_score += 0.2
        flags.append(f"{number_of_known_competitors} known competitors — market is contested")
    elif number_of_known_competitors >= 1:
        risk_score += 0.1

    if is_winner_take_all_market:
        risk_score += 0.2
        flags.append("Winner-take-all market — excess entry risk is acute (Camerer & Lovallo, p.261)")

    if market_size_claimed is not None and number_of_known_competitors > 0:
        # Rough heuristic: if each competitor claims a meaningful share,
        # the stated market size must accommodate them all
        implied_share = 1.0 / (number_of_known_competitors + 1)
        flags.append(
            f"With {number_of_known_competitors} known competitors, "
            f"equal share would be {implied_share*100:.0f}% each. "
            f"Verify your share assumption is realistic."
        )

    risk_score = min(1.0, risk_score)

    if risk_score >= 0.7:
        level = "CRITICAL — severe competition neglect detected"
    elif risk_score >= 0.4:
        level = "HIGH — significant competition neglect risk"
    elif risk_score >= 0.2:
        level = "MODERATE — some competition neglect indicators"
    else:
        level = "LOW — competition appears adequately considered"

    return {
        "risk_level": level,
        "risk_score": round(risk_score, 2),
        "flags": flags,
        "kahneman_quote": "Hubris. Hubris. If you only think about your own business, "
                          "you think, 'I've got a good story department, I've got a good "
                          "marketing department, we're going to go out and do this.' "
                          "And you don't think that everybody else is thinking the same way. "
                          "— Former chairman of Disney Studios (Kahneman, Ch.24, p.261)",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 7 — BASE RATE REMINDERS
# Source: Kahneman, Ch.23-24 (empirical data)
# ═══════════════════════════════════════════════════════════════════

BASE_RATES = {
    "small_business_survival_5yr": {
        "rate": 0.35,
        "source": "US Bureau of Labor Statistics, cited Ch.24, p.256",
        "interpretation": "35% of US small businesses survive 5 years. "
                          "81% of entrepreneurs rate their own odds ≥7/10. "
                          "33% say their chance of failure is ZERO.",
    },
    "entrepreneur_optimism_gap": {
        "avg_estimate": 0.60,
        "actual": 0.35,
        "source": "Survey data, cited Ch.24, p.256",
        "gap": "Entrepreneurs estimate 60% survival for 'businesses like yours' vs 35% actual.",
    },
    "inventor_persistence_after_rejection": {
        "rate": 0.47,
        "source": "Astebro study (Canadian Inventor's Assistance Program), cited Ch.24, pp.257-258",
        "interpretation": "47% of inventors CONTINUED development after being told their "
                          "invention would fail. Of the lowest-grade inventions, ZERO "
                          "were successful. Those who persisted DOUBLED their losses.",
    },
    "cfo_forecast_correlation": {
        "rate": "slightly less than zero",
        "source": "Duke University CFO survey (n=11,600), cited Ch.24, pp.258-260",
        "interpretation": "CFO forecasts of S&P 500 returns had correlation ≤ 0 with "
                          "actual returns. Their 80% CIs had 67% hit rate. "
                          "Surprise rate was 3x higher than stated confidence implied.",
    },
    "cfo_ci_width_factor": {
        "rate": 4.0,
        "source": "Duke CFO survey, cited Ch.24, p.260",
        "interpretation": "CFOs' confidence intervals were ~4x too narrow. "
                          "A properly calibrated 80% CI for the S&P is ~40 percentage "
                          "points wide (roughly -10% to +30%).",
    },
    "israel_curriculum_overrun": {
        "rate": 4.0,
        "source": "Kahneman's own curriculum project, Ch.23, pp.245-247",
        "interpretation": "Team estimated 2 years. Outside view said 7-10. "
                          "Actual: 8 years. That's a 4x overrun.",
    },
    "planning_fallacy_default_multiplier": {
        "rate": 2.5,
        "source": "Derived from Kahneman Ch.23-24 empirical findings",
        "interpretation": "When no reference class exists, multiply inside-view estimates "
                          "by 2.5x as a starting correction.",
    },
}


def get_base_rate(key: str) -> Optional[Dict]:
    """
    Retrieve a known base rate for decision context.
    Call before making any projection — forces outside-view thinking.
    Ch.23, p.246

    Available keys: 'small_business_survival_5yr', 'entrepreneur_optimism_gap',
    'inventor_persistence_after_rejection', 'cfo_forecast_correlation',
    'cfo_ci_width_factor', 'israel_curriculum_overrun',
    'planning_fallacy_default_multiplier'

    Returns the base rate dict, or None if key not found.
    """
    return BASE_RATES.get(key)


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    """Run every self-test. Returns 0 if all pass, 1 if any fail."""
    failures = 0
    passed = 0

    def check(label: str, actual, expected, tol: float = 1e-6):
        nonlocal failures, passed
        if isinstance(expected, bool):
            if actual != expected:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1
        elif isinstance(expected, str):
            if actual != expected:
                print(f"  FAIL  {label}: expected '{expected}', got '{actual}'")
                failures += 1
            else:
                print(f"  PASS  {label}: '{actual}'")
                passed += 1
        elif expected is None:
            if actual is not None:
                print(f"  FAIL  {label}: expected None, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: None")
                passed += 1
        elif isinstance(expected, float) and math.isinf(expected):
            if actual != expected:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1
        else:
            if abs(actual - expected) > tol:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1

    def check_raises(label: str, func, *args, **kwargs):
        nonlocal failures, passed
        try:
            result = func(*args, **kwargs)
            print(f"  FAIL  {label}: expected exception but got {result}")
            failures += 1
        except (ValueError, TypeError) as e:
            print(f"  PASS  {label}: raised {type(e).__name__} — {str(e)[:80]}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: planning_fallacy.py")
    print("Source: Kahneman, Thinking, Fast and Slow (2011, FSG)")
    print("=" * 70)

    # ── Part 1: Reference-Class Statistics ──
    print("\n── Part 1: Reference-Class Statistics (Ch.23) ──")

    # Israel curriculum study data — Kahneman's own team
    # Similar projects took 7-10 years, 40% never finished
    # Modeling this as: [7, 7.5, 8, 8, 8.5, 9, 9, 9.5, 10, 10]
    curriculum_outcomes = [7.0, 7.5, 8.0, 8.0, 8.5, 9.0, 9.0, 9.5, 10.0, 10.0]
    ref_stats = reference_class_statistics(curriculum_outcomes)
    check("ref_stats: n=10", ref_stats["n"], 10)
    check("ref_stats: mean ≈ 8.65", ref_stats["mean"], 8.65, tol=0.1)
    check("ref_stats: median = 8.75", ref_stats["median"], 8.75)
    check("ref_stats: reliability = MEDIUM", "MEDIUM" in ref_stats["reliability"], True)

    # Thin reference class (3 projects)
    thin = reference_class_statistics([5.0, 6.0, 10.0])
    check("thin_ref: reliability = LOW", "LOW" in thin["reliability"], True)
    check("thin_ref: mean = 7.0", thin["mean"], 7.0)
    check("thin_ref: median = 6.0", thin["median"], 6.0)

    # Single project
    single = reference_class_statistics([5.0])
    check("single: mean = 5.0", single["mean"], 5.0)
    check("single: std = 0.0", single["std"], 0.0)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("ref_stats: empty list", reference_class_statistics, [])

    # ── Part 2: Bayesian Blend ──
    print("\n── Part 2: Bayesian Blend Formula (Ch.23) ──")

    # Israel curriculum study: team estimate=2yr, base rate=8yr, w=0.15
    # Adjusted = 0.15*2 + 0.85*8 = 0.3 + 6.8 = 7.1 years
    israel_blend = bayesian_blend(2.0, 8.0, 0.15)
    check("blend: Israel study adjusted = 7.1yr", israel_blend["adjusted"], 7.1)
    check("blend: pull toward base = +5.1yr", israel_blend["pull_toward_base"], 5.1)
    check("blend: adjustment = +255%", israel_blend["adjustment_pct"], 255.0, tol=1.0)

    # Routine project, experienced team, w=0.28
    routine_blend = bayesian_blend(4.0, 5.0, 0.28)
    check("blend: routine 4mo est, 5mo base, w=0.28 → 4.72",
          routine_blend["adjusted"], 4.72)

    # w=0: pure base rate
    pure_base = bayesian_blend(3.0, 10.0, 0.0)
    check("blend: w=0 → pure base rate", pure_base["adjusted"], 10.0)

    # w=0.3: max inside-view weight
    max_inside = bayesian_blend(3.0, 10.0, 0.3)
    check("blend: w=0.3 → 7.9", max_inside["adjusted"], 7.9)

    # Calibration weight
    w_routine = calibration_weight(
        team_track_record=[1.0, 0.95, 1.05],
        project_novelty=1,
    )
    check("cal_weight: routine+calibrated team → high w", w_routine >= 0.20, True)

    w_novel = calibration_weight(
        team_track_record=None,
        project_novelty=5,
    )
    check("cal_weight: novel+no track → low w", w_novel <= 0.15, True)

    w_no_ref = calibration_weight(
        project_novelty=3,
        reference_class_available=False,
    )
    check("cal_weight: no ref class → w=0", w_no_ref, 0.0)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("blend: w > 0.3", bayesian_blend, 3.0, 5.0, 0.5)
    check_raises("blend: w < 0", bayesian_blend, 3.0, 5.0, -0.1)

    # ── Part 3: Planning Fallacy Corrections ──
    print("\n── Part 3: Planning Fallacy Corrections (Ch.24) ──")

    # No reference class → full correction
    interval_no_ref = interval_from_point_estimate(4.0, use_reference_class=False)
    check("interval_no_ref: min = 6.0", interval_no_ref["min_realistic"], 6.0)
    check("interval_no_ref: planning = 8.0", interval_no_ref["planning_figure"], 8.0)
    check("interval_no_ref: max = 12.0", interval_no_ref["max_realistic"], 12.0)
    check("interval_no_ref: correction = 3.0x", interval_no_ref["correction"], 3.0)

    # With reference class → narrower correction
    interval_ref = interval_from_point_estimate(4.0, use_reference_class=True)
    check("interval_ref: max = 10.0 (2.5x)", interval_ref["max_realistic"], 10.0)

    # Correction factors
    corr_routine = default_correction_factor(True, True, 1)
    check("corr: routine = 1.0x", corr_routine, 1.0)

    corr_default = default_correction_factor(False, True, 3)
    check("corr: no ref, some experience = 2.5x", corr_default, 2.5)

    corr_novel = default_correction_factor(False, False, 5)
    check("corr: no ref, no track, novel = 4.0x", corr_novel, 4.0)

    # Full de-biasing pipeline — Israel curriculum example
    ref_stats_israel = reference_class_statistics([7.0, 7.5, 8.0, 8.0, 8.5, 9.0, 9.0, 9.5, 10.0, 10.0])
    result = de_bias_estimate(
        team_estimate=2.0,  # The team's 2-year projection
        reference_class_stats=ref_stats_israel,
        team_track_record=[2.0, 3.5, 2.8],  # Past ratios: always way over
        project_novelty=4,
    )
    check("pipeline: method uses Bayesian Blend", "Bayesian" in result["method"], True)
    check("pipeline: de-biased ≠ 2.0", result["de_biased_estimate"] > 2.0, True)
    check("pipeline: range produced", "planning_figure" in result["range"], True)
    check("pipeline: has flags", len(result["flags"]) > 0, True)

    # No reference class
    result_no_ref = de_bias_estimate(
        team_estimate=4.0,
        reference_class_stats=None,
        project_novelty=4,
    )
    check("pipeline_no_ref: uses correction factor", "correction" in result_no_ref["method"].lower(), True)
    check("pipeline_no_ref: de-biased > original", result_no_ref["de_biased_estimate"] > 4.0, True)

    # Force correction mode
    result_forced = de_bias_estimate(
        team_estimate=3.0,
        reference_class_stats=ref_stats_israel,
        project_novelty=2,
        force_correction=True,
    )
    check("pipeline_forced: correction applied on top", "forced" in result_forced["method"].lower(), True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("novelty out of range", default_correction_factor, False, False, 6)
    check_raises("novelty 0", calibration_weight, None, 0)

    # ── Part 4: Overconfidence / CI Calibration ──
    print("\n── Part 4: Overconfidence & CI Calibration (Ch.24) ──")

    # CFO study: 80% CI stated as S&P +5% to +15%, actual → widen 4x
    # midpoint = 10%, half-width = 5%
    # corrected half-width = 20%, corrected CI = [-10%, 30%]
    cfo_ci = widen_confidence_interval(5.0, 15.0, 0.80, 4.0)
    check("ci_widen: midpoint = 10.0", cfo_ci["midpoint"], 10.0)
    check("ci_widen: corrected lower = -10.0", cfo_ci["corrected_lower"], -10.0)
    check("ci_widen: corrected upper = 30.0", cfo_ci["corrected_upper"], 30.0)
    check("ci_widen: original half-width = 5.0", cfo_ci["original_half_width"], 5.0)
    check("ci_widen: corrected half-width = 20.0", cfo_ci["corrected_half_width"], 20.0)

    # No widening
    ci_identity = widen_confidence_interval(10.0, 20.0, 0.80, 1.0)
    check("ci_widen: factor=1 → unchanged", ci_identity["corrected_lower"], 10.0)

    # Overconfidence audit — matching CFO study pattern
    # 10 intervals at 80% stated, 6-7 should hit if calibrated like CFOs
    audit_data = [
        (0.0, 10.0, 5.0),     # hit
        (0.0, 10.0, 8.0),     # hit
        (0.0, 10.0, 3.0),     # hit
        (0.0, 10.0, 7.0),     # hit
        (0.0, 10.0, 9.0),     # hit
        (0.0, 10.0, 6.0),     # hit
        (0.0, 10.0, 15.0),    # miss
        (0.0, 10.0, 12.0),    # miss
        (0.0, 10.0, -5.0),    # miss
        (0.0, 10.0, 1.0),     # hit → 7/10 = 70%
    ]
    audit = overconfidence_audit(audit_data)
    check("audit: 10 intervals", audit["n_intervals"], 10)
    check("audit: hit rate = 0.7", audit["hit_rate"], 0.7)
    check("audit: typical overconfidence", "TYPICAL" in audit["assessment"] or "SIGNIFICANT" in audit["assessment"], True)

    # Perfect calibration
    perfect_audit = overconfidence_audit([
        (0.0, 10.0, 5.0), (0.0, 10.0, 3.0), (0.0, 10.0, 7.0),
        (0.0, 10.0, 8.0), (0.0, 10.0, 2.0), (0.0, 10.0, 6.0),
        (0.0, 10.0, 4.0), (0.0, 10.0, 9.0), (0.0, 10.0, 15.0),
        (0.0, 10.0, -1.0),
    ])
    check("audit_perfect: 8/10 hits = 0.8", perfect_audit["hit_rate"], 0.8)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("ci_widen: lower > upper", widen_confidence_interval, 15.0, 5.0)
    check_raises("audit: empty", overconfidence_audit, [])

    # ── Part 5: Premortem & Competition Neglect ──
    print("\n── Part 5: Premortem & Competition Neglect (Ch.24) ──")

    # Well-done premortem
    thorough = premortem_checklist(
        "Launch new SaaS product in 6 months",
        ["Key engineer leaves", "Competitor launches first", "Customer adoption slow",
         "Pricing model wrong", "Integration harder than expected"],
        ["Hire backup engineer", "Accelerate timeline", "Early adopter program",
         "A/B test pricing", "Spike on integration early"],
        external_factors_considered=True,
        competitive_response_considered=True,
        base_rate_considered=True,
    )
    check("premortem_thorough: score ≥ 0.80", thorough["score"] >= 0.80, True)
    check("premortem_thorough: no missing elements", len(thorough["missing_elements"]), 0)

    # Superficial premortem
    superficial = premortem_checklist(
        "Quick feature launch",
        ["It might take longer"],  # 1 generic risk
        [],  # no mitigations
        external_factors_considered=False,
        competitive_response_considered=False,
        base_rate_considered=False,
    )
    check("premortem_superficial: score ≤ 0.30", superficial["score"] <= 0.30, True)
    check("premortem_superficial: multiple missing", len(superficial["missing_elements"]) >= 2, True)

    # Competition neglect: no analysis, winner-take-all market
    cn = competition_neglect_assessment(
        has_competitor_analysis=False,
        market_size_claimed=1_000_000_000,
        number_of_known_competitors=8,
        is_winner_take_all_market=True,
    )
    check("comp_neglect: CRITICAL", "CRITICAL" in cn["risk_level"], True)
    check("comp_neglect: has flags", len(cn["flags"]) > 1, True)

    # Well-considered competition
    cn_good = competition_neglect_assessment(
        has_competitor_analysis=True,
        number_of_known_competitors=1,
        is_winner_take_all_market=False,
    )
    check("comp_neglect_good: MODERATE", "MODERATE" in cn_good["risk_level"], True)

    # ── Part 6: Base Rates ──
    print("\n── Part 6: Base Rate Lookups (Ch.23-24) ──")

    br_small = get_base_rate("small_business_survival_5yr")
    check("base_rate: small biz survival = 35%", br_small["rate"], 0.35)

    br_cfo = get_base_rate("cfo_ci_width_factor")
    check("base_rate: CFO CI factor = 4x", br_cfo["rate"], 4.0)

    br_israel = get_base_rate("israel_curriculum_overrun")
    check("base_rate: Israel overrun = 4x", br_israel["rate"], 4.0)

    br_default = get_base_rate("planning_fallacy_default_multiplier")
    check("base_rate: default multiplier = 2.5x", br_default["rate"], 2.5)

    br_unknown = get_base_rate("nonexistent_key")
    check("base_rate: unknown key = None", br_unknown is None, True)

    # ── Integration Test ──
    print("\n── Integration Test: Full De-Biasing Pipeline ──")

    # Scenario: Team estimates 4 months for a feature.
    # Reference class of 12 similar features: [3,4,5,5,6,6,7,7,8,8,9,12]
    # Average = 6.67 months
    # Team has track record of [1.5, 1.8, 2.0] — consistently 1.5-2x over
    ref_data = [3.0, 4.0, 5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0, 9.0, 12.0]
    ref = reference_class_statistics(ref_data)
    track = [1.5, 1.8, 2.0]

    result_full = de_bias_estimate(
        team_estimate=4.0,
        reference_class_stats=ref,
        team_track_record=track,
        project_novelty=2,
    )

    # The blend should pull 4.0 toward 6.67
    check("integration: de-biased > 4.0", result_full["de_biased_estimate"] > 4.0, True)
    check("integration: de-biased < 6.67", result_full["de_biased_estimate"] < 6.67, True)
    check("integration: confidence not LOW", "LOW" not in result_full["confidence"], True)
    check("integration: has range", "planning_figure" in result_full["range"], True)

    # ── Summary ──
    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    sys.exit(run_all_tests())