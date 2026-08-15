"""
skill_gap.py — arithmetic utility for the skill-gap-map skill.

Provenance (§0.5):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic skills-gap-analysis plugin's SKILL.md
    references this script by name and describes its functions (score assessments, compute
    gaps and priority scores, rank them, get build/buy/borrow/bridge recommendation) but
    the file itself was NOT included in the packaged plugin. Per §0.5 this module
    implements exactly the formulas the source SKILL.md described in prose:

        - gap(required, current)                  = max(0, required - current)
        - priority_score(gap_value, criticality)  = gap * criticality
        - rank_gaps(gap_list)                     = sort by priority_score desc
        - recommend_action(...)                   = decision tree over timeline,
                                                    buildability, and adjacent-skill fit
        - PROFICIENCY_SCALE                       = 1-5 level reference dict

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. §8.0 two-book minimum unmet; §8.8 vendor citations
    (McKinsey, Paylocity, Cornerstone, AIHR) are practitioner sources not authenticated
    academic. Kept at
    Teams/People & Culture/grove/custom/skill-gap-map/scripts/ as an agent-local utility
    until paired with an authenticated skills-analysis textbook per §8.0 — at which point
    it graduates to Shared OS/logical/skill_gap.py.

    Candidate second-source books when this graduation happens:
        - SHRM certified textbook (institutional source).
        - Whiddett, S. & Hollyforde, S. A Practical Guide to Competencies.
        - Rothwell, W. J. Effective Succession Planning (which touches gap analysis).

Self-tests:
    Run `python3 skill_gap.py --test` to verify all functions.
    Every function has at least one edge-case assertion.
"""

from __future__ import annotations

import sys
from typing import Dict, List, Tuple


# ---------- 1-5 proficiency scale reference ----------

PROFICIENCY_SCALE: Dict[int, Dict[str, str]] = {
    1: {"label": "Novice",     "definition": "Aware of the skill; no applied experience. Can define terms; cannot perform."},
    2: {"label": "Developing", "definition": "Can perform with guidance / supervision. Needs coaching mid-task."},
    3: {"label": "Proficient", "definition": "Can perform independently in standard situations. Handles routine cases without help."},
    4: {"label": "Advanced",   "definition": "Handles complex / non-standard situations; can guide others. Recognized team resource."},
    5: {"label": "Expert",     "definition": "Recognized authority; sets standards; trains others. Rare in most orgs."},
}


# ---------- Gap calculation ----------

def gap(required: int, current: int) -> int:
    """Compute the skill gap. Negative differences clamp to 0 (person meets or exceeds).

    Args:
        required: Required proficiency (1-5 per PROFICIENCY_SCALE).
        current: Current proficiency (1-5 per PROFICIENCY_SCALE).

    Returns:
        max(0, required - current). Gap is always >= 0; someone at or above required
        has a gap of 0, not a negative surplus (surplus is a separate concept handled
        elsewhere).

    Raises:
        ValueError: if either input is outside 1-5.
    """
    if required not in PROFICIENCY_SCALE:
        raise ValueError(f"required must be 1-5; got {required}")
    if current not in PROFICIENCY_SCALE:
        raise ValueError(f"current must be 1-5; got {current}")
    return max(0, required - current)


# ---------- Priority score ----------

def priority_score(gap_value: int, criticality: float) -> float:
    """gap * criticality.

    Args:
        gap_value: Non-negative gap (typically from gap() above).
        criticality: Float in [0, 1]. 1.0 = directly gates the business driver;
            0.1 = nice-to-have; ~0.5 = supportive but not essential.

    Returns:
        gap_value * criticality.

    Raises:
        ValueError: if gap_value < 0 or criticality outside [0, 1].
    """
    if gap_value < 0:
        raise ValueError(f"gap_value must be >= 0; got {gap_value}")
    if not (0.0 <= criticality <= 1.0):
        raise ValueError(f"criticality must be in [0, 1]; got {criticality}")
    return gap_value * criticality


# ---------- Rank gaps ----------

def rank_gaps(gap_list: List[Dict]) -> List[Dict]:
    """Sort a list of gap dicts by priority_score descending.

    Args:
        gap_list: List of dicts each containing at least 'priority_score' (float).
            Additional keys (skill, person, gap, criticality, etc.) are preserved.

    Returns:
        New list sorted by priority_score descending (ties broken by insertion order).

    Raises:
        KeyError: if any dict lacks 'priority_score'.
    """
    for i, item in enumerate(gap_list):
        if "priority_score" not in item:
            raise KeyError(f"gap_list[{i}] missing 'priority_score' key")
    return sorted(gap_list, key=lambda x: x["priority_score"], reverse=True)


# ---------- Action recommendation ----------

def recommend_action(
    gap_value: int,
    criticality: float,
    time_available_months: float,
    time_to_build_months: float,
    internally_buildable: bool,
    related_skill_exists_internally: bool,
) -> Tuple[str, str]:
    """Recommend Build / Buy / Borrow / Bridge based on inputs.

    Decision tree (in order):
        1. If related_skill_exists_internally AND time_available >= 1 month → 'Bridge'
           (redeployment is often the underused option per skill Principles 4).
        2. If internally_buildable AND time_available >= time_to_build → 'Build'.
        3. If gap × criticality is short-term (< 6 months of need) and not permanent →
           'Borrow' (contractor for the window).
        4. Else → 'Buy' (external hire for permanent capability).

    Args:
        gap_value: Non-negative gap.
        criticality: [0, 1].
        time_available_months: Months until the business driver requires the skill.
        time_to_build_months: Realistic domain-dependent estimate (per deliberate-practice
            Principle 3 — directional, not authoritative).
        internally_buildable: True if there's an internal Level 4-5 person to teach AND
            stretch-assignment scope for real practice.
        related_skill_exists_internally: True if someone at Level 3+ in an adjacent
            skill could reasonably Bridge.

    Returns:
        (action, rationale) tuple where action is one of 'Build' / 'Buy' / 'Borrow' /
        'Bridge' and rationale is a one-sentence explanation.

    Raises:
        ValueError: if gap_value < 0 or criticality outside [0, 1] or either time input
            is negative.
    """
    if gap_value < 0:
        raise ValueError(f"gap_value must be >= 0; got {gap_value}")
    if not (0.0 <= criticality <= 1.0):
        raise ValueError(f"criticality must be in [0, 1]; got {criticality}")
    if time_available_months < 0 or time_to_build_months < 0:
        raise ValueError("time_available_months and time_to_build_months must be >= 0")

    # No gap → no action recommended
    if gap_value == 0:
        return ("None", "current proficiency meets or exceeds required; no action needed")

    # Bridge check first (often underused)
    if related_skill_exists_internally and time_available_months >= 1:
        return (
            "Bridge",
            f"related skill exists internally and {time_available_months:.1f}mo available for a redeploy — check with workforce-planning before defaulting to Build or Buy",
        )

    # Build check (buildable + enough time)
    if internally_buildable and time_available_months >= time_to_build_months:
        return (
            "Build",
            f"internally buildable and {time_available_months:.1f}mo available exceeds {time_to_build_months:.1f}mo time-to-build; route to training-program-design",
        )

    # Borrow check (short-term / launch-window)
    if time_available_months < 6 and time_to_build_months > time_available_months:
        return (
            "Borrow",
            f"timeline is tight ({time_available_months:.1f}mo) and skill isn't internally buildable in that window; contractor route via payroll-and-eor",
        )

    # Buy (external hire) default
    return (
        "Buy",
        f"internally buildable={internally_buildable}; time_available={time_available_months:.1f}mo; time_to_build={time_to_build_months:.1f}mo — external hire via hiring-kit",
    )


# ---------- Self-tests ----------

def _run_tests() -> int:
    """Return 0 on all-pass, 1 on any failure."""
    failures = []

    # gap
    try:
        assert gap(4, 2) == 2
        assert gap(5, 5) == 0
        assert gap(3, 5) == 0    # clamp; person exceeds required
        assert gap(1, 1) == 0
        try:
            gap(6, 3)
            failures.append("gap should raise on required=6 (out of 1-5)")
        except ValueError:
            pass
        try:
            gap(3, 0)
            failures.append("gap should raise on current=0 (out of 1-5)")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"gap: {e}")

    # priority_score
    try:
        assert priority_score(3, 0.9) == 2.7
        assert priority_score(0, 0.9) == 0
        assert priority_score(4, 0.0) == 0
        try:
            priority_score(-1, 0.5)
            failures.append("priority_score should raise on negative gap_value")
        except ValueError:
            pass
        try:
            priority_score(2, 1.5)
            failures.append("priority_score should raise on criticality > 1")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"priority_score: {e}")

    # rank_gaps
    try:
        gaps_in = [
            {"skill": "A", "priority_score": 1.5},
            {"skill": "B", "priority_score": 2.7},
            {"skill": "C", "priority_score": 0.4},
        ]
        ranked = rank_gaps(gaps_in)
        assert [g["skill"] for g in ranked] == ["B", "A", "C"]
        assert rank_gaps([]) == []
        try:
            rank_gaps([{"skill": "X"}])   # missing priority_score
            failures.append("rank_gaps should raise on missing priority_score")
        except KeyError:
            pass
    except AssertionError as e:
        failures.append(f"rank_gaps: {e}")

    # recommend_action
    try:
        # Bridge case: related skill exists + timeline ok
        action, _ = recommend_action(
            gap_value=2, criticality=0.9,
            time_available_months=3, time_to_build_months=12,
            internally_buildable=False, related_skill_exists_internally=True,
        )
        assert action == "Bridge", action

        # Build case: buildable + enough time
        action, _ = recommend_action(
            gap_value=2, criticality=0.9,
            time_available_months=12, time_to_build_months=6,
            internally_buildable=True, related_skill_exists_internally=False,
        )
        assert action == "Build", action

        # Borrow case: tight timeline + not internally buildable in window
        action, _ = recommend_action(
            gap_value=3, criticality=0.9,
            time_available_months=3, time_to_build_months=12,
            internally_buildable=False, related_skill_exists_internally=False,
        )
        assert action == "Borrow", action

        # Buy case: permanent need, not buildable in time
        action, _ = recommend_action(
            gap_value=3, criticality=0.9,
            time_available_months=8, time_to_build_months=12,
            internally_buildable=False, related_skill_exists_internally=False,
        )
        assert action == "Buy", action

        # None case: no gap
        action, _ = recommend_action(
            gap_value=0, criticality=0.9,
            time_available_months=6, time_to_build_months=6,
            internally_buildable=True, related_skill_exists_internally=False,
        )
        assert action == "None", action

        try:
            recommend_action(
                gap_value=-1, criticality=0.5,
                time_available_months=1, time_to_build_months=1,
                internally_buildable=True, related_skill_exists_internally=False,
            )
            failures.append("recommend_action should raise on negative gap_value")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"recommend_action: {e}")

    # PROFICIENCY_SCALE integrity
    try:
        assert set(PROFICIENCY_SCALE.keys()) == {1, 2, 3, 4, 5}
        for lvl, meta in PROFICIENCY_SCALE.items():
            assert "label" in meta and "definition" in meta
    except AssertionError as e:
        failures.append(f"PROFICIENCY_SCALE: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 4 functions + PROFICIENCY_SCALE, all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
