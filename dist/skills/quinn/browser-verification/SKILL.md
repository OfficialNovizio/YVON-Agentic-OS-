---
name: browser-verification
agent: quinn
department: Engineering
version: 1.0.0
tier: 3
description: |
  The Reticle-era lesson (dev's delivery-governance cites it too): an agent reports "feature complete" and the page is a shell of placeholder data and dead buttons. (yvon)
triggers:
  - browser verification
  - verify this edit
  - did the change actually render
  - run the browser checks
  - e2e for release
  - browser evidence
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/quinn/custom/browser-verification/SKILL.md
  source_hash: a1181fea4e01937ad12074e74f225677ddd9012454388d787ee65d10db2fdb44
  generated: 2026-07-20T03:20:22.848Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/quinn/custom/browser-verification/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js quinn -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: quinn — Engineering · skill: browser-verification"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"browser-verification\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/quinn/operational/agent/quinn-config.md"
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

Triggers: "verify this edit," "did the change actually render," "run the browser checks," "E2E for release," "browser evidence," any mia/frontend diff at review time (edit gate), and every release with user-facing changes (release gate, via the matrix's E tier).

## Purpose

The Reticle-era lesson (dev's delivery-governance cites it too): an agent reports "feature complete" and the page is a shell of placeholder data and dead buttons. Static review can't catch this — the code *looks* wired. Only a browser executing the real app proves the claim. This skill makes browser evidence a gate requirement, not a nice-to-have: no evidence, no pass.

## Protocol

```
EDIT GATE (per frontend change — Reticle when connected)
  Frontend diff claims done
    -> Verify in the running app: element exists · state real (no mock/fixture leakage) ·
       expected network calls fire · change traces to file:line
      -> PASS: evidence attached to the review · FAIL: specific delta back to author
         (mock data rendering = dev's review-integrity block, escalated as such)

RELEASE GATE (per release — Playwright via marketplace/webapp-testing)
  Release candidate with user-facing changes
    -> Run critical flows (config: critical_flows) headless, real input, networkidle-awaited
      -> Screenshots + console/network logs captured as evidence
        -> All flows pass → E-tier evidence to test-strategy's gate verdict
        -> Any fail → GATE FAIL with flow · step · screenshot · console excerpt

Both gates run under the charter: browser tooling calls are plan-locked (Rail 1) and sandboxed,
egress-allowlisted (Rail 2) — a test run cannot exfiltrate.
```

## Boundaries & handoffs

-> browser-verification supplies evidence: edit gate (per frontend diff) + release gate (E tier)
- "Did the edit actually work," browser evidence, E2E run → **browser-verification** (never call webapp-testing directly for gate decisions — it's machinery, not judgment).

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"browser-verification\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
