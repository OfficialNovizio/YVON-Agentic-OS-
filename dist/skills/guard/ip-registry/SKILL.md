---
name: ip-registry
agent: guard
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  Live inventory of the organisation's IP assets — trademarks (registered + common-law), domains, patents (utility + design), copyrighted works, and code IP (repos + OSS attribution obligations). Register / update / renew / retire / attest. Genericised from vyon-ip-registry per §0.4b — no hardcoded venture, no hardcoded jurisdiction. Renewal calendar with alert thresholds. (yvon)
triggers:
  - ip registry
  - what ip do we own
  - list our trademarks
  - list our domains
  - list our patents
  - ip inventory
  - add this trademark
  - renew this asset
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/guard/custom/ip-registry/SKILL.md
  source_hash: e1fc67dbfda1c37b2ebb541bb1113e1326bca3044300152aad412fb9e1da8b95
  generated: 2026-07-30T18:50:06.796Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/guard/custom/ip-registry/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js guard -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: guard — Legal & Compliance · skill: ip-registry"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"ip-registry\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Operator asks "what IP do we own", "list our trademarks", "list our domains", "list our patents", "IP registry", "IP inventory".
- Operator says "add this trademark", "register this [trademark filing / domain / patent]", "renew this asset", "retire this asset".
- Operator asks "IP renewal calendar", "what's coming up for renewal".
- `ip-routing` completes a clearance for a *new* mark — after operator adoption, the mark is added to the registry.
- `ip-routing` completes an infringement triage that surfaces one of our marks needing enforcement — the registry entry is annotated with the enforcement status.

Do NOT use for:

- Clearance / OSS / infringement analysis — that's `ip-routing`.
- Contract terms about IP (assignment / license / warranty) — that's `scribe`.
- Regulatory regimes affecting IP (data protection, export controls) — that's `comply`.

## Purpose

Own the state around the organisation's IP:

- Which IP assets exist (trademarks, domains, patents, copyrights, code IP).
- Which venture / entity owns each.
- Which jurisdiction each is registered / enforceable in.
- Filing / registration status.
- Renewal calendar with alert thresholds.
- Ownership chain (assignment history for patents; recordation for trademarks).
- OSS attribution obligations for code IP (bundled NOTICE files owed).
- Retirement / abandonment status.

State lives at `registry.yaml`. Slugs are stable across renewals.

## Protocol

```
REGISTER      operator supplies IP asset → validate → assign slug → append to registry.yaml
UPDATE        operator supplies change + reason → bump revision → keep prior row for audit
RENEW         due date reached → operator confirms renewal action → update effective/expiry
RETIRE        abandoned / no longer defended → mark retired; keep row
ATTEST        annual review confirms status → record date + owner
RETRIEVE      lookup by slug / type / jurisdiction / owner / next-due
CALENDAR      list upcoming renewals within a horizon window
```

## Boundaries & handoffs

- name: ip-registry

## Output format

- **Register / update / renew / retire / attest** → confirmation line + resulting `registry.yaml` row echoed.
- **Retrieve** → table format matching query type.
- **Calendar** → sorted table (nearest expiry first), colour-tagged by bucket (🔴 overdue · 🟠 ≤30 · 🟡 ≤60 · 🟢 ≤90).
- **Inventory** → grouped by asset_type; totals by jurisdiction.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"ip-registry\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
