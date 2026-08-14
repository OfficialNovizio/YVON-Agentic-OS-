#!/usr/bin/env bash
# graphify-venture.sh — per-venture graphify + git push-back (artifact 2 of 4,
# client-onboarding flow, 2026-08-12). Distinct from graphify-cron.sh: that
# script graphs the ENGINE's own repo and uploads to Supabase Storage only.
# This one graphs a CLIENT's repo and commits the result BACK into that
# client's own GitHub repo, on a dedicated 'yvon-graph' orphan branch that
# never touches their default branch — plus a status row in Supabase
# (venture_graphs, migration 118) so the dashboard can show build state
# without reading git directly.
#
# Usage: graphify-venture.sh <venture_slug> <repo_url> <write_scoped_github_pat>
#
# The PAT must have Contents: Read and write on the target repo — the
# read-only token used by chat's clone/pull (main.py's _ensure_repo_clone)
# is NOT sufficient here, this script pushes commits.
#
# Requires on VPS: graphify (pipx), git, python3, curl.
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required); GRAPHIFY_MODEL
# (optional, same project-scoped-key override as graphify-cron.sh).

set -euo pipefail

VENTURE_SLUG="${1:?usage: graphify-venture.sh <venture_slug> <repo_url> <pat>}"
REPO_URL="${2:?usage: graphify-venture.sh <venture_slug> <repo_url> <pat>}"
PAT="${3:?usage: graphify-venture.sh <venture_slug> <repo_url> <pat>}"

SUPABASE_URL="${SUPABASE_URL:?SUPABASE_URL must be set}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY must be set}"

WORKSPACES_DIR="${VENTURE_GRAPH_WORKSPACES_DIR:-/opt/yvon-venture-graphs}"
WORKDIR="$WORKSPACES_DIR/$VENTURE_SLUG"
BRANCH="yvon-graph"

GRAPHIFY_MODEL_ARGS=()
if [ -n "${GRAPHIFY_MODEL:-}" ]; then
  GRAPHIFY_MODEL_ARGS=(--model "$GRAPHIFY_MODEL")
fi

# Same x-access-token embed pattern as chat's repo-mode clone (main.py's
# _ensure_repo_clone) — accepted tradeoff, not fixed here: this persists the
# token in this clone's .git/config at rest, same as that existing code path
# already does for the read-only token. VPS root-only access is the trust
# boundary already relied on for GITHUB_PAT/SUPABASE_SERVICE_ROLE_KEY in the
# env file; a private repo needs auth on every future pull too, so resetting
# the remote to a bare URL after clone would just break the next run.
AUTH_URL="$REPO_URL"
if [[ "$REPO_URL" == https://* ]]; then
  AUTH_URL="${REPO_URL/https:\/\//https:\/\/x-access-token:$PAT@}"
fi

# ── Supabase status upsert (python for correct JSON escaping — no shell
# string interpolation into JSON, error messages may contain quotes/newlines
# from raw git/graphify stderr). ────────────────────────────────────────────
upsert_status() {
  local status="$1" error="${2:-}" commit_sha="${3:-}" node_count="${4:-}" \
        edge_count="${5:-}" community_count="${6:-}" graph_data_file="${7:-}"
  python3 - "$SUPABASE_URL" "$SUPABASE_SERVICE_ROLE_KEY" "$VENTURE_SLUG" \
    "$REPO_URL" "$BRANCH" "$status" "$error" "$commit_sha" \
    "$node_count" "$edge_count" "$community_count" "$graph_data_file" <<'PYEOF'
import sys, json, datetime, urllib.request
url, key, slug, repo_url, branch, status, error, sha, nodes, edges, communities, graph_data_file = sys.argv[1:13]
payload = {
    "venture_slug": slug,
    "repo_url": repo_url,
    "branch": branch,
    "status": status,
    "error": error or None,
    "commit_sha": sha or None,
    "node_count": int(nodes) if nodes else None,
    "edge_count": int(edges) if edges else None,
    "community_count": int(communities) if communities else None,
}
# 2026-08-14: migration 120 added graph_data (jsonb) so the dashboard can read
# graphify's real output from Postgres instead of a live GitHub round-trip.
# Passed as a file path (not inline argv) — graph.json can run past shell
# ARG_MAX at scale; this venture's is small (108 nodes) but the path is the
# same regardless of size. Read failures are non-fatal — the status upsert
# (and the git push, the durable copy) still goes through without it.
if graph_data_file:
    try:
        with open(graph_data_file) as f:
            payload["graph_data"] = json.load(f)
    except Exception as e:  # noqa: BLE001
        print(f"  ! graph_data read failed, upserting status without it: {e}", file=sys.stderr)
if status == "ready":
    payload["built_at"] = datetime.datetime.utcnow().isoformat() + "Z"
req = urllib.request.Request(
    f"{url}/rest/v1/venture_graphs?on_conflict=venture_slug",
    data=json.dumps([payload]).encode(),
    method="POST",
    headers={
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    },
)
try:
    urllib.request.urlopen(req, timeout=10)
except Exception as e:  # noqa: BLE001 — status reporting must never crash the caller
    print(f"  ! supabase status upsert failed: {e}", file=sys.stderr)
PYEOF
}

fail() {
  echo "  ✗ $1" >&2
  upsert_status "error" "$1"
  exit 1
}

echo "[1/6] mark building · $VENTURE_SLUG"
upsert_status "building"

mkdir -p "$WORKSPACES_DIR"

echo "[2/6] clone or pull $REPO_URL"
if [ -d "$WORKDIR/.git" ]; then
  DEFAULT_BRANCH=$(git -C "$WORKDIR" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@') \
    || DEFAULT_BRANCH="main"
  git -C "$WORKDIR" checkout "$DEFAULT_BRANCH" 2>&1 || fail "checkout $DEFAULT_BRANCH failed"
  PULL_OUT=$(git -C "$WORKDIR" pull --ff-only 2>&1) || fail "git pull failed: $PULL_OUT"
else
  CLONE_OUT=$(git clone "$AUTH_URL" "$WORKDIR" 2>&1) || fail "git clone failed: $CLONE_OUT"
fi

echo "[3/6] graphify extract ."
cd "$WORKDIR"
EXTRACT_OUT=$(graphify extract . "${GRAPHIFY_MODEL_ARGS[@]}" 2>&1) || fail "graphify extract failed: $EXTRACT_OUT"
if [ ! -f "graphify-out/graph.json" ]; then
  fail "graphify-out/graph.json not found after extract — graphify may have failed silently"
fi

echo "[4/6] parse graph stats"
STATS=$(python3 -c "
import json
with open('graphify-out/graph.json') as f:
    d = json.load(f)
nodes = d.get('nodes', [])
links = d.get('links', [])
communities = {n.get('community') for n in nodes if isinstance(n, dict) and n.get('community') is not None}
print(len(nodes), len(links), len(communities))
") || fail "failed to parse graphify-out/graph.json"
read -r NODE_COUNT EDGE_COUNT COMMUNITY_COUNT <<< "$STATS"
echo "  nodes=$NODE_COUNT edges=$EDGE_COUNT communities=$COMMUNITY_COUNT"

echo "[5/6] commit graph.json to $BRANCH (orphan — never touches the client's default branch)"
git config user.name "yvon-graphify"
git config user.email "graphify@yvon.bot"
if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  git checkout -B "$BRANCH" "origin/$BRANCH" 2>&1 || fail "checkout existing $BRANCH failed"
else
  git checkout --orphan "$BRANCH" 2>&1 || fail "orphan checkout failed"
  git rm -rf . >/dev/null 2>&1 || true
fi
# 2026-08-14: was `cp graphify-out/graph.json graph/graph.json` only —
# operator asked to push everything graphify produces, not just the raw
# graph data. graphify-out/ is generated fresh per-clone inside this
# venture's own workdir, so (unlike mempalace's ~/.mempalace/ global config,
# see mempalace-venture.sh) the whole folder is already scoped to this one
# client and safe to commit as-is: cache/, .graphify_analysis.json,
# .graphify_root, GRAPH_REPORT.md (human-readable summary), graph.html
# (interactive visualization, previously VPS-only), graph.json, manifest.json.
# rm -rf first so a shrinking output shape (fewer files in some future
# graphify version) doesn't leave stale files behind from an older run.
rm -rf graph
cp -r graphify-out graph
cat > README.md <<EOF
# yvon-graph

Auto-generated by YVON's onboarding pipeline. Do not edit by hand — this
branch is rebuilt on every graphify run and never merges into your default
branch.

- \`graph/\` — full graphify output ($NODE_COUNT nodes, $EDGE_COUNT edges, $COMMUNITY_COUNT communities) — see \`graph/graph.html\` for the interactive visualization, \`graph/GRAPH_REPORT.md\` for the human-readable summary
- \`knowledge/\` — semantic knowledge extracted from this repo (MemPalace)

Last built: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
git add -A graph README.md
if git diff --cached --quiet; then
  echo "  no changes since last build — skipping commit"
else
  git commit -m "yvon: refresh code graph — $NODE_COUNT nodes, $EDGE_COUNT edges, $COMMUNITY_COUNT communities" >&2 \
    || fail "commit failed"
fi
COMMIT_SHA=$(git rev-parse HEAD)

echo "[6/6] push $BRANCH"
PUSH_OUT=$(git push "$AUTH_URL" "$BRANCH:$BRANCH" 2>&1) || fail "git push failed: $PUSH_OUT"

upsert_status "ready" "" "$COMMIT_SHA" "$NODE_COUNT" "$EDGE_COUNT" "$COMMUNITY_COUNT" "graphify-out/graph.json"
echo "Done. $VENTURE_SLUG's graph is live on $BRANCH @ $COMMIT_SHA."
