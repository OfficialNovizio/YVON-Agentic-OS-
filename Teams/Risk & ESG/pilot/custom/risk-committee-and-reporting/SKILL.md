<!--
Custom skill — synthesized from Lam ERM + COSO + practitioner. §11 + §14.2. Route D per §8.2.
-->
---
name: risk-committee-and-reporting
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Lam, James (2014). Enterprise Risk Management (Wiley). §8.9 2nd use in pilot."
  - "COSO ERM Framework (2017). §8.9 2nd use in pilot."
  - "Institute of Internal Auditors (IIA) — Three Lines Model + practitioner corpus (institutional). theiia.org."
  - "IRM (Institute of Risk Management) — practitioner corpus."
  - "SEC Regulation S-K + NYSE/NASDAQ listing standards — risk committee requirements (institutional/regulatory)."
fulfills_catalog_entry: risk-committee-and-reporting (custom per §2 routing)
assigned_agent: pilot (Risk & ESG / Risk Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Risk committee governance + reporting framework — committee structure + charter + cadence + reporting artifacts (risk dashboard + key risk indicators + emerging risks). LOAD-BEARING risk-reporting-without-board-level-cadence refusal. Trigger on "risk committee charter", "risk dashboard for [period]", "key risk indicators", "board risk report", "risk reporting cadence", or "three-lines model design".
triggers:
  - risk committee charter
  - risk dashboard for
  - key risk indicators
  - board risk report
  - risk reporting cadence
  - three-lines model design
  - risk governance
---

# Risk Committee and Reporting

## Introduction

Risk committee + reporting discipline for pilot — Lam ERM + COSO + IIA
Three Lines Model + IRM + SEC/NYSE listing standards.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Risk reporting without board-level cadence.** Risk = board fiduciary
   responsibility. Missing board reporting = governance failure. LOAD-BEARING
   per Principle 1.
2. **Risk committee charter absent** — no formal authority + scope = drift.
3. **Reporting-only dashboards.** Numbers without narrative + action = board
   confusion.
4. **KRI (Key Risk Indicator) proliferation.** Too many KRIs = signal loss.
5. **Three-lines-model confusion** (business / risk / audit) — role overlap
   or gap.
6. **Individual crisis DURING risk-reporting crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Risk committee charter" / "risk governance"
- "Risk dashboard for [period]" / "key risk indicators"
- "Board risk report" / "risk reporting cadence"
- "Three-lines model design"

Do NOT use for:
- Risk appetite → `risk-appetite-framework` (pilot sibling)
- Tail-risk scan → `tail-risk-scanning` (pilot sibling)
- Crisis scenario → `crisis-scenario-planning` (pilot sibling)
- Actual committee execution → board (Governance) + operator
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
RISK COMMITTEE STRUCTURE (Lam + IIA Three Lines)

  BOARD RISK COMMITTEE (or audit committee with risk mandate)
    - Board-level authority
    - Meets quarterly minimum
    - Reviews KRIs + emerging risks + appetite adherence

  MANAGEMENT RISK COMMITTEE (operator + CFO + CRO + relevant leads)
    - Monthly cadence typical
    - Bridge between board and operational

  THREE LINES MODEL (IIA):
    - Line 1: Business owns risks
    - Line 2: Risk function (pilot + hazard + prism + shield) provides
      framework + oversight
    - Line 3: Internal audit provides independent assurance (coordinate
      with sentinel — Governance)


REPORTING ARTIFACTS

  BOARD RISK DASHBOARD (quarterly)
    - KRI snapshot per category
    - Appetite adherence (breaches / trends)
    - Emerging risks (from tail-risk-scanning + horizon scan)
    - Prior-quarter risk-event summary
    - Actions taken + planned

  KEY RISK INDICATORS (KRIs)
    - Limit typical 15-25 for board (signal preservation)
    - Threshold definitions (green/yellow/red)
    - Trend view (period-over-period)


OPERATIONAL SEQUENCE:

  Phase 1: COMMITTEE STRUCTURE + CHARTER
  Phase 2: THREE-LINES MODEL DESIGN
  Phase 3: KRI DEFINITION + THRESHOLD DESIGN
  Phase 4: REPORTING CADENCE + LOAD-BEARING BOARD-LEVEL DELIVERY
  Phase 5: ANNUAL REVIEW + CHARTER UPDATE
```

## Instructions

### Phase 1 — Committee structure + charter
Board risk committee charter (or audit-committee mandate); management risk
committee complementary.

### Phase 2 — Three-lines model design
Clear roles: business (Line 1) / risk function (Line 2) / internal audit
(Line 3). Coordinate with sentinel (Governance) for audit.

### Phase 3 — KRI definition + threshold design
15-25 KRIs typical for board; threshold definitions + escalation triggers.

### Phase 4 — Reporting cadence + LOAD-BEARING board-level delivery
Quarterly board minimum; monthly management; ad-hoc for material events.
**No risk reporting skip at board level** per Principle 1.

### Phase 5 — Annual review + charter update
Charter reviewed annually; KRIs recalibrated per environment change.

## Output Format

- Risk committee charter
- Three-lines model design
- KRI framework + thresholds
- Board risk dashboard template
- Reporting cadence + schedule

## Principles

1. **Never risk reporting without board-level cadence** — LOAD-BEARING per
   failure mode 1.
2. **Committee charter mandatory** — formal authority.
3. **Dashboards with narrative + action** — not numbers-only.
4. **KRI limit 15-25 for board** — signal preservation.
5. **Three-lines clarity** — no role overlap or gap.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
   Individual risk-owner data stays in management-committee materials;
   aggregate for board.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Board approval delay for charter** — provisional charter with
  explicit "pending approval" flag.
- **KRI data quality issues** — flag "insufficient data" + coordinate
  with hazard `risk-monitoring-and-audit` for data-quality plan.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `risk-appetite-framework` (pilot sibling) | Appetite reported to committee | Upstream |
| `tail-risk-scanning` (pilot sibling) | Tail risks reported | Upstream |
| `crisis-scenario-planning` (pilot sibling) | Scenarios reported | Upstream |
| `risk-identification-taxonomy` + `risk-monitoring-and-audit` (hazard) | KRI data source | Upstream |
| board + sentinel (Governance) | Board reporting + audit coordination | Downstream / coordination |
| operator + CFO + CRO | Management committee | Downstream |
| beacon `investor-cadence` (Comms & PR) | Material risk investor reporting (Reg FD) | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Lam — Enterprise Risk Management (Wiley)](https://www.wiley.com/en-us/Enterprise+Risk+Management-p-9781118413616)
- [COSO ERM Framework](https://www.coso.org/enterprise-risk-management)
- [IIA — Three Lines Model](https://www.theiia.org/en/content/position-papers/2020/the-iias-three-lines-model/)
- [IRM](https://www.theirm.org/)
- [SEC — Regulation S-K](https://www.sec.gov/)
