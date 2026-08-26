#!/usr/bin/env python3
"""
uk_companies_act.py — UK Companies Act 2006 + Companies House filing
calendar for private limited companies.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free, Open Government Licence v3.0):
  GOV.UK — "Accounts and tax returns for private limited companies"
  https://www.gov.uk/prepare-file-annual-accounts-for-limited-company
  Retrieved 2026-08-10. Deadlines table extracted verbatim.

  Underlying statutory basis: Companies Act 2006 §§ 441-442 (filing
  accounts), § 853A (confirmation statement), and Finance Act 1998
  Sch.18 § 14 (Company Tax Return). This module cites the operational
  GOV.UK guide (which restates statute in practitioner terms) rather
  than the Act sections directly, because GOV.UK is the enforced
  operational source.

Second source (§8.0 minimum-two-book):
  GOV.UK — "Running a limited company: your responsibilities"
  https://www.gov.uk/running-a-limited-company
  Confirms the confirmation-statement 14-day filing window and
  ongoing filing obligations. Same Open Government Licence v3.0.

===================================================================
ROUTE (§8.2)
===================================================================
  Route A/B: date arithmetic + registry lookup. Deadlines are verbatim
  durations; date computations follow the verbatim rules literally.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Legal-and-Compliance/scribe (UK entity template + filing calendar)
    - Legal-and-Compliance/comply (regulatory-filing calendar)
    - Finance-and-Treasury/tax (Corporation Tax calendar)
  Potential:
    - Finance-and-Treasury/ledger (accounting-period alignment)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- FILING_DEADLINES: verbatim durations from GOV.UK table
- CONFIRMATION_STATEMENT: verbatim from GOV.UK "Companies House
  requirements" — annual confirmation, 14-day filing window
- No invented penalty amounts (Companies House penalty schedule is
  operator-declared; the LATE_FILING_PENALTY_URL points to the
  operational reference).
"""

import argparse
import json
import sys
from datetime import date, timedelta
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM DEADLINES
# Source: https://www.gov.uk/prepare-file-annual-accounts-for-limited-company
# ==================================================================

FILING_DEADLINES: List[Dict[str, Any]] = [
    {
        "id": "first_accounts_companies_house",
        "action": "File first accounts with Companies House",
        "duration_months": 21,
        "measured_from": "date you registered with Companies House",
        "who_owes": "the company",
        "source_url": "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company",
    },
    {
        "id": "annual_accounts_companies_house",
        "action": "File annual accounts with Companies House",
        "duration_months": 9,
        "measured_from": "company's financial year end",
        "who_owes": "the company",
        "source_url": "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company",
    },
    {
        "id": "pay_corporation_tax",
        "action": (
            "Pay Corporation Tax or tell HMRC that your limited company "
            "does not owe any"
        ),
        "duration_months": 9,
        "extra_days": 1,
        "measured_from": "end of accounting period for Corporation Tax",
        "who_owes": "the company",
        "source_url": "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company",
    },
    {
        "id": "file_company_tax_return",
        "action": "File a Company Tax Return",
        "duration_months": 12,
        "measured_from": "end of accounting period for Corporation Tax",
        "who_owes": "the company",
        "source_url": "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company",
    },
]

# Verbatim from GOV.UK — confirmation-statement obligation
CONFIRMATION_STATEMENT: Dict[str, Any] = {
    "frequency": "at least once every 12 months",
    "filing_window_days": 14,
    "purpose": (
        "confirms that the information Companies House holds about the "
        "company is up to date (registered office, directors, share "
        "capital, PSCs, SIC code)"
    ),
    "source_url": "https://www.gov.uk/guidance/confirmation-statement-guidance",
}

# Verbatim: "There are penalties for filing late with Companies House and
# HMRC." Actual penalty amounts and calculation are operational — cite
# the GOV.UK penalties page rather than reproduce the sliding scale.
LATE_FILING_PENALTY_URL: str = (
    "https://www.gov.uk/annual-accounts/penalties-for-late-filing"
)

SOURCE_ATTRIBUTION: str = (
    "GOV.UK — Accounts and tax returns for private limited companies — "
    "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company — "
    "Open Government Licence v3.0"
)


# ==================================================================
# Route A: date arithmetic (Gregorian calendar month math)
# ==================================================================

def _add_months(d: date, months: int) -> date:
    """Add N months to a date, clamping to end-of-month if the target
    month has fewer days (e.g., Aug 31 + 6 months = Feb 28/29)."""
    total = d.month - 1 + months
    year = d.year + total // 12
    month = total % 12 + 1
    # Clamp day to last valid day of target month
    from calendar import monthrange
    last_day = monthrange(year, month)[1]
    day = min(d.day, last_day)
    return date(year, month, day)


def compute_deadline(
    deadline_id: str,
    trigger_date: date,
) -> Dict[str, Any]:
    """Compute the actual deadline date for a UK filing.

    Args:
      deadline_id: from FILING_DEADLINES (e.g., "annual_accounts_companies_house")
      trigger_date: the date of the triggering event (registration date
        for first_accounts; financial year end for annual accounts;
        accounting period end for Corporation Tax + tax return)

    Returns:
      {deadline_id, trigger_date, deadline_date, duration_months,
       source_url, cite}
    """
    rec = next((r for r in FILING_DEADLINES if r["id"] == deadline_id), None)
    if rec is None:
        raise KeyError(f"unknown deadline_id: {deadline_id}")

    deadline = _add_months(trigger_date, rec["duration_months"])
    if rec.get("extra_days"):
        deadline = deadline + timedelta(days=rec["extra_days"])

    return {
        "deadline_id": deadline_id,
        "action": rec["action"],
        "trigger_date": trigger_date.isoformat(),
        "measured_from": rec["measured_from"],
        "duration_months": rec["duration_months"],
        "extra_days": rec.get("extra_days", 0),
        "deadline_date": deadline.isoformat(),
        "source_url": rec["source_url"],
        "cite": SOURCE_ATTRIBUTION,
    }


def confirmation_statement_deadline(last_confirmation_date: date) -> Dict[str, Any]:
    """Compute the next confirmation-statement deadline.

    Args:
      last_confirmation_date: the date of the last confirmation-statement
        review period end (or the date of incorporation if none filed yet).

    Returns:
      {last_date, next_review_period_end, filing_deadline, cite}
    """
    review_period_end = _add_months(last_confirmation_date, 12)
    filing_deadline = review_period_end + timedelta(days=CONFIRMATION_STATEMENT["filing_window_days"])
    return {
        "last_confirmation_date": last_confirmation_date.isoformat(),
        "next_review_period_end": review_period_end.isoformat(),
        "filing_window_days": CONFIRMATION_STATEMENT["filing_window_days"],
        "filing_deadline": filing_deadline.isoformat(),
        "cite": SOURCE_ATTRIBUTION,
    }


def all_deadline_ids() -> List[str]:
    return [r["id"] for r in FILING_DEADLINES]


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Registry size
    assert len(FILING_DEADLINES) == 4
    print(f"[PASS] 4 verbatim UK filing deadlines registered")

    # 2. Verbatim durations
    ids_and_months = {r["id"]: r["duration_months"] for r in FILING_DEADLINES}
    assert ids_and_months["first_accounts_companies_house"] == 21
    assert ids_and_months["annual_accounts_companies_house"] == 9
    assert ids_and_months["pay_corporation_tax"] == 9
    assert ids_and_months["file_company_tax_return"] == 12
    print(f"[PASS] verbatim durations: 21/9/9+1/12 months")

    # 3. Corporation Tax has extra_days=1
    ct = next(r for r in FILING_DEADLINES if r["id"] == "pay_corporation_tax")
    assert ct["extra_days"] == 1
    print(f"[PASS] Corporation Tax deadline is 9 months + 1 day")

    # 4. First accounts: registered 2026-04-15 → deadline 2028-01-15 (21 months later)
    r = compute_deadline("first_accounts_companies_house", date(2026, 4, 15))
    assert r["deadline_date"] == "2028-01-15"
    print(f"[PASS] first accounts: registered 2026-04-15 → {r['deadline_date']}")

    # 5. Annual accounts: FYE 2026-03-31 → 2026-12-31 (9 months later)
    r = compute_deadline("annual_accounts_companies_house", date(2026, 3, 31))
    assert r["deadline_date"] == "2026-12-31"
    print(f"[PASS] annual accounts: FYE 2026-03-31 → {r['deadline_date']}")

    # 6. End-of-month clamp: FYE 2026-05-31 → +9mo = 2027-02-28 (Feb has 28 days)
    r = compute_deadline("annual_accounts_companies_house", date(2026, 5, 31))
    assert r["deadline_date"] == "2027-02-28"
    print(f"[PASS] end-of-month clamp: 2026-05-31 + 9mo → {r['deadline_date']} (Feb 28)")

    # 7. Corporation Tax: AP end 2026-03-31 → 9mo + 1d = 2027-01-01
    r = compute_deadline("pay_corporation_tax", date(2026, 3, 31))
    assert r["deadline_date"] == "2027-01-01"
    print(f"[PASS] Corporation Tax: AP end 2026-03-31 → {r['deadline_date']}")

    # 8. Company Tax Return: AP end 2026-03-31 → 12mo = 2027-03-31
    r = compute_deadline("file_company_tax_return", date(2026, 3, 31))
    assert r["deadline_date"] == "2027-03-31"
    print(f"[PASS] Company Tax Return: AP end 2026-03-31 → {r['deadline_date']}")

    # 9. Unknown deadline raises
    try:
        compute_deadline("bogus", date.today())
        assert False, "should have raised"
    except KeyError:
        pass
    print("[PASS] unknown deadline_id → KeyError")

    # 10. Confirmation statement: 14-day filing window
    assert CONFIRMATION_STATEMENT["filing_window_days"] == 14
    r = confirmation_statement_deadline(date(2026, 6, 15))
    # Review period ends 2027-06-15; filing deadline = +14 days = 2027-06-29
    assert r["next_review_period_end"] == "2027-06-15"
    assert r["filing_deadline"] == "2027-06-29"
    print(f"[PASS] confirmation statement: last 2026-06-15 → deadline {r['filing_deadline']}")

    # 11. Every deadline record has required fields
    for r in FILING_DEADLINES:
        assert r["id"] and r["action"] and r["duration_months"] and r["measured_from"]
        assert r["source_url"].startswith("https://www.gov.uk/")
    print("[PASS] all 4 records have id/action/duration/measured_from/URL")

    # 12. all_deadline_ids returns 4 ordered IDs
    ids = all_deadline_ids()
    assert len(ids) == 4
    assert ids[0] == "first_accounts_companies_house"
    print(f"[PASS] all_deadline_ids: {ids}")

    # 13. Citation present in outputs
    r = compute_deadline("annual_accounts_companies_house", date.today())
    assert "gov.uk" in r["cite"]
    print("[PASS] source attribution present in outputs")

    # 14. Late-filing penalty URL is exposed (not fabricated schedule)
    assert LATE_FILING_PENALTY_URL.startswith("https://www.gov.uk/")
    print(f"[PASS] penalty schedule NOT reproduced (URL exposed): {LATE_FILING_PENALTY_URL}")


def _main() -> int:
    p = argparse.ArgumentParser(description="UK Companies Act filing calendar")
    p.add_argument("--list", action="store_true", help="list all deadlines")
    p.add_argument("--compute", nargs=2, metavar=("ID", "TRIGGER_DATE"),
                   help="e.g., --compute annual_accounts_companies_house 2026-03-31")
    p.add_argument("--confirmation", metavar="LAST_DATE",
                   help="confirmation-statement deadline from last date")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.list, args.compute, args.confirmation]):
        _run_self_tests()
        return 0

    if args.list:
        print(f"UK filing deadlines ({SOURCE_ATTRIBUTION}):")
        for r in FILING_DEADLINES:
            extra = f" + {r.get('extra_days', 0)} day" if r.get("extra_days") else ""
            print(f"  {r['id']}: {r['duration_months']} months{extra} from {r['measured_from']}")
            print(f"    action: {r['action']}")
        return 0

    if args.compute:
        did, ds = args.compute
        print(json.dumps(compute_deadline(did, date.fromisoformat(ds)), indent=2))
        return 0

    if args.confirmation:
        print(json.dumps(confirmation_statement_deadline(date.fromisoformat(args.confirmation)), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
