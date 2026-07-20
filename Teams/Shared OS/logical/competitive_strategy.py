#!/usr/bin/env python3
"""
Competitive Strategy — Five Forces Framework
==============================================
Source: Porter, Michael E., *Competitive Strategy: Techniques for
        Analyzing Industries and Competitors* (1980, Free Press)

This module implements Porter's core frameworks as structured scoring
functions — each force has specific, citable criteria. It replaces
reasoning-based "strategic fit" scoring with Porter's actual framework.

Route: B (rule-based — deterministic criteria, no math beyond scoring)

Design rules:
  - Every force scored 1–5 with explicit criteria per level.
  - Every function validates inputs; no silent defaults.
  - Self-tests use classic industry examples (airlines, pharma, soft drinks).
  - No external dependencies — pure Python stdlib.
"""

from __future__ import annotations
import sys
import math
from typing import List, Dict, Optional, Tuple


# ═══════════════════════════════════════════════════════════════════
# PART 1 — FIVE FORCES ANALYSIS
# Source: Porter, Ch.1 ("The Structural Analysis of Industries")
# ═══════════════════════════════════════════════════════════════════

# ── 1.1 Threat of New Entrants (pp.7-17) ──────────────────────────

def threat_of_entry(
    economies_of_scale: int,
    product_differentiation: int,
    capital_requirements: int,
    switching_costs: int,
    access_to_distribution: int,
    cost_advantages_independent_of_scale: int,
    government_policy: int,
) -> Tuple[float, Dict[str, int]]:
    """
    Threat of New Entrants — the lower the barriers, the higher the threat.
    Ch.1, pp.7-17

    Each barrier scored 1–5 (5 = very high barrier → low threat):
      1 = No barrier (wide open)
      3 = Moderate barrier
      5 = Insurmountable barrier

    Returns:
      (average_barrier_score, breakdown_dict)
      Average of 1–2 → HIGH threat
      Average of 3 → MODERATE
      Average of 4–5 → LOW threat
    """
    barriers = {
        "economies_of_scale": economies_of_scale,
        "product_differentiation": product_differentiation,
        "capital_requirements": capital_requirements,
        "switching_costs": switching_costs,
        "access_to_distribution": access_to_distribution,
        "cost_advantages_independent_of_scale": cost_advantages_independent_of_scale,
        "government_policy": government_policy,
    }
    for name, val in barriers.items():
        if not isinstance(val, int) or val < 1 or val > 5:
            raise ValueError(f"{name} must be an integer 1–5, got {val}")

    avg = sum(barriers.values()) / len(barriers)
    return round(avg, 2), barriers


def entry_threat_label(avg_barrier: float) -> str:
    """Label the entry threat level from the average barrier score."""
    if avg_barrier >= 4.0:
        return "LOW — strong barriers protect incumbents"
    elif avg_barrier >= 3.0:
        return "MODERATE — some barriers exist, not impregnable"
    elif avg_barrier >= 2.0:
        return "HIGH — barriers are weak, entry is likely"
    else:
        return "VERY HIGH — virtually no barriers to entry"


# ── 1.2 Bargaining Power of Suppliers (pp.27-29) ──────────────────

def supplier_power(
    supplier_concentration: int,
    switching_costs: int,
    substitute_inputs: int,
    importance_to_supplier: int,
    threat_of_forward_integration: int,
) -> Tuple[float, Dict[str, int]]:
    """
    Bargaining Power of Suppliers.
    Ch.1, pp.27-29

    Each factor scored 1–5 (5 = high supplier power):
      1 = Suppliers have no leverage
      3 = Moderate leverage
      5 = Suppliers dominate the relationship

    Returns:
      (average_power_score, breakdown_dict)
      Average of 4–5 → HIGH supplier power
      Average of 3 → MODERATE
      Average of 1–2 → LOW supplier power
    """
    factors = {
        "supplier_concentration": supplier_concentration,
        "switching_costs": switching_costs,
        "substitute_inputs": substitute_inputs,
        "importance_to_supplier": importance_to_supplier,
        "threat_of_forward_integration": threat_of_forward_integration,
    }
    for name, val in factors.items():
        if not isinstance(val, int) or val < 1 or val > 5:
            raise ValueError(f"{name} must be an integer 1–5, got {val}")

    avg = sum(factors.values()) / len(factors)
    return round(avg, 2), factors


def power_label(avg_power: float, party: str = "Supplier") -> str:
    """Label the power level."""
    if avg_power >= 4.0:
        return f"HIGH — {party}s have strong leverage"
    elif avg_power >= 3.0:
        return f"MODERATE — {party}s have some leverage"
    else:
        return f"LOW — {party}s have little leverage"


# ── 1.3 Bargaining Power of Buyers (pp.24-27) ─────────────────────

def buyer_power(
    buyer_concentration: int,
    buyer_volume: int,
    switching_costs: int,
    threat_of_backward_integration: int,
    product_standardization: int,
    price_sensitivity: int,
) -> Tuple[float, Dict[str, int]]:
    """
    Bargaining Power of Buyers.
    Ch.1, pp.24-27

    Each factor scored 1–5 (5 = high buyer power):
      1 = Buyers are fragmented, zero leverage
      3 = Moderate buyer leverage
      5 = One buyer can destroy the business

    Returns:
      (average_power_score, breakdown_dict)
    """
    factors = {
        "buyer_concentration": buyer_concentration,
        "buyer_volume": buyer_volume,
        "switching_costs": switching_costs,
        "threat_of_backward_integration": threat_of_backward_integration,
        "product_standardization": product_standardization,
        "price_sensitivity": price_sensitivity,
    }
    for name, val in factors.items():
        if not isinstance(val, int) or val < 1 or val > 5:
            raise ValueError(f"{name} must be an integer 1–5, got {val}")

    avg = sum(factors.values()) / len(factors)
    return round(avg, 2), factors


# ── 1.4 Threat of Substitutes (pp.23-24) ───────────────────────────

def threat_of_substitutes(
    relative_price_performance: int,
    switching_costs: int,
    buyer_propensity_to_substitute: int,
) -> Tuple[float, Dict[str, int]]:
    """
    Threat of Substitute Products or Services.
    Ch.1, pp.23-24

    Each factor scored 1–5 (5 = high substitution threat):
      1 = No viable substitutes exist
      3 = Some substitutes exist, inferior
      5 = Substitutes are better and cheaper

    Returns:
      (average_threat_score, breakdown_dict)
    """
    factors = {
        "relative_price_performance": relative_price_performance,
        "switching_costs": switching_costs,
        "buyer_propensity_to_substitute": buyer_propensity_to_substitute,
    }
    for name, val in factors.items():
        if not isinstance(val, int) or val < 1 or val > 5:
            raise ValueError(f"{name} must be an integer 1–5, got {val}")

    avg = sum(factors.values()) / len(factors)
    return round(avg, 2), factors


def substitute_threat_label(avg_threat: float) -> str:
    """Label the substitute threat level."""
    if avg_threat >= 4.0:
        return "HIGH — viable substitutes exist, posing real danger"
    elif avg_threat >= 3.0:
        return "MODERATE — substitutes exist but are limited"
    elif avg_threat >= 2.0:
        return "LOW — few viable substitutes"
    else:
        return "VERY LOW — no substitutes in sight"


# ── 1.5 Rivalry Among Existing Competitors (pp.17-23) ─────────────

def competitive_rivalry(
    number_of_competitors: int,
    industry_growth: int,
    fixed_costs: int,
    product_differentiation: int,
    exit_barriers: int,
    diversity_of_competitors: int,
) -> Tuple[float, Dict[str, int]]:
    """
    Intensity of Rivalry Among Existing Competitors.
    Ch.1, pp.17-23

    Each factor scored 1–5 (5 = intense rivalry):
      1 = Gentle, stable competition
      3 = Moderate rivalry
      5 = Cutthroat, zero-sum competition

    Note: "industry_growth" is inverted — high growth = low rivalry.
      Score 1 = very fast growth (plenty of room)
      Score 5 = stagnant/declining (everyone fights for share)

    Returns:
      (average_rivalry_score, breakdown_dict)
    """
    factors = {
        "number_of_competitors": number_of_competitors,
        "industry_growth": industry_growth,
        "fixed_costs": fixed_costs,
        "product_differentiation": product_differentiation,
        "exit_barriers": exit_barriers,
        "diversity_of_competitors": diversity_of_competitors,
    }
    for name, val in factors.items():
        if not isinstance(val, int) or val < 1 or val > 5:
            raise ValueError(f"{name} must be an integer 1–5, got {val}")

    avg = sum(factors.values()) / len(factors)
    return round(avg, 2), factors


def rivalry_label(avg_rivalry: float) -> str:
    """Label the rivalry intensity."""
    if avg_rivalry >= 4.0:
        return "INTENSE — cutthroat competition, price wars likely"
    elif avg_rivalry >= 3.0:
        return "MODERATE — competitive but not destructive"
    else:
        return "LOW — gentle competition, stable margins"


# ── 1.6 Full Five Forces Summary ──────────────────────────────────

def five_forces_summary(
    entry_barriers: int,
    supplier_leverage: int,
    buyer_leverage: int,
    substitute_threat: int,
    rivalry_intensity: int,
) -> Dict[str, float]:
    """
    Five Forces Summary — a single-pass composite.
    Ch.1, pp.3-33

    Each force scored 1–5:
      1 = Very favorable to the firm (low threat / low power)
      3 = Neutral
      5 = Very unfavorable (high threat / high power)

    Returns dict with each force's score, the composite average,
    and an overall assessment.

    Edge cases:
      - Scores must be 1–5, integer or float. Float allowed for
        pre-computed averages from the individual factor functions.
    """
    forces = {
        "threat_of_new_entrants": float(entry_barriers),
        "supplier_power": float(supplier_leverage),
        "buyer_power": float(buyer_leverage),
        "threat_of_substitutes": float(substitute_threat),
        "competitive_rivalry": float(rivalry_intensity),
    }
    for name, val in forces.items():
        if val < 1.0 or val > 5.0:
            raise ValueError(f"{name} must be in [1, 5], got {val}")

    avg = sum(forces.values()) / len(forces)

    # Overall assessment
    if avg <= 2.0:
        verdict = "ATTRACTIVE — industry structure favors incumbents, strong profit potential"
    elif avg <= 3.0:
        verdict = "MODERATE — mixed forces, profits depend on positioning"
    elif avg <= 4.0:
        verdict = "UNFAVORABLE — multiple forces pressuring profitability"
    else:
        verdict = "HOSTILE — all five forces are adverse, survival is the goal"

    forces["average"] = round(avg, 2)
    forces["verdict"] = verdict

    return forces


# ═══════════════════════════════════════════════════════════════════
# PART 2 — GENERIC COMPETITIVE STRATEGIES
# Source: Porter, Ch.2 ("Generic Competitive Strategies")
# ═══════════════════════════════════════════════════════════════════

def classify_strategy(
    cost_position: int,
    differentiation: int,
    scope: str,
) -> Dict[str, str]:
    """
    Classify a firm's strategy using Porter's three generic strategies.
    Ch.2, pp.34-46

    Args:
      cost_position:  1–5 (5 = lowest cost in the industry)
      differentiation: 1–5 (5 = highly differentiated, unique product)
      scope:           "broad" or "narrow" (focus)

    Returns dict with:
      'strategy': 'Cost Leadership' | 'Differentiation' | 'Cost Focus' |
                  'Differentiation Focus' | 'Stuck in the Middle'
      'rationale': explanation string

    Edge cases:
      - scope not "broad" or "narrow" → ValueError
      - Low scores on both dimensions → "Stuck in the Middle" (Porter's
        explicit warning — this is the worst position)
      - Ambiguous (moderate both) → classified but flagged as "weak"
    """
    if not isinstance(cost_position, int) or cost_position < 1 or cost_position > 5:
        raise ValueError(f"cost_position must be 1–5, got {cost_position}")
    if not isinstance(differentiation, int) or differentiation < 1 or differentiation > 5:
        raise ValueError(f"differentiation must be 1–5, got {differentiation}")
    if scope not in ("broad", "narrow"):
        raise ValueError(f"scope must be 'broad' or 'narrow', got '{scope}'")

    # Clear leaders
    if cost_position >= 4 and differentiation <= 2:
        if scope == "broad":
            return {"strategy": "Cost Leadership",
                    "rationale": "Broad low-cost position; compete on price across the full market"}
        else:
            return {"strategy": "Cost Focus",
                    "rationale": "Low-cost in a narrow segment; serve a niche efficiently"}

    if differentiation >= 4 and cost_position <= 2:
        if scope == "broad":
            return {"strategy": "Differentiation",
                    "rationale": "Unique product valued across the full market; premium pricing"}
        else:
            return {"strategy": "Differentiation Focus",
                    "rationale": "Unique offering for a specific segment; premium in a niche"}

    # Ambiguous territory
    if cost_position >= 4 and differentiation >= 4:
        return {"strategy": "Ambiguous — Dual Advantage",
                "rationale": "Strong on both cost and differentiation — rare but possible (e.g., Toyota in the 1980s). Verify this is sustainable and not self-deception."}

    if cost_position >= 3 and differentiation >= 3:
        return {"strategy": "Ambiguous — Weak Position",
                "rationale": "Moderate on both dimensions; not clearly one strategy. Risk of being 'Stuck in the Middle' per Porter's warning (Ch.2, pp.41-44). Recommend moving decisively toward one pole."}

    if cost_position <= 2 and differentiation <= 2:
        return {"strategy": "Stuck in the Middle",
                "rationale": "Neither low-cost nor differentiated. Porter (Ch.2, p.41): 'The firm stuck in the middle is almost guaranteed low profitability. It loses the high-volume customers who demand low prices, or must bid away its profits to get business from the low-cost firms. It also loses high-margin business to firms who have achieved differentiation.' THIS IS THE WORST STRATEGIC POSITION."}

    # Default moderate
    return {"strategy": "Unclear — needs refinement",
            "rationale": f"Cost={cost_position}, Diff={differentiation}, Scope={scope}. No clear advantage on either dimension."}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — COMPETITOR ANALYSIS
# Source: Porter, Ch.3 ("A Framework for Competitor Analysis")
# ═══════════════════════════════════════════════════════════════════

def competitor_profile(
    current_strategy: Dict[str, str],
    future_goals: str,
    assumptions: str,
    capabilities: Dict[str, int],
    response_profile: str,
) -> Dict:
    """
    Competitor Analysis Framework.
    Ch.3, pp.47-74

    Porter's four diagnostic components:
      1. Future Goals — what drives the competitor
      2. Assumptions — what the competitor believes about itself and the industry
      3. Current Strategy — how the competitor is currently competing
      4. Capabilities — the competitor's strengths and weaknesses

    Args:
      current_strategy: Dict with 'name' and 'strategy_type' keys
      future_goals:     Text describing what the competitor is trying to achieve
      assumptions:      Text describing the competitor's apparent beliefs
      capabilities:     Dict of capability_name → score (1–5) for:
                          'cost_efficiency', 'innovation', 'marketing',
                          'distribution', 'financial_strength', 'organizational'
      response_profile: Predicted response: 'aggressive', 'selective',
                        'defensive', 'unpredictable'

    Returns a structured profile dict for comparison across competitors.

    Edge cases:
      - Any capability score outside 1–5 → ValueError
      - Unknown response_profile value → allowed but flagged
    """
    if not isinstance(current_strategy, dict):
        raise TypeError("current_strategy must be a dict")
    if "strategy_type" not in current_strategy:
        raise ValueError("current_strategy must have 'strategy_type' key")

    required_caps = ['cost_efficiency', 'innovation', 'marketing',
                     'distribution', 'financial_strength', 'organizational']
    for cap in required_caps:
        if cap not in capabilities:
            raise ValueError(f"capabilities missing required key: '{cap}'")
        val = capabilities[cap]
        if not isinstance(val, int) or val < 1 or val > 5:
            raise ValueError(f"capabilities['{cap}'] must be 1–5, got {val}")

    response_types = {'aggressive', 'selective', 'defensive', 'unpredictable'}
    profile_flag = ""
    if response_profile.lower() not in response_types:
        profile_flag = f" (unusual: '{response_profile}' — expected one of {response_types})"

    cap_avg = sum(capabilities.values()) / len(capabilities)

    return {
        "current_strategy": current_strategy,
        "future_goals": future_goals,
        "assumptions": assumptions,
        "capabilities": capabilities,
        "average_capability": round(cap_avg, 2),
        "response_profile": response_profile + profile_flag,
    }


def competitor_ranking(
    profiles: List[Dict],
) -> List[Dict]:
    """
    Rank competitors by average capability score.
    Ch.3, pp.69-74

    Returns profiles sorted by average_capability, descending.
    Adds 'rank' key to each.
    """
    if not profiles:
        raise ValueError("profiles must be non-empty")

    for p in profiles:
        if "average_capability" not in p:
            raise ValueError("Each profile must have 'average_capability' — run competitor_profile() first")

    ranked = sorted(profiles, key=lambda p: p["average_capability"], reverse=True)
    for i, p in enumerate(ranked, 1):
        p["rank"] = i
    return ranked


# ═══════════════════════════════════════════════════════════════════
# PART 4 — INDUSTRY STRUCTURE & STRATEGIC GROUPS
# Source: Porter, Ch.7 ("Structural Analysis Within Industries")
# ═══════════════════════════════════════════════════════════════════

def industry_attractiveness(
    entry_threat: float,
    supplier_power_val: float,
    buyer_power_val: float,
    substitute_threat_val: float,
    rivalry: float,
    growth_rate: Optional[float] = None,
    govt_attitude: int = 3,
) -> Dict:
    """
    Composite industry attractiveness score.
    Ch.1 & Ch.7

    Combines the five forces with optional macro factors.

    Args:
      Five force scores (1–5, 1=best for incumbent, 5=worst)
      growth_rate: Annual industry growth rate (decimal, e.g., 0.05=5%).
                   Higher growth improves attractiveness.
      govt_attitude: 1–5 (1=hostile regulation, 5=benign/supportive)

    Returns dict with composite score and assessment.
    """
    forces = [entry_threat, supplier_power_val, buyer_power_val,
              substitute_threat_val, rivalry]
    for name, val in zip(
        ["entry_threat", "supplier_power", "buyer_power",
         "substitute_threat", "rivalry"], forces):
        if val < 0.5 or val > 5.5:
            raise ValueError(f"{name} must be roughly 1–5, got {val}")

    if not isinstance(govt_attitude, int) or govt_attitude < 1 or govt_attitude > 5:
        raise ValueError(f"govt_attitude must be 1–5, got {govt_attitude}")

    force_avg = sum(forces) / len(forces)

    # Incorporate growth and government
    # Normalize: invert the force score (lower force pressure = more attractive)
    # and bonus for growth and benign regulation
    structural_score = (6.0 - force_avg)  # 1 (poor) to 5 (excellent)
    if growth_rate is not None:
        _validate_finite(growth_rate, "growth_rate")
        # Growth bonus: +0.5 for every 10% growth, capped at +2.0
        growth_bonus = min(2.0, max(-1.0, growth_rate * 5.0))
        structural_score += growth_bonus

    govt_bonus = (govt_attitude - 3) * 0.3  # -0.6 to +0.6
    structural_score += govt_bonus

    structural_score = max(1.0, min(10.0, structural_score))

    if structural_score >= 7.0:
        verdict = "HIGHLY ATTRACTIVE — strong structural position, high profit potential"
    elif structural_score >= 5.0:
        verdict = "ATTRACTIVE — decent structure, reasonable returns likely"
    elif structural_score >= 3.5:
        verdict = "AVERAGE — typical industry, mixed forces, average returns"
    elif structural_score >= 2.0:
        verdict = "UNATTRACTIVE — weak structure, profits will be difficult"
    else:
        verdict = "HOSTILE — avoid unless you have a genuine structural advantage"

    return {
        "five_forces_average": round(force_avg, 2),
        "growth_rate": growth_rate,
        "govt_attitude": govt_attitude,
        "composite_score": round(structural_score, 2),
        "verdict": verdict,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — STRATEGIC GROUP MAPPING
# Source: Porter, Ch.7 ("Structural Analysis Within Industries")
# ═══════════════════════════════════════════════════════════════════

def strategic_group_distance(
    firm_a: Tuple[float, float],
    firm_b: Tuple[float, float],
) -> float:
    """
    Euclidean distance between two firms in 2D strategic space.
    Ch.7, pp.129-132

    Typical axes: price/quality, breadth of product line, degree of
    vertical integration, geographic scope.

    Returns the distance — smaller = closer competitors.
    """
    _validate_finite(firm_a[0], "firm_a[0]")
    _validate_finite(firm_a[1], "firm_a[1]")
    _validate_finite(firm_b[0], "firm_b[0]")
    _validate_finite(firm_b[1], "firm_b[1]")
    return math.sqrt((firm_a[0] - firm_b[0]) ** 2 + (firm_a[1] - firm_b[1]) ** 2)


def strategic_group_membership(
    firm_position: Tuple[float, float],
    groups: Dict[str, Tuple[float, float]],
) -> Dict[str, float]:
    """
    Identify closest strategic group for a given firm.
    Ch.7, pp.132-138

    Args:
      firm_position: (x, y) coordinates of the firm
      groups:        Dict of group_name → (x_center, y_center)

    Returns dict of group_name → distance, sorted by distance ascending.
    """
    if not groups:
        raise ValueError("groups must be non-empty")

    distances = {}
    for name, center in groups.items():
        distances[name] = strategic_group_distance(firm_position, center)

    return dict(sorted(distances.items(), key=lambda item: item[1]))


def mobility_barriers(
    groups: Dict[str, Tuple[float, float]],
    barriers: Dict[Tuple[str, str], int],
) -> Dict[str, Dict[str, int]]:
    """
    Mobility barrier assessment between strategic groups.
    Ch.7, pp.133-136

    Mobility barriers are the factors that prevent firms from moving
    between strategic groups — the group-level equivalent of entry barriers.

    Args:
      groups:   Dict of group_name → (x_center, y_center)
      barriers: Dict of (from_group, to_group) → barrier_score (1–5)
                5 = insurmountable, 1 = trivial

    Returns dict mapping (from→to) to barrier info.

    Edge cases:
      - Missing barrier pair → defaults to 3 (assume moderate)
      - Scores outside 1–5 → ValueError
    """
    result = {}
    group_names = list(groups.keys())

    for from_g in group_names:
        result[from_g] = {}
        for to_g in group_names:
            if from_g == to_g:
                continue
            key = (from_g, to_g)
            if key in barriers:
                score = barriers[key]
                if not isinstance(score, int) or score < 1 or score > 5:
                    raise ValueError(
                        f"barrier[{key}] must be 1–5, got {score}"
                    )
                result[from_g][to_g] = score
            else:
                result[from_g][to_g] = 3  # default: moderate

    return result


# ═══════════════════════════════════════════════════════════════════
# PART 6 — THE PORTER STRATEGIC VIABILITY CHECK
# Source: Porter, Ch.1-2 — synthesis of criteria used throughout
# ═══════════════════════════════════════════════════════════════════

def strategic_viability_check(
    can_you_achieve_low_cost: bool,
    can_you_differentiate: bool,
    is_scope_clear: bool,
    are_barriers_durable: bool,
    can_you_defend_against_rivals: bool,
    can_you_resist_supplier_buyer_pressure: bool,
    can_you_block_substitutes: bool,
) -> Dict:
    """
    Seven-question strategic viability test.
    Derived from Porter's framework across Ch.1-2.

    Each question is True/False based on evidence.

    Returns:
      'pass_count': Number of questions passed (out of 7)
      'verdict':
        7/7 = STRONG — clear strategic position
        5-6/7 = ADEQUATE — viable but has weaknesses
        3-4/7 = WEAK — significant gaps, reconsider
        0-2/7 = NON-VIABLE — fundamental strategic failure

      'weaknesses': list of failed questions
    """
    questions = {
        "Can you achieve and sustain a cost advantage?": can_you_achieve_low_cost,
        "Can you achieve differentiation customers will pay for?": can_you_differentiate,
        "Is your competitive scope (broad/narrow) clearly chosen?": is_scope_clear,
        "Are your competitive advantages durable (barriers sustainable)?": are_barriers_durable,
        "Can you defend against existing rivals?": can_you_defend_against_rivals,
        "Can you resist supplier and buyer bargaining power?": can_you_resist_supplier_buyer_pressure,
        "Can you defend against or preempt substitutes?": can_you_block_substitutes,
    }

    for q, ans in questions.items():
        if not isinstance(ans, bool):
            raise TypeError(f"'{q[:40]}...' must be bool, got {type(ans).__name__}")

    passes = sum(1 for v in questions.values() if v)
    weaknesses = [q for q, v in questions.items() if not v]

    if passes >= 7:
        verdict = "STRONG — clear, defensible strategic position"
    elif passes >= 5:
        verdict = "ADEQUATE — viable strategy with some gaps to address"
    elif passes >= 3:
        verdict = "WEAK — significant gaps; strategy needs fundamental rethinking"
    else:
        verdict = "NON-VIABLE — the venture lacks any sustainable strategic position"

    return {
        "pass_count": passes,
        "total_questions": 7,
        "verdict": verdict,
        "weaknesses": weaknesses,
    }


# ═══════════════════════════════════════════════════════════════════
# INTERNAL HELPERS
# ═══════════════════════════════════════════════════════════════════

def _validate_finite(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val):
        raise ValueError(f"{name} is NaN")
    if math.isinf(val):
        raise ValueError(f"{name} is infinite")


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

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
    print("SELF-TEST SUITE: competitive_strategy.py")
    print("Source: Porter, Competitive Strategy (1980, Free Press)")
    print("=" * 70)

    # ── Part 1: Five Forces ──
    print("\n── Part 1: Five Forces Analysis (Ch.1) ──")

    # ── Soft Drinks Industry (classic Porter example): very attractive ──
    # Entry: brand loyalty (5), distribution (5), scale (4), switching (2),
    #        capital (4), cost advantage (4), govt (2) → avg ≈ 3.71
    avg_entry, breakdown_entry = threat_of_entry(5, 5, 4, 2, 5, 4, 2)
    check("entry: soft drinks average", avg_entry, 3.86, tol=0.1)
    check("entry: 7 barriers returned", len(breakdown_entry), 7)
    check("entry: label for 3.86", entry_threat_label(avg_entry),
          "MODERATE — some barriers exist, not impregnable")

    # Supplier: concentrate makers have leverage over bottlers
    # concentration(4), switching(3), substitutes(1), importance(4), fwd_int(3)
    avg_supp, breakdown_supp = supplier_power(4, 3, 1, 4, 3)
    check("supplier: conc makers vs bottlers", avg_supp, 3.0)

    # Buyer: bottlers concentrated, but end consumers fragmented
    avg_buyer, _ = buyer_power(3, 4, 2, 2, 3, 3)
    check("buyer: fragmented with some concentration", avg_buyer, 2.83, tol=0.1)

    # Substitutes: water, juice, tea — moderate threat
    avg_sub, _ = threat_of_substitutes(3, 2, 3)
    check("sub: beverages broadly", avg_sub, 2.67, tol=0.1)

    # Rivalry: Coke vs Pepsi — intense but stable (duopoly)
    # competitors(2 — few but large), growth(2 — mature), fixed(3),
    # diff(4 — strong brands), exit(2), diversity(2)
    avg_riv, _ = competitive_rivalry(2, 2, 3, 4, 2, 2)
    check("rivalry: cola wars", avg_riv, 2.5, tol=0.1)

    # Full summary
    summary = five_forces_summary(
        entry_barriers=int(round(avg_entry)),
        supplier_leverage=int(round(avg_supp)),
        buyer_leverage=int(round(avg_buyer)),
        substitute_threat=int(round(avg_sub)),
        rivalry_intensity=int(round(avg_riv)),
    )
    check("summary: soft drinks category", "ATTRACTIVE" in summary["verdict"] or "MODERATE" in summary["verdict"], True)

    # ── Airlines Industry (classic unattractive example) ──
    # Entry: low barriers (leased planes, no switching costs for customers)
    avg_air_entry, _ = threat_of_entry(2, 2, 2, 1, 2, 2, 3)
    # Supplier: Boeing/Airbus duopoly + unions → HIGH power
    avg_air_supp, _ = supplier_power(5, 5, 1, 5, 3)
    # Buyer: online comparison → HIGH power
    avg_air_buyer, _ = buyer_power(5, 5, 5, 4, 5, 5)
    # Substitutes: trains, cars, Zoom
    avg_air_sub, _ = threat_of_substitutes(4, 4, 4)
    # Rivalry: brutal price competition
    avg_air_riv, _ = competitive_rivalry(4, 2, 5, 1, 5, 3)
    air_summary = five_forces_summary(
        int(round(avg_air_entry)), int(round(avg_air_supp)),
        int(round(avg_air_buyer)), int(round(avg_air_sub)),
        int(round(avg_air_riv)),
    )
    check("summary: airlines — should be unattractive or hostile",
          "UNFAVORABLE" in air_summary["verdict"] or "HOSTILE" in air_summary["verdict"], True)

    # ── Pharma (patented) ──
    avg_ph_entry, _ = threat_of_entry(5, 5, 5, 5, 4, 5, 5)
    avg_ph_supp, _ = supplier_power(1, 1, 1, 1, 1)
    avg_ph_buyer, _ = buyer_power(2, 2, 5, 1, 2, 1)
    avg_ph_sub, _ = threat_of_substitutes(2, 5, 1)
    avg_ph_riv, _ = competitive_rivalry(2, 3, 3, 5, 2, 2)
    ph_summary = five_forces_summary(
        int(round(avg_ph_entry)), int(round(avg_ph_supp)),
        int(round(avg_ph_buyer)), int(round(avg_ph_sub)),
        int(round(avg_ph_riv)),
    )
    check("summary: pharma — should be moderate",
          "MODERATE" in ph_summary["verdict"], True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("entry: score out of range", threat_of_entry, 6, 3, 3, 3, 3, 3, 3)
    check_raises("entry: score 0", threat_of_entry, 0, 3, 3, 3, 3, 3, 3)
    check_raises("five_forces: score out of range", five_forces_summary, 6, 3, 3, 3, 3)

    # ── Part 2: Generic Strategies ──
    print("\n── Part 2: Generic Competitive Strategies (Ch.2) ──")

    # Walmart: cost leadership (cost=5, diff=2, broad)
    wm = classify_strategy(5, 2, "broad")
    check("strategy: Walmart = Cost Leadership", wm["strategy"], "Cost Leadership")

    # Ferrari: differentiation focus (cost=2, diff=5, narrow)
    fe = classify_strategy(2, 5, "narrow")
    check("strategy: Ferrari = Differentiation Focus", fe["strategy"], "Differentiation Focus")

    # Apple: differentiation (cost=3, diff=5, broad)
    ap = classify_strategy(3, 5, "broad")
    check("strategy: Apple = Ambiguous Weak Position", "Ambiguous" in ap["strategy"], True)

    # Generic middle-ground firm → "Stuck in the Middle"
    st = classify_strategy(2, 2, "broad")
    check("strategy: no advantage = Stuck in the Middle", st["strategy"], "Stuck in the Middle")

    # Ambiguous: moderate both
    amb = classify_strategy(3, 3, "broad")
    check("strategy: moderate both = Ambiguous Weak", "Ambiguous" in amb["strategy"], True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("classify: bad scope", classify_strategy, 3, 3, "global")
    check_raises("classify: score out of range", classify_strategy, 0, 3, "broad")

    # ── Part 3: Competitor Analysis ──
    print("\n── Part 3: Competitor Analysis (Ch.3) ──")

    competitor_a = {
        "name": "Competitor A",
        "strategy_type": "Cost Leadership",
    }
    caps_a = {
        "cost_efficiency": 5, "innovation": 2, "marketing": 3,
        "distribution": 4, "financial_strength": 4, "organizational": 3,
    }
    profile_a = competitor_profile(
        competitor_a, "Become the lowest-cost producer in the industry",
        "Believes scale is the only durable advantage",
        caps_a,
        "aggressive",
    )
    check("competitor_profile: avg capability", profile_a["average_capability"], 3.5)
    check("competitor_profile: response = aggressive",
          "aggressive" in profile_a["response_profile"].lower(), True)

    # Ranking
    competitor_b = {
        "name": "Competitor B",
        "strategy_type": "Differentiation",
    }
    caps_b = {
        "cost_efficiency": 2, "innovation": 5, "marketing": 5,
        "distribution": 3, "financial_strength": 3, "organizational": 4,
    }
    profile_b = competitor_profile(
        competitor_b, "Lead the market in product innovation",
        "Believes customers will pay premium for quality",
        caps_b,
        "selective",
    )

    ranked = competitor_ranking([profile_a, profile_b])
    # B has avg (2+5+5+3+3+4)/6 = 22/6 = 3.67, A has 3.5 → B ranks first
    check("ranking: #1 should be B (higher capability)", ranked[0]["current_strategy"]["name"], "Competitor B")
    check("ranking: #2 should be A", ranked[1]["current_strategy"]["name"], "Competitor A")

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("competitor_profile: missing capability",
                 competitor_profile, competitor_a, "goal", "assumption",
                 {"cost_efficiency": 3}, "aggressive")
    check_raises("competitor_profile: capability out of range",
                 competitor_profile, competitor_a, "goal", "assumption",
                 {"cost_efficiency": 3, "innovation": 3, "marketing": 3,
                  "distribution": 3, "financial_strength": 9, "organizational": 3},
                 "aggressive")

    # ── Part 4: Industry Attractiveness ──
    print("\n── Part 4: Industry Attractiveness (Ch.7) ──")

    # Attractive industry: low forces, high growth, benign govt
    attract = industry_attractiveness(1.5, 1.5, 1.5, 1.5, 1.5, growth_rate=0.15, govt_attitude=5)
    check("attractiveness: hot industry score ≈ 5.85", attract["composite_score"], 5.85, tol=0.01)

    # Unattractive: high forces, no growth, hostile govt
    unattract = industry_attractiveness(4.5, 4.5, 4.5, 4.5, 4.5, growth_rate=-0.05, govt_attitude=1)
    check("attractiveness: hostile industry score < 3", unattract["composite_score"] < 3.0, True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("attractiveness: bad force score",
                 industry_attractiveness, 10.0, 3.0, 3.0, 3.0, 3.0)

    # ── Part 5: Strategic Groups ──
    print("\n── Part 5: Strategic Group Mapping (Ch.7) ──")

    # 2D map: (price/quality, breadth)
    groups = {
        "Premium Broad": (8.0, 8.0),
        "Premium Niche": (8.0, 2.0),
        "Value Broad": (3.0, 8.0),
        "Value Niche": (3.0, 2.0),
        "Budget": (1.0, 6.0),
    }

    # A new entrant at (5.0, 7.0) — closest to Value Broad?
    firm = (5.0, 7.0)
    distances = strategic_group_membership(firm, groups)
    closest = next(iter(distances))
    check("strategic_group: closest to firm at (5,7)", closest == "Value Broad", True)

    # Distance between two groups
    d = strategic_group_distance((8.0, 8.0), (3.0, 2.0))
    # sqrt((8-3)² + (8-2)²) = sqrt(25+36) = sqrt(61) = 7.81
    check("distance: Premium Broad to Value Niche", d, 7.81, tol=0.01)

    # Mobility barriers
    barriers = {
        ("Value Broad", "Premium Broad"): 4,
        ("Budget", "Value Broad"): 3,
    }
    mb = mobility_barriers(groups, barriers)
    check("mobility: Value Broad → Premium Broad = 4",
          mb["Value Broad"]["Premium Broad"], 4)
    check("mobility: default barrier = 3",
          mb["Premium Broad"]["Value Broad"], 3)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("strategic_group: empty groups", strategic_group_membership, firm, {})
    check_raises("mobility_barriers: bad score",
                 mobility_barriers, groups, {("Value Broad", "Premium Broad"): 6})

    # ── Part 6: Strategic Viability ──
    print("\n── Part 6: Strategic Viability Check (Ch.1-2) ──")

    # Strong: all true
    strong = strategic_viability_check(True, True, True, True, True, True, True)
    check("viability: 7/7 = STRONG", strong["pass_count"], 7)
    check("viability: STRONG label", "STRONG" in strong["verdict"], True)
    check("viability: no weaknesses", len(strong["weaknesses"]), 0)

    # Weak: only differentiation and scope clear
    weak = strategic_viability_check(False, True, True, False, False, False, False)
    check("viability: 2/7 = NON-VIABLE", weak["pass_count"], 2)
    check("viability: NON-VIABLE label", "NON-VIABLE" in weak["verdict"], True)
    check("viability: 5 weaknesses", len(weak["weaknesses"]), 5)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("viability: non-bool input", strategic_viability_check,
                 "yes", True, True, True, True, True, True)

    # ── Integration Test: Full Industry Analysis ──
    print("\n── Integration Test: Soft Drinks vs Airlines ──")

    # Soft drinks
    sd_entry, _ = threat_of_entry(5, 5, 4, 2, 5, 4, 2)
    sd_supp, _ = supplier_power(4, 3, 1, 4, 3)
    sd_buyer, _ = buyer_power(3, 4, 2, 2, 3, 3)
    sd_sub, _ = threat_of_substitutes(3, 2, 3)
    sd_riv, _ = competitive_rivalry(2, 2, 3, 4, 2, 2)
    sd = five_forces_summary(int(round(sd_entry)), int(round(sd_supp)),
                              int(round(sd_buyer)), int(round(sd_sub)),
                              int(round(sd_riv)))
    sd_attr = industry_attractiveness(sd_entry, sd_supp, sd_buyer,
                                       sd_sub, sd_riv, growth_rate=0.03, govt_attitude=3)

    # Airlines
    al_entry, _ = threat_of_entry(2, 2, 2, 1, 2, 2, 3)
    al_supp, _ = supplier_power(5, 5, 1, 5, 3)
    al_buyer, _ = buyer_power(5, 5, 5, 4, 5, 5)
    al_sub, _ = threat_of_substitutes(4, 4, 4)
    al_riv, _ = competitive_rivalry(4, 2, 5, 1, 5, 3)
    al = five_forces_summary(int(round(al_entry)), int(round(al_supp)),
                              int(round(al_buyer)), int(round(al_sub)),
                              int(round(al_riv)))
    al_attr = industry_attractiveness(al_entry, al_supp, al_buyer,
                                       al_sub, al_riv, growth_rate=0.02, govt_attitude=4)

    check("integration: soft drinks > airlines attractiveness",
          sd_attr["composite_score"] > al_attr["composite_score"], True)

    # Strategy classification based on the numbers
    sd_strategy = classify_strategy(cost_position=3, differentiation=5, scope="broad")
    check("integration: soft drinks → ambiguous position", "Ambiguous" in sd_strategy["strategy"], True)

    al_strategy = classify_strategy(cost_position=5, differentiation=1, scope="broad")
    check("integration: airlines → cost leadership", al_strategy["strategy"], "Cost Leadership")

    # ── Summary ──
    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    sys.exit(run_all_tests())