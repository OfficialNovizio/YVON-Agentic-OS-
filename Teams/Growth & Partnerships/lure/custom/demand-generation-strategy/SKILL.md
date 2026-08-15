<!--
Custom skill — synthesized from Kingsnorth + HubSpot Inbound + practitioner.
§11 + §14.2. Route D per §8.2.
-->
---
name: demand-generation-strategy
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Kingsnorth, Simon (2022, 4th ed.). Digital Marketing Strategy: An Integrated Approach to Online Marketing. Kogan Page. ISBN 978-1398605978. Canonical practitioner text."
  - "HubSpot — Inbound Marketing framework (institutional practitioner)."
  - "Roberge, Mark (2015). The Sales Acceleration Formula (Wiley). §8.9 4th use in G&P. Demand-generation formula."
  - "OpenView — SaaS demand-gen benchmarks (institutional practitioner)."
  - "MarketingProfs + Content Marketing Institute — institutional practitioner corpus."
fulfills_catalog_entry: demand-generation-strategy (custom per §2 routing)
assigned_agent: lure (Growth & Partnerships / Marketing / Demand-Gen)
portable: true
date_added: 2026-07-31
tier: 3
description: Demand generation strategy — inbound / outbound / paid / organic channel mix + campaign design + attribution coordination. Coordinates with Brand Studio for creative + channel execution. LOAD-BEARING no-fabricated-campaign-metrics + no-spending-without-attribution-instrumentation. Trigger on "demand gen strategy for [segment]", "channel mix for [campaign]", "inbound funnel for [product]", "outbound campaign design", "paid channel strategy", or "demand-gen budget allocation".
triggers:
  - demand gen strategy for
  - channel mix for
  - inbound funnel for
  - outbound campaign design
  - paid channel strategy
  - demand-gen budget allocation
  - demand generation for
  - MQL to SQL alignment
---

# Demand Generation Strategy

## Introduction

Demand-generation strategy for lure — Kingsnorth digital marketing + HubSpot
Inbound + Roberge demand-gen formula + OpenView benchmarks. Coordinates
with Brand Studio (pulse / rio / nate / kai / tempo) for channel execution.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Fabricated campaign metrics.** LOAD-BEARING per Principle 1. Roberge/Mehta
   discipline inherited.
2. **Spending without attribution instrumentation.** Money spent without
   tracking = can't optimize. LOAD-BEARING per Principle 2.
3. **Channel-mix without segment fit.** Enterprise-target LinkedIn ads while
   SMB-focused = wasted spend.
4. **MQL-to-SQL misalignment with sales.** Marketing-qualified leads that
   sales rejects = broken funnel.
5. **Inbound-only or Outbound-only fundamentalism.** Modern demand-gen =
   mixed.
6. **Individual crisis DURING campaign crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Demand gen strategy for [segment]" / "channel mix for [campaign]"
- "Inbound funnel for [product]" / "outbound campaign design"
- "Paid channel strategy" / "demand-gen budget allocation"
- "MQL to SQL alignment" / "demand generation for [product]"

Do NOT use for:
- Content marketing → `content-marketing-funnel` (lure sibling)
- Marketing attribution → `marketing-attribution-and-mtx` (lure sibling)
- ABM → `account-based-marketing` (lure sibling)
- Brand voice / creative → Brand Studio (spark / lena / atlas)
- Channel execution → Brand Studio (pulse / rio / nate / kai / tempo)
- Sales execution → closer siblings
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
DEMAND-GEN CHANNEL MIX

  INBOUND (HubSpot framework)
    - SEO + content marketing (coordinate with content-marketing-funnel sibling)
    - Organic social (coordinate with Brand Studio pulse)
    - Referral / word-of-mouth

  OUTBOUND
    - Cold email / SDR outreach (coordinate with closer)
    - Cold calling
    - Direct mail
    - Best for: enterprise / defined-segment reach

  PAID
    - Search ads (Google / Bing)
    - Social ads (LinkedIn / Meta / X / TikTok — coordinate with Brand Studio rio)
    - Programmatic display
    - Podcast + video ads (coordinate with Brand Studio kai + tempo)

  ORGANIC
    - Content-driven organic search
    - Community engagement
    - Events + conferences


OPERATIONAL SEQUENCE:

  Phase 1: CHANNEL-MIX DESIGN PER SEGMENT
  Phase 2: BUDGET ALLOCATION + ATTRIBUTION INSTRUMENTATION (LOAD-BEARING)
  Phase 3: CAMPAIGN DESIGN + MQL-TO-SQL DEFINITION (WITH CLOSER)
  Phase 4: MEASUREMENT + OPTIMIZATION LOOP
```

## Instructions

### Phase 1 — Channel-mix design per segment
Match channels to segment ICP + buyer behavior.

### Phase 2 — Budget allocation + attribution instrumentation (LOAD-BEARING)
Coordinate with quest `funnel-metrics-and-attribution` for instrumentation.
**No spending without tracking.**

### Phase 3 — Campaign design + MQL-to-SQL definition (with closer)
- Campaign creative brief (handoff to Brand Studio)
- MQL criteria alignment with closer
- Handoff cadence

### Phase 4 — Measurement + optimization loop
- Weekly channel performance review
- Attribution updates
- Budget reallocation per performance

## Output Format

- Channel-mix recommendation per segment
- Budget allocation + attribution instrumentation brief
- Campaign brief + MQL definition
- Measurement + optimization framework

## Principles

1. **No fabricated campaign metrics** — LOAD-BEARING per failure mode 1.
2. **No spending without attribution instrumentation** — LOAD-BEARING per failure mode 2.
3. **Channel-mix per segment** — no one-size channel default.
4. **MQL-SQL alignment with sales** — mandatory.
5. **Mixed inbound/outbound modern default** — no fundamentalism.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   prospect data per canopy data-residency compliance.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Attribution instrumentation gap** — pause spending until instrumentation
  or explicit "flying blind — assumption X" flag with operator sign-off.
- **MQL-SQL misalignment with sales** — coordinate MQL-criteria reset with closer.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `content-marketing-funnel` (lure sibling) | Content-driven demand-gen | Coordination |
| `marketing-attribution-and-mtx` (lure sibling) | Attribution execution | Coordination |
| `account-based-marketing` (lure sibling) | ABM as demand-gen motion | Coordination |
| `funnel-metrics-and-attribution` (quest — Lead) | Attribution framework | Upstream |
| Brand Studio (spark / lena / pulse / rio / kai / tempo) | Creative + channel execution | Downstream |
| closer siblings | MQL-to-SQL handoff | Coordination |
| canopy `data-residency-mapping` | PII compliance for prospect data | Cross-department |
| Operator + CFO | Budget authorization | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Kingsnorth — Digital Marketing Strategy (Kogan Page)](https://www.koganpage.com/marketing-communications/digital-marketing-strategy-9781398605978)
- [HubSpot — Inbound Marketing](https://www.hubspot.com/inbound-marketing)
- [Roberge — The Sales Acceleration Formula (Wiley)](https://www.wiley.com/en-us/The+Sales+Acceleration+Formula-p-9781119047070)
- [OpenView — SaaS Benchmarks](https://openviewpartners.com/)
- [Content Marketing Institute](https://contentmarketinginstitute.com/)
