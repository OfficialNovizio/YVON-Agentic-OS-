---
agent: shield
department: Legal & Compliance
role: Litigation & Disputes
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# shield · agent.md

## Summary

shield owns the organisation's **dispute surface** — active litigation, arbitration, regulatory enforcement, pre-litigation demand letters, IP disputes, employment claims. Non-leader; no identity layer.

## Purpose

Two problems, one skill each:

| Problem | Solved by |
|---|---|
| What disputes are active, what's the exposure, what's due? | `dispute-log` |
| For a specific dispute, what's the claim-by-claim + damages + defense + insurance picture? | `case-assessment-memo` (marketplace) |

## Position in the org

| Field | Value |
|---|---|
| Department | Legal & Compliance |
| Role | Litigation & Disputes |
| Leader | ❌ (comply leads) |
| Sibling agents | `comply` (Compliance Lead — built) · `scribe` (Contracts — built) · `guard` (IP Protection — built) |

## Skill roster

### Marketplace

| Skill | Source | Status | Notes |
|---|---|---|---|
| `case-assessment-memo` | [HHHHHejia/awesome-legal-aiagent-skills](https://github.com/HHHHHejia/awesome-legal-aiagent-skills/tree/main/litigation-dispute-resolution/draft-case-assessment-memorandum) | ✅ Built · verbatim (§4.8) | Method-only; no plugin config path — no wrapper needed |

### Custom

| Skill | Type | Status | Notes |
|---|---|---|---|
| `dispute-log` | registry | ✅ Built · `disputes.yaml` starts empty | Live dispute portfolio · response-deadline calendar · exposure aggregate · insurance-notification audit |

## Operational status

| Layer | File | State |
|---|---|---|
| Config | `operational/agent/shield-config.md` | ✅ Built · 10 sections · insurance table / external-counsel panel / escalation matrix / always-L3 list / deadline thresholds / litigation-hold |
| Skill routing | `operational/skill/shield-skill-routing.md` | ✅ Built · `# yvon-compile:` block · 2 skills · 6 precedence rules |
| Tools | `operational/tool/shield-tool-requirements.md` | ✅ Built · §14.4 table · optional docket-MCP + legal-research MCPs called out |
| Commands | `operational/commands/shield-commands.md` | ✅ Built · natural-language + slash + ambiguity table |
| Principles | `operational/principles/shield-principles.md` | ✅ Built · **Universal-only** · 12 cross-skill rules |

## Identity status

**No identity content.** Non-leader (§6.1). `identity/` folder present but empty.

## Logical status

**Touch 1 complete.** `logical/book-requirements.md` records 4 proposed artefacts (3 `.py` scripts + 1 Route-D `.md`) × 6 Path-1 authenticated sources (Restatements, FRCP, ABA Model Rules, Negotiation Journal, Corbin) × skill→artefact mapping × 5 flagged 0.6 judgments. All Tier A candidates. State-court rules and non-US dispute frameworks flagged as per-jurisdiction pending.

## Workflow (routing, once compiled)

Authoritative source: `operational/skill/shield-skill-routing.md`.

| Request | Fires | Notes |
|---|---|---|
| Log new dispute · update · close | `dispute-log` (mutate) | Every row needs real source document; exposure from case-assessment |
| List disputes · portfolio exposure · calendar | `dispute-log` (retrieve / calendar / Step 7) | State query |
| Case-level analytical memo | `case-assessment-memo` | Feeds exposure range back to `dispute-log` |
| Ambiguous ("we got sued") | ASK — log first or assess first | Silent picks are defects |

Escalation ladder (per `shield-config.md`):

| Level | Approver | Fixed? |
|---|---|---|
| L1 | shield itself | ✅ |
| L2 | Per config (GC or role) | Operator |
| L3 | `Governance/board` | ✅ Fixed by always-L3 list + overdue-deadline auto-trigger + exposure threshold |

Cross-agent handoffs: `board` (L3), `scribe` (pattern of disputes on a template), `comply` (regulatory-enforcement disputes), `guard` (IP disputes), `warden` (data-breach / security disputes), `precedent` (closure rulings), `Finance & Treasury` (when built — settlement payments for GL), `verification-before-completion` (inherited).

## Remaining to ship

| Item | Blocks |
|---|---|
| Compile — `node cli/skillgen.js shield` | Runtime addressability |
| Reindex — `chunkify.py --all` | Retrieval |
| Toonify — `toonify.js --agent shield` | CIE context injection |
| Root `CLAUDE.md` §2 row | Fleet-level addressability |
| `Teams/Legal & Compliance/DEPARTMENT-WORKFLOW.md` | Now unblocked — all 4 agents built |

## Config debt (visible to operator)

`shield-config.md` carries `<FILL_IN>` across 10 sections. Announced per invocation per §14.7.
