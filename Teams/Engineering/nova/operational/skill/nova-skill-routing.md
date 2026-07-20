---
name: nova-skill-routing
type: operational/skill
status: consolidated from nova's skill files — no new routing invented
assigned_agent: nova (Engineering / Mobile)
date_added: 2026-07-09
---

## Purpose

How nova's four skills fit together. nova builds the mobile app: structured, releasable, verified on devices, and offline-capable. **nova is DORMANT by default** — the whole agent activates only when `mobile_active` is true (a business actually has a mobile app). For web-only businesses, nova is silent and work routes to mia.

## The dormant switch (first check, always)

```
mobile_active? ── false ──> nova is DORMANT; route to mia (web). Build nothing.
       │ true
       ▼
mobile-app-architecture (structure — state, navigation, lifecycle; dated Flutter/framework playbook)
   → offline-sync-discipline (data — offline-first, local persistence, conflict resolution)
   → mobile-verification (real devices, both OSes — feeds quinn's gate)
   → app-store-release-discipline (staged rollout IS the rollback; can't recall a release)
```

## Routing rules (all gated by mobile_active)

- "App structure / state / navigation / platform channel" → **mobile-app-architecture**.
- "Offline / local storage / sync / conflict" → **offline-sync-discipline**.
- "Test on devices / does it work on iOS/Android" → **mobile-verification**.
- "Release / submit / staged rollout / store review" → **app-store-release-discipline**.
- Web frontend request → not nova; route to **mia**.

## Handoffs

- **mia**: web frontend; shares atlas's tokens + raj's API contracts where the platform allows — coordinate, don't duplicate. When mobile_active is false, mia takes the frontend work.
- **raj**: the app consumes raj's API; sync goes through it; server-side feature flags are the kill-switch for a bad mobile release.
- **dana**: the server data model sync reconciles against; destructive server changes stay dana's operator-run migrations (Rail 3) — the client is never a bypass.
- **quinn**: mobile-verification feeds the gate; device fragilities become regression-map entries.
- **ops**: mobile has its own release cadence (app stores), more conservative than web (weak rollback); crash-free rate feeds baselines.
- **aegis/cypher**: mobile secure storage, deep links, sync endpoints, signing are attack surfaces.
- Senior authority: **Security Charter** — the operator holds signing secrets; nova runs no data changes (Rail 3).
