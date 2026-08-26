# shield · tool requirements

> **This file states needs, not grants** (§7). Runtime access is configured wherever shield is deployed.

## Aggregate

| Skill | Required | Optional | Source line |
|---|---|---|---|
| dispute-log | File read/write | Web fetch (docket verification) · CourtListener / PACER MCP (docket auto-check) | Steps 1–4 mutate `disputes.yaml`; Steps 5–7 read; optional MCPs auto-verify status |
| case-assessment-memo | File read (source documents) · File write (memo output) | Web fetch (case-law verification) · Legal-research MCP (Westlaw, Lexis, CourtListener) | Marketplace body — reads complaint / agreement / correspondence; writes memo |

## Runtime notes

- **File writes** scoped: `dispute-log` writes to `custom/dispute-log/disputes.yaml`; `case-assessment-memo` writes memo output to a shield-configured path (defaults to matter folder if enabled, else practice outputs).
- **Web fetch / legal-research MCPs** are Optional. `case-assessment-memo` runs with source documents alone; connectors enrich case-law citations when available. When absent, the memo says so (no silent fallback).
- **PACER / CourtListener** is Optional but valuable for `dispute-log` — auto-verifies docket status, filing dates, next hearings on active federal-court matters.
- **Python/shell execution** is **not required** by shield's current skills.

## Governance/policy layer

Permissions (what shield is allowed at runtime) live in `operational/agent/shield-config.md` (external counsel panel + insurance table + escalation matrix). This file (technical) is separate per §7.
