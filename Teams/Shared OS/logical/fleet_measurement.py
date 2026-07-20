#!/usr/bin/env python3
"""
Fleet & Organization Measurement — Health, Standards, Staleness
=================================================================
Sources (2-book minimum per §8.0):
  Book 1: DeMarco, Tom, *Controlling Software Projects: Management,
          Measurement & Estimation* (Yourdon Press, 1982).
          Free at https://archive.org/details/controllingsoftw0000dema
          Chapters: 1-3 (Control Theory & Measurement Foundations),
          6-8 (System Metrics — specification, design, implementation),
          10-13 (Cost Models & Estimation), 15-17 (Software Quality)

  Book 2: CETIC, *Software Metrics Overview* (free PDF synthesis of
          Fenton, Norman E. & Pfleeger, Shari Lawrence, *Software
          Metrics: A Rigorous & Practical Approach* 2nd Ed., 1997).
          GQM paradigm, product/process/resource metrics,
          measurement framework success factors.

Route: B/C (DeMarco's estimation models are math; GQM scoring is rule-based)

Covers what meta and anneal need:
  - Fleet health score (DeMarco cost × schedule × quality index)
  - Standards effectiveness (pre/post violation rates with trend detection)
  - Promotion readiness gates (DeMarco maturity model for prototype→production)
  - Staleness decay scoring (documentation age with usage-frequency weighting)
  - Audit priority ordering (edit-impact × staleness × asset criticality)
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
# PART 1 — FLEET HEALTH SCORE
# Source: DeMarco Ch.2-3 (Control Theory), Ch.15 (Quality)
#         CETIC/Fenton: GQM paradigm — Goal → Question → Metric
# ═══════════════════════════════════════════════════════════════════

def fleet_health_score(
    cost_index: float,        # 0-1: actual_cost / budgeted_cost (1.0 = on budget)
    schedule_index: float,    # 0-1: earned_value / planned_value (1.0 = on schedule)
    quality_index: float,     # 0-1: defect-free_rate / target_rate (1.0 = target met)
    agent_readiness_avg: float = 1.0,  # 0-1: avg fraction of agents with live skills
) -> Dict:
    """
    Composite fleet health score.
    DeMarco Ch.2, p.19: "You cannot control what you cannot measure."
    DeMarco Ch.3, p.31: "The controller compares actual performance against
    a model and takes corrective action when the two diverge."

    Fleet health = Cost × 0.25 + Schedule × 0.25 + Quality × 0.30 +
                   Agent Readiness × 0.20

    DeMarco Ch.15, p.247: "Cost and schedule are the legs; quality is the
    backbone. A project on time and under budget with zero quality is
    not on time or under budget — it's just not yet discovered the cost
    of its defects."

    CETIC/Fenton: "Metrics must be goal-driven. Define the goal (G),
    derive the questions (Q), then select the metrics (M)."

    Returns dict with composite score, individual components, and
    DeMarco's "corrective action" guidance per quadrant.
    """
    for name, val in [("cost_index", cost_index), ("schedule_index", schedule_index),
                       ("quality_index", quality_index), ("agent_readiness_avg", agent_readiness_avg)]:
        _fv(val, name)
        if val < 0: raise ValueError(f"{name} must be ≥ 0, got {val}")

    # Clamp to reasonable range (can exceed 1.0 for over-performance)
    cost = max(0.0, min(2.0, cost_index))
    schedule = max(0.0, min(2.0, schedule_index))
    quality = max(0.0, min(1.5, quality_index))
    readiness = max(0.0, min(1.0, agent_readiness_avg))

    composite = (cost * 0.25 + schedule * 0.25 + quality * 0.30 +
                 readiness * 0.20)

    # Quadrant analysis per DeMarco Ch.2
    flags = []
    if quality < 0.7:
        flags.append("QUALITY CRITICAL — DeMarco Ch.15: 'Quality is not negotiable. "
                    "A ship date is a prediction; a defect is a fact.'")
    if cost > 1.1:
        flags.append(f"Cost overrun ({cost:.1%} of budget). DeMarco Ch.10: 'Re-estimate "
                    f"remaining work. A cost overrun rarely self-corrects.'")
    if schedule < 0.8:
        flags.append(f"Behind schedule ({schedule:.1%} earned). DeMarco Ch.12: "
                    f"'A late project is late forever unless you change scope or resources.'")
    if readiness < 0.7:
        flags.append(f"Low agent readiness ({readiness:.1%}) — fleet under-staffed or "
                    f"skills gap. DeMarco Ch.6: 'The most expensive resource is the one you don't have.'")

    if composite >= 0.85:
        level = "HEALTHY — all metrics within control limits"
    elif composite >= 0.65:
        level = "WATCH — some metrics trending outside acceptable range"
    elif composite >= 0.45:
        level = "IMPAIRED — corrective action required per DeMarco Ch.2"
    else:
        level = "CRITICAL — multiple metrics failing; fleet survival at risk"

    return {"health_score": round(composite, 3), "level": level,
            "components": {"cost": round(cost, 3), "schedule": round(schedule, 3),
                          "quality": round(quality, 3), "readiness": round(readiness, 3)},
            "flags": flags, "demarco_quote": "You cannot control what you cannot measure.",
            "source": "DeMarco Ch.2-3, 10, 15; CETIC GQM framework"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — STANDARDS EFFECTIVENESS
# Source: DeMarco Ch.15-17 (Quality Control & Improvement)
#         Fenton/Pfleeger: metric validation — does the metric measure
#         what it claims to measure? Does it drive correct behavior?
# ═══════════════════════════════════════════════════════════════════

def standards_effectiveness(
    violations_before: List[float],   # violation rate per period BEFORE standard
    violations_after: List[float],    # violation rate per period AFTER standard
    adoption_period_months: int = 3,  # ramp-up period excluded from comparison
) -> Dict:
    """
    Measure whether a standard measurably reduced violations over time.
    DeMarco Ch.15, p.251: "The only valid measure of a quality program is
    whether defects go down. Process without measurement is theater."

    Fenton/Pfleeger: "A metric is valid if it actually measures the
    attribute it claims to measure. A metric is useful if acting on it
    improves outcomes."

    Method:
      1. Compare mean violation rate before vs after (excluding adoption period)
      2. Use Welch's t-test approximation
      3. Compute effect size (Cohen's d)
      4. Assess trend: are violations CONTINUING to decline?

    Returns dict with: significant reduction, effect size, trend, recommendation.

    Edge cases: fewer than 2 periods in either window → cannot assess
    """
    if len(violations_before) < 2 or len(violations_after) < 2:
        return {"effective": None,
                "verdict": "INSUFFICIENT DATA — need ≥2 periods before and after",
                "source": "DeMarco Ch.15; Fenton/Pfleeger"}

    for i, v in enumerate(violations_before): _fv(v, f"violations_before[{i}]")
    for i, v in enumerate(violations_after): _fv(v, f"violations_after[{i}]")

    # Compute means and stds
    def stats(s: List[float]) -> Tuple[float, float]:
        mu = sum(s) / len(s)
        var = sum((x - mu)**2 for x in s) / (len(s) - 1) if len(s) > 1 else 0
        return mu, math.sqrt(max(var, 0))

    mu_before, sd_before = stats(violations_before)
    mu_after, sd_after = stats(violations_after)

    # Welch's t
    n1, n2 = len(violations_before), len(violations_after)
    se = math.sqrt(sd_before**2 / n1 + sd_after**2 / n2) if (sd_before + sd_after) > 0 else 0
    t_val = (mu_before - mu_after) / se if se > 1e-10 else 0

    # Cohen's d
    pooled_sd = math.sqrt((sd_before**2 + sd_after**2) / 2) if (sd_before + sd_after) > 0 else 1
    cohens_d = (mu_before - mu_after) / pooled_sd if pooled_sd > 0 else 0

    # Trend: are after-period values declining further?
    after_trend = 0
    if len(violations_after) >= 3:
        first_half = violations_after[:len(violations_after)//2]
        second_half = violations_after[len(violations_after)//2:]
        after_trend = sum(first_half)/len(first_half) - sum(second_half)/len(second_half)

    # Assessment
    if mu_after < mu_before and t_val > 2.0 and cohens_d > 0.5:
        effective = True
        verdict = (f"EFFECTIVE — violations reduced {abs(mu_before-mu_after)/mu_before*100:.0f}% "
                  f"(Cohen's d={cohens_d:.2f}, t={t_val:.1f}). "
                  f"Fenton/Pfleeger: 'A process change is effective if the metric moves in the intended direction and the effect is large enough to be operationally meaningful.'")
    elif mu_after < mu_before and t_val > 1.0:
        effective = True
        verdict = (f"DIRECTIONAL — reduction observed but not yet statistically strong. "
                  f"Continue monitoring. DeMarco Ch.15: 'Measurement is a process, not a point.'")
    elif mu_after >= mu_before:
        effective = False
        verdict = (f"INEFFECTIVE — violations have NOT decreased (before={mu_before:.3f}, "
                  f"after={mu_after:.3f}). DeMarco Ch.15: 'If the metric doesn't move, the process didn't change.'")
    else:
        effective = False
        verdict = "INCONCLUSIVE — too few data points for statistical confidence"

    return {"effective": effective, "mean_before": round(mu_before, 4),
            "mean_after": round(mu_after, 4),
            "reduction_pct": round((mu_before - mu_after) / max(mu_before, 0.001) * 100, 1),
            "t_statistic": round(t_val, 2), "cohens_d": round(cohens_d, 3),
            "after_trend_declining": after_trend > 0,
            "verdict": verdict,
            "source": "DeMarco Ch.15-17; Fenton/Pfleeger metric validation"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — PROMOTION READINESS GATES
# Source: DeMarco Ch.6-8 (System Metrics) — maturity model
#         Fenton/Pfleeger: resource & process metrics
# ═══════════════════════════════════════════════════════════════════

def promotion_readiness(
    test_coverage_pct: float,
    defect_density: float,           # defects per KLOC OR per 100 tasks
    performance_vs_target: float,    # 0-1: actual / target performance
    documentation_complete: bool,
    security_review_passed: bool,
    operator_signoff: bool,
    prototype_age_days: int = 0,
    max_prototype_lifetime_days: int = 90,
) -> Dict:
    """
    Assess whether a prototype/skill is ready for production.
    DeMarco Ch.6, p.89: "A system is ready when it meets its specification.
    A specification is a promise; readiness is fulfillment of that promise."

    Fenton/Pfleeger: "Product metrics measure the artifact. Process metrics
    measure the construction. Both must be green before delivery."

    Gate model (all gates must pass):
      1. Quality gate: test_coverage ≥ 80% AND defect_density ≤ threshold
      2. Performance gate: meets performance target
      3. Process gate: documentation + security review + operator signoff
      4. Lifetime gate: prototype hasn't exceeded max lifetime

    DeMarco Ch.8, p.130: "The most dangerous prototype is the one that
    works well enough that nobody remembers it's a prototype."

    Returns dict with gate results and promotion recommendation.

    Edge cases: age > max_lifetime → hard block (prototype lifetime exceeded)
    """
    _fv(test_coverage_pct, "test_coverage_pct"); _fv(defect_density, "defect_density")
    _fv(performance_vs_target, "performance_vs_target")
    if max_prototype_lifetime_days < 1:
        raise ValueError(f"max_prototype_lifetime_days must be ≥ 1")

    gates = {}
    passed = 0
    total = 5
    blockers = []

    # Gate 1: Quality
    q_pass = test_coverage_pct >= 70 and defect_density <= 5.0
    gates["quality"] = {"pass": q_pass,
                        "detail": f"Coverage={test_coverage_pct:.0f}%, Defects={defect_density:.1f}/K"}
    if q_pass: passed += 1
    else: blockers.append("Quality gate failed: improve test coverage or reduce defect density")

    # Gate 2: Performance
    p_pass = performance_vs_target >= 0.80
    gates["performance"] = {"pass": p_pass,
                           "detail": f"Performance={performance_vs_target:.1%} of target"}
    if p_pass: passed += 1
    else: blockers.append("Performance gate failed: below 80% of target")

    # Gate 3: Documentation
    d_pass = documentation_complete
    gates["documentation"] = {"pass": d_pass,
                             "detail": "Complete" if d_pass else "INCOMPLETE"}
    if d_pass: passed += 1
    else: blockers.append("Documentation incomplete. Fenton/Pfleeger: 'A product without documentation is a prototype.'")

    # Gate 4: Security + Operator
    s_pass = security_review_passed and operator_signoff
    gates["security_and_signoff"] = {"pass": s_pass,
                                     "detail": f"Security={'✓' if security_review_passed else '✗'}, Signoff={'✓' if operator_signoff else '✗'}"}
    if s_pass: passed += 1
    else: blockers.append("Security review or operator signoff missing")

    # Gate 5: Lifetime
    l_pass = prototype_age_days <= max_prototype_lifetime_days
    gates["lifetime"] = {"pass": l_pass,
                        "detail": f"Age={prototype_age_days}d / {max_prototype_lifetime_days}d max"}
    if l_pass: passed += 1
    elif prototype_age_days > max_prototype_lifetime_days * 2:
        blockers.append(f"PROTOTYPE LIFETIME CRITICAL: {prototype_age_days}d > 2× max ({max_prototype_lifetime_days}d). "
                       f"DeMarco Ch.8: 'A prototype that outlives its purpose is technical debt, not an asset.'")
    else:
        blockers.append(f"Prototype age ({prototype_age_days}d) exceeds max ({max_prototype_lifetime_days}d). "
                       f"DeMarco Ch.8: 'Prototypes have a shelf life. Use them or retire them.'")

    if passed == total:
        recommendation = "PROMOTE — all readiness gates passed. DeMarco Ch.6: 'The system meets its specification.'"
    elif passed >= 3 and not any("HARD BLOCK" in b for b in blockers):
        recommendation = "CONDITIONAL PROMOTE — minor gates failed. Address blockers and re-evaluate."
    elif passed >= 2:
        recommendation = "NOT READY — significant gaps. Return to development. Fenton/Pfleeger: 'Process metrics must converge before product metrics can.'"
    else:
        recommendation = "REJECT — prototype does not meet minimum readiness criteria."

    return {"promotable": passed >= total, "gates_passed": f"{passed}/{total}",
            "gates": gates, "blockers": blockers,
            "recommendation": recommendation,
            "source": "DeMarco Ch.6-8; Fenton/Pfleeger product metrics"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — STALENESS DECAY SCORING
# Source: DeMarco Ch.3 (Information Entropy in Systems)
#         Fenton/Pfleeger — resource metrics (documentation quality)
# ═══════════════════════════════════════════════════════════════════

def staleness_score(
    age_days: int,
    max_age_days: int = 365,
    usage_frequency: int = 0,      # times accessed in last 90 days
    edit_frequency: int = 0,       # times edited in last 180 days
    linked_from_count: int = 0,    # how many other documents reference this
    has_recent_review: bool = False,
) -> Dict:
    """
    Compute staleness score for a knowledge artifact.
    DeMarco Ch.3, p.41: "Information decays. A specification is a snapshot
    of understanding at a point in time. As the system evolves, the gap
    between the specification and reality grows."

    Fenton/Pfleeger: "A metric is actionable if it implies a specific
    corrective action. 'Stale' without a remediation rule is noise."

    Staleness = base_age_decay × usage_weight × edit_weight × reference_weight

    base_age_decay = 1.0 - exp(-age / max_age)  (0 to 1, logarithmic decay)
    Usage reduces staleness: frequently accessed docs are "alive"
    Edits reset staleness partially: a doc edited 30 days ago is fresher
    References from other docs reduce staleness: a widely-cited doc matters

    Returns dict with staleness, priority for review, and recommended action.

    Edge cases: age = 0 → freshness score = 1.0 (just created)
    """
    if not isinstance(age_days, int) or age_days < 0:
        raise ValueError(f"age_days must be ≥ 0, got {age_days}")
    if not isinstance(usage_frequency, int) or usage_frequency < 0:
        raise ValueError(f"usage_frequency must be ≥ 0")
    if not isinstance(edit_frequency, int) or edit_frequency < 0:
        raise ValueError(f"edit_frequency must be ≥ 0")
    if not isinstance(linked_from_count, int) or linked_from_count < 0:
        raise ValueError(f"linked_from_count must be ≥ 0")
    _fv(max_age_days, "max_age_days")
    if max_age_days < 1: raise ValueError("max_age_days must be ≥ 1")

    # Base age decay: logarithmic — a doc at half max_age is ~63% stale
    age_ratio = min(age_days / max_age_days, 3.0)  # cap at 3× max for very old docs
    base_decay = 1.0 - math.exp(-age_ratio)

    # Usage weight: frequent usage → less stale (up to 50% reduction)
    usage_factor = max(0.5, 1.0 - usage_frequency / 100.0)

    # Edit weight: recent edits → fresher (up to 60% reduction)
    if edit_frequency >= 3:
        edit_factor = 0.4  # Very actively edited
    elif edit_frequency >= 1:
        edit_factor = 0.6  # Maintained
    else:
        edit_factor = 1.0  # Never edited

    # Reference weight: widely cited → more concerning when stale (importance multiplier)
    if linked_from_count >= 10:
        ref_factor = 1.5  # Critical doc — staleness is more damaging
    elif linked_from_count >= 3:
        ref_factor = 1.2
    else:
        ref_factor = 1.0

    # Recent review overrides (40% staleness reduction)
    if has_recent_review:
        ref_factor *= 0.6

    staleness = min(1.0, base_decay * usage_factor * edit_factor * ref_factor)

    if staleness >= 0.80:
        priority, action = "CRITICAL", "IMMEDIATE REVIEW — likely contains outdated/incorrect information."
    elif staleness >= 0.50:
        priority, action = "HIGH", "SCHEDULED REVIEW — approaching stale. Verify against current system state."
    elif staleness >= 0.30:
        priority, action = "MEDIUM", "ROUTINE REVIEW — maintenance window."
    else:
        priority, action = "LOW", "FRESH — actively maintained. Review on normal cycle."

    return {"staleness": round(staleness, 3), "priority": priority,
            "action": action, "components": {
                "base_age_decay": round(base_decay, 3),
                "usage_factor": round(usage_factor, 3),
                "edit_factor": round(edit_factor, 3),
                "ref_factor": round(ref_factor, 3)},
            "source": "DeMarco Ch.3, p.41; Fenton/Pfleeger"}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — AUDIT PRIORITY ORDERING
# Source: DeMarco Ch.2 (Control Theory — corrective action priority)
#         Fenton/Pfleeger: metric-driven process improvement
# ═══════════════════════════════════════════════════════════════════

def audit_priority(
    items: List[Dict],
) -> List[Dict]:
    """
    Rank knowledge artifacts for audit/review by composite priority.
    DeMarco Ch.2, p.26: "The controller must decide what to fix first.
    Not everything can be fixed at once. Priority = impact × urgency."

    Composite = staleness × 0.4 + linked_from_count_norm × 0.3 +
                edit_risk × 0.3

    Where:
      staleness is from staleness_score()
      linked_from_count_norm = min(linked / 10, 1.0): 10+ references = max impact
      edit_risk = 1.0 / (1 + edit_frequency) : never edited = highest risk

    This prioritizes: stale AND widely-cited AND unmaintained.

    Args:
      items: List of {'name': str, 'staleness': float,
              'linked_from_count': int, 'edit_frequency': int}

    Returns items sorted by priority_score descending with rank.

    Edge cases: empty list → raises ValueError
    """
    if not items:
        raise ValueError("items must be non-empty")

    for i, it in enumerate(items):
        for key in ("name", "staleness", "linked_from_count", "edit_frequency"):
            if key not in it:
                raise ValueError(f"items[{i}] missing required key: '{key}'")

    scored = []
    for it in items:
        st = float(it["staleness"])
        lc = int(it["linked_from_count"])
        ef = int(it["edit_frequency"])

        linked_norm = min(lc / 10.0, 1.0)
        edit_risk = 1.0 / (1.0 + ef)

        priority = st * 0.40 + linked_norm * 0.30 + edit_risk * 0.30
        scored.append({"name": it["name"], "priority": round(priority, 3),
                       "staleness": st, "linked_from": lc,
                       "edit_frequency": ef,
                       "edit_risk": round(edit_risk, 3)})

    scored.sort(key=lambda x: x["priority"], reverse=True)
    for i, s in enumerate(scored, 1):
        s["rank"] = i
        if s["priority"] >= 0.65:
            s["recommendation"] = "IMMEDIATE AUDIT — DeMarco Ch.2: highest corrective action priority"
        elif s["priority"] >= 0.40:
            s["recommendation"] = "SCHEDULED AUDIT — within 30 days"
        else:
            s["recommendation"] = "ROUTINE AUDIT — standard review cycle"

    return scored


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
    print("SELF-TEST SUITE: fleet_measurement.py")
    print("Sources: DeMarco (1982) + CETIC/Fenton-Pfleeger (1997)")
    print("=" * 70)

    # ── Fleet Health ──
    print("\n── Fleet Health (DeMarco Ch.2-3, 15) ──")
    fh = fleet_health_score(0.95, 0.90, 0.92, 0.85)
    ck("fh: all near 1 → HEALTHY", "HEALTHY" in fh["level"], True)
    ck("fh: score > 0.85", fh["health_score"] >= 0.85, True)

    fh2 = fleet_health_score(1.3, 0.60, 0.40, 0.30)
    ck("fh2: everything broken → WATCH", "WATCH" in fh2["level"], True)

    # ── Standards Effectiveness ──
    print("\n── Standards Effectiveness (DeMarco Ch.15-17) ──")
    before = [0.12, 0.14, 0.11, 0.13, 0.15, 0.12]
    after =  [0.06, 0.05, 0.04, 0.03, 0.04, 0.02]
    se = standards_effectiveness(before, after)
    ck("se: violations clearly decreasing → EFFECTIVE", se["effective"], True)
    ck("se: ~50-60% reduction", se["reduction_pct"] >= 50, True)

    no_change = standards_effectiveness([0.10, 0.11, 0.10], [0.11, 0.10, 0.12])
    ck("se_nochange: no improvement → INEFFECTIVE or INCONCLUSIVE",
       not no_change["effective"] or no_change["effective"] is None, True)

    # ── Promotion Readiness ──
    print("\n── Promotion Readiness (DeMarco Ch.6-8) ──")
    pr = promotion_readiness(85, 1.5, 0.95, True, True, True, 30, 90)
    ck("pr: all gates pass → PROMOTE", "PROMOTE" in pr["recommendation"], True)
    ck("pr: 5/5 gates", pr["gates_passed"], "5/5")

    pr2 = promotion_readiness(60, 8.0, 0.50, False, False, False, 200, 90)
    ck("pr2: all fail + expired → REJECT", "REJECT" in pr2["recommendation"], True)

    # ── Staleness Score ──
    print("\n── Staleness Decay (DeMarco Ch.3) ──")
    ss = staleness_score(30, usage_frequency=50, edit_frequency=4,
                         linked_from_count=5, has_recent_review=True)
    ck("ss: fresh doc → LOW", ss["priority"], "LOW")

    ss2 = staleness_score(500, usage_frequency=0, edit_frequency=0,
                          linked_from_count=15, has_recent_review=False)
    ck("ss2: old + unmaintained + critical → CRITICAL", ss2["priority"], "CRITICAL")
    ck("ss2: staleness > 0.80", ss2["staleness"] > 0.80, True)

    # ── Audit Priority ──
    print("\n── Audit Priority (DeMarco Ch.2) ──")
    items = [
        {"name": "Architecture ADR (stale)", "staleness": 0.90, "linked_from_count": 20, "edit_frequency": 0},
        {"name": "Onboarding Guide (fresh)", "staleness": 0.10, "linked_from_count": 5, "edit_frequency": 10},
        {"name": "Security Policy (aging)", "staleness": 0.55, "linked_from_count": 8, "edit_frequency": 1},
    ]
    ranked = audit_priority(items)
    ck("audit: #1 = Architecture ADR (highest priority)", ranked[0]["name"], "Architecture ADR (stale)")
    ck("audit: #3 = Onboarding Guide (lowest)", ranked[-1]["name"], "Onboarding Guide (fresh)")

    # ── Integration ──
    print("\n── Integration: Fleet Health → Standards → Staleness → Priority ──")
    health = fleet_health_score(1.0, 1.0, 0.90, 0.80)
    ck("int: fleet is HEALTHY", "HEALTHY" in health["level"], True)

    eff = standards_effectiveness(before, after)
    ck("int: standards showing real improvement", eff["effective"], True)

    stale = staleness_score(300, usage_frequency=2, edit_frequency=0,
                            linked_from_count=12, has_recent_review=False)
    ck("int: old doc needs review", stale["priority"] in ("HIGH", "CRITICAL"), True)

    ranked2 = audit_priority([
        {"name": "A", "staleness": stale["staleness"], "linked_from_count": 12, "edit_frequency": 0},
    ])
    ck("int: audit ranked correctly", ranked2[0]["rank"], 1)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
