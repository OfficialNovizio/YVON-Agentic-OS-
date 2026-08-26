#!/usr/bin/env python3
"""test_open_design_client.py — regression test for cli/lib/open_design_client.py's
Stage 2 live-tier client (docs/PRD-design-first-workflow.md, F2a/F2e).

Runs a local mock HTTP server (background thread) shaped like the real
open-design daemon's `/api/design-systems` + `/api/design-systems/:id`
routes — never touches a real deployment. Plain asserts + prints, same
convention as the rest of cli/test_*.py.

Usage: python3 cli/test_open_design_client.py
"""
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import open_design_client as odc  # noqa: E402

PASS, FAIL = [], []


def check(name: str, cond: bool, detail: str = ""):
    if cond:
        PASS.append(name)
    else:
        FAIL.append(f"{name}  {detail}")


class MockDaemon:
    def __init__(self):
        self.entries = []
        self.status_override = None
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/api/design-systems":
                    body = json.dumps(outer.entries).encode("utf-8")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(body)
                    return
                if self.path.startswith("/api/design-systems/"):
                    ref_id = self.path.rsplit("/", 1)[-1]
                    if outer.status_override == 404 or not any(e["id"] == ref_id for e in outer.entries):
                        self.send_response(404)
                        self.end_headers()
                        return
                    self.send_response(200)
                    self.end_headers()
                    return
                self.send_response(404)
                self.end_headers()

            def log_message(self, *a):
                pass

        self._server = HTTPServer(("127.0.0.1", 0), Handler)
        self.port = self._server.server_port
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()

    def close(self):
        self._server.shutdown()
        self._thread.join(timeout=5)


def main() -> int:
    for var in ("OPEN_DESIGN_URL", "OD_API_TOKEN"):
        os.environ.pop(var, None)

    entries, warnings = odc.fetch_live_design_systems()
    check("unconfigured returns no entries", entries == [])
    check("unconfigured warns why (F2a)", len(warnings) == 1 and "not set" in warnings[0], warnings)
    check("is_configured() False when unset", odc.is_configured() is False)

    mock = MockDaemon()
    os.environ["OPEN_DESIGN_URL"] = f"http://127.0.0.1:{mock.port}"
    os.environ["OD_API_TOKEN"] = "test-token"

    try:
        check("is_configured() True when set", odc.is_configured() is True)

        mock.entries = [{"id": "apple", "name": "Apple", "category": "Media & Consumer"}]
        entries, warnings = odc.fetch_live_design_systems()
        check("live entry fetched cleanly", entries == [{"id": "apple", "name": "Apple", "category": "Media & Consumer", "tier": "live", "license": "Apache-2.0"}], entries)
        check("clean live fetch has no warnings", warnings == [], warnings)

        exists, w = odc.verify_live_entry_exists("apple")
        check("F2e: existing live entry verifies True", exists is True, w)

        exists, w = odc.verify_live_entry_exists("does-not-exist")
        check("F2e: 404 on a vanished live entry verifies False, no warning (not an error)", exists is False and w == [], w)

        mock.entries = []
        entries, warnings = odc.fetch_live_design_systems()
        check("empty live catalog is a real empty list, not an unreachable warning", entries == [] and warnings == [], (entries, warnings))
    finally:
        mock.close()

    os.environ["OPEN_DESIGN_URL"] = "http://127.0.0.1:1"  # nothing listening — connection refused
    entries, warnings = odc.fetch_live_design_systems(timeout=2.0)
    check("unreachable daemon returns no entries", entries == [])
    check("unreachable daemon warns why, doesn't raise (F2a degrade)", len(warnings) == 1 and "unreachable" in warnings[0], warnings)

    for var in ("OPEN_DESIGN_URL", "OD_API_TOKEN"):
        os.environ.pop(var, None)

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
    for f in FAIL:
        print(f"  ✗ {f}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
