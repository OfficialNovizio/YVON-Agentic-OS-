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
| `cvss_v31.py` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/cvss_v31.py` (Route A — CVSS v3.1 Base + Temporal, integer Roundup) | [FIRST.org CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document) | User Guide | Reproducible severity scoring for incident tickets and post-mortems. |
| `owasp_top10_2025.py` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/owasp_top10_2025.py` (Route B — 10 categories verbatim, CWE mapping, keyword classifier) | [OWASP Top 10:2025](https://owasp.org/Top10/2025/en/) — CC BY 3.0 | OWASP ASVS v5.0 | Tag incidents by OWASP category for pattern analysis and executive-level trending. |
| `sre_alerting_principles.py` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/sre_alerting_principles.py` (Route C — Golden Signals + Five Questions verbatim, score_alert_rule) | [Google SRE Book Ch.6](https://sre.google/sre-book/monitoring-distributed-systems/) | [Google SRE Workbook Ch.5](https://sre.google/workbook/alerting-on-slos/) | Detection-engineering alert-quality scoring — noise-vs-signal grading of new detections. |
| `sre_postmortem_culture.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/sre_postmortem_culture.py` (Route B — 5 triggers + 5 review criteria + 4 best practices verbatim, score_postmortem + should_write_postmortem) | [Google SRE Book Ch.15](https://sre.google/sre-book/postmortem-culture/) — CC BY-NC-ND 4.0 | [Google SRE Workbook Ch.10](https://sre.google/workbook/postmortem-culture/) | Post-incident review gate — grades draft against Google's 5 criteria; classifies whether an incident meets postmortem-trigger threshold. |
| `sre_practical_alerting.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/sre_practical_alerting.py` (Route B — 4 required labels + counter/gauge tip + 3 Alertmanager duties + 3 triage tiers verbatim; lint_labelset + lint_alert_rule + classify_metric) | [Google SRE Book Ch.10](https://sre.google/sre-book/practical-alerting/) — CC BY-NC-ND 4.0 | Prometheus docs (Apache 2.0) + [SRE Workbook Ch.4](https://sre.google/workbook/implementing-slos/) | Detection-rule authoring gate — enforces Ch.10 label schema, min-duration, severity tier on every new detection before it goes to Alertmanager. |
| `sre_managing_incidents.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/sre_managing_incidents.py` (Route B — 4 ICS roles + 3 declaration criteria + 7 best practices verbatim + canonical handoff script; validate_role_assignments + should_declare_incident + validate_handoff) | [Google SRE Book Ch.14](https://sre.google/sre-book/managing-incidents/) — CC BY-NC-ND 4.0 | [FEMA NIMS](https://www.fema.gov/national-incident-management-system) — public domain | Incident-command discipline — enforces IC assignment, declaration threshold, and handoff acknowledgment before an incident is considered actively managed. |
| `sre_being_on_call.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.11](https://sre.google/sre-book/being-on-call/) — CC BY-NC-ND + [Workbook Ch.8](https://sre.google/workbook/on-call/) | SecOps on-call rotation sizing + workload/noise validators (6h/incident, 2/12h-shift cap, 1:1 alert:incident target). |
| `sre_emergency_response.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.13](https://sre.google/sre-book/emergency-response/) — CC BY-NC-ND | Post-incident trigger taxonomy — classifies IR root cause as Test-Induced / Change-Induced / Process-Induced / Other with Ch.13's canonical lesson attached, feeds root-cause tagging in postmortems. |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Severity classification matrix (SEV1-SEV4 rubric-based) | ✅ Cleared | `incident_response.py` (incident_severity per SP 800-61 §3.2) |
| Patch/response SLAs (convention-based targets) | ✅ Cleared | `incident_response.py` (patch_sla per SP 800-40) |
| Hunting cadence and hypothesis prioritization | ✅ Cleared | `incident_response.py` (hunting_cadence per SP 800-61 §3.2.2) |

## Skills → Script Mapping

- **incident-response** → imports `incident_response.py` (incident_severity, post_incident_score)
- **detection-engineering** → imports `signal_detection.py` (classify_metric_change, Western Electric) + `incident_response.py` (hunting_cadence)
