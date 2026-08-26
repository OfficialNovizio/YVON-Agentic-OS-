#!/usr/bin/env python3
"""
sre_slo_error_budget.py — Google SRE Workbook Ch.2 SLI/SLO structure,
error-budget arithmetic, and SLO decision matrix.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  Google SRE Workbook — Chapter 2: Implementing SLOs
  https://sre.google/workbook/implementing-slos/
  Authors: Steven Thurgood and David Ferguson, with Alex Hidalgo and
  Betsy Beyer. Copyright © 2018 Google, Inc.
  Licensed under CC BY-NC-ND 4.0.

  License notes: CC BY-NC-ND permits reproduction with attribution for
  non-commercial purposes and forbids derivative works. This file uses
  only short verbatim excerpts (fair-use quotation): the SLI-as-ratio
  definition, the error-budget formula, the SLI table (7 rows), and
  the SLO decision matrix (8 rows). Longer analytical text is NOT
  reproduced. Arithmetic implementations follow the formulas literally.

Second source (§8.0 minimum-two-book):
  Google SRE Book — Chapter 4: Service Level Objectives
  https://sre.google/sre-book/service-level-objectives/
  Same CC BY-NC-ND license. Referenced by Workbook Ch.2 as the founding
  chapter on SLOs; consulted for SLI/SLO terminology.

===================================================================
ROUTE (§8.2)
===================================================================
  Route A (arithmetic) for error-budget computations:
    error_budget = 1 - SLO
    error_budget_remaining = allowed_failures - observed_failures
    budget_consumed_pct = observed_failures / allowed_failures
  Route B (rule-based) for SLO decision matrix and SLI-type registry.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Engineering/ops (SLO / error-budget policy)
    - Engineering/dev (service-reliability trade-offs)
    - Engineering/quinn (release-gate error-budget check)
  Potential:
    - Cybersecurity/cortex (detection-quality SLIs)
    - Data-and-Analytics/anomaly (metric-anomaly SLIs)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- SLI_DEFINITION, ERROR_BUDGET_DEFINITION: verbatim from Ch.2.
- SLI_TYPES_BY_SERVICE: verbatim from Table 2-1 (Ch.2).
- SLO_DECISION_MATRIX: verbatim from Table 2-5 (Ch.2).
- DEFAULT_WINDOW_WEEKS: verbatim from Ch.2 §"Choosing an Appropriate
  Time Window" — "a four-week rolling window to be a good general-
  purpose interval."
- No invented SLO percentages, no invented thresholds. Operators supply
  their own SLO targets.
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM EXTRACTS
# ==================================================================

# Verbatim from Ch.2 §"What to Measure: Using SLIs":
SLI_DEFINITION: str = (
    "the ratio of two numbers: the number of good events divided by "
    "the total number of events"
)

# Verbatim from Ch.2 §"What to Measure: Using SLIs":
ERROR_BUDGET_DEFINITION: str = (
    "the SLO is a target percentage and the error budget is 100% minus "
    "the SLO"
)

# Verbatim from Ch.2 Table 2-1: "Potential SLIs for different types of components"
SLI_TYPES_BY_SERVICE: Dict[str, List[Dict[str, str]]] = {
    "Request-driven": [
        {
            "sli_type": "Availability",
            "description": "The proportion of requests that resulted in a successful response.",
        },
        {
            "sli_type": "Latency",
            "description": "The proportion of requests that were faster than some threshold.",
        },
        {
            "sli_type": "Quality",
            "description": (
                "If the service degrades gracefully when overloaded or "
                "when backends are unavailable, you need to measure the "
                "proportion of responses that were served in an "
                "undegraded state."
            ),
        },
    ],
    "Pipeline": [
        {
            "sli_type": "Freshness",
            "description": (
                "The proportion of the data that was updated more "
                "recently than some time threshold."
            ),
        },
        {
            "sli_type": "Correctness",
            "description": (
                "The proportion of records coming into the pipeline "
                "that resulted in the correct value coming out."
            ),
        },
        {
            "sli_type": "Coverage",
            "description": (
                "For batch processing, the proportion of jobs that "
                "processed above some target amount of data. For "
                "streaming processing, the proportion of incoming "
                "records that were successfully processed within some "
                "time window."
            ),
        },
    ],
    "Storage": [
        {
            "sli_type": "Durability",
            "description": (
                "The proportion of records written that can be "
                "successfully read."
            ),
        },
    ],
}

# Verbatim from Ch.2 Table 2-5: "SLO decision matrix"
# Each row: (slo_met, toil, customer_satisfaction) → action
SLO_DECISION_MATRIX: List[Dict[str, str]] = [
    {
        "slo": "Met", "toil": "Low", "customer_satisfaction": "High",
        "action": (
            "Choose to (a) relax release and deployment processes and "
            "increase velocity, or (b) step back from the engagement and "
            "focus engineering time on services that need more reliability."
        ),
    },
    {"slo": "Met", "toil": "Low", "customer_satisfaction": "Low",
     "action": "Tighten SLO."},
    {"slo": "Met", "toil": "High", "customer_satisfaction": "High",
     "action": (
        "If alerting is generating false positives, reduce sensitivity. "
        "Otherwise, temporarily loosen the SLOs (or offload toil) and fix "
        "product and/or improve automated fault mitigation."
     )},
    {"slo": "Met", "toil": "High", "customer_satisfaction": "Low",
     "action": "Tighten SLO."},
    {"slo": "Missed", "toil": "Low", "customer_satisfaction": "High",
     "action": "Loosen SLO."},
    {"slo": "Missed", "toil": "Low", "customer_satisfaction": "Low",
     "action": "Increase alerting sensitivity."},
    {"slo": "Missed", "toil": "High", "customer_satisfaction": "High",
     "action": "Loosen SLO."},
    {"slo": "Missed", "toil": "High", "customer_satisfaction": "Low",
     "action": "Offload toil and fix product and/or improve automated fault mitigation."},
]

# Verbatim from Ch.2 §"Choosing an Appropriate Time Window":
# "We have found a four-week rolling window to be a good general-purpose interval."
DEFAULT_WINDOW_WEEKS: int = 4

SOURCE_ATTRIBUTION: str = (
    "Google SRE Workbook Ch.2 — Implementing SLOs (Thurgood, Ferguson, "
    "Hidalgo, Beyer, 2018) — https://sre.google/workbook/implementing-slos/ "
    "— CC BY-NC-ND 4.0"
)


# ==================================================================
# Route A: SLI + error-budget arithmetic
# ==================================================================

def compute_sli(good_events: int, total_events: int) -> Dict[str, Any]:
    """Compute an SLI per Ch.2: good_events / total_events.

    Args:
      good_events: numerator (integer, >=0, <=total)
      total_events: denominator (integer, >0)

    Returns:
      {sli_ratio, sli_pct, good_events, total_events, cite}
    """
    if good_events < 0:
        raise ValueError("good_events cannot be negative")
    if total_events <= 0:
        raise ValueError("total_events must be positive")
    if good_events > total_events:
        raise ValueError("good_events cannot exceed total_events")

    ratio = good_events / total_events
    return {
        "sli_ratio": ratio,
        "sli_pct": ratio * 100,
        "good_events": good_events,
        "total_events": total_events,
        "definition": SLI_DEFINITION,
        "cite": SOURCE_ATTRIBUTION,
    }


def error_budget(slo_target: float) -> Dict[str, Any]:
    """Compute the error budget for a given SLO per Ch.2:
    error_budget = 1 - SLO

    Args:
      slo_target: SLO as a decimal (0.999 for 99.9%)

    Returns:
      {slo_target, slo_pct, error_budget, error_budget_pct, cite}
    """
    if not 0 < slo_target < 1:
        raise ValueError("slo_target must be between 0 and 1 (exclusive)")

    eb = 1 - slo_target
    return {
        "slo_target": slo_target,
        "slo_pct": slo_target * 100,
        "error_budget": eb,
        "error_budget_pct": eb * 100,
        "definition": ERROR_BUDGET_DEFINITION,
        "cite": SOURCE_ATTRIBUTION,
    }


def allowed_failures(slo_target: float, total_events: int) -> int:
    """Compute the maximum number of failures allowed under an SLO.

    Per Ch.2 example: "if you have a 99.9% success ratio SLO, then a
    service that receives 3 million requests over a four-week period had
    a budget of 3,000 (0.1%) errors over that period."

    Args:
      slo_target: SLO as a decimal (0.999 for 99.9%)
      total_events: expected total event count in the window

    Returns:
      integer count of allowed failures (rounded down — a partial-event
      failure would still count toward budget consumption)
    """
    if not 0 < slo_target < 1:
        raise ValueError("slo_target must be between 0 and 1 (exclusive)")
    if total_events <= 0:
        raise ValueError("total_events must be positive")

    eb = 1 - slo_target
    return int(total_events * eb)


def error_budget_status(
    slo_target: float,
    total_events: int,
    observed_failures: int,
) -> Dict[str, Any]:
    """Combined status: how much error budget remains + consumed.

    Args:
      slo_target: SLO as a decimal
      total_events: total events observed in the window
      observed_failures: number of failed/bad events in the window

    Returns:
      {slo_target, allowed_failures, observed_failures,
       remaining, consumed_pct, in_budget, cite}
    """
    if observed_failures < 0:
        raise ValueError("observed_failures cannot be negative")

    allowed = allowed_failures(slo_target, total_events)
    remaining = allowed - observed_failures
    consumed_pct = (observed_failures / allowed * 100) if allowed > 0 else 0.0
    in_budget = observed_failures <= allowed

    # Current SLI = (total - observed_failures) / total
    good = total_events - observed_failures
    sli_ratio = good / total_events if total_events > 0 else 0.0

    return {
        "slo_target": slo_target,
        "slo_pct": slo_target * 100,
        "total_events": total_events,
        "observed_failures": observed_failures,
        "allowed_failures": allowed,
        "remaining_budget": remaining,
        "consumed_pct": round(consumed_pct, 2),
        "current_sli_ratio": sli_ratio,
        "current_sli_pct": round(sli_ratio * 100, 4),
        "in_budget": in_budget,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Route B: SLO decision matrix + SLI-type registry
# ==================================================================

def decide(slo: str, toil: str, customer_satisfaction: str) -> Dict[str, Any]:
    """Look up Ch.2 Table 2-5 SLO decision matrix.

    Args:
      slo: "Met" or "Missed"
      toil: "Low" or "High"
      customer_satisfaction: "Low" or "High"

    Returns:
      {slo, toil, customer_satisfaction, action, cite}
    """
    slo = slo.capitalize() if isinstance(slo, str) else slo
    toil = toil.capitalize() if isinstance(toil, str) else toil
    cs = customer_satisfaction.capitalize() if isinstance(customer_satisfaction, str) else customer_satisfaction

    for row in SLO_DECISION_MATRIX:
        if (row["slo"] == slo and row["toil"] == toil
                and row["customer_satisfaction"] == cs):
            return {
                "slo": slo,
                "toil": toil,
                "customer_satisfaction": cs,
                "action": row["action"],
                "cite": SOURCE_ATTRIBUTION,
            }
    valid_slo = {"Met", "Missed"}
    valid_toil = {"Low", "High"}
    return {
        "error": (
            f"combination not in matrix. Valid slo={valid_slo}, "
            f"toil={valid_toil}, customer_satisfaction={valid_toil}"
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def sli_types_for_service(service_type: str) -> Optional[List[Dict[str, str]]]:
    """Return the recommended SLI types for a given service category
    (Ch.2 Table 2-1). Categories: "Request-driven", "Pipeline", "Storage"."""
    return SLI_TYPES_BY_SERVICE.get(service_type)


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Verbatim registry sizes
    assert len(SLI_TYPES_BY_SERVICE) == 3
    assert set(SLI_TYPES_BY_SERVICE.keys()) == {"Request-driven", "Pipeline", "Storage"}
    total_sli_types = sum(len(v) for v in SLI_TYPES_BY_SERVICE.values())
    assert total_sli_types == 7, f"expected 7 SLI types across 3 service cats, got {total_sli_types}"
    assert len(SLO_DECISION_MATRIX) == 8
    print(f"[PASS] 3 service categories · 7 SLI types · 8 decision-matrix rows")

    # 2. Verbatim spot-checks
    assert "good events divided by the total number of events" in SLI_DEFINITION
    assert "100% minus the SLO" in ERROR_BUDGET_DEFINITION
    assert DEFAULT_WINDOW_WEEKS == 4
    print("[PASS] verbatim spot-checks match Ch.2 wording")

    # 3. compute_sli: 99/100 = 99%
    r = compute_sli(99, 100)
    assert r["sli_ratio"] == 0.99
    assert r["sli_pct"] == 99.0
    print(f"[PASS] SLI 99/100 = 99.0%")

    # 4. compute_sli input validation
    for bad in [(-1, 10), (5, 0), (11, 10)]:
        try:
            compute_sli(*bad)
            assert False, f"should have raised for {bad}"
        except ValueError:
            pass
    print("[PASS] compute_sli rejects invalid inputs")

    # 5. error_budget for 99.9% SLO → 0.1%
    r = error_budget(0.999)
    assert abs(r["error_budget"] - 0.001) < 1e-9
    assert abs(r["error_budget_pct"] - 0.1) < 1e-9
    print(f"[PASS] 99.9% SLO → 0.1% error budget")

    # 6. error_budget input validation
    for bad in [0, 1, -0.1, 1.5]:
        try:
            error_budget(bad)
            assert False, f"should have raised for {bad}"
        except ValueError:
            pass
    print("[PASS] error_budget rejects invalid SLO values")

    # 7. Ch.2 exact example: 99.9% SLO over 3M requests → 3,000 allowed failures
    a = allowed_failures(0.999, 3_000_000)
    assert a == 3000, a
    print(f"[PASS] Ch.2 example: 99.9% × 3M = {a} allowed failures")

    # 8. Ch.2 exact example: single outage of 1,500 errors = 50% budget consumed
    r = error_budget_status(0.999, 3_000_000, 1500)
    assert r["allowed_failures"] == 3000
    assert r["remaining_budget"] == 1500
    assert r["consumed_pct"] == 50.0
    assert r["in_budget"] is True
    print(f"[PASS] Ch.2 example: 1,500 errors = 50% budget consumed, in-budget")

    # 9. Ch.2 exact example (Table 2-4): 97% avail × 3,663,253 → 109,897 allowed
    a = allowed_failures(0.97, 3_663_253)
    assert a == 109897, a
    print(f"[PASS] Ch.2 Table 2-4: 97% × 3,663,253 = {a} allowed failures")

    # 10. Ch.2 exact example: bad push causing 14,066 errors = 13% of 109,897
    r = error_budget_status(0.97, 3_663_253, 14066)
    assert r["consumed_pct"] == round(14066/109897*100, 2)
    # ≈ 12.8%; Ch.2 rounds to "13%"
    print(f"[PASS] Ch.2 example: 14,066 errors = {r['consumed_pct']}% budget")

    # 11. Over budget → in_budget=False
    r = error_budget_status(0.999, 1_000_000, 2000)  # 1000 allowed, 2000 seen
    assert r["in_budget"] is False
    assert r["remaining_budget"] == -1000
    assert r["consumed_pct"] == 200.0
    print(f"[PASS] over-budget case: 2× allowed → in_budget=False, 200% consumed")

    # 12. decide: SLO Missed + High toil + Low satisfaction → offload+fix
    r = decide("Missed", "High", "Low")
    assert "Offload toil" in r["action"]
    print(f"[PASS] decide(Missed, High, Low) → {r['action'][:40]}...")

    # 13. decide: SLO Met + Low toil + High satisfaction → release-freeze relaxation
    r = decide("Met", "Low", "High")
    assert "relax release" in r["action"]
    print(f"[PASS] decide(Met, Low, High) → {r['action'][:40]}...")

    # 14. decide: Missed + Low + Low → increase alerting
    r = decide("Missed", "Low", "Low")
    assert "alerting sensitivity" in r["action"]
    print(f"[PASS] decide(Missed, Low, Low) → increase alerting sensitivity")

    # 15. decide: invalid combination → error
    r = decide("Perfect", "Nope", "Meh")
    assert "error" in r
    print(f"[PASS] invalid decide inputs → error dict")

    # 16. sli_types_for_service: Pipeline → 3 SLIs
    r = sli_types_for_service("Pipeline")
    assert len(r) == 3
    types = {row["sli_type"] for row in r}
    assert types == {"Freshness", "Correctness", "Coverage"}
    print(f"[PASS] Pipeline SLIs: {types}")

    # 17. Citation present in outputs
    r = error_budget(0.99)
    assert "sre.google" in r["cite"]
    print("[PASS] source attribution present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="Google SRE Workbook Ch.2 SLO tooling")
    p.add_argument("--sli", nargs=2, type=int, metavar=("GOOD", "TOTAL"),
                   help="compute SLI: --sli 99999 100000")
    p.add_argument("--budget", type=float, help="error budget for SLO (e.g., 0.999)")
    p.add_argument("--allowed", nargs=2, metavar=("SLO", "TOTAL"),
                   help="allowed failures: --allowed 0.999 3000000")
    p.add_argument("--status", nargs=3, metavar=("SLO", "TOTAL", "OBSERVED_FAILURES"),
                   help="error-budget status: --status 0.999 3000000 1500")
    p.add_argument("--decide", nargs=3, metavar=("SLO", "TOIL", "CS"),
                   help="decision matrix: --decide Met Low High")
    p.add_argument("--sli-types", help="SLIs for service type: Request-driven|Pipeline|Storage")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.sli, args.budget, args.allowed, args.status,
                             args.decide, args.sli_types]):
        _run_self_tests()
        return 0

    if args.sli:
        print(json.dumps(compute_sli(args.sli[0], args.sli[1]), indent=2))
        return 0

    if args.budget is not None:
        print(json.dumps(error_budget(args.budget), indent=2))
        return 0

    if args.allowed:
        slo, total = float(args.allowed[0]), int(args.allowed[1])
        print(f"Allowed failures at {slo*100}% SLO over {total:,} events: {allowed_failures(slo, total):,}")
        return 0

    if args.status:
        slo, total, observed = float(args.status[0]), int(args.status[1]), int(args.status[2])
        print(json.dumps(error_budget_status(slo, total, observed), indent=2))
        return 0

    if args.decide:
        print(json.dumps(decide(*args.decide), indent=2))
        return 0

    if args.sli_types:
        r = sli_types_for_service(args.sli_types)
        if r is None:
            print(f"unknown service type: {args.sli_types}. Valid: {list(SLI_TYPES_BY_SERVICE.keys())}")
            return 1
        print(json.dumps(r, indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
