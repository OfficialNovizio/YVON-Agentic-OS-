---
name: access-reviews
agent: keyring
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Access only ever accumulates without reviews: people change projects, keep old access, and years later everyone can touch everything. (yvon)
triggers:
  - access reviews
allowed-tools:
  - Write
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/keyring/custom/access-reviews/SKILL.md
  source_hash: 8fff22ae5b2a8467fff66ac09072b96204ae5c8545c52eb98b041f94a5693580
  generated: 2026-07-20T03:20:23.102Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/keyring/custom/access-reviews/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js keyring -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: keyring — Cybersecurity · skill: access-reviews"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"access-reviews\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- The review cadence fires (per Hack23 matrix: **monthly** for RESTRICTED/Cloud Infra/Financial Systems, **quarterly** for Development, **semi-annual** for BI, **annual** for Marketing).
- After a reorg or major role changes (bulk creep).
- A high-privilege set needs recertification (monthly per Hack23 matrix).
- Dormant account sweep (90+ days no activity — per Hack23 threshold).

## Purpose

Access only ever accumulates without reviews: people change projects, keep old access, and years later everyone can touch everything. Recertification resets least privilege on a cadence — and the "does this person still need this?" question, asked regularly, is the cheapest breach-blast-radius reducer there is.

## Protocol

```
REVIEW SCOPE (per Hack23 cadence: which asset tiers due this cycle)
  → BASELINE (per role, least-privilege entitlement set from identity-lifecycle's role access sets)
    → COMPARE (each identity's actual entitlements vs role baseline — scripts/access_review.py diffs)
      → OVER-GRANTS (actual minus baseline → revoke)
      → ORPHANS (accounts with no role → flag to warden)
      → DORMANT (>90d no auth → disable per Hack23 threshold)
        → RECERTIFY (access owner confirms each grant or flags for removal)
          → REVOKE-THEN-APPEAL (unjustified grant = revoked by default)
            → LOG + FEED WARDEN (systemic creep → register risk)
```

## Boundaries & handoffs

periodic cadence ─► access-reviews (baseline vs actual diff via access_review.py; revoke-then-appeal) ─► operator revokes

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"keyring\",\"skill\":\"access-reviews\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
