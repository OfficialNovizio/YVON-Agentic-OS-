---
name: dispute-log
agent: shield
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  Live registry of active and closed disputes — pre-litigation demand, litigation, arbitration, regulatory action. Status · exposure estimate · response-deadline tracker · external-counsel routing. Genericised from vyon-dispute-log per §0.4b — no hardcoded jurisdiction, no hardcoded venue. Overdue response deadlines never auto-defer. (yvon)
triggers:
  - dispute log
  - log this dispute
  - register this demand letter
  - we got sued
  - we got a demand letter
  - regulatory action against us
  - legal threat
  - dispute status
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/shield/custom/dispute-log/SKILL.md
  source_hash: ec5d074745632ecde957911367f1ab9d14878d49222a4c6e863ec9afd167e8a3
  generated: 2026-08-06T05:54:55.447Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/shield/custom/dispute-log/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js shield -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: shield — Legal & Compliance · skill: dispute-log"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"shield\",\"skill\":\"dispute-log\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Legal & Compliance/shield/operational/agent/shield-config.md"
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

- Operator says "log this dispute" · "register this demand letter" · "we got sued" · "we got a demand letter" · "regulatory action against us" · "legal threat".
- Operator asks "dispute status" · "open disputes" · "list our disputes" · "what disputes do we have" · "dispute exposure summary".
- Operator says "update dispute [slug]" · "close dispute" · "settled" · "dismissed".
- Operator asks "upcoming response deadlines" · "what's overdue".
- `case-assessment-memo` completes → the exposure range and disposition recommendation feed into a dispute-log update.

Do NOT use for:

- Case-level analytical memo — that's `case-assessment-memo` (marketplace).
- Contract terms that gave rise to the dispute — those live in `scribe`'s `contract-library`; the dispute log references the contract slug.
- Regulatory obligation that the dispute is about — the regime lives in `comply`'s `obligation-register`; the dispute log references the obligation slug.
- IP asset that the dispute is over — the asset lives in `guard`'s `ip-registry`; the dispute log references the asset slug.

## Purpose

Own the state around the organisation's disputes:

- Which disputes exist (pre-litigation demand / active litigation / arbitration / regulatory action / IP dispute / employment claim).
- Which venture / entity the dispute is against.
- Counterparty and their counsel.
- Venue (court, tribunal, regulator).
- Current status (demand received / answer due / discovery / motion / trial / appeal / settled / dismissed / judgment).
- Exposure estimate (reasoned range from `case-assessment-memo` output; not a raw plaintiff ask).
- Response deadlines with alert thresholds — never auto-defer overdue.
- External counsel routing (if engaged) with matter number.
- Insurance-carrier notification status (if applicable per policy).
- Reserved amounts (for accounting purposes — reference only; actual GL entries are `Finance & Treasury` domain when that dept is built).
- Milestone history.

State lives at `disputes.yaml`. Slugs are stable across the dispute lifecycle.

## Protocol

```
LOG           operator supplies dispute → validate → assign slug → append to disputes.yaml
UPDATE        status change / new milestone / exposure re-estimate → bump revision → keep prior row
CLOSE         settled / dismissed / judgment / withdrawn → mark closed with disposition
ATTEST        quarterly review confirms disputes still active + exposure current
RETRIEVE      lookup by slug / venture / venue / status / counterparty / owner / next-due
CALENDAR      list upcoming response deadlines within a horizon window
EXPOSURE      aggregate exposure across active disputes for reporting
```

## Boundaries & handoffs

| `case-assessment-memo` (marketplace) | Claim-by-claim + damages + defenses + insurance + venue + recommendation memo | ✅ yes | "case assessment", "assess this dispute", "what's our exposure" | Exposure range → `dispute-log` update |
| `scribe` (Legal & Compliance) | `dispute-log` | Pattern of disputes on a contract template → template revision |
- name: dispute-log
- to: dispute-log

## Output format

- **Log / update / close / attest** → confirmation line + resulting `disputes.yaml` row echoed.
- **Retrieve** → table matching query type.
- **Calendar** → sorted deadline table with colour tags.
- **Exposure** → aggregate table (low / mid / high) with per-dispute breakdown.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"shield\",\"skill\":\"dispute-log\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
