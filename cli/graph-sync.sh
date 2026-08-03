#!/usr/bin/env bash
# graph-sync.sh — publish the graphify project graph to the dashboard.
# graphify writes graphify-out/graph.json at the repo root; Next serves from
# dashboard/public/. This copies it across so /brain can render the real graph.
# Generate the graph first: `/graphify .` (in Claude Code, free docs+code) or
# `graphify .` (+ an LLM backend for docs). Then run this.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/graphify-out/graph.json"
DEST="$ROOT/dashboard/public/graph.json"
[ -f "$SRC" ] || { echo "❌ $SRC not found — run '/graphify .' first"; exit 1; }
cp -f "$SRC" "$DEST"
echo "✓ published $(du -h "$DEST" | cut -f1) → dashboard/public/graph.json"
python3 - "$SRC" <<'PY'
import sys, json
g = json.load(open(sys.argv[1]))
n = g.get("nodes", g.get("Nodes", []))
e = g.get("edges", g.get("links", g.get("Edges", [])))
print(f"  graphify graph: {len(n)} nodes, {len(e)} edges")
PY
