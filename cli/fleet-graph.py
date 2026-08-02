#!/usr/bin/env python3
"""fleet-graph.py — compile worktrees + agents into dashboard/public/fleet-graph.json.

The Brain tab reads this. Nodes = agents (dept, role, skills, tools, builder, produces).
Edges are directional where the worktree declares them:
    consumes  X@owner   → edge owner → agent   (data contract)
    handoff   [a,b]     → edge agent → a        (work handoff)
    related   [..]      → soft edge (undirected) — seed until worktrees are authored
Re-run after editing worktrees. No values invented — reads only what's declared.
"""
from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEAMS = ROOT / "Teams"
OUT = ROOT / "dashboard" / "public" / "fleet-graph.json"


def inline_list(text: str, key: str) -> list[str]:
    m = re.search(rf"^{re.escape(key)}:\s*\[(.*?)\]", text, re.M)
    if not m or not m.group(1).strip():
        return []
    return [x.strip().strip('"').strip("'") for x in m.group(1).split(",") if x.strip()]


def scalar(text: str, key: str) -> str:
    m = re.search(rf"^{key}:\s*(.+?)\s*(?:#.*)?$", text, re.M)
    return m.group(1).strip().strip('"').strip("'") if m else ""


def sub_scalar(text: str, parent: str, key: str) -> str:
    m = re.search(rf"^{parent}:\s*$\n((?:\s+.*\n?)+)", text, re.M)
    if not m:
        return ""
    mm = re.search(rf"^\s+{key}:\s*(.+?)\s*(?:#.*)?$", m.group(1), re.M)
    return mm.group(1).strip().strip('"').strip("'") if mm else ""


def main():
    nodes, edges, seen_edge = [], [], set()
    depts = []
    for wt in sorted(TEAMS.glob("*/*/operational/worktree/*-worktree.yaml")):
        t = wt.read_text(encoding="utf-8", errors="ignore")
        agent = scalar(t, "agent")
        dept = scalar(t, "dept")
        role = scalar(t, "role")
        skills = inline_list(t, "skill_chain")
        tools = inline_list(t, "tools")
        related = inline_list(t, "related")
        handoff = inline_list(t, "handoff")
        consumes = inline_list(t, "consumes")
        produces = scalar(t, "produces")
        gate = sub_scalar(t, "verify", "gate")
        builder = "Write" in tools
        if dept not in depts:
            depts.append(dept)
        nodes.append({"id": agent, "dept": dept, "role": role, "skills": skills,
                      "tools": tools, "builder": builder, "produces": produces, "gate": gate})

        def add(a, b, kind):
            k = (a, b, kind)
            if a and b and a != b and k not in seen_edge:
                seen_edge.add(k)
                edges.append({"from": a, "to": b, "kind": kind})
        for c in consumes:                       # owner → agent
            add(c.split("@")[-1], agent, "consumes")
        for h in handoff:                        # agent → target
            add(agent, h, "handoff")
        for r in related:                        # soft (only if no directional already)
            if (r, agent, "consumes") not in seen_edge and (agent, r, "handoff") not in seen_edge \
               and (agent, r, "related") not in seen_edge and (r, agent, "related") not in seen_edge:
                add(agent, r, "related")

    graph = {"departments": depts, "nodes": nodes, "edges": edges}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(graph), encoding="utf-8")
    print(f"✓ {OUT.relative_to(ROOT)} — {len(nodes)} nodes, {len(edges)} edges, {len(depts)} depts")
    d = sum(1 for e in edges if e["kind"] != "related")
    print(f"  directional (handoff/consumes): {d} · soft (related): {len(edges)-d}")


if __name__ == "__main__":
    main()
