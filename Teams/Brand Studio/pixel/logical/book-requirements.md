---
name: pixel-logical-book-requirements
type: logical
status: built — inherits from Shared OS (2026-07-15)
assigned_agent: pixel (Brand Studio / Production)
date_added: 2026-07-07
date_filled: 2026-07-15
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Pixel inherits the department-shared `marketing_laws.py`. All dedicated scripts are paywall-blocked pending Route D .md files. This file is the only file in this folder.

## Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `marketing_laws.py` | Ries & Trout, *The 22 Immutable Laws of Marketing* (1993) | [archive.org](https://archive.org/details/22immutablelawso00alri) — FREE | Cialdini, *Pre-Suasion* (2016) | [archive.org](https://archive.org/details/presuasionrevolu0000cial) — FREE | B |

Additional free sources: Pareto (1896), Marshall (1890), Bernays (1928), Campbell (1949), Zipf (1949), Lasswell (1948), Hick (1952), Zajonc (1968), Von Restorff (1933). 10 free books/papers total.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Pixel Needs It |
|--------|------------|----------|---------------------|
| `marketing_laws.py` | Ries & Trout + Cialdini + 8 free sources | See above | Grounds visual QA judgments — "recognizably similar" detection, series consistency, and off-palette closeness — with distinctiveness and perception laws |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| "recognizably similar" generations — eyeball call, no distance measure | ✅ Cleared | `marketing_laws.py` — `von_restorff_effect` (distinctiveness: items that are too similar fail the isolation test), `law_of_perception` (perceptual difference is what matters) |
| series consistency — judgment-based, no formal measure | ✅ Cleared | `marketing_laws.py` — `mere_exposure_effect` (consistent exposure builds preference; inconsistency breaks the effect) |
| off-palette closeness — eyeballed color judgments | ✅ Cleared | `marketing_laws.py` — `von_restorff_effect` (off-palette elements must be distinctive enough to register), `law_of_focus` (visual consistency = owning a visual word) |

## Skills to Script Mapping

- **asset-pipeline** — imports `marketing_laws.py` (`von_restorff_effect` for distinctiveness QA threshold, `mere_exposure_effect` for series consistency rationale)
- **prompt-craft** — imports `marketing_laws.py` (`law_of_focus` for single-subject prompts, `von_restorff_effect` for visual distinctiveness in generation parameters)

## Still Pending

| Script | Blocked By | Source Needed |
|--------|-----------|---------------|
| Dedicated color science script (CIELAB/Delta-E) | Paywalled book | Color science text — shared domain with atlas; one source serves both for computable off-palette thresholds |
| Dedicated photography/cinematography script | Paywalled book | Rigorous lighting/composition text with testable vocabulary for style-constant precision |

These require Route D .md files from paywalled sources before extraction can proceed.
