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
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import uuid
from collections import deque
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Optional

import httpx

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse, Response
from pydantic import BaseModel, Field

# Run lifecycle → Supabase event log. Fire-and-forget; never blocks a run.
from events import emit

# ═══════════════════════════════════════════════════════════════════════════
# OpenAI TPM governor — the real fix for "Rate limit reached ... tokens per
# min (TPM)", 2026-08-21, after nine failed attempts at the wrong layer.
# ═══════════════════════════════════════════════════════════════════════════
#
# WHY EVERY PREVIOUS FIX FAILED
# -----------------------------
# Read the actual error, not the story around it:
#
#     Limit 200000, Used 145372, Requested 76781
#
# `Requested 76781` is ONE API call weighing 76.8k tokens. `Used 145372` is
# the rolling 60-second window. The limit is a RATE — tokens per minute —
# so at ~76k per call the account can afford exactly TWO calls per minute:
#
#     200000 // 76781 == 2
#
# Every fix before this one tried to reduce the NUMBER of calls:
#   · dropping the pooled agent between turns   (helps only BETWEEN turns)
#   · dropping it again on the error path       (fires after the failure)
#   · MAX_ITERATIONS 40 → 15                    (wall is hit at call #3)
#
# None of them could ever have worked, because none of them changed the
# rate. A turn dies on its third internal tool-call round-trip whether the
# cap is 40, 15, or 4 — and 4 is too low to answer anything real. That is
# why "hi" / "tell me about the project" always worked (1-2 small calls,
# ~18k each) and anything substantial always failed: the failure threshold
# was never about message length, it was about how many 76k-token
# round-trips the turn needed inside its own tool loop.
#
# THE ONLY FIX THAT ADDRESSES A RATE IS PACING
# --------------------------------------------
# So this governor sits underneath everything hermes-agent does and meters
# outbound LLM traffic against a rolling 60s token ledger. When the next
# call would breach the budget it SLEEPS until the window has drained,
# then proceeds. A long turn becomes slower instead of dead — which is the
# correct trade, and the one the previous fixes could not make.
#
# It syncs to server truth rather than guessing: OpenAI returns
# `x-ratelimit-remaining-tokens` / `x-ratelimit-reset-tokens` on every
# response, so the ledger is corrected against the provider's own view
# after each call, and the local estimate is only used to decide whether
# to wait before a call we haven't sent yet.
#
# It also fixes the second half of the message — "API call failed after 3
# retries" alongside "Please try again in 6.645s". Something upstream
# retried three times without honouring that interval, so all three
# retries were spent inside the same blocked window and the turn died with
# ~6 seconds of patience needed. Here a 429 is caught, Retry-After (header
# or message body) is parsed and actually waited out, and the request is
# re-sent.
#
# INTERCEPTION POINT: hermes-agent lives outside this repo (/usr/local/lib/
# hermes-agent) and its provider code isn't ours to edit — but every modern
# OpenAI-compatible SDK executes over httpx, which we already depend on. So
# we wrap httpx's own send() at class level, which catches all clients no
# matter when or how they were constructed. Only LLM completion endpoints
# are metered; Supabase and every other httpx call in this process passes
# straight through untouched.
#
# NOTE ON THE REMAINING COST: pacing makes long turns SUCCEED, not fast.
# At ~76k tokens per round-trip a 200k/min ceiling is inherently ~2.6
# round-trips per minute. The durable way to make them fast as well is to
# raise the account's TPM ceiling (OpenAI usage tier) — see the operator
# notes handed over with this change.
OPENAI_TPM_LIMIT = int(os.environ.get("YVON_OPENAI_TPM_LIMIT", "200000"))
# Fraction of the ceiling we allow ourselves. Never 1.0: the provider counts
# the completion's OUTPUT tokens too, which we cannot know before sending.
#
# 0.90 is deliberate arithmetic, not a round number. The failing turns sent
# ~76.8k-token calls; at 0.75 the usable budget is 150k, which fits only ONE
# such call per minute (76781 * 2 = 153562 > 150000) and stretches an
# 8-round-trip turn over seven minutes. At 0.90 the budget is 180k, two calls
# fit, and the same turn halves. The 10% reserve covers the completion's
# output tokens, which the pre-flight estimate cannot see; `observe()` then
# corrects against the provider's own counter, so the reserve is a cushion
# rather than the primary guard.
OPENAI_TPM_HEADROOM = float(os.environ.get("YVON_OPENAI_TPM_HEADROOM", "0.90"))
# Hard stop on how long one call may be held back before we send it anyway
# and let the provider decide — prevents a wedged ledger from hanging a turn.
OPENAI_TPM_MAX_WAIT_S = float(os.environ.get("YVON_OPENAI_TPM_MAX_WAIT", "120"))
OPENAI_429_MAX_RETRIES = int(os.environ.get("YVON_OPENAI_429_RETRIES", "8"))
# Endpoint paths that actually consume the token budget. Anything else
# (Supabase REST, GitHub, health checks) must never be metered or delayed.
_LLM_PATH_HINTS = ("/chat/completions", "/responses", "/v1/messages", "/completions")
# No trailing \b: OpenAI writes compound durations like "1m30s", where the
# \b after "m" never matches (it is followed by a digit) and the minutes
# component would be silently dropped — a 90s wait read as 30s, which is
# exactly the kind of too-short retry that produced "failed after 3 retries".
# `ms` must stay first in the alternation so it wins over a bare `m`.
_DURATION_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(ms|s|m|h)")


def _parse_duration_s(raw: Any, default: float = 0.0) -> float:
    """Parse OpenAI's duration strings ('6.645s', '1m30s', '500ms', '13')."""
    if raw is None:
        return default
    text = str(raw).strip()
    if not text:
        return default
    try:  # bare seconds, as a plain Retry-After header uses
        return float(text)
    except ValueError:
        pass
    total = 0.0
    matched = False
    for value, unit in _DURATION_RE.findall(text):
        matched = True
        total += float(value) * {"ms": 0.001, "s": 1.0, "m": 60.0, "h": 3600.0}[unit]
    return total if matched else default


class _TpmGovernor:
    """Rolling-60s token ledger that paces outbound LLM calls process-wide.

    Process-wide is deliberate: the provider's quota is per-organisation, so
    two rooms chatting at once share one budget. A per-room limiter would
    let two concurrent turns breach the ceiling while each believed itself
    to be within it.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._events: deque[tuple[float, int]] = deque()  # (ts, tokens)
        self._server_remaining: Optional[int] = None
        self._server_reset_at: float = 0.0
        self._server_seen_at: float = 0.0

    # ── ledger bookkeeping (callers hold no lock) ──────────────────────
    def _used_locked(self, now: float) -> int:
        while self._events and now - self._events[0][0] > 60.0:
            self._events.popleft()
        return sum(tokens for _, tokens in self._events)

    def _plan_locked(self, now: float, est: int) -> float:
        """Seconds to wait before `est` tokens may be spent. 0.0 = go now."""
        # Server truth first, while it is still fresh enough to trust.
        # Expiring it is not optional: once the stated reset has passed, the
        # provider's window has rolled over and a stale "remaining=100" would
        # otherwise re-arm the same 0.25s wait on every pass, spinning until
        # the max-wait escape hatch fires and defeating the whole governor.
        if self._server_remaining is not None:
            if now >= self._server_reset_at or now - self._server_seen_at >= 60.0:
                self._server_remaining = None
            elif self._server_remaining < est:
                return max(0.0, self._server_reset_at - now) + 0.25
        used = self._used_locked(now)
        budget = int(OPENAI_TPM_LIMIT * OPENAI_TPM_HEADROOM)
        if used + est <= budget:
            return 0.0
        oldest = self._events[0][0] if self._events else now
        return max(0.0, 60.0 - (now - oldest)) + 0.25

    def _book_locked(self, now: float, est: int) -> None:
        self._events.append((now, est))
        if self._server_remaining is not None:
            self._server_remaining = max(0, self._server_remaining - est)

    def _try_reserve(self, est: int) -> float:
        """0.0 if booked and safe to send now, else seconds to wait."""
        now = time.time()
        with self._lock:
            wait = self._plan_locked(now, est)
            if wait <= 0.0:
                self._book_locked(now, est)
            return wait

    def _force_reserve(self, est: int) -> None:
        with self._lock:
            self._book_locked(time.time(), est)

    def acquire(self, est: int) -> None:
        deadline = time.time() + OPENAI_TPM_MAX_WAIT_S
        while True:
            wait = self._try_reserve(est)
            if wait <= 0.0:
                return
            remaining = deadline - time.time()
            if remaining <= 0:
                log.warning(
                    "TPM governor: waited %.0fs for %d tokens, sending anyway",
                    OPENAI_TPM_MAX_WAIT_S, est,
                )
                self._force_reserve(est)
                return
            nap = min(wait, 5.0, remaining)
            log.info("TPM governor: holding %.1fs before a ~%d-token call", nap, est)
            time.sleep(nap)

    async def acquire_async(self, est: int) -> None:
        deadline = time.time() + OPENAI_TPM_MAX_WAIT_S
        while True:
            wait = self._try_reserve(est)
            if wait <= 0.0:
                return
            remaining = deadline - time.time()
            if remaining <= 0:
                log.warning(
                    "TPM governor: waited %.0fs for %d tokens, sending anyway",
                    OPENAI_TPM_MAX_WAIT_S, est,
                )
                self._force_reserve(est)
                return
            nap = min(wait, 5.0, remaining)
            log.info("TPM governor: holding %.1fs before a ~%d-token call", nap, est)
            await asyncio.sleep(nap)

    def observe(self, headers: Any) -> None:
        """Correct the ledger against the provider's own rate-limit headers."""
        try:
            remaining = headers.get("x-ratelimit-remaining-tokens")
            if remaining is None:
                return
            reset_in = _parse_duration_s(headers.get("x-ratelimit-reset-tokens"), 60.0)
            now = time.time()
            with self._lock:
                self._server_remaining = int(remaining)
                self._server_seen_at = now
                self._server_reset_at = now + reset_in
        except Exception:  # noqa: BLE001 — telemetry must never break a request
            pass

    def note_429(self) -> None:
        """A 429 means the real window is full regardless of what we booked."""
        with self._lock:
            self._server_remaining = 0
            self._server_seen_at = time.time()
            self._server_reset_at = max(self._server_reset_at, self._server_seen_at + 1.0)


_governor = _TpmGovernor()


def _is_llm_request(request: Any) -> bool:
    try:
        path = request.url.path or ""
    except Exception:  # noqa: BLE001
        return False
    return any(hint in path for hint in _LLM_PATH_HINTS)


def _estimate_tokens(request: Any) -> int:
    """Pre-flight size estimate from the serialised request body.

    ~4 bytes per token holds well for JSON chat payloads. It only has to be
    good enough to decide whether to wait — `observe()` replaces guesswork
    with the provider's own accounting as soon as the response lands. The
    floor covers the completion's output tokens, which no estimate can see.
    """
    try:
        body = request.content or b""
    except Exception:  # noqa: BLE001
        body = b""
    return max(1000, len(body) // 4)


def _retry_after_s(response: Any, attempt: int) -> float:
    """Honour the provider's stated wait; fall back to capped exponential."""
    header = None
    try:
        header = response.headers.get("retry-after") or response.headers.get(
            "x-ratelimit-reset-tokens"
        )
    except Exception:  # noqa: BLE001
        pass
    wait = _parse_duration_s(header, 0.0)
    if wait <= 0:
        try:  # "Please try again in 6.645s." lives in the JSON body
            body = response.text or ""
            match = re.search(r"try again in\s+([0-9.]+\s*m?s)", body, re.I)
            if match:
                wait = _parse_duration_s(match.group(1), 0.0)
        except Exception:  # noqa: BLE001
            pass
    if wait <= 0:
        wait = min(2.0 ** attempt, 30.0)
    return min(wait + 0.5, 60.0)


_orig_httpx_send = httpx.Client.send
_orig_httpx_async_send = httpx.AsyncClient.send


def _governed_send(self: httpx.Client, request: Any, **kwargs: Any) -> Any:
    if not _is_llm_request(request):
        return _orig_httpx_send(self, request, **kwargs)
    est = _estimate_tokens(request)
    attempt = 0
    while True:
        _governor.acquire(est)
        response = _orig_httpx_send(self, request, **kwargs)
        _governor.observe(response.headers)
        if response.status_code != 429 or attempt >= OPENAI_429_MAX_RETRIES:
            return response
        _governor.note_429()
        attempt += 1
        wait = _retry_after_s(response, attempt)
        log.warning(
            "TPM governor: 429 from %s — waiting %.1fs, retry %d/%d",
            getattr(request.url, "host", "?"), wait, attempt, OPENAI_429_MAX_RETRIES,
        )
        try:
            response.close()
        except Exception:  # noqa: BLE001
            pass
        time.sleep(wait)


async def _governed_send_async(self: httpx.AsyncClient, request: Any, **kwargs: Any) -> Any:
    if not _is_llm_request(request):
        return await _orig_httpx_async_send(self, request, **kwargs)
    est = _estimate_tokens(request)
    attempt = 0
    while True:
        await _governor.acquire_async(est)
        response = await _orig_httpx_async_send(self, request, **kwargs)
        _governor.observe(response.headers)
        if response.status_code != 429 or attempt >= OPENAI_429_MAX_RETRIES:
            return response
        _governor.note_429()
        attempt += 1
        wait = _retry_after_s(response, attempt)
        log.warning(
            "TPM governor: 429 from %s — waiting %.1fs, retry %d/%d",
            getattr(request.url, "host", "?"), wait, attempt, OPENAI_429_MAX_RETRIES,
        )
        try:
            await response.aclose()
        except Exception:  # noqa: BLE001
            pass
        await asyncio.sleep(wait)


httpx.Client.send = _governed_send  # type: ignore[method-assign]
httpx.AsyncClient.send = _governed_send_async  # type: ignore[method-assign]

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
# RAISED BACK 15 → 30 (2026-08-21, second pass). The 40 → 15 cut below was
# the ninth failed attempt at the TPM problem and is now superseded by the
# httpx TPM governor at the top of this file. The arithmetic that kills it:
# the failing turns showed `Requested 76781` for a SINGLE call against a
# 200000/min ceiling, so the budget affords two such calls per minute and a
# turn dies on round-trip #3 — a cap of 15 never comes into play, and a cap
# low enough to matter (2) cannot answer anything real. Iteration count was
# never the lever; rate was. With pacing in place the cap goes back to
# serving its actual purpose (stopping a runaway loop), not rationing
# tokens, so it returns to a level that lets real work finish.
#
# --- superseded reasoning kept for the record ---
# Lowered 40 → 15 (2026-08-21) after real journalctl evidence
# (agent.conversation_loop logs) showed the OpenAI TPM rate-limit failures
# are NOT caused by cross-turn pool accumulation (a brand new turn after a
# 5-minute gap started at 19,429 input tokens — barely above the very
# first call's 18,432, so the pooled agent isn't carrying a growing
# history between turns). The real driver is WITHIN a single turn's own
# internal tool-calling loop: each internal round-trip resends that turn's
# growing scratchpad, averaging ~7,500 extra tokens per round-trip in the
# observed log (two real turns: 6 and 8 internal calls, costing 27k and
# 53k tokens respectively just within themselves). A complex request
# needing 15-20+ internal steps can blow past the 200k/min ceiling
# entirely within ONE turn, before any 'done'/'error' event ever reaches
# the dashboard's pool-reset logic (app/api/chat/stream/route.ts) — that
# fix, and the auto-reset before it, only ever helps BETWEEN turns, so
# neither could touch this. Capping iterations forces a complex turn to
# stop and return its best partial answer well before its own internal
# loop can rack up enough round-trips to hit the ceiling on its own — at
# ~7.5k tokens/round-trip, 15 rounds tops out well under 150k even in the
# worst case, leaving headroom for whatever else shares the same
# per-minute quota. Override via YVON_HERMES_MAX_ITER if 15 proves too
# tight for legitimately complex tasks (a partial/truncated answer is the
# tradeoff of a lower cap — there is no way to avoid both that and the
# rate-limit failures without hermes-agent itself trimming/summarizing a
# turn's own tool-call scratchpad, which lives outside this repo).
MAX_ITERATIONS = int(os.environ.get("YVON_HERMES_MAX_ITER", "30"))
STREAM_KEEPALIVE_S = float(os.environ.get("YVON_HERMES_KEEPALIVE", "15"))
HERMES_API_URL = os.environ.get("HERMES_API_URL", "http://127.0.0.1:9119")
# Repo-mode toggle (2026-08-11, dashboard RepoModeToggle.tsx): clone/pull
# destination for GitHub-mode turns.
#
# Credential (updated 2026-08-19 — see docs/PRD, "why chat's GitHub mode
# can't authenticate" investigation): the dashboard now forwards the active
# venture's own write-scoped GitHub PAT (Settings → Venture → Technical →
# `ventures.github_pat`, Supabase) with every /v1/chat/stream request —
# `req.github_pat` below — the SAME credential graphify/MemPalace already
# use, sourced from Supabase, never typed in here. This env var is now only
# a fallback for the (rare) case a request arrives with no per-request PAT
# — e.g. a venture with a public repo and no PAT saved at all. It was never
# set by install.sh, so on a fresh box it's simply empty and inert; nothing
# to configure here for the normal path.
REPO_WORKSPACES_DIR = os.environ.get("YVON_REPO_WORKSPACES_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspaces"))
GITHUB_PAT = os.environ.get("GITHUB_PAT", "").strip()  # fallback only — see comment above
REPO_CLONE_TIMEOUT_S = int(os.environ.get("YVON_REPO_CLONE_TIMEOUT", "120"))

# ── Repo file browser + live dev-server preview (2026-08-21) ────────────────
# "Give me a URL to view the repo files, and a URL for a live localhost-style
# preview" — explicit user request. Files browser reads straight out of the
# same persistent per-venture checkout chat already works in
# (REPO_WORKSPACES_DIR); the preview actually runs `npm run dev` (or
# equivalent) for that checkout and exposes it live.
#
# Preview routing is subdomain-per-venture (<slug>.PREVIEW_DOMAIN), not a
# path prefix — most real dev servers (Next/Vite/CRA) assume they're
# mounted at a domain root and render broken (missing CSS/JS, no
# hot-reload) under a subpath. Subdomain routing needs one one-time human
# step outside this file: a wildcard DNS record for PREVIEW_DOMAIN pointing
# at this VPS, a wildcard TLS cert, and an nginx server block that reads
# NGINX_PREVIEW_MAP_PATH (this process rewrites that file + reloads nginx
# every time a dev server starts/stops — see _write_preview_port_map).
PREVIEW_DOMAIN = os.environ.get("YVON_PREVIEW_DOMAIN", "preview.yvon.in")
DEV_SERVER_PORT_BASE = int(os.environ.get("YVON_DEV_SERVER_PORT_BASE", "4100"))
DEV_SERVER_PORT_MAX = int(os.environ.get("YVON_DEV_SERVER_PORT_MAX", "4200"))
DEV_SERVER_START_TIMEOUT_S = int(os.environ.get("YVON_DEV_SERVER_START_TIMEOUT_S", "30"))
DEV_SERVER_LOG_DIR = os.path.join(REPO_WORKSPACES_DIR, "_dev_logs")
NGINX_PREVIEW_MAP_PATH = os.environ.get("YVON_NGINX_PREVIEW_MAP", "/etc/nginx/conf.d/preview-ports.map")
FILE_BROWSE_EXCLUDE_DIRS = {
    "node_modules", ".git", ".next", ".nuxt", "dist", "build", "out",
    "__pycache__", ".venv", "venv", ".turbo", ".cache", ".pytest_cache",
}
FILE_TREE_MAX_ENTRIES = 3000
FILE_MAX_BYTES = 400_000

log = logging.getLogger("yvon-hermes-http")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log.info(
    "TPM governor attached to httpx (limit=%d/min, usable=%d/min, max hold=%.0fs, 429 retries=%d)",
    OPENAI_TPM_LIMIT,
    int(OPENAI_TPM_LIMIT * OPENAI_TPM_HEADROOM),
    OPENAI_TPM_MAX_WAIT_S,
    OPENAI_429_MAX_RETRIES,
)


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
    # Added 2026-08-20 (usage/context indicator, Task #18): the resolved
    # provider/model this agent was actually created with (Settings →
    # AI Provider row, or config.yaml defaults — see _agent_for below).
    # Recorded once at creation time and reused for every turn in this
    # room, since a pooled agent keeps its original provider/model for its
    # whole lifetime by design (no mid-conversation switch — see _agent_for's
    # own 2026-08-11 comment). Reading it here means chat_stream never has
    # to re-resolve or guess which provider/model actually served a turn.
    provider: Optional[str] = None
    model: Optional[str] = None

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
            pooled = PooledAgent(
                agent=agent,
                provider=_agent_kwargs.get("provider"),
                model=_agent_kwargs.get("model"),
            )
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


# ── Usage/context indicator (2026-08-20, Task #18) ──────────────────────────
# Static, best-effort context-window sizes by model id, sourced from public
# provider docs at write time. This is NOT live data — a model's real limit
# can change or this id may simply be missing, and neither case is
# distinguishable from here. Only ever used to fill the frontend's
# "12.4k / 128k" chip; look-up miss returns None and the frontend must show
# "not available", never a guessed number. Extend this table rather than
# inventing a fallback default.
_CONTEXT_WINDOW_BY_MODEL: dict[str, int] = {
    "claude-opus-4": 200_000,
    "claude-sonnet-4": 200_000,
    "claude-3-7-sonnet": 200_000,
    "claude-3-5-sonnet": 200_000,
    "claude-3-5-haiku": 200_000,
    "claude-3-opus": 200_000,
    "gpt-4o": 128_000,
    "gpt-4o-mini": 128_000,
    "gpt-4.1": 1_047_576,
    "o3": 200_000,
    "o4-mini": 200_000,
}


def _context_window_for(model: Optional[str]) -> Optional[int]:
    """Best-effort static lookup — see _CONTEXT_WINDOW_BY_MODEL's own comment.
    Matches by substring since real model ids often carry date suffixes
    (e.g. 'claude-sonnet-4-20250514') that a plain dict.get() would miss."""
    if not model:
        return None
    m = model.lower()
    for key, window in _CONTEXT_WINDOW_BY_MODEL.items():
        if key in m:
            return window
    return None


def _extract_token_usage(agent: Any) -> Optional[dict[str, Optional[int]]]:
    """Best-effort probe for token usage on the AIAgent after a turn.

    hermes-agent's real AIAgent.chat() return shape is NOT confirmed against
    source (run_agent.py lives only on the VPS filesystem, outside this
    repo — see PRD/session notes). Rather than guess at one specific
    attribute name and silently return wrong numbers if it's missing, this
    probes a handful of common attribute names defensively and returns None
    the moment nothing recognizable is found. Callers MUST treat None as
    "not available", never as zero — see chat_stream's tokensReported flag.
    """
    candidates = ("last_usage", "usage", "token_usage", "last_token_usage", "_last_usage")
    usage_obj = None
    for attr in candidates:
        val = getattr(agent, attr, None)
        if val:
            usage_obj = val
            break
    if usage_obj is None:
        return None

    def _get(obj: Any, *names: str) -> Optional[int]:
        for n in names:
            if isinstance(obj, dict) and n in obj:
                return obj[n]
            v = getattr(obj, n, None)
            if v is not None:
                return v
        return None

    input_tokens = _get(usage_obj, "input_tokens", "prompt_tokens")
    output_tokens = _get(usage_obj, "output_tokens", "completion_tokens")
    total_tokens = _get(usage_obj, "total_tokens")
    if input_tokens is None and output_tokens is None and total_tokens is None:
        return None
    if total_tokens is None:
        total_tokens = (input_tokens or 0) + (output_tokens or 0)
    return {"inputTokens": input_tokens, "outputTokens": output_tokens, "totalTokens": total_tokens}


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


def _ensure_repo_clone(repo_url: str, venture_slug: str, github_pat: str = "") -> tuple[Optional[str], Optional[str]]:
    """Clone `repo_url` into a deterministic PER-VENTURE workspace dir, or
    `git pull --ff-only` if it's already there (clone once, pull every
    turn). Runs synchronously — callers must dispatch it off the event loop
    (asyncio.to_thread).

    Reworked 2026-08-21: was keyed by room_id (every chat room got its own
    throwaway clone of the same repo — wasteful, and meant "the repo" wasn't
    really one persistent place). Now keyed by venture_slug — ONE shared,
    persistent checkout per venture, reused across every room/turn for that
    venture, matching the single-system design (no more Local/GitHub mode
    split — see chat_stream's call site).

    `github_pat` (added 2026-08-19): the per-request PAT the dashboard
    forwards from the active venture's Settings → Venture → Technical page
    (Supabase `ventures.github_pat`) — the same credential graphify already
    uses. Preferred over the module-level GITHUB_PAT env var, which is now
    only a fallback for requests that arrive with no per-request PAT.

    Returns (workdir_path, None) on success, or (None, redacted_error) on
    failure — the caller degrades loudly rather than silently falling back
    (see chat_stream). A PAT is optional: public repos clone fine without
    one; a private repo with neither a per-request PAT nor GITHUB_PAT set
    fails with a clear auth message the caller surfaces verbatim (redacted)
    to the dashboard.
    """
    os.makedirs(REPO_WORKSPACES_DIR, exist_ok=True)
    workdir = os.path.join(REPO_WORKSPACES_DIR, venture_slug, _repo_slug(repo_url))

    pat = (github_pat or GITHUB_PAT or "").strip()
    auth_url = repo_url
    if pat and repo_url.startswith("https://"):
        auth_url = repo_url.replace("https://", f"https://x-access-token:{pat}@", 1)

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


def _repo_fingerprint(workdir: str) -> str:
    """Cheap fingerprint of a checkout's state — HEAD commit + whether the
    working tree is dirty. Compared before/after a chat turn (see
    chat_stream) to detect whether the turn actually changed the repo
    (new local commit and/or uncommitted edits), without trusting the
    model to self-report it. Empty string on any git failure — callers
    treat that as "can't tell," never as "definitely changed."""
    try:
        head = subprocess.run(
            ["git", "-C", workdir, "rev-parse", "HEAD"],
            capture_output=True, text=True, timeout=10,
        ).stdout.strip()
        status = subprocess.run(
            ["git", "-C", workdir, "status", "--porcelain"],
            capture_output=True, text=True, timeout=10,
        ).stdout
        if not head:
            return ""
        return f"{head}:{bool(status.strip())}"
    except Exception:
        return ""


def _venture_repo_dir(venture_slug: str) -> Optional[str]:
    """Find the venture's already-cloned checkout under
    REPO_WORKSPACES_DIR/<venture_slug>/ — there's normally exactly one repo
    per venture, so this just picks the first subdir with a .git in it
    rather than requiring callers to re-pass repo_url. Returns None if
    nothing's been cloned for this venture yet (_ensure_repo_clone/
    /v1/repo/ensure never ran, or it failed)."""
    venture_dir = os.path.join(REPO_WORKSPACES_DIR, venture_slug)
    if not os.path.isdir(venture_dir):
        return None
    try:
        for entry in sorted(os.listdir(venture_dir)):
            candidate = os.path.join(venture_dir, entry)
            if os.path.isdir(os.path.join(candidate, ".git")):
                return candidate
    except OSError:
        return None
    return None


def _list_repo_tree(workdir: str) -> list[dict[str, Any]]:
    """Flat file listing under workdir, path relative to workdir, skipping
    FILE_BROWSE_EXCLUDE_DIRS and .git internals. Capped at
    FILE_TREE_MAX_ENTRIES — a huge repo gets truncated, never silently
    hangs building the response."""
    entries: list[dict[str, Any]] = []
    for root, dirs, files in os.walk(workdir):
        dirs[:] = [d for d in dirs if d not in FILE_BROWSE_EXCLUDE_DIRS and not d.startswith(".git")]
        rel_root = os.path.relpath(root, workdir)
        for d in dirs:
            rel = d if rel_root == "." else os.path.join(rel_root, d)
            entries.append({"path": rel, "type": "dir"})
            if len(entries) >= FILE_TREE_MAX_ENTRIES:
                return entries
        for f in files:
            rel = f if rel_root == "." else os.path.join(rel_root, f)
            try:
                size = os.path.getsize(os.path.join(root, f))
            except OSError:
                size = None
            entries.append({"path": rel, "type": "file", "size": size})
            if len(entries) >= FILE_TREE_MAX_ENTRIES:
                return entries
    return entries


def _read_repo_file(workdir: str, rel_path: str) -> tuple[Optional[str], Optional[str]]:
    """Read rel_path from within workdir. Returns (content, None) or
    (None, error). Sandboxed via realpath — a path that escapes workdir
    (../.., a symlink out) is rejected outright, never followed."""
    target = os.path.realpath(os.path.join(workdir, rel_path))
    root = os.path.realpath(workdir)
    if target != root and not target.startswith(root + os.sep):
        return None, "path escapes the repo checkout"
    if not os.path.isfile(target):
        return None, "not a file"
    try:
        size = os.path.getsize(target)
        if size > FILE_MAX_BYTES:
            return None, f"file too large ({size} bytes, max {FILE_MAX_BYTES})"
        with open(target, "r", encoding="utf-8") as fh:
            return fh.read(), None
    except UnicodeDecodeError:
        return None, "binary file, not viewable as text"
    except OSError as exc:
        return None, str(exc)


@dataclass
class DevServerState:
    process: subprocess.Popen
    port: int
    workdir: str
    started_at: float
    log_path: str


_dev_servers: dict[str, DevServerState] = {}
_dev_servers_lock = threading.Lock()


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0


def _allocate_port(venture_slug: str) -> int:
    """Stable-ish hash into [PORT_BASE, PORT_MAX) so a venture tends to land
    on the same port across restarts, then linear-probes for a free one."""
    span = DEV_SERVER_PORT_MAX - DEV_SERVER_PORT_BASE
    start = abs(hash(venture_slug)) % span
    with _dev_servers_lock:
        taken = {s.port for s in _dev_servers.values()}
    for offset in range(span):
        candidate = DEV_SERVER_PORT_BASE + (start + offset) % span
        if candidate not in taken and not _port_in_use(candidate):
            return candidate
    raise RuntimeError("no free dev-server port available")


def _detect_start_command(workdir: str) -> Optional[list[str]]:
    """Best-effort: only the most common conventions. A project this
    doesn't recognize just gets a clear 'don't know how to start this'
    error instead of a silent no-op — never guesses wrong and hangs."""
    pkg_path = os.path.join(workdir, "package.json")
    if os.path.isfile(pkg_path):
        try:
            with open(pkg_path, "r", encoding="utf-8") as fh:
                scripts = (json.load(fh) or {}).get("scripts", {}) or {}
        except Exception:
            scripts = {}
        if "dev" in scripts:
            return ["npm", "run", "dev", "--", "--port", "{port}", "--hostname", "127.0.0.1"]
        if "start" in scripts:
            return ["npm", "run", "start", "--", "--port", "{port}"]
    if os.path.isfile(os.path.join(workdir, "manage.py")):
        return ["python3", "manage.py", "runserver", "127.0.0.1:{port}"]
    return None


def _write_preview_port_map() -> None:
    """Rewrite NGINX_PREVIEW_MAP_PATH from the live _dev_servers registry
    and reload nginx so <slug>.PREVIEW_DOMAIN routes to the right port.
    Best-effort: a missing/unwritable map path (nginx preview vhost not
    set up yet — see the module docstring above) logs a warning and never
    breaks the dev-server request itself."""
    try:
        with _dev_servers_lock:
            lines = [f"{slug} {state.port};" for slug, state in _dev_servers.items()]
        os.makedirs(os.path.dirname(NGINX_PREVIEW_MAP_PATH), exist_ok=True)
        with open(NGINX_PREVIEW_MAP_PATH, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + ("\n" if lines else ""))
        subprocess.run(["nginx", "-s", "reload"], capture_output=True, text=True, timeout=10)
    except Exception as exc:  # noqa: BLE001 — never let map-file bookkeeping break the request
        log.warning("could not update nginx preview port map at %s: %s", NGINX_PREVIEW_MAP_PATH, exc)


def _ensure_dev_server(venture_slug: str, workdir: str) -> tuple[Optional[int], Optional[str]]:
    """Start (or confirm already-running) the dev server for this venture's
    checkout. Returns (port, None) on success or (None, error) on failure.
    Runs synchronously — callers dispatch via asyncio.to_thread, matching
    _ensure_repo_clone's contract."""
    with _dev_servers_lock:
        existing = _dev_servers.get(venture_slug)
    if existing is not None and existing.process.poll() is None and existing.workdir == workdir:
        return existing.port, None
    if existing is not None and (existing.process.poll() is not None or existing.workdir != workdir):
        # Stale — process died, or the checkout moved. Drop it and start fresh.
        with _dev_servers_lock:
            _dev_servers.pop(venture_slug, None)

    cmd_template = _detect_start_command(workdir)
    if cmd_template is None:
        return None, "don't know how to start this project (no recognized package.json dev/start script or manage.py)"

    port = _allocate_port(venture_slug)
    cmd = [part.format(port=port) if "{port}" in part else part for part in cmd_template]

    os.makedirs(DEV_SERVER_LOG_DIR, exist_ok=True)
    log_path = os.path.join(DEV_SERVER_LOG_DIR, f"{venture_slug}.log")
    log_fh = open(log_path, "a", encoding="utf-8")
    log_fh.write(f"\n── starting {' '.join(cmd)} in {workdir} at {time.time()} ──\n")
    log_fh.flush()

    env = dict(os.environ)
    env["PORT"] = str(port)
    try:
        process = subprocess.Popen(
            cmd, cwd=workdir, env=env, stdout=log_fh, stderr=subprocess.STDOUT,
            start_new_session=True,
        )
    except Exception as exc:  # noqa: BLE001
        return None, f"failed to launch dev server: {exc}"

    deadline = time.time() + DEV_SERVER_START_TIMEOUT_S
    while time.time() < deadline:
        if process.poll() is not None:
            tail = ""
            try:
                with open(log_path, "r", encoding="utf-8", errors="replace") as fh:
                    tail = fh.read()[-500:]
            except OSError:
                pass
            return None, f"dev server exited immediately (code {process.returncode}): {tail}"
        if _port_in_use(port):
            with _dev_servers_lock:
                _dev_servers[venture_slug] = DevServerState(
                    process=process, port=port, workdir=workdir, started_at=time.time(), log_path=log_path,
                )
            _write_preview_port_map()
            return port, None
        time.sleep(0.5)

    process.kill()
    return None, f"dev server didn't come up on port {port} within {DEV_SERVER_START_TIMEOUT_S}s"


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
    # Reworked 2026-08-21: dropped the Local/GitHub mode toggle — one system
    # now, not two (see chat_stream's call site). repo_mode is kept as a
    # field only for backward compatibility with any caller still sending
    # it; it's no longer read anywhere. The dashboard resolves repo_url from
    # the active venture's own repo_url column — never an arbitrary client URL.
    repo_mode: Optional[str] = Field(default=None, description="Deprecated 2026-08-21, no longer read — kept for backward compat only")
    repo_url: Optional[str] = Field(default=None, description="Venture's linked GitHub repo (Settings → Venture → Technical). When set, Hermes always ensures it's cloned/pulled — no mode gate.")
    # Added 2026-08-19: the active venture's own write-scoped GitHub PAT
    # (Settings → Venture → Technical, Supabase `ventures.github_pat`) — the
    # same credential graphify/MemPalace already use. Lets Hermes clone
    # private repos without a separate VPS-side GITHUB_PAT env var.
    github_pat: Optional[str] = Field(default=None, description="Venture's GitHub PAT from Supabase, forwarded whenever repo_url is set")
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
      { "kind": "done",  "response": "...", "usage": {...} }  - full response +
                                              best-effort usage/context (2026-08-20,
                                              see _extract_token_usage) + terminal
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
    # Added 2026-08-20 (Task #18): running count of tool calls this turn, for
    # the usage chip. A one-element list, not a bare int, so the nested
    # on_tool_end closure can mutate it without a `nonlocal` declaration.
    _tool_call_count = [0]

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
        _tool_call_count[0] += 1
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
    # Reworked 2026-08-21 (explicit user decision — dropped the Local/GitHub
    # toggle entirely: "hermes keep repo work in it's vps and only push to
    # live github when i said so", confirmed "no matter local or github it
    # always talks to hermes"). One system now, not two: whenever the active
    # venture has a repo_url, Hermes ensures it's cloned/pulled — no mode
    # field gates this anymore, so there's nothing left for "local vs
    # github" to be confused about. Workspace is keyed by VENTURE, not room
    # (was room_id — every chat room re-cloned its own throwaway copy of the
    # same repo). Now it's one persistent, shared checkout per venture,
    # reused and just `git pull --ff-only`'d fresh on every turn — matches
    # how a real dev works: check out once, keep working, commit locally as
    # you go. Prompt-steered `cd` there, same pattern as before — a strong
    # nudge, not a hard guarantee. Degrades loudly on failure either way (a
    # `notice` SSE event), so the dashboard's CAOS panel shows the real
    # outcome, never a silent no-op.
    # repo_workdir/_repo_baseline_fp: initialized here (not just inside the
    # branch below) so event_generator's post-turn check further down can
    # reference them unconditionally, including on the no-repo-linked path.
    repo_workdir: Optional[str] = None
    _repo_baseline_fp: str = ""
    if req.repo_url:
        repo_workdir, repo_error = await asyncio.to_thread(
            _ensure_repo_clone, req.repo_url, req.workspace or "default", req.github_pat or ""
        )
        if repo_workdir:
            # 2026-08-21: fingerprint the checkout BEFORE the agent runs, so
            # the post-turn check (see __internal_done__ below) can tell
            # whether this turn actually changed anything — never trust the
            # model to self-report that, same discipline as everywhere else
            # in this file (ground it in real git state).
            _repo_baseline_fp = await asyncio.to_thread(_repo_fingerprint, repo_workdir)
            on_notice("info", f"repo ready · {req.repo_url} → {repo_workdir}")
            prompt_parts.append(
                f"[WORKING REPO] Your working repo for this turn is checked out at: {repo_workdir}\n"
                f"`cd {repo_workdir}` before running any terminal/code_execution commands this turn. "
                f"This is a persistent, shared checkout for this venture — not a throwaway clone — so "
                f"commit locally as normal (git add / git commit) whenever it makes sense to save "
                f"progress. But NEVER run `git push` (or anything else that reaches the real GitHub "
                f"remote) unless the user explicitly asks you to push/publish/deploy in THIS turn's "
                f"message — local commits are always fine, pushing to the live repo is not a default "
                f"action. If asked to push, do it plainly and confirm what was pushed."
            )
        else:
            on_notice("error", f"repo clone/pull failed ({req.repo_url}): {repo_error} — staying in default directory")
            prompt_parts.append(
                f"[WORKING REPO] Cloning/pulling {req.repo_url} failed: {repo_error}. "
                f"Continue in your default working directory and tell the user the clone failed."
            )
    else:
        # No repo_url saved for this venture at all (Settings → Venture →
        # Technical). Previously this branch said nothing, leaving the model
        # to guess ("not a git repo", `gh auth login`, inventing a path).
        prompt_parts.append(
            "[WORKING REPO] No repo is linked to this venture yet (Settings → Venture → "
            "Technical → Repo URL is empty). There is nothing checked out; your working "
            "directory is this process's own default, which is not a project repo. Do not "
            "guess a repo path, run git commands expecting a repo to be there, or "
            "authenticate to GitHub yourself. If the user's request needs real repo access, "
            "tell them plainly that this venture has no repo linked yet."
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

    result_holder: dict[str, Any] = {"response": None, "error": None, "token_usage": None}

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

    # Added 2026-08-20 (Task #18): wall-clock start of the actual agent
    # turn (not the HTTP request — repo-clone/pull above can itself take a
    # few seconds and shouldn't be charged to "how long did the model take").
    _turn_start_ts = time.time()

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
                # Added 2026-08-20 (Task #18): probe for token usage while
                # still holding the lock, right after the call that would
                # have set it — see _extract_token_usage's own comment on
                # why this is best-effort, not confirmed against source.
                result_holder["token_usage"] = _extract_token_usage(pooled.agent)
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
                        # Added 2026-08-20 (Task #18): usage/context indicator.
                        # provider/model/toolCalls/latencyMs/turnId are all
                        # server-resolved facts — populated unconditionally.
                        # Token counts are best-effort (see
                        # _extract_token_usage) and honestly absent
                        # (tokensReported=False) rather than guessed when the
                        # underlying AIAgent didn't expose them for this turn.
                        _tok = result_holder.get("token_usage")
                        _usage = {
                            "provider": pooled.provider,
                            "model": pooled.model,
                            "toolCalls": _tool_call_count[0],
                            "latencyMs": int((time.time() - _turn_start_ts) * 1000),
                            "turnId": _correlation,
                            "tokensReported": _tok is not None,
                            "inputTokens": (_tok or {}).get("inputTokens"),
                            "outputTokens": (_tok or {}).get("outputTokens"),
                            "totalTokens": (_tok or {}).get("totalTokens"),
                            "contextWindow": _context_window_for(pooled.model),
                        }
                        # 2026-08-21: did this turn actually change the repo?
                        # Compares the post-turn fingerprint against the
                        # pre-turn baseline captured above — real git state,
                        # not a self-reported marker. False whenever no repo
                        # was linked this turn (repo_workdir is None) or the
                        # fingerprint couldn't be read either time. The
                        # dashboard uses this to decide whether to surface
                        # the repo-files/live-preview links (see
                        # stream/route.ts) — once per room, not every turn.
                        _repo_changed = False
                        if repo_workdir:
                            _after_fp = await asyncio.to_thread(_repo_fingerprint, repo_workdir)
                            _repo_changed = bool(_after_fp) and bool(_repo_baseline_fp) and _after_fp != _repo_baseline_fp
                        yield f"data: {json.dumps({'kind': 'done', 'response': result_holder['response'], 'correlation': _correlation, 'usage': _usage, 'repoChanged': _repo_changed})}\n\n"
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


# ── Venture graphify trigger (artifact 4 of 4, client-onboarding pipeline,
# 2026-08-12) ────────────────────────────────────────────────────────────────
# Fires system-harness/graph-brain/ci/graphify-venture.sh in the background
# when a venture's repoUrl+github_pat are set/changed on the dashboard side
# (dashboard/lib/db/venture-graphify.ts calls this). Fire-and-forget from the
# caller's perspective — the script itself upserts build status into
# Supabase's venture_graphs table (migration 118) as it progresses, so the
# dashboard polls that instead of this response.
GRAPHIFY_VENTURE_SCRIPT = os.environ.get(
    "GRAPHIFY_VENTURE_SCRIPT",
    "/root/YVON-Agentic-OS-/system-harness/graph-brain/ci/graphify-venture.sh",
)


class VentureGraphifyRequest(BaseModel):
    venture_slug: str
    repo_url: str
    github_pat: str


@app.post("/v1/venture/graphify", dependencies=[Depends(require_bearer)])
async def venture_graphify(req: VentureGraphifyRequest) -> JSONResponse:
    """Kick off graphify-venture.sh for one venture, in the background.

    Returns 202 as soon as the subprocess is launched — the script runs for
    minutes (clone/pull, graphify extract, commit+push) and reports its own
    status into venture_graphs, so this response only confirms the launch,
    not completion. Never logs req.github_pat.
    """
    if not os.path.isfile(GRAPHIFY_VENTURE_SCRIPT):
        return JSONResponse(
            {"error": f"graphify-venture.sh not found at {GRAPHIFY_VENTURE_SCRIPT}"},
            status_code=500,
        )

    try:
        subprocess.Popen(
            ["bash", GRAPHIFY_VENTURE_SCRIPT, req.venture_slug, req.repo_url, req.github_pat],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,  # detach so it survives this request's worker cycling
        )
    except Exception as exc:
        log.exception("failed to launch graphify-venture.sh for %s", req.venture_slug)
        return JSONResponse({"error": str(exc)}, status_code=500)

    log.info("launched graphify-venture.sh for venture=%s", req.venture_slug)
    return JSONResponse({"started": True, "venture_slug": req.venture_slug}, status_code=202)


# ── Venture MemPalace repo-knowledge trigger (artifact 3 of 4, 2026-08-12) ──
# Sibling to /v1/venture/graphify above — semantic knowledge instead of
# structural graph. Reopens ADR-001's Phase 2 deferral narrowly, per
# system-harness/adr/ADR-002-mempalace-venture-repo-mining.md: this is an
# ephemeral per-build CLI invocation (mempalace-venture.sh), not the
# VPS-resident `mempalace serve` daemon, which stays gated behind
# MASTER-PLAN.md P9. Requires the mempalace CLI + MEMPALACE_PGVECTOR_DSN —
# see vps-scripts/install-mempalace.md.
MEMPALACE_VENTURE_SCRIPT = os.environ.get(
    "MEMPALACE_VENTURE_SCRIPT",
    "/root/YVON-Agentic-OS-/system-harness/graph-brain/ci/mempalace-venture.sh",
)


class VentureMempalaceRequest(BaseModel):
    venture_slug: str
    repo_url: str
    github_pat: str


@app.post("/v1/venture/mempalace", dependencies=[Depends(require_bearer)])
async def venture_mempalace(req: VentureMempalaceRequest) -> JSONResponse:
    """Kick off mempalace-venture.sh for one venture, in the background.

    Returns 202 as soon as the subprocess is launched. Status lands in
    venture_repo_knowledge (migration 118). Never logs req.github_pat.
    """
    if not os.path.isfile(MEMPALACE_VENTURE_SCRIPT):
        return JSONResponse(
            {"error": f"mempalace-venture.sh not found at {MEMPALACE_VENTURE_SCRIPT}"},
            status_code=500,
        )

    try:
        subprocess.Popen(
            ["bash", MEMPALACE_VENTURE_SCRIPT, req.venture_slug, req.repo_url, req.github_pat],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    except Exception as exc:
        log.exception("failed to launch mempalace-venture.sh for %s", req.venture_slug)
        return JSONResponse({"error": str(exc)}, status_code=500)

    log.info("launched mempalace-venture.sh for venture=%s", req.venture_slug)
    return JSONResponse({"started": True, "venture_slug": req.venture_slug}, status_code=202)


# ── Eager repo clone-on-save (2026-08-21) ───────────────────────────────────
# Sibling to /v1/venture/graphify and /v1/venture/mempalace above, but for the
# persistent per-venture CHAT workspace (_ensure_repo_clone, REPO_WORKSPACES_DIR)
# rather than the separate graph-brain/MemPalace pipelines — those clone into
# their own directory structure via graphify-venture.sh/mempalace-venture.sh
# and don't touch REPO_WORKSPACES_DIR at all.
#
# Design: previously the FIRST clone for a venture only happened lazily, on
# whatever chat turn happened to come in first — so the very first message
# after linking a repo paid the full clone latency, and a user who linked a
# repo but never chatted had no way to know whether it would even clone
# successfully (bad URL, bad PAT, private repo) until they tried. Now
# dashboard/lib/db/venture-graphify.ts's triggerVentureOnboarding() fires this
# alongside graphify/mempalace whenever a venture's repoUrl is (re)saved in
# Settings, so the clone (or its failure) happens right away.
#
# Unlike graphify/mempalace, this is NOT a multi-minute pipeline — a git
# clone/pull is the same fast, synchronous-under-a-thread operation chat_stream
# already awaits directly (asyncio.to_thread) — so this endpoint awaits it too
# and returns the real outcome in the response, rather than fire-and-forget
# with status landing in a separate table. Never logs req.github_pat.
class RepoEnsureRequest(BaseModel):
    venture_slug: str
    repo_url: str
    github_pat: str = ""


@app.post("/v1/repo/ensure", dependencies=[Depends(require_bearer)])
async def repo_ensure(req: RepoEnsureRequest) -> JSONResponse:
    """Clone (or pull, if already cloned) a venture's repo into its
    persistent chat workspace right now, and report the real result."""
    workdir, error = await asyncio.to_thread(
        _ensure_repo_clone, req.repo_url, req.venture_slug, req.github_pat or ""
    )
    if workdir:
        log.info("repo ensured for venture=%s → %s", req.venture_slug, workdir)
        return JSONResponse({"ok": True, "workdir": workdir})
    log.warning("repo ensure failed for venture=%s: %s", req.venture_slug, error)
    return JSONResponse({"ok": False, "error": error}, status_code=502)


# ── Repo file browser (2026-08-21) ──────────────────────────────────────────
# Read-only view into the SAME persistent checkout chat's Hermes turns cd
# into (REPO_WORKSPACES_DIR) — shows exactly what Hermes sees right now,
# including anything committed locally but not yet pushed. Never a stale
# GitHub view.
@app.get("/v1/repo/tree", dependencies=[Depends(require_bearer)])
async def repo_tree(venture_slug: str) -> JSONResponse:
    workdir = await asyncio.to_thread(_venture_repo_dir, venture_slug)
    if not workdir:
        return JSONResponse(
            {"error": "no repo cloned yet for this venture — link a repo in Settings, or send a chat message first"},
            status_code=404,
        )
    entries = await asyncio.to_thread(_list_repo_tree, workdir)
    return JSONResponse({
        "workdir": workdir,
        "truncated": len(entries) >= FILE_TREE_MAX_ENTRIES,
        "entries": entries,
    })


@app.get("/v1/repo/file", dependencies=[Depends(require_bearer)])
async def repo_file(venture_slug: str, path: str) -> JSONResponse:
    workdir = await asyncio.to_thread(_venture_repo_dir, venture_slug)
    if not workdir:
        return JSONResponse({"error": "no repo cloned yet for this venture"}, status_code=404)
    content, error = await asyncio.to_thread(_read_repo_file, workdir, path)
    if error:
        return JSONResponse({"error": error}, status_code=400)
    return JSONResponse({"path": path, "content": content})


# ── Live dev-server preview (2026-08-21) ────────────────────────────────────
# Starts (or confirms) the venture's dev server and reports the port it's
# listening on. The dashboard combines that with PREVIEW_DOMAIN to build
# https://<venture_slug>.PREVIEW_DOMAIN/ — see the module docstring above
# for the one-time nginx/DNS step this needs to actually route.
class RepoPreviewRequest(BaseModel):
    venture_slug: str


@app.post("/v1/repo/preview", dependencies=[Depends(require_bearer)])
async def repo_preview(req: RepoPreviewRequest) -> JSONResponse:
    workdir = await asyncio.to_thread(_venture_repo_dir, req.venture_slug)
    if not workdir:
        return JSONResponse({"ok": False, "error": "no repo cloned yet for this venture"}, status_code=404)
    port, error = await asyncio.to_thread(_ensure_dev_server, req.venture_slug, workdir)
    if port:
        log.info("dev server ready for venture=%s on port=%s", req.venture_slug, port)
        return JSONResponse({"ok": True, "port": port, "previewHost": f"{req.venture_slug}.{PREVIEW_DOMAIN}"})
    log.warning("dev server failed for venture=%s: %s", req.venture_slug, error)
    return JSONResponse({"ok": False, "error": error}, status_code=502)


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
