# App Store Release Checklist — nova/app-store-release-discipline

> Only when mobile_active. Mobile can't instantly roll back — staged rollout IS the rollback. More conservative than web by design. Store specifics from the dated playbook.

## Gate: mobile_active
- [ ] mobile_active = true (else dormant; route to mia)

## Pre-submission (blocking)
- [ ] quinn GATE PASS (quality) + charter clean (security)
- [ ] mobile-verification on REAL devices — iOS AND Android (simulator lies)
- [ ] Crash-free on the target device matrix
- [ ] Feature-flag kill-switch wired for any risky new feature (raj — the real safety net)

## Store guidelines
- [ ] iOS review guidelines: privacy labels, permission justifications, payment rules
- [ ] Android policy: data safety, permissions, target API level
- [ ] Rejection risks reviewed (rejection = lost days)

## Versioning & submission
- [ ] Build/version bumped correctly; release notes written
- [ ] Phased / staged release configured
- [ ] Signing: performed by OPERATOR (agent never holds signing keys)

## Staged rollout (mobile's rollback substitute)
- [ ] 1% → watch crash-free rate + review sentiment
- [ ] 10% → watch
- [ ] 100% → watch
- [ ] Any degradation → HALT rollout, forward-fix, feature-flag disable, expedited review if severe

## Post-release
- [ ] Crash-free rate baseline (→ ops) · reviews monitored
- [ ] Forward-fix path confirmed (rollback is weak; the flag + expedited review are the plan)
