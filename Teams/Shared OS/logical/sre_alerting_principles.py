#!/usr/bin/env python3
"""
sre_alerting_principles.py — Google SRE alert-quality classifier.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-07-29)
===================================================================

Primary source (institutional, free — CC BY-NC-ND 4.0):
  Google, "Site Reliability Engineering" — Chapter 6, Monitoring
  Distributed Systems, by Rob Ewaschuk (ed. Betsy Beyer)
  https://sre.google/sre-book/monitoring-distributed-systems/

  Extracted verbatim:
    - Four Golden Signals: latency · traffic · errors · saturation
    - Symptoms vs Causes distinction ("what's broken" vs "why")
    - Black-box vs White-box distinction
    - Five-question alert quality test (Ch. 6, "Tying These Principles
      Together"):
        1. Detect otherwise undetected, urgent, actionable,
           user-visible condition?
        2. When/why can this alert be safely ignored?
        3. Definitely indicates users negatively affected?
        4. Can I take action? Urgent or could wait until morning?
           Could action be automated?
        5. Are other people already paged for this?
    - "Every page should be actionable" · "novel problem" ·
      "requires intelligence" (rote responses → automate not page)
    - Symptom-oriented over cause-oriented paging

Second source (§8.0 minimum-two-book):
  Google, "The Site Reliability Workbook" — Chapter 5, Alerting on SLOs
  https://sre.google/workbook/alerting-on-slos/
  (Same free source-family, CC BY-NC-ND 4.0.)
  Cross-corroborates the golden-signals frame and adds SLO-based
  alert-window methodology.

===================================================================
ROUTES (§8.2)
===================================================================
  Route B: rule-based classifier that scores a proposed alert
    against the 5 SRE questions + golden-signals coverage +
    symptom-vs-cause verdict.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Data & Analytics/anomaly/custom/anomaly-detection-rules
    - Data & Analytics/anomaly/custom/alert-routing
    - Cybersecurity/cortex (security-incident triage)
    - Cybersecurity/warden (risk-register)
    - Ops & Delivery/handoff (escalation protocol)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every principle cites the SRE Book Chapter 6 section.
- No invented alert criteria.
- Verdict is APPROVE / TUNE / REJECT with per-question rationale.
"""

import argparse
import json
import sys
from typing import Any, Dict, List


# Google SRE Book Chapter 6 — Four Golden Signals
GOLDEN_SIGNALS: List[str] = ["latency", "traffic", "errors", "saturation"]

# Chapter 6 — The 5 alert-quality questions (verbatim)
FIVE_QUESTIONS: List[str] = [
    "Does this rule detect an otherwise undetected condition that is "
    "urgent, actionable, and actively or imminently user-visible?",
    "Will I ever be able to ignore this alert, knowing it's benign? "
    "When and why will I be able to ignore this alert, and how can I "
    "avoid this scenario?",
    "Does this alert definitely indicate that users are being "
    "negatively affected? Are there detectable cases in which users "
    "aren't being negatively impacted, such as drained traffic or "
    "test deployments, that should be filtered out?",
    "Can I take action in response to this alert? Is that action "
    "urgent, or could it wait until morning? Could the action be "
    "safely automated? Will that action be a long-term fix, or just "
    "a short-term workaround?",
    "Are other people getting paged for this issue, therefore "
    "rendering at least one of the pages unnecessary?",
]

# Chapter 6 — page discipline (verbatim)
PAGE_PHILOSOPHY: List[str] = [
    "Every time the pager goes off, I should be able to react with a "
    "sense of urgency. I can only react with a sense of urgency a few "
    "times a day before I become fatigued.",
    "Every page should be actionable.",
    "Every page response should require intelligence. If a page merely "
    "merits a robotic response, it shouldn't be a page.",
    "Pages should be about a novel problem or an event that hasn't "
    "been seen before.",
]


# ---------------- Alert-rule classifier (Route B) ----------------

def score_alert_rule(rule: Dict[str, Any]) -> Dict[str, Any]:
    """Score a proposed alert rule against SRE Ch.6 principles.

    Expected rule fields (any missing → treated as "not answered"):
      detects_undetected: bool     — Q1a
      urgent: bool                 — Q1b
      actionable: bool             — Q1c
      user_visible: bool           — Q1d
      ignorable_conditions_documented: bool  — Q2
      false_positive_filters: bool  — Q3
      action_named: str            — Q4a
      action_can_wait_until_morning: bool  — Q4b
      action_automatable: bool     — Q4c (if yes → automate, don't page)
      duplicate_of_other_page: bool  — Q5
      signal_type: str             — one of GOLDEN_SIGNALS or "other"
      orientation: str             — "symptom" or "cause" (Ch.6 rec: symptom)
      response_is_rote: bool       — page philosophy #3
      is_novel: bool               — page philosophy #4

    Returns:
      {verdict, per_question, warnings, cite}
    """
    warnings: List[str] = []
    per_q = []

    # Q1: undetected + urgent + actionable + user_visible
    q1_pass = all(rule.get(k, False) for k in ("detects_undetected", "urgent", "actionable", "user_visible"))
    per_q.append({"question": "Q1", "pass": q1_pass})
    if not q1_pass:
        warnings.append(
            "Q1 FAIL: alert must detect otherwise-undetected + urgent + "
            "actionable + user-visible condition (SRE Ch.6)"
        )

    # Q2: ignorable conditions documented
    q2_pass = rule.get("ignorable_conditions_documented", False)
    per_q.append({"question": "Q2", "pass": q2_pass})
    if not q2_pass:
        warnings.append(
            "Q2 WARN: document when this alert can be ignored (SRE Ch.6)"
        )

    # Q3: false-positive filters
    q3_pass = rule.get("false_positive_filters", False)
    per_q.append({"question": "Q3", "pass": q3_pass})
    if not q3_pass:
        warnings.append(
            "Q3 WARN: filter drained-traffic + test-deployment false positives (SRE Ch.6)"
        )

    # Q4a: action named
    q4a_pass = bool(rule.get("action_named", "").strip())
    per_q.append({"question": "Q4a", "pass": q4a_pass})
    if not q4a_pass:
        warnings.append("Q4a FAIL: no named action for this alert (SRE Ch.6)")

    # Q4c: if automatable → don't page (page philosophy #3)
    if rule.get("action_automatable", False):
        warnings.append(
            "Q4c FAIL: action is automatable — should be automated, not paged "
            "(SRE Ch.6 page philosophy: rote response ≠ page)"
        )

    # Q5: duplicate page
    if rule.get("duplicate_of_other_page", False):
        warnings.append(
            "Q5 FAIL: another page already fires for this issue — remove "
            "one of them (SRE Ch.6)"
        )

    # Symptom vs cause
    orient = rule.get("orientation")
    if orient == "cause":
        warnings.append(
            "Orientation WARN: pager should be symptom-oriented (SRE Ch.6). "
            "Cause-oriented rules belong in debugging dashboards, not pages."
        )
    elif orient != "symptom":
        warnings.append(
            "Orientation NOT SET: declare 'symptom' or 'cause' (SRE Ch.6)"
        )

    # Novel / rote
    if rule.get("response_is_rote", False):
        warnings.append(
            "Novelty FAIL: rote response ≠ page — automate the response instead "
            "(SRE Ch.6 page philosophy #3)"
        )

    # Golden-signal coverage (informational)
    sig = rule.get("signal_type")
    if sig in GOLDEN_SIGNALS:
        per_q.append({"golden_signal": sig, "covered": True})
    else:
        warnings.append(
            f"Signal type {sig!r} is not one of the four golden signals "
            f"(latency/traffic/errors/saturation) — SRE Ch.6 recommends "
            f"focusing user-facing pages on the golden signals."
        )

    # Compute verdict
    fails = [w for w in warnings if "FAIL" in w]
    if fails:
        verdict = "REJECT"
    elif warnings:
        verdict = "TUNE"
    else:
        verdict = "APPROVE"

    return {
        "verdict": verdict,
        "per_question": per_q,
        "warnings": warnings,
        "cite": "Google SRE Book Ch. 6 (Monitoring Distributed Systems)",
    }


# ---------------- Golden-signals coverage audit ----------------

def audit_golden_signal_coverage(rules: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Given a set of active alert rules, report which golden signals are
    covered vs missing per service."""
    coverage = {sig: 0 for sig in GOLDEN_SIGNALS}
    other = 0
    for r in rules:
        sig = r.get("signal_type")
        if sig in coverage:
            coverage[sig] += 1
        else:
            other += 1
    missing = [sig for sig, count in coverage.items() if count == 0]
    return {
        "coverage": coverage,
        "other_or_unspecified": other,
        "missing_golden_signals": missing,
        "cite": "Google SRE Book Ch. 6 (Four Golden Signals)",
    }


# ---------------- Self-tests (playbook §5.2) ----------------

def _run_self_tests() -> None:
    # 1. Clean alert rule → APPROVE
    good = {
        "detects_undetected": True,
        "urgent": True,
        "actionable": True,
        "user_visible": True,
        "ignorable_conditions_documented": True,
        "false_positive_filters": True,
        "action_named": "page on-call · check upstream DB",
        "action_can_wait_until_morning": False,
        "action_automatable": False,
        "duplicate_of_other_page": False,
        "signal_type": "latency",
        "orientation": "symptom",
        "response_is_rote": False,
        "is_novel": True,
    }
    r = score_alert_rule(good)
    assert r["verdict"] == "APPROVE", f"expected APPROVE, got {r['verdict']}: {r['warnings']}"
    print(f"[PASS] clean rule → APPROVE")

    # 2. Missing action_named → REJECT via Q4a FAIL
    bad = dict(good)
    bad["action_named"] = ""
    r = score_alert_rule(bad)
    assert r["verdict"] == "REJECT", r
    assert any("Q4a" in w for w in r["warnings"])
    print(f"[PASS] no named action → REJECT (Q4a)")

    # 3. Automatable → REJECT (page philosophy #3)
    bad2 = dict(good)
    bad2["action_automatable"] = True
    r = score_alert_rule(bad2)
    assert r["verdict"] == "REJECT", r
    assert any("automatable" in w for w in r["warnings"])
    print(f"[PASS] automatable action → REJECT (should automate not page)")

    # 4. Rote response → REJECT (page philosophy #3)
    bad3 = dict(good)
    bad3["response_is_rote"] = True
    r = score_alert_rule(bad3)
    assert r["verdict"] == "REJECT", r
    print(f"[PASS] rote response → REJECT (novelty rule)")

    # 5. Cause-oriented → TUNE not REJECT (WARN, not FAIL)
    warn_case = dict(good)
    warn_case["orientation"] = "cause"
    r = score_alert_rule(warn_case)
    assert r["verdict"] == "TUNE", r
    print(f"[PASS] cause-oriented → TUNE (should be symptom, but not fatal)")

    # 6. Golden signals is exactly the 4 named
    assert GOLDEN_SIGNALS == ["latency", "traffic", "errors", "saturation"]
    print(f"[PASS] four golden signals = {GOLDEN_SIGNALS}")

    # 7. Coverage audit surfaces missing signals
    rules = [
        {"signal_type": "latency"},
        {"signal_type": "errors"},
        {"signal_type": "errors"},
    ]
    a = audit_golden_signal_coverage(rules)
    assert "traffic" in a["missing_golden_signals"]
    assert "saturation" in a["missing_golden_signals"]
    assert a["coverage"]["latency"] == 1
    assert a["coverage"]["errors"] == 2
    print(f"[PASS] coverage audit surfaces missing signals: {a['missing_golden_signals']}")

    # 8. Five questions verbatim length
    assert len(FIVE_QUESTIONS) == 5
    assert "otherwise undetected" in FIVE_QUESTIONS[0]
    assert "getting paged" in FIVE_QUESTIONS[4] or "unnecessary" in FIVE_QUESTIONS[4]
    print(f"[PASS] 5 SRE questions verbatim")

    # 9. Page philosophy verbatim
    assert len(PAGE_PHILOSOPHY) == 4
    assert "actionable" in PAGE_PHILOSOPHY[1]
    assert "novel" in PAGE_PHILOSOPHY[3]
    print(f"[PASS] 4 page-philosophy statements verbatim")

    # 10. Duplicate page → REJECT
    dup = dict(good)
    dup["duplicate_of_other_page"] = True
    r = score_alert_rule(dup)
    assert r["verdict"] == "REJECT", r
    print(f"[PASS] duplicate-page → REJECT (Q5)")


def _main() -> int:
    p = argparse.ArgumentParser(description="SRE alert-rule classifier")
    p.add_argument("--rule", help="JSON file with rule definition")
    p.add_argument("--coverage", help="JSON file with rule list for coverage audit")
    p.add_argument("--questions", action="store_true", help="print the 5 SRE questions")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.rule, args.coverage, args.questions]):
        _run_self_tests()
        return 0

    if args.questions:
        print("Google SRE Book Ch. 6 — 5 alert-quality questions:")
        for i, q in enumerate(FIVE_QUESTIONS, 1):
            print(f"\n  Q{i}. {q}")
        print("\nPage philosophy:")
        for line in PAGE_PHILOSOPHY:
            print(f"  · {line}")
        return 0

    if args.rule:
        rule = json.load(open(args.rule))
        print(json.dumps(score_alert_rule(rule), indent=2))
    elif args.coverage:
        rules = json.load(open(args.coverage))
        print(json.dumps(audit_golden_signal_coverage(rules), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(_main())
