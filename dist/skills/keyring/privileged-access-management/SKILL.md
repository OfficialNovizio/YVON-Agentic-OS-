---
name: privileged-access-management
agent: keyring
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Standing admin access is how a single phished credential becomes a full compromise. (yvon)
triggers:
  - privileged access management
  - who has admin
  - grant break-glass
  - why is this a standing admin
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/keyring/custom/privileged-access-management/SKILL.md
  source_hash: 38635b0cc293a9e3b3cf95459c5cddeac33b80bda96e8aa5bf35f38126df3742
  generated: 2026-07-20T03:20:23.110Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/keyring/custom/privileged-access-management/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js keyring -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: keyring — Cybersecurity · skill: privileged-access-management"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"privileged-access-management\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/keyring/operational/agent/keyring-config.md"
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

- Any admin/root/superuser/org-owner access is involved.
- "Who has admin," "grant break-glass," "why is this a standing admin."
- Privileged-access review (stricter cadence than normal reviews).

## Purpose

Standing admin access is how a single phished credential becomes a full compromise. PAM shrinks the privileged attack surface: fewer privileged accounts, granted only when needed, for only as long as needed, with every use watched — so a stolen credential is usually not privileged, and a privileged action is always visible.

## Protocol

MINIMIZE (fewest possible privileged accounts; no shared admin logins; personal accountability) → JUST-IN-TIME (privilege granted for a specific task and time window, then automatically removed — zero standing privilege where possible; operator/PAM-tool executes) → BREAK-GLASS (emergency high-privilege access is pre-defined, heavily logged, alerts on use, and reviewed after every use — not a always-on backdoor) → MONITOR (every privileged action logged and, ideally, session-recorded; feeds cortex detection) → REVIEW (privileged entitlements recertified on a short cadence; access-reviews, stricter) → keyring designs; operator/PAM-tool executes; break-glass use alerts cortex.

## Boundaries & handoffs

admin/root/break-glass ─► privileged-access-management (just-in-time, minimized, monitored) ─► operator/PAM executes

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"privileged-access-management\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
