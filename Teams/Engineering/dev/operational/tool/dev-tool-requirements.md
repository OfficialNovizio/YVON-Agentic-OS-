---
name: dev-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: dev (Engineering / Lead Developer)
date_added: 2026-07-08
---

## Purpose

What each of dev's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step. **All external-tool use is subject to the Security Charter: plan-lock (Rail 1) and sandbox+egress-allowlist (Rail 2).** This table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| architecture-decisions | File read/append (ADR ledger) | — | Log phase |
| stack-profile | File read/write (the profile) | Repo read for drift detection | Load + drift |
| code-review-standards | File read (diffs, stack conventions) | Repo/PR connector; lint runners (sandboxed) | Review phases |
| delivery-governance | File read/append (DoD checks, tech-debt register) | CI status readback (sandboxed) | Done check |

## Notes

- dev's own footprint is light (documents + reviews); it does not execute code or touch data.
- **Rail 3 reminder**: dev never runs data changes; where a decision implies one, dana authors the script and the operator runs it.
- Any repo/CI/lint connector runs inside the sandbox with egress allowlisted; a lint runner that phones home fails closed.
- No web search (OS-level layer).

## MCP Marketplace Tools (added 2026-07-14)

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Ponytail** | [github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — MIT | Forces AI to write minimal code: 54% less code, 20% cheaper, 27% faster. Lazy-senior-dev decision ladder before every code generation. Commands: /ponytail lite\|full\|ultra, /ponytail-review, /ponytail-audit | ✅ YES — dev's "boring beats novel" principle aligns directly with ponytail's philosophy. Use on every code review for over-engineering detection.

## How to Apply

File read/write on the ledger/profile/DoD paths is the floor; every external tool is plan-locked and sandboxed.
