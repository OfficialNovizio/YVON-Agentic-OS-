---
agent: comply
department: Legal & Compliance
role: Compliance Lead
leader: true                     # department leader (playbook §6.1)
identity_layer: true
persona: brandeis-disclosure
status: built
last_updated: 2026-07-29
---

# comply · agent.md

## Summary

comply owns the organisation's **external regulatory surface** — regulatory-feed monitoring, live obligation register, and pre-launch readiness checks against licensing / registration / notification regimes. **Department leader for Legal & Compliance.** Identity persona: Louis Brandeis (public-domain writings, Path 1).

## Purpose

Four problems, four skills:

| Problem | Solved by |
|---|---|
| Regulators moved — did anything material happen? | `reg-monitor-routing` → `reg-feed-watcher` |
| What obligations are we currently subject to, and are we meeting them? | `obligation-register` |
| Does this proposed feature or activity trigger a regime we're not ready for? | `regulated-activity-readiness` |

## Position in the org

| Field | Value |
|---|---|
| Department | Legal & Compliance |
| Role | Compliance Lead |
| Leader | ✅ department leader |
| Sibling agents | `scribe` (Contracts — built) · `guard` (IP Protection — pending) · `shield` (Litigation & Disputes — pending) |
| Persona | Louis Brandeis — Path 1 all-free build; Heineman deferred to touch-2 if operator supplies book |

## Skill roster

### Marketplace

| Skill | Source | Status | Notes |
|---|---|---|---|
| `reg-feed-watcher` | [anthropics/claude-for-legal · regulatory-legal](https://github.com/anthropics/claude-for-legal/tree/main/regulatory-legal/skills/reg-feed-watcher) | ✅ Built · verbatim (§4.8) | `user-invocable` effectively false in YVON — reached via `reg-monitor-routing` |

### Custom

| Skill | Type | Status | Notes |
|---|---|---|---|
| `reg-monitor-routing` | wrap (§4.8) | ✅ Built | Binds `comply-config.md` to marketplace skill's plugin config path; jurisdiction-neutral |
| `obligation-register` | registry | ✅ Built · `register.yaml` starts empty | Live matrix: venture × regime × jurisdiction × obligation; genericised from `vyon-compliance-matrix` |
| `regulated-activity-readiness` | gate | ✅ Built | Pre-launch check; verdicts CLEAR / CONDITIONAL / BLOCKED; auto-writes to `obligation-register` on non-CLEAR |

## Operational status

| Layer | File | State |
|---|---|---|
| Config | `operational/agent/comply-config.md` | ✅ Built · 11 sections · many `<FILL_IN>`s (config debt announced per §14.7) |
| Skill routing | `operational/skill/comply-skill-routing.md` | ✅ Built · `# yvon-compile:` block parses · 4 skills · 6 precedence rules · identity_layer: true |
| Tools | `operational/tool/comply-tool-requirements.md` | ✅ Built · §14.4 table format · disclaimer present |
| Commands | `operational/commands/comply-commands.md` | ✅ Built · natural-language + slash + ambiguity table |
| Principles | `operational/principles/comply-principles.md` | ✅ Built · **Universal + Identity-flavoured** (leader — §6.1); 11 universal rules + 4 Brandeis-derived operating principles |

## Identity status

**Persona: Louis Brandeis (`identity/brandeis-disclosure.md`).** Public-domain sources (Project Gutenberg + Internet Archive + US Reports), whole-book access (§8.10), Tier A on frontmatter, `## Core traits` heading present for §14.6 compile. Known blind spots (bigness-bias, US-centric, judicial-restraint-mis-applied) called out at bottom of persona file. Heineman deferred as touch-2 enrichment.

## Logical status

**Touch 1 complete.** `logical/book-requirements.md` records 4 candidate artefacts (3 `.py` scripts + 1 Route-D `.md` per §8.9) × 6 authenticated Path-1 sources (UNIDROIT, USPTO TMEP, WIPO, ABA Model Rules, Brandeis writings) × complete skill→artefact mapping × 5 currently-flagged 0.6 judgments. All Tier A candidates. Touch 2 (extraction) pending.

## Workflow (routing, once fully compiled)

Authoritative source: `operational/skill/comply-skill-routing.md`. Summary here for quick reference.

| Request | Fires | Notes |
|---|---|---|
| Feed check | `reg-monitor-routing` → binds config → hands to `reg-feed-watcher` | Bounces / `[PROVISIONAL]` on missing config |
| "Are we compliant with X?" | `obligation-register` (retrieve) | State query, not feed pull |
| "Register / attest / retire this obligation" | `obligation-register` (mutate) | Attestation is a signed act by named human |
| "Can we ship this?" · "does X trigger a regime?" | `regulated-activity-readiness` | Verdict CLEAR / CONDITIONAL / BLOCKED; auto-registers non-CLEAR obligations |
| Ambiguous ("compliance", "this contract", state vs mutation) | ASK — never guess | Silent picks are defects |

Escalation ladder (per `comply-config.md` Escalation matrix):

| Level | Approver | Fixed? |
|---|---|---|
| L1 | comply itself | ✅ |
| L2 | Per config (role or named) | Operator supplies |
| L3 | `Governance/board` | ✅ Fixed by dept boundary ruling + always-L3 category list |

Cross-agent handoffs: `Cybersecurity/warden` (controls), `scribe` (contract clauses), `Governance/precedent` (rulings), `Governance/board` (L3), `meta` (AI-related regimes), `Shared OS/verification-before-completion` (inherited).

## Remaining to ship

| Item | Blocks |
|---|---|
| Compile — `node cli/skillgen.js comply` | Runtime addressability |
| Reindex — `cd rag && python3 core/chunkify.py --all` | Retrieval |
| Toonify — `node cli/toonify.js --agent comply` | CIE context injection (§0.8) |
| Root `CLAUDE.md` §2 row update — swap the dept placeholder note for comply's actual routing row | Fleet-level addressability |
| `DEPARTMENT-WORKFLOW.md` | Deferred until all 4 dept agents built (§10) |

## Config debt (visible to operator)

`comply-config.md` currently carries many `<FILL_IN>` fields across 11 sections. Announced per skill invocation (§14.7) until filled or marked `n/a`. The debt is intentional: values are operator decisions and cannot be invented (§0.5).
