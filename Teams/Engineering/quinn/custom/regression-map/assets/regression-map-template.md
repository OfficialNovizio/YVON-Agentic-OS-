# Regression Map — [business name]

> Append-only registry of known-fragile areas, each guarded by a targeted test suite required at quinn's gate when touched. Entries retire only by ADR-cited architectural removal; retired entries remain as history. Maintained by quinn; fed by ops post-mortems, cypher/aegis findings, and bug-fix history.

## Fragile areas

### RM-001 — [area name]
- **Scope (what counts as "touched"):** [paths / modules / flows — specific enough to match diffs]
- **Why fragile:** [incident/finding refs with dates — real events only]
- **Guard suite:** [named, runnable test suite exercising the failure mode] — `<FILL_IN>` until wired = entry is a TODO and BLOCKS the gate when touched
- **Break history:** [YYYY-MM-DD — one line each]
- **Status:** active / retired-by-ADR-NNN
- **Corrections:** [by reference to this entry, never edits]

## Flaky register

| Test | Suspected cause | Owner | Quarantined | Status | Coverage hole counted |
|---|---|---|---|---|---|
| <FILL_IN> | <FILL_IN> | <FILL_IN> | [date] | quarantined / fixed / re-guarded | yes (until fixed) |

## Watchlist (reasoning-based — does NOT gate; rule 0.6)

| Area | Why it looks risky | Flagged by | Date | Promoted to entry? |
|---|---|---|---|---|
| <FILL_IN> | [labeled speculation] | | | only via a real event |
