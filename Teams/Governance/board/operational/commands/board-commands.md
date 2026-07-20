---
name: board-commands
type: operational/commands
status: consolidated from trigger phrases already defined within board's individual skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: board (Governance / Governance Gate)
date_added: 2026-07-06
---

## Purpose

A single routing reference for board: which phrase invokes which skill, and when the full gate sequence runs instead of a single check.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| constitution-enforcement | "constitutional review," "is this allowed," "does this violate our rules" | `/board-constitution` |
| strategic-veto | "veto check," "strategy conflict," "does this fit our strategy" | `/board-veto` |
| fiduciary-guard | "approve budget," "can we afford this," "spend approval," "budget gate" | `/board-budget` |
| risk-assessment-matrix | "risk score this," "risk assessment," "how risky is this" | `/board-risk` |
| pre-mortem | "pre-mortem this," "assume this failed," "what would kill this" | `/board-premortem` |
| (full sequence) | "gate review," "governance review," "submit for approval," a decision submitted without naming a check | `/board-gate` |

## Precedence Rules

### Submitted decision vs named check
A decision submitted for approval (no specific check named) runs the **full gate sequence** per `board-skill-routing.md`, with its early exits. A request naming one check runs that skill alone — but if other gates obviously apply (e.g., "risk score this $40K spend" where no fiduciary review has run), note the unrun gates in the output rather than silently providing a partial blessing.

### "Is this allowed" vs "does this fit our strategy"
Both smell like permission questions. Route by document: categorical/permanent rules → constitution-enforcement; time-bound strategy bets → strategic-veto. If unclear which document covers it, run constitution-enforcement first (sequence order) — it will find no applicable article and hand off cleanly.

### "What could go wrong" — pre-mortem vs risk matrix
Generating failure scenarios for a major/untested commitment → pre-mortem (then matrix). Scoring an already-known risk list → risk-assessment-matrix directly.

### What board does NOT take
- "Stress test this plan" to *improve* it pre-submission → marcus (decision-critic). Board gates; it doesn't coach.
- "Which venture/feature first" → marcus (venture-priority-matrix) / vista (rice-prioritization).
- Writing or amending the constitution or locked commitments → operator (with marcus for strategy); board supplies templates and flags ambiguities only.

## Fallback

If a request doesn't clearly match any row, ask what ruling is being sought rather than guessing — a gate that guesses its own jurisdiction is worse than no gate.
