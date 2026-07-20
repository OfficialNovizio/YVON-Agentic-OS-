#!/usr/bin/env python3
"""registry_lint.py — validate the fleet tool registry (Fleet Charter Rail 1).

Usage: python registry_lint.py <path-to-tool-registry.md>
Exit 0 = OK, exit 1 = violations (listed, one per line, with row numbers).

Checks every table row for: all 10 required fields present and non-empty; status is one of
active/trial/revoked; owner named; egress explicitly declared (a real domain list, NONE, or a
<FILL_IN> placeholder awaiting the operator — but never blank). <FILL_IN> is legal (rule 0.5:
placeholders over invented values) and reported as INFO, not a violation.
"""
import re
import sys

REQUIRED_COLS = ["tool", "kind", "source", "auth", "owner", "scopes",
                 "agents granted", "egress", "status", "date"]
VALID_STATUS = {"active", "trial", "revoked"}


def parse_rows(text):
    rows, cols = [], None
    for n, line in enumerate(text.splitlines(), 1):
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if cols is None and "tool" in cells[0].lower():
            cols = [c.lower() for c in cells]
            continue
        if cols and set(c.replace("-", "").strip() for c in cells) != {""}:
            if all(set(c) <= {"-", " ", ":"} for c in cells):
                continue  # separator row
            rows.append((n, dict(zip(cols, cells))))
    return rows


def lint(path):
    with open(path) as f:
        rows = parse_rows(f.read())
    if not rows:
        return ["FATAL: no registry table found"], []
    violations, infos = [], []
    for n, row in rows:
        for col in REQUIRED_COLS:
            val = row.get(col, "")
            if not val:
                violations.append(f"line {n}: missing/empty required field '{col}'")
            elif "<fill_in" in val.lower():
                infos.append(f"line {n}: '{col}' awaits operator value (placeholder OK)")
        status = row.get("status", "").lower()
        if status and status not in VALID_STATUS:
            violations.append(f"line {n}: invalid status '{status}' (need {sorted(VALID_STATUS)})")
    return violations, infos


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    violations, infos = lint(sys.argv[1])
    for i in infos:
        print("INFO:", i)
    if violations:
        for v in violations:
            print("VIOLATION:", v)
        sys.exit(1)
    print("OK: registry valid ({} informational placeholders)".format(len(infos)))
    sys.exit(0)
