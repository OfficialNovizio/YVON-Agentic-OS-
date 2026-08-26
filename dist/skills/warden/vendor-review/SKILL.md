---
name: vendor-review
agent: warden
department: Cybersecurity
version: 1.1.0
tier: 2
description: |
  If key information is missing — the team can't articulate what data the vendor would touch, or pricing is 'we haven't asked yet' — flag it. (yvon)
triggers:
  - third party risk
allowed-tools:
  - <FILL_IN: not listed in warden-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: risk-owning-ciso
provenance:
  source_file: Teams/Cybersecurity/warden/marketplace/third-party-risk/SKILL.md
  source_hash: ef561f1d4434c25e8ca65ddb25791779098745ea81120f91e186116497176091
  generated: 2026-08-08T19:52:18.912Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/warden/marketplace/third-party-risk/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js warden -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: warden — Cybersecurity · skill: vendor-review"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"vendor-review\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

- A new vendor is being evaluated for a significant contract (typically $5K+/year or touching sensitive data).
- An existing vendor is up for renewal and should be re-evaluated rather than auto-renewed.
- Something went wrong with a vendor and the business needs to assess whether to escalate, renegotiate, or replace.
- A shortlist of vendors exists and the business needs a structured comparison to make a final selection.
- This skill covers vendor selection and renewal evaluation. It does not cover contract negotiation, compliance audits of existing vendors, or procurement process design — those are separate workflows.

## Purpose

Vendor decisions that are made on price alone, or on the demo alone, or on the relationship alone, regularly turn into surprises: hidden migration costs, security gaps no one checked, SLA failures that aren't enforceable, or lock-in that becomes clear only when it's too late to back out. This skill exists to prevent those surprises by putting every significant vendor decision through the same structured evaluation, so the business can compare apples to apples and know exactly what it's signing up for.

## Protocol

```
GATHER (vendor details, pricing, and scope of engagement)
  → ANALYZE COST (TCO: subscription + implementation + migration + training + exit costs)
    → ASSESS RISK (financial stability, security/compliance posture, concentration risk, lock-in)
      → EVALUATE PERFORMANCE (SLA compliance, support responsiveness, uptime history — for renewals)
        → COMPARE (side-by-side matrix for shortlists, or current vs market for single-vendor evaluations)
          → RECOMMEND (Proceed / Negotiate / Pass with supporting rationale and negotiation points)
```

## Boundaries & handoffs

- **handoffs**: vendor/SaaS dependency assessment feeds risk-register (their breach = our incident); agent-tool vendors belong to relay, business vendors to warden

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"vendor-review\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
