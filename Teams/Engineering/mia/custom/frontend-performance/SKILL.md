---
name: frontend-performance
type: custom
status: built 2026-07-09 (Fable build — 4th skill; Core Web Vitals bridge to rank's technical SEO)
based_on_catalog_entry: none — new; frontend perf underpins both UX and rank's technical SEO (Core Web Vitals)
marketplace_search: 2026-07-09 — perf/Core-Web-Vitals skills found are Lighthouse wrappers; the discipline is kept custom, bound to axiom's measure-first, ops's baselines, and rank's SEO
assigned_agent: mia (Engineering / Frontend Web)
portable: true — the metrics are standard (Core Web Vitals); tooling comes from the stack-profile
includes: (no asset — method skill; benchmarks use axiom's benchmark-record template)
date_added: 2026-07-09
---

## Introduction

frontend-performance is how mia keeps the UI fast for real users: Core Web Vitals (LCP, INP, CLS), bundle discipline, and render efficiency — measured on realistic conditions, not a fast dev machine. It's where UX performance and rank's technical SEO meet: the same Core Web Vitals that make the app feel responsive are a Google ranking signal, so this skill serves both.

## Purpose

Frontend performance degrades invisibly: each feature adds bundle weight, each library adds parse time, until the app is janky on the devices real users have (not the developer's laptop). Slow frontends lose users and rank worse. Measured performance discipline catches the regression before users and search engines do.

## When to Use

Triggers: "the app is slow/janky," "Core Web Vitals," "LCP/INP/CLS," "bundle size," "why is the page slow to load," a perf regression in monitoring, and rank flagging a Core Web Vitals SEO issue.

## Structure / Protocol

```
A frontend performance question
  -> MEASURE (axiom's rule): Core Web Vitals under realistic conditions (throttled network/CPU, real devices)
     LCP (load) · INP (interactivity) · CLS (layout stability)
    -> Diagnose: bundle too big · render-blocking resources · unoptimized images · layout thrash ·
       excessive re-renders · unsplit code
      -> Fix at the right layer: code-split · lazy-load · image optimize · defer non-critical ·
         reduce re-renders · token-driven CSS (not duplicated styles)
        -> MEASURE AGAIN under the same conditions → keep measured wins, revert the rest
          -> Feed ops baselines + rank (Core Web Vitals are a shared signal)
```

## Instructions

1. **Measure on realistic conditions.** Core Web Vitals on throttled network/CPU and real device classes — not the dev machine, where everything is fast (axiom's realistic-workload rule, frontend edition). The dev-machine measurement is the one that lies.
2. **The three vitals.** LCP (largest contentful paint — load), INP (interaction to next paint — responsiveness), CLS (cumulative layout shift — stability). Each has a distinct cause set; a good LCP with a bad INP is a different problem than the reverse.
3. **Bundle discipline.** Every dependency adds parse/execute cost; code-split so users download what they need, lazy-load below-the-fold, and question whether a heavy library earns its weight (dev's boring-is-a-feature). Bundle size is a budget, watched like ops watches other baselines.
4. **Right-layer fixes.** Slow load → code-split/defer/optimize images; janky interaction → reduce main-thread work and re-renders; layout shift → reserve space for async content. Don't fix an INP problem by shrinking images.
5. **Measure again, keep only wins.** Same conditions before/after; keep measured improvements, revert the rest (axiom). A perf "optimization" with no measured gain is complexity for nothing.
6. **Shared signal with rank.** Core Web Vitals are both UX and an SEO ranking factor — mia owns making them good in the app, rank owns measuring/reporting them as SEO. A vitals regression is both a UX and an SEO finding; the numbers feed ops's baselines too.

## Output Format

```
## Frontend Performance: [page/flow]
Conditions: [throttled network/CPU, device class] · Tooling: [per stack-profile]
Vitals: LCP [ ] · INP [ ] · CLS [ ] — vs targets
Diagnosis: [bundle/render-blocking/images/thrash/re-renders]
Fix: [code-split/lazy/optimize/defer] · Before→after: [metric] → KEEP/REVERT
→ ops baseline · → rank (Core Web Vitals SEO signal)
```

## Principles

- **Measure on realistic conditions** — the dev machine lies; throttle and use real device classes.
- **Three distinct vitals** — LCP/INP/CLS have different causes; diagnose the right one.
- **Bundle size is a budget** — every dependency earns its weight; split and lazy-load.
- **Right-layer fixes** — don't shrink images to fix interactivity.
- **Keep only measured wins** — unmeasured perf changes are reverted (axiom).
- **Vitals are a shared UX+SEO signal** — mia makes them good, rank reports them; both are findings.

## Fallback

- No real-device/throttling setup → measure with throttling emulation, label the fidelity gap; don't declare vitals good from an unthrottled dev run.
- No perf tooling in the stack → Lighthouse-class measurement + the diagnosis reasoning, labeled; recommend tooling for the stack-profile.
- Perf vs feature pressure → the vitals budget is explicit; a feature that blows it is a tracked trade-off (dev's tech-debt register), not a silent regression.

## Boundaries with Other Skills

- **axiom/performance-profiling**: the same measure-first discipline; a compute-bound frontend hot path routes to axiom; benchmarks use axiom's record template.
- **design-tokens** (sibling): token-driven theming stays lean (one token layer, not duplicated styles).
- **rank (Search)**: Core Web Vitals are a shared signal — mia makes them good, rank owns the SEO measurement/reporting. Clean split, no double ownership.
- **ops/maintenance-hygiene**: frontend vitals baselines live alongside backend baselines; regressions route here.
- **quinn**: vitals regressions can be gate findings; verified in the browser.

## Stack Notes (dated)

- `assets/stack-notes-react-next-2026-07.md` — React/Next component/state/perf/form patterns. Applies only when stack-profile names React/Next.js; adopted from marketplace (ECC) 2026-07-10; method conflicts resolve to this skill.
