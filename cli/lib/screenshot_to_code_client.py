"""screenshot_to_code_client.py — thin client for a self-hosted
abi/screenshot-to-code instance (docs/PRD-design-first-workflow.md).

v2 (2026-08-19) — capture_url rewritten against a real clone of the repo
(github.com/abi/screenshot-to-code, backend/routes/screenshot.py + README),
after the deploy script's first version failed on a real VPS run and forced
an actual verification pass instead of guessing again. Confirmed facts:

  - POST /api/screenshot takes JSON {"url", "apiKey"} and returns
    {"url": "data:image/png;base64,..."} — a base64 data URL, not a file
    path. "apiKey" is a screenshottone.com key, supplied by the CALLER —
    there is no server-side env fallback in the route itself. This is a
    THIRD paid external dependency (beyond the LLM provider keys) that the
    original design discussion never accounted for; capture_url below reads
    it from SCREENSHOTONE_API_KEY and fails honestly (not silently) if it's
    unset while SCREENSHOT_TO_CODE_URL is.
  - The genuinely self-hosted local-Chromium/Playwright piece in this repo
    (backend/preview_screenshot/) is for a DIFFERENT feature — the backend
    screenshotting its own generated output to self-check — not for
    capturing the operator's input URL. There is no self-hosted-headless
    path for input capture; screenshottone.com is not optional infra this
    module can route around.
  - Response is decoded and written to a local file so CaptureResult's
    existing screenshot_path contract (a path cli/design.py stores/cites)
    doesn't need to change; the cache dir is configurable via
    SCREENSHOT_TO_CODE_CACHE_DIR (defaults to a temp dir).

v3 (2026-08-19, same day) — generate_code rewritten for real, against the
same real clone (routes/generate_code.py's full pipeline, ~900 lines read
end to end, not skimmed). Confirmed facts:

  - It's a WebSocket at /generate-code (hyphen), one JSON message out
    ({generatedCodeConfig, inputMode, prompt: {text, images}, history,
    generationType, isImageGenerationEnabled, isAssetExtractionEnabled,
    optionCodes, openAiApiKey/anthropicApiKey/geminiApiKey/replicateApiKey}),
    then a stream of typed JSON messages back ({"type", "value",
    "variantIndex", ...}) until the connection closes. This client only
    asks for and reads variantIndex 0 — the app can run multiple model
    variants in parallel, that's a real feature this client deliberately
    doesn't use (design.py's F6b review gate is the human judgment call
    this MVP relies on, not a multi-variant picker).
  - "setCode" carries the full code for a variant; "variantComplete" follows
    it. "error" (connection-level) or "variantError" (variantIndex 0) are
    the failure signals. Everything else (chunk/status/thinking/toolStart/
    etc.) is drained and ignored — this client wants the final artifact,
    not a live progress UI.
  - API keys: ParameterExtractionStage reads openAiApiKey/anthropicApiKey/
    etc. from THIS message first, falling back to the backend's own
    OPENAI_API_KEY/etc. env vars only if the message didn't include them
    (routes/generate_code.py's _get_from_settings_dialog_or_env). The
    frontend's settings-dialog keys live in THAT BROWSER's local state and
    are sent per-request from the browser — they never reach a headless
    caller like this one. Needs the `websockets` package (added to
    requirements.txt); if it's not installed, this fails with a clear
    ImportError-derived message rather than a confusing stack trace.

v4 (2026-08-19, same day) — key sourcing now checks the dashboard's own
configured provider first, per the operator's own point: they'd already set
a key in the dashboard's Project Settings (Supabase's `ai_provider_keys`
table, `dashboard/lib/ai-client.ts`), so this shouldn't need its own separate
copy. Precedence, highest first: (1) an explicit OPENAI_API_KEY/etc. in this
process's own environment — lets an operator override per-run without
touching Supabase; (2) `dashboard_credentials.fetch_active_provider_key()` —
the dashboard's one active provider/key, mapped to whichever of screenshot-
to-code's four fields it corresponds to (see that module's header for the
mapping and its honest limits — e.g. an active DeepSeek/Ollama/etc. provider
doesn't map to anything here); (3) omitted — the screenshot-to-code server's
own backend/.env fallback applies. Every GenerateResult now carries
`warnings` (e.g. "Supabase unreachable, fell back to env") so cli/design.py
can surface why a key came from where it did, same discipline as this
module's stub-flagging.

Two modes, chosen honestly, never silently:

  * LIVE  — SCREENSHOT_TO_CODE_URL is set. Real HTTP calls to a real
    deployment (see vps-scripts/deploy-screenshot-to-code.sh). Failures are
    real hard failures (F1a/F6a in the design discussion's fallback
    inventory, referenced here by name only — it lives outside this repo's
    docs/ dir) and are surfaced as ScreenshotToCodeError, never swallowed.
  * STUB — SCREENSHOT_TO_CODE_URL unset (or, for generate_code, always).
    No network call is made. Returns a clearly-flagged placeholder result
    so the design-session state machine, its gates, and its tests can run
    end-to-end without a live deployment. Every stub result carries
    stub=True; cli/design.py refuses to let a design-session reach handoff
    while any step in it is still stub-sourced.

Same honest-degradation discipline as dashboard/lib/prd-generator.ts's
"Generation Notes" — a stub, or a missing key, is shown, not hidden.
"""
from __future__ import annotations
import asyncio
import base64
import json
import mimetypes
import os
import re
import tempfile
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

from . import dashboard_credentials


class ScreenshotToCodeError(Exception):
    """A real (LIVE-mode) hard failure talking to screenshot-to-code."""


@dataclass
class CaptureResult:
    ok: bool
    stub: bool
    screenshot_path: str | None = None
    error: str | None = None


@dataclass
class GenerateResult:
    ok: bool
    stub: bool
    code: str | None = None
    stack: str | None = None
    error: str | None = None
    warnings: list[str] = field(default_factory=list)


def _base_url() -> str | None:
    url = os.environ.get("SCREENSHOT_TO_CODE_URL", "").strip()
    return url.rstrip("/") if url else None


def is_live() -> bool:
    return _base_url() is not None


def _cache_dir() -> Path:
    d = Path(os.environ.get("SCREENSHOT_TO_CODE_CACHE_DIR", "") or (Path(tempfile.gettempdir()) / "screenshot-to-code-cache"))
    d.mkdir(parents=True, exist_ok=True)
    return d


def _post(path: str, payload: dict, timeout: float) -> dict:
    base = _base_url()
    assert base, "_post called without SCREENSHOT_TO_CODE_URL set"
    req = urllib.request.Request(
        f"{base}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as e:
        raise ScreenshotToCodeError(str(e)) from e
    except (TimeoutError, json.JSONDecodeError) as e:
        raise ScreenshotToCodeError(str(e)) from e


_DATA_URL_RE = re.compile(r"^data:(?P<mime>[\w/+.-]+);base64,(?P<b64>.+)$", re.S)


def _save_data_url(data_url: str, name_hint: str) -> str:
    m = _DATA_URL_RE.match(data_url.strip())
    if not m:
        raise ScreenshotToCodeError(f"/api/screenshot returned something that isn't a base64 data URL (got {data_url[:60]!r}...)")
    mime = m.group("mime")
    ext = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}.get(mime, "bin")
    out = _cache_dir() / f"{name_hint}.{ext}"
    out.write_bytes(base64.b64decode(m.group("b64")))
    return str(out)


def capture_url(url: str, *, timeout: float = 60.0) -> CaptureResult:
    """Stage 1 (F1a). NOT self-hosted — see this module's header. Requires a
    screenshottone.com key via SCREENSHOTONE_API_KEY; the app itself has no
    server-side fallback for this, so neither does this client."""
    if not is_live():
        return CaptureResult(
            ok=True, stub=True,
            screenshot_path=f"stub://capture/{abs(hash(url))}.png",
        )
    api_key = os.environ.get("SCREENSHOTONE_API_KEY", "").strip()
    if not api_key:
        return CaptureResult(
            ok=False, stub=False,
            error="SCREENSHOT_TO_CODE_URL is live but SCREENSHOTONE_API_KEY is unset — "
                  "/api/screenshot requires a screenshottone.com key per request, the app "
                  "has no server-side fallback for it, so this refuses rather than sending "
                  "an empty key and getting a confusing failure back.",
        )
    try:
        data = _post("/api/screenshot", {"url": url, "apiKey": api_key}, timeout)
        data_url = data.get("url")
        if not data_url:
            return CaptureResult(ok=False, stub=False, error="capture succeeded but response had no 'url' field")
        path = _save_data_url(data_url, f"capture-{abs(hash(url))}")
        return CaptureResult(ok=True, stub=False, screenshot_path=path)
    except ScreenshotToCodeError as e:
        return CaptureResult(ok=False, stub=False, error=str(e))


def _file_to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    b64 = base64.b64encode(Path(path).read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def _api_key_fields() -> tuple[dict, list[str]]:
    """Resolve provider keys, highest precedence first (see this module's v4
    header note): (1) this process's own explicit env vars, (2) the
    dashboard's Supabase-configured active provider, (3) omitted — the
    screenshot-to-code server's own backend/.env fallback applies. NOT the
    frontend settings-dialog's browser-local keys, which never reach a
    headless caller regardless of any of this. Returns (fields, warnings) —
    warnings explain any step that didn't contribute a key, never silently."""
    warnings: list[str] = []

    supabase_fields, supabase_warnings = dashboard_credentials.fetch_active_provider_key()
    warnings.extend(supabase_warnings)

    fields = dict(supabase_fields)

    env_mapping = {
        "OPENAI_API_KEY": "openAiApiKey",
        "ANTHROPIC_API_KEY": "anthropicApiKey",
        "GEMINI_API_KEY": "geminiApiKey",
        "REPLICATE_API_KEY": "replicateApiKey",
    }
    for env_name, field_name in env_mapping.items():
        val = os.environ.get(env_name, "").strip()
        if val:
            if field_name in fields:
                warnings.append(f"{env_name} in this process's environment overrides the dashboard's Supabase-configured key for {field_name}")
            fields[field_name] = val

    if not fields:
        warnings.append(
            "no provider key resolved from this process's own env vars or the dashboard's Supabase "
            "config — request will omit all four key fields; the screenshot-to-code server's own "
            "backend/.env is the last fallback (still blank as of this writing, see "
            "docs/PRD-design-first-workflow.md §3a)."
        )

    return fields, warnings


async def _generate_code_ws(screenshot_path: str, stack: str, timeout: float) -> GenerateResult:
    try:
        import websockets
    except ImportError as e:
        return GenerateResult(
            ok=False, stub=False,
            error=f"the 'websockets' package is required for live generation and isn't installed ({e}) — "
                  f"pip install -r requirements.txt (see the entry added alongside this client), or "
                  f"leave SCREENSHOT_TO_CODE_URL unset to stay in stub mode.",
        )

    base = _base_url()
    assert base, "_generate_code_ws called without SCREENSHOT_TO_CODE_URL set"
    ws_base = "wss://" + base[len("https://"):] if base.startswith("https://") else \
        "ws://" + base[len("http://"):] if base.startswith("http://") else base
    ws_url = f"{ws_base}/generate-code"

    try:
        data_url = _file_to_data_url(screenshot_path)
    except OSError as e:
        return GenerateResult(ok=False, stub=False, error=f"couldn't read captured screenshot at {screenshot_path}: {e}")

    key_fields, key_warnings = _api_key_fields()
    params = {
        "generatedCodeConfig": stack,
        "inputMode": "image",
        "prompt": {"text": "", "images": [data_url], "videos": []},
        "history": [],
        "generationType": "create",
        "isImageGenerationEnabled": False,
        "isAssetExtractionEnabled": True,
        "optionCodes": [],
        **key_fields,
    }

    code_by_variant: dict[int, str] = {}
    error_msg: str | None = None

    async def _consume(ws) -> None:
        nonlocal error_msg
        async for raw in ws:
            msg = json.loads(raw)
            mtype = msg.get("type")
            variant = msg.get("variantIndex")
            if mtype == "error":
                error_msg = msg.get("value") or "generation failed (connection-level error)"
                return
            if mtype == "variantError" and variant == 0:
                error_msg = msg.get("value") or "variant 0 failed"
                return
            if mtype == "setCode" and variant == 0:
                code_by_variant[0] = msg.get("value") or ""
            if mtype == "variantComplete" and variant == 0:
                return
            # chunk/status/thinking/toolStart/toolResult/etc. — drained, not needed here

    try:
        # asyncio.wait_for, not asyncio.timeout — this repo targets Python
        # 3.10 (backend/pyproject.toml, and the operator's own machine is
        # confirmed 3.10.12), asyncio.timeout() is 3.11+ only.
        async with websockets.connect(ws_url, open_timeout=timeout, close_timeout=5) as ws:
            await ws.send(json.dumps(params))
            await asyncio.wait_for(_consume(ws), timeout=timeout)
    except asyncio.TimeoutError:
        return GenerateResult(ok=False, stub=False, error=f"generation timed out after {timeout}s waiting on {ws_url}", warnings=key_warnings)
    except OSError as e:
        return GenerateResult(ok=False, stub=False, error=f"couldn't reach {ws_url}: {e}", warnings=key_warnings)
    except websockets.exceptions.WebSocketException as e:
        return GenerateResult(ok=False, stub=False, error=f"WebSocket protocol error talking to {ws_url}: {e}", warnings=key_warnings)

    if error_msg:
        return GenerateResult(ok=False, stub=False, error=error_msg, warnings=key_warnings)
    if 0 not in code_by_variant:
        return GenerateResult(ok=False, stub=False, error="connection closed before variant 0 completed (no setCode received)", warnings=key_warnings)
    return GenerateResult(ok=True, stub=False, stack=stack, code=code_by_variant[0], warnings=key_warnings)


def generate_code(screenshot_path: str, *, stack: str = "html_tailwind", timeout: float = 120.0) -> GenerateResult:
    """Stage 1 generation step — the code-gen call that later gets the F6b
    soft-failure review gate in cli/design.py (technical success != correct).

    STUB if SCREENSHOT_TO_CODE_URL is unset or screenshot_path is a stub:// URI
    (nothing real to send). Otherwise a real WebSocket call to /generate-code
    — see this module's header for the verified message contract and the
    api-key-source caveat (frontend settings-dialog keys don't reach this)."""
    if not is_live() or screenshot_path.startswith("stub://"):
        return GenerateResult(
            ok=True, stub=True, stack=stack,
            code=f"<!-- stub: no live SCREENSHOT_TO_CODE_URL, or upstream capture was itself a "
                 f"stub -- would generate {stack} from {screenshot_path} -->",
        )
    return asyncio.run(_generate_code_ws(screenshot_path, stack, timeout))
