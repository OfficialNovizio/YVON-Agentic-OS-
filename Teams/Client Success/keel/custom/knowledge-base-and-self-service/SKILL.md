<!--
Custom skill — synthesized from KCS Consortium + Zendesk + Salesforce
practitioner. §11 + §14.2. Route D per §8.2.
-->
---
name: knowledge-base-and-self-service
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "KCS (Knowledge-Centered Service) Consortium — KCS v6 methodology (institutional standard). thekcs.com."
  - "Zendesk — Help Center + Guide practitioner materials. zendesk.com."
  - "Salesforce Service Cloud — Knowledge features (institutional practitioner). salesforce.com."
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 16th and final use across Client Success."
  - "TSIA — Knowledge Management benchmark research. Institutional."
fulfills_catalog_entry: knowledge-base-and-self-service (custom per §2 routing)
assigned_agent: keel (Client Success / Support Ops)
portable: true
date_added: 2026-07-31
tier: 3
description: Knowledge base + self-service framework — KCS v6 methodology (article created/updated during ticket work not after) + KB structure + taxonomy + deflection-design + article lifecycle + SME validation. LOAD-BEARING KB-article-publication-without-SME-validation refusal. Trigger on "KB article for [issue]", "self-service design for [product]", "KCS methodology for [team]", "KB taxonomy for [product]", "deflection design", or "SME validation for [article]".
triggers:
  - KB article for
  - self-service design for
  - KCS methodology for
  - KB taxonomy for
  - deflection design
  - SME validation for
  - knowledge base structure
  - help center architecture
---

# Knowledge Base and Self-Service

## Introduction

Knowledge base + self-service framework for keel — KCS (Knowledge-Centered
Service) v6 methodology + Zendesk / Salesforce KB frameworks + TSIA
Knowledge Management benchmarks.

**Scope distinction:** keel OWNS KB structure + KCS discipline + deflection
design. Support agents CREATE articles (during ticket work per KCS
discipline). SMEs VALIDATE articles.

Custom Route D per §8.2.

## Purpose

Prevents seven failure modes:

1. **KB article publication without SME validation.** Unvalidated articles =
   customer misinformation + trust damage. LOAD-BEARING per Principle 1.
2. **Article-creation as separate project.** KCS discipline: articles created
   / updated DURING ticket work, NOT after as separate project. Post-hoc
   article creation = stale KB.
3. **Taxonomy chaos.** KB without discipline taxonomy = customers can't find
   articles = KB not deflecting tickets.
4. **Self-service design ignored.** KB present but self-service surfaces
   (help center / in-product search / chatbot integration) not designed =
   articles hidden.
5. **Article lifecycle absent.** Articles created + never reviewed = stale
   content + wrong-answer risk.
6. **Deflection-rate not measured.** Self-service success without deflection-
   rate measurement = can't optimize.
7. **Individual crisis DURING KB work.** HARD BOUNDARY.

## When to Use

Trigger on:
- "KB article for [issue]" / "self-service design for [product]"
- "KCS methodology for [team]" / "KB taxonomy for [product]"
- "Deflection design" / "SME validation for [article]"
- "Knowledge base structure" / "help center architecture"

Do NOT use for:
- Tiered support architecture → `tiered-support-design` (sibling)
- SLA management → `sla-and-escalation-management` (sibling)
- CSAT/NPS/CES → `support-analytics` (sibling)
- Product documentation (product-features docs) → Product + dev
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
KCS v6 METHODOLOGY (Knowledge-Centered Service Consortium)

  4 core practices:
    1. CAPTURE — articles created during ticket work, not after
    2. STRUCTURE — consistent template + tagging
    3. REUSE — search + link articles in tickets to demonstrate value
    4. IMPROVE — evolve articles based on reuse + feedback

  4 supporting practices:
    5. CONTENT HEALTH — periodic review + retire stale
    6. PROCESS INTEGRATION — KCS embedded in support workflow
    7. PERFORMANCE ASSESSMENT — KCS metrics + coaching
    8. LEADERSHIP + COMMUNICATION — KCS-culture leadership commitment


KB STRUCTURE + TAXONOMY

  Article types:
    - How-to (procedural)
    - FAQ (frequently asked question)
    - Troubleshooting (problem → resolution)
    - Reference (technical specification / API docs)
    - Announcement / Release Note

  Taxonomy dimensions:
    - Product / feature area
    - Customer tier / persona
    - Complexity level (beginner / intermediate / advanced)
    - Language / locale (coordinate with lingua)


SELF-SERVICE SURFACES

  - Help center / documentation site
  - In-product search / help widget
  - Chatbot integration (KB-search + article-return)
  - Community / peer-to-peer support


ARTICLE LIFECYCLE

  DRAFT → SME VALIDATION → PUBLISHED → REVIEWED (periodic) → ARCHIVED / RETIRED

  SME VALIDATION LOAD-BEARING before PUBLISHED status.


DEFLECTION-RATE MEASUREMENT

  - Self-service view → resolved-without-ticket
  - In-product help widget usage
  - Community peer-to-peer resolution


KB OPERATIONAL SEQUENCE:

  Phase 1: KCS DISCIPLINE FOUNDATION                    (culture + process embedding)
  Phase 2: KB STRUCTURE + TAXONOMY                      (article types + taxonomy dimensions)
  Phase 3: SELF-SERVICE DESIGN                          (help center + in-product + chatbot)
  Phase 4: ARTICLE LIFECYCLE + LOAD-BEARING SME VALIDATION (draft → validate → publish → review → retire)
```

## Instructions

### Phase 1 — KCS discipline foundation
- Culture: articles created during ticket work
- Process: KCS integrated in support workflow
- Leadership: KCS-culture leadership commitment
- Metrics: KCS performance assessment

### Phase 2 — KB structure + taxonomy
- Article types (how-to / FAQ / troubleshooting / reference / announcement)
- Taxonomy dimensions (product / persona / complexity / locale)
- Consistent template

### Phase 3 — Self-service design
- Help center architecture
- In-product help integration
- Chatbot KB-search integration
- Community platform (if applicable)

### Phase 4 — Article lifecycle + LOAD-BEARING SME validation
- Draft (support agent during ticket)
- SME validation (LOAD-BEARING per Principle 1 before PUBLISHED)
- Published + tagged
- Periodic review (typically quarterly for critical / annually for stable)
- Archived / retired for obsolete

Deflection-rate measurement + feedback loop.

## Output Format

- KCS discipline foundation memo (culture + process + leadership)
- KB structure + taxonomy design
- Self-service surface design
- Article lifecycle process + SME validation protocol
- Deflection-rate dashboard framework

## Principles

1. **Never KB article publication without SME validation** — LOAD-BEARING
   per Purpose failure mode 1.
2. **KCS discipline: articles during ticket work** — not post-hoc project.
3. **Consistent taxonomy** — findability discipline.
4. **Self-service surface designed** — KB + surface both needed.
5. **Article lifecycle managed** — periodic review + retirement.
6. **Deflection-rate measured** — self-service success measured.
7. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Article
   authorship attribution internal only.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **SME validation delayed** — DEFER publication per Principle 1 — LOAD-
  BEARING. Coordinate SME availability; do NOT publish unvalidated article
  as workaround.
- **Article-creation-as-project pressure** (leadership wants "content
  sprint") — decline per Principle 2. KCS discipline: articles during work.
- **Taxonomy explosion** (too many categories). Route to KB governance +
  operator for taxonomy consolidation.
- **Multi-language / multi-locale KB coordination** — coordinate with lingua
  `product-localization` for locale strategy + `legal-localization` if legal
  content.
- **Regulated-content KB** (health / financial / legal) — additional counsel
  review beyond SME validation.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `tiered-support-design` (custom, keel — sibling) | T1 resolution driven by KB | Coordination |
| `sla-and-escalation-management` (custom, keel — sibling) | KB reduces ticket volume + supports SLA | Coordination |
| `support-analytics` (custom, keel — sibling) | Deflection-rate metric feeds analytics | Coordination |
| `product-localization` + `legal-localization` (custom, lingua) | Multi-locale KB coordination | Cross-department |
| Product / dev | Product documentation coordination (KB references product docs) | Cross-department |
| grove (P&C) — L&D | KCS training for support team | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [KCS (Knowledge-Centered Service) Consortium](https://www.thekcs.com/)
- [Zendesk — Guide + Help Center](https://www.zendesk.com/service/help-center/)
- [Salesforce Service Cloud — Knowledge](https://www.salesforce.com/products/service-cloud/features/knowledge-management/)
- [TSIA — Knowledge Management](https://www.tsia.com/)
- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
