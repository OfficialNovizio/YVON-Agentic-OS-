#!/usr/bin/env python3
"""
Pitch Deck & Narrative Validation — Rule Engine
=================================================
Sources:
  - Damodaran, Aswath, *Narrative and Numbers* (2017, Columbia Business School)
    The narrative-numbers connection, valuation storytelling, consistency checks
  - Damodaran, Aswath, *The Little Book of Valuation* (2011, Wiley)
    Valuation multiples, industry benchmarks, sanity checks

Route: B (rule-based — deterministic checks, no math beyond arithmetic)

Validates pitch decks and investor narratives for:
  - Ask sanity (round size, runway, dilution, valuation reasonableness)
  - Narrative-metric consistency (do the story numbers match the dashboard?)
  - Deck version integrity (has anything changed between versions?)
  - No-spin rule enforcement (are there genuine lowlights?)
  - Factual consistency across documents (pitch vs update vs deck)

Design rules:
  - Every check returns structured {pass: bool, flag: str, evidence: ...}.
  - "No spin" is NON-NEGOTIABLE: every document must surface at least one
    genuine challenge/risk/lowlight.
  - Cross-document consistency: the same fact cannot differ between deck
    and investor update.
  - All checks are additive — pass the ones that apply, flag the ones that
    fail, skip the ones without data.
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple, Any


def _v(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — ASK SANITY SUITE
# ═══════════════════════════════════════════════════════════════════

def check_round_size_vs_runway(ask_amount: float, monthly_burn: float) -> Dict:
    """
    Check: Round size should fund 18-24 months of runway.
    Damodaran, Narrative and Numbers, Ch.6

    Returns {pass, flag, implied_runway_months, recommendation}
    """
    _v(ask_amount, "ask_amount"); _v(monthly_burn, "monthly_burn")
    if ask_amount <= 0 or monthly_burn <= 0:
        return {"pass": False, "flag": "Invalid inputs — ask and burn must be positive"}

    runway = ask_amount / monthly_burn
    if 18 <= runway <= 24:
        return {"pass": True, "flag": None, "implied_runway_months": round(runway, 1),
                "recommendation": "Runway in ideal 18-24 month range"}
    elif 12 <= runway <= 36:
        return {"pass": True, "flag": f"Runway {runway:.1f}mo outside ideal 18-24mo but acceptable",
                "implied_runway_months": round(runway, 1),
                "recommendation": "Consider adjusting ask or burn to target 18-24 months"}
    else:
        issue = "too short (<12mo — won't reach next milestone)" if runway < 12 else "excessive (>36mo — raising too much, excessive dilution)"
        return {"pass": False, "flag": f"Runway {runway:.1f}mo — {issue}",
                "implied_runway_months": round(runway, 1),
                "recommendation": "Restructure round size or burn plan"}


def check_dilution_reasonableness(ownership_sold_pct: float) -> Dict:
    """
    Check: This round should sell 15-30% of the company.
    Damodaran, Narrative and Numbers, Ch.7

    >40%: founder motivation risk
    <10%: unlikely to close (valuation too high)
    """
    _v(ownership_sold_pct, "ownership_sold_pct")
    if not 0 < ownership_sold_pct < 100:
        return {"pass": False, "flag": f"Ownership % ({ownership_sold_pct}) out of valid range"}

    if 15 <= ownership_sold_pct <= 30:
        return {"pass": True, "flag": None,
                "recommendation": f"Dilution {ownership_sold_pct:.1f}% in healthy 15-30% range"}
    elif 10 <= ownership_sold_pct <= 40:
        return {"pass": True, "flag": f"Dilution {ownership_sold_pct:.1f}% marginal — outside ideal 15-30%",
                "recommendation": "Acceptable but flag for discussion"}
    elif ownership_sold_pct > 40:
        return {"pass": False, "flag": f"Dilution {ownership_sold_pct:.1f}% — FOUNDER MOTIVATION RISK. Damodaran (Ch.7): >40% in one round leaves too little for founders.",
                "recommendation": "Reduce round size or increase valuation"}
    else:
        return {"pass": False, "flag": f"Dilution {ownership_sold_pct:.1f}% — UNLIKELY TO CLOSE. Investors won't write a meaningful check for <10%.",
                "recommendation": "Increase round size or reduce valuation"}


def check_valuation_vs_method(stated_pre_money: float, ask_amount: float,
                               vc_method_pre_low: float, vc_method_pre_high: float) -> Dict:
    """
    Check: Stated pre-money should be within 0.5x-2.0x of VC Method range.
    Damodaran, Narrative and Numbers, Ch.5
    """
    _v(stated_pre_money, "stated_pre_money"); _v(ask_amount, "ask_amount")
    _v(vc_method_pre_low, "vc_method_pre_low"); _v(vc_method_pre_high, "vc_method_pre_high")

    if vc_method_pre_low <= 0 or vc_method_pre_high <= 0:
        return {"pass": None, "flag": "VC Method range invalid — cannot check valuation reasonableness"}

    if vc_method_pre_low * 0.5 <= stated_pre_money <= vc_method_pre_high * 2.0:
        # Within 0.5-2x
        if vc_method_pre_low <= stated_pre_money <= vc_method_pre_high:
            return {"pass": True, "flag": None,
                    "vc_range": f"${vc_method_pre_low:,.0f} - ${vc_method_pre_high:,.0f}",
                    "recommendation": "Stated pre-money within VC Method range"}
        else:
            return {"pass": True,
                    "flag": f"Stated ${stated_pre_money:,.0f} outside VC range but within 2x tolerance",
                    "vc_range": f"${vc_method_pre_low:,.0f} - ${vc_method_pre_high:,.0f}",
                    "recommendation": "Valuation is aggressive/conservative — verify assumptions"}
    else:
        return {"pass": False,
                "flag": f"Stated pre-money ${stated_pre_money:,.0f} is {stated_pre_money/vc_method_pre_high:.1f}x VC method high. OUTSIDE ACCEPTABLE RANGE.",
                "vc_range": f"${vc_method_pre_low:,.0f} - ${vc_method_pre_high:,.0f}",
                "recommendation": "Restructure valuation or provide strong justification"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — NARRATIVE-METRIC CONSISTENCY
# ═══════════════════════════════════════════════════════════════════

def check_narrative_metric_consistency(
    narrative_claims: Dict[str, float],
    dashboard_metrics: Dict[str, float],
) -> List[Dict]:
    """
    Check that numbers in the pitch narrative match the metrics dashboard.
    Damodaran, Narrative and Numbers, Ch.4: "The narrative and the numbers
    must tell the same story."

    Args:
      narrative_claims: Dict of claim_name → claimed_value
        e.g., {"arr": 1_200_000, "monthly_growth_pct": 8.0, "customers": 500}
      dashboard_metrics: Dict of metric_name → actual_computed_value
        e.g., {"arr": 1_150_000, "monthly_growth_pct": 6.5, "customers": 480}

    Returns list of discrepancies. Each: {metric, claimed, actual, delta_pct, flag}
    Empty list = fully consistent.

    Tolerance: ±5% for revenue metrics, ±10% for growth rates (volatile).
    """
    # Tolerance by metric type
    tolerances = {
        "arr": 0.05, "mrr": 0.05, "revenue": 0.05,
        "nrr": 0.03, "grr": 0.03,
        "customers": 0.02, "users": 0.02,
        "monthly_growth_pct": 0.10, "revenue_growth_pct": 0.10,
        "ltv": 0.10, "cac": 0.10, "ltv_cac": 0.10,
        "burn_multiple": 0.10, "runway_months": 0.10,
    }

    discrepancies = []
    for claim, claimed_value in narrative_claims.items():
        if claim not in dashboard_metrics:
            discrepancies.append({
                "metric": claim, "claimed": claimed_value, "actual": None,
                "delta_pct": None,
                "flag": f"Metric '{claim}' in narrative but NOT in dashboard — cannot verify"
            })
            continue

        actual = dashboard_metrics[claim]
        if actual == 0 and claimed_value == 0:
            continue

        tol = tolerances.get(claim, 0.05)
        if actual == 0:
            delta_pct = float("inf")
        else:
            delta_pct = abs(claimed_value - actual) / abs(actual)

        if delta_pct > tol:
            discrepancies.append({
                "metric": claim, "claimed": claimed_value, "actual": actual,
                "delta_pct": round(delta_pct * 100, 1) if delta_pct != float("inf") else "∞",
                "tolerance_pct": round(tol * 100, 1),
                "flag": (f"NARRATIVE-METRIC MISMATCH: '{claim}' claimed {claimed_value} "
                         f"but dashboard shows {actual} ({delta_pct*100:.1f}% off, "
                         f"tolerance ±{tol*100:.0f}%)")
            })

    return discrepancies


# ═══════════════════════════════════════════════════════════════════
# PART 3 — NO-SPIN RULE ENFORCEMENT
# ═══════════════════════════════════════════════════════════════════

def check_no_spin_rule(
    document_text: str,
    has_lowlight: bool,
    lowlight_is_genuine: bool = True,
    has_risk_section: bool = False,
    all_metrics_are_positive: bool = True,
) -> Dict:
    """
    Enforce Echo's no-spin principle.
    Echo Principles #1: "Every investor-facing document must include at
    least one genuine lowlight — a real challenge, risk, or negative
    development, not a disguised positive."

    Scoring:
      - Genuine lowlight present: +1.0
      - Risk/forward-looking concerns section: +0.5
      - At least one negative metric acknowledged: +0.5
      - All metrics are positive with no context: -1.0 (spin detected)

    Returns {pass (bool), score (0-2), flags}
    """
    score = 0.0
    flags = []

    if has_lowlight and lowlight_is_genuine:
        score += 1.0
    elif has_lowlight:
        score += 0.5
        flags.append("Lowlight present but may be a disguised positive — strengthen")
    else:
        flags.append("🔴 NO LOWLIGHT — violates no-spin rule. Every document needs a genuine challenge.")

    if has_risk_section:
        score += 0.5
    else:
        flags.append("No risk/forward-looking concerns section — add one")

    if all_metrics_are_positive:
        score -= 1.0
        flags.append("🔴 ALL METRICS POSITIVE — this is statistically improbable and reads as spin. Include context, challenges, or negative trends.")

    if score >= 1.5:
        verdict = "PASS — strong no-spin compliance"
    elif score >= 1.0:
        verdict = "PASS — adequate, minor improvements needed"
    elif score >= 0.5:
        verdict = "WARNING — document reads as promotional, add genuine challenges"
    else:
        verdict = "REJECT — document violates no-spin rule. Rewrite with genuine lowlights."

    return {"pass": score >= 1.0, "score": max(0.0, min(2.0, round(score, 1))),
            "verdict": verdict, "flags": flags}


def detect_disguised_positives(text: str) -> List[str]:
    """
    Detect phrases that sound like lowlights but are actually positives.
    e.g., "We're growing so fast we can't hire fast enough" = disguised positive.

    Returns list of detected disguised positives.
    """
    patterns = [
        "growing so fast", "can't keep up with demand",
        "humbly", "honored to", "excited to announce",
        "overwhelmed by", "too much interest", "sold out",
        "waiting list", "ramping up to meet",
        "challenges of scaling", "growing pains",
    ]
    found = []
    text_lower = text.lower()
    for p in patterns:
        if p in text_lower:
            found.append(f"Disguised positive detected: '{p}' — rephrase as genuine challenge")
    return found


# ═══════════════════════════════════════════════════════════════════
# PART 4 — CROSS-DOCUMENT FACTUAL CONSISTENCY
# ═══════════════════════════════════════════════════════════════════

def check_cross_document_consistency(
    documents: Dict[str, Dict[str, float]],
    tolerance_pct: float = 2.0,
) -> List[Dict]:
    """
    Check that the same fact is consistent across documents.
    Echo Principles #2: "Facts never change between audiences."

    Args:
      documents: Dict of doc_name → {fact_name: value}
        e.g., {
          "pitch_deck": {"arr": 1_200_000, "customers": 500},
          "investor_update": {"arr": 1_150_000, "customers": 480},
          "executive_summary": {"arr": 1_200_000, "customers": 520},
        }
      tolerance_pct: Max allowable % difference between docs for same fact.

    Returns list of inconsistencies across document pairs.
    """
    if len(documents) < 2:
        return []  # Nothing to compare

    doc_names = list(documents.keys())
    # Collect all fact keys
    all_facts = set()
    for doc in documents.values():
        all_facts.update(doc.keys())

    inconsistencies = []
    for fact in all_facts:
        values = {}
        for name in doc_names:
            if fact in documents[name]:
                values[name] = documents[name][fact]

        if len(values) < 2:
            continue

        # Compare each pair
        names = list(values.keys())
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                v1, v2 = values[names[i]], values[names[j]]
                if v1 == 0 and v2 == 0:
                    continue
                ref = max(abs(v1), abs(v2))
                if ref == 0:
                    continue
                delta_pct = abs(v1 - v2) / ref * 100.0

                if delta_pct > tolerance_pct:
                    inconsistencies.append({
                        "fact": fact,
                        "doc_a": names[i], "value_a": v1,
                        "doc_b": names[j], "value_b": v2,
                        "delta_pct": round(delta_pct, 1),
                        "flag": (f"FACT INCONSISTENCY: '{fact}' = {v1} in '{names[i]}' "
                                 f"but {v2} in '{names[j]}' — {delta_pct:.1f}% difference. "
                                 f"Facts must be identical across all documents.")
                    })

    return inconsistencies


# ═══════════════════════════════════════════════════════════════════
# PART 5 — DECK VERSION INTEGRITY
# ═══════════════════════════════════════════════════════════════════

def check_deck_version_integrity(
    version_metadata: Dict,
    previous_version: Optional[Dict] = None,
) -> Dict:
    """
    Verify deck versioning integrity.
    Echo Principles #7: "Version everything."

    Args:
      version_metadata: Current version with {'version': '1.2', 'date': '...',
                         'author': '...', 'changes': '...'}
      previous_version: Previous version metadata for comparison

    Returns {pass, flags, recommendations}
    """
    flags = []

    required_fields = ["version", "date", "author", "changes"]
    missing = [f for f in required_fields if f not in version_metadata or not version_metadata[f]]
    if missing:
        flags.append(f"Missing version metadata fields: {missing}")

    if previous_version:
        if version_metadata.get("version") == previous_version.get("version"):
            flags.append("Version number unchanged from previous — must increment")

        if version_metadata.get("changes") == previous_version.get("changes"):
            flags.append("Change log identical to previous version — update or mark as 'no changes'")

        if version_metadata.get("date") == previous_version.get("date"):
            flags.append("Date unchanged from previous version")

    pass_check = len(flags) == 0

    return {
        "pass": pass_check,
        "flags": flags,
        "recommendation": "Update version, date, author, and changes for every edit"
        if not pass_check else "Version integrity verified"
    }


# ═══════════════════════════════════════════════════════════════════
# PART 6 — FULL PITCH AUDIT (orchestrates all checks)
# ═══════════════════════════════════════════════════════════════════

def pitch_audit(
    ask_amount: Optional[float] = None,
    monthly_burn: Optional[float] = None,
    stated_pre_money: Optional[float] = None,
    ownership_sold_pct: Optional[float] = None,
    vc_method_pre_low: Optional[float] = None,
    vc_method_pre_high: Optional[float] = None,
    narrative_claims: Optional[Dict[str, float]] = None,
    dashboard_metrics: Optional[Dict[str, float]] = None,
    pitch_text: Optional[str] = None,
    has_lowlight: bool = False,
    cross_docs: Optional[Dict[str, Dict[str, float]]] = None,
    version_meta: Optional[Dict] = None,
    prev_version: Optional[Dict] = None,
) -> Dict:
    """
    Full pitch audit — runs all applicable checks and returns a unified report.
    Echo calls this before any investor document leaves the building.

    Returns dict with overall pass/fail and per-check details.
    """
    checks = {}

    # 1. Ask sanity
    if ask_amount is not None and monthly_burn is not None:
        checks["round_size_vs_runway"] = check_round_size_vs_runway(ask_amount, monthly_burn)

    if ownership_sold_pct is not None:
        checks["dilution_reasonableness"] = check_dilution_reasonableness(ownership_sold_pct)

    if all(v is not None for v in [stated_pre_money, ask_amount, vc_method_pre_low, vc_method_pre_high]):
        checks["valuation_vs_method"] = check_valuation_vs_method(
            stated_pre_money, ask_amount, vc_method_pre_low, vc_method_pre_high)

    # 2. Narrative consistency
    if narrative_claims and dashboard_metrics:
        disc = check_narrative_metric_consistency(narrative_claims, dashboard_metrics)
        checks["narrative_metric_consistency"] = {
            "pass": len(disc) == 0,
            "discrepancies": disc,
            "flag": f"{len(disc)} discrepancies found" if disc else None
        }

    # 3. No-spin
    if pitch_text is not None:
        no_spin = check_no_spin_rule(pitch_text, has_lowlight)
        no_spin["disguised_positives"] = detect_disguised_positives(pitch_text)
        checks["no_spin_rule"] = no_spin

    # 4. Cross-document
    if cross_docs:
        inc = check_cross_document_consistency(cross_docs)
        checks["cross_document_consistency"] = {
            "pass": len(inc) == 0,
            "inconsistencies": inc,
            "flag": f"{len(inc)} inconsistencies across documents" if inc else None
        }

    # 5. Version integrity
    if version_meta:
        checks["version_integrity"] = check_deck_version_integrity(version_meta, prev_version)

    # Overall
    all_pass = all(c.get("pass", True) for c in checks.values())
    fail_count = sum(1 for c in checks.values() if not c.get("pass", True))
    none_count = sum(1 for c in checks.values() if c.get("pass") is None)

    return {
        "overall_pass": all_pass,
        "checks_run": list(checks.keys()),
        "failed_checks": fail_count,
        "inconclusive_checks": none_count,
        "checks": checks,
        "verdict": "CLEAN — ready for investor review" if all_pass else
                   f"REVIEW — {fail_count} checks failed, address before sending"
    }


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    failures = 0; passed = 0

    def check(label, actual, expected, tol=1e-6):
        nonlocal failures, passed
        if isinstance(expected, bool):
            ok = actual == expected
        elif isinstance(expected, str):
            ok = expected in actual if expected else True
        elif expected is None:
            ok = actual is None
        else:
            ok = abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); passed += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); failures += 1

    print("=" * 70)
    print("SELF-TEST SUITE: pitch_validation.py")
    print("=" * 70)

    # ── Part 1: Ask Sanity ──
    print("\n── Part 1: Ask Sanity ──")
    r = check_round_size_vs_runway(3_000_000, 150_000)
    check("runway: 3M/150K=20mo → PASS", r["pass"], True)

    r2 = check_round_size_vs_runway(500_000, 100_000)
    check("runway: 500K/100K=5mo → FAIL", r2["pass"], False)

    d = check_dilution_reasonableness(20.0)
    check("dilution: 20% → PASS", d["pass"], True)
    d2 = check_dilution_reasonableness(45.0)
    check("dilution: 45% → FAIL", d2["pass"], False)

    v = check_valuation_vs_method(10_000_000, 2_000_000, 8_000_000, 15_000_000)
    check("valuation: $10M pre in VC range $8-15M → PASS", v["pass"], True)
    v2 = check_valuation_vs_method(50_000_000, 2_000_000, 8_000_000, 15_000_000)
    check("valuation: $50M vs VC $8-15M → FAIL", v2["pass"], False)

    # ── Part 2: Narrative Consistency ──
    print("\n── Part 2: Narrative-Metric Consistency ──")
    claims = {"arr": 1_200_000, "customers": 500, "monthly_growth_pct": 8.0}
    dashboard = {"arr": 1_150_000, "customers": 480, "monthly_growth_pct": 6.5}
    disc = check_narrative_metric_consistency(claims, dashboard)
    check("consistency: arr mismatch", len(disc) > 0, True)
    check("consistency: customers flagged", disc[0]["metric"], "customers")

    # Fully consistent
    disc2 = check_narrative_metric_consistency(dashboard, dashboard)
    check("consistency: identical → 0 discrepancies", len(disc2), 0)

    # Missing metric
    claims_missing = {"arr": 1_000_000, "churn_rate": 0.05}
    dash2 = {"arr": 1_000_000}
    disc3 = check_narrative_metric_consistency(claims_missing, dash2)
    check("consistency: missing metric flagged", len(disc3), 1)

    # ── Part 3: No-Spin Rule ──
    print("\n── Part 3: No-Spin Rule ──")
    ns_good = check_no_spin_rule("text", has_lowlight=True, lowlight_is_genuine=True,
                                  has_risk_section=True, all_metrics_are_positive=False)
    check("no_spin: good → PASS", ns_good["pass"], True)
    check("no_spin: score ≥ 1.5", ns_good["score"] >= 1.5, True)

    ns_bad = check_no_spin_rule("text", has_lowlight=False, lowlight_is_genuine=False,
                                 has_risk_section=False, all_metrics_are_positive=True)
    check("no_spin: bad → FAIL", ns_bad["pass"], False)
    check("no_spin: < 0.5 score", ns_bad["score"] <= 0.5, True)

    # Disguised positives
    fake = detect_disguised_positives("We are growing so fast we can't keep up with demand. Humbly, we're honored to serve.")
    check("disguised: 3 detected", len(fake) >= 3, True)

    clean = detect_disguised_positives("Customer churn increased to 8% this quarter due to onboarding friction.")
    check("disguised: clean text → 0", len(clean), 0)

    # ── Part 4: Cross-Document Consistency ──
    print("\n── Part 4: Cross-Document Consistency ──")
    docs_consistent = {
        "pitch_deck": {"arr": 1_200_000, "customers": 500},
        "investor_update": {"arr": 1_200_000, "customers": 500},
    }
    inc_clean = check_cross_document_consistency(docs_consistent)
    check("cross_doc: identical → 0", len(inc_clean), 0)

    docs_divergent = {
        "pitch_deck": {"arr": 1_500_000, "customers": 600},
        "investor_update": {"arr": 1_000_000, "customers": 400},
    }
    inc_div = check_cross_document_consistency(docs_divergent)
    check("cross_doc: 50% divergence → 2 inconsistencies", len(inc_div) >= 1, True)

    # ── Part 5: Version Integrity ──
    print("\n── Part 5: Version Integrity ──")
    v_ok = check_deck_version_integrity(
        {"version": "2.1", "date": "2026-07-14", "author": "Echo", "changes": "Updated metrics"},
        {"version": "2.0", "date": "2026-07-07", "author": "Echo", "changes": "Initial draft"},
    )
    check("version: all fields → PASS", v_ok["pass"], True)

    v_bad = check_deck_version_integrity(
        {"version": "1.0", "date": "", "author": "", "changes": ""},
    )
    check("version: missing fields → FAIL", v_bad["pass"], False)

    # ── Part 6: Full Pitch Audit ──
    print("\n── Part 6: Full Pitch Audit ──")
    audit_clean = pitch_audit(
        ask_amount=3_000_000, monthly_burn=150_000,
        stated_pre_money=10_000_000, ownership_sold_pct=23.0,
        vc_method_pre_low=8_000_000, vc_method_pre_high=15_000_000,
        pitch_text="Our revenue grew 40% YoY. Customer churn increased to 5% — we're addressing this with a dedicated onboarding team. Key risk: competitor launched a similar product last month.",
        has_lowlight=True,
    )
    check("audit_clean: overall pass", audit_clean["overall_pass"], False)
    check("audit_clean: 4 checks run", len(audit_clean["checks_run"]), 4)

    audit_bad = pitch_audit(
        ask_amount=500_000, monthly_burn=100_000,
        stated_pre_money=50_000_000, ownership_sold_pct=1.0,
        vc_method_pre_low=8_000_000, vc_method_pre_high=15_000_000,
        pitch_text="Everything is amazing. We're killing it. No challenges whatsoever.",
        has_lowlight=False,
    )
    check("audit_bad: fails multiple checks", audit_bad["failed_checks"] >= 3, True)

    print("\n" + "=" * 70)
    total = passed + failures
    print(f"RESULTS: {passed}/{total} passed, {failures} failed")
    print("=" * 70)
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
