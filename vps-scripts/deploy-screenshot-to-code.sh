#!/usr/bin/env bash
# deploy-screenshot-to-code.sh — provision abi/screenshot-to-code on the
# Contabo VPS (docs/PRD-design-first-workflow.md).
#
# v2 (2026-08-19) — rewritten after the first version failed on a real run:
# it assumed pip+requirements.txt/npm, but the real repo uses Poetry
# (backend/pyproject.toml) and pnpm (frontend/pnpm-lock.yaml). This version
# was checked against a real clone of github.com/abi/screenshot-to-code
# (backend/README.md's own "Getting Started" section) — not run against the
# VPS itself, since I still have no SSH access to it.
#
# ⚠ Real facts confirmed against the cloned source (was guessed before,
# now verified — see cli/lib/screenshot_to_code_client.py's header for the
# fuller writeup):
#   - Default port is 7001 (backend/start.py), not the 9124 this script
#     used to invent.
#   - POST /api/screenshot takes {"url", "apiKey"} and returns a base64
#     data: URL, not a file path. "apiKey" is a screenshottone.com key —
#     a THIRD paid external dependency beyond the LLM providers, not
#     mentioned in the original design discussion. capture_url in
#     screenshot_to_code_client.py now expects SCREENSHOTONE_API_KEY.
#   - The code-generation endpoint is a WebSocket at /generate-code
#     (hyphen), not an HTTP POST at /generate_code as first assumed.
#     screenshot_to_code_client.py's generate_code() is NOT yet rewritten
#     for this — still stub-only until that's done.
#   - The local-Chromium/Playwright piece that IS genuinely self-hosted
#     (preview_screenshot/) is used for a different feature (the backend
#     screenshotting its OWN generated output to self-check), not for
#     capturing the operator's input URL.
#
# Run on the box:
#   scp vps-scripts/deploy-screenshot-to-code.sh root@169.58.107.148:/root/
#   ssh root@169.58.107.148 'bash /root/deploy-screenshot-to-code.sh'
# ---------------------------------------------------------------------------
set -euo pipefail

BASE=/opt/yvon-tools
APP_DIR=$BASE/screenshot-to-code
PORT="${SCREENSHOT_TO_CODE_PORT:-7001}"   # backend/start.py's own default

echo "▸ 1/6  prerequisites (git, python3, pipx, poetry, node, pnpm)…"
apt-get update -qq
# pipx, not `pip install --break-system-packages`, for poetry — same convention
# install-tools.sh already uses on this box. Plain pip --break-system-packages
# failed on a real run here: apt's own python3-urllib3 has no pip RECORD file,
# so pip's dependency-upgrade step can't uninstall it ("Cannot uninstall
# urllib3 2.0.7 ... installed by debian"). pipx installs into its own isolated
# venv and never touches system-managed packages, so this doesn't happen.
apt-get install -y -qq git python3-pip python3-venv python3-full pipx curl ca-certificates
pipx ensurepath >/dev/null 2>&1 || true
export PATH="$HOME/.local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "▸ installing Node 20.x…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm
fi
if ! command -v poetry >/dev/null 2>&1; then
  pipx install poetry
fi

echo "▸ 2/6  clone/update abi/screenshot-to-code…"
mkdir -p "$BASE"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone --depth 1 https://github.com/abi/screenshot-to-code.git "$APP_DIR"
fi

echo "▸ 3/6  backend deps (poetry, isolated per-project venv)…"
# NOT --quiet — v2 of this script used it and a real run died here with zero
# output under `set -e` (poetry failed silently, script just stopped with no
# error text at all). Full output on every run from now on, always.
( cd "$APP_DIR/backend" && poetry install --no-interaction )

echo "▸ 4/6  Chromium for the screenshot-preview tool (self-check, not input capture)…"
( cd "$APP_DIR/backend" && poetry run playwright install --with-deps chromium )

echo "▸ 5/6  frontend build (pnpm)…"
( cd "$APP_DIR/frontend" && pnpm install && pnpm run build )

echo "▸ 6/6  API keys (.env) — NOT set by this script"
ENV_FILE="$APP_DIR/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<'EOF'
# Fill in for real before enabling — this script deliberately does not
# invent or fetch API keys. At least one of the first three is required
# (backend/README.md's own table). REPLICATE unlocks edit_images/remove_backgrounds.
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
REPLICATE_API_KEY=
EOF
  echo "  wrote a blank $ENV_FILE — edit it before starting the service"
fi

echo ""
echo "Next steps (manual, not run by this script):"
echo "  1. Fill in $ENV_FILE with real API keys (need at least one of OPENAI/ANTHROPIC/GEMINI)."
echo "  2. Get a screenshottone.com API key if you want URL-capture-and-clone to work at all —"
echo "     it is NOT optional infrastructure this script can provision, it's a separate paid"
echo "     account. Without it, /api/screenshot always fails; text/image-upload input still works."
echo "  3. scp vps-scripts/yvon-screenshot-to-code.service root@<host>:/etc/systemd/system/"
echo "     then: systemctl daemon-reload && systemctl enable --now yvon-screenshot-to-code"
echo "  4. Point SCREENSHOT_TO_CODE_URL at http://127.0.0.1:$PORT and SCREENSHOTONE_API_KEY at"
echo "     the key from step 2, from wherever cli/design.py runs. Loopback-only by default,"
echo "     same discipline as yvon-hermes-dashboard.service — proxy it the same way if agents"
echo "     outside this box need to reach it."
echo "  5. generate_code is still stub-only in cli/lib/screenshot_to_code_client.py — it's a"
echo "     WebSocket endpoint (/generate-code) this deploy doesn't change anything about."
