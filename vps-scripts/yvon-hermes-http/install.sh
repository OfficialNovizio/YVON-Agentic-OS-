#!/usr/bin/env bash
# install.sh — deploy yvon-hermes-http on the Hostinger VPS.
# Idempotent: safe to re-run to update.
#
# Prereqs (run these MANUALLY before this script if not already done):
#   * DNS A-record: hermes.yvon.in → 2.25.189.22
#   * Ubuntu 22.04+ with Python 3.11+ (we use system Python for the wrapper venv)
#
# What this does:
#   1. Creates /opt/yvon-hermes-http/{main.py, pyproject.toml} if missing
#      (assumes you already scp'd them; otherwise it copies from the running dir)
#   2. Builds a Python venv at /opt/yvon-hermes-http/venv, installs FastAPI + uvicorn
#   3. Generates a bearer token in /etc/yvon-hermes/token (0600 root:root)
#   4. Installs the systemd unit, enables + starts it
#   5. Installs nginx + certbot, drops the reverse-proxy config, requests a TLS cert
#   6. Smoke-tests: local /healthz + remote https://hermes.yvon.in/healthz
#   7. Prints the bearer token so you can add it to Vercel env vars
#
# Bail out on the first error, log every command.
set -euo pipefail
IFS=$'\n\t'

# ── colors ──
G='\033[0;32m'; Y='\033[0;33m'; R='\033[0;31m'; N='\033[0m'
ok()   { echo -e "${G}✓${N} $*"; }
warn() { echo -e "${Y}!${N} $*"; }
fail() { echo -e "${R}✗${N} $*" >&2; exit 1; }
step() { echo ""; echo -e "${Y}── $* ──${N}"; }

[ "$(id -u)" -eq 0 ] || fail "Run as root: sudo bash install.sh"

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="/opt/yvon-hermes-http"
TOKEN_DIR="/etc/yvon-hermes"
TOKEN_FILE="${TOKEN_DIR}/token"
DOMAIN="${YVON_HERMES_DOMAIN:-hermes.yvon.in}"
CERT_EMAIL="${YVON_HERMES_EMAIL:-chat.gpt73890@gmail.com}"

# ── 1. Copy source into /opt/yvon-hermes-http ──────────────────────────────
step "1. copy source to $DEST_DIR"
mkdir -p "$DEST_DIR"
cp -f "$SRC_DIR/main.py" "$DEST_DIR/main.py"
cp -f "$SRC_DIR/pyproject.toml" "$DEST_DIR/pyproject.toml"
cp -f "$SRC_DIR/README.md" "$DEST_DIR/README.md" 2>/dev/null || true
ok "sources copied"

# ── 2. venv + deps ──────────────────────────────────────────────────────────
step "2. Python venv + dependencies"
if [ ! -x "$DEST_DIR/venv/bin/python" ]; then
  python3 -m venv "$DEST_DIR/venv"
  ok "venv created"
else
  ok "venv exists"
fi
"$DEST_DIR/venv/bin/pip" install --quiet --upgrade pip
"$DEST_DIR/venv/bin/pip" install --quiet 'fastapi>=0.115.0' 'uvicorn[standard]>=0.32.0' 'pydantic>=2.9.0'
ok "deps installed"

# ── 3. bearer token ────────────────────────────────────────────────────────
step "3. bearer token"
mkdir -p "$TOKEN_DIR"
chmod 700 "$TOKEN_DIR"
if [ ! -s "$TOKEN_FILE" ]; then
  # 48 bytes → 64 URL-safe chars
  python3 -c "import secrets; print(secrets.token_urlsafe(48))" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  chown root:root "$TOKEN_FILE"
  ok "token generated at $TOKEN_FILE (0600 root:root)"
else
  ok "token already exists at $TOKEN_FILE (kept)"
fi
TOKEN_VALUE="$(cat "$TOKEN_FILE")"

# ── 4. systemd unit ─────────────────────────────────────────────────────────
step "4. systemd unit"
cp -f "$SRC_DIR/systemd/yvon-hermes-http.service" /etc/systemd/system/yvon-hermes-http.service
systemctl daemon-reload
systemctl enable --now yvon-hermes-http
sleep 2
systemctl is-active --quiet yvon-hermes-http && ok "service running" || {
  journalctl -u yvon-hermes-http -n 20 --no-pager
  fail "service failed to start — see log above"
}

# ── 5. Local smoke test ────────────────────────────────────────────────────
step "5. local /healthz"
LOCAL_HEALTH="$(curl -sS -m 5 http://127.0.0.1:8765/healthz || echo FAIL)"
echo "  $LOCAL_HEALTH"
[[ "$LOCAL_HEALTH" == *'"ok":true'* ]] && ok "local up" || fail "local /healthz did not return ok=true"

# ── 6. nginx + certbot ─────────────────────────────────────────────────────
step "6. nginx + TLS (certbot)"
if ! command -v nginx >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq nginx
  ok "nginx installed"
fi
if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y -qq certbot python3-certbot-nginx
  ok "certbot installed"
fi

# Drop the site config; enable it
cp -f "$SRC_DIR/nginx/hermes.conf" "/etc/nginx/sites-available/${DOMAIN}.conf"
ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
mkdir -p /var/www/html  # for ACME challenges before cert is present

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  warn "no TLS cert yet — deploying HTTP-only config for certbot ACME"
  cat > "/etc/nginx/sites-available/${DOMAIN}.conf" << NGXHTTP
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:8765;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_request_buffering off;
    }
}
NGXHTTP
fi

nginx -t || fail "nginx config invalid"
systemctl reload nginx
ok "nginx reloaded"

step "6b. request TLS certificate (if not present)"
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --email "${CERT_EMAIL}" --redirect \
    || fail "certbot failed — check DNS: dig ${DOMAIN} +short (should return 2.25.189.22)"
  ok "TLS cert issued for ${DOMAIN}"
else
  ok "TLS cert already present"
fi

# ── 7. Remote smoke test ────────────────────────────────────────────────────
step "7. remote /healthz"
REMOTE_HEALTH="$(curl -sS -m 10 "https://${DOMAIN}/healthz" || echo FAIL)"
echo "  $REMOTE_HEALTH"
[[ "$REMOTE_HEALTH" == *'"ok":true'* ]] && ok "remote up" || warn "remote /healthz did not respond ok — check DNS / nginx / firewall"

# ── 8. Print operator instructions ──────────────────────────────────────────
cat <<EOF

────────────────────────────────────────────────────────────────
✅ yvon-hermes-http is deployed.

  URL:   https://${DOMAIN}
  Local: http://127.0.0.1:8765
  Logs:  journalctl -u yvon-hermes-http -f
  Ctl:   systemctl {status,restart,stop} yvon-hermes-http

────────────────────────────────────────────────────────────────
Add these to Vercel → yvon-agentic-os → Settings → Environment Variables
(Production AND Preview):

  HERMES_URL   = https://${DOMAIN}
  HERMES_TOKEN = ${TOKEN_VALUE}

────────────────────────────────────────────────────────────────

Test end-to-end from your Mac:

  curl -N -X POST https://${DOMAIN}/v1/chat/stream \\
    -H "Authorization: Bearer ${TOKEN_VALUE}" \\
    -H "Content-Type: application/json" \\
    -d '{"message":"hi in one sentence","user_id":"test","room_id":"test"}'

Expected: SSE stream with 'token' events, then a 'done' event.
────────────────────────────────────────────────────────────────
EOF
