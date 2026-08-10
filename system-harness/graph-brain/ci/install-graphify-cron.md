# Installing the Graphify VPS cron

`system-harness/graph-brain/YVON-GRAPH.md` §4.4. Not installed by this session — no SSH/VPS credentials
were available in the sandbox that wrote it, and the one configured network path
(`HERMES_URL`/`HERMES_TOKEN` in `dashboard/.env.local`) is not reachable from that sandbox either
(`curl $HERMES_URL/healthz` → connection refused, the same restriction already documented
elsewhere in this repo for `*.supabase.co`). This doc is the handoff: run these steps the next
time someone has a real shell on the VPS.

## 1. Copy the script over

```bash
scp system-harness/graph-brain/ci/graphify-cron.sh root@<vps-host>:/root/graphify-cron.sh
ssh root@<vps-host> chmod +x /root/graphify-cron.sh
```

(`<vps-host>` — see `vps-scripts/MIGRATE-TO-CONTABO.md` for the current one; not repeated here
since it changes independently of this doc.)

## 2. Confirm prerequisites are already on the VPS

- `graphify` on PATH — installed by `vps-scripts/install-tools.sh` §5 (`pipx install graphifyy`).
  Confirm: `which graphify`.
- Node 18+ — already required by Hermes itself.
- The repo checked out at `/root/YVON-Agentic-OS-` (or set `GRAPH_REPO_ROOT` to wherever it
  actually lives).

## 3. Give it Supabase credentials

The script needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — the same service-role key
already in `/root/.hermes/.env` on the VPS (never the anon key; the `graphs` bucket's write
policy is `service_role`-only, see `dashboard/supabase/migrations/113_graphs_storage_bucket.sql`).
Add a small env file the systemd unit below sources, e.g. `/root/.graphify-cron.env`:

```
SUPABASE_URL=https://cjjllgexiecesgwenpph.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<the real key — copy from /root/.hermes/.env, do not retype from memory>
```

`chmod 600 /root/.graphify-cron.env` — same handling as any other secret file on this box.

## 4. Install as a systemd timer (matches this repo's existing service pattern)

`/etc/systemd/system/graphify-cron.service`:

```ini
[Unit]
Description=Nightly graphify extract + structure refresh + Storage upload (graph-brain §4.4)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=root
EnvironmentFile=/root/.graphify-cron.env
ExecStart=/root/graphify-cron.sh
```

`/etc/systemd/system/graphify-cron.timer`:

```ini
[Unit]
Description=Run graphify-cron nightly

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl daemon-reload
systemctl enable --now graphify-cron.timer
systemctl list-timers graphify-cron.timer   # confirm it's scheduled
```

## 5. First run + verify

```bash
systemctl start graphify-cron.service   # run once immediately, don't wait for 03:30
journalctl -u graphify-cron.service -n 50 --no-pager
```

Expect to see all five steps (`[1/5]`…`[5/5]`) complete and a final `Done.` line. Then confirm
from anywhere with Supabase access:

```sql
-- via the Supabase SQL editor or MCP execute_sql
select name, updated_at from storage.objects
where bucket_id = 'graphs' and name = 'graphify/latest.json';
```

A recent `updated_at` confirms the upload path works end to end. Also check that
`/opt/yvon-hermes-http/agent-alias.json` on the VPS has a fresh mtime — that's step 4/5, the one
the doc calls "the highest-probability silent failure in the system" if it's ever skipped.

## Once this is running, close out these YVON-GRAPH.md items

- §5 "Missing → Graphify VPS cron + Storage upload" moves to Built.
- §4.4's "Current state is broken for automation" note is stale — remove it.
- Consider then removing `dashboard/public/graph-full.json` (9.1 MB) from git per §4.4's
  recommendation, now that Storage + a signed URL (Q9) actually serves the same data. That's a
  separate, deliberate git change — not bundled into this install.
