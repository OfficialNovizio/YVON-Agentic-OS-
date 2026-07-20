---
name: risk-assessment-matrix
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-06 discussion)
based_on_catalog_entry: risk-assessment-matrix (VYON_Skills_Catalog_Full_v2.html, board/Governance) — genericized per rules 0.4/0.4b: the original logged to "risk register (ward)", a Risk-department agent not yet built; replaced with a configured risk-register destination
assigned_agent: board (Governance / Governance Gate)
portable: true — risks, scores, and the register destination are per-business; the P×I method and the ≥12 mitigation gate are the catalog's own protocol, kept as the skill's fixed method (threshold configurable)
includes_script: scripts/risk_matrix.py (Python, stdlib only — computes P×I, applies the mitigation gate, renders the matrix; tested 2026-07-06)
date_added: 2026-07-06
---

## Introduction

risk-assessment-matrix scores the risks attached to a gated decision on probability × impact (1–5 each), requires a mitigation plan for any risk scoring at or above the mitigation gate (catalog protocol: P×I ≥ 12) before the decision can PASS, and logs everything to the configured risk register. The arithmetic and gate logic live in `scripts/risk_matrix.py`; identifying the risks and judging the scores stays with the agent and operator.

Per playbook rule 0.6: P×I on 1–5 scales is a structured *rubric*, not formal risk theory — outputs are transparent and consistent, but should be flagged as rubric-based, not statistically grounded, until board's logical layer gets a real source.

## Purpose

Give board a consistent, auditable way to answer "how risky is this decision, and is that risk handled?" — the same scales, the same gate, every time. The point of the ≥12 gate is that high risks don't block decisions; *unmitigated* high risks do. A risk with a named owner and a credible mitigation plan passes; the same risk hand-waved does not.

## When to Use

Triggers: "risk score this," "risk assessment," "how risky is this," or automatically in board's gate sequence for decisions that survived constitution-enforcement and strategic-veto.

Not for: generating the failure scenarios themselves when the decision is large and assumptions are untested — that's `pre-mortem`'s job, and its output is this skill's best input. Not for enterprise risk management across the whole business (a future Risk-department concern); this scores the risks of *one decision under review*.

## Structure / Protocol

```
Collect risks for the decision (from pre-mortem output, the proposer, and board's own review)
  -> Score each: Probability 1–5 × Impact 1–5 (anchored scales below, never invented data)
    -> Run scripts/risk_matrix.py: compute P×I, apply the mitigation gate (default ≥12)
      -> For each gated risk: require mitigation plan + owner before PASS
        -> Rule: PASS / PASS WITH MITIGATIONS / HOLD (gated risk unmitigated)
          -> Log all risks + ruling to the configured risk register
```

## Scoring Anchors

Both scales 1–5, anchored so two reviewers read a "4" the same way:

**Probability** — 1: remote (<5%) · 2: unlikely (~5–20%) · 3: possible (~20–50%) · 4: likely (~50–80%) · 5: near-certain (>80%), over the decision's own horizon.

**Impact** — 1: negligible (absorbed without plan changes) · 2: minor (annoying, contained) · 3: material (misses a KR or meaningful money) · 4: severe (threatens the quarter/venture) · 5: existential (threatens the business or a constitutional interest).

Scores come from the operator's/proposer's knowledge and available evidence. Where a score is a pure guess, say so — a guessed 3 presented as known is fabrication (rule 0.5).

## Instructions

1. **Collect risks.** Pull from: pre-mortem output if one ran (its CRITICAL items enter here automatically), the proposer's own risk list, and board's review. Each risk is one sentence, specific, falsifiable — "key-person dependency on the sole developer," not "execution risk."
2. **Score.** Assign P and I per the anchors, with a one-line basis each. Flag guessed scores explicitly.
3. **Compute.** Build the input JSON per the schema in `scripts/risk_matrix.py` and run:

```bash
python scripts/risk_matrix.py <input.json>              # markdown matrix
python scripts/risk_matrix.py <input.json> --format json
```

The script computes P×I per risk, marks risks at/above the mitigation gate (default 12, configurable via the input — changing it is an operator decision), and sorts descending.

4. **Mitigate gated risks.** Every risk at/above the gate needs, before the decision can PASS: a **mitigation plan** (prevention and/or response), a **named owner**, and a **review date**. The catalog's "mitigate top 2" is the floor for large risk sets; the standing rule is *all* gated risks get plans.
5. **Rule.**
   - No gated risks → **PASS**.
   - Gated risks, all carrying credible plans + owners → **PASS WITH MITIGATIONS** (plans logged, owners accountable).
   - Any gated risk without a plan/owner → **HOLD** — the decision waits, and the missing plan is named. HOLD is not REJECT; it converts to PASS WITH MITIGATIONS the moment the plan exists.
6. **Log.** All scored risks (not just gated ones), the ruling, plans, and owners go to the configured risk register (`risk_register_destination` in board's config; the operator directly until set). Low scores logged today are the early-warning baseline for tomorrow.

## Output Format

```
## Risk Assessment: [decision, one line]

**Mitigation gate:** P×I ≥ [N]

| Risk | P | I | P×I | Gated | Basis | Mitigation / Owner / Review date |
|---|---|---|---|---|---|---|
[from script output, descending]

### Ruling: PASS / PASS WITH MITIGATIONS / HOLD
[If HOLD: which gated risk lacks a plan or owner. If guessed scores exist, named here.]

### Logged
[Register destination; note any risks carried from pre-mortem]
```

## Principles

- **Unmitigated ≥gate blocks; mitigated ≥gate doesn't.** The gate forces plans, not timidity.
- **Anchored scales, every time.** Scores without the anchors are vibes with digits.
- **Guessed scores are labeled.** A guess can still be scored — hiding that it's a guess is the violation.
- **Specific risks only.** "Market risk" is not a row; "the anchor customer's contract lapses in Q3" is.
- **Every gated risk gets an owner and a review date.** A mitigation plan nobody owns is a wish.
- **Rubric, not statistics.** Outputs are flagged rubric-based per rule 0.6 until a real risk-theory source fills board's logical layer.
- **Log everything, including the small stuff.** Today's 4 (2×2) is tomorrow's baseline.

## Fallback

- No risks identified for a major decision → that itself is a finding; run `pre-mortem` before scoring rather than passing on an empty matrix.
- Scores disputed between proposer and board → present both scorings side by side and escalate to the operator; don't average silently.
- Python unavailable → compute P×I manually with the same anchors and gate; flag the run as not script-computed.
- Risk register destination unset → deliver the log to the operator directly and say so.

## Boundaries with Other board Skills

- Runs **after** constitution-enforcement and strategic-veto (categorical and strategy conflicts moot the risk question) and typically after fiduciary-guard (failed arithmetic doesn't need a risk workshop).
- `pre-mortem` generates failure scenarios; this skill scores and gates them. For major commitments, run pre-mortem first — its CRITICAL items are this matrix's input rows. For routine decisions, this skill alone suffices.
- Boundary with marcus: decision-critic ranks concerns by impact × likelihood × cheapness-to-fix to *improve* a plan pre-submission; this skill scores P×I to *gate* it at review. Same family of arithmetic, different authority and moment.
- The risk register is this skill's output destination and the future Risk-department's input — when that department exists, the register handoff is formalized there, not here.
