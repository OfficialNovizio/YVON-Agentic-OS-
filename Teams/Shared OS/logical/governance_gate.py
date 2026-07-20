#!/usr/bin/env python3
"""
Governance Gate — Fiduciary & Board Oversight Rule Engine
===========================================================
Source: OECD, *G20/OECD Principles of Corporate Governance* (2023 Rev.)
        https://doi.org/10.1787/ed750b30-en (CC BY 4.0)
        Endorsed by G20, September 2023
        Chapters: I (Framework), II (Shareholder Rights), V (Disclosure),
                  VI (Sustainability), VII (Board Responsibilities)

Route: B (rule-based — deterministic governance checks with OECD-cited criteria)

Converts board's first-principles governance construction into citable
OECD-standard checks. Every rule references the specific Principle number.

Covers:
  - Board independence assessment (Principle VII)
  - Fiduciary duty of care / duty of loyalty checks
  - Strategic veto framework with governance justification
  - Conflict of interest detection and disclosure requirements
  - Constitutional enforcement (alignment with stated governance documents)
  - Sustainability & resilience oversight (Principle VI, new in 2023)

Design rules:
  - Every check returns {pass: bool, principle: str, rationale: str, flags: []}
  - OECD principles are the citable source — every check names its Principle.
  - "Pass" means the threshold is met; "Fail" means a governance gap exists.
  - No silent pass — even a pass includes a brief rationale.
  - All inputs validated; string fields may not be empty.
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _nonempty(val: str, name: str) -> None:
    if not isinstance(val, str) or not val.strip():
        raise ValueError(f"{name} must be a non-empty string")


def _pct(val: float, name: str) -> None:
    if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} must be a finite number")
    if val < 0.0 or val > 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — BOARD INDEPENDENCE ASSESSMENT
# Source: OECD Principle VII (The Responsibilities of the Board)
#         §VII.E — Board Composition and Independence
# ═══════════════════════════════════════════════════════════════════

def board_independence_check(
    total_directors: int,
    independent_directors: int,
    chair_is_independent: bool,
    has_independent_committees: bool,
    separate_ceo_chair: bool,
) -> Dict:
    """
    Assess board independence against OECD Principle VII.E.

    OECD VII.E: "The board should be able to exercise objective independent
    judgement. Boards should consider assigning a sufficient number of
    non-executive board members capable of exercising independent judgement."

    Criteria:
      1. Independent directors ≥ 50% of total (or majority for listed companies)
      2. Chair is independent OR CEO/Chair roles are separated
      3. Key committees (audit, nomination, remuneration) have independent
         members

    Returns {pass, principle, score_pct, gaps, recommendation}

    Edge cases:
      - total_directors = 0 → ValueError
      - independent_directors > total → ValueError
    """
    if not isinstance(total_directors, int) or total_directors < 1:
        raise ValueError(f"total_directors must be ≥ 1, got {total_directors}")
    if not isinstance(independent_directors, int) or independent_directors < 0:
        raise ValueError(f"independent_directors must be ≥ 0, got {independent_directors}")
    if independent_directors > total_directors:
        raise ValueError(
            f"independent_directors ({independent_directors}) cannot exceed "
            f"total_directors ({total_directors})"
        )

    ind_pct = independent_directors / total_directors
    gaps = []
    score = 0

    # Criterion 1: Independence ratio
    if ind_pct >= 0.50:
        score += 1
    elif ind_pct >= 0.33:
        score += 0.5
        gaps.append(
            f"Independent directors at {ind_pct*100:.0f}% — below 50% majority "
            f"recommended by OECD VII.E"
        )
    else:
        gaps.append(
            f"Independent directors at {ind_pct*100:.0f}% — significantly below "
            f"OECD VII.E recommendation"
        )

    # Criterion 2: Leadership independence
    if chair_is_independent or separate_ceo_chair:
        score += 1
    else:
        gaps.append(
            "Chair is not independent AND CEO/Chair roles not separated. "
            "OECD VII.E recommends independent leadership or role separation "
            "to ensure objective judgement"
        )

    # Criterion 3: Independent committees
    if has_independent_committees:
        score += 1
    else:
        gaps.append(
            "Key committees lack independent members. OECD VII.E: audit, "
            "nomination, and remuneration committees should include independent directors"
        )

    max_score = 3.0
    score_pct = score / max_score

    if score_pct >= 0.80:
        verdict = "PASS — board independence meets OECD VII.E standards"
    elif score_pct >= 0.50:
        verdict = "REVIEW — partial independence, gaps noted per OECD VII.E"
    else:
        verdict = "FAIL — insufficient independence per OECD VII.E"

    return {
        "pass": score_pct >= 0.50,
        "principle": "OECD VII.E — Board Independence",
        "score_pct": round(score_pct * 100, 1),
        "independent_pct": round(ind_pct * 100, 1),
        "gaps": gaps,
        "recommendation": verdict,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 2 — FIDUCIARY DUTY CHECKS
# Source: OECD Principle VI.D and VII (Board Responsibilities)
# ═══════════════════════════════════════════════════════════════════

def fiduciary_duty_check(
    duty_of_care_procedures: bool,
    duty_of_loyalty_safeguards: bool,
    conflict_disclosure_process: bool,
    related_party_review: bool,
    independent_oversight_exists: bool,
) -> Dict:
    """
    Check fiduciary duty framework against OECD Principles VI-VII.

    OECD VII: "Board members should act on a fully informed basis, in good
    faith, with due diligence and care, and in the best interest of the
    company and the shareholders."

    Five criteria, each boolean (evidence exists / does not exist):

    Returns {pass, principle, checks_passed, flags}

    Edge cases:
      - All booleans must be actual bool, not strings
    """
    checks = {
        "Duty of care — documented board review procedures (OECD VII.A)": duty_of_care_procedures,
        "Duty of loyalty — safeguards against self-dealing (OECD VII.B)": duty_of_loyalty_safeguards,
        "Conflict disclosure — formal process exists (OECD VII.D)": conflict_disclosure_process,
        "Related-party transactions — independent review (OECD V.A.4)": related_party_review,
        "Independent oversight — external or committee-level (OECD VII.E)": independent_oversight_exists,
    }

    for label, val in checks.items():
        if not isinstance(val, bool):
            raise TypeError(f"'{label[:30]}...' must be bool, got {type(val).__name__}")

    passes = sum(1 for v in checks.values() if v)
    total = len(checks)
    failed = [label for label, ok in checks.items() if not ok]

    if passes == total:
        verdict = "PASS — all fiduciary duty checks met per OECD VII"
    elif passes >= 3:
        verdict = f"REVIEW — {passes}/{total} checks passed. Address: {failed}"
    else:
        verdict = f"FAIL — only {passes}/{total} fiduciary checks passed. Gaps: {failed}"

    return {
        "pass": passes >= 3,
        "principle": "OECD VII.A-E — Fiduciary Duties of the Board",
        "checks_passed": f"{passes}/{total}",
        "failed_checks": failed,
        "recommendation": verdict,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CONFLICT OF INTEREST DETECTION
# Source: OECD Principle V.A and VII.D (Disclosure, Board Integrity)
# ═══════════════════════════════════════════════════════════════════

def conflict_of_interest_screen(
    disclosed_conflicts: List[str],
    has_recusal_policy: bool,
    has_disclosure_register: bool,
    has_annual_audit: bool,
    max_tolerated_undisclosed: int = 0,
) -> Dict:
    """
    Conflict of interest screening against OECD V.A and VII.D.

    OECD V.A.4: "Disclosure should include related party transactions and
    potential conflicts of interest."
    OECD VII.D: "Boards should carry out certain key functions, including
    reviewing and monitoring conflicts of interest."

    Returns {pass, principle, n_disclosed, risk_level, gaps}
    """
    if not isinstance(disclosed_conflicts, list):
        raise TypeError("disclosed_conflicts must be a list")
    for i, c in enumerate(disclosed_conflicts):
        _nonempty(c, f"disclosed_conflicts[{i}]")

    if not isinstance(max_tolerated_undisclosed, int) or max_tolerated_undisclosed < 0:
        raise ValueError(f"max_tolerated_undisclosed must be ≥ 0, got {max_tolerated_undisclosed}")

    n_disclosed = len(disclosed_conflicts)
    gaps = []
    score = 0

    if n_disclosed > 0:
        score += 0.5  # conflicts exist and are disclosed — that's honest governance
    else:
        gaps.append("No conflicts disclosed — verify completeness (OECD V.A.4)")

    if has_disclosure_register:
        score += 1.0
    else:
        gaps.append("No conflict disclosure register — OECD VII.D recommends formal tracking")

    if has_recusal_policy:
        score += 1.0
    else:
        gaps.append("No recusal policy for conflicted directors — OECD VII.D")

    if has_annual_audit:
        score += 1.0
    else:
        gaps.append("No annual audit of conflict disclosures — OECD V.A.4 recommends periodic review")

    max_score = 3.5
    score_pct = score / max_score

    if score_pct >= 0.80:
        risk = "LOW — robust conflict management framework"
    elif score_pct >= 0.50:
        risk = "MEDIUM — adequate but gaps exist"
    else:
        risk = "HIGH — insufficient conflict management per OECD standards"

    return {
        "pass": score_pct >= 0.50,
        "principle": "OECD V.A.4 + VII.D — Conflict of Interest",
        "n_disclosed": n_disclosed,
        "score_pct": round(score_pct * 100, 1),
        "risk_level": risk,
        "gaps": gaps,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — STRATEGIC VETO FRAMEWORK
# Source: OECD Principle VII.B (Key Board Functions)
# ═══════════════════════════════════════════════════════════════════

def strategic_veto_assessment(
    proposal_aligns_with_strategy: bool,
    has_financial_analysis: bool,
    has_risk_assessment: bool,
    has_independent_review: bool,
    exceeds_materiality_threshold: bool,
    conflicts_with_constitution: bool,
) -> Dict:
    """
    Evaluate whether a board should veto a strategic proposal.
    OECD VII.B: "The board should review and guide corporate strategy,
    major plans of action, risk policy, annual budgets and business plans."

    This is a framework for evaluating board actions — not a veto generator.
    It quantifies whether governance grounds exist for a veto.

    Scoring logic:
      - Proposal aligned with strategy + risk-assessed + independently reviewed
        → GOVERN (board should support)
      - Proposal fails multiple checks + triggers constitution conflict
        → VETO (board should block or refer back)
      - In between → REVIEW (board should ask for more information)

    Returns {recommended_action, score, principle, flags}

    Edge cases:
      - conflicts_with_constitution = True → automatic ESCALATE regardless of score
    """
    flags = []
    score = 0.0

    if proposal_aligns_with_strategy:
        score += 1.0
    else:
        flags.append("Proposal does not align with stated strategy — OECD VII.B requires alignment")

    if has_financial_analysis:
        score += 1.0
    else:
        flags.append("No financial analysis provided — OECD VII.B: board should review budgets and plans")

    if has_risk_assessment:
        score += 1.0
    else:
        flags.append("No risk assessment — OECD VII.B: board should set risk policy and review major risks")

    if has_independent_review:
        score += 1.0
    else:
        flags.append("No independent review — OECD VII.E: objective judgement requires independent input")

    if exceeds_materiality_threshold:
        flags.append("Proposal exceeds materiality threshold — heightened scrutiny required per OECD VII.B")

    max_score = 4.0
    score_pct = score / max_score

    # Constitution conflict is a hard override
    if conflicts_with_constitution:
        return {
            "pass": False,
            "principle": "OECD VII.B — Strategic Oversight (Constitution Conflict)",
            "recommended_action": "VETO / REFER BACK — proposal conflicts with constitutional documents",
            "constitution_conflict": True,
            "score_pct": round(score_pct * 100, 1),
            "flags": flags + ["CONSTITUTION CONFLICT — automatic escalation per governance framework"],
        }

    if score_pct >= 0.75 and not exceeds_materiality_threshold:
        action = "GOVERN — proposal meets governance standards, board should support"
    elif score_pct >= 0.50:
        action = "REVIEW — board should request additional information before deciding"
    else:
        action = "VETO / REFER BACK — proposal lacks sufficient governance backing"

    return {
        "pass": score_pct >= 0.50,
        "principle": "OECD VII.B — Strategic Oversight",
        "recommended_action": action,
        "constitution_conflict": False,
        "score_pct": round(score_pct * 100, 1),
        "flags": flags,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 5 — DISCLOSURE & TRANSPARENCY
# Source: OECD Principle V (Disclosure and Transparency)
# ═══════════════════════════════════════════════════════════════════

def disclosure_standards_check(
    financial_results_disclosed: bool,
    ownership_structure_disclosed: bool,
    board_remuneration_disclosed: bool,
    related_party_transactions_disclosed: bool,
    material_risks_disclosed: bool,
    sustainability_disclosed: bool,
    audit_committee_exists: bool,
    annual_disclosure_audited: bool,
) -> Dict:
    """
    Assess disclosure practices against OECD Principle V.

    OECD V.A: "Disclosure should include, but not be limited to, material
    information on:
      1. Financial and operating results
      2. Company objectives and non-financial information
      3. Major share ownership and voting rights
      4. Remuneration of board members and key executives
      5. Related party transactions
      6. Foreseeable risk factors
      7. Issues regarding employees and other stakeholders
      8. Governance structures and policies"

    The 2023 revision adds sustainability disclosure (Principle VI).

    Returns {pass, principle, disclosure_score, missing_disclosures, recommendation}
    """
    disclosures = {
        "Financial results (OECD V.A.1)": financial_results_disclosed,
        "Ownership structure (OECD V.A.3)": ownership_structure_disclosed,
        "Board remuneration (OECD V.A.4)": board_remuneration_disclosed,
        "Related party transactions (OECD V.A.5)": related_party_transactions_disclosed,
        "Material risks (OECD V.A.6)": material_risks_disclosed,
        "Sustainability / ESG (OECD VI, 2023 revision)": sustainability_disclosed,
    }

    processes = {
        "Audit committee exists (OECD V.C)": audit_committee_exists,
        "Annual disclosure audited (OECD V.C)": annual_disclosure_audited,
    }

    for label, val in {**disclosures, **processes}.items():
        if not isinstance(val, bool):
            raise TypeError(f"'{label[:40]}...' must be bool, got {type(val).__name__}")

    disclosed = sum(1 for v in disclosures.values() if v)
    total_disc = len(disclosures)
    processes_pass = sum(1 for v in processes.values() if v)
    total_proc = len(processes)

    missing = [label for label, ok in disclosures.items() if not ok]
    missing_proc = [label for label, ok in processes.items() if not ok]

    disc_pct = disclosed / total_disc

    if disc_pct >= 0.85 and processes_pass == total_proc:
        verdict = "PASS — disclosure meets OECD V + VI (2023) standards"
    elif disc_pct >= 0.60 and processes_pass >= 1:
        verdict = "REVIEW — disclosure adequate but missing items noted"
    else:
        verdict = "FAIL — significant disclosure gaps per OECD V"

    return {
        "pass": disc_pct >= 0.60 and processes_pass >= 1,
        "principle": "OECD V + VI — Disclosure and Transparency",
        "disclosure_pct": round(disc_pct * 100, 1),
        "missing_disclosures": missing,
        "missing_processes": missing_proc,
        "recommendation": verdict,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 6 — SUSTAINABILITY & RESILIENCE OVERSIGHT
# Source: OECD Principle VI (NEW in 2023 revision)
# ═══════════════════════════════════════════════════════════════════

def sustainability_oversight_check(
    has_sustainability_policy: bool,
    sustainability_board_oversight: bool,
    climate_risk_assessed: bool,
    esg_metrics_reported: bool,
    supply_chain_resilience_reviewed: bool,
    has_internal_controls_for_esg: bool,
) -> Dict:
    """
    Assess sustainability governance against OECD Principle VI (2023).

    NEW in 2023 revision: "The corporate governance framework should provide
    incentives for companies and their investors to make decisions and manage
    their risks, in a way that contributes to the sustainability and resilience
    of the corporation."

    Key elements (OECD VI, 2023):
      1. Sustainability disclosure (tied to V)
      2. Board oversight of sustainability
      3. Climate risk assessment
      4. ESG metrics and reporting
      5. Supply chain resilience
      6. Internal controls for ESG data

    Returns {pass, principle, score_pct, gaps, is_2023_requirement: True}
    """
    checks = {
        "Sustainability policy exists (OECD VI.A)": has_sustainability_policy,
        "Board-level sustainability oversight (OECD VI.B)": sustainability_board_oversight,
        "Climate risk assessed (OECD VI.C)": climate_risk_assessed,
        "ESG metrics reported (OECD VI.D)": esg_metrics_reported,
        "Supply chain resilience reviewed (OECD VI.C)": supply_chain_resilience_reviewed,
        "Internal controls for ESG data (OECD VI.D)": has_internal_controls_for_esg,
    }

    for label, val in checks.items():
        if not isinstance(val, bool):
            raise TypeError(f"'{label[:40]}...' must be bool, got {type(val).__name__}")

    passes = sum(1 for v in checks.values() if v)
    total = len(checks)
    gaps = [label for label, ok in checks.items() if not ok]

    score_pct = passes / total

    if score_pct >= 0.80:
        verdict = "PASS — sustainability governance aligned with OECD VI (2023)"
    elif score_pct >= 0.50:
        verdict = "REVIEW — partial sustainability governance, gaps noted per OECD VI (2023)"
    else:
        verdict = "FAIL — insufficient sustainability oversight per OECD VI (2023)"

    return {
        "pass": score_pct >= 0.50,
        "principle": "OECD VI — Sustainability & Resilience (2023 Revision)",
        "is_2023_requirement": True,
        "score_pct": round(score_pct * 100, 1),
        "checks_passed": f"{passes}/{total}",
        "gaps": gaps,
        "recommendation": verdict,
    }


# ═══════════════════════════════════════════════════════════════════
# PART 7 — FULL GOVERNANCE AUDIT
# ═══════════════════════════════════════════════════════════════════

def governance_audit(checks: Dict[str, Dict]) -> Dict:
    """
    Aggregate all governance checks into a single board audit report.

    Args:
      checks: Dict of check_name → {pass, principle, ...} from each function above

    Returns dict with:
      'overall_pass': bool
      'pass_rate': fraction of checks passing
      'critical_gaps': checks that failed
      'verdict': summary assessment

    Edge cases:
      - Empty checks → ValueError
    """
    if not checks:
        raise ValueError("checks must be non-empty — run at least one check function")

    all_pass = []
    failed = []
    for name, result in checks.items():
        if result.get("pass"):
            all_pass.append(name)
        else:
            failed.append({"name": name, "principle": result.get("principle", "unknown"),
                          "gaps": result.get("gaps", result.get("failed_checks", []))})

    pass_rate = len(all_pass) / len(checks)

    if pass_rate >= 0.90:
        verdict = "STRONG — governance framework robust, OECD-aligned"
    elif pass_rate >= 0.70:
        verdict = "ADEQUATE — most checks pass, address noted gaps"
    elif pass_rate >= 0.50:
        verdict = "WEAK — significant governance gaps, board should act"
    else:
        verdict = "CRITICAL — governance framework fundamentally deficient per OECD standards"

    return {
        "overall_pass": pass_rate >= 0.70,
        "pass_rate": round(pass_rate * 100, 1),
        "checks_run": len(checks),
        "checks_passed": len(all_pass),
        "failed_checks": failed,
        "verdict": verdict,
        "source": "G20/OECD Principles of Corporate Governance (2023, CC BY 4.0)",
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
    print("SELF-TEST SUITE: governance_gate.py")
    print("Source: G20/OECD Principles of Corporate Governance (2023)")
    print("=" * 70)

    # ── Board Independence ──
    print("\n── Board Independence (OECD VII.E) ──")
    bi = board_independence_check(10, 6, True, True, False)
    ck("ind: 6/10 indp + chair + committees → PASS", bi["pass"], True)
    ck("ind: score ≥ 80%", bi["score_pct"] >= 80.0, True)

    bi2 = board_independence_check(5, 1, False, False, False)
    ck("ind: 1/5 + no chair/committees → FAIL", bi2["pass"], False)

    # ── Fiduciary Duty ──
    print("\n── Fiduciary Duty (OECD VII.A-E) ──")
    fd = fiduciary_duty_check(True, True, True, True, True)
    ck("fid: all 5/5 → PASS", fd["pass"], True)
    ck("fid: 5 passed", fd["checks_passed"], "5/5")

    fd2 = fiduciary_duty_check(True, False, False, True, False)
    ck("fid: 2/5 → FAIL", fd2["pass"], False)

    # ── Conflict of Interest ──
    print("\n── Conflict of Interest (OECD V.A.4 + VII.D) ──")
    coi = conflict_of_interest_screen(
        ["Director A — supplier relationship", "CEO — board of competitor"],
        True, True, True,
    )
    ck("coi: full framework → PASS", coi["pass"], True)
    ck("coi: 2 disclosed + register + recusal + audit = LOW", "LOW" in coi["risk_level"], True)

    coi2 = conflict_of_interest_screen([], False, False, False)
    ck("coi2: nothing → FAIL", coi2["pass"], False)

    # ── Strategic Veto ──
    print("\n── Strategic Veto (OECD VII.B) ──")
    sv = strategic_veto_assessment(True, True, True, True, False, False)
    ck("sv: all checks pass, no conflict → GOVERN", "GOVERN" in sv["recommended_action"], True)

    sv2 = strategic_veto_assessment(True, True, True, True, False, True)
    ck("sv: constitution conflict → VETO", "VETO" in sv2["recommended_action"], True)
    ck("sv: constitution flag present", sv2["constitution_conflict"], True)

    sv3 = strategic_veto_assessment(False, False, False, False, True, False)
    ck("sv: nothing passes → VETO", "VETO" in sv3["recommended_action"] or "REVIEW" in sv3["recommended_action"], True)

    # ── Disclosure ──
    print("\n── Disclosure (OECD V + VI) ──")
    ds = disclosure_standards_check(
        True, True, True, True, True, True, True, True,
    )
    ck("disc: full disclosure → PASS", ds["pass"], True)

    ds2 = disclosure_standards_check(
        True, False, False, True, False, False, True, False,
    )
    ck("disc: sparse → FAIL", ds2["pass"], False)

    # ── Sustainability ──
    print("\n── Sustainability (OECD VI, 2023) ──")
    sus = sustainability_oversight_check(True, True, True, True, True, True)
    ck("sus: full framework → PASS", sus["pass"], True)
    ck("sus: 2023 flag", sus["is_2023_requirement"], True)

    sus2 = sustainability_oversight_check(False, False, False, False, False, False)
    ck("sus: nothing → FAIL", sus2["pass"], False)

    # ── Full Audit ──
    print("\n── Full Governance Audit ──")
    audit = governance_audit({
        "board_independence": bi,
        "fiduciary_duty": fd,
        "conflict_of_interest": coi,
        "disclosure": ds,
        "sustainability": sus,
    })
    ck("audit: all 5 pass → STRONG or ADEQUATE", "STRONG" in audit["verdict"] or "ADEQUATE" in audit["verdict"], True)
    ck("audit: 5 checks run", audit["checks_run"], 5)

    weak_audit = governance_audit({
        "board_independence": bi2,
        "fiduciary_duty": fd2,
        "disclosure": ds2,
    })
    ck("weak_audit: multiple fails → WEAK or CRITICAL", "WEAK" in weak_audit["verdict"] or "CRITICAL" in weak_audit["verdict"], True)

    print("\n" + "=" * 70)
    total_t = p + f
    print(f"RESULTS: {p}/{total_t} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
