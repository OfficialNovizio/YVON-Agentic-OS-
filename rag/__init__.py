"""
YVON RAG Pipeline — backwards-compatible re-exports.

Old imports still work:
  from rag.harness import process       → from rag.harness.gates import process
  from rag.verifier import verify       → from rag.verify.grounded import verify
  from rag.unified_pipeline import inject → from rag.core.unified import inject
"""

# Core pipeline
from rag.core.injector import (estimate_tokens, SentenceScorer, CitationInjector,
                                 get_compression_profile, smart_inject)
from rag.core.destructor import destructive_inject, DestructorResult
from rag.core.strategy import select_strategy, execute_multi_strategy, StrategyResult
from rag.core.optimizer import (optimize_context, compute_chunk_quality,
                                 compute_chunk_reliability, classify_task_complexity)
from rag.core.retriever import retrieve, RetrievalResult, HybridRetriever
from rag.core.bridge import handle_retrieve, handle_formula, handle_feedback, handle_verify
from rag.core.unified_pipeline import inject, inject_with_harness, UnifiedResult

# Harness
from rag.harness.gates import (process as harness_process, gate_authenticate,
                                gate_reliability, gate_conflicts, gate_priority_assembly,
                                gate_quarantine, HarnessResult)
from rag.harness.disclosure import ProgressiveDisclosure, DisclosureResult

# Verification
from rag.verify.grounded import verify, VerificationResult

# Evaluation
from rag.eval.judge import grade as eval_grade, EvalResult
from rag.eval.flywheel import run_flywheel, FlywheelResult, analyze_failures

# Monitoring
from rag.monitor.watcher import generate_report as field_report
from rag.monitor.improver import run_improvement_cycle
