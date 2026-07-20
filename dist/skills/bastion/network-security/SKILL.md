---
name: network-security
agent: bastion
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  The flat network is the enemy of security: if any system can reach any other system, a single compromised host becomes a full network compromise. (yvon)
triggers:
  - network security
  - segment this network
  - firewall rule review
  - is our network secure
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/bastion/custom/network-security/SKILL.md
  source_hash: 14eb3e84b6512013b5a687ee555fdab5259f6565f9b80f490622483074e2ba4c
  generated: 2026-07-20T03:20:23.013Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/bastion/custom/network-security/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js bastion -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: bastion — Cybersecurity · skill: network-security"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"network-security\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/bastion/operational/agent/bastion-config.md"
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

- Designing or reviewing network architecture for a new system or service.
- "Segment this network," "firewall rule review," "is our network secure."
- Network security review cadence.
- After a breach/incident that involved lateral movement (lessons → rule changes).

## Purpose

The flat network is the enemy of security: if any system can reach any other system, a single compromised host becomes a full network compromise. Network security creates boundaries — segments, firewalls, micro-perimeters — so that a breach in one zone doesn't become a breach everywhere.

## Protocol

```
NETWORK INVENTORY (segments, subnets, traffic flows, trust zones)
  → SEGMENTATION REVIEW (are boundaries between trust zones enforced?)
    → FIREWALL/SG AUDIT (rules: least-privilege, unused, over-permissive)
      → ZTNA CHECK (is there implicit trust? can internal traffic move laterally unchecked?)
        → MONITORING REVIEW (are network anomalies detected? → feeds cortex)
          → FINDINGS (gaps → warden's register) + RECOMMENDATIONS (bastion specs; operator/ops applies)
```

## Boundaries & handoffs

network review ─► network-security (segmentation, firewall/SG audit, ZTNA, network monitoring)

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"network-security\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
