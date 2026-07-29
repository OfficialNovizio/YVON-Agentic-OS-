#!/usr/bin/env bash
# verify-deploy.sh — pre-push verification gate (quinn's deploy-gate skill)
# ==========================================================================
# Catches the six regressions we've hit on Vercel, purely statically (no
# npm install, no next build required). Runs in ~2s. Every check that fails
# prints file:line and the reason; exit code = number of failed checks.
#
# Usage:   cli/verify-deploy.sh [--json]
# Exit:    0 = green (safe to push) · N>0 = number of failing checks
# Wired:   .git/hooks/pre-push (install via cli/install-hooks.sh)
#
# Checks (each fires a distinct exit-bump):
#   1. Undeclared runtime imports          → dep missing in package.json
#   2. Bare supabase.<verb>() (no .from)   → runtime type-check failure
#   3. Promise.all destructure mismatch    → tuple-length type error
#   4. Duplicate next.config.{js,ts}       → Next 15 hard error
#   5. vercel.json crons > Hobby limit     → deploy rejection
#   6. .gitignore covers .next/env/nm      → repo bloat / secret leak
#   7. tsc --noEmit (if installed)         → every "Cannot find name", type mismatch
#
# Scope: dashboard/ (the Vercel-deployed app). Extend via APPS= env var:
#   APPS="dashboard other-app" cli/verify-deploy.sh
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APPS="${APPS:-dashboard}"
FAILS=0
JSON="${1:-}"
declare -a REPORT=()

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
gray()  { printf '\033[90m%s\033[0m\n' "$*"; }
bump()  { FAILS=$((FAILS+1)); REPORT+=("$1"); red "  ✗ $1"; }
ok()    { green "  ✓ $1"; }

# ── CHECK 1: undeclared runtime imports ──────────────────────────────────────
check_undeclared_imports() {
  local app="$1"; local dir="$ROOT/$app"
  [ -f "$dir/package.json" ] || { gray "  (skip: no $app/package.json)"; return; }
  python3 - "$dir" <<'PY'
import os,re,json,sys
appdir=sys.argv[1]
pj=json.load(open(os.path.join(appdir,'package.json')))
declared=set(pj.get('dependencies',{}))|set(pj.get('devDependencies',{}))
builtin={'react','react-dom'}
node_builtins={'fs','path','os','crypto','http','https','stream','util','url','child_process',
  'events','buffer','querystring','zlib','net','tls','dns','readline','process','assert','module',
  'perf_hooks','worker_threads','timers','string_decoder','punycode','async_hooks','http2','constants',
  'vm','v8','cluster','tty','dgram','inspector','trace_events','sqlite','test','wasi'}
imp=re.compile(r'''(?:import\s[^'"]*from\s*|import\s*\(?\s*|require\(\s*)['"]([^'"]+)['"]''')
# Strip block comments so /** @type {import('x')} */ hints don't count as imports.
strip_block=re.compile(r'/\*[\s\S]*?\*/')
strip_line=re.compile(r'^\s*//.*$', re.M)
found={}
for root,_,files in os.walk(appdir):
    if any(x in root for x in ('node_modules','/.next','.import-backup','/scripts')): continue
    for f in files:
        if not f.endswith(('.ts','.tsx','.js','.jsx','.mjs')): continue
        p=os.path.join(root,f)
        try: txt=open(p,encoding='utf-8').read()
        except: continue
        txt=strip_line.sub('', strip_block.sub('', txt))
        for m in imp.findall(txt):
            if m.startswith(('.','@/','/')): continue
            parts=m.split('/')
            pkg='/'.join(parts[:2]) if m.startswith('@') else parts[0]
            pkg=pkg.replace('node:','')
            if pkg in node_builtins or pkg in builtin: continue
            found.setdefault(pkg,set()).add(p)
missing=sorted(k for k in found if k not in declared)
for k in missing:
    ex=sorted(found[k])[0].replace(appdir+'/','')
    print(f'FAIL::undeclared import "{k}" (e.g. {ex}) — add to {os.path.basename(appdir)}/package.json')
PY
}

# ── CHECK 2: bare supabase.<verb>() missing .from() ──────────────────────────
check_bare_supabase() {
  local app="$1"; local dir="$ROOT/$app"
  [ -d "$dir" ] || return
  python3 - "$dir" <<'PY'
import os,re,sys
appdir=sys.argv[1]
# await supabase\n.select( ...
pat=re.compile(r'\bsupabase\s*\n\s*\.(select|insert|update|delete|upsert|rpc)\(', re.S)
for root,_,files in os.walk(appdir):
    if any(x in root for x in ('node_modules','/.next','.import-backup')): continue
    for f in files:
        if not f.endswith(('.ts','.tsx')): continue
        p=os.path.join(root,f); rel=p.replace(appdir+'/','')
        try: txt=open(p,encoding='utf-8').read()
        except: continue
        for m in pat.finditer(txt):
            line=txt[:m.start()].count('\n')+1
            print(f'FAIL::bare supabase.{m.group(1)}() at {rel}:{line} — insert .from("table") before')
PY
}

# ── CHECK 3: Promise.all destructure count mismatch ──────────────────────────
check_promise_all_arity() {
  local app="$1"; local dir="$ROOT/$app"
  [ -d "$dir" ] || return
  python3 - "$dir" <<'PY'
import os,re,sys
appdir=sys.argv[1]
def top_split(s, sep=','):
    depth=0; out=[]; cur=''
    for c in s:
        if c in '([{': depth+=1
        elif c in ')]}': depth-=1
        if c==sep and depth==0:
            if cur.strip(): out.append(cur.strip()); cur=''
        else: cur+=c
    if cur.strip(): out.append(cur.strip())
    return out
def matched_block(s, start, open_ch, close_ch):
    """Return end index (of close_ch) for a balanced block starting at s[start]==open_ch."""
    if start>=len(s) or s[start]!=open_ch: return -1
    depth=0
    for i in range(start, len(s)):
        if s[i]==open_ch: depth+=1
        elif s[i]==close_ch:
            depth-=1
            if depth==0: return i
    return -1
def strip_strings(s):
    """Replace string/template contents with dashes so their brackets don't perturb balance."""
    out=[]; i=0; n=len(s)
    while i<n:
        c=s[i]
        if c in ('"',"'",'`'):
            q=c; out.append(q); i+=1
            while i<n and s[i]!=q:
                if s[i]=='\\' and i+1<n: out.append('--'); i+=2; continue
                out.append('-'); i+=1
            if i<n: out.append(q); i+=1
        else:
            out.append(c); i+=1
    return ''.join(out)
# Find "const [ ... ] = await Promise.all( [ ... ] )" with proper bracket balance.
head=re.compile(r'const\s*\[', re.S)
for root,_,files in os.walk(appdir):
    if any(x in root for x in ('node_modules','/.next','.import-backup')): continue
    for f in files:
        if not f.endswith(('.ts','.tsx')): continue
        p=os.path.join(root,f); rel=p.replace(appdir+'/','')
        try: raw=open(p,encoding='utf-8').read()
        except: continue
        txt=strip_strings(raw)  # neutralize brackets inside strings
        pos=0
        while True:
            m=head.search(txt, pos)
            if not m: break
            lb=m.end()-1  # index of '['
            rb=matched_block(txt, lb, '[', ']')
            if rb<0: pos=m.end(); continue
            # After ], expect optional whitespace, '=', 'await', 'Promise.all', '('
            tail=txt[rb+1:rb+120]
            mp=re.match(r'\s*=\s*await\s+Promise\.all\s*\(\s*\[', tail)
            if not mp:
                pos=rb+1; continue
            # Find the inner '['
            inner_lb=rb+1+mp.end()-1
            inner_rb=matched_block(txt, inner_lb, '[', ']')
            if inner_rb<0: pos=rb+1; continue
            vars_str=txt[lb+1:rb]
            promises_str=txt[inner_lb+1:inner_rb]
            vars_list=top_split(vars_str)
            promises_list=top_split(promises_str)
            if vars_list and promises_list and len(vars_list)!=len(promises_list):
                line=txt[:m.start()].count('\n')+1
                print(f'FAIL::Promise.all arity {len(vars_list)} vars vs {len(promises_list)} promises at {rel}:{line}')
            pos=inner_rb+1
PY
}

# ── CHECK 4: duplicate next.config ───────────────────────────────────────────
check_dup_config() {
  local app="$1"; local dir="$ROOT/$app"
  [ -d "$dir" ] || return
  local js="$dir/next.config.js"; local ts="$dir/next.config.ts"
  if [ -f "$js" ] && [ -f "$ts" ]; then
    echo "FAIL::duplicate next.config in $app — Next 15 errors on both .js and .ts present; keep one"
  fi
}

# ── CHECK 5: vercel.json crons vs Hobby limit ────────────────────────────────
VERCEL_PLAN="${VERCEL_PLAN:-hobby}"  # hobby=2, pro=40
check_vercel_crons() {
  local app="$1"; local dir="$ROOT/$app"
  local vf="$dir/vercel.json"
  [ -f "$vf" ] || return
  local limit=2
  [ "$VERCEL_PLAN" = "pro" ] && limit=40
  local n
  n=$(python3 -c "import json,sys;print(len(json.load(open('$vf')).get('crons',[])))" 2>/dev/null || echo 0)
  if [ "$n" -gt "$limit" ]; then
    echo "FAIL::vercel.json crons ($n) > $VERCEL_PLAN limit ($limit) in $app — trim or upgrade plan"
  fi
}

# ── CHECK 7: tsc --noEmit (if available) ─────────────────────────────────────
# Catches TS2304 "Cannot find name", type mismatches, missing exports, etc. —
# the whole class of bugs Vercel's Next build worker catches after webpack.
# Skipped only if node_modules isn't installed (npm install in dashboard/ first).
check_tsc() {
  local app="$1"; local dir="$ROOT/$app"
  local tsc="$dir/node_modules/.bin/tsc"
  if [ ! -x "$tsc" ]; then
    gray "  (skip: run 'cd $app && npm install' to enable strict tsc gate)"
    return
  fi
  # Cap at 120s — a real build takes 30s; anything longer is a stall we bail out of.
  local out
  out=$(cd "$dir" && timeout 120 "$tsc" --noEmit --pretty false 2>&1)
  local rc=$?
  if [ $rc -eq 124 ]; then
    echo "FAIL::tsc timed out after 120s in $app — investigate separately"
    return
  fi
  # tsc prints "file(line,col): error TSxxxx: message" or "file:line:col - error TSxxxx: message"
  echo "$out" | grep -E ': error TS[0-9]+:' | head -20 | while IFS= read -r line; do
    [ -z "$line" ] && continue
    echo "FAIL::tsc: $line"
  done
}

# ── CHECK 6: .gitignore hygiene ──────────────────────────────────────────────
check_gitignore() {
  local gi="$ROOT/.gitignore"
  [ -f "$gi" ] || { echo "FAIL::no .gitignore at repo root"; return; }
  local needs=("node_modules" ".next" ".env" ".DS_Store")
  for n in "${needs[@]}"; do
    grep -qE "(^|/)${n//./\\.}(\$|/|\\*)" "$gi" 2>/dev/null || echo "FAIL::.gitignore missing pattern for '$n'"
  done
  # Also: no committed .next/ artifacts
  if git -C "$ROOT" ls-files 2>/dev/null | grep -q '\.next/' ; then
    echo "FAIL::.next/ artifacts are tracked in git — run: git rm -r --cached */.next && git commit"
  fi
}

# ── driver ───────────────────────────────────────────────────────────────────
echo "── deploy-gate ── $(date +%H:%M:%S) ── plan=$VERCEL_PLAN ── apps: $APPS"
for app in $APPS; do
  echo ""
  echo "▸ $app"
  for check_name in check_undeclared_imports check_bare_supabase check_promise_all_arity check_dup_config check_vercel_crons check_tsc; do
    out=$("$check_name" "$app" 2>&1 || true)
    label="${check_name#check_}"
    if [ -z "$out" ]; then ok "$label"
    else while IFS= read -r line; do
      [ -z "$line" ] && continue
      bump "${line#FAIL::}"
    done <<< "$out"
    fi
  done
done
echo ""
echo "▸ repo-wide"
out=$(check_gitignore 2>&1 || true)
if [ -z "$out" ]; then ok "gitignore"
else while IFS= read -r line; do bump "${line#FAIL::}"; done <<< "$out"
fi

echo ""
if [ "$FAILS" -eq 0 ]; then
  green "✅ deploy-gate PASS ($((${#REPORT[@]})) findings) — safe to push"
  exit 0
else
  red "❌ deploy-gate FAIL — $FAILS finding(s) block the push"
  echo ""
  echo "Bypass (not recommended): git push --no-verify"
  exit "$FAILS"
fi
