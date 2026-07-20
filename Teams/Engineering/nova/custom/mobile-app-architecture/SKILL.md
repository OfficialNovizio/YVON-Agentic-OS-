---
name: mobile-app-architecture
type: custom
status: built 2026-07-09 (Fable build) — DORMANT until mobile_active (see nova-config)
based_on_catalog_entry: none — new; plan §3 "flutter-playbook C" generalized to mobile architecture + a dated Flutter playbook (rule 0.4b — Flutter is one stack, not baked into method)
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — Flutter/mobile skills found are code scaffolders; the architecture discipline + dated playbook is kept custom, mirroring ops's platform-playbooks volatility split
assigned_agent: nova (Engineering / Mobile)
portable: true — the architecture discipline is framework-agnostic; Flutter (or RN/native) specifics live in the dated playbook per the stack-profile
includes: assets/flutter-playbook.md
date_added: 2026-07-09
---

## Introduction

mobile-app-architecture is how nova structures a mobile app so it stays maintainable across the platform's peculiarities — app lifecycle, navigation, state, platform channels, and the two-OS reality. The framework-specific mechanics (Flutter widgets/state, or React Native, or native) live in a dated playbook (ops's volatility-split pattern); the architecture discipline is the invariant. nova is **dormant by default** — this skill activates only when a business actually has a mobile app (`mobile_active`).

## Purpose

Mobile apps rot differently than web: lifecycle bugs (state lost on backgrounding), navigation spaghetti, platform-channel leaks, and the constant iOS/Android divergence. A clear architecture — state management, navigation structure, platform-abstraction boundaries — keeps the app understandable as it grows across two platforms.

## When to Use

Triggers (only when `mobile_active`): "build the mobile app," "app architecture," "state management," "navigation," "platform channel," "iOS vs Android behavior," and any mobile app structure work.

## Structure / Protocol

```
[GATE: mobile_active? — if false, nova is dormant; direct to mia (web) instead]
A mobile app to structure
  -> STATE: a clear state-management approach (per the dated playbook's framework)
  -> NAVIGATION: a structured router, not ad hoc push/pop; deep-link-able
  -> LIFECYCLE: handle background/foreground/kill; persist what must survive
  -> PLATFORM CHANNELS: native integrations behind a clean abstraction; leaks flagged
  -> TWO-OS REALITY: platform differences handled explicitly, not assumed away
    -> Consumes raj's API (data-access parallels), atlas's kit via tokens (shared with mia where possible)
      -> Framework mechanics from assets/flutter-playbook.md (dated); architecture is invariant
```

## Instructions

1. **Check the switch first.** If `mobile_active` is false, nova is dormant — the business is web-only and this work routes to mia. Don't build mobile scaffolding for a business that has no app (tempo's dormant pattern).
2. **State management with a clear approach.** Pick and apply one state pattern (per the playbook's framework) consistently — mixed ad hoc state is where mobile bugs breed. State that must survive backgrounding/kill is persisted explicitly.
3. **Structured navigation.** A router with named routes and deep-linkability, not scattered push/pop calls — navigation is where large apps become unmaintainable and where deep links (and their security) live.
4. **Lifecycle is explicit.** Handle background, foreground, and kill; the classic mobile bug is state silently lost when the OS backgrounds the app. What must survive is persisted (offline-sync-discipline).
5. **Platform channels behind abstractions.** Native integrations (camera, notifications, secure storage) sit behind a clean interface; a platform channel leaking through the app is a maintainability and a security concern (secure storage especially — aegis).
6. **Two OSes, handled explicitly.** iOS and Android differ (permissions, back button, lifecycle, UI conventions); handle the differences deliberately, don't assume one behaves like the other. The dated playbook records the current framework's cross-platform specifics.

## Output Format

```
## Mobile Architecture: [app/feature] — [mobile_active ✓]
State: [approach per playbook] · Navigation: [router, deep-linkable]
Lifecycle: [background/foreground/kill handled · persisted state]
Platform channels: [native integrations behind abstraction ✓ · leaks: none/flagged]
Two-OS: [differences handled explicitly] · Playbook: [dated ref]
```

## Principles

- **Check mobile_active first** — dormant for web-only businesses; route to mia.
- **One state approach, applied consistently** — mixed ad hoc state breeds bugs.
- **Structured, deep-linkable navigation** — not scattered push/pop.
- **Lifecycle is explicit** — background/kill loses state unless you persist it.
- **Platform channels behind clean abstractions** — leaks are maintainability + security concerns.
- **Two OSes handled explicitly** — never assume iOS ≈ Android.

## Fallback

- `mobile_active` false → dormant; state so and route to mia; build nothing.
- No dated playbook for the framework yet → architecture discipline runs framework-neutral; write the playbook from the first real build (ops's platform-playbook pattern).
- Cross-platform framework can't do something natively → platform-channel to native behind the abstraction, documented; don't fake it cross-platform.

## Boundaries with Other Skills

- **nova-config's `mobile_active`**: the dormant switch gating this entire agent.
- **app-store-release-discipline / mobile-verification / offline-sync-discipline** (siblings): the release, test, and data layers of the same app.
- **mia**: web frontend; shares atlas's tokens and raj's API contracts where the platform allows — coordinate, don't duplicate.
- **raj**: the mobile app consumes raj's API (same contract discipline).
- **aegis**: mobile secure storage, platform-channel security, and deep-link handling are attack surfaces.
- **ops**: mobile has its own release cadence (app stores), distinct from web deploys.
