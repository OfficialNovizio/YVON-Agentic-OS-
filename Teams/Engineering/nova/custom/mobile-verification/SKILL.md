---
name: mobile-verification
type: custom
status: built 2026-07-09 (Fable build) — DORMANT until mobile_active
based_on_catalog_entry: none — new; the mobile counterpart to mia's frontend-verification and quinn's browser-verification
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — mobile-testing skills found (agentic-qe mobile-testing among them) are framework-specific runners; the real-device verification discipline is kept custom, bound to quinn's gate
assigned_agent: nova (Engineering / Mobile)
portable: true — the discipline is framework-agnostic; device farm / emulator tooling comes from the stack-profile
includes: (no asset — method skill; feeds quinn's gate)
date_added: 2026-07-09
---

## Introduction

mobile-verification is how nova proves a mobile app actually works — on real devices, across both OSes, before it ships to a place you can't easily recall it from. It's the department's "agents say done; the device tells the truth" for mobile: the simulator says the layout is fine and the app crashes on a three-year-old Android; the emulator says the flow works and the permission dialog blocks it on iOS. Real-device evidence is the only trustworthy kind.

## Purpose

Mobile has failure modes web doesn't: device fragmentation (screen sizes, OS versions, chips), permission flows, offline behavior, battery/memory constraints, and platform gestures. A verification that ran only on the developer's simulator has verified almost nothing. Because mobile can't roll back (app-store-release-discipline), this pre-ship verification carries even more weight than mia's.

## When to Use

Triggers (only when `mobile_active`): "test the app," "verify on devices," "does it work on Android/iOS," "did this render on device," pre-submission (release discipline requires it), and any mobile change.

## Structure / Protocol

```
[GATE: mobile_active?] A mobile change/release
  -> REAL DEVICES, BOTH OSes: a representative matrix (OS versions, screen sizes, low-end + high-end)
     the simulator/emulator is a first pass, NEVER the verdict
  -> CRITICAL FLOWS: run them on device (like quinn's release gate, mobile edition)
  -> MOBILE-SPECIFIC: permissions, offline behavior, background/foreground, rotation, deep links
  -> INTEGRITY (dev §0, mobile): real data (no mock), real API calls, no placeholder screens claimed done
    -> Evidence (device + OS + result + screenshot) → quinn's gate → app-store-release-discipline
    -> FAIL → specific delta (device/OS/step), not "works on my simulator"
```

## Instructions

1. **Check the switch.** `mobile_active` false → dormant.
2. **Real devices, both OSes, a real matrix.** Test on actual iOS and Android hardware across a representative range — OS versions, screen sizes, low-end and high-end. The simulator is a first pass; the verdict comes from devices. Device fragmentation is where mobile bugs hide.
3. **Critical flows on device.** The operator-defined critical journeys run on device (quinn's release-gate discipline, mobile edition) — not just unit tests, not just the simulator.
4. **Mobile-specific checks.** Permission grant/deny flows, offline and flaky-network behavior (offline-sync-discipline), background/foreground/kill transitions, rotation, deep links, and the back button (Android). These are the mobile-only failure modes.
5. **Integrity on device.** dev's §0 integrity block, mobile edition: real data not mock, real API calls not stubs, no placeholder screen shipped as "done." A screenshot of a working simulator with fake data is exactly the false "done" this catches.
6. **Evidence, then the gate.** Verdicts carry device + OS + result + screenshot/recording — evidence, not "works on my machine." This feeds quinn's gate and is a hard precondition of app-store submission (you can't recall a bad release).

## Output Format

```
## Mobile Verification: [change/release] — [mobile_active ✓]
Device matrix: [devices · OS versions · screen sizes tested]
Critical flows on device: [PASS/FAIL per flow]
Mobile-specific: [permissions · offline · lifecycle · rotation · deep links · back button]
Integrity: [real data ✓ · real API ✓ · no placeholder-as-done]
Evidence: [device/OS/screenshot refs] → quinn gate
```

## Principles

- **Real devices, both OSes, a real matrix** — the simulator is a first pass, never the verdict.
- **Critical flows on device** — quinn's release gate, mobile edition.
- **Mobile-specific failure modes** — permissions, offline, lifecycle, rotation, deep links, back button.
- **Integrity on device** — real data and API, no placeholder-as-done (dev §0).
- **Evidence, not "works on my simulator"** — device/OS/screenshot or it's not a verdict.
- **Weightier than web verification** — because mobile can't roll back.

## Fallback

- `mobile_active` false → dormant.
- No device farm → the widest real-device set available + emulator for breadth, labeled by fidelity; recommend a device-testing connector for the stack-profile; never ship on emulator-only evidence.
- Can't reproduce a device-specific bug → it's still a finding (device fragmentation is real); narrow the device/OS and file it, don't dismiss it as "works elsewhere."

## Boundaries with Other Skills

- **quinn/browser-verification**: the web analogue; this is the mobile counterpart feeding the same gate.
- **mia/frontend-verification**: sibling discipline, web vs device; shared integrity rule (dev §0).
- **app-store-release-discipline** (sibling): requires this to pass before submission (no recall after).
- **offline-sync-discipline** (sibling): offline behavior is a core verification target.
- **quinn/regression-map**: device-specific fragilities become mapped entries.
