# Plan-Lock Log — [business name]

> Rail 1's append-only ledger. One entry per lock event; entries are NEVER edited or deleted — corrections and outcomes are new entries referencing the original. Tamper-evident by hash chain: each entry records the previous entry's hash.

**Log path (config):** `plan_lock_log` · **Hash algorithm:** [default SHA-256] · **Maintained by:** quinn only

| # | Plan ID | Agent | Plan hash | Prev-entry hash | Locked at | Supersedes | Outcome (later entry ref) |
|---|---------|-------|-----------|-----------------|-----------|------------|---------------------------|
| 1 | <FILL_IN> | <FILL_IN> | <FILL_IN> | — (genesis) | <FILL_IN> | — | — |

## Entry types
- **LOCK** — plan validated and frozen; agent may begin.
- **HALT** — off-plan call detected: records the executed call, the locked plan's delta, escalation ref.
- **RELOCK** — new plan superseding a prior one (cites it); old plan's work stops under the old lock.
- **OUTCOME** — run completed on-plan / halted at step N / abandoned; closes a LOCK entry by reference.
- **DENIAL** — Rail 2 egress denial or Rail 3 destructive-op detection, logged here for one audit trail.

## Rules
- Append-only; corrections by new entry referencing the old (`corrects: #N`), never by edit.
- Every entry carries the previous entry's hash — a broken chain is itself a top-severity finding.
- quinn's own plans are locked here like any agent's, hashed before quinn's run begins.
