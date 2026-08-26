#!/usr/bin/env python3
"""test_screenshot_to_code_client.py — regression test for the real WebSocket
generate_code() implementation in cli/lib/screenshot_to_code_client.py
(docs/PRD-design-first-workflow.md).

Runs a local mock WebSocket server (background thread, its own event loop)
that speaks the same message protocol verified against the real
abi/screenshot-to-code source (routes/generate_code.py: one JSON params
message in, then typed {"type", "value", "variantIndex"} messages out) —
never touches the real VPS deployment. Calls the real, synchronous
generate_code() from a plain (non-async) main thread, same as cli/design.py's
cmd_generate actually does — generate_code() runs its own asyncio.run()
internally and would raise "cannot be called from a running event loop" if
tested from inside one, so the mock server needs to live somewhere else.

Plain asserts + prints, no pytest dependency — same convention as the rest
of cli/*.py. Needs the `websockets` package (requirements.txt) to run at
all — it exits 0 with a clear skip message if that's not installed, rather
than a raw ImportError traceback, since an offline/sandboxed environment
without network access to pip-install it is a real, expected case (not a
failure of this test or the code it covers — cli/design.py's own default
test suite, test_design.py, runs fully in stub mode and needs no network at
all; only this file's mock-server coverage does).

Usage: python3 cli/test_screenshot_to_code_client.py
"""
import asyncio
import base64
import json
import os
import sys
import tempfile
import threading
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import screenshot_to_code_client as s2c  # noqa: E402

try:
    import websockets
except ImportError:
    print("SKIP: 'websockets' isn't installed (pip install -r requirements.txt) — "
          "cli/design.py's own generate_code() already degrades to a clear error "
          "in this same situation (see screenshot_to_code_client.py), this is just "
          "this test file's own dependency, not a code defect.")
    sys.exit(0)

PASS, FAIL = [], []


def check(name: str, cond: bool, detail: str = ""):
    if cond:
        PASS.append(name)
    else:
        FAIL.append(f"{name}  {detail}")


# A 1x1 transparent PNG, real bytes (not a fixture that needs network).
_TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


async def _handler_success(websocket):
    params = json.loads(await websocket.recv())
    assert params["inputMode"] == "image"
    assert params["generatedCodeConfig"] == "html_tailwind"
    assert params["prompt"]["images"][0].startswith("data:image/png;base64,")
    await websocket.send(json.dumps({"type": "status", "value": "generating", "variantIndex": 0}))
    await websocket.send(json.dumps({"type": "setCode", "value": "<html>ok</html>", "variantIndex": 0}))
    await websocket.send(json.dumps({"type": "variantComplete", "variantIndex": 0}))


async def _handler_variant_error(websocket):
    await websocket.recv()
    await websocket.send(json.dumps({"type": "variantError", "value": "model refused", "variantIndex": 0}))


async def _handler_connection_error(websocket):
    await websocket.recv()
    await websocket.send(json.dumps({"type": "error", "value": "invalid stack"}))


async def _handler_keys_passed_through(websocket):
    params = json.loads(await websocket.recv())
    assert params.get("openAiApiKey") == "sk-test-123", params
    await websocket.send(json.dumps({"type": "setCode", "value": "<html>keyed</html>", "variantIndex": 0}))
    await websocket.send(json.dumps({"type": "variantComplete", "variantIndex": 0}))


class MockServer:
    """Runs a websockets server in a background thread with its own event
    loop, so the real (synchronous, asyncio.run()-internally) generate_code()
    can be called from the main thread exactly the way cli/design.py's
    cmd_generate actually calls it — no nested event loops."""

    def __init__(self, handler):
        self.handler = handler
        self.port = None
        self._loop = None
        self._server = None
        self._ready = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)

    def _run(self):
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)

        async def _serve():
            self._server = await websockets.serve(self.handler, "127.0.0.1", 0)
            self.port = self._server.sockets[0].getsockname()[1]
            self._ready.set()
            await self._server.wait_closed()

        self._loop.run_until_complete(_serve())

    def __enter__(self):
        self._thread.start()
        self._ready.wait(timeout=5)
        return self

    def __exit__(self, *exc):
        self._loop.call_soon_threadsafe(self._server.close)
        self._thread.join(timeout=5)


def _with_mock(handler, fn):
    """Point SCREENSHOT_TO_CODE_URL at a fresh mock server for the duration
    of fn(), then restore. fn receives nothing, returns nothing — check()
    calls happen inside it."""
    old = os.environ.get("SCREENSHOT_TO_CODE_URL")
    with MockServer(handler) as srv:
        os.environ["SCREENSHOT_TO_CODE_URL"] = f"http://127.0.0.1:{srv.port}"
        try:
            fn()
        finally:
            if old is None:
                os.environ.pop("SCREENSHOT_TO_CODE_URL", None)
            else:
                os.environ["SCREENSHOT_TO_CODE_URL"] = old


def main() -> int:
    tmp = Path(tempfile.mkdtemp(prefix="s2c-client-test-"))
    png_path = tmp / "capture.png"
    png_path.write_bytes(_TINY_PNG)

    os.environ.pop("SCREENSHOT_TO_CODE_URL", None)
    check("is_live() is False with no SCREENSHOT_TO_CODE_URL", not s2c.is_live())
    stub_result = s2c.generate_code(str(png_path))
    check("generate_code stubs cleanly with no live URL", stub_result.ok and stub_result.stub)

    def success_case():
        result = s2c.generate_code(str(png_path))
        check("live success: ok=True", result.ok, result.error)
        check("live success: stub=False", result.stub is False)
        check("live success: real code returned", result.code == "<html>ok</html>", result.code)
    _with_mock(_handler_success, success_case)

    def variant_error_case():
        result = s2c.generate_code(str(png_path))
        check("variantError surfaces as failure", not result.ok)
        check("variantError message passed through", result.error == "model refused", result.error)
    _with_mock(_handler_variant_error, variant_error_case)

    def connection_error_case():
        result = s2c.generate_code(str(png_path))
        check("connection-level error surfaces as failure", not result.ok)
        check("connection-level error message passed through", result.error == "invalid stack", result.error)
    _with_mock(_handler_connection_error, connection_error_case)

    def keys_case():
        os.environ["OPENAI_API_KEY"] = "sk-test-123"
        try:
            result = s2c.generate_code(str(png_path))
            check("local OPENAI_API_KEY is sent as openAiApiKey", result.ok and result.code == "<html>keyed</html>", result.error)
        finally:
            os.environ.pop("OPENAI_API_KEY", None)
    _with_mock(_handler_keys_passed_through, keys_case)

    def stub_capture_case():
        # SCREENSHOT_TO_CODE_URL IS live here, but the screenshot_path itself
        # is a stub:// URI (upstream capture was stubbed) — must short-circuit
        # to stub without ever touching the mock server. If this regresses,
        # _handler_success's own asserts would fail loudly (real bytes fed in
        # place of a real capture).
        result = s2c.generate_code("stub://capture/123.png")
        check("generate_code short-circuits to stub when capture path is stub://, even with a live URL", result.stub is True)
    _with_mock(_handler_success, stub_capture_case)

    import shutil
    shutil.rmtree(tmp, ignore_errors=True)

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
    for f in FAIL:
        print(f"  ✗ {f}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
