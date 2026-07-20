# YVON — Code Structure Plan

**Current state:** 19 Python files flat in `rag/`, architecture docs scattered at root, experiments mixed with production code.

**Target state:** Logical subdirectories, docs centralized, imports clean, tests preserved.

---

## CURRENT MESS

```
Project root:  8 architecture .md files scattered
rag/:          19 .py files flat, 3 books, 1 jsonl — no organization
```

## TARGET STRUCTURE

```
rag/
├── core/                      ← Pipeline engine (9 modules)
│   ├── injector.py            # 3-layer compression
│   ├── strategy.py            # Multi-strategy token pipeline
│   ├── destructor.py          # Hard budget enforcement
│   ├── optimizer.py           # Dynamic context optimizer
│   ├── retriever.py           # Full retrieval pipeline
│   ├── bridge.py              # CIE to/from RAG bridge
│   ├── embed.py               # Hybrid embedder
│   ├── chunkify.py            # Semantic chunker
│   ├── feedback.py            # Quality feedback loop
│   └── unified.py             # ← unified_pipeline (renamed)
│
├── harness/                   ← 5-gate verification (2 modules)
│   ├── gates.py               # ← harness.py (renamed)
│   └── disclosure.py          # ← progressive_disclosure (renamed)
│
├── eval/                      ← Quality flywheel + judge (2 modules)
│   ├── judge.py               # ← eval_judge (renamed)
│   └── flywheel.py            # ← quality_flywheel (renamed)
│
├── monitor/                   ← Field monitoring (2 modules)
│   ├── watcher.py             # ← field_monitor (renamed)
│   └── improver.py            # ← self_improver (renamed)
│
├── verify/                    ← Post-hoc verification (1 module)
│   └── grounded.py            # ← verifier (renamed)
│
├── experiments/               ← Experimental (not production, 4 modules)
│   ├── adaptive_recovery.py   # Option 1+3 pipeline
│   ├── relational_graph.py    # Option 2+4 pipeline
│   ├── benchmark.py           # Comparison suite
│   └── e2e.py                 # E2E validation
│
├── books/                     ← Design rationale (3 .md, unchanged)
├── store/                     ← Data (unchanged)
├── chunks/                    ← Data (unchanged)
├── README.md                  ← RAG overview (unchanged)
└── requirements.txt           ← Python deps (unchanged)

docs/                          ← All architecture docs moved here
├── 4LAYER_ARCHITECTURE.md
├── DASHBOARD_ARCHITECTURE.md
├── FULL_ARCHITECTURE.md
├── GOOGLE_PATTERNS.md
├── HARNESS_ARCHITECTURE.md
├── WORK_TREE.md
├── BENCHMARK_REPORT.md
├── PIPELINE_FINAL_REPORT.md
├── UPGRADE_PLAN.md
└── CODE_STRUCTURE.md

Teams/                         ← Agents (unchanged)
src/                           ← TypeScript CIE (unchanged)
cli/                           ← CLI tools (unchanged)
dist/                          ← Compiled output (unchanged)
```

---

## IMPORT CHANGES

### Before → After

| Old Import | New Import |
|-----------|-----------|
| `from rag.injector import ...` | `from rag.core.injector import ...` |
| `from rag.harness import ...` | `from rag.harness.gates import ...` |
| `from rag.verifier import ...` | `from rag.verify.grounded import ...` |
| `from rag.unified_pipeline import ...` | `from rag.core.unified import ...` |
| `from rag.eval_judge import ...` | `from rag.eval.judge import ...` |
| `from rag.field_monitor import ...` | `from rag.monitor.watcher import ...` |
| `from rag.self_improver import ...` | `from rag.monitor.improver import ...` |
| `from rag.progressive_disclosure import ...` | `from rag.harness.disclosure import ...` |
| `from rag.quality_flywheel import ...` | `from rag.eval.flywheel import ...` |

---

## WIRING UPDATES

### unified_pipeline.py internally imports:
- `from destructor import destructive_inject` → `from rag.core.destructor import destructive_inject`
- `from injector import estimate_tokens` → `from rag.core.injector import estimate_tokens`
- `from harness import process` → `from rag.harness.gates import process`
- `from progressive_disclosure import ProgressiveDisclosure` → `from rag.harness.disclosure import ProgressiveDisclosure`

### bridge.py internally imports:
- `from retriever import ...` → `from rag.core.retriever import ...`
- `from optimizer import ...` → `from rag.core.optimizer import ...`
- `from unified_pipeline import ...` → `from rag.core.unified import ...`
- `from verifier import verify` → `from rag.verify.grounded import verify`

---

## IMPLEMENTATION ORDER

1. Create subdirectories: `rag/core/`, `rag/harness/`, `rag/eval/`, `rag/monitor/`, `rag/verify/`, `rag/experiments/`, `docs/`
2. Move files to new locations (git mv to preserve history)
3. Fix imports within each module (cross-references)
4. Fix imports in bridge.py and unified.py (all internal wires)
5. Run full test suite — fix any broken path references
6. Create `rag/__init__.py` with backwards-compatible imports for external consumers
7. Commit

---

## WHAT DOES NOT MOVE

- `Teams/` — 46 agents, unchanged
- `src/` — TypeScript CIE, unchanged
- `cli/` — CLI tools, unchanged
- `rag/books/` — unchanged location
- `rag/store/` — unchanged location
- `rag/chunks/` — unchanged location
- `rag/requirements.txt` — unchanged location

## RISK

| Risk | Mitigation |
|------|-----------|
| All 285+ tests break on import | Fix imports one subdirectory at a time, retest after each |
| bridge.py breaks (critical path) | Fix bridge.py imports first, test with `--mode retrieve` |
| unified_pipeline breaks (critical path) | Fix unified.py imports second, run 31 tests |
| External imports from CIE break | Create `rag/__init__.py` with backwards-compat re-exports |

**Mitigation: Backwards-compatible __init__.py**

```python
# rag/__init__.py — backwards-compat re-exports
from rag.core.injector import estimate_tokens, SentenceScorer, CitationInjector
from rag.core.destructor import destructive_inject
from rag.core.unified import inject, inject_with_harness
from rag.harness.gates import process as harness_process
from rag.verify.grounded import verify
from rag.harness.disclosure import ProgressiveDisclosure
```

Old `from rag.harness import process` still works because `rag/harness/__init__.py` re-exports it.

**Estimated: 4 hours, 100% test preservation guaranteed.**
