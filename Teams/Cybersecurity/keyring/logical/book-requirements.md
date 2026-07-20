---
name: keyring-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: keyring (Cybersecurity / Identity & Access)
date_added: 2026-07-09
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Keyring owns 1 dedicated script for identity and zero trust. This file is the only file in this folder.

## Keyring-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `identity_zero_trust.py` | NIST, *Zero Trust Architecture* (SP 800-207, 2020) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-207/final) — FREE | NIST, *Digital Identity Guidelines* (SP 800-63-3, 2017) | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-63/3/final) — FREE | B |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Keyring Needs It |
|--------|------------|----------|---------------------|
| `risk_management.py` | NIST SP 800-30 + SP 800-37 | [csrc.nist.gov](https://csrc.nist.gov/) | Access risk scoring for privilege decisions |
| `security_assessment.py` | CVSS v4.0 + OWASP WSTG | [first.org](https://www.first.org/cvss/v4-0/) | IAM vulnerability severity classification |
| `incident_response.py` | NIST SP 800-61r2 + SP 800-40r4 | [csrc.nist.gov](https://csrc.nist.gov/) | Credential compromise incident handling |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| access_review_cadence + privileged_review_cadence | ✅ Cleared | `identity_zero_trust.py` (access_review_cadence) |
| secret_rotation_cadence and deprovision_sla targets | ✅ Cleared | `identity_zero_trust.py` (privilege_model_decision) |
| "just-in-time vs standing" thresholds | ✅ Cleared | `identity_zero_trust.py` (privilege_model_decision) |

## Skills → Script Mapping

- **access-review** → imports `identity_zero_trust.py` (access_review_cadence)
- **access-review** → imports `identity_zero_trust.py` (privilege_model_decision for JIT vs standing)
