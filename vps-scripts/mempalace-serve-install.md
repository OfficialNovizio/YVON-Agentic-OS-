# MemPalace Phase 2 — VPS-resident `serve` install — SCAFFOLD, NOT APPLIED

**Status: `[planned]` — nothing here has been run on the VPS. Phase 1 (Claude Code sessions,
`pgvector` backend, no VPS component) is what's actually live — see `system-harness/adr/ADR-001-mempalace-episodic-backend.md`
and `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §6.**

**Gate: do not run this until `docs/MASTER-PLAN.md` reaches P9** — the chat system needs to
actually be live (Priority 0 committed/verified, P1–P6 done) before a resident shared-palace
service has a real consumer. Standing up Phase 2 early is premature infrastructure with nobody
to use it — same reasoning `hermes-patch-notes.md` applies to not patching Hermes on an
unconfirmed hypothesis.

Owner (when triggered): ops (VPS deploy) + dana (data/backend review) + dev (sign-off, per
ADR-001).

---

## Why this exists now, even unrun

So Phase 2 is "easy to connect and shift" per the operator's instruction — the install path is
worked out and reviewable today, not re-derived from scratch whenever P9 arrives.

## What Phase 2 changes vs Phase 1

| | Phase 1 (live) | Phase 2 (this file, not run) |
|---|---|---|
| Where it runs | Claude Code session sandbox, per-session, ephemeral | VPS (Contabo, same box as Hermes), persistent |
| Data | Supabase Postgres, `pgvector` backend | Same — unchanged |
| Access | Direct CLI (`mempalace mine/search`) | `mempalace serve` — HTTP MCP endpoint, shared by multiple clients |
| Consumers | This Claude Code session only | Dashboard backend, Hermes, any Claude Code session |
| Persistence | None needed (re-install per session) | Systemd-managed, always-on |

## Install (when gate clears)

```bash
# On the VPS, alongside the existing Hermes install:
uv tool install mempalace
# or, for a version-pinned/reproducible install:
pip install "mempalace[pgvector]"==<pin-to-whatever-version-was-current-at-Phase-1>

# Point at the SAME Supabase Postgres project Phase 1 used — one shared palace, not a new one:
export MEMPALACE_BACKEND=pgvector
export MEMPALACE_PGVECTOR_DSN="<same DSN as Phase 1 — do not create a second backend>"
```

### Docker alternative (matches the pattern already used for `opensandbox` in the tool registry)

```bash
docker pull ghcr.io/mempalace/mempalace:latest
docker run -d --name mempalace-serve --restart unless-stopped \
  -p 127.0.0.1:<port>:<port> \
  -e MEMPALACE_BACKEND=pgvector \
  -e MEMPALACE_PGVECTOR_DSN="<same DSN as Phase 1>" \
  -v mempalace-data:/data \
  ghcr.io/mempalace/mempalace serve
```

Bind to `127.0.0.1` only, same posture as the existing Hermes dashboard API (`:9119`,
loopback-only, no bearer token) — do not expose publicly without adding auth first; `serve`'s own
auth options need checking against current docs before this is enabled (unconfirmed as of this
scaffold — add to whatever probe covers Phase 2 activation).

## systemd unit (draft — mirrors `yvon-hermes-http.service`'s shape, not copy-pasted from it)

```ini
[Unit]
Description=MemPalace shared palace server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mempalace serve --backend pgvector
EnvironmentFile=/root/.mempalace/.env    # holds MEMPALACE_PGVECTOR_DSN — not in this repo, never committed
Restart=on-failure
# No ReadWritePaths/ProtectSystem tuning needed — MemPalace doesn't touch the repo checkout,
# only the Postgres backend. Unlike Hermes, this has no Defect-A/B class of problem to inherit.

[Install]
WantedBy=multi-user.target
```

## MCP client wiring (repo-side and Hermes-side, once serve is live)

```json
{
  "mcpServers": {
    "mempalace": {
      "url": "http://<vps-internal-address>:<port>",
      "transport": "http"
    }
  }
}
```

Exact transport/auth fields need verifying against MemPalace's current `serve` docs when this is
actually triggered — treat the block above as a placeholder shape, not a copy-paste-ready config.

## Activation checklist (when P9 is reached)

1. Confirm `MASTER-PLAN.md` Priority 0 is done and P1–P6 verified live (not just gated).
2. Confirm the same `MEMPALACE_PGVECTOR_DSN` used in Phase 1 — one palace, not a fork.
3. Run the install above, start the systemd unit, confirm `mempalace serve` responds on
   loopback.
4. Wire the dashboard backend's context-injection code (`dashboard/app/api/chat/context`,
   per `MASTER-PLAN.md` P9) to call it.
5. Wire Hermes similarly — gated on Hermes's own containment fix (`MASTER-PLAN.md` §2.2)
   actually being live first, so a new write-capable integration isn't added to an
   ungoverned runtime.
6. Update `Teams/Shared OS/tools/shared-tool-registry.md`'s MemPalace row from "Phase 1" to
   "Phase 2 live," with real verified specifics — same discipline as every other entry in that
   file.
7. quinn gate before anything here is called "done."
