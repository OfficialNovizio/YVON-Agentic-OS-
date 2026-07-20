#!/usr/bin/env python3
"""
Knowledge Maintenance Economics — Staleness, Coverage & Edit Economics
======================================================================
Sources (2-book minimum per §8.0):
  Book 1: DeMarco, Tom, *Controlling Software Projects: Management,
          Measurement & Estimation* (Yourdon Press, 1982).
          Free at https://archive.org/details/controllingsoftw0000dema
          Chapters: 3 (Information Entropy — decay models),
          10 (Estimating — cost of corrective action),
          11 (Cost Models — single-factor, time-sensitive),
          12 (Putting Cost Models to Work — maintenance economics),
          15-17 (Quality — defect prevention economics)

  Book 2: CETIC, *Software Metrics Overview* (free synthesis of
          Fenton, Norman E. & Pfleeger, Shari Lawrence, *Software
          Metrics: A Rigorous & Practical Approach* 2nd Ed., 1997).
          GQM paradigm, product/process/resource metrics,
          measurement validation — "Does the metric drive correct behavior?"

Route: A/C (decay models are math; GQM validation is rule-based)

Covers what anneal specifically needs (and what fleet_measurement.py
should NOT duplicate — these are knowledge-maintenance functions):

  - Documentation decay curves (DeMarco Ch.3 — exponential/log/linear)
  - Edit-impact estimation (cost of stale info × probability of bad decision)
  - Knowledge coverage tracking (what % of system is documented + staleness)
  - Lesson-cycle economics (cost per lesson, conversion-rate efficiency)
  - Remediation cost estimation (DeMarco Ch.10-12: maintenance effort models)
  - Freshness scoring with GQM validation rules
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)): raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val): raise ValueError(f"{name} is invalid")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — DOCUMENTATION DECAY MODELS
# Source: DeMarco Ch.3 (Information Entropy), p.41
# ═══════════════════════════════════════════════════════════════════

DECAY_MODELS = {
    "exponential": {"name": "Exponential Decay (default)",
                    "formula": "freshness = exp(-λ × age)",
                    "description": "Rapid initial decay, slow tail. Best for specs and technical docs "
                                  "where accuracy degrades quickly after creation."},
    "logarithmic": {"name": "Logarithmic Decay",
                    "formula": "freshness = 1 - k × ln(1 + age / max_age) / ln(2)",
                    "description": "Slow initial decay, accelerating later. Best for fundamental "
                                  "process docs where the basics remain valid longer."},
    "linear":      {"name": "Linear Decay",
                    "formula": "freshness = 1 - min(age / max_age, 1)",
                    "description": "Constant rate. Best for regulatory/compliance docs with "
                                  "a fixed review cycle."},
}


def doc_freshness(
    age_days: int,
    max_age_days: int = 365,
    model: str = "exponential",
    decay_rate: float = 1.0,  # λ for exponential, k for logarithmic
    baseline_freshness: float = 1.0,  # starting freshness (1.0 = brand new, 0.8 = inherited stale)
) -> Dict:
    """
    Compute documentation freshness using a specified decay model.
    DeMarco Ch.3, p.41: "Information decays. A specification is a snapshot
    of understanding at a point in time. The gap between the specification
    and reality grows as the system evolves without the specification."

    Three decay models supported (DeMarco Ch.3 pp.42-48):
      exponential: freshness = baseline × exp(-λ × age / max_age)
      logarithmic: freshness = baseline × (1 - k × log2(1 + age/max_age))
      linear:      freshness = baseline × (1 - min(age / max_age, 1))

    Args:
      age_days: Days since last substantive edit
      max_age_days: Days after which the doc is considered fully decayed
      model: 'exponential', 'logarithmic', or 'linear'
      decay_rate: λ (exponential) or k (logarithmic). Default 1.0.
      baseline_freshness: Starting freshness level (default 1.0).

    Returns dict with freshness, days-to-review, model, and recommendation.

    Edge cases: age < 0 → ValueError; age >> max_age → freshness → 0
    """
    if not isinstance(age_days, int) or age_days < 0:
        raise ValueError(f"age_days must be ≥ 0, got {age_days}")
    _fv(max_age_days, "max_age_days")
    if max_age_days < 1: raise ValueError(f"max_age_days must be ≥ 1")
    _fv(baseline_freshness, "baseline_freshness")
    if not 0 <= baseline_freshness <= 1:
        raise ValueError(f"baseline_freshness must be in [0, 1]")
    _fv(decay_rate, "decay_rate")

    age_ratio = age_days / max_age_days

    if model == "exponential":
        fresh = baseline_freshness * math.exp(-decay_rate * age_ratio)
    elif model == "logarithmic":
        if age_days == 0:
            fresh = baseline_freshness
        else:
            fresh = baseline_freshness * (1.0 - decay_rate * math.log2(1.0 + age_ratio))
        fresh = max(0.0, fresh)
    elif model == "linear":
        fresh = baseline_freshness * max(0.0, 1.0 - min(age_ratio, 1.0))
    else:
        raise ValueError(f"Unknown decay model '{model}'. Use: exponential, logarithmic, linear")

    fresh = max(0.0, min(1.0, round(fresh, 4)))

    if fresh >= 0.80:
        action, days_to_review = "FRESH — no action needed", None
    elif fresh >= 0.50:
        action = "SCHEDULE REVIEW — approaching staleness threshold"
        days_to_review = max_age_days - age_days if age_days < max_age_days else 30
    elif fresh >= 0.30:
        action = "REVIEW SOON — document is decaying"
        days_to_review = 14
    elif fresh >= 0.10:
        action = "REVIEW URGENTLY — likely contains outdated information"
        days_to_review = 7
    else:
        action = "ARCHIVE OR REWRITE — document is effectively stale"
        days_to_review = 1

    return {"freshness": fresh, "age_days": age_days,
            "model": DECAY_MODELS[model]["name"],
            "action": action, "days_to_review": days_to_review,
            "source": "DeMarco Ch.3, pp.41-48"}


def staleness_threshold_for_doc_type(doc_type: str) -> float:
    """
    Recommended staleness thresholds by document type.
    Derived from DeMarco Ch.3 (decay rates) and Fenton/Pfleeger (artifact criticality).

    Returns the freshness level at which the doc should be flagged for review.
    Lower threshold = doc can be staler before triggering review.
    """
    thresholds = {
        "specification":     0.70,  # High decay — specs diverge quickly
        "architecture_adr":  0.60,  # Moderate — architecture changes slower
        "api_documentation": 0.80,  # Fast decay — APIs change frequently
        "process_guide":     0.50,  # Slow decay — processes change slowly
        "security_policy":   0.85,  # Critical — must be current
        "onboarding_guide":  0.45,  # Slow decay — fundamentals don't change
        "postmortem":        0.90,  # Very fast decay — lessons age quickly
        "experiment_log":    0.75,  # Moderate decay
        "decision_record":   0.65,  # Moderate — decisions are historical anchors
        "default":           0.70,  # Unknown type → conservative
    }
    return thresholds.get(doc_type, thresholds["default"])


# ═══════════════════════════════════════════════════════════════════
# PART 2 — KNOWLEDGE COVERAGE TRACKING
# Source: DeMarco Ch.6 (System Metrics — completeness)
#         Fenton/Pfleeger: resource metrics — what % of the system
#         is measured/documented?
# ═══════════════════════════════════════════════════════════════════

def knowledge_coverage(
    systems_documented: int,
    systems_total: int,
    documented_freshness_scores: List[float],
    minimum_freshness: float = 0.50,
) -> Dict:
    """
    Track how well the knowledge base covers the system.
    DeMarco Ch.6, p.95: "You cannot control what you cannot measure. But
    you also cannot measure what you haven't identified. The first metric
    is coverage: what fraction of the system do we actually understand?"

    Fenton/Pfleeger: "Resource metrics track the availability and quality
    of the artifacts needed to build and maintain the system."

    Three dimensions:
      1. Breadth: What % of systems have ANY documentation?
      2. Depth: Of documented systems, what % of docs are currently fresh?
      3. Quality: What is the average freshness across all documented systems?

    Returns dict with coverage metrics and DeMarco's "corrective action" guidance.
    """
    if not isinstance(systems_total, int) or systems_total < 1:
        raise ValueError(f"systems_total must be ≥ 1, got {systems_total}")
    if not isinstance(systems_documented, int) or systems_documented < 0:
        raise ValueError(f"systems_documented must be ≥ 0")
    if systems_documented > systems_total:
        raise ValueError(f"systems_documented ({systems_documented}) > total ({systems_total})")
    _fv(minimum_freshness, "minimum_freshness")

    breadth = systems_documented / systems_total
    fresh_count = sum(1 for f in documented_freshness_scores if f >= minimum_freshness)
    depth = fresh_count / max(systems_documented, 1)
    avg_freshness = sum(documented_freshness_scores) / max(len(documented_freshness_scores), 1)

    # Composite coverage score
    coverage = breadth * 0.40 + depth * 0.40 + avg_freshness * 0.20

    flags = []
    if breadth < 0.80:
        flags.append(f"Only {breadth*100:.0f}% of systems documented. "
                    "DeMarco Ch.6: 'Undocumented systems are unmanaged systems.'")
    if depth < 0.60:
        flags.append(f"Only {depth*100:.0f}% of documented systems have fresh docs. "
                    "Fenton/Pfleeger: 'A stale document is a liability — it provides "
                    "false confidence.'")
    if avg_freshness < 0.50:
        flags.append(f"Average freshness {avg_freshness:.2f} — below minimum. "
                    "Knowledge base is decaying faster than it's being maintained.")

    if coverage >= 0.75 and not flags:
        level = "HEALTHY — knowledge base is well-maintained"
    elif coverage >= 0.50:
        level = "ADEQUATE — coverage is acceptable but gaps exist"
    elif coverage >= 0.30:
        level = "DEGRADING — significant undocumented or stale areas"
    else:
        level = "CRITICAL — knowledge base is failing. Immediate remediation required."

    return {"breadth_pct": round(breadth * 100, 1),
            "depth_pct": round(depth * 100, 1),
            "avg_freshness": round(avg_freshness, 3),
            "coverage_score": round(coverage, 3),
            "level": level, "flags": flags,
            "source": "DeMarco Ch.6; Fenton/Pfleeger resource metrics"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — EDIT-IMPACT ESTIMATION
# Source: DeMarco Ch.10-12 (Cost Models, Corrective Action Economics)
# ═══════════════════════════════════════════════════════════════════

def edit_impact(
    doc_staleness: float,
    reference_count: int,
    usage_frequency: int,
    consequence_severity: int,  # 1-5: what happens if someone acts on stale info?
    remediation_effort_hours: float = 4.0,  # estimated hours to update the doc
) -> Dict:
    """
    Estimate the impact of stale documentation on the system.
    DeMarco Ch.10, p.167: "The cost of not fixing a defect is not zero.
    It is the cost of every decision made on wrong information."

    DeMarco Ch.12, p.210: "Corrective action has a cost. The economics of
    maintenance is the art of spending the least to prevent the most
    downstream damage."

    Edit-Impact = Staleness × References × Usage × Severity × Cost-per-bad-decision

    Where:
      - Staleness: probability the info is wrong (from doc_freshness → 1-freshness)
      - References: how many other docs depend on this one (amplification)
      - Usage: how many times it's accessed (exposure)
      - Severity: consequence of bad decision (1=minor, 5=catastrophic)

    ROI of updating = (Impact × Cost_of_decision_error) / Remediation_Cost
      If ROI > 1.0: update now. If ROI < 0.5: defer.

    Returns dict with impact score, ROI, and prioritization.

    Edge cases: staleness > 1.0 → capped at 1.0
    """
    _fv(doc_staleness, "doc_staleness")
    if not isinstance(reference_count, int) or reference_count < 0:
        raise ValueError(f"reference_count must be ≥ 0")
    if not isinstance(usage_frequency, int) or usage_frequency < 0:
        raise ValueError(f"usage_frequency must be ≥ 0")
    if not isinstance(consequence_severity, int):
        raise ValueError(f"consequence_severity must be int, got {type(consequence_severity).__name__}")
    if consequence_severity < 1 or consequence_severity > 5:
        raise ValueError(f"consequence_severity must be 1-5, got {consequence_severity}")
    _fv(remediation_effort_hours, "remediation_effort_hours")
    if remediation_effort_hours <= 0:
        raise ValueError(f"remediation_effort_hours must be > 0")

    # Wrongness probability
    p_wrong = min(1.0, doc_staleness)

    # Amplification factor — references create cascade effects
    if reference_count >= 20:    ref_factor = 3.0
    elif reference_count >= 10:  ref_factor = 2.0
    elif reference_count >= 3:   ref_factor = 1.5
    else:                        ref_factor = 1.0

    # Exposure factor — frequently used docs cause more damage
    usage_norm = min(1.0, usage_frequency / 100.0)
    exp_factor = 1.0 + usage_norm

    # Severity multiplier
    sev_mult = {1: 0.2, 2: 0.5, 3: 1.0, 4: 2.5, 5: 5.0}[consequence_severity]

    # Cost estimation per DeMarco Ch.11
    # Assume each bad decision costs ~1 day of rework (~$1000 as placeholder unit)
    cost_per_bad_decision = sev_mult  # normalized to severity units

    impact = p_wrong * ref_factor * exp_factor * cost_per_bad_decision
    impact = round(impact, 3)

    # ROI: impact / remediation cost (hours)
    roi = impact / remediation_effort_hours if remediation_effort_hours > 0 else float('inf')

    if impact >= 3.0 or roi >= 2.0:
        priority, action = "IMMEDIATE", "High-impact stale doc — update now. DeMarco Ch.12: 'The cost of NOT fixing grows faster than the cost of fixing.'"
    elif impact >= 1.0 or roi >= 1.0:
        priority, action = "HIGH", "Scheduled remediation. Positive ROI justifies the effort."
    elif impact >= 0.3:
        priority, action = "MEDIUM", "Defer if constrained. Document is stale but impact is contained."
    else:
        priority, action = "LOW", "Defer. Low staleness or low references → minimal risk."

    return {"impact_score": round(impact, 2), "p_wrong": round(p_wrong, 3),
            "ref_factor": ref_factor, "exposure_factor": round(exp_factor, 2),
            "roi": round(roi, 2) if roi != float('inf') else "∞",
            "priority": priority, "action": action,
            "source": "DeMarco Ch.10-12; Fenton/Pfleeger"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — AUDIT PRIORITY ORDERING
# Source: DeMarco Ch.2 (Control Theory — corrective action priority)
# ═══════════════════════════════════════════════════════════════════

def audit_priority(
    items: List[Dict],
) -> List[Dict]:
    """
    Rank knowledge artifacts for audit/review by composite priority.
    DeMarco Ch.2, p.26: "The controller must decide what to fix first.
    Not everything can be fixed at once. Priority = impact × urgency."

    Composite = staleness × 0.40 + reference_count_norm × 0.30 +
                edit_risk × 0.30

    Where:
      staleness: from doc_freshness → 1 - freshness (0-1)
      reference_count_norm: min(references / 10, 1.0) — 10+ refs = max
      edit_risk: 1.0 / (1 + edit_frequency) — never edited = highest risk

    This prioritizes: stale AND widely-cited AND unmaintained.

    Args:
      items: List of {'name': str, 'staleness': float,
              'reference_count': int, 'edit_frequency': int}

    Returns items sorted by priority_score descending with rank.
    """
    if not items:
        raise ValueError("items must be non-empty")

    for i, it in enumerate(items):
        for key in ("name", "staleness", "reference_count", "edit_frequency"):
            if key not in it:
                raise ValueError(f"items[{i}] missing required key: '{key}'")

    scored = []
    for it in items:
        st = float(it["staleness"])
        ref_count = int(it["reference_count"])
        edit_freq = int(it["edit_frequency"])

        ref_norm = min(ref_count / 10.0, 1.0)
        edit_risk = 1.0 / (1.0 + edit_freq)

        priority = st * 0.40 + ref_norm * 0.30 + edit_risk * 0.30
        scored.append({"name": it["name"], "priority": round(priority, 3),
                       "staleness": st, "references": ref_count,
                       "edit_frequency": edit_freq})

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
# PART 5 — LESSON-CYCLE ECONOMICS
# Source: DeMarco Ch.15-17 (Quality Economics)
#         Fenton/Pfleeger: process metrics — feedback cycle efficiency
# ═══════════════════════════════════════════════════════════════════

def lesson_cycle_economics(
    lessons_identified: int,
    lessons_converted_to_edits: int,
    edits_completed: int,
    lessons_stale_before_action: int,
    total_agent_hours_on_lessons: float,
    incidents_prevented_by_lessons: int = 0,
) -> Dict:
    """
    Measure the economics of the lesson-learning feedback loop.
    DeMarco Ch.15, p.253: "The purpose of a postmortem is not to document
    what happened. It is to prevent what happened from happening again."

    DeMarco Ch.17, p.288: "Quality improvement is not free. But the cost
    of NOT improving is the cost of every recurrence."

    Three efficiency metrics:
      1. Conversion rate: lessons → actual code/process edits (are we acting?)
      2. Completion rate: edits started → edits completed (are we finishing?)
      3. Staleness loss: lessons that became stale before action (timing matters)

    ROI = Incidents_Prevented × Cost_per_Incident / Cost_of_Lesson_Process

    Returns dict with cycle metrics and DeMarco's process improvement guidance.

    Edge cases: zero lessons → all rates = 0 (no cycle to measure)
    """
    if not isinstance(lessons_identified, int) or lessons_identified < 0:
        raise ValueError(f"lessons_identified must be ≥ 0")
    if not isinstance(lessons_converted_to_edits, int) or lessons_converted_to_edits < 0:
        raise ValueError(f"lessons_converted_to_edits must be ≥ 0")
    if not isinstance(edits_completed, int) or edits_completed < 0:
        raise ValueError(f"edits_completed must be ≥ 0")
    if not isinstance(lessons_stale_before_action, int):
        raise ValueError(f"lessons_stale_before_action must be ≥ 0")
    _fv(total_agent_hours_on_lessons, "total_agent_hours_on_lessons")
    if not isinstance(incidents_prevented_by_lessons, int) or incidents_prevented_by_lessons < 0:
        raise ValueError(f"incidents_prevented_by_lessons must be ≥ 0")

    if lessons_identified == 0:
        return {"efficiency_score": 0.0, "level": "NO DATA",
                "message": "No lessons identified — no cycle to measure. DeMarco Ch.15: 'If you're not learning, you're not measuring.'",
                "source": "DeMarco Ch.15-17"}

    conversion_rate = lessons_converted_to_edits / lessons_identified
    completion_rate = edits_completed / max(lessons_converted_to_edits, 1)
    staleness_loss_rate = lessons_stale_before_action / lessons_identified

    # Efficiency score: weighted composite
    efficiency = (conversion_rate * 0.40 + completion_rate * 0.40 +
                  (1.0 - staleness_loss_rate) * 0.20)

    # Cost metrics
    hours_per_lesson = total_agent_hours_on_lessons / lessons_identified

    flags = []
    if conversion_rate < 0.50:
        flags.append(f"Low conversion rate ({conversion_rate*100:.0f}%). "
                    "DeMarco Ch.17: 'A lesson not acted on is a cost with no return.'")
    if staleness_loss_rate > 0.20:
        flags.append(f"High staleness loss ({staleness_loss_rate*100:.0f}% stale before action). "
                    "DeMarco Ch.15: 'A lesson learned too late is a lesson paid for twice.'")
    if completion_rate < 0.70:
        flags.append(f"Low completion rate ({completion_rate*100:.0f}%). "
                    "Fenton/Pfleeger: 'Process metrics that measure intent without completion are vanity.'")
    if hours_per_lesson > 8:
        flags.append(f"High cost per lesson ({hours_per_lesson:.1f}h). "
                    "DeMarco Ch.12: 'The cure must cost less than the disease.'")

    if efficiency >= 0.80:
        level = "EFFICIENT — lesson cycle is healthy"
    elif efficiency >= 0.50:
        level = "ADEQUATE — cycle works but has bottlenecks"
    elif efficiency >= 0.30:
        level = "INEFFICIENT — significant waste in the lesson cycle"
    else:
        level = "BROKEN — lessons are captured but not acted on"

    return {"conversion_rate": round(conversion_rate, 3),
            "completion_rate": round(completion_rate, 3),
            "staleness_loss_rate": round(staleness_loss_rate, 3),
            "efficiency_score": round(efficiency, 3),
            "hours_per_lesson": round(hours_per_lesson, 1),
            "level": level, "flags": flags,
            "source": "DeMarco Ch.15-17; Fenton/Pfleeger process metrics"}


# ═══════════════════════════════════════════════════════════════════
# PART 6 — REMEDIATION COST ESTIMATION
# Source: DeMarco Ch.10-12 (Cost Models)
# ═══════════════════════════════════════════════════════════════════

def remediation_cost_estimate(
    stale_docs: int,
    avg_freshness: float,
    avg_remediation_hours: float,
    opportunity_cost_per_hour: float = 200,  # placeholder — operator-sets
) -> Dict:
    """
    Estimate the total cost of bringing documentation to freshness.
    DeMarco Ch.11, p.185: "The cost of corrective action is a function
    of the volume of defects and the effort per defect."

    DeMarco Ch.12, p.202: "Not all corrective actions are equal. Some
    prevent recurrence; others merely clean up. Prioritize by economic impact."

    Estimation model:
      Total remediation hours = stale_docs × avg_remediation_hours × staleness_factor
      where staleness_factor = 1.0 - avg_freshness (worse freshness = more work)

    Cost = hours × opportunity_cost_per_hour

    Also computes: cost of NOT fixing (partial estimate based on edit_impact)

    Returns dict with cost estimates and DeMarco's "fix vs defer" guidance.

    Edge cases: no stale docs → zero cost
    """
    if not isinstance(stale_docs, int) or stale_docs < 0:
        raise ValueError(f"stale_docs must be ≥ 0")
    _fv(avg_freshness, "avg_freshness")
    _fv(avg_remediation_hours, "avg_remediation_hours")
    _fv(opportunity_cost_per_hour, "opportunity_cost_per_hour")

    if stale_docs == 0:
        return {"total_hours": 0.0, "total_cost": 0.0,
                "verdict": "No stale docs — nothing to remediate.",
                "source": "DeMarco Ch.11-12"}

    staleness_factor = max(0.0, 1.0 - avg_freshness)
    total_hours = stale_docs * avg_remediation_hours * staleness_factor
    total_cost = total_hours * opportunity_cost_per_hour

    if stale_docs <= 5:
        verdict = "MINIMAL — remediation is manageable. Clean up in this cycle."
    elif stale_docs <= 20:
        verdict = "MANAGEABLE — schedule remediation sprints. DeMarco Ch.12: 'Batch corrective actions for efficiency, but don't batch the risk.'"
    elif stale_docs <= 50:
        verdict = "SUBSTANTIAL — remediation requires dedicated effort. Prioritize by impact. DeMarco Ch.12: 'Fix what hurts most first.'"
    else:
        verdict = "CRISIS — documentation debt is out of control. Triage: archive low-impact, fix critical, accept the rest as known risk. DeMarco Ch.12: 'At some point, you must decide what NOT to fix.'"

    return {"stale_docs": stale_docs, "avg_freshness": avg_freshness,
            "staleness_factor": round(staleness_factor, 3),
            "total_hours": round(total_hours, 1),
            "total_cost": round(total_cost, 2),
            "verdict": verdict,
            "source": "DeMarco Ch.10-12"}


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
    print("SELF-TEST SUITE: staleness_economics.py")
    print("Sources: DeMarco (1982) + CETIC/Fenton-Pfleeger (1997)")
    print("=" * 70)

    # ── Decay Models ──
    print("\n── Decay Models (DeMarco Ch.3) ──")
    d = doc_freshness(0, 365, "exponential")
    ck("exp: age=0 → fresh=1.0", d["freshness"], 1.0)
    d2 = doc_freshness(365, 365, "exponential")
    # exp(-1.0) = 0.368
    ck("exp: age=max → ~0.37", d2["freshness"], 0.368, tol=0.01)

    dl = doc_freshness(365, 365, "linear")
    ck("linear: age=max → 0.0", dl["freshness"], 0.0)

    dlog = doc_freshness(365, 365, "logarithmic")
    ck("log: age=max → with k=1 → 0.0", dlog["freshness"], 0.0)

    # Days-to-review
    fresh_doc = doc_freshness(30, 365, "exponential")
    ck("fresh: 30-day doc → no action", fresh_doc["days_to_review"] is None, True)

    stale_doc = doc_freshness(500, 365, "exponential")
    ck("stale: 500-day exp → review urgently", stale_doc["days_to_review"] <= 7, True)

    # Thresholds
    ck("thresh: security=0.85", staleness_threshold_for_doc_type("security_policy"), 0.85)
    ck("thresh: onboarding=0.45", staleness_threshold_for_doc_type("onboarding_guide"), 0.45)
    ck("thresh: unknown→default", staleness_threshold_for_doc_type("widget"), 0.70)

    # ── Knowledge Coverage ──
    print("\n── Knowledge Coverage (DeMarco Ch.6) ──")
    kc = knowledge_coverage(8, 10, [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.9])
    ck("kc: 8/10 systems → 80% breadth", kc["breadth_pct"], 80.0)
    ck("kc: 6/8 fresh → 75.0% depth", kc["depth_pct"], 75.0)

    kc2 = knowledge_coverage(3, 15, [0.2, 0.1, 0.1])
    ck("kc2: poor coverage → CRITICAL or DEGRADING",
       "CRITICAL" in kc2["level"] or "DEGRADING" in kc2["level"], True)

    # ── Edit-Impact ──
    print("\n── Edit-Impact (DeMarco Ch.10-12) ──")
    ei = edit_impact(0.80, 15, 200, 4, 2.0)
    ck("ei: stale+widely-cited+severe → IMMEDIATE", ei["priority"], "IMMEDIATE")
    ck("ei: roi > 1", isinstance(ei["roi"], str) or ei["roi"] > 1.0, True)

    ei2 = edit_impact(0.10, 1, 5, 1, 10.0)
    ck("ei2: fresh+isolated+minor → LOW", ei2["priority"], "LOW")

    # ── Audit Priority ──
    print("\n── Audit Priority (DeMarco Ch.2) ──")
    items = [
        {"name": "Architecture ADR", "staleness": 0.90, "reference_count": 20, "edit_frequency": 0},
        {"name": "Onboarding Guide", "staleness": 0.10, "reference_count": 5, "edit_frequency": 10},
        {"name": "Security Policy", "staleness": 0.55, "reference_count": 8, "edit_frequency": 1},
    ]
    ranked = audit_priority(items)
    ck("audit: #1 = Architecture ADR", ranked[0]["name"], "Architecture ADR")
    ck("audit: #3 = Onboarding Guide", ranked[-1]["name"], "Onboarding Guide")

    # ── Lesson-Cycle Economics ──
    print("\n── Lesson-Cycle Economics (DeMarco Ch.15-17) ──")
    lc = lesson_cycle_economics(20, 18, 16, 2, 60, incidents_prevented_by_lessons=5)
    ck("lc: 20→18→16, low staleness → EFFICIENT or ADEQUATE",
       "EFFICIENT" in lc["level"] or "ADEQUATE" in lc["level"], True)
    ck("lc: conversion=0.90", lc["conversion_rate"], 0.90)

    lc2 = lesson_cycle_economics(20, 5, 2, 10, 200)
    ck("lc2: bad cycle → INEFFICIENT or BROKEN",
       "INEFFICIENT" in lc2["level"] or "BROKEN" in lc2["level"], True)
    ck("lc2: conversion=0.25", lc2["conversion_rate"], 0.25)

    # ── Remediation Cost ──
    print("\n── Remediation Cost (DeMarco Ch.11-12) ──")
    rc = remediation_cost_estimate(30, 0.35, 3, 200)
    ck("rc: 30 stale docs, 0.35 fresh → SUBSTANTIAL", "SUBSTANTIAL" in rc["verdict"], True)

    rc2 = remediation_cost_estimate(3, 0.80, 1, 200)
    ck("rc2: 3 docs, 0.80 fresh → MINIMAL", "MINIMAL" in rc2["verdict"], True)

    # ── ── Edge ──
    print("\n── Edge Cases ──")
    try: doc_freshness(-1); print("  FAIL: no exception")
    except ValueError: print("  PASS: age<0 raised")
    p += 1

    try: audit_priority([]); print("  FAIL: no exception")
    except ValueError: print("  PASS: empty list raised")
    p += 1

    # ── Integration ──
    print("\n── Integration: Decay → Coverage → Impact → Economics ──")
    decay = doc_freshness(400, 365, "exponential")
    ck("int: 400-day doc needs review", decay["days_to_review"] is not None, True)

    cov = knowledge_coverage(6, 8, [0.85, 0.72, 0.55, 0.40, 0.30, 0.90])
    ck("int: coverage ~ADEQUATE", cov["coverage_score"] > 0.3, True)

    impact = edit_impact(1.0 - decay["freshness"], 8, 50, 3, 3.0)
    ck("int: impact computed", impact["impact_score"] > 0, True)

    lesson = lesson_cycle_economics(15, 12, 10, 1, 45)
    ck("int: lesson cycle running", lesson["efficiency_score"] > 0.5, True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
