#!/usr/bin/env bash
# YVON UserPromptSubmit hook — triage → CAOS retrieval → context injection
# Deterministic: runs on every prompt; the model never chooses whether to retrieve.
INPUT=$(cat)
PROMPT=$(printf '%s' "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('prompt',''))" 2>/dev/null)
[ -z "$PROMPT" ] && exit 0

# ── triage: trivial / direct factual questions bypass the machinery ──
WORDS=$(printf '%s' "$PROMPT" | wc -w | tr -d ' ')
[ "$WORDS" -lt 6 ] && exit 0
case "$PROMPT" in
  what\ *|who\ *|when\ *|where\ *|how\ many*|is\ *|are\ *|does\ *|did\ *) exit 0 ;;
esac

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/rag" 2>/dev/null || exit 0
timeout 45 python3 - "$PROMPT" <<'PY' 2>/dev/null
import sys, os
sys.path.insert(0, 'core'); sys.path.insert(0, 'harness')
sys.path.insert(0, os.path.join('..', 'Teams', 'Shared OS', 'logical'))
try:
    from retriever import retrieve
    r = retrieve(sys.argv[1], agent_id='meta', agent_dept='AI & Agents')
    chunks = r.optimized.selected_chunks
    if chunks:
        print('YVON CONTEXT (CAOS gate-verified). Route per CLAUDE.md section 2; '
              'multi-agent work goes through meta task-dispatch:')
        seen = set()
        for c in chunks:
            s = c.get('source_file', '?')
            if s not in seen:
                seen.add(s); print('  - Teams/' + s)
except Exception:
    pass
PY
exit 0
