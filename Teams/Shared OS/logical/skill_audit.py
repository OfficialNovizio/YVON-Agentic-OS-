#!/usr/bin/env python3
"""skill_audit.py — mechanical fleet skill audit (anneal / skill-quality-audit).

Usage: python skill_audit.py <root-dir> [--forbidden <words-file>] [--stale-months N]

Checks every SKILL.md under <root-dir>:
  1. Forbidden words (venture/product names) OUTSIDE the frontmatter block — frontmatter
     legitimately holds provenance. One word per line in <words-file>; comparison is
     case-insensitive whole-word.
  2. Required frontmatter fields: name, type, status, assigned_agent, portable, date_added.
  3. type is marketplace|custom; marketplace requires a source field.
  4. date_added older than --stale-months (default 12) on files carrying dated assets is
     reported INFO (staleness candidate), not a violation — dating judgment is anneal's.
Findings are CANDIDATES for anneal's judgment, not verdicts (see SKILL.md).
Exit 0 = clean, 1 = violations, 2 = usage error.
"""
import datetime
import re
import sys
from pathlib import Path

REQUIRED = ["name", "type", "status", "assigned_agent", "portable", "date_added"]


def split_frontmatter(text):
    m = re.match(r"\A---\n(.*?)\n---\n(.*)\Z", text, re.S)
    return (m.group(1), m.group(2)) if m else (None, text)


def audit_file(path, forbidden, stale_months):
    text = path.read_text(encoding="utf-8", errors="replace")
    fm, body = split_frontmatter(text)
    violations, infos = [], []
    if fm is None:
        violations.append("no frontmatter block")
        fm = ""
    fields = dict(re.findall(r"^([a-z_]+):\s*(.*)$", fm, re.M))
    for f in REQUIRED:
        if f not in fields or not fields[f].strip():
            violations.append(f"missing frontmatter field '{f}'")
    ftype = fields.get("type", "").strip()
    if ftype and ftype not in ("marketplace", "custom"):
        violations.append(f"invalid type '{ftype}'")
    if ftype == "marketplace" and "source" not in fields:
        violations.append("marketplace skill without source URL")
    if fields.get("portable", "").strip().lower() == "false" and "reason" not in fm.lower():
        violations.append("portable: false without a stated reason")
    # forbidden words scanned in BODY only (provenance frontmatter is exempt)
    for word in forbidden:
        for m in re.finditer(rf"(?<![\w-]){re.escape(word)}(?![\w-])", body, re.I):
            line = body[: m.start()].count("\n") + 1
            violations.append(f"forbidden word '{word}' in body (approx line {line} after frontmatter)")
    d = fields.get("date_added", "").strip()
    try:
        age_days = (datetime.date.today() - datetime.date.fromisoformat(d)).days
        if age_days > stale_months * 30:
            infos.append(f"date_added {d} older than {stale_months} months — staleness review candidate")
    except ValueError:
        if d:
            violations.append(f"unparseable date_added '{d}'")
    return violations, infos


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    root = Path(args[0])
    forbidden = []
    if "--forbidden" in args:
        forbidden = [w.strip() for w in
                     Path(args[args.index("--forbidden") + 1]).read_text().splitlines()
                     if w.strip() and not w.startswith("#")]
    stale_months = int(args[args.index("--stale-months") + 1]) if "--stale-months" in args else 12
    files = sorted(root.rglob("SKILL.md"))
    if not files:
        print(f"FATAL: no SKILL.md files under {root}")
        return 2
    total_v = 0
    for f in files:
        violations, infos = audit_file(f, forbidden, stale_months)
        rel = f.relative_to(root)
        for v in violations:
            print(f"VIOLATION {rel}: {v}")
        for i in infos:
            print(f"INFO {rel}: {i}")
        total_v += len(violations)
    print(f"# audited {len(files)} skill files — {total_v} violation(s)")
    return 1 if total_v else 0


if __name__ == "__main__":
    sys.exit(main())
