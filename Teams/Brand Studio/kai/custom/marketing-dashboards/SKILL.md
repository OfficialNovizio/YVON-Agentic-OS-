---
name: marketing-dashboards
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build)
based_on_catalog_entry: vyon-marketing-dashboards (VYON_Skills_Catalog_Full_v2.html, kai/Brand Studio) — renamed marketing-dashboards, genericized per rule 0.4b; "GA4 + ad platform" becomes the configured sources, "targets from vista" kept as the cross-agent seam, "flag reds to CMO" becomes the configured escalation contact
assigned_agent: kai (Brand Studio / Analyst)
portable: true — sources, cadence, and sections are per-business config; the scorecard shape is the method
includes: assets/scorecard-template.md
date_added: 2026-07-07
---

## Introduction

marketing-dashboards is kai's recurring scorecard: the same sections every period — NSM + guardrails (vista's definitions), spend and CAC by channel, funnel stages, organic social (pulse's numbers), email, SEO movement — computed against brand-context baselines and vista's targets, with reds flagged to the configured contact. It is also where the department's self-grading gets reconciled: platform-reported ROAS (rio), platform analytics (pulse) meet kai's independent read, and the deltas are reported, not smoothed.

## Purpose

A scorecard that changes shape every week teaches nobody anything; metrics without baselines are decoration; and channel numbers graded by the channels themselves inflate quietly. The fixed-shape, baseline-anchored, reconciled scorecard fixes all three — and its reds are the department's early-warning system, feeding nate's aim, rio's guardrails, and vista's roadmap reality.

## When to Use

Triggers: "weekly marketing report," "scorecard," "how did the week go," or on the configured reporting cadence.

## Structure / Protocol

```
Pull the period's data (configured sources per channel; operator exports where no connector)
  -> Load brand-context baselines + vista's targets (NSM/guardrails/KRs where set)
    -> Compute the fixed sections; every number = value · vs baseline · vs target
      -> RECONCILE: platform-reported vs kai-independent where both exist; deltas reported
        -> Flag reds (breach rules from config) → escalation contact + the owning agent
          -> Publish; append to the scorecard history (trend integrity)
```

## Instructions

### Phase 1 — Pull and Load

Sources per config (`metrics_sources` per channel; unconnected = operator export, as-of dated). Baselines from brand-context; targets from vista's NSM spec and current KRs where they exist — where they don't, the scorecard says "no target set" rather than inventing one.

### Phase 2 — Compute the Fixed Shape

Per `assets/scorecard-template.md`: the same sections, same order, every period. New sections are added deliberately (config change), not improvised — trend integrity beats novelty. Numbers unavailable this period are shown as gaps, never carried forward silently.

### Phase 3 — Reconcile

Where a platform grades itself (ad ROAS, social reach), kai's independent read (site analytics, revenue data) sits beside it and the delta is a scorecard line. Persistent large deltas are their own finding (attribution problem → rio's playbook refresh, or instrumentation problem → the queue).

### Phase 4 — Flag and Publish

Reds per the configured breach rules (e.g., guardrail threshold crossed, KPI n% under baseline for m periods — operator-set, never defaulted). Each red routes to the escalation contact *and* the owning agent (funnel red → nate; ROAS red → rio; engagement red → pulse). The scorecard appends to history; deltas-on-deltas (trends) ride along.

## Output Format

Per the template: header (period, sources, gaps), the fixed sections, reconciliation lines, reds with routing, one "what changed" paragraph in plain language.

## Principles

- **Same shape every period.** Trend integrity is the product.
- **Every number: value, baseline, target (or "no target set").**
- **Self-graded numbers sit beside independent reads; deltas are reported, not smoothed.**
- **Reds route to owners, not just upward.**
- **Gaps are shown, never silently carried forward.**
- **Breach rules are operator-set** (rule 0.5 — kai never invents what counts as red).

## Fallback

- No connectors → operator exports on cadence; the scorecard states its as-of basis.
- No baselines yet → the scorecard runs value-only, labeled, while brand-context builds.
- No vista targets → baseline-relative only, "no target set" shown — a standing nudge, not a blocker.

## Boundaries with Other Skills

- `brand-context` (sibling) supplies baselines; `seo-strategist` (sibling) supplies the SEO section's interpretation.
- **vista** owns NSM/guardrail definitions and targets (kai measures them); **pulse/rio/nate/lena** own their channels (kai grades them independently); **echo** consumes the scorecard for investor updates; **marcus/board** see reds that cross strategic or fiduciary lines.
- **The instrumentation queue** (kai's) collects every gap this scorecard exposes.
