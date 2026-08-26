---
name: macro-signals
type: custom
status: built from scratch
assigned_agent: trend (Market Intelligence / Trend & Signal Detection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Macro-economic + industry-macro signal tracking. GDP · inflation · rates · sector index · sentiment. Every signal cites source; correlations flagged, causation never claimed."
triggers:
  - macro signals
  - macro trend
  - economic outlook
  - industry trend
  - sector signal
  - macro dashboard
---

# Macro Signals

## Purpose
Track macro-economic + industry-macro signals relevant to the organisation's markets. GDP · inflation · interest rates · sector index · consumer / business sentiment. Highlight when a signal materially shifts.

## When to Use
- Quarterly / annual planning
- Board deck macro slide
- "What's the macro environment doing?"

## Structure / Protocol
```
1. CONFIG    signals in scope + source per signal
2. PULL      from public sources (Fed / BLS / ECB / OECD / etc.)
3. DELTA     current vs prior period; sensitivity of our metrics to each signal
4. FLAG      material shifts (per config threshold)
5. RETURN    signal dashboard + top-3 flags
```

## Instructions
Every signal cites source URL + snapshot date. Correlations to our metrics may be noted; causation never claimed (Tukey discipline).

## Output Format
Signal table + delta column + flags.

## Principles
- **Public institutional sources only** (Fed / BLS / ECB / OECD / IMF / World Bank).
- **Delta with every signal.**
- **Correlation ≠ causation.**
- **Material-shift threshold from config.**

## Fallback
| Failure | Response |
|---|---|
| Source unreachable | Note stale; do not substitute |
| Signal without an operator-declared threshold | Include in signal table; do not flag as material |

## Boundaries
- `emerging-trends` (this agent) — bottom-up trend spotting.
- `scope/market-entry-analysis` — timing input.
- `felix` (F&T) — rate sensitivity for runway/valuation.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| macro-signals | Web fetch (Fed FRED · BLS · ECB · etc.) · File read/write | FRED MCP · OECD MCP | All steps |
