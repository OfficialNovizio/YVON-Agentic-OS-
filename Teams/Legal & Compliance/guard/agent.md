---
agent: guard
department: Legal & Compliance
role: IP Protection
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# guard · agent.md

## Summary

guard owns the organisation's **IP surface** — trademark clearance, OSS license compliance, cross-right infringement triage, and the live IP asset registry. Non-leader; no identity layer.

## Purpose

Four external analyses + one internal ledger:

| Problem | Solved by |
|---|---|
| Can we adopt this proposed mark? | `ip-routing` → `clearance` (marketplace) |
| Can we ship this library / dependency list? | `ip-routing` → `oss-review` (marketplace) |
| Is this infringement — theirs on ours, or ours on theirs? | `ip-routing` → `infringement-triage` (marketplace) |
| What IP do we own, when does it renew, is it being enforced? | `ip-registry` |

## Position in the org

| Field | Value |
|---|---|
| Department | Legal & Compliance |
| Role | IP Protection |
| Leader | ❌ (comply leads) |
| Sibling agents | `comply` (Compliance Lead — built) · `scribe` (Contracts — built) · `shield` (Litigation & Disputes — pending) |

## Skill roster

### Marketplace

| Skill | Source | Status | Notes |
|---|---|---|---|
| `clearance` | [anthropics/claude-for-legal · ip-legal](https://github.com/anthropics/claude-for-legal/tree/main/ip-legal/skills/clearance) | ✅ Built · verbatim (§4.8) | Never concludes "clear" |
| `oss-review` | [anthropics/claude-for-legal · ip-legal](https://github.com/anthropics/claude-for-legal/tree/main/ip-legal/skills/oss-review) | ✅ Built · verbatim | Deployment-model-first; license-unknown = needs review |
| `infringement-triage` | [anthropics/claude-for-legal · ip-legal](https://github.com/anthropics/claude-for-legal/tree/main/ip-legal/skills/infringement-triage) | ✅ Built · verbatim | 4 modes (TM / copyright / patent / trade secret); design-patent branch separate |

All 3 share one plugin config path — bound by ONE wrapper (see below).

### Custom

| Skill | Type | Status | Notes |
|---|---|---|---|
| `ip-routing` | wrap (§4.8) | ✅ Built | ONE wrapper for all 3 marketplace skills; classifies intent + loads guard-config; jurisdiction-neutral |
| `ip-registry` | registry | ✅ Built · `registry.yaml` starts empty | TM + domain + patent + copyright + code-IP inventory; renewal calendar with alert tiers |

## Operational status

| Layer | File | State |
|---|---|---|
| Config | `operational/agent/guard-config.md` | ✅ Built · 10 sections · IP practice profile / enforcement posture / integrations / OSS policy / approval chain / escalation matrix / renewal alerts / house style |
| Skill routing | `operational/skill/guard-skill-routing.md` | ✅ Built · `# yvon-compile:` block · 5 skills · 8 precedence rules · identity_layer: false |
| Tools | `operational/tool/guard-tool-requirements.md` | ✅ Built · §14.4 table · disclaimer present · web fetch required for marketplace skills' registry lookups |
| Commands | `operational/commands/guard-commands.md` | ✅ Built · natural-language + slash + ambiguity table |
| Principles | `operational/principles/guard-principles.md` | ✅ Built · **Universal-only** (non-leader — §6.1); 12 cross-skill rules |

## Identity status

**No identity content.** guard is non-leader (§6.1). `identity/` folder present but empty (README).

## Logical status

**Touch 1 complete.** `logical/book-requirements.md` records 4 proposed scripts × 6 Path-1 authenticated sources (USPTO TMEP, WIPO, OSI, FSF, EPO/EUIPO/UKIPO fee schedules, UNIDROIT) × complete skill→script mapping × 8 currently-flagged 0.6 judgments. All Tier A candidates for the 4 named scripts. Copyright fair-use, patent claim-chart, and trade-secret case-law grounding deferred — Path 1 sources don't cover these; noted in "Still pending" for later.

## Workflow (routing, once fully compiled)

Authoritative source: `operational/skill/guard-skill-routing.md`.

| Request | Fires | Notes |
|---|---|---|
| TM clearance | `ip-routing` → binds config → `clearance` | Bounces / `[PROVISIONAL]` on missing config |
| OSS license review | `ip-routing` → `oss-review` | Deployment-model asked before classification |
| Cross-right infringement | `ip-routing` → `infringement-triage` | One triage per right; never blended |
| IP inventory / registry queries | `ip-registry` retrieve | State query |
| New IP filing / update / renew / retire | `ip-registry` mutate | Every mutation requires source URL to real record |
| Renewal calendar / upcoming | `ip-registry` calendar | Overdue auto-escalates L3 |
| Ambiguous ("add this trademark", "trademark this") | ASK — never guess | Silent picks are defects |

Escalation ladder (per `guard-config.md`):

| Level | Approver | Fixed? |
|---|---|---|
| L1 | guard itself | ✅ |
| L2 | Per config (role or named) | Operator supplies |
| L3 | `Governance/board` | ✅ Fixed by dept boundary + overdue-renewal / assertion-decision auto-triggers |

Cross-agent handoffs: `scribe` (IP terms in contracts), `comply` (IP × regulated regime), `warden` (trade-secret controls, OSS build-time enforcement), `precedent` (rulings), `board` (L3), `verification-before-completion` (inherited).

## Remaining to ship

| Item | Blocks |
|---|---|
| Compile — `node cli/skillgen.js guard` | Runtime addressability |
| Reindex — `cd rag && python3 core/chunkify.py --all` | Retrieval |
| Toonify — `node cli/toonify.js --agent guard` | CIE context injection |
| Root `CLAUDE.md` §2 row addition | Fleet-level addressability |
| `DEPARTMENT-WORKFLOW.md` | Deferred until shield built (§10) |

## Config debt (visible to operator)

`guard-config.md` currently carries `<FILL_IN>` across 10 sections. Announced per invocation per §14.7. Values are operator decisions and cannot be invented (§0.5).
