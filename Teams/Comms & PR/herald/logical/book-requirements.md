<!--
Logical layer: touch-1 placeholder per §8.1.

Per §8.1: leave a placeholder — record the specific 0.6-flagged judgments this agent
makes, what kind of book/source would ground each, and why. Do not build real logical
artifacts early.

Per §8.7: this is the ONLY .md file in an agent's logical/ folder. All actual .py scripts,
when built, live in Shared OS/logical/ per §13.5.

Per §8.11: includes 5 required tables (Scripts / Inherited / Skills→Script /
Flag Clearance / Still Pending) + Cross-Agent Book Coordination.

herald's 1 local Python utility (pr_analytics.py) is NOT a Shared OS logical script yet
— see Still Pending §4 for graduation path.
-->

# herald — Logical Layer: book-requirements (Touch-1 Placeholder)

## Purpose

Records the §0.6-flagged judgments herald's 4 skills make today, describes what
book / source type would ground each, and lists candidate authenticated sources per §8.8
for a future Touch-2 build. **No real logical scripts have been built for herald yet.**
Every judgment is currently flagged reasoning-based or Tier-B book-cited (with the
partial exception of the AVE refusal, which is grounded at institutional-source
Barcelona Principles 3.0 level + baked at code level). Touch-2 runs when books are placed
in `Agents/_books/`.

Cross-agent note: **Scott 2020** grounds herald's identity + `media-relations` + `press-kit`
+ (indirectly) `media-training` — single book grounds 4 herald artifacts per §8.9
extract-once-use-4x. This is the highest-leverage single-book placement in herald's plan.
Cross-Agent Book Coordination table at the bottom.

---

## Scripts Table (built for herald in Shared OS/logical/)

Per §8.11 required table shape:

| Script filename | Source book(s) | Book URL(s) | Route |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** Touch-2 will populate.

---

## Inherited Scripts Table (from Shared OS/logical/)

Per §8.11:

| Script filename | Source book(s) | Book URL(s) | Why herald needs it |
|---|---|---|---|
| _(none)_ | _(none)_ | _(none)_ | _(none)_ |

**Current count: 0.** No relevant Shared OS/logical/ scripts exist yet for herald to
inherit. `Shared OS/skills/people-analytics-metrics/` was built for P&C and could
potentially be referenced by herald's pr-analytics for share-of-voice methodology (both
use similar denominator-based ratios) but is currently P&C-scoped.

---

## Skills → Script Mapping

Per §8.11: each of herald's skills and which Shared OS/logical/ scripts / assets it
imports today.

| Skill | Shared OS/logical/ imports today | Rationale |
|---|---|---|
| media-relations | _(none)_ | Awaiting `Shared OS/logical/media_relations.md` (Route D asset) — see Still Pending §1 |
| press-kit | _(none)_ | Awaiting `Shared OS/logical/press_kit.md` (Route D asset) — see Still Pending §2 |
| media-training | _(none)_ | Awaiting `Shared OS/logical/media_training.md` (Route D asset) — see Still Pending §3 |
| pr-analytics | _(none)_ | Uses OWN local utility (`custom/pr-analytics/scripts/pr_analytics.py` with baked ave_refuse); graduates to Shared OS/logical/ once book-grounded — see Still Pending §4 |

**Current count: 0 imports.** herald's skills currently rely on cited-but-Tier-B sources
plus 1 local script utility with load-bearing code-level AVE refusal.

---

## Flag Clearance Summary

| §0.6-flagged judgment | Clearing script/asset | Tier before | Tier after | Cleared? |
|---|---|---|---|---|
| _(no flags cleared yet)_ | — | — | — | ❌ |

**Cleared: 0 of 15 flags.** See Still Pending below.

---

## Still Pending

The 15 §0.6-flagged judgments across herald's 4 skills, grouped by the future Shared OS
asset that would ground each.

### §1. `Shared OS/logical/media_relations.md` — Route D cited rubric (would ground `media-relations`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 1 | Newsjacking + real-time PR framework (hours-not-days window; publish-to-owned-first; hostile POV test) | media-relations § Structure/Protocol §6; § Principles rule 4 | Tier B (Scott 2020 + Scott 2011 cited; canonical but not book-page-cited from `Agents/_books/`) |
| 2 | Follow-up cadence discipline (3-5 business days first; second only with new material; never spam) | media-relations § Instructions Phase 5; § Principles rule 5 | Tier B (Cision + Muck Rack institutional-adjacent practitioner cited) |
| 3 | Subject-line-IS-the-pitch discipline | media-relations § Instructions Phase 3; § Principles rule 1 | Tier B (Cision + Scott convergence; canonical practitioner guidance) |
| 4 | Context limits (B2B tech/SaaS fit vs consumer/regulated/B2G adapt) | media-relations § Principles rule 8 | Tier B (Scott identity Blind Spots + acknowledged framework limits) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Scott, David Meerman (2020, 8th ed).** *The New Rules of Marketing and PR: How to Use Content Marketing, Podcasting, Social Media, AI, Live Video, and Newsjacking to Reach Buyers Directly.* Wiley. ISBN 978-1119651543. Practitioner-operator per §8.9 — anchor for herald's identity AND multiple skills.
  - URL: publisher; PAYWALL — needs placement in `Agents/_books/`.
- **Scott, David Meerman (2011).** *Newsjacking: How to Inject Your Ideas into a Breaking News Story and Generate Tons of Media Coverage.* Wiley. ISBN 978-1118061336.
  - URL: publisher; PAYWALL.
- **Society of Professional Journalists (SPJ) Code of Ethics** — institutional, FREE.
  - URL: https://www.spj.org/ethicscode.asp — FREE.

**Route:** Route D (cited rubric — narrative framework with clear anchors, no formula,
no script).

**Cross-agent reuse:** Scott 2020 is the highest-leverage single book placement across
herald's plan (grounds identity + media-relations + press-kit + informs media-training).

---

### §2. `Shared OS/logical/press_kit.md` — Route D cited rubric (would ground `press-kit`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 5 | Inverted pyramid press-release structure (5 W's in lead + body + boilerplate + media contact) | press-kit § Instructions Phase 3; § Structure/Protocol §3 | Tier B (Cision + PR Newswire + Businesswire + PRSA institutional practitioner discipline; canonical) |
| 6 | 3-length boilerplate (50/100/200-word) + 3-length executive bio (long/short/social) canonical library | press-kit § Instructions Phase 1; § Structure/Protocol §1 | Tier B (PRSA + Cision institutional-adjacent professional practice; heuristic length breakdown) |
| 7 | Embargo protocol (explicit date + time + timezone + written acknowledgment + never partial + simultaneous release) | press-kit § Instructions Phase 7; § Principles rules 6-7 (LOAD-BEARING) | Tier B (Cision + PRSA cited institutional practice) |
| 8 | Fact-check discipline sequence (draft → fact-check → voice-check → CEO signoff → deliver) | press-kit § Instructions Phases 3-6; § Principles rule 3 (LOAD-BEARING sequence) | Tier B (professional discipline; not book-page-cited) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Bivins, Thomas H.** *Public Relations Writing: The Essentials of Style and Format.* McGraw-Hill (multiple editions). Named academic-practitioner author; standard university PR-writing textbook.
  - URL: publisher; PAYWALL. Grounds §2 press-kit discipline directly.
- **Scott, David Meerman (2020).** *The New Rules of Marketing and PR.* Wiley. **SHARED with §1** — chapters on press-release writing complement Bivins.
- **PRSA (Public Relations Society of America)** — institutional standards; FREE materials at prsa.org.
  - URL: https://www.prsa.org/ — FREE.

**Route:** Route D (cited rubric — template library + protocol discipline).

**Cross-agent reuse:** Bivins is press-kit-specific; Scott 2020 is shared across herald
plan.

---

### §3. `Shared OS/logical/media_training.md` — Route D cited rubric (would ground `media-training`)

**Flags this asset would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 9 | 3-messages MAX message-map discipline (cognitive-load limit) | media-training § Instructions Phase 2; § Principles rule 1 (LOAD-BEARING) | Tier B (T.J. Walker + Neil & Bassett practitioner convergence; canonical) |
| 10 | ABC bridging formula (Acknowledge → Bridge → Communicate) + 5-10 bridging drills per message | media-training § Instructions Phase 3; § Principles rule 2 | Tier B (Walker + Neil/Bassett convergence; canonical practitioner) |
| 11 | Hostile-Q anti-pattern catalog (loaded premise + false dichotomy + gotcha frame + competitor comparison + past failure + personal question) | media-training § Instructions Phase 4 | Tier B (Walker + Neil/Bassett; practitioner discipline) |
| 12 | SPJ on-record / off-record / background / deep-background standards | media-training § Instructions Phase 5; § Principles rule 4 (LOAD-BEARING) | Tier B (SPJ Code of Ethics institutional; FREE) |
| 13 | 30-60 min dry-run per 20-min interview + defer-or-substitute if systematic issues | media-training § Instructions Phase 6; § Principles rule 6 | Tier C reasoning-based (practitioner heuristic; not book-cited from `Agents/_books/`) |

**Candidate authenticated sources per §8.0 + §8.8:**

- **Walker, T.J.** *Media Training Success* + *Public Speaking for Success* (multiple editions since 2010). Practitioner-operator per §8.9 — media-training coach for corporate executives; extensive published-book corpus.
  - URL: author site + publisher; PAYWALL.
- **Neil, Boyd & Bassett, Susan.** *Media Training Handbook.* Practitioner reference.
  - URL: publisher; PAYWALL.
- **Society of Professional Journalists Code of Ethics** — institutional, **FREE** at spj.org. Grounds §12 SPJ on-record standards directly.
- **Poynter Institute** — institutional media-education materials; some FREE at poynter.org.

**Route:** Route D (cited rubric — framework + anti-pattern catalog + on-record standards).

**Free-source-only build possible for §12** — SPJ Code of Ethics is FREE + institutional. Full
media_training.md grounding for §9-11 needs Walker + Neil/Bassett paywall books.

---

### §4. `Shared OS/logical/pr_analytics.py` — Route A + B (would promote herald's local utility with LOAD-BEARING baked ave_refuse)

**Flags this script would clear:**

| # | Flag | Skill line | Current tier |
|---|---|---|---|
| 14 | Barcelona Principles 3.0 (7 principles) + AMEC 6-stage framework | pr-analytics § Structure/Protocol; § Principles all 7 | Tier B (AMEC + Barcelona institutional per §8.8; institutional-source qualifies as one source; needs academic-textbook pair for §8.0) |
| 15 | Attribution discipline ("attributable ≠ caused" + qualitative-first sentiment methodology) | pr-analytics § Instructions Phase 4; § Principles rules 3 + 4 | Tier B (AMEC + Cision + Meltwater practitioner-institutional convergence) |

Note: AVE refusal (Barcelona Principle 5) is ALREADY grounded institutionally + baked at
code level via `pr_analytics.ave_refuse()`. That's the strongest grounding of any single
rule across herald's plan — the refusal is BOTH cited (Barcelona) AND enforced structurally
(code-level NotImplementedError). No book placement needed for AVE refusal to be
operational; book placement further-strengthens the academic case but doesn't change
enforcement.

**Candidate authenticated sources per §8.0 + §8.8:**

- **AMEC Barcelona Principles 3.0 (2020)** + **AMEC Integrated Evaluation Framework** — institutional canonical; ONE source per §8.0.
  - URL: https://amecorg.com/barcelona-principles/ — FREE.
- **Watson, Tom & Noble, Paul.** *Evaluating Public Relations.* Kogan Page (multiple editions). Academic HR-analytics-adjacent PR-measurement textbook.
  - URL: publisher; PAYWALL.
- **Michaelson, David & Stacks, Don W.** *A Professional and Practitioner's Guide to Public Relations Research, Measurement, and Evaluation.* Business Expert Press.
  - URL: publisher; PAYWALL.

**Route:** Route A (rate arithmetic — share-of-voice, coverage-vs-target, message
alignment) + Route B (rule engine — sentiment classification, AVE refusal). Currently
local; graduates to Shared OS/logical/pr_analytics.py when Watson/Noble + Michaelson/Stacks
pair (either meets §8.0 two-book minimum with AMEC as institutional source).

---

## Book Sourcing Plan Summary

Per §8.11 litmus ("Can the operator click one link and see the actual book page?"):

| Book | Free? | URL | Blocking asset |
|---|---|---|---|
| Scott (2020), *The New Rules of Marketing and PR* | PAYWALL | Wiley publisher | `media_relations.md` + `press_kit.md` + herald identity (SHARED across 3 herald assets + identity — highest-leverage) |
| Scott (2011), *Newsjacking* | PAYWALL | Wiley publisher | `media_relations.md` newsjacking depth |
| Scott & Scott (2018), *Fanocracy* | PAYWALL | Portfolio publisher | Herald identity supplementary (fans-over-transactions principle) |
| Bivins, *Public Relations Writing* | PAYWALL | McGraw-Hill publisher | `press_kit.md` press-release + press-kit discipline |
| PRSA institutional materials | Partial FREE | https://www.prsa.org/ | `press_kit.md` embargo + professional standards supplement |
| Walker, *Media Training Success* | PAYWALL | Author publisher + Amazon | `media_training.md` §9-11 |
| Neil & Bassett, *Media Training Handbook* | PAYWALL | Practitioner reference publisher | `media_training.md` §9-11 |
| **SPJ Code of Ethics** | **FREE** | https://www.spj.org/ethicscode.asp | `media_training.md` §12 on-record standards |
| **AMEC Barcelona Principles 3.0 + Integrated Evaluation Framework** | **FREE** | https://amecorg.com/barcelona-principles/ | `pr_analytics.py` Barcelona + AMEC grounding (already institutionally cited + baked at code level via ave_refuse) |
| Watson & Noble, *Evaluating Public Relations* | PAYWALL | Kogan Page publisher | `pr_analytics.py` §15 attribution discipline academic pair |
| Michaelson & Stacks, *A Professional and Practitioner's Guide to Public Relations Research, Measurement, and Evaluation* | PAYWALL | Business Expert Press | `pr_analytics.py` §15 attribution discipline academic pair alternative |
| **Poynter Institute materials** | Partial FREE | https://www.poynter.org/ | `media_training.md` supplementary |

**Recommendation for the operator per §8.8b decision point:**

- **PARTIAL free-only builds possible today:**
  - `media_training.md` §12 SPJ on-record standards can be built from FREE SPJ Code of
    Ethics + Poynter free materials. §9-11 need Walker + Neil/Bassett paywall books.
  - `pr_analytics` Barcelona + AMEC grounding is ALREADY built (institutional-source
    cited; baked at code level via ave_refuse). Academic-textbook pair (Watson/Noble +
    Michaelson/Stacks) further-strengthens but not blocking.
- **HIGHEST-LEVERAGE Touch-2 candidate for herald:** **Scott 2020** — grounds identity +
  media-relations + press-kit (3 herald assets + identity from single book placement).
  Best cross-agent-leverage per §8.9 within herald's plan.
- **Full Touch-2 requires operator to place 5-6 paywalled books in `Agents/_books/`:**
  Scott 2020 (highest leverage — 4x); Scott 2011 (newsjacking depth for media_relations);
  Bivins (press_kit press-release discipline); Walker OR Neil/Bassett (media_training
  §9-11); Watson & Noble OR Michaelson/Stacks (pr_analytics academic pair).
- **Route-D-only fallback:** herald keeps its 1 local utility (pr_analytics.py with
  baked ave_refuse) as agent-local; §0.6 flags stay Tier B (framework-cited but not
  book-page-cited). Notable exception: AVE refusal is ALREADY structurally enforced
  regardless of book placement — that's the strongest single-rule grounding across the
  fleet.

The operator picks the path per §8.8b when Touch-2 opens.

---

## Cross-Agent Book Coordination (§8.9 "extract once, use twice")

| Book | Grounds for herald | Grounds for other agents | Coordination note |
|---|---|---|---|
| **Scott, D. M. (2020), *The New Rules of Marketing and PR*** | `media_relations.md` (§1) + `press_kit.md` (§2 partial) + `media_training.md` (§3 partial via §I2 real-time-PR framing) + **herald identity file** | Potentially future Brand Studio content-marketing skills (marketing-adjacent scope) | **4-way SHARED within herald + potential 5th-way to future Brand Studio.** Highest cross-agent-leverage single book placement in herald's plan. §8.9 extract-once-use-4x. |
| Scott, D. M. (2011), *Newsjacking* | `media_relations.md` (§1 newsjacking depth) | — | herald-specific |
| Bivins, *Public Relations Writing* | `press_kit.md` (§2 press-release discipline) | — | herald-specific |
| Walker OR Neil & Bassett (media-training corpus) | `media_training.md` (§3 core framework) | — | herald-specific |
| **SPJ Code of Ethics** | `media_training.md` (§12 on-record standards) | Potentially future Executive Office / echo (executive spokesperson prep uses SPJ standards) | Cross-department when echo's spokesperson-prep scope activates |
| **AMEC + Barcelona Principles 3.0** | `pr_analytics.py` (§14 institutional grounding) | Potentially future Growth & Partnerships department (marketing measurement uses complementary but distinct frameworks) + future Risk & ESG (ESG reporting frameworks reference AMEC-adjacent standards) | Institutional canonical; single source used across departments where PR-adjacent measurement applies |
| Watson & Noble OR Michaelson & Stacks | `pr_analytics.py` (§15 attribution academic pair) | Potentially cross with future marketing-attribution scope | pr_analytics-specific pair; alternative-book-choice acceptable |

---

## Meta

- **Touch-1 built:** 2026-07-31.
- **Touch-2 status:** waiting on book placement in `Agents/_books/` OR execution of §8.8a
  3-attempt free-source search for Scott's works (unlikely FREE — Wiley publisher; but
  worth confirming).
- **HIGHEST-PRIORITY Touch-2 candidate:** Scott 2020 — highest cross-agent-leverage
  single book placement (grounds 4 herald artifacts). §8.9 extract-once-use-4x.
- **HIGHEST-PRIORITY partial-free Touch-2 candidate:** `media_training.md` §12 SPJ on-record
  standards from FREE SPJ Code of Ethics — one Route-D-asset section can ship without
  paywall placement.
- **UNIQUE strength:** AVE refusal (§4 Barcelona Principle 5) is ALREADY structurally
  enforced at code level via `pr_analytics.ave_refuse()`. This is the STRONGEST single-rule
  grounding across the P&C + Comms & PR builds so far — cited (Barcelona) + enforced
  (code-level NotImplementedError). No book placement needed for enforcement; book
  placement further-strengthens academic case but doesn't change runtime behavior.
- **Refresh trigger:** any new skill added to herald, any change to a skill's Principles
  section introducing a new numeric/heuristic judgment, or completion of a Touch-2 book
  campaign.
