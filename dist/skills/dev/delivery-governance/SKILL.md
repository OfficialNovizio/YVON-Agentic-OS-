---
name: delivery-governance
agent: dev
department: Engineering
version: 1.0.0
tier: 3
description: |
  The operator's core fear — things breaking — is often a "done" that wasn't. (yvon)
triggers:
  - delivery governance
  - is this done
  - can we merge
  - definition of done
  - log this tech debt
  - what's our branching model
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: pragmatic-architect-werner-vogels
provenance:
  source_file: Teams/Engineering/dev/custom/delivery-governance/SKILL.md
  source_hash: b2a9376785f238026aa90da9ec03e979d17460609a4635a4c341a9ed7e11d50c
  generated: 2026-07-20T03:20:22.650Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/dev/custom/delivery-governance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js dev -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: dev — Engineering · skill: delivery-governance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dev\",\"skill\":\"delivery-governance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/dev/operational/agent/dev-config.md"
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

Triggers: "is this done," "can we merge," "definition of done," "log this tech debt," "what's our branching model," or as the closing check on any change.

## Purpose

The operator's core fear — things breaking — is often a "done" that wasn't. An agent says "feature complete," and the app is full of mock data and half-built flows (the exact problem Reticle exists to catch). A written, enforced definition of done makes "complete" mean complete: reviewed, tested, gated, secured, shipped safely, documented.

## Protocol

```
A change claims "done"
  -> Run the Definition of Done (assets/definition-of-done.md): review ✓ · tests ✓ · quinn's gate ✓
     · aegis (if risky) ✓ · charter-clean ✓ · docs/ADR ✓ · ops-shippable (rollback ready) ✓
    -> Any unchecked box → NOT DONE, named
      -> Merge discipline: the branching/merge rules from the stack-profile
        -> Known-but-unfixed issues → the tech-debt register (not silently shipped)
```

## Boundaries & handoffs

- **delivery-governance → quinn + ops + aegis**: the definition of done *requires* their gates; nothing is done without a tested rollback (ops) and green gate (quinn).
- **git-workflow-and-versioning → all build agents + ops**: commit/branch/release mechanics every code change follows; branch *policy* conflicts resolve to delivery-governance; the tag+changelog contract feeds ops's release-discipline; tooling examples bind via stack-profile.
"Should we use X / why did we choose Y" → architecture-decisions. "What are we built with" → stack-profile. "Review this / mergeable?" → code-review-standards. "Is this done" → delivery-governance. "How do I commit/branch/version/release this" → git-workflow-and-versioning. Ambiguous → decide, document, or done-check?

## Output format

```

## Voice

Active identity: pragmatic-architect-werner-vogels — see `identity/pragmatic-architect-werner-vogels.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dev\",\"skill\":\"delivery-governance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
