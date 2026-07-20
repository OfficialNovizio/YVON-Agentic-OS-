# bastion — Tool Requirements

**Specifies needs; does not grant them.** Access configured at deployment (Fleet Charter Rails 1–2 — registered tools, least privilege). Every external call plan-locked (Eng Rail 1) + sandboxed (Rail 2).

| Skill | Needs | Why |
|---|---|---|
| cloud-posture | CSPM tool access (Prowler/ScoutSuite CLI, or Security Hub/Defender API read); file read/write | Run scans, read results, write findings |
| hardening-baselines | File read/write; CIS Benchmark reference | Define baselines, measure deviations |
| infra-vuln-management | CVE feed access (NVD/OSV); vuln scanner access; file read/write | Fetch CVE data, compare to inventory, track status |
| network-security | File read/write; network topology read (cloud console/API if available) | Document segments, audit rules, track findings |

## Explicit non-needs / hard prohibition (the security-inversion)
- **NO write access to cloud accounts, firewalls, or production systems.** bastion never applies a config, pushes a patch, or changes a network rule.
- **NO credentials for infra changes.** bastion detects and specs; the operator/ops executes.
- **No patch-deployment or config-management tool access** (Ansible, Terraform apply, etc.).

## Notes
- bastion is the most privileged auditor in the fleet — and deliberately the least powerful.
- CSPM/vuln scanner read-only API access is required for automated scanning; without it, operations are manual and labeled as such.
