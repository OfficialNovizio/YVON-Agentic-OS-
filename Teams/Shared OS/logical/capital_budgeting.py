#!/usr/bin/env python3
"""
Capital Budgeting & Corporate Finance — Formula Library
========================================================
Source: Brealey, Myers & Allen, *Principles of Corporate Finance*
        (12th Ed., McGraw-Hill, 2017 — International Edition)

This module implements every core formula from the textbook as discrete,
self-tested Python functions. Each function carries its chapter/section
citation and handles edge cases explicitly.

Routes per Playbook §8.2:
  Part 1-2: Route A (math script — formulas + numeric assertions)
  Part 3-4: Route A (math script — portfolio math, CAPM)
  Part 5-7: Route A (math script — WACC, DCF, capital structure)
  Part 8:   Route B/C (rule + hybrid — break-evens, sensitivity)

Design rules:
  - Every function validates inputs before computing.
  - No function returns NaN or Inf — bad inputs raise ValueError with
    a descriptive message.
  - Every function has at least one self-test with a verified expected output.
  - Numerical tolerance: 1e-10 for equality, 1e-6 for convergence.
  - All rates are expressed as decimals (0.10 = 10%), never percentages.
  - All monetary values are floats in consistent units.
"""

from __future__ import annotations
import math
import json
import sys
from typing import List, Tuple, Optional, Dict, Union, Callable

# ── Numerical constants ────────────────────────────────────────────
_TOLERANCE = 1e-10
_IRR_MAX_ITER = 1000
_IRR_TOLERANCE = 1e-8

# ── Internal helpers ────────────────────────────────────────────────

def _is_positive_number(val: float, name: str) -> None:
    """Validate that val is a non-NaN, non-Inf, non-negative number."""
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val):
        raise ValueError(f"{name} is NaN")
    if math.isinf(val):
        raise ValueError(f"{name} is infinite")
    if val < 0:
        raise ValueError(f"{name} must be non-negative, got {val}")


def _is_finite(val: float, name: str) -> None:
    """Validate that val is finite and not NaN."""
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val):
        raise ValueError(f"{name} is NaN")
    if math.isinf(val):
        raise ValueError(f"{name} is infinite")


def _require_non_empty(seq: list, name: str) -> None:
    """Validate sequence is non-empty."""
    if not seq:
        raise ValueError(f"{name} must be non-empty")


def _mean(values: List[float]) -> float:
    """Arithmetic mean, assumes validated inputs."""
    return sum(values) / len(values)


def _npv_raw(cashflows: List[float], rate: float) -> float:
    """NPV without sign convention — Σ CF_t / (1+r)^t, t from 0..n."""
    _require_non_empty(cashflows, "cashflows")
    pv = 0.0
    for t, cf in enumerate(cashflows):
        pv += cf / (1.0 + rate) ** t
    return pv


# ══════════════════════════════════════════════════════════════════════
# PART 1: TIME VALUE OF MONEY
# Source: Brealey & Myers, Chapter 2 ("How to Calculate Present Values")
# ══════════════════════════════════════════════════════════════════════

def future_value(pv: float, rate: float, periods: int) -> float:
    """
    FV = PV × (1 + r)^n
    Ch.2, §2.1 (Future Values and Compound Interest)

    Args:
        pv:       Present value (non-negative)
        rate:     Periodic interest rate in decimal form (e.g., 0.10 = 10%)
        periods:  Number of compounding periods (non-negative integer)

    Returns:
        Future value as float.

    Edge cases:
        - periods = 0  → returns pv unchanged
        - rate = 0     → returns pv unchanged
        - pv = 0       → returns 0
        - Negative rate is allowed (deflation/devaluation) but must be > -1.0
          (a rate ≤ -100% would turn the value negative or zero in one period)
    """
    _is_positive_number(pv, "pv")
    _is_finite(rate, "rate")
    if not isinstance(periods, int):
        raise TypeError(f"periods must be an integer, got {type(periods).__name__}")
    if periods < 0:
        raise ValueError(f"periods must be non-negative, got {periods}")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0 (cannot reduce value by ≥100% per period), got {rate}")

    return pv * (1.0 + rate) ** periods


def present_value(fv: float, rate: float, periods: int) -> float:
    """
    PV = FV / (1 + r)^n
    Ch.2, §2.1 (Discounting)

    Args:
        fv:       Future value (non-negative)
        rate:     Periodic discount rate in decimal form
        periods:  Number of periods (non-negative integer)

    Edge cases:
        - periods = 0  → returns fv
        - rate = 0     → returns fv
        - fv = 0       → returns 0
        - rate = -1.0  → division by (1+rate)=0; raises ValueError
    """
    _is_positive_number(fv, "fv")
    _is_finite(rate, "rate")
    if not isinstance(periods, int):
        raise TypeError(f"periods must be an integer, got {type(periods).__name__}")
    if periods < 0:
        raise ValueError(f"periods must be non-negative, got {periods}")
    if rate <= -1.0:
        raise ValueError(
            f"rate must be > -1.0; at rate={rate} the discount factor (1+r) is ≤ 0"
        )

    denominator = (1.0 + rate) ** periods
    if denominator == 0.0:
        raise ValueError(f"Discount factor is zero — rate={rate}, periods={periods}")
    return fv / denominator


def annuity_pv(cashflow: float, rate: float, periods: int) -> float:
    """
    PV = C × [1 - (1 + r)^(-n)] / r
    Ch.2, §2.2 (Looking for Shortcuts — Perpetuities and Annuities)

    Present value of a level annuity (equal payments at end of each period).

    Args:
        cashflow:  Constant periodic payment (non-negative)
        rate:      Periodic discount rate (decimal)
        periods:   Number of periods (non-negative integer)

    Edge cases:
        - periods = 0 → returns 0 (no payments)
        - rate = 0   → returns cashflow × periods (undiscounted sum)
          Uses the limit: lim_{r→0} C × [1-(1+r)^(-n)]/r = C × n
        - rate = -1.0 → raises ValueError
    """
    _is_positive_number(cashflow, "cashflow")
    _is_finite(rate, "rate")
    if not isinstance(periods, int):
        raise TypeError(f"periods must be an integer, got {type(periods).__name__}")
    if periods < 0:
        raise ValueError(f"periods must be non-negative, got {periods}")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")

    if periods == 0:
        return 0.0
    if abs(rate) < _TOLERANCE:
        return cashflow * periods
    return cashflow * (1.0 - (1.0 + rate) ** (-periods)) / rate


def annuity_fv(cashflow: float, rate: float, periods: int) -> float:
    """
    FV = C × [(1 + r)^n - 1] / r
    Ch.2, §2.2

    Future value of a level annuity.

    Edge cases:
        - periods = 0 → returns 0
        - rate = 0   → returns cashflow × periods
    """
    _is_positive_number(cashflow, "cashflow")
    _is_finite(rate, "rate")
    if not isinstance(periods, int):
        raise TypeError(f"periods must be an integer, got {type(periods).__name__}")
    if periods < 0:
        raise ValueError(f"periods must be non-negative, got {periods}")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")

    if periods == 0:
        return 0.0
    if abs(rate) < _TOLERANCE:
        return cashflow * periods
    return cashflow * ((1.0 + rate) ** periods - 1.0) / rate


def perpetuity_pv(cashflow: float, rate: float) -> float:
    """
    PV = C / r
    Ch.2, §2.2 (Perpetuities)

    Present value of a perpetuity (level payment forever).

    Edge cases:
        - rate = 0     → raises ValueError (infinite value)
        - rate < 0     → raises ValueError (negative/infinite value)
    """
    _is_positive_number(cashflow, "cashflow")
    _is_finite(rate, "rate")
    if rate <= _TOLERANCE:
        raise ValueError(
            f"rate must be > 0 for a perpetuity (rate={rate} → infinite value)"
        )
    return cashflow / rate


def growing_perpetuity_pv(cashflow: float, rate: float, growth: float) -> float:
    """
    PV = C₁ / (r - g)
    Ch.2, §2.2 (Growing Perpetuities — the Gordon Growth formula)

    Present value of a perpetuity growing at constant rate g.
    C₁ is the cash flow expected one period from now.
    Requires r > g (otherwise the value is infinite or negative).

    Args:
        cashflow:  Cash flow one period from now (C₁), non-negative
        rate:      Discount rate (decimal)
        growth:    Perpetual growth rate (decimal)

    Edge cases:
        - g ≥ r → raises ValueError (value explodes or goes negative)
        - g < -1.0 → cash flows would go negative eventually → raises ValueError
    """
    _is_positive_number(cashflow, "cashflow")
    _is_finite(rate, "rate")
    _is_finite(growth, "growth")
    if growth <= -1.0:
        raise ValueError(
            f"growth must be > -1.0 (at g={growth}, cash flows become negative)"
        )
    if rate - growth <= _TOLERANCE:
        raise ValueError(
            f"rate ({rate}) must exceed growth ({growth}) by a positive margin; "
            f"otherwise the perpetuity has infinite value"
        )
    return cashflow / (rate - growth)


def effective_annual_rate(nominal_rate: float, compounding_periods: int) -> float:
    """
    EAR = (1 + r_nom / m)^m - 1
    Ch.2, §2.3 (Compound Interest and Present Values)

    Converts a nominal annual rate with m compounding periods per year
    into the effective annual rate.

    Args:
        nominal_rate:          Annual nominal rate in decimal form
        compounding_periods:  Number of compounding periods per year (m)

    Edge cases:
        - compounding_periods = 0  → raises ValueError
        - compounding_periods = 1  → returns nominal_rate (annual compounding)
        - Very large m → approaches continuous compounding: e^r_nom - 1
    """
    _is_finite(nominal_rate, "nominal_rate")
    if not isinstance(compounding_periods, int):
        raise TypeError(
            f"compounding_periods must be an integer, got {type(compounding_periods).__name__}"
        )
    if compounding_periods <= 0:
        raise ValueError(f"compounding_periods must be ≥ 1, got {compounding_periods}")
    if nominal_rate <= -compounding_periods:
        raise ValueError(
            f"nominal_rate must be > -{compounding_periods} "
            f"for {compounding_periods} compounding periods"
        )
    return (1.0 + nominal_rate / compounding_periods) ** compounding_periods - 1.0


def continuous_compounding_fv(pv: float, rate: float, years: float) -> float:
    """
    FV = PV × e^(r × t)
    Ch.2, §2.3

    Future value with continuous compounding.

    Edge cases:
        - years = 0  → returns pv
        - rate = 0   → returns pv
    """
    _is_positive_number(pv, "pv")
    _is_finite(rate, "rate")
    _is_finite(years, "years")
    if years < 0:
        raise ValueError(f"years must be non-negative, got {years}")
    return pv * math.exp(rate * years)


# ══════════════════════════════════════════════════════════════════════
# PART 2: NPV & INVESTMENT DECISION RULES
# Source: Brealey & Myers, Chapter 5 ("Net Present Value and Other
#         Investment Criteria"), Chapter 6 ("Making Investment Decisions
#         with the Net Present Value Rule")
# ══════════════════════════════════════════════════════════════════════

def npv(cashflows: List[float], rate: float) -> float:
    """
    NPV = Σ CF_t / (1 + r)^t   for t = 0, 1, ..., n
    Ch.5, §5.1 (A Review of the Basics)

    CF₀ is typically negative (the initial investment).
    A positive NPV means the project creates value.

    Args:
        cashflows:  List of cash flows starting at t=0 (CF₀, CF₁, ..., CFₙ)
        rate:       Discount rate in decimal form

    Edge cases:
        - Empty cashflows → raises ValueError
        - rate = -1.0    → raises ValueError
        - rate < -1.0    → raises ValueError
    """
    _require_non_empty(cashflows, "cashflows")
    _is_finite(rate, "rate")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")

    # Validate each cashflow
    for i, cf in enumerate(cashflows):
        _is_finite(cf, f"cashflows[{i}]")

    pv = 0.0
    for t, cf in enumerate(cashflows):
        pv += cf / (1.0 + rate) ** t
    return pv


def npv_decision(npv_value: float) -> str:
    """
    Decision rule for NPV.
    Ch.5, §5.1

    Returns one of: 'ACCEPT', 'REJECT', 'INDIFFERENT'
    """
    if abs(npv_value) < _TOLERANCE:
        return "INDIFFERENT"
    return "ACCEPT" if npv_value > 0 else "REJECT"


def irr(cashflows: List[float], guess: float = 0.10) -> float:
    """
    IRR = the discount rate r such that NPV = 0.
    Ch.5, §5.2 (Internal Rate of Return)

    Uses the Newton-Raphson method.

    Args:
        cashflows:  List starting with the initial investment (usually negative)
        guess:      Starting guess for IRR (default 0.10 = 10%)

    Returns:
        IRR as a decimal.

    Edge cases:
        - All positive or all negative cashflows → raises ValueError (no root)
        - Multiple sign changes → may converge to any one root; warning printed
        - Non-convergence after max iterations → raises ValueError

    IMPORTANT — IRR Traps (Ch.5, §5.2, pp.117-119):
      1. Multiple IRRs: when cash flows change sign more than once,
         there can be as many IRRs as sign changes. Prefer NPV.
      2. Mutually exclusive projects: IRR can rank projects incorrectly
         when they differ in scale or timing. Always also compute NPV.
      3. Lending vs borrowing: for projects where CF₀ > 0 (you receive
         money first), accept if IRR < cost of capital, not >.
    """
    _require_non_empty(cashflows, "cashflows")
    if len(cashflows) < 2:
        raise ValueError("Need at least 2 cash flows to compute IRR")

    for i, cf in enumerate(cashflows):
        _is_finite(cf, f"cashflows[{i}]")

    # Detect sign-change count for multiple-IRR warning
    signs = [1 if cf > _TOLERANCE else (-1 if cf < -_TOLERANCE else 0) for cf in cashflows]
    sign_changes = sum(1 for i in range(1, len(signs)) if signs[i] != 0 and signs[i-1] != 0 and signs[i] != signs[i-1])

    if sign_changes == 0:
        raise ValueError(
            "All cashflows have the same sign — IRR is undefined (no root exists)"
        )

    # Newton-Raphson
    rate = guess
    for iteration in range(_IRR_MAX_ITER):
        npv_val = 0.0
        dnpv = 0.0  # derivative of NPV w.r.t. rate
        for t, cf in enumerate(cashflows):
            denom = (1.0 + rate) ** t
            npv_val += cf / denom
            if t > 0:
                dnpv -= t * cf / ((1.0 + rate) ** (t + 1))

        if abs(npv_val) < _IRR_TOLERANCE:
            # Warn on multiple IRRs
            if sign_changes > 1:
                print(
                    f"[WARNING] {sign_changes} sign changes detected in cashflows — "
                    f"multiple IRRs may exist (Ch.5, §5.2). "
                    f"Converged to IRR = {rate:.6f} ({rate*100:.2f}%). "
                    f"Verify with NPV before deciding.",
                    file=sys.stderr,
                )
            return rate

        if abs(dnpv) < _TOLERANCE:
            raise ValueError(
                f"IRR derivative near zero at rate={rate}; Newton-Raphson stalled. "
                f"Try a different guess."
            )
        rate = rate - npv_val / dnpv

    raise ValueError(
        f"IRR did not converge after {_IRR_MAX_ITER} iterations. "
        f"Last guess: {rate:.6f}, NPV: {npv_val:.6f}"
    )


def irr_decision(irr_value: float, cost_of_capital: float, cf0_is_investment: bool = True) -> str:
    """
    Decision rule for IRR.
    Ch.5, §5.2

    Args:
        irr_value:           Computed IRR (decimal)
        cost_of_capital:     Firm's cost of capital / hurdle rate (decimal)
        cf0_is_investment:   True if CF₀ < 0 (normal investment). False if CF₀ > 0
                             (borrowing/lending — accept when IRR < cost of capital).

    Returns: 'ACCEPT', 'REJECT', or 'INDIFFERENT'
    """
    if abs(irr_value - cost_of_capital) < _TOLERANCE:
        return "INDIFFERENT"
    if cf0_is_investment:
        return "ACCEPT" if irr_value > cost_of_capital else "REJECT"
    else:
        return "ACCEPT" if irr_value < cost_of_capital else "REJECT"


def mirr(cashflows: List[float], finance_rate: float, reinvest_rate: float) -> float:
    """
    MIRR — Modified Internal Rate of Return
    Ch.5, §5.2 (p.119)

    MIRR avoids the multiple-IRR problem by assuming:
      - Negative cashflows are financed at `finance_rate`
      - Positive cashflows are reinvested at `reinvest_rate`

    Formula:
      PV(costs) at finance_rate = FV(inflows) at reinvest_rate discounted at MIRR

    MIRR = (FV_pos / PV_neg)^(1/n) - 1

    Where:
      PV_neg = Σ negative CF_t / (1 + finance_rate)^t  (present value of costs)
      FV_pos = Σ positive CF_t × (1 + reinvest_rate)^(n-t)  (future value of inflows)
      n = number of periods

    Edge cases:
        - No negative cashflows → all profit; MIRR is undefined economically
        - No positive cashflows → all cost; MIRR is undefined economically
        - finance_rate = -1.0 or reinvest_rate = -1.0 → raises ValueError
    """
    _require_non_empty(cashflows, "cashflows")
    if len(cashflows) < 2:
        raise ValueError("Need at least 2 cash flows to compute MIRR")
    _is_finite(finance_rate, "finance_rate")
    _is_finite(reinvest_rate, "reinvest_rate")
    if finance_rate <= -1.0:
        raise ValueError(f"finance_rate must be > -1.0, got {finance_rate}")
    if reinvest_rate <= -1.0:
        raise ValueError(f"reinvest_rate must be > -1.0, got {reinvest_rate}")

    n = len(cashflows) - 1  # number of periods after t=0
    pv_neg = 0.0
    fv_pos = 0.0
    has_neg = False
    has_pos = False

    for t, cf in enumerate(cashflows):
        _is_finite(cf, f"cashflows[{t}]")
        if cf < -_TOLERANCE:
            has_neg = True
            pv_neg += cf / (1.0 + finance_rate) ** t
        elif cf > _TOLERANCE:
            has_pos = True
            fv_pos += cf * (1.0 + reinvest_rate) ** (n - t)
        # cf ≈ 0 contributes nothing

    if not has_neg:
        raise ValueError("No negative cashflows — MIRR is undefined (pure profit stream)")
    if not has_pos:
        raise ValueError("No positive cashflows — MIRR is undefined (pure cost stream)")
    if abs(pv_neg) < _TOLERANCE:
        raise ValueError("PV of costs is zero — MIRR is undefined")

    mirr_val = (fv_pos / abs(pv_neg)) ** (1.0 / n) - 1.0
    return mirr_val


def payback_period(cashflows: List[float]) -> float:
    """
    Payback Period — number of periods to recover initial investment.
    Ch.5, §5.3 (Payback)

    Assumes CF₀ is the initial investment (negative). Returns the number
    of periods until cumulative cashflows turn non-negative.

    Returns:
        Payback period as float (fractional years/periods).

    Edge cases:
        - Never pays back → returns math.inf
        - No initial investment → returns 0
    """
    _require_non_empty(cashflows, "cashflows")
    if cashflows[0] >= -_TOLERANCE:
        return 0.0  # no initial investment or it's positive

    cumulative = 0.0
    for t, cf in enumerate(cashflows):
        _is_finite(cf, f"cashflows[{t}]")
        cumulative += cf
        if cumulative >= 0.0:
            # Fractional interpolation to find exact crossover point
            if t > 0 and cf > 0:
                prev_cum = cumulative - cf
                fraction = abs(prev_cum) / cf if cf != 0 else 0.0
                return t - 1 + fraction
            return float(t)

    return math.inf  # never pays back


def discounted_payback(cashflows: List[float], rate: float) -> float:
    """
    Discounted Payback — as above but using discounted cashflows.
    Ch.5, §5.3

    Edge cases:
        - Never pays back → returns math.inf
    """
    _require_non_empty(cashflows, "cashflows")
    _is_finite(rate, "rate")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")

    discounted = [cf / (1.0 + rate) ** t for t, cf in enumerate(cashflows)]
    return payback_period(discounted)


def profitability_index(cashflows: List[float], rate: float) -> float:
    """
    PI = PV of future cashflows / |Initial Investment|
    Ch.5, §5.4 (Profitability Index)

    PI > 1.0 → ACCEPT
    PI = 1.0 → INDIFFERENT (NPV = 0)
    PI < 1.0 → REJECT

    Args:
        cashflows:  List with CF₀ as the initial investment (negative)
        rate:       Discount rate

    Edge cases:
        - CF₀ ≥ 0 → raises ValueError (need an initial investment)
        - No future cashflows → raises ValueError
    """
    _require_non_empty(cashflows, "cashflows")
    if len(cashflows) < 2:
        raise ValueError("Need at least 2 cash flows (initial investment + at least 1 future flow)")
    _is_finite(rate, "rate")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")

    if cashflows[0] >= -_TOLERANCE:
        raise ValueError(f"CF₀ must be negative (initial investment), got {cashflows[0]}")

    pv_future = _npv_raw(cashflows[1:], rate)
    return pv_future / abs(cashflows[0])


def equivalent_annual_cost(pv_costs: float, rate: float, life_years: int, salvage_value: float = 0.0) -> float:
    """
    EAC = PV of costs / Annuity Factor
    Ch.6, §6.3 (Equivalent Annual Cost)

    Converts a lumpy stream of costs into an equivalent annual amount.
    Used for comparing projects with different lifetimes.

    EAC = (PV_costs - PV_salvage) / [(1 - (1+r)^(-n)) / r]

    Edge cases:
        - life_years = 0  → raises ValueError
        - rate = 0        → EAC = (costs - salvage) / life_years
        - rate = -1.0     → raises ValueError
    """
    _is_positive_number(pv_costs, "pv_costs")
    _is_finite(rate, "rate")
    if not isinstance(life_years, int):
        raise TypeError(f"life_years must be an integer, got {type(life_years).__name__}")
    if life_years <= 0:
        raise ValueError(f"life_years must be ≥ 1, got {life_years}")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")

    pv_salvage = present_value(salvage_value, rate, life_years) if salvage_value > 0 else 0.0
    net_pv_costs = pv_costs - pv_salvage
    annuity_factor = annuity_pv(1.0, rate, life_years)

    if annuity_factor < _TOLERANCE:
        raise ValueError(f"Annuity factor is zero for rate={rate}, life={life_years}")
    return net_pv_costs / annuity_factor


# ══════════════════════════════════════════════════════════════════════
# PART 3: RISK & RETURN
# Source: Brealey & Myers, Chapter 7 ("Introduction to Risk and Return"),
#         Chapter 8 ("Portfolio Theory and the Capital Asset Pricing Model")
# ══════════════════════════════════════════════════════════════════════

def expected_return(returns: List[float], probabilities: Optional[List[float]] = None) -> float:
    """
    E(R) = Σ p_i × R_i
    Ch.7, §7.1

    Args:
        returns:       List of returns (can be decimals, e.g., 0.10 = 10%)
        probabilities: Optional list of probabilities (must sum to 1.0).
                       If None, assumes equally likely outcomes.

    Edge cases:
        - Empty list → raises ValueError
        - Probabilities not summing to 1.0 → raises ValueError
        - Mismatched lengths → raises ValueError
    """
    _require_non_empty(returns, "returns")
    for i, r in enumerate(returns):
        _is_finite(r, f"returns[{i}]")

    if probabilities is None:
        return _mean(returns)

    if len(probabilities) != len(returns):
        raise ValueError(
            f"Length mismatch: {len(returns)} returns vs {len(probabilities)} probabilities"
        )
    for i, p in enumerate(probabilities):
        if p < 0 or p > 1:
            raise ValueError(f"probabilities[{i}] = {p} — must be in [0, 1]")

    total_p = sum(probabilities)
    if abs(total_p - 1.0) > 1e-6:
        raise ValueError(f"Probabilities sum to {total_p}, must sum to 1.0")

    return sum(r * p for r, p in zip(returns, probabilities))


def variance(returns: List[float], probabilities: Optional[List[float]] = None, sample: bool = False) -> float:
    """
    σ² = Σ p_i × (R_i - E(R))²
    Ch.7, §7.1

    Args:
        returns:       List of returns
        probabilities: Optional probabilities (or None for equal weight)
        sample:        If True, divides by (n-1) for sample variance (when
                       probabilities is None). Ignored if probabilities given.

    Returns:
        Variance. Non-negative by construction.

    Edge cases:
        - Single data point with sample=True → raises ValueError (n-1=0)
    """
    _require_non_empty(returns, "returns")
    for i, r in enumerate(returns):
        _is_finite(r, f"returns[{i}]")

    exp_ret = expected_return(returns, probabilities)
    n = len(returns)

    if probabilities is not None:
        return sum(p * (r - exp_ret) ** 2 for r, p in zip(returns, probabilities))
    else:
        deviations = sum((r - exp_ret) ** 2 for r in returns)
        if sample:
            if n < 2:
                raise ValueError("Need at least 2 data points for sample variance (n-1 = 0)")
            return deviations / (n - 1)
        return deviations / n


def std_dev(returns: List[float], probabilities: Optional[List[float]] = None, sample: bool = False) -> float:
    """
    σ = sqrt(σ²)
    Ch.7, §7.1

    Standard deviation of returns.
    """
    var = variance(returns, probabilities, sample)
    if var < 0 and var > -_TOLERANCE:
        var = 0.0  # guard against floating-point negative near zero
    return math.sqrt(var)


def covariance(returns_x: List[float], returns_y: List[float], sample: bool = False) -> float:
    """
    Cov(X, Y) = Σ (R_xi - E(R_x)) × (R_yi - E(R_y)) / n
    Ch.7, §7.2

    For sample covariance, divides by (n-1).

    Edge cases:
        - Unequal lengths → raises ValueError
        - Fewer than 2 points with sample=True → raises ValueError
    """
    _require_non_empty(returns_x, "returns_x")
    _require_non_empty(returns_y, "returns_y")
    if len(returns_x) != len(returns_y):
        raise ValueError(
            f"Length mismatch: returns_x has {len(returns_x)}, returns_y has {len(returns_y)}"
        )
    n = len(returns_x)
    if sample and n < 2:
        raise ValueError(f"Need at least 2 data points for sample covariance, got {n}")

    mean_x = _mean(returns_x)
    mean_y = _mean(returns_y)
    cov_sum = sum((x - mean_x) * (y - mean_y) for x, y in zip(returns_x, returns_y))
    divisor = (n - 1) if sample else n
    return cov_sum / divisor


def correlation(returns_x: List[float], returns_y: List[float]) -> float:
    """
    ρ_xy = Cov(X, Y) / (σ_x × σ_y)
    Ch.7, §7.2

    Returns correlation coefficient in [-1, 1].

    Edge cases:
        - σ_x = 0 or σ_y = 0 → raises ValueError (no variability → correlation undefined)
    """
    cov_val = covariance(returns_x, returns_y)
    sigma_x = std_dev(returns_x)
    sigma_y = std_dev(returns_y)

    if sigma_x < _TOLERANCE:
        raise ValueError("σ_x = 0 — all values identical, correlation is undefined")
    if sigma_y < _TOLERANCE:
        raise ValueError("σ_y = 0 — all values identical, correlation is undefined")

    return cov_val / (sigma_x * sigma_y)


def portfolio_return(weights: List[float], returns: List[float]) -> float:
    """
    R_p = Σ w_i × R_i
    Ch.8, §8.1

    Args:
        weights:  Portfolio weights (must sum to 1.0)
        returns:  Expected returns of each asset

    Edge cases:
        - Weights don't sum to 1.0 → raises ValueError
        - Mismatched lengths → raises ValueError
    """
    _require_non_empty(weights, "weights")
    _require_non_empty(returns, "returns")
    if len(weights) != len(returns):
        raise ValueError(
            f"Length mismatch: {len(weights)} weights vs {len(returns)} returns"
        )

    total_w = sum(weights)
    if abs(total_w - 1.0) > 1e-6:
        raise ValueError(f"Weights sum to {total_w}, must sum to 1.0")
    for w in weights:
        if w < -_TOLERANCE:
            raise ValueError(f"Weight {w} is negative — short selling not handled by default. "
                             f"Set allow_shorts=True to permit.")
    return sum(w * r for w, r in zip(weights, returns))


def portfolio_variance_2asset(
    w1: float, w2: float,
    sigma1: float, sigma2: float,
    rho12: float
) -> float:
    """
    σ²_p = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρ₁₂σ₁σ₂
    Ch.8, §8.1

    Variance of a 2-asset portfolio.

    Args:
        w1, w2:   Weights (must sum to 1.0)
        sigma1:   Standard deviation of asset 1
        sigma2:   Standard deviation of asset 2
        rho12:    Correlation coefficient in [-1, 1]

    Edge cases:
        - Weights not summing to 1.0 → raises ValueError
        - rho outside [-1, 1] → raises ValueError
    """
    _is_positive_number(sigma1, "sigma1")
    _is_positive_number(sigma2, "sigma2")
    _is_finite(rho12, "rho12")
    if rho12 < -1.0 - _TOLERANCE or rho12 > 1.0 + _TOLERANCE:
        raise ValueError(f"Correlation ρ must be in [-1, 1], got {rho12}")
    rho12 = max(-1.0, min(1.0, rho12))  # clamp to [-1, 1]

    if abs(w1 + w2 - 1.0) > 1e-6:
        raise ValueError(f"Weights must sum to 1.0, got w1={w1}, w2={w2} (sum={w1+w2})")

    return (w1 ** 2 * sigma1 ** 2
            + w2 ** 2 * sigma2 ** 2
            + 2 * w1 * w2 * rho12 * sigma1 * sigma2)


def portfolio_variance_nasset(
    weights: List[float],
    sigmas: List[float],
    corr_matrix: List[List[float]]
) -> float:
    """
    σ²_p = Σ_i Σ_j w_i w_j σ_i σ_j ρ_ij
    Ch.8, §8.1

    Variance of an n-asset portfolio.

    Args:
        weights:     List of weights (must sum to 1.0)
        sigmas:      List of standard deviations for each asset
        corr_matrix: n×n correlation matrix (ρ_ii must be 1.0)

    Edge cases:
        - Non-square or mismatched correlation matrix → raises ValueError
        - Diagonal of corr_matrix not all 1.0 → raises ValueError
        - Result < 0 (numerical noise) → clamped to 0
    """
    _require_non_empty(weights, "weights")
    _require_non_empty(sigmas, "sigmas")
    n = len(weights)

    if len(sigmas) != n:
        raise ValueError(f"Length mismatch: {n} weights vs {len(sigmas)} sigmas")
    if len(corr_matrix) != n:
        raise ValueError(f"Correlation matrix has {len(corr_matrix)} rows, expected {n}")
    for i, row in enumerate(corr_matrix):
        if len(row) != n:
            raise ValueError(f"Corr matrix row {i} has {len(row)} cols, expected {n}")
        if abs(row[i] - 1.0) > 1e-6:
            raise ValueError(f"Corr matrix diagonal[{i}] = {row[i]}, must be 1.0")

    port_var = 0.0
    for i in range(n):
        for j in range(n):
            port_var += weights[i] * weights[j] * sigmas[i] * sigmas[j] * corr_matrix[i][j]

    if port_var < 0 and port_var > -_TOLERANCE:
        port_var = 0.0
    return port_var


# ══════════════════════════════════════════════════════════════════════
# PART 4: CAPITAL ASSET PRICING MODEL (CAPM)
# Source: Brealey & Myers, Chapter 8
# ══════════════════════════════════════════════════════════════════════

def beta_cov(cov_with_market: float, var_market: float) -> float:
    """
    β_i = Cov(R_i, R_m) / Var(R_m)
    Ch.8, §8.2 (Beta as a Measure of Risk)

    Edge cases:
        - var_market = 0 → raises ValueError (market has no variability)
    """
    _is_finite(cov_with_market, "cov_with_market")
    _is_positive_number(var_market, "var_market")
    if var_market < _TOLERANCE:
        raise ValueError("Market variance is zero — beta is undefined")
    return cov_with_market / var_market


def beta_regression(stock_returns: List[float], market_returns: List[float]) -> float:
    """
    Compute β from raw return series using:
    β = Cov(R_s, R_m) / Var(R_m)
    Ch.8, §8.2

    Uses sample statistics (n-1 denominator for both covariance and variance).
    """
    cov_sm = covariance(stock_returns, market_returns, sample=True)
    var_m = variance(market_returns, sample=True)
    return beta_cov(cov_sm, var_m)


def capm(risk_free_rate: float, beta: float, market_return: float) -> float:
    """
    E(R_i) = R_f + β_i × (E(R_m) - R_f)
    Ch.8, §8.2

    The security market line. Returns the expected (required) return on asset i.

    Args:
        risk_free_rate:  R_f in decimal form
        beta:            β_i — systematic risk of asset i
        market_return:   E(R_m) — expected market return

    Edge cases:
        - beta < 0 accepted (negative-beta assets exist, e.g., gold sometimes)
        - market_return < risk_free_rate accepted (negative market risk premium is possible)
    """
    _is_finite(risk_free_rate, "risk_free_rate")
    _is_finite(beta, "beta")
    _is_finite(market_return, "market_return")
    return risk_free_rate + beta * (market_return - risk_free_rate)


def market_risk_premium(market_return: float, risk_free_rate: float) -> float:
    """
    MRP = E(R_m) - R_f
    Ch.8, §8.2
    """
    _is_finite(market_return, "market_return")
    _is_finite(risk_free_rate, "risk_free_rate")
    return market_return - risk_free_rate


def alpha(actual_return: float, expected_return: float) -> float:
    """
    Jensen's Alpha: α = R_actual - E(R)_CAPM
    Ch.8, §8.3

    Positive alpha = asset outperformed its CAPM-predicted return.
    """
    _is_finite(actual_return, "actual_return")
    _is_finite(expected_return, "expected_return")
    return actual_return - expected_return


def unlever_beta(levered_beta: float, debt: float, equity: float, tax_rate: float) -> float:
    """
    β_U = β_L / [1 + (1 - T_c) × (D/E)]
    Ch.17, §17.3 (Unlevering and Relevering Beta)

    Strips out the effect of financial leverage to get the asset (unlevered) beta.

    Args:
        levered_beta:  Observed (equity) beta of a levered firm
        debt:          Market value of debt
        equity:        Market value of equity
        tax_rate:      Corporate tax rate (decimal)

    Edge cases:
        - equity = 0   → raises ValueError
        - debt = 0     → returns levered_beta (no leverage to strip)
    """
    _is_finite(levered_beta, "levered_beta")
    _is_positive_number(debt, "debt")
    _is_positive_number(tax_rate, "tax_rate")
    if equity <= 0:
        raise ValueError(f"equity must be > 0, got {equity}")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")

    if debt < _TOLERANCE:
        return levered_beta
    return levered_beta / (1.0 + (1.0 - tax_rate) * (debt / equity))


def lever_beta(unlevered_beta: float, debt: float, equity: float, tax_rate: float) -> float:
    """
    β_L = β_U × [1 + (1 - T_c) × (D/E)]
    Ch.17, §17.3

    Adds financial leverage back to an unlevered beta.

    Edge cases:
        - equity = 0 → raises ValueError
    """
    _is_finite(unlevered_beta, "unlevered_beta")
    _is_positive_number(debt, "debt")
    _is_positive_number(tax_rate, "tax_rate")
    if equity <= 0:
        raise ValueError(f"equity must be > 0, got {equity}")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")

    return unlevered_beta * (1.0 + (1.0 - tax_rate) * (debt / equity))


# ══════════════════════════════════════════════════════════════════════
# PART 5: COST OF CAPITAL & WACC
# Source: Brealey & Myers, Chapter 9 ("Company and Project Cost of Capital"),
#         Chapter 17 ("Does Debt Policy Matter?"), Chapter 19
# ══════════════════════════════════════════════════════════════════════

def cost_of_equity_capm(
    risk_free_rate: float, beta: float, market_premium: float
) -> float:
    """
    r_e = R_f + β × (MRP)
    Ch.9, §9.1

    Convenience wrapper over capm() using explicit market risk premium.
    """
    return capm(risk_free_rate, beta, risk_free_rate + market_premium)


def after_tax_cost_of_debt(pre_tax_cost: float, tax_rate: float) -> float:
    """
    r_d_after = r_d × (1 - T_c)
    Ch.9, §9.2

    The tax-deductibility of interest makes debt cheaper than its nominal rate.
    """
    _is_finite(pre_tax_cost, "pre_tax_cost")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")
    return pre_tax_cost * (1.0 - tax_rate)


def wacc(
    equity_value: float,
    debt_value: float,
    cost_equity: float,
    cost_debt: float,
    tax_rate: float,
) -> float:
    """
    WACC = (E/V) × r_e + (D/V) × r_d × (1 - T_c)
    Ch.9, §9.2; Ch.19, §19.3

    Args:
        equity_value:  Market value of equity (E)
        debt_value:    Market value of interest-bearing debt (D)
        cost_equity:   r_e — required return on equity (decimal)
        cost_debt:     r_d — pre-tax cost of debt (decimal)
        tax_rate:      T_c — marginal corporate tax rate (decimal)

    Edge cases:
        - E + D = 0 → raises ValueError
        - Negative equity or debt → raises ValueError
    """
    _is_positive_number(equity_value, "equity_value")
    _is_positive_number(debt_value, "debt_value")
    _is_finite(cost_equity, "cost_equity")
    _is_finite(cost_debt, "cost_debt")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")

    v = equity_value + debt_value
    if v < _TOLERANCE:
        raise ValueError(f"Total firm value (E + D = {v}) must be > 0")

    re_weight = equity_value / v
    rd_weight = debt_value / v
    return re_weight * cost_equity + rd_weight * cost_debt * (1.0 - tax_rate)


def wacc_with_preferred(
    equity_value: float,
    preferred_value: float,
    debt_value: float,
    cost_equity: float,
    cost_preferred: float,
    cost_debt: float,
    tax_rate: float,
) -> float:
    """
    WACC = (E/V) × r_e + (P/V) × r_p + (D/V) × r_d × (1 - T_c)
    Ch.9, §9.2

    Extended WACC when the firm has preferred stock.

    Edge cases:
        - V = 0 → raises ValueError
    """
    _is_positive_number(equity_value, "equity_value")
    _is_positive_number(preferred_value, "preferred_value")
    _is_positive_number(debt_value, "debt_value")
    _is_finite(cost_equity, "cost_equity")
    _is_finite(cost_preferred, "cost_preferred")
    _is_finite(cost_debt, "cost_debt")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")

    v = equity_value + preferred_value + debt_value
    if v < _TOLERANCE:
        raise ValueError(f"Total firm value (V = {v}) must be > 0")

    return (
        (equity_value / v) * cost_equity
        + (preferred_value / v) * cost_preferred
        + (debt_value / v) * cost_debt * (1.0 - tax_rate)
    )


# ══════════════════════════════════════════════════════════════════════
# PART 6: DISCOUNTED CASH FLOW VALUATION
# Source: Brealey & Myers, Chapter 4 ("The Value of Common Stocks"),
#         Chapter 19 ("Financing and Valuation")
# ══════════════════════════════════════════════════════════════════════

def free_cash_flow(
    ebit: float, tax_rate: float, depreciation: float,
    capex: float, delta_working_capital: float
) -> float:
    """
    FCF = EBIT × (1 - T_c) + Depreciation - CapEx - ΔNWC
    Ch.19, §19.2 (Free Cash Flow)

    FCF is the cash available to all providers of capital (debt + equity)
    after necessary reinvestment.

    Args:
        ebit:                   Earnings before interest and taxes
        tax_rate:               Corporate tax rate (decimal)
        depreciation:           Depreciation & amortization (non-cash charge)
        capex:                  Capital expenditures
        delta_working_capital:  Change in net working capital (+ = investment)

    Edge cases:
        - Negative FCF is valid (growth companies often have negative FCF)
    """
    _is_finite(ebit, "ebit")
    _is_finite(depreciation, "depreciation")
    _is_finite(capex, "capex")
    _is_finite(delta_working_capital, "delta_working_capital")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")

    return ebit * (1.0 - tax_rate) + depreciation - capex - delta_working_capital


def terminal_value_gordon(fcf_final: float, wacc_rate: float, growth_rate: float) -> float:
    """
    TV = FCF_n × (1 + g) / (WACC - g)
    Ch.4, §4.4; Ch.19, §19.3 (Terminal Value — Perpetuity Growth / Gordon Growth)

    Applies the Gordon Growth Model to the final year's free cash flow
    to compute terminal value. Assumes stable perpetual growth thereafter.

    REQUIREMENT: WACC > g. If g ≥ WACC, the terminal value is infinite.

    Edge cases:
        - g ≥ WACC → raises ValueError
        - g < -1.0 → raises ValueError (cash flows go negative)
        - fcf_final < 0 → allowed but yields negative TV; prints a warning
    """
    _is_finite(fcf_final, "fcf_final")
    _is_finite(wacc_rate, "wacc_rate")
    _is_finite(growth_rate, "growth_rate")
    if growth_rate <= -1.0:
        raise ValueError(f"growth_rate must be > -1.0, got {growth_rate}")
    if wacc_rate - growth_rate <= _TOLERANCE:
        raise ValueError(
            f"WACC ({wacc_rate}) must exceed growth ({growth_rate}) by a positive margin; "
            f"otherwise terminal value is infinite. Ch.4, §4.4"
        )
    if fcf_final < -_TOLERANCE:
        print(
            f"[WARNING] Terminal FCF is negative ({fcf_final}). "
            f"Terminal value will also be negative — the firm is not viable "
            f"under these assumptions.",
            file=sys.stderr,
        )
    return fcf_final * (1.0 + growth_rate) / (wacc_rate - growth_rate)


def terminal_value_exit_multiple(
    metric_final: float, multiple: float
) -> float:
    """
    TV = Metric_final × Multiple
    Ch.19, §19.3 (Terminal Value — Exit Multiple)

    Alternate terminal value method using comparable-company multiples.
    Common metrics: EBITDA, EBIT, Revenue.

    Args:
        metric_final:  Pro forma metric (e.g., EBITDA) in the final projected year
        multiple:      EV/EBITDA or equivalent multiple

    Edge cases:
        - Multiple ≤ 0 → raises ValueError
    """
    _is_finite(metric_final, "metric_final")
    _is_finite(multiple, "multiple")
    if multiple <= _TOLERANCE:
        raise ValueError(f"multiple must be > 0, got {multiple}")
    return metric_final * multiple


def enterprise_value_dcf(
    fcf_projections: List[float],
    wacc_rate: float,
    terminal_growth: float,
    terminal_multiple: Optional[float] = None,
    terminal_metric: Optional[float] = None,
) -> Tuple[float, float, float]:
    """
    EV = Σ FCF_t / (1+WACC)^t + TV / (1+WACC)^n
    Ch.19, §19.3

    Computes the enterprise value from projected free cash flows.

    Args:
        fcf_projections:  List of projected FCF for years 1..n
        wacc_rate:        Weighted average cost of capital
        terminal_growth:  Perpetual growth rate for Gordon Growth TV
        terminal_multiple: If provided, use exit multiple method instead of Gordon
        terminal_metric:   The final-year metric for exit multiple (e.g., EBITDA)

    Returns:
        (enterprise_value, terminal_value, pv_of_projections)

    Edge cases:
        - Empty projections → raises ValueError
        - g ≥ WACC and no exit multiple → raises ValueError
    """
    _require_non_empty(fcf_projections, "fcf_projections")
    _is_finite(wacc_rate, "wacc_rate")
    if wacc_rate <= -1.0:
        raise ValueError(f"wacc_rate must be > -1.0, got {wacc_rate}")

    n = len(fcf_projections)

    # PV of explicit projections
    pv_projections = 0.0
    for t, fcf in enumerate(fcf_projections, 1):
        _is_finite(fcf, f"fcf_projections[{t-1}]")
        pv_projections += fcf / (1.0 + wacc_rate) ** t

    # Terminal value
    if terminal_multiple is not None:
        if terminal_metric is None:
            terminal_metric = fcf_projections[-1]
        tv = terminal_value_exit_multiple(terminal_metric, terminal_multiple)
    else:
        tv = terminal_value_gordon(fcf_projections[-1], wacc_rate, terminal_growth)

    pv_terminal = tv / (1.0 + wacc_rate) ** n
    enterprise_value = pv_projections + pv_terminal

    return enterprise_value, tv, pv_projections


def equity_value_from_ev(enterprise_value: float, debt: float, cash: float) -> float:
    """
    Equity Value = Enterprise Value - Debt + Cash
    Ch.19, §19.3

    Bridge from EV to equity value.
    """
    _is_finite(enterprise_value, "enterprise_value")
    _is_positive_number(debt, "debt")
    _is_positive_number(cash, "cash")
    return enterprise_value - debt + cash


# ══════════════════════════════════════════════════════════════════════
# PART 7: CAPITAL STRUCTURE
# Source: Brealey & Myers, Chapter 17 ("Does Debt Policy Matter?"),
#         Chapter 18 ("How Much Should a Firm Borrow?")
# ══════════════════════════════════════════════════════════════════════

def mm_proposition1_no_taxes(v_unlevered: float) -> float:
    """
    MM Proposition I (no taxes): V_L = V_U
    Ch.17, §17.1

    In a perfect market without taxes, capital structure is irrelevant.
    The value of the levered firm equals the value of the unlevered firm.

    Returns V_L (same as V_U).
    """
    _is_finite(v_unlevered, "v_unlevered")
    return v_unlevered


def mm_proposition2_no_taxes(
    r_assets: float, r_debt: float, debt: float, equity: float
) -> float:
    """
    MM Proposition II (no taxes):
    r_E = r_A + (D/E) × (r_A - r_D)
    Ch.17, §17.1

    The cost of equity rises linearly with leverage.
    The increased expected return exactly compensates for the increased risk.

    Args:
        r_assets:  Cost of capital for unlevered firm (r_A)
        r_debt:    Cost of debt (r_D), must be < r_assets in equilibrium
        debt:      Market value of debt
        equity:    Market value of equity (> 0)

    Edge cases:
        - equity = 0 → raises ValueError (division by zero)
        - r_assets < r_debt → allowed mathematically but economically unusual;
          prints warning
    """
    _is_finite(r_assets, "r_assets")
    _is_finite(r_debt, "r_debt")
    _is_positive_number(debt, "debt")
    if equity <= 0:
        raise ValueError(f"equity must be > 0, got {equity}")
    if r_assets < r_debt - _TOLERANCE:
        print(
            f"[WARNING] r_assets ({r_assets}) < r_debt ({r_debt}). "
            f"In equilibrium, r_A ≥ r_D (Ch.17, §17.1).",
            file=sys.stderr,
        )
    return r_assets + (debt / equity) * (r_assets - r_debt)


def mm_proposition1_with_taxes(v_unlevered: float, tax_rate: float, debt: float) -> float:
    """
    MM Proposition I (with taxes): V_L = V_U + T_c × D
    Ch.18, §18.1

    The levered firm is worth more by the present value of the tax shield.
    Assumes permanent, risk-free debt.

    Edge cases:
        - tax_rate outside [0, 1] → raises ValueError
    """
    _is_finite(v_unlevered, "v_unlevered")
    _is_positive_number(debt, "debt")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")
    return v_unlevered + tax_rate * debt


def present_value_tax_shield(debt: float, tax_rate: float, cost_of_debt: float) -> float:
    """
    PV(Tax Shield) = T_c × D  (for perpetual, risk-free debt)
    Ch.18, §18.1

    For a growing firm with non-perpetual debt, the formula is more complex.
    This is the simplified perpetual case.

    For a finite-life project, use:
      PV(TS) = Σ (T_c × r_d × D_t) / (1 + r_d)^t
    but that requires a debt schedule — use apv() instead.
    """
    _is_positive_number(debt, "debt")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")
    _is_finite(cost_of_debt, "cost_of_debt")
    return tax_rate * debt


def apv(
    base_case_npv: float,
    tax_shield_pv: float,
    issue_costs: float = 0.0,
    other_side_effects: float = 0.0,
) -> float:
    """
    Adjusted Present Value (APV)
    Ch.19, §19.4

    APV = Base-case NPV (all-equity) + PV(Tax Shield) - Issue Costs + Other Effects

    Decomposes a project's value into its unlevered value plus the
    side effects of financing.

    Args:
        base_case_npv:      NPV if the project were all-equity financed
        tax_shield_pv:      PV of interest tax shields
        issue_costs:        PV of debt/equity issuance costs (non-negative)
        other_side_effects: PV of subsidies, guarantees, distress costs, etc.

    Returns: APV
    """
    _is_finite(base_case_npv, "base_case_npv")
    _is_finite(tax_shield_pv, "tax_shield_pv")
    _is_finite(issue_costs, "issue_costs")
    _is_finite(other_side_effects, "other_side_effects")
    if issue_costs < 0:
        raise ValueError(f"issue_costs should be non-negative, got {issue_costs}")
    return base_case_npv + tax_shield_pv - issue_costs + other_side_effects


# ══════════════════════════════════════════════════════════════════════
# PART 8: PROJECT ANALYSIS
# Source: Brealey & Myers, Chapter 10 ("Project Analysis")
# ══════════════════════════════════════════════════════════════════════

def accounting_break_even(
    fixed_costs: float, depreciation: float, price_per_unit: float, variable_cost_per_unit: float
) -> float:
    """
    Accounting Break-Even:
    Q = (Fixed Costs + Depreciation) / (Price - Variable Cost)
    Ch.10, §10.1

    The sales volume at which accounting profit = 0 (revenues = total costs).
    At this point the project neither makes nor loses accounting profit.

    Args:
        fixed_costs:           Annual fixed costs (excluding depreciation)
        depreciation:          Annual depreciation charge
        price_per_unit:        Selling price per unit
        variable_cost_per_unit: Variable cost per unit

    Edge cases:
        - price ≤ variable cost → raises ValueError (negative contribution margin;
          break-even is impossible)
    """
    _is_positive_number(fixed_costs, "fixed_costs")
    _is_positive_number(depreciation, "depreciation")
    _is_positive_number(price_per_unit, "price_per_unit")
    _is_positive_number(variable_cost_per_unit, "variable_cost_per_unit")

    contribution = price_per_unit - variable_cost_per_unit
    if contribution <= _TOLERANCE:
        raise ValueError(
            f"Contribution margin ({contribution}) ≤ 0 — "
            f"break-even is impossible when price ≤ variable cost"
        )
    return (fixed_costs + depreciation) / contribution


def npv_break_even(
    initial_investment: float, annual_fixed_costs: float,
    price_per_unit: float, variable_cost_per_unit: float,
    rate: float, life_years: int, tax_rate: float = 0.0,
) -> float:
    """
    NPV Break-Even — the annual sales volume that makes NPV = 0.
    Ch.10, §10.1

    Solves for the quantity Q such that:
      PV[Q × (P - VC) - FC] × (1-T) + PV(Depreciation Tax Shield) = Initial Investment

    This is more conservative than accounting break-even because it
    accounts for the time value of money.

    Edge cases:
        - contribution ≤ 0 → raises ValueError
        - life_years = 0 → raises ValueError
    """
    _is_positive_number(initial_investment, "initial_investment")
    _is_positive_number(annual_fixed_costs, "annual_fixed_costs")
    _is_positive_number(price_per_unit, "price_per_unit")
    _is_positive_number(variable_cost_per_unit, "variable_cost_per_unit")
    _is_finite(rate, "rate")
    if not isinstance(life_years, int) or life_years <= 0:
        raise ValueError(f"life_years must be a positive integer, got {life_years}")
    if rate <= -1.0:
        raise ValueError(f"rate must be > -1.0, got {rate}")
    if not 0 <= tax_rate <= 1:
        raise ValueError(f"tax_rate must be in [0, 1], got {tax_rate}")

    contribution = price_per_unit - variable_cost_per_unit
    if contribution <= _TOLERANCE:
        raise ValueError(
            f"Contribution margin ({contribution}) ≤ 0 — NPV break-even impossible"
        )

    af = annuity_pv(1.0, rate, life_years)

    # PV of after-tax fixed costs, including the investment
    pv_fixed = initial_investment + annual_fixed_costs * af * (1.0 - tax_rate)

    # Depreciation tax shield: straight-line
    annual_dep = initial_investment / life_years
    pv_dep_ts = annual_dep * tax_rate * af

    # Solve: Q × contribution × (1-T) × AF = Initial + PV(FC×(1-T)) - PV(DTS)
    numerator = pv_fixed - pv_dep_ts
    denominator = contribution * (1.0 - tax_rate) * af

    if denominator < _TOLERANCE:
        raise ValueError("Denominator zero — cannot solve for break-even quantity")
    return numerator / denominator


def sensitivity_table(
    base_npv: float,
    variables: Dict[str, Tuple[float, float, float]],
    discount_rate: float,
) -> Dict[str, List[Tuple[float, float]]]:
    """
    Sensitivity Analysis Table
    Ch.10, §10.2

    Computes NPV under pessimistic and optimistic scenarios for each variable,
    holding others constant. Returns the range of NPVs and identifies the
    variable with the largest swing.

    Args:
        base_npv:    Base-case NPV
        variables:   Dict mapping variable name → (base, pessimistic, optimistic)
        discount_rate: Not used in ranges (already in base_npv) but kept for interface

    Returns:
        Dict with:
          'table': List of (variable_name, npv_pessimistic, npv_optimistic, swing)
          'most_sensitive': Name of the variable with the largest swing

    Note: This is a skeleton; in practice each variable's impact on cashflows
    must be modeled. The caller supplies pre-computed scenario NPVs.
    """
    results = []
    max_swing = 0.0
    most_sensitive = None

    for var_name, (base, pess, opt) in variables.items():
        # The caller should have already recomputed NPV for each scenario.
        # Here we accept the raw NPV values directly.
        swing = abs(opt - pess)
        results.append((var_name, pess, opt, swing))
        if swing > max_swing:
            max_swing = swing
            most_sensitive = var_name

    return {
        "table": results,
        "base_npv": base_npv,
        "most_sensitive": most_sensitive,
    }


def scenario_npv(scenarios: Dict[str, float]) -> Dict[str, float]:
    """
    Scenario Analysis
    Ch.10, §10.2

    Computes the probability-weighted expected NPV from multiple scenarios.

    Args:
        scenarios: Dict mapping scenario_label → (npv, probability) or just npv.
                   If probability not embedded, caller should use expected_return().

    Returns:
        Dict with 'individual' and 'expected' keys.
    """
    npvs = []
    probs = []
    for label, val in scenarios.items():
        if isinstance(val, tuple):
            npv_val, prob = val
        else:
            npv_val, prob = val, 1.0 / len(scenarios)
        npvs.append(npv_val)
        probs.append(prob)

    exp = expected_return(npvs, probs)
    return {
        "individual": dict(zip(scenarios.keys(), npvs)),
        "expected": exp,
    }


# ══════════════════════════════════════════════════════════════════════
# PART 9: BATCH VENTURE RANKING UTILITY
# ══════════════════════════════════════════════════════════════════════

def rank_ventures(
    ventures: List[Dict],
    wacc_rate: float,
    terminal_growth: float = 0.02,
) -> List[Dict]:
    """
    Batch venture ranking — computes NPV, IRR, PI, and payback for each
    venture and returns them sorted by NPV (descending).

    Each venture dict must have:
      - 'name': str
      - 'cashflows': List[float]  (CF₀ negative, rest projected)

    Each venture may optionally have:
      - 'tax_rate': float (default 0.0)
      - 'debt': float (default 0.0)
      - 'cash': float (default 0.0)

    Returns the list with added keys: npv, irr, pi, payback, rank.
    """
    _require_non_empty(ventures, "ventures")
    _is_finite(wacc_rate, "wacc_rate")
    if wacc_rate <= -1.0:
        raise ValueError(f"wacc_rate must be > -1.0, got {wacc_rate}")

    results = []
    for v in ventures:
        if "name" not in v or "cashflows" not in v:
            raise ValueError(f"Each venture must have 'name' and 'cashflows': {v}")

        name = v["name"]
        cfs = v["cashflows"]
        _require_non_empty(cfs, f"cashflows for '{name}'")
        for i, cf in enumerate(cfs):
            _is_finite(cf, f"cashflows[{i}] for '{name}'")

        result = {"name": name}

        # NPV
        n = npv(cfs, wacc_rate)
        result["npv"] = round(n, 4)
        result["npv_decision"] = npv_decision(n)

        # IRR (may fail for some cashflow patterns — catch gracefully)
        try:
            i_val = irr(cfs)
            result["irr"] = round(i_val, 6)
        except ValueError as e:
            result["irr"] = None
            result["irr_error"] = str(e)

        # Profitability Index (only meaningful if CF₀ < 0)
        try:
            result["pi"] = round(profitability_index(cfs, wacc_rate), 4)
            result["pi_decision"] = "ACCEPT" if result["pi"] > 1.0 else "REJECT"
        except ValueError:
            result["pi"] = None

        # Payback
        pb = payback_period(cfs)
        result["payback"] = round(pb, 2) if pb != math.inf else math.inf

        # Discounted payback
        dpb = discounted_payback(cfs, wacc_rate)
        result["discounted_payback"] = round(dpb, 2) if dpb != math.inf else math.inf

        results.append(result)

    # Sort by NPV descending
    results.sort(key=lambda x: x["npv"] if x["npv"] is not None else -math.inf, reverse=True)
    for rank, r in enumerate(results, 1):
        r["rank"] = rank

    return results


# ══════════════════════════════════════════════════════════════════════
# PART 10: SELF-TEST SUITE
# ══════════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    """
    Run every self-test. Returns 0 if all pass, 1 if any fail.
    Output is a simple pass/fail log to stdout.
    """
    failures = 0
    passed = 0

    def check(label: str, actual, expected, tol: float = 1e-6):
        nonlocal failures, passed
        if isinstance(expected, str):
            ok = actual == expected
        elif isinstance(expected, bool):
            ok = actual == expected
        elif isinstance(expected, float) and math.isinf(expected):
            ok = actual == expected
        else:
            ok = abs(actual - expected) <= tol
        if ok:
            print(f"  PASS  {label}: {actual}")
            passed += 1
        else:
            print(f"  FAIL  {label}: expected {expected}, got {actual}")
            failures += 1

    def check_approx(label: str, actual, expected, tol: float = 1e-3):
        nonlocal failures, passed
        if abs(actual - expected) > tol:
            print(f"  FAIL  {label}: expected ≈{expected}, got {actual}")
            failures += 1
        else:
            print(f"  PASS  {label}: {actual}")
            passed += 1

    def check_str(label: str, actual: str, expected: str):
        nonlocal failures, passed
        if actual != expected:
            print(f"  FAIL  {label}: expected '{expected}', got '{actual}'")
            failures += 1
        else:
            print(f"  PASS  {label}: '{actual}'")
            passed += 1

    def check_none(label: str, actual):
        nonlocal failures, passed
        if actual is not None:
            print(f"  FAIL  {label}: expected None, got {actual}")
            failures += 1
        else:
            print(f"  PASS  {label}: None")
            passed += 1

    def check_raises(label: str, func: Callable, *args, **kwargs):
        nonlocal failures, passed
        try:
            result = func(*args, **kwargs)
            print(f"  FAIL  {label}: expected ValueError but got {result}")
            failures += 1
        except (ValueError, TypeError, ZeroDivisionError) as e:
            print(f"  PASS  {label}: raised {type(e).__name__} — {e}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: capital_budgeting.py")
    print("Source: Brealey & Myers, Principles of Corporate Finance (12th Ed.)")
    print("=" * 70)

    # ── Part 1: Time Value of Money ──

    print("\n── Part 1: Time Value of Money (Ch.2) ──")

    check("future_value: $100 @ 10% × 5yr",
          future_value(100, 0.10, 5), 161.051, tol=1e-2)
    check("future_value: $100 @ 0% × 10yr",
          future_value(100, 0.0, 10), 100.0)
    check("future_value: $0 principal",
          future_value(0, 0.10, 5), 0.0)
    check("future_value: 0 periods",
          future_value(500, 0.10, 0), 500.0)

    check("present_value: $100 in 5yr @ 10%",
          present_value(100, 0.10, 5), 62.09, tol=1e-2)
    check("present_value: $100 @ 0%",
          present_value(100, 0.0, 5), 100.0)
    check("present_value: 0 periods",
          present_value(100, 0.10, 0), 100.0)

    check("annuity_pv: $100/yr × 3yr @ 10%",
          annuity_pv(100.0, 0.10, 3), 248.69, tol=1e-2)
    check("annuity_pv: rate=0 → undiscounted sum",
          annuity_pv(100.0, 0.0, 5), 500.0)
    check("annuity_pv: 0 periods → 0",
          annuity_pv(100.0, 0.10, 0), 0.0)

    check("annuity_fv: $100/yr × 3yr @ 10%",
          annuity_fv(100.0, 0.10, 3), 331.0, tol=1e-2)
    check("annuity_fv: rate=0 → undiscounted sum",
          annuity_fv(100.0, 0.0, 5), 500.0)
    check("annuity_fv: 0 periods → 0",
          annuity_fv(100.0, 0.10, 0), 0.0)

    check("perpetuity_pv: $100/yr @ 10%",
          perpetuity_pv(100.0, 0.10), 1000.0)
    check("perpetuity_pv: $50/yr @ 5%",
          perpetuity_pv(50.0, 0.05), 1000.0)

    check("growing_perpetuity_pv: $100, r=10%, g=2%",
          growing_perpetuity_pv(100.0, 0.10, 0.02), 1250.0)
    check("growing_perpetuity_pv: $100, r=12%, g=4%",
          growing_perpetuity_pv(100.0, 0.12, 0.04), 1250.0)

    check("effective_annual_rate: 10% nominal, semi-annual",
          effective_annual_rate(0.10, 2), 0.1025, tol=1e-6)
    check("effective_annual_rate: 10% nominal, monthly",
          effective_annual_rate(0.10, 12), 0.10471, tol=1e-4)
    check("effective_annual_rate: annual compounding = nominal",
          effective_annual_rate(0.10, 1), 0.10)

    check("continuous_compounding_fv: $1000 @ 10% × 1yr",
          continuous_compounding_fv(1000.0, 0.10, 1.0), 1105.17, tol=1e-2)
    check("continuous_compounding_fv: $1000 @ 0%",
          continuous_compounding_fv(1000.0, 0.0, 5.0), 1000.0)
    check("continuous_compounding_fv: 0 years",
          continuous_compounding_fv(1000.0, 0.10, 0.0), 1000.0)

    # ── Edge cases Part 1 ──
    print("\n  ── Edge Cases ──")
    check_raises("perpetuity_pv: rate=0 → infinite",
                 perpetuity_pv, 100.0, 0.0)
    check_raises("perpetuity_pv: negative rate",
                 perpetuity_pv, 100.0, -0.05)
    check_raises("growing_perpetuity_pv: g ≥ r",
                 growing_perpetuity_pv, 100.0, 0.05, 0.06)
    check_raises("growing_perpetuity_pv: g = r",
                 growing_perpetuity_pv, 100.0, 0.05, 0.05)
    check_raises("present_value: rate = -1.0 (division by zero)",
                 present_value, 100.0, -1.0, 5)
    check_raises("future_value: rate ≤ -1.0",
                 future_value, 100.0, -1.0, 5)
    check_raises("annuity_pv: rate ≤ -1.0",
                 annuity_pv, 100.0, -1.5, 5)

    # ── Part 2: NPV & Investment Decision Rules ──

    print("\n── Part 2: NPV & Investment Decision Rules (Ch.5, 6) ──")

    # Standard project: -$1000 + $300/yr × 5yr @ 10% → NPV ≈ $137.23 (textbook example)
    cfs_standard = [-1000.0, 300.0, 300.0, 300.0, 300.0, 300.0]
    check("npv: standard 5yr project @ 10%",
          npv(cfs_standard, 0.10), 137.24, tol=1e-2)

    check_str("npv_decision: NPV > 0",
              npv_decision(137.24), "ACCEPT")
    check_str("npv_decision: NPV < 0",
              npv_decision(-50.0), "REJECT")
    check_str("npv_decision: NPV ≈ 0",
              npv_decision(0.0), "INDIFFERENT")

    check_approx("irr: standard 5yr project",
                 irr(cfs_standard), 0.1524, tol=1e-3)  # ~15.24%

    check_str("irr_decision: IRR > WACC (investment)",
              irr_decision(0.15, 0.10), "ACCEPT")
    check_str("irr_decision: IRR < WACC (investment)",
              irr_decision(0.08, 0.10), "REJECT")
    check_str("irr_decision: IRR ≈ WACC",
              irr_decision(0.10, 0.10), "INDIFFERENT")

    # MIRR: -$1000, then $400, $400, $400, $400 @ finance=10%, reinvest=12%
    cfs_mirr = [-1000.0, 400.0, 400.0, 400.0, 400.0]
    # FV inflows: 400*(1.12^3 + 1.12^2 + 1.12 + 1) = 400*4.7793 = 1911.73
    # |PV costs|: |-1000| = 1000
    # MIRR = (1911.73/1000)^(1/4) - 1 = 1.91173^0.25 - 1 ≈ 0.1759
    check_approx("mirr: 4yr project, finance=10%, reinvest=12%",
                 mirr(cfs_mirr, 0.10, 0.12), 0.1759, tol=1e-3)

    check("payback_period: standard project",
          payback_period(cfs_standard), 3.33, tol=0.1)
    check("payback_period: immediate",
          payback_period([100.0, 200.0]), 0.0)
    check("payback_period: never",
          payback_period([-1000.0, 100.0, 100.0]), math.inf)

    check("discounted_payback: standard @ 10%",
          discounted_payback(cfs_standard, 0.10), 4.25, tol=0.1)

    check("profitability_index: standard @ 10%",
          profitability_index(cfs_standard, 0.10), 1.251, tol=1e-3)

    check_approx("equivalent_annual_cost: $10k PV, 10%, 5yr",
                 equivalent_annual_cost(10000, 0.10, 5), 2637.97, tol=0.5)

    # ── Edge cases Part 2 ──
    print("\n  ── Edge Cases ──")
    check_raises("npv: empty cashflows",
                 npv, [], 0.10)
    check_raises("irr: all positive cashflows (no root)",
                 irr, [100.0, 200.0, 300.0])
    check_raises("irr: single cashflow",
                 irr, [100.0])
    check_raises("profitability_index: CF₀ >= 0",
                 profitability_index, [100.0, 200.0, 300.0], 0.10)
    check_raises("mirr: all positive (pure profit)",
                 mirr, [100.0, 200.0, 300.0], 0.10, 0.10)
    check_raises("mirr: all negative (pure cost)",
                 mirr, [-100.0, -200.0, -300.0], 0.10, 0.10)

    # ── Part 3: Risk & Return ──

    print("\n── Part 3: Risk & Return (Ch.7, 8) ──")

    returns = [0.10, 0.15, 0.20, 0.25, 0.30]
    check("expected_return: equal weight 5 assets",
          expected_return(returns), 0.20)
    probs = [0.1, 0.2, 0.4, 0.2, 0.1]
    check("expected_return: weighted 5 assets",
          expected_return(returns, probs), 0.20, tol=1e-10)

    check("variance: equal weight 5 assets",
          variance(returns), 0.005, tol=1e-10)
    check("std_dev: equal weight 5 assets",
          std_dev(returns), 0.07071, tol=1e-4)

    returns_y = [0.12, 0.18, 0.22, 0.28, 0.35]
    # Population cov: Σ(x-μx)(y-μy)/n = 0.028/5 = 0.0056
    check_approx("covariance: two series",
                 covariance(returns, returns_y), 0.0056, tol=1e-6)
    check_approx("correlation: two positive series → near 1",
                 correlation(returns, returns_y), 0.995, tol=0.005)

    # Portfolio
    check("portfolio_return: 70/30 split",
          portfolio_return([0.7, 0.3], [0.12, 0.20]), 0.144, tol=1e-10)

    # 2-asset variance: σ1=0.20, σ2=0.30, ρ=0.5, w1=0.6, w2=0.4
    pvar = portfolio_variance_2asset(0.6, 0.4, 0.20, 0.30, 0.5)
    # w1²σ1² = 0.36 * 0.04 = 0.0144
    # w2²σ2² = 0.16 * 0.09 = 0.0144
    # 2w1w2ρσ1σ2 = 2 * 0.6 * 0.4 * 0.5 * 0.20 * 0.30 = 2 * 0.24 * 0.03 = 0.0144
    # Total = 0.0432
    check("portfolio_variance_2asset: σ1=0.20, σ2=0.30, ρ=0.5, 60/40",
          pvar, 0.0432, tol=1e-10)

    # Perfect correlation → risk is weighted average
    pvar_perfect = portfolio_variance_2asset(0.5, 0.5, 0.20, 0.30, 1.0)
    # 0.25 * 0.04 + 0.25 * 0.09 + 2*0.5*0.5*1.0*0.20*0.30 = 0.01 + 0.0225 + 0.03 = 0.0625
    check("portfolio_variance_2asset: ρ=1.0 → no diversification",
          pvar_perfect, 0.0625, tol=1e-10)

    # ── Edge cases Part 3 ──
    print("\n  ── Edge Cases ──")
    check_raises("correlation: zero-variance asset (σ=0)",
                 correlation, [0.10, 0.10, 0.10], [0.10, 0.15, 0.20])
    check_raises("portfolio_return: weights don't sum to 1",
                 portfolio_return, [0.5, 0.3], [0.10, 0.20])
    check_raises("portfolio_return: negative weight (short not allowed)",
                 portfolio_return, [-0.2, 1.2], [0.10, 0.20])

    # ── Part 4: CAPM ──

    print("\n── Part 4: CAPM (Ch.8) ──")

    check("beta_cov: Cov=0.02, Var_m=0.04 → β=0.5",
          beta_cov(0.02, 0.04), 0.5)
    check("beta_cov: β=1.0 (moves with market)",
          beta_cov(0.04, 0.04), 1.0)
    check("beta_cov: β=2.0 (aggressive)",
          beta_cov(0.08, 0.04), 2.0)

    check("capm: Rf=3%, β=1.2, Rm=10% → 11.4%",
          capm(0.03, 1.2, 0.10), 0.114, tol=1e-10)
    check("capm: β=0 → risk-free rate",
          capm(0.03, 0.0, 0.10), 0.03)
    check("capm: β=1 → market return",
          capm(0.03, 1.0, 0.10), 0.10)

    check("market_risk_premium: Rm=10%, Rf=3% → 7%",
          market_risk_premium(0.10, 0.03), 0.07)

    check("alpha: actual=12%, expected=11.4% → +0.6%",
          alpha(0.12, 0.114), 0.006, tol=1e-10)

    check("unlever_beta: β_L=1.5, D/E=0.5, T=25% → β_U≈1.09",
          unlever_beta(1.5, 500, 1000, 0.25), 1.0909, tol=1e-4)
    check("unlever_beta: no debt → returns levered_beta",
          unlever_beta(1.5, 0, 1000, 0.25), 1.5)

    check("lever_beta: β_U=1.0, D/E=0.5, T=25% → β_L=1.375",
          lever_beta(1.0, 500, 1000, 0.25), 1.375)

    # ── Edge cases Part 4 ──
    print("\n  ── Edge Cases ──")
    check_raises("beta_cov: zero market variance",
                 beta_cov, 0.02, 0.0)
    check_raises("unlever_beta: equity = 0",
                 unlever_beta, 1.5, 500, 0, 0.25)
    check_raises("capm: NaN input",
                 capm, float('nan'), 1.0, 0.10)

    # ── Part 5: WACC ──

    print("\n── Part 5: Cost of Capital & WACC (Ch.9, 17) ──")

    # E=$600, D=$400, r_e=12%, r_d=6%, T=25%
    # V=1000, E/V=0.6, D/V=0.4
    # WACC = 0.6*0.12 + 0.4*0.06*0.75 = 0.072 + 0.018 = 0.09
    check("wacc: E=600, D=400, r_e=12%, r_d=6%, T=25%",
          wacc(600, 400, 0.12, 0.06, 0.25), 0.09, tol=1e-10)

    check("wacc: all-equity firm (D=0)",
          wacc(1000, 0, 0.12, 0.06, 0.25), 0.12)
    check("cost_of_equity_capm: Rf=3%, β=1.2, MRP=7%",
          cost_of_equity_capm(0.03, 1.2, 0.07), 0.114)
    check("after_tax_cost_of_debt: 6% pre-tax, 25% rate → 4.5%",
          after_tax_cost_of_debt(0.06, 0.25), 0.045)

    # WACC with preferred: E=$500, P=$200, D=$300, r_e=12%, r_p=8%, r_d=6%, T=25%
    # V=1000, 0.5*0.12 + 0.2*0.08 + 0.3*0.06*0.75 = 0.06 + 0.016 + 0.0135 = 0.0895
    check("wacc_with_preferred: E=500, P=200, D=300",
          wacc_with_preferred(500, 200, 300, 0.12, 0.08, 0.06, 0.25), 0.0895, tol=1e-10)

    # ── Edge cases Part 5 ──
    print("\n  ── Edge Cases ──")
    check_raises("wacc: E + D = 0",
                 wacc, 0, 0, 0.12, 0.06, 0.25)
    check_raises("wacc: tax_rate > 1",
                 wacc, 600, 400, 0.12, 0.06, 1.5)
    check_raises("after_tax_cost_of_debt: tax_rate < 0",
                 after_tax_cost_of_debt, 0.06, -0.1)

    # ── Part 6: DCF Valuation ──

    print("\n── Part 6: DCF Valuation (Ch.4, 19) ──")

    check("free_cash_flow: basic calculation",
          free_cash_flow(ebit=1000, tax_rate=0.25, depreciation=200, capex=300, delta_working_capital=50),
          600.0)  # 1000*0.75 + 200 - 300 - 50 = 600

    check("free_cash_flow: no NWC change",
          free_cash_flow(ebit=1000, tax_rate=0.30, depreciation=100, capex=400, delta_working_capital=0),
          400.0)  # 700 + 100 - 400 = 400

    # TV: last FCF=$500, WACC=10%, g=2% → 500*1.02/(0.08) = 6375
    check("terminal_value_gordon: FCF=$500, WACC=10%, g=2%",
          terminal_value_gordon(500, 0.10, 0.02), 6375.0)
    # TV: WACC=12%, g=3% → 500*1.03/0.09 = 5722.22
    check("terminal_value_gordon: FCF=$500, WACC=12%, g=3%",
          terminal_value_gordon(500, 0.12, 0.03), 5722.22, tol=1e-2)

    check("terminal_value_exit_multiple: EBITDA=$800, EV/EBITDA=8x",
          terminal_value_exit_multiple(800, 8), 6400.0)

    # Enterprise DCF: FCF projections [$100, $120, $140], WACC=10%, g=2%
    # PV projections: 100/1.1 + 120/1.21 + 140/1.331 = 90.91 + 99.17 + 105.18 = 295.26
    # TV = 140*1.02/0.08 = 1785
    # PV TV = 1785/1.331 = 1341.10
    # EV = 295.26 + 1341.10 = 1636.36
    fcf_proj = [100.0, 120.0, 140.0]
    ev, tv, pv_proj = enterprise_value_dcf(fcf_proj, 0.10, 0.02)
    check("enterprise_value_dcf: 3yr FCF, 10% WACC, 2% growth",
          ev, 1636.36, tol=0.5)

    check("equity_value_from_ev: EV=$1636, Debt=$400, Cash=$100 → $1336",
          equity_value_from_ev(1636.36, 400, 100), 1336.36, tol=0.1)

    # ── Edge cases Part 6 ──
    print("\n  ── Edge Cases ──")
    check_raises("terminal_value_gordon: g ≥ WACC",
                 terminal_value_gordon, 500, 0.05, 0.06)
    check_raises("terminal_value_exit_multiple: multiple ≤ 0",
                 terminal_value_exit_multiple, 800, 0)
    check_raises("enterprise_value_dcf: empty projections",
                 enterprise_value_dcf, [], 0.10, 0.02)

    # ── Part 7: Capital Structure ──

    print("\n── Part 7: Capital Structure (Ch.17, 18) ──")

    check("mm_proposition1_no_taxes: V_U=$10M → V_L=$10M",
          mm_proposition1_no_taxes(10_000_000), 10_000_000)

    # r_A=10%, r_D=5%, D/E=0.5 → r_E = 0.10 + 0.5*(0.10-0.05) = 0.125
    check("mm_proposition2_no_taxes: r_A=10%, r_D=5%, D/E=0.5",
          mm_proposition2_no_taxes(0.10, 0.05, 500, 1000), 0.125)

    # V_U=$10M, T_c=25%, D=$4M → V_L=$11M
    check("mm_proposition1_with_taxes: V_U=$10M, T=25%, D=$4M",
          mm_proposition1_with_taxes(10_000_000, 0.25, 4_000_000), 11_000_000)

    check("present_value_tax_shield: D=$4M, T=25% → $1M",
          present_value_tax_shield(4_000_000, 0.25, 0.06), 1_000_000)

    check("apv: base=$5M, TS=$1M, issue=$0.2M → $5.8M",
          apv(5_000_000, 1_000_000, 200_000), 5_800_000)
    check("apv: base negative, no benefits",
          apv(-500_000, 0, 0), -500_000)

    # ── Part 8: Project Analysis ──

    print("\n── Part 8: Project Analysis (Ch.10) ──")

    check("accounting_break_even: FC=$500k, Dep=$200k, P=$50, VC=$30",
          accounting_break_even(500000, 200000, 50, 30), 35000.0)
    check("accounting_break_even: single unit",
          accounting_break_even(0, 0, 100, 50), 0.0)

    # NPV break-even: invest $1M, FC=$200k, P=$50, VC=$30, WACC=10%, 5yr, T=25%
    # Contribution=20, AF=3.7908
    # PV fixed = 1M + 200k*3.7908*0.75 = 1M + 568,620 = 1,568,620
    # Dep shield = 200k*0.25*3.7908 = 189,540
    # numerator = 1,568,620 - 189,540 = 1,379,080
    # denominator = 20 * 0.75 * 3.7908 = 56.862
    # Q = 24,253
    be_q = npv_break_even(1_000_000, 200_000, 50, 30, 0.10, 5, 0.25)
    check_approx("npv_break_even: $1M investment, 5yr, 10%, 25% tax",
                 be_q, 24253, tol=50)

    # ── Edge cases Part 8 ──
    print("\n  ── Edge Cases ──")
    check_raises("accounting_break_even: contribution ≤ 0",
                 accounting_break_even, 1000, 500, 10, 12)
    check_raises("npv_break_even: contribution ≤ 0",
                 npv_break_even, 10000, 1000, 10, 12, 0.10, 5, 0.25)

    # ── Part 9: Batch Venture Ranking ──

    print("\n── Part 9: Batch Venture Ranking ──")

    ventures = [
        {"name": "Venture A", "cashflows": [-1000.0, 300.0, 400.0, 500.0, 600.0]},
        {"name": "Venture B", "cashflows": [-2000.0, 800.0, 800.0, 800.0, 800.0]},
        {"name": "Venture C", "cashflows": [-500.0, 100.0, 100.0, 100.0, 100.0]},
    ]
    ranked = rank_ventures(ventures, 0.10)
    # Venture A NPV @ 10%: -1000 + 300/1.1 + 400/1.21 + 500/1.331 + 600/1.4641
    # = -1000 + 272.73 + 330.58 + 375.66 + 409.81 = 388.78
    # Venture B NPV: similar calc → ~535.89
    # Venture C NPV: -500 + 90.91 + 82.64 + 75.13 + 68.30 = -183.02
    check("rank_ventures: #1 by NPV should be Venture B",
          ranked[0]["name"], "Venture B")
    check("rank_ventures: #2 by NPV should be Venture A",
          ranked[1]["name"], "Venture A")
    check("rank_ventures: #3 by NPV should be Venture C",
          ranked[2]["name"], "Venture C")
    check_approx("rank_ventures: Venture A NPV",
                 ranked[1]["npv"], 388.78, tol=1.0)
    check_approx("rank_ventures: Venture B NPV",
                 ranked[0]["npv"], 535.89, tol=1.0)
    check_str("rank_ventures: Venture B decision",
              ranked[0]["npv_decision"], "ACCEPT")
    check_str("rank_ventures: Venture C decision",
              ranked[2]["npv_decision"], "REJECT")

    # ── Cross-part integration: Full WACC → Cap Budgeting pipeline ──

    print("\n── Integration Test: WACC → DCF → CAPM → Venture Rank ──")

    # Build a realistic valuation:
    # Rf=3%, β=1.3, MRP=7% → r_e=12.1%
    # r_d=5%, D/E=0.33, T=25% → WACC calculation
    # E=750, D=250, V=1000
    # WACC = 0.75*0.121 + 0.25*0.05*0.75 = 0.09075 + 0.009375 = 0.100125
    rf, beta_val, mrp = 0.03, 1.3, 0.07
    re_val = cost_of_equity_capm(rf, beta_val, mrp)
    check("integration: cost of equity = 12.1%",
          re_val, 0.121, tol=1e-10)

    wacc_calc = wacc(750, 250, re_val, 0.05, 0.25)
    check("integration: WACC ≈ 10.01%",
          wacc_calc, 0.100125, tol=1e-6)

    # DCF: FCFs [$100, $120, $150, $180, $200], terminal g=2%
    fcf_5yr = [100.0, 120.0, 150.0, 180.0, 200.0]
    ev_total, tv_val, pv_fcf = enterprise_value_dcf(fcf_5yr, wacc_calc, 0.02)
    check("integration: EV with computed WACC should be positive",
          ev_total > 0, True, tol=0)

    # Equity bridge
    eq_val = equity_value_from_ev(ev_total, 250, 50)
    check("integration: equity value = EV - D + Cash",
          eq_val, ev_total - 250 + 50)

    # ── Summary ──
    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)

    return 0 if failures == 0 else 1


# ══════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    sys.exit(run_all_tests())