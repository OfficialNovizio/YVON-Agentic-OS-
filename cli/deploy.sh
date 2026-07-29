#!/usr/bin/env bash
# deploy.sh — end-to-end deploy loop (TS-007).
# Wires §7.1/§7.3 workflow loops across git + Vercel:
#
#   1. Local pre-push gate (cli/verify-deploy.sh) — 7 static checks
#   2. git push origin <branch>
#   3. Watch Vercel deployment (cli/vercel-watch.sh) — poll + classify
#
# Replaces the manual "run gate → git push → paste log" cycle. On external
# (Vercel) failure, classifies the error against known patterns and prints a
# precise fix — instead of you having to relay logs back.
#
# Usage:
#   cli/deploy.sh                # push current branch, watch, classify
#   cli/deploy.sh --skip-watch   # push only (no Vercel watch)
#   cli/deploy.sh --no-verify    # skip the pre-push gate (NOT recommended)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null)
[ -z "$BRANCH" ] && { echo "❌ not a git repo"; exit 1; }

SKIP_GATE=0
SKIP_WATCH=0
while [ "${1:-}" ]; do
  case "$1" in
    --no-verify) SKIP_GATE=1; shift ;;
    --skip-watch) SKIP_WATCH=1; shift ;;
    *) shift ;;
  esac
done

echo "══════════════════════════════════════════════════════════════"
echo "  YVON deploy · branch=$BRANCH · $(date +%H:%M:%S)"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── 1/3  local pre-push gate ────────────────────────────────────────────────
if [ "$SKIP_GATE" -eq 0 ]; then
  echo "▸ 1/3  pre-push gate"
  if ! "$ROOT/cli/verify-deploy.sh"; then
    echo ""
    echo "❌ gate blocked the push — fix the findings above, then re-run."
    echo "   emergency bypass (NOT recommended): cli/deploy.sh --no-verify"
    exit 1
  fi
  echo ""
else
  echo "▸ 1/3  pre-push gate SKIPPED (--no-verify)"
  echo ""
fi

# ── 2/3  git push ───────────────────────────────────────────────────────────
echo "▸ 2/3  git push origin $BRANCH"
if ! git -C "$ROOT" push origin "$BRANCH"; then
  echo "❌ push failed (network / auth / conflict)"
  exit 1
fi
echo ""

# ── 3/3  watch Vercel ───────────────────────────────────────────────────────
if [ "$SKIP_WATCH" -eq 1 ]; then
  echo "▸ 3/3  Vercel watch SKIPPED (--skip-watch)"
  echo "   check manually: https://vercel.com"
  exit 0
fi

echo "▸ 3/3  watching Vercel deployment"
"$ROOT/cli/vercel-watch.sh"
