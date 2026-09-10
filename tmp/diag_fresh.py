import sys, os, time, collections
sys.path.insert(0, os.path.join('rag','core')); sys.path.insert(0, os.path.join('rag','harness'))
from retriever import retrieve
r = retrieve("brand colour palette and design tokens", agent_id="atlas", agent_dept="Brand Studio", top_k=40)
ch = list(getattr(r,'reranked',None) or [])
print("reranked:", len(ch))
print("now      :", time.strftime('%Y-%m-%d'))
ages = []
for c in ch[:20]:
    lm = c.get('last_modified')
    try:
        m = time.mktime(time.strptime(str(lm)[:10], '%Y-%m-%d'))
        age = (time.time()-m)/86400
    except Exception as e:
        age = None
    ages.append(age)
    print(f"  lm={str(lm)[:10]:12s} age={('%.0f' % age) if age is not None else 'PARSE-FAIL':>10s}  {str(c.get('source_file'))[:52]}")
ok = [a for a in ages if a is not None]
if ok:
    print(f"\n  min age={min(ok):.0f}d  max age={max(ok):.0f}d  cutoff(quick_check)=180d")
    print(f"  would pass 180d: {sum(1 for a in ok if a<=180)}/{len(ok)}")
