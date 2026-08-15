"""
recognition_program.py — arithmetic utility for the recognition-program skill.

Provenance (§0.5, §14 build-honesty rules):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic recognition-rewards-program-design plugin's
    SKILL.md references this script by name and describes its function signatures
    (point-tier lookup, participation rate, timeliness status, per-capita equity check
    with min-group-size suppression) but the file itself was NOT included in the packaged
    plugin — only SKILL.md ships. Rather than invent depth that was not shipped (§0.5),
    this module implements exactly the formulas the source SKILL.md described:

        - tier_points(tier_name, tier_map)      = dict lookup for tier → points
        - participation_rate(actors, eligible)  = actors / eligible (0.0 to 1.0)
        - timeliness_status(median_days, target_days)  = classification
        - per_capita_recognition(count, cohort_size, threshold)  = per-person rate or
          None (suppressed) — reuses the min-group-size suppression logic

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. Same reasoning as wellbeing_monitor.py — mixed
    academic/vendor citations in the source SKILL.md; §8.0 two-book minimum unmet.
    Kept at Teams/People & Culture/maslow/custom/recognition-program/scripts/ as an
    agent-local utility until paired with an authenticated Total-Rewards textbook per §8.0.

    Candidate second-source books when this graduation happens:
        - Milkovich, G. T. & Newman, J. M. (multiple editions). Compensation. McGraw-Hill.
        - WorldatWork — Total Rewards Handbook (institutional source).
        - Zingheim, P. K. & Schuster, J. R. Pay People Right! Jossey-Bass.

Self-tests:
    Run `python3 recognition_program.py --test` to verify all functions.
    Every function has at least one edge-case assertion.
"""

from __future__ import annotations

import sys
from typing import Dict, Optional


# ---------- Tier lookup ----------

def tier_points(tier_name: str, tier_map: Dict[str, int]) -> int:
    """Look up point value for a named tier.

    Args:
        tier_name: The tier name (e.g., "peer_shout_out", "manager_recognition").
        tier_map: Dict mapping tier names to point values (operator-configured).

    Returns:
        The point value for the tier.

    Raises:
        KeyError: if tier_name is not in tier_map.
    """
    if tier_name not in tier_map:
        raise KeyError(
            f"tier {tier_name!r} not in tier_map (known: {sorted(tier_map.keys())})"
        )
    return tier_map[tier_name]


# ---------- Participation rate ----------

def participation_rate(actors: int, eligible: int) -> float:
    """Fraction of eligible people who participated in a cycle.

    Args:
        actors: Number of eligible people who gave (or received, per caller's frame)
            at least one recognition in the cycle.
        eligible: Total number of eligible people in the cycle.

    Returns:
        Participation rate as a float between 0.0 and 1.0.

    Raises:
        ValueError: if eligible <= 0 or actors < 0 or actors > eligible.
    """
    if eligible <= 0:
        raise ValueError("eligible must be > 0")
    if actors < 0:
        raise ValueError("actors must be >= 0")
    if actors > eligible:
        raise ValueError(f"actors ({actors}) cannot exceed eligible ({eligible})")
    return actors / eligible


# ---------- Timeliness status ----------

def timeliness_status(median_days: float, target_days: float = 2.0) -> str:
    """Classify median days-from-action-to-recognition against the target.

    Default target 2.0 days (48 hours) per source SKILL.md; ~24hr is optimal per
    Gallup research but 48hr is the ship-ready target.

    Args:
        median_days: Median days from the recognized action to the recognition being given.
        target_days: Target median in days (default 2.0 = 48 hours).

    Returns:
        'ON_TARGET' if median_days <= target_days
        'SLIPPED' if median_days <= target_days * 2 (still tolerable but slower)
        'FAILED' if median_days > target_days * 2 (fast pathway is broken)

    Raises:
        ValueError: if either input is negative.
    """
    if median_days < 0:
        raise ValueError("median_days must be >= 0")
    if target_days <= 0:
        raise ValueError("target_days must be > 0")
    if median_days <= target_days:
        return 'ON_TARGET'
    if median_days <= target_days * 2:
        return 'SLIPPED'
    return 'FAILED'


# ---------- Per-capita recognition + suppression ----------

def per_capita_recognition(
    recognition_count: int,
    cohort_size: int,
    threshold: int,
) -> Optional[float]:
    """Per-person recognition rate for a group, with min-group-size suppression.

    Args:
        recognition_count: Number of recognitions given (or received) by the cohort.
        cohort_size: Number of people in the cohort.
        threshold: Minimum cohort size for the segmented figure to be reportable.

    Returns:
        recognition_count / cohort_size if cohort_size >= threshold; None if the
        cohort is below the threshold (caller should replace None with a qualitative
        note like "reported qualitatively due to privacy-threshold suppression").

    Raises:
        ValueError: if any input is negative, or if cohort_size is 0 when
            recognition_count > 0.
    """
    if recognition_count < 0 or cohort_size < 0 or threshold < 0:
        raise ValueError("all inputs must be >= 0")
    if cohort_size == 0:
        if recognition_count == 0:
            return 0.0
        raise ValueError(
            f"cohort_size is 0 but recognition_count is {recognition_count} — "
            "data inconsistency"
        )
    if cohort_size < threshold:
        return None   # suppressed
    return recognition_count / cohort_size


# ---------- Self-tests ----------

def _run_tests() -> int:
    """Return 0 on all-pass, 1 on any failure."""
    failures = []

    # tier_points
    try:
        tm = {"peer_shout_out": 10, "manager_recognition": 50, "exceptional": 250}
        assert tier_points("peer_shout_out", tm) == 10
        assert tier_points("exceptional", tm) == 250
        try:
            tier_points("nonexistent", tm)
            failures.append("tier_points should raise on unknown tier")
        except KeyError:
            pass
    except AssertionError as e:
        failures.append(f"tier_points: {e}")

    # participation_rate
    try:
        assert participation_rate(50, 100) == 0.5
        assert participation_rate(100, 100) == 1.0
        assert participation_rate(0, 100) == 0.0
        try:
            participation_rate(50, 0)
            failures.append("participation_rate should raise on eligible=0")
        except ValueError:
            pass
        try:
            participation_rate(101, 100)
            failures.append("participation_rate should raise when actors > eligible")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"participation_rate: {e}")

    # timeliness_status
    try:
        assert timeliness_status(1.0, 2.0) == 'ON_TARGET'
        assert timeliness_status(2.0, 2.0) == 'ON_TARGET'
        assert timeliness_status(3.0, 2.0) == 'SLIPPED'
        assert timeliness_status(4.0, 2.0) == 'SLIPPED'
        assert timeliness_status(5.0, 2.0) == 'FAILED'
        assert timeliness_status(30.0, 2.0) == 'FAILED'
        # Default target = 2.0
        assert timeliness_status(1.5) == 'ON_TARGET'
        try:
            timeliness_status(-1)
            failures.append("timeliness_status should raise on negative median_days")
        except ValueError:
            pass
        try:
            timeliness_status(1.0, 0)
            failures.append("timeliness_status should raise on target_days=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"timeliness_status: {e}")

    # per_capita_recognition
    try:
        assert per_capita_recognition(20, 10, 5) == 2.0
        assert per_capita_recognition(15, 10, 5) == 1.5
        assert per_capita_recognition(20, 10, 15) is None   # suppressed
        assert per_capita_recognition(0, 10, 5) == 0.0
        assert per_capita_recognition(0, 0, 5) == 0.0    # zero recognition, zero cohort OK
        try:
            per_capita_recognition(5, 0, 5)
            failures.append("per_capita_recognition should raise on cohort=0 with recognitions")
        except ValueError:
            pass
        try:
            per_capita_recognition(-1, 10, 5)
            failures.append("per_capita_recognition should raise on negative recognition_count")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"per_capita_recognition: {e}")

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
