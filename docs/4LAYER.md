# YVON — COMPLETE 4-LAYER MULTI-TENANT ARCHITECTURE

**Status:** Design Phase — Master Architecture Plan  
**Date:** 2026-07-16  
**Purpose:** YVON Core manages Novizio, Hourbour, and AgentX (SaaS for small businesses)  
**Validated Against:** Google agents-cli (github.com/google/agents-cli) — YVON's architecture aligns with Google's agent engineering patterns at every layer. See cross-reference section at end.

---

## THE 4-LAYER STACK

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  LAYER 4: AGENTX PLATFORM (SaaS for Small Business)              │
│  • Business onboarding & profile creation                        │
│  • Department subscription & billing tiers                       │
│  • Tenant provisioning & isolation                               │
│  • External integration marketplace                              │
│  • Business dashboard & analytics                                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 3: INTEGRATION LAYER (MCP + External APIs)               │
│  • MCP tool registry (relay) — ALL external tools registered     │
│  • Integration patterns (relay) — idempotency, retry, circuit    │
│  • Egress allowlist (relay) — per-tool network boundaries        │
│  • Engineering MCP marketplace — 7 tools mapped                  │
│  • Connector SDK — build custom integrations per business        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 2: AGENT LAYER (46 Agents × 7 Departments)               │
│  • RAG pipeline with 5-gate harness (auth, reliability, conflict,│
│    priority, quarantine)                                         │
│  • Progressive skill disclosure (40-60% context savings)         │
│  • Post-hoc grounded citation verification                       │
│  • Field monitoring + self-improvement (weekly auto-optimize)    │
│  • Token savings pipeline (64-91% compression)                  │
│  • Graph memory (relational + dependency)                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: YVON CORE (Master Control Plane)                      │
│  • Master Obsidian Graph Vault                                  │
│  • Fleet governance (meta + board + precedent + sentinel)        │
│  • Business profile registry                                    │
│  • Department deployment engine                                 │
│  • Multi-tenant isolation & data boundaries                      │
│  • Cross-tenant learning pipeline                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## THE DATA FLOW — End to End

```
                                  MASTER OBSIDIAN GRAPH VAULT
                                  ┌──────────────────────┐
                                  │ YVON MASTER GRAPH    │
                                  │ • Fleet state        │
                                  │ • All business profiles│
                                  │ • Learning patterns  │
                                  │ • Global improvements│
                                  └──────┬───────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
              ┌──────────┐       ┌──────────┐        ┌──────────────┐
              │ NOVIZIO  │       │ HOURBOUR │        │    AGENTX    │
              │ (Brand 1)│       │ (Brand 2)│        │  (SaaS Layer)│
              │ 3 depts  │       │ 2 depts  │        │              │
              └────┬─────┘       └────┬─────┘        └──────┬───────┘
                   │                  │                     │
                   │                  │         ┌───────────┼───────────┐
                   │                  │         │           │           │
                   │                  │         ▼           ▼           ▼
                   │                  │    ┌─────────┐┌─────────┐┌─────────┐
                   │                  │    │Boutique ││  Cafe   ││SaaS Co. │
                   │                  │    │Client A ││Client B ││Client C │
                   │                  │    │2 depts  ││1 dept   ││4 depts  │
                   │                  │    └────┬────┘└────┬────┘└────┬────┘
                   │                  │         │          │          │
                   │                  │    ┌────▼──────────▼──────────▼────┐
                   │                  │    │    PER-TENANT ISOLATION      │
                   │                  │    │    • Separate graph DB        │
                   ▼                  ▼    │    • Separate agent state     │
         ┌────────────────────┐  ┌────────┐│    • Separate skills/config   │
         │ OWNED BRAND GRAPH  │  │TENANT  ││    • Separate feedback loop   │
         │ • Novizio + Hourbour│  │GRAPH   ││    • Anonymized telemetry →  │
         │ • Direct YVON access│  │MEMORY  ││      Master Graph for learning│
         │ • Full dept access  │  │        │└─────────────────────────────┘
         └────────────────────┘  └────────┘
```

---

## LAYER 1: YVON CORE — MASTER CONTROL PLANE

### WHAT IT IS
The single source of truth for the entire YVON ecosystem. One Obsidian vault containing the master knowledge graph that connects every business, every agent deployment, and every learning signal.

### MASTER GRAPH VAULT STRUCTURE

```
/vault/                          # Single Obsidian vault
├── fleet/                       # Agent fleet state
│   ├── agents/                  # All 46 agent statuses
│   ├── departments/             # Per-department health
│   └── improvements/            # Self-improver deployment history
│
├── businesses/                  # Business profile registry
│   ├── novizio/                 # Owned brand — full access
│   ├── hourbour/                # Owned brand — full access
│   └── agentx/                  # Tenant registry
│       ├── tenants/             # One folder per tenant
│       │   ├── boutique-a/      # Business profile + config
│       │   ├── cafe-b/
│       │   └── saas-c/
│       └── templates/           # Department deployment templates
│
├── learning/                    # Cross-tenant learning
│   ├── patterns/                # Anonymized behavior patterns
│   ├── improvements/            # Global improvements from tenant data
│   └── benchmarks/              # Performance baselines
│
├── governance/                  # Master governance
│   ├── constitution/            # YVON constitution
│   ├── rulings/                 # Board decisions
│   └── audit/                   # Audit trails
│
└── integrations/                # External integration registry
    ├── mcp-registry/            # Complete MCP tool catalog
    ├── connectors/              # Per-business connector configs
    └── marketplace/             # Available integration marketplace
```

### MULTI-TENANT GRAPH MEMORY MODEL

Each tenant (business) gets its own **isolated graph database**:

```
TENANT: Boutique A
/vault/businesses/agentx/tenants/boutique-a/
│
├── profile.md                  # Business identity, industry, size, goals
├── departments/                # Active department configs
│   ├── brand-studio/           # Only agents rented by this business
│   │   ├── spark/              # Each agent has per-tenant state
│   │   ├── lena/
│   │   └── pixel/
│   └── product/                # Optional: second department
│
├── graph/                      # ISOLATED tenant graph (Obsidian vault)
│   ├── content/                # All content produced for this business
│   ├── decisions/              # Decisions made + outcomes
│   ├── customers/              # Customer profiles (encrypted)
│   ├── analytics/              # Performance data
│   └── feedback/               # Agent feedback for this tenant
│
├── integrations/               # External tool connections
│   ├── instagram.md            # Connected social account
│   ├── shopify.md              # Connected e-commerce
│   └── mailchimp.md            # Connected email marketing
│
├── state/                      # Runtime state (ephemeral)
│   ├── sessions/               # Active agent sessions
│   ├── queue/                  # Pending tasks
│   └── cache/                  # Temporary context cache
│
└── analytics.md                # Business-specific metrics dashboard
```

**Isolation guarantees:**
- Each tenant has a separate SQLite database (graph store)
- Tenant A's graph queries can NEVER return Tenant B's data
- Agent sessions are sandboxed per tenant (no cross-tenant context leakage)
- Anonymized aggregate patterns feed back to master (not raw data)
- Encryption at rest for customer-sensitive data in tenant graphs

---

## LAYER 2: AGENT LAYER — WHAT EXISTS & WHAT'S NEW

### STATUS: 80% COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| 46 agents × 7 departments | ✅ DONE | Full definitions, skills, configs |
| RAG pipeline (retrieval → injection) | ✅ DONE | 17 modules, 111 tests |
| 5-gate harness | ✅ DONE | auth, reliability, conflict, priority, quarantine |
| Progressive skill disclosure | ✅ DONE | 40-60% context savings |
| Post-hoc verification | ✅ DONE | Grounded citations + self-consistency |
| Token savings pipeline | ✅ DONE | 22-91% compression |
| Relational chunk graph | ✅ DONE | defines/extends/contradicts/supersedes |
| Field monitoring | ✅ DONE | Attractors, degradation, coverage, drift |
| Self-improvement | ✅ DONE | Weekly analyze→propose→test→deploy |
| **Business Profile System** | ❌ BUILD | Define tenant identity, departments, constraints |
| **Department Deployment Engine** | ❌ BUILD | Spin up dept subset per business |
| **Multi-Tenant RAG Router** | ❌ BUILD | Route queries to correct tenant's graph |
| **Cross-Tenant Learning** | ❌ BUILD | Anonymized patterns → master improvements |

---

## LAYER 3: INTEGRATION LAYER — MCP + EXTERNAL APIs

### STATUS: 60% COMPLETE

### WHAT EXISTS

| Component | Agent | Status |
|-----------|-------|--------|
| MCP tool registry | relay | ✅ SKILL.md defined. Registry lint script exists. Append-only. |
| Integration patterns | relay | ✅ SKILL.md defined. Idempotency, retry, circuit breaker, contract monitoring. |
| Egress allowlist | relay | ✅ SKILL.md defined. Per-tool network boundaries. |
| Least privilege grants | relay | ✅ SKILL.md defined. Per-agent access map. |
| MCP client (TypeScript) | CIE | ✅ `src/adapters/mcp-client.ts`. stdio JSON-RPC. Spawns MCP servers. |
| Engineering MCP marketplace | dev team | ✅ 7 tools mapped to 9 agents. Full inventory. |
| Ecosystem scanning | scout | ✅ SKILL. Evaluates new tools, feeds relay's registry. |

### 7 MCP TOOLS IN ENGINEERING MARKETPLACE

| Tool | Assigned Agents | Purpose |
|------|----------------|---------|
| **Ponytail** | dev, axiom | Minimal code generation (54% less code) |
| **Browserbase MCP** | mia, nova, cypher, aegis, quinn | Cloud browser automation (QA, security, visual testing) |
| **Firecrawl MCP** | rank, cypher, dana | Web scraping + search (10+ tools) |
| **Website Cloner** | mia, rank | Multi-agent site reconstruction |
| **Crawl4AI** | dana, rank | LLM-friendly web crawling |
| **Scrapling** | dana, rank | Adaptive scraping with anti-bot |
| **Playwright MCP** | mia, nova, quinn | Browser automation (testing, screenshots) |

### WHAT NEEDS BUILDING FOR AGENTX

| Component | Purpose |
|-----------|---------|
| **Connector SDK** | Standardized way for businesses to connect their tools (Instagram, Shopify, Mailchimp, Square, QuickBooks, etc.) |
| **Connector Marketplace** | Pre-built connectors businesses can enable with one click |
| **Connector Sandbox** | Test new connectors in isolation before production |
| **Per-Tenant Tool Config** | Each tenant's API keys, credentials stored encrypted |
| **Integration Health Monitor** | Track which connectors are working, which are failing |
| **Auto-Discovery** | scout scans for new tools a business might benefit from |

---

## LAYER 4: AGENTX PLATFORM — SaaS FOR SMALL BUSINESSES

### THE ONBOARDING FLOW

```
SMALL BUSINESS OWNER VISITS agentx.ai
    │
    ▼
┌──────────────────────────────────────────────┐
│ STEP 1: BUSINESS PROFILE CREATION            │
│ ─────────────────────────────────           │
│ • Business name, industry, size              │
│ • What do they need help with?               │
│   "I need social media management"           │
│   "I need brand design"                      │
│   "I need customer support"                  │
│ • YVON recommends department(s)              │
│ • Select subscription tier                   │
│                                              │
│ TIERS:                                       │
│   Starter ($49/mo) — 1 dept, 3 agents        │
│   Growth ($149/mo) — 2 depts, 8 agents       │
│   Scale ($399/mo) — 4 depts, full automation │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ STEP 2: TENANT PROVISIONING                  │
│ ─────────────────────────────────           │
│ • Create isolated tenant graph vault         │
│ • Deploy department subset (e.g.,            │
│   Brand Studio: spark + lena + pixel)        │
│ • Generate agent identities for this business │
│ • Set up feedback loop for this tenant       │
│ • Provision RAG pipeline with per-tenant     │
│   context window                             │
│ • Generate business-specific skill overrides │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ STEP 3: EXTERNAL INTEGRATIONS                │
│ ─────────────────────────────────           │
│ • Connect business tools:                    │
│   Instagram (for social media dept)          │
│   Canva/Figma (for design dept)              │
│   Shopify (for e-commerce dept)              │
│   Square/Stripe (for payments)               │
│   Mailchimp (for email marketing)            │
│   Google Analytics (for analytics)           │
│                                              │
│ • Each connector:                             │
│   1. Business authorizes (OAuth)             │
│   2. YVON tests connection in sandbox        │
│   3. Connector registered in relay's MCP     │
│      registry with per-tenant scope          │
│   4. Agent gets tool access via relay's      │
│      least-privilege grant                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ STEP 4: GO LIVE                              │
│ ─────────────────────────────────           │
│ • Agents begin operating                     │
│ • Business owner gets dashboard              │
│ • Weekly performance reports                 │
│ • Graph memory begins accumulating           │
│ • Feedback loop tunes per-tenant quality     │
│ • Anonymized patterns feed Master Graph      │
└──────────────────────────────────────────────┘
```

### AGENTX SUBSCRIPTION TIERS

| Tier | Departments | Agents | Price | Best For |
|------|------------|--------|-------|----------|
| **Starter** | 1 | Up to 3 | $49/mo | Solo business, one need |
| **Growth** | 2 | Up to 8 | $149/mo | Growing business, 2 needs |
| **Scale** | 4 | Up to 20 | $399/mo | Full automation |
| **Enterprise** | All 7 | All 46 | Custom | Full YVON deployment |

### DEPARTMENT PACKAGES

| Package | Agents Included | What It Does |
|---------|----------------|--------------|
| **Social Media** | spark, lena, pulse, rio | Content creation, scheduling, ad management, community engagement |
| **Brand & Design** | spark, atlas, pixel, muse, weave | Logo, brand identity, visual assets, creative direction |
| **Growth & Analytics** | kai, nate, rank, metric | SEO, A/B testing, analytics, funnel optimization |
| **Customer Support** | spec, ux, loom | Customer research, feedback management, PMF tracking |
| **E-Commerce** | price, metric, dev, ops | Pricing, analytics, technical operations |
| **Full Marketing** | All Brand Studio (11 agents) | Complete marketing department |

---

## THE GRAPH MEMORY SYSTEM

### THREE GRAPH TIERS

```
TIER 1: MASTER GRAPH (YVON Core)
┌─────────────────────────────────────────┐
│ Size: Massive (all knowledge)           │
│ Content:                                │
│ • All 46 agents' operational state      │
│ • All business profiles                 │
│ • All governance decisions              │
│ • Cross-tenant learning patterns        │
│ • Global improvement history            │
│ • MCP/integration registry              │
│                                         │
│ Access: YVON Core + board + meta        │
│ Isolation: N/A (master is single source)│
└─────────────────────────────────────────┘
            │
            │ feeds learning patterns
            ▼
TIER 2: OWNED BRAND GRAPHS (Novizio, Hourbour)
┌─────────────────────────────────────────┐
│ Size: Large (full business knowledge)   │
│ Content:                                │
│ • Business-specific agent state         │
│ • Content produced by agents            │
│ • Customer data (encrypted)             │
│ • Performance analytics                 │
│ • Integration configurations            │
│                                         │
│ Access: Brand owner + YVON Core         │
│ Isolation: Dedicated graph DB per brand │
└─────────────────────────────────────────┘
            │
            │ anonymized patterns
            ▼
TIER 3: TENANT GRAPHS (AgentX clients)
┌─────────────────────────────────────────┐
│ Size: Small (per-business knowledge)    │
│ Content:                                │
│ • Tenant-specific agent state           │
│ • Content produced for this business    │
│ • Customer data (encrypted)             │
│ • Basic analytics                       │
│ • Connector configurations              │
│                                         │
│ Access: Tenant owner + YVON Core        │
│ Isolation: Separate SQLite DB per tenant│
│ Privacy: Data never leaves tenant graph │
│          except anonymized aggregates   │
└─────────────────────────────────────────┘
```

### HOW CROSS-TENANT LEARNING WORKS

```
TENANT A (Boutique)         TENANT B (Cafe)         TENANT C (SaaS Co.)
"social media schedule"     "social media posts"    "Instagram campaign"
      │                           │                        │
      ▼                           ▼                        ▼
┌─────────────────┐     ┌─────────────────┐    ┌─────────────────┐
│ TENANT GRAPH A  │     │ TENANT GRAPH B  │    │ TENANT GRAPH C  │
│ (ISOLATED)      │     │ (ISOLATED)      │    │ (ISOLATED)      │
└────────┬────────┘     └────────┬────────┘    └────────┬────────┘
         │                       │                      │
         │    ANONYMIZED         │                      │
         │    AGGREGATES         │                      │
         │    (no raw data)      │                      │
         └───────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  CROSS-TENANT LEARNER   │
                    │  (self_improver.py      │
                    │   extended for          │
                    │   multi-tenant mode)    │
                    │                         │
                    │  Patterns detected:      │
                    │  → Social media queries │
                    │    peak at 9am and 5pm  │
                    │  → Boutiques ask more   │
                    │    visual design q's    │
                    │  → Cafes ask more event │
                    │    promotion q's        │
                    │  → SaaS cos ask more    │
                    │    technical content q's│
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  MASTER GRAPH UPDATE    │
                    │                         │
                    │  → Tune compression     │
                    │    per industry          │
                    │  → Improve department   │
                    │    package defaults      │
                    │  → Create industry-     │
                    │    specific skill        │
                    │    overrides            │
                    │  → Adjust pricing tiers │
                    │    based on usage data  │
                    └─────────────────────────┘
```

---

## DEPARTMENT DEPLOYMENT PIPELINE

```
OPERATOR SELECTS: "Deploy Brand Studio to Boutique A"
    │
    ▼
┌──────────────────────────────────────────────────┐
│ DEPLOYMENT ORCHESTRATOR (new: deploy.py)         │
│                                                  │
│ 1. Create tenant graph vault                     │
│ 2. Copy agent definitions (spark, lena, pixel)   │
│ 3. Strip YVON-internal references                │
│ 4. Apply business-specific overrides:            │
│    - spark: "You are creative director for       │
│      Boutique A, a women's clothing brand..."    │
│    - lena: "Your brand voice is warm, inclusive, │
│      premium..."                                 │
│ 5. Provision isolated DB per agent               │
│ 6. Wire external connectors (Instagram, Shopify) │
│ 7. Run smoke test (generate one piece of content)│
│ 8. Register in master graph                      │
│ 9. Activate monitoring                           │
│                                                  │
│ ── ROLLBACK ────────────────────────────────    │
│ • Deployment is versioned                        │
│ • Previous configs stored as *.dep-{version}.bak │
│ • git checkout reverts any deployment            │
│ • Tenant graph is append-only (never deleted)    │
└──────────────────────────────────────────────────┘
```

---

## WHAT GETS BUILT — NEW MODULES

### NEW PYTHON MODULES (rag/ platform layer)

| Module | Purpose | Tests Est. |
|--------|---------|-----------|
| `platform/business_profile.py` | Business identity, industry, goals, department selection | 20 |
| `platform/tenant_provisioner.py` | Create isolated tenant graph, deploy agents, wire integrations | 25 |
| `platform/deployment_orchestrator.py` | Version-controlled deploy/rollback pipeline | 20 |
| `platform/graph_vault.py` | Multi-tenant graph database (SQLite per tenant + master Obsidian) | 25 |
| `platform/cross_tenant_learner.py` | Anonymized pattern extraction, master graph updates | 20 |
| `platform/connector_sdk.py` | Standardized interface for business tool integrations | 15 |
| `platform/tenant_rag_router.py` | Route queries to correct tenant's graph with isolation | 20 |
| `platform/billing_tiers.py` | Subscription management, department limits, usage tracking | 15 |

### NEW TYPESCRIPT MODULES (src/ platform layer)

| Module | Purpose |
|--------|---------|
| `src/platform/onboarding.ts` | Business signup flow, tier selection |
| `src/platform/tenant-dashboard.ts` | Per-business analytics dashboard |
| `src/platform/connector-marketplace.ts` | Browse + enable pre-built connectors |

### MODIFIED EXISTING MODULES

| Module | Change |
|--------|--------|
| `rag/unified_pipeline.py` | Per-tenant context routing |
| `rag/harness.py` | Per-tenant reliability thresholds |
| `rag/feedback.py` | Per-tenant feedback isolation |
| `rag/self_improver.py` | Cross-tenant learning mode |
| `rag/field_monitor.py` | Per-tenant monitoring |

---

## COMPLETE WORKFLOW — END TO END

```
BOUTIQUE A OWNER: "I need social media content for this week"
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ AGENTX PLATFORM (Layer 4)                            │
│ 1. Route to Boutique A's tenant graph               │
│ 2. Load Boutique A's profile (women's clothing)      │
│ 3. Load active departments (Brand Studio: social)    │
│ 4. Load connected integrations (Instagram, Canva)    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ INTEGRATION LAYER (Layer 3)                          │
│ 1. relay: check MCP registry for this tenant         │
│ 2. Verify Instagram connector is active + healthy    │
│ 3. Apply least-privilege: spark can READ Instagram   │
│    analytics, pulse can POST to Instagram            │
│ 4. Egress allowlist: only *.instagram.com allowed    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ AGENT LAYER (Layer 2)                                │
│ 1. progressive_disclosure: load spark + lena + pulse │
│ 2. retriever: search Boutique A's tenant graph       │
│    (NOT Boutique B's, NOT YVON's internal)           │
│ 3. harness:                                        │
│    Gate 1: authenticate (tenant graph source)        │
│    Gate 2: reliability (per-tenant quality scores)   │
│    Gate 3: conflict (any contradictions?)            │
│    Gate 4: priority assembly (P0→P7)                 │
│    Gate 5: quarantine + recovery                     │
│ 4. unified_pipeline: FAST/BALANCE strategy           │
│ 5. Inject into LLM context                           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ LLM GENERATION                                       │
│ hermes+claude: Generate 5 social posts for week      │
│ deepseek: Verify content aligns with brand voice     │
│ chatgpt: Quality check creative output               │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ POST-HOC VERIFICATION                                │
│ verifier.py: are all claims grounded?                │
│ quinn: QA check on content quality                   │
└──────────────────────┬───────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│ DELIVER TO        │    │ UPDATE TENANT GRAPH   │
│ BOUTIQUE A OWNER  │    │ • Content produced    │
│ via dashboard     │    │ • Engagement metrics  │
│                   │    │ • Agent feedback      │
└──────────────────┘    └──────────┬───────────┘
                                   │
                         ┌─────────▼──────────┐
                         │ ANONYMIZE + AGGREGATE│
                         │ (cross_tenant_learner)│
                         └─────────┬───────────┘
                                   │
                         ┌─────────▼──────────┐
                         │ MASTER GRAPH LEARNS │
                         │ → Boutiques: visual  │
                         │   content outperforms│
                         │ → 9am posts get 2x   │
                         │   engagement vs 3pm  │
                         └──────────────────────┘
```

---

## DATA ISOLATION MATRIX

| Data Type | YVON Core | Novizio | Hourbour | Tenant A | Tenant B |
|-----------|-----------|---------|----------|----------|----------|
| Agent definitions | ✅ R/W | ✅ READ | ✅ READ | ✅ READ | ✅ READ |
| YVON fleet state | ✅ R/W | ❌ | ❌ | ❌ | ❌ |
| Novizio content | ✅ READ | ✅ R/W | ❌ | ❌ | ❌ |
| Hourbour content | ✅ READ | ❌ | ✅ R/W | ❌ | ❌ |
| Tenant A content | ANON ONLY | ❌ | ❌ | ✅ R/W | ❌ |
| Tenant B content | ANON ONLY | ❌ | ❌ | ❌ | ✅ R/W |
| Tenant A customers | ❌ | ❌ | ❌ | ✅ R/W | ❌ |
| Cross-tenant patterns | ✅ R/W | ✅ READ | ✅ READ | ❌ | ❌ |
| MCP registry | ✅ R/W | ✅ READ | ✅ READ | SCOPED | SCOPED |
| Connector credentials | ❌ | ✅ OWN | ✅ OWN | ✅ OWN | ✅ OWN |

---

## BUILDING THE AGENTX CONNECTOR MARKETPLACE

### PRE-BUILT CONNECTORS (Phase 1)

| Connector | Category | For Department | Auth |
|-----------|----------|---------------|------|
| Instagram Graph API | Social Media | Brand Studio | OAuth |
| Facebook Pages API | Social Media | Brand Studio | OAuth |
| TikTok Content API | Social Media | Brand Studio | OAuth |
| Canva API | Design | Brand Studio | API Key |
| Shopify API | E-Commerce | Product + Brand Studio | OAuth |
| WooCommerce API | E-Commerce | Product | API Key |
| Square API | Payments | Product | OAuth |
| Stripe API | Payments | Product | API Key |
| Mailchimp API | Email | Brand Studio | OAuth |
| Google Analytics 4 | Analytics | Product | OAuth |
| Google My Business | Local | Brand Studio | OAuth |
| QuickBooks API | Accounting | Shared OS | OAuth |

### CONNECTOR SDK PATTERN

```python
# platform/connector_sdk.py

class BusinessConnector:
    """Every connector implements this interface."""
    
    name: str              # "instagram", "shopify", etc.
    category: str          # "social_media", "ecommerce", etc.
    auth_method: str       # "oauth", "api_key", "basic"
    scopes: List[str]      # Required permissions
    
    async def connect(self, credentials: Dict) -> bool: ...
    async def test(self) -> ConnectorHealth: ...
    async def execute(self, agent: str, action: str, params: Dict) -> Any: ...
    async def disconnect(self) -> bool: ...
    
    # MCP registration
    def register_in_mcp_registry(self, tenant_id: str) -> None:
        """Register this connector in relay's MCP registry for this tenant."""
```

---

## SELF-IMPROVEMENT LOOP — EXTENDED FOR MULTI-TENANT

```
CURRENT (single-project):
  field_monitor → self_improver → sandbox test → deploy

EXTENDED (multi-tenant):
  
  ┌──────────────────────────────────────────────────────┐
  │ WEEKLY CYCLE: Sunday 00:00 UTC                       │
  │                                                      │
  │ 1. PER-TENANT ANALYSIS (field_monitor × N tenants)   │
  │    → Each tenant's attractors, degradation, coverage │
  │    → Tenant A: social posts at 9am outperform 3pm    │
  │    → Tenant B: visual-first posts get more engagement│
  │                                                      │
  │ 2. CROSS-TENANT AGGREGATION                          │
  │    → Anonymized patterns across all tenants          │
  │    → Industry clusters: boutiques vs cafes vs SaaS   │
  │    → Common failure modes across tenants             │
  │                                                      │
  │ 3. IMPROVEMENT PROPOSALS                             │
  │    → Per-tenant: adjust compression, recovery params │
  │    → Per-industry: tune agent identity overrides     │
  │    → Global: adjust budget multipliers, thresholds   │
  │                                                      │
  │ 4. SANDBOX TESTING (per proposal)                    │
  │    → Test in isolated sandbox per tenant             │
  │    → Simulate with synthetic tenant data             │
  │    → Verify no cross-tenant leakage                  │
  │                                                      │
  │ 5. DEPLOYMENT                                        │
  │    → Per-tenant changes: deploy to specific tenant   │
  │    → Global changes: deploy to all tenants           │
  │    → Rollback ready: *.backup per deployment         │
  │                                                      │
  │ 6. MASTER GRAPH UPDATE                               │
  │    → Log all changes with rationale                  │
  │    → Update learning patterns                        │
  │    → Generate weekly fleet health report             │
  └──────────────────────────────────────────────────────┘
```

---

## BUILD ORDER — PHASED ROLLOUT

### PHASE 1: YVON CORE HARDENING (2 weeks)
- Master graph vault with Obsidian integration
- Fleet governance dashboard (existing agents: meta, board, sentinel)
- Business profile registry (YAML/JSON → graph nodes)
- `platform/business_profile.py`

### PHASE 2: DEPARTMENT DEPLOYMENT ENGINE (2 weeks)
- `platform/tenant_provisioner.py`
- `platform/deployment_orchestrator.py`
- `platform/graph_vault.py`
- Multi-tenant isolation tests

### PHASE 3: AGENTX ONBOARDING (2 weeks)
- Business signup flow
- Department selection & subscription tiers
- `src/platform/onboarding.ts`
- `platform/billing_tiers.py`

### PHASE 4: CONNECTOR MARKETPLACE (2 weeks)
- `platform/connector_sdk.py`
- 6 pre-built connectors (Instagram, Shopify, Canva, Mailchimp, GA4, Stripe)
- Connector sandbox for testing
- `src/platform/connector-marketplace.ts`

### PHASE 5: CROSS-TENANT LEARNING (1 week)
- `platform/cross_tenant_learner.py`
- Anonymization pipeline
- Master graph pattern ingestion
- Extended self_improver for multi-tenant mode

### PHASE 6: PRODUCTION HARDENING (1 week)
- E2E tests across all layers
- Multi-tenant isolation verification
- Performance benchmarks
- Documentation

**Total: 10 weeks to production-ready AgentX platform**

---

## VALIDATION: GOOGLE AGENTS-CLI CROSS-REFERENCE

YVON's architecture aligns with Google's agent engineering patterns at every layer. The `google/agents-cli` (GitHub, Apache 2.0) validates the core design decisions. Below is a detailed mapping of what YVON already does, what Google does that confirms it, and what YVON should adopt.

### ARCHITECTURE MATCH — Layer by Layer

| YVON Layer | Google agents-cli Equivalent | Match |
|-----------|------------------------------|-------|
| **YVON Core (Master Control Plane)** | Agent Garden + publish/register | 🔄 Partial — YVON needs Agent Card and discovery |
| **Agent Layer (46 agents)** | ADK agents with tools, callbacks, state | ✅ Aligned — same agent structure |
| **Integration Layer (MCP)** | MCP for tools, A2A for agent coordination | ✅ Aligned — Google also uses MCP + A2A protocols |
| **RAG Pipeline with Harness** | agentic_rag template | ✅ Aligned — same RAG + verification pattern |
| **SKILL.md files (200+)** | 7 installable skills (Markdown docs) | ✅ Aligned — identical concept, same format |
| **Progressive Disclosure** | Skill activation via triggers | ✅ Aligned — same on-demand loading |
| **Field Monitor + Self-Improver** | Observe phase (Cloud Trace + BigQuery) | 🔄 Partial — YVON needs production observability tiers |

### SKILL SYSTEM — Identical Pattern

Google's 7 skills and YVON's 200+ SKILL.md files use the same architecture:

| Google Skill | YVON Equivalent | Status |
|-------------|----------------|--------|
| `google-agents-cli-workflow` | `AGENT-BUILD-PLAYBOOK.md` | ✅ Exists — lifecycle orchestration |
| `google-agents-cli-scaffold` | `platform/deployment_orchestrator.py` (planned) | 🔄 Phase 2 build |
| `google-agents-cli-adk-code` | `Teams/Shared OS/logical/*.py` (35 scripts) | ✅ Exists — agent code patterns |
| `google-agents-cli-eval` | `rag/verifier.py` + `rag/e2e_validation.py` | 🔄 Partial — needs eval dataset + metrics |
| `google-agents-cli-deploy` | `platform/deployment_orchestrator.py` (planned) | 🔄 Phase 2 build |
| `google-agents-cli-publish` | **MISSING** — needs Agent Card + discovery | ❌ Plan to add |
| `google-agents-cli-observability` | `rag/field_monitor.py` | 🔄 Partial — needs Cloud Trace/BigQuery tier |

### 8-PHASE LIFECYCLE vs YVON 4-GATE CYCLE

| Google Phase | YVON Gate | Status |
|-------------|-----------|--------|
| **0 — Spec** | Constitution (board enforces) | ✅ Exists — board checks constitution compliance |
| **1 — Scaffold** | **MISSING** — no project scaffolding CLI | ❌ Plan to add (`agents-cli scaffold create` equivalent) |
| **2 — Build** | Agent skills + identity definitions | ✅ Exists — 46 agents fully defined |
| **3 — Orchestrate** | CAOS executor (TypeScript) | ✅ Exists — multi-agent orchestration |
| **4 — Evaluate** | Post-hoc verifier + E2E validation | 🔄 Partial — needs eval datasets + LLM-as-judge |
| **5 — Deploy** | **MISSING** — no deployment pipeline | ❌ Phase 2-3 build (AgentX tenant provisioning) |
| **6 — Publish** | **MISSING** — no agent discovery | ❌ Plan to add (Agent Garden equivalent) |
| **7 — Observe** | Field monitor + self-improver | 🔄 Partial — needs production tier monitoring |

### KEY PATTERNS TO ADOPT FROM GOOGLE

**1. Agent Scaffold Create (for AgentX tenant provisioning)**

Google's pattern:
```
agents-cli scaffold create my-agent --deployment-target cloud_run
```

YVON's equivalent (to build):
```
yvon tenant provision boutique-a --departments brand-studio,product --tier growth
```
This would create the full tenant directory structure, copy agent definitions, apply business-specific overrides, and provision the isolated graph database — all from one command.

**2. eval → fix → eval loop (for agent quality)**

Google runs 5-10+ iterations of eval → fix before production. YVON's verifier checks grounded citations but doesn't have evaluation datasets. Need to add:
```
yvon eval run --agent spark --eval-set headline_review_benchmark
yvon eval grade --agent spark --dataset-id 2026Q3
yvon eval optimize --agent spark  # auto-tune parameters
```

**3. Agent Card + Discovery (for AgentX marketplace)**

Google's `publish gemini-enterprise` registers agents so other agents can discover them. YVON needs:
```
yvon publish --agent spark --card social-media-creative-director
```
This creates an Agent Card (what the agent does, what tools it needs, what it costs per month) and publishes it to the AgentX marketplace so small businesses can discover agents they want.

**4. Observability Tiers**

Google has three tiers: Cloud Trace (always on) → Prompt-Response Logging (on deploy) → BigQuery Analytics (opt-in). YVON's field_monitor should mirror:

| YVON Tier | Google Equivalent | Default |
|-----------|------------------|---------|
| **Trace** | Cloud Trace spans | Always on |
| **Logging** | Prompt-response + BigQuery | On for owned brands, opt-in for tenants |
| **Analytics** | BigQuery Agent Analytics | Opt-in (adds cost) |

**5. Manifest File (for deployment preservation)**

Google's `agents-cli-manifest.yaml` preserves creation parameters:
```yaml
agent_id: boutique-a
departments: [brand-studio]
template: social_media
tier: growth
created_at: 2026-07-16
deployment_target: agentx
```

YVON needs `tenant-manifest.yaml` per tenant so upgrades preserve configuration — identical to the code-preservation rules YVON already has in the Security Charter.

**6. Prototype-First Pattern**

Google: `scaffold create --prototype` → minimal agent, then `scaffold enhance --deployment-target` to add deployment later.

YVON equivalent: provision a tenant with `--demo` mode (synthetic data, no production connections), let the business test for 7 days, then `yvon tenant upgrade --to production` to add real integrations.

### WHAT THIS MEANS FOR YVON

The Google architecture validates that YVON is building in the right direction. The skill system, agent definitions, multi-agent orchestration, MCP integration, and RAG pipeline all match Google's production patterns.

**Three critical additions for YVON to match Google's maturity:**

1. **CLI Lifecycle Tool** (`yvon` CLI with `scaffold → eval → deploy → observe` commands)
2. **Tenant Scaffold Create** (one-command provisioning of isolated agent departments for AgentX businesses)
3. **Agent Card + Discovery** (publish agents to marketplace, businesses discover and subscribe)

All three map directly to Phase 1-3 of the build plan above. The existing codebase (263 tests, 5-gate harness, 46 agents, 7 MCP tools) provides the engine. These additions provide the steering wheel and dashboard.

