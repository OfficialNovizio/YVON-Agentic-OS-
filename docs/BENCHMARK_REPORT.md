# Pipeline Benchmark Report — Token Efficiency vs Quality Preservation

**Date:** 2026-07-15  
**Codebase:** YVON RAG (`/Agents/rag/`)  
**Three pipelines tested across 7 realistic scenarios**

---

## The Three Pipelines

| Pipeline | Strategy | Core Idea |
|----------|----------|-----------|
| **Destructor v2** (baseline) | Hard budget cap at 15% of input | Guarantee savings by force |
| **Adaptive + Recovery** (Option 1+3) | Task-adaptive budget + recovery pass | Give more budget when quality matters, pull back lost facts |
| **Relational + Progressive** (Option 2+4) | Dependency graph + two-pass disclosure | Model sees what's available, requests what it needs |

---

## Aggregate Results (7 scenarios)

| Metric | Destructor v2 | Adaptive+Recovery | Relational+Prog |
|--------|:---:|:---:|:---:|
| **Avg Savings** | 85.3% | 68.3% | 14.2% |
| **Avg Quality Score** | 0.320 | 0.437 | 0.657 |
| **Avg Final Tokens** | 78t | 184t | 515t |
| **Avg Chunks Kept** | 1.9 | 3.1 | — |
| **Avg Recovered Chunks** | — | 0.7 | — |
| **Avg Dependencies Resolved** | — | — | 0.0 |
| **Avg Contradictions Detected** | — | — | 0.0 |

### Composite Score (50% quality + 50% savings efficiency)

| Pipeline | Score |
|----------|:-----:|
| **Destructor v2** | **0.586** ← best composite |
| Adaptive + Recovery | 0.560 |
| Relational + Progressive | 0.399 |

### Quality Improvement Over Baseline

| Pipeline | Quality Delta |
|----------|:---:|
| Adaptive + Recovery | **+36.4%** |
| Relational + Progressive | **+105.2%** |

---

## Per-Scenario Breakdown

### Scenario 1: Creative Review (spark, 15 chunks, 784t)
```
Query: "review this headline copy for the new campaign launch"
Task Type: creative_review (budget multiplier: 0.6x)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           89.2%     0.240      85t             2k / 13d
Adaptive+Recovery       88.0%     0.200      94t             1k(0r) / 24d
Relational+Prog         26.1%     0.650      579t (P1:96t + P2:482t)    5req
```
Adaptive+Recovery misclassified the query — didn't match 'headline' to creative_review keywords since these keywords are in task type matching but the agent override took effect. Recovery found nothing to pull back. Relational passed everything through Pass 2.

### Scenario 2: Governance Decision (board, 15 chunks, 784t)
```
Query: "board fiduciary review of $50K capital expenditure threshold violation"
Task Type: governance_decision (budget multiplier: 2.5x)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           89.2%     0.240      85t             2k / 13d
Adaptive+Recovery       61.9%     0.600      299t            5k(1r) / 18d
Relational+Prog         26.1%     0.650      579t            5req
```
**Key result:** Adaptive+Recovery found 1 novel fact chunk during recovery that Destructor missed. Quality jumped from 0.240 → 0.600. Budget expanded 3x (85t → 299t) but quality improved 2.5x. This is the tradeoff working as designed — governance decisions need context.

### Scenario 3: Strategic Acquisition (marcus, 15 chunks, 784t)
```
Query: "should we acquire Competitor X for $2M valuation?"
Task Type: strategic_analysis (budget multiplier: 3.0x)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           89.2%     0.240      85t             2k / 13d
Adaptive+Recovery       54.2%     0.520      359t            6k(2r) / 16d
Relational+Prog         22.6%     0.620      607t            5req
```
**Key result:** Recovery found 2 chunks — 1 exception (curiosity-gap headline exception from c2) and 1 novel fact. This is exactly what the pipeline was designed to catch. Porter's Five Forces limitations (c15, adversary) would have been dropped by Destructor but was recovered.

### Scenario 4: Engineering Debug (dev, 11 chunks, 580t)
```
Query: "fix the deployment pipeline — tests failing on CI/CD"
Task Type: engineering_debug (budget multiplier: 1.5x)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           88.1%     0.311      69t             2k / 9d
Adaptive+Recovery       78.3%     0.333      126t            2k(0r) / 15d
Relational+Prog          1.7%     0.714      570t            5req
```

### Scenario 5: Legal Compliance (comply, 14 chunks, 751t)
```
Query: "verify our data retention policy complies with GDPR Article 5"
Task Type: factual_lookup (misclassified — should be legal_review, 0.4x multiplier)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           89.1%     0.251      82t             2k / 12d
Adaptive+Recovery       87.2%     0.200      96t             2k(0r) / 20d
Relational+Prog         22.9%     0.667      579t            5req
```
**Bug found:** "GDPR" keyword is not in legal_review keywords. Query should have gotten 4.0x multiplier but got 0.4x (factual_lookup). This is why quality didn't improve — the budget was too tight to recover anything. This is a classification failure that needs fixing.

### Scenario 6: Financial Analysis (marcus, 9 chunks, 486t)
```
Query: "compute WACC and NPV for the $1M investment at 10% discount"
Task Type: strategic_analysis (misclassified — should be financial_analysis, 3.0x)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           85.8%     0.378      69t             2k / 7d
Adaptive+Recovery       54.3%     0.750      222t            5k(2r) / 6d
Relational+Prog          0.8%     0.700      482t            4req
```
**Key result:** Best quality improvement of any scenario. Recovery found 2 chunks (defines_term + novel facts). Quality nearly doubled from 0.378 → 0.750. Budget expanded from 69t → 222t but it was the right call — financial computations without context are dangerous.

### Scenario 7: Factual Lookup (spark, 4 chunks, 204t)
```
Query: "what are the Ogilvy headline rules?"
Task Type: creative_review (agent override)

Pipeline               Savings    Quality    Final Tokens    Kept/Dropped
Destructor v2           66.2%     0.583      69t             1k / 3d
Adaptive+Recovery       53.9%     0.455      94t             1k(0r) / 3d
Relational+Prog         -1.0%     0.600      206t            1req
```

---

## Critical Findings

### 1. Task Classification is the weakest link

Two of seven scenarios had misclassified task types. The keyword-matching approach is fast (zero tokens) but brittle. "verify our data retention policy complies with GDPR Article 5" matches "verify" → factual_lookup (0.4x) instead of legal_review (4.0x). "compute WACC and NPV" matches strategic_analysis (3.0x, correct multiplier but wrong task) instead of financial_analysis (2.0x). These misclassifications directly limit the quality gains from adaptive budgeting.

**Fix needed:** Prioritize domain-specific keywords (NPV, WACC, GDPR, HIPAA, NIST, ISO) above generic verbs (check, verify, review). Or use a small embedding similarity check against task descriptions.

### 2. Relational+Progressive has a structural flaw

The Pass 1 budget is fixed at 96 tokens (20% of 400t default budget, hardcoded). This means for small queries (204t input), Pass 1 consumes 47% of the total budget just listing chunks. The two-pass model was designed for large queries (2000t+) where the 20% overhead is negligible. For our benchmark inputs (200-800t), it's a drag.

Additionally, 0 contradiction edges were detected across all 7 scenarios because the contradiction detection relies on negation words + 6+ shared terms. Real chunks with actual contradictions (ISO 31000 vs NIST 800-30, Porter limitations vs Porter framework) don't share enough exact terms to trigger the threshold.

**Fix needed:** Lower the shared-term threshold from 6 to 3, and add source-level contradiction detection (same domain, different document = potential disagreement). Scale Pass 1 budget to input size (min 10%, max 20%).

### 3. The recovery pass works but is conservative

Recovery found meaningful chunks in only 3/7 scenarios. It's too conservative — it requires 2+ novel facts to trigger. In practice, 1 novel fact can be load-bearing. The defines_term check is too narrow (only triggers on first-sentence exact match).

**Fix needed:** Lower novel fact threshold to 1. Expand defines_term to check if any sentence introduces a key query term (not just first sentence). Add a "missing_source" check: if an important source file (e.g., ogilvy-creative-code.md for a headline review) is completely absent from kept chunks, and a dropped chunk from that source exists, recover it.

### 4. Quality estimation is approximate

The quality metric is a heuristic (source coverage + tier-1 survival rate). It does not actually measure whether the model's answer would be correct. In production, quality should be measured by the feedback loop (accept/reject decisions, user ratings, comparison against ground truth).

### 5. The composite score reveals the tradeoff

At 50/50 weight, Destructor v2 wins (0.586 vs 0.560 for Adaptive+Recovery). But this weighting is arbitrary. For a creative headline review, quality matters less than speed — Destructor is the right choice. For a board fiduciary decision, quality matters much more than savings — Adaptive+Recovery's 0.600 quality is far more valuable than Destructor's 0.240. The composite should be weighted per task type, not globally.

---

## Recommendation

### Production Pipeline Architecture

```
Query Arrives
    │
    ▼
Task Classifier (embedding-based, not keyword)
    │
    ├── creative_review / factual_lookup / copy_edit
    │       → Destructor v2 (fast, aggressive, quality acceptable)
    │       → No recovery needed
    │
    ├── engineering_debug / financial_analysis
    │       → Adaptive + Recovery (balanced quality + savings)
    │       → Aggressive recovery: 1-novel-fact threshold
    │
    ├── governance_decision / legal_review / strategic_analysis
    │       → Adaptive + Recovery (generous budget, full recovery)
    │       → Conservative recovery: detect exceptions + contradictions
    │       → If contradiction edges > 0 → suggest Relational+Progressive
    │
    └── multi-source with known conflicts
            → Relational + Progressive (best quality, worst savings)
            → When quality IS the requirement
```

### Critical Fixes Before Production

1. Fix task classifier — prioritize domain keywords over generic verbs
2. Lower recovery novel-fact threshold from 2 → 1
3. Add source-absence recovery trigger (important source missing from kept)
4. Scale Relational+Progressive Pass 1 budget to input size
5. Fix contradiction detection threshold (6 → 3 shared terms)
6. Export dropped-chunk audit log for user inspection

### Benchmarks as Code

All benchmarks are reproducible. The test data (15 realistic chunks across Brand Studio, Finance, Governance, Engineering, Legal, and Strategy domains) and all three pipelines are in:

```
/Agents/rag/destructor.py                    — Pipeline 0 (baseline, 35 tests)
/Agents/rag/pipeline_adaptive_recovery.py     — Pipeline A (Option 1+3)
/Agents/rag/pipeline_relational_progressive.py — Pipeline B (Option 2+4)
/Agents/rag/benchmark.py                      — Benchmark suite (7 scenarios)
```

Run: `python3 rag/benchmark.py`

All three pipelines total 80 unit tests (destructor: 35, injector: 22, strategy: 23). The new pipelines add 15 realistic benchmark scenarios. Full test suite passes clean.
