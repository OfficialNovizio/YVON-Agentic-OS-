#!/usr/bin/env python3
"""
frcp_rule_26.py — Federal Rules of Civil Procedure Rule 26 deadlines,
proportionality factors, and expert-report completeness checker.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free, public-domain US Government work):
  Federal Rules of Civil Procedure — Rule 26. Duty to Disclose;
  General Provisions Governing Discovery
  Legal Information Institute, Cornell Law School:
  https://www.law.cornell.edu/rules/frcp/rule_26

  All deadline durations, disclosure categories, proportionality
  factors, and expert-report requirements extracted verbatim.

Second source (§8.0 minimum-two-book):
  Federal Rules of Civil Procedure — Rule 6. Computing and Extending
  Time
  https://www.law.cornell.edu/rules/frcp/rule_6
  Used for day-computation semantics (weekend/holiday rollover) — same
  approach as the existing frcp_rule_12.py extraction.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: deadline calculator + registry lookups + rule-based
  completeness checker for expert reports. All content verbatim from
  Rule 26; no invented durations or requirements.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Legal-and-Compliance/shield (litigation calendar, discovery
      deadline tracker, expert-report review)
  Potential:
    - Legal-and-Compliance/scribe (contract-dispute discovery workflows)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- DEADLINES: verbatim from Rule 26(a)(1)(C), (a)(1)(D), (a)(2)(D),
  (a)(3)(B), (f)(1).
- PROPORTIONALITY_FACTORS: verbatim from Rule 26(b)(1).
- EXPERT_REPORT_REQUIREMENTS: verbatim from Rule 26(a)(2)(B)(i)–(vi).
- SCOPE_TEST_LANGUAGE: verbatim from Rule 26(b)(1).
- day-computation: reuses `add_days` from frcp_rule_12.py so semantics
  match (weekend rollover per Rule 6).
- Complementary to frcp_rule_12.py (defensive pleadings + Rule 12
  motions). Together the two cover the responsive-pleading window and
  the discovery calendar.
"""

import argparse
import json
import sys
from datetime import date, timedelta
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM EXTRACTS
# ==================================================================

# Verbatim from Rule 26. Structure:
#   trigger_event → days → source_subsection → who_owes
DEADLINES: List[Dict[str, Any]] = [
    {
        "id": "initial_disclosures_general",
        "trigger_event": "Rule 26(f) conference",
        "days": 14,
        "unit": "calendar days",
        "who_owes": "each party",
        "source_subsection": "Rule 26(a)(1)(C)",
        "verbatim": (
            "A party must make the initial disclosures at or within 14 "
            "days after the parties' Rule 26(f) conference unless a "
            "different time is set by stipulation or court order, or "
            "unless a party objects during the conference that initial "
            "disclosures are not appropriate in this action and states "
            "the objection in the proposed discovery plan."
        ),
    },
    {
        "id": "initial_disclosures_later_joined",
        "trigger_event": "party is served or joined",
        "days": 30,
        "unit": "calendar days",
        "who_owes": "later-joined party",
        "source_subsection": "Rule 26(a)(1)(D)",
        "verbatim": (
            "A party that is first served or otherwise joined after the "
            "Rule 26(f) conference must make the initial disclosures "
            "within 30 days after being served or joined, unless a "
            "different time is set by stipulation or court order."
        ),
    },
    {
        "id": "expert_disclosures_before_trial",
        "trigger_event": "trial date (or ready-for-trial date)",
        "days": 90,
        "unit": "calendar days BEFORE trigger",
        "who_owes": "party disclosing expert testimony",
        "source_subsection": "Rule 26(a)(2)(D)(i)",
        "verbatim": (
            "at least 90 days before the date set for trial or for the "
            "case to be ready for trial"
        ),
    },
    {
        "id": "expert_rebuttal_disclosures",
        "trigger_event": "other party's expert disclosure",
        "days": 30,
        "unit": "calendar days",
        "who_owes": "party offering rebuttal expert",
        "source_subsection": "Rule 26(a)(2)(D)(ii)",
        "verbatim": (
            "if the evidence is intended solely to contradict or rebut "
            "evidence on the same subject matter identified by another "
            "party under Rule 26(a)(2)(B) or (C), within 30 days after "
            "the other party's disclosure"
        ),
    },
    {
        "id": "pretrial_disclosures",
        "trigger_event": "trial date",
        "days": 30,
        "unit": "calendar days BEFORE trigger",
        "who_owes": "each party",
        "source_subsection": "Rule 26(a)(3)(B)",
        "verbatim": (
            "Unless the court orders otherwise, these disclosures must "
            "be made at least 30 days before trial."
        ),
    },
    {
        "id": "pretrial_disclosure_objections",
        "trigger_event": "opposing party's pretrial disclosures",
        "days": 14,
        "unit": "calendar days",
        "who_owes": "objecting party",
        "source_subsection": "Rule 26(a)(3)(B)",
        "verbatim": (
            "Within 14 days after they are made, unless the court sets "
            "a different time, a party may serve and promptly file a "
            "list of the following objections..."
        ),
    },
    {
        "id": "rule_26f_conference",
        "trigger_event": "scheduling conference / Rule 16(b) order due",
        "days": 21,
        "unit": "calendar days BEFORE trigger",
        "who_owes": "the parties (jointly)",
        "source_subsection": "Rule 26(f)(1)",
        "verbatim": (
            "the parties must confer as soon as practicable—and in any "
            "event at least 21 days before a scheduling conference is "
            "to be held or a scheduling order is due under Rule 16(b)."
        ),
    },
]

# Verbatim from Rule 26(b)(1): the six proportionality factors listed
# after "considering". Each factor is quoted verbatim.
PROPORTIONALITY_FACTORS: List[str] = [
    "the importance of the issues at stake in the action",
    "the amount in controversy",
    "the parties' relative access to relevant information",
    "the parties' resources",
    "the importance of the discovery in resolving the issues",
    (
        "whether the burden or expense of the proposed discovery "
        "outweighs its likely benefit"
    ),
]

# Verbatim from Rule 26(b)(1) — the scope-of-discovery test:
SCOPE_TEST_LANGUAGE: str = (
    "Parties may obtain discovery regarding any nonprivileged matter "
    "that is relevant to any party's claim or defense and proportional "
    "to the needs of the case, considering [the six factors]. "
    "Information within this scope of discovery need not be admissible "
    "in evidence to be discoverable."
)

# Verbatim from Rule 26(a)(2)(B)(i)–(vi): expert report must contain:
EXPERT_REPORT_REQUIREMENTS: List[Dict[str, str]] = [
    {
        "id": "opinions_and_basis",
        "verbatim": (
            "a complete statement of all opinions the witness will "
            "express and the basis and reasons for them"
        ),
    },
    {
        "id": "facts_or_data_considered",
        "verbatim": "the facts or data considered by the witness in forming them",
    },
    {
        "id": "exhibits",
        "verbatim": "any exhibits that will be used to summarize or support them",
    },
    {
        "id": "qualifications_and_publications",
        "verbatim": (
            "the witness's qualifications, including a list of all "
            "publications authored in the previous 10 years"
        ),
    },
    {
        "id": "prior_expert_cases",
        "verbatim": (
            "a list of all other cases in which, during the previous 4 "
            "years, the witness testified as an expert at trial or by "
            "deposition"
        ),
    },
    {
        "id": "compensation",
        "verbatim": (
            "a statement of the compensation to be paid for the study "
            "and testimony in the case"
        ),
    },
]

SOURCE_ATTRIBUTION: str = (
    "Federal Rules of Civil Procedure Rule 26 — Cornell LII — "
    "https://www.law.cornell.edu/rules/frcp/rule_26 — public domain"
)


# ==================================================================
# Day-computation (Rule 6 semantics — same as frcp_rule_12.py)
# ==================================================================

def _is_weekend(d: date) -> bool:
    return d.weekday() >= 5  # Saturday=5, Sunday=6


def add_days(start: date, n: int, rollover_weekends: bool = True) -> date:
    """Add n calendar days to start. If the resulting date falls on a
    weekend, roll forward to the next weekday (Rule 6(a)(1)(C)).

    Note: this does NOT account for federal holidays. Rule 6(a)(1)(C)
    also excludes holidays; operators must layer their court's holiday
    calendar on top if that matters.
    """
    result = start + timedelta(days=n)
    if rollover_weekends:
        while _is_weekend(result):
            result += timedelta(days=1)
    return result


def subtract_days(target: date, n: int, rollover_weekends: bool = True) -> date:
    """Subtract n calendar days from target (used for 'X days BEFORE trigger').
    If result falls on a weekend, roll BACKWARD to the previous weekday —
    the practical convention for 'X days before' deadlines so that a party
    is not late because the computed date fell on a weekend.
    """
    result = target - timedelta(days=n)
    if rollover_weekends:
        while _is_weekend(result):
            result -= timedelta(days=1)
    return result


# ==================================================================
# Route B: query interface
# ==================================================================

def lookup_deadline(deadline_id: str) -> Optional[Dict]:
    """Return the verbatim Rule 26 record for a deadline_id."""
    for d in DEADLINES:
        if d["id"] == deadline_id:
            return d
    return None


def all_deadline_ids() -> List[str]:
    """All deadline IDs in registry order (Rule 26 subsection order)."""
    return [d["id"] for d in DEADLINES]


def compute_deadline(deadline_id: str, trigger_date: date) -> Dict[str, Any]:
    """Compute the actual calendar date for a Rule 26 deadline.

    Args:
      deadline_id: from all_deadline_ids()
      trigger_date: the date of the triggering event.

    Returns:
      {deadline_id, trigger_date, deadline_date, direction, days, cite}
    """
    rec = lookup_deadline(deadline_id)
    if rec is None:
        raise KeyError(f"unknown deadline_id: {deadline_id}")

    days = rec["days"]
    is_before = "BEFORE" in rec["unit"]
    if is_before:
        computed = subtract_days(trigger_date, days)
        direction = "before trigger"
    else:
        computed = add_days(trigger_date, days)
        direction = "after trigger"

    return {
        "deadline_id": deadline_id,
        "trigger_event": rec["trigger_event"],
        "trigger_date": trigger_date.isoformat(),
        "days": days,
        "direction": direction,
        "deadline_date": computed.isoformat(),
        "source_subsection": rec["source_subsection"],
        "verbatim": rec["verbatim"],
        "cite": SOURCE_ATTRIBUTION,
    }


def check_expert_report(report: Dict[str, bool]) -> Dict[str, Any]:
    """Check an expert-report dict against Rule 26(a)(2)(B) requirements.

    Args:
      report: dict with boolean keys matching EXPERT_REPORT_REQUIREMENTS ids.
        Each key present-and-truthy means the report contains that element.

    Returns:
      {ok, met, missing, cite}
    """
    if not isinstance(report, dict):
        raise TypeError("report must be a dict")

    met: List[str] = []
    missing: List[Dict[str, str]] = []
    for req in EXPERT_REPORT_REQUIREMENTS:
        if report.get(req["id"]):
            met.append(req["id"])
        else:
            missing.append({"id": req["id"], "verbatim": req["verbatim"]})

    return {
        "ok": len(missing) == 0,
        "met_count": len(met),
        "total": len(EXPERT_REPORT_REQUIREMENTS),
        "met": met,
        "missing": missing,
        "source_subsection": "Rule 26(a)(2)(B)",
        "cite": SOURCE_ATTRIBUTION,
    }


def scope_check(discovery_request: Dict[str, Any]) -> Dict[str, Any]:
    """Sanity-check a discovery request against Rule 26(b)(1) scope test.

    Args:
      discovery_request: dict with keys:
        - relevant_to_claim_or_defense (bool)
        - privileged (bool)
        - proportionality_analysis (dict optional; each factor from
          PROPORTIONALITY_FACTORS mapped to a short justification string)

    Returns:
      {in_scope, findings, cite}
    """
    findings: List[Dict[str, str]] = []

    if discovery_request.get("privileged"):
        findings.append({
            "code": "PRIVILEGED",
            "severity": "error",
            "message": (
                "Rule 26(b)(1) scope excludes privileged matter — "
                "discovery request cannot compel privileged information"
            ),
        })

    if not discovery_request.get("relevant_to_claim_or_defense"):
        findings.append({
            "code": "NOT_RELEVANT",
            "severity": "error",
            "message": (
                "Rule 26(b)(1) requires the matter be 'relevant to any "
                "party's claim or defense'"
            ),
        })

    analysis = discovery_request.get("proportionality_analysis", {})
    if not isinstance(analysis, dict):
        findings.append({
            "code": "PROPORTIONALITY_MALFORMED",
            "severity": "warning",
            "message": "proportionality_analysis should be a dict",
        })
    else:
        addressed = sum(1 for f in PROPORTIONALITY_FACTORS if analysis.get(f))
        if addressed < len(PROPORTIONALITY_FACTORS):
            findings.append({
                "code": "PROPORTIONALITY_INCOMPLETE",
                "severity": "warning",
                "message": (
                    f"proportionality_analysis addresses only {addressed}/"
                    f"{len(PROPORTIONALITY_FACTORS)} Rule 26(b)(1) factors. "
                    "All six should be considered before compelling."
                ),
            })

    in_scope = not any(f["severity"] == "error" for f in findings)
    return {
        "in_scope": in_scope,
        "error_count": sum(1 for f in findings if f["severity"] == "error"),
        "warning_count": sum(1 for f in findings if f["severity"] == "warning"),
        "findings": findings,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Registry sizes
    assert len(DEADLINES) == 7, len(DEADLINES)
    assert len(PROPORTIONALITY_FACTORS) == 6, len(PROPORTIONALITY_FACTORS)
    assert len(EXPERT_REPORT_REQUIREMENTS) == 6, len(EXPERT_REPORT_REQUIREMENTS)
    print(f"[PASS] 7 deadlines · 6 proportionality factors · 6 expert-report items")

    # 2. Verbatim spot-checks
    assert lookup_deadline("initial_disclosures_general")["days"] == 14
    assert lookup_deadline("expert_disclosures_before_trial")["days"] == 90
    assert lookup_deadline("rule_26f_conference")["days"] == 21
    assert "proportional to the needs of the case" in SCOPE_TEST_LANGUAGE
    print("[PASS] verbatim spot-checks: 14/90/21 day durations, scope-test wording")

    # 3. compute_deadline: initial disclosures 14 days after conference
    # Rule 26(f) conference on Wednesday 2026-08-05 → 14 cal days = 2026-08-19 (Wed)
    r = compute_deadline("initial_disclosures_general", date(2026, 8, 5))
    assert r["deadline_date"] == "2026-08-19"
    assert r["direction"] == "after trigger"
    print(f"[PASS] initial disclosures: 26(f) conf 2026-08-05 → deadline {r['deadline_date']}")

    # 4. Weekend rollover: 14 days after 2026-08-04 (Tue) = 2026-08-18 (Tue) — no rollover needed
    # Try a case that lands on Saturday: 2026-08-01 + 14 = 2026-08-15 (Sat) → 2026-08-17 (Mon)
    r = compute_deadline("initial_disclosures_general", date(2026, 8, 1))
    assert r["deadline_date"] == "2026-08-17"
    print(f"[PASS] weekend rollover: 2026-08-01 + 14 days → {r['deadline_date']} (Mon)")

    # 5. Before-trigger direction: expert disclosures 90 days BEFORE trial
    # Trial 2026-12-01 (Tue) → subtract 90 = 2026-09-02 (Wed)
    r = compute_deadline("expert_disclosures_before_trial", date(2026, 12, 1))
    assert r["direction"] == "before trigger"
    assert r["deadline_date"] == "2026-09-02"
    print(f"[PASS] expert disclosures: trial 2026-12-01 → deadline {r['deadline_date']}")

    # 6. Pretrial disclosures: 30 days BEFORE trial
    # Trial 2026-12-01 (Tue) → subtract 30 = 2026-11-01 (Sun) → roll back to 2026-10-30 (Fri)
    r = compute_deadline("pretrial_disclosures", date(2026, 12, 1))
    assert r["deadline_date"] == "2026-10-30", r
    print(f"[PASS] pretrial disclosures: trial 2026-12-01 → {r['deadline_date']} (Fri rollback)")

    # 7. Rule 26(f) conference: 21 days BEFORE scheduling conference
    r = compute_deadline("rule_26f_conference", date(2026, 9, 15))
    assert r["direction"] == "before trigger"
    print(f"[PASS] Rule 26(f) conference: sched conf 2026-09-15 → {r['deadline_date']}")

    # 8. Unknown deadline_id raises
    try:
        compute_deadline("bogus_id", date.today())
        assert False, "should have raised"
    except KeyError:
        pass
    print("[PASS] unknown deadline_id → KeyError")

    # 9. Complete expert report → ok
    complete_report = {
        req["id"]: True for req in EXPERT_REPORT_REQUIREMENTS
    }
    r = check_expert_report(complete_report)
    assert r["ok"] is True
    assert r["met_count"] == 6
    assert r["missing"] == []
    print(f"[PASS] complete expert report → 6/6 met, ok")

    # 10. Missing 2 items
    partial = {
        "opinions_and_basis": True,
        "facts_or_data_considered": True,
        "exhibits": True,
        "qualifications_and_publications": True,
        # missing prior_expert_cases and compensation
    }
    r = check_expert_report(partial)
    assert r["ok"] is False
    assert r["met_count"] == 4
    assert len(r["missing"]) == 2
    missing_ids = {m["id"] for m in r["missing"]}
    assert missing_ids == {"prior_expert_cases", "compensation"}
    print(f"[PASS] partial expert report → 4/6, missing: {missing_ids}")

    # 11. scope_check: privileged → error
    r = scope_check({"privileged": True, "relevant_to_claim_or_defense": True})
    assert r["in_scope"] is False
    codes = {f["code"] for f in r["findings"]}
    assert "PRIVILEGED" in codes
    print("[PASS] privileged material → PRIVILEGED error, out of scope")

    # 12. scope_check: not relevant → error
    r = scope_check({"privileged": False, "relevant_to_claim_or_defense": False})
    assert r["in_scope"] is False
    codes = {f["code"] for f in r["findings"]}
    assert "NOT_RELEVANT" in codes
    print("[PASS] not relevant → NOT_RELEVANT error")

    # 13. scope_check: relevant + incomplete proportionality → warning only
    r = scope_check({
        "privileged": False,
        "relevant_to_claim_or_defense": True,
        "proportionality_analysis": {
            "the amount in controversy": "small",
        },
    })
    assert r["in_scope"] is True  # warnings do not remove from scope
    codes = {f["code"] for f in r["findings"]}
    assert "PROPORTIONALITY_INCOMPLETE" in codes
    print("[PASS] incomplete proportionality → warning (still in scope)")

    # 14. scope_check: fully analyzed → clean
    full_analysis = {f: "considered" for f in PROPORTIONALITY_FACTORS}
    r = scope_check({
        "privileged": False,
        "relevant_to_claim_or_defense": True,
        "proportionality_analysis": full_analysis,
    })
    assert r["in_scope"] is True
    assert r["error_count"] == 0
    assert r["warning_count"] == 0
    print("[PASS] full proportionality analysis → clean, in scope")

    # 15. Citation present in outputs
    r = compute_deadline("initial_disclosures_general", date.today())
    assert "law.cornell.edu" in r["cite"]
    r = check_expert_report({})
    assert "law.cornell.edu" in r["cite"]
    print("[PASS] source attribution present in outputs")

    # 16. all_deadline_ids: 7 in registry order
    ids = all_deadline_ids()
    assert len(ids) == 7
    assert ids[0] == "initial_disclosures_general"
    assert ids[-1] == "rule_26f_conference"
    print(f"[PASS] all_deadline_ids: {len(ids)} IDs in registry order")


def _main() -> int:
    p = argparse.ArgumentParser(description="FRCP Rule 26 tooling")
    p.add_argument("--list", action="store_true", help="list all Rule 26 deadlines")
    p.add_argument("--lookup", help="deadline_id")
    p.add_argument("--compute", nargs=2, metavar=("DEADLINE_ID", "TRIGGER_DATE"),
                   help="compute deadline: python3 frcp_rule_26.py --compute initial_disclosures_general 2026-08-05")
    p.add_argument("--check-expert-report", help="JSON file with expert report dict")
    p.add_argument("--scope", help="JSON file with discovery request dict")
    p.add_argument("--factors", action="store_true", help="show 6 proportionality factors")
    p.add_argument("--expert-reqs", action="store_true", help="show 6 expert-report requirements")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.list, args.lookup, args.compute,
                             args.check_expert_report, args.scope,
                             args.factors, args.expert_reqs]):
        _run_self_tests()
        return 0

    if args.list:
        print(f"FRCP Rule 26 deadlines ({SOURCE_ATTRIBUTION}):")
        for d in DEADLINES:
            print(f"  {d['id']}: {d['days']} {d['unit']}")
            print(f"    trigger: {d['trigger_event']} · source: {d['source_subsection']}")
        return 0

    if args.lookup:
        r = lookup_deadline(args.lookup)
        if r is None:
            print(f"unknown deadline: {args.lookup}. Available: {all_deadline_ids()}")
            return 1
        print(json.dumps(r, indent=2))
        return 0

    if args.compute:
        deadline_id, trigger_str = args.compute
        trigger = date.fromisoformat(trigger_str)
        print(json.dumps(compute_deadline(deadline_id, trigger), indent=2))
        return 0

    if args.check_expert_report:
        with open(args.check_expert_report) as f:
            data = json.load(f)
        print(json.dumps(check_expert_report(data), indent=2))
        return 0

    if args.scope:
        with open(args.scope) as f:
            data = json.load(f)
        print(json.dumps(scope_check(data), indent=2))
        return 0

    if args.factors:
        print(f"Rule 26(b)(1) proportionality factors:")
        for f in PROPORTIONALITY_FACTORS:
            print(f"  - {f}")
        return 0

    if args.expert_reqs:
        print(f"Rule 26(a)(2)(B) expert-report requirements:")
        for r in EXPERT_REPORT_REQUIREMENTS:
            print(f"  - {r['id']}: {r['verbatim']}")
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
