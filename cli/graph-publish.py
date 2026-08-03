#!/usr/bin/env python3
"""graph-publish.py — reduce graphify's graph.json into a level-of-detail feed for the dashboard.

graphify-out/graph.json is huge (thousands of nodes). Rendering it flat is a hairball, so we
publish an OVERVIEW: modules (top-level folders = brain regions) sized by node count, aggregated
inter-module edges, plus each module's god-nodes (most-connected) for drill-in. The dashboard
renders the overview and lazy-loads a module's real nodes on click.

Out: dashboard/public/graph-view.json   (small overview)
     dashboard/public/graph-full.json    (the raw graphify graph, for drill-in)
Run after `graphify extract .` (or cli/graph-sync). No values invented — pure aggregation.
"""
from __future__ import annotations
import json, shutil
from collections import defaultdict, Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "graphify-out" / "graph.json"
PUB = ROOT / "dashboard" / "public"


def module_of(sf: str) -> str:
    if not sf:
        return "(root)"
    parts = sf.split("/")
    return parts[0] if not parts[0].startswith(".") else parts[0]


def main():
    if not SRC.exists():
        raise SystemExit(f"❌ {SRC} not found — run: graphify extract . --code-only")
    g = json.load(open(SRC))
    nodes = g["nodes"]
    links = g.get("links", g.get("edges", []))
    nid = {n["id"]: n for n in nodes}

    # degree (god-node ranking)
    deg = Counter()
    for e in links:
        deg[e["source"]] += 1
        deg[e["target"]] += 1

    # module aggregation
    mod_nodes = defaultdict(list)
    for n in nodes:
        mod_nodes[module_of(n.get("source_file", ""))].append(n)
    modules = []
    for m, ns in sorted(mod_nodes.items(), key=lambda kv: -len(kv[1])):
        langs = Counter(x.get("metadata", {}).get("language") for x in ns)
        comms = {x.get("community") for x in ns}
        top = sorted(ns, key=lambda x: -deg[x["id"]])[:12]
        modules.append({
            "id": m, "count": len(ns),
            "langs": [l for l, _ in langs.most_common(4) if l],
            "communities": len([c for c in comms if c is not None]),
            "godNodes": [{"id": x["id"], "label": x.get("label", x["id"]),
                          "file": x.get("source_file", ""), "deg": deg[x["id"]],
                          "kind": x.get("metadata", {}).get("kind", "")} for x in top],
        })

    # inter-module edges
    mod_of_id = {n["id"]: module_of(n.get("source_file", "")) for n in nodes}
    me = Counter()
    for e in links:
        a, b = mod_of_id.get(e["source"]), mod_of_id.get(e["target"])
        if a and b and a != b:
            me[tuple(sorted((a, b)))] += 1
    edges = [{"from": a, "to": b, "count": c} for (a, b), c in me.items()]

    view = {"totals": {"nodes": len(nodes), "edges": len(links), "communities": len({n.get("community") for n in nodes})},
            "commit": g.get("built_at_commit", "")[:8], "modules": modules, "edges": edges}
    PUB.mkdir(parents=True, exist_ok=True)
    (PUB / "graph-view.json").write_text(json.dumps(view), encoding="utf-8")
    shutil.copyfile(SRC, PUB / "graph-full.json")
    print(f"✓ graph-view.json — {len(modules)} modules, {len(edges)} inter-module edges "
          f"(from {view['totals']['nodes']} nodes, {view['totals']['communities']} communities)")
    print(f"✓ graph-full.json — {(PUB/'graph-full.json').stat().st_size//1024} KB (drill-in)")
    for m in modules[:12]:
        print(f"    {m['id']:16} {m['count']:5} nodes · {m['communities']} communities · {','.join(m['langs'])}")


if __name__ == "__main__":
    main()
