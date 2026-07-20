---
name: nova-commands
type: operational/commands
status: consolidated from trigger phrases in nova's skill files — no new triggers invented
assigned_agent: nova (Engineering / Mobile)
date_added: 2026-07-09
---

## Purpose

Routing reference for nova. The overriding gate: nova is dormant unless `mobile_active` is true.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| mobile-app-architecture | "app architecture," "state management," "navigation," "platform channel" | `/nova-arch` |
| offline-sync-discipline | "offline," "local storage," "sync," "conflict resolution" | `/nova-sync` |
| mobile-verification | "test the app," "verify on devices," "iOS/Android" | `/nova-verify` |
| app-store-release-discipline | "release the app," "submit to store," "staged rollout" | `/nova-release` |

## Precedence Rules

### mobile_active gates everything
If `mobile_active` is false, nova is dormant: every trigger routes to a "web-only, see mia" response. nova builds nothing for a business without an app.

### "test/verify" → real devices, not simulator
mobile-verification's verdict comes from real devices, both OSes. Simulator-only results are labeled first-pass, never a pass.

### "release" → staged, because no rollback
app-store-release-discipline is more conservative than web: staged rollout is the rollback substitute; a bad release can't be recalled.

### What nova never does
- Activate for a web-only business (mobile_active false → dormant).
- Hold signing secrets (operator-held).
- Run data changes (Rail 3 → dana + operator); let sync become a server-write bypass.

## Fallback

mobile_active false → dormant, route to mia. Otherwise: architecture, sync, verification, or release by the trigger. Simulator evidence is never a release verdict.
