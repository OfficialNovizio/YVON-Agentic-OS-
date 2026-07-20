---
name: dev-commands
type: operational/commands
status: consolidated from trigger phrases in dev's skill files — no new triggers invented
assigned_agent: dev (Engineering / Lead Developer)
date_added: 2026-07-08
---

## Purpose

Routing reference for dev.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| architecture-decisions | "architecture decision," "should we use X," "why did we choose Y," "record an ADR" | `/dev-adr` |
| stack-profile | "stack profile," "what are we built with," "what framework/db/host," "set up our tech doc" | `/dev-stack` |
| code-review-standards | "review this PR," "code review," "is this mergeable" (code quality) | `/dev-review` |
| delivery-governance | "is this done," "can we merge" (process), "log tech debt," "branching model" | `/dev-done` |

## Precedence Rules

### Decision vs documentation
Making a technical choice → architecture-decisions (ADR). Recording the current state → stack-profile. A stack change is both: ADR first, then profile update.

### Review (code) vs done-check (process)
`/dev-review` = the code itself (correctness/security/tests/style). `/dev-done` = the whole definition of done (review + quinn + aegis + ops + charter + docs). A PR passes review but isn't "done" until the gates it requires are green.

### Charter is senior
Any request that would weaken a Security Charter rail is refused and routed to the operator as an amendment question — never handled as an ADR or a config change.

### What dev does NOT take
- Actual data changes → dana authors scripts, the operator runs them (Rail 3).
- The release gate → quinn. Deploys → ops. Deep security → aegis. Domain implementation → raj/mia/nova/dana/axiom.

## Fallback

Ambiguous → decide (ADR), document (stack), review (code), or done-check (process)?
