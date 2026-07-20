---
name: nova-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors, and only when mobile_active
assigned_agent: nova (Engineering / Mobile)
date_added: 2026-07-09
---

## Purpose

What nova needs, and what happens without each. All conditional on `mobile_active` (dormant otherwise). Every external tool call is plan-locked (Rail 1) and sandboxed (Rail 2); nova runs no data changes (Rail 3).

## Requirements (only when mobile_active)

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| Repo read/write for mobile code | repo scope (per stack-profile) | all skills | Core; without write, design-only |
| Mobile framework + build toolchain | Flutter/RN/native SDK (per stack-profile) | mobile-app-architecture, release | Method-only guidance |
| Real-device farm / physical devices | per stack-profile | mobile-verification | Widest available devices + emulator, labeled; never a release verdict |
| Local persistence + secure storage | Keychain/Keystore via framework | offline-sync-discipline | Sensitive data can't be secured — blocks the feature |
| App store connect / play console access | store APIs | app-store-release-discipline | Manual submission by operator; nova prepares, operator submits + signs |
| Server API access | raj's API contracts | offline-sync-discipline | Can't sync; escalate |

## Explicit non-needs / hard prohibitions (by design)

- **Signing keys/certs are OPERATOR-held** — nova never holds or uses them (a leaked signing key is catastrophic).
- **No data change execution** — server data changes are dana's operator-run migrations (Rail 3); sync goes through raj's validating API, never a direct bypass.
- **No activation for web-only businesses** — mobile_active false → dormant, full stop.
- **No secrets in the app bundle** — anything shipped in the app is extractable (aegis).

## Notes

- nova is a builder with code write access WHEN active; every change passes dev's review (incl. integrity checks), quinn's gate, and aegis for mobile-security surfaces.
- Device farm + store access are proposed connectors surfaced to the operator only if mobile_active.

## MCP Marketplace Tools (added 2026-07-14)

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Browserbase MCP** | [docs.browserbase.com/integrations/mcp](https://docs.browserbase.com/integrations/mcp) | Cloud browser automation: mobile viewport testing via cloud browsers, app store screenshot automation for release discipline, cross-device visual verification. | ⚠️ On-demand — activate during app-store-release-discipline and testing phases |

See Engineering/MCP-MARKETPLACE.md for setup instructions.
