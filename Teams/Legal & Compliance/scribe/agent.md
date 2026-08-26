---
agent: scribe
department: Legal & Compliance
role: Contracts
leader: false                # comply leads this department (playbook §6.1)
identity_layer: false
status: built
last_updated: 2026-07-29
---

# scribe · agent.md

## Summary

scribe owns the organisation's **contract surface** — pre-signing review, template ownership, and post-signing obligation tracking. Sits in Legal & Compliance under `comply`'s department leadership. Non-leader; no identity layer.

## Purpose

Three problems, one skill each on the review/library/ledger axis, plus one wrapper that binds them together:

| Problem | Solved by |
|---|---|
| An inbound counterparty contract needs to be reviewed against our positions | `contract-review-routing` → `vendor-agreement-review` |
| Our own template library needs to be versioned, classified, and kept in sync | `contract-library` |
| Signed contracts create ongoing obligations we can't afford to forget | `obligation-extraction` |

## Position in the org

| Field | Value |
|---|---|
| Department | Legal & Compliance |
| Role | Contracts |
| Leader | ❌ (see `comply` — department leader) |
| Sibling agents | `comply` (Compliance Lead — leader) · `guard` (IP Protection) · `shield` (Litigation & Disputes) |
| Department status | 4 agents defined; scribe is the first fully built |

## Skill roster

### Marketplace

| Skill | Source | Status | Notes |
|---|---|---|---|
| `vendor-agreement-review` | [anthropics/claude-for-legal · commercial-legal](https://github.com/anthropics/claude-for-legal/tree/main/commercial-legal/skills/vendor-agreement-review) | ✅ Built · verbatim (§4.8) | `user-invocable: false` — reached only via `contract-review-routing` |

### Custom

| Skill | Type | Status | Notes |
|---|---|---|---|
| `contract-review-routing` | wrap (§4.8) | ✅ Built | Detects agreement type + side; binds `scribe-config.md` to marketplace skill's playbook path |
| `contract-library` | registry | ✅ Built | Register / classify (SMB 8-category schema) / version / publish / retire / retrieve · docx dependency |
| `obligation-extraction` | ledger + reasoning-based extraction | ✅ Built (extraction is LLM-based, reasoning-flagged per §0.6) | 10-type taxonomy; operator confirms every low-confidence candidate before ledger commit; touch-2 will replace the LLM step with `Shared OS/logical/contract_obligation_taxonomy.py` (Adams & Cramer + UNIDROIT), removing the reasoning flag |

## Operational status

| Layer | File | State |
|---|---|---|
| Config | `operational/agent/scribe-config.md` | ✅ Built · 116 `<FILL_IN>`s (config debt announced per §14.7) |
| Skill routing | `operational/skill/scribe-skill-routing.md` | ✅ Built · `# yvon-compile:` block parses cleanly · 4 skills · 6 precedence rules |
| Tools | `operational/tool/scribe-tool-requirements.md` | ✅ Built · §14.4 table format · disclaimer present |
| Commands | `operational/commands/scribe-commands.md` | ✅ Built · natural-language triggers + slash shortcuts + ambiguity table |
| Principles | `operational/principles/scribe-principles.md` | ✅ Built · universal-only (10 cross-skill rules) · no identity layer |

## Identity status

**No identity content.** scribe is non-leader (§6.1). `identity/` folder present but empty by convention.

## Logical status

**Touch 1 complete.** `logical/book-requirements.md` records 3 candidate scripts × 6 authenticated Path-1 books × complete skill→script mapping × 7 currently-flagged 0.6 judgments. All Tier A candidates (§8.4). Touch 2 (extraction) pending — no scripts in `Shared OS/logical/` yet for scribe's domain.

## Workflow (routing, once fully compiled)

Authoritative source: `operational/skill/scribe-skill-routing.md` (§14.5 compile block). Summary here for quick reference.

| Request | Fires | Notes |
|---|---|---|
| Contract review (pre-signing) | `contract-review-routing` → binds config → hands to `vendor-agreement-review` | Bounces or `[PROVISIONAL]` if `scribe-config.md` incomplete |
| Template CRUD | `contract-library` | Docx dependency; `index.md` state; publish/retire enforce one active per slug+side+jurisdiction |
| Post-signing obligation tracking | `obligation-extraction` → LLM extraction (reasoning-flagged) → operator review → ledger commit | Every candidate low-confidence; operator confirms; history immutable. Extraction step becomes book-grounded (Shared OS/logical/) on touch-2. |
| Ambiguous ("add this contract", "this contract" no verb) | ASK — never guess | Silent picks are defects (§0.5) |

Escalation ladder (per `scribe-config.md` Escalation matrix):

| Level | Approver | Fixed? |
|---|---|---|
| L1 | Per config (role or named) | Operator supplies |
| L2 | Per config (role or named) | Operator supplies |
| L3 | `Governance/board` | ✅ Fixed by dept boundary ruling |

Cross-agent handoffs: `Governance/precedent` (ruling consistency), `Cybersecurity/warden` (control commitments), `Governance/board` (L3), `Shared OS/docx` + `verification-before-completion` (inherited deps).

## Remaining to ship

| Item | Blocks |
|---|---|
| Compile — `node cli/skillgen.js scribe` (zero unresolved placeholders check) | Runtime addressability |
| Reindex — `cd rag && python3 core/chunkify.py --all` | Retrieval |
| Toonify — `node cli/toonify.js --agent scribe` | CIE context injection (§0.8) |
| Root `CLAUDE.md` §2 routing row | Fleet-level addressability (§14.9) |
| Department `DEPARTMENT-WORKFLOW.md` | Deferred until all 4 dept agents built (§10) |

## Config debt (visible to operator)

`scribe-config.md` currently carries **116 `<FILL_IN>` fields** across 8 sections. Every unfilled field is announced on every skill invocation per §14.7 until filled or marked `n/a` with a one-line reason. The debt is intentional: values are operator decisions and cannot be invented (§0.5).
