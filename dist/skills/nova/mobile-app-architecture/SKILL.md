---
name: mobile-app-architecture
agent: nova
department: Engineering
version: 1.0.0
tier: 3
description: |
  Mobile apps rot differently than web: lifecycle bugs (state lost on backgrounding), navigation spaghetti, platform-channel leaks, and the constant iOS/Android divergence. (yvon)
triggers:
  - mobile app architecture
  - build the mobile app
  - app architecture
  - state management
  - navigation
  - platform channel
  - ios vs android behavior
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/nova/custom/mobile-app-architecture/SKILL.md
  source_hash: 9842681ef32814cc1252e3630ed004f7d0ff3974105588376fafcf5c0bdf72ba
  generated: 2026-07-20T03:20:22.746Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/nova/custom/mobile-app-architecture/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nova -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nova — Engineering · skill: mobile-app-architecture"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"mobile-app-architecture\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers (only when `mobile_active`): "build the mobile app," "app architecture," "state management," "navigation," "platform channel," "iOS vs Android behavior," and any mobile app structure work.

## Purpose

Mobile apps rot differently than web: lifecycle bugs (state lost on backgrounding), navigation spaghetti, platform-channel leaks, and the constant iOS/Android divergence. A clear architecture — state management, navigation structure, platform-abstraction boundaries — keeps the app understandable as it grows across two platforms.

## Protocol

```
[GATE: mobile_active? — if false, nova is dormant; direct to mia (web) instead]
A mobile app to structure
  -> STATE: a clear state-management approach (per the dated playbook's framework)
  -> NAVIGATION: a structured router, not ad hoc push/pop; deep-link-able
  -> LIFECYCLE: handle background/foreground/kill; persist what must survive
  -> PLATFORM CHANNELS: native integrations behind a clean abstraction; leaks flagged
  -> TWO-OS REALITY: platform differences handled explicitly, not assumed away
    -> Consumes raj's API (data-access parallels), atlas's kit via tokens (shared with mia where possible)
      -> Framework mechanics from assets/flutter-playbook.md (dated); architecture is invariant
```

## Boundaries & handoffs

- "App structure / state / navigation / platform channel" → **mobile-app-architecture**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"mobile-app-architecture\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
