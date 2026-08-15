<!--
Logical Touch-1 placeholder for beacon (Comms & PR / Investor Comms) per §8.1.

Purpose: documents future `Shared OS/logical/` Route-D asset placements that will
downgrade beacon's Tier B §0.6 flags to Tier A. Not an active build surface today —
placeholder for the extraction pass when the referenced books are placed in
`Agents/_books/`.

Cross-references §8.9 extract-once-use-twice: each future logical script grounds
≥2 skills across departments where possible.
-->

# beacon — Logical Layer (Placeholder)

> **Status:** §8.1 Touch-1 placeholder. beacon runs on cited-rubric Tier B today
> (all 3 skills §0.6-flagged). This directory reserves the future Route-D asset
> placements for §8.9 extract-once-use-twice + Tier B → Tier A downgrade.
>
> **Not an active build surface.** No scripts owned here. Everything below is
> planning for a future extraction pass, not current runtime behavior.

## Placement Plan

Three future assets will live in `Teams/Shared OS/logical/` (not this directory)
per §13.1 Shared OS inherited-not-owned pattern. Placement order recommended:

### 1. `Shared OS/logical/crisis_comms.md`

**Grounds:** beacon's `crisis-comms` skill + any future cross-department crisis
scope (e.g., a Cybersecurity crisis-response skill for warden or bastion).

**Book prerequisites** (must be placed in `Agents/_books/` first):

- Fink, Steven (1986, updated 2013). *Crisis Communications: The Definitive
  Guide to Managing the Message.* McGraw-Hill. ISBN 978-0071799225.
- Coombs, W. Timothy (multiple editions). *Ongoing Crisis Communication:
  Planning, Managing, and Responding.* Sage. (Any recent edition.)
- Smith, Judy (2012). *Good Self, Bad Self.* Free Press.

**Content outline** (Route D cited rubric):

- Fink 5-stage lifecycle (Prodromal → Acute → Chronic → Resolution → Learning)
  with book-page-cited operational discipline for each stage
- Coombs SCCT (Situational Crisis Communication Theory) attribution-response
  matching table with book-page-cited victim/accidental/preventable examples
- Smith practitioner discipline for first-30-minutes + single-spokesperson +
  correction-request handling
- Cross-reference to Barcelona Principles 3.0 (measurement discipline inherited
  from herald's `pr_analytics`)

**Downgrade impact:** `crisis-comms` §0.6 flag → Tier A.

### 2. `Shared OS/logical/investor_cadence.md`

**Grounds:** beacon's `investor-cadence` skill + any future Executive Office
investor-facing scope (e.g., echo's pitch-materials skill, marcus's
strategy-communication skill).

**Book prerequisites**:

- Buffett, Warren — collected annual letters 1977–present. Berkshire Hathaway.
  (FREE at berkshirehathaway.com/letters; can be placed as a curated collection
  in `Agents/_books/`.)
- Larcker, David F. & Tayan, Brian (2020, 3rd ed.). *Corporate Governance
  Matters: A Closer Look at Organizational Choices and Their Consequences.*
  Pearson. ISBN 978-0136660026.

**Content outline** (Route D cited rubric):

- Buffett-discipline structure with book-page-cited excerpts (candor + no-jargon
  + name-misses-before-hits + no-euphemism + close-loop with prior letters)
- Larcker & Tayan governance-academic grounding for IR + governance intersection
- NIRI (National Investor Relations Institute) standards summary
- SEC Regulation FD (17 CFR § 243) regulatory-fence reference
- Cross-reference to Barcelona Principles 3.0

**Downgrade impact:** `investor-cadence` §0.6 flag → Tier A. Same asset also
supports future echo pitch-materials work (§8.9 extract-once-use-twice).

### 3. `Shared OS/logical/data_room_discipline.md`

**Grounds:** beacon's `data-room-discipline` skill + any future echo pitch-
materials-with-evidence-backing skill + any future Governance precedent-audit
scope.

**Book prerequisites**:

- Feld, Brad & Mendelson, Jason (2019, 4th ed.). *Venture Deals: Be Smarter
  Than Your Lawyer and Venture Capitalist.* Wiley. ISBN 978-1119594826.
- Berkus, Dave — curated Berkonomics essays + due-diligence checklists (can be
  placed as a curated collection in `Agents/_books/`).

**Content outline** (Route D cited rubric):

- Feld & Mendelson VC-DD-expectations with book-page-cited data-room structure
  + versioning discipline
- Berkus practitioner discipline for early-stage angel-DD + Berkus Method
  reference for backing-document expectations
- NVCA Model Legal Documents + DD Checklist institutional reference
- AICPA AU-C Section 230 (Audit Documentation) institutional reference for
  audit-workpaper retention discipline
- SEC EDGAR public-filing document standards
- Cross-reference to Reg FD (17 CFR § 243) for material-info tagging discipline

**Downgrade impact:** `data-room-discipline` §0.6 flag → Tier A.

## §8.9 Extract-Once-Use-Twice Coordination

Cross-agent book-usage tracker for beacon's future logical assets:

| Book | Uses across fleet | Current status |
|---|---|---|
| Fink 2013 | crisis-comms (beacon) + future Cybersecurity crisis-response (warden or bastion) if built | Not yet placed |
| Coombs (multiple editions) | crisis-comms (beacon) — single-use unless a future comms-academic-anchored skill is added | Not yet placed |
| Smith 2012 | crisis-comms (beacon) + herald identity-candidate-corpus (identified during herald identity pick as one of 3 candidates; Scott was picked but Smith corpus tracked here for cross-use) | Not yet placed |
| Buffett letters (1977–present) | investor-cadence (beacon) + future echo pitch-materials (Buffett letters ground both investor cadence + pitch narrative) | Not yet placed |
| Larcker & Tayan 2020 | investor-cadence (beacon) + future precedent (Governance) if built with academic grounding | Not yet placed |
| Feld & Mendelson 2019 | data-room-discipline (beacon) + future echo pitch-materials-with-evidence-backing + potential board (Governance) DD-oversight skill if built | Not yet placed |
| Berkus corpus | data-room-discipline (beacon) — single-use unless a future early-stage-investor-oriented skill is added | Not yet placed |

## Not Owned Here (explicit)

Per §13.1 Shared OS inherited-not-owned pattern:

- Barcelona Principles 3.0 discipline — inherited from herald's `pr_analytics`
  (owned in herald's operational layer + `pr_analytics.ave_refuse()`); beacon
  applies but does NOT own
- No-corporate-euphemism (McCord discipline) — inherited from herald identity +
  signal (owned in herald identity anchor + signal principles); beacon applies
  but does NOT own
- Single-designated-spokesperson base discipline — inherited from herald's
  `media-training` (owned in herald's operational layer); beacon extends for
  crisis-context + investor-Q&A but does NOT own base
- Aggregate-only at publication surface — inherited from P&C precedent (owned
  in hire + maslow + grove + merit principles); beacon applies but does NOT own
- Individual crisis HARD BOUNDARY — Universal Principle 3 (owned in Shared OS
  Universal Principles); beacon applies but does NOT own

## Not Required Today

- **No scripts.** All 3 beacon skills are Route D (cited rubrics + templates);
  matches signal's 0-scripts posture. Future logical assets (above) are Route D
  cited rubrics, NOT scripts.
- **No Python/shell execution.** Not required by any beacon skill today.
- **No second model.** Not required by any beacon skill today.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any of the book prerequisites placed in
  `Agents/_books/`; or any beacon skill upgraded past Tier B; or any
  cross-department skill added that would use one of the listed books.
