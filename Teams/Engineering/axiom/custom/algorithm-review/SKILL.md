---
name: algorithm-review
type: custom
status: built 2026-07-09 (Fable build — 4th skill, fills the review-side gap so axiom's rigor reaches others' code)
based_on_catalog_entry: none — new; the algorithmic specialist pass dev's code-review routes to, parallel to aegis's secure-code-review
marketplace_search: 2026-07-09 — no marketplace skill for algorithmic-correctness review specifically; kept custom, bound to dev's review routing and quinn's gate
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
portable: true — algorithmic correctness is language-agnostic
includes: (no asset — method skill)
date_added: 2026-07-09
---

## Introduction

algorithm-review is axiom's specialist read of a change's algorithmic content — correctness, complexity, edge cases, numerical stability — the pass dev's code-review-standards routes to when a diff contains non-trivial algorithmic logic, just as it routes security-risky diffs to aegis. It's how axiom's rigor reaches code axiom didn't write.

## Purpose

Normal review checks "does it work on the examples." Algorithmic review checks "is it correct for all inputs, does it scale, and does it handle the cases the examples miss" — off-by-ones, empty/singleton/huge inputs, integer overflow, floating-point accumulation, the O(n²) hiding in a nested comprehension. These are the bugs that pass tests and fail in production.

## When to Use

Triggers: dev's code-review routing an algorithm-heavy diff here, "review this algorithm," "is this correct," "will this scale," sorting/search/graph/numeric code, and any change to a structure covered by a dsa-design-record.

## Structure / Protocol

```
Algorithm-heavy diff arrives (dev routing / self-flagged)
  -> CORRECTNESS: does it compute the right thing for ALL inputs, not just the examples?
     invariants hold? termination guaranteed (no infinite loop/recursion)?
  -> EDGE CASES: empty · singleton · duplicate · sorted/reverse · huge · overflow · NaN/precision
  -> COMPLEXITY: time/space via complexity-analysis; regression vs the prior version? (flag)
  -> STRUCTURE FIT: does it match the dsa-design-record, or drift from it? (drift = finding)
    -> FINDINGS: [correctness/edge/complexity/drift] file:line · problem · fix → dev's review + quinn
```

## Instructions

1. **Correctness for all inputs.** Trace the invariant and the termination condition, not just a sample run. An algorithm that's right on the test cases and wrong on the empty input is wrong. Prove the invariant holds across the loop/recursion, or find where it breaks.
2. **Hunt the edge cases the tests skip.** Empty, singleton, all-duplicate, already-sorted, reverse-sorted, maximum-size, integer overflow at boundaries, floating-point accumulation and NaN. These are where algorithmic bugs live; a green test suite that omits them proves little (ties to quinn's meaningful-assertion rule).
3. **Check the complexity, flag regressions.** Run complexity-analysis on the change; if it worsens a hot path's class versus the prior version, that's a finding even with passing tests (small-n tests hide it).
4. **Structure drift is a finding.** If a dsa-design-record covers this structure and the change contradicts it (uses it for an operation it's bad at, or swaps it without a new record), flag the drift — either the record needs updating (a new DSR) or the code is off-design (dev's stack-drift rule, algorithm edition).
5. **Findings are actionable.** `file:line · what's wrong · the fix`, with the failing input or the complexity delta as evidence — the same discipline as dev's and aegis's reviews.
6. **Don't gold-plate.** A correct, adequately-fast algorithm on a cold path doesn't need axiom's ideal structure; flag real problems, not the absence of theoretical perfection (dev's don't-block-on-taste).

## Output Format

```
## Algorithm Review: [change] — routed by [dev ref]
Correctness: [pass / findings — invariant/termination] · Edge cases: [checked list / gaps]
Complexity: [bound · regression vs prior? ] · DSR fit: [matches / drift → DSR-ref]

### Verdict: SOUND / FINDINGS  (→ dev review + quinn gate)
[items: file:line · problem · fix · evidence-input-or-delta]
```

## Principles

- **Correct for all inputs** — invariants and termination, not sample runs.
- **The edge cases are the bugs** — empty/huge/overflow/precision; green tests that skip them prove little.
- **Complexity regressions are findings** — small-n tests won't catch a worsened class.
- **Structure drift is a finding** — off-design code or a stale record; resolve which.
- **Findings are actionable with evidence** — the failing input or the delta.
- **Don't gold-plate cold paths** — flag real problems, not missing perfection.

## Fallback

- No dsa-design-record for the structure → review on universal correctness/complexity grounds; if the structure is load-bearing, recommend a record be created.
- Correctness genuinely hard to prove (heuristic/approximate algorithm) → state what's guaranteed vs best-effort, and require tests that pin the guaranteed properties (route to quinn).
- Diff too large for rigorous algorithmic review → request a split rather than skim (dev's over-broad-diff concern).

## Boundaries with Other Skills

- **dev/code-review-standards**: routes algorithm-heavy diffs here, the way it routes security to aegis; this is specialist depth, not a replacement for dev's per-PR review.
- **complexity-analysis / dsa-design-records** (siblings): supply the bounds and the design-of-record this review checks against.
- **aegis/secure-code-review**: the security-side parallel; a worst-case-complexity finding here that enables DoS is also aegis's concern (cross-route).
- **quinn**: findings feed the gate; algorithmic fragile areas become regression-map entries.
