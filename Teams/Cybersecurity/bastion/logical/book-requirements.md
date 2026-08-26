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
| `cvss_v31.py` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/cvss_v31.py` (Route A — full CVSS v3.1 Base + Temporal formulas, weights from Table 16, integer-arithmetic Roundup, qualitative severity Table 14) | CVSS v3.1 Specification Document — [FIRST.org](https://www.first.org/cvss/v3.1/specification-document) | CVSS v3.1 User Guide — [FIRST.org](https://www.first.org/cvss/v3.1/user-guide) | Covers most CVEs disclosed pre-2024 (v3.1 remains the widely-used baseline; v4.0 is newer). Log4Shell-shape vector correctly returns 10.0 Critical. |
| `owasp_top10_2025.py` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/owasp_top10_2025.py` (Route B — all 10 categories verbatim with canonical URLs, CWE-mapping table, keyword classifier returning top-N ranked matches with confidence) | OWASP Top 10:2025 — [owasp.org/Top10/2025/en](https://owasp.org/Top10/2025/en/) — CC BY 3.0 | OWASP ASVS v5.0 — [owasp.org](https://owasp.org/www-project-application-security-verification-standard/) | Classifies infra-vuln findings against the OWASP taxonomy for prioritization + reporting. Complements CVSS (severity) with category (root-cause class). |
| `sre_methods.py` | Google SRE + Google Secure | [sre.google](https://sre.google/) | Deploy strategy and capacity planning |
| `sre_practical_alerting.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/sre_practical_alerting.py` (Route B — required labels + severity tiers + counter/gauge classification) | [Google SRE Book Ch.10](https://sre.google/sre-book/practical-alerting/) — CC BY-NC-ND 4.0 | Prometheus docs (Apache 2.0) | Infra-alert-rule linter for cloud-security-posture monitoring — enforces the same label schema used by cortex detection engineering so IR pivots are frictionless. |
| `nist_800_53_r5.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/nist_800_53_r5.py` (Route B — 20 control-family registry + parse_control_id) | [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) — public domain | [NIST SP 800-53B](https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final) | Bastion cites CM, SC, SI, SR family controls when writing infra-vuln remediation tickets — the parser ensures every cited ID (e.g., SC-7, SI-4) is well-formed. |
| `owasp_asvs_v5.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/owasp_asvs_v5.py` (Route B — ASVS v5.0.0 requirement-ID parser, chapter 1 verbatim, versioned/bare ID formats) | [OWASP ASVS v5.0](https://owasp.org/www-project-application-security-verification-standard/) — CC BY-SA 4.0 | [OWASP Top 10:2025](https://owasp.org/Top10/2025/en/) — CC BY 3.0 | Machine-parseable ASVS references in infra-vuln tickets (e.g., "fails v5.0.0-1.2.5 — OS command injection"). Points consumers to CSV for full 280+ requirements. |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Patch SLAs (7/30/90 day defaults are convention) | ✅ Cleared | `incident_response.py` (patch_sla per SP 800-40) |
| Network segmentation (best-practice-based) | ✅ Cleared | `identity_zero_trust.py` (zero_trust_compliance) |
| Cloud posture prioritization (exposure × data-sensitivity) | ✅ Cleared | `risk_management.py` (asset_criticality_weight + prioritized_risk_score) |

## Skills → Script Mapping

- **cloud-security-posture** → imports `risk_management.py` (asset_criticality_weight) + `identity_zero_trust.py` (ZT compliance)
- **patch-management** → imports `incident_response.py` (patch_sla) + `security_assessment.py` (CVSS scoring)
