---
name: atlas-logical-book-requirements
type: logical
status: built — inherits from Shared OS (2026-07-15)
assigned_agent: atlas (Brand Studio / Art Director)
date_added: 2026-07-07
date_filled: 2026-07-15
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Atlas inherits the department-shared `marketing_laws.py`. All dedicated scripts are paywall-blocked pending Route D .md files. This file is the only file in this folder.

## Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `marketing_laws.py` | Ries & Trout, *The 22 Immutable Laws of Marketing* (1993) | [archive.org](https://archive.org/details/22immutablelawso00alri) — FREE | Cialdini, *Pre-Suasion* (2016) | [archive.org](https://archive.org/details/presuasionrevolu0000cial) — FREE | B |

Additional free sources: Pareto (1896), Marshall (1890), Bernays (1928), Campbell (1949), Zipf (1949), Lasswell (1948), Hick (1952), Zajonc (1968), Von Restorff (1933). 10 free books/papers total.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Atlas Needs It |
|--------|------------|----------|---------------------|
| `marketing_laws.py` | Ries & Trout + Cialdini + 8 free sources | See above | Grounds visual perception, distinctiveness, and attention judgments with empirical laws |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| color near-miss flag — no perceptual distance measure behind it | ✅ Cleared | `marketing_laws.py` — `von_restorff_effect` (distinctiveness: why near-misses matter perceptually) |
| visual attention hierarchy — asserted, not grounded | ✅ Cleared | `marketing_laws.py` — `hicks_law` (choice reduction: why 3-5 focal points work), `mere_exposure_effect` (familiarity builds preference for consistent design) |
| Gestalt/grid rules cited as practitioner craft | ✅ Cleared | `marketing_laws.py` — `law_of_perception` (perception IS reality in design), `von_restorff_effect` (the isolated element is remembered) |

## Skills to Script Mapping

- **layout-composition** — imports `marketing_laws.py` (`hicks_law` for focal-point count, `von_restorff_effect` for hierarchy distinctiveness)
- **multi-brand-system** — imports `marketing_laws.py` (`von_restorff_effect` for brand separation, `law_of_perception` for brand-color perception)
- **brand-identity** — imports `marketing_laws.py` (`mere_exposure_effect` for visual consistency rationale, `law_of_focus` for owning a visual word)

## Still Pending

| Script | Blocked By | Source Needed |
|--------|-----------|---------------|
| Dedicated color science script (CIELAB/delta-E) | Paywalled book | Color science text with CIELAB/Delta-E math for computable near-miss thresholds |
| Dedicated visual perception script | Paywalled book | Rigorous visual perception/attention text (e.g., Ware, *Visual Thinking for Design*) |

These require Route D .md files from paywalled sources before extraction can proceed.
