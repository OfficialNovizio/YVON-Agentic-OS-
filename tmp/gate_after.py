import json, subprocess, sys, os
ENV = dict(os.environ, PYTHONIOENCODING="utf-8")
QS = [
    ("how should dev review a pull request", "dev", "Engineering"),
    ("brand colour palette and design tokens", "atlas", "Brand Studio"),
    ("cash runway forecast and burn rate", "felix", "Finance & Treasury"),
    ("incident response and detection rules", "cortex", "Cybersecurity"),
    ("market sizing TAM SAM SOM", "scope", "Market Intelligence"),
]
print(f"{'query':44s} {'chunks':>7s} {'conflicts':>10s} {'budgetUsed':>11s} {'budgetTot':>10s} {'inject_chars':>12s}")
print("-" * 100)
tot_c = tot_conf = 0
for q, aid, dept in QS:
    p = json.dumps({"query": q, "agent_id": aid, "dept": dept,
                    "project_root": os.getcwd(), "top_k": 40})
    r = subprocess.run([sys.executable, "rag/run_turn_pipeline.py"], input=p,
                       capture_output=True, text=True, env=ENV, timeout=300)
    d = None
    for ln in reversed(r.stdout.strip().splitlines()):
        try: d = json.loads(ln); break
        except Exception: pass
    if not d: print(q[:44], " -> NO OUTPUT"); continue
    g = d.get("gates") or {}
    n = d.get("chunk_count", 0)
    cf = (g.get("conflict-detection") or {}).get("conflicts", 0)
    bu = (g.get("priority-budget") or {}).get("used", 0)
    br = (g.get("priority-budget") or {}).get("remaining", 0)
    tot_c += n; tot_conf += cf
    print(f"{q[:44]:44s} {n:>7d} {cf:>10d} {bu:>11d} {bu+br:>10d} {len(d.get('injection_text') or ''):>12d}")
print("-" * 100)
print(f"mean chunks/query: {tot_c/len(QS):.1f}   mean conflicts/query: {tot_conf/len(QS):.0f}")
