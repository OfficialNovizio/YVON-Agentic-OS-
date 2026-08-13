#!/usr/bin/env bash
# mempalace-venture.sh — per-venture MemPalace repo-knowledge mining (artifact 3
# of 4, client-onboarding flow, 2026-08-12). Sibling to graphify-venture.sh:
# that script builds a STRUCTURAL code graph; this one builds a SEMANTIC
# knowledge layer over the same client repo, using the real `mempalace`
# package (github.com/MemPalace/mempalace, PyPI `mempalace`) rather than the
# hand-rolled `mempalace_drawers` table that only ever captured live chat.
#
# This reopens ADR-001's Phase 2 deferral (VPS-resident MemPalace) on purpose,
# by explicit operator decision 2026-08-12 — see
# system-harness/adr/ADR-002-mempalace-venture-repo-mining.md. Scope here is
# narrower than full Phase 2 (`mempalace serve`): this is an ephemeral CLI
# invocation per build, same architecture as Phase 1's per-session installs,
# just triggered from a VPS script instead of a Claude Code session, sharing
# the same pgvector-on-Supabase backend Phase 1 already uses.
#
# Usage: mempalace-venture.sh <venture_slug> <repo_url> <write_scoped_github_pat>
#
# The PAT must have Contents: Read and write on the target repo (same
# requirement as graphify-venture.sh — this script also pushes a manifest
# back to the client's yvon-graph branch).
#
# Requires on VPS: the `mempalace` CLI (dedicated venv — see
# vps-scripts/install-mempalace.md), git, python3, curl.
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (status upsert, required);
# MEMPALACE_PGVECTOR_DSN (required — Postgres connection string for the
# shared Supabase pgvector backend, NOT the same as SUPABASE_URL, which is
# the REST API base, not a raw Postgres DSN); MEMPALACE_BIN (optional,
# default /opt/yvon-tools/venvs/mempalace/bin/mempalace).

set -euo pipefail

VENTURE_SLUG="${1:?usage: mempalace-venture.sh <venture_slug> <repo_url> <pat>}"
REPO_URL="${2:?usage: mempalace-venture.sh <venture_slug> <repo_url> <pat>}"
PAT="${3:?usage: mempalace-venture.sh <venture_slug> <repo_url> <pat>}"

SUPABASE_URL="${SUPABASE_URL:?SUPABASE_URL must be set}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY must be set}"
MEMPALACE_PGVECTOR_DSN="${MEMPALACE_PGVECTOR_DSN:?MEMPALACE_PGVECTOR_DSN must be set — Postgres connection string, see vps-scripts/install-mempalace.md}"
MEMPALACE_BIN="${MEMPALACE_BIN:-/opt/yvon-tools/venvs/mempalace/bin/mempalace}"

# Same workspace as graphify-venture.sh — reuses the clone if that script
# already ran for this venture in this cycle instead of cloning twice.
WORKSPACES_DIR="${VENTURE_GRAPH_WORKSPACES_DIR:-/opt/yvon-venture-graphs}"
WORKDIR="$WORKSPACES_DIR/$VENTURE_SLUG"
BRANCH="yvon-graph"

# Pgvector backend selection + isolation — one namespace per venture, mirrors
# the wing=venture_slug convention already used by mempalace_drawers
# (migration 114) and venture_graphs/venture_repo_knowledge (migration 118).
export MEMPALACE_BACKEND=pgvector
export MEMPALACE_PGVECTOR_DSN
export MEMPALACE_PGVECTOR_NAMESPACE="venture-$VENTURE_SLUG"

AUTH_URL="$REPO_URL"
if [[ "$REPO_URL" == https://* ]]; then
  AUTH_URL="${REPO_URL/https:\/\//https:\/\/x-access-token:$PAT@}"
fi

# ── Supabase status upsert into venture_repo_knowledge (same pattern as
# graphify-venture.sh's upsert_status — python for correct JSON escaping). ──
upsert_status() {
  local status="$1" error="${2:-}" commit_sha="${3:-}" entry_count="${4:-}"
  python3 - "$SUPABASE_URL" "$SUPABASE_SERVICE_ROLE_KEY" "$VENTURE_SLUG" \
    "$REPO_URL" "$BRANCH" "$status" "$error" "$commit_sha" "$entry_count" <<'PYEOF'
import sys, json, datetime, urllib.request
url, key, slug, repo_url, branch, status, error, sha, entries = sys.argv[1:10]
payload = {
    "venture_slug": slug,
    "repo_url": repo_url,
    "branch": branch,
    "status": status,
    "error": error or None,
    "commit_sha": sha or None,
    "entry_count": int(entries) if entries else None,
}
if status == "ready":
    payload["built_at"] = datetime.datetime.utcnow().isoformat() + "Z"
req = urllib.request.Request(
    f"{url}/rest/v1/venture_repo_knowledge?on_conflict=venture_slug",
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

echo "[3/6] mempalace init (heuristics-only room detection, no LLM call/cost)"
cd "$WORKDIR"
"$MEMPALACE_BIN" init . --backend pgvector --no-llm --yes 2>&1 || \
  echo "  (init non-fatal warning — continuing to mine; some repos are already initialized)"

echo "[4/6] mempalace mine . --wing $VENTURE_SLUG"
MINE_OUT=$("$MEMPALACE_BIN" mine . --backend pgvector --wing "$VENTURE_SLUG" --agent yvon-mempalace 2>&1) \
  || fail "mempalace mine failed: $MINE_OUT"
echo "$MINE_OUT"

# Best-effort entry-count extraction from mine's own summary line. Format is
# not yet confirmed against a live run (sandboxed dev environment couldn't
# reach the embedding-model host to complete a full mine locally) — if the
# pattern doesn't match, entry_count stays null rather than blocking the
# build; venture_repo_knowledge.status still goes to 'ready' on exit 0.
ENTRY_COUNT=$(echo "$MINE_OUT" | grep -oE '[0-9]+ (drawers|files|chunks|entries)' | head -1 | grep -oE '^[0-9]+' || true)
echo "  entries≈${ENTRY_COUNT:-unknown}"

echo "[5/6] write knowledge/ manifest to $BRANCH (reuses graphify-venture.sh's branch if present)"
git config user.name "yvon-mempalace"
git config user.email "mempalace@yvon.bot"
if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  git checkout -B "$BRANCH" "origin/$BRANCH" 2>&1 || fail "checkout existing $BRANCH failed"
else
  git checkout --orphan "$BRANCH" 2>&1 || fail "orphan checkout failed"
  git rm -rf . >/dev/null 2>&1 || true
fi
mkdir -p knowledge
# Only ever writes inside knowledge/ — deliberately never touches the
# top-level README.md, which graphify-venture.sh owns, so the two scripts
# can run in either order without clobbering each other.
cat > knowledge/manifest.json <<EOF
{
  "venture_slug": "$VENTURE_SLUG",
  "wing": "$VENTURE_SLUG",
  "backend": "pgvector",
  "namespace": "venture-$VENTURE_SLUG",
  "entry_count": ${ENTRY_COUNT:-null},
  "mined_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
cat > knowledge/README.md <<EOF
# MemPalace repo knowledge — $VENTURE_SLUG

Semantic knowledge mined from this repo by YVON's onboarding pipeline. The
actual content lives in a shared pgvector palace on Supabase Postgres
(namespace \`venture-$VENTURE_SLUG\`), not in this git branch — this file is
just a pointer. Search it with:

    mempalace search "<query>" --wing $VENTURE_SLUG --backend pgvector

Do not edit by hand — rebuilt on every mempalace-venture.sh run.

Last mined: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
git add knowledge/manifest.json knowledge/README.md
if git diff --cached --quiet; then
  echo "  no changes since last mine — skipping commit"
else
  git commit -m "yvon: refresh repo knowledge — entries≈${ENTRY_COUNT:-unknown}" >&2 \
    || fail "commit failed"
fi
COMMIT_SHA=$(git rev-parse HEAD)

echo "[6/6] push $BRANCH"
PUSH_OUT=$(git push "$AUTH_URL" "$BRANCH:$BRANCH" 2>&1) || fail "git push failed: $PUSH_OUT"

upsert_status "ready" "" "$COMMIT_SHA" "${ENTRY_COUNT:-}"
echo "Done. $VENTURE_SLUG's repo knowledge is live in the pgvector palace @ $COMMIT_SHA."
