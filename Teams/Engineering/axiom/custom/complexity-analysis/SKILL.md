---
name: complexity-analysis
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; the analytical core plan §3 implies under axiom's "complexity, trade-offs"
marketplace_search: 2026-07-09 — Big-O/complexity skills found are educational explainers; kept custom as a rigor-and-honesty discipline bound to axiom's records and quinn's gate
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
portable: true — complexity is math, language-agnostic
includes: (no asset — method skill)
date_added: 2026-07-09
---

## Introduction

complexity-analysis is axiom's rigor: honest time and space bounds — worst, average, amortized — for the algorithms the department ships, with the reasoning that justifies each bound and the honesty to say when the asymptotic class is the wrong thing to optimize. It supplies the numbers dsa-design-records states and flags the algorithmic regressions code review should catch.

## Purpose

"It's fast enough" is where scaling problems hide. An O(n²) that's fine at n=100 melts at n=100,000, and nobody noticed because nobody analyzed it. Rigorous complexity analysis makes the scaling behavior explicit before production finds it — and, equally, stops premature optimization of an O(n) that runs on n=10.

## When to Use

Triggers: "what's the complexity," "will this scale," "is this O(n²)," a nested loop over request-sized data, a recursive call, a review flag on algorithmic cost, and any dsa-design-record needing its bounds.

## Structure / Protocol

```
An algorithm / code path to analyze
  -> Identify the input(s) whose size drives cost (n, and any second dimension m)
    -> Count the dominant operations as a function of n (loops, recursion depth × work, structure ops)
      -> State time: worst / average / amortized (where they differ, all that matter)
         State space: auxiliary + input, incl. recursion stack
        -> Justify each bound with the reasoning (the recurrence, the loop nesting, the invariant)
          -> Reality check: does the asymptotic class actually dominate at THIS system's n?
             (small n → constants win → route to performance-profiling, don't over-optimize)
```

## Instructions

1. **Name the input dimension(s).** Cost is a function of something — request count, payload size, graph nodes×edges. Two-dimensional inputs (n items, m each) get both; collapsing them hides the real cost.
2. **Worst, average, amortized — the ones that matter.** A hash lookup is average-O(1), worst-O(n) under collisions; a quicksort is average-O(n log n), worst-O(n²). State the ones that bear on the decision, with the conditions that trigger the bad case — the worst case that "never happens" is what an adversary triggers (ties to cypher's DoS class).
3. **Space counts the stack.** Auxiliary space includes recursion depth; an elegant recursion can be O(n) space that a loop makes O(1). Say so.
4. **Justify, don't assert.** Every bound carries its derivation — the recurrence solved, the loops counted, the amortization argument. An asserted bound is uncheckable and rots (dsa-design-records' rule).
5. **Asymptotics honesty.** Big-O describes large n. If this system's n is small, or the constant factors dominate, say the asymptotic improvement isn't worth it and route to performance-profiling for the real measurement. Premature optimization of cold paths is a cost, not a virtue (dev's boring-is-a-feature).
6. **Flag regressions.** A change that worsens a hot path's complexity class (O(log n) → O(n)) is a review finding, surfaced to dev's code review even if it "passes tests" — tests at small n won't catch it.

## Output Format

```
## Complexity: [algorithm / path]
Input dimensions: [n = …, m = …]
Time: worst O(…) [when: …] · average O(…) · amortized O(…) — because [derivation]
Space: O(…) auxiliary incl. [stack?] — because […]
At this system's n (~[value]): [asymptotic dominates / constants dominate → profile]
Regression? [none / class worsened X→Y → flag to review]
```

## Principles

- **Cost is a function of a named dimension** — collapsing dimensions hides it.
- **State the worst case and what triggers it** — the "impossible" case is an attack (DoS).
- **Space includes the stack** — recursion isn't free.
- **Every bound is derived, not asserted** — unjustified O() is unverifiable.
- **Asymptotics honesty** — small n means measure, not optimize; Big-O is about large n.
- **Complexity regressions are findings** — tests at small n won't catch them.

## Fallback

- Bound genuinely hard to derive (complex recurrence, data-dependent) → give the best honest analysis with its uncertainty and MEASURE (performance-profiling) rather than assert; label reasoning-based (rule 0.6).
- Input distribution unknown → state worst-case and note average depends on distribution; don't assume uniform silently.
- "Fast enough" claimed without analysis → provide the analysis; "fast enough at current n" is a valid conclusion only once the n and the bound are stated.

## Boundaries with Other Skills

- **dsa-design-records** (sibling) states the bounds this derives; **performance-profiling** (sibling) measures where asymptotics don't settle it.
- **dev/code-review-standards**: complexity regressions route here as review findings.
- **cypher/attack-playbooks**: worst-case triggers axiom identifies are the DoS surfaces cypher tests (L10 unbounded consumption).
- **raj / dana**: hot-path and query complexity are their consumers' concerns.
