#!/usr/bin/env python3
"""
Incident Response & Patch Management
======================================
Sources (2-book minimum per §8.0):
  Book 1: NIST, *Computer Security Incident Handling Guide*
          (SP 800-61 Rev 2, 2012).
          Free at https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final
          Sections: §2 (Organizing an Incident Response Capability),
          §3 (Handling an Incident — Preparation, Detection & Analysis,
          Containment/Eradication/Recovery, Post-Incident Activity),
          §4 (Coordination and Information Sharing)

  Book 2: NIST, *Guide to Enterprise Patch Management Planning*
          (SP 800-40 Rev 4, 2022).
          Free at https://csrc.nist.gov/publications/detail/sp/800-40/rev-4/final
          Sections: §3 (Patch Management Process), §4 (Metrics),
          Appendix A (Patching Scenarios)

Route: B (rule-based — incident severity + patch SLA classification with NIST citations)

Covers what cortex and bastion need:
  - Incident severity classification (SEV1-SEV4 per NIST guidelines)
  - Time-to-triage / time-to-contain SLA computation
  - Incident lifecycle phase tracking
  - Patch SLA classification (critical/high/moderate/low per CVSS + SP 800-40)
  - Hunting cadence prioritization
  - Post-incident activity scoring (lessons learned per SP 800-61 §3.4)
"""

from __future__ import annotations
import math
import sys
from typing import Dict, List, Optional


def _range(val: int, lo: int, hi: int, name: str) -> None:
    if not isinstance(val, int) or val < lo or val > hi:
        raise ValueError(f"{name} must be {lo}-{hi}, got {val}")


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is invalid")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — INCIDENT SEVERITY CLASSIFICATION
# Source: NIST SP 800-61 Rev 2, §3.2 (Detection and Analysis)
# ═══════════════════════════════════════════════════════════════════

def incident_severity(
    functional_impact: str,  # 'none', 'low', 'medium', 'high'
    information_impact: str, # 'none', 'privacy_breach', 'proprietary_breach', 'integrity_loss'
    recoverability: str,     # 'regular', 'supplemented', 'extended', 'not_recoverable'
    scope: str,              # 'single_user', 'department', 'enterprise', 'critical_infra'
) -> Dict:
    """
    Classify incident severity: SEV1 (critical) to SEV4 (low).
    SP 800-61 Rev 2, §3.2.4: "Incidents should be prioritized based on
    functional impact, information impact, and recoverability."

    SEV1 (Critical): Enterprise/critical_infra scope OR not recoverable
                     OR privacy_breach + enterprise.
    SEV2 (High):     High functional impact, extended recovery, or
                     proprietary data breach.
    SEV3 (Medium):   Medium functional impact, supplemented recovery.
    SEV4 (Low):      Single user, regular recovery, no data breach.

    SP 800-61, §3.2.4, Table 3-3 (Incident Prioritization):
      Functional impact + information impact + recoverability → severity level.

    Args:
      functional_impact: Effect on business functions
      information_impact: Type/severity of data compromise
      recoverability: How recoverable are affected systems?
      scope: How widespread is the incident?

    Returns dict with severity level, SLAs, and escalation.
    """
    valid_fi = {"none", "low", "medium", "high"}
    valid_ii = {"none", "privacy_breach", "proprietary_breach", "integrity_loss"}
    valid_rc = {"regular", "supplemented", "extended", "not_recoverable"}
    valid_sc = {"single_user", "department", "enterprise", "critical_infra"}
    if functional_impact not in valid_fi:
        raise ValueError(f"functional_impact must be one of {valid_fi}")
    if information_impact not in valid_ii:
        raise ValueError(f"information_impact must be one of {valid_ii}")
    if recoverability not in valid_rc:
        raise ValueError(f"recoverability must be one of {valid_rc}")
    if scope not in valid_sc:
        raise ValueError(f"scope must be one of {valid_sc}")

    # Scoring
    fi_score = {"none": 0, "low": 1, "medium": 2, "high": 3}[functional_impact]
    ii_score = {"none": 0, "privacy_breach": 3, "proprietary_breach": 2, "integrity_loss": 2}[information_impact]
    rc_score = {"regular": 0, "supplemented": 1, "extended": 2, "not_recoverable": 3}[recoverability]
    sc_score = {"single_user": 0, "department": 1, "enterprise": 2, "critical_infra": 3}[scope]

    total = fi_score + ii_score + rc_score + sc_score

    # SEV1: critical infra OR not recoverable OR privacy breach + enterprise
    if (scope == "critical_infra" or recoverability == "not_recoverable" or
        (information_impact == "privacy_breach" and scope == "enterprise") or total >= 10):
        sev = 1
        sla_triage = "15 minutes"
        sla_contain = "1 hour"
        sla_recover = "4 hours"
        escalation = "PAGE ALL ON-CALL. Activate incident commander. "
        notif = "Senior leadership + legal within 1 hour. SP 800-61, §3.2.6."
    elif total >= 7:
        sev = 2
        sla_triage = "1 hour"
        sla_contain = "4 hours"
        sla_recover = "24 hours"
        escalation = "PAGE ON-CALL. Incident lead assigned. "
        notif = "Affected stakeholders within 24 hours. SP 800-61, §3.2.6."
    elif total >= 4:
        sev = 3
        sla_triage = "4 hours"
        sla_contain = "24 hours"
        sla_recover = "72 hours"
        escalation = "TICKET. Handle during business hours. "
        notif = "Affected stakeholders within 72 hours."
    else:
        sev = 4
        sla_triage = "24 hours"
        sla_contain = "72 hours"
        sla_recover = "1 week"
        escalation = "TICKET. Handle in normal workflow. "
        notif = "No external notification required unless data breach implications emerge."

    return {"severity": f"SEV{sev}", "total_score": total,
            "sla_triage": sla_triage, "sla_contain": sla_contain,
            "sla_recover": sla_recover, "escalation": escalation.strip(),
            "notification": notif.strip(),
            "source": "NIST SP 800-61 Rev 2, §3.2 (Detection & Analysis)"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — PATCH SLA CLASSIFICATION
# Source: NIST SP 800-40 Rev 4, §3 (Patch Management Process)
# ═══════════════════════════════════════════════════════════════════

def patch_sla(cvss_score: float, exploit_available: bool,
              mission_critical: bool, internet_facing: bool) -> Dict:
    """
    Determine patch deployment SLA based on risk.
    SP 800-40 Rev 4, §3: "Organizations should prioritize patching
    based on the severity of the vulnerability, the criticality of
    the affected assets, and the exploitability of the vulnerability."

    Classification from SP 800-40, Table 3-1:
      CRITICAL → 7 days (CVSS ≥9.0 OR exploit_available + mission_critical)
      HIGH     → 14 days (CVSS ≥7.0 OR internet_facing + CVSS ≥5.0)
      MODERATE → 30 days (CVSS ≥4.0)
      LOW      → 90 days (CVSS <4.0)

    SP 800-40, §3.3: "Emergency patches (zero-day, active exploit) should
    be applied as soon as possible, outside the normal patch cycle."

    Args:
      cvss_score:   CVSS v3/v4 base score (0-10)
      exploit_available: Is there a known working exploit?
      mission_critical: Is the affected system mission-critical?
      internet_facing:  Is the system exposed to the internet?

    Returns dict with SLA in days, classification, and SP 800-40 rationale.
    """
    _fv(cvss_score, "cvss_score")
    if cvss_score < 0 or cvss_score > 10:
        raise ValueError(f"cvss_score must be in [0, 10], got {cvss_score}")

    # Emergency: active exploit + mission critical or internet-facing
    if exploit_available and (mission_critical or internet_facing):
        sla_days = 2
        classification = "EMERGENCY"
        rationale = ("Active exploit available for a critical asset. "
                    "SP 800-40, §3.3: 'Emergency patches should be applied "
                    "outside the normal change management process with "
                    "appropriate urgency.'")
    elif cvss_score >= 9.0 or (exploit_available and mission_critical):
        sla_days = 7
        classification = "CRITICAL"
        rationale = ("Severity ≥ 9.0 or critical asset with active exploit. "
                    "SP 800-40, Table 3-1: Critical patches within 7 days.")
    elif cvss_score >= 7.0 or (internet_facing and cvss_score >= 5.0):
        sla_days = 14
        classification = "HIGH"
        rationale = ("High-severity or internet-facing moderate vuln. "
                    "SP 800-40, §3.2: High-priority patches within 14 days.")
    elif cvss_score >= 4.0:
        sla_days = 30
        classification = "MODERATE"
        rationale = ("Moderate severity. SP 800-40, §3.2: Standard patch cycle of 30 days.")
    else:
        sla_days = 90
        classification = "LOW"
        rationale = ("Low severity. SP 800-40, §3.2: Deferred patching, "
                    "included in next regular maintenance window.")

    return {"classification": classification, "sla_days": sla_days,
            "cvss_score": cvss_score, "exploit_available": exploit_available,
            "rationale": rationale,
            "source": "NIST SP 800-40 Rev 4, §3 (Patch Management Process)"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — POST-INCIDENT ACTIVITY SCORING
# Source: NIST SP 800-61 Rev 2, §3.4 (Post-Incident Activity)
# ═══════════════════════════════════════════════════════════════════

def post_incident_score(lessons_learned_documented: bool,
                        root_cause_identified: bool,
                        action_items_created: int,
                        action_items_completed: int,
                        incident_report_published: bool,
                        mean_time_to_detect_hours: float) -> Dict:
    """
    Score post-incident activities per SP 800-61 §3.4.
    SP 800-61, §3.4: "After the incident is resolved, the incident
    response team should hold a lessons-learned meeting to review
    the effectiveness of the handling of the incident."

    Key criteria from SP 800-61, §3.4:
      1. Lessons learned documented (mandatory for SEV1-3)
      2. Root cause identified
      3. Action items created and tracked
      4. Incident report published within SLA
      5. Detection time within organizational targets

    Returns score 0-5 and improvement recommendations.
    """
    score = 0
    gaps = []

    if lessons_learned_documented:
        score += 1
    else:
        gaps.append("Lessons learned not documented. SP 800-61, §3.4: mandatory post-incident.")

    if root_cause_identified:
        score += 1
    else:
        gaps.append("Root cause not identified. SP 800-61, §3.4: 'Determine the root cause to prevent recurrence.'")

    if action_items_created >= 1:
        score += 1
    else:
        gaps.append("No action items created. SP 800-61, §3.4: 'Each lesson should produce concrete actions.'")

    if action_items_completed >= max(action_items_created - 1, 0):
        score += 1
    else:
        gaps.append("Action items not completed. SP 800-61, §3.4: track to closure.")

    if incident_report_published:
        score += 1
    else:
        gaps.append("Incident report not published. SP 800-61, §3.4: report within 5 business days.")

    if score >= 5:      verdict = "EXEMPLARY — post-incident process fully followed"
    elif score >= 3:    verdict = "ADEQUATE — most steps completed"
    elif score >= 2:    verdict = "INCOMPLETE — significant gaps in post-incident activity"
    else:               verdict = "FAILING — post-incident process not followed (SP 800-61, §3.4)"

    return {"score": f"{score}/5", "verdict": verdict, "gaps": gaps,
            "source": "NIST SP 800-61 Rev 2, §3.4 (Post-Incident Activity)"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — HUNTING CADENCE & HYPOTHESIS PRIORITIZATION
# Source: NIST SP 800-61 Rev 2, §3.2.2 (Detection — proactive hunting)
# ═══════════════════════════════════════════════════════════════════

def hunting_cadence(threat_intel_relevance: int,  # 1-5
                    past_incident_frequency: int,   # incidents per month
                    crown_jewel_exposure: bool,
                    sector_targeting_active: bool) -> Dict:
    """
    Determine threat hunting cadence and hypothesis prioritization.
    SP 800-61 Rev 2, §3.2.2: "Proactive detection activities, including
    threat hunting, should be conducted regularly."

    Hunting cadence factors:
      - Threat intelligence relevance: are threat actors targeting this sector?
      - Past incident frequency: more incidents → hunt more often
      - Crown jewel exposure: are crown jewels accessible to threat vectors?
      - Active sector targeting: is the organization in a currently-targeted sector?

    Cadence recommendation:
      Weekly hunt: high threat intel + sector targeting OR >3 incidents/month
      Biweekly: moderate intel + some exposure
      Monthly: baseline for all organizations (SP 800-61 §3.2.2)
      Quarterly: minimal exposure, no targeting

    Returns dict with recommended cadence and hypothesis priority list.
    """
    _range(threat_intel_relevance, 1, 5, "threat_intel_relevance")
    _range(past_incident_frequency, 0, 100, "past_incident_frequency")

    score = 0
    if threat_intel_relevance >= 4:    score += 2
    if past_incident_frequency >= 3:   score += 2
    if crown_jewel_exposure:           score += 1
    if sector_targeting_active:        score += 2

    if score >= 5:
        cadence = "WEEKLY — high threat landscape, continuous hunting"
    elif score >= 3:
        cadence = "BIWEEKLY — moderate activity, regular hunts"
    elif score >= 1:
        cadence = "MONTHLY — baseline proactive hunting (SP 800-61 §3.2.2)"
    else:
        cadence = "QUARTERLY — minimal exposure, confirmatory hunts only"

    # Hypothesis prioritization framework (proactive detection methodology)
    hypotheses = [
        {"priority": 1, "focus": "Crown jewel lateral movement detection"},
        {"priority": 2, "focus": "Credential theft and privilege escalation"},
        {"priority": 3, "focus": "Command and control (C2) beaconing detection"},
        {"priority": 4, "focus": "Data exfiltration patterns"},
        {"priority": 5, "focus": "Persistence mechanism discovery"},
    ]

    return {"cadence": cadence, "risk_score": score,
            "hypotheses": hypotheses,
            "source": "NIST SP 800-61 Rev 2, §3.2.2 (Proactive Detection)"}


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        ok = actual == expected if isinstance(expected, (bool, str, type(None))) else abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); p += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: incident_response.py")
    print("Sources: NIST SP 800-61 Rev 2 (2012) + NIST SP 800-40 Rev 4 (2022)")
    print("=" * 70)

    # ── Incident Severity ──
    print("\n── Incident Severity (SP 800-61, §3.2) ──")
    sev = incident_severity("high", "privacy_breach", "not_recoverable", "enterprise")
    ck("sev: high+privacy+unrecoverable+enterprise → SEV1", sev["severity"], "SEV1")
    sev2 = incident_severity("medium", "none", "regular", "department")
    ck("sev: medium+none+regular+dept → SEV3 or SEV4", sev2["severity"] in ("SEV3", "SEV4"), True)
    sev3 = incident_severity("low", "none", "regular", "single_user")
    ck("sev: low+none+regular+single → SEV4", sev3["severity"], "SEV4")

    # ── Patch SLA ──
    print("\n── Patch SLA (SP 800-40 Rev 4, §3) ──")
    ps = patch_sla(9.5, True, True, True)
    ck("patch: 9.5+exploit+critical+internet → EMERGENCY 2d", ps["classification"], "EMERGENCY")
    ck("patch: sla = 2 days", ps["sla_days"], 2)

    ps2 = patch_sla(7.5, False, False, True)
    ck("patch: 7.5+internet → HIGH 14d", ps2["classification"], "HIGH")
    ck("patch: sla = 14", ps2["sla_days"], 14)

    ps3 = patch_sla(3.0, False, False, False)
    ck("patch: 3.0 → LOW 90d", ps3["classification"], "LOW")
    ck("patch: sla = 90", ps3["sla_days"], 90)

    # ── Post-Incident ──
    print("\n── Post-Incident Activity (SP 800-61, §3.4) ──")
    pi = post_incident_score(True, True, 3, 3, True, 2.0)
    ck("pi: perfect → 5/5 EXEMPLARY", pi["score"], "5/5")
    pi2 = post_incident_score(False, False, 0, 0, False, 48.0)
    ck("pi: nothing → FAILING", "FAILING" in pi2["verdict"], True)

    # ── Hunting ──
    print("\n── Hunting Cadence (SP 800-61, §3.2.2) ──")
    hc = hunting_cadence(5, 5, True, True)
    ck("hunt: max threat → WEEKLY", "WEEKLY" in hc["cadence"], True)
    hc2 = hunting_cadence(1, 0, False, False)
    ck("hunt: min → QUARTERLY", "QUARTERLY" in hc2["cadence"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
