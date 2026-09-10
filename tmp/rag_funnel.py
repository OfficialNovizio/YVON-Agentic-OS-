import sys, os, json, time
sys.path.insert(0, "/root/YVON-Agentic-OS-/rag/core")
sys.path.insert(0, "/root/YVON-Agentic-OS-/rag/harness")
os.chdir("/root/YVON-Agentic-OS-")
from retriever import retrieve
from gates import process as gates_process

q = "how should dev review a pull request"
r = retrieve(q, agent_id="dev", agent_dept="Engineering", top_k=40)
for attr in ("reranked", "chunks", "dense_hits", "sparse_hits", "fused", "selected"):
    v = getattr(r, attr, None)
    if isinstance(v, (list, tuple)):
        print(f"  {attr:14s}: {len(v)}")
print("  timing_ms     :", getattr(r, "timing_ms", None))
print("  injection len :", len(getattr(r, "injection_text", "") or ""))

chunks = list(getattr(r, "reranked", None) or [])
print("\n  --- top 8 reranked, with the fields the gates read ---")
for c in chunks[:8]:
    if isinstance(c, dict):
        print("   tier=%s rel=%s conf=%s auth=%s | %s" % (
            c.get("priority_tier"), c.get("reliability"), c.get("confidence_score"),
            c.get("authenticated"), str(c.get("source_file"))[:52]))

trace = {}
try:
    g = gates_process(chunks, trace) if not isinstance(trace, dict) else None
except Exception as e:
    print("  gates call signature differs:", e)
print("\n  --- gate trace (what is being dropped) ---")
print("  ", json.dumps(trace, default=str)[:900])
