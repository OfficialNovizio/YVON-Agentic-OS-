<!--
Custom skill — synthesized from Taleb Antifragile + Lam ERM + COSO + practitioner.
§11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Taleb corpus 1st use in Risk & ESG (planned 4× across pilot).
-->
---
name: risk-appetite-framework
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Taleb, Nassim Nicholas (2012). Antifragile: Things That Gain from Disorder. Random House. ISBN 978-1400067824. Canonical practitioner text. §8.9 1st use in pilot."
  - "Lam, James (2014, 2nd ed.). Enterprise Risk Management: From Incentives to Controls. Wiley. ISBN 978-1118413616. Canonical ERM practitioner text. Ex-CRO Fidelity + GE Capital."
  - "COSO — Enterprise Risk Management—Integrating with Strategy and Performance (2017). Institutional framework."
  - "ISO 31000:2018 — Risk Management Guidelines. Institutional standard."
  - "Basel Committee + regulatory practitioner corpus on risk appetite."
fulfills_catalog_entry: risk-appetite-framework (custom per §2 routing)
assigned_agent: pilot (Risk & ESG / Risk Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Risk appetite framework — quantified appetite statements per risk category + tolerance thresholds + capacity assessment + board approval. LOAD-BEARING risk-appetite-quantified-not-vibes refusal. Trigger on "risk appetite for [category]", "risk tolerance thresholds", "risk capacity assessment", "board risk appetite statement", or "risk appetite framework design".
triggers:
  - risk appetite for
  - risk tolerance thresholds
  - risk capacity assessment
  - board risk appetite statement
  - risk appetite framework design
  - risk categories definition
---

# Risk Appetite Framework

## Introduction

Risk appetite framework for pilot — Taleb Antifragile + Lam ERM + COSO + ISO
31000 + Basel Committee.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Risk appetite as vibes.** "We're risk-averse" without quantified
   thresholds = unactionable. LOAD-BEARING per Principle 1.
2. **Risk appetite without capacity.** Aspirational appetite exceeding
   balance-sheet capacity = fragility (Taleb).
3. **Category-agnostic appetite.** Same appetite for credit / market /
   operational / cyber = wrong resource allocation.
4. **Risk appetite without board approval.** Risk appetite is board-level
   authority.
5. **Static risk appetite.** Environment changes; appetite must be reviewed
   at least annually.
6. **Individual crisis DURING risk-appetite crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Risk appetite for [category]" / "risk tolerance thresholds"
- "Risk capacity assessment" / "board risk appetite statement"
- "Risk appetite framework design" / "risk categories definition"

Do NOT use for:
- Tail-risk scanning → `tail-risk-scanning` (pilot sibling)
- Risk committee reporting → `risk-committee-and-reporting` (pilot sibling)
- Crisis scenario → `crisis-scenario-planning` (pilot sibling)
- Risk identification → hazard `risk-identification-taxonomy`
- Actual risk-appetite approval → board + operator
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
RISK APPETITE COMPONENTS (Lam + COSO)

  1. APPETITE STATEMENTS per risk category (qualitative + quantitative)
  2. TOLERANCE THRESHOLDS (specific numeric limits)
  3. CAPACITY ASSESSMENT (max risk balance-sheet can absorb)
  4. CATEGORY MAPPING (credit / market / operational / cyber / regulatory /
     ESG / strategic / reputational)
  5. BOARD APPROVAL + PERIODIC REVIEW (typically annual)


TALEB ANTIFRAGILE ADDITION

  Anti-fragile framing: not just risk-tolerance, but which risks BUILD
  capability (skin-in-the-game exposures) vs which destroy (tail-risk
  exposures).


OPERATIONAL SEQUENCE:

  Phase 1: RISK CATEGORY DEFINITION
  Phase 2: QUANTIFIED APPETITE STATEMENTS (LOAD-BEARING)
  Phase 3: TOLERANCE THRESHOLDS + CAPACITY ASSESSMENT
  Phase 4: BOARD APPROVAL PROCESS
  Phase 5: ANNUAL REVIEW CADENCE
```

## Instructions

### Phase 1 — Risk category definition
Per COSO + industry: credit / market / operational / cyber / regulatory / ESG
/ strategic / reputational categories customized per business.

### Phase 2 — Quantified appetite statements (LOAD-BEARING)
Per category, quantified appetite (not "low/medium/high" without numbers).
Example: "operational risk annual loss < 2% revenue"; "cyber risk RTO < 4
hours for critical systems."

### Phase 3 — Tolerance thresholds + capacity assessment
- Tolerance = specific numeric limits (breaches trigger escalation)
- Capacity = max balance-sheet absorption (must exceed appetite by safety
  margin — Taleb antifragile discipline)

### Phase 4 — Board approval process
Board-level authority; coordinate with board (Governance).

### Phase 5 — Annual review cadence
Minimum annual review; more frequent for fast-changing environments.

## Output Format

- Risk category definition memo
- Quantified appetite statements per category
- Tolerance thresholds + capacity assessment
- Board approval brief + review schedule

## Principles

1. **Risk appetite quantified, not vibes** — LOAD-BEARING per failure mode 1.
2. **Capacity exceeds appetite** — Taleb antifragile discipline.
3. **Category-specific appetite** — no undifferentiated approach.
4. **Board approval mandatory** — governance authority.
5. **Annual review minimum.**
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Quantification difficult** for category (e.g., strategic risk) — provide
  proxies + coordinate with hazard `risk-assessment-quantification` for
  Hubbard / FAIR methods.
- **Appetite-vs-capacity mismatch** — escalate to operator + CFO + board.
- **Board approval delayed** — flag appetite as "provisional" until approved.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `tail-risk-scanning` (pilot sibling) | Tail risks inform appetite | Coordination |
| `risk-committee-and-reporting` (pilot sibling) | Appetite reported to committee | Downstream |
| `crisis-scenario-planning` (pilot sibling) | Scenarios test appetite | Coordination |
| `risk-identification-taxonomy` (hazard) | Category definitions align | Coordination |
| `risk-assessment-quantification` (hazard) | Quantification methodology | Coordination |
| board (Governance) | Board approval | Escalation |
| CFO + operator | Capacity assessment | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Taleb — Antifragile (Random House)](https://www.penguinrandomhouse.com/books/176227/antifragile-by-nassim-nicholas-taleb/)
- [Lam — Enterprise Risk Management (Wiley)](https://www.wiley.com/en-us/Enterprise+Risk+Management%3A+From+Incentives+to+Controls%2C+2nd+Edition-p-9781118413616)
- [COSO ERM Framework (2017)](https://www.coso.org/enterprise-risk-management)
- [ISO 31000:2018 Risk Management](https://www.iso.org/standard/65694.html)
- [Basel Committee](https://www.bis.org/bcbs/)
