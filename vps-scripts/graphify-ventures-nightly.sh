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

# ── one venture at a time; each build detached but awaited ────────────────
while IFS=$'\t' read -r SLUG REPO_URL PAT; do
  [ -n "${SLUG:-}" ] || continue
  [ -n "${REPO_URL:-}" ] || continue
  log "  $SLUG — graphify-venture.sh"
  # < /dev/null on every child: the while loop's stdin IS the ventures list
  # file, and an interactive child (see mempalace-venture.sh [4/6]) will
  # otherwise swallow the NEXT line as its input — skipping a venture and
  # ending the loop early (hit live 2026-08-25 on novizio → yvon-os).
  nohup bash "$CI_DIR/graphify-venture.sh" "$SLUG" "$REPO_URL" "$PAT" < /dev/null >> "$LOG_DIR/$SLUG.$TS.log" 2>&1 &
  if wait $!; then log "    ✓ graphify ok"; else log "    ✗ graphify failed — see $LOG_DIR/$SLUG.$TS.log"; fi

  log "  $SLUG — mempalace-venture.sh"
  nohup bash "$CI_DIR/mempalace-venture.sh" "$SLUG" "$REPO_URL" "$PAT" < /dev/null >> "$LOG_DIR/$SLUG.$TS.log" 2>&1 &
  if wait $!; then log "    ✓ mempalace ok"; else log "    ✗ mempalace failed — see $LOG_DIR/$SLUG.$TS.log"; fi
done < "$LIST"

log "nightly run done (run $TS)"
