#!/usr/bin/env python3
# capture-worker.py — local scrape worker for the fleet (2026-09-07).
#
# WHY: Akamai-class bot walls deny every SERVER-side scraping path the fleet
# has (proof matrix: Teams/Shared OS/tools/shared-tool-registry.md — Jina,
# HeadlessX/Camoufox, crawl4ai, headless stealth — all 403). They pass only
# for a real HEADED browser on a RESIDENTIAL IP. This worker runs on such a
# machine and closes the loop for live operation:
#
#   VPS agent (hermes/ops)  --enqueue job-->  VPS queue dir
#   capture-worker (this machine, polls over ssh) --claims job-->
#   runs scripts/capture-reference.py (its OWN private stealth Edge — never
#   the user's browser) --uploads capture bundle--> VPS queue/captures
#
# QUEUE LAYOUT on the VPS:
#   <queue>/pending/<id>.json   jobs waiting
#   <queue>/running/<id>.json   claimed
#   <queue>/done/<id>.json (+ <id>.result.json + captures/<id>.tar.gz)
#   <queue>/failed/<id>.json (+ <id>.result.json)
#
# JOB JSON: {"id","url","out","dismiss":[...],"width":1440,"height":900,
#            "requested_by":"..."}
#
# Usage:
#   python scripts/capture-worker.py --once     # drain one pass, exit
#   python scripts/capture-worker.py            # poll forever (default 60s)
# Env: CAPTURE_SSH_TARGET (default root@hermes.yvon.in)
#      CAPTURE_QUEUE       (default /root/capture-queue)
#      CAPTURE_POLL_SECS   (default 60)
#
# Owner: mia/dev · reference-capture for Akamai-class sites, 2026-09-07

import argparse
import json
import os
import pathlib
import shlex
import subprocess
import sys
import tarfile
import tempfile
import time

REPO = pathlib.Path(__file__).resolve().parents[1]
CAPTURES_ROOT = REPO / "workspaces" / "_reference-captures"
SSH_TARGET = os.environ.get("CAPTURE_SSH_TARGET", "root@hermes.yvon.in")
QUEUE = os.environ.get("CAPTURE_QUEUE", "/root/capture-queue")
POLL_SECS = int(os.environ.get("CAPTURE_POLL_SECS", "60"))
CAPTURE_TIMEOUT_SECS = int(os.environ.get("CAPTURE_TIMEOUT_SECS", "900"))

_Q = shlex.quote


def _ssh(*args: str, check: bool = True, timeout: int = 60) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", SSH_TARGET, *args],
            capture_output=True, text=True, check=check, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        # surface as a failed CompletedProcess so callers report, not crash
        return subprocess.CompletedProcess(args, 124, stdout="", stderr=f"ssh timed out after {timeout}s")


def _scp_to(local: pathlib.Path, remote: str) -> None:
    subprocess.run(
        ["scp", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", str(local), f"{SSH_TARGET}:{remote}"],
        capture_output=True, text=True, check=True, timeout=600,
    )


def setup_queue() -> None:
    _ssh(f"mkdir -p {QUEUE}/pending {QUEUE}/running {QUEUE}/done {QUEUE}/failed {QUEUE}/captures")


def list_pending() -> list[str]:
    r = _ssh(f"ls -1 {QUEUE}/pending 2>/dev/null", check=False)
    # return bare job ids (no .json) — every helper appends the extension
    return [line[:-5] for line in r.stdout.split() if line.endswith(".json")]


def claim(job_id: str) -> bool:
    # no 2>/dev/null here — a failed claim must show WHY (observed silent
    # failure during the first smoke run; stderr is the only witness)
    r = _ssh(f"mv {QUEUE}/pending/{job_id}.json {QUEUE}/running/ && echo CLAIMED", check=False)
    if "CLAIMED" not in r.stdout:
        print(f"[capture-worker] claim {job_id} failed rc={r.returncode}: {(r.stderr or r.stdout).strip()[:200]}", flush=True)
        return False
    return True


def read_job(job_id: str) -> dict | None:
    r = _ssh(f"cat {QUEUE}/running/{job_id}.json", check=False)
    try:
        return json.loads(r.stdout)
    except Exception:
        return None


def finish(job_id: str, ok: bool, result: dict) -> None:
    status = "done" if ok else "failed"
    with tempfile.TemporaryDirectory() as td:
        rp = pathlib.Path(td) / f"{job_id}.result.json"
        rp.write_text(json.dumps(result, indent=1), encoding="utf-8")
        _scp_to(rp, f"{QUEUE}/{status}/{job_id}.result.json")
    _ssh(f"mv {QUEUE}/running/{job_id}.json {QUEUE}/{status}/ 2>/dev/null")


def run_capture(job: dict, out_name: str) -> dict:
    out_dir = CAPTURES_ROOT / out_name
    cmd = [
        sys.executable, str(REPO / "scripts" / "capture-reference.py"),
        "--url", str(job["url"]),
        "--out", str(out_dir),
        "--width", str(int(job.get("width", 1440))),
        "--height", str(int(job.get("height", 900))),
    ]
    for label in job.get("dismiss", []) or []:
        cmd += ["--dismiss", str(label)]
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                          errors="replace", timeout=CAPTURE_TIMEOUT_SECS)
    if proc.returncode != 0 or not (out_dir / "reference.html").exists():
        raise RuntimeError(f"capture failed rc={proc.returncode}: {(proc.stderr or proc.stdout)[-400:]}")
    # the summary JSON is nice-to-have — the bundle (reference.html + assets
    # + manifest) is the deliverable. The child prints pretty-printed JSON
    # (multi-line), possibly with tool chatter around it: whole-parse first,
    # then the block from the first '{', then single lines.
    summary: dict = {}
    text = (proc.stdout or "").strip()
    for candidate in (
        text,
        text[text.find("{"):] if "{" in text else "",
        *(line for line in reversed(text.splitlines())),
    ):
        candidate = (candidate or "").strip()
        if not candidate:
            continue
        try:
            parsed = json.loads(candidate)
        except Exception:
            continue
        if isinstance(parsed, dict):
            summary = parsed
            break
    if not summary:
        print(f"[capture-worker] note: no JSON summary in child stdout (tail: {text[-160:]!r})", flush=True)
    summary["out_name"] = out_name
    return summary


def upload_bundle(job_id: str, out_name: str) -> str:
    """tar the capture dir -> scp to the VPS queue."""
    src = CAPTURES_ROOT / out_name
    remote_rel = f"{QUEUE}/captures/{job_id}.tar.gz"
    with tempfile.TemporaryDirectory() as td:
        tgz = pathlib.Path(td) / f"{job_id}.tar.gz"
        with tarfile.open(tgz, "w:gz") as tf:
            tf.add(src, arcname=out_name)
        _scp_to(tgz, remote_rel)
        return remote_rel


def process_one(job_id: str) -> bool:
    if not claim(job_id):
        return False
    job = read_job(job_id)
    if not job or not job.get("url"):
        finish(job_id, False, {"error": "unreadable job (no url)"})
        return True
    print(f"[capture-worker] job {job_id}: {job['url']}", flush=True)
    t0 = time.time()
    out_name = "".join(c if c.isalnum() or c in "-_" else "-" for c in str(job.get("out", "capture")))[:60]
    try:
        summary = run_capture(job, out_name)
        bundle = upload_bundle(job_id, out_name)
        summary["bundle"] = bundle
        summary["seconds"] = round(time.time() - t0, 1)
        finish(job_id, True, summary)
        print(f"[capture-worker] job {job_id}: done in {summary['seconds']}s", flush=True)
    except Exception as e:  # noqa: BLE001 — any failure must land in failed/, loudly
        finish(job_id, False, {"error": str(e), "seconds": round(time.time() - t0, 1)})
        print(f"[capture-worker] job {job_id}: FAILED — {e}", flush=True)
    return True


def drain_once() -> int:
    try:
        ids = list_pending()
    except Exception as e:  # noqa: BLE001 — ssh hiccup: report, keep the loop alive
        print(f"[capture-worker] queue unreachable: {e}", flush=True)
        return 0
    processed = 0
    for job_id in ids:
        if process_one(job_id):
            processed += 1
    return processed


def main() -> int:
    ap = argparse.ArgumentParser(description="Local stealth capture worker (polls the VPS capture queue)")
    ap.add_argument("--once", action="store_true", help="drain one pass and exit")
    args = ap.parse_args()

    setup_queue()
    if args.once:
        n = drain_once()
        print(f"[capture-worker] pass complete - {n} job(s) processed", flush=True)
        return 0
    print(f"[capture-worker] polling {SSH_TARGET}:{QUEUE} every {POLL_SECS}s — Ctrl+C to stop", flush=True)
    while True:
        drain_once()
        time.sleep(POLL_SECS)


if __name__ == "__main__":
    sys.exit(main())
