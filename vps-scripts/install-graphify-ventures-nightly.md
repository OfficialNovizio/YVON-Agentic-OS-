# Install — nightly venture graph rebuild (graphify-ventures-nightly.sh)

Automates the per-venture graph + MemPalace rebuild: every night, for every
venture with `repo_url` + `github_pat` set, runs `graphify-venture.sh` +
`mempalace-venture.sh` — which rebuild the code graph and semantic palace,
**push the `yvon-graph` branch to GitHub**, and **upsert status/counts into
`venture_graphs` / `venture_repo_knowledge`**. No button, no SSH, no manual
anything.

## What you need on the VPS (all present already)

- `/root/.yvon-supabase.env` — SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  MEMPALACE_PGVECTOR_DSN (the clean source of truth; the script sources it
  directly and never touches the wrapper's systemd env).
- `graphify` (pipx) + the `mempalace` venv at `/opt/yvon-tools/venvs/mempalace`.
- The script itself — see below (until the repo is pushed to origin, the
  VPS checkout is stale, so copy it over by hand once).

## Install (two commands)

```bash
# 1. Copy the script onto the VPS (stopgap — until the repo is pushed, the
#    VPS checkout won't have it; once origin is current, `git pull` on the
#    VPS keeps it fresh automatically).
scp vps-scripts/graphify-ventures-nightly.sh root@169.58.107.148:/root/YVON-Agentic-OS-/vps-scripts/

# 2. Install the cron (on the VPS, as root — same style as the existing
#    graphify-cron.sh entry). 03:15 UTC every day.
ssh root@169.58.107.148
crontab -e
# add:
15 3 * * * /bin/bash /root/YVON-Agentic-OS-/vps-scripts/graphify-ventures-nightly.sh >> /var/log/yvon-venture-nightly/cron.log 2>&1
```

Also fix the branch check in `graphify-venture.sh` (the "orphan checkout
failed" bug hit 2026-08-25 — `show-ref` on a local tracking ref vs
`ls-remote` asking origin): the repo copy is already patched; until the repo
is pushed, copy it over too:

```bash
scp system-harness/graph-brain/ci/graphify-venture.sh root@169.58.107.148:/root/YVON-Agentic-OS-/system-harness/graph-brain/ci/
```

## First run — today, not tonight

Run it once manually (detached — it takes 30–60 min the first time, the
mempalace mine on the full tree):

```bash
ssh root@169.58.107.148
nohup /bin/bash /root/YVON-Agentic-OS-/vps-scripts/graphify-ventures-nightly.sh >> /var/log/yvon-venture-nightly/cron.log 2>&1 &
```

Watch it without blocking:

```bash
tail -f /var/log/yvon-venture-nightly/main.log
```

Each venture's build output lands in `/var/log/yvon-venture-nightly/<slug>.<ts>.log` —
if a build fails, the main log says which log to read. The board truth is
Supabase:

```sql
select vg.venture_slug, vg.status, vg.node_count,
       vrk.status, vrk.entry_count
from venture_graphs vg join venture_repo_knowledge vrk using (venture_slug)
order by vg.updated_at desc nulls last;
```

## Notes / knowns

- **Sequential by design**: one venture at a time, graphify before mempalace —
  both are CPU/RAM-heavy; this keeps the box stable and the logs readable.
- **Locked**: if a run is still alive when the next night's cron fires, the
  new run skips cleanly (`main.log` says so).
- **PAT visibility**: the PAT is passed as a script argument, so it shows in
  `ps` during each build — same as Rebuild Now does today. Rotate it when
  convenient; the Technical-tab field + this script pick up the new one
  automatically.
- **Rebuild Now (button) still uses the wrapper env** — whose
  `MEMPALACE_PGVECTOR_DSN` was corrupted and is fixed on disk but not yet
  proven in the running process. If the button still 502s on the palace
  after this install, run `systemctl restart yvon-hermes-http` and retry —
  the config files are clean now. The nightly path does not depend on this.
