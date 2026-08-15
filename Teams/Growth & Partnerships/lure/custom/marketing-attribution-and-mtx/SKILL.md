<!--
Custom skill — synthesized from Kaushik + GA4 + practitioner. §11 + §14.2.
Route D per §8.2. Complements quest `funnel-metrics-and-attribution` at
marketing-execution level.
-->
---
name: marketing-attribution-and-mtx
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Kaushik, Avinash. Web Analytics 2.0 (Wiley 2010). §8.9 2nd use (quest funnel + this)."
  - "Google Analytics 4 institutional documentation. §8.9 2nd use."
  - "Adobe Analytics + Marketo — institutional practitioner materials."
  - "Neil Patel + Rand Fishkin — SEO + digital-marketing practitioner corpus."
  - "quest `funnel-metrics-and-attribution` — inherited attribution framework."
fulfills_catalog_entry: marketing-attribution-and-mtx (custom per §2 routing)
assigned_agent: lure (Growth & Partnerships / Marketing / Demand-Gen)
portable: true
date_added: 2026-07-31
tier: 3
description: Marketing attribution + measurement execution — implements quest funnel-attribution framework at marketing-tactical level. LOAD-BEARING individual-user-data-at-publication + fabricated-attribution refusals inherited from quest. Trigger on "marketing attribution for [campaign]", "MTX (marketing technology) setup", "attribution report for [period]", "campaign performance for [channel]", or "marketing analytics dashboard".
triggers:
  - marketing attribution for
  - MTX setup
  - attribution report for
  - campaign performance for
  - marketing analytics dashboard
  - marketing measurement for
  - martech stack selection
---

# Marketing Attribution and MTx

## Introduction

Marketing attribution + martech (MTx) execution for lure — implements quest
`funnel-metrics-and-attribution` framework at marketing-tactical level.
Kaushik Web Analytics + GA4 + Adobe/Marketo + practitioner.

Custom Route D per §8.2.

## Purpose

Prevents five failure modes:

1. **Fabricated attribution** (inherited from quest LOAD-BEARING).
2. **Individual-user data at publication surface** (inherited from quest
   LOAD-BEARING).
3. **Martech-stack sprawl.** Too many disconnected tools = data silos +
   integration cost.
4. **Attribution-model politics.** Channel-owners fighting for credit =
   distraction from optimization.
5. **Individual crisis DURING attribution-crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Marketing attribution for [campaign]" / "attribution report for [period]"
- "MTX (marketing technology) setup" / "martech stack selection"
- "Campaign performance for [channel]" / "marketing analytics dashboard"
- "Marketing measurement for [team]"

Do NOT use for:
- Attribution framework strategy → quest `funnel-metrics-and-attribution`
- Demand-gen strategy → `demand-generation-strategy` (lure sibling)
- Content marketing → `content-marketing-funnel` (lure sibling)
- ABM → `account-based-marketing` (lure sibling)
- Individual PII handling → canopy `data-residency-mapping`
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
MARTECH STACK COMPONENTS

  Analytics: GA4 / Adobe Analytics / Amplitude / Mixpanel
  Attribution: quest framework + specific attribution tools
  Campaign management: HubSpot / Marketo / Pardot / Braze
  Ad platforms: Google Ads / LinkedIn / Meta / etc.
  CDP (Customer Data Platform): Segment / mParticle / Tealium
  Tag management: Google Tag Manager
  A/B testing: Optimizely / VWO / etc.

  Sprawl warning: 10+ tools without integration = data silos.


ATTRIBUTION-REPORT DISCIPLINE

  - Report model + limitations transparently
  - Provide confidence caveats
  - Aggregate-only at publication
  - Channel-owner alignment on model


OPERATIONAL SEQUENCE:

  Phase 1: MARTECH STACK ASSESSMENT + DESIGN
  Phase 2: ATTRIBUTION IMPLEMENTATION (coordinate with quest framework)
  Phase 3: CAMPAIGN REPORTING CADENCE
  Phase 4: OPTIMIZATION LOOP
```

## Instructions

### Phase 1 — Martech stack assessment + design
Audit current tools; recommend additions / removals; prevent sprawl.

### Phase 2 — Attribution implementation
Coordinate with quest for framework; implement per campaign.

### Phase 3 — Campaign reporting cadence
Weekly campaign reports + monthly attribution deep-dives.

### Phase 4 — Optimization loop
Reallocate spend per attribution insights.

## Output Format

- Martech stack recommendation
- Attribution implementation brief
- Reporting cadence design
- Campaign performance dashboards

## Principles

1. **Fabricated attribution NEVER** — LOAD-BEARING inherited from quest.
2. **Individual-user data NEVER at publication surface** — LOAD-BEARING
   inherited from quest.
3. **Attribution model transparency** — report limitations.
4. **Prevent martech sprawl** — integration-first design.
5. **Aggregate-only at publication** — Universal Principle 2.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
8. **§0.6 flag.** Sources Tier B.

## Fallback

- **Attribution data quality issues** — flag "insufficient data" with
  confidence caveat; do NOT publish misleading precision.
- **Channel-owner politics** — escalate to operator + quest for cross-
  functional resolution.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `funnel-metrics-and-attribution` (quest — Lead) | Framework | Upstream |
| `demand-generation-strategy` (lure sibling) | Attribution feeds channel optimization | Coordination |
| `content-marketing-funnel` (lure sibling) | Content performance measurement | Coordination |
| `account-based-marketing` (lure sibling) | ABM measurement | Coordination |
| dana (Engineering) + Product | Cross-system data integration | Cross-department |
| canopy `data-residency-mapping` | PII compliance | Cross-department |
| Operator + counsel | Attribution-data compliance | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Kaushik, Avinash — Web Analytics 2.0 (Wiley)](https://www.wiley.com/en-us/Web+Analytics+2.0-p-9780470529393)
- [Google Analytics 4](https://developers.google.com/analytics)
- [Adobe Analytics](https://business.adobe.com/products/analytics/adobe-analytics.html)
- [Marketo](https://www.marketo.com/)
- [Segment CDP](https://segment.com/)
