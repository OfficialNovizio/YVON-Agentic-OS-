#!/usr/bin/env python3
"""graph-lens.py — module lens sidebar for the graphify native viz (2026-08-27).

Option A of the graph-representation discussion: keep the single dense force
canvas, add a per-module lens. Card list (matching the viz's dark sidebar
theme) shows every top-level module with live node counts + share bars;
clicking a card dims the rest of the graph to 6% and focuses the viewport on
that module's nodes. "fit all" / "clear lens" restore the full picture.

Runs as a post-processor on graphify-out/graph.html after
`graphify export html --node-limit 30000`. Idempotent (marker-guarded).
graph-sync.sh calls it before publishing.
"""
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "graphify-out", "graph.html")
MARKER = "<!-- yvon-module-lens -->"

LENS = r"""<!-- yvon-module-lens -->
<style>
#yvon-modules { padding: 10px 12px; border-bottom: 1px solid #2a2a4e; flex-shrink: 1; overflow-y: auto; }
#yvon-modules h3 { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .06em; margin: 2px 0 8px; }
#yvon-modules h3 b { color: #c8c8d8; }
.ym-actions { display: flex; gap: 6px; margin-bottom: 8px; }
.ym-btn { flex: 1; background: #0f0f1a; border: 1px solid #2a2a4e; color: #c0c0d0; border-radius: 6px; padding: 5px 0; font-size: 11px; cursor: pointer; }
.ym-btn:hover { border-color: #4E79A7; color: #fff; }
.ym-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.ym-card { background: #0f0f1a; border: 1px solid #2a2a4e; border-radius: 8px; padding: 7px 9px; cursor: pointer; transition: border-color .15s, background .15s; }
.ym-card:hover { border-color: #4E79A7; background: #1a1a2e; }
.ym-card.active { border-color: var(--ym-accent); background: #1a1a2e; box-shadow: inset 0 0 0 1px var(--ym-accent); }
.ym-top { display: flex; align-items: center; gap: 6px; }
.ym-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ym-name { font-size: 11.5px; color: #e0e0e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ym-count { font-size: 10px; color: #888; margin-top: 2px; }
.ym-bar { height: 3px; background: #2a2a4e; border-radius: 2px; margin-top: 5px; overflow: hidden; }
.ym-bar i { display: block; height: 100%; background: var(--ym-accent); }
</style>
<script>
(function () {
  function init() {
    if (typeof network === 'undefined' || !network.body || !network.body.data) return false;
    var PALETTE = ['#8b5cf6','#38bdf8','#f59e0b','#10b981','#f43f5e','#eab308','#14b8a6','#f97316','#a3e635','#ec4899','#6366f1','#22d3ee','#fb7185','#94a3b8'];
    var PRETTY = {teams:'Teams', dashboard:'Dashboard', docs:'Docs', cli:'CLI', rag:'RAG',
      scripts:'Scripts', 'vps-scripts':'VPS scripts', 'system-harness':'System harness',
      store:'Store', playbook:'Playbook', 'brain-wiki':'Brain Wiki', fleet:'Fleet',
      'graphify-out':'Graphify out'};
    function modOf(n) {
      var sf = n.source_file || n._source_file || '';
      var top = sf.split('/')[0];
      if (!top) top = String(n.id).split('_')[0] || 'other';
      return top;
    }
    var counts = {}, rawById = {};
    for (var i = 0; i < RAW_NODES.length; i++) {
      var m = modOf(RAW_NODES[i]);
      counts[m] = (counts[m] || 0) + 1;
      rawById[RAW_NODES[i].id] = true;
    }
    var order = [];
    for (var k in counts) order.push([k, counts[k]]);
    order.sort(function (a, b) { return b[1] - a[1]; });
    // Long tail: modules under 100 nodes group into one "other" card so the
    // sidebar stays scannable while every node stays one click away.
    var MIN = 100;
    var groups = [], tail = [];
    for (var g = 0; g < order.length; g++) {
      if (order[g][1] >= MIN) groups.push({ slug: order[g][0], count: order[g][1] });
      else tail.push(order[g][0]);
    }
    var tailCount = 0;
    for (var t = 0; t < tail.length; t++) tailCount += counts[tail[t]];
    if (tail.length) groups.push({ slug: '__other__', count: tailCount, tail: tail });
    var total = RAW_NODES.length;
    var comms = {};
    for (var j = 0; j < RAW_NODES.length; j++) comms[RAW_NODES[j].community] = true;
    var nComm = Object.keys(comms).length;

    var orig = {}; // id -> original background color
    nodesDS.get().forEach(function (n) {
      orig[n.id] = (n.color && (n.color.background || n.color)) || '#4E79A7';
    });

    function slugsOf(group) { return group.tail || [group.slug]; }
    function nameOf(group) {
      if (group.slug === '__other__') return 'other (' + group.tail.length + ' dirs)';
      return PRETTY[group.slug] || group.slug;
    }

    var sb = document.getElementById('sidebar');
    if (!sb) return false;
    var sec = document.createElement('div');
    sec.id = 'yvon-modules';
    var cards = groups.map(function (group, ix) {
      var slug = group.slug, c = group.count, color = PALETTE[ix % PALETTE.length];
      var pct = (100 * c / total).toFixed(1);
      return '<div class="ym-card" data-slug="' + slug + '" data-slugs="'
        + JSON.stringify(slugsOf(group)).split('"').join('&quot;') + '" style="--ym-accent:' + color + '">'
        + '<div class="ym-top"><span class="ym-dot" style="background:' + color + '"></span>'
        + '<span class="ym-name">' + nameOf(group) + '</span></div>'
        + '<div class="ym-count">' + c.toLocaleString() + ' nodes &middot; ' + pct + '%</div>'
        + '<div class="ym-bar"><i style="width:' + pct + '%"></i></div></div>';
    }).join('');
    sec.innerHTML = '<h3>Modules &middot; <b>' + total.toLocaleString() + '</b> nodes &middot; '
      + RAW_EDGES.length.toLocaleString() + ' edges &middot; ' + nComm + ' communities</h3>'
      + '<div class="ym-actions"><button class="ym-btn" id="ym-fit">fit all</button>'
      + '<button class="ym-btn" id="ym-clear">clear lens</button></div>'
      + '<div class="ym-grid">' + cards + '</div>';
    sb.insertBefore(sec, sb.firstChild);

    function setLens(slug) {
      var all = document.querySelectorAll('.ym-card');
      var slugs = [slug];
      for (var i = 0; i < all.length; i++) {
        if (all[i].getAttribute('data-slug') === slug) {
          var raw = all[i].getAttribute('data-slugs');
          if (raw) slugs = JSON.parse(raw.split('&quot;').join('"'));
        }
      }
      var inMod = nodesDS.get({ filter: function (n) { return slugs.indexOf(modOf(n)) >= 0; } }).map(function (n) { return n.id; });
      var updates = RAW_NODES.map(function (n) {
        var isIn = slugs.indexOf(modOf(n)) >= 0;
        return { id: n.id,
          color: { background: orig[n.id], border: orig[n.id], opacity: isIn ? 1 : 0.06 },
          borderWidth: isIn ? 1 : 0, shadow: false };
      });
      nodesDS.update(updates);
      if (inMod.length) {
        // vis 9.1.6 `focus` expects a SINGLE node id (arrays get string-coerced
        // into a missing key + console.error, and the view never moves).
        // `fit({nodes})` is the documented API for zooming to a node set.
        network.fit({ nodes: inMod, animation: { duration: 600, easingFunction: 'easeInOutCubic' } });
      }
      for (var j = 0; j < all.length; j++) {
        all[j].classList.toggle('active', all[j].getAttribute('data-slug') === slug);
      }
    }
    function clearLens() {
      var updates = RAW_NODES.map(function (n) {
        return { id: n.id,
          color: { background: orig[n.id], border: orig[n.id], opacity: 1 },
          borderWidth: 1, shadow: false };
      });
      nodesDS.update(updates);
      network.fit({ animation: { duration: 600, easingFunction: 'easeInOutCubic' } });
      var all = document.querySelectorAll('.ym-card');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
    }
    var grid = sec.querySelector('.ym-grid');
    var cardEls = grid.children;
    for (var c = 0; c < cardEls.length; c++) {
      cardEls[c].addEventListener('click', function () {
        setLens(this.getAttribute('data-slug'));
      });
    }
    document.getElementById('ym-fit').addEventListener('click', clearLens);
    document.getElementById('ym-clear').addEventListener('click', clearLens);
    return true;
  }
  var tries = 0;
  var t = setInterval(function () { if (init() || ++tries > 150) clearInterval(t); }, 100);
})();
</script>
"""


def main():
    if not os.path.exists(TARGET):
        print("✗ graphify-out/graph.html not found — run "
              "`GRAPHIFY_VIZ_NODE_LIMIT=30000 GRAPHIFY_MAX_GRAPH_BYTES=80000000 graphify export html --node-limit 30000` first")
        sys.exit(1)
    html = open(TARGET, encoding="utf-8").read()
    if MARKER in html:
        print("ⓘ module lens already present — skipping")
        return
    html = html.replace("</body>", MARKER + "\n" + LENS + "\n</body>")
    open(TARGET, "w", encoding="utf-8").write(html)
    print(f"✓ module lens injected into {TARGET} ({os.path.getsize(TARGET) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
