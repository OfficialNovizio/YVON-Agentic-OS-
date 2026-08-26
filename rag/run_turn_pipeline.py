#!/usr/bin/env python3
"""rag/run_turn_pipeline.py — the real per-turn bridge from a live Hermes chat
turn into CAOS phases 04 (HYBRID RETRIEVAL) and 07 (HARNESS GATES).

FIX (2026-08-21, concern #1): dashboard/lib/caos-phases.ts documents these
phases honestly as "not emitted — hermes-agent phase hooks are probe-gated" —
real Python implementing them (rag/core/retriever.py, rag/harness/gates.py)
already existed, but nothing in the live chat path ever called it. rag/core/
bridge.py, despite its name, only ever calls retriever.py (never gates.py —
its harness hook imports a nonexistent unified_pipeline.inject_with_harness
and silently no-ops). Rather than resurrect that broken wiring, this is a new,
minimal, self-contained entrypoint that calls both real pipelines directly and
is meant to be spawned as a subprocess from vps-scripts/yvon-hermes-http/
main.py (see _run_rag_pipeline_sync there) — matching that file's own
existing pattern for other slow/optional per-turn steps (e.g. repo clone):
bounded by the CALLER's timeout, never raises past main(), always emits
exactly one line of JSON on stdout so the caller can trust `readline()`.

Protocol: one JSON object on stdin —
    {"query": str, "agent_id": str, "dept": str, "project_root": str, "top_k": int}
exactly one JSON object on stdout —
    {"ok": true, "injection_text": str, "chunk_count": int, "sources": str,
     "timing_ms": float, "gates": {...}}
  or on any failure —
    {"ok": false, "error": str}

Never fabricates success: any exception at any stage (missing deps, cold
index, bad input) degrades to {"ok": false, "error": "..."} rather than
inventing retrieval/gate results — same "never fabricate" discipline as
caos-phases.ts's own decisionFallback text.
"""
from __future__ import annotations

import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_CORE = os.path.join(_HERE, "core")
_HARNESS = os.path.join(_HERE, "harness")
_REPO_ROOT = os.path.dirname(_HERE)
for _p in (_CORE, _HARNESS, _REPO_ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)


def _emit_failure(reason: str) -> None:
    print(json.dumps({"ok": False, "error": str(reason)[:500]}))


def _build_gate_payload(trace: dict) -> dict:
    """Map gates.py's `trace` dict (real gate1_*/.../gate5_* fields) onto the
    5 gate ids dashboard/lib/caos-phases.ts already defines — field names
    verified against rag/harness/gates.py's process() (line ~798)."""
    return {
        "source-authentication": {
            "blocked": trace.get("gate1_blocked", 0),
            "flagged": trace.get("gate1_flagged", 0),
        },
        "reliability": {
            "unreliable": trace.get("gate2_unreliable", 0),
        },
        "conflict-detection": {
            "conflicts": trace.get("gate3_conflicts", 0),
        },
        "priority-budget": {
            "used": trace.get("gate4_budget_used", 0),
            "remaining": trace.get("gate4_budget_remaining", 0),
            "dropped_levels": trace.get("gate4_dropped_levels", []),
        },
        "quarantine-recovery": {
            "quarantined": trace.get("gate5_quarantined", 0),
            "recovered": trace.get("gate5_recovered", 0),
        },
    }


def main() -> None:
    try:
        raw = sys.stdin.read()
        req = json.loads(raw) if raw.strip() else {}
    except Exception as exc:  # noqa: BLE001
        _emit_failure(f"bad stdin json: {exc}")
        return

    query = str(req.get("query") or "").strip()
    if not query:
        _emit_failure("empty query")
        return
    agent_id = str(req.get("agent_id") or "")
    dept = str(req.get("dept") or "")
    project_root = str(req.get("project_root") or "")
    try:
        top_k = int(req.get("top_k") or 40)
    except Exception:  # noqa: BLE001
        top_k = 40

    try:
        from retriever import retrieve as rag_retrieve  # rag/core/retriever.py
    except Exception as exc:  # noqa: BLE001
        _emit_failure(f"retriever import failed: {exc}")
        return
    try:
        from gates import process as gates_process  # rag/harness/gates.py
    except Exception as exc:  # noqa: BLE001
        _emit_failure(f"gates import failed: {exc}")
        return

    try:
        result = rag_retrieve(query, agent_id=agent_id, agent_dept=dept, top_k=top_k)
    except Exception as exc:  # noqa: BLE001
        _emit_failure(f"retrieval failed: {exc}")
        return

    chunks = list(getattr(result, "reranked", None) or [])
    injection_text = getattr(result, "injection_text", "") or ""
    timing_ms = getattr(result, "timing_ms", None)
    # Rail 1 plan-lock (rag/core/plan_lock.py): 'blocked' means agent_dept
    # wasn't a recognized department — an untrusted-identity signal, distinct
    # from the 5 harness gates below. Surfaced honestly either way; the
    # caller (main.py) folds a 'blocked' status into the source-authentication
    # gate event rather than silently treating retrieval as fully verified.
    lock_status = getattr(result, "lock_status", "unlocked") or "unlocked"

    if not chunks:
        # Real, honest outcome — not an error. Nothing to gate; still report
        # ok:true so phase.retrieve emits "0 chunks" rather than looking
        # broken (distinct from _emit_failure, which means the PIPELINE
        # itself couldn't run at all).
        print(json.dumps({
            "ok": True, "injection_text": injection_text, "chunk_count": 0,
            "sources": "", "timing_ms": timing_ms, "gates": {},
            "lock_status": lock_status,
        }))
        return

    try:
        harness = gates_process(chunks, agent_id=agent_id, query=query, project_root=project_root)
    except Exception as exc:  # noqa: BLE001
        # Retrieval succeeded even if gating didn't — surface the real
        # injection text still; don't lose real retrieval over a gate error.
        print(json.dumps({
            "ok": True, "injection_text": injection_text, "chunk_count": len(chunks),
            "sources": "", "timing_ms": timing_ms, "gates": {},
            "lock_status": lock_status, "gate_error": str(exc)[:300],
        }))
        return

    trace = dict(getattr(harness, "trace", None) or {})
    final_chunks = list(getattr(harness, "final_chunks", None) or [])
    sources = ", ".join(sorted({
        str(c.get("source_file")) for c in final_chunks
        if isinstance(c, dict) and c.get("source_file")
    })[:5])

    print(json.dumps({
        "ok": True,
        "injection_text": injection_text,
        "chunk_count": trace.get("final_chunks", len(final_chunks)),
        "sources": sources,
        "timing_ms": timing_ms,
        "lock_status": lock_status,
        "gates": _build_gate_payload(trace),
    }, default=str))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # absolute last-resort guard — never crash silently
        _emit_failure(f"unhandled: {exc}")
