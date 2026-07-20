---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: quinn (Engineering / QA)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds quinn's judgments in real, citable sources. Until the operator supplies books, quinn's rubrics are flagged **reasoning-based, not formula-verified** (rule 0.6).

## Candidate sources (operator to supply; suggestions, not purchases quinn made)

1. **A software testing / test-design text** — grounds tier definitions, test-design techniques (boundary/partition analysis), and what "meaningful assertion" means beyond reasoning. Serves test-strategy.
2. **The shared statistics source** (already wanted by vista/sentinel/nate/kai/rio — see PROJECT-HANDOFF §7) — grounds flaky-test detection (retry probabilities, false-pass rates) and coverage-floor recommendations with actual math instead of convention. Serves test-strategy + regression-map. **Shared, not quinn-specific — build once at the OS level.**
3. **A security/adversarial testing text** — grounds charter-enforcement's triage severity ordering when cypher/aegis findings compete. Could be shared with aegis/cypher at their build.

## Currently flagged as reasoning-based (rule 0.6)

- The 70/20/10 pyramid ratio (marketplace-sourced convention, not derived).
- Any coverage-floor recommendation quinn offers when config is unset.
- Findings-triage severity ordering in charter-enforcement.
- Watchlist entries in the regression map (explicitly non-gating for this reason).

## Extraction protocol (when books arrive)

Formulas/thresholds extracted with page-level citations into this folder; affected skills updated to cite them; the reasoning-based flags removed only where a citation replaces them.
