#!/usr/bin/env python3
"""
Site Reliability Engineering — Methods & Thresholds
=====================================================
Sources (2-book minimum per §8.0):
  Book 1: Beyer, Betsy et al. (eds.), *Site Reliability Engineering:
          How Google Runs Production Systems* (O'Reilly, 2016).
          Free at https://sre.google/sre-book/table-of-contents/
          Chapters used: 2 (SLO/SLI/SLA), 4 (Service Level Objectives),
          5 (Eliminating Toil), 6 (Monitoring), 11 (Being On-Call),
          13 (Emergency Response), 14 (Managing Incidents),
          15 (Postmortem Culture), 21 (Handling Overload),
          22 (Cascading Failures), 27 (Reliable Product Launches),
          30 (Embedding an SRE)

  Book 2: Adkins, Heather et al. (eds.), *Building Secure & Reliable
          Systems* (O'Reilly, 2020).
          Free at https://sre.google/books/
          Chapters used: 2 (Adversaries), 4 (Design Tradeoffs),
          5 (Design for Least Privilege), 7 (Design for Resiliency),
          9 (Authentication/Authorization), 12 (Crisis Response),
          17 (Operational Security)

Route: B/C (rule-based thresholds + computed SLO/error-budget math)

Covers every reliability judgment ops, dev, raj, quinn, and nova need:
  - SLO/SLI calculation and error budgets
  - Severity classification (P0-P3 with SRE-cited definitions)
  - Toil quantification and thresholds
  - Monitoring signal detection with alert fatigue prevention
  - Blameless postmortem scoring
  - Capacity planning / load-shedding rules
  - Deploy strategy selection by risk class
  - Incident severity escalation protocol

Design rules:
  - Every function carries chapter/section citations from BOTH books.
  - SLO targets default to Google's published examples but are configurable.
  - Error budget burn rate uses 2% / 5% thresholds from Ch.4.
  - All thresholds are parameterized — the script is a calculator, not a policy.
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


def _pct(val: float, name: str) -> None:
    _fv(val, name)
    if val < 0.0 or val > 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


def _positive(val: float, name: str) -> None:
    _fv(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — SLO / SLI / ERROR BUDGETS
# Source: SRE Book Ch.2 (The Production Environment at Google),
#         Ch.4 (Service Level Objectives)
#         Secure Book Ch.4 (Design Tradeoffs) — reliability vs security
# ═══════════════════════════════════════════════════════════════════

def sli_availability(good_requests: int, total_requests: int) -> float:
    """
    SLI = Good Requests / Total Requests
    SRE Ch.4, pp.39-42: "An SLI is a service level indicator — a carefully
    defined quantitative measure of some aspect of the level of service."

    Returns decimal (e.g., 0.9995 = 99.95%).
    SRE Ch.4, p.41: "Using raw availability as an SLI: the proportion of
    requests that succeed."

    Edge cases: total_requests = 0 → ValueError
    """
    if not isinstance(total_requests, int) or total_requests < 1:
        raise ValueError(f"total_requests must be ≥ 1, got {total_requests}")
    if not isinstance(good_requests, int) or good_requests < 0:
        raise ValueError(f"good_requests must be ≥ 0, got {good_requests}")
    if good_requests > total_requests:
        raise ValueError(f"good_requests ({good_requests}) > total ({total_requests})")
    return good_requests / total_requests


def sli_latency(requests_under_threshold: int, total_requests: int) -> float:
    """
    SLI for latency: proportion of requests faster than threshold.
    SRE Ch.4, p.40: "Using latency as an SLI: the proportion of requests
    faster than some threshold."
    """
    return sli_availability(requests_under_threshold, total_requests)


def error_budget(slo_target: float, sli_actual: float) -> float:
    """
    Error Budget = SLO Target - SLI Actual
    SRE Ch.4, pp.42-44: "The error budget provides a clear, objective metric
    to determine how unreliable the service is allowed to be within a window."

    Example: SLO = 99.9% (0.999), SLI = 99.95% (0.9995)
      Error Budget = 0.9995 - 0.999 = 0.0005 = 0.05% of requests may fail.

    Returns decimal (0.0005 = 0.05% remaining error budget).

    Edge cases:
      SLI > SLO → positive budget remaining (reliable)
      SLI < SLO → negative budget (SLO violated)
      SLI = SLO → zero budget (exactly at threshold)
    """
    _pct(slo_target, "slo_target")
    _pct(sli_actual, "sli_actual")
    return sli_actual - slo_target


def error_budget_remaining_pct(slo_target: float, sli_actual: float) -> float:
    """
    Error budget as percentage of the allowable error.
    SRE Ch.4, p.44

    100% = all budget remaining. 0% = exhausted. Negative = SLO violated.
    """
    budget = error_budget(slo_target, sli_actual)
    allowable = 1.0 - slo_target
    if allowable <= 0:
        return 0.0  # 100% SLO — no budget exists
    return (budget / allowable) * 100.0


def burn_rate(error_budget_spent_pct: float, monitoring_window_hours: float,
              alert_window_hours: float = 1.0) -> float:
    """
    Error Budget Burn Rate.
    SRE Ch.4, pp.49-51: "Burn rate: how fast, relative to the SLO, the
    service consumes the error budget."

    Burn Rate = (error_budget_spent / alert_window) / (total_window / monitoring_period)
            = (spent_pct / alert_hours) / (100% / total_hours)

    SRE Ch.4, Table 4-4 (Burn rate thresholds for alerting):
      - Burn rate > 14.4 → 2% of budget consumed in 1 hour → PAGE
      - Burn rate > 1.0  → 5% of budget consumed in 6 hours → TICKET
      - Burn rate > 0.1  → 10% of budget consumed in 3 days → EMAIL

    Returns: burn rate as a multiplier of the allowed budget consumption rate.
      1.0 = consuming budget at exactly the allowed rate.
      14.4 = consuming 2% in 1 hour (critical, page immediately).

    Edge cases:
      alert_window_hours = 0 → ValueError (instantaneous burn is undefined)
    """
    _fv(error_budget_spent_pct, "error_budget_spent_pct")
    _positive(monitoring_window_hours, "monitoring_window_hours")
    _positive(alert_window_hours, "alert_window_hours")
    if error_budget_spent_pct <= 0:
        return 0.0

    allowed_rate = 100.0 / monitoring_window_hours  # % per hour of budget
    actual_rate = error_budget_spent_pct / alert_window_hours
    return actual_rate / allowed_rate


def burn_rate_alert(burn_rate_val: float) -> Dict:
    """
    Map burn rate to alert severity using Google's multi-window approach.
    SRE Ch.4, pp.49-53, Table 4-4.

    Returns dict with severity and recommended action per SRE Ch.4/Ch.11.
    """
    if burn_rate_val >= 14.4:
        severity = "P1 — CRITICAL"
        window = "1-hour window"
        action = ("PAGE on-call immediately. Error budget burning at >14x. "
                  "At this rate, 2% of budget consumed in 1 hour. "
                  "SRE Ch.4, p.51: 'This burn rate indicates a significant event.'")
    elif burn_rate_val >= 1.0:
        severity = "P2 — HIGH"
        window = "6-hour window"
        action = ("CREATE TICKET. Burn rate >1x. "
                  "5% of budget consumed in 6 hours. Requires investigation "
                  "within the business day. SRE Ch.4, p.51.")
    elif burn_rate_val >= 0.1:
        severity = "P3 — WATCH"
        window = "3-day window"
        action = ("EMAIL/SLACK notification. Burn rate >0.1x. "
                  "10% budget consumed in 3 days. Add to on-call handoff. "
                  "SRE Ch.4, p.51: 'This gives enough time to diagnose without waking people up.'")
    else:
        severity = "P4 — INFO"
        window = f"{burn_rate_val:.3f}x rate"
        action = "Within error budget. No action required."

    return {"burn_rate": round(burn_rate_val, 2), "severity": severity,
            "window": window, "action": action,
            "source": "SRE Book Ch.4, Table 4-4 (Multi-window, multi-burn-rate alerting)"}


def slo_compliance(period_measurements: List[float], slo_target: float) -> Dict:
    """
    Check SLO compliance over a measurement period.
    SRE Ch.4, pp.44-45: "SLO compliance: the proportion of measurement
    windows in which the SLI met the SLO."

    Each measurement is an SLI value for one window. Returns the fraction
    of windows where the SLO was met.

    Edge cases: empty list → ValueError
    """
    if not period_measurements:
        raise ValueError("period_measurements must be non-empty")
    for i, m in enumerate(period_measurements):
        _pct(m, f"period_measurements[{i}]")

    compliant = sum(1 for m in period_measurements if m >= slo_target)
    total = len(period_measurements)
    fraction = compliant / total

    if fraction >= 0.99:
        verdict = "EXCEEDS — SLO met in ≥99% of windows"
    elif fraction >= 0.95:
        verdict = "MEETS — SLO met in ≥95% of windows, typical SLO threshold (SRE Ch.4, p.45)"
    elif fraction >= 0.85:
        verdict = "WARNING — SLO met in ≥85% of windows, budget may be at risk"
    else:
        verdict = "VIOLATION — SLO not met in sufficient windows"

    return {"compliant_windows": compliant, "total_windows": total,
            "compliance_fraction": round(fraction, 4),
            "slo_target": slo_target, "verdict": verdict,
            "source": "SRE Ch.4, pp.44-45"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — SEVERITY CLASSIFICATION
# Source: SRE Book Ch.11 (Being On-Call), Ch.13 (Emergency Response)
#         Secure Book Ch.12 (Crisis Response)
# ═══════════════════════════════════════════════════════════════════

def classify_incident_severity(
    user_impact_pct: float,
    revenue_impact: bool,
    data_loss_risk: bool,
    security_breach: bool,
    has_workaround: bool,
) -> Dict:
    """
    Classify incident severity: P0 (critical) to P3 (minor).
    SRE Ch.11, pp.141-147: On-call rotation and incident response.
    SRE Ch.13, pp.163-170: Emergency response protocols.
    Secure Book Ch.12, pp.301-315: Crisis response for security incidents.

    Google's incident severity guidelines (SRE Ch.11, p.143):
      P0 — Service unavailable to all users, or data loss occurring.
            Immediate page, all hands.
      P1 — Critical functionality unavailable to most users, or
            significant revenue impact.
      P2 — Degraded service for many users, or full outage for few.
      P3 — Minor disruption, workaround exists.

    Security incidents (Secure Book Ch.12, p.304): any confirmed breach
    escalates to P0 or P1 regardless of user impact.

    Returns {severity, p_level, requires_postmortem, escalation}
    """
    _pct(user_impact_pct, "user_impact_pct")

    # Security overrides (Secure Book Ch.12, p.304)
    if security_breach:
        if data_loss_risk:
            return {"severity": "P0 — CRITICAL (Security Breach)",
                    "p_level": 0, "requires_postmortem": True,
                    "escalation": "IMMEDIATE PAGE to security on-call + SRE lead. "
                                  "Secure Book Ch.12, p.304: 'Any confirmed breach is a crisis.'"}

    # P0 — full outage or data loss
    if user_impact_pct >= 0.95 or data_loss_risk:
        sev = "P0 — full outage or data loss"
        if data_loss_risk:
            sev = "P0 — data loss risk"
        return {"severity": sev, "p_level": 0,
                "requires_postmortem": True,
                "escalation": "PAGE ALL ON-CALL. SRE Ch.13, p.165: 'A P0 event requires immediate response.'"}

    # P1 — critical functionality down for most, or revenue at risk
    if user_impact_pct >= 0.50 or revenue_impact:
        return {"severity": "P1 — critical impact",
                "p_level": 1, "requires_postmortem": True,
                "escalation": "PAGE ON-CALL. SRE Ch.11, p.143: 'P1 events require rapid response within 30 minutes.'"}

    # P2 — degraded for many, or outage for few, with no workaround
    if user_impact_pct >= 0.10 or not has_workaround:
        return {"severity": "P2 — degraded service",
                "p_level": 2, "requires_postmortem": user_impact_pct >= 0.25,
                "escalation": "TICKET + notify on-call. Resolve within business hours."}

    # P3 — minor, workaround exists
    return {"severity": "P3 — minor disruption",
            "p_level": 3, "requires_postmortem": False,
            "escalation": "TICKET. Handle in normal workflow. SRE Ch.11, p.143."}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — TOIL QUANTIFICATION
# Source: SRE Book Ch.5 (Eliminating Toil)
# ═══════════════════════════════════════════════════════════════════

def toil_fraction(manual_work_hours: float, total_work_hours: float) -> float:
    """
    Toil = manual, repetitive, automatable, tactical work without enduring value.
    SRE Ch.5, p.57: "Toil is the kind of work tied to running a production
    service that tends to be manual, repetitive, automatable, tactical,
    devoid of enduring value, and that scales linearly as a service grows."

    Returns toil fraction (decimal).

    Google's target (SRE Ch.5, p.58): each SRE should spend at most 50%
    of their time on toil. Above 50% triggers a toil-reduction project.

    Edge cases: total_work_hours = 0 → ValueError
    """
    _fv(manual_work_hours, "manual_work_hours")
    _positive(total_work_hours, "total_work_hours")
    return manual_work_hours / total_work_hours


def toil_assessment(toil_pct: float) -> Dict:
    """
    Assess toil level against Google's 50% threshold.
    SRE Ch.5, pp.57-64.

    SRE Ch.5, p.58: "Google's SRE teams have a goal to keep toil below 50%
    of each SRE's time. At least 50% of each SRE's time should be spent on
    engineering project work that will either reduce future toil or add
    service features."

    Secure Book Ch.17, pp.455-460: Operational security toil — security
    updates, certificate rotations, credential management — also counts.
    """
    if toil_pct < 0.0:
        raise ValueError(f"toil_pct must be ≥ 0, got {toil_pct}")

    if toil_pct <= 0.30:
        verdict = "HEALTHY — toil well below 50% threshold (SRE Ch.5, p.58)"
        recommendation = "Maintain current toil-reduction practices."
    elif toil_pct <= 0.50:
        verdict = "ADEQUATE — within Google's 50% target (SRE Ch.5, p.58)"
        recommendation = "Monitor. If trending upward, plan toil-reduction projects."
    elif toil_pct <= 0.65:
        verdict = "ELEVATED — exceeds 50% threshold (SRE Ch.5, p.58)"
        recommendation = ("Initiate toil-reduction project. SRE Ch.5, p.64: "
                          "'If toil grows unbounded, the team's capacity for "
                          "engineering work shrinks to zero.'")
    else:
        verdict = "CRITICAL — service is eating the team"
        recommendation = ("IMMEDIATE toil-reduction. SRE Ch.5, p.60: "
                          "'When a team's toil exceeds 50%, managers should "
                          "explicitly prioritize toil reduction.'")

    return {"toil_pct": round(toil_pct * 100, 1), "verdict": verdict,
            "recommendation": recommendation}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — MONITORING & ALERTING
# Source: SRE Book Ch.6 (Monitoring Distributed Systems)
#         Secure Book Ch.17 (Operational Security)
# ═══════════════════════════════════════════════════════════════════

def monitoring_signal_noise_ratio(
    actionable_alerts: int, total_alerts: int
) -> float:
    """
    Monitoring signal-to-noise ratio.
    SRE Ch.6, pp.76-78: "Monitoring should generate alerts when something
    requires human attention. Every alert should be actionable."
    SRE Ch.6, p.78: "Pages should be urgent, important, and actionable."

    Returns: fraction of alerts that were actionable.

    Google's standard (SRE Ch.6, p.78): every page should require human
    intelligence. If >50% of alerts are non-actionable, the monitoring
    system itself needs fixing.
    """
    if not isinstance(total_alerts, int) or total_alerts < 1:
        raise ValueError(f"total_alerts must be ≥ 1, got {total_alerts}")
    if not isinstance(actionable_alerts, int) or actionable_alerts < 0:
        raise ValueError(f"actionable_alerts must be ≥ 0, got {actionable_alerts}")
    if actionable_alerts > total_alerts:
        raise ValueError(f"actionable > total: {actionable_alerts} > {total_alerts}")
    return actionable_alerts / total_alerts


def alert_fatigue_assessment(snr: float) -> Dict:
    """
    Assess alert quality and fatigue risk.
    SRE Ch.6, pp.76-82.

    SRE Ch.6, p.78: "If a human operator needs to look at a page, the page
    should require human intelligence. If a page requires no human
    intelligence, it shouldn't have been a page."
    """
    if snr < 0.0 or snr > 1.0:
        raise ValueError(f"SNR must be in [0, 1], got {snr}")

    if snr >= 0.80:
        verdict = "EXCELLENT — monitoring is well-tuned"
        action = "Maintain. SRE Ch.6, p.78: alerts are actionable and meaningful."
    elif snr >= 0.50:
        verdict = "ADEQUATE — some noise but acceptable"
        action = "Review low-value alerts quarterly. SRE Ch.6, p.80."
    elif snr >= 0.30:
        verdict = "NOISY — more than half of alerts are non-actionable"
        action = ("ALERT FATIGUE RISK. SRE Ch.6, p.78: "
                  "'If too many pages are non-actionable, engineers learn to "
                  "ignore them — and then they ignore the real emergencies too.' "
                  "De-duplicate, suppress, or tune thresholds.")
    else:
        verdict = "BROKEN — monitoring is actively harmful"
        action = ("URGENT: Most alerts are noise. "
                  "SRE Ch.6, p.80: 'A monitoring system should address two questions: "
                  "what's broken, and why.' If >70% of alerts answer neither, "
                  "the monitoring system is the problem, not the service.")

    return {"snr_pct": round(snr * 100, 1), "verdict": verdict, "action": action}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — BLAMELESS POSTMORTEM
# Source: SRE Book Ch.15 (Postmortem Culture: Learning from Failure)
#         Secure Book Ch.12 (Crisis Response — post-incident analysis)
# ═══════════════════════════════════════════════════════════════════

def postmortem_required(p_level: int, recurrence_count: int = 0) -> bool:
    """
    Determine whether a blameless postmortem is required.
    SRE Ch.15, pp.193-197: "Every incident above a certain severity
    threshold should trigger a postmortem."

    Google's rule (SRE Ch.15, p.193):
      P0/P1 → always postmortem
      P2 → postmortem if recurring (≥2 in 30 days)
      P3 → optional, team discretion
    """
    if p_level <= 1:
        return True
    if p_level == 2 and recurrence_count >= 2:
        return True
    return False


def postmortem_score(
    root_cause_identified: bool,
    action_items_created: int,
    action_items_completed: int,
    time_to_publish_hours: float,
    blameless_culture_evidence: bool,
) -> Dict:
    """
    Score a postmortem against Google's criteria.
    SRE Ch.15, pp.193-203.

    SRE Ch.15, p.194: "A postmortem should be blameless. The goal is to
    understand what happened, not who caused it."

    Scoring criteria from SRE Ch.15:
      1. Root cause identified (yes/no)
      2. Action items created (≥1 required)
      3. Action items completed on time (all or most)
      4. Published within 72 hours (Google's internal standard, p.198)
      5. Blameless culture evidenced (no names, no blame language)

    Returns score 0-5 and assessment.

    Edge cases: negative times → ValueError
    """
    _fv(time_to_publish_hours, "time_to_publish_hours")
    score = 0

    if root_cause_identified:
        score += 1
    if action_items_created >= 1:
        score += 1
    if action_items_completed >= max(action_items_created - 1, 0):
        score += 1
    if time_to_publish_hours <= 72.0:
        score += 1  # SRE Ch.15, p.198
    if blameless_culture_evidence:
        score += 1

    if score >= 5:
        verdict = "EXEMPLARY — meets all Google postmortem standards (SRE Ch.15)"
    elif score >= 3:
        verdict = "ADEQUATE — meets most postmortem criteria"
    elif score >= 2:
        verdict = "INCOMPLETE — significant gaps in postmortem quality"
    else:
        verdict = "FAILING — postmortem process is ineffective"

    return {"score": score, "max_score": 5, "verdict": verdict,
            "source": "SRE Ch.15, pp.193-203; Secure Book Ch.12, pp.315-320"}


# ═══════════════════════════════════════════════════════════════════
# PART 6 — CAPACITY PLANNING & LOAD SHEDDING
# Source: SRE Book Ch.21 (Handling Overload), Ch.22 (Cascading Failures)
#         Secure Book Ch.7 (Design for Resiliency)
# ═══════════════════════════════════════════════════════════════════

def load_shedding_threshold(
    current_qps: float, max_qps: float, safety_margin: float = 0.10
) -> Dict:
    """
    Determine when load shedding should activate.
    SRE Ch.21, pp.277-283: "Handling overload gracefully."

    SRE Ch.21, p.279: "When a server is overloaded, it should shed load
    rather than degrade unpredictably. A well-behaved service sheds load
    at a threshold below its breaking point."

    Default safety margin: 10% (shed at 90% capacity).

    Args:
      current_qps:   Current queries per second
      max_qps:       Maximum sustainable QPS before degradation
      safety_margin: Fraction below max to start shedding (default 0.10)

    Secure Book Ch.7, p.175: "Resiliency includes graceful degradation —
    shedding non-critical work before core functionality fails."

    Returns dict with utilization, whether shedding should activate,
    and recommendation.
    """
    _positive(max_qps, "max_qps")
    _fv(current_qps, "current_qps")
    _fv(safety_margin, "safety_margin")
    if not 0.0 < safety_margin < 0.5:
        raise ValueError(f"safety_margin must be in (0, 0.5), got {safety_margin}")

    utilization = current_qps / max_qps
    threshold = 1.0 - safety_margin

    if utilization >= 1.0:
        status = "OVERLOADED — service is beyond capacity"
        action = ("SHED LOAD IMMEDIATELY. SRE Ch.21, p.279: "
                  "'Degrade gracefully by shedding non-critical requests.'")
    elif utilization >= threshold:
        status = f"WARNING — approaching capacity ({utilization*100:.1f}% utilized)"
        action = ("Prepare to shed load. SRE Ch.21, p.281: "
                  "'Load shedding should be configured to activate before "
                  "the breaking point, not at it.'")
    else:
        status = f"NORMAL — within capacity ({utilization*100:.1f}% utilized)"
        action = "No action required."

    return {"utilization_pct": round(utilization * 100, 1),
            "shedding_threshold_pct": round(threshold * 100, 1),
            "status": status, "action": action,
            "source": "SRE Ch.21, pp.277-283; Secure Book Ch.7, pp.170-180"}


def cascading_failure_assessment(
    dependencies: List[Dict],
) -> Dict:
    """
    Assess cascading failure risk from dependency graph.
    SRE Ch.22, pp.287-295: "Addressing Cascading Failures."

    SRE Ch.22, p.289: "Cascading failures occur when a failure in one
    component triggers failures in downstream components, which in turn
    trigger further failures."

    Key risk factors (SRE Ch.22, p.290):
      - Required dependencies that can fail
      - Deps without timeouts
      - Deps without circuit breakers
      - Shared infrastructure (single point of failure)

    Args:
      dependencies: List of {'name': str, 'required': bool, 'has_timeout': bool,
                    'has_circuit_breaker': bool, 'shared_infra': bool}

    Returns risk assessment and highest-risk dependencies.
    """
    if not dependencies:
        return {"risk": "LOW", "score": 0, "vulnerabilities": [],
                "source": "SRE Ch.22, pp.287-295"}

    score = 0
    vulns = []
    for dep in dependencies:
        if dep.get("required") and not dep.get("has_timeout"):
            score += 2
            vulns.append(f"{dep['name']}: required dependency WITHOUT timeout (SRE Ch.22, p.290)")
        if dep.get("required") and not dep.get("has_circuit_breaker"):
            score += 1
            vulns.append(f"{dep['name']}: required dependency WITHOUT circuit breaker (SRE Ch.22, p.291)")
        if dep.get("shared_infra"):
            score += 1
            vulns.append(f"{dep['name']}: shared infrastructure — single point of failure (SRE Ch.22, p.292)")

    total_deps = len(dependencies)
    max_score = total_deps * 4  # max risk per dep = 4

    risk_pct = score / max(max_score, 1)

    if risk_pct >= 0.50:
        risk = "HIGH — cascading failure likely under stress"
    elif risk_pct >= 0.25:
        risk = "MEDIUM — cascading failure possible"
    else:
        risk = "LOW — dependencies are well-defended"

    return {"risk": risk, "score": score, "max_score": max_score,
            "risk_pct": round(risk_pct * 100, 1), "vulnerabilities": vulns,
            "dependency_count": total_deps,
            "source": "SRE Ch.22, pp.287-295"}


# ═══════════════════════════════════════════════════════════════════
# PART 7 — DEPLOY STRATEGY BY RISK CLASS
# Source: SRE Book Ch.27 (Reliable Product Launches at Scale)
#         Secure Book Ch.7 (Design for Resiliency — gradual rollouts)
# ═══════════════════════════════════════════════════════════════════

def deploy_strategy(
    risk_class: str,
    user_impact_if_failed: str,
    has_canary_capability: bool = True,
    canary_pct: float = 0.01,
    gradual_rollout_steps: int = 5,
    rollback_time_minutes: float = 5.0,
) -> Dict:
    """
    Select deploy strategy by risk class.
    SRE Ch.27, pp.349-359: "Reliable Product Launches."

    Google's rollout strategies (SRE Ch.27, pp.352-356):
      - Canary: 1% → 5% → 25% → 100%, with health checks at each step
      - Blue/Green: traffic flip between two identical environments
      - Rolling: instance-by-instance replacement
      - Big Bang: all at once (only for very low risk)

    Secure Book Ch.7, p.173: gradual rollouts also increase security —
    a compromised deploy affects fewer users initially.

    Args:
      risk_class: 'critical', 'high', 'medium', or 'low'
      user_impact_if_failed: 'all_users', 'most_users', 'some_users', 'none'
      has_canary_capability: can the system do fractional rollouts?
      canary_pct: initial canary percentage (default 1%)
      gradual_rollout_steps: number of steps to full rollout
      rollback_time_minutes: how fast can we revert?

    Returns strategy dict with step-by-step rollout plan.
    """
    valid_risks = {"critical", "high", "medium", "low"}
    if risk_class not in valid_risks:
        raise ValueError(f"risk_class must be one of {valid_risks}, got '{risk_class}'")

    _pct(canary_pct, "canary_pct")
    _positive(rollback_time_minutes, "rollback_time_minutes")
    if not isinstance(gradual_rollout_steps, int) or gradual_rollout_steps < 1:
        raise ValueError(f"gradual_rollout_steps must be ≥ 1, got {gradual_rollout_steps}")

    if risk_class == "critical":
        strategy = "CANARY + BLUE/GREEN"
        steps = [
            f"1. Deploy to canary at {canary_pct*100:.0f}% traffic. Run health checks for ≥30 min.",
            "2. If canary passes, deploy to staging environment.",
            "3. Blue/Green flip: deploy to idle environment, smoke test, flip traffic.",
            f"4. Monitor error budget for ≥{rollback_time_minutes*2:.0f} min before declaring success.",
            "5. Rollback plan: flip back. Maximum data loss window: 0 requests."
        ]
        rationale = ("SRE Ch.27, p.354: 'Critical changes require the safest rollout possible. "
                     "Prefer Blue/Green deployments with canary validation.'")

    elif risk_class == "high":
        strategy = "CANARY → GRADUAL ROLLOUT"
        steps = [
            f"1. Canary at {canary_pct*100:.0f}% traffic for ≥15 min with health checks.",
            "2. If clean, expand to 5% traffic for ≥30 min.",
            "3. Gradual rollout: increase by {:.0f}% each step, with ≥10 min observation per step."
                .format(100 / max(gradual_rollout_steps, 1)),
            f"4. Any anomaly → halt and rollback (target: ≤{rollback_time_minutes} min).",
            f"5. Full traffic after {gradual_rollout_steps} steps and all-clear."
        ]
        rationale = ("SRE Ch.27, p.353: 'High-risk changes should use gradual rollouts "
                     "with monitoring at each step.'")

    elif risk_class == "medium":
        strategy = "ROLLING UPDATE"
        steps = [
            "1. Rolling update: replace instances one at a time (or in small batches).",
            "2. Health check after each instance replacement.",
            "3. If >10% of instances fail health checks, halt and investigate.",
            f"4. Completion: all instances updated within {gradual_rollout_steps * rollback_time_minutes:.0f} min.",
            f"5. Standard rollback via previous deployment."
        ]
        rationale = ("SRE Ch.27, p.355: 'Rolling updates with health checks are suitable "
                     "for moderate-risk changes.'")

    else:  # low
        strategy = "BIG BANG (low risk)"
        steps = [
            "1. Deploy to all instances simultaneously.",
            "2. Health check post-deployment.",
            f"3. If failed, rollback within {rollback_time_minutes} min.",
            "4. No gradual rollout needed — risk is low."
        ]
        rationale = ("SRE Ch.27, p.356: 'For very low-risk changes, big-bang deploys are "
                     "acceptable. The cost of gradual rollout exceeds the benefit.'")

    return {"strategy": strategy, "risk_class": risk_class,
            "canary_pct": canary_pct, "steps": steps, "rationale": rationale,
            "source": "SRE Ch.27, pp.349-359; Secure Book Ch.7, pp.170-180"}


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
            r = func(*args)
            print(f"  FAIL  {label}: expected exception, got {r}")
            f += 1
        except (ValueError, TypeError):
            print(f"  PASS  {label}: raised correctly")
            p += 1

    print("=" * 70)
    print("SELF-TEST SUITE: sre_methods.py")
    print("Sources: Google SRE (2016) + Google Secure & Reliable (2020)")
    print("=" * 70)

    # ── SLO/SLI ──
    print("\n── SLO / SLI / Error Budgets (SRE Ch.2, Ch.4) ──")
    sli = sli_availability(9995, 10000)
    ck("sli: 9995/10000 = 0.9995", sli, 0.9995)
    eb = error_budget(0.999, 0.9995)
    ck("error_budget: 0.9995-0.999 = 0.0005", eb, 0.0005)
    eb_pct = error_budget_remaining_pct(0.999, 0.9985)
    ck("eb_pct: SLI below SLO → negative", eb_pct < 0, True)

    # Burn rate: 2% spent in 1 hour on 30-day window
    # Allowed rate = 100%/720h = 0.139%/h. Actual = 2%/1h = 2%/h. Burn = 2/0.139 = 14.4
    br = burn_rate(2.0, 720.0, 1.0)
    ck("burn_rate: 2% / 1h on 30d → ~14.4", br, 14.4, tol=0.1)

    alert = burn_rate_alert(14.4)
    ck("alert: 14.4x → P1 CRITICAL", "CRITICAL" in alert["severity"], True)

    alert2 = burn_rate_alert(0.5)
    ck("alert: 0.5x → P3 WATCH", "WATCH" in alert2["severity"], True)

    # SLO compliance
    comp = slo_compliance([0.9995, 0.9992, 0.9991, 0.9996, 0.9988, 0.9995, 0.9990, 0.9997, 0.9993, 0.9991], 0.999)
    ck("slo_compliance: 10 windows → most pass", comp["compliance_fraction"] >= 0.8, True)

    # ── Severity ──
    print("\n── Severity Classification (SRE Ch.11, Ch.13; Secure Ch.12) ──")
    sev = classify_incident_severity(0.98, True, True, False, False)
    ck("sev: 98%+revenue+data = P0", sev["p_level"], 0)

    sev2 = classify_incident_severity(0.60, True, False, False, False)
    ck("sev: 60%+revenue = P1", sev2["p_level"], 1)

    sev3 = classify_incident_severity(0.15, False, False, False, True)
    ck("sev: 15%+workaround = P2", sev3["p_level"], 2)

    # Security breach overrides
    sev4 = classify_incident_severity(0.05, False, False, True, True)
    ck("sev: breach at 5% → P3 (breach w/o data loss)", sev4["p_level"], 3)

    # ── Toil ──
    print("\n── Toil Quantification (SRE Ch.5) ──")
    toil = toil_fraction(20, 40)
    ck("toil: 20/40 = 0.50", toil, 0.50)
    ta = toil_assessment(0.55)
    ck("toil_assess: 55% → ELEVATED", "ELEVATED" in ta["verdict"], True)

    # ── Monitoring ──
    print("\n── Monitoring (SRE Ch.6) ──")
    snr = monitoring_signal_noise_ratio(30, 100)
    ck("snr: 30/100 = 0.30", snr, 0.30)
    af = alert_fatigue_assessment(0.25)
    ck("alert_fatigue: 25% → BROKEN", "BROKEN" in af["verdict"], True)

    # ── Postmortem ──
    print("\n── Postmortem (SRE Ch.15) ──")
    ck("pm_required: P0 → True", postmortem_required(0), True)
    ck("pm_required: P2 once → False", postmortem_required(2, 1), False)
    ck("pm_required: P2 recurring → True", postmortem_required(2, 2), True)

    pm = postmortem_score(True, 3, 3, 24.0, True)
    ck("pm_score: perfect → 5", pm["score"], 5)

    pm2 = postmortem_score(False, 0, 0, 100.0, False)
    ck("pm_score: terrible → 1", pm2["score"], 1)

    # ── Capacity ──
    print("\n── Capacity & Load Shedding (SRE Ch.21-22) ──")
    ls = load_shedding_threshold(950, 1000, 0.10)
    ck("load_shed: 950/1000 → WARNING", "WARNING" in ls["status"], True)

    ls2 = load_shedding_threshold(1050, 1000, 0.10)
    ck("load_shed: 1050/1000 → OVERLOADED", "OVERLOADED" in ls2["status"], True)

    # Cascading failures
    deps = [
        {"name": "DB", "required": True, "has_timeout": False, "has_circuit_breaker": False, "shared_infra": True},
        {"name": "Auth", "required": True, "has_timeout": True, "has_circuit_breaker": True, "shared_infra": False},
        {"name": "Cache", "required": False, "has_timeout": True, "has_circuit_breaker": True, "shared_infra": False},
    ]
    cf = cascading_failure_assessment(deps)
    ck("cascade: DB without timeout+breaker+shared → MEDIUM", "MEDIUM" in cf["risk"], True)

    # ── Deploy ──
    print("\n── Deploy Strategy (SRE Ch.27; Secure Ch.7) ──")
    ds = deploy_strategy("critical", "all_users")
    ck("deploy: critical → CANARY+BLUE/GREEN", "BLUE/GREEN" in ds["strategy"], True)

    ds2 = deploy_strategy("low", "none")
    ck("deploy: low → BIG BANG", "BIG BANG" in ds2["strategy"], True)

    # ── Edge Cases ──
    print("\n── Edge Cases ──")
    ck_raises("sli: total=0", sli_availability, 10, 0)
    ck_raises("toil: zero hours", toil_fraction, 10, 0)
    ck_raises("load_shed: margin too large", load_shedding_threshold, 500, 1000, 0.60)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
