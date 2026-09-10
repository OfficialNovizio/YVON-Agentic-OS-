import sys, os, sqlite3
sys.path.insert(0, os.path.join('rag','core')); sys.path.insert(0, os.path.join('rag','harness'))
from retriever import retrieve
from embed import VectorStore, DB_PATH
print("DB_PATH resolved to:", os.path.abspath(DB_PATH))
con=sqlite3.connect(DB_PATH); print("rows before:", con.execute('select count(*) from retrieval_log').fetchone()[0])
r = retrieve("how should dev review a pull request", agent_id="dev", agent_dept="Engineering", top_k=40)
print("reranked:", len(list(getattr(r,'reranked',None) or [])))
print("selected:", len(r.optimized.selected_chunks))
con2=sqlite3.connect(DB_PATH); print("rows after :", con2.execute('select count(*) from retrieval_log').fetchone()[0])
# call the logger directly to isolate whether the method works
n = VectorStore().log_retrieval("direct-test", "dev", [{"chunk_id":"x","combined_score":0.5,"injected":True,"outcome":"injected"}])
con3=sqlite3.connect(DB_PATH); print("direct write returned:", n, "| rows now:", con3.execute('select count(*) from retrieval_log').fetchone()[0])
