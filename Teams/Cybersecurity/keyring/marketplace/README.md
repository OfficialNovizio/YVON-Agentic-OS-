# keyring — Marketplace adoptions

Updated 2026-07-12 (v2 redesign). The earlier search (2026-07-10) found vendor-product wrappers only; the v2 search found two portable fits.

## Adopted (verbatim per playbook §4.8)

**1. Hack23 access-control-policy** — `marketplace/access-control-policy/SKILL.md`
- **Source:** skillsmp.com/zh/skills/hack23-cia-github-skills-access-control-policy-skill-md
- **What:** ISO 27001-aligned RBAC/least-privilege/MFA policy framework. 6-tier access control matrix (RESTRICTED → Public with MFA method, session timeout, review frequency). Zero-trust architecture. Dormant account detection (90-day threshold). Break-glass procedures.
- **Why now:** Previously missed in search. Provides the authoritative policy layer that identity-lifecycle and access-reviews wrap.
- **Install:** `npx skills add https://github.com/Hack23/cia --skill access-control-policy`

**2. aj-geddes secrets-management** — `marketplace/secrets-governance/SKILL.md`
- **Source:** skillsmp.com/zh/skills/aj-geddes-useful-ai-prompts-skills-secrets-management-skill-md
- **What:** Full secrets management lifecycle. HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, Kubernetes Secrets. Includes Vault config examples, Lambda rotation scripts.
- **Why now:** Ships actual config examples and rotation code the custom version lacked. No unique VYON IP in the custom version that isn't in the principles layer.

## Not adopted (still no portable fit)

PAM-specific marketplace skills remain vendor-product wrappers (CyberArk, BeyondTrust, Delinea). keyring's PAM skill stays custom.

## Queued for scout

If a portable IAM-method or access-review agent skill emerges on skillsmp/mcpmarket in future.
