# YVON — Google agents-cli Pattern Integration

**Status:** Analysis Complete — Building Enhancements  
**Source:** github.com/google/agents-cli (Apache 2.0)  
**Date:** 2026-07-16

---

## WHAT TO ADOPT (8 patterns, all map to YVON's existing structure)

## WHAT TO DISCARD (Google Cloud-specific, replaced with YVON equivalents)

| Google Pattern | Why Discard | YVON Replacement |
|----------------|------------|------------------|
| `agents-cli deploy --deployment-target cloud_run/gke` | GCP-specific container deployment | `yvon tenant provision` (deploys to YVON's agent fleet) |
| `agents-cli publish gemini-enterprise` | Gemini Enterprise registration | `yvon publish --marketplace agentx` (AgentX marketplace) |
| `agents-cli infra single-project` | GCP Terraform project setup | N/A — YVON runs locally, no cloud infra needed |
| BigQuery Agent Analytics | GCP-specific data warehouse | `rag/field_monitor.py` (already built) |
| Cloud Trace spans | GCP-specific tracing | Lasswell traces (already built in feedback.py) |
| IAP / Workload Identity | GCP IAM | relay's least-privilege grants (already built) |
| Cloud Build CI/CD | GCP-specific CI | `self_improver.py` sandbox testing (already built) |
| gcloud CLI | GCP SDK | N/A — no cloud dependency |
| Vertex AI Eval Service | GCP-specific eval | `rag/verifier.py` + local eval (already built + enhance) |
| Agent Runtime sessions | GCP-specific session management | Per-tenant SQLite graph DB (planned Phase 2) |

---

## PATTERN 1: MANIFEST-BASED PROVISIONING (from agents-cli-manifest.yaml)

### What Google Does
```yaml
# agents-cli-manifest.yaml
agent_directory: app
create_params:
  deployment_target: cloud_run
  session_type: agent_platform_sessions
  agent_template: adk
```

### What YVON Builds
```yaml
# tenant-manifest.yaml (NEW)
tenant_id: boutique-a
business_name: "Boutique A"
industry: fashion_retail
departments:
  - brand-studio:
      agents: [spark, lena, pixel, pulse]
      config:
        brand_voice: "warm, inclusive, premium"
        target_audience: "women 25-45"
        content_cadence: weekly
  - product:
      agents: [spec, metric]
tier: growth
created_at: 2026-07-16
provisioned_by: yvon-core
deployment_version: 1.0.0
integrations:
  - instagram: {status: active, auth: oauth}
  - shopify: {status: active, auth: api_key}
```

File: `platform/manifest.py` — reads/writes tenant-manifest.yaml, validates schema, preserves creation parameters for upgrades.

---

## PATTERN 2: SCAFFOLD → ENHANCE → UPGRADE (from agents-cli scaffold)

### What Google Does
```
agents-cli scaffold create my-agent --prototype     # Minimal
agents-cli scaffold enhance . --deployment-target   # Add deployment
agents-cli scaffold upgrade --dry-run               # Preview upgrade
```

### What YVON Builds
```
yvon tenant create boutique-a \
  --departments brand-studio \
  --tier growth \
  --prototype          # No integrations, synthetic data for testing

yvon tenant enhance boutique-a \
  --add-integrations instagram,shopify \
  --add-department product

yvon tenant upgrade boutique-a \
  --dry-run            # Preview manifest changes
```

File: `platform/scaffold.py` — creates tenant directory structure, copies agent definitions, applies business-specific overrides, provisions isolated graph DB.

---

## PATTERN 3: EVAL DATASETS + QUALITY FLYWHEEL (from agents-cli eval)

### What Google Does
```
agents-cli eval generate       # Run agent on dataset
agents-cli eval grade          # LLM-as-judge scoring
agents-cli eval analyze        # Failure clustering
agents-cli eval optimize       # Auto-tune prompts (GEPA)
agents-cli eval compare        # A/B test two versions
```
The eval SKILL.md defines 6 built-in metrics and a 5-stage quality flywheel.

### What YVON Builds

YVON already has `rag/verifier.py` (grounded citations + self-consistency + constitution). Enhance it with:

**New: Eval Dataset System**

File: `rag/eval_dataset.py`
```python
# Eval dataset format
{
  "dataset_id": "headline_review_v1",
  "agent": "spark",
  "scenarios": [
    {
      "query": "Review this headline for the campaign",
      "expected_citations": ["Ogilvy Ch.5", "p.71"],
      "expected_rules": ["Must include brand name"],
      "expected_no_claims": ["unsupported speculation"],
      "rubric": {
        "citation_accuracy": 0.8,
        "rule_adherence": 0.9,
        "no_hallucination": 1.0
      }
    }
  ]
}
```

**New: Quality Flywheel** (5 stages, from Google's eval SKILL.md)

File: `rag/quality_flywheel.py`
```
Stage 1: Prepare Data → yvon eval generate
Stage 2: Run Inference → yvon eval run --agent spark
Stage 3: Grade Traces → yvon eval grade (LLM-as-judge on rubric)
Stage 4: Analyze Failures → yvon eval analyze (cluster failures)
Stage 5: Optimize → yvon eval optimize (auto-tune budget parameters)
```

**New: LLM-as-Judge Grading**

File: `rag/eval_judge.py`
```python
def grade_agent_output(output, rubric, injected_chunks):
    """Grade agent output against rubric using LLM-as-judge."""
    # Uses the same verifier.py patterns but with rubric-based scoring
    return {
        'citation_accuracy': 0.92,
        'rule_adherence': 0.88,
        'no_hallucination': 0.95,
        'overall': 0.91
    }
```

---

## PATTERN 4: PROTOTYPE-FIRST (from agents-cli --prototype flag)

### What Google Does
Start minimal (no CI/CD, no Terraform, no deployment), iterate fast, add infrastructure later with `scaffold enhance`.

### What YVON Builds
```yvon tenant create --prototype``` provisions a tenant with:
- Synthetic data only (no real integrations connected)
- 7-day trial period
- Demo dashboard with sample content
- Business can test before committing

```yvon tenant upgrade --to production``` adds:
- Real external integrations (OAuth flow)
- Production monitoring (field_monitor activated)
- Billing starts
- Live agent sessions

---

## PATTERN 5: AGENT CARD + DISCOVERY (from agents-cli publish)

### What Google Does
```
agents-cli publish gemini-enterprise
```
Creates an Agent Card so other agents can discover this one.

### What YVON Builds

**Agent Card Format** (new: `platform/agent_card.py`)

```yaml
# agent-card.yaml
agent_id: spark
display_name: "Creative Director"
persona: "David Ogilvy — the Father of Advertising"
what_it_does:
  - "Reviews and critiques creative work (ads, headlines, visuals)"
  - "Ensures brand consistency across all channels"
  - "Coaches other creative agents (lena, pixel, muse)"
what_it_needs:
  - "Brand guidelines document"
  - "Target audience profile"
  - "Campaign brief"
tools_used:
  - MCP: Browserbase (visual review)
  - API: Canva (design assets)
pricing:
  starter: {price: 49, included: true}
  growth: {price: 149, included: true}
  scale: {price: 399, included: true}
department: brand-studio
```

**Marketplace Discovery** (new: `src/platform/agent-marketplace.ts`)

```
AgentX Marketplace:
  Businesses browse available agents
  → See Agent Card (what it does, pricing, requirements)
  → "Add to my business"
  → Tenant provisioner deploys agent subset
  → Agent starts working
```

---

## PATTERN 6: OBSERVABILITY TIERS (from agents-cli observe)

### What Google Does
Three tiers: Cloud Trace (always on) → Prompt-Response Logging (on deploy) → BigQuery Analytics (opt-in).

### What YVON Builds

YVON already has `rag/field_monitor.py`. Mirror the tier system:

| YVON Tier | Google Equivalent | Default | Implementation |
|-----------|------------------|---------|---------------|
| **Trace** | Cloud Trace | Always on | `field_monitor.py` attractors + degradation |
| **Logging** | Prompt-Response Logging | On for owned brands, opt-in for tenants | `feedback.py` Lasswell traces |
| **Analytics** | BigQuery Analytics | Opt-in (adds cost) | `field_monitor.py` weekly reports |

File: `platform/observability.py` — configures which tiers are active per tenant.

---

## PATTERN 7: LIFECYCLE MAPPING (8 phases → YVON gates)

### Google's 8 Phases → YVON's Implementation

| Google Phase | YVON Gate/Module | Status |
|-------------|-----------------|--------|
| 0 — Spec | Constitution (board enforces) + `platform/manifest.py` | 🔄 Build |
| 1 — Scaffold | `platform/scaffold.py` (tenant create) | 🔄 Build |
| 2 — Build | 46 agent definitions + 200+ SKILL.md files | ✅ Complete |
| 3 — Orchestrate | CAOS executor (TypeScript) | ✅ Complete |
| 4 — Evaluate | `rag/verifier.py` + `rag/eval_dataset.py` + `rag/eval_judge.py` | 🔄 Enhance |
| 5 — Deploy | `platform/scaffold.py` (tenant provision) | 🔄 Build |
| 6 — Publish | `platform/agent_card.py` + marketplace | 🔄 Build |
| 7 — Observe | `rag/field_monitor.py` + `platform/observability.py` | 🔄 Enhance |

---

## PATTERN 8: SKILL ARCHITECTURE (identical — validates YVON's approach)

### What Google Does
7 installable skills (Markdown docs), loaded into coding agents via `agents-cli setup`. Each skill has triggers, explicit boundaries, and cross-references.

### What YVON Already Does (Identical Pattern)
200+ SKILL.md files across 46 agents. Each SKILL.md follows a 9-section format. The skill routing (`operational/skill/`) determines which activates per query. Progressive disclosure (`progressive_disclosure.py`) loads only matched skills.

**YVON's advantage:** Google has 7 skills for the CLI itself. YVON has 200+ operational skills for the business agents. Google's skill system confirms YVON's approach. No changes needed.

---

## WHAT GETS BUILT

### New Files (8)

| File | Purpose | Size Est |
|------|---------|---------|
| `platform/manifest.py` | Read/write/validate tenant-manifest.yaml. Versioned. Preserves creation params for upgrades. | ~200L |
| `platform/scaffold.py` | `yvon tenant create/enhance/upgrade`. Provisions tenant directory, copies agent defs, applies overrides, creates graph DB. Supports --prototype and --dry-run. | ~400L |
| `rag/eval_dataset.py` | Eval dataset schema + generator. Scenarios with rubrics, expected citations, expected rules. | ~250L |
| `rag/eval_judge.py` | LLM-as-judge grading against rubric. Scores: citation_accuracy, rule_adherence, no_hallucination. Quality flywheel integration (5 stages). | ~300L |
| `rag/quality_flywheel.py` | 5-stage loop: prepare data → run inference → grade traces → analyze failures → optimize. Coordinate eval_dataset + eval_judge + verifier. | ~200L |
| `platform/agent_card.py` | Agent Card schema + generator. Display name, persona, what it does, what it needs, tools used, pricing tiers. Publish to marketplace. | ~150L |
| `platform/observability.py` | Per-tenant observability tier configuration. Trace (always), Logging (owned/opt-in), Analytics (opt-in). Wraps field_monitor. | ~150L |
| `cli/yvon.py` | CLI entry point: `yvon tenant create/enhance/upgrade`, `yvon eval generate/grade/analyze/optimize`, `yvon publish`, `yvon observe`. | ~300L |

### Modified Files (4)

| File | Change |
|------|--------|
| `rag/verifier.py` | Add rubric-based grading integration with eval_judge |
| `rag/field_monitor.py` | Add observability tier gating |
| `rag/self_improver.py` | Add cross-tenant learning mode |
| `rag/unified_pipeline.py` | Add per-tenant context routing |

### Total: 8 new files, 4 modified, ~1950 lines of new code, ~60 new tests
