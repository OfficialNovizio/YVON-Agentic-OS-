---
name: scout-logical-book-requirements
type: logical
status: built — fully covered by Shared OS inheritance (2026-07-15)
assigned_agent: scout (AI & Agents / Skills Scout)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Scout is fully covered by inherited scripts — its needs (MCDA screening, supply-chain risk, trial optimization) are decision-analysis and scoring math. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Scout Needs It |
|--------|------------|----------|---------------------|
| `decision_analysis.py` | Clemen & Reilly (2012) | [archive.org](https://archive.org/details/makingharddecisi0000clem_u9f9) | MAUT (multi-criteria scoring for security/cost/overlap screening), swing weighting, sensitivity |
| `rice_prioritization.py` | Intercom RICE + Reinersten WSJF + SAFe | Canonical Tier B | Scoring weights, tie-breaking, effort calibration |
| `security_assessment.py` | CVSS v4.0 + OWASP WSTG | [first.org](https://www.first.org/cvss/v4-0/) / [owasp.org](https://owasp.org/) — FREE | Supply-chain risk scoring for security screen |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Weighted screening scores (security/cost/overlap) | ✅ Cleared | `decision_analysis.py` (MAUT — additive + multiplicative scoring with weights) |
| Supply-chain risk scoring for security screen | ✅ Cleared | `security_assessment.py` (CVSS + OWASP) + `decision_analysis.py` (risk score × asset criticality) |
| Optimal trial durations | ✅ Cleared | `experiment_methods.py` (experiment_duration_days) |

## Skills → Script Mapping

- **skill-scout** → imports `decision_analysis.py` (MAUT for weighted screening)
- **trial-evaluation** → imports `experiment_methods.py` (duration estimation) + `rice_prioritization.py` (ranking)
