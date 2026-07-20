# bastion — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| cloud_accounts (providers, accounts) | cloud-posture | `<FILL_IN — stack-profile hosting config>` |
| cspm_tool | cloud-posture | `<FILL_IN — Prowler / ScoutSuite / Security Hub / Defender>` |
| cspm_scan_cadence | cloud-posture | `<FILL_IN — default monthly>` |
| cve_feeds | infra-vuln-management | `<FILL_IN — NVD / OSV / vendor advisories>` |
| patch_sla_critical / patch_sla_high / patch_sla_medium | infra-vuln-management | `<FILL_IN — default 7/30/90 days>` |
| vuln_scan_cadence | infra-vuln-management | `<FILL_IN — default weekly OS / monthly cloud>` |
| network_scan_tool | network-security | `<FILL_IN>` |
| network_review_cadence | network-security | `<FILL_IN — default quarterly>` |
| executor | all (the inversion) | operator / ops (bastion holds no keys) |

## Instructions
1. No `cloud_accounts` → cloud posture checks are impossible; flag as a risk to warden. Focus on local infra hardening and network review.
2. No `patch_sla_*` values → default to 7/30/90 days, loudly labeled provisional; recommend operator confirmation.
3. `executor` is fixed to operator/ops — no config grants bastion key-holding or execution (the security-inversion).

## Fallback
Unfilled config degrades loudly. The absolute: bastion never holds cloud admin keys, pushes firewall changes, or applies patches itself — the operator/ops executes all infra changes.
