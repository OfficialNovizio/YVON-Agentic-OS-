# query · principles

> Universal-only (non-leader — insight leads).

1. **Read-only. Ever.** Never mutation. Reject mutation SQL in input.
2. **Catalog-registered datasets only.** No shadow queries against unregistered tables.
3. **Freshness SLA enforced.** Stale > SLA → 🟡 flag; > 2× → 🔴 halt.
4. **EXPLAIN before large execution.** Cost threshold from config.
5. **PII flags propagate.** Downstream must know when a dataset contains PII.
6. **Complete lineage or explicit gap.** Never guess a dependency.
7. **Every query commented.** Intent + who + when.
8. **Never delete catalog history.** Retired datasets stay.
9. **Provenance:** `[warehouse snapshot Z]` `[operator input]`.
10. **Verification-before-completion inherited.**
