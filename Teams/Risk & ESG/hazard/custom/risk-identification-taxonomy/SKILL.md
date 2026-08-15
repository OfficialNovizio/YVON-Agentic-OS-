<!--
Custom skill — COSO ERM + ISO 31000 + practitioner. §11 + §14.2. Route D per §8.2.
-->
---
name: risk-identification-taxonomy
type: custom
status: built from scratch (§4.6 reclass)
sources_referenced:
  - "COSO Enterprise Risk Management—Integrating with Strategy and Performance (2017). Institutional framework."
  - "ISO 31000:2018 — Risk Management Guidelines. Institutional."
  - "Lam, James (2014). Enterprise Risk Management (Wiley). §8.9 3rd use across R&ESG."
  - "IRM — Risk taxonomy practitioner corpus."
  - "OCC (Office of the Comptroller of the Currency) + Basel Committee — bank risk taxonomy (institutional)."
fulfills_catalog_entry: risk-identification-taxonomy (custom per §2 routing)
assigned_agent: hazard (Risk & ESG / Enterprise Risk)
portable: true
date_added: 2026-07-31
tier: 3
description: Risk identification + taxonomy framework — comprehensive risk register + category taxonomy + risk-owner assignment + emerging-risk detection. LOAD-BEARING risk-inventory-gaps refusal. Trigger on "risk taxonomy", "risk identification for [operation]", "risk register design", "risk-owner assignment", or "emerging risk identification".
triggers:
  - risk taxonomy
  - risk identification for
  - risk register design
  - risk-owner assignment
  - emerging risk identification
  - risk inventory
---

# Risk Identification and Taxonomy

## Introduction

Risk identification + taxonomy discipline for hazard — COSO ERM + ISO 31000 +
Lam + IRM + OCC/Basel taxonomy.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Risk-inventory gaps.** Missing risk categories = blind spots. LOAD-BEARING per Principle 1.
2. **Category-silo thinking.** Risks cross categories; siloed identification misses interactions.
3. **Risk-owner ambiguity.** Owner undefined = drift.
4. **Static taxonomy.** Environment changes; taxonomy must evolve.
5. **Emerging-risk detection absent.** Focus on historical risks misses emerging (coordinate with pilot `tail-risk-scanning`).
6. **Individual crisis DURING risk-inventory crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Risk taxonomy" / "risk identification for [operation]"
- "Risk register design" / "risk-owner assignment"
- "Emerging risk identification" / "risk inventory"

Do NOT use for:
- Risk appetite → pilot `risk-appetite-framework`
- Tail-risk scan → pilot `tail-risk-scanning`
- Risk assessment / quantification → `risk-assessment-quantification` (hazard sibling)
- Risk treatment → `risk-treatment-strategies` (hazard sibling)
- Risk monitoring → `risk-monitoring-and-audit` (hazard sibling)
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
CANONICAL RISK CATEGORIES (COSO + Basel + practitioner)

  STRATEGIC — market shifts / competitive / business model
  OPERATIONAL — process / people / systems / external events
  FINANCIAL — credit / market / liquidity / accounting
  COMPLIANCE / REGULATORY — legal / regulatory / policy
  CYBER / IT — breach / outage / data / AI
  REPUTATIONAL — brand / stakeholder / social media
  ESG — environmental / social / governance
  GEOPOLITICAL — sanctions / conflict / trade regime


RISK REGISTER COMPONENTS

  - Risk ID + name
  - Category + subcategory
  - Description + trigger conditions
  - Owner (accountable party — coordinate with hire for role clarity)
  - Current control state (coordinate with `risk-monitoring-and-audit`)
  - Assessment (coordinate with `risk-assessment-quantification`)
  - Treatment (coordinate with `risk-treatment-strategies`)
  - Status + last-review date


OPERATIONAL SEQUENCE:

  Phase 1: TAXONOMY DESIGN
  Phase 2: LOAD-BEARING COMPREHENSIVE IDENTIFICATION (no gaps)
  Phase 3: OWNER ASSIGNMENT
  Phase 4: PERIODIC REVIEW + EMERGING-RISK INTEGRATION
```

## Instructions

### Phase 1 — Taxonomy design
Adapt canonical categories per business + industry.

### Phase 2 — Comprehensive identification (LOAD-BEARING)
Multi-method: workshops + interviews + document review + external scan
(coordinate with pilot `tail-risk-scanning`). **Gap detection: cross-check
against industry-standard taxonomies.**

### Phase 3 — Owner assignment
Each risk = single accountable owner. Coordinate with hire for role clarity.

### Phase 4 — Periodic review + emerging-risk integration
Quarterly minimum; integrate emerging risks from pilot.

## Output Format

- Risk taxonomy per business
- Risk register with all identified risks + owners + status
- Emerging-risk integration process
- Review cadence + calendar

## Principles

1. **Risk-inventory gaps NEVER acceptable** — LOAD-BEARING per failure mode 1.
2. **Cross-category interaction assessed.**
3. **Single-owner per risk.**
4. **Taxonomy evolves.**
5. **Emerging-risk integration continuous.**
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Category gap discovered** — expand taxonomy + coordinate with pilot.
- **Owner-assignment dispute** — escalate to operator + hire.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| pilot 4 skills | Risk framework alignment | Upstream |
| `risk-assessment-quantification` (hazard sibling) | Identified risks → quantification | Downstream |
| `risk-treatment-strategies` (hazard sibling) | Identified risks → treatment | Downstream |
| `risk-monitoring-and-audit` (hazard sibling) | Register → monitoring | Downstream |
| hire (P&C Lead) | Owner role clarity | Cross-department |
| board + precedent + sentinel (Governance) | Board risk register visibility | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [COSO ERM Framework](https://www.coso.org/enterprise-risk-management)
- [ISO 31000:2018](https://www.iso.org/standard/65694.html)
- [Lam — ERM (Wiley)](https://www.wiley.com/en-us/Enterprise+Risk+Management-p-9781118413616)
- [IRM](https://www.theirm.org/)
- [OCC + Basel](https://www.bis.org/bcbs/)
