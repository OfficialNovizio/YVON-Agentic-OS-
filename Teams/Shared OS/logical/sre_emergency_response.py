#!/usr/bin/env python3
"""
sre_emergency_response.py — Google SRE Book Ch.13 emergency-trigger
taxonomy and response principles.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  Google SRE Book — Chapter 13: Emergency Response
  https://sre.google/sre-book/emergency-response/
  Author: Corey Adam Baye. Edited by Diane Bates.
  Copyright © 2017 Google, Inc. Licensed under CC BY-NC-ND 4.0.

  License notes: CC BY-NC-ND permits reproduction with attribution for
  non-commercial purposes and forbids derivative works. This file uses
  only short verbatim excerpts (fair-use quotation): the three emergency
  trigger taxonomy headings, the three "Learn from the Past" headings,
  and the short verbatim opening lines ("First of all, don't panic!" /
  "If you feel overwhelmed, pull in more people."). Case-study narrative
  is NOT reproduced.

Second source (§8.0 minimum-two-book):
  Google SRE Book — Chapter 14: Managing Incidents
  https://sre.google/sre-book/managing-incidents/
  Same license. Ch.14 provides the ICS role separation invoked by
  Ch.13's advice to "pull in more people" and "follow that process."
  This module points consumers to sre_managing_incidents.py for the
  role/handoff mechanics.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: rule-based classifier — categorises an incident by trigger
  (test, change, process, or other) and returns the applicable Ch.13
  response principles.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/cortex (IR trigger classification for post-incident
      root-cause taxonomy)
    - Engineering/ops (change/process failure attribution)
  Potential:
    - Ops-and-Delivery/pace (delivery-incident cause tagging)
    - Engineering/quinn (release-induced-emergency taxonomy)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- EMERGENCY_TRIGGERS: verbatim headings from Ch.13 §§ "Test-Induced
  Emergency", "Change-Induced Emergency", "Process-Induced Emergency"
- LEARN_FROM_PAST_PRINCIPLES: verbatim from Ch.13 §"Learn from the Past."
- OPENING_ADVICE / OVERWHELMED_ADVICE: verbatim from Ch.13 §"What to Do
  When Systems Break"
- Consumers doing role assignment / handoff validation should use
  Shared OS/logical/sre_managing_incidents.py (Ch.14).
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM EXTRACTS (fair use — short quotations with attribution)
# ==================================================================

# Verbatim heading names from Ch.13:
EMERGENCY_TRIGGERS: Dict[str, Dict[str, str]] = {
    "test_induced": {
        "heading": "Test-Induced Emergency",
        "description": (
            "SREs deliberately break systems to observe failure modes; "
            "sometimes the controlled experiment produces unexpected "
            "cascading failures. Ch.13 lesson: rollback procedures must "
            "themselves be tested before large-scale tests are attempted."
        ),
        "canonical_lesson": (
            "We now require thorough testing of rollback procedures "
            "before such large-scale tests."
        ),
    },
    "change_induced": {
        "heading": "Change-Induced Emergency",
        "description": (
            "A configuration or code change triggers a bug — often in an "
            "untested combination — after passing normal canary. Ch.13 "
            "lesson: canary all changes regardless of perceived risk."
        ),
        "canonical_lesson": (
            "This incident immediately raised their priority and "
            "reinforced the need for thorough canarying, regardless of "
            "the perceived risk."
        ),
    },
    "process_induced": {
        "heading": "Process-Induced Emergency",
        "description": (
            "Automation runs efficiently in an unintended direction "
            "(e.g., turndown automation destroys the wrong fleet). "
            "Ch.13 lesson: sanity-check the commands automation sends."
        ),
        "canonical_lesson": (
            "The root cause was that the turndown automation server "
            "lacked the appropriate sanity checks on the commands it "
            "sent."
        ),
    },
}

# Verbatim from Ch.13 §"What to Do When Systems Break":
OPENING_ADVICE: str = (
    "First of all, don't panic! You aren't alone, and the sky isn't "
    "falling. You're a professional and trained to handle this sort of "
    "situation."
)

# Verbatim from Ch.13 §"What to Do When Systems Break":
OVERWHELMED_ADVICE: str = (
    "If you feel overwhelmed, pull in more people. Sometimes it may "
    "even be necessary to page the entire company."
)

# Verbatim from Ch.13 §"All Problems Have Solutions":
UTILIZE_TRIGGERING_PERSON_ADVICE: str = (
    "Oftentimes, the person with the most state is the one whose "
    "actions somehow triggered the event. Utilize that person."
)

# Verbatim headings from Ch.13 §"Learn from the Past. Don't Repeat It.":
LEARN_FROM_PAST_PRINCIPLES: List[Dict[str, str]] = [
    {
        "heading": "Keep a History of Outages",
        "description": (
            "Document what has broken in the past. Publish and organize "
            "postmortems so everyone in the company can learn."
        ),
    },
    {
        "heading": "Ask the Big, Even Improbable, Questions: What If…?",
        "description": (
            "Ask open-ended what-if questions (building power fails, "
            "datacenter goes dark, web server compromised) and validate "
            "your organization has plans for each."
        ),
    },
    {
        "heading": "Encourage Proactive Testing",
        "description": (
            "Until a system has actually failed, you don't truly know "
            "how it, its dependencies, or your users will react. Don't "
            "rely on untested assumptions."
        ),
    },
]

SOURCE_ATTRIBUTION: str = (
    "Google SRE Book Ch.13 — Emergency Response (Baye, 2017) — "
    "https://sre.google/sre-book/emergency-response/ — CC BY-NC-ND 4.0"
)


# ==================================================================
# Route B: classifier + response-checklist builder
# ==================================================================

def classify_trigger(signals: Dict[str, Any]) -> Dict[str, Any]:
    """Classify an incident's trigger against Ch.13 taxonomy.

    Args:
      signals: dict with any of these boolean keys:
        - triggered_by_deliberate_test (bool): SRE-run experiment / DiRT
        - triggered_by_change (bool): config/code push
        - triggered_by_automation (bool): scheduled/automated process
        Plus optional short 'summary' string.

    Returns:
      {trigger, heading, canonical_lesson, matched_signals, cite}
      or {trigger: "other", ...} if none of the 3 categories match.
    """
    if not isinstance(signals, dict):
        raise TypeError("signals must be a dict")

    matches: List[str] = []
    if signals.get("triggered_by_deliberate_test"):
        matches.append("test_induced")
    if signals.get("triggered_by_change"):
        matches.append("change_induced")
    if signals.get("triggered_by_automation"):
        matches.append("process_induced")

    if len(matches) == 0:
        return {
            "trigger": "other",
            "heading": None,
            "canonical_lesson": None,
            "matched_signals": [],
            "note": (
                "None of Ch.13's three named categories apply. Common "
                "'other' causes: dependency failure, hardware fault, "
                "external attack, capacity exhaustion."
            ),
            "cite": SOURCE_ATTRIBUTION,
        }

    if len(matches) == 1:
        trigger = matches[0]
        rec = EMERGENCY_TRIGGERS[trigger]
        return {
            "trigger": trigger,
            "heading": rec["heading"],
            "canonical_lesson": rec["canonical_lesson"],
            "description": rec["description"],
            "matched_signals": matches,
            "cite": SOURCE_ATTRIBUTION,
        }

    # Multiple triggers matched — ambiguous, return all candidates
    return {
        "trigger": "multiple",
        "candidates": [
            {
                "trigger": t,
                "heading": EMERGENCY_TRIGGERS[t]["heading"],
                "canonical_lesson": EMERGENCY_TRIGGERS[t]["canonical_lesson"],
            }
            for t in matches
        ],
        "matched_signals": matches,
        "note": (
            "Multiple Ch.13 categories match. Post-incident review "
            "should distinguish the proximate trigger (what fired the "
            "first alert) from contributing factors."
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def response_checklist() -> Dict[str, Any]:
    """Return the Ch.13 response checklist (verbatim advice)."""
    return {
        "step_1_dont_panic": OPENING_ADVICE,
        "step_2_pull_in_help": OVERWHELMED_ADVICE,
        "step_3_utilize_triggering_person": UTILIZE_TRIGGERING_PERSON_ADVICE,
        "step_4_follow_ims_protocol": (
            "Ch.13 references Ch.14 for the incident-management protocol. "
            "Use Shared OS/logical/sre_managing_incidents.py to validate "
            "role assignment, declaration threshold, and handoff."
        ),
        "post_incident_principles": LEARN_FROM_PAST_PRINCIPLES,
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Registry sizes
    assert len(EMERGENCY_TRIGGERS) == 3
    assert set(EMERGENCY_TRIGGERS.keys()) == {"test_induced", "change_induced", "process_induced"}
    assert len(LEARN_FROM_PAST_PRINCIPLES) == 3
    print(f"[PASS] 3 emergency-trigger categories · 3 learn-from-past principles")

    # 2. Verbatim spot-checks
    assert EMERGENCY_TRIGGERS["test_induced"]["heading"] == "Test-Induced Emergency"
    assert EMERGENCY_TRIGGERS["change_induced"]["heading"] == "Change-Induced Emergency"
    assert EMERGENCY_TRIGGERS["process_induced"]["heading"] == "Process-Induced Emergency"
    assert "don't panic" in OPENING_ADVICE
    assert "pull in more people" in OVERWHELMED_ADVICE
    assert "most state" in UTILIZE_TRIGGERING_PERSON_ADVICE
    assert LEARN_FROM_PAST_PRINCIPLES[0]["heading"] == "Keep a History of Outages"
    print("[PASS] verbatim spot-checks match Ch.13 wording")

    # 3. Classify test-induced
    r = classify_trigger({"triggered_by_deliberate_test": True})
    assert r["trigger"] == "test_induced"
    assert r["heading"] == "Test-Induced Emergency"
    print(f"[PASS] test signal → test_induced")

    # 4. Classify change-induced
    r = classify_trigger({"triggered_by_change": True})
    assert r["trigger"] == "change_induced"
    print(f"[PASS] change signal → change_induced")

    # 5. Classify process-induced
    r = classify_trigger({"triggered_by_automation": True})
    assert r["trigger"] == "process_induced"
    print(f"[PASS] automation signal → process_induced")

    # 6. Classify with no signals → other
    r = classify_trigger({})
    assert r["trigger"] == "other"
    assert r["matched_signals"] == []
    print(f"[PASS] no signals → other category")

    # 7. Multiple signals → multiple
    r = classify_trigger({
        "triggered_by_change": True,
        "triggered_by_automation": True,
    })
    assert r["trigger"] == "multiple"
    assert len(r["candidates"]) == 2
    triggers = {c["trigger"] for c in r["candidates"]}
    assert triggers == {"change_induced", "process_induced"}
    print(f"[PASS] change+automation signals → multiple ({triggers})")

    # 8. All three signals → all three candidates
    r = classify_trigger({
        "triggered_by_deliberate_test": True,
        "triggered_by_change": True,
        "triggered_by_automation": True,
    })
    assert r["trigger"] == "multiple"
    assert len(r["candidates"]) == 3
    print(f"[PASS] all three signals → 3 candidates")

    # 9. Non-dict input rejected
    try:
        classify_trigger("not-a-dict")
        assert False, "should have raised"
    except TypeError:
        pass
    print("[PASS] non-dict input rejected")

    # 10. Response checklist has all 4 steps + past-principles
    r = response_checklist()
    assert "step_1_dont_panic" in r
    assert "step_2_pull_in_help" in r
    assert "step_3_utilize_triggering_person" in r
    assert "step_4_follow_ims_protocol" in r
    assert len(r["post_incident_principles"]) == 3
    print("[PASS] response_checklist has all 4 verbatim steps + 3 learn principles")

    # 11. Every category has heading, description, canonical_lesson
    for tid, rec in EMERGENCY_TRIGGERS.items():
        assert rec["heading"], tid
        assert rec["description"], tid
        assert rec["canonical_lesson"], tid
    print("[PASS] all 3 trigger categories have heading/description/canonical_lesson")

    # 12. Citation present
    r = classify_trigger({})
    assert "sre.google" in r["cite"]
    r = response_checklist()
    assert "sre.google" in r["cite"]
    print("[PASS] source attribution present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="Google SRE Book Ch.13 emergency-response tooling")
    p.add_argument("--triggers", action="store_true", help="list Ch.13 trigger categories")
    p.add_argument("--principles", action="store_true", help="list 3 learn-from-past principles")
    p.add_argument("--classify", help="JSON file with incident signals")
    p.add_argument("--checklist", action="store_true", help="show response checklist")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.triggers, args.principles, args.classify, args.checklist]):
        _run_self_tests()
        return 0

    if args.triggers:
        print(f"Ch.13 emergency triggers ({SOURCE_ATTRIBUTION}):")
        for tid, rec in EMERGENCY_TRIGGERS.items():
            print(f"\n  {rec['heading']} [{tid}]")
            print(f"    {rec['description']}")
            print(f"    lesson: {rec['canonical_lesson']}")
        return 0

    if args.principles:
        print(f"Ch.13 learn-from-past principles ({SOURCE_ATTRIBUTION}):")
        for p in LEARN_FROM_PAST_PRINCIPLES:
            print(f"  - {p['heading']}: {p['description']}")
        return 0

    if args.classify:
        with open(args.classify) as f:
            print(json.dumps(classify_trigger(json.load(f)), indent=2))
        return 0

    if args.checklist:
        print(json.dumps(response_checklist(), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
