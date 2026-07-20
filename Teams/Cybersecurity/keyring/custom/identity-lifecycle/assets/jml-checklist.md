# JML Checklist — keyring/identity-lifecycle

> keyring specs; operator/IdP executes (security-inversion). Every change logged. Leaver = ALL systems.

## Joiner
- [ ] Role identified → least-privilege access set (not "what last person had")
- [ ] Access granted by operator/IdP per the set; no over-provisioning
- [ ] MFA enrolled; account logged

## Mover (role change)
- [ ] New role's access added
- [ ] **Old role's access REMOVED** (not additive)
- [ ] Net access = current role only; logged

## Leaver (the loudest gap)
- [ ] IdP/SSO account disabled promptly
- [ ] SaaS NOT behind SSO — each revoked
- [ ] Shared / service accounts they used — rotated
- [ ] API keys / tokens / secrets they held — revoked (→ secrets-governance)
- [ ] Physical/VPN/device access removed
- [ ] Time-to-deprovision recorded (metric)

## Reconcile (cadence)
- [ ] Every account ↔ a current person with a current need
- [ ] Orphans (no owner) / ghosts (departed) / shared logins flagged → warden register
