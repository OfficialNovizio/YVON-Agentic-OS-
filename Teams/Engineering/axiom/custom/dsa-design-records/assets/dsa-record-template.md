# DSA Design Record — DSR-[NNN] — [choice name]

> ADR for algorithms/data structures. Append-only; a reversal is a new DSR citing this one. Credit: pattern from dev/architecture-decisions.

**Status:** proposed / accepted / superseded-by DSR-NNN · **Date:** YYYY-MM-DD · **Reviewed by:** [raj/dana/…]

## Operations that matter (start here)
| operation | frequency | latency sensitivity |
|---|---|---|
| [lookup / range / insert / ordered-iter / delete] | [hot/warm/cold] | |

## Options considered (2+)
| option | time (worst / amortized) | space | justifying invariant | notes |
|---|---|---|---|---|
| A: [structure] | | | [why the bound holds] | |
| B: [structure] | | | | |

## Decision
[chosen option] because [the operation mix + constraints that select it].

## Trade-offs kept (the reasons someone will later want to change this)
- [cost of the chosen structure — e.g., no ordering / memory overhead / rebalance cost]

## Complexity summary (the claim, checkable)
- [operation]: O(…) [worst], O(…) [amortized] — because [invariant]
- Where constants / real-n dominate asymptotics: [note → performance-profiling ref]

## Supersedes / superseded by
[DSR-refs]
