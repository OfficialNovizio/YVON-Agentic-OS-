"""
wellbeing_monitor.py — arithmetic utility for the wellbeing-monitoring skill.

Provenance (§0.5, §14 build-honesty rules):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic employee-wellbeing-monitoring plugin's
    SKILL.md references this script by name and describes its function signatures
    (eNPS scoring, minimum-group-size suppression, aggregate burnout-risk flag) but the
    file itself was NOT included in the packaged plugin — only SKILL.md ships. Rather
    than invent depth that was not shipped (§0.5), this module implements exactly the
    formulas the source SKILL.md described in prose, and no more:

        - eNPS                    = %promoters (9-10) - %detractors (0-6)
        - min_group_size_ok       = boolean threshold check (cohort_size >= threshold)
        - suppress_if_small       = returns value or None based on the threshold
        - burnout_risk_flag       = boolean combination rule over sentiment + workload signals

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. The source plugin's SKILL.md cites vendor + institutional
    sources (Gallup, AIHR, Udext, ISO 45003) — mixed academic/institutional/vendor. Meets
    §8.8 partially (institutional sources qualify; vendor sources do not on their own).
    Kept as an agent-local utility at
    Teams/People & Culture/maslow/custom/wellbeing-monitoring/scripts/ until paired with a
    second authenticated book source per §8.0 — at which point it graduates to
    Shared OS/logical/wellbeing_monitor.py.

    Candidate second-source books when this graduation happens:
        - Maslach, C. & Leiter, M. P. (2016). The Burnout Challenge (or 1997's The Truth About Burnout).
        - Leiter, M. P. & Maslach, C. Burnout: A Multidimensional Perspective (academic).
        - ISO 45003:2021 as the institutional-source pair.

Assumptions this file explicitly does NOT bake in:
    - The specific minimum-group-size threshold (varies by org privacy policy; typically
      5-8). Passed as a parameter; caller is responsible for the correct value.
    - The burnout-risk RED/AMBER/GREEN thresholds are HEURISTICS from the source SKILL.md,
      not book-cited formulas. Flag as heuristic in output per §0.6.

Self-tests:
    Run `python3 wellbeing_monitor.py --test` to verify all functions.
    Every function has at least one edge-case assertion.
"""

from __future__ import annotations

import sys
from typing import Optional


# ---------- eNPS scoring ----------

def enps(promoters: int, passives: int, detractors: int) -> int:
    """Employee Net Promoter Score = %promoters - %detractors.

    Args:
        promoters: Count of responses in the 9-10 band.
        passives: Count of responses in the 7-8 band.
        detractors: Count of responses in the 0-6 band.

    Returns:
        eNPS as an integer between -100 and +100.

    Raises:
        ValueError: if total is 0 (nobody responded).
        ValueError: if any input is negative.
    """
    if promoters < 0 or passives < 0 or detractors < 0:
        raise ValueError("counts must be >= 0")
    total = promoters + passives + detractors
    if total == 0:
        raise ValueError("total responses must be > 0 (nobody responded — the drop IS the finding)")
    pct_promoters = (promoters / total) * 100
    pct_detractors = (detractors / total) * 100
    return round(pct_promoters - pct_detractors)


# ---------- Minimum-group-size suppression ----------

def min_group_size_ok(cohort_size: int, threshold: int) -> bool:
    """Check whether a cohort meets the minimum-group-size privacy threshold.

    Args:
        cohort_size: Number of people in the cohort.
        threshold: Minimum size for the segmented figure to be reportable
            (typically 5-8 per org privacy policy).

    Returns:
        True if cohort_size >= threshold, False otherwise.

    Raises:
        ValueError: if either input is negative.
    """
    if cohort_size < 0 or threshold < 0:
        raise ValueError("cohort_size and threshold must be >= 0")
    return cohort_size >= threshold


def suppress_if_small(value, cohort_size: int, threshold: int):
    """Return the value if the cohort meets the threshold, else None.

    Args:
        value: Any value that would be reported per-cohort (a number, string, etc.).
        cohort_size: Number of people in the cohort.
        threshold: Minimum size for the segmented figure to be reportable.

    Returns:
        The value if cohort_size >= threshold, otherwise None (caller should
        replace None with a qualitative note like "reported qualitatively due to
        privacy-threshold suppression").
    """
    if min_group_size_ok(cohort_size, threshold):
        return value
    return None


# ---------- Burnout-risk flag ----------

def burnout_risk_flag(
    enps_trend: str,
    workload_elevated: bool,
) -> str:
    """Aggregate burnout-risk flag per cohort.

    HEURISTIC — NOT a book-cited formula. Flag as heuristic in output per §0.6.

    Args:
        enps_trend: One of 'declining' / 'stable' / 'rising'. Interpreted as:
            - 'declining' with elevated workload → RED
            - 'declining' alone OR elevated workload alone → AMBER
            - 'stable'/'rising' with no elevated workload → GREEN
        workload_elevated: True if any of overtime / absenteeism / EAP-utilization
            aggregate signal is elevated relative to baseline. Caller determines
            "elevated" per their org's baseline.

    Returns:
        'RED' | 'AMBER' | 'GREEN'.

    Raises:
        ValueError: if enps_trend is not one of 'declining' / 'stable' / 'rising'.
    """
    valid_trends = {'declining', 'stable', 'rising'}
    if enps_trend not in valid_trends:
        raise ValueError(f"enps_trend must be one of {valid_trends}; got {enps_trend!r}")

    if enps_trend == 'declining' and workload_elevated:
        return 'RED'
    if enps_trend == 'declining' or workload_elevated:
        return 'AMBER'
    return 'GREEN'


# ---------- Self-tests ----------

def _run_tests() -> int:
    """Return 0 on all-pass, 1 on any failure."""
    failures = []

    # enps
    try:
        assert enps(50, 30, 20) == 30   # 50% promoters - 20% detractors
        assert enps(0, 0, 100) == -100  # all detractors
        assert enps(100, 0, 0) == 100   # all promoters
        assert enps(1, 1, 1) == 0       # equal split; %promoters - %detractors = 33 - 33 = 0
        try:
            enps(0, 0, 0)
            failures.append("enps should raise when total is 0")
        except ValueError:
            pass
        try:
            enps(-1, 0, 0)
            failures.append("enps should raise on negative counts")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"enps: {e}")

    # min_group_size_ok
    try:
        assert min_group_size_ok(5, 5) is True
        assert min_group_size_ok(4, 5) is False
        assert min_group_size_ok(0, 5) is False
        assert min_group_size_ok(100, 5) is True
        try:
            min_group_size_ok(-1, 5)
            failures.append("min_group_size_ok should raise on negative cohort_size")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"min_group_size_ok: {e}")

    # suppress_if_small
    try:
        assert suppress_if_small(42, 5, 5) == 42
        assert suppress_if_small(42, 4, 5) is None
        assert suppress_if_small("some value", 10, 5) == "some value"
        assert suppress_if_small("some value", 3, 5) is None
    except AssertionError as e:
        failures.append(f"suppress_if_small: {e}")

    # burnout_risk_flag
    try:
        assert burnout_risk_flag('declining', True) == 'RED'
        assert burnout_risk_flag('declining', False) == 'AMBER'
        assert burnout_risk_flag('stable', True) == 'AMBER'
        assert burnout_risk_flag('stable', False) == 'GREEN'
        assert burnout_risk_flag('rising', False) == 'GREEN'
        assert burnout_risk_flag('rising', True) == 'AMBER'
        try:
            burnout_risk_flag('nonsense', False)
            failures.append("burnout_risk_flag should raise on invalid trend")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"burnout_risk_flag: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 4 functions, all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
