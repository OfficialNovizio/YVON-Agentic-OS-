<!--
Logical layer: touch-1 placeholder per §8.1.

Per §8.1: "leave a placeholder. Once an agent's skills, identity, and operational layer
are done, write one logical/book-requirements.md recording the specific 0.6-flagged
judgments this agent makes, what kind of book/source would ground each, and why. Don't
build the real logical artifacts early."

Per §8.7: this is the ONLY .md file in an agent's logical/ folder.
All actual .py scripts, when built, live in Shared OS/logical/ per §13.5.

Per §8.11: includes 5 required tables (Scripts / Inherited / Skills→Script /
Flag Clearance / Still Pending).

grove's 3 local Python utilities (skill_gap.py + training_program.py + training_ops.py)
are NOT Shared OS logical scripts yet — see Still Pending §2, §3, §4 for graduation paths.
-->

# grove — Logical Layer: book-requirements (Touch-1 Placeholder)

## Purpose

Records the §0.6-flagged judgments grove's 4 skills make today, describes what book /
source type would ground each, and lists candidate authenticated sources per §8.8 for a
future Touch-2 build. **No real logical scripts have been built for grove yet.** Every
judgment is currently flagged reasoning-based or Tier-B book-cited. Touch-2 runs when
books are placed in `Agents/_books/`.

Cross-agent note: several candidate books here overlap with hire's and maslow's
`logical/book-requirements.md` (Rothstein *Employment Law* casebook shared with hire;
Ericsson corpus complements maslow's SDT via the competence-need mapping) — §8.9
"extract once, use twice" applies. Cross-Agent Book Coordination table at the bottom.

---

## Scripts Table (built for grove in Shared OS/logical/)

| Script filename | Source book(s) | Book URL(s) | Route |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** Touch-2 will populate.

---

## Inherited Scripts Table (from Shared OS/logical/)

| Script filename | Source book(s) | Book URL(s) | Why grove needs it |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** No relevant Shared OS/logical/ scripts exist yet for grove to
inherit.

---

## Skills → Script Mapping

Per §8.11: each of grove's skills and which Shared OS/logical/ scripts / assets it
imports today.

| Skill | Shared OS/logical/ imports today | Rationale |
|---|---|---|
| deliberate-practice | _(none)_ | Awaiting `Shared OS/logical/deliberate_practice.md` (Route D asset) — see Still Pending §1 |
| skill-gap-map | _(none)_ | Uses OWN local utility (`custom/skill-gap-map/scripts/skill_gap.py`); graduates to Shared OS/logical/ once book-grounded — see Still Pending §2 |
| training-program-design | _(none)_ | Uses OWN local utility (`custom/training-program-design/scripts/training_program.py`); graduates once book-grounded — see Still Pending §3 |
| training-operations | _(none)_ | Uses OWN local utility (`custom/training-operations/scripts/training_ops.py`); graduates once book-grounded — see Still Pending §4 |

**Current count: 0 imports.** grove's skills currently rely on cited-but-Tier-B sources
plus 3 local script utilities.

---

## Flag Clearance Summary

| §0.6-flagged judgment | Clearing script/asset | Tier before | Tier after | Cleared? |
|---|---|---|---|---|
| _(no flags cleared yet)_ | — | — | — | ❌ |

**Cleared: 0 of 14 flags.** See Still Pending below.

---

## Still Pending

The 14 §0.6-flagged judgments across grove's 4 skills, grouped by the future Shared OS
asset that would ground each. Candidate authenticated book sources per §8.8; §8.0 two-book
minimum per script.

### §1. `Shared OS/logical/deliberate_practice.md` — Route D cited rubric (would ground `deliberate-practice`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 1 | 5-condition DP framework (specific goal / full attention / immediate feedback / comfort-zone+1 / repetition+refinement) | deliberate-practice § Structure / Protocol; § Principles rule 1 | Tier B (Ericsson & Pool 2016 + Ericsson/Krampe/Tesch-Römer 1993 cited; canonical but not page-cited from `Agents/_books/`) |
| 2 | Component decomposition target (3–7 components per skill) | deliberate-practice § Instructions Phase 1 | Tier C reasoning-based (heuristic) |
| 3 | Comfort-zone-plus-one ~50% success rate target | deliberate-practice § Instructions Phase 3 | Tier C reasoning-based (heuristic) |
| 4 | Repetition schedule (3–5 attempts/component/week) | deliberate-practice § Instructions Phase 4 | Tier C reasoning-based (heuristic) |
| 5 | Macnamara critique bound (DP explains ~26% of variance) | deliberate-practice § Principles rule 2 | Tier B (Macnamara/Hambrick/Oswald 2014 cited; foundational counter-source) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993).** *The Role of Deliberate Practice in the Acquisition of Expert Performance.* Psychological Review, 100(3), 363–406.
  - URL: often FREE at .edu / .gov mirrors — requires §8.8a 3-attempt search.
- **Ericsson, K. A. & Pool, R. (2016).** *Peak: Secrets from the New Science of Expertise.* Houghton Mifflin Harcourt. ISBN 978-0544456235.
  - URL: publisher — PAYWALL; needs placement in `Agents/_books/`.
- **Macnamara, B. N., Hambrick, D. Z., & Oswald, F. L. (2014).** *Deliberate Practice and Performance in Music, Games, Sports, Education, and Professions: A Meta-Analysis.* Psychological Science, 25(8), 1608–1618.
  - URL: often FREE at academic mirrors — requires §8.8a search.

**Route:** Route D (cited rubric — no formula, no script per §8.2 litmus).

**Cross-agent reuse:** Ericsson corpus complements maslow's SDT via the competence-need
mapping (see § Cross-Agent Book Coordination below).

**Touch-2 path:** if Ericsson 1993 and Macnamara 2014 are confirmed FREE via §8.8a
3-attempt search, this asset can be built entirely from free sources (§8.0 minimum met).
Otherwise Ericsson & Pool 2016 (paywall) placement is the alternate path.

---

### §2. `Shared OS/logical/skill_gap.py` — Route B (would promote grove's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 6 | 1–5 proficiency scale anchors + Build/Buy/Borrow/Bridge routing thresholds | skill-gap-map § Skills Matrix & Scoring; § Build / Buy / Borrow / Bridge; scripts/skill_gap.py | Tier B (Cornerstone / SHRM / AIHR / Workhuman / muchskills / McKinsey / Paylocity cited — vendor sources per §8.8; not book-cited) |
| 7 | Rater discrepancy > 1 level triggers reconciliation | skill-gap-map § Instructions Phase 4; § Principles rule 3 | Tier C reasoning-based (heuristic threshold) |
| 8 | Top-priority gaps count target (3–5) | skill-gap-map § Instructions Phase 6 | Tier C reasoning-based (heuristic) |
| 9 | Criticality bands (1.0 gates driver / ~0.5 supportive / ~0.1 nice-to-have) | skill-gap-map § Instructions Phase 5 | Tier C reasoning-based (heuristic bands) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Whiddett, S. & Hollyforde, S.** *A Practical Guide to Competencies: How to Enhance Individual and Organisational Performance.* CIPD. Named practitioner text on competency mapping.
  - URL: CIPD publisher; PAYWALL.
- **SHRM certification textbook** — institutional source per §8.8.
  - URL: https://www.shrm.org/certification (institutional).
- **Rothwell, W. J.** *Effective Succession Planning.* AMACOM. Named academic-practitioner text; touches gap analysis.
  - URL: publisher / library access; PAYWALL.

**Route:** Route B (rule-engine script) — currently local utility.

---

### §3. `Shared OS/logical/training_program.py` — Route A + B (would promote grove's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 10 | ADDIE + 70-20-10 + Kirkpatrick 4-levels framework (+ specific thresholds: 3-month behavior timing, 3-question survey guidance, ~70/20/10 mix) | training-program-design § Core Concepts + § Instructions; scripts/training_program.py | Tier B (Whatfix / Docebo / Kirkpatrick Partners / Mindtools / HRDQ / Devlin Peck cited; vendor + practitioner sources per §8.8) |
| 11 | Required-drivers check (management support / systems / accountability) | training-program-design § Instructions Phase 4; § Principles rule 5 | Tier B (New World Kirkpatrick update cited via Kirkpatrick Partners) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Kirkpatrick, D. L. & Kirkpatrick, J. D. (2016).** *Kirkpatrick's Four Levels of Training Evaluation.* ATD Press. ISBN 978-1607280088.
  - URL: publisher; PAYWALL — the definitive text on the 4-levels + New World required drivers.
- **Rothwell, W. J. & Kazanas, H. C.** *Mastering the Instructional Design Process.* Pfeiffer. Institutional-source graduate text on ADDIE.
  - URL: publisher; PAYWALL.
- **ATD (Association for Talent Development) research publications** — institutional source per §8.8.

**Route:** Route A (rate arithmetic — completion, ROI) + Route B (allocation-check + timing-classification rules).

**Cross-agent reuse:** Kirkpatrick evaluation-timing logic could inform future merit's
performance-cycle evaluation (see § Cross-Agent Book Coordination).

---

### §4. `Shared OS/logical/training_ops.py` — Route A + B (would promote grove's local utility)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 12 | 4 required audit-trail fields (person / course-code / timestamp / attestation) | training-operations § Core Concepts § The Compliance Audit Trail; § Principles rule 2; scripts/training_ops.py REQUIRED_AUDIT_FIELDS | Tier B (Vigilearn / Coggno cited — professional compliance guidance; institutional-adjacent) |
| 13 | Default 90-day expiry lead time + band definitions (EXPIRED / URGENT / ALERT / OK) | training-operations § Core Concepts § Proactive Expiry Management; scripts/training_ops.py expiry_alert_status() | Tier B (Absorb LMS / CypherLearning vendor guidance; heuristic thresholds) |
| 14 | Jurisdiction-specific retention periods (OSHA ~5yr US example; varies by regulation and jurisdiction) | training-operations § Core Concepts § Retention & Immutability; § Fallback rule 3 | Tier B for OSHA (institutional — dol.gov / osha.gov); Tier C for the general "always varies" heuristic |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Rothstein, M. A., Craver, C. B., Schroeder, E. P., & Shoben, E. W. (multiple editions).** *Employment Law.* Foundation Press / West Academic Publishing. Standard casebook.
  - URL: https://www.westacademic.com/ (publisher); PAYWALL. **SHARED CANDIDATE with hire's worker_classification.py** per §8.9.
- **OSHA Publications** (institutional — osha.gov) — FREE. Institutional-source retention guidance for OSHA-scope training.
  - URL: https://www.osha.gov/publications — FREE (browse for specific-topic retention guidance).
- **ATD compliance-training handbook** — institutional source; alternative pairing.

**Route:** Route B (rule engine — validation + expiry classification + rollup) + Route A
(rate arithmetic — days-until-expiry).

**Cross-agent reuse:** Rothstein casebook is shared with hire's `worker_classification.py`
per §8.9 — single book placement serves both agents.

---

## Book Sourcing Plan Summary

Per §8.11 litmus ("Can the operator click one link and see the actual book page?"):

| Book | Free? | URL | Blocking asset |
|---|---|---|---|
| Ericsson, Krampe, & Tesch-Römer (1993) | Likely FREE (widely mirrored .edu) | Requires §8.8a 3-attempt search | `deliberate_practice.md` |
| Ericsson & Pool (2016), *Peak* | PAYWALL | ISBN 978-0544456235 (Houghton Mifflin Harcourt) | `deliberate_practice.md` (alternate path) |
| Macnamara, Hambrick, & Oswald (2014) | Likely FREE (academic mirrors) | Requires §8.8a 3-attempt search | `deliberate_practice.md` (critical counter-source) |
| Whiddett & Hollyforde, *A Practical Guide to Competencies* | PAYWALL | CIPD publisher | `skill_gap.py` |
| SHRM certification textbook | PAYWALL | https://www.shrm.org/certification | `skill_gap.py`, potentially cross-agent |
| Rothwell, *Effective Succession Planning* | PAYWALL | Publisher / library | `skill_gap.py` (alternate); future merit succession-planning |
| Kirkpatrick & Kirkpatrick (2016), *Four Levels of Training Evaluation* | PAYWALL | ATD Press, ISBN 978-1607280088 | `training_program.py` |
| Rothwell & Kazanas, *Mastering the Instructional Design Process* | PAYWALL | Pfeiffer publisher | `training_program.py` |
| Rothstein et al., *Employment Law* casebook | PAYWALL | https://www.westacademic.com/ | `training_ops.py` — **SHARED with hire's worker_classification.py per §8.9** |
| OSHA Publications | **FREE** | https://www.osha.gov/publications | `training_ops.py` |

**Recommendation for the operator per §8.8b decision point:**

- **HIGHEST-PRIORITY free-only build possible today:** `deliberate_practice.md` (Route D
  asset) — Ericsson 1993 + Macnamara 2014 are likely FREE at .edu / academic mirrors;
  §8.8a 3-attempt search will confirm. Meets §8.0 two-book minimum without paywall
  placement. Cross-agent value with maslow's SDT.
- **Partial builds possible from free sources:** `training_ops.py` can ground the
  jurisdiction-varies-retention rule from OSHA Publications (FREE, institutional) but
  the general audit-trail structure still needs Rothstein casebook or an ATD compliance
  handbook.
- **Full Touch-2 requires operator to place 4 paywalled books in `Agents/_books/`:**
  Ericsson & Pool 2016 OR (if Ericsson 1993 free-source doesn't confirm), Kirkpatrick
  & Kirkpatrick 2016, Rothwell & Kazanas *Mastering the Instructional Design Process*,
  Rothstein et al. *Employment Law* (SHARED with hire), and either Whiddett & Hollyforde
  OR Rothwell *Effective Succession Planning* for skill_gap.py.
- **Route-D-only fallback** (accepting weaker grounding): grove keeps its 3 local
  utilities as agent-local; §0.6 flags stay reasoning-based per §8.4 Tier C. Transparent
  but weaker.

The operator picks the path per §8.8b when Touch-2 opens.

---

## Cross-Agent Book Coordination (§8.9 "extract once, use twice")

| Book | Grounds for grove | Grounds for other agents | Coordination note |
|---|---|---|---|
| Ericsson corpus (1993 + 2016 + Macnamara 2014) | `deliberate_practice.md` | maslow's SDT via competence-need → DP-informed intervention mapping; potentially future merit's performance-development framing | Extract once when placed; produce assets serving both grove and maslow's competence-need routing |
| Kirkpatrick & Kirkpatrick (2016), *Four Levels* | `training_program.py` | Future merit's performance-cycle evaluation timing (adapted from L&D to perf-mgmt) | Extract once serving both grove and future merit's evaluation-timing skills |
| Rothstein et al., *Employment Law* casebook | `training_ops.py` — audit-trail retention + compliance framing | hire's `worker_classification.py` (already flagged as shared candidate in hire's book-requirements) | Single book placement serves both agents |
| SHRM certification textbook (institutional) | `skill_gap.py` | Multiple P&C agents (hire, maslow, grove, future merit) reference SHRM guidance across their skills | Broad department-level ground; single institutional source serving many |
| OSHA Publications (institutional FREE) | `training_ops.py` retention baseline | Future Global Expansion department (task #3) for US-jurisdiction training compliance | Cross-department when Global Expansion ships |

---

## Meta

- **Touch-1 built:** 2026-07-31.
- **Touch-2 status:** waiting on book placement in `Agents/_books/` OR §8.8a 3-attempt
  free-source search for Ericsson 1993 + Macnamara 2014.
- **HIGHEST-PRIORITY Touch-2 candidate:** `deliberate_practice.md` — 2 potentially FREE
  sources; no paywall dependency; cross-agent value.
- **Refresh trigger:** any new skill added to grove, any change to a skill's Principles
  section introducing a new numeric/heuristic judgment, or completion of a Touch-2 book
  campaign.
- **Cross-agent coordination:** 5 candidate books serve multiple agents per §8.9 —
  surface this at department-level Touch-2 planning to avoid duplicate placement.
