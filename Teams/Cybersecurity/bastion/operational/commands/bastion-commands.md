# bastion — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "cloud posture," "cloud security," "CSPM," "misconfig," "public bucket," "open port" | cloud-posture | /bastion-posture |
| "harden," "CIS baseline," "config baseline," "is this box secure" | hardening-baselines | /bastion-harden |
| "vuln," "CVE," "patch," "vulnerability scan," "are we vulnerable" | infra-vuln-management | /bastion-vuln |
| "network security," "segment," "firewall rule," "ZTNA," "network review" | network-security | /bastion-network |

## Precedence
1. **Every gap/finding lands in warden's risk-register** — no bastion finding is resolved in isolation; the register tracks it.
2. **Any privileged execution** (cloud config change, firewall rule apply, OS patch) → the operator or ops deploy gate. bastion holds no keys (the security-inversion).
3. **Joint findings with ops/aegis** → bastion tracks the infra half; ops/aegis tracks their half. The finding is not resolved until both halves are confirmed.
4. **Drift findings** (remediated gap that reappeared) → process gap to warden, not just re-remediation.
