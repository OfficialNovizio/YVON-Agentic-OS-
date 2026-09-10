"""graph_query.py - the READ half of the venture knowledge graph.

WHY THIS EXISTS (2026-09-10): graphify writes graphify-out/graph.json (12,051
nodes / 22,288 edges) but nothing in a live chat turn ever read it. caos-v2.ts
said so in its own panel: "venture graph - unwired, rows written, never
queried". This module is the missing query path.

MemPalace is deliberately NOT handled here: there is no mempalace CLI on the
host and MEMPALACE_PGVECTOR_DSN is unset - its serve daemon is gated behind
MASTER-PLAN.md P9. That is a deployment prerequisite, not a code change, and
claiming to query it would be the dishonesty caos-v2.ts was written to avoid.

Contract: never raises. An absent or unreadable graph returns "" and the turn
proceeds with no graph context (same degrade-gracefully rule as the RAG step).
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Optional

log = logging.getLogger("yvon.graph")

GRAPH_PATH = os.environ.get(
    "YVON_VENTURE_GRAPH",
    "/root/YVON-Agentic-OS-/graphify-out/graph.json",
)

_STOP = {
    "the", "and", "for", "with", "that", "this", "from", "how", "why", "what",
    "when", "into", "should", "would", "could", "about", "need", "want", "make",
    "does", "have", "has", "are", "was", "were", "you", "your", "our", "its",
    "before", "after", "then", "than", "them", "they", "there", "here",
}

_CACHE: dict[str, Any] = {"mtime": 0.0, "index": None}


def _load_index() -> Optional[dict]:
    """Load and invert the graph into {nodes, adjacency}, cached by mtime."""
    try:
        mtime = os.path.getmtime(GRAPH_PATH)
    except OSError:
        return None
    if _CACHE["index"] is not None and _CACHE["mtime"] == mtime:
        return _CACHE["index"]
    try:
        with open(GRAPH_PATH, "r", encoding="utf-8") as fh:
            g = json.load(fh)
        nodes = {n["id"]: n for n in g.get("nodes", []) if n.get("id")}
        adj: dict[str, list] = {}
        for e in g.get("links", []):
            s, t = e.get("source"), e.get("target")
            if s in nodes and t in nodes:
                adj.setdefault(s, []).append((e.get("relation", "related"), t))
        index = {"nodes": nodes, "adj": adj}
        _CACHE.update(mtime=mtime, index=index)
        return index
    except Exception as exc:  # noqa: BLE001 - never block a turn on the graph
        log.debug("venture graph load failed: %s", exc)
        return None


def query_graph(query: str, limit: int = 6) -> str:
    """Return a compact textual slice of the graph relevant to `query`, or ""."""
    idx = _load_index()
    if not idx:
        return ""
    terms = [t for t in re.findall(r"[a-z0-9]{3,}", str(query).lower()) if t not in _STOP]
    if not terms:
        return ""
    scored = []
    for nid, node in idx["nodes"].items():
        hay = (str(node.get("norm_label", "")) + " "
               + str(node.get("label", "")) + " "
               + str(node.get("source_file", ""))).lower()
        hits = sum(1 for t in terms if t in hay)
        if hits:
            scored.append((hits, nid))
    if not scored:
        return ""
    scored.sort(key=lambda x: (-x[0], x[1]))
    out = []
    for _, nid in scored[:limit]:
        node = idx["nodes"][nid]
        out.append("- " + str(node.get("label", nid)) + " [" + str(node.get("source_file", "?")) + "]")
        for rel, tgt in (idx["adj"].get(nid) or [])[:4]:
            out.append("    " + str(rel) + " -> " + str(idx["nodes"].get(tgt, {}).get("label", tgt)))
    return chr(10).join(out)


def available() -> bool:
    """True when a readable graph exists - lets the panel report honestly."""
    return _load_index() is not None
