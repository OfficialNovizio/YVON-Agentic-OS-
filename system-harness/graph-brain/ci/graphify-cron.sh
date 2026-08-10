#!/usr/bin/env bash
# graphify-cron.sh — system-harness/graph-brain/YVON-GRAPH.md §4.4, the nightly VPS job.
#
#   git pull
#   graphify extract .                    → graphify-out/graph.json
#   node scripts/build-structure.mjs      → refreshes structure.json + the repo's alias copy
#   cp the alias copy → /opt/.../agent-alias.json   (the copy Hermes actually reads — §4.4's
#                                                      "the alias map matters more than the graph"
#                                                      note: build-structure.mjs only writes the
#                                                      REPO copy at vps-scripts/yvon-hermes-http/
#                                                      agent-alias.json; Hermes reads the deployed
#                                                      copy at /opt/yvon-hermes-http/agent-alias.json.
#                                                      Skipping this cp is the single highest-
#                                                      probability silent failure in the system —
#                                                      an agent renamed in Teams/ regenerates the
#                                                      repo copy but Hermes keeps resolving the old
#                                                      name until this runs.)
#   upload graph.json → Supabase Storage bucket `graphs` as graphify/latest.json
#
# NOT installed by anything automatically — this file and install-graphify-cron.md were written
# and verified for logic (bucket exists, policies confirmed — see the migration referenced below)
# from a sandboxed environment with no SSH/VPS credentials and no network path to hermes.yvon.in
# (confirmed live: `curl $HERMES_URL/healthz` returned connection-refused from that sandbox, the
# same restriction already documented for *.supabase.co elsewhere in this repo's history). Install
# per install-graphify-cron.md the next time someone has a real shell on the VPS.
#
# Requires on the VPS: graphify (pipx, vps-scripts/install-tools.sh §5), node 18+,
# SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment (see install-graphify-cron.md).

set -euo pipefail

REPO_ROOT="${GRAPH_REPO_ROOT:-/root/YVON-Agentic-OS-}"
ALIAS_DEPLOY_PATH="${HERMES_ALIAS_PATH:-/opt/yvon-hermes-http/agent-alias.json}"
SUPABASE_URL="${SUPABASE_URL:?SUPABASE_URL must be set}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY must be set}"

cd "$REPO_ROOT"

echo "[1/5] git pull"
git pull --ff-only

echo "[2/5] graphify extract ."
graphify extract .   # writes graphify-out/graph.json (repo root, per graphify's own convention)

echo "[3/5] node scripts/build-structure.mjs"
node scripts/build-structure.mjs   # refreshes dashboard/public/structure.json
                                    # + vps-scripts/yvon-hermes-http/agent-alias.json (repo copy)

echo "[4/5] refresh the DEPLOYED alias map Hermes actually reads"
if [ -f "vps-scripts/yvon-hermes-http/agent-alias.json" ]; then
  install -D -m 644 "vps-scripts/yvon-hermes-http/agent-alias.json" "$ALIAS_DEPLOY_PATH"
  echo "  copied → $ALIAS_DEPLOY_PATH"
else
  echo "  ✗ repo alias copy missing after build-structure.mjs — not overwriting the deployed copy" >&2
  exit 1
fi

echo "[5/5] upload graph.json to Supabase Storage (bucket: graphs)"
if [ ! -f "graphify-out/graph.json" ]; then
  echo "  ✗ graphify-out/graph.json not found — graphify extract may have failed silently" >&2
  exit 1
fi
HTTP_STATUS=$(curl -sS -o /tmp/graphify-upload-response.json -w '%{http_code}' \
  -X POST "$SUPABASE_URL/storage/v1/object/graphs/graphify/latest.json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "x-upsert: true" \
  --data-binary @graphify-out/graph.json)
if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
  echo "  ✓ uploaded (HTTP $HTTP_STATUS)"
else
  echo "  ✗ upload failed (HTTP $HTTP_STATUS): $(cat /tmp/graphify-upload-response.json)" >&2
  exit 1
fi

echo "Done. graphify-out/graph.json is now live at graphs/graphify/latest.json (doc §3 Q9)."
