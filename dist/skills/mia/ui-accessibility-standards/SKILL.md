---
name: ui-accessibility-standards
agent: mia
department: Engineering
version: 1.0.0
tier: 3
description: |
  Two failure modes this prevents: inconsistency (every screen a slightly different button, spacing, interaction) and inaccessibility (unusable by keyboard, invisible to screen readers, failing… (yvon)
triggers:
  - ui accessibility standards
  - build this component/screen
  - is this accessible
  - a11y
  - wcag
  - keyboard navigation
  - contrast
  - the ui is inconsistent
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/mia/custom/ui-accessibility-standards/SKILL.md
  source_hash: a08456373a44cb7654b10465f4c4ce674cc056d5fbc991f59e23ed1f3e13fe10
  generated: 2026-07-20T03:20:22.705Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/mia/custom/ui-accessibility-standards/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js mia -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: mia — Engineering · skill: ui-accessibility-standards"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"ui-accessibility-standards\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/mia/operational/agent/mia-config.md"
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

Triggers: "build this component/screen," "is this accessible," "a11y," "WCAG," "keyboard navigation," "contrast," "the UI is inconsistent," and any user-facing interface work.

## Purpose

Two failure modes this prevents: inconsistency (every screen a slightly different button, spacing, interaction) and inaccessibility (unusable by keyboard, invisible to screen readers, failing contrast — excluding users and, increasingly, failing legal requirements). Both come from building screens ad hoc instead of from a component system with accessibility baked in.

## Protocol

```
A UI to build
  -> COMPONENTS from the system: reuse before creating; new components enter the library, tokens-based
  -> SEMANTIC HTML: the right element (button is a <button>), not a div with a click handler
  -> KEYBOARD: everything operable without a mouse; visible focus; logical tab order
  -> SCREEN READERS: labels, roles, alt text, ARIA only where semantics fall short
  -> CONTRAST + sizing: WCAG AA minimum (tokens should already encode compliant colors)
    -> Verify in a real browser (frontend-verification: Agentation + quinn's Reticle/Playwright)
```

## Boundaries & handoffs

→ ui-accessibility-standards (components from tokens; semantic, keyboard, WCAG)
- "Build component/screen / accessible / a11y / WCAG / keyboard / contrast" → **ui-accessibility-standards**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"ui-accessibility-standards\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
