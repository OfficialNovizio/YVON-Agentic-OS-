# ADR Ledger — [business name]

> Append-only index of all ADRs. One row per ADR; rows are never deleted. Status changes (accepted → superseded) update the row and add the superseding ADR's number. Individual ADRs follow `adr-template.md` and live alongside this index.

**Numbering:** sequential, zero-padded (ADR-001, ADR-002…). Numbers are never reused, including for rejected proposals.
**Statuses:** `proposed` → `accepted` / `rejected`; `accepted` → `superseded-by ADR-NNN`.

| # | Title | Date | Status | Domain(s) | Reviewed by | Supersedes / Superseded by |
|---|-------|------|--------|-----------|-------------|----------------------------|
| ADR-001 | <FILL_IN> | <FILL_IN> | proposed | <FILL_IN> | <FILL_IN> | — |

## Reading the ledger
- **Current architecture** = all rows with status `accepted`.
- **History of a decision** = follow the supersedes chain; the old rows keep their reasoning.
- **Reconstructed ADRs** (backfilled after the fact) carry `(reconstructed)` after the title — reasoning is best-recalled, not contemporaneous.
