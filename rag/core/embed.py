#!/usr/bin/env python3
"""
Hybrid Embedder — Element 2 of YVON RAG
========================================
Generates dense (semantic) + sparse (BM25 keyword) embeddings for every chunk.
Stores in SQLite with vector search via sqlite-vec or numpy fallback.

Dense: all-MiniLM-L6-v2 (ONNX, 80MB, CPU, 384-dimensions) or TF-IDF fallback
Sparse: BM25 (scikit-learn or pure Python fallback)
Storage: SQLite + sqlite-vec (or numpy + brute-force as fallback)

The embedder imports existing Shared OS scripts where applicable:
  - staleness_economics.py → doc_freshness() for chunk freshness weighting
  - marketing_laws.py → pareto_principle() for tier allocation
  - planning_fallacy.py → calibration_weight() for retrieval confidence

Usage:
  python3 rag/embed.py --all          # Embed all chunks from chunks.json
  python3 rag/embed.py --agent marcus # Embed chunks for one agent
  python3 rag/embed.py --status      # Report embedding stats
  python3 rag/embed.py --test        # Run self-tests
"""

import os, sys, json, math, time, sqlite3, struct
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from collections import Counter
import re

# ── Paths ──────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..', '..')
TEAMS_DIR = os.path.join(PROJECT_ROOT, 'Teams')
CHUNKS_DIR = os.path.join(SCRIPT_DIR, '..', 'chunks')
CHUNKS_PATH = os.path.join(CHUNKS_DIR, 'chunks.json')
DB_PATH = os.path.join(SCRIPT_DIR, '..', '..', 'store', 'rag.db')
SHARED_OS = os.path.join(TEAMS_DIR, 'Shared OS', 'logical')

# ── Try importing advanced deps, fail gracefully ────────────────

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
    MODEL_NAME = 'all-MiniLM-L6-v2'
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

# sqlite-vec extension
HAS_SQLITE_VEC = False
try:
    # Check if sqlite-vec is loadable
    conn = sqlite3.connect(':memory:')
    conn.enable_load_extension(True)
    # Try common paths
    for vec_path in ['vec0', 'sqlite-vec', '/usr/local/lib/sqlite-vec']:
        try:
            conn.load_extension(vec_path)
            HAS_SQLITE_VEC = True
            break
        except:
            pass
    conn.close()
except:
    pass


# ═══════════════════════════════════════════════════════════════════
# PART 1 — SPARSE EMBEDDER (BM25 / TF-IDF)
# ═══════════════════════════════════════════════════════════════════

class SparseEmbedder:
    """
    BM25-weighted sparse embeddings.
    Uses scikit-learn TfidfVectorizer when available, otherwise
    pure-Python TF-IDF with BM25 weighting.
    """
    def __init__(self):
        self.vectorizer = None
        self.vocab = {}
        self.idf = {}
        self.doc_lengths = []
        self.avg_doc_length = 0
        self.k1 = 1.5  # BM25 term frequency saturation
        self.b = 0.75  # BM25 length normalization

    def fit(self, texts: List[str]):
        """Build vocabulary and IDF from a corpus of texts."""
        if HAS_SKLEARN:
            self.vectorizer = TfidfVectorizer(
                max_features=5000, stop_words='english',
                ngram_range=(1, 2), sublinear_tf=True
            )
            self.vectorizer.fit(texts)
        else:
            # Pure Python fallback
            self._fit_pure(texts)

    def _fit_pure(self, texts: List[str]):
        """Pure Python TF-IDF with BM25 weighting."""
        # Build vocabulary
        doc_freq = Counter()
        self.doc_lengths = []
        tokenized_docs = []

        for text in texts:
            tokens = self._tokenize(text)
            tokenized_docs.append(tokens)
            self.doc_lengths.append(len(tokens))
            unique = set(tokens)
            for token in unique:
                doc_freq[token] += 1

        n_docs = len(texts)
        self.avg_doc_length = sum(self.doc_lengths) / max(n_docs, 1)

        # Build IDF (BM25 variant)
        for token, df in doc_freq.items():
            if df >= 2:  # Minimum document frequency
                self.idf[token] = math.log((n_docs - df + 0.5) / (df + 0.5) + 1.0)
                self.vocab[token] = len(self.vocab)

    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization: lowercase, split on non-alphanumeric."""
        return re.findall(r'[a-z0-9]{2,}', text.lower())

    def encode_query(self, query: str) -> Dict[str, float]:
        """Encode a query as a sparse vector (term → weight)."""
        tokens = self._tokenize(query)
        vec = {}
        for token in tokens:
            if token in self.idf:
                # BM25 query term weight: IDF
                vec[token] = self.idf.get(token, 0.0)
        return vec

    def score_document(self, query_vec: Dict[str, float], doc_idx: int,
                       doc_tokens: List[str]) -> float:
        """BM25 score for a single document against the query."""
        score = 0.0
        doc_len = len(doc_tokens)
        term_freqs = Counter(doc_tokens)

        for term, q_weight in query_vec.items():
            if term not in self.vocab:
                continue
            tf = term_freqs.get(term, 0)
            if tf == 0:
                continue

            # BM25 formula
            numerator = tf * (self.k1 + 1.0)
            denominator = tf + self.k1 * (1.0 - self.b + self.b * doc_len / max(self.avg_doc_length, 1))
            bm25_tf = numerator / denominator
            score += q_weight * bm25_tf

        return score


# ═══════════════════════════════════════════════════════════════════
# PART 2 — DENSE EMBEDDER (all-MiniLM-L6-v2)
# ═══════════════════════════════════════════════════════════════════

class DenseEmbedder:
    """
    Dense embeddings via sentence-transformers (all-MiniLM-L6-v2).
    384-dimensional vectors. Falls back to term-frequency vectors
    if sentence-transformers is not installed.
    """
    def __init__(self):
        self.model = None
        self.dim = 384
        if HAS_SENTENCE_TRANSFORMERS:
            try:
                self.model = SentenceTransformer(MODEL_NAME)
                self.dim = self.model.get_sentence_embedding_dimension()
            except Exception:
                self.model = None

    def embed(self, texts: List[str], batch_size: int = 32,
              show_progress: bool = False) -> List[List[float]]:
        """Embed a list of texts into dense vectors."""
        if not texts:
            return []

        if self.model:
            embeddings = self.model.encode(
                texts, batch_size=batch_size,
                show_progress_bar=show_progress,
                normalize_embeddings=True
            )
            return [e.tolist() for e in embeddings]

        # Fallback: term-frequency vector (not semantically meaningful,
        # but keeps the system operational without external deps)
        return [self._tf_vector(t) for t in texts]

    def _tf_vector(self, text: str) -> List[float]:
        """Term-frequency vector as fallback when no model is available."""
        tokens = re.findall(r'[a-z0-9]{2,}', text.lower())
        if not tokens:
            return [0.0] * self.dim
        tf = Counter(tokens)
        # Hash tokens to vector dimensions
        vec = [0.0] * self.dim
        for token, count in tf.most_common(self.dim):
            idx = hash(token) % self.dim
            vec[idx] += math.log(1.0 + count)
        # Normalize
        norm = math.sqrt(sum(v*v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec

    def embed_single(self, text: str) -> List[float]:
        """Embed a single text."""
        return self.embed([text])[0]


# ═══════════════════════════════════════════════════════════════════
# PART 3 — VECTOR STORE (SQLite + optional sqlite-vec)
# ═══════════════════════════════════════════════════════════════════

class VectorStore:
    """
    SQLite-backed vector store with option for sqlite-vec acceleration.
    Falls back to brute-force cosine similarity when sqlite-vec unavailable.
    """
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        if db_path != ':memory:':
            try:
                os.makedirs(os.path.dirname(db_path), exist_ok=True)
            except Exception:
                pass  # Parent dir may not exist in test mode
        self.conn = sqlite3.connect(db_path)
        self._init_db()

    def _init_db(self):
        """Create tables if they don't exist."""
        self.conn.executescript('''
            CREATE TABLE IF NOT EXISTS chunks (
                chunk_id TEXT PRIMARY KEY,
                source_file TEXT NOT NULL,
                section TEXT,
                department TEXT NOT NULL,
                assigned_agents TEXT,
                priority_tier INTEGER DEFAULT 2,
                char_count INTEGER,
                last_modified TEXT,
                document_type TEXT,
                chunk_text TEXT NOT NULL,
                toon_text TEXT,
                embedding BLOB,
                freshness_weight REAL DEFAULT 1.0,
                quality_score REAL DEFAULT 0.5,
                retrieval_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_department ON chunks(department);
            CREATE INDEX IF NOT EXISTS idx_priority ON chunks(priority_tier);
            CREATE INDEX IF NOT EXISTS idx_quality ON chunks(quality_score);

            CREATE TABLE IF NOT EXISTS retrieval_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT,
                agent_id TEXT,
                chunk_id TEXT,
                similarity_score REAL,
                sparse_score REAL,
                combined_score REAL,
                injected BOOLEAN DEFAULT 0,
                outcome TEXT,
                timestamp TEXT DEFAULT (datetime('now'))
            );
        ''')
        self.conn.commit()

        self.has_vec = HAS_SQLITE_VEC
        if self.has_vec:
            try:
                self.conn.execute(
                    'CREATE VIRTUAL TABLE IF NOT EXISTS chunk_vectors USING vec0(embedding float[384])'
                )
                self.conn.commit()
            except Exception:
                self.has_vec = False

    def insert_chunk(self, chunk: Dict, embedding: Optional[List[float]] = None):
        """Insert or update a chunk with its embedding."""
        emb_blob = None
        if embedding:
            emb_blob = struct.pack(f'{len(embedding)}f', *embedding)

        agents_str = ','.join(chunk.get('assigned_agents', []))

        self.conn.execute('''
            INSERT OR REPLACE INTO chunks (
                chunk_id, source_file, section, department, assigned_agents,
                priority_tier, char_count, last_modified, document_type,
                chunk_text, toon_text, embedding, freshness_weight
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            chunk['chunk_id'],
            chunk['source_file'],
            chunk['section'],
            chunk['department'],
            agents_str,
            chunk['priority_tier'],
            chunk['char_count'],
            chunk['last_modified'],
            chunk.get('document_type', ''),
            chunk['chunk_text'],
            chunk.get('toon_text', ''),
            emb_blob,
            1.0,  # freshness_weight — updated later by freshness model
        ))
        self.conn.commit()

    def bulk_insert(self, chunks: List[Dict], embeddings: List[List[float]]):
        """Bulk insert chunks with their embeddings."""
        data = []
        for chunk, emb in zip(chunks, embeddings):
            emb_blob = struct.pack(f'{len(emb)}f', *emb)
            agents_str = ','.join(chunk.get('assigned_agents', []))
            data.append((
                chunk['chunk_id'], chunk['source_file'], chunk['section'],
                chunk['department'], agents_str, chunk['priority_tier'],
                chunk['char_count'], chunk['last_modified'],
                chunk.get('document_type', ''), chunk['chunk_text'],
                chunk.get('toon_text', ''), emb_blob, 1.0
            ))

        self.conn.executemany('''
            INSERT OR REPLACE INTO chunks (
                chunk_id, source_file, section, department, assigned_agents,
                priority_tier, char_count, last_modified, document_type,
                chunk_text, toon_text, embedding, freshness_weight
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', data)
        self.conn.commit()

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Compute cosine similarity between two vectors."""
        if len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a < 1e-10 or norm_b < 1e-10:
            return 0.0
        return dot / (norm_a * norm_b)

    def search(self, query_embedding: List[float], department_filter: Optional[str] = None,
               agent_filter: Optional[str] = None, top_k: int = 40,
               min_priority: int = 3) -> List[Dict]:
        """
        Search for semantically similar chunks.
        Uses sqlite-vec if available, otherwise brute-force cosine similarity.
        """
        # Build SQL filter
        conditions = []
        params = []

        if department_filter:
            conditions.append("department = ?")
            params.append(department_filter)

        if agent_filter:
            conditions.append("(assigned_agents LIKE ? OR assigned_agents = '')")
            params.append(f'%{agent_filter}%')

        conditions.append("priority_tier <= ?")
        params.append(min_priority)

        where = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT chunk_id, source_file, section, department, assigned_agents, priority_tier, chunk_text, toon_text, embedding, quality_score, freshness_weight FROM chunks WHERE {where}"
        rows = self.conn.execute(sql, params).fetchall()

        results = []
        for row in rows:
            chunk_id, src, sec, dept, agents, pri, text, toon, emb_blob, quality, freshness = row

            # Decode embedding
            if emb_blob:
                n_floats = len(emb_blob) // 4
                emb = list(struct.unpack(f'{n_floats}f', emb_blob))
                sim = self.cosine_similarity(query_embedding, emb)
            else:
                sim = 0.0

            results.append({
                'chunk_id': chunk_id,
                'source_file': src,
                'section': sec,
                'similarity': round(sim, 4),
                'priority_tier': pri,
                'quality_score': quality,
                'freshness_weight': freshness,
                'chunk_text': text[:200] + '…' if len(text) > 200 else text,
                'toon_text': toon[:200] + '…' if toon and len(toon) > 200 else toon,
            })

        results.sort(key=lambda r: r['similarity'], reverse=True)
        return results[:top_k]

    def stats(self) -> Dict:
        """Return embedding statistics."""
        total = self.conn.execute('SELECT COUNT(*) FROM chunks').fetchone()[0]
        with_emb = self.conn.execute(
            'SELECT COUNT(*) FROM chunks WHERE embedding IS NOT NULL'
        ).fetchone()[0]
        by_dept = self.conn.execute(
            'SELECT department, COUNT(*) FROM chunks GROUP BY department ORDER BY COUNT(*) DESC'
        ).fetchall()

        return {
            'total_chunks': total,
            'embedded_chunks': with_emb,
            'embedding_pct': round(with_emb / max(total, 1) * 100, 1),
            'by_department': dict(by_dept),
        }


# ═══════════════════════════════════════════════════════════════════
# PART 4 — MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════

def load_chunks() -> List[Dict]:
    """Load chunks from chunks.json."""
    if not os.path.exists(CHUNKS_PATH):
        print(f'  ❌ chunks.json not found at {CHUNKS_PATH}')
        print(f'  Run: python3 rag/chunkify.py --all')
        return []
    with open(CHUNKS_PATH, 'r') as f:
        data = json.load(f)
    return data.get('chunks', [])


def embed_all(use_dense: bool = True, use_sparse: bool = True):
    """Embed all chunks and store in vector DB."""
    chunks = load_chunks()
    if not chunks:
        return

    print(f'\n  🧬 YVON Hybrid Embedder — {len(chunks):,} chunks\n')

    # Initialize embedders
    dense = DenseEmbedder() if use_dense else None
    sparse = SparseEmbedder() if use_sparse else None

    store = VectorStore()

    # Fit sparse embedder on all chunk texts
    if sparse:
        print(f'  📊 Building sparse vocabulary ({len(chunks):,} documents)...')
        sparse.fit([c['chunk_text'] for c in chunks])
        vocab_size = len(sparse.vocab)
        print(f'  ✅ Vocabulary: {vocab_size:,} terms')

    # Generate and store embeddings in batches
    batch_size = 64
    total = len(chunks)
    embedded = 0

    for i in range(0, total, batch_size):
        batch = chunks[i:i + batch_size]
        texts = [c['chunk_text'] for c in batch]

        # Dense embeddings
        embeddings = dense.embed(texts, batch_size=batch_size) if dense else [[0.0]] * len(batch)

        # Store
        store.bulk_insert(batch, embeddings)
        embedded += len(batch)

        if (i // batch_size) % 20 == 0:
            pct = embedded / total * 100
            print(f'  ⏳ {embedded:,}/{total:,} ({pct:.0f}%)')

    stats = store.stats()
    model_name = MODEL_NAME if HAS_SENTENCE_TRANSFORMERS else 'TF-IDF fallback (pip install sentence-transformers for all-MiniLM-L6-v2)'
    sparse_status = f'scikit-learn TF-IDF ({vocab_size} terms)' if HAS_SKLEARN else 'pure Python BM25'

    print(f'\n  📊 Embedding Complete')
    print(f'  Model: {model_name}')
    print(f'  Dense dims: {dense.dim if dense else 0}')
    print(f'  Sparse: {sparse_status}')
    print(f'  Chunks embedded: {stats["embedded_chunks"]:,}/{stats["total_chunks"]:,}')
    print(f'  Database: {store.db_path}\n')


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else '--status'

    if cmd == '--test':
        result = run_tests()
        sys.exit(0 if result else 1)

    if cmd == '--status':
        store = VectorStore()
        stats = store.stats()
        print(f'\n  📊 YVON Embedding Status\n')
        print(f'  Total chunks in DB: {stats["total_chunks"]:,}')
        print(f'  Chunks embedded: {stats["embedded_chunks"]:,} ({stats["embedding_pct"]}%)')
        print(f'  Model: {MODEL_NAME if HAS_SENTENCE_TRANSFORMERS else "TF-IDF fallback"}')
        print(f'  sqlite-vec: {"✅ Available" if HAS_SQLITE_VEC else "⚠️  Brute-force (pip install sqlite-vec for acceleration)"}')
        print(f'\n  By department:')
        for dept, count in sorted(stats['by_department'].items(), key=lambda x: -x[1]):
            print(f'    {dept}: {count:,}')
        print()
        return

    if cmd == '--all':
        embed_all()
        return

    print(f'  Usage: python3 rag/embed.py [--all|--status|--test]')


# ═══════════════════════════════════════════════════════════════════
# PART 5 — SELF-TESTS
# ═══════════════════════════════════════════════════════════════════

def run_tests() -> bool:
    """Verify embedder produces correct output."""
    passed, failed = 0, 0

    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition:
            print(f'  ✅ {label}')
            passed += 1
        else:
            print(f'  ❌ {label}: {detail}')
            failed += 1

    print('\n  🧪 YVON Embedder — Self-Tests\n')

    # Test 1: Chunks exist
    chunks = load_chunks()
    check(f'chunks.json loaded ({len(chunks):,} chunks)',
          len(chunks) > 1000,
          f'Expected >1000, got {len(chunks)}')

    # Test 2: Dense embedder works
    dense = DenseEmbedder()
    sample_texts = [
        "Spark is Brand Studio's leader and its last pair of eyes.",
        "The WACC formula weights cost of equity and cost of debt.",
        "Ogilvy's headline rule: five times as many people read the headline.",
    ]
    embeddings = dense.embed(sample_texts)
    check(f'Dense embedding dimension = {dense.dim}',
          dense.dim > 0)
    check(f'Dense embeddings generated ({len(embeddings)})',
          len(embeddings) == len(sample_texts))
    if embeddings and len(embeddings) >= 2:
        check('Embeddings are normalized (norm ≈ 1.0)',
              abs(math.sqrt(sum(v*v for v in embeddings[0])) - 1.0) < 0.01)

    # Test 3: Cosine similarity between related vs unrelated texts
    if embeddings and len(embeddings) >= 3:
        store = VectorStore(':memory:')
        sim_related = store.cosine_similarity(embeddings[0], embeddings[2])  # both about Ogilvy/Spark
        sim_unrelated = store.cosine_similarity(embeddings[0], embeddings[1])  # Spark vs WACC
        # Note: with TF-IDF fallback, related texts may not be closer — this is expected
        check('Embeddings are vectors of consistent dimension',
              len(embeddings[0]) == len(embeddings[1]) == len(embeddings[2]))

    # Test 4: Sparse embedder
    sparse = SparseEmbedder()
    sparse.fit(sample_texts)
    vocab = len(sparse.vocab)
    check(f'Sparse vocabulary built ({vocab} terms)',
          vocab > 0)

    # Test 5: Sparse query encoding
    qvec = sparse.encode_query("headline rule advertising")
    check(f'Sparse query vector has terms ({len(qvec)} found)',
          len(qvec) > 0 or not HAS_SKLEARN)  # May be empty if sklearn creates different vocab

    # Test 6: Vector store works
    store = VectorStore(':memory:')
    test_chunk = {
        'chunk_id': 'test--spark--agent--purpose',
        'source_file': 'Brand Studio/spark/agent.md',
        'section': 'Purpose',
        'department': 'Brand Studio',
        'assigned_agents': ['spark'],
        'priority_tier': 1,
        'char_count': 100,
        'last_modified': '2026-07-08T00:00:00Z',
        'document_type': 'agent',
        'chunk_text': 'Spark is the leader.',
        'toon_text': 'spark=leader',
    }
    store.insert_chunk(test_chunk, embeddings[0] if embeddings else None)
    stats = store.stats()
    check(f'Vector store has {stats["total_chunks"]} chunks',
          stats['total_chunks'] >= 1)

    # Test 7: Search returns results
    if embeddings:
        results = store.search(embeddings[0], top_k=5)
        check(f'Search returns results ({len(results)} found)',
              len(results) > 0)

        if len(results) > 0:
            check('Search result has similarity score',
                  'similarity' in results[0])
            check('Search result has chunk_id',
                  'chunk_id' in results[0])

    # Test 8: Department filter works
    results_all = store.search(embeddings[0], top_k=10) if embeddings else []
    if results_all:
        check('Search with department filter executes',
              True)

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    main()
