<!--
Logical layer: touch-1 placeholder per §8.1.

Per §8.1: "leave a placeholder. Once an agent's skills, identity, and operational layer
are done, write one logical/book-requirements.md recording the specific 0.6-flagged
judgments this agent makes, what kind of book/source would ground each, and why. Don't
build the real logical artifacts early — you can't ground judgments the skills haven't
defined yet."

Per §8.7: this is the ONLY .md file that belongs in an agent's logical/ folder.
All actual .py scripts, when built, will live in Shared OS/logical/ per §13.5 —
not in this agent's folder.

Per §8.11: this file includes the 5 required tables (Scripts / Inherited / Skills →
Script Mapping / Flag Clearance / Still Pending).

maslow's 2 local Python utilities (wellbeing_monitor.py + recognition_program.py) are
NOT Shared OS logical scripts yet — see §5 Still Pending §3 and §4 for graduation paths.
-->

# maslow — Logical Layer: book-requirements (Touch-1 Placeholder)

## Purpose

Records the §0.6-flagged judgments maslow's 4 skills make today, describes what book /
source type would ground each, and lists candidate authenticated sources per §8.8 for a
future Touch-2 build. **No real logical scripts have been built for maslow yet.** Every
judgment below is currently flagged reasoning-based (or Tier-B book-cited where a
canonical source has been identified). Touch-2 runs when books are placed in
`Agents/_books/`.

Cross-agent note: several candidate books here overlap with hire's
`logical/book-requirements.md` (Schmidt & Hunter, Bock 2015 — inherited coordination via
§8.9 "extract once, use twice"). This file's tables call out which books are shared
with which sibling agent.

---

## Scripts Table (built for maslow in Shared OS/logical/)

Per §8.11 required table shape:

| Script filename | Source book(s) | Book URL(s) | Route |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** No Shared OS/logical/ scripts have been built for maslow yet.
Touch-2 will populate this table.

---

## Inherited Scripts Table (from Shared OS/logical/)

Per §8.11:

| Script filename | Source book(s) | Book URL(s) | Why maslow needs it |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** No relevant Shared OS/logical/ scripts exist yet for maslow to
inherit.

---

## Skills → Script Mapping

Per §8.11: each of maslow's skills and which Shared OS/logical/ scripts / .md assets it
imports today, with a one-line rationale per import.

| Skill | Shared OS/logical/ scripts imported today | Rationale |
|---|---|---|
| self-determination-theory | _(none)_ | Awaiting `Shared OS/logical/sdt_diagnostic.md` (Route D asset per §8.9) — see Still Pending §1 below. |
| motivation-map | _(none)_ | Awaiting `Shared OS/logical/motivation_pulse.py` (Route B for threshold rules) — see Still Pending §2. |
| wellbeing-monitoring | _(none)_ | Uses its OWN local utility (`custom/wellbeing-monitoring/scripts/wellbeing_monitor.py`), NOT a Shared OS logical script. Graduates to Shared OS/logical/ once book-grounded — see Still Pending §3. |
| recognition-program | _(none)_ | Uses its OWN local utility (`custom/recognition-program/scripts/recognition_program.py`), NOT a Shared OS logical script. Graduates to Shared OS/logical/ once book-grounded — see Still Pending §4. |

**Current count: 0 imports.** maslow's skills currently rely on prose reasoning grounded
in cited-but-Tier-B sources plus 2 local script utilities.

---

## Flag Clearance Summary

Per §8.11: which §0.6-flagged judgments each script cleared.

| §0.6-flagged judgment | Clearing script | Tier before | Tier after | Cleared? |
|---|---|---|---|---|
| _(no flags cleared yet)_ | — | — | — | ❌ |

**Cleared: 0 of 11 flags.** See Still Pending below.

---

## Still Pending

The 11 §0.6-flagged judgments across maslow's 4 skills that need book-grounding. Grouped
by the future Shared OS asset that would ground each, with candidate authenticated book
sources (§8.8 compliant — named authors with verifiable credentials; §8.0 minimum two
books per script) and current fidelity tier per §8.4.

### §1. `Shared OS/logical/sdt_diagnostic.md` — Route D cited rubric (would ground `self-determination-theory`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 1 | SDT 3-need framework (autonomy / competence / relatedness) as the diagnostic axis | SDT § Structure / Protocol; § Instructions Phase 1 | Tier B (Ryan & Deci 2000 + Deci Olafsen Ryan 2017 cited; canonical but not page-cited from `Agents/_books/`) |
| 2 | Autonomous-vs-controlled motivation continuum (intrinsic / identified / introjected / external regulation) as the second diagnostic axis | SDT § Instructions Phase 2 | Tier B (Gagné & Deci 2005 cited; same caveat) |
| 3 | Overjustification-effect rule — external rewards for intrinsically-motivated work reduce intrinsic motivation | SDT § Instructions Phase 4; § Principles rule 4 | Tier B (foundational SDT finding from the 1980s cited via Ryan & Deci 2000) |

**Candidate authenticated sources per §8.0 (minimum two) + §8.8:**

- **Deci, E. L. & Ryan, R. M. (1985).** *Intrinsic Motivation and Self-Determination in Human Behavior.* Plenum Press. — Foundational SDT text. Deci (Rochester emeritus), Ryan (Australian Catholic Univ / Rochester emeritus). Book behind paywall but held in most university libraries.
  - URL: publisher not directly available; ISBN 978-0306420221. PAYWALL — needs placement in `Agents/_books/`.
- **Ryan, R. M. & Deci, E. L. (2000).** *Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being.* American Psychologist, 55(1), 68–78. — Widely cited paper; often FREE at .edu URLs.
  - URL for §8.8a 3-attempt search: search "Ryan Deci 2000 American Psychologist site:edu OR archive.org" — commonly hosted.
- **Deci, E. L., Olafsen, A. H., & Ryan, R. M. (2017).** *Self-Determination Theory in Work Organizations: The State of a Science.* Annual Review of Organizational Psychology and Organizational Behavior, 4, 19–43. — **FREE** at Corporate Research Forum host.
  - URL: https://www.crforum.co.uk/wp-content/uploads/2025/02/Deci-Olafsen-Ryan-Self-determination-Theory-in-Work-Organizations-The-State-of-a-Science.pdf — FREE.
- **Gagné, M. & Deci, E. L. (2005).** *Self-Determination Theory and Work Motivation.* Journal of Organizational Behavior, 26, 331–362. — **FREE** at selfdeterminationtheory.org.
  - URL: https://selfdeterminationtheory.org/SDT/documents/2005_GagneDeci_JOB_SDTtheory.pdf — FREE.

**Route:** Route D (cited rubric, §8.2 litmus — "given the same input, would two careful
people using this chapter produce the same output?" → SDT diagnosis is judgment even with
the framework, so it stays D). Produces a `.md` asset per §8.9 practitioner-operator rules
extended to academic-cited-rubric use, not a `.py` script.

**Cross-agent reuse:** would also inform maslow's `motivation-map` and — potentially —
`merit`'s future performance-management skills (autonomous-vs-controlled motivation
predicts perf-cycle outcomes).

**Path to Touch-2 build:** the two FREE sources (Deci Olafsen Ryan 2017 + Gagné & Deci
2005) already meet the §8.0 two-book minimum. This asset can be built with only free
sources verified via §8.8a 3-attempt search — no paywall book placement strictly
required. Highest-priority Touch-2 candidate for maslow.

---

### §2. `Shared OS/logical/motivation_pulse.py` — Route B (would ground `motivation-map` threshold rules)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 4 | SDT-need score bands (4.0+ satisfied / 3.0–4.0 stable / 2.5–3.0 attention / <2.5 starved) | motivation-map § Instructions Phase 4; § Principles rule 7 | Tier C reasoning-based (heuristic design choice; no book-cited formula) |
| 5 | Trend delta thresholds (±0.3 for rising/declining) | motivation-map § Instructions Phase 4 | Tier C reasoning-based (heuristic design choice) |
| 6 | Response-rate alert threshold (~40%) | motivation-map § Fallback rule 1 | Tier B (Udext vendor guidance cited but not book-grounded per §8.8) |
| 7 | Minimum-viable-action rule | motivation-map § Principles rule 5; wellbeing-monitoring § Instructions Step 7 | Tier B (Udext vendor guidance) |

**Candidate authenticated sources per §8.0 (minimum two) + §8.8:**

- **Deci, Olafsen, & Ryan (2017)** — same as §1 above; FREE. Grounds the SDT-need scoring
  framework even if not the specific threshold numbers.
- **Gagné & Deci (2005)** — same as §1; FREE.
- **Ricci, L. et al. (2020).** *Longitudinal effects of pulse-survey feedback on engagement.*
  Peer-reviewed HR-analytics literature (candidate placeholder — specific study to be
  identified in Touch-2 research phase).
- Note: response-rate and trend-delta specific thresholds may not be book-cited even after
  the pair is placed — those may remain Tier C heuristic and be marked as such in the
  script docstring per §8.4 (Tier C: genuine judgment, no source — stays reasoning-based,
  explicitly).

**Route:** Route B (rule-engine script — threshold-based classification of scores and
trend deltas). Simple rules; no math beyond arithmetic.

**Cross-agent reuse:** limited — maslow-specific pulse-scoring logic.

---

### §3. `Shared OS/logical/wellbeing_monitor.py` — Route A + B (would promote maslow's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 8 | eNPS scoring formula (%promoters − %detractors) | wellbeing-monitoring § Instructions Step 2; scripts/wellbeing_monitor.py | Tier B (standard Reichheld / Bain NPS methodology, but adaptation to eNPS is via AIHR / Gallup / Udext vendor sources) |
| 9 | Minimum-group-size suppression threshold (typically 5-8) | wellbeing-monitoring § Instructions Step 4; shared with recognition-program | Tier C reasoning-based (HR privacy convention; typical range cited but no book-cited standard) |
| 10 | Burnout risk flag rules (RED/AMBER/GREEN combination rule over sentiment trend + workload signals) | wellbeing-monitoring § Instructions Step 5; scripts/wellbeing_monitor.py | Tier B (source SKILL.md's rule; cited to Spring Health / NCBI / ISO 45003 mix) |

**Candidate authenticated sources per §8.0 (minimum two) + §8.8:**

- **Maslach, C. & Leiter, M. P. (2016).** *The Burnout Challenge.* Harvard University Press. — Christina Maslach (UC Berkeley psychology emerita), Michael Leiter (Acadia University). Foundational burnout research authors — the Maslach Burnout Inventory (MBI) is the field standard.
  - URL: https://www.hup.harvard.edu/catalog.php?isbn=9780674251014 (publisher); PAYWALL — needs placement in `Agents/_books/`.
- **Maslach, C. & Leiter, M. P. (1997).** *The Truth About Burnout: How Organizations Cause Personal Stress and What to Do About It.* Jossey-Bass. — Earlier edition; same authors.
  - URL: publisher not directly linkable; ISBN 978-0787908638. PAYWALL — accessible via university libraries.
- **ISO 45003:2021** — Occupational health and safety management: psychosocial risks. Institutional standard per §8.8; counts as one source per §8.0.
  - URL: https://www.iso.org/standard/64283.html (institutional; standard-purchase model). PAYWALL for the full text; abstract free.
- **Reichheld, F. F. (2006).** *The Ultimate Question: Driving Good Profits and True Growth.* Harvard Business School Press. — Founder of NPS methodology (which eNPS adapts).
  - URL: publisher page; PAYWALL — needs placement in `Agents/_books/`.

**Route:** Route A (eNPS arithmetic) + Route B (min-group-size boolean check; burnout
flag rule engine). Local utility already implemented per §5.2; graduates to
`Shared OS/logical/wellbeing_monitor.py` with book-grounded docstrings.

**Cross-agent reuse:** the min-group-size suppression function is shared with
`recognition-program` (script) and future `Shared OS: people-analytics-metrics` (planned
per §13.6). Consolidating it in Shared OS/logical/ is the natural §13.5 promotion path.

---

### §4. `Shared OS/logical/recognition_program.py` — Route A + B (would promote maslow's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 11 | Fast-pathway timing target (~48 hours) + timeliness status classification | recognition-program § Instructions Step 4; scripts/recognition_program.py; § Principles rule 1 | Tier B (Gallup research on ~24hr / 3x impact cited; the 48hr target is derived operational threshold, not book-cited) |
| — (data point, not flag) | Peer-to-peer satisfaction uplift ~35% | recognition-program § Instructions Step 2; § Principles rule 2 | Tier B (Achievers vendor research; noted here as data point, not a §0.6 flag requiring script clearance) |

**Candidate authenticated sources per §8.0 (minimum two) + §8.8:**

- **Milkovich, G. T., Newman, J. M., & Gerhart, B. (multiple editions).** *Compensation.* McGraw-Hill. — Standard graduate compensation and total-rewards textbook. George Milkovich (Cornell), Jerry Newman (SUNY Buffalo). Named academic authors.
  - URL: https://www.mheducation.com/highered/product/compensation-milkovich-newman/M9781260565744.html (publisher); PAYWALL — needs placement in `Agents/_books/`.
- **WorldatWork — Total Rewards Handbook.** Institutional source (WorldatWork is the professional association for total-rewards practitioners); counts as one source per §8.0.
  - URL: https://www.worldatwork.org/ (institutional); PAYWALL for full text.
- **Zingheim, P. K. & Schuster, J. R. (2007).** *Pay People Right! Breakthrough Reward Strategies to Create Great Companies.* Jossey-Bass. — Named practitioner-authors. Alternative pairing candidate.
- **Reichheld (2006)** — same as §3 above; grounds NPS methodology.

**Route:** Route A (rate arithmetic — participation, per-capita) + Route B (tier lookup;
timeliness classification). Local utility already implemented per §5.2; graduates to
`Shared OS/logical/recognition_program.py` with book-grounded docstrings.

**Cross-agent reuse:** shares min-group-size suppression with §3; that function
consolidates when both scripts graduate to Shared OS.

---

## Book Sourcing Plan Summary

Per §8.11 litmus ("Can the operator click one link and see the actual book page?"):

| Book | Free? | URL | Blocking asset |
|---|---|---|---|
| Deci & Ryan (1985), *Intrinsic Motivation and Self-Determination in Human Behavior* | PAYWALL | ISBN 978-0306420221 (Plenum; often via university libraries) | `sdt_diagnostic.md` (nice-to-have; the 2 free papers already meet §8.0 minimum) |
| Ryan & Deci (2000), *American Psychologist* paper | Likely FREE (widely mirrored on .edu) | Requires §8.8a 3-attempt search to confirm | `sdt_diagnostic.md` |
| Deci, Olafsen, & Ryan (2017), *Annual Review* paper | **FREE** | https://www.crforum.co.uk/wp-content/uploads/2025/02/Deci-Olafsen-Ryan-Self-determination-Theory-in-Work-Organizations-The-State-of-a-Science.pdf | `sdt_diagnostic.md`, `motivation_pulse.py` |
| Gagné & Deci (2005), *JOB* paper | **FREE** | https://selfdeterminationtheory.org/SDT/documents/2005_GagneDeci_JOB_SDTtheory.pdf | `sdt_diagnostic.md`, `motivation_pulse.py` |
| Maslach & Leiter (2016), *The Burnout Challenge* | PAYWALL | https://www.hup.harvard.edu/catalog.php?isbn=9780674251014 | `wellbeing_monitor.py` |
| Maslach & Leiter (1997), *The Truth About Burnout* | PAYWALL | ISBN 978-0787908638 (Jossey-Bass) | `wellbeing_monitor.py` |
| ISO 45003:2021 (institutional standard) | PAYWALL (full); free abstract | https://www.iso.org/standard/64283.html | `wellbeing_monitor.py` |
| Reichheld (2006), *The Ultimate Question* | PAYWALL | Harvard Business School Press | `wellbeing_monitor.py`, `recognition_program.py` |
| Milkovich, Newman, & Gerhart, *Compensation* | PAYWALL | https://www.mheducation.com/highered/product/compensation-milkovich-newman/M9781260565744.html | `recognition_program.py` |
| WorldatWork Total Rewards Handbook | PAYWALL | https://www.worldatwork.org/ | `recognition_program.py` |
| Zingheim & Schuster (2007), *Pay People Right!* | PAYWALL | ISBN via Jossey-Bass | `recognition_program.py` (alternative pairing) |

**Recommendation for the operator per §8.8b decision point:**

- **HIGHEST-PRIORITY free-only build possible today:** `sdt_diagnostic.md` (Route D asset)
  can be built entirely from the 2 already-FREE sources (Deci Olafsen Ryan 2017 + Gagné
  & Deci 2005). Meets §8.0 two-book minimum without any paywall placement. Should be the
  first maslow Touch-2 built.
- **Partial builds possible from free sources:** `motivation_pulse.py` (Route B) can
  ground SDT-need framework from the 2 free SDT papers, though the specific threshold
  numbers (4.0/2.5/±0.3) will remain Tier C reasoning-based per §8.4 (unless a
  pulse-analytics book is placed).
- **Full Touch-2 build requires operator to place 3+ paywalled books in `Agents/_books/`:**
  Maslach & Leiter (one of the two editions), Milkovich/Newman/Gerhart *Compensation*,
  and one of Reichheld or WorldatWork Total Rewards Handbook. Then `wellbeing_monitor.py`
  and `recognition_program.py` graduate to Shared OS/logical/ with book-cited docstrings
  per §8.10.
- **Route-D-only fallback** (accepting weaker grounding): `motivation_pulse.py` becomes a
  Route D cited rubric permanently; the threshold heuristics remain flagged reasoning-based
  per §8.4 Tier C.

The operator picks the path per §8.8b when Touch-2 opens.

---

## Cross-Agent Book Coordination (§8.9 "extract once, use twice")

Books that ground multiple agents' scripts — sourcing once serves the whole department:

| Book | Grounds for maslow | Grounds for other agents | Coordination note |
|---|---|---|---|
| Ryan & Deci (2000), Deci Olafsen Ryan (2017), Gagné & Deci (2005) | `sdt_diagnostic.md`, `motivation_pulse.py` | Future `merit` (autonomous-vs-controlled motivation informs perf-mgmt); potentially `grove` (competence-need in L&D design) | Extract once when placed; produce assets serving all 3 P&C agents |
| Maslach & Leiter *The Burnout Challenge* / *The Truth About Burnout* | `wellbeing_monitor.py` | Future `Risk & ESG` (CRSO) for psychosocial-risk-management framing per ISO 45003 governance | Extract once serving both maslow and Risk & ESG when that dept ships (task #6) |
| ISO 45003:2021 | `wellbeing_monitor.py` | Same — future Risk & ESG | Institutional-standard citation shared across departments |
| Milkovich, Newman, & Gerhart *Compensation* | `recognition_program.py` | Future `merit` (comp-cycle mgmt); future `comp-benchmarking` skill (payroll-and-eor sibling under hire) | Cross-department reuse — hire, merit, and maslow all draw on this |

---

## Meta

- **Touch-1 built:** 2026-07-31.
- **Touch-2 status:** waiting on book placement in `Agents/_books/` OR execution of the
  §8.8a 3-attempt free-source search for the Ryan & Deci 2000 paper. Nothing built yet.
- **HIGHEST-PRIORITY Touch-2 candidate:** `sdt_diagnostic.md` — 2 free sources already
  meet §8.0 minimum; no paywall dependency.
- **Refresh trigger:** any new skill added to maslow, any change to a skill's Principles
  section introducing a new numeric/heuristic judgment, or completion of a Touch-2 book
  campaign (update Scripts / Inherited / Skills→Script / Flag Clearance tables).
- **Cross-agent coordination:** flagged in the § Cross-Agent Book Coordination table
  above — the same book placement often serves maslow + one or two other agents. Surface
  this at the department-level Touch-2 planning meeting per §8.9 rule.
