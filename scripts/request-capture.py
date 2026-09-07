#!/usr/bin/env python3
# request-capture.py — dispatch a capture job to the capture worker (2026-09-07).
#
# The agent-side half of scripts/capture-worker.py: enqueue a job on the VPS
# queue, optionally wait, and fetch the finished capture bundle back to
# workspaces/_reference-captures/<out>. This is what a VPS agent (or an
# operator) calls — the stealth headed browser runs on the worker machine,
# never on the VPS and never inside the agent.
#
# Usage:
#   python scripts/request-capture.py --url https://example.com --out my-capture
#   python scripts/request-capture.py --url ... --out ... --wait [--timeout 900]
#   python scripts/request-capture.py --fetch <job-id> --out my-capture
# Env: CAPTURE_SSH_TARGET / CAPTURE_QUEUE / CAPTURE_POLL_SECS (shared with the worker)
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
import uuid

REPO = pathlib.Path(__file__).resolve().parents[1]
CAPTURES_ROOT = REPO / "workspaces" / "_reference-captures"
SSH_TARGET = os.environ.get("CAPTURE_SSH_TARGET", "root@hermes.yvon.in")
QUEUE = os.environ.get("CAPTURE_QUEUE", "/root/capture-queue")
POLL_SECS = int(os.environ.get("CAPTURE_POLL_SECS", "15"))

_Q = shlex.quote


def _ssh(*args: str, check: bool = True, timeout: int = 60) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", SSH_TARGET, *args],
            capture_output=True, text=True, check=check, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return subprocess.CompletedProcess(args, 124, stdout="", stderr=f"ssh timed out after {timeout}s")


def _scp_from(remote: str, local: pathlib.Path) -> None:
    subprocess.run(
        ["scp", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", f"{SSH_TARGET}:{remote}", str(local)],
        capture_output=True, text=True, check=True, timeout=1800,
    )


def enqueue(url: str, out: str, dismiss: list[str], width: int, height: int, requested_by: str) -> str:
    job_id = f"{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"
    job = {"id": job_id, "url": url, "out": out, "dismiss": dismiss,
           "width": width, "height": height, "requested_by": requested_by}
    payload = json.dumps(job)
    _ssh(f"mkdir -p {QUEUE}/pending && cat > {QUEUE}/pending/{job_id}.json <<'EOF'\n{payload}\nEOF")
    return job_id


def locate_result(job_id: str) -> tuple[str, dict] | None:
    """Returns ('done'|'failed', result-json) once the job leaves the queues."""
    for status in ("done", "failed"):
        r = _ssh(f"cat {QUEUE}/{status}/{job_id}.result.json 2>/dev/null", check=False)
        if r.returncode == 0 and r.stdout.strip():
            try:
                return status, json.loads(r.stdout)
            except Exception:
                return status, {"raw": r.stdout[-400:]}
    return None


def fetch_bundle(job_id: str, out: str) -> pathlib.Path:
    dest = CAPTURES_ROOT / out
    dest.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        tgz = pathlib.Path(td) / f"{job_id}.tar.gz"
        _scp_from(f"{QUEUE}/captures/{job_id}.tar.gz", tgz)
        with tarfile.open(tgz, "r:gz") as tf:
            tf.extractall(CAPTURES_ROOT)  # noqa: S202 — bundle is our own worker's output
    return dest


def main() -> int:
    ap = argparse.ArgumentParser(description="Dispatch a reference-capture job to the capture worker")
    ap.add_argument("--url")
    ap.add_argument("--out", required=True, help="capture dir name under workspaces/_reference-captures/")
    ap.add_argument("--dismiss", action="append", default=None, help="consent button label; repeatable")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--height", type=int, default=900)
    ap.add_argument("--requested-by", default="operator")
    ap.add_argument("--wait", action="store_true", help="poll until the job finishes")
    ap.add_argument("--timeout", type=int, default=900, help="--wait budget in seconds")
    ap.add_argument("--fetch", help="job id: download an already-finished bundle to --out")
    args = ap.parse_args()

    if args.fetch:
        status, result = locate_result(args.fetch) or (None, None)
        if status != "done":
            print(json.dumps({"ok": False, "job": args.fetch, "status": status, "result": result}, indent=1))
            return 1
        dest = fetch_bundle(args.fetch, args.out)
        print(json.dumps({"ok": True, "job": args.fetch, "extractedTo": str(dest), "result": result}, indent=1))
        return 0

    if not args.url:
        ap.error("--url is required (or use --fetch <job-id>)")

    job_id = enqueue(args.url, args.out, args.dismiss or [], args.width, args.height, args.requested_by)
    print(json.dumps({"ok": True, "job": job_id, "queued": True, "queue": f"{SSH_TARGET}:{QUEUE}"}, indent=1))
    if not args.wait:
        return 0

    t0 = time.time()
    while time.time() - t0 < args.timeout:
        located = locate_result(job_id)
        if located:
            status, result = located
            payload = {"ok": status == "done", "job": job_id, "status": status, "result": result}
            if status == "done":
                dest = fetch_bundle(job_id, args.out)
                payload["extractedTo"] = str(dest)
            print(json.dumps(payload, indent=1))
            return 0 if status == "done" else 2
        time.sleep(POLL_SECS)
    print(json.dumps({"ok": False, "job": job_id, "status": "timeout", "seconds": args.timeout}, indent=1))
    return 3


if __name__ == "__main__":
    sys.exit(main())
