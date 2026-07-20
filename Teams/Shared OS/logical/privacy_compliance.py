#!/usr/bin/env python3
"""
Privacy & Data Protection Compliance
======================================
Sources (2-book minimum per §8.0):
  Book 1: NIST, *Privacy Framework: A Tool for Improving Privacy
          Through Enterprise Risk Management* Version 1.0 (2020).
          Free at https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.01162020.pdf
          Sections: Core (Identify-P, Govern-P, Control-P, Communicate-P,
          Protect-P), Profiles, Implementation Tiers

  Book 2: Regulation (EU) 2016/679 — *General Data Protection Regulation*
          Full legal text. Free at https://eur-lex.europa.eu/eli/reg/2016/679/oj
          Articles: 5 (Principles), 6 (Lawfulness of Processing),
          12-23 (Data Subject Rights), 24-43 (Controller/Processor
          Obligations), 33-34 (Breach Notification), 77-84 (Remedies)

Route: B (rule-based — data classification, breach notification, DPIA triggers)

Covers what veil needs:
  - Data classification decision tree (Public/Internal/Confidential/Restricted)
  - GDPR breach notification clock (72-hour rule per Art. 33)
  - DPIA (Data Protection Impact Assessment) trigger assessment
  - DLP severity classification per data sensitivity
  - Cross-jurisdictional notification requirement comparison
"""

from __future__ import annotations
import math
import sys
from typing import Dict, List, Optional


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)): raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val): raise ValueError(f"{name} is invalid")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — DATA CLASSIFICATION
# Source: NIST Privacy Framework, Core — Identify-P (Data Processing)
#         GDPR Art. 5 (Principles Relating to Processing of Personal Data)
# ═══════════════════════════════════════════════════════════════════

def classify_data(
    contains_pii: bool,
    contains_phi: bool,
    contains_financial: bool,
    contains_ip: bool,
    regulatory_scope: str,   # 'none', 'gdpr', 'ccpa', 'hipaa', 'multiple'
    public_by_design: bool = False,
) -> Dict:
    """
    Classify data per NIST Privacy Framework Identify-P + GDPR Art. 5.
    NIST Privacy Framework, Core: "Identify the data processing ecosystem
    — understand what data is processed, by whom, and for what purpose."

    GDPR Art. 5(1)(c): "Data shall be adequate, relevant and limited to
    what is necessary in relation to the purposes for which they are processed."

    Classification tiers (per NIST SP 800-53 data classification + GDPR):
      Public:    No PII/PHI/financial/IP, no regulatory scope. Public by design.
      Internal:  Limited PII (employee data), no regulatory exposure.
                 Internal distribution only.
      Confidential: PII, financial data, proprietary IP. GDPR/CCPA/HIPAA
                    scope applies. Breach notifiable.
      Restricted: PHI, classified PII (SSN, biometrics), critical IP,
                  multiple regulations apply. Breach = mandatory notification.

    Returns dict with classification, justification, and handling rules.

    Edge cases: public_by_design overrides all other signals.
    """
    valid_reg = {"none", "gdpr", "ccpa", "hipaa", "multiple"}
    if regulatory_scope not in valid_reg:
        raise ValueError(f"regulatory_scope must be one of {valid_reg}")

    if public_by_design and not contains_phi and regulatory_scope == "none":
        return {"classification": "Public",
                "handling": "No restrictions. Public dissemination permitted.",
                "breach_notifiable": False,
                "source": "NIST Privacy Framework, Identify-P; GDPR Art. 5"}

    # RESTRICTED: PHI OR multiple regulations + PII OR phi+financial together
    if contains_phi or (regulatory_scope == "multiple" and (contains_pii or contains_financial)):
        return {"classification": "Restricted",
                "handling": ("Encryption required at rest and in transit. "
                            "Access logging mandatory. DLP enabled. "
                            "Need-to-know access only. Audit quarterly."),
                "breach_notifiable": True,
                "notification_deadline": "72 hours (GDPR Art. 33), without undue delay (HIPAA), "
                                        "72 hours (CCPA where applicable)",
                "source": "NIST Privacy Framework, Control-P; GDPR Art. 5, 32"}

    # CONFIDENTIAL: PII or financial or GDPR/CCPA/HIPAA scope
    if contains_pii or contains_financial or regulatory_scope != "none":
        deadlines = []
        if regulatory_scope == "gdpr" or regulatory_scope == "multiple":
            deadlines.append("72 hours (GDPR Art. 33)")
        if regulatory_scope == "hipaa" or regulatory_scope == "multiple":
            deadlines.append("60 days (HIPAA Breach Notification Rule)")
        if regulatory_scope == "ccpa":
            deadlines.append("without unreasonable delay (CCPA §1798.82)")
        notif_str = "; ".join(deadlines) if deadlines else "72 hours (GDPR Art. 33 default)"

        return {"classification": "Confidential",
                "handling": ("Access control required. Encryption at rest. "
                            "Access logging for PII/PHI access. DLP monitoring."),
                "breach_notifiable": True,
                "notification_deadline": notif_str,
                "source": "NIST Privacy Framework, Control-P, Protect-P; GDPR Art. 24-32"}

    # INTERNAL: no PII/PHI/financial, but also not public
    if contains_ip:
        return {"classification": "Internal",
                "handling": ("Internal distribution only. NDAs for external sharing. "
                            "DLP optional. Access control based on role."),
                "breach_notifiable": False,
                "source": "NIST Privacy Framework, Identify-P"}

    # PUBLIC: none of the above
    return {"classification": "Public",
            "handling": "No restrictions. Verify no PII/PHI before public release.",
            "breach_notifiable": False,
            "source": "NIST Privacy Framework, Identify-P; GDPR Art. 5"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — BREACH NOTIFICATION REQUIREMENTS
# Source: GDPR Art. 33-34 (Notification of a Personal Data Breach)
# ═══════════════════════════════════════════════════════════════════

def breach_notification_clock(
    jurisdiction: str,                # 'gdpr', 'ccpa', 'hipaa', 'pipeda', 'multiple'
    risk_to_data_subjects: str,       # 'low', 'medium', 'high'
    affected_data_subjects: int,
    cross_border_transfers: bool = False,
) -> Dict:
    """
    Determine breach notification timeline per jurisdiction.
    GDPR Art. 33(1): "In the case of a personal data breach, the controller
    shall without undue delay and, where feasible, not later than 72 hours
    after having become aware of it, notify the personal data breach to the
    supervisory authority."

    GDPR Art. 33(3): "The notification shall at least: (a) describe the
    nature of the breach; (b) communicate the name and contact details of
    the DPO; (c) describe likely consequences; (d) describe measures taken."

    Other jurisdictions:
      HIPAA: 60 days (45 CFR §164.408)
      CCPA: without unreasonable delay
      PIPEDA: as soon as feasible (Voluntary Breach Reporting)
      Multiple: most restrictive applies (GDPR 72h wins)

    Args:
      jurisdiction: Applicable data protection law(s)
      risk_to_data_subjects: Severity of harm to individuals
      affected_data_subjects: Number of people affected
      cross_border_transfers: Does data cross jurisdictional boundaries?

    Returns dict with deadline in hours, regulatory reference, and action items.
    """
    valid_jur = {"gdpr", "ccpa", "hipaa", "pipeda", "multiple"}
    if jurisdiction not in valid_jur:
        raise ValueError(f"jurisdiction must be one of {valid_jur}")
    valid_risk = {"low", "medium", "high"}
    if risk_to_data_subjects not in valid_risk:
        raise ValueError(f"risk_to_data_subjects must be one of {valid_risk}")

    # Primary deadline
    if jurisdiction == "gdpr" or cross_border_transfers:
        deadline_hours = 72
        ref = "GDPR Art. 33(1): 72 hours to supervisory authority"
    elif jurisdiction == "multiple":
        deadline_hours = 72  # Most restrictive wins
        ref = "GDPR Art. 33 (72h) overrides HIPAA (60d) and CCPA (reasonable)."
    elif jurisdiction == "hipaa":
        deadline_hours = 1440  # 60 days
        ref = "HIPAA Breach Notification Rule (45 CFR §164.408): within 60 days"
    elif jurisdiction == "ccpa":
        deadline_hours = 72  # "Without unreasonable delay" → 72h conservative
        ref = "CCPA §1798.82: without unreasonable delay"
    else:
        deadline_hours = 168  # PIPEDA: as soon as feasible → 7 days
        ref = "PIPEDA: as soon as feasible; 7 days recommended"

    # Risk escalation
    if risk_to_data_subjects == "high" and deadline_hours > 72:
        deadline_hours = 72  # High risk → GDPR-style urgency even for non-GDPR
        ref += "; ESCALATED TO 72h due to HIGH risk to data subjects"

    # Mass breach (>100k subjects) → always urgent
    if affected_data_subjects >= 100_000:
        deadline_hours = min(deadline_hours, 24)
        ref += "; MASS BREACH (>100K subjects) — 24h urgency override"

    notification_items = [
        "Nature of the breach (categories and approximate number of data subjects and records)",
        "DPO contact details",
        "Likely consequences of the breach",
        "Measures taken or proposed to address the breach",
        "Measures to mitigate possible adverse effects (GDPR Art. 33(3)(d))",
    ]

    return {"deadline_hours": deadline_hours,
            "jurisdiction": jurisdiction,
            "regulatory_reference": ref,
            "risk_to_data_subjects": risk_to_data_subjects,
            "affected_subjects": affected_data_subjects,
            "notification_items": notification_items,
            "source": "GDPR Art. 33-34; HIPAA Breach Notification Rule"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — DPIA TRIGGERS
# Source: GDPR Art. 35 (Data Protection Impact Assessment)
#         NIST Privacy Framework, Control-P
# ═══════════════════════════════════════════════════════════════════

def dpia_required(
    systematic_monitoring: bool,
    large_scale_special_categories: bool,  # Art. 9 data: race, health, biometrics
    automated_decision_making: bool,       # Profiling with legal/significant effects
    large_scale_public_area_monitoring: bool,
    new_technology: bool,
    data_subject_count: int = 0,
) -> Dict:
    """
    Determine whether a DPIA is required per GDPR Art. 35.
    GDPR Art. 35(1): "Where a type of processing is likely to result in
    a high risk to the rights and freedoms of natural persons, the
    controller shall carry out a DPIA."

    GDPR Art. 35(3): A DPIA is REQUIRED in these cases:
      (a) Automated processing including profiling with legal effects
      (b) Large-scale processing of special categories of data (Art. 9)
          or criminal conviction data (Art. 10)
      (c) Systematic monitoring of publicly accessible areas on a large scale

    GDPR Art. 35(7): The DPIA shall contain at minimum:
      (a) Systematic description of processing operations and purposes
      (b) Assessment of necessity and proportionality
      (c) Assessment of risks to rights and freedoms
      (d) Measures to address risks (safeguards, security, demonstrating compliance)

    Args:
      systematic_monitoring: Systematic and extensive evaluation of personal aspects
      large_scale_special_categories: Large-scale Art. 9/10 data processing
      automated_decision_making: Profiling producing legal effects (Art. 35(3)(a))
      large_scale_public_area_monitoring: CCTV, public space monitoring
      new_technology: Processing involving use of new technologies
      data_subject_count: Approximate number of data subjects (context: >10K = large scale)

    Returns dict with required/not-required, rationale, and minimum DPIA content.

    Edge cases: all False → DPIA not required unless new_technology + data > threshold
    """
    triggers = []
    required = False

    if automated_decision_making:
        required = True
        triggers.append("Art. 35(3)(a): Automated decision-making with legal effects")
    if large_scale_special_categories:
        required = True
        triggers.append("Art. 35(3)(b): Large-scale processing of special categories (Art. 9)")
    if systematic_monitoring and data_subject_count >= 1000:
        required = True
        triggers.append("Art. 35(1): Systematic monitoring at scale (>1000 subjects)")
    if large_scale_public_area_monitoring:
        required = True
        triggers.append("Art. 35(3)(c): Large-scale monitoring of public areas")
    if new_technology and data_subject_count >= 10000:
        required = True
        triggers.append("Art. 35(1): New technology + large-scale processing → high risk")
    if not required and data_subject_count >= 50000:
        # NIST Privacy Framework recommend: large-scale processing → assess even without Art. 35 triggers
        triggers.append("NIST Privacy Framework, Control-P: recommended DPIA for processing >50K subjects")
        required = False  # Recommended but not mandatory

    if required:
        verdict = "DPIA REQUIRED per GDPR Art. 35"
    elif triggers:
        verdict = "DPIA RECOMMENDED (NIST Privacy Framework Control-P)"
    else:
        verdict = "DPIA NOT REQUIRED — no Art. 35 triggers detected"

    dpia_content = [
        "Systematic description of processing operations and purposes (Art. 35(7)(a))",
        "Assessment of necessity and proportionality (Art. 35(7)(b))",
        "Risk assessment for rights and freedoms of data subjects (Art. 35(7)(c))",
        "Measures to address risks — safeguards, security, compliance (Art. 35(7)(d))",
    ]

    return {"dpia_required": required, "verdict": verdict,
            "triggers": triggers, "dpia_content": dpia_content,
            "source": "GDPR Art. 35; NIST Privacy Framework, Control-P"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — DLP ALERT SEVERITY
# Source: NIST Privacy Framework, Protect-P (Data Security)
# ═══════════════════════════════════════════════════════════════════

def dlp_alert_severity(data_classification: str,
                       egress_destination: str,     # 'internal', 'external_trusted', 'external_untrusted', 'dark_web'
                       volume_of_records: int,
                       encryption_status: str,      # 'encrypted', 'plaintext', 'mixed'
                       authorized_transfer: bool,
                       ) -> Dict:
    """
    Determine DLP alert severity.
    NIST Privacy Framework, Protect-P: "Data security controls include
    data loss prevention measures appropriate to the classification level."

    Severity matrix:
      CRITICAL: RESTRICTED data + untrusted external + plaintext + unauthorized
      HIGH:     RESTRICTED data + any external, or CONFIDENTIAL + untrusted external
      MEDIUM:   CONFIDENTIAL data + external trusted, or INTERNAL + untrusted external
      LOW:      INTERNAL data + external trusted

    Drop severity at least 2 levels if encrypted (adds protection layer).
    """
    valid_class = {"Public", "Internal", "Confidential", "Restricted"}
    if data_classification not in valid_class:
        raise ValueError(f"data_classification must be one of {valid_class}")
    valid_dest = {"internal", "external_trusted", "external_untrusted", "dark_web"}
    if egress_destination not in valid_dest:
        raise ValueError(f"egress_destination must be one of {valid_dest}")
    if not isinstance(volume_of_records, int) or volume_of_records < 0:
        raise ValueError(f"volume_of_records must be ≥ 0, got {volume_of_records}")

    # Base severity from classification + destination
    class_base = {"Public": 0, "Internal": 1, "Confidential": 2, "Restricted": 3}
    dest_mod = {"internal": 0, "external_trusted": 1, "external_untrusted": 2, "dark_web": 3}

    raw_score = class_base[data_classification] + dest_mod[egress_destination]

    # Authorization — cuts severity in half
    if authorized_transfer:
        raw_score = max(0, raw_score - 2)

    # Encryption — drops severity significantly
    if encryption_status == "encrypted":
        raw_score = max(0, raw_score - 2)
    elif encryption_status == "mixed":
        raw_score = max(0, raw_score - 1)

    # Mass volume (>1000 records) — bumps severity
    if volume_of_records >= 10000:
        raw_score += 1
    elif volume_of_records >= 1000:
        raw_score += 0.5

    if raw_score >= 5:
        severity = "CRITICAL — requires immediate SOC response and potential breach notification"
    elif raw_score >= 3.5:
        severity = "HIGH — investigate within 1 hour, escalate to security lead"
    elif raw_score >= 2:
        severity = "MEDIUM — investigate within 4 hours"
    elif raw_score >= 0.5:
        severity = "LOW — investigate within 24 hours"
    else:
        severity = "INFORMATIONAL — log only, no active investigation required"

    return {"severity": severity.split(" —")[0], "raw_score": raw_score,
            "detail": severity,
            "source": "NIST Privacy Framework, Protect-P"}


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
    print("SELF-TEST SUITE: privacy_compliance.py")
    print("Sources: NIST Privacy Framework v1.0 (2020) + GDPR (EU) 2016/679")
    print("=" * 70)

    # ── Data Classification ──
    print("\n── Data Classification (NIST PF + GDPR Art. 5) ──")
    dc = classify_data(True, False, False, False, "gdpr")
    ck("dc: PII+GDPR → Confidential", dc["classification"], "Confidential")

    dc2 = classify_data(False, True, False, False, "hipaa")
    ck("dc: PHI+HIPAA → Restricted", dc2["classification"], "Restricted")

    dc3 = classify_data(False, False, False, False, "none", public_by_design=True)
    ck("dc: public by design → Public", dc3["classification"], "Public")

    # ── Breach Notification ──
    print("\n── Breach Notification (GDPR Art. 33-34) ──")
    bn = breach_notification_clock("gdpr", "high", 500, False)
    ck("bn: GDPR+high+500 → 72h", bn["deadline_hours"], 72)

    bn2 = breach_notification_clock("gdpr", "high", 150000, True)
    ck("bn2: mass breach >100K → 24h", bn2["deadline_hours"], 24)

    bn3 = breach_notification_clock("hipaa", "low", 10, False)
    ck("bn3: HIPAA+low → 60 days (1440h)", bn3["deadline_hours"], 1440)

    # ── DPIA ──
    print("\n── DPIA Triggers (GDPR Art. 35) ──")
    dp = dpia_required(True, False, True, False, False, 5000)
    ck("dpia: monitoring+automated → REQUIRED", dp["dpia_required"], True)

    dp2 = dpia_required(False, False, False, False, False, 100)
    ck("dpia: nothing → NOT REQUIRED", dp2["dpia_required"], False)

    # ── DLP Severity ──
    print("\n── DLP Severity (NIST PF, Protect-P) ──")
    dlp = dlp_alert_severity("Restricted", "dark_web", 50000, "plaintext", False)
    ck("dlp: RESTRICTED + dark_web + 50K + plain → CRITICAL", dlp["severity"], "CRITICAL")

    dlp2 = dlp_alert_severity("Internal", "external_trusted", 10, "encrypted", True)
    ck("dlp: INTERNAL + trusted + enc + auth → INFORMATIONAL", dlp2["severity"], "INFORMATIONAL")

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
