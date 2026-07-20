# Flutter Playbook — [business name] — as of [date]

> Dated per the volatility split (ops/platform-playbooks). Flutter/mobile frameworks move fast — VERIFY current versions/APIs before committing. Only relevant when mobile_active AND the stack-profile names Flutter (could be React Native or native instead). Ground truth (verified builds) beats this doc.

**As of:** <FILL_IN> · **Staleness horizon:** <FILL_IN> · **Framework + version:** [Flutter x.y / RN / native] · **Stack-profile ref:** <FILL_IN>

## State management
- Approach: [Riverpod / Bloc / Provider / setState — chosen, per verified practice at date]
- Persisted state (survives background/kill): [mechanism]

## Navigation
- Router: [go_router / Navigator 2.0 / etc.] · deep links: [scheme/handling]

## Platform channels (behind clean abstractions)
| Native capability | Channel/plugin | iOS notes | Android notes |
|---|---|---|---|
| [camera/notifications/secure storage/…] | | | |

## Secure storage (aegis-relevant)
- Mechanism: [Keychain / Keystore via plugin] — secrets never in plain prefs

## Build & release mechanics (→ app-store-release-discipline)
- Build: [flutter build ios/appbundle — commands, verified date]
- Signing: [iOS provisioning / Android keystore — OPERATOR holds signing secrets]

## Cross-platform divergences to handle
- [permissions model / back button / lifecycle / UI conventions]

## Verified-build log (ground truth re-dates this)
| Date | Build/command | Result | Section confirmed/corrected |
|---|---|---|---|
