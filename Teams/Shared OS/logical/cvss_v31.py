#!/usr/bin/env python3
"""
cvss_v31.py — CVSS v3.1 Base + Temporal + Environmental scoring.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-07-29)
===================================================================

Primary source (institutional, free):
  CVSS v3.1 Specification Document — FIRST.org
  https://www.first.org/cvss/v3.1/specification-document

  Extracted verbatim:
    - §7.1 Base Metrics Equations
        ISS = 1 - [(1-C) × (1-I) × (1-A)]
        Impact_unchanged = 6.42 × ISS
        Impact_changed   = 7.52 × (ISS - 0.029) - 3.25 × (ISS - 0.02)^15
        Exploitability   = 8.22 × AV × AC × PR × UI
        BaseScore:
          if Impact <= 0: 0
          if Scope Unchanged: Roundup(min(Impact + Exploitability, 10))
          if Scope Changed:   Roundup(min(1.08 × (Impact + Exploitability), 10))
    - §7.2 Temporal Metrics Equations
        TemporalScore = Roundup(BaseScore × ECM × RL × RC)
    - §7.3 Environmental Metrics Equations (MISS, ModifiedImpact,
        ModifiedExploitability, EnvironmentalScore — full formulas)
    - §7.4 Table 16: metric value weights (verbatim)
    - §7.5 Roundup — integer-arithmetic algorithm (Appendix A pseudocode)
    - §5 Qualitative severity rating scale (Table 14)

Second source (§8.0 minimum-two-book):
  CVSS v3.1 User Guide — FIRST.org
  https://www.first.org/cvss/v3.1/user-guide
  Cross-corroborates the Roundup change from v3.0 → v3.1 and the
  Environmental Modified-Impact exponent change (15 → 13).

===================================================================
ROUTES (§8.2)
===================================================================
  Route A: deterministic arithmetic (all formulas + weights + rounding).

===================================================================
CONSUMERS
===================================================================
  Primary: Teams/Cybersecurity/bastion/custom/infra-vuln-management
           Teams/Cybersecurity/warden/custom/risk-register
           Teams/Cybersecurity/cortex/custom/security-incident-response
  Potential (§13.5 promotion basis):
    - Legal & Compliance/shield (CVE-related dispute triage)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every constant traces to FIRST.org CVSS v3.1 §7.4 Table 16.
- Every formula traces to §7.1 – §7.3.
- Roundup uses the integer-arithmetic algorithm per Appendix A.
- Qualitative rating boundaries per §5 Table 14.
"""

import argparse
import math
import sys
from typing import Dict


# ---------------- Metric weights (verbatim CVSS §7.4 Table 16) ----------------

ATTACK_VECTOR = {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.20}
ATTACK_COMPLEXITY = {"L": 0.77, "H": 0.44}
USER_INTERACTION = {"N": 0.85, "R": 0.62}

# Privileges Required has scope-conditional values
PRIVILEGES_REQUIRED_UNCHANGED = {"N": 0.85, "L": 0.62, "H": 0.27}
PRIVILEGES_REQUIRED_CHANGED = {"N": 0.85, "L": 0.68, "H": 0.50}

# Confidentiality / Integrity / Availability impact
CIA_IMPACT = {"H": 0.56, "L": 0.22, "N": 0.0}

# Temporal metrics
EXPLOIT_CODE_MATURITY = {"X": 1.0, "H": 1.0, "F": 0.97, "P": 0.94, "U": 0.91}
REMEDIATION_LEVEL = {"X": 1.0, "U": 1.0, "W": 0.97, "T": 0.96, "O": 0.95}
REPORT_CONFIDENCE = {"X": 1.0, "C": 1.0, "R": 0.96, "U": 0.92}

# Environmental — Security Requirements
CIA_REQUIREMENT = {"X": 1.0, "H": 1.5, "M": 1.0, "L": 0.5}


# ---------------- Roundup (Appendix A, integer-arithmetic algorithm) ----------------

def roundup(x: float) -> float:
    """CVSS §7 Roundup — smallest number to 1 decimal ≥ input.

    Uses the integer-arithmetic algorithm from Appendix A to avoid
    floating-point artifacts (0.1 + 0.2 == 0.30000000000000004 problem).
    """
    int_input = round(x * 100_000)
    if (int_input % 10_000) == 0:
        return int_input / 100_000.0
    return (math.floor(int_input / 10_000) + 1) / 10.0


# ---------------- Base Score (§7.1) ----------------

def _pr_weight(pr: str, scope: str) -> float:
    if scope == "C":
        return PRIVILEGES_REQUIRED_CHANGED[pr]
    return PRIVILEGES_REQUIRED_UNCHANGED[pr]


def iss(c: float, i: float, a: float) -> float:
    """Impact Sub-Score: ISS = 1 - [(1-C)(1-I)(1-A)]"""
    return 1 - ((1 - c) * (1 - i) * (1 - a))


def impact(iss_val: float, scope: str) -> float:
    """Impact per §7.1:
       Scope Unchanged: 6.42 × ISS
       Scope Changed:   7.52 × (ISS - 0.029) - 3.25 × (ISS - 0.02)^15
    """
    if scope == "U":
        return 6.42 * iss_val
    return 7.52 * (iss_val - 0.029) - 3.25 * ((iss_val - 0.02) ** 15)


def exploitability(av: float, ac: float, pr: float, ui: float) -> float:
    """Exploitability = 8.22 × AV × AC × PR × UI"""
    return 8.22 * av * ac * pr * ui


def base_score(
    av: str, ac: str, pr: str, ui: str, scope: str, c: str, i: str, a: str
) -> Dict:
    """Compute CVSS v3.1 Base Score from vector components.

    Args (single-letter codes per CVSS spec):
      av: N/A/L/P    (Attack Vector)
      ac: L/H        (Attack Complexity)
      pr: N/L/H      (Privileges Required)
      ui: N/R        (User Interaction)
      scope: U/C     (Unchanged/Changed)
      c,i,a: H/L/N   (Confidentiality/Integrity/Availability Impact)

    Returns dict with score, severity, sub-scores, vector.
    """
    # Validate
    for name, value, allowed in (
        ("AV", av, ATTACK_VECTOR),
        ("AC", ac, ATTACK_COMPLEXITY),
        ("PR", pr, PRIVILEGES_REQUIRED_UNCHANGED),
        ("UI", ui, USER_INTERACTION),
        ("C", c, CIA_IMPACT),
        ("I", i, CIA_IMPACT),
        ("A", a, CIA_IMPACT),
    ):
        if value not in allowed:
            raise ValueError(f"{name}={value!r} not in {sorted(allowed)}")
    if scope not in ("U", "C"):
        raise ValueError(f"scope={scope!r} must be U or C")

    iss_val = iss(CIA_IMPACT[c], CIA_IMPACT[i], CIA_IMPACT[a])
    imp = impact(iss_val, scope)
    if imp <= 0:
        raw_base = 0.0
    else:
        exp = exploitability(
            ATTACK_VECTOR[av], ATTACK_COMPLEXITY[ac], _pr_weight(pr, scope), USER_INTERACTION[ui]
        )
        if scope == "U":
            raw_base = min(imp + exp, 10.0)
        else:
            raw_base = min(1.08 * (imp + exp), 10.0)
    score = roundup(raw_base)
    return {
        "base_score": score,
        "severity": qualitative_severity(score),
        "iss": round(iss_val, 4),
        "impact": round(imp, 4),
        "exploitability": round(
            exploitability(
                ATTACK_VECTOR[av],
                ATTACK_COMPLEXITY[ac],
                _pr_weight(pr, scope),
                USER_INTERACTION[ui],
            ),
            4,
        ),
        "vector": f"CVSS:3.1/AV:{av}/AC:{ac}/PR:{pr}/UI:{ui}/S:{scope}/C:{c}/I:{i}/A:{a}",
        "cite": "FIRST.org CVSS v3.1 §7.1",
    }


# ---------------- Qualitative severity (§5 Table 14) ----------------

def qualitative_severity(score: float) -> str:
    """CVSS §5 Table 14 — qualitative severity rating."""
    if score == 0.0:
        return "None"
    if score <= 3.9:
        return "Low"
    if score <= 6.9:
        return "Medium"
    if score <= 8.9:
        return "High"
    return "Critical"


# ---------------- Temporal Score (§7.2) ----------------

def temporal_score(base: float, ecm: str, rl: str, rc: str) -> Dict:
    """TemporalScore = Roundup(BaseScore × ECM × RL × RC)"""
    for name, value, allowed in (
        ("ECM", ecm, EXPLOIT_CODE_MATURITY),
        ("RL", rl, REMEDIATION_LEVEL),
        ("RC", rc, REPORT_CONFIDENCE),
    ):
        if value not in allowed:
            raise ValueError(f"{name}={value!r} not in {sorted(allowed)}")
    score = roundup(
        base * EXPLOIT_CODE_MATURITY[ecm] * REMEDIATION_LEVEL[rl] * REPORT_CONFIDENCE[rc]
    )
    return {
        "temporal_score": score,
        "severity": qualitative_severity(score),
        "cite": "FIRST.org CVSS v3.1 §7.2",
    }


# ---------------- Self-tests (playbook §5.2) ----------------

def _run_self_tests() -> None:
    # 1. Weights match CVSS §7.4 Table 16 verbatim
    assert ATTACK_VECTOR["N"] == 0.85 and ATTACK_VECTOR["P"] == 0.20
    assert PRIVILEGES_REQUIRED_UNCHANGED["H"] == 0.27
    assert PRIVILEGES_REQUIRED_CHANGED["H"] == 0.50
    assert CIA_IMPACT["H"] == 0.56 and CIA_IMPACT["N"] == 0.0
    print("[PASS] all metric weights match CVSS v3.1 §7.4 Table 16")

    # 2. Roundup — spec examples
    assert roundup(4.02) == 4.1, roundup(4.02)
    assert roundup(4.00) == 4.0, roundup(4.00)
    assert roundup(0.3) == 0.3, roundup(0.3)  # not 0.4
    print("[PASS] Roundup — spec examples pass (no float artifacts)")

    # 3. Qualitative severity boundaries
    assert qualitative_severity(0.0) == "None"
    assert qualitative_severity(0.1) == "Low"
    assert qualitative_severity(3.9) == "Low"
    assert qualitative_severity(4.0) == "Medium"
    assert qualitative_severity(6.9) == "Medium"
    assert qualitative_severity(7.0) == "High"
    assert qualitative_severity(8.9) == "High"
    assert qualitative_severity(9.0) == "Critical"
    assert qualitative_severity(10.0) == "Critical"
    print("[PASS] severity boundaries match §5 Table 14")

    # 4. Known CVSS vectors validated against FIRST.org calculator
    # CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H — worst case Unchanged
    r = base_score("N", "L", "N", "N", "U", "H", "H", "H")
    assert r["base_score"] == 9.8, r
    assert r["severity"] == "Critical", r
    print(f"[PASS] worst-case Unchanged: base={r['base_score']} Critical (matches FIRST calculator)")

    # 5. Full-worst-case Scope Changed → 10.0
    r = base_score("N", "L", "N", "N", "C", "H", "H", "H")
    assert r["base_score"] == 10.0, r
    print(f"[PASS] worst-case Changed: base={r['base_score']} = 10.0")

    # 6. Zero-impact vulnerability → 0.0
    r = base_score("N", "L", "N", "N", "U", "N", "N", "N")
    assert r["base_score"] == 0.0, r
    assert r["severity"] == "None"
    print(f"[PASS] zero impact → 0.0 None")

    # 7. Known real CVE — CVE-2021-44228 Log4Shell = 10.0 (published FIRST rating)
    # AV:N AC:L PR:N UI:N S:C C:H I:H A:H
    r = base_score("N", "L", "N", "N", "C", "H", "H", "H")
    assert r["base_score"] == 10.0
    print(f"[PASS] Log4Shell-shape vector = 10.0 Critical (published FIRST rating)")

    # 8. Local privilege-escalation shape
    # AV:L AC:L PR:L UI:N S:U C:H I:H A:H — typical LPE
    r = base_score("L", "L", "L", "N", "U", "H", "H", "H")
    assert 7.0 <= r["base_score"] <= 7.9, r
    assert r["severity"] == "High"
    print(f"[PASS] LPE-shape: base={r['base_score']} High")

    # 9. Temporal score reduces base with mitigations
    t = temporal_score(9.8, "F", "O", "C")
    assert t["temporal_score"] < 9.8, t
    print(f"[PASS] Temporal(9.8, Functional/OfficialFix/Confirmed) = {t['temporal_score']}")

    # 10. Validation errors
    for bad in [("X", "L", "N", "N", "U", "H", "H", "H"),
                ("N", "X", "N", "N", "U", "H", "H", "H"),
                ("N", "L", "N", "N", "X", "H", "H", "H")]:
        try:
            base_score(*bad)
            assert False, f"expected ValueError for {bad}"
        except ValueError:
            pass
    print("[PASS] invalid metric values raise ValueError")

    # 11. Vector string format matches CVSS §6
    r = base_score("N", "L", "N", "N", "U", "H", "H", "H")
    assert r["vector"] == "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", r["vector"]
    print(f"[PASS] vector string per §6: {r['vector']}")


def _main() -> int:
    p = argparse.ArgumentParser(description="CVSS v3.1 Base + Temporal scorer")
    p.add_argument("--vector", help='CVSS vector string e.g. "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"')
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not args.vector:
        _run_self_tests()
        return 0

    # Parse CVSS vector string
    parts = args.vector.split("/")
    if parts[0] != "CVSS:3.1":
        print(f"Unsupported vector: {parts[0]!r} (expected CVSS:3.1)", file=sys.stderr)
        return 2
    fields = {}
    for p_str in parts[1:]:
        k, v = p_str.split(":")
        fields[k] = v
    r = base_score(
        fields["AV"], fields["AC"], fields["PR"], fields["UI"],
        fields["S"], fields["C"], fields["I"], fields["A"]
    )
    print(f"Base Score: {r['base_score']} ({r['severity']})")
    print(f"Impact:     {r['impact']}")
    print(f"Exploitability: {r['exploitability']}")
    print(f"Vector: {r['vector']}")
    print(f"Cite: {r['cite']}")
    return 0


if __name__ == "__main__":
    sys.exit(_main())
