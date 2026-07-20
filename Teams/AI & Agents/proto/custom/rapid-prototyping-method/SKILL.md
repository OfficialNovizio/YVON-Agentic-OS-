---
name: rapid-prototyping-method
type: custom
status: built from scratch
sources_referenced: []  # catalog's rapid-prototyping (marketplace) — search 2026-07-10 found no verbatim agent-skill source; classic product-prototyping method adapted to agent prototypes, honest custom
fulfills_catalog_entry: rapid-prototyping (catalog listed marketplace; built custom after search)
assigned_agent: proto (AI & Agents / Prototyping)
portable: true
date_added: 2026-07-10
---

# Rapid Prototyping Method

## Introduction
Fidelity discipline inside the cage: build the LOWEST-fidelity prototype that can answer the manifest's hypothesis, timebox hard, decide rather than polish. The catalog's three-line marketplace entry, built out custom for agent prototypes specifically.

## Purpose
Prototypes fail two ways: too crude to answer the question, or so polished they become the product prematurely (and then nobody wants to archive them — sunk cost sabotages the verdict). Right-sized fidelity protects both the answer and the verdict.

## When to Use
- Choosing what to actually build after the manifest + criteria exist.
- Mid-prototype scope creep ("while we're at it, let's also...").
- Timebox check-ins.

## Structure / Protocol
FIDELITY LADDER (pick the lowest rung that can answer the hypothesis):
1. **Paper** — skill drafts + trace walkthroughs (no execution). Answers: "is the routing/method coherent?"
2. **Wizard-of-Oz** — a human/existing agent plays the missing part. Answers: "is the output valuable?"
3. **Single-skill** — one real skill in the cage, rest stubbed. Answers: "does the core mechanism work?"
4. **Full-shape** — near-complete agent in the cage. Answers: only integration questions; requires justification for why rungs 1–3 couldn't answer.
→ TIMEBOX (per rung: `<FILL_IN: suggested 1–2 days paper, 3–5 single-skill — reasoning-based>`, always inside the manifest expiry) → BUILD (that rung only) → CHECK (can it answer the hypothesis yet? yes → stop building, start measuring) → DECIDE (feed the verdict; don't polish).

## Instructions
1. Justify the rung in the manifest: "why can't one rung lower answer this?" — the default answer to fidelity questions is DOWN.
2. Scope creep test: does the addition change what the frozen criteria can measure? No → it's polish → refused.
3. Stubs are labeled loudly (a stubbed capability that looks real contaminates the eval).
4. Timebox breach → automatic fidelity review: usually the hypothesis is too big (split it — one hypothesis per prototype, kit rule).
5. Nothing built here skips frontmatter/provenance, even paper drafts (kit rule 3).

## Output Format
Fidelity justification (manifest line), rung-labeled build artifacts, timebox log.

## Principles
- Lowest fidelity that answers the question; the default direction is down.
- Timebox the rung, not just the prototype.
- Decide, don't polish — polish is the verdict's enemy.

## Fallback
Hypothesis genuinely needs rung 4 (integration-shaped question)? Fine — say so in the manifest, and expect the verdict to weigh the bigger investment against stricter criteria. Never drift up rungs silently.

## Boundaries with Other Skills
- Operates strictly inside agent-prototype-kit's cage, against eval-first-design's frozen criteria, ending in promote-or-archive-verdict.
- Wizard-of-Oz runs that borrow live agents need those agents' consent-equivalent: a registered plan (Rail 1 applies to prototypes too).
