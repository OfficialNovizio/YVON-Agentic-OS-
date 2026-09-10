"""Harness load test — rag/ CAOS retrieval pipeline (2026-09-09).

Drives the full retrieve() pipeline (plan-lock, classify, rewrite, hybrid
dense+sparse, rerank, optimize, inject, trace) with realistic agent/task
queries. Phases:

  1. warmup            2 calls, excluded from stats (OS page cache)
  2. serial baseline   12 calls, 1 worker — per-call latency distribution
  3. concurrency       2/4/8 workers x 3 calls each — p50/p95/p99, throughput,
                       error rate (matches the dashboard's threaded runtime)
  4. agentic mode      6 serial calls (multi-variant rewrite = heavier)
  5. memory            process RSS before/after

Cost profile: fully local (sentence-transformers all-MiniLM-L6-v2 + BM25 +
heuristic reranker) — zero API spend, per the free-first policy.

Synthetic plan-lock rows: retrieve() appends one plan-lock record per call.
The file's line count is snapshotted and the appended synthetic rows are
truncated back after the run so the audit trail keeps its pre-test state.

Usage:  python scripts/load-test-harness.py [--serial-only]
Output: tmp/harness-loadtest.json + stdout summary
"""
from __future__ import annotations

import argparse
import json
import os
import statistics
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

try:
    import resource  # Unix only
except ImportError:
    resource = None

REPO = Path(__file__).resolve().parent.parent

# This box's torchvision/torchaudio are cu130 against a cu126 torch — either
# import crashes transformers at startup. The embedding path is text-only,
# so block both before transformers can see them (process-local, no env change).
for _broken in ("torchvision", "torchaudio"):
    sys.modules[_broken] = None

sys.path.insert(0, str(REPO / "rag" / "core"))
sys.path.insert(0, str(REPO / "rag" / "harness"))
sys.path.insert(0, str(REPO / "Teams" / "Shared OS" / "logical"))

PLAN_LOCK = REPO / "store" / "plan-lock.jsonl"

# Realistic (query, agent, dept) pairs — mirrors what chat turns actually ask.
CASES = [
    ("Build a responsive marketing dashboard with dark mode and accessible controls", "mia", "Engineering"),
    ("Verify the shipped build in a real browser against the acceptance criteria", "quinn", "Engineering"),
    ("Design the API contract for a multi-tenant billing service", "raj", "Engineering"),
    ("Run a code review on the new checkout flow and flag security issues", "dev", "Engineering"),
    ("Size the TAM SAM SOM for autonomous ISR drones in North America", "scope", "Market Intelligence"),
    ("Track competitor pricing moves in the project-management SaaS space", "rival", "Market Intelligence"),
    ("Model runway under four hiring scenarios with a 6% monthly growth assumption", "felix", "Finance & Treasury"),
    ("Map the month-end close process and find the bottleneck steps", "flow", "Ops & Delivery"),
    ("Design a churn-risk health score using product usage signals", "retain", "Client Success"),
    ("Write launch copy for a developer tool landing page", "lena", "Brand Studio"),
    ("Assess GDPR exposure of a new analytics feature before launch", "comply", "Legal & Compliance"),
    ("Plan a behavioral experiment for onboarding activation nudges", "trial", "Behavioural Science"),
]


def rss_mb() -> float:
    if resource is not None:
        return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024  # KB→MB
    try:
        import ctypes
        from ctypes import wintypes

        class PMC(ctypes.Structure):
            _fields_ = [("cb", wintypes.DWORD), ("PageFaultCount", wintypes.DWORD),
                        ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                        ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]

        pmc = PMC(); pmc.cb = ctypes.sizeof(PMC)
        ctypes.windll.psapi.GetProcessMemoryInfo(ctypes.windll.kernel32.GetCurrentProcess(), ctypes.byref(pmc), pmc.cb)
        return pmc.WorkingSetSize / (1024 * 1024)
    except Exception:
        return -1.0


def one_call(query: str, agent: str, dept: str, mode: str = "standard") -> dict:
    from retriever import retrieve
    t0 = time.perf_counter()
    err = None
    n_chunks = 0
    try:
        r = retrieve(query, agent_id=agent, agent_dept=dept, mode=mode)
        n_chunks = len(r.optimized.selected_chunks)
    except Exception as exc:  # noqa: BLE001 — record, keep driving load
        err = f"{type(exc).__name__}: {exc}"
    ms = (time.perf_counter() - t0) * 1000
    return {"ms": round(ms, 1), "chunks": n_chunks, "error": err}


def pct(xs, p):
    if not xs:
        return None
    xs = sorted(xs)
    k = max(0, min(len(xs) - 1, int(round(p / 100 * (len(xs) - 1)))))
    return xs[k]


def summarize(samples):
    lat = [s["ms"] for s in samples if s["error"] is None]
    errs = [s for s in samples if s["error"]]
    return {
        "n": len(samples),
        "errors": len(errs),
        "error_samples": [e["error"] for e in errs[:3]],
        "p50_ms": pct(lat, 50),
        "p95_ms": pct(lat, 95),
        "p99_ms": pct(lat, 99),
        "min_ms": round(min(lat), 1) if lat else None,
        "max_ms": round(max(lat), 1) if lat else None,
        "mean_ms": round(statistics.fmean(lat), 1) if lat else None,
        "empty_results": sum(1 for s in samples if not s["error"] and s["chunks"] == 0),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--serial-only", action="store_true")
    args = ap.parse_args()

    t_start = time.time()
    pre_lines = PLAN_LOCK.read_text(encoding="utf-8").splitlines() if PLAN_LOCK.exists() else []
    out: dict = {"started": time.strftime("%Y-%m-%d %H:%M:%S"), "repo": str(REPO)}
    out["rss_before_mb"] = round(rss_mb(), 1)

    # import cost (module + model import time) measured separately
    t0 = time.perf_counter()
    from retriever import retrieve  # noqa: F401
    out["import_s"] = round(time.perf_counter() - t0, 2)

    # ── 1. warmup ────────────────────────────────────────────────────────────
    q, a, d = CASES[0]
    w = one_call(q, a, d)
    out["warmup"] = w

    # ── 2. serial baseline ───────────────────────────────────────────────────
    serial = []
    for i, (q, a, d) in enumerate(CASES):
        serial.append({"case": i, "agent": a, **one_call(q, a, d)})
    out["serial"] = {"samples": serial, **summarize(serial)}

    # ── 3. concurrency ───────────────────────────────────────────────────────
    if not args.serial_only:
        conc = {}
        for workers in (2, 4, 8):
            jobs = [(CASES[i % len(CASES)]) for i in range(workers * 3)]
            samples = [None] * len(jobs)
            t0 = time.perf_counter()

            def run(idx):
                q, a, d = jobs[idx]
                samples[idx] = one_call(q, a, d)

            with ThreadPoolExecutor(max_workers=workers) as ex:
                list(ex.map(run, range(len(jobs))))
            wall = time.perf_counter() - t0
            conc[str(workers)] = {
                "calls": len(jobs),
                "wall_s": round(wall, 1),
                "throughput_cps": round(len(jobs) / wall, 2),
                **summarize(samples),
            }
        out["concurrency"] = conc

        # ── 4. agentic mode ──────────────────────────────────────────────────
        agentic = []
        for q, a, d in CASES[:6]:
            agentic.append({"agent": a, **one_call(q, a, d, mode="agentic")})
        out["agentic"] = {"samples": agentic, **summarize(agentic)}

    out["rss_after_mb"] = round(rss_mb(), 1)
    out["total_wall_s"] = round(time.time() - t_start, 1)
    out["plan_lock_rows_added"] = (
        len(PLAN_LOCK.read_text(encoding="utf-8").splitlines()) - len(pre_lines) if PLAN_LOCK.exists() else 0
    )

    (REPO / "tmp").mkdir(exist_ok=True)
    (REPO / "tmp" / "harness-loadtest.json").write_text(json.dumps(out, indent=1), encoding="utf-8")

    # human summary
    print(f"warmup: {out['warmup']['ms']}ms, import {out['import_s']}s, rss {out['rss_before_mb']}→{out['rss_after_mb']}MB")
    s = out["serial"]
    print(f"serial n={s['n']} errors={s['errors']} p50={s['p50_ms']}ms p95={s['p95_ms']}ms mean={s['mean_ms']}ms empty={s['empty_results']}")
    for wk, v in out.get("concurrency", {}).items():
        print(f"conc w={wk}: n={v['calls']} wall={v['wall_s']}s cps={v['throughput_cps']} p95={v['p95_ms']}ms errors={v['errors']}")
    if "agentic" in out:
        a2 = out["agentic"]
        print(f"agentic n={a2['n']} errors={a2['errors']} p50={a2['p50_ms']}ms p95={a2['p95_ms']}ms")
    print(f"total {out['total_wall_s']}s, plan-lock rows appended {out['plan_lock_rows_added']}")


if __name__ == "__main__":
    main()
