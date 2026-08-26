---
name: ip-routing
type: custom
status: built from scratch
assigned_agent: guard (Legal & Compliance / IP Protection)
portable: true
date_added: 2026-07-29
tier: 3
description: "guard's single entry point for IP-legal requests — routes to clearance / oss-review / infringement-triage based on intent, loads shared config from guard-config.md, binds it to the marketplace skills' common plugin config path. Bounces or [PROVISIONAL] on missing config."
triggers:
  - clearance check
  - trademark clearance
  - can we use this mark
  - oss review
  - open source license check
  - can we ship this library
  - infringement check
  - are they infringing our IP
  - are we infringing their IP
  - knockoff surfaced
  - copycat check
---

# IP Routing

## Introduction

Built from scratch on 2026-07-29 as guard's single entry point for all three of its IP-legal marketplace skills. It exists because all three marketplace skills — `clearance`, `oss-review`, and `infringement-triage`, verbatim from `anthropics/claude-for-legal` — read their configuration from the *same* plugin config path that does not exist in YVON:

```
~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md
```

One wrapper serves all three (unlike scribe / comply, which each needed their own wrapper — the IP-legal plugin shares one config across its skills).

Under playbook §4.8's "Wraps / Custom + Marketplace" case, the marketplace skills are preserved verbatim; the plumbing that binds them to YVON's config layer lives here.

## Purpose

Take an inbound IP-legal request, do three things the marketplace skills assume are already done, and hand off:

1. **Detect intent** — trademark clearance / OSS license review / infringement triage.
2. **Load shared config** — jurisdictions, integrations, enforcement posture, decision posture, work-product header from `operational/agent/guard-config.md`.
3. **Bind context** and hand off to the right marketplace skill.

After the handoff, the marketplace skill's own workflow runs unaltered.

## When to Use

- Any of the marketplace skills' triggers (see the `triggers:` frontmatter list).
- Ambiguous IP request that could match more than one marketplace skill — this skill classifies and routes.

Do NOT use for:

- IP-registry maintenance — that's `ip-registry` (guard's other custom skill).
- Cross-agent IP handoffs (e.g., trademarks in contracts) — that's `scribe`'s domain via the boundary.

## Structure / Protocol

```
1. INTAKE      confirm intent is one of the three IP-legal marketplace scopes
2. CLASSIFY    decide: clearance / oss-review / infringement-triage
3. CONFIG      load guard-config.md; if missing/placeholder → BOUNCE
4. BIND        pass resolved config to the selected marketplace skill
5. HANDOFF     invoke the marketplace skill with bound context
6. RETURN      surface the memo with a preamble and passthrough postamble
```

## Instructions

### Step 1: Intake

Confirm the request is IP-legal (trademark availability, OSS compliance, or infringement) and not something else (contract review = `scribe`, obligation status = `comply`, IP-registry maintenance = `ip-registry`).

### Step 2: Classify intent

| Signals | Fires |
|---|---|
| Proposed mark; goods/services; "can we use this name"; knockout question | `clearance` |
| Dependency list, package name, SBOM, "can we ship this library", copyleft, AGPL | `oss-review` |
| Alleged infringement (either direction); "are they/we infringing"; C&D question; competitor knockoff | `infringement-triage` |
| Ambiguous / signals span two | ASK the operator; do not guess |

If more than one marketplace skill is triggered by the facts (e.g., competitor's product uses our logo AND is a near-copy — trademark + patent), run the wrapper twice sequentially, one per right; do not blend outputs.

### Step 3: Load guard-config

Read `Teams/Legal & Compliance/guard/operational/agent/guard-config.md`. Required sections:

- `## Who's using this` (role — lawyer / non-lawyer / paralegal)
- `## IP practice profile` (registered-in, enforce-where jurisdictions)
- `## Enforcement posture` (aggressive / measured / conservative)
- `## Available integrations` (Solve Intelligence, CourtListener, Descrybe — for `clearance`; ticketing MCP for `oss-review`)
- `## Decision posture on subjective legal calls`
- `## OSS policy` (if uploaded — for `oss-review`)
- `## Approval chain` (per letter type — for `infringement-triage` handoffs)
- `## Work-product header` (per role)

If any required section is `<FILL_IN>` or missing, bounce with the standard two-choice pattern (configure or run `[PROVISIONAL]` with every finding tagged).

### Step 4: Bind context

Construct the context the marketplace skill expects. Instead of the plugin config path, pass the resolved values inline as the "loaded practice profile."

### Step 5: Handoff

Invoke the selected marketplace skill (`marketplace/clearance/SKILL.md`, `marketplace/oss-review/SKILL.md`, or `marketplace/infringement-triage/SKILL.md`) with the bound context. Marketplace skill runs unaltered.

### Step 6: Return

Return the marketplace skill's memo with:

- **Preamble**: `Routed to: [skill]. Intent: [intent tag]. Config loaded: [date_modified of guard-config.md]. [PROVISIONAL if applicable].`
- **Postamble**: pass through the marketplace skill's decision tree.

## Output Format

The marketplace skill owns the memo format. This skill adds only the preamble in Step 6.

If the run bounces at Step 3, the output is the bounce message alone — no memo.

## Principles

- **No hardcoded jurisdiction.** All jurisdictions, integrations, and posture come from `guard-config.md` (playbook §0.4b).
- **No silent guess on ambiguity.** If facts could trigger more than one marketplace skill, ask (playbook §0.5).
- **No proceeding silently on missing config.** Bounce or `[PROVISIONAL]`.
- **Do not alter the marketplace skills.** All three are copied verbatim per §4.8. Customisation flows through `guard-config.md`.
- **Every citation carries a provenance tag.** Inherited from all three marketplace skills.

## Fallback

| Failure mode | Response |
|---|---|
| Intent ambiguous | Ask the operator; list the 2–3 candidate marketplace skills |
| Multiple rights implicated (e.g., trademark + patent) | Run wrapper twice, one per right; do not blend |
| Config file missing | Bounce (Step 3 pattern) |
| Config partial | List missing sections, then bounce |
| Marketplace skill errors | Surface the error verbatim |

## Boundaries with Other Skills

- **`clearance` / `oss-review` / `infringement-triage` (marketplace, this agent)** — one-way: routing binds config and hands off; the marketplace skills return memos.
- **`ip-registry` (custom, this agent)** — no direct handoff. Clearance results and infringement findings are *inputs* to registry updates; the operator commits them via `ip-registry` after the marketplace memo is reviewed.
- **`scribe` (Legal & Compliance)** — IP terms in contracts (assignment / license / warranty / indemnity) route to `scribe` for template + review; guard identifies, scribe implements.
- **`comply` (Legal & Compliance)** — regulatory regimes touching IP (data protection intersecting with IP, export controls on encryption) are `comply`'s domain; guard hands off to `comply` when an IP question also triggers a regime.
- **`Cybersecurity/warden`** — IP risks that require internal controls (secret classification, code repo access, DLP for source code) route to `warden` for control design.
- **`Governance/board`** — L3 escalation per `guard-config.md` Escalation matrix; assertion decisions (C&D, litigation) with high stakes.
- **Shared OS: `verification-before-completion`** — inherited before any memo returns to operator.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| ip-routing | File read (config) | Web fetch (delegated to marketplace skills for prior-art / clearance / license text) · TM search MCP (Solve Intelligence / Descrybe) · CourtListener MCP · Ticketing MCP (Jira / Linear / Asana) | Step 3 (config); Step 5 (marketplace handoff uses these) |
