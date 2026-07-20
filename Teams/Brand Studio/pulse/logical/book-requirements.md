---
name: pulse-logical-book-requirements
type: logical
status: built — inherits from Shared OS (2026-07-15)
assigned_agent: pulse (Brand Studio / Social Media)
date_added: 2026-07-07
date_filled: 2026-07-15
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5). Pulse inherits the department-shared `marketing_laws.py`. All dedicated scripts are paywall-blocked pending Route D .md files. This file is the only file in this folder.

## Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `marketing_laws.py` | Ries & Trout, *The 22 Immutable Laws of Marketing* (1993) | [archive.org](https://archive.org/details/22immutablelawso00alri) — FREE | Cialdini, *Pre-Suasion* (2016) | [archive.org](https://archive.org/details/presuasionrevolu0000cial) — FREE | B |

Additional free sources: Pareto (1896), Marshall (1890), Bernays (1928), Campbell (1949), Zipf (1949), Lasswell (1948), Hick (1952), Zajonc (1968), Von Restorff (1933). 10 free books/papers total.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Pulse Needs It |
|--------|------------|----------|---------------------|
| `marketing_laws.py` | Ries & Trout + Cialdini + 8 free sources | See above | Grounds virality/shareability predictions with Cialdini's social proof, Zipf's distribution laws, and the mere exposure effect for posting cadence |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| virality/shareability predictions — craft heuristics, no grounded framework | ✅ Cleared | `marketing_laws.py` — `cialdini_social_proof` (sharing is social behavior: people share what peers share), `cialdini_reciprocity` (content that gives value first gets shared), `zipf_law` (content consumption follows Zipf: the head dominates) |
| hook psychology — practitioner craft without empirical grounding | ✅ Cleared | `marketing_laws.py` — `von_restorff_effect` (distinctive hooks are remembered 2-3x more), `lasswell_model` (every post is a Lasswell communication: who says what to whom with what effect) |
| posting cadence and consistency judgments | ✅ Cleared | `marketing_laws.py` — `mere_exposure_effect` (optimal 10-20 exposures with 1-2 week spacing; plateau after ~20), `hicks_law` (3-5 options per post for optimal engagement) |

## Skills to Script Mapping

- **social-content** — imports `marketing_laws.py` (`cialdini_social_proof` for share mechanics, `lasswell_model` for post structure, `von_restorff_effect` for hook distinctiveness)
- **content-calendar** — imports `marketing_laws.py` (`mere_exposure_effect` for posting cadence, `zipf_law` for topic distribution, `pareto_principle` for content-type prioritization)

## Still Pending

| Script | Blocked By | Source Needed |
|--------|-----------|---------------|
| Dedicated Berger STEPPS extraction | Paywalled book | Berger, *Contagious* — THE pulse book (Social currency, Triggers, Emotion, Public, Practical value, Stories). Shared with lena; content-idea filter lands here. |
| Dedicated Eyal Hooked extraction | Paywalled book | Eyal, *Hooked* (trigger-action-reward-investment loop for engagement series design) |
| Dedicated Heath SUCCESs extraction | Paywalled book | Heath & Heath, *Made to Stick* — memorability half applies to every post. Shared with lena. |

These require Route D .md files from paywalled sources before extraction can proceed. Shares the system's highest-priority gap with lena (the attraction half of the humanic-content strategy).
