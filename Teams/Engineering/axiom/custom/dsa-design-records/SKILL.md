---
name: dsa-design-records
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 "dsa-design-records (structure choice, complexity, trade-offs — ADR-for-algorithms)"
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — algorithm/DSA skills found are tutoring-oriented (LeetCode helpers), not a design-record discipline; kept custom, modeled on dev's architecture-decisions ADR pattern
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
portable: true — the record format is language-agnostic; implementations live in the codebase per stack-profile
includes: assets/dsa-record-template.md
date_added: 2026-07-09
---

## Introduction

dsa-design-records is the ADR pattern applied to algorithm and data-structure choices: when a choice is load-bearing (the data structure behind a hot path, the algorithm whose complexity decides whether the system scales), axiom records the options, their complexity, the trade-offs, and the decision — so nobody rips out the B-tree for a hash map without confronting why the range queries needed it. It is dev's architecture-decisions discipline, specialized to the layer where Big-O lives.

## Purpose

Algorithmic choices rot into folklore faster than architectural ones because they're "just code" — someone swaps a structure for a "simpler" one and reintroduces the O(n²) the original avoided. A design record carries the complexity reasoning forward, so a change has to answer the original constraints, not just look cleaner.

## When to Use

Triggers: "which data structure," "what algorithm," "why is this a heap/trie/B-tree," a hot-path structure choice, a choice with non-obvious complexity trade-offs, and before any structure/algorithm expensive to change later.

## Structure / Protocol

```
A load-bearing DSA choice arises
  -> Draft the record (assets/dsa-record-template.md):
     the operations that matter (with frequencies) · options considered (2+) ·
     complexity per operation (time + space, worst + amortized) · the decision · the trade-offs kept
    -> Complexity claims carry their reasoning (why O(log n), not just "it's O(log n)")
      -> Review with the consumer (raj for backend hot paths, dana for storage structures)
        -> Log (append-only, like ADRs); a reversal is a new record citing the old
```

## Instructions

1. **Start from the operations, not the structure.** List what the code actually does and how often — lookups vs range queries vs insertions vs ordered iteration. The right structure falls out of the operation mix; choosing a structure first and forcing the operations onto it is the common error.
2. **Two options minimum, with real complexity.** Each option's time and space, worst-case AND amortized where they differ (a dynamic array's amortized-O(1) append and its O(n) worst-case resize are both true and both matter). One-option records are rationalizations.
3. **Complexity claims carry reasoning.** "O(log n) because the tree stays balanced by [invariant]" — not a bare bound. A bound without its why can't be checked and rots into a wrong assumption. Where the constant factors or real-n behavior matter more than the asymptotic class, say so (measure-don't-guess ties to performance-profiling).
4. **Trade-offs are kept, not hidden.** The chosen structure's costs (a hash map's no-ordering, a trie's memory) go in the record — the reasons someone will later want to change it, written down so they re-confront them.
5. **Review with the consumer.** A structure behind raj's API or in dana's storage gets that agent's review — the complexity that's fine in isolation may be wrong under the real access pattern.
6. **Append-only; supersede, never delete.** A changed choice is a new record citing the old, with the new operation mix or constraint that forced it. The history is why the current structure is right.

## Output Format

The record per `assets/dsa-record-template.md` + its ledger entry. Complexity stated as time/space, worst/amortized, with the invariant that justifies it.

## Principles

- **Operations first, structure second** — the access pattern chooses the structure.
- **Two options, real complexity** — worst and amortized where they differ; one-option records are rationalizations.
- **Every bound carries its why** — an unjustified O() rots into a wrong assumption.
- **Trade-offs are written, not hidden** — the costs are the reasons for future change.
- **Append-only; supersede citing the old** — the history explains the present.
- **Asymptotics aren't everything** — where constants or real-n dominate, measure (performance-profiling).

## Fallback

- Choice is trivial / not hot-path → no record needed; records are for load-bearing choices, not every `list` vs `set`.
- Complexity genuinely unknown (novel structure) → state the analysis honestly with its uncertainty, and pair with a performance-profiling benchmark rather than a fabricated bound (rule 0.6).
- Consumer disagrees on the access pattern → resolve the pattern first (it decides the structure); record the disagreement in trade-offs if it persists.

## Boundaries with Other Skills

- **dev/architecture-decisions**: the parent pattern; DSA records are its algorithm-layer specialization, and a DSA choice with system-wide impact escalates to a full ADR.
- **complexity-analysis** (sibling) supplies the bounds this record states; **performance-profiling** (sibling) supplies the measurements when asymptotics aren't the whole story.
- **raj / dana**: the primary consumers and reviewers — hot-path structures and storage structures respectively.
- **quinn**: a structure change touching a fragile area still passes the gate; complexity regressions are a review concern.
