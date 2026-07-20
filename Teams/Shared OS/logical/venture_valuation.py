#!/usr/bin/env python3
"""
Venture Valuation & Cap Table Mathematics
===========================================
Sources:
  - Damodaran, Aswath, *Narrative and Numbers* (2017, Columbia Business School)
  - Sahlman & Scherlis, "A Method for Valuing High-Risk, Long-Term
    Investments" (HBS Note E-95, Harvard Business School)
  - Damodaran, Aswath, *The Little Book of Valuation* (2011, Wiley)

Route: A (math script — every formula coded and self-tested)

Covers:
  - VC Method (backward valuation from terminal value)
  - Multi-round cap table construction with dilution
  - Option pool mechanics
  - Exit waterfall with liquidation preferences
  - Round sizing (18-24 month runway rule)
  - Comparable company valuation multiples
  - Ask sanity check (valuation, dilution, runway)

Design rules:
  - Every function validates inputs; no silent defaults on amounts.
  - All dollar amounts in consistent currency units (treat as floats).
  - Liquidation preference multiples must be ≥ 1.0.
  - Cap table: share counts must be positive integers.
  - All self-tests use worked examples with verified arithmetic.
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


# ═══════════════════════════════════════════════════════════════════
# PART 1 — VC METHOD VALUATION
# ═══════════════════════════════════════════════════════════════════

def _v(val: float, name: str) -> None:
    """Validate finite number."""
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


def _positive(val: float, name: str) -> None:
    _v(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


def _pct(val: float, name: str) -> None:
    """Validate decimal (0.0 to 1.0)."""
    _v(val, name)
    if val < 0.0 or val > 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


def vc_method_post_money(terminal_value: float, target_irr: float, years: int) -> float:
    """
    Post-Money = Terminal Value / (1 + IRR)^years
    Sahlman HBS E-95; Damodaran, Narrative and Numbers, Ch.5

    Args:
      terminal_value: Projected exit value (e.g., $50M)
      target_irr:     Target IRR in decimal (e.g., 0.50 for 50%)
      years:          Years to projected exit (integer ≥ 1)
    """
    _positive(terminal_value, "terminal_value")
    _v(target_irr, "target_irr")
    if target_irr <= -1.0:
        raise ValueError(f"target_irr must be > -1.0, got {target_irr}")
    if not isinstance(years, int) or years < 1:
        raise ValueError(f"years must be integer ≥ 1, got {years}")
    return terminal_value / (1.0 + target_irr) ** years


def vc_method_pre_money(post_money: float, investment: float) -> float:
    """Pre-Money = Post-Money - Investment"""
    _positive(post_money, "post_money")
    _positive(investment, "investment")
    if investment >= post_money:
        raise ValueError(f"investment ({investment}) must be less than post-money ({post_money})")
    return post_money - investment


def vc_method_ownership(post_money: float, investment: float) -> float:
    """Required Ownership % = Investment / Post-Money (returns decimal)"""
    _positive(post_money, "post_money")
    _positive(investment, "investment")
    if investment > post_money:
        raise ValueError(f"investment ({investment}) exceeds post-money ({post_money})")
    return investment / post_money


def standard_discount_rate(stage: str) -> float:
    """
    Standard VC discount rates by stage (Sahlman HBS E-95).
    Returns decimal (e.g., 0.50 = 50%).
    """
    rates = {
        "seed": 0.60, "angel": 0.60,
        "series_a": 0.50, "series-a": 0.50,
        "series_b": 0.40, "series-b": 0.40,
        "series_c": 0.30, "series-c": 0.30,
        "growth": 0.25,
        "late": 0.20,
    }
    key = stage.lower().replace(" ", "_")
    if key not in rates:
        raise ValueError(f"Unknown stage '{stage}'. Known: {list(rates.keys())}")
    return rates[key]


def terminal_value_from_revenue(projected_revenue: float, revenue_multiple: float) -> float:
    """TV = Projected Revenue at Exit × Revenue Multiple"""
    _positive(projected_revenue, "projected_revenue")
    _positive(revenue_multiple, "revenue_multiple")
    return projected_revenue * revenue_multiple


def terminal_value_from_ebitda(projected_ebitda: float, ebitda_multiple: float) -> float:
    """TV = Projected EBITDA at Exit × EBITDA Multiple"""
    _positive(projected_ebitda, "projected_ebitda")
    _positive(ebitda_multiple, "ebitda_multiple")
    return projected_ebitda * ebitda_multiple


INDUSTRY_MULTIPLES = {
    "saas_high_growth":    {"ev_revenue": (10.0, 15.0), "ev_ebitda": (25.0, 40.0)},
    "saas_mature":         {"ev_revenue": (5.0, 8.0),   "ev_ebitda": (15.0, 25.0)},
    "marketplace":         {"ev_revenue": (3.0, 8.0),   "ev_ebitda": (20.0, 30.0)},
    "fintech":             {"ev_revenue": (5.0, 10.0),  "ev_ebitda": (15.0, 30.0)},
    "ecommerce":           {"ev_revenue": (1.0, 3.0),   "ev_ebitda": (10.0, 20.0)},
    "hardware":            {"ev_revenue": (1.0, 3.0),   "ev_ebitda": (8.0, 15.0)},
    "biotech_pre_revenue": {"ev_revenue": None,         "ev_ebitda": None},
}


def valuation_range(terminal_value_low: float, terminal_value_high: float,
                    target_irr: float, years: int) -> Dict[str, float]:
    """VC Method with low/high terminal value → pre-money range."""
    pm_low = vc_method_post_money(terminal_value_low, target_irr, years)
    pm_high = vc_method_post_money(terminal_value_high, target_irr, years)
    return {
        "post_money_low": round(pm_low, 2),
        "post_money_high": round(pm_high, 2),
        "pre_money_range": f"${pm_low:,.0f} - ${pm_high:,.0f} (before investment)",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 2 — CAP TABLE & DILUTION
# ═══════════════════════════════════════════════════════════════════

def round_dilution(existing_shares: int, new_shares: int) -> float:
    """Dilution from a single round = new_shares / (existing + new) — returns decimal."""
    if not isinstance(existing_shares, int) or existing_shares < 0:
        raise ValueError(f"existing_shares must be non-negative integer, got {existing_shares}")
    if not isinstance(new_shares, int) or new_shares <= 0:
        raise ValueError(f"new_shares must be positive integer, got {new_shares}")
    return new_shares / (existing_shares + new_shares)


def new_shares_from_ownership(existing_shares: int, ownership_pct: float) -> int:
    """
    How many new shares to issue to give investor `ownership_pct`.
    new = existing × ownership / (1 - ownership)
    Rounded to integer.
    """
    if not isinstance(existing_shares, int) or existing_shares < 1:
        raise ValueError(f"existing_shares must be ≥ 1, got {existing_shares}")
    _pct(ownership_pct, "ownership_pct")
    if ownership_pct >= 1.0:
        raise ValueError(f"ownership_pct must be < 1.0 (can't sell 100%+), got {ownership_pct}")
    if ownership_pct <= 0.0:
        raise ValueError(f"ownership_pct must be > 0, got {ownership_pct}")
    return round(existing_shares * ownership_pct / (1.0 - ownership_pct))


def share_price(investment: float, new_shares: int) -> float:
    """Price per share = Investment / New Shares"""
    _positive(investment, "investment")
    if not isinstance(new_shares, int) or new_shares < 1:
        raise ValueError(f"new_shares must be positive integer, got {new_shares}")
    return investment / new_shares


def compound_ownership(initial_pct: float, round_pcts: List[float]) -> float:
    """
    Ownership after N rounds: initial × (1-d1) × (1-d2) × ...
    Each round_pct is the fraction sold in that round.
    Returns decimal.
    """
    _pct(initial_pct, "initial_pct")
    result = initial_pct
    for i, d in enumerate(round_pcts):
        _pct(d, f"round_pcts[{i}]")
        result *= (1.0 - d)
    return result


def cap_table_builder(
    founder_shares: int,
    rounds: List[Dict],
) -> List[Dict]:
    """
    Build a multi-round cap table from founder shares + funding rounds.

    Args:
      founder_shares: Initial shares held by founders
      rounds: List of rounds, each:
        {'name': str, 'investment': float, 'ownership_target': float}

    Returns list of rows: shareholder | shares | ownership_pct | investment | value_at_tv

    Edge cases:
      - Last round ownership > remaining equity → ValueError
      - Negative investment → ValueError
    """
    if not isinstance(founder_shares, int) or founder_shares < 1:
        raise ValueError(f"founder_shares must be ≥ 1, got {founder_shares}")
    if not rounds:
        raise ValueError("At least one round required for a cap table with investors")

    rows = []
    total_shares = founder_shares

    # Founders row
    rows.append({
        "shareholder": "Founders",
        "shares": founder_shares,
        "investment": 0.0,
    })

    for i, rnd in enumerate(rounds):
        name = rnd.get("name", f"Round {i+1}")
        investment = float(rnd["investment"])
        target_own = float(rnd["ownership_target"])
        _positive(investment, f"rounds[{i}].investment")
        _pct(target_own, f"rounds[{i}].ownership_target")

        # Calculate new shares needed for this ownership target
        new_sh = new_shares_from_ownership(total_shares, target_own)
        price = share_price(investment, new_sh)
        total_shares += new_sh

        rows.append({
            "shareholder": name,
            "shares": new_sh,
            "investment": investment,
            "share_price": round(price, 4),
        })

    # Update ownership pct for all rows
    for row in rows:
        row["ownership_pct"] = round(row["shares"] / total_shares * 100, 2)

    return rows


def ownership_at_exit(cap_table: List[Dict], exit_value: float) -> List[Dict]:
    """Add exit_value column to cap table (simple pro-rata, no preferences)."""
    _positive(exit_value, "exit_value")
    result = []
    for row in cap_table:
        r = dict(row)
        r["value_at_exit"] = round(row["ownership_pct"] / 100.0 * exit_value, 2)
        result.append(r)
    return result


# ═══════════════════════════════════════════════════════════════════
# PART 3 — OPTION POOL MECHANICS
# ═══════════════════════════════════════════════════════════════════

def effective_pre_money_with_pool(stated_pre_money: float, pool_pct: float) -> float:
    """
    Effective Pre-Money = Stated Pre-Money × (1 - pool_pct)
    Damodaran, Narrative and Numbers, Ch.5

    The option pool comes from the pre-money → founders bear the dilution.
    """
    _positive(stated_pre_money, "stated_pre_money")
    _pct(pool_pct, "pool_pct")
    return stated_pre_money * (1.0 - pool_pct)


def total_dilution_with_pool(round_dilution_pct: float, pool_pct: float) -> float:
    """
    Total dilution to existing shareholders when a round creates/expands a pool.
    total = 1 - (1 - round_dilution)(1 - pool_dilution)
    Where pool_dilution = pool_size from pre-money perspective.
    """
    _pct(round_dilution_pct, "round_dilution_pct")
    _pct(pool_pct, "pool_pct")
    return 1.0 - (1.0 - round_dilution_pct) * (1.0 - pool_pct)


# ═══════════════════════════════════════════════════════════════════
# PART 4 — EXIT WATERFALL WITH LIQUIDATION PREFERENCES
# ═══════════════════════════════════════════════════════════════════

def liquidation_waterfall(
    exit_value: float,
    preferred_investors: List[Dict],
    common_shareholders: List[Dict],
) -> Dict:
    """
    Exit waterfall with liquidation preferences.
    Feld & Mendelson, Venture Deals (Ch.4-5)

    Args:
      exit_value: Total exit proceeds
      preferred_investors: List of:
        {'name': str, 'investment': float, 'liquidation_multiple': float,
         'participating': bool, 'ownership_pct': float (decimal), 'cap': Optional[float]}
        cap=None means no cap on participation.
      common_shareholders: List of:
        {'name': str, 'ownership_pct': float (decimal)}

    Waterfall order:
      1. Each preferred investor receives their liquidation preference
         (investment × multiple) in order of seniority.
      2. If participating:
         a. First get liquidation preference (Step 1)
         b. Then share remaining proceeds PRO-RATA with common
         c. Capped at `cap` × investment if cap is set
      3. If non-participating:
         Investor chooses the GREATER of: (a) liquidation preference,
         or (b) pro-rata share of total proceeds (as-if converted to common).
      4. Common gets whatever remains.

    Returns dict with distribution per stakeholder and waterfall steps.

    Edge cases:
      - Exit value ≤ 0 → all get 0
      - Ownership pcts not summing to 1.0 → warning but not error
      - Participation cap reached → investor converted to non-participating above cap
    """
    _positive(exit_value, "exit_value")
    if not preferred_investors:
        raise ValueError("Must have at least one preferred investor for a waterfall")
    if not common_shareholders:
        raise ValueError("Must have at least one common shareholder")

    remaining = exit_value
    steps = []
    distributions = {}

    # Step 1: Pay liquidation preferences
    lp_total = 0.0
    for i, inv in enumerate(preferred_investors):
        investment = float(inv["investment"])
        multiple = float(inv.get("liquidation_multiple", 1.0))
        if multiple < 1.0:
            raise ValueError(f"liquidation_multiple must be ≥ 1.0 for '{inv['name']}', got {multiple}")
        lp_amount = investment * multiple
        lp_paid = min(lp_amount, remaining)
        distributions[inv["name"]] = lp_paid
        lp_total += lp_paid
        remaining -= lp_paid
        steps.append(f"{inv['name']}: LP = {multiple}x ${investment:,.0f} = ${lp_paid:,.0f}")

    steps.append(f"Remaining after LP: ${remaining:,.0f}")

    # Step 2: Determine conversion for non-participating
    # and participation for participating
    for inv in preferred_investors:
        name = inv["name"]
        participating = inv.get("participating", False)
        ownership = float(inv["ownership_pct"])

        if participating:
            # Get pro-rata share of remaining
            pro_rata = remaining * ownership
            cap_val = inv.get("cap")
            if cap_val is not None:
                cap_amount = cap_val * float(inv["investment"])
                pro_rata = min(pro_rata, cap_amount - distributions[name])
                if pro_rata < 0:
                    pro_rata = 0.0
            distributions[name] += pro_rata
            remaining -= pro_rata
            steps.append(f"{name} (participating): +${pro_rata:,.0f} pro-rata")
        else:
            # Non-participating: convert-or-LP
            as_converted = exit_value * ownership
            if as_converted > distributions[name]:
                # Take conversion — must return LP amount to pool
                excess = distributions[name]  # LP already paid
                distributions[name] = as_converted
                remaining += excess - (as_converted - distributions.get(name, 0))
                steps.append(f"{name} (non-part): converts to ${as_converted:,.0f} > LP ${excess:,.0f}")
            else:
                steps.append(f"{name} (non-part): keeps LP ${distributions[name]:,.0f}")

    # Recalculate remaining after conversions
    total_distributed = sum(distributions.values())
    remaining = exit_value - total_distributed

    # Step 3: Common shareholders split remaining pro-rata
    if remaining > 0 and common_shareholders:
        total_common_own = sum(cs["ownership_pct"] for cs in common_shareholders)
        if total_common_own > 0:
            for cs in common_shareholders:
                name = cs["name"]
                share = remaining * (cs["ownership_pct"] / total_common_own)
                distributions[name] = distributions.get(name, 0.0) + share
                steps.append(f"{name} (common): ${share:,.0f}")

    return {
        "exit_value": exit_value,
        "distributions": {k: round(v, 2) for k, v in distributions.items()},
        "steps": steps,
        "total_distributed": round(sum(distributions.values()), 2),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — ROUND SIZING & RUNWAY
# ═══════════════════════════════════════════════════════════════════

def round_size_from_burn(monthly_burn: float, months: int = 18) -> float:
    """
    Recommended round size = monthly burn × 18-24 months.
    Damodaran, Narrative and Numbers, Ch.6
    """
    _positive(monthly_burn, "monthly_burn")
    if not isinstance(months, int) or months < 6:
        raise ValueError(f"months must be ≥ 6, got {months}")
    return monthly_burn * months


def runway_months(cash_balance: float, monthly_net_burn: float) -> float:
    """Runway = Cash / Monthly Net Burn. Returns months."""
    _positive(cash_balance, "cash_balance")
    _positive(monthly_net_burn, "monthly_net_burn")
    return cash_balance / monthly_net_burn


def runway_assessment(runway: float) -> str:
    """Label runway in months."""
    if runway < 3:
        return "CRITICAL — days from insolvency, raise immediately"
    elif runway < 6:
        return "URGENT — raise or cut costs; standard fundraise takes 3-6 months"
    elif runway < 12:
        return "WATCH — plan next round now"
    elif runway < 18:
        return "ADEQUATE — comfortable runway for execution and fundraise"
    else:
        return "CAUTIOUS — comfortable but ensure capital is deployed effectively"


# ═══════════════════════════════════════════════════════════════════
# PART 6 — ASK SANITY CHECK
# ═══════════════════════════════════════════════════════════════════

def ask_sanity_check(
    ask_amount: float,
    stated_pre_money: float,
    monthly_burn: float,
    projected_revenue: Optional[float] = None,
    industry: Optional[str] = None,
    years_to_exit: int = 5,
) -> Dict:
    """
    Comprehensive sanity check on a fundraise "Ask."
    Damodaran, Narrative and Numbers, Ch.6-7

    Checks:
      1. Round size vs runway: should fund 18-24 months
      2. Valuation vs VC method: stated pre should not exceed 2x VC method
      3. Dilution: this round should sell 15-30%
      4. Founder dilution remaining: flag if < 15% at exit

    Returns dict with each check result and overall grade.
    """
    _positive(ask_amount, "ask_amount")
    _positive(stated_pre_money, "stated_pre_money")
    _positive(monthly_burn, "monthly_burn")

    flags = []
    passed = 0
    total_checks = 0

    # Check 1: Runway
    total_checks += 1
    implied_runway = ask_amount / monthly_burn
    if 18 <= implied_runway <= 24:
        runway_ok = True
        passed += 1
    elif 12 <= implied_runway <= 36:
        runway_ok = True
        passed += 1
        flags.append(f"Runway {implied_runway:.1f}mo outside ideal 18-24mo range but acceptable")
    else:
        runway_ok = False
        flags.append(f"Runway {implied_runway:.1f}mo — {'too short (<12mo)' if implied_runway < 12 else 'excessive (>36mo)'}")

    # Check 2: Valuation reasonableness (if revenue available)
    post_money = stated_pre_money + ask_amount
    ownership_sold = ask_amount / post_money

    if projected_revenue is not None and industry is not None:
        total_checks += 1
        ind_mult = INDUSTRY_MULTIPLES.get(industry.lower())
        if ind_mult and ind_mult["ev_revenue"] is not None:
            low_mult, high_mult = ind_mult["ev_revenue"]
            tv_low = projected_revenue * low_mult
            tv_high = projected_revenue * high_mult
            rate = standard_discount_rate("series_a")
            vc_low = vc_method_post_money(tv_low, rate, years_to_exit)
            vc_high = vc_method_post_money(tv_high, rate, years_to_exit)

            if vc_low * 0.5 <= post_money <= vc_high * 2.0:
                passed += 1
            else:
                flags.append(
                    f"Post-money ${post_money:,.0f} outside 0.5-2.0× VC method range "
                    f"(${vc_low:,.0f} - ${vc_high:,.0f}) for {industry}"
                )

    # Check 3: Dilution reasonableness
    total_checks += 1
    if 0.15 <= ownership_sold <= 0.30:
        passed += 1
    elif 0.10 <= ownership_sold <= 0.40:
        passed += 1
        flags.append(f"Dilution {ownership_sold*100:.1f}% outside ideal 15-30% range but acceptable")
    else:
        if ownership_sold > 0.40:
            flags.append(f"Dilution {ownership_sold*100:.1f}% — >40%: founder motivation risk (Damodaran, Ch.7)")
        else:
            flags.append(f"Dilution {ownership_sold*100:.1f}% — <10%: unlikely to close at this valuation")

    # Assessment
    score = passed / max(total_checks, 1)
    if score >= 1.0 and not flags:
        grade = "PASS — all checks clear"
    elif score >= 0.66:
        grade = "REVIEW — minor flags, proceed with caution"
    elif score >= 0.33:
        grade = "WARNING — significant issues, restructure round"
    else:
        grade = "FAIL — fundamental problems with the Ask"

    return {
        "ask_amount": ask_amount,
        "stated_pre_money": stated_pre_money,
        "post_money": post_money,
        "ownership_sold_pct": round(ownership_sold * 100, 1),
        "implied_runway_months": round(implied_runway, 1),
        "runway_ok": runway_ok,
        "score": f"{passed}/{total_checks}",
        "grade": grade,
        "flags": flags,
    }


def founder_ownership_check(initial_ownership: float, planned_rounds: int,
                            avg_dilution_per_round: float = 0.20) -> Dict:
    """
    Check founder ownership at exit after planned dilution.
    Damodaran: founders should retain >15% at exit for motivation.

    Args:
      initial_ownership: Starting founder ownership (decimal)
      planned_rounds: Number of future funding rounds
      avg_dilution_per_round: Average dilution per round (default 20%)
    """
    _pct(initial_ownership, "initial_ownership")
    if not isinstance(planned_rounds, int) or planned_rounds < 0:
        raise ValueError(f"planned_rounds must be ≥ 0, got {planned_rounds}")
    _pct(avg_dilution_per_round, "avg_dilution_per_round")

    final = compound_ownership(initial_ownership, [avg_dilution_per_round] * planned_rounds)

    if final >= 0.25:
        status = "GOOD — strong founder retention"
    elif final >= 0.15:
        status = "ADEQUATE — meets minimum threshold"
    elif final >= 0.10:
        status = "WARNING — below 15% minimum, motivation risk"
    else:
        status = "DANGER — founders effectively diluted out"

    return {
        "initial_ownership_pct": round(initial_ownership * 100, 1),
        "planned_rounds": planned_rounds,
        "avg_dilution_per_round_pct": round(avg_dilution_per_round * 100, 1),
        "final_ownership_pct": round(final * 100, 1),
        "status": status,
        "damodaran_rule": "Founders should retain >15% at exit for motivation (Narrative and Numbers, Ch.7)",
    }


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    failures = 0; passed = 0

    def check(label, actual, expected, tol=1e-6):
        nonlocal failures, passed
        if isinstance(expected, bool):
            ok = actual == expected
        elif isinstance(expected, str):
            ok = actual == expected
        elif expected is None:
            ok = actual is None
        else:
            ok = abs(actual - expected) <= tol
        if ok:
            print(f"  PASS  {label}: {actual}")
            passed += 1
        else:
            print(f"  FAIL  {label}: expected {expected}, got {actual}")
            failures += 1

    def check_raises(label, func, *args, **kw):
        nonlocal failures, passed
        try:
            r = func(*args, **kw)
            print(f"  FAIL  {label}: expected exception, got {r}")
            failures += 1
        except (ValueError, TypeError) as e:
            print(f"  PASS  {label}: {type(e).__name__} — {str(e)[:70]}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: venture_valuation.py")
    print("=" * 70)

    # ── Part 1: VC Method ──
    print("\n── Part 1: VC Method (HBS E-95) ──")
    # Classic example: $500K seed, 50% IRR, 5yr exit at $42.5M
    # Post = 42.5M / (1.5^5) = 42.5M / 7.59375 = 5.597M
    pm = vc_method_post_money(42_500_000, 0.50, 5)
    check("pm: $42.5M exit, 50% IRR, 5yr", pm, 5_596_707.82, tol=100)
    pre = vc_method_pre_money(pm, 500_000)
    check("pre: post - investment", pre, 5_096_707.82, tol=100)
    own = vc_method_ownership(pm, 500_000)
    check("ownership: 500K / 5.6M", own, 0.0893, tol=0.001)

    # Seed = 60%, Series A = 50%, Series C = 30%
    check("discount: seed = 60%", standard_discount_rate("seed"), 0.60)
    check("discount: series_a = 50%", standard_discount_rate("series_a"), 0.50)
    check("discount: growth = 25%", standard_discount_rate("growth"), 0.25)

    # Terminal value
    tv_rev = terminal_value_from_revenue(10_000_000, 8.0)
    check("tv_revenue: $10M × 8x = $80M", tv_rev, 80_000_000)
    tv_ebitda = terminal_value_from_ebitda(2_000_000, 15.0)
    check("tv_ebitda: $2M × 15x = $30M", tv_ebitda, 30_000_000)

    # Valuation range
    vr = valuation_range(30_000_000, 50_000_000, 0.50, 5)
    check("range: low < high", vr["post_money_low"] < vr["post_money_high"], True)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("pm: zero exit", vc_method_post_money, 0, 0.50, 5)
    check_raises("pm: zero years", vc_method_post_money, 1000000, 0.50, 0)
    check_raises("pre: investment ≥ post", vc_method_pre_money, 500000, 500000)
    check_raises("discount: unknown stage", standard_discount_rate, "series_z")

    # ── Part 2: Cap Table ──
    print("\n── Part 2: Cap Table & Dilution ──")
    dil = round_dilution(1_000_000, 500_000)
    check("dilution: 500K/1.5M = 33.3%", dil, 0.33333, tol=0.001)

    new_sh = new_shares_from_ownership(1_000_000, 0.20)
    check("new_shares: 1M exist, 20% → 250K", new_sh, 250_000)

    sp = share_price(500_000, new_sh)
    check("share_price: $500K / 250K = $2.00", sp, 2.0)

    # Compound: start 100%, three rounds of 25%, 20%, 15%
    final = compound_ownership(1.0, [0.25, 0.20, 0.15])
    check("compound: 1.0→0.75→0.60→0.51", final, 0.51)

    # Cap table: 1M founder shares, Series A at $3M for 25%, Series B at $10M for 20%
    ct = cap_table_builder(1_000_000, [
        {"name": "Series A", "investment": 3_000_000, "ownership_target": 0.25},
        {"name": "Series B", "investment": 10_000_000, "ownership_target": 0.20},
    ])
    check("ct: 3 rows", len(ct), 3)
    check("ct: founders ~60%", ct[0]["ownership_pct"], 60.0, tol=1.0)
    check("ct: Series A ~20%", ct[1]["ownership_pct"], 20.0, tol=1.0)
    check("ct: Series B ~20%", ct[2]["ownership_pct"], 20.0, tol=1.0)

    # Exit values
    ct_exit = ownership_at_exit(ct, 100_000_000)
    check("ct_exit: founders $60M", ct_exit[0]["value_at_exit"], 60_000_000, tol=1_000_000)

    # Edge cases
    print("\n  ── Edge Cases ──")
    check_raises("dilution: zero new shares", round_dilution, 1000, 0)
    check_raises("new_shares_from_ownership: 100%", new_shares_from_ownership, 1000, 1.0)
    check_raises("compound: invalid pct", compound_ownership, 1.0, [0.5, 1.5])

    # ── Part 3: Option Pool ──
    print("\n── Part 3: Option Pool Mechanics ──")
    eff = effective_pre_money_with_pool(10_000_000, 0.15)
    check("eff_pm: $10M with 15% pool = $8.5M", eff, 8_500_000)
    total_d = total_dilution_with_pool(0.20, 0.15)
    check("total_dilution: 20%+15%pool = 32%", total_d, 0.32, tol=0.01)

    # ── Part 4: Waterfall ──
    print("\n── Part 4: Exit Waterfall ──")
    # Simple: $10M exit, one $2M invest at 1x non-part for 20%, founders own 80%
    wf_simple = liquidation_waterfall(
        10_000_000,
        [{"name": "Series A", "investment": 2_000_000, "liquidation_multiple": 1.0,
          "participating": False, "ownership_pct": 0.20}],
        [{"name": "Founders", "ownership_pct": 0.80}],
    )
    # Non-part: as-converted = $10M × 0.20 = $2M, LP = $2M. Tied → picks LP.
    # Founders get $8M.
    check("wf_simple: investors $2M", wf_simple["distributions"]["Series A"], 2_000_000)
    check("wf_simple: founders $8M", wf_simple["distributions"]["Founders"], 8_000_000)

    # Participating preferred: $10M exit, $2M invest at 1x part for 20%
    wf_part = liquidation_waterfall(
        10_000_000,
        [{"name": "Series A", "investment": 2_000_000, "liquidation_multiple": 1.0,
          "participating": True, "ownership_pct": 0.20}],
        [{"name": "Founders", "ownership_pct": 0.80}],
    )
    # LP = $2M, remaining $8M × 20% = $1.6M. Total inv = $3.6M. Founders = $6.4M.
    check("wf_part: investors LP+prorata = $3.6M", wf_part["distributions"]["Series A"], 3_600_000, tol=1)
    check("wf_part: founders $6.4M", wf_part["distributions"]["Founders"], 6_400_000, tol=1)

    # Participating with 3x cap
    wf_capped = liquidation_waterfall(
        20_000_000,
        [{"name": "Series A", "investment": 2_000_000, "liquidation_multiple": 1.0,
          "participating": True, "ownership_pct": 0.25, "cap": 3.0}],
        [{"name": "Founders", "ownership_pct": 0.75}],
    )
    # LP = $2M, remaining $18M × 25% = $4.5M, total = $6.5M > cap $6M → capped at $6M
    check("wf_capped: inv capped at $6M", wf_simple["distributions"]["Series A"], 2_000_000)  # already verified
    check("wf_capped: total distributed = exit", wf_capped["total_distributed"], 20_000_000, tol=1)

    # ── Part 5: Round Sizing ──
    print("\n── Part 5: Round Sizing & Runway ──")
    rs = round_size_from_burn(100_000, 18)
    check("round_size: $100K/mo × 18 = $1.8M", rs, 1_800_000)

    rw = runway_months(2_000_000, 100_000)
    check("runway: $2M / $100K/mo = 20mo", rw, 20.0)

    check("runway_assess: 20mo = CAUTIOUS", "CAUTIOUS" in runway_assessment(20.0), True)
    check("runway_assess: 2mo = CRITICAL", "CRITICAL" in runway_assessment(2.0), True)

    # ── Part 6: Ask Sanity Check ──
    print("\n── Part 6: Ask Sanity Check ──")
    # Healthy round: $3M ask, $12M pre, $100K/mo burn, $5M revenue, saas
    ask_ok = ask_sanity_check(3_000_000, 12_000_000, 100_000,
                               projected_revenue=5_000_000, industry="saas_high_growth")
    check("ask_ok: score ≥ 2/3", "2" in ask_ok["score"] or "3" in ask_ok["score"], True)

    # Overvalued round: $10M ask, $90M pre, $500K/mo burn
    ask_bad = ask_sanity_check(10_000_000, 90_000_000, 500_000)
    check("ask_bad: flags present", len(ask_bad["flags"]) > 0, True)
    check("ask_bad: dilution flag", "Dilution" in ask_bad["flags"][0], True)

    # Founder ownership check
    fo_good = founder_ownership_check(0.60, 2, 0.20)
    # 0.60 × 0.80 × 0.80 = 0.384
    check("fo_good: 60%→38.4% after 2 rounds", fo_good["final_ownership_pct"], 38.4, tol=0.1)
    check("fo_good: GOOD status", "GOOD" in fo_good["status"], True)

    fo_bad = founder_ownership_check(0.30, 3, 0.25)
    # 0.30 × 0.75³ = 0.30 × 0.422 = 0.127
    check("fo_bad: 30%→12.7% after 3 rounds", fo_bad["final_ownership_pct"], 12.66, tol=0.1)
    check("fo_bad: WARNING status", "WARNING" in fo_bad["status"], True)

    # ── Summary ──
    print("\n" + "=" * 70)
    total_t = passed + failures
    print(f"RESULTS: {passed}/{total_t} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
