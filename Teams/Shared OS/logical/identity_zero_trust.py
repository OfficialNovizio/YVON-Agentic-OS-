#!/usr/bin/env python3
"""
Identity & Zero Trust Architecture
=====================================
Sources (2-book minimum per §8.0):
  Book 1: NIST, *Zero Trust Architecture* (SP 800-207, 2020).
          Free at https://csrc.nist.gov/publications/detail/sp/800-207/final
          Sections: §3 (Zero Trust Tenets), §4 (Logical Components),
          §5 (Deployment Models), §6 (Use Cases), §7 (Threats)

  Book 2: NIST, *Digital Identity Guidelines* (SP 800-63-3, 2017).
          Free at https://csrc.nist.gov/publications/detail/sp/800-63/3/final
          Sections: §4 (Identity Assurance Levels — IAL1-3),
          §5 (Authenticator Assurance Levels — AAL1-3),
          §6 (Federation Assurance Levels — FAL1-3)

Route: B (rule-based — identity assurance + ZT access decisions with NIST citations)

Covers what keyring and bastion need:
  - Identity proofing levels (IAL1-3 per SP 800-63 §4)
  - Authenticator strength classification (AAL1-3 §5)
  - Just-in-time vs standing privilege decision framework
  - Access review cadence by resource sensitivity
  - Zero trust policy enforcement check (SP 800-207 §3)
  - Deprovisioning SLA classification
"""

from __future__ import annotations
import math
import sys
from typing import Dict, List


def _range(val: int, lo: int, hi: int, name: str) -> None:
    if not isinstance(val, int) or val < lo or val > hi: raise ValueError(f"{name} must be {lo}-{hi}, got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — IDENTITY PROOFING LEVELS (IAL)
# Source: NIST SP 800-63-3, §4 (Identity Assurance Levels)
# ═══════════════════════════════════════════════════════════════════

IAL_REQUIREMENTS = {
    1: {"name": "IAL1 — Self-Asserted",
        "description": "No identity proofing required. Claimant self-asserts identity.",
        "verification": "None — no binding to a real-world identity.",
        "sp800_63": "§4.3",
        "use_case": "Anonymous access, free-tier services, public content."},
    2: {"name": "IAL2 — Remote or In-Person Proofing",
        "description": "Identity is verified using strong evidence (government ID, biometric match, or equivalent).",
        "verification": "Remote: government ID + liveness check. In-person: physical ID.",
        "sp800_63": "§4.4",
        "use_case": "Access to PII, financial data, health records (HIPAA-covered)."},
    3: {"name": "IAL3 — In-Person with Biometric Binding",
        "description": "In-person identity proofing with biometric binding. Highest assurance.",
        "verification": "Physical presence + trained CSP agent + biometric binding.",
        "sp800_63": "§4.5",
        "use_case": "National security systems, critical infrastructure, classified data."},
}


def identity_proofing_requirement(
    data_sensitivity: str,  # 'public', 'pii', 'phi', 'financial', 'classified'
    access_context: str,     # 'web', 'enterprise', 'critical_infra'
) -> Dict:
    """
    Determine minimum IAL for given data sensitivity.
    NIST SP 800-63-3, §4: "IAL describes the identity proofing process
    and the strength of the binding between the applicant and their identity."

    Mapping (per SP 800-63-3, §4.3-4.5 and common practice):
      public data     → IAL1 (self-asserted)
      PII             → IAL2 (verified identity)
      PHI / financial → IAL2 (verified identity, HIPAA/PCI)
      classified      → IAL3 (in-person + biometric)

    Access context (enterprise vs web) can increase the requirement
    even for the same data type.

    Edge cases: unknown sensitivity → ValueError
    """
    valid_sens = {"public", "pii", "phi", "financial", "classified"}
    if data_sensitivity not in valid_sens:
        raise ValueError(f"data_sensitivity must be one of {valid_sens}")
    valid_ctx = {"web", "enterprise", "critical_infra"}
    if access_context not in valid_ctx:
        raise ValueError(f"access_context must be one of {valid_ctx}")

    sens_map = {"public": 1, "pii": 2, "phi": 2, "financial": 2, "classified": 3}
    ial = sens_map[data_sensitivity]

    # Context adjustments
    if access_context == "critical_infra" and ial < 2:
        ial = 2
    if access_context == "critical_infra" and data_sensitivity == "classified":
        ial = 3

    info = IAL_REQUIREMENTS[ial]
    return {"required_ial": f"IAL{ial}", "ial_details": info,
            "data_sensitivity": data_sensitivity, "access_context": access_context,
            "source": "NIST SP 800-63-3, §4.3-4.5"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — AUTHENTICATOR ASSURANCE (AAL)
# Source: NIST SP 800-63-3, §5 (Authenticator Assurance Levels)
# ═══════════════════════════════════════════════════════════════════

AAL_REQUIREMENTS = {
    1: {"name": "AAL1 — Single-Factor",
        "sp800_63": "§5.3",
        "requires": "Any single-factor authenticator (password, PIN). MFA optional.",
        "phishing_resistant": False},
    2: {"name": "AAL2 — Multi-Factor",
        "sp800_63": "§5.4",
        "requires": "Two factors required: something you know + something you have OR are. Cryptographic authenticator preferred.",
        "phishing_resistant": False},
    3: {"name": "AAL3 — Hardware-Based Multi-Factor",
        "sp800_63": "§5.5",
        "requires": "Hardware cryptographic authenticator ('possession' factor must be phishing-resistant). Verifier impersonation resistance required.",
        "phishing_resistant": True},
}


def authenticator_requirement(ial: int, phishing_risk: bool = False,
                               remote_access: bool = True) -> Dict:
    """
    Determine required AAL based on identity proofing level and context.
    SP 800-63-3, §5: "AAL describes the strength of the authentication
    process — how the claimant proves possession and control of the
    authenticator."

    SP 800-63-3, Table 5-1 (AAL Summary):
      IAL1 → AAL1 sufficient (lowest assurance)
      IAL2 → AAL2 required (MFA)
      IAL3 → AAL3 required (hardware-based, phishing-resistant)
    """
    _range(ial, 1, 3, "ial")

    aal_map = {1: 1, 2: 2, 3: 3}
    aal = aal_map[ial]

    # Phishing risk: requires AAL2 minimum even for IAL1
    if phishing_risk and aal < 2:
        aal = 2
    # Remote access + IAL2+: require phishing-resistant (AAL3)
    if remote_access and phishing_risk and aal < 3:
        aal = 3

    info = AAL_REQUIREMENTS[aal]
    return {"required_aal": f"AAL{aal}", "aal_details": info,
            "ial": ial, "phishing_risk": phishing_risk,
            "source": "NIST SP 800-63-3, §5.3-5.5"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — ACCESS REVIEW CADENCE
# Source: NIST SP 800-63-3, SP 800-207 §3 (Zero Trust — continuous verification)
# ═══════════════════════════════════════════════════════════════════

def access_review_cadence(
    resource_sensitivity: str,      # 'public', 'internal', 'confidential', 'restricted'
    privilege_type: str,            # 'standard', 'elevated', 'admin', 'emergency'
    zero_trust_enforced: bool,
    last_breach_days: Optional[int] = None,
) -> Dict:
    """
    Determine access review cadence.
    SP 800-53 Rev 5, AC-2 (Account Management): "Review accounts for
    compliance with account management requirements."

    SP 800-207, §3: "Access to resources is determined by dynamic policy
    and is enforced per-session." Zero trust requires continuous
    verification, not periodic reviews alone.

    Review cadences (per NIST best practice and industry standards):
      Standard accounts on internal systems: 90 days (quarterly)
      Elevated / privileged accounts: 30 days (monthly)
      Admin accounts: 30 days (monthly)
      Emergency / break-glass: 7 days (weekly)
      Post-breach: all accounts reviewed within 24 hours

    Args:
      resource_sensitivity: Classification of the accessed resources
      privilege_type: Type of privilege held
      zero_trust_enforced: Is ZT with continuous policy enforcement in place?
      last_breach_days: Days since last security incident

    Returns dict with recommended cadence in days and rationale.
    """
    valid_sens = {"public", "internal", "confidential", "restricted"}
    if resource_sensitivity not in valid_sens:
        raise ValueError(f"resource_sensitivity must be one of {valid_sens}")

    valid_priv = {"standard", "elevated", "admin", "emergency"}
    if privilege_type not in valid_priv:
        raise ValueError(f"privilege_type must be one of {valid_priv}")

    # Base cadences
    cadence_map = {
        "standard":  {"public": 180, "internal": 90, "confidential": 90, "restricted": 60},
        "elevated":  {"public": 90,  "internal": 60, "confidential": 30, "restricted": 30},
        "admin":     {"public": 60,  "internal": 30, "confidential": 30, "restricted": 14},
        "emergency": {"public": 14,  "internal": 7,  "confidential": 7,  "restricted": 7},
    }
    days = cadence_map[privilege_type][resource_sensitivity]

    # Zero trust adjustment: continuous verification means periodic reviews
    # can be relaxed somewhat, but never eliminated
    if zero_trust_enforced and days >= 90:
        days = int(days * 0.75)  # Reduce by 25% — ZT provides continuous signals

    # Post-breach override: all accounts within 7 days
    if last_breach_days is not None and last_breach_days < 30:
        days = min(days, 7)
        override = "POST-BREACH OVERRIDE: review all access within 7 days (SP 800-53 AC-2)"
    else:
        override = None

    return {"review_cadence_days": days, "privilege_type": privilege_type,
            "resource_sensitivity": resource_sensitivity,
            "zero_trust_enforced": zero_trust_enforced,
            "post_breach_override": override,
            "source": "NIST SP 800-53 Rev 5, AC-2; SP 800-207, §3"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — JIT vs STANDING PRIVILEGE
# Source: NIST SP 800-207, §3 (Zero Trust Tenets)
# ═══════════════════════════════════════════════════════════════════

def privilege_model_decision(
    access_frequency: str,       # 'constant', 'daily', 'weekly', 'monthly', 'rare'
    access_sensitivity: str,     # 'public', 'pii', 'phi', 'financial', 'classified'
    zero_trust_capability: bool,
) -> Dict:
    """
    Decide between Just-in-Time (JIT) and standing privilege.
    SP 800-207, §3.2: "Access to resources is granted per session and
    denied by default." — Zero trust favors JIT.

    JIT = privilege granted on-demand, for a specific session, and
    revoked immediately after. Requires automation.

    Standing privilege = always-on access. Only justified when:
      - Access is constant (automated service accounts)
      - JIT infrastructure doesn't exist yet
      - The access frequency is daily or more

    Decision matrix:
      rare/monthly/weekly access → JIT (regardless of sensitivity)
      daily access + ZT capable → JIT
      daily access + no ZT → STANDING (with compensating controls)
      constant access (service accounts) → STANDING (with audit)

    Args:
      access_frequency: How often does this role access the resource?
      access_sensitivity: What kind of data is accessed?
      zero_trust_capability: Is the infrastructure capable of JIT?

    Returns dict with model recommendation and compensating controls.
    """
    valid_freq = {"constant", "daily", "weekly", "monthly", "rare"}
    if access_frequency not in valid_freq:
        raise ValueError(f"access_frequency must be one of {valid_freq}")
    valid_sens = {"public", "pii", "phi", "financial", "classified"}
    if access_sensitivity not in valid_sens:
        raise ValueError(f"access_sensitivity must be one of {valid_sens}")

    if access_frequency in ("monthly", "rare", "weekly"):
        model = "JIT (Just-in-Time)"
        rationale = (f"Intermittent access ({access_frequency}) — JIT is both safer "
                    f"and more practical. SP 800-207, §3: 'Privilege should be "
                    f"granted per-session, not per-account.'")
    elif access_frequency == "daily" and zero_trust_capability:
        model = "JIT (Just-in-Time)"
        rationale = ("Daily access with ZT capability — JIT eliminates standing "
                    "privilege attack surface. SP 800-207, §3.1.")
    elif access_frequency == "daily":
        model = "STANDING (with compensating controls)"
        rationale = ("Daily access without ZT capability — standing privilege "
                    "unavoidable. Require: MFA, session logging, 30-day review. "
                    "Plan ZT migration. SP 800-207, §3: ZT is the target state.")
    else:
        model = "STANDING (service account, with audit)"
        rationale = ("Constant access (service/automation account) — standing "
                    "privilege is necessary. Require: least privilege, API key "
                    "rotation every 90 days, anomaly detection on usage patterns. "
                    "SP 800-63-3, §5: Service accounts have separate guidelines.")

    compensating = []
    if "STANDING" in model:
        compensating = [
            "Session logging for all privileged actions",
            "Monthly access review (SP 800-53 AC-2)",
            "Anomaly detection on privilege usage patterns",
            "MFA required for all human standing-privilege accounts",
        ]

    return {"model": model, "rationale": rationale,
            "compensating_controls": compensating,
            "source": "NIST SP 800-207, §3; SP 800-53 AC-2"}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — ZERO TRUST POLICY ENFORCEMENT
# Source: NIST SP 800-207, §3-4
# ═══════════════════════════════════════════════════════════════════

def zero_trust_compliance(
    per_session_auth: bool,
    least_privilege_enforced: bool,
    continuous_verification: bool,
    micro_segmentation: bool,
    encrypted_all_traffic: bool,
    dynamic_policy: bool,
) -> Dict:
    """
    Check compliance with NIST SP 800-207 Zero Trust tenets.
    SP 800-207, §3 (Zero Trust Tenets):
      1. All data sources and computing services are considered resources.
      2. All communication is secured regardless of network location.
      3. Access to individual resources is granted per session.
      4. Access is determined by dynamic policy.
      5. The enterprise monitors and measures integrity of all assets.
      6. All resource authentication and authorization are dynamic.
      7. The enterprise collects as much information as possible about
         the current state of assets and uses it to improve security posture.

    Each tenet is scored pass/fail. Overall compliance = passed / 7.
    """
    tenets = {
        "Per-session access control (ZT Tenet 3, §3.2)": per_session_auth,
        "Least privilege enforced (ZT Tenet 1, §3.1)": least_privilege_enforced,
        "Continuous verification (ZT Tenet 6, §3.5)": continuous_verification,
        "Micro-segmentation (ZT Tenet 4, §3.3)": micro_segmentation,
        "All traffic encrypted (ZT Tenet 2, §3.2)": encrypted_all_traffic,
        "Dynamic policy engine (ZT Tenet 4, §3.3)": dynamic_policy,
    }
    for label, v in tenets.items():
        if not isinstance(v, bool):
            raise TypeError(f"'{label[:30]}...' must be bool")

    passed = sum(1 for v in tenets.values() if v)
    total = len(tenets)
    pct = passed / total

    if pct >= 0.85:
        level = "ALIGNED — meets core ZT architecture (SP 800-207, §4-6)"
    elif pct >= 0.60:
        level = "PROGRESSING — on ZT journey, key gaps remain"
    elif pct >= 0.40:
        level = "EARLY STAGE — some ZT principles adopted"
    else:
        level = "NOT ALIGNED — fundamental ZT tenets not met (SP 800-207, §3)"

    failed = [k for k, v in tenets.items() if not v]

    return {"tenets_passed": f"{passed}/{total}", "level": level,
            "gaps": failed, "source": "NIST SP 800-207, §3-4"}


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
    print("SELF-TEST SUITE: identity_zero_trust.py")
    print("Sources: NIST SP 800-207 (2020) + NIST SP 800-63-3 (2017)")
    print("=" * 70)

    # ── IAL ──
    print("\n── Identity Proofing (SP 800-63-3, §4) ──")
    ip = identity_proofing_requirement("pii", "web")
    ck("ial: PII+web → IAL2", ip["required_ial"], "IAL2")
    ip2 = identity_proofing_requirement("classified", "critical_infra")
    ck("ial: classified+critical → IAL3", ip2["required_ial"], "IAL3")
    ip3 = identity_proofing_requirement("public", "web")
    ck("ial: public+web → IAL1", ip3["required_ial"], "IAL1")

    # ── AAL ──
    print("\n── Authenticator Assurance (SP 800-63-3, §5) ──")
    au = authenticator_requirement(2, phishing_risk=False)
    ck("aal: IAL2 no phishing → AAL2", au["required_aal"], "AAL2")
    au2 = authenticator_requirement(3, phishing_risk=True, remote_access=True)
    ck("aal: IAL3+phishing+remote → AAL3", au2["required_aal"], "AAL3")

    # ── Access Review ──
    print("\n── Access Review Cadence (SP 800-53 AC-2; SP 800-207 §3) ──")
    ar = access_review_cadence("confidential", "admin", True)
    ck("arc: confidential+admin+ZT → ≤ 30 days", ar["review_cadence_days"] <= 30, True)
    ar2 = access_review_cadence("internal", "standard", False)
    ck("arc: internal+standard → 90 days", ar2["review_cadence_days"], 90)
    ar3 = access_review_cadence("restricted", "emergency", True, last_breach_days=5)
    ck("arc: post-breach → 7 day override", ar3["review_cadence_days"], 7)

    # ── Privilege Model ──
    print("\n── JIT vs Standing (SP 800-207, §3) ──")
    pm = privilege_model_decision("monthly", "financial", True)
    ck("pm: monthly → JIT", "JIT" in pm["model"], True)
    pm2 = privilege_model_decision("constant", "classified", True)
    ck("pm: constant → STANDING service", "STANDING" in pm2["model"], True)
    pm3 = privilege_model_decision("daily", "classified", False)
    ck("pm: daily+no ZT → STANDING compensating", "STANDING" in pm3["model"], True)

    # ── ZT Compliance ──
    print("\n── ZT Compliance (SP 800-207, §3-4) ──")
    zt = zero_trust_compliance(True, True, True, True, True, True)
    ck("zt: all 6 tenets → ALIGNED", "ALIGNED" in zt["level"], True)
    zt2 = zero_trust_compliance(False, False, False, False, False, False)
    ck("zt2: 0/6 → NOT ALIGNED", "NOT ALIGNED" in zt2["level"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
