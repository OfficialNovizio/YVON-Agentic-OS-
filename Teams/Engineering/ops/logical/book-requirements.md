---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: ops (Engineering / DevOps & Reliability)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds ops's judgments in real, citable sources. Until the operator supplies books, ops's rubrics are flagged **reasoning-based, not formula-verified** (rule 0.6).

## Candidate sources (operator to supply; suggestions, not purchases ops made)

1. **An SRE text** — grounds severity classification, error budgets, toil reduction, blameless post-mortem method, and design-for-failure. **Shared candidate with dev** (dev's logical/book-requirements.md names the same need) — one book, two agents, extract once.
2. **The shared statistics source** (cross-department want: vista/sentinel/nate/kai/rio/quinn) — grounds alert-threshold recommendations (false-positive/negative trade-offs) and baseline drift detection with math instead of convention. **OS-level shared build.**
3. **A release/continuous-delivery text** — grounds deploy-strategy selection (blue-green vs canary vs rolling by risk class) and pipeline discipline beyond the marketplace-credited patterns.

## Currently flagged as reasoning-based (rule 0.6)

- P0–P3 severity descriptions (industry convention, credited to marketplace SRE skills — not derived).
- Any cadence, threshold, or retention recommendation ops proposes when config is unset.
- Deploy-strategy-by-risk guidance (patterns credited; the risk mapping is reasoning).
- Watch-window duration recommendations.

## Extraction protocol (when books arrive)

Formulas/thresholds extracted with page-level citations into this folder; affected skills updated to cite them; reasoning-based flags removed only where a citation replaces them. Coordinate the SRE text's extraction with dev so both agents cite one source.

## Inherited scripts (Shared OS/logical/)

| Script | Source | Purpose |
|---|---|---|
| `sre_alerting_principles.py` **✅ EXTRACTED touch-2 2026-07-29** | [Google SRE Book Ch.6](https://sre.google/sre-book/monitoring-distributed-systems/) — CC BY-NC-ND + [Workbook Ch.5](https://sre.google/workbook/alerting-on-slos/) | Golden Signals + Five Questions — alert-rule quality scoring. |
| `sre_practical_alerting.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.10](https://sre.google/sre-book/practical-alerting/) — CC BY-NC-ND + Prometheus docs | Alert-rule linter — required labels (var/job/service/zone), min-duration convention (≥2 rule cycles), severity tiers (page/ticket/dashboard). |
| `sre_postmortem_culture.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.15](https://sre.google/sre-book/postmortem-culture/) — CC BY-NC-ND | Infra-postmortem scoring: 5 review criteria + 5 triggers. |
| `sre_managing_incidents.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.14](https://sre.google/sre-book/managing-incidents/) — CC BY-NC-ND + [FEMA NIMS](https://www.fema.gov/national-incident-management-system) | ICS role separation + declaration criteria + handoff-protocol validator for infra incidents. |
| `sre_slo_error_budget.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Workbook Ch.2](https://sre.google/workbook/implementing-slos/) — CC BY-NC-ND + [SRE Book Ch.4](https://sre.google/sre-book/service-level-objectives/) | Route A error-budget arithmetic (allowed_failures, budget_remaining, consumed_pct) + Route B SLI-type registry (7 types across Request-driven/Pipeline/Storage) + 8-row SLO decision matrix. Passes Ch.2 exact examples (99.9%×3M=3000, 97%×3.6M=109,897). |
| `sre_being_on_call.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.11](https://sre.google/sre-book/being-on-call/) — CC BY-NC-ND + [Workbook Ch.8](https://sre.google/workbook/on-call/) | Rotation-sizing math (min 8 single-site / 6-per-site dual-site), on-call % validator (25% cap), 12h-shift workload cap (2 incidents / 6h each), 1:1 alert-to-incident target, paging response times (5min critical, 30min non-critical). |
