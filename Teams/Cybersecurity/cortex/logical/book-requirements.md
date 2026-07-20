---
name: cortex-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: cortex (Cybersecurity / Incident Response & Detection)
date_added: 2026-07-09
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Cortex owns 1 dedicated script for incident response and inherits cross-agent scripts. This file is the only file in this folder.

## Cortex-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `incident_response.py` | NIST, *Computer Security Incident Handling Guide* (SP 800-61 Rev 2, 2012) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final) — FREE | NIST, *Guide to Enterprise Patch Management* (SP 800-40 Rev 4, 2022) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-40/rev-4/final) — FREE | B |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Cortex Needs It |
|--------|------------|----------|---------------------|
| `signal_detection.py` | OpenStax Statistics + Ries | [openstax.org](https://openstax.org/details/books/introductory-business-statistics-2e) — FREE | Statistical signal detection for false-positive classification |
| `security_assessment.py` | CVSS v4.0 + OWASP WSTG | [first.org](https://www.first.org/cvss/v4-0/) | CVSS scoring feeds incident severity |
| `risk_management.py` | NIST SP 800-30 + SP 800-37 | [csrc.nist.gov](https://csrc.nist.gov/) | Risk-based incident prioritization |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Severity classification matrix (SEV1-SEV4 rubric-based) | ✅ Cleared | `incident_response.py` (incident_severity per SP 800-61 §3.2) |
| Patch/response SLAs (convention-based targets) | ✅ Cleared | `incident_response.py` (patch_sla per SP 800-40) |
| Hunting cadence and hypothesis prioritization | ✅ Cleared | `incident_response.py` (hunting_cadence per SP 800-61 §3.2.2) |

## Skills → Script Mapping

- **incident-response** → imports `incident_response.py` (incident_severity, post_incident_score)
- **detection-engineering** → imports `signal_detection.py` (classify_metric_change, Western Electric) + `incident_response.py` (hunting_cadence)
