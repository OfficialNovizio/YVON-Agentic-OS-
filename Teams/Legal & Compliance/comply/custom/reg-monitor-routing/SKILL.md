---
name: reg-monitor-routing
type: custom
status: built from scratch
assigned_agent: comply (Legal & Compliance / Compliance Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "comply's entry point for regulatory-monitoring requests — loads watchlist / materiality / feeds from comply-config.md, binds them to reg-feed-watcher's plugin config path, and hands off. Bounces if config has placeholders; runs [PROVISIONAL] on operator opt-in."
triggers:
  - check the feeds
  - what's new
  - regulatory update
  - reg update
  - watch the regulators
  - anything new from the regulators
  - regulatory feed check
  - has anything moved
---

# Regulatory Monitor Routing

## Introduction

Built from scratch on 2026-07-29 as comply's single entry point for regulatory-monitoring requests. It exists because the marketplace skill comply adopted — `reg-feed-watcher`, verbatim from `anthropics/claude-for-legal` — reads its watchlist, materiality threshold, and feed configuration from a plugin config path that does not exist in YVON:

```
~/.claude/plugins/config/claude-for-legal/regulatory-legal/CLAUDE.md
```

Under playbook §4.8's "Wraps / Custom + Marketplace" case, the marketplace skill is preserved verbatim; the plumbing that binds it to YVON's config layer lives here.

## Purpose

Take an inbound regulatory-monitoring request, do the two things the marketplace skill assumes are already done, and hand off:

1. Load the watchlist, materiality tiers, feed configuration, and digest output path from `operational/agent/comply-config.md`.
2. Resolve the correct feed set for the operator's declared jurisdictions (non-US supported — §0.4b).

After the handoff, `reg-feed-watcher`'s own workflow runs unaltered: coverage check → pull → classify → enrich → digest.

## When to Use

- Operator says "check the feeds", "what's new", "regulatory update", "watch the regulators", "anything new from the regulators", "regulatory feed check", "has anything moved".
- Scheduled invocation (a scheduled task set up per playbook scheduled-tasks pattern) fires a periodic check.
- Operator manually pastes a regulatory development for classification.

Do NOT use for:

- Updating the obligation matrix — that's `obligation-register`.
- Assessing whether a *feature* triggers a regime — that's `regulated-activity-readiness`.
- Answering "are we compliant with X?" — that's `obligation-register` retrieval, not a feed check.

## Structure / Protocol

```
1. INTAKE      confirm the request is a feed check, not a compliance question
2. CONFIG      load comply-config.md; if missing/placeholder → BOUNCE
3. RESOLVE     match watchlist regulators to their feed URLs (federal-register slug OR direct RSS)
4. BIND        pass resolved (watchlist · materiality · feeds · output path) to marketplace skill
5. HANDOFF     invoke reg-feed-watcher with bound context
6. RETURN      surface the digest to operator with the preamble/postamble scribe-style
```

## Instructions

### Step 1: Intake

Confirm the operator is asking for a feed check, not a compliance question about an existing obligation. If ambiguous ("are we compliant?"), hand off to `obligation-register` instead — do not run a feed check to answer a state question.

### Step 2: Load comply-config

Read `Teams/Legal & Compliance/comply/operational/agent/comply-config.md`. The following sections must be present and non-placeholder:

- `## Watchlist` — at least one regulator declared
- `## Materiality tiers` — thresholds for "always material" / "review-worthy" / "FYI" / "skip"
- `## Feed configuration` — for each watchlist regulator: source type (federal-register-slug / RSS / paid-MCP) + URL/identifier
- `## Digest output path` — where to write the digest (or `chat only`)
- `## Comment tracker` — enabled? default owner if so
- `## Jurisdictions in scope` — non-US supported (playbook §0.4b — no venture/jurisdiction hardcode)

If any required section is `<FILL_IN>` or missing, bounce with the two-choice pattern:

> comply's config hasn't been filled in yet — that's what tells this skill which regulators to watch, how to classify materiality, and where to write digests.
>
> **Two choices:**
> - Fill the missing sections in `operational/agent/comply-config.md` first, then re-run. I can list which sections are placeholder.
> - Say **"provisional"** and I'll run against a minimum-viable default (empty watchlist → runs Federal Register API only for a US-federal quick scan) with every finding tagged `[PROVISIONAL — configure comply-config.md for tailored output]`.

Do not proceed silently on missing config.

### Step 3: Resolve feeds

For each regulator in the watchlist:

- If a Federal Register API slug is declared, use it (US federal regulators).
- If a direct RSS/JSON URL is declared, use it (US state, EU, UK, international, sector regulators).
- If a paid-MCP identifier is declared and the MCP is connected, add to the query set.

If a watchlist regulator has no declared source, announce it once in the preamble and skip that regulator for this run (do not guess a slug — playbook §0.5).

### Step 4: Bind context

Construct the context the marketplace skill expects. Instead of the plugin config path, pass the resolved values inline as the "loaded configuration":

- Resolved watchlist with per-regulator source
- Materiality tiers (four levels)
- Feed configuration (Tier 1/2/3 as configured)
- Digest output path (or `chat only`)
- Comment-tracker enabled/disabled + default owner
- Jurisdictions in scope

### Step 5: Handoff

Invoke `marketplace/reg-feed-watcher/SKILL.md` with the bound context. The marketplace skill's workflow runs unaltered.

### Step 6: Return

Return the marketplace skill's digest to the operator with:

- **Preamble** (before the digest): `Feed check for [comma-separated jurisdictions]. Watchlist: [N] regulators. Config loaded: [date_modified of comply-config.md]. [PROVISIONAL if applicable].`
- **Postamble**: pass through the marketplace skill's next-steps decision tree; do not duplicate.

## Output Format

The marketplace skill owns the digest format. This skill adds only the preamble in Step 6 and does not modify the digest body.

If the run bounces at Step 2, the output is the bounce message alone — no digest.

## Principles

- **No hardcoded jurisdiction.** Watchlist, feeds, and materiality all come from config. Federal-Register-first is a marketplace-skill implementation detail, not a YVON default (playbook §0.4b).
- **No invented feed URLs.** If a regulator has no declared source, skip it in-run and announce it; never guess a slug or URL (playbook §0.5).
- **No silent supplement on thin returns.** Inherited from marketplace skill — surface what was found; ask before broadening.
- **Every citation carries a provenance tag.** Inherited — `[Federal Register]`, `[<regulator> RSS]`, `[secondary source]`, `[web search — verify]`, `[model knowledge — verify]`, `[user provided]`. Never strip or collapse.
- **Do not alter the marketplace skill.** All customisation goes through `comply-config.md` values consumed here.

## Fallback

| Failure mode | Response |
|---|---|
| Config file missing entirely | Bounce (Step 2 pattern) |
| Config file present but partial | List missing sections, then bounce |
| Watchlist has entries with no declared source | Announce in preamble, skip those regulators, continue |
| Marketplace skill returns nothing | Pass through — "All quiet" is a valid output |
| Marketplace skill errors mid-pull | Surface the error verbatim; do not paper over |

## Boundaries with Other Skills

- **`reg-feed-watcher` (marketplace, this agent)** — this skill is its only entry point in comply's build. The marketplace skill assumes plugin-config semantics; the wrapper is what makes it YVON-portable.
- **`obligation-register` (custom, this agent)** — no direct handoff. Feed checks *discover* new obligations; the register *tracks* them. When a feed item classifies as "always material" and creates a new obligation, this skill announces it and the operator commits to the register via `obligation-register`.
- **`regulated-activity-readiness` (custom, this agent)** — no direct handoff. Readiness checks are triggered by a *proposed activity*, not by a *feed pull*.
- **`Governance/precedent`** — new regulatory item creates a new internal ruling → `precedent` for consistency.
- **`Governance/board`** — L3 escalation per `comply-config.md` for material items above threshold.
- **`Cybersecurity/warden`** — regulatory obligation requiring an internal control → hand off to `warden` for control design.
- **`scribe` (Legal & Compliance)** — reg-item's contract impact (new contractual disclosure required, new DPA clause, etc.) → `scribe` for template update.
- **Shared OS: `verification-before-completion`** — inherited before the digest returns to the operator.

## Tool declaration (technical, not permission)

Per playbook §7 (`operational/tool/`), this list declares *technical needs*, not permission grants.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| reg-monitor-routing | File read (config) · web fetch (Federal Register API + RSS pulls delegated to marketplace skill) | Paid regulatory-feed MCP · CourtListener MCP | Step 2 (config read); Step 5 (marketplace handoff uses web tools) |
