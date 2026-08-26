---
name: infringement-triage
agent: guard
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  > (yvon)
triggers:
  - infringement triage
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/guard/marketplace/infringement-triage/SKILL.md
  source_hash: 233456d228630fdab971e2adb799fa8edb7ea2f9ae57faddfbea07c6a8b8deae
  generated: 2026-07-30T18:50:06.802Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/guard/marketplace/infringement-triage/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js guard -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: guard — Legal & Compliance · skill: infringement-triage"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"infringement-triage\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Legal & Compliance/guard/operational/agent/guard-config.md"
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

Use when the request matches: "infringement triage".

## Purpose

**This is a triage, not a finding of infringement or non-infringement.**
Infringement analysis is fact-intensive and legally complex. Acting on a
triage — sending a cease-and-desist, refusing to stop, filing suit, or
deciding not to — without attorney review is how companies end up on the
wrong side of fee awards, Rule 11 sanctions, declaratory-judgment actions,
and (for patents) treble damages.

## Protocol

1. Read `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md`. If it
   contains `[PLACEHOLDER]`, stop and direct to `/ip-legal:cold-start-interview`.
2. Follow the workflow below.
3. Ask which right is at issue — trademark / copyright / patent / trade secret
   / mixed. If mixed, run each separately; do not blend.
4. Run common intake (party posture — senior or accused, jurisdiction, timing,
   exhibits).
5. Walk the mode-specific factors:
   - **Trademark** — circuit's confusion test + dilution (if famous) +
     false advertising (if a comparative claim).
   - **Copyright** — ownership + registration + access + substantial
     similarity + fair use + DMCA safe harbor (if applicable).
   - **Patent** — claim-chart first pass (route to `fto-triage` output
     structure); literal + DOE; indirect + divided; invalidity defenses to
     consider.
   - **Trade secret** — secrecy + reasonable measures + misappropriation;
     preemption + reverse-engineering flags.
6. Produce a flag list with direction — what cuts toward the senior party,
   what cuts toward the accused, what's mixed. Never conclude.
7. Write the triage memo to the matter folder or practice outputs folder. Apply
   the work-product header per role.
8. End with recommended next steps, the non-lawyer gate if the role is
   non-lawyer, and — if the practice posture supports assertion — an offer to
   draft the C&D via `/ip-legal:cease-desist` or the takedown via
   `/ip-legal:takedown`. Do not draft automatically.

This skill never concludes. If uncertain, flag — the attorney decides.

## Boundaries & handoffs

| "is this infringing" / "knockoff surfaced" | `ip-routing` → `infringement-triage` | Post-observation analysis |
- infringement-triage
- name: infringement-triage

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"infringement-triage\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
