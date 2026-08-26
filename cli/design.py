#!/usr/bin/env python3
"""design.py — design-first workflow session manager (docs/PRD-design-first-
workflow.md). Stages 0-4 of the master tree, covering Scenario A (URL in, no
motion) end to end, Scenario B's F2d/F2e conflicting-reference handling, plus
the F6b soft-failure review gate generalized to this MVP's one real
generation-shaped step (screenshot-to-code's code-gen call). Stage 2
(reference list — F2a-F2c live/curated tiers, PICK/EXTRACT) is implemented
against the nexu-io/open-design daemon (vps-scripts/deploy-open-design.sh)
for the live tier, degrading honestly to a curated static tier when it's
unreachable or unconfigured.

Explicitly OUT of this MVP's scope (tracked, not silently dropped — see the
PRD's Scope Boundary section): Stage 5b motion/Higgsfield generation,
scroll-world, and most of the 25-point fallback inventory beyond
F1a/F1c/F2a-F2e/F3a/F4a-c/F6a/F6b/FX2. Every one of those still applies once
this is extended — nothing here contradicts them.

Hard invariant (operator's own words, non-negotiable): a PRD is NEVER assumed
to already exist and is NEVER written by this file. `handoff` produces a
discussion transcript for dashboard/lib/prd-generator.ts's generatePrd() to
consume as its `summary` input — generatePrd still runs fresh, same as any
other chat-converted task. Nothing here writes store/tasks/*-prd.md.

Lifecycle (linear happy path):
    trigger -> review -> draft_ready -> spend -> ready -> handed_off
Terminal (no further transitions, no TASK-SPEC/PRD ever follows):
    abandoned   (review gate: operator abandons)
    declined    (spend gate: operator declines the estimate)

Text-only input (no screenshot-to-code call at all — nothing to review)
skips straight from trigger to draft_ready on `draft`.

Commands:
    new --input url|text --value "<url or text>" [--confirm-thin] [--actor <who>]
    input <id> --value "<new value>" [--actor <who>]     (only while trigger)
    capture <id> [--manual-screenshot <path>] [--actor <who>]
    reference <id>                                        (F2a-F2c: shows RLIST, resolves nothing)
    reference <id> --skip                                  (F2: PICK nothing -> draft from screenshot/info)
    reference <id> --pick <ref_id> [--competing-input "<val>" --lead template|site]
                    [--confirm-unlicensed] [--actor <who>]  (F2d/F2e/F3a)
    generate <id> [--actor <who>]
    review <id> --decision approve|regenerate|adjust-input|abandon
                [--note "<text>"] [--confirm-override] [--actor <who>]
    draft <id> [--actor <who>]
    estimate <id>
    approve-spend <id> [--actor <who>]
    decline-spend <id> [--actor <who>]
    handoff <id> [--allow-stub] [--title "<text>"]
    status [id]
    list
    validate [id]

Env: DESIGN_SESSIONS_DIR overrides store/design-sessions (for testing, same
convention as cli/task.py's TASKS_DIR).
"""
from __future__ import annotations
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import screenshot_to_code_client as s2c  # noqa: E402
from lib import open_design_client as odc  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SESSIONS = Path(os.environ.get("DESIGN_SESSIONS_DIR", ROOT / "store" / "design-sessions"))
PRICING_FILE = SESSIONS / "pricing.json"
CURATED_REFS_FILE = Path(
    os.environ.get("CURATED_REFERENCES_FILE", ROOT / "store" / "design-sessions" / "curated-references.json")
)
STALE_DAYS = 90  # F2b

STATES = ["trigger", "review", "draft_ready", "spend", "ready", "handed_off"]
TERMINAL = {"abandoned", "declined"}
CAPTURE_ATTEMPT_CAP = 3
GENERATE_ATTEMPT_CAP = 3
REGENERATE_FREE_CAP = 3  # F6c — beyond this, review --decision regenerate needs --confirm-override


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def die(msg: str, code: int = 1):
    print(f"✗ {msg}", file=sys.stderr)
    sys.exit(code)


def require(cond: bool, why: str):
    if not cond:
        die(why)


def path_for(sid: str) -> Path:
    return SESSIONS / f"{sid}.json"


def _rel(path: Path) -> str:
    """Path relative to ROOT when possible (the normal case); falls back to
    an absolute string under a test's scratch DESIGN_SESSIONS_DIR override,
    which isn't under ROOT — same override convention as cli/task.py's
    TASKS_DIR."""
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def _write_atomic(path: Path, data: dict):
    """FX2 (docs/design-first-workflow-v3-fallbacks.md) — write-to-temp then
    rename, so a crash mid-write never leaves a half-written record that a
    later command misreads as valid."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp-{os.getpid()}")
    tmp.write_text(json.dumps(data, indent=2, sort_keys=False) + "\n")
    tmp.replace(path)


def load(sid: str) -> dict:
    p = path_for(sid)
    require(p.exists(), f"no such design-session: {sid}")
    try:
        return json.loads(p.read_text())
    except json.JSONDecodeError as e:
        die(f"{sid}.json is corrupted and could not be parsed ({e}) — not auto-repaired, needs a human look")


def save(rec: dict):
    rec["updated_at"] = now_iso()
    _write_atomic(path_for(rec["id"]), rec)


def append_history(rec: dict, actor: str, event: str, note: str = ""):
    rec.setdefault("history", []).append({"ts": now_iso(), "actor": actor, "event": event, "note": note})


def _opt(args: list[str], flag: str) -> str | None:
    if flag in args:
        i = args.index(flag)
        if i + 1 < len(args):
            return args[i + 1]
    return None


def _has(args: list[str], flag: str) -> bool:
    return flag in args


def resolve_id(argv: list[str]) -> tuple[str, list[str]]:
    """First positional (non `--flag`) token is the session id; rest is args."""
    if not argv or argv[0].startswith("--"):
        die("missing <id>")
    return argv[0], argv[1:]


# ── Stage 0 — Trigger ────────────────────────────────────────────────────────
def cmd_new(args: list[str]):
    itype = _opt(args, "--input")
    value = _opt(args, "--value")
    actor = _opt(args, "--actor") or "operator"
    require(itype in ("url", "text"), 'new needs --input url|text')
    require(bool(value), 'new needs --value "<url or text>"')
    if itype == "text" and len(value.strip()) < 40 and not _has(args, "--confirm-thin"):
        die(
            "text input is thin (<40 chars) — F1c: ux asks a follow-up before drafting "
            "rather than guessing. Either give more detail, or re-run with --confirm-thin "
            "to proceed anyway (will be flagged low-confidence in the design.md)."
        )
    sid = str(uuid.uuid4())
    rec = {
        "id": sid,
        "status": "trigger",
        "created_at": now_iso(),
        "input": {"type": itype, "value": value, "thin_confirmed": itype == "text" and len(value.strip()) < 40},
        "capture": {"attempts": 0, "fail_streak": 0, "screenshot_path": None, "stub": None, "escalated": False, "last_error": None},
        "reference": {
            "resolved": False, "live_reachable": None, "shown": [], "picked": None, "picked_tier": None,
            "competing_input": None, "lead": None, "extracted": None, "note": None,
        },
        "generation": {"attempts": 0, "fail_streak": 0, "code": None, "stack": None, "stub": None, "escalated": False, "last_error": None},
        "review": {"decision": None, "regenerate_count": 0, "note": None},
        "design_md": {"path": None},
        "spend": {"estimate_usd": None, "pricing_source": None, "warnings": [], "decision": None},
        "history": [],
    }
    append_history(rec, actor, "created", f"input={itype}")
    save(rec)
    print(f"✓ design-session {sid} created (status=trigger, input={itype})")
    return sid


def cmd_input(args: list[str], sid: str):
    value = _opt(args, "--value")
    actor = _opt(args, "--actor") or "operator"
    require(bool(value), 'input needs --value "<new value>"')
    rec = load(sid)
    require(rec["status"] == "trigger", f"{sid} is {rec['status']} — input can only change while trigger")
    rec["input"]["value"] = value
    rec["capture"] = {"attempts": 0, "fail_streak": 0, "screenshot_path": None, "stub": None, "escalated": False, "last_error": None}
    rec["reference"] = {
        "resolved": False, "live_reachable": None, "shown": [], "picked": None, "picked_tier": None,
        "competing_input": None, "lead": None, "extracted": None, "note": None,
    }
    rec["generation"] = {"attempts": 0, "fail_streak": 0, "code": None, "stack": None, "stub": None, "escalated": False, "last_error": None}
    append_history(rec, actor, "input_changed", value)
    save(rec)
    print(f"✓ {sid} input updated — capture/reference/generation reset")


# ── Stage 1 — Input capture (F1a) ───────────────────────────────────────────
def cmd_capture(args: list[str], sid: str):
    actor = _opt(args, "--actor") or "operator"
    manual = _opt(args, "--manual-screenshot")
    rec = load(sid)
    require(rec["status"] == "trigger", f"{sid} is {rec['status']} — capture only runs pre-review")
    require(rec["input"]["type"] == "url", f"{sid} input is text — nothing to capture, go straight to draft")

    if manual:
        rec["capture"].update({"screenshot_path": manual, "stub": False, "escalated": False, "last_error": None})
        rec["capture"]["attempts"] += 1
        append_history(rec, actor, "capture_manual", manual)
        save(rec)
        print(f"✓ {sid} manual screenshot recorded: {manual}")
        return

    cap = rec["capture"]
    if cap["fail_streak"] >= CAPTURE_ATTEMPT_CAP:
        die(
            f"{sid} capture already escalated after {CAPTURE_ATTEMPT_CAP} consecutive failed attempts "
            f"(ESC1A) — use `capture {sid} --manual-screenshot <path>`, or `input {sid} --value "
            f'"<text>"` after switching --input text, instead of retrying the same URL again.'
        )

    result = s2c.capture_url(rec["input"]["value"])
    cap["attempts"] += 1
    if result.ok:
        cap.update({"screenshot_path": result.screenshot_path, "stub": result.stub, "last_error": None, "fail_streak": 0})
        append_history(rec, actor, "capture_ok", f"stub={result.stub}")
        save(rec)
        tag = " [STUB — no live screenshot-to-code deployment]" if result.stub else ""
        print(f"✓ {sid} captured{tag}: {result.screenshot_path}")
    else:
        cap["last_error"] = result.error
        cap["fail_streak"] += 1
        remaining = CAPTURE_ATTEMPT_CAP - cap["fail_streak"]
        if remaining <= 0:
            cap["escalated"] = True
        append_history(rec, actor, "capture_failed", result.error or "")
        save(rec)
        if remaining > 0:
            print(f"✗ {sid} capture failed ({result.error}) — {remaining} retry attempt(s) left, re-run `capture {sid}`", file=sys.stderr)
        else:
            print(
                f"✗ {sid} capture failed {CAPTURE_ATTEMPT_CAP}x ({result.error}) — escalated (ESC1A). "
                f"Use --manual-screenshot <path> or switch to text input.",
                file=sys.stderr,
            )
        sys.exit(1)


# ── Stage 2 — Reference presentation (F2a-F2e) ──────────────────────────────
def _load_curated() -> list[dict]:
    if not CURATED_REFS_FILE.exists():
        return []
    try:
        data = json.loads(CURATED_REFS_FILE.read_text())
    except json.JSONDecodeError:
        return []
    return data.get("entries", [])


def _is_stale(added_at: str) -> bool:
    try:
        added = datetime.fromisoformat(added_at).replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return True  # unparseable date — treat as stale rather than silently trusting it
    return (datetime.now(timezone.utc) - added).days > STALE_DAYS


def _extract_reference(entry: dict) -> tuple[dict | None, bool]:
    """F3a-equivalent well-formedness check on the picked entry, run at
    extraction time (not earlier) since F2e may have just re-verified a
    different entry than what was first shown."""
    if not entry.get("name") or entry.get("category") in (None, "", "unknown"):
        return None, False
    return {
        "id": entry["id"], "name": entry["name"], "category": entry["category"],
        "license": entry.get("license"), "tier": entry["tier"], "source": entry.get("source", ""),
    }, True


def cmd_reference(args: list[str], sid: str):
    actor = _opt(args, "--actor") or "operator"
    skip = _has(args, "--skip")
    pick = _opt(args, "--pick")
    competing = _opt(args, "--competing-input")
    lead = _opt(args, "--lead")
    confirm_unlicensed = _has(args, "--confirm-unlicensed")

    rec = load(sid)
    require(rec["status"] == "trigger", f"{sid} is {rec['status']} — reference only runs pre-review")
    require(rec["input"]["type"] == "url", f"{sid} input is text — Stage 2 is skipped entirely (SKIPREF), go straight to draft")
    require(bool(rec["capture"]["screenshot_path"]), f"{sid} has no screenshot yet — run `capture {sid}` first")
    require(not (skip and pick), "reference needs at most one of --skip or --pick <ref_id>")

    def _refresh_list() -> list[dict]:
        # F2a — live tier reachable?
        live_entries, live_warnings = odc.fetch_live_design_systems()
        live_reachable = odc.is_configured() and not live_warnings
        for w in live_warnings:
            print(f"  ⚠ {w}", file=sys.stderr)

        # Curated tier — always loaded, F2b freshness tagged
        curated = []
        for e in _load_curated():
            curated.append({**e, "tier": "curated", "stale": _is_stale(e.get("added_at", ""))})
        for e in live_entries:
            e["stale"] = False  # live catalog is the daemon's own current data, not a dated snapshot

        shown = (live_entries + curated) if live_reachable else curated
        # F2c — license tag
        for e in shown:
            e["closed"] = not e.get("license")

        rec["reference"]["live_reachable"] = live_reachable
        rec["reference"]["shown"] = shown
        append_history(rec, actor, "reference_shown", f"live_reachable={live_reachable} count={len(shown)}")

        tier_note = "live + curated" if live_reachable else "curated only (F2a degrade)"
        print(f"  reference list ({tier_note}):")
        for e in shown:
            tags = []
            if e.get("stale"):
                tags.append("STALE >90d — F2b")
            if e.get("closed"):
                tags.append("no license tag — not usable without manual review, F2c")
            tag_str = f"  [{', '.join(tags)}]" if tags else ""
            print(f"    - {e['id']} ({e['tier']}, {e.get('category', 'unknown')}){tag_str}")
        return shown

    if not skip and not pick:
        # RLIST only — no PICK decision yet (operator ▸ picks a reference, or nothing?
        # is a separate step from seeing the list). Persisted so a later --pick call
        # can be checked for F2e drift against what was actually shown.
        _refresh_list()
        save(rec)
        print(f"  (not resolved yet — run `reference {sid} --skip` or `--pick <ref_id>` next)")
        return

    # A previously-shown list is used for --skip/--pick so F2e ("still exists
    # *at selection*") is a real re-check against what changed since RLIST,
    # not just a fresh recompute that would always agree with itself. Falls
    # back to a fresh list if this is the first call (skip/pick with no prior
    # `reference` invocation).
    shown = rec["reference"]["shown"] or _refresh_list()

    if skip:
        rec["reference"].update({"picked": None, "picked_tier": None, "extracted": None, "resolved": True})
        save(rec)
        print(f"✓ {sid} reference skipped — will draft from screenshot/info (PICK: nothing)")
        return

    entry = next((e for e in shown if e["id"] == pick), None)
    require(bool(entry), f"{pick!r} is not in the shown reference list — run `reference {sid}` with no flags to see options, or --skip")

    if entry["closed"] and not confirm_unlicensed:
        die(
            f"{pick!r} has no license tag (F2c) — marked 'not usable without manual review'. "
            f"Re-run with --confirm-unlicensed to proceed anyway, or pick a licensed entry, or --skip."
        )

    # F2e — re-verify at selection time, not just at list time
    if entry["tier"] == "live":
        exists, verify_warnings = odc.verify_live_entry_exists(pick)
    else:
        exists = any(e["id"] == pick for e in _load_curated())
        verify_warnings = []
    for w in verify_warnings:
        print(f"  ⚠ {w}", file=sys.stderr)
    if not exists:
        rec["reference"].update({"picked": None, "picked_tier": None, "extracted": None, "resolved": False})
        save(rec)
        die(f"{pick!r} is no longer available (F2e — vanished since it was shown) — run `reference {sid}` again to pick another, or --skip")

    # F2d — competing input given alongside a pick?
    if competing:
        require(lead in ("template", "site"), "--competing-input given (F2d) — also pass --lead template|site")
        rec["reference"]["competing_input"] = competing
        rec["reference"]["lead"] = lead
        if lead == "site":
            rec["reference"].update({"picked": None, "picked_tier": None, "extracted": None, "resolved": True})
            append_history(rec, actor, "reference_site_leads", competing)
            save(rec)
            print(f"✓ {sid} site leads over the reference (F2d) — dropping {pick!r}, drafting from screenshot/info instead")
            return

    extracted, well_formed = _extract_reference(entry)
    if not well_formed:
        rec["reference"].update({"picked": None, "picked_tier": None, "extracted": None, "resolved": True,
                                  "note": f"{pick!r} extraction was malformed (F3a) — fell back to drafting fresh"})
        append_history(rec, actor, "reference_extraction_malformed", pick)
        save(rec)
        print(f"⚠ {sid} {pick!r} extraction malformed (F3a) — falling back to drafting fresh")
        return

    rec["reference"].update({"picked": pick, "picked_tier": entry["tier"], "extracted": extracted, "resolved": True})
    append_history(rec, actor, "reference_picked", f"{pick} ({entry['tier']})")
    save(rec)
    print(f"✓ {sid} reference resolved: {entry['name']} ({entry['tier']}) — extracted")


# ── Stage 1 cont'd — Generation (hard-fail path; soft-fail handled by review) ─
def cmd_generate(args: list[str], sid: str):
    actor = _opt(args, "--actor") or "operator"
    rec = load(sid)
    require(rec["status"] == "trigger", f"{sid} is {rec['status']} — generate only runs pre-review")
    require(rec["input"]["type"] == "url", f"{sid} input is text — no code-gen step applies, go straight to draft")
    require(bool(rec["capture"]["screenshot_path"]), f"{sid} has no screenshot yet — run `capture {sid}` first")
    require(rec["reference"]["resolved"], f"{sid} hasn't resolved Stage 2 yet — run `reference {sid} --skip` or `--pick <ref_id>` first")

    gen = rec["generation"]
    if gen["fail_streak"] >= GENERATE_ATTEMPT_CAP:
        die(f"{sid} generation already escalated after {GENERATE_ATTEMPT_CAP} consecutive failed attempts — needs a human look, not another retry")

    result = s2c.generate_code(rec["capture"]["screenshot_path"])
    gen["attempts"] += 1
    for w in getattr(result, "warnings", []):
        print(f"  ⚠ {w}", file=sys.stderr)
    if result.ok:
        gen.update({"code": result.code, "stack": result.stack, "stub": result.stub, "last_error": None, "fail_streak": 0})
        rec["status"] = "review"
        append_history(rec, actor, "generate_ok", f"stub={result.stub}")
        save(rec)
        tag = " [STUB — placeholder code, no live deployment]" if result.stub else ""
        print(f"✓ {sid} code generated{tag} — status=review (F6b gate: run `review {sid} --decision ...`)")
    else:
        gen["last_error"] = result.error
        gen["fail_streak"] += 1
        remaining = GENERATE_ATTEMPT_CAP - gen["fail_streak"]
        if remaining <= 0:
            gen["escalated"] = True
        append_history(rec, actor, "generate_failed", result.error or "")
        save(rec)
        if remaining > 0:
            print(f"✗ {sid} generate failed ({result.error}) — {remaining} retry attempt(s) left, re-run `generate {sid}`", file=sys.stderr)
        else:
            print(f"✗ {sid} generate failed {GENERATE_ATTEMPT_CAP}x ({result.error}) — escalated, needs a human look", file=sys.stderr)
        sys.exit(1)


# ── F6b — soft-failure review gate ──────────────────────────────────────────
def cmd_review(args: list[str], sid: str):
    decision = _opt(args, "--decision")
    note = _opt(args, "--note") or ""
    actor = _opt(args, "--actor") or "operator"
    require(decision in ("approve", "regenerate", "adjust-input", "abandon"),
            "review needs --decision approve|regenerate|adjust-input|abandon")
    rec = load(sid)
    require(rec["status"] == "review", f"{sid} is {rec['status']} — nothing pending review")

    if decision == "approve":
        rec["status"] = "draft_ready"
        rec["review"] = {"decision": "approve", "regenerate_count": rec["review"]["regenerate_count"], "note": note}
        append_history(rec, actor, "review_approved", note)
        save(rec)
        print(f"✓ {sid} approved — status=draft_ready")
        return

    if decision == "regenerate":
        count = rec["review"]["regenerate_count"] + 1
        if count > REGENERATE_FREE_CAP and not _has(args, "--confirm-override"):
            die(
                f"{sid} has already regenerated {rec['review']['regenerate_count']} times (F6c free cap "
                f"is {REGENERATE_FREE_CAP}) — re-run with --confirm-override to spend on another attempt, "
                f"same discipline as a budget-drift re-confirm."
            )
        rec["review"]["regenerate_count"] = count
        rec["review"]["note"] = note
        rec["status"] = "trigger"  # back to `generate` — capture/screenshot is kept, NOT re-captured or re-billed
        append_history(rec, actor, "review_regenerate", f"count={count} note={note}")
        save(rec)
        print(f"✓ {sid} sent back for regeneration (attempt {count}) — status=trigger, run `generate {sid}`")
        return

    if decision == "adjust-input":
        require(bool(note), 'adjust-input needs --note "<what was wrong with the brief>"')
        rec["capture"] = {"attempts": 0, "screenshot_path": None, "stub": None, "escalated": False, "last_error": None}
        rec["generation"] = {"attempts": 0, "code": None, "stack": None, "stub": None, "escalated": False, "last_error": None}
        rec["review"]["note"] = note
        rec["status"] = "trigger"
        append_history(rec, actor, "review_adjust_input", note)
        save(rec)
        print(f"✓ {sid} brief flagged wrong ({note}) — capture+generation cleared, status=trigger. "
              f"Run `input {sid} --value ...` then `capture`/`generate` again.")
        return

    # abandon
    rec["status"] = "abandoned"
    rec["review"] = {"decision": "abandon", "regenerate_count": rec["review"]["regenerate_count"], "note": note}
    append_history(rec, actor, "review_abandoned", note)
    save(rec)
    print(f"✓ {sid} abandoned at review — terminal, no design.md, no PRD")


# ── Stage 3 — design.md ─────────────────────────────────────────────────────
def cmd_draft(args: list[str], sid: str):
    actor = _opt(args, "--actor") or "operator"
    rec = load(sid)
    text_bypass = rec["input"]["type"] == "text" and rec["status"] == "trigger"
    require(rec["status"] == "draft_ready" or text_bypass,
            f"{sid} is {rec['status']} — draft needs draft_ready (or trigger with text-only input)")

    lines = [
        f"# design.md — session {sid}",
        "",
        f"_Generated by cli/design.py `draft` at {now_iso()}. Facts only — nothing inferred beyond what's below._",
        "",
        "## Input",
        f"- type: {rec['input']['type']}",
        f"- value: {rec['input']['value']}",
    ]
    if rec["input"].get("thin_confirmed"):
        lines.append("- ⚠ flagged low-confidence: text input was under 40 chars, operator confirmed proceeding anyway (F1c)")
    if rec["reference"].get("extracted"):
        ref = rec["reference"]["extracted"]
        lines += ["", "## Reference (Stage 2)",
                   f"- {ref['name']} ({ref['tier']} tier, {ref['category']})",
                   f"- license: {ref.get('license') or 'unconfirmed — operator override used'}",
                   f"- source: {ref.get('source') or '(none recorded)'}"]
        if rec["reference"].get("competing_input"):
            lines.append(f"- competing input given, template led (F2d): {rec['reference']['competing_input']}")
    elif rec["reference"].get("note"):
        lines += ["", "## Reference (Stage 2)", f"- {rec['reference']['note']}"]
    if rec["capture"]["screenshot_path"]:
        lines += ["", "## Capture", f"- screenshot: {rec['capture']['screenshot_path']}",
                   f"- stub: {rec['capture']['stub']}", f"- attempts: {rec['capture']['attempts']}"]
    if rec["generation"]["code"]:
        stub_note = " (STUB — no live deployment, placeholder only)" if rec["generation"]["stub"] else ""
        lines += ["", f"## Generated code{stub_note}", f"stack: {rec['generation']['stack']}", "",
                   "```", rec["generation"]["code"], "```"]
    if rec["review"]["decision"]:
        lines += ["", "## Review", f"- decision: {rec['review']['decision']}",
                   f"- regenerate_count: {rec['review']['regenerate_count']}",
                   f"- note: {rec['review']['note'] or '(none)'}"]
    lines.append("")

    md_path = SESSIONS / f"{sid}-design.md"
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text("\n".join(lines))

    rec["design_md"]["path"] = _rel(md_path)
    rec["status"] = "spend"
    append_history(rec, actor, "drafted", _rel(md_path))
    save(rec)
    print(f"✓ {sid} design.md written: {_rel(md_path)} — status=spend")


# ── Stage 4 — Spend estimate + gate ─────────────────────────────────────────
def _load_pricing() -> tuple[dict, str, list[str]]:
    defaults = {"screenshot_capture_usd": 0.0, "code_gen_usd": 0.0}
    if PRICING_FILE.exists():
        try:
            configured = json.loads(PRICING_FILE.read_text())
            merged = {**defaults, **configured}
            return merged, "configured", []
        except json.JSONDecodeError as e:
            return defaults, "default-zero-unconfigured", [f"pricing.json exists but failed to parse ({e}) — using $0 defaults"]
    return defaults, "default-zero-unconfigured", [
        f"no {_rel(PRICING_FILE)} found — every figure below is $0 by default, not a real "
        f"estimate. Fill in real per-call costs before trusting this for a paid deployment."
    ]


def cmd_estimate(args: list[str], sid: str):
    rec = load(sid)
    require(rec["status"] == "spend", f"{sid} is {rec['status']} — estimate only runs at spend")

    pricing, source, warnings = _load_pricing()
    used_capture = bool(rec["capture"]["screenshot_path"]) and not rec["capture"].get("stub")
    gen_attempts_billed = rec["generation"]["attempts"] if not rec["generation"].get("stub") else 0
    if rec["capture"].get("stub") or rec["generation"].get("stub"):
        warnings.append("this session used stub-mode calls (no live deployment) — those are not billed and are excluded from the estimate")

    total = (pricing["screenshot_capture_usd"] if used_capture else 0.0) + gen_attempts_billed * pricing["code_gen_usd"]

    rec["spend"] = {"estimate_usd": round(total, 4), "pricing_source": source, "warnings": warnings, "decision": None}
    append_history(rec, "system", "estimated", f"${total:.4f} ({source})")
    save(rec)
    print(f"✓ {sid} estimate: ${total:.4f} (pricing: {source})")
    for w in warnings:
        print(f"  ⚠ {w}")


def cmd_approve_spend(args: list[str], sid: str):
    actor = _opt(args, "--actor") or "operator"
    rec = load(sid)
    require(rec["status"] == "spend", f"{sid} is {rec['status']} — nothing pending spend approval")
    require(rec["spend"]["estimate_usd"] is not None, f"{sid} has no estimate yet — run `estimate {sid}` first")
    rec["spend"]["decision"] = "approved"
    rec["status"] = "ready"
    append_history(rec, actor, "spend_approved", f"${rec['spend']['estimate_usd']:.4f}")
    save(rec)
    print(f"✓ {sid} spend approved — status=ready. Run `handoff {sid}` when ready for Stage 7's PRD generation.")


def cmd_decline_spend(args: list[str], sid: str):
    actor = _opt(args, "--actor") or "operator"
    rec = load(sid)
    require(rec["status"] == "spend", f"{sid} is {rec['status']} — nothing pending spend approval")
    require(rec["spend"]["estimate_usd"] is not None, f"{sid} has no estimate yet — run `estimate {sid}` first")
    rec["spend"]["decision"] = "declined"
    rec["status"] = "declined"
    append_history(rec, actor, "spend_declined", "")
    save(rec)
    print(f"✓ {sid} declined at spend gate — terminal. design.md kept at {rec['design_md']['path']}, no further generation, no PRD.")


# ── Bridge to existing Stage 7 (dashboard/lib/prd-generator.ts, unchanged) ──
def cmd_handoff(args: list[str], sid: str):
    allow_stub = _has(args, "--allow-stub")
    title = _opt(args, "--title") or f"design session {sid}"
    rec = load(sid)
    require(rec["status"] == "ready", f"{sid} is {rec['status']} — handoff needs status=ready")

    used_stub = bool(rec["capture"].get("stub") or rec["generation"].get("stub"))
    if used_stub and not allow_stub:
        die(
            f"{sid} used stub-mode screenshot-to-code calls (no live deployment) — refusing to hand off "
            f"a mocked run as if it were real design work. Deploy screenshot-to-code (see "
            f"vps-scripts/deploy-screenshot-to-code.sh) and set SCREENSHOT_TO_CODE_URL, or re-run with "
            f"--allow-stub to proceed anyway for a dry-run/test."
        )

    md_path = SESSIONS / f"{sid}-design.md"
    require(md_path.exists(), f"{sid} has no design.md on disk at {md_path} — run `draft {sid}` first")
    design_md = md_path.read_text()

    transcript = [
        f"# {title}",
        "",
        "This transcript is the pre-PRD design-first discussion for a chat-converted task "
        "(docs/PRD-design-first-workflow.md). It is NOT a PRD — hand this whole block to "
        "dashboard/lib/prd-generator.ts's generatePrd(title, summary) as the `summary` argument "
        "so the PRD is still generated fresh, same as every other chat-converted task.",
        "",
        f"## Design session {sid}",
        f"- input: {rec['input']['type']} — {rec['input']['value']}",
        f"- spend approved: ${rec['spend']['estimate_usd']:.4f} ({rec['spend']['pricing_source']})",
        f"- stub-mode used: {used_stub}{' (--allow-stub dry-run)' if used_stub else ''}",
        "",
        "## design.md",
        "",
        design_md,
    ]
    out = "\n".join(transcript)
    out_path = SESSIONS / f"{sid}-handoff.md"
    out_path.write_text(out)

    rec["status"] = "handed_off"
    append_history(rec, "operator", "handed_off", _rel(out_path))
    save(rec)
    print(out)
    print(f"\n✓ {sid} handed off — status=handed_off. Transcript also saved to {_rel(out_path)}", file=sys.stderr)


# ── Inspection ───────────────────────────────────────────────────────────────
def cmd_status(args: list[str]):
    if args and not args[0].startswith("--"):
        rec = load(args[0])
        print(json.dumps(rec, indent=2))
        return
    cmd_list([])


def cmd_list(args: list[str]):
    SESSIONS.mkdir(parents=True, exist_ok=True)
    out = []
    for p in sorted(SESSIONS.glob("*.json")):
        try:
            rec = json.loads(p.read_text())
            out.append({"id": rec["id"], "status": rec["status"], "input_type": rec["input"]["type"],
                        "created_at": rec["created_at"], "updated_at": rec.get("updated_at")})
        except (json.JSONDecodeError, KeyError):
            continue
    print(json.dumps(out, indent=2))


def cmd_validate(args: list[str]) -> int:
    SESSIONS.mkdir(parents=True, exist_ok=True)
    ids = [args[0]] if args and not args[0].startswith("--") else [p.stem for p in SESSIONS.glob("*.json")]
    bad = []
    for sid in ids:
        try:
            rec = load(sid)
        except SystemExit:
            bad.append(sid)
            continue
        st = rec.get("status")
        if st not in STATES and st not in TERMINAL:
            bad.append(f"{sid} (unknown status {st})")
    if bad:
        print("✗ invalid: " + ", ".join(bad), file=sys.stderr)
        return 1
    print(f"✓ {len(ids)} design-session(s) valid")
    return 0


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 1
    cmd, rest = argv[0], argv[1:]
    try:
        if cmd == "new":
            cmd_new(rest)
        elif cmd == "input":
            sid, rest2 = resolve_id(rest); cmd_input(rest2, sid)
        elif cmd == "capture":
            sid, rest2 = resolve_id(rest); cmd_capture(rest2, sid)
        elif cmd == "reference":
            sid, rest2 = resolve_id(rest); cmd_reference(rest2, sid)
        elif cmd == "generate":
            sid, rest2 = resolve_id(rest); cmd_generate(rest2, sid)
        elif cmd == "review":
            sid, rest2 = resolve_id(rest); cmd_review(rest2, sid)
        elif cmd == "draft":
            sid, rest2 = resolve_id(rest); cmd_draft(rest2, sid)
        elif cmd == "estimate":
            sid, rest2 = resolve_id(rest); cmd_estimate(rest2, sid)
        elif cmd == "approve-spend":
            sid, rest2 = resolve_id(rest); cmd_approve_spend(rest2, sid)
        elif cmd == "decline-spend":
            sid, rest2 = resolve_id(rest); cmd_decline_spend(rest2, sid)
        elif cmd == "handoff":
            sid, rest2 = resolve_id(rest); cmd_handoff(rest2, sid)
        elif cmd == "status":
            cmd_status(rest)
        elif cmd == "list":
            cmd_list(rest)
        elif cmd == "validate":
            return cmd_validate(rest)
        else:
            print(__doc__)
            return 1
    except SystemExit as e:
        return int(e.code or 0)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
