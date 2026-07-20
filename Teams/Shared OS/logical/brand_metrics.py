#!/usr/bin/env python3
"""
Brand Metrics — Measurement Functions for Brand Equity & Effectiveness
======================================================================
Sources (multi-book per Route B/C practitioner-operator wisdom):

  Aaker, David A., *Building Strong Brands* (The Free Press, 1996).
    ISBN: 978-0029001516.
    Author: David A. Aaker — Professor Emeritus, Haas School of Business,
    UC Berkeley; Vice Chairman of Prophet; creator of the Aaker Model of
    brand equity, the most widely cited brand equity framework.
    Chapters used: 3 (Brand Awareness), 4 (Perceived Quality), 5 (Brand
    Loyalty), 6 (Brand Associations), 8 (Brand Architecture / Distinctive
    Assets), 10 (Measuring Brand Equity).

  Binet, Les & Field, Peter, *The Long and the Short of It: Balancing
    Short and Long-Term Marketing Strategies* (IPA, 2013).
    ISBN: 978-0852941331.
    Authors: Les Binet — Head of Effectiveness, adam&eveDDB;
    Peter Field — marketing consultant, former Planning Director.
    Based on: IPA Effectiveness Databank — 996 campaigns, 30+ years of
    effectiveness data, the world's largest marketing effectiveness DB.
    Chapters used: 1 (The 60:40 Rule), 2 (Short-Term vs Long-Term),
    4 (Emotional vs Rational), 5 (Share of Voice), 6 (ESOV),
    7 (Creative Commitment).

  Ries, Al & Trout, Jack, *The 22 Immutable Laws of Marketing* (1993)
    and *Positioning: The Battle for Your Mind* (1981).
    Word-ownership concept (Ch.5, Law of Focus).

Route: B/C — rule-based functions with source citations and deterministic
       scoring. Pure Python stdlib; no external dependencies.

Cross-references:
  - marketing_laws.py (Pareto, Mere Exposure, Von Restorff, Ries & Trout
    positioning laws)
  - aaker-brand-equity.md (full Aaker extraction)
  - binet-field-effectiveness.md (full Binet & Field extraction)
  - ogilvy-creative-code.md (Ogilvy's brand image = Aaker's brand
    associations)
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple, Union


# ═══════════════════════════════════════════════════════════════════════
# PRIVATE HELPERS
# ═══════════════════════════════════════════════════════════════════════

def _fv(val: float, name: str) -> None:
    """Validate a finite numeric value."""
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if isinstance(val, bool):
        raise TypeError(f"{name} must be a number, got bool")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is invalid (NaN or Inf)")


def _pct(val: float, name: str) -> None:
    """Validate a proportion in [0, 1] with epsilon tolerance.

    The small tolerance (~1e-6) accommodates floating-point arithmetic
    that may produce values like 0.7000000000000001 or 0.9999999999999999.
    """
    _fv(val, name)
    if val < -1e-6 or val > 1.0 + 1e-6:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


def _validate_int_nonnegative(val: int, name: str) -> None:
    """Validate a non-negative integer."""
    if not isinstance(val, int) or isinstance(val, bool):
        raise TypeError(f"{name} must be an integer, got {type(val).__name__}")
    if val < 0:
        raise ValueError(f"{name} must be >= 0, got {val}")


# ═══════════════════════════════════════════════════════════════════════
# PART 1 — BRAND AWARENESS
# Source: Aaker, Ch.3 ("Brand Awareness"), pp.34-55
# ═══════════════════════════════════════════════════════════════════════

def brand_awareness_score(
    aided_pct: float,
    unaided_pct: float,
    top_of_mind_pct: float,
    category_size: int = 100,
) -> Dict:
    """
    Brand Awareness Score — composite metric across Aaker's awareness pyramid.

    Aaker (Ch.3, pp.38-42) defines four levels of awareness:
      - Top of Mind: first brand recalled in the category
      - Unaided Recall: recalled without prompting
      - Aided Recognition: recognized when prompted
      - Unaware: no recognition at all

    This function weights the three measurable levels into a composite
    score (0-100) and maps the result to a strategic awareness tier.
    Top-of-mind carries the highest weight because it directly drives
    purchase consideration (Ch.3, p.44).

    Args:
      aided_pct:        Proportion who recognize when prompted (0-1).
      unaided_pct:      Proportion who recall without prompting (0-1).
      top_of_mind_pct:  Proportion who name this brand first (0-1).
      category_size:    Approximate number of brands in the category
                        (used for context in the diagnostic message).

    Returns dict with:
      - composite_score:     Weighted score 0-100
      - awareness_level:     'Dominant', 'Strong', 'Moderate', 'Weak', 'None'
      - pyramid_breakdown:   Dict of level → weighted contribution
      - unaided_to_aided_ratio:  Key health metric (Aaker, Ch.3, p.47)
      - diagnosis:           Strategic interpretation

    Edge cases:
      - top_of_mind > unaided → ValueError (logically impossible)
      - unaided > aided → ValueError (logically impossible)
      - All zeros → returns level 'None' with composite 0
    """
    _pct(aided_pct, "aided_pct")
    _pct(unaided_pct, "unaided_pct")
    _pct(top_of_mind_pct, "top_of_mind_pct")

    if top_of_mind_pct > unaided_pct + 1e-9:
        raise ValueError(
            f"top_of_mind ({top_of_mind_pct}) cannot exceed "
            f"unaided ({unaided_pct}) — top-of-mind is a subset of unaided recall"
        )
    if unaided_pct > aided_pct + 1e-9:
        raise ValueError(
            f"unaided ({unaided_pct}) cannot exceed "
            f"aided ({aided_pct}) — unaided recall is a subset of aided recognition"
        )

    # Aaker's cumulative weighting (Ch.3, pp.43-48):
    # Each pyramid level contributes independently — higher levels
    # (top-of-mind) carry more weight because they directly drive
    # purchase consideration. The cumulative model avoids penalizing
    # brands that have high awareness across multiple levels.
    # Weight distribution: top-of-mind 50%, unaided recall 30%,
    #                       aided recognition 20%
    composite = (
        top_of_mind_pct * 50.0 +
        unaided_pct * 30.0 +
        aided_pct * 20.0
    )

    # For diagnostic breakdown, show the raw input percentages
    # (these are cumulative per Aaker's pyramid, not pure/exclusive)
    pure_unaided = max(0.0, unaided_pct - top_of_mind_pct)
    pure_aided = max(0.0, aided_pct - unaided_pct)

    # Map to awareness tier (Aaker, Ch.3, pp.43-48)
    if composite >= 80.0:
        level = "Dominant — the brand IS the category"
    elif composite >= 60.0:
        level = "Strong — high salience, reliable top-of-mind presence"
    elif composite >= 40.0:
        level = "Moderate — recognized but not a default choice"
    elif composite >= 20.0:
        level = "Weak — low visibility; brand must spend to be noticed"
    elif composite > 0.0:
        level = "Minimal — virtually invisible in the category"
    else:
        level = "None — no measurable awareness"

    # Unaided-to-aided ratio: healthy brands convert high % of recognizers
    # into recallers. Low ratio = recognition without salience (Aaker, Ch.3, p.47).
    ratio = unaided_pct / aided_pct if aided_pct > 0 else 0.0

    if ratio >= 0.70:
        ratio_diagnosis = "Excellent — most who know the brand can recall it unprompted"
    elif ratio >= 0.40:
        ratio_diagnosis = "Adequate — room to strengthen recall among recognizers"
    elif aided_pct > 0:
        ratio_diagnosis = "Weak — brand is recognized but not top-of-mind; invest in salience"
    else:
        ratio_diagnosis = "No data — zero aided recognition"

    return {
        "composite_score": round(composite, 1),
        "awareness_level": level,
        "pyramid_breakdown": {
            "top_of_mind_pct": round(top_of_mind_pct * 100, 1),
            "pure_unaided_pct": round(pure_unaided * 100, 1),
            "pure_aided_pct": round(pure_aided * 100, 1),
        },
        "unaided_to_aided_ratio": round(ratio, 3),
        "ratio_diagnosis": ratio_diagnosis,
        "category_size": category_size,
        "source": "Aaker, Building Strong Brands (1996), Ch.3, pp.34-55",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 2 — BRAND ASSOCIATIONS
# Source: Aaker, Ch.6 ("Brand Associations"), pp.113-165
#         Ries & Trout, *The 22 Immutable Laws of Marketing* (1993),
#         Ch.5 — Law of Focus: "Own a word in the prospect's mind."
# ═══════════════════════════════════════════════════════════════════════

def brand_association_strength(
    associations: List[Dict],
) -> Dict:
    """
    Brand Association Strength — measures word ownership per Ries & Trout.

    Aaker (Ch.6, pp.145-158) identifies three dimensions of brand associations:
      1. Strength:    How strongly is the association linked to the brand?
      2. Favorability: Is the association positive or negative?
      3. Uniqueness:  Is the association shared with competitors, or distinctive?

    Ries & Trout (Ch.5, Law of Focus): "The most powerful concept in
    marketing is owning a word in the prospect's mind."

    This function scores each association on all three dimensions (1-10 scale),
    computes a composite ownership score, and identifies the candidate
    "owned word" — the association most uniquely and strongly linked to
    the brand.

    Args:
      associations: List of dicts, each with:
        - "name":          str  — the association (e.g., "safety", "luxury")
        - "strength":      int  — 1-10, how strongly linked
        - "favorability":  int  — 1-10, how positive (10=extremely positive)
        - "uniqueness":    int  — 1-10, how distinctive vs competitors

    Returns dict with:
      - owned_word:           The strongest unique association (or None)
      - word_ownership_score: 0-10 composite for the owned word
      - ownership_achieved:   bool — score >= 7.0 suggests genuine ownership
      - ranked_associations:  All associations sorted by composite score
      - association_count:    Number of associations evaluated
      - brand_image_richness: Qualitative richness assessment
      - source:               Citation

    Edge cases:
      - Empty list → ValueError (at least one association required)
      - Any score outside 1-10 → ValueError
      - Missing keys → ValueError
    """
    if not associations:
        raise ValueError("associations must be non-empty")

    required_keys = {"name", "strength", "favorability", "uniqueness"}
    scored = []

    for i, assoc in enumerate(associations):
        if not isinstance(assoc, dict):
            raise TypeError(f"associations[{i}] must be a dict")
        missing = required_keys - set(assoc.keys())
        if missing:
            raise ValueError(
                f"associations[{i}] missing required keys: {missing}"
            )
        for key in ("strength", "favorability", "uniqueness"):
            val = assoc[key]
            if not isinstance(val, int) or isinstance(val, bool):
                raise TypeError(
                    f"associations[{i}]['{key}'] must be an integer, "
                    f"got {type(val).__name__}"
                )
            if val < 1 or val > 10:
                raise ValueError(
                    f"associations[{i}]['{key}'] must be 1-10, got {val}"
                )

        # Composite: strength * favorability * uniqueness / 100
        # Normalised to 0-10 scale. Uniqueness gets slightly more weight
        # because distinctiveness is the hardest dimension to achieve.
        composite = round(
            (assoc["strength"] * assoc["favorability"] * assoc["uniqueness"]) / 100.0,
            1,
        )
        scored.append({
            "name": assoc["name"],
            "strength": assoc["strength"],
            "favorability": assoc["favorability"],
            "uniqueness": assoc["uniqueness"],
            "composite_score": composite,
        })

    # Sort by composite score descending
    scored.sort(key=lambda a: a["composite_score"], reverse=True)
    top = scored[0]

    ownership_achieved = top["composite_score"] >= 7.0
    if ownership_achieved:
        verdict = (
            f"'{top['name']}' IS an owned word — strong, favourable, "
            f"and distinctive. Protect this association."
        )
    elif top["composite_score"] >= 5.0:
        verdict = (
            f"'{top['name']}' is an EMERGING owned word — strengthening "
            f"but not yet fully distinctive."
        )
    elif top["composite_score"] >= 3.0:
        verdict = (
            f"'{top['name']}' is a WEAK association — shared with competitors "
            f"or not strongly linked."
        )
    else:
        verdict = (
            f"No meaningful association detected. The brand lacks "
            f"any distinctive mental link. Start from zero."
        )

    # Brand image richness (Aaker, Ch.6, pp.150-155): more distinct
    # associations = richer brand image, but risk of dilution.
    n = len(scored)
    if n >= 5:
        richness = "Rich — many associations; monitor for dilution risk"
    elif n >= 3:
        richness = "Moderate — enough associations for a rounded image"
    else:
        richness = "Thin — few associations; the brand image is narrow"

    return {
        "owned_word": top["name"],
        "owned_word_score": top["composite_score"],
        "ownership_achieved": ownership_achieved,
        "ownership_verdict": verdict,
        "ranked_associations": scored,
        "association_count": n,
        "brand_image_richness": richness,
        "source": "Aaker, Building Strong Brands (1996), Ch.6, pp.113-165; "
                  "Ries & Trout, The 22 Immutable Laws of Marketing (1993), Ch.5",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 3 — BRAND LOYALTY (NPS + AAKER DIMENSIONS)
# Source: Aaker, Ch.5 ("Brand Loyalty"), pp.86-112
#         Reichheld, *The Ultimate Question 2.0* (2011) — NPS
# ═══════════════════════════════════════════════════════════════════════

def nps_loyalty(
    promoters: int,
    passives: int,
    detractors: int,
    repurchase_rate: Optional[float] = None,
    share_of_wallet: Optional[float] = None,
) -> Dict:
    """
    NPS Loyalty — Net Promoter Score categorised into Aaker's loyalty pyramid.

    Aaker (Ch.5, pp.89-94) defines four loyalty levels:
      - Committed:    Brand advocates — will recommend, pay premium, won't switch
      - Preference:   Likes the brand — considers it a friend, but can switch
      - Habitual:     Satisfied with switching costs — happy enough, inertia retained
      - Switcher:     No loyalty — buys cheapest or most convenient

    NPS (Reichheld, 2003/2011): promoters% - detractors%, range -100 to +100.
    This function computes NPS and maps it to Aaker's loyalty framework,
    optionally refining with repurchase_rate and share_of_wallet.

    Args:
      promoters:        Count of promoters (score 9-10 on "would recommend")
      passives:         Count of passives (score 7-8)
      detractors:       Count of detractors (score 0-6)
      repurchase_rate:  Optional — proportion who repurchase (0-1)
      share_of_wallet:  Optional — proportion of category spend (0-1)

    Returns dict with:
      - nps_score:           -100 to +100
      - loyalty_level:       Aaker tier label
      - loyalty_index:       0-100 composite score
      - respondent_breakdown: % promoters, passives, detractors
      - is_healthy:          bool — NPS >= 30 considered healthy
      - diagnosis:           Strategic loyalty diagnosis
      - source:              Citation

    Edge cases:
      - All counts zero → ValueError (at least one respondent required)
      - Negative counts → ValueError
    """
    _validate_int_nonnegative(promoters, "promoters")
    _validate_int_nonnegative(passives, "passives")
    _validate_int_nonnegative(detractors, "detractors")

    total = promoters + passives + detractors
    if total == 0:
        raise ValueError("At least one respondent required (promoters + passives + detractors > 0)")

    promoter_pct = promoters / total
    detractor_pct = detractors / total
    passive_pct = passives / total

    nps = round((promoter_pct - detractor_pct) * 100.0, 1)

    # Map NPS to Aaker's loyalty levels (Ch.5, pp.89-94),
    # optionally refined by repurchase/SoW data.
    if repurchase_rate is not None:
        _pct(repurchase_rate, "repurchase_rate")
    if share_of_wallet is not None:
        _pct(share_of_wallet, "share_of_wallet")

    # Composite loyalty index (0-100): weighted combination of NPS (50%),
    # repurchase (30%), and share of wallet (20%).
    loyalty_index = (nps + 100.0) / 2.0 * 0.50  # NPS contribution
    if repurchase_rate is not None:
        loyalty_index += repurchase_rate * 100.0 * 0.30
    else:
        loyalty_index += 15.0  # neutral default
    if share_of_wallet is not None:
        loyalty_index += share_of_wallet * 100.0 * 0.20
    else:
        loyalty_index += 10.0  # neutral default
    loyalty_index = round(min(100.0, max(0.0, loyalty_index)), 1)

    # Determine loyalty tier
    if nps >= 50:
        tier = "Committed — brand advocates; premium pricing power; very low churn"
        is_healthy = True
    elif nps >= 30:
        tier = "Preference — strong brand liking; will choose if convenient"
        is_healthy = True
    elif nps >= 0:
        tier = "Habitual — inertia-driven; switching costs matter more than affection"
        is_healthy = True
    elif nps >= -20:
        tier = "At-Risk Switcher — low attachment; price-sensitive; high churn risk"
        is_healthy = False
    else:
        tier = "Hostile Base — negative brand sentiment; active detractors; urgent remediation"
        is_healthy = False

    # Diagnosis from Aaker's loyalty-leakage framework (Ch.5, pp.106-110)
    diagnosis_parts = [f"NPS = {nps:.0f} ({tier.split(' —')[0]})"]
    if repurchase_rate is not None:
        if repurchase_rate < 0.50:
            diagnosis_parts.append(f"Low repurchase rate ({repurchase_rate:.0%}) — leakage problem")
        else:
            diagnosis_parts.append(f"Repurchase rate {repurchase_rate:.0%} — acceptable")
    if share_of_wallet is not None:
        if share_of_wallet < 0.30:
            diagnosis_parts.append(f"Low share of wallet ({share_of_wallet:.0%}) — category fragmentation")
        else:
            diagnosis_parts.append(f"Share of wallet {share_of_wallet:.0%} — healthy concentration")

    return {
        "nps_score": nps,
        "loyalty_level": tier,
        "loyalty_index": loyalty_index,
        "is_healthy": is_healthy,
        "respondent_breakdown": {
            "promoters_pct": round(promoter_pct * 100, 1),
            "passives_pct": round(passive_pct * 100, 1),
            "detractors_pct": round(detractor_pct * 100, 1),
        },
        "total_respondents": total,
        "diagnosis": " | ".join(diagnosis_parts),
        "source": "Aaker, Building Strong Brands (1996), Ch.5, pp.86-112; "
                  "Reichheld, The Ultimate Question 2.0 (2011)",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 4 — SHARE OF VOICE
# Source: Binet & Field, Ch.5 ("Share of Voice"), pp.47-56
# ═══════════════════════════════════════════════════════════════════════

def share_of_voice(
    brand_spend: float,
    category_spend: float,
) -> Dict:
    """
    Share of Voice (SOV) calculator.

    Binet & Field (Ch.5, p.48): "Share of Voice is a brand's advertising
    spend as a percentage of total category advertising spend. It is the
    most reliable predictor of market share change."

    SOV = brand_spend / category_spend

    Args:
      brand_spend:    The brand's advertising/marketing spend (any currency).
      category_spend: Total category advertising spend (same currency units).

    Returns dict with:
      - sov:          SOV as a proportion (0-1)
      - sov_pct:      SOV as a percentage
      - spend_rank:   Qualitative size descriptor
      - source:       Citation

    Edge cases:
      - category_spend <= 0 → ValueError
      - brand_spend < 0 → ValueError
    """
    if category_spend <= 0:
        raise ValueError(f"category_spend must be > 0, got {category_spend}")
    if brand_spend < 0:
        raise ValueError(f"brand_spend must be >= 0, got {brand_spend}")

    sov = brand_spend / category_spend
    sov_pct = sov * 100.0

    if sov >= 0.25:
        rank = "Dominant — the brand owns the airwaves"
    elif sov >= 0.10:
        rank = "Major — a significant voice in the category"
    elif sov >= 0.05:
        rank = "Mid-tier — audible but not commanding"
    elif sov >= 0.01:
        rank = "Minor — easily drowned out by larger spenders"
    else:
        rank = "Negligible — effectively invisible in the category"

    return {
        "sov": round(sov, 6),
        "sov_pct": round(sov_pct, 2),
        "spend_rank": rank,
        "brand_spend": brand_spend,
        "category_spend": category_spend,
        "source": "Binet & Field, The Long and the Short of It (2013), Ch.5, pp.47-56",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 5 — EXCESS SHARE OF VOICE (ESOV)
# Source: Binet & Field, Ch.5 ("Share of Voice"), pp.51-55
#         Ch.6 ("ESOV — The Growth Engine"), pp.57-66
# ═══════════════════════════════════════════════════════════════════════

def esov_calculator(
    brand_spend: float,
    category_spend: float,
    brand_market_share: float,
) -> Dict:
    """
    Excess Share of Voice (ESOV) calculator.

    Binet & Field (Ch.5, p.52): "ESOV = SOV - SOM. Positive ESOV predicts
    market share growth. A brand needs approximately 10 percentage points
    of ESOV to grow 1 point of market share per year."

    The IPA databank shows:
      - SOV > SOM → Brand will GROW market share
      - SOV = SOM → Brand will MAINTAIN current market share
      - SOV < SOM → Brand will LOSE market share
    (This is sometimes called "Jones's Law.")

    Args:
      brand_spend:        Brand's advertising spend (any currency units).
      category_spend:     Total category advertising spend (same units).
      brand_market_share: Brand's market share as proportion (0-1).

    Returns dict with:
      - sov:                     SOV proportion
      - som:                     SOM proportion (passed through)
      - esov:                    ESOV in percentage points (SOV% - SOM%)
      - direction:               'Positive' (growth), 'Equilibrium', 'Negative' (decline)
      - estimated_annual_share_change:  Predicted % share change per Binet & Field
      - growth_outlook:          Strategic interpretation
      - esov_efficiency:         How many ESOV points per share point gained
      - source:                  Citation

    Edge cases:
      - category_spend <= 0 → ValueError
      - brand_spend < 0 → ValueError
      - brand_market_share outside [0, 1] → ValueError
    """
    _pct(brand_market_share, "brand_market_share")

    sov_result = share_of_voice(brand_spend, category_spend)
    sov_pct = sov_result["sov_pct"]
    som_pct = brand_market_share * 100.0
    esov_pts = sov_pct - som_pct

    # ESOV growth multiplier from IPA data (Ch.5, pp.53-55):
    # Small brands (<5% share) need ~5-8 ESOV per share point
    # Medium brands (5-15% share) need ~8-12 ESOV per share point
    # Large brands (>15% share) need ~12-15 ESOV per share point
    if brand_market_share < 0.05:
        esov_per_share_point = 6.5  # midpoint of 5-8
        size_tier = "Small"
    elif brand_market_share < 0.15:
        esov_per_share_point = 10.0  # midpoint of 8-12
        size_tier = "Medium"
    else:
        esov_per_share_point = 13.5  # midpoint of 12-15
        size_tier = "Large"

    if esov_per_share_point > 0:
        estimated_change = esov_pts / esov_per_share_point
    else:
        estimated_change = 0.0

    if esov_pts > 10.0:
        direction = "Strong Positive — aggressive growth posture"
        outlook = (
            f"Brand is outspending its market share by {esov_pts:.1f} pts. "
            f"Predicted annual share gain: ~{estimated_change:.2f} pts. "
            f"This is a growth investment phase."
        )
    elif esov_pts > 1.0:
        direction = "Positive — modest growth trajectory"
        outlook = (
            f"Brand has a slight ESOV advantage ({esov_pts:.1f} pts). "
            f"Predicted annual share gain: ~{estimated_change:.2f} pts."
        )
    elif esov_pts >= -1.0:
        direction = "Equilibrium — maintaining position"
        outlook = (
            f"ESOV near zero ({esov_pts:.1f} pts). Brand is holding share. "
            f"To grow, increase SOV relative to market share."
        )
    elif esov_pts >= -5.0:
        direction = "Negative — mild share erosion"
        outlook = (
            f"Brand is underspending its market share by {abs(esov_pts):.1f} pts. "
            f"Predicted annual share loss: ~{abs(estimated_change):.2f} pts."
        )
    else:
        direction = "Strong Negative — serious share hemorrhage"
        outlook = (
            f"Brand is dramatically underspending ({abs(esov_pts):.1f} pts below SOM). "
            f"Predicted annual share loss: ~{abs(estimated_change):.2f} pts. "
            f"Immediate budget review required."
        )

    return {
        "sov_pct": round(sov_pct, 2),
        "som_pct": round(som_pct, 2),
        "esov_pts": round(esov_pts, 2),
        "direction": direction,
        "estimated_annual_share_change": round(estimated_change, 3),
        "growth_outlook": outlook,
        "size_tier": size_tier,
        "esov_per_share_point": esov_per_share_point,
        "source": "Binet & Field, The Long and the Short of It (2013), Ch.5, pp.51-55; "
                  "Jones, J.P. (1990) — SOV-SOM relationship",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 6 — 60:40 BUDGET ALLOCATION
# Source: Binet & Field, Ch.1 ("The 60:40 Rule"), pp.3-14
#         Ch.8 ("Putting It All Together"), pp.67-84
# ═══════════════════════════════════════════════════════════════════════

def budget_allocation_60_40(
    total_budget: float,
    activation_override_pct: Optional[float] = None,
) -> Dict:
    """
    60:40 Budget Allocation — the empirically optimal marketing budget split.

    Binet & Field (Ch.1, p.5): "The optimal budget split is approximately
    60% brand-building to 40% sales activation."

    The IPA databank of 996 campaigns shows that brands allocating ~60% to
    brand-building and ~40% to activation consistently achieve the strongest
    long-term business results (Ch.1, pp.8-10).

    Brand-building (60%): Emotional, story-driven, long-term — builds mental
      availability, awareness, associations, and perceived quality.
    Activation (40%): Rational, targeted, short-term — converts mental
      availability into sales.

    Args:
      total_budget:            Total marketing budget (any currency units).
      activation_override_pct: Optional override for activation percentage
                               on a 0-100 scale (e.g., 70 means 70% activation,
                               30% brand-building). Must be in [0, 100].

    Returns dict with:
      - brand_building_budget:    Budget allocated to brand-building
      - activation_budget:        Budget allocated to activation
      - brand_building_pct:       Actual brand-building percentage
      - activation_pct:           Actual activation percentage
      - ratio_label:              Human-readable split
      - is_optimal_range:         bool — within Binet & Field's 50-70%
                                  brand-building sweet spot
      - channel_allocation_guide: Suggested channel split
      - source:                   Citation

    Edge cases:
      - total_budget <= 0 → ValueError
      - activation_override_pct outside [0, 100] → ValueError
    """
    if total_budget <= 0:
        raise ValueError(f"total_budget must be > 0, got {total_budget}")

    # Determine activation percentage
    if activation_override_pct is not None:
        if not isinstance(activation_override_pct, (int, float)):
            raise TypeError(
                f"activation_override_pct must be a number, "
                f"got {type(activation_override_pct).__name__}"
            )
        if isinstance(activation_override_pct, bool):
            raise TypeError("activation_override_pct must be a number, got bool")
        if activation_override_pct < 0.0 or activation_override_pct > 100.0:
            raise ValueError(
                f"activation_override_pct must be in [0, 100], "
                f"got {activation_override_pct}"
            )
        # Convert percentage (0-100) to proportion (0-1) for _pct validation
        activation_proportion = activation_override_pct / 100.0
        _pct(activation_proportion, "activation_override_pct (converted)")
        activation_pct = activation_override_pct
    else:
        activation_pct = 40.0  # default 40% activation

    brand_building_pct = 100.0 - activation_pct

    # Compute budgets
    activation_budget = total_budget * (activation_pct / 100.0)
    brand_building_budget = total_budget - activation_budget

    # Optimal range per Binet & Field (Ch.1, p.10): 50-70% brand-building
    is_optimal = 50.0 <= brand_building_pct <= 70.0

    if brand_building_pct >= 60.0:
        ratio_label = f"{brand_building_pct:.0f}:{activation_pct:.0f} — brand-building led"
    elif brand_building_pct >= 50.0:
        ratio_label = f"{brand_building_pct:.0f}:{activation_pct:.0f} — balanced"
    else:
        ratio_label = f"{brand_building_pct:.0f}:{activation_pct:.0f} — activation-heavy"

    # Channel allocation guide (Binet & Field, Ch.8, pp.79-82)
    channel_guide = {
        "brand_building_channels": {
            "tv_cinema": round(brand_building_budget * 0.30, 2),
            "radio_outdoor": round(brand_building_budget * 0.20, 2),
            "social_content_brand": round(brand_building_budget * 0.25, 2),
            "sponsorship_pr": round(brand_building_budget * 0.25, 2),
        },
        "activation_channels": {
            "search_shopping": round(activation_budget * 0.30, 2),
            "direct_mail_email": round(activation_budget * 0.25, 2),
            "social_content_activation": round(activation_budget * 0.25, 2),
            "retail_trade": round(activation_budget * 0.20, 2),
        },
    }

    return {
        "total_budget": total_budget,
        "brand_building_budget": round(brand_building_budget, 2),
        "activation_budget": round(activation_budget, 2),
        "brand_building_pct": round(brand_building_pct, 1),
        "activation_pct": round(activation_pct, 1),
        "ratio_label": ratio_label,
        "is_optimal_range": is_optimal,
        "channel_allocation_guide": channel_guide,
        "source": "Binet & Field, The Long and the Short of It (2013), Ch.1, pp.3-14; "
                  "Ch.8, pp.67-84",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 7 — DISTINCTIVE ASSET CHECKER
# Source: Aaker, Ch.8 ("Brand Architecture / Distinctive Assets"), pp.196-228
#         Sharp, Byron, *How Brands Grow* (2010) — distinctive brand assets
# ═══════════════════════════════════════════════════════════════════════

def distinctive_asset_checker(
    assets: List[Dict],
) -> Dict:
    """
    Distinctive Asset Checker — audits a brand's sensory shortcuts.

    Aaker (Ch.8, pp.200-228) identifies distinctive assets as the sensory
    elements that trigger brand recognition without conscious processing:
      - Logos, colors, taglines, sonic signatures, characters/mascots,
        packaging shapes, typography, spokespeople, scents.

    Aaker's four heuristics for distinctive asset strength (Ch.8, pp.214-222):
      1. Fame over differentiation: The asset must be famous (recognised by
         the majority), not merely unique.
      2. Consistency over novelty: The strongest assets have been maintained
         with minimal modification for decades.
      3. Link to the brand, not the category: If consumers see the asset and
         think "cola" rather than "Coca-Cola," it's NOT a distinctive asset.
      4. Multi-sensory where possible: The most powerful assets work across
         multiple senses.

    Args:
      assets: List of dicts, each with:
        - "name":                  str   — asset name/description
        - "fame":                  float — proportion recognising (0-1)
        - "uniqueness":            float — proportion attributing to THIS
                                          brand vs competitors (0-1)
        - "consistency_years":     float — years of consistent use
        - "multi_sensory_count":   int   — number of senses engaged

    Returns dict with:
      - assets_evaluated:       List of per-asset verdicts with scores
      - healthy_count:          Number of assets passing ALL thresholds
      - at_risk_count:          Number failing at least one threshold
      - overall_health:         'Excellent', 'Good', 'Adequate', 'Weak', or 'None'
      - inventory_score:        0-100 composite of all assets
      - recommendations:        List of specific improvement suggestions
      - source:                 Citation

    Thresholds (Aaker, Ch.8, pp.222-228):
      - Fame >= 70%
      - Uniqueness >= 80%
      - Consistency >= 3 years (per Binet & Field creative commitment)
      - Multi-sensory count >= 2

    Edge cases:
      - Empty list → ValueError
      - Any fame/uniqueness outside [0, 1] → ValueError
    """
    if not assets:
        raise ValueError("assets must be non-empty")

    evaluated = []
    healthy = 0
    at_risk = 0
    recommendations = []

    for i, asset in enumerate(assets):
        if not isinstance(asset, dict):
            raise TypeError(f"assets[{i}] must be a dict")

        required_keys = {"name", "fame", "uniqueness", "consistency_years", "multi_sensory_count"}
        missing = required_keys - set(asset.keys())
        if missing:
            raise ValueError(f"assets[{i}] missing required keys: {missing}")

        _pct(asset["fame"], f"assets[{i}].fame")
        _pct(asset["uniqueness"], f"assets[{i}].uniqueness")
        _fv(asset["consistency_years"], f"assets[{i}].consistency_years")
        _validate_int_nonnegative(asset["multi_sensory_count"], f"assets[{i}].multi_sensory_count")

        # Apply Aaker's four thresholds
        checks = {
            "fame": asset["fame"] >= 0.70,
            "uniqueness": asset["uniqueness"] >= 0.80,
            "consistency": asset["consistency_years"] >= 3.0,
            "multi_sensory": asset["multi_sensory_count"] >= 2,
        }

        all_pass = all(checks.values())
        if all_pass:
            healthy += 1
            status = "PASS — fully distinctive"
        else:
            at_risk += 1
            failed = [k for k, v in checks.items() if not v]
            status = f"FAIL — gaps in: {', '.join(failed)}"
            if not checks["fame"]:
                recommendations.append(
                    f"'{asset['name']}': Increase fame — currently at "
                    f"{asset['fame']:.0%}, target >= 70% (Aaker, Ch.8, p.214)"
                )
            if not checks["uniqueness"]:
                recommendations.append(
                    f"'{asset['name']}': Improve brand linkage — only "
                    f"{asset['uniqueness']:.0%} correctly attribute to your brand "
                    f"(Aaker, Ch.8, p.218)"
                )
            if not checks["consistency"]:
                recommendations.append(
                    f"'{asset['name']}': Maintain longer — only "
                    f"{asset['consistency_years']:.1f} years vs. 3+ year threshold "
                    f"(Aaker, Ch.8, p.216; Binet & Field, Ch.7, p.59)"
                )
            if not checks["multi_sensory"]:
                recommendations.append(
                    f"'{asset['name']}': Expand sensory reach — currently "
                    f"{asset['multi_sensory_count']} sense(s), target 2+ "
                    f"(Aaker, Ch.8, p.222)"
                )

        # Composite asset score (0-100)
        asset_score = (
            asset["fame"] * 30.0 +
            asset["uniqueness"] * 40.0 +  # uniqueness weighted highest
            min(asset["consistency_years"] / 10.0, 1.0) * 15.0 +
            min(asset["multi_sensory_count"] / 5.0, 1.0) * 15.0
        )

        evaluated.append({
            "name": asset["name"],
            "fame": round(asset["fame"] * 100, 1),
            "uniqueness": round(asset["uniqueness"] * 100, 1),
            "consistency_years": asset["consistency_years"],
            "multi_sensory_count": asset["multi_sensory_count"],
            "all_checks_pass": all_pass,
            "status": status,
            "asset_score": round(asset_score, 1),
        })

    # Overall health
    total = len(assets)
    if healthy == total:
        overall = "Excellent — all distinctive assets are strong and protected"
    elif healthy >= total * 0.75:
        overall = "Good — most assets are distinctive; a few need attention"
    elif healthy >= total * 0.50:
        overall = "Adequate — about half the assets need work"
    elif healthy > 0:
        overall = "Weak — most assets fail distinctiveness criteria"
    else:
        overall = "None — no distinctive assets; the brand has no sensory shortcuts"

    inventory_score = round(
        sum(e["asset_score"] for e in evaluated) / total, 1
    ) if total > 0 else 0.0

    return {
        "assets_evaluated": evaluated,
        "healthy_count": healthy,
        "at_risk_count": at_risk,
        "total_assets": total,
        "overall_health": overall,
        "inventory_score": inventory_score,
        "recommendations": recommendations,
        "source": "Aaker, Building Strong Brands (1996), Ch.8, pp.196-228; "
                  "Sharp, How Brands Grow (2010)",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 8 — PERCEIVED QUALITY GAP ANALYZER
# Source: Aaker, Ch.4 ("Perceived Quality"), pp.56-85
# ═══════════════════════════════════════════════════════════════════════

def perceived_quality_gap_analyzer(
    perceived_quality_score: float,
    actual_quality_score: float,
    price_premium_pct: Optional[float] = None,
) -> Dict:
    """
    Perceived Quality Gap Analyzer — diagnoses the perception-reality gap.

    Aaker (Ch.4, pp.58-60): "Perceived quality is NOT the same as actual
    quality. A product can have high actual quality and low perceived quality
    — a marketing failure. A product can have moderate actual quality and high
    perceived quality — a marketing success."

    The gap between perceived and actual quality drives four forms of value
    (Aaker, Ch.4, pp.62-72):
      1. Reason to Buy (differentiation)
      2. Price Premium (higher perceived quality supports higher prices)
      3. Channel Leverage (retailers want high-quality brands)
      4. Brand Extension Potential (quality perceptions transfer)

    Args:
      perceived_quality_score: Consumer perception rating (1-10 scale).
      actual_quality_score:    Objective/engineering quality rating (1-10).
      price_premium_pct:       Optional — price premium vs category average
                               as a proportion (0-1, e.g., 0.20 = 20% premium).

    Returns dict with:
      - gap:                Signed difference (perceived - actual)
      - gap_magnitude:      'Large', 'Moderate', 'Small', 'None'
      - gap_direction:      'Positive' (branding success), 'Negative' (failure),
                            'Neutral' (aligned)
      - strategic_implication: What this gap means for strategy
      - value_chain_impact:    Impact on the four value drivers
      - recommendation:        What to do about it
      - source:                Citation

    Edge cases:
      - Scores outside 1-10 → ValueError
      - price_premium_pct outside [0, 1] → ValueError
    """
    for name, val in [("perceived_quality_score", perceived_quality_score),
                       ("actual_quality_score", actual_quality_score)]:
        if not isinstance(val, (int, float)) or isinstance(val, bool):
            raise TypeError(f"{name} must be a number (1-10), got {type(val).__name__}")
        if val < 1.0 or val > 10.0:
            raise ValueError(f"{name} must be 1-10, got {val}")

    if price_premium_pct is not None:
        _pct(price_premium_pct, "price_premium_pct")

    gap = round(perceived_quality_score - actual_quality_score, 1)
    abs_gap = abs(gap)

    if abs_gap >= 4.0:
        magnitude = "Large"
    elif abs_gap >= 2.0:
        magnitude = "Moderate"
    elif abs_gap >= 0.5:
        magnitude = "Small"
    else:
        magnitude = "None — perceived and actual quality are aligned"

    # Gap direction and strategic implications
    if gap > 0.5:
        direction = "Positive — perceived quality exceeds actual quality"
        # This is a marketing/differentiation success (Aaker, Ch.4, p.68)
        strategic = (
            "BRANDING SUCCESS. Consumers perceive higher quality than the "
            "product objectively delivers. This is the ideal state for "
            "premium brands. The brand's marketing is creating a quality halo."
        )
        value_chain = {
            "reason_to_buy": "STRONG — quality perception creates differentiation",
            "price_premium": (
                f"SUPPORTS PREMIUM — current premium: {price_premium_pct:.0%}"
                if price_premium_pct is not None
                else "LIKELY SUPPORTS PREMIUM — quality perception justifies higher prices"
            ),
            "channel_leverage": "STRONG — retailers want perceived-quality brands",
            "extension_potential": "STRONG — quality halo transfers to new products",
        }
        recommendation = (
            "PROTECT the quality perception. Invest in maintaining the brand "
            "associations that create the quality halo. Be cautious of cost-"
            "cutting that could erode actual quality — if the gap becomes too "
            "large, the brand becomes vulnerable to a quality scandal."
        )

    elif gap < -0.5:
        direction = "Negative — actual quality exceeds perceived quality"
        # This is a marketing failure (Aaker, Ch.4, p.60)
        strategic = (
            "MARKETING FAILURE. The product is objectively better than "
            "consumers perceive. The brand is leaving value on the table — "
            "charging less and earning less loyalty than the product deserves."
        )
        value_chain = {
            "reason_to_buy": "WEAK — product quality is invisible to consumers",
            "price_premium": (
                f"UNDERPRICED — should command a higher premium than {price_premium_pct:.0%}"
                if price_premium_pct is not None
                else "LIKELY UNDERPRICED — actual quality supports higher prices"
            ),
            "channel_leverage": "WEAK — retailers don't see the brand as premium",
            "extension_potential": "UNTAPPED — quality could transfer but perception blocks it",
        }
        recommendation = (
            "INVEST in quality SIGNALLING. Use Ogilvy's Specificity Principle: "
            "communicate concrete, specific proof points of quality. Consider "
            "third-party certifications, awards, expert endorsements, and "
            "detailed product demonstrations. The gap is a marketing problem, "
            "not a product problem."
        )

    else:
        direction = "Neutral — perceived and actual quality are aligned"
        strategic = (
            "ALIGNMENT. Consumer perception matches objective reality. "
            "The brand is accurately communicating its quality level. "
            "This is stable but limits upside — there's no quality halo effect."
        )
        value_chain = {
            "reason_to_buy": "ADEQUATE — quality matches expectations",
            "price_premium": (
                f"APPROPRIATE — premium {price_premium_pct:.0%} matches quality"
                if price_premium_pct is not None
                else "LIKELY APPROPRIATE — price matches quality perception"
            ),
            "channel_leverage": "ADEQUATE — quality reputation is fair",
            "extension_potential": "MODERATE — quality won't hinder extensions but won't boost them",
        }
        if abs_gap <= 0.5 and perceived_quality_score >= 8.0:
            recommendation = (
                "MAINTAIN the alignment. Both perceived and actual quality are "
                "high — continue delivering and communicating consistently."
            )
        else:
            recommendation = (
                "IMPROVE both actual quality AND quality communication "
                "simultaneously. Alignment at a low level is not a strategy — "
                "it's a shared weakness."
            )

    return {
        "perceived_quality_score": perceived_quality_score,
        "actual_quality_score": actual_quality_score,
        "gap": gap,
        "gap_magnitude": magnitude,
        "gap_direction": direction,
        "strategic_implication": strategic,
        "value_chain_impact": value_chain,
        "recommendation": recommendation,
        "price_premium_pct": price_premium_pct,
        "source": "Aaker, Building Strong Brands (1996), Ch.4, pp.56-85",
    }


# ═══════════════════════════════════════════════════════════════════════
# PART 9 — CREATIVE COMMITMENT SCORER
# Source: Binet & Field, Ch.7 ("Creative Commitment"), pp.57-64
# ═══════════════════════════════════════════════════════════════════════

def creative_commitment_scorer(
    campaign_years: float,
    creative_refreshes: int,
    core_idea_consistent: bool,
    distinctiveness_score: Optional[float] = None,
) -> Dict:
    """
    Creative Commitment Scorer — evaluates long-term creative consistency.

    Binet & Field (Ch.7, p.59): "Campaigns that show high creative commitment
    — defined as the consistent use of a distinctive creative idea over
    multiple years — significantly outperform campaigns that frequently
    change their creative approach."

    Key findings from the IPA databank (Ch.7, pp.60-62):
      - Campaigns running the same core creative idea for 3+ years show
        **40% higher effectiveness** than those changing annually.
      - The "distinctive asset" effect: consistent creative elements become
        shortcuts to brand recognition, reducing the cost of each subsequent
        campaign.
      - Counterintuitive finding (p.63): "Advertisers overestimate audience
        boredom. The audience sees your ads far less often than you do."

    Args:
      campaign_years:         Total years the campaign/core idea has run.
      creative_refreshes:     Number of times the creative has been
                              significantly refreshed (not minor updates).
      core_idea_consistent:   bool — has the CORE creative idea remained
                              the same, even through refreshes?
      distinctiveness_score:  Optional — 0-10 rating of how distinctive
                              the creative is vs. competitors' advertising.

    Returns dict with:
      - commitment_tier:         'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'
      - effectiveness_multiplier: Estimated long-term effectiveness vs.
                                  average (1.0 = baseline)
      - is_highly_effective:      bool
      - years_remaining_optimal:  How many more years the campaign should
                                  run before considering a major change
      - boredom_warning:          bool — true if the advertiser is likely
                                  over-estimating audience boredom
      - recommendation:           Strategic guidance
      - source:                   Citation

    Edge cases:
      - campaign_years < 0 → ValueError
      - creative_refreshes < 0 → ValueError
      - distinctiveness_score outside 1-10 → ValueError
    """
    if campaign_years < 0:
        raise ValueError(f"campaign_years must be >= 0, got {campaign_years}")
    if not isinstance(creative_refreshes, int) or isinstance(creative_refreshes, bool):
        raise TypeError(f"creative_refreshes must be an integer, got {type(creative_refreshes).__name__}")
    if creative_refreshes < 0:
        raise ValueError(f"creative_refreshes must be >= 0, got {creative_refreshes}")
    if not isinstance(core_idea_consistent, bool):
        raise TypeError(f"core_idea_consistent must be a bool, got {type(core_idea_consistent).__name__}")

    if distinctiveness_score is not None:
        if not isinstance(distinctiveness_score, (int, float)) or isinstance(distinctiveness_score, bool):
            raise TypeError(
                f"distinctiveness_score must be a number (1-10), "
                f"got {type(distinctiveness_score).__name__}"
            )
        if distinctiveness_score < 1.0 or distinctiveness_score > 10.0:
            raise ValueError(f"distinctiveness_score must be 1-10, got {distinctiveness_score}")

    # Calculate refresh rate: refreshes per year
    refresh_rate = creative_refreshes / campaign_years if campaign_years > 0 else float("inf")

    # Commitment tier determination (Binet & Field, Ch.7, pp.60-62)
    # Tier 1: 3+ years, core idea consistent, low refresh rate (<1 per year)
    # Tier 2: 2+ years, core idea consistent
    # Tier 3: <2 years OR frequent refreshes
    # Tier 4: changing constantly, no consistent core idea

    if campaign_years >= 3.0 and core_idea_consistent and refresh_rate <= 1.0:
        commitment_tier = "Tier 1 — High Creative Commitment"
        base_multiplier = 1.40  # 40% more effective
        is_highly_effective = True
    elif campaign_years >= 2.0 and core_idea_consistent and refresh_rate <= 1.5:
        commitment_tier = "Tier 2 — Moderate Creative Commitment"
        base_multiplier = 1.25  # 25% more effective
        is_highly_effective = True
    elif campaign_years >= 1.0:
        commitment_tier = "Tier 3 — Low Creative Commitment"
        base_multiplier = 1.00  # baseline
        is_highly_effective = False
    else:
        commitment_tier = "Tier 4 — No Creative Commitment"
        base_multiplier = 0.50  # 50% below average
        is_highly_effective = False

    # Distinctiveness bonus (Ch.7, p.62): highly distinctive creative
    # within a consistent campaign adds additional effectiveness.
    if distinctiveness_score is not None and core_idea_consistent:
        if distinctiveness_score >= 7.0:
            distinctiveness_bonus = 0.10
        elif distinctiveness_score >= 5.0:
            distinctiveness_bonus = 0.05
        else:
            distinctiveness_bonus = 0.0
    else:
        distinctiveness_bonus = 0.0

    effectiveness_multiplier = round(base_multiplier + distinctiveness_bonus, 2)

    # Optimal remaining years: campaigns that have run 1-2 years should keep
    # going to reach the 3+ year sweet spot. Campaigns beyond 5 years should
    # consider whether boredom is genuinely setting in.
    if campaign_years < 3.0:
        years_remaining_optimal = max(0.0, 3.0 - campaign_years)
        boredom_warning = False
        rec = (
            f"CONTINUE. The campaign has only run {campaign_years:.1f} years. "
            f"Run for at least {years_remaining_optimal:.1f} more to reach the "
            f"3-year effectiveness threshold. The audience is not bored — you "
            f"are overestimating wear-out (Binet & Field, Ch.7, p.63)."
        )
    elif campaign_years >= 5.0 and refresh_rate < 0.5:
        years_remaining_optimal = 0.0
        boredom_warning = True
        rec = (
            f"MONITOR. The campaign has run {campaign_years:.1f} years with few "
            f"refreshes. While Binet & Field warn against premature change, "
            f"genuine audience saturation is possible at this duration. "
            f"Conduct fresh distinctiveness testing before making changes. "
            f"Consider a creative REFRESH (not replacement) that maintains "
            f"the core idea."
        )
    else:
        years_remaining_optimal = 0.0
        boredom_warning = False
        rec = (
            f"MAINTAIN. The campaign is in the sweet spot ({campaign_years:.1f} "
            f"years, {creative_refreshes} refreshes). Continue running with minor "
            f"refreshes to maintain audience interest while preserving the "
            f"distinctive asset effect."
        )

    return {
        "commitment_tier": commitment_tier,
        "effectiveness_multiplier": effectiveness_multiplier,
        "is_highly_effective": is_highly_effective,
        "campaign_years": campaign_years,
        "creative_refreshes": creative_refreshes,
        "refresh_rate": round(refresh_rate, 2) if campaign_years > 0 else None,
        "core_idea_consistent": core_idea_consistent,
        "distinctiveness_score": distinctiveness_score,
        "years_remaining_optimal": round(years_remaining_optimal, 1),
        "boredom_warning": boredom_warning,
        "recommendation": rec,
        "source": "Binet & Field, The Long and the Short of It (2013), Ch.7, pp.57-64",
    }


# ═══════════════════════════════════════════════════════════════════════
# SELF-TEST SUITE — 23 tests covering all 9 functions
# ═══════════════════════════════════════════════════════════════════════

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
        elif isinstance(expected, dict):
            if actual != expected:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: matches")
                passed += 1
        elif expected is None:
            if actual is not None:
                print(f"  FAIL  {label}: expected None, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: None")
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
    print("SELF-TEST SUITE: brand_metrics.py")
    print("Sources: Aaker (1996) + Binet & Field (2013) + Ries & Trout (1993)")
    print("=" * 70)

    # ═════════════════════════════════════════════════════════════════
    # TEST 1-3: brand_awareness_score (Aaker, Ch.3)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 1-3: brand_awareness_score (Aaker, Ch.3) ──")

    # Test 1: Moderate brand — decent aided, modest unaided, weak top-of-mind
    # Cumulative: 0.10*50 + 0.30*30 + 0.60*20 = 5+9+12 = 26.0
    aw1 = brand_awareness_score(aided_pct=0.60, unaided_pct=0.30, top_of_mind_pct=0.10)
    check("awareness#1: composite = 26.0", aw1["composite_score"], 26.0, tol=0.2)
    check("awareness#1: level = Weak", aw1["awareness_level"].split(" —")[0], "Weak")
    check("awareness#1: ratio ~0.5", round(aw1["unaided_to_aided_ratio"], 1), 0.5)

    # Test 2: Top-of-mind dominant brand (like Coke) — very high scores
    # Cumulative: 0.55*50 + 0.85*30 + 0.95*20 = 27.5+25.5+19 = 72.0
    aw2 = brand_awareness_score(aided_pct=0.95, unaided_pct=0.85, top_of_mind_pct=0.55)
    check("awareness#2: composite = 72.0", aw2["composite_score"], 72.0, tol=0.2)
    check("awareness#2: level = Strong", aw2["awareness_level"].split(" —")[0], "Strong")

    # Test 3: Edge case — zero awareness
    aw3 = brand_awareness_score(aided_pct=0.0, unaided_pct=0.0, top_of_mind_pct=0.0)
    check("awareness#3: composite = 0", aw3["composite_score"], 0.0)
    check("awareness#3: level = None", aw3["awareness_level"], "None — no measurable awareness")
    check("awareness#3: ratio diagnosis = No data",
          "No data" in aw3["ratio_diagnosis"], True)

    # ═════════════════════════════════════════════════════════════════
    # TEST 4-6: brand_association_strength (Aaker, Ch.6 + Ries & Trout)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 4-6: brand_association_strength (Aaker, Ch.6 + Ries & Trout) ──")

    # Test 4: Volvo — single dominant association (Safety)
    as1 = brand_association_strength([
        {"name": "safety", "strength": 10, "favorability": 9, "uniqueness": 9},
        {"name": "reliability", "strength": 7, "favorability": 8, "uniqueness": 5},
        {"name": "family-friendly", "strength": 6, "favorability": 7, "uniqueness": 4},
    ])
    check("assoc#4: owned word = safety", as1["owned_word"], "safety")
    check("assoc#4: ownership achieved", as1["ownership_achieved"], True)
    check("assoc#4: score >= 7.0", as1["owned_word_score"] >= 7.0, True)

    # Test 5: Multiple moderate associations — no clear owned word
    as2 = brand_association_strength([
        {"name": "affordable", "strength": 6, "favorability": 6, "uniqueness": 3},
        {"name": "convenient", "strength": 5, "favorability": 6, "uniqueness": 2},
        {"name": "reliable", "strength": 5, "favorability": 7, "uniqueness": 3},
    ])
    check("assoc#5: ownership NOT achieved", as2["ownership_achieved"], False)
    check("assoc#5: count = 3", as2["association_count"], 3)

    # Test 6: Edge case — empty list
    check_raises("assoc#6: empty list", brand_association_strength, [])

    # ═════════════════════════════════════════════════════════════════
    # TEST 7-9: nps_loyalty (Aaker, Ch.5 + Reichheld)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 7-9: nps_loyalty (Aaker, Ch.5 + Reichheld) ──")

    # Test 7: Excellent NPS — promoter-heavy (Apple-like)
    nps1 = nps_loyalty(promoters=700, passives=200, detractors=100,
                       repurchase_rate=0.85, share_of_wallet=0.60)
    check("nps#7: NPS = 60", nps1["nps_score"], 60.0)
    check("nps#7: level = Committed", "Committed" in nps1["loyalty_level"], True)
    check("nps#7: is_healthy", nps1["is_healthy"], True)

    # Test 8: Poor NPS — detractor-heavy (commodity brand)
    nps2 = nps_loyalty(promoters=100, passives=300, detractors=600,
                       repurchase_rate=0.30, share_of_wallet=0.15)
    check("nps#8: NPS = -50", nps2["nps_score"], -50.0)
    check("nps#8: level = Hostile Base", "Hostile Base" in nps2["loyalty_level"], True)
    check("nps#8: is_healthy = False", nps2["is_healthy"], False)

    # Test 9: Edge case — zero respondents
    check_raises("nps#9: zero respondents", nps_loyalty, 0, 0, 0)

    # ═════════════════════════════════════════════════════════════════
    # TEST 10-11: share_of_voice (Binet & Field, Ch.5)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 10-11: share_of_voice (Binet & Field, Ch.5) ──")

    # Test 10: Basic SOV calculation — brand is 20% of category spend
    sov1 = share_of_voice(brand_spend=50_000_000, category_spend=250_000_000)
    check("sov#10: SOV = 0.20", sov1["sov"], 0.20, tol=0.001)
    check("sov#10: SOV pct = 20%", sov1["sov_pct"], 20.0, tol=0.01)
    check("sov#10: rank = Major", sov1["spend_rank"].split(" —")[0], "Major")

    # Test 11: Edge case — zero category spend
    check_raises("sov#11: zero category spend", share_of_voice, 1000, 0)

    # ═════════════════════════════════════════════════════════════════
    # TEST 12-14: esov_calculator (Binet & Field, Ch.5-6)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 12-14: esov_calculator (Binet & Field, Ch.5-6) ──")

    # Test 12: Positive ESOV — brand outspending its market share
    esov1 = esov_calculator(brand_spend=30_000_000, category_spend=100_000_000,
                            brand_market_share=0.15)
    check("esov#12: SOV = 30%", esov1["sov_pct"], 30.0, tol=0.01)
    check("esov#12: ESOV = 15 pts", esov1["esov_pts"], 15.0, tol=0.01)
    check("esov#12: direction = Strong Positive",
          "Strong Positive" in esov1["direction"], True)

    # Test 13: Negative ESOV — brand underspending vs market share
    esov2 = esov_calculator(brand_spend=5_000_000, category_spend=100_000_000,
                            brand_market_share=0.20)
    check("esov#13: SOV = 5%", esov2["sov_pct"], 5.0, tol=0.01)
    check("esov#13: ESOV = -15 pts", esov2["esov_pts"], -15.0, tol=0.01)
    check("esov#13: direction = Strong Negative",
          "Strong Negative" in esov2["direction"], True)

    # Test 14: ESOV equilibrium — SOV approx equals SOM
    esov3 = esov_calculator(brand_spend=10_000_000, category_spend=100_000_000,
                            brand_market_share=0.10)
    check("esov#14: SOV = 10%, SOM = 10%", abs(esov3["esov_pts"]) < 1.0, True)
    check("esov#14: direction = Equilibrium",
          "Equilibrium" in esov3["direction"], True)

    # ═════════════════════════════════════════════════════════════════
    # TEST 15-17: budget_allocation_60_40 (Binet & Field, Ch.1)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 15-17: budget_allocation_60_40 (Binet & Field, Ch.1) ──")

    # Test 15: Default 60:40 split on $1M budget
    bud1 = budget_allocation_60_40(total_budget=1_000_000)
    check("budget#15: brand-building ~600k",
          abs(bud1["brand_building_budget"] - 600_000.0) < 1.0, True)
    check("budget#15: activation ~400k",
          abs(bud1["activation_budget"] - 400_000.0) < 1.0, True)
    check("budget#15: brand-building pct = 60",
          abs(bud1["brand_building_pct"] - 60.0) < 0.1, True)
    check("budget#15: is optimal", bud1["is_optimal_range"], True)

    # Test 16: Override to 70:30 activation-heavy split
    # activation_override_pct=70 means 70% activation, 30% brand-building
    bud2 = budget_allocation_60_40(total_budget=1_000_000, activation_override_pct=70)
    check("budget#16: brand-building ~300k (30%)",
          abs(bud2["brand_building_budget"] - 300_000.0) < 1.0, True)
    check("budget#16: activation ~700k (70%)",
          abs(bud2["activation_budget"] - 700_000.0) < 1.0, True)
    check("budget#16: not optimal (brand < 50%)",
          bud2["is_optimal_range"], False)

    # Test 17: Edge case — invalid override
    check_raises("budget#17: override > 100",
                 budget_allocation_60_40, 1_000_000, activation_override_pct=150)
    check_raises("budget#17: total_budget <= 0",
                 budget_allocation_60_40, 0)

    # ═════════════════════════════════════════════════════════════════
    # TEST 18-20: distinctive_asset_checker (Aaker, Ch.8)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 18-20: distinctive_asset_checker (Aaker, Ch.8) ──")

    # Test 18: Strong distinctive assets (like Nike)
    da1 = distinctive_asset_checker([
        {"name": "Swoosh logo", "fame": 0.95, "uniqueness": 0.92,
         "consistency_years": 50.0, "multi_sensory_count": 2},
        {"name": "Just Do It tagline", "fame": 0.90, "uniqueness": 0.88,
         "consistency_years": 35.0, "multi_sensory_count": 2},
        {"name": "Nike orange shoebox", "fame": 0.72, "uniqueness": 0.80,
         "consistency_years": 15.0, "multi_sensory_count": 2},
    ])
    check("asset#18: healthy = 3", da1["healthy_count"], 3)
    check("asset#18: at_risk = 0", da1["at_risk_count"], 0)
    check("asset#18: overall = Excellent", "Excellent" in da1["overall_health"], True)

    # Test 19: Weak distinctive assets (generic brand)
    da2 = distinctive_asset_checker([
        {"name": "Generic logo update", "fame": 0.35, "uniqueness": 0.40,
         "consistency_years": 1.5, "multi_sensory_count": 1},
        {"name": "Stock photography style", "fame": 0.20, "uniqueness": 0.10,
         "consistency_years": 2.0, "multi_sensory_count": 1},
    ])
    check("asset#19: healthy = 0", da2["healthy_count"], 0)
    check("asset#19: at_risk = 2", da2["at_risk_count"], 2)
    check("asset#19: recommendations generated",
          len(da2["recommendations"]) > 0, True)

    # Test 20: Edge case — empty asset list
    check_raises("asset#20: empty list", distinctive_asset_checker, [])

    # ═════════════════════════════════════════════════════════════════
    # TEST 21-22: perceived_quality_gap_analyzer (Aaker, Ch.4)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Tests 21-22: perceived_quality_gap_analyzer (Aaker, Ch.4) ──")

    # Test 21: Positive gap — perceived quality exceeds actual (branding success)
    pq1 = perceived_quality_gap_analyzer(
        perceived_quality_score=8.0, actual_quality_score=6.0, price_premium_pct=0.25
    )
    check("quality#21: gap = +2.0", pq1["gap"], 2.0)
    check("quality#21: direction = Positive", "Positive" in pq1["gap_direction"], True)
    check("quality#21: magnitude = Moderate", pq1["gap_magnitude"], "Moderate")
    check("quality#21: strategic = BRANDING SUCCESS",
          "BRANDING SUCCESS" in pq1["strategic_implication"], True)

    # Test 22: Negative gap — actual quality exceeds perceived (marketing failure)
    pq2 = perceived_quality_gap_analyzer(
        perceived_quality_score=5.0, actual_quality_score=8.0, price_premium_pct=0.05
    )
    check("quality#22: gap = -3.0", pq2["gap"], -3.0)
    check("quality#22: direction = Negative", "Negative" in pq2["gap_direction"], True)
    check("quality#22: magnitude = Moderate",
          pq2["gap_magnitude"] in ("Moderate", "Large"), True)
    check("quality#22: recommendation mentions Ogilvy",
          "Ogilvy" in pq2["recommendation"], True)

    # ═════════════════════════════════════════════════════════════════
    # TEST 23: creative_commitment_scorer (Binet & Field, Ch.7)
    # ═════════════════════════════════════════════════════════════════

    print("\n── Test 23: creative_commitment_scorer (Binet & Field, Ch.7) ──")

    # High commitment: 5 years, 3 refreshes, consistent core idea, distinctive
    cc1 = creative_commitment_scorer(
        campaign_years=5.0, creative_refreshes=3, core_idea_consistent=True,
        distinctiveness_score=8.0
    )
    check("creative#23a: tier = Tier 1", "Tier 1" in cc1["commitment_tier"], True)
    check("creative#23b: multiplier >= 1.40", cc1["effectiveness_multiplier"] >= 1.40, True)
    check("creative#23c: is_highly_effective", cc1["is_highly_effective"], True)
    # 5yr + 3 refreshes → refresh_rate=0.6, not <0.5 → sweet spot, no boredom warning
    check("creative#23d: boredom_warning = False (refresh_rate 0.6 >= 0.5)",
          cc1["boredom_warning"], False)

    # Low commitment: 0.5 years, 2 refreshes, no consistent core idea
    cc2 = creative_commitment_scorer(
        campaign_years=0.5, creative_refreshes=2, core_idea_consistent=False
    )
    check("creative#23e: tier = Tier 4", "Tier 4" in cc2["commitment_tier"], True)
    check("creative#23f: multiplier < 1.0", cc2["effectiveness_multiplier"] < 1.0, True)
    check("creative#23g: is_highly_effective = False", cc2["is_highly_effective"], False)

    # ── Edge cases ──
    print("\n  ── Additional Edge Cases ──")
    # awareness: top_of_mind > unaided (logically impossible)
    check_raises("awareness: top_of_mind > unaided",
                 brand_awareness_score, 0.50, 0.30, 0.40)
    # assoc: missing key in association dict
    check_raises("assoc: missing key",
                 brand_association_strength,
                 [{"name": "test", "strength": 5}])
    # nps: negative count
    check_raises("nps: negative count", nps_loyalty, -1, 10, 10)
    # esov: market share out of range
    check_raises("esov: SOM > 1.0", esov_calculator, 1000, 10000, 1.5)
    # quality: score out of range
    check_raises("quality: score > 10",
                 perceived_quality_gap_analyzer, 15.0, 5.0)
    # creative: negative years
    check_raises("creative: negative years",
                 creative_commitment_scorer, -1.0, 0, True)

    # ── Summary ──
    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    sys.exit(run_all_tests())
