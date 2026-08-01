#!/usr/bin/env python3
"""task.py — TASK-SPEC record manager (MASTER PART 6 state machine, PART 8 §8.5).

The write-gate hook needs something to read; this is it. Drives the lifecycle
    draft → discovery → approved → executing → gated → done
over YAML records in store/tasks/TS-NNN.yaml, enforcing the transition conditions
from MASTER §8.2. `validate` exits 1 on any bad record so cli/verify-deploy.sh can
call it as a blocking check. NO blocking hook yet (that is E4) — this is the foundation.

Commands (see `task.sh` wrapper):
    new "<verbatim request>"     draft record from TEMPLATE.yaml, becomes ACTIVE
    discover [id]                draft → discovery   (needs source_message + classification.lead)
    approve --by <who> [id]      discovery → approved (needs discovery.decisions; stamps approved_by/at)
    start [id]                   approved → executing (needs approved_by/at + a work_item owner)
    gate [id]                    executing → gated    (every produces path must exist on disk)
    done --proof "<artifact>" [id]  gated → done      (rejects empty / self-asserting proof)
    status [id]                  print state + next blocking condition
    validate [id]                schema + transition check; EXIT 1 on failure

No values are invented; missing guards block the transition and say what to fill.
Env: TASKS_DIR overrides store/tasks (for testing).
"""
from __future__ import annotations
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TASKS = Path(os.environ.get("TASKS_DIR", ROOT / "store" / "tasks"))
ACTIVE = lambda: TASKS / ".active"
STATES = ["draft", "discovery", "approved", "executing", "gated", "done"]
SELF_ASSERT = {"", "done", "complete", "agent says done", "says done", "it works", "looks good"}


# ── tiny targeted YAML access (no pyyaml) ───────────────────────────────────
def top(text: str, key: str) -> str:
    m = re.search(rf"^{re.escape(key)}:[ \t]*(.*)$", text, re.M)
    if not m:
        return ""
    v = re.sub(r"\s+#.*$", "", m.group(1)).strip()
    return v.strip('"').strip("'")


def block(text: str, key: str) -> str:
    """Indented body under a top-level `key:` up to the next unindented line."""
    m = re.search(rf"^{re.escape(key)}:[ \t]*$", text, re.M)
    if not m:
        return ""
    start = m.end()
    nxt = re.search(r"^\S", text[start:], re.M)
    return text[start: start + nxt.start() if nxt else len(text)]


def indented(text: str, key: str) -> str:
    m = re.search(rf"^\s+{re.escape(key)}:[ \t]*(.*)$", text, re.M)
    return re.sub(r"\s+#.*$", "", m.group(1)).strip().strip('"').strip("'") if m else ""


def list_items(blk: str) -> list[str]:
    return re.findall(r"^\s*-\s+(.*\S)\s*$", blk, re.M)


def set_status(text: str, new: str) -> str:
    return re.sub(r"^status:[ \t]*\w+", f"status: {new}", text, count=1, flags=re.M)


# ── record helpers ──────────────────────────────────────────────────────────
def path_for(tid: str) -> Path:
    return TASKS / f"{tid}.yaml"


def active_id() -> str:
    p = ACTIVE()
    return p.read_text().strip() if p.exists() else ""


def resolve(argv_id: str | None) -> str:
    tid = argv_id or active_id()
    if not tid:
        die("no task id and no ACTIVE task. Run: task.sh new \"<request>\"")
    if not path_for(tid).exists():
        die(f"no such task: {tid}")
    return tid


def die(msg: str, code: int = 1):
    print(f"❌ {msg}", file=sys.stderr)
    raise SystemExit(code)


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def require(cond: bool, why: str):
    if not cond:
        die(f"blocked: {why}")


# ── commands ────────────────────────────────────────────────────────────────
def cmd_new(args: list[str]):
    msg = args[0] if args else ""
    require(bool(msg.strip()), "new needs a verbatim request: task.sh new \"<request>\"")
    nums = [int(m.group(1)) for p in TASKS.glob("TS-*.yaml")
            for m in [re.match(r"TS-(\d+)", p.stem)] if m]
    tid = f"TS-{(max(nums) + 1 if nums else 1):03d}"
    tmpl = (TASKS / "TEMPLATE.yaml").read_text()
    rec = re.sub(r"^id:.*$", f"id: {tid}", tmpl, count=1, flags=re.M)
    rec = set_status(rec, "draft")
    safe = msg.replace('"', "'")
    rec = re.sub(r'^source_message:.*$', f'source_message: "{safe}"', rec, count=1, flags=re.M)
    path_for(tid).write_text(rec)
    ACTIVE().write_text(tid)
    print(f"✓ created {tid} (draft, ACTIVE). Next: fill classification.lead, then task.sh discover")


def cmd_discover(args, tid):
    text = path_for(tid).read_text()
    require(top(text, "status") == "draft", f"{tid} is not in draft")
    require(bool(top(text, "source_message")), "source_message is empty")
    require(bool(indented(text, "lead")), "classification.lead is empty — meta must classify first")
    path_for(tid).write_text(set_status(text, "discovery"))
    print(f"✓ {tid} → discovery. Fill discovery.questions/decisions, then task.sh approve --by <who>")


def cmd_approve(args, tid):
    who = _opt(args, "--by") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") == "discovery", f"{tid} is not in discovery")
    require(bool(list_items(block(text, "discovery"))) or "decisions:" in text and
            bool(list_items(block_after(text, "decisions"))), "discovery.decisions is empty")
    text = set_status(text, "approved")
    if not top(text, "approved_by"):
        text += f"\napproved_by: {who}\napproved_at: {now_iso()}\n"
    path_for(tid).write_text(text)
    print(f"✓ {tid} → approved by {who}")


def cmd_start(args, tid):
    text = path_for(tid).read_text()
    require(top(text, "status") == "approved", f"{tid} is not approved")
    require(bool(top(text, "approved_by")) and bool(top(text, "approved_at")), "missing approved_by/approved_at")
    owners = [o for o in re.findall(r"^\s+owner:[ \t]*(.*\S)?\s*$", block(text, "work_items"), re.M) if o]
    require(len(owners) >= 1, "no work_item has an owner")
    path_for(tid).write_text(set_status(text, "executing"))
    print(f"✓ {tid} → executing ({len(owners)} work item(s) with owners)")


def cmd_gate(args, tid):
    text = path_for(tid).read_text()
    require(top(text, "status") == "executing", f"{tid} is not executing")
    produces = [p for p in re.findall(r"^\s+produces:[ \t]*(.*\S)?\s*$", block(text, "work_items"), re.M) if p]
    missing = [p for p in produces if "/" in p and not (ROOT / p.strip('"')).exists()]
    require(not missing, f"produces paths not on disk: {', '.join(missing)}")
    path_for(tid).write_text(set_status(text, "gated"))
    print(f"✓ {tid} → gated (all produces paths exist)")


def cmd_done(args, tid):
    proof = _opt(args, "--proof") or ""
    text = path_for(tid).read_text()
    require(top(text, "status") == "gated", f"{tid} is not gated")
    eg = block(text, "exit_gate")
    require(bool(indented("exit_gate:\n" + eg, "owner")), "exit_gate.owner is empty")
    require(proof.strip().lower() not in SELF_ASSERT, "proof is empty or self-asserting — cite a real artifact")
    if re.search(r"^\s+proof:", eg, re.M):
        text = re.sub(r"^(\s+proof:)[ \t]*.*$",
                      rf'\1 "{proof.replace(chr(34), chr(39))}"', text, count=1, flags=re.M)
    path_for(tid).write_text(set_status(text, "done"))
    print(f"✓ {tid} → done (proof: {proof})")


def cmd_status(args, tid):
    text = path_for(tid).read_text()
    st = top(text, "status")
    print(f"ACTIVE: {tid}   status: {st}   lead: {indented(text, 'lead') or '—'}")
    owners = [o for o in re.findall(r"^\s+owner:[ \t]*(.*\S)?\s*$", block(text, 'work_items'), re.M) if o]
    print(f"  work items with owners: {len(owners)}  {owners}")
    print(f"  next: {_next_blocking(text, st)}")


def cmd_validate(args):
    only = args[0] if args and not args[0].startswith("-") else None
    recs = [path_for(only)] if only else sorted(TASKS.glob("TS-*.yaml"))
    fails = []
    for p in recs:
        t = p.read_text()
        tid, st = top(t, "id"), top(t, "status")
        if tid != p.stem:
            fails.append(f"{p.name}: id '{tid}' != filename")
        if st not in STATES:
            fails.append(f"{p.name}: invalid status '{st}'")
        if not top(t, "source_message"):
            fails.append(f"{p.name}: empty source_message")
        i = STATES.index(st) if st in STATES else -1
        if i >= STATES.index("approved") and not top(t, "approved_by"):
            fails.append(f"{p.name}: {st} but no approved_by")
        if i >= STATES.index("gated"):
            proof = indented("exit_gate:\n" + block(t, "exit_gate"), "proof")
            if not proof or proof.lower() in SELF_ASSERT:
                fails.append(f"{p.name}: {st} but exit_gate.proof empty/self-asserting")
    if fails:
        print("❌ task validate FAIL:")
        for f in fails:
            print(f"   - {f}")
        raise SystemExit(1)
    print(f"✓ task validate PASS ({len(recs)} record(s))")


# ── small utils ─────────────────────────────────────────────────────────────
def block_after(text, key):
    m = re.search(rf"^\s*{key}:[ \t]*$", text, re.M)
    if not m:
        return ""
    start = m.end()
    nxt = re.search(r"^\S", text[start:], re.M)
    return text[start: start + nxt.start() if nxt else len(text)]


def _opt(args, flag):
    if flag in args:
        i = args.index(flag)
        return args[i + 1] if i + 1 < len(args) else ""
    return ""


def _next_blocking(text, st):
    n = {"draft": "fill classification.lead → task.sh discover",
         "discovery": "fill discovery.decisions → task.sh approve --by <who>",
         "approved": "ensure a work_item owner → task.sh start",
         "executing": "create every produces path → task.sh gate",
         "gated": "task.sh done --proof \"<artifact>\"",
         "done": "complete"}
    return n.get(st, "?")


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd, rest = argv[0], argv[1:]
    if cmd == "new":
        return cmd_new(rest)
    if cmd == "validate":
        return cmd_validate(rest)
    # commands that operate on a task id (positional id optional → ACTIVE)
    pos = [a for a in rest if not a.startswith("-")]
    idarg = None
    if cmd in ("discover", "approve", "start", "gate", "done", "status"):
        # id is the last bare positional that looks like TS-xxx
        cand = [a for a in pos if re.match(r"TS-\d+", a)]
        idarg = cand[0] if cand else None
    dispatch = {"discover": cmd_discover, "approve": cmd_approve, "start": cmd_start,
                "gate": cmd_gate, "done": cmd_done, "status": cmd_status}
    if cmd in dispatch:
        return dispatch[cmd](rest, resolve(idarg))
    die(f"unknown command: {cmd}")


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]) or 0)
