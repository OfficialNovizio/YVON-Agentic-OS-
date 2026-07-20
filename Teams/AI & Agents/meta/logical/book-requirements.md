---
name: meta-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-15)
assigned_agent: meta (AI & Agents / Fleet Orchestrator — department leader)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Meta owns 1 dedicated script for fleet measurement and inherits cross-agent scripts. This file is the only file in this folder.

## Meta-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `fleet_measurement.py` | DeMarco, *Controlling Software Projects* (Yourdon Press, 1982) | [archive.org](https://archive.org/details/controllingsoftw0000dema) — FREE | CETIC/Fenton & Pfleeger, *Software Metrics Overview* (GQM framework) | [cetic.be](https://www.cetic.be/IMG/pdf/Software_Metrics_Overview.pdf) — FREE | B/C |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Meta Needs It |
|--------|------------|----------|---------------------|
| `signal_detection.py` | OpenStax, *Introductory Business Statistics 2e* (2023) | [openstax.org](https://openstax.org/details/books/introductory-business-statistics-2e) — FREE | Statistical significance for fleet health trends |
| `decision_analysis.py` | Clemen & Reilly (2012) | [archive.org](https://archive.org/details/makingharddecisi0000clem_u9f9) | MAUT for promotion decisions |
| `planning_fallacy.py` | Kahneman (2011) | [archive.org](https://archive.org/) | Calibration for staffing/readiness projections |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Fleet over/under-staffed quantitative criteria | ✅ Cleared | `fleet_measurement.py` (fleet_health_score — cost/schedule/quality/readiness composite) |
| Standards-effectiveness measurement | ✅ Cleared | `fleet_measurement.py` (standards_effectiveness — pre/post violation rates with effect size) |
| Promotion thresholds beyond gauge's operational metrics | ✅ Cleared | `fleet_measurement.py` (promotion_readiness — 5-gate model per DeMarco Ch.6-8) |

## Skills → Script Mapping

- **fleet-orchestration** → imports `fleet_measurement.py` (fleet_health_score, standards_effectiveness)
- **promotion-gate** → imports `fleet_measurement.py` (promotion_readiness)
- **standards-governance** → imports `fleet_measurement.py` (standards_effectiveness)
