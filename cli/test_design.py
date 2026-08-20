#!/usr/bin/env python3
"""test_design.py — scratch-dir regression test for cli/design.py's
design-first workflow MVP state machine (docs/PRD-design-first-workflow.md).

Runs entirely against a throwaway DESIGN_SESSIONS_DIR (never touches
store/design-sessions/ for real records), in stub mode (SCREENSHOT_TO_CODE_URL
left unset) so it needs no live deployment and no network. Plain asserts +
prints, no pytest dependency — same convention as cli/test_task.py.

Usage: python3 cli/test_design.py
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DESIGN_PY = ROOT / "cli" / "design.py"

PASS, FAIL = [], []


CURATED_FIXTURE = {
    "entries": [
        {"id": "fresh-licensed", "name": "Fresh Licensed Co", "category": "SaaS", "license": "Apache-2.0",
         "source": "fixture", "added_at": "2026-08-19"},
        {"id": "stale-licensed", "name": "Stale Licensed Co", "category": "SaaS", "license": "Apache-2.0",
         "source": "fixture", "added_at": "2026-01-01"},
        {"id": "fresh-unlicensed", "name": "Fresh Unlicensed Co", "category": "SaaS", "license": None,
         "source": "fixture", "added_at": "2026-08-19"},
    ]
}


def run(scratch: Path, *args: str, curated_file: Path | None = None, extra_env: dict | None = None) -> subprocess.CompletedProcess:
    env = dict(os.environ)
    env.pop("SCREENSHOT_TO_CODE_URL", None)  # force stub mode
    env.pop("OPEN_DESIGN_URL", None)         # force F2a degrade (curated-only) unless a test opts in
    env.pop("OD_API_TOKEN", None)
    env["DESIGN_SESSIONS_DIR"] = str(scratch)
    # Curated fixtures live in a sibling dir, never inside DESIGN_SESSIONS_DIR —
    # `validate`/`list` glob *.json directly under it and would otherwise
    # misparse a curated-catalog file as a malformed session record.
    fixtures_dir = scratch.parent / f"{scratch.name}-fixtures"
    env["CURATED_REFERENCES_FILE"] = str(curated_file or (fixtures_dir / "curated-references.json"))
    if extra_env:
        env.update(extra_env)
    return subprocess.run(
        [sys.executable, str(DESIGN_PY), *args],
        cwd=str(ROOT), env=env, capture_output=True, text=True,
    )


def check(name: str, cond: bool, detail: str = ""):
    if cond:
        PASS.append(name)
    else:
        FAIL.append(f"{name}  {detail}")


def new_session(scratch: Path, input_type: str = "url", value: str = "https://example.com") -> str:
    r = run(scratch, "new", "--input", input_type, "--value", value)
    assert r.returncode == 0, r.stderr
    return r.stdout.split()[2]


def status(scratch: Path, sid: str) -> dict:
    r = run(scratch, "status", sid)
    return json.loads(r.stdout)


def main() -> int:
    scratch = Path(tempfile.mkdtemp(prefix="design-py-test-"))
    fixtures_dir = scratch.parent / f"{scratch.name}-fixtures"
    fixtures_dir.mkdir(parents=True, exist_ok=True)
    (fixtures_dir / "curated-references.json").write_text(json.dumps(CURATED_FIXTURE))
    try:
        # ── 1. Scenario A happy path: url -> capture -> reference(skip) ->
        #      generate -> review approve -> draft -> estimate ->
        #      approve-spend -> handoff ──────────────────────────────────
        sid = new_session(scratch)
        check("new creates status=trigger", status(scratch, sid)["status"] == "trigger")

        r = run(scratch, "capture", sid)
        check("capture succeeds in stub mode", r.returncode == 0, r.stderr)
        check("capture records a screenshot_path", bool(status(scratch, sid)["capture"]["screenshot_path"]))
        check("capture flags stub=True honestly", status(scratch, sid)["capture"]["stub"] is True)

        r = run(scratch, "generate", sid)
        check("generate is blocked before Stage 2 resolves (F2)", r.returncode != 0)

        r = run(scratch, "reference", sid, "--skip")
        check("reference --skip succeeds", r.returncode == 0, r.stderr)
        rec = status(scratch, sid)
        check("reference --skip resolves with no pick", rec["reference"]["resolved"] is True and rec["reference"]["picked"] is None)
        check("reference degrades to curated-only when OPEN_DESIGN_URL unset (F2a)", rec["reference"]["live_reachable"] is False)

        r = run(scratch, "generate", sid)
        check("generate succeeds in stub mode", r.returncode == 0, r.stderr)
        rec = status(scratch, sid)
        check("generate transitions trigger -> review", rec["status"] == "review", rec["status"])
        check("generate flags stub=True honestly", rec["generation"]["stub"] is True)

        r = run(scratch, "review", sid, "--decision", "approve")
        check("review approve succeeds", r.returncode == 0, r.stderr)
        check("review approve transitions review -> draft_ready", status(scratch, sid)["status"] == "draft_ready")

        r = run(scratch, "draft", sid)
        check("draft succeeds", r.returncode == 0, r.stderr)
        rec = status(scratch, sid)
        check("draft transitions draft_ready -> spend", rec["status"] == "spend", rec["status"])
        design_md_path = ROOT / rec["design_md"]["path"]
        check("draft writes a real design.md file", design_md_path.exists())

        r = run(scratch, "estimate", sid)
        check("estimate succeeds", r.returncode == 0, r.stderr)
        rec = status(scratch, sid)
        check("estimate is $0 with no pricing.json configured (honest default)", rec["spend"]["estimate_usd"] == 0.0, rec["spend"])
        check("estimate warns when pricing is unconfigured", len(rec["spend"]["warnings"]) > 0)

        r = run(scratch, "approve-spend", sid)
        check("approve-spend succeeds", r.returncode == 0, r.stderr)
        check("approve-spend transitions spend -> ready", status(scratch, sid)["status"] == "ready")

        r = run(scratch, "handoff", sid, "--allow-stub")
        check("handoff refuses without --allow-stub, succeeds with it", r.returncode == 0, r.stderr)
        check("handoff transitions ready -> handed_off", status(scratch, sid)["status"] == "handed_off")
        check("handoff output explicitly says it is NOT a PRD", "NOT a PRD" in r.stdout)
        handoff_path = scratch / f"{sid}-handoff.md"
        check("handoff writes a transcript file", handoff_path.exists())

        # ── 2. handoff without --allow-stub is refused (never silently ship a mock) ─
        sid2 = new_session(scratch)
        run(scratch, "capture", sid2)
        run(scratch, "reference", sid2, "--skip")
        run(scratch, "generate", sid2)
        run(scratch, "review", sid2, "--decision", "approve")
        run(scratch, "draft", sid2)
        run(scratch, "estimate", sid2)
        run(scratch, "approve-spend", sid2)
        r = run(scratch, "handoff", sid2)
        check("handoff without --allow-stub refuses a stub-sourced session", r.returncode != 0)
        check("status stays ready after refused handoff", status(scratch, sid2)["status"] == "ready")

        # ── 3. F6b gate: regenerate loop, capped at 3, then requires --confirm-override ─
        sid3 = new_session(scratch)
        run(scratch, "capture", sid3)
        run(scratch, "reference", sid3, "--skip")
        run(scratch, "generate", sid3)
        for i in range(3):
            r = run(scratch, "review", sid3, "--decision", "regenerate", "--note", f"pass {i}")
            check(f"regenerate #{i+1} within free cap succeeds", r.returncode == 0, r.stderr)
            run(scratch, "generate", sid3)
        r = run(scratch, "review", sid3, "--decision", "regenerate", "--note", "pass 4")
        check("regenerate beyond free cap is blocked without --confirm-override", r.returncode != 0)
        r = run(scratch, "review", sid3, "--decision", "regenerate", "--note", "pass 4", "--confirm-override")
        check("regenerate beyond free cap succeeds with --confirm-override", r.returncode == 0, r.stderr)

        # ── 4. F6b gate: abandon is terminal, no design.md/handoff possible ─
        sid4 = new_session(scratch)
        run(scratch, "capture", sid4)
        run(scratch, "reference", sid4, "--skip")
        run(scratch, "generate", sid4)
        r = run(scratch, "review", sid4, "--decision", "abandon", "--note", "wrong direction entirely")
        check("abandon succeeds", r.returncode == 0, r.stderr)
        check("abandon is terminal", status(scratch, sid4)["status"] == "abandoned")
        r = run(scratch, "draft", sid4)
        check("draft is blocked on an abandoned session", r.returncode != 0)

        # ── 5. Scenario E: spend gate declines cleanly, design.md kept ─────
        sid5 = new_session(scratch, "text", "a clean minimal pricing page with three tiers and a comparison table")
        r = run(scratch, "draft", sid5)
        check("text-only input bypasses capture/generate/review straight to draft", r.returncode == 0, r.stderr)
        run(scratch, "estimate", sid5)
        r = run(scratch, "decline-spend", sid5)
        check("decline-spend succeeds", r.returncode == 0, r.stderr)
        check("decline-spend is terminal (Scenario E)", status(scratch, sid5)["status"] == "declined")

        # ── 6. F1c: thin text input blocked without --confirm-thin ─────────
        r = run(scratch, "new", "--input", "text", "--value", "make it nice")
        check("thin text input is blocked by default (F1c)", r.returncode != 0)
        r = run(scratch, "new", "--input", "text", "--value", "make it nice", "--confirm-thin")
        check("thin text input proceeds with --confirm-thin", r.returncode == 0, r.stderr)

        # ── 8. Stage 2 (F2a-F2e): reference presentation ────────────────────
        # F2b — stale curated entry flagged
        sid8 = new_session(scratch)
        run(scratch, "capture", sid8)
        r = run(scratch, "reference", sid8)
        check("reference list-only call succeeds", r.returncode == 0, r.stderr)
        check("reference list-only does not resolve", status(scratch, sid8)["reference"]["resolved"] is False)
        lines_by_id = {ln.strip().split()[1]: ln for ln in r.stdout.splitlines() if ln.strip().startswith("- ")}
        check("F2b flags the stale entry", "STALE" in lines_by_id.get("stale-licensed", ""), r.stdout)
        check("F2b does not flag the fresh entry", "STALE" not in lines_by_id.get("fresh-licensed", "MISSING"), r.stdout)

        # F2c — unlicensed entry blocked without --confirm-unlicensed
        r = run(scratch, "reference", sid8, "--pick", "fresh-unlicensed")
        check("F2c blocks an unlicensed pick by default", r.returncode != 0)
        r = run(scratch, "reference", sid8, "--pick", "fresh-unlicensed", "--confirm-unlicensed")
        check("F2c proceeds with --confirm-unlicensed", r.returncode == 0, r.stderr)
        rec = status(scratch, sid8)
        check("unlicensed pick still resolves and extracts", rec["reference"]["resolved"] is True and rec["reference"]["picked"] == "fresh-unlicensed")
        design_note = rec["reference"]["extracted"]["license"]
        check("extracted record honestly carries the missing license (None)", design_note is None, design_note)

        # F2e — picked entry vanishes between list and pick
        sid9 = new_session(scratch)
        run(scratch, "capture", sid9)
        curated9 = fixtures_dir / f"curated-{sid9}.json"
        curated9.write_text(json.dumps(CURATED_FIXTURE))
        run(scratch, "reference", sid9, curated_file=curated9)  # RLIST — fresh-licensed is shown
        curated9.write_text(json.dumps({"entries": [e for e in CURATED_FIXTURE["entries"] if e["id"] != "fresh-licensed"]}))
        r = run(scratch, "reference", sid9, "--pick", "fresh-licensed", curated_file=curated9)
        check("F2e catches a reference that vanished since RLIST", r.returncode != 0)
        check("F2e error names the vanished reason", "no longer available" in (r.stdout + r.stderr), r.stdout + r.stderr)

        # Clean pick — reference not in curated fixture at all is rejected outright
        r = run(scratch, "reference", sid9, "--pick", "does-not-exist", curated_file=curated9)
        check("picking an id never shown is rejected", r.returncode != 0)

        # F2d — competing input, template leads vs. site leads
        sid10 = new_session(scratch)
        run(scratch, "capture", sid10)
        run(scratch, "reference", sid10)  # RLIST
        r = run(scratch, "reference", sid10, "--pick", "fresh-licensed", "--competing-input", "https://competitor.example.com")
        check("F2d requires --lead when --competing-input is given", r.returncode != 0)
        r = run(scratch, "reference", sid10, "--pick", "fresh-licensed", "--competing-input", "https://competitor.example.com", "--lead", "site")
        check("F2d site-leads drops the reference pick", r.returncode == 0, r.stderr)
        rec = status(scratch, sid10)
        check("F2d site-leads resolves with no pick", rec["reference"]["resolved"] is True and rec["reference"]["picked"] is None)
        check("F2d records the competing input + lead decision", rec["reference"]["competing_input"] and rec["reference"]["lead"] == "site")

        sid11 = new_session(scratch)
        run(scratch, "capture", sid11)
        run(scratch, "reference", sid11)
        r = run(scratch, "reference", sid11, "--pick", "fresh-licensed", "--competing-input", "https://competitor.example.com", "--lead", "template")
        check("F2d template-leads keeps the reference pick", r.returncode == 0, r.stderr)
        check("F2d template-leads resolves with the pick kept", status(scratch, sid11)["reference"]["picked"] == "fresh-licensed")

        # Reference content shows up in the drafted design.md
        run(scratch, "generate", sid11)
        run(scratch, "review", sid11, "--decision", "approve")
        run(scratch, "draft", sid11)
        design_md_text = (ROOT / status(scratch, sid11)["design_md"]["path"]).read_text()
        check("draft includes the extracted reference section", "## Reference (Stage 2)" in design_md_text and "Fresh Licensed Co" in design_md_text, design_md_text)

        # ── 7. validate ──────────────────────────────────────────────────
        r = run(scratch, "validate")
        check("validate passes on a scratch dir of only-valid sessions", r.returncode == 0, r.stderr)

    finally:
        import shutil
        shutil.rmtree(scratch, ignore_errors=True)
        shutil.rmtree(fixtures_dir, ignore_errors=True)

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
    for f in FAIL:
        print(f"  ✗ {f}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
