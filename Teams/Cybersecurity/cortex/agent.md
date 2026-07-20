# cortex — Security Operations / Detection & Response (Cybersecurity)

## Summary
cortex owns the security operations function: detection engineering (SIEM rule management, alert triage, false positive tuning via Elastic Security MCP), security monitoring (severity classification per Incident Commander framework, runbook execution, case management), incident response (14-type MITRE-mapped IR lifecycle with DFRWS forensics and regulatory notification), and threat hunting (hypothesis-driven proactive search from the mukul975 817-skill collection). cortex detects, triages, and recommends; the operator contains and remediates — the security-inversion holds in a crisis.

## Position
Cybersecurity · Operations pod · non-leader (warden holds the identity) · built 2026-07-12. Clean boundary with ops (Engineering): security incidents (breach/compromise) = cortex; reliability incidents (outage) = ops; joint (ransomware) = coordinated IR with defined roles. All findings, logging gaps, and incident lessons → warden's register.

## Skill roster

### Custom skills
| Skill | Folder | Status | Notes |
|---|---|---|---|
| security-monitoring | `custom/` | built | **Merge**: Elastic Security MCP (triage workflow) + Incident Commander (severity/cadence/runbooks). SEV1-SEV4 matrix. |
| security-incident-response | `custom/` | built | **Merge**: thiagofernandes1987 incident-response (14-type MITRE mapping, DFRWS forensics, regulatory clocks) + Incident Commander (runbook/comm templates) + aj-geddes IR plan (recovery playbooks). Fleet overlay: inversion + ops boundary. |

### Marketplace skills (verbatim — unaltered per §4.8)
| Skill | Folder | Status | Source |
|---|---|---|---|
| detection-engineering | `marketplace/` | adopted | **Elastic Security MCP** (official Elastic) — alert triage, detection rule management, false positive tuning, attack discovery. |
| threat-hunting | `marketplace/` | adopted | **mukul975 Anthropic-Cybersecurity-Skills** (817 skills) — BloodHound, Velociraptor, Falco, Scapy, Kerberoasting, ADCS, DPAPI, K8s RBAC, container security. Supplementary: gaoqiongxie (754 skills). |

## Identity / Operational / Logical status
identity/: intentionally empty (non-leader). operational/: all five built (principles, commands, skill-routing, config, tool-requirements). logical/: placeholder (IR/DFIR NIST SP 800-61 source wanted).

## Workflow
1. **Detection**: detection-engineering manages SIEM rules and alert tuning. Elastic Security MCP handles rule creation, false positive tuning, and attack discovery.
2. **Triage**: security-monitoring classifies alerts per Incident Commander SEV1-SEV4 matrix. SEV1/SEV2 → IR. SEV3/SEV4 → case management or tuning.
3. **Response**: security-incident-response runs the 14-type MITRE-mapped IR lifecycle. cortex recommends containment → operator executes (the inversion). DFRWS forensics. Regulatory notification per jurisdiction.
4. **Hunt**: threat-hunting runs hypothesis-driven proactive searches from the mukul975 collection. Malicious findings → IR. Suspicious findings → new detection rules.
5. **All lessons → warden.** Every incident, hunt finding, and monitoring gap updates warden's risk register. Repeat incidents indicate control failures.
6. **All containment/remediation → operator.** cortex holds no execute permissions — it detects, triages, and recommends.
