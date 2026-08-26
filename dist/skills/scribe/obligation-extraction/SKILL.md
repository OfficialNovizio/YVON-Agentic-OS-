---
name: obligation-extraction
agent: scribe
department: Legal & Compliance
version: 1.1.0
tier: 4
description: |
  After a contract is signed, extract ongoing obligations (renewals, notice windows, insurance, audits, data return, MFN, reporting, non-solicit, non-compete, price adjustment) into a machine-readable ledger keyed by counterparty+slug. Currently LLM-based reasoning against a 10-type taxonomy — reasoning-based per §0.6 until touch-2 produces the book-grounded script at Shared OS/logical/contract_obligation_taxonomy.py. (yvon)
triggers:
  - obligation extraction
  - extract obligations from this contract
  - add this signed contract to the ledger
  - track this contract
  - what am i on the hook for
  - what obligations are we tracking
  - what renewals are coming up
  - what's the notice window on this vendor
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/scribe/custom/obligation-extraction/SKILL.md
  source_hash: 886d75ae0aeea1ed770320ce84e4d09bb22a16d9044a694658c648e60a6cd9ec
  generated: 2026-07-29T22:02:08.735Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/scribe/custom/obligation-extraction/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scribe -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scribe — Legal & Compliance · skill: obligation-extraction"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scribe\",\"skill\":\"obligation-extraction\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Legal & Compliance/scribe/operational/agent/scribe-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi

# ── T4: CAOS retrieval + TASK-SPEC slice (build/exec skills only) ──
# BEFORE running: replace <TASK> with the user's request VERBATIM.
cd "$_ROOT/rag" 2>/dev/null && timeout 60 python3 -c "
import sys,os; sys.path.insert(0,'core'); sys.path.insert(0,'harness')
sys.path.insert(0,os.path.join('..','Teams','Shared OS','logical'))
from retriever import retrieve
r = retrieve('''<TASK>''', agent_id='scribe', agent_dept='Legal & Compliance')
print('RETRIEVED_CHUNKS:', len(r.optimized.selected_chunks))
for c in r.optimized.selected_chunks: print('  ', c.get('source_file','?'))
" 2>/dev/null || echo "⚠️ RETRIEVAL UNAVAILABLE — proceed on agent files only and flag reduced context in your response."
cd "$_ROOT" 2>/dev/null || true
_SPEC=$(ls -t "$_ROOT"/store/tasks/*.yaml 2>/dev/null | head -1)
if [ -n "$_SPEC" ]; then
  echo "ACTIVE_SPEC: $_SPEC"
  echo "── your work-item slice (sharding rule: this is ALL you see) ──"
  grep -n -A6 "owner: scribe" "$_SPEC" 2>/dev/null | head -40 || true
  echo "RULE: write ONLY inside owns_paths of YOUR work items. Consume upstream outputs via their produces: contracts — never transcripts."
else
  echo "ACTIVE_SPEC: none — single-agent task; Playbook rules still apply."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Operator says "extract obligations from this contract", "add this signed contract to the ledger", "track this contract".
- Operator asks "what am I on the hook for", "what obligations are we tracking", "what renewals are coming up", "what's the notice window on this vendor".
- Any request that reads or mutates `ledger.yaml`.

Do NOT use for:

- *Reviewing* an unsigned contract — that's `contract-review-routing`.
- *Managing templates* — that's `contract-library`.
- *Alerting* on upcoming deadlines — this skill maintains the ledger; time-based alerting is out of scope (a future scheduler concern).

## Purpose

For each signed contract in scope, maintain a machine-readable record of the ongoing obligations that arise from it:

- **renewal** — auto-renewal cadence and term
- **notice-window** — notice periods (opt-out, termination, price change)
- **insurance** — types + limits + renewal dates
- **audit** — rights, cadence, notice
- **data-return** — deletion deadlines on termination
- **mfn** — most-favored-nation commitments
- **non-solicit** — restrictive covenants on hiring
- **non-compete** — restrictive covenants on competition
- **reporting** — recurring reports owed to counterparty
- **price-adjustment** — CPI, indexation, escalation caps

Ledger lives at `ledger.yaml`. Keyed by `counterparty + slug + effective_date` so multiple contracts with the same counterparty stay distinct.

## Protocol

```
INTAKE       operator supplies signed .docx (or plain text) + counterparty + slug + effective_date
PARSE        run scripts/extract_obligations.py → low-confidence candidates in YAML
REVIEW       present each candidate to operator; operator confirms / rejects / edits
COMMIT       append confirmed obligations to ledger.yaml under the contract's key
RETRIEVE     lookup by counterparty / slug / obligation type / upcoming date
```

## Boundaries & handoffs

- name: obligation-extraction

## Output format

- **Parse output** (Step 2) → the script's YAML, unmodified.
- **Review** (Step 3) → table per §0.9.
- **Commit confirmation** (Step 4) → one-line confirmation + the appended block echoed to the operator.
- **Retrieve** (Step 5) → table format matching the query type.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scribe\",\"skill\":\"obligation-extraction\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
