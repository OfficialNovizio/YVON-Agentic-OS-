#!/usr/bin/env python3
"""
owasp_top10_2025.py — OWASP Top 10:2025 taxonomy + vulnerability classifier.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-07-29)
===================================================================

Primary source (institutional, free, CC BY 3.0):
  OWASP Top 10:2025
  https://owasp.org/Top10/2025/en/

  All ten category IDs, official titles, and canonical URL slugs
  extracted verbatim from the OWASP Top 10:2025 index.

Second source (§8.0 minimum-two-book):
  OWASP Application Security Verification Standard (ASVS) v5.0
  https://owasp.org/www-project-application-security-verification-standard/
  Cross-references the Top 10 categories to specific verification
  requirements. Used here as the pattern-mapping reference — the
  "commonly-referenced CWEs" per category are drawn from OWASP's own
  ASVS ↔ Top 10 cross-reference table.

===================================================================
ROUTES (§8.2)
===================================================================
  Route B: rule-based classifier mapping vulnerability description +
    optional CWE ID → OWASP Top 10:2025 category.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/bastion/custom/infra-vuln-management
    - Cybersecurity/cortex/custom/security-incident-response
    - Cybersecurity/warden/custom/risk-register
  Potential (§13.5 promotion basis):
    - Engineering/dev (security-code-review)
    - Engineering/aegis (application security)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every category ID + title cited verbatim from OWASP Top 10:2025.
- CWE mappings drawn from OWASP's own ASVS cross-reference; no invention.
- Ambiguous descriptions → return top-N candidates, never a false single match.
"""

import argparse
import json
import re
import sys
from typing import Any, Dict, List, Optional, Tuple


# ---------------- OWASP Top 10:2025 categories (verbatim) ----------------

CATEGORIES: Dict[str, Dict] = {
    "A01:2025": {
        "title": "Broken Access Control",
        "url": "https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/",
        "common_cwes": [22, 23, 35, 59, 200, 201, 219, 264, 275, 276, 284, 285, 352, 359, 377, 402, 425, 441, 497, 538, 540, 552, 566, 601, 639, 651, 668, 706, 862, 863, 913, 922, 1275],
        "keywords": ["access control", "authorization", "privilege", "IDOR", "insecure direct object reference", "path traversal", "directory traversal", "CORS", "csrf", "force browsing"],
    },
    "A02:2025": {
        "title": "Security Misconfiguration",
        "url": "https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/",
        "common_cwes": [2, 11, 13, 15, 16, 260, 315, 520, 526, 537, 541, 547, 611, 614, 756, 776, 942, 1004, 1032, 1174],
        "keywords": ["misconfiguration", "default credentials", "default password", "unnecessary features enabled", "verbose error", "stack trace", "unpatched", "outdated component", "hardening", "cloud misconfig", "S3 bucket public"],
    },
    "A03:2025": {
        "title": "Software Supply Chain Failures",
        "url": "https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/",
        "common_cwes": [829, 830, 1104, 1357, 1395],
        "keywords": ["supply chain", "dependency", "third-party library", "compromised package", "typosquat", "SBOM", "package registry", "vendored dependency", "transitive dependency"],
    },
    "A04:2025": {
        "title": "Cryptographic Failures",
        "url": "https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/",
        "common_cwes": [261, 296, 310, 319, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 335, 336, 337, 338, 340, 347, 523, 720, 757, 759, 760, 780, 818, 916],
        "keywords": ["cryptographic", "encryption", "weak cipher", "TLS", "SSL", "plaintext password", "hardcoded key", "weak hash", "MD5", "SHA1", "PII exposure", "sensitive data exposure"],
    },
    "A05:2025": {
        "title": "Injection",
        "url": "https://owasp.org/Top10/2025/A05_2025-Injection/",
        "common_cwes": [20, 74, 75, 77, 78, 79, 80, 83, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 99, 100, 113, 116, 138, 184, 470, 471, 564, 610, 643, 644, 652, 917],
        "keywords": ["injection", "SQL injection", "SQLi", "NoSQL injection", "command injection", "LDAP injection", "XSS", "cross-site scripting", "XXE", "SSRF", "template injection", "expression injection"],
    },
    "A06:2025": {
        "title": "Insecure Design",
        "url": "https://owasp.org/Top10/2025/A06_2025-Insecure_Design/",
        "common_cwes": [73, 183, 209, 213, 235, 256, 257, 266, 269, 280, 311, 312, 313, 316, 419, 430, 434, 444, 451, 472, 501, 522, 525, 539, 579, 598, 602, 642, 646, 650, 653, 656, 657, 799, 807, 840, 841, 927, 1021, 1173],
        "keywords": ["insecure design", "threat model", "business logic", "missing rate limit", "no authentication design", "insecure workflow", "design flaw"],
    },
    "A07:2025": {
        "title": "Authentication Failures",
        "url": "https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/",
        "common_cwes": [255, 259, 287, 288, 290, 294, 295, 297, 300, 302, 304, 306, 307, 346, 384, 521, 613, 620, 640, 798],
        "keywords": ["authentication", "auth", "credential stuffing", "weak password policy", "session fixation", "no MFA", "no rate limit on login", "brute force", "session token", "JWT"],
    },
    "A08:2025": {
        "title": "Software or Data Integrity Failures",
        "url": "https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/",
        "common_cwes": [345, 353, 426, 494, 502, 565, 784, 829, 830, 915],
        "keywords": ["integrity", "unsigned code", "insecure deserialization", "auto-update without verification", "CI/CD pipeline compromise", "unsigned firmware"],
    },
    "A09:2025": {
        "title": "Security Logging and Alerting Failures",
        "url": "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/",
        "common_cwes": [117, 223, 532, 778],
        "keywords": ["logging", "audit log", "no alerting", "log injection", "PII in logs", "insufficient logging", "no monitoring"],
    },
    "A10:2025": {
        "title": "Mishandling of Exceptional Conditions",
        "url": "https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/",
        "common_cwes": [209, 248, 388, 391, 393, 431, 617, 703, 754, 755, 756],
        "keywords": ["exception handling", "unchecked error", "swallowed exception", "error disclosure", "race condition on error", "fail-open"],
    },
}


# ---------------- Query interface (Route B) ----------------

def lookup(category_id: str) -> Optional[Dict]:
    """Return the category record or None."""
    return CATEGORIES.get(category_id)


def all_ids() -> List[str]:
    """All 10 category IDs in canonical order (A01→A10)."""
    return sorted(CATEGORIES.keys())


def by_cwe(cwe: int) -> List[str]:
    """Return OWASP Top 10:2025 categories that reference this CWE."""
    return sorted(
        cid for cid, rec in CATEGORIES.items() if cwe in rec["common_cwes"]
    )


def classify(description: str, cwe: Optional[int] = None) -> Dict[str, Any]:
    """Classify a vulnerability description → OWASP Top 10:2025 category (or top-N).

    Args:
      description: plain-language vulnerability description
      cwe: optional CWE ID for higher-confidence classification

    Returns:
      {matches: [{category_id, title, confidence, reason}],
       cwe_match: [cats mapped via CWE],
       cite}
    """
    matches: List[Tuple[str, float, str]] = []
    lower = description.lower()

    # CWE match takes precedence
    cwe_matches = by_cwe(cwe) if cwe is not None else []
    for cid in cwe_matches:
        matches.append((cid, 1.0, f"CWE-{cwe} maps to {cid}"))

    # Keyword match — score by count of matched keywords
    for cid, rec in CATEGORIES.items():
        hits = [kw for kw in rec["keywords"] if kw.lower() in lower]
        if hits:
            # Confidence: number of keyword hits / total keywords (capped)
            confidence = min(len(hits) / max(len(rec["keywords"]), 1) * 3, 0.9)
            reason = f"keyword hits: {hits}"
            # Boost if already matched by CWE
            if cid in cwe_matches:
                confidence = min(1.0, confidence + 0.5)
            matches.append((cid, round(confidence, 2), reason))

    # Deduplicate: keep highest-confidence entry per category
    seen: Dict[str, Tuple[float, str]] = {}
    for cid, conf, reason in matches:
        if cid not in seen or conf > seen[cid][0]:
            seen[cid] = (conf, reason)

    ranked = sorted(seen.items(), key=lambda kv: -kv[1][0])
    result_matches = [
        {
            "category_id": cid,
            "title": CATEGORIES[cid]["title"],
            "url": CATEGORIES[cid]["url"],
            "confidence": conf,
            "reason": reason,
        }
        for cid, (conf, reason) in ranked
    ]

    return {
        "matches": result_matches,
        "cwe_match": cwe_matches,
        "top_match": result_matches[0] if result_matches else None,
        "cite": "OWASP Top 10:2025 (https://owasp.org/Top10/2025/en/) — CC BY 3.0",
    }


# ---------------- Self-tests (playbook §5.2) ----------------

def _run_self_tests() -> None:
    # 1. Registry has exactly 10 categories
    assert len(CATEGORIES) == 10, f"expected 10 categories, got {len(CATEGORIES)}"
    print(f"[PASS] OWASP Top 10:2025 has {len(CATEGORIES)} categories (verbatim)")

    # 2. All IDs follow AXX:2025 format
    for cid in CATEGORIES:
        assert re.fullmatch(r"A\d{2}:2025", cid), f"malformed ID: {cid}"
    print("[PASS] all category IDs follow A01:2025-A10:2025 format")

    # 3. all_ids returns sorted order
    ids = all_ids()
    assert ids == sorted(ids)
    assert ids[0] == "A01:2025" and ids[-1] == "A10:2025"
    print(f"[PASS] all_ids: {ids[0]} → {ids[-1]}")

    # 4. Lookup A01 = Broken Access Control
    r = lookup("A01:2025")
    assert r["title"] == "Broken Access Control", r
    assert "access control" in r["keywords"][0].lower()
    print(f"[PASS] A01:2025 = {r['title']}")

    # 5. Classification: SQL injection → A05 Injection
    c = classify("Application vulnerable to SQL injection via login form", cwe=89)
    assert c["top_match"]["category_id"] == "A05:2025", c
    print(f"[PASS] SQL injection classifies to {c['top_match']['category_id']} ({c['top_match']['title']})")

    # 6. Classification: hardcoded password → A04 Cryptographic Failures (via CWE-798) or A07
    # CWE-798 → A07 (Authentication Failures per OWASP mapping)
    c = classify("Hardcoded credential found in source code", cwe=798)
    assert c["top_match"]["category_id"] == "A07:2025", c
    print(f"[PASS] CWE-798 classifies to {c['top_match']['category_id']}")

    # 7. Classification: dependency issue → A03 Supply Chain
    c = classify("Compromised npm package in transitive dependency")
    assert c["top_match"]["category_id"] == "A03:2025", c
    print(f"[PASS] compromised dependency classifies to {c['top_match']['category_id']}")

    # 8. Classification: no logging → A09
    c = classify("No audit logging for admin actions")
    assert c["top_match"]["category_id"] == "A09:2025", c
    print(f"[PASS] no logging classifies to {c['top_match']['category_id']}")

    # 9. Unknown vulnerability → empty matches
    c = classify("This is a random string unrelated to security")
    assert c["top_match"] is None or c["top_match"]["confidence"] < 0.3, c
    print("[PASS] unrelated description returns low-or-no matches")

    # 10. by_cwe returns correct categories
    # CWE-22 (path traversal) → A01 Broken Access Control
    r = by_cwe(22)
    assert "A01:2025" in r, r
    print(f"[PASS] CWE-22 (path traversal) maps to {r}")

    # 11. by_cwe for unknown CWE → empty
    r = by_cwe(99999999)
    assert r == [], r
    print("[PASS] unknown CWE returns empty")

    # 12. Every category has non-empty CWEs and keywords
    for cid, rec in CATEGORIES.items():
        assert rec["common_cwes"], f"{cid} has no CWEs"
        assert rec["keywords"], f"{cid} has no keywords"
        assert rec["url"].startswith("https://owasp.org/Top10/2025/"), rec["url"]
    print("[PASS] all 10 categories have CWEs, keywords, and canonical URLs")


def _main() -> int:
    p = argparse.ArgumentParser(description="OWASP Top 10:2025 classifier")
    p.add_argument("--lookup", help="category ID (e.g. A01:2025)")
    p.add_argument("--cwe", type=int, help="CWE ID to map")
    p.add_argument("--classify", help="vulnerability description to classify")
    p.add_argument("--list", action="store_true", help="list all categories")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.lookup, args.cwe, args.classify, args.list]):
        _run_self_tests()
        return 0

    if args.list:
        for cid in all_ids():
            rec = CATEGORIES[cid]
            print(f"  {cid} — {rec['title']}")
            print(f"    {rec['url']}")
        return 0

    if args.lookup:
        r = lookup(args.lookup)
        if r is None:
            print(f"{args.lookup!r} not found. IDs: {all_ids()}")
            return 1
        print(json.dumps({"id": args.lookup, **r}, indent=2))
        return 0

    if args.cwe:
        cats = by_cwe(args.cwe)
        print(f"CWE-{args.cwe} maps to OWASP Top 10:2025: {cats}")
        return 0

    if args.classify:
        r = classify(args.classify, cwe=args.cwe)
        print(json.dumps(r, indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
