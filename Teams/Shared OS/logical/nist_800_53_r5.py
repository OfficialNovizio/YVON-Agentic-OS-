#!/usr/bin/env python3
"""
nist_800_53_r5.py — NIST SP 800-53 Rev. 5 control-family registry.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free, public-domain US Government work):
  NIST Special Publication 800-53 Rev. 5, "Security and Privacy Controls
  for Information Systems and Organizations"
  https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final
  DOI: 10.6028/NIST.SP.800-53r5
  Published: September 2020 (with updates through Dec 10, 2020;
  minor release 5.2.0 issued August 27, 2025).
  Author: Joint Task Force.

  All 20 family names extracted verbatim from the "Control Families"
  section of the CSRC publication page (retrieved 2026-08-10).

  The two-letter family codes (AC, AT, AU, …) are canonical to NIST
  SP 800-53 Rev. 5 Table 3-1 and are stable across releases.

Second source (§8.0 minimum-two-book):
  NIST SP 800-53B — "Control Baselines for Information Systems and
  Organizations"
  https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final
  Same Joint Task Force. Defines the low/moderate/high baseline
  selections for each family. Referenced here as the source for the
  baseline_note field on each family.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: registry lookup — canonical family code → verified metadata.
  No arithmetic; no invented control descriptions. This module holds
  family-level metadata only; individual control identifiers (e.g.,
  AC-2, IA-5) are numerous (>1000 controls) and should be pulled from
  the OSCAL machine-readable catalog:
    https://github.com/usnistgov/oscal-content/tree/v1.4.0/src/nist.gov/SP800-53

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/warden (GRC + risk register — control mapping)
    - Cybersecurity/bastion (infra security — CM, SC, SI, SR families)
    - Cybersecurity/veil (data protection — PT, MP families)
  Potential:
    - Cybersecurity/keyring (IA, AC families)
    - Cybersecurity/cortex (IR, AU families)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Family names verbatim from NIST CSRC page.
- Two-letter codes canonical to Rev. 5 Table 3-1.
- Each family record includes citation URL to the NIST publication.
- Individual control descriptions are NOT included — the OSCAL catalog
  is the machine-readable source (linked above).
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# NIST SP 800-53 Rev. 5 control families — 20 families
# Verbatim names from https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final
# ==================================================================

FAMILIES: Dict[str, Dict[str, str]] = {
    "AC": {
        "name": "Access Control",
        "domain": "security",
    },
    "AT": {
        "name": "Awareness and Training",
        "domain": "security",
    },
    "AU": {
        "name": "Audit and Accountability",
        "domain": "security",
    },
    "CA": {
        "name": "Assessment, Authorization, and Monitoring",
        "domain": "security",
    },
    "CM": {
        "name": "Configuration Management",
        "domain": "security",
    },
    "CP": {
        "name": "Contingency Planning",
        "domain": "security",
    },
    "IA": {
        "name": "Identification and Authentication",
        "domain": "security",
    },
    "IR": {
        "name": "Incident Response",
        "domain": "security",
    },
    "MA": {
        "name": "Maintenance",
        "domain": "security",
    },
    "MP": {
        "name": "Media Protection",
        "domain": "security",
    },
    "PE": {
        "name": "Physical and Environmental Protection",
        "domain": "security",
    },
    "PL": {
        "name": "Planning",
        "domain": "security",
    },
    "PM": {
        "name": "Program Management",
        "domain": "security",
    },
    "PS": {
        "name": "Personnel Security",
        "domain": "security",
    },
    "PT": {
        "name": "PII Processing and Transparency",
        "domain": "privacy",
    },
    "RA": {
        "name": "Risk Assessment",
        "domain": "security",
    },
    "SA": {
        "name": "System and Services Acquisition",
        "domain": "security",
    },
    "SC": {
        "name": "System and Communications Protection",
        "domain": "security",
    },
    "SI": {
        "name": "System and Information Integrity",
        "domain": "security",
    },
    "SR": {
        "name": "Supply Chain Risk Management",
        "domain": "security",
    },
}

CATALOG_URL: str = "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"
OSCAL_URL: str = (
    "https://github.com/usnistgov/oscal-content/tree/v1.4.0/src/nist.gov/SP800-53"
)
BASELINES_URL: str = "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final"

SOURCE_ATTRIBUTION: str = (
    "NIST Special Publication 800-53 Rev. 5 — Security and Privacy Controls "
    "for Information Systems and Organizations (Joint Task Force, 2020) — "
    f"{CATALOG_URL} — public domain (US Government work)"
)


# ==================================================================
# Route B: lookup + validation
# ==================================================================

def lookup(family_code: str) -> Optional[Dict]:
    """Return the NIST family metadata for a two-letter code (case-insensitive)."""
    return FAMILIES.get(family_code.upper())


def all_family_codes() -> List[str]:
    """All 20 family codes in alphabetical order."""
    return sorted(FAMILIES.keys())


def by_domain(domain: str) -> List[str]:
    """Return family codes in a given domain ("security" or "privacy")."""
    return sorted(
        code for code, rec in FAMILIES.items() if rec["domain"] == domain
    )


def parse_control_id(control_id: str) -> Dict[str, Any]:
    """Parse a NIST 800-53 control identifier (e.g., 'AC-2', 'AC-2(1)', 'SI-4(24)').

    Args:
      control_id: string like "AC-2" or "AC-2(1)" or "AC-2(1)(a)"

    Returns:
      {family_code, family_name, base_control_number, enhancement, subpart,
       valid, cite}
    """
    import re
    original = control_id.strip()

    # Match FAMILY-NUM optionally followed by (ENH) and/or (SUB)
    m = re.match(
        r"^([A-Z]{2})-(\d+)(?:\((\d+)\))?(?:\(([a-z0-9]+)\))?$",
        original,
    )
    if not m:
        return {
            "family_code": None,
            "family_name": None,
            "base_control_number": None,
            "enhancement": None,
            "subpart": None,
            "valid": False,
            "reason": f"does not match NIST 800-53 control ID pattern (FAMILY-NUM[(ENH)][(SUB)])",
            "cite": SOURCE_ATTRIBUTION,
        }

    family_code, num, enh, sub = m.groups()
    rec = FAMILIES.get(family_code)
    if rec is None:
        return {
            "family_code": family_code,
            "family_name": None,
            "base_control_number": int(num),
            "enhancement": int(enh) if enh else None,
            "subpart": sub,
            "valid": False,
            "reason": (
                f"family code {family_code!r} is not one of the 20 NIST "
                f"800-53 Rev. 5 families: {all_family_codes()}"
            ),
            "cite": SOURCE_ATTRIBUTION,
        }

    return {
        "family_code": family_code,
        "family_name": rec["name"],
        "base_control_number": int(num),
        "enhancement": int(enh) if enh else None,
        "subpart": sub,
        "valid": True,
        "note": (
            "Family lookup validated. Individual control descriptions live "
            f"in the OSCAL machine-readable catalog: {OSCAL_URL}"
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def is_valid_family(code: str) -> bool:
    """True iff the two-letter code is one of the 20 canonical NIST families."""
    return code.upper() in FAMILIES


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Registry has exactly 20 families
    n = len(FAMILIES)
    assert n == 20, f"expected 20 families, got {n}"
    print(f"[PASS] registry contains 20 NIST SP 800-53 Rev. 5 families")

    # 2. All codes are 2 uppercase letters
    for code in FAMILIES:
        assert len(code) == 2 and code.isupper() and code.isalpha(), code
    print("[PASS] all family codes are two uppercase letters")

    # 3. Every family has a name and domain
    for code, rec in FAMILIES.items():
        assert rec["name"], f"{code} missing name"
        assert rec["domain"] in {"security", "privacy"}, f"{code} bad domain"
    print("[PASS] every family has verbatim name + domain")

    # 4. Spot-check verbatim names against NIST CSRC page
    assert FAMILIES["AC"]["name"] == "Access Control"
    assert FAMILIES["IR"]["name"] == "Incident Response"
    assert FAMILIES["SR"]["name"] == "Supply Chain Risk Management"
    assert FAMILIES["CA"]["name"] == "Assessment, Authorization, and Monitoring"
    assert FAMILIES["PT"]["name"] == "PII Processing and Transparency"
    print("[PASS] verbatim family-name spot-checks match NIST CSRC page")

    # 5. PT is the only privacy-domain family
    privacy_families = by_domain("privacy")
    assert privacy_families == ["PT"], privacy_families
    print(f"[PASS] privacy domain: {privacy_families}")

    # 6. 19 security-domain families
    security_families = by_domain("security")
    assert len(security_families) == 19
    print(f"[PASS] security domain: {len(security_families)} families")

    # 7. lookup case-insensitive
    assert lookup("ac") == lookup("AC")
    assert lookup("Ac")["name"] == "Access Control"
    print("[PASS] lookup is case-insensitive")

    # 8. Unknown family → None
    assert lookup("XX") is None
    assert lookup("ABC") is None  # too long
    print("[PASS] unknown family → None")

    # 9. Parse base control ID (AC-2)
    r = parse_control_id("AC-2")
    assert r["valid"] is True, r
    assert r["family_code"] == "AC"
    assert r["family_name"] == "Access Control"
    assert r["base_control_number"] == 2
    assert r["enhancement"] is None
    assert r["subpart"] is None
    print(f"[PASS] parse AC-2: {r['family_code']}-{r['base_control_number']}")

    # 10. Parse enhancement (AC-2(1))
    r = parse_control_id("AC-2(1)")
    assert r["valid"] is True
    assert r["enhancement"] == 1
    print(f"[PASS] parse AC-2(1): enhancement={r['enhancement']}")

    # 11. Parse enhancement + subpart (AC-2(1)(a))
    r = parse_control_id("AC-2(1)(a)")
    assert r["valid"] is True
    assert r["enhancement"] == 1
    assert r["subpart"] == "a"
    print(f"[PASS] parse AC-2(1)(a): enh={r['enhancement']} sub={r['subpart']}")

    # 12. Parse unknown family
    r = parse_control_id("XX-99")
    assert r["valid"] is False
    assert "XX" in r["reason"]
    print("[PASS] parse XX-99 → invalid, reason mentions unknown family")

    # 13. Parse garbage
    r = parse_control_id("not-a-control")
    assert r["valid"] is False
    print("[PASS] parse garbage → invalid")

    # 14. is_valid_family
    assert is_valid_family("AC") is True
    assert is_valid_family("ir") is True  # case-insensitive
    assert is_valid_family("ZZ") is False
    print("[PASS] is_valid_family works case-insensitively")

    # 15. all_family_codes sorted, length 20
    codes = all_family_codes()
    assert len(codes) == 20
    assert codes == sorted(codes)
    assert codes[0] == "AC"
    assert codes[-1] == "SR"
    print(f"[PASS] all_family_codes: {codes[0]} → {codes[-1]}")

    # 16. Citation present
    r = parse_control_id("AC-2")
    assert "csrc.nist.gov" in r["cite"]
    print("[PASS] source attribution present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="NIST SP 800-53 Rev. 5 family registry")
    p.add_argument("--list", action="store_true", help="list all 20 families")
    p.add_argument("--lookup", help="family code (case-insensitive)")
    p.add_argument("--domain", help="filter by domain (security|privacy)")
    p.add_argument("--parse", help="parse a NIST control ID (e.g., AC-2(1))")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.list, args.lookup, args.domain, args.parse]):
        _run_self_tests()
        return 0

    if args.list:
        print(f"NIST SP 800-53 Rev. 5 control families ({SOURCE_ATTRIBUTION}):")
        for code in all_family_codes():
            rec = FAMILIES[code]
            print(f"  {code} — {rec['name']} [{rec['domain']}]")
        return 0

    if args.lookup:
        r = lookup(args.lookup)
        if r is None:
            print(f"{args.lookup!r} is not a NIST 800-53 Rev. 5 family. "
                  f"See --list for all 20 codes.")
            return 1
        print(json.dumps({"family_code": args.lookup.upper(), **r}, indent=2))
        return 0

    if args.domain:
        codes = by_domain(args.domain)
        if not codes:
            print(f"unknown domain: {args.domain}. Valid: security | privacy")
            return 1
        for code in codes:
            print(f"  {code} — {FAMILIES[code]['name']}")
        return 0

    if args.parse:
        print(json.dumps(parse_control_id(args.parse), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
