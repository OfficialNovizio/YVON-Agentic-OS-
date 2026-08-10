#!/usr/bin/env bash
# install-tools.sh — provision the Python/CLI tool layer on the Contabo VPS.
# ---------------------------------------------------------------------------
# Groups D + E of the tool inventory:
#   crawl4ai · browser-use · scrapegraphai · agent-reach · strix
# Idempotent — safe to re-run. Ubuntu 24.04 system Python is "externally
# managed" (PEP-668), so EACH tool lives in its own venv under
# /opt/yvon-tools/venvs — nothing touches system Python, no --break-system-packages.
#
# Run on the box:   ssh root@169.58.107.148 'bash -s' < vps-scripts/install-tools.sh
#            or:    scp this file over, then `sudo bash install-tools.sh`
# ---------------------------------------------------------------------------
set -euo pipefail

BASE=/opt/yvon-tools
VENVS=$BASE/venvs
mkdir -p "$VENVS"

echo "▸ 1/4  prerequisites (pip, venv, pipx, git, docker)…"
apt-get update -qq
apt-get install -y -qq python3-pip python3-venv python3-full pipx git curl ca-certificates
pipx ensurepath >/dev/null 2>&1 || true

if ! command -v docker >/dev/null 2>&1; then
  echo "▸ installing Docker (needed by strix + the Group F services)…"
  curl -fsSL https://get.docker.com | sh
fi

# helper: create/refresh a venv, install a pip target, symlink named CLIs onto PATH
mkvenv () {                     # $1=name  $2=pip-target  $3..=cli names to symlink
  local name="$1"; shift
  local target="$1"; shift
  local dir="$VENVS/$name"
  echo "▸ $name  ($dir)"
  [ -d "$dir" ] || python3 -m venv "$dir"
  "$dir/bin/pip" install -q --upgrade pip
  "$dir/bin/pip" install -q $target
  for cli in "$@"; do
    [ -x "$dir/bin/$cli" ] && ln -sf "$dir/bin/$cli" "/usr/local/bin/$cli"
  done
}

echo "▸ 2/4  Group E — scraping/browser tools (own venvs)…"
mkvenv crawl4ai      "crawl4ai"      crwl crawl4ai-doctor crawl4ai-setup   # CLI is `crwl`, not `crawl4ai`
"$VENVS/crawl4ai/bin/crawl4ai-setup" || true        # pulls Playwright browsers into this venv

mkvenv browser-use   "browser-use playwright"   browser-use
"$VENVS/browser-use/bin/playwright" install chromium || true

mkvenv scrapegraphai "scrapegraphai playwright"
"$VENVS/scrapegraphai/bin/playwright" install chromium || true

echo "▸ 3/4  Group D — agent-reach (moved to VPS per operator)…"
mkvenv agent-reach   "https://github.com/Panniantong/agent-reach/archive/main.zip"   agent-reach
agent-reach install --env=auto || true              # opt-in cookie setup runs interactively later

echo "▸ 4/4  strix — autonomous security agent (Docker-backed, on-demand)…"
pipx install strix-agent || pipx install --force strix-agent
# pipx installs to /root/.local/bin which isn't on a non-login PATH → expose it
pipx ensurepath >/dev/null 2>&1 || true
[ -x /root/.local/bin/strix ] && ln -sf /root/.local/bin/strix /usr/local/bin/strix
# strix reuses Hermes's LLM key (no separate key). Set at runtime:
#   export LLM_API_KEY="$(grep -E '^OPENAI_API_KEY' /root/.hermes/.env | cut -d= -f2-)"
#   export STRIX_LLM="openai/gpt-5.6-luna"

echo "▸ 5/5  graph-brain structural engine (graphify)…"
# graphify (PyPI: graphifyy) — deterministic knowledge graph + Obsidian export + MCP server.
pipx install graphifyy || pipx install --force graphifyy
[ -x /root/.local/bin/graphify ] && ln -sf /root/.local/bin/graphify /usr/local/bin/graphify
graphify install --platform hermes 2>/dev/null || true   # register /graphify skill for Hermes agents
graphify install --platform agents 2>/dev/null || true   # cross-framework .agents/skills
# Episodic engine: turbovec is REMOVED (2026-08-09, ADR-001) — superseded by MemPalace.
# MemPalace is NOT installed here. Phase 1 (Claude Code sessions, pgvector backend) needs
# no VPS install. Phase 2 (VPS-resident `mempalace serve`) is scaffolded, not yet run — see
# vps-scripts/mempalace-serve-install.md; deferred until the chat system is live.
# An existing /opt/yvon-tools/venvs/turbovec from a prior run may still be present on the box;
# this script no longer installs or references it — safe to leave or tear down at ops's convenience.

echo ""
echo "✓ Python/CLI tool layer installed under $BASE"
echo "  venvs:        $(ls "$VENVS" 2>/dev/null | tr '\n' ' ')"
echo "  CLIs on PATH: crawl4ai, agent-reach, strix, graphify"
echo "  libraries (import from their venv python):"
echo "    $VENVS/browser-use/bin/python   -c 'import browser_use'"
echo "    $VENVS/scrapegraphai/bin/python -c 'import scrapegraph_py'"
echo ""
echo "  Runtime keys (set in the calling shell / systemd, NOT here):"
echo "    scrapegraphai + strix need an LLM key · strix also needs Docker running."
