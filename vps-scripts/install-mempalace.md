# MemPalace venture-repo mining — VPS install (artifact 3, 2026-08-12)

**This is NOT Phase 2 / `mempalace serve`** — that's still gated behind `MASTER-PLAN.md` P9, per
`vps-scripts/mempalace-serve-install.md` (unchanged, still not run). This is the narrower,
ephemeral-per-build exception decided in `system-harness/adr/ADR-002-mempalace-venture-repo-mining.md`:
a dedicated venv with the `mempalace` CLI, invoked once per venture build by
`system-harness/graph-brain/ci/mempalace-venture.sh` (triggered via `POST /v1/venture/mempalace`
on the Hermes wrapper), writing into the SAME Supabase Postgres pgvector backend Phase 1 already
uses — just triggered from the VPS instead of a Claude Code session. No systemd unit, no
always-on process, nothing listening on a port.

Owner: ops (VPS install) — run once, then the trigger endpoint handles every future build.

## 1. Install the CLI into its own venv

Mirrors the `turbovec` venv convention from ADR-001 (`/opt/yvon-tools/venvs/<tool>`) — nothing
touches system Python.

```bash
ssh root@169.58.107.148
python3 -m venv /opt/yvon-tools/venvs/mempalace
/opt/yvon-tools/venvs/mempalace/bin/pip install --upgrade pip
/opt/yvon-tools/venvs/mempalace/bin/pip install "mempalace[pgvector]"
/opt/yvon-tools/venvs/mempalace/bin/mempalace --version   # confirm it installed (verified locally: 3.7.0)
```

## 2. Get the Postgres connection string (NOT the same as SUPABASE_URL)

`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (already in `/root/.yvon-supabase.env`) are REST API
credentials — PostgREST, not a raw Postgres connection. `mempalace`'s `pgvector` backend needs the
actual database DSN, from the Supabase dashboard: **Project Settings → Database → Connection
string** (use the "URI" tab; either the direct connection on port 5432 or the transaction pooler
on 6543 both work — pooler is usually the safer default for short-lived script invocations like
this one). It looks like:

```
postgresql://postgres.cjjllgexiecesgwenpph:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres
```

If a Phase-1 DSN already exists from an earlier Claude Code session, reuse that exact one — per
`mempalace-serve-install.md`'s own note, "same DSN as Phase 1 — do not create a second backend."
Claude Code sessions don't persist secrets between sessions, so if you don't have that value saved
somewhere, generate/copy it fresh from the dashboard above; it'll be the same DSN either way since
it's keyed to the project + database password, not to any particular session.

## 3. Set it on the VPS — do NOT paste the password into chat

Same discipline as the `GITHUB_PAT` setup earlier this session: type it directly into a VPS
terminal prompt, never through this chat.

```bash
ssh root@169.58.107.148
sed -i '/^MEMPALACE_PGVECTOR_DSN=/d' /root/.yvon-supabase.env   # remove any stale line first
read -sp 'Paste the Postgres connection string: ' DSN && echo
echo "MEMPALACE_PGVECTOR_DSN=$DSN" >> /root/.yvon-supabase.env
unset DSN
grep -c '^MEMPALACE_PGVECTOR_DSN=' /root/.yvon-supabase.env   # should print 1
```

`/root/.yvon-supabase.env` is already the `EnvironmentFile` for `yvon-hermes-http.service`
(confirmed this session — holds `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`GITHUB_PAT` today), so
this one extra line makes `MEMPALACE_PGVECTOR_DSN` available to `main.py`'s subprocess launches
(and therefore to `mempalace-venture.sh`, which requires it) without any systemd unit changes —
just restart the service after adding it:

```bash
systemctl restart yvon-hermes-http.service
```

## 4. First-run note

`mempalace mine` downloads a local embedding model from Hugging Face on its very first
invocation (no LLM/API key required after that — this is separate from any OpenAI key). This
sandbox's restricted network couldn't complete that download to verify the full success path
locally (confirmed: `mempalace init` completed, `mempalace mine` started but the model download
hung past a 2-minute timeout) — the VPS, with open internet, should complete it in well under a
minute on first run, and be instant on every run after. This is the biggest unverified piece of
artifact 3 — the first live `/v1/venture/mempalace` trigger is also the first real end-to-end test
of `mine`'s success path and its stdout format (which `mempalace-venture.sh`'s entry-count
parsing depends on, best-effort only until confirmed).
