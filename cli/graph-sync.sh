#!/usr/bin/env bash
# graph-sync.sh — publish the graphify project graph to the dashboard.
# graphify writes graphify-out/graph.json at the repo root; Next serves from
# dashboard/public/. This copies it across so /brain can render the real graph.
# Generate the graph first: `/graphify .` (in Claude Code, free docs+code) or
# `graphify .` (+ an LLM backend for docs). Then run this.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/graphify-out"; PUB="$ROOT/dashboard/public"
[ -f "$OUT/graph.json" ] || { echo "❌ $OUT/graph.json not found — run 'graphify extract .' first"; exit 1; }
cp -f "$OUT/graph.json" "$PUB/graph-full.json"
python3 "$ROOT/cli/graph-publish.py"    # writes the small graph-view.json overview
# the interactive full-node viz (graphify cluster-only . --no-label writes it):
if [ -f "$OUT/graph.html" ]; then cp -f "$OUT/graph.html" "$PUB/graph.html"; echo "✓ published graph.html ($(du -h "$PUB/graph.html" | cut -f1))"; \
  else echo "ⓘ no graph.html — run: GRAPHIFY_VIZ_NODE_LIMIT=9000 graphify cluster-only . --no-label"; fi
