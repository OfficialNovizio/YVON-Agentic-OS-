#!/usr/bin/env bash
# quarantine.sh — no-Docker sandbox-first promotion box (MASTER §7.7 TIER-1)
# ==========================================================================
# The lighter quarantine tier: when OpenSandbox's container (TIER-2, Docker/K8s)
# is unavailable, untrusted candidates are still fetched into a THROWAWAY dir
# OUTSIDE the repo, safety-scanned (warden), and claim-checked BEFORE anything
# is promoted. Weaker than a kernel-isolated container, but real quarantine:
# the repo is never written until the promotion gate passes.
#
# Usage:
#   cli/quarantine.sh <name> git <repo-url>
#   cli/quarantine.sh <name> npm <package>
#
# Exit: 0 = PASS (safe to promote) · 1 = FAIL (findings) · 2 = usage error
# Never promotes automatically — prints the promote step for the operator/agent.
set -uo pipefail

NAME="${1:-}"; KIND="${2:-}"; SRC="${3:-}"
[ -z "$NAME" ] || [ -z "$KIND" ] || [ -z "$SRC" ] && { echo "usage: quarantine.sh <name> <git|npm> <source>"; exit 2; }

BOX="$(mktemp -d "/tmp/quarantine-${NAME}.XXXXXX")"
LOGDIR="$(cd "$(dirname "$0")/.." && pwd)/store/quarantine"
mkdir -p "$LOGDIR"
LOG="$LOGDIR/${NAME}.log"
findings=0
say(){ echo "$1" | tee -a "$LOG"; }

say "── QUARANTINE ($NAME) $(date -u +%FT%TZ) ─────────────────"
say "box: $BOX (throwaway, outside repo)"
say "source: $KIND $SRC"

# ── 1. FETCH into the box (never the repo) ──────────────────────────────
case "$KIND" in
  git) git clone --depth 1 "$SRC" "$BOX/pkg" >>"$LOG" 2>&1 || { say "❌ fetch failed"; rm -rf "$BOX"; exit 1; } ;;
  npm) ( cd "$BOX" && npm pack "$SRC" >>"$LOG" 2>&1 && tar -xzf ./*.tgz && mv package pkg ) || { say "❌ fetch failed"; rm -rf "$BOX"; exit 1; } ;;
  *)   say "❌ unknown kind: $KIND"; rm -rf "$BOX"; exit 2 ;;
esac
PKG="$BOX/pkg"
# Guard: a fetch that produced no real files (empty repo, failed checkout) must
# FAIL, never silently pass the scan.
filecount="$(find "$PKG" -type f -not -path '*/.git/*' 2>/dev/null | wc -l | tr -d ' ')"
if [ "$filecount" -eq 0 ]; then
  say "❌ fetch produced 0 files (empty/failed checkout) — FAIL"; rm -rf "$BOX"; exit 1
fi
say "✅ fetched into box ($filecount files)"

# ── 2. SAFETY SCAN (warden) — dangerous patterns in fetched code ────────
scan(){ # <label> <regex>
  local hits
  hits="$(grep -rInE "$2" "$PKG" --include='*.js' --include='*.mjs' --include='*.ts' \
        --include='*.sh' --include='*.py' --include='package.json' 2>/dev/null | head -5)"
  if [ -n "$hits" ]; then say "⚠️  [$1]"; echo "$hits" | sed 's/^/       /' | tee -a "$LOG" >/dev/null; findings=$((findings+1)); fi
}
say "── safety scan (warden) ──"
# lifecycle hooks that run code on install
if [ -f "$PKG/package.json" ] && grep -qE '"(pre|post)?install"[[:space:]]*:' "$PKG/package.json"; then
  say "⚠️  [install-hook] package.json defines an install lifecycle script"; findings=$((findings+1))
fi
scan "pipe-to-shell"   'curl[^|]*\|[[:space:]]*(ba)?sh|wget[^|]*\|[[:space:]]*(ba)?sh'
scan "eval-exec"       '\beval\(|child_process|exec\(|execSync|os\.system|subprocess\.(Popen|call|run)'
scan "obfuscation"     'base64[[:space:]]*-d|atob\(|Buffer\.from\([^,]+,[[:space:]]*.base64'
scan "net-exfil"       'https?://[^"'"'"' ]+(\?|/).*(token|key|secret|env)'
scan "cred-read"       'process\.env\.[A-Z_]*(KEY|TOKEN|SECRET|PASSWORD)|~/\.ssh|/etc/passwd'

# ── 3. CLAIM CHECK (does it do what it claims?) ─────────────────────────
say "── claim check ──"
if [ -n "${CLAIM_GLOB:-}" ]; then
  n="$(find "$PKG" -path "$CLAIM_GLOB" 2>/dev/null | wc -l | tr -d ' ')"
  say "   claim glob '$CLAIM_GLOB' → $n matches (expect ≥ ${CLAIM_MIN:-1})"
  [ "$n" -lt "${CLAIM_MIN:-1}" ] && { say "❌ claim not met"; findings=$((findings+1)); }
else
  say "   (no CLAIM_GLOB set — skipping content assertion)"
fi

# ── 4. VERDICT + promote instructions (never auto-promote) ──────────────
say "── verdict ──"
if [ "$findings" -eq 0 ]; then
  say "✅ PASS — 0 findings. Safe to promote."
  say "   PROMOTE: copy vetted artifact from $PKG into the repo, then register in"
  say "            Teams/Shared OS/tools/shared-tool-registry.md"
  say "   box kept for inspection: $BOX (rm -rf when done)"
  exit 0
else
  say "❌ FAIL — $findings finding(s). NOT promoted. Box destroyed."
  rm -rf "$BOX"
  exit 1
fi
