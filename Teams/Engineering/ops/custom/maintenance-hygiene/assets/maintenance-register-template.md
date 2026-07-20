# Maintenance Register — [business name]

> One living document, four sections, each on its own cadence (config `maintenance_cadences`). Entries are dated; skipped runs are logged as skips. Tool-specific mechanics live in the platform-playbooks.

## 1. Dependencies & patches (cadence: <FILL_IN>)
| Date | Finding | Severity | Action | Gate/Deploy ref | Closed |
|---|---|---|---|---|---|
| | [CVE / drift vs stack-profile / EOL runtime] | | [batched / hotfix row] | | |

## 2. Backups & restore tests (cadence: <FILL_IN>)
**Coverage:** [what's backed up — per config] · **Schedule:** <FILL_IN> · **Retention:** <FILL_IN>
| Date | Restore test target | Result | Integrity evidence | Measured restore time | Notes |
|---|---|---|---|---|---|
| | [scratch env] | PASS / FAIL → P2 incident | [counts/checksums/boot] | | |

## 3. Monitoring baselines (re-dated after material changes + on cadence: <FILL_IN>)
| Service | Metric | Baseline value | Measured on | Alert threshold (operator-adopted) |
|---|---|---|---|---|
| | error rate / p50 / p95 latency / saturation / cost | | [date — stale = finding] | <FILL_IN> |

## 4. Expiry register (alert lead time: <FILL_IN>)
| Item | Type | Expires | Renewal owner | Alert set | Renewed |
|---|---|---|---|---|---|
| | cert / token / key / domain / quota / vendor | | | ✓/✗ | |

## Skipped runs (visible debt)
| Section | Due | Skipped on | Why | Made up on |
|---|---|---|---|---|
