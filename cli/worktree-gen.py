#!/usr/bin/env python3
"""worktree-gen.py — scaffold operational/worktree/<agent>-worktree.yaml (A2 v2).

The worktree file is the CONTRACT an agent runs under AND the source data for the
graph/subway view and safe parallelism. Schema v2 (adds verify + sandbox):

    agent · dept · role
    consumes      — contracts this agent needs   (X@owner)      [FILL_IN]
    skill_chain   — ordered skills it runs        (from skill-routing "The shape")
    tools         — allowlist                      (from .claude/agents)
    owns_paths    — disjoint write paths → safe parallel         [FILL_IN]
    produces      — the artifact it emits                        [FILL_IN]
    handoff       — agents it hands to             (verify.gate seed)
    escalates_to  — who it escalates to                          [FILL_IN]
    related       — agents referenced in routing   (edge seed for the graph)
    verify        — { self: [skills], gate: <agent> }
    sandbox       — { tier: auto|1|2, risk: low|high }

Extraction is best-effort (skill_chain, handoff, related are derived; consumes/
produces/owns_paths/escalates_to are left <FILL_IN> — never invented). Author the
important ones by hand (mia is the reviewed exemplar). Re-run: python3 cli/worktree-gen.py [--all|<agent>]
"""
from __future__ import annotations
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEAMS = ROOT / "Teams"


def agents_index() -> dict[str, Path]:
    idx = {}
    for md in TEAMS.glob("*/*/agent.md"):
        idx[md.parent.name] = md.parent
    return idx


ALL = None  # filled in main


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="ignore") if p.exists() else ""


def section(text: str, header: str) -> str:
    m = re.search(rf"^#{{2,3}}\s+{re.escape(header)}\s*$", text, re.M)
    if not m:
        return ""
    start = m.end()
    nxt = re.compile(r"^#{2,3}\s+", re.M).search(text, start)
    return text[start: nxt.start() if nxt else len(text)]


def yaml_list(items) -> str:
    return "[" + ", ".join(items) + "]" if items else "[]"


def gen(agent: str, folder: Path) -> Path:
    dept = folder.parent.name
    a_txt = read(folder / "agent.md")
    role = (re.search(r"^role:\s*(.+)$", a_txt, re.M) or [None, ""])[1].strip() if re.search(r"^role:", a_txt, re.M) else ""

    routing = read(folder / "operational" / "skill" / f"{agent}-skill-routing.md")
    custom = sorted(p.name for p in (folder / "custom").glob("*/") if (p / "SKILL.md").exists()) if (folder / "custom").exists() else []

    # skill_chain: skills in the order they appear in "The shape"; fallback = custom dirs
    shape = section(routing, "The shape")
    chain = [s for s in custom if False]  # placeholder to keep order logic below
    ordered = []
    for s in re.findall(r"[a-z][a-z0-9-]+", shape):
        if s in custom and s not in ordered:
            ordered.append(s)
    skill_chain = ordered or custom

    # tools from compiled agent
    comp = read(ROOT / ".claude" / "agents" / f"{agent}.md")
    mt = re.search(r"^tools:\s*(.+)$", comp, re.M)
    tools = [t.strip() for t in mt.group(1).split(",")] if mt else []

    # related agents: any known agent id mentioned in routing (excl self)
    hand_txt = section(routing, "Handoffs") or routing
    related = sorted({a for a in ALL if a != agent and re.search(rf"\b{re.escape(a)}\b", hand_txt)})

    # verify gate: quinn if this agent is a builder in Engineering, else dev/self
    gate = "quinn" if ("Write" in tools and dept == "Engineering" and agent != "quinn") else "dev"
    self_skills = [s for s in skill_chain if "verif" in s] + ["verification-before-completion"]
    self_skills = list(dict.fromkeys(self_skills))

    out = f"""# COMPILED scaffold by cli/worktree-gen.py — verify the <FILL_IN> fields by hand.
# The worktree is the agent's run contract + the graph/subway source + the parallel-safety key.
agent: {agent}
dept: {dept}
role: {role or '""'}
consumes: []            # <FILL_IN> contracts needed, e.g. design-tokens@atlas
skill_chain: {yaml_list(skill_chain)}
tools: {yaml_list(tools)}
owns_paths: []          # <FILL_IN> disjoint write paths → enables safe parallel (A3)
produces: ""            # <FILL_IN> the artifact this emits
handoff: []             # <FILL_IN> agents this hands to (verify.gate below is the seed)
escalates_to: ""        # <FILL_IN>
related: {yaml_list(related)}   # agents referenced in routing — edge seed for the graph
verify:
  self: {yaml_list(self_skills)}
  gate: {gate}
sandbox:
  tier: auto            # auto → quarantine.sh (TIER-1) · high → OpenSandbox (TIER-2)
  risk: low
"""
    dest = folder / "operational" / "worktree" / f"{agent}-worktree.yaml"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out, encoding="utf-8")
    return dest


def main(argv):
    global ALL
    idx = agents_index()
    ALL = set(idx)
    if argv and argv[0] not in ("--all",):
        a = argv[0]
        if a not in idx:
            print(f"unknown agent {a}"); return 1
        print("✓", gen(a, idx[a]).relative_to(ROOT))
        return 0
    for a, f in sorted(idx.items()):
        gen(a, f)
    print(f"✓ scaffolded {len(idx)} worktrees under Teams/*/*/operational/worktree/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
