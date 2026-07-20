# YVON Dashboard Architecture — Two-Tier Design (v2)

**Status:** Reviewed by Engineering agents against dev's 8 principles + quinn's charter  
**Date:** 2026-07-16  
**Pipeline verified:** Live 5-query test passed with fixes applied  
**Method:** Pipeline executed → agents consulted → architecture designed from real data

---

## DESIGN CONSTRAINTS (from dev's principles)

| Principle | Requirement | How Dashboard Meets It |
|-----------|------------|----------------------|
| P4 — "Done is a checked list" | Every feature has a verification gate | Each dashboard card has a data-source check + freshness check |
| P5 — "No unowned failure modes" | Every failure has an owner | Each data source has an owner agent; failures escalate to operator |
| P6 — "Measure, don't guess" | Numbers from pipeline, not assumptions | Dashboard calls bridge.py `--mode dashboard` which runs real pipeline queries |
| P7 — "Charter-clean" | Plan-locked, sandboxed, read-only | Dashboard queries are read-only; no agent-run DB changes; plan-locked per tenant |

## QUINN CHARTER ENFORCEMENT (applied to dashboard)

| Rail | Requirement | Dashboard Enforcement |
|------|------------|----------------------|
| Rail 1 (Plan-Lock) | Every dashboard query is a locked plan | Dashboard fetches from bridge.py only; no ad-hoc queries |
| Rail 2 (Sandbox) | Data sources are allowlisted | Dashboard API only serves from validated modules (field_monitor, feedback, harness trace) |
| Rail 3 (No Destructive DB) | Dashboard never writes | Read-only API; all "Add Brand" writes go through scaffold.py with plan-lock |

---

## TIER 1: YVON MASTER DASHBOARD (operators)

### Data Sources (real pipeline output)

| Card | Data Source | Update | Owner |
|------|------------|--------|-------|
| Fleet Health | `field_monitor.py` — drift signals per agent | Hourly | gauge (agent-quality-scorecard) |
| RAG Health | `bridge.py --mode dashboard/rag` — savings %, quality, test count | Daily | field_monitor |
| Graph Vitals | `src/graphs/builder.ts` — nodes, edges, communities | Daily | dev (ADRs record changes) |
| Self-Improver | `self_improver.py` — improvement_log.jsonl | Weekly | self_improver |
| Connected Brands | Per-brand aggregation from field_monitor | Hourly | board (governance gate) |
| Alerts | Harness quarantine log + field_monitor degradation | Real-time | sentinel (bypass detection) |

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  YVON MASTER — v1.3.0                           [⚙️]  [🔔 2 alerts] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────┐  │
│  │ FLEET HEALTH │  RAG HEALTH  │  GRAPH VITALS│  SELF-IMPROVER   │  │
│  │              │              │              │                  │  │
│  │ 46/46 agents │ Pipeline: 5/5│ 1,482 nodes  │ Last: 2026-07-16 │  │
│  │ 0 incidents  │ 73% avg save │ 3,840 edges  │ 4 proposals held │  │
│  │ 7 depts green│ Harness: 1.1 │ 12 commun.   │ 0 auto-deployed  │  │
│  │ Drift: none  │ conflicts/run│ Cohesion:0.87│ Next: Sun 00:00  │  │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  CONNECTED BRANDS                                    [+ ADD] │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐│    │
│  │  │ NOVIZIO      │  │ HOURBOUR     │  │ BOUTIQUE A           ││    │
│  │  │ Owned Brand   │  │ Owned Brand  │  │ AgentX · Growth      ││    │
│  │  │ Health: 82%   │  │ Health: 93%  │  │ Health: 78%          ││    │
│  │  │ 3 depts       │  │ 2 depts      │  │ 2 depts: Brand+Prod ││    │
│  │  │ 11 agents     │  │ 8 agents     │  │ IG ✅ Shopify ✅     ││    │
│  │  │ [$ Open →]    │  │ [$ Open →]   │  │ [$ Open →]           ││    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘│    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  RECENT ALERTS                               [Mark All Read] │    │
│  │  ⚠️ Financial Analysis — avg 26 conflicts/query (threshold)  │    │
│  │  ⚠️ Engineering Debug — quality 0.00 (authority fix applied) │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ OBSIDIAN GRAPH PREVIEW      │  │ PIPELINE LIVE TEST          │   │
│  │ Communities: 12             │  │ Last run: 5/5 queries ok    │   │
│  │ Largest: Brand Studio (259) │  │ Legal: 0→8 chunks (fixed)  │   │
│  │ Most connected: Shared OS   │  │ Finance: 73% save, 0.27 Q  │   │
│  │ [Open Vault →]              │  │ [Re-run Test →]             │   │
│  └─────────────────────────────┘  └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Health Score Formula

```
Brand Health = (agent_uptime × 0.3) + (content_quality × 0.25) +
               (integration_health × 0.25) + (pipeline_savings × 0.2)

agent_uptime:       % of agents without degradation alerts
content_quality:    avg grounded score from verifier.py (last 7 days)
integration_health: % of connectors with status=active
pipeline_savings:   savings_pct / 100 (capped at 1.0)
```

### Add Brand Flow (Rail 3 safe — read-only until operator approves)

```
[+ ADD BRAND] clicked
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  ADD NEW BRAND                                       │
│                                                      │
│  Brand Name: [________________]                      │
│  Industry:   [Fashion Retail ▾]                      │
│                                                      │
│  Departments needed:                                 │
│  ☑ Social Media (Brand Studio: spark, lena, pulse)  │
│  ☐ Brand Design (Brand Studio: atlas, pixel, muse)  │
│  ☐ E-Commerce (Product: price, spec, metric)         │
│  ☐ Customer Support (Product: ux, loom)              │
│                                                      │
│  Tier: Growth ($149/mo) · 2 depts · 8 agents         │
│                                                      │
│  [Submit for Provisioning] ← plan-locked by quinn    │
└──────────────────────────────────────────────────────┘
    │
    ▼ quinn: plan-lock created + hashed
    ▼ scaffold.py: tenant-provision (sandboxed)
    ▼ quinn: verify plan completed
    ▼ board: record in master graph
```

---

## TIER 2: PER-BRAND DASHBOARD (business owners)

### What They See

```
┌──────────────────────────────────────────────────────┐
│  BOUTIQUE A — Your Dashboard          [⚙️ Settings]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┬─────────────────┬────────────┐  │
│  │ THIS WEEK       │ YOUR CONTENT    │ REACH      │  │
│  │                 │                 │            │  │
│  │ 5 posts ready   │ 3 Instagram     │ 1.2k views │  │
│  │ 2 reviews done  │ 2 Stories       │ 84 clicks  │  │
│  │ Next: Thursday  │ Drafts: 4       │ Growing ↑  │  │
│  └─────────────────┴─────────────────┴────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  UPCOMING CONTENT                             │    │
│  │                                              │    │
│  │  MON  │ New arrivals post             ✅    │    │
│  │  TUE  │ Behind-the-scenes Story        ✅    │    │
│  │  WED  │ Customer spotlight             ⏳    │    │
│  │  THU  │ Sale announcement              📝    │    │
│  │  FRI  │ Weekend style inspiration      📝    │    │
│  │                                              │    │
│  │  [Approve] [Request Changes] [Skip Week]     │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  CONNECTIONS                    [Manage →]   │    │
│  │  ✅ Instagram   ✅ Shopify                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Plan: Growth ($149/mo) · Next bill: Aug 1           │
└──────────────────────────────────────────────────────┘
```

### What Maps to Pipeline Data

| Card | Pipeline Source | Business Owner Sees |
|------|----------------|-------------------|
| This Week | `bridge.py` — content pipeline output count | "5 posts ready" |
| Your Content | Per-tenant agent session logs | Content feed with status |
| Reach | Connector API (Instagram, Shopify) | Views, clicks, growth direction |
| Upcoming Content | Content pipeline scheduler | Calendar with approve/skip |
| Connections | relay MCP registry (per-tenant) | Green checks for active |
| Settings | `tenant-manifest.yaml` | Plan, billing, connectors |

### What They NEVER See

| Hidden | Why |
|--------|-----|
| spark, lena, pixel | They see "Your Creative Team" |
| RAG pipeline metrics | "Content Quality: Good ✅" |
| Harness gates | "All systems working ✅" |
| Graph databases | Their content feed (already filtered) |
| Token savings | "Optimized for speed" |
| Agent error logs | Escalated to operator, not shown to business owner |

---

## DASHBOARD API (bridge.py --mode dashboard)

```
GET /dashboard/master
  → field_monitor.generate_report()
  → self_improver last run
  → harness quarantine log (last 24h)
  → graph builder stats
  → per-brand aggregation

GET /dashboard/brand/:id
  → per-tenant field_monitor
  → content pipeline output feed
  → connector health (relay MCP registry)
  → tenant-manifest.yaml (plan/billing)

POST /dashboard/brands
  → validate brand name, industry, departments
  → plan-lock (quinn)
  → scaffold.py tenant-provision (Phase 2 build)
  → return provisioning status

GET /dashboard/alerts
  → harness quarantine log
  → field_monitor degradation alerts
  → coverage gaps
  → drift signals
```

---

## FAILURE MODE OWNERSHIP

| Failure Mode | Detection | Owner Agent | Recovery |
|-------------|-----------|-------------|----------|
| Dashboard API returns stale data | Freshness check (data timestamp < 1h old) | ops | Re-fetch from source |
| Per-brand dashboard shows wrong tenant | Tenant isolation check (brand_id matches auth) | sentinel | Halt + escalate |
| Add Brand provisions duplicate tenant | Idempotency check (brand name + industry hash) | quinn | Return existing tenant |
| Dashboard fetches from unauthorized dept | Plan-lock: dashboard query plan hashed before execution | quinn | Halt + escalate |
| Obsidian graph preview stale | Graph builder last-run timestamp check | dev | Trigger graph rebuild |

---

## WHAT GETS BUILT

| File | Purpose | Tests |
|------|---------|-------|
| `dashboard/dashboard_api.py` | bridge.py extension: `--mode dashboard` endpoints | 15 |
| `dashboard/master_dashboard.html` | Self-contained HTML artifact for YVON operators | N/A (artifact) |
| `dashboard/brand_dashboard.html` | Self-contained HTML artifact for business owners | N/A (artifact) |
| `dashboard/add_brand.html` | Add Brand wizard — form → scaffold.py | N/A (artifact) |

**Estimated: 3 days, 15 tests, 3 HTML artifacts. All read-only, plan-locked, sandboxed. Zero destructive operations.**
