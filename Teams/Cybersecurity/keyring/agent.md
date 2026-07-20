# keyring — Identity & Access Management (Cybersecurity)

## Summary
keyring owns *human and infrastructure* identity: least-privilege joiner-mover-leaver, periodic access reviews (Hack23 cadences + automated diff), privileged-access management (minimized, just-in-time, monitored), and secrets governance (vaulted, scoped, rotated). It designs access and detects gaps; the operator/IdP/PAM/vault executes every grant, revoke, and rotation — keyring holds no keys (the security-inversion).

## Position
Cybersecurity · Access pod · non-leader (warden holds the identity) · rebuilt 2026-07-12. Clean split from **relay** (AI & Agents): relay owns AGENT identity + tool-grants, keyring owns HUMAN + infra identity — one least-privilege doctrine, two subjects. Findings feed warden's register; privileged logs + leaked secrets feed cortex.

## Skill roster

### Custom skills
| Skill | Folder | Status | Notes |
|---|---|---|---|
| identity-lifecycle | `custom/` | rebuilt | **Custom + Marketplace**: wraps Hack23 access-control-policy (ISO 27001-aligned RBAC/MFA/zero-trust framework) + custom JML workflow. Policy layer unaltered per §4.8. |
| access-reviews | `custom/` | rebuilt | **Merge**: Hack23 access-control-policy review cadences (monthly/quarterly/semi-annual/annual per 6-tier matrix) + custom access_review.py (automated diff). Revoke-then-appeal. |
| privileged-access-management | `custom/` | built (unchanged) | Minimize, just-in-time, break-glass defined/alerted/post-reviewed. No marketplace equivalent (all vendor wrappers). |

### Marketplace skills (verbatim — unaltered per §4.8)
| Skill | Folder | Status | Source |
|---|---|---|---|
| secrets-governance | `marketplace/` | adopted | **aj-geddes secrets-management** — verbatim. Vault, rotation, multi-tool coverage (Vault/AWS SM/Azure KV/GCP SM/K8s). |
| access-control-policy | `marketplace/` | adopted | **Hack23 access-control-policy** — verbatim. ISO 27001-aligned, 6-tier access matrix, zero-trust architecture, dormant detection. |

### Superseded
| Skill | Previous state | Superseded by |
|---|---|---|
| secrets-governance | `custom/` | Replaced by aj-geddes secrets-management in `marketplace/` (see README in custom folder) |

## Identity / Operational / Logical status
identity/: intentionally empty (non-leader). operational/: all five built. logical/: placeholder (IAM/zero-trust NIST 800-63/800-207; key-management 800-57).

## Workflow
1. Manage the human identity lifecycle: policy from Hack23 access-control-policy (RBAC, zero-trust, MFA matrix). Least-privilege on join, remove-old-on-move, prompt+complete deprovision on leave — keyring specs, operator/IdP executes.
2. Recertify on Hack23 cadence (monthly for RESTRICTED/infra/finance, quarterly for dev, annual for marketing): `access_review.py` diffs entitlements against role baselines; over-grants are revoked-by-default (operator executes); orphans/creep feed warden. Dormant accounts (>90d) disabled per Hack23.
3. Tighten the keys to the kingdom: minimized, just-in-time privileged access; defined-and-alerted break-glass; monitored (feeds cortex).
4. Govern secrets (aj-geddes secrets-management): vaulted, scoped, rotated, revoked — never in code/logs; a found secret is treated as compromised. keyring never holds keys or executes — the operator/IdP/PAM/vault does (the inversion).
