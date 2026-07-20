---
name: mobile-verification
agent: nova
department: Engineering
version: 1.0.0
tier: 3
description: |
  Mobile has failure modes web doesn't: device fragmentation (screen sizes, OS versions, chips), permission flows, offline behavior, battery/memory constraints, and platform gestures. (yvon)
triggers:
  - mobile verification
  - test the app
  - verify on devices
  - does it work on android/ios
  - did this render on device
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/nova/custom/mobile-verification/SKILL.md
  source_hash: b5688af03cd4790080e26a5e36d52f4467a3cdecbddff8230e0cc4ab4875961e
  generated: 2026-07-20T03:20:22.749Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/nova/custom/mobile-verification/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nova -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nova — Engineering · skill: mobile-verification"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"mobile-verification\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers (only when `mobile_active`): "test the app," "verify on devices," "does it work on Android/iOS," "did this render on device," pre-submission (release discipline requires it), and any mobile change.

## Purpose

Mobile has failure modes web doesn't: device fragmentation (screen sizes, OS versions, chips), permission flows, offline behavior, battery/memory constraints, and platform gestures. A verification that ran only on the developer's simulator has verified almost nothing. Because mobile can't roll back (app-store-release-discipline), this pre-ship verification carries even more weight than mia's.

## Protocol

```
[GATE: mobile_active?] A mobile change/release
  -> REAL DEVICES, BOTH OSes: a representative matrix (OS versions, screen sizes, low-end + high-end)
     the simulator/emulator is a first pass, NEVER the verdict
  -> CRITICAL FLOWS: run them on device (like quinn's release gate, mobile edition)
  -> MOBILE-SPECIFIC: permissions, offline behavior, background/foreground, rotation, deep links
  -> INTEGRITY (dev §0, mobile): real data (no mock), real API calls, no placeholder screens claimed done
    -> Evidence (device + OS + result + screenshot) → quinn's gate → app-store-release-discipline
    -> FAIL → specific delta (device/OS/step), not "works on my simulator"
```

## Boundaries & handoffs

→ mobile-verification (real devices, both OSes — feeds quinn's gate)
- "Test on devices / does it work on iOS/Android" → **mobile-verification**.
- **quinn**: mobile-verification feeds the gate; device fragilities become regression-map entries.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nova\",\"skill\":\"mobile-verification\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
