---
name: veil-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: veil (Cybersecurity / Privacy & Data Protection)
date_added: 2026-07-09
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Veil owns 1 dedicated script for privacy compliance and inherits cross-agent scripts. This file is the only file in this folder.

## Veil-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `privacy_compliance.py` | NIST, *Privacy Framework v1.0* (2020) | [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.01162020.pdf) — FREE | GDPR, Regulation (EU) 2016/679 | [eur-lex.europa.eu](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — FREE | B |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Veil Needs It |
|--------|------------|----------|---------------------|
| `risk_management.py` | NIST SP 800-30 + SP 800-37 | [csrc.nist.gov](https://csrc.nist.gov/) | DLP alert severity feeds risk register; data classification |
| `incident_response.py` | NIST SP 800-61r2 + SP 800-40r4 | [csrc.nist.gov](https://csrc.nist.gov/) | Breach notification integrates with IR workflow |
| `identity_zero_trust.py` | NIST SP 800-207 + SP 800-63-3 | [csrc.nist.gov](https://csrc.nist.gov/) | Data access control and privacy-sensitive authentication |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Classification decision tree (4-tier model — qualitative) | ✅ Cleared | `privacy_compliance.py` (classify_data per NIST PF + GDPR Art. 5) |
| DLP alert severity thresholds (rubric-based) | ✅ Cleared | `privacy_compliance.py` (dlp_alert_severity per NIST PF Protect-P) |
| Notification clock estimates (GDPR 72h vs PIPEDA "as feasible") | ✅ Cleared | `privacy_compliance.py` (breach_notification_clock per GDPR Art. 33-34) |

## Skills → Script Mapping

- **data-classification** → imports `privacy_compliance.py` (classify_data) + `risk_management.py` (asset_criticality_weight)
- **breach-notification** → imports `privacy_compliance.py` (breach_notification_clock, dpia_required) + `incident_response.py` (incident_severity)
- **dlp-monitoring** → imports `privacy_compliance.py` (dlp_alert_severity)
