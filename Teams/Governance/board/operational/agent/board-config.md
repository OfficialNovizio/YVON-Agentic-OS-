---
name: board-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a real line in one of board's skill files.
assigned_agent: board (Governance / Governance Gate)
date_added: 2026-07-06
---

## Purpose

Machine-readable configuration for board. These are the per-business values its skills reference but must never hardcode or default — they embody the business's rules and risk appetite, so every one is operator-set.

## Config Template

```yaml
# --- Governing documents ---
constitution_path: <FILL_IN>          # the business's constitution file (start from
                                       # custom/constitution-enforcement/assets/constitution-template.md)
                                       # — constitution-enforcement Phase 1
locked_commitments_path: <FILL_IN>    # the locked strategic commitments file (start from
                                       # custom/strategic-veto/assets/locked-commitments-template.md)
                                       # — strategic-veto Phase 1

# --- Fiduciary thresholds (fiduciary-guard Phase 1; catalog's $5K/6mo/1.5x are
#     illustrations only, never defaults) ---
spend_approval_gate: <FILL_IN>        # spend at/above this (annualized basis) requires full review
runway_floor_months: <FILL_IN>        # post-spend runway must stay at/above this
roi_minimum: <FILL_IN>                # expected return ÷ cost must meet this
board_escalation_multiple: <FILL_IN>  # optional: spends above (multiple × gate) escalate to the
                                       # operator regardless of check results — fiduciary-guard Phase 5

# --- Risk (risk-assessment-matrix) ---
mitigation_gate: <FILL_IN>            # P×I at/above this requires mitigation plan + owner;
                                       # skill/script default is 12 (catalog protocol) until set
risk_register_destination: <FILL_IN>  # where scored risks + rulings are recorded — Phase 6

# --- Logging & data ---
decision_log_destination: <FILL_IN>   # where all gate rulings, vetoes, appeals, and operator
                                       # overrules are recorded — referenced by every skill;
                                       # future input to the precedent agent (Institutional Memory)
financials_source: <FILL_IN>          # where cash-on-hand / monthly burn come from —
                                       # fiduciary-guard Phase 2; never estimated by board
```

## Instructions

1. Until `constitution_path` / `locked_commitments_path` are set (and the files written by the operator), constitution-enforcement and strategic-veto stop at Phase 1 and offer their templates — board has no enforcement or veto power it wasn't given in writing.
2. Until the three fiduciary thresholds are set, fiduciary-guard stops and asks — it never defaults them.
3. Until `mitigation_gate` is set, risk-assessment-matrix uses the catalog protocol value (12) built into the skill.
4. Until log/register destinations are set, rulings go to the operator directly, stated explicitly in each output.
5. Add fields only when a skill actually references them.

## Fallback

An unfilled config never silently blocks or silently passes anything: each skill's own documented fallback (stop-and-ask, or deliver-to-operator) applies.
