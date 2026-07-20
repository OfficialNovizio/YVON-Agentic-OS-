---
name: governance-department-workflow
type: department workflow file (playbook §10)
department: Governance
status: built 2026-07-07, after all 3 agents completed (board, precedent, sentinel)
agents: board (Governance Gate, leader) · precedent (Institutional Memory) · sentinel (Compliance Monitor)
---

## Summary

Governance is the department that makes the business's rules real: **board** rules on decisions brought to the gate (constitution, locked strategy, spend thresholds, risk), **precedent** makes those rulings durable and binding-by-default (record, retrieve, apply-or-distinguish, no silent inconsistency), and **sentinel** covers everything that never asked for review (output sweeps, gate-bypass audits, the audit trails it all runs on). Board is the leader and carries the department identity (principled-gatekeeper). The department's authority is entirely derivative — it enforces only documents the operator wrote and thresholds the operator set; final calls always sit with the operator.

## Purpose

Solve the three ways governance fails in practice: rules enforced only when convenient (board's gate with non-negotiable constitutional rulings and cited everything), rulings that don't bind the future (precedent's distinguish-or-overrule discipline), and gates that measure only what walks through them (sentinel's coverage guarantee). Works at any scale — a small Canadian business sets a $1K gate and a 3-article constitution; a funded venture sets $50K and stricter floors. Same skills, different config.

## Working Structure

```
                                 OPERATOR
        (writes the constitution & commitments; sets thresholds; makes final calls;
                    holds the stop button; amends what board enforces)
                                    ↑
     ┌──────────────────────────────┼──────────────────────────────┐
     |                              |                              |
   BOARD  (leader)              PRECEDENT                      SENTINEL
   the gate                     the memory                     the watch
   constitution-enforcement     ruling-log                     audit-trail-design
   → strategic-veto             case-law-method                constitution-watch
   → fiduciary-guard            consistency-check              gate-bypass-detection
   → pre-mortem
   → risk-assessment-matrix
     |         ↑                    ↑    |                        |     |
     |         └── top-3 precedents ┘    └── captures rulings ────┘     |
     |              before ruling         (one shared decision log)    |
     └── escalations from sentinel (violations, bypasses) ←────────────┘
```

## Working Tree (who consumes whom)

- **precedent wraps board**: retrieval + apply/distinguish run before board rules; consistency-check tests the proposed ruling; capture records the final one (including operator overrules). One shared decision log — board-config's `decision_log_destination` is the single source of truth; precedent and sentinel point to it, never fork it.
- **sentinel feeds board**: VIOLATION classifications and BYPASS/PARTIAL findings escalate for formal rulings (constitution-enforcement / retroactive full gate). Sentinel detects; board rules; the operator remediates.
- **sentinel's trails carry everyone**: audit-trail-design's practices (append-only, who/what/when/basis, integrity checks) govern precedent's log hygiene and both watchers' events.
- **Cross-department**: marcus improves proposals before submission (decision-critic) and owns the strategy process that sets locked commitments (with the operator); board enforces, never amends. Vista's flagged roadmap decisions and echo's commitments enter the gate like any decision when they qualify. Bypass-pattern process fixes route to the configured process owner (a future Ops agent; operator until then).

## Working Instructions

1. **Documents first.** Nothing in this department works until the operator writes the constitution (template: board/custom/constitution-enforcement/assets/) and locked commitments (template: board/custom/strategic-veto/assets/) and fills board-config's thresholds. Unfilled = each skill stops-and-asks or degrades loudly; nothing is ever defaulted or inferred.
2. **A decision arrives at the gate.** Precedent surfaces the top-3 prior rulings (apply/distinguish made explicit). Board runs the sequence — constitution → veto → fiduciary (if spend) → pre-mortem (major/untested) → risk matrix — with early exits: VIOLATION and VETO end review immediately, each with its stated path (change the decision; amend via operator/marcus; re-scope).
3. **Before finalizing**, consistency-check tests the proposed ruling against precedent: conflicts are distinguished (material difference named) or overruled (justified, cross-marked, operator-flagged). Never silent.
4. **Every ruling is captured** in precedent's schema — rationale mandatory, tags grown not invented, operator overrules recorded as the most instructive entries. Append-only, corrections by reference.
5. **Continuously (per configured cadences)**, sentinel sweeps outputs (warn on near-boundary; freeze-recommend + escalate on violations — immediately, never batched) and scans executed actions for bypasses (retroactive review + root cause: criteria gap / friction / workaround → different fixes; patterns → process-fix proposals). Coverage is stated in every report; unsampled is never clear.
6. **Patterns go upward on a cadence**: repeated overrules of one article (amendment pressure), operator-vs-board splits, drift curves, repeat bypass routes — surfaced to the operator and marcus's strategy reviews. Governance surfaces; strategy decides.
7. **Rule 0.6 standing flag.** All three logical/ folders are placeholders (board: decision analysis + governance standards; precedent: legal reasoning/precedent doctrine + CBR; sentinel: audit sampling + statistical process control — the last shares ground with vista's statistics domain, coordinate the source choice). Until filled: P×I is a rubric, retrieval similarity is judgment, coverage claims are honest-but-informal — and every output says so. The tested scripts (fiduciary_check, risk_matrix) are computed but framework-level.

## Department Status

| Agent | Skills | Identity | Operational | Logical | agent.md |
|---|---|---|---|---|---|
| board | 5/5 (2 scripts tested, 2 templates) | principled-gatekeeper-charlie-munger (leader) | 5/5 | placeholder | current |
| precedent | 3/3 (case-law-method converted marketplace→custom, flagged) | intentionally empty | 5/5 | placeholder | current |
| sentinel | 3/3 (1 verbatim marketplace) | intentionally empty | 5/5 | placeholder | current |

Department complete as of 2026-07-07. Pending, named: the operator's constitution + locked commitments + config fill-ins (the department is structurally done but dormant until these exist); three logical source books; sweep automation (future 5.2 proposal); the shared OS-level skill layer.
