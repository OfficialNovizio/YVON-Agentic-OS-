---
name: app-store-release-discipline
type: custom
status: built 2026-07-09 (Fable build) — DORMANT until mobile_active
based_on_catalog_entry: none — new; plan §3 "app-store-release-discipline C"
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — app-store/release skills found are fastlane wrappers; the discipline (store review, staged rollout, no-instant-rollback reality) is kept custom, mirroring ops's release-discipline for the app-store context
assigned_agent: nova (Engineering / Mobile)
portable: true — the discipline is store-agnostic; iOS/Android specifics live in the dated playbook
includes: assets/app-release-checklist.md
date_added: 2026-07-09
---

## Introduction

app-store-release-discipline is nova's shipping law, and it differs from web in one brutal way: **you can't instantly roll back a mobile release.** A bad web deploy is reverted in seconds (ops); a bad app-store release is already on users' phones and a fix must go through store review again. So mobile shipping is staged-rollout-first, review-guideline-aware, and even more conservative than web — the rollback ops relies on barely exists here.

## Purpose

Mobile release failures are uniquely painful: a crash ships to millions, the fix takes a review cycle (hours to days), and users who auto-updated are stuck. This discipline front-loads the caution: thorough pre-submission verification, staged rollout to catch problems at 1% not 100%, and forward-fix readiness because backward-rollback is weak.

## When to Use

Triggers (only when `mobile_active`): "release the app," "submit to the store," "app store review," "staged rollout," "the app crashed in production," and any mobile release.

## Structure / Protocol

```
[GATE: mobile_active?] A mobile release candidate
  -> PRE-SUBMISSION: quinn gate + mobile-verification on real devices (both OSes) + charter clean
  -> STORE GUIDELINES: review-guideline compliance checked (rejection = lost days)
  -> VERSIONING: build/version bumped correctly; release notes; phased-release configured
  -> STAGED ROLLOUT: 1% → 10% → 100%, watching crash-free rate + reviews at each stage
     (this is mobile's substitute for instant rollback — catch it small)
    -> Problem at a stage → HALT rollout, forward-fix (rollback is weak), expedited review if severe
      -> Signing secrets: held by the OPERATOR, never the agent (charter-adjacent)
```

## Instructions

1. **Check the switch.** `mobile_active` false → dormant. No app, no releases.
2. **Verify on real devices before submission.** quinn's gate plus mobile-verification on actual iOS and Android devices — the simulator lies about performance, permissions, and device-specific bugs. A crash found post-submission costs a review cycle.
3. **Know the store guidelines.** iOS and Android review guidelines reject for specific reasons (privacy labels, permissions justification, payment rules); non-compliance is lost days, not minutes. The dated playbook tracks current guideline specifics.
4. **Staged rollout is the rollback.** Release to 1%, then 10%, then 100%, watching crash-free rate and review sentiment at each gate. This is mobile's answer to ops's instant rollback — you can't pull it back, so you catch it small. Halt the rollout the moment metrics degrade.
5. **Forward-fix readiness.** Because rollback is weak (users have the bad build), keep the ability to ship a fix fast — feature flags to disable a broken feature server-side without a new release (raj/service-patterns), and expedited-review readiness for severe cases.
6. **The operator holds signing secrets.** App signing keys/certs are held and used by the operator, not the agent — the mobile analogue of the charter's don't-hold-secrets stance; a leaked signing key is catastrophic.

## Output Format

```
## App Release: [version] — [mobile_active ✓]
Pre-submission: quinn gate [ref] · real-device verify (iOS+Android) ✓ · charter clean
Store guidelines: [compliant ✓ / risks] · Version/notes: [ ] · Phased release: [configured]
Staged rollout: 1% → 10% → 100% — crash-free rate + reviews watched at each
Rollback reality: [forward-fix ready · feature-flag kill-switch · expedited review if severe]
Signing: OPERATOR-held
```

## Principles

- **You can't instantly roll back mobile** — staged rollout IS the rollback; catch it small.
- **Real-device verify before submission** — the simulator lies; a post-submission crash costs a review cycle.
- **Store-guideline compliance** — rejection is lost days.
- **Forward-fix readiness** — feature-flag kill-switches + expedited review, because backward-rollback is weak.
- **The operator holds signing secrets** — a leaked signing key is catastrophic.
- **More conservative than web** — the safety net (instant rollback) barely exists.

## Fallback

- `mobile_active` false → dormant.
- No phased-release support (some contexts) → smaller test cohorts (TestFlight/internal track) first, then full — approximate the staged rollout.
- Severe bug already at 100% → forward-fix + expedited review + server-side feature-flag disable (raj) as the immediate mitigation; the flag is what saves you when rollback can't.

## Boundaries with Other Skills

- **ops/release-discipline**: the web analogue; this is its mobile counterpart, more conservative because rollback is weak. Coordinate cadence.
- **mobile-verification** (sibling): the real-device testing that must pass before submission.
- **mobile-app-architecture** (sibling) + its dated playbook: build/signing mechanics.
- **raj/service-patterns**: server-side feature flags are the kill-switch when a bad build ships (the real mobile safety net).
- **quinn**: the gate precedes submission; **aegis**: privacy/permissions/signing are security surfaces.
