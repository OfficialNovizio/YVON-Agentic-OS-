#!/usr/bin/env python3
"""
severity_score.py — compute infra vulnerability priority from CVSS + business context.

Owner: bastion (Cybersecurity / Infrastructure), skill: infra-vuln-management.
Computes a composite priority score = CVSS_severity_weight × asset_criticality_weight
× exploitability_weight, then maps to an SLA tier and recommended patch deadline.

CVSS severity → weight mapping:
  CRITICAL (9.0-10.0) = 4,  HIGH (7.0-8.9) = 3,  MEDIUM (4.0-6.9) = 2,  LOW (0.1-3.9) = 1

Asset criticality (per veil's classification or operator definition):
  RESTRICTED = 4,  CONFIDENTIAL = 3,  INTERNAL = 2,  PUBLIC = 1

Exploitability (is there a known exploit in the wild?):
  ACTIVE = 3 (exploit exists, CISA KEV, ransomware gang using it)
  PROOF_OF_CONCEPT = 2 (PoC published but no active exploitation seen)
  THEORETICAL = 1 (no known exploit path)

Priority score ranges: EMERGENCY (36-48) → 24h,  CRITICAL (24-35) → 7d,
HIGH (12-23) → 30d,  MEDIUM (6-11) → 90d,  LOW (0-5) → next cycle.

Usage:
  python3 severity_score.py --cvss 9.8 --criticality 4 --exploitability 3
  python3 severity_score.py --cvss 5.5 --criticality 3 --exploitability 1
  python3 severity_score.py --batch data.json  # [{cvss, asset_criticality, exploitability}, ...]
  python3 severity_score.py --test
Stdlib only. No network, no writes.
"""

import argparse, json, sys, math

CVSS_WEIGHTS = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
CRITICALITY_WEIGHTS = {"RESTRICTED": 4, "CONFIDENTIAL": 3, "INTERNAL": 2, "PUBLIC": 1}
EXPLOIT_WEIGHTS = {"ACTIVE": 3, "PROOF_OF_CONCEPT": 2, "THEORETICAL": 1}

SLA_MAP = [
    (36, "EMERGENCY", "24 hours"),
    (24, "CRITICAL", "7 days"),
    (12, "HIGH", "30 days"),
    (6, "MEDIUM", "90 days"),
    (0, "LOW", "next scheduled cycle"),
]


def cvss_level(score):
    """Map CVSS v3 score to severity level string."""
    if 9.0 <= score <= 10.0: return "CRITICAL"
    if 7.0 <= score <= 8.9: return "HIGH"
    if 4.0 <= score <= 6.9: return "MEDIUM"
    if 0.1 <= score <= 3.9: return "LOW"
    if score == 0.0: return "NONE"
    raise ValueError(f"CVSS score must be 0.0-10.0, got {score}")


def compute(cvss, asset_criticality, exploitability, criticality_scale=CRITICALITY_WEIGHTS):
    """Compute composite priority. Inputs are strings for severity/criticality, int for exploit."""
    sev = cvss_level(cvss)
    sev_w = CVSS_WEIGHTS[sev]
    crit_w = criticality_scale[asset_criticality]
    score = sev_w * crit_w * exploitability

    for threshold, label, sla in SLA_MAP:
        if score >= threshold:
            return {
                "cvss": cvss,
                "cvss_severity": sev,
                "asset_criticality": asset_criticality,
                "exploitability": exploitability,
                "priority_score": score,
                "priority_label": label,
                "patch_sla": sla,
                "note": "CVSS→weight mapping and SLA thresholds are reasoning-based (0.6); "
                        "confirm values with operator."
            }
    return {
        "cvss": cvss, "cvss_severity": sev,
        "asset_criticality": asset_criticality, "exploitability": exploitability,
        "priority_score": 0, "priority_label": "LOW", "patch_sla": "next cycle",
        "note": "CVSS→weight mapping and SLA thresholds are reasoning-based (0.6)."
    }


def batch(items):
    """Process a list of vuln items: [{cvss, asset_criticality, exploitability}, ...]."""
    return [compute(i["cvss"], i["asset_criticality"], i["exploitability"]) for i in items]


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True
    def check(name, cond):
        nonlocal ok; print(f"  [{'PASS' if cond else 'FAIL'}] {name}"); ok = ok and cond

    # 1. CVSS level mapping
    check("9.8 → CRITICAL", cvss_level(9.8) == "CRITICAL")
    check("7.5 → HIGH", cvss_level(7.5) == "HIGH")
    check("5.0 → MEDIUM", cvss_level(5.0) == "MEDIUM")
    check("2.0 → LOW", cvss_level(2.0) == "LOW")
    check("0.0 → NONE", cvss_level(0.0) == "NONE")

    # 2. Priority computation
    # Critical CVE on RESTRICTED asset with active exploit = 4*4*3 = 48 → EMERGENCY
    r1 = compute(9.8, "RESTRICTED", 3)
    check("9.8/RESTRICTED/active → EMERGENCY score 48", r1["priority_score"] == 48)
    check("9.8/RESTRICTED/active → EMERGENCY label", r1["priority_label"] == "EMERGENCY")
    check("9.8/RESTRICTED/active → 24h SLA", "24 hours" in r1["patch_sla"])

    # Low CVE on PUBLIC asset with theoretical exploit = 1*1*1 = 1 → LOW
    r2 = compute(2.0, "PUBLIC", 1)
    check("2.0/PUBLIC/theoretical → LOW score 1", r2["priority_score"] == 1)
    check("2.0/PUBLIC/theoretical → LOW label", r2["priority_label"] == "LOW")

    # Medium CVE on CONFIDENTIAL with PoC = 2*3*2 = 12 → HIGH
    r3 = compute(5.5, "CONFIDENTIAL", 2)
    check("5.5/CONFIDENTIAL/PoC → HIGH score 12", r3["priority_score"] == 12)
    check("5.5/CONFIDENTIAL/PoC → HIGH label", r3["priority_label"] == "HIGH")

    # 3. Boundary: score = 36 → EMERGENCY (>= threshold)
    r4 = compute(9.0, "RESTRICTED", 3)  # 4*4*3 = 36
    check("score=36 → EMERGENCY", r4["priority_label"] == "EMERGENCY")

    # 4. Batch processing
    items = [
        {"cvss": 9.8, "asset_criticality": "RESTRICTED", "exploitability": 3},
        {"cvss": 2.0, "asset_criticality": "PUBLIC", "exploitability": 1},
    ]
    results = batch(items)
    check("batch returns correct count", len(results) == 2)
    check("batch preserves order", results[0]["priority_label"] == "EMERGENCY")

    # 5. Rule-0.6 flag present
    check("0.6 flag in output", "reasoning-based" in r1["note"])

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="bastion vuln priority calculator")
    ap.add_argument("--cvss", type=float, help="CVSS v3 score (0.0-10.0)")
    ap.add_argument("--criticality", choices=list(CRITICALITY_WEIGHTS.keys()))
    ap.add_argument("--exploitability", type=int, choices=[1, 2, 3],
                    help="1=THEORETICAL 2=PoC 3=ACTIVE")
    ap.add_argument("--batch", help="JSON file: [{cvss, asset_criticality, exploitability}, ...]")
    ap.add_argument("--test", action="store_true")
    args = ap.parse_args()

    if args.test:
        return _run_tests()
    if args.batch:
        with open(args.batch) as f:
            print(json.dumps(batch(json.load(f)), indent=2))
        return 0
    if args.cvss is not None and args.criticality and args.exploitability:
        print(json.dumps(compute(args.cvss, args.criticality, args.exploitability), indent=2))
        return 0
    ap.error("provide --cvss + --criticality + --exploitability, or --batch, or --test")


if __name__ == "__main__":
    sys.exit(main())
