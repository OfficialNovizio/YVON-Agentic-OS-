# Release-Gate Matrix — [business name]

> Which test tiers a change must pass before it ships. Co-owned by dev + quinn; changes to this matrix are ADRs. Numeric floors come from config (`coverage_floors`) — this matrix defines WHICH tiers, config defines HOW MUCH.

**Tiers:** U = unit · I = integration · E = end-to-end (browser evidence via browser-verification) · R = targeted regression (from the regression-map, when a fragile area is touched) · S = security pass (aegis, per dev's review routing)

| Change type | U | I | E | R | S | Notes |
|---|---|---|---|---|---|---|
| Feature (new surface) | ✓ | ✓ | ✓ critical flows | if fragile area touched | if new external surface/auth | |
| Bug fix | ✓ (incl. a test that fails without the fix) | ✓ if cross-module | if user-facing flow | ✓ for the broken area (new map entry) | if security-adjacent | The fix's test IS the regression entry |
| Refactor (no behavior change) | ✓ existing green | ✓ existing green | smoke | if fragile area touched | — | New tests not required; deleted tests are |
| Config / dependency change | — | ✓ affected paths | smoke | if fragile area touched | ✓ if dep is security-relevant | Lockfile diffs reviewed |
| Data-adjacent (schema, migration scripts) | ✓ | ✓ with migration applied to test DB | — | ✓ | ✓ | Script itself is operator-run (Rail 3) |
| Security-adjacent (auth, input handling, secrets) | ✓ | ✓ | ✓ auth flows | ✓ | ✓ mandatory | aegis verdict required |
| Hotfix (emergency) | ✓ minimal | — pre-ship | smoke | — pre-ship | if security-adjacent | Full tiers within <FILL_IN> hours post-ship, logged as debt |

## Config-bound values (operator sets; quinn never invents — rule 0.5)
- `coverage_floors`: per-tier minimum coverage on touched code — `<FILL_IN>`
- `critical_flows`: the E2E-mandatory user journeys — `<FILL_IN>`
- `hotfix_completion_window`: hours to complete deferred tiers — `<FILL_IN>`
