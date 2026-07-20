---
name: precedent-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-14)
assigned_agent: precedent (Governance / Institutional Memory)
date_added: 2026-07-07
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5) that precedent imports. Precedent owns 1 dedicated script for case-based reasoning and inherits cross-agent scripts. This file is the only file in this folder.

## Precedent-Specific Scripts (Shared OS/logical/)

| # | Script | Source | Route | Domain |
|---|--------|--------|-------|--------|
| 1 | `case_law_method.py` | Holmes, Oliver Wendell Jr., *The Common Law* (1881, public domain, Project Gutenberg EBook #2449) | B | Case similarity scoring (5 dimensions), ratio decidendi extraction, materiality gates (3 levels), consistency checking, distinguish-vs-overrule decision framework |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Why Precedent Needs It |
|--------|-------------------|
| `decision_analysis.py` | Expected value and decision trees for evaluating ruling consequences |
| `planning_fallacy.py` | Calibration for probability estimates in consistency checks |
| `signal_detection.py` | Statistical significance for trend-based pattern detection in rulings |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Stare decisis adaptation: no citable foundation | ✅ Cleared | `case_law_method.py` (Holmes, Lectures I & III — analogical reasoning, materiality, distinguish/overrule) |
| Retrieval: "top 3 similar" is tag/text match with no principled measure | ✅ Cleared | `case_law_method.py` (case_similarity 5-dimension scoring, rank_similar_cases) |
| Materiality testing: stated but not theorized | ✅ Cleared | `case_law_method.py` (materiality_test 3-gate framework) |
| Consistency checking: distinguish vs overrule is first-principles | ✅ Cleared | `case_law_method.py` (consistency_check + distinguish_or_overrule) |

## Skills → Script Mapping

- **case-law-method** → imports `case_law_method.py` (extract_ratio, materiality_test, distinguish_or_overrule)
- **ruling-log** → imports `case_law_method.py` (rank_similar_cases for retrieval upgrade)
- **consistency-check** → imports `case_law_method.py` (consistency_check) + `signal_detection.py` (pattern detection)
