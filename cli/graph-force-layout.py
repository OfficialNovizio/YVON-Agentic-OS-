#!/usr/bin/env python3
"""graph-force-layout.py — dense per-node force-layout graph.html (2026-08-27).

Operator decision: the graph's interactive view must be the FULL node-level
force layout (like the pre-rewrite graph.html users already had), not the
community-aggregated overview graphify's own HTML viz falls back to above
5000 nodes.

Preferred path is now graphify's NATIVE viz with the cap raised (keeps its
click-to-inspect panel + search + community filters):
    GRAPHIFY_VIZ_NODE_LIMIT=30000 GRAPHIFY_MAX_GRAPH_BYTES=80000000 \
        graphify export html --node-limit 30000
This script remains as a fallback when the native viz is unavailable: it
precomputes positions over the whole graph with igraph's DRL layout (C core,
built for 100k+ node graphs) and emits a self-contained canvas HTML: dark bg,
module-colored degree-scaled dots, faint edges, pan/zoom, hover tooltip,
search-to-pan. No click-to-select — use the native viz for that.

Writes graphify-out/graph.html — graph-sync.sh copies it verbatim to
dashboard/public/graph.html. Re-run this script after any `graphify update`
to refresh the interactive view.

Usage: py -3.11 cli/graph-force-layout.py   (or python3)
"""
import json
import math
import os
import random
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import igraph as ig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "graphify-out", "graph.json")
DST = os.path.join(ROOT, "graphify-out", "graph.html")
SEED = 20260827
W, H = 4096.0, 3072.0  # virtual canvas space; renderer scales to viewport

MODULES = [
    "Teams", "dashboard", "docs", "cli", "rag", "scripts", "vps-scripts",
    "system-harness", "store", "graphify-out", "Playbook", "brain-wiki", "fleet",
]
PALETTE = [
    "#8b5cf6", "#38bdf8", "#f59e0b", "#10b981", "#f43f5e", "#eab308",
    "#14b8a6", "#f97316", "#a3e635", "#ec4899", "#6366f1", "#22d3ee",
    "#fb7185", "#94a3b8",
]


def module_of(node):
    top = (node.get("source_file") or "").split("/")[0]
    return top if top in MODULES else "other"


def main():
    t0 = time.time()
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)
    nodes, links = data["nodes"], data["links"]
    print(f"✓ loaded {len(nodes)} nodes, {len(links)} links ({SRC})")

    ids = [n["id"] for n in nodes]
    idx = {i: k for k, i in enumerate(ids)}
    edges = [(idx[l["source"]], idx[l["target"]]) for l in links
             if l["source"] in idx and l["target"] in idx]
    print(f"✓ {len(edges)} edges after id mapping")

    g = ig.Graph(n=len(ids), edges=edges, directed=False)
    print("✓ running igraph DRL force layout (24k nodes — usually <1 min)…")
    # DRL takes an initial-position MATRIX as its seed (not an RNG int).
    rng = random.Random(SEED)
    seed_mx = [[rng.random(), rng.random()] for _ in range(g.vcount())]
    lay = g.layout_drl(seed=seed_mx)
    # igraph 0.11 Layout: coords is a list of [x, y] pairs (no tuple indexing).
    coords = lay.coords
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]

    # Fit into W×H preserving aspect (no stretch — stretch distorts the layout).
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    spanx, spany = max(maxx - minx, 1e-9), max(maxy - miny, 1e-9)
    scale = min(W / spanx, H / spany)
    offx = (W - spanx * scale) / 2.0 - minx * scale
    offy = (H - spany * scale) / 2.0 - miny * scale
    px = [int(x * scale + offx) for x in xs]
    py = [int(y * scale + offy) for y in ys]
    print(f"✓ layout done in {time.time() - t0:.1f}s — fitted to {int(W)}×{int(H)}")

    degs = g.degree()
    mod_names = list(MODULES) + ["other"]
    mod_index = {m: i for i, m in enumerate(mod_names)}

    # Compact JS arrays (ints where possible — keeps the HTML small).
    node_x = px
    node_y = py
    node_deg = [int(d) for d in degs]
    node_mod = [mod_index[module_of(n)] for n in nodes]
    node_label = [n.get("label") or (n.get("source_file") or "").split("/")[-1] for n in nodes]
    node_file = [n.get("source_file") or "" for n in nodes]
    edge_pairs = [i for e in edges for i in e]

    mod_counts = [0] * len(mod_names)
    for m in node_mod:
        mod_counts[m] += 1

    legend = "".join(
        f'<span class="lg"><i style="background:{PALETTE[i]}"></i>{mod_names[i]} · {mod_counts[i]:,}</span>'
        for i in range(len(mod_names))
    )

    js = f"""
const N = {len(nodes)};
const PX = new Int32Array({json.dumps(node_x)});
const PY = new Int32Array({json.dumps(node_y)});
const DEG = new Int32Array({json.dumps(node_deg)});
const MOD = new Int8Array({json.dumps(node_mod)});
const LABELS = {json.dumps(node_label, ensure_ascii=True)};
const FILES = {json.dumps(node_file, ensure_ascii=True)};
const EDGES = new Int32Array({json.dumps(edge_pairs)});
const PALETTE = {json.dumps(PALETTE)};
const MOD_NAMES = {json.dumps(mod_names)};
const BUILT_AT = {json.dumps(data.get("built_at_commit", "?"))};
"""

    html = HTML_TEMPLATE.replace("/*__DATA__*/", js).replace("/*__LEGEND__*/", legend)

    with open(DST, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ wrote {DST} ({os.path.getsize(DST) / 1e6:.1f} MB) — "
          f"{len(nodes):,} nodes, {len(edges):,} edges")


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>graph — full node force layout (graphify-out/graph.html)</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #0b0d14;
    font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #e2e8f0; -webkit-user-select: none; user-select: none; }
  #c { position: fixed; inset: 0; width: 100%; height: 100%; touch-action: none;
    -webkit-touch-callout: none; cursor: grab; }
  #c.dragging { cursor: grabbing; }
  #hud { position: fixed; top: 12px; left: 12px; right: 12px; display: flex;
    gap: 10px; align-items: center; pointer-events: none; }
  #hud > * { pointer-events: auto; }
  .title { background: rgba(15,18,28,.85); border: 1px solid rgba(148,163,184,.18);
    border-radius: 10px; padding: 8px 14px; backdrop-filter: blur(6px); }
  .title b { color: #fff; }
  .title span { color: #94a3b8; font-size: 12px; }
  #q { background: rgba(15,18,28,.85); border: 1px solid rgba(148,163,184,.25);
    border-radius: 10px; padding: 9px 14px; color: #e2e8f0; width: 240px;
    outline: none; font-size: 13px; }
  #q:focus { border-color: #8b5cf6; }
  #match { background: rgba(139,92,246,.18); border: 1px solid rgba(139,92,246,.4);
    border-radius: 10px; padding: 9px 14px; color: #c4b5fd; cursor: pointer; font-size: 13px; }
  #tip { position: fixed; z-index: 5; display: none; max-width: 420px;
    background: rgba(15,18,28,.94); border: 1px solid rgba(148,163,184,.25);
    border-radius: 8px; padding: 8px 11px; pointer-events: none; font-size: 12px; }
  #tip b { color: #fff; } #tip .f { color: #94a3b8; word-break: break-all; }
  #legend { position: fixed; left: 12px; bottom: 12px; display: flex; flex-wrap: wrap;
    gap: 6px 14px; max-width: 70vw; background: rgba(15,18,28,.85);
    border: 1px solid rgba(148,163,184,.18); border-radius: 10px; padding: 8px 14px; }
  .lg i { display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    margin-right: 5px; } .lg { color: #cbd5e1; font-size: 12px; white-space: nowrap; }
  #hint { position: fixed; right: 12px; bottom: 12px; color: #64748b; font-size: 11px;
    background: rgba(15,18,28,.85); border: 1px solid rgba(148,163,184,.18);
    border-radius: 10px; padding: 6px 12px; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud">
  <div class="title"><b>graph</b> <span>· <b id="nn">0</b> nodes · <b id="ne">0</b> edges · built @ <span id="bc"></span></span></div>
  <input id="q" placeholder="Search file / symbol… (Enter to zoom)" spellcheck="false">
  <button id="match">next match</button>
</div>
<div id="tip"></div>
<div id="legend">/*__LEGEND__*/</div>
<div id="hint">drag · scroll zoom · hover for details</div>
<script>
/*__DATA__*/
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const tip = document.getElementById('tip');
const DPR = Math.min(window.devicePixelRatio || 1, 2);

// ── view transform ─────────────────────────────────────────────────────
const view = { x: 0, y: 0, s: 1 };

function fit() {
  canvas.width = Math.round(innerWidth * DPR);
  canvas.height = Math.round(innerHeight * DPR);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  view.s = Math.min(innerWidth / 4096, innerHeight / 3072) * 0.98;
  view.x = (innerWidth - 4096 * view.s) / 2;
  view.y = (innerHeight - 3072 * view.s) / 2;
  draw();
}

// ── edge layer (drawn once, blitted every frame) ───────────────────────
const edgeLayer = document.createElement('canvas');
edgeLayer.width = 4096; edgeLayer.height = 3072;
{
  const ectx = edgeLayer.getContext('2d');
  ectx.strokeStyle = 'rgba(148,163,184,0.08)';
  ectx.lineWidth = 1;
  ectx.beginPath();
  for (let i = 0; i < EDGES.length; i += 2) {
    ectx.moveTo(PX[EDGES[i]], PY[EDGES[i]]);
    ectx.lineTo(PX[EDGES[i + 1]], PY[EDGES[i + 1]]);
  }
  ectx.stroke();
}

// ── hover spatial index (grid cell 32px at scale 1) ────────────────────
const CELL = 32, GW = 4096 / CELL + 2, GH = 3072 / CELL + 2;
const grid = new Array(GW * GH);
for (let i = 0; i < N; i++) {
  const c = (PY[i] / CELL | 0) * GW + (PX[i] / CELL | 0);
  (grid[c] || (grid[c] = [])).push(i);
}

function radiusOf(deg) { return Math.min(1.2 + Math.log1p(deg) * 0.55, 7); }

// ── render ──────────────────────────────────────────────────────────────
const matches = new Set();
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#0b0d14';
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  ctx.setTransform(DPR * view.s, 0, 0, DPR * view.s, DPR * view.x, DPR * view.y);
  ctx.drawImage(edgeLayer, 0, 0);
  for (let i = 0; i < N; i++) {
    ctx.fillStyle = matches.has(i) ? '#ffffff' : PALETTE[MOD[i]];
    ctx.beginPath();
    ctx.arc(PX[i], PY[i], radiusOf(DEG[i]), 0, 6.2832);
    ctx.fill();
  }
}

// ── pointer pan / zoom (mirrors YvonGraph's fixed pointer-events pattern) ──
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  drag = { px: e.clientX, py: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
  e.preventDefault();
});
canvas.addEventListener('pointermove', (e) => {
  if (drag) {
    view.x += e.clientX - drag.px;
    view.y += e.clientY - drag.py;
    drag.px = e.clientX; drag.py = e.clientY;
    draw();
    tip.style.display = 'none';
  } else {
    const wx = (e.clientX - view.x) / view.s, wy = (e.clientY - view.y) / view.s;
    const c = (wy / CELL | 0) * GW + (wx / CELL | 0);
    let best = -1, bd = Infinity;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const cell = grid[c + dy * GW + dx];
      if (!cell) continue;
      for (const i of cell) {
        const r = Math.max(radiusOf(DEG[i]) + 4, 8) / view.s;
        const d = (PX[i] - wx) ** 2 + (PY[i] - wy) ** 2;
        if (d < r * r && d < bd) { bd = d; best = i; }
      }
    }
    if (best >= 0) {
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX + 14, innerWidth - 300) + 'px';
      tip.style.top = (e.clientY + 14) + 'px';
      tip.innerHTML = '<b>' + LABELS[best] + '</b><div class="f">' + FILES[best] +
        '</div>degree ' + DEG[best] + ' · ' + MOD_NAMES[MOD[best]];
    } else tip.style.display = 'none';
  }
});
const endDrag = (e) => { if (drag) { drag = null; canvas.classList.remove('dragging'); } };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const ns = view.s * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
  view.x = e.clientX - (e.clientX - view.x) * (ns / view.s);
  view.y = e.clientY - (e.clientY - view.y) * (ns / view.s);
  view.s = ns;
  draw();
}, { passive: false });

// ── search ──────────────────────────────────────────────────────────────
const q = document.getElementById('q');
const matchBtn = document.getElementById('match');
let matchList = [], mi = 0;
function runSearch() {
  matches.clear(); matchList = []; mi = 0;
  const t = q.value.trim().toLowerCase();
  if (t.length >= 2) {
    for (let i = 0; i < N; i++) {
      if (FILES[i].toLowerCase().includes(t) || LABELS[i].toLowerCase().includes(t)) {
        matchList.push(i);
      }
    }
    matchList.forEach(i => matches.add(i));
  }
  matchBtn.textContent = matchList.length ? matchList.length + ' matches' : 'next match';
  draw();
}
q.addEventListener('input', runSearch);
q.addEventListener('keydown', (e) => { if (e.key === 'Enter') gotoMatch(); });
matchBtn.addEventListener('click', gotoMatch);
function gotoMatch() {
  if (!matchList.length) return;
  mi = (mi + 1) % matchList.length;
  const i = matchList[mi];
  view.s = 6;
  view.x = innerWidth / 2 - PX[i] * view.s;
  view.y = innerHeight / 2 - PY[i] * view.s;
  draw();
}

document.getElementById('nn').textContent = N.toLocaleString();
document.getElementById('ne').textContent = (EDGES.length / 2).toLocaleString();
document.getElementById('bc').textContent = BUILT_AT;
addEventListener('resize', fit);
fit();
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
