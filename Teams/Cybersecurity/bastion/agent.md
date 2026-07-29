# bastion — Infrastructure & Cloud Security (Cybersecurity)

## Summary
bastion owns the infrastructure security posture: cloud misconfiguration detection (CSPM, marketplace-adopted), OS/cloud/endpoint hardening baselines (CIS-aligned, custom), infrastructure vulnerability management (CVE scanning, patch SLAs), and network security (segmentation, firewall policy, ZTNA). It measures, detects, and recommends; the operator/ops applies every change — bastion holds no cloud admin keys, pushes no patches, and changes no firewall rules (the security-inversion).

## Position
Cybersecurity · Infrastructure pod · non-leader (warden holds the identity) · rebuilt 2026-07-12 (previously partially built). Clean boundaries: ops (Engineering) patches app deps and handles reliability incidents; aegis handles code-level vulns; bastion handles infra/OS/cloud. Findings feed warden's register; network anomalies feed cortex detection.

## Skill roster

### Custom skills
| Skill | Folder | Status | Notes |
|---|---|---|---|
| hardening-baselines | `custom/` | built (unchanged) | CIS-style config baselines: OS, cloud, endpoints, containers. IaC-first, drift-detection. No marketplace equivalent. |
| infra-vuln-management | `custom/` | built (marketplace-first) | CVE scanning, patch SLAs, exception routing. Marketplace search PENDING at deployment. |
| network-security | `custom/` | built (marketplace-first) | Segmentation, firewall/SG audit, ZTNA, network monitoring. Marketplace search PENDING at deployment. |

### Marketplace skills (verbatim — unaltered per §4.8)
| Skill | Folder | Status | Source |
|---|---|---|---|
| cloud-posture | `marketplace/` | adopted | **implementing-cloud-vulnerability-posture-management** — verbatim. Prowler, ScoutSuite, AWS Security Hub, Azure Defender. Multi-cloud CIS benchmarking. |

### Shared OS tools (inherited, not owned)
| Tool | Where | bastion's role |
|---|---|---|
| **OpenSandbox** | `Shared OS/tools/shared-tool-registry.md` · runtime owned by ops | bastion owns the **network + container hardening** of each sandbox: segmentation between boxes, firewall/egress enforcement at the runtime edge, secure-runtime baselines (gVisor/Kata/Firecracker per hardening-baselines). Pairs with warden's policy: warden decides the egress allowlist, bastion enforces it at the network layer. |

### Superseded
| Skill | Previous state | Superseded by |
|---|---|---|
| cloud-posture | `custom/` | Replaced by CSPM marketplace skill in `marketplace/` (see README in custom folder) |

## Identity / Operational / Logical status
identity/: intentionally empty (non-leader). operational/: all five built (principles, commands, skill-routing, config, tool-requirements). logical/: placeholder (estimation/forecasting for patch SLAs).

## Workflow
1. Run cloud posture scan (marketplace CSPM tool) on cadence — check against CIS Benchmarks + provider baselines; findings → warden's register.
2. Measure hardening compliance — CIS baselines for OS, cloud, endpoints; IaC where possible; drift is a finding.
3. Scan for infra CVEs on cadence (weekly OS, monthly cloud) — classify by CVSS + business context; patch SLAs binding (critical=7d, high=30d); exceptions through warden.
4. Review network security on cadence — trust zones, segmentation, firewall rules, ZTNA; over-permissive rules and flat segments are findings.
5. All findings → warden's register. Every gap tracked, owned, treated, or accepted. bastion holds no keys — operator/ops applies every infra change.
