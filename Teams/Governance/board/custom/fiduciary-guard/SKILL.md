---
name: fiduciary-guard
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-06 discussion)
based_on_catalog_entry: fiduciary-guard (VYON_Skills_Catalog_Full_v2.html, board/Governance) — the original hardcoded thresholds (spend >$5K, runway floor 6mo, ROI minimum 1.5x); genericized per rules 0.4/0.5 to read thresholds from board's config, with the catalog values noted only as suggestions, never defaults
assigned_agent: board (Governance / Governance Gate)
portable: true — thresholds, currency, and financials are all operator-supplied per business; nothing hardcoded
includes_script: scripts/fiduciary_check.py (Python, stdlib only — computes runway/ROI checks deterministically; tested 2026-07-06)
date_added: 2026-07-06
---

## Introduction

fiduciary-guard is board's budget-approval gate. Any spend above the configured approval gate gets tested against two financial checks — post-spend runway against the runway floor, and expected ROI against the ROI minimum — and receives a recommendation of APPROVE, CONDITIONAL, or REJECT with the numbers shown. The deterministic arithmetic lives in `scripts/fiduciary_check.py`; the judgment (what the numbers mean, what conditions to attach) stays with the agent, per the DOE split.

This skill produces a *governance recommendation about spending process* — it is not financial advice, and the thresholds embodying the business's risk appetite are the operator's to set.

## Purpose

Small businesses die of unexamined spending; big ventures die of unexamined big spending. This skill makes the examination automatic and consistent: the same three questions (is it above the gate? does it keep us above the runway floor? does it clear the ROI bar?) asked the same way for every spend, at whatever threshold levels fit the business — $1K for a small Canadian shop, $50K for a funded venture. Same skill, different config.

## When to Use

Triggers: "approve budget," "can we afford this," "spend approval," "budget gate," or automatically when any decision in board's gate sequence includes a spend commitment.

Not for: constitutional never-do's (constitution-enforcement — categorical, not threshold), strategy-conflict checks (strategic-veto), or investment/trading decisions of any kind — this skill gates *operating spend process*, nothing more.

## Structure / Protocol

```
Load thresholds from config (never defaults, never invented)
  -> Gather the spend facts (amount, one-time vs recurring, expected return, current financials)
    -> Run scripts/fiduciary_check.py (gate check, runway check, ROI check)
      -> Map results to recommendation: APPROVE / CONDITIONAL / REJECT + reason
        -> Log the ruling; escalate per the escalation rule
```

## Instructions

### Phase 1 — Load Thresholds

Read from board's config (`operational/agent/board-config.md`): `spend_approval_gate`, `runway_floor_months`, `roi_minimum`. **If any is unset, stop and ask the operator to set it** — do not substitute the catalog's illustrative values ($5K / 6 months / 1.5×) or any other default. Thresholds are the business's risk appetite; inventing them is inventing the business's risk appetite.

### Phase 2 — Gather the Spend Facts

- **Amount and shape**: one-time or recurring (monthly). Recurring spend changes burn, not just cash.
- **Current financials**: cash on hand, monthly burn. From the configured financials source or the operator — never estimated by board.
- **Expected return**: the requester's claimed return and horizon, if any. Where no credible return estimate exists, the ROI check is marked NOT EVALUATED, not passed.

### Phase 3 — Compute

Build the input JSON per the schema at the top of `scripts/fiduciary_check.py` and run:

```bash
python scripts/fiduciary_check.py <input.json>            # markdown check table
python scripts/fiduciary_check.py <input.json> --format json
```

The script computes: whether the amount clears the approval gate; runway before and after (one-time: cash − amount over burn; recurring: cash over burn + monthly amount); ROI (expected return ÷ total cost); and each check's PASS / FAIL / NOT_EVALUATED.

### Phase 4 — Recommend

- **Below the gate** → no board approval required; log and pass through (note it, don't rubber-stamp silently).
- **Above the gate, all checks PASS** → **APPROVE** recommendation, numbers shown.
- **Above the gate, any check FAIL** → **REJECT** recommendation, citing the failing check and its numbers. A rejected spend can return re-scoped (smaller amount, staged tranches, stronger return case).
- **Above the gate, any check NOT_EVALUATED** → **CONDITIONAL**: state exactly what data or commitment would resolve it (e.g., "conditional on a validated return estimate — run pre-mortem on the revenue assumption"). CONDITIONAL is a data gap, never a soft approve.

The recommendation is board's input to the operator's decision — the operator can overrule it, and that overrule gets logged too.

### Phase 5 — Log and Escalate

Log every ruling (amount, checks, recommendation, decision-maker's final call) to the configured decision log. Spends above the config's `board_escalation_multiple` × the gate (if set) escalate to the operator regardless of check results — some spends are big enough that passing the arithmetic isn't enough.

## Output Format

```
## Fiduciary Review: [spend, one line]

**Thresholds (from config):** gate [X] · runway floor [Y] months · ROI min [Z]

| Check | Value | Threshold | Result |
|---|---|---|---|
| Approval gate | [amount] | [gate] | above/below |
| Runway after spend | [months] | [floor] | PASS/FAIL |
| Expected ROI | [ratio] | [min] | PASS/FAIL/NOT EVALUATED |

### Recommendation: APPROVE / CONDITIONAL / REJECT
[Reason tied to the specific check(s); for CONDITIONAL, the exact resolving data/commitment]

### Logged / Escalated
[Where recorded; whether the escalation multiple applies]
```

## Principles

- **No thresholds, no gate.** Unset thresholds stop the skill; they are never defaulted or invented.
- **Recurring spend is burn, not a purchase.** A $500/month commitment is judged by its effect on runway trajectory, not as a $500 decision.
- **NOT EVALUATED ≠ PASS.** A missing return estimate produces CONDITIONAL, never a quiet approval.
- **Numbers shown, always.** Every recommendation carries the computed values so the operator can disagree with the arithmetic's inputs, not just the conclusion.
- **Recommend, don't decide.** The operator owns the final call and can overrule — logged either way.
- **Not financial advice.** This is spend-process governance; investment decisions and risk-appetite settings belong to the operator.

## Fallback

- Thresholds unset → stop at Phase 1, ask the operator to fill board-config.
- Financials (cash/burn) unavailable → runway check is NOT_EVALUATED → CONDITIONAL on getting real financials; never estimate them.
- Python unavailable → compute the same three checks manually per the formulas above; flag that the run wasn't script-computed.
- Requester disputes the ROI inputs → the dispute escalates with both estimates shown; board doesn't arbitrate revenue forecasts (that's a marcus/decision-critic or pre-mortem job).

## Boundaries with Other board Skills

- Runs **after** constitution-enforcement (a categorical violation makes the spend question moot) and typically **before** risk-assessment-matrix and pre-mortem (a spend that fails the arithmetic doesn't need a failure-mode workshop).
- constitution-enforcement owns categorical never-do's; this skill owns tunable thresholds. A "rule" that keeps needing exceptions migrates here, to config — not into the constitution.
- pre-mortem is where a CONDITIONAL's shaky return assumption goes to get tested.
- Boundary with marcus: venture-priority-matrix ranks competing spends for the same pool *before* proposals form; fiduciary-guard gates a specific proposed spend *after*.
