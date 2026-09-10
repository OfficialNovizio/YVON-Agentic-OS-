"""agent_focus.py - focus a turn on the ASSIGNED agent: its identity, its skill
routing, and its tool surface.

WHY THIS EXISTS (2026-09-10): main.py resolved `_actors` and used it ONLY for
event attribution (`_emit_all` labels the turn with it). Nothing consumed it to
actually focus the turn. The consequence, measured across 20 realistic tasks:
every agent received the same generic prompt and the same generic "cli" toolset,
regardless of who was assigned. Agents were decoration. Skills were never
disclosed (caos-v2.ts: "skills - no disclosure event"), and tools were never
scoped per agent.

This module supplies the missing half: given an agent id it locates that agent's
own definition and skill routing inside the repo and renders them as a prompt
block, so the turn is genuinely grounded in the assigned agent.

Contract: never raises. An unknown agent returns an empty block and the turn
proceeds exactly as before (fail open, never fabricate an identity).
"""
from __future__ import annotations

import logging
import os
from typing import Any, Optional

log = logging.getLogger("yvon.focus")

TEAMS_DIR = os.environ.get("YVON_TEAMS_DIR", "/root/YVON-Agentic-OS-/Teams")

_INDEX: dict[str, Any] = {"built": False, "by_agent": {}}


def _build_index() -> dict:
    """Map agent id -> (dept_dir, agent_dir). Built once, lazily."""
    if _INDEX["built"]:
        return _INDEX["by_agent"]
    by_agent: dict[str, tuple] = {}
    try:
        for dept in os.listdir(TEAMS_DIR):
            dept_path = os.path.join(TEAMS_DIR, dept)
            if not os.path.isdir(dept_path) or dept == "Shared OS":
                continue
            for agent in os.listdir(dept_path):
                ap = os.path.join(dept_path, agent)
                if os.path.isfile(os.path.join(ap, "agent.md")):
                    by_agent.setdefault(agent, (dept, ap))
    except Exception as exc:  # noqa: BLE001
        log.debug("team index build failed: %s", exc)
    _INDEX.update(built=True, by_agent=by_agent)
    return by_agent


def _read(path: str, limit: int) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()[:limit]
    except OSError:
        return ""


def resolve(agent_id: str) -> Optional[dict]:
    """Return {agent, dept, dir, skill_routing_path} or None."""
    if not agent_id:
        return None
    a = str(agent_id).strip().lower()
    hit = _build_index().get(a)
    if not hit:
        return None
    dept, ap = hit
    routing = os.path.join(ap, "operational", "skill", a + "-skill-routing.md")
    return {"agent": a, "dept": dept, "dir": ap,
            "skill_routing_path": routing if os.path.isfile(routing) else None}


def focus_block(agent_id: str, max_identity: int = 2600, max_routing: int = 2200) -> str:
    """Prompt block grounding the turn in the assigned agent, or ""."""
    info = resolve(agent_id)
    if not info:
        return ""
    parts = []
    ident = _read(os.path.join(info["dir"], "agent.md"), max_identity)
    if ident:
        parts.append(
            "[YOU ARE %s - %s department]\nYour own operating definition follows. "
            "Follow it; it overrides generic instincts about how this work is done.\n%s"
            % (info["agent"], info["dept"], ident)
        )
    if info["skill_routing_path"]:
        routing = _read(info["skill_routing_path"], max_routing)
        if routing:
            parts.append(
                "[YOUR SKILL ROUTING - %s]\nWhich of your skills apply to which "
                "request, and which directories hold them. Consult a skill before "
                "improvising an approach it already covers.\n%s"
                % (info["agent"], routing)
            )
    return "\n\n".join(parts)


def skills_for(agent_id: str) -> list:
    """Skill directory names this agent owns - for honest disclosure events."""
    info = resolve(agent_id)
    if not info:
        return []
    found = []
    for sub in ("custom", "marketplace", "operational/skill"):
        base = os.path.join(info["dir"], *sub.split("/"))
        try:
            for name in os.listdir(base):
                if os.path.isdir(os.path.join(base, name)):
                    found.append(name)
        except OSError:
            continue
    return sorted(set(found))
