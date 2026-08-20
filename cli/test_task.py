#!/usr/bin/env python3
"""test_task.py — scratch-dir regression test for cli/task.py's state machine,
including the PRD/RICE gate added by docs/PRD-prd-gated-task-conversion.md.

Runs entirely against a throwaway TASKS_DIR (never touches store/tasks/ for
real records) via task.py's own documented TASKS_DIR env override. Plain
asserts + prints, no pytest dependency (matches this repo's other cli/*.py
scripts — none of them assume pytest is installed). Exit 0 on pass, 1 on any
failure, same convention as task.py validate.

Usage: python3 cli/test_task.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TASK_PY = ROOT / "cli" / "task.py"
TEMPLATE = ROOT / "store" / "tasks" / "TEMPLATE.yaml"

PASS, FAIL = [], []


def run(scratch: Path, *args: str) -> subprocess.CompletedProcess:
    env = dict(os.environ, TASKS_DIR=str(scratch))
    return subprocess.run(
        [sys.executable, str(TASK_PY), *args],
        cwd=str(ROOT), env=env, capture_output=True, text=True,
    )


def check(name: str, cond: bool, detail: str = ""):
    if cond:
        PASS.append(name)
    else:
        FAIL.append(f"{name}  {detail}")


def main() -> int:
    scratch = Path(tempfile.mkdtemp(prefix="task-py-test-"))
    (scratch / "TEMPLATE.yaml").write_text(TEMPLATE.read_text())
    try:
        # ── 1. new -> draft ──────────────────────────────────────────────
        r = run(scratch, "new", "test: build the thing")
        check("new creates a draft record", r.returncode == 0, r.stderr)
        m = re.search(r"TS-\d+", r.stdout)
        check("new prints a TS id", bool(m), r.stdout)
        tid = m.group(0) if m else "TS-001"
        rec = scratch / f"{tid}.yaml"
        check("record file exists", rec.exists())
        check("prd_ref present + empty on a fresh record", 'prd_ref: ""' in rec.read_text())
        check("rice_score present + empty on a fresh record", 'rice_score: ""' in rec.read_text())

        # ── 2. discover blocked without classification.lead ─────────────
        r = run(scratch, "discover", tid)
        check("discover blocks with no classification.lead", r.returncode != 0)

        # fill lead by hand (discover's own job is just the transition)
        text = rec.read_text()
        text = re.sub(r'(classification:\n[ \t]*task_type:[ \t]*"[^"]*"\n[ \t]*departments:[ \t]*\[\]\n[ \t]*lead:)[ \t]*""',
                      r'\1 "dev"', text, count=1)
        rec.write_text(text)
        r = run(scratch, "discover", tid)
        check("discover succeeds once lead is set", r.returncode == 0, r.stderr)

        # ── 3. approve blocked: no decisions, no PRD ─────────────────────
        r = run(scratch, "approve", tid, "--by", "tester")
        check("approve blocks with empty discovery.decisions", r.returncode != 0)
        check("approve error mentions decisions", "decisions" in (r.stderr + r.stdout).lower(), r.stderr)

        text = rec.read_text()
        text = text.replace(
            "discovery:               # BLOCKING — no fan-out until resolved\n  questions: []\n  decisions: []",
            "discovery:               # BLOCKING — no fan-out until resolved\n  questions: []\n  decisions:\n    - \"test decision\"",
        )
        rec.write_text(text)

        r = run(scratch, "approve", tid, "--by", "tester")
        check("approve blocks with empty prd_ref even once decisions are filled",
              r.returncode != 0 and "prd" in (r.stderr + r.stdout).lower(), r.stderr + r.stdout)

        # ── 4. set-prd requires a real file on disk ──────────────────────
        r = run(scratch, "set-prd", tid, "--ref", "store/tasks/does-not-exist.md", "--rice", "12.0")
        check("set-prd rejects a PRD path that doesn't exist", r.returncode != 0)

        # set-prd's --ref is checked as (ROOT / ref).exists() — pathlib's `/`
        # discards ROOT when the right side is already absolute, so an
        # absolute scratch-dir path resolves correctly without needing to
        # write anything under the real repo (device_bash mounts can't
        # unlink files, so a real-repo throwaway would leak — this avoids
        # that entirely, and behaves identically in-repo since the check is
        # just "does this path exist").
        prd_path = scratch / f"{tid}-prd.md"
        prd_path.write_text("# PRD — test\n\n## 1. Problem\ntest\n")

        r = run(scratch, "set-prd", tid, "--ref", str(prd_path), "--rice", "75.0", "--actor", "spec")
        check("set-prd succeeds with a real file + score", r.returncode == 0, r.stderr)
        check("prd_ref written into the record", f'prd_ref: "{prd_path}"' in rec.read_text(), rec.read_text())
        check("rice_score written into the record", 'rice_score: "75.0"' in rec.read_text())
        check("set-prd appends a prd_attached history entry", "prd_attached" in rec.read_text())

        # ── 5. approve now succeeds ───────────────────────────────────────
        r = run(scratch, "approve", tid, "--by", "tester")
        check("approve succeeds once decisions + prd_ref + rice_score are all set", r.returncode == 0, r.stderr)

        # ── 6. PRD is frozen after approval ───────────────────────────────
        r = run(scratch, "set-prd", tid, "--ref", str(prd_path), "--rice", "80.0")
        check("set-prd refuses to rewrite an approved record's PRD", r.returncode != 0)

        # ── 7. validate passes on this fully-gated record ─────────────────
        r = run(scratch, "validate", tid)
        check("validate PASSes a record with prd_ref + rice_score satisfied", r.returncode == 0, r.stderr)

        # ── 8. backward compatibility: old record with NO prd_ref key ────
        old_rec = scratch / "TS-OLD.yaml"
        old_text = TEMPLATE.read_text()
        old_text = re.sub(r"^id:.*$", "id: TS-OLD", old_text, count=1, flags=__import__("re").M)
        old_text = re.sub(r"^status:.*$", "status: done", old_text, count=1, flags=__import__("re").M)
        old_text = re.sub(r'^source_message:.*$', 'source_message: "pre-existing record, no PRD gate"', old_text, count=1, flags=__import__("re").M)
        old_text = old_text.replace('lead: ""', 'lead: "dev"')
        # strip the prd_ref/rice_score lines entirely to simulate a genuinely
        # old record (TS-001..TS-033 style) that predates this schema change.
        # Also strip the TEMPLATE's commented-out gate_0 boilerplate: a literal
        # "gate_0: true" substring inside that comment would otherwise trip
        # validate's (pre-existing, unrelated to this patch) plain `in` check
        # for real gate_0 records — no live record hits this today (checked
        # against the repo directly), but this synthetic fixture would.
        old_text = "\n".join(
            ln for ln in old_text.splitlines()
            if not ln.strip().startswith("prd_ref:")
            and not ln.strip().startswith("rice_score:")
            and "# gate_0" not in ln
        ) + "\n"
        old_text += 'approved_by: operator\napproved_at: "2026-01-01T00:00:00+00:00"\n'
        old_text = old_text.replace(
            'exit_gate:\n  owner: ""\n  proof: ""',
            'exit_gate:\n  owner: "dev"\n  proof: "manually verified, real artifact"',
        )
        old_rec.write_text(old_text)
        r = run(scratch, "validate", "TS-OLD")
        check("validate does NOT retroactively fail a pre-existing record with no prd_ref key",
              r.returncode == 0, r.stdout + r.stderr)

        # ── 9. list surfaces the new fields ───────────────────────────────
        r = run(scratch, "list")
        check("list runs clean", r.returncode == 0, r.stderr)
        try:
            rows = json.loads(r.stdout)
            by_id = {row["id"]: row for row in rows}
            check("list includes prdRef for the gated record", by_id.get(tid, {}).get("prdRef", "").endswith(f"{tid}-prd.md"), str(by_id.get(tid)))
            check("list includes riceScore for the gated record", by_id.get(tid, {}).get("riceScore") == "75.0", str(by_id.get(tid)))
            check("list includes empty prdRef for the old record (never invented)", by_id.get("TS-OLD", {}).get("prdRef", "") == "")
        except Exception as e:
            check("list output is valid JSON", False, str(e))

        # ── 10. fill-discovery — the chat-conversion one-shot path ────────
        r2 = run(scratch, "new", "test: fill-discovery path")
        m2 = re.search(r"TS-\d+", r2.stdout)
        tid2 = m2.group(0)
        rec2 = scratch / f"{tid2}.yaml"

        r = run(scratch, "fill-discovery", tid2, "--lead", "mia",
                "--decisions", json.dumps(["Working agent: mia", "Scope: v1 list+detail"]),
                "--objective", "Ship the v1 list+detail screen")
        check("fill-discovery succeeds on a fresh draft record", r.returncode == 0, r.stderr)
        check("fill-discovery sets classification.lead", 'lead: "mia"' in rec2.read_text())
        check("fill-discovery writes both decisions", rec2.read_text().count('  - "') >= 2 and
              "Working agent: mia" in rec2.read_text() and "Scope: v1 list+detail" in rec2.read_text())
        check("fill-discovery sets work_items[0].owner from --lead", 'owner: "mia"' in rec2.read_text())
        check("fill-discovery sets work_items[0].objective", "Ship the v1 list+detail screen" in rec2.read_text())

        r = run(scratch, "discover", tid2)
        check("discover succeeds after fill-discovery set lead", r.returncode == 0, r.stderr)

        r = run(scratch, "fill-discovery", tid2, "--lead", "mia", "--decisions", '["x"]')
        check("fill-discovery refuses to run twice (decisions no longer pristine)", r.returncode != 0)

        prd2 = scratch / f"{tid2}-prd.md"
        prd2.write_text("# PRD — test 2\n")
        r = run(scratch, "set-prd", tid2, "--ref", str(prd2), "--rice", "42.0", "--actor", "spec")
        check("set-prd succeeds on the fill-discovery record", r.returncode == 0, r.stderr)
        r = run(scratch, "approve", tid2, "--by", "operator")
        check("approve succeeds (decisions from fill-discovery + prd_ref + rice_score)", r.returncode == 0, r.stderr)
        r = run(scratch, "start", tid2)
        check("start reaches executing — the full chat-to-task chain works end to end",
              r.returncode == 0 and "executing" in (r.stdout + rec2.read_text()), r.stderr)

        # ── set-design-origin (docs/PRD-design-first-workflow.md) ──────────
        r = run(scratch, "new", "test: design-sourced task")
        m = re.search(r"TS-\d+", r.stdout)
        tid3 = m.group(0)
        rec3 = scratch / f"{tid3}.yaml"
        check("fresh record has empty design_origin fields", 'design_session_id: ""' in rec3.read_text() and 'design_tool: ""' in rec3.read_text())

        r = run(scratch, "set-design-origin", tid3, "--tool", "screenshot-to-code")
        check("set-design-origin requires --session", r.returncode != 0)
        r = run(scratch, "set-design-origin", tid3, "--session", "abc-123")
        check("set-design-origin requires --tool", r.returncode != 0)
        r = run(scratch, "set-design-origin", tid3, "--session", "abc-123", "--tool", "not-a-real-tool")
        check("set-design-origin rejects an unrecognized --tool", r.returncode != 0)

        r = run(scratch, "set-design-origin", tid3, "--session", "abc-123", "--tool", "screenshot-to-code",
                "--handoff", "store/design-sessions/abc-123-handoff.md")
        check("set-design-origin succeeds with session+tool+handoff", r.returncode == 0, r.stderr)
        text3 = rec3.read_text()
        check("set-design-origin writes design_session_id", 'design_session_id: "abc-123"' in text3)
        check("set-design-origin writes design_tool", 'design_tool: "screenshot-to-code"' in text3)
        check("set-design-origin writes design_handoff_path", 'design_handoff_path: "store/design-sessions/abc-123-handoff.md"' in text3)
        check("set-design-origin leaves design_artifact_id empty when not passed", 'design_artifact_id: ""' in text3)

        r = run(scratch, "set-design-origin", tid2, "--session", "xyz-789", "--tool", "open-design",
                "--artifact", "artifact-42")
        check("set-design-origin works on tid2 (already executing) — not a lifecycle gate", r.returncode == 0, r.stderr)
        check("set-design-origin writes design_artifact_id", 'design_artifact_id: "artifact-42"' in rec2.read_text())

        r = run(scratch, "list")
        listed = json.loads(r.stdout)
        entry3 = next(t for t in listed if t["id"] == tid3)
        check("list exposes designSessionId", entry3["designSessionId"] == "abc-123", entry3)
        check("list exposes designTool", entry3["designTool"] == "screenshot-to-code", entry3)
        check("list exposes designHandoffPath", entry3["designHandoffPath"] == "store/design-sessions/abc-123-handoff.md", entry3)
        entry_fresh = next(t for t in listed if t["id"] == tid)
        check("list exposes empty designTool for a non-design task, not a guess", entry_fresh["designTool"] == "", entry_fresh)

    finally:
        shutil.rmtree(scratch, ignore_errors=True)

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed\n")
    for f in FAIL:
        print(f"  ❌ {f}")
    if FAIL:
        return 1
    print("✓ all checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
