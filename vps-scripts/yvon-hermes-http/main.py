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
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

# ── Import Hermes internals ─────────────────────────────────────────────────
# Hermes is a pip-installed editable package at /usr/local/lib/hermes-agent/.
# We import from its venv site-packages, which our systemd unit's Python
# (venv/bin/python) already has on sys.path — but we add explicit fallback in
# case the wrapper is run outside systemd.
HERMES_HOME = os.environ.get("HERMES_HOME", "/usr/local/lib/hermes-agent")
if HERMES_HOME not in sys.path:
    sys.path.insert(0, HERMES_HOME)

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
            agent = AIAgent(
                session_id=f"web-{user_id}-{room_id}",
                max_iterations=MAX_ITERATIONS,
                quiet_mode=True,
                save_trajectories=False,
                skip_context_files=False,
                load_soul_identity=False,
                skip_memory=False,
            )
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
    yield
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
    workspace: Optional[str] = Field(default=None, description="'yvon-os' | 'novizio' | 'hourbour' | 'agentx'")
    mentions: list[str] = Field(default_factory=list, description="Explicit @agent-id mentions")


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
    pooled = _agent_for(req.user_id, req.room_id)
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    loop = asyncio.get_running_loop()

    def on_delta(text: str) -> None:
        if not text:
            return
        loop.call_soon_threadsafe(queue.put_nowait, {"kind": "token", "text": text})

    # ── Status callbacks (TS-017: live status feed) ─────────────────────────
    def on_thinking() -> None:
        loop.call_soon_threadsafe(queue.put_nowait, {"kind": "thinking"})

    def on_tool_start(name: str, args_preview: str) -> None:
        loop.call_soon_threadsafe(
            queue.put_nowait,
            {"kind": "tool_call.start", "toolName": name, "argsPreview": args_preview},
        )

    def on_tool_end(name: str, ok: bool, summary: str) -> None:
        loop.call_soon_threadsafe(
            queue.put_nowait,
            {"kind": "tool_call.end", "toolName": name, "ok": ok, "summary": summary},
        )

    def on_notice(level: str, message: str) -> None:
        loop.call_soon_threadsafe(
            queue.put_nowait,
            {"kind": "notice", "level": level, "message": message},
        )

    # Compose the prompt with routing hints so meta/CLAUDE.md §2 logic in Hermes
    # skills can respect our department/mention conventions.
    prompt_parts: list[str] = []
    if req.workspace:
        prompt_parts.append(f"[workspace: {req.workspace}]")
    if req.mentions:
        prompt_parts.append(f"[mentions: {', '.join('@' + m for m in req.mentions)}]")
    prompt_parts.append(req.message)
    full_prompt = "\n".join(prompt_parts)

    result_holder: dict[str, Any] = {"response": None, "error": None}

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
        except Exception as exc:  # noqa: BLE001 — surface any agent failure
            log.exception("agent.chat failed for user=%s room=%s", req.user_id, req.room_id)
            result_holder["error"] = str(exc)
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
                        yield f"data: {json.dumps({'kind': 'error', 'message': result_holder['error']})}\n\n"
                    else:
                        yield f"data: {json.dumps({'kind': 'done', 'response': result_holder['response']})}\n\n"
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
