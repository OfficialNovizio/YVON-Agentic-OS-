---
name: risk-register
agent: warden
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  "Are we secure enough?" is unanswerable without a risk register; with one it becomes "here are our top risks, their treatments, and what the operator has explicitly accepted." It turns security from… (yvon)
triggers:
  - risk register
  - what should we fix first
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: risk-owning-ciso
provenance:
  source_file: Teams/Cybersecurity/warden/custom/risk-register/SKILL.md
  source_hash: 771921a69f404853d33838b4d63057b39855963c5f750fbd480cb11ae13caf32
  generated: 2026-08-08T19:52:18.900Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/warden/custom/risk-register/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js warden -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: warden — Cybersecurity · skill: risk-register"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"risk-register\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/warden/operational/agent/warden-config.md"
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

- A new risk surfaces (framework gap, bastion misconfig, cortex incident, third-party finding, threat-intel).
- Prioritizing security work ("what should we fix first").
- A risk-acceptance decision is needed (routes to operator/board).
- Periodic review (config cadence).
- Auto-populated from guardrail detections (DLP flags, 4-eyes violations, behavioral anomalies — per Sentinel Stack pattern).

## Purpose

"Are we secure enough?" is unanswerable without a risk register; with one it becomes "here are our top risks, their treatments, and what the operator has explicitly accepted." It turns security from vibes into a prioritized, owned, decision-backed list — and it's the artifact that makes the "every risk is owned, treated, or accepted — never ignored" rule real.

## Protocol

```
IDENTIFY (asset × threat × vulnerability — from framework gaps, findings, incidents, intel, guardrail detections)
  → CLASSIFY into 1 of 6 categories: Operational / Financial / Compliance / Strategic / Reputational / Security
    → SCORE (likelihood × impact on defined scale via scripts/risk_score.py)
      → PRIORITIZE (score-ranked × crown-jewel weight; top risks drive department priorities)
        → TREAT (mitigate→owner+control / transfer→insurance/vendor / avoid→stop / ACCEPT→operator|board)
          → OWN (every risk has an owner + review date)
            → TRACK (append-only; treatments and acceptances dated, never silently reversed)
              → REPORT (leadership summary: top risks, trends, risk-appetite drift — per Sentinel Stack pattern)
```

## Boundaries & handoffs

any risk (gap/finding/incident/vendor/intel) ─► risk-register (score → treat → OWN; accept=operator/board)
Handoffs: sentinel/Governance (monitors compliance vs the framework — warden owns framework, sentinel monitors) · board/Governance (risk acceptance + material policy changes, Fleet Charter Rail 3) · precedent (archives decisions) · keyring/bastion/cortex/veil (control owners; their findings → risk-register) · operator (executes every privileged change — the inversion) · relay (agent-tool vendors vs warden's business vendors).

## Output format

```

## Voice

Active identity: risk-owning-ciso — see `identity/risk-owning-ciso.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"risk-register\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
