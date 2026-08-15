"""
workforce_calculator.py — arithmetic utility for the workforce-planning skill.

Provenance (§0.5, §14 build-honesty rules):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic workforce-planning-org-design plugin's
    SKILL.md references this script by name and describes its function signatures
    (fte, span_of_control, headcount_gap, scenario_projection) but the file itself
    was NOT included in the packaged plugin — only SKILL.md ships. Rather than
    invent depth that was not shipped (§0.5), this module implements exactly the
    formulas the source SKILL.md described in prose, and no more:

        - FTE                     = hours_worked / standard_hours
        - span_of_control         = direct_reports / managers
        - headcount_gap           = forecast - current  (positive = shortage; negative = redundancy)
        - scenario_projection     = base with ±pct multipliers producing (downside, base, upside)

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. The source plugin's SKILL.md cites 10 named
    public HR-analytics guides (AIHR, Korn Ferry, Orgvue, etc.) but those are
    commercial vendor sources, not the academic/institutional/authenticated books
    that §8.8 requires for a logical script. This utility therefore lives at
    Teams/People & Culture/hire/custom/workforce-planning/scripts/ as an
    agent-local utility until paired with a second authenticated book source
    per §8.0 minimum-two-books rule — at which point it graduates to
    Shared OS/logical/workforce_planning.py.

    Candidate second-source books when this graduation happens:
        - Cascio, W. F. (multiple editions). Managing Human Resources.
        - Bechet, T. P. (2008). Strategic Staffing.
        - An SHRM-certified textbook.

Self-tests:
    Run `python3 workforce_calculator.py --test` to verify the four functions.
    Every function has at least one edge-case assertion (zero, negative, etc.).

Assumptions this file explicitly does NOT bake in:
    - Standard-hours value (varies by jurisdiction and org policy: 2080/year US
      full-time; 1820/year with 5 weeks holiday; etc.). Passed as a parameter.
    - Span-of-control target range (source names 7-12 as a HEURISTIC, not a rule —
      this utility computes the ratio and leaves interpretation to the caller).
    - Upside/downside scenario percentages (business-driver-specific — passed in).
"""

from __future__ import annotations

import sys
from typing import Tuple


# ---------- FTE conversion ----------

def fte(hours_worked: float, standard_hours: float) -> float:
    """Full-Time Equivalent = hours worked / standard full-time hours.

    Args:
        hours_worked: The actual hours worked in the period (e.g., 1040 for
            half-time employee in a 2080-hour year).
        standard_hours: The standard full-time hours for the same period
            (e.g., 2080 for a US full-time year, or 40 for a full-time week).

    Returns:
        FTE value (float). 1.0 = full-time; 0.5 = half-time; 2.0 = one and a
        half FTE-equivalent of overtime, etc.

    Raises:
        ValueError: if standard_hours <= 0.
    """
    if standard_hours <= 0:
        raise ValueError("standard_hours must be > 0")
    if hours_worked < 0:
        raise ValueError("hours_worked must be >= 0")
    return hours_worked / standard_hours


# ---------- Span of control ----------

def span_of_control(direct_reports: int, managers: int) -> float:
    """Direct reports per manager.

    Args:
        direct_reports: Total number of direct reports across all managers.
        managers: Number of managers.

    Returns:
        Average span of control (direct reports per manager).

    Raises:
        ValueError: if managers <= 0 or direct_reports < 0.

    Note (from source and §Principles 6 of the SKILL.md that consumes this):
        Source names a 7-12 target as a HEURISTIC, not a rule. Widen for
        standardized/autonomous work; narrow for high-complexity/high-coordination
        work. This function computes the ratio and does not judge.
    """
    if managers <= 0:
        raise ValueError("managers must be > 0")
    if direct_reports < 0:
        raise ValueError("direct_reports must be >= 0")
    return direct_reports / managers


# ---------- Headcount gap ----------

def headcount_gap(current: int, forecast: int) -> int:
    """Forecast - current. Positive = shortage; negative = redundancy.

    Args:
        current: Current headcount in the function/team.
        forecast: Forecast headcount needed to serve the business driver.

    Returns:
        gap (int). > 0 means need to add; < 0 means capacity redundancy;
        0 means the current headcount matches the forecast exactly (rare
        in practice; usually indicates the forecast has not been done at
        enough granularity).
    """
    if current < 0:
        raise ValueError("current must be >= 0")
    if forecast < 0:
        raise ValueError("forecast must be >= 0")
    return forecast - current


# ---------- Scenario projection ----------

def scenario_projection(
    base: float,
    upside_pct: float,
    downside_pct: float,
) -> Tuple[float, float, float]:
    """Return (downside, base, upside) triad for a base forecast.

    Args:
        base: Base-case value (headcount, FTE, cost — anything).
        upside_pct: Upside multiplier as a decimal (e.g., 0.2 for +20%).
        downside_pct: Downside multiplier as a decimal (e.g., 0.15 for -15%).
            Passed as a POSITIVE value; the function subtracts it internally.

    Returns:
        (downside, base, upside) tuple.

    Raises:
        ValueError: if downside_pct >= 1 (would produce zero or negative
            downside, which is nonsensical for a headcount/FTE forecast).

    Note:
        Source Principle 2 (assumptions visible) — the caller MUST record
        the business-driver reasoning behind chosen upside_pct and
        downside_pct alongside any output of this function. This function
        does the arithmetic; it does not defend the assumption.
    """
    if downside_pct >= 1:
        raise ValueError("downside_pct must be < 1")
    if upside_pct < 0 or downside_pct < 0:
        raise ValueError("upside_pct and downside_pct must be >= 0")
    downside = base * (1 - downside_pct)
    upside = base * (1 + upside_pct)
    return (downside, base, upside)


# ---------- Self-tests ----------

def _run_tests() -> int:
    """Return 0 on all-pass, 1 on any failure."""
    failures = []

    # fte
    try:
        assert fte(2080, 2080) == 1.0
        assert fte(1040, 2080) == 0.5
        assert fte(0, 2080) == 0.0
        try:
            fte(1000, 0)
            failures.append("fte should raise on standard_hours=0")
        except ValueError:
            pass
        try:
            fte(-100, 2080)
            failures.append("fte should raise on negative hours_worked")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"fte: {e}")

    # span_of_control
    try:
        assert span_of_control(24, 3) == 8.0
        assert span_of_control(0, 1) == 0.0
        assert span_of_control(1, 1) == 1.0
        try:
            span_of_control(10, 0)
            failures.append("span_of_control should raise on managers=0")
        except ValueError:
            pass
        try:
            span_of_control(-1, 1)
            failures.append("span_of_control should raise on negative reports")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"span_of_control: {e}")

    # headcount_gap
    try:
        assert headcount_gap(10, 15) == 5   # shortage
        assert headcount_gap(15, 10) == -5  # redundancy
        assert headcount_gap(10, 10) == 0   # match
        try:
            headcount_gap(-1, 10)
            failures.append("headcount_gap should raise on negative current")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"headcount_gap: {e}")

    # scenario_projection
    try:
        d, b, u = scenario_projection(100, 0.2, 0.1)
        assert (d, b, u) == (90.0, 100, 120.0), (d, b, u)
        d2, b2, u2 = scenario_projection(50, 0, 0)
        assert (d2, b2, u2) == (50.0, 50, 50.0), (d2, b2, u2)
        try:
            scenario_projection(100, 0.2, 1.0)
            failures.append("scenario_projection should raise on downside_pct=1")
        except ValueError:
            pass
        try:
            scenario_projection(100, -0.1, 0.1)
            failures.append("scenario_projection should raise on negative upside_pct")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"scenario_projection: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(f"OK — 4 functions, all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
