---
name: close-month
agent: ledger
department: Finance & Treasury
version: 1.0.0
tier: 3
description: |
  Closes the month — reconciles QB vs payment processors, flags gaps, writes P&L narrative, exports close packet. Accepts optional month and save-to arguments. (yvon)
triggers:
  - close month
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Finance & Treasury/ledger/marketplace/close-month/SKILL.md
  source_hash: 0316774b25db7ac8411fb011c7b7825e034930095f37815f795ee3765ad150ae
  generated: 2026-08-06T06:30:15.926Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/ledger/marketplace/close-month/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ledger -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ledger — Finance & Treasury · skill: close-month"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ledger\",\"skill\":\"close-month\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Finance & Treasury/ledger/operational/agent/ledger-config.md"
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

Use when the request matches: "close month".

## Purpose

Run the month-end close workflow. Reconcile, flag gaps, narrate the P&L, and export the close packet for the owner's records (and their accountant).

## Protocol

Run the month-end close workflow. Reconcile, flag gaps, narrate the P&L, and export the close packet for the owner's records (and their accountant).

Parse arguments:
- `--month` (default: previous calendar month) — `YYYY-MM` format
- `--save-to` (default `files`) — `files` (Google Drive / OneDrive), `desktop` (local), or `both`

## Step 1 — Reconcile

Trigger the `month-end-prep` skill workflow:

1. Pull all QuickBooks transactions for the target month.
2. Pull settlements from each connected payment processor (PayPal, Stripe, Square) for the same month.
3. Match QB entries to processor settlements by amount + date (±2 days).
4. Surface three gap categories:
   - **Unmatched processor settlements** — money came in via PayPal/Stripe/Square but never landed in QB
   - **Unmatched QB deposits** — QB shows income with no processor record (cash? wire? misclassified?)
   - **Variance lines** — matched but amount differs (fees, refunds split)

## Step 2 — Flag suspicious entries

Surface in the same report:
- **Uncategorized transactions** — QB entries with no category
- **Suspicious duplicates** — same amount, same vendor, within 3 days
- **Missing receipts** — QB entries above $75 with no attachment

For each, recommend an action: categorize as X, delete duplicate, attach receipt from inbox.

Wait for owner to triage flagged items before generating the narrative. Do not auto-categorize or auto-delete.

## Step 3 — P&L narrative

After triage, generate a plain-English P&L narrative:

```
{Month YYYY} closed at ${revenue} revenue ({+/-}{X}% vs prior month).
Top driver: {category/customer}. Biggest swing: {category} {direction} ${amount}
because {reason inferred from transactions}.

Margin: {X}% ({+/-}Y pts vs prior). {Cost-side commentary}.

Three notable items:
1. ...
2. ...
3. ...
```

Numbers come from QB; the *why* comes from cross-referencing top transactions, vendor names, and prior-month deltas.

## Step 4 — Export the close packet

Generate two files:

1. **`close-packet-{YYYY-MM}.xlsx`** — multi-tab workbook:
   - `Reconciliation` — QB ↔ processor match table with gap rows highlighted
   - `Flagged` — uncategorized / duplicates / missing receipts
   - `P&L` — formatted income statement with prior-month delta column
   - `Trial Balance` — accounts + ending balances
2. **`close-packet-{YYYY-MM}.pdf`** — one-page summary: P&L narrative + top-line numbers + gap count

Save both to the chosen `--save-to` location. Filename format: `close-packet-2026-04.xlsx` etc.

## Connector failures

If QuickBooks is unreachable, stop — reconciliation requires QB as the source of truth. If a payment processor (PayPal, Stripe, Square) is unreachable, run reconciliation against the available processors and note "PayPal not connected — PayPal settlements skipped from reconciliation" (or whichever is missing). If all processors are missing, run QB-only analysis and flag it.

## Approval gates

- **Never auto-fix flagged items.** Always show the gap, recommend an action, wait for the owner.
- **Never delete duplicates without explicit confirmation.** Show both records side-by-side.
- **Saving the packet is auto** — it goes to the owner's own drive.

## Output

End the run with a one-paragraph recap: revenue, margin, gap count remaining (if any), file paths to the saved packet. If gaps were not all resolved, list them so the owner can revisit.

## Boundaries & handoffs

- name: close-month
- {trigger: "reconcile", winner: close-month}
- {trigger: "close the books", winner: close-month}

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ledger\",\"skill\":\"close-month\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
