# Hermes Runtime Patch Plan — PROBE-GATED, NOT APPLIED

**Status: `[planned]` — nothing here has been applied to the VPS.**
**Gate: run Appendix A of `docs/YVON-CHAT.md` first; paste output; then this plan
becomes diffs against facts. Until then, treating the three defects as
confirmed would risk weakening the box (§4.3 — "changing systemd hardening on an
unconfirmed hypothesis risks weakening the box for no benefit").**

Owner: raj + ops · TS-018 WI-8 · Doc source: `docs/YVON-CHAT.md` §4.
Affected (all tracked in this repo):
- `vps-scripts/hermes-config.contabo.yaml`
- `vps-scripts/yvon-hermes-http/systemd/yvon-hermes-http.service`
- `vps-scripts/yvon-hermes-http/main.py`

---

## The four defects and their fixes

| # | Defect | Evidence (repo) | Fix | Probe result that decides it |
|---|---|---|---|---|
| A | Terminal cwd is the wrapper's folder | config `terminal.cwd: .` + systemd `WorkingDirectory=/opt/yvon-hermes-http` | per-project cwd from `ventures.local_repo_path` (migration 038), not a fixed `.` | probe #5: `pwd` = `/opt/yvon-hermes-http` |
| B | Repo read-only to Hermes | `ProtectSystem=strict` + `ReadWritePaths` excludes checkouts | add each project checkout to `ReadWritePaths` explicitly — **`ProtectSystem=strict` STAYS** (§8.7) | probe #5: writes fail read-only |
| C | Terminal toolset may not be loaded | `platform_toolsets.cli` includes `terminal`/`code_execution`; `main.py` constructs `AIAgent(...)` with NO platform arg | pass the platform (or explicit toolset list) incl. `terminal` + `code_execution` to `AIAgent` | probe #4: no terminal tool listed |
| — | 180s timeout kills builds | `terminal.timeout: 180` vs `code_execution.timeout: 300` and `YVON_HERMES_MAX_ITER=40` | raise `terminal.timeout` above 300 before expecting `next build` from chat | probe #6: live config values |

## Decision matrix (Appendix A output → action)

| Probe 4/5 shows | Action |
|---|---|
| No terminal/shell tool listed | Defect C confirmed → pass platform/toolset to `AIAgent` (§4.4 toolset bullet). Do NOT touch systemd hardening yet. |
| Tool listed, `pwd` = `/opt/yvon-hermes-http` | Defect A only → set per-project cwd. |
| Tool listed, writes fail read-only | Defect B → add checkouts to `ReadWritePaths` only. |
| Tool listed, `git rev-parse` fails | no checkout on the box → clone it; also blocks the Graphify cron (`YVON-GRAPH.md` §4.4). |
| `ss` shows no 8765/9119 listener | wrapper down or dashboard API off — fix the service first (probe #7). |

## Draft diffs (written for review — NOT to run)

### A · cwd — `main.py` + config
- `main.py`: resolve the checkout path from `ventures.local_repo_path` for the
  room's workspace (Supabase lookup at turn start), pass as per-invocation cwd
  to the terminal tool IF Hermes supports it (Appendix C #3 — else per-project
  worker process; **never global `chdir()`** — cross-session corruption, §8.3).
- `hermes-config.contabo.yaml`: `terminal.cwd: .` becomes a documented default
  that per-turn overrides replace.

### B · `ReadWritePaths` — systemd unit
```ini
# add ONE line per checkout, e.g.:
ReadWritePaths=/root/.hermes /var/log /usr/local/lib/hermes-agent/logs \
    /opt/Agents /opt/novizio /opt/hourbour /opt/agentx
```
`ProtectSystem=strict` unchanged. No path is added that the wrapper does not
need — a wrapper that can write anywhere is a larger problem than one that
cannot write your repo (§4.2).

### C · toolset — `main.py`
```python
agent = AIAgent(
    session_id=f"web-{user_id}-{room_id}",
    platform="cli",            # ← probe-gated: gives terminal + code_execution
    …
)
```
Exact parameter name verified against `/usr/local/lib/hermes-agent/` on the box
at patch time.

### timeout — `hermes-config.contabo.yaml`
```yaml
terminal:
  timeout: 600   # > next build wall-time; revisit with measured builds
```

## Invariants (YVON-CHAT §8 — these do not change)

- `ProtectSystem=strict` stays; only explicit paths widen. (§8.7)
- No global `chdir()` in a pooled multi-session process. Ever. (§8.3)
- The config header rule: the toolset must never again be knowable only from a
  server that might be decommissioned (§4.4) — every applied change lands back
  in `vps-scripts/` as tracked files.
