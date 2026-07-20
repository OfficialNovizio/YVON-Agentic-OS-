---
name: board-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: board (Governance / Governance Gate)
date_added: 2026-07-06
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5) that board imports. Board owns 1 dedicated script for governance-specific checks and inherits cross-agent scripts. This file is the only file in this folder.

## Board-Specific Scripts (Shared OS/logical/)

| # | Script | Source | Route | Domain |
|---|--------|--------|-------|--------|
| 1 | `governance_gate.py` | OECD, *G20/OECD Principles of Corporate Governance* (2023 Rev., CC BY 4.0, DOI 10.1787/ed750b30-en) | B | Board independence, fiduciary duty, conflict of interest, strategic veto, disclosure standards, sustainability oversight (Principle VI, new 2023) |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Why Board Needs It |
|--------|-------------------|
| `decision_analysis.py` | Expected value, decision trees, EVPI, Monte Carlo — formal decision analysis under uncertainty (board's #1 gap) |
| `planning_fallacy.py` | Probability calibration, overconfidence audit — turning "likely" into defensible numbers |
| `competitive_strategy.py` | Five forces context for strategic veto decisions |
| `capital_budgeting.py` | NPV/WACC for budget oversight and investment decisions |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Risk rulings: P×I rubric not statistically grounded | ✅ Cleared | `decision_analysis.py` (decision trees, EVPI, probability calibration) |
| Fiduciary checks: threshold arithmetic, not theory-grounded | ✅ Cleared | `governance_gate.py` (OECD VII.A-E fiduciary duty criteria) |
| Board independence: first-principles, not cited | ✅ Cleared | `governance_gate.py` (OECD VII.E board independence standards) |
| Strategic veto: no citable framework | ✅ Cleared | `governance_gate.py` (OECD VII.B strategic oversight) |
| Constitution enforcement: process design not sourced | ✅ Cleared | `governance_gate.py` (OECD V + VII disclosure & board responsibilities) |

## Skills → Script Mapping

- **risk-assessment-matrix** → imports `decision_analysis.py` (EVPI, decision trees, Monte Carlo)
- **fiduciary-guard** → imports `governance_gate.py` (fiduciary_duty_check, conflict_of_interest_screen)
- **constitution-enforcement** → imports `governance_gate.py` (disclosure_standards_check, strategic_veto_assessment)
- **strategic-veto** → imports `governance_gate.py` (strategic_veto_assessment) + `competitive_strategy.py`
- **pre-mortem** → imports `planning_fallacy.py` (premortem_checklist) + `decision_analysis.py` (decision trees)
