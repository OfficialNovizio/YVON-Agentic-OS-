#!/usr/bin/env python3
"""graph-build.py — compile the Graph-Brain feed for the dashboard (G2, first cut).

Emits dashboard/public/brain-graph.json = YVON's real brain ONLY:
  departments — the 7 real departments (lobes)
  systems     — System nodes (RAG/CIE/CAOS/TOON/harness) from MASTER
  nodes       — the 46 real agents (from worktrees)
  edges       — real dependency edges (consumes/handoff/related)

No brands/clients are emitted — they don't exist yet. When a brand/client gets a real Node-Zero
graph, add it here (never before). Re-run after worktree edits. No values invented.
"""
from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEAMS = ROOT / "Teams"
OUT = ROOT / "dashboard" / "public" / "brain-graph.json"


def il(t, k):
    m = re.search(rf"^{re.escape(k)}:\s*\[(.*?)\]", t, re.M)
    return [x.strip().strip('"').strip("'") for x in m.group(1).split(",") if x.strip()] if m and m.group(1).strip() else []


def sc(t, k):
    m = re.search(rf"^{re.escape(k)}:\s*(.+?)\s*(?:#.*)?$", t, re.M)
    return m.group(1).strip().strip('"').strip("'") if m else ""


# ── YVON systems (MASTER organs — the brain regions §3) ─────────────────────
SYSTEMS = [
    {"id": "CAOS", "type": "system", "region": "thalamus", "desc": "CLASSIFY→RESOLVE→RETRIEVE→GATE retrieval routing"},
    {"id": "CIE", "type": "system", "region": "parietal", "desc": "Context Intelligence Engine — assembles context"},
    {"id": "RAG", "type": "system", "region": "parietal", "desc": "rag/core + 5-gate harness"},
    {"id": "harness", "type": "system", "region": "brainstem", "desc": "5-gate verification — always-on"},
    {"id": "TOON", "type": "system", "region": "corpus-callosum", "desc": "compression / injectable form"},
]


def build_yvon():
    depts, nodes, edges, seen = [], [], [], set()
    for wt in sorted(TEAMS.glob("*/*/operational/worktree/*-worktree.yaml")):
        t = wt.read_text(encoding="utf-8", errors="ignore")
        a, d = sc(t, "agent"), sc(t, "dept")
        if d not in depts:
            depts.append(d)
        nodes.append({"id": a, "type": "agent", "dept": d, "role": sc(t, "role"),
                      "skills": il(t, "skill_chain"), "tools": il(t, "tools"),
                      "builder": "Write" in il(t, "tools"), "produces": sc(t, "produces")})
        rel, hand, cons = il(t, "related"), il(t, "handoff"), il(t, "consumes")

        def add(x, y, k):
            if x and y and x != y and (x, y, k) not in seen:
                seen.add((x, y, k)); edges.append({"from": x, "to": y, "kind": k})
        for c in cons:
            add(c.split("@")[-1], a, "consumes")
        for h in hand:
            add(a, h, "handoff")
        for r in rel:
            if not any((p in seen) for p in [(r, a, "consumes"), (a, r, "handoff"), (a, r, "related"), (r, a, "related")]):
                add(a, r, "related")
    return {"departments": depts, "systems": SYSTEMS, "nodes": nodes, "edges": edges}


def main():
    graph = build_yvon()   # YVON's real brain only — no invented brands/clients
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(graph), encoding="utf-8")
    print(f"✓ {OUT.relative_to(ROOT)} — {len(graph['nodes'])} agents, "
          f"{len(graph['systems'])} systems, {len(graph['edges'])} edges, {len(graph['departments'])} depts")


if __name__ == "__main__":
    main()
