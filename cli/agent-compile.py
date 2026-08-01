#!/usr/bin/env python3
"""agent-compile.py — compile an agent FOLDER into an invocable subagent.

The core finding (SESSION-HANDOUT §3): `.claude/agents/` does not exist, so all 46
agent folders are documentation that one model roleplays — none are actually invocable.
This compiler closes that gap. It reads `Teams/<Dept>/<agent>/` (the source of truth)
and emits `.claude/agents/<agent>.md` with the frontmatter the runtime needs:

    name         — the agent id
    description  — WHEN to route here (from operational/skill/<agent>-skill-routing.md)
    tools        — an allowlist (derived from operational/tool/<agent>-tool-requirements.md)
    model        — ONLY if operational/agent/<agent>-config.md sets one (never invented)

...plus a compiled body (Purpose + routing + principles + handoffs + pointers).

Usage:
    python3 cli/agent-compile.py --list          # discoverable agents
    python3 cli/agent-compile.py mia             # compile ONE (review first — decision A6)
    python3 cli/agent-compile.py --all           # compile every agent (after review)

The compiled file is generated — edit the SOURCE folder and recompile, never the output.
No values are invented: missing model → omitted (inherits); empty sections → skipped.
"""
from __future__ import annotations
import sys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEAMS = ROOT / "Teams"
OUT = ROOT / ".claude" / "agents"

# Builder agents (repo write) get the full file+shell set; advisory agents stay read-only.
BUILDER_TOOLS = ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
ADVISORY_TOOLS = ["Read", "Grep", "Glob"]


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split a leading --- YAML block into a flat {key: value} dict + the body. No pyyaml."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm_raw, body = text[3:end], text[end + 4:]
    fm: dict[str, str] = {}
    for line in fm_raw.splitlines():
        if ":" in line and not line.strip().startswith("#"):
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm, body.lstrip("\n")


def section(text: str, header: str) -> str:
    """Return the body under a `## Header`, INCLUDING nested subsections, up to the next
    header of the same-or-higher level (e.g. a `##` section captures its `###` children)."""
    pat = re.compile(rf"^(#{{2,3}})\s+{re.escape(header)}\s*$", re.M)
    m = pat.search(text)
    if not m:
        return ""
    level = len(m.group(1))
    start = m.end()
    nxt = re.compile(rf"^#{{1,{level}}}\s+", re.M).search(text, start)
    return text[start: nxt.start() if nxt else len(text)].strip()


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8") if p.exists() else ""


def discover() -> dict[str, Path]:
    """Map agent-id -> folder by scanning Teams/*/<agent>/agent.md."""
    agents: dict[str, Path] = {}
    for agent_md in TEAMS.glob("*/*/agent.md"):
        folder = agent_md.parent
        fm, _ = parse_frontmatter(read(agent_md))
        name = fm.get("name") or folder.name
        agents[name] = folder
    return agents


def derive_tools(agent: str, folder: Path) -> tuple[list[str], str]:
    """Builder (repo write) vs advisory, from the tool-requirements table. Returns (tools, why)."""
    treq = read(folder / "operational" / "tool" / f"{agent}-tool-requirements.md").lower()
    if re.search(r"read/write|write access|repo write|genuine code write|primary builder", treq):
        return BUILDER_TOOLS, "builder (repo write found in tool-requirements)"
    if treq:
        return ADVISORY_TOOLS, "advisory (no repo-write signal in tool-requirements)"
    return ADVISORY_TOOLS, "advisory (no tool-requirements file — conservative default)"


def compile_agent(agent: str, folder: Path) -> Path:
    a_fm, a_body = parse_frontmatter(read(folder / "agent.md"))
    role = a_fm.get("role", "")
    dept = a_fm.get("department", folder.parent.name)

    routing = read(folder / "operational" / "skill" / f"{agent}-skill-routing.md")
    principles = read(folder / "operational" / "principles" / f"{agent}-principles.md")
    config_fm, _ = parse_frontmatter(read(folder / "operational" / "agent" / f"{agent}-config.md"))

    purpose = section(a_body, "Purpose")
    shape = section(routing, "The shape")
    rules = section(routing, "Routing rules")
    handoffs = section(routing, "Handoffs")
    universal = section(principles, "Universal Principles")

    # description = role + trigger keywords pulled from the routing rules (→ **skill** lines)
    triggers = re.findall(r'"([^"]+)"', rules)
    trig_str = "; ".join(t.strip() for t in triggers[:8]) if triggers else purpose.split(".")[0]
    desc = f"{role} ({dept}). Route here for: {trig_str}."
    desc = " ".join(desc.split())  # collapse whitespace/newlines for a clean frontmatter line

    tools, tools_why = derive_tools(agent, folder)

    # model: ONLY if the config actually sets one — never invented
    model = config_fm.get("model", "")

    custom = sorted(p.name for p in (folder / "custom").glob("*/") if (p / "SKILL.md").exists()) \
        if (folder / "custom").exists() else []

    fm_lines = [f"name: {agent}", f"description: {desc}", f"tools: {', '.join(tools)}"]
    if model:
        fm_lines.append(f"model: {model}")

    out = [f"---\n" + "\n".join(fm_lines) + "\n---\n"]
    out.append(f"# {agent} — {role} ({dept})\n")
    out.append(f"> COMPILED by `cli/agent-compile.py` from `Teams/{dept}/{agent}/` — do NOT hand-edit. "
               f"Edit the source folder and recompile. Source of truth = the agent folder.\n")
    if purpose:
        out.append("## Purpose\n\n" + purpose + "\n")
    if rules:
        out.append("## When to route here\n\n" + rules + "\n")
    if shape:
        out.append("## Skill chain\n\n" + shape + "\n")
    if universal:
        out.append("## Principles (senior authority: Security Charter)\n\n" + universal + "\n")
    if handoffs:
        out.append("## Handoffs\n\n" + handoffs + "\n")

    # provenance / pointers
    model_str = f"`{model}`" if model else (
        f"inherits (not set in `operational/agent/{agent}-config.md` — set there to pin one)")
    ptr = ["## Tools, model & sources\n",
           f"- **Tools allowlist** (frontmatter): {', '.join(tools)} — {tools_why}.",
           f"- **Model**: {model_str}.",
           f"- **Full config**: `Teams/{dept}/{agent}/operational/agent/{agent}-config.md`",
           f"- **Custom skills**: {', '.join(custom) if custom else '(none)'} "
           f"(`Teams/{dept}/{agent}/custom/`)",
           f"- **Skill routing**: `Teams/{dept}/{agent}/operational/skill/{agent}-skill-routing.md`"]
    out.append("\n".join(ptr) + "\n")

    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{agent}.md"
    dest.write_text("\n".join(out), encoding="utf-8")
    return dest


def main(argv: list[str]) -> int:
    agents = discover()
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--list":
        for name, folder in sorted(agents.items()):
            print(f"  {name:12}  {folder.relative_to(ROOT)}")
        print(f"\n{len(agents)} agents discoverable.")
        return 0
    if argv[0] == "--all":
        for name, folder in sorted(agents.items()):
            dest = compile_agent(name, folder)
            print(f"  ✓ {name} → {dest.relative_to(ROOT)}")
        print(f"\nCompiled {len(agents)} agents to {OUT.relative_to(ROOT)}/")
        return 0
    name = argv[0]
    if name not in agents:
        print(f"❌ unknown agent '{name}'. Try: python3 cli/agent-compile.py --list")
        return 1
    dest = compile_agent(name, agents[name])
    print(f"✓ compiled {name} → {dest.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
