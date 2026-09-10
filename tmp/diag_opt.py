import sys, os
sys.path.insert(0, os.path.join('rag','core')); sys.path.insert(0, os.path.join('rag','harness'))
from retriever import retrieve
for q, aid, dept in [("brand colour palette and design tokens","atlas","Brand Studio"),
                     ("how should dev review a pull request","dev","Engineering")]:
    r = retrieve(q, agent_id=aid, agent_dept=dept, top_k=40)
    o = getattr(r, 'optimized', None)
    print(f"\n=== {q[:44]} ===")
    print("  reranked        :", len(list(getattr(r,'reranked',None) or [])))
    print("  optimized type  :", type(o).__name__)
    if o is not None:
        for attr in ('selected_chunks','chunks','selected','final','items'):
            v = getattr(o, attr, None)
            if v is not None:
                try: print(f"  optimized.{attr:16s}:", len(v))
                except TypeError: print(f"  optimized.{attr:16s}:", type(v).__name__)
        print("  optimized fields:", [a for a in dir(o) if not a.startswith('_')][:18])
    print("  injection_len   :", len(getattr(r,'injection_text','') or ''))
