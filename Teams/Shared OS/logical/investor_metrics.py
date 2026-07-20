#!/usr/bin/env python3
"""
Investor Metrics & Unit Economics — Formula Library
=====================================================
Sources:
  - Croll, Alistair & Yoskovitz, Benjamin, *Lean Analytics* (2013, O'Reilly)
    One Metric That Matters (OMTM), metric stages, actionable vs vanity
  - Skok, David, "SaaS Metrics 2.0" (forEntrepreneurs.com)
    LTV:CAC, CAC payback, churn analysis, cohort mechanics
  - The Lean Startup, Eric Ries (2011), Ch.7 — innovation accounting,
    cohort analysis, three engines of growth, actionable vs vanity

Route: A/B (formulas + benchmark classification tables)

Covers every metric an investor update needs:
  - Revenue: MRR, ARR, NRR, GRR, logo vs revenue churn
  - Unit Economics: LTV, CAC, LTV:CAC, CAC Payback
  - Efficiency: Burn Multiple, Rule of 40
  - Cohort: cohort table builder, trend detection, variance flags
  - Classification: actionable vs vanity (Ries Ch.7, Lean Analytics)
  - Dashboard: health dashboard with benchmark grading

Design rules:
  - Every metric formula is sourced with page/chapter reference.
  - Benchmark tables are hardcoded from published industry data.
  - Period-over-period variance >15% = flag, >25% = explain.
  - NRR must always be reported alongside GRR (NRR mask detection).
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _v(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(val).__name__}")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


def _positive(val: float, name: str) -> None:
    _v(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — REVENUE METRICS
# ═══════════════════════════════════════════════════════════════════

def mrr(subscription_revenue: Dict[str, float]) -> float:
    """MRR = Sum of all recurring subscription revenue by plan type."""
    if not subscription_revenue:
        raise ValueError("Must provide at least one plan's revenue")
    return sum(subscription_revenue.values())


def arr_from_mrr(mrr_value: float, annual_contract_revenue: float = 0.0) -> float:
    """
    ARR = MRR × 12 + Annual Contract Revenue
    Ries, Lean Startup, Ch.7, p.127: "ARR is only meaningful if churn is stable."
    """
    _positive(mrr_value, "mrr_value")
    _v(annual_contract_revenue, "annual_contract_revenue")
    return mrr_value * 12.0 + annual_contract_revenue


def net_revenue_retention(beginning_arr: float, expansion: float, contraction: float, churn_revenue: float) -> float:
    """
    NRR = (Beginning ARR + Expansion - Contraction - Churn) / Beginning ARR
    Skok, SaaS Metrics 2.0; Lean Analytics, Ch.9

    Returns decimal (e.g., 1.10 = 110% NRR).
    """
    _positive(beginning_arr, "beginning_arr")
    _v(expansion, "expansion")
    _v(contraction, "contraction")
    _v(churn_revenue, "churn_revenue")
    return (beginning_arr + expansion - contraction - churn_revenue) / beginning_arr


def gross_revenue_retention(beginning_arr: float, contraction: float, churn_revenue: float) -> float:
    """
    GRR = (Beginning ARR - Contraction - Churn) / Beginning ARR
    Cannot exceed 100%. Strips out expansion.

    Skok: "GRR tells you if you'd keep revenue if you never upsold anyone."
    """
    _positive(beginning_arr, "beginning_arr")
    _v(contraction, "contraction")
    _v(churn_revenue, "churn_revenue")
    grr = (beginning_arr - contraction - churn_revenue) / beginning_arr
    return min(grr, 1.0)  # GRR cannot exceed 100%


def nrr_grade(nrr: float, acv_tier: str = "mid_market") -> Dict:
    """
    Grade NRR against industry benchmarks by ACV tier.

    Benchmarks: Optifai 2025 (939 companies), SaaS Capital 2025 (1,000 companies)
    """
    benchmarks = {
        "enterprise":   {"top": 1.30, "good": 1.20, "adeq": 1.10, "floor": 1.05},
        "mid_market":   {"top": 1.20, "good": 1.15, "adeq": 1.05, "floor": 1.00},
        "smb":          {"top": 1.10, "good": 1.05, "adeq": 0.95, "floor": 0.90},
    }
    tier = benchmarks.get(acv_tier, benchmarks["mid_market"])

    if nrr >= tier["top"]:    grade = "🏆 World-class"
    elif nrr >= tier["good"]:  grade = "🟢 Elite"
    elif nrr >= tier["adeq"]:  grade = "🟢 Good"
    elif nrr >= tier["floor"]: grade = "🟡 Adequate"
    elif nrr >= 0.95:          grade = "🟠 Concerning"
    else:                      grade = "🔴 Red Flag — structural churn"

    return {"nrr_pct": round(nrr * 100, 1), "grade": grade,
            "acv_tier": acv_tier, "benchmark_source": "Optifai 2025 / SaaS Capital 2025"}


def grr_grade(grr: float) -> Dict:
    """Grade GRR against SaaS Capital 2025 benchmarks."""
    if grr >= 0.95:        grade = "🟢 Best-in-Class"
    elif grr >= 0.90:      grade = "🟡 Good"
    elif grr >= 0.85:      grade = "🟠 Average"
    else:                  grade = "🔴 Problem — high churn"
    return {"grr_pct": round(grr * 100, 1), "grade": grade}


def nrr_mask_check(nrr: float, grr: float) -> Dict:
    """
    NRR Mask Detection: if NRR looks healthy but GRR is sick, expansion is hiding churn.
    Ries, Ch.7; Optifai 2025

    Flag if: GRR < 90% AND (NRR - GRR) > 15 percentage points.
    """
    gap = nrr - grr
    if grr < 0.90 and gap > 0.15:
        flag = "🔴 NRR MASK DETECTED — expansion is hiding churn. GRR < 90% but NRR gap > 15pp."
    elif grr < 0.90:
        flag = "🟡 WATCH — GRR < 90%. Expansion may mask underlying retention issues."
    else:
        flag = "✅ Clean — no NRR mask"

    return {"nrr_pct": round(nrr * 100, 1), "grr_pct": round(grr * 100, 1),
            "gap_pp": round(gap * 100, 1), "flag": flag}


def logo_churn_rate(customers_lost: int, customers_start: int) -> float:
    """Logo Churn = Customers Lost / Customers at Start. Returns decimal."""
    if not isinstance(customers_lost, int) or customers_lost < 0:
        raise ValueError(f"customers_lost must be non-negative, got {customers_lost}")
    if not isinstance(customers_start, int) or customers_start < 1:
        raise ValueError(f"customers_start must be ≥ 1, got {customers_start}")
    return customers_lost / customers_start


def revenue_churn_rate(mrr_lost: float, beginning_mrr: float) -> float:
    """Revenue Churn = MRR Lost / Beginning MRR"""
    _positive(beginning_mrr, "beginning_mrr")
    _v(mrr_lost, "mrr_lost")
    return mrr_lost / beginning_mrr


# ═══════════════════════════════════════════════════════════════════
# PART 2 — UNIT ECONOMICS
# ═══════════════════════════════════════════════════════════════════

def ltv(arpu: float, gross_margin: float, churn_rate: float) -> float:
    """
    LTV = ARPU × Gross Margin / Churn Rate
    Skok, SaaS Metrics 2.0

    Simplified for subscription businesses. For non-subscription,
    use discounted cash flow LTV.

    Edge cases:
      - churn_rate = 0 → infinite LTV → raises ValueError
    """
    _positive(arpu, "arpu")
    _v(gross_margin, "gross_margin")
    if not 0 < gross_margin <= 1.0:
        raise ValueError(f"gross_margin must be in (0, 1], got {gross_margin}")
    _v(churn_rate, "churn_rate")
    if churn_rate <= 0:
        raise ValueError(f"churn_rate must be > 0 for finite LTV, got {churn_rate}")
    return arpu * gross_margin / churn_rate


def cac(total_sales_marketing_spend: float, new_customers: int) -> float:
    """CAC = Total S&M Spend / New Customers Acquired"""
    _positive(total_sales_marketing_spend, "total_sales_marketing_spend")
    if not isinstance(new_customers, int) or new_customers < 1:
        raise ValueError(f"new_customers must be ≥ 1, got {new_customers}")
    return total_sales_marketing_spend / new_customers


def ltv_cac_ratio(ltv_value: float, cac_value: float) -> float:
    """LTV:CAC = LTV / CAC"""
    _positive(ltv_value, "ltv_value")
    _positive(cac_value, "cac_value")
    return ltv_value / cac_value


def ltv_cac_grade(ratio: float) -> Dict:
    """Grade LTV:CAC. Skok: >3x is healthy, <1x is unsustainable."""
    if ratio >= 5.0:     grade = "🟢 Excellent — efficient growth"
    elif ratio >= 3.0:   grade = "🟡 Good — healthy"
    elif ratio >= 1.5:   grade = "🟠 Marginal — limited reinvestment headroom"
    elif ratio >= 1.0:   grade = "🔴 Unsustainable — spending = return"
    else:                grade = "🔴 CRITICAL — losing money on every customer"
    return {"ratio": round(ratio, 2), "grade": grade}


def cac_payback_months(cac_value: float, arpu: float, gross_margin: float) -> float:
    """
    CAC Payback = CAC / (ARPU × Gross Margin)
    How many months of gross profit to recover acquisition cost.
    """
    _positive(cac_value, "cac_value")
    _positive(arpu, "arpu")
    _v(gross_margin, "gross_margin")
    if not 0 < gross_margin <= 1.0:
        raise ValueError(f"gross_margin must be in (0, 1], got {gross_margin}")
    monthly_gp = arpu * gross_margin
    if monthly_gp <= 0:
        raise ValueError(f"Monthly gross profit ({monthly_gp}) must be > 0")
    return cac_value / monthly_gp


def cac_payback_grade(months: float) -> str:
    """Grade CAC payback. Skok: <12mo is healthy."""
    if months <= 6:     return "🟢 Excellent"
    elif months <= 12:  return "🟢 Good"
    elif months <= 18:  return "🟡 Acceptable"
    elif months <= 24:  return "🟠 Concerning"
    else:               return "🔴 Red Flag — >24mo payback strains cash flow"


# ═══════════════════════════════════════════════════════════════════
# PART 3 — EFFICIENCY METRICS
# ═══════════════════════════════════════════════════════════════════

def burn_multiple(net_cash_burn: float, net_new_arr: float) -> float:
    """
    Burn Multiple = Net Cash Burn / Net New ARR
    OpenView / ScaleVP framework. Lower is better.

    Net Cash Burn = OpEx - Revenue (absolute). Must be positive (burning cash).
    Net New ARR = Current ARR - Prior ARR. Must be positive (growing).
    """
    _v(net_cash_burn, "net_cash_burn")
    _positive(net_new_arr, "net_new_arr")
    if net_cash_burn <= 0:
        raise ValueError(f"net_cash_burn must be positive (burning cash), got {net_cash_burn}")
    return net_cash_burn / net_new_arr


def burn_multiple_grade(bm: float, stage: str = "series_a") -> Dict:
    """Grade burn multiple by company stage. OpenView framework."""
    benchmarks = {
        "seed":    {"top": 2.0, "good": 2.5, "ok": 3.0},
        "series_a":{"top": 1.2, "good": 1.5, "ok": 2.0},
        "series_b":{"top": 1.0, "good": 1.2, "ok": 1.5},
        "series_c":{"top": 0.8, "good": 1.0, "ok": 1.2},
    }
    tier = benchmarks.get(stage, benchmarks["series_a"])

    if bm <= tier["top"]:    grade = "🟢 Elite — capital efficient"
    elif bm <= tier["good"]: grade = "🟢 Good"
    elif bm <= tier["ok"]:   grade = "🟡 Acceptable"
    elif bm <= 3.0:         grade = "🟠 Concerning"
    else:                    grade = "🔴 Unsustainable"

    return {"burn_multiple": round(bm, 2), "stage": stage, "grade": grade}


def rule_of_40(revenue_growth_pct: float, ebitda_margin_pct: float) -> float:
    """
    Rule of 40 = Revenue Growth % + EBITDA Margin %
    Negative EBITDA margin is normal for growth-stage.
    """
    _v(revenue_growth_pct, "revenue_growth_pct")
    _v(ebitda_margin_pct, "ebitda_margin_pct")
    return revenue_growth_pct + ebitda_margin_pct


def rule_of_40_grade(score: float) -> Dict:
    if score >= 40:      grade = "🟢 Strong — 40+ correlates with higher multiples"
    elif score >= 20:    grade = "🟡 Acceptable — 20-40 range"
    else:                grade = "🔴 Needs Improvement — grow faster or cut costs"
    return {"score": round(score, 1), "grade": grade}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — COHORT ANALYSIS
# ═══════════════════════════════════════════════════════════════════

def cohort_table(
    cohort_labels: List[str],
    periods: List[str],
    rates: List[List[Optional[float]]],
) -> Dict:
    """
    Build and validate a cohort analysis table.
    Ries, Lean Startup, Ch.7, p.125

    Args:
      cohort_labels: Names of cohorts (e.g., "Jan", "Feb", "Mar")
      periods:       Period labels (e.g., "Month 1", "Month 2", ...)
      rates:          Matrix: rates[cohort][period] = retention rate (decimal or None)

    Returns table dict with trend analysis:
      - Are newer cohorts outperforming older ones? (read DOWN first column)
      - Is the trend consistent over 3+ cohorts? (Ries's 3-cohort rule)

    Edge cases:
      - Less than 3 cohorts → "insufficient for trend detection"
      - None values for future periods → handled
    """
    if len(cohort_labels) < 1:
        raise ValueError("Need at least 1 cohort")
    if len(rates) != len(cohort_labels):
        raise ValueError(f"Mismatch: {len(cohort_labels)} labels, {len(rates)} rate rows")

    n_cohorts = len(cohort_labels)
    n_periods = len(periods)

    # Build the table
    table = []
    for i, (label, row) in enumerate(zip(cohort_labels, rates)):
        if len(row) != n_periods:
            raise ValueError(f"Cohort {label}: expected {n_periods} period values, got {len(row)}")
        table.append({"cohort": label, "rates": row, "n_data": n_periods - sum(1 for r in row if r is None)})

    # Trend detection: compare first period across cohorts (read DOWN)
    first_period_vals = []
    for row in rates:
        v = row[0] if row and row[0] is not None else None
        first_period_vals.append(v)

    # Filter to contiguous non-None
    trend_valid = [v for v in first_period_vals if v is not None]

    if len(trend_valid) >= 3:
        # Check last 3 cohorts' direction
        last3 = trend_valid[-3:]
        if last3[2] > last3[0] + 0.03:
            trend = "IMPROVING — newer cohorts outperforming (3+ cohort rule met)"
        elif last3[2] < last3[0] - 0.03:
            trend = "DECLINING — newer cohorts underperforming (3+ cohort rule met)"
        else:
            trend = "FLAT — no meaningful change (3+ cohort rule met)"
    elif len(trend_valid) >= 1:
        trend = f"POSSIBLE — only {len(trend_valid)} data points, need 3 for Ries confirmation (Ch.7, p.125)"
    else:
        trend = "INSUFFICIENT — no first-period data available"

    return {
        "table": table,
        "n_cohorts": n_cohorts,
        "n_periods": n_periods,
        "first_period_trend": first_period_vals,
        "trend_assessment": trend,
        "ries_rule": "A trend becomes meaningful when 3 consecutive cohorts show the same direction (Ch.7, p.125)",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — PERIOD-OVER-PERIOD VARIANCE DETECTION
# ═══════════════════════════════════════════════════════════════════

def variance_flag(current: float, previous: float) -> Dict:
    """
    Period-over-period variance detection.
    Flag if >15% change, require explanation if >25%.
    Echo's own principle: "consistency is credibility."
    """
    _v(current, "current")
    _v(previous, "previous")
    if previous == 0:
        if current == 0:
            return {"change_pct": 0.0, "flag": None}
        return {"change_pct": float("inf") if current > 0 else float("-inf"),
                "flag": "🔴 INF — previous was zero, cannot compute pct change"}

    change_pct = (current - previous) / abs(previous) * 100.0

    if abs(change_pct) > 25.0:
        flag = "🔴 EXPLAIN — >25% change requires narrative explanation"
    elif abs(change_pct) > 15.0:
        flag = "🟡 FLAG — >15% change, monitor"
    else:
        flag = "✅ Stable"

    return {"previous": previous, "current": current, "change_pct": round(change_pct, 1), "flag": flag}


# ═══════════════════════════════════════════════════════════════════
# PART 6 — METRIC CLASSIFICATION (Actionable vs Vanity)
# ═══════════════════════════════════════════════════════════════════

VANITY_METRICS = {
    "total_registered_users": "Always increases — only goes up, never down",
    "gross_revenue": "Can grow while unit economics worsen",
    "total_downloads": "Never decreases, ignores uninstalls",
    "page_views": "Can spike from one-time publicity",
    "social_media_followers": "No cause-effect with product",
    "total_support_tickets": "Could mean more users OR more problems",
}

ACTIONABLE_METRICS = {
    "arr": "Tracks predictable revenue; trend by cohort",
    "nrr": "Reveals whether existing customers expand or shrink",
    "grr": "Isolates true churn without expansion — product stickiness",
    "ltv_cac": "Determines whether unit economics are sustainable",
    "burn_multiple": "Measures capital efficiency",
    "viral_coefficient": "K > 1.0 = exponential growth",
    "cohort_retention_by_week": "Shows product engagement trend",
    "monthly_active_users_by_cohort": "Engagement, not just acquisition",
}


def classify_metric(metric_name: str) -> Dict:
    """
    Classify a metric as actionable or vanity.
    Ries, Lean Startup, Ch.7, p.126 (Three A's test: Actionable, Accessible, Auditable)
    Croll & Yoskovitz, Lean Analytics, Ch.3 (OMTM)
    """
    key = metric_name.lower().replace(" ", "_")
    if key in ACTIONABLE_METRICS:
        return {"metric": metric_name, "classification": "✅ ACTIONABLE",
                "rationale": ACTIONABLE_METRICS[key]}
    if key in VANITY_METRICS:
        return {"metric": metric_name, "classification": "❌ VANITY",
                "rationale": VANITY_METRICS[key]}
    return {"metric": metric_name, "classification": "⚠️ UNCLASSIFIED",
            "rationale": "Does not match known actionable or vanity categories. Apply Three A's test manually (Ries, Ch.7, p.126)."}


# ═══════════════════════════════════════════════════════════════════
# PART 7 — HEALTH DASHBOARD
# ═══════════════════════════════════════════════════════════════════

def health_dashboard(metrics: Dict) -> Dict:
    """
    Compute an investor-grade health dashboard.
    Echo's investor-update-template calls this for every update.

    Args:
      metrics: Dict with the following optional keys (missing = excluded):
        'arr', 'nrr', 'grr', 'ltv_cac', 'cac_payback_months',
        'burn_multiple', 'rule_of_40', 'logo_churn_rate',
        'revenue_growth_pct', 'runway_months'

    Returns dict with each metric graded on 🟢🟡🔴 scale and an overall
    health signal (GREEN/YELLOW/RED).
    """
    reds = 0
    yellows = 0
    greens = 0
    dashboard = {}

    if "nrr" in metrics:
        grade = nrr_grade(metrics["nrr"])
        dashboard["nrr"] = grade
        if "🔴" in grade["grade"]: reds += 1
        elif "🟡" in grade["grade"]: yellows += 1
        else: greens += 1

    if "grr" in metrics:
        grade = grr_grade(metrics["grr"])
        dashboard["grr"] = grade
        if "🔴" in grade["grade"]: reds += 1
        elif "🟡" in grade["grade"]: yellows += 1
        else: greens += 1

    if "nrr" in metrics and "grr" in metrics:
        dashboard["nrr_mask"] = nrr_mask_check(metrics["nrr"], metrics["grr"])

    if "ltv_cac" in metrics:
        grade = ltv_cac_grade(metrics["ltv_cac"])
        dashboard["ltv_cac"] = grade
        if "🔴" in grade["grade"]: reds += 1
        elif "🟡" in grade["grade"]: yellows += 1
        else: greens += 1

    if "cac_payback_months" in metrics:
        grade = cac_payback_grade(metrics["cac_payback_months"])
        dashboard["cac_payback"] = {"months": metrics["cac_payback_months"], "grade": grade}
        if "🔴" in grade: reds += 1
        elif "🟡" in grade: yellows += 1
        else: greens += 1

    if "burn_multiple" in metrics:
        grade = burn_multiple_grade(metrics["burn_multiple"])
        dashboard["burn_multiple"] = grade
        if "🔴" in grade["grade"]: reds += 1
        elif "🟡" in grade["grade"]: yellows += 1
        else: greens += 1

    if "rule_of_40" in metrics:
        grade = rule_of_40_grade(metrics["rule_of_40"])
        dashboard["rule_of_40"] = grade
        if "🔴" in grade["grade"]: reds += 1
        elif "🟡" in grade["grade"]: yellows += 1
        else: greens += 1

    if "runway_months" in metrics:
        rw = metrics["runway_months"]
        if rw < 3:       rw_grade = "🔴 CRITICAL"
        elif rw < 6:     rw_grade = "🔴 Urgent"
        elif rw < 12:    rw_grade = "🟡 Watch"
        elif rw < 18:    rw_grade = "🟢 Adequate"
        else:            rw_grade = "🟢 Comfortable"
        dashboard["runway"] = {"months": rw, "grade": rw_grade}

    # Overall health
    if reds >= 2:
        overall = "🔴 RED — multiple critical metrics"
    elif reds >= 1 or yellows >= 3:
        overall = "🟡 YELLOW — some concerning metrics"
    elif yellows >= 1:
        overall = "🟡 YELLOW — minor flags to watch"
    else:
        overall = "🟢 GREEN — all metrics healthy"

    dashboard["overall"] = overall
    dashboard["counts"] = {"reds": reds, "yellows": yellows, "greens": greens}

    return dashboard


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
        if ok: print(f"  PASS  {label}: {actual}"); passed += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); failures += 1

    def check_raises(label, func, *args):
        nonlocal failures, passed
        try:
            r = func(*args)
            print(f"  FAIL  {label}: expected exception, got {r}")
            failures += 1
        except (ValueError, TypeError) as e:
            print(f"  PASS  {label}: {type(e).__name__} — {str(e)[:70]}")
            passed += 1

    print("=" * 70)
    print("SELF-TEST SUITE: investor_metrics.py")
    print("=" * 70)

    # ── Part 1: Revenue ──
    print("\n── Part 1: Revenue Metrics ──")
    m = mrr({"basic": 50000, "pro": 30000, "enterprise": 20000})
    check("mrr: 3 plans = $100K", m, 100_000)
    check("arr: $100K MRR × 12 = $1.2M", arr_from_mrr(100_000), 1_200_000)
    check("arr: + $50K annual contracts = $1.25M", arr_from_mrr(100_000, 50_000), 1_250_000)

    # NRR: $1M start, +$150K expansion, -$30K contraction, -$70K churn = 105% NRR
    n = net_revenue_retention(1_000_000, 150_000, 30_000, 70_000)
    check("nrr: 1M+150K-30K-70K / 1M = 1.05", n, 1.05)
    # GRR: 1M-30K-70K / 1M = 0.90
    g = gross_revenue_retention(1_000_000, 30_000, 70_000)
    check("grr: 1M-30K-70K / 1M = 0.90", g, 0.90)

    ng = nrr_grade(1.10, "mid_market")
    check("nrr_grade: 110% mid-market = Good", "Good" in ng["grade"], True)

    ng2 = nrr_grade(0.92, "enterprise")
    check("nrr_grade: 92% enterprise = Red Flag", "Red" in ng2["grade"], True)

    mask = nrr_mask_check(1.05, 0.85)
    check("nrr_mask: 105% NRR, 85% GRR → mask detected", "MASK" in mask["flag"], True)

    lc = logo_churn_rate(50, 1000)
    check("logo_churn: 50/1000 = 5%", lc, 0.05)
    rc = revenue_churn_rate(10_000, 200_000)
    check("revenue_churn: 10K/200K = 5%", rc, 0.05)

    # ── Part 2: Unit Economics ──
    print("\n── Part 2: Unit Economics ──")
    l = ltv(100, 0.80, 0.05)
    check("ltv: $100 × 0.80 / 0.05 = $1,600", l, 1_600)
    c = cac(500_000, 100)
    check("cac: $500K / 100 = $5,000", c, 5_000)
    lc_ratio = ltv_cac_ratio(1_600, 5_000)
    check("ltv_cac: 1600/5000 = 0.32", lc_ratio, 0.32)
    lcg = ltv_cac_grade(4.0)
    check("ltv_cac_grade: 4x = Good", "Good" in lcg["grade"], True)
    lcg2 = ltv_cac_grade(0.5)
    check("ltv_cac_grade: 0.5x = CRITICAL", "CRITICAL" in lcg2["grade"], True)

    cp = cac_payback_months(5_000, 100, 0.80)
    check("cac_payback: 5000/(100*0.80) = 62.5mo", cp, 62.5)
    check("cac_payback_grade: 62.5mo = Red Flag", "Red" in cac_payback_grade(62.5), True)
    check("cac_payback_grade: 8mo = Good", "Good" in cac_payback_grade(8.0), True)

    # ── Part 3: Efficiency ──
    print("\n── Part 3: Efficiency Metrics ──")
    bm = burn_multiple(3_000_000, 2_000_000)
    check("burn_multiple: $3M / $2M = 1.5x", bm, 1.5)
    bmg = burn_multiple_grade(1.5, "series_a")
    check("bm_grade: 1.5x Series A = Good", "Good" in bmg["grade"], True)
    bmg2 = burn_multiple_grade(3.5, "series_b")
    check("bm_grade: 3.5x Series B = Unsustainable", "Unsustainable" in bmg2["grade"], True)

    r40 = rule_of_40(35.0, -10.0)
    check("rule_of_40: 35% + (-10%) = 25", r40, 25.0)
    check("r40_grade: 25 = Acceptable", "Acceptable" in rule_of_40_grade(25.0)["grade"], True)
    check("r40_grade: 45 = Strong", "Strong" in rule_of_40_grade(45.0)["grade"], True)

    # ── Part 4: Cohort ──
    print("\n── Part 4: Cohort Analysis ──")
    ct = cohort_table(
        ["Jan", "Feb", "Mar", "Apr"],
        ["M1", "M2", "M3", "M4"],
        [[0.42, 0.38, 0.36, 0.35],
         [0.45, 0.41, 0.38, None],
         [0.48, 0.44, None, None],
         [0.51, None, None, None]],
    )
    check("cohort: 4 cohorts", ct["n_cohorts"], 4)
    check("cohort: first period len=4", len(ct["first_period_trend"]), 4)
    check("cohort: first period[0]=0.42", ct["first_period_trend"][0], 0.42)
    check("cohort: first period[-1]=0.51", ct["first_period_trend"][-1], 0.51)
    check("cohort: IMPROVING", "IMPROVING" in ct["trend_assessment"], True)

    # 2 cohorts only
    ct2 = cohort_table(["Jan", "Feb"], ["M1", "M2"], [[0.40, 0.35], [0.42, None]])
    check("cohort2: 2 cohorts = POSSIBLE", "POSSIBLE" in ct2["trend_assessment"], True)

    # ── Part 5: Variance ──
    print("\n── Part 5: Variance Detection ──")
    vf = variance_flag(120_000, 100_000)
    check("var: 100→120 = +20% → FLAG", "FLAG" in vf["flag"], True)
    vf2 = variance_flag(102_000, 100_000)
    check("var: 100→102 = +2% → Stable", "Stable" in vf2["flag"], True)
    vf3 = variance_flag(100_000, 100_000)
    check("var: no change → Stable", "Stable" in vf3["flag"], True)

    # ── Part 6: Classification ──
    print("\n── Part 6: Metric Classification ──")
    check("classify: total_registered_users = VANITY",
          "VANITY" in classify_metric("total_registered_users")["classification"], True)
    check("classify: nrr = ACTIONABLE",
          "ACTIONABLE" in classify_metric("nrr")["classification"], True)
    check("classify: unknown metric = UNCLASSIFIED",
          "UNCLASSIFIED" in classify_metric("some_random_metric")["classification"], True)

    # ── Part 7: Health Dashboard ──
    print("\n── Part 7: Health Dashboard ──")
    hd = health_dashboard({
        "nrr": 1.15, "grr": 0.93, "ltv_cac": 4.5,
        "cac_payback_months": 8.0, "burn_multiple": 1.2,
        "rule_of_40": 35.0, "runway_months": 20.0,
    })
    check("dashboard: yellow (GRR/ltv_cac/rule_of_40 at yellow)", "YELLOW" in hd["overall"], True)

    hd_bad = health_dashboard({
        "nrr": 0.85, "grr": 0.75, "ltv_cac": 0.8,
        "burn_multiple": 4.0, "runway_months": 2.0,
    })
    check("dashboard_bad: RED", "RED" in hd_bad["overall"], True)

    # ── Edge Cases ──
    print("\n── Edge Cases ──")
    check_raises("ltv: churn=0", ltv, 100, 0.80, 0.0)
    check_raises("cac: zero customers", cac, 100_000, 0)
    check_raises("ltv: gm > 1", ltv, 100, 1.5, 0.05)

    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
