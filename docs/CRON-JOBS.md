# Cron jobs — register and decision log

**Status: all scheduled jobs are FROZEN.** `dashboard/vercel.json` declares no
`crons` array. Nothing in this project runs on a timer right now.

This file is the register. Every scheduled job we want — existing, frozen, or
merely proposed — gets an entry below. When we have enough of them to see the
shape of the problem, we pick a platform once (§4) and turn them on together,
rather than adding them one at a time until something breaks again.

Last updated: 2026-08-21.

---

## 1. Why they were frozen

Three jobs were registered in `dashboard/vercel.json`. Vercel's Hobby plan
allows **two**. The repo's own pre-push `deploy-gate` hook caught this and
blocked every push:

```
✗ vercel.json crons (3) > hobby limit (2) in dashboard — trim or upgrade plan
❌ deploy-gate FAIL — 1 finding(s) block the push
```

The gate was right — Vercel would have rejected the deploy itself. For a
while this was worked around with `git push --no-verify`, which is worse than
it sounds: `--no-verify` skips **all seven** gate checks, not just the cron
one, so `tsc`, undeclared imports, `bare_supabase` and the rest went
unverified on those pushes too.

None of the three jobs was urgent, so rather than pick a loser under pressure
we froze all of them and wrote this file.

## 2. What "frozen" means here

Frozen ≠ deleted. For each job below:

- the **route still exists** and still works
- it is still **auth-gated** by `Authorization: Bearer $CRON_SECRET`
- it can be invoked **by hand at any time** (see §5)
- only the **schedule** is gone

Un-freezing a job is re-registering its schedule somewhere. No code needs to
be rewritten.

## 3. The register

### 3.1 Frozen — previously live

| Job | Route | Old schedule | What it does |
|---|---|---|---|
| Morning brief | `/api/briefing` | `0 7 * * *` (07:00 UTC) | Wakes Marcus (CEO), Kai (analyst) and Nate (growth), has them write analytics + strategy for the active venture, saves the result as a brief. This is what makes a summary be *waiting* for you in the morning instead of you asking for one. `maxDuration = 60`. |
| Trend scrape | `/api/trending` | `0 9 * * *` (09:00 UTC) | Scrapes Google Trends ("small business marketing") and r/smallbusiness top-of-day via Apify, runs results past a fast model, upserts trending items. `maxDuration = 30`. |
| OrgBook lead pull | `/api/job-hunt/companies/leads/cron` | `0 8 * * *` (08:00 UTC) | Pulls company leads from OrgBook BC. One keyword's pagination per run, cursor persisted in `company_lead_pull_state` (migration 131), cycling all 29 keywords and wrapping forever. `maxDuration = 60`. |

**Note on trend scrape:** it returns `500 APIFY_TOKEN must be set` and exits
immediately if Apify was never configured. If that was the case, this job had
been failing every morning at 09:00 without anyone noticing — worth
confirming before un-freezing it rather than restoring a job that never ran.

### 3.2 Proposed — never scheduled

Things `docs/MASTER.md` describes as scheduled that have **no implementation
and no schedule**. MASTER.md says so itself: *"no actual scheduled/cron
monitoring job … exists anywhere in this repo yet."* Listed so they aren't
mistaken for things that run.

| Job | Where described | Intended cadence |
|---|---|---|
| Field monitor | `rag/field_monitor.py` (MASTER.md) | weekly, via self_improver |
| Self improver | `rag/self_improver.py` (MASTER.md) | Sunday 00:00 UTC |
| RAG / graph health check | MASTER.md daily rows | daily |

### 3.3 Add new entries here

When a new scheduled job is wanted, append a row **before** building it:

```
| <name> | <route or script> | <wanted cadence> | <what it does, and what breaks if it doesn't run> |
```

The last column is the one that matters. A job nobody misses when it fails is
a job that should not be scheduled.

## 4. Platform decision — OPEN

To be decided once §3 is fuller. The options, with what we already know:

**A. Vercel crons** — where the three used to live.
Hobby allows 2 registered entries and runs each at most once per day. Simple
(one array in `vercel.json`, deploys with the app), but the 2-entry ceiling is
exactly what caused this freeze, and it is a hard limit on the plan, not a
soft one.

**B. VPS systemd timer / crontab** — the Contabo box at `169.58.107.148`.
Already runs 24/7 under systemd for `yvon-hermes-http`. No job-count limit, no
per-run duration limit, any cadence. Costs nothing extra since the machine is
already paid for and running. Downside: schedules live outside the repo unless
we commit the unit files, and a job's failure is only visible in `journalctl`
rather than a dashboard.

**C. Supabase pg_cron** — currently unused; zero hits repo-wide.
Natural fit for jobs that are purely database work. Wrong fit for anything
needing our Next.js route handlers or agent calls.

**D. Upgrade the Vercel plan.** Raises the cron ceiling. Only worth it if
we're paying for other Pro features anyway.

**Leaning:** B for anything that is background data collection with no UI
waiting on it (the OrgBook pull is the clear case), A for the small number of
jobs that genuinely belong to the web app's lifecycle. Not decided.

**Bear in mind:** whatever we pick, the `deploy-gate` check stays. If we go
back to Vercel crons, the 2-entry limit is enforced at push time again — by
design. Don't `--no-verify` past it.

## 5. Running a frozen job by hand

All three routes take `GET` with a bearer token. `CRON_SECRET` is read through
`lib/secrets.ts`, not a plain env var — pull the real value from wherever
secrets are stored rather than guessing.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
     "https://<your-vercel-domain>/api/briefing?venture=yvon-os"
```

Same shape for `/api/trending` and `/api/job-hunt/companies/leads/cron`. The
OrgBook one is resumable, so calling it repeatedly walks through the keyword
list one step at a time — it is safe to run more than once.

## 6. What a cron is *not*

Recorded because it came up and is easy to mix up.

The Hermes **kanban board is not a scheduler.** Cards appear there because
`mirrorToKanban()` in `dashboard/lib/create-task-spec.ts` POSTs one at the
moment a task is created — you accepting a task proposal in chat, or running
`/assign-task`. It is event-driven and synchronous, and it is explicitly a
*mirror*: `store/tasks/TS-NNN.yaml` is the source of truth, and a failed
kanban write never fails task creation.

The `graphify` post-commit hook is likewise event-driven — it fires on commit,
not on a clock.

A cron is the other shape entirely: **nobody does anything and it runs anyway.**
That is the only reason to want one, and the test for whether a job in §3.3
really needs to be scheduled.

## 7. History

| Date | Change |
|---|---|
| 2026-08-21 | All three crons removed from `dashboard/vercel.json`; this register created. Routes untouched. Reason: 3 jobs on a 2-job plan was blocking every push, and none of the three was needed yet. |
