# ADR Ledger — YVON Engine

> Append-only index of all ADRs. One row per ADR; rows are never deleted. Status changes
> (accepted → superseded) update the row and add the superseding ADR's number. Individual ADRs
> follow `Teams/Engineering/dev/custom/architecture-decisions/assets/adr-template.md` and live
> alongside this index in `system-harness/adr/`.

**Numbering:** sequential, zero-padded (ADR-001, ADR-002…). Numbers are never reused, including
for rejected proposals.
**Statuses:** `proposed` → `accepted` / `rejected`; `accepted` → `superseded-by ADR-NNN`.

| # | Title | Date | Status | Domain(s) | Reviewed by | Supersedes / Superseded by |
|---|-------|------|--------|-----------|-------------|----------------------------|
| ADR-001 | Episodic/semantic memory backend — MemPalace, staged install (replaces turbovec) | 2026-08-09 | accepted | data, engineering | dana (data), dev (leader) | — |
| ADR-002 | MemPalace venture-repo mining — narrow, ephemeral exception to ADR-001's Phase 2 gate | 2026-08-12 | accepted | data, engineering | operator | extends ADR-001 |

## Reading the ledger
- **Current architecture** = all rows with status `accepted`.
- **History of a decision** = follow the supersedes chain; the old rows keep their reasoning.
- **Reconstructed ADRs** (backfilled after the fact) carry `(reconstructed)` after the title —
  reasoning is best-recalled, not contemporaneous.
