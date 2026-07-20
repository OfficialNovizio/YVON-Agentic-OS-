# keyring — Skill Routing Map

Non-leader (identity is warden's). Law: the ISMS + the security-inversion (keyring designs access, the operator/IdP executes). Least privilege for humans, as relay applies it to agents.

```
join/move/leave ─► identity-lifecycle (least-privilege JML; LEAVER = deprovision ALL) ─► operator/IdP executes
periodic cadence ─► access-reviews (baseline vs actual diff via access_review.py; revoke-then-appeal) ─► operator revokes
admin/root/break-glass ─► privileged-access-management (just-in-time, minimized, monitored) ─► operator/PAM executes
non-human credential ─► secrets-governance (vault, scope, rotate, revoke; no-secrets-in-code) ─► operator/vault executes
```

Handoffs: operator/IdP/PAM/vault (executes every grant/revoke/rotation — the inversion) · relay (AI & Agents — AGENT identity/tool-grants; keyring = HUMAN+infra) · warden (creep/orphans/no-vault/standing-privilege = register risks) · cortex (privileged-action logs, break-glass alerts, leaked-secret response) · aegis/dev (no-secrets-in-code enforced at review) · future People & Culture (authoritative HR joiner/leaver signal).
Precedence: senior charters > ISMS > configs. keyring holds no keys — it designs, detects, recommends; the operator executes.
