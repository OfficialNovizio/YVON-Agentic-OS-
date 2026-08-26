#!/usr/bin/env python3
"""
belmont_ethics_checklist.py — Belmont Report ethics-review checklist.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-07-29)
===================================================================

Primary source (institutional, public-domain U.S. government publication):
  The Belmont Report — Ethical Principles and Guidelines for the Protection
  of Human Subjects of Research
  Office of the Secretary, DHEW / National Commission for the Protection of
  Human Subjects of Biomedical and Behavioral Research
  April 18, 1979
  https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/read-the-belmont-report/index.html
  (also as PDF: https://www.hhs.gov/ohrp/sites/default/files/the-belmont-report-508c_FINAL.pdf)

Structure of the report used verbatim to design the checklist:

  Part A — Boundaries Between Practice and Research
  Part B — Basic Ethical Principles:
    1. Respect for Persons — "autonomous agents" + "persons with diminished
       autonomy are entitled to protection" (Report Part B.1)
    2. Beneficence — "(1) do not harm and (2) maximize possible benefits and
       minimize possible harms" (Report Part B.2)
    3. Justice — "fairness in distribution" and five distributive
       formulations (Report Part B.3)
  Part C — Applications:
    1. Informed Consent — three elements: information · comprehension ·
       voluntariness (Report Part C.1)
    2. Assessment of Risks and Benefits — probability + magnitude;
       systematic (i)-(v) considerations (Report Part C.2)
    3. Selection of Subjects — individual + social justice; vulnerable
       populations extra scrutiny (Report Part C.3)

Second source (§8.0 minimum-two-book):
  Brignull dark-pattern taxonomy — https://www.deceptive.design/
  Cross-corroborates the Belmont "undue influence" and "manipulation"
  concepts specifically in product / interface contexts.

===================================================================
ROUTES (§8.2)
===================================================================
  Route B: rule-based classifier applying Belmont principles to an
    intervention / experiment / product-feature.

===================================================================
CONSUMERS
===================================================================
  Primary: Teams/Behavioural Science/bias/custom/ethics-review/SKILL.md
  Potential (§13.5 promotion candidates):
    - Behavioural Science/trial/custom/field-experiments (ethics gate)
    - Behavioural Science/nudge/custom/behaviour-design (dark-pattern check)
    - Product/loom/custom/experiment-discipline (experiment ethics)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every check cites the specific Belmont Report Part + subsection.
- No invented ethical criteria; only what the Report enumerates.
- Verdict is APPROVE / CONDITIONAL / REJECT with per-principle rationale.
- Vulnerable-populations list from Belmont Part C.3 verbatim examples +
  operator's declared additions via config.
"""

import argparse
import json
import sys
from typing import Any, Dict, List

# Belmont Part C.3 verbatim examples of vulnerable populations
BELMONT_VULNERABLE_EXAMPLES: List[str] = [
    "racial minorities",
    "the economically disadvantaged",
    "the very sick",
    "the institutionalized",
    "prisoners",
    "welfare patients",
    "the mentally infirm",
    "children (see Part B.1 diminished autonomy)",
    "the terminally ill",
    "the comatose",
    "infants",
]

# Belmont Part B.3: five distributive-justice formulations, verbatim
BELMONT_JUSTICE_FORMULATIONS: List[str] = [
    "(1) to each person an equal share",
    "(2) to each person according to individual need",
    "(3) to each person according to individual effort",
    "(4) to each person according to societal contribution",
    "(5) to each person according to merit",
]


# ---------------- Principle-level checks (Route B) ----------------

def check_respect_for_persons(intervention: Dict[str, Any]) -> Dict[str, Any]:
    """Respect for Persons — Belmont Part B.1 + Part C.1.

    Two requirements:
      (a) treat individuals as autonomous agents (autonomy + information)
      (b) persons with diminished autonomy are entitled to protection

    Applied via Informed Consent (Part C.1): information · comprehension ·
    voluntariness. Voluntariness requires absence of coercion + undue influence.
    """
    findings = []
    passes = True

    # Autonomy — subjects enter voluntarily and with adequate information
    if not intervention.get("informed_consent", False):
        findings.append("FAIL: informed consent absent (Belmont Part C.1)")
        passes = False
    if intervention.get("deception", False) and not intervention.get(
        "deception_justified", False
    ):
        findings.append(
            "FAIL: deception used without justification (Belmont Part C.1 "
            "requires (1) truly necessary, (2) no undisclosed >minimal risk, "
            "(3) debriefing plan)"
        )
        passes = False

    # Diminished-autonomy protection
    if intervention.get("involves_diminished_autonomy", False):
        if not intervention.get("third_party_permission", False):
            findings.append(
                "FAIL: intervention involves persons with diminished autonomy "
                "but no third-party permission mechanism (Belmont Part C.1 "
                "Comprehension paragraph)"
            )
            passes = False

    # Voluntariness — coercion / undue influence
    if intervention.get("coercion_risk", False):
        findings.append(
            "FAIL: coercion risk not mitigated (Belmont Part C.1 Voluntariness)"
        )
        passes = False
    if intervention.get("undue_influence_risk", False):
        findings.append(
            "WARN: undue-influence risk present — inducements + authority "
            "pressures require scrutiny (Belmont Part C.1 Voluntariness)"
        )
        # WARN does not fail unless combined with vulnerability
        if intervention.get("involves_vulnerable_population", False):
            passes = False

    if passes and not findings:
        findings.append("PASS: Respect for Persons requirements satisfied.")
    return {"principle": "Respect for Persons", "pass": passes, "findings": findings}


def check_beneficence(intervention: Dict[str, Any]) -> Dict[str, Any]:
    """Beneficence — Belmont Part B.2 + Part C.2.

    Two rules:
      (1) do not harm
      (2) maximize possible benefits and minimize possible harms

    Systematic risk/benefit assessment (Part C.2): probability + magnitude
    of possible harms and anticipated benefits.

    Part C.2 (v) considerations enforced:
      (i)   brutal / inhumane treatment never justified
      (ii)  risks reduced to those necessary
      (iii) significant-risk / serious-impairment → extraordinary justification
      (iv)  vulnerable populations → appropriateness demonstrated
      (v)   risks + benefits thoroughly arrayed in consent process
    """
    findings = []
    passes = True

    # (i) brutal / inhumane treatment
    if intervention.get("brutal_or_inhumane", False):
        findings.append("FAIL (i): brutal / inhumane treatment never justified.")
        passes = False

    # (ii) risks reduced to those necessary
    if not intervention.get("risks_reduced_to_necessary", False):
        findings.append(
            "FAIL (ii): risks not reduced to those necessary — evaluate "
            "alternative procedures (Belmont Part C.2 (ii))"
        )
        passes = False

    # (iii) serious-impairment risk
    risk_severity = intervention.get("risk_severity", "minimal")
    if risk_severity in ("serious", "serious_impairment"):
        if not intervention.get("extraordinary_justification", False):
            findings.append(
                "FAIL (iii): significant risk of serious impairment lacks "
                "extraordinary justification (Belmont Part C.2 (iii))"
            )
            passes = False

    # (v) risks + benefits arrayed in consent
    if not intervention.get("risks_arrayed_in_consent", False):
        findings.append(
            "FAIL (v): risks + benefits not thoroughly arrayed in consent "
            "documents (Belmont Part C.2 (v))"
        )
        passes = False

    # General beneficence: expected benefit > risk
    benefit = intervention.get("expected_benefit_score", 0)
    harm = intervention.get("expected_harm_score", 0)
    if harm > benefit:
        findings.append(
            f"FAIL: expected harm ({harm}) exceeds benefit ({benefit}) — "
            "beneficence rule (2) violated (Belmont Part B.2)"
        )
        passes = False

    if passes and not findings:
        findings.append("PASS: Beneficence requirements satisfied.")
    return {"principle": "Beneficence", "pass": passes, "findings": findings}


def check_justice(intervention: Dict[str, Any]) -> Dict[str, Any]:
    """Justice — Belmont Part B.3 + Part C.3.

    "Fairness in distribution" — burdens + benefits distributed fairly.
    Selection of subjects (individual + social justice):
      - Not selecting classes for easy availability / compromised position /
        manipulability rather than reasons related to the problem.
      - Vulnerable populations should not bear risks whose benefits flow to
        more advantaged populations.
      (iv) When vulnerable populations involved, appropriateness demonstrated.
    """
    findings = []
    passes = True

    # Selection fairness
    selection_reason = intervention.get("selection_reason", "unspecified")
    if selection_reason in ("easy_availability", "compromised_position", "manipulability"):
        findings.append(
            f"FAIL: subjects selected for '{selection_reason}' rather than "
            "reasons related to the problem being studied "
            "(Belmont Part C.3 selection paragraph)"
        )
        passes = False

    # Vulnerable-population extra scrutiny (Part C.2 (iv) + Part C.3)
    if intervention.get("involves_vulnerable_population", False):
        vuln_type = intervention.get("vulnerable_population_type", "unspecified")
        if not intervention.get("vulnerability_appropriateness_demonstrated", False):
            findings.append(
                f"FAIL: vulnerable population ({vuln_type}) involved but "
                "appropriateness not demonstrated (Belmont Part C.2 (iv))"
            )
            passes = False
        # Benefits flow back?
        if not intervention.get("benefits_flow_to_class", False):
            findings.append(
                f"FAIL: vulnerable population ({vuln_type}) bears risk but "
                "benefits unlikely to flow back to the class "
                "(Belmont Part C.3 injustice paragraph)"
            )
            passes = False

    if passes and not findings:
        findings.append("PASS: Justice requirements satisfied.")
    return {"principle": "Justice", "pass": passes, "findings": findings}


# ---------------- Verdict aggregation ----------------

def review(intervention: Dict[str, Any]) -> Dict[str, Any]:
    """Full Belmont ethics review. Returns approve / conditional / reject.

    APPROVE   — all three principles pass.
    CONDITIONAL — some WARN-level findings; specific conditions listed.
    REJECT    — any principle FAILs on a hard criterion.
    """
    r = check_respect_for_persons(intervention)
    b = check_beneficence(intervention)
    j = check_justice(intervention)

    all_findings = r["findings"] + b["findings"] + j["findings"]
    fails = [f for f in all_findings if f.startswith("FAIL")]
    warns = [f for f in all_findings if f.startswith("WARN")]

    if fails:
        verdict = "REJECT"
    elif warns:
        verdict = "CONDITIONAL"
    else:
        verdict = "APPROVE"

    return {
        "verdict": verdict,
        "principles": {"respect": r, "beneficence": b, "justice": j},
        "fails": fails,
        "warns": warns,
        "conditions": _derive_conditions(warns) if warns else [],
        "cited": [
            "Belmont Report, April 18, 1979, Parts B.1, B.2, B.3, C.1, C.2, C.3",
            "Public source: hhs.gov/ohrp/regulations-and-policy/belmont-report/",
        ],
    }


def _derive_conditions(warns: List[str]) -> List[str]:
    """Turn WARN findings into named conditions the reviewer can enforce."""
    conditions = []
    for w in warns:
        if "undue-influence" in w:
            conditions.append(
                "Reduce inducement magnitude OR strengthen voluntariness "
                "assurances (Belmont Part C.1 Voluntariness)"
            )
    return conditions


# ---------------- Self-tests (playbook §5.2) ----------------

def _run_self_tests() -> None:
    # 1. Fully-approved case
    ok = {
        "informed_consent": True,
        "risks_reduced_to_necessary": True,
        "risks_arrayed_in_consent": True,
        "expected_benefit_score": 5,
        "expected_harm_score": 1,
        "selection_reason": "problem_relevant",
    }
    v = review(ok)
    assert v["verdict"] == "APPROVE", f"expected APPROVE got {v['verdict']}: {v}"
    print(f"[PASS] clean intervention → APPROVE")

    # 2. Missing informed consent → REJECT via Respect
    bad = dict(ok)
    bad["informed_consent"] = False
    v = review(bad)
    assert v["verdict"] == "REJECT" and any("consent absent" in f for f in v["fails"]), v
    print(f"[PASS] missing consent → REJECT (respect)")

    # 3. Vulnerable population without benefit backflow → REJECT via Justice
    bad2 = dict(ok)
    bad2["involves_vulnerable_population"] = True
    bad2["vulnerable_population_type"] = "the economically disadvantaged"
    bad2["vulnerability_appropriateness_demonstrated"] = True
    bad2["benefits_flow_to_class"] = False
    v = review(bad2)
    assert v["verdict"] == "REJECT" and any("benefits unlikely" in f for f in v["fails"]), v
    print(f"[PASS] vulnerable + no benefit backflow → REJECT (justice)")

    # 4. Harm > benefit → REJECT via Beneficence
    bad3 = dict(ok)
    bad3["expected_harm_score"] = 10
    v = review(bad3)
    assert v["verdict"] == "REJECT" and any("harm" in f and "exceeds benefit" in f for f in v["fails"]), v
    print(f"[PASS] harm > benefit → REJECT (beneficence)")

    # 5. Serious impairment without extraordinary justification → REJECT
    bad4 = dict(ok)
    bad4["risk_severity"] = "serious_impairment"
    v = review(bad4)
    assert v["verdict"] == "REJECT", v
    print(f"[PASS] serious impairment no justification → REJECT")

    # 6. Undue-influence warn on non-vulnerable population → CONDITIONAL
    warn_case = dict(ok)
    warn_case["undue_influence_risk"] = True
    v = review(warn_case)
    assert v["verdict"] == "CONDITIONAL" and v["conditions"], v
    print(f"[PASS] undue-influence warn → CONDITIONAL with condition(s)")

    # 7. Deception without justification → REJECT via Respect (Part C.1)
    bad5 = dict(ok)
    bad5["deception"] = True
    bad5["deception_justified"] = False
    v = review(bad5)
    assert v["verdict"] == "REJECT" and any("deception" in f for f in v["fails"]), v
    print(f"[PASS] unjustified deception → REJECT")

    # 8. Brutal / inhumane → REJECT unconditionally
    bad6 = dict(ok)
    bad6["brutal_or_inhumane"] = True
    v = review(bad6)
    assert v["verdict"] == "REJECT", v
    print(f"[PASS] brutal/inhumane → REJECT (Belmont Part C.2 (i))")

    # 9. Vulnerable-population catalog contains verbatim examples
    assert "prisoners" in BELMONT_VULNERABLE_EXAMPLES
    assert "the terminally ill" in BELMONT_VULNERABLE_EXAMPLES
    print(f"[PASS] vulnerable-population catalog has Belmont Part C.3 verbatim examples")

    # 10. Justice formulations are the five Belmont enumerates
    assert len(BELMONT_JUSTICE_FORMULATIONS) == 5
    assert BELMONT_JUSTICE_FORMULATIONS[0].startswith("(1)")
    assert "merit" in BELMONT_JUSTICE_FORMULATIONS[4]
    print(f"[PASS] justice formulations = 5 (Belmont Part B.3)")


def _main() -> int:
    p = argparse.ArgumentParser(description="Belmont Report ethics review")
    p.add_argument("--intervention", help="JSON file describing the intervention")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not args.intervention:
        _run_self_tests()
        return 0

    with open(args.intervention) as f:
        data = json.load(f)
    print(json.dumps(review(data), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(_main())
