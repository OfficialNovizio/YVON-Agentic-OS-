---
name: warden-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: warden (Cybersecurity / Risk & Compliance)
date_added: 2026-07-09
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Warden owns 1 dedicated script for risk management and inherits cross-agent scripts. This file is the only file in this folder.

## Warden-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `risk_management.py` | NIST, *Guide for Conducting Risk Assessments* (SP 800-30 Rev 1, 2012) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-30/rev-1/final) — FREE | NIST, *Risk Management Framework* (SP 800-37 Rev 2, 2018) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-37/rev-2/final) — FREE | B/C |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Warden Needs It |
|--------|------------|----------|---------------------|
| `decision_analysis.py` | Clemen & Reilly, *Making Hard Decisions* | [archive.org](https://archive.org/details/makingharddecisi0000clem_u9f9) | Monte Carlo simulation for quantitative risk analysis, EVPI for control selection |
| `security_assessment.py` | CVSS v4.0 + OWASP WSTG | [first.org](https://www.first.org/cvss/v4-0/) / [owasp.org](https://owasp.org/www-project-web-security-testing-guide/) | Vulnerability severity feeds into risk scoring |
| `planning_fallacy.py` | Kahneman, *Thinking, Fast and Slow* | [archive.org](https://dn790002.ca.archive.org/0/items/DanielKahnemanThinkingFastAndSlow/) | Calibration for likelihood estimates |
| `incident_response.py` | NIST SP 800-61r2 + SP 800-40r4 | [csrc.nist.gov](https://csrc.nist.gov/) | Post-incident activity scoring feeds risk register |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| likelihood/impact scales + 5×5 default threshold | ✅ Cleared | `risk_management.py` (SP 800-30 App I) |
| crown-jewel weighting in prioritization | ✅ Cleared | `risk_management.py` (asset_criticality_weight) |
| vendor risk scoring heuristics | ✅ Cleared | `risk_management.py` (prioritized_risk_score) |

## Skills → Script Mapping

- **risk-register** → imports `risk_management.py` (risk_score, risk_level, risk_treatment)
- **risk-assessment-matrix** → imports `risk_management.py` (asset_criticality_weight, residual_risk) + `decision_analysis.py` (Monte Carlo)
