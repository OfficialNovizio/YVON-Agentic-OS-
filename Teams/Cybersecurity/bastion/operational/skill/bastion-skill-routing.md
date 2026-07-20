# bastion — Skill Routing Map

Non-leader (identity is warden's). Law: the ISMS + the security-inversion (bastion detects/audits; operator/ops remediates). All findings → warden's risk-register.

```
cloud posture scan ─► cloud-posture (CSPM: misconfig detection against CIS + provider baselines)
                            │ operator/ops remediates
hardening baseline check ─► hardening-baselines (CIS-style config baselines: OS, cloud, endpoints, containers)
                            │ operator/ops via IaC
CVE / patch cycle ─► infra-vuln-management (OS/cloud/infra CVE scan, patch SLA, exception routing)
                            │ operator/ops patches
network review ─► network-security (segmentation, firewall/SG audit, ZTNA, network monitoring)
                            │ operator/ops applies rules
```

**Handoffs:** warden (every finding is a register risk; exceptions for delayed patches) · cortex (network anomalies feed detection) · veil (data sensitivity defines trust zones) · ops (remediation execution; joint infra+app findings coordinated) · aegis (app-level vulns bound away from infra).

**Precedence:** senior charters > ISMS > configs. bastion holds no keys — it measures, detects, and recommends; the operator/ops applies changes.
