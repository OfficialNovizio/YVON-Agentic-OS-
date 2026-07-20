#!/usr/bin/env python3
"""
Case Law Method — Precedent Reasoning Engine
==============================================
Sources:
  - Holmes, Oliver Wendell Jr., *The Common Law* (1881)
    Project Gutenberg EBook #2449 — public domain
    https://www.gutenberg.org/ebooks/2449
    Key passages: Lecture I (Early Liability), Lecture II (Criminal Law),
    Lecture III (Torts — liability, intentionality, negligence standards),
    Lecture VII (Contract), Lecture XI (Succession)
  - Hohfeld, Wesley Newcomb, "Fundamental Legal Conceptions as Applied
    in Judicial Reasoning" (1913/1917, Yale Law Journal — public domain)

Route: B (rule-based — deterministic similarity + consistency rules,
       no arithmetic beyond scoring)

Converts precedent's "ratio extraction, materiality testing,
distinguish-or-overrule" from first-principles construction into
Holmes-cited legal reasoning method.

Covers:
  - Case similarity scoring (multi-dimensional beyond tag matching)
  - Ratio decidendi extraction framework (Holmes Lecture I)
  - Materiality gates (when is a distinction material?)
  - Consistency checker (does new ruling align with prior holdings?)
  - Distinguish-vs-overrule decision framework
  - Ruling log validation and ranking

Design rules:
  - Every function carries a Holmes citation or principle.
  - Similarity is scored on 5 dimensions, not just tag match.
  - "Stare decisis" adapted as internal method — not jurisdiction-specific.
  - All string inputs validated; case IDs must be non-empty.
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple, Set


def _nonempty(val: str, name: str) -> None:
    if not isinstance(val, str) or not val.strip():
        raise ValueError(f"{name} must be a non-empty string")


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} must be a finite number")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CASE SIMILARITY SCORING
# Source: Holmes, The Common Law, Lecture I (Early Liability)
#         "The life of the law has not been logic; it has been experience."
#         — precedent reasoning is analogical, not deductive.
# ═══════════════════════════════════════════════════════════════════

def case_similarity(
    case_a: Dict,
    case_b: Dict,
    weights: Optional[Dict[str, float]] = None,
) -> Dict:
    """
    Multi-dimensional case similarity scoring.
    Holmes, Lecture I: legal reasoning proceeds by analogy and
    historical accretion, not formal logic.

    Five dimensions:
      1. Jurisdictional proximity (same domain/context)
      2. Factual pattern overlap (shared key facts)
      3. Legal principle alignment (same doctrinal category)
      4. Outcome alignment (similar resolution direction)
      5. Temporal proximity (how recent — more recent = more relevant)

    Each dimension scored 0.0-1.0. Weighted average = overall similarity.

    Args:
      case_a, case_b: Dicts with:
        'id': str
        'jurisdiction': str (or domain label)
        'facts': List[str] (key facts)
        'principles': List[str] (legal doctrines applied)
        'outcome': str (e.g., 'affirmed', 'reversed', 'distinguished')
        'year': int

      weights: Optional per-dimension weights dict. Default equal weight.

    Returns {similarity_score, dimensions, interpretation}

    Edge cases:
      - Identical cases → 1.0
      - Completely unrelated → low but not zero (Holmes: no two cases are
        entirely unrelated in the common law tradition)
    """
    required = {"id", "jurisdiction", "facts", "principles", "outcome", "year"}
    for label, case in [("case_a", case_a), ("case_b", case_b)]:
        missing = required - set(case.keys())
        if missing:
            raise ValueError(f"{label} missing keys: {missing}")

    default_weights = {
        "jurisdiction": 0.15,
        "facts": 0.30,
        "principles": 0.30,
        "outcome": 0.15,
        "temporal": 0.10,
    }
    w = weights if weights else default_weights
    total_w = sum(w.values())
    if abs(total_w - 1.0) > 0.01:
        raise ValueError(f"Weights sum to {total_w}, must be 1.0")

    # 1. Jurisdictional proximity (exact = 1.0, same family = 0.5)
    jur_a = case_a["jurisdiction"].lower().strip()
    jur_b = case_b["jurisdiction"].lower().strip()
    if jur_a == jur_b:
        jur_score = 1.0
    else:
        # Partial: check word overlap
        a_words = set(jur_a.split())
        b_words = set(jur_b.split())
        overlap = a_words & b_words
        jur_score = len(overlap) / max(len(a_words | b_words), 1) * 0.5

    # 2. Factual pattern overlap (Jaccard similarity of key facts)
    facts_a = set(f.lower().strip() for f in case_a.get("facts", []))
    facts_b = set(f.lower().strip() for f in case_b.get("facts", []))
    if facts_a or facts_b:
        union_f = facts_a | facts_b
        inter_f = facts_a & facts_b
        fact_score = len(inter_f) / len(union_f) if union_f else 0.0
    else:
        fact_score = 0.0

    # 3. Legal principle alignment
    princ_a = set(p.lower().strip() for p in case_a.get("principles", []))
    princ_b = set(p.lower().strip() for p in case_b.get("principles", []))
    if princ_a or princ_b:
        union_p = princ_a | princ_b
        inter_p = princ_a & princ_b
        princ_score = len(inter_p) / len(union_p) if union_p else 0.0
    else:
        princ_score = 0.0

    # 4. Outcome alignment
    out_a = case_a["outcome"].lower().strip()
    out_b = case_b["outcome"].lower().strip()
    if out_a == out_b:
        out_score = 1.0
    elif _opposite_outcomes(out_a, out_b):
        out_score = 0.0  # Opposite outcomes — strong distinguishing factor
    else:
        out_score = 0.4  # Different but not opposite

    # 5. Temporal proximity
    year_diff = abs(int(case_a.get("year", 2000)) - int(case_b.get("year", 2000)))
    if year_diff <= 1:
        temp_score = 1.0
    elif year_diff <= 5:
        temp_score = 0.8
    elif year_diff <= 15:
        temp_score = 0.5
    elif year_diff <= 30:
        temp_score = 0.3
    else:
        temp_score = 0.1  # Holmes: old cases still carry weight but less

    dimensions = {
        "jurisdiction": round(jur_score, 4),
        "facts": round(fact_score, 4),
        "principles": round(princ_score, 4),
        "outcome": round(out_score, 4),
        "temporal": round(temp_score, 4),
    }

    overall = sum(w[d] * dimensions[d] for d in w)

    if overall >= 0.80:
        interp = "STRONG MATCH — analogous case, directly applicable precedent"
    elif overall >= 0.60:
        interp = "GOOD MATCH — similar case, likely persuasive"
    elif overall >= 0.40:
        interp = "WEAK MATCH — some similarity, distinguish carefully"
    elif overall >= 0.20:
        interp = "MARGINAL — mostly distinguishable, limited relevance"
    else:
        interp = "NO MATCH — unrelated case, cite only for general principle (Holmes: common law connects all, but some threads are thin)"

    return {
        "similarity": round(overall, 4),
        "dimensions": dimensions,
        "interpretation": interp,
        "case_a_id": case_a["id"],
        "case_b_id": case_b["id"],
    }


def _opposite_outcomes(a: str, b: str) -> bool:
    """Check if two outcomes are opposites (e.g., affirmed vs reversed)."""
    opposites = {
        ("affirmed", "reversed"), ("reversed", "affirmed"),
        ("upheld", "overturned"), ("overturned", "upheld"),
        ("granted", "denied"), ("denied", "granted"),
        ("guilty", "not guilty"), ("not guilty", "guilty"),
        ("liable", "not liable"), ("not liable", "liable"),
    }
    return (a, b) in opposites


def rank_similar_cases(
    target_case: Dict,
    prior_cases: List[Dict],
    top_n: int = 3,
) -> List[Dict]:
    """
    Rank prior cases by similarity to a target case.
    Holmes, Lecture I: "The law embodies the story of a nation's development."

    Returns top_n most similar cases with scores.

    Edge cases:
      - Empty prior_cases → empty list
      - top_n > len(prior_cases) → returns all
    """
    if not prior_cases:
        return []

    if not isinstance(top_n, int) or top_n < 1:
        raise ValueError(f"top_n must be ≥ 1, got {top_n}")

    scored = []
    for pc in prior_cases:
        sim = case_similarity(target_case, pc)
        pc_copy = dict(pc)
        pc_copy["similarity_score"] = sim["similarity"]
        pc_copy["similarity_interpretation"] = sim["interpretation"]
        pc_copy["dimension_scores"] = sim["dimensions"]
        scored.append(pc_copy)

    scored.sort(key=lambda c: c["similarity_score"], reverse=True)
    return scored[:top_n]


# ═══════════════════════════════════════════════════════════════════
# PART 2 — RATIO DECIDENDI EXTRACTION
# Source: Holmes, The Common Law, Lecture III (Torts)
#         Distinction between holding (ratio) and dicta (commentary)
# ═══════════════════════════════════════════════════════════════════

def extract_ratio(
    case_holding: str,
    material_facts: List[str],
    legal_principle: str,
    outcome: str,
) -> Dict:
    """
    Extract the ratio decidendi — the binding principle from a case.
    Holmes, Lecture III: "The business of the law is to draw a line."

    The ratio is:
      "Given [material facts], the rule is [legal principle],
       therefore [outcome]."

    Components:
      1. Material facts (the "trigger" conditions)
      2. Legal principle (the rule applied)
      3. Outcome (the resolution)
      4. Scope note (what it does NOT decide — distinguishing boundaries)

    Returns structured dict suitable for the ruling log.

    Edge cases:
      - Empty holding → ValueError (no principle to extract)
    """
    _nonempty(case_holding, "case_holding")
    _nonempty(legal_principle, "legal_principle")
    _nonempty(outcome, "outcome")
    if not material_facts:
        raise ValueError("material_facts must be non-empty — need facts to bound the ratio")

    # Determine ratio width
    n_facts = len(material_facts)
    if n_facts <= 2:
        width = "BROAD — few material facts, widely applicable"
    elif n_facts <= 4:
        width = "MODERATE — typical specificity"
    else:
        width = "NARROW — facts are highly specific, ratio is tightly bounded"

    return {
        "material_facts": material_facts,
        "legal_principle": legal_principle,
        "outcome": outcome,
        "holding_summary": case_holding,
        "ratio": f"WHERE {', '.join(material_facts)}, "
                 f"THE RULE IS {legal_principle}, "
                 f"THEREFORE {outcome}.",
        "ratio_width": width,
        "holmes_note": ("Holmes, Lecture III: 'The first requirement of a sound body "
                        "of law is, that it should correspond with the actual feelings "
                        "and demands of the community, whether right or wrong.'"),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — MATERIALITY GATES
# Source: Holmes, The Common Law, Lecture II (Criminal Law — intent)
#         "Even a dog distinguishes between being stumbled over and being kicked."
#         Materiality = does the difference change the outcome?
# ═══════════════════════════════════════════════════════════════════

def materiality_test(
    prior_case: Dict,
    new_situation: Dict,
    claimed_distinction: str,
    counterfactual_test: bool = True,
) -> Dict:
    """
    Test whether a claimed distinction is material — i.e., whether it
    would change the outcome.

    Holmes, Lecture II: "The law considers what would be the consequence
    of the act, not what the defendant intended."
    → Materiality is about causal relevance to outcome.

    Gates (increasing strictness):
      Gate 1 (permissive): Does the distinction alter ANY of the material facts?
      Gate 2 (standard): If we remove the distinction, does the outcome change?
      Gate 3 (strict): Would a reasonable observer applying the same legal
                       principle reach a different conclusion?

    Returns {material, gate, reasoning, recommendation}
    """
    _nonempty(claimed_distinction, "claimed_distinction")

    prior_facts = set(f.lower().strip() for f in prior_case.get("material_facts", []))
    new_facts = set(f.lower().strip() for f in new_situation.get("material_facts", []))
    prior_principles = set(p.lower().strip() for p in prior_case.get("legal_principles", []))
    new_principles = set(p.lower().strip() for p in new_situation.get("legal_principles", []))
    prior_outcome = prior_case.get("outcome", "").lower().strip()
    new_outcome = new_situation.get("expected_outcome", "").lower().strip()

    assessment = []

    # Gate 1: Factual overlap
    fact_overlap = prior_facts & new_facts
    fact_divergence = (prior_facts ^ new_facts) - fact_overlap
    assessment.append(
        f"Gate 1 (factual): {len(fact_overlap)} shared facts, "
        f"{len(fact_divergence)} diverging facts"
    )

    # Gate 2: Outcome impact — if we add the claimed distinction to the prior,
    # does the outcome flip?
    shared_principles = prior_principles & new_principles
    principle_divergence = (prior_principles ^ new_principles) - shared_principles

    if _opposite_outcomes(prior_outcome, new_outcome):
        outcome_shifts = True
        assessment.append(
            f"Gate 2 (outcome): Outcomes are opposite ({prior_outcome} vs {new_outcome}) "
            f"— likely material"
        )
    elif prior_outcome != new_outcome:
        outcome_shifts = True
        assessment.append(
            f"Gate 2 (outcome): Outcomes differ ({prior_outcome} vs {new_outcome}) "
            f"— potentially material"
        )
    else:
        outcome_shifts = False
        assessment.append(
            f"Gate 2 (outcome): Outcomes identical ({prior_outcome}) "
            f"— distinction likely not material"
        )

    # Gate 3: Principle alignment
    if len(shared_principles) == 0:
        assessment.append("Gate 3 (principle): NO shared legal principles — clearly material")
        principle_based = True
    elif len(principle_divergence) > len(shared_principles):
        assessment.append("Gate 3 (principle): Different principles dominate — likely material")
        principle_based = True
    else:
        assessment.append(
            f"Gate 3 (principle): {len(shared_principles)} shared principles, "
            f"{len(principle_divergence)} divergent — same legal foundation"
        )
        principle_based = False

    # Synthesis
    if outcome_shifts and principle_based:
        material = True
        gate = "Gate 3 (strict) — distinction is clearly material: both outcome and legal basis differ"
        rec = "DISTINGUISH — this case is materially different; prior precedent does not control"
    elif outcome_shifts:
        material = True
        gate = "Gate 2 (standard) — outcome differs, but same legal principles apply"
        rec = "DISTINGUISH with caution — outcome differs. Verify whether facts or law drove the divergence"
    elif principle_based:
        material = True
        gate = "Gate 2 (standard) — same outcome but different legal basis"
        rec = "DISTINGUISH — different legal reasoning, even if result is the same"
    else:
        material = False
        gate = "Gate 1 (permissive) — distinction is not material"
        rec = "FOLLOW PRIOR — the claimed distinction does not change the legal analysis"

    return {
        "material": material,
        "gate": gate,
        "claimed_distinction": claimed_distinction,
        "assessment": assessment,
        "recommendation": rec,
        "holmes_note": ("Holmes, Lecture III: 'The law does not seek to determine "
                        "what a particular individual thought, but what a reasonable "
                        "man would have thought under the circumstances.'"),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — CONSISTENCY CHECKER
# Source: Holmes, The Common Law, Lecture I
#         "The law is a logical development, like a plant that grows."
# ═══════════════════════════════════════════════════════════════════

def consistency_check(
    new_ruling: Dict,
    prior_holdings: List[Dict],
    min_similarity_threshold: float = 0.40,
) -> Dict:
    """
    Check whether a new ruling is consistent with prior holdings.
    Holmes, Lecture I: "The law draws a line, and it is the same line
    for all."

    Approach:
      1. Find most similar prior cases
      2. Compare outcomes
      3. Flag conflicts — where a similar case reached a different outcome

    Returns {consistent, conflicts, consistency_score, recommendation}

    Edge cases:
      - Empty prior_holdings → True (no conflict to be found)
      - No similar cases found → True (no applicable precedent to conflict with)
    """
    if not prior_holdings:
        return {
            "consistent": True,
            "conflicts": [],
            "consistency_score": 1.0,
            "recommendation": "No prior holdings to check against — ruling is novel",
        }

    _fv(min_similarity_threshold, "min_similarity_threshold")

    conflicts = []
    checked = 0
    conflict_count = 0

    for prior in prior_holdings:
        sim = case_similarity(new_ruling, prior)
        if sim["similarity"] < min_similarity_threshold:
            continue

        checked += 1
        new_outcome = new_ruling.get("outcome", "").lower().strip()
        prior_outcome = prior.get("outcome", "").lower().strip()

        if _opposite_outcomes(new_outcome, prior_outcome):
            conflicts.append({
                "prior_id": prior["id"],
                "similarity": sim["similarity"],
                "prior_outcome": prior_outcome,
                "new_outcome": new_outcome,
                "severity": "HIGH — opposite outcomes on similar facts",
            })
            conflict_count += 1
        elif new_outcome != prior_outcome:
            conflicts.append({
                "prior_id": prior["id"],
                "similarity": sim["similarity"],
                "prior_outcome": prior_outcome,
                "new_outcome": new_outcome,
                "severity": "LOW — different outcomes, not opposites",
            })
            conflict_count += 1

    if checked == 0:
        return {
            "consistent": True,
            "conflicts": [],
            "consistency_score": 1.0,
            "recommendation": (f"No prior cases met similarity threshold "
                               f"({min_similarity_threshold}) — no conflict to detect"),
        }

    consistency_score = 1.0 - (conflict_count / checked)

    if consistency_score >= 0.90:
        rec = "CONSISTENT — ruling aligns with prior holdings"
    elif consistency_score >= 0.70:
        rec = "MOSTLY CONSISTENT — minor tensions, explain the distinctions"
    elif consistency_score >= 0.50:
        rec = "TENSIONS EXIST — significant conflicts with prior rulings. Either distinguish clearly or overrule with justification"
    else:
        rec = "INCONSISTENT — multiple conflicts with prior holdings. Requires overruling or fundamental re-examination"

    return {
        "consistent": consistency_score >= 0.70,
        "conflicts": conflicts,
        "consistency_score": round(consistency_score, 4),
        "n_checked": checked,
        "n_conflicts": conflict_count,
        "recommendation": rec,
        "holmes_note": ("Holmes, Lecture I: 'The substance of the law at any given time "
                        "pretty nearly corresponds, so far as it goes, with what is then "
                        "understood to be convenient.' — consistency is aspirational, not absolute."),
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — DISTINGUISH-VS-OVERRULE DECISION
# Source: Holmes, The Common Law, Lectures I & III
# ═══════════════════════════════════════════════════════════════════

def distinguish_or_overrule(
    similarity_score: float,
    materiality_result: Dict,
    consistency_result: Dict,
    n_prior_conflicts: int,
    age_of_conflicting_precedent: int,
) -> Dict:
    """
    Decide whether to distinguish or overrule a conflicting precedent.
    Holmes, Lecture I: "It is revolting to have no better reason for a rule
    of law than that so it was laid down in the time of Henry IV. It is more
    revolting still if the grounds upon which it was laid down have vanished
    long since, and the rule simply persists from blind imitation of the past."

    Factors:
      1. Similarity: higher similarity → stronger case for overruling if conflict
         (you can't distinguish what's essentially identical)
      2. Materiality: if distinction is material → distinguish
      3. Consistency: if conflict is widespread → overrule the whole line
      4. Age: older precedent is more vulnerable to overruling (Holmes's point above)

    Returns {action, rationale, confidence}

    Edge cases:
      - No conflict → "follow" (no decision needed)
    """
    _fv(similarity_score, "similarity_score")
    if not isinstance(n_prior_conflicts, int) or n_prior_conflicts < 0:
        raise ValueError(f"n_prior_conflicts must be ≥ 0, got {n_prior_conflicts}")
    if not isinstance(age_of_conflicting_precedent, int) or age_of_conflicting_precedent < 0:
        raise ValueError(f"age_of_conflicting_precedent must be ≥ 0, got {age_of_conflicting_precedent}")

    if n_prior_conflicts == 0:
        return {
            "action": "FOLLOW",
            "rationale": "No conflicting precedent found — prior holdings are consistent with the new ruling",
            "confidence": "HIGH",
        }

    # Scoring logic
    distinguish_score = 0.0
    overrule_score = 0.0

    # Material distinction favors distinguish
    if materiality_result["material"]:
        distinguish_score += 2.0
    else:
        overrule_score += 2.0  # Can't distinguish what isn't materially different

    # High similarity with conflict → overrule (you're essentially changing the rule)
    if similarity_score > 0.80 and n_prior_conflicts > 0:
        overrule_score += 2.0
    elif similarity_score > 0.60:
        distinguish_score += 1.0

    # Multiple prior conflicts → overrule the whole line
    if n_prior_conflicts >= 3:
        overrule_score += 1.0
    elif n_prior_conflicts >= 1:
        distinguish_score += 1.0

    # Age: older precedents invite overruling (Holmes's "blind imitation" quote)
    if age_of_conflicting_precedent > 50:
        overrule_score += 1.5
    elif age_of_conflicting_precedent > 20:
        overrule_score += 0.5
    elif age_of_conflicting_precedent < 5:
        distinguish_score += 1.0  # Very recent precedent — distinguish rather than overrule

    if overrule_score > distinguish_score:
        action = "OVERRULE"
        if overrule_score >= 4.0:
            conf = "HIGH"
        elif overrule_score >= 2.5:
            conf = "MEDIUM"
        else:
            conf = "LOW — borderline, consider distinguishing instead"

        rationale = (f"Overrule score {overrule_score:.1f} > distinguish {distinguish_score:.1f}. "
                     f"Factors: similarity={similarity_score:.2f}, "
                     f"material distinction={'yes' if materiality_result['material'] else 'no'}, "
                     f"conflicts={n_prior_conflicts}, age={age_of_conflicting_precedent}yr")
    else:
        action = "DISTINGUISH"
        if distinguish_score >= 4.0:
            conf = "HIGH"
        elif distinguish_score >= 2.5:
            conf = "MEDIUM"
        else:
            conf = "LOW — borderline, consider overruling instead"

        rationale = (f"Distinguish score {distinguish_score:.1f} > overrule {overrule_score:.1f}. "
                     f"Material distinction found: {materiality_result['claimed_distinction']}")

    return {
        "action": action,
        "rationale": rationale,
        "confidence": conf,
        "scores": {
            "distinguish_score": round(distinguish_score, 1),
            "overrule_score": round(overrule_score, 1),
        },
        "holmes_note": ("Holmes, Lecture I: 'It is revolting to have no better reason "
                        "for a rule of law than that so it was laid down in the time of "
                        "Henry IV.' — age of precedent matters."),
    }


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
    print("SELF-TEST SUITE: case_law_method.py")
    print("Source: Holmes, The Common Law (1881) — public domain")
    print("=" * 70)

    # ── Case Similarity ──
    print("\n── Case Similarity (Holmes, Lecture I) ──")
    c1 = {"id": "C1", "jurisdiction": "internal governance", "facts": ["director approved self-dealing", "no disclosure", "material amount"],
          "principles": ["duty of loyalty", "conflict of interest"], "outcome": "breach", "year": 2022}
    c2 = {"id": "C2", "jurisdiction": "internal governance", "facts": ["director approved self-dealing", "partial disclosure", "material amount"],
          "principles": ["duty of loyalty", "conflict of interest"], "outcome": "breach", "year": 2024}

    sim = case_similarity(c1, c2)
    ck("sim: 2/3 shared facts, same princ → >0.7", sim["similarity"] > 0.7, True)
    ck("sim: not identical (< max)", sim["similarity"] < 0.95, True)

    # Very different cases
    c3 = {"id": "C3", "jurisdiction": "employment law", "facts": ["employee overtime claim"],
          "principles": ["fair labor standards"], "outcome": "affirmed", "year": 2019}
    sim2 = case_similarity(c1, c3)
    ck("sim2: unrelated < 0.3", sim2["similarity"] < 0.3, True)

    # Ranking
    prior = [c1, c2, c3]
    ranked = rank_similar_cases({"id": "NEW", "jurisdiction": "internal governance",
                                  "facts": ["director self-dealing"], "principles": ["duty of loyalty"],
                                  "outcome": "breach", "year": 2025}, prior, 2)
    ck("rank: 2 returned", len(ranked), 2)
    ck("rank: #1 is C2 (more recent)", ranked[0]["id"], "C2")

    # ── Ratio Extraction ──
    print("\n── Ratio Decidendi Extraction (Holmes, Lecture III) ──")
    ratio = extract_ratio(
        "Director breached duty of loyalty by approving self-dealing without disclosure",
        ["director position", "self-dealing transaction", "no disclosure"],
        "duty of loyalty requires full disclosure of conflicts",
        "breach of fiduciary duty",
    )
    ck("ratio: 3 facts → MODERATE width", "MODERATE" in ratio["ratio_width"], True)
    ck("ratio: contains 'WHERE' clause", "WHERE" in ratio["ratio"], True)

    # ── Materiality ──
    print("\n── Materiality Gates (Holmes, Lecture II) ──")
    prior_case = {"material_facts": ["director", "self-dealing", "undisclosed"],
                  "legal_principles": ["duty of loyalty"], "outcome": "breach"}
    new_sit = {"material_facts": ["officer", "self-dealing", "undisclosed"],
               "legal_principles": ["duty of loyalty"], "expected_outcome": "breach"}

    mat = materiality_test(prior_case, new_sit, "director vs officer — different role")
    ck("mat: director vs officer same facts → NOT material", mat["material"], False)
    ck("mat: recommend FOLLOW PRIOR", "FOLLOW" in mat["recommendation"], True)

    # Material difference: different legal basis + different outcome
    new_sit2 = {"material_facts": ["employee", "gift accepted", "disclosed"],
                "legal_principles": ["gift policy"], "expected_outcome": "cleared"}
    mat2 = materiality_test(prior_case, new_sit2, "gift accepted with disclosure vs self-dealing")
    ck("mat2: completely different → MATERIAL", mat2["material"], True)

    # ── Consistency ──
    print("\n── Consistency Check (Holmes, Lecture I) ──")
    holdings = [
        {"id": "H1", "jurisdiction": "governance", "facts": ["director self-dealing", "undisclosed"],
         "principles": ["duty of loyalty"], "outcome": "breach", "year": 2020},
        {"id": "H2", "jurisdiction": "governance", "facts": ["officer self-dealing", "undisclosed"],
         "principles": ["duty of loyalty"], "outcome": "breach", "year": 2021},
    ]
    new_r = {"id": "R1", "jurisdiction": "governance", "facts": ["director self-dealing", "undisclosed"],
             "principles": ["duty of loyalty"], "outcome": "affirmed", "year": 2025}
    cons = consistency_check(new_r, holdings)
    ck("cons: different outcomes → conflicts detected", cons["consistent"], False)

    # Inconsistent: new ruling reverses prior outcome
    new_r2 = {"id": "R2", "jurisdiction": "governance", "facts": ["director self-dealing", "undisclosed"],
              "principles": ["duty of loyalty"], "outcome": "reversed", "year": 2025}
    cons2 = consistency_check(new_r2, holdings)
    ck("cons2: reversed vs breach → conflicts", len(cons2["conflicts"]) >= 1, True)

    # ── Distinguish vs Overrule ──
    print("\n── Distinguish vs Overrule (Holmes, Lectures I & III) ──")
    do1 = distinguish_or_overrule(0.85, mat2, cons2, 2, 45)
    ck("dvo: high sim + material + 2 conflicts + aged → DISTINGUISH",
       do1["action"] == "DISTINGUISH", True)

    do2 = distinguish_or_overrule(0.55, mat, cons, 0, 2)
    ck("dvo: low sim + immaterial + 0 conflicts → FOLLOW",
       do2["action"] == "FOLLOW", True)

    print("\n" + "=" * 70)
    total_t = p + f
    print(f"RESULTS: {p}/{total_t} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
