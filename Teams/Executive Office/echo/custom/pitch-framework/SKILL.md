---
name: pitch-framework
type: custom
status: built by merge (not a pure marketplace copy) — translated from Chinese source, stripped of an external-CLI dependency
sources_referenced:
  - pitch-deck (skillsmp.com, TeamWiseFlow/wiseflow, 8,265★) — workflow skeleton (mode selection, context gathering,
    structure templates, HTML deck build, delivery), translated from Chinese
    https://skillsmp.com/creators/teamwiseflow/wiseflow/addons-officials-skills-pitch-deck
  - pitch-deck-visuals (skillsmp.com, openakita/openakita, 1,825★) — content rules (12-slide framework, 1-6-6 rule,
    typography/color/layout, chart guidance, investor-question mapping, common mistakes), with all `inference.sh`
    CLI-specific commands stripped out per the portability principle
    https://skillsmp.com/creators/openakita/openakita/skills-agent-browser-skills-pitch-deck-visuals
fulfills_catalog_entry: yc-pitch-framework (VYON_Skills_Catalog_Full_v2.html, echo/Executive Office) — renamed pitch-framework
assigned_agent: echo (Executive Office / Investor Relations)
portable: true — no external CLI dependency, no hardcoded venture names; produces self-contained HTML output
date_added: 2026-07-02
---

## Introduction

pitch-framework turns a fundraising or partnership ask into a structured, investor-ready presentation — either a full slide deck or the underlying narrative/structure if the operator just wants the content. It merges a complete deck-building workflow with a separate source's slide-design and content discipline, translated and stripped of any dependency on a specific paid external tool.

## Purpose

Give echo a repeatable way to go from "we need a pitch" to a finished, professionally structured deck (or its outline), matched to the actual audience and purpose — investor pitch, partnership proposal, or customer demo — without reinventing slide structure or design judgment each time.

## When to Use

Triggers: "investor deck," "pitch update," "structure the pitch," "fundraise narrative," "partnership proposal," "customer demo deck," or converting an existing `.ppt`/`.pptx` into a refreshed presentation.

## Structure / Protocol

```
Confirm mode (new deck / convert existing PPTX / refine existing HTML deck)
  -> Gather context (purpose, audience, length, content readiness)
    -> Select structure template matching the purpose
      -> Apply slide design discipline (framework, 1-6-6 rule, chart rules)
        -> Build self-contained output
          -> Deliver with a summary of choices made
```

## Instructions

### Phase 1 — Confirm Mode

Ask which applies:
- **New deck** — operator has a topic, bullet points, or a full draft.
- **Convert existing** — operator has a `.ppt`/`.pptx` file to bring into this format.
- **Refine existing** — operator already has a deck in this system and wants it improved.

### Phase 2 — Gather Context

Ask only what's necessary:
- **Purpose**: investor pitch / partnership proposal / customer demo / case review.
- **Audience**: investors / potential partners / customers / internal team.
- **Length**: short (5-10 slides) / medium (10-15) / long (15-20, and flag that 20+ hurts attention).
- **Content readiness**: full draft already written / rough bullet points / topic only.

If the operator already has content, have them paste it before discussing style — content first, presentation second.

### Phase 3 — Select Structure Template

Match the purpose to a structure:

**Investor Pitch** (target ~12 slides, ~6 minutes total):
1. Title (company name, tagline)
2. Problem (pain point, quantified with data + source)
3. Solution (the product/service in one sentence)
4. Demo/Product (screenshot or walkthrough)
5. Market Size (TAM → SAM → SOM, shown as concentric circles, not a pie chart)
6. Business Model (how revenue is made)
7. Traction (growth metrics, customers, milestones — an up-and-to-the-right chart, not just numbers)
8. Competition (a 2×2 positioning map, never a feature-comparison table — it reads as defensive)
9. Team (max 4 people; name, title, one relevant credential each)
10. Financials (revenue projections, unit economics)
11. The Ask (amount, use of funds, timeline)
12. Contact (next steps)

**Partnership Proposal**:
1. Title (proposal name, date)
2. Context (why this partner, why now)
3. Who we are (company summary, core strengths)
4. Proposed structure (model, process)
5. Mutual benefit (what the partner specifically gains)
6. Track record (relevant past results)
7. Key terms (high-level, not a full contract)
8. Next steps (clear call to action)

**Customer Demo / Product Introduction**:
1. Title (product name, core value proposition)
2. Their pain point (scenario-based)
3. Our solution (feature highlights)
4. Proof (case studies / data)
5. Pricing (clear and simple)
6. FAQ
7. Get started (call to action)

### Phase 4 — Apply Slide Design Discipline

Regardless of which template, every slide follows:

- **The 1-6-6 rule**: 1 idea per slide, max 6 words per bullet, max 6 bullets per slide. If more text is needed, add a slide — never shrink the font to fit.
- **Typography**: sans-serif only; title ≤6 words; one key stat per slide when applicable; always cite data sources in a caption.
- **Color**: pick dark-background or light-background and commit for the whole deck; one accent color; max 2-3 colors in any single chart; never gradients on text.
- **Layout**: consistent margins; left-align body text (never centered); one visual per slide; slide numbers.
- **Chart selection**: line chart for growth over time, bar chart for category comparisons, concentric circles only for TAM/SAM/SOM, 2×2 matrix only for competitive positioning, single big number for a key-metric highlight. **Never use a pie chart** — hard to read, reads as unprofessional. Start any Y-axis at 0; label directly on the chart rather than relying on a separate legend.
- **What each investor-pitch slide is really answering** (keep this in mind while drafting content, not just design): Problem → "is this real and worth paying to solve?" Solution → "is this meaningfully better than the status quo?" Market → "is this big enough to matter?" Traction → "is this actually working?" Team → "can these people execute?" Ask → "is this a reasonable deal?"

### Phase 5 — Build

Output as a single self-contained file (inline CSS/JS, no external dependencies) unless the operator explicitly wants a multi-file project:
- Every slide fits one viewport, no internal scrolling — if content overflows, split into another slide rather than shrinking type.
- Include keyboard (arrow keys/space), touch/swipe, and scroll-wheel navigation, plus a progress indicator.
- Respect `prefers-reduced-motion`; keep any entrance animation purposeful, not decorative for its own sake.
- Use semantic HTML structure for accessibility.

If converting from an existing `.ppt`/`.pptx`: extract slide titles, body text, speaker notes, and images first (see Fallback for the extraction script), preserve slide order and speaker notes, then proceed through Phase 3 onward with the extracted content.

### Phase 6 — Deliver

Summarize what was produced: file path/name, structure template used, slide count, and any content gaps that were flagged rather than guessed at.

## Common Mistakes to Flag (in review, or self-check before delivering)

- Too many slides (20+) — loses attention; cap around 12-15.
- Wall of text — apply the 1-6-6 rule.
- Feature-comparison table against competitors — looks defensive; use a 2×2 positioning map instead.
- Pie charts — never.
- No cited data sources — looks fabricated.
- Team slide with 8+ people — unfocused; cap at 4, most relevant only.
- Inconsistent design across slides — same colors/fonts/margins throughout.
- No "Ask" slide on an investor pitch — state the amount, use of funds, and timeline explicitly.
- Vanity metrics ("1M visits" with no conversion context) — show revenue, active users, or retention instead.
- Over-indexing on product demo — this is a business pitch, not a product tour; cap product-focused slides at 2.

## Principles

- Content before style — never start on visual design before the actual narrative/content is settled.
- No fabricated data or sources — if a number isn't provided, flag it as missing rather than inventing a plausible one.
- One committed visual direction per deck — don't mix styles slide to slide.
- Never solve overflow by shrinking text below a readable size — split into more slides instead.
- Every generated deck must run standalone in a browser with no external service dependency.

## Fallback

- **PPTX conversion script not yet built.** The source skill this was merged from includes a `scripts/pptx_extract.py`-style tool for pulling slide titles, body text, speaker notes, and image paths out of an existing `.pptx` file. That script was not built or tested in this pass (it wasn't discussed/approved per the build process) — flag this to the operator rather than claiming the capability exists. Until it's built, if a `.pptx` needs converting, ask the operator to paste the content manually, or raise building the extraction script as a separate discussion first.
- If the operator doesn't know their audience or purpose yet, don't guess a template — ask, since the wrong structure (e.g. an investor structure for a customer demo) undermines the whole pitch.
- If content is genuinely incomplete (e.g. no traction data yet), say so explicitly in the delivered output rather than filling the gap with a placeholder that looks like real data.

## Boundaries with Other echo Skills

- pitch-framework produces the deck/narrative structure; `investor-update-generator` (marketplace) checks an investor *update* against best practices — a different artifact (recurring update vs. one-off pitch).
- The canonical pitch story this skill draws from should stay consistent with whatever `pitch-narrative` (custom, not yet built) maintains as the versioned narrative source of truth, once that skill exists.
