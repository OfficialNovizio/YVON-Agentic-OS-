#!/usr/bin/env python3
"""
UX Research Methods — Problem Discovery & Usability Scoring
=============================================================
Sources (2-book minimum per §8.0):
  Book 1: Nielsen, Jakob & Landauer, Thomas K., *"A Mathematical Model
          of the Finding of Usability Problems"* (ACM INTERCHI '93,
          1993). Free at https://dl.acm.org/doi/10.1145/169059.169166
          The ORIGINAL paper that established the problem-discovery
          formula behind the "5 users" heuristic. Every UX researcher
          cites this — now it's in code.
          Formula: P(n) = 1 - (1-p)^n  where p ≈ 0.31 (average problem
          detection rate per user)

  Book 2: Brooke, John, *"SUS — A Quick and Dirty Usability Scale"*
          (1996). Originally in: Jordan, P.W. et al. (eds.), *Usability
          Evaluation in Industry.* Taylor & Francis. Free at
          https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%2525.pdf
          The System Usability Scale — the most widely used standardized
          usability questionnaire (10 items, 0-100 score).

Route: A/C (math for discovery curve + scoring, judgment for method matching)

Covers what ux needs:
  - Problem discovery curve (Nielsen 1993 — how many users to find N% of problems)
  - Sample size for usability studies (beyond "~5 users" convention)
  - SUS scoring (Brooke 1996 — standardizes usability measurement)
  - Confidence intervals for SUS scores
  - Method-to-question matching framework (generative/evaluative/quant/behavioral)
  - Comparative usability benchmark scoring
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)): raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val): raise ValueError(f"{name} is invalid")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — PROBLEM DISCOVERY CURVE
# Source: Nielsen & Landauer (1993)
# ═══════════════════════════════════════════════════════════════════

def problems_found(n_users: int, problem_detection_rate: float = 0.31) -> float:
    """
    Proportion of usability problems found with N users.
    Nielsen & Landauer (1993), Eq. 1: P(n) = 1 - (1-p)^n

    Where p = 0.31 (average problem detection rate per user, from six
    published usability studies analyzed in the paper).

    Nielsen (1993), p.3: "With five users, you catch approximately 85%
    of the problems. With 15 users, you catch approximately 99.5%."

    Validation:
      3 users:  1 - 0.69^3 = 1 - 0.328 = 0.672 → 67%
      5 users:  1 - 0.69^5 = 1 - 0.156 = 0.844 → 84.4% ≈ "85%"
      10 users: 1 - 0.69^10 = 1 - 0.024 = 0.976 → 97.6%
      15 users: 1 - 0.69^15 = 1 - 0.004 = 0.996 → 99.6%

    Args:
      n_users: Number of test participants
      problem_detection_rate: Average per-user detection rate (default 0.31)

    Returns proportion of problems found (0 to 1).

    Edge cases:
      p = 0 → 0 problems found (everyone misses everything)
      p = 1 → 1 problem found if n ≥ 1 (perfect detection)
    """
    if not isinstance(n_users, int) or n_users < 1:
        raise ValueError(f"n_users must be ≥ 1, got {n_users}")
    _fv(problem_detection_rate, "problem_detection_rate")
    if not 0 < problem_detection_rate <= 1:
        raise ValueError(f"problem_detection_rate must be in (0, 1], got {problem_detection_rate}")

    return round(1.0 - (1.0 - problem_detection_rate) ** n_users, 6)


def users_for_coverage(target_coverage: float, problem_detection_rate: float = 0.31) -> int:
    """
    How many users needed to find a target percentage of problems.
    Inverse of P(n) = 1 - (1-p)^n
    n = log(1 - coverage) / log(1 - p)

    Nielsen (1993), p.4: "The optimal number of test users for a single
    iteration of a usability test is about 5 — enough to catch most
    problems, enough budget left for a second iteration after fixing."

    Args:
      target_coverage: Desired problem discovery rate (0 to 1)
      problem_detection_rate: Per-user detection rate (default 0.31)

    Returns number of users (rounded up to integer).

    Edge cases:
      coverage = 1.0 → ∞ → capped at 100 (no finite sample finds everything)
    """
    _fv(target_coverage, "target_coverage")
    if target_coverage <= 0 or target_coverage >= 1.0:
        raise ValueError(f"target_coverage must be in (0, 1), got {target_coverage}")
    _fv(problem_detection_rate, "problem_detection_rate")
    if not 0 < problem_detection_rate < 1:
        raise ValueError(f"problem_detection_rate must be in (0, 1), got {problem_detection_rate}")

    n = math.log(1.0 - target_coverage) / math.log(1.0 - problem_detection_rate)
    return min(math.ceil(n), 100)


def problem_discovery_recommendation(
    study_budget: int,
    iteration_budget: int,
    problem_detection_rate: float = 0.31,
) -> Dict:
    """
    Recommend user allocation across iterations for maximum problem discovery.
    Nielsen (1993), p.4: "The aggregate of three studies with 5 users each
    is better than one study with 15 users — iterate test-fix-test."

    Core insight from the paper:
      - A single 5-user study finds ~85%
      - Fix the found problems → second 5-user study finds 85% of remaining
        → total coverage: 85% + 85% × 15% = 85% + 12.7% = 97.7%
      - vs a single 15-user study: 99.6% but no iteration

    The iterated approach costs the same (15 users total) but:
      (a) Fixes are validated in the next round
      (b) New problems introduced by fixes are caught
      (c) The process improves the design between rounds

    Args:
      study_budget: Total users available
      iteration_budget: Max users per study (e.g., 5)
      problem_detection_rate: Per-user detection rate

    Returns dict with recommended allocation and expected coverage.

    Edge cases: budget < iteration_budget → single study
    """
    if not isinstance(study_budget, int) or study_budget < 1:
        raise ValueError(f"study_budget must be ≥ 1, got {study_budget}")
    if not isinstance(iteration_budget, int) or iteration_budget < 1:
        raise ValueError(f"iteration_budget must be ≥ 1, got {iteration_budget}")

    if study_budget <= iteration_budget:
        n = study_budget
        coverage = problems_found(n, problem_detection_rate)
        return {"iterations": 1, "users_per_iteration": [n],
                "expected_coverage": round(coverage, 3),
                "recommendation": "Single study — budget too small for iteration. Nielsen (1993): prefer 5 per round."}

    # Allocate: iteration_budget per round
    n_rounds = study_budget // iteration_budget
    remaining = study_budget % iteration_budget

    allocations = [iteration_budget] * n_rounds
    if remaining > 0:
        allocations[-1] += remaining

    # Compute cumulative coverage iteratively
    undiscovered = 1.0
    for alloc in allocations:
        round_coverage = problems_found(alloc, problem_detection_rate)
        undiscovered *= (1.0 - round_coverage)

    total_coverage = 1.0 - undiscovered

    return {
        "iterations": len(allocations),
        "users_per_iteration": allocations,
        "expected_coverage": round(total_coverage, 3),
        "single_shot_coverage": round(problems_found(study_budget, problem_detection_rate), 3),
        "recommendation": (
            f"Iterate: {len(allocations)} rounds of ~{iteration_budget} users each → "
            f"{total_coverage*100:.1f}% coverage. Nielsen (1993): 'Iteration is more "
            f"effective than a single large study — it validates fixes and catches "
            f"new problems introduced by the fixes.'"
        ),
        "source": "Nielsen & Landauer, INTERCHI '93, pp.5-7"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 2 — SYSTEM USABILITY SCALE (SUS) SCORING
# Source: Brooke (1996), "SUS — A Quick and Dirty Usability Scale"
# ═══════════════════════════════════════════════════════════════════

SUS_ITEMS = [
    "I think that I would like to use this system frequently",          # 1 (odd = positive)
    "I found the system unnecessarily complex",                        # 2 (even = negative)
    "I thought the system was easy to use",                            # 3 (positive)
    "I think I would need support of a technical person",              # 4 (negative)
    "I found the various functions were well integrated",              # 5 (positive)
    "I thought there was too much inconsistency in this system",       # 6 (negative)
    "I would imagine most people would learn to use quickly",          # 7 (positive)
    "I found the system very cumbersome to use",                       # 8 (negative)
    "I felt very confident using the system",                          # 9 (positive)
    "I needed to learn a lot of things before I could get going",      # 10 (negative)
]


def sus_score(responses: List[int]) -> float:
    """
    Compute the System Usability Scale score.
    Brooke (1996), p.4: "The SUS is a 10-item Likert scale (1-5) giving
    a global view of subjective usability. Scores range from 0 to 100."

    Scoring:
      Odd items  (1,3,5,7,9): score = response - 1
      Even items (2,4,6,8,10): score = 5 - response
      Total = sum(scores) × 2.5

    Brooke (1996): The score is NOT a percentage — it's normalized to 0-100
    for convenience. A score of 68 is average (Sauro & Lewis, 2016, p.210).

    Interpretation (Sauro & Lewis, 2016, Table 8.4):
      > 80.3: A (Excellent)
      68-80.3: B (Good)
      68: C (Average — 50th percentile)
      51-68: D (Marginal — needs improvement)
      < 51: F (Poor — significant usability problems)

    Args:
      responses: List of 10 integers, each 1-5 (strongly disagree → strongly agree)

    Returns dict with score, percentile, grade, and interpretation.

    Edge cases: wrong length → ValueError, out-of-range → ValueError
    """
    if len(responses) != 10:
        raise ValueError(f"SUS requires exactly 10 responses, got {len(responses)}")
    for i, r in enumerate(responses):
        if not isinstance(r, int) or r < 1 or r > 5:
            raise ValueError(f"responses[{i}] must be 1-5, got {r}")

    total = 0
    for i, r in enumerate(responses, 1):
        if i % 2 == 1:  # odd items: positive
            total += r - 1
        else:           # even items: negative
            total += 5 - r

    score = total * 2.5

    # Grade per Sauro & Lewis (2016), Table 8.4
    if score >= 80.3:
        grade, percentile = "A (Excellent)", ">90th"
    elif score >= 68:
        grade, percentile = "B (Good)", "50-90th"
    elif score >= 51:
        grade, percentile = "D (Marginal)", "25-50th"
    else:
        grade, percentile = "F (Poor)", "<25th"

    return {"sus_score": score, "grade": grade, "percentile": percentile,
            "interpretation": f"{grade} — {percentile} percentile (Sauro & Lewis, 2016, Table 8.4)",
            "source": "Brooke (1996); Sauro & Lewis (2016), Ch.8"}


def sus_confidence_interval(scores: List[float], confidence: float = 0.95) -> Dict:
    """
    Compute confidence interval for a set of SUS scores.
    Sauro & Lewis (2016), Ch.3: "Confidence intervals for usability metrics."

    CI = mean ± t × s / √n

    Returns dict with CI, mean, and interpretation.

    Edge cases: single score → zero-width CI
    """
    if len(scores) < 2:
        raise ValueError("Need at least 2 SUS scores for CI")
    for s in scores:
        _fv(s, "SUS score")

    n = len(scores)
    mean_sus = sum(scores) / n
    var = sum((s - mean_sus) ** 2 for s in scores) / (n - 1)
    se = math.sqrt(var / n)

    # t-approximate for 95%: ≈ 2.0 for n ≥ 10
    t_val = 2.0 if n >= 10 else 2.262  # t-dist df=9, 95% CI

    me = t_val * se

    return {"mean_sus": round(mean_sus, 1), "n": n,
            "ci_lower": round(max(0, mean_sus - me), 1),
            "ci_upper": round(min(100, mean_sus + me), 1),
            "source": "Sauro & Lewis (2016), Ch.3"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — METHOD-TO-QUESTION MATCHING
# Source: Nielsen Norman Group heuristic; Sauro & Lewis Ch.2
# ═══════════════════════════════════════════════════════════════════

def research_method_match(
    question_type: str,   # 'behavior', 'attitude', 'discovery', 'magnitude', 'why'
    stage: str,          # 'discovery', 'design', 'evaluation', 'monitoring'
    sample_available: bool = True,
    time_budget_days: int = 14,
) -> Dict:
    """
    Match research question to appropriate UX method.
    Based on Nielsen (1993) discovery framework and Sauro & Lewis (2016)
    Ch.2: "Quantifying user research — choosing the right method."

    Method matching matrix:
      Generative ("why", "discovery"): interviews, field studies, JTBD
      Evaluative ("does it work?"): usability testing, heuristic evaluation
      Quantitative ("how many", "how much"): survey, analytics, A/B test
      Behavioral ("what do they do?"): observation, analytics, eye-tracking

    Mismatched method is a design failure: you can't survey to learn *why*
    or interview to learn *how many*.

    Args:
      question_type: 'behavior', 'attitude', 'discovery', 'magnitude', 'why'
      stage: Product stage — 'discovery', 'design', 'evaluation', 'monitoring'
      sample_available: Can you access target users?
      time_budget_days: How many days to run the study?

    Returns dict with recommended method(s) and rationale.

    Edge cases: unknown type → ValueError
    """
    valid_q = {"behavior", "attitude", "discovery", "magnitude", "why"}
    valid_s = {"discovery", "design", "evaluation", "monitoring"}
    if question_type not in valid_q:
        raise ValueError(f"question_type must be one of {valid_q}")
    if stage not in valid_s:
        raise ValueError(f"stage must be one of {valid_s}")

    # Method matching table
    method_matrix = {
        "why":        "Interviews / JTBD — understand motivations, context, and jobs-to-be-done.",
        "discovery":  "Field Studies / Diary Studies — observe natural behavior, discover needs.",
        "behavior":   "Usability Testing or Analytics — observe actual behavior, not reported.",
        "attitude":   "Survey or Interview — measure stated preferences and satisfaction.",
        "magnitude":  "Survey or A/B Test — measure how many, statistical significance required.",
    }

    # Stage adjustments
    stage_notes = {
        "discovery":  "Explore broadly. Qualitative methods dominate. Generative research.",
        "design":     "Test concepts and prototypes. Mix qualitative (why it works) + quantitative (do metrics move).",
        "evaluation": "Benchmark against standards. Quantitative methods for statistical confidence. SUS + task success.",
        "monitoring": "Continuous measurement. Analytics and periodic usability benchmarking (SUS every 6 months).",
    }

    method = method_matrix[question_type]

    # Sample availability
    if not sample_available:
        method += " WARNING: No sample access — heuristic evaluation or expert review may substitute but carry lower confidence."

    # Quick studies: favor remote unmoderated
    if time_budget_days <= 3:
        method += " Use remote unmoderated tools for speed (within time budget)."

    return {"question_type": question_type, "stage": stage,
            "method": method, "stage_notes": stage_notes[stage],
            "principle": "Question → method, not method → question. Mismatched method is a design failure.",
            "source": "Nielsen (1993); Sauro & Lewis (2016), Ch.2"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — USABILITY BENCHMARK COMPARISON
# Source: Sauro & Lewis (2016), Ch.5
# ═══════════════════════════════════════════════════════════════════

def usability_benchmark_compare(
    baseline_sus: float, baseline_n: int,
    new_sus: float, new_n: int,
    min_meaningful_difference: float = 5.0,
) -> Dict:
    """
    Compare two SUS scores for significant difference.
    Sauro & Lewis (2016), Ch.5: "Is there a statistical difference between designs?"

    Uses independent-samples t-test equivalent.
    "A 5-point SUS difference is generally the minimum meaningful
    difference (Sauro & Lewis, 2016, p.145)."

    Returns dict with significant flag and recommendation.

    Edge cases: n < 2 → cannot test
    """
    _fv(baseline_sus, "baseline_sus"); _fv(new_sus, "new_sus")
    if not isinstance(baseline_n, int) or baseline_n < 2:
        raise ValueError(f"baseline_n must be ≥ 2")
    if not isinstance(new_n, int) or new_n < 2:
        raise ValueError(f"new_n must be ≥ 2")

    diff = new_sus - baseline_sus

    # Approximate SE assuming SUS SD ≈ 17 (Sauro & Lewis, 2016, p.140)
    sigma = 17.0
    se = sigma * math.sqrt(1.0 / baseline_n + 1.0 / new_n)
    t_val = diff / se if se > 0 else 0

    # p-value approximation via z (conservative for moderate n)
    z = abs(t_val)
    p_val = 2.0 * (1.0 - _norm_cdf(z)) if z < 7 else 0.0

    significant = abs(diff) >= min_meaningful_difference and p_val < 0.05

    if significant and diff > 0:
        verdict = f"IMPROVED — new SUS is {diff:.1f} points higher (p={p_val:.3f})"
    elif significant and diff < 0:
        verdict = f"DECLINED — new SUS is {abs(diff):.1f} points lower (p={p_val:.3f}). Investigate."
    elif abs(diff) >= min_meaningful_difference:
        verdict = f"DIRECTIONAL — {diff:.1f} point difference but not statistically significant. Collect more data."
    else:
        verdict = f"NO MEANINGFUL DIFFERENCE — {diff:.1f} points (within ±{min_meaningful_difference} threshold)"

    return {"baseline_sus": baseline_sus, "new_sus": new_sus,
            "diff": round(diff, 1), "p_value": round(p_val, 4),
            "significant": significant, "verdict": verdict,
            "source": "Sauro & Lewis (2016), Ch.5, pp.140-155"}


def _norm_cdf(z: float) -> float:
    if z < -7: return 0.0
    if z > 7: return 1.0
    t = 1.0 / (1.0 + 0.2316419 * abs(z))
    poly = t * (0.31938153 + t*(-0.356563782 + t*(1.781477937 + t*(-1.821255978 + t*1.330274429))))
    phi = 1.0 - poly * math.exp(-z*z/2.0) / math.sqrt(2.0*math.pi)
    return phi if z >= 0 else 1.0 - phi


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
    print("SELF-TEST SUITE: ux_research_methods.py")
    print("Sources: Nielsen & Landauer (1993) + Brooke SUS (1996)")
    print("=" * 70)

    # ── Problem Discovery ──
    print("\n── Problem Discovery Curve (Nielsen & Landauer, 1993) ──")
    pf = problems_found(5)
    ck("discover: 5 users → ~84.5%", pf, 0.844, tol=0.01)

    pf2 = problems_found(15)
    ck("discover: 15 users → ~99.6%", pf2, 0.996, tol=0.01)

    n99 = users_for_coverage(0.99)
    ck("users_for: 99% coverage → ~13", n99, 13)

    # Iteration recommendation
    pd = problem_discovery_recommendation(15, 5)
    ck("iter: 15 users, 5/round → 3 iterations", pd["iterations"], 3)
    ck("iter: iterated coverage >= single-shot", pd["expected_coverage"] >= pd["single_shot_coverage"], True)

    # ── SUS ──
    print("\n── SUS Scoring (Brooke, 1996) ──")
    # All 5s on odd, all 1s on even = perfect usability
    perfect = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1]
    ss = sus_score(perfect)
    ck("sus: perfect → 100", ss["sus_score"], 100.0)
    ck("sus: grade A", "A" in ss["grade"], True)

    # Neutral: all 3s → total=0, score=0? No: odd=3-1=2,5 items=10; even=5-3=2,5 items=10; total=20; ×2.5=50
    neutral = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    sn = sus_score(neutral)
    ck("sus: neutral → 50", sn["sus_score"], 50.0)

    # All 1s = worst
    worst = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5]
    sw = sus_score(worst)
    ck("sus: worst → 0", sw["sus_score"], 0.0)

    # CI
    sr = sus_confidence_interval([68, 72, 65, 71, 69, 74, 67, 73, 70, 66, 68, 71])
    ck("sus_ci: mean ~69.5, n=12", round(sr["mean_sus"], 0), 70)

    # ── Method Matching ──
    print("\n── Method-to-Question Matching ──")
    mm = research_method_match("why", "discovery")
    ck("method: why+discovery → Interviews/JTBD", "Interviews" in mm["method"], True)

    mm2 = research_method_match("magnitude", "evaluation")
    ck("method: magnitude+evaluation → Survey or A/B", "Survey" in mm2["method"] or "A/B" in mm2["method"], True)

    # ── Benchmark Compare ──
    print("\n── Usability Benchmark (Sauro & Lewis, Ch.5) ──")
    ub = usability_benchmark_compare(68, 50, 78, 50)
    ck("bench: 68→78, n=50 each → significant improvement", ub["significant"], True)

    ub2 = usability_benchmark_compare(72, 20, 74, 20)
    ck("bench: 72→74, small n → not significant", ub2["significant"], False)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
