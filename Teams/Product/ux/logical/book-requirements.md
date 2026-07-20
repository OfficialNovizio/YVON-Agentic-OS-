---
name: ux-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-15)
assigned_agent: ux (Product / UX Research)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). UX owns 1 dedicated script and inherits cross-agent scripts. This file is the only file in this folder.

## UX-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `ux_research_methods.py` | Nielsen & Landauer, *"A Mathematical Model of the Finding of Usability Problems"* (INTERCHI '93) | [ACM DL](https://dl.acm.org/doi/10.1145/169059.169166) — FREE | Brooke, *"SUS — A Quick and Dirty Usability Scale"* (1996) | [ahrq.gov](https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%2525.pdf) — FREE | A/C |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why UX Needs It |
|--------|------------|----------|-----------------|
| `signal_detection.py` | OpenStax, *Introductory Business Statistics 2e* (2023) | [openstax.org](https://openstax.org/details/books/introductory-business-statistics-2e) — FREE | Survey significance, sample-size math, CI |
| `experiment_methods.py` | Kohavi et al. + OpenStax | [experimentguide.com](https://experimentguide.com/) | Power analysis for usability benchmarking |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| default_usability_sample (~5/round) | ✅ Cleared | `ux_research_methods.py` (problem discovery curve: users_for_coverage, problem_discovery_recommendation) |
| synthesis confidence bands (strong/moderate/directional) | ✅ Cleared | `ux_research_methods.py` (SUS CI + benchmark comparison) |
| finding_staleness_horizon | ✅ Cleared | `signal_detection.py` (metric drift detection — staleness = drift signal) |

## Skills → Script Mapping

- **study-design** → imports `ux_research_methods.py` (users_for_coverage, problem_discovery_recommendation)
- **synthesis-discipline** → imports `ux_research_methods.py` (SUS scoring + CI, benchmark comparison) + `signal_detection.py` (significance)
- **research-repository** → imports `signal_detection.py` (staleness/freshness horizon via drift detection)
