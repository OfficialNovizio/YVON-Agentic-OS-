---
name: sentinel-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: sentinel (Governance / Compliance Monitor)
date_added: 2026-07-07
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5) that sentinel imports. Sentinel owns 1 dedicated script for audit sampling and inherits cross-agent scripts. This file is the only file in this folder.

## Sentinel-Specific Scripts (Shared OS/logical/)

| # | Script | Source | Route | Domain |
|---|--------|--------|-------|--------|
| 1 | `audit_sampling.py` | AICPA, *AU-C Section 530: Audit Sampling* (SAS No. 122, amended by SAS No. 142, effective 2022). Publicly available at aicpa.org. | A | Attributes sample size, discovery sampling, coverage quantification, stratification, sweep coverage reporting |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Why Sentinel Needs It |
|--------|-------------------|
| `signal_detection.py` | Control charts (Western Electric rules), two-sample tests, chi-square — anomaly detection for drift-curve readings (sentinel's #2 gap) |
| `governance_gate.py` | OECD disclosure standards and sustainability oversight — shared with board |
| `planning_fallacy.py` | Calibration for monitoring frequency decisions |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Sampling: "breadth and regularity" heuristic → not quantifiable | ✅ Cleared | `audit_sampling.py` (attributes_sample_size, discovery_sample_size, discovery_coverage_statement) |
| Coverage claims: "we looked at a lot" → no confidence level | ✅ Cleared | `audit_sampling.py` (sweep_coverage_report — per-domain confidence-quantified upper bounds) |
| Anomaly detection: trend vs noise not statistically grounded | ✅ Cleared | `signal_detection.py` (Western Electric rules, detect_metric_drift, classify_metric_change) |
| Constitution watch: sampling scope not methodologically grounded | ✅ Cleared | `audit_sampling.py` (stratified_sample_size with risk weighting) |

## Skills → Script Mapping

- **constitution-watch** → imports `audit_sampling.py` (sweep_coverage_report, stratified_sample_size) + `signal_detection.py` (detect_metric_drift)
- **gate-bypass-detection** → imports `audit_sampling.py` (discovery_sample_size, discovery_coverage_statement) + `signal_detection.py` (classify_metric_change)
- **audit-trail-design** → imports `audit_sampling.py` (attributes_sample_size for control testing)
