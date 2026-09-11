import sys, os, json, subprocess
ENV = dict(os.environ, PYTHONIOENCODING="utf-8")
for q, aid, dept in [("how should dev review a pull request","dev","Engineering"),
                     ("cash runway forecast and burn rate","felix","Finance & Treasury")]:
    p = json.dumps({"query":q,"agent_id":aid,"dept":dept,"project_root":os.getcwd(),"top_k":40})
    r = subprocess.run([sys.executable,"rag/run_turn_pipeline.py"],input=p,capture_output=True,text=True,env=ENV,timeout=300)
    d=None
    for ln in reversed(r.stdout.strip().splitlines()):
        try: d=json.loads(ln); break
        except Exception: pass
    g=(d or {}).get("gates") or {}
    print(f"{q[:44]:46s} chunks={d.get('chunk_count')}  unreliable={(g.get('reliability') or {}).get('unreliable')}  conflicts={(g.get('conflict-detection') or {}).get('conflicts')}")
