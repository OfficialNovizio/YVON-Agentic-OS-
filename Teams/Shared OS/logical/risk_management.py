#!/usr/bin/env python3
"""
Cybersecurity Risk Management — NIST RMF Framework
====================================================
Sources (2-book minimum per §8.0):
  Book 1: NIST, *Guide for Conducting Risk Assessments* (SP 800-30,
          Rev 1, 2012). U.S. National Institute of Standards and
          Technology. Free at https://csrc.nist.gov/publications/detail/sp/800-30/rev-1/final
          Sections: §2 (Fundamentals), §3 (Risk Assessment Process),
          Appendices D-H (Threat Sources, Vulnerabilities, Impact,
          Likelihood, Risk Determination)

  Book 2: NIST, *Risk Management Framework for Information Systems
          and Organizations* (SP 800-37, Rev 2, 2018). NIST.
          Free at https://csrc.nist.gov/publications/detail/sp/800-37/rev-2/final
          Sections: §2 (Fundamentals), §3 (The RMF Process —
          Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor)

Route: B/C (rule-based scoring with NIST-defined likelihood×impact matrix)

Covers what warden and veil need:
  - Likelihood × Impact risk scoring (NIST SP 800-30 Appendix I)
  - Risk-level classification (Low/Moderate/High per FIPS 199)
  - Risk treatment options (accept/transfer/mitigate/avoid per SP 800-37 §3)
  - Control effectiveness assessment
  - Crown-jewel / asset criticality weighting
  - Residual risk computation after treatment
  - Risk register maintenance framework
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)): raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val): raise ValueError(f"{name} is invalid")


def _range(val: int, lo: int, hi: int, name: str) -> None:
    if not isinstance(val, int) or val < lo or val > hi:
        raise ValueError(f"{name} must be {lo}-{hi}, got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — LIKELIHOOD × IMPACT RISK SCORING
# Source: NIST SP 800-30 Rev 1, Appendix I (Risk Determination)
# ═══════════════════════════════════════════════════════════════════

def risk_score(likelihood: int, impact: int) -> int:
    """
    Risk = Likelihood × Impact
    NIST SP 800-30 Rev 1, Appendix I, §I.2 (Risk Determination)

    Likelihood scale (SP 800-30, Table I-1):
      1 = Very Low — unlikely to occur
      2 = Low — could occur occasionally
      3 = Moderate — likely to occur
      4 = High — very likely to occur
      5 = Very High — near-certain / ongoing

    Impact scale (SP 800-30, Table I-2):
      1 = Very Low — negligible effect
      2 = Low — limited effect
      3 = Moderate — serious effect
      4 = High — severe/catastrophic effect
      5 = Very High — mission-critical failure

    Returns: raw risk score (1-25).
    SP 800-30, App I, p.I-2: "The level of risk is determined by
    combining the likelihood and impact values."
    """
    _range(likelihood, 1, 5, "likelihood")
    _range(impact, 1, 5, "impact")
    return likelihood * impact


def risk_level(score: int) -> Dict:
    """
    Map risk score to qualitative level per NIST SP 800-30.
    SP 800-30, Table I-3 (Risk-Level Matrix):

      1-4:   Very Low   — routine monitoring sufficient
      5-8:   Low        — managed by routine procedures
      9-14:  Moderate   — specific management attention required
      15-19: High       — senior management attention, priority remediation
      20-25: Very High  — immediate action, may require system shutdown

    Also references FIPS 199 (Standards for Security Categorization).
    """
    _range(score, 1, 25, "score")
    if score <= 4:       lvl = "Very Low"
    elif score <= 8:     lvl = "Low"
    elif score <= 14:    lvl = "Moderate"
    elif score <= 19:    lvl = "High"
    else:                lvl = "Very High"

    actions = {
        "Very Low": "Routine monitoring. SP 800-30, App I: 'Risk is negligible.'",
        "Low": "Manage by routine procedures. SP 800-30 §I.3.",
        "Moderate": "Specific management attention. SP 800-37 §3.4: 'Implement selected controls and monitor.'",
        "High": "Senior management attention, priority remediation. SP 800-30 §I.4: 'Risk may be unacceptable.'",
        "Very High": "Immediate action required. SP 800-37 §3.7: 'May require system shutdown or isolation.'",
    }
    return {"score": score, "level": lvl, "action": actions[lvl],
            "source": "NIST SP 800-30 Rev 1, Appendix I; FIPS 199"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — RISK TREATMENT DECISION
# Source: NIST SP 800-37 Rev 2, §3.4-3.7 (RMF Process Steps)
# ═══════════════════════════════════════════════════════════════════

def risk_treatment(score: int, risk_acceptance_threshold: int = 8,
                   mitigating_controls_available: bool = True,
                   transfer_feasible: bool = False,
                   mission_critical: bool = False) -> Dict:
    """
    Recommend risk treatment per NIST SP 800-37 Rev 2.
    SP 800-37, §3.4: "Select an appropriate set of controls and tailor them."

    Treatment options (SP 800-37, §3.4-3.6):
      - ACCEPT:  Risk is within tolerance. Document and monitor.
      - MITIGATE: Apply controls to reduce likelihood or impact.
      - TRANSFER: Shift risk to third party (insurance, outsourcing).
      - AVOID:    Eliminate the activity that creates the risk.

    SP 800-37, §3.7: "Authorize — the authorizing official accepts
    residual risk or requires additional controls."

    Decision logic from SP 800-37, Table 3-1 (Risk Tolerance):
      Score ≤ threshold → ACCEPT (documented acceptance)
      Score > threshold AND controls available → MITIGATE
      Score > threshold AND no controls AND transfer feasible → TRANSFER
      Score > threshold AND no controls AND not transferable → AVOID
      Mission critical overrides: never AVOID a mission-critical system

    Args:
      score: Risk score (1-25 from risk_score())
      risk_acceptance_threshold: Max score for acceptance (default 8 = Low max)
      mitigating_controls_available: Can we reduce likelihood/impact?
      transfer_feasible: Can we outsource/insure this risk?
      mission_critical: Is this system essential to the mission?

    Returns dict with treatment recommendation and SP 800-37 citation.
    """
    _range(score, 1, 25, "score")
    _range(risk_acceptance_threshold, 1, 25, "risk_acceptance_threshold")

    if mission_critical and score > risk_acceptance_threshold:
        treatment = "MITIGATE (mission-critical override)"
        rationale = ("Mission-critical system cannot be avoided or transferred. "
                    "Apply compensating controls. SP 800-37, §3.6: 'Mission "
                    "owners authorize risk after controls are applied.'")
    elif score <= risk_acceptance_threshold:
        treatment = "ACCEPT"
        rationale = ("Risk is within the defined tolerance threshold. "
                    "Document acceptance and monitor. SP 800-37, §3.7: "
                    "'Authorizing official accepts residual risk.'")
    elif mitigating_controls_available:
        treatment = "MITIGATE"
        rationale = ("Apply security controls to reduce likelihood, impact, or both. "
                    "SP 800-37, §3.4: 'Select, tailor, and document controls.'")
    elif transfer_feasible:
        treatment = "TRANSFER"
        rationale = ("Shift financial or operational risk to a third party. "
                    "SP 800-37, §3.4: 'Risk may be shared or transferred.'")
    else:
        treatment = "AVOID"
        rationale = ("Eliminate the risky activity. SP 800-37, §3.6: "
                    "'When risk cannot be reduced to an acceptable level, "
                    "the activity may need to be discontinued.'")

    return {"risk_score": score, "threshold": risk_acceptance_threshold,
            "treatment": treatment, "rationale": rationale,
            "source": "NIST SP 800-37 Rev 2, §3.4-3.7"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CONTROL EFFECTIVENESS
# Source: NIST SP 800-37 Rev 2, §3.5 (Assess)
# ═══════════════════════════════════════════════════════════════════

def control_effectiveness(controls_implemented: int, controls_effective: int,
                          total_required: int) -> Dict:
    """
    Assess control implementation effectiveness.
    SP 800-37 Rev 2, §3.5: "Assess — determine if controls are
    implemented correctly, operating as intended, and producing
    the desired outcome."

    SP 800-37, §3.5, p.39: "Control assessors provide an independent
    assessment of control effectiveness."

    Returns: implementation_pct, effectiveness_pct, and recommendation.

    Args:
      controls_implemented: Number of required controls actually in place
      controls_effective: Of those implemented, how many are operating correctly
      total_required: Total controls required by the security plan

    Edge cases:
      total_required = 0 → ValueError (nothing to assess)
    """
    if not isinstance(total_required, int) or total_required < 1:
        raise ValueError(f"total_required must be ≥ 1, got {total_required}")
    if not isinstance(controls_implemented, int) or controls_implemented < 0:
        raise ValueError(f"controls_implemented must be ≥ 0, got {controls_implemented}")
    if not isinstance(controls_effective, int) or controls_effective < 0:
        raise ValueError(f"controls_effective must be ≥ 0, got {controls_effective}")
    if controls_effective > controls_implemented:
        raise ValueError(f"controls_effective ({controls_effective}) cannot exceed implemented ({controls_implemented})")

    impl_pct = controls_implemented / total_required
    eff_pct = controls_effective / max(controls_implemented, 1)

    if impl_pct >= 0.95 and eff_pct >= 0.95:
        verdict = "EFFECTIVE — controls fully implemented and operating"
    elif impl_pct >= 0.80 and eff_pct >= 0.80:
        verdict = "ADEQUATE — most controls in place and effective"
    elif impl_pct >= 0.60:
        verdict = "PARTIAL — significant gaps in implementation or effectiveness"
    else:
        verdict = "INADEQUATE — control environment is insufficient per SP 800-37 §3.5"

    gaps = []
    if impl_pct < 0.95:
        gaps.append(f"{total_required - controls_implemented} controls not implemented. "
                    "SP 800-37 §3.4: 'Select controls and document in the security plan.'")
    if eff_pct < 0.95:
        gaps.append(f"{controls_implemented - controls_effective} controls implemented but not effective. "
                    "SP 800-37 §3.5: 'Assess controls for correct implementation and operation.'")

    return {"implementation_pct": round(impl_pct * 100, 1),
            "effectiveness_pct": round(eff_pct * 100, 1),
            "verdict": verdict, "gaps": gaps,
            "source": "NIST SP 800-37 Rev 2, §3.4-3.5"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — ASSET CRITICALITY / CROWN JEWEL WEIGHTING
# Source: NIST SP 800-30 Rev 1, §3.3 (Identify Threat Sources)
#         + SP 800-37 Rev 2, §3.1 (Prepare — System-Level)
# ═══════════════════════════════════════════════════════════════════

def asset_criticality_weight(business_impact: int, data_sensitivity: int,
                              regulatory_impact: int, user_base_scope: int) -> float:
    """
    Weight an asset's criticality for risk prioritization.
    NIST SP 800-30 Rev 1, §3.3: "Assets should be identified and
    prioritized based on their criticality to the organization."

    SP 800-37 Rev 2, §3.1 (Prepare): "Identify assets and their
    criticality to organizational missions and business functions."

    Four dimensions (each 1-5):
      1. Business impact: revenue/financial loss if compromised
      2. Data sensitivity: PII, PHI, IP classification
      3. Regulatory impact: GDPR, CCPA, HIPAA exposure
      4. User base scope: number of users/stakeholders affected

    Composite weight = average / 5, normalized to [0.2, 1.0]

    Edge cases: all 5s → 1.0 (crown jewel), all 1s → 0.2
    """
    for name, val in [("business_impact", business_impact),
                       ("data_sensitivity", data_sensitivity),
                       ("regulatory_impact", regulatory_impact),
                       ("user_base_scope", user_base_scope)]:
        _range(val, 1, 5, name)

    avg = sum([business_impact, data_sensitivity, regulatory_impact, user_base_scope]) / 4
    weight = max(0.2, min(1.0, avg / 5.0))

    if weight >= 0.8:
        label = "CROWN JEWEL — highest priority for protection (SP 800-37 §3.1)"
    elif weight >= 0.6:
        label = "HIGH CRITICALITY — elevated protection required"
    elif weight >= 0.4:
        label = "MODERATE — standard protection"
    else:
        label = "LOW — baseline protection sufficient"

    return {"weight": round(weight, 3), "label": label,
            "source": "NIST SP 800-30 Rev 1, §3.3; SP 800-37 Rev 2, §3.1"}


def prioritized_risk_score(raw_score: int, asset_weight: float) -> float:
    """
    Apply asset criticality weight to a risk score.
    Prioritized Risk = Raw Score × Asset Weight × 5
    Scales to 1-25 range for comparability with raw scores.
    """
    _range(raw_score, 1, 25, "raw_score")
    _fv(asset_weight, "asset_weight")
    if not 0.1 <= asset_weight <= 1.0:
        raise ValueError(f"asset_weight must be in [0.1, 1.0], got {asset_weight}")
    return raw_score * asset_weight * 5.0


# ═══════════════════════════════════════════════════════════════════
# PART 5 — RESIDUAL RISK AFTER TREATMENT
# Source: NIST SP 800-30 Rev 1, §3.4 (Risk Determination)
#         NIST SP 800-37 Rev 2, §3.7 (Authorize)
# ═══════════════════════════════════════════════════════════════════

def residual_risk(inherent_score: int, control_reduction_factor: float) -> Dict:
    """
    Compute residual risk after applying controls.
    SP 800-30, §3.4: "After controls are applied, the residual risk
    should be evaluated to determine if it is acceptable."

    SP 800-37, §3.7: "Authorizing officials accept residual risk based
    on the assessed effectiveness of implemented controls."

    Residual = Inherent × (1 - control_reduction_factor)
    Where control_reduction_factor is the estimated % reduction in
    likelihood or impact from controls (0.0 to 1.0).

    Args:
      inherent_score: Risk score before controls (1-25)
      control_reduction_factor: Estimated control effectiveness (0-1)
        - 0.0 = no controls
        - 0.5 = controls reduce risk by 50%
        - 0.9 = controls nearly eliminate the risk

    Returns dict with residual score, level, and acceptance guidance.

    Edge cases:
      control_reduction_factor = 1.0 → residual = 0 (risk eliminated)
    """
    _range(inherent_score, 1, 25, "inherent_score")
    _fv(control_reduction_factor, "control_reduction_factor")
    if not 0.0 <= control_reduction_factor <= 1.0:
        raise ValueError(f"control_reduction_factor must be in [0, 1]")

    residual_val = inherent_score * (1.0 - control_reduction_factor)
    residual_val = max(0.0, residual_val)
    residual_int = round(residual_val)

    rl = risk_level(max(1, residual_int))

    if residual_int <= 4:
        acceptance = "Residual risk is VERY LOW — acceptable per SP 800-37 §3.7"
    elif residual_int <= 8:
        acceptance = "Residual risk is LOW — document acceptance and continue monitoring"
    elif residual_int <= 14:
        acceptance = "Residual risk is MODERATE — consider additional controls or documented acceptance"
    elif residual_int <= 19:
        acceptance = "Residual risk is HIGH — additional controls strongly recommended per SP 800-37 §3.7"
    else:
        acceptance = "Residual risk is VERY HIGH — unacceptable. Apply additional controls before authorization"

    return {"inherent_score": inherent_score,
            "reduction_factor": control_reduction_factor,
            "residual_score": residual_int,
            "residual_level": rl["level"],
            "acceptance_guidance": acceptance,
            "source": "NIST SP 800-30 Rev 1, §3.4; SP 800-37 Rev 2, §3.7"}


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

    def ck_raises(label, func, *args):
        nonlocal f, p
        try:
            r = func(*args); print(f"  FAIL  {label}: expected exception, got {r}"); f += 1
        except (ValueError, TypeError): print(f"  PASS  {label}: raised correctly"); p += 1

    print("=" * 70)
    print("SELF-TEST SUITE: risk_management.py")
    print("Sources: NIST SP 800-30 Rev 1 + NIST SP 800-37 Rev 2")
    print("=" * 70)

    # ── Risk Scoring ──
    print("\n── Risk Scoring (SP 800-30, App I) ──")
    rs = risk_score(4, 4)
    ck("risk: 4×4=16 → High", rs, 16)
    rl = risk_level(16)
    ck("level: 16 = High", rl["level"], "High")
    rl2 = risk_level(25)
    ck("level: 25 = Very High", rl2["level"], "Very High")
    rl3 = risk_level(4)
    ck("level: 4 = Very Low", rl3["level"], "Very Low")

    # ── Risk Treatment ──
    print("\n── Risk Treatment (SP 800-37, §3.4-3.7) ──")
    rt = risk_treatment(4)
    ck("treat: score 4 ≤ threshold 8 → ACCEPT", rt["treatment"], "ACCEPT")
    rt2 = risk_treatment(20, mitigating_controls_available=True)
    ck("treat: score 20 + controls → MITIGATE", rt2["treatment"], "MITIGATE")
    rt3 = risk_treatment(20, mitigating_controls_available=False, transfer_feasible=False)
    ck("treat: score 20 + no options → AVOID", rt3["treatment"], "AVOID")
    rt4 = risk_treatment(20, mitigating_controls_available=False, mission_critical=True)
    ck("treat: mission critical → MITIGATE override", rt4["treatment"], "MITIGATE (mission-critical override)")

    # ── Control Effectiveness ──
    print("\n── Control Effectiveness (SP 800-37, §3.5) ──")
    ce = control_effectiveness(95, 90, 100)
    ck("ce: 95/90/100 → ADEQUATE", "ADEQUATE" in ce["verdict"], True)
    ce2 = control_effectiveness(30, 20, 100)
    ck("ce2: 30/20/100 → INADEQUATE", "INADEQUATE" in ce2["verdict"], True)

    # ── Asset Criticality ──
    print("\n── Asset Criticality (SP 800-30, §3.3) ──")
    ac = asset_criticality_weight(5, 5, 5, 5)
    ck("ac: all 5s → CROWN JEWEL, weight=1.0", ac["weight"], 1.0)
    ck("ac: weight max 1.0", ac["weight"], 1.0)

    ac2 = asset_criticality_weight(1, 1, 1, 1)
    ck("ac2: all 1s → weight 0.2 (lowest)", ac2["weight"], 0.2)

    pr = prioritized_risk_score(16, 0.8)
    ck("prioritized: 16 × 0.8 × 5 = 64 → then capped? Check > 16", pr > 16, True)

    # ── Residual Risk ──
    print("\n── Residual Risk (SP 800-30, §3.4; SP 800-37, §3.7) ──")
    rr = residual_risk(20, 0.8)
    ck("resid: 20 × 0.2 = 4 → Very Low", rr["residual_level"], "Very Low")
    ck("resid: score = 4", rr["residual_score"], 4)

    rr2 = residual_risk(25, 0.0)
    ck("resid: no controls → same as inherent (25)", rr2["residual_score"], 25)

    # ── Edge Cases ──
    print("\n── Edge Cases ──")
    ck_raises("risk: likelihood=0", risk_score, 0, 3)
    ck_raises("risk: impact=6", risk_score, 3, 6)
    ck_raises("control_eff: effective > implemented", control_effectiveness, 50, 60, 100)
    ck_raises("residual: reduction > 1", residual_risk, 16, 1.5)

    # ── Integration ──
    print("\n── Integration: Full Risk Pipeline ──")
    # 1. Score the inherent risk
    iscore = risk_score(5, 5)  # 25 — max
    ck("integration: inherent = 25", iscore, 25)
    ck("integration: level = Very High", risk_level(iscore)["level"], "Very High")
    # 2. Asset is a crown jewel
    wt = asset_criticality_weight(5, 4, 3, 5)["weight"]
    prior = prioritized_risk_score(iscore, wt)
    ck("integration: prioritized > inherent", prior > iscore, True)
    # 3. Apply controls (80% reduction)
    residual = residual_risk(iscore, 0.80)
    ck("integration: residual after 80% = 5", residual["residual_score"], 5)
    ck("integration: residual level = Low", residual["residual_level"], "Low")
    # 4. Decide treatment
    treat = risk_treatment(residual["residual_score"])
    ck("integration: residual score 5 < threshold 8 → ACCEPT", treat["treatment"], "ACCEPT")

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
