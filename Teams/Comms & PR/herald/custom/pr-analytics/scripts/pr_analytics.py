"""
pr_analytics.py — Barcelona-Principles-3.0-aligned PR measurement utility.

Provenance (§0.5):
    IMPLEMENTED-FROM-DESCRIPTION per the Barcelona Principles 3.0 (2020) + AMEC
    Integrated Evaluation Framework. Institutional canonical sources per §8.8.

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script yet. §8.0 two-book minimum unmet — AMEC materials
    are institutional per §8.8 but the framework needs an academic-textbook pair.
    Candidate second-source books for graduation:
      - Watson & Noble. Evaluating Public Relations. Kogan Page (multiple editions).
      - Michaelson & Stacks. A Professional and Practitioner's Guide to Public Relations
        Research, Measurement, and Evaluation. Business Expert Press.

LOAD-BEARING RULE baked into this file:
    `ave_refuse()` explicitly REFUSES to compute AVE (Advertising Value Equivalency)
    per Barcelona Principle 5. Not a computation function — a principled refusal
    enforced at the code level so the operator cannot invoke AVE by workaround.
    Matches the P&C pattern of load-bearing rules baked into tool-level enforcement
    (e.g., merit's comp-separation-from-review rule enforced at tool_permissions level;
    grove's audit-trail-immutability enforced across skills).

Self-tests: run `python3 pr_analytics.py --test`.
"""

from __future__ import annotations

import sys
from typing import Dict, List, Optional, Tuple


# ---------- Reference: Barcelona Principles 3.0 (2020) ----------

BARCELONA_PRINCIPLES: Tuple[str, ...] = (
    "1. Setting goals is fundamental to communication and evaluation.",
    "2. Measurement and evaluation should identify outputs, outcomes, and potential impact.",
    "3. Outcomes and impact should be identified for stakeholders, society, and the org.",
    "4. Communication measurement should include both qualitative and quantitative analysis.",
    "5. AVE is NOT the value of communication.",
    "6. Holistic communication measurement includes all relevant online and offline channels.",
    "7. Communication measurement is based on integrity + transparency to drive learning.",
)


# ---------- Reference: AMEC Integrated Evaluation Framework stages ----------

AMEC_FRAMEWORK_STAGES: Tuple[str, ...] = (
    "INPUTS",       # resources (budget, people, materials)
    "ACTIVITIES",   # comms planning + execution
    "OUTPUTS",      # deliverables: coverage, reach
    "OUTTAKES",     # audience awareness / recall
    "OUTCOMES",     # audience behavior change
    "IMPACT",       # org / society result: revenue, reputation, policy shift
)


# ---------- LOAD-BEARING: AVE refusal ----------

def ave_refuse() -> None:
    """LOAD-BEARING refusal per Barcelona Principle 5 (2020).

    ALWAYS raises NotImplementedError. Not a computation — a principled refusal
    baked into the code so the operator cannot invoke AVE via workaround.

    Barcelona Principle 5 rejects AVE (Advertising Value Equivalency) because
    editorial coverage and paid advertising are qualitatively different:
      - Readers distinguish editorial from advertising.
      - Editorial coverage carries third-party credibility that paid advertising
        cannot buy.
      - Multiplying column-inches by ad-rate mistakes measurement units.
    Barcelona 1.0 (2010) originally rejected AVE; Barcelona 2.0 (2015) reaffirmed;
    Barcelona 3.0 (2020) is unambiguous.

    Route to valid metrics: coverage-vs-target, reach, share-of-voice, sentiment,
    message alignment, outtakes (audience awareness), outcomes (behavior change),
    impact (revenue / reputation / policy).
    """
    raise NotImplementedError(
        "AVE (Advertising Value Equivalency) is NOT a valid PR measurement. "
        "Rejected by Barcelona Principle 5 (2010, reaffirmed 2015, reaffirmed 2020). "
        "Editorial coverage and paid advertising are qualitatively different — "
        "readers distinguish them; equating them misrepresents PR value. "
        "Route to Barcelona-aligned metrics: coverage-vs-target, reach, share-of-voice, "
        "sentiment, message alignment, outtakes (audience awareness), outcomes "
        "(behavior change), impact (revenue / reputation / policy). If a legacy "
        "stakeholder insists on AVE, escalate to operator + educate on Barcelona "
        "standards. NO WORKAROUNDS."
    )


# ---------- Share of voice ----------

def share_of_voice(brand_mentions: int, total_category_mentions: int) -> float:
    """Brand mentions / total category mentions × 100.

    Args:
        brand_mentions: Count of mentions of the target brand in the measurement window.
        total_category_mentions: Count of mentions of ALL brands in the category
            (target brand + competitor set defined in Phase 1 goals).

    Returns:
        Share of voice as percentage (0.0 to 100.0).

    Raises:
        ValueError: if total_category_mentions <= 0 or brand_mentions < 0 or
            brand_mentions > total_category_mentions.
    """
    if total_category_mentions <= 0:
        raise ValueError("total_category_mentions must be > 0")
    if brand_mentions < 0:
        raise ValueError("brand_mentions must be >= 0")
    if brand_mentions > total_category_mentions:
        raise ValueError(
            f"brand_mentions ({brand_mentions}) cannot exceed total_category_mentions "
            f"({total_category_mentions})"
        )
    return (brand_mentions / total_category_mentions) * 100


# ---------- Sentiment aggregation ----------

def sentiment_aggregation(
    positive: int, neutral: int, negative: int
) -> Dict[str, float]:
    """Aggregate sentiment distribution + net sentiment score.

    Args:
        positive: Count of positive-sentiment coverage pieces.
        neutral: Count of neutral-sentiment coverage pieces.
        negative: Count of negative-sentiment coverage pieces.

    Returns:
        Dict with pct_positive, pct_neutral, pct_negative, net_sentiment
        (positive % - negative %; signed, -100 to +100), and total.
        Per Barcelona Principle 4 — qualitative + quantitative both;
        the human-triaged sentiment counts belong upstream of this function.

    Raises:
        ValueError: if total is 0 or any count is negative.
    """
    if positive < 0 or neutral < 0 or negative < 0:
        raise ValueError("counts must be >= 0")
    total = positive + neutral + negative
    if total == 0:
        raise ValueError(
            "total sentiment counts must be > 0 (empty coverage window can't produce sentiment)"
        )
    pct_positive = (positive / total) * 100
    pct_neutral = (neutral / total) * 100
    pct_negative = (negative / total) * 100
    net_sentiment = pct_positive - pct_negative
    return {
        "pct_positive": round(pct_positive, 1),
        "pct_neutral": round(pct_neutral, 1),
        "pct_negative": round(pct_negative, 1),
        "net_sentiment": round(net_sentiment, 1),
        "total": total,
    }


# ---------- Coverage vs target ----------

def coverage_vs_target(actual_hits: int, target_hits: int) -> float:
    """Actual coverage / target coverage. Can exceed 1.0.

    Args:
        actual_hits: Actual pieces of coverage received.
        target_hits: Target pieces of coverage set in Phase 1 goals.

    Returns:
        Ratio (1.0 = target met exactly; > 1.0 = exceeded; < 1.0 = under-delivered).

    Raises:
        ValueError: if target_hits <= 0 or actual_hits < 0.
    """
    if target_hits <= 0:
        raise ValueError("target_hits must be > 0")
    if actual_hits < 0:
        raise ValueError("actual_hits must be >= 0")
    return actual_hits / target_hits


# ---------- Reach estimate ----------

def reach_estimate(publication_reach_list: List[int]) -> Dict[str, object]:
    """Simple additive reach estimate across coverage pieces.

    Args:
        publication_reach_list: List of estimated audience-reach values per piece of
            coverage. Sourced from publisher-reported unique-visitors + industry-standard
            reach estimates for print / broadcast / podcast.

    Returns:
        Dict with total_estimated_reach (sum) + coverage_piece_count + note.
        NOTE explicitly flags that this is an ADDITIVE estimate that does NOT
        de-duplicate audiences across publications — a reader may see the same
        story in multiple outlets. De-duplication requires panel data (typically
        from Nielsen / Comscore / equivalent). Reported as directional, not exact.

    Raises:
        ValueError: if the list is empty or contains negative values.
    """
    if not publication_reach_list:
        raise ValueError("publication_reach_list must be non-empty")
    if any(r < 0 for r in publication_reach_list):
        raise ValueError("all reach values must be >= 0")
    total = sum(publication_reach_list)
    return {
        "total_estimated_reach": total,
        "coverage_piece_count": len(publication_reach_list),
        "note": (
            "Additive estimate. Does NOT de-duplicate audiences across publications. "
            "A reader may see the same story in multiple outlets. De-duplication "
            "requires panel data (Nielsen / Comscore / equivalent). "
            "Report as directional, not exact."
        ),
    }


# ---------- Message alignment ----------

def message_alignment(
    coverage_reflecting_message: Dict[str, int],
    total_coverage_pieces: int,
) -> Dict[str, float]:
    """% of coverage pieces reflecting each key message.

    Args:
        coverage_reflecting_message: Dict mapping message ID (e.g., "message_1",
            "message_2", "message_3") to count of coverage pieces that reflected
            that message. From media-training's 3-message-max discipline.
        total_coverage_pieces: Total coverage pieces in the measurement window.

    Returns:
        Dict mapping message ID to % of coverage reflecting that message.

    Raises:
        ValueError: if total_coverage_pieces <= 0 or any count is negative or
            exceeds total.
    """
    if total_coverage_pieces <= 0:
        raise ValueError("total_coverage_pieces must be > 0")
    result = {}
    for msg_id, count in coverage_reflecting_message.items():
        if count < 0:
            raise ValueError(f"coverage_reflecting_message[{msg_id!r}] must be >= 0")
        if count > total_coverage_pieces:
            raise ValueError(
                f"coverage_reflecting_message[{msg_id!r}] ({count}) cannot exceed "
                f"total_coverage_pieces ({total_coverage_pieces})"
            )
        result[msg_id] = round((count / total_coverage_pieces) * 100, 1)
    return result


# ---------- Self-tests ----------

def _run_tests() -> int:
    failures = []

    # ave_refuse — LOAD-BEARING refusal must raise
    try:
        try:
            ave_refuse()
            failures.append(
                "ave_refuse() should ALWAYS raise NotImplementedError — Barcelona Principle 5"
            )
        except NotImplementedError as e:
            # Must contain the Barcelona explanation
            assert "Barcelona" in str(e), "ave_refuse message must reference Barcelona"
            assert "NO WORKAROUNDS" in str(e), "ave_refuse message must include NO WORKAROUNDS"
    except AssertionError as e:
        failures.append(f"ave_refuse: {e}")

    # share_of_voice
    try:
        assert share_of_voice(40, 100) == 40.0
        assert share_of_voice(0, 100) == 0.0
        assert share_of_voice(100, 100) == 100.0
        try:
            share_of_voice(101, 100)
            failures.append(
                "share_of_voice should raise when brand_mentions > total_category_mentions"
            )
        except ValueError:
            pass
        try:
            share_of_voice(50, 0)
            failures.append("share_of_voice should raise on total_category_mentions=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"share_of_voice: {e}")

    # sentiment_aggregation
    try:
        r = sentiment_aggregation(60, 30, 10)
        assert r["pct_positive"] == 60.0
        assert r["pct_neutral"] == 30.0
        assert r["pct_negative"] == 10.0
        assert r["net_sentiment"] == 50.0  # 60 - 10
        assert r["total"] == 100

        r = sentiment_aggregation(0, 50, 50)
        assert r["net_sentiment"] == -50.0  # 0 - 50

        try:
            sentiment_aggregation(0, 0, 0)
            failures.append("sentiment_aggregation should raise on total=0")
        except ValueError:
            pass
        try:
            sentiment_aggregation(-1, 0, 0)
            failures.append("sentiment_aggregation should raise on negative count")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"sentiment_aggregation: {e}")

    # coverage_vs_target
    try:
        assert coverage_vs_target(15, 15) == 1.0
        assert coverage_vs_target(30, 15) == 2.0
        assert coverage_vs_target(10, 15) < 1.0
        assert coverage_vs_target(0, 15) == 0.0
        try:
            coverage_vs_target(15, 0)
            failures.append("coverage_vs_target should raise on target_hits=0")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"coverage_vs_target: {e}")

    # reach_estimate
    try:
        r = reach_estimate([100000, 250000, 50000])
        assert r["total_estimated_reach"] == 400000
        assert r["coverage_piece_count"] == 3
        assert "de-duplicate" in r["note"].lower()
        try:
            reach_estimate([])
            failures.append("reach_estimate should raise on empty list")
        except ValueError:
            pass
        try:
            reach_estimate([100, -50])
            failures.append("reach_estimate should raise on negative values")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"reach_estimate: {e}")

    # message_alignment
    try:
        r = message_alignment(
            {"message_1": 30, "message_2": 20, "message_3": 10},
            total_coverage_pieces=40,
        )
        assert r["message_1"] == 75.0   # 30/40
        assert r["message_2"] == 50.0
        assert r["message_3"] == 25.0
        try:
            message_alignment({"m1": 50}, total_coverage_pieces=40)
            failures.append("message_alignment should raise when count > total")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"message_alignment: {e}")

    # BARCELONA_PRINCIPLES integrity
    try:
        assert len(BARCELONA_PRINCIPLES) == 7
        assert any("AVE" in p for p in BARCELONA_PRINCIPLES), (
            "Barcelona Principle 5 (AVE rejection) must be present"
        )
    except AssertionError as e:
        failures.append(f"BARCELONA_PRINCIPLES: {e}")

    # AMEC_FRAMEWORK_STAGES integrity
    try:
        assert len(AMEC_FRAMEWORK_STAGES) == 6
        assert "OUTPUTS" in AMEC_FRAMEWORK_STAGES
        assert "OUTCOMES" in AMEC_FRAMEWORK_STAGES
        assert "IMPACT" in AMEC_FRAMEWORK_STAGES
    except AssertionError as e:
        failures.append(f"AMEC_FRAMEWORK_STAGES: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(
        "OK — 5 functions (+ ave_refuse LOAD-BEARING refusal) + 2 references "
        "(BARCELONA_PRINCIPLES, AMEC_FRAMEWORK_STAGES), all self-tests passed."
    )
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
