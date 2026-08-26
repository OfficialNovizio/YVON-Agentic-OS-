#!/usr/bin/env python3
"""
sre_postmortem_culture.py — Google SRE Book Ch.15 postmortem triggers,
review criteria, best practices, and a postmortem-draft scorer.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  Google SRE Book — Chapter 15: Postmortem Culture: Learning from Failure
  https://sre.google/sre-book/postmortem-culture/
  Authors: John Lunney and Sue Lueder. Edited by Gary O'Connor.
  Copyright © 2017 Google, Inc. Published by O'Reilly Media, Inc.
  Licensed under CC BY-NC-ND 4.0.

  License notes: CC BY-NC-ND permits reproduction with attribution for
  non-commercial purposes and forbids derivative works. This file uses
  only short verbatim excerpts (fair use / brief quotation) — the five
  postmortem triggers, the five review criteria, and the four
  "Best Practice" headings. Longer analytical text is NOT reproduced.
  All excerpts carry SOURCE attribution inline. Any consumer using this
  for a commercial deployment must confirm quotation length still
  qualifies as fair use in their jurisdiction.

Second source (§8.0 minimum-two-book):
  Google SRE Workbook — Chapter 10: Postmortem Culture: Learning from
  Failure at Scale
  https://sre.google/workbook/postmortem-culture/
  Same license. Cited via the "postmortem-analysis" cross-reference
  linked from the primary chapter.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: rule-based checklist scorer — a postmortem draft is scored
  against a fixed set of review criteria (per-item present/absent).
  No thresholds are invented; the criteria themselves are verbatim.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/cortex (post-incident review)
    - Ops-and-Delivery/pace (delivery-incident retros)
    - Ops-and-Delivery/handoff (cross-team incident handoff)
    - Engineering/quinn (release-gate retros)
  Potential:
    - Engineering/ops (infra postmortems)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- POSTMORTEM_TRIGGERS: verbatim from Ch.15 §"Google's Postmortem Philosophy"
- REVIEW_CRITERIA: verbatim from Ch.15 §"Collaborate and Share Knowledge"
- BEST_PRACTICES: the four "Best Practice" heading titles verbatim
- score_postmortem() is Route B rule application — logic (weighting)
  is Tier C reasoning, called out below.
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM EXCERPTS (fair use — short quotations with attribution)
# ==================================================================

# Verbatim from Google SRE Book Ch.15 §"Google's Postmortem Philosophy"
# Source: https://sre.google/sre-book/postmortem-culture/
POSTMORTEM_TRIGGERS: List[str] = [
    "User-visible downtime or degradation beyond a certain threshold",
    "Data loss of any kind",
    "On-call engineer intervention (release rollback, rerouting of traffic, etc.)",
    "A resolution time above some threshold",
    "A monitoring failure (which usually implies manual incident discovery)",
]

# Verbatim from Google SRE Book Ch.15 §"Collaborate and Share Knowledge"
# Source: https://sre.google/sre-book/postmortem-culture/
REVIEW_CRITERIA: List[str] = [
    "Was key incident data collected for posterity?",
    "Are the impact assessments complete?",
    "Was the root cause sufficiently deep?",
    "Is the action plan appropriate and are resulting bug fixes at appropriate priority?",
    "Did we share the outcome with relevant stakeholders?",
]

# Verbatim "Best Practice" heading titles from Google SRE Book Ch.15
# Source: https://sre.google/sre-book/postmortem-culture/
BEST_PRACTICES: List[str] = [
    "Avoid Blame and Keep It Constructive",
    "No Postmortem Left Unreviewed",
    "Visibly Reward People for Doing the Right Thing",
    "Ask for Feedback on Postmortem Effectiveness",
]

# Verbatim definition of a postmortem (fair use quotation)
# Source: https://sre.google/sre-book/postmortem-culture/
POSTMORTEM_DEFINITION: str = (
    "A postmortem is a written record of an incident, its impact, "
    "the actions taken to mitigate or resolve it, the root cause(s), "
    "and the follow-up actions to prevent the incident from recurring."
)

SOURCE_ATTRIBUTION: str = (
    "Google SRE Book Ch.15 — Postmortem Culture: Learning from Failure "
    "(Lunney & Lueder, 2017) — https://sre.google/sre-book/postmortem-culture/ "
    "— CC BY-NC-ND 4.0"
)


# ==================================================================
# Route B: postmortem checklist evaluator
# ==================================================================

# Fields a postmortem draft dict may contain. This structure mirrors the
# review criteria order; consumers pass a dict indicating which fields
# they filled in.
REQUIRED_FIELDS_BY_CRITERION: Dict[str, List[str]] = {
    # Each criterion is met when ALL required fields are non-empty.
    REVIEW_CRITERIA[0]: [
        "incident_id", "start_time", "end_time", "detection_time",
        "resolution_time", "responders",
    ],
    REVIEW_CRITERIA[1]: [
        "user_impact", "business_impact", "affected_services",
    ],
    REVIEW_CRITERIA[2]: [
        "root_cause", "contributing_causes",
    ],
    REVIEW_CRITERIA[3]: [
        "action_items",  # each item must have owner, priority, tracker link
    ],
    REVIEW_CRITERIA[4]: [
        "shared_with", "distribution_channels",
    ],
}


def _field_present(pm: Dict[str, Any], field: str) -> bool:
    """A field counts as present if non-empty (not None, not '', not [], not {})."""
    v = pm.get(field)
    if v is None:
        return False
    if isinstance(v, (str, list, dict, tuple, set)) and len(v) == 0:
        return False
    return True


def _action_items_valid(items: Any) -> bool:
    """Action items list must be non-empty AND each item must have owner + priority."""
    if not isinstance(items, list) or not items:
        return False
    for item in items:
        if not isinstance(item, dict):
            return False
        if not item.get("owner"):
            return False
        if not item.get("priority"):
            return False
    return True


def score_postmortem(pm: Dict[str, Any]) -> Dict[str, Any]:
    """Score a postmortem draft against the five review criteria.

    Args:
      pm: postmortem draft dict — see REQUIRED_FIELDS_BY_CRITERION for
        recognised keys.

    Returns:
      {
        criteria: [{criterion, met, missing_fields}],
        met_count: int (0-5),
        total: 5,
        percent: float,
        verdict: "ready-for-review" | "revise" | "draft",
        cite: source attribution,
      }
    """
    results = []
    met_count = 0
    for criterion, required in REQUIRED_FIELDS_BY_CRITERION.items():
        missing: List[str] = []
        for field in required:
            if field == "action_items":
                if not _action_items_valid(pm.get(field)):
                    missing.append(field + " (need list with owner + priority per item)")
            elif not _field_present(pm, field):
                missing.append(field)
        met = len(missing) == 0
        if met:
            met_count += 1
        results.append({
            "criterion": criterion,
            "met": met,
            "missing_fields": missing,
        })

    total = len(REVIEW_CRITERIA)
    percent = round(met_count / total * 100, 1)

    # Tier C reasoning: verdict thresholds. Made explicit — not from source.
    if met_count == total:
        verdict = "ready-for-review"
    elif met_count >= 3:
        verdict = "revise"
    else:
        verdict = "draft"

    return {
        "criteria": results,
        "met_count": met_count,
        "total": total,
        "percent": percent,
        "verdict": verdict,
        "verdict_thresholds_note": (
            "Tier C: verdict labels (draft <3, revise 3-4, ready-for-review 5) "
            "are a reasoning-based convention, not from Google SRE Book."
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def should_write_postmortem(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Route B classifier: does this incident require a postmortem?

    Args:
      incident: dict with any of these signals — user_visible_downtime_min,
        data_loss (bool), oncall_intervention (bool), resolution_time_min,
        monitoring_failure (bool), stakeholder_requested (bool),
        downtime_threshold_min (org-configurable, defaults to <FILL_IN>),
        resolution_threshold_min (org-configurable).

    Returns:
      {required: bool, matched_triggers: [verbatim trigger strings], cite}
    """
    matched: List[str] = []

    downtime_min = incident.get("user_visible_downtime_min", 0)
    downtime_thresh = incident.get("downtime_threshold_min")
    if downtime_thresh is None:
        downtime_thresh = "<FILL_IN>"  # per §0.5, operator must set org policy
    if isinstance(downtime_thresh, (int, float)) and downtime_min > downtime_thresh:
        matched.append(POSTMORTEM_TRIGGERS[0])

    if incident.get("data_loss"):
        matched.append(POSTMORTEM_TRIGGERS[1])

    if incident.get("oncall_intervention"):
        matched.append(POSTMORTEM_TRIGGERS[2])

    resolution_min = incident.get("resolution_time_min", 0)
    resolution_thresh = incident.get("resolution_threshold_min")
    if resolution_thresh is None:
        resolution_thresh = "<FILL_IN>"
    if isinstance(resolution_thresh, (int, float)) and resolution_min > resolution_thresh:
        matched.append(POSTMORTEM_TRIGGERS[3])

    if incident.get("monitoring_failure"):
        matched.append(POSTMORTEM_TRIGGERS[4])

    # From Ch.15: "any stakeholder may request a postmortem for an event"
    stakeholder_requested = incident.get("stakeholder_requested", False)

    required = bool(matched) or stakeholder_requested
    return {
        "required": required,
        "matched_triggers": matched,
        "stakeholder_requested": stakeholder_requested,
        "note": (
            "Thresholds (downtime_threshold_min, resolution_threshold_min) "
            "are org-policy fields per §0.5; if <FILL_IN>, that trigger is "
            "skipped in this evaluation."
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Verbatim registries have expected sizes
    assert len(POSTMORTEM_TRIGGERS) == 5, len(POSTMORTEM_TRIGGERS)
    assert len(REVIEW_CRITERIA) == 5, len(REVIEW_CRITERIA)
    assert len(BEST_PRACTICES) == 4, len(BEST_PRACTICES)
    print(f"[PASS] triggers={len(POSTMORTEM_TRIGGERS)} criteria={len(REVIEW_CRITERIA)} best_practices={len(BEST_PRACTICES)}")

    # 2. Verbatim strings unchanged (spot-check)
    assert POSTMORTEM_TRIGGERS[1] == "Data loss of any kind"
    assert REVIEW_CRITERIA[2] == "Was the root cause sufficiently deep?"
    assert BEST_PRACTICES[0] == "Avoid Blame and Keep It Constructive"
    print("[PASS] verbatim spot-checks match Ch.15 wording")

    # 3. Empty postmortem → 0/5, verdict draft
    r = score_postmortem({})
    assert r["met_count"] == 0, r
    assert r["verdict"] == "draft", r
    print(f"[PASS] empty postmortem → {r['met_count']}/{r['total']} ({r['verdict']})")

    # 4. Complete postmortem → 5/5, ready-for-review
    complete = {
        "incident_id": "INC-1234",
        "start_time": "2026-08-10T14:00:00Z",
        "end_time": "2026-08-10T14:47:00Z",
        "detection_time": "2026-08-10T14:03:00Z",
        "resolution_time": "2026-08-10T14:47:00Z",
        "responders": ["alice", "bob"],
        "user_impact": "12% of API calls returned 500 for 47 min",
        "business_impact": "est. $8k SLA credit",
        "affected_services": ["api-gateway", "payments"],
        "root_cause": "Feature flag rollout enabled a code path with a nil-check bug",
        "contributing_causes": ["missing canary", "no automated rollback"],
        "action_items": [
            {"description": "Add canary gate for feature flag rollouts",
             "owner": "alice", "priority": "P0", "tracker": "JIRA-100"},
            {"description": "Add nil-check test coverage",
             "owner": "bob", "priority": "P1", "tracker": "JIRA-101"},
        ],
        "shared_with": ["eng-all@", "leadership@"],
        "distribution_channels": ["eng-postmortems mailing list", "wiki"],
    }
    r = score_postmortem(complete)
    assert r["met_count"] == 5, r
    assert r["verdict"] == "ready-for-review", r
    print(f"[PASS] complete postmortem → {r['met_count']}/{r['total']} ({r['verdict']})")

    # 5. Action items must have owner + priority
    almost = dict(complete)
    almost["action_items"] = [{"description": "Fix stuff"}]  # missing owner + priority
    r = score_postmortem(almost)
    assert r["met_count"] == 4, r
    assert r["verdict"] == "revise", r
    print("[PASS] action items without owner+priority fail criterion 4")

    # 6. Partial postmortem lands as revise
    partial = {
        "incident_id": "INC-9",
        "start_time": "2026-08-10T14:00:00Z",
        "end_time": "2026-08-10T14:47:00Z",
        "detection_time": "2026-08-10T14:03:00Z",
        "resolution_time": "2026-08-10T14:47:00Z",
        "responders": ["alice"],
        "user_impact": "some users saw errors",
        "business_impact": "TBD",
        "affected_services": ["api"],
        "root_cause": "config typo",
        "contributing_causes": ["lack of review"],
    }
    r = score_postmortem(partial)
    assert r["met_count"] == 3, r
    assert r["verdict"] == "revise", r
    print(f"[PASS] partial postmortem → {r['met_count']}/{r['total']} ({r['verdict']})")

    # 7. should_write_postmortem triggers on data loss
    r = should_write_postmortem({"data_loss": True})
    assert r["required"] is True
    assert POSTMORTEM_TRIGGERS[1] in r["matched_triggers"]
    print("[PASS] data_loss → postmortem required")

    # 8. should_write_postmortem triggers on oncall intervention
    r = should_write_postmortem({"oncall_intervention": True})
    assert r["required"] is True
    print("[PASS] oncall_intervention → postmortem required")

    # 9. Stakeholder request forces postmortem even absent other triggers
    r = should_write_postmortem({"stakeholder_requested": True})
    assert r["required"] is True
    assert r["matched_triggers"] == []
    print("[PASS] stakeholder request → postmortem required (no other trigger)")

    # 10. Downtime threshold requires operator config (<FILL_IN>) — no false positive
    r = should_write_postmortem({"user_visible_downtime_min": 60})  # no threshold set
    assert r["required"] is False, r
    print("[PASS] missing downtime threshold (<FILL_IN>) → no trigger fires (§0.5)")

    # 11. Downtime threshold when set works
    r = should_write_postmortem({
        "user_visible_downtime_min": 60,
        "downtime_threshold_min": 15,
    })
    assert r["required"] is True
    assert POSTMORTEM_TRIGGERS[0] in r["matched_triggers"]
    print("[PASS] downtime > threshold → correct trigger fires")

    # 12. Citation present in every output
    r = score_postmortem({})
    assert "sre.google" in r["cite"]
    r = should_write_postmortem({"data_loss": True})
    assert "sre.google" in r["cite"]
    print("[PASS] source attribution present in all outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="Google SRE postmortem tooling")
    p.add_argument("--triggers", action="store_true", help="list verbatim postmortem triggers")
    p.add_argument("--criteria", action="store_true", help="list verbatim review criteria")
    p.add_argument("--best-practices", action="store_true", help="list best-practice headings")
    p.add_argument("--score", help="score postmortem draft (JSON file)")
    p.add_argument("--should-write", help="evaluate incident (JSON file) for postmortem trigger")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.triggers, args.criteria, args.best_practices, args.score, args.should_write]):
        _run_self_tests()
        return 0

    if args.triggers:
        print(f"Postmortem triggers ({SOURCE_ATTRIBUTION}):")
        for t in POSTMORTEM_TRIGGERS:
            print(f"  - {t}")
        return 0

    if args.criteria:
        print(f"Review criteria ({SOURCE_ATTRIBUTION}):")
        for c in REVIEW_CRITERIA:
            print(f"  - {c}")
        return 0

    if args.best_practices:
        print(f"Best practices ({SOURCE_ATTRIBUTION}):")
        for b in BEST_PRACTICES:
            print(f"  - {b}")
        return 0

    if args.score:
        with open(args.score) as f:
            pm = json.load(f)
        print(json.dumps(score_postmortem(pm), indent=2))
        return 0

    if args.should_write:
        with open(args.should_write) as f:
            inc = json.load(f)
        print(json.dumps(should_write_postmortem(inc), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
