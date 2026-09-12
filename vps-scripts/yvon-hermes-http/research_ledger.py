"""research_ledger.py - durable, room-scoped record of what has ALREADY been
gathered, so a later turn (or a different agent) does not redo it.

WHY THIS EXISTS (2026-09-11): the operator asked why a scraped reference has to
be re-fetched "again n again" by every subsequent agent. The answer was that no
such memory existed:
  - capture reuse in main.py is URL-keyed with a 12h TTL and only covers the
    capture step, not terminal/read_file/web research an agent does itself;
  - turn artifacts are written under <venture>/<correlation>/, and a NEW turn has
    a NEW correlation, so it has no way to discover the previous one;
  - the RAG index holds Teams/ documentation only - conversation artifacts never
    enter it;
  - MemPalace is write-only (drawers written, never queried).

This module is the missing read path: append-only JSONL, one record per gathered
thing, keyed by room so a thread keeps its own context.

Contract: never raises. A missing or corrupt ledger returns [] and the turn
proceeds exactly as before.
"""
from __future__ import annotations

import json
import logging
import os
import time
from typing import Optional

log = logging.getLogger("yvon.research")

ARTIFACTS_ROOT = os.environ.get("YVON_ARTIFACTS_ROOT", "/opt/yvon-hermes-http/workspaces/_artifacts")
TOTAL_CAP = 400


def _ledger_path(room_id: str):
    safe = "".join(c for c in str(room_id) if c.isalnum() or c in "-_") or "unknown"
    d = os.path.join(ARTIFACTS_ROOT, "_research")
    return os.path.join(d, safe + ".jsonl"), d


def record(room_id: str, kind: str, ref: str, paths=None, digest=None, note: str = "") -> None:
    """Append one gathered item."""
    try:
        path, d = _ledger_path(room_id)
        os.makedirs(d, exist_ok=True)
        entry = {
            "ts": time.time(),
            "kind": str(kind)[:32],
            "ref": str(ref)[:500],
            "paths": [str(p) for p in (paths or [])][:40],
            "digest": digest or {},
            "note": str(note)[:300],
        }
        with open(path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + chr(10))
        try:
            with open(path, "r", encoding="utf-8") as fh:
                n = sum(1 for _ in fh)
            if n > TOTAL_CAP:
                with open(path, "r", encoding="utf-8") as fh:
                    rows = [json.loads(l) for l in fh if l.strip()]
                with open(path, "w", encoding="utf-8") as fh:
                    for row in rows[-TOTAL_CAP:]:
                        fh.write(json.dumps(row) + chr(10))
        except Exception:
            pass
    except Exception as exc:
        log.debug("research record failed: %s", exc)


def recent(room_id: str, limit: int = 12) -> list:
    """Newest-first records for this room ([] when none/unreadable)."""
    try:
        path, _ = _ledger_path(room_id)
        if not os.path.isfile(path):
            return []
        out = []
        with open(path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    out.append(json.loads(line))
                except ValueError:
                    continue
        return list(reversed(out))[:limit]
    except Exception as exc:
        log.debug("research read failed: %s", exc)
        return []


def prompt_block(room_id: str, limit: int = 8) -> str:
    """Prior-research briefing for the prompt, or empty when nothing is on record."""
    rows = recent(room_id, limit)
    if not rows:
        return ""
    lines = [
        "[PRIOR RESEARCH IN THIS THREAD - already gathered, do NOT repeat it]",
        "Collected earlier in THIS conversation; the files are still on disk. Read",
        "them instead of re-fetching, re-scraping or re-searching. Gather again only",
        "if the user asks for something materially NEW, or if you can name exactly",
        "what is missing from what is already here.",
    ]
    for r in rows:
        age_m = max(0, int((time.time() - float(r.get("ts") or 0)) / 60))
        lines.append("- [%s] %s (%dm ago)" % (r.get("kind") or "?", str(r.get("ref"))[:160], age_m))
        for p in (r.get("paths") or [])[:8]:
            lines.append("    " + p)
        d = r.get("digest") or {}
        if d:
            lines.append("    measured: " + ", ".join("%s=%s" % (k, v) for k, v in list(d.items())[:8]))
        if r.get("note"):
            lines.append("    note: " + str(r["note"])[:200])
    return chr(10).join(lines)
