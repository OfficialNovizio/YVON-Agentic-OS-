#!/usr/bin/env python3
"""
irs_pub15_2026.py — IRS Publication 15 (Circular E) 2026 constants + payroll
tax computations for social security, Medicare, and supplemental wages.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (US Treasury / IRS, free, public-domain):
  IRS Publication 15 (2026) — Employer's Tax Guide (Circular E)
  https://www.irs.gov/publications/p15
  Retrieved 2026-08-10.

  Verbatim constants extracted from §"What's New" and §"Reminders":
    - Social Security tax rate — 6.2% each (employer + employee)
    - Social Security wage base 2026 — $184,500
    - Medicare tax rate — 1.45% each, unchanged from 2025
    - Additional Medicare Tax employee rate — 0.9%
    - Supplemental wages withholding rate — 22% (37% above $1 million)
    - Backup withholding rate — 24%
    - Household worker threshold 2026 — $3,000
    - Election worker threshold 2026 — $2,500
    - Section 3509 rates — reproduced verbatim from Pub 15

  Legislative context also from Pub 15: P.L. 119-21 (One Big Beautiful
  Bill Act) — permanent extension of TCJA rates, information-reporting
  threshold raised from $600 to $2,000 for 2026 payments.

Second source (§8.0 minimum-two-book):
  IRS Publication 15-T (2026) — Federal Income Tax Withholding Methods
  https://www.irs.gov/pub15t
  Referenced by Pub 15 as the source of withholding-table logic. This
  script does NOT reimplement Pub 15-T percentage-method tables (those
  are numerous and change annually — operator should use IRS-supplied
  spreadsheet or Pub 15-T directly). Federal income tax withholding
  computations are therefore out of scope; this module handles the
  fixed-rate flat taxes (SS, Medicare, supplemental, backup) only.

===================================================================
ROUTE (§8.2)
===================================================================
  Route A: closed-form arithmetic — verbatim rates applied to wage inputs.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Finance-and-Treasury/ledger (payroll journal entries)
    - Finance-and-Treasury/tax (payroll-tax filing calendar)
    - Finance-and-Treasury/felix (cash forecast: payroll tax outflows)
  Potential:
    - Finance-and-Treasury/treasure (payroll-tax cash position)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every rate cited inline against Pub 15 (2026) verbatim wording.
- Additional Medicare Tax employer withholding threshold ($200,000
  single-employer wage trigger) is set by IRC §3101(b)(2), enacted by
  the Affordable Care Act (2010), and referenced in Pub 15 §"Additional
  Medicare Tax withholding". Because that specific dollar figure was
  NOT quoted verbatim in the What's-New excerpts extracted here, it is
  exposed as ADDITIONAL_MEDICARE_TAX_WITHHOLDING_THRESHOLD_USD with a
  caution flag; operator should confirm against IRC §3101(b)(2) or the
  in-Pub-15 subsection before relying on it for withholding.
- §0.5 discipline: no invented constants. Rates outside 2026 are not
  extrapolated — operator must load the equivalent Pub 15 year.
"""

import argparse
import json
import sys
from dataclasses import dataclass
from typing import Any, Dict, Optional


# ==================================================================
# 2026 constants — VERBATIM from IRS Pub 15 (2026)
# https://www.irs.gov/publications/p15
# ==================================================================

TAX_YEAR: int = 2026

# "The rate of social security tax on taxable wages is 6.2% each for the
#  employer and employee."  — Pub 15 (2026) §What's New
SOCIAL_SECURITY_RATE_EMPLOYER: float = 0.062
SOCIAL_SECURITY_RATE_EMPLOYEE: float = 0.062

# "The social security wage base limit is $184,500." — Pub 15 (2026)
SOCIAL_SECURITY_WAGE_BASE_USD: int = 184_500

# "The Medicare tax rate is 1.45% each for the employee and employer,
#  unchanged from 2025. There is no wage base limit for Medicare tax."
MEDICARE_RATE_EMPLOYER: float = 0.0145
MEDICARE_RATE_EMPLOYEE: float = 0.0145
MEDICARE_WAGE_BASE_USD: Optional[int] = None  # no limit

# From Pub 15 §3509 rates section:
# "the employee rate of 0.9%" for Additional Medicare Tax
ADDITIONAL_MEDICARE_TAX_EMPLOYEE_RATE: float = 0.009

# Cautioned constant — IRC §3101(b)(2). Not verbatim in the excerpts
# extracted here; operator should verify against Pub 15 §"Additional
# Medicare Tax withholding" or IRC §3101(b)(2). Amended by ACA 2010.
ADDITIONAL_MEDICARE_TAX_WITHHOLDING_THRESHOLD_USD: int = 200_000
ADDITIONAL_MEDICARE_TAX_THRESHOLD_CAUTION: str = (
    "Threshold set by IRC §3101(b)(2); Pub 15 (2026) references it in "
    "§'Additional Medicare Tax withholding'. Confirm before relying on it "
    "for withholding calculations."
)

# "The withholding rate on supplemental wages remains 22% (37% if
#  supplemental wages paid to an employee during the calendar year
#  exceed $1 million)"  — Pub 15 (2026) §What's New
SUPPLEMENTAL_WAGES_RATE_STANDARD: float = 0.22
SUPPLEMENTAL_WAGES_RATE_ABOVE_1M: float = 0.37
SUPPLEMENTAL_WAGES_MILLION_THRESHOLD_USD: int = 1_000_000

# "The backup withholding rate remains 24%" — Pub 15 (2026)
BACKUP_WITHHOLDING_RATE: float = 0.24

# "P.L. 119-21 increases the aggregate reportable payment threshold from
#  $600 to $2,000."  — Pub 15 (2026) §What's New
REPORTABLE_PAYMENT_THRESHOLD_USD: int = 2_000

# "Social security and Medicare taxes apply to the wages of household
#  workers you pay $3,000 or more in cash wages in 2026."  — Pub 15 (2026)
HOUSEHOLD_WORKER_THRESHOLD_USD: int = 3_000

# "Social security and Medicare taxes apply to election workers who are
#  paid $2,500 or more in cash or an equivalent form of compensation in 2026."
ELECTION_WORKER_THRESHOLD_USD: int = 2_500

SOURCE_ATTRIBUTION: str = (
    "IRS Publication 15 (2026), Employer's Tax Guide (Circular E) — "
    "https://www.irs.gov/publications/p15 — public domain (US Government work)"
)


# ==================================================================
# Route A: closed-form payroll-tax arithmetic
# ==================================================================

@dataclass
class PayrollTaxes:
    """Result of computing employer + employee payroll taxes on wages."""
    wages_paid_usd: float
    ytd_wages_before_this_payroll_usd: float
    social_security_wages_taxable: float
    social_security_tax_employer: float
    social_security_tax_employee: float
    medicare_wages_taxable: float
    medicare_tax_employer: float
    medicare_tax_employee: float
    additional_medicare_tax_employee: float
    total_employer_liability: float
    total_employee_withholding: float
    cite: str


def _round_cents(x: float) -> float:
    """Round to cents (payroll systems compute per-paycheck to cents)."""
    return round(x + 1e-9, 2)


def compute_payroll_taxes(
    wages_paid_usd: float,
    ytd_wages_before_this_payroll_usd: float = 0.0,
) -> PayrollTaxes:
    """Compute employer + employee payroll tax on a single paycheck.

    Args:
      wages_paid_usd: gross wages in this pay period.
      ytd_wages_before_this_payroll_usd: cumulative wages already paid
        this calendar year, before this paycheck. Used to apply SS wage
        base and the $200k Additional Medicare Tax withholding threshold.

    Returns:
      PayrollTaxes with per-tax breakdown.
    """
    if wages_paid_usd < 0:
        raise ValueError("wages_paid_usd cannot be negative")
    if ytd_wages_before_this_payroll_usd < 0:
        raise ValueError("ytd_wages_before_this_payroll_usd cannot be negative")

    ytd_after = ytd_wages_before_this_payroll_usd + wages_paid_usd

    # Social Security: subject to wage base
    remaining_ss_base = max(
        0.0,
        SOCIAL_SECURITY_WAGE_BASE_USD - ytd_wages_before_this_payroll_usd,
    )
    ss_taxable = min(wages_paid_usd, remaining_ss_base)
    ss_er = _round_cents(ss_taxable * SOCIAL_SECURITY_RATE_EMPLOYER)
    ss_ee = _round_cents(ss_taxable * SOCIAL_SECURITY_RATE_EMPLOYEE)

    # Medicare: no wage base
    med_taxable = wages_paid_usd
    med_er = _round_cents(med_taxable * MEDICARE_RATE_EMPLOYER)
    med_ee = _round_cents(med_taxable * MEDICARE_RATE_EMPLOYEE)

    # Additional Medicare Tax (employee only): applies to wages paid in
    # excess of $200,000 in a calendar year, per IRC §3101(b)(2).
    threshold = ADDITIONAL_MEDICARE_TAX_WITHHOLDING_THRESHOLD_USD
    excess = max(0.0, ytd_after - max(threshold, ytd_wages_before_this_payroll_usd))
    add_med_ee = _round_cents(excess * ADDITIONAL_MEDICARE_TAX_EMPLOYEE_RATE)

    return PayrollTaxes(
        wages_paid_usd=_round_cents(wages_paid_usd),
        ytd_wages_before_this_payroll_usd=_round_cents(ytd_wages_before_this_payroll_usd),
        social_security_wages_taxable=_round_cents(ss_taxable),
        social_security_tax_employer=ss_er,
        social_security_tax_employee=ss_ee,
        medicare_wages_taxable=_round_cents(med_taxable),
        medicare_tax_employer=med_er,
        medicare_tax_employee=med_ee,
        additional_medicare_tax_employee=add_med_ee,
        total_employer_liability=_round_cents(ss_er + med_er),
        total_employee_withholding=_round_cents(ss_ee + med_ee + add_med_ee),
        cite=SOURCE_ATTRIBUTION,
    )


def supplemental_wage_withholding(
    supplemental_wages_this_year_usd: float,
) -> Dict[str, Any]:
    """Compute federal income tax withholding on supplemental wages
    using the flat-rate method (§7 of Pub 15).

    Pub 15 (2026): "The withholding rate on supplemental wages remains
    22% (37% if supplemental wages paid to an employee during the
    calendar year exceed $1 million)."

    Returns:
      {below_1m_rate, above_1m_rate, split, total_withholding, cite}
    """
    if supplemental_wages_this_year_usd < 0:
        raise ValueError("supplemental wages cannot be negative")

    below = min(supplemental_wages_this_year_usd, SUPPLEMENTAL_WAGES_MILLION_THRESHOLD_USD)
    above = max(0.0, supplemental_wages_this_year_usd - SUPPLEMENTAL_WAGES_MILLION_THRESHOLD_USD)

    wh_below = _round_cents(below * SUPPLEMENTAL_WAGES_RATE_STANDARD)
    wh_above = _round_cents(above * SUPPLEMENTAL_WAGES_RATE_ABOVE_1M)

    return {
        "supplemental_wages_ytd_usd": _round_cents(supplemental_wages_this_year_usd),
        "portion_below_1m_usd": _round_cents(below),
        "portion_above_1m_usd": _round_cents(above),
        "withholding_below_1m_at_22pct_usd": wh_below,
        "withholding_above_1m_at_37pct_usd": wh_above,
        "total_withholding_usd": _round_cents(wh_below + wh_above),
        "cite": SOURCE_ATTRIBUTION,
    }


def coverage_thresholds() -> Dict[str, Any]:
    """Return the 2026 special-employee coverage thresholds."""
    return {
        "household_worker_ss_medicare_threshold_usd": HOUSEHOLD_WORKER_THRESHOLD_USD,
        "election_worker_ss_medicare_threshold_usd": ELECTION_WORKER_THRESHOLD_USD,
        "reportable_payment_1099_threshold_usd": REPORTABLE_PAYMENT_THRESHOLD_USD,
        "backup_withholding_rate": BACKUP_WITHHOLDING_RATE,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Constants match verbatim wording
    assert SOCIAL_SECURITY_WAGE_BASE_USD == 184_500
    assert SOCIAL_SECURITY_RATE_EMPLOYEE == 0.062
    assert MEDICARE_RATE_EMPLOYEE == 0.0145
    assert SUPPLEMENTAL_WAGES_RATE_STANDARD == 0.22
    assert SUPPLEMENTAL_WAGES_RATE_ABOVE_1M == 0.37
    assert BACKUP_WITHHOLDING_RATE == 0.24
    print("[PASS] 2026 rates match verbatim Pub 15 wording")

    # 2. Simple paycheck: $5,000 gross, no YTD
    t = compute_payroll_taxes(5_000.0)
    assert t.social_security_tax_employer == 310.00, t
    assert t.social_security_tax_employee == 310.00, t
    assert t.medicare_tax_employer == 72.50, t
    assert t.medicare_tax_employee == 72.50, t
    assert t.additional_medicare_tax_employee == 0.00, t
    print(f"[PASS] $5k paycheck: SS er/ee=$310, Medicare er/ee=$72.50")

    # 3. SS wage base cap: paycheck that crosses the base
    # YTD wages already at $180,000; new paycheck $10,000
    # SS taxable = min(10_000, 184_500 - 180_000) = 4_500
    t = compute_payroll_taxes(10_000.0, ytd_wages_before_this_payroll_usd=180_000.0)
    assert t.social_security_wages_taxable == 4_500.00, t
    assert t.social_security_tax_employer == _round_cents(4_500 * 0.062), t
    # Medicare has no base
    assert t.medicare_tax_employer == 145.00, t
    print(f"[PASS] SS wage base cap: only $4,500 of $10k paycheck is SS-taxable")

    # 4. SS wage base fully exceeded
    t = compute_payroll_taxes(10_000.0, ytd_wages_before_this_payroll_usd=200_000.0)
    assert t.social_security_wages_taxable == 0.00, t
    assert t.social_security_tax_employer == 0.00, t
    # But Medicare still applies + Additional Medicare Tax on excess over $200k
    # Excess = (200k + 10k) - max(200k, 200k) = 10k
    assert t.additional_medicare_tax_employee == 90.00, t  # 10_000 * 0.009
    print(f"[PASS] YTD > SS base: SS zero, Additional Medicare Tax = $90 on $10k over $200k")

    # 5. Additional Medicare Tax boundary: YTD $195k, paycheck $10k
    # Excess = (195k + 10k) - max(200k, 195k) = 205k - 200k = 5k
    t = compute_payroll_taxes(10_000.0, ytd_wages_before_this_payroll_usd=195_000.0)
    assert t.additional_medicare_tax_employee == 45.00, t  # 5_000 * 0.009
    print(f"[PASS] Additional Medicare Tax kicks in at $200k threshold: $45 on $5k excess")

    # 6. No wages → all zero
    t = compute_payroll_taxes(0.0)
    assert t.social_security_tax_employer == 0
    assert t.medicare_tax_employer == 0
    assert t.total_employer_liability == 0
    print("[PASS] zero wages → zero taxes")

    # 7. Supplemental wages: $500k → 22% flat
    r = supplemental_wage_withholding(500_000.0)
    assert r["total_withholding_usd"] == 110_000.00, r
    print(f"[PASS] $500k supplemental → $110,000 withholding at 22%")

    # 8. Supplemental wages: $1.5M → 22% on $1M + 37% on $500k
    r = supplemental_wage_withholding(1_500_000.0)
    expected = 1_000_000 * 0.22 + 500_000 * 0.37
    assert r["total_withholding_usd"] == _round_cents(expected), r
    assert r["withholding_below_1m_at_22pct_usd"] == 220_000.00
    assert r["withholding_above_1m_at_37pct_usd"] == 185_000.00
    print(f"[PASS] $1.5M supplemental → $220k @ 22% + $185k @ 37% = ${r['total_withholding_usd']:,}")

    # 9. Negative wages rejected
    try:
        compute_payroll_taxes(-100.0)
        assert False, "should have raised"
    except ValueError:
        pass
    print("[PASS] negative wages rejected")

    # 10. Coverage thresholds returned
    ct = coverage_thresholds()
    assert ct["household_worker_ss_medicare_threshold_usd"] == 3_000
    assert ct["election_worker_ss_medicare_threshold_usd"] == 2_500
    assert ct["reportable_payment_1099_threshold_usd"] == 2_000
    print("[PASS] 2026 coverage thresholds: household $3k, election $2.5k, 1099 $2k")

    # 11. Citation present in outputs
    t = compute_payroll_taxes(1_000.0)
    assert "IRS Publication 15" in t.cite
    r = supplemental_wage_withholding(1_000.0)
    assert "IRS Publication 15" in r["cite"]
    print("[PASS] source attribution present in outputs")

    # 12. Additional Medicare threshold caution flag exposed
    assert ADDITIONAL_MEDICARE_TAX_THRESHOLD_CAUTION
    assert "IRC §3101" in ADDITIONAL_MEDICARE_TAX_THRESHOLD_CAUTION
    print("[PASS] Additional Medicare threshold caution flag present")


def _main() -> int:
    p = argparse.ArgumentParser(description="IRS Pub 15 (2026) payroll-tax calculator")
    p.add_argument("--wages", type=float, help="wages paid in this pay period (USD)")
    p.add_argument("--ytd", type=float, default=0.0, help="cumulative YTD wages before this pay period")
    p.add_argument("--supplemental", type=float, help="supplemental wages YTD for flat-rate withholding")
    p.add_argument("--thresholds", action="store_true", help="show 2026 coverage thresholds")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.wages is not None, args.supplemental is not None, args.thresholds]):
        _run_self_tests()
        return 0

    if args.wages is not None:
        t = compute_payroll_taxes(args.wages, args.ytd)
        print(json.dumps({
            "wages_paid_usd": t.wages_paid_usd,
            "ytd_before": t.ytd_wages_before_this_payroll_usd,
            "ss_taxable": t.social_security_wages_taxable,
            "ss_employer": t.social_security_tax_employer,
            "ss_employee": t.social_security_tax_employee,
            "medicare_employer": t.medicare_tax_employer,
            "medicare_employee": t.medicare_tax_employee,
            "additional_medicare_employee": t.additional_medicare_tax_employee,
            "employer_liability": t.total_employer_liability,
            "employee_withholding": t.total_employee_withholding,
            "cite": t.cite,
        }, indent=2))
        return 0

    if args.supplemental is not None:
        print(json.dumps(supplemental_wage_withholding(args.supplemental), indent=2))
        return 0

    if args.thresholds:
        print(json.dumps(coverage_thresholds(), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
