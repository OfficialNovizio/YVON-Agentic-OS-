# keyring — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "provision," "onboard," "offboard," "deprovision," "role change," "joiner/mover/leaver" | identity-lifecycle | /keyring-jml |
| "access review," "recertify," "who has access," "privilege creep," "orphan accounts" | access-reviews | /keyring-review |
| "admin access," "root," "privileged," "break-glass," "just-in-time" | privileged-access-management | /keyring-pam |
| "secrets," "API key," "rotate," "vault," "hardcoded credential," "leaked secret" | secrets-governance | /keyring-secrets |

## Precedence
1. **Leaver = deprovision ALL systems** (IdP + SaaS + shared + secrets) — the loudest gap; never partial.
2. Any **grant/revoke/rotation** is executed by the operator/IdP/PAM/vault — keyring designs and recommends, never executes (the security-inversion).
3. **Revoke-then-appeal** at reviews — unjustified access is removed by default.
4. A **found/leaked secret** is treated as compromised → rotate (not just delete) → alert cortex.
