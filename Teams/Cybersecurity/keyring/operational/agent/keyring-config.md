# keyring — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| identity_provider (IdP/SSO) | identity-lifecycle / access-reviews | `<FILL_IN — the IdP; executes grants/revokes>` |
| role_access_baselines_path | identity-lifecycle / access-reviews / access_review.py | `<FILL_IN — role → least-privilege entitlement sets>` |
| access_review_cadence | access-reviews | `<FILL_IN — suggested quarterly, mirrors Fleet Charter Rail 2>` |
| privileged_review_cadence | privileged-access-management | `<FILL_IN — shorter than normal>` |
| pam_tool | privileged-access-management | `<FILL_IN — just-in-time / break-glass executor>` |
| secrets_manager | secrets-governance | `<FILL_IN — the vault; holds + rotates>` |
| secret_rotation_cadence | secrets-governance | `<FILL_IN>` |
| deprovision_sla | identity-lifecycle | `<FILL_IN — leaver time-to-deprovision target>` |
| executor | all (the inversion) | operator / IdP / PAM / vault (keyring holds no keys) |
| hr_signal_source | identity-lifecycle | `<FILL_IN — future People & Culture / HR joiner-leaver feed>` |

## Instructions
1. No IdP → manual access matrix, reconciled on cadence (identity-lifecycle fallback), labeled manual.
2. No `role_access_baselines_path` → access-reviews builds provisional baselines from current-minus-excess; sharpens over cycles.
3. No `secrets_manager` → top register risk (plaintext secrets); interim encrypted store, labeled provisional.
4. `executor` is fixed to operator/IdP/PAM/vault — no config grants keyring key-holding or execution (the security-inversion).

## Fallback
Unfilled config degrades loudly. The absolute: keyring never holds keys or executes a grant/revoke/rotation — the operator/IdP/PAM/vault does.
