---
name: emerging-trends
type: custom
status: built from scratch
assigned_agent: trend (Market Intelligence / Trend & Signal Detection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Bottom-up trend detection — funding rounds · patent filings · academic paper velocity · developer-tooling signals · search-volume shifts · category discussion. Every trend tagged confidence + source-count."
triggers:
  - emerging trends
  - trend spotting
  - what's emerging in X
  - trend watch
  - trend brief
---

# Emerging Trends

## Purpose
Bottom-up trend detection — the signals that surface before they hit the mainstream. Confidence-tagged (early / gaining / mainstream) with source count.

## Structure / Protocol
```
1. SCAN     funding rounds · patents · papers · dev-tooling · search-volume · discussion
2. CLUSTER  co-occurrence → candidate trends
3. CONFIDENCE score by source-count + independence
4. RETURN   trends table + confidence + source list
```

## Instructions
Confidence: `early` (< 3 independent signals) · `gaining` (3-10) · `mainstream` (> 10 across multiple source types).

Sources: Crunchbase (funding) · USPTO Assignee search (patents) · arXiv / Semantic Scholar (papers) · GitHub trending / Stack Overflow trends (dev) · Google Trends (search) · Reddit / HN discussion.

## Output Format
Table: trend · confidence · earliest-signal-date · source count · source list.

## Principles
- **Never forecast.** Descriptive: "these signals exist"; not "this will happen."
- **Confidence tag mandatory.**
- **Every trend cites ≥ 3 sources for `gaining`+**.
- **Independence matters** — 3 blogs citing each other = 1 signal.

## Fallback
| Failure | Response |
|---|---|
| Signal source unreachable | Note absent; do not extrapolate |
| Confidence-flip (early → mainstream fast) | Flag for operator review; may indicate hype cycle |

## Boundaries
- `macro-signals` (this agent) — top-down macro; complement.
- `scope/market-entry-analysis` — timing input.
- `research/primary-research` — validate trend via primary research.
- `meta` (AI & Agents) — AI-specific trends.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| emerging-trends | Web fetch (multi-source) · File read/write | Crunchbase MCP · Semantic Scholar MCP · Google Trends MCP | All steps |
