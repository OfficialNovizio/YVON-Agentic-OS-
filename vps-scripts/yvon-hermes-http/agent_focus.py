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

    # Tool surface (2026-09-10). Tools remain SHARED - this only points the agent
    # at the ones its job needs, and states WHY, so the choice is auditable.
    tools = tools_for(info["agent"], message)
    reasons = tool_reasons(info["agent"], message)
    if tools:
        lines = [
            "[YOUR TOOLS THIS TURN - every tool remains available to you; these are",
            " the ones this job needs. Reach for one before improvising its effect by",
            " hand.]",
            "  " + ", ".join(tools),
        ]
        for why, ts in reasons:
            lines.append("  - " + why + ": " + ", ".join(ts))
        if any(t in tools for t in ("Write", "Edit")):
            lines.append(
                "  Code style: COMPACT. No filler comments, no restating the",
                " obvious, no scaffolding you were not asked for - the smallest",
                " diff that does the job."
            )
        parts.append(chr(10).join(lines))
    return (chr(10) + chr(10)).join(parts)


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

# ── Tool affinity (2026-09-10) ────────────────────────────────────────────────
# Tools stay SHARED — every agent can call every tool. The gap was that nothing
# ever pointed the assigned agent at the tools its job actually needs, so an
# agent with a reference URL had no nudge toward the scraping path while an
# agent writing files had no nudge toward Write/Edit. This is a SURFACING layer,
# never a restriction: an agent that needs something unlisted can still use it.
#
# Two inputs, deliberately: who you are (base affinity) and what this turn is
# (context rules). The mia case is exactly a context rule — ANY agent handed a
# reference URL needs the scraping tools, not just mia.
_BASE_TOOLS: dict[str, list] = {
    "mia":     ["Read", "Glob", "Grep", "Write", "Edit", "Bash", "WebFetch"],
    "raj":     ["Read", "Glob", "Grep", "Write", "Edit", "Bash"],
    "nova":    ["Read", "Glob", "Grep", "Write", "Edit", "Bash"],
    "dev":     ["Read", "Glob", "Grep", "Edit", "Github", "GraphQuery"],
    "quinn":   ["Read", "Glob", "Grep", "Bash", "WebFetch"],
    "ops":     ["Bash", "Read", "Glob", "Grep", "Write"],
    "dana":    ["Read", "Grep", "Bash", "GraphQuery"],
    "query":   ["Read", "Grep", "Bash", "GraphQuery"],
    "viz":     ["Read", "Glob", "Grep", "Write"],
    "aegis":   ["Read", "Grep", "Glob", "Bash", "WebSearch"],
    "warden":  ["Read", "Grep", "Glob", "WebSearch"],
    "cypher":  ["Read", "Grep", "Glob", "Bash"],
    "atlas":   ["Read", "Glob", "Grep", "Write"],
    "pixel":   ["Read", "Glob", "Write", "Edit", "WebFetch"],
    "lena":    ["Read", "Glob", "Grep", "Write"],
    "spark":   ["Read", "Glob", "Grep", "WebSearch", "WebFetch"],
    "scope":   ["WebSearch", "WebFetch", "Read", "Grep"],
    "rival":   ["WebSearch", "WebFetch", "Read"],
    "trend":   ["WebSearch", "Read", "Grep"],
    "research":["WebSearch", "WebFetch", "Read", "Write"],
    "felix":   ["Read", "Grep", "Bash", "Write"],
    "ledger":  ["Read", "Grep", "Bash"],
    "tax":     ["WebSearch", "Read", "Grep"],
    "comply":  ["WebSearch", "Read", "Grep", "Glob"],
    "scribe":  ["Read", "Grep", "Glob", "Write"],
    "guard":   ["WebSearch", "Read", "Grep"],
    "hire":    ["Read", "Grep", "Glob", "WebSearch"],
    "closer":  ["Read", "Grep", "WebSearch", "Write"],
    "lure":    ["WebSearch", "Read", "Write"],
    "retain":  ["Read", "Grep", "GraphQuery", "WebSearch"],
    "keel":    ["Read", "Grep", "WebSearch"],
    "ally":    ["Read", "Grep", "GraphQuery"],
    "marcus":  ["Read", "Grep", "Glob"],
    "board":   ["Read", "Grep"],
    "meta":    ["Read", "Grep", "Glob", "GraphQuery"],
}

# Context rules: (regex, tools to surface, why). Applied for ANY agent, because
# the need follows the TASK, not the persona. Order matters only for the reason
# text; the tool sets are unioned.
_CONTEXT_TOOLS: list = [
    (r"https?://|\burl\b|reference (site|website|design)|like this\b",
     ["WebFetch", "read_file", "terminal"],
     "a reference URL is present - capture the real page rather than guessing"),
    (r"\b(scrape|crawl|harvest|extract (the )?(content|assets|fonts|images))\b",
     ["WebFetch", "terminal", "Write"],
     "explicit scraping/extraction request"),
    (r"\b(build|implement|write|create|scaffold|refactor|fix|debug)\b",
     ["Write", "Edit", "Bash"],
     "code will be produced - write it, do not describe it"),
    (r"\b(review|audit|assess|check)\b",
     ["Read", "Grep", "Glob"],
     "review work - read the real files before judging"),
    (r"\b(search|find|research|look up|market|competitor)\b",
     ["WebSearch", "WebFetch"],
     "external research required"),
    (r"\b(graph|dependency|callers|impact|who calls)\b",
     ["GraphQuery"],
     "structural question - query the knowledge graph"),
    (r"\b(plan|roadmap|break (it )?down|multi-?step)\b",
     ["TodoWrite"],
     "multi-step work - track it explicitly"),
]


def tools_for(agent_id: str, message: str = "") -> list:
    """Ordered tool names worth surfacing for this agent AND this turn."""
    import re as _re
    a = str(agent_id or "").strip().lower()
    out: list = list(_BASE_TOOLS.get(a, []))
    for pat, tools, _why in _CONTEXT_TOOLS:
        if _re.search(pat, message or "", _re.I):
            for t in tools:
                if t not in out:
                    out.append(t)
    return out


def tool_reasons(agent_id: str, message: str = "") -> list:
    """(reason, tools) pairs for the context rules that actually fired."""
    import re as _re
    fired = []
    for pat, tools, why in _CONTEXT_TOOLS:
        if _re.search(pat, message or "", _re.I):
            fired.append((why, tools))
    return fired
