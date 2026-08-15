"""
hr_scorecard.py — arithmetic utility for the hr-strategy-alignment skill.

Provenance (§0.5):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic hr-strategy-alignment plugin's SKILL.md
    references this script by name and describes its functions (per-entry progress,
    orphan-flagging in both directions, weighted alignment score by perspective + overall)
    but the file was NOT included in the packaged plugin.

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. §8.0 two-book minimum unmet.
    Candidate second-source books for graduation:
      - Kaplan, R. S. & Norton, D. P. (1996). The Balanced Scorecard: Translating
        Strategy into Action. Harvard Business School Press.
      - Becker, B. E., Huselid, M. A., & Ulrich, D. (2001). The HR Scorecard: Linking
        People, Strategy, and Performance. Harvard Business School Press.

Self-tests: run `python3 hr_scorecard.py --test`.
"""

from __future__ import annotations

import sys
from typing import Dict, List, Optional, Tuple


# ---------- 4 BSC perspectives reference ----------

BSC_PERSPECTIVES = (
    "Financial",
    "Employee/Customer",
    "Internal Process",
    "Learning & Growth",
)


# ---------- Progress ----------

def progress(current: Optional[float], target: Optional[float]) -> Optional[float]:
    """Proportional progress against target.

    Args:
        current: Current metric value (>= 0). None if unmeasured.
        target: Target metric value (> 0). None if no target defined.

    Returns:
        Fraction (0.0 = 0%; 1.0 = 100%; can exceed 1.0 if current exceeds target).
        None if either input is None (INCOMPLETE per Principle 4 — metric without
        target isn't a strategy).

    Raises:
        ValueError: if current < 0 or target <= 0.
    """
    if current is None or target is None:
        return None
    if current < 0:
        raise ValueError(f"current must be >= 0; got {current}")
    if target <= 0:
        raise ValueError(f"target must be > 0; got {target}")
    return current / target


# ---------- Scorecard build ----------

def build_scorecard(
    objectives: List[Dict],
    initiatives: List[Dict],
) -> Dict:
    """Build the scorecard structure from objectives and initiatives.

    Args:
        objectives: List of dicts each with 'id' (str), 'label' (str), 'weight' (float
            in [0, 1]).
        initiatives: List of dicts each with 'id' (str), 'label' (str), 'perspective'
            (one of BSC_PERSPECTIVES), 'objective_ids' (list of objective IDs the
            initiative serves; empty list means orphan initiative), 'current' (optional
            float), 'target' (optional float).

    Returns:
        Dict with:
          - 'objectives': input echoed with 'initiative_ids' back-references
          - 'initiatives': input echoed with 'progress' fraction added per initiative
          - 'by_perspective': dict of perspective → list of initiatives at that perspective

    Raises:
        ValueError: if any objective weight is outside [0, 1] or if the sum of
            objective weights doesn't equal 1.0 (allowing small floating-point
            tolerance); if any initiative perspective is not in BSC_PERSPECTIVES.
    """
    # Validate objective weights
    weights = [o.get("weight", 0) for o in objectives]
    for w in weights:
        if not (0.0 <= w <= 1.0):
            raise ValueError(f"objective weight must be in [0, 1]; got {w}")
    total_w = sum(weights)
    if objectives and abs(total_w - 1.0) > 0.01:
        raise ValueError(f"objective weights must sum to 1.0; got {total_w:.4f}")

    # Validate initiative perspectives
    valid_perspectives = set(BSC_PERSPECTIVES)
    for i, init in enumerate(initiatives):
        p = init.get("perspective")
        if p not in valid_perspectives:
            raise ValueError(f"initiatives[{i}] perspective must be one of {BSC_PERSPECTIVES}; got {p!r}")

    # Back-reference initiatives on objectives
    obj_id_to_inits: Dict[str, List[str]] = {o["id"]: [] for o in objectives}
    for init in initiatives:
        for obj_id in init.get("objective_ids", []):
            if obj_id in obj_id_to_inits:
                obj_id_to_inits[obj_id].append(init["id"])

    enriched_objectives = [
        {**o, "initiative_ids": obj_id_to_inits.get(o["id"], [])}
        for o in objectives
    ]

    # Add progress to initiatives
    enriched_initiatives = [
        {**init, "progress": progress(init.get("current"), init.get("target"))}
        for init in initiatives
    ]

    # Group by perspective
    by_perspective: Dict[str, List[Dict]] = {p: [] for p in BSC_PERSPECTIVES}
    for init in enriched_initiatives:
        by_perspective[init["perspective"]].append(init)

    return {
        "objectives": enriched_objectives,
        "initiatives": enriched_initiatives,
        "by_perspective": by_perspective,
    }


# ---------- Orphan flagging ----------

def flag_orphans(scorecard: Dict) -> Tuple[List[Dict], List[Dict]]:
    """Return (orphan_objectives, orphan_initiatives).

    Args:
        scorecard: Output of build_scorecard().

    Returns:
        (orphan_objectives, orphan_initiatives):
          - orphan_objectives: objectives with NO mapped initiatives (gaps to fill).
          - orphan_initiatives: initiatives with NO mapped objectives (sunset candidates).
    """
    orphan_objectives = [
        o for o in scorecard.get("objectives", [])
        if not o.get("initiative_ids")
    ]
    orphan_initiatives = [
        i for i in scorecard.get("initiatives", [])
        if not i.get("objective_ids")
    ]
    return (orphan_objectives, orphan_initiatives)


# ---------- Weighted alignment score ----------

def weighted_alignment_score(scorecard: Dict) -> Dict:
    """Per-perspective + overall weighted alignment score.

    Score computed as: sum(objective_weight × avg_progress_of_mapped_initiatives)
    over each perspective and overall. Objectives without mapped initiatives contribute 0.
    Initiatives without a computable progress (None) are excluded from the average
    (but their existence is still visible in the orphan list).

    Args:
        scorecard: Output of build_scorecard().

    Returns:
        Dict with:
          - 'per_perspective': dict of perspective → weighted score (0.0-1.0+)
          - 'overall': overall weighted score (0.0-1.0+)
          - 'coverage': fraction of objectives that have at least one mapped initiative
    """
    objectives = scorecard.get("objectives", [])
    initiatives = scorecard.get("initiatives", [])
    if not objectives:
        return {"per_perspective": {p: 0.0 for p in BSC_PERSPECTIVES}, "overall": 0.0, "coverage": 0.0}

    # Build objective_id → initiatives-mapping-to-that-objective
    init_by_obj: Dict[str, List[Dict]] = {o["id"]: [] for o in objectives}
    for init in initiatives:
        for obj_id in init.get("objective_ids", []):
            if obj_id in init_by_obj:
                init_by_obj[obj_id].append(init)

    per_perspective: Dict[str, float] = {p: 0.0 for p in BSC_PERSPECTIVES}
    overall = 0.0
    covered_count = 0

    for o in objectives:
        mapped_inits = init_by_obj.get(o["id"], [])
        if not mapped_inits:
            continue  # orphan objective; contributes 0
        covered_count += 1
        # Compute average progress of mapped initiatives that have progress
        progresses = [i.get("progress") for i in mapped_inits if i.get("progress") is not None]
        if not progresses:
            continue  # all mapped initiatives are unmeasured; contributes 0
        avg_progress = sum(progresses) / len(progresses)
        contribution = o.get("weight", 0) * avg_progress
        overall += contribution
        # Attribute to each perspective the mapped initiatives touch
        perspectives_touched = {i["perspective"] for i in mapped_inits}
        for p in perspectives_touched:
            per_perspective[p] += contribution / len(perspectives_touched)

    coverage = covered_count / len(objectives)

    return {
        "per_perspective": {p: round(v, 4) for p, v in per_perspective.items()},
        "overall": round(overall, 4),
        "coverage": round(coverage, 4),
    }


# ---------- Self-tests ----------

def _run_tests() -> int:
    failures = []

    # progress
    try:
        assert progress(50, 100) == 0.5
        assert progress(100, 100) == 1.0
        assert progress(150, 100) == 1.5  # exceeded target
        assert progress(0, 100) == 0.0
        assert progress(None, 100) is None
        assert progress(50, None) is None
        assert progress(None, None) is None
        try:
            progress(-1, 100)
            failures.append("progress should raise on negative current")
        except ValueError:
            pass
        try:
            progress(50, 0)
            failures.append("progress should raise on target=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"progress: {e}")

    # build_scorecard — valid inputs
    try:
        objs = [
            {"id": "O1", "label": "grow rev", "weight": 0.6},
            {"id": "O2", "label": "retain team", "weight": 0.4},
        ]
        inits = [
            {"id": "I1", "label": "hiring loop", "perspective": "Internal Process",
             "objective_ids": ["O1"], "current": 30, "target": 60},
            {"id": "I2", "label": "recognition", "perspective": "Employee/Customer",
             "objective_ids": ["O2"], "current": 8, "target": 10},
            {"id": "I3", "label": "orphan HR thing", "perspective": "Learning & Growth",
             "objective_ids": []},  # orphan initiative
        ]
        sc = build_scorecard(objs, inits)
        assert sc["objectives"][0]["initiative_ids"] == ["I1"]
        assert sc["objectives"][1]["initiative_ids"] == ["I2"]
        assert sc["initiatives"][0]["progress"] == 0.5
        assert sc["initiatives"][1]["progress"] == 0.8
        assert sc["initiatives"][2]["progress"] is None

        # Weight-sum validation
        try:
            build_scorecard([{"id": "O1", "label": "x", "weight": 0.5}], [])
            failures.append("build_scorecard should raise on weights not summing to 1")
        except ValueError:
            pass
        # Weight bounds
        try:
            build_scorecard([{"id": "O1", "label": "x", "weight": 1.5}], [])
            failures.append("build_scorecard should raise on weight > 1")
        except ValueError:
            pass
        # Perspective validation
        try:
            build_scorecard(
                [{"id": "O1", "label": "x", "weight": 1.0}],
                [{"id": "I1", "label": "x", "perspective": "Nonsense", "objective_ids": ["O1"]}],
            )
            failures.append("build_scorecard should raise on invalid perspective")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"build_scorecard: {e}")

    # flag_orphans
    try:
        objs = [
            {"id": "O1", "label": "covered", "weight": 0.5},
            {"id": "O2", "label": "orphan objective", "weight": 0.5},
        ]
        inits = [
            {"id": "I1", "label": "covering", "perspective": "Financial",
             "objective_ids": ["O1"]},
            {"id": "I2", "label": "orphan initiative", "perspective": "Financial",
             "objective_ids": []},
        ]
        sc = build_scorecard(objs, inits)
        orphan_objs, orphan_inits = flag_orphans(sc)
        assert len(orphan_objs) == 1 and orphan_objs[0]["id"] == "O2"
        assert len(orphan_inits) == 1 and orphan_inits[0]["id"] == "I2"

        # No orphans case
        objs2 = [{"id": "O1", "label": "x", "weight": 1.0}]
        inits2 = [{"id": "I1", "label": "y", "perspective": "Financial",
                   "objective_ids": ["O1"]}]
        sc2 = build_scorecard(objs2, inits2)
        oo, oi = flag_orphans(sc2)
        assert oo == [] and oi == []
    except AssertionError as e:
        failures.append(f"flag_orphans: {e}")

    # weighted_alignment_score
    try:
        objs = [
            {"id": "O1", "label": "x", "weight": 0.6},
            {"id": "O2", "label": "y", "weight": 0.4},
        ]
        inits = [
            {"id": "I1", "perspective": "Financial", "objective_ids": ["O1"],
             "current": 80, "target": 100},  # progress = 0.8
            {"id": "I2", "perspective": "Employee/Customer", "objective_ids": ["O2"],
             "current": 5, "target": 10},   # progress = 0.5
        ]
        sc = build_scorecard(objs, inits)
        result = weighted_alignment_score(sc)
        # O1: weight 0.6, avg progress 0.8 → 0.48; O2: weight 0.4, avg 0.5 → 0.2
        # overall = 0.68
        assert abs(result["overall"] - 0.68) < 0.001, result["overall"]
        assert result["coverage"] == 1.0
        # Per-perspective:
        # Financial gets 0.48; Employee/Customer gets 0.2
        assert abs(result["per_perspective"]["Financial"] - 0.48) < 0.001
        assert abs(result["per_perspective"]["Employee/Customer"] - 0.2) < 0.001
        assert result["per_perspective"]["Internal Process"] == 0.0
        assert result["per_perspective"]["Learning & Growth"] == 0.0

        # Empty case
        empty_sc = build_scorecard([], [])
        empty_result = weighted_alignment_score(empty_sc)
        assert empty_result["overall"] == 0.0
        assert empty_result["coverage"] == 0.0

        # Orphan objective drops coverage
        objs2 = [
            {"id": "O1", "label": "x", "weight": 0.5},
            {"id": "O2", "label": "orphan", "weight": 0.5},
        ]
        inits2 = [
            {"id": "I1", "perspective": "Financial", "objective_ids": ["O1"],
             "current": 100, "target": 100},
        ]
        sc2 = build_scorecard(objs2, inits2)
        r2 = weighted_alignment_score(sc2)
        assert r2["coverage"] == 0.5
        # Overall = 0.5 * 1.0 (O1) + 0.5 * 0 (O2 orphan) = 0.5
        assert abs(r2["overall"] - 0.5) < 0.001
    except AssertionError as e:
        failures.append(f"weighted_alignment_score: {e}")

    # BSC_PERSPECTIVES integrity
    try:
        assert len(BSC_PERSPECTIVES) == 4
        assert "Financial" in BSC_PERSPECTIVES
        assert "Employee/Customer" in BSC_PERSPECTIVES
        assert "Internal Process" in BSC_PERSPECTIVES
        assert "Learning & Growth" in BSC_PERSPECTIVES
    except AssertionError as e:
        failures.append(f"BSC_PERSPECTIVES: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 4 functions + BSC_PERSPECTIVES reference, all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
