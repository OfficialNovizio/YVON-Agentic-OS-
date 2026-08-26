#!/usr/bin/env python3
"""
frcp_rule_12.py — Federal Rules of Civil Procedure Rule 12 deadline calculator.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-07-29)
===================================================================

Primary source (institutional, public US federal law):
  Federal Rules of Civil Procedure — Rule 12
  Defenses and Objections: When and How Presented; Motion for Judgment
  on the Pleadings; Consolidating Motions; Waiving Defenses; Pretrial Hearing
  (As amended through Dec. 1, 2024)
  https://www.law.cornell.edu/rules/frcp/rule_12

  Rules extracted verbatim into the DEADLINES table below. Every timing
  cites the specific FRCP paragraph.

Second source (§8.0 minimum-two-book):
  Federal Rules of Civil Procedure — Rule 6 (Computing and Extending Time)
  https://www.law.cornell.edu/rules/frcp/rule_6
  Governs day-counting mechanics (weekend/holiday rollover, last-day
  computation). This script uses the calendar-day computation model
  per Rule 6(a)(1).

===================================================================
ROUTES (§8.2)
===================================================================
  Route A: calendar arithmetic (days-to-deadline).
  Route B: rule-based deadline classification per pleading type.

===================================================================
CONSUMERS
===================================================================
  Primary: Teams/Legal & Compliance/shield/custom/dispute-log/SKILL.md
  Potential (§13.5 promotion candidates):
    - Legal & Compliance/scribe (contract-review-routing may need to check
      response deadlines for jurisdictional variants)
    - Legal & Compliance/comply (regulatory-response deadlines may follow
      similar Rule-6 style day-counting)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every deadline cites the specific FRCP Rule paragraph.
- No jurisdictional generalisation — federal court only.
- State-court variants are OUT OF SCOPE for this script; per-state
  extractions become sibling Shared OS scripts under §13.5.
- Business-day vs calendar-day computation follows Rule 6(a)(1)
  ("every day, including intermediate Saturdays, Sundays, and legal
  holidays") — this script computes CALENDAR days with weekend rollover
  only for the LAST day (Rule 6(a)(1)(C)).
"""

import argparse
import sys
from datetime import date, timedelta
from typing import Dict, Optional


# ---------------- Deadlines table (verbatim rule extraction) ----------------

# Every entry: {days, rule_cite, description, triggered_by}
DEADLINES: Dict[str, Dict] = {
    "answer_after_service": {
        "days": 21,
        "rule": "FRCP 12(a)(1)(A)(i)",
        "description": (
            "A defendant must serve an answer within 21 days after being "
            "served with the summons and complaint."
        ),
        "triggered_by": "service_of_summons_and_complaint",
    },
    "answer_after_waiver_us": {
        "days": 60,
        "rule": "FRCP 12(a)(1)(A)(ii)",
        "description": (
            "If defendant timely waived service under Rule 4(d), 60 days "
            "after the request for a waiver was sent."
        ),
        "triggered_by": "waiver_request_sent_within_us",
    },
    "answer_after_waiver_foreign": {
        "days": 90,
        "rule": "FRCP 12(a)(1)(A)(ii)",
        "description": (
            "If waiver request was sent to defendant outside any judicial "
            "district of the United States, 90 days after it was sent."
        ),
        "triggered_by": "waiver_request_sent_outside_us",
    },
    "answer_to_counterclaim_or_crossclaim": {
        "days": 21,
        "rule": "FRCP 12(a)(1)(B)",
        "description": (
            "A party must serve an answer to a counterclaim or crossclaim "
            "within 21 days after being served with the pleading that "
            "states the counterclaim or crossclaim."
        ),
        "triggered_by": "service_of_counterclaim_or_crossclaim",
    },
    "reply_to_answer": {
        "days": 21,
        "rule": "FRCP 12(a)(1)(C)",
        "description": (
            "A party must serve a reply to an answer within 21 days after "
            "being served with an order to reply, unless the order "
            "specifies a different time."
        ),
        "triggered_by": "service_of_order_to_reply",
    },
    "answer_us_official_capacity": {
        "days": 60,
        "rule": "FRCP 12(a)(2)",
        "description": (
            "The United States, a US agency, or a US officer or employee "
            "sued only in an official capacity must serve an answer within "
            "60 days after service on the United States attorney."
        ),
        "triggered_by": "service_on_us_attorney",
    },
    "answer_us_individual_capacity": {
        "days": 60,
        "rule": "FRCP 12(a)(3)",
        "description": (
            "A US officer or employee sued in an individual capacity for "
            "an act or omission occurring in connection with duties "
            "performed on the US's behalf must serve an answer within 60 "
            "days after service on the officer or employee OR service on "
            "the US attorney, whichever is later."
        ),
        "triggered_by": "later_of_service_on_officer_or_us_attorney",
    },
    "responsive_after_motion_denied": {
        "days": 14,
        "rule": "FRCP 12(a)(4)(A)",
        "description": (
            "If the court denies the Rule 12 motion or postpones its "
            "disposition until trial, the responsive pleading must be "
            "served within 14 days after notice of the court's action."
        ),
        "triggered_by": "notice_of_denial_or_deferral",
    },
    "responsive_after_more_definite_statement": {
        "days": 14,
        "rule": "FRCP 12(a)(4)(B)",
        "description": (
            "If the court grants a motion for a more definite statement, "
            "the responsive pleading must be served within 14 days after "
            "the more definite statement is served."
        ),
        "triggered_by": "service_of_more_definite_statement",
    },
    "comply_with_more_definite_statement_order": {
        "days": 14,
        "rule": "FRCP 12(e)",
        "description": (
            "If the court orders a more definite statement and the order "
            "is not obeyed within 14 days after notice of the order or "
            "within the time the court sets, the court may strike the "
            "pleading or issue any other appropriate order."
        ),
        "triggered_by": "notice_of_order",
    },
    "motion_to_strike_by_party": {
        "days": 21,
        "rule": "FRCP 12(f)(2)",
        "description": (
            "On motion made by a party either before responding to the "
            "pleading or, if a response is not allowed, within 21 days "
            "after being served with the pleading."
        ),
        "triggered_by": "service_of_pleading",
    },
}


# The 7 defences that MAY be raised by motion under Rule 12(b)
RULE_12B_DEFENCES = [
    "lack of subject-matter jurisdiction",
    "lack of personal jurisdiction",
    "improper venue",
    "insufficient process",
    "insufficient service of process",
    "failure to state a claim upon which relief can be granted",
    "failure to join a party under Rule 19",
]


# Rule 12(h) waiver: defences waived if omitted from a pre-answer Rule 12 motion
RULE_12H_WAIVABLE = [
    "lack of personal jurisdiction",
    "improper venue",
    "insufficient process",
    "insufficient service of process",
]


# Rule 12(h)(2)-(3): defences preserved against waiver
RULE_12H_PRESERVED = [
    "failure to state a claim upon which relief can be granted",
    "failure to join a party required by Rule 19",
    "failure to state a legal defence to a claim",
    "lack of subject-matter jurisdiction",  # Rule 12(h)(3)
]


# ---------------- Day-counting (Rule 6 model, simplified) ----------------

def _is_weekend(d: date) -> bool:
    """Rule 6(a)(1)(C) — last-day weekend rollover."""
    return d.weekday() >= 5


def add_days(start: date, days: int) -> date:
    """Compute the deadline date per Rule 6(a)(1).

    Method (Rule 6(a)(1)):
      (A) exclude the day of the event that triggers the period;
      (B) count every day, including intermediate Saturdays, Sundays,
          and legal holidays;
      (C) include the last day of the period, but if the last day is a
          Saturday, Sunday, or legal holiday, the period continues to run
          until the end of the next day that is not a Saturday, Sunday, or
          legal holiday.

    NOTE: this implementation does not resolve federal legal holidays;
    Rule 6(a)(6) enumerates the specific holidays. Downstream integration
    should pass a holiday-set for accurate rollover.
    """
    deadline = start + timedelta(days=days)
    # (C) roll forward if weekend
    while _is_weekend(deadline):
        deadline += timedelta(days=1)
    return deadline


def days_until(deadline: date, today: Optional[date] = None) -> int:
    """Days remaining until deadline. Negative if past."""
    today = today or date.today()
    return (deadline - today).days


# ---------------- Verdict interface (Route B) ----------------

def compute_deadline(deadline_key: str, trigger_date: date) -> Dict:
    """Given a deadline key from DEADLINES and the trigger date, return the
    full deadline record + computed date."""
    if deadline_key not in DEADLINES:
        raise KeyError(
            f"{deadline_key!r} not in DEADLINES; known: {sorted(DEADLINES)}"
        )
    rec = DEADLINES[deadline_key]
    deadline_date = add_days(trigger_date, rec["days"])
    return {
        "deadline_key": deadline_key,
        "rule": rec["rule"],
        "description": rec["description"],
        "triggered_by": rec["triggered_by"],
        "trigger_date": trigger_date.isoformat(),
        "days_allowed": rec["days"],
        "deadline_date": deadline_date.isoformat(),
    }


def defence_waived_if_omitted(defence: str) -> bool:
    """Rule 12(h)(1) — is this defence waived if omitted from a pre-answer
    Rule 12 motion?"""
    return defence in RULE_12H_WAIVABLE


def defence_preserved(defence: str) -> bool:
    """Rule 12(h)(2)-(3) — is this defence preserved against waiver?"""
    return defence in RULE_12H_PRESERVED


# ---------------- Self-tests (playbook §5.2) ----------------

def _run_self_tests() -> None:
    from datetime import date

    # 1. Standard 21-day answer deadline
    d = compute_deadline("answer_after_service", date(2026, 1, 5))  # Monday
    assert d["days_allowed"] == 21
    assert d["rule"] == "FRCP 12(a)(1)(A)(i)"
    # Jan 5 + 21 = Jan 26 (Monday); no rollover needed
    assert d["deadline_date"] == "2026-01-26", d
    print(f"[PASS] 21-day answer deadline: {d['deadline_date']} per {d['rule']}")

    # 2. 60-day US waiver deadline
    d = compute_deadline("answer_after_waiver_us", date(2026, 1, 1))
    assert d["days_allowed"] == 60
    assert d["rule"] == "FRCP 12(a)(1)(A)(ii)"
    print(f"[PASS] 60-day waiver deadline: {d['deadline_date']}")

    # 3. 90-day foreign waiver deadline
    d = compute_deadline("answer_after_waiver_foreign", date(2026, 3, 1))
    assert d["days_allowed"] == 90
    print(f"[PASS] 90-day foreign waiver deadline: {d['deadline_date']}")

    # 4. Weekend rollover per Rule 6(a)(1)(C)
    # Jan 3, 2026 is Saturday — 14 days from Dec 20, 2025 (Saturday)
    # → Jan 3 (Saturday) rolls to Jan 5 (Monday)
    d = compute_deadline("responsive_after_motion_denied", date(2025, 12, 20))
    assert d["deadline_date"] == "2026-01-05", d
    print(f"[PASS] weekend rollover: Sat Jan 3 → Mon Jan 5 per Rule 6(a)(1)(C)")

    # 5. Rule 12(h)(1) waivable defences
    assert defence_waived_if_omitted("lack of personal jurisdiction")
    assert defence_waived_if_omitted("improper venue")
    assert not defence_waived_if_omitted("failure to state a claim upon which relief can be granted")
    print(f"[PASS] Rule 12(h)(1) waivable defences correct")

    # 6. Rule 12(h)(2)-(3) preserved defences
    assert defence_preserved("failure to state a claim upon which relief can be granted")
    assert defence_preserved("lack of subject-matter jurisdiction")
    print(f"[PASS] Rule 12(h)(2)-(3) preserved defences correct")

    # 7. Rule 12(b) enumerates exactly 7 defences
    assert len(RULE_12B_DEFENCES) == 7
    assert "lack of subject-matter jurisdiction" == RULE_12B_DEFENCES[0]
    assert "failure to join a party under Rule 19" == RULE_12B_DEFENCES[6]
    print(f"[PASS] Rule 12(b) has {len(RULE_12B_DEFENCES)} defences (FRCP 12(b)(1)-(7))")

    # 8. Every deadline has a cite + description + trigger
    for key, rec in DEADLINES.items():
        assert rec["rule"].startswith("FRCP"), key
        assert rec["description"], key
        assert rec["triggered_by"], key
        assert rec["days"] > 0, key
    print(f"[PASS] all {len(DEADLINES)} deadlines have cite + description + trigger")

    # 9. days_until math sanity
    n = days_until(date(2026, 12, 31), today=date(2026, 12, 20))
    assert n == 11, n
    n = days_until(date(2026, 12, 20), today=date(2026, 12, 31))
    assert n == -11, n
    print(f"[PASS] days_until arithmetic works forward + backward")

    # 10. Unknown deadline key raises
    try:
        compute_deadline("bogus_deadline", date(2026, 1, 1))
        assert False, "expected KeyError"
    except KeyError:
        pass
    print(f"[PASS] unknown deadline key raises KeyError")


def _main() -> int:
    p = argparse.ArgumentParser(description="FRCP Rule 12 deadline calculator")
    p.add_argument("--deadline", help="deadline key (e.g. answer_after_service)")
    p.add_argument("--trigger", help="trigger date YYYY-MM-DD")
    p.add_argument("--list", action="store_true", help="list all known deadlines")
    p.add_argument("--defences", action="store_true", help="list Rule 12(b) defences")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or (not args.deadline and not args.list and not args.defences):
        _run_self_tests()
        return 0

    if args.list:
        for k, rec in DEADLINES.items():
            print(f"  {k}: {rec['days']} days per {rec['rule']}")
            print(f"    trigger: {rec['triggered_by']}")
        return 0

    if args.defences:
        print("Rule 12(b) defences (7 categories):")
        for i, d in enumerate(RULE_12B_DEFENCES, 1):
            print(f"  ({i}) {d}")
        print("\nRule 12(h)(1) — waived if omitted:")
        for d in RULE_12H_WAIVABLE: print(f"  · {d}")
        print("\nRule 12(h)(2)-(3) — preserved:")
        for d in RULE_12H_PRESERVED: print(f"  · {d}")
        return 0

    if args.deadline and args.trigger:
        trig = date.fromisoformat(args.trigger)
        result = compute_deadline(args.deadline, trig)
        for k, v in result.items():
            print(f"{k}: {v}")
        return 0

    p.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(_main())
