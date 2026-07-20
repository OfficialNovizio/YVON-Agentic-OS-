---
name: breach-notification
agent: veil
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Missing a regulatory notification deadline is often more costly than the breach itself — fines for late notification can exceed fines for the underlying incident. (yvon)
triggers:
  - breach notification
  - do we need to notify anyone
  - what's our gdpr clock
  - breach notification obligations
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/veil/custom/breach-notification/SKILL.md
  source_hash: 99e53e1e666aa76c0ec08b2837f3d20063fde22cf28273fa9c57c3a79a52f18c
  generated: 2026-07-20T03:20:23.159Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/veil/custom/breach-notification/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js veil -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: veil — Cybersecurity · skill: breach-notification"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"veil\",\"skill\":\"breach-notification\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/veil/operational/agent/veil-config.md"
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

- A data breach is confirmed (by cortex IR).
- "Do we need to notify anyone," "what's our GDPR clock," "breach notification obligations."
- Testing / tabletop exercise for breach notification.
- Updating notification contacts or jurisdictional scope.

## Purpose

Missing a regulatory notification deadline is often more costly than the breach itself — fines for late notification can exceed fines for the underlying incident. This skill exists to make sure that when a breach happens, the notification clock is tracked, the right contacts are notified, and every regulatory obligation is met with time to spare.

## Protocol

```
BREACH CONFIRMED (by cortex IR — data type, scope, affected individuals confirmed)
  → IDENTIFY APPLICABLE JURISDICTIONS (config: which regulations apply to this business)
    → CHECK NOTIFICATION TRIGGERS (does this breach meet the threshold for each jurisdiction?)
      → TRACK CLOCKS (per jurisdiction: breach confirmation timestamp → deadline)
        → PREPARE NOTIFICATION (facts required per jurisdiction: what happened, what data, what response)
          → APPROVE (operator/legal review before sending)
            → SEND NOTIFICATION (operator executes; veil provides the draft)
              → LOG (notification details, timestamp sent, recipient confirmation)
```

## Boundaries & handoffs

**Handoffs:** cortex IR (breach confirmation facts → breach-notification; DLP exfiltration alerts → IR investigation) · warden (all gaps, blind spots, and delays = register risks) · spec/loom (DPIA coordination for new features) · dana (encryption and access controls implemented per tiers) · board (material breach escalations) · future Legal (notification drafting, regulatory coordination).

## Output format

```

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"veil\",\"skill\":\"breach-notification\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
