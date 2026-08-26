#!/usr/bin/env python3
"""
sre_being_on_call.py — Google SRE Book Ch.11 on-call rotation constants,
sizing math, and workload validators.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  Google SRE Book — Chapter 11: Being On-Call
  https://sre.google/sre-book/being-on-call/
  Author: Andrea Spadaccini. Edited by Kavita Guliani.
  Copyright © 2017 Google, Inc. Licensed under CC BY-NC-ND 4.0.

  License notes: CC BY-NC-ND permits reproduction with attribution for
  non-commercial purposes and forbids derivative works. This file uses
  only short verbatim excerpts (fair-use quotation): the two typical
  paging response times, the 50/25/25 time-budget split, the minimum
  team sizes (8 single-site, 6 dual-site), the 6-hour incident-handling
  budget, the 2-incidents-per-12h-shift cap, and the 1:1 alert-to-
  incident target. Longer analytical text is NOT reproduced.

Second source (§8.0 minimum-two-book):
  Google SRE Workbook — Chapter 8: On-Call
  https://sre.google/workbook/on-call/
  Same license. Referenced by Ch.11 as the practitioner companion.

===================================================================
ROUTE (§8.2)
===================================================================
  Route A/B: on-call sizing arithmetic + rule-based workload validators.
  All constants verbatim from Ch.11; sizing math follows the verbatim
  rules directly (25% cap, 2 people on-call, week-long shifts).

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/cortex (SecOps on-call rotation sizing)
    - Engineering/ops (SRE rotation sizing + workload sanity checks)
    - Ops-and-Delivery/handoff (cross-team rotation coordination)
  Potential:
    - Ops-and-Delivery/capacity (headcount planning for on-call teams)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- PAGING_RESPONSE_TIME_MINUTES: verbatim from Ch.11 §"Life of an On-Call Engineer"
- TIME_BUDGET_SPLIT: verbatim from Ch.11 §"Balance in Quantity"
- MINIMUM_TEAM_SIZE_SINGLE_SITE / DUAL_SITE: verbatim from Ch.11
- HOURS_PER_INCIDENT / MAX_INCIDENTS_PER_12H_SHIFT: verbatim from Ch.11
- ALERT_TO_INCIDENT_TARGET_RATIO: verbatim from Ch.11 §"Operational Overload"
- Complementary to sre_managing_incidents.py (Ch.14) and
  sre_postmortem_culture.py (Ch.15).
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM CONSTANTS
# ==================================================================

# Verbatim from Ch.11 §"Life of an On-Call Engineer":
# "Typical values are 5 minutes for user-facing or otherwise highly
#  time-critical services, and 30 minutes for less time-sensitive systems."
PAGING_RESPONSE_TIME_MINUTES: Dict[str, int] = {
    "user_facing_or_time_critical": 5,
    "less_time_sensitive": 30,
}

# Verbatim from Ch.11 §"Balance in Quantity":
# "we strive to invest at least 50% of SRE time into engineering: of the
#  remainder, no more than 25% can be spent on-call, leaving up to another
#  25% on other types of operational, nonproject work."
TIME_BUDGET_SPLIT: Dict[str, float] = {
    "engineering_minimum": 0.50,
    "on_call_maximum": 0.25,
    "other_operational_maximum": 0.25,
}

# Verbatim from Ch.11:
# "the minimum number of engineers needed for on-call duty from a
#  single-site team is eight"
MINIMUM_TEAM_SIZE_SINGLE_SITE: int = 8

# Verbatim from Ch.11:
# "For dual-site teams, a reasonable minimum size of each team is six"
MINIMUM_TEAM_SIZE_DUAL_SITE_PER_SITE: int = 6

# Verbatim assumption in Ch.11 sizing derivation:
# "Assuming that there are always two people on-call (primary and
#  secondary, with different duties)"
PEOPLE_ON_CALL_AT_A_TIME: int = 2

# Verbatim from Ch.11:
# "assuming week-long shifts, each engineer is on-call (primary or
#  secondary) for one week every month."
SHIFT_LENGTH_DAYS: int = 7

# Verbatim from Ch.11 §"Balance in Quality":
# "on average, dealing with the tasks involved in an on-call incident—
#  root-cause analysis, remediation, and follow-up activities like
#  writing a postmortem and fixing bugs—takes 6 hours."
HOURS_PER_INCIDENT: int = 6

# Verbatim from Ch.11 §"Balance in Quality":
# "the maximum number of incidents per day is 2 per 12-hour on-call shift"
MAX_INCIDENTS_PER_12H_SHIFT: int = 2

# Verbatim from Ch.11 §"Operational Overload":
# "Noisy alerts that systematically generate more than one alert per
#  incident should be tweaked to approach a 1:1 alert/incident ratio."
ALERT_TO_INCIDENT_TARGET_RATIO: float = 1.0

# Verbatim from Ch.11 §"A Treacherous Enemy: Operational Underload":
# "SRE teams should be sized to allow every engineer to be on-call at
#  least once or twice a quarter"
MIN_ON_CALL_SHIFTS_PER_QUARTER: int = 1  # verbatim lower bound

# Verbatim from Ch.11 (4-nines example):
# "if a user-facing system must obtain 4 nines of availability in a
#  given quarter (99.99%), the allowed quarterly downtime is around
#  13 minutes"
FOUR_NINES_QUARTERLY_DOWNTIME_MINUTES: int = 13

SOURCE_ATTRIBUTION: str = (
    "Google SRE Book Ch.11 — Being On-Call (Spadaccini, 2017) — "
    "https://sre.google/sre-book/being-on-call/ — CC BY-NC-ND 4.0"
)


# ==================================================================
# Route A: sizing arithmetic
# ==================================================================

def minimum_team_size(sites: int = 1) -> Dict[str, Any]:
    """Return the Ch.11 minimum SRE team size for a given number of sites.

    Args:
      sites: 1 (single-site) or 2 (dual-site, e.g., follow-the-sun)

    Returns:
      {sites, minimum_per_site, minimum_total, cite}
    """
    if sites == 1:
        per_site = MINIMUM_TEAM_SIZE_SINGLE_SITE
    elif sites == 2:
        per_site = MINIMUM_TEAM_SIZE_DUAL_SITE_PER_SITE
    else:
        return {
            "error": (
                f"Ch.11 explicitly names single-site (min 8) and "
                f"dual-site (min 6/site). For {sites} sites, operator "
                "must derive per-context; Ch.11 does not prescribe."
            ),
            "cite": SOURCE_ATTRIBUTION,
        }

    return {
        "sites": sites,
        "minimum_per_site": per_site,
        "minimum_total": per_site * sites,
        "assumption": (
            f"{PEOPLE_ON_CALL_AT_A_TIME} people on-call at all times, "
            f"{SHIFT_LENGTH_DAYS}-day shifts, 25% max on-call time per engineer"
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def on_call_percent(
    team_size: int,
    shifts_per_engineer_per_month: int = 1,
    shift_length_days: int = SHIFT_LENGTH_DAYS,
) -> Dict[str, Any]:
    """Compute the % of time an SRE spends on-call.

    Ch.11 formula (implicit): each engineer on-call for `shift_length_days`
    once every N weeks, where N is derived from the rotation. For the Ch.11
    example: 8-person team, 2 on-call at a time, week-long shifts →
    each engineer is on-call 1 week / 4 weeks (25% of time).

    Args:
      team_size: number of engineers in rotation
      shifts_per_engineer_per_month: how often each engineer takes a shift
      shift_length_days: how long each shift is (default 7 per Ch.11)

    Returns:
      {team_size, on_call_days_per_month, on_call_percent, ch11_compliant, cite}
    """
    if team_size <= 0:
        raise ValueError("team_size must be positive")

    days_per_month = 30
    on_call_days = shifts_per_engineer_per_month * shift_length_days
    percent = on_call_days / days_per_month

    return {
        "team_size": team_size,
        "shifts_per_engineer_per_month": shifts_per_engineer_per_month,
        "shift_length_days": shift_length_days,
        "on_call_days_per_month": on_call_days,
        "on_call_percent": round(percent, 4),
        "ch11_25pct_cap": TIME_BUDGET_SPLIT["on_call_maximum"],
        "ch11_compliant": percent <= TIME_BUDGET_SPLIT["on_call_maximum"] + 1e-9,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Route B: workload validators
# ==================================================================

def validate_shift_workload(
    incidents_in_shift: int,
    shift_hours: int = 12,
) -> Dict[str, Any]:
    """Check if the incident load in a shift exceeds Ch.11 cap.

    Ch.11: "the maximum number of incidents per day is 2 per 12-hour
    on-call shift" — i.e., 6 hours per incident.

    Args:
      incidents_in_shift: number of incidents handled in the shift
      shift_hours: shift length (default 12 per Ch.11 assumption)

    Returns:
      {incidents_in_shift, shift_hours, max_allowed, in_budget,
       hours_consumed, hours_remaining, cite}
    """
    if incidents_in_shift < 0:
        raise ValueError("incidents_in_shift cannot be negative")
    if shift_hours <= 0:
        raise ValueError("shift_hours must be positive")

    # Max incidents scales with shift length at 6h/incident (Ch.11 rate)
    max_allowed = shift_hours // HOURS_PER_INCIDENT
    hours_consumed = incidents_in_shift * HOURS_PER_INCIDENT
    hours_remaining = shift_hours - hours_consumed

    return {
        "incidents_in_shift": incidents_in_shift,
        "shift_hours": shift_hours,
        "hours_per_incident_ch11": HOURS_PER_INCIDENT,
        "max_allowed": max_allowed,
        "in_budget": incidents_in_shift <= max_allowed,
        "hours_consumed": hours_consumed,
        "hours_remaining_for_project_work": max(0, hours_remaining),
        "cite": SOURCE_ATTRIBUTION,
    }


def evaluate_alert_noise(
    alerts_count: int,
    incidents_count: int,
) -> Dict[str, Any]:
    """Evaluate alert-to-incident ratio per Ch.11 §"Operational Overload".

    Ch.11: "Noisy alerts that systematically generate more than one alert
    per incident should be tweaked to approach a 1:1 alert/incident ratio."

    Args:
      alerts_count: total alerts fired in the observation window
      incidents_count: distinct incidents (postmortems) in the window

    Returns:
      {alerts, incidents, ratio, target, verdict, cite}
    """
    if alerts_count < 0 or incidents_count < 0:
        raise ValueError("counts cannot be negative")
    if incidents_count == 0:
        return {
            "alerts": alerts_count,
            "incidents": 0,
            "ratio": None,
            "target": ALERT_TO_INCIDENT_TARGET_RATIO,
            "verdict": (
                "no incidents to compare against — cannot evaluate "
                "alert:incident ratio"
            ),
            "cite": SOURCE_ATTRIBUTION,
        }

    ratio = alerts_count / incidents_count
    if abs(ratio - 1.0) < 0.1:
        verdict = "at target (1:1)"
    elif ratio > 1.0:
        verdict = (
            f"noisy — {ratio:.2f} alerts per incident. Ch.11: "
            "tweak to approach 1:1 (group related alerts, silence duplicates)."
        )
    else:
        verdict = (
            f"suspicious — {ratio:.2f} alerts per incident means some "
            "incidents fired no alerts (missed detections)."
        )

    return {
        "alerts": alerts_count,
        "incidents": incidents_count,
        "ratio": round(ratio, 3),
        "target": ALERT_TO_INCIDENT_TARGET_RATIO,
        "verdict": verdict,
        "cite": SOURCE_ATTRIBUTION,
    }


def paging_response_time(criticality: str) -> Dict[str, Any]:
    """Return the Ch.11 paging response-time SLA for a criticality tier.

    Args:
      criticality: "user_facing_or_time_critical" or "less_time_sensitive"
    """
    minutes = PAGING_RESPONSE_TIME_MINUTES.get(criticality)
    if minutes is None:
        return {
            "error": f"unknown criticality {criticality!r}. Valid: {list(PAGING_RESPONSE_TIME_MINUTES.keys())}",
            "cite": SOURCE_ATTRIBUTION,
        }
    return {
        "criticality": criticality,
        "response_time_minutes": minutes,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Verbatim constants
    assert MINIMUM_TEAM_SIZE_SINGLE_SITE == 8
    assert MINIMUM_TEAM_SIZE_DUAL_SITE_PER_SITE == 6
    assert PEOPLE_ON_CALL_AT_A_TIME == 2
    assert SHIFT_LENGTH_DAYS == 7
    assert HOURS_PER_INCIDENT == 6
    assert MAX_INCIDENTS_PER_12H_SHIFT == 2
    assert PAGING_RESPONSE_TIME_MINUTES["user_facing_or_time_critical"] == 5
    assert PAGING_RESPONSE_TIME_MINUTES["less_time_sensitive"] == 30
    assert FOUR_NINES_QUARTERLY_DOWNTIME_MINUTES == 13
    assert TIME_BUDGET_SPLIT["on_call_maximum"] == 0.25
    print("[PASS] all verbatim constants match Ch.11 values")

    # 2. Time-budget split sums to 100%
    total = sum(TIME_BUDGET_SPLIT.values())
    assert abs(total - 1.0) < 1e-9, total
    print(f"[PASS] time budget: 50% eng + 25% on-call + 25% other = {total*100}%")

    # 3. Single-site minimum team size
    r = minimum_team_size(1)
    assert r["minimum_per_site"] == 8
    assert r["minimum_total"] == 8
    print(f"[PASS] single-site min team: {r['minimum_total']}")

    # 4. Dual-site minimum team size
    r = minimum_team_size(2)
    assert r["minimum_per_site"] == 6
    assert r["minimum_total"] == 12
    print(f"[PASS] dual-site min team: {r['minimum_per_site']}/site, {r['minimum_total']} total")

    # 5. Unusual site count → error dict
    r = minimum_team_size(3)
    assert "error" in r
    print("[PASS] 3 sites → error dict (Ch.11 doesn't prescribe)")

    # 6. Ch.11 exact example: 8-person team, 1 week/month → ≈23.3% (under 25%)
    r = on_call_percent(team_size=8, shifts_per_engineer_per_month=1)
    # 7 days / 30 days = 23.33% (rounded to 4dp = 0.2333)
    assert abs(r["on_call_percent"] - round(7/30, 4)) < 1e-9
    assert r["ch11_compliant"] is True
    print(f"[PASS] Ch.11 example: 1 wk/month = {r['on_call_percent']*100:.2f}% ≤ 25%")

    # 7. Over-cap case: 2 weeks/month = 46.67%
    r = on_call_percent(team_size=8, shifts_per_engineer_per_month=2)
    assert r["ch11_compliant"] is False
    print(f"[PASS] 2 wk/month = {r['on_call_percent']*100:.2f}% > 25% → non-compliant")

    # 8. Shift workload: 12h shift with 2 incidents → in budget
    r = validate_shift_workload(incidents_in_shift=2, shift_hours=12)
    assert r["max_allowed"] == 2
    assert r["in_budget"] is True
    assert r["hours_remaining_for_project_work"] == 0
    print(f"[PASS] 12h shift, 2 incidents: in-budget (Ch.11 max = 2)")

    # 9. Shift workload: 12h shift with 3 incidents → over budget
    r = validate_shift_workload(incidents_in_shift=3, shift_hours=12)
    assert r["in_budget"] is False
    print(f"[PASS] 12h shift, 3 incidents: over-budget")

    # 10. 24h shift: 4 incidents allowed
    r = validate_shift_workload(incidents_in_shift=4, shift_hours=24)
    assert r["max_allowed"] == 4
    assert r["in_budget"] is True
    print(f"[PASS] 24h shift → max 4 incidents allowed")

    # 11. Alert-to-incident ratio: 5 alerts, 5 incidents → target
    r = evaluate_alert_noise(alerts_count=5, incidents_count=5)
    assert r["ratio"] == 1.0
    assert "at target" in r["verdict"]
    print(f"[PASS] 5:5 ratio → at target")

    # 12. Alert-to-incident ratio: 20 alerts, 5 incidents → noisy
    r = evaluate_alert_noise(alerts_count=20, incidents_count=5)
    assert r["ratio"] == 4.0
    assert "noisy" in r["verdict"]
    print(f"[PASS] 20:5 ratio (4:1) → noisy")

    # 13. Alert-to-incident ratio: 2 alerts, 10 incidents → suspicious (missed detections)
    r = evaluate_alert_noise(alerts_count=2, incidents_count=10)
    assert r["ratio"] == 0.2
    assert "suspicious" in r["verdict"]
    print(f"[PASS] 2:10 ratio (0.2:1) → suspicious (missed detections)")

    # 14. Zero incidents → no ratio
    r = evaluate_alert_noise(alerts_count=0, incidents_count=0)
    assert r["ratio"] is None
    print(f"[PASS] 0 incidents → cannot evaluate ratio")

    # 15. Paging response time lookup
    r = paging_response_time("user_facing_or_time_critical")
    assert r["response_time_minutes"] == 5
    r = paging_response_time("less_time_sensitive")
    assert r["response_time_minutes"] == 30
    print(f"[PASS] paging response times: 5min critical, 30min non-critical")

    # 16. Unknown criticality → error
    r = paging_response_time("bogus")
    assert "error" in r
    print("[PASS] unknown criticality → error")

    # 17. Citation present
    r = paging_response_time("user_facing_or_time_critical")
    assert "sre.google" in r["cite"]
    print("[PASS] source attribution present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="Google SRE Ch.11 on-call tooling")
    p.add_argument("--min-team", type=int, help="min team size for N sites")
    p.add_argument("--percent", nargs=2, type=int, metavar=("TEAM", "SHIFTS_PER_MONTH"),
                   help="on-call % for team size + shifts/month")
    p.add_argument("--workload", nargs=2, type=int, metavar=("INCIDENTS", "SHIFT_HOURS"),
                   help="validate shift workload")
    p.add_argument("--noise", nargs=2, type=int, metavar=("ALERTS", "INCIDENTS"),
                   help="evaluate alert:incident ratio")
    p.add_argument("--response", help="paging response time for criticality tier")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.min_team is not None, args.percent, args.workload,
                             args.noise, args.response]):
        _run_self_tests()
        return 0

    if args.min_team is not None:
        print(json.dumps(minimum_team_size(args.min_team), indent=2))
        return 0
    if args.percent:
        print(json.dumps(on_call_percent(args.percent[0], args.percent[1]), indent=2))
        return 0
    if args.workload:
        print(json.dumps(validate_shift_workload(args.workload[0], args.workload[1]), indent=2))
        return 0
    if args.noise:
        print(json.dumps(evaluate_alert_noise(args.noise[0], args.noise[1]), indent=2))
        return 0
    if args.response:
        print(json.dumps(paging_response_time(args.response), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
