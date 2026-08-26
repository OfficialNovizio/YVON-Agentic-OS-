---
name: regulatory-horizon
type: custom
status: built from scratch
assigned_agent: trend (Market Intelligence / Trend & Signal Detection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Regulatory-horizon scan — bills / consultations / draft rules across watched jurisdictions BEFORE they become obligations. Distinct from comply/reg-feed-watcher which watches enacted rules; this watches pre-enactment. Feeds scope + comply."
triggers:
  - regulatory horizon
  - draft rules
  - upcoming legislation
  - regulatory scan
  - what's coming from regulators
  - policy horizon
---

# Regulatory Horizon

## Purpose
Track *pre-enactment* regulatory signals — bills, consultations, ANPRs, RFIs, draft rules, regulator speeches — across watched jurisdictions. Distinct from `comply/reg-feed-watcher` which watches enacted rules; this looks upstream.

## When to Use
- Strategic planning ("what regulatory changes could hit us in 12-24 months")
- Market-entry timing (regulatory clarity is a market-entry variable)

Do NOT use for: enacted regulation compliance (→ `comply`) · specific-obligation register (→ `comply/obligation-register`).

## Structure / Protocol
```
1. WATCH   configured legislative + regulator sources per jurisdiction
2. STAGE   bill → committee → passed → signed → effective; regulator: ANPR → NPRM → final
3. IMPACT  which of our markets / activities affected + likely change
4. TIMING  estimated effective date
5. RETURN  horizon table + scope + comply routing recommendations
```

## Instructions
Stage tracking: legislation and regulatory pipelines have known stages; report current stage + typical time-to-next.

If a pre-enactment item is >70% likely to pass and affects an in-scope activity, route to `scope/market-entry-analysis` (timing input) + `comply/regulated-activity-readiness` (readiness prep).

## Output Format
Horizon table: item · jurisdiction · stage · estimated effective · impact scope · likelihood · recommended action.

## Principles
- **Pre-enactment only.** Enacted → `comply/reg-feed-watcher`.
- **Likelihood is estimate**, not fact.
- **Never invent items.** Every entry cites bill number / consultation document.
- **Effective-date estimate** has confidence band.

## Fallback
| Failure | Response |
|---|---|
| Legislative source not available | Manual-tracking mode; flag |
| Ambiguous impact scope | Ask scope for market-boundary decision |

## Boundaries
- `macro-signals` (this agent) — related domain (macro/regulatory linked).
- `comply/reg-feed-watcher` (Legal & Compliance) — post-enactment version.
- `comply/regulated-activity-readiness` (Legal & Compliance) — pre-launch readiness.
- `scope/market-entry-analysis` — timing input.
- `board` — L3 for market-critical items.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| regulatory-horizon | Web fetch (Congress.gov · Federal Register · EU EUR-Lex · UK Parliament) · File read/write | LegiScan MCP · GovTrack MCP | All steps |
