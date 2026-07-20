# Migration Script — [name] — [store] — [date]

> Rail 3 artifact. dana authors; the OPERATOR runs. Reversible (tested down-script) or explicit operator sign-off + recovery plan. Sequenced expand→migrate→contract.

## Effect summary (plain language — the operator approves THIS)
[What it does, in human terms. Tables/collections/edges affected. Estimated rows. What it explicitly does NOT touch. Reversible? yes/no.]

## Up-script
```
[the forward migration — in the store's language: SQL / HelixQL / migration DSL]
```

## Down-script (reversible)
```
[the rollback — restores the prior schema/state]
```
- Down tested on scratch/restored copy: [ ✓ evidence ref ] — untested = NOT DONE
- If irreversible: operator sign-off ref [___] + recovery plan [___] + risk entry [___]

## Sequencing
- Phase: [expand / migrate / contract]
- This step independently rollback-able: [ ✓ / explanation ]

## Execution (Rail 3)
- Authored by: dana
- **TO BE RUN BY: OPERATOR** (dana does not execute — no environment, no urgency exception)
- Operator approved: [ ___ ] · Operator ran: [ date ___ ]

## Post-run verification
| expected (from summary) | actual | match |
|---|---|---|
| | | ✓/✗ → incident if ✗ |

→ ops deploy record: [ref] · quinn gate evidence: [ref]
