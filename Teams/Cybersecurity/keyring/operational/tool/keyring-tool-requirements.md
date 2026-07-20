# keyring — Tool Requirements

**Specifies needs; does not grant them.** Fleet Charter Rails 1–2 (registered, least privilege); every external call plan-locked + sandboxed.

| Skill | Needs | Why |
|---|---|---|
| identity-lifecycle | READ of IdP/account state; file write (access matrix / JML records) | design + detect JML gaps |
| access-reviews | READ of entitlements; script execution (access_review.py — stdlib); file write (review diffs) | recertification diff |
| privileged-access-management | READ of privileged-account inventory + logs | minimize + monitor |
| secrets-governance | READ of secret-scanning results; file write (secrets policy/inventory) | vault/rotation discipline |

## Explicit non-needs / hard prohibition (the security-inversion)
- **NO write/execute access to the IdP, PAM, or vault** — keyring never provisions, revokes, or rotates; the operator/IdP/PAM/vault executes.
- **No key-holding** — keyring designs access and detects gaps; it holds no credentials.
- **No standing privilege of its own** — the agent that governs privilege must not accumulate it.

## Notes
- keyring is read-and-recommend by design; its power is the diff and the policy, not the action.
- IdP/PAM/vault are the executors, configured per business; keyring's `access_review.py` is stdlib-only (no vendor dependency).
