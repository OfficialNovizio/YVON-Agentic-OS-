---
name: stack-profile
agent: dev
department: Engineering
version: 1.0.0
tier: 3
description: |
  Hardcoding a stack into skills makes the team serve one company. (yvon)
triggers:
  - stack profile
  - what are we built with
  - set up our tech document
  - what framework/host/db do we use
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: pragmatic-architect-werner-vogels
provenance:
  source_file: Teams/Engineering/dev/custom/stack-profile/SKILL.md
  source_hash: 8070ea059fa6b60db7a561f624805ebfb63297ff2fdb939e59662448a721d2a8
  generated: 2026-07-20T03:20:22.653Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/dev/custom/stack-profile/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js dev -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: dev — Engineering · skill: stack-profile"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dev\",\"skill\":\"stack-profile\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "stack profile," "what are we built with," "set up our tech document," "what framework/host/db do we use," and as the load step of essentially every Engineering skill.

## Purpose

Hardcoding a stack into skills makes the team serve one company. The stack-profile makes the same 11 agents serve a Next.js+Vercel SaaS, a Flutter+Firebase mobile app, or a Rails+Postgres shop — the methods don't change, the profile does. It also gives every agent one source of truth for "how we do things here," so raj's API conventions and mia's framework patterns don't drift apart.

## Protocol

```
Load the stack-profile (config path)
  -> If none: BUILD with the operator (template; real current stack, not aspirational)
    -> Agents read it before acting: raj reads API/backend, mia reads frontend, dana reads data,
       nova reads mobile, ops reads hosting/CI, aegis reads the security-relevant surface
      -> Stack CHANGES are ADRs (dev's architecture-decisions) — the profile is updated on adoption, versioned
        -> Drift (code using a stack choice not in the profile) is a finding
```

## Boundaries & handoffs

- **stack-profile → all agents**: every agent reads the relevant section before acting; drift is a finding.
- **git-workflow-and-versioning → all build agents + ops**: commit/branch/release mechanics every code change follows; branch *policy* conflicts resolve to delivery-governance; the tag+changelog contract feeds ops's release-discipline; tooling examples bind via stack-profile.
"Should we use X / why did we choose Y" → architecture-decisions. "What are we built with" → stack-profile. "Review this / mergeable?" → code-review-standards. "Is this done" → delivery-governance. "How do I commit/branch/version/release this" → git-workflow-and-versioning. Ambiguous → decide, document, or done-check?
No stack-profile → build it first (or proceed on stated stack, labeled provisional). Charter unfilled → most-restrictive reading, stated. Anything unclear → ask.

## Output format

The profile follows `assets/stack-profile-template.md`. In use, agents cite the relevant section: "per stack-profile §Backend, APIs are REST with the documented error shape."

## Voice

Active identity: pragmatic-architect-werner-vogels — see `identity/pragmatic-architect-werner-vogels.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dev\",\"skill\":\"stack-profile\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
