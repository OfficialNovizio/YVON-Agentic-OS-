#!/usr/bin/env python3
"""
sre_practical_alerting.py — Google SRE Book Ch.10 time-series metric schema
+ alert-rule linting patterns.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-08-10)
===================================================================

Primary source (institutional, free):
  Google SRE Book — Chapter 10: Practical Alerting from Time-Series Data
  https://sre.google/sre-book/practical-alerting/
  Author: Jamie Wilkinson. Edited by Kavita Guliani.
  Copyright © 2017 Google, Inc. Published by O'Reilly Media, Inc.
  Licensed under CC BY-NC-ND 4.0.

  License notes: CC BY-NC-ND permits reproduction with attribution for
  non-commercial purposes and forbids derivative works. This file uses
  only short verbatim excerpts (fair-use quotation): the four required
  time-series labels, the counter/gauge tip, the three Alertmanager
  responsibilities, the flapping-prevention convention, the three alert
  triage tiers, and the three label categories. Longer analytical text
  is NOT reproduced. All excerpts carry inline SOURCE attribution.

Second source (§8.0 minimum-two-book):
  Google SRE Workbook — Chapter 4: Service Level Objectives
  https://sre.google/workbook/implementing-slos/
  Same license. Referenced by Ch.10 as the alert-design companion.
  Additionally: Prometheus documentation at https://prometheus.io/docs/
  (Apache 2.0) — canonical open-source implementation of the Borgmon
  time-series model described in Ch.10.

===================================================================
ROUTE (§8.2)
===================================================================
  Route B: rule-based linter — validates that an alert-rule dict adheres
  to Ch.10 patterns (required labels present, min-duration set, severity
  tier defined). No thresholds are invented; the required-field lists
  and tier names are verbatim from Ch.10.

===================================================================
CONSUMERS
===================================================================
  Primary:
    - Cybersecurity/cortex (detection-engineering alert authoring)
    - Engineering/ops (SRE alert rules)
    - Cybersecurity/bastion (infra monitoring rules)
  Potential:
    - Data-and-Analytics/anomaly (metric-anomaly alert rules)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- REQUIRED_LABELS: verbatim from Ch.10 §"Labels and Vectors"
- COUNTER_VS_GAUGE_TIP: verbatim from Ch.10 tip callout
- ALERTMANAGER_RESPONSIBILITIES: verbatim from Ch.10 §"Alerting"
- FLAP_PREVENTION_CONVENTION: verbatim from Ch.10 §"Alerting"
- ALERT_TRIAGE_TIERS: verbatim from Ch.10 §"Alerting"
- LABEL_CATEGORIES: verbatim from Ch.10 §"Maintaining the Configuration"
- Complementary to Shared OS/logical/sre_alerting_principles.py (Ch.6),
  which covers Golden Signals + Five Questions. This module covers
  Ch.10's technical schema patterns. Consumers may import both.
"""

import argparse
import json
import sys
from typing import Any, Dict, List, Optional


# ==================================================================
# VERBATIM EXCERPTS (fair use — short quotations with attribution)
# ==================================================================

# Verbatim from Ch.10 §"Labels and Vectors":
# "For the time-series in the time-series database to be identifiable,
#  it must at minimum have the following labels:"
REQUIRED_LABELS: Dict[str, str] = {
    "var": "The name of the variable",
    "job": "The name given to the type of server being monitored",
    "service": (
        "A loosely defined collection of jobs that provide a service to "
        "users, either internal or external"
    ),
    "zone": (
        "A Google convention that refers to the location (typically the "
        "datacenter) of the Borgmon that performed the collection of "
        "this variable"
    ),
}

# Verbatim from Ch.10 tip callout:
COUNTER_VS_GAUGE_TIP: str = (
    "A counter is any monotonically non-decreasing variable—which is to "
    "say, counters only increase in value. Gauges, on the other hand, "
    "may take any value they like."
)

# Verbatim from Ch.10 §"Alerting":
# "Alertmanager can be configured to do the following:"
ALERTMANAGER_RESPONSIBILITIES: List[str] = [
    "Inhibit certain alerts when others are active",
    "Deduplicate alerts from multiple Borgmon that have the same labelsets",
    (
        "Fan-in or fan-out alerts based on their labelsets when multiple "
        "alerts with similar labelsets fire"
    ),
]

# Verbatim from Ch.10 §"Alerting":
FLAP_PREVENTION_CONVENTION: str = (
    "Typically, this duration is set to at least two rule evaluation "
    "cycles to ensure no missed collections cause a false alert."
)

# Verbatim from Ch.10 §"Alerting":
# "teams send their page-worthy alerts to their on-call rotation and
#  their important but subcritical alerts to their ticket queues. All
#  other alerts should be retained as informational data for status
#  dashboards."
ALERT_TRIAGE_TIERS: Dict[str, str] = {
    "page": "page-worthy alerts to their on-call rotation",
    "ticket": "important but subcritical alerts to their ticket queues",
    "dashboard": "retained as informational data for status dashboards",
}

# Verbatim from Ch.10 §"Maintaining the Configuration":
# "we have multiple uses for labels on a time-series, though all are
#  interchangeable:"
LABEL_CATEGORIES: List[str] = [
    (
        "Labels that define breakdowns of the data itself (e.g., our "
        "HTTP response code on the http_responses variable)"
    ),
    (
        "Labels that define the source of the data (e.g., the instance "
        "or job name)"
    ),
    (
        "Labels that indicate the locality or aggregation of the data "
        "within the service as a whole (e.g., the zone label describing "
        "a physical location, a shard label describing a logical "
        "grouping of tasks)"
    ),
]

# Verbatim from Ch.10 (computed-variable naming convention):
COMPUTED_VARIABLE_NAMING_CONVENTION: str = (
    "Each computed variable name contains a colon-separated triplet "
    "indicating the aggregation level, the variable name, and the "
    "operation that created that name."
)

SOURCE_ATTRIBUTION: str = (
    "Google SRE Book Ch.10 — Practical Alerting from Time-Series Data "
    "(Wilkinson, 2017) — https://sre.google/sre-book/practical-alerting/ "
    "— CC BY-NC-ND 4.0"
)

# From Ch.10: "Typically, datacenter and global Borgmon are sized to
# hold about 12 hours of data" — verbatim
BORGMON_STANDARD_HORIZON_HOURS: int = 12


# ==================================================================
# Route B: alert-rule linter
# ==================================================================

def lint_labelset(labels: Dict[str, str]) -> Dict[str, Any]:
    """Validate a time-series labelset against Ch.10 §"Labels and Vectors".

    Args:
      labels: dict of label key → value.

    Returns:
      {valid: bool, missing_required: [labels], present_required: [labels],
       cite}
    """
    if not isinstance(labels, dict):
        raise TypeError("labels must be a dict")

    missing = [k for k in REQUIRED_LABELS if k not in labels or not labels[k]]
    present = [k for k in REQUIRED_LABELS if k in labels and labels[k]]
    return {
        "valid": len(missing) == 0,
        "missing_required": missing,
        "present_required": present,
        "required_labels": list(REQUIRED_LABELS.keys()),
        "cite": SOURCE_ATTRIBUTION,
    }


def _is_colon_triplet(name: str) -> bool:
    """Check a computed-variable name follows the colon-separated triplet
    convention: <aggregation>:<variable>:<operation>."""
    parts = name.split(":")
    return len(parts) == 3 and all(len(p) > 0 for p in parts)


def lint_alert_rule(rule: Dict[str, Any]) -> Dict[str, Any]:
    """Lint an alert-rule dict against Ch.10 patterns.

    Expected shape:
      {
        name: str,
        expr: str,
        for_duration_minutes: int|float,
        labels: {severity: "page"|"ticket"|"dashboard", ...},
        annotations: {details: str, ...},
        computed_variable_name: str (optional; if present must be triplet),
      }

    Returns:
      {ok: bool, findings: [{code, severity, message}], cite}
    """
    findings: List[Dict[str, str]] = []

    if not isinstance(rule, dict):
        raise TypeError("rule must be a dict")

    if not rule.get("name"):
        findings.append({
            "code": "MISSING_NAME",
            "severity": "error",
            "message": "alert rule needs a name",
        })

    if not rule.get("expr"):
        findings.append({
            "code": "MISSING_EXPR",
            "severity": "error",
            "message": "alert rule needs an expr (the query being evaluated)",
        })

    # Ch.10: min-duration should be >= two rule evaluation cycles.
    # Convention chosen here: 2 evaluation cycles at 1-minute cadence = 2 min.
    for_duration = rule.get("for_duration_minutes")
    if for_duration is None:
        findings.append({
            "code": "MISSING_FOR_DURATION",
            "severity": "error",
            "message": (
                "alert rule needs a for_duration_minutes ("
                + FLAP_PREVENTION_CONVENTION + ")"
            ),
        })
    else:
        try:
            fd = float(for_duration)
        except (TypeError, ValueError):
            findings.append({
                "code": "INVALID_FOR_DURATION",
                "severity": "error",
                "message": "for_duration_minutes must be numeric",
            })
        else:
            if fd < 2:
                findings.append({
                    "code": "FOR_DURATION_TOO_SHORT",
                    "severity": "warning",
                    "message": (
                        f"for_duration_minutes={fd} is under the Ch.10 "
                        "convention (>=2 rule evaluation cycles). "
                        + FLAP_PREVENTION_CONVENTION
                    ),
                })

    labels = rule.get("labels", {})
    if not isinstance(labels, dict):
        findings.append({
            "code": "LABELS_NOT_DICT",
            "severity": "error",
            "message": "labels must be a dict",
        })
    else:
        sev = labels.get("severity")
        if not sev:
            findings.append({
                "code": "MISSING_SEVERITY",
                "severity": "error",
                "message": "labels.severity is required (choose from: "
                           + ", ".join(ALERT_TRIAGE_TIERS.keys()) + ")",
            })
        elif sev not in ALERT_TRIAGE_TIERS:
            findings.append({
                "code": "INVALID_SEVERITY",
                "severity": "warning",
                "message": (
                    f"labels.severity={sev!r} is outside the Ch.10 tiers. "
                    "Expected one of: " + ", ".join(ALERT_TRIAGE_TIERS.keys())
                ),
            })

    annotations = rule.get("annotations", {})
    if not isinstance(annotations, dict) or not annotations.get("details"):
        findings.append({
            "code": "MISSING_ANNOTATIONS_DETAILS",
            "severity": "warning",
            "message": (
                "annotations.details is missing; Ch.10 alert-rule example "
                "includes a details template for contextual information"
            ),
        })

    cvn = rule.get("computed_variable_name")
    if cvn is not None and not _is_colon_triplet(cvn):
        findings.append({
            "code": "COMPUTED_VAR_NAMING",
            "severity": "warning",
            "message": (
                f"computed_variable_name={cvn!r} does not follow the Ch.10 "
                "convention. " + COMPUTED_VARIABLE_NAMING_CONVENTION
            ),
        })

    ok = not any(f["severity"] == "error" for f in findings)
    return {
        "ok": ok,
        "error_count": sum(1 for f in findings if f["severity"] == "error"),
        "warning_count": sum(1 for f in findings if f["severity"] == "warning"),
        "findings": findings,
        "cite": SOURCE_ATTRIBUTION,
    }


def classify_metric(exported_variable: Dict[str, Any]) -> Dict[str, Any]:
    """Classify an exported variable as counter vs gauge per Ch.10 tip.

    Args:
      exported_variable: {name, samples: [{timestamp, value}, ...]}
        (samples ordered oldest→newest)

    Returns:
      {kind: "counter"|"gauge"|"undetermined", reason, cite}
    """
    samples = exported_variable.get("samples", [])
    if len(samples) < 2:
        return {
            "kind": "undetermined",
            "reason": "need at least 2 samples to classify",
            "cite": SOURCE_ATTRIBUTION,
        }

    values = [s.get("value") for s in samples if s.get("value") is not None]
    if len(values) < 2:
        return {
            "kind": "undetermined",
            "reason": "insufficient non-null values",
            "cite": SOURCE_ATTRIBUTION,
        }

    is_monotonic_non_decreasing = all(
        values[i + 1] >= values[i] for i in range(len(values) - 1)
    )
    if is_monotonic_non_decreasing:
        return {
            "kind": "counter",
            "reason": (
                "values are monotonically non-decreasing over "
                f"{len(values)} samples (matches Ch.10 counter definition)"
            ),
            "cite": SOURCE_ATTRIBUTION,
        }
    return {
        "kind": "gauge",
        "reason": "values decrease at least once — matches Ch.10 gauge behaviour",
        "cite": SOURCE_ATTRIBUTION,
    }


# ==================================================================
# Self-tests (playbook §5.2)
# ==================================================================

def _run_self_tests() -> None:
    # 1. Verbatim registries have expected sizes
    assert len(REQUIRED_LABELS) == 4, list(REQUIRED_LABELS)
    assert set(REQUIRED_LABELS.keys()) == {"var", "job", "service", "zone"}
    assert len(ALERTMANAGER_RESPONSIBILITIES) == 3
    assert len(ALERT_TRIAGE_TIERS) == 3
    assert set(ALERT_TRIAGE_TIERS.keys()) == {"page", "ticket", "dashboard"}
    assert len(LABEL_CATEGORIES) == 3
    print(f"[PASS] required_labels=4 alertmanager_resp=3 triage_tiers=3 label_categories=3")

    # 2. Verbatim spot-checks
    assert "monotonically non-decreasing" in COUNTER_VS_GAUGE_TIP
    assert "two rule evaluation cycles" in FLAP_PREVENTION_CONVENTION
    assert BORGMON_STANDARD_HORIZON_HOURS == 12
    print("[PASS] verbatim spot-checks match Ch.10 wording")

    # 3. Labelset with all required labels
    r = lint_labelset({
        "var": "http_requests",
        "job": "webserver",
        "service": "web",
        "zone": "us-west",
        "instance": "host0:80",  # extra allowed
    })
    assert r["valid"] is True, r
    assert r["missing_required"] == []
    print("[PASS] complete labelset → valid")

    # 4. Labelset missing zone
    r = lint_labelset({"var": "x", "job": "y", "service": "z"})
    assert r["valid"] is False, r
    assert r["missing_required"] == ["zone"]
    print("[PASS] missing zone → invalid, correct missing field")

    # 5. Empty labelset
    r = lint_labelset({})
    assert r["valid"] is False
    assert set(r["missing_required"]) == set(REQUIRED_LABELS.keys())
    print("[PASS] empty labelset → all 4 required labels missing")

    # 6. Complete alert rule → ok, no findings
    good_rule = {
        "name": "ErrorRatioTooHigh",
        "expr": 'errors:rate10m > 0.01 and errors:rate10m > 1',
        "for_duration_minutes": 2,
        "labels": {"severity": "page"},
        "annotations": {"details": "webserver error ratio at {{value}}"},
        "computed_variable_name": "dc:http_errors:ratio_rate10m",
    }
    r = lint_alert_rule(good_rule)
    assert r["ok"] is True, r
    assert r["error_count"] == 0
    assert r["warning_count"] == 0, r
    print(f"[PASS] complete alert rule → ok (0 errors, 0 warnings)")

    # 7. Alert rule missing severity
    bad = dict(good_rule)
    bad["labels"] = {}
    r = lint_alert_rule(bad)
    assert r["ok"] is False
    codes = {f["code"] for f in r["findings"]}
    assert "MISSING_SEVERITY" in codes, codes
    print("[PASS] missing severity → MISSING_SEVERITY error")

    # 8. Alert rule with invalid severity
    bad2 = dict(good_rule)
    bad2["labels"] = {"severity": "critical"}  # not in {page, ticket, dashboard}
    r = lint_alert_rule(bad2)
    codes = {f["code"] for f in r["findings"]}
    assert "INVALID_SEVERITY" in codes
    print("[PASS] severity=critical → INVALID_SEVERITY warning")

    # 9. Alert rule with too-short for_duration
    bad3 = dict(good_rule)
    bad3["for_duration_minutes"] = 0.5
    r = lint_alert_rule(bad3)
    codes = {f["code"] for f in r["findings"]}
    assert "FOR_DURATION_TOO_SHORT" in codes
    print("[PASS] for_duration=0.5m → FOR_DURATION_TOO_SHORT warning")

    # 10. Bad computed variable name (not triplet)
    bad4 = dict(good_rule)
    bad4["computed_variable_name"] = "not-a-triplet"
    r = lint_alert_rule(bad4)
    codes = {f["code"] for f in r["findings"]}
    assert "COMPUTED_VAR_NAMING" in codes
    print("[PASS] non-triplet computed var name → COMPUTED_VAR_NAMING warning")

    # 11. classify_metric — counter (monotonic non-decreasing)
    r = classify_metric({
        "name": "http_requests_total",
        "samples": [
            {"timestamp": 1, "value": 10},
            {"timestamp": 2, "value": 20},
            {"timestamp": 3, "value": 30},
        ],
    })
    assert r["kind"] == "counter", r
    print("[PASS] monotonic non-decreasing → counter")

    # 12. classify_metric — gauge (values fluctuate)
    r = classify_metric({
        "name": "memory_in_use_bytes",
        "samples": [
            {"timestamp": 1, "value": 100},
            {"timestamp": 2, "value": 150},
            {"timestamp": 3, "value": 120},
        ],
    })
    assert r["kind"] == "gauge", r
    print("[PASS] fluctuating values → gauge")

    # 13. classify_metric — undetermined (single sample)
    r = classify_metric({"name": "x", "samples": [{"timestamp": 1, "value": 5}]})
    assert r["kind"] == "undetermined"
    print("[PASS] single sample → undetermined")

    # 14. Citation present in outputs
    r = lint_labelset({})
    assert "sre.google" in r["cite"]
    r = lint_alert_rule({})
    assert "sre.google" in r["cite"]
    print("[PASS] source attribution present in all outputs")


def _main() -> int:
    p = argparse.ArgumentParser(description="Google SRE Book Ch.10 alerting tooling")
    p.add_argument("--labels", action="store_true", help="show required time-series labels")
    p.add_argument("--triage", action="store_true", help="show alert triage tiers")
    p.add_argument("--alertmanager", action="store_true", help="show Alertmanager responsibilities")
    p.add_argument("--lint-labelset", help="lint labelset (JSON file)")
    p.add_argument("--lint-rule", help="lint alert-rule (JSON file)")
    p.add_argument("--classify", help="classify metric (JSON file)")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or not any([args.labels, args.triage, args.alertmanager,
                             args.lint_labelset, args.lint_rule, args.classify]):
        _run_self_tests()
        return 0

    if args.labels:
        print(f"Required time-series labels ({SOURCE_ATTRIBUTION}):")
        for k, v in REQUIRED_LABELS.items():
            print(f"  - {k}: {v}")
        return 0

    if args.triage:
        print(f"Alert triage tiers ({SOURCE_ATTRIBUTION}):")
        for k, v in ALERT_TRIAGE_TIERS.items():
            print(f"  - {k}: {v}")
        return 0

    if args.alertmanager:
        print(f"Alertmanager responsibilities ({SOURCE_ATTRIBUTION}):")
        for r in ALERTMANAGER_RESPONSIBILITIES:
            print(f"  - {r}")
        return 0

    if args.lint_labelset:
        with open(args.lint_labelset) as f:
            data = json.load(f)
        print(json.dumps(lint_labelset(data), indent=2))
        return 0

    if args.lint_rule:
        with open(args.lint_rule) as f:
            data = json.load(f)
        print(json.dumps(lint_alert_rule(data), indent=2))
        return 0

    if args.classify:
        with open(args.classify) as f:
            data = json.load(f)
        print(json.dumps(classify_metric(data), indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(_main())
