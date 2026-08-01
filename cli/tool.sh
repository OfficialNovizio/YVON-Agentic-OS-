#!/usr/bin/env bash
# tool.sh — on-demand tool loader.
# ---------------------------------------------------------------------------
# Only the tool you name runs; everything else stays silent (no resident
# services, no memory footprint). Each Docker tool is self-contained in
# Teams/Shared OS/tools/<name>/docker-compose.yml with its own DBs, so `up`
# starts exactly one. (Config lives in Shared OS; containers/volumes/.env do not.)
#
# Usage:
#   cli/tool.sh list                 # every tool this launcher knows + ready/needs-config
#   cli/tool.sh up    <name>         # start just that tool
#   cli/tool.sh down  <name>         # stop it (and free its RAM)
#   cli/tool.sh status               # what's currently running
#   cli/tool.sh logs  <name>         # follow its logs
#
# Design: "install all, load only what's needed."
# ---------------------------------------------------------------------------
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/Teams/Shared OS/tools"

die() { echo "❌ $*" >&2; exit 1; }
compose_file() { echo "$TOOLS/$1/docker-compose.yml"; }

cmd="${1:-}"; name="${2:-}"

case "$cmd" in
  list)
    echo "On-demand tools (Teams/Shared OS/tools/<name>/docker-compose.yml):"
    if [ -d "$TOOLS" ]; then
      for d in "$TOOLS"/*/; do
        [ -d "$d" ] || continue
        n="$(basename "$d")"
        if [ -f "$d/docker-compose.yml" ]; then echo "  ✓ $n  (ready)"; else echo "  … $n  (needs-config)"; fi
      done
    else
      echo "  (none scaffolded yet)"
    fi
    ;;
  up)
    [ -n "$name" ] || die "usage: cli/tool.sh up <name>"
    f="$(compose_file "$name")"; [ -f "$f" ] || die "no compose for '$name' (run: cli/tool.sh list)"
    command -v docker >/dev/null 2>&1 || die "docker not found — install Docker Desktop first"
    echo "▸ starting $name (only this tool will run)…"
    docker compose -f "$f" up -d && echo "✓ $name up. stop with: cli/tool.sh down $name"
    ;;
  down)
    [ -n "$name" ] || die "usage: cli/tool.sh down <name>"
    f="$(compose_file "$name")"; [ -f "$f" ] || die "no compose for '$name'"
    docker compose -f "$f" down && echo "✓ $name stopped (RAM freed)"
    ;;
  status)
    command -v docker >/dev/null 2>&1 || die "docker not found"
    docker ps --filter "name=yvon-" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    ;;
  logs)
    [ -n "$name" ] || die "usage: cli/tool.sh logs <name>"
    f="$(compose_file "$name")"; [ -f "$f" ] || die "no compose for '$name'"
    docker compose -f "$f" logs -f
    ;;
  *)
    echo "usage: cli/tool.sh list|up|down|status|logs [name]"
    exit 1 ;;
esac
