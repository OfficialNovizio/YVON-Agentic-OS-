# Carbon Accounting and Reporting

## Introduction

Carbon accounting for prism — GHG Protocol + CDP + TCFD + SBTi + IFRS S2.

Custom Route D per §8.2. §4.6 reclass.

## Sources

- GHG Protocol (Greenhouse Gas Protocol) — Corporate Standard + Scope 2/3 Standards. Institutional (WRI + WBCSD).
- CDP (Carbon Disclosure Project) — institutional reporting platform
- TCFD Recommendations — climate-related financial disclosures
- SBTi (Science Based Targets initiative) — climate target validation
- IFRS S2 — Climate-related Disclosures (2023)

## Description

Scope 1 + 2 + 3 carbon accounting + CDP reporting + TCFD alignment + SBTi
target-setting. LOAD-BEARING fabricated-emissions-data + Scope-3-without-
cited-methodology. Triggers: "carbon accounting for [org]", "Scope 1 2 3
inventory", "TCFD report", "SBTi target for [org]", "CDP submission".

## Purpose

Prevents seven failure modes:

1. **Fabricated emissions data.** Carbon accounting = investor-material +
   regulator-scrutinized. Fabrication = securities fraud + reputational
   damage. LOAD-BEARING per Principle 1.
2. **Scope 3 without cited methodology.** Scope 3 (value-chain) most complex
   + most-frequently misreported. Methodology transparency mandatory.
3. **Boundary confusion** (operational vs financial vs equity boundaries).
4. **Netting emissions with offsets without disclosure.**
5. **SBTi target without pathway.**
6. **No third-party assurance for material reporting.**
7. **Individual crisis DURING carbon-crunch.** HARD BOUNDARY.

## Structure

```
GHG PROTOCOL SCOPES

  SCOPE 1 — Direct emissions (owned/controlled sources)
  SCOPE 2 — Indirect from purchased energy (location-based + market-based)
  SCOPE 3 — Indirect value-chain emissions (15 categories per GHG Protocol
    Corporate Value Chain Standard)


REPORTING FRAMEWORKS

  CDP — annual disclosure platform
  TCFD — governance / strategy / risk / metrics-targets
  SBTi — validated science-based targets
  IFRS S2 — climate financial disclosure
  EU CSRD — European sustainability reporting


OPERATIONAL SEQUENCE:

  Phase 1: BOUNDARY DEFINITION
  Phase 2: SCOPE 1 + 2 INVENTORY (LOAD-BEARING no-fabrication)
  Phase 3: LOAD-BEARING SCOPE 3 WITH CITED METHODOLOGY
  Phase 4: REPORTING FRAMEWORK ALIGNMENT
  Phase 5: TARGET-SETTING + THIRD-PARTY ASSURANCE
```

## Instructions

Phase 1 — boundary (operational / financial / equity).
Phase 2 — Scope 1 + 2 per GHG Protocol.
Phase 3 — Scope 3 per Corporate Value Chain Standard, methodology cited.
Phase 4 — CDP + TCFD + IFRS S2 alignment.
Phase 5 — SBTi target-setting + third-party assurance coordination.

## Output

- Boundary definition memo
- Scope 1 + 2 + 3 inventory with methodology
- CDP + TCFD + IFRS S2 reporting artifacts
- SBTi target-setting brief
- Third-party assurance handoff

## Principles

1. **Never fabricated emissions data** — LOAD-BEARING per Purpose failure mode 1.
2. **Scope 3 methodology cited** — LOAD-BEARING per failure mode 2.
3. **Boundary explicit** — no ambiguity.
4. **Offsets disclosed separately** from gross emissions.
5. **SBTi target with pathway.**
6. **Third-party assurance** for material reporting.
7. **No fabrication** — Universal Principle 1.
8. **Aggregate-only** — Universal Principle 2.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- Scope 3 data insufficient → estimate with explicit assumption flag + third-
  party methodology cited; do NOT round-number.
- Boundary dispute → coordinate operator + CFO + counsel.
- Individual crisis signal → HARD BOUNDARY per Universal Principle 3.

## Boundaries

- ESG materiality → `esg-materiality-assessment` (prism sibling)
- Social metrics → `social-impact-metrics` (prism sibling)
- Governance disclosure → `governance-disclosure` (prism sibling)
- Investor material comms → beacon `investor-cadence`
- Actual publication → operator + counsel + beacon + auditor

## References

- [GHG Protocol](https://ghgprotocol.org/)
- [CDP](https://www.cdp.net/)
- [TCFD](https://www.fsb-tcfd.org/)
- [SBTi](https://sciencebasedtargets.org/)
- [IFRS S2 Climate](https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s2-climate-related-disclosures/)
