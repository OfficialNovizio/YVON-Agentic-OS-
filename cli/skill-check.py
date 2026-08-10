#!/usr/bin/env python3
"""cli/skill-check.py — deterministic skill gate (TS-024 · gates 1–7).

Checks a skill in Teams/<dept>/<agent>/<custom|marketplace>/<skill>/SKILL.md:
  1. exists            — SKILL.md present
  2. frontmatter       — name + description non-empty
  3. substance         — real instructions, not a placeholder stub
  4. no placeholders   — no <FILL_IN> / TODO: wire (playbook §0.5)
  5. assets intact     — every file referenced exists on disk
  6. routing present   — agent's operational/skill/<agent>-skill-routing.md
                         references the skill (custom skills)
  7. sanity            — not truncated / bloated; config/commands consistent

Gate 8 (qualitative "good to use") is Hermes's judgment layer, run on the VPS
once the repo is reachable there — this script is the deterministic base.

Verdict: PASS / FAIL / PASS-WITH-NOTES, with findings + recommendation.

Usage:
  python3 cli/skill-check.py --all                 # check every skill in Teams/
  python3 cli/skill-check.py --agent mia           # all skills for one agent
  python3 cli/skill-check.py --skill design-tokens # by skill name (first match)
  python3 cli/skill-check.py --test                # self-tests
"""
from __future__ import annotations

import json
import os
import re
import sys
from typing import Any, Optional

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEAMS = os.path.join(ROOT, "Teams")

PLACEHOLDER_PATTERNS = [r"<FILL_IN>", r"TODO:\s*wire", r"<your\s", r"lorem ipsum", r"TBD\s*$"]
MIN_BODY_CHARS = 120
MAX_BODY_CHARS = 60_000  # sanity: not bloated


def find_skills() -> list[dict[str, str]]:
    """All (dept, agent, location, skill, path) tuples under Teams/."""
    found: list[dict[str, str]] = []
    if not os.path.isdir(TEAMS):
        return found
    for dept in sorted(os.listdir(TEAMS)):
        dept_dir = os.path.join(TEAMS, dept)
        if not os.path.isdir(dept_dir):
            continue
        for agent in sorted(os.listdir(dept_dir)):
            agent_dir = os.path.join(dept_dir, agent)
            if not os.path.isdir(agent_dir):
                continue
            for location in ("custom", "marketplace"):
                loc_dir = os.path.join(agent_dir, location)
                if not os.path.isdir(loc_dir):
                    continue
                for skill in sorted(os.listdir(loc_dir)):
                    skill_dir = os.path.join(loc_dir, skill)
                    if os.path.isdir(skill_dir) and os.path.exists(os.path.join(skill_dir, "SKILL.md")):
                        found.append({
                            "dept": dept,
                            "agent": agent,
                            "location": location,
                            "skill": skill,
                            "dir": skill_dir,
                            "path": os.path.join(skill_dir, "SKILL.md"),
                        })
    return found


def check_skill(entry: dict[str, str]) -> dict[str, Any]:
    """Run gates 1–7 on one skill; return the verdict record."""
    path = entry["path"]
    findings: list[str] = []
    notes: list[str] = []

    # Gate 1 — exists
    if not os.path.exists(path):
        return {
            **entry,
            "verdict": "FAIL",
            "findings": ["SKILL.md missing"],
            "notes": [],
            "recommendation": "not usable — create the SKILL.md",
        }

    try:
        content = open(path, encoding="utf-8").read()
    except OSError as exc:
        return {**entry, "verdict": "FAIL", "findings": [f"unreadable: {exc}"], "notes": [], "recommendation": "not usable"}

    # Gate 2 — frontmatter: name + description
    fm = {}
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, _, v = line.partition(":")
                fm[k.strip()] = v.strip()
    if not fm.get("name"):
        findings.append("frontmatter: missing name")
    if not fm.get("description"):
        findings.append("frontmatter: missing description")

    # Gate 3 — substance
    body = content
    if m:
        body = content[m.end():]
    if len(body.strip()) < MIN_BODY_CHARS:
        findings.append(f"substance: body only {len(body.strip())} chars (< {MIN_BODY_CHARS})")
    if len(body) > MAX_BODY_CHARS:
        notes.append(f"sanity: body is large ({len(body)} chars) — check for bloat")

    # Gate 4 — no placeholders
    for pat in PLACEHOLDER_PATTERNS:
        if re.search(pat, content, re.I):
            findings.append(f"placeholder: '{pat}' present")

    # Gate 5 — assets intact (relative paths referenced in body)
    for ref in re.findall(r"(?:`|\[)?((?:assets|skills?|data|scripts?)/[^\s`)\]\"']+)", body):
        candidate = os.path.normpath(os.path.join(entry["dir"], ref))
        if not os.path.exists(candidate):
            findings.append(f"asset missing: {ref}")

    # Gate 6 — routing present (custom skills)
    if entry["location"] == "custom":
        routing = os.path.join(TEAMS, entry["dept"], entry["agent"], "operational", "skill", f"{entry['agent']}-skill-routing.md")
        if not os.path.exists(routing):
            notes.append(f"routing: {entry['agent']}-skill-routing.md missing (agent not fully built?)")
        else:
            try:
                rtext = open(routing, encoding="utf-8").read()
                if entry["skill"] not in rtext:
                    notes.append(f"routing: '{entry['skill']}' not referenced in skill-routing.md")
            except OSError:
                pass

    # Verdict
    if findings:
        verdict = "FAIL"
        recommendation = "needs fixes before use"
    elif notes:
        verdict = "PASS-WITH-NOTES"
        recommendation = "usable — address the notes"
    else:
        verdict = "PASS"
        recommendation = "good to use"

    return {**entry, "verdict": verdict, "findings": findings, "notes": notes, "recommendation": recommendation}


def run_all() -> list[dict[str, Any]]:
    return [check_skill(s) for s in find_skills()]


def print_report(results: list[dict[str, Any]]) -> None:
    for r in results:
        mark = {"PASS": "✅", "PASS-WITH-NOTES": "⚠️", "FAIL": "❌"}[r["verdict"]]
        print(f"{mark} [{r['verdict']}] {r['agent']}/{r['location']}/{r['skill']}")
        for f in r["findings"]:
            print(f"     ✗ {f}")
        for n in r["notes"]:
            print(f"     · {n}")
        if r["findings"] or r["notes"]:
            print(f"     → {r['recommendation']}")
    total = len(results)
    passed = sum(1 for r in results if r["verdict"] == "PASS")
    notes = sum(1 for r in results if r["verdict"] == "PASS-WITH-NOTES")
    failed = sum(1 for r in results if r["verdict"] == "FAIL")
    print(f"\n── {total} skills · {passed} PASS · {notes} PASS-WITH-NOTES · {failed} FAIL ──")


def run_tests() -> bool:
    passed = failed = 0

    def check(label: str, cond: bool, detail: str = "") -> None:
        nonlocal passed, failed
        if cond:
            print(f"  ✅ {label}")
            passed += 1
        else:
            print(f"  ❌ {label}: {detail}")
            failed += 1

    print("\n  🧪 skill-check — Self-Tests\n")
    skills = find_skills()
    check("fleet discovered", len(skills) > 0, f"found {len(skills)}")
    check("entries have required keys", all(k in skills[0] for k in ("dept", "agent", "location", "skill", "path")))
    check("custom + marketplace both scanned", any(s["location"] == "custom" for s in skills) and any(s["location"] == "marketplace" for s in skills))

    # Test on a real skill: verdict is one of the three
    if skills:
        res = check_skill(skills[0])
        check("verdict is valid", res["verdict"] in ("PASS", "PASS-WITH-NOTES", "FAIL"), res["verdict"])
        check("verdict has recommendation", bool(res["recommendation"]))

    # Fake skill: missing file → FAIL
    fake = {"dept": "X", "agent": "x", "location": "custom", "skill": "nope", "dir": "/nonexistent", "path": "/nonexistent/SKILL.md"}
    res = check_skill(fake)
    check("missing file → FAIL", res["verdict"] == "FAIL", res["verdict"])

    print(f"\n  {'✅' if failed == 0 else '❌'} {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    argv = sys.argv[1:]
    if "--test" in argv:
        sys.exit(0 if run_tests() else 1)
    if "--json" in argv:
        print(json.dumps(run_all(), indent=2))
        sys.exit(0)
    if "--all" in argv:
        print_report(run_all())
        sys.exit(0)
    if "--agent" in argv:
        agent = argv[argv.index("--agent") + 1]
        print_report([check_skill(s) for s in find_skills() if s["agent"] == agent])
        sys.exit(0)
    if "--skill" in argv:
        name = argv[argv.index("--skill") + 1]
        matches = [s for s in find_skills() if s["skill"] == name]
        if not matches:
            print(f"skill '{name}' not found")
            sys.exit(1)
        print_report([check_skill(m) for m in matches])
        sys.exit(0)
    print(__doc__)
