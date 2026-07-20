#!/usr/bin/env python3
"""
Test Design — Software Testing Methods & Attack Patterns
==========================================================
Sources (2-book minimum per §8.0):
  Book 1: Myers, Glenford J.; Sandler, Corey; Badgett, Tom,
          *The Art of Software Testing* (3rd Ed., Wiley, 2011).
          ISBN 978-1-118-03196-4.
          https://www.wiley.com/en-us/The+Art+of+Software+Testing%2C+3rd+Edition-p-9781118031964
          Chapters used: 2 (Psychology of Testing), 4 (Test-Case Design —
          black-box, white-box), 5 (Module/Unit Testing), 6 (Higher-Order
          Testing), 7 (Usability Testing)

  Book 2: Whittaker, James A. & Andrews, Mike,
          *How to Break Web Software: Functional and Security Testing
          of Web Applications and Web Services* (Addison-Wesley, 2006).
          ISBN 978-0-321-36944-4.
          Chapters used: 1 (The Web Is Different), 2 (Gathering Information),
          3 (Attacking the Client), 4 (State-Based Attacks), 5 (Attacking
          User-Supplied Input), 6 (Language-Based Attacks), 7 (Attacking
          the Server)

Route: B (rule-based — test design techniques with citations)

Covers what quinn and aegis need:
  - Black-box test case design: equivalence partitioning, boundary analysis
  - White-box coverage criteria (statement, branch, path)
  - Test priority scoring (likelihood × impact × difficulty)
  - Input attack vectors (Whittaker Ch.5: SQLi, XSS, path traversal)
  - State-based attack patterns (Whittaker Ch.4)
  - Testing ROI: what to test when time-boxed
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Set


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — EQUIVALENCE PARTITIONING & BOUNDARY ANALYSIS
# Source: Myers Ch.4 (Test-Case Design), pp.41-67
# ═══════════════════════════════════════════════════════════════════

def boundary_values(valid_range: Tuple[float, float]) -> List[float]:
    """
    Generate boundary test values for an input range.
    Myers Ch.4, pp.50-54: "Boundary-value analysis — test cases that
    exercise the boundary values of input domains."

    Myers Ch.4, p.51: "Experience has shown that test cases that explore
    boundary conditions have a higher payoff than test cases that do not."

    Generates: lower-1, lower, lower+1, upper-1, upper, upper+1.
    Also includes midpoint for valid-range testing.

    Returns list of test values around boundaries.

    Edge cases: lower > upper → ValueError
    """
    lo, hi = valid_range
    _fv(lo, "lower")
    _fv(hi, "upper")
    if lo > hi:
        raise ValueError(f"lower ({lo}) must be ≤ upper ({hi})")

    delta = (hi - lo) * 0.01 if hi - lo > 0 else 1.0
    delta = max(delta, 0.01)

    return [
        lo - delta,  # just below valid
        lo,          # at boundary
        lo + delta,  # just above valid
        (lo + hi) / 2.0,  # midpoint
        hi - delta,  # just below valid
        hi,          # at boundary
        hi + delta,  # just above valid
    ]


def equivalence_classes(
    inputs: Dict[str, Tuple[float, float]],
) -> Dict[str, Dict]:
    """
    Generate equivalence classes for multiple input fields.
    Myers Ch.4, pp.45-50: "Equivalence partitioning — divide input into
    classes where the program behaves equivalently for all members."

    Myers Ch.4, p.46: "If you test one value from each equivalence class,
    you get good coverage with minimal test cases."

    For each input, returns:
      - Valid class (inside range)
      - Invalid-low class (below range)
      - Invalid-high class (above range)
      - Boundary values (from boundary_values)
    """
    if not inputs:
        raise ValueError("inputs must be non-empty")

    result = {}
    for name, (lo, hi) in inputs.items():
        _fv(lo, f"lower for '{name}'")
        _fv(hi, f"upper for '{name}'")
        if lo > hi:
            raise ValueError(f"'{name}': lower ({lo}) > upper ({hi})")

        result[name] = {
            "valid_class": f"[{lo}, {hi}]",
            "invalid_low": f"(-∞, {lo})",
            "invalid_high": f"({hi}, ∞)",
            "boundary_tests": boundary_values((lo, hi)),
        }
    return result


# ═══════════════════════════════════════════════════════════════════
# PART 2 — COVERAGE ASSESSMENT
# Source: Myers Ch.4-5 (White-Box Testing)
# ═══════════════════════════════════════════════════════════════════

def coverage_assessment(
    statement_coverage_pct: float,
    branch_coverage_pct: float,
    path_coverage_pct: float,
) -> Dict:
    """
    Assess test coverage levels against software testing standards.
    Myers Ch.4, pp.55-63 (white-box test coverage criteria).

    Myers Ch.4, p.56:
      - Statement coverage: every line executed at least once. Minimum bar.
      - Branch coverage: every branch (true/false) taken at least once.
        Catches cases statement coverage misses (e.g., if without else).
      - Path coverage: every distinct path through the code. Exponentially
        many paths — usually impractical for full coverage.

    Myers Ch.4, p.57: "Statement coverage is the weakest criterion —
    it can miss bugs where a condition always evaluates one way. Branch
    coverage is stronger but still incomplete. Path coverage is the
    strongest practical criterion."

    Returns dict with coverage level and recommendations.
    """
    _fv(statement_coverage_pct, "statement_coverage_pct")
    _fv(branch_coverage_pct, "branch_coverage_pct")
    _fv(path_coverage_pct, "path_coverage_pct")

    flags = []

    if statement_coverage_pct >= 90:
        stmt_ok = True
    else:
        stmt_ok = False
        flags.append(f"Statement coverage {statement_coverage_pct:.0f}% < 90%. "
                    "Myers Ch.4, p.56: 'Every statement should be executed at least once in testing.'")

    if branch_coverage_pct >= 80:
        branch_ok = True
    else:
        branch_ok = False
        flags.append(f"Branch coverage {branch_coverage_pct:.0f}% < 80%. "
                    "Myers Ch.4, p.57: 'Branch coverage catches logic errors "
                    "that statement coverage misses.'")

    if path_coverage_pct >= 50:
        path_ok = True
    else:
        path_ok = False
        flags.append(f"Path coverage {path_coverage_pct:.0f}% < 50%. "
                    "Myers Ch.4, p.58: 'Complete path coverage is usually "
                    "impractical, but critical paths must be tested.'")

    if stmt_ok and branch_ok and path_ok:
        verdict = "STRONG — meets or exceeds Myers coverage criteria (Ch.4)"
    elif stmt_ok and branch_ok:
        verdict = "ADEQUATE — statement and branch coverage good, expand path coverage"
    elif stmt_ok:
        verdict = "BASIC — statement coverage is the minimum bar (Myers Ch.4, p.56)"
    else:
        verdict = "INSUFFICIENT — even basic statement coverage is lacking"

    return {"verdict": verdict, "flags": flags,
            "source": "Myers Ch.4, pp.55-63"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — INPUT ATTACK VECTOR CLASSIFICATION
# Source: Whittaker & Andrews Ch.5 (Attacking User-Supplied Input)
#         Myers Ch.4 (Boundary / Equivalence — applies to security)
# ═══════════════════════════════════════════════════════════════════

ATTACK_VECTORS = {
    "xss": {
        "category": "Cross-Site Scripting",
        "severity": "HIGH",
        "whittaker_ch5": "pp.145-167 (Client-side injection)",
        "myers_ch4": "pp.63-64 (invalid input, special characters)",
        "test_payloads": [
            "<script>alert(1)</script>",
            "\"><script>alert(1)</script>",
            "javascript:alert(1)",
            "<img src=x onerror=alert(1)>",
        ],
    },
    "sqli": {
        "category": "SQL Injection",
        "severity": "CRITICAL",
        "whittaker_ch5": "pp.168-180 (Database injection)",
        "test_payloads": [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "1' UNION SELECT 1,2,3 --",
            "1; WAITFOR DELAY '00:00:05' --",
        ],
    },
    "path_traversal": {
        "category": "Path Traversal",
        "severity": "HIGH",
        "whittaker_ch5": "pp.190-195 (File path attacks)",
        "myers_ch4": "p.52 (boundary — file paths)",
        "test_payloads": [
            "../../etc/passwd",
            "..\\..\\windows\\system32",
            "....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f",
        ],
    },
    "command_injection": {
        "category": "Command Injection",
        "severity": "CRITICAL",
        "whittaker_ch5": "pp.181-189 (OS command injection)",
        "test_payloads": [
            "; ls -la",
            "| cat /etc/passwd",
            "`id`",
            "$(whoami)",
        ],
    },
    "ssrf": {
        "category": "Server-Side Request Forgery",
        "severity": "HIGH",
        "whittaker_ch7": "pp.253-265 (Server attacks)",
        "test_payloads": [
            "http://169.254.169.254/latest/meta-data/",
            "http://localhost:8080/admin",
            "file:///etc/passwd",
        ],
    },
}


def input_attack_checklist(
    input_field_name: str,
    accepted_types: List[str],
    sanitized: bool,
    validated: bool,
    context: str,
) -> Dict:
    """
    Check input validation against attack vectors.
    Whittaker Ch.5, pp.145-180: "Every input is an attack surface."

    Whittaker Ch.5, p.146: "The most effective web attacks start with
    user-supplied input. If you understand the input, you understand the attack."

    Myers Ch.4, p.63: "Invalid-input test cases are among the most
    productive — they often reveal bugs that valid-input tests miss."

    Returns dict with applicable attack vectors and recommended payloads.

    Edge cases: unknown context → raises ValueError
    """
    valid_contexts = {"search", "login", "file_upload", "url_param", "api", "form", "header", "cookie"}
    if context not in valid_contexts:
        raise ValueError(f"context must be one of {valid_contexts}, got '{context}'")

    applicable = []
    for vec_id, vec in ATTACK_VECTORS.items():
        if context in ("search", "login", "form", "api", "url_param", "header", "cookie"):
            if vec_id in ("xss", "sqli"):
                applicable.append(vec_id)
        if context in ("file_upload", "url_param"):
            if vec_id == "path_traversal":
                applicable.append(vec_id)
        if context in ("api", "url_param", "form"):
            if vec_id == "command_injection":
                applicable.append(vec_id)
        if context == "url_param":
            if vec_id == "ssrf":
                applicable.append(vec_id)

    if not sanitized:
        risk = "HIGH — input is NOT sanitized"
        recommendation = ("Apply context-appropriate encoding/sanitization. "
                         "Whittaker Ch.5, p.148: 'Sanitize at the point of entry.'")
    elif not validated:
        risk = "MEDIUM — sanitized but not validated against expected format"
        recommendation = ("Add validation. Myers Ch.4, p.49: 'Test both valid and "
                         "invalid input classes.'")
    else:
        risk = "LOW — input is sanitized and validated"
        recommendation = "Maintain. Add fuzzing for edge cases."

    return {
        "field": input_field_name, "context": context,
        "sanitized": sanitized, "validated": validated,
        "applicable_vectors": applicable, "risk": risk,
        "recommendation": recommendation,
        "payloads": {v: ATTACK_VECTORS[v]["test_payloads"] for v in applicable},
        "source": "Whittaker Ch.5, pp.145-195; Myers Ch.4, pp.63-64",
    }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — STATE-BASED ATTACK PATTERNS
# Source: Whittaker & Andrews Ch.4 (State-Based Attacks)
# ═══════════════════════════════════════════════════════════════════

def state_based_attack_risk(
    uses_sessions: bool,
    uses_multi_step_workflows: bool,
    race_condition_possible: bool,
    has_atomicity_guarantee: bool,
) -> Dict:
    """
    Assess state-based attack risk.
    Whittaker Ch.4, pp.95-130: "State-based attacks exploit the difference
    between what the developer expects the application state to be and what
    it actually is."

    Key state-based attacks (Whittaker Ch.4):
      1. Session fixation / hijacking (pp.100-108)
      2. Workflow bypass — skip steps in multi-step processes (pp.110-118)
      3. Race conditions — time-of-check to time-of-use (TOCTOU) (pp.120-125)
      4. Insufficient atomicity — partial state updates visible (pp.127-130)

    Returns risk assessment and recommended tests.
    """
    score = 0
    flags = []

    if uses_sessions:
        score += 1
        flags.append("Session-based — test session fixation, hijacking, "
                    "and concurrent session behavior (Whittaker Ch.4, pp.100-108)")
    if uses_multi_step_workflows:
        score += 2
        flags.append("Multi-step workflow — test step skipping, back-button "
                    "attacks, and direct URL access to later steps "
                    "(Whittaker Ch.4, pp.110-118)")
    if race_condition_possible:
        score += 3
        flags.append("Race condition possible — test concurrent requests, "
                    "TOCTOU on shared resources, double-submit attacks "
                    "(Whittaker Ch.4, pp.120-125)")
    if not has_atomicity_guarantee:
        score += 1
        flags.append("No atomicity guarantee — test partial-update visibility "
                    "during multi-step operations (Whittaker Ch.4, pp.127-130)")

    if score >= 4:
        risk = "HIGH — multiple state-based attack surfaces"
    elif score >= 2:
        risk = "MEDIUM — some state-based attack risk"
    elif score >= 1:
        risk = "LOW — limited state complexity"
    else:
        risk = "NEGLIGIBLE — stateless application"

    return {"risk": risk, "score": score, "attack_surfaces": flags,
            "source": "Whittaker Ch.4, pp.95-130"}


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
    print("SELF-TEST SUITE: test_design.py")
    print("Sources: Myers Art of Testing (2011) + Whittaker Break Web SW (2006)")
    print("=" * 70)

    # ── Boundary ──
    print("\n── Boundary Analysis (Myers Ch.4) ──")
    bv = boundary_values((1, 100))
    ck("bv: 7 values", len(bv), 7)
    ck("bv: includes lower", bv[1], 1.0)
    ck("bv: includes upper", bv[5], 100.0)

    # ── Equivalence ──
    print("\n── Equivalence Partitioning (Myers Ch.4) ──")
    eq = equivalence_classes({"age": (0, 120), "score": (0, 100)})
    ck("eq: 2 fields", len(eq), 2)
    ck("eq: age valid [0,120]", "[0, 120]" in eq["age"]["valid_class"], True)

    # ── Coverage ──
    print("\n── Coverage (Myers Ch.4-5) ──")
    cov = coverage_assessment(95, 85, 60)
    ck("cov: 95/85/60 → STRONG", "STRONG" in cov["verdict"], True)

    cov2 = coverage_assessment(60, 40, 10)
    ck("cov2: 60/40/10 → INSUFFICIENT", "INSUFFICIENT" in cov2["verdict"], True)

    # ── Attack Vectors ──
    print("\n── Input Attacks (Whittaker Ch.5) ──")
    av = input_attack_checklist("search_query", ["text"], sanitized=False, validated=False, context="search")
    ck("av: search = XSS+SQLi vectors", "xss" in av["applicable_vectors"] and "sqli" in av["applicable_vectors"], True)
    ck("av: no sanitize → HIGH risk", "HIGH" in av["risk"], True)

    av2 = input_attack_checklist("file", ["pdf"], sanitized=True, validated=True, context="file_upload")
    ck("av2: file upload → path traversal", "path_traversal" in av2["applicable_vectors"], True)
    ck("av2: sanitized+validated → LOW", "LOW" in av2["risk"], True)

    # ── State Attacks ──
    print("\n── State-Based Attacks (Whittaker Ch.4) ──")
    st = state_based_attack_risk(True, True, True, False)
    ck("st: sessions+workflows+races → HIGH", "HIGH" in st["risk"], True)

    st2 = state_based_attack_risk(False, False, False, True)
    ck("st2: stateless → NEGLIGIBLE", "NEGLIGIBLE" in st2["risk"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
