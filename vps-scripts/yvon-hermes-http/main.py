"""
yvon-hermes-http — FastAPI wrapper exposing Hermes's AIAgent as an SSE HTTP endpoint.

Runs on the Hostinger VPS bound to 127.0.0.1:8765. Nginx (installed by
install.sh) reverse-proxies https://hermes.yvon.in → this service, adding TLS +
bearer-token auth.

Design rationale — why a wrapper instead of using Hermes's own dashboard:
  * Hermes's dashboard is EXPLICITLY local-only (CORS restricted to localhost,
    PTY WebSocket rejects non-loopback peers). Exposing it publicly would bypass
    its security defenses and require forking web_server.py.
  * Hermes's chat = PTY WebSocket to `hermes --tui` — an xterm.js terminal.
    We want team-chat UI (rooms, mentions, RLS per BOD member) not a terminal.
  * Our dashboard's chat = Supabase-persisted (RLS-scoped) messages. We only
    need Hermes as the AGENT RUNTIME (skills, tools, MCP, memory), not for
    persistence or UI.

So: import AIAgent from run_agent.py, wrap it in a small SSE endpoint. Session
pool keyed by (user_id, room_id) so conversation state persists across messages
within the same chat room.

Owner: raj · TS-013 WI-2
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import threading
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Optional

import httpx

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse, Response
from pydantic import BaseModel, Field

# Run lifecycle → Supabase event log. Fire-and-forget; never blocks a run.
from events import emit

# ── Import Hermes internals ─────────────────────────────────────────────────
# Hermes is a pip-installed editable package at /usr/local/lib/hermes-agent/.
# We import from its venv site-packages, which our systemd unit's Python
# (venv/bin/python) already has on sys.path — but we add explicit fallback in
# case the wrapper is run outside systemd.
HERMES_HOME = os.environ.get("HERMES_HOME", "/usr/local/lib/hermes-agent")
if HERMES_HOME not in sys.path:
    sys.path.insert(0, HERMES_HOME)

# ── Model default ──────────────────────────────────────────────────────────
# AIAgent does NOT read model.default from config.yaml — self.model comes only
# from the constructor arg. Read the configured default here and pass it down.
_HERMES_CONFIG_PATH = os.environ.get("HERMES_CONFIG_PATH", "/root/.hermes/config.yaml")


def _load_hermes_model_default() -> str:
    """Return the model.default string from Hermes config, or empty string."""
    try:
        with open(_HERMES_CONFIG_PATH, "r", encoding="utf-8") as fh:
            import yaml  # local import — only needed here

            cfg = yaml.safe_load(fh)
        model_cfg = (cfg or {}).get("model") or {}
        return str(model_cfg.get("default") or "").strip()
    except Exception:
        return ""


HERMES_MODEL_DEFAULT = _load_hermes_model_default()


def _load_hermes_provider_default() -> str:
    """Return the model.provider string from Hermes config, or empty string."""
    try:
        with open(_HERMES_CONFIG_PATH, "r", encoding="utf-8") as fh:
            import yaml  # local import — only needed here

            cfg = yaml.safe_load(fh)
        model_cfg = (cfg or {}).get("model") or {}
        return str(model_cfg.get("provider") or "").strip()
    except Exception:
        return ""


HERMES_PROVIDER_DEFAULT = _load_hermes_provider_default()
log = logging.getLogger("yvon-hermes-http")
if HERMES_MODEL_DEFAULT or HERMES_PROVIDER_DEFAULT:
    log.info(
        "hermes config: model.default=%s provider=%s",
        HERMES_MODEL_DEFAULT,
        HERMES_PROVIDER_DEFAULT,
    )

try:
    from run_agent import AIAgent  # type: ignore[import-not-found]
except ImportError as exc:  # pragma: no cover — surfaces during deploy issues
    raise ImportError(
        f"Could not import AIAgent from {HERMES_HOME}/run_agent.py. "
        f"Set HERMES_HOME if hermes-agent lives elsewhere. Underlying: {exc}"
    ) from exc

# ── Config ──────────────────────────────────────────────────────────────────
BEARER_TOKEN_PATH = os.environ.get("YVON_HERMES_TOKEN_PATH", "/etc/yvon-hermes/token")
POOL_IDLE_TTL_S = int(os.environ.get("YVON_HERMES_POOL_TTL", "1800"))  # 30 min
MAX_ITERATIONS = int(os.environ.get("YVON_HERMES_MAX_ITER", "40"))
STREAM_KEEPALIVE_S = float(os.environ.get("YVON_HERMES_KEEPALIVE", "15"))
HERMES_API_URL = os.environ.get("HERMES_API_URL", "http://127.0.0.1:9119")

log = logging.getLogger("yvon-hermes-http")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


def _load_bearer_token() -> str:
    """Read the bearer token from BEARER_TOKEN_PATH (installed by install.sh)."""
    try:
        with open(BEARER_TOKEN_PATH, "r", encoding="utf-8") as fh:
            token = fh.read().strip()
    except FileNotFoundError as exc:
        raise RuntimeError(
            f"Bearer token not found at {BEARER_TOKEN_PATH}. "
            f"Run install.sh, or set YVON_HERMES_TOKEN_PATH."
        ) from exc
    if not token or len(token) < 16:
        raise RuntimeError(f"Bearer token at {BEARER_TOKEN_PATH} is empty/too short.")
    return token


# Loaded once at process start
BEARER_TOKEN = _load_bearer_token()


# ── Session pool ─────────────────────────────────────────────────────────────
@dataclass
class PooledAgent:
    agent: AIAgent
    last_used_ts: float = field(default_factory=time.time)
    lock: threading.Lock = field(default_factory=threading.Lock)

    def touch(self) -> None:
        self.last_used_ts = time.time()


_pool: dict[tuple[str, str], PooledAgent] = {}
_pool_lock = threading.Lock()


def _agent_for(user_id: str, room_id: str) -> PooledAgent:
    """Return the pooled AIAgent for (user, room), creating on first use."""
    key = (user_id, room_id)
    with _pool_lock:
        pooled = _pool.get(key)
        if pooled is None:
            log.info("spawning new AIAgent for user=%s room=%s", user_id, room_id)
            # AIAgent picks up provider/model/keys automatically from
            # /root/.hermes/config.yaml + /root/.hermes/.env. We just supply a
            # stable session id so conversation state persists.
            #
            # TS-018 WI-8/WI-12 — Defect C (YVON-CHAT §4.3): `terminal` and
            # `code_execution` are registered only under platform_toolsets.cli
            # (hermes-config.contabo.yaml). With no platform argument, AIAgent
            # may default to a toolset that excludes them — which surfaces as
            # "bash commands not recognized". Pass the cli platform so the
            # tools load. The exact kwarg name lives in hermes-agent source on
            # the box (not tracked here), so we degrade loudly: try `platform`,
            # then `toolset`, then bare — each fallback logs a warning.
            _agent_kwargs = dict(
                session_id=f"web-{user_id}-{room_id}",
                model=HERMES_MODEL_DEFAULT or None,
                provider=HERMES_PROVIDER_DEFAULT or None,
                max_iterations=MAX_ITERATIONS,
                quiet_mode=True,
                save_trajectories=False,
                skip_context_files=False,
                load_soul_identity=False,
                skip_memory=False,
            )
            agent = None
            for _kw, _val in (("platform", "cli"), ("toolset", "cli")):
                if agent is not None:
                    break
                try:
                    _agent_kwargs[_kw] = _val
                    agent = AIAgent(**_agent_kwargs)
                    log.info("AIAgent created with %s=%r (terminal tools should be loaded)", _kw, _val)
                except TypeError:
                    _agent_kwargs.pop(_kw, None)
                    log.warning("AIAgent rejected %s=%r — trying next option", _kw, _val)
            if agent is None:
                log.warning(
                    "AIAgent created WITHOUT an explicit toolset — terminal tools may be absent. "
                    "Verify with Appendix A probe #4 (list tools)."
                )
                agent = AIAgent(**_agent_kwargs)
            pooled = PooledAgent(agent=agent)
            _pool[key] = pooled
        pooled.touch()
        return pooled


def _prune_idle_agents() -> None:
    """Evict pool entries idle for > POOL_IDLE_TTL_S. Called opportunistically."""
    cutoff = time.time() - POOL_IDLE_TTL_S
    with _pool_lock:
        stale = [k for k, v in _pool.items() if v.last_used_ts < cutoff]
        for k in stale:
            del _pool[k]
            log.info("pruned idle agent user=%s room=%s", k[0], k[1])


# ── App ──────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(_app: FastAPI):
    log.info("yvon-hermes-http starting · hermes=%s · pool_ttl=%ss", HERMES_HOME, POOL_IDLE_TTL_S)
    # HTTP client for proxying to Hermes API
    _app.state.http_client = httpx.AsyncClient(base_url=HERMES_API_URL, timeout=30.0)
    yield
    await _app.state.http_client.aclose()
    log.info("yvon-hermes-http shutting down · %d agents in pool", len(_pool))


app = FastAPI(title="YVON Hermes HTTP", version="0.1.0", lifespan=lifespan)


def require_bearer(authorization: Optional[str] = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    if authorization[7:].strip() != BEARER_TOKEN:
        raise HTTPException(status_code=401, detail="invalid bearer token")


# ── Health check (no auth — used by monitoring + install.sh smoke test) ─────
@app.get("/healthz")
def healthz() -> JSONResponse:
    return JSONResponse(
        {
            "ok": True,
            "version": app.version,
            "hermes_home": HERMES_HOME,
            "pool_size": len(_pool),
            "pool_ttl_s": POOL_IDLE_TTL_S,
        }
    )


# ── Chat request/response contracts ─────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's message to the agent(s)")
    user_id: str = Field(..., min_length=1, description="Supabase profile id of the sender")
    room_id: str = Field(..., min_length=1, description="Chat room id (Supabase chat_rooms.id)")
    workspace: Optional[str] = Field(default=None, description="Active venture slug resolved by the dashboard (yvon-os or any Settings-added venture)")
    mentions: list[str] = Field(default_factory=list, description="Explicit @agent-id mentions")
    # TS-025: injected real context from the dashboard — agent identity + skills
    # (yvon-os) or venture memory (other ventures). Used to ground the reply so
    # agents answer from their REAL abilities, not a generic capability list.
    agent_context: Optional[str] = Field(default=None, description="Real agent identity + skill roster (yvon-os)")
    venture_context: Optional[str] = Field(default=None, description="Active venture memory (non-yvon ventures)")
    input_analysis: Optional[str] = Field(default=None, description="5-field input analysis (what/why/how/end/desired) for build-tier turns")


# ── Chat stream endpoint ────────────────────────────────────────────────────
@app.post("/v1/chat/stream", dependencies=[Depends(require_bearer)])
async def chat_stream(req: ChatRequest) -> StreamingResponse:
    """
    SSE endpoint. Server-Sent Events (text/event-stream). Each event is a JSON
    object on a `data:` line. Terminates with a `done` event (or `error`).

    Event kinds:
      { "kind": "token", "text": "..." }       - one streaming token
      { "kind": "done",  "response": "..." }   - full response + terminal
      { "kind": "error", "message": "..." }    - fatal error + terminal
      { "kind": "ping" }                       - keepalive (every 15s idle)
      # TS-017 live status feed:
      { "kind": "thinking" }                              - model is reasoning
      { "kind": "tool_call.start", toolName, argsPreview } - tool dispatched
      { "kind": "tool_call.end",  toolName, ok, summary }  - tool completed
      { "kind": "notice", level, message }                 - status update
    """
    _prune_idle_agents()
    try:
        pooled = _agent_for(req.user_id, req.room_id)
    except Exception as exc:  # noqa: BLE001 — agent init failures must surface to client
        log.exception("agent init failed for user=%s room=%s", req.user_id, req.room_id)
        msg = f"agent init failed: {exc}"
        return StreamingResponse(
            iter([f"data: {json.dumps({'kind': 'error', 'message': msg})}\n\n"]),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache, no-transform",
                "X-Accel-Buffering": "no",
            },
        )
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    loop = asyncio.get_running_loop()

    # TS-018 WI-4 (YVON-CHAT §5.2): every SSE event carries the turn's
    # correlation so the dashboard can link the message row to its events with
    # one indexed query. `_correlation` is assigned below, before any callback
    # fires (they run inside run_agent) — late binding is safe here.
    def _sse(event: dict[str, Any]) -> None:
        loop.call_soon_threadsafe(queue.put_nowait, {**event, "correlation": _correlation})

    def on_delta(text: str) -> None:
        if not text:
            return
        _sse({"kind": "token", "text": text})

    # ── Status callbacks (TS-017: live status feed) ─────────────────────────
    # Hermes may pass an argument (status/phase string) to these callbacks
    # depending on version — accept *args so we're version-tolerant.
    _tool_starts: dict[str, float] = {}

    def on_thinking(*_args: Any) -> None:
        _sse({"kind": "thinking"})

    def on_tool_start(name: str, args_preview: str) -> None:
        _tool_starts[name] = time.time()
        _sse({"kind": "tool_call.start", "toolName": name, "argsPreview": args_preview})
        # TS-018 WI-4 — persisted phase detail (fire-and-forget; see events.py).
        _emit_all("tool.call", tool=name, status="start")

    def on_tool_end(name: str, ok: bool, summary: str) -> None:
        _sse({"kind": "tool_call.end", "toolName": name, "ok": ok, "summary": summary})
        started = _tool_starts.pop(name, None)
        ms = int((time.time() - started) * 1000) if started else None
        _emit_all("tool.call", tool=name, ok=bool(ok), ms=ms, summary=str(summary)[:300])

    def on_notice(level: str, message: str) -> None:
        _sse({"kind": "notice", "level": level, "message": message})

    # Compose the prompt with routing hints so meta/CLAUDE.md §2 logic in Hermes
    # skills can respect our department/mention conventions.
    prompt_parts: list[str] = []
    if req.workspace:
        prompt_parts.append(f"[workspace: {req.workspace}]")
    if req.mentions:
        prompt_parts.append(f"[mentions: {', '.join('@' + m for m in req.mentions)}]")
    # TS-025: inject the REAL per-turn context before the user message, and
    # instruct the model to answer ONLY from these abilities (no inventing).
    if req.agent_context:
        prompt_parts.append("[AGENT CONTEXT — your real identity and skills; answer only from these]")
        prompt_parts.append(req.agent_context)
    if req.venture_context:
        prompt_parts.append("[VENTURE CONTEXT — the active venture's memory; work in this context]")
        prompt_parts.append(req.venture_context)
    if req.input_analysis:
        prompt_parts.append("[INPUT ANALYSIS — what/why/how/end/desired; execute to this intent]")
        prompt_parts.append(req.input_analysis)
    prompt_parts.append(req.message)
    full_prompt = "\n".join(prompt_parts)

    result_holder: dict[str, Any] = {"response": None, "error": None}

    # ── run lifecycle → event log (architecture §5.4) ───────────────────────
    # One event per mentioned agent; unaddressed turns are attributed to 'system'.
    # Fire-and-forget: emit() never blocks and never raises (see events.py).
    _correlation = str(uuid.uuid4())
    # TS-023 (#3): unaddressed turns are attributed to the orchestrator agent
    # 'meta' (real fleet agent) instead of the anonymous 'system' — so events,
    # the pipeline panel and the graph show WHO handled the turn honestly.
    _actors = req.mentions or ["meta"]

    def _emit_all(kind: str, **payload: Any) -> None:
        for _a in _actors:
            emit(kind, _a, context_id=req.workspace, correlation=_correlation, **payload)

    _emit_all("run.started", room_id=req.room_id)
    # TS-018 WI-4 (YVON-CHAT §5.2): phases observable from the wrapper, sharing
    # the turn's correlation. classify/resolve carry REAL input facts — the
    # wrapper cannot see in-model classification, retrieval or gates, so those
    # kinds are reserved until hermes-agent exposes phase hooks (events.py
    # vocabulary). Never fabricate a phase the wrapper cannot observe.
    _emit_all("phase.classify", intent=req.message[:400], workspace=req.workspace)
    _emit_all("phase.resolve", targets=_actors, workspace=req.workspace)

    def run_agent() -> None:
        try:
            with pooled.lock:  # serialize per-session; AIAgent isn't thread-safe
                pooled.agent._stream_delta_callback = on_delta  # rebind for this turn
                # Bind status callbacks — Hermes fires these during agent.chat()
                # if the AIAgent class supports them (discovered in source).
                # No-ops silently if the agent doesn't call them.
                pooled.agent.thinking_callback = on_thinking
                pooled.agent.tool_start_callback = on_tool_start
                pooled.agent.tool_complete_callback = on_tool_end
                pooled.agent.notice_callback = on_notice
                response = pooled.agent.chat(full_prompt, stream_callback=on_delta)
                result_holder["response"] = response or ""
            _emit_all("run.completed")
        except Exception as exc:  # noqa: BLE001 — surface any agent failure
            log.exception("agent.chat failed for user=%s room=%s", req.user_id, req.room_id)
            result_holder["error"] = str(exc)
            _emit_all("run.failed", error=str(exc)[:500])
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, {"kind": "__internal_done__"})

    task = loop.run_in_executor(None, run_agent)

    async def event_generator() -> AsyncIterator[str]:
        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=STREAM_KEEPALIVE_S)
                except asyncio.TimeoutError:
                    # Idle keepalive — helps some proxies not close the SSE stream
                    yield f"data: {json.dumps({'kind': 'ping'})}\n\n"
                    continue

                if event.get("kind") == "__internal_done__":
                    if result_holder["error"] is not None:
                        yield f"data: {json.dumps({'kind': 'error', 'message': result_holder['error'], 'correlation': _correlation})}\n\n"
                    else:
                        yield f"data: {json.dumps({'kind': 'done', 'response': result_holder['response'], 'correlation': _correlation})}\n\n"
                    break

                yield f"data: {json.dumps(event)}\n\n"
        finally:
            # Ensure the background thread has actually completed (avoids zombie state)
            await task

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",  # tells nginx: don't buffer this response
            "Connection": "keep-alive",
        },
    )


# ── Pool inspection (auth-required, for debugging) ─────────────────────────
@app.get("/v1/pool", dependencies=[Depends(require_bearer)])
def pool_info() -> JSONResponse:
    with _pool_lock:
        entries = [
            {
                "user_id": k[0],
                "room_id": k[1],
                "idle_s": round(time.time() - v.last_used_ts, 1),
            }
            for k, v in _pool.items()
        ]
    return JSONResponse({"pool_size": len(entries), "entries": entries})


# ── Drop a specific session (auth-required) ─────────────────────────────────
class DropRequest(BaseModel):
    user_id: str
    room_id: str


@app.post("/v1/pool/drop", dependencies=[Depends(require_bearer)])
def pool_drop(req: DropRequest) -> JSONResponse:
    with _pool_lock:
        removed = _pool.pop((req.user_id, req.room_id), None) is not None
    return JSONResponse({"dropped": removed})


# ── Whisper transcription (TS-017 WI-5: voice messages) ────────────────────
# Receives an audio file, pipes it through the local Whisper CLI, returns text.
import subprocess
import tempfile


class WhisperInput(BaseModel):
    audio: str  # base64-encoded audio data


@app.post("/v1/transcribe", dependencies=[Depends(require_bearer)])
async def transcribe_audio(request: Request) -> JSONResponse:
    """Transcribe an audio file using local Whisper installation."""
    try:
        form = await request.form()
        audio_file = form.get("audio")
        if not audio_file:
            return JSONResponse({"error": "no audio file provided"}, status_code=400)

        # Read file content
        content = await audio_file.read()

        # Write to temp file
        suffix = ".webm"
        if isinstance(audio_file, type(...)):
            pass
        # Try to get filename for extension
        try:
            suffix = f".{audio_file.filename.rsplit('.', 1)[-1]}" if hasattr(audio_file, 'filename') and audio_file.filename else ".webm"
        except Exception:
            suffix = ".webm"

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # Run whisper CLI
        result = subprocess.run(
            ["whisper", tmp_path, "--model", "base", "--output_format", "json", "--language", "en"],
            capture_output=True,
            text=True,
            timeout=120,
        )

        os.unlink(tmp_path)

        if result.returncode != 0:
            log.error("whisper failed: %s", result.stderr)
            return JSONResponse({"error": f"whisper failed: {result.stderr[:200]}"}, status_code=500)

        # Parse the JSON output from whisper
        import json as json_lib
        try:
            output = json_lib.loads(result.stdout)
            text = output.get("text", "")
        except json_lib.JSONDecodeError:
            text = result.stdout.strip()

        return JSONResponse({"text": text})

    except subprocess.TimeoutExpired:
        return JSONResponse({"error": "whisper timed out"}, status_code=504)
    except Exception as exc:
        log.exception("transcribe failed")
        return JSONResponse({"error": str(exc)}, status_code=500)


# ── Hermes API proxy (TS-018: full Hermes control) ─────────────────────────
# Catch-all proxy that forwards ANY /api/* request to Hermes's own API server
# (127.0.0.1:9119). This exposes all 176 Hermes endpoints to the dashboard
# through our authenticated wrapper. The dashboard calls /api/hermes/... and we
# forward to Hermes's /api/... transparently.
#
# Security: the Hermes API is local-only (CORS/WebSocket restricted). Our proxy
# adds bearer-token auth so only authenticated YVON users can reach it.

@app.api_route(
    "/api/hermes/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    dependencies=[Depends(require_bearer)],
)
async def proxy_to_hermes(request: Request, path: str) -> Response:
    """Proxy any /api/hermes/* request to Hermes's own API."""
    client: httpx.AsyncClient = request.app.state.http_client
    target_path = f"/api/{path}"

    # Build query string from original request
    params = dict(request.query_params)

    # Read body if present
    body = None
    if request.method in ("POST", "PUT", "PATCH"):
        body = await request.body()

    # Forward headers (strip host/connection to let httpx set them)
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in ("host", "connection", "content-length", "accept-encoding")
    }

    try:
        hermes_resp = await client.request(
            method=request.method,
            url=target_path,
            params=params,
            headers=headers,
            content=body,
        )
    except httpx.RequestError as exc:
        log.error("hermes proxy failed for %s: %s", target_path, exc)
        return JSONResponse(
            {"error": f"Hermes API unreachable: {exc}"},
            status_code=503,
        )

    return Response(
        content=hermes_resp.content,
        status_code=hermes_resp.status_code,
        headers=dict(hermes_resp.headers),
    )
