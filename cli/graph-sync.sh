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
# the interactive full-node viz — graphify's own vis.js viewer with the node cap
# raised (its default 5000-node cap silently swaps to a community-aggregation view),
# plus the module lens sidebar (cli/graph-lens.py, idempotent):
if [ -f "$OUT/graph.html" ]; then python3 "$ROOT/cli/graph-lens.py"; cp -f "$OUT/graph.html" "$PUB/graph.html"; echo "✓ published graph.html ($(du -h "$PUB/graph.html" | cut -f1))"; \
  else echo "ⓘ no graph.html — run: GRAPHIFY_VIZ_NODE_LIMIT=30000 GRAPHIFY_MAX_GRAPH_BYTES=80000000 graphify export html --node-limit 30000"; fi
# the complete graph (every module, not just Teams/) for the Brain & Wiki viewer:
node "$ROOT/scripts/build-code-graph.mjs"
