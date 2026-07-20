---
name: social-content-calendar
agent: pulse
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Organic social fails two ways: posting randomly (no cadence, no arc — the account is noise) or posting mechanically (same content cross-posted everywhere — native to nowhere). (yvon)
triggers:
  - social content calendar
  - content calendar
  - what should we post
  - plan this week's/month's social
  - serialize this campaign
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/pulse/custom/social-content-calendar/SKILL.md
  source_hash: 55a95d6fe8d034d6c87fb88aea95cb96079769f7f2259fb7ff7fcaff2a957537
  generated: 2026-07-20T03:20:23.797Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/pulse/custom/social-content-calendar/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js pulse -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: pulse — Brand Studio · skill: social-content-calendar"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pulse\",\"skill\":\"social-content-calendar\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/pulse/operational/agent/pulse-config.md"
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

Triggers: "content calendar," "what should we post," "plan this week's/month's social," "serialize this campaign," or on the configured planning cadence.

## Purpose

Organic social fails two ways: posting randomly (no cadence, no arc — the account is noise) or posting mechanically (same content cross-posted everywhere — native to nowhere). The calendar fixes both: every slot knows its platform, its format (from the playbook), its chapter (from weave's arc, or labeled non-chapter), and its job. For a small business this is the difference between "we should post more" guilt and a system that ships.

## Protocol

```
Load: connected platforms (config) + each platform's playbook + brand voice guide +
      weave's current act/chapters + muse's content-mode ideas + hooks register
  -> Plan the period: slots per platform per cadence
       each slot = platform · format (playbook) · chapter ref (or labeled non-chapter)
                   · hook approach (register-first, then patterns) · CTA/job
    -> Draft per slot: hook-writing psychology + playbook format + lena's voice
       + humanic-writing pass (always)
      -> spark's gate (every post — batch-gated as a series where applicable)
        -> Publish per connector (or hand ready-to-post package to operator)
          -> Outcomes → kai → hooks register + playbook refresh notes
```

## Boundaries & handoffs

social-content-calendar   (PLAN + DRAFT: platforms from config → playbooks (volatile,

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pulse\",\"skill\":\"social-content-calendar\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
