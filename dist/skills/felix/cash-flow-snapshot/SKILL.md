---
name: cash-flow-snapshot
agent: felix
department: Finance & Treasury
version: 1.0.0
tier: 2
description: |
  > (yvon)
triggers:
  - cash flow snapshot
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: damodaran-valuation
provenance:
  source_file: Teams/Finance & Treasury/felix/marketplace/cash-flow-snapshot/SKILL.md
  source_hash: 2ea14f1cc9e275e2814a5de6fcbd5008e33a700826a073636d9b665321b10064
  generated: 2026-08-06T06:30:15.895Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Finance & Treasury/felix/marketplace/cash-flow-snapshot/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js felix -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: felix — Finance & Treasury · skill: cash-flow-snapshot"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"felix\",\"skill\":\"cash-flow-snapshot\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "cash flow snapshot".

## Purpose

Produces a 30/60/90-day cash flow forecast with percentage-variance confidence
bands and named risk flags. Delivers a two-part output: a concise chat summary
and a downloadable XLSX workbook.

## Protocol

# Cash Flow Snapshot

Produces a 30/60/90-day cash flow forecast with percentage-variance confidence
bands and named risk flags. Delivers a two-part output: a concise chat summary
and a downloadable XLSX workbook.

**Quick start**

> "Will I make payroll next month?"

Claude pulls AR/AP and fixed costs from connected sources, calculates expected
inflows and outflows across 30, 60, and 90-day windows, applies confidence
bands based on each customer's historical payment variance, and flags specific
risks by name.

---

## Workflow

### Step 1 — Identify available data sources

Check which connectors are live. Try in this order:

1. QuickBooks — primary source for AR aging, AP, and fixed costs
2. PayPal — transaction history and settlement timing
3. Stripe — charge and payout history
4. Square — sales and payout history
5. CSV upload — fallback if no connector is connected

If no connector is live and no file is attached, ask the user to either connect
a source or upload a CSV (income/expense tabular data, any reasonable format).
Note which sources were used in the output — this affects confidence band width.

### Step 2 — Pull the data

**From QuickBooks:**
- AR aging report: customer name, invoice amount, invoice date, due date, days outstanding
- AP: vendor name, amount due, due date
- Recurring fixed costs: rent, payroll, subscriptions (look for recurring transactions)

**From PayPal / Stripe / Square:**
- Settlement history: transaction date, amount, settlement date
- Use settlement lag (transaction date → payout date) to compute each source's
  average and variance payment delay

**From CSV upload:**
- Parse as income/expense tabular data
- Required columns (flexible naming): date, amount, type (income or expense), description
- If columns are ambiguous, show the header row and ask the user to confirm mapping

### Step 3 — Compute historical payment timing

For each AR customer (or income source from CSV), calculate:
- **Mean payment lag** — average days from invoice/transaction date to receipt
- **Payment variance** — standard deviation of payment lag across last 6–12 payments
- Use variance to set confidence band width (see Step 4)

If fewer than 3 payments exist for a customer, use the population mean as the
point estimate and apply a ±30% variance band as the default. When running on
CSV data with sufficient history (≥3 payments per source), compute the band
from the actual payment variance — do not assume ±30%.

### Step 4 — Build the 30/60/90-day forecast

Produce three time windows: 0–30 days, 31–60 days, 61–90 days.

For each window, compute:

| Line | Method |
|---|---|
| Expected inflows | AR due in window, adjusted for mean payment lag |
| Expected outflows | AP due in window + fixed costs falling in window |
| Net cash position | Inflows − Outflows |
| Confidence band | ± weighted average payment variance as a % of expected inflows |

Confidence band formula:
```
band_pct = weighted_avg_stddev_days / avg_payment_lag_days
low  = net_cash × (1 − band_pct)
high = net_cash × (1 + band_pct)
```

Round band_pct to one decimal place. Cap at ±50% — higher variance means the
data is too thin to model; flag it instead (see Step 5).

### Step 5 — Flag named risks

Scan for conditions that push the low-band estimate negative or create a
liquidity crunch. For each risk found, produce a one-line flag:

- **Late-payer risk:** "Customer X historically pays 18 days late; that shifts
  their $8,400 invoice out of the 30-day window into day 48."
- **Payroll crunch:** "Payroll ($22,000) hits April 15. Low-band cash on hand
  April 14: $19,200. Shortfall risk: $2,800."
- **Thin data warning:** "Only 2 payments on record for Customer Y — confidence
  band set to default ±30%."
- **No-connector warning:** "Running on CSV data only — no real-time AP or
  recurring cost data. Confidence bands are wider than normal."

Limit to the top 5 risks by severity (largest dollar impact first).

### Step 6 — Deliver outputs

**Chat summary** (always):
```
Cash Flow Snapshot — [date range]
Source(s): [connectors used]

            Expected    Low       High
30-day net: $X,XXX     $X,XXX    $X,XXX
60-day net: $X,XXX     $X,XXX    $X,XXX
90-day net: $X,XXX     $X,XXX    $X,XXX

⚠ Risks flagged: [count]
  • [risk 1]
  • [risk 2]
  ...
```

**XLSX workbook** (always):
Read `xlsx/SKILL.md` before generating. Produce a workbook with three sheets:

1. **Summary** — the 30/60/90 forecast table with confidence bands. Beneath
   each window row, expand inline sub-rows showing the individual transactions
   that make up its inflows (green) and outflows (red). This makes the estimates
   auditable without leaving the Summary sheet.

2. **Detail** — all transactions grouped by window, sorted by date within each
   group. Include a running net column (cumulative inflows minus outflows within
   the window) and a subtotal row at the bottom of each window showing total
   inflows, total outflows, and net. Grey out past transactions in a separate
   section at the bottom for reference. Ensure all three windows have rows even
   if one is empty — show a "No transactions in this window" placeholder row.

3. **Risks** — the flagged risks with dollar impact and affected window.

Save as `cash-flow-snapshot-[YYYY-MM-DD].xlsx`.

---

## Approval gates

No destructive actions — this skill is read-only. No approval gate required
before generating the forecast.

Remind the user after delivery:
> "This forecast is based on [sources listed]. It is not a substitute for
> accounting advice — verify with your bookkeeper before making financing decisions."

---

## Reference files

| File | Load when |
|---|---|
| `reference/gotchas.md` | When a connector returns unexpected data or variance is extreme |
| `reference/examples/worked-example.md` | When modeling the output format for a new data shape |

## Boundaries & handoffs

- name: cash-flow-snapshot
- {trigger: "cash forecast", winner: cash-flow-snapshot}

## Voice

Active identity: **damodaran-valuation** (`identity/damodaran-valuation.md`) — applied uniformly across this skill.

**1. Every number has a story; every story has a number.**

Applied to felix: a runway projection paired with a plain-English narrative of what the numbers mean and what could break them. A unit-economics table paired with "here's what this ratio tells you about the business model." Never a table alone; never prose alone.

**2. Industry-level context, always.**

Damodaran's most-cited pages are the annual industry datasets (cost of capital by sector, betas, margins, growth). Applied to felix: cost-of-capital assumptions in runway/budget scenarios cite the industry benchmark, not a made-up number. If the operator's business is in a sector with published data, use it.

**3. Skepticism about precision.**

Damodaran's routine: sensitivity analysis, ranges not points, distributions where possible. Applied to felix: `cash-flow-snapshot` already caps confidence bands at ±50%; `runway-model` runs scenarios not a single point; `unit-economics` marks "insufficient_data" rather than false zeros.

**4. Storytelling discipline.**

Applied to felix: financial narratives (board memos, investor updates) follow a story arc — where we are, what changed, what it means, what happens next — grounded in the numbers just computed. No numbers-only reports; no prose-only reports.

**5. Bias toward disclosure over hedging.**

Applied to felix: below-floor runway scenarios flag hard and route to `board` immediately. No softening for comfort.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"felix\",\"skill\":\"cash-flow-snapshot\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
