#!/usr/bin/env bash
# vercel-classify.sh — read a Vercel build log from stdin, match against the
# known error classes cli/verify-deploy.sh catches, print exact diagnosis.
#
# Each known class prints:
#   [class_name] one-line description
#     fix: the concrete command / edit
#     regression: which gate check would have caught it locally
#
# Unknown classes print a "new class — add to gate" message per §7.4
# ("caught once, coded forever").
#
# Usage:  vercel logs <url> | cli/vercel-classify.sh
#         cli/vercel-classify.sh < build.log
set -uo pipefail

LOG=$(cat)
MATCHED=0

# ── Class: undeclared runtime import (webpack Module not found) ─────────────
if MODULE=$(printf '%s\n' "$LOG" | grep -oE "Can't resolve '[^']+'" | head -1); then
  MOD=$(printf '%s' "$MODULE" | sed "s/.*'\([^']*\)'.*/\1/")
  echo "[undeclared_imports] Missing package: $MOD"
  echo "  fix: cd dashboard && npm install --save $MOD"
  echo "  regression: gate's check_undeclared_imports would have caught this locally."
  MATCHED=$((MATCHED+1))
fi

# ── Class: TS2304 Cannot find name (identifier scope error) ─────────────────
# Matches both raw tsc ("error TS2304: Cannot find name '...'") and Next 15 format
# ("Type error: Cannot find name '...'").
if printf '%s\n' "$LOG" | grep -qE "Cannot find name '"; then
  IDENT=$(printf '%s\n' "$LOG" | grep -oE "Cannot find name '[^']+'" | head -1 | sed "s/.*'\([^']*\)'.*/\1/")
  FILE=$(printf '%s\n' "$LOG" | grep -B2 "Cannot find name '$IDENT'" | grep -oE '\./[^:[:space:]]+' | head -1)
  LINE=$(printf '%s\n' "$LOG" | grep -B2 "Cannot find name '$IDENT'" | grep -oE ':[0-9]+:[0-9]+' | head -1 | cut -d: -f2)
  echo "[tsc name_error] Undefined identifier: '$IDENT'${FILE:+ at $FILE${LINE:+:$LINE}}"
  echo "  fix: look for '$IDENT' — likely a refactor leftover; either declare it or replace with the correct name."
  echo "  regression: gate's check_tsc would have caught this locally (needs 'cd dashboard && npm install' first)."
  MATCHED=$((MATCHED+1))
fi

# ── Class: TS2307 Cannot find module (import target missing) ────────────────
# Matches both raw tsc and Next 15 format.
if printf '%s\n' "$LOG" | grep -qE "Cannot find module '"; then
  MOD=$(printf '%s\n' "$LOG" | grep -oE "Cannot find module '[^']+'" | head -1 | sed "s/.*'\([^']*\)'.*/\1/")
  echo "[tsc missing_module] Import target does not exist: '$MOD'"
  if printf '%s' "$MOD" | grep -qE '^\./|^\.\./|^@/'; then
    echo "  fix: create the file, restore it from git history, or remove the import."
  else
    echo "  fix: cd dashboard && npm install --save $MOD"
  fi
  echo "  regression: gate's check_tsc would have caught this locally."
  MATCHED=$((MATCHED+1))
fi

# ── Class: Promise.all destructure/tuple arity mismatch ─────────────────────
if printf '%s\n' "$LOG" | grep -qE "Tuple type '\[.*\]' of length '[0-9]+' has no element"; then
  FILE=$(printf '%s\n' "$LOG" | grep -B2 "Tuple type" | grep -oE '\./[^:[:space:]]+' | head -1)
  LEN=$(printf '%s\n' "$LOG" | grep -oE "of length '[0-9]+'" | head -1 | grep -oE '[0-9]+')
  echo "[promise_all_arity] Destructuring count > Promise.all([...]).length ($LEN) at $FILE"
  echo "  fix: either trim the [var, var, ...] to $LEN or add promises so the counts match."
  echo "  regression: gate's check_promise_all_arity would have caught this locally."
  MATCHED=$((MATCHED+1))
fi

# ── Class: bare supabase.<verb>() missing .from() ───────────────────────────
if printf '%s\n' "$LOG" | grep -qE "Property '(select|insert|update|delete|upsert)' does not exist on type 'SupabaseClient"; then
  VERB=$(printf '%s\n' "$LOG" | grep -oE "Property '(select|insert|update|delete|upsert)'" | head -1 | sed "s/.*'\([^']*\)'.*/\1/")
  FILE=$(printf '%s\n' "$LOG" | grep -B2 "Property '$VERB' does not exist" | grep -oE '\./[^:[:space:]]+' | head -1)
  echo "[bare_supabase] supabase.$VERB() called without .from() at $FILE"
  echo "  fix: insert .from('table_name') between supabase and .$VERB()"
  echo "  regression: gate's check_bare_supabase would have caught this locally."
  MATCHED=$((MATCHED+1))
fi

# ── Class: Vercel Hobby plan cron limit ─────────────────────────────────────
if printf '%s\n' "$LOG" | grep -qiE "hobby (accounts|plan) (are )?limited to [0-9]+ cron|cron jobs? (are )?limited"; then
  echo "[vercel_crons] Cron count exceeds plan limit"
  echo "  fix: trim dashboard/vercel.json 'crons' array to ≤ 2 daily (Hobby)."
  echo "  regression: gate's check_vercel_crons would have caught this locally."
  MATCHED=$((MATCHED+1))
fi

# ── Class: duplicate Next config ────────────────────────────────────────────
if printf '%s\n' "$LOG" | grep -qiE "found (a )?next\.config\.(js|ts).*next\.config\.(ts|js)|duplicate.*next\.config"; then
  echo "[dup_config] Both next.config.js and next.config.ts present"
  echo "  fix: delete one (usually the .js one is stale)."
  echo "  regression: gate's check_dup_config would have caught this locally."
  MATCHED=$((MATCHED+1))
fi

# ── Unknown ─────────────────────────────────────────────────────────────────
if [ "$MATCHED" -eq 0 ]; then
  echo "⚠️  Unknown error class — no known-pattern match."
  echo ""
  echo "Manual review needed. If this is a NEW class of failure, per §7.4"
  echo "('caught once, coded forever') add a check to cli/verify-deploy.sh"
  echo "and a matching pattern to this file (cli/vercel-classify.sh)."
  echo ""
  echo "── log tail (last 25 lines) ──"
  printf '%s\n' "$LOG" | tail -25
  exit 1
fi

exit 0
