#!/usr/bin/env python3
"""task.py — TASK-SPEC record manager (MASTER PART 6 state machine, PART 8 §8.5).

The write-gate hook needs something to read; this is it. Drives the lifecycle
    draft → discovery → approved → executing → gated → review → done
over YAML records in store/tasks/TS-NNN.yaml, enforcing the transition conditions
from MASTER §8.2. `validate` exits 1 on any bad record so cli/verify-deploy.sh can
call it as a blocking check. NO blocking hook yet (that is E4) — this is the foundation.

v3 (2026-08-24, "One Request, End to End" artifact): adds the `review` state
(gated → review → done, opened by `review`, decided by `suite`), the `blocked`
SIDECAR (block/unblock — a task can be blocked AND executing, which one status
field cannot express), per-criterion acceptance statuses + evidence
(set-acceptance), doer/verifier/integrator roles (set-roles), the six-field
handoff packet (set-handoff), `derived_from` (distinct from `revision_of`:
revision = same goal, superseded attempt; derived = different goal, made
possible by the first), `superseded_by` auto-marked on `new --revision-of`,
`updated_at` stamped on every transition, and `done --run-ref` — the run
record that replaces prose exit proofs (see the self-assertion checks below).

Commands (see `task.sh` wrapper):
    new "<verbatim request>" [--actor <who>] [--revision-of <TS-id>] [--derived-from <TS-id>]
                                  draft record from TEMPLATE.yaml, becomes ACTIVE;
                                  --revision-of also marks the parent superseded
    discover [id] [--actor <who>] draft → discovery   (needs source_message + classification.lead)
    approve --by <who> [id]      discovery → approved (needs discovery.decisions; stamps approved_by/at)
    start [id] [--actor <who>]   approved → executing (needs approved_by/at + a work_item owner)
    gate [id] [--actor <who>]    executing → gated    (every produces path must exist on disk)
    review [id] --runner <who>   gated → review       (event review_opened — the suite's turn)
    suite [id] --result pass|fail --run "<path>" [--detail "..."] [--actor <who>]
                                  review: pass → done (event suite_passed, exit proof = run record);
                                  fail → stays review (event suite_failed). --run path must exist
                                  on disk — the run record, not prose, is the proof.
    done --proof "<artifact>" [--run-ref "<path>"] [id] [--actor <who>]
                                  gated → done (rejects empty / self-asserting proof; --run-ref
                                  sets proof to the run record path, which cannot self-assert)
    block [id] --reason "<why>" [--actor <who>]
                                  SIDECAR: sets blocked: true + blocked_at + reason. Status
                                  unchanged — a task can be blocked and executing. Any state
                                  except done. Event: blocked.
    unblock [id] [--actor <who>]  clears the sidecar. Event: unblocked.
    supersede [id] --by <TS-id>   marks superseded_by (rotation: the failed attempt's close).
                                  Auto-invoked by `new --revision-of`.
    set-acceptance [id] --wi <WI-id> --i <n> --status <pass|fail|not_run|pending|deferred>
                                  [--evidence "<run detail>"] [--actor <who>]
                                  sets one criterion's status + evidence. Object-form items
                                  preferred; flat-string items are converted on first touch.
    set-roles [id] --wi <WI-id> [--doer <who>] [--verifier <who>] [--integrator <who>]
                                  [--actor <who>] — defaults to the item's owner when absent.
    set-handoff [id] --entry "…" --contract "…" --stubbed "…" --needs-wiring "…"
                                  --tokens "…" --verified-on "…" [--actor <who>]
                                  writes the six-field packet + event handoff_emitted.
    note <id> --event <name> [--actor <who>] [--note "<text>"]
                                  append a history entry WITHOUT a state transition — used by the
                                  Make Changes / Retry / Redo lifecycle actions (task-detail-lifecycle
                                  PRD §3.3) and by criterion_deferred: --event criterion_deferred
    set-prd <id> --ref "<path>" --rice "<score>" [--actor <who>]
                                  attach spec's generated PRD + RICE score to a draft/discovery
                                  record (docs/PRD-prd-gated-task-conversion.md). REQUIRED before
                                  `approve` will let the record leave discovery — see that gate below.
    set-design-origin <id> --session "<sid>" --tool screenshot-to-code|open-design|custom
                                  [--artifact "<artifact_id>"] [--handoff "<path>"] [--actor <who>]
                                  link a task back to the cli/design.py session that produced it
                                  (docs/PRD-design-first-workflow.md). Optional, any status — powers
                                  the dashboard's unified design-preview panel. Never hand-typed.
    fill-discovery <id> --lead "<agent>" --decisions '["...", "..."]' [--objective "<text>"] [--actor <who>]
                                  one-shot transcription of the PRD's own decisions into
                                  classification.lead + discovery.decisions — the PRD chat flow's
                                  chat-to-task conversion writes this, not a second Q&A round.
                                  --objective also sets work_items[0].owner=<lead> + its objective,
                                  since `start` requires an owner and no manual edit happens for a
                                  chat-converted task. Only works while discovery.decisions is
                                  still pristine ([]).
    status [id]                  print state + next blocking condition
    validate [id]                schema + transition check; EXIT 1 on failure
    list                         JSON dump of every real record (dashboard Tasks panel reads this)

History (added 2026-08-18, docs/PRD-task-detail-lifecycle-actions.md §3.1): every command above
that changes a record's status, plus `note`, appends one entry to that record's `history:` list —
{ts, actor, event, note}. Old records without a `history:` key are still valid; `list`/`validate`
treat a missing history as empty, never invented.

No values are invented; missing guards block the transition and say what to fill.
Env: TASKS_DIR overrides store/tasks (for testing).
"""
from __future__ import annotations
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TASKS = Path(os.environ.get("TASKS_DIR", ROOT / "store" / "tasks"))
ACTIVE = lambda: TASKS / ".active"
STATES = ["draft", "discovery", "approved", "executing", "gated", "review", "done"]
ACCEPT_STATUSES = {"pending", "pass", "fail", "not_run", "deferred"}
HANDOFF_FIELDS = ["entry", "contract", "stubbed", "needs_wiring", "tokens", "verified_on"]
# Legacy prose-proof blocklist — exact matches, plus phrase patterns (2026-08-24:
# the old exact-match set let `proof: "I verified it works"` — MASTER §8.2's named
# anti-pattern — pass right through; the phrase check closes that hole. The real
# fix is `done --run-ref`: a run record path cannot self-assert at all).
SELF_ASSERT = {"", "done", "complete", "it works", "looks good", "verified", "working"}
SELF_ASSERT_RE = re.compile(
    r"\bi verified\b|\bi verified it works\b|\bit works\b|\bagent says done\b|\bsays done\b|"
    r"\blooks good\b|\bself-assert\b|\btrust me\b|\bjust ship it\b"
)


def is_self_assert(proof: str) -> bool:
    p = proof.strip().lower()
    if p in SELF_ASSERT:
        return True
    if len(p) <= 4 and not re.match(r"^[a-z0-9/._-]+$", p):
        return True
    return bool(SELF_ASSERT_RE.search(p))


# ── tiny targeted YAML access (no pyyaml) ───────────────────────────────────
def top(text: str, key: str) -> str:
    m = re.search(rf"^{re.escape(key)}:[ \t]*(.*)$", text, re.M)
    if not m:
        return ""
    v = re.sub(r"\s+#.*$", "", m.group(1)).strip()
    return v.strip('"').strip("'")


def block(text: str, key: str) -> str:
    """Indented body under a top-level `key:` up to the next unindented line."""
    m = re.search(rf"^{re.escape(key)}:[ \t]*(?:#.*)?$", text, re.M)
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
    out = re.sub(r"^status:[ \t]*\w+", f"status: {new}", text, count=1, flags=re.M)
    return _stamp(out)


def _stamp(text: str) -> str:
    """Upsert updated_at: <now> — every transition and every activity note."""
    ts = now_iso()
    if re.search(r"^updated_at:.*$", text, re.M):
        return re.sub(r"^updated_at:.*$", f'updated_at: "{ts}"', text, count=1, flags=re.M)
    if not text.endswith("\n"):
        text += "\n"
    return text + f'updated_at: "{ts}"\n'


def _clean(v: str) -> str:
    v = re.sub(r"\s+#.*$", "", v or "").strip()
    return v.strip('"').strip("'")


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


# ── history (docs/PRD-task-detail-lifecycle-actions.md §3.1) ───────────────
def _append_history(path: Path, actor: str, event: str, note: str = ""):
    """Append one {ts, actor, event, note} entry to a record's `history:` list.
    Handles three cases: `history: []` (template default) → converts to a block;
    an existing `history:` block → appends after its last entry; no `history:`
    key at all (very old record, pre-2026-08-18) → adds the block at EOF.
    Never rewrites or drops an existing entry — append-only, like feedback.jsonl."""
    text = path.read_text()
    ts = now_iso()
    actor_safe = (actor or "operator").replace('"', "'").strip() or "operator"
    event_safe = (event or "").replace('"', "'").strip()
    note_safe = (note or "").replace('"', "'").strip()
    entry = f'  - {{ts: "{ts}", actor: "{actor_safe}", event: "{event_safe}", note: "{note_safe}"}}\n'

    if re.search(r"^history:[ \t]*\[\][ \t]*(?:#.*)?$", text, re.M):
        text = re.sub(r"^history:[ \t]*\[\][ \t]*(?:#.*)?$", "history:\n" + entry.rstrip("\n"), text, count=1, flags=re.M)
    elif re.search(r"^history:[ \t]*$", text, re.M):
        m = re.search(r"^history:[ \t]*$", text, re.M)
        start = m.end()
        nxt = re.search(r"^\S", text[start:], re.M)
        insert_at = start + (nxt.start() if nxt else len(text) - start)
        text = text[:insert_at] + entry + text[insert_at:]
    else:
        if not text.endswith("\n"):
            text += "\n"
        text += "history:\n" + entry
    path.write_text(_stamp(text))


def _parse_history(text: str) -> list[dict]:
    if not re.search(r"^history:", text, re.M) or re.search(r"^history:[ \t]*\[\][ \t]*(?:#.*)?$", text, re.M):
        return []
    blk = block(text, "history")
    out = []
    for line in list_items(blk):
        def g(key):
            m = re.search(rf'{key}:\s*"([^"]*)"', line)
            return m.group(1) if m else ""
        out.append({"ts": g("ts"), "actor": g("actor"), "event": g("event"), "note": g("note")})
    return out


# ── work-item chunk access (v3) ─────────────────────────────────────────────
def _wi_chunks(text: str) -> list[tuple[str, int, int]]:
    """Split the work_items block into per-item chunks.
    Returns [(chunk_text, abs_start, abs_end)] where the offsets are into `text`."""
    blk = block(text, "work_items")
    if not blk.strip():
        return []
    base = text.index(blk)
    marks = [m.start() for m in re.finditer(r"^\s*-\s+id:", blk, re.M)]
    out = []
    for i, m in enumerate(marks):
        end = marks[i + 1] if i + 1 < len(marks) else len(blk)
        out.append((blk[m:end], base + m, base + end))
    return out


def _parse_acceptance(blk: str) -> list[dict]:
    """Acceptance items: flat strings (legacy) or object form
    `- text: "…"` / `status: pass` / `evidence: "…"` (v3)."""
    items = []
    if not blk.strip():
        return items
    segs = re.split(r"^\s*-\s+", blk, flags=re.M)[1:]
    for seg in segs:
        seg = seg.rstrip()
        flat = re.match(r'"(.*)"\s*$', seg, re.S)
        if flat:
            items.append({"text": flat.group(1).strip(), "status": "pending", "evidence": ""})
            continue
        t = re.search(r'text:\s*"((?:[^"\\]|\\.)*)"', seg)
        s = re.search(r"status:\s*(\w+)", seg)
        e = re.search(r'evidence:\s*"((?:[^"\\]|\\.)*)"', seg)
        items.append({
            "text": t.group(1) if t else "",
            "status": s.group(1) if s else "pending",
            "evidence": e.group(1) if e else "",
        })
    return items


def _handoff_block(text: str) -> str:
    """The handoff packet's body — or '' when absent OR still the TEMPLATE's
    `handoff: {}` placeholder (an empty packet is no packet)."""
    hb = block(text, "handoff")
    if not hb or hb.strip() == "{}":
        return ""
    return hb


def _serialize_acceptance(items: list[dict], indent: str = "      ") -> str:
    lines = []
    for it in items:
        lines.append(f'{indent}- text: "{it["text"].replace(chr(34), chr(39))}"')
        lines.append(f'{indent}  status: {it["status"]}')
        lines.append(f'{indent}  evidence: "{it["evidence"].replace(chr(34), chr(39))}"')
    return "\n".join(lines)


# ── commands ────────────────────────────────────────────────────────────────
def cmd_new(args: list[str]):
    pos = [a for a in args if not a.startswith("-")]
    msg = pos[0] if pos else ""
    require(bool(msg.strip()), "new needs a verbatim request: task.sh new \"<request>\"")
    actor = _opt(args, "--actor") or "operator"
    revision_of = _opt(args, "--revision-of") or ""
    derived_from = _opt(args, "--derived-from") or ""
    if revision_of:
        require(path_for(revision_of).exists(), f"--revision-of {revision_of}: no such task")
    if derived_from:
        require(path_for(derived_from).exists(), f"--derived-from {derived_from}: no such task")
    nums = [int(m.group(1)) for p in TASKS.glob("TS-*.yaml")
            for m in [re.match(r"TS-(\d+)", p.stem)] if m]
    tid = f"TS-{(max(nums) + 1 if nums else 1):03d}"
    tmpl = (TASKS / "TEMPLATE.yaml").read_text()
    rec = re.sub(r"^id:.*$", f"id: {tid}", tmpl, count=1, flags=re.M)
    rec = set_status(rec, "draft")
    safe = msg.replace('"', "'")
    rec = re.sub(r'^source_message:.*$', f'source_message: "{safe}"', rec, count=1, flags=re.M)
    if re.search(r'^created_at:.*$', rec, re.M):
        rec = re.sub(r'^created_at:.*$', f'created_at: "{now_iso()}"', rec, count=1, flags=re.M)
    if revision_of and re.search(r'^revision_of:.*$', rec, re.M):
        rec = re.sub(r'^revision_of:.*$', f'revision_of: {revision_of}', rec, count=1, flags=re.M)
    if derived_from and re.search(r'^derived_from:.*$', rec, re.M):
        rec = re.sub(r'^derived_from:.*$', f'derived_from: {derived_from}', rec, count=1, flags=re.M)
    path_for(tid).write_text(rec)
    ACTIVE().write_text(tid)
    _append_history(path_for(tid), actor, "opened_draft",
                    f"revision of {revision_of}" if revision_of else "")
    if revision_of:
        # Rotation: the parent attempt is superseded by its revision. Forward-only —
        # the history never has to lie about what happened (artifact beat 13).
        parent = path_for(revision_of).read_text()
        if top(parent, "superseded_by") in ("", "null"):
            parent = re.sub(r"^superseded_by:.*$", f"superseded_by: {tid}", parent, count=1, flags=re.M) \
                if re.search(r"^superseded_by:", parent, re.M) else parent + f"\nsuperseded_by: {tid}\n"
            path_for(revision_of).write_text(_stamp(parent))
        _append_history(path_for(revision_of), "system", "superseded", f"superseded by {tid}")
        if revision_of != tid:
            _append_history(path_for(tid), "system", "revision_opened", f"forked from {revision_of}")
    print(f"✓ created {tid} (draft, ACTIVE). Next: fill classification.lead, then task.sh discover")


def cmd_discover(args, tid):
    actor = _opt(args, "--actor") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") == "draft", f"{tid} is not in draft")
    require(bool(top(text, "source_message")), "source_message is empty")
    require(bool(indented(text, "lead")), "classification.lead is empty — meta must classify first")
    path_for(tid).write_text(set_status(text, "discovery"))
    _append_history(path_for(tid), actor, "discovery_opened", "")
    print(f"✓ {tid} → discovery. Fill discovery.questions/decisions, then task.sh approve --by <who>")


def cmd_approve(args, tid):
    who = _opt(args, "--by") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") == "discovery", f"{tid} is not in discovery")
    require(bool(list_items(block(text, "discovery"))) or "decisions:" in text and
            bool(list_items(block_after(text, "decisions"))), "discovery.decisions is empty")
    # PRD GATE (docs/PRD-prd-gated-task-conversion.md): every task needs spec's
    # PRD + a real RICE score before it can leave discovery — no exemptions.
    # Attach both first: task.sh set-prd <id> --ref <path> --rice <score>.
    prd_ref = top(text, "prd_ref")
    require(bool(prd_ref), 'prd_ref is empty — run task.sh set-prd first (no task skips the PRD gate)')
    require((ROOT / prd_ref.strip('"')).exists(), f"prd_ref path does not exist on disk: {prd_ref}")
    require(bool(top(text, "rice_score")), 'rice_score is empty — run task.sh set-prd first (no task skips the RICE gate)')
    # GATE 0 (MASTER.md PART 7): structural changes need explicit sign-offs —
    # the 4-team RFC (dev/spec/meta/warden) or operator-ordered. Without them,
    # approval is blocked: no silent builds.
    # Anchored regex, not a plain substring check — TEMPLATE.yaml's commented-out
    # placeholder ("  # gate_0: true    # uncomment if...") contains the literal
    # substring "gate_0: true" too, which used to false-trigger gate_0 on every
    # freshly-created task until its classification block was hand-edited to
    # remove the comment. Matches the pattern cmd_list already uses correctly.
    is_gate0 = bool(re.search(r"^[ \t]*gate_0:[ \t]*true\b", block(text, "classification"), re.M))
    if is_gate0:
        signoffs = list_items(block_after(text, "gate_0_signoffs"))
        require(bool(signoffs), "gate_0 requires gate_0_signoffs: [dev, spec, meta, warden] (or operator-ordered)")
    text = set_status(text, "approved")
    if not top(text, "approved_by"):
        text += f"\napproved_by: {who}\napproved_at: {now_iso()}\n"
    path_for(tid).write_text(text)
    note = "gate_0 RFC satisfied" if is_gate0 else ""
    _append_history(path_for(tid), who, "approved", note)
    print(f"✓ {tid} → approved by {who}")


def cmd_start(args, tid):
    actor = _opt(args, "--actor") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") == "approved", f"{tid} is not approved")
    require(bool(top(text, "approved_by")) and bool(top(text, "approved_at")), "missing approved_by/approved_at")
    owners = [o for o in re.findall(r"^\s+owner:[ \t]*(.*\S)?\s*$", block(text, "work_items"), re.M) if o]
    require(len(owners) >= 1, "no work_item has an owner")
    path_for(tid).write_text(set_status(text, "executing"))
    _append_history(path_for(tid), actor, "executing_started", f"{len(owners)} work item(s) dispatched")
    print(f"✓ {tid} → executing ({len(owners)} work item(s) with owners)")


def cmd_gate(args, tid):
    actor = _opt(args, "--actor") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") == "executing", f"{tid} is not executing")
    produces = [p for p in re.findall(r"^\s+produces:[ \t]*(.*\S)?\s*$", block(text, "work_items"), re.M) if p]
    missing = [p for p in produces if "/" in p and not (ROOT / p.strip('"')).exists()]
    require(not missing, f"produces paths not on disk: {', '.join(missing)}")
    path_for(tid).write_text(set_status(text, "gated"))
    _append_history(path_for(tid), actor, "gated", "")
    print(f"✓ {tid} → gated (all produces paths exist)")


def cmd_review(args, tid):
    """gated → review — the suite's turn. A review opens with NO verdict yet;
    `suite` decides it. (Artifact beat 12: review is a run, not a signature.)"""
    runner = _opt(args, "--runner") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") == "gated", f"{tid} is not gated")
    path_for(tid).write_text(set_status(text, "review"))
    _append_history(path_for(tid), runner, "review_opened", "suite queued")
    print(f"✓ {tid} → review ({runner}). Run the suite: task.sh suite {tid} --result pass|fail --run <path>")


def cmd_suite(args, tid):
    """review → done (pass) or stays review (fail). The run record path is the
    proof — replaces prose exit_gate.proof (artifact beat 12: a criterion and an
    assertion are the same line; the proof IS the run)."""
    result = _opt(args, "--result")
    run = _opt(args, "--run") or ""
    detail = _opt(args, "--detail") or ""
    actor = _opt(args, "--actor") or "operator"
    require(result in ("pass", "fail"), 'suite needs --result pass|fail')
    require(bool(run), 'suite needs --run "<path>" (the run record file)')
    require((ROOT / run.strip('"')).exists(), f"run record does not exist on disk: {run}")
    text = path_for(tid).read_text()
    require(top(text, "status") == "review", f"{tid} is not in review")
    run_clean = run.strip('"')
    if re.search(r"^run_ref:", text, re.M):
        text = re.sub(r"^run_ref:.*$", f'run_ref: "{run_clean}"', text, count=1, flags=re.M)
    else:
        text += f'run_ref: "{run_clean}"\n'
    if result == "pass":
        eg = block(text, "exit_gate")
        require(bool(indented("exit_gate:\n" + eg, "owner")), "exit_gate.owner is empty")
        text = set_status(text, "done")
        if re.search(r"^\s+proof:", eg, re.M):
            text = re.sub(r"^(\s+proof:)[ \t]*.*$",
                          rf'\1 "{run_clean}"', text, count=1, flags=re.M)
        path_for(tid).write_text(text)
        _append_history(path_for(tid), actor, "suite_passed", f"{run_clean}" + (f" · {detail}" if detail else ""))
        print(f"✓ {tid} → done (suite passed · run: {run_clean})")
    else:
        path_for(tid).write_text(text)
        _append_history(path_for(tid), actor, "suite_failed", f"{run_clean}" + (f" · {detail}" if detail else ""))
        print(f"✗ {tid} stays in review (suite failed · run: {run_clean}). "
              f"Rotate: task.sh new --revision-of {tid} \"<request>\" (cap: 2 rotations, then dispute the criterion)")


def cmd_block(args, tid):
    """SIDECAR — status unchanged. blocked AND executing, which one status field
    cannot express (artifact beat 10: today a stalled task is indistinguishable
    from a slow one; the sidecar fixes that without restructuring the machine)."""
    reason = _opt(args, "--reason")
    actor = _opt(args, "--actor") or "operator"
    require(bool(reason), 'block needs --reason "<why>"')
    text = path_for(tid).read_text()
    require(top(text, "status") != "done", f"{tid} is done — nothing blocks a closed task")
    require(top(text, "blocked") != "true", f"{tid} is already blocked")
    if re.search(r"^blocked:.*$", text, re.M):
        text = re.sub(r"^blocked:.*$", "blocked: true", text, count=1, flags=re.M)
        text = re.sub(r"^blocked_at:.*$", f'blocked_at: "{now_iso()}"', text, count=1, flags=re.M) \
            if re.search(r"^blocked_at:", text, re.M) else text + f'blocked_at: "{now_iso()}"\n'
    else:
        text += f"\nblocked: true\nblocked_at: \"{now_iso()}\"\n"
    if re.search(r"^blocked_reason:", text, re.M):
        text = re.sub(r"^blocked_reason:.*$", f'blocked_reason: "{reason.replace(chr(34), chr(39))}"',
                      text, count=1, flags=re.M)
    else:
        text += f'blocked_reason: "{reason.replace(chr(34), chr(39))}"\n'
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "blocked", reason)
    print(f"✓ {tid} blocked (sidecar — status still {top(text, 'status')})")


def cmd_unblock(args, tid):
    actor = _opt(args, "--actor") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "blocked") == "true", f"{tid} is not blocked")
    if re.search(r"^blocked:.*$", text, re.M):
        text = re.sub(r"^blocked:.*$", "blocked: false", text, count=1, flags=re.M)
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "unblocked", "resolved")
    print(f"✓ {tid} unblocked (status still {top(text, 'status')})")


def cmd_supersede(args, tid):
    by = _opt(args, "--by")
    require(bool(by), 'supersede needs --by <TS-id>')
    text = path_for(tid).read_text()
    if top(text, "superseded_by") in ("", "null"):
        text = re.sub(r"^superseded_by:.*$", f"superseded_by: {by}", text, count=1, flags=re.M) \
            if re.search(r"^superseded_by:", text, re.M) else text + f"\nsuperseded_by: {by}\n"
        path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), "system", "superseded", f"superseded by {by}")
    print(f"✓ {tid} superseded_by {by}")


def cmd_setacceptance(args, tid):
    wi = _opt(args, "--wi")
    idx_s = _opt(args, "--i")
    status = _opt(args, "--status")
    evidence = _opt(args, "--evidence") or ""
    actor = _opt(args, "--actor") or "operator"
    require(bool(wi), 'set-acceptance needs --wi <WI-id> (e.g. WI-1)')
    require(idx_s.isdigit(), 'set-acceptance needs --i <0-based index>')
    require(status in ACCEPT_STATUSES, f"--status must be one of {sorted(ACCEPT_STATUSES)}")
    idx = int(idx_s)
    text = path_for(tid).read_text()
    chunks = _wi_chunks(text)
    target = next(((c, s, e) for c, s, e in chunks if re.match(rf"\s*-\s+id:\s*{re.escape(wi)}\b", c)), None)
    require(target is not None, f"no work item {wi} in {tid}")
    chunk, cstart, cend = target
    ablk = block_after(chunk, "acceptance")
    require(bool(ablk.strip()), f"{wi} has no acceptance criteria — fill them in the record first")
    # acceptance block's offset inside the chunk: after the "acceptance:" line
    am = re.search(r"^([ \t]*)acceptance:[ \t]*(?:#.*)?$", chunk, re.M)
    a_abs = cstart + am.end()
    items = _parse_acceptance(ablk)
    require(0 <= idx < len(items), f"--i {idx} out of range ({len(items)} criteria)")
    items[idx]["status"] = status
    if evidence:
        items[idx]["evidence"] = evidence
    # Re-serialize the block at the ORIGINAL indentation (am.group(1) is the
    # key line's leading whitespace — dropping it would break the work_items
    # structure).
    ind = am.group(1)
    new_block = _serialize_acceptance(items, indent=ind + "  ")
    # Replace from the acceptance key line through the end of the old block.
    old_end = cstart + (am.end() + len(ablk))
    text = text[:cstart] + chunk[:am.start()] + f"{ind}acceptance:\n" + new_block + "\n" + text[old_end:]
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "acceptance_updated",
                    f"{wi}[{idx}] → {status}" + (f" · {evidence}" if evidence else ""))
    print(f"✓ {tid} {wi}[{idx}] acceptance → {status}")


def cmd_setroles(args, tid):
    wi = _opt(args, "--wi")
    actor = _opt(args, "--actor") or "operator"
    require(bool(wi), 'set-roles needs --wi <WI-id>')
    text = path_for(tid).read_text()
    chunks = _wi_chunks(text)
    target = next(((c, s, e) for c, s, e in chunks if re.match(rf"\s*-\s+id:\s*{re.escape(wi)}\b", c)), None)
    require(target is not None, f"no work item {wi} in {tid}")
    chunk, cstart, cend = target
    owner = indented(chunk, "owner") or ""
    doer = _opt(args, "--doer") or owner
    verifier = _opt(args, "--verifier") or ""
    integrator = _opt(args, "--integrator") or ""
    require(bool(doer), "set-roles needs a --doer (or an owner to default to)")
    new_chunk = chunk
    for key, val in (("doer", doer), ("verifier", verifier), ("integrator", integrator)):
        if re.search(rf"^\s+{key}:", new_chunk, re.M):
            new_chunk = re.sub(rf"^(\s+{key}:)[ \t]*.*$", rf'\1 "{val.replace(chr(34), chr(39))}"',
                               new_chunk, count=1, flags=re.M)
        else:
            new_chunk += f'    {key}: "{val.replace(chr(34), chr(39))}"\n'
    text = text[:cstart] + new_chunk + text[cend:]
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "roles_set",
                    f"{wi}: doer={doer or '—'}, verifier={verifier or '—'}, integrator={integrator or '—'}")
    print(f"✓ {tid} {wi} roles: doer={doer or '—'} verifier={verifier or '—'} integrator={integrator or '—'}")


def cmd_sethandoff(args, tid):
    """Six-field packet, written while the context is still live (artifact beat
    15: cheap now, expensive to reconstruct in three weeks)."""
    # CLI flags are kebab-case (--needs-wiring); fields are snake_case.
    vals = {f: _opt(args, "--" + f.replace("_", "-")) for f in HANDOFF_FIELDS}
    actor = _opt(args, "--actor") or "operator"
    missing = [f for f in HANDOFF_FIELDS if not vals[f]]
    require(not missing, f"set-handoff needs all six fields: --{' --'.join(HANDOFF_FIELDS)} (missing: {', '.join(missing)})")
    text = path_for(tid).read_text()
    block_str = "handoff:\n" + "".join(
        f'  {k}: "{vals[k].replace(chr(34), chr(39))}"\n' for k in HANDOFF_FIELDS)
    if re.search(r"^handoff:[ \t]*\{\}[ \t]*(?:#.*)?$", text, re.M):
        # TEMPLATE placeholder `handoff: {}` → replace the whole line with the block.
        text = re.sub(r"^handoff:[ \t]*\{\}[ \t]*(?:#.*)?$", block_str.rstrip("\n"),
                      text, count=1, flags=re.M)
    elif re.search(r"^handoff:", text, re.M):
        m = re.search(r"^handoff:[ \t]*(?:#.*)?$", text, re.M)
        start = m.end()
        nxt = re.search(r"^\S", text[start:], re.M)
        end = start + (nxt.start() if nxt else len(text) - start)
        text = text[:start] + block_str[len("handoff:\n"):] + text[end:]
    else:
        if not text.endswith("\n"):
            text += "\n"
        text += block_str
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "handoff_emitted", "6-field packet written")
    print(f"✓ {tid} handoff packet written (6 fields) + handoff_emitted")


def cmd_done(args, tid):
    proof = _opt(args, "--proof") or ""
    run_ref = _opt(args, "--run-ref") or ""
    actor = _opt(args, "--actor") or "operator"
    text = path_for(tid).read_text()
    require(top(text, "status") in ("gated", "review"), f"{tid} is not gated/review")
    eg = block(text, "exit_gate")
    require(bool(indented("exit_gate:\n" + eg, "owner")), "exit_gate.owner is empty")
    if run_ref:
        run_clean = run_ref.strip('"')
        require((ROOT / run_clean).exists(), f"run record does not exist on disk: {run_clean}")
        proof = run_clean
    require(bool(proof.strip()), "proof is empty — cite a real artifact or pass --run-ref")
    require(not is_self_assert(proof), "proof is self-asserting — cite a real artifact or pass --run-ref")
    if re.search(r"^\s+proof:", eg, re.M):
        text = re.sub(r"^(\s+proof:)[ \t]*.*$",
                      rf'\1 "{proof.replace(chr(34), chr(39))}"', text, count=1, flags=re.M)
    path_for(tid).write_text(set_status(text, "done"))
    _append_history(path_for(tid), actor, "done", proof)
    print(f"✓ {tid} → done (proof: {proof})")


def cmd_setprd(args, tid):
    """Attach spec's generated PRD + RICE score to a record — the only writer
    of prd_ref/rice_score (docs/PRD-prd-gated-task-conversion.md). Allowed in
    draft or discovery only; once approved the PRD is frozen (prd-discipline
    §Instructions.4 — amendments version the PRD, they don't silently rewrite
    the ref on an already-approved task)."""
    ref = _opt(args, "--ref")
    rice = _opt(args, "--rice")
    actor = _opt(args, "--actor") or "operator"
    require(bool(ref), 'set-prd needs --ref "<path to store/tasks/{id}-prd.md>"')
    require(bool(rice), 'set-prd needs --rice "<score>" (real scripts/rice.py output, not hand-typed)')
    text = path_for(tid).read_text()
    st = top(text, "status")
    require(st in ("draft", "discovery"), f"{tid} is {st} — PRD is frozen once approved (amend via a new PRD version instead)")
    ref_clean = ref.strip('"').strip("'")
    require((ROOT / ref_clean).exists(), f"no such file on disk: {ref_clean}")
    if re.search(r"^prd_ref:.*$", text, re.M):
        text = re.sub(r"^prd_ref:.*$", f'prd_ref: "{ref_clean}"', text, count=1, flags=re.M)
    else:
        if not text.endswith("\n"):
            text += "\n"
        text += f'prd_ref: "{ref_clean}"\n'
    if re.search(r"^rice_score:.*$", text, re.M):
        text = re.sub(r"^rice_score:.*$", f'rice_score: "{rice}"', text, count=1, flags=re.M)
    else:
        text += f'rice_score: "{rice}"\n'
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "prd_attached", f"ref={ref_clean} rice={rice}")
    print(f"✓ {tid} prd_ref={ref_clean} rice_score={rice}")


DESIGN_TOOLS = {"screenshot-to-code", "open-design", "custom"}


def _set_flat_field(text: str, key: str, value: str) -> str:
    """Set (or append) a top-level flat scalar field — same technique
    set-prd already uses for prd_ref/rice_score."""
    if re.search(rf"^{re.escape(key)}:.*$", text, re.M):
        return re.sub(rf"^{re.escape(key)}:.*$", f'{key}: "{value}"', text, count=1, flags=re.M)
    if not text.endswith("\n"):
        text += "\n"
    return text + f'{key}: "{value}"\n'


def cmd_set_design_origin(args, tid):
    """Link a task back to the cli/design.py session that produced it
    (docs/PRD-design-first-workflow.md). Unlike set-prd this isn't a gate —
    it's descriptive metadata the dashboard's design-preview panel reads —
    so it's allowed at any status, not just draft/discovery."""
    session = _opt(args, "--session")
    tool = _opt(args, "--tool")
    artifact = _opt(args, "--artifact") or ""
    handoff = _opt(args, "--handoff") or ""
    actor = _opt(args, "--actor") or "operator"
    require(bool(session), 'set-design-origin needs --session "<design-session id>"')
    require(tool in DESIGN_TOOLS, f"set-design-origin needs --tool one of {sorted(DESIGN_TOOLS)}, got {tool!r}")
    text = path_for(tid).read_text()
    text = _set_flat_field(text, "design_session_id", session)
    text = _set_flat_field(text, "design_tool", tool)
    if artifact:
        text = _set_flat_field(text, "design_artifact_id", artifact)
    if handoff:
        text = _set_flat_field(text, "design_handoff_path", handoff)
    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "design_origin_set", f"session={session} tool={tool}")
    print(f"✓ {tid} design_session_id={session} design_tool={tool}")


def cmd_filldiscovery(args, tid):
    """One-shot: transcribe the generated PRD's own working-agent + decisions
    into classification.lead + discovery.decisions (docs/PRD-prd-gated-task-
    conversion.md). The PRD already IS the discovery answer for a chat-
    converted task — this isn't a second round of questions. Deliberately
    NOT a general decisions editor: only fires while decisions is still the
    pristine `[]` TEMPLATE default, so it can't silently clobber a record a
    human has already filled in by hand."""
    lead = _opt(args, "--lead")
    decisions_raw = _opt(args, "--decisions")
    objective = _opt(args, "--objective")
    actor = _opt(args, "--actor") or "operator"
    require(bool(lead), 'fill-discovery needs --lead "<agent>"')
    require(bool(decisions_raw), 'fill-discovery needs --decisions \'["...", "..."]\' (JSON array)')
    try:
        decisions = json.loads(decisions_raw)
    except ValueError:
        decisions = None
    require(isinstance(decisions, list) and len(decisions) > 0 and all(isinstance(d, str) for d in decisions),
            "--decisions must be a non-empty JSON array of strings")
    text = path_for(tid).read_text()
    st = top(text, "status")
    require(st in ("draft", "discovery"), f"{tid} is {st} — discovery is closed")
    require(bool(re.search(r"^[ \t]*decisions:[ \t]*\[\][ \t]*(?:#.*)?$", text, re.M)),
            "discovery.decisions is not empty/pristine — fill-discovery only sets it once; edit the record by hand for amendments")

    lead_safe = lead.replace('"', "'").strip()
    text = re.sub(r'^([ \t]*)lead:[ \t]*.*$', rf'\1lead: "{lead_safe}"', text, count=1, flags=re.M)

    m = re.search(r"^([ \t]*)decisions:[ \t]*\[\][ \t]*(?:#.*)?$", text, re.M)
    indent = m.group(1)
    lines = "\n".join(f'{indent}  - "{d.replace(chr(34), chr(39))}"' for d in decisions)
    text = text[: m.start()] + f"{indent}decisions:\n{lines}" + text[m.end():]

    if objective:
        obj_safe = objective.replace('"', "'").strip()
        # first work_items[].owner/objective only — the chat-conversion flow
        # writes a single-work-item record; a multi-work-item DAG is a
        # manual/dev-authored task, not this path's job.
        text = re.sub(r'^([ \t]*)owner:[ \t]*""[ \t]*$', rf'\1owner: "{lead_safe}"', text, count=1, flags=re.M)
        text = re.sub(r'^([ \t]*)objective:[ \t]*""(?:[ \t]*#.*)?$', rf'\1objective: "{obj_safe}"', text, count=1, flags=re.M)

    path_for(tid).write_text(_stamp(text))
    _append_history(path_for(tid), actor, "discovery_filled", f"lead={lead_safe}; {len(decisions)} decision(s)")
    print(f"✓ {tid} classification.lead={lead_safe}, discovery.decisions ({len(decisions)} entries)")


def cmd_note(args, tid):
    """Append a history entry with NO state transition — the Make Changes /
    Retry / Redo lifecycle actions use this (PRD §3.3) and criterion_deferred
    (artifact beat 20: a deferral that leaves no record is just something
    everyone forgot). Does not touch status."""
    event = _opt(args, "--event")
    require(bool(event), "note needs --event <name> (e.g. retry_opened, redo_opened, changes_requested, criterion_deferred)")
    actor = _opt(args, "--actor") or "operator"
    note = _opt(args, "--note") or ""
    _append_history(path_for(tid), actor, event, note)
    print(f"✓ {tid} history += {event} (by {actor})")


def cmd_status(args, tid):
    text = path_for(tid).read_text()
    st = top(text, "status")
    print(f"ACTIVE: {tid}   status: {st}   lead: {indented(text, 'lead') or '—'}")
    owners = [o for o in re.findall(r"^\s+owner:[ \t]*(.*\S)?\s*$", block(text, 'work_items'), re.M) if o]
    print(f"  work items with owners: {len(owners)}  {owners}")
    print(f"  history entries: {len(_parse_history(text))}")
    print(f"  next: {_next_blocking(text, st)}")


def cmd_list(args):
    """Every real record (TEMPLATE excluded), as a JSON array — the read side
    for anything that wants to show tasks without re-implementing the tiny
    regex YAML access above (the dashboard Tasks panel, in particular).
    No values invented: a field that isn't in the record comes back empty/[],
    never guessed."""
    import json as _json
    out = []
    for p in sorted(TASKS.glob("TS-*.yaml")):
        t = p.read_text()
        tid = top(t, "id") or p.stem
        st = top(t, "status")
        work_items_blk = block(t, "work_items")
        owners = [_clean(o) for o in re.findall(r"^\s+owner:[ \t]*(.*\S)?\s*$", work_items_blk, re.M) if _clean(o)]
        wi_ids = re.findall(r"^\s*-\s*id:[ \t]*(\S+)", work_items_blk, re.M)
        objectives = [_clean(o) for o in re.findall(r"^\s+objective:[ \t]*(.*\S)?\s*$", work_items_blk, re.M)]
        # v3: per-work-item roles + acceptance (chunk-scoped, never cross-item)
        chunks = _wi_chunks(t)
        chunk_by_id: dict[str, str] = {}
        for c, _, _ in chunks:
            m = re.search(r"^\s*-\s*id:[ \t]*(\S+)", c, re.M)
            chunk_by_id[m.group(1) if m else f"WI-{len(chunk_by_id) + 1}"] = c
        work_items = []
        n = max(len(wi_ids), len(owners), len(objectives))
        for i in range(n):
            wid = wi_ids[i] if i < len(wi_ids) else f"WI-{i+1}"
            chunk = chunk_by_id.get(wid, "")
            work_items.append({
                "id": wid,
                "owner": owners[i] if i < len(owners) else "",
                "objective": objectives[i] if i < len(objectives) else "",
                "doer": indented(chunk, "doer") or (owners[i] if i < len(owners) else ""),
                "verifier": indented(chunk, "verifier"),
                "integrator": indented(chunk, "integrator"),
                "produces": indented(chunk, "produces"),
                "blockedBy": list_items(block_after(chunk, "blocked_by")) if "blocked_by:" in chunk and not re.search(r"blocked_by:[ \t]*\[\][ \t]*$", chunk, re.M) else [],
                "acceptance": _parse_acceptance(block_after(chunk, "acceptance")) if "acceptance:" in chunk else [],
            })
        exit_blk = block(t, "exit_gate")
        classification_blk = block(t, "classification")
        handoff_blk = _handoff_block(t)
        revision_of_raw = top(t, "revision_of")
        derived_from_raw = top(t, "derived_from")
        out.append({
            "id": tid,
            "status": st,
            "sourceMessage": top(t, "source_message"),
            "requester": top(t, "requester"),
            "taskType": indented(t, "task_type"),
            "departments": list_items(block(t, "departments")) or [
                d.strip().strip('"').strip("'")
                for d in ",".join(re.findall(r"\[(.*)\]", indented(t, "departments") or "")).split(",")
                if d.strip()
            ],
            "lead": indented(t, "lead"),
            "discoveryQuestions": [q.strip().strip('"').strip("'") for q in list_items(block_after(t, "questions"))] if "questions:" in block(t, "discovery") else [],
            "workItems": work_items,
            "exitOwner": indented(exit_blk, "owner") if exit_blk else "",
            "exitProof": indented(exit_blk, "proof") if exit_blk else "",
            "approvedBy": top(t, "approved_by"),
            "approvedAt": top(t, "approved_at"),
            "nextBlocking": _next_blocking(t, st),
            "active": active_id() == tid,
            "createdAt": top(t, "created_at"),
            "updatedAt": top(t, "updated_at") or top(t, "created_at"),
            "revisionOf": revision_of_raw if revision_of_raw and revision_of_raw != "null" else "",
            "derivedFrom": derived_from_raw if derived_from_raw and derived_from_raw != "null" else "",
            "supersededBy": _sup if (_sup := top(t, "superseded_by")) and _sup != "null" else "",
            "blocked": top(t, "blocked") == "true",
            "blockedAt": top(t, "blocked_at"),
            "blockedReason": top(t, "blocked_reason"),
            "runRef": top(t, "run_ref"),
            "handoff": {k: indented(handoff_blk, k) for k in HANDOFF_FIELDS} if handoff_blk else {},
            "gate0": bool(re.search(r"^[ \t]*gate_0:[ \t]*true\b", classification_blk, re.M)),
            "gate0Signoffs": [s.split("#")[0].strip().strip('"').strip("'") for s in list_items(block_after(t, "gate_0_signoffs"))],
            "history": _parse_history(t),
            "prdRef": top(t, "prd_ref"),
            "riceScore": top(t, "rice_score"),
            "designSessionId": top(t, "design_session_id"),
            "designTool": top(t, "design_tool"),
            "designArtifactId": top(t, "design_artifact_id"),
            "designHandoffPath": top(t, "design_handoff_path"),
        })
    print(_json.dumps(out))


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
            run_ref = top(t, "run_ref")
            proof = run_ref or indented("exit_gate:\n" + block(t, "exit_gate"), "proof")
            if not proof or is_self_assert(proof):
                fails.append(f"{p.name}: {st} but exit proof empty/self-asserting (use a run record: task.sh suite --run)")
        if re.search(r"^[ \t]*gate_0:[ \t]*true\b", block(t, "classification"), re.M) and i >= STATES.index("approved"):
            if not list_items(block_after(t, "gate_0_signoffs")):
                fails.append(f"{p.name}: gate_0 requires gate_0_signoffs (dev/spec/meta/warden or operator-ordered)")
        # history is additive/optional — a missing or empty history block on an
        # old record is NOT a validation failure (backward compatible, PRD §6).
        # PRD gate (docs/PRD-prd-gated-task-conversion.md): only enforced on
        # records that HAVE the prd_ref key — i.e. created after this patch.
        # Pre-existing records (TS-001..TS-033, none of which carry prd_ref)
        # are exempt, same backward-compat rule the history field used.
        if re.search(r"^prd_ref:", t, re.M) and i >= STATES.index("approved"):
            prd_ref = top(t, "prd_ref")
            if not prd_ref:
                fails.append(f"{p.name}: {st} but prd_ref is empty (PRD required before approval)")
            elif not (ROOT / prd_ref.strip('"')).exists():
                fails.append(f"{p.name}: {st} but prd_ref path missing on disk: {prd_ref}")
            if not top(t, "rice_score"):
                fails.append(f"{p.name}: {st} but rice_score is empty (RICE required before approval)")
        # v3 checks
        if top(t, "blocked") == "true":
            if st == "done":
                fails.append(f"{p.name}: done but blocked sidecar is still set")
            if not top(t, "blocked_reason"):
                fails.append(f"{p.name}: blocked: true but blocked_reason is empty")
            if not top(t, "blocked_at"):
                fails.append(f"{p.name}: blocked: true but blocked_at is empty")
        for c, s, _e in _wi_chunks(t):
            wid = indented(c, "id") or "?"
            for a in _parse_acceptance(block_after(c, "acceptance")) if "acceptance:" in c else []:
                if a["status"] not in ACCEPT_STATUSES:
                    fails.append(f"{p.name}: {wid} acceptance '{a['text'][:40]}' has invalid status '{a['status']}'")
        hb = _handoff_block(t)
        if hb:
            missing_h = [k for k in HANDOFF_FIELDS if not indented(hb, k)]
            if missing_h:
                fails.append(f"{p.name}: handoff packet missing fields: {', '.join(missing_h)}")
    if fails:
        print("❌ task validate FAIL:")
        for f in fails:
            print(f"   - {f}")
        raise SystemExit(1)
    print(f"✓ task validate PASS ({len(recs)} record(s))")


# ── small utils ─────────────────────────────────────────────────────────────
def block_after(text, key):
    """Indented body under a *nested* `key:` up to the next line whose
    indentation is <= the key line's own indentation (a sibling key or a
    dedent) — not just the next column-0 line, so e.g. `questions:` stops
    at the following sibling `decisions:` instead of swallowing it."""
    m = re.search(r"^([ \t]*)" + re.escape(key) + r":[ \t]*(?:#.*)?$", text, re.M)
    if not m:
        return ""
    indent = len(m.group(1))
    start = m.end()
    rest = text[start:]
    boundary = re.compile(r"^[ \t]{0," + str(indent) + r"}\S", re.M)
    nxt = boundary.search(rest)
    return rest[: nxt.start()] if nxt else rest


def _opt(args, flag):
    if flag in args:
        i = args.index(flag)
        return args[i + 1] if i + 1 < len(args) else ""
    return ""


def _next_blocking(text, st):
    if top(text, "blocked") == "true" and st != "done":
        return f"resolve the block: task.sh unblock {top(text, 'id')}"
    n = {"draft": "fill classification.lead → task.sh discover",
         "discovery": "fill discovery.decisions + task.sh set-prd (PRD+RICE) → task.sh approve --by <who>",
         "approved": "ensure a work_item owner → task.sh start",
         "executing": "create every produces path → task.sh gate",
         "gated": "task.sh review --runner <who> → task.sh suite --result pass|fail --run <path>",
         "review": "task.sh suite --result pass --run <path> (or --result fail to rotate)",
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
    if cmd == "list":
        return cmd_list(rest)
    # commands that operate on a task id (positional id optional → ACTIVE)
    pos = [a for a in rest if not a.startswith("-")]
    idarg = None
    if cmd in ("discover", "approve", "start", "gate", "review", "suite", "block", "unblock",
               "supersede", "done", "status", "note", "set-prd", "set-design-origin",
               "fill-discovery", "set-acceptance", "set-roles", "set-handoff"):
        # id is the first bare positional that looks like TS-xxx
        cand = [a for a in pos if re.match(r"TS-\d+", a)]
        idarg = cand[0] if cand else None
    dispatch = {"discover": cmd_discover, "approve": cmd_approve, "start": cmd_start,
                "gate": cmd_gate, "review": cmd_review, "suite": cmd_suite,
                "block": cmd_block, "unblock": cmd_unblock, "supersede": cmd_supersede,
                "done": cmd_done, "status": cmd_status, "note": cmd_note,
                "set-prd": cmd_setprd, "set-design-origin": cmd_set_design_origin,
                "fill-discovery": cmd_filldiscovery, "set-acceptance": cmd_setacceptance,
                "set-roles": cmd_setroles, "set-handoff": cmd_sethandoff}
    if cmd in dispatch:
        return dispatch[cmd](rest, resolve(idarg))
    die(f"unknown command: {cmd}")


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]) or 0)
