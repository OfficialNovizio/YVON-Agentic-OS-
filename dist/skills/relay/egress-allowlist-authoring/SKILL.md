---
name: egress-allowlist-authoring
agent: relay
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Rail 2 is only as good as its list. (yvon)
triggers:
  - egress allowlist authoring
  - should this domain be allowed?
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/relay/custom/egress-allowlist-authoring/SKILL.md
  source_hash: 5f7b6a5145c90f1b8c31eb5e4b96a8fd644667f62bc8a09c560556a90fda7623
  generated: 2026-07-20T03:20:22.329Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/relay/custom/egress-allowlist-authoring/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js relay -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: relay — AI & Agents · skill: egress-allowlist-authoring"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"relay\",\"skill\":\"egress-allowlist-authoring\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/relay/operational/agent/relay-config.md"
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
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- Any registry change touching egress domains (new tool, revocation, scope change).
- quinn requests the current allowlist for sandbox policy.
- An egress-denial incident needs a "should this domain be allowed?" answer.

## Purpose

Rail 2 is only as good as its list. An allowlist maintained by hand drifts from the registry; this skill makes the registry the single source and the allowlist a derived artifact.

## Protocol

DERIVE (registry → per-tool domain list) → MINIMIZE (exact hosts over wildcards; no transitive "it might also call...") → VERSION (dated export) → HAND OFF (to quinn/runtime) → RECONCILE (denials vs list).

## Boundaries & handoffs

└► egress-allowlist-authoring (derive + version + hand to quinn)
egress denial ────────► egress-allowlist-authoring (traceable? stale-export : escalate quinn+aegis)

## Output format

Dated allowlist export: `# egress-allowlist vYYYY-MM-DD` + one domain per line with its source tool in a comment. Reconciliation verdicts: `stale-export / not-traceable (escalated)`.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"relay\",\"skill\":\"egress-allowlist-authoring\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
