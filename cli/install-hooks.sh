#!/usr/bin/env bash
# install-hooks.sh — wire git hooks that call the YVON deploy gate.
# Idempotent: safe to re-run. Overwrites .git/hooks/pre-push with our version.
#
#   ./cli/install-hooks.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-push"

[ -d "$ROOT/.git" ] || { echo "❌ $ROOT is not a git repo"; exit 1; }

cat > "$HOOK" <<'PRE'
#!/usr/bin/env bash
# pre-push — YVON deploy gate (quinn). Auto-installed by cli/install-hooks.sh.
# Runs cli/verify-deploy.sh; blocks the push if any check fails.
# Bypass (not recommended): git push --no-verify
ROOT="$(git rev-parse --show-toplevel)"
if [ -x "$ROOT/cli/verify-deploy.sh" ]; then
  "$ROOT/cli/verify-deploy.sh"
  exit $?
else
  echo "⚠️  cli/verify-deploy.sh missing or not executable — allowing push"
  exit 0
fi
PRE

chmod +x "$HOOK"
echo "✅ installed $HOOK"
echo "   quinn's deploy gate will run before every 'git push'."
echo "   bypass (not recommended): git push --no-verify"
