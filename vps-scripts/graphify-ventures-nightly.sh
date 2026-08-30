#!/usr/bin/env bash
# graphify-ventures-nightly.sh — automatic nightly venture graph + MemPalace
# rebuild (2026-08-25, operator decision: the rebuild runs itself — no
# Rebuild Now button, no SSH session, no 4am debugging).
#
# For every venture with repo_url + github_pat set, runs
# graphify-venture.sh then mempalace-venture.sh — sequentially (they are
# CPU/RAM-heavy; one at a time keeps the box stable), detached with per-run
# logs. The scripts themselves already: rebuild the code graph + semantic
# palace, push the yvon-graph branch to GitHub, and upsert status/counts
# into venture_graphs / venture_repo_knowledge. This script only feeds them.
#
# Lessons baked in (2026-08-25 session):
#   · env sourced from /root/.yvon-supabase.env — the clean source of truth.
#     The wrapper's systemd env carried a corrupted DSN; never trust it here.
#   · detached (nohup) — a dropped SSH session cannot kill a build.
#   · per-venture logs + a main log that points at them — failures are
#     visible, never swallowed.
#   · single-run lock — a long mine cannot overlap the next night's run.
#
# Install: vps-scripts/install-graphify-ventures-nightly.md (one crontab line).
#
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEMPALACE_PGVECTOR_DSN —
# read from $YVON_SUPABASE_ENV (/root/.yvon-supabase.env by default).

set -u

ENV_FILE="${YVON_SUPABASE_ENV:-/root/.yvon-supabase.env}"
CI_DIR="${YVON_GRAPH_CI_DIR:-/root/YVON-Agentic-OS-/system-harness/graph-brain/ci}"
LOG_DIR="${YVON_VENTURE_NIGHTLY_LOG_DIR:-/var/log/yvon-venture-nightly}"
LOCK="/tmp/yvon-venture-nightly.lock"

[ -f "$ENV_FILE" ] || { echo "✗ env file missing: $ENV_FILE" >&2; exit 1; }
set -a; source "$ENV_FILE"; set +a
: "${SUPABASE_URL:?SUPABASE_URL must be set in $ENV_FILE}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY must be set in $ENV_FILE}"
: "${MEMPALACE_PGVECTOR_DSN:?MEMPALACE_PGVECTOR_DSN must be set in $ENV_FILE}"

mkdir -p "$LOG_DIR"
MAIN="$LOG_DIR/main.log"
log() { echo "$(date -u +%FT%TZ) $1" >> "$MAIN"; }

# ── mempalace time-box ────────────────────────────────────────────────────
# 2026-08-27: cap raised 120m → 7h — the old 120m cap killed yvon-os's healthy
# 5h+ mine (see mempalace-venture.sh's mine-timeout note). Must exceed the mine
# timeout (6h default) plus init/export/push overhead.
#
# 2026-08-30: hoisted OUT of the venture loop. These two lines used to sit
# BELOW the log line that interpolates ${MEMPALACE_VENTURE_CAP_MIN}; under
# `set -u` that unbound reference is fatal, so every run died on the first
# venture immediately after its graphify finished — mempalace never ran again
# for any venture, and no venture after the first was processed at all.
# Confirmed against the DB: graphify kept updating nightly while every
# mempalace row went stale from the night this was introduced (0592b6c).
# They are loop-invariant anyway, so the loop is no place to define them.
MEMPALACE_VENTURE_CAP="${MEMPALACE_VENTURE_CAP:-25200}"
MEMPALACE_VENTURE_CAP_MIN=$((MEMPALACE_VENTURE_CAP / 60))

# ── single-run lock ──────────────────────────────────────────────────────
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  log "skip — previous nightly run still alive (pid $(cat "$LOCK"))"
  exit 0
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT

TS=$(date -u +%Y%m%dT%H%M%SZ)
log "nightly venture graph rebuild starting (run $TS)"

# ── ventures ready to build (repo_url + github_pat both set) ──────────────
LIST="$LOG_DIR/ventures.$TS.list"
if ! curl -fsS -G "$SUPABASE_URL/rest/v1/ventures" \
  --data-urlencode "select=slug,repo_url,github_pat" \
  --data-urlencode "repo_url=not.is.null" \
  --data-urlencode "github_pat=not.is.null" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  | python3 -c "import sys, json
for v in json.load(sys.stdin):
    print(v['slug'] + chr(9) + v['repo_url'] + chr(9) + v['github_pat'])" \
  > "$LIST"; then
  log "✗ ventures query failed — aborting run"
  exit 1
fi

COUNT=$(grep -c . "$LIST" || true)
log "  $COUNT venture(s) ready for rebuild"
[ "$COUNT" = "0" ] && { log "  nothing to do — done"; exit 0; }

# ── one venture's full rebuild ────────────────────────────────────────────
# A function called in a SUBSHELL below, so a fatal error inside it (an
# unbound variable under `set -u`, a bad path, anything) can only kill that
# one venture's iteration — never the whole run.
#
# 2026-08-30, why this exists: the header above has always promised
# "failures are visible, never swallowed", but the loop body ran inline. When
# the mempalace log line referenced ${MEMPALACE_VENTURE_CAP_MIN} before it was
# assigned, `set -u` aborted the ENTIRE script on the first venture, straight
# after its graphify succeeded. Result: mempalace never ran for anybody and no
# venture past the first was touched — silently, for three consecutive nights,
# because the abort happened before any failure could be logged. The ordering
# bug is fixed (the caps are hoisted above the loop), but the fragility that
# turned one bad line into a total outage is fixed here.
run_venture() {
  local SLUG="$1" REPO_URL="$2" PAT="$3"

  log "  $SLUG — graphify-venture.sh (60m cap)"
  # 2026-08-26: timeout caps — a stalled step (embedding host, model call,
  # giant repo) can no longer hang the nightly forever and hold the lock so
  # every following night is skipped (hit live 2026-08-25→26: mempalace mine
  # stuck at [4/6] for over a day). Each venture is time-boxed; a timeout
  # fails that venture cleanly and the run moves on.
  # < /dev/null on every child: the while loop's stdin IS the ventures list
  # file, and an interactive child (see mempalace-venture.sh [4/6]) will
  # otherwise swallow the NEXT line as its input — skipping a venture and
  # ending the loop early (hit live 2026-08-25 on novizio → yvon-os).
  nohup timeout 3600 bash "$CI_DIR/graphify-venture.sh" "$SLUG" "$REPO_URL" "$PAT" < /dev/null >> "$LOG_DIR/$SLUG.$TS.log" 2>&1 &
  if wait $!; then log "    ✓ graphify ok"; else log "    ✗ graphify failed or timed out (60m) — see $LOG_DIR/$SLUG.$TS.log"; fi

  # mempalace runs even if graphify failed — they mine different things, and a
  # graphify failure is not a reason to skip the semantic pass.
  log "  $SLUG — mempalace-venture.sh (${MEMPALACE_VENTURE_CAP_MIN}m cap)"
  nohup timeout "$MEMPALACE_VENTURE_CAP" bash "$CI_DIR/mempalace-venture.sh" "$SLUG" "$REPO_URL" "$PAT" < /dev/null >> "$LOG_DIR/$SLUG.$TS.log" 2>&1 &
  if wait $!; then log "    ✓ mempalace ok"; else log "    ✗ mempalace failed or timed out (${MEMPALACE_VENTURE_CAP_MIN}m) — see $LOG_DIR/$SLUG.$TS.log"; fi
}

# ── one venture at a time; each build detached but awaited ────────────────
FAILED=0
while IFS=$'\t' read -r SLUG REPO_URL PAT; do
  [ -n "${SLUG:-}" ] || continue
  [ -n "${REPO_URL:-}" ] || continue
  # Subshell + `|| ...`: an abort inside run_venture is contained here and
  # reported, instead of taking the rest of the fleet down with it.
  if ! ( run_venture "$SLUG" "$REPO_URL" "$PAT" ); then
    FAILED=$((FAILED + 1))
    log "    ✗✗ $SLUG aborted unexpectedly (not a build failure — the venture step itself crashed); continuing with the next venture"
  fi
done < "$LIST"

if [ "$FAILED" -gt 0 ]; then
  log "nightly run done WITH $FAILED aborted venture(s) (run $TS)"
else
  log "nightly run done (run $TS)"
fi
