# YVON Engine v1.3.0 — AI Agent OS Kernel

**One npm install. 46 agents. 7 departments. Full RAG pipeline with 5-gate harness.**

YVON is an agent operating system — a fleet of 46 AI agents organized into 7 departments, backed by a production RAG pipeline with source authentication, reliability scoring, conflict detection, priority assembly, and quarantine. Multi-tenant architecture designed for managing owned brands (Novizio, Hourbour) and the AgentX SaaS platform for small businesses.

---

## Quick Start

```bash
# Install
git clone https://github.com/OfficialNovizio/YVON-Engine
cd YVON-Engine
npm install

# Run all tests (285+ passing)
npm test

# Dashboard
cd dashboard && npm install && npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
YVON-Engine/
│
├── Teams/                         # 46 agents across 9 departments
│   ├── AI & Agents/               # 8 agents — fleet management
│   ├── Brand Studio/              # 11 agents — creative & marketing
│   ├── Cybersecurity/             # 5 agents — security & compliance
│   ├── Engineering/               # 11 agents — development & QA
│   ├── Executive Office/          # 3 agents — strategy & vision
│   ├── Governance/                # 3 agents — oversight & audit
│   ├── Product/                   # 5 agents — product & analytics
│   └── Shared OS/                 # 35 logical scripts + skills
│
├── rag/                           # Python RAG Pipeline (285+ tests)
│   ├── core/                      # Pipeline engine (9 modules)
│   │   ├── injector.py           # 3-layer compression (22 tests)
│   │   ├── strategy.py           # Multi-strategy token pipeline (23 tests)
│   │   ├── destructor.py         # Hard budget enforcement (35 tests)
│   │   ├── optimizer.py          # Dynamic context optimizer (24 tests)
│   │   ├── retriever.py          # Full retrieval pipeline (20 tests)
│   │   ├── bridge.py             # CIE to/from RAG bridge (16 tests)
│   │   ├── embed.py              # Hybrid embedder (dense + sparse) (12 tests)
│   │   ├── chunkify.py           # Semantic chunker (17 tests)
│   │   └── feedback.py           # Quality feedback loop (13 tests)
│   │
│   ├── harness/                   # 5-gate verification (2 modules)
│   │   ├── gates.py              # Source auth, reliability, conflict, priority, quarantine (35 tests)
│   │   └── disclosure.py         # Progressive skill disclosure (23 tests)
│   │
│   ├── eval/                      # Quality assessment (2 modules)
│   │   ├── judge.py              # 6-metric LLM-as-judge scoring (10 tests)
│   │   └── flywheel.py           # 5-stage iterative improvement loop (12 tests)
│   │
│   ├── monitor/                   # Field monitoring (2 modules)
│   │   ├── watcher.py            # Attractors, degradation, coverage, drift (17 tests)
│   │   └── improver.py           # Weekly autonomous optimization (20 tests)
│   │
│   ├── verify/                    # Post-hoc verification
│   │   └── grounded.py           # Grounded citation + self-consistency (16 tests)
│   │
│   ├── experiments/               # Standalone (not production)
│   │   ├── adaptive_recovery.py  # Option 1+3 pipeline
│   │   ├── relational_graph.py   # Option 2+4 pipeline
│   │   ├── benchmark.py          # Comparison suite
│   │   └── e2e.py                # 12-scenario E2E validation
│   │
│   ├── books/                     # Design rationale
│   ├── chunks/                    # chunks.json (4,839 chunked)
│   └── store/                     # SQLite vector store
│
├── src/                           # TypeScript CIE + Pipelines
│   ├── cie/                       # Context Intelligence Engine
│   ├── pipelines/                 # Governance gate + content pipeline
│   ├── graphs/                    # Code dependency + structure graphs
│   └── toon/                      # TOON compression
│
├── dashboard/                     # Next.js 14 React Dashboard
│   ├── app/                       # 6 pages (Brands, Detail, Monitor, Analytics, Settings, Add Brand)
│   ├── components/                # Reusable (Sidebar, BrandCard, MetricCard)
│   └── lib/                       # Types + API integration
│
├── docs/                          # Documentation (consolidated 2026-07-30)
│   ├── MASTER.md                  # Single source of truth — PART 0-7 + APPX A-C
│   ├── AGENT-BUILD-PLAYBOOK.md    # How to build an agent + §0 ground rules
│   └── SESSION-HANDOUT.md         # Living session handoff
│
├── cli/                           # CLI tools (yvon.js, toonify.js)
├── dist/                          # Compiled TypeScript
└── package.json                   # npm package: yvon-engine
```

---

## Agent Fleet — 46 Agents × 7 Departments

| Department | Agents | Purpose |
|-----------|--------|---------|
| **Executive Office** | marcus, echo, vista | Strategy, investor relations, roadmap |
| **Governance** | board, precedent, sentinel | Fiduciary oversight, legal consistency, audit |
| **Engineering** | dev, ops, quinn, aegis, cypher, axiom, dana, raj, mia, nova, rank | Architecture, DevOps, QA, security, data, backend, frontend, mobile, SEO |
| **Cybersecurity** | warden, keyring, bastion, cortex, veil | GRC, IAM, infrastructure security, detection, data protection |
| **Product** | spec, metric, ux, loom, price | PRD, analytics, research, validation, pricing |
| **AI & Agents** | meta, relay, gauge, anneal, forge, scout, proto, edge | Fleet governance, integrations, quality, improvement, benchmarking, ecosystem, prototyping, adoption |
| **Brand Studio** | spark, atlas, lena, weave, muse, pixel, pulse, rio, nate, kai, tempo | Creative direction, brand, copywriting, storytelling, ideation, visual, social, ads, growth, analytics, audio |

Each agent follows a standard structure: `agent.md` (definition) → `identity/` (persona) → `custom/` (SKILL.md files) → `operational/` (config, commands, principles, skill routing, tool requirements) → `logical/` (book requirements).

---

## RAG Pipeline — Full Workflow

```
QUERY: "review this headline copy for the campaign"
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: CLASSIFICATION + PROGRESSIVE DISCLOSURE                  │
│                                                                  │
│  Domain keyword classifier → task_type + agent_id                │
│  "headline + campaign" → creative_review → spark                │
│                                                                  │
│  Progressive skill disclosure: load only 2-3 matched skills      │
│  from spark's roster (40-60% savings on skill context)           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: HYBRID RETRIEVAL + OPTIMIZATION                         │
│                                                                  │
│  Query rewrite (3-5 variants) → dense + sparse search            │
│  → cross-encoder rerank → top-20 candidates                      │
│                                                                  │
│  Dynamic optimizer: task profile → tier allocation →             │
│  source diversity → adversary injection (premortem)              │
│                                                                  │
│  ★ AGENT BONUS: agent's own files get +0.15 retrieval boost     │
│  (dev's delivery-governance competes with Shared OS wisdom)      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: HARNESS — 5 GATES IN SEQUENCE                           │
│                                                                  │
│  GATE 1 — SOURCE AUTHENTICATION                                  │
│  ─────────────────────────────                                   │
│  • Source file exists on disk? → if not, BLOCK                   │
│  • Chunk hash matches? → if not, FLAG (tampered)                 │
│  • Book citation traceable? → check Teams/Books/                 │
│  • Within agent's authorized departments? → if not, BLOCK        │
│                                                                  │
│  GATE 2 — MULTIPLICATIVE RELIABILITY                             │
│  ────────────────────────────────────                            │
│  reliability = freshness × authority × quality_score             │
│  Authority levels: book=1.0, standard=0.9, shared_os=0.85,       │
│    dept_doc=0.7, agent=0.65, skill=0.55, playbook=0.5,          │
│    operational=0.4, unknown=0.2                                  │
│  Junk chunk: 0.3×0.2×0.5 = 0.03                                 │
│  Authority:   0.9×1.0×0.95 = 0.855                               │
│  948x separation between authoritative and junk                  │
│                                                                  │
│  GATE 3 — CONFLICT DETECTION                                     │
│  ─────────────────────────────                                   │
│  • Text overlap + negation + opposition detection                │
│  • Relational graph: DEFINES, EXTENDS, CONTRADICTS, SUPERSEDES   │
│  • Same-dept needs 5 shared terms (avoid false positives)        │
│  • Contradictions flagged in context: "⚠️ Agent must reconcile"  │
│                                                                  │
│  GATE 4 — PRIORITY-BASED BUDGET ASSEMBLY                         │
│  ──────────────────────────────────────                          │
│  P0: Agent identity (always)                                     │
│  P1: Active skills (progressive-loaded)                          │
│  P2: Computed facts (Shared OS results)                          │
│  P3: T1 verified chunks (load-bearing)                           │
│  P4: T2 structural chunks                                        │
│  P5: One adversarial chunk                                       │
│  P6: T3 supplementary                                            │
│  P7: Inactive skill summaries                                    │
│  Budget fills P0→P7. Exhausted → remaining dropped.              │
│                                                                  │
│  GATE 5 — QUARANTINE + RECOVERY                                  │
│  ──────────────────────────────────                              │
│  • Reliability < threshold → quarantine (log + notify operator)  │
│  • Recovery scan: novel facts, exceptions, contradictions        │
│  • Pull back dropped chunks that should not have been dropped    │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 4: STRATEGY ROUTING + INJECTION                             │
│                                                                  │
│  FAST path: creative/factual/copy → Destructor v2 (64-89% save)  │
│  BALANCE path: everything else → Adaptive + Recovery (39-77%)    │
│                                                                  │
│  3-layer compression:                                             │
│    Layer 1: Sentence pruning (60-85% savings)                    │
│    Layer 2: Citation-only mode (85-95% savings on formulas)      │
│    Layer 3: Agent-specific profiles (46 agents → 5 types)        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 5: LLM GENERATION + POST-HOC VERIFICATION                   │
│                                                                  │
│  hermes+claude → primary reasoning                               │
│  deepseek → adversarial verification                             │
│  chatgpt → content/creative quality                              │
│                                                                  │
│  verifier.py:                                                     │
│    Layer 1: Grounded citation check (is every claim supported?)  │
│    Layer 2: Self-consistency check                               │
│    Layer 3: Constitution compliance                              │
│                                                                  │
│  High-stakes tasks (legal, governance) → delegate to             │
│  quinn/precedent/sentinel for additional verification            │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 6: FEEDBACK LOOP + FIELD MONITORING                         │
│                                                                  │
│  feedback.py: quality_new = quality_old × 0.95 + outcome × 0.05  │
│  field_monitor.py: attractors, degradation, coverage gaps, drift │
│  self_improver.py: weekly analyze → propose → sandbox test →    │
│    deploy (all passing → auto; any failing → hold + report)      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5-Gate Harness — Visual

```
   20 CANDIDATE CHUNKS
        │
   ┌────▼────┐
   │ GATE 1  │ SOURCE AUTH: 18 verified · 1 flagged · 1 blocked
   └────┬────┘
        │
   ┌────▼────┐
   │ GATE 2  │ RELIABILITY: freshness × authority × quality
   └────┬────┘    3 quarantined (below threshold)
        │
   ┌────▼────┐
   │ GATE 3  │ CONFLICT: 1 contradiction detected (NIST vs ISO)
   └────┬────┘    Flag injected: "⚠️ Agent must reconcile"
        │
   ┌────▼────┐
   │ GATE 4  │ PRIORITY: P0→P5 filled (680t), P6 dropped
   └────┬────┘
        │
   ┌────▼────┐
   │ GATE 5  │ QUARANTINE: 3 excluded + logged
   └────┬────┘    RECOVERY: 1 exception chunk pulled back
        │
        ▼
   VERIFIED CHUNKS (5-8 with conflict flags)
```

---

## Strategy Routing — FAST vs BALANCE

| Task Type | Strategy | Budget | Savings | Quality | When |
|-----------|----------|--------|---------|---------|------|
| creative_review | FAST | 80-100t | 64-89% | 0.24-0.58 | Model knows Ogilvy from training |
| copy_edit | FAST | 80t | 64% | 0.58 | Model knows grammar |
| factual_lookup | FAST | 80t | 64% | median | One citation answers query |
| standard_review | BALANCE | 1.0× | 60-70% | 0.50-0.70 | Needs moderate context |
| engineering_debug | BALANCE | 1.5× | 77% | 0.50 | Code patterns + architecture |
| financial_analysis | BALANCE | 2.0× | 70% | 0.70-0.80 | Formulas + caveats + sensitivity |
| governance_decision | BALANCE | 2.5× | 62% | 0.64 | Precedents + thresholds |
| strategic_analysis | BALANCE | 3.0× | 54% | 0.77 | Multiple perspectives |
| legal_review | BALANCE | 4.0× | 39% | 0.96 | Missing context = liability |

---

## Token Savings Pipeline

| Component | Savings | Method |
|-----------|---------|--------|
| Sentence pruning | 60-85% | Commander's Intent + citations only |
| Citation-only mode | 85-95% | Formula chunks → computed value + citation |
| Agent profiles | 40-70% | Per-agent compression budgets |
| Hard budget guarantee | 80-90% | 15% of input, never exceed |
| Progressive disclosure | 40-60% | Skill lazy loading per query |
| Destructor v2 | 22-91% | Adaptive to input size |
| **Stacked** | **90-98%** | All layers active |

---

## Dashboard — Next.js 14 React App

6 pages accessible from the sidebar:

| Route | Page | Content |
|-------|------|---------|
| `/` | Brands | Health ring grid (hero), pipeline stats, activity timeline |
| `/brands/[id]` | Brand Detail | Per-brand metrics, content calendar, plan |
| `/monitor` | Monitor | 16 module test results, harness gate status |
| `/analytics` | Analytics | Pipeline runs + brand performance tables |
| `/settings` | Settings | Pipeline config, connected brands |
| `/add-brand` | Add Brand | 3-step wizard → provision → deploy |

**What business owners see:** Content calendar, engagement numbers, plan info — never agent internals.
**What operators see:** Fleet health, RAG metrics, brand grid, alerts, graph vitals.

---

## Commands

```bash
# Full test suite (all 16 modules, 285+ tests)
npm test

# Individual modules
cd rag
python3 -c "
import sys,os; sys.path.insert(0,'core'); sys.path.insert(0,'harness')
sys.path.insert(0,os.path.join('..','Teams','Shared OS','logical'))
exec(open('core/injector.py').read())
"

# Live pipeline query
cd rag
python3 -c "
import sys,os; sys.path.insert(0,'core'); sys.path.insert(0,'harness')
sys.path.insert(0,os.path.join('..','Teams','Shared OS','logical'))
from retriever import retrieve
r = retrieve('review headline copy', agent_id='spark', agent_dept='Brand Studio')
print(f'Chunks: {len(r.optimized.selected_chunks)}')
for c in r.optimized.selected_chunks:
    print(f'  {c.get(\"source_file\",\"?\")[:50]}')
"

# Dashboard
cd dashboard && npm install && npm run dev

# TypeScript build
npm run build

# TypeScript watch
npm run dev

# CLI
node cli/yvon.js doctor    # Fleet health check
node cli/yvon.js agents    # List all 46 agents
node cli/yvon.js graph     # Generate knowledge graph reports
```

---

## Recent Work (July 2026)

### Architecture
- 4-layer multi-tenant architecture designed (YVON Core → Agent Layer → Integration Layer → AgentX Platform)
- Google agents-cli patterns integrated (scaffold, eval flywheel, manifest, agent cards, observability tiers)
- Complete work tree with 11 layers and fallback matrix
- Duplicate department directories removed (673 files), Teams/ is single source
- Project restructured: rag/ → core/harness/eval/monitor/verify/experiments + docs/

### RAG Pipeline
- **Harness**: 5-gate verification module built (authenticate, reliability, conflict, priority, quarantine)
- **Eval**: 6-metric LLM-as-judge + 5-stage quality flywheel (from Google agents-cli)
- **Progressive disclosure**: Skill lazy loading (40-60% context savings)
- **Verifier**: Post-hoc grounded citation + self-consistency + constitution
- **Relational graph**: Wired into harness Gate 3 (DEFINES/EXTENDS/CONTRADICTS/SUPERSEDES)
- **Self-improver**: Weekly autonomous optimization (analyze → propose → sandbox test → deploy)
- **Field monitor**: Attractors, degradation, coverage gaps, drift

### Pipeline Fixes (from live debugging)
- **quality_score bug**: chunks.json had no quality_score (all flat 0.5). Fixed in chunkify.py
- **Same-source conflicts**: Same-file chunks created false SUPERSEDES edges. Fixed — skip edges for same source_file
- **Agent retrieval bug**: Fallback path cutoff excluded all Engineering chunks (indices 3581+ of 4839). Fixed with department pre-filter + agent bonus (+0.15 for own files)
- **Scoring imbalance**: 45% quality weight crushed agent SKILL.md (0.65) vs wisdom docs (1.0). Rebalanced to 40/20/40
- **TypeScript build**: 6 compilation errors fixed (classifier regex, Promise typing, string→union type)

### Dashboard
- Next.js 14 App Router with 6 pages, Tailwind, Lucide icons
- Brand health rings (signature element), 200ms transitions
- Add Brand wizard (3-step → provision), API route for pipeline data
- Design approved — Clean/Modern, Inter typography, amber/slate palette

### Project Health
- Git state fixed (719 staged deletions reset), .gitignore created, .DS_Store cleaned
- requirements.txt created (sentence-transformers, scikit-learn, sqlite-vec)
- npm install fixed (6 TS errors resolved, all modules compile)
- 4,839 chunks rebuilt with quality scores v2

---

## Dependencies

### Python (requirements.txt)
- sentence-transformers (embeddings)
- scikit-learn (sparse vectors)
- sqlite-vec (vector store)
- pypdf, pdfplumber (document chunking)

### Node.js (package.json)
- Next.js 14, React 18, Tailwind CSS, Lucide React (dashboard)
- TypeScript (source compilation)

---

## Architecture Docs

All architecture lives in **one document**: [`docs/MASTER.md`](docs/MASTER.md).
The nine separate docs were consolidated on 2026-07-30 after a section-level
coverage check confirmed MASTER contained every section and body of each.

| Section | Content |
|---------|---------|
| `PART 0` | **Orientation** — micro→macro, the life of a message, `[built]` status markers |
| `PART 1` | Full project architecture — fleet, agent structure, skills, CIE, TOON |
| `PART 2` | Harness — 5-gate verification, data flow, delegation, citations |
| `PART 3` | Unified production pipeline — strategy routing, benchmarks |
| `PART 4` | Complete work tree — 11 layers, fallback matrix, test suite |
| `PART 5` | 4-layer multi-tenant architecture — Core → Agent → Integration → SaaS |
| `PART 6` | **TASK-SPEC template** — the task state machine (`store/tasks/`) |
| `PART 7` | **Unified workflow blueprint** — 5 execution scenarios + sandbox-first flow |
| `APPX A` | Code structure refactor plan |
| `APPX B` | Google agents-cli pattern integration |
| `APPX C` | Dashboard two-tier design |

| Other doc | Content |
|-----------|---------|
| `docs/AGENT-BUILD-PLAYBOOK.md` | How to build an agent + the §0 ground rules |
| `docs/SESSION-HANDOUT.md` | Living session handoff |

---

## License

MIT — YVON Engine is open source under the MIT license. Contributions welcome.
# YVON-OS-
