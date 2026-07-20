# YVON Engine — Full Project Architecture

**Identity:** YVON Engine v1.3.0 — AI Agent OS Kernel
**Scale:** 46 agents, 7 departments, 1,500+ files
**Instillation:** `npm install` (one command, everything running)

---

## Project At a Glance

```
/Agents/
├── cli/                    CLI entry points (yvon, toonify, verify-caos)
├── src/                    TypeScript source → CIE, pipelines, graphs, TOON
├── dist/                   Compiled JavaScript (npm entry point)
├── rag/                    Python RAG pipeline (17 modules, 111 tests)
├── Teams/                  46 agents across 7 departments
│   ├── AI & Agents/        8 agents (meta, proto, relay, forge, etc.)
│   ├── Brand Studio/       11 agents (spark, lena, atlas, muse, etc.)
│   ├── Cybersecurity/      5 agents (warden, keyring, bastion, etc.)
│   ├── Engineering/        11 agents (dev, ops, raj, quinn, etc.)
│   ├── Executive Office/   3 agents (marcus, echo, vista)
│   ├── Governance/         3 agents (board, precedent, sentinel)
│   ├── Product/            5 agents (spec, metric, ux, loom, price)
│   ├── Shared OS/          Shared logical scripts + wisdom documents
│   └── Books/              12 PDF reference books
├── package.json            npm package: yvon-engine
└── README.md               Main project documentation
```

---

## 1. FULL WORKFLOW: Query → Agent → Response

```
                    ┌──────────────────────────────────────┐
                    │          USER ISSUES QUERY            │
                    │  "review this headline for campaign"  │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────┐
                    │      CIE TASK CLASSIFIER              │
                    │  src/cie/classifier.ts               │
                    │  → Classifies task type               │
                    │  → Routes to appropriate agent/skill  │
                    └──────────────┬───────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  AGENT SELECTION │  │  SKILL ROUTING   │  │  RAG RETRIEVAL   │
    │  src/agents/     │  │  agent.md Skill  │  │  rag/bridge.py   │
    │  personalities.ts│  │  Roster section  │  │  ← CIE calls     │
    └────────┬────────┘  └────────┬────────┘  │  rag via stdin    │
             │                    │             └────────┬────────┘
             └────────────────────┼──────────────────────┘
                                  │
                    ┌─────────────▼──────────────────────┐
                    │       RAG RETRIEVAL PIPELINE        │
                    │  rag/bridge.py (stdin/stdout)       │
                    └─────────────┬──────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ QUERY REWRITER  │  │ HYBRID RETRIEVER     │  │ FORMULA EXECUTOR    │
│ rag/retriever.py│  │ rag/embed.py         │  │ rag/bridge.py       │
│                 │  │ (dense + sparse)     │  │ → Shared OS scripts │
│ Lasswell model  │  │ + sqlite-vec store   │  │ Detect NPV, WACC,   │
│ expand→3-5 vars │  │ chunk similarity     │  │ risk scores, etc.   │
└────────┬────────┘  └──────────┬──────────┘  └──────────┬──────────┘
         │                      │                        │
         └──────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼───────────────────────────┐
                    │       CROSS-ENCODER RE-RANKER          │
                    │  rag/retriever.py — CrossEncoderReranker│
                    │  Re-ranks top-20 → top-5 by precision   │
                    └───────────┬───────────────────────────┘
                                │
                    ┌───────────▼───────────────────────────┐
                    │       CONTEXT OPTIMIZER               │
                    │  rag/optimizer.py                     │
                    │  → Select retrieval profile           │
                    │  → Enforce tier allocation (Pareto)   │
                    │  → Enforce source diversity           │
                    │  → Inject adversarial chunk (premortem)│
                    └───────────┬───────────────────────────┘
                                │
                    ┌───────────▼───────────────────────────┐
                    │       UNIFIED INJECTION PIPELINE ★     │
                    │  rag/unified_pipeline.py              │
                    │                                       │
                    │  ┌─ DOMAIN KEYWORD CLASSIFIER ────┐   │
                    │  │  GDPD/CCPA → legal_review       │   │
                    │  │  NPV/WACC → financial_analysis  │   │
                    │  │  NIST/ISO → compliance_check    │   │
                    │  │  acquire → strategic_analysis   │   │
                    │  │  pipeline → engineering_debug   │   │
                    │  │  headline → creative_review     │   │
                    │  └─────────────────────────────────┘   │
                    │                                       │
                    │  ┌─ STRATEGY ROUTER ──────────────┐   │
                    │  │                                  │   │
                    │  │  creative/copy/factual → FAST    │   │
                    │  │  everything else → BALANCE       │   │
                    │  └──────────────┬──────────────────┘   │
                    │                 │                      │
                    │     ┌───────────▼───────────┐          │
                    │     │                       │          │
                    │  ┌──▼──────┐         ┌──────▼──────┐   │
                    │  │  FAST   │         │   BALANCE   │   │
                    │  │Destructor│         │ Adaptive +  │   │
                    │  │   v2    │         │  Recovery   │   │
                    │  │         │         │             │   │
                    │  │ • 80t   │         │ • Adaptive  │   │
                    │  │   budget│         │   budget    │   │
                    │  │ • Strip │         │ • Strip     │   │
                    │  │   only  │         │   essentials│   │
                    │  │ • No    │         │ • Recovery  │   │
                    │  │   recov │         │   pass (5   │   │
                    │  │ • 89%   │         │   triggers) │   │
                    │  │   save  │         │ • 39-77%    │   │
                    │  │         │         │   save      │   │
                    │  └──┬──────┘         └──────┬──────┘   │
                    │     │                       │          │
                    │     └───────────┬───────────┘          │
                    │                 │                      │
                    │    ┌────────────▼────────────┐         │
                    │    │   FINAL INJECTION TEXT   │         │
                    │    │  with citations, rules,  │         │
                    │    │  numbers, computed facts │         │
                    │    └─────────────────────────┘         │
                    └───────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────────┐
                    │         LLM GENERATES RESPONSE            │
                    │  Agent persona + skills + injected context │
                    └───────────────────┬───────────────────────┘
                                        │
                    ┌───────────────────▼───────────────────────┐
                    │         FEEDBACK LOOP                     │
                    │  rag/feedback.py                         │
                    │  → Log acceptance/rejection               │
                    │  → Update chunk quality scores            │
                    │  → Record Lasswell trace for audit        │
                    └───────────────────────────────────────────┘
```

---

## 2. THE 46-AGENT FLEET

### AI & Agents Department (8 agents)
```
meta        Fleet governance & standards      agent-architecture-standards, fleet-governance
proto       Rapid prototyping                 agent-prototype-kit, eval-first-design
relay       Integrations & security           mcp-tool-registry, integration-patterns
forge       Model/technique benchmarking      benchmarking-discipline, degradation-diagnosis
gauge       Fleet quality monitoring          agent-quality-scorecard, fleet-health-report
anneal      Continuous improvement            self-annealing-loop, skill-lifecycle
scout       Ecosystem scanning                ecosystem-scanning, marketplace-skill-scouting
edge        Cutting-edge tech adoption        landscape-assets, tech-adoption-criteria
```

### Brand Studio Department (11 agents) — Creative Engine
```
spark       Creative director (Ogilvy persona)     art-direction-critique, coherence-qa
lena        Copywriting & brand voice              humanic-writing, voice-guides
atlas       Brand guidelines & identity            brand-guidelines, multi-brand-system
muse        Creative ideation                      concept-library, generate-creative-ideas
weave       Brand storytelling & narrative         brand-story-arcs, brand-storytelling
pixel       Visual assets & images                 asset-pipeline, image-style-guide
pulse       Social media & community               community-engagement, hook-writing
rio         Paid advertising                       ad-platform-mechanics, ad-thresholds
nate        Growth & experimentation               experiment-backlog, ab-test-analysis
kai         Marketing analytics & SEO              marketing-dashboards, seo-strategist
tempo       Audio/sound identity                   sound-identity, usage-licensing
```

### Cybersecurity Department (5 agents)
```
warden      GRC (CISO persona)                     risk-register, security-policy-framework
keyring     Identity & access management           access-reviews, privileged-access-management
bastion     Infrastructure/network security        cloud-posture, hardening-baselines
cortex      Detection & response                   security-incident-response, threat-hunting
veil        Data protection & privacy              breach-notification, data-loss-prevention
```

### Engineering Department (11 agents)
```
dev         Architecture & standards (Vogels)      architecture-decisions, code-review-standards
ops         DevOps / SRE                           incident-response, release-discipline
cypher      Offensive security / pen-testing       attack-playbooks, continuous-attack-loop
aegis       App/API security                       secure-code-review, threat-model
axiom       Algorithms & data structures           algorithm-review, complexity-analysis
rank        SEO & discoverability                  claude-seo-integration, structured-data-geo
quinn       QA & testing                           eval-harness, test-strategy
dana        Databases & data engineering            data-modeling, migration-discipline
raj         Backend services & APIs                api-standards, service-patterns
mia         Front-end engineering                  design-tokens, frontend-performance
nova        Mobile development                     app-store-release-discipline, mobile-app-architecture
```

### Executive Office (3 agents)
```
marcus      Strategy & vision (Steve Jobs)         decision-critic, okr-cascade, venture-priority-matrix
echo        Investor relations & pitch             pitch-framework, investor-update-generator
vista       Roadmap & prioritization               roadmap-sync, rice-prioritization
```

### Governance Department (3 agents)
```
board       Fiduciary oversight (Munger persona)   constitution-enforcement, fiduciary-guard
precedent   Legal/compliance consistency           case-law-method, ruling-log
sentinel    Audit & bypass detection               constitution-watch, gate-bypass-detection
```

### Product Department (5 agents)
```
spec        PRD & requirements                     prd-discipline, acceptance-criteria-handoff
metric      Product analytics                      metrics-governance, product-metrics-spec
ux          UX research                            research-repository, study-design
loom        Validation & PMF                       assumption-mapping, experiment-discipline
price       Pricing & packaging                    packaging-tiers, pricing-experiment-discipline
```

---

## 3. EACH AGENT'S STRUCTURE

Every one of the 46 agents follows this exact skeleton:

```
agent-name/
│
├── agent.md                  [REQUIRED] 6-section definition:
│   │                          Summary · Purpose · Position · Skill Roster
│   │                          Status · Workflow
│   └── agent.toon            TOON-compressed version (84.5% token savings)
│
├── identity/                 [REQUIRED] Agent persona
│   └── README.md / persona.md    "You are X. Your role is Y."
│       (e.g., spark: David Ogilvy persona, marcus: Steve Jobs,
│        board: Charlie Munger, dev: Werner Vogels, warden: CISO)
│
├── custom/                   [REQUIRED] Custom skills (9-section SKILL.md)
│   ├── skill-a/SKILL.md           Definition · Triggers · Input · Output
│   ├── skill-b/SKILL.md           Examples · Constraints · Verification
│   │   └── assets/                Templates, manifests, reference docs
│   └── ...                        (2-5 custom skills per agent)
│
├── logical/                  [OPTIONAL] Logical script requirements
│   └── book-requirements.md       Which Shared OS scripts this agent needs
│
├── marketplace/              [OPTIONAL] Shared/marketplace skills
│   └── market-skill/SKILL.md      e.g., meta has writing-skills in marketplace
│
├── operational/              [REQUIRED] Configuration
│   ├── agent/<name>-config.md           Agent runtime configuration
│   ├── commands/<name>-commands.md      Command definitions & routing
│   ├── principles/<name>-principles.md  Operating principles & constraints
│   ├── skill/<name>-skill-routing.md    Which skills → which query types
│   └── tool/<name>-tool-requirements.md Tool access & permission specs
│
└── logical/ other docs       [PER DEPARTMENT]
    └── DEPARTMENT-WORKFLOW.md   How agents interact within this department
```

**Total agent-specific files: ~650 `.md` + ~650 `.toon` = ~1,300 files across 46 agents**

---

## 4. SKILL SYSTEM

### What is a SKILL.md?

A skill is a self-contained markdown file with 9 standard sections:

```markdown
# Skill Name
## Definition          — What this skill does
## Triggers            — When to invoke (keywords, agent types, query patterns)
## Input               — What data the skill receives
## Output              — What the skill produces
## Examples            — 2-3 worked examples
## Constraints         — Guardrails (what the skill must NOT do)
## Verification        — How to verify the skill executed correctly
## Tool Requirements   — Any tools needed (MCP, API, file access)
## References           — Book/page citations grounding the skill
```

### Skill Types

| Type | Location | Example |
|------|----------|---------|
| **Custom Skills** | `agent-name/custom/` | spark has `art-direction-critique/SKILL.md` |
| **Marketplace Skills** | `agent-name/marketplace/` | meta has `writing-skills/SKILL.md` |
| **Cross-Cutting Skills** | `Shared OS/skills/` | `verification-before-completion/SKILL.md` |
| **Operational Skills** | Automatically loaded from `operational/skill/` | `meta-skill-routing.md` |

### Total Skills: ~200+ across all 46 agents

---

## 5. SHARED OS — THE LOGICAL SCRIPTS (35 Python modules)

All agents share a common library of executable formula scripts. These are NOT LLM calls — they're deterministic Python functions.

### Finance & Strategy (5 scripts)
```
capital_budgeting.py        NPV, WACC, IRR, CAPM, payback period
investor_metrics.py         LTV/CAC, burn multiple, rule of 40, magic number
venture_valuation.py        Cap table math, dilution, ESOP pools
decision_analysis.py        Decision trees, expected value, sensitivity
forecasting.py              ARIMA, exponential smoothing, regression
```

### Marketing & Brand (4 scripts)
```
marketing_laws.py           25 universal marketing principles (Lasswell, Pareto, etc.)
brand_metrics.py            Brand equity scoring, association strength
content_performance.py      STEPPS + SUCCESs composite scoring (viral potential)
pricing_methods.py          Van Westendorp, Gabor-Granger, conjoint analysis
```

### Security & Risk (4 scripts)
```
risk_management.py          NIST RMF: risk = impact × likelihood, risk appetite
security_assessment.py      CVSS scoring, OWASP testing, vulnerability assessment
identity_zero_trust.py      Zero-trust architecture, IAM policy engine
incident_response.py        Incident severity classification, patch prioritization
```

### Engineering & DevOps (7 scripts)
```
swe_practices.py            Code quality metrics, technical debt scoring
test_design.py              Test case generation, coverage analysis, attack patterns
sre_methods.py              SLO/SLI/SLA calculation, error budgets
web_performance.py          Core Web Vitals, browser networking metrics
api_design.py               REST maturity model, HTTP status decision trees
algorithm_analysis.py       Complexity analysis, algorithm selection framework
data_systems.py             CAP theorem decisions, consistency models
```

### Governance & Legal (4 scripts)
```
governance_gate.py          4-gate cycle: recommend→review→approve→audit
case_law_method.py          Precedent reasoning engine, stare decisis
privacy_compliance.py       GDPR/CCPA compliance checklist & scoring
audit_sampling.py           Statistical audit sampling (MUS, attribute sampling)
```

### Product & Experimentation (5 scripts)
```
experiment_methods.py       A/B test design, sample size, significance
rice_prioritization.py      RICE, WSJF, Cost of Delay scoring
signal_detection.py         Statistical significance, MDE, power analysis
ux_research_methods.py      SUS scoring, heuristic evaluation, task success rate
pitch_validation.py         Pitch deck narrative scoring, investor readiness
```

### Fleet & Organization (5 scripts)
```
fleet_measurement.py        Agent health, staleness scoring, skill coverage
staleness_economics.py      Knowledge decay curves, maintenance cost models
planning_fallacy.py         Reference-class forecasting, calibration weighting
storyline_engine.py         McKee 5-part structure + Miller StoryBrand SB7
competitive_strategy.py     Porter's Five Forces, value chain analysis
```

### Prompt Engineering (1 script)
```
prompt_craft.py             Cinematographic prompt vocabulary builder
```

---

## 6. RAG PIPELINE — FULL ARCHITECTURE

### The 8 Elements

```
ELEMENT 1: SEMANTIC CHUNKER
  rag/chunkify.py
  → Splits documents by heading boundaries (not tokens)
  → Assigns priority tiers (T1=load-bearing, T2=structural, T3=supplementary)
  → Tags adversarial variants (same claim, different framing)
  → Output: chunks.json + sqlite-vec vector store

ELEMENT 2: HYBRID EMBEDDER
  rag/embed.py
  → Dense embeddings: sentence-transformers (all-MiniLM-L6-v2)
  → Sparse embeddings: TF-IDF with learned vocabulary
  → Vector store: SQLite + sqlite-vec extension
  → Combined similarity: 65% dense + 35% sparse

ELEMENT 3: CONTEXT OPTIMIZER
  rag/optimizer.py
  → Task complexity classifier (4 profiles: quick_check, standard_review,
    deep_analysis, governance_gate)
  → Chunk quality scoring (tier, freshness, historical quality, citations)
  → Diversity enforcer (max per source, max per heading)
  → Tier allocation (Pareto 80/20: 80% budget to T1)
  → Adversary injector (Kahneman premortem: "assume our plan failed")

ELEMENT 4: FULL RETRIEVAL PIPELINE
  rag/retriever.py
  → Query rewriter (Lasswell model: expand 1 query → 3-5 variants)
  → Hybrid retrieval (dense + sparse + metadata filter)
  → Cross-encoder re-ranker (lightweight heuristic: term overlap, key phrase,
    structure relevance, citation presence)
  → Context compressor (keep Commander's Intent + citation per chunk)
  → Format injection (Cialdini Authority: citations BEFORE content)

ELEMENT 5: SMART INJECTOR
  rag/injector.py (22 tests)
  → Layer 1: Sentence-Level Relevance Pruning (60-85% savings)
      Score every sentence against query. Keep Commander's Intent + citations.
      Drop filler, introductions, examples, metacommentary.
  → Layer 2: Citation-Only Mode for Formula Queries (85-95% savings)
      When Shared OS scripts computed a value, drop formula explanation.
      "[COMPUTED] npv() = $137,236 [Brealey & Myers, Ch.5]"
  → Layer 3: Agent-Specific Compression Profiles
      46 agents → 5 compression types (creative, governance, strategy, technical, general)
      Spark: verbatim, image-friendly. Board: formula-only, NEVER image numbers.

ELEMENT 6: FEEDBACK LOOP
  rag/feedback.py
  → Log every injection outcome (accept/reject)
  → Update chunk quality scores based on outcomes
  → Lasswell trace for audit: who said what, to whom, in which channel, with what effect

ELEMENT 7: MULTI-STRATEGY ENGINE
  rag/strategy.py (23 tests)
  → Content type classifier (5 types: formula, creative, structured, prose, citation)
  → Strategy selector per chunk (auto-routes to best compression path)
  → pxpipe integration: image-friendly chunks → PNG (67% vision token savings)
  → Exact values (numbers, citations, computed facts) NEVER imaged

ELEMENT 8: UNIFIED PRODUCTION PIPELINE ★
  rag/unified_pipeline.py (31 tests)
  → Domain keyword classifier (fixed — prioritizes domain terms over generic verbs)
  → Strategy router: FAST (Destructor v2) vs BALANCE (Adaptive+Recovery)
  → 5-trigger recovery pass: novel_fact, exception, contradiction,
    missing_source, defines_term
  → Single entry point: unified_pipeline.inject(query, agent_id, chunks)
```

### Pipeline Data Flow

```
┌──────────────────┐
│  DOCUMENTS (.md) │
└────────┬─────────┘
         │ chunkify.py
         ▼
┌──────────────────┐     ┌──────────────────┐
│  chunks.json     │────▶│  embed.py         │
│  priority tiers  │     │  dense + sparse   │
│  adversarial     │     │  → sqlite-vec     │
└──────────────────┘     └────────┬─────────┘
                                  │
         ┌────────────────────────┼───────────────────────┐
         │                        ▼                       │
         │              ┌──────────────────┐              │
         │              │  bridge.py        │  ← CIE call │
         │              │  stdin/stdout     │              │
         │              │  JSON protocol    │              │
         │              └────────┬─────────┘              │
         │                       │                        │
         │     ┌─────────────────┼─────────────────┐      │
         │     ▼                 ▼                 ▼      │
         │ ┌─────────┐   ┌─────────────┐   ┌───────────┐ │
         │ │retriever│   │formula exec │   │ optimizer  │ │
         │ │query→   │   │detect NPV,  │   │task class │ │
         │ │rewrite→ │   │WACC, risk → │   │diversity→ │ │
         │ │retrieve→│   │compute→     │   │adversary→ │ │
         │ │rerank   │   │inject facts │   │tier alloc │ │
         │ └────┬────┘   └──────┬──────┘   └─────┬─────┘ │
         │      └───────────────┼─────────────────┘      │
         │                      ▼                        │
         │           ┌─────────────────────┐             │
         │           │ unified_pipeline.py │ ★           │
         │           │ ┌─────────────────┐ │             │
         │           │ │ classify query  │ │             │
         │           │ │ route strategy  │ │             │
         │           │ ├─────────────────┤ │             │
         │           │ │ FAST   │BALANCE │ │             │
         │           │ │destruct│adapt+  │ │             │
         │           │ │  v2    │recovery│ │             │
         │           │ └────────┴────────┘ │             │
         │           └──────────┬──────────┘             │
         │                      ▼                        │
         │           ┌─────────────────────┐             │
         │           │ INJECTION TEXT      │             │
         │           │ → LLM context       │             │
         │           └──────────┬──────────┘             │
         │                      ▼                        │
         │           ┌─────────────────────┐             │
         │           │ FEEDBACK LOOP       │             │
         │           │ log outcome →       │             │
         │           │ update quality →    │             │
         │           │ Lasswell trace      │             │
         │           └─────────────────────┘             │
         └──────────────────────────────────────────────┘
```

---

## 7. BRIDGE PROTOCOL — CIE ⇆ RAG INTEGRATION

The TypeScript CIE communicates with the Python RAG pipeline via subprocess stdin/stdout JSON:

```
CIE (TypeScript)                              RAG (Python)
     │                                              │
     │  echo '{"query":"...","agent_id":"..."}'     │
     │  | python3 rag/bridge.py --mode retrieve     │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │                    ┌─────────────────────┐    │
     │                    │ 1. Detect formulas  │    │
     │                    │ 2. RAG retrieval    │    │
     │                    │ 3. Optimize context │    │
     │                    │ 4. Compress inject  │    │
     │                    │ 5. Format response  │    │
     │                    └──────────┬──────────┘    │
     │                               │               │
     │  {"success":true,             │               │
     │   "injection_text":"...",     │               │
     │   "computed_formulas":[...],  │               │
     │   "trace":{...}}              │               │
     │◀──────────────────────────────┘               │
     │                                              │

Three modes:
  --mode retrieve   → query → injection_text + computed facts + trace
  --mode formula    → direct formula execution (no retrieval)
  --mode feedback   → log outcome → update quality scores
```

---

## 8. CIE (CONTEXT INTELLIGENCE ENGINE) — TypeScript Core

```
src/cie/
├── index.ts              Module entry point
├── types.ts              Type definitions (InjectionRequest, RetrievalResult, etc.)
├── classifier.ts         Task classification → routes to agent + skill
├── retriever.ts          Knowledge retrieval → calls bridge.py
├── ranker.ts             Re-ranks context for relevance
├── builder.ts            Builds final context payload for LLM
├── cache.ts              Context caching layer (LRU)
├── graph-resolver.ts     Knowledge graph resolver
├── rag-bridge.ts         Bridge: TypeScript → Python via subprocess
├── algorithms.ts         Bloom filter, MinHash, TF-IDF, Priority Queue, BFS, Circuit Breaker
│
└── sources/              Knowledge sources (where CIE pulls context from)
    ├── agent-memory.ts       Agent's own memory/experience
    ├── codegraph.ts          Code dependency graph
    ├── graphify.ts           Code structure graph
    ├── hermes-memory.ts      Hermes agent memory (CRDT-synced)
    ├── project-docs.ts       Project documentation (.md files)
    └── shared-os-logical.ts  Shared OS logical scripts (35 Python modules)
```

---

## 9. TOON COMPRESSION SYSTEM

```
src/toon/
├── toon.ts          Core TOON type definitions / encoding
├── compressor.ts    TOON compression engine
└── delta.ts         Delta (differential) TOON updates

Key metrics:
  → 84.5% average token savings
  → Every .md file has a parallel .toon file
  → ~650 .toon files across the project
```

---

## 10. GOVERNANCE PIPELINES (TypeScript)

```
src/pipelines/
├── caos-executor.ts      CAOS (Context-Aware Orchestration System)
│                          Orchestrates multi-agent workflows
│                          Manages context injection per agent
│                          Handles the agent-to-agent handoff protocol
│
├── content-pipeline.ts   Content processing pipeline
│                          Brand Studio agents: spark→muse→lena→pixel
│                          Creative review → ideation → copy → visual
│
└── governance-gate.ts    Governance gate pipeline
                           4-gate cycle: recommend→review→approve→audit
                           Board + precedent + sentinel interaction
                           Fiduciary guard thresholds: $10K / $50K / $250K
```

---

## 11. KNOWLEDGE FOUNDATION (12 PDF Books)

```
Teams/Books/
├── Kotler & Keller - Marketing Management (14th Edition)     [34MB]
├── Jonah Berger - Contagious: Why Things Catch On            [1.5MB]
├── David Aaker - Building Strong Brands                      [37MB]
├── Binet & Field - The Long and Short of It                  [SYS1]
├── Robert McKee - Story                                      [18MB]
├── Heath brothers - Made to Stick                            [PDF]
├── Robert Cialdini - The Psychology of Persuasion            [PDF]
├── Seth Godin - Purple Cow                                   [PDF]
├── Donald Miller - Building a StoryBrand                     [PDF]
└── [2 additional marketing references]
```

Plus 6 Route D wisdom documents (`Teams/Shared OS/logical/`):
```
ogilvy-creative-code.md        Ogilvy's creative principles (Ch.1, p.20)
aaker-brand-equity.md          Aaker's brand equity model (Ch.3)
berger-contagious.md           Berger's STEPPS framework
binet-field-effectiveness.md   Binet & Field effectiveness model
heath-made-to-stick.md         Heath brothers SUCCESs framework
mckee-story-structure.md       McKee's 5-part story structure
```

---

## 12. COMPLETE TEST SUITE

```
Module                          Tests    Status
──────────────────────────────────────────────
rag/injector.py                  22      ✅ All passing
rag/strategy.py                  23      ✅ All passing
rag/destructor.py                35      ✅ All passing
rag/unified_pipeline.py          31      ✅ All passing
──────────────────────────────────────────────
TOTAL                           111      ✅ ALL GREEN
```

Plus separate test suites in:
- `rag/retriever.py` — Full pipeline smoke tests
- `rag/optimizer.py` — Task classification + quality scoring
- `rag/benchmark.py` — 7-scenario comparison suite
- `cli/verify-caos.py` — E2E CAOS verification

---

## 13. COMMANDS

```bash
# Python RAG tests
python3 rag/unified_pipeline.py --test       # 31 tests
python3 rag/destructor.py --test              # 35 tests
python3 rag/strategy.py --test                # 23 tests
python3 rag/injector.py --test                # 22 tests
python3 rag/destructor.py --demo              # Budget guarantee demo
python3 rag/unified_pipeline.py --demo        # 12-scenario strategy demo
python3 rag/benchmark.py                      # 3-pipeline comparison

# TypeScript (requires npm install)
npx yvon init     # Initialize YVON in current directory
npx yvon doctor   # Health check on fleet
npx yvon graph    # Show knowledge graph
npx yvon agents   # List all agents
npx yvon compress # TOON-compress Teams/ directory
npx yvon dashboard # Visual dashboard

# CLI tools
python3 cli/toonify.py                        # TOON compression
python3 cli/verify-caos.py                    # E2E CAOS verification
```

---

## 14. SINGLE ENTRY POINT FOR RAG

```python
from rag.unified_pipeline import inject

result = inject(
    query="verify our data retention policy complies with GDPR Article 5",
    agent_id="comply",
    chunks=retrieved_chunks
)

# result.strategy          → "balance"
# result.task_type         → "legal_review"
# result.task_confidence   → 0.60
# result.budget_tokens     → 385 (4.0× multiplier)
# result.savings_pct       → 38.8%
# result.quality_score     → 0.955
# result.kept_chunks       → 8
# result.recovered_chunks  → 3
# result.dropped_chunks    → 9
# result.contradictions    → 0
# result.injection_text    → "[YVON · comply · Legal Review · 385t]\n⚠️ [gdpr-compliance.md] ..."
```
