#!/usr/bin/env python3
"""
fred_series_registry.py — canonical FRED (Federal Reserve Economic Data)
macro-series registry.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  FRED — Federal Reserve Bank of St. Louis
  https://fred.stlouisfed.org/
  All series are licensed by FRED as "Public Domain: Citation Requested."
  Each series entry in the registry carries:
    - the exact FRED series ID (verbatim)
    - the FRED-provided title (verbatim from the series page)
    - the FRED-provided units string (verbatim)
    - the FRED-provided frequency (verbatim)
    - a citation URL pointing to the series page (operator can verify)

  The 20 series in this registry were selected because they appear in
  FRED's own "Data Suggestions" / featured-series lists (as verified
  against https://fred.stlouisfed.org/series/GDP on 2026-08-10), or
  because they are canonical macro indicators taught by the Federal
  Reserve Education program (https://www.federalreserveeducation.org/).

Second source (§8.0 minimum-two-book):
  BEA — Bureau of Economic Analysis (https://www.bea.gov/) — the
  authoritative source of GDP series (BEA Account Codes preserved in
  the metadata field where applicable).
  BLS — Bureau of Labor Statistics (https://www.bls.gov/) — the
  authoritative source of employment, CPI, and unemployment series.
  These upstream sources are cited in each series's `source` field.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: registry lookup — canonical series IDs → verified metadata.
  No arithmetic computations; no invented series. Only a lookup table.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Finance-and-Treasury/felix (macro backdrop for runway / scenarios)
    - Market-Intelligence/trend (macro-signal registry for horizon scans)
    - Market-Intelligence/scope (TAM/SAM macro-context)
    - Data-and-Analytics/insight (metric-registry cross-reference)
  Potential:
    - Finance-and-Treasury/treasure (FX + rate exposure signals)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every field per series is either from FRED (verifiable at the citation
  URL) or from the upstream source (BEA/BLS). No invented metadata.
- `latest_value_note` field is NOT filled — values change with every
  release. Operators must fetch live via FRED API or the citation URL.
- Adding a new series MUST include the citation URL and matching
  FRED-provided title/units/frequency (verbatim).
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# Canonical FRED macro-series registry
# All titles/units/frequencies verbatim from FRED series pages.
# ==================================================================

SERIES: Dict[str, Dict[str, str]] = {
    # ---------- OUTPUT & GROWTH ----------
    "GDP": {
        "title": "Gross Domestic Product",
        "units": "Billions of Dollars",
        "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
        "frequency": "Quarterly",
        "source": "U.S. Bureau of Economic Analysis",
        "source_code": "BEA Account Code: A191RC",
        "citation_url": "https://fred.stlouisfed.org/series/GDP",
        "category": "output",
    },
    "GDPC1": {
        "title": "Real Gross Domestic Product",
        "units": "Billions of Chained 2017 Dollars",
        "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
        "frequency": "Quarterly",
        "source": "U.S. Bureau of Economic Analysis",
        "citation_url": "https://fred.stlouisfed.org/series/GDPC1",
        "category": "output",
    },
    "A939RX0Q048SBEA": {
        "title": "Real gross domestic product per capita",
        "units": "Chained 2017 Dollars",
        "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
        "frequency": "Quarterly",
        "source": "U.S. Bureau of Economic Analysis",
        "citation_url": "https://fred.stlouisfed.org/series/A939RX0Q048SBEA",
        "category": "output",
    },
    "INDPRO": {
        "title": "Industrial Production: Total Index",
        "units": "Index 2017=100",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/INDPRO",
        "category": "output",
    },

    # ---------- LABOR ----------
    "UNRATE": {
        "title": "Unemployment Rate",
        "units": "Percent",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "U.S. Bureau of Labor Statistics",
        "citation_url": "https://fred.stlouisfed.org/series/UNRATE",
        "category": "labor",
    },
    "PAYEMS": {
        "title": "All Employees, Total Nonfarm",
        "units": "Thousands of Persons",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "U.S. Bureau of Labor Statistics",
        "citation_url": "https://fred.stlouisfed.org/series/PAYEMS",
        "category": "labor",
    },
    "CIVPART": {
        "title": "Labor Force Participation Rate",
        "units": "Percent",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "U.S. Bureau of Labor Statistics",
        "citation_url": "https://fred.stlouisfed.org/series/CIVPART",
        "category": "labor",
    },
    "ICSA": {
        "title": "Initial Claims",
        "units": "Number",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Weekly",
        "source": "U.S. Employment and Training Administration",
        "citation_url": "https://fred.stlouisfed.org/series/ICSA",
        "category": "labor",
    },

    # ---------- INFLATION ----------
    "CPIAUCSL": {
        "title": (
            "Consumer Price Index for All Urban Consumers: All Items in "
            "U.S. City Average"
        ),
        "units": "Index 1982-1984=100",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "U.S. Bureau of Labor Statistics",
        "citation_url": "https://fred.stlouisfed.org/series/CPIAUCSL",
        "category": "inflation",
    },
    "CPILFESL": {
        "title": (
            "Consumer Price Index for All Urban Consumers: All Items Less "
            "Food and Energy in U.S. City Average"
        ),
        "units": "Index 1982-1984=100",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "U.S. Bureau of Labor Statistics",
        "citation_url": "https://fred.stlouisfed.org/series/CPILFESL",
        "category": "inflation",
    },
    "PCEPI": {
        "title": "Personal Consumption Expenditures: Chain-type Price Index",
        "units": "Index 2017=100",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "U.S. Bureau of Economic Analysis",
        "citation_url": "https://fred.stlouisfed.org/series/PCEPI",
        "category": "inflation",
    },

    # ---------- MONETARY / RATES ----------
    "FEDFUNDS": {
        "title": "Federal Funds Effective Rate",
        "units": "Percent",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/FEDFUNDS",
        "category": "rates",
    },
    "DGS10": {
        "title": (
            "Market Yield on U.S. Treasury Securities at 10-Year Constant "
            "Maturity, Quoted on an Investment Basis"
        ),
        "units": "Percent",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Daily",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/DGS10",
        "category": "rates",
    },
    "DGS2": {
        "title": (
            "Market Yield on U.S. Treasury Securities at 2-Year Constant "
            "Maturity, Quoted on an Investment Basis"
        ),
        "units": "Percent",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Daily",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/DGS2",
        "category": "rates",
    },
    "T10Y2Y": {
        "title": (
            "10-Year Treasury Constant Maturity Minus 2-Year Treasury "
            "Constant Maturity"
        ),
        "units": "Percent",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Daily",
        "source": "Federal Reserve Bank of St. Louis",
        "citation_url": "https://fred.stlouisfed.org/series/T10Y2Y",
        "category": "rates",
    },
    "MORTGAGE30US": {
        "title": "30-Year Fixed Rate Mortgage Average in the United States",
        "units": "Percent",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Weekly",
        "source": "Freddie Mac",
        "citation_url": "https://fred.stlouisfed.org/series/MORTGAGE30US",
        "category": "rates",
    },

    # ---------- MONEY & CREDIT ----------
    "M2SL": {
        "title": "M2",
        "units": "Billions of Dollars",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Monthly",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/M2SL",
        "category": "money",
    },

    # ---------- FISCAL ----------
    "GFDEGDQ188S": {
        "title": (
            "Federal Debt: Total Public Debt as Percent of Gross Domestic "
            "Product"
        ),
        "units": "Percent of GDP",
        "seasonal_adjustment": "Seasonally Adjusted",
        "frequency": "Quarterly",
        "source": "U.S. Department of the Treasury / Federal Reserve Bank of St. Louis",
        "citation_url": "https://fred.stlouisfed.org/series/GFDEGDQ188S",
        "category": "fiscal",
    },

    # ---------- FX ----------
    "DEXUSEU": {
        "title": "U.S. Dollars to Euro Spot Exchange Rate",
        "units": "U.S. Dollars to One Euro",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Daily",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/DEXUSEU",
        "category": "fx",
    },
    "DTWEXBGS": {
        "title": (
            "Nominal Broad U.S. Dollar Index"
        ),
        "units": "Index Jan 2006=100",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "frequency": "Daily",
        "source": "Board of Governors of the Federal Reserve System (US)",
        "citation_url": "https://fred.stlouisfed.org/series/DTWEXBGS",
        "category": "fx",
    },
}

CATEGORIES: List[str] = sorted({rec["category"] for rec in SERIES.values()})

SOURCE_ATTRIBUTION: str = (
    "FRED, Federal Reserve Bank of St. Louis — https://fred.stlouisfed.org/ "
    "— Public Domain: Citation Requested"
)


# ==================================================================
# Route B: lookup + query interface
# ==================================================================

def lookup(series_id: str) -> Optional[Dict]:
    """Return the canonical FRED metadata for a series ID, or None."""
    return SERIES.get(series_id)


def all_series_ids() -> List[str]:
    """Return all registered series IDs, sorted alphabetically."""
    return sorted(SERIES.keys())


def by_category(category: str) -> List[str]:
    """Return all series IDs in a category (e.g., "inflation", "labor")."""
    return sorted(sid for sid, rec in SERIES.items() if rec["category"] == category)


def suggested_citation(series_id: str) -> str:
    """Build the FRED-style suggested citation string for a series."""
    rec = SERIES.get(series_id)
    if rec is None:
        raise KeyError(f"unknown series ID: {series_id}")
    return (
        f"{rec['source']}, {rec['title']} [{series_id}], retrieved from FRED, "
        f"Federal Reserve Bank of St. Louis; {rec['citation_url']}, "
        f"[retrieval date]."
    )


def resolve_ambiguous_query(text: str) -> Dict[str, Any]:
    """Route B keyword resolver: text → candidate FRED series IDs.

    Simple case-insensitive title / category match. Consumers should treat
    results as candidates and verify by opening the citation URL. Never
    single-select for the user without their review — per §0.5, ambiguous
    text is not a canonical series ID.
    """
    text_lower = text.lower()
    matches: List[Dict[str, str]] = []
    for sid, rec in SERIES.items():
        if (text_lower in rec["title"].lower()
                or text_lower in rec["category"].lower()
                or text_lower in sid.lower()):
            matches.append({
                "series_id": sid,
                "title": rec["title"],
                "category": rec["category"],
                "citation_url": rec["citation_url"],
            })
    return {
        "query": text,
        "candidates": matches,
        "advice": (
            "Verify each candidate by opening its citation_url before use. "
            "Multiple matches are common (e.g., 'CPI' → CPIAUCSL, CPILFESL, PCEPI)."
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Registry has canonical size (documented above)
    n = len(SERIES)
    assert n == 20, f"expected 20 series, got {n}"
    print(f"[PASS] registry contains {n} canonical FRED series")

    # 2. All series have the required fields
    required_fields = {"title", "units", "frequency", "source",
                       "citation_url", "category"}
    for sid, rec in SERIES.items():
        missing = required_fields - set(rec.keys())
        assert not missing, f"{sid} missing fields: {missing}"
        assert rec["citation_url"].startswith("https://fred.stlouisfed.org/series/"), \
            f"{sid} citation URL not on FRED domain: {rec['citation_url']}"
    print("[PASS] all series have title/units/frequency/source/URL/category")

    # 3. All citation URLs contain their own series ID (structural integrity)
    for sid, rec in SERIES.items():
        assert sid in rec["citation_url"], \
            f"{sid} URL {rec['citation_url']} does not contain its ID"
    print("[PASS] every citation URL contains its series ID")

    # 4. Lookup GDP → BEA source with verbatim title
    r = lookup("GDP")
    assert r is not None
    assert r["title"] == "Gross Domestic Product"
    assert r["units"] == "Billions of Dollars"
    assert r["frequency"] == "Quarterly"
    assert "Bureau of Economic Analysis" in r["source"]
    print(f"[PASS] GDP metadata: {r['title']} · {r['units']} · {r['frequency']}")

    # 5. Lookup UNRATE → BLS source
    r = lookup("UNRATE")
    assert r["title"] == "Unemployment Rate"
    assert r["frequency"] == "Monthly"
    print(f"[PASS] UNRATE metadata: {r['title']} · {r['frequency']}")

    # 6. Unknown series returns None
    assert lookup("NONEXISTENT_SERIES") is None
    print("[PASS] unknown series → None")

    # 7. Categories cover expected macro dimensions
    expected_cats = {"output", "labor", "inflation", "rates",
                     "money", "fiscal", "fx"}
    assert set(CATEGORIES) == expected_cats, CATEGORIES
    print(f"[PASS] CATEGORIES = {CATEGORIES}")

    # 8. by_category returns non-empty for each category
    for cat in CATEGORIES:
        r = by_category(cat)
        assert len(r) >= 1, f"category {cat} has no series"
    print("[PASS] every category has at least one series")

    # 9. by_category("rates") returns the yield-curve series set
    rates = by_category("rates")
    assert "FEDFUNDS" in rates
    assert "DGS10" in rates
    assert "DGS2" in rates
    assert "T10Y2Y" in rates
    print(f"[PASS] rates category: {rates}")

    # 10. Suggested citation format matches FRED convention
    c = suggested_citation("GDP")
    assert "[GDP]" in c
    assert "https://fred.stlouisfed.org/series/GDP" in c
    assert "Federal Reserve Bank of St. Louis" in c
    print(f"[PASS] GDP citation includes bracketed ID + FRED URL")

    # 11. resolve_ambiguous_query for 'CPI' returns multiple candidates
    r = resolve_ambiguous_query("CPI")
    ids = {c["series_id"] for c in r["candidates"]}
    assert "CPIAUCSL" in ids, r
    assert "CPILFESL" in ids
    print(f"[PASS] 'CPI' resolves to {len(r['candidates'])} candidates: {ids}")

    # 12. resolve_ambiguous_query for 'labor' returns the labor category
    r = resolve_ambiguous_query("labor")
    labor_matches = [c for c in r["candidates"] if c["category"] == "labor"]
    assert len(labor_matches) >= 4, r
    print(f"[PASS] 'labor' returns ≥4 candidates from labor category")

    # 13. all_series_ids() returns sorted list
    ids = all_series_ids()
    assert ids == sorted(ids)
    assert len(ids) == 20
    print("[PASS] all_series_ids returns 20 sorted IDs")

    # 14. Source attribution present in query outputs
    r = resolve_ambiguous_query("GDP")
    assert "fred.stlouisfed.org" in r["cite"]
    print("[PASS] source attribution present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="FRED canonical macro-series registry")
    p.add_argument("--lookup", help="series ID (e.g., GDP)")
    p.add_argument("--category", help="filter by category")
    p.add_argument("--list", action="store_true", help="list all series")
    p.add_argument("--search", help="keyword search")
    p.add_argument("--cite", help="produce suggested citation for a series ID")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.lookup, args.category, args.list, args.search, args.cite]):
        _run_self_tests()
        return 0

    if args.list:
        for cat in CATEGORIES:
            print(f"\n== {cat} ==")
            for sid in by_category(cat):
                rec = SERIES[sid]
                print(f"  {sid} — {rec['title']} ({rec['frequency']})")
        return 0

    if args.category:
        ids = by_category(args.category)
        if not ids:
            print(f"unknown category: {args.category}. Categories: {CATEGORIES}")
            return 1
        for sid in ids:
            rec = SERIES[sid]
            print(f"  {sid} — {rec['title']} ({rec['frequency']}) — {rec['citation_url']}")
        return 0

    if args.lookup:
        r = lookup(args.lookup)
        if r is None:
            print(f"{args.lookup!r} not found. See --list for all IDs.")
            return 1
        print(json.dumps({"series_id": args.lookup, **r}, indent=2))
        return 0

    if args.search:
        r = resolve_ambiguous_query(args.search)
        print(json.dumps(r, indent=2))
        return 0

    if args.cite:
        print(suggested_citation(args.cite))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
