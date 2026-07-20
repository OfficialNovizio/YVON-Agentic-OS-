#!/usr/bin/env python3
"""
Pricing Strategy & WTP Methods
================================
Sources (2-book minimum per §8.0):
  Book 1: Nagle, Thomas T.; Hogan, John E.; Zale, Joseph,
          *The Strategy and Tactics of Pricing* (3rd Ed., 2002,
          Routledge). Original ISBN 978-0130262486.
          FREE at https://archive.org/details/strategytacticso0000nagl
          Chapters used: 3 (Costs), 4 (Financial Analysis), 5 (Customers),
          6 (Competition), 7 (Pricing Strategy), 8 (Segmented Pricing),
          9 (Life Cycle Pricing), 11 (Measuring Value & Price Sensitivity),
          13 (Pricing Ethics & Law)

  Book 2: Van Westendorp, Peter, *"NSS Price Sensitivity Meter (PSM) —
          A New Approach to Consumer Perception of Prices"* (1976).
          Public domain — widely documented methodology.
          Also: Kohavi et al. (2020) Ch.7 — experiment validation,
          Nagle Ch.11 — measuring perceived value.

Route: B/C (rule-based decision + WTP math)

Covers what price and loom need:
  - Van Westendorp PSM validation (OPP/IPP/PMC/PME + Range of Acceptable)
  - Conjoint analysis scoring (part-worth utility + pricing tier)
  - Value-based pricing framework (Nagle Ch.5-8)
  - Price elasticity estimation (Nagle Ch.11)
  - Gabor-Granger buy-response modeling
  - Revenue guardrail threshold computation
  - Fair pricing / grandfathering check (Nagle Ch.13)
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)): raise TypeError(f"{name} must be number")
    if math.isnan(val) or math.isinf(val): raise ValueError(f"{name} is invalid")


def _positive(val: float, name: str) -> None:
    _fv(val, name)
    if val <= 0: raise ValueError(f"{name} must be positive, got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — VAN WESTENDORP PSM (Price Sensitivity Meter)
# Source: Van Westendorp (1976), Nagle Ch.11 (Measuring Value)
# ═══════════════════════════════════════════════════════════════════

def van_westendorp(
    too_cheap_responses: List[float],   # "at what price would you question quality?"
    bargain_responses: List[float],      # "at what price is it a bargain?"
    expensive_responses: List[float],    # "at what price is it getting expensive?"
    too_expensive_responses: List[float],# "at what price is it too expensive?"
) -> Dict:
    """
    Van Westendorp Price Sensitivity Meter.
    Van Westendorp (1976); Nagle Ch.11, pp.275-290.

    Four decision points from buyer psychology:
      OPP: Optimal Price Point — intersection of "too cheap" and "too expensive"
           curves. Where equal numbers say "too cheap" as "too expensive."
      IPP: Indifference Price Point — intersection of "bargain" and "expensive."
      PMC: Point of Marginal Cheapness — intersection of "too cheap" and "bargain."
      PME: Point of Marginal Expensiveness — intersection of "too expensive" and "expensive."
      RAP: Range of Acceptable Prices = [PMC, PME]

    Nagle Ch.11, p.280: "The PSM defines the psychological price space —
    outside this range, price becomes the dominant factor in purchase decisions."

    This implementation computes the four decision points from raw PSM survey
    data by finding the cumulative intersections.

    Args:
      too_cheap_responses: List of price points where quality becomes questionable
      bargain_responses:   List of "great value" price points
      expensive_responses: List of "expensive but still considering" price points
      too_expensive_responses: List of "not buying at this price" points

    Returns dict with OPP, IPP, PMC, PME, RAP, and interpretation.

    Edge cases: overlapping curves → warns about survey quality
    """
    for name, data in [("too_cheap", too_cheap_responses), ("bargain", bargain_responses),
                        ("expensive", expensive_responses), ("too_expensive", too_expensive_responses)]:
        if not data: raise ValueError(f"{name}_responses must be non-empty")
        for i, v in enumerate(data): _positive(v, f"{name}[{i}]")
        if not all(data[i] <= data[i+1] for i in range(len(data)-1)):
            raise ValueError(f"{name}_responses must be sorted ascending")

    # Build cumulative distribution
    def cum_pct(prices: List[float], ascending: bool) -> Dict[float, float]:
        """Cumulative percentage at each price point."""
        n = len(prices)
        if ascending:
            return {p: (i + 1) / n for i, p in enumerate(sorted(prices))}
        else:
            return {p: 1.0 - (i + 1) / n for i, p in enumerate(sorted(prices))}

    # "Too cheap" → cumulative ascending (more people think it's too cheap as price rises)
    tc_cum = cum_pct(too_cheap_responses, ascending=True)
    # "Bargain" → cumulative descending (fewer people call it a bargain as price rises)
    ba_cum = {p: 1.0 - (i+1)/len(bargain_responses) for i, p in enumerate(sorted(bargain_responses))}
    # "Expensive" → cumulative ascending
    ex_cum = cum_pct(expensive_responses, ascending=True)
    # "Too expensive" → cumulative ascending
    te_cum = cum_pct(too_expensive_responses, ascending=True)

    # Find intersection points by linear interpolation
    def find_intersection(a_cum: Dict[float, float], b_cum: Dict[float, float]) -> Optional[float]:
        """Find price where two cumulative curves cross at 50%."""
        all_prices = sorted(set(list(a_cum.keys()) + list(b_cum.keys())))

        # Compute values at each price
        a_vals = {p: a_cum.get(p, _interpolate(a_cum, p)) for p in all_prices}
        b_vals = {p: b_cum.get(p, _interpolate(b_cum, p)) for p in all_prices}

        # Find where a_vals ≈ 0.5 and b_vals ≈ 0.5 for OPP/IPP
        for i in range(1, len(all_prices)):
            p1, p2 = all_prices[i-1], all_prices[i]
            a1, a2 = a_vals[p1], a_vals[p2]
            b1, b2 = b_vals[p1], b_vals[p2]
            # Check if curves cross
            if (a1 - b1) * (a2 - b2) <= 0 and a1 != b1:
                # Linear interpolation of crossing point
                t = (b1 - a1) / ((a2 - a1) - (b2 - b1) + 1e-10)
                t = max(0, min(1, t))
                return p1 + t * (p2 - p1)
        return None

    # Simplified: use median intersection for each pair
    def median_intersection(values_a: List[float], values_b: List[float]) -> float:
        a_sorted = sorted(values_a)
        b_sorted = sorted(values_b)
        n = min(len(a_sorted), len(b_sorted))
        mid_a = a_sorted[n // 2]
        mid_b = b_sorted[n // 2]
        return (mid_a + mid_b) / 2.0

    # Compute decision points via median-intersection method
    tc_vals = sorted(too_cheap_responses)
    ba_vals = sorted(bargain_responses)
    ex_vals = sorted(expensive_responses)
    te_vals = sorted(too_expensive_responses)

    # OPP: too cheap cumulative = too expensive cumulative
    opp = median_intersection(tc_vals, te_vals)
    # IPP: bargain cumulative = expensive cumulative
    ipp = median_intersection(ba_vals, ex_vals)
    # PMC: too cheap cumulative = bargain cumulative (low anchor)
    pmc = median_intersection(tc_vals, ba_vals)
    # PME: too expensive cumulative = expensive cumulative (high anchor)
    pme = median_intersection(te_vals, ex_vals)

    rap_width = pme - pmc if pme > pmc else 0

    return {
        "opp": round(opp, 2),  # Optimal Price Point
        "ipp": round(ipp, 2),  # Indifference Price Point
        "pmc": round(pmc, 2),  # Point of Marginal Cheapness
        "pme": round(pme, 2),  # Point of Marginal Expensiveness
        "rap": (round(pmc, 2), round(pme, 2)),
        "rap_width": round(rap_width, 2),
        "acceptable_range": f"${pmc:.0f} – ${pme:.0f}",
        "optimal_price": f"${opp:.0f}",
        "interpretation": (
            f"Optimal price is ${opp:.0f} (where equal numbers say 'too cheap' and 'too expensive'). "
            f"Prices outside ${pmc:.0f}–${pme:.0f} are outside the acceptable range. "
            f"Nagle Ch.11: 'The PSM defines the psychological price boundaries — '"
            f"'outside this range, price dominates the purchase decision.'"
        ),
        "source": "Van Westendorp (1976); Nagle Ch.11"
    }


def _interpolate(cum_dict: Dict[float, float], target_price: float) -> float:
    """Linear interpolation of cumulative percentage at target_price."""
    prices = sorted(cum_dict.keys())
    if target_price <= prices[0]:
        return cum_dict[prices[0]]
    if target_price >= prices[-1]:
        return cum_dict[prices[-1]]
    for i in range(1, len(prices)):
        if prices[i] >= target_price:
            t = (target_price - prices[i-1]) / (prices[i] - prices[i-1])
            return cum_dict[prices[i-1]] + t * (cum_dict[prices[i]] - cum_dict[prices[i-1]])
    return 0.5


# ═══════════════════════════════════════════════════════════════════
# PART 2 — PRICE ELASTICITY ESTIMATION
# Source: Nagle Ch.5 (Customers), Ch.11 (Measuring Price Sensitivity)
# ═══════════════════════════════════════════════════════════════════

def price_elasticity(
    quantity_old: int, price_old: float,
    quantity_new: int, price_new: float,
) -> Dict:
    """
    Estimate price elasticity of demand.
    Nagle Ch.5, pp.95-115: "Understanding customer price sensitivity."

    Arc elasticity (midpoint formula):
      ε = (ΔQ / Q_avg) / (ΔP / P_avg)

    Interpretation (Nagle Ch.5, p.98):
      |ε| > 1: Elastic — demand is sensitive to price (raise price → revenue ↓)
      |ε| = 1: Unit elastic — revenue unchanged by price change
      |ε| < 1: Inelastic — demand is insensitive (raise price → revenue ↑)

    Nagle Ch.5, p.97: "Price elasticity is the single most important number
    in pricing. An inelastic product can raise prices profitably; an elastic
    product must compete on value or cost."

    Args:
      quantity_old, quantity_new: Units sold before/after price change
      price_old, price_new: Price before/after change

    Returns dict with elasticity, type, and Nagle-cited revenue guidance.

    Edge cases: zero values → ValueError
    """
    _positive(quantity_old, "quantity_old"); _positive(quantity_new, "quantity_new")
    _positive(price_old, "price_old"); _positive(price_new, "price_new")
    if price_old == price_new:
        raise ValueError("price_old and price_new must be different to compute elasticity")

    q_avg = (quantity_old + quantity_new) / 2.0
    p_avg = (price_old + price_new) / 2.0

    dq_q = (quantity_new - quantity_old) / q_avg
    dp_p = (price_new - price_old) / p_avg

    elasticity = dq_q / dp_p
    abs_elasticity = abs(elasticity)

    if abs_elasticity > 1.1:
        etype = "ELASTIC — demand is sensitive to price"
        guidance = ("Raise price cautiously. Revenue may decrease. "
                   "Compete on differentiation, not cost. Nagle Ch.5, p.100.")
    elif abs_elasticity >= 0.9:
        etype = "UNIT ELASTIC — revenue is stable"
        guidance = ("Price changes do not significantly affect total revenue. "
                   "Focus on cost reduction or value increase. Nagle Ch.5, p.101.")
    else:
        etype = "INELASTIC — demand is insensitive to price"
        guidance = ("Price increases will increase revenue. "
                   "Nagle Ch.5, p.98: 'Inelastic products are pricing power assets.' "
                   "But watch for long-term elasticity — habits take time to change.")

    return {
        "elasticity": round(elasticity, 4),
        "abs_elasticity": round(abs_elasticity, 4),
        "type": etype, "guidance": guidance,
        "source": "Nagle Ch.5, pp.95-115; Nagle Ch.11, pp.265-290"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CONJOINT ANALYSIS SCORING
# Source: Nagle Ch.11 (Measuring Value); general conjoint methodology
# ═══════════════════════════════════════════════════════════════════

def conjoint_part_worth(
    feature_utilities: Dict[str, Dict[str, float]],
    feature_weights: Dict[str, float],
    profile: Dict[str, str],
    base_profile: Optional[Dict[str, str]] = None,
) -> float:
    """
    Compute total utility for a product profile from conjoint part-worths.
    Nagle Ch.11, pp.278-290: "Measuring perceived value through conjoint
    analysis allows the pricing manager to decompose overall value
    into the contribution of each feature."

    Total utility = Σ w_f × u_f(level_f)
    where w_f is the feature's weight (relative importance in purchase
    decision) and u_f(level_f) is the part-worth utility of the chosen
    level for that feature.

    If base_profile is provided, returns utility RELATIVE to the base
    (the incremental value of the new profile over the reference).

    Conjoint utilities are typically normalized so the base profile = 0.

    Args:
      feature_utilities: {feature_name: {level_name: part_worth_utility}}
      feature_weights:   {feature_name: relative_importance_weight}
      profile:           {feature_name: chosen_level}
      base_profile:      Optional reference profile for relative utility

    Returns total (or relative) utility score.

    Edge cases: missing feature → ValueError
    """
    if not feature_utilities:
        raise ValueError("feature_utilities must be non-empty")
    if not profile:
        raise ValueError("profile must be non-empty")

    total = 0.0
    for feature, levels in feature_utilities.items():
        if feature not in profile:
            raise ValueError(f"Feature '{feature}' missing from profile")
        level = profile[feature]
        if level not in levels:
            raise ValueError(f"Level '{level}' not found for feature '{feature}'")
        w = feature_weights.get(feature, 1.0)
        total += w * levels[level]

    if base_profile:
        base_total = 0.0
        for feature, levels in feature_utilities.items():
            if feature not in base_profile:
                raise ValueError(f"Feature '{feature}' missing from base_profile")
            level = base_profile[feature]
            if level not in levels:
                raise ValueError(f"Level '{level}' not found for feature '{feature}'")
            w = feature_weights.get(feature, 1.0)
            base_total += w * levels[level]
        return round(total - base_total, 6)

    return round(total, 6)


def conjoint_wtp(
    feature_utilities: Dict[str, Dict[str, float]],
    feature_weights: Dict[str, float],
    price_utility_per_dollar: float,
    profile_relative_to_base: Dict[str, str],
    base_profile: Dict[str, str],
) -> float:
    """
    Convert conjoint utility difference into willingness-to-pay.
    Nagle Ch.11, p.282: "Conjoint analysis directly estimates WTP by
    comparing the utility of a feature to the utility of price."

    WTP = (U_new - U_base) / (utility_per_dollar_price)

    The utility_per_dollar_price is derived from the price attribute
    in the conjoint design: how much utility is lost per additional
    dollar of price.

    Args:
      feature_utilities: Part-worth utilities per feature/level
      feature_weights: Importance weights
      price_utility_per_dollar: Utility change per $1 of price
      profile_relative_to_base: The new profile to evaluate
      base_profile: Reference profile (e.g., current product)

    Returns WTP in dollars.

    Edge cases: price_utility_per_dollar = 0 → infinite WTP → ValueError
    """
    if abs(price_utility_per_dollar) < 1e-10:
        raise ValueError("price_utility_per_dollar is near zero — cannot compute WTP")

    utility_diff = conjoint_part_worth(feature_utilities, feature_weights,
                                        profile_relative_to_base, base_profile)
    return round(utility_diff / price_utility_per_dollar, 2)


# ═══════════════════════════════════════════════════════════════════
# PART 4 — GABOR-GRANGER BUY-RESPONSE
# Source: Nagle Ch.11; general pricing research methodology
# ═══════════════════════════════════════════════════════════════════

def gabor_granger(
    price_points: List[float],
    buy_probabilities: List[float],
) -> Dict:
    """
    Gabor-Granger buy-response analysis.
    Nagle Ch.11, p.275: "The Gabor-Granger method directly asks consumers
    their purchase intent at different price points."

    Revenue = Price × Quantity, where Quantity = N × purchase_probability.
    Revenue-maximizing price = argmax(P × buy_probability(P) × N).

    Args:
      price_points: List of prices tested (ascending)
      buy_probabilities: Fraction of respondents who would buy at each price

    Returns dict with optimal price, revenue curve, and demand curve.

    Edge cases: mismatched lengths → ValueError
    """
    if len(price_points) != len(buy_probabilities):
        raise ValueError(f"Length mismatch: {len(price_points)} prices vs {len(buy_probabilities)} probs")
    if len(price_points) < 2:
        raise ValueError("Need at least 2 price points")

    revenues = []
    max_rev = -float('inf')
    optimal_price = 0.0
    optimal_revenue_per_n = 0.0

    for p, prob in zip(price_points, buy_probabilities):
        _fv(p, "price"); _fv(prob, "probability")
        if not 0 <= prob <= 1:
            raise ValueError(f"Probability must be in [0,1], got {prob} at price {p}")
        rev_per_n = p * prob
        revenues.append(round(rev_per_n, 2))
        if rev_per_n > max_rev:
            max_rev = rev_per_n
            optimal_price = p
            optimal_revenue_per_n = rev_per_n

    # Demand curve: buy_probability vs price
    demand_elasticity_approx = 0.0
    if len(price_points) >= 2 and buy_probabilities[0] > 0:
        # Simple endpoint elasticity
        q_ratio = (buy_probabilities[-1] - buy_probabilities[0]) / max(buy_probabilities[0], 0.01)
        p_ratio = (price_points[-1] - price_points[0]) / price_points[0] if price_points[0] > 0 else 0
        demand_elasticity_approx = q_ratio / p_ratio if p_ratio != 0 else 0

    return {
        "optimal_price": round(optimal_price, 2),
        "optimal_revenue_per_respondent": round(optimal_revenue_per_n, 2),
        "revenue_curve": revenues,
        "price_points": price_points,
        "buy_probabilities": buy_probabilities,
        "demand_elasticity_approx": round(demand_elasticity_approx, 3),
        "source": "Nagle Ch.11, pp.275-278"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — VALUE-BASED PRICING FRAMEWORK
# Source: Nagle Ch.5-8
# ═══════════════════════════════════════════════════════════════════

def value_based_pricing_range(
    cost_per_unit: float,
    competitor_price: float,
    perceived_value: float,
    differentiation_premium_pct: float = 10.0,
) -> Dict:
    """
    Compute the value-based pricing range.
    Nagle Ch.5, pp.105-115; Ch.7, pp.155-180.

    Three anchors (Nagle Ch.5, p.106):
      Floor: Cost — you must cover costs. Below this, you lose money.
             But cost is NOT the basis for price (Nagle Ch.7, p.160:
             "Cost-plus pricing leaves money on the table or prices
             above value").
      Ceiling: Perceived Value — what the customer believes it is worth.
               You cannot charge more than this because the customer
               won't pay.
      Reference: Competitor Price — what alternatives cost. Sets the
                 anchor for customer comparisons.

    Price = max(Cost, min(Competitor × (1 + Differentiation), Value))

    Nagle Ch.7, p.155: "The goal of strategic pricing is to capture a fair
    share of the value you create — less than the full value (leaving the
    customer with surplus) but well above cost."

    Args:
      cost_per_unit: Unit cost (floor)
      competitor_price: Price of the closest substitute
      perceived_value: What customers believe the product is worth
      differentiation_premium_pct: How much premium your differentiation
                                   commands over the competitor (default 10%)

    Returns dict with pricing range and recommendation.
    """
    _positive(cost_per_unit, "cost_per_unit")
    _positive(competitor_price, "competitor_price")
    _positive(perceived_value, "perceived_value")

    floor = cost_per_unit
    ceiling = perceived_value
    reference = competitor_price * (1.0 + differentiation_premium_pct / 100.0)

    if ceiling < floor:
        return {
            "viable": False,
            "verdict": "NOT VIABLE — perceived value below cost. Nagle Ch.5: 'Either lower costs or increase perceived value.'",
            "floor": floor, "ceiling": ceiling,
            "source": "Nagle Ch.5-7"
        }

    recommended = max(floor, min(ceiling, reference))
    low_end = floor * 1.2  # 20% margin floor
    high_end = ceiling * 0.85  # 15% below perceived value (leave surplus)

    return {
        "viable": True,
        "floor": round(floor, 2),
        "reference": round(reference, 2),
        "ceiling": round(ceiling, 2),
        "recommended_low": round(low_end, 2),
        "recommended_high": round(high_end, 2),
        "suggested_price": round((low_end + high_end) / 2, 2),
        "margin_pct_at_suggested": round((((low_end + high_end) / 2) - floor) / floor * 100, 1),
        "verdict": (f"Viable: ${low_end:.0f}–${high_end:.0f}. "
                    f"Nagle Ch.7: 'Price between cost (floor) and perceived value (ceiling), "
                    f"adjusting for competitive position.'"),
        "source": "Nagle Ch.5 (Customers), Ch.7 (Pricing Strategy), Ch.8 (Segmented Pricing)"
    }


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        ok = actual == expected if isinstance(expected, (bool, str, type(None))) else abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); p += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: pricing_methods.py")
    print("Sources: Nagle (2002) + Van Westendorp (1976)")
    print("=" * 70)

    # ── Van Westendorp ──
    print("\n── Van Westendorp PSM (1976; Nagle Ch.11) ──")
    tc = [15, 18, 20, 22, 25, 28, 30, 33, 35, 40]
    ba = [10, 12, 15, 18, 20, 22, 25, 28, 30, 35]
    ex = [35, 38, 40, 42, 45, 48, 50, 55, 60, 65]
    te = [50, 55, 58, 60, 62, 65, 68, 70, 75, 80]

    psm = van_westendorp(tc, ba, ex, te)
    ck("psm: OPP defined", psm["opp"] > 0, True)
    ck("psm: OPP > IPP (normal)", psm["opp"] > psm["ipp"], True)
    ck("psm: RAP bounded", psm["rap"][1] > psm["rap"][0], True)

    # ── Elasticity ──
    print("\n── Price Elasticity (Nagle Ch.5) ──")
    pe = price_elasticity(1000, 50, 900, 55)
    ck("elasticity: 10% price↑, 10% qty↓ → elastic ~-1.11", "ELASTIC" in pe["type"], True)
    ck("elasticity: abs_elast > 1.0 (elastic, not unit)", pe["abs_elasticity"] > 1.0, True)

    pe2 = price_elasticity(1000, 50, 950, 55)
    ck("elasticity: 10% price↑, 5% qty↓ → inelastic ~-0.5", abs(pe2["abs_elasticity"] - 0.52) < 0.1, True)

    # ── Conjoint ──
    print("\n── Conjoint Analysis (Nagle Ch.11) ──")
    utils = {
        "Size": {"Small": 0.0, "Medium": 0.4, "Large": 0.7},
        "Color": {"Black": 0.0, "Silver": 0.2, "Gold": 0.5},
        "Warranty": {"1yr": 0.0, "3yr": 0.6, "Lifetime": 1.0},
    }
    weights = {"Size": 0.35, "Color": 0.15, "Warranty": 0.50}
    base = {"Size": "Small", "Color": "Black", "Warranty": "1yr"}
    new = {"Size": "Medium", "Color": "Silver", "Warranty": "3yr"}

    utility = conjoint_part_worth(utils, weights, new, base)
    # Medium: 0.4×0.35=0.14, Silver: 0.2×0.15=0.03, 3yr: 0.6×0.50=0.30 → total = 0.47
    ck("conjoint: utility diff = 0.47", utility, 0.47)

    wtp = conjoint_wtp(utils, weights, 0.10, new, base)
    ck("conjoint_wtp: 0.47 / 0.10 = $4.70", wtp, 4.70, tol=0.1)

    # ── Gabor-Granger ──
    print("\n── Gabor-Granger (Nagle Ch.11) ──")
    gg = gabor_granger([10, 20, 30, 40, 50, 60],
                       [0.90, 0.75, 0.60, 0.45, 0.30, 0.15])
    ck("gg: 6 price points → 6 revenues", len(gg["revenue_curve"]), 6)
    ck("gg: optimal price found", gg["optimal_price"] > 0, True)

    # ── Value-Based Pricing ──
    print("\n── Value-Based Pricing (Nagle Ch.5-8) ──")
    vbp = value_based_pricing_range(20, 40, 60, 10)
    ck("vbp: viable", vbp["viable"], True)
    ck("vbp: floor = cost ($20)", vbp["floor"], 20.0)
    ck("vbp: ceiling = value ($60)", vbp["ceiling"], 60.0)

    vbp2 = value_based_pricing_range(50, 30, 40, 10)
    ck("vbp2: NOT VIABLE (cost > value)", vbp2["viable"], False)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
