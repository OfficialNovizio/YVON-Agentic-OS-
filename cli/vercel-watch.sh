#!/usr/bin/env bash
# vercel-watch.sh — poll Vercel for the current git commit's deployment.
# Prints status; on failure, pipes the log through cli/vercel-classify.sh.
#
# Requirements (one-time on your Mac):
#   npm i -g vercel && vercel login
#
# Usage:
#   cli/vercel-watch.sh                         # watch latest git HEAD
#   cli/vercel-watch.sh --project <name>        # override project name
#
# Exit: 0 on READY · 1 on ERROR/CANCELED · 2 on setup/timeout issue
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="${VERCEL_PROJECT:-yvon-agentic-os}"
POLL_INTERVAL="${POLL_INTERVAL:-15}"
MAX_WAIT="${MAX_WAIT:-600}"   # 10min

while [ "${1:-}" ]; do
  case "$1" in
    --project) PROJECT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if ! command -v vercel >/dev/null 2>&1; then
  cat <<EOF
⚠️  vercel CLI not installed — skipping remote watch.

To enable auto-watch after every push:
  npm i -g vercel
  vercel login

Then re-run: cli/deploy.sh  (or push and re-run cli/vercel-watch.sh)
EOF
  exit 2
fi

COMMIT=$(git -C "$ROOT" rev-parse HEAD 2>/dev/null)
SHORT=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null)
[ -z "$COMMIT" ] && { echo "❌ not a git repo"; exit 2; }

echo "▸ waiting for Vercel to pick up commit $SHORT..."
START=$(date +%s)
DEPLOY_URL=""

# Wait up to 90s for the deployment to appear
while [ -z "$DEPLOY_URL" ]; do
  # `vercel ls` output columns: age, deployment url, state, ..., commit-sha
  DEPLOY_URL=$(vercel ls "$PROJECT" 2>/dev/null | awk -v c="$SHORT" '$0 ~ c {print $2; exit}')
  if [ -n "$DEPLOY_URL" ]; then break; fi
  ELAPSED=$(( $(date +%s) - START ))
  if [ "$ELAPSED" -gt 90 ]; then
    echo "⚠️  no deployment for $SHORT after 90s — did the push trigger a build?"
    echo "    manual check: https://vercel.com"
    exit 2
  fi
  sleep 5
done

echo "▸ found deployment: $DEPLOY_URL"
echo ""

# Poll status until terminal
while true; do
  INSPECT=$(vercel inspect "$DEPLOY_URL" 2>&1 || true)
  # `state` line format: "  state                READY"
  STATE=$(printf '%s\n' "$INSPECT" | awk '/^[[:space:]]+state[[:space:]]+/ {print $2; exit}')
  STATE="${STATE:-UNKNOWN}"

  case "$STATE" in
    READY)
      echo "✅ deployed successfully"
      echo "   https://$DEPLOY_URL"
      exit 0
      ;;
    ERROR|CANCELED)
      echo "❌ deployment $STATE"
      echo ""
      echo "── build log tail ──"
      LOG=$(vercel logs "$DEPLOY_URL" 2>&1 | tail -120)
      printf '%s\n' "$LOG"
      echo ""
      echo "── classified diagnosis ──"
      printf '%s\n' "$LOG" | "$ROOT/cli/vercel-classify.sh" || true
      exit 1
      ;;
    BUILDING|QUEUED|INITIALIZING|UNKNOWN)
      ELAPSED=$(( $(date +%s) - START ))
      if [ "$ELAPSED" -gt "$MAX_WAIT" ]; then
        echo "⚠️  timed out after ${MAX_WAIT}s in state $STATE"
        exit 2
      fi
      printf '   ...%s (%ss)\n' "$STATE" "$ELAPSED"
      sleep "$POLL_INTERVAL"
      ;;
    *)
      echo "unexpected state: $STATE"
      exit 2
      ;;
  esac
done
