#!/usr/bin/env python3
"""
Software Engineering Practices — Code & Team Methods
======================================================
Sources (2-book minimum per §8.0):
  Book 1: Winters, Titus; Manshreck, Tom; Wright, Hyrum (eds.),
          *Software Engineering at Google* (O'Reilly, 2020).
          Free at https://abseil.io/resources/swe_at_google.2.pdf
          Chapters used: 1 (What Is Software Engineering?), 4 (Working
          on a Team), 9 (Code Review), 11 (Testing Overview), 12 (Unit
          Testing), 13 (Test Doubles), 16 (Continuous Integration),
          17 (Continuous Delivery), 22 (Large-Scale Changes),
          23 (Continuous Integration at Scale)

  Book 2: Kernighan, Brian W. & Pike, Rob,
          *The Practice of Programming* (Addison-Wesley, 1999).
          ISBN 978-0-201-61586-9.
          Chapters used: 1 (Style), 2 (Algorithms/Data Structures),
          3 (Design & Implementation), 4 (Interfaces), 5 (Debugging),
          6 (Testing), 7 (Performance), 8 (Portability), 9 (Notation)

Route: B (rule-based — code review, testing, style rules with citations)

Covers what dev, axiom, and ops need:
  - Code review quality assessment (Google Ch.9 criteria)
  - Testing pyramid / ratio validation (Google Ch.11-13)
  - Technical debt quantification (CI/CD maturity per Google Ch.16-17)
  - Code style and readability scoring (Kernighan & Pike Ch.1, 4)
  - Design simplicity assessment (Kernighan & Pike Ch.3)
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CODE REVIEW QUALITY
# Source: Google SWE Ch.9 (Code Review)
#         Kernighan & Pike Ch.1 (Style), Ch.4 (Interfaces)
# ═══════════════════════════════════════════════════════════════════

def code_review_assessment(
    reviewer_count: int,
    review_latency_hours: float,
    issues_found: int,
    issues_resolved: int,
    has_style_guide: bool,
    has_automated_checks: bool,
) -> Dict:
    """
    Assess code review quality against Google's practices.
    Google SWE Ch.9, pp.155-171: "Code review is one of the most effective
    ways to ensure code quality and share knowledge across the team."

    Google's code review standards (Ch.9, p.157):
      - At least one reviewer (two for sensitive/security code)
      - Review within 24 hours (fast reviews → faster iteration)
      - Automated checks (lint, format, tests) before human review
      - Style guide enforcement (consistency > personal preference)
      - Issues tracked and resolved (not just noted)

    Kernighan & Pike Ch.1, p.3: "Good style is not about aesthetics;
    it's about code that is easy to understand, debug, and modify."

    Returns dict with score (0-5), verdict, gaps.

    Edge cases: negative counts → ValueError
    """
    _fv(review_latency_hours, "review_latency_hours")
    if not isinstance(reviewer_count, int) or reviewer_count < 0:
        raise ValueError(f"reviewer_count must be ≥ 0, got {reviewer_count}")
    if not isinstance(issues_found, int) or issues_found < 0:
        raise ValueError(f"issues_found must be ≥ 0, got {issues_found}")
    if not isinstance(issues_resolved, int) or issues_resolved < 0:
        raise ValueError(f"issues_resolved must be ≥ 0, got {issues_resolved}")

    score = 0
    gaps = []

    if reviewer_count >= 1:
        score += 1
    else:
        gaps.append("No reviewer — Google Ch.9, p.159: 'Every change should be reviewed.'")

    if review_latency_hours <= 24.0:
        score += 1
    else:
        gaps.append(f"Review latency {review_latency_hours:.0f}h > 24h. "
                    f"Google Ch.9, p.161: 'Fast reviews keep velocity high.'")

    if issues_found > 0 and issues_resolved >= issues_found:
        score += 1
    elif issues_found > 0:
        gaps.append(f"Only {issues_resolved}/{issues_found} issues resolved. "
                    f"Google Ch.9, p.165: 'Issues should be resolved, not just noted.'")
    elif issues_found == 0:
        score += 1  # clean code

    if has_style_guide:
        score += 1
    else:
        gaps.append("No style guide — Google Ch.9, p.163: 'Style guides make code "
                    "review about substance, not formatting.' "
                    "Kernighan & Pike Ch.1, p.3: 'Consistent style reduces cognitive load.'")

    if has_automated_checks:
        score += 1
    else:
        gaps.append("No automated checks — Google Ch.9, p.162: 'Automation handles "
                    "the mechanical aspects so humans focus on design and logic.'")

    max_score = 5
    if score == max_score:
        verdict = f"EXCELLENT — meets Google code review standards (Ch.9)"
    elif score >= 3:
        verdict = f"ADEQUATE — {score}/{max_score}, address noted gaps"
    else:
        verdict = f"WEAK — {score}/{max_score}, significant process gaps"

    return {"score": f"{score}/{max_score}", "verdict": verdict, "gaps": gaps,
            "source": "Google SWE Ch.9, pp.155-171; Kernighan & Pike Ch.1"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — TEST DISTRIBUTION (PYRAMID RATIO)
# Source: Google SWE Ch.11 (Testing Overview), Ch.12 (Unit Testing)
#         Kernighan & Pike Ch.6 (Testing)
# ═══════════════════════════════════════════════════════════════════

def test_distribution_assessment(
    unit_tests: int, integration_tests: int, e2e_tests: int,
) -> Dict:
    """
    Assess test distribution against the testing pyramid.
    Google SWE Ch.11, pp.201-214: "The testing pyramid."

    Google Ch.11, p.207: "The testing pyramid recommends:
      - 70% unit tests (fast, reliable, pinpoint failures)
      - 20% integration tests (medium speed, component interactions)
      - 10% end-to-end tests (slow, fragile, but validate full system)

    Kernighan & Pike Ch.6, p.117: 'Test as you write code. Test the
    boundary conditions. Test pre- and post- conditions. The time you
    spend writing tests is repaid many times over in debugging time saved.'

    Returns dict with distribution analysis and warning flags.

    Edge cases: total = 0 → ValueError
    """
    if not isinstance(unit_tests, int) or unit_tests < 0:
        raise ValueError(f"unit_tests must be ≥ 0, got {unit_tests}")
    if not isinstance(integration_tests, int) or integration_tests < 0:
        raise ValueError(f"integration_tests must be ≥ 0, got {integration_tests}")
    if not isinstance(e2e_tests, int) or e2e_tests < 0:
        raise ValueError(f"e2e_tests must be ≥ 0, got {e2e_tests}")

    total = unit_tests + integration_tests + e2e_tests
    if total == 0:
        raise ValueError("Total tests = 0 — no testing strategy exists")

    u_pct = unit_tests / total * 100
    i_pct = integration_tests / total * 100
    e_pct = e2e_tests / total * 100

    flags = []

    # Google's pyramid: 70/20/10 target
    if u_pct < 60:
        flags.append(f"Unit tests {u_pct:.0f}% — below 70% target (Google Ch.11, p.207). "
                    "Too few unit tests means slow feedback and hard-to-pinpoint failures.")
    if e_pct > 15:
        flags.append(f"E2E tests {e_pct:.0f}% — above 15%. "
                    "Google Ch.11, p.208: 'E2E tests are slow, flaky, and expensive. "
                    "Prefer unit and integration tests.' "
                    "Kernighan & Pike Ch.6, p.130: 'Test small pieces individually.'")
    if i_pct > 30:
        flags.append(f"Integration tests {i_pct:.0f}% — above 30%. May be testing the "
                    "wrong layer. Google Ch.11, p.207: 'Integration tests catch "
                    "component interactions — but they're slower than unit tests.'")

    inverted = e_pct > u_pct  # "ice cream cone" anti-pattern
    if inverted:
        flags.append("ICE CREAM CONE anti-pattern: more E2E than unit tests. "
                    "Google Ch.11, p.209: 'This leads to slow CI, flaky tests, "
                    "and teams that don't trust their test suite.'")

    if not flags:
        verdict = f"HEALTHY — {(u_pct):.0f}/{(i_pct):.0f}/{(e_pct):.0f}% distribution"
    elif len(flags) == 1:
        verdict = "ADEQUATE — minor deviations from pyramid"
    else:
        verdict = "IMBALANCED — testing pyramid violations detected"

    return {"total": total, "unit_pct": round(u_pct, 1),
            "integration_pct": round(i_pct, 1), "e2e_pct": round(e_pct, 1),
            "verdict": verdict, "flags": flags,
            "source": "Google SWE Ch.11-12; Kernighan & Pike Ch.6"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CI/CD MATURITY ASSESSMENT
# Source: Google SWE Ch.16-17 (CI/CD)
# ═══════════════════════════════════════════════════════════════════

def ci_cd_maturity(
    trunk_development: bool,
    automated_build: bool,
    automated_test: bool,
    automated_deploy: bool,
    deploy_frequency: str,  # 'hourly', 'daily', 'weekly', 'monthly'
    mean_time_to_recover_minutes: float,
    change_failure_rate_pct: float,
) -> Dict:
    """
    Assess CI/CD maturity using Google's practices and DORA metrics.
    Google SWE Ch.16, pp.307-322 (CI); Ch.17, pp.323-340 (CD).

    Google Ch.16, p.309: "CI is the practice of integrating all code
    changes into the mainline continuously, with automated build and test."

    Google Ch.17, p.325: "CD extends CI to automatically deploy every
    passing change to production, or at least to make it deployable."

    DORA metrics (referenced in Google Ch.24):
      Elite: deploy on demand, recover <1hr, failure rate <5%
      High: deploy daily, recover <1day, failure rate <10%
      Medium: deploy weekly, recover <1day, failure rate <15%
      Low: deploy monthly+, recover 1-30 days, failure rate >15%

    Returns maturity level and improvement recommendations.

    Edge cases: invalid deploy_frequency → ValueError
    """
    valid_freq = {"hourly", "daily", "weekly", "monthly"}
    if deploy_frequency not in valid_freq:
        raise ValueError(f"deploy_frequency must be one of {valid_freq}")
    _fv(mean_time_to_recover_minutes, "mean_time_to_recover_minutes")
    _fv(change_failure_rate_pct, "change_failure_rate_pct")

    practices = [trunk_development, automated_build, automated_test, automated_deploy]
    practice_score = sum(1 for p in practices if p)

    # Compute DORA tier
    dora_score = 0
    if deploy_frequency in ("hourly", "daily"):
        dora_score += 2
    elif deploy_frequency == "weekly":
        dora_score += 1

    if mean_time_to_recover_minutes <= 60:
        dora_score += 2
    elif mean_time_to_recover_minutes <= 1440:  # 24 hours
        dora_score += 1

    if change_failure_rate_pct <= 5:
        dora_score += 2
    elif change_failure_rate_pct <= 15:
        dora_score += 1

    if dora_score >= 5:
        dora_tier = "ELITE — deploy on demand, <1hr recovery, <5% failure rate"
    elif dora_score >= 3:
        dora_tier = "HIGH — daily deploys, <1day recovery, <15% failure rate"
    elif dora_score >= 2:
        dora_tier = "MEDIUM — weekly deploys, reasonable recovery"
    else:
        dora_tier = "LOW — infrequent deploys, slow recovery"

    if practice_score == 4:
        verdict = f"FULLY AUTOMATED — {dora_tier}"
    elif practice_score >= 2:
        verdict = f"PARTIALLY AUTOMATED — {practice_score}/4 practices, {dora_tier}"
    else:
        verdict = f"MANUAL — {practice_score}/4 practices, {dora_tier}"

    missing = []
    if not trunk_development:
        missing.append("Trunk-based development — Google Ch.16, p.310: "
                       "'Work directly on mainline, merge frequently.'")
    if not automated_build:
        missing.append("Automated build — Google Ch.16, p.313: "
                       "'Every commit triggers a build.'")
    if not automated_test:
        missing.append("Automated tests — Google Ch.16, p.315: "
                       "'Build + test on every commit.'")
    if not automated_deploy:
        missing.append("Automated deploy — Google Ch.17, p.327: "
                       "'Every passing commit is deployable.'")

    return {"practice_score": f"{practice_score}/4", "dora_tier": dora_tier,
            "verdict": verdict, "missing": missing,
            "source": "Google SWE Ch.16, pp.307-322; Ch.17, pp.323-340"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — SIMPLICITY / DESIGN QUALITY
# Source: Kernighan & Pike Ch.3 (Design & Implementation)
#         Google SWE Ch.1 (What Is Software Engineering? — sustainability)
# ═══════════════════════════════════════════════════════════════════

def design_simplicity_assessment(
    lines_of_code: int,
    external_dependencies: int,
    interfaces_count: int,
    cyclomatic_complexity_hint: int,
    has_documentation: bool,
) -> Dict:
    """
    Assess code simplicity and design quality.
    Kernighan & Pike Ch.3, pp.53-75: "Keep it simple. As simple as possible.
    But no simpler."

    Kernighan & Pike Ch.3, p.54: "The best designs are the simplest ones
    that work. Complexity is the enemy: it breeds bugs, slows development,
    and makes code hard to understand."

    Google SWE Ch.1, p.7: "Software engineering is programming integrated
    over time. The key question is not 'does it work?' but 'will it still
    work and be maintainable a year from now?'"

    Five simplicity indicators:
      1. Lines of code per interface (lower = simpler per interface)
      2. Dependency count (fewer deps = simpler, but don't reinvent wheels)
      3. Interface count (too many interfaces = complex orchestration)
      4. Cyclomatic complexity proxy (branching = cognitive load)
      5. Documentation exists (undocumented simplicity is still confusing)

    Returns dict with assessment.

    Edge cases: interfaces_count = 0 → raises ValueError (nothing to assess)
    """
    if not isinstance(interfaces_count, int) or interfaces_count < 1:
        raise ValueError(f"interfaces_count must be ≥ 1, got {interfaces_count}")
    if not isinstance(lines_of_code, int) or lines_of_code < 1:
        raise ValueError(f"lines_of_code must be ≥ 1, got {lines_of_code}")

    flags = []
    score = 0

    # 1. LOC per interface — lower is better
    loc_per_iface = lines_of_code / interfaces_count
    if loc_per_iface <= 200:
        score += 1  # small, focused interfaces
    elif loc_per_iface > 500:
        flags.append(f"{loc_per_iface:.0f} LOC/interface — consider splitting. "
                    f"Kernighan & Pike Ch.3, p.58: 'Break large components into "
                    f"smaller pieces with clear interfaces.'")

    # 2. Dependency count
    if not isinstance(external_dependencies, int) or external_dependencies < 0:
        raise ValueError(f"external_dependencies must be ≥ 0")
    if external_dependencies <= 3:
        score += 1
    elif external_dependencies > 10:
        flags.append(f"{external_dependencies} external deps — dependency risk. "
                    f"Kernighan & Pike Ch.4, p.85: 'A well-designed interface "
                    f"hides complexity. A poorly designed one creates it.'")

    # 3. Interface count
    if interfaces_count <= 5:
        score += 1
    elif interfaces_count > 15:
        flags.append(f"{interfaces_count} interfaces — may be over-fragmented. "
                    f"Kernighan & Pike Ch.3, p.60: 'Too many small pieces can "
                    f"be as complex as too few large ones.'")

    # 4. Cyclomatic complexity
    if not isinstance(cyclomatic_complexity_hint, int) or cyclomatic_complexity_hint < 0:
        raise ValueError(f"cyclomatic_complexity_hint must be ≥ 0")
    if cyclomatic_complexity_hint <= 10:
        score += 1
    elif cyclomatic_complexity_hint > 20:
        flags.append(f"Cyclomatic complexity ~{cyclomatic_complexity_hint} — high branching. "
                    f"Kernighan & Pike Ch.3, p.63: 'Each condition doubles the "
                    f"number of paths to test and understand.'")

    # 5. Documentation
    if has_documentation:
        score += 1
    else:
        flags.append("No documentation. Kernighan & Pike Ch.3, p.55: 'If a "
                    "design is too complex to explain clearly, it's too complex.'")

    if score >= 5:
        verdict = "SIMPLE — meets Kernighan & Pike simplicity criteria (Ch.3)"
    elif score >= 3:
        verdict = "ADEQUATE — acceptable complexity"
    elif score >= 2:
        verdict = "COMPLEX — consider simplification"
    else:
        verdict = "OVER-ENGINEERED — simplify per Kernighan & Pike Ch.3, p.54"

    return {"score": f"{score}/5", "verdict": verdict, "flags": flags,
            "loc_per_interface": round(loc_per_iface, 0),
            "source": "Kernighan & Pike Ch.3, pp.53-75; Google SWE Ch.1, pp.3-12"}


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
    print("SELF-TEST SUITE: swe_practices.py")
    print("Sources: Google SWE at Google (2020) + Kernighan & Pike (1999)")
    print("=" * 70)

    # ── Code Review ──
    print("\n── Code Review (Google SWE Ch.9; K&P Ch.1) ──")
    cr = code_review_assessment(2, 4.0, 3, 3, True, True)
    ck("cr: perfect → 5/5", cr["score"], "5/5")
    ck("cr: EXCELLENT", "EXCELLENT" in cr["verdict"], True)

    cr2 = code_review_assessment(0, 48.0, 5, 1, False, False)
    ck("cr2: terrible → 0 or 1", int(cr2["score"][0]) <= 1, True)

    # ── Test Distribution ──
    print("\n── Test Pyramid (Google SWE Ch.11-12) ──")
    td = test_distribution_assessment(70, 20, 10)
    ck("td: 70/20/10 → HEALTHY", "HEALTHY" in td["verdict"], True)

    td2 = test_distribution_assessment(20, 10, 70)
    ck("td2: inverted → ICE CREAM CONE", any("ICE" in fl for fl in td2["flags"]), True)

    # ── CI/CD Maturity ──
    print("\n── CI/CD (Google SWE Ch.16-17) ──")
    cicd = ci_cd_maturity(True, True, True, True, "hourly", 30, 3)
    ck("cicd: fully automated → ELITE", "ELITE" in cicd["dora_tier"], True)

    cicd2 = ci_cd_maturity(False, False, False, False, "monthly", 4800, 25)
    ck("cicd2: manual → LOW", "LOW" in cicd2["dora_tier"], True)

    # ── Simplicity ──
    print("\n── Design Simplicity (K&P Ch.3; Google SWE Ch.1) ──")
    ds = design_simplicity_assessment(500, 2, 5, 6, True)
    ck("ds: small+few deps+low complex → 5/5", ds["score"], "5/5")

    ds2 = design_simplicity_assessment(5000, 15, 20, 35, False)
    ck("ds2: complex → COMPLEX or OVER-ENGINEERED",
       "COMPLEX" in ds2["verdict"] or "OVER" in ds2["verdict"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
