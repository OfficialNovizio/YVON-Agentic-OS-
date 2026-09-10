import sys, os, json, collections
sys.path.insert(0, os.path.join('rag','core')); sys.path.insert(0, os.path.join('rag','harness'))
from retriever import retrieve
import gates as G

for q, aid, dept in [("brand colour palette and design tokens","atlas","Brand Studio"),
                     ("market sizing TAM SAM SOM","scope","Market Intelligence"),
                     ("how should dev review a pull request","dev","Engineering")]:
    r = retrieve(q, agent_id=aid, agent_dept=dept, top_k=40)
    ch = list(getattr(r,'reranked',None) or [])
    inj = getattr(r,'injection_text','') or ''
    print(f"\n=== {q[:46]} ===")
    print(f"  reranked      : {len(ch)}")
    print(f"  injection_len : {len(inj)}")
    try:
        res = G.process(ch, agent_id=aid, query=q)
        print(f"  final_chunks  : {len(res.final_chunks)}")
        print(f"  kept levels   : { {k: len(v) for k,v in res.assembly_plan.levels.items()} }")
        print(f"  budget        : {res.assembly_plan.budget_used}/{res.assembly_plan.budget_total}")
        print(f"  dropped       : {res.assembly_plan.dropped_levels}")
        ct = collections.Counter(c.conflict_type for c in res.conflicts)
        print(f"  conflict types: {dict(ct)}  total={len(res.conflicts)}")
    except Exception as e:
        print("  gates error:", type(e).__name__, str(e)[:200])
