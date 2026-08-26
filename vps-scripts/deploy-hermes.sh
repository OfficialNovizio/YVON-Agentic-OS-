#!/usr/bin/env bash
# deploy-hermes.sh — ship vps-scripts/yvon-hermes-http/main.py to the VPS,
# safely, with a verified rollback path.
#
# WHY THIS EXISTS
#   Everything from Step 1a (per-tier iteration caps, pool recycling, 429
#   retries 8→2, skill cap) and Step 1b (the tool-callback arity fix, workdir
#   instruction, per-turn token meter) is committed to git but INERT — the VPS
#   is still running its old copy of main.py. This is the one command between
#   the work and it taking effect.
#
# WHERE THE PATHS COME FROM (not guesses)
#   The live probe reported the venture checkout at
#       /opt/yvon-hermes-http/workspaces/novizio/OfficialNovizio-Novizio-Web
#   main.py computes that dir as
#       os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspaces")
#   so __file__ is /opt/yvon-hermes-http/main.py. Confirmed, not assumed.
#   The unit name comes from vps-scripts/yvon-hermes-http/systemd/
#   yvon-hermes-http.service in this repo.
#
# SAFETY
#   - refuses to deploy a file that does not compile locally
#   - keeps a timestamped backup on the VPS
#   - compiles the file remotely BEFORE restarting anything
#   - health-checks after restart, and AUTO-ROLLS-BACK if the service does not
#     come back healthy
#   - never prints secrets
#
# USAGE
#   bash vps-scripts/deploy-hermes.sh                  # deploy
#   bash vps-scripts/deploy-hermes.sh --dry-run        # show what it would do
#   bash vps-scripts/deploy-hermes.sh --rollback       # restore last backup
#   SSH_TARGET=root@1.2.3.4 bash vps-scripts/deploy-hermes.sh
set -uo pipefail

SSH_TARGET="${SSH_TARGET:-root@hermes.yvon.in}"
REMOTE_DIR="${REMOTE_DIR:-/opt/yvon-hermes-http}"
REMOTE_FILE="$REMOTE_DIR/main.py"
SERVICE="${SERVICE:-yvon-hermes-http}"
HEALTH_URL="${HEALTH_URL:-https://hermes.yvon.in/healthz}"
SSH_OPTS="${SSH_OPTS:--o ConnectTimeout=15 -o StrictHostKeyChecking=accept-new}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_FILE="${LOCAL_FILE:-$HERE/yvon-hermes-http/main.py}"
[ -f "$LOCAL_FILE" ] || LOCAL_FILE="$HERE/main.py"

DRY_RUN=0; ROLLBACK=0
for a in "$@"; do
  case "$a" in
    --dry-run)  DRY_RUN=1 ;;
    --rollback) ROLLBACK=1 ;;
    -h|--help)  sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "unknown flag: $a"; exit 2 ;;
  esac
done

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }

run_remote() { ssh $SSH_OPTS "$SSH_TARGET" "$@"; }

health() {
  # returns 0 when /healthz answers 200
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -m 15 "$HEALTH_URL" || echo 000)"
  [ "$code" = "200" ]
}

say "Hermes deploy"
info "local  : $LOCAL_FILE"
info "remote : $SSH_TARGET:$REMOTE_FILE"
info "service: $SERVICE"

# ── rollback path ────────────────────────────────────────────────────────
if [ "$ROLLBACK" = "1" ]; then
  say "Rolling back to the most recent backup"
  LATEST="$(run_remote "ls -1t $REMOTE_DIR/main.py.bak.* 2>/dev/null | head -1")"
  [ -n "$LATEST" ] || { bad "no backup found in $REMOTE_DIR"; exit 1; }
  info "restoring $LATEST"
  run_remote "cp '$LATEST' '$REMOTE_FILE' && systemctl restart $SERVICE" || { bad "rollback failed"; exit 1; }
  sleep 4
  if health; then ok "rolled back and healthy"; else bad "rolled back but /healthz is not 200 — check: journalctl -u $SERVICE -n 50"; exit 1; fi
  exit 0
fi

# ── 1. local preflight ───────────────────────────────────────────────────
say "1 · Local preflight"
[ -f "$LOCAL_FILE" ] || { bad "local main.py not found at $LOCAL_FILE"; exit 1; }
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile "$LOCAL_FILE" 2>/dev/null \
    && ok "compiles locally" \
    || { bad "local main.py does NOT compile — refusing to deploy"; python3 -m py_compile "$LOCAL_FILE"; exit 1; }
else
  info "python3 not on this machine; skipping local compile (remote check still runs)"
fi
LOCAL_SHA="$(shasum -a 256 "$LOCAL_FILE" | cut -c1-12)"
ok "sha256 $LOCAL_SHA  ($(wc -l < "$LOCAL_FILE" | tr -d ' ') lines)"

# quick sanity: are the fixes actually in this file?
grep -q 'def on_tool_start(\*cb_args' "$LOCAL_FILE" && ok "contains the tool-callback arity fix" || bad "arity fix NOT present — wrong file?"
grep -q '_meter_snapshot'                "$LOCAL_FILE" && ok "contains the per-turn token meter"   || bad "token meter NOT present"
grep -q 'MAX_ITER_BY_TIER'            "$LOCAL_FILE" && ok "contains per-tier iteration caps"    || bad "tier caps NOT present"

# ── 2. connectivity ──────────────────────────────────────────────────────
say "2 · Connectivity"
run_remote "true" 2>/dev/null && ok "ssh to $SSH_TARGET" || {
  bad "cannot ssh to $SSH_TARGET"
  info "override with:  SSH_TARGET=user@host bash $0"
  exit 1
}
run_remote "test -f '$REMOTE_FILE'" && ok "found $REMOTE_FILE" || { bad "$REMOTE_FILE does not exist — check REMOTE_DIR"; exit 1; }
REMOTE_SHA="$(run_remote "sha256sum '$REMOTE_FILE' | cut -c1-12")"
info "remote sha $REMOTE_SHA  →  local sha $LOCAL_SHA"
[ "$REMOTE_SHA" = "$LOCAL_SHA" ] && { ok "already identical — nothing to deploy"; exit 0; }

if health; then ok "service healthy before deploy"; else info "warning: /healthz not 200 before deploy"; fi

if [ "$DRY_RUN" = "1" ]; then
  say "Dry run — stopping here"
  info "would back up $REMOTE_FILE, copy the local file over it,"
  info "compile it remotely, restart $SERVICE, then health-check."
  exit 0
fi

# ── 3. backup + copy ─────────────────────────────────────────────────────
say "3 · Backup and copy"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$REMOTE_FILE.bak.$STAMP"
run_remote "cp '$REMOTE_FILE' '$BACKUP'" && ok "backed up → $BACKUP" || { bad "backup failed — aborting"; exit 1; }

TMP="/tmp/main.py.incoming.$STAMP"
scp $SSH_OPTS -q "$LOCAL_FILE" "$SSH_TARGET:$TMP" && ok "uploaded to $TMP" || { bad "scp failed"; exit 1; }

# ── 4. remote syntax check BEFORE touching the running service ───────────
say "4 · Remote syntax check"
run_remote "python3 -m py_compile '$TMP'" \
  && ok "compiles on the VPS" \
  || { bad "does NOT compile on the VPS — service untouched, nothing changed"; run_remote "rm -f '$TMP'"; exit 1; }

run_remote "mv '$TMP' '$REMOTE_FILE'" && ok "installed" || { bad "install failed"; exit 1; }

# ── 5. restart + health, with auto-rollback ──────────────────────────────
say "5 · Restart"
run_remote "systemctl restart $SERVICE" && ok "restart issued" || {
  bad "restart failed — rolling back"
  run_remote "cp '$BACKUP' '$REMOTE_FILE' && systemctl restart $SERVICE"
  exit 1
}

printf '    waiting for health'
HEALTHY=0
for _ in $(seq 1 20); do
  printf '.'
  if health; then HEALTHY=1; break; fi
  sleep 2
done
printf '\n'

if [ "$HEALTHY" = "1" ]; then
  ok "healthy — deploy complete"
  run_remote "systemctl is-active $SERVICE" >/dev/null && ok "$SERVICE is active"
else
  bad "service did not come back healthy — AUTO-ROLLING BACK"
  run_remote "cp '$BACKUP' '$REMOTE_FILE' && systemctl restart $SERVICE"
  sleep 5
  if health; then bad "rolled back; the OLD main.py is running again"; else bad "rollback also unhealthy — investigate now"; fi
  say "Last 40 log lines"
  run_remote "journalctl -u $SERVICE -n 40 --no-pager" || true
  exit 1
fi

# ── 6. what to do next ───────────────────────────────────────────────────
say "Verify the fix"
cat <<'NEXT'
    node dashboard/_hermes_probe4.mjs --label after-deploy

  Compare against the before-deploy rows in dashboard/_hermes_bench.jsonl.
  The three things that should change:

    tool events      0  →  non-zero      (the swallowed TypeError is fixed)
    llmCalls       n/a  →  a real number (the loop multiplier, finally visible)
    estInputTokens n/a  →  a real number

  If tool events are STILL 0 while the reply contains real file data, the
  callback signature differs again on this build — send me the output and the
  normalizers in on_tool_start will need another shape.

  To undo:  bash vps-scripts/deploy-hermes.sh --rollback
NEXT
