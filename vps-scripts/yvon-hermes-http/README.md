# yvon-hermes-http

FastAPI wrapper exposing Hermes's `AIAgent` as an SSE-streaming HTTP endpoint.

**Runs on the VPS. Nginx puts TLS + `hermes.yvon.in` in front. Dashboard on Vercel talks to it via `POST /v1/chat/stream`.**

## Architecture

```
Vercel dashboard          Hostinger VPS
       │                        │
       │  POST /v1/chat/stream  │  yvon-hermes-http (FastAPI @ 127.0.0.1:8765)
       ├───────────── SSE ──────┤            │
       │  Authorization: Bearer <token>      │  imports run_agent.AIAgent
       │                        │            │  session pool by (user_id, room_id)
       │                        │            │
       │                        │            ▼
       │                        │        hermes_cli + skills + tools + MCP
       │                        │            │
       │                        │  reads    ▼
       │                        │  /root/.hermes/.env  · config.yaml · state.db
```

## Deploy

**One-time**, on the VPS as root:

```bash
# 1. Get the code (either from git, or the same paste-and-run below)
mkdir -p /opt/yvon-hermes-http && cd /opt/yvon-hermes-http
# (copy main.py + pyproject.toml here — see install.sh)

# 2. Run install.sh — creates venv, installs deps, generates bearer token,
#    installs the systemd unit, sets up nginx + certbot, starts everything.
bash install.sh
```

The `install.sh` prints the bearer token at the end — add it to your Vercel env vars as `HERMES_TOKEN` alongside `HERMES_URL=https://hermes.yvon.in`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET  | `/healthz`     | none    | Basic health (used by monitoring + install smoke test) |
| POST | `/v1/chat/stream` | Bearer | Send a message, receive SSE-streamed tokens + final `done` |
| GET  | `/v1/pool`     | Bearer  | Inspect the session pool |
| POST | `/v1/pool/drop`   | Bearer | Evict a specific `(user_id, room_id)` session |

## Environment

| Var | Default | Purpose |
|---|---|---|
| `HERMES_HOME` | `/usr/local/lib/hermes-agent` | Where hermes-agent is installed (contains `run_agent.py`) |
| `YVON_HERMES_TOKEN_PATH` | `/etc/yvon-hermes/token` | File holding the bearer token (mode 0600) |
| `YVON_HERMES_POOL_TTL` | `1800` | Idle seconds before an agent is evicted from pool |
| `YVON_HERMES_MAX_ITER` | `40` | Max tool-calling iterations per `.chat()` |
| `YVON_HERMES_KEEPALIVE` | `15` | SSE keepalive-ping interval |
