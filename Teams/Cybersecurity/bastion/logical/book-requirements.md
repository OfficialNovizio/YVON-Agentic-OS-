---
name: bastion-logical-book-requirements
type: logical
status: built — inherits 3 dedicated scripts + cross-agent scripts from Shared OS (2026-07-14)
assigned_agent: bastion (Cybersecurity / Infrastructure Security)
date_added: 2026-07-09
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Bastion inherits 3 Cybersecurity scripts and cross-agent tools. This file is the only file in this folder.

## Bastion's Scripts (Shared OS/logical/ — via Cybersecurity department)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `identity_zero_trust.py` | NIST SP 800-207 (Zero Trust) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-207/final) — FREE | NIST SP 800-63-3 (Digital Identity) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-63/3/final) — FREE | B |
| 2 | `incident_response.py` | NIST SP 800-61r2 (Incident Handling) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final) — FREE | NIST SP 800-40r4 (Patch Management) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-40/rev-4/final) — FREE | B |
| 3 | `risk_management.py` | NIST SP 800-30r1 (Risk Assessment) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-30/rev-1/final) — FREE | NIST SP 800-37r2 (RMF) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-37/rev-2/final) — FREE | B/C |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Bastion Needs It |
|--------|------------|----------|---------------------|
| `security_assessment.py` | CVSS v4.0 + OWASP WSTG | [first.org](https://www.first.org/cvss/v4-0/) | CVSS scoring for patch prioritization |
| `sre_methods.py` | Google SRE + Google Secure | [sre.google](https://sre.google/) | Deploy strategy and capacity planning |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Patch SLAs (7/30/90 day defaults are convention) | ✅ Cleared | `incident_response.py` (patch_sla per SP 800-40) |
| Network segmentation (best-practice-based) | ✅ Cleared | `identity_zero_trust.py` (zero_trust_compliance) |
| Cloud posture prioritization (exposure × data-sensitivity) | ✅ Cleared | `risk_management.py` (asset_criticality_weight + prioritized_risk_score) |

## Skills → Script Mapping

- **cloud-security-posture** → imports `risk_management.py` (asset_criticality_weight) + `identity_zero_trust.py` (ZT compliance)
- **patch-management** → imports `incident_response.py` (patch_sla) + `security_assessment.py` (CVSS scoring)
