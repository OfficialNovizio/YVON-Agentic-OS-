"""
people_analytics.py — canonical HR-metrics utility for the P&C department.

Provenance (§0.5, §13.6):
    Built at task #12 of the P&C department roll-out. Per §13.6, this consolidates
    metric definitions that are currently implemented across 5 agent-local utilities
    (maslow's wellbeing_monitor.py + recognition_program.py; grove's training_program.py
    + training_ops.py; merit's succession_planning.py + hr_scorecard.py). Local utilities
    continue to work; migration to import from here is a future task per operator
    decision 2026-07-31.

    IMPLEMENTED-FROM-DESCRIPTION per §0.5 — the canonical definitions come from AIHR /
    SHRM / Josh Bersin / Google re:Work vendor + institutional sources documented in
    the sibling SKILL.md.

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script yet. §8.0 two-book minimum unmet; §8.8 authentication
    check: AIHR is vendor / practitioner source; SHRM is institutional but not academic;
    Josh Bersin is practitioner-analyst; re:Work is Google institutional. Two clean
    authenticated academic sources needed for §8.0 promotion.

    Candidate books for graduation:
      - Guenole, N., Ferrar, J., & Feinzig, S. (2017). The Power of People. Pearson FT
        Press. Named practitioner-academic HR-analytics text.
      - Boudreau, J. W. & Ramstad, P. M. (2007). Beyond HR: The New Science of Human
        Capital. Harvard Business School Press. Named academic (Boudreau, Cornell / USC).
      - Fitz-Enz, J. The New HR Analytics. AMACOM.

Self-tests: run `python3 people_analytics.py --test`.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


# ---------- Reference: healthy interpretive bands (heuristic per §0.6) ----------

HEALTHY_BANDS: Dict[str, Dict[str, Any]] = {
    "voluntary_turnover_annualized": {
        "band_min": 0.10,
        "band_max": 0.15,
        "note": "Typical range for tech / knowledge-work industries per AIHR / Bersin research; heuristic, not universal.",
    },
    "first_year_attrition": {
        "band_max_healthy": 0.20,
        "note": "Above ~20% suggests hiring-loop or onboarding mismatch. Heuristic per AIHR.",
    },
    "training_completion_rate": {
        "band_min_healthy": 0.80,
        "note": "Compliance training targets typically >= 95%; non-mandatory training >= 80% signals engagement.",
    },
    "engagement_delta_stable": {
        "band_abs_max_stable": 0.30,
        "note": "|Δ| < 0.3 on a 5-point scale is stable; ≥ +0.3 rising; ≤ -0.3 declining. Heuristic per §0.6.",
    },
}


# ---------- Result dataclass ----------

@dataclass
class MetricResult:
    """Citation-ready result for a metric calculation."""
    metric_name: str
    value: Optional[float]
    definition: str
    cohort: str = "unspecified"
    cycle: str = "unspecified"
    suppression_status: str = "PUBLISHED"          # or "SUPPRESSED_BELOW_THRESHOLD"
    consumer_agents: List[str] = field(default_factory=list)
    interpretive_band_reference: Optional[Dict[str, Any]] = None


# ---------- Cross-cutting: minimum-group-size suppression ----------

def min_group_size_ok(cohort_size: int, threshold: int = 5) -> bool:
    """Canonical minimum-group-size boolean check.

    Args:
        cohort_size: Number of people in the cohort.
        threshold: Minimum size for segmented figures to be reportable. Default 5
            (typical HR privacy floor).

    Returns:
        True if cohort_size >= threshold, False otherwise.

    Raises:
        ValueError: if either input is negative.
    """
    if cohort_size < 0 or threshold < 0:
        raise ValueError("cohort_size and threshold must be >= 0")
    return cohort_size >= threshold


def suppress_if_small(value, cohort_size: int, threshold: int = 5):
    """Return value if cohort meets threshold, else None (SUPPRESSED)."""
    if min_group_size_ok(cohort_size, threshold):
        return value
    return None


# ---------- Category 1: Talent flow ----------

def voluntary_turnover_rate(
    voluntary_leavers: int,
    avg_headcount: float,
    period_months: int = 12,
) -> float:
    """Voluntary turnover rate. Annualized by default.

    Args:
        voluntary_leavers: Count of voluntary departures in period. Excludes
            involuntary terminations, retirements, contract-end.
        avg_headcount: Average headcount over the period.
        period_months: Period length. Result annualized to compare across periods.

    Returns:
        Annualized voluntary turnover rate (0.0-1.0+).

    Raises:
        ValueError: if avg_headcount <= 0 or voluntary_leavers < 0 or period_months <= 0.
    """
    if avg_headcount <= 0:
        raise ValueError("avg_headcount must be > 0")
    if voluntary_leavers < 0:
        raise ValueError("voluntary_leavers must be >= 0")
    if period_months <= 0:
        raise ValueError("period_months must be > 0")
    period_rate = voluntary_leavers / avg_headcount
    annualization = 12 / period_months
    return period_rate * annualization


def regrettable_turnover_rate(
    high_perf_voluntary_leavers: int,
    avg_headcount: float,
    period_months: int = 12,
) -> float:
    """Regrettable turnover rate — voluntary leavers rated high performance.

    Same shape as voluntary_turnover_rate; different numerator.

    Args:
        high_perf_voluntary_leavers: Voluntary leavers rated high perf (typically 9-box
            Star / Future Leader / Trusted Professional bands per merit's succession-planning).
        avg_headcount: Average headcount over the period.
        period_months: Period length.

    Returns:
        Annualized regrettable turnover rate.
    """
    return voluntary_turnover_rate(high_perf_voluntary_leavers, avg_headcount, period_months)


def first_year_attrition(
    twelve_month_departures: int,
    same_cohort_hires: int,
) -> float:
    """First-year attrition for a hire cohort measured at 12-month mark.

    Args:
        twelve_month_departures: New hires who left within 12 months of hire.
        same_cohort_hires: Total hires in the same cohort period.

    Returns:
        Rate (0.0-1.0).

    Raises:
        ValueError: if same_cohort_hires <= 0 or twelve_month_departures < 0 or
            twelve_month_departures > same_cohort_hires.
    """
    if same_cohort_hires <= 0:
        raise ValueError("same_cohort_hires must be > 0")
    if twelve_month_departures < 0:
        raise ValueError("twelve_month_departures must be >= 0")
    if twelve_month_departures > same_cohort_hires:
        raise ValueError(f"twelve_month_departures ({twelve_month_departures}) cannot exceed same_cohort_hires ({same_cohort_hires})")
    return twelve_month_departures / same_cohort_hires


def time_to_fill_median_days(days_list: List[int]) -> float:
    """Median days from req-open to accepted-offer.

    Args:
        days_list: List of days-to-fill per closed req in the period.

    Returns:
        Median (not mean — long-tail single reqs skew mean).

    Raises:
        ValueError: if days_list is empty or contains negative values.
    """
    if not days_list:
        raise ValueError("days_list must be non-empty")
    if any(d < 0 for d in days_list):
        raise ValueError("all days values must be >= 0")
    sorted_days = sorted(days_list)
    n = len(sorted_days)
    if n % 2 == 1:
        return float(sorted_days[n // 2])
    return (sorted_days[n // 2 - 1] + sorted_days[n // 2]) / 2


# ---------- Category 2: Comp & benefits ----------

def cost_per_hire(
    internal_costs: float,
    external_costs: float,
    hires_in_period: int,
) -> float:
    """Cost per hire = (internal + external) / hires.

    Args:
        internal_costs: Interviewer time loaded, recruiter time, systems costs allocated.
        external_costs: ATS fees, sourcing tools, external recruiter fees, referral bonuses.
        hires_in_period: Number of hires closed in the period.

    Returns:
        Cost per hire (currency-agnostic).

    Raises:
        ValueError: if hires_in_period <= 0 or any cost is negative.
    """
    if hires_in_period <= 0:
        raise ValueError("hires_in_period must be > 0")
    if internal_costs < 0 or external_costs < 0:
        raise ValueError("costs must be >= 0")
    return (internal_costs + external_costs) / hires_in_period


# ---------- Category 3: Engagement & culture ----------

def enps(promoters: int, passives: int, detractors: int) -> int:
    """Employee Net Promoter Score = %promoters - %detractors.

    Canonical version — maslow's wellbeing_monitor.py has a local implementation that
    will eventually migrate to import from here per §13.6.

    Args:
        promoters: Count of responses in 9-10 band.
        passives: Count of responses in 7-8 band.
        detractors: Count of responses in 0-6 band.

    Returns:
        eNPS as integer (-100 to +100).

    Raises:
        ValueError: if total is 0 or any input is negative.
    """
    if promoters < 0 or passives < 0 or detractors < 0:
        raise ValueError("counts must be >= 0")
    total = promoters + passives + detractors
    if total == 0:
        raise ValueError("total responses must be > 0")
    return round(((promoters / total) - (detractors / total)) * 100)


def engagement_delta(current_score: float, previous_score: float) -> Dict[str, Any]:
    """Cross-cycle engagement score delta + trend label.

    Args:
        current_score: Current cycle aggregate engagement score (typically 1-5 scale).
        previous_score: Previous cycle same-scope aggregate engagement score.

    Returns:
        Dict with delta (float) + trend ('rising' / 'stable' / 'declining').

    Threshold: |Δ| < 0.3 stable; Δ ≥ +0.3 rising; Δ ≤ -0.3 declining (heuristic per §0.6).
    """
    if current_score < 0 or previous_score < 0:
        raise ValueError("scores must be >= 0")
    delta = current_score - previous_score
    if delta >= 0.3:
        trend = "rising"
    elif delta <= -0.3:
        trend = "declining"
    else:
        trend = "stable"
    return {"delta": round(delta, 3), "trend": trend, "heuristic_flag": True}


# ---------- Category 4: Capability & development ----------

def training_completion_rate(completions: int, enrolled: int) -> float:
    """Training completion rate = completions / enrolled.

    Canonical version — grove's training_program.py has a local implementation.
    """
    if enrolled <= 0:
        raise ValueError("enrolled must be > 0")
    if completions < 0:
        raise ValueError("completions must be >= 0")
    if completions > enrolled:
        raise ValueError(f"completions ({completions}) cannot exceed enrolled ({enrolled})")
    return completions / enrolled


READINESS_WEIGHTS: Dict[str, int] = {
    "ready_now": 3,
    "ready_1_2_years": 2,
    "ready_3_5_years": 1,
    "not_identified": 0,
}


def bench_strength_score(candidates: List[Dict[str, str]]) -> int:
    """Bench-strength score = sum of readiness weights across identified successors.

    Canonical version — merit's succession_planning.py has a local implementation.
    """
    total = 0
    for i, cand in enumerate(candidates):
        readiness = cand.get("readiness")
        if readiness not in READINESS_WEIGHTS:
            raise ValueError(f"candidates[{i}] readiness {readiness!r} not in {list(READINESS_WEIGHTS.keys())}")
        total += READINESS_WEIGHTS[readiness]
    return total


def risk_flag(bench_score: int) -> str:
    """Classify bench-strength score into risk flag.

    critical=0 / high_risk=1 / moderate=2-3 / healthy>=4.

    Canonical version — merit's succession_planning.py has a local implementation.
    """
    if bench_score < 0:
        raise ValueError("bench_score must be >= 0")
    if bench_score == 0:
        return "critical"
    if bench_score == 1:
        return "high_risk"
    if bench_score <= 3:
        return "moderate"
    return "healthy"


def skill_gap_closure_rate(gaps_closed: int, gaps_identified: int) -> float:
    """Skill-gap closure rate = gaps closed / gaps identified in previous cycle.

    Args:
        gaps_closed: Number of gaps that improved to ≤1 level below target since
            previous cycle (i.e., moved from Novice/Developing to Proficient+, or
            from Proficient to Advanced).
        gaps_identified: Total gaps identified in the previous cycle for this scope.

    Returns:
        Rate (0.0-1.0).
    """
    if gaps_identified <= 0:
        raise ValueError("gaps_identified must be > 0")
    if gaps_closed < 0:
        raise ValueError("gaps_closed must be >= 0")
    if gaps_closed > gaps_identified:
        raise ValueError(f"gaps_closed ({gaps_closed}) cannot exceed gaps_identified ({gaps_identified})")
    return gaps_closed / gaps_identified


# ---------- Category 5: DE&I funnel ----------

def di_funnel_by_stage(
    counts_by_category_by_stage: Dict[str, Dict[str, int]],
    threshold: int = 5,
) -> Dict[str, Dict[str, Any]]:
    """D&I funnel counts by self-ID category at each stage.

    Args:
        counts_by_category_by_stage: Nested dict — stage → self_id_category → count.
            Example: {'applied': {'catA': 200, 'catB': 150}, 'interviewed': {...}, ...}
        threshold: Minimum-group-size suppression threshold (default 5).

    Returns:
        Same shape, with per-cell suppression applied. Cells below threshold are
        replaced with {'count': None, 'status': 'SUPPRESSED_BELOW_THRESHOLD'}.
        Cells above threshold have {'count': N, 'status': 'PUBLISHED'}.
    """
    out: Dict[str, Dict[str, Any]] = {}
    for stage, cat_counts in counts_by_category_by_stage.items():
        out[stage] = {}
        for category, count in cat_counts.items():
            if not min_group_size_ok(count, threshold):
                out[stage][category] = {"count": None, "status": "SUPPRESSED_BELOW_THRESHOLD"}
            else:
                out[stage][category] = {"count": count, "status": "PUBLISHED"}
    return out


# ---------- Self-tests ----------

def _run_tests() -> int:
    failures = []

    # min_group_size_ok / suppress_if_small
    try:
        assert min_group_size_ok(5, 5) is True
        assert min_group_size_ok(4, 5) is False
        assert suppress_if_small(42, 5, 5) == 42
        assert suppress_if_small(42, 4, 5) is None
    except AssertionError as e:
        failures.append(f"min_group_size_ok / suppress: {e}")

    # voluntary_turnover_rate
    try:
        assert voluntary_turnover_rate(10, 100, 12) == 0.10   # 10% annual
        assert voluntary_turnover_rate(5, 100, 6) == 0.10     # 5% in 6mo = 10% annualized
        try:
            voluntary_turnover_rate(10, 0, 12)
            failures.append("voluntary_turnover_rate should raise on avg_headcount=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"voluntary_turnover_rate: {e}")

    # regrettable_turnover_rate
    try:
        assert regrettable_turnover_rate(3, 100, 12) == 0.03
    except AssertionError as e:
        failures.append(f"regrettable_turnover_rate: {e}")

    # first_year_attrition
    try:
        assert first_year_attrition(4, 20) == 0.20
        assert first_year_attrition(0, 20) == 0.0
        try:
            first_year_attrition(21, 20)
            failures.append("first_year_attrition should raise when departures > hires")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"first_year_attrition: {e}")

    # time_to_fill_median_days
    try:
        assert time_to_fill_median_days([30, 45, 60]) == 45.0        # odd count → middle
        assert time_to_fill_median_days([30, 40, 50, 60]) == 45.0    # even count → avg of middle two
        try:
            time_to_fill_median_days([])
            failures.append("time_to_fill_median_days should raise on empty")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"time_to_fill_median_days: {e}")

    # cost_per_hire
    try:
        assert cost_per_hire(50000, 100000, 10) == 15000.0
        try:
            cost_per_hire(50000, 100000, 0)
            failures.append("cost_per_hire should raise on hires=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"cost_per_hire: {e}")

    # enps
    try:
        assert enps(50, 30, 20) == 30   # %prom - %det = 50 - 20 = 30
        assert enps(0, 0, 100) == -100
        assert enps(100, 0, 0) == 100
        try:
            enps(0, 0, 0)
            failures.append("enps should raise on total=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"enps: {e}")

    # engagement_delta
    try:
        r = engagement_delta(4.0, 3.5)
        assert r["delta"] == 0.5 and r["trend"] == "rising"
        r = engagement_delta(3.5, 4.0)
        assert r["delta"] == -0.5 and r["trend"] == "declining"
        r = engagement_delta(3.5, 3.4)
        assert r["trend"] == "stable"                     # |Δ| = 0.1 < 0.3
    except AssertionError as e:
        failures.append(f"engagement_delta: {e}")

    # training_completion_rate
    try:
        assert training_completion_rate(80, 100) == 0.80
        try:
            training_completion_rate(101, 100)
            failures.append("training_completion_rate should raise when completions > enrolled")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"training_completion_rate: {e}")

    # bench_strength_score
    try:
        assert bench_strength_score([{"readiness": "ready_now"}, {"readiness": "ready_1_2_years"}]) == 5
        assert bench_strength_score([]) == 0
        try:
            bench_strength_score([{"readiness": "someday"}])
            failures.append("bench_strength_score should raise on invalid readiness")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"bench_strength_score: {e}")

    # risk_flag
    try:
        assert risk_flag(0) == "critical"
        assert risk_flag(1) == "high_risk"
        assert risk_flag(3) == "moderate"
        assert risk_flag(4) == "healthy"
    except AssertionError as e:
        failures.append(f"risk_flag: {e}")

    # skill_gap_closure_rate
    try:
        assert skill_gap_closure_rate(3, 5) == 0.6
    except AssertionError as e:
        failures.append(f"skill_gap_closure_rate: {e}")

    # di_funnel_by_stage
    try:
        counts = {
            "applied": {"catA": 100, "catB": 3},           # catB below threshold
            "hired": {"catA": 10, "catB": 1},              # catB below threshold
        }
        r = di_funnel_by_stage(counts, threshold=5)
        assert r["applied"]["catA"]["status"] == "PUBLISHED"
        assert r["applied"]["catA"]["count"] == 100
        assert r["applied"]["catB"]["status"] == "SUPPRESSED_BELOW_THRESHOLD"
        assert r["applied"]["catB"]["count"] is None
        assert r["hired"]["catB"]["status"] == "SUPPRESSED_BELOW_THRESHOLD"
    except AssertionError as e:
        failures.append(f"di_funnel_by_stage: {e}")

    # HEALTHY_BANDS integrity
    try:
        assert "voluntary_turnover_annualized" in HEALTHY_BANDS
        assert "first_year_attrition" in HEALTHY_BANDS
        assert "training_completion_rate" in HEALTHY_BANDS
        assert "engagement_delta_stable" in HEALTHY_BANDS
    except AssertionError as e:
        failures.append(f"HEALTHY_BANDS: {e}")

    # READINESS_WEIGHTS integrity
    try:
        assert READINESS_WEIGHTS["ready_now"] == 3
        assert READINESS_WEIGHTS["not_identified"] == 0
    except AssertionError as e:
        failures.append(f"READINESS_WEIGHTS: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 12 functions + 3 references (HEALTHY_BANDS, READINESS_WEIGHTS, MetricResult dataclass), all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
