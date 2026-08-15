<!--
Custom skill — built from scratch, synthesized from named institutional sources
(ICC Incoterms 2020 + WTO + WCO HS + UNCTAD + Flexport/Freightos practitioner).
Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found e-commerce-oriented
logistics skills; frontier scope is broader corporate international logistics
(B2B + larger shipments + manufacturing coordination + trade finance). §4.6
reclass to custom Route D. Marketplace skills noted as complementary tactical-
execution tools for ops teams.

Route D per §8.2 (cited rubric).
-->
---
name: international-logistics
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "ICC (International Chamber of Commerce) — Incoterms 2020 rules. Institutional. iccwbo.org. Canonical trade-terms reference — 11 Incoterms rules covering risk + cost transfer between buyer + seller for international trade."
  - "WTO (World Trade Organization) — trade rules + tariff schedules + trade-facilitation agreement. Institutional. wto.org."
  - "WCO (World Customs Organization) — Harmonized System (HS) product classification. Institutional. wcoomd.org. HS is the canonical 6-digit product-classification system for customs globally (adopted by 200+ economies)."
  - "UNCTAD (United Nations Conference on Trade and Development) — trade + logistics reference. Institutional. unctad.org."
  - "Flexport / Freightos — practitioner materials on modern digital freight-forwarding + trade transparency."
fulfills_catalog_entry: international-logistics (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found e-commerce-oriented marketplace skills. frontier scope is broader corporate international logistics. §4.6 reclass to custom Route D. Marketplace skills noted as tactical-execution tools."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum."
assigned_agent: frontier (Global Expansion / Cross-border Operations)
portable: true
date_added: 2026-07-31
tier: 3
description: Corporate international-logistics coordination for physical-goods trade — Incoterms 2020 selection per trade lane + customs coordination (HS code classification + import-duties + VAT-on-import) + trade-finance coordination (letters of credit / documentary collections) + freight-forwarder selection scoping. Trigger on "Incoterms for [trade lane]", "HS code for [product]", "import duties for [country]", "letter of credit for [transaction]", "freight forwarder for [route]", "customs coordination for [import/export]", "FOB vs CIF vs DDP for [trade]", or "trade finance for [B2B transaction]".
triggers:
  - Incoterms for
  - HS code for
  - import duties for
  - letter of credit for
  - freight forwarder for
  - customs coordination for
  - FOB vs CIF vs DDP for
  - trade finance for B2B transaction
  - documentary collection for
  - VAT on import for
---

# International Logistics

## Introduction

This skill packages corporate international-logistics coordination discipline
for frontier — invoked when the org's expansion involves physical-goods trade
(imports / exports / manufacturing coordination / returns logistics). Incoterms
2020 selection + customs coordination + trade-finance coordination + freight-
forwarder selection scoping.

**Scope distinction:** frontier SCOPES logistics decisions + coordinates.
Operator + ops team + customs broker + freight forwarder EXECUTE actual
movements. Broader corporate scope than e-commerce-marketplace skills (which
handle small-parcel D2C tactical execution).

Custom Route D per §8.2 — cited rubric grounded in ICC + WTO + WCO + UNCTAD +
Flexport/Freightos institutional corpus.

## Purpose

Prevents six failure modes:

1. **Incoterms selection without cost + risk-transfer analysis.** Incoterms
   determine where risk transfers from seller to buyer + who pays which costs
   (freight / insurance / duties). Wrong Incoterms selection = contract
   disputes + unexpected cost allocations + risk exposure. LOAD-BEARING.
2. **HS code misclassification.** Wrong HS code = wrong duties + potential
   customs penalties + delayed shipments + regulatory action. HS classification
   requires customs counsel or specialized broker expertise for non-obvious
   cases. LOAD-BEARING.
3. **Ignore import-duties + VAT-on-import.** Duties + VAT-on-import add to
   landed cost materially — Section 301 tariffs (US-China), reciprocal tariffs
   (US-EU / US-various post-2025), VAT-on-import varying 0-27% globally.
   Missing = wrong margin calculations + pricing.
4. **Trade-finance not coordinated.** B2B international trade often requires
   letters of credit / documentary collections for payment-vs-goods security.
   Coordinating with frontier siblings `international-banking` + `cross-border-
   payments` + `fx-treasury-basics` prevents payment-goods-mismatch risk.
5. **Freight-forwarder selection without due diligence.** Freight forwarders
   vary widely — asset-based vs asset-light (NVOCC), tech-enabled vs traditional,
   modal coverage (ocean / air / ground / multimodal), regional strengths.
   Selection without due diligence = service failures at scale.
6. **Individual crisis DURING logistics-crunch.** Team members under shipment-
   deadline pressure + personal distress can coincide. HARD BOUNDARY per
   Universal Principle 3.

frontier uses this skill when physical-goods dimension is present. Not needed
for pure software / services expansion.

## When to Use

Trigger on:

- "Incoterms for [trade lane]" / "FOB vs CIF vs DDP for [trade]"
- "HS code for [product]"
- "Import duties for [country]" / "VAT on import for [country]"
- "Letter of credit for [transaction]" / "documentary collection for [transaction]"
- "Freight forwarder for [route]"
- "Customs coordination for [import/export]"
- "Trade finance for B2B transaction"

Do NOT use for:

- **FX exposure + hedging** → `fx-treasury-basics` (frontier sibling)
- **Banking counterparties** → `international-banking` (frontier sibling)
- **Payment-flow execution** → `cross-border-payments` (frontier sibling)
- **Entity setup / tax registration / regulatory** → canopy
- **Product localization** → lingua
- **Actual customs filings** → operator + customs broker
- **Actual freight-forwarder engagement** → operator + procurement
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

The international-logistics workflow combines Incoterms + customs + trade-
finance + freight-forwarder:

```
INCOTERMS 2020 (ICC — 11 rules covering risk + cost transfer)

  RULES FOR ANY MODE OF TRANSPORT (7):
    EXW  — Ex Works (seller minimum obligation)
    FCA  — Free Carrier
    CPT  — Carriage Paid To
    CIP  — Carriage and Insurance Paid To
    DAP  — Delivered at Place
    DPU  — Delivered at Place Unloaded (replaced DAT in 2020)
    DDP  — Delivered Duty Paid (seller maximum obligation)

  RULES FOR SEA + INLAND WATERWAY (4):
    FAS  — Free Alongside Ship
    FOB  — Free On Board
    CFR  — Cost and Freight
    CIF  — Cost, Insurance and Freight

  KEY DECISIONS PER INCOTERM:
    - Where does risk transfer from seller to buyer?
    - Who pays for main carriage (ocean / air / ground)?
    - Who pays for insurance?
    - Who pays for import duties + VAT?
    - Who handles customs clearance (export + import)?


HS (HARMONIZED SYSTEM) CLASSIFICATION

  - 6-digit HS code = canonical global product classification
  - Countries add 2-4 additional digits for national tariff schedules
    (e.g., US HTS 10-digit, EU CN 8-digit)
  - Applies to duties + import controls + trade statistics + FTA benefit
    eligibility

  Classification requires expertise:
    - General Rules of Interpretation (GRIs)
    - Chapter + Section notes
    - Explanatory Notes
    - Binding ruling processes (US CBP Ruling / EU BTI / etc.) for
      complex products

  Misclassification consequences:
    - Wrong duties (over- or under-payment)
    - Customs penalties (typically 2-4x duty owed for negligence)
    - Import delays
    - Regulatory action for pattern of misclassification


TRADE FINANCE INSTRUMENTS (B2B international)

  LETTERS OF CREDIT (L/C)
    - Bank guarantees payment on presentation of compliant documents
    - Multiple variants (Sight L/C, Usance L/C, Confirmed L/C, Standby L/C)
    - Cost: bank fees per L/C + FX
    - Best for: higher-risk transactions where payment-vs-goods security
      needed

  DOCUMENTARY COLLECTIONS
    - Bank collects payment from buyer against documents (D/P or D/A)
    - Lower cost than L/C but less security
    - Best for: established relationships with moderate trust

  OPEN ACCOUNT
    - Seller ships + invoices; buyer pays per credit terms
    - Highest risk to seller; requires established trust
    - Common for intra-group + long-established relationships

  ADVANCE PAYMENT / CASH IN ADVANCE
    - Buyer pays before shipment
    - Highest risk to buyer; concentrates risk on seller performance


FREIGHT-FORWARDER SELECTION FACTORS

  - Asset-based (owns capacity) vs asset-light (NVOCC — Non-Vessel-Operating
    Common Carrier)
  - Tech-enabled (Flexport / Freightos-style transparent pricing + tracking)
    vs traditional
  - Modal coverage (ocean / air / ground / rail / multimodal)
  - Regional strengths + relationships
  - Customs-broker capability (integrated vs separate)


INTERNATIONAL-LOGISTICS OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: PHYSICAL-GOODS TRADE SCOPE                (imports / exports / manufacturing / returns)
  Phase 2: INCOTERMS 2020 SELECTION                   (per trade lane with cost + risk-transfer analysis)
  Phase 3: CUSTOMS COORDINATION                       (HS classification + import-duties + VAT-on-import + FTA eligibility)
  Phase 4: TRADE-FINANCE COORDINATION                 (with frontier siblings + operator + counsel)
  Phase 5: FREIGHT-FORWARDER SELECTION SCOPING        (with operator + procurement)
```

## Instructions

### Phase 1 — Physical-goods trade scope

Inventory:

- Imports (raw materials, finished goods, components)
- Exports (finished goods to customers per market)
- Manufacturing coordination (contract manufacturing, own manufacturing, hybrid)
- Returns logistics (customer returns, defective goods)

Output: trade-lane map per commodity + volume + frequency.

### Phase 2 — Incoterms 2020 selection per trade lane

For each trade lane, select Incoterm based on:

- **Cost allocation preference** — who pays freight, insurance, duties
- **Risk-transfer point** — where does seller's risk end, buyer's begin
- **Customs-clearance responsibility** — who handles export + import
- **Insurance responsibility** — who arranges + who benefits
- **Established practice** — some trade lanes have de-facto Incoterms
  (ocean freight often CIF for B2B; air freight often DAP)

**Never Incoterms selection without cost + risk-transfer analysis.** LOAD-
BEARING per Principle 1.

Output: Incoterm-per-trade-lane recommendation with cost + risk-transfer
memo.

### Phase 3 — Customs coordination

Per trade lane:

- **HS code classification** — per WCO HS + national tariff schedule
- **Import-duties calculation** — MFN rates + preferential rates via FTAs
  (USMCA, CAFTA, EU FTAs, etc.) + Section 301 / reciprocal tariffs per
  US-China + US-EU + other trade-war-driven regimes
- **VAT-on-import** — 0-27% varying globally; import-VAT recovery mechanisms
  per jurisdiction (coordinate with canopy `tax-registration` + `data-
  residency-mapping` for VAT-registration coordination)
- **Trade-agreement eligibility** — FTA benefits require documentation + origin
  verification

**HS classification requires customs counsel or specialized broker for non-
obvious cases.** LOAD-BEARING per Principle 2.

### Phase 4 — Trade-finance coordination

For B2B international trade, coordinate trade-finance instrument selection
with frontier siblings:

- **Letter of credit (L/C)** — coordinate with `international-banking`
  (frontier sibling) for L/C-issuing bank + confirming bank
- **Documentary collection** — coordinate with `cross-border-payments`
  (frontier sibling) for document-vs-payment flow
- **Open account / advance payment** — coordinate with `fx-treasury-basics`
  (frontier sibling) for FX exposure

Output: trade-finance instrument recommendation per trade lane.

### Phase 5 — Freight-forwarder selection scoping

- **Requirement scoping** — modal coverage + geographic reach + tech-enablement
  + customs-broker integration + service level (transit time, tracking,
  claims handling)
- **Vendor shortlist** — 3-5 candidates per major trade lane
- **Due-diligence brief** — for operator + procurement engagement

Freight-forwarder engagement = operator + procurement scope. frontier scopes
requirements.

## Output Format

Each invocation produces one or more of:

- **Trade-lane map** — per commodity + volume + frequency
- **Incoterms-per-trade-lane recommendation** — with cost + risk-transfer memo
- **HS classification memo** — per product with binding-ruling recommendation
  for complex cases
- **Import-duties + VAT calculation** — per trade lane with FTA eligibility
- **Trade-finance instrument recommendation** — per trade lane with sibling-
  coordination
- **Freight-forwarder selection scoping brief** — for operator + procurement
- **Cross-agent handoff briefs** — to frontier siblings + canopy + operator +
  customs broker + freight forwarder

## Principles

1. **Never Incoterms selection without cost + risk-transfer analysis** —
   LOAD-BEARING per Purpose failure mode 1. Wrong Incoterms = contract
   disputes.
2. **Never HS classification without customs counsel or specialized broker
   for non-obvious cases** — LOAD-BEARING per Purpose failure mode 2.
   Misclassification = penalties + delays.
3. **Import-duties + VAT-on-import factored into landed cost** — never
   ignored. Section 301 / reciprocal tariffs particularly material for
   US-China + US-EU trade in current environment.
4. **Trade-finance instrument matched to relationship + risk profile** — L/C
   for higher-risk; documentary collection for moderate; open account for
   established.
5. **Freight-forwarder due diligence** before engagement — modal + geographic
   + tech + customs-broker + service level.
6. **No fabrication** — cited institutional sources (ICC + WTO + WCO + UNCTAD
   + Flexport/Freightos). Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
   `logical/README.md`.

## Fallback

- **HS classification ambiguous** for a product. Route to customs counsel +
  specialized broker + operator for binding-ruling application (US CBP Ruling
  / EU BTI / etc.). Do NOT default to closest-guess classification.
- **Section 301 / reciprocal tariff regime change** affecting trade lane.
  Coordinate with operator + international-trade counsel + procurement for
  landed-cost re-analysis; may require sourcing / supplier / route re-
  optimization.
- **Trade-finance dispute** (L/C discrepancy / documentary collection
  rejection). Coordinate with `international-banking` sibling + operator +
  trade-finance counsel + potentially litigation counsel.
- **Freight-forwarder service failure at scale** (lost shipments / claims
  handling issues). Coordinate with operator + procurement for vendor-
  performance review; may require vendor-switch.
- **Customs delay / seizure**. Route to operator + customs counsel + local
  logistics team for release + potential penalty mitigation.
- **Sanctioned-jurisdiction trade** (regulatory-permitted humanitarian /
  licensed exception). Route to operator + international-trade counsel.
- **Cross-agent complexity** (physical trade + regulatory compliance
  + tax + banking + payments intersect). Coordinate across frontier
  siblings + canopy + operator; complex trade coordination requires multi-
  skill orchestration.
- **Individual crisis signal during logistics conversation.** STOP. Route
  per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `fx-treasury-basics` (custom, frontier — sibling) | FX exposure on trade payments | Coordination |
| `international-banking` (custom, frontier — sibling) | L/C-issuing bank + confirming bank | Coordination |
| `cross-border-payments` (custom, frontier — sibling) | Payment-flow execution for trade payments | Coordination |
| canopy `entity-setup-by-jurisdiction` (Global Expansion sibling) | Entity acting as importer/exporter of record | Upstream |
| canopy `tax-registration` (Global Expansion sibling) | Import-VAT registration + duty-drawback + FTA-benefit tax coordination | Coordination |
| canopy `data-residency-mapping` (Global Expansion sibling) | Trade-data residency (customs data + trade records) | Coordination |
| beacon `data-room-discipline` (Comms & PR) | Trade documents feed data-room `/02_Financial/` + `/03_Commercial/` folders | Coordination |
| compass (Global Expansion Lead) | Physical-goods dimension of expansion strategy | Upstream inherited |
| Operator + customs counsel + customs broker | HS classification for complex products + binding-ruling applications | Escalation — Principle 2 |
| Operator + international-trade counsel | Sanctions / trade-war regime changes + trade-finance disputes | Escalation |
| Operator + procurement + freight forwarder | Freight-forwarder engagement + ongoing management | Downstream |
| Operator + trade-finance counsel + litigation counsel | Trade-finance disputes | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every frontier artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [ICC — Incoterms 2020](https://iccwbo.org/business-solutions/incoterms-rules/)
- [WTO — Tariff Analysis](https://www.wto.org/english/tratop_e/tariffs_e/tariffs_e.htm)
- [WCO — Harmonized System](https://www.wcoomd.org/en/topics/nomenclature/overview/what-is-the-harmonized-system.aspx)
- [UNCTAD — Trade Logistics](https://unctad.org/topic/transport-and-trade-logistics)
- [US CBP — Ruling Search + Binding Rulings](https://www.cbp.gov/trade/rulings)
- [US CBP — Section 301 Tariffs](https://www.cbp.gov/trade/programs-administration/entry-summary/section-301-tariffs)
- [European Commission — Binding Tariff Information](https://taxation-customs.ec.europa.eu/customs-4/calculation-customs-duties/customs-tariff/binding-tariff-information-bti_en)
- [Flexport — Global Trade Digital Freight](https://www.flexport.com/)
- [Freightos — Freight Marketplace](https://www.freightos.com/)
