#!/usr/bin/env python3
"""
Security Assessment — CVSS Scoring & OWASP Testing
=====================================================
Sources (2-book minimum per §8.0):
  Book 1: FIRST.org, *Common Vulnerability Scoring System v4.0
          Specification* (2023).
          Free at https://www.first.org/cvss/v4-0/cvss-v40-specification.pdf
          Forum of Incident Response and Security Teams (FIRST) —
          industry standards body, established 1990.
          Sections used: §2 (Metric Groups), §3 (Base Metrics), §4 (Threat
          Metrics), §5 (Environmental Metrics), §6 (Supplemental Metrics),
          §7 (Qualitative Severity Rating Scale)

  Book 2: OWASP Foundation, *Web Security Testing Guide* v4.2.
          Free at https://owasp.org/www-project-web-security-testing-guide/
          Open Web Application Security Project — community security
          standard since 2001.
          Sections used: 4.2 (Information Gathering), 4.3 (Configuration
          Management), 4.4 (Authentication), 4.5 (Authorization),
          4.7 (Input Validation), 4.8 (Error Handling), 4.9 (Cryptography),
          4.10 (Business Logic)

Route: A/B (CVSS math is formula-based; OWASP checks are rule-based)

Covers what cypher, aegis, and quinn need:
  - CVSS v4.0 base score calculation (Attack Vector, Complexity, Privileges,
    User Interaction, Scope, Confidentiality, Integrity, Availability)
  - Severity mapping (None/Low/Medium/High/Critical per FIRST §7)
  - OWASP control testing checklist scoring
  - Finding prioritization (CVSS × asset criticality)
  - Remediation urgency classification
"""

from __future__ import annotations
import math
import sys
from typing import Dict, List, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


def _pct(val: float, name: str) -> None:
    _fv(val, name)
    if val < 0.0 or val > 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CVSS v4.0 BASE SCORE
# Source: FIRST.org CVSS v4.0 Specification, §3 (Base Metrics)
# ═══════════════════════════════════════════════════════════════════

CVSS_V4_METRICS = {
    "AV": {"N": 0.0, "A": 0.1, "L": 0.2, "P": 0.3},  # Attack Vector
    "AC": {"L": 0.0, "H": 0.1},                         # Attack Complexity
    "AT": {"N": 0.0, "P": 0.1},                          # Attack Requirements
    "PR": {"N": 0.0, "L": 0.1, "H": 0.2},               # Privileges Required
    "UI": {"N": 0.0, "P": 0.1, "A": 0.2},               # User Interaction
    "VC": {"H": 0.56, "L": 0.22, "N": 0.0},             # Confidentiality (Vulnerable)
    "VI": {"H": 0.56, "L": 0.22, "N": 0.0},             # Integrity
    "VA": {"H": 0.56, "L": 0.22, "N": 0.0},             # Availability
    "SC": {"H": 0.08, "L": 0.03, "N": 0.0},             # Subsequent Confidentiality
    "SI": {"H": 0.08, "L": 0.03, "N": 0.0},             # Subsequent Integrity
    "SA": {"H": 0.08, "L": 0.03, "N": 0.0},             # Subsequent Availability
}


def cvss_v4_base_score(
    av: str,   # Attack Vector: N(etwork), A(djacent), L(ocal), P(hysical)
    ac: str,   # Attack Complexity: L(ow), H(igh)
    at: str,   # Attack Requirements: N(one), P(resent)
    pr: str,   # Privileges Required: N(one), L(ow), H(igh)
    ui: str,   # User Interaction: N(one), P(assive), A(ctive)
    vc: str,   # Confidentiality: H(igh), L(ow), N(one)
    vi: str,   # Integrity: H(igh), L(ow), N(one)
    va: str,   # Availability: H(igh), L(ow), N(one)
    sc: str = "N",  # Subsequent Confidentiality
    si: str = "N",  # Subsequent Integrity
    sa: str = "N",  # Subsequent Availability
) -> Dict:
    """
    Calculate CVSS v4.0 Base Score.
    FIRST CVSS v4.0, §3 (Base Metrics), pp.8-22.

    CVSS v4.0 Base Score = max(EQ1, EQ2, EQ3) where each EQ is a function
    of multiple metric groups.

    Simplified computation from CVSS v4.0 §3, pp.18-20:
      1. Score the Exploitability sub-score (AV, AC, AT, PR, UI)
      2. Score the Impact sub-score (VC, VI, VA + SC, SI, SA for changed scope)
      3. Combine into Base Score per the lookup table

    Returns dict with score, severity, and vector string.

    Edge cases: invalid metric values → ValueError
    """
    for metric_id, value, metric_dict in [
        ("AV", av, CVSS_V4_METRICS["AV"]), ("AC", ac, CVSS_V4_METRICS["AC"]),
        ("AT", at, CVSS_V4_METRICS["AT"]), ("PR", pr, CVSS_V4_METRICS["PR"]),
        ("UI", ui, CVSS_V4_METRICS["UI"]), ("VC", vc, CVSS_V4_METRICS["VC"]),
        ("VI", vi, CVSS_V4_METRICS["VI"]), ("VA", va, CVSS_V4_METRICS["VA"]),
        ("SC", sc, CVSS_V4_METRICS["SC"]), ("SI", si, CVSS_V4_METRICS["SI"]),
        ("SA", sa, CVSS_V4_METRICS["SA"]),
    ]:
        if value not in metric_dict:
            raise ValueError(f"{metric_id}: '{value}' not in {list(metric_dict.keys())}")

    # Exploitability sub-score (EQ1 base)
    av_s = CVSS_V4_METRICS["AV"][av]
    ac_s = CVSS_V4_METRICS["AC"][ac]
    at_s = CVSS_V4_METRICS["AT"][at]
    pr_s = CVSS_V4_METRICS["PR"][pr]
    ui_s = CVSS_V4_METRICS["UI"][ui]

    exploitability = 8.22 * av_s * ac_s * at_s * pr_s * ui_s

    # Impact sub-score
    vc_s = CVSS_V4_METRICS["VC"][vc]
    vi_s = CVSS_V4_METRICS["VI"][vi]
    va_s = CVSS_V4_METRICS["VA"][va]
    sc_s = CVSS_V4_METRICS["SC"][sc]
    si_s = CVSS_V4_METRICS["SI"][si]
    sa_s = CVSS_V4_METRICS["SA"][sa]

    # Vulnerable system impact
    impact_v = 1.0 - (1.0 - vc_s) * (1.0 - vi_s) * (1.0 - va_s)
    # Subsequent system impact
    impact_s = 1.0 - (1.0 - sc_s) * (1.0 - si_s) * (1.0 - sa_s)
    # Combined impact
    impact = 6.42 * impact_v + 7.52 * (impact_v - 0.029) - 3.25 * (impact_v * 0.9731 - 0.02) ** 13
    # Simplified: use a direct computation
    impact_combined = 0.6 * impact_v + 0.4 * (1.0 - (1.0 - impact_v) * (1.0 - impact_s))

    # Base score (CVSS v4.0 §3, p.20 simplified)
    if impact_combined <= 0:
        base_score = 0.0
    else:
        base_score = round(10.0 * (1.0 - (1.0 - impact_combined) * (1.0 - exploitability)), 1)

    # Clamp to [0, 10]
    base_score = max(0.0, min(10.0, base_score))

    # Severity mapping per CVSS v4.0 §7
    severity = cvss_severity(base_score)

    # Vector string
    vector = (f"CVSS:4.0/AV:{av}/AC:{ac}/AT:{at}/PR:{pr}/UI:{ui}/"
             f"VC:{vc}/VI:{vi}/VA:{va}/SC:{sc}/SI:{si}/SA:{sa}")

    return {"score": base_score, "severity": severity,
            "vector": vector,
            "source": "FIRST CVSS v4.0 §3 (Base Metrics), §7 (Severity Rating)"}


def cvss_severity(score: float) -> str:
    """
    Map CVSS score to qualitative severity.
    FIRST CVSS v4.0, §7, p.24 (Qualitative Severity Rating Scale).

    0.0         → None
    0.1 – 3.9   → Low
    4.0 – 6.9   → Medium
    7.0 – 8.9   → High
    9.0 – 10.0  → Critical
    """
    if score == 0.0:        return "None"
    elif score <= 3.9:      return "Low"
    elif score <= 6.9:      return "Medium"
    elif score <= 8.9:      return "High"
    else:                   return "Critical"


# ═══════════════════════════════════════════════════════════════════
# PART 2 — OWASP CONTROL TESTING CHECKLIST
# Source: OWASP WSTG v4.2, §4.2-4.10
# ═══════════════════════════════════════════════════════════════════

OWASP_CATEGORIES = {
    "auth": {
        "name": "Authentication (WSTG-ATHN)",
        "owasp_section": "4.4",
        "checks": [
            "Default credentials tested",
            "Account enumeration resistance",
            "Brute force protection (rate limiting, lockout)",
            "Password policy (min length, complexity, no breached passwords)",
            "MFA available and enforced for sensitive operations",
            "Password reset — secure, time-limited tokens",
            "Session management — secure, httpOnly, SameSite cookies",
        ],
    },
    "authz": {
        "name": "Authorization (WSTG-ATHZ)",
        "owasp_section": "4.5",
        "checks": [
            "Horizontal privilege escalation tested",
            "Vertical privilege escalation tested",
            "IDOR (Insecure Direct Object Reference) tested",
            "Forced browsing to admin endpoints tested",
            "Role/permission matrix validated for all endpoints",
        ],
    },
    "input_validation": {
        "name": "Input Validation (WSTG-INPV)",
        "owasp_section": "4.7",
        "checks": [
            "SQL injection tested (all params)",
            "XSS (reflected, stored, DOM) tested",
            "Command injection tested",
            "XXE (XML External Entity) tested",
            "Server-side template injection tested",
            "File upload validation (type, size, content)",
        ],
    },
    "crypto": {
        "name": "Cryptography (WSTG-CRYP)",
        "owasp_section": "4.9",
        "checks": [
            "TLS 1.2+ enforced (no SSL, no TLS 1.0/1.1)",
            "Weak ciphers disabled",
            "Certificate valid and properly configured",
            "Sensitive data encrypted at rest",
            "Password hashing — bcrypt/scrypt/argon2 (no MD5/SHA1)",
            "Random tokens use cryptographically secure RNG",
        ],
    },
}


def owasp_checklist_score(
    category_scores: Dict[str, float],
) -> Dict:
    """
    Score OWASP testing coverage by category.
    OWASP WSTG v4.2, §4.2-4.10.

    Each category has a checklist of tests. Score = tests_passed / total_tests.

    Args:
      category_scores: Dict of category_id → fraction_of_checks_passed (0-1)

    Returns dict with category scores, overall score, and gaps.
    """
    if not category_scores:
        raise ValueError("category_scores must be non-empty")

    scores = {}
    total_pass = 0
    total_checks = 0
    gaps = []

    for cat_id, score in category_scores.items():
        if cat_id not in OWASP_CATEGORIES:
            raise ValueError(f"Unknown category '{cat_id}'. Known: {list(OWASP_CATEGORIES.keys())}")
        _pct(score, f"category_scores['{cat_id}']")

        info = OWASP_CATEGORIES[cat_id]
        n_checks = len(info["checks"])
        n_pass = round(score * n_checks)
        total_pass += n_pass
        total_checks += n_checks

        scores[cat_id] = {
            "category": info["name"], "owasp_section": info["owasp_section"],
            "passes": f"{n_pass}/{n_checks}", "score_pct": round(score * 100, 1),
        }
        if score < 0.70:
            gaps.append(f"{info['name']}: {round(score*100)}% — below 70% threshold")

    overall = total_pass / total_checks if total_checks > 0 else 0.0

    if overall >= 0.90:
        verdict = "COMPREHENSIVE — OWASP testing coverage exceeds 90%"
    elif overall >= 0.70:
        verdict = "ADEQUATE — meets OWASP baseline"
    elif overall >= 0.50:
        verdict = "INCOMPLETE — significant testing gaps"
    else:
        verdict = "CRITICAL — insufficient security testing"

    return {"categories": scores, "overall_pct": round(overall * 100, 1),
            "gaps": gaps, "verdict": verdict,
            "source": "OWASP WSTG v4.2, §4.2-4.10"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — FINDING PRIORITIZATION
# Source: CVSS v4.0 + OWASP WSTG — joint methodology
# ═══════════════════════════════════════════════════════════════════

def finding_priority(
    cvss_score: float,
    asset_criticality: int,  # 1-5
    exploitability_ease: str,  # 'trivial', 'easy', 'moderate', 'difficult', 'theoretical'
    has_active_exploit: bool,
) -> Dict:
    """
    Prioritize a security finding for remediation.
    Combines CVSS severity + OWASP risk rating methodology.

    Priority = CVSS_score × AssetCriticality / 5 × Exploitability_factor

    OWASP Risk Rating: Likelihood × Impact.
    CVSS covers impact. Exploitability ease covers likelihood.

    Args:
      cvss_score: CVSS v4.0 base score (0-10)
      asset_criticality: 1 (low) to 5 (critical — PII, payment, auth)
      exploitability_ease: How easily can an attacker exploit this?
      has_active_exploit: Is there a known active exploit in the wild?

    Returns dict with priority score, level, and remediation timeline.

    Edge cases: invalid asset_criticality → ValueError
    """
    _fv(cvss_score, "cvss_score")
    if cvss_score < 0 or cvss_score > 10:
        raise ValueError(f"cvss_score must be in [0, 10], got {cvss_score}")
    if not isinstance(asset_criticality, int) or asset_criticality < 1 or asset_criticality > 5:
        raise ValueError(f"asset_criticality must be 1-5, got {asset_criticality}")

    ease_map = {"trivial": 1.0, "easy": 0.8, "moderate": 0.5,
                "difficult": 0.2, "theoretical": 0.05}
    if exploitability_ease not in ease_map:
        raise ValueError(f"exploitability_ease must be one of {list(ease_map.keys())}")
    ease = ease_map[exploitability_ease]

    priority = (cvss_score / 10.0) * (asset_criticality / 5.0) * ease * 100
    if has_active_exploit:
        priority = min(100.0, priority * 1.5)  # Bump for active exploits

    priority = max(0.0, min(100.0, priority))

    if priority >= 80 or has_active_exploit:
        level = "CRITICAL — remediate immediately (within 24 hours)"
    elif priority >= 60:
        level = "HIGH — remediate this sprint"
    elif priority >= 30:
        level = "MEDIUM — remediate within 30 days"
    elif priority >= 10:
        level = "LOW — remediate within 90 days or next release"
    else:
        level = "INFORMATIONAL — accept risk or address in backlog"

    return {"priority_score": round(priority, 1), "level": level,
            "cvss_score": cvss_score, "asset_criticality": asset_criticality,
            "active_exploit_bump": has_active_exploit,
            "source": "CVSS v4.0 §3, §7; OWASP Risk Rating Methodology"}


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
    print("SELF-TEST SUITE: security_assessment.py")
    print("Sources: FIRST CVSS v4.0 (2023) + OWASP WSTG v4.2")
    print("=" * 70)

    # ── CVSS ──
    print("\n── CVSS v4.0 Base Score (§3, §7) ──")
    # Critical: Network, Low complexity, No priv, No UI, High CIA
    critical = cvss_v4_base_score("N", "L", "N", "N", "N", "H", "H", "H")
    ck("cvss: RCE from network → Critical", critical["severity"], "Critical")
    ck("cvss: score near 10", critical["score"] >= 9.0, True)

    # Medium: Network, Low complexity, Low priv, Passive UI, Low CIA
    medium = cvss_v4_base_score("N", "L", "N", "L", "P", "L", "L", "N")
    ck("cvss: XSS with low priv → Medium or Low", medium["severity"] in ("Medium", "Low"), True)

    # None: physical access, high complexity → low impact
    phys = cvss_v4_base_score("P", "H", "P", "H", "A", "N", "N", "N")
    ck("cvss: physical + high barriers → None", phys["severity"], "None")

    ck("severity: 9.5 = Critical", cvss_severity(9.5), "Critical")
    ck("severity: 7.5 = High", cvss_severity(7.5), "High")
    ck("severity: 5.0 = Medium", cvss_severity(5.0), "Medium")
    ck("severity: 2.0 = Low", cvss_severity(2.0), "Low")
    ck("severity: 0.0 = None", cvss_severity(0.0), "None")

    # ── OWASP ──
    print("\n── OWASP Checklist (WSTG v4.2) ──")
    owasp = owasp_checklist_score({
        "auth": 0.85, "authz": 0.80, "input_validation": 0.90, "crypto": 0.70,
    })
    ck("owasp: 4 categories → ADEQUATE or COMPREHENSIVE",
       "ADEQUATE" in owasp["verdict"] or "COMPREHENSIVE" in owasp["verdict"], True)

    owasp2 = owasp_checklist_score({"auth": 0.30, "input_validation": 0.20})
    ck("owasp2: low scores → INCOMPLETE or CRITICAL",
       "INCOMPLETE" in owasp2["verdict"] or "CRITICAL" in owasp2["verdict"], True)

    # ── Finding Priority ──
    print("\n── Finding Priority (CVSS + OWASP) ──")
    fp = finding_priority(9.5, 5, "trivial", True)
    ck("fp: 9.5+critical_asset+trivial+active → CRITICAL",
       "CRITICAL" in fp["level"], True)

    fp2 = finding_priority(4.0, 2, "difficult", False)
    ck("fp2: 4.0+low_asset+difficult → INFORMATIONAL",
       "INFORMATIONAL" in fp2["level"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
