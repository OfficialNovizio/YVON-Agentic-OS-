# Cloud Posture Checklist — bastion/cloud-posture

> Check against CIS Benchmark + provider best-practices (dated). bastion detects + specs; operator/ops remediates. Prioritize exposure × data-sensitivity (veil).

## The classic high-blast misconfigs (every scan)
- [ ] No public storage buckets/blobs holding non-public data
- [ ] No databases / admin ports open to 0.0.0.0/0
- [ ] Security groups / firewall rules least-open (no broad ingress)
- [ ] Cloud IAM least-privilege (no `*:*` / over-broad roles) → keyring seam
- [ ] Encryption at rest enabled (volumes, buckets, DBs)
- [ ] Audit logging / cloud-trail enabled + retained
- [ ] Root / org-owner accounts have MFA; root not used routinely
- [ ] No long-lived access keys where roles/short-lived would do (→ secrets-governance)

## Prioritize
| Finding | Resource | Exposure (public/internal) | Data sensitivity (veil) | Severity | Fix spec → executor |
|---|---|---|---|---|---|
| <FILL_IN> | | | | | operator / ops gate |

## Drift
- [ ] Previously-fixed misconfigs re-checked (reappearance = process gap, a finding)
- Provider baseline as-of date: [dated — cloud services change] · Risks → warden register
