#!/usr/bin/env python3
"""Adversarial stress harness for the YVON RAG turn pipeline."""
import json, os, subprocess, sys, time, statistics, threading, resource

ROOT = "/root/YVON-Agentic-OS-"
PIPE = os.path.join(ROOT, "rag", "run_turn_pipeline.py")
ENV = dict(os.environ, PYTHONIOENCODING="utf-8")

def call(payload, timeout=90):
    t0 = time.time()
    try:
        p = subprocess.run([sys.executable, PIPE], input=json.dumps(payload),
                           capture_output=True, text=True, timeout=timeout, env=ENV)
        dt = time.time() - t0
        out = None
        for ln in reversed((p.stdout or "").strip().splitlines()):
            try:
                out = json.loads(ln); break
            except Exception:
                continue
        return {"wall": dt, "rc": p.returncode, "out": out,
                "err": (p.stderr or "").strip()[:200]}
    except subprocess.TimeoutExpired:
        return {"wall": time.time() - t0, "rc": "TIMEOUT", "out": None, "err": "hard timeout"}

def mem_avail_mb():
    with open("/proc/meminfo") as f:
        for ln in f:
            if ln.startswith("MemAvailable"):
                return int(ln.split()[1]) // 1024
    return -1

print("=" * 68)
print("PHASE 1 - SEMANTIC QUALITY across departments")
print("=" * 68)
CASES = [
    ("how should dev review a pull request",              "dev",  "Engineering"),
    ("brand colour palette and design tokens",            "atlas","Brand Studio"),
    ("contract review and template library",              "scribe","Legal & Compliance"),
    ("cash runway forecast and burn rate",                "felix","Finance & Treasury"),
    ("hiring pipeline and interview stages",              "hire", "People & Culture"),
    ("churn risk prediction signals",                     "retain","Client Success"),
    ("market sizing TAM SAM SOM",                         "scope","Market Intelligence"),
    ("trademark clearance before launch",                 "guard","Legal & Compliance"),
    ("incident response and detection rules",             "cortex","Cybersecurity"),
    ("sprint velocity and delivery forecast",             "pace", "Ops & Delivery"),
]
hits = 0
for q, aid, dept in CASES:
    r = call({"query": q, "agent_id": aid, "dept": dept, "project_root": ROOT, "top_k": 10})
    o = r["out"] or {}
    src = (o.get("sources") or "").split(",")[0].strip()
    n = o.get("chunk_count", 0)
    # a "hit" = returned something AND it is not the generic injection fallback
    ok = bool(o.get("ok")) and n > 0
    hits += 1 if ok else 0
    print(f"  {q[:44]:46s} -> n={n:<3} {r['wall']:.1f}s  {src[:54]}")
print(f"\n  usable responses: {hits}/{len(CASES)}")

print()
print("=" * 68)
print("PHASE 2 - LATENCY DISTRIBUTION (12 sequential)")
print("=" * 68)
lat = []
for i in range(12):
    r = call({"query": f"engineering standards iteration {i}", "agent_id": "dev",
              "dept": "Engineering", "project_root": ROOT, "top_k": 10})
    lat.append(r["wall"])
    print(f"  run {i+1:2d}: {r['wall']:6.2f}s  rc={r['rc']}  chunks={(r['out'] or {}).get('chunk_count')}")
print(f"\n  min={min(lat):.2f} med={statistics.median(lat):.2f} max={max(lat):.2f} mean={statistics.mean(lat):.2f}")

print()
print("=" * 68)
print("PHASE 3 - CONCURRENCY (the real break vector)")
print("=" * 68)
for conc in (1, 2, 4, 8):
    # SAFETY: this box also runs the live Hermes service. Each pipeline process
    # loads its own ~90MB ONNX graph, so N concurrent calls is ~N x (model +
    # runtime) RSS. Refuse to proceed into territory that would OOM production.
    avail = mem_avail_mb()
    if avail < 900:
        print(f"  conc={conc}: SKIPPED - only {avail} MB available; refusing to risk Hermes")
        continue
    results = [None] * conc
    def worker(i):
        results[i] = call({"query": f"concurrent query {i}", "agent_id": "dev",
                           "dept": "Engineering", "project_root": ROOT, "top_k": 10})
    before = mem_avail_mb()
    t0 = time.time()
    ths = [threading.Thread(target=worker, args=(i,)) for i in range(conc)]
    for t in ths: t.start()
    for t in ths: t.join()
    span = time.time() - t0
    after = mem_avail_mb()
    walls = [r["wall"] for r in results if r]
    oks = sum(1 for r in results if r and r["out"] and r["out"].get("ok"))
    to = sum(1 for r in results if r and r["rc"] == "TIMEOUT")
    print(f"  conc={conc}: span={span:6.2f}s  per-call max={max(walls):6.2f}s  ok={oks}/{conc}  timeouts={to}  memAvail {before}->{after} MB")

print()
print("=" * 68)
print("PHASE 4 - ADVERSARIAL INPUTS")
print("=" * 68)
ADV = [
    ("empty query",        {"query": "", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("whitespace only",    {"query": "     ", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("missing query key",  {"agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("null query",         {"query": None, "agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("SQL injection",      {"query": "'; DROP TABLE chunks; --", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("path traversal",     {"query": "../../etc/passwd", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("unknown agent",      {"query": "how to review code", "agent_id": "not_a_real_agent", "dept": "Engineering", "project_root": ROOT}),
    ("unknown dept",       {"query": "how to review code", "agent_id": "dev", "dept": "Fake Dept", "project_root": ROOT}),
    ("emoji/unicode",      {"query": "diseño de marca \U0001f3a8 \u4e2d\u6587 \u0645\u0631\u062d\u0628\u0627", "agent_id": "atlas", "dept": "Brand Studio", "project_root": ROOT}),
    ("very long query",    {"query": "code review standard " * 800, "agent_id": "dev", "dept": "Engineering", "project_root": ROOT}),
    ("top_k=0",            {"query": "code review", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT, "top_k": 0}),
    ("top_k=-5",           {"query": "code review", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT, "top_k": -5}),
    ("top_k=100000",       {"query": "code review", "agent_id": "dev", "dept": "Engineering", "project_root": ROOT, "top_k": 100000}),
    ("wrong types",        {"query": 12345, "agent_id": ["a"], "dept": {"x": 1}, "project_root": ROOT}),
]
for name, payload in ADV:
    r = call(payload, timeout=120)
    o = r["out"] or {}
    status = "ok" if o.get("ok") else f"handled-fail({str(o.get('error'))[:34]})"
    print(f"  {name:18s} wall={r['wall']:6.2f}s rc={str(r['rc']):7s} {status}")

print()
print("=" * 68)
print("PHASE 5 - DB INTEGRITY AFTER ABUSE")
print("=" * 68)
import sqlite3
con = sqlite3.connect(os.path.join(ROOT, "store", "rag.db"))
cur = con.cursor()
print("  chunks        :", cur.execute("select count(*) from chunks").fetchone()[0])
print("  with embedding:", cur.execute("select count(*) from chunks where embedding is not null").fetchone()[0])
print("  retrieval_log :", cur.execute("select count(*) from retrieval_log").fetchone()[0])
print("  integrity     :", cur.execute("PRAGMA integrity_check").fetchone()[0])
print("  memAvailable  :", mem_avail_mb(), "MB")
