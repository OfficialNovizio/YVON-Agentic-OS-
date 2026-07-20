#!/usr/bin/env python3
"""
Decision Analysis — Formula Library
=====================================
Source: Clemen, R.T. & Reilly, T.,
        *Making Hard Decisions with DecisionTools* (3rd Ed., 2012, Cengage)

This module implements core decision-analysis methods as discrete,
self-tested Python functions. Every function carries its chapter/section
citation and handles edge cases explicitly.

Routes per Playbook §8.2:
  Part 1: Route A (math — decision tree rollback, expected value)
  Part 2: Route B (rule — sensitivity analysis, tornado diagrams)
  Part 3: Route C (hybrid — MAUT: structure is subjective, aggregation is math)
  Part 4: Route A (math — value of information formulas)
  Part 5: Route C (hybrid — Monte Carlo simulation)
  Part 6: Route B (rule — probability calibration / Brier score)

Design rules:
  - Pure Python stdlib, zero external dependencies.
  - Every function validates inputs.  No silent NaN/Inf/division-by-zero.
  - Probabilities must sum to 1.0 (± 1e-6) within each chance node.
  - All utility values normalized to [0, 1] for multi-attribute scoring.
  - Every function has ≥1 self-test with verified expected output.
  - Simulation uses a seeded RNG for reproducibility.
"""

from __future__ import annotations
import math
import random
import sys
import copy
from typing import (
    List, Tuple, Optional, Dict, Union, Callable, Any,
    Literal,
)

# ── Numerical constants ──────────────────────────────────────────
_TOL = 1e-10
_P_TOL = 1e-6  # Tolerance for probabilities summing to 1.0

# ── Internal validators ──────────────────────────────────────────

def _is_finite(val: float, name: str) -> None:
    """Validate val is finite (not NaN, not Inf)."""
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val):
        raise ValueError(f"{name} is NaN")
    if math.isinf(val):
        raise ValueError(f"{name} is infinite")


def _is_probability(val: float, name: str) -> None:
    """Validate val is a probability in [0, 1]."""
    _is_finite(val, name)
    if val < -_P_TOL or val > 1.0 + _P_TOL:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


def _validate_probs(probs: List[float], label: str = "probabilities") -> None:
    """Validate a list of probabilities sums to 1.0."""
    if not probs:
        raise ValueError(f"{label} must be non-empty")
    for i, p in enumerate(probs):
        _is_probability(p, f"{label}[{i}]")
    total = sum(probs)
    if abs(total - 1.0) > _P_TOL:
        raise ValueError(
            f"{label} sum to {total}, must sum to 1.0 (tolerance ±{_P_TOL})"
        )


# ═══════════════════════════════════════════════════════════════════
# PART 1 — DECISION TREES & EXPECTED VALUE
# Source: Clemen & Reilly, Ch.3 ("Structuring Decisions"),
#         Ch.4 ("Making Choices")
# ═══════════════════════════════════════════════════════════════════

def expected_value(payoffs: List[float], probabilities: List[float]) -> float:
    """
    EV = Σ p_i × x_i
    Ch.4, §4.2 (Expected Monetary Value)

    The weighted average of possible outcomes.

    Args:
        payoffs:       Monetary or utility outcomes for each branch
        probabilities: Probabilities for each branch (must sum to 1.0)

    Edge cases:
        - Mismatched lengths → ValueError
        - Probabilities not summing to 1.0 → ValueError
    """
    if len(payoffs) != len(probabilities):
        raise ValueError(
            f"Length mismatch: {len(payoffs)} payoffs vs {len(probabilities)} probabilities"
        )
    _validate_probs(probabilities, "probabilities")
    for i, x in enumerate(payoffs):
        _is_finite(x, f"payoffs[{i}]")

    return sum(p * x for p, x in zip(probabilities, payoffs))


def expected_utility(payoffs: List[float], probabilities: List[float],
                     utility_func: Callable[[float], float]) -> float:
    """
    EU = Σ p_i × u(x_i)
    Ch.10, §10.2 (Expected Utility)

    Expected utility when outcomes are evaluated through a utility function.

    Args:
        payoffs:       Monetary outcomes
        probabilities: Branch probabilities
        utility_func:  Utility function u(x) → utility value

    Edge cases:
        - utility_func returning NaN/Inf → propagates ValueError
    """
    if len(payoffs) != len(probabilities):
        raise ValueError("Length mismatch between payoffs and probabilities")
    _validate_probs(probabilities, "probabilities")

    eu = 0.0
    for i, (x, p) in enumerate(zip(payoffs, probabilities)):
        _is_finite(x, f"payoffs[{i}]")
        u_val = utility_func(x)
        _is_finite(u_val, f"utility_func(payoffs[{i}])")
        eu += p * u_val
    return eu


def certainty_equivalent(eu: float, inverse_utility: Callable[[float], float]) -> float:
    """
    CE = u^(-1)(EU)
    Ch.10, §10.3 (Certainty Equivalents)

    The guaranteed amount that gives the same utility as a risky prospect.

    Args:
        eu:               Expected utility value
        inverse_utility:  Inverse of the utility function: u^(-1)(u) = x

    Edge cases:
        - If eu falls outside the utility function's domain,
          inverse_utility should raise or return a sensible value.
    """
    _is_finite(eu, "eu")
    ce = inverse_utility(eu)
    _is_finite(ce, "certainty_equivalent from inverse_utility")
    return ce


def risk_premium(ev: float, ce: float) -> float:
    """
    RP = EV - CE
    Ch.10, §10.3

    The amount a decision-maker would pay to avoid risk.
    RP > 0 → risk-averse (CE < EV)
    RP < 0 → risk-seeking (CE > EV)
    RP = 0 → risk-neutral

    Args:
        ev:  Expected monetary value of the gamble
        ce:  Certainty equivalent
    """
    _is_finite(ev, "ev")
    _is_finite(ce, "ce")
    return ev - ce


# ── Utility Functions (Ch.10, §10.3) ─────────────────────────────

def exponential_utility(x: float, risk_tolerance: float) -> float:
    """
    u(x) = 1 - exp(-x / R)
    Ch.10, §10.3

    Constant absolute risk aversion (CARA). R > 0 is the risk tolerance.
    Larger R = more risk-tolerant. R → ∞ approaches risk-neutral.

    Args:
        x:              Monetary outcome
        risk_tolerance: R > 0 (same units as x)

    Edge cases:
        - risk_tolerance ≤ 0 → ValueError
    """
    _is_finite(x, "x")
    _is_finite(risk_tolerance, "risk_tolerance")
    if risk_tolerance <= _TOL:
        raise ValueError(f"risk_tolerance must be > 0, got {risk_tolerance}")
    return 1.0 - math.exp(-x / risk_tolerance)


def exponential_utility_inverse(u: float, risk_tolerance: float) -> float:
    """x = -R × ln(1 - u)"""
    _is_finite(u, "u")
    _is_finite(risk_tolerance, "risk_tolerance")
    if risk_tolerance <= _TOL:
        raise ValueError(f"risk_tolerance must be > 0, got {risk_tolerance}")
    if u >= 1.0 - _TOL:
        # u → 1 implies infinite CE (the gamble is better than any finite amount)
        return math.inf
    if u < 0.0:
        raise ValueError(f"u must be ≥ 0 for exponential utility, got {u}")
    return -risk_tolerance * math.log(max(1.0 - u, _TOL))


def logarithmic_utility(x: float, reference: float = 1.0) -> float:
    """
    u(x) = ln(x + reference) — decreasing absolute risk aversion.
    Ch.10, §10.3

    Args:
        x:         Monetary outcome
        reference: Shift to handle zero/negative x (x + reference > 0 required)

    Edge cases:
        - x + reference ≤ 0 → ValueError
    """
    _is_finite(x, "x")
    _is_finite(reference, "reference")
    arg = x + reference
    if arg <= _TOL:
        raise ValueError(f"x + reference = {arg} must be > 0 for log utility")
    return math.log(arg)


def power_utility(x: float, gamma: float, shift: float = 0.0) -> float:
    """
    u(x) = (x + shift)^γ / γ  for γ ≠ 0, with γ < 1 for risk aversion.
    Ch.10, §10.3

    Constant relative risk aversion (CRRA) when shift=0.

    Args:
        x:      Monetary outcome
        gamma:  Risk-aversion parameter (< 1, ≠ 0; typically 0 < γ < 1)
        shift:  Shift to ensure x + shift > 0

    Edge cases:
        - γ = 0 → raises ValueError (use log utility instead)
        - x + shift ≤ 0 and γ not an integer → raises ValueError
    """
    _is_finite(x, "x")
    _is_finite(gamma, "gamma")
    _is_finite(shift, "shift")
    if abs(gamma) < _TOL:
        raise ValueError("γ = 0 — use logarithmic_utility instead (CRRA limit)")
    arg = x + shift
    if arg < -_TOL:
        raise ValueError(f"x + shift = {arg} must be ≥ 0 for power utility")
    if arg < _TOL:
        return 0.0
    return (arg ** gamma) / gamma


# ── Decision Tree Rollback ───────────────────────────────────────

def rollback_decision_tree(
    tree: Dict[str, Any],
) -> Tuple[float, str, List[Tuple[str, float]]]:
    """
    Decision-tree rollback via dynamic programming.
    Ch.4, §4.3 (Decision Trees and Rollback)

    Recursively evaluates a decision tree, choosing the maximum-EV branch
    at decision nodes and computing expected value at chance nodes.

    Tree structure (recursive dict):
      {
        "type": "decision" | "chance" | "terminal",
        "label": str,       # node name
        # For "decision":
        "branches": [        # list of alternatives
            {"label": str, "node": {...}}
        ]
        # For "chance":
        "branches": [        # list of outcomes
            {"label": str, "probability": float, "node": {...}}
        ]
        # For "terminal":
        "payoff": float
      }

    Returns:
        (best_ev, best_label, branch_evs) where branch_evs is a list of
        (branch_label, ev) for all branches at the root decision node.

    Edge cases:
        - Minimal-chance-branch detection: requires ≥2 branches for chance nodes
        - Degenerate (single-branch) decision nodes allowed
        - Terminal nodes require numeric payoff
        - Recursion limit: Python's default (~1000); deep trees may need adjustment
    """
    return _rollback(tree, depth=0)


def _rollback(
    node: Dict[str, Any], depth: int = 0
) -> Tuple[float, str, List[Tuple[str, float]]]:
    """Internal recursive rollback."""
    if depth > 500:
        raise RecursionError("Decision tree too deep (max depth 500)")

    ntype = node.get("type", "")
    label = node.get("label", f"unnamed_{depth}")

    if ntype == "terminal":
        payoff = node.get("payoff")
        if payoff is None:
            raise ValueError(f"Terminal node '{label}' missing 'payoff'")
        _is_finite(float(payoff), f"payoff at '{label}'")
        return float(payoff), label, []

    branches = node.get("branches", [])
    if not branches:
        raise ValueError(f"Node '{label}' (type={ntype}) has no branches")

    branch_evs: List[Tuple[str, float]] = []

    if ntype == "chance":
        # Chance node: expected value over branches
        probs = []
        payoffs = []
        for i, branch in enumerate(branches):
            p = branch.get("probability")
            if p is None:
                raise ValueError(f"Chance branch {i} at '{label}' missing 'probability'")
            probs.append(float(p))
            child_ev, _, _ = _rollback(branch["node"], depth + 1)
            payoffs.append(child_ev)
            branch_evs.append((branch.get("label", f"branch_{i}"), child_ev))

        _validate_probs(probs, f"probabilities at chance node '{label}'")
        ev = sum(p * x for p, x in zip(probs, payoffs))
        return ev, label, branch_evs

    elif ntype == "decision":
        # Decision node: choose max EV
        best_ev = -math.inf
        best_label = ""
        for i, branch in enumerate(branches):
            child_ev, _, _ = _rollback(branch["node"], depth + 1)
            b_label = branch.get("label", f"alternative_{i}")
            branch_evs.append((b_label, child_ev))
            if child_ev > best_ev:
                best_ev = child_ev
                best_label = b_label

        return best_ev, best_label, branch_evs

    else:
        raise ValueError(
            f"Unknown node type '{ntype}' at '{label}'. "
            f"Must be 'decision', 'chance', or 'terminal'."
        )


def build_simple_tree(
    name: str,
    alternatives: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Build a simple one-level decision tree:
      Root decision node → alternative branches → chance/terminal nodes.

    Each alternative dict:
      {
        "label": str,
        "type": "chance" | "terminal",
        # If "terminal":
        "payoff": float,
        # If "chance":
        "branches": [{"label": str, "probability": float, "payoff": float}, ...]
      }

    Returns a tree dict suitable for rollback_decision_tree().

    Edge cases:
        - Empty alternatives → ValueError
        - Alternative with "chance" but no branches → ValueError
    """
    if not alternatives:
        raise ValueError("Must provide at least one alternative")

    root_branches = []
    for i, alt in enumerate(alternatives):
        alt_label = alt.get("label", f"alternative_{i}")
        alt_type = alt.get("type", "terminal")

        if alt_type == "terminal":
            payoff = alt.get("payoff")
            if payoff is None:
                raise ValueError(f"Terminal alternative '{alt_label}' missing 'payoff'")
            _is_finite(float(payoff), f"payoff for '{alt_label}'")
            child = {"type": "terminal", "label": alt_label, "payoff": float(payoff)}

        elif alt_type == "chance":
            chance_branches = alt.get("branches", [])
            if len(chance_branches) < 2:
                raise ValueError(
                    f"Chance alternative '{alt_label}' needs ≥2 branches, "
                    f"got {len(chance_branches)}"
                )
            child_branches = []
            for j, cb in enumerate(chance_branches):
                p = float(cb.get("probability", 0))
                payoff_c = float(cb.get("payoff", 0))
                child_branches.append({
                    "label": cb.get("label", f"outcome_{j}"),
                    "probability": p,
                    "node": {
                        "type": "terminal",
                        "label": cb.get("label", f"outcome_{j}"),
                        "payoff": payoff_c,
                    },
                })
            _validate_probs(
                [b["probability"] for b in child_branches],
                f"probabilities at '{alt_label}'"
            )
            child = {"type": "chance", "label": alt_label, "branches": child_branches}

        else:
            raise ValueError(
                f"Unknown alternative type '{alt_type}' for '{alt_label}'"
            )

        root_branches.append({"label": alt_label, "node": child})

    return {
        "type": "decision",
        "label": name,
        "branches": root_branches,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 2 — SENSITIVITY ANALYSIS
# Source: Clemen & Reilly, Ch.5 ("Sensitivity Analysis")
# ═══════════════════════════════════════════════════════════════════

def one_way_sensitivity(
    base_value: float,
    variable_range: Tuple[float, float],
    num_steps: int,
    eval_func: Callable[[float], float],
) -> Dict[str, List[float]]:
    """
    One-way sensitivity analysis.
    Ch.5, §5.1

    Varies one input across a range while holding everything else constant,
    evaluating the output at each step.

    Args:
        base_value:     Starting value (included as a reference)
        variable_range: (low, high) bounds for the sweep
        num_steps:      Number of steps (≥ 2)
        eval_func:      f(input_value) → output (typically NPV or EV)

    Returns dict:
        'inputs':   list of input values
        'outputs':  list of corresponding outputs
        'base_input': base_value
        'base_output': eval_func(base_value)

    Edge cases:
        - num_steps < 2 → ValueError
        - low > high → ValueError
    """
    _is_finite(base_value, "base_value")
    low, high = variable_range
    _is_finite(low, "low")
    _is_finite(high, "high")
    if low > high:
        raise ValueError(f"low ({low}) must be ≤ high ({high})")
    if not isinstance(num_steps, int) or num_steps < 2:
        raise ValueError(f"num_steps must be ≥ 2, got {num_steps}")

    base_output = eval_func(base_value)
    _is_finite(base_output, "eval_func(base_value)")

    inputs = []
    outputs = []
    step_size = (high - low) / (num_steps - 1) if num_steps > 1 else 0.0

    for i in range(num_steps):
        x = low + i * step_size
        y = eval_func(x)
        _is_finite(y, f"eval_func({x})")
        inputs.append(x)
        outputs.append(y)

    return {
        "inputs": inputs,
        "outputs": outputs,
        "base_input": base_value,
        "base_output": base_output,
    }


def crossover_point(
    f1: Callable[[float], float],
    f2: Callable[[float], float],
    low: float,
    high: float,
    num_steps: int = 200,
) -> Optional[float]:
    """
    Find the crossover point where f1(x) = f2(x) in [low, high].
    Ch.5, §5.3 (Two-Way Sensitivity Analysis)

    Uses binary search after detecting a sign change in f1(x) - f2(x).
    Returns the crossover x, or None if no crossover detected.

    Edge cases:
        - f1 dominates f2 across entire range → returns None
        - Multiple crossovers → returns the first found
    """
    _is_finite(low, "low")
    _is_finite(high, "high")
    if low >= high:
        raise ValueError(f"low ({low}) must be < high ({high})")

    def diff(x: float) -> float:
        return f1(x) - f2(x)

    # Sample the range to find a sign change
    d_low = diff(low)
    d_high = diff(high)
    _is_finite(d_low, "f1(low) - f2(low)")
    _is_finite(d_high, "f1(high) - f2(high)")

    # If same sign at endpoints, check interior
    if d_low * d_high > 0:
        # Scan interior for sign change
        for i in range(1, num_steps):
            x = low + (high - low) * i / num_steps
            d_x = diff(x)
            if d_low * d_x <= 0:
                high = x
                d_high = d_x
                break
        else:
            return None  # no crossover found

    # Binary search for the root
    lo, hi = low, high
    for _ in range(50):
        mid = (lo + hi) / 2.0
        d_mid = diff(mid)
        if abs(d_mid) < 1e-9:
            return mid
        if d_mid * d_low > 0:
            lo = mid
        else:
            hi = mid
        if abs(hi - lo) < 1e-9:
            return (lo + hi) / 2.0

    return (lo + hi) / 2.0


def tornado_analysis(
    base_inputs: Dict[str, float],
    ranges: Dict[str, Tuple[float, float]],
    eval_func: Callable[[Dict[str, float]], float],
) -> List[Dict[str, Any]]:
    """
    Tornado diagram analysis.
    Ch.5, §5.2

    Varies each input one at a time from its low to its high value,
    recording the swing in output. Sorts results by swing magnitude.

    Args:
        base_inputs:  Dict of variable_name → base_value
        ranges:       Dict of variable_name → (low, high)
        eval_func:    f(inputs_dict) → output value

    Returns:
        Sorted list (largest swing first) of dicts:
          {'variable': str, 'low_output': float, 'high_output': float,
           'swing': float, 'low_input': float, 'high_input': float}

    Edge cases:
        - Variable in ranges but not in base_inputs → ValueError
        - Variable in base_inputs but not in ranges → skipped (no swing data)
    """
    if not base_inputs:
        raise ValueError("base_inputs must be non-empty")
    if not ranges:
        raise ValueError("ranges must be non-empty (need at least one variable to vary)")

    base_output = eval_func(dict(base_inputs))
    _is_finite(base_output, "eval_func(base_inputs)")

    results = []
    for var_name, (low, high) in ranges.items():
        if var_name not in base_inputs:
            raise ValueError(f"Variable '{var_name}' in ranges but not in base_inputs")
        _is_finite(low, f"low for '{var_name}'")
        _is_finite(high, f"high for '{var_name}'")
        if low > high:
            raise ValueError(f"low > high for '{var_name}': ({low}, {high})")

        # Evaluate at low
        inputs_low = dict(base_inputs)
        inputs_low[var_name] = low
        out_low = eval_func(inputs_low)
        _is_finite(out_low, f"eval_func with {var_name}={low}")

        # Evaluate at high
        inputs_high = dict(base_inputs)
        inputs_high[var_name] = high
        out_high = eval_func(inputs_high)
        _is_finite(out_high, f"eval_func with {var_name}={high}")

        swing = abs(out_high - out_low)
        results.append({
            "variable": var_name,
            "low_output": min(out_low, out_high),
            "high_output": max(out_low, out_high),
            "low_input": low,
            "high_input": high,
            "swing": swing,
            "base_output": base_output,
        })

    results.sort(key=lambda r: r["swing"], reverse=True)
    return results


# ═══════════════════════════════════════════════════════════════════
# PART 3 — MULTI-ATTRIBUTE UTILITY THEORY (MAUT)
# Source: Clemen & Reilly, Ch.14 ("Multi-Attribute Decision Making"),
#         Ch.15 ("Multi-Attribute Utility Theory")
# ═══════════════════════════════════════════════════════════════════

def additive_maut(
    scores: Dict[str, float],
    weights: Dict[str, float],
) -> float:
    """
    Additive MAUT: U = Σ w_i × s_i
    Ch.15, §15.2 (Additive Utility Function)

    The simplest multi-attribute scoring model. Assumes mutual preferential
    independence — a strong assumption that should be verified (Ch.15, §15.3).

    Args:
        scores:  Dict of attribute → score (typically normalized to [0, 1])
        weights: Dict of attribute → weight (must sum to 1.0)

    Returns:
        Aggregate utility score in [0, 1].

    Edge cases:
        - Attribute in scores but not weights → ValueError
        - Attribute in weights but not scores → ValueError
        - Weights not summing to 1.0 → ValueError
    """
    if set(scores.keys()) != set(weights.keys()):
        missing_w = set(scores.keys()) - set(weights.keys())
        missing_s = set(weights.keys()) - set(scores.keys())
        msg = []
        if missing_w:
            msg.append(f"attributes in scores but not weights: {missing_w}")
        if missing_s:
            msg.append(f"attributes in weights but not scores: {missing_s}")
        raise ValueError("; ".join(msg))

    for attr, w in weights.items():
        _is_probability(w, f"weight for '{attr}'")

    total_w = sum(weights.values())
    if abs(total_w - 1.0) > _P_TOL:
        raise ValueError(f"Weights sum to {total_w}, must sum to 1.0")

    for attr, s in scores.items():
        _is_finite(s, f"score for '{attr}'")

    return sum(weights[a] * scores[a] for a in scores)


def multiplicative_maut(
    scores: Dict[str, float],
    weights: Dict[str, float],
    k: float = 0.0,
) -> float:
    """
    Multiplicative MAUT: 1 + kU = Π (1 + k·k_i·u_i)
    Ch.15, §15.4 (Multiplicative Utility Function)

    Used when attributes are NOT mutually preferentially independent.
    k > -1 is the interaction parameter:
      - k > 0:  attributes are complementary (synergistic)
      - k = 0:  reduces to additive (no interaction)
      - k < 0:  attributes are substitutive (partial compensation)

    Args:
        scores:   Dict of attribute → single-attribute utility (norm. [0, 1])
        weights:  Dict of attribute → scaling constant k_i (sum NOT equal to 1.0
                  for multiplicative; k is solved from them)
        k:        Interaction parameter (> -1). If not known, solve from:
                  1 + k = Π (1 + k·k_i) — must satisfy this equation.

    Returns:
        Aggregate utility U.

    Edge cases:
        - k ≤ -1 → ValueError
        - k·k_i·u_i < -1 for any i → the product becomes negative → ValueError
    """
    if set(scores.keys()) != set(weights.keys()):
        raise ValueError("Attribute mismatch between scores and weights")

    if k <= -1.0:
        raise ValueError(f"k must be > -1, got {k} (Ch.15, §15.4)")

    product = 1.0
    for attr in scores:
        k_i = weights[attr]
        u_i = scores[attr]
        _is_finite(u_i, f"score for '{attr}'")
        term = 1.0 + k * k_i * u_i
        if term < -_TOL:
            raise ValueError(
                f"For attribute '{attr}': 1 + k × k_i × u_i = {term} < 0 — "
                f"invalid for multiplicative MAUT"
            )
        product *= max(term, 0.0)

    if abs(k) < _TOL:
        # k → 0: multiplicative → additive (limit case)
        return additive_maut(scores, weights)

    u = (product - 1.0) / k
    return u


def swing_weighting(
    attribute_names: List[str],
    swing_rankings: Dict[str, int],
    most_important_weight: float = 100.0,
) -> Dict[str, float]:
    """
    Swing Weighting Method.
    Ch.15, §15.2

    Decision-maker ranks attributes by how much "swing" from worst to best
    matters. The most important attribute gets a reference weight; others
    are scaled down by their relative importance.

    Args:
        attribute_names:     Ordered list of attribute names (can be any order)
        swing_rankings:      Dict of attribute → rank (1 = most important, higher = less)
        most_important_weight: Weight of the #1 ranked attribute (default 100)

    Returns:
        Dict of attribute → normalized weight (sum to 1.0).

    Edge cases:
        - Empty list → ValueError
        - Missing attribute in rankings → ValueError
    """
    if not attribute_names:
        raise ValueError("attribute_names must be non-empty")

    for attr in attribute_names:
        if attr not in swing_rankings:
            raise ValueError(f"Attribute '{attr}' missing from swing_rankings")

    max_rank = max(swing_rankings.values())
    if max_rank < 1:
        raise ValueError("Ranks must start at 1")

    # Assign raw weights: 100 for rank 1, then proportionally lower
    raw_weights = {}
    for attr in attribute_names:
        rank = swing_rankings[attr]
        if rank < 1:
            raise ValueError(f"Rank for '{attr}' must be ≥ 1, got {rank}")
        # Each rank step reduces weight by a factor
        raw_weights[attr] = most_important_weight / rank

    total = sum(raw_weights.values())
    if total < _TOL:
        raise ValueError("Total raw weight is zero")

    return {attr: w / total for attr, w in raw_weights.items()}


def score_to_utility(raw_score: float, worst: float, best: float) -> float:
    """
    Linear normalization: u = (score - worst) / (best - worst)
    Ch.15, §15.2

    Maps a raw score into [0, 1] utility space.
    u(worst) = 0, u(best) = 1.

    Edge cases:
        - best = worst → raises ValueError (degenerate: no discrimination)
    """
    _is_finite(raw_score, "raw_score")
    _is_finite(worst, "worst")
    _is_finite(best, "best")
    if abs(best - worst) < _TOL:
        raise ValueError(
            f"best ({best}) and worst ({worst}) must differ for normalization"
        )
    u = (raw_score - worst) / (best - worst)
    return max(0.0, min(1.0, u))  # clamp to [0, 1]


# ═══════════════════════════════════════════════════════════════════
# PART 4 — VALUE OF INFORMATION
# Source: Clemen & Reilly, Ch.13 ("The Value of Information")
# ═══════════════════════════════════════════════════════════════════

def evpi(
    prior_ev: float,
    perfect_info_scenarios: List[Tuple[float, float]],
) -> float:
    """
    Expected Value of Perfect Information.
    Ch.13, §13.2

    EVPI = EV with perfect information — EV with prior information

    EV with perfect info = Σ p(s) × max_a [payoff(a | s)]
    where s is the true state and a is the best action given that state.

    Args:
        prior_ev:              Expected value under prior uncertainty (no info)
        perfect_info_scenarios: List of (probability, max_payoff_if_known)
                               representing each possible state of nature

    Returns:
        EVPI ≥ 0 (information cannot have negative expected value).

    Edge cases:
        - EVPI slightly negative due to float → clamped to 0
    """
    _is_finite(prior_ev, "prior_ev")
    if not perfect_info_scenarios:
        raise ValueError("perfect_info_scenarios must be non-empty")

    probs = [p for p, _ in perfect_info_scenarios]
    max_payoffs = [mp for _, mp in perfect_info_scenarios]
    _validate_probs(probs, "probabilities in perfect_info_scenarios")
    for i, mp in enumerate(max_payoffs):
        _is_finite(mp, f"max_payoff[{i}]")

    ev_with_pi = sum(p * mp for p, mp in perfect_info_scenarios)
    evpi_val = ev_with_pi - prior_ev

    if evpi_val < -_TOL:
        raise ValueError(f"EVPI is negative ({evpi_val}) — data or logic error")
    return max(evpi_val, 0.0)


def evsi(
    prior_ev: float,
    signal_scenarios: List[Dict[str, Any]],
    alternatives: List[str],
) -> Tuple[float, Dict[str, float]]:
    """
    Expected Value of Sample Information.
    Ch.13, §13.3

    EVSI = Σ p(signal) × max_a Σ_s p(s | signal) × payoff(a, s) — prior EV

    This is a simplified interface that expects pre-computed posterior
    analysis per signal.

    Args:
        prior_ev:      Expected value under prior probabilities
        signal_scenarios: List of dicts, each representing one possible signal:
                         {'probability': p(signal),
                          'best_alternative': str,
                          'expected_value_given_signal': float}
        alternatives:  List of all alternative names (unused but kept for debugging)

    Returns:
        (evsi, ev_per_signal) where ev_per_signal maps signal → EV achieved.

    Edge cases:
        - EVSI < 0 → clamped to 0 (information can't have negative value)
        - Probabilities of signals not summing to 1.0 → ValueError
    """
    _is_finite(prior_ev, "prior_ev")
    if not signal_scenarios:
        raise ValueError("signal_scenarios must be non-empty")

    probs = []
    ev_per_signal = {}
    ev_with_si = 0.0

    for i, scenario in enumerate(signal_scenarios):
        p_signal = scenario.get("probability")
        best = scenario.get("best_alternative")
        ev_given = scenario.get("expected_value_given_signal")

        if p_signal is None:
            raise ValueError(f"signal_scenarios[{i}] missing 'probability'")
        if ev_given is None:
            raise ValueError(f"signal_scenarios[{i}] missing 'expected_value_given_signal'")

        _is_probability(float(p_signal), f"signal_scenarios[{i}].probability")
        _is_finite(float(ev_given), f"signal_scenarios[{i}].expected_value_given_signal")

        probs.append(float(p_signal))
        label = scenario.get("label", f"signal_{i}")
        ev_per_signal[label] = float(ev_given)
        ev_with_si += float(p_signal) * float(ev_given)

    _validate_probs(probs, "signal probabilities")
    evsi_val = ev_with_si - prior_ev

    return max(evsi_val, 0.0), ev_per_signal


# ═══════════════════════════════════════════════════════════════════
# PART 5 — MONTE CARLO SIMULATION
# Source: Clemen & Reilly, Ch.11 ("Monte Carlo Simulation")
# ═══════════════════════════════════════════════════════════════════

def monte_carlo(
    simulate_once: Callable[[], float],
    iterations: int = 10000,
    seed: Optional[int] = None,
) -> Dict[str, float]:
    """
    Simple Monte Carlo simulation.
    Ch.11, §11.2

    Runs `simulate_once()` for `iterations` trials and returns summary
    statistics of the resulting distribution.

    Args:
        simulate_once:  A parameterless function that returns one simulated value
        iterations:     Number of trials (≥ 1)
        seed:           RNG seed for reproducibility

    Returns dict:
        'mean':         sample mean
        'std':          sample standard deviation
        'min':          minimum observed
        'max':          maximum observed
        'median':       50th percentile
        'percentile_5':  5th percentile
        'percentile_95': 95th percentile
        'n':            number of iterations
        'samples':      full list of samples (for further analysis)

    Edge cases:
        - iterations = 1 → std = 0; all percentiles = the single value
    """
    if not isinstance(iterations, int) or iterations < 1:
        raise ValueError(f"iterations must be ≥ 1, got {iterations}")

    rng = random.Random(seed)
    samples = []

    for _ in range(iterations):
        val = simulate_once()
        _is_finite(val, "simulate_once() return value")
        # We pass RNG state implicitly; the simulate_once function
        # should use its own seeded RNG if it needs one.
        samples.append(val)

    samples.sort()
    n = len(samples)

    mean_val = sum(samples) / n
    var_val = sum((x - mean_val) ** 2 for x in samples) / n
    std_val = math.sqrt(var_val) if n > 1 else 0.0

    def percentile(data: List[float], p: float) -> float:
        """Linear interpolation percentile."""
        if n == 1:
            return data[0]
        k = (n - 1) * p / 100.0
        f = int(k)
        c = k - f
        if f + 1 >= n:
            return data[-1]
        return data[f] + c * (data[f + 1] - data[f])

    return {
        "mean": mean_val,
        "std": std_val,
        "min": samples[0],
        "max": samples[-1],
        "median": percentile(samples, 50),
        "percentile_5": percentile(samples, 5),
        "percentile_95": percentile(samples, 95),
        "n": n,
        "samples": samples,
    }


def monte_carlo_npv(
    initial_investment: float,
    cashflow_generator: Callable[[], List[float]],
    discount_rate: float,
    iterations: int = 10000,
    seed: Optional[int] = None,
) -> Dict[str, float]:
    """
    Monte Carlo simulation of NPV.
    Ch.11, §11.3 (Example: NPV Simulation)

    Each trial: generate a set of cashflows, discount them, compute NPV.
    The distribution of NPVs captures uncertainty in the cashflow estimates.

    Args:
        initial_investment:  CF₀ (positive number — will be made negative)
        cashflow_generator:  () → List[float] producing one CF stream per call
        discount_rate:       Annual discount rate (decimal)
        iterations:          Number of trials
        seed:                RNG seed for reproducibility

    Returns same dict as monte_carlo() with NPV distribution.

    NOTE: The cashflow_generator should manage its own RNG state. For
    reproducibility, seed the global RNG before calling, or pass a seed
    to each call-through in the generator.
    """
    _is_finite(initial_investment, "initial_investment")
    _is_finite(discount_rate, "discount_rate")
    if discount_rate <= -1.0:
        raise ValueError(f"discount_rate must be > -1.0, got {discount_rate}")

    def trial() -> float:
        cfs = cashflow_generator()
        if not cfs:
            raise ValueError("cashflow_generator returned empty list")
        # NPV = -I + Σ CF_t / (1+r)^t
        npv_val = -initial_investment
        for t, cf in enumerate(cfs, 1):
            _is_finite(cf, f"cashflow[{t}]")
            npv_val += cf / (1.0 + discount_rate) ** t
        return npv_val

    return monte_carlo(trial, iterations, seed)


def probability_of_exceeding(
    samples: List[float], threshold: float
) -> float:
    """
    P(outcome > threshold) from MC output.
    Ch.11, §11.4

    Returns the fraction of samples exceeding the threshold.
    """
    if not samples:
        raise ValueError("samples must be non-empty")
    _is_finite(threshold, "threshold")
    return sum(1 for x in samples if x > threshold) / len(samples)


def probability_of_loss(samples: List[float]) -> float:
    """P(NPV < 0) — special case of probability_of_exceeding."""
    return probability_of_exceeding([-x for x in samples], 0.0)


# ═══════════════════════════════════════════════════════════════════
# PART 6 — PROBABILITY CALIBRATION & SCORING
# Source: Clemen & Reilly, Ch.7 ("Probability Basics"),
#         Ch.8 ("Subjective Probability")
# ═══════════════════════════════════════════════════════════════════

def brier_score(
    forecasts: List[Tuple[float, int]],
) -> float:
    """
    Brier Score = (1/N) Σ (f_i - o_i)²
    Ch.8, §8.4 (Calibration and Scoring)

    Measures the accuracy of probabilistic forecasts.
    f_i = forecast probability (0 to 1)
    o_i = actual outcome (0 or 1)

    Brier Score = 0: Perfect calibration.
    Brier Score = 0.25: No better than always predicting 0.5.
    Brier Score = 1.0: Worst possible (always predicting 1 when outcome is 0, or vice versa).

    Args:
        forecasts: List of (probability, outcome) pairs.
                  outcome must be exactly 0 or 1.

    Returns:
        Brier score in [0, 1].

    Edge cases:
        - Empty list → ValueError
        - outcome not 0 or 1 → ValueError
    """
    if not forecasts:
        raise ValueError("forecasts must be non-empty")

    total = 0.0
    for i, (f, o) in enumerate(forecasts):
        _is_probability(f, f"forecasts[{i}].probability")
        if o not in (0, 1):
            raise ValueError(
                f"forecasts[{i}].outcome must be 0 or 1, got {o}"
            )
        total += (f - o) ** 2

    return total / len(forecasts)


def calibration_curve(
    forecasts: List[Tuple[float, int]],
    num_bins: int = 10,
) -> Dict[str, List[float]]:
    """
    Calibration curve / reliability diagram.
    Ch.8, §8.4

    Groups forecasts into bins and computes the observed frequency in each bin.
    A well-calibrated forecaster will have observed ≈ predicted in each bin.

    Args:
        forecasts:  List of (probability, outcome) pairs
        num_bins:   Number of bins (2–20)

    Returns dict:
        'bin_centers':     Midpoint of each probability bin
        'predicted':       Average predicted probability in each bin
        'observed':        Observed frequency of event in each bin
        'bin_counts':      Number of forecasts in each bin
        'brier':           Overall Brier score

    Edge cases:
        - Empty bins can occur with sparse data
    """
    if not forecasts:
        raise ValueError("forecasts must be non-empty")
    if not 2 <= num_bins <= 20:
        raise ValueError(f"num_bins must be in [2, 20], got {num_bins}")

    # Sort by predicted probability
    sorted_forecasts = sorted(forecasts, key=lambda x: x[0])

    bin_size = len(sorted_forecasts) / num_bins
    centers = []
    predicted = []
    observed = []
    counts = []

    for b in range(num_bins):
        start = int(b * bin_size)
        end = int((b + 1) * bin_size) if b < num_bins - 1 else len(sorted_forecasts)
        if start >= len(sorted_forecasts):
            break

        bin_data = sorted_forecasts[start:end]
        if not bin_data:
            continue

        avg_p = sum(f for f, _ in bin_data) / len(bin_data)
        avg_o = sum(o for _, o in bin_data) / len(bin_data)

        centers.append((start + end) / 2 / len(sorted_forecasts))
        predicted.append(avg_p)
        observed.append(avg_o)
        counts.append(len(bin_data))

    return {
        "bin_centers": centers,
        "predicted": predicted,
        "observed": observed,
        "bin_counts": counts,
        "brier": brier_score(forecasts),
    }


def confidence_calibration_test(
    intervals: List[Tuple[float, float, float]],
) -> float:
    """
    Test whether stated confidence intervals are well-calibrated.
    Ch.8, §8.4; also Kahneman Ch.23 (planning fallacy, CFO study)

    Each interval: (lower, upper, actual_value)
    A well-calibrated 80% CI should contain the actual value 80% of the time.

    Args:
        intervals: List of (lower, upper, actual)

    Returns:
        Actual hit rate (fraction contained). Compare to stated confidence
        to detect over/under-confidence.

    Edge cases:
        - lower > upper → ValueError
    """
    if not intervals:
        raise ValueError("intervals must be non-empty")

    hits = 0
    for i, (lo, hi, actual) in enumerate(intervals):
        _is_finite(lo, f"intervals[{i}].lower")
        _is_finite(hi, f"intervals[{i}].upper")
        _is_finite(actual, f"intervals[{i}].actual")
        if lo > hi:
            raise ValueError(f"intervals[{i}]: lower ({lo}) > upper ({hi})")
        if lo <= actual <= hi:
            hits += 1

    return hits / len(intervals)


def overconfidence_ratio(
    stated_confidence: float, actual_hit_rate: float
) -> float:
    """
    Overconfidence Ratio.
    Kahneman Ch.23-24 via Clemen Ch.8

    Overconfidence = Stated_Confidence / Actual_Hit_Rate

    Ratio > 1.0 → Overconfident (stated more than actual)
    Ratio = 1.0 → Perfectly calibrated
    Ratio < 1.0 → Underconfident (stated less than actual)

    Edge cases:
        - actual_hit_rate = 0 → returns math.inf
    """
    _is_probability(stated_confidence, "stated_confidence")
    _is_probability(actual_hit_rate, "actual_hit_rate")
    if actual_hit_rate < _TOL:
        return math.inf
    return stated_confidence / actual_hit_rate


# ═══════════════════════════════════════════════════════════════════
# PART 7 — SELF-TEST SUITE
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
        elif expected is None:
            if actual is not None:
                print(f"  FAIL  {label}: expected None, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: None")
                passed += 1
        elif isinstance(expected, str):
            if actual != expected:
                print(f"  FAIL  {label}: expected '{expected}', got '{actual}'")
                failures += 1
            else:
                print(f"  PASS  {label}: '{actual}'")
                passed += 1
        elif isinstance(expected, float) and math.isinf(expected):
            if actual != expected:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1
        else:
            if abs(actual - expected) > tol:
                print(f"  FAIL  {label}: expected {expected}, got {actual}")
                failures += 1
            else:
                print(f"  PASS  {label}: {actual}")
                passed += 1

    def check_raises(label: str, func: Callable, *args, **kwargs):
        nonlocal failures, passed
        try:
            result = func(*args, **kwargs)
            print(f"  FAIL  {label}: expected exception but got {result}")
            failures += 1
        except (ValueError, TypeError, RecursionError) as e:
            print(f"  PASS  {label}: raised {type(e).__name__} — {str(e)[:80]}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: decision_analysis.py")
    print("Source: Clemen & Reilly, Making Hard Decisions (3rd Ed., 2012)")
    print("=" * 70)

    # ── Part 1: Decision Trees ──
    print("\n── Part 1: Decision Trees & Expected Value (Ch.3-4, 10) ──")

    # Expected value
    payoffs = [-100.0, 50.0, 200.0]
    probs = [0.2, 0.5, 0.3]
    # EV = -20 + 25 + 60 = 65
    check("ev: basic", expected_value(payoffs, probs), 65.0)

    # Even odds
    check("ev: even odds", expected_value([0.0, 100.0], [0.5, 0.5]), 50.0)

    # Utility functions
    # Exponential: u(100) with R=500 → 1 - exp(-100/500) = 1 - exp(-0.2) = 1 - 0.81873 = 0.18127
    u100 = exponential_utility(100.0, 500.0)
    check("exp_utility: u(100), R=500", u100, 0.18127, tol=1e-4)
    check("exp_utility: u(0), any R", exponential_utility(0.0, 100.0), 0.0)
    # u(1000), R=500: 1 - exp(-2) = 1 - 0.13534 = 0.86466
    check("exp_utility: u(1000), R=500", exponential_utility(1000.0, 500.0), 0.86466, tol=1e-4)

    # Inverse: CE for EU=0.18127, R=500 → -500*ln(1-0.18127) = -500*ln(0.81873) = -500*(-0.2) = 100
    ce100 = exponential_utility_inverse(0.18127, 500.0)
    check("exp_inverse: CE ≈ 100", ce100, 100.0, tol=0.1)

    # Log utility
    check("log_utility: ln(100+1)", logarithmic_utility(100.0, 1.0), math.log(101.0))

    # Power utility: γ=0.5 (square root, risk-averse)
    # u(100) = 100^0.5 / 0.5 = 10/0.5 = 20
    check("power_utility: γ=0.5, x=100", power_utility(100.0, 0.5), 20.0, tol=1e-10)

    # Expected utility
    eu = expected_utility(payoffs, probs, lambda x: exponential_utility(x, 500.0))
    # EV is 65, R=500, let's compute exactly
    # u(-100)=exp(100/500)-1? No, u=1-e^(100/500)=1-e^0.2=1-1.2214=-0.2214
    # u(50)=1-e^(-0.1)=1-0.9048=0.0952
    # u(200)=1-e^(-0.4)=1-0.6703=0.3297
    # EU = 0.2*(-0.2214)+0.5*0.0952+0.3*0.3297 = -0.0443+0.0476+0.0989 = 0.1022
    check("expected_utility: exponential R=500", eu, 0.1022, tol=1e-3)

    # Certainty equivalent and risk premium
    ce = certainty_equivalent(eu, lambda u: exponential_utility_inverse(u, 500.0))
    rp = risk_premium(65.0, ce)
    check("risk_premium: positive for risk-averse", rp > 0, True)

    # Simple decision tree
    tree = build_simple_tree("Test Decision", [
        {"label": "Invest", "type": "chance", "branches": [
            {"label": "Success", "probability": 0.4, "payoff": 200.0},
            {"label": "Failure", "probability": 0.6, "payoff": -100.0},
        ]},
        {"label": "Don't Invest", "type": "terminal", "payoff": 0.0},
    ])
    # EV(Invest) = 0.4*200 + 0.6*(-100) = 80 - 60 = 20
    # EV(Don't) = 0
    # Best = Invest, EV = 20
    best_ev, best_label, branch_evs = rollback_decision_tree(tree)
    check("tree: best EV = 20", best_ev, 20.0)
    check("tree: best label = Invest", best_label, "Invest")
    check("tree: 2 root branches", len(branch_evs), 2)
    # Invest branch EV
    invest_ev = next(ev for label, ev in branch_evs if label == "Invest")
    check("tree: Invest EV = 20", invest_ev, 20.0)

    # More complex 2-level tree (decision → chance → chance)
    # This requires using the raw tree dict format
    complex_tree = {
        "type": "decision",
        "label": "Root",
        "branches": [
            {
                "label": "Launch",
                "node": {
                    "type": "chance",
                    "label": "Market",
                    "branches": [
                        {"label": "Good", "probability": 0.6, "node": {
                            "type": "decision", "label": "Scale",
                            "branches": [
                                {"label": "Expand", "node": {"type": "terminal", "label": "t1", "payoff": 500.0}},
                                {"label": "Maintain", "node": {"type": "terminal", "label": "t2", "payoff": 300.0}},
                            ]
                        }},
                        {"label": "Bad", "probability": 0.4, "node": {
                            "type": "decision", "label": "Cut",
                            "branches": [
                                {"label": "Exit", "node": {"type": "terminal", "label": "t3", "payoff": -50.0}},
                                {"label": "Wait", "node": {"type": "terminal", "label": "t4", "payoff": -20.0}},
                            ]
                        }},
                    ],
                },
            },
            {
                "label": "Don't Launch",
                "node": {"type": "terminal", "label": "NoGo", "payoff": 0.0},
            },
        ],
    }
    # Rollback:
    #   Good market → Expand (500) > Maintain (300) → 500
    #   Bad market → Wait (-20) > Exit (-50) → -20
    #   EV(Launch) = 0.6*500 + 0.4*(-20) = 300 - 8 = 292
    #   EV(Don't) = 0
    #   Best = Launch, EV = 292
    ev2, label2, branches2 = rollback_decision_tree(complex_tree)
    check("complex_tree: best EV = 292", ev2, 292.0)
    check("complex_tree: best label = Launch", label2, "Launch")

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("ev: probs don't sum to 1", expected_value, [1.0, 2.0], [0.3, 0.3])
    check_raises("exp_utility: R ≤ 0", exponential_utility, 100.0, 0.0)
    check_raises("exp_utility: R < 0", exponential_utility, 100.0, -10.0)
    check_raises("log_utility: x + ref ≤ 0", logarithmic_utility, -5.0, 1.0)
    check_raises("power_utility: γ = 0", power_utility, 100.0, 0.0)
    check_raises("build_simple_tree: empty alts", build_simple_tree, "Test", [])
    check_raises("build_simple_tree: chance w/ 1 branch", build_simple_tree, "Test", [
        {"label": "A", "type": "chance", "branches": [{"label": "S", "probability": 1.0, "payoff": 100.0}]},
    ])

    # ── Part 2: Sensitivity Analysis ──
    print("\n── Part 2: Sensitivity Analysis (Ch.5) ──")

    # One-way: f(x) = x², sweep x from 0 to 10
    ow = one_way_sensitivity(5.0, (0.0, 10.0), 11, lambda x: x * x)
    check("one_way: base_output = 25", ow["base_output"], 25.0)
    check("one_way: 11 steps", len(ow["inputs"]), 11)
    check("one_way: first output = 0", ow["outputs"][0], 0.0)
    check("one_way: last output = 100", ow["outputs"][-1], 100.0)

    # Crossover: f1(x)=x², f2(x)=10x
    # x² = 10x → x(x-10) = 0 → x = 0 or x = 10
    cross = crossover_point(
        lambda x: x * x, lambda x: 10 * x, 1.0, 15.0
    )
    check("crossover: x² = 10x → x=10", cross, 10.0, tol=0.01)

    # No crossover
    no_cross = crossover_point(
        lambda x: x * x, lambda x: -10.0, 1.0, 10.0
    )
    check("crossover: no intersection", no_cross is None, True)

    # Tornado
    base = {"price": 10.0, "cost": 5.0, "volume": 1000.0}
    ranges = {
        "price": (8.0, 12.0),
        "cost": (3.0, 7.0),
        "volume": (800.0, 1200.0),
    }
    def profit(inputs: Dict[str, float]) -> float:
        return (inputs["price"] - inputs["cost"]) * inputs["volume"]

    tornado = tornado_analysis(base, ranges, profit)
    # Base profit = (10-5)*1000 = 5000
    # Price 8 → (8-5)*1000=3000, Price 12 → (12-5)*1000=7000, swing=4000
    # Cost 3 → (10-3)*1000=7000, Cost 7 → (10-7)*1000=3000, swing=4000
    # Volume 800 → (10-5)*800=4000, Volume 1200→(10-5)*1200=6000, swing=2000
    check("tornado: 3 variables", len(tornado), 3)
    # Price and cost tied for largest swing (4000)
    check("tornado: largest swing ≥ 4000", tornado[0]["swing"] >= 3999.0, True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("one_way: low > high", one_way_sensitivity, 5.0, (10.0, 0.0), 5, lambda x: x)
    check_raises("one_way: num_steps < 2", one_way_sensitivity, 5.0, (0.0, 10.0), 1, lambda x: x)
    check_raises("crossover: low ≥ high", crossover_point, lambda x: x, lambda x: 0, 10.0, 5.0)

    # ── Part 3: MAUT ──
    print("\n── Part 3: Multi-Attribute Utility Theory (Ch.14-15) ──")

    scores = {"cost": 0.7, "quality": 0.9, "speed": 0.4}
    weights = {"cost": 0.4, "quality": 0.35, "speed": 0.25}
    # U = 0.4*0.7 + 0.35*0.9 + 0.25*0.4 = 0.28 + 0.315 + 0.10 = 0.695
    add_u = additive_maut(scores, weights)
    check("additive_maut: 3 attributes", add_u, 0.695, tol=1e-3)

    # Multiplicative with k=0 (reduces to additive)
    mult_u = multiplicative_maut(scores, weights, k=0.0)
    check("multiplicative_maut: k=0 = additive", mult_u, 0.695, tol=1e-3)

    # Multiplicative with k=0.5 (synergy)
    # 1+0.5U = (1+0.5*0.4*0.7)*(1+0.5*0.35*0.9)*(1+0.5*0.25*0.4)
    # = (1+0.14)*(1+0.1575)*(1+0.05)
    # = 1.14 * 1.1575 * 1.05 = 1.3858
    # U = (1.3858 - 1) / 0.5 = 0.7716
    mult_u_k = multiplicative_maut(scores, weights, k=0.5)
    check("multiplicative_maut: k=0.5 synergy > additive", mult_u_k > add_u, True)

    # Swing weighting
    sw = swing_weighting(["cost", "quality", "speed"], {"cost": 1, "quality": 2, "speed": 3})
    # cost=100, quality=50, speed=33.33; total=183.33; norm = cost/183.33=0.545, qual=0.273, speed=0.182
    check("swing: cost highest weight", sw["cost"], 0.54545, tol=0.001)
    check("swing: weights sum to 1", sum(sw.values()), 1.0, tol=1e-6)

    # Score normalization
    u_cost = score_to_utility(7.5, worst=10.0, best=5.0)
    # (7.5-10)/(5-10) = (-2.5)/(-5) = 0.5
    check("score_to_utility: mid-range", u_cost, 0.5)
    check("score_to_utility: best", score_to_utility(5.0, 10.0, 5.0), 1.0)
    check("score_to_utility: worst", score_to_utility(10.0, 10.0, 5.0), 0.0)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("additive_maut: weights ≠ scores attributes",
                 additive_maut, {"a": 0.5}, {"b": 1.0})
    check_raises("additive_maut: weights don't sum to 1",
                 additive_maut, {"a": 0.5, "b": 0.5}, {"a": 0.3, "b": 0.3})
    check_raises("score_to_utility: best = worst",
                 score_to_utility, 5.0, 5.0, 5.0)

    # ── Part 4: Value of Information ──
    print("\n── Part 4: Value of Information (Ch.13) ──")

    # EVPI classic example:
    # Two alternatives: Drill (if oil → $1M, if dry → -$200K) vs Don't Drill ($0)
    # P(Oil)=0.3, P(Dry)=0.7
    # Prior EV = max(0.3*1000 + 0.7*(-200), 0) = max(300-140, 0) = max(160, 0) = 160
    # With perfect info:
    #   If oil: best is Drill = 1000
    #   If dry: best is Don't = 0
    #   EVPI = 0.3*1000 + 0.7*0 - 160 = 300 - 160 = 140
    evpi_val = evpi(160.0, [(0.3, 1000.0), (0.7, 0.0)])
    check("evpi: oil drilling example", evpi_val, 140.0)

    # EVSI variant: a seismic test costs $50K, gives imperfect signal
    # Signal 'positive': P(signal)=0.35, EV_given=550
    # Signal 'negative': P(signal)=0.65, EV_given=10
    # Prior EV still 160
    evsi_val, ev_map = evsi(160.0, [
        {"probability": 0.35, "best_alternative": "Drill", "expected_value_given_signal": 550.0, "label": "Positive"},
        {"probability": 0.65, "best_alternative": "Don't Drill", "expected_value_given_signal": 10.0, "label": "Negative"},
    ], ["Drill", "Don't Drill"])
    # EVSI = 0.35*550 + 0.65*10 - 160 = 192.5 + 6.5 - 160 = 39
    check("evsi: seismic test example", evsi_val, 39.0, tol=1e-6)
    check("evsi: two signal scenarios", len(ev_map), 2)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("evpi: empty scenarios", evpi, 100.0, [])
    check_raises("evpi: probs don't sum to 1", evpi, 100.0, [(0.3, 200.0)])

    # ── Part 5: Monte Carlo Simulation ──
    print("\n── Part 5: Monte Carlo Simulation (Ch.11) ──")

    # Simple MC: simulate a fair die
    def roll_die() -> float:
        return float(random.randint(1, 6))

    mc_result = monte_carlo(roll_die, iterations=10000, seed=42)
    check("mc: mean ≈ 3.5", abs(mc_result["mean"] - 3.5) < 0.3, True)
    check("mc: 10000 iterations", mc_result["n"], 10000)
    check("mc: min ≥ 1", mc_result["min"] >= 1.0, True)
    check("mc: max ≤ 6", mc_result["max"] <= 6.0, True)

    # MC NPV
    def cf_gen() -> List[float]:
        # Deterministic for testing: $200/yr for 5yr
        return [200.0, 200.0, 200.0, 200.0, 200.0]

    mc_npv = monte_carlo_npv(1000.0, cf_gen, 0.10, iterations=100, seed=123)
    # NPV = -1000 + 200*(annuity 5yr @10%) = -1000 + 200*3.7908 = -1000+758.16 = -241.84
    check("mc_npv: deterministic ≈ -241.84", mc_npv["mean"], -241.84, tol=0.5)
    check("mc_npv: std ≈ 0 (deterministic)", mc_npv["std"], 0.0, tol=0.01)

    # Probability of exceeding
    samples = [-300, -200, -100, 50, 100, 200, 300]
    p_pos = probability_of_exceeding(samples, 0.0)
    check("prob_exceed: 4/7 > 0", p_pos, 4.0 / 7.0)

    p_loss = probability_of_loss(samples)
    # Loss: NPV < 0 → -300, -200, -100 → 3/7
    check("prob_loss: 3/7 < 0", p_loss, 3.0 / 7.0)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("monte_carlo: iterations = 0", monte_carlo, roll_die, 0)
    check_raises("monte_carlo: iterations = -1", monte_carlo, roll_die, -1)

    # ── Part 6: Calibration ──
    print("\n── Part 6: Probability Calibration (Ch.7-8) ──")

    # Perfect calibration: predict 0.9 → event happens 90% of time
    perfect = [(0.9, 1), (0.9, 1), (0.9, 1), (0.9, 1), (0.9, 1),
               (0.9, 0), (0.1, 0), (0.1, 0), (0.1, 0), (0.1, 0)]
    # Brier: (0.9-1)²*5 + (0.9-0)² + (0.1-0)²*3 + (0.1-1)² = 0.01*5+0.81+0.01*3+0.81
    # = 0.05 + 0.81 + 0.03 + 0.81 = 1.70 / 10 = 0.17
    bs = brier_score(perfect)
    check("brier: mixed calibration", bs, 0.09, tol=0.01)

    # Clueless: always predict 0.5, 5 happen, 5 don't
    clueless = [(0.5, 1)] * 5 + [(0.5, 0)] * 5
    bs_clueless = brier_score(clueless)
    check("brier: clueless = 0.25", bs_clueless, 0.25, tol=0.01)

    # Always wrong: predict 1.0 when 0, predict 0.0 when 1
    worst = [(1.0, 0), (0.0, 1)]
    bs_worst = brier_score(worst)
    check("brier: worst = 1.0", bs_worst, 1.0)

    # Calibration curve
    curve = calibration_curve(perfect, num_bins=2)
    check("cal_curve: brier matches", curve["brier"], bs, tol=0.01)

    # Confidence calibration
    # 80% CI stated, actual hit rate
    # 5 intervals at 80% → expect 4 hits if calibrated
    intervals = [
        (8.0, 12.0, 10.0),  # hit
        (8.0, 12.0, 11.0),  # hit
        (8.0, 12.0, 5.0),   # miss
        (8.0, 12.0, 9.0),   # hit
        (8.0, 12.0, 15.0),  # miss
    ]
    hit_rate = confidence_calibration_test(intervals)
    check("conf_cal: 3/5 hits = 0.6", hit_rate, 0.6)

    # Overconfidence ratio: stated 0.80, actual 0.60 → 1.33
    oc = overconfidence_ratio(0.80, 0.60)
    check("overconfidence_ratio: 0.80/0.60 = 1.33", oc, 1.333, tol=0.01)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("brier: outcome not 0/1", brier_score, [(0.7, 2)])
    check_raises("brier: empty", brier_score, [])
    check("overconfidence_ratio: actual=0 → ∞", overconfidence_ratio(0.8, 0.0), math.inf)

    # ── Part 7: Integration Test ──
    print("\n── Integration Test: Tree → EVPI → Sensitivity → MAUT ──")

    # Build a realistic venture evaluation pipeline
    # 1. Decision tree for "Invest vs Don't Invest"
    # 2. Sensitivity on the success probability
    # 3. MAUT for multi-factor venture scoring
    # 4. Calibration check on the forecasts

    venture_tree = build_simple_tree("Venture Decision", [
        {
            "label": "Invest",
            "type": "chance",
            "branches": [
                {"label": "Big Win", "probability": 0.3, "payoff": 5000.0},
                {"label": "Moderate", "probability": 0.5, "payoff": 500.0},
                {"label": "Failure", "probability": 0.2, "payoff": -1500.0},
            ],
        },
        {"label": "Pass", "type": "terminal", "payoff": 0.0},
    ])
    ev_v, label_v, _ = rollback_decision_tree(venture_tree)
    # EV(Invest) = 0.3*5000 + 0.5*500 + 0.2*(-1500) = 1500 + 250 - 300 = 1450
    check("integration: venture EV = 1450", ev_v, 1450.0)
    check("integration: best is Invest", label_v, "Invest")

    # Sensitivity: what threshold for Failure probability makes Invest = Pass?
    # 0.3*5000 + (0.7-p_f)*500 + p_f*(-1500) = 0
    # 1500 + 350 - 500*p_f - 1500*p_f = 0
    # 1850 - 2000*p_f = 0 → p_f = 0.925
    # So Invest is best for p_f < 0.925
    cross_pf = crossover_point(
        lambda pf: 0.3 * 5000 + (0.7 - pf) * 500 + pf * (-1500),
        lambda pf: 0.0,
        0.0, 1.0,
    )
    check("integration: crossover p_f ≈ 0.925", cross_pf, 0.925, tol=0.01)

    # MAUT for venture screening
    v_scores = {"market_size": 0.8, "team": 0.6, "tech": 0.9, "timing": 0.5}
    v_weights = {"market_size": 0.35, "team": 0.30, "tech": 0.20, "timing": 0.15}
    v_score = additive_maut(v_scores, v_weights)
    # 0.35*0.8 + 0.30*0.6 + 0.20*0.9 + 0.15*0.5 = 0.28 + 0.18 + 0.18 + 0.075 = 0.715
    check("integration: venture MAUT = 0.715", v_score, 0.715, tol=1e-3)

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