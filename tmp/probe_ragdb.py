import sqlite3, os, sys, math, struct
sys.path.insert(0, os.path.join('rag', 'core'))
con = sqlite3.connect(os.path.join('store', 'rag.db')); cur = con.cursor()
r2 = cur.execute('select chunk_text, embedding from chunks where embedding is not null limit 1').fetchone()
text, blob = r2
stored = list(struct.unpack('<%df' % (len(blob)//4), blob))
from embed import DenseEmbedder
d = DenseEmbedder()
fresh = d.embed_single(text or '')
print('backend          :', d.backend)
print('stored len       :', len(stored))
print('fresh len        :', len(fresh))
if len(stored) == len(fresh):
    dot = sum(a*b for a, b in zip(stored, fresh))
    na = math.sqrt(sum(a*a for a in stored)); nb = math.sqrt(sum(b*b for b in fresh))
    c = dot/((na*nb) or 1)
    print('cosine(stored, fresh-onnx) =', round(c, 4))
    print('VERDICT:', 'REAL ONNX VECTORS STORED' if c > 0.95 else 'FALLBACK VECTORS STORED (bug)')
else:
    print('VERDICT: dim mismatch — stored is not onnx output')
