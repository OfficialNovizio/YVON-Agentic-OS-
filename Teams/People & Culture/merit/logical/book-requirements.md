<!--
Logical layer: touch-1 placeholder per §8.1.

Per §8.1: leave a placeholder — record the specific 0.6-flagged judgments this agent
makes, what kind of book/source would ground each, and why. Do not build real logical
artifacts early.

Per §8.7: this is the ONLY .md file in an agent's logical/ folder.
All actual .py scripts, when built, live in Shared OS/logical/ per §13.5.

Per §8.11: includes 5 required tables (Scripts / Inherited / Skills→Script /
Flag Clearance / Still Pending) + Cross-Agent Book Coordination.

merit's 2 local Python utilities (succession_planning.py + hr_scorecard.py) are NOT
Shared OS logical scripts yet — see Still Pending §3 and §4 for graduation paths.
-->

# merit — Logical Layer: book-requirements (Touch-1 Placeholder)

## Purpose

Records the §0.6-flagged judgments merit's 4 skills make today, describes what
book / source type would ground each, and lists candidate authenticated sources per §8.8
for a future Touch-2 build. **No real logical scripts have been built for merit yet.**
Every judgment is currently flagged reasoning-based or Tier-B book-cited. Touch-2 runs
when books are placed in `Agents/_books/`.

Cross-agent note: several candidate books here overlap with hire's, maslow's, and grove's
`logical/book-requirements.md` — Bock 2015 shared with hire's `hiring_selection.py` and
grove's assets; Rothwell shared with grove's `skill_gap.py`. §8.9 "extract once, use
twice" applies. Cross-Agent Book Coordination table at the bottom.

---

## Scripts Table (built for merit in Shared OS/logical/)

| Script filename | Source book(s) | Book URL(s) | Route |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** Touch-2 will populate.

---

## Inherited Scripts Table (from Shared OS/logical/)

| Script filename | Source book(s) | Book URL(s) | Why merit needs it |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** No relevant Shared OS/logical/ scripts exist yet for merit to
inherit.

---

## Skills → Script Mapping

Per §8.11: each of merit's skills and which Shared OS/logical/ scripts / assets it
imports today.

| Skill | Shared OS/logical/ imports today | Rationale |
|---|---|---|
| feedback-methods | _(none)_ | Awaiting `Shared OS/logical/feedback_methods.md` (Route D asset) — see Still Pending §1 |
| performance-frame | _(none)_ | Awaiting `Shared OS/logical/okr_framework.md` (Route D asset) — see Still Pending §2 |
| succession-planning | _(none)_ | Uses OWN local utility (`custom/succession-planning/scripts/succession_planning.py`); graduates to Shared OS/logical/ once book-grounded — see Still Pending §3 |
| hr-strategy-alignment | _(none)_ | Uses OWN local utility (`custom/hr-strategy-alignment/scripts/hr_scorecard.py`); graduates once book-grounded — see Still Pending §4 |

**Current count: 0 imports.** merit's skills currently rely on cited-but-Tier-B sources
plus 2 local script utilities.

---

## Flag Clearance Summary

| §0.6-flagged judgment | Clearing script/asset | Tier before | Tier after | Cleared? |
|---|---|---|---|---|
| _(no flags cleared yet)_ | — | — | — | ❌ |

**Cleared: 0 of 15 flags.** See Still Pending.

---

## Still Pending

The 15 §0.6-flagged judgments across merit's 4 skills, grouped by the future Shared OS
asset that would ground each.

### §1. `Shared OS/logical/feedback_methods.md` — Route D cited rubric (would ground `feedback-methods`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 1 | SBI (Situation-Behavior-Impact) 3-part format + anti-pattern list | feedback-methods § Structure / Protocol; § Instructions Phase 2 | Tier B (Weitzel 2000 CCL cited; canonical but not page-cited from `Agents/_books/`) |
| 2 | Radical Candor 4-quadrant grid (Care × Challenge) + order-of-operations (solicit → praise → criticize) | feedback-methods § Structure / Protocol; § Instructions Phase 3; § Principles rule 3 | Tier B (Scott 2017 cited) |
| 3 | 5-phase delivery structure (quadrant diagnose → SBI build → solicit → deliver+pause → confirm) | feedback-methods § Instructions Phases 1-5 | Tier C reasoning-based (synthesized from both source frameworks, not directly cited) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Scott, Kim (2017).** *Radical Candor: Be a Kick-Ass Boss Without Losing Your Humanity.* St. Martin's Press. ISBN 978-1250103505. Practitioner-operator per §8.9 — former Google/Apple manager.
  - URL: https://www.radicalcandor.com/ (framework site — some materials FREE); PAYWALL for the book.
- **Weitzel, Sloan R. (2000).** *Feedback That Works: How to Build and Deliver Your Message.* Center for Creative Leadership (CCL) Press. ISBN 978-1882197583. Institutional source per §8.8 (CCL).
  - URL: https://www.ccl.org/ (institutional — some materials FREE); PAYWALL for the book.
- **radicalcandor.com + ccl.org public materials** — supplement the paywalled books with framework overviews; both institutional / practitioner-authored.

**Route:** Route D (cited rubric — two frameworks with clear anchors, no formula, no
script per §8.2 litmus).

---

### §2. `Shared OS/logical/okr_framework.md` — Route D cited rubric (would ground `performance-frame`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 4 | OKR framework (individual O cascade from company O; 3-5 O per person; 2-4 KR per O; measurable KRs) | performance-frame § Structure / Protocol; § Instructions Phase 1; § Principles rules 1-2 | Tier B (Doerr 2018 + Grove 1995 canonical; not page-cited) |
| 5 | ~70% ambition achievability heuristic | performance-frame § Instructions Phase 1; § Principles rule 5 | Tier B (Doerr 2018 ch.5 heuristic; framework-cited) |
| 6 | Quarterly cycle + mid-cycle check + end-of-cycle written review (24-48hr advance share) | performance-frame § Structure / Protocol; § Instructions Phases 2-3; § Principles rule 3 | Tier B (Bock 2015 ch.6 for Google practice + Grove 1995) |
| 7 | Year-end synthesis pattern-flag thresholds (Y ≥3 / partial ≥2 / N ≥3 quarters) | performance-frame § Instructions Phase 4 | Tier C reasoning-based (heuristic thresholds) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Doerr, John (2018).** *Measure What Matters: How Google, Bono, and the Gates Foundation Rock the World with OKRs.* Portfolio. ISBN 978-0525536222. Practitioner-operator per §8.9 — KPCB partner, brought OKRs to Google via Grove.
  - URL: https://www.whatmatters.com/ (framework site — some materials FREE); PAYWALL for the book.
- **Grove, Andrew S. (1995).** *High Output Management.* Vintage. ISBN 978-0679762881. Practitioner-operator per §8.9 — Intel CEO; original OKR practice.
  - URL: publisher; PAYWALL — accessible via university libraries and used-book market.
- **Bock, Laszlo (2015).** *Work Rules!* Twelve. Already cited in hire's `hiring-kit`; **SHARED CANDIDATE with hire's `hiring_selection.py` and grove's assets per §8.9.**
  - URL: https://www.workrules.net/; PAYWALL.
- **Google re:Work (rework.withgoogle.com)** — institutional FREE source with OKR guide.

**Route:** Route D (cited rubric — framework with fixed structure but qualitative
application, no formula per §8.2 litmus).

**Cross-agent reuse:** Bock 2015 is a THREE-WAY shared book (hire hiring-kit + grove
deliberate-practice-related + merit performance-frame) — single placement serves all
three agents per §8.9.

---

### §3. `Shared OS/logical/succession_planning.py` — Route B (would promote merit's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 8 | 9-box grid (3×3 = 9 labels with observable-behavior anchors: Star / Trusted Professional / etc.) | succession-planning § Structure / Protocol; § Skills Matrix (implicit); scripts/succession_planning.py NINE_BOX_GRID | Tier B (Creately + SHRM cited — practitioner + institutional sources per §8.8; 9-box labels are working taxonomy) |
| 9 | Readiness levels + weights (Ready Now = 3; 1-2yr = 2; 3-5yr = 1; not_identified = 0) | succession-planning § Structure / Protocol; scripts/succession_planning.py READINESS_WEIGHTS | Tier B (Qooper + AIHR cited — practitioner sources) |
| 10 | Risk-flag bands (critical=0 / high_risk=1 / moderate=2-3 / healthy≥4) | scripts/succession_planning.py risk_flag() | Tier C reasoning-based (heuristic thresholds) |
| 11 | Target 2-3 successors per critical role + zero-successor MANDATORY escalation | succession-planning § Principles rule 2 + rule 5 (LOAD-BEARING) | Tier B (industry-standard succession-planning practice per AIHR / SHRM cited) |
| 12 | Career-lattice framing (lateral / cross-venture as legitimate progression) | succession-planning § Structure / Protocol; § Principles rule 4 | Tier B (TalentGuard + AIHR + Lattice cited — practitioner sources) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Rothwell, William J.** *Effective Succession Planning.* AMACOM. Named academic-practitioner author.
  - URL: publisher / library; PAYWALL. **SHARED CANDIDATE with grove's `skill_gap.py` per §8.9.**
- **Charan, R., Drotter, S., & Noel, J. (2010).** *The Leadership Pipeline: How to Build the Leadership Powered Company.* Jossey-Bass. ISBN 978-0470894569. Named practitioner-academic authors.
  - URL: publisher; PAYWALL.
- **SHRM certified textbook** — institutional source per §8.8; already cited across P&C.

**Route:** Route B (rule-engine script — lookup + weighted sum + threshold classification).

**Cross-agent reuse:** Rothwell shared with grove's `skill_gap.py` — single placement
serves both agents.

---

### §4. `Shared OS/logical/hr_scorecard.py` — Route A + B (would promote merit's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 13 | 4 BSC perspectives (Financial / Employee-Customer / Internal Process / Learning & Growth) | hr-strategy-alignment § Structure / Protocol; scripts/hr_scorecard.py BSC_PERSPECTIVES | Tier B (Kaplan & Norton 1996 foundational; cited but not page-cited from `Agents/_books/`) |
| 14 | 3-5 top strategic objectives per venture per cycle + weights sum to 1.0 + per-cycle re-weighting | hr-strategy-alignment § Structure / Protocol implementation sequence; § Principles rule 2; scripts/hr_scorecard.py build_scorecard() validation | Tier B (AIHR / Wowledge / Balanced Scorecard Institute cited) |
| 15 | Orphan-flagging-in-both-directions rule + INCOMPLETE for metric-without-target | hr-strategy-alignment § Principles rule 1 + rule 4 (LOAD-BEARING); scripts/hr_scorecard.py flag_orphans() + progress() returns None | Tier B (framework discipline per Kaplan & Norton / AIHR) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Kaplan, R. S. & Norton, D. P. (1996).** *The Balanced Scorecard: Translating Strategy into Action.* Harvard Business School Press. ISBN 978-0875846514. Foundational academic text.
  - URL: publisher; PAYWALL — the canonical BSC source.
- **Becker, B. E., Huselid, M. A., & Ulrich, D. (2001).** *The HR Scorecard: Linking People, Strategy, and Performance.* Harvard Business School Press. ISBN 978-1578511365. Named academic authors — HR-specific application.
  - URL: publisher; PAYWALL.

**Route:** Route A (progress arithmetic + weighted alignment score) + Route B
(perspective validation + orphan-flagging rules).

---

## Book Sourcing Plan Summary

Per §8.11 litmus ("Can the operator click one link and see the actual book page?"):

| Book | Free? | URL | Blocking asset |
|---|---|---|---|
| Scott, K. (2017), *Radical Candor* | PAYWALL (some free at radicalcandor.com) | https://www.radicalcandor.com/ | `feedback_methods.md` |
| Weitzel, S. R. (2000), *Feedback That Works* (CCL) | PAYWALL (some free at ccl.org) | https://www.ccl.org/ | `feedback_methods.md` |
| Doerr, J. (2018), *Measure What Matters* | PAYWALL (some free at whatmatters.com) | https://www.whatmatters.com/ | `okr_framework.md` |
| Grove, A. S. (1995), *High Output Management* | PAYWALL | Publisher / library / used-book market | `okr_framework.md` |
| Bock, L. (2015), *Work Rules!* | PAYWALL | https://www.workrules.net/ | `okr_framework.md` — **SHARED with hire + grove** |
| Google re:Work OKR guide | **FREE** (institutional) | https://rework.withgoogle.com/en/guides/set-goals-with-okrs | `okr_framework.md` supplement |
| Rothwell, *Effective Succession Planning* | PAYWALL | Publisher / library | `succession_planning.py` — **SHARED with grove's skill_gap.py** |
| Charan/Drotter/Noel (2010), *The Leadership Pipeline* | PAYWALL | Publisher | `succession_planning.py` |
| SHRM certification textbook (institutional) | PAYWALL | https://www.shrm.org/certification | `succession_planning.py` — potentially cross-agent |
| Kaplan & Norton (1996), *The Balanced Scorecard* | PAYWALL | Harvard Business School Press | `hr_scorecard.py` |
| Becker/Huselid/Ulrich (2001), *The HR Scorecard* | PAYWALL | Harvard Business School Press | `hr_scorecard.py` |

**Recommendation for the operator per §8.8b decision point:**

- **NO free-only build possible today** for merit — every candidate book is paywalled.
  Google re:Work OKR guide is institutional FREE and can supplement `okr_framework.md`,
  but §8.0 two-book minimum requires a second authenticated source (Doerr or Grove or
  Bock) which are all paywalled.
- **Partial builds possible from institutional-FREE sources + supplements:**
  `feedback_methods.md` can partially ground from radicalcandor.com + ccl.org public
  materials (both institutional per §8.8), meeting the framework citation standard even
  without book-page citations; but the 5-phase delivery structure (§1 flag 3) stays Tier
  C reasoning-based per §8.4 until Scott 2017 or Weitzel 2000 is placed.
- **Full Touch-2 requires operator to place 4-5 paywalled books in `Agents/_books/`:**
  Scott 2017 OR Weitzel 2000 (either grounds `feedback_methods.md`); Doerr 2018 OR
  Grove 1995 (either grounds `okr_framework.md`); Rothwell (grounds
  `succession_planning.py` — SHARED with grove); Kaplan & Norton 1996 (grounds
  `hr_scorecard.py`); Becker/Huselid/Ulrich 2001 (second source for `hr_scorecard.py`).
- **Route-D-only fallback** (accepting weaker grounding): merit keeps its 2 local
  utilities as agent-local; §0.6 flags stay Tier B (framework-cited but not
  book-page-cited) per §8.4. Transparent but weaker than book-grounded.

The operator picks the path per §8.8b when Touch-2 opens.

---

## Cross-Agent Book Coordination (§8.9 "extract once, use twice")

| Book | Grounds for merit | Grounds for other agents | Coordination note |
|---|---|---|---|
| **Bock, L. (2015), *Work Rules!*** | `okr_framework.md` (§2 flag 6 — Google's OKR practice at scale) | hire's `hiring_selection.py` (structured hiring); grove's assets (Ericsson-adjacent for L&D) | **THREE-WAY SHARED** — single placement serves hire + grove + merit |
| **Rothwell, *Effective Succession Planning*** | `succession_planning.py` (§3 flags 8-12) | grove's `skill_gap.py` (already noted in grove's book-requirements) | **SHARED** — single placement serves grove + merit |
| **SHRM certified textbook** | `succession_planning.py` (§3 flag 8) | Multiple P&C agents (hire, maslow, grove, merit) reference SHRM guidance across skills | Broad department-level ground; single institutional source serving many |
| **Kaplan & Norton (1996), *The Balanced Scorecard*** | `hr_scorecard.py` (§4 flags 13-15) | No other current YVON agent uses BSC; potentially future Finance department (task not yet in build roster) for corporate BSC | Merit-specific for now; watch for Finance agent when it ships |
| **Scott (2017) + Weitzel (2000)** | `feedback_methods.md` (§1 flags 1-3) | Potentially future manager-training programs at grove (which cite feedback-methods indirectly via SBI+Radical Candor in training content) | Merit-primary; grove secondary via training-program-design content |

---

## Meta

- **Touch-1 built:** 2026-07-31.
- **Touch-2 status:** waiting on book placement in `Agents/_books/`. Merit's Touch-2 is
  the MOST PAYWALL-DEPENDENT across P&C — unlike maslow's SDT rubric which had 2 FREE
  sources meeting §8.0 minimum, none of merit's candidate books are freely accessible in
  full-book form.
- **HIGHEST-PRIORITY Touch-2 candidate:** `feedback_methods.md` from Scott 2017 + Weitzel
  2000 — merit's most-referenced skill (called by performance-frame + succession-planning
  + hiring-kit's rejection-feedback path).
- **Book-placement priority for cross-agent leverage:** Bock 2015 first (serves 3 agents);
  Rothwell second (serves 2 agents); then merit-specific books.
- **Refresh trigger:** any new skill added to merit, any change to a skill's Principles
  section introducing a new numeric/heuristic judgment, or completion of a Touch-2 book
  campaign.
