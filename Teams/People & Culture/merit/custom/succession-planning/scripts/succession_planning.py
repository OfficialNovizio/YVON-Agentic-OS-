"""
succession_planning.py — arithmetic utility for the succession-planning skill.

Provenance (§0.5):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic career-pathing-succession-planning plugin's
    SKILL.md references this script by name and describes its functions (9-box label lookup,
    bench-strength scoring weighted by readiness level, risk-flag classification) but the
    file was NOT included in the packaged plugin.

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. §8.0 two-book minimum unmet.
    Candidate second-source books for graduation:
      - Rothwell, W. J. Effective Succession Planning (shared candidate with grove's book-requirements).
      - Charan, R., Drotter, S., & Noel, J. The Leadership Pipeline.

Self-tests: run `python3 succession_planning.py --test`.
"""

from __future__ import annotations

import sys
from typing import Dict, List, Optional


# ---------- 9-box grid reference ----------

NINE_BOX_GRID: Dict[str, str] = {
    "high_performance,low_potential":    "Trusted Professional",
    "high_performance,medium_potential": "High Performer",
    "high_performance,high_potential":   "Star / Future Leader",
    "medium_performance,low_potential":  "Inconsistent Player",
    "medium_performance,medium_potential": "Core Player",
    "medium_performance,high_potential": "High Potential",
    "low_performance,low_potential":     "Risk",
    "low_performance,medium_potential":  "Inconsistent",
    "low_performance,high_potential":    "Enigma",
}


READINESS_LEVELS = ("ready_now", "ready_1_2_years", "ready_3_5_years", "not_identified")


READINESS_WEIGHTS: Dict[str, int] = {
    "ready_now":       3,
    "ready_1_2_years": 2,
    "ready_3_5_years": 1,
    "not_identified":  0,
}


# ---------- 9-box label lookup ----------

def nine_box_label(performance: str, potential: str) -> str:
    """Look up the 9-box label for a performance × potential placement.

    Args:
        performance: one of "low_performance" / "medium_performance" / "high_performance".
        potential: one of "low_potential" / "medium_potential" / "high_potential".

    Returns:
        The 9-box label per NINE_BOX_GRID.

    Raises:
        KeyError: if the combination is not in NINE_BOX_GRID (i.e., invalid axis value).
    """
    key = f"{performance},{potential}"
    if key not in NINE_BOX_GRID:
        raise KeyError(f"invalid 9-box placement {key!r}; performance must be low/medium/high_performance, potential must be low/medium/high_potential")
    return NINE_BOX_GRID[key]


# ---------- Readiness weight ----------

def readiness_weight(readiness: str) -> int:
    """Return the numeric weight for a readiness level.

    Args:
        readiness: one of READINESS_LEVELS.

    Returns:
        Weight (3 / 2 / 1 / 0).

    Raises:
        ValueError: if readiness is not in READINESS_LEVELS.
    """
    if readiness not in READINESS_WEIGHTS:
        raise ValueError(f"readiness must be one of {list(READINESS_LEVELS)}; got {readiness!r}")
    return READINESS_WEIGHTS[readiness]


# ---------- Bench-strength scoring ----------

def bench_strength_score(candidates: List[Dict]) -> int:
    """Compute per-critical-role bench-strength score across candidates.

    Args:
        candidates: List of dicts each with at least a 'readiness' key set to one of
            READINESS_LEVELS. Extra keys (name, notes) are preserved but ignored.

    Returns:
        Sum of readiness weights across candidates.

    Raises:
        KeyError: if any candidate lacks 'readiness'.
        ValueError: propagated from readiness_weight().
    """
    total = 0
    for i, cand in enumerate(candidates):
        if "readiness" not in cand:
            raise KeyError(f"candidates[{i}] missing 'readiness' key")
        total += readiness_weight(cand["readiness"])
    return total


# ---------- Risk flag classification ----------

def risk_flag(bench_score: int) -> str:
    """Classify per-critical-role bench-strength score into a risk flag.

    Args:
        bench_score: sum from bench_strength_score() (>= 0).

    Returns:
        'critical' | 'high_risk' | 'moderate' | 'healthy':
          - critical  : score == 0  (no identified successors — governance escalation)
          - high_risk : score == 1  (single 3-5yr candidate)
          - moderate  : 2 <= score <= 3  (one 1-2yr + one 3-5yr, or one Ready Now alone)
          - healthy   : score >= 4  (Ready Now + 1-2yr, or two Ready Now, etc.)

    Raises:
        ValueError: if bench_score < 0.
    """
    if bench_score < 0:
        raise ValueError(f"bench_score must be >= 0; got {bench_score}")
    if bench_score == 0:
        return "critical"
    if bench_score == 1:
        return "high_risk"
    if bench_score <= 3:
        return "moderate"
    return "healthy"


# ---------- Self-tests ----------

def _run_tests() -> int:
    failures = []

    # nine_box_label
    try:
        assert nine_box_label("high_performance", "high_potential") == "Star / Future Leader"
        assert nine_box_label("medium_performance", "medium_potential") == "Core Player"
        assert nine_box_label("low_performance", "low_potential") == "Risk"
        assert nine_box_label("high_performance", "low_potential") == "Trusted Professional"
        try:
            nine_box_label("very_high", "high_potential")
            failures.append("nine_box_label should raise on invalid performance level")
        except KeyError:
            pass
    except AssertionError as e:
        failures.append(f"nine_box_label: {e}")

    # readiness_weight
    try:
        assert readiness_weight("ready_now") == 3
        assert readiness_weight("ready_1_2_years") == 2
        assert readiness_weight("ready_3_5_years") == 1
        assert readiness_weight("not_identified") == 0
        try:
            readiness_weight("ready_someday")
            failures.append("readiness_weight should raise on unknown readiness level")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"readiness_weight: {e}")

    # bench_strength_score
    try:
        # No candidates → 0
        assert bench_strength_score([]) == 0
        # One Ready Now → 3
        assert bench_strength_score([{"readiness": "ready_now"}]) == 3
        # Ready Now + 1-2yr → 5 (healthy)
        assert bench_strength_score([{"readiness": "ready_now"}, {"readiness": "ready_1_2_years"}]) == 5
        # Two 3-5yr + one not_identified → 2 (moderate)
        assert bench_strength_score([
            {"readiness": "ready_3_5_years"},
            {"readiness": "ready_3_5_years"},
            {"readiness": "not_identified"},
        ]) == 2
        try:
            bench_strength_score([{"name": "X"}])   # missing readiness
            failures.append("bench_strength_score should raise on missing readiness")
        except KeyError:
            pass
    except AssertionError as e:
        failures.append(f"bench_strength_score: {e}")

    # risk_flag
    try:
        assert risk_flag(0) == "critical"       # zero successors
        assert risk_flag(1) == "high_risk"      # single 3-5yr
        assert risk_flag(2) == "moderate"       # e.g., 1-2yr + not_identified, or two 3-5yr
        assert risk_flag(3) == "moderate"       # e.g., one Ready Now, or 1-2yr + 3-5yr
        assert risk_flag(4) == "healthy"        # e.g., Ready Now + 1-2yr
        assert risk_flag(6) == "healthy"        # two Ready Now
        try:
            risk_flag(-1)
            failures.append("risk_flag should raise on negative score")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"risk_flag: {e}")

    # NINE_BOX_GRID integrity — 9 entries, all 3×3 combinations
    try:
        assert len(NINE_BOX_GRID) == 9
        for perf in ("low_performance", "medium_performance", "high_performance"):
            for pot in ("low_potential", "medium_potential", "high_potential"):
                key = f"{perf},{pot}"
                assert key in NINE_BOX_GRID, f"missing 9-box entry: {key}"
    except AssertionError as e:
        failures.append(f"NINE_BOX_GRID: {e}")

    # READINESS_LEVELS and WEIGHTS integrity
    try:
        assert set(READINESS_LEVELS) == set(READINESS_WEIGHTS.keys())
        assert len(READINESS_LEVELS) == 4
    except AssertionError as e:
        failures.append(f"READINESS_LEVELS/WEIGHTS: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 4 functions + 3 references (NINE_BOX_GRID, READINESS_LEVELS, READINESS_WEIGHTS), all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
