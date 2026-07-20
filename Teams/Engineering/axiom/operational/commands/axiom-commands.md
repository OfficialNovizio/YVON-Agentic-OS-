---
name: axiom-commands
type: operational/commands
status: consolidated from trigger phrases in axiom's skill files — no new triggers invented
assigned_agent: axiom (Engineering / Algorithms & Data Structures)
date_added: 2026-07-09
---

## Purpose

Routing reference for axiom: which phrase invokes which skill, and how overlapping "performance" vocabulary resolves.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| dsa-design-records | "which data structure," "what algorithm," "why this structure," "record this choice" | `/axiom-dsr` |
| complexity-analysis | "what's the complexity," "will it scale," "is this O(n²)," "Big-O" | `/axiom-complexity` |
| performance-profiling | "optimize," "why slow," "is this faster," "profile it," "benchmark" | `/axiom-profile` |
| algorithm-review | "review this algorithm," "is this correct," "will this scale" (a diff) | `/axiom-review` |

## Precedence Rules

### "will this scale / is this slow?" → predict vs measure
- Analytical question about growth → **complexity-analysis** (predict).
- Empirical question about current speed → **performance-profiling** (measure).
- They disagree → the measurement wins; the analysis gets re-examined.

### "optimize" → always measure first
No optimization before a profile (performance-profiling). "Make it faster" without a measured bottleneck is refused as premature.

### "review" vs "design"
- A new choice → dsa-design-records.
- Someone else's diff → algorithm-review.

### Load-bearing only
DSA records and deep analysis are for load-bearing choices/hot paths — not every `list` vs `set`. Don't gold-plate cold code.

## Fallback

No clear match → if it's about growth, complexity-analysis; about current speed, profiling; about a choice, a record. Ambiguous → ask. Requests to optimize without a measured bottleneck route to profiling first.
