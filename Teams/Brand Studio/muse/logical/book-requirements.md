---
name: muse-logical-book-requirements
type: logical
status: built — inherits from Shared OS (2026-07-15)
assigned_agent: muse (Brand Studio / Ideation)
date_added: 2026-07-07
date_filled: 2026-07-15
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Muse inherits the department-shared `marketing_laws.py`. All dedicated scripts are paywall-blocked pending Route D .md files. This file is the only file in this folder.

## Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `marketing_laws.py` | Ries & Trout, *The 22 Immutable Laws of Marketing* (1993) | [archive.org](https://archive.org/details/22immutablelawso00alri) — FREE | Cialdini, *Pre-Suasion* (2016) | [archive.org](https://archive.org/details/presuasionrevolu0000cial) — FREE | B |

Additional free sources: Pareto (1896), Marshall (1890), Bernays (1928), Campbell (1949), Zipf (1949), Lasswell (1948), Hick (1952), Zajonc (1968), Von Restorff (1933). 10 free books/papers total.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Muse Needs It |
|--------|------------|----------|---------------------|
| `marketing_laws.py` | Ries & Trout + Cialdini + 8 free sources | See above | Grounds NAF/ICE rubrics, novelty judgments, and deduplication with distinctiveness, positioning, and category laws |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| NAF/ICE rubrics — Novelty/Applicability/Feasibility scoring flagged as rubric-based | ✅ Cleared | `marketing_laws.py` — `von_restorff_effect` (measurable distinctiveness for Novelty anchor), `law_of_focus` (Applicability: does the idea own a word?), `law_of_the_category` (Feasibility: category creation vs variant) |
| deduplication "mechanism-level sameness" — judgment-based | ✅ Cleared | `marketing_laws.py` — `von_restorff_effect` (compute distinctiveness score between ideas), `law_of_perception` (are two ideas perceptually different?) |
| Divergence Guard triggers — rubric without measurable content | ✅ Cleared | `marketing_laws.py` — `law_of_the_category` (is this a new category or a variant?), `law_of_leadership` (first-in-category advantage test) |

## Skills to Script Mapping

- **idea-generation** — imports `marketing_laws.py` (`von_restorff_effect` for novelty scoring, `law_of_the_category` for category-creation ideas)
- **idea-evaluation** — imports `marketing_laws.py` (`law_of_perception` for deduplication, `law_of_focus` for positioning strength, `pareto_principle` for idea prioritization)

## Still Pending

| Script | Blocked By | Source Needed |
|--------|-----------|---------------|
| Dedicated creativity research extraction | Paywalled book | Creativity research text with measurable constructs (originality/usefulness measures, consensual assessment technique) |
| Dedicated Berger STEPPS extraction | Paywalled book | Berger, *Contagious* — concept-level spread filter (shared with lena's list; lands in lena's folder at extraction time) |

These require Route D .md files from paywalled sources before extraction can proceed.
