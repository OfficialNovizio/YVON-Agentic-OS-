"""
training_program.py — arithmetic utility for the training-program-design skill.

Provenance (§0.5):
    IMPLEMENTED-FROM-DESCRIPTION. Anthropic training-program-design plugin's SKILL.md
    references this script by name and describes its functions (completion-rate calc,
    ROI estimator, 70-20-10 hour-allocation check, Kirkpatrick evaluation-timing helper)
    but the file was NOT included in the packaged plugin. Per §0.5 this module implements
    exactly the formulas the source SKILL.md described:

        - completion_rate(completions, enrolled)         = completions / enrolled
        - roi_estimate(business_value, program_cost)     = (value - cost) / cost
        - allocation_check_70_20_10(on_job, social, formal)  = percentage split + flag
        - kirkpatrick_timing_ok(months_since, level)     = boolean + reason
        - LEVEL_TIMING_TARGETS                           = level → months-min reference dict

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. §8.0 two-book minimum unmet.
    Candidate second-source books when this graduation happens:
        - Kirkpatrick, D. L. & Kirkpatrick, J. D. (2016). Kirkpatrick's Four Levels of
          Training Evaluation. ATD Press.
        - Rothwell, W. J. & Kazanas, H. C. Mastering the Instructional Design Process
          (institutional-source graduate text).

Self-tests: run `python3 training_program.py --test`.
"""

from __future__ import annotations

import sys
from typing import Dict, Tuple


# ---------- Kirkpatrick level → minimum months since training reference ----------

LEVEL_TIMING_TARGETS: Dict[int, Dict] = {
    1: {"name": "Reaction",  "min_months_since_training": 0,  "note": "Immediately post-training via short survey"},
    2: {"name": "Learning",  "min_months_since_training": 0,  "note": "Immediately post-training via assessment"},
    3: {"name": "Behavior",  "min_months_since_training": 3,  "note": "3-6 month window; earlier is unreliable per HRDQ"},
    4: {"name": "Results",   "min_months_since_training": 3,  "note": "3-6+ months; often longer for business-metric shifts"},
}


# ---------- Completion rate ----------

def completion_rate(completions: int, enrolled: int) -> float:
    """Fraction of enrolled participants who completed the program.

    Args:
        completions: Number of enrolled participants who completed.
        enrolled: Total number of enrolled participants.

    Returns:
        Completion rate as a float between 0.0 and 1.0.

    Raises:
        ValueError: if enrolled <= 0 or completions < 0 or completions > enrolled.
    """
    if enrolled <= 0:
        raise ValueError("enrolled must be > 0")
    if completions < 0:
        raise ValueError("completions must be >= 0")
    if completions > enrolled:
        raise ValueError(f"completions ({completions}) cannot exceed enrolled ({enrolled})")
    return completions / enrolled


# ---------- ROI estimate ----------

def roi_estimate(business_value: float, program_cost: float) -> float:
    """Directional ROI = (business_value - program_cost) / program_cost.

    Args:
        business_value: Estimated business value produced by the program (currency).
            Directional only — often hard to attribute precisely to a single program.
        program_cost: Total program cost (design + delivery + participant time).

    Returns:
        ROI as a float. 0.0 means break-even; 1.0 means 100% return; -1.0 means total loss.

    Raises:
        ValueError: if program_cost <= 0.
    """
    if program_cost <= 0:
        raise ValueError("program_cost must be > 0 (division by zero otherwise)")
    if business_value < 0:
        raise ValueError("business_value must be >= 0")
    return (business_value - program_cost) / program_cost


# ---------- 70-20-10 allocation check ----------

def allocation_check_70_20_10(
    hours_on_job: float,
    hours_social: float,
    hours_formal: float,
) -> Dict:
    """Report actual % split vs 70/20/10 target; flag imbalances.

    Args:
        hours_on_job: Hours in on-the-job practice / stretch assignment.
        hours_social: Hours in mentoring / social / community-of-practice.
        hours_formal: Hours in formal instruction (courses, workshops).

    Returns:
        Dict with pct_on_job, pct_social, pct_formal, flags list.

    Raises:
        ValueError: if any input is negative or total is 0.
    """
    for name, val in (("hours_on_job", hours_on_job), ("hours_social", hours_social), ("hours_formal", hours_formal)):
        if val < 0:
            raise ValueError(f"{name} must be >= 0; got {val}")
    total = hours_on_job + hours_social + hours_formal
    if total == 0:
        raise ValueError("total hours must be > 0")

    pct_on_job = (hours_on_job / total) * 100
    pct_social = (hours_social / total) * 100
    pct_formal = (hours_formal / total) * 100

    flags = []
    if pct_formal > 20:
        flags.append(
            f"formal_instruction_over_20_percent (actual {pct_formal:.1f}%) — 70-20-10 was probably violated"
        )
    if pct_on_job < 50:
        flags.append(
            f"on_the_job_under_50_percent (actual {pct_on_job:.1f}%) — the practice piece is under-designed"
        )
    if pct_social < 5:
        flags.append(
            f"social_component_under_5_percent (actual {pct_social:.1f}%) — mentoring/community piece is missing"
        )

    return {
        "pct_on_job": round(pct_on_job, 1),
        "pct_social": round(pct_social, 1),
        "pct_formal": round(pct_formal, 1),
        "target_70_20_10": {"on_job": 70, "social": 20, "formal": 10},
        "flags": flags,
    }


# ---------- Kirkpatrick evaluation timing ----------

def kirkpatrick_timing_ok(
    months_since_training: float,
    level: int,
) -> Tuple[bool, str]:
    """Check whether it's the right time to reliably measure a Kirkpatrick level.

    Args:
        months_since_training: How many months have passed since the training ended.
        level: Kirkpatrick level 1-4.

    Returns:
        (ok, reason) tuple.
        ok = True if timing is appropriate; False if too early (unreliable).
        reason = short explanation.

    Raises:
        ValueError: if level not in 1-4 or months_since_training < 0.
    """
    if level not in LEVEL_TIMING_TARGETS:
        raise ValueError(f"level must be 1-4; got {level}")
    if months_since_training < 0:
        raise ValueError("months_since_training must be >= 0")

    target = LEVEL_TIMING_TARGETS[level]
    if months_since_training < target["min_months_since_training"]:
        return (
            False,
            f"too early to measure Level {level} ({target['name']}) — need >= {target['min_months_since_training']} months, currently {months_since_training:.1f}. {target['note']}",
        )
    return (True, f"OK to measure Level {level} ({target['name']}) at {months_since_training:.1f} months. {target['note']}")


# ---------- Self-tests ----------

def _run_tests() -> int:
    failures = []

    # completion_rate
    try:
        assert completion_rate(50, 100) == 0.5
        assert completion_rate(100, 100) == 1.0
        assert completion_rate(0, 100) == 0.0
        try:
            completion_rate(101, 100)
            failures.append("completion_rate should raise when completions > enrolled")
        except ValueError:
            pass
        try:
            completion_rate(50, 0)
            failures.append("completion_rate should raise on enrolled=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"completion_rate: {e}")

    # roi_estimate
    try:
        assert roi_estimate(200, 100) == 1.0     # 100% return
        assert roi_estimate(100, 100) == 0.0     # break-even
        assert roi_estimate(0, 100) == -1.0      # total loss
        try:
            roi_estimate(500, 0)
            failures.append("roi_estimate should raise on program_cost=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"roi_estimate: {e}")

    # allocation_check_70_20_10
    try:
        r = allocation_check_70_20_10(70, 20, 10)
        assert r["pct_on_job"] == 70.0
        assert r["pct_social"] == 20.0
        assert r["pct_formal"] == 10.0
        assert r["flags"] == []  # perfectly on target

        r2 = allocation_check_70_20_10(0, 0, 100)
        assert r2["pct_formal"] == 100.0
        assert any("formal" in f for f in r2["flags"])
        assert any("on_the_job" in f for f in r2["flags"])

        try:
            allocation_check_70_20_10(0, 0, 0)
            failures.append("allocation_check should raise on total=0")
        except ValueError:
            pass
        try:
            allocation_check_70_20_10(-1, 20, 10)
            failures.append("allocation_check should raise on negative hours")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"allocation_check_70_20_10: {e}")

    # kirkpatrick_timing_ok
    try:
        ok, _ = kirkpatrick_timing_ok(0, 1)
        assert ok is True   # Reaction OK immediately

        ok, _ = kirkpatrick_timing_ok(0, 2)
        assert ok is True   # Learning OK immediately

        ok, _ = kirkpatrick_timing_ok(1, 3)
        assert ok is False  # Behavior too early at 1 month

        ok, _ = kirkpatrick_timing_ok(4, 3)
        assert ok is True   # Behavior OK at 4 months

        ok, _ = kirkpatrick_timing_ok(2, 4)
        assert ok is False  # Results too early at 2 months

        ok, _ = kirkpatrick_timing_ok(6, 4)
        assert ok is True   # Results OK at 6 months

        try:
            kirkpatrick_timing_ok(1, 5)
            failures.append("kirkpatrick_timing_ok should raise on level=5")
        except ValueError:
            pass
        try:
            kirkpatrick_timing_ok(-1, 3)
            failures.append("kirkpatrick_timing_ok should raise on negative months")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"kirkpatrick_timing_ok: {e}")

    # LEVEL_TIMING_TARGETS integrity
    try:
        assert set(LEVEL_TIMING_TARGETS.keys()) == {1, 2, 3, 4}
        for lvl, meta in LEVEL_TIMING_TARGETS.items():
            assert "name" in meta and "min_months_since_training" in meta and "note" in meta
    except AssertionError as e:
        failures.append(f"LEVEL_TIMING_TARGETS: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 4 functions + LEVEL_TIMING_TARGETS, all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
