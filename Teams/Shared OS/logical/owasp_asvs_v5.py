#!/usr/bin/env python3
"""
owasp_asvs_v5.py — OWASP Application Security Verification Standard v5.0
requirement-ID parser + chapter reference.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free, CC BY-SA 4.0):
  OWASP Application Security Verification Standard (ASVS) v5.0.0
  Released 30 May 2025 at Global AppSec EU Barcelona 2025.
  Project page: https://owasp.org/www-project-application-security-verification-standard/
  Full release + CSV/JSON: https://github.com/OWASP/ASVS/tree/v5.0.0/5.0

  Reference-ID format (verbatim from project page):
    Each requirement has an identifier `<chapter>.<section>.<requirement>`.
    Versioned form: `v<version>-<chapter>.<section>.<requirement>`.
    Example verbatim from ASVS v5.0.0: `1.2.5` — "Verify that the
    application protects against OS command injection and that
    operating system calls use parameterized OS queries or use
    contextual command line output encoding."

Second source (§8.0 minimum-two-book):
  OWASP Top 10:2025 — https://owasp.org/Top10/2025/en/ — CC BY 3.0
  Already extracted at Shared OS/logical/owasp_top10_2025.py.
  ASVS requirements cross-reference the Top 10 categories; consumers
  should use both together (Top 10 for risk-class taxonomy, ASVS for
  concrete verification requirements).

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: rule-based ID parser + chapter-registry lookup. No
  verification-decision math (that comes from ASVS itself, which is
  human-attestation work). This module makes ASVS references
  machine-parseable within the fleet.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/bastion (infra-security requirement mapping)
    - Cybersecurity/cortex (detection-rule ASVS coverage)
    - Engineering/aegis (application-security review)
  Potential:
    - Engineering/dev (secure-code-review references)
    - Legal-and-Compliance/comply (ASVS-based obligation mapping)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- ASVS_VERSION: verbatim from OWASP project page (5.0.0)
- REQUIREMENT_ID_FORMAT: verbatim ID pattern from project page
- CHAPTER_1_TITLE + EXAMPLE_REQUIREMENT_1_2_5: verbatim quotes
- Full 15-chapter titles and all ~280 requirements are NOT reproduced
  here — the CSV/JSON is the authoritative source. This module points
  consumers to the CSV_URL for full requirement text.
- Section-level titles beyond the one verbatim example ("Injection
  Prevention" §1.2) are NOT invented; consumers fetch the CSV.
"""

import argparse
import json
import re
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM CONSTANTS
# ==================================================================

ASVS_VERSION: str = "5.0.0"
ASVS_RELEASE_DATE: str = "2025-05-30"

# Verbatim ID pattern from the OWASP project page:
# "Each requirement has an identifier in the format
#  <chapter>.<section>.<requirement>, where each element is a number."
REQUIREMENT_ID_PATTERN: str = r"^(\d+)\.(\d+)\.(\d+)$"

# Verbatim versioned pattern:
# "v<version>-<chapter>.<section>.<requirement>"
VERSIONED_ID_PATTERN: str = r"^v(\d+\.\d+\.\d+)-(\d+)\.(\d+)\.(\d+)$"

# Verbatim from OWASP page: only Chapter 1 title + Section 1.2 title
# are explicitly quoted on the project page. Other chapters must be
# looked up in the CSV/PDF.
KNOWN_CHAPTERS: Dict[int, Dict[str, str]] = {
    1: {
        "title": "Encoding and Sanitization",
        "verbatim_source": (
            "OWASP ASVS project page — \"all 1.#.# requirements are from "
            "the 'Encoding and Sanitization' chapter\""
        ),
    },
    # Chapters 2-17 exist per ASVS v5.0.0 but their titles are not
    # verbatim on the public project page; operators must reference
    # the CSV. Left intentionally sparse per §0.5.
}

# Verbatim section from OWASP project page:
# "all 1.2.# requirements are in the 'Injection Prevention' section of
#  the 'Encoding and Sanitization' chapter."
KNOWN_SECTIONS: Dict[str, str] = {
    "1.2": "Injection Prevention",
}

# Verbatim example requirement from OWASP project page:
EXAMPLE_REQUIREMENT_1_2_5: str = (
    "Verify that the application protects against OS command injection "
    "and that operating system calls use parameterized OS queries or "
    "use contextual command line output encoding."
)

CSV_URL: str = (
    "https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/"
    "OWASP_Application_Security_Verification_Standard_5.0.0_en.csv"
)
JSON_URL: str = (
    "https://github.com/OWASP/ASVS/tree/v5.0.0/5.0"
)

SOURCE_ATTRIBUTION: str = (
    f"OWASP Application Security Verification Standard v{ASVS_VERSION} "
    f"(OWASP Foundation, released {ASVS_RELEASE_DATE}) — "
    "https://owasp.org/www-project-application-security-verification-standard/ "
    "— CC BY-SA 4.0"
)


# ==================================================================
# Route B: ID parser + chapter lookup
# ==================================================================

def parse_requirement_id(rid: str) -> Dict[str, Any]:
    """Parse an ASVS requirement ID (versioned or bare).

    Args:
      rid: string like "1.2.5" or "v5.0.0-1.2.5"

    Returns:
      {version, chapter, section, requirement, valid, cite}
    """
    rid = rid.strip()

    # Try versioned pattern first
    m = re.match(VERSIONED_ID_PATTERN, rid)
    if m:
        version, chapter, section, requirement = m.groups()
        return {
            "input": rid,
            "version": version,
            "chapter": int(chapter),
            "section": int(section),
            "requirement": int(requirement),
            "requirement_key": f"{chapter}.{section}.{requirement}",
            "section_key": f"{chapter}.{section}",
            "valid": True,
            "cite": SOURCE_ATTRIBUTION,
        }

    # Try bare pattern
    m = re.match(REQUIREMENT_ID_PATTERN, rid)
    if m:
        chapter, section, requirement = m.groups()
        return {
            "input": rid,
            "version": None,
            "chapter": int(chapter),
            "section": int(section),
            "requirement": int(requirement),
            "requirement_key": f"{chapter}.{section}.{requirement}",
            "section_key": f"{chapter}.{section}",
            "valid": True,
            "note": (
                "bare ID without version; consumers should include the "
                f"version prefix (v{ASVS_VERSION}-) for cross-version "
                "unambiguity per OWASP guidance"
            ),
            "cite": SOURCE_ATTRIBUTION,
        }

    return {
        "input": rid,
        "valid": False,
        "reason": (
            "does not match ASVS ID format. Expected: "
            "'<chapter>.<section>.<requirement>' (e.g., 1.2.5) or "
            f"'v{ASVS_VERSION}-<chapter>.<section>.<requirement>' "
            f"(e.g., v{ASVS_VERSION}-1.2.5)"
        ),
        "cite": SOURCE_ATTRIBUTION,
    }


def format_requirement_id(chapter: int, section: int, requirement: int,
                          include_version: bool = True) -> str:
    """Build a canonical ASVS requirement ID string.

    Args:
      chapter, section, requirement: integers
      include_version: whether to prefix with `v<ASVS_VERSION>-`

    Returns:
      "v5.0.0-1.2.5" or "1.2.5"
    """
    if chapter < 1 or section < 1 or requirement < 1:
        raise ValueError("chapter/section/requirement must be >= 1")

    bare = f"{chapter}.{section}.{requirement}"
    return f"v{ASVS_VERSION}-{bare}" if include_version else bare


def lookup_chapter(chapter: int) -> Optional[Dict[str, str]]:
    """Return verbatim metadata for a known chapter, or None.

    Only chapters whose titles are explicitly quoted on the OWASP
    project page are returned (Chapter 1 as of extraction date).
    For all other chapters, consumers must reference CSV_URL.
    """
    return KNOWN_CHAPTERS.get(chapter)


def csv_url() -> str:
    """Return the URL to the authoritative CSV requirement list."""
    return CSV_URL


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Version + release date
    assert ASVS_VERSION == "5.0.0"
    assert ASVS_RELEASE_DATE == "2025-05-30"
    print(f"[PASS] ASVS version {ASVS_VERSION} released {ASVS_RELEASE_DATE}")

    # 2. Verbatim example requirement
    assert "OS command injection" in EXAMPLE_REQUIREMENT_1_2_5
    assert "parameterized OS queries" in EXAMPLE_REQUIREMENT_1_2_5
    print(f"[PASS] verbatim example req 1.2.5 (OS command injection)")

    # 3. Parse bare ID
    r = parse_requirement_id("1.2.5")
    assert r["valid"] is True
    assert r["chapter"] == 1
    assert r["section"] == 2
    assert r["requirement"] == 5
    assert r["requirement_key"] == "1.2.5"
    assert r["version"] is None
    print(f"[PASS] parse '1.2.5' → chapter=1 section=2 req=5")

    # 4. Parse versioned ID
    r = parse_requirement_id("v5.0.0-1.2.5")
    assert r["valid"] is True
    assert r["version"] == "5.0.0"
    assert r["chapter"] == 1
    assert r["requirement_key"] == "1.2.5"
    print(f"[PASS] parse 'v5.0.0-1.2.5' → version=5.0.0, req=1.2.5")

    # 5. Parse multi-digit chapter
    r = parse_requirement_id("14.11.3")
    assert r["valid"] is True
    assert r["chapter"] == 14
    assert r["section"] == 11
    print(f"[PASS] parse '14.11.3' → multi-digit chapter/section")

    # 6. Parse invalid ID
    r = parse_requirement_id("not-a-req")
    assert r["valid"] is False
    print("[PASS] parse 'not-a-req' → invalid")

    r = parse_requirement_id("1.2")
    assert r["valid"] is False
    print("[PASS] parse '1.2' → invalid (missing requirement number)")

    r = parse_requirement_id("1.2.5.6")
    assert r["valid"] is False
    print("[PASS] parse '1.2.5.6' → invalid (too many segments)")

    # 7. Format requirement ID
    assert format_requirement_id(1, 2, 5) == "v5.0.0-1.2.5"
    assert format_requirement_id(1, 2, 5, include_version=False) == "1.2.5"
    print(f"[PASS] format(1,2,5) → v5.0.0-1.2.5")

    # 8. Format validation
    try:
        format_requirement_id(0, 1, 1)
        assert False, "should have raised"
    except ValueError:
        pass
    print("[PASS] format rejects chapter=0")

    # 9. Chapter 1 lookup (only known chapter)
    r = lookup_chapter(1)
    assert r is not None
    assert r["title"] == "Encoding and Sanitization"
    print(f"[PASS] Chapter 1 lookup: {r['title']}")

    # 10. Unknown chapter returns None (per §0.5 — don't invent titles)
    r = lookup_chapter(2)
    assert r is None
    r = lookup_chapter(99)
    assert r is None
    print("[PASS] unknown chapter → None (per §0.5, no invented titles)")

    # 11. Section 1.2 known
    assert KNOWN_SECTIONS["1.2"] == "Injection Prevention"
    print(f"[PASS] section 1.2 = 'Injection Prevention' (verbatim)")

    # 12. Round-trip: parse then format
    r = parse_requirement_id("v5.0.0-3.7.1")
    formatted = format_requirement_id(r["chapter"], r["section"], r["requirement"])
    assert formatted == "v5.0.0-3.7.1"
    print(f"[PASS] round-trip parse/format: v5.0.0-3.7.1")

    # 13. CSV URL is on GitHub OWASP
    assert csv_url().startswith("https://github.com/OWASP/ASVS/raw/v5.0.0/")
    print(f"[PASS] CSV URL points to OWASP ASVS v5.0.0 repo")

    # 14. Citation present
    r = parse_requirement_id("1.2.5")
    assert "OWASP" in r["cite"]
    assert "CC BY-SA" in r["cite"]
    print("[PASS] source attribution + license present in outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="OWASP ASVS v5.0 requirement-ID parser")
    p.add_argument("--parse", help="parse a requirement ID (e.g., 1.2.5 or v5.0.0-1.2.5)")
    p.add_argument("--format", nargs=3, type=int, metavar=("CHAPTER", "SECTION", "REQ"),
                   help="format IDs: --format 1 2 5")
    p.add_argument("--chapter", type=int, help="look up chapter metadata")
    p.add_argument("--csv-url", action="store_true", help="print authoritative CSV URL")
    p.add_argument("--example", action="store_true", help="show verbatim example requirement 1.2.5")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.parse, args.format, args.chapter is not None,
                             args.csv_url, args.example]):
        _run_self_tests()
        return 0

    if args.parse:
        print(json.dumps(parse_requirement_id(args.parse), indent=2))
        return 0
    if args.format:
        print(format_requirement_id(args.format[0], args.format[1], args.format[2]))
        return 0
    if args.chapter is not None:
        r = lookup_chapter(args.chapter)
        if r is None:
            print(f"Chapter {args.chapter} not in KNOWN_CHAPTERS registry. "
                  f"See CSV: {CSV_URL}")
            return 1
        print(json.dumps({"chapter": args.chapter, **r}, indent=2))
        return 0
    if args.csv_url:
        print(csv_url())
        return 0
    if args.example:
        print(f"Example (ASVS v{ASVS_VERSION}, requirement 1.2.5):")
        print(f"  \"{EXAMPLE_REQUIREMENT_1_2_5}\"")
        print(f"  cite: {SOURCE_ATTRIBUTION}")
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
