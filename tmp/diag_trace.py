import sys, os
sys.path.insert(0, os.path.join('rag','core')); sys.path.insert(0, os.path.join('rag','harness'))
from retriever import retrieve
for q, aid, dept in [("brand colour palette and design tokens","atlas","Brand Studio"),
                     ("how should dev review a pull request","dev","Engineering")]:
    r = retrieve(q, agent_id=aid, agent_dept=dept, top_k=40)
    o = getattr(r,'optimized',None)
    print(f"\n=== {q[:44]} ===")
    print("  profile :", getattr(o,'profile',None) and o.profile.name)
    print("  strategy:", getattr(o,'strategy',None))
    print("  selected:", len(o.selected_chunks))
    print("  --- TRACE ---")
    for line in (getattr(o,'trace',None) or []):
        print("   ", line)
