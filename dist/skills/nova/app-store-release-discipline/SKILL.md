---
name: app-store-release-discipline
agent: nova
department: Engineering
version: 1.0.0
tier: 3
description: |
  Mobile release failures are uniquely painful: a crash ships to millions, the fix takes a review cycle (hours to days), and users who auto-updated are stuck. (yvon)
triggers:
  - app store release discipline
  - release the app
  - submit to the store
  - app store review
  - staged rollout
  - the app crashed in production
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/nova/custom/app-store-release-discipline/SKILL.md
  source_hash: 3842cf1d26cef1fc4027ebee2ed295c2c0aafa4dc1a3620697fafcf6e35ef477
  generated: 2026-07-20T03:20:22.742Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/nova/custom/app-store-release-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nova -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nova — Engineering · skill: app-store-release-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"app-store-release-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/nova/operational/agent/nova-config.md"
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

Triggers (only when `mobile_active`): "release the app," "submit to the store," "app store review," "staged rollout," "the app crashed in production," and any mobile release.

## Purpose

Mobile release failures are uniquely painful: a crash ships to millions, the fix takes a review cycle (hours to days), and users who auto-updated are stuck. This discipline front-loads the caution: thorough pre-submission verification, staged rollout to catch problems at 1% not 100%, and forward-fix readiness because backward-rollback is weak.

## Protocol

```
[GATE: mobile_active?] A mobile release candidate
  -> PRE-SUBMISSION: quinn gate + mobile-verification on real devices (both OSes) + charter clean
  -> STORE GUIDELINES: review-guideline compliance checked (rejection = lost days)
  -> VERSIONING: build/version bumped correctly; release notes; phased-release configured
  -> STAGED ROLLOUT: 1% → 10% → 100%, watching crash-free rate + reviews at each stage
     (this is mobile's substitute for instant rollback — catch it small)
    -> Problem at a stage → HALT rollout, forward-fix (rollback is weak), expedited review if severe
      -> Signing secrets: held by the OPERATOR, never the agent (charter-adjacent)
```

## Boundaries & handoffs

→ app-store-release-discipline (staged rollout IS the rollback; can't recall a release)
- "Release / submit / staged rollout / store review" → **app-store-release-discipline**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"app-store-release-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
