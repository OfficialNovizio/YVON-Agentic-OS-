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

# 2026-08-14 fix: this used to share graphify-venture.sh's exact workspace
# dir ($WORKSPACES_DIR/$VENTURE_SLUG) to reuse its clone instead of cloning
# twice. In practice the dashboard fires both scripts together
# (triggerVentureOnboarding) as two independent background processes on the
# VPS — main.py's endpoints return 202 immediately, so there is no point at
# which one script is guaranteed to have finished cloning before the other
# starts. First live test (2026-08-14, Novizio-Web) hit exactly this: both
# scripts raced to `git clone` into the same directory, the loser failed
# with "could not create work tree dir ... File exists". Own suffix removes
# the shared path entirely — costs one extra clone per venture (seconds, on
# an infrequent onboarding-triggered operation), not worth a locking scheme
# for that.
WORKSPACES_DIR="${VENTURE_GRAPH_WORKSPACES_DIR:-/opt/yvon-venture-graphs}"
WORKDIR="$WORKSPACES_DIR/$VENTURE_SLUG-mempalace"
BRANCH="yvon-graph"

# Pgvector backend selection + isolation — one namespace per venture, mirrors
# the wing=venture_slug convention already used by mempalace_drawers
# (migration 114) and venture_graphs/venture_repo_knowledge (migration 118).
export MEMPALACE_BACKEND=pgvector
export MEMPALACE_PGVECTOR_DSN
export MEMPALACE_PGVECTOR_NAMESPACE="venture-$VENTURE_SLUG"

# 2026-08-26: Supabase's pgBouncer POOLER (transaction mode) discards prepared
# statements between transactions — mempalace dies intermittently with
# `psycopg.errors.InvalidSqlStatementName: prepared statement "_pg3_0" does
# not exist` (hit live: novizio failed 17s in one run after succeeding the
# previous night — pool-dependent flakiness). Route mempalace to the DIRECT
# Postgres connection instead: same credentials, host db.<project-ref>
# .supabase.co:5432, no pooler. Derived from the DSN itself (user is
# postgres.<ref>), so no new config needed.
if [[ "$MEMPALACE_PGVECTOR_DSN" == *pooler.supabase.com* ]]; then
  REF=$(echo "$MEMPALACE_PGVECTOR_DSN" | sed -E 's@.*://postgres\.([^.]+)\.@\1@')
  FIXED=$(echo "$MEMPALACE_PGVECTOR_DSN" | sed -E "s@aws-0-[a-z0-9-]+\.pooler\.supabase\.com:6543@db.$REF.supabase.co:5432@")
  if [ -n "$REF" ] && [ "$FIXED" != "$MEMPALACE_PGVECTOR_DSN" ]; then
    export MEMPALACE_PGVECTOR_DSN="$FIXED"
    echo "  (mempalace DSN: pooler → direct db.$REF.supabase.co:5432 — fixes prepared-statement errors)"
  fi
fi

# 2026-08-25: per-venture palace HOME. mempalace resolves the palace as
# ~/.mempalace/palace (config.py DEFAULT_PALACE_PATH via expanduser, which
# honors $HOME) and the marker there records ONE namespace/table_prefix.
# With a shared HOME, the second venture's mine always dies with
# BackendMismatchError (hit live: novizio after yvon-os). Isolating HOME
# per venture isolates palace + entity registry + locks to match the
# per-venture namespace — the fix the error message itself sanctions
# ("use a fresh palace directory"), made permanent.
export HOME="/root/.yvon-mempalace/$VENTURE_SLUG"
mkdir -p "$HOME"

AUTH_URL="$REPO_URL"
if [[ "$REPO_URL" == https://* ]]; then
  AUTH_URL="${REPO_URL/https:\/\//https:\/\/x-access-token:$PAT@}"
fi

# ── Supabase status upsert into venture_repo_knowledge (same pattern as
# graphify-venture.sh's upsert_status — python for correct JSON escaping). ──
upsert_status() {
  local status="$1" error="${2:-}" commit_sha="${3:-}" entry_count="${4:-}" \
        entries_file="${5:-}" entities_file="${6:-}"
  python3 - "$SUPABASE_URL" "$SUPABASE_SERVICE_ROLE_KEY" "$VENTURE_SLUG" \
    "$REPO_URL" "$BRANCH" "$status" "$error" "$commit_sha" "$entry_count" \
    "$entries_file" "$entities_file" <<'PYEOF'
import sys, json, datetime, urllib.request
url, key, slug, repo_url, branch, status, error, sha, entry_count, entries_file, entities_file = sys.argv[1:12]
payload = {
    "venture_slug": slug,
    "repo_url": repo_url,
    "branch": branch,
    "status": status,
    "error": error or None,
    "commit_sha": sha or None,
    "entry_count": int(entry_count) if entry_count else None,
}
# 2026-08-14: migration 120 added entries/entities (jsonb) — same read-from-
# Postgres-not-GitHub rationale as graphify-venture.sh's graph_data. File
# paths, not inline argv, same reasoning (size). Non-fatal on read failure.
for field, path in (("entries", entries_file), ("entities", entities_file)):
    if not path:
        continue
    try:
        with open(path) as f:
            payload[field] = json.load(f)
    except Exception as e:  # noqa: BLE001
        print(f"  ! {field} read failed, upserting status without it: {e}", file=sys.stderr)
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
  # 2026-08-25: -f — step [3/6]'s `mempalace init` edits tracked files (e.g.
  # .gitignore) in this disposable clone; a plain checkout refuses to switch
  # away from them and the next pull fails with "local changes would be
  # overwritten" (hit live: yvon-os second run). Nothing in this working tree
  # needs to survive — same philosophy as [5/6]'s own -f checkout.
  DEFAULT_CHECKOUT_OUT=$(git -C "$WORKDIR" checkout -f "$DEFAULT_BRANCH" 2>&1) \
    || fail "checkout $DEFAULT_BRANCH failed: $DEFAULT_CHECKOUT_OUT"
  PULL_OUT=$(git -C "$WORKDIR" pull --ff-only 2>&1) || fail "git pull failed: $PULL_OUT"
else
  CLONE_OUT=$(git clone "$AUTH_URL" "$WORKDIR" 2>&1) || fail "git clone failed: $CLONE_OUT"
fi

echo "[3/6] mempalace init (heuristics-only room detection, no LLM call/cost)"
cd "$WORKDIR"
"$MEMPALACE_BIN" init . --backend pgvector --no-llm --yes 2>&1 || \
  echo "  (init non-fatal warning — continuing to mine; some repos are already initialized)"

echo "[4/6] mempalace mine . --wing $VENTURE_SLUG (90m timeout)"
# 2026-08-25: `mine` prompts "Mine this directory now? [Y/n]" on first run of
# a directory. Under the nightly runner (graphify-ventures-nightly.sh) the
# script's stdin is the ventures list — the prompt swallowed the NEXT
# venture's line as its answer, the mine died, and the loop skipped that
# venture. The printf pipe answers the prompt AND provides the child's stdin
# (so caller stdin is never inherited) — the earlier `< /dev/null` here
# actually OVERRODE that pipe, so the answer never arrived (latent bug).
# 2026-08-26: `timeout 5400` — mine embeds every chunk through an LLM/
# embedding host; when that host stalls (hit live: stuck at [4/6] for over a
# day, nightly lock held, every following night skipped), the mine used to
# hang forever. Now it fails within 90m with the output tail visible, and
# the nightly lock always releases.
# 2026-08-26 v2: output STREAMS live into the venture log via tee — a
# $(...) capture only printed after completion, which made hour-long mines
# on big repos (yvon-os: 2420 files) look frozen. The tee'd copy feeds the
# entry-count parse and the palace-marker retry below.
MINE_TEE="$WORKDIR/.mine-output.txt"
MINE_RUN() {
  printf 'y\n' | timeout 5400 "$MEMPALACE_BIN" mine . --backend pgvector --wing "$VENTURE_SLUG" --agent yvon-mempalace 2>&1 | tee "$MINE_TEE"
}
if ! MINE_RUN; then
  MINE_OUT="$(cat "$MINE_TEE" 2>/dev/null || true)"
  # 2026-08-26: the palace marker records host/port of the DSN at init time —
  # changing the DSN (pooler → direct, the prepared-statement fix) makes the
  # marker mismatch and the mine dies instantly with BackendMismatchError.
  # The error itself sanctions this fix: "use a fresh palace directory".
  if echo "$MINE_OUT" | grep -q "BackendMismatchError"; then
    echo "  (palace marker mismatch — clearing palace dir, retrying once)"
    rm -rf "$HOME/.mempalace"
    if ! MINE_RUN; then
      MINE_OUT="$(cat "$MINE_TEE" 2>/dev/null || true)"
      fail "mempalace mine failed (retry after palace reset): $MINE_OUT"
    fi
  else
    fail "mempalace mine failed (90m timeout or error — embedding host unreachable?): $(tail -c 300 "$MINE_TEE" 2>/dev/null || true)"
  fi
fi
MINE_OUT="$(cat "$MINE_TEE" 2>/dev/null || true)"

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
# Third live run (Novizio-Web, 2026-08-14) got past the checkout fix but
# then hit a rejected push: "fetch first" — remote had moved on. Cause:
# step [2/6] only pulls $DEFAULT_BRANCH on a reused workspace; it never
# refreshes refs/remotes/origin/$BRANCH. Since graphify-venture.sh's own
# run pushes to this same $BRANCH (both scripts share it by design — see
# header comment) and both fire together on every "Rebuild Now", mempalace's
# local knowledge of $BRANCH's tip is stale the moment graphify pushes
# first. Explicit fetch here — right before basing the manifest commit on
# it — makes the base always current, whichever script happens to push
# second.
# Steps 5-6 retry as a unit (max 2 attempts): fetch-then-checkout closes
# most of the race with graphify-venture.sh pushing the same $BRANCH, but
# a small window remains between this fetch and the push below — if
# graphify lands a push in that exact gap, the push still gets rejected.
# One retry (re-fetch, re-base onto the new tip, re-push) covers that
# remaining sliver without a full locking scheme; two ships racing this
# closely twice in a row is not worth engineering further for.
PUSH_OK=0
for ATTEMPT in 1 2; do
  FETCH_OUT=$(git fetch origin "$BRANCH" 2>&1) || echo "  (fetch $BRANCH warning — may not exist yet: $FETCH_OUT)"
  if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    # -f: step [3/6]/[4/6] (mempalace init/mine) can leave uncommitted changes
    # to already-tracked files in the main-branch working tree (e.g. init
    # touching .gitignore) — plain `checkout -B` refuses to switch away from
    # those ("local changes would be overwritten"), even with -B. Nothing in
    # that working tree needs to survive the switch: mine's real output is
    # already in the external pgvector store, and knowledge/ gets rewritten
    # fresh below regardless. Found live (2026-08-14, Novizio-Web, second
    # onboarding run) — real git error was masked (see output-capture fix
    # below), only "checkout existing yvon-graph failed" reached the DB.
    CHECKOUT_OUT=$(git checkout -f -B "$BRANCH" "origin/$BRANCH" 2>&1) \
      || fail "checkout existing $BRANCH failed: $CHECKOUT_OUT"
  else
    CHECKOUT_OUT=$(git checkout --orphan "$BRANCH" -f 2>&1) || fail "orphan checkout failed: $CHECKOUT_OUT"
    git rm -rf . >/dev/null 2>&1 || true
  fi
  mkdir -p knowledge
  # Only ever writes inside knowledge/ — deliberately never touches the
  # top-level README.md, which graphify-venture.sh owns, so the two scripts
  # can run in either order without clobbering each other.

  # entities.json (2026-08-14): the one file `mempalace init` writes inside
  # the repo itself ($WORKDIR/entities.json, from step [3/6]) — detected
  # people/projects/rooms. Per-repo, same isolation guarantee as
  # graphify-out/, safe to push. NOT the same as ~/.mempalace/ (global
  # config shared across every venture on the VPS — deliberately never
  # pushed anywhere; would leak other clients' wing data into this repo).
  cp "$WORKDIR/entities.json" knowledge/entities.json 2>/dev/null \
    || echo "  (no entities.json to copy — non-fatal, some repos produce none)"

  # entries.json (2026-08-14): the actual mined content, not just a count.
  # `mine` (step [4/6]) writes into a per-venture pgvector table — mempalace
  # itself has no CLI flag to dump it, so this queries the table directly.
  # Reuses the mempalace venv's own python (guaranteed to have whichever pg
  # driver `mempalace[pgvector]` installed, psycopg or psycopg2 — this
  # sandbox can't confirm which without VPS shell access, so the export
  # tries both). Table name carries a hash suffix mempalace generates
  # internally (confirmed live: mempalace_venture_novizio_<hash>_mempalace_drawers)
  # — discovered by LIKE match on venture_slug rather than assumed literal.
  # Embedding vectors are deliberately excluded (large, not human-readable
  # in a diff); id/document/metadata/updated_at only. Best-effort/non-fatal
  # — a missing driver or table shouldn't fail the whole build, same
  # philosophy as ENTRY_COUNT parsing above.
  MEMPALACE_PYTHON="$(dirname "$MEMPALACE_BIN")/python3"
  if [ -x "$MEMPALACE_PYTHON" ]; then
    EXPORT_OUT=$("$MEMPALACE_PYTHON" - "$MEMPALACE_PGVECTOR_DSN" "$VENTURE_SLUG" <<'PYEOF' 2>&1
import sys, json
dsn, slug = sys.argv[1], sys.argv[2]
try:
    import psycopg
except ImportError:
    import psycopg2 as psycopg
conn = psycopg.connect(dsn)
cur = conn.cursor()
cur.execute(
    "select table_name from information_schema.tables where table_name like %s and table_name like %s",
    (f"mempalace_venture_{slug}_%", "%_mempalace_drawers"),
)
row = cur.fetchone()
if not row:
    with open("knowledge/entries.json", "w") as f:
        json.dump([], f)
    print("no drawers table found for this venture yet")
else:
    table = row[0]
    cur.execute(f'select id, document, metadata, updated_at from "{table}" order by updated_at')
    cols = [c.name for c in cur.description]
    entries = [dict(zip(cols, r)) for r in cur.fetchall()]
    with open("knowledge/entries.json", "w") as f:
        json.dump(entries, f, indent=2, default=str)
    print(f"exported {len(entries)} entries from {table}")
conn.close()
PYEOF
) || echo "  (entries.json export warning, non-fatal: $EXPORT_OUT)"
    echo "  $EXPORT_OUT"
  else
    echo "  (mempalace venv python not found at $MEMPALACE_PYTHON — skipping entries.json export, non-fatal)"
  fi

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

Semantic knowledge mined from this repo by YVON's onboarding pipeline.
Searchable live via the shared pgvector palace on Supabase Postgres
(namespace \`venture-$VENTURE_SLUG\`):

    mempalace search "<query>" --wing $VENTURE_SLUG --backend pgvector

A point-in-time copy of the same data is also checked in here, for anyone
without VPS/pgvector access:

- \`entities.json\` — people/projects/rooms mempalace detected in this repo
- \`entries.json\` — every mined drawer (id, document, metadata, updated_at — no embedding vectors)
- \`manifest.json\` — build metadata (entry count, mined-at timestamp)

Do not edit by hand — rebuilt on every mempalace-venture.sh run.

Last mined: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
  git add -A knowledge
  if git diff --cached --quiet; then
    echo "  no changes since last mine — skipping commit"
  else
    git commit -m "yvon: refresh repo knowledge — entries≈${ENTRY_COUNT:-unknown}" >&2 \
      || fail "commit failed"
  fi
  COMMIT_SHA=$(git rev-parse HEAD)

  echo "[6/6] push $BRANCH (attempt $ATTEMPT/2)"
  PUSH_OUT=$(git push "$AUTH_URL" "$BRANCH:$BRANCH" 2>&1) && { PUSH_OK=1; break; }
  if [ "$ATTEMPT" -eq 2 ]; then
    fail "git push failed after retry: $PUSH_OUT"
  fi
  echo "  push rejected (likely graphify-venture.sh pushed $BRANCH concurrently) — retrying: $PUSH_OUT"
done

upsert_status "ready" "" "$COMMIT_SHA" "${ENTRY_COUNT:-}" "knowledge/entries.json" "knowledge/entities.json"
echo "Done. $VENTURE_SLUG's repo knowledge is live in the pgvector palace @ $COMMIT_SHA."
