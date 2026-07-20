---
name: marcus-logical-book-requirements
type: logical
status: built — 5 books, 5 shared scripts (2026-07-14)
assigned_agent: marcus (Executive Office / Orchestrator)
date_added: 2026-07-02
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts — sourced from real books with citable formulas and self-tests — that marcus imports. All scripts live in `Shared OS/logical/` (playbook §13.5). This file records which books ground marcus's judgments and where the scripts live. It is the only file in this folder.

## Scripts Grounding Marcus

| # | Script (Shared OS/logical/) | Source Book | Route | Domain |
|---|---------------------------|-------------|-------|--------|
| 1 | `capital_budgeting.py` | Brealey, Myers & Allen, *Principles of Corporate Finance* (12th Ed., 2017, McGraw-Hill) | A | NPV, IRR, WACC, CAPM, DCF, capital structure, MM propositions, beta |
| 2 | `forecasting.py` | Hyndman & Athanasopoulos, *Forecasting: Principles and Practice* (3rd Ed., 2021, OTexts) | A/B | Time series, exponential smoothing, accuracy metrics, naive benchmarks |
| 3 | `decision_analysis.py` | Clemen & Reilly, *Making Hard Decisions with DecisionTools* (3rd Ed., 2012, Cengage) | A/B/C | Decision trees, MAUT, Monte Carlo, EVPI/EVSI, probability calibration |
| 4 | `competitive_strategy.py` | Porter, *Competitive Strategy* (1980, Free Press) | B | Five forces, generic strategies, competitor analysis, strategic groups |
| 5 | `planning_fallacy.py` | Kahneman, *Thinking, Fast and Slow* (2011, FSG) Ch.23-25 | B/C | Reference-class forecasting, Bayesian blend, premortem, overconfidence |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Venture financial projections (NPV, IRR, WACC) | ✅ Cleared | `capital_budgeting.py` |
| Venture cash flow forecasts | ✅ Cleared | `forecasting.py` |
| Venture ranking / decision scoring | ✅ Cleared | `decision_analysis.py` + `capital_budgeting.py` |
| Strategic fit / defensibility assessment | ✅ Cleared | `competitive_strategy.py` |
| Timeline/cost projections (planning fallacy) | ✅ Cleared | `planning_fallacy.py` |

## Skills → Script Mapping

- **venture-priority-matrix** → imports `capital_budgeting.py` (NPV/IRR/WACC), `competitive_strategy.py` (five forces), `decision_analysis.py` (MAUT scoring)
- **decision-critic** → imports `decision_analysis.py` (trees, EVPI), `planning_fallacy.py` (de-biasing)
- **okr-cascade** → imports `planning_fallacy.py` (commit vs stretch targets), `forecasting.py` (projection accuracy)
- **strategy-advisor** → imports `competitive_strategy.py` (full Porter framework)

## How to Use

Marcus's skills import from `Shared OS/logical/`. Example:
```python
# In venture-priority-matrix skill:
import sys; sys.path.insert(0, '../Shared OS/logical')
from capital_budgeting import npv, irr, wacc
from competitive_strategy import five_forces_summary
```
