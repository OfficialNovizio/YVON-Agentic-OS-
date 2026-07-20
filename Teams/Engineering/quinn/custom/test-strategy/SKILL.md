---
name: test-strategy
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: test-strategy (VYON_Skills_Catalog_Full_v2.html, quinn/Engineering) — genericized per rule 0.4b; expanded from catalog protocol into the release-gate mechanism of ENGINEERING-REDESIGN-PLAN §4
marketplace_search: 2026-07-09 skillsmp.com — candidate found (proffesor-for-testing/agentic-qe test-automation-strategy). Its fleet-manager architecture doesn't fit this department's single-QA-gate design; kept custom. Adopted with credit: pyramid ratio default (70/20/10), F.I.R.S.T. test properties, flaky-quarantine-not-delete
assigned_agent: quinn (Engineering / QA)
portable: true — tiers and gate logic are stack-agnostic; runners/frameworks come from the stack-profile; floors and ratios are config
includes: assets/release-gate-matrix.md
date_added: 2026-07-09
---

## Introduction

test-strategy is quinn's quality law: the test pyramid (what kinds of tests, in what proportion), the coverage floors, and the release-gate matrix (which test tiers a change type must pass before it can ship). It is the "quinn's gate" every other Engineering skill references — dev's definition-of-done requires it, and ops will not deploy without it.

## Purpose

Without a strategy, testing is whatever each agent felt like writing — heavy where it's easy, absent where it's needed, slow where it should be fast. The pyramid keeps feedback fast (most tests cheap and low), the floors keep coverage honest, and the gate matrix makes "tested enough to ship" a lookup, not a negotiation.

## When to Use

Triggers: "test strategy," "what tests does this need," "coverage floor," "release gate," "can this ship," "gate check," "is the pyramid healthy," and as the required tier-check inside dev's code-review step 3 and definition-of-done.

## Structure / Protocol

```
A change arrives at the gate
  -> Classify: change type (feature / fix / refactor / config / data-adjacent / security-adjacent)
    -> Look up required tiers in assets/release-gate-matrix.md
      -> Verify: required tiers exist, run green, assert behavior (not just execute)
         + coverage ≥ floors (config) for touched code
         + regression-map check: fragile area touched? → its targeted suite required (sibling skill)
        -> GATE PASS → ops may ship (with its own rollback discipline)
        -> GATE FAIL → named gaps back to the author; no negotiation at the gate
```

## Instructions

1. **Keep the pyramid.** Default shape: ~70% unit / ~20% integration / ~10% end-to-end (marketplace-sourced default, config-overridable per business). An inverted pyramid — E2E-heavy, unit-light — is slow, flaky, and a finding in itself.
2. **Tests must be F.I.R.S.T.** — Fast, Independent, Repeatable, Self-validating, Timely (credit: agentic-qe). A test that needs babysitting, ordering, or a human eyeball on its output doesn't count toward any tier.
3. **Floors are floors.** Coverage floors come from config (`coverage_floors`, per-tier, `<FILL_IN>` until the operator sets them — rule 0.5: quinn does not invent thresholds). Below-floor coverage on touched code = GATE FAIL, no exceptions at the gate; the operator can change the floor, quinn can't.
4. **Gate by lookup.** Classify the change, read the matrix, verify the listed tiers. The matrix is dev+quinn co-owned law (changes to it are ADRs); arguing with the matrix at gate time is routed to dev, not absorbed.
5. **Flaky tests are quarantined, never deleted.** A flaky test is moved to quarantine (tracked in the regression-map's flaky register, with owner and date), and its coverage hole counts against the floor — visible pain, so it gets fixed. Deleting or weakening a test to pass a gate is the review-integrity block (dev's checklist §0) and a gate FAIL.
6. **Assert behavior.** Spot-check that gating tests contain real assertions on outcomes — a suite that runs green because it asserts nothing is a GATE FAIL with the specific empty tests named.

## Output Format

```
## Gate Check: [change] — type: [classification]
Required tiers (matrix): [list] · Present+green: [✓/✗ per tier]
Coverage on touched code: [n% vs floor] · Fragile areas touched: [none / list → targeted suites ✓/✗]
Flaky quarantine impact: [none / holes counted]

### Verdict: GATE PASS / GATE FAIL
[gaps named: tier · file · what's missing]
```

## Principles

- **The gate is a lookup, not a negotiation** — matrix changes are ADRs, not gate-time arguments.
- **Pyramid shape: most tests cheap and low** — inverted pyramids are findings.
- **Floors are operator-set; quinn enforces, never invents or waives them** (rule 0.5).
- **Flaky = quarantined and counted, never deleted** — invisible coverage holes are how things break.
- **Green means asserted** — a test that checks nothing proves nothing.
- **A gate verdict is evidence-backed** — tier runs and coverage numbers attached, or the rule-0.6 flag.

## Fallback

- No coverage floors configured → gate on tier presence + green + assertions only; state loudly that floors are unset and recommend values to the operator (labeled reasoning-based).
- No test infrastructure yet (new business) → minimum viable gate: unit tests on non-trivial logic + one E2E happy path per critical flow, labeled provisional; propose the full matrix to the operator.
- Change type ambiguous → gate at the stricter classification; ambiguity is resolved by dev, not by choosing the easier row.
- Emergency hotfix pressure → the matrix's hotfix row applies (reduced pre-ship tiers, mandatory post-ship completion within a set window, logged as debt) — never a silent skip.

## Boundaries with Other Skills

- **dev/code-review-standards** checks tests exist per-PR (step 3); this owns the release-level gate and the strategy those checks reference.
- **regression-map** (sibling) adds the targeted-suite requirement for fragile areas; this gate enforces it.
- **browser-verification** (sibling) supplies the E2E tier's browser evidence (Playwright) — this decides when it's required.
- **ops** ships only on GATE PASS and owns rollback; a pass here is necessary, not sufficient.
- **charter-enforcement** (sibling) can block a shipping change independently of test results — security gate and quality gate are separate verdicts.

## Stack Notes (dated)

- `assets/stack-notes-rust-testing-2026-07.md` — Rust test mechanics mapped to the pyramid tiers. Applies only when stack-profile names Rust; adopted from marketplace (ECC) 2026-07-10; method conflicts resolve to this skill.
