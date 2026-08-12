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
import re
import subprocess
import sys
import threading
import time
import urllib.request
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

# ── Dashboard-configured provider (Settings → AI Provider, 2026-08-11) ──────
# Settings writes to Supabase `ai_provider_keys` via /api/ai-keys — previously
# that table had no consumer, so the "AI Provider" card was a static label
# with no effect. This reads the is_active=true row fresh on every NEW agent
# session (not cached, not per-message) and overrides the config.yaml-sourced
# defaults above. Falls back to those defaults — i.e. today's known-working
# behavior — on any error, so a bad row or a Supabase hiccup degrades to the
# old static config instead of breaking chat.
#
# provider string mapping: what the dashboard/detectProviderFromUrl calls a
# provider is not always the literal string hermes-agent's AIAgent expects
# (confirmed live 2026-08-11 via /usr/local/lib/hermes-agent/plugins/model-providers/
# — 'anthropic' and 'deepseek' are real plugin dirs and map straight through;
# native OpenAI is a built-in, not a plugin, and only responds to 'openai-api'
# per the live-tested hermes-config.contabo.yaml; anything else — a custom or
# unrecognized OpenAI-compatible endpoint — goes through the 'custom' plugin,
# which is what base_url + api_key are for).
_PROVIDER_STRING_MAP = {
    "anthropic": "anthropic",
    "deepseek": "deepseek",
    "openai": "openai-api",
}


def _fetch_active_provider_config() -> Optional[dict[str, Any]]:
    """Return {provider, model, api_key, base_url} for the Settings-configured
    active provider, or None (caller falls back to config.yaml defaults)."""
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return None
    try:
        req = urllib.request.Request(
            f"{url}/rest/v1/ai_provider_keys?is_active=eq.true&select=provider,api_key,base_url,fast_model,synthesis_model&limit=1",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            rows = json.loads(resp.read())
        if not rows:
            return None
        row = rows[0]
        provider_key = str(row.get("provider") or "").strip().lower()
        if not provider_key or not row.get("api_key"):
            return None
        return {
            "provider": _PROVIDER_STRING_MAP.get(provider_key, "custom"),
            "model": row.get("synthesis_model") or row.get("fast_model") or None,
            "api_key": row["api_key"],
            "base_url": row.get("base_url") or None,
        }
    except Exception as exc:  # noqa: BLE001 — never let this block agent creation
        log.debug("active-provider fetch failed (falling back to config.yaml): %s", exc)
        return None

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
# Repo-mode toggle (2026-08-11, dashboard RepoModeToggle.tsx): clone/pull
# destination for GitHub-mode turns, and the one shared PAT for private repos
# (discovery decision — one token, not per-user OAuth). Neither is set by
# install.sh; GITHUB_PAT is optional (public repos clone fine without it —
# see _ensure_repo_clone's degrade-loudly behavior on auth failure).
REPO_WORKSPACES_DIR = os.environ.get("YVON_REPO_WORKSPACES_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspaces"))
GITHUB_PAT = os.environ.get("GITHUB_PAT", "").strip()
REPO_CLONE_TIMEOUT_S = int(os.environ.get("YVON_REPO_CLONE_TIMEOUT", "120"))

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
            # Provider/model resolution order (2026-08-11): Settings → AI
            # Provider (ai_provider_keys, is_active=true) first, since that's
            # what a person actually configured in the dashboard; falls back
            # to /root/.hermes/config.yaml's static defaults if no row is
            # active or the fetch fails for any reason. This only runs once
            # per NEW (user, room) session — an existing pooled agent keeps
            # whatever it was created with until it naturally expires
            # (POOL_IDLE_TTL_S) or the room reopens, by design (Settings
            # question, 2026-08-11: "new sessions only", not a forced
            # mid-conversation switch).
            _active = _fetch_active_provider_config()
            if _active:
                log.info("using Settings-configured provider=%s model=%s", _active["provider"], _active["model"])
            _agent_kwargs = dict(
                session_id=f"web-{user_id}-{room_id}",
                model=(_active["model"] if _active else None) or HERMES_MODEL_DEFAULT or None,
                provider=(_active["provider"] if _active else None) or HERMES_PROVIDER_DEFAULT or None,
                api_key=_active["api_key"] if _active else None,
                base_url=_active["base_url"] if _active else None,
                max_iterations=MAX_ITERATIONS,
                quiet_mode=True,
                save_trajectories=False,
                skip_context_files=False,
                load_soul_identity=False,
                skip_memory=False,
            )
            # TS-018 WI-8/WI-12 — Defect C (YVON-CHAT §4.3): `terminal` and
            # `code_execution` are registered only under platform_toolsets.cli
            # (hermes-config.contabo.yaml). With no platform argument, AIAgent
            # may default to a toolset that excludes them — which surfaces as
            # "bash commands not recognized". Pass the cli platform so the
            # tools load. The exact kwarg name lives in hermes-agent source on
            # the box (not tracked here), so we degrade loudly: try `platform`,
            # then `toolset`, then bare — each fallback logs a warning.
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


_TOKEN_IN_URL_RE = re.compile(r"://[^@/]+@")


def _redact(text: str) -> str:
    """Strip any embedded credentials from a URL before it hits a log line or
    an SSE event — git error messages sometimes echo the remote URL back
    verbatim, and that URL may carry GITHUB_PAT (see _ensure_repo_clone)."""
    return _TOKEN_IN_URL_RE.sub("://***@", text)


def _repo_slug(repo_url: str) -> str:
    """'https://github.com/org/repo.git' → 'org-repo'. Falls back to a hash
    of the URL if it doesn't parse cleanly — never lets a malformed URL
    become a path-traversal-shaped directory name."""
    cleaned = repo_url.strip().rstrip("/")
    if cleaned.endswith(".git"):
        cleaned = cleaned[: -len(".git")]
    parts = [p for p in re.split(r"[/:]", cleaned) if p]
    tail = "-".join(parts[-2:]) if len(parts) >= 2 else (parts[-1] if parts else "repo")
    safe = re.sub(r"[^a-zA-Z0-9_.-]", "_", tail)
    return safe or f"repo-{abs(hash(repo_url)) % 10_000}"


def _ensure_repo_clone(repo_url: str, room_id: str) -> tuple[Optional[str], Optional[str]]:
    """Repo-mode toggle (2026-08-11): clone `repo_url` into a deterministic
    per-room workspace dir, or `git pull --ff-only` if it's already there
    (discovery decision: clone once, pull every turn). Runs synchronously —
    callers must dispatch it off the event loop (asyncio.to_thread).

    Returns (workdir_path, None) on success, or (None, redacted_error) on
    failure — the caller degrades loudly rather than silently falling back
    (see chat_stream). GITHUB_PAT is optional: public repos clone fine
    without it; a private repo without it fails with a clear auth message
    the caller surfaces verbatim (redacted) to the dashboard.
    """
    os.makedirs(REPO_WORKSPACES_DIR, exist_ok=True)
    workdir = os.path.join(REPO_WORKSPACES_DIR, room_id, _repo_slug(repo_url))

    auth_url = repo_url
    if GITHUB_PAT and repo_url.startswith("https://"):
        auth_url = repo_url.replace("https://", f"https://x-access-token:{GITHUB_PAT}@", 1)

    try:
        if os.path.isdir(os.path.join(workdir, ".git")):
            proc = subprocess.run(
                ["git", "-C", workdir, "pull", "--ff-only"],
                capture_output=True, text=True, timeout=REPO_CLONE_TIMEOUT_S,
            )
        else:
            os.makedirs(workdir, exist_ok=True)
            proc = subprocess.run(
                ["git", "clone", auth_url, workdir],
                capture_output=True, text=True, timeout=REPO_CLONE_TIMEOUT_S,
            )
        if proc.returncode != 0:
            return None, _redact((proc.stderr or proc.stdout or "git exited non-zero").strip()[:500])
        return workdir, None
    except subprocess.TimeoutExpired:
        return None, f"git operation timed out after {REPO_CLONE_TIMEOUT_S}s"
    except Exception as exc:  # noqa: BLE001 — surface any clone failure, never swallow
        return None, _redact(str(exc))[:500]


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
    # Repo-mode toggle (2026-08-11, dashboard RepoModeToggle.tsx): 'github'
    # only ever arrives paired with repo_url — the dashboard resolves it from
    # the active venture's own repo_url column, never an arbitrary client URL.
    repo_mode: Optional[str] = Field(default=None, description="'local' (default) or 'github' — see repo_url")
    repo_url: Optional[str] = Field(default=None, description="Venture's linked GitHub repo, only set when repo_mode='github'")
    # TS-018 WI-2 fix (2026-08-11): the dashboard now mints one correlation per
    # turn at message-creation time and forwards it here. Previously this
    # endpoint always minted its own uuid4() below, disconnected from the
    # dashboard's input.analysis/chat.conversation events for the same turn —
    # past-turn reconstruction (dashboard's /api/chat/events?correlation=)
    # only ever found this wrapper's own run.*/phase.* events as a result.
    correlation: Optional[str] = Field(default=None, description="Turn correlation minted by the dashboard; reused verbatim if present")


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
    # one indexed query. Assigned here (moved up from below, 2026-08-11) so
    # the repo-mode clone/pull notice below can also carry it.
    # Fix (2026-08-11): reuse the dashboard's own correlation when it sends
    # one (req.correlation, see ChatRequest above) instead of always minting
    # a fresh, disconnected one — this is what unifies run.started/
    # phase.classify/phase.resolve/run.completed with the dashboard's own
    # input.analysis/chat.conversation events under one id per turn.
    _correlation = req.correlation or str(uuid.uuid4())

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
    # Repo-mode toggle (2026-08-11, dashboard RepoModeToggle.tsx): clone/pull
    # the venture's repo BEFORE the agent turn starts, then STEER it there via
    # a prompt instruction rather than mutating the pooled AIAgent's own
    # terminal.cwd config — that per-session override isn't a confirmed-safe
    # kwarg (see _agent_for's own comment above), so this is the same
    # prompt-steering pattern as the task-proposal marker below: a strong
    # nudge, not a hard guarantee the agent will actually `cd` there.
    # Degrades loudly on failure — a `notice` SSE event either way, so the
    # dashboard's CAOS panel shows the real outcome, never a silent no-op.
    if req.repo_mode == "github" and req.repo_url:
        repo_workdir, repo_error = await asyncio.to_thread(_ensure_repo_clone, req.repo_url, req.room_id)
        if repo_workdir:
            on_notice("info", f"repo ready · {req.repo_url} → {repo_workdir}")
            prompt_parts.append(
                f"[WORKING REPO] Your working repo for this turn is checked out at: {repo_workdir}\n"
                f"`cd {repo_workdir}` before running any terminal/code_execution commands this turn — "
                f"do not work in your default directory."
            )
        else:
            on_notice("error", f"repo clone/pull failed ({req.repo_url}): {repo_error} — staying in default directory")
            prompt_parts.append(
                f"[WORKING REPO] Cloning/pulling {req.repo_url} failed: {repo_error}. "
                f"Continue in your default working directory and tell the user the clone failed."
            )
    # Task-proposal marker (2026-08-11): instructs the model to self-signal
    # when a discussion has just reached a concrete, actionable conclusion
    # the user could hand off as real work. This is prompt steering, not a
    # hard guarantee — there's no function-calling grammar constraining the
    # model's output here, so compliance is best-effort, not deterministic.
    # dashboard/app/api/chat/stream/route.ts looks for this fenced block,
    # strips it from the visible reply, and emits it as a `task.proposed`
    # event (jsonb payload, correlated to the turn) instead of raw text.
    prompt_parts.append(
        "[TASK PROPOSAL — optional] If, and only if, this discussion has just "
        "reached a concrete, actionable conclusion the user could hand off as "
        "real work (not for routine questions or ongoing exploration), end "
        "your reply with a fenced block exactly like this, on its own lines:\n"
        "```task-proposal\n"
        '{"title": "<short task title>", "summary": "<1-3 sentence summary of what would be done>"}\n'
        "```\n"
        "Do not include this block unless the discussion is genuinely resolved "
        "and ready to move to execution. Never fabricate a title or summary "
        "that misrepresents what was actually discussed."
    )
    prompt_parts.append(req.message)
    full_prompt = "\n".join(prompt_parts)

    result_holder: dict[str, Any] = {"response": None, "error": None}

    # ── run lifecycle → event log (architecture §5.4) ───────────────────────
    # One event per mentioned agent; unaddressed turns are attributed to 'system'.
    # Fire-and-forget: emit() never blocks and never raises (see events.py).
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
