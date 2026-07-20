# ── T4: CAOS retrieval + TASK-SPEC slice (build/exec skills only) ──
# BEFORE running: replace <TASK> with the user's request VERBATIM.
cd "$_ROOT/rag" 2>/dev/null && timeout 60 python3 -c "
import sys,os; sys.path.insert(0,'core'); sys.path.insert(0,'harness')
sys.path.insert(0,os.path.join('..','Teams','Shared OS','logical'))
from retriever import retrieve
r = retrieve('''<TASK>''', agent_id='{{AGENT_ID}}', agent_dept='{{DEPT}}')
print('RETRIEVED_CHUNKS:', len(r.optimized.selected_chunks))
for c in r.optimized.selected_chunks: print('  ', c.get('source_file','?'))
" 2>/dev/null || echo "⚠️ RETRIEVAL UNAVAILABLE — proceed on agent files only and flag reduced context in your response."
cd "$_ROOT" 2>/dev/null || true
_SPEC=$(ls -t "$_ROOT"/store/tasks/*.yaml 2>/dev/null | head -1)
if [ -n "$_SPEC" ]; then
  echo "ACTIVE_SPEC: $_SPEC"
  echo "── your work-item slice (sharding rule: this is ALL you see) ──"
  grep -n -A6 "owner: {{AGENT_ID}}" "$_SPEC" 2>/dev/null | head -40 || true
  echo "RULE: write ONLY inside owns_paths of YOUR work items. Consume upstream outputs via their produces: contracts — never transcripts."
else
  echo "ACTIVE_SPEC: none — single-agent task; Playbook rules still apply."
fi
