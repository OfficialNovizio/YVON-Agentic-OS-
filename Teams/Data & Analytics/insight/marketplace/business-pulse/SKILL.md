---
name: business-pulse
description: >
  Produces a one-page cross-functional business snapshot — cash position,
  sales trend, pipeline movement, this week's commitments, urgent watch-list
  items, and the single most important thing needing attention today.
  Proactively tries every available connector and gracefully scopes to
  whatever is connected.

type: marketplace
status: copied verbatim
source: https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/business-pulse
source_raw: https://raw.githubusercontent.com/anthropics/knowledge-work-plugins/main/small-business/skills/business-pulse/SKILL.md
source_repo: anthropics/knowledge-work-plugins
author: anthropics (Anthropic PBC)
fulfills_catalog_entry: cross-functional-snapshot (Data & Analytics · insight · BI Lead)
assigned_agent: insight (Data & Analytics / BI Lead — department leader)
portable: true
date_added: 2026-07-29

tier: 3
triggers:
  - business pulse
  - how are we doing
  - weekly snapshot
  - monday brief
  - what am I missing
  - catch me up on the business
  - one-page snapshot
  - business snapshot
---

<!--
YVON selection rationale — cross-functional, cross-connector, one-page
synthesis with proactive scanning and named-record risks. Method-only, portable.
insight (as dept leader) uses this for exec dashboards; adapts SMB framing to
cross-venture / cross-dept via config.
-->

# Business Pulse

One prompt, one page. Pull live data from every connected tool, synthesize it into a single scannable brief, and surface the single most important thing to act on today. Do the work — don't ask the user to help find the data.

## Step 1 — Pull data in parallel

**Dispatch all connector calls in a single parallel batch** — see `reference/data_sources.md` for the exact tool-to-metric mapping. Do not pull serially.

Connectors to attempt simultaneously:
- **QuickBooks** — cash balance, MTD revenue, outstanding receivables, overdue invoices
- **PayPal / Square** — 7-day settlements, sales trend, failed/pending transactions
- **HubSpot** — pipeline by stage, deals moved/closed, deals gone cold, new leads
- **Google Calendar** — key meetings, deadlines, events this week and next 7 days
- **Gmail** — threads flagged urgent, customer complaints, time-sensitive requests
- **Slack / Teams** — urgent internal signals, threads needing owner attention
- **Intercom / Zendesk** — open tickets, escalations (if connected)
- **Shopify / Square** — fulfillment issues (if connected)

If a connector errors, record internally and move on. Never block the pulse.

## Step 2 — Compute metrics

Read `reference/thresholds.md` for 🟢/🟡/🔴 cutoffs.

- **AR aging** — open invoices by days-since-due (0–30, 31–60, 61+)
- **Pipeline coverage** — weighted pipeline ÷ monthly revenue target
- **Revenue trend** — MTD vs prior month; 7-day vs prior 7-day

Mark n/a where source returned nothing.

## Step 3 — Flag risks proactively

Every risk names a specific record + next step. "Some overdue invoices" is useless; "$3,400 from Acme, 47 days overdue, no response since Mar 12" is actionable.

## Step 4 — Compose the output

Use `reference/output_template.md`. Include only sections with real data. Numbers lead, words follow. Every number carries a delta. No filler.

## Step 5 — Offer share once

Save-as-file or Slack-post — ask once, respect the answer.

## Scope variants

- **"Just cash"** → Cash + AR risks only
- **"Pipeline only"** → Pipeline + stalled-deal risks
- **"Watch list"** → Watch List + all risks
- **"Quick snapshot"** → TL;DR + #1 Priority only

## What not to do

- Do not ask permission before pulling data.
- Do not invent or estimate. n/a is honest.
- Do not skip the delta.
- Do not surface connector errors mid-pulse. Log to appendix.
