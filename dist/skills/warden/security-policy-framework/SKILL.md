---
name: security-policy-framework
agent: warden
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Security without a framework is a pile of ad hoc rules nobody can audit. (yvon)
triggers:
  - security policy framework
  - which control covers x
  - map us to nist/iso/soc 2
  - what's our control gap
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: risk-owning-ciso
provenance:
  source_file: Teams/Cybersecurity/warden/custom/security-policy-framework/SKILL.md
  source_hash: ee81b27773f4de0f0e48f5097c52669afa3b6b0bf58d0bc73c11f844f9a3b1bc
  generated: 2026-07-20T03:20:23.225Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/warden/custom/security-policy-framework/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js warden -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: warden — Cybersecurity · skill: security-policy-framework"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"security-policy-framework\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Establishing or updating the security control framework for a business.
- "Which control covers X," "map us to NIST/ISO/SOC 2," "what's our control gap."
- A new system/process needs its controls identified (feeds the risk-register).

## Purpose

Security without a framework is a pile of ad hoc rules nobody can audit. A standard-mapped ISMS makes "are we secure" a checkable question: every control has an owner, a status, and evidence — and gaps are visible, not assumed away. It also gives sentinel (Governance) something concrete to monitor compliance against.

## Protocol

CHOOSE STANDARD (config `control_standard` — NIST CSF default; installs the matching GRC pack) → MAP (the pack's control catalog → this business's systems/data/people; each control gets an OWNER: an agent, the operator, or another dept) → POLICY SET (the human-readable policies implementing the controls — access, encryption, IR, acceptable-use; assets/isms-policy-index.md) → STATUS (each control: implemented / partial / gap / not-applicable-with-reason — no silent gaps) → EVIDENCE (what proves a control works — feeds sentinel's compliance monitoring) → CHANGE (material policy changes route anneal → board, Fleet Charter Rail 3; senior charters unchanged).

## Boundaries & handoffs

establish/update security law ─► security-policy-framework (ISMS: control map + policy set; wraps GRC pack)

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"security-policy-framework\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
