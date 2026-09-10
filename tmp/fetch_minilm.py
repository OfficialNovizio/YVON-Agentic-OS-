#!/usr/bin/env python3
"""Fetch the all-MiniLM-L6-v2 ONNX bundle that rag/core/embed.py's ONNX path needs."""
import os, sys, time, urllib.request, urllib.error

BASE = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main"
DEST = os.path.join("rag", "models", "all-MiniLM-L6-v2")
os.makedirs(DEST, exist_ok=True)

FILES = {
    "onnx/model.onnx":        "onnx_model.onnx",
    "tokenizer.json":         "tokenizer.json",
    "tokenizer_config.json":  "tokenizer_config.json",
    "config.json":            "config.json",
    "vocab.txt":              "vocab.txt",
    "special_tokens_map.json":"special_tokens_map.json",
}

def fetch(rel, name, attempts=4):
    url = f"{BASE}/{rel}"
    out = os.path.join(DEST, name)
    for i in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "yvon-rag-fetch/1.0"})
            with urllib.request.urlopen(req, timeout=180) as r, open(out, "wb") as f:
                while True:
                    chunk = r.read(1 << 20)
                    if not chunk:
                        break
                    f.write(chunk)
            size = os.path.getsize(out)
            print(f"OK   {name:26s} {size:>10,} bytes")
            return True
        except Exception as e:
            print(f"try{i} {name:26s} FAIL {type(e).__name__}: {str(e)[:90]}")
            if os.path.exists(out):
                os.remove(out)
            time.sleep(2 * i)
    print(f"GIVE UP {name}")
    return False

ok = True
for rel, name in FILES.items():
    if os.path.exists(os.path.join(DEST, name)) and os.path.getsize(os.path.join(DEST, name)) > 0:
        print(f"skip {name:26s} (already present)")
        continue
    ok = fetch(rel, name) and ok

print("\n=== RESULT ===")
for n in sorted(os.listdir(DEST)):
    print(f"  {n:28s} {os.path.getsize(os.path.join(DEST, n)):>10,}")
sys.exit(0 if ok else 1)
