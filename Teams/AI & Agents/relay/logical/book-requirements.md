---
name: relay-logical-book-requirements
type: logical
status: built — fully covered by Shared OS inheritance (2026-07-15)
assigned_agent: relay (AI & Agents / Gateway)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Relay is fully covered by inherited scripts — no dedicated scripts needed. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Relay Needs It |
|--------|------------|----------|---------------------|
| `sre_methods.py` | Google SRE + Google Secure | [sre.google](https://sre.google/) — FREE | Retry/backoff math, circuit breaker thresholds (error budgets + cascading failure assessment), load shedding |
| `signal_detection.py` | OpenStax Statistics 2e (2023) | [openstax.org](https://openstax.org/) — FREE | Drift detection for scope ladder adjustments, grant-audit sampling thresholds |
| `risk_management.py` | NIST SP 800-30 + SP 800-37 | [csrc.nist.gov](https://csrc.nist.gov/) — FREE | Risk scoring for grant-audit sampling priority |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Retry/backoff parameters from convention | ✅ Cleared | `sre_methods.py` (error budgets, cascading failure assessment) |
| Circuit-breaker thresholds from failure-rate statistics | ✅ Cleared | `signal_detection.py` (classify_metric_change, Western Electric rules) |
| Grant-audit sampling from risk scoring | ✅ Cleared | `risk_management.py` (risk_score, asset_criticality_weight) |

## Skills → Script Mapping

- **scope-ladders** → imports `signal_detection.py` (drift detection)
- **retry-budget** → imports `sre_methods.py` (error budget burn rate)
- **grant-audit** → imports `risk_management.py` (risk-based sampling priority)
