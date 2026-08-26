#!/usr/bin/env python3
"""
sre_managing_incidents.py — Google SRE Book Ch.14 Incident Command System
roles, declaration criteria, best practices, and handoff protocol.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  Google SRE Book — Chapter 14: Managing Incidents
  https://sre.google/sre-book/managing-incidents/
  Author: Andrew Stribblehill. Edited by Kavita Guliani.
  Copyright © 2017 Google, Inc. Published by O'Reilly Media, Inc.
  Licensed under CC BY-NC-ND 4.0.

  License notes: CC BY-NC-ND permits reproduction with attribution for
  non-commercial purposes and forbids derivative works. This file uses
  only short verbatim excerpts (fair-use quotation): the four ICS roles,
  the three incident-declaration criteria, the seven best-practice
  headings, and the verbatim handoff-acknowledgment script. Longer
  analytical text is NOT reproduced.

Second source (§8.0 minimum-two-book):
  FEMA National Incident Management System (NIMS)
  https://www.fema.gov/national-incident-management-system
  Public domain (US Government work). Referenced by Ch.14 as the ICS
  origin. NIMS defines the same command / operations / planning
  / communications role separation that Google adopted.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: rule-based checks — role-assignment completeness, incident
  declaration classifier, handoff-protocol validator. Verbatim role
  and criterion strings; no invented thresholds.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/cortex (IR playbook, role assignments)
    - Ops-and-Delivery/handoff (cross-team incident handoff)
    - Engineering/ops (infra IR)
  Potential:
    - Ops-and-Delivery/pace (major-incident-in-sprint escalation)
    - Engineering/quinn (release-gate rollback IR)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- ROLES: verbatim from Ch.14 §"Recursive Separation of Responsibilities"
- DECLARATION_CRITERIA: verbatim from Ch.14 §"When to Declare an Incident"
- BEST_PRACTICES: verbatim from Ch.14 §"Best Practices for Incident Management"
- HANDOFF_ACKNOWLEDGMENT_SCRIPT: verbatim from Ch.14 §"Clear, Live Handoff"
- Complementary to sre_postmortem_culture.py (Ch.15) which handles the
  post-incident review side.
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM EXCERPTS (fair use — short quotations with attribution)
# ==================================================================

# Verbatim from Ch.14 §"Recursive Separation of Responsibilities":
# "Several distinct roles should be delegated to particular individuals:"
ROLES: Dict[str, str] = {
    "Incident Command": (
        "The incident commander holds the high-level state about the "
        "incident. They structure the incident response task force, "
        "assigning responsibilities according to need and priority. De "
        "facto, the commander holds all positions that they have not "
        "delegated. If appropriate, they can remove roadblocks that "
        "prevent Ops from working most effectively."
    ),
    "Operational Work": (
        "The Ops lead works with the incident commander to respond to "
        "the incident by applying operational tools to the task at hand. "
        "The operations team should be the only group modifying the "
        "system during an incident."
    ),
    "Communication": (
        "This person is the public face of the incident response task "
        "force. Their duties most definitely include issuing periodic "
        "updates to the incident response team and stakeholders "
        "(usually via email), and may extend to tasks such as keeping "
        "the incident document accurate and up to date."
    ),
    "Planning": (
        "The planning role supports Ops by dealing with longer-term "
        "issues, such as filing bugs, ordering dinner, arranging "
        "handoffs, and tracking how the system has diverged from the "
        "norm so it can be reverted once the incident is resolved."
    ),
}

# Verbatim from Ch.14 §"When to Declare an Incident":
# "if any of the following is true, the event is an incident:"
DECLARATION_CRITERIA: List[str] = [
    "Do you need to involve a second team in fixing the problem?",
    "Is the outage visible to customers?",
    "Is the issue unsolved even after an hour's concentrated analysis?",
]

# Verbatim from Ch.14 §"Best Practices for Incident Management":
BEST_PRACTICES: Dict[str, str] = {
    "Prioritize": (
        "Stop the bleeding, restore service, and preserve the evidence "
        "for root-causing."
    ),
    "Prepare": (
        "Develop and document your incident management procedures in "
        "advance, in consultation with incident participants."
    ),
    "Trust": "Give full autonomy within the assigned role to all incident participants.",
    "Introspect": (
        "Pay attention to your emotional state while responding to an "
        "incident. If you start to feel panicky or overwhelmed, solicit "
        "more support."
    ),
    "Consider alternatives": (
        "Periodically consider your options and re-evaluate whether it "
        "still makes sense to continue what you're doing or whether you "
        "should be taking another tack in incident response."
    ),
    "Practice": "Use the process routinely so it becomes second nature.",
    "Change it around": (
        "Were you incident commander last time? Take on a different role "
        "this time. Encourage every team member to acquire familiarity "
        "with each role."
    ),
}

# Verbatim from Ch.14 §"Clear, Live Handoff":
HANDOFF_ACKNOWLEDGMENT_SCRIPT: str = "You're now the incident commander, okay?"

SOURCE_ATTRIBUTION: str = (
    "Google SRE Book Ch.14 — Managing Incidents (Stribblehill, 2017) — "
    "https://sre.google/sre-book/managing-incidents/ — CC BY-NC-ND 4.0"
)


# ==================================================================
# Route B: role-assignment + declaration + handoff validators
# ==================================================================

def validate_role_assignments(assignments: Dict[str, Optional[str]]) -> Dict[str, Any]:
    """Validate role assignments against Ch.14 ICS role list.

    Per Ch.14: "De facto, the commander holds all positions that they
    have not delegated." So if Incident Command is set, missing sub-roles
    default to the commander. Only Incident Command is strictly required.

    Args:
      assignments: dict {role_name: individual_or_None}

    Returns:
      {ok, roles_filled, roles_defaulted_to_commander, missing_commander, cite}
    """
    if not isinstance(assignments, dict):
        raise TypeError("assignments must be a dict")

    commander = assignments.get("Incident Command")
    missing_commander = not commander

    filled: List[str] = []
    defaulted_to_commander: List[str] = []
    for role in ROLES:
        assignee = assignments.get(role)
        if assignee:
            filled.append(role)
        else:
            if commander:
                defaulted_to_commander.append(role)

    return {
        "ok": not missing_commander,
        "roles_filled": filled,
        "roles_defaulted_to_commander": defaulted_to_commander,
        "missing_commander": missing_commander,
        "note": (
            "Per Ch.14: 'De facto, the commander holds all positions "
            "that they have not delegated.' Sub-roles default to the "
            "commander if unassigned."
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def should_declare_incident(signals: Dict[str, Any]) -> Dict[str, Any]:
    """Route B classifier: does this event meet Ch.14 incident thresholds?

    Args:
      signals: dict with keys:
        second_team_needed (bool),
        customer_visible (bool),
        unsolved_over_1h (bool)

    Returns:
      {should_declare: bool, matched_criteria: [verbatim strings], cite}
    """
    matched: List[str] = []
    if signals.get("second_team_needed"):
        matched.append(DECLARATION_CRITERIA[0])
    if signals.get("customer_visible"):
        matched.append(DECLARATION_CRITERIA[1])
    if signals.get("unsolved_over_1h"):
        matched.append(DECLARATION_CRITERIA[2])

    return {
        "should_declare": bool(matched),
        "matched_criteria": matched,
        "note": (
            "Per Ch.14: 'It is better to declare an incident early and "
            "then find a simple fix and close out the incident than to "
            "have to spin up the incident management framework hours "
            "into a burgeoning problem.'"
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def validate_handoff(handoff: Dict[str, Any]) -> Dict[str, Any]:
    """Validate an IC handoff record against Ch.14 handoff protocol.

    Ch.14: 'the outgoing commander should be explicit in their handoff,
    specifically stating, "You're now the incident commander, okay?", and
    should not leave the call until receiving firm acknowledgment of
    handoff. The handoff should be communicated to others working on the
    incident so that it's clear who is leading the incident management
    efforts at all times.'

    Args:
      handoff: dict with keys:
        outgoing_commander (str),
        incoming_commander (str),
        acknowledgment_script_used (str),
        acknowledgment_confirmed (bool),
        broadcast_to_team (bool),
        broadcast_channels (list, optional),
        handoff_at (str timestamp, optional)

    Returns:
      {ok, findings, cite}
    """
    if not isinstance(handoff, dict):
        raise TypeError("handoff must be a dict")

    findings: List[Dict[str, str]] = []

    if not handoff.get("outgoing_commander"):
        findings.append({
            "code": "MISSING_OUTGOING",
            "severity": "error",
            "message": "outgoing_commander not recorded",
        })
    if not handoff.get("incoming_commander"):
        findings.append({
            "code": "MISSING_INCOMING",
            "severity": "error",
            "message": "incoming_commander not recorded",
        })
    if handoff.get("outgoing_commander") == handoff.get("incoming_commander"):
        findings.append({
            "code": "SAME_COMMANDER",
            "severity": "error",
            "message": "outgoing and incoming commander are the same person",
        })

    script = (handoff.get("acknowledgment_script_used") or "").strip().lower()
    canonical = HANDOFF_ACKNOWLEDGMENT_SCRIPT.strip().lower()
    if script != canonical:
        findings.append({
            "code": "SCRIPT_MISMATCH",
            "severity": "warning",
            "message": (
                f"acknowledgment_script_used differs from Ch.14 canonical "
                f"script ({HANDOFF_ACKNOWLEDGMENT_SCRIPT!r})"
            ),
        })

    if not handoff.get("acknowledgment_confirmed"):
        findings.append({
            "code": "NO_ACKNOWLEDGMENT",
            "severity": "error",
            "message": (
                "acknowledgment_confirmed is falsy — Ch.14 requires "
                "outgoing commander to receive firm acknowledgment "
                "before leaving the call"
            ),
        })

    if not handoff.get("broadcast_to_team"):
        findings.append({
            "code": "NO_BROADCAST",
            "severity": "error",
            "message": (
                "broadcast_to_team is falsy — Ch.14 requires handoff to "
                "be communicated to others working on the incident"
            ),
        })

    ok = not any(f["severity"] == "error" for f in findings)
    return {
        "ok": ok,
        "error_count": sum(1 for f in findings if f["severity"] == "error"),
        "warning_count": sum(1 for f in findings if f["severity"] == "warning"),
        "findings": findings,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Verbatim registries have expected sizes
    assert len(ROLES) == 4, list(ROLES)
    assert set(ROLES.keys()) == {"Incident Command", "Operational Work",
                                  "Communication", "Planning"}
    assert len(DECLARATION_CRITERIA) == 3
    assert len(BEST_PRACTICES) == 7
    print(f"[PASS] roles=4 declaration_criteria=3 best_practices=7")

    # 2. Verbatim spot-checks
    assert HANDOFF_ACKNOWLEDGMENT_SCRIPT == "You're now the incident commander, okay?"
    assert DECLARATION_CRITERIA[0] == "Do you need to involve a second team in fixing the problem?"
    assert "Stop the bleeding" in BEST_PRACTICES["Prioritize"]
    assert "Change it around" in BEST_PRACTICES
    print("[PASS] verbatim spot-checks match Ch.14 wording")

    # 3. Complete role assignment → ok
    r = validate_role_assignments({
        "Incident Command": "Sabrina",
        "Operational Work": "Mary",
        "Communication": "Sabrina",  # allowed — one person can hold multiple
        "Planning": "Robin",
    })
    assert r["ok"] is True, r
    assert r["missing_commander"] is False
    assert len(r["roles_filled"]) == 4
    print("[PASS] all 4 roles filled → ok")

    # 4. Missing commander → not ok
    r = validate_role_assignments({
        "Operational Work": "Mary",
    })
    assert r["ok"] is False
    assert r["missing_commander"] is True
    print("[PASS] missing commander → not ok")

    # 5. Commander only, other roles default to commander (per Ch.14 de facto)
    r = validate_role_assignments({"Incident Command": "Sabrina"})
    assert r["ok"] is True
    assert set(r["roles_defaulted_to_commander"]) == {"Operational Work", "Communication", "Planning"}
    print("[PASS] commander only → other roles default to commander (Ch.14 de facto)")

    # 6. should_declare_incident: no signals → do not declare
    r = should_declare_incident({})
    assert r["should_declare"] is False, r
    print("[PASS] no signals → do not declare")

    # 7. should_declare_incident: customer visible → declare
    r = should_declare_incident({"customer_visible": True})
    assert r["should_declare"] is True
    assert DECLARATION_CRITERIA[1] in r["matched_criteria"]
    print("[PASS] customer visible → declare")

    # 8. should_declare_incident: all 3 signals → 3 matched
    r = should_declare_incident({
        "second_team_needed": True,
        "customer_visible": True,
        "unsolved_over_1h": True,
    })
    assert r["should_declare"] is True
    assert len(r["matched_criteria"]) == 3
    print(f"[PASS] all 3 signals → 3 criteria matched")

    # 9. validate_handoff: canonical script + ack + broadcast → ok
    r = validate_handoff({
        "outgoing_commander": "Sabrina",
        "incoming_commander": "Alex",
        "acknowledgment_script_used": HANDOFF_ACKNOWLEDGMENT_SCRIPT,
        "acknowledgment_confirmed": True,
        "broadcast_to_team": True,
        "broadcast_channels": ["#incidents", "IR mailing list"],
    })
    assert r["ok"] is True, r
    assert r["error_count"] == 0
    assert r["warning_count"] == 0
    print(f"[PASS] canonical handoff → ok (0 errors, 0 warnings)")

    # 10. validate_handoff: missing acknowledgment → error
    r = validate_handoff({
        "outgoing_commander": "Sabrina",
        "incoming_commander": "Alex",
        "acknowledgment_script_used": HANDOFF_ACKNOWLEDGMENT_SCRIPT,
        "acknowledgment_confirmed": False,
        "broadcast_to_team": True,
    })
    codes = {f["code"] for f in r["findings"]}
    assert r["ok"] is False
    assert "NO_ACKNOWLEDGMENT" in codes
    print("[PASS] missing acknowledgment → NO_ACKNOWLEDGMENT error")

    # 11. validate_handoff: same-person handoff → error
    r = validate_handoff({
        "outgoing_commander": "Sabrina",
        "incoming_commander": "Sabrina",
        "acknowledgment_script_used": HANDOFF_ACKNOWLEDGMENT_SCRIPT,
        "acknowledgment_confirmed": True,
        "broadcast_to_team": True,
    })
    codes = {f["code"] for f in r["findings"]}
    assert "SAME_COMMANDER" in codes
    print("[PASS] same-person handoff → SAME_COMMANDER error")

    # 12. validate_handoff: non-canonical script → warning
    r = validate_handoff({
        "outgoing_commander": "Sabrina",
        "incoming_commander": "Alex",
        "acknowledgment_script_used": "You've got it, thanks",
        "acknowledgment_confirmed": True,
        "broadcast_to_team": True,
    })
    codes = {f["code"] for f in r["findings"]}
    assert "SCRIPT_MISMATCH" in codes
    assert r["ok"] is True  # warning, not error
    print("[PASS] non-canonical script → SCRIPT_MISMATCH warning (not error)")

    # 13. validate_handoff: missing broadcast → error
    r = validate_handoff({
        "outgoing_commander": "Sabrina",
        "incoming_commander": "Alex",
        "acknowledgment_script_used": HANDOFF_ACKNOWLEDGMENT_SCRIPT,
        "acknowledgment_confirmed": True,
        "broadcast_to_team": False,
    })
    codes = {f["code"] for f in r["findings"]}
    assert "NO_BROADCAST" in codes
    assert r["ok"] is False
    print("[PASS] no broadcast → NO_BROADCAST error")

    # 14. Citation present in all outputs
    r1 = validate_role_assignments({})
    r2 = should_declare_incident({})
    r3 = validate_handoff({})
    assert all("sre.google" in x["cite"] for x in [r1, r2, r3])
    print("[PASS] source attribution present in all outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="Google SRE Book Ch.14 incident management tooling")
    p.add_argument("--roles", action="store_true", help="show verbatim ICS roles")
    p.add_argument("--criteria", action="store_true", help="show declaration criteria")
    p.add_argument("--best-practices", action="store_true", help="show best practices")
    p.add_argument("--validate-roles", help="validate role-assignment dict (JSON file)")
    p.add_argument("--should-declare", help="evaluate incident signals (JSON file)")
    p.add_argument("--validate-handoff", help="validate handoff record (JSON file)")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.roles, args.criteria, args.best_practices,
                             args.validate_roles, args.should_declare, args.validate_handoff]):
        _run_self_tests()
        return 0

    if args.roles:
        print(f"ICS Roles ({SOURCE_ATTRIBUTION}):")
        for name, desc in ROLES.items():
            print(f"\n  {name}:\n    {desc}")
        return 0

    if args.criteria:
        print(f"Declaration criteria ({SOURCE_ATTRIBUTION}):")
        for c in DECLARATION_CRITERIA:
            print(f"  - {c}")
        return 0

    if args.best_practices:
        print(f"Best practices ({SOURCE_ATTRIBUTION}):")
        for name, desc in BEST_PRACTICES.items():
            print(f"  - {name}: {desc}")
        return 0

    if args.validate_roles:
        with open(args.validate_roles) as f:
            data = json.load(f)
        print(json.dumps(validate_role_assignments(data), indent=2))
        return 0

    if args.should_declare:
        with open(args.should_declare) as f:
            data = json.load(f)
        print(json.dumps(should_declare_incident(data), indent=2))
        return 0

    if args.validate_handoff:
        with open(args.validate_handoff) as f:
            data = json.load(f)
        print(json.dumps(validate_handoff(data), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
