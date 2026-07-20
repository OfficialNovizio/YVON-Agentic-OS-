---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: aegis (Engineering / Application Security)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds aegis's judgments in real, citable sources. Until the operator supplies books, aegis's rubrics are flagged **reasoning-based, not formula-verified** (rule 0.6). Much of aegis's method is already sourced from Anthropic's defending-code reference harness (cited in the skills); the books below ground the parts that convention rather than the harness supplies.

## Candidate sources (operator to supply; suggestions, not purchases aegis made)

1. **A secure-coding / application-security text** (e.g., an OWASP-aligned reference) — grounds secure-code-review's category checklist, injection/authz/crypto specifics, and CWE mappings beyond reasoning.
2. **A threat-modeling text** — grounds the STRIDE lens and scoring the imported threat-model skill applies; the harness supplies method, a text grounds the risk-scoring rubric.
3. **A security-triage / severity text** (shared candidate with quinn) — grounds severity recalibration and finding-triage ordering with a real scoring system (CVSS derivation and its limits) instead of convention.

## Currently flagged as reasoning-based (rule 0.6)

- Severity recalibration to business assets (method reasoned; the scoring rubric is convention until sourced).
- secure-code-review's category weighting (which classes to weight when time-boxed).
- "Can't re-break" self-check confidence when cypher isn't built (explicitly labeled weaker than an independent adversary).
- Triage ranking beyond the threat-model's impact×likelihood.

## Extraction protocol (when books arrive)

Formulas/thresholds/rubrics extracted with page-level citations into this folder; affected skills updated to cite them; reasoning-based flags removed only where a citation replaces them. Coordinate the triage/severity text with quinn (shared need).
