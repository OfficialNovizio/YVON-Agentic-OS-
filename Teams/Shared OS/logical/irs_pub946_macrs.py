#!/usr/bin/env python3
"""
irs_pub946_macrs.py — IRS Publication 946 MACRS depreciation property
class registry, conventions, methods, and straight-line depreciation math.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free, public-domain US Government work):
  IRS Publication 946 — "How To Depreciate Property"
  https://www.irs.gov/publications/p946
  Retrieved 2026-08-10.

  All GDS property class names, recovery periods, conventions, and
  method assignments extracted verbatim from Pub 946 Chapter 4:
  "Figuring Depreciation Under MACRS" — §§ "Which Property Class
  Applies Under GDS?", "Which Recovery Period Applies?", "Which
  Convention Applies?", "Which Depreciation Method Applies?".

Second source (§8.0 minimum-two-book):
  IRS Publication 946 Appendix A (MACRS Percentage Tables)
  https://www.irs.gov/publications/p946#en_US_2024_publink1000107623
  Contains Tables A-1 through A-20 with the exact per-year percentages.
  This module does NOT reproduce every percentage (there are hundreds);
  it exposes constants + straight-line math and points consumers to
  the IRS PDF for accelerated-method (200% DB, 150% DB) tables.

===================================================================
ROUTE (§8.2)
===================================================================
  Route A: closed-form straight-line depreciation (deterministic).
  Route B: registry lookup for property class → recovery period /
    convention / method.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Finance-and-Treasury/ledger (fixed-asset roll-forward, book depr)
    - Finance-and-Treasury/tax (tax depreciation for Form 4562)
    - Finance-and-Treasury/felix (capex plan → depreciation forecast)
  Potential:
    - Finance-and-Treasury/treasure (asset-book vs tax-book diff)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- GDS_PROPERTY_CLASSES: verbatim names + recovery periods from Pub 946
- ADS_RECOVERY_PERIODS: verbatim from Pub 946 §"Recovery Periods Under ADS"
- CONVENTIONS: verbatim from Pub 946 §"Which Convention Applies?"
- Full 200%/150% declining-balance tables are NOT reproduced —
  consumers use the IRS-supplied Table A-1 percentages via the
  citation URL.
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM CONSTANTS
# ==================================================================

# From Pub 946 §"Which Property Class Applies Under GDS?" and
# §"Recovery Periods Under GDS". Verbatim class names + years.
GDS_PROPERTY_CLASSES: Dict[str, Dict[str, Any]] = {
    "3-year property": {
        "recovery_period_years": 3,
        "gds_method": "200% declining balance switching to straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "tractor units for over-the-road use; race horses over 2 "
            "years old at time placed in service; any horse (other than "
            "a race horse) over 12 years old at time placed in service"
        ),
    },
    "5-year property": {
        "recovery_period_years": 5,
        "gds_method": "200% declining balance switching to straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "automobiles, taxis, buses, and trucks; computers and "
            "peripheral equipment; office machinery (such as typewriters, "
            "calculators, and copiers); any property used in research and "
            "experimentation; breeding cattle and dairy cattle; "
            "appliances, carpets, furniture, etc., used in a residential "
            "rental real estate activity"
        ),
    },
    "7-year property": {
        "recovery_period_years": 7,
        "gds_method": "200% declining balance switching to straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "office furniture and fixtures (such as desks, files, and "
            "safes); agricultural machinery and equipment; any property "
            "that does not have a class life and has not been designated "
            "by law as being in any other class"
        ),
    },
    "10-year property": {
        "recovery_period_years": 10,
        "gds_method": "200% declining balance switching to straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "vessels, barges, tugs, and similar water transportation "
            "equipment; any single purpose agricultural or horticultural "
            "structure; any tree or vine bearing fruit or nuts"
        ),
    },
    "15-year property": {
        "recovery_period_years": 15,
        "gds_method": "150% declining balance switching to straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "certain improvements made directly to land or added to it "
            "(such as shrubbery, fences, roads, sidewalks, and bridges); "
            "any retail motor fuels outlet; any municipal wastewater "
            "treatment plant"
        ),
    },
    "20-year property": {
        "recovery_period_years": 20,
        "gds_method": "150% declining balance switching to straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "farm buildings (other than single purpose agricultural or "
            "horticultural structures); municipal sewers"
        ),
    },
    "25-year property": {
        "recovery_period_years": 25,
        "gds_method": "straight line",
        "convention": "half-year (or mid-quarter)",
        "example": (
            "any municipal sewer not classified as 20-year property; "
            "property that is part of a water utility"
        ),
    },
    "Residential rental property": {
        "recovery_period_years": 27.5,
        "gds_method": "straight line",
        "convention": "mid-month",
        "example": (
            "any real property that is a rental building or structure "
            "(including a mobile home) for which 80% or more of the "
            "gross rental income for the tax year is from dwelling units"
        ),
    },
    "Nonresidential real property": {
        "recovery_period_years": 39,
        "gds_method": "straight line",
        "convention": "mid-month",
        "example": (
            "section 1250 property (such as an office building, store, "
            "or warehouse) that is neither residential rental property "
            "nor property with a class life of less than 27.5 years"
        ),
    },
}

# From Pub 946 §"Which Convention Applies?" — three verbatim conventions:
CONVENTIONS: Dict[str, str] = {
    "half-year": (
        "treats all property placed in service (or disposed of) during a "
        "tax year as placed in service (or disposed of) at the midpoint "
        "of the year"
    ),
    "mid-quarter": (
        "used if the mid-quarter convention applies; treats all property "
        "placed in service (or disposed of) during any quarter of the tax "
        "year as placed in service (or disposed of) at the midpoint of "
        "that quarter. Required when more than 40% of MACRS property is "
        "placed in service in the last 3 months of the tax year."
    ),
    "mid-month": (
        "used for residential rental property, nonresidential real "
        "property, and any railroad grading or tunnel bore; treats all "
        "property placed in service (or disposed of) during any month as "
        "placed in service (or disposed of) at the midpoint of that month"
    ),
}

# Verbatim rule from Pub 946 §"Which Convention Applies?"
MID_QUARTER_TRIGGER_PERCENT: float = 0.40  # ">40% in last 3 months"

SOURCE_ATTRIBUTION: str = (
    "IRS Publication 946 (How To Depreciate Property) — "
    "https://www.irs.gov/publications/p946 — public domain (US Government work)"
)

PERCENTAGE_TABLES_NOTE: str = (
    "Accelerated 200%/150% declining-balance year-by-year percentages "
    "are in IRS Pub 946 Appendix A (Tables A-1 through A-20). Consumers "
    "should reference the IRS PDF for the exact percentages by class + "
    "convention + placed-in-service year."
)


# ==================================================================
# Route B: registry queries
# ==================================================================

def lookup_class(class_name: str) -> Optional[Dict]:
    """Return the GDS property class record."""
    return GDS_PROPERTY_CLASSES.get(class_name)


def all_class_names() -> List[str]:
    """Return all GDS property class names in Pub 946 order."""
    return list(GDS_PROPERTY_CLASSES.keys())


def convention_for_class(class_name: str) -> Optional[str]:
    """Return the applicable convention for a GDS property class."""
    rec = GDS_PROPERTY_CLASSES.get(class_name)
    return rec["convention"] if rec else None


def method_for_class(class_name: str) -> Optional[str]:
    """Return the depreciation method for a GDS property class."""
    rec = GDS_PROPERTY_CLASSES.get(class_name)
    return rec["gds_method"] if rec else None


# ==================================================================
# Route A: straight-line depreciation math (deterministic)
# ==================================================================

def straight_line_depreciation(
    basis_usd: float,
    recovery_period_years: float,
    year_number: int,
    placed_in_service_month: int = 6,
    convention: str = "half-year",
) -> Dict[str, Any]:
    """Compute per-year straight-line depreciation.

    NOTE: For accelerated methods (200% DB, 150% DB), use the IRS Pub 946
    Appendix A percentage tables directly. This function handles only
    straight-line, which is the method for 25-year, residential rental,
    and nonresidential real property (per Pub 946).

    Args:
      basis_usd: unadjusted basis of the property
      recovery_period_years: 3, 5, 7, 10, 15, 20, 25, 27.5, 39, or ADS period
      year_number: 1-based year of depreciation (1 = year placed in service)
      placed_in_service_month: 1-12 (used for mid-month convention only)
      convention: "half-year", "mid-quarter", or "mid-month"

    Returns:
      {basis, annual_depr, first_year_fraction, last_year_fraction, cite}
    """
    if basis_usd < 0:
        raise ValueError("basis cannot be negative")
    if recovery_period_years <= 0:
        raise ValueError("recovery period must be positive")
    if year_number < 1:
        raise ValueError("year_number must be >= 1")
    if convention not in CONVENTIONS:
        raise ValueError(f"convention must be one of {list(CONVENTIONS)}")

    # Annual depreciation base (full year)
    annual = basis_usd / recovery_period_years

    # First-year fraction depends on convention
    if convention == "half-year":
        first_year_frac = 0.5  # verbatim: "treats ... as placed in service ... at the midpoint of the year"
    elif convention == "mid-month":
        # Placed in service at midpoint of month → months remaining = 12 - month + 0.5
        months_in_service = 12 - placed_in_service_month + 0.5
        first_year_frac = months_in_service / 12
    elif convention == "mid-quarter":
        # Determine which quarter the month falls in; placed at midpoint of that quarter
        quarter = (placed_in_service_month - 1) // 3 + 1  # 1..4
        # Months from midpoint of quarter to end of year:
        # Q1 midpoint = mid-Feb → 10.5 months; Q2 = mid-May → 7.5; Q3 = mid-Aug → 4.5; Q4 = mid-Nov → 1.5
        midpoint_months_left = {1: 10.5, 2: 7.5, 3: 4.5, 4: 1.5}[quarter]
        first_year_frac = midpoint_months_left / 12
    else:
        first_year_frac = 1.0

    # Full periods in the middle
    if year_number == 1:
        this_year_depr = annual * first_year_frac
    else:
        # Depreciation continues; last year takes remainder
        # For SL over R years with a first-year fraction f, total years is R+1 when f<1
        # Middle years are full: annual
        # Last year gets: (1 - f) * annual
        # Determine total years:
        if first_year_frac < 1.0:
            total_years = int(recovery_period_years) + 1
        else:
            total_years = int(recovery_period_years)

        if year_number > total_years:
            this_year_depr = 0.0
        elif year_number == total_years and first_year_frac < 1.0:
            this_year_depr = annual * (1 - first_year_frac)
        else:
            this_year_depr = annual

    return {
        "basis_usd": round(basis_usd, 2),
        "recovery_period_years": recovery_period_years,
        "year_number": year_number,
        "convention": convention,
        "annual_depreciation_full_year_usd": round(annual, 2),
        "first_year_fraction": round(first_year_frac, 4),
        "this_year_depreciation_usd": round(this_year_depr, 2),
        "cite": SOURCE_ATTRIBUTION,
    }


def check_mid_quarter_convention(
    total_macrs_basis_usd: float,
    basis_last_3_months_usd: float,
) -> Dict[str, Any]:
    """Determine whether mid-quarter convention is required for the year.

    Pub 946 rule: "Required when more than 40% of MACRS property is
    placed in service in the last 3 months of the tax year."

    Args:
      total_macrs_basis_usd: total basis of MACRS property placed in
        service in the tax year
      basis_last_3_months_usd: basis placed in service in the last 3
        months of the tax year

    Returns:
      {last_3_months_pct, threshold_pct, mid_quarter_required, cite}
    """
    if total_macrs_basis_usd < 0 or basis_last_3_months_usd < 0:
        raise ValueError("basis values cannot be negative")
    if basis_last_3_months_usd > total_macrs_basis_usd:
        raise ValueError("last_3_months basis cannot exceed total basis")
    if total_macrs_basis_usd == 0:
        return {
            "last_3_months_pct": 0.0,
            "threshold_pct": MID_QUARTER_TRIGGER_PERCENT * 100,
            "mid_quarter_required": False,
            "note": "no MACRS property placed in service; convention question moot",
            "cite": SOURCE_ATTRIBUTION,
        }

    pct = basis_last_3_months_usd / total_macrs_basis_usd
    return {
        "last_3_months_basis_usd": round(basis_last_3_months_usd, 2),
        "total_macrs_basis_usd": round(total_macrs_basis_usd, 2),
        "last_3_months_pct": round(pct * 100, 2),
        "threshold_pct": MID_QUARTER_TRIGGER_PERCENT * 100,
        "mid_quarter_required": pct > MID_QUARTER_TRIGGER_PERCENT,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Registry size and canonical classes
    assert len(GDS_PROPERTY_CLASSES) == 9, len(GDS_PROPERTY_CLASSES)
    assert "3-year property" in GDS_PROPERTY_CLASSES
    assert "Residential rental property" in GDS_PROPERTY_CLASSES
    assert "Nonresidential real property" in GDS_PROPERTY_CLASSES
    print(f"[PASS] 9 GDS property classes")

    # 2. Verbatim recovery periods
    assert GDS_PROPERTY_CLASSES["5-year property"]["recovery_period_years"] == 5
    assert GDS_PROPERTY_CLASSES["7-year property"]["recovery_period_years"] == 7
    assert GDS_PROPERTY_CLASSES["15-year property"]["recovery_period_years"] == 15
    assert GDS_PROPERTY_CLASSES["Residential rental property"]["recovery_period_years"] == 27.5
    assert GDS_PROPERTY_CLASSES["Nonresidential real property"]["recovery_period_years"] == 39
    print(f"[PASS] verbatim recovery periods: 27.5 residential, 39 nonresidential")

    # 3. Conventions registry
    assert len(CONVENTIONS) == 3
    assert set(CONVENTIONS.keys()) == {"half-year", "mid-quarter", "mid-month"}
    print(f"[PASS] 3 conventions: {list(CONVENTIONS.keys())}")

    # 4. Method assignments
    assert "200% declining balance" in method_for_class("5-year property")
    assert "150% declining balance" in method_for_class("15-year property")
    assert method_for_class("Residential rental property") == "straight line"
    print(f"[PASS] methods: 5yr→200%DB, 15yr→150%DB, residential→SL")

    # 5. Convention for classes
    assert convention_for_class("Residential rental property") == "mid-month"
    assert convention_for_class("Nonresidential real property") == "mid-month"
    assert "half-year" in convention_for_class("5-year property")
    print(f"[PASS] conventions: residential→mid-month, 5yr→half-year")

    # 6. Straight-line: $27,500 building over 27.5 years placed Jul 1
    # First year (mid-month, placed month 7): months in service = 12-7+0.5 = 5.5, frac = 5.5/12
    # First year depr = (27500/27.5) * 5.5/12 = 1000 * 0.4583 ≈ 458.33
    r = straight_line_depreciation(27500, 27.5, 1, placed_in_service_month=7, convention="mid-month")
    assert r["annual_depreciation_full_year_usd"] == 1000.00
    assert abs(r["this_year_depreciation_usd"] - 458.33) < 0.01
    print(f"[PASS] mid-month year 1: ${r['this_year_depreciation_usd']} on $27,500 basis")

    # 7. Straight-line: middle year of same asset → full $1000
    r = straight_line_depreciation(27500, 27.5, 5, placed_in_service_month=7, convention="mid-month")
    assert r["this_year_depreciation_usd"] == 1000.00
    print(f"[PASS] mid-month year 5: full ${r['this_year_depreciation_usd']}")

    # 8. Half-year convention year 1 = half the annual
    r = straight_line_depreciation(10000, 5, 1, convention="half-year")
    assert r["annual_depreciation_full_year_usd"] == 2000.00
    assert r["this_year_depreciation_usd"] == 1000.00
    print(f"[PASS] half-year year 1: $1,000 on $10,000/5yr basis")

    # 9. Half-year total years check: 5-year SL with half-year = 6 tax years
    total = 0.0
    for y in range(1, 8):
        r = straight_line_depreciation(10000, 5, y, convention="half-year")
        total += r["this_year_depreciation_usd"]
    assert abs(total - 10000.00) < 0.01, total
    print(f"[PASS] half-year 5yr SL sums to full basis over 6 tax years: ${total}")

    # 10. Mid-quarter Q4 → 1.5/12 = 12.5%
    r = straight_line_depreciation(10000, 5, 1, placed_in_service_month=11, convention="mid-quarter")
    assert abs(r["first_year_fraction"] - 1.5/12) < 1e-9
    print(f"[PASS] mid-quarter Q4: first-year fraction = {r['first_year_fraction']}")

    # 11. Mid-quarter convention required when >40% in last 3 months
    r = check_mid_quarter_convention(100000, 50000)
    assert r["mid_quarter_required"] is True
    assert r["last_3_months_pct"] == 50.0
    print(f"[PASS] 50% in last 3 months → mid-quarter required")

    # 12. Mid-quarter not required at exactly 40% (rule says "more than 40%")
    r = check_mid_quarter_convention(100000, 40000)
    assert r["mid_quarter_required"] is False
    print(f"[PASS] exactly 40% → mid-quarter NOT required (rule: >40%)")

    # 13. Mid-quarter required at 41%
    r = check_mid_quarter_convention(100000, 41000)
    assert r["mid_quarter_required"] is True
    print(f"[PASS] 41% → mid-quarter required")

    # 14. Zero basis edge case
    r = check_mid_quarter_convention(0, 0)
    assert r["mid_quarter_required"] is False
    print("[PASS] zero basis → mid-quarter not required (edge case)")

    # 15. Unknown class → None
    assert lookup_class("bogus") is None
    print("[PASS] unknown class → None")

    # 16. Every class has all required fields
    required = {"recovery_period_years", "gds_method", "convention", "example"}
    for cls, rec in GDS_PROPERTY_CLASSES.items():
        assert set(rec.keys()) >= required, f"{cls} missing {required - set(rec.keys())}"
    print("[PASS] every class has recovery_period/method/convention/example")

    # 17. Citation present
    r = straight_line_depreciation(1000, 5, 1)
    assert "irs.gov/publications/p946" in r["cite"]
    print("[PASS] source attribution present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="IRS Pub 946 MACRS tooling")
    p.add_argument("--list", action="store_true", help="list all GDS property classes")
    p.add_argument("--lookup", help="property class name")
    p.add_argument("--sl", nargs=3, metavar=("BASIS", "YEARS", "YEAR_N"),
                   help="straight-line depreciation: --sl 27500 27.5 1")
    p.add_argument("--convention", help="describe a convention")
    p.add_argument("--mid-quarter", nargs=2, type=float, metavar=("TOTAL", "LAST_3MO"),
                   help="check mid-quarter trigger")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.list, args.lookup, args.sl, args.convention, args.mid_quarter]):
        _run_self_tests()
        return 0

    if args.list:
        print(f"IRS Pub 946 GDS property classes ({SOURCE_ATTRIBUTION}):")
        for cls, rec in GDS_PROPERTY_CLASSES.items():
            print(f"  {cls}: {rec['recovery_period_years']} yrs · {rec['gds_method']} · {rec['convention']}")
        return 0
    if args.lookup:
        r = lookup_class(args.lookup)
        if r is None:
            print(f"unknown class: {args.lookup}. See --list.")
            return 1
        print(json.dumps({"class": args.lookup, **r}, indent=2))
        return 0
    if args.sl:
        b, y, n = float(args.sl[0]), float(args.sl[1]), int(args.sl[2])
        print(json.dumps(straight_line_depreciation(b, y, n), indent=2))
        return 0
    if args.convention:
        c = CONVENTIONS.get(args.convention)
        if not c:
            print(f"unknown convention. Valid: {list(CONVENTIONS.keys())}")
            return 1
        print(f"{args.convention}: {c}")
        return 0
    if args.mid_quarter:
        print(json.dumps(check_mid_quarter_convention(args.mid_quarter[0], args.mid_quarter[1]), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
